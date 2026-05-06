import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useContext } from 'react';
import { AuthProvider, AuthContext } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Courses from './pages/Courses';
import CourseDetail from './pages/CourseDetail';
import LiveClass from './pages/LiveClass';
import TestAttempt from './pages/TestAttempt';
import TestCreate from './pages/TestCreate';
import TestResults from './pages/TestResults';
import StudentAnalytics from './pages/StudentAnalytics';
import FacultyAnalytics from './pages/FacultyAnalytics';
import AIChatbot from './components/AIChatbot';

import VerifyEmail from './pages/VerifyEmail';
import Profile from './pages/Profile';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (!user.isVerified && window.location.pathname !== '/verify-email') return <Navigate to="/verify-email" />;
  return children;
};

const AppRoutes = () => {
  const { user } = useContext(AuthContext);
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <div className="flex-grow flex flex-col">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/courses" element={<PrivateRoute><Courses /></PrivateRoute>} />
          <Route path="/course/:id" element={<PrivateRoute><CourseDetail /></PrivateRoute>} />
          <Route path="/live/:roomId" element={<PrivateRoute><LiveClass /></PrivateRoute>} />
          <Route path="/test/:id" element={<PrivateRoute><TestAttempt /></PrivateRoute>} />
          <Route path="/test-create/:moduleId" element={<PrivateRoute><TestCreate /></PrivateRoute>} />
          <Route path="/test-results/:testId" element={<PrivateRoute><TestResults /></PrivateRoute>} />
          <Route path="/analytics/:courseId?" element={<PrivateRoute><StudentAnalytics /></PrivateRoute>} />
          <Route path="/faculty/analytics/:courseId" element={<PrivateRoute><FacultyAnalytics /></PrivateRoute>} />
          <Route path="/verify-email" element={<PrivateRoute><VerifyEmail /></PrivateRoute>} />
          <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
        </Routes>
        {user && <AIChatbot />}
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
        <Toaster position="top-right" />
      </Router>
    </AuthProvider>
  );
}

export default App;
