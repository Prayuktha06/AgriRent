import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
import { 
  TrendingUp, Users, MapPin, ShieldCheck, Tractor, 
  ArrowRight, Star, Quote, ChevronRight 
} from 'lucide-react';

export default function Home() {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const stats = [
    { label: 'Happy Farmers', count: '10,000+', icon: Users, color: 'text-emerald-500' },
    { label: 'Tractors & Machinery', count: '1,500+', icon: Tractor, color: 'text-amber-500' },
    { label: 'Villages Connected', count: '450+', icon: MapPin, color: 'text-blue-500' },
    { label: 'Secure Rentals', count: '100%', icon: ShieldCheck, color: 'text-purple-500' },
  ];

  const featuredTools = [
    { name: 'John Deere Tractor 5050D', desc: '50 HP diesel power, robust performance.', price: 600, img: '/uploads/john_deere_tractor.png' },
    { name: 'Kubota Harvester DC-68G', desc: 'Advanced paddy combine harvester.', price: 680, img: '/uploads/kubota_harvester.png' },
    { name: 'Rotary Tiller (Rotavator)', desc: 'Sturdy steel tines for quick seedbeds.', price: 550, img: '/uploads/maschio_rotavator.png' },
  ];

  return (
    <div className="overflow-hidden bg-white text-slate-900 transition-colors duration-300 dark:bg-slate-950 dark:text-slate-100">
      
      {/* Hero Section */}
      <section className="relative flex min-h-[85vh] items-center justify-center bg-gradient-to-br from-emerald-50 via-teal-50/20 to-white py-16 dark:from-emerald-950/20 dark:via-slate-900 dark:to-slate-950">
        <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.01]" style={{ backgroundImage: 'radial-gradient(#10b981 2px, transparent 2px)', backgroundSize: '24px 24px' }}></div>
        <div className="container mx-auto px-6 grid md:grid-cols-2 gap-12 items-center relative z-10">
          
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-6"
          >
            <span className="inline-flex items-center gap-2 px-3 py-1 text-xs font-semibold text-emerald-700 bg-emerald-100 rounded-full dark:bg-emerald-900/40 dark:text-emerald-300">
              🌱 Direct Owner-to-Farmer Marketplace
            </span>
            <h1 className="text-4xl md:text-6xl font-extrabold leading-tight font-display bg-gradient-to-r from-emerald-700 to-green-600 bg-clip-text text-transparent dark:from-emerald-400 dark:to-emerald-300">
              {t('slogan')}
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-350 max-w-lg">
              {t('heroText')}
            </p>
            <div className="flex flex-wrap gap-4 pt-4">
              <Link 
                to="/login" 
                className="px-8 py-3.5 font-semibold text-white bg-gradient-to-r from-emerald-600 to-emerald-500 rounded-xl shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/35 transition-all hover:scale-[1.02]"
              >
                {t('searchBtn')} <ArrowRight className="inline-block ml-2 w-5 h-5" />
              </Link>
              <Link 
                to="/register" 
                className="px-8 py-3.5 font-semibold text-emerald-700 bg-emerald-100/80 rounded-xl hover:bg-emerald-100 transition-all dark:bg-emerald-900/30 dark:text-emerald-300"
              >
                Become Partner
              </Link>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="absolute -inset-1 bg-gradient-to-tr from-emerald-500 to-teal-400 rounded-3xl blur-2xl opacity-20"></div>
            <img 
              src="/uploads/john_deere_tractor.png" 
              alt="Premium Farming Equipment" 
              className="rounded-3xl border border-emerald-100/50 shadow-2xl relative z-10 w-full object-cover h-[450px]"
            />
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-emerald-900 text-white relative">
        <div className="container mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-center space-y-2"
            >
              <div className="inline-flex p-3 bg-white/10 rounded-full mb-2">
                <stat.icon className="w-6 h-6 text-emerald-300" />
              </div>
              <h3 className="text-3xl font-extrabold">{stat.count}</h3>
              <p className="text-sm text-emerald-100 font-medium">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-20 bg-slate-50 dark:bg-slate-900/40">
        <div className="container mx-auto px-6 text-center">
          <span className="text-emerald-600 dark:text-emerald-400 font-semibold tracking-wider uppercase text-sm">Three Simple Steps</span>
          <h2 className="text-3xl md:text-4xl font-bold mt-2 mb-12">{t('howItWorks')}</h2>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              { title: t('step1Title'), desc: t('step1Desc'), step: '01' },
              { title: t('step2Title'), desc: t('step2Desc'), step: '02' },
              { title: t('step3Title'), desc: t('step3Desc'), step: '03' }
            ].map((step, i) => (
              <div key={i} className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-100 dark:border-slate-800 relative hover-card">
                <span className="absolute top-4 right-4 text-5xl font-black text-emerald-500/10 font-display">{step.step}</span>
                <h3 className="text-xl font-bold mb-3 text-slate-800 dark:text-slate-100">{step.title}</h3>
                <p className="text-slate-550 text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Equipment Grid */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="flex justify-between items-end mb-12">
            <div>
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold tracking-wider uppercase text-sm">Highest Rated Machinery</span>
              <h2 className="text-3xl md:text-4xl font-bold mt-2">Featured Equipment</h2>
            </div>
            <Link to="/login" className="hidden sm:inline-flex items-center gap-1 text-emerald-600 hover:text-emerald-500 font-semibold">
              Browse all items <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-8">
            {featuredTools.map((tool, i) => (
              <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-800/80 hover-card">
                <img src={tool.img} alt={tool.name} className="w-full h-48 object-cover" />
                <div className="p-6 space-y-4">
                  <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">{tool.name}</h3>
                  <p className="text-sm text-slate-550 line-clamp-2">{tool.desc}</p>
                  <div className="flex justify-between items-center pt-2 border-t border-slate-50 dark:border-slate-800/50">
                    <span className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400">₹{tool.price} <span className="text-xs text-slate-500 font-medium">/ day</span></span>
                    <button onClick={() => navigate('/login')} className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors">
                      Book Now
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-slate-50 dark:bg-slate-900/40 relative">
        <div className="container mx-auto px-6 max-w-4xl text-center space-y-8">
          <span className="text-emerald-600 dark:text-emerald-400 font-semibold tracking-wider uppercase text-sm">Stories from the Field</span>
          <h2 className="text-3xl md:text-4xl font-bold">Trusted by Thousands</h2>
          
          <div className="bg-white dark:bg-slate-900 p-8 sm:p-12 rounded-3xl shadow-xl relative border border-slate-100 dark:border-slate-800">
            <Quote className="w-12 h-12 text-emerald-500/20 absolute top-6 left-6" />
            <p className="text-lg sm:text-xl italic text-slate-700 dark:text-slate-200 leading-relaxed relative z-10">
              "AgriRent has completely changed how I cultivate my land. In Shamshabad, I used to rely on expensive agents. Now I rent state-of-the-art tractors directly from Mallesham. Highly secure and professional!"
            </p>
            <div className="mt-8 flex items-center justify-center gap-4">
              <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100" alt="Farmer" className="w-12 h-12 rounded-full object-cover" />
              <div className="text-left">
                <h4 className="font-bold">Laxman Reddy</h4>
                <p className="text-xs text-slate-500">Farmer, Shamshabad</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
        <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-4">
            <h3 className="text-2xl font-black text-white flex items-center gap-2">🌱 AgriRent</h3>
            <p className="text-sm">Connecting farmers and machinery owners directly. Empowering agriculture and building technology to cultivate local trust.</p>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4">Supported Locations</h4>
            <ul className="space-y-2 text-sm">
              <li>📍 Shamshabad, Telangana</li>
              <li>📍 Kondapur, Telangana</li>
              <li>📍 Vikarabad, Telangana</li>
              <li>📍 Medchal, Telangana</li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4">Contact Support</h4>
            <p className="text-sm">Have issues? Email us or call our round-the-clock rural helpline:</p>
            <p className="text-emerald-400 font-bold mt-2">📞 1800-425-RENT (7368)</p>
            <p className="text-xs text-slate-500 mt-1">support@agrirent.com</p>
          </div>
        </div>
        <div className="container mx-auto px-6 text-center text-xs mt-12 pt-6 border-t border-slate-800">
          &copy; {new Date().getFullYear()} AgriRent - Farming Equipment Rental Platform. All Rights Reserved.
        </div>
      </footer>

    </div>
  );
}
