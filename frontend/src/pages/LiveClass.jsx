import { useEffect, useState, useContext, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import toast from 'react-hot-toast';
import { AuthContext } from '../contexts/AuthContext';
import { Send, Users, Video, VideoOff, Mic, MicOff, Camera } from 'lucide-react';

let socket;

export default function LiveClass() {
  const { roomId } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  
  // Media states
  const [stream, setStream] = useState(null);
  const [isVideoOn, setIsVideoOn] = useState(false);
  const [isAudioOn, setIsAudioOn] = useState(false);
  const videoRef = useRef(null);

  useEffect(() => {
    socket = io('http://localhost:5000');

    socket.emit('join-live', roomId);

    socket.on('receive-message', (data) => {
      setMessages((prev) => [...prev, data]);
    });

    socket.on('user-joined', (id) => {
      // toast.success(`A user joined`);
    });

    return () => {
      socket.disconnect();
    };
  }, [roomId]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (messageInput.trim()) {
      socket.emit('send-message', { roomId, message: messageInput, senderName: user.name });
      setMessageInput('');
    }
  };

  const toggleMedia = async () => {
    if (stream) {
      // Turn off
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
      setIsVideoOn(false);
      setIsAudioOn(false);
      if (videoRef.current) videoRef.current.srcObject = null;
    } else {
      // Turn on
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setStream(mediaStream);
        setIsVideoOn(true);
        setIsAudioOn(true);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (err) {
        toast.error("Failed to access camera and microphone");
      }
    }
  };

  const toggleVideo = () => {
    if (stream) {
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOn(videoTrack.enabled);
      }
    }
  };

  const toggleAudio = () => {
    if (stream) {
      const audioTrack = stream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioOn(audioTrack.enabled);
      }
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-gray-900">
      <div className="flex-grow flex flex-col md:flex-row overflow-hidden">
        {/* Video Area */}
        <div className="flex-grow flex flex-col bg-black relative">
          <div className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1 rounded-md text-sm font-bold flex items-center z-10 shadow-lg">
            <span className="w-2 h-2 rounded-full bg-white animate-pulse mr-2"></span> LIVE
          </div>
          
          <div className="flex-grow flex items-center justify-center relative overflow-hidden">
            {stream ? (
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                muted // Mute local playback to avoid echo
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex flex-col items-center text-gray-500">
                <VideoOff className="h-24 w-24 mb-4 opacity-30" />
                <p className="text-xl font-medium">Camera is off</p>
                <button onClick={toggleMedia} className="mt-6 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-full font-medium transition flex items-center">
                  <Camera className="w-5 h-5 mr-2" /> Start Camera & Mic
                </button>
              </div>
            )}
          </div>

          <div className="h-20 bg-gray-900 border-t border-gray-800 flex items-center justify-between px-8">
            <div className="flex items-center space-x-4">
              {stream && (
                <>
                  <button 
                    onClick={toggleAudio} 
                    className={`p-3 rounded-full flex items-center justify-center transition ${isAudioOn ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-red-600 hover:bg-red-700 text-white'}`}
                    title={isAudioOn ? "Mute" : "Unmute"}
                  >
                    {isAudioOn ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
                  </button>
                  <button 
                    onClick={toggleVideo} 
                    className={`p-3 rounded-full flex items-center justify-center transition ${isVideoOn ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-red-600 hover:bg-red-700 text-white'}`}
                    title={isVideoOn ? "Stop Video" : "Start Video"}
                  >
                    {isVideoOn ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
                  </button>
                  <button 
                    onClick={toggleMedia} 
                    className="p-3 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center transition"
                    title="Stop Everything"
                  >
                    Stop Broadcast
                  </button>
                </>
              )}
            </div>
            <button onClick={() => {
              if (stream) stream.getTracks().forEach(t => t.stop());
              navigate(-1);
            }} className="bg-red-600 text-white px-6 py-2.5 rounded-lg font-bold hover:bg-red-700 transition shadow-md">
              Leave Class
            </button>
          </div>
        </div>

        {/* Chat Area */}
        <div className="w-full md:w-80 lg:w-96 bg-white flex flex-col border-l border-gray-200 h-64 md:h-auto">
          <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center">
            <Users className="h-5 w-5 text-gray-500 mr-2" />
            <h3 className="font-semibold text-gray-800">Live Chat</h3>
          </div>
          
          <div className="flex-grow overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <p className="text-center text-gray-400 text-sm italic mt-10">No messages yet. Say hello!</p>
            ) : (
              messages.map((msg, idx) => (
                <div key={idx} className={`flex flex-col ${msg.senderName === user.name ? 'items-end' : 'items-start'}`}>
                  <span className="text-xs text-gray-500 mb-1">{msg.senderName}</span>
                  <div className={`px-4 py-2 rounded-2xl max-w-[85%] ${msg.senderName === user.name ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-gray-100 text-gray-800 rounded-bl-none'}`}>
                    {msg.message}
                  </div>
                </div>
              ))
            )}
          </div>
          
          <div className="p-3 border-t border-gray-200 bg-white">
            <form onSubmit={sendMessage} className="flex">
              <input
                type="text"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                placeholder="Type a message..."
                className="flex-grow border border-gray-300 rounded-l-lg px-4 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-r-lg hover:bg-indigo-700 transition flex items-center justify-center">
                <Send className="h-5 w-5" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
