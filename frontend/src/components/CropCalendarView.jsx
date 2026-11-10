import React, { useState, useEffect } from 'react';
import { 
  CalendarDays, Sprout, CheckCircle2, Clock, AlertTriangle, 
  ArrowRight, Sparkles, Filter, Droplets, ShieldAlert, Check
} from 'lucide-react';

const CROP_STAGES_DATA = {
  wheat: [
    { id: 'w1', stage: 'Germination & Basal Nutrition', days: 'Day 0 - 15', desc: 'Seed treatment with Trichoderma (5g/kg). Apply full basal DAP (50kg/acre) + MOP (25kg/acre).', status: 'done', alert: 'Maintain optimum soil moisture for uniform seedling emergence.' },
    { id: 'w2', stage: 'Crown Root Initiation (CRI)', days: 'Day 16 - 25', desc: 'CRITICAL IRRIGATION: First irrigation strictly between 21-25 days. Apply 1st Urea dose (45kg/acre).', status: 'active', alert: 'Missing CRI irrigation reduces final tillers by up to 30%!' },
    { id: 'w3', stage: 'Tillering & Vegetative Phase', days: 'Day 26 - 45', desc: 'Weed control spray (Sulfosulfuron 75% @ 13.5g/acre). Second light irrigation if soil dries.', status: 'upcoming', alert: 'Scout for early signs of yellow rust on lower leaf blades.' },
    { id: 'w4', stage: 'Jointing & Booting Stage', days: 'Day 46 - 65', desc: 'Apply 2nd Urea top dressing (45kg/acre) + Zinc Sulphate spray (1kg/acre in 200L water).', status: 'upcoming', alert: 'Stem elongation begins; avoid high nitrogen overdose.' },
    { id: 'w5', stage: 'Flowering & Earhead Emergence', days: 'Day 66 - 85', desc: 'Heading phase. Spray 1% NPK (19:19:19) for grain size enhancement. Third irrigation.', status: 'upcoming', alert: 'High temperatures during flowering cause pollen sterility.' },
    { id: 'w6', stage: 'Milk & Dough Grain-Filling Stage', days: 'Day 86 - 110', desc: 'Final irrigation during dough stage. Stop water 10-12 days prior to expected harvest.', status: 'upcoming', alert: 'Protect from terminal heat stress with light evening irrigation.' },
    { id: 'w7', stage: 'Maturity & Harvesting', days: 'Day 111 - 130', desc: 'Harvest when grain moisture drops below 14%. Store in dry, fumigated bins.', status: 'upcoming', alert: 'Avoid pre-harvest rain exposure to prevent seed sprouting.' }
  ],
  rice: [
    { id: 'r1', stage: 'Nursery & Seedling Raising', days: 'Day 0 - 25', desc: 'Seed soaking in Carbendazim. Maintain thin water layer in nursery bed.', status: 'done', alert: 'Protect young seedlings from gall midge.' },
    { id: 'r2', stage: 'Field Preparation & Transplanting', days: 'Day 26 - 35', desc: 'Puddling field thoroughly. Transplant 2-3 seedlings per hill at 20x15cm spacing. Apply basal DAP + MOP.', status: 'active', alert: 'Transplant within 25 days of seedling age.' },
    { id: 'r3', stage: 'Tillering & Vegetative Growth', days: 'Day 36 - 60', desc: '1st Top Dressing of Urea (45kg/acre). Maintain 2-3cm standing water.', status: 'upcoming', alert: 'Apply weedicide Pretilachlor within 3 days of transplanting.' },
    { id: 'r4', stage: 'Panicle Initiation & Booting', days: 'Day 61 - 85', desc: '2nd Top Dressing of Urea. Spray Cartap Hydrochloride if stem borer noticed.', status: 'upcoming', alert: 'Do not allow field to dry during panicle formation.' },
    { id: 'r5', stage: 'Flowering & Grain Filling', days: 'Day 86 - 115', desc: 'Maintain saturated soil. Spray Tricyclazole 75% WP if leaf blast spots appear.', status: 'upcoming', alert: 'Drain field water completely 10 days before harvest.' },
    { id: 'r6', stage: 'Maturity & Harvesting', days: 'Day 116 - 140', desc: 'Harvest when 85% of panicles turn golden brown. Clean and sun dry grains.', status: 'upcoming', alert: 'Ensure moisture level is 12-14% for storage.' }
  ],
  mustard: [
    { id: 'm1', stage: 'Sowing & Germination', days: 'Day 0 - 15', desc: 'Seed treatment with Thiram. Basal dose of SSP (Single Super Phosphate) for high sulfur content.', status: 'done', alert: 'Sulfur is crucial for high oil percentage.' },
    { id: 'm2', stage: 'Thinning & Vegetative Growth', days: 'Day 16 - 30', desc: 'Thinning to maintain 15cm plant-to-plant spacing. First irrigation at 28-30 days.', status: 'active', alert: 'Crowded plants produce fewer pods and branches.' },
    { id: 'm3', stage: 'Flowering & Pod Formation', days: 'Day 31 - 65', desc: 'Second irrigation during pod formation. Spray Dimethoate if aphids (चेपा) attack.', status: 'upcoming', alert: 'Monitor daily for mustard aphid colonies on flower twigs.' },
    { id: 'm4', stage: 'Pod Maturation & Harvesting', days: 'Day 66 - 105', desc: 'Harvest early in the morning when pods turn yellowish brown to prevent pod shattering.', status: 'upcoming', alert: 'Harvesting in hot noon causes seed shattering losses.' }
  ]
};

