import { Link } from 'react-router-dom';
import { BookOpen, Users, Award, PlayCircle } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex-grow flex flex-col bg-white">
      {/* Hero Section */}
      <div className="bg-indigo-50 py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 tracking-tight mb-6">
            Welcome to <span className="text-indigo-600">LMS Pro</span>
          </h1>
          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
            The next generation Learning Management System. Engage in live classes, take interactive tests, and track your progress in real-time.
          </p>
          <div className="flex justify-center space-x-4">
            <Link to="/register" className="bg-indigo-600 text-white px-8 py-3 rounded-lg font-semibold text-lg hover:bg-indigo-700 transition shadow-lg hover:shadow-xl">
              Get Started
            </Link>
            <Link to="/courses" className="bg-white text-indigo-600 border border-indigo-200 px-8 py-3 rounded-lg font-semibold text-lg hover:bg-indigo-50 transition shadow-sm">
              Browse Courses
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900">Why Choose LMS Pro?</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-12">
          <div className="text-center">
            <div className="bg-indigo-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <PlayCircle className="h-8 w-8 text-indigo-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Interactive Learning</h3>
            <p className="text-gray-600">Join real-time live classes with socket-based chat and instant interactions.</p>
          </div>
          <div className="text-center">
            <div className="bg-green-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Award className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Instant Assessments</h3>
            <p className="text-gray-600">Take MCQ tests and get your results auto-evaluated instantly after submission.</p>
          </div>
          <div className="text-center">
            <div className="bg-purple-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Users className="h-8 w-8 text-purple-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Role-Based Access</h3>
            <p className="text-gray-600">Dedicated dashboards for Students, Faculty, and Admins to manage everything easily.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
