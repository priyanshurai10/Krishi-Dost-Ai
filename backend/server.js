import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import NodeCache from 'node-cache';
import OpenAI from 'openai';
import { generateDynamicAgriResponse } from './agriExpertAI.js';

dotenv.config();

const app = express();

// SECURITY & MIDDLEWARES
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: '*', methods: ['GET', 'POST', 'OPTIONS'], allowedHeaders: ['Content-Type', 'Authorization'] }));
app.use(express.json({ limit: '10mb' })); 

const apiLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });

// AI CONFIG
let groq = null;
if (process.env.GROQ_API_KEY) {
  try {
    groq = new OpenAI({ apiKey: process.env.GROQ_API_KEY, baseURL: "https://api.groq.com/openai/v1" });
  } catch (e) {
    console.warn("Groq initialization warning:", e.message);
  }
}

const queryCache = new NodeCache({ stdTTL: 86400 });

const SYSTEM_INSTRUCTION = `You are Krishi Dost, an elite agricultural AI assistant for Indian farmers.

STRICT MANDATORY RULE FOR LANGUAGE RESPONSE:
Analyze the user's prompt text. Identify the EXACT language, script, and writing style used by the user in their prompt.
YOU MUST RESPOND ONLY AND STRICTLY IN THE SAME LANGUAGE AND SCRIPT IN WHICH THE USER ASKED THE QUESTION!
- If the user asks in Hindi ("गेहूं में कौन सा खाद डालें?"), respond STRICTLY in Hindi using Devanagari script.
- If the user asks in Hinglish ("wheat me konsa fertilizer dale?"), respond STRICTLY in Hinglish (Hindi written in English alphabet).
- If the user asks in English ("What fertilizer should I use for wheat?"), respond STRICTLY in English.
- If the user asks in Bengali ("গম ফসলে কি সার দেব?"), respond STRICTLY in Bengali.
- If the user asks in Marathi, Punjabi, Tamil, Telugu, Gujarati, Bhojpuri, or any other language, respond STRICTLY in that same language and script!
- DO NOT answer in English if the user asked in Hindi, Hinglish, or any regional language!

Focus exclusively on farming, crops, fertilizers, pesticides, weather advisories, farm loans, and government schemes. Be concise, actionable, and encouraging.`;

// LOCAL INTELLIGENT AGRICULTURAL EXPERT SYSTEM
const generateSmartAgriculturalResponse = (text, imageBase64, language) => {
  return generateDynamicAgriResponse(text, imageBase64, language);
};

// ==========================================
// ROUTES
// ==========================================

// 1. Health Check
app.get('/health', (req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));

// 2. Weather Route
app.get('/api/weather', (req, res) => {
    const { pincode } = req.query;
    res.json({ 
        success: true, 
        location: `Pincode: ${pincode || 'India'}`,
        temp: "31°C",
        condition: "Partly Cloudy",
        alert: "Favorable condition for field work. Light irrigation recommended."
    });
});

// 3. Mandi Route
app.get('/api/mandi', (req, res) => {
    res.json({ 
        success: true, 
        rates: [
            { crop: "Wheat (गेंहू)", price: "₹2,425 /q", trend: "Up" },
            { crop: "Rice (धान)", price: "₹2,300 /q", trend: "Stable" },
            { crop: "Mustard (सरसों)", price: "₹5,750 /q", trend: "Up" },
            { crop: "Potato (आलू)", price: "₹1,450 /q", trend: "Down" },
            { crop: "Cotton (कपास)", price: "₹7,200 /q", trend: "Up" },
            { crop: "Soybean (सोयाबीन)", price: "₹4,650 /q", trend: "Stable" }
        ]
    });
});

