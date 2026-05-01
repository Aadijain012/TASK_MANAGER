import { useState, useEffect, useContext } from 'react';
import api from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import { Plus, Trash2, Edit2, Users } from 'lucide-react';

const Projects = () => {
  const { user } = useContext(AuthContext);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ title: '', description: '', teamMembers: [] });
  const isAdmin = user?.role === 'Admin';

  useEffect(() => {
    fetchProjects();
    if (isAdmin) fetchUsers();
  }, [isAdmin]);

  const fetchProjects = async () => {
    const { data } = await api.get('/projects');
    setProjects(data);
  };
  const fetchUsers = async () => {
    const { data } = await api.get('/users');
    setUsers(data);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/projects', formData);
      setShowModal(false);
      setFormData({ title: '', description: '', teamMembers: [] });
      fetchProjects();
    } catch (err) {
      alert('Error creating project');
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure?')) {
      await api.delete(`/projects/${id}`);
      fetchProjects();
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
        {isAdmin && (
          <button onClick={() => setShowModal(true)} className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700 transition">
            <Plus size={18} /> New Project
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map(proj => (
          <div key={proj._id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-bold text-gray-900">{proj.title}</h3>
              {isAdmin && (
                <button onClick={() => handleDelete(proj._id)} className="text-gray-400 hover:text-red-500"><Trash2 size={18} /></button>
              )}
            </div>
            <p className="text-gray-600 text-sm flex-1">{proj.description}</p>
            <div className="mt-6 flex items-center text-sm text-gray-500 gap-2">
              <Users size={16} /> {proj.teamMembers?.length} Members
            </div>
          </div>
        ))}
      </div>

      {showModal && isAdmin && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Create Project</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <input required type="text" className="w-full px-3 py-2 border rounded-lg" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea required className="w-full px-3 py-2 border rounded-lg" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Team Members (Hold Ctrl to select multiple)</label>
                <select multiple className="w-full px-3 py-2 border rounded-lg" onChange={e => setFormData({...formData, teamMembers: Array.from(e.target.selectedOptions, option => option.value)})}>
                  {users.map(u => <option key={u._id} value={u._id}>{u.name}</option>)}
                </select>
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
export default Projects;
