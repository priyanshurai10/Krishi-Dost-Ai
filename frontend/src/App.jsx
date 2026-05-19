import React, { useState, useEffect, useRef, createContext, useContext } from 'react';
import { 
  Menu, X, Search, MapPin, CloudRain, Sun, Wind, Droplets, 
  MessageSquare, Camera, Send, Thermometer, ArrowRight,
  Sprout, Landmark, Banknote, ShieldCheck, PhoneCall,
  ChevronRight, BarChart3, FlaskConical, Scale, Tractor, 
  AlertTriangle, CheckCircle2, User, LogOut, SunMoon, Leaf, Image as ImageIcon,
  Activity, CloudLightning, Info, CreditCard,
  Bug, TrendingUp, Mic, Satellite, CalendarDays, BookOpen, Sparkles, Star,
  Mail, MessageCircle, LayoutDashboard, CloudSun, History, Settings, Home
} from 'lucide-react';

const AppContext = createContext();

// GLOBAL BACKEND URL
const BASE_URL = "https://krishi-dost-backend.onrender.com";

// FULL MULTILINGUAL TRANSLATION DICTIONARY
const translations = {
  en: {
    app_name: 'Krishi Dost',
    pincode_placeholder: 'Enter 6-digit Pincode',
    dashboard: 'Dashboard',
    ai_chat: 'AI Assistant',
    knowledge: 'Agri-Chemical Library',
    profit: 'Profit Estimator',
    yield_title: 'Crop Yield Predictor',
    loan_center: 'Farm Loan & Finance',
    schemes: 'Government Schemes',
    helpline: 'Farmer Helpline',
    nav_weather: 'Weather & Alerts',
    nav_mandi: 'Market / Mandi Rates',
    nav_history: 'Chat History',
    nav_settings: 'Settings',
    nav_upcoming: 'Upcoming Features',
    login: 'Login',
    logout: 'Logout',
    weather_title: 'Smart Weather',
    mandi_title: 'Nearby Mandi Rates',
    type_message: 'Ask farming question...',
    upload_image: 'Upload Image',
    send: 'Send',
    fetching_location: 'Detecting Location...',
    invalid_pincode: 'Invalid Pincode',
    humidity: 'Humidity',
    wind: 'Wind',
    rain_prob: 'Rain Prob',
    aqi: 'AQI',
    advice: 'Farming Advice',
    seed_search_placeholder: 'Search seeds, fertilizers, pesticides...',
    crop_type: 'Crop Type',
    land_size: 'Land Size (Acres)',
    calculate_profit: 'Calculate Profit',
    loan_amount: 'Loan Amount (₹)',
    interest_rate: 'Interest Rate (%)',
    duration_years: 'Duration (Years)',
    calculate_emi: 'Calculate EMI',
    notice_weather: 'Weather Alert: Heavy rainfall expected in your district tomorrow.',
    notice_msp: 'Mandi Update: Government increased MSP for wheat.',
    notice_pest: 'Pest Alert: High risk of fungal infection after rainfall.',
    notice_kisan: 'Govt Notice: PM-Kisan next installment released.',
    made_by: 'Made by Priyanshu Rai',
    contact_through: 'Contact Through',
    welcome_title: 'Welcome to Krishi Dost',
    welcome_subtitle: 'Your complete AI-powered digital farming assistant. Enter your pincode above to get started with local weather, mandi rates, and personalized advice.',
    how_it_helps: 'How Can We Help You?',
    feat_disease: 'Disease Detection',
    feat_weather: 'Weather Alerts',
    feat_profit: 'Profit Estimator',
    feat_loan: 'Loan Assistance',
    quick_helpline: 'Emergency Farmer Helplines',
    knowledge_hub: 'Quick Farming Knowledge',
    upcoming_title: 'What\'s Coming Next?',
    coming_soon: 'Coming Soon',
    kcc_title: 'Kisan Credit Card (KCC)',
    kcc_desc: 'Short term loan for agricultural needs at subsidized interest rates.',
    equip_title: 'Equipment Loan',
    equip_desc: 'Finance for buying tractors, harvesters, and heavy farming machinery.'
  },
  hi: {
    app_name: 'कृषि दोस्त',
    pincode_placeholder: '6-अंकों का पिनकोड दर्ज करें',
    dashboard: 'डैशबोर्ड',
    ai_chat: 'एआई सहायक',
    knowledge: 'कृषि-रसायन लाइब्रेरी',
    profit: 'लाभ अनुमानक',
    yield_title: 'फसल का अनुमान',
    loan_center: 'कृषि ऋण और वित्त',
    schemes: 'सरकारी योजनाएं',
    helpline: 'किसान हेल्पलाइन',
    nav_weather: 'मौसम और अलर्ट',
    nav_mandi: 'बाजार / मंडी भाव',
    nav_history: 'चैट इतिहास',
    nav_settings: 'सेटिंग्स',
    nav_upcoming: 'आगामी सुविधाएँ',
    login: 'लॉग इन करें',
    logout: 'लॉग आउट',
    weather_title: 'स्मार्ट मौसम',
    mandi_title: 'आसपास की मंडी के भाव',
    type_message: 'खेती से जुड़ा सवाल पूछें...',
    upload_image: 'तस्वीर अपलोड करें',
    send: 'भेजें',
    fetching_location: 'स्थान खोजा जा रहा है...',
    invalid_pincode: 'अमान्य पिनकोड',
    humidity: 'नमी',
    wind: 'हवा',
    rain_prob: 'वर्षा की संभावना',
    aqi: 'वायु गुणवत्ता',
    advice: 'खेती की सलाह',
    seed_search_placeholder: 'बीज, उर्वरक, कीटनाशक खोजें...',
    crop_type: 'फसल का प्रकार',
    land_size: 'भूमि का आकार (एकड़)',
    calculate_profit: 'लाभ की गणना करें',
    loan_amount: 'ऋण राशि (₹)',
    interest_rate: 'ब्याज दर (%)',
    duration_years: 'अवधि (वर्ष)',
    calculate_emi: 'ईएमआई की गणना करें',
    notice_weather: 'मौसम चेतावनी: कल भारी बारिश की उम्मीद है।',
    notice_msp: 'मंडी अपडेट: सरकार ने गेहूं के लिए एमएसपी बढ़ाया।',
    notice_pest: 'कीट चेतावनी: बारिश के बाद फंगल संक्रमण का उच्च जोखिम।',
    notice_kisan: 'सरकारी नोटिस: पीएम-किसान की अगली किस्त जारी।',
    made_by: 'प्रियांशु राय द्वारा निर्मित',
    contact_through: 'संपर्क करें',
    welcome_title: 'कृषि दोस्त में आपका स्वागत है',
    welcome_subtitle: 'आपका संपूर्ण एआई कृषि सहायक। स्थानीय मौसम और मंडी भाव जानने के लिए ऊपर अपना पिनकोड दर्ज करें।',
    how_it_helps: 'हम आपकी कैसे मदद कर सकते हैं?',
    feat_disease: 'रोग का पता लगाना',
    feat_weather: 'मौसम अलर्ट',
    feat_profit: 'लाभ अनुमानक',
    feat_loan: 'ऋण सहायता',
    quick_helpline: 'आपातकालीन किसान हेल्पलाइन',
    knowledge_hub: 'खेती का ज्ञान',
    upcoming_title: 'आगे क्या आ रहा है?',
    coming_soon: 'जल्द आ रहा है',
    kcc_title: 'किसान क्रेडिट कार्ड (KCC)',
    kcc_desc: 'रियायती ब्याज दरों पर कृषि जरूरतों के लिए अल्पकालिक ऋण।',
    equip_title: 'उपकरण ऋण',
    equip_desc: 'ट्रैक्टर और भारी खेती मशीनरी खरीदने के लिए वित्त।'
  },
  bn: { app_name: 'কৃষি দোস্ত', dashboard: 'ড্যাশবোর্ড', ai_chat: 'এআই সহকারী', knowledge: 'কৃষি-রাসায়নিক', profit: 'লাভ অনুমানকারী', nav_weather: 'আবহাওয়া', schemes: 'সরকারী স্কিম', helpline: 'হেল্পলাইন' },
  mr: { app_name: 'कृषी दोस्त', dashboard: 'डॅशबोर्ड', ai_chat: 'एआय सहाय्यक', knowledge: 'बियाणे आणि रसायने', profit: 'नफा अंदाज', nav_weather: 'हवामान', schemes: 'सरकारी योजना', helpline: 'हेल्पलाइन' },
};

