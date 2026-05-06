import { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { BookOpen, LogOut, User as UserIcon } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <BookOpen className="h-8 w-8 text-indigo-600" />
              <span className="font-bold text-xl text-gray-900">LMS Pro</span>
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <Link to="/dashboard" className="text-gray-600 hover:text-indigo-600 font-medium">Dashboard</Link>
                <Link to="/courses" className="text-gray-600 hover:text-indigo-600 font-medium">Courses</Link>
                {user.role === 'student' && <Link to="/analytics" className="text-gray-600 hover:text-indigo-600 font-medium">Analytics</Link>}
                <div className="flex items-center space-x-2 border-l pl-4 ml-2">
                  <Link to="/profile" className="flex items-center space-x-2">
                    {user.profilePicture ? (
                        <img src={`http://localhost:5000${user.profilePicture}`} alt="Avatar" className="h-8 w-8 rounded-full object-cover border" />
                    ) : (
                        <UserIcon className="h-5 w-5 text-gray-500" />
                    )}
                    <span className="text-sm font-medium text-gray-700 capitalize">{user.name}</span>
                  </Link>
                  <button onClick={handleLogout} className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50 ml-2 transition-colors" title="Logout">
                    <LogOut className="h-5 w-5" />
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-600 hover:text-indigo-600 font-medium">Login</Link>
                <Link to="/register" className="bg-indigo-600 text-white px-4 py-2 rounded-md font-medium hover:bg-indigo-700 transition-colors">Sign Up</Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