// 4. Calculator Route
app.post('/api/calculate', (req, res) => {
    try {
        const { type, amount, rate, duration, cropType, landSize, sowingCost, fertilizerCost, labourCost, irrigationCost, expectedYield, marketPrice } = req.body;
        
        if (type === 'loan') {
            const p = parseFloat(amount) || 0;
            const r = (parseFloat(rate) || 7) / 12 / 100;
            const n = (parseFloat(duration) || 1) * 12;
            
            if (p <= 0 || n <= 0) {
              return res.json({ success: true, emi: 0, totalPayment: 0, totalInterest: 0 });
            }

            const emi = (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
            const totalPayment = emi * n;
            const totalInterest = totalPayment - p;

            return res.json({ 
                success: true, 
                emi: Math.round(emi), 
                totalPayment: Math.round(totalPayment),
                totalInterest: Math.round(totalInterest),
                principal: p
            });
        }
        
        // Profit calculation
        const acreage = parseFloat(landSize) || 1;
        const seedCost = (parseFloat(sowingCost) || 3500) * acreage;
        const fertCost = (parseFloat(fertilizerCost) || 4500) * acreage;
        const labCost = (parseFloat(labourCost) || 5000) * acreage;
        const irrCost = (parseFloat(irrigationCost) || 2000) * acreage;

        const totalCost = seedCost + fertCost + labCost + irrCost;
        
        const yieldPerAcre = parseFloat(expectedYield) || 22; // Quintals
        const pricePerQuintal = parseFloat(marketPrice) || 2400; // Rs
        const grossRevenue = acreage * yieldPerAcre * pricePerQuintal;
        const netProfit = grossRevenue - totalCost;
        const roi = totalCost > 0 ? ((netProfit / totalCost) * 100).toFixed(1) : 0;

        res.json({ 
            success: true, 
            totalCost: Math.round(totalCost),
            grossRevenue: Math.round(grossRevenue),
            estimatedReturn: Math.round(netProfit),
            netProfit: Math.round(netProfit),
            roiPercent: roi,
            costPerAcre: Math.round(totalCost / acreage)
        });
    } catch (e) {
        res.status(400).json({ success: false, error: "Invalid calculation parameters." });
    }
});

// 5. AI Chat Route (Groq with Cloud LLM & Smart Fallback)
app.post('/api/chat', apiLimiter, async (req, res) => {
    try {
        const { chatHistory, newText, imageBase64, language } = req.body;
        
        // Channel 1: Groq API (if configured in environment)
        if (groq) {
            try {
                const messages = [{ role: "system", content: SYSTEM_INSTRUCTION }];
                if (Array.isArray(chatHistory)) {
                    chatHistory.slice(-4).forEach(m => {
                        if (m.text) messages.push({ role: m.sender === 'user' ? 'user' : 'assistant', content: m.text });
                    });
                }
                
                const userPromptWithStrictLang = `[USER QUESTION]: ${newText || "Diagnose plant health."}
[STRICT INSTRUCTION]: Respond ONLY AND STRICTLY in the exact language, script, and dialect in which the [USER QUESTION] above is written! If Hindi Devanagari -> reply in Hindi Devanagari. If Hinglish -> reply in Hinglish. If English -> reply in English. If regional script -> reply in that exact script!`;

                messages.push({ role: "user", content: userPromptWithStrictLang });

                const candidateModels = ["qwen/qwen3.8-27b", "openai/gpt-oss-120b", "openai/gpt-oss-20b"];
                for (const candidateModel of candidateModels) {
                    try {
                        const completion = await groq.chat.completions.create({
                            model: candidateModel,
                            messages: messages,
                            temperature: 0.6,
                            max_tokens: 800
                        });

                        const reply = completion?.choices?.[0]?.message?.content;
                        if (reply && reply.trim().length > 20 && !reply.toLowerCase().includes("i'm sorry, but i can't help with that")) {
                            return res.json({ success: true, text: reply.trim() });
                        }
                    } catch (mErr) {
                        console.warn(`Groq candidate ${candidateModel} failed:`, mErr.message);
                    }
                }
            } catch (groqErr) {
                console.warn("Groq API call issue:", groqErr.message);
            }
        }

        // Channel 2: Free Cloud Generative AI Engine (Zero Key Needed)
        try {
            const aiRes = await fetch('https://text.pollinations.ai/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: [
                        { role: 'system', content: SYSTEM_INSTRUCTION },
                        ...(Array.isArray(chatHistory) ? chatHistory.slice(-4).map(m => ({
                            role: m.sender === 'user' ? 'user' : 'assistant',
                            content: m.text
                        })) : []),
                        { role: 'user', content: newText || "Diagnose plant health and provide advisory." }
                    ],
                    model: 'openai'
                }),
                signal: AbortSignal.timeout(12000)
            });

            if (aiRes.ok) {
                const text = await aiRes.text();
                if (text && text.trim().length > 25 && !text.includes('<!DOCTYPE')) {
                    return res.json({ success: true, text: text.trim() });
                }
            }
        } catch (pollinationsErr) {
            console.warn("Backend Cloud AI attempt failed, falling back to local expert system:", pollinationsErr.message);
        }

        // Channel 3: Fallback to local intelligent agricultural response engine
        const fallbackText = generateSmartAgriculturalResponse(newText, imageBase64, language);
        return res.json({ success: true, text: fallbackText });

    } catch (err) {
        console.error("Chat route error:", err);
        const fallbackText = generateSmartAgriculturalResponse(req.body?.newText, req.body?.imageBase64, req.body?.language);
        res.json({ success: true, text: fallbackText });
    }
});

