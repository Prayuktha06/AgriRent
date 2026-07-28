import React, { createContext, useState, useContext } from 'react';

const LanguageContext = createContext();

const translations = {
  en: {
    title: "AgriRent",
    slogan: "Farming Equipment at Your Fingertips",
    heroText: "Rent tractors, harvesters, and top-tier farm tools directly from owners. Zero middleman fees. Maximum efficiency.",
    searchBtn: "Search Equipment",
    categories: "Categories",
    all: "All",
    tractors: "Tractor",
    harvesters: "Harvester",
    rotavators: "Rotavator",
    sprayers: "Sprayer",
    seedDrills: "Seed Drill",
    howItWorks: "How AgriRent Works",
    step1Title: "Find Equipment",
    step1Desc: "Browse verified local listings, filter by price, tools, or location instantly.",
    step2Title: "Book & Pay",
    step2Desc: "Select rental dates, pay securely, and track your reservation status.",
    step3Title: "Boost Yields",
    step3Desc: "Pick up or receive delivery, do the work, and return when finished.",
    voiceActive: "Listening... Speak now",
    voiceSearch: "Voice Search Active",
    teluguToggle: "తెలుగు",
    englishToggle: "English",
    login: "Login",
    register: "Register",
    logout: "Logout",
    dashboard: "Dashboard",
    myBookings: "My Bookings",
    addEquipment: "Add Equipment",
    manageListings: "Manage Listings",
    rentPrice: "₹{price} / day",
    bookNow: "Book Now",
    location: "Location",
    availability: "Availability",
    available: "Available",
    rented: "Rented / Unavailable",
    reviews: "Reviews",
    farmerDash: "Farmer Dashboard",
    ownerDash: "Owner Dashboard",
    adminDash: "Admin Dashboard",
    welcome: "Welcome back",
    priceRange: "Price Range",
    searchPlaceholder: "Search tractors, cultivators, sprayers...",
    voiceInstruction: "Click mic to search using voice (Try 'Tractor' or 'Harvester')",
    teluguInstruction: "మీ వాయిస్ ఉపయోగించి శోధించండి (ఉదా: 'ట్రాక్టర్')"
  },
  te: {
    title: "అగ్రిరెంట్",
    slogan: "వ్యవసాయ పరికరాలు ఇప్పుడు మీ చేతుల్లో",
    heroText: "ట్రాక్టర్లు, హార్వెస్టర్లు మరియు అత్యుత్తమ వ్యవసాయ పరికరాలను నేరుగా యజమానుల నుండి అద్దెకు తీసుకోండి. దళారీలు లేరు. గరిష్ట లాభం.",
    searchBtn: "పరికరాల శోధన",
    categories: "రకాలు",
    all: "అన్నీ",
    tractors: "ట్రాక్టర్",
    harvesters: "హార్వెస్టర్",
    rotavators: "రోటవేటర్",
    sprayers: "స్ప్రేయర్",
    seedDrills: "సీడ్ డ్రిల్",
    howItWorks: "అగ్రిరెంట్ ఎలా పనిచేస్తుంది",
    step1Title: "పరికరాలను ఎంచుకోండి",
    step1Desc: "మీకు కావలసిన పరికరాన్ని ధర, దూరం ఆధారంగా సులభంగా శోధించండి.",
    step2Title: "బుకింగ్ & చెల్లింపు",
    step2Desc: "తేదీలను ఎంచుకుని, సురక్షితంగా ఆన్‌లైన్ ద్వారా అద్దె చెల్లించండి.",
    step3Title: "పంటలు పండించండి",
    step3Desc: "పరికరాలను తీసుకుని పని ముగించి, సమయానికి తిరిగి అప్పగించండి.",
    voiceActive: "వింటున్నాము... మాట్లాడండి",
    voiceSearch: "వాయిస్ శోధన యాక్టివ్",
    teluguToggle: "తెలుగు",
    englishToggle: "English",
    login: "లాగిన్",
    register: "నమోదు",
    logout: "లాగ్ అవుట్",
    dashboard: "డాష్‌బోర్డ్",
    myBookings: "నా బుకింగ్స్",
    addEquipment: "కొత్త పరికరాన్ని జోడించు",
    manageListings: "పరికరాల నిర్వహణ",
    rentPrice: "రోజుకు ₹{price}",
    bookNow: "ఇప్పుడే బుక్ చేయండి",
    location: "ప్రదేశం",
    availability: "లభ్యత",
    available: "అందుబాటులో ఉంది",
    rented: "అందుబాటులో లేదు",
    reviews: "సమీక్షలు",
    farmerDash: "రైతు డాష్‌బోర్డ్",
    ownerDash: "యజమాని డాష్‌బోర్డ్",
    adminDash: "అడ్మిన్ డాష్‌బోర్డ్",
    welcome: "స్వాగతం",
    priceRange: "ధర పరిధి",
    searchPlaceholder: "ట్రాక్టర్లు, స్ప్రేయర్లు, రోటవేటర్లు శోధించండి...",
    voiceInstruction: "వాయిస్ శోధన కొరకు మైక్ క్లిక్ చేయండి (ఉదాహరణ: 'ట్రాక్టర్')",
    teluguInstruction: "మీ వాయిస్ ఉపయోగించి శోధించండి (ఉదా: 'ట్రాక్టర్')"
  }
};

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState('en');

  const toggleLanguage = () => {
    setLang(prev => prev === 'en' ? 'te' : 'en');
  };

  const t = (key, replacements = {}) => {
    let text = translations[lang][key] || translations['en'][key] || key;
    Object.keys(replacements).forEach(rKey => {
      text = text.replace(`{${rKey}}`, replacements[rKey]);
    });
    return text;
  };

  return (
    <LanguageContext.Provider value={{ lang, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
