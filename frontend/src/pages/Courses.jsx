import { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { BookOpen } from 'lucide-react';

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, fetchUser } = useContext(AuthContext);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/courses');
      setCourses(res.data.data);
    } catch (err) {
      toast.error('Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async (courseId) => {
    try {
      await axios.post(`http://localhost:5000/api/courses/${courseId}/enroll`);
      toast.success('Successfully enrolled!');
      fetchUser(); // update context to show enrolled course in dashboard
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to enroll');
    }
  };

  if (loading) return <div className="p-10 text-center">Loading courses...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center"><BookOpen className="mr-3 text-indigo-600 h-8 w-8" /> All Courses</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {courses.map(course => (
          <div key={course._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col hover:shadow-lg transition duration-300">
            <div className="h-48 bg-indigo-50 flex items-center justify-center border-b border-gray-100">
              <BookOpen className="h-16 w-16 text-indigo-300" />
            </div>
            <div className="p-6 flex flex-col flex-grow">
              <h2 className="text-xl font-bold text-gray-900 mb-2">{course.title}</h2>
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">{course.description}</p>
              <div className="text-xs text-gray-500 mb-6 bg-gray-50 p-2 rounded inline-block w-fit">
                Instructor: {course.faculty?.name || 'Unknown'}
              </div>
              
              <div className="mt-auto">
                {user?.role === 'student' ? (
                  user.enrolledCourses?.some(c => c._id === course._id || c === course._id) ? (
                    <Link to={`/course/${course._id}`} className="block w-full text-center bg-indigo-50 text-indigo-700 font-semibold py-2.5 rounded-lg border border-indigo-100 hover:bg-indigo-100 transition">
                      Go to Course
                    </Link>
                  ) : (
                    <button onClick={() => handleEnroll(course._id)} className="block w-full text-center bg-indigo-600 text-white font-semibold py-2.5 rounded-lg hover:bg-indigo-700 transition">
                      Enroll Now
                    </button>
                  )
                ) : (
                  <div className="space-y-2">
                    <Link to={`/course/${course._id}`} className="block w-full text-center bg-indigo-50 text-indigo-700 font-semibold py-2.5 rounded-lg border border-indigo-100 hover:bg-indigo-100 transition">
                      Manage Course
                    </Link>
                    {user?.role === 'faculty' && course.faculty?._id === user._id && (
                      <Link to={`/faculty/analytics/${course._id}`} className="block w-full text-center bg-white text-indigo-600 font-semibold py-2.5 rounded-lg border border-indigo-200 hover:bg-indigo-50 transition">
                        View Analytics
                      </Link>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {courses.length === 0 && (
        <div className="text-center py-20 bg-white rounded-xl border border-gray-100">
          <BookOpen className="mx-auto h-12 w-12 text-gray-300 mb-4" />
          <p className="text-gray-500 text-lg">No courses available at the moment.</p>
        </div>
      )}
    </div>
  );
}
