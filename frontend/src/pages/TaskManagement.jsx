import { useState, useEffect, useContext } from 'react';
import api from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import { Plus, Trash2 } from 'lucide-react';
import clsx from 'clsx';

const TaskManagement = () => {
  const { user } = useContext(AuthContext);
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ title: '', description: '', projectId: '', assignedTo: '', priority: 'Medium', dueDate: '' });
  const isAdmin = user?.role === 'Admin';

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [tasksRes, projectsRes] = await Promise.all([api.get('/tasks'), api.get('/projects')]);
      setTasks(tasksRes.data);
      setProjects(projectsRes.data);
      if (isAdmin) {
        const usersRes = await api.get('/users');
        setUsers(usersRes.data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/tasks', formData);
      setShowModal(false);
      fetchData();
    } catch (err) {
      alert('Error creating task');
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure?')) {
      await api.delete(`/tasks/${id}`);
      fetchData();
    }
  };

  const updateStatus = async (id, status) => {
    await api.put(`/tasks/${id}`, { status });
    fetchData();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Task Management</h1>
        {isAdmin && (
          <button onClick={() => setShowModal(true)} className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700 transition">
            <Plus size={18} /> New Task
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {['Todo', 'In Progress', 'Done'].map(status => (
          <div key={status} className="bg-gray-100 rounded-xl p-4 flex flex-col gap-4">
            <h3 className="font-bold text-gray-700 uppercase text-sm tracking-wider">{status}</h3>
            {tasks.filter(t => t.status === status).map(task => (
              <div key={task._id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-semibold text-gray-900">{task.title}</h4>
                  {isAdmin && <button onClick={() => handleDelete(task._id)} className="text-gray-400 hover:text-red-500"><Trash2 size={16} /></button>}
                </div>
                <p className="text-sm text-gray-600 mb-3">{task.description}</p>
                <div className="flex justify-between items-center mb-3">
                  <span className={clsx("text-xs px-2 py-0.5 rounded font-medium", task.priority === 'High' ? 'bg-red-100 text-red-700' : task.priority === 'Medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700')}>{task.priority}</span>
                  <span className="text-xs text-gray-500">{new Date(task.dueDate).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between items-center border-t border-gray-100 pt-3 mt-3">
                  <select value={task.status} onChange={(e) => updateStatus(task._id, e.target.value)} className="text-xs border-gray-300 rounded shadow-sm">
                    <option value="Todo">Todo</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Done">Done</option>
                  </select>
                  <span className="text-xs font-medium text-indigo-600">{task.assignedTo?.name}</span>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>

      {showModal && isAdmin && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Create Task</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div><label className="block text-sm mb-1">Title</label><input required type="text" className="w-full px-3 py-2 border rounded-lg" onChange={e => setFormData({...formData, title: e.target.value})} /></div>
              <div><label className="block text-sm mb-1">Description</label><textarea required className="w-full px-3 py-2 border rounded-lg" onChange={e => setFormData({...formData, description: e.target.value})}></textarea></div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm mb-1">Project</label>
                  <select required className="w-full px-3 py-2 border rounded-lg" onChange={e => setFormData({...formData, projectId: e.target.value})}>
                    <option value="">Select Project</option>
                    {projects.map(p => <option key={p._id} value={p._id}>{p.title}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm mb-1">Assign To</label>
                  <select required className="w-full px-3 py-2 border rounded-lg" onChange={e => setFormData({...formData, assignedTo: e.target.value})}>
                    <option value="">Select User</option>
                    {users.map(u => <option key={u._id} value={u._id}>{u.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm mb-1">Priority</label>
                  <select className="w-full px-3 py-2 border rounded-lg" onChange={e => setFormData({...formData, priority: e.target.value})}>
                    <option value="Low">Low</option><option value="Medium" selected>Medium</option><option value="High">High</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm mb-1">Due Date</label>
                  <input required type="date" className="w-full px-3 py-2 border rounded-lg" onChange={e => setFormData({...formData, dueDate: e.target.value})} />
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-600">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default TaskManagement;