// 6. AI Crop Yield Prediction Route
app.post('/api/predict-yield', (req, res) => {
    try {
        const { crop = 'wheat', soilType = 'alluvial', season = 'rabi', landSize = 2, irrigation = 'canal', fertilizerKg = 100, rainfall = 450 } = req.body;
        const acreage = parseFloat(landSize) || 1;

        // Crop base yield (quintals/acre) & standard MSP/mandi rates (₹/quintal)
        const CROP_BENCHMARKS = {
            wheat: { baseYield: 22, msp: 2425, costPerAcre: 13500, season: 'Rabi' },
            rice: { baseYield: 26, msp: 2300, costPerAcre: 16000, season: 'Kharif' },
            cotton: { baseYield: 14, msp: 7200, costPerAcre: 21000, season: 'Kharif' },
            mustard: { baseYield: 9.5, msp: 5750, costPerAcre: 11000, season: 'Rabi' },
            sugarcane: { baseYield: 380, msp: 340, costPerAcre: 35000, season: 'Annual' },
            maize: { baseYield: 24, msp: 2090, costPerAcre: 12500, season: 'Kharif' },
            soybean: { baseYield: 11.5, msp: 4650, costPerAcre: 12000, season: 'Kharif' },
            potato: { baseYield: 120, msp: 1450, costPerAcre: 38000, season: 'Rabi' },
            gram: { baseYield: 8.5, msp: 5440, costPerAcre: 10500, season: 'Rabi' }
        };

        const cropKey = String(crop).toLowerCase();
        const profile = CROP_BENCHMARKS[cropKey] || CROP_BENCHMARKS['wheat'];

        // Soil multipliers
        const SOIL_WEIGHTS = {
            alluvial: 1.12,
            black: (cropKey === 'cotton' || cropKey === 'soybean') ? 1.18 : 1.06,
            red: 0.96,
            clayey: 1.05,
            sandy_loam: 0.94
        };
        const soilMult = SOIL_WEIGHTS[String(soilType).toLowerCase()] || 1.0;

        // Irrigation multipliers
        const IRRIGATION_WEIGHTS = {
            drip: 1.22,
            sprinkler: 1.14,
            canal: 1.06,
            borewell: 1.03,
            rainfed: 0.82
        };
        const irrMult = IRRIGATION_WEIGHTS[String(irrigation).toLowerCase()] || 1.0;

        // Fertilizer efficiency factor
        const fertDose = parseFloat(fertilizerKg) || 100;
        let fertMult = 1.0;
        if (fertDose < 60) fertMult = 0.88;
        else if (fertDose >= 60 && fertDose <= 140) fertMult = 1.08;
        else fertMult = 1.02; // Over-fertilization diminishing returns

        // Final Yield Calculation
        const predictedYieldPerAcre = +(profile.baseYield * soilMult * irrMult * fertMult).toFixed(1);
        const totalYieldQuintals = +(predictedYieldPerAcre * acreage).toFixed(1);

        // Financials
        const grossIncome = Math.round(totalYieldQuintals * profile.msp);
        const totalProductionCost = Math.round(profile.costPerAcre * acreage);
        const netProfit = grossIncome - totalProductionCost;
        const profitMargin = grossIncome > 0 ? +((netProfit / grossIncome) * 100).toFixed(1) : 0;

        // Risk Factor Evaluation
        let riskScore = "Low Risk";
        let riskColor = "emerald";
        if (irrigation === 'rainfed' || fertDose < 50) {
            riskScore = "High Risk (Water/Nutrient Stress)";
            riskColor = "red";
        } else if (irrigation === 'canal' || fertDose > 160) {
            riskScore = "Moderate Risk (Field Drainage & Leaching)";
            riskColor = "amber";
        }

        // Actionable AI Recommendations
        const recommendations = [
            `Apply basal DAP @ 50 kg/acre + MOP @ 25 kg/acre during sowing for strong root architecture.`,
            irrigation === 'drip' ? `Drip fertigation will save ~40% water and elevate output by up to 22%.` : `Schedule first irrigation strictly during Crown Root Initiation (CRI) at 21-25 days.`,
            `Spray Zinc Sulphate 33% @ 5kg/acre to unlock micronutrient absorption and prevent chlorosis.`,
            `Target Mandi selling window within 3 weeks post-harvest to capture premium pricing.`
        ];

        res.json({
            success: true,
            crop: cropKey,
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
        });
    } catch (e) {
        res.status(400).json({ success: false, error: "Yield prediction calculation failed: " + e.message });
    }
});

