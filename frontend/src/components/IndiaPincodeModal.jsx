import React, { useState } from 'react';
import { MapPin, Search, X, Check, Globe2, Building2, Navigation } from 'lucide-react';
import { INDIA_STATES_DATA, findLocationByPincode } from '../data/pincodes';

export const IndiaPincodeModal = ({ isOpen, onClose, currentPincode, onSelectLocation }) => {
  const [selectedState, setSelectedState] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [manualCode, setManualCode] = useState(currentPincode || '');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (manualCode.length !== 6 || !/^\d+$/.test(manualCode)) {
      setErrorMsg('Please enter a valid 6-digit Indian Pincode.');
      return;
    }
    setErrorMsg('');
    const match = findLocationByPincode(manualCode);
    if (match) {
      onSelectLocation(match.pincode, match.district, match.state);
      onClose();
    } else {
      // Fallback for custom valid pincode
      onSelectLocation(manualCode, `Pincode ${manualCode}`, 'India');
      onClose();
    }
  };

  // Filter districts based on state selection & search query
  const filteredStates = INDIA_STATES_DATA.filter(st => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return st.state.toLowerCase().includes(q) || st.districts.some(d => d.name.toLowerCase().includes(q) || d.pincode.includes(q));
  });

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-[110] flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
      <div className="bg-white dark:bg-gray-900 rounded-3xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden" onClick={e => e.stopPropagation()}>
        
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-emerald-700 via-teal-800 to-emerald-900 text-white flex justify-between items-center relative">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
              <MapPin className="w-6 h-6 text-emerald-300" />
            </div>
            <div>
              <h2 className="text-xl font-black">All-India Pincode & District Directory</h2>
              <p className="text-emerald-100 text-xs font-medium">Select your location to fetch real-time local weather & mandi rates</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          
          {/* Quick Manual Entry */}
          <form onSubmit={handleManualSubmit} className="bg-emerald-50 dark:bg-emerald-950/40 p-4 rounded-2xl border border-emerald-200 dark:border-emerald-800/60 space-y-3">
            <label className="text-xs font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
              <Navigation className="w-4 h-4 text-emerald-600" /> Direct 6-Digit Pincode Entry
            </label>
            <div className="flex gap-2">
              <input 
                type="text" 
                maxLength={6} 
                value={manualCode}
                onChange={(e) => {
                  setManualCode(e.target.value.replace(/\D/g, ''));
                  if (errorMsg) setErrorMsg('');
                }}
                placeholder="e.g. 110001, 400001, 800001"
                className="flex-1 bg-white dark:bg-gray-800 border border-emerald-300 dark:border-emerald-700 rounded-xl px-4 py-2.5 text-lg font-bold font-mono tracking-widest text-emerald-900 dark:text-emerald-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <button 
                type="submit" 
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-2.5 rounded-xl transition-all shadow-md hover:shadow-lg flex items-center gap-2"
              >
                Set Location
              </button>
            </div>
            {errorMsg && <p className="text-xs text-red-500 font-medium">{errorMsg}</p>}
          </form>

          {/* Search bar for State / District */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search State, District or Pincode (e.g. Patna, Ludhiana, 226001)..."
              className="w-full bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 rounded-xl pl-10 pr-4 py-2.5 text-sm dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* State / District Directory */}
          <div className="space-y-4">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
              <Globe2 className="w-4 h-4 text-emerald-600" /> Or Choose from Major Agriculture States
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[320px] overflow-y-auto pr-1">
              {filteredStates.map((stObj) => (
                <div key={stObj.state} className="bg-gray-50 dark:bg-gray-800/60 rounded-2xl p-4 border border-gray-100 dark:border-gray-700/80 space-y-2">
                  <h4 className="font-bold text-sm text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5 border-b border-gray-200 dark:border-gray-700 pb-1.5">
                    <Building2 className="w-4 h-4 text-emerald-600" /> {stObj.state}
                  </h4>
                  <div className="grid grid-cols-2 gap-1.5 pt-1">
                    {stObj.districts.map((dist) => (
                      <button
                        key={dist.pincode + dist.name}
                        onClick={() => {
                          onSelectLocation(dist.pincode, dist.name, stObj.state);
                          onClose();
                        }}
                        className={`text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center justify-between group ${
                          currentPincode === dist.pincode
                            ? 'bg-emerald-600 text-white font-bold shadow-sm'
                            : 'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 hover:text-emerald-700 dark:hover:text-emerald-300'
                        }`}
                      >
                        <span className="truncate">{dist.name}</span>
                        <span className="font-mono text-[10px] opacity-75 shrink-0 ml-1">{dist.pincode}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 dark:bg-gray-800/80 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
          <span>Covering 36 Indian States & UTs</span>
          <button onClick={onClose} className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-bold rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