const fetchLocationAndWeather = async (pincode) => {
  try {
    const response = await fetch(`${BASE_URL}/api/weather?pincode=${pincode}`);
    const backendData = await response.json();
    
    // Connect with third party on frontend using backend validation
    const postRes = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
    const postData = await postRes.json();
    if (postData[0].Status !== "Success") throw new Error("Invalid Pincode");
    
    const district = postData[0].PostOffice[0].District;
    const state = postData[0].PostOffice[0].State;

    const geoRes = await fetch(`https://nominatim.openstreetmap.org/search?city=${encodeURIComponent(district)}&state=${encodeURIComponent(state)}&country=India&format=json`);
    const geoData = await geoRes.json();
    let lat = geoData[0]?.lat || 20.5937;
    let lon = geoData[0]?.lon || 78.9629;

    const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,is_day,precipitation,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=auto`);
    const weatherData = await weatherRes.json();

    return {
      location: { district, state, country: 'India' },
      weather: {
        temp: weatherData.current.temperature_2m,
        condition: weatherData.current.precipitation > 0 ? 'Rainy' : weatherData.current.is_day ? 'Sunny' : 'Clear',
        humidity: weatherData.current.relative_humidity_2m,
        wind: weatherData.current.wind_speed_10m,
        rainProb: weatherData.daily.precipitation_probability_max[0] || 0,
        advice: backendData.alert || (weatherData.current.precipitation > 0 ? "Rain expected. Avoid pesticide spraying." : "Clear weather. Good time for irrigation and field work.")
      }
    };
  } catch (e) { return null; }
};

const callAIBackend = async (chatHistory, newText, imageBase64, language) => {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const response = await fetch(`${BASE_URL}/api/chat`, { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ chatHistory, newText, imageBase64, language }) 
      });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.error);
      return data.text;
    } catch (error) {
      if (attempt === 2) return `⚠️ Network Error: Could not connect to the Krishi Dost backend server.`;
      await new Promise(res => setTimeout(res, 1000 * Math.pow(2, attempt)));
    }
  }
};

const fileToBase64 = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader(); reader.readAsDataURL(file); reader.onload = () => resolve(reader.result); reader.onerror = error => reject(error);
});

const parseMarkdown = (text) => {
  if (!text) return { __html: '' };
  let html = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\*(.*?)\*/g, '<em>$1</em>').replace(/\n\n/g, '</p><p className="mt-2">').replace(/\n\* /g, '<br/>• ').replace(/\n- /g, '<br/>• ').replace(/\n/g, '<br/>');
  return { __html: `<p>${html}</p>` };
};

const Footer = () => {
  const { t } = useContext(AppContext);
  return (
    <footer className="mt-12 bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl border border-gray-200 dark:border-gray-700/50 rounded-3xl p-6 md:p-8 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6 transition-all">
      <div className="flex flex-col items-center md:items-start text-center md:text-left">
        <div className="flex items-center gap-2 mb-2">
          <Sprout className="w-6 h-6 text-green-600 dark:text-green-400" />
          <h3 className="text-xl font-black text-green-700 dark:text-green-400">{t('made_by') || 'Made by Priyanshu Rai'}</h3>
        </div>
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-yellow-500" /> Empowering Indian Farmers
        </p>
      </div>
      <div className="flex flex-col items-center md:items-end gap-3">
        <p className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">{t('contact_through') || 'Contact Through'}</p>
        <div className="flex items-center gap-4">
          <a href="https://wa.me/917541881152" target="_blank" rel="noopener noreferrer" className="group flex items-center justify-center w-12 h-12 rounded-2xl bg-green-50 text-green-600 hover:bg-green-500 hover:text-white transition-all shadow-sm"><MessageCircle className="w-6 h-6" /></a>
          <a href="mailto:priyanshurai121111@gmail.com" className="group flex items-center justify-center w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 hover:bg-blue-500 hover:text-white transition-all shadow-sm"><Mail className="w-6 h-6" /></a>
          <a href="https://instagram.com/sanchittrai" target="_blank" rel="noopener noreferrer" className="group flex items-center justify-center w-12 h-12 rounded-2xl bg-pink-50 text-pink-600 hover:bg-pink-500 hover:text-white transition-all shadow-sm"><Camera className="w-6 h-6" /></a>
        </div>
      </div>
    </footer>
  );
};

const NoticeBar = () => {
  const { t } = useContext(AppContext);
  return (
    <div className="bg-gradient-to-r from-red-600 to-orange-500 text-white overflow-hidden py-2 px-4 text-sm font-medium flex items-center relative z-50">
      <style>{`@keyframes marquee { 0% { transform: translateX(100vw); } 100% { transform: translateX(-100%); } } .animate-marquee { display: flex; white-space: nowrap; animation: marquee 30s linear infinite; }`}</style>
      <div className="absolute left-0 bg-gradient-to-r from-red-600 to-transparent w-8 h-full z-10"></div>
      <div className="animate-marquee gap-12 items-center">
        <span className="flex items-center gap-2"><AlertTriangle className="w-4 h-4"/> {t('notice_weather')}</span>
        <span className="flex items-center gap-2"><Banknote className="w-4 h-4"/> {t('notice_msp')}</span>
        <span className="flex items-center gap-2"><Sprout className="w-4 h-4"/> {t('notice_pest')}</span>
        <span className="flex items-center gap-2"><Landmark className="w-4 h-4"/> {t('notice_kisan')}</span>
      </div>
    </div>
  );
};

const SmartWeatherSection = () => {
  const { t, weather, location, weatherLoading, weatherError } = useContext(AppContext);
  if (weatherError) return <div className="text-red-500 p-4 bg-red-50 dark:bg-red-900/20 rounded-2xl border border-red-100">{t('weather_error')}</div>;
  if (weatherLoading || !weather) return <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-48 rounded-2xl w-full"></div>;
  return (
    <div className={`rounded-2xl p-6 text-white shadow-lg relative overflow-hidden transition-colors ${weather.condition === 'Rainy' ? 'bg-gradient-to-br from-gray-700 to-gray-900' : 'bg-gradient-to-br from-blue-500 to-blue-700'}`}>
        <div className="absolute -right-10 -top-10 text-9xl opacity-20">{weather.condition === 'Rainy' ? '🌧️' : '☀️'}</div>
        <div className="relative z-10 flex justify-between items-start">
            <div>
                <p className="text-blue-100 font-medium flex items-center gap-1"><MapPin className="w-4 h-4"/> {location?.district}, {location?.state}</p>
                <h3 className="text-5xl font-bold mt-1 mb-2">{weather.temp}°C</h3>
                <p className="text-blue-100 text-sm">{weather.condition} • {t('humidity')}: {weather.humidity}%</p>
                <div className="mt-4 bg-black/20 p-3 rounded-lg backdrop-blur-sm border border-white/10 max-w-md">
                    <p className="text-sm font-medium flex items-center gap-2"><Sprout className="w-4 h-4"/> {t('advice')}: {weather.advice}</p>
                </div>
            </div>
        </div>
    </div>
  );
};

const DashboardView = ({ setActiveTab }) => {
  const { t, location, mandi } = useContext(AppContext);
  const [selectedFeature, setSelectedFeature] = useState(null);

  const features = [
    { icon: Bug, label: t('feat_disease') || 'Disease Detection', color: 'bg-red-500', tab: 'chat' },
    { icon: CloudLightning, label: t('feat_weather') || 'Weather Alerts', color: 'bg-blue-500', tab: 'weather' },
    { icon: Scale, label: t('feat_profit') || 'Profit Estimator', color: 'bg-orange-500', tab: 'profit' },
    { icon: Banknote, label: t('feat_loan') || 'Loan Assistance', color: 'bg-green-500', tab: 'loan' },
  ];

  const upcoming = [
    { id: 'yield', icon: TrendingUp, title: 'AI Crop Yield Prediction', desc: 'Forecast your exact harvest yield using satellite and weather data to plan your market sales in advance.' },
    { id: 'voice', icon: Mic, title: 'Voice-Based Assistant', desc: 'Speak directly to Krishi Dost in your local dialect without typing. Hands-free farming assistance.' },
    { id: 'satellite', icon: Satellite, title: 'Satellite Crop Monitoring', desc: 'Get weekly satellite imagery of your farm to spot hidden water stress and nutrient deficiencies.' },
    { id: 'calendar', icon: CalendarDays, title: 'Personalized Crop Calendar', desc: 'Auto-generated day-by-day task list for your specific crop, soil, and sowing date.' },
  ];

  const knowledgeCards = [
    { title: 'Best Fertilizers for Wheat', desc: 'Apply balanced NPK. Zinc is crucial during early vegetative stages for maximum tillering.' },
    { title: 'Rice Disease Prevention', desc: 'Maintain proper plant spacing and avoid excessive urea to prevent Blast disease.' },
    { title: 'Smart Irrigation Tips', desc: 'Use drip irrigation for vegetables to save 40% water and reduce weed growth.' },
  ];

  const mockHelplines = [
    { name: 'national_farmer_helpline', number: '1800-180-1551' },
    { name: 'crop_insurance_helpline', number: '14447' },
    { name: 'agri_emergency', number: '112' }
  ];

  return (
    <div className="space-y-10 animate-fade-in pb-10">
      
      {!location ? (
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-green-600 to-green-800 text-white p-6 sm:p-10 shadow-xl border-b-4 border-green-900/50">
            <div className="absolute top-0 right-0 opacity-10 pointer-events-none">
                <Sprout className="w-64 h-64 -mt-10 -mr-10" />
            </div>
            <div className="relative z-10">
                <h1 className="text-3xl sm:text-4xl font-black mb-4 tracking-tight drop-shadow-md">{t('welcome_title') || 'Welcome to Krishi Dost'}</h1>
                <p className="text-green-50 text-lg max-w-2xl mb-8 leading-relaxed font-medium">{t('welcome_subtitle') || 'Your complete AI-powered digital farming assistant. Enter your pincode above to get started with local weather, mandi rates, and personalized advice.'}</p>
                
                <p className="text-sm font-bold text-green-200 uppercase tracking-wider mb-4">{t('how_it_helps') || 'How Can We Help You?'}</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {features.map((f, i) => {
                        const Icon = f.icon;
                        return (
                            <div key={i} onClick={() => setActiveTab(f.tab)} className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl flex flex-col items-start hover:bg-white/20 transition-all cursor-pointer group hover:-translate-y-1 hover:shadow-lg">
                                <div className={`${f.color} w-10 h-10 rounded-full flex items-center justify-center mb-3 shadow-lg group-hover:scale-110 transition-transform`}>
                                    <Icon className="w-5 h-5 text-white" />
                                </div>
                                <span className="font-semibold text-sm">{f.label}</span>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
      ) : (
        <div className="space-y-6">
            <SmartWeatherSection />
            <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
              <div className="flex justify-between items-end mb-6">
                <div>
                  <h3 className="text-xl font-black mb-1 flex items-center gap-2 dark:text-white"><BarChart3 className="w-6 h-6 text-green-600"/> {t('mandi_title') || 'Nearby Mandi Rates'}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Live market rates for {location.district}</p>
                </div>
                <button onClick={() => setActiveTab('mandi')} className="text-green-600 text-sm font-bold hover:underline">View All Mandi Rates →</button>
              </div>
              {mandi && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {mandi.map((item, idx) => (
                    <div key={idx} className="p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-700 hover:border-green-300 transition-colors">
                      <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">{item.crop}</p>
                      <p className="font-black text-xl dark:text-white my-1">{item.price}</p>
                      <div className="flex justify-between items-center mt-2">
                        <p className={`text-xs font-bold px-2 py-1 rounded-md ${item.trend === 'Up' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : item.trend === 'Down' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'}`}>
                          {item.trend === 'Up' ? '▲' : item.trend === 'Down' ? '▼' : '▬'} Trend
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
        </div>
      )}

      <div>
          <h3 className="text-xl font-bold dark:text-white mb-4 flex items-center gap-2"><PhoneCall className="w-6 h-6 text-green-600"/> {t('quick_helpline') || 'Emergency Farmer Helplines'}</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {mockHelplines.map(h => (
                  <div key={h.name} onClick={() => setActiveTab('helpline')} className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-between group cursor-pointer hover:border-green-300 transition-all hover:-translate-y-1">
                      <div>
                          <p className="font-bold text-gray-800 dark:text-gray-100 text-sm">{t(h.name) || h.name.replace(/_/g, ' ')}</p>
                          <p className="text-green-600 dark:text-green-400 font-mono font-bold mt-1">{h.number}</p>
                      </div>
                      <button className="w-10 h-10 rounded-full bg-green-50 dark:bg-green-900/30 flex items-center justify-center text-green-600 group-hover:bg-green-600 group-hover:text-white transition-colors">
                          <PhoneCall className="w-4 h-4"/>
                      </button>
                  </div>
              ))}
          </div>
      </div>

      <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold dark:text-white flex items-center gap-2"><BookOpen className="w-6 h-6 text-blue-600"/> {t('knowledge_hub') || 'Quick Farming Knowledge'}</h3>
            <button onClick={() => setActiveTab('knowledge')} className="text-blue-600 text-sm font-bold hover:underline">Open Full Library →</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {knowledgeCards.map((k, i) => (
                  <div key={i} onClick={() => setActiveTab('knowledge')} className="bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-800/10 p-5 rounded-2xl border border-blue-200/50 dark:border-blue-800/50 cursor-pointer hover:shadow-md transition-all hover:-translate-y-1">
                      <h4 className="font-bold text-blue-900 dark:text-blue-100 mb-2">{k.title}</h4>
                      <p className="text-sm text-blue-800/80 dark:text-blue-200/80 leading-relaxed font-medium">{k.desc}</p>
                  </div>
              ))}
          </div>
      </div>

      <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold dark:text-white flex items-center gap-2"><Sparkles className="w-6 h-6 text-purple-600"/> {t('upcoming_title') || 'What\'s Coming Next?'}</h3>
              <span className="text-xs font-bold px-3 py-1 bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 rounded-full uppercase tracking-wider hidden sm:block">Platform Roadmap</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {upcoming.map((u, i) => {
                  const Icon = u.icon;
                  return (
                      <div key={i} onClick={() => setSelectedFeature(u)} className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 cursor-pointer hover:border-purple-400 dark:hover:border-purple-500 hover:shadow-md transition-all group relative overflow-hidden">
                          <div className="absolute -right-4 -top-4 w-16 h-16 bg-purple-50 dark:bg-purple-900/20 rounded-full group-hover:scale-[2.5] transition-transform duration-500 ease-out"></div>
                          <div className="relative z-10">
                              <Icon className="w-8 h-8 text-purple-500 mb-3 group-hover:-translate-y-1 transition-transform"/>
                              <h4 className="font-bold text-gray-800 dark:text-gray-100 mb-2">{u.title}</h4>
                              <p className="text-xs text-purple-600 dark:text-purple-400 font-bold flex items-center gap-1">{t('coming_soon') || 'Coming Soon'} <ArrowRight className="w-3 h-3"/></p>
                          </div>
                      </div>
                  )
              })}
          </div>
      </div>

      {selectedFeature && (() => {
        const ModalIcon = selectedFeature.icon;
        return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4" onClick={() => setSelectedFeature(null)}>
            <div className="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-md p-8 relative animate-fade-in shadow-2xl" onClick={e => e.stopPropagation()}>
                <button onClick={() => setSelectedFeature(null)} className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 bg-gray-100 dark:bg-gray-700 p-2 rounded-full transition-colors"><X className="w-5 h-5" /></button>
                <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 text-purple-600 rounded-2xl flex items-center justify-center mb-6 transform -rotate-6 shadow-sm">
                    <ModalIcon className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-black mb-3 dark:text-white leading-tight">{selectedFeature.title}</h2>
                <span className="inline-block px-3 py-1 bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300 text-xs font-bold rounded-full mb-4 uppercase tracking-wider">{t('coming_soon') || 'Coming Soon'}</span>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-6 font-medium">
                    {selectedFeature.desc}
                </p>
                <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-2xl border border-gray-100 dark:border-gray-700">
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200 flex items-start gap-2">
                        <Star className="w-5 h-5 text-yellow-500 shrink-0" /> 
                        This powerful feature is currently in development and will be available to all farmers in our next major update.
                    </p>
                </div>
            </div>
        </div>
        );
      })()}
    </div>
  );
};

