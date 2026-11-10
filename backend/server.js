import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import NodeCache from 'node-cache';
import OpenAI from 'openai';

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
  const raw = String(text || '').trim();
  const lower = raw.toLowerCase();
  
  const isDevanagari = /[\u0900-\u097F]/.test(raw);
  const hinglishWords = ['kya', 'kaise', 'kare', 'karein', 'konsa', 'kon', 'dale', 'dalen', 'hai', 'hain', 'me', 'mein', 'khet', 'fasal', 'bimari', 'keeda', 'kida', 'patta', 'patti', 'peela', 'mud', 'pani', 'khad', 'dawa', 'dawai', 'spray', 'gehu', 'dhan', 'aloo', 'tamatar', 'sarso', 'mirch', 'pyaz'];
  const isHinglish = !isDevanagari && hinglishWords.some(w => new RegExp(`\\b${w}\\b`, 'i').test(lower));
  const langMode = isDevanagari ? 'hi' : isHinglish ? 'hinglish' : (language === 'hi' ? 'hi' : 'en');

  // Crop detection
  let crop = 'general';
  if (/tomato|tamatar|टमाटर/.test(lower)) crop = 'tomato';
  else if (/potato|aloo|aalu|आलू/.test(lower)) crop = 'potato';
  else if (/wheat|gehu|gehun|गेंहू|गेहूं/.test(lower)) crop = 'wheat';
  else if (/rice|paddy|dhan|धान|चावल/.test(lower)) crop = 'rice';
  else if (/cotton|kapas|कपास|रुई/.test(lower)) crop = 'cotton';
  else if (/mustard|sarso|sarson|rai|सरसों|राई/.test(lower)) crop = 'mustard';
  else if (/sugarcane|ganna|गन्ना/.test(lower)) crop = 'sugarcane';
  else if (/maize|corn|makka|मक्का/.test(lower)) crop = 'maize';
  else if (/chilli|chili|mirch|मिर्च/.test(lower)) crop = 'chilli';
  else if (/onion|pyaz|pyaaz|प्याज/.test(lower)) crop = 'onion';
  else if (/gram|chana|चना|pulses|dal|दाल|arhar|अरहर/.test(lower)) crop = 'gram';

  // Symptom detection
  const hasLeafCurl = /curl|mud|sikud|सिकुड़|मुड़|पर्ण कुंचन/.test(lower);
  const hasYellowing = /yellow|peela|peeli|पीला|पीली|chlorosis/.test(lower);
  const hasBlight = /blight|spot|dhabba|dhabbey|धब्बा|झुलसा|rot/.test(lower);
  const hasRust = /rust|ratua|रतुआ/.test(lower);
  const hasBlast = /blast|jhoka|झोंका/.test(lower);
  const hasBorer = /borer|stem borer|sundi|sundy|caterpillar|larva|इल्ली|सूंडी|तना छेदक/.test(lower);
  const hasSuckingPest = /whitefly|aphid|thrips|jassid|mahu|chepa|makkhi|मक्खी|माहू|चेपा|थ्रिप्स/.test(lower);
  const hasPestGeneral = imageBase64 || hasBorer || hasSuckingPest || /pest|insect|keeda|kida|कीड़ा|कीटनाशक/.test(lower);
  const hasFertilizer = /fertilizer|urea|dap|npk|potash|mop|zinc|khad|खाद|उर्वरक|पोषण|dose/.test(lower);
  const hasLoan = /loan|kcc|credit|kisan credit|interest|byaj|ऋण|लोन|ब्याज/.test(lower);
  const hasScheme = /scheme|yojana|subsidy|pm kisan|pmfby|योजना|सब्सिडी|सम्मान निधि/.test(lower);

  // 1. Tomato Leaf Curl
  if (crop === 'tomato' && (hasLeafCurl || hasSuckingPest)) {
    if (langMode === 'hi') {
      return `🍅 **टमाटर पर्ण कुंचन रोग (Tomato Leaf Curl Virus) उपचार सलाह**:

**कारण**: यह रोग सफेद मक्खी (Whitefly) द्वारा फैलाया जाने वाला वायरल रोग है।

**सटीक रासायनिक एवं जैविक नियंत्रण**:
1. **कीटनाशक छिड़काव**: सफेद मक्खी की रोकथाम हेतु **इमिडाक्लोप्रिड 17.8% SL** @ 0.5 मि.ली./लीटर पानी अथवा **एसिटामिप्रिड 20% SP** @ 0.5 ग्राम/लीटर पानी का छिड़काव करें।
2. **जैविक नियंत्रण**: खेत में प्रति एकड़ 15-20 **पीले चिपचिपे ट्रैप (Yellow Sticky Traps)** लगाएं और नीम का तेल (10,000 PPM) @ 5 मि.ली./लीटर पानी का छिड़काव करें।
3. **सावधानी**: जिन पौधों की पत्तियां बहुत अधिक मुड़ चुकी हैं, उन्हें उखाड़कर नष्ट कर दें ताकि वायरस अन्य पौधों में न फैले।`;
    } else if (langMode === 'hinglish') {
      return `🍅 **Tomato Leaf Curl Virus Treatment Advisory**:

**Reason**: Ye bimari Safed Makkhi (Whitefly) ke kaaran failti hai.

**Immediate Steps**:
1. **Spray**: Whitefly control ke liye **Imidacloprid 17.8% SL** @ 0.5 ml/litre water ya **Acetamiprid 20% SP** @ 0.5 g/litre water spray karein.
2. **Organic**: 15-20 Yellow Sticky Traps lagayein aur Neem Oil (10,000 PPM) 5 ml/litre spray karein.
3. **Severe plants**: Jyada kharab podhon ko ukhad kar khet se bahar mitti me daba dein.`;
    } else {
      return `🍅 **Tomato Leaf Curl Virus Diagnostic & Treatment**:

**Causal Vector**: Whitefly (*Bemisia tabaci*).
**Chemical Spray**: Apply **Imidacloprid 17.8% SL** @ 0.5 ml/litre water or **Acetamiprid 20% SP** @ 0.5 g/litre water.
**Organic/IPM**: Install 15-20 yellow sticky traps/acre and apply Neem oil (10,000 PPM) @ 5 ml/litre water.`;
    }
  }

  // 2. Potato Blight
  if (crop === 'potato' && (hasBlight || hasPestGeneral)) {
    if (langMode === 'hi') {
      return `🥔 **आलू झुलसा रोग (Potato Late & Early Blight) उपचार**:
1. **शुरुआती अवस्था**: **मैनकोज़ेब 75% WP** @ 2.5 ग्राम/लीटर पानी का छिड़काव करें।
2. **गंभीर अवस्था**: **साइमोक्सानिल 8% + मैनकोज़ेब 64% WP** (Curzate) @ 3 ग्राम/लीटर या **मेटालेक्सिल 8% + मैनकोज़ेब 64%** (Ridomil Gold) @ 2.5 ग्राम/लीटर का छिड़काव करें।`;
    } else {
      return `🥔 **Potato Blight Treatment Advisory**:
Spray **Mancozeb 75% WP** @ 2.5 g/litre water for prevention, or **Metalaxyl 8% + Mancozeb 64% WP** (Ridomil Gold) @ 2.5 g/litre water for active infection. Avoid waterlogging in furrows.`;
    }
  }

  // 3. Wheat Yellow Rust / Yellowing
  if (crop === 'wheat' && (hasRust || hasYellowing || hasBlight)) {
    if (langMode === 'hi') {
      return `🌾 **गेहूं का पीला रतुआ (Yellow Rust) व पीलापन प्रबंधन**:
1. **पीला रतुआ पर**: **प्रोपीकोनाज़ोल 25% EC (Tilt)** @ 1 मि.ली./लीटर पानी (200 मि.ली./एकड़ 200 लीटर पानी में) का तुरंत छिड़काव करें।
2. **पोषक तत्व कमी से पीलापन पर**: 1% यूरिया + 0.5% जिंक सल्फेट (33%) का पर्णीय छिड़काव करें।`;
    } else {
      return `🌾 **Wheat Yellow Rust & Chlorosis Protocol**:
Spray **Propiconazole 25% EC** @ 1 ml/litre water (200 ml/acre) immediately if yellow powdery stripes appear on leaves. For nutrient chlorosis, spray 1% Urea + 0.5% Zinc Sulphate 33%.`;
    }
  }

  // 4. Rice Stem Borer / Blast
  if (crop === 'rice' && (hasBorer || hasBlast || hasPestGeneral)) {
    if (langMode === 'hi') {
      return `🌾 **धान का तना छेदक (Stem Borer) एवं झोंका रोग**:
1. **तना छेदक**: **क्लोरांट्रानिलीप्रोल 18.5% SC (Coragen)** @ 0.4 मि.ली./लीटर पानी या **कार्टाप हाइड्रोक्लोराइड 4G दानेदार** @ 7.5 किग्रा/एकड़ खेत में डालें।
2. **ब्लास्ट (झोंका)**: **ट्राइसाइक्लाज़ोल 75% WP** @ 0.6 ग्राम/लीटर पानी का छिड़काव करें।`;
    } else {
      return `🌾 **Rice Stem Borer & Blast Management**:
Spray **Chlorantraniliprole 18.5% SC** @ 0.4 ml/litre water or broadcast **Cartap Hydrochloride 4G** @ 7.5 kg/acre. For blast lesions, spray **Tricyclazole 75% WP** @ 0.6 g/litre water.`;
    }
  }

  // 5. Crop-Specific Fertilizer
  if (hasFertilizer) {
    if (crop === 'wheat') {
      return `🌾 **गेहूं उर्वरक प्रबंधन (प्रति एकड़)**:
• बुआई के समय: DAP @ 50 किग्रा + MOP (पोटाश) @ 25 किग्रा + यूरिया @ 20 किग्रा।
• पहली सिंचाई (CRI 21-25 दिन): यूरिया @ 45 किग्रा।
• दूसरी सिंचाई (40-45 दिन): यूरिया @ 45 किग्रा + जिंक सल्फेट 33% @ 5 किग्रा।`;
    }
    if (crop === 'rice') {
      return `🌾 **धान उर्वरक प्रबंधन (प्रति एकड़)**:
• रोपाई के समय: DAP @ 50 किग्रा + MOP @ 30 किग्रा + जिंक सल्फेट @ 5 किग्रा।
• 20-25 दिन पर (कल्ले फूटते समय): यूरिया @ 45 किग्रा।
• 45-50 दिन पर (बालियां बनते समय): यूरिया @ 35 किग्रा।`;
    }
    return `🌱 **संतुलित उर्वरक खुराक (प्रति एकड़)**:
बुआई के समय DAP @ 50 किग्रा + MOP @ 25 किग्रा आधार खुराक के रूप में दें। पहली सिंचाई पर यूरिया @ 45 किग्रा का टॉप ड्रेसिंग करें तथा जिंक की कमी हेतु 5 किग्रा जिंक सल्फेट 33% का प्रयोग करें।`;
  }

  // 6. Loan / KCC
  if (hasLoan) {
    return `💳 **किसान क्रेडिट कार्ड (KCC) 4% ऋण जानकारी**:
• **ब्याज दर**: केवल **4% वार्षिक** (समय पर भुगतान करने पर 3% की सरकारी ब्याज छूट के साथ)।
• **ऋण सीमा**: ₹3.00 लाख तक (₹1.60 लाख तक बिना किसी गिरवी के)।
• **आवेदन**: निकटतम बैंक शाखा (SBI, PNB, BoB) या PM-Kisan पोर्टल से आवेदन करें।`;
  }

  // 7. Schemes
  if (hasScheme) {
    return `🏛️ **सरकारी कृषि योजनाएं**:
1. **PM-किसान सम्मान निधि**: ₹6,000/वर्ष (₹2,000 की 3 किस्तों में DBT)।
2. **PM फसल बीमा योजना (PMFBY)**: खरीफ 2%, रबी 1.5% प्रीमियम पर सुरक्षा।
3. **PM-KUSUM सोलर पंप**: सोलर कृषि पंप पर 60% तक की भारी सरकारी सब्सिडी।`;
  }

  // General Pest Fallback
  if (hasPestGeneral) {
    return `🌱 **कृषि दोस्त AI फसल कीट व फंगस नियंत्रण**:
• **फफूंद व पत्तियों पर धब्बे**: **मैनकोज़ेब 75% WP** @ 2.5 ग्राम/लीटर या **एज़ोक्सीस्ट्रोबिन + डिफेनोकोनाज़ोल** @ 1 मि.ली./लीटर पानी का छिड़काव करें।
• **कीट व इल्ली**: **क्लोरांट्रानिलीप्रोल 18.5% SC** @ 0.4 मि.ली./लीटर या **नीम का तेल (10,000 PPM)** @ 5 मि.ली./लीटर पानी में छिड़कें।`;
  }

  // Default
  return `🌾 **कृषि दोस्त AI कृषि सलाहकार**:
आपके प्रश्न "${raw}" के संबंध में:
संतुलित पोषण एवं समय पर सिंचाई ही उच्च पैदावार की कुंजी है। अपनी फसल का नाम (गेहूं, धान, टमाटर, आलू, आदि) और समस्या बताएं ताकि सटीक दवा व मात्रा बताई जा सके।`;
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

                const completion = await groq.chat.completions.create({
                    model: "llama-3.3-70b-versatile",
                    messages: messages,
                    temperature: 0.7,
                    max_tokens: 800
                });

                if (completion?.choices?.[0]?.message?.content) {
                    return res.json({ success: true, text: completion.choices[0].message.content });
                }
            } catch (groqErr) {
                console.warn("Groq API call issue, trying cloud generative AI:", groqErr.message);
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