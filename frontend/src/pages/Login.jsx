import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { KeyRound, Mail, Eye, EyeOff, Loader2 } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [forgotEmail, setForgotEmail] = useState('');
  const [showForgot, setShowForgot] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);
  
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await axios.post('/api/auth/login', { email, password });
      const { token, user } = response.data;
      
      localStorage.setItem('agriToken', token);
      localStorage.setItem('agriUser', JSON.stringify(user));
      
      // Notify parent route / update app state
      window.dispatchEvent(new Event('authChange'));

      // Redirect depending on Role
      if (user.role === 'Admin') {
        navigate('/admin-dashboard');
      } else if (user.role === 'Equipment Owner') {
        navigate('/owner-dashboard');
      } else {
        navigate('/farmer-dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Pre-fill demo profiles
  const fillDemo = (role) => {
    if (role === 'farmer') {
      setEmail('farmer@agrirent.com');
      setPassword('password123');
    } else if (role === 'owner') {
      setEmail('owner@agrirent.com');
      setPassword('password123');
    } else if (role === 'admin') {
      setEmail('admin@agrirent.com');
      setPassword('password123');
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center bg-slate-50 dark:bg-slate-950 py-12 px-6 relative">
      <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl"></div>

      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-8 shadow-xl relative z-10 space-y-6"
      >
        <div className="text-center space-y-2">
          <span className="text-3xl">🌱</span>
          <h2 className="text-2xl font-bold font-display">Welcome to AgriRent</h2>
          <p className="text-slate-500 text-sm">Log in to rent equipment or manage bookings</p>
        </div>

        {error && (
          <div className="p-3.5 text-sm font-semibold text-red-600 bg-red-50 dark:bg-red-950/20 dark:text-red-400 rounded-xl">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-450" />
              <input 
                type="email"
                placeholder="farmer@agrirent.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-slate-500 uppercase">Password</label>
              <button 
                type="button" 
                onClick={() => setShowForgot(true)}
                className="text-xs font-semibold text-emerald-600 hover:underline focus:outline-none"
              >
                Forgot Password?
              </button>
            </div>
            <div className="relative">
              <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-450" />
              <input 
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-11 pr-11 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-450 hover:text-slate-650"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-3.5 font-bold text-white bg-gradient-to-r from-emerald-600 to-emerald-500 rounded-xl shadow-lg shadow-emerald-500/20 hover:shadow-xl transition-all flex justify-center items-center gap-2"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Log In'}
          </button>
        </form>

        {/* Demo Fast Login Help */}
        <div className="pt-4 border-t border-slate-50 dark:border-slate-800/60 space-y-2">
          <span className="text-xs font-bold text-slate-500 uppercase block text-center">Fast Demo Access</span>
          <div className="grid grid-cols-3 gap-2">
            <button onClick={() => fillDemo('farmer')} className="px-2 py-1.5 text-[11px] font-bold text-emerald-700 bg-emerald-50 dark:bg-emerald-950/20 dark:text-emerald-300 rounded-lg hover:bg-emerald-100 transition-colors">
              🚜 Farmer
            </button>
            <button onClick={() => fillDemo('owner')} className="px-2 py-1.5 text-[11px] font-bold text-amber-700 bg-amber-50 dark:bg-amber-950/20 dark:text-amber-300 rounded-lg hover:bg-amber-100 transition-colors">
              🏡 Owner
            </button>
            <button onClick={() => fillDemo('admin')} className="px-2 py-1.5 text-[11px] font-bold text-blue-700 bg-blue-50 dark:bg-blue-950/20 dark:text-blue-300 rounded-lg hover:bg-blue-100 transition-colors">
              🛡️ Admin
            </button>
          </div>
        </div>

        <p className="text-center text-sm text-slate-500">
          Don't have an account?{' '}
          <Link to="/register" className="font-bold text-emerald-600 hover:underline">
            Register now
          </Link>
        </p>
      </motion.div>

      {/* Forgot Password Modal */}
      {showForgot && (
        <div className="fixed inset-0 bg-slate-950/70 z-50 flex items-center justify-center p-6 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 space-y-6">
            <div className="text-center space-y-1">
              <h3 className="text-lg font-bold">Reset Password</h3>
              <p className="text-xs text-slate-500">Enter your email to receive recovery instructions</p>
            </div>
            
            {forgotSent ? (
              <div className="space-y-4 text-center py-4">
                <span className="text-3xl">📧</span>
                <p className="text-sm font-semibold text-emerald-600">Recovery email sent successfully!</p>
                <p className="text-xs text-slate-500">Check your inbox for step-by-step instructions to create a new password.</p>
                <button 
                  onClick={() => { setShowForgot(false); setForgotSent(false); }}
                  className="w-full py-2.5 font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl"
                >
                  Done
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <input 
                  type="email"
                  placeholder="name@email.com"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl focus:outline-none"
                />
                <div className="flex gap-2">
                  <button 
                    onClick={() => setShowForgot(false)}
                    className="flex-1 py-2.5 font-bold text-slate-700 bg-slate-100 dark:bg-slate-800 dark:text-slate-350 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={() => setForgotSent(true)}
                    className="flex-1 py-2.5 font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl"
                  >
                    Send Link
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
