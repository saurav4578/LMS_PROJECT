import { useEffect, useState, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { AuthContext } from '../contexts/AuthContext';
import { 
    Play, FileText, Video, Radio, FileQuestion, Plus, 
    Upload, Trash2, CheckCircle2, ChevronDown, ChevronRight, 
    Users, Layout, ListChecks, BarChart3, Clock, PlayCircle, Award
} from 'lucide-react';
import DiscussionForum from '../components/DiscussionForum';

export default function CourseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [completedLectures, setCompletedLectures] = useState([]);
  const [progress, setProgress] = useState(0);
  const [expandedModules, setExpandedModules] = useState({});
  const { user } = useContext(AuthContext);

  const fetchCourse = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/courses/${id}`);
      setCourse(res.data.data);
      setProgress(res.data.progress || 0);
      setCompletedLectures(res.data.completedLectures || []);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load course');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourse();
  }, [id]);

  const isOwner = user?.role === 'faculty' && course?.faculty?._id === user?._id;

  const toggleModule = (modId) => {
    setExpandedModules(prev => ({ ...prev, [modId]: !prev[modId] }));
  };

  const handleAddModule = async () => {
    const title = window.prompt("Enter Module Title:");
    if (!title) return;
    try {
      await axios.post(`http://localhost:5000/api/modules/${course._id}`, { title });
      toast.success('Module added');
      fetchCourse();
    } catch (err) {
      toast.error('Failed to add module');
    }
  };

  const handleAddTopic = async (moduleId) => {
    const title = window.prompt("Enter Topic Title:");
    if (!title) return;
    try {
      await axios.post(`http://localhost:5000/api/modules/${moduleId}/topics`, { title });
      toast.success('Topic added');
      fetchCourse();
    } catch (err) {
      toast.error('Failed to add topic');
    }
  };

  const handleStartLive = async (moduleId) => {
    const topic = window.prompt("Enter Live Session Topic:");
    if (!topic) return;
    try {
      await axios.post(`http://localhost:5000/api/modules/${moduleId}/live`, { topic });
      toast.success('Live session started');
      fetchCourse();
    } catch (err) {
      toast.error('Failed to start live session');
    }
  };

  const handleCreateTest = (moduleId) => {
    navigate(`/test-create/${moduleId}`);
  };

  const handlePrintPDF = async (testId) => {
    try {
      const res = await axios.get(`http://localhost:5000/api/tests/${testId}`);
      const test = res.data.data;
      const printWindow = window.open('', '_blank');
      printWindow.document.write(`
        <html><head><title>${test.title}</title><style>body { font-family: sans-serif; padding: 40px; }</style></head>
        <body><h1>${test.title}</h1>${test.questions.map((q, i) => `<p><b>${i+1}. ${q.questionText}</b><br/>${q.options.join(', ')}</p>`).join('')}</body></html>
      `);
      printWindow.document.close();
      printWindow.print();
    } catch (err) {
      toast.error('Failed to print PDF');
    }
  };

  const handleUploadLecture = async (targetId, file, isModule = false) => {
    if (!file) return;
    const title = window.prompt("Enter Lecture Title:");
    if (!title) return;
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title);

    try {
      const url = isModule 
        ? `http://localhost:5000/api/modules/${targetId}/lectures`
        : `http://localhost:5000/api/modules/topics/${targetId}/lectures`;
        
      await axios.post(url, formData);
      toast.success('Lecture uploaded');
      fetchCourse();
    } catch (err) {
      toast.error('Failed to upload lecture');
    }
  };

  const handleMarkCompleted = async (lectureId) => {
    if (user?.role !== 'student') return;
    try {
      await axios.post(`http://localhost:5000/api/progress/lecture/${lectureId}`);
      if (!completedLectures.includes(lectureId)) {
          setCompletedLectures([...completedLectures, lectureId]);
          // Re-calculate progress locally or re-fetch
          fetchCourse();
      }
    } catch (err) {
      console.error('Failed to mark as completed', err);
    }
  };

  const isCompleted = (lectureId) => completedLectures.includes(lectureId);

  const getCourseStats = () => {
      let lectures = 0;
      let tests = 0;
      course?.modules?.forEach(m => {
          lectures += m.lectures?.length || 0;
          tests += m.tests?.length || 0;
          m.topics?.forEach(t => {
              lectures += t.lectures?.length || 0;
              tests += t.tests?.length || 0;
          });
      });
      return { lectures, tests };
  };

  if (loading) return <div className="p-10 text-center">Loading course details...</div>;
  if (!course) return <div className="p-10 text-center">Course not found.</div>;

  const stats = getCourseStats();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full flex flex-col md:flex-row gap-8">
      
      {/* Left Column: Course Info & Structure */}
      <div className="flex-grow space-y-6">
        <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
            <div className="flex items-center space-x-4 mb-4">
                <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-2.5 py-0.5 rounded uppercase tracking-wider">
                    {course.category || 'Course'}
                </span>
                <span className="text-gray-400">•</span>
                <span className="text-gray-500 text-sm flex items-center"><Clock className="w-4 h-4 mr-1" /> 12 Hours</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{course.title}</h1>
            <p className="text-gray-600 mb-8 leading-relaxed">{course.description}</p>
            
            <div className="flex items-center justify-between p-4 bg-indigo-50 rounded-xl border border-indigo-100">
                <div className="flex items-center space-x-3">
                    {course.faculty?.profilePicture ? (
                        <img src={`http://localhost:5000${course.faculty.profilePicture}`} alt="" className="w-10 h-10 rounded-full border-2 border-white shadow-sm" />
                    ) : (
                        <div className="w-10 h-10 rounded-full bg-indigo-200 flex items-center justify-center border-2 border-white shadow-sm">
                            <Users className="w-6 h-6 text-indigo-500" />
                        </div>
                    )}
                    <div>
                        <p className="text-xs text-indigo-400 font-bold uppercase tracking-tighter">Instructor</p>
                        <p className="font-semibold text-indigo-900">{course.faculty?.name}</p>
                    </div>
                </div>
                {user?.role === 'student' && (
                    <div className="text-right">
                        <p className="text-xs text-indigo-400 font-bold uppercase tracking-tighter mb-1">Your Progress</p>
                        <div className="flex items-center space-x-2">
                            <div className="w-32 bg-indigo-200 rounded-full h-1.5">
                                <div className="bg-indigo-600 h-1.5 rounded-full" style={{ width: `${progress}%` }}></div>
                            </div>
                            <span className="text-sm font-bold text-indigo-700">{progress}%</span>
                        </div>
                    </div>
                )}
            </div>
        </div>

        <div className="flex items-center justify-between px-2">
            <h2 className="text-xl font-bold text-gray-800 flex items-center">
                <Layout className="w-5 h-5 mr-2 text-indigo-600" /> Course Content
            </h2>
            {isOwner && (
                <button onClick={handleAddModule} className="text-sm bg-indigo-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-indigo-700 transition flex items-center shadow-md shadow-indigo-100">
                    <Plus className="w-4 h-4 mr-1" /> New Module
                </button>
            )}
        </div>

        <div className="space-y-4">
            {course.modules?.map((mod, mIdx) => (
                <div key={mod._id} className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm transition-all duration-300">
                    <div 
                        className={`px-6 py-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition ${expandedModules[mod._id] ? 'bg-indigo-50/30' : ''}`}
                        onClick={() => toggleModule(mod._id)}
                    >
                        <div className="flex items-center space-x-4">
                            <div className="bg-white border border-gray-200 text-gray-400 w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm shadow-sm">
                                {mIdx + 1}
                            </div>
                            <h3 className="font-bold text-gray-800">{mod.title}</h3>
                        </div>
                        <div className="flex items-center space-x-4">
                            {isOwner && (
                                <div className="flex space-x-1">
                                    <button onClick={(e) => { e.stopPropagation(); handleStartLive(mod._id); }} className="p-1.5 hover:bg-red-100 text-red-500 rounded-md transition" title="Start Live Class"><Radio className="w-4 h-4" /></button>
                                    <button onClick={(e) => { e.stopPropagation(); handleCreateTest(mod._id); }} className="p-1.5 hover:bg-green-100 text-green-500 rounded-md transition" title="Create Test"><FileQuestion className="w-4 h-4" /></button>
                                </div>
                            )}
                            <span className="text-xs font-semibold text-gray-400 uppercase">{mod.topics?.length || 0} Topics</span>
                            {expandedModules[mod._id] ? <ChevronDown className="w-5 h-5 text-gray-400" /> : <ChevronRight className="w-5 h-5 text-gray-400" />}
                        </div>
                    </div>

                    {expandedModules[mod._id] && (
                        <div className="border-t border-gray-100 bg-white p-4 space-y-4">
                            {/* Topics */}
                            {mod.topics?.map((topic, tIdx) => (
                                <div key={topic._id} className="ml-4 border-l-2 border-indigo-100 pl-6 py-2">
                                    <div className="flex items-center justify-between mb-3">
                                        <h4 className="font-bold text-gray-700 text-sm">{topic.title}</h4>
                                        {isOwner && (
                                            <label className="cursor-pointer bg-indigo-50 text-indigo-600 p-1.5 rounded-md hover:bg-indigo-100 transition">
                                                <Upload className="w-3.5 h-3.5" />
                                                <input type="file" className="hidden" onChange={(e) => handleUploadLecture(topic._id, e.target.files[0])} />
                                            </label>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        {topic.lectures?.map(lec => (
                                            <div key={lec._id} className="flex items-center justify-between group">
                                                <div className="flex items-center space-x-3">
                                                    {lec.fileType?.includes('video') ? <PlayCircle className="w-4 h-4 text-indigo-400" /> : <FileText className="w-4 h-4 text-blue-400" />}
                                                    <a 
                                                        href={`http://localhost:5000${lec.fileUrl}`} 
                                                        target="_blank" 
                                                        rel="noreferrer" 
                                                        onClick={() => handleMarkCompleted(lec._id)}
                                                        className={`text-sm font-medium transition ${isCompleted(lec._id) ? 'text-gray-400 line-through' : 'text-gray-600 hover:text-indigo-600'}`}
                                                    >
                                                        {lec.title}
                                                    </a>
                                                </div>
                                                {isCompleted(lec._id) && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}

                            {/* Direct Module Content (Legacy or Non-topic) */}
                            {(mod.lectures?.length > 0 || mod.tests?.length > 0 || mod.liveSessions?.length > 0) && (
                                <div className="ml-4 border-l-2 border-gray-100 pl-6 py-2 space-y-4">
                                    <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Other Resources</h4>
                                    
                                    {/* Direct Lectures */}
                                    <div className="space-y-2">
                                        {mod.lectures?.map(lec => (
                                            <div key={lec._id} className="flex items-center justify-between group">
                                                <div className="flex items-center space-x-3">
                                                    {lec.fileType?.includes('video') ? <PlayCircle className="w-4 h-4 text-indigo-400" /> : <FileText className="w-4 h-4 text-blue-400" />}
                                                    <a href={`http://localhost:5000${lec.fileUrl}`} target="_blank" rel="noreferrer" onClick={() => handleMarkCompleted(lec._id)} className={`text-sm font-medium transition ${isCompleted(lec._id) ? 'text-gray-400 line-through' : 'text-gray-600 hover:text-indigo-600'}`}>
                                                        {lec.title}
                                                    </a>
                                                </div>
                                                {isCompleted(lec._id) && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                                            </div>
                                        ))}
                                    </div>

                                    {/* Direct Live Classes */}
                                    <div className="space-y-2">
                                        {mod.liveSessions?.map(session => (
                                            <div key={session._id} className="flex items-center justify-between p-2 bg-red-50 rounded-lg border border-red-100">
                                                <span className="text-xs font-bold text-red-700 flex items-center">
                                                    <span className={`w-1.5 h-1.5 rounded-full mr-2 ${session.isActive ? 'bg-red-500 animate-pulse' : 'bg-gray-400'}`}></span>
                                                    {session.topic}
                                                </span>
                                                {session.isActive && <Link to={`/live/${session.roomId}`} className="text-[10px] bg-red-600 text-white px-2 py-1 rounded font-bold">JOIN</Link>}
                                            </div>
                                        ))}
                                    </div>

                                    {/* Direct Tests */}
                                    <div className="space-y-2">
                                        {mod.tests?.map(test => (
                                            <div key={test._id} className="flex items-center justify-between p-2 bg-green-50 rounded-lg border border-green-100">
                                                <span className="text-xs font-bold text-green-700">{test.title}</span>
                                                <div className="flex space-x-2">
                                                    {isOwner ? (
                                                        <button onClick={() => handlePrintPDF(test._id)} className="text-[10px] bg-white text-green-700 px-2 py-1 rounded font-bold border border-green-200">PDF</button>
                                                    ) : (
                                                        <Link to={`/test/${test._id}`} className="text-[10px] bg-green-600 text-white px-2 py-1 rounded font-bold">START</Link>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {isOwner && (
                                <div className="flex items-center space-x-6 ml-10">
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); handleAddTopic(mod._id); }} 
                                        className="text-xs font-bold text-indigo-600 flex items-center hover:underline"
                                    >
                                        <Plus className="w-3 h-3 mr-1" /> Add Topic
                                    </button>
                                    <label className="cursor-pointer text-xs font-bold text-blue-600 flex items-center hover:underline">
                                        <Plus className="w-3 h-3 mr-1" /> Add Module Resource
                                        <input type="file" className="hidden" onChange={(e) => handleUploadLecture(mod._id, e.target.files[0], true)} />
                                    </label>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            ))}
        </div>
      </div>

      {/* Right Column: Sidebar Stats & Quick Actions */}
      <div className="w-full md:w-80 space-y-6">
        {user?.role === 'faculty' ? (
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-6">
                <h3 className="font-bold text-gray-900 flex items-center">
                    <BarChart3 className="w-5 h-5 mr-2 text-indigo-600" /> Faculty Stats
                </h3>
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                        <Users className="w-5 h-5 text-blue-600 mb-2" />
                        <p className="text-xl font-bold text-blue-900">{course.students?.length || 0}</p>
                        <p className="text-xs font-semibold text-blue-400 uppercase">Students</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-xl border border-green-100">
                        <Video className="w-5 h-5 text-green-600 mb-2" />
                        <p className="text-xl font-bold text-green-900">{stats.lectures}</p>
                        <p className="text-xs font-semibold text-green-400 uppercase">Lectures</p>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-xl border border-purple-100">
                        <FileQuestion className="w-5 h-5 text-purple-600 mb-2" />
                        <p className="text-xl font-bold text-purple-900">{stats.tests}</p>
                        <p className="text-xs font-semibold text-purple-400 uppercase">Tests</p>
                    </div>
                    <div className="bg-orange-50 p-4 rounded-xl border border-orange-100">
                        <ListChecks className="w-5 h-5 text-orange-600 mb-2" />
                        <p className="text-xl font-bold text-orange-900">{course.modules?.length || 0}</p>
                        <p className="text-xs font-semibold text-orange-400 uppercase">Modules</p>
                    </div>
                </div>
                <div className="pt-4 border-t border-gray-100">
                    <Link to={`/faculty/analytics/${id}`} className="w-full bg-gray-900 text-white p-3 rounded-xl font-bold text-sm flex items-center justify-center hover:bg-gray-800 transition">
                        View Detailed Analytics
                    </Link>
                </div>
            </div>
        ) : (
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-6">
                <h3 className="font-bold text-gray-900">Your Learning</h3>
                <div className="p-4 bg-indigo-600 rounded-2xl text-white shadow-lg shadow-indigo-100 relative overflow-hidden">
                    <PlayCircle className="absolute -right-4 -bottom-4 w-24 h-24 text-white opacity-10" />
                    <p className="text-indigo-200 text-xs font-bold uppercase mb-1">Resume Study</p>
                    <h4 className="font-bold mb-4">Mastering {course.title}</h4>
                    <button className="bg-white text-indigo-600 w-full py-2.5 rounded-xl font-bold text-sm flex items-center justify-center hover:bg-indigo-50 transition">
                        <Play className="w-4 h-4 mr-2 fill-current" /> Continue Learning
                    </button>
                </div>
                <div className="space-y-4">
                    <p className="text-sm font-bold text-gray-900">Recommended Next</p>
                    <div className="bg-gray-50 p-3 rounded-xl flex items-center space-x-3">
                        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
                            <FileQuestion className="w-5 h-5 text-indigo-600" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-gray-800">Module Quiz</p>
                            <p className="text-[10px] text-gray-400 font-bold uppercase">10 Questions • 15 Mins</p>
                        </div>
                    </div>
                </div>
            </div>
        )}

        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-4">Course Info</h3>
            <ul className="space-y-4">
                <li className="flex items-center text-sm text-gray-600">
                    <Video className="w-4 h-4 mr-3 text-gray-400" /> Full lifetime access
                </li>
                <li className="flex items-center text-sm text-gray-600">
                    <Users className="w-4 h-4 mr-3 text-gray-400" /> Access on mobile and TV
                </li>
                <li className="flex items-center text-sm text-gray-600">
                    <Award className="w-4 h-4 mr-3 text-gray-400" /> Certificate of completion
                </li>
            </ul>
        </div>
      </div>

      <div className="fixed bottom-8 right-8">
        <DiscussionForum courseId={id} />
      </div>
    </div>
  );
}
