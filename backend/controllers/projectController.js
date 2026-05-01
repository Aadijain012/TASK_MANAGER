const Project = require('../models/Project');
const Activity = require('../models/Activity');
const Joi = require('joi');

const createProject = async (req, res, next) => {
  try {
    const schema = Joi.object({
      title: Joi.string().required(),
      description: Joi.string().required(),
      teamMembers: Joi.array().items(Joi.string()),
    });

    const { error } = schema.validate(req.body);
    if (error) {
      res.status(400);
      throw new Error(error.details[0].message);
    }

    const { title, description, teamMembers } = req.body;

    const project = await Project.create({
      title,
      description,
      teamMembers: teamMembers || [],
      createdBy: req.user._id,
    });

    await Activity.create({
      description: `Admin ${req.user.name} created project "${title}"`,
      performedBy: req.user._id,
    });

    res.status(201).json(project);
  } catch (error) {
    next(error);
  }
};

const getProjects = async (req, res, next) => {
  try {
    const filter = req.user.role === 'Admin' ? {} : { teamMembers: req.user._id };
    const projects = await Project.find(filter)
      .populate('createdBy', 'name email')
      .populate('teamMembers', 'name email');
    res.json(projects);
  } catch (error) {
    next(error);
  }
};

const getProjectById = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('teamMembers', 'name email');

    if (!project) {
      res.status(404);
      throw new Error('Project not found');
    }

    if (
      req.user.role !== 'Admin' &&
      !project.teamMembers.some((m) => m._id.toString() === req.user._id.toString())
    ) {
      res.status(403);
      throw new Error('Not authorized to access this project');
    }

    res.json(project);
  } catch (error) {
    next(error);
  }
};

const updateProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      res.status(404);
      throw new Error('Project not found');
    }

    project.title = req.body.title || project.title;
    project.description = req.body.description || project.description;
    if (req.body.teamMembers) {
      project.teamMembers = req.body.teamMembers;
    }

    const updatedProject = await project.save();

    await Activity.create({
      description: `Admin ${req.user.name} updated project "${updatedProject.title}"`,
      performedBy: req.user._id,
    });

    res.json(updatedProject);
  } catch (error) {
    next(error);
  }
};

const deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      res.status(404);
      throw new Error('Project not found');
    }

    const title = project.title;
    await project.deleteOne();

    await Activity.create({
      description: `Admin ${req.user.name} deleted project "${title}"`,
      performedBy: req.user._id,
    });

    res.json({ message: 'Project removed' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
};