// 7. Soil Health & NPK Recommendation Route
app.post('/api/soil-analysis', (req, res) => {
    try {
        const { nitrogen = 180, phosphorus = 18, potassium = 140, ph = 7.2, organicCarbon = 0.55, crop = 'wheat' } = req.body;
        
        const N = parseFloat(nitrogen) || 180;
        const P = parseFloat(phosphorus) || 18;
        const K = parseFloat(potassium) || 140;
        const pH = parseFloat(ph) || 7.2;
        const OC = parseFloat(organicCarbon) || 0.55;

        // Ratings (Indian Soil Standard kg/ha: N <280 Low, 280-560 Med; P <10 Low, 10-25 Med; K <120 Low, 120-280 Med)
        const statusN = N < 250 ? 'Low (Deficient)' : N > 500 ? 'High (Excess)' : 'Medium (Optimal)';
        const statusP = P < 12 ? 'Low (Deficient)' : P > 25 ? 'High (Excess)' : 'Medium (Optimal)';
        const statusK = K < 130 ? 'Low (Deficient)' : K > 300 ? 'High (Excess)' : 'Medium (Optimal)';

        let phStatus = 'Optimal (Neutral)';
        if (pH < 6.5) phStatus = 'Acidic (Apply Agricultural Lime)';
        else if (pH > 7.8) phStatus = 'Alkaline (Apply Gypsum)';

        // Calculate Soil Health Score (0 - 100)
        let healthScore = 75;
        if (statusN === 'Medium (Optimal)') healthScore += 8;
        if (statusP === 'Medium (Optimal)') healthScore += 8;
        if (statusK === 'Medium (Optimal)') healthScore += 8;
        if (pH >= 6.5 && pH <= 7.5) healthScore += 6;
        if (OC >= 0.6) healthScore += 5;
        if (statusN.startsWith('Low')) healthScore -= 10;
        if (statusP.startsWith('Low')) healthScore -= 10;
        healthScore = Math.max(30, Math.min(98, healthScore));

        // Prescriptions per Acre (in 50kg Bags)
        const ureaBags = statusN.startsWith('Low') ? 2.5 : statusN.startsWith('High') ? 1.0 : 1.8;
        const dapBags = statusP.startsWith('Low') ? 1.5 : statusP.startsWith('High') ? 0.5 : 1.0;
        const mopBags = statusK.startsWith('Low') ? 0.8 : statusK.startsWith('High') ? 0.2 : 0.5;

        res.json({
            success: true,
            healthScore,
            statusN,
            statusP,
            statusK,
            phStatus,
            prescription: {
                ureaBags: ureaBags.toFixed(1),
                dapBags: dapBags.toFixed(1),
                mopBags: mopBags.toFixed(1),
                micronutrients: 'Zinc Sulphate @ 5 kg/acre + Ferrous Sulphate @ 2 kg/acre',
                organicRecommendation: OC < 0.6 ? 'Apply 2-3 tonnes/acre Well-decomposed Cow Dung Compost or Vermicompost before primary tillage.' : 'Maintain organic mulch to retain soil microbes.'
            }
        });
    } catch (e) {
        res.status(400).json({ success: false, error: "Soil analysis failed." });
    }
});

