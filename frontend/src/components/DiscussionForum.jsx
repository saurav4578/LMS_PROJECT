import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { AuthContext } from '../contexts/AuthContext';
import { MessageSquare, Send, Heart, Reply, UserCircle } from 'lucide-react';

export default function DiscussionForum({ courseId }) {
  const { user } = useContext(AuthContext);
  const [discussions, setDiscussions] = useState([]);
  const [newQuestion, setNewQuestion] = useState('');
  const [replyText, setReplyText] = useState('');
  const [activeReply, setActiveReply] = useState(null); // ID of the thread being replied to

  const fetchDiscussions = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/discussions/${courseId}`);
      setDiscussions(res.data.data);
    } catch (err) {
      toast.error('Failed to load discussions');
    }
  };

  useEffect(() => {
    if (courseId) {
      fetchDiscussions();
    }
  }, [courseId]);

  const handlePostQuestion = async (e) => {
    e.preventDefault();
    if (!newQuestion.trim()) return;
    try {
      await axios.post(`http://localhost:5000/api/discussions/${courseId}`, { text: newQuestion });
      setNewQuestion('');
      fetchDiscussions();
      toast.success('Question posted');
    } catch (err) {
      toast.error('Failed to post question');
    }
  };

  const handleReply = async (e, threadId) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    try {
      await axios.post(`http://localhost:5000/api/discussions/${threadId}/reply`, { text: replyText });
      setReplyText('');
      setActiveReply(null);
      fetchDiscussions();
      toast.success('Reply posted');
    } catch (err) {
      toast.error('Failed to post reply');
    }
  };

  const handleLike = async (threadId, replyId = null) => {
    try {
      await axios.put(`http://localhost:5000/api/discussions/${threadId}/like`, { replyId });
      fetchDiscussions();
    } catch (err) {
      toast.error('Failed to update like');
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mt-8">
      <div className="bg-indigo-600 px-6 py-4 flex items-center text-white">
        <MessageSquare className="w-5 h-5 mr-2" />
        <h2 className="text-xl font-bold">Course Discussion Forum</h2>
      </div>

      <div className="p-6">
        {/* Post new question */}
        <form onSubmit={handlePostQuestion} className="mb-8 relative">
          <textarea 
            rows="3" 
            placeholder="Ask a question or share something with the class..."
            value={newQuestion}
            onChange={(e) => setNewQuestion(e.target.value)}
            className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm resize-none"
          ></textarea>
          <div className="absolute bottom-3 right-3">
            <button 
              type="submit" 
              className="bg-indigo-600 text-white px-4 py-1.5 rounded-lg font-medium text-sm hover:bg-indigo-700 flex items-center transition shadow-sm"
              disabled={!newQuestion.trim()}
            >
              <Send className="w-4 h-4 mr-1.5" /> Post
            </button>
          </div>
        </form>

        {/* Discussion List */}
        <div className="space-y-6">
          {discussions.length === 0 ? (
            <p className="text-center text-gray-500 py-4 italic">No discussions yet. Be the first to start a conversation!</p>
          ) : (
            discussions.map(thread => (
              <div key={thread._id} className="border border-gray-100 rounded-xl p-5 shadow-sm bg-gray-50">
                {/* Main Thread */}
                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <div className="w-10 h-10 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center font-bold">
                      {thread.author?.name?.charAt(0).toUpperCase()}
                    </div>
                  </div>
                  <div className="ml-4 flex-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <span className="font-bold text-gray-900">{thread.author?.name}</span>
                        {thread.author?.role === 'faculty' && (
                          <span className="ml-2 text-[10px] bg-indigo-600 text-white px-2 py-0.5 rounded-full font-bold uppercase">Instructor</span>
                        )}
                        <span className="ml-2 text-xs text-gray-400">{new Date(thread.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <p className="mt-2 text-gray-800 whitespace-pre-wrap">{thread.text}</p>
                    
                    <div className="mt-3 flex items-center space-x-4 text-sm text-gray-500">
                      <button onClick={() => handleLike(thread._id)} className="flex items-center hover:text-indigo-600 transition group">
                        <Heart className={`w-4 h-4 mr-1 ${thread.likes.includes(user?._id) ? 'fill-indigo-600 text-indigo-600' : 'group-hover:text-indigo-600'}`} />
                        <span>{thread.likes.length}</span>
                      </button>
                      <button onClick={() => setActiveReply(activeReply === thread._id ? null : thread._id)} className="flex items-center hover:text-indigo-600 transition">
                        <Reply className="w-4 h-4 mr-1" />
                        Reply
                      </button>
                    </div>

                    {/* Replies Section */}
                    {thread.replies.length > 0 && (
                      <div className="mt-4 space-y-4 border-l-2 border-indigo-100 pl-4">
                        {thread.replies.map(reply => (
                          <div key={reply._id} className="flex items-start">
                            <div className="w-8 h-8 bg-gray-200 text-gray-600 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
                              {reply.author?.name?.charAt(0).toUpperCase()}
                            </div>
                            <div className="ml-3 bg-white p-3 rounded-lg border border-gray-100 w-full shadow-sm">
                              <div className="flex justify-between items-center mb-1">
                                <div className="flex items-center">
                                  <span className="font-semibold text-gray-900 text-sm">{reply.author?.name}</span>
                                  {reply.author?.role === 'faculty' && (
                                    <span className="ml-2 text-[10px] bg-indigo-600 text-white px-2 py-0.5 rounded-full font-bold uppercase">Instructor</span>
                                  )}
                                </div>
                                <span className="text-xs text-gray-400">{new Date(reply.createdAt).toLocaleDateString()}</span>
                              </div>
                              <p className="text-gray-800 text-sm">{reply.text}</p>
                              <div className="mt-2 flex justify-start">
                                <button onClick={() => handleLike(thread._id, reply._id)} className="flex items-center text-xs text-gray-400 hover:text-indigo-600 transition group">
                                  <Heart className={`w-3 h-3 mr-1 ${reply.likes.includes(user?._id) ? 'fill-indigo-600 text-indigo-600' : ''}`} />
                                  <span>{reply.likes.length}</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Reply Input Box */}
                    {activeReply === thread._id && (
                      <form onSubmit={(e) => handleReply(e, thread._id)} className="mt-4 relative">
                        <input 
                          type="text" 
                          placeholder="Write a reply..."
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          className="w-full border border-gray-300 rounded-full px-4 py-2 pr-20 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm shadow-sm"
                          autoFocus
                        />
                        <button 
                          type="submit" 
                          className="absolute right-1 top-1 bg-indigo-600 text-white px-3 py-1 rounded-full text-xs font-semibold hover:bg-indigo-700 transition h-8"
                          disabled={!replyText.trim()}
                        >
                          Reply
                        </button>
                      </form>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