const KnowledgeView = () => {
  const { t } = useContext(AppContext);
  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <h2 className="text-2xl font-bold dark:text-white flex items-center gap-2"><FlaskConical className="w-6 h-6 text-green-600"/> {t('knowledge') || 'Agri-Chemical Library'}</h2>
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input type="text" placeholder={t('seed_search_placeholder') || 'Search seeds, fertilizers...'} className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl pl-10 pr-4 py-3 focus:ring-2 focus:ring-green-500 outline-none dark:text-white shadow-sm" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 hover:border-green-300 transition-colors">
            <h3 className="font-bold text-lg mb-2 dark:text-white text-green-700">Urea (Nitrogen)</h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">Essential for leaf growth. Apply in split doses for best results during vegetative stage.</p>
            <div className="bg-orange-50 dark:bg-orange-900/30 p-3 rounded-lg text-sm text-orange-800 dark:text-orange-300 flex items-start gap-2">
               <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5"/>
               <span>Overuse degrades soil health and weakens plant stems. Do not apply before heavy rain.</span>
            </div>
         </div>
         <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 hover:border-green-300 transition-colors">
            <h3 className="font-bold text-lg mb-2 dark:text-white text-blue-700">DAP (Di-ammonium Phosphate)</h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">Excellent for robust root development during early growth stages. High phosphorus content.</p>
            <div className="bg-blue-50 dark:bg-blue-900/30 p-3 rounded-lg text-sm text-blue-800 dark:text-blue-300 flex items-start gap-2">
               <Info className="w-4 h-4 shrink-0 mt-0.5"/>
               <span>Best applied as a basal dose before or during sowing of seeds.</span>
            </div>
         </div>
      </div>
    </div>
  );
};

