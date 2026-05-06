import { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { AuthContext } from '../contexts/AuthContext';
import { User, Mail, Phone, Camera, Lock, Save, X, BookOpen, Award } from 'lucide-react';

export default function Profile() {
  const { user, setUser } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    bio: '',
    skills: '',
    interests: '',
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    if (user) {
      setFormData({
        ...formData,
        name: user.name || '',
        email: user.email || '',
        phoneNumber: user.phoneNumber || '',
        bio: user.bio || '',
        skills: user.skills?.join(', ') || '',
        interests: user.interests?.join(', ') || ''
      });
      if (user.profilePicture) {
        setPreview(`http://localhost:5000${user.profilePicture}`);
      }
    }
  }, [user]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, profilePicture: file });
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
      return toast.error("Passwords don't match");
    }

    setLoading(true);
    const data = new FormData();
    Object.keys(formData).forEach(key => {
      if (formData[key] !== null && formData[key] !== undefined) {
        data.append(key, formData[key]);
      }
    });

    try {
      const res = await axios.put('http://localhost:5000/api/users/profile', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Profile updated successfully');
      setUser(res.data.data);
      setFormData({ ...formData, oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  const profileCompletion = () => {
    let fields = ['name', 'email', 'phoneNumber', 'bio'];
    if (user?.role === 'faculty') fields.push('skills');
    else fields.push('interests');
    
    let filled = fields.filter(f => user?.[f] && user[f].length > 0).length;
    if (user?.profilePicture) filled++;
    return Math.round((filled / (fields.length + 1)) * 100);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
        <div className="bg-indigo-600 h-32 relative">
            <div className="absolute -bottom-12 left-8">
                <div className="relative">
                    <img 
                        src={preview || 'https://via.placeholder.com/150'} 
                        alt="Profile" 
                        className="w-32 h-32 rounded-2xl border-4 border-white object-cover shadow-lg"
                    />
                    <label className="absolute bottom-2 right-2 bg-white p-2 rounded-lg shadow-md cursor-pointer hover:bg-gray-50 transition">
                        <Camera className="w-5 h-5 text-indigo-600" />
                        <input type="file" className="hidden" onChange={handleImageChange} accept="image/*" />
                    </label>
                </div>
            </div>
        </div>

        <div className="pt-16 px-8 pb-8">
          <div className="flex justify-between items-start mb-8">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">{user?.name}</h1>
                <div className="flex items-center space-x-3 mt-1">
                    <p className="text-gray-500 capitalize">{user?.role}</p>
                    {user?.role === 'faculty' && (
                        <span className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border border-indigo-100">
                            ID: {user.teacherCode}
                        </span>
                    )}
                </div>
            </div>
            <div className="text-right">
                <p className="text-sm font-semibold text-gray-400 mb-1">Profile Completion</p>
                <div className="w-48 bg-gray-200 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full transition-all duration-500" style={{ width: `${profileCompletion()}%` }}></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">{profileCompletion()}% Completed</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <div className="relative">
                    <User className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <input name="name" value={formData.name} onChange={handleChange} className="pl-10 w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" required />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <div className="relative">
                    <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <input type="email" name="email" value={formData.email} onChange={handleChange} className="pl-10 w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" required />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <div className="relative">
                    <Phone className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <input name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} className="pl-10 w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    {user?.role === 'faculty' ? 'Skills / Expertise' : 'Course Interests'}
                </label>
                <div className="relative">
                    {user?.role === 'faculty' ? <Award className="absolute left-3 top-3 w-5 h-5 text-gray-400" /> : <BookOpen className="absolute left-3 top-3 w-5 h-5 text-gray-400" />}
                    <input 
                        name={user?.role === 'faculty' ? 'skills' : 'interests'} 
                        value={user?.role === 'faculty' ? formData.skills : formData.interests} 
                        onChange={handleChange} 
                        placeholder="Comma separated (e.g. React, Node.js)"
                        className="pl-10 w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" 
                    />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bio / About</label>
              <textarea name="bio" value={formData.bio} onChange={handleChange} rows="3" className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" placeholder="Tell us about yourself..."></textarea>
            </div>

            <hr className="my-8" />
            
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Lock className="w-5 h-5 mr-2" /> Update Password
            </h3>
            
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Old Password</label>
                <input type="password" name="oldPassword" value={formData.oldPassword} onChange={handleChange} className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                <input type="password" name="newPassword" value={formData.newPassword} onChange={handleChange} className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
              </div>
            </div>

            <div className="flex justify-end space-x-4 pt-6">
              <button type="button" onClick={() => window.history.back()} className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 transition">
                Cancel
              </button>
              <button type="submit" disabled={loading} className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition flex items-center">
                {loading ? 'Saving...' : <><Save className="w-5 h-5 mr-2" /> Save Changes</>}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
