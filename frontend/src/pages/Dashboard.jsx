import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Book, Users, ClipboardList, Trash2, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState({ users: 0, courses: 0 });
  const [allUsers, setAllUsers] = useState([]);
  const [showCreateCourse, setShowCreateCourse] = useState(false);
  const [courseData, setCourseData] = useState({ title: '', description: '' });

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/courses', courseData);
      toast.success('Course created successfully');
      setShowCreateCourse(false);
      setCourseData({ title: '', description: '' });
      // To show the new course immediately, fetch user again or rely on the user going to Courses page
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create course');
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/users');
      setAllUsers(res.data.data);
    } catch (err) {
      toast.error('Failed to fetch users');
    }
  };

  const handleApproveFaculty = async (id) => {
    try {
      await axios.put(`http://localhost:5000/api/users/${id}/approve`);
      toast.success('Faculty approved successfully');
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to approve faculty');
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) return;
    try {
      await axios.delete(`http://localhost:5000/api/users/${id}`);
      toast.success('User deleted successfully');
      fetchUsers();
      // Update stats as well
      axios.get('http://localhost:5000/api/users/stats').then(res => setStats(res.data.data)).catch(console.error);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete user');
    }
  };

  useEffect(() => {
    if (user?.role === 'admin') {
      axios.get('http://localhost:5000/api/users/stats').then(res => setStats(res.data.data)).catch(console.error);
      fetchUsers();
    }
  }, [user]);

  if (!user) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
      <h1 className="text-3xl font-bold text-gray-900 mb-8 capitalize">{user.role} Dashboard</h1>
      
      {user.role === 'student' && (
        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center"><Book className="mr-2 text-indigo-600" /> My Enrolled Courses</h2>
          {user.enrolledCourses?.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {user.enrolledCourses.map(course => (
                <Link to={`/course/${course._id}`} key={course._id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition group">
                  <h3 className="text-lg font-bold text-gray-900 group-hover:text-indigo-600 transition">{course.title || 'Course'}</h3>
                  <div className="mt-4 text-indigo-600 text-sm font-medium">Continue Learning →</div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="bg-white p-8 rounded-xl shadow-sm text-center border border-gray-100">
              <p className="text-gray-500 mb-4">You haven't enrolled in any courses yet.</p>
              <Link to="/courses" className="text-indigo-600 font-medium hover:underline">Browse available courses</Link>
            </div>
          )}
        </div>
      )}

      {user.role === 'faculty' && (
        <div>
          {!user.isApproved ? (
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg flex items-center shadow-sm">
              <ShieldCheck className="w-5 h-5 mr-3 text-yellow-600" />
              Your account is pending admin approval. You cannot manage courses yet.
            </div>
          ) : (
            <div className="space-y-8">
              {/* Teacher Code Card */}
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 text-white shadow-xl shadow-indigo-100 flex flex-col md:flex-row items-center justify-between">
                <div className="mb-4 md:mb-0">
                  <h3 className="text-xl font-bold mb-1 flex items-center">
                    <Users className="w-6 h-6 mr-2" /> Your Teacher Invite Code
                  </h3>
                  <p className="text-indigo-100 text-sm">Share this code with your students to link them to your courses.</p>
                </div>
                <div className="flex items-center space-x-4 bg-white/10 backdrop-blur-md p-3 rounded-xl border border-white/20">
                  <span className="text-2xl font-mono font-black tracking-widest uppercase">{user.teacherCode}</span>
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(user.teacherCode);
                      toast.success('Code copied to clipboard!');
                    }}
                    className="bg-white text-indigo-600 px-4 py-2 rounded-lg font-bold text-sm hover:bg-indigo-50 transition shadow-sm"
                  >
                    Copy Code
                  </button>
                </div>
              </div>

              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-800 flex items-center"><ClipboardList className="mr-2 text-indigo-600" /> Manage My Courses</h2>
                <button onClick={() => setShowCreateCourse(!showCreateCourse)} className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700">
                  {showCreateCourse ? 'Cancel' : 'Create New Course'}
                </button>
              </div>
              
              {showCreateCourse && (
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Create a New Course</h3>
                  <form onSubmit={handleCreateCourse} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Course Title</label>
                      <input 
                        type="text" required 
                        value={courseData.title}
                        onChange={(e) => setCourseData({...courseData, title: e.target.value})}
                        className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Description</label>
                      <textarea 
                        required 
                        value={courseData.description}
                        onChange={(e) => setCourseData({...courseData, description: e.target.value})}
                        className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                        rows="3"
                      ></textarea>
                    </div>
                    <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700">Save Course</button>
                  </form>
                </div>
              )}

              <p className="text-gray-500">Go to "Courses" page to see your created courses and manage their modules.</p>
            </div>
          )}
        </div>
      )}

      {user.role === 'admin' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
              <div className="p-3 bg-blue-100 rounded-lg text-blue-600"><Users className="h-8 w-8" /></div>
              <div>
                <p className="text-sm font-medium text-gray-500">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{stats.users}</p>
              </div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
              <div className="p-3 bg-indigo-100 rounded-lg text-indigo-600"><Book className="h-8 w-8" /></div>
              <div>
                <p className="text-sm font-medium text-gray-500">Total Courses</p>
                <p className="text-2xl font-bold text-gray-900">{stats.courses}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
              <h3 className="font-bold text-gray-800 text-lg">Manage Users</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 text-sm text-gray-500 uppercase tracking-wider">
                    <th className="px-6 py-4 font-semibold">Name</th>
                    <th className="px-6 py-4 font-semibold">Email</th>
                    <th className="px-6 py-4 font-semibold">Role</th>
                    <th className="px-6 py-4 font-semibold">Status</th>
                    <th className="px-6 py-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {allUsers.map((u) => (
                    <tr key={u._id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 font-medium text-gray-900">{u.name}</td>
                      <td className="px-6 py-4 text-gray-500">{u.email}</td>
                      <td className="px-6 py-4 capitalize text-gray-700 font-medium">{u.role}</td>
                      <td className="px-6 py-4">
                        {u.role === 'faculty' ? (
                          <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${u.isApproved ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                            {u.isApproved ? 'Approved' : 'Pending'}
                          </span>
                        ) : (
                          <span className="text-gray-400 text-sm">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right flex justify-end items-center space-x-2">
                        {u.role === 'faculty' && !u.isApproved && (
                          <button 
                            onClick={() => handleApproveFaculty(u._id)}
                            className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-1.5 px-3 rounded-md transition"
                          >
                            Approve
                          </button>
                        )}
                        {u.role !== 'admin' && (
                          <button 
                            onClick={() => handleDeleteUser(u._id)}
                            className="text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 p-1.5 rounded-md transition"
                            title="Delete User"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {allUsers.length === 0 && (
                    <tr>
                      <td colSpan="5" className="px-6 py-8 text-center text-gray-500">No users found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
