const Task = require('../models/Task');
const Project = require('../models/Project');
const User = require('../models/User');
const Activity = require('../models/Activity');
const Joi = require('joi');

const createTask = async (req, res, next) => {
  try {
    const schema = Joi.object({
      title: Joi.string().required(),
      description: Joi.string().required(),
      status: Joi.string().valid('Todo', 'In Progress', 'Done'),
      priority: Joi.string().valid('Low', 'Medium', 'High'),
      dueDate: Joi.date(),
      assignedTo: Joi.string().required(),
      projectId: Joi.string().required(),
    });

    const { error } = schema.validate(req.body);
    if (error) {
      res.status(400);
      throw new Error(error.details[0].message);
    }

    const { title, description, status, priority, dueDate, assignedTo, projectId } = req.body;

    const project = await Project.findById(projectId);
    if (!project) {
      res.status(404);
      throw new Error('Project not found');
    }

    const assignee = await User.findById(assignedTo);
    if (!assignee) {
      res.status(404);
      throw new Error('Assignee not found');
    }

    const task = await Task.create({
      title,
      description,
      status: status || 'Todo',
      priority: priority || 'Medium',
      dueDate,
      assignedTo,
      assignedBy: req.user._id,
      projectId,
    });

    await Activity.create({
      description: `Admin ${req.user.name} assigned task "${title}" to User ${assignee.name}`,
      performedBy: req.user._id,
    });

    res.status(201).json(task);
  } catch (error) {
    next(error);
  }
};

const getTasks = async (req, res, next) => {
  try {
    let filter = {};
    
    if (req.user.role !== 'Admin') {
       filter.assignedTo = req.user._id;
    }
    
    if (req.query.projectId) {
      filter.projectId = req.query.projectId;
      if (req.user.role !== 'Admin') {
         const project = await Project.findById(req.query.projectId);
         if (project && project.teamMembers.includes(req.user._id)) {
            delete filter.assignedTo;
         }
      }
    }
    
    if (req.query.status) {
      filter.status = req.query.status;
    }

    const tasks = await Task.find(filter)
      .populate('assignedTo', 'name email')
      .populate('assignedBy', 'name email')
      .populate('projectId', 'title');
    res.json(tasks);
  } catch (error) {
    next(error);
  }
};

const getTaskById = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignedTo', 'name email')
      .populate('assignedBy', 'name email')
      .populate('projectId', 'title');

    if (!task) {
      res.status(404);
      throw new Error('Task not found');
    }

    res.json(task);
  } catch (error) {
    next(error);
  }
};

const updateTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      res.status(404);
      throw new Error('Task not found');
    }

    if (req.user.role !== 'Admin' && task.assignedTo.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not authorized to update this task');
    }

    const oldStatus = task.status;

    task.title = req.user.role === 'Admin' ? (req.body.title || task.title) : task.title;
    task.description = req.user.role === 'Admin' ? (req.body.description || task.description) : task.description;
    task.status = req.body.status || task.status;
    task.priority = req.user.role === 'Admin' ? (req.body.priority || task.priority) : task.priority;
    task.dueDate = req.user.role === 'Admin' ? (req.body.dueDate || task.dueDate) : task.dueDate;
    task.assignedTo = req.user.role === 'Admin' ? (req.body.assignedTo || task.assignedTo) : task.assignedTo;

    const updatedTask = await task.save();

    if (oldStatus !== updatedTask.status) {
      await Activity.create({
        description: `User ${req.user.name} updated task "${task.title}" status to ${updatedTask.status}`,
        performedBy: req.user._id,
      });
    }

    res.json(updatedTask);
  } catch (error) {
    next(error);
  }
};

const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      res.status(404);
      throw new Error('Task not found');
    }

    const title = task.title;
    await task.deleteOne();

    await Activity.create({
      description: `Admin ${req.user.name} deleted task "${title}"`,
      performedBy: req.user._id,
    });

    res.json({ message: 'Task removed' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
};
