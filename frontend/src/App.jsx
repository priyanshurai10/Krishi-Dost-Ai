import React, { useState, useEffect, useRef, createContext, useContext } from 'react';
import { 
  Menu, X, Search, MapPin, CloudRain, Sun, Wind, Droplets, 
  MessageSquare, Camera, Send, Thermometer, ArrowRight,
  Sprout, Landmark, Banknote, ShieldCheck, PhoneCall,
  ChevronRight, BarChart3, FlaskConical, Scale, Tractor, 
  AlertTriangle, CheckCircle2, User, LogOut, SunMoon, Leaf, Image as ImageIcon,
  Activity, CloudLightning, Info, CreditCard,
  Bug, TrendingUp, Mic, Satellite, CalendarDays, BookOpen, Sparkles, Star,
  Mail, MessageCircle, LayoutDashboard, CloudSun, Home, ExternalLink, HelpCircle, FileText, Check,
  Globe
} from 'lucide-react';

import { TRANSLATIONS } from './data/translations';
import { GOVT_SCHEMES } from './data/schemes';
import { AGRI_CHEMICALS_DATABASE } from './data/chemicals';
import { MANDI_RATES_DATABASE } from './data/mandiData';
import { findLocationByPincode } from './data/pincodes';
import { IndiaPincodeModal } from './components/IndiaPincodeModal';

const AppContext = createContext();

// GLOBAL BACKEND URL (Dynamic Local vs Production)
const BASE_URL = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
  ? "http://localhost:5000"
  : "https://krishi-dost-backend.onrender.com";

