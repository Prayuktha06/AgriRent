import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, ShieldAlert, CheckCircle, AlertCircle, Settings, 
  Trash2, ShieldCheck, Landmark, MessageSquare, AlertOctagon 
} from 'lucide-react';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  // States
  const [usersList, setUsersList] = useState([]);
  const [metrics, setMetrics] = useState({
    totalUsers: 0,
    farmersCount: 0,
    ownersCount: 0,
    totalEquipment: 0,
    activeRentals: 0,
    completedRentals: 0,
    totalRevenue: 0
  });
  const [complaints, setComplaints] = useState([]);

  // Toast feedback
  const [toast, setToast] = useState(null);

  // Navigation tab
  const [activeTab, setActiveTab] = useState('users'); // users, complaints

  useEffect(() => {
    const localUser = localStorage.getItem('agriUser');
    if (!localUser) {
      navigate('/login');
      return;
    }
    const parsedUser = JSON.parse(localUser);
    if (parsedUser.role !== 'Admin') {
      navigate('/login');
      return;
    }
    setUser(parsedUser);
    loadAdminData();
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const loadAdminData = async () => {
    const token = localStorage.getItem('agriToken');
    if (!token) return;

    try {
      // Fetch Metrics & complaints
      const metricsRes = await axios.get('/api/admin/metrics', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMetrics(metricsRes.data.metrics);
      setComplaints(metricsRes.data.complaints);

      // Fetch User database
      const usersRes = await axios.get('/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsersList(usersRes.data);
    } catch (err) {
      console.error(err);
      showToast('Error loading platform metrics data.', 'error');
    }
  };

  // Cascade Ban/Delete User
  const handleDeleteUser = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete/ban this user and all their listings? This action is irreversible.')) return;
    
    const token = localStorage.getItem('agriToken');
    try {
      await axios.delete(`/api/admin/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      showToast('User and associated listings deleted successfully.');
      loadAdminData();
    } catch (err) {
      showToast('Error deleting user.', 'error');
    }
  };

  return (
    <div className="container mx-auto px-6 py-8 min-h-[90vh] space-y-8 relative">

      {/* Dynamic Alerts Banner */}
      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-24 right-6 z-50 p-4 rounded-xl shadow-xl flex items-center gap-2 font-semibold text-white ${toast.type === 'error' ? 'bg-red-500' : 'bg-emerald-500'}`}
          >
            {toast.type === 'error' ? <AlertCircle className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Welcome & Navigation Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-slate-900 to-slate-800 p-8 rounded-3xl text-white shadow-xl">
        <div className="space-y-1">
          <span className="text-xs font-semibold bg-white/20 px-3 py-1 rounded-full uppercase tracking-wider">🛡️ Platform Admin Console</span>
          <h1 className="text-3xl font-extrabold font-display">System Administrator Dashboard</h1>
          <p className="text-slate-350 text-sm">Monitor platform metrics, manage registered users, and inspect support complaint tickets.</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 font-bold rounded-lg text-xs transition-colors ${activeTab === 'users' ? 'bg-white text-slate-950' : 'bg-white/10 hover:bg-white/20'}`}
          >
            👥 Manage Users ({usersList.length})
          </button>
          <button 
            onClick={() => setActiveTab('complaints')}
            className={`px-4 py-2 font-bold rounded-lg text-xs transition-colors ${activeTab === 'complaints' ? 'bg-white text-slate-950' : 'bg-white/10 hover:bg-white/20'}`}
          >
            🎫 Complaint Tickets ({complaints.length})
          </button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {[
          { label: 'Total Users', val: metrics.totalUsers, icon: Users, bg: 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600' },
          { label: 'Registered Machinery', val: metrics.totalEquipment, icon: Settings, bg: 'bg-amber-50 dark:bg-amber-950/20 text-amber-600' },
          { label: 'Active Rentals', val: metrics.activeRentals, icon: ShieldCheck, bg: 'bg-blue-50 dark:bg-blue-950/20 text-blue-600' },
          { label: 'Platform Revenue', val: `₹${metrics.totalRevenue}`, icon: Landmark, bg: 'bg-purple-50 dark:bg-purple-950/20 text-purple-600' },
        ].map((card, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-5 rounded-2xl flex items-center justify-between shadow-sm">
            <div className="space-y-1">
              <span className="text-xs text-slate-500 font-bold block uppercase">{card.label}</span>
              <span className="text-2xl font-extrabold">{card.val}</span>
            </div>
            <div className={`p-3 rounded-full ${card.bg}`}><card.icon className="w-5 h-5" /></div>
          </div>
        ))}
      </div>

      {/* Users Management Grid */}
      {activeTab === 'users' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
          <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
            <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">Registered Platform Users</h3>
            <span className="text-xs font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 px-3 py-1 rounded-full">{usersList.length} Active Accounts</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-950/40 text-xs font-bold text-slate-500 uppercase">
                  <th className="p-4 pl-6">Avatar & Name</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Mobile</th>
                  <th className="p-4">Village Hub</th>
                  <th className="p-4">Account Role</th>
                  <th className="p-4 pr-6 text-right">Moderation Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-850">
                {usersList.map((usr, i) => (
                  <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/10">
                    <td className="p-4 pl-6 flex items-center gap-3 font-semibold">
                      <img src={usr.profileImage || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100'} alt="Avatar" className="w-9 h-9 rounded-full object-cover border border-slate-150" />
                      <div>
                        <span className="block font-bold">{usr.name}</span>
                        <span className="text-[10px] text-slate-500 font-medium">Joined {new Date(usr.createdAt).toLocaleDateString()}</span>
                      </div>
                    </td>
                    <td className="p-4 font-medium text-slate-600 dark:text-slate-300">{usr.email}</td>
                    <td className="p-4 text-slate-500">{usr.mobile}</td>
                    <td className="p-4 text-slate-500 font-semibold">📍 {usr.village}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        usr.role === 'Admin' ? 'bg-purple-100 text-purple-700 dark:bg-purple-950/40' :
                        usr.role === 'Equipment Owner' ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/40' :
                        'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40'
                      }`}>
                        {usr.role}
                      </span>
                    </td>
                    <td className="p-4 pr-6 text-right">
                      {usr.role !== 'Admin' ? (
                        <button 
                          onClick={() => handleDeleteUser(usr._id)}
                          className="p-2 hover:bg-red-50 dark:hover:bg-red-950/20 text-red-500 rounded-lg transition-colors inline-flex items-center gap-1 font-bold text-xs"
                        >
                          <Trash2 className="w-4 h-4" /> Ban User
                        </button>
                      ) : (
                        <span className="text-xs text-slate-400 font-medium italic">Owner (Super Admin)</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Complaints Tickets Manager */}
      {activeTab === 'complaints' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
          <h2 className="text-2xl font-bold font-display">System Complaint & Mediation Tickets</h2>
          <div className="space-y-4">
            {complaints.map((ticket, i) => (
              <div key={i} className="border border-slate-100 dark:border-slate-800 p-5 rounded-2xl flex justify-between items-center hover:bg-slate-50 dark:hover:bg-slate-950/20 transition-all">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="p-1 bg-red-100 text-red-600 dark:bg-red-950/20 rounded"><AlertOctagon className="w-4 h-4" /></span>
                    <h4 className="font-bold text-slate-800 dark:text-slate-100">{ticket.issue}</h4>
                  </div>
                  <p className="text-xs text-slate-500">From Farmer: <span className="font-bold">{ticket.from}</span> | Date: {ticket.date}</p>
                  <p className="text-xs text-slate-550 font-semibold">📍 Machinery: {ticket.equipment}</p>
                </div>
                <div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${ticket.status === 'Resolved' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                    {ticket.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