const ProfitEstimatorView = () => {
  const { t } = useContext(AppContext);
  const [cropType, setCropType] = useState('');
  const [landSize, setLandSize] = useState('');
  const [result, setResult] = useState(null);

  const calculateProfit = async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/calculate`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'profit', cropType, landSize })
      });
      const data = await response.json();
      if(data.success) setResult(data.estimatedReturn);
    } catch (err) { console.error("Error", err); }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <h2 className="text-2xl font-bold dark:text-white flex items-center gap-2"><Scale className="w-6 h-6 text-green-600"/> {t('profit') || 'Profit Estimator'}</h2>
      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
        <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm">Calculate expected returns and investment costs based on AI market predictions.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <input type="text" value={cropType} onChange={e=>setCropType(e.target.value)} placeholder={t('crop_type') || 'Crop Type'} className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 dark:text-white" />
          <input type="number" value={landSize} onChange={e=>setLandSize(e.target.value)} placeholder={t('land_size') || 'Land Size (Acres)'} className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 dark:text-white" />
        </div>
        <button onClick={calculateProfit} className="bg-green-600 hover:bg-green-700 transition-colors text-white font-medium px-4 py-3 rounded-xl w-full">{t('calculate_profit') || 'Calculate'}</button>
        {result !== null && (
          <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/30 rounded-xl border border-green-200 dark:border-green-800">
             <h3 className="text-green-800 dark:text-green-400 font-bold">Estimated Profit: ₹{result.toLocaleString('en-IN')}</h3>
          </div>
        )}
      </div>
    </div>
  );
};

const FarmLoanView = () => {
  const { t } = useContext(AppContext);
  const [amount, setAmount] = useState('');
  const [rate, setRate] = useState('');
  const [duration, setDuration] = useState('');
  const [result, setResult] = useState(null);

  const calculateLoan = async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/calculate`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'loan', amount, rate, duration })
      });
      const data = await response.json();
      if(data.success) setResult(data);
    } catch (err) { console.error("Error", err); }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <h2 className="text-2xl font-bold dark:text-white flex items-center gap-2"><Banknote className="w-6 h-6 text-green-600"/> {t('loan_center') || 'Farm Loan Center'}</h2>
      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <input type="number" value={amount} onChange={e=>setAmount(e.target.value)} placeholder={t('loan_amount') || 'Loan Amount (₹)'} className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 dark:text-white" />
          <input type="number" value={rate} onChange={e=>setRate(e.target.value)} placeholder={t('interest_rate') || 'Interest Rate (%)'} className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 dark:text-white" />
          <input type="number" value={duration} onChange={e=>setDuration(e.target.value)} placeholder={t('duration_years') || 'Duration (Years)'} className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 dark:text-white" />
        </div>
        <button onClick={calculateLoan} className="bg-blue-600 hover:bg-blue-700 transition-colors text-white font-medium px-4 py-3 rounded-xl w-full">{t('calculate_emi') || 'Calculate EMI'}</button>
        {result !== null && (
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/30 rounded-xl border border-blue-200 dark:border-blue-800">
             <h3 className="text-blue-800 dark:text-blue-400 font-bold mb-1">Monthly EMI: ₹{result.emi.toLocaleString('en-IN')}</h3>
             <p className="text-sm text-blue-700 dark:text-blue-300">Total Payment: ₹{result.totalPayment.toLocaleString('en-IN')}</p>
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <h4 className="font-bold dark:text-white flex items-center gap-2 mb-2"><CreditCard className="w-4 h-4 text-blue-500"/> {t('kcc_title') || 'Kisan Credit Card (KCC)'}</h4>
          <p className="text-sm text-gray-500 dark:text-gray-400">{t('kcc_desc') || 'Short term loan for agricultural needs at subsidized interest rates.'}</p>
        </div>
        <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <h4 className="font-bold dark:text-white flex items-center gap-2 mb-2"><Tractor className="w-4 h-4 text-orange-500"/> {t('equip_title') || 'Equipment Loan'}</h4>
          <p className="text-sm text-gray-500 dark:text-gray-400">{t('equip_desc') || 'Finance for buying tractors, harvesters, and heavy farming machinery.'}</p>
        </div>
      </div>
    </div>
  );
};

