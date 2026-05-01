import { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LogOut, CheckSquare, Folder, LayoutDashboard } from 'lucide-react';
import clsx from 'clsx';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">T</div>
              <span className="font-bold text-xl text-gray-900 tracking-tight">TaskManager</span>
            </Link>
            <div className="hidden sm:ml-8 sm:flex sm:space-x-4 items-center">
              <Link to="/" className="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition">
                <LayoutDashboard size={18} /> Dashboard
              </Link>
              <Link to="/projects" className="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition">
                <Folder size={18} /> Projects
              </Link>
              <Link to="/tasks" className="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition">
                <CheckSquare size={18} /> Tasks
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex flex-col items-end mr-2">
              <span className="text-sm font-medium text-gray-900">{user?.name}</span>
              <span className={clsx("text-xs px-2 py-0.5 rounded-full font-medium", user?.role === 'Admin' ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-600')}>{user?.role}</span>
            </div>
            <button onClick={handleLogout} className="text-gray-500 hover:text-red-600 p-2 rounded-full transition flex items-center gap-2 text-sm font-medium">
              <LogOut size={18} /> <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};
export default Navbar;
