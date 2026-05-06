import React, { useState } from 'react';
import axios from 'axios';
import { Sparkles, Loader2 } from 'lucide-react';

export const AIInsightsCard = ({ type, data }) => {
  const [insights, setInsights] = useState('');
  const [loading, setLoading] = useState(false);

  const generateInsights = async () => {
    setLoading(true);
    try {
      const res = await axios.post('http://localhost:5000/api/analytics/ai-insights', { type, data });
      setInsights(res.data.insights);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mt-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-5 h-5 text-indigo-600" />
          <h3 className="text-lg font-bold text-gray-900">AI-Powered Insights</h3>
        </div>
        <button
          onClick={generateInsights}
          disabled={loading}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition flex items-center space-x-2 disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          <span>{loading ? 'Analyzing...' : 'Generate Insights'}</span>
        </button>
      </div>

      {insights ? (
        <div className="prose prose-indigo max-w-none text-gray-700 whitespace-pre-wrap bg-indigo-50 p-4 rounded-xl border border-indigo-100">
          {insights}
        </div>
      ) : (
        <p className="text-gray-500 italic">Click the button to get personalized AI analysis based on your performance data.</p>
      )}
    </div>
  );
};

export const AnalyticsCard = ({ title, value, subtitle, color = "indigo" }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
    <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider">{title}</h4>
    <div className="mt-2 flex items-baseline">
      <span className={`text-3xl font-bold text-${color}-600`}>{value}</span>
      {subtitle && <span className="ml-2 text-sm text-gray-400">{subtitle}</span>}
    </div>
  </div>
);

export const TopicList = ({ title, topics, color }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
    <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">{title}</h4>
    <div className="flex flex-wrap gap-2">
      {topics.length > 0 ? topics.map((topic, i) => (
        <span key={i} className={`px-3 py-1 rounded-full text-sm font-medium bg-${color}-50 text-${color}-700 border border-${color}-100`}>
          {topic}
        </span>
      )) : <span className="text-gray-400 text-sm">No topics identified yet.</span>}
    </div>
  </div>
);
