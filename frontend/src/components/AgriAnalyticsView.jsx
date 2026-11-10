import React, { useState } from 'react';
import { 
  BarChart3, TrendingUp, AlertTriangle, Sparkles, Scale, 
  ArrowRight, ShieldCheck, CheckCircle2, DollarSign, Layers,
  PieChart, Activity, Info
} from 'lucide-react';

export const AgriAnalyticsView = () => {
  const [activeSeason, setActiveSeason] = useState('rabi_2025_26');

  const kpis = [
    { label: 'Farm Productivity Index', value: '94.2%', change: '+6.4% YoY', positive: true, desc: 'Yield per hectare vs national benchmark' },
    { label: 'Net Profit Margin', value: '48.6%', change: '+3.8% YoY', positive: true, desc: 'Realized margin across all harvested crops' },
    { label: 'Cost of Cultivation', value: '₹13,850', change: '-4.2% YoY', positive: true, desc: 'Average expenditure per acre cultivated' },
    { label: 'Resource Efficiency', value: '91 / 100', change: '+8.1 pts', positive: true, desc: 'Combined water & fertilizer utilization' },
  ];

  const trendData = [
    { crop: 'Wheat (गेहूं)', y2024: 20.2, y2025: 21.8, y2026: 23.5, price: '₹2,425 /q', trend: 'Up (+7.8%)' },
    { crop: 'Mustard (सरसों)', y2024: 8.4, y2025: 9.1, y2026: 10.2, price: '₹5,750 /q', trend: 'Up (+12.1%)' },
    { crop: 'Paddy / Rice (धान)', y2024: 24.5, y2025: 25.6, y2026: 26.8, price: '₹2,300 /q', trend: 'Stable (+4.7%)' },
    { crop: 'Potato (आलू)', y2024: 110, y2025: 115, y2026: 124, price: '₹1,450 /q', trend: 'Fluctuating (+2.1%)' },
  ];

  const costDrivers = [
    { name: 'Fertilizers & Nutrients', percent: 28, color: 'bg-emerald-500', amount: '₹3,880/acre' },
    { name: 'Machinery, Fuel & Tillage', percent: 22, color: 'bg-blue-500', amount: '₹3,050/acre' },
    { name: 'Hired & Machine Labour', percent: 20, color: 'bg-amber-500', amount: '₹2,770/acre' },
    { name: 'Certified Seeds & Treatment', percent: 16, color: 'bg-teal-500', amount: '₹2,210/acre' },
    { name: 'Irrigation & Electricity', percent: 14, color: 'bg-indigo-500', amount: '₹1,940/acre' }
  ];

  const riskOpportunities = [
    { 
      type: 'risk', 
      title: 'Terminal Heat Wave Risk in Late February', 
      desc: 'Unseasonal temperature spikes during wheat grain filling could trigger premature drying.', 
      action: 'Schedule light sprinkler irrigation during evening hours; apply 1% potassium nitrate foliar spray.' 
    },
    { 
      type: 'opportunity', 
      title: 'High-Margin Mustard Crop Intercropping', 
      desc: 'Mustard MSP increased by 7% with high market demand for edible oils.', 
      action: 'Dedicate 25% of land to drought-resilient mustard to increase blended farm profits by ~18%.' 
    },
    { 
      type: 'risk', 
      title: 'Excess Nitrogen Leaching in Coarse Loam', 
      desc: 'Heavy flood irrigation causes 35% of broadcast urea to leach below root zones.', 
      action: 'Split urea into 3 calibrated doses; combine with neem-coated pellets.' 
    },
    { 
      type: 'opportunity', 
      title: 'Solar Ag-Pump Subsidy Utilization (KUSUM)', 
      desc: 'Government provides 60% capital subsidy on solar water pump installation.', 
      action: 'Apply via state portal to eliminate diesel pumping expenses entirely.' 
    }
  ];

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 dark:bg-blue-950/60 rounded-full text-xs font-bold text-blue-800 dark:text-blue-300 border border-blue-300 dark:border-blue-800 mb-2">
            <Sparkles className="w-4 h-4 text-blue-600" /> Executive Business Intelligence
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white flex items-center gap-2">
            <BarChart3 className="w-8 h-8 text-emerald-600 dark:text-emerald-400" /> Agricultural Decision Dashboard
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1 font-medium">
            Turn farm raw data into actionable strategic intelligence: KPIs, multi-season yield trends, cost drivers, and risk-opportunity matrix.
          </p>
        </div>
      </div>

      {/* Level 1: Primary KPIs Grid */}
      <div>
        <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">
          Level 1: Executive Key Performance Indicators
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis.map((k, idx) => (
            <div key={idx} className="bg-white dark:bg-gray-800/90 p-5 rounded-3xl border border-gray-200 dark:border-gray-700/80 shadow-sm hover:border-emerald-500 transition-all">
              <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block">{k.label}</span>
              <div className="flex items-baseline justify-between mt-2">
                <span className="text-3xl font-black text-gray-900 dark:text-white">{k.value}</span>
                <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
                  {k.change}
                </span>
              </div>
              <p className="text-[11px] text-gray-400 dark:text-gray-500 font-medium mt-2">{k.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Level 2 & 3: Trends & Drivers */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Multi-Season Trends Table */}
        <div className="lg:col-span-7 bg-white dark:bg-gray-800/90 p-6 sm:p-7 rounded-3xl border border-gray-200 dark:border-gray-700/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-3">
            <div>
              <h3 className="text-base font-black text-gray-900 dark:text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-600" /> Level 2: Multi-Season Yield & Price Trajectory
              </h3>
              <span className="text-xs text-gray-500 font-medium">Historical harvest output per acre</span>
            </div>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1 rounded-full">
              3-Year Benchmark
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-gray-400 uppercase tracking-wider border-b border-gray-100 dark:border-gray-800">
                  <th className="py-2.5 font-bold">Crop</th>
                  <th className="py-2.5 font-bold">2024</th>
                  <th className="py-2.5 font-bold">2025</th>
                  <th className="py-2.5 font-bold">2026 (Pred)</th>
                  <th className="py-2.5 font-bold">Mandi Price</th>
                  <th className="py-2.5 font-bold">Growth</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800 font-semibold text-gray-700 dark:text-gray-300">
                {trendData.map((row, i) => (
                  <tr key={i} className="hover:bg-gray-50/50 dark:hover:bg-gray-900/50 transition-colors">
                    <td className="py-3 font-bold text-gray-900 dark:text-white">{row.crop}</td>
                    <td className="py-3">{row.y2024} q</td>
                    <td className="py-3">{row.y2025} q</td>
                    <td className="py-3 text-emerald-600 dark:text-emerald-400 font-black">{row.y2026} q</td>
                    <td className="py-3">{row.price}</td>
                    <td className="py-3 text-emerald-600 font-bold">{row.trend}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Cost Drivers Breakdown */}
        <div className="lg:col-span-5 bg-white dark:bg-gray-800/90 p-6 sm:p-7 rounded-3xl border border-gray-200 dark:border-gray-700/80 shadow-sm space-y-4">
          <div className="border-b border-gray-100 dark:border-gray-700 pb-3">
            <h3 className="text-base font-black text-gray-900 dark:text-white flex items-center gap-2">
              <PieChart className="w-5 h-5 text-blue-600" /> Level 3: Cultivation Cost Drivers
            </h3>
            <span className="text-xs text-gray-500 font-medium">Expense allocation per acre</span>
          </div>

          <div className="space-y-3.5">
            {costDrivers.map((c, i) => (
              <div key={i} className="space-y-1">
                <div className="flex justify-between items-center text-xs font-bold text-gray-700 dark:text-gray-300">
                  <span>{c.name}</span>
                  <span className="text-gray-500 font-medium">{c.amount} ({c.percent}%)</span>
                </div>
                <div className="w-full bg-gray-100 dark:bg-gray-800 h-2 rounded-full overflow-hidden">
                  <div className={`${c.color} h-full rounded-full`} style={{ width: `${c.percent}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Level 4 & 5: Risk & Opportunity Matrix + Strategic Actions */}
      <div className="bg-white dark:bg-gray-800/90 p-6 sm:p-7 rounded-3xl border border-gray-200 dark:border-gray-700/80 shadow-sm space-y-5">
        <div className="border-b border-gray-100 dark:border-gray-700 pb-3 flex justify-between items-center">
          <div>
            <h3 className="text-base font-black text-gray-900 dark:text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-amber-500" /> Level 4 & 5: Strategic Risk-Opportunity Matrix & Actions
            </h3>
            <span className="text-xs text-gray-500 font-medium">Data-driven business decisions for farm maximization</span>
          </div>
          <span className="text-xs font-bold px-3 py-1 bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200 rounded-full">
            Recommended Decisions
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {riskOpportunities.map((item, idx) => (
            <div 
              key={idx}
              className={`p-5 rounded-2xl border flex flex-col justify-between space-y-3 ${
                item.type === 'risk' 
                  ? 'bg-red-50/60 dark:bg-red-950/30 border-red-200 dark:border-red-800' 
                  : 'bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800'
              }`}
            >
              <div>
                <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full inline-block mb-2 ${
                  item.type === 'risk' ? 'bg-red-600 text-white' : 'bg-emerald-600 text-white'
                }`}>
                  {item.type === 'risk' ? '⚠️ Climate & Yield Risk' : '💡 Growth Opportunity'}
                </span>
                <h4 className="font-black text-sm text-gray-900 dark:text-white">{item.title}</h4>
                <p className="text-xs text-gray-600 dark:text-gray-300 font-medium mt-1 leading-relaxed">{item.desc}</p>
              </div>

              <div className="bg-white dark:bg-gray-900/80 p-3 rounded-xl border border-black/5 dark:border-white/10 text-xs">
                <span className="font-bold text-gray-900 dark:text-white block mb-0.5">Recommended Business Action:</span>
                <span className="text-emerald-700 dark:text-emerald-400 font-semibold">{item.action}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