const GovtSchemesView = () => {
  const { t } = useContext(AppContext);
  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <h2 className="text-2xl font-bold dark:text-white flex items-center gap-2"><Landmark className="w-6 h-6 text-green-600"/> {t('schemes') || 'Govt Schemes'}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl border border-green-100 bg-green-50 dark:bg-green-900/20 dark:border-green-800 hover:shadow-md transition-shadow cursor-pointer">
           <h3 className="font-bold text-lg text-green-800 dark:text-green-400 mb-2">PM-Kisan Samman Nidhi</h3>
           <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">₹6,000 per year minimum income support for all landholding farmers.</p>
           <button className="text-green-700 font-bold text-sm hover:underline flex items-center gap-1">Check Eligibility <ChevronRight className="w-4 h-4"/></button>
        </div>
        <div className="p-6 rounded-2xl border border-blue-100 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800 hover:shadow-md transition-shadow cursor-pointer">
           <h3 className="font-bold text-lg text-blue-800 dark:text-blue-400 mb-2">PM Fasal Bima Yojana (PMFBY)</h3>
           <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">Crop insurance scheme providing comprehensive financial support in case of crop failure.</p>
           <button className="text-blue-700 font-bold text-sm hover:underline flex items-center gap-1">Apply Now <ChevronRight className="w-4 h-4"/></button>
        </div>
      </div>
    </div>
  );
};

