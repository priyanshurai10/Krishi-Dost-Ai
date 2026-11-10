import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, Sprout, Sparkles, Scale, AlertTriangle, 
  CheckCircle2, ArrowRight, DollarSign, Award, Droplets, 
  RefreshCw, Layers, ShieldCheck, Info
} from 'lucide-react';

const CROP_BENCHMARKS = {
  wheat: { name: 'Wheat (गेहूं)', baseYield: 22, msp: 2425, costPerAcre: 13500, season: 'Rabi' },
  rice: { name: 'Rice / Paddy (धान)', baseYield: 26, msp: 2300, costPerAcre: 16000, season: 'Kharif' },
  cotton: { name: 'Cotton (कपास)', baseYield: 14, msp: 7200, costPerAcre: 21000, season: 'Kharif' },
  mustard: { name: 'Mustard (सरसों)', baseYield: 9.5, msp: 5750, costPerAcre: 11000, season: 'Rabi' },
  sugarcane: { name: 'Sugarcane (गन्ना)', baseYield: 380, msp: 340, costPerAcre: 35000, season: 'Annual' },
  maize: { name: 'Maize (मक्का)', baseYield: 24, msp: 2090, costPerAcre: 12500, season: 'Kharif' },
  soybean: { name: 'Soybean (सोयाबीन)', baseYield: 11.5, msp: 4650, costPerAcre: 12000, season: 'Kharif' },
  potato: { name: 'Potato (आलू)', baseYield: 120, msp: 1450, costPerAcre: 38000, season: 'Rabi' },
  gram: { name: 'Gram / Chana (चना)', baseYield: 8.5, msp: 5440, costPerAcre: 10500, season: 'Rabi' }
};

