import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { AnalyticsCard, TopicList, AIInsightsCard } from '../components/analytics/AnalyticsComponents';
import { Loader2, Users, Target, Activity } from 'lucide-react';

const FacultyAnalytics = () => {
  const { courseId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/analytics/faculty/${courseId}`);
        setData(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [courseId]);

  if (loading) return (
    <div className="flex-1 flex items-center justify-center">
      <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
    </div>
  );

  const COLORS = ['#6366f1', '#e2e8f0'];
  const engagementData = [
    { name: 'Active', value: data.activeStudents },
    { name: 'Inactive', value: data.totalStudents - data.activeStudents }
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-gray-900">Course Analytics</h1>
        <p className="text-gray-500">Overview of student engagement and academic performance.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <AnalyticsCard title="Total Students" value={data.totalStudents} color="indigo" />
        <AnalyticsCard title="Active Students" value={data.activeStudents} color="green" />
        <AnalyticsCard title="Engagement Rate" value={`${data.engagementRate}%`} color="blue" />
        <AnalyticsCard title="Class Average" value={`${data.averageScore}%`} color="purple" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Engagement Pie */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 lg:col-span-1">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Student Activity</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={engagementData}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {engagementData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center space-x-6 mt-4">
             <div className="flex items-center"><div className="w-3 h-3 bg-indigo-600 rounded-full mr-2"></div><span className="text-xs text-gray-500">Active</span></div>
             <div className="flex items-center"><div className="w-3 h-3 bg-gray-200 rounded-full mr-2"></div><span className="text-xs text-gray-500">Inactive</span></div>
          </div>
        </div>

        {/* Difficult Topics */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 lg:col-span-2">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Topic Performance (Average Score)</h3>
          {data.difficultTopics.length > 0 ? (
            <div className="space-y-4">
              {data.difficultTopics.map((topic, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-red-50 rounded-xl border border-red-100">
                  <span className="font-medium text-red-900">{topic.topic}</span>
                  <span className="text-red-700 font-bold">{Math.round(topic.average)}%</span>
                </div>
              ))}
              <p className="text-sm text-gray-500 italic">Topics with average score below 60% are flagged as difficult.</p>
            </div>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center text-gray-400">
              <Target className="w-12 h-12 mb-2 opacity-20" />
              <p>No difficult topics identified.</p>
            </div>
          )}
        </div>
      </div>

      <AIInsightsCard type="faculty" data={data} />
    </div>
  );
};

export default FacultyAnalytics;
