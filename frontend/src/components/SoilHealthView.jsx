import React, { useState } from 'react';
import { 
  Layers, Sprout, Sparkles, CheckCircle2, AlertTriangle, 
  Scale, Award, Info, RefreshCw, FlaskConical, ArrowRight
} from 'lucide-react';

export const SoilHealthView = ({ baseUrl }) => {
  const [nitrogen, setNitrogen] = useState(190);
  const [phosphorus, setPhosphorus] = useState(16);
  const [potassium, setPotassium] = useState(150);
  const [ph, setPh] = useState(7.2);
  const [organicCarbon, setOrganicCarbon] = useState(0.55);

  const setPreset = (type) => {
    if (type === 'alluvial') {
      setNitrogen(220); setPhosphorus(18); setPotassium(160); setPh(7.2); setOrganicCarbon(0.65);
    } else if (type === 'low_n') {
      setNitrogen(140); setPhosphorus(10); setPotassium(120); setPh(7.6); setOrganicCarbon(0.38);
    } else if (type === 'alkaline') {
      setNitrogen(180); setPhosphorus(14); setPotassium(240); setPh(8.3); setOrganicCarbon(0.42);
    }
  };

  // Status checks
  const statusN = nitrogen < 250 ? 'Low (Deficient)' : nitrogen > 500 ? 'High (Excess)' : 'Optimal';
  const statusP = phosphorus < 12 ? 'Low (Deficient)' : phosphorus > 25 ? 'High (Excess)' : 'Optimal';
  const statusK = potassium < 130 ? 'Low (Deficient)' : potassium > 300 ? 'High (Excess)' : 'Optimal';

  let phStatus = 'Neutral (Ideal for most crops)';
  let phColor = 'emerald';
  if (ph < 6.5) {
    phStatus = 'Acidic (Apply Agricultural Lime)';
    phColor = 'amber';
  } else if (ph > 7.8) {
    phStatus = 'Alkaline (Apply Gypsum)';
    phColor = 'red';
  }

  // Calculate Health Score (0 - 100)
  let healthScore = 75;
  if (statusN === 'Optimal') healthScore += 8;
  if (statusP === 'Optimal') healthScore += 8;
  if (statusK === 'Optimal') healthScore += 8;
  if (ph >= 6.5 && ph <= 7.5) healthScore += 6;
  if (organicCarbon >= 0.6) healthScore += 5;
  if (statusN.startsWith('Low')) healthScore -= 10;
  if (statusP.startsWith('Low')) healthScore -= 10;
  healthScore = Math.max(30, Math.min(98, healthScore));

  const ureaBags = statusN.startsWith('Low') ? 2.5 : statusN.startsWith('High') ? 1.0 : 1.8;
  const dapBags = statusP.startsWith('Low') ? 1.5 : statusP.startsWith('High') ? 0.5 : 1.0;
  const mopBags = statusK.startsWith('Low') ? 0.8 : statusK.startsWith('High') ? 0.2 : 0.5;

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-teal-100 dark:bg-teal-950/60 rounded-full text-xs font-bold text-teal-800 dark:text-teal-300 border border-teal-300 dark:border-teal-800 mb-2">
            <Sparkles className="w-4 h-4 text-teal-600" /> Digital Soil Testing & Nutrient Advisory
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white flex items-center gap-2">
            <Layers className="w-8 h-8 text-emerald-600 dark:text-emerald-400" /> Soil Health Card & NPK Calculator
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1 font-medium">
            Analyze soil test parameters, calculate precise fertilizer dosages in 50kg bags, and restore soil fertility.
          </p>
        </div>

        {/* Quick Presets */}
        <div className="flex flex-wrap items-center gap-2">
          <button onClick={() => setPreset('alluvial')} className="px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-emerald-100 text-xs font-bold text-gray-700 dark:text-gray-300 transition-colors">
            Alluvial Loam
          </button>
          <button onClick={() => setPreset('low_n')} className="px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-emerald-100 text-xs font-bold text-gray-700 dark:text-gray-300 transition-colors">
            Low Nitrogen Field
          </button>
          <button onClick={() => setPreset('alkaline')} className="px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-emerald-100 text-xs font-bold text-gray-700 dark:text-gray-300 transition-colors">
            Alkaline Soil (pH 8.3)
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Controls Column */}
        <div className="lg:col-span-5 bg-white dark:bg-gray-800/90 backdrop-blur-xl p-6 sm:p-7 rounded-3xl border border-gray-200 dark:border-gray-700/80 shadow-md space-y-5">
          <h3 className="text-base font-black text-gray-900 dark:text-white flex items-center gap-2 border-b border-gray-100 dark:border-gray-700 pb-3">
            <FlaskConical className="w-5 h-5 text-emerald-600" /> Soil Test Parameters
          </h3>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-bold text-gray-600 dark:text-gray-300">Available Nitrogen (N)</label>
              <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">{nitrogen} kg/ha</span>
            </div>
            <input 
              type="range" min="80" max="450" value={nitrogen} 
              onChange={e => setNitrogen(parseInt(e.target.value))}
              className="w-full accent-emerald-600 cursor-pointer" 
            />
            <div className="flex justify-between text-[10px] text-gray-400 mt-1">
              <span>Low (&lt;250)</span>
              <span>Medium (250-500)</span>
              <span>High (&gt;500)</span>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-bold text-gray-600 dark:text-gray-300">Available Phosphorus (P)</label>
              <span className="text-xs font-black text-teal-600 dark:text-teal-400">{phosphorus} kg/ha</span>
            </div>
            <input 
              type="range" min="5" max="40" value={phosphorus} 
              onChange={e => setPhosphorus(parseInt(e.target.value))}
              className="w-full accent-teal-600 cursor-pointer" 
            />
            <div className="flex justify-between text-[10px] text-gray-400 mt-1">
              <span>Low (&lt;12)</span>
              <span>Medium (12-25)</span>
              <span>High (&gt;25)</span>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-bold text-gray-600 dark:text-gray-300">Available Potassium (K)</label>
              <span className="text-xs font-black text-blue-600 dark:text-blue-400">{potassium} kg/ha</span>
            </div>
            <input 
              type="range" min="70" max="350" value={potassium} 
              onChange={e => setPotassium(parseInt(e.target.value))}
              className="w-full accent-blue-600 cursor-pointer" 
            />
            <div className="flex justify-between text-[10px] text-gray-400 mt-1">
              <span>Low (&lt;130)</span>
              <span>Medium (130-300)</span>
              <span>High (&gt;300)</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-gray-600 dark:text-gray-300 block mb-1">Soil pH Level</label>
              <input 
                type="number" step="0.1" min="5.0" max="9.5" value={ph} 
                onChange={e => setPh(parseFloat(e.target.value))}
                className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl px-3 py-2 text-xs font-bold dark:text-white outline-none"
              />
              <span className="text-[10px] text-gray-400 block mt-1">Ideal: 6.5 - 7.5</span>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-600 dark:text-gray-300 block mb-1">Organic Carbon (%)</label>
              <input 
                type="number" step="0.05" min="0.1" max="1.5" value={organicCarbon} 
                onChange={e => setOrganicCarbon(parseFloat(e.target.value))}
                className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl px-3 py-2 text-xs font-bold dark:text-white outline-none"
              />
              <span className="text-[10px] text-gray-400 block mt-1">Optimal: &gt; 0.6%</span>
            </div>
          </div>
        </div>

        {/* Results & Health Card Column */}
        <div className="lg:col-span-7 space-y-6">
          {/* Soil Health Score Banner */}
          <div className="bg-gradient-to-br from-emerald-800 via-teal-900 to-emerald-950 text-white p-6 sm:p-7 rounded-3xl shadow-xl border border-emerald-700/50 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center sm:text-left">
              <span className="text-xs font-bold text-emerald-200 uppercase tracking-wider">Overall Soil Index</span>
              <h3 className="text-4xl sm:text-5xl font-black drop-shadow-md">{healthScore} / 100</h3>
              <p className="text-xs text-emerald-200 font-medium">
                {healthScore >= 80 ? 'Grade A: Highly Productive Soil' : healthScore >= 60 ? 'Grade B: Moderate Fertility' : 'Grade C: Nutrient Deficient Soil'}
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 text-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300 block mb-1">pH Classification</span>
              <span className="text-base font-black">{phStatus}</span>
            </div>
          </div>

          {/* Precision Fertilizer Prescription */}
          <div className="bg-white dark:bg-gray-800/90 backdrop-blur-xl p-6 rounded-3xl border border-gray-200 dark:border-gray-700/80 shadow-md space-y-5">
            <h3 className="text-base font-black text-gray-900 dark:text-white flex items-center gap-2">
              <Scale className="w-5 h-5 text-emerald-600" /> Recommended Fertilizer Prescription (Per Acre)
            </h3>

            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200 dark:border-emerald-800 text-center">
                <span className="text-[11px] font-bold text-gray-500 uppercase block">Urea (46% N)</span>
                <span className="text-2xl font-black text-emerald-700 dark:text-emerald-300 my-1 block">{ureaBags}</span>
                <span className="text-[10px] font-semibold text-gray-400">Bags (50 kg each)</span>
              </div>

              <div className="p-4 bg-teal-50 dark:bg-teal-950/40 rounded-2xl border border-teal-200 dark:border-teal-800 text-center">
                <span className="text-[11px] font-bold text-gray-500 uppercase block">DAP (18:46:0)</span>
                <span className="text-2xl font-black text-teal-700 dark:text-teal-300 my-1 block">{dapBags}</span>
                <span className="text-[10px] font-semibold text-gray-400">Bags (50 kg each)</span>
              </div>

              <div className="p-4 bg-blue-50 dark:bg-blue-950/40 rounded-2xl border border-blue-200 dark:border-blue-800 text-center">
                <span className="text-[11px] font-bold text-gray-500 uppercase block">MOP (60% K₂O)</span>
                <span className="text-2xl font-black text-blue-700 dark:text-blue-300 my-1 block">{mopBags}</span>
                <span className="text-[10px] font-semibold text-gray-400">Bags (50 kg each)</span>
              </div>
            </div>

            {/* Micronutrient & Organic Amendments */}
            <div className="space-y-3 pt-2">
              <div className="flex items-start gap-3 p-3.5 bg-gray-50 dark:bg-gray-900/60 rounded-2xl border border-gray-100 dark:border-gray-800 text-xs font-semibold text-gray-700 dark:text-gray-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Micronutrient Boost:</strong> Apply Zinc Sulphate 33% @ 5 kg/acre + Ferrous Sulphate @ 2 kg/acre at sowing.</span>
              </div>

              <div className="flex items-start gap-3 p-3.5 bg-gray-50 dark:bg-gray-900/60 rounded-2xl border border-gray-100 dark:border-gray-800 text-xs font-semibold text-gray-700 dark:text-gray-300">
                <Sprout className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Organic Carbon Enrichment:</strong> {organicCarbon < 0.6 
                    ? 'Current OC is low. Incorporate 2-3 tonnes of farmyard manure (FYM) or green manuring with Dhaincha.' 
                    : 'Soil organic carbon is optimal. Maintain zero-tillage mulch to preserve microbial health.'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
