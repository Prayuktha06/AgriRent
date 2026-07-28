import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
import { 
  Search, Mic, MicOff, MapPin, SlidersHorizontal, Calendar, 
  Sparkles, CheckCircle2, AlertCircle, Clock, ChevronRight, X, Heart
} from 'lucide-react';

export default function FarmerDashboard() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  // Search & Filter State
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [maxPrice, setMaxPrice] = useState(6000);
  const [locationFilter, setLocationFilter] = useState('');
  
  // Dynamic Lists State
  const [equipmentList, setEquipmentList] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [toast, setToast] = useState(null);

  // Voice Search Active state
  const [voiceActive, setVoiceActive] = useState(false);
  const [micError, setMicError] = useState('');

  // Selected item detail modal states
  const [selectedItem, setSelectedItem] = useState(null);
  const [bookingDate, setBookingDate] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);

  // Active view tabs
  const [activeTab, setActiveTab] = useState('listings'); // listings, bookings, map

  // Load Initial Data
  useEffect(() => {
    const localUser = localStorage.getItem('agriUser');
    if (!localUser) {
      navigate('/login');
      return;
    }
    const parsedUser = JSON.parse(localUser);
    setUser(parsedUser);

    fetchEquipment();
    fetchRecommendations();
    fetchBookings();
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchEquipment = async () => {
    try {
      const res = await axios.get('/api/equipment');
      setEquipmentList(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchRecommendations = async () => {
    const token = localStorage.getItem('agriToken');
    if (!token) return;
    try {
      const res = await axios.get('/api/equipment/recommendations', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRecommendations(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchBookings = async () => {
    const token = localStorage.getItem('agriToken');
    if (!token) return;
    try {
      const res = await axios.get('/api/bookings/farmer', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBookings(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  // HTML5 Voice Recognition
  const handleVoiceSearch = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      showToast('Voice Search is not supported in this browser.', 'error');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    setVoiceActive(true);

    recognition.onstart = () => {
      setMicError('');
    };

    recognition.onresult = (event) => {
      const voiceResult = event.results[0][0].transcript;
      setSearch(voiceResult);
      showToast(`Search prefilled: "${voiceResult}"`);
      setVoiceActive(false);
    };

    recognition.onerror = (event) => {
      console.error('Speech error:', event.error);
      setVoiceActive(false);
    };

    recognition.onend = () => {
      setVoiceActive(false);
    };

    recognition.start();
  };

  // Perform Equipment Booking
  const handleConfirmBooking = async (e) => {
    e.preventDefault();
    if (!bookingDate || !returnDate) {
      showToast('Please select rental duration dates.', 'error');
      return;
    }

    const token = localStorage.getItem('agriToken');
    if (!token) return;

    setBookingLoading(true);
    try {
      const res = await axios.post('/api/bookings', {
        equipmentId: selectedItem._id,
        bookingDate,
        returnDate
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      showToast('Booking requested successfully! Pending owner approval.', 'success');
      setSelectedItem(null);
      setBookingDate('');
      setReturnDate('');
      fetchBookings();
      fetchEquipment();
    } catch (err) {
      showToast(err.response?.data?.message || 'Error processing booking request.', 'error');
    } finally {
      setBookingLoading(false);
    }
  };

  // Filtered Listings logic
  const filteredListings = equipmentList.filter(item => {
    const matchesSearch = item.equipmentName.toLowerCase().includes(search.toLowerCase()) ||
                          item.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === 'All' || item.category === category;
    const matchesPrice = item.pricePerDay <= maxPrice;
    const matchesLocation = !locationFilter || item.location.toLowerCase().includes(locationFilter.toLowerCase());
    return matchesSearch && matchesCategory && matchesPrice && matchesLocation;
  });

  return (
    <div className="container mx-auto px-6 py-8 min-h-[90vh] space-y-8 relative">
      
      {/* Dynamic Alert Banner */}
      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-24 right-6 z-50 p-4 rounded-xl shadow-xl flex items-center gap-2 font-semibold text-white ${toast.type === 'error' ? 'bg-red-500' : 'bg-emerald-500'}`}
          >
            {toast.type === 'error' ? <AlertCircle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-emerald-800 to-emerald-600 dark:from-slate-900 dark:to-slate-800 p-8 rounded-3xl text-white shadow-xl">
        <div className="space-y-1">
          <span className="text-xs font-semibold bg-white/20 px-3 py-1 rounded-full uppercase tracking-wider">👩‍🌾 {t('farmerDash')}</span>
          <h1 className="text-3xl font-extrabold font-display">{t('welcome')}, {user?.name || 'Farmer'}</h1>
          <p className="text-emerald-100/80 text-sm">Find tools, manage rentals, and keep track of crop schedules from Shamshabad hub.</p>
        </div>
        <div className="flex gap-2.5">
          <button 
            onClick={() => setActiveTab('listings')}
            className={`px-5 py-2.5 font-bold rounded-xl transition-all ${activeTab === 'listings' ? 'bg-white text-emerald-800' : 'bg-white/10 hover:bg-white/20'}`}
          >
            🔎 Find Tools
          </button>
          <button 
            onClick={() => setActiveTab('bookings')}
            className={`px-5 py-2.5 font-bold rounded-xl transition-all ${activeTab === 'bookings' ? 'bg-white text-emerald-800' : 'bg-white/10 hover:bg-white/20'}`}
          >
            🗓️ My Rentals ({bookings.length})
          </button>
        </div>
      </div>

      {activeTab === 'listings' && (
        <div className="grid lg:grid-cols-4 gap-8">
          
          {/* Filters Column */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-2xl h-fit space-y-6">
            <div className="flex items-center justify-between">
              <span className="font-bold flex items-center gap-2"><SlidersHorizontal className="w-5 h-5 text-emerald-600" /> Filters</span>
              <button onClick={() => { setCategory('All'); setSearch(''); setMaxPrice(6000); setLocationFilter(''); }} className="text-xs text-slate-500 hover:text-emerald-600 font-semibold">Reset All</button>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Category</label>
              <select 
                value={category} 
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 p-2.5 border border-slate-100 dark:border-slate-800 rounded-xl focus:outline-none"
              >
                <option value="All">All Categories</option>
                <option value="Tractor">Tractor</option>
                <option value="Harvester">Harvester</option>
                <option value="Rotavator">Rotavator</option>
                <option value="Sprayer">Sprayer</option>
                <option value="Cultivator">Cultivator</option>
                <option value="Seed Drill">Seed Drill</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase flex justify-between">
                <span>Max Price Per Day</span>
                <span className="text-emerald-600 font-extrabold">₹{maxPrice}</span>
              </label>
              <input 
                type="range" 
                min="500" 
                max="6000" 
                step="250"
                value={maxPrice} 
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-emerald-600" 
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Location / Village</label>
              <input 
                type="text" 
                placeholder="Search village (e.g. Shamshabad)"
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 p-2.5 border border-slate-100 dark:border-slate-800 rounded-xl focus:outline-none text-sm"
              />
            </div>

            {/* Simulated Live GPS Map Panel mockup */}
            <div className="pt-4 border-t border-slate-50 dark:border-slate-800/80">
              <span className="text-xs font-bold text-slate-500 uppercase block mb-2">Simulated GPS Locator</span>
              <div className="bg-slate-100 dark:bg-slate-950 rounded-xl p-4 text-center border border-slate-150 dark:border-slate-800">
                <span className="text-2xl block">🗺️</span>
                <span className="text-[11px] font-bold text-emerald-600 block mt-1">Shamshabad District Hub Active</span>
                <p className="text-[10px] text-slate-500 mt-1">Automatically showing nearest equipments within 15 km.</p>
              </div>
            </div>
          </div>

          {/* Search, Recommendations, and Listings Column */}
          <div className="lg:col-span-3 space-y-8">
            
            {/* Search inputs with Voice Search micro interaction */}
            <div className="flex gap-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-2.5 rounded-2xl shadow-sm items-center relative">
              <Search className="w-5 h-5 text-slate-400 ml-2" />
              <input 
                type="text"
                placeholder={t('searchPlaceholder')}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 bg-transparent border-none outline-none focus:ring-0 text-slate-700 dark:text-slate-150"
              />
              
              {/* Mic buttons */}
              <button 
                onClick={handleVoiceSearch}
                className={`p-2.5 rounded-xl transition-all ${voiceActive ? 'bg-red-500 text-white animate-pulse' : 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600'}`}
                title="Voice Search (Click and speak)"
              >
                {voiceActive ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>
            </div>

            {voiceActive && (
              <div className="bg-emerald-50 border border-emerald-100 dark:bg-emerald-950/20 dark:border-emerald-900/50 p-3 rounded-xl text-center text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                🎙️ {t('voiceActive')}...
              </div>
            )}

            {/* AI Recommendations panel */}
            {recommendations.length > 0 && (
              <div className="space-y-4 bg-gradient-to-r from-emerald-50/40 via-teal-50/10 to-transparent dark:from-emerald-950/10 dark:to-transparent p-6 rounded-3xl border border-emerald-100/40 dark:border-emerald-900/20">
                <h3 className="text-lg font-bold flex items-center gap-2"><Sparkles className="w-5 h-5 text-emerald-500 animate-bounce" /> AI Smart Recommendations</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  {recommendations.map((item, i) => (
                    <div 
                      key={i} 
                      onClick={() => setSelectedItem(item)}
                      className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-800 flex gap-4 hover-card cursor-pointer"
                    >
                      <img src={item.images?.[0]} alt={item.equipmentName} className="w-16 h-16 rounded-lg object-cover" />
                      <div className="space-y-1">
                        <h4 className="font-bold text-sm text-slate-800 dark:text-slate-100">{item.equipmentName}</h4>
                        <span className="text-[11px] bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 font-bold px-2 py-0.5 rounded-full">{item.category}</span>
                        <div className="flex justify-between items-center text-xs pt-1">
                          <span className="text-emerald-600 font-extrabold">₹{item.pricePerDay}/day</span>
                          <span className="text-slate-500">📍 {item.location}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Listings Grid */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold">Equipment Listings Available ({filteredListings.length})</h3>
              
              {filteredListings.length === 0 ? (
                <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
                  <span className="text-4xl">🚜</span>
                  <h4 className="font-bold mt-2">No Equipment Found</h4>
                  <p className="text-xs text-slate-500 mt-1">Try resetting the filter criteria or check back later.</p>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredListings.map((item, i) => (
                    <div key={i} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden hover-card flex flex-col justify-between">
                      <div className="relative">
                        <img src={item.images?.[0] || 'https://images.unsplash.com/photo-1599933333668-3d553b434316?w=400'} alt={item.equipmentName} className="w-full h-44 object-cover" />
                        <span className={`absolute top-3 right-3 text-[10px] font-bold px-2.5 py-1 rounded-full ${item.availability ? 'bg-emerald-600 text-white' : 'bg-red-500 text-white'}`}>
                          {item.availability ? 'Available' : 'Booked'}
                        </span>
                      </div>
                      
                      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                        <div className="space-y-2">
                          <div className="flex justify-between items-start">
                            <h4 className="font-bold text-slate-800 dark:text-slate-100 line-clamp-1">{item.equipmentName}</h4>
                          </div>
                          <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{item.description}</p>
                        </div>

                        <div className="space-y-3 pt-3 border-t border-slate-50 dark:border-slate-800/60">
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-slate-500">📍 {item.location}</span>
                            <span className="text-amber-500 font-bold">★ {item.rating}</span>
                          </div>
                          
                          <div className="flex justify-between items-center">
                            <div className="flex flex-col">
                              <span className="text-[10px] text-slate-500 font-bold uppercase">Price</span>
                              <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">₹{item.pricePerDay} <span className="text-[10px] font-medium text-slate-500">/ day</span></span>
                            </div>
                            
                            <button 
                              onClick={() => setSelectedItem(item)}
                              disabled={!item.availability}
                              className="px-4 py-2 font-bold text-xs bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors disabled:bg-slate-200 disabled:text-slate-450 dark:disabled:bg-slate-800/80"
                            >
                              Book Now
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

        </div>
      )}

      {/* Booking history tab */}
      {activeTab === 'bookings' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
          <h2 className="text-2xl font-bold font-display">Your Rental Bookings</h2>
          {bookings.length === 0 ? (
            <div className="text-center py-16">
              <span className="text-4xl">🗓️</span>
              <h4 className="font-bold mt-2">No Bookings Yet</h4>
              <p className="text-xs text-slate-500 mt-1">Book some farming equipment to view details and live status tracker.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {bookings.map((booking, i) => (
                <div key={i} className="border border-slate-100 dark:border-slate-800 p-5 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-slate-50 dark:hover:bg-slate-950/20 transition-all">
                  
                  <div className="flex gap-4 items-center">
                    <img src={booking.equipmentId?.images?.[0] || 'https://images.unsplash.com/photo-1599933333668-3d553b434316?w=100'} alt="Equipment" className="w-14 h-14 rounded-lg object-cover" />
                    <div>
                      <h4 className="font-bold text-slate-800 dark:text-slate-100">{booking.equipmentId?.equipmentName || 'Farming Equipment'}</h4>
                      <p className="text-xs text-slate-500">📅 Duration: {new Date(booking.bookingDate).toLocaleDateString()} to {new Date(booking.returnDate).toLocaleDateString()}</p>
                      <p className="text-xs text-slate-500 mt-1">👤 Owner: {booking.equipmentId?.ownerId?.name || 'Mallesham'} ({booking.equipmentId?.ownerId?.mobile || '98480xxxxx'})</p>
                    </div>
                  </div>

                  <div className="space-y-2 text-left sm:text-right w-full sm:w-auto flex flex-row sm:flex-col justify-between sm:justify-start items-center sm:items-end">
                    <div>
                      <span className="text-[10px] text-slate-500 font-bold block uppercase">Total Rental Cost</span>
                      <span className="text-lg font-extrabold text-emerald-600">₹{booking.totalPrice}</span>
                    </div>

                    <div className="flex gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        booking.bookingStatus === 'Approved' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300' :
                        booking.bookingStatus === 'Pending' ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300' :
                        'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-300'
                      }`}>
                        {booking.bookingStatus}
                      </span>
                      
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${booking.paymentStatus === 'Paid' ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300' : 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-300'}`}>
                        {booking.paymentStatus}
                      </span>
                    </div>
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Booking date-picker details popup Modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-slate-950/70 z-50 flex items-center justify-center p-6 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl overflow-hidden shadow-2xl relative"
          >
            <button 
              onClick={() => setSelectedItem(null)} 
              className="absolute top-4 right-4 p-2 bg-slate-100 dark:bg-slate-800 rounded-full hover:bg-slate-200 transition-colors z-10"
            >
              <X className="w-4 h-4" />
            </button>

            <img src={selectedItem.images?.[0]} alt={selectedItem.equipmentName} className="w-full h-48 object-cover" />
            
            <div className="p-6 space-y-6">
              <div>
                <span className="text-xs bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 font-bold px-2.5 py-1 rounded-full uppercase">{selectedItem.category}</span>
                <h3 className="text-xl font-bold mt-2 text-slate-800 dark:text-slate-100">{selectedItem.equipmentName}</h3>
                <p className="text-xs text-slate-500 mt-1">📍 Location Hub: {selectedItem.location}</p>
                <p className="text-sm text-slate-550 mt-3 leading-relaxed">{selectedItem.description}</p>
              </div>

              <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl flex justify-between items-center border border-slate-100 dark:border-slate-800">
                <div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase">Price</span>
                  <span className="text-xl font-black text-emerald-600 block">₹{selectedItem.pricePerDay}/day</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-500 font-bold uppercase block">Owner Contact</span>
                  <span className="text-sm font-semibold">{selectedItem.ownerId?.name || 'Mallesham'}</span>
                </div>
              </div>

              <form onSubmit={handleConfirmBooking} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase">Start Date</label>
                    <input 
                      type="date" 
                      value={bookingDate}
                      onChange={(e) => setBookingDate(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 px-4 py-2 border border-slate-100 dark:border-slate-800 rounded-xl focus:outline-none text-sm"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase">Return Date</label>
                    <input 
                      type="date" 
                      value={returnDate}
                      onChange={(e) => setReturnDate(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 px-4 py-2 border border-slate-100 dark:border-slate-800 rounded-xl focus:outline-none text-sm"
                      required
                    />
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={bookingLoading}
                  className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/20 hover:shadow-xl transition-all flex justify-center items-center gap-2"
                >
                  {bookingLoading ? 'Requesting...' : 'Request Rental Booking'}
                </button>
              </form>
            </div>
          </motion.div>
        </div>
      )}

    </div>
  );
}
