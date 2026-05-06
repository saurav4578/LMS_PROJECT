import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { AuthContext } from '../contexts/AuthContext';

import { Mail } from 'lucide-react';

const VerifyEmail = () => {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const [cooldown, setCooldown] = useState(0);

  const navigate = useNavigate();
  const { user, fetchUser } = useContext(AuthContext);

  useEffect(() => {
    if (user?.isVerified) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  useEffect(() => {
    if (timeLeft > 0) {
      const timerId = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timerId);
    }
  }, [timeLeft]);

  useEffect(() => {
    if (cooldown > 0) {
      const timerId = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timerId);
    }
  }, [cooldown]);

  const handleVerify = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) {
      return toast.error('OTP must be 6 digits');
    }
    
    setLoading(true);
    try {
      await axios.post('http://localhost:5000/api/auth/verify-email', { otpCode: otp });
      toast.success('Email Verified Successfully');
      await fetchUser(); // Updates the user context, triggers redirect to dashboard
    } catch (error) {
      toast.error(error.response?.data?.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0) return;
    
    setResending(true);
    try {
      await axios.post('http://localhost:5000/api/auth/resend-otp');
      toast.success('OTP sent successfully');
      setTimeLeft(300); // Reset 5 min timer
      setCooldown(30);  // 30 sec cooldown
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to resend OTP');
    } finally {
      setResending(false);
    }
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-lg border border-gray-100">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-100 text-indigo-600 mb-4">
            <Mail className="h-8 w-8" />
          </div>
          <h2 className="mt-2 text-center text-3xl font-extrabold text-gray-900">Verify Your Email</h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            We sent a 6-digit code to <span className="font-semibold">{user?.email}</span>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleVerify}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="otp" className="sr-only">OTP Code</label>
              <input
                id="otp"
                name="otp"
                type="text"
                required
                maxLength="6"
                className="appearance-none rounded-md relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-lg text-center tracking-[0.5em] font-mono"
                placeholder="000000"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))} // only numbers
              />
            </div>
          </div>

          <div className="flex items-center justify-between mt-4 text-sm">
            <span className={timeLeft > 0 ? 'text-green-600' : 'text-red-600'}>
              {timeLeft > 0 ? `Code expires in: ${formatTime(timeLeft)}` : 'Code expired'}
            </span>
            <button
              type="button"
              onClick={handleResend}
              disabled={resending || cooldown > 0}
              className="text-indigo-600 hover:text-indigo-500 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {resending ? 'Sending...' : cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend Code'}
            </button>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-70 transition-all"
            >
              {loading ? 'Verifying...' : 'Verify Email'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VerifyEmail;