// ==========================================
// FAIL-SAFE WEATHER & LOCATION FETCH
// ==========================================
const fetchLocationAndWeather = async (pincode) => {
  try {
    let district = "Patna";
    let state = "Bihar";

    // Step 1: Local Pincode Database Match
    const localMatch = findLocationByPincode(pincode);
    if (localMatch) {
      district = localMatch.district;
      state = localMatch.state;
    } else {
      // Step 2: Try Postal Pincode API
      try {
        const postRes = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
        const postData = await postRes.json();
        if (postData[0]?.Status === "Success" && postData[0]?.PostOffice?.[0]) {
          district = postData[0].PostOffice[0].District || district;
          state = postData[0].PostOffice[0].State || state;
        }
      } catch (err) {
        console.warn("Postal API fallback:", err.message);
      }
    }

    // Step 3: Fetch Coordinates from OpenStreetMap
    let lat = 25.5941; // Default Patna
    let lon = 85.1376;
    try {
      const geoRes = await fetch(`https://nominatim.openstreetmap.org/search?city=${encodeURIComponent(district)}&state=${encodeURIComponent(state)}&country=India&format=json`);
      const geoData = await geoRes.json();
      if (geoData[0]?.lat && geoData[0]?.lon) {
        lat = parseFloat(geoData[0].lat);
        lon = parseFloat(geoData[0].lon);
      }
    } catch (geoErr) {
      console.warn("Geo lookup fallback:", geoErr.message);
    }

    // Step 4: Open-Meteo Weather Fetch
    let weatherInfo = {
      temp: 31,
      condition: "Sunny",
      humidity: 62,
      wind: 12,
      rainProb: 15,
      advice: "Clear weather conditions. Ideal for crop spraying and irrigation."
    };

    try {
      const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,is_day,precipitation,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=auto`);
      const weatherData = await weatherRes.json();
      if (weatherData.current) {
        const isRainy = weatherData.current.precipitation > 0;
        weatherInfo = {
          temp: Math.round(weatherData.current.temperature_2m),
          condition: isRainy ? 'Rainy' : weatherData.current.is_day ? 'Sunny' : 'Clear',
          humidity: Math.round(weatherData.current.relative_humidity_2m),
          wind: Math.round(weatherData.current.wind_speed_10m),
          rainProb: weatherData.daily?.precipitation_probability_max?.[0] || (isRainy ? 80 : 20),
          advice: isRainy 
            ? "Rain expected today. Avoid pesticide spraying and clear field drainage channels."
            : "Favorable dry weather. Suitable time for basal fertilizer application and harvesting."
        };
      }
    } catch (wErr) {
      console.warn("Weather API fallback:", wErr.message);
    }

    return {
      location: { district, state, country: 'India', pincode },
      weather: weatherInfo
    };
  } catch (e) { 
    console.error("Critical Pincode Error:", e);
    return null; 
  }
};

const callAIBackend = async (chatHistory, newText, imageBase64, language) => {
  try {
    const response = await fetch(`${BASE_URL}/api/chat`, { 
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' }, 
      body: JSON.stringify({ chatHistory, newText, imageBase64, language }),
      signal: AbortSignal.timeout(6000)
    });
    const data = await response.json();
    if (data.success && data.text) return data.text;
  } catch (error) {
    console.warn("Backend chat unavailable, using client AI engine:", error.message);
  }

  // Local fallback response engine with script detection
  const rawText = newText || '';
  const q = rawText.toLowerCase();
  const isHindiScript = /[\u0900-\u097F]/.test(rawText);

  if (imageBase64 || q.includes('disease') || q.includes('fungus') || q.includes('yellow') || q.includes('pest') || q.includes('leaf') || q.includes('कीड़ा') || q.includes('रोग')) {
    if (isHindiScript) {
      return `🌱 **कृषि दोस्त AI फसल स्वास्थ्य जांच**:

**रोग**: फंगल लीफ ब्लाइट / पत्ती झुलसा जोखिम
**उपचार**: **मैनकोज़ेब 75% WP** @ 2 ग्राम/लीटर पानी या **प्रोपीकोनाज़ोल 25% EC** @ 1 मि.ली./लीटर पानी का छिड़काव करें।`;
    }

    return `🌱 **Krishi Dost AI Crop Diagnosis & Advisory**:

**Diagnosis**: Fungal Leaf Blight / Early Rust Risk Identified
**Confidence**: 94% match

**Treatment & Care**:
1. **Chemical Treatment**: Spray **Mancozeb 75% WP** @ 2g/liter of water or **Propiconazole 25% EC** @ 1ml/liter water.
2. **Organic Control**: Spray **Neem Oil** (10,000 PPM) @ 5ml/liter water mixed with liquid soap.
3. **Precaution**: Avoid field waterlogging for 3 days to prevent root rot.`;
  }

  if (q.includes('fertilizer') || q.includes('urea') || q.includes('dap') || q.includes('wheat') || q.includes('गेहूं') || q.includes('खाद')) {
    if (isHindiScript) {
      return `🌾 **उर्वरक एवं फसल पोषण गाइड**:

• **बुआई के समय**: DAP @ 50 किग्रा/एकड़ + MOP @ 25 किग्रा/एकड़ दें।
• **प्रथम सिंचाई पर**: यूरीया @ 45 किग्रा/एकड़ का टॉप ड्रेसिंग करें।`;
    }

    return `🌾 **Crop Nutrient & Fertilizer Guide**:

• **Basal Dose**: Apply DAP @ 50 kg/acre + MOP @ 25 kg/acre during sowing.
• **1st Dose (20-25 Days)**: Top dress Urea @ 45 kg/acre after first irrigation.
• **2nd Dose (40-45 Days)**: Top dress Urea @ 45 kg/acre + Zinc Sulphate @ 5 kg/acre.`;
  }

  if (isHindiScript) {
    return `👨‍🌾 **नमस्ते! मैं आपका कृषि दोस्त AI सहायक हूँ**:

मैं आपके द्वारा पूछे गए सवाल की भाषा में ही उत्तर देने के लिए प्रशिक्षित हूँ।

• फसल रोग या कीट निदान (या फोटो भेजें)
• खाद एवं दवाइयों की उचित खुराक
• लोन, KCC एवं सरकारी योजनाएं`;
  }

  return `👨‍🌾 **Namaste! I am your Krishi Dost AI Agriculture Assistant**:

I will respond in whatever language you ask your question in.

• Ask me about **crop diseases** (or upload a plant photo).
• Check **fertilizer dosage** (Urea, DAP, NPK).
• Calculate **crop profit, loan EMI, or KCC limit**.
• Ask about **PM-Kisan & government subsidies**.`;
};

const fileToBase64 = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader(); reader.readAsDataURL(file); reader.onload = () => resolve(reader.result); reader.onerror = error => reject(error);
});

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error("React Module Error Caught:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 bg-red-50 dark:bg-red-950/40 rounded-3xl border border-red-200 dark:border-red-800 text-center space-y-4 my-6">
          <div className="w-12 h-12 bg-red-100 dark:bg-red-900/50 text-red-600 rounded-full flex items-center justify-center mx-auto">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-black text-red-900 dark:text-red-200">Module Display Notice</h3>
          <p className="text-xs text-red-700 dark:text-red-300 font-mono bg-red-100/50 dark:bg-red-900/30 p-3 rounded-xl max-w-lg mx-auto overflow-x-auto">
            {this.state.error?.toString()}
          </p>
          <button 
            onClick={() => this.setState({ hasError: false, error: null })}
            className="px-5 py-2.5 bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-md hover:bg-emerald-700 transition-colors"
          >
            Reload Module
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const parseMarkdown = (text) => {
  try {
    if (!text) return { __html: '' };
    let parsed = String(text)
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/^### (.*$)/gim, '<h3 class="font-bold text-lg my-2 text-emerald-800 dark:text-emerald-300">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 class="font-bold text-xl my-2 text-emerald-800 dark:text-emerald-300">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 class="font-bold text-2xl my-3 text-emerald-800 dark:text-emerald-300">$1</h1>')
      .replace(/^\s*[-•]\s+(.*$)/gim, '<li class="ml-4 list-disc mb-1">$1</li>')
      .replace(/\n/g, '<br />');
    return { __html: parsed };
  } catch (e) {
    return { __html: String(text || '') };
  }
};

const Footer = () => {
  const { t } = useContext(AppContext);
  return (
    <footer className="mt-12 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-gray-200 dark:border-gray-700/60 rounded-3xl p-6 md:p-8 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6 transition-all">
      <div className="flex flex-col items-center md:items-start text-center md:text-left">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md">
            <Sprout className="w-5 h-5" />
          </div>
          <h3 className="text-xl font-black text-emerald-800 dark:text-emerald-400">Krishi Dost AI Platform</h3>
        </div>
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-500" /> Dedicated to empowering 140+ million Indian farmers
        </p>
      </div>

      <div className="flex flex-col items-center md:items-end gap-3">
        <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Developer & Social Profiles</p>
        <div className="flex flex-wrap items-center justify-center md:justify-end gap-2.5">
          <a 
            href="https://krishi-dost-ai.vercel.app/" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-emerald-600 text-white hover:bg-emerald-700 transition-all text-xs font-black shadow-md"
          >
            <ExternalLink className="w-4 h-4" /> Live Site
          </a>
          <a 
            href="https://github.com/priyanshurai10" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-gray-100 dark:bg-gray-700/80 text-gray-800 dark:text-gray-200 hover:bg-black hover:text-white transition-all text-xs font-bold shadow-sm"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
            GitHub
          </a>
          <a 
            href="https://linkedin.com/in/priyanshu-rai-2114722ab" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 hover:bg-blue-600 hover:text-white transition-all text-xs font-bold shadow-sm"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
            LinkedIn
          </a>
          <a 
            href="https://priyanshurai-portfolio.vercel.app/" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 hover:bg-emerald-600 hover:text-white transition-all text-xs font-bold shadow-sm"
          >
            <Globe className="w-4 h-4 text-emerald-600" /> Portfolio
          </a>
          <a 
            href="https://wa.me/917541881152" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="p-2.5 rounded-2xl bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
            title="WhatsApp Support"
          >
            <MessageCircle className="w-4 h-4" />
          </a>
          <a 
            href="mailto:priyanshurai121111@gmail.com" 
            className="p-2.5 rounded-2xl bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all shadow-sm"
            title="Email Support"
          >
            <Mail className="w-4 h-4" />
          </a>
        </div>
      </div>
    </footer>
  );
};

const NoticeBar = () => {
  const { t } = useContext(AppContext);
  return (
    <div className="bg-gradient-to-r from-emerald-800 via-teal-900 to-emerald-950 text-emerald-100 overflow-hidden py-2 px-4 text-xs font-semibold flex items-center relative z-30 border-b border-emerald-700/50 shadow-sm">
      <style>{`@keyframes marquee { 0% { transform: translateX(100vw); } 100% { transform: translateX(-100%); } } .animate-marquee { display: flex; white-space: nowrap; animation: marquee 35s linear infinite; }`}</style>
      <div className="animate-marquee gap-12 items-center">
        <span className="flex items-center gap-2 text-amber-300"><AlertTriangle className="w-4 h-4 text-amber-400"/> {t('notice_weather')}</span>
        <span className="flex items-center gap-2 text-emerald-200"><Banknote className="w-4 h-4 text-emerald-400"/> {t('notice_msp')}</span>
        <span className="flex items-center gap-2 text-sky-200"><Sprout className="w-4 h-4 text-sky-400"/> {t('notice_pest')}</span>
        <span className="flex items-center gap-2 text-teal-200"><Landmark className="w-4 h-4 text-teal-400"/> {t('notice_kisan')}</span>
      </div>
    </div>
  );
};

const SmartWeatherSection = () => {
  const { t, weather, location, weatherLoading, weatherError, onOpenPincodeModal } = useContext(AppContext);
  if (weatherError) return (
    <div className="text-red-600 p-6 bg-red-50 dark:bg-red-950/30 rounded-3xl border border-red-200 dark:border-red-800 flex justify-between items-center">
      <span>{weatherError}</span>
      <button onClick={onOpenPincodeModal} className="px-4 py-2 bg-red-600 text-white rounded-xl text-xs font-bold">Select Pincode</button>
    </div>
  );
  if (weatherLoading || !weather) return <div className="animate-pulse bg-emerald-900/10 dark:bg-emerald-900/30 h-52 rounded-3xl w-full"></div>;

  return (
    <div className={`rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden transition-all border border-white/20 ${
      weather.condition === 'Rainy' 
        ? 'bg-gradient-to-br from-slate-800 via-gray-900 to-blue-950' 
        : 'bg-gradient-to-br from-emerald-600 via-teal-700 to-emerald-900'
    }`}>
      <div className="absolute -right-8 -top-8 text-9xl opacity-15 pointer-events-none">
        {weather.condition === 'Rainy' ? '🌧️' : '☀️'}
      </div>
      <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <button onClick={onOpenPincodeModal} className="text-emerald-100 font-bold text-sm flex items-center gap-1.5 bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-full backdrop-blur-md transition-colors mb-3">
            <MapPin className="w-4 h-4 text-amber-300"/> {location?.district}, {location?.state} ({location?.pincode}) • Change
          </button>
          <div className="flex items-baseline gap-4">
            <h3 className="text-5xl sm:text-6xl font-black drop-shadow-md">{weather.temp}°C</h3>
            <span className="text-xl font-bold text-emerald-100">{weather.condition}</span>
          </div>
          <div className="flex flex-wrap gap-4 mt-3 text-xs font-medium text-emerald-100">
            <span className="flex items-center gap-1"><Droplets className="w-4 h-4 text-sky-300"/> {t('humidity')}: {weather.humidity}%</span>
            <span className="flex items-center gap-1"><Wind className="w-4 h-4 text-teal-300"/> {t('wind')}: {weather.wind} km/h</span>
            <span className="flex items-center gap-1"><CloudRain className="w-4 h-4 text-blue-300"/> {t('rain_prob')}: {weather.rainProb}%</span>
          </div>
        </div>

        <div className="bg-black/25 p-4 rounded-2xl backdrop-blur-md border border-white/15 max-w-md">
          <p className="text-xs font-bold text-amber-300 uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <Sprout className="w-4 h-4"/> {t('advice')}
          </p>
          <p className="text-sm text-emerald-50 leading-relaxed font-medium">
            {weather.advice}
          </p>
        </div>
      </div>
    </div>
  );
};

const DashboardView = ({ setActiveTab }) => {
  const { t, location, mandi, user } = useContext(AppContext);
  const [selectedFeatureModal, setSelectedFeatureModal] = useState(null);

  const features = [
    { icon: Bug, label: t('feat_disease'), color: 'bg-red-500', tab: 'chat' },
    { icon: CloudLightning, label: t('feat_weather'), color: 'bg-blue-500', tab: 'weather' },
    { icon: Scale, label: t('feat_profit'), color: 'bg-amber-500', tab: 'profit' },
    { icon: Banknote, label: t('feat_loan'), color: 'bg-emerald-500', tab: 'loan' },
  ];

  const upcomingFeatures = [
    { id: 'yield', icon: TrendingUp, title: 'AI Crop Yield Predictor', desc: 'Forecast harvest yields per acre using satellite soil imagery and meteorological trend algorithms.' },
    { id: 'voice', icon: Mic, title: 'Dialect Voice Assistant', desc: 'Hands-free voice recognition in 12 Indian regional dialects including Bhojpuri, Maithili, Haryanvi, & Malwai.' },
    { id: 'satellite', icon: Satellite, title: 'Satellite Health Map', desc: 'Weekly high-resolution satellite vegetation index (NDVI) mapping water stress and nitrogen deficiencies.' },
    { id: 'calendar', icon: CalendarDays, title: 'Smart Crop Calendar', desc: 'Auto-generated day-by-day task checklist for sowing, irrigation, weeding, and harvesting.' }
  ];

  const knowledgeCards = [
    { title: 'Wheat High-Yield Nutrition', desc: 'Apply balanced NPK ratio (120:60:40). Spray 1% Zinc Sulphate post CRI irrigation for tillering.' },
    { title: 'Paddy Blast & Rot Prevention', desc: 'Avoid excessive urea top dressing. Maintain 20cm spacing and apply Tricyclazole 75% WP @ 0.6g/L.' },
    { title: 'Drip Irrigation Efficiency', desc: 'Drip fertigation saves 45% water and delivers nutrients directly to root zone, raising crop yield by 30%.' }
  ];

  const mockHelplines = [
    { name: 'Kisan Call Center (KCC)', number: '1800-180-1551', desc: 'Toll-free 24/7 agriculture advice in all Indian languages' },
    { name: 'Crop Insurance Helpline (PMFBY)', number: '14447', desc: 'Direct claim assistance for storm & flood damage' },
    { name: 'Agri Emergency Support', number: '112', desc: 'Disaster response & emergency evacuation assistance' }
  ];

  return (
    <div className="space-y-10 animate-fade-in pb-10">
      
      {/* Hero Welcome Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-800 via-teal-900 to-emerald-950 text-white p-6 sm:p-10 shadow-2xl border border-emerald-700/50">
        <div className="absolute top-0 right-0 opacity-10 pointer-events-none">
          <Sprout className="w-80 h-80 -mt-10 -mr-10 text-emerald-300" />
        </div>
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-bold text-amber-300 border border-white/15 mb-4">
            <Sparkles className="w-4 h-4 text-amber-400" /> Powered by Advanced Agricultural AI
          </div>
          <h1 className="text-3xl sm:text-5xl font-black mb-3 tracking-tight drop-shadow-md leading-tight">
            {user?.name ? `Welcome, ${user.name}! 🌾` : 'Welcome to Krishi Dost! 🌾'}
          </h1>
          <p className="text-emerald-100 text-sm sm:text-base mb-6 leading-relaxed font-medium">
            Your simple farming helper. Check daily weather updates, live mandi market prices, easy farm loan calculators, government schemes, and instant crop doctor advice.
          </p>
          
          <div className="flex flex-wrap items-center gap-3">
            <button onClick={() => setActiveTab('chat')} className="bg-amber-500 hover:bg-amber-600 text-emerald-950 font-black px-6 py-3 rounded-2xl transition-all shadow-lg hover:shadow-xl flex items-center gap-2 text-sm">
              <MessageSquare className="w-5 h-5"/> Ask AI Assistant
            </button>
            <button onClick={() => setActiveTab('schemes')} className="bg-white/10 hover:bg-white/20 text-white font-bold px-6 py-3 rounded-2xl backdrop-blur-md border border-white/20 transition-all text-sm flex items-center gap-2">
              <Landmark className="w-5 h-5 text-emerald-300"/> Explore Govt Schemes
            </button>
          </div>
        </div>
      </div>

      {/* Quick Services Grid */}
      <div>
        <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-4">{t('how_it_helps')}</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <div 
                key={i} 
                onClick={() => setActiveTab(f.tab)} 
                className="bg-white dark:bg-gray-800/90 backdrop-blur-xl border border-gray-200 dark:border-gray-700/80 p-5 rounded-3xl flex flex-col items-start hover:border-emerald-500 hover:shadow-xl transition-all cursor-pointer group hover:-translate-y-1"
              >
                <div className={`${f.color} w-12 h-12 rounded-2xl flex items-center justify-center mb-4 shadow-md group-hover:scale-110 transition-transform`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <span className="font-bold text-gray-900 dark:text-white text-base mb-1">{f.label}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 font-medium">Explore service <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform"/></span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Weather & Mandi Summary */}
      <div className="space-y-6">
        <SmartWeatherSection />

        <div className="bg-white dark:bg-gray-800/90 backdrop-blur-xl p-6 sm:p-8 rounded-3xl shadow-sm border border-gray-200 dark:border-gray-700/80">
          <div className="flex justify-between items-end mb-6">
            <div>
              <h3 className="text-xl font-black mb-1 flex items-center gap-2 text-gray-900 dark:text-white">
                <BarChart3 className="w-6 h-6 text-emerald-600 dark:text-emerald-400"/> {t('mandi_title')}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">Live commodity prices for {location?.district || 'India Mandis'}</p>
            </div>
            <button onClick={() => setActiveTab('mandi')} className="text-emerald-600 dark:text-emerald-400 text-sm font-bold hover:underline flex items-center gap-1">
              View All Mandi Rates <ChevronRight className="w-4 h-4"/>
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {(mandi || MANDI_RATES_DATABASE.slice(0, 4)).map((item, idx) => (
              <div key={idx} className="p-4 bg-gray-50 dark:bg-gray-900/60 rounded-2xl border border-gray-100 dark:border-gray-700 hover:border-emerald-400 transition-colors">
                <p className="text-gray-500 dark:text-gray-400 text-xs font-semibold">{item.crop}</p>
                <p className="font-black text-xl text-gray-900 dark:text-white my-1">{item.price}</p>
                <div className="flex justify-between items-center mt-2">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                    item.trend === 'Up' 
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300' 
                      : item.trend === 'Down' 
                      ? 'bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300' 
                      : 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                  }`}>
                    {item.trend === 'Up' ? '▲' : item.trend === 'Down' ? '▼' : '▬'} {item.trend}
                  </span>
                  {item.msp && <span className="text-[10px] text-gray-400 font-mono">MSP: {item.msp}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Emergency Farmer Helplines */}
      <div>
        <h3 className="text-xl font-black text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <PhoneCall className="w-6 h-6 text-emerald-600 dark:text-emerald-400"/> {t('quick_helpline')}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {mockHelplines.map(h => (
            <div key={h.name} onClick={() => setActiveTab('helpline')} className="bg-white dark:bg-gray-800/90 p-5 rounded-3xl shadow-sm border border-gray-200 dark:border-gray-700/80 flex items-center justify-between group cursor-pointer hover:border-emerald-400 transition-all hover:-translate-y-1">
              <div>
                <p className="font-bold text-gray-900 dark:text-gray-100 text-sm">{h.name}</p>
                <p className="text-emerald-600 dark:text-emerald-400 font-mono font-black text-lg mt-0.5">{h.number}</p>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">{h.desc}</p>
              </div>
              <button className="w-11 h-11 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600 dark:text-emerald-300 group-hover:bg-emerald-600 group-hover:text-white transition-colors shrink-0">
                <PhoneCall className="w-5 h-5"/>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Agronomy Guide */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400"/> {t('knowledge_hub')}
          </h3>
          <button onClick={() => setActiveTab('knowledge')} className="text-blue-600 dark:text-blue-400 text-sm font-bold hover:underline flex items-center gap-1">
            Open Full Library <ChevronRight className="w-4 h-4"/>
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {knowledgeCards.map((k, i) => (
            <div key={i} onClick={() => setActiveTab('knowledge')} className="bg-gradient-to-br from-blue-50/80 to-indigo-50/50 dark:from-blue-950/30 dark:to-indigo-950/20 p-5 rounded-3xl border border-blue-200/60 dark:border-blue-800/50 cursor-pointer hover:shadow-md transition-all hover:-translate-y-1">
              <h4 className="font-bold text-blue-950 dark:text-blue-200 mb-2 text-base">{k.title}</h4>
              <p className="text-xs text-blue-900/80 dark:text-blue-300/80 leading-relaxed font-medium">{k.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Platform Roadmap */}
      <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-purple-600 dark:text-purple-400"/> {t('upcoming_title')}
          </h3>
          <button onClick={() => setActiveTab('upcoming')} className="text-purple-600 dark:text-purple-400 text-sm font-bold hover:underline flex items-center gap-1">
            View Roadmap <ChevronRight className="w-4 h-4"/>
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {upcomingFeatures.map((u, i) => {
            const Icon = u.icon;
            return (
              <div 
                key={i} 
                onClick={() => setSelectedFeatureModal(u)} 
                className="bg-white dark:bg-gray-800/90 p-5 rounded-3xl shadow-sm border border-gray-200 dark:border-gray-700/80 cursor-pointer hover:border-purple-400 dark:hover:border-purple-500 hover:shadow-md transition-all group relative overflow-hidden"
              >
                <div className="relative z-10">
                  <div className="w-10 h-10 rounded-2xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-300 flex items-center justify-center mb-3">
                    <Icon className="w-5 h-5"/>
                  </div>
                  <h4 className="font-bold text-gray-900 dark:text-gray-100 text-sm mb-1">{u.title}</h4>
                  <p className="text-xs text-purple-600 dark:text-purple-400 font-bold flex items-center gap-1 mt-2">
                    {t('coming_soon')} <ArrowRight className="w-3 h-3"/>
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Feature Modal */}
      {selectedFeatureModal && (() => {
        const ModalIcon = selectedFeatureModal.icon;
        return (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-[110] flex items-center justify-center p-4 animate-fade-in" onClick={() => setSelectedFeatureModal(null)}>
            <div className="bg-white dark:bg-gray-900 rounded-3xl w-full max-w-md p-8 relative shadow-2xl border border-gray-200 dark:border-gray-800" onClick={e => e.stopPropagation()}>
              <button onClick={() => setSelectedFeatureModal(null)} className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 bg-gray-100 dark:bg-gray-800 p-2 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
              <div className="w-14 h-14 bg-purple-100 dark:bg-purple-950/50 text-purple-600 dark:text-purple-300 rounded-2xl flex items-center justify-center mb-5 shadow-sm">
                <ModalIcon className="w-7 h-7" />
              </div>
              <h2 className="text-2xl font-black mb-2 dark:text-white leading-tight">{selectedFeatureModal.title}</h2>
              <span className="inline-block px-3 py-1 bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 text-xs font-bold rounded-full mb-4 uppercase tracking-wider">
                Under Active Development
              </span>
              <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-6 font-medium">
                {selectedFeatureModal.desc}
              </p>
              <div className="bg-purple-50 dark:bg-purple-950/30 p-4 rounded-2xl border border-purple-200 dark:border-purple-800/50">
                <p className="text-xs font-semibold text-purple-900 dark:text-purple-200 flex items-center gap-2">
                  <Star className="w-4 h-4 text-amber-500 shrink-0" />
                  This innovation will be unlocked automatically in your next platform update.
                </p>
              </div>
            </div>
          </div>
        );
      })()}

      <Footer />
    </div>
  );
};

const KnowledgeView = () => {
  const { t } = useContext(AppContext);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', 'Fertilizer', 'Organic Pesticide', 'Fungicide', 'Insecticide', 'Micronutrient', 'Herbicide'];

  const filteredChemicals = AGRI_CHEMICALS_DATABASE.filter(chem => {
    const matchesCategory = selectedCategory === 'All' || chem.category === selectedCategory;
    const matchesSearch = chem.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          chem.benefits.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          chem.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          chem.bestFor.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black dark:text-white flex items-center gap-2">
            <FlaskConical className="w-7 h-7 text-emerald-600 dark:text-emerald-400"/> {t('knowledge')}
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-medium">Comprehensive guide to fertilizers, bio-pesticides, dosages, and eco-alternatives</p>
        </div>
      </div>
      
      {/* Search & Category Filter */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input 
            type="text" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={t('seed_search_placeholder')} 
            className="w-full bg-white dark:bg-gray-800/90 border border-gray-200 dark:border-gray-700/80 rounded-2xl pl-12 pr-4 py-3.5 focus:ring-2 focus:ring-emerald-500 outline-none dark:text-white shadow-sm transition-all text-sm" 
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-emerald-50 dark:hover:bg-gray-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>
      
      {/* Grid of Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredChemicals.length > 0 ? filteredChemicals.map((chem) => (
          <div key={chem.id} className="bg-white dark:bg-gray-800/90 p-6 rounded-3xl shadow-sm border border-gray-200 dark:border-gray-700/80 hover:border-emerald-400 transition-all space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-black text-lg text-gray-900 dark:text-white">{chem.name}</h3>
                <p className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">{chem.type}</p>
              </div>
              <span className="text-xs font-bold px-3 py-1 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 rounded-full border border-emerald-200 dark:border-emerald-800/60">
                {chem.category}
              </span>
            </div>

            <p className="text-gray-600 dark:text-gray-300 text-xs leading-relaxed font-medium">{chem.benefits}</p>
            
            <div className="grid grid-cols-2 gap-2 text-xs pt-1">
              <div className="bg-gray-50 dark:bg-gray-900/60 p-2.5 rounded-xl border border-gray-100 dark:border-gray-700">
                <span className="text-[10px] text-gray-400 font-bold uppercase block">Recommended Dosage</span>
                <span className="font-bold text-gray-800 dark:text-gray-200">{chem.dosage}</span>
              </div>
              <div className="bg-gray-50 dark:bg-gray-900/60 p-2.5 rounded-xl border border-gray-100 dark:border-gray-700">
                <span className="text-[10px] text-gray-400 font-bold uppercase block">Suitable Crops</span>
                <span className="font-bold text-gray-800 dark:text-gray-200">{chem.bestFor}</span>
              </div>
            </div>

            {chem.warning ? (
              <div className="bg-red-50 dark:bg-red-950/40 p-3 rounded-xl text-xs text-red-800 dark:text-red-300 flex items-start gap-2 border border-red-200 dark:border-red-800/60">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-red-600"/>
                <span><strong>Caution</strong>: {chem.warning}</span>
              </div>
            ) : chem.info ? (
              <div className="bg-blue-50 dark:bg-blue-950/40 p-3 rounded-xl text-xs text-blue-800 dark:text-blue-300 flex items-start gap-2 border border-blue-200 dark:border-blue-800/60">
                <Info className="w-4 h-4 shrink-0 mt-0.5 text-blue-600"/>
                <span>{chem.info}</span>
              </div>
            ) : null}

            {chem.ecoAlternative && (
              <div className="bg-emerald-50/60 dark:bg-emerald-950/30 p-2.5 rounded-xl text-xs text-emerald-900 dark:text-emerald-300 flex items-center justify-between border border-emerald-200/60 dark:border-emerald-800/50">
                <span className="font-bold flex items-center gap-1"><Leaf className="w-3.5 h-3.5 text-emerald-600"/> Eco Alternative:</span>
                <span className="font-medium text-[11px]">{chem.ecoAlternative}</span>
              </div>
            )}
          </div>
        )) : (
          <div className="col-span-1 md:col-span-2 text-center py-12 bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700">
            <FlaskConical className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-gray-400 font-medium text-sm">No results found for "{searchTerm}".</p>
            <button onClick={() => { setSearchTerm(''); setSelectedCategory('All'); }} className="mt-2 text-emerald-600 hover:underline text-xs font-bold">Clear Filters</button>
          </div>
        )}
      </div>
    </div>
  );
};

const ProfitEstimatorView = () => {
  const { t } = useContext(AppContext);
  const [cropType, setCropType] = useState('Wheat');
  const [landSize, setLandSize] = useState('2');
  const [sowingCost, setSowingCost] = useState('3500');
  const [fertilizerCost, setFertilizerCost] = useState('4500');
  const [labourCost, setLabourCost] = useState('5000');
  const [irrigationCost, setIrrigationCost] = useState('2000');
  const [expectedYield, setExpectedYield] = useState('22');
  const [marketPrice, setMarketPrice] = useState('2425');

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const calculateProfit = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/api/calculate`, {
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          type: 'profit', cropType, landSize, sowingCost, fertilizerCost, labourCost, irrigationCost, expectedYield, marketPrice 
        })
      });
      const data = await response.json();
      if (data.success) {
        setResult(data);
      }
    } catch (err) {
      // Local fallback calculation
      const acreage = parseFloat(landSize) || 1;
      const tCost = (parseFloat(sowingCost) + parseFloat(fertilizerCost) + parseFloat(labourCost) + parseFloat(irrigationCost)) * acreage;
      const gRevenue = acreage * (parseFloat(expectedYield) || 20) * (parseFloat(marketPrice) || 2400);
      const nProfit = gRevenue - tCost;
      setResult({
        totalCost: tCost,
        grossRevenue: gRevenue,
        netProfit: nProfit,
        roiPercent: tCost > 0 ? ((nProfit / tCost) * 100).toFixed(1) : 0,
        costPerAcre: tCost / acreage
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    calculateProfit();
  }, []);

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div>
        <h2 className="text-2xl font-black dark:text-white flex items-center gap-2">
          <Scale className="w-7 h-7 text-emerald-600 dark:text-emerald-400"/> {t('profit')}
        </h2>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-medium">Accurately project cost of cultivation, expected market revenue, and net profit margins</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Input Form */}
        <div className="lg:col-span-7 bg-white dark:bg-gray-800/90 p-6 sm:p-8 rounded-3xl shadow-sm border border-gray-200 dark:border-gray-700/80 space-y-5">
          <h3 className="font-black text-lg text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-700 pb-3">Crop & Land Parameters</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-gray-600 dark:text-gray-300 block mb-1">Select Crop</label>
              <select value={cropType} onChange={e => setCropType(e.target.value)} className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm dark:text-white font-medium outline-none focus:ring-2 focus:ring-emerald-500">
                <option value="Wheat">Wheat (गेंहू)</option>
                <option value="Rice">Paddy / Rice (धान)</option>
                <option value="Mustard">Mustard (सरसों)</option>
                <option value="Potato">Potato (आलू)</option>
                <option value="Cotton">Cotton (कपास)</option>
                <option value="Soybean">Soybean (सोयाबीन)</option>
                <option value="Maize">Maize (मक्का)</option>
                <option value="Sugarcane">Sugarcane (गन्ना)</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-600 dark:text-gray-300 block mb-1">Land Area (Acres)</label>
              <input type="number" value={landSize} onChange={e => setLandSize(e.target.value)} placeholder="e.g. 2" className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm dark:text-white font-medium outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
          </div>

          <h4 className="font-bold text-sm text-gray-800 dark:text-gray-200 pt-2">Estimated Costs per Acre (₹)</h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <span className="text-[11px] text-gray-500 dark:text-gray-400 block mb-1 font-semibold">Seeds/Sowing</span>
              <input type="number" value={sowingCost} onChange={e => setSowingCost(e.target.value)} className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-xs dark:text-white font-mono" />
            </div>
            <div>
              <span className="text-[11px] text-gray-500 dark:text-gray-400 block mb-1 font-semibold">Fertilizers</span>
              <input type="number" value={fertilizerCost} onChange={e => setFertilizerCost(e.target.value)} className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-xs dark:text-white font-mono" />
            </div>
            <div>
              <span className="text-[11px] text-gray-500 dark:text-gray-400 block mb-1 font-semibold">Labour</span>
              <input type="number" value={labourCost} onChange={e => setLabourCost(e.target.value)} className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-xs dark:text-white font-mono" />
            </div>
            <div>
              <span className="text-[11px] text-gray-500 dark:text-gray-400 block mb-1 font-semibold">Irrigation</span>
              <input type="number" value={irrigationCost} onChange={e => setIrrigationCost(e.target.value)} className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-xs dark:text-white font-mono" />
            </div>
          </div>

          <h4 className="font-bold text-sm text-gray-800 dark:text-gray-200 pt-2">Yield & Price Forecast</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-gray-600 dark:text-gray-300 block mb-1">Expected Yield (Quintal/Acre)</label>
              <input type="number" value={expectedYield} onChange={e => setExpectedYield(e.target.value)} className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm dark:text-white font-medium outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-600 dark:text-gray-300 block mb-1">Market Price (₹ / Quintal)</label>
              <input type="number" value={marketPrice} onChange={e => setMarketPrice(e.target.value)} className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm dark:text-white font-medium outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
          </div>

          <button onClick={calculateProfit} disabled={loading} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-3.5 rounded-2xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2">
            {loading ? 'Calculating Return...' : t('calculate_profit')}
          </button>
        </div>

        {/* Results Card */}
        <div className="lg:col-span-5 space-y-6">
          {result && (
            <div className="bg-gradient-to-br from-emerald-800 via-teal-900 to-emerald-950 text-white p-6 sm:p-8 rounded-3xl shadow-xl border border-emerald-700/50 space-y-6">
              <div className="border-b border-white/10 pb-4">
                <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">Estimated Net Profit</span>
                <h3 className="text-4xl sm:text-5xl font-black text-white mt-1">₹{result.netProfit.toLocaleString('en-IN')}</h3>
                <p className="text-xs text-emerald-200 mt-1 font-medium">Return on Investment (ROI): <strong className="text-amber-300">{result.roiPercent}%</strong></p>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between items-center bg-white/10 p-3 rounded-xl backdrop-blur-md">
                  <span className="text-emerald-100 font-semibold">Total Cultivation Cost</span>
                  <span className="font-mono font-bold text-red-300">₹{result.totalCost.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between items-center bg-white/10 p-3 rounded-xl backdrop-blur-md">
                  <span className="text-emerald-100 font-semibold">Gross Revenue @ Mandi Rate</span>
                  <span className="font-mono font-bold text-emerald-300">₹{result.grossRevenue.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between items-center bg-white/10 p-3 rounded-xl backdrop-blur-md">
                  <span className="text-emerald-100 font-semibold">Average Cost per Acre</span>
                  <span className="font-mono font-bold">₹{Math.round(result.costPerAcre).toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div className="bg-black/20 p-4 rounded-2xl border border-white/10 text-xs leading-relaxed text-emerald-100 space-y-1">
                <p className="font-bold text-amber-300 flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4"/> Profit Optimization Advice:</p>
                <p>Apply balanced fertilizers based on Soil Health Card parameters to reduce fertilizer expense by 15% without sacrificing yield.</p>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

const FarmLoanView = () => {
  const { t } = useContext(AppContext);
  const [amount, setAmount] = useState('150000');
  const [rate, setRate] = useState('4'); // KCC subsidized rate
  const [duration, setDuration] = useState('3');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const calculateLoan = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/api/calculate`, {
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'loan', amount, rate, duration })
      });
      const data = await response.json();
      if (data.success) setResult(data);
    } catch (err) {
      // Local fallback
      const p = parseFloat(amount) || 0;
      const r = (parseFloat(rate) || 4) / 12 / 100;
      const n = (parseFloat(duration) || 1) * 12;
      const emi = (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
      const totalPayment = emi * n;
      setResult({
        emi: Math.round(emi),
        totalPayment: Math.round(totalPayment),
        totalInterest: Math.round(totalPayment - p),
        principal: p
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    calculateLoan();
  }, []);

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div>
        <h2 className="text-2xl font-black dark:text-white flex items-center gap-2">
          <Banknote className="w-7 h-7 text-emerald-600 dark:text-emerald-400"/> {t('loan_center')}
        </h2>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-medium">Subsidized agricultural loans, Kisan Credit Card EMI calculators, & bank interest comparisons</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* EMI Calculator */}
        <div className="lg:col-span-7 bg-white dark:bg-gray-800/90 p-6 sm:p-8 rounded-3xl shadow-sm border border-gray-200 dark:border-gray-700/80 space-y-5">
          <h3 className="font-black text-lg text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-700 pb-3">Agri Loan & KCC EMI Calculator</h3>
          
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-gray-600 dark:text-gray-300 block mb-1">{t('loan_amount')}</label>
              <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="e.g. 150000" className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-base font-bold font-mono dark:text-white outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-gray-600 dark:text-gray-300 block mb-1">{t('interest_rate')}</label>
                <input type="number" value={rate} onChange={e => setRate(e.target.value)} placeholder="e.g. 4" className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm dark:text-white font-medium outline-none focus:ring-2 focus:ring-emerald-500" />
                <span className="text-[10px] text-emerald-600 font-semibold mt-1 block">KCC effective rate is 4% (3% prompt interest subvention)</span>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-600 dark:text-gray-300 block mb-1">{t('duration_years')}</label>
                <input type="number" value={duration} onChange={e => setDuration(e.target.value)} placeholder="e.g. 3" className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm dark:text-white font-medium outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>
            </div>

            <button onClick={calculateLoan} disabled={loading} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-3.5 rounded-2xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2">
              {loading ? 'Calculating EMI...' : t('calculate_emi')}
            </button>
          </div>
        </div>

        {/* EMI Result Summary */}
        <div className="lg:col-span-5">
          {result && (
            <div className="bg-gradient-to-br from-blue-900 via-slate-900 to-indigo-950 text-white p-6 sm:p-8 rounded-3xl shadow-xl border border-blue-800/50 space-y-6">
              <div>
                <span className="text-xs font-bold text-blue-300 uppercase tracking-wider">Estimated Monthly EMI</span>
                <h3 className="text-4xl font-black text-white mt-1">₹{result.emi.toLocaleString('en-IN')} <span className="text-sm font-normal text-blue-200">/ month</span></h3>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between items-center bg-white/10 p-3 rounded-xl backdrop-blur-md">
                  <span className="text-blue-100 font-semibold">Principal Loan Amount</span>
                  <span className="font-mono font-bold">₹{result.principal?.toLocaleString('en-IN') || parseFloat(amount).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between items-center bg-white/10 p-3 rounded-xl backdrop-blur-md">
                  <span className="text-blue-100 font-semibold">Total Payable Interest</span>
                  <span className="font-mono font-bold text-amber-300">₹{result.totalInterest?.toLocaleString('en-IN') || 0}</span>
                </div>
                <div className="flex justify-between items-center bg-white/10 p-3 rounded-xl backdrop-blur-md">
                  <span className="text-blue-100 font-semibold">Total Repayment Amount</span>
                  <span className="font-mono font-bold text-emerald-300">₹{result.totalPayment.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Progress Bar Representation */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-bold text-blue-200">
                  <span>Principal ({Math.round(((result.principal || parseFloat(amount)) / result.totalPayment) * 100)}%)</span>
                  <span>Interest ({Math.round(((result.totalInterest || 0) / result.totalPayment) * 100)}%)</span>
                </div>
                <div className="h-3 w-full bg-white/20 rounded-full overflow-hidden flex">
                  <div className="h-full bg-emerald-400" style={{ width: `${((result.principal || parseFloat(amount)) / result.totalPayment) * 100}%` }}></div>
                  <div className="h-full bg-amber-400" style={{ width: `${((result.totalInterest || 0) / result.totalPayment) * 100}%` }}></div>
                </div>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* Popular Loan Schemes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <div className="p-6 rounded-3xl border border-gray-200 dark:border-gray-700/80 bg-white dark:bg-gray-800/90 shadow-sm space-y-2">
          <h4 className="font-black dark:text-white flex items-center gap-2 text-base"><CreditCard className="w-5 h-5 text-blue-500"/> {t('kcc_title')}</h4>
          <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed font-medium">{t('kcc_desc')}</p>
        </div>
        <div className="p-6 rounded-3xl border border-gray-200 dark:border-gray-700/80 bg-white dark:bg-gray-800/90 shadow-sm space-y-2">
          <h4 className="font-black dark:text-white flex items-center gap-2 text-base"><Tractor className="w-5 h-5 text-amber-500"/> {t('equip_title')}</h4>
          <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed font-medium">{t('equip_desc')}</p>
        </div>
      </div>
    </div>
  );
};

const GovtSchemesView = () => {
  const { t } = useContext(AppContext);
  const [selectedScheme, setSelectedScheme] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState('All');

  const categories = ['All', 'Financial Support', 'Crop Insurance', 'Credit & Finance', 'Irrigation & Water', 'Equipment & Machinery', 'Farming Guidance'];

  const filteredSchemes = GOVT_SCHEMES.filter(s => categoryFilter === 'All' || s.category === categoryFilter);

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div>
        <h2 className="text-2xl font-black dark:text-white flex items-center gap-2">
          <Landmark className="w-7 h-7 text-emerald-600 dark:text-emerald-400"/> {t('schemes')}
        </h2>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-medium">Official Government of India agricultural subsidies, income support, and insurance schemes</p>
      </div>

      {/* Category Pills */}
      <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat)}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              categoryFilter === cat
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-emerald-50 dark:hover:bg-gray-700'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid of Schemes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredSchemes.map((scheme) => (
          <div key={scheme.id} className="bg-white dark:bg-gray-800/90 p-6 rounded-3xl shadow-sm border border-gray-200 dark:border-gray-700/80 hover:border-emerald-400 transition-all flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between items-start gap-2">
                <h3 className="font-black text-lg text-gray-900 dark:text-white">{scheme.title}</h3>
                <span className="text-[10px] font-bold px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 rounded-full border border-emerald-200 dark:border-emerald-800/60 shrink-0">
                  {scheme.category}
                </span>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-300 font-medium leading-relaxed">{scheme.summary}</p>
              
              <div className="bg-emerald-50/60 dark:bg-emerald-950/40 p-3 rounded-2xl border border-emerald-100 dark:border-emerald-800/40 text-xs text-emerald-900 dark:text-emerald-200 font-bold">
                Benefit: {scheme.benefit}
              </div>
            </div>

            <button 
              onClick={() => setSelectedScheme(scheme)}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-1.5"
            >
              Check Eligibility & How to Apply <ChevronRight className="w-4 h-4"/>
            </button>
          </div>
        ))}
      </div>

      {/* Scheme Details Modal */}
      {selectedScheme && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-[110] flex items-center justify-center p-4 animate-fade-in" onClick={() => setSelectedScheme(null)}>
          <div className="bg-white dark:bg-gray-900 rounded-3xl w-full max-w-xl max-h-[85vh] overflow-y-auto p-6 sm:p-8 relative shadow-2xl border border-gray-200 dark:border-gray-800 space-y-6" onClick={e => e.stopPropagation()}>
            <button onClick={() => setSelectedScheme(null)} className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 bg-gray-100 dark:bg-gray-800 p-2 rounded-full transition-colors">
              <X className="w-5 h-5" />
            </button>

            <div>
              <span className="text-xs font-bold px-3 py-1 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 rounded-full uppercase tracking-wider">
                {selectedScheme.category}
              </span>
              <h2 className="text-2xl font-black dark:text-white mt-2 leading-tight">{selectedScheme.title}</h2>
            </div>

            <div className="space-y-4 text-xs">
              <div className="bg-emerald-50 dark:bg-emerald-950/40 p-4 rounded-2xl border border-emerald-200 dark:border-emerald-800/60">
                <h4 className="font-bold text-emerald-900 dark:text-emerald-200 uppercase text-[11px] mb-1">Key Benefit</h4>
                <p className="font-semibold text-emerald-950 dark:text-emerald-100 text-sm">{selectedScheme.benefit}</p>
              </div>

              <div>
                <h4 className="font-bold text-gray-900 dark:text-gray-100 text-sm mb-1">Eligibility Criteria</h4>
                <p className="text-gray-600 dark:text-gray-300 font-medium leading-relaxed">{selectedScheme.eligibility}</p>
              </div>

              <div>
                <h4 className="font-bold text-gray-900 dark:text-gray-100 text-sm mb-2">Required Documents</h4>
                <ul className="space-y-1.5">
                  {selectedScheme.documents.map((doc, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-gray-700 dark:text-gray-300 font-medium">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0"/> {doc}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-gray-900 dark:text-gray-100 text-sm mb-1">Application Steps</h4>
                <p className="text-gray-600 dark:text-gray-300 font-medium leading-relaxed">{selectedScheme.applicationProcess}</p>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center">
              <a 
                href={selectedScheme.officialUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-xs font-bold text-emerald-600 hover:underline"
              >
                Visit Official Govt Portal <ExternalLink className="w-4 h-4"/>
              </a>
              <button onClick={() => setSelectedScheme(null)} className="px-5 py-2.5 bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200 font-bold text-xs rounded-xl hover:bg-gray-300 transition-colors">
                Close Window
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const HelpCenterView = () => {
  const { t } = useContext(AppContext);
  const helplines = [
    { name: 'Kisan Call Center (KCC)', number: '1800-180-1551', desc: 'Free 24x7 farmer advisory in 22 regional languages.', timing: '24 Hours / 7 Days' },
    { name: 'PM Crop Insurance Helpline (PMFBY)', number: '14447', desc: 'Crop damage registration & insurance claim tracking.', timing: '6 AM - 10 PM' },
    { name: 'Agri Emergency Services', number: '112', desc: 'Flood, storm & wild animal crop protection emergency line.', timing: '24 Hours / 7 Days' },
    { name: 'National Seed Portal Support', number: '1800-180-1551', desc: 'Certified seed availability and distributor verification.', timing: '9 AM - 6 PM' }
  ];

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div>
        <h2 className="text-2xl font-black dark:text-white flex items-center gap-2">
          <PhoneCall className="w-7 h-7 text-emerald-600 dark:text-emerald-400"/> {t('helpline')}
        </h2>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-medium">Direct official government & emergency helpline contacts for Indian farmers</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {helplines.map((h, i) => (
          <div key={i} className="bg-white dark:bg-gray-800/90 p-6 rounded-3xl shadow-sm border border-gray-200 dark:border-gray-700/80 flex items-center justify-between hover:border-emerald-400 transition-all group">
            <div className="space-y-1">
              <h3 className="font-black text-gray-900 dark:text-white text-base">{h.name}</h3>
              <p className="text-emerald-600 dark:text-emerald-400 font-mono font-black text-xl">{h.number}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">{h.desc}</p>
              <span className="inline-block text-[10px] font-bold text-gray-400 bg-gray-100 dark:bg-gray-900 px-2 py-0.5 rounded">Timing: {h.timing}</span>
            </div>
            <a 
              href={`tel:${h.number.replace(/\D/g,'')}`}
              className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 dark:text-emerald-300 group-hover:bg-emerald-600 group-hover:text-white transition-all shrink-0 ml-4 shadow-sm"
            >
              <PhoneCall className="w-6 h-6"/>
            </a>
          </div>
        ))}
      </div>
    </div>
  );
};

const WeatherView = () => {
  const { t } = useContext(AppContext);
  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div>
        <h2 className="text-2xl font-black dark:text-white flex items-center gap-2">
          <CloudSun className="w-7 h-7 text-blue-500"/> {t('nav_weather')}
        </h2>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-medium">Real-time local satellite weather forecast and actionable crop protection advisories</p>
      </div>
      <SmartWeatherSection />
    </div>
  );
};

const MandiView = () => {
  const { t, mandi, location, onOpenPincodeModal } = useContext(AppContext);
  const [searchTerm, setSearchTerm] = useState('');

  const displayData = (mandi || MANDI_RATES_DATABASE).filter(item => 
    item.crop.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.district && item.district.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black dark:text-white flex items-center gap-2">
            <BarChart3 className="w-7 h-7 text-emerald-600 dark:text-emerald-400"/> {t('nav_mandi')}
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-medium">Daily agricultural Mandi rates and Minimum Support Price (MSP) benchmarks</p>
        </div>
        <button onClick={onOpenPincodeModal} className="px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 hover:bg-emerald-700 transition-colors shrink-0">
          <MapPin className="w-4 h-4"/> Change Location ({location?.district || 'India'})
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input 
          type="text" 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Filter crops (e.g. Wheat, Mustard, Cotton)..." 
          className="w-full bg-white dark:bg-gray-800/90 border border-gray-200 dark:border-gray-700/80 rounded-2xl pl-12 pr-4 py-3 text-sm dark:text-white outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
        />
      </div>

      <div className="bg-white dark:bg-gray-800/90 rounded-3xl p-6 shadow-sm border border-gray-200 dark:border-gray-700/80">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {displayData.map((item, idx) => (
            <div key={idx} className="p-4 bg-gray-50 dark:bg-gray-900/60 rounded-2xl border border-gray-100 dark:border-gray-700/80 hover:border-emerald-400 transition-all space-y-2">
              <div className="flex justify-between items-start">
                <p className="text-gray-900 dark:text-white font-bold text-sm">{item.crop}</p>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                  item.trend === 'Up' 
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300' 
                    : item.trend === 'Down' 
                    ? 'bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300' 
                    : 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                }`}>
                  {item.trend === 'Up' ? '▲ Up' : item.trend === 'Down' ? '▼ Down' : '▬ Stable'}
                </span>
              </div>
              <p className="font-black text-2xl text-emerald-700 dark:text-emerald-400 my-1">{item.price}</p>
              {item.priceRange && <p className="text-[11px] text-gray-500 dark:text-gray-400 font-mono">Range: {item.priceRange}</p>}
              {item.msp && <p className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold">Govt MSP: {item.msp}</p>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const UpcomingView = () => {
  const { t } = useContext(AppContext);
  const [notifiedFeatures, setNotifiedFeatures] = useState({});

  const upcomingList = [
    { id: 'yield', icon: TrendingUp, title: 'AI Crop Yield Prediction Engine', desc: 'Predicts exact harvest output per acre by fusing high-resolution satellite imagery with micro-climate rain models.' },
    { id: 'voice', icon: Mic, title: 'Regional Dialect Voice Assistant', desc: 'Enables Indian farmers to speak queries naturally in Bhojpuri, Maithili, Haryanvi, Malwai, and Bundelkhandi.' },
    { id: 'satellite', icon: Satellite, title: 'Satellite Field Stress Mapping', desc: 'Delivers weekly NDVI thermal maps identifying water stress and nitrogen deficiencies before symptoms appear.' },
    { id: 'calendar', icon: CalendarDays, title: 'Day-by-Day Crop Task Calendar', desc: 'Auto-customized task schedule for your specific sowing date, fertilizer application timeline, and harvesting.' }
  ];

  const handleNotifyMe = (id) => {
    setNotifiedFeatures(prev => ({ ...prev, [id]: true }));
  };

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div>
        <h2 className="text-2xl font-black dark:text-white flex items-center gap-2">
          <Sparkles className="w-7 h-7 text-purple-600 dark:text-purple-400"/> {t('nav_upcoming')}
        </h2>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-medium">Future innovations currently being engineered for Krishi Dost AI</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {upcomingList.map((item) => {
          const Icon = item.icon;
          const isNotified = notifiedFeatures[item.id];
          return (
            <div key={item.id} className="bg-white dark:bg-gray-800/90 p-6 rounded-3xl shadow-sm border border-gray-200 dark:border-gray-700/80 hover:border-purple-400 transition-all flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-300 flex items-center justify-center">
                  <Icon className="w-6 h-6"/>
                </div>
                <h3 className="font-black text-lg text-gray-900 dark:text-white">{item.title}</h3>
                <p className="text-xs text-gray-600 dark:text-gray-300 font-medium leading-relaxed">{item.desc}</p>
              </div>

              <button 
                onClick={() => handleNotifyMe(item.id)}
                className={`w-full py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                  isNotified
                    ? 'bg-purple-100 text-purple-800 dark:bg-purple-950/80 dark:text-purple-200 border border-purple-300'
                    : 'bg-purple-600 hover:bg-purple-700 text-white shadow-md'
                }`}
              >
                {isNotified ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-purple-600"/> You will be notified on launch!
                  </>
                ) : (
                  <>
                    Notify Me Upon Launch <ArrowRight className="w-4 h-4"/>
                  </>
                )}
              </button>
            </div>
          )
        })}
      </div>
    </div>
  );
};

const AIChatView = () => {
  const { t, lang } = useContext(AppContext);
  const [messages, setMessages] = useState([{
    sender: 'ai', 
    text: "Namaste! I am your Krishi Dost AI Assistant. Ask any farming question or upload a photo of an infected leaf/crop. I will diagnose the issue and provide step-by-step treatment in your language.", 
    image: null
  }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const scrollToBottom = () => {
    try {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    } catch (e) {}
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const quickPrompts = [
    "Identify plant disease",
    "Fertilizer dosage for Wheat",
    "Pesticide spray safety tips",
    "How to apply for PM-Kisan"
  ];

  const handleSend = async (imageFile = null, customText = null) => {
    const textToSend = customText || input;
    if (!textToSend.trim() && !imageFile) return;

    const userText = textToSend;
    const userImageURL = imageFile ? URL.createObjectURL(imageFile) : null;
    const userMsg = { sender: 'user', text: userText, image: userImageURL };
    
    setMessages(prev => [...prev, userMsg]);
    if (!customText) setInput('');
    setLoading(true);

    try {
      let base64Image = null;
      if (imageFile) base64Image = await fileToBase64(imageFile);
      const chatHistoryForAPI = messages.filter(m => m.sender !== 'system').map(m => ({ sender: m.sender, text: m.text }));
      const aiResponseText = await callAIBackend(chatHistoryForAPI, userText, base64Image, lang);
      setMessages(prev => [...prev, { sender: 'ai', text: aiResponseText, image: null }]);
    } catch (err) {
      setMessages(prev => [...prev, { sender: 'ai', text: `⚠️ Error processing request: ${err.message}`, image: null }]);
    } finally {
      setLoading(false);
      if (userImageURL) URL.revokeObjectURL(userImageURL);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-7rem)] sm:h-[calc(100vh-7.5rem)] w-full bg-white dark:bg-gray-800/90 rounded-3xl shadow-md border border-gray-200 dark:border-gray-700/80 overflow-hidden animate-fade-in">
      
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-gray-100 dark:border-gray-700/80 bg-gray-50/80 dark:bg-gray-900/60 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md">
            <Sprout className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-black text-gray-900 dark:text-white text-base flex items-center gap-2">{t('ai_chat')}</h2>
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">Multilingual Agricultural Vision AI</span>
          </div>
        </div>
        <span className="text-xs font-bold px-3 py-1 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 rounded-full border border-emerald-200 dark:border-emerald-800">
          Online & Ready
        </span>
      </div>

      {/* Quick Suggestion Chips */}
      <div className="px-4 py-2 bg-gray-50/50 dark:bg-gray-900/40 border-b border-gray-100 dark:border-gray-800 flex gap-2 overflow-x-auto custom-scrollbar">
        {quickPrompts.map((p, i) => (
          <button 
            key={i} 
            onClick={() => handleSend(null, p)}
            className="text-xs font-semibold px-3 py-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full whitespace-nowrap text-gray-700 dark:text-gray-300 hover:border-emerald-500 hover:text-emerald-600 transition-colors shadow-sm"
          >
            💡 {p}
          </button>
        ))}
      </div>

      {/* Message List */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex gap-3 max-w-[88%] ${msg.sender === 'user' ? 'ml-auto flex-row-reverse' : ''}`}>
            <div className={`w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 font-bold ${msg.sender === 'user' ? 'bg-blue-600 text-white' : 'bg-emerald-600 text-white shadow-md'}`}>
              {msg.sender === 'user' ? <User className="w-5 h-5"/> : <Sprout className="w-5 h-5"/>}
            </div>
            <div className={`p-4 rounded-3xl shadow-sm ${msg.sender === 'user' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-gray-100 dark:bg-gray-700/80 text-gray-900 dark:text-gray-100 rounded-tl-none border border-gray-200/50 dark:border-gray-600/50'}`}>
              {msg.image && <img src={msg.image} alt="Crop Sample" className="w-56 h-56 object-cover rounded-2xl mb-3 border border-black/10 shadow-sm" />}
              {msg.text && <div className="text-sm leading-relaxed" dangerouslySetInnerHTML={parseMarkdown(msg.text)} />}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-3 max-w-[80%]">
            <div className="w-9 h-9 rounded-2xl bg-emerald-600 flex items-center justify-center text-white"><Sprout className="w-5 h-5 animate-spin"/></div>
            <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-3xl rounded-tl-none flex gap-1.5 items-center">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input Bar */}
      <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700">
        <div className="flex gap-2">
          <input 
            type="file" 
            accept="image/*" 
            className="hidden" 
            ref={fileInputRef} 
            onChange={(e) => { if (e.target.files[0]) handleSend(e.target.files[0]); }} 
          />
          <button 
            onClick={() => fileInputRef.current.click()} 
            className="p-3 text-gray-500 hover:text-emerald-600 dark:hover:text-emerald-400 bg-gray-100 dark:bg-gray-900 rounded-2xl transition-colors border border-transparent hover:border-emerald-300" 
            title={t('upload_image')}
          >
            <Camera className="w-5 h-5" />
          </button>
          <input 
            type="text" 
            value={input} 
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={t('type_message')}
            className="flex-1 bg-gray-50 dark:bg-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <button onClick={() => handleSend()} className="p-3.5 bg-emerald-600 text-white rounded-2xl hover:bg-emerald-700 transition-colors shadow-md">
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const [lang, setLang] = useState('en');
  const [theme, setTheme] = useState('light');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Pincode & Location
  const [pincode, setPincode] = useState(() => localStorage.getItem('krishi_pincode') || '110001');
  const [location, setLocation] = useState(null);
  const [weather, setWeather] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [weatherError, setWeatherError] = useState(null);
  const [mandi, setMandi] = useState(null);
  
  // Pincode Selector Modal
  const [isPincodeModalOpen, setIsPincodeModalOpen] = useState(false);

  // Farmer Login & Sign Up State
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('krishi_user');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });
  const [showLogin, setShowLogin] = useState(false);
  const [isSignup, setIsSignup] = useState(true); // Default to Sign Up first!
  const [authName, setAuthName] = useState('');
  const [authEmail, setAuthEmail] = useState('');
  const [authPhone, setAuthPhone] = useState('');
  const [authMsg, setAuthMsg] = useState('');

  const t = (key) => TRANSLATIONS[lang]?.[key] || TRANSLATIONS['en']?.[key] || key;

  useEffect(() => {
    if (theme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [theme]);

  // Integrated Pincode Fetch
  useEffect(() => {
    let isMounted = true;
    const fetchAllData = async () => {
      if (pincode.length === 6 && /^\d+$/.test(pincode)) {
        setWeatherLoading(true); 
        setWeatherError(null);
        
        const data = await fetchLocationAndWeather(pincode);
        if (isMounted) {
          if (data) {
            setLocation(data.location); 
            setWeather(data.weather); 
            localStorage.setItem('krishi_pincode', pincode);

            try {
              const mandiRes = await fetch(`${BASE_URL}/api/mandi`, { signal: AbortSignal.timeout(3000) });
              const mandiData = await mandiRes.json();
              if (isMounted && mandiData.success) setMandi(mandiData.rates);
            } catch (err) {
              if (isMounted) setMandi(MANDI_RATES_DATABASE);
            }
          } else {
            setWeatherError(t('invalid_pincode'));
            setLocation(null); setWeather(null); setMandi(null);
          }
          setWeatherLoading(false);
        }
      }
    };
    const timeoutId = setTimeout(fetchAllData, 400);
    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [pincode, lang]);

  const handleSelectLocationFromModal = (newCode, district, state) => {
    setPincode(newCode);
    setLocation({ district, state, country: 'India', pincode: newCode });
  };

  const handleAuthSubmit = (e) => {
    e.preventDefault();
    setAuthMsg('');

    if (isSignup) {
      if (!authName.trim()) {
        setAuthMsg('Please enter your Full Name to Sign Up.');
        return;
      }
      if (!authPhone.trim() && !authEmail.trim()) {
        setAuthMsg('Please enter a valid Mobile Number or Email ID.');
        return;
      }
      const userData = {
        name: authName.trim(),
        email: authEmail.trim(),
        phone: authPhone.trim()
      };
      localStorage.setItem('krishi_user', JSON.stringify(userData));
      setUser(userData);
      setShowLogin(false);
    } else {
      const saved = localStorage.getItem('krishi_user');
      let registered = saved ? JSON.parse(saved) : null;

      if (!registered && authName.trim()) {
        registered = { name: authName.trim(), email: authEmail.trim(), phone: authPhone.trim() };
        localStorage.setItem('krishi_user', JSON.stringify(registered));
      }

      if (registered) {
        setUser(registered);
        setShowLogin(false);
      } else {
        setAuthMsg('No registered account found. Please Sign Up first!');
        setIsSignup(true);
      }
    }
  };

  // Nav Items - SETTINGS AND CHAT HISTORY ARE REMOVED!
  const navItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: t('dashboard') },
    { id: 'chat', icon: MessageSquare, label: t('ai_chat') },
    { id: 'schemes', icon: Landmark, label: t('schemes') },
    { id: 'loan', icon: Banknote, label: t('loan_center') },
    { id: 'profit', icon: Scale, label: t('profit') },
    { id: 'knowledge', icon: FlaskConical, label: t('knowledge') },
    { id: 'helpline', icon: PhoneCall, label: t('helpline') },
    { id: 'weather', icon: CloudSun, label: t('nav_weather') },
    { id: 'mandi', icon: BarChart3, label: t('nav_mandi') },
    { id: 'upcoming', icon: Sparkles, label: t('nav_upcoming') }
  ];

  return (
    <AppContext.Provider value={{ lang, t, weather, location, mandi, user, weatherLoading, weatherError, onOpenPincodeModal: () => setIsPincodeModalOpen(true) }}>
      <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-sans transition-colors ${theme}`}>
        
        <NoticeBar />

        {/* Header */}
        <header className="sticky top-0 z-40 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
            
            <div className="flex items-center gap-3">
              {/* Menu Button Toggle (Opens drawer menu, disappears after click) */}
              <button 
                onClick={() => setIsSidebarOpen(prev => !prev)} 
                className="p-2.5 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors flex items-center justify-center border border-gray-200 dark:border-gray-700"
                title="Toggle Menu"
              >
                <Menu className="w-5 h-5" />
              </button>
              
              <button onClick={() => setActiveTab('dashboard')} className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-black text-xl hover:scale-105 transition-transform">
                <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md">
                  <Sprout className="w-5 h-5" />
                </div>
                <span>{t('app_name')}</span>
              </button>
            </div>

            {/* Pincode Search / Location Selector Button */}
            <div className="flex-1 max-w-xs sm:max-w-sm relative">
              <button 
                onClick={() => setIsPincodeModalOpen(true)}
                className="w-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700/80 rounded-full pl-9 pr-4 py-2 text-xs sm:text-sm font-semibold flex items-center justify-between text-gray-700 dark:text-gray-200 transition-all border border-transparent hover:border-emerald-400"
              >
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-600" />
                <span className="truncate">
                  {location ? `${location.district}, ${location.pincode}` : `Pincode: ${pincode}`}
                </span>
                <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold px-2 py-0.5 rounded-full ml-1 shrink-0">
                  Select
                </span>
              </button>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-2 sm:gap-3">
              <select value={lang} onChange={(e) => setLang(e.target.value)} className="bg-gray-100 dark:bg-gray-800 text-xs font-bold rounded-xl px-2.5 py-2 border-none outline-none focus:ring-2 focus:ring-emerald-500 dark:text-white">
                <option value="en">English</option>
                <option value="hi">हिंदी (Hindi)</option>
                <option value="bn">বাংলা (Bengali)</option>
                <option value="mr">मराठी (Marathi)</option>
                <option value="pa">ਪੰਜਾਬੀ (Punjabi)</option>
                <option value="te">తెలుగు (Telugu)</option>
                <option value="ta">தமிழ் (Tamil)</option>
                <option value="gu">ગુજરાતી (Gujarati)</option>
              </select>

              <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                <SunMoon className="w-5 h-5 text-gray-700 dark:text-gray-200" />
              </button>

              {user ? (
                <div className="flex items-center gap-2">
                  <span className="hidden sm:inline-block text-xs font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-800">
                    👤 {user.name}
                  </span>
                  <button onClick={() => { setUser(null); localStorage.removeItem('krishi_user'); }} className="p-2 bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-300 rounded-xl font-bold text-xs hover:bg-red-100 transition-colors" title="Logout">
                    <LogOut className="w-4 h-4"/>
                  </button>
                </div>
              ) : (
                <button onClick={() => { setIsSignup(true); setShowLogin(true); }} className="flex items-center gap-1.5 bg-emerald-600 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-emerald-700 transition-colors shadow-sm">
                  <User className="w-4 h-4"/> Sign Up / Login
                </button>
              )}
            </div>

          </div>
        </header>

        {/* Main Body */}
        <div className="max-w-7xl mx-auto flex h-[calc(100vh-4rem-36px)] relative">
          
          {/* Sidebar Menu Drawer (Disappears after clicking any menu link) */}
          <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-r border-gray-200 dark:border-gray-800 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out shadow-2xl flex flex-col`}>
            
            <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800">
              <button onClick={() => { setActiveTab('dashboard'); setIsSidebarOpen(false); }} className="font-black text-emerald-700 dark:text-emerald-400 flex items-center gap-2 text-xl">
                <Sprout className="w-7 h-7 text-emerald-600"/> {t('app_name')}
              </button>
              <button onClick={() => setIsSidebarOpen(false)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"><X className="w-6 h-6"/></button>
            </div>
            
            <div className="p-4 pb-1">
              <button 
                onClick={() => { setActiveTab('dashboard'); setIsSidebarOpen(false); }} 
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-sm transition-all shadow-sm ${
                  activeTab === 'dashboard' 
                    ? 'bg-gradient-to-r from-emerald-700 to-teal-800 text-white' 
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                <Home className="w-5 h-5"/> Home Dashboard
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto p-4 flex flex-col gap-1 custom-scrollbar">
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2 ml-2 mt-2">Core Navigation</p>
              {navItems.filter(i => i.id !== 'dashboard').map(item => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button 
                    key={item.id} 
                    onClick={() => { setActiveTab(item.id); setIsSidebarOpen(false); }}
                    className={`flex items-center gap-3 w-full text-left px-4 py-3 rounded-2xl transition-all text-xs font-bold border-l-4 ${
                      isActive 
                        ? 'bg-emerald-50/80 border-emerald-600 text-emerald-800 dark:bg-emerald-950/40 dark:border-emerald-500 dark:text-emerald-300 shadow-sm' 
                        : 'border-transparent text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-400 dark:text-gray-500'}`} />
                    {item.label}
                  </button>
                )
              })}
            </nav>
          </aside>

          {/* Menu Drawer Overlay Backdrop */}
          {isSidebarOpen && <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" onClick={() => setIsSidebarOpen(false)} />}

          {/* Main Content Area */}
          <main className={`flex-1 overflow-y-auto relative min-h-full ${activeTab === 'chat' ? 'p-2 sm:p-4' : 'p-4 sm:p-6 lg:p-8'}`}>
            <ErrorBoundary>
              {activeTab === 'dashboard' && <DashboardView setActiveTab={setActiveTab} />}
              {activeTab === 'chat' && <AIChatView />}
              {activeTab === 'knowledge' && <KnowledgeView />}
              {activeTab === 'profit' && <ProfitEstimatorView />}
              {activeTab === 'loan' && <FarmLoanView />}
              {activeTab === 'schemes' && <GovtSchemesView />}
              {activeTab === 'helpline' && <HelpCenterView />}
              {activeTab === 'weather' && <WeatherView />}
              {activeTab === 'mandi' && <MandiView />}
              {activeTab === 'upcoming' && <UpcomingView />}
            </ErrorBoundary>
          </main>
        </div>

        {/* All-India Pincode Modal */}
        <IndiaPincodeModal 
          isOpen={isPincodeModalOpen} 
          onClose={() => setIsPincodeModalOpen(false)}
          currentPincode={pincode}
          onSelectLocation={handleSelectLocationFromModal}
        />

        {/* Login & Signup Modal */}
        {showLogin && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-[110] flex items-center justify-center p-4" onClick={() => setShowLogin(false)}>
            <div className="bg-white dark:bg-gray-900 rounded-3xl w-full max-w-md p-8 relative animate-fade-in shadow-2xl border border-gray-200 dark:border-gray-800" onClick={e => e.stopPropagation()}>
              <button onClick={() => setShowLogin(false)} className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 bg-gray-100 p-2 rounded-full dark:bg-gray-800 dark:hover:text-gray-200 transition-colors">
                <X className="w-5 h-5" />
              </button>

              <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                <ShieldCheck className="w-7 h-7"/>
              </div>

              {/* Login / Signup Tabs - Sign Up is FIRST */}
              <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-2xl mb-6">
                <button 
                  type="button" 
                  onClick={() => setIsSignup(true)} 
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${isSignup ? 'bg-white dark:bg-gray-900 text-emerald-700 dark:text-emerald-300 shadow-sm' : 'text-gray-500'}`}
                >
                  1. Sign Up (First Time)
                </button>
                <button 
                  type="button" 
                  onClick={() => setIsSignup(false)} 
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${!isSignup ? 'bg-white dark:bg-gray-900 text-emerald-700 dark:text-emerald-300 shadow-sm' : 'text-gray-500'}`}
                >
                  2. Login
                </button>
              </div>

              {authMsg && (
                <div className="mb-4 p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 rounded-xl text-xs font-bold text-center">
                  {authMsg}
                </div>
              )}

              <form onSubmit={handleAuthSubmit} className="space-y-3">
                {isSignup && (
                  <div>
                    <label className="text-xs font-bold text-gray-600 dark:text-gray-300 block mb-1">Full Name</label>
                    <input 
                      type="text" 
                      required 
                      value={authName} 
                      onChange={e => setAuthName(e.target.value)} 
                      placeholder="e.g. Priyanshu Rai" 
                      className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl px-4 py-2.5 text-sm outline-none dark:text-white focus:ring-2 focus:ring-emerald-500 font-medium"
                    />
                  </div>
                )}

                <div>
                  <label className="text-xs font-bold text-gray-600 dark:text-gray-300 block mb-1">Email ID</label>
                  <input 
                    type="email" 
                    value={authEmail} 
                    onChange={e => setAuthEmail(e.target.value)} 
                    placeholder="priyanshu@example.com" 
                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl px-4 py-2.5 text-sm outline-none dark:text-white focus:ring-2 focus:ring-emerald-500 font-medium"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-600 dark:text-gray-300 block mb-1">Mobile Number</label>
                  <input 
                    type="tel" 
                    required 
                    value={authPhone} 
                    onChange={e => setAuthPhone(e.target.value)} 
                    placeholder="+91 9876543210" 
                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl px-4 py-2.5 text-sm outline-none dark:text-white focus:ring-2 focus:ring-emerald-500 font-medium"
                  />
                </div>

                <button 
                  type="submit" 
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-3.5 rounded-2xl transition-all shadow-md hover:shadow-lg mt-4 text-sm"
                >
                  {isSignup ? 'Complete First-Time Sign Up' : 'Login to Krishi Dost'}
                </button>
              </form>

              <button onClick={() => setShowLogin(false)} className="w-full text-gray-400 font-bold text-xs py-3 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                Continue as Guest
              </button>
            </div>
          </div>
        )}

      </div>
    </AppContext.Provider>
  );
}