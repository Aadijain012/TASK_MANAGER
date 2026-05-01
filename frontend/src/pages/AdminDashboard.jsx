import { useState, useEffect, useContext } from 'react';
import api from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import { Users, Folder, CheckSquare, Clock, AlertTriangle, CheckCircle2 } from 'lucide-react';
import clsx from 'clsx';

const StatCard = ({ title, value, icon: Icon, colorClass }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
    <div className={clsx("p-3 rounded-lg", colorClass)}>
      <Icon size={24} />
    </div>
    <div>
      <p className="text-sm font-medium text-gray-500">{title}</p>
      <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
    </div>
  </div>
);

const AdminDashboard = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState({ users: 0, projects: 0, tasks: 0, completed: 0, pending: 0, overdue: 0 });
  const [recentActivities, setRecentActivities] = useState([]);
  const [allTasks, setAllTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [usersRes, projectsRes, tasksRes, activitiesRes] = await Promise.all([
          api.get('/users'),
          api.get('/projects'),
          api.get('/tasks'),
          api.get('/activities')
        ]);
        
        const tasks = tasksRes.data;
        const now = new Date();
        
        setStats({
          users: usersRes.data.length,
          projects: projectsRes.data.length,
          tasks: tasks.length,
          completed: tasks.filter(t => t.status === 'Done').length,
          pending: tasks.filter(t => t.status !== 'Done').length,
          overdue: tasks.filter(t => t.status !== 'Done' && new Date(t.dueDate) < now).length
        });
        
        setAllTasks(tasks.slice(0, 10)); // Just recent tasks for dashboard
        setRecentActivities(activitiesRes.data.slice(0, 10));
      } catch (error) {
        console.error("Failed to load dashboard data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading) return <div className="p-8 text-center">Loading dashboard...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard title="Total Users" value={stats.users} icon={Users} colorClass="bg-blue-100 text-blue-600" />
        <StatCard title="Total Projects" value={stats.projects} icon={Folder} colorClass="bg-indigo-100 text-indigo-600" />
        <StatCard title="Total Tasks" value={stats.tasks} icon={CheckSquare} colorClass="bg-purple-100 text-purple-600" />
        <StatCard title="Completed Tasks" value={stats.completed} icon={CheckCircle2} colorClass="bg-green-100 text-green-600" />
        <StatCard title="Pending Tasks" value={stats.pending} icon={Clock} colorClass="bg-yellow-100 text-yellow-600" />
        <StatCard title="Overdue Tasks" value={stats.overdue} icon={AlertTriangle} colorClass="bg-red-100 text-red-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-900">Task Tracking Panel</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-sm text-gray-500">
                  <th className="p-4 font-medium">Task</th>
                  <th className="p-4 font-medium">Project</th>
                  <th className="p-4 font-medium">Assigned To</th>
                  <th className="p-4 font-medium">Assigned By</th>
                  <th className="p-4 font-medium">Status</th>
                  <th className="p-4 font-medium">Due Date</th>
                </tr>
              </thead>
              <tbody>
                {allTasks.map(task => (
                  <tr key={task._id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="p-4 text-sm font-medium text-gray-900">{task.title}</td>
                    <td className="p-4 text-sm text-gray-600">{task.projectId?.title || 'Unknown'}</td>
                    <td className="p-4 text-sm text-gray-600">{task.assignedTo?.name || 'Unassigned'}</td>
                    <td className="p-4 text-sm text-gray-600">{task.assignedBy?.name || 'Unknown'}</td>
                    <td className="p-4">
                      <span className={clsx("text-xs px-2 py-1 rounded-full font-medium", 
                        task.status === 'Done' ? 'bg-green-100 text-green-700' : 
                        task.status === 'In Progress' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700')}>
                        {task.status}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-gray-600">{new Date(task.dueDate).toLocaleDateString()}</td>
                  </tr>
                ))}
                {allTasks.length === 0 && (
                  <tr><td colSpan="6" className="p-4 text-center text-gray-500">No tasks found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-900">Activity Log</h2>
          </div>
          <div className="p-6 space-y-4 max-h-[500px] overflow-y-auto">
            {recentActivities.length === 0 ? (
              <p className="text-gray-500 text-sm text-center">No recent activity.</p>
            ) : (
              recentActivities.map(activity => (
                <div key={activity._id} className="flex gap-3">
                  <div className="w-2 h-2 mt-2 rounded-full bg-indigo-500 flex-shrink-0"></div>
                  <div>
                    <p className="text-sm text-gray-800">{activity.description}</p>
                    <span className="text-xs text-gray-400">{new Date(activity.createdAt).toLocaleString()}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export default AdminDashboard;
