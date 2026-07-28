import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement,
  LineElement, Title, Tooltip, Legend, Filler
} from 'chart.js';
import { 
  Plus, Trash2, Calendar, Coins, Settings, Tractor, Clock, Check, X,
  CheckCircle, AlertCircle, RefreshCw, BarChart2, Upload
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement, Title,
  Tooltip, Legend, Filler
);

export default function OwnerDashboard() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [user, setUser] = useState(null);

  // States
  const [listings, setListings] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [analytics, setAnalytics] = useState({
    totalEarnings: 0,
    pendingRequests: 0,
    activeRentals: 0,
    totalBookings: 0,
    chartData: null
  });

  // Dynamic feedback alerts
  const [toast, setToast] = useState(null);
  
  // UI Tabs / Controls
  const [activeView, setActiveView] = useState('analytics'); // analytics, listings, bookings, add-tool
  const [loading, setLoading] = useState(false);

  // Add Equipment Form
  const [equipmentName, setEquipmentName] = useState('');
  const [category, setCategory] = useState('Tractor');
  const [description, setDescription] = useState('');
  const [pricePerDay, setPricePerDay] = useState('');
  const [location, setLocation] = useState('');
  const [imageFiles, setImageFiles] = useState([]);

  useEffect(() => {
    const localUser = localStorage.getItem('agriUser');
    if (!localUser) {
      navigate('/login');
      return;
    }
    const parsedUser = JSON.parse(localUser);
    if (parsedUser.role !== 'Equipment Owner' && parsedUser.role !== 'Admin') {
      navigate('/farmer-dashboard');
      return;
    }
    setUser(parsedUser);
    loadDashboardData();
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const loadDashboardData = async () => {
    const token = localStorage.getItem('agriToken');
    if (!token) return;

    try {
      // Load Owner Bookings & Analytics
      const bRes = await axios.get('/api/bookings/owner', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBookings(bRes.data.bookings);
      setAnalytics(bRes.data.analytics);

      // Load Owner's specific Equipment Listings
      const eRes = await axios.get('/api/equipment');
      const currentUser = JSON.parse(localStorage.getItem('agriUser') || '{}');
      const mine = eRes.data.filter(item => {
        if (!item.ownerId) return false;
        const ownerIdStr = typeof item.ownerId === 'object' ? (item.ownerId._id || item.ownerId.id) : item.ownerId;
        return ownerIdStr?.toString() === currentUser.id?.toString();
      });
      setListings(mine);
    } catch (err) {
      console.error(err);
      showToast('Error loading dashboard analytics.', 'error');
    }
  };

  // Approve / Reject booking
  const handleBookingStatus = async (id, status) => {
    const token = localStorage.getItem('agriToken');
    try {
      await axios.put(`/api/bookings/${id}/status`, { status }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      showToast(`Booking ${status.toLowerCase()} successfully!`);
      loadDashboardData();
    } catch (err) {
      showToast('Failed to update booking status.', 'error');
    }
  };

  // Confirm Cash Payment directly (Simulating offline cash delivery handshakes)
  const handleConfirmPayment = async (id) => {
    const token = localStorage.getItem('agriToken');
    try {
      await axios.put(`/api/bookings/${id}/payment`, { status: 'Paid' }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      showToast('Payment marked as Paid successfully!');
      loadDashboardData();
    } catch (err) {
      showToast('Failed to update payment status.', 'error');
    }
  };

  // Add Equipment Form submit
  const handleAddEquipment = async (e) => {
    e.preventDefault();
    if (!equipmentName || !pricePerDay || !location) {
      showToast('Please fill all required fields.', 'error');
      return;
    }

    const token = localStorage.getItem('agriToken');
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('equipmentName', equipmentName);
      formData.append('category', category);
      formData.append('description', description);
      formData.append('pricePerDay', pricePerDay);
      formData.append('location', location);
      
      if (imageFiles.length > 0) {
        for (let i = 0; i < imageFiles.length; i++) {
          formData.append('images', imageFiles[i]);
        }
      } else {
        // Fallback Unsplash image based on category
        const unsplashUrls = {
          'Tractor': 'https://images.unsplash.com/photo-1599933333668-3d553b434316?w=600',
          'Harvester': 'https://images.unsplash.com/photo-1594142323719-f9c3f4e24ebc?w=600',
          'Rotavator': 'https://images.unsplash.com/photo-1589923188900-85dae4409f7c?w=600',
          'Sprayer': 'https://images.unsplash.com/photo-1563514227147-6d2ff665a6a0?w=600',
        };
        const fall = unsplashUrls[category] || 'https://images.unsplash.com/photo-1599933333668-3d553b434316?w=600';
        formData.append('images', fall);
      }

      await axios.post('/api/equipment', formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      showToast('New machinery listed successfully!', 'success');
      
      // Clear Form
      setEquipmentName('');
      setDescription('');
      setPricePerDay('');
      setLocation('');
      setImageFiles([]);
      setActiveView('listings');
      loadDashboardData();
    } catch (err) {
      showToast('Error listing equipment.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Delete Equipment
  const handleDeleteEquipment = async (id) => {
    if (!window.confirm('Are you sure you want to remove this equipment listing?')) return;
    const token = localStorage.getItem('agriToken');
    try {
      await axios.delete(`/api/equipment/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      showToast('Machinery removed successfully!');
      loadDashboardData();
    } catch (err) {
      showToast('Error removing equipment listing.', 'error');
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

      {/* Header Panel */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-amber-700 to-amber-600 dark:from-slate-900 dark:to-slate-800 p-8 rounded-3xl text-white shadow-xl">
        <div className="space-y-1">
          <span className="text-xs font-semibold bg-white/20 px-3 py-1 rounded-full uppercase tracking-wider">🏡 {t('ownerDash')}</span>
          <h1 className="text-3xl font-extrabold font-display">Welcome, {user?.name || 'Partner'}</h1>
          <p className="text-amber-100/80 text-sm">Manage tools, track reservations, and monitor revenue analytics from Vikarabad central hub.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setActiveView('analytics')} className={`px-4 py-2 font-bold rounded-lg text-xs transition-colors ${activeView === 'analytics' ? 'bg-white text-amber-800' : 'bg-white/10 hover:bg-white/20'}`}>📈 Earnings</button>
          <button onClick={() => setActiveView('listings')} className={`px-4 py-2 font-bold rounded-lg text-xs transition-colors ${activeView === 'listings' ? 'bg-white text-amber-800' : 'bg-white/10 hover:bg-white/20'}`}>🚜 Machinery ({listings.length})</button>
          <button onClick={() => setActiveView('bookings')} className={`px-4 py-2 font-bold rounded-lg text-xs transition-colors ${activeView === 'bookings' ? 'bg-white text-amber-800' : 'bg-white/10 hover:bg-white/20'}`}>🗓️ Bookings ({bookings.length})</button>
          <button onClick={() => setActiveView('add-tool')} className={`px-4 py-2 font-bold rounded-lg text-xs transition-colors bg-white text-amber-800 hover:bg-amber-50 flex items-center gap-1`}><Plus className="w-3.5 h-3.5" /> List Tool</button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {[
          { label: 'Total Earnings', val: `₹${analytics.totalEarnings}`, icon: Coins, bg: 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600' },
          { label: 'Pending Requests', val: analytics.pendingRequests, icon: Clock, bg: 'bg-amber-50 dark:bg-amber-950/20 text-amber-600' },
          { label: 'Active Rentals', val: analytics.activeRentals, icon: Tractor, bg: 'bg-blue-50 dark:bg-blue-950/20 text-blue-600' },
          { label: 'Listed Machinery', val: listings.length, icon: Settings, bg: 'bg-purple-50 dark:bg-purple-950/20 text-purple-600' },
        ].map((card, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-5 rounded-2xl flex items-center justify-between shadow-sm">
            <div className="space-y-1">
              <span className="text-xs text-slate-555 font-bold block uppercase">{card.label}</span>
              <span className="text-2xl font-extrabold">{card.val}</span>
            </div>
            <div className={`p-3 rounded-full ${card.bg}`}><card.icon className="w-5 h-5" /></div>
          </div>
        ))}
      </div>

      {/* Analytics Dashboard */}
      {activeView === 'analytics' && (
        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Chart Section */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-3xl space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-lg flex items-center gap-2"><BarChart2 className="w-5 h-5 text-amber-500" /> Revenue Growth Chart</h3>
              <button onClick={loadDashboardData} className="p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg text-slate-500"><RefreshCw className="w-4 h-4" /></button>
            </div>
            <div className="h-[280px] flex items-center justify-center">
              {analytics.chartData ? (
                <Line 
                  data={analytics.chartData} 
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      y: { grid: { color: 'rgba(0,0,0,0.03)' } },
                      x: { grid: { display: false } }
                    }
                  }} 
                />
              ) : (
                <span className="text-slate-400 text-sm">Loading charts...</span>
              )}
            </div>
          </div>

          {/* Quick Bookings Overview */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-3xl space-y-4">
            <h3 className="font-bold text-lg">Platform Performance</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-950 rounded-xl">
                <span className="text-xs font-bold text-slate-500">Platform Health</span>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-100 dark:bg-emerald-950 px-2.5 py-0.5 rounded-full">Good</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-950 rounded-xl">
                <span className="text-xs font-bold text-slate-500">Utilization Rate</span>
                <span className="text-sm font-black text-amber-600">82%</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-950 rounded-xl">
                <span className="text-xs font-bold text-slate-500">Average Rating</span>
                <span className="text-sm font-black text-amber-500">★ 4.6</span>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* Equipment Listings */}
      {activeView === 'listings' && (
        <div className="space-y-4">
          <h3 className="font-bold text-lg">Your Listed Farming Machinery ({listings.length})</h3>
          {listings.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-slate-900 border border-dashed border-slate-150 dark:border-slate-800 rounded-3xl">
              <span className="text-4xl">🚜</span>
              <h4 className="font-bold mt-2">No Machinery Listed</h4>
              <p className="text-xs text-slate-500 mt-1">Start adding tractors, sprayers, and tools to earn daily rental income.</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {listings.map((item, i) => (
                <div key={i} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden hover-card flex flex-col justify-between">
                  <div>
                    <img src={item.images?.[0]} alt={item.equipmentName} className="w-full h-44 object-cover" />
                    <div className="p-5 space-y-3">
                      <div className="flex justify-between items-start">
                        <h4 className="font-bold text-slate-800 dark:text-slate-100 line-clamp-1">{item.equipmentName}</h4>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${item.availability ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950' : 'bg-red-100 text-red-700 dark:bg-red-950'}`}>
                          {item.availability ? 'Available' : 'Rented'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{item.description}</p>
                    </div>
                  </div>

                  <div className="p-5 pt-0 flex justify-between items-center border-t border-slate-50 dark:border-slate-800/60 mt-4">
                    <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">₹{item.pricePerDay} <span className="text-[10px] font-medium text-slate-500">/ day</span></span>
                    <button onClick={() => handleDeleteEquipment(item._id)} className="p-2 hover:bg-red-50 dark:hover:bg-red-950/20 text-red-500 rounded-lg transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Bookings received Manager */}
      {activeView === 'bookings' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
          <h2 className="text-2xl font-bold font-display">Received Rental Requests</h2>
          {bookings.length === 0 ? (
            <div className="text-center py-16">
              <span className="text-4xl">🗓️</span>
              <h4 className="font-bold mt-2">No Bookings Received</h4>
              <p className="text-xs text-slate-500 mt-1">Once farmers rent your machinery, requests will show up here.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {bookings.map((booking, i) => (
                <div key={i} className="border border-slate-100 dark:border-slate-800 p-5 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:bg-slate-50 dark:hover:bg-slate-950/20 transition-all">
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-slate-800 dark:text-slate-100">{booking.equipmentId?.equipmentName || 'Farming Equipment'}</h4>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${booking.bookingStatus === 'Approved' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                        {booking.bookingStatus}
                      </span>
                    </div>
                    <p className="text-xs text-slate-550">👨‍🌾 Farmer: <span className="font-bold">{booking.farmerId?.name || 'Ravi Teja'}</span> ({booking.farmerId?.mobile || '98480xxxxx'})</p>
                    <p className="text-xs text-slate-550">📍 Village: {booking.farmerId?.village || 'Shamshabad'}</p>
                    <p className="text-xs text-slate-500 font-semibold">📅 Schedule: {new Date(booking.bookingDate).toLocaleDateString()} to {new Date(booking.returnDate).toLocaleDateString()}</p>
                  </div>

                  <div className="flex md:flex-col justify-between items-end gap-3 w-full md:w-auto border-t md:border-t-0 pt-3 md:pt-0 border-slate-150">
                    <div className="text-left md:text-right">
                      <span className="text-[10px] text-slate-500 font-bold uppercase block">Rental cost</span>
                      <span className="text-lg font-black text-emerald-600">₹{booking.totalPrice}</span>
                    </div>

                    <div className="flex gap-2">
                      {booking.bookingStatus === 'Pending' && (
                        <>
                          <button onClick={() => handleBookingStatus(booking._id, 'Approved')} className="p-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg" title="Approve Booking"><Check className="w-4 h-4" /></button>
                          <button onClick={() => handleBookingStatus(booking._id, 'Rejected')} className="p-2 bg-red-600 hover:bg-red-500 text-white rounded-lg" title="Reject Booking"><X className="w-4 h-4" /></button>
                        </>
                      )}
                      
                      {booking.bookingStatus === 'Approved' && booking.paymentStatus === 'Pending' && (
                        <button onClick={() => handleConfirmPayment(booking._id)} className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-lg flex items-center gap-1">
                          Confirm Cash Payment
                        </button>
                      )}
                      
                      {booking.bookingStatus === 'Approved' && booking.paymentStatus === 'Paid' && (
                        <button onClick={() => handleBookingStatus(booking._id, 'Completed')} className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg">
                          Complete Rental
                        </button>
                      )}
                      
                      {booking.bookingStatus === 'Completed' && (
                        <span className="text-xs text-emerald-600 font-bold">🎉 Order Completed</span>
                      )}
                    </div>
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Add new tool form */}
      {activeView === 'add-tool' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold font-display text-slate-800 dark:text-slate-100">List New Farming Equipment</h2>
          
          <form onSubmit={handleAddEquipment} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Equipment Name</label>
                <input 
                  type="text" 
                  placeholder="John Deere 5050D Tractor"
                  value={equipmentName}
                  onChange={(e) => setEquipmentName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 px-4 py-2.5 border border-slate-100 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Category</label>
                <select 
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 px-4 py-2.5 border border-slate-100 dark:border-slate-800 rounded-xl focus:outline-none"
                >
                  <option value="Tractor">Tractor</option>
                  <option value="Harvester">Harvester</option>
                  <option value="Rotavator">Rotavator</option>
                  <option value="Sprayer">Sprayer</option>
                  <option value="Cultivator">Cultivator</option>
                  <option value="Seed Drill">Seed Drill</option>
                </select>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Rental Price Per Day (₹)</label>
                <input 
                  type="number" 
                  placeholder="2500"
                  value={pricePerDay}
                  onChange={(e) => setPricePerDay(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 px-4 py-2.5 border border-slate-100 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Location Hub / Village</label>
                <input 
                  type="text" 
                  placeholder="Shamshabad"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 px-4 py-2.5 border border-slate-100 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Machinery Description</label>
              <textarea 
                rows="3"
                placeholder="Describe engine condition, tires, tools, or operational details..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 px-4 py-2.5 border border-slate-100 dark:border-slate-800 rounded-xl focus:outline-none"
              ></textarea>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Machinery Photos (Optional)</label>
              <label className="cursor-pointer border border-dashed border-slate-350 dark:border-slate-800 rounded-xl p-6 flex flex-col items-center justify-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-950 transition-colors">
                <Upload className="w-6 h-6 text-slate-400" />
                <span className="text-xs font-bold text-slate-500 uppercase">Choose Photos</span>
                <input 
                  type="file" 
                  accept="image/*" 
                  multiple 
                  onChange={(e) => setImageFiles(Array.from(e.target.files))}
                  className="hidden" 
                />
                {imageFiles.length > 0 && <span className="text-xs font-bold text-emerald-600 mt-1">{imageFiles.length} file(s) selected</span>}
              </label>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-4 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl shadow-lg shadow-amber-500/20 hover:shadow-xl transition-all"
            >
              {loading ? 'Submitting...' : 'List Equipment'}
            </button>
          </form>
        </div>
      )}

    </div>
  );
}