const HelpCenterView = () => {
  const { t } = useContext(AppContext);
  const mockHelplines = [
    { name: 'national_farmer_helpline', number: '1800-180-1551' },
    { name: 'crop_insurance_helpline', number: '14447' },
    { name: 'agri_emergency', number: '112' }
  ];
  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <h2 className="text-2xl font-bold dark:text-white flex items-center gap-2"><PhoneCall className="w-6 h-6 text-green-600"/> {t('helpline') || 'Farmer Helpline'}</h2>
      <p className="text-gray-500 dark:text-gray-400 mb-4 text-sm">Contact official government and emergency support channels for immediate assistance.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         {mockHelplines.map(h => (
           <div key={h.name} className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-between hover:border-green-300 transition-colors group cursor-pointer">
              <div>
                <h3 className="font-bold dark:text-white">{t(h.name) || h.name.replace(/_/g, ' ')}</h3>
                <p className="text-gray-500 dark:text-gray-400 mt-1 font-mono">{h.number}</p>
              </div>
              <button className="p-3 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full group-hover:bg-green-600 group-hover:text-white transition-colors"><PhoneCall className="w-5 h-5"/></button>
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
      <h2 className="text-2xl font-bold dark:text-white flex items-center gap-2"><CloudSun className="w-6 h-6 text-blue-500"/> {t('nav_weather') || 'Weather & Alerts'}</h2>
      <SmartWeatherSection />
    </div>
  );
};

const MandiView = () => {
  const { t, mandi } = useContext(AppContext);
  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <h2 className="text-2xl font-bold dark:text-white flex items-center gap-2"><BarChart3 className="w-6 h-6 text-green-600"/> {t('nav_mandi') || 'Market / Mandi Rates'}</h2>
      <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
        {mandi && mandi.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {mandi.map((item, idx) => (
              <div key={idx} className="p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-700 hover:border-green-300 transition-all">
                <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">{item.crop}</p>
                <p className="font-black text-xl dark:text-white my-1">{item.priceRange || item.price}</p>
                <p className={`text-xs font-bold inline-block px-2 py-1 rounded-md mt-2 ${item.trend === 'Up' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : item.trend === 'Down' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'}`}>
                  {item.trend === 'Up' ? '▲' : item.trend === 'Down' ? '▼' : '▬'} {item.trend}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">Please enter a pincode above to see live mandi rates.</p>
        )}
      </div>
    </div>
  );
};

const ComingSoonView = ({ title, icon: Icon }) => (
  <div className="flex flex-col items-center justify-center h-64 text-center animate-fade-in">
    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
      <Icon className="w-8 h-8 text-gray-400" />
    </div>
    <h2 className="text-2xl font-bold dark:text-white mb-2">{title}</h2>
    <p className="text-gray-500 dark:text-gray-400">This feature is currently in development.</p>
  </div>
);

const AIChatView = () => {
  const { t, lang } = useContext(AppContext);
  const [messages, setMessages] = useState([{
    sender: 'ai', text: "Namaste! I am your Krishi Dost. Upload an image of a crop disease or ask any farming question. I will reply accurately in your language.", image: null
  }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const scrollToBottom = () => chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  useEffect(scrollToBottom, [messages]);

  const handleSend = async (imageFile = null) => {
    if (!input.trim() && !imageFile) return;
    const userText = input;
    const userImageURL = imageFile ? URL.createObjectURL(imageFile) : null;
    const userMsg = { sender: 'user', text: userText, image: userImageURL };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
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
    <div className="flex flex-col h-[calc(100vh-14rem)] max-h-[800px] bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden animate-fade-in">
      <div className="p-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50 flex justify-between items-center">
        <h2 className="font-bold flex items-center gap-2 dark:text-white"><Sprout className="w-5 h-5 text-green-600" /> {t('ai_chat')}</h2>
        <span className="text-xs font-medium px-2 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-full">Vision Enabled</span>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex gap-3 max-w-[85%] ${msg.sender === 'user' ? 'ml-auto flex-row-reverse' : ''}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.sender === 'user' ? 'bg-blue-100 text-blue-700' : 'bg-green-600 text-white'}`}>
              {msg.sender === 'user' ? <User className="w-4 h-4"/> : <Sprout className="w-4 h-4"/>}
            </div>
            <div className={`p-3 rounded-2xl ${msg.sender === 'user' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-gray-100 dark:bg-gray-700 dark:text-gray-100 rounded-tl-none'}`}>
              {msg.image && <img src={msg.image} alt="Upload" className="w-48 h-48 object-cover rounded-lg mb-2 border border-black/10" />}
              {msg.text && <div className="text-sm text-gray-800 dark:text-gray-100 leading-relaxed" dangerouslySetInnerHTML={parseMarkdown(msg.text)} />}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-3 max-w-[80%]">
             <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center text-white"><Sprout className="w-4 h-4 animate-pulse"/></div>
             <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-2xl rounded-tl-none flex gap-1 items-center">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
             </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700">
        <div className="flex gap-2">
          <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={(e) => { if(e.target.files[0]) handleSend(e.target.files[0]); }} />
          <button onClick={() => fileInputRef.current.click()} className="p-3 text-gray-500 hover:text-green-600 dark:hover:text-green-400 bg-gray-50 dark:bg-gray-900 rounded-xl transition-colors" title="Upload Image">
            <Camera className="w-5 h-5" />
          </button>
          <input 
            type="text" value={input} onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={t('type_message')}
            className="flex-1 bg-gray-50 dark:bg-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <button onClick={() => handleSend()} className="p-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors">
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
  const [pincode, setPincode] = useState('');
  const [location, setLocation] = useState(null);
  const [weather, setWeather] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [weatherError, setWeatherError] = useState(null);
  const [mandi, setMandi] = useState(null);
  const [user, setUser] = useState(null);
  const [showLogin, setShowLogin] = useState(false);
  const [otp, setOtp] = useState('');

  const t = (key) => translations[lang]?.[key] || translations['en'][key] || key;

  useEffect(() => {
    if (theme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [theme]);

  // Integrated API fetching for both Weather & Mandi when valid Pincode is entered
  useEffect(() => {
    const fetchAllData = async () => {
      if (pincode.length === 6 && /^\d+$/.test(pincode)) {
        setWeatherLoading(true); setWeatherError(null);
        
        const data = await fetchLocationAndWeather(pincode);
        if (data) {
          setLocation(data.location); 
          setWeather(data.weather); 
          
          // Trigger Mandi Rates fetch successfully linked
          try {
             const mandiRes = await fetch(`${BASE_URL}/api/mandi`);
             const mandiData = await mandiRes.json();
             if(mandiData.success) setMandi(mandiData.rates);
          } catch(err) { console.error("Mandi load failed", err); }
        } else {
          setWeatherError(t('invalid_pincode') || 'Invalid Pincode');
          setLocation(null); setWeather(null); setMandi(null);
        }
        setWeatherLoading(false);
      } else if (pincode.length < 6) {
        setLocation(null); setWeather(null); setWeatherError(null); setMandi(null);
      }
    };
    const timeoutId = setTimeout(fetchAllData, 800);
    return () => clearTimeout(timeoutId);
  }, [pincode, lang]);

  const navItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: t('dashboard') },
    { id: 'chat', icon: MessageSquare, label: t('ai_chat') },
    { id: 'schemes', icon: Landmark, label: t('schemes') || 'Govt Schemes' },
    { id: 'loan', icon: Banknote, label: t('loan_center') },
    { id: 'profit', icon: Scale, label: t('profit') },
    { id: 'knowledge', icon: FlaskConical, label: t('knowledge') },
    { id: 'helpline', icon: PhoneCall, label: t('helpline') },
    { id: 'weather', icon: CloudSun, label: t('nav_weather') || 'Weather & Alerts' },
    { id: 'mandi', icon: BarChart3, label: t('nav_mandi') || 'Market / Mandi Rates' },
    { id: 'history', icon: History, label: t('nav_history') || 'Chat History' },
    { id: 'upcoming', icon: Sparkles, label: t('nav_upcoming') || 'Upcoming Features' },
    { id: 'settings', icon: Settings, label: t('nav_settings') || 'Settings' }
  ];

  return (
    <AppContext.Provider value={{ lang, t, weather, location, mandi, user, weatherLoading, weatherError }}>
      <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-sans transition-colors ${theme}`}>
        
        <NoticeBar />

        <header className="sticky top-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800">
          <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button onClick={() => setIsSidebarOpen(true)} className="md:hidden p-2"><Menu className="w-6 h-6" /></button>
              <button onClick={() => setActiveTab('dashboard')} className="hidden sm:flex items-center gap-2 text-green-600 dark:text-green-500 font-black text-xl hover:scale-105 transition-transform">
                <Sprout className="w-6 h-6" /> {t('app_name')}
              </button>
            </div>

            <div className="flex-1 max-w-sm relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                type="text" maxLength={6} value={pincode} onChange={(e)=>setPincode(e.target.value.replace(/\D/g,''))}
                placeholder={t('pincode_placeholder')}
                className="w-full bg-gray-100 dark:bg-gray-800 border-transparent rounded-full pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:bg-white dark:focus:bg-gray-700 outline-none transition-all dark:text-white"
              />
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
              <select value={lang} onChange={(e) => setLang(e.target.value)} className="bg-gray-100 dark:bg-gray-800 text-sm rounded-lg px-2 py-1.5 border-none outline-none focus:ring-2 focus:ring-green-500">
                <option value="en">English</option>
                <option value="hi">हिंदी (Hindi)</option>
                <option value="bn">বাংলা (Bengali)</option>
                <option value="mr">मराठी (Marathi)</option>
              </select>
              <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                <SunMoon className="w-5 h-5" />
              </button>
              {user ? (
                <button onClick={()=>setUser(null)} className="hidden sm:flex items-center gap-2 bg-red-100 dark:bg-red-900/30 text-red-600 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors"><LogOut className="w-4 h-4"/> {t('logout')}</button>
              ) : (
                <button onClick={()=>setShowLogin(true)} className="flex items-center gap-2 bg-green-600 text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"><User className="w-4 h-4"/> {t('login')}</button>
              )}
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto flex h-[calc(100vh-4rem-40px)] relative">
          
          <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-r border-gray-200 dark:border-gray-800 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:relative transition-transform duration-300 ease-in-out shadow-2xl md:shadow-none flex flex-col`}>
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
              <button onClick={() => { setActiveTab('dashboard'); setIsSidebarOpen(false); }} className="font-black text-green-600 dark:text-green-500 flex items-center gap-2 text-xl hover:scale-105 transition-transform">
                <Sprout className="w-7 h-7"/> {t('app_name')}
              </button>
              <button onClick={() => setIsSidebarOpen(false)} className="md:hidden p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"><X className="w-6 h-6"/></button>
            </div>
            
            <div className="p-4 pb-0">
               <button onClick={() => { setActiveTab('dashboard'); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all shadow-sm ${activeTab === 'dashboard' ? 'bg-gradient-to-r from-green-600 to-green-500 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700'}`}>
                  <Home className="w-5 h-5"/> Back to Home
               </button>
            </div>

            <nav className="flex-1 overflow-y-auto p-4 flex flex-col gap-1.5 custom-scrollbar">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 ml-2 mt-4">Main Modules</p>
              {navItems.filter(i => i.id !== 'dashboard').map(item => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button key={item.id} onClick={() => { setActiveTab(item.id); setIsSidebarOpen(false); }}
                    className={`flex items-center gap-3 w-full text-left px-4 py-3 rounded-xl transition-all font-medium border-l-4 ${isActive ? 'bg-green-50 border-green-600 text-green-700 dark:bg-green-900/40 dark:border-green-500 dark:text-green-400 shadow-sm' : 'border-transparent text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600'}`}>
                    <Icon className={`w-5 h-5 ${isActive ? 'text-green-600 dark:text-green-400' : 'text-gray-400 dark:text-gray-500'}`} />
                    {item.label}
                  </button>
                )
              })}
            </nav>
          </aside>

          {isSidebarOpen && <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden" onClick={() => setIsSidebarOpen(false)} />}

          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 relative min-h-full">
            {activeTab === 'dashboard' && <DashboardView setActiveTab={setActiveTab} />}
            {activeTab === 'chat' && <AIChatView />}
            {activeTab === 'knowledge' && <KnowledgeView />}
            {activeTab === 'profit' && <ProfitEstimatorView />}
            {activeTab === 'yield' && <ComingSoonView title={t('yield_title') || 'Crop Yield Predictor'} icon={TrendingUp} />}
            {activeTab === 'loan' && <FarmLoanView />}
            {activeTab === 'schemes' && <GovtSchemesView />}
            {activeTab === 'helpline' && <HelpCenterView />}
            {activeTab === 'weather' && <WeatherView />}
            {activeTab === 'mandi' && <MandiView />}
            {activeTab === 'history' && <ComingSoonView title={t('nav_history') || 'Chat History'} icon={History} />}
            {activeTab === 'settings' && <ComingSoonView title={t('nav_settings') || 'Settings'} icon={Settings} />}
            {activeTab === 'upcoming' && <ComingSoonView title={t('nav_upcoming') || 'Upcoming Features'} icon={Sparkles} />}
            
            <Footer />
          </main>
        </div>

        {showLogin && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-md p-8 relative animate-fade-in shadow-2xl">
              <button onClick={() => setShowLogin(false)} className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 bg-gray-100 p-2 rounded-full dark:bg-gray-700 dark:hover:text-gray-200 transition-colors"><X className="w-5 h-5" /></button>
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6 transform rotate-3 shadow-sm"><ShieldCheck className="w-8 h-8"/></div>
              <h2 className="text-2xl font-black text-center mb-2 dark:text-white">Farmer Login</h2>
              <p className="text-gray-500 text-center mb-6 text-sm font-medium">Enter demo OTP: <strong className="text-green-600 bg-green-50 px-2 py-1 rounded">1234</strong></p>
              
              <input type="text" placeholder="Enter Phone or Email" className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 mb-4 outline-none dark:text-white focus:ring-2 focus:ring-green-500 transition-all"/>
              <input type="text" value={otp} onChange={(e)=>setOtp(e.target.value)} placeholder="Enter OTP" className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 mb-6 outline-none text-center tracking-widest font-mono text-xl dark:text-white focus:ring-2 focus:ring-green-500 transition-all"/>
              
              <button onClick={() => { if(otp === '1234') { setUser({name: 'Demo Farmer'}); setShowLogin(false); } }} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl transition-all shadow-md hover:shadow-lg mb-3">Verify & Login</button>
              <button onClick={() => setShowLogin(false)} className="w-full text-gray-500 font-bold py-2 hover:text-gray-800 dark:hover:text-gray-300 transition-colors">Skip for now</button>
            </div>
          </div>
        )}
      </div>
    </AppContext.Provider>
  );
}