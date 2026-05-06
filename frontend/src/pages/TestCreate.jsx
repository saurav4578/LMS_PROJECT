import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Plus, Trash2, Save, ArrowLeft } from 'lucide-react';

export default function TestCreate() {
  const { moduleId } = useParams();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [duration, setDuration] = useState(0);
  const [negativeMarking, setNegativeMarking] = useState(0);
  const [shuffleQuestions, setShuffleQuestions] = useState(true);
  const [isAdaptive, setIsAdaptive] = useState(false);
  const [questions, setQuestions] = useState([
    { questionText: '', options: ['', '', '', ''], correctAnswerIndex: 0, marks: 1, difficulty: 'medium', timeLimit: 0 }
  ]);

  const handleAddQuestion = () => {
    setQuestions([...questions, { questionText: '', options: ['', '', '', ''], correctAnswerIndex: 0, marks: 1, difficulty: 'medium', timeLimit: 0 }]);
  };

  const handleRemoveQuestion = (index) => {
    if (questions.length === 1) return toast.error("Test must have at least 1 question");
    const newQ = [...questions];
    newQ.splice(index, 1);
    setQuestions(newQ);
  };

  const handleQuestionChange = (index, field, value) => {
    const newQ = [...questions];
    newQ[index][field] = value;
    setQuestions(newQ);
  };

  const handleOptionChange = (qIndex, oIndex, value) => {
    const newQ = [...questions];
    newQ[qIndex].options[oIndex] = value;
    setQuestions(newQ);
  };

  const handleSave = async () => {
    if (!title.trim()) return toast.error("Test title is required");
    
    // Validate
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.questionText.trim()) return toast.error(`Question ${i+1} text is required`);
      if (q.options.some(opt => !opt.trim())) return toast.error(`All options for question ${i+1} must be filled`);
    }

    try {
      await axios.post(`http://localhost:5000/api/tests/${moduleId}`, {
        title, duration, negativeMarking, shuffleQuestions, isAdaptive, questions
      });
      toast.success('Test created successfully!');
      navigate(-1);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save test');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 w-full">
      <button onClick={() => navigate(-1)} className="flex items-center text-indigo-600 mb-6 hover:underline font-medium">
        <ArrowLeft className="w-4 h-4 mr-1" /> Back to Course
      </button>
      
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Create Pro Test</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Test Title</label>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full px-4 py-2 border rounded-lg focus:ring-indigo-500 focus:border-indigo-500 text-lg" placeholder="E.g., Computer Science Final Exam" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Total Duration (Minutes)</label>
            <input type="number" min="0" value={duration} onChange={e => setDuration(parseInt(e.target.value))} className="w-full px-4 py-2 border rounded-lg focus:ring-indigo-500 focus:border-indigo-500" placeholder="0 for no limit" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Negative Marking (e.g. 0.25)</label>
            <input type="number" step="0.25" min="0" value={negativeMarking} onChange={e => setNegativeMarking(parseFloat(e.target.value))} className="w-full px-4 py-2 border rounded-lg focus:ring-indigo-500 focus:border-indigo-500" />
          </div>
          <div className="flex items-center space-x-6 bg-gray-50 p-3 rounded-lg border border-gray-100">
            <label className="flex items-center cursor-pointer">
              <input type="checkbox" checked={shuffleQuestions} onChange={e => setShuffleQuestions(e.target.checked)} className="h-4 w-4 text-indigo-600 rounded border-gray-300" />
              <span className="ml-2 text-sm text-gray-700 font-medium">Shuffle Questions</span>
            </label>
            <label className="flex items-center cursor-pointer">
              <input type="checkbox" checked={isAdaptive} onChange={e => setIsAdaptive(e.target.checked)} className="h-4 w-4 text-indigo-600 rounded border-gray-300" />
              <span className="ml-2 text-sm text-gray-700 font-medium">Adaptive Testing</span>
            </label>
          </div>
        </div>
      </div>

      <div className="space-y-8 mb-8">
        {questions.map((q, qIndex) => (
          <div key={qIndex} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 relative group">
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center">
                <span className="bg-indigo-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold mr-3 shadow-md shadow-indigo-200">
                  {qIndex + 1}
                </span>
                <h3 className="text-xl font-bold text-gray-800">Question Settings</h3>
              </div>
              <button onClick={() => handleRemoveQuestion(qIndex)} className="text-gray-400 hover:text-red-500 p-2 rounded-full hover:bg-red-50 transition">
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">Question Content</label>
              <textarea value={q.questionText} onChange={e => handleQuestionChange(qIndex, 'questionText', e.target.value)} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition outline-none" rows="3" placeholder="Enter your question here..."></textarea>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {q.options.map((opt, oIndex) => (
                <div key={oIndex} className="flex items-center relative group/opt">
                  <span className={`absolute left-3 top-1/2 -translate-y-1/2 font-bold ${q.correctAnswerIndex === oIndex ? 'text-green-600' : 'text-gray-400'}`}>
                    {String.fromCharCode(65 + oIndex)}
                  </span>
                  <input type="text" value={opt} onChange={e => handleOptionChange(qIndex, oIndex, e.target.value)} className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 transition outline-none ${q.correctAnswerIndex === oIndex ? 'border-green-300 bg-green-50/30' : 'border-gray-200 bg-white'}`} placeholder={`Option ${oIndex + 1}`} />
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-gray-50 p-5 rounded-2xl border border-gray-100">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Correct Choice</label>
                <select value={q.correctAnswerIndex} onChange={e => handleQuestionChange(qIndex, 'correctAnswerIndex', parseInt(e.target.value))} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white font-bold text-green-700">
                  {q.options.map((_, idx) => (
                    <option key={idx} value={idx}>Option {String.fromCharCode(65 + idx)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Difficulty</label>
                <select value={q.difficulty} onChange={e => handleQuestionChange(qIndex, 'difficulty', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white font-bold text-indigo-600 capitalize">
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Marks</label>
                  <input type="number" min="1" value={q.marks} onChange={e => handleQuestionChange(qIndex, 'marks', parseInt(e.target.value))} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 font-bold" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Timer (Sec)</label>
                  <input type="number" min="0" value={q.timeLimit} onChange={e => handleQuestionChange(qIndex, 'timeLimit', parseInt(e.target.value))} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 font-bold" placeholder="0 = Global" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white p-6 rounded-2xl shadow-lg border border-gray-100 sticky bottom-6 z-10">
        <button onClick={handleAddQuestion} className="w-full sm:w-auto flex items-center justify-center bg-indigo-50 text-indigo-700 px-6 py-3 rounded-xl font-bold hover:bg-indigo-100 transition">
          <Plus className="w-5 h-5 mr-2" /> Add Question
        </button>
        <button onClick={handleSave} className="w-full sm:w-auto flex items-center justify-center bg-indigo-600 text-white px-10 py-3 rounded-xl font-bold hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all transform hover:-translate-y-1">
          <Save className="w-5 h-5 mr-2" /> Launch Test
        </button>
      </div>
    </div>
  );
}
