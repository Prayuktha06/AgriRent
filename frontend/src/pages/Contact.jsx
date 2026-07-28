import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Phone, MapPin, Send, CheckCircle, AlertCircle } from 'lucide-react';

export default function Contact() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !email || !message) return;

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSent(true);
      setName('');
      setEmail('');
      setMessage('');
      setTimeout(() => setSent(false), 3000);
    }, 1200);
  };

  return (
    <div className="container mx-auto px-6 py-12 max-w-5xl space-y-12 min-h-[85vh] relative">
      
      {/* Toast Alert */}
      <AnimatePresence>
        {sent && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-24 right-6 z-50 p-4 bg-emerald-600 text-white rounded-xl shadow-xl flex items-center gap-2 font-bold"
          >
            <CheckCircle className="w-5 h-5" />
            Inquiry sent successfully! Our rural coordinators will call you shortly.
          </motion.div>
        )}
      </AnimatePresence>

      <div className="text-center space-y-2 max-w-2xl mx-auto">
        <span className="text-3xl">🌱</span>
        <h1 className="text-3xl md:text-5xl font-extrabold font-display">Get in Touch with AgriRent</h1>
        <p className="text-slate-550 text-sm">Need help booking machinery or listing your tractor? Contact our 24/7 agricultural support staff.</p>
      </div>

      <div className="grid md:grid-cols-5 gap-8">
        
        {/* Contact details */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-3xl space-y-6">
            <h3 className="font-bold text-lg">Support Channels</h3>
            
            <div className="space-y-4">
              <div className="flex gap-4 items-start">
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 rounded-xl"><Phone className="w-5 h-5" /></div>
                <div>
                  <span className="text-xs text-slate-500 font-bold block uppercase">Helpline (Toll-Free)</span>
                  <span className="font-extrabold text-slate-800 dark:text-slate-100">1800-425-RENT (7368)</span>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 rounded-xl"><Mail className="w-5 h-5" /></div>
                <div>
                  <span className="text-xs text-slate-500 font-bold block uppercase">Email Support</span>
                  <span className="font-extrabold text-slate-800 dark:text-slate-100">support@agrirent.com</span>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 rounded-xl"><MapPin className="w-5 h-5" /></div>
                <div>
                  <span className="text-xs text-slate-500 font-bold block uppercase">District HQ</span>
                  <span className="font-semibold text-slate-850 dark:text-slate-300">Shamshabad Main Road, near Agricultural Market Yard, Hyderabad, TS</span>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Google Maps Mock block */}
          <div className="bg-slate-100 dark:bg-slate-900 rounded-3xl h-48 border border-slate-150 dark:border-slate-800 overflow-hidden relative flex items-center justify-center">
            <div className="absolute inset-0 bg-cover bg-center opacity-60" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1524661135-423995f22d0b?w=600')" }}></div>
            <div className="absolute inset-0 bg-slate-900/40"></div>
            <div className="relative z-10 text-center text-white p-4">
              <span className="text-2xl block">📍</span>
              <span className="font-bold text-sm block mt-1">Shamshabad District Hub</span>
              <p className="text-[10px] text-slate-200 mt-1">Latitude: 17.2519 | Longitude: 78.4328</p>
            </div>
          </div>
        </div>

        {/* Contact inquiry form */}
        <div className="md:col-span-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-8 rounded-3xl space-y-6">
          <h3 className="font-bold text-lg">Send support inquiry</h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Your Name</label>
                <input 
                  type="text" 
                  placeholder="Ram Rao"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 px-4 py-2.5 border border-slate-100 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Email Address</label>
                <input 
                  type="email" 
                  placeholder="ram@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 px-4 py-2.5 border border-slate-100 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Inquiry Message</label>
              <textarea 
                rows="5"
                placeholder="Ask about pricing packages, booking dates, or list terms..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 px-4 py-2.5 border border-slate-100 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              ></textarea>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/20 hover:shadow-xl transition-all flex items-center justify-center gap-2"
            >
              {loading ? 'Sending...' : <><Send className="w-4 h-4" /> Send Inquiry Message</>}
            </button>
          </form>
        </div>

      </div>

    </div>
  );
}
