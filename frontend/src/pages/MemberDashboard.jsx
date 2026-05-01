import { useState, useEffect, useContext } from 'react';
import api from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import clsx from 'clsx';
import { Clock, CheckCircle2 } from 'lucide-react';

const MemberDashboard = () => {
  const { user } = useContext(AuthContext);
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tasksRes, projectsRes] = await Promise.all([
          api.get('/tasks'),
          api.get('/projects')
        ]);
        setTasks(tasksRes.data);
        setProjects(projectsRes.data);
      } catch (error) {
        console.error("Error loading data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const updateTaskStatus = async (taskId, newStatus) => {
    try {
      await api.put(`/tasks/${taskId}`, { status: newStatus });
      setTasks(tasks.map(t => t._id === taskId ? { ...t, status: newStatus } : t));
    } catch (error) {
      alert('Failed to update task status');
    }
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Welcome, {user?.name}</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 rounded-lg bg-blue-100 text-blue-600"><Clock size={24} /></div>
          <div><p className="text-sm font-medium text-gray-500">Pending Tasks</p><h3 className="text-2xl font-bold text-gray-900">{tasks.filter(t => t.status !== 'Done').length}</h3></div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 rounded-lg bg-green-100 text-green-600"><CheckCircle2 size={24} /></div>
          <div><p className="text-sm font-medium text-gray-500">Completed Tasks</p><h3 className="text-2xl font-bold text-gray-900">{tasks.filter(t => t.status === 'Done').length}</h3></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100"><h2 className="text-lg font-bold text-gray-900">My Assigned Tasks</h2></div>
          <div className="p-6 space-y-4">
            {tasks.length === 0 ? <p className="text-gray-500">No tasks assigned.</p> : tasks.map(task => (
              <div key={task._id} className="p-4 border border-gray-100 rounded-lg flex flex-col gap-2 bg-gray-50">
                <div className="flex justify-between items-start">
                  <h3 className="font-semibold text-gray-900">{task.title}</h3>
                  <select 
                    value={task.status} 
                    onChange={(e) => updateTaskStatus(task._id, e.target.value)}
                    className="text-sm border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="Todo">Todo</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Done">Done</option>
                  </select>
                </div>
                <p className="text-sm text-gray-600">{task.description}</p>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-xs text-gray-500">Project: {task.projectId?.title}</span>
                  <span className="text-xs text-red-500 font-medium">Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100"><h2 className="text-lg font-bold text-gray-900">My Projects</h2></div>
          <div className="p-6 space-y-4">
            {projects.length === 0 ? <p className="text-gray-500">No projects assigned.</p> : projects.map(proj => (
              <div key={proj._id} className="p-4 border border-gray-100 rounded-lg bg-gray-50">
                <h3 className="font-semibold text-gray-900">{proj.title}</h3>
                <p className="text-sm text-gray-600 mt-1">{proj.description}</p>
                <p className="text-xs text-gray-500 mt-3">Team members: {proj.teamMembers?.length}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
export default MemberDashboard;
