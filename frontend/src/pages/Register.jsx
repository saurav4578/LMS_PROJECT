import { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../contexts/AuthContext';
import { UserPlus, ShieldCheck, GraduationCap, ChevronDown, Search } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Register() {
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', role: 'student', teacherCode: ''
  });
  const [teachers, setTeachers] = useState([]);
  const [showTeacherList, setShowTeacherList] = useState(false);
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/users/teachers');
        setTeachers(res.data.data);
      } catch (err) {
        console.error("Failed to load teachers");
      }
    };
    fetchTeachers();
  }, []);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.role === 'student' && !formData.teacherCode) {
      return toast.error("Please enter a Teacher Code or select a teacher");
    }
    const success = await register(formData.name, formData.email, formData.password, formData.role, formData.teacherCode);
    if (success) navigate('/dashboard');
  };

  const selectTeacher = (code) => {
    setFormData({ ...formData, teacherCode: code });
    setShowTeacherList(false);
  };

  return (
    <div className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-2xl border border-gray-100 relative overflow-hidden">
        {/* Design Accents */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-indigo-600/5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-purple-600/5 rounded-full blur-3xl"></div>

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-indigo-600 text-white mb-4 shadow-xl shadow-indigo-100 rotate-3">
            <UserPlus className="h-10 w-10" />
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Join LMS Pro</h2>
          <p className="text-gray-500 mt-2 font-medium">Create your account to start learning</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Full Name</label>
            <input
              name="name" type="text" required
              value={formData.name} onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all duration-200 bg-gray-50/50"
              placeholder="Saurav Kumar"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Email Address</label>
            <input
              name="email" type="email" required
              value={formData.email} onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all duration-200 bg-gray-50/50"
              placeholder="name@company.com"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Password</label>
            <input
              name="password" type="password" required
              value={formData.password} onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all duration-200 bg-gray-50/50"
              placeholder="••••••••"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-3">Register as</label>
            <div className="grid grid-cols-2 gap-4">
              <button 
                type="button"
                onClick={() => setFormData({ ...formData, role: 'student' })}
                className={`flex flex-col items-center p-4 border-2 rounded-2xl transition-all duration-300 ${formData.role === 'student' ? 'border-indigo-600 bg-indigo-50/50 ring-4 ring-indigo-50' : 'border-gray-100 hover:border-indigo-200'}`}
              >
                <GraduationCap className={`h-6 w-6 mb-2 ${formData.role === 'student' ? 'text-indigo-600' : 'text-gray-400'}`} />
                <span className={`text-sm font-bold ${formData.role === 'student' ? 'text-indigo-900' : 'text-gray-600'}`}>Student</span>
              </button>
              <button 
                type="button"
                onClick={() => setFormData({ ...formData, role: 'faculty' })}
                className={`flex flex-col items-center p-4 border-2 rounded-2xl transition-all duration-300 ${formData.role === 'faculty' ? 'border-indigo-600 bg-indigo-50/50 ring-4 ring-indigo-50' : 'border-gray-100 hover:border-indigo-200'}`}
              >
                <ShieldCheck className={`h-6 w-6 mb-2 ${formData.role === 'faculty' ? 'text-indigo-600' : 'text-gray-400'}`} />
                <span className={`text-sm font-bold ${formData.role === 'faculty' ? 'text-indigo-900' : 'text-gray-600'}`}>Faculty</span>
              </button>
            </div>
          </div>

          {formData.role === 'student' && (
            <div className="space-y-3 pt-2">
              <label className="block text-sm font-bold text-gray-700">Link with Instructor</label>
              <div className="relative">
                <input
                  name="teacherCode" type="text" required
                  value={formData.teacherCode} onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all duration-200 bg-indigo-50/30 font-mono text-indigo-700 uppercase"
                  placeholder="ENTER TEACHER CODE"
                />
                <button 
                  type="button" 
                  onClick={() => setShowTeacherList(!showTeacherList)}
                  className="absolute right-3 top-3 text-indigo-600 text-xs font-bold hover:underline flex items-center"
                >
                  <Search className="w-3 h-3 mr-1" /> Select
                </button>
              </div>
              
              {showTeacherList && (
                <div className="bg-white border border-gray-100 rounded-xl shadow-xl max-h-48 overflow-y-auto p-2 space-y-1 mt-2">
                  <p className="text-[10px] font-bold text-gray-400 uppercase px-2 mb-1">Available Instructors</p>
                  {teachers.map(t => (
                    <div 
                      key={t.teacherCode} 
                      onClick={() => selectTeacher(t.teacherCode)}
                      className="flex items-center p-2 hover:bg-indigo-50 rounded-lg cursor-pointer transition"
                    >
                      <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs mr-3 overflow-hidden">
                        {t.profilePicture ? <img src={`http://localhost:5000${t.profilePicture}`} alt="" className="w-full h-full object-cover" /> : t.name.charAt(0)}
                      </div>
                      <div className="flex-grow">
                        <p className="text-sm font-bold text-gray-800 leading-none">{t.name}</p>
                        <p className="text-[10px] font-medium text-gray-400 mt-1 uppercase tracking-wider">{t.teacherCode}</p>
                      </div>
                      <ChevronDown className="w-4 h-4 text-gray-300 -rotate-90" />
                    </div>
                  ))}
                  {teachers.length === 0 && <p className="text-xs text-gray-400 p-2 text-center">No instructors found</p>}
                </div>
              )}
              <p className="text-[10px] text-gray-400 font-medium px-1 italic">Students must link with an instructor to access their courses.</p>
            </div>
          )}

          <button
            type="submit"
            className="w-full flex justify-center py-4 px-4 border border-transparent rounded-xl shadow-lg text-base font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-100 transition-all duration-300 transform active:scale-[0.98]"
          >
            Create Your Account
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-gray-600 font-medium">
          Already registered?{' '}
          <Link to="/login" className="font-bold text-indigo-600 hover:text-indigo-500 underline underline-offset-4 decoration-2">
            Sign in here
          </Link>
        </p>
      </div>
    </div>
  );
}
