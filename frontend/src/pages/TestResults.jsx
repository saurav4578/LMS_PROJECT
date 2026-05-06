import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { ArrowLeft, CheckCircle, XCircle, AlertCircle, ShieldAlert, Trash2 } from 'lucide-react';

const Loader2 = ({ className }) => (
  <div className={`animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite] ${className}`} role="status"></div>
);

export default function TestResults() {
  const { testId } = useParams();
  const navigate = useNavigate();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);
  const [isPublished, setIsPublished] = useState(false);

  const [selectedMalpractice, setSelectedMalpractice] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resResults, resTest] = await Promise.all([
            axios.get(`http://localhost:5000/api/tests/${testId}/all-results`),
            axios.get(`http://localhost:5000/api/tests/${testId}`)
        ]);
        setResults(resResults.data.data);
        setIsPublished(resTest.data.data.resultsPublished);
      } catch (err) {
        toast.error('Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [testId]);

  if (loading) return <div className="flex items-center justify-center h-screen"><Loader2 className="animate-spin text-indigo-600 w-12 h-12" /></div>;

  const handlePublish = async () => {
    if (!window.confirm("Publish results and notify all students via email?")) return;
    setIsPublishing(true);
    try {
      await axios.put(`http://localhost:5000/api/tests/${testId}/publish`);
      toast.success('Results published and emails sent!');
      setIsPublished(true);
    } catch (err) {
      toast.error('Failed to publish results');
    } finally {
      setIsPublishing(false);
    }
  };

  const handleDeleteAttempt = async (resultId) => {
    if (!window.confirm("Are you sure? This will delete the student's attempt and allow them to retake the test.")) return;
    try {
      await axios.delete(`http://localhost:5000/api/tests/results/${resultId}`);
      toast.success('Attempt record deleted. Student can now retake.');
      setResults(prev => prev.filter(r => r._id !== resultId));
    } catch (err) {
      toast.error('Failed to delete attempt');
    }
  };


  const filteredResults = results.filter(r => 
    r.student?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.student?.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedResults = [...filteredResults].sort((a, b) => b.percentage - a.percentage);


  return (
    <div className="max-w-7xl mx-auto px-4 py-10 w-full">
      <button onClick={() => navigate(-1)} className="flex items-center text-indigo-600 mb-6 hover:underline font-medium">
        <ArrowLeft className="w-4 h-4 mr-1" /> Back to Course
      </button>
      
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-200 mb-8 flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-1">Teacher Dashboard: Test Results</h1>
          <p className="text-gray-500">Monitor malpractice and evaluate student performance.</p>
        </div>
        <div className="flex gap-4">
           <button 
             onClick={handlePublish}
             disabled={isPublishing || isPublished}
             className={`px-6 py-3 rounded-2xl font-bold flex items-center transition ${isPublished ? 'bg-green-100 text-green-700 cursor-default' : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-100'}`}
           >
             {isPublishing ? 'Publishing...' : isPublished ? <> <CheckCircle className="mr-2" /> Published </> : 'Publish Results'}
           </button>
           <div className="bg-indigo-50 px-6 py-3 rounded-2xl border border-indigo-100 text-center">
             <p className="text-xs font-black text-indigo-600 uppercase tracking-widest mb-1">Total Attempts</p>
             <p className="text-2xl font-black text-indigo-900">{results.length}</p>
           </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="mb-8">
        <input 
          type="text" 
          placeholder="Search by student name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-6 py-4 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none transition"
        />
      </div>

      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100 text-xs text-gray-400 uppercase tracking-widest">
                <th className="px-6 py-5 font-black text-center">Rank</th>
                <th className="px-6 py-5 font-black">Student Profile</th>
                <th className="px-6 py-5 font-black text-center">Score</th>
                <th className="px-6 py-5 font-black text-center">Percentage</th>
                <th className="px-6 py-5 font-black text-center">Security Status</th>
                <th className="px-6 py-5 font-black text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {sortedResults.map((r, index) => (
                <tr key={r._id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-6 py-5 text-center">
                    <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-black text-sm ${index === 0 ? 'bg-yellow-100 text-yellow-700' : index === 1 ? 'bg-gray-100 text-gray-500' : index === 2 ? 'bg-orange-100 text-orange-700' : 'text-gray-400'}`}>
                        {index + 1}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center font-bold mr-4">
                        {r.student?.name?.[0] || '?'}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">{r.student?.name || 'Unknown Student'}</p>
                        <p className="text-xs text-gray-400">{r.student?.email || 'No email'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <p className="font-black text-gray-900">{r.score} / {r.total}</p>
                    <p className="text-[10px] font-bold text-gray-400 uppercase">Attempt #{r.attemptNumber}</p>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <span className={`px-4 py-1.5 rounded-full text-xs font-black ${r.percentage >= 50 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                      {r.percentage.toFixed(1)}%
                    </span>
                  </td>
                  <td className="px-6 py-5 text-center">
                    {r.violationCount > 0 ? (
                      <button 
                        onClick={() => setSelectedMalpractice(r)}
                        className="px-4 py-1.5 bg-red-100 text-red-700 text-xs font-black rounded-full hover:bg-red-200 transition flex items-center mx-auto"
                      >
                        <ShieldAlert className="w-3 h-3 mr-1.5" /> {r.violationCount} VIOLATIONS
                      </button>
                    ) : (
                      <span className="px-4 py-1.5 bg-green-50 text-green-600 text-xs font-black rounded-full flex items-center justify-center mx-auto w-fit">
                         <CheckCircle className="w-3 h-3 mr-1.5" /> SECURE
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-5 text-right">
                    <button 
                      onClick={() => handleDeleteAttempt(r._id)}
                      className="text-gray-400 hover:text-red-500 p-2 rounded-lg hover:bg-red-50 transition"
                      title="Reset/Delete Attempt"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
              {sortedResults.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center">
                        <Loader2 className="w-12 h-12 text-gray-200 mb-4" />
                        <p className="text-gray-400 font-bold">No results found yet.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Malpractice Detail Modal */}
      {selectedMalpractice && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="bg-red-600 p-6 text-white flex justify-between items-center">
              <h2 className="text-xl font-bold flex items-center"><ShieldAlert className="mr-2" /> Malpractice Log</h2>
              <button onClick={() => setSelectedMalpractice(null)} className="hover:bg-white/20 p-2 rounded-full transition"><XCircle /></button>
            </div>
            <div className="p-8">
              <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-100">
                <div>
                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Student</p>
                    <p className="text-xl font-black text-gray-900">{selectedMalpractice.student.name}</p>
                </div>
                <div className="text-right">
                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Violation Count</p>
                    <p className="text-2xl font-black text-red-600">{selectedMalpractice.violationCount}</p>
                </div>
              </div>

              <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                {selectedMalpractice.malpracticeLogs?.length > 0 ? (
                    selectedMalpractice.malpracticeLogs.map((log, idx) => (
                        <div key={idx} className="flex items-start bg-gray-50 p-4 rounded-2xl border border-gray-100">
                            <div className="bg-red-100 text-red-600 p-2 rounded-xl mr-4">
                                <ShieldAlert className="w-4 h-4" />
                            </div>
                            <div>
                                <p className="font-bold text-gray-900 capitalize">{log.type?.replace('_', ' ')}</p>
                                <p className="text-xs text-gray-500 font-medium">{new Date(log.timestamp).toLocaleString()}</p>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="text-center text-gray-400 italic py-10">No detailed logs available.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
