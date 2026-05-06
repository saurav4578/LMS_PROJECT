import { useEffect, useState, useRef, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { AuthContext } from '../contexts/AuthContext';
import { 
  CheckCircle, AlertCircle, Clock, XCircle, ArrowRight, 
  ChevronRight, ChevronLeft, ShieldAlert, Zap, Maximize
} from 'lucide-react';

const Loader2 = ({ className }) => (
  <div className={`animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite] ${className}`} role="status"></div>
);

export default function TestAttempt() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  useEffect(() => {
    if (user && user.role !== 'student') {
        toast.error("Teachers can only review tests via PDF!");
        navigate(-1);
    }
  }, [user, navigate]);
  
  const [test, setTest] = useState(null);
  const [isStarted, setIsStarted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [result, setResult] = useState(null);
  const [correctAnswers, setCorrectAnswers] = useState(null);
  
  const [timeLeft, setTimeLeft] = useState(0);
  const [qTimeLeft, setQTimeLeft] = useState(0);
  const [malpracticeLogs, setMalpracticeLogs] = useState([]);
  const [warningCount, setWarningCount] = useState(0);
  
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const timerRef = useRef(null);

  useEffect(() => {
    const fetchTest = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/tests/${id}`);
        const testData = res.data.data;
        setTest(testData);

        let processedQs = [...testData.questions].map((q, i) => ({ ...q, originalIndex: i }));
        if (testData.shuffleQuestions && !testData.isAdaptive) {
          processedQs = processedQs.sort(() => Math.random() - 0.5);
        }
        
        setQuestions(processedQs);
        setAnswers(new Array(processedQs.length).fill(null));

        try {
          const resResult = await axios.get(`http://localhost:5000/api/tests/${id}/result`);
          if (resResult.data.data) {
            setResult(resResult.data.data);
          }
        } catch (e) {}
      } catch (err) {
        toast.error('Failed to load test');
      } finally {
        setLoading(false);
      }
    };
    fetchTest();
  }, [id]);

  // Security: Tracking
  useEffect(() => {
    if (isStarted && !result && !isSubmitting) {
      const addViolation = (type) => {
        setMalpracticeLogs(prev => [...prev, { type, timestamp: new Date() }]);
        setWarningCount(prev => {
          const next = prev + 1;
          if (next >= 5) {
            toast.error("Maximum violations reached! Auto-submitting test.");
            handleSubmit(next, [...malpracticeLogs, { type, timestamp: new Date() }]);
            return next;
          }
          toast.error(`Violation Detected: ${type.replace('_', ' ')}. Warning ${next}/5`);
          return next;
        });
      };

      const handleVisibilityChange = () => {
        if (document.hidden) addViolation('tab_switch');
      };

      const handleBlur = () => {
        addViolation('window_blur');
      };

      const handleFullscreenChange = () => {
        if (!document.fullscreenElement && isStarted && !result && !isSubmitting) {
          addViolation('fullscreen_exit');
        }
      };

      const preventDefault = (e) => e.preventDefault();
      
      document.addEventListener("visibilitychange", handleVisibilityChange);
      window.addEventListener("blur", handleBlur);
      document.addEventListener("fullscreenchange", handleFullscreenChange);
      document.addEventListener("contextmenu", preventDefault);
      document.addEventListener("copy", preventDefault);
      document.addEventListener("paste", preventDefault);

      return () => {
        document.removeEventListener("visibilitychange", handleVisibilityChange);
        window.removeEventListener("blur", handleBlur);
        document.removeEventListener("fullscreenchange", handleFullscreenChange);
        document.removeEventListener("contextmenu", preventDefault);
        document.removeEventListener("copy", preventDefault);
        document.removeEventListener("paste", preventDefault);
      };
    }
  }, [isStarted, result, isSubmitting]);

  // Timers
  useEffect(() => {
    if (isStarted && !result && !isSubmitting) {
      timerRef.current = setInterval(() => {
        if (test.duration > 0) {
          setTimeLeft(prev => {
            if (prev <= 1) {
              clearInterval(timerRef.current);
              handleSubmit();
              return 0;
            }
            return prev - 1;
          });
        }

        const currentQ = questions[currentIndex];
        if (currentQ?.timeLimit > 0) {
          setQTimeLeft(prev => {
            if (prev <= 1) {
              handleNext();
              return 0;
            }
            return prev - 1;
          });
        }
      }, 1000);

      return () => clearInterval(timerRef.current);
    }
  }, [isStarted, currentIndex, result, isSubmitting, questions]);

  const startTest = () => {
    const elem = document.documentElement;
    if (elem.requestFullscreen) {
      elem.requestFullscreen().catch(() => {
        toast.error("Fullscreen is required!");
      });
    } else if (elem.webkitRequestFullscreen) {
      elem.webkitRequestFullscreen();
    }
    
    setIsStarted(true);
    if (test.duration > 0) setTimeLeft(test.duration * 60);
    const firstQ = questions[0];
    if (firstQ?.timeLimit > 0) setQTimeLeft(firstQ.timeLimit);
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      const nextQ = questions[nextIndex];
      if (nextQ?.timeLimit > 0) setQTimeLeft(nextQ.timeLimit);
      else setQTimeLeft(0);
    } else {
      handleSubmit();
    }
  };

  const handlePrev = () => {
    if (test.isAdaptive) return;
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setQTimeLeft(0);
    }
  };

  const handleOptionSelect = (oIndex) => {
    const newAnswers = [...answers];
    newAnswers[currentIndex] = oIndex;
    setAnswers(newAnswers);
  };

  const handleSubmit = async (finalViolationCount, finalLogs) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    
    if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
    }

    const finalAnswers = new Array(test.questions.length).fill(null);
    questions.forEach((q, idx) => {
      finalAnswers[q.originalIndex] = answers[idx];
    });

    try {
      const res = await axios.post(`http://localhost:5000/api/tests/${id}/attempt`, { 
        answers: finalAnswers,
        malpracticeLogs: finalLogs || malpracticeLogs,
        violationCount: finalViolationCount !== undefined ? finalViolationCount : warningCount
      });
      setResult(res.data.data.result);
      setCorrectAnswers(res.data.data.correctAnswers);
      toast.success('Test submitted successfully!');
    } catch (err) {
      toast.error('Submission failed');
      setIsSubmitting(false);
    }
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  if (loading) return <div className="flex items-center justify-center h-screen"><Loader2 className="animate-spin text-indigo-600 w-12 h-12" /></div>;

  const currentQ = questions[currentIndex];

  // 4. ALREADY ATTEMPTED SCREEN (When loading past result)
  if (result && !isStarted && !isSubmitting) {
    const isPublished = test?.resultsPublished;
    return (
      <div className="max-w-4xl mx-auto px-4 py-10 w-full">
        <div className="bg-white p-10 rounded-3xl shadow-xl border border-gray-100 text-center">
            <div className="w-20 h-20 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-6 text-indigo-600">
                <CheckCircle className="w-10 h-10" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Test Already Attempted</h1>
            <p className="text-gray-500 mb-8">{test?.title}</p>

            {isPublished ? (
                <div className="grid grid-cols-2 gap-6 bg-gray-50 p-8 rounded-3xl mb-8">
                    <div>
                        <p className="text-xs text-gray-500 font-bold uppercase mb-1">Your Score</p>
                        <p className="text-4xl font-black text-indigo-600">{result.score} / {result.total}</p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 font-bold uppercase mb-1">Percentage</p>
                        <p className={`text-4xl font-black ${result.percentage >= 50 ? 'text-green-600' : 'text-red-600'}`}>{Math.round(result.percentage)}%</p>
                    </div>
                </div>
            ) : (
                <div className="bg-indigo-50 p-8 rounded-3xl mb-8 border border-indigo-100">
                    <p className="text-indigo-700 font-bold text-lg">Response Already Recorded</p>
                    <p className="text-indigo-500 text-sm mt-2">You can only attempt this test once. Results will be visible after the instructor publishes them.</p>
                </div>
            )}
            
            <button onClick={() => navigate(-1)} className="px-8 py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-black transition">Back to Course</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* 1. START SCREEN */}
      {!isStarted && !result && (
        <div className="max-w-2xl mx-auto px-4 py-16 w-full">
          <div className="bg-white p-10 rounded-3xl shadow-xl border border-gray-100 text-center">
            <div className="w-20 h-20 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <ShieldAlert className="w-10 h-10 text-red-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{test.title}</h1>
            <div className="bg-red-50 p-6 rounded-2xl border border-red-100 text-left mb-8 space-y-3">
              <h3 className="font-bold text-red-800 flex items-center"><ShieldAlert className="w-5 h-5 mr-2" /> SECURE EXAM RULES:</h3>
              <ul className="text-sm text-red-700 space-y-2 list-disc ml-5">
                <li>Test will run in <b>Fullscreen Mode</b>.</li>
                <li>Tab switching is <b>STRICTLY PROHIBITED</b>.</li>
                <li>5 violations = <b>AUTO-SUBMISSION</b>.</li>
              </ul>
            </div>
            <button onClick={startTest} className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all flex items-center justify-center">
              <Maximize className="w-5 h-5 mr-2" /> Enter Secure Exam Mode
            </button>
          </div>
        </div>
      )}

      {/* 2. RESULTS SCREEN */}
      {result && correctAnswers && (
        <div className="max-w-4xl mx-auto px-4 py-10 w-full">
          <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 text-center mb-8">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Exam Completed</h1>
            <p className="text-gray-500 mb-8">{test.title}</p>
            
            {test.resultsPublished ? (
              <div className="grid grid-cols-3 gap-6 bg-gray-50 p-8 rounded-3xl mb-8">
                <div>
                  <p className="text-xs text-gray-500 font-bold uppercase mb-1">Score</p>
                  <p className="text-4xl font-black text-indigo-600">{result.score}</p>
                </div>
                <div className="border-x border-gray-200">
                  <p className="text-xs text-gray-500 font-bold uppercase mb-1">Percentage</p>
                  <p className={`text-4xl font-black ${result.percentage >= 50 ? 'text-green-600' : 'text-red-600'}`}>{Math.round(result.percentage)}%</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-bold uppercase mb-1">Violations</p>
                  <p className={`text-4xl font-black ${result.violationCount > 0 ? 'text-red-600' : 'text-green-600'}`}>{result.violationCount}</p>
                </div>
              </div>
            ) : (
                <div className="bg-indigo-50 p-10 rounded-3xl mb-8 border border-indigo-100">
                    <AlertCircle className="w-12 h-12 text-indigo-600 mx-auto mb-4" />
                    <p className="text-indigo-900 font-bold text-xl">Results Pending Evaluation</p>
                    <p className="text-indigo-600 text-sm mt-2 max-w-sm mx-auto">Your responses have been saved. The instructor will notify you once the results and rankings are officially published.</p>
                </div>
            )}
            <button onClick={() => navigate(-1)} className="px-8 py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-black transition">Return to Course</button>
          </div>

          {test.resultsPublished && (
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Detailed Review</h3>
              {questions.map((q, qIdx) => {
                const studentAns = answers[qIdx];
                const correctAns = correctAnswers[q.originalIndex];
                const isCorrect = studentAns === correctAns;
                return (
                  <div key={qIdx} className={`bg-white p-6 rounded-3xl border-2 transition ${isCorrect ? 'border-green-100' : studentAns === null ? 'border-gray-100' : 'border-red-100'}`}>
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="text-lg font-bold text-gray-800"><span className="text-gray-400 mr-2">{qIdx+1}.</span> {q.questionText}</h3>
                      {isCorrect ? <CheckCircle className="text-green-500 w-6 h-6" /> : studentAns !== null ? <XCircle className="text-red-500 w-6 h-6" /> : <AlertCircle className="text-gray-400 w-6 h-6" />}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {q.options.map((opt, oIdx) => (
                        <div key={oIdx} className={`p-4 rounded-2xl border-2 text-sm font-medium ${oIdx === correctAns ? 'bg-green-50 border-green-200 text-green-700' : oIdx === studentAns ? 'bg-red-50 border-red-200 text-red-700' : 'bg-gray-50 border-gray-100 text-gray-400'}`}>
                          {opt}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 3. ATTEMPT SCREEN */}
      {isStarted && !result && (
        <div className="flex-1 flex flex-col py-10 px-4">
          <div className="max-w-4xl mx-auto w-full">
            {/* Header */}
            <div className="bg-white p-6 rounded-3xl shadow-lg border border-gray-100 mb-6 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center space-x-4">
                <div className="bg-red-600 text-white px-4 py-2 rounded-2xl font-bold text-sm flex items-center">
                  <ShieldAlert className="w-4 h-4 mr-2" /> SECURE MODE
                </div>
                <h2 className="font-bold text-gray-900">Q {currentIndex + 1} / {questions.length}</h2>
              </div>
              <div className="flex items-center space-x-3">
                {qTimeLeft > 0 && (
                  <div className={`flex items-center px-4 py-2 rounded-2xl font-black text-sm ${qTimeLeft < 10 ? 'bg-red-500 text-white animate-pulse' : 'bg-orange-100 text-orange-700'}`}>
                    <Clock className="w-4 h-4 mr-2" /> {qTimeLeft}s
                  </div>
                )}
                {timeLeft > 0 && (
                  <div className="flex items-center bg-gray-100 text-gray-700 px-4 py-2 rounded-2xl font-black text-sm">
                    <Clock className="w-4 h-4 mr-2" /> {formatTime(timeLeft)}
                  </div>
                )}
                {warningCount > 0 && (
                  <div className="flex items-center bg-red-100 text-red-600 px-3 py-2 rounded-2xl font-black text-xs">
                    VIOLATIONS: {warningCount} / 5
                  </div>
                )}
              </div>
            </div>

            {/* Question Body */}
            <div className="bg-white p-10 rounded-3xl shadow-2xl border border-gray-100 mb-8 min-h-[450px] flex flex-col relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-red-500"></div>
              <div className="mb-8">
                <span className="px-4 py-1.5 bg-indigo-50 text-indigo-700 text-xs font-black rounded-full uppercase tracking-widest">{currentQ?.difficulty}</span>
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-12 leading-snug">
                {currentQ?.questionText}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-auto">
                {currentQ?.options.map((opt, oIndex) => (
                  <button
                    key={oIndex}
                    onClick={() => handleOptionSelect(oIndex)}
                    className={`p-6 rounded-2xl border-2 text-left transition-all duration-200 flex items-center group ${answers[currentIndex] === oIndex ? 'border-indigo-600 bg-indigo-50 ring-4 ring-indigo-50' : 'border-gray-100 bg-gray-50 hover:border-indigo-200 hover:bg-white'}`}
                  >
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black mr-4 transition-colors ${answers[currentIndex] === oIndex ? 'bg-indigo-600 text-white' : 'bg-white border text-gray-400 group-hover:text-indigo-400'}`}>
                      {String.fromCharCode(65 + oIndex)}
                    </div>
                    <span className={`text-xl ${answers[currentIndex] === oIndex ? 'text-indigo-900 font-bold' : 'text-gray-700'}`}>{opt}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-between items-center bg-white p-4 rounded-3xl shadow-lg border border-gray-100">
              <button
                onClick={handlePrev}
                disabled={currentIndex === 0 || test.isAdaptive}
                className="flex items-center px-6 py-3 rounded-2xl font-bold text-gray-400 hover:bg-gray-50 disabled:opacity-0 transition"
              >
                <ChevronLeft className="w-5 h-5 mr-2" /> Previous
              </button>
              <button
                onClick={handleNext}
                disabled={isSubmitting}
                className="flex items-center px-10 py-4 bg-gray-900 text-white rounded-2xl font-black shadow-xl hover:bg-black transition transform active:scale-95"
              >
                {currentIndex === questions.length - 1 ? 'FINISH EXAM' : 'SAVE & NEXT'} 
                {currentIndex === questions.length - 1 ? <CheckCircle className="w-5 h-5 ml-2 text-green-400" /> : <ChevronRight className="w-5 h-5 ml-2" />}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
