import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import FarmerDashboard from './pages/FarmerDashboard';
import OwnerDashboard from './pages/OwnerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import Contact from './pages/Contact';
import { Sun, Moon, LogOut, Menu, X, Landmark, Tractor } from 'lucide-react';

function Navbar({ theme, toggleTheme }) {
  const { t, toggleLanguage, lang } = useLanguage();
  const [user, setUser] = useState(null);
  const [mobileMenu, setMobileMenu] = useState(false);

  useEffect(() => {
    const handleAuth = () => {
      const local = localStorage.getItem('agriUser');
      setUser(local ? JSON.parse(local) : null);
    };

    handleAuth();
    window.addEventListener('authChange', handleAuth);
    return () => window.removeEventListener('authChange', handleAuth);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('agriToken');
    localStorage.removeItem('agriUser');
    window.dispatchEvent(new Event('authChange'));
    window.location.href = '/login';
  };

  return (
    <nav className="glass sticky top-0 z-40 w-full border-b border-slate-100 dark:border-slate-800 transition-colors">
      <div className="container mx-auto px-6 h-16 flex items-center justify-between">
        
        {/* Brand logo */}
        <Link to="/" className="flex items-center gap-2 text-2xl font-black text-emerald-600 dark:text-emerald-400">
          <span>🌱</span>
          <span className="font-display tracking-tight text-xl">AgriRent</span>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-6">
          <Link to="/" className="text-sm font-semibold hover:text-emerald-500 transition-colors">{t('all')}</Link>
          <Link to="/contact" className="text-sm font-semibold hover:text-emerald-500 transition-colors">Support</Link>
          
          {user ? (
            <>
              {user.role === 'Admin' && <Link to="/admin-dashboard" className="text-sm font-bold text-emerald-600 dark:text-emerald-400">Admin Console</Link>}
              {user.role === 'Equipment Owner' && <Link to="/owner-dashboard" className="text-sm font-bold text-amber-600 dark:text-amber-400">Owner Dash</Link>}
              {user.role === 'Farmer' && <Link to="/farmer-dashboard" className="text-sm font-bold text-emerald-600 dark:text-emerald-400">Farmer Dash</Link>}
              
              <div className="flex items-center gap-3 pl-4 border-l border-slate-200 dark:border-slate-800">
                <span className="text-xs font-semibold text-slate-500">Howdy, {user.name.split(' ')[0]}</span>
                <button 
                  onClick={handleLogout}
                  className="p-2 bg-red-50 hover:bg-red-100 dark:bg-red-950/20 text-red-500 rounded-lg transition-all"
                  title={t('logout')}
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-4">
              <Link to="/login" className="text-sm font-semibold text-slate-600 dark:text-slate-350 hover:text-emerald-500">{t('login')}</Link>
              <Link 
                to="/register" 
                className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg shadow-sm hover:shadow transition-all"
              >
                {t('register')}
              </Link>
            </div>
          )}

          {/* Bilingual Switcher */}
          <button 
            onClick={toggleLanguage}
            className="px-3 py-1.5 text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg transition-colors border border-slate-200 dark:border-slate-800"
          >
            {lang === 'en' ? 'తెలుగు' : 'English'}
          </button>

          {/* Dark / Light Toggle */}
          <button 
            onClick={toggleTheme}
            className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg transition-colors"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>

        {/* Mobile menu trigger */}
        <div className="flex items-center gap-2 md:hidden">
          <button 
            onClick={toggleLanguage}
            className="px-2 py-1 text-xs font-bold bg-slate-100 dark:bg-slate-850 rounded"
          >
            {lang === 'en' ? 'తెలుగు' : 'EN'}
          </button>
          
          <button 
            onClick={toggleTheme}
            className="p-1.5 bg-slate-100 dark:bg-slate-850 rounded"
          >
            {theme === 'dark' ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
          </button>

          <button 
            onClick={() => setMobileMenu(!mobileMenu)}
            className="p-1.5 text-slate-700 dark:text-slate-300"
          >
            {mobileMenu ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

      </div>

      {/* Mobile navigation links */}
      {mobileMenu && (
        <div className="md:hidden border-t border-slate-100 dark:border-slate-850 bg-white dark:bg-slate-900 p-4 space-y-3 flex flex-col">
          <Link to="/" onClick={() => setMobileMenu(false)} className="text-sm font-semibold p-2 rounded hover:bg-slate-50 dark:hover:bg-slate-950/20">{t('all')}</Link>
          <Link to="/contact" onClick={() => setMobileMenu(false)} className="text-sm font-semibold p-2 rounded hover:bg-slate-50 dark:hover:bg-slate-950/20">Support</Link>
          
          {user ? (
            <>
              {user.role === 'Admin' && <Link to="/admin-dashboard" onClick={() => setMobileMenu(false)} className="text-sm font-bold text-emerald-600 p-2 rounded hover:bg-slate-50">Admin Console</Link>}
              {user.role === 'Equipment Owner' && <Link to="/owner-dashboard" onClick={() => setMobileMenu(false)} className="text-sm font-bold text-amber-600 p-2 rounded hover:bg-slate-50">Owner Dashboard</Link>}
              {user.role === 'Farmer' && <Link to="/farmer-dashboard" onClick={() => setMobileMenu(false)} className="text-sm font-bold text-emerald-600 p-2 rounded hover:bg-slate-50">Farmer Dashboard</Link>}
              <button 
                onClick={() => { setMobileMenu(false); handleLogout(); }}
                className="w-full text-left text-sm font-semibold text-red-500 p-2 rounded hover:bg-red-50"
              >
                Sign Out
              </button>
            </>
          ) : (
            <div className="flex gap-2 pt-2">
              <Link to="/login" onClick={() => setMobileMenu(false)} className="flex-1 text-center py-2 text-sm font-semibold border border-slate-200 rounded-lg">{t('login')}</Link>
              <Link to="/register" onClick={() => setMobileMenu(false)} className="flex-1 text-center py-2 text-sm font-bold bg-emerald-600 text-white rounded-lg">{t('register')}</Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}

export default function App() {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  return (
    <LanguageProvider>
      <Router>
        <div className="min-h-screen bg-slate-50 text-slate-900 transition-colors duration-300 dark:bg-slate-950 dark:text-slate-100 flex flex-col justify-between">
          <Navbar theme={theme} toggleTheme={toggleTheme} />
          
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/farmer-dashboard" element={<FarmerDashboard />} />
              <Route path="/owner-dashboard" element={<OwnerDashboard />} />
              <Route path="/admin-dashboard" element={<AdminDashboard />} />
              <Route path="/contact" element={<Contact />} />
            </Routes>
          </main>
        </div>
      </Router>
    </LanguageProvider>
  );
}