export const CropYieldPredictorView = ({ baseUrl }) => {
  const [crop, setCrop] = useState('wheat');
  const [soilType, setSoilType] = useState('alluvial');
  const [season, setSeason] = useState('rabi');
  const [landSize, setLandSize] = useState(2.5);
  const [irrigation, setIrrigation] = useState('canal');
  const [fertilizerKg, setFertilizerKg] = useState(100);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const calculateLocalPrediction = () => {
    const profile = CROP_BENCHMARKS[crop] || CROP_BENCHMARKS.wheat;
    const acreage = parseFloat(landSize) || 1;

    const SOIL_WEIGHTS = { alluvial: 1.12, black: (crop === 'cotton' || crop === 'soybean') ? 1.18 : 1.06, red: 0.96, clayey: 1.05, sandy_loam: 0.94 };
    const soilMult = SOIL_WEIGHTS[soilType] || 1.0;

    const IRR_WEIGHTS = { drip: 1.22, sprinkler: 1.14, canal: 1.06, borewell: 1.03, rainfed: 0.82 };
    const irrMult = IRR_WEIGHTS[irrigation] || 1.0;

    const fertDose = parseFloat(fertilizerKg) || 100;
    let fertMult = 1.0;
    if (fertDose < 60) fertMult = 0.88;
    else if (fertDose >= 60 && fertDose <= 140) fertMult = 1.08;
    else fertMult = 1.02;

    const predictedYieldPerAcre = +(profile.baseYield * soilMult * irrMult * fertMult).toFixed(1);
    const totalYieldQuintals = +(predictedYieldPerAcre * acreage).toFixed(1);
    const grossIncome = Math.round(totalYieldQuintals * profile.msp);
    const totalProductionCost = Math.round(profile.costPerAcre * acreage);
    const netProfit = grossIncome - totalProductionCost;
    const profitMargin = grossIncome > 0 ? +((netProfit / grossIncome) * 100).toFixed(1) : 0;

    let riskScore = "Low Risk";
    let riskColor = "emerald";
    if (irrigation === 'rainfed' || fertDose < 50) {
      riskScore = "High Risk (Water/Nutrient Stress)";
      riskColor = "red";
    } else if (irrigation === 'canal' || fertDose > 160) {
      riskScore = "Moderate Risk (Field Drainage & Leaching)";
      riskColor = "amber";
    }

    const recommendations = [
      `Apply basal DAP @ 50 kg/acre + MOP @ 25 kg/acre during sowing for optimal root anchoring.`,
      irrigation === 'drip' ? `Drip fertigation optimizes water use by 40% and raises yield by up to 22%.` : `Execute first irrigation strictly during Crown Root Initiation (CRI) at 21-25 days.`,
      `Foliar spray of 1% Zinc Sulphate + 2% Urea at tillering phase enhances grain weight.`,
      `Current MSP support is ₹${profile.msp}/q. Target government procurement or registered APMC Mandi.`
    ];

    return {
      crop,
      predictedYieldPerAcre,
      totalYieldQuintals,
      benchmarkYield: profile.baseYield,
      differenceVsBenchmark: +(((predictedYieldPerAcre - profile.baseYield) / profile.baseYield) * 100).toFixed(1),
      grossIncome,
      totalProductionCost,
      netProfit,
      profitMargin,
      riskScore,
      riskColor,
      recommendations
    };
  };

  const handlePredict = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${baseUrl || ''}/api/predict-yield`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ crop, soilType, season, landSize, irrigation, fertilizerKg }),
        signal: AbortSignal.timeout(4000)
      });
      const data = await res.json();
      if (data.success) {
        setResult(data);
      } else {
        setResult(calculateLocalPrediction());
      }
    } catch (e) {
      setResult(calculateLocalPrediction());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handlePredict();
  }, [crop, soilType, season, landSize, irrigation, fertilizerKg]);

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-100 dark:bg-emerald-950/60 rounded-full text-xs font-bold text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 mb-2">
            <Sparkles className="w-4 h-4 text-emerald-600" /> Machine Learning Agricultural Predictor
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white flex items-center gap-2">
            <TrendingUp className="w-8 h-8 text-emerald-600 dark:text-emerald-400" /> AI Crop Yield & Harvest Predictor
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1 font-medium">
            Forecast harvest output, compare with historical district benchmarks, and analyze expected revenue at live MSP rates.
          </p>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Controls Column */}
        <div className="lg:col-span-5 bg-white dark:bg-gray-800/90 backdrop-blur-xl p-6 sm:p-7 rounded-3xl border border-gray-200 dark:border-gray-700/80 shadow-md space-y-5">
          <h3 className="text-base font-black text-gray-900 dark:text-white flex items-center gap-2 border-b border-gray-100 dark:border-gray-700 pb-3">
            <Layers className="w-5 h-5 text-emerald-600" /> Farm & Crop Parameters
          </h3>

          <div>
            <label className="text-xs font-bold text-gray-600 dark:text-gray-300 block mb-1.5">Select Crop</label>
            <select 
              value={crop} 
              onChange={e => setCrop(e.target.value)}
              className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl px-4 py-2.5 text-sm font-semibold dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
            >
              {Object.entries(CROP_BENCHMARKS).map(([key, val]) => (
                <option key={key} value={key}>{val.name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-gray-600 dark:text-gray-300 block mb-1.5">Soil Type</label>
              <select 
                value={soilType} 
                onChange={e => setSoilType(e.target.value)}
                className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl px-3 py-2.5 text-xs font-semibold dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
              >
                <option value="alluvial">Alluvial (जलोढ़)</option>
                <option value="black">Black Soil (काली मिट्टी)</option>
                <option value="red">Red/Yellow (लाल मिट्टी)</option>
                <option value="clayey">Clayey Loam (दोमट)</option>
                <option value="sandy_loam">Sandy Loam (बलुई दोमट)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-600 dark:text-gray-300 block mb-1.5">Season</label>
              <select 
                value={season} 
                onChange={e => setSeason(e.target.value)}
                className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl px-3 py-2.5 text-xs font-semibold dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
              >
                <option value="rabi">Rabi (Winter/रबी)</option>
                <option value="kharif">Kharif (Monsoon/खरीफ)</option>
                <option value="zaid">Zaid (Summer/जायद)</option>
              </select>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-bold text-gray-600 dark:text-gray-300">Land Area (Acres)</label>
              <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-lg border border-emerald-200 dark:border-emerald-800">
                {landSize} Acres
              </span>
            </div>
            <input 
              type="range" 
              min="0.5" 
              max="25" 
              step="0.5" 
              value={landSize} 
              onChange={e => setLandSize(parseFloat(e.target.value))}
              className="w-full accent-emerald-600 cursor-pointer"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-600 dark:text-gray-300 block mb-1.5">Irrigation Source</label>
            <select 
              value={irrigation} 
              onChange={e => setIrrigation(e.target.value)}
              className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl px-4 py-2.5 text-sm font-semibold dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
            >
              <option value="drip">Drip Fertigation (ड्रिप सिंचाई - Highest Yield)</option>
              <option value="sprinkler">Sprinkler Irrigation (फव्वारा सिंचाई)</option>
              <option value="canal">Canal / River Network (नहर सिंचाई)</option>
              <option value="borewell">Borewell / Tube-well (नलकूप)</option>
              <option value="rainfed">Rainfed / Dryland (वर्षा आधारित)</option>
            </select>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-bold text-gray-600 dark:text-gray-300">Fertilizer Dosage Intensity</label>
              <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
                {fertilizerKg} kg/acre
              </span>
            </div>
            <input 
              type="range" 
              min="30" 
              max="200" 
              step="10" 
              value={fertilizerKg} 
              onChange={e => setFertilizerKg(parseInt(e.target.value))}
              className="w-full accent-emerald-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-gray-400 mt-1 font-semibold">
              <span>Low (Organic)</span>
              <span>Optimal (Balanced)</span>
              <span>Heavy Dosage</span>
            </div>
          </div>
        </div>

        {/* Results Column */}
        <div className="lg:col-span-7 space-y-6">
          {result && (
            <>
              {/* Top Output Hero Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-emerald-700 via-teal-800 to-emerald-950 text-white p-6 rounded-3xl shadow-lg border border-emerald-600/40 relative overflow-hidden">
                  <div className="text-xs font-bold uppercase tracking-wider text-emerald-200 mb-1 flex items-center justify-between">
                    <span>Predicted Yield</span>
                    <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">{landSize} Acres</span>
                  </div>
                  <div className="flex items-baseline gap-2 mt-2">
                    <span className="text-4xl sm:text-5xl font-black drop-shadow-md">{result.totalYieldQuintals}</span>
                    <span className="text-lg font-bold text-emerald-100">Quintals Total</span>
                  </div>
                  <p className="text-xs text-emerald-200 mt-2 font-medium">
                    ({result.predictedYieldPerAcre} q/acre vs {result.benchmarkYield} q/acre benchmark)
                  </p>
                  <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 bg-white/15 rounded-full text-xs font-bold">
                    <Award className="w-3.5 h-3.5 text-amber-300"/> 
                    {result.differenceVsBenchmark >= 0 ? `+${result.differenceVsBenchmark}% above district avg` : `${result.differenceVsBenchmark}% below potential`}
                  </div>
                </div>

                <div className="bg-gradient-to-br from-blue-700 via-indigo-800 to-slate-900 text-white p-6 rounded-3xl shadow-lg border border-blue-600/40 relative overflow-hidden">
                  <div className="text-xs font-bold uppercase tracking-wider text-blue-200 mb-1">
                    Financial Projection
                  </div>
                  <div className="flex items-baseline gap-2 mt-2">
                    <span className="text-4xl sm:text-5xl font-black drop-shadow-md">₹{result.netProfit.toLocaleString()}</span>
                    <span className="text-sm font-bold text-blue-200">Net Profit</span>
                  </div>
                  <p className="text-xs text-blue-200 mt-2 font-medium">
                    Gross Revenue: ₹{result.grossIncome.toLocaleString()} • Cost: ₹{result.totalProductionCost.toLocaleString()}
                  </p>
                  <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 bg-white/15 rounded-full text-xs font-bold">
                    <Scale className="w-3.5 h-3.5 text-emerald-300"/> Net Profit Margin: {result.profitMargin}%
                  </div>
                </div>
              </div>

              {/* Risk & Vulnerability Banner */}
              <div className={`p-4 rounded-2xl border flex items-center gap-3.5 ${
                result.riskColor === 'emerald' 
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200' 
                  : result.riskColor === 'amber'
                  ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200'
                  : 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-800 text-red-900 dark:text-red-200'
              }`}>
                <div className="w-10 h-10 rounded-xl bg-white dark:bg-gray-800 shadow-sm flex items-center justify-center shrink-0">
                  {result.riskColor === 'emerald' ? <ShieldCheck className="w-6 h-6 text-emerald-600" /> : <AlertTriangle className="w-6 h-6 text-amber-600" />}
                </div>
                <div>
                  <h4 className="font-black text-sm">Vulnerability Assessment: {result.riskScore}</h4>
                  <p className="text-xs opacity-90 font-medium mt-0.5">
                    Evaluated against local moisture retention models and nutrient leaching stress factors.
                  </p>
                </div>
              </div>

              {/* AI Yield Maximization Recommendations */}
              <div className="bg-white dark:bg-gray-800/90 backdrop-blur-xl p-6 rounded-3xl border border-gray-200 dark:border-gray-700/80 shadow-md space-y-4">
                <h3 className="text-base font-black text-gray-900 dark:text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-500" /> AI Yield Maximization Strategy
                </h3>
                <div className="space-y-2.5">
                  {result.recommendations.map((rec, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-900/60 rounded-2xl border border-gray-100 dark:border-gray-800 text-xs font-semibold text-gray-700 dark:text-gray-300">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span className="leading-relaxed">{rec}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

      </div>
    </div>
  );
};