export const CropCalendarView = () => {
  const [crop, setCrop] = useState('wheat');
  const [sowingDate, setSowingDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 22); // Default to 22 days ago (CRI stage)
    return d.toISOString().split('T')[0];
  });
  const [completedTasks, setCompletedTasks] = useState(() => {
    try {
      const saved = localStorage.getItem('krishi_calendar_tasks');
      return saved ? JSON.parse(saved) : {};
    } catch (e) { return {}; }
  });

  const stages = CROP_STAGES_DATA[crop] || CROP_STAGES_DATA.wheat;

  const toggleTask = (taskId) => {
    const next = { ...completedTasks, [taskId]: !completedTasks[taskId] };
    setCompletedTasks(next);
    localStorage.setItem('krishi_calendar_tasks', JSON.stringify(next));
  };

  // Calculate current days elapsed
  const start = new Date(sowingDate);
  const now = new Date();
  const daysElapsed = Math.max(0, Math.floor((now - start) / (1000 * 60 * 60 * 24)));

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-100 dark:bg-amber-950/60 rounded-full text-xs font-bold text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800 mb-2">
            <Sparkles className="w-4 h-4 text-amber-600" /> Dynamic Agronomic Roadmap
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white flex items-center gap-2">
            <CalendarDays className="w-8 h-8 text-emerald-600 dark:text-emerald-400" /> Smart Day-by-Day Crop Calendar
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1 font-medium">
            Personalized crop schedule with precise fertilizer timing, irrigation checkpoints, and field checklists.
          </p>
        </div>

        {/* Quick Sowing Date Inputs */}
        <div className="flex flex-wrap items-center gap-3 bg-white dark:bg-gray-800/90 p-3 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <div>
            <label className="text-[10px] font-bold text-gray-500 uppercase block">Selected Crop</label>
            <select 
              value={crop} 
              onChange={e => setCrop(e.target.value)}
              className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-1.5 text-xs font-bold dark:text-white outline-none"
            >
              <option value="wheat">Wheat (गेहूं)</option>
              <option value="rice">Rice / Paddy (धान)</option>
              <option value="mustard">Mustard (सरसों)</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold text-gray-500 uppercase block">Sowing Date</label>
            <input 
              type="date" 
              value={sowingDate} 
              onChange={e => setSowingDate(e.target.value)}
              className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-1.5 text-xs font-bold dark:text-white outline-none"
            />
          </div>
        </div>
      </div>

      {/* Progress Banner */}
      <div className="bg-gradient-to-r from-emerald-700 via-teal-800 to-emerald-950 text-white p-6 sm:p-7 rounded-3xl shadow-xl border border-emerald-600/40 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
          <div>
            <span className="text-xs font-bold text-emerald-200 uppercase tracking-wider">Crop Growth Status</span>
            <h3 className="text-2xl sm:text-3xl font-black mt-1">Day {daysElapsed} since sowing</h3>
          </div>
          <span className="px-4 py-1.5 bg-white/20 backdrop-blur-md rounded-full text-xs font-black text-amber-300">
            Active Phase: Crown Root Initiation (CRI)
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-black/30 h-3 rounded-full overflow-hidden p-0.5">
          <div 
            className="bg-gradient-to-r from-amber-400 to-emerald-400 h-full rounded-full transition-all duration-700"
            style={{ width: `${Math.min(100, Math.round((daysElapsed / 130) * 100))}%` }}
          />
        </div>
        <div className="flex justify-between text-[11px] text-emerald-200 font-semibold mt-2">
          <span>Sowing (Day 0)</span>
          <span>Current: Day {daysElapsed}</span>
          <span>Harvesting (~Day 130)</span>
        </div>
      </div>

      {/* Timeline Stages Cards */}
      <div className="space-y-4">
        {stages.map((st, idx) => {
          const isDone = completedTasks[st.id];
          return (
            <div 
              key={st.id}
              className={`p-5 sm:p-6 rounded-3xl border transition-all ${
                st.status === 'active'
                  ? 'bg-emerald-50/70 dark:bg-emerald-950/40 border-emerald-400 dark:border-emerald-700 shadow-md ring-2 ring-emerald-500/20'
                  : 'bg-white dark:bg-gray-800/90 border-gray-200 dark:border-gray-700/80 shadow-sm'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ${
                    st.status === 'active' 
                      ? 'bg-emerald-600 text-white shadow-md' 
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                  }`}>
                    {idx + 1}
                  </div>
                  <div>
                    <h4 className="font-black text-base text-gray-900 dark:text-white flex items-center gap-2">
                      {st.stage}
                      {st.status === 'active' && (
                        <span className="text-[10px] bg-emerald-600 text-white font-black px-2 py-0.5 rounded-full uppercase tracking-wider animate-pulse">
                          Current Stage
                        </span>
                      )}
                    </h4>
                    <span className="text-xs font-bold text-gray-500 dark:text-gray-400 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> {st.days}
                    </span>
                  </div>
                </div>

                {/* Mark as Done Checkbox */}
                <button 
                  onClick={() => toggleTask(st.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    isDone 
                      ? 'bg-emerald-600 text-white shadow-sm' 
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-emerald-50'
                  }`}
                >
                  <Check className={`w-4 h-4 ${isDone ? 'text-white' : 'text-gray-400'}`} />
                  {isDone ? 'Tasks Completed' : 'Mark Tasks Done'}
                </button>
              </div>

              {/* Task Details */}
              <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 font-medium leading-relaxed mb-3">
                {st.desc}
              </p>

              {/* Agronomic Alert */}
              <div className="flex items-center gap-2 text-xs font-semibold text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/50 p-2.5 rounded-xl border border-amber-200 dark:border-amber-800">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span><strong>Agronomist Alert:</strong> {st.alert}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