// 8. Smart Day-by-Day Crop Calendar Route
app.post('/api/crop-calendar', (req, res) => {
    try {
        const { crop = 'wheat', sowingDate } = req.body;
        const start = sowingDate ? new Date(sowingDate) : new Date();

        const CROP_STAGES = {
            wheat: [
                { stage: 'Germination & Basal Nutrients', startDay: 0, endDay: 15, task: 'Seed treatment with Trichoderma (5g/kg seed). Apply basal DAP + MOP.' },
                { stage: 'Crown Root Initiation (CRI)', startDay: 16, endDay: 25, task: 'CRITICAL: First irrigation within 21-25 days. Apply 1st Urea top dressing (45 kg/acre).' },
                { stage: 'Tillering & Vegetative Phase', startDay: 26, endDay: 45, task: 'Weed management (Sulfosulfuron spray if Phalaris minor present). Second irrigation.' },
                { stage: 'Jointing & Booting Stage', startDay: 46, endDay: 65, task: '2nd Urea dose (45 kg/acre) + Zinc Sulphate spray. Monitor for yellow rust/aphids.' },
                { stage: 'Flowering & Earhead Emergence', startDay: 66, endDay: 85, task: 'Light irrigation. Prevent water stagnation. Spray 1% NPK (19:19:19) for grain size.' },
                { stage: 'Milk & Dough Stage', startDay: 86, endDay: 110, task: 'Ensure soil moisture during grain filling. Stop irrigation 10 days before harvest.' },
                { stage: 'Maturity & Harvesting', startDay: 111, endDay: 130, task: 'Harvest when grain moisture is below 14% to prevent storage fungal rot.' }
            ],
            rice: [
                { stage: 'Nursery & Seedling Raising', startDay: 0, endDay: 25, task: 'Seed soaking in Carbendazim. Maintain thin water layer in nursery bed.' },
                { stage: 'Field Preparation & Transplanting', startDay: 26, endDay: 35, task: 'Puddling field. Transplant 2-3 seedlings per hill at 20x15 cm spacing. Basal DAP + MOP.' },
                { stage: 'Tillering & Vegetative Growth', startDay: 36, endDay: 60, task: '1st Top Dressing of Urea (45kg/acre). Maintain 2-3cm standing water.' },
                { stage: 'Panicle Initiation & Booting', startDay: 61, endDay: 85, task: '2nd Top Dressing of Urea. Spray Cartap Hydrochloride if stem borer noticed.' },
                { stage: 'Flowering & Grain Filling', startDay: 86, endDay: 115, task: 'Maintain saturated soil. Spray Tricyclazole 75% WP if leaf blast spots appear.' },
                { stage: 'Maturity & Harvesting', startDay: 116, endDay: 140, task: 'Drain water 10 days before harvest. Harvest when 85% of panicles turn golden brown.' }
            ]
        };

        const cropKey = String(crop).toLowerCase();
        const stagesTemplate = CROP_STAGES[cropKey] || CROP_STAGES['wheat'];

        // Add calculated calendar dates based on sowing date
        const timeline = stagesTemplate.map(st => {
            const stageStartDate = new Date(start);
            stageStartDate.setDate(stageStartDate.getDate() + st.startDay);
            const stageEndDate = new Date(start);
            stageEndDate.setDate(stageEndDate.getDate() + st.endDay);

            return {
                ...st,
                startDate: stageStartDate.toISOString().split('T')[0],
                endDate: stageEndDate.toISOString().split('T')[0]
            };
        });

        // Determine current stage
        const now = new Date();
        const diffDays = Math.max(0, Math.floor((now - start) / (1000 * 60 * 60 * 24)));
        const currentStage = timeline.find(t => diffDays >= t.startDay && diffDays <= t.endDay) || 
            (diffDays > 130 ? { stage: 'Harvesting Completed', task: 'Storage and marketing.' } : timeline[0]);

        res.json({
            success: true,
            crop: cropKey,
            sowingDate: start.toISOString().split('T')[0],
            daysSinceSowing: diffDays,
            currentStage: currentStage.stage,
            currentTask: currentStage.task,
            timeline
        });
    } catch (e) {
        res.status(400).json({ success: false, error: "Calendar generation failed." });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Krishi Dost AI Backend running on port ${PORT}`));