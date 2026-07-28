import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { User, Mail, Lock, Phone, MapPin, Loader2, UploadCloud } from 'lucide-react';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('Farmer');
  const [mobile, setMobile] = useState('');
  const [village, setVillage] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const navigate = useNavigate();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!name || !email || !password || !mobile || !village) {
      setError('Please fill in all required fields');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (mobile.length < 10) {
      setError('Mobile number must be at least 10 digits');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('email', email);
      formData.append('password', password);
      formData.append('role', role);
      formData.append('mobile', mobile);
      formData.append('village', village);
      if (profileImage) {
        formData.append('profileImage', profileImage);
      }

      const response = await axios.post('/api/auth/register', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      const { token, user } = response.data;
      localStorage.setItem('agriToken', token);
      localStorage.setItem('agriUser', JSON.stringify(user));
      
      // Trigger authChange event
      window.dispatchEvent(new Event('authChange'));

      setSuccess(true);
      setTimeout(() => {
        if (user.role === 'Equipment Owner') {
          navigate('/owner-dashboard');
        } else {
          navigate('/farmer-dashboard');
        }
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[90vh] flex items-center justify-center bg-slate-50 dark:bg-slate-950 py-12 px-6 relative">
      <div className="absolute top-0 left-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl"></div>

      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-8 shadow-xl relative z-10 space-y-6"
      >
        <div className="text-center space-y-2">
          <span className="text-3xl">🌱</span>
          <h2 className="text-2xl font-bold font-display">Create AgriRent Account</h2>
          <p className="text-slate-500 text-sm">Join the platform to rent tools or list your own machinery</p>
        </div>

        {error && (
          <div className="p-3.5 text-sm font-semibold text-red-600 bg-red-50 dark:bg-red-950/20 dark:text-red-400 rounded-xl">
            ⚠️ {error}
          </div>
        )}

        {success && (
          <div className="p-3.5 text-sm font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 dark:text-emerald-400 rounded-xl">
            🎉 Registration successful! Logging you in...
          </div>
        )}

        <form onSubmit={handleRegister} className="grid sm:grid-cols-2 gap-6">
          
          {/* Left Column: Essential details */}
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Full Name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-450" />
                <input 
                  type="text"
                  placeholder="Ram Reddy"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-450" />
                <input 
                  type="email"
                  placeholder="ram@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-450" />
                <input 
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-450" />
                <input 
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  required
                />
              </div>
            </div>
          </div>

          {/* Right Column: Roles & profile photos */}
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase block">Account Role</label>
              <div className="grid grid-cols-2 gap-3">
                <button 
                  type="button"
                  onClick={() => setRole('Farmer')}
                  className={`py-2.5 font-bold rounded-xl border text-sm transition-all flex items-center justify-center gap-1.5 ${role === 'Farmer' ? 'bg-emerald-600 border-emerald-600 text-white shadow-md' : 'bg-slate-50 dark:bg-slate-950 border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-350'}`}
                >
                  🚜 Farmer
                </button>
                <button 
                  type="button"
                  onClick={() => setRole('Equipment Owner')}
                  className={`py-2.5 font-bold rounded-xl border text-sm transition-all flex items-center justify-center gap-1.5 ${role === 'Equipment Owner' ? 'bg-emerald-600 border-emerald-600 text-white shadow-md' : 'bg-slate-50 dark:bg-slate-950 border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-350'}`}
                >
                  🏡 Owner
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Mobile Number</label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-450" />
                  <input 
                    type="text"
                    placeholder="98480xxxxx"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none text-sm"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Village / City</label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-450" />
                  <input 
                    type="text"
                    placeholder="Shamshabad"
                    value={village}
                    onChange={(e) => setVillage(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none text-sm"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Profile Image upload UI */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Profile Photo (Optional)</label>
              <div className="flex gap-4 items-center">
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="w-14 h-14 rounded-full object-cover border border-emerald-500" />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-slate-100 dark:bg-slate-950 border border-slate-150 dark:border-slate-800 flex items-center justify-center text-xl">👤</div>
                )}
                
                <label className="flex-1 cursor-pointer border border-dashed border-slate-350 dark:border-slate-800 rounded-xl p-3 flex flex-col items-center justify-center gap-1 hover:bg-slate-50 dark:hover:bg-slate-950 transition-colors">
                  <UploadCloud className="w-5 h-5 text-slate-450" />
                  <span className="text-[11px] font-bold text-slate-500 uppercase">Upload File</span>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleImageChange}
                    className="hidden" 
                  />
                </label>
              </div>
            </div>
          </div>

          <div className="sm:col-span-2 pt-4">
            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-4 font-bold text-white bg-gradient-to-r from-emerald-600 to-emerald-500 rounded-xl shadow-lg shadow-emerald-500/20 hover:shadow-xl transition-all flex justify-center items-center gap-2"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Register Account'}
            </button>
          </div>

        </form>

        <p className="text-center text-sm text-slate-500 pt-4">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-emerald-600 hover:underline">
            Login here
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
