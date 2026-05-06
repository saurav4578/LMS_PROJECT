import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { MessageCircle, X, Send, Bot, User, Loader2 } from 'lucide-react';

export default function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, text: "Hello! I'm your AI teaching assistant. How can I help you today?", isBot: true }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = { id: Date.now(), text: input, isBot: false };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const res = await axios.post('http://localhost:5000/api/ai/chat', { 
        message: userMsg.text,
        history: messages // Sending history for context
      });
      
      const botMsg = { id: Date.now() + 1, text: res.data.reply || res.data.message, isBot: true };
      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      const errorMsg = { id: Date.now() + 1, text: "Sorry, I'm having trouble connecting to my brain right now.", isBot: true };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      {/* Chat Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-indigo-600 text-white rounded-full flex items-center justify-center shadow-2xl hover:bg-indigo-700 transition-transform hover:scale-105 z-50"
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-80 md:w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden z-50 transform transition-all duration-300 ease-in-out">
          {/* Header */}
          <div className="bg-indigo-600 p-4 text-white flex items-center shadow-sm">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center mr-3">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold">AI Assistant</h3>
              <p className="text-xs text-indigo-100 flex items-center">
                <span className="w-2 h-2 bg-green-400 rounded-full mr-1.5 animate-pulse"></span>
                Online
              </p>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-4 h-[400px] overflow-y-auto bg-gray-50 flex flex-col space-y-4 custom-scrollbar">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.isBot ? 'justify-start' : 'justify-end'}`}>
                <div className={`flex items-end max-w-[85%] ${msg.isBot ? 'flex-row' : 'flex-row-reverse'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.isBot ? 'bg-indigo-100 text-indigo-600 mr-2' : 'bg-gray-200 text-gray-600 ml-2'}`}>
                    {msg.isBot ? <Bot className="w-5 h-5" /> : <User className="w-5 h-5" />}
                  </div>
                  <div className={`px-4 py-2.5 rounded-2xl text-sm whitespace-pre-wrap ${msg.isBot ? 'bg-white border border-gray-200 text-gray-800 rounded-bl-none' : 'bg-indigo-600 text-white rounded-br-none shadow-sm'}`}>
                    {msg.text}
                  </div>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className="flex items-end max-w-[85%] flex-row">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 mr-2 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-5 h-5" />
                  </div>
                  <div className="px-4 py-3 bg-white border border-gray-200 text-gray-800 rounded-2xl rounded-bl-none flex space-x-1.5 items-center h-10">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-3 bg-white border-t border-gray-100">
            <form onSubmit={handleSend} className="relative flex items-center">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask me anything..."
                className="w-full bg-gray-100 border-transparent rounded-full pl-4 pr-12 py-3 text-sm focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all outline-none"
                disabled={isTyping}
              />
              <button 
                type="submit" 
                disabled={!input.trim() || isTyping}
                className={`absolute right-1 w-10 h-10 flex items-center justify-center rounded-full transition ${input.trim() && !isTyping ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-transparent text-gray-400'}`}
              >
                {isTyping ? <Loader2 className="w-5 h-5 animate-spin text-indigo-600" /> : <Send className="w-5 h-5" />}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
