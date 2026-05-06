import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../contexts/AuthContext';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell
} from 'recharts';
import { AnalyticsCard, TopicList, AIInsightsCard } from '../components/analytics/AnalyticsComponents';
import { Loader2, TrendingUp, BookOpen, Award } from 'lucide-react';

const StudentAnalytics = () => {
  const { user } = useContext(AuthContext);
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        const url = courseId 
          ? `http://localhost:5000/api/analytics/student/${user._id}/${courseId}`
          : `http://localhost:5000/api/analytics/student/${user._id}`;
        const res = await axios.get(url);
        setData(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchAnalytics();
  }, [user, courseId]);

  if (loading) return (
    <div className="flex-1 flex items-center justify-center">
      <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
    </div>
  );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Performance Analytics</h1>
          <p className="text-gray-500">Track your learning progress and test performance.</p>
        </div>
        
        {/* Course Selector */}
        <div className="flex items-center space-x-3">
          <label className="text-sm font-medium text-gray-700">Select Course:</label>
          <select 
            value={courseId || ''} 
            onChange={(e) => navigate(e.target.value ? `/analytics/${e.target.value}` : '/analytics')}
            className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2.5 outline-none shadow-sm"
          >
            <option value="">All Enrolled Courses</option>
            {user.enrolledCourses?.map(c => (
              <option key={c._id} value={c._id}>{c.title}</option>
            ))}
          </select>
        </div>
      </header>

      <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-xl flex items-center justify-between">
        <span className="text-indigo-800 font-medium italic">Currently viewing: <span className="font-bold uppercase not-italic">{data.courseTitle}</span></span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <AnalyticsCard 
          title="Overall Progress" 
          value={`${data.progress}%`} 
          subtitle="Course Completion"
          color="indigo"
        />
        <AnalyticsCard 
          title="Average Score" 
          value={`${data.averageScore}%`} 
          subtitle="Across all tests"
          color="green"
        />
        <AnalyticsCard 
          title="Tests Taken" 
          value={data.testScores.length} 
          subtitle="Attempts"
          color="orange"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance Over Time */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Score History</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.testScores}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(str) => new Date(str).toLocaleDateString()} 
                  tick={{fill: '#9ca3af', fontSize: 12}}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis domain={[0, 100]} tick={{fill: '#9ca3af', fontSize: 12}} axisLine={false} tickLine={false} />
                <Tooltip />
                <Line type="monotone" dataKey="score" stroke="#4f46e5" strokeWidth={3} dot={{ r: 4, fill: '#4f46e5' }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Topic Performance */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Topic-wise Performance</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.topicPerformance}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="topic" tick={{fill: '#9ca3af', fontSize: 12}} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{fill: '#9ca3af', fontSize: 12}} axisLine={false} tickLine={false} />
                <Tooltip />
                <Bar dataKey="average" radius={[4, 4, 0, 0]}>
                  {data.topicPerformance.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.average < 50 ? '#ef4444' : entry.average > 75 ? '#10b981' : '#6366f1'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <TopicList title="Strong Topics" topics={data.strongTopics} color="green" />
        <TopicList title="Weak Topics (Needs Improvement)" topics={data.weakTopics} color="red" />
      </div>

      <AIInsightsCard type="student" data={data} />
    </div>
  );
};

export default StudentAnalytics;
