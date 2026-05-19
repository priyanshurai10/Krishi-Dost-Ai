import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import NodeCache from 'node-cache';
import crypto from 'crypto';
import OpenAI from 'openai'; // Groq uses the OpenAI SDK format

dotenv.config();

const app = express();

// SECURITY: Helmet adds HTTP security headers
app.use(helmet());
app.use(cors());

// OPTIMIZATION: Strict 10MB limit prevents backend memory spikes from huge uploads
app.use(express.json({ limit: '10mb' })); 

// SECURITY: Rate limiting protects against DDoS and API quota exhaustion
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 50, 
    message: { success: false, error: "Too many requests. Please wait a few minutes before trying again." },
    standardHeaders: true,
    legacyHeaders: false,
});

// DEBUGGING: Global Request Logger
app.use((req, res, next) => {
    console.log(`📡 [${new Date().toISOString()}] ${req.method} Request to ${req.url}`);
    next();
});

// FIX: Explicit CORS Configuration
app.use(cors({
    origin: '*', // Allow all origins for local development
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use('/api/chat', apiLimiter);

// OPTIMIZATION: Cache text-based queries for 24 hours to drastically reduce API quota usage
const queryCache = new NodeCache({ stdTTL: 86400, checkperiod: 3600 });

// Initialize Groq SDK (Using OpenAI Compatible Endpoint)
if (!process.env.GROQ_API_KEY) {
    console.error("❌ CRITICAL ERROR: GROQ_API_KEY is missing in .env file.");
    process.exit(1);
}

const groq = new OpenAI({
    apiKey: process.env.GROQ_API_KEY,
    baseURL: "https://api.groq.com/openai/v1",
});

// AI UPGRADE: Safer, hyper-specific farming prompt for Groq
const SYSTEM_INSTRUCTION = `You are Krishi Dost, an elite and highly practical agricultural AI assistant for Indian farmers.
STRICT RULES:
1. NATIVE LANGUAGE MATCHING: Automatically detect the language of the user's question. You MUST reply STRICTLY in that exact native language. Do NOT mix languages.
2. DOMAIN STRICTNESS: Only answer questions related to farming, crops, fertilizers, pesticides, soil, weather impacts, loans, mandi prices, and government schemes. Politely decline unrelated questions.
3. SAFER ADVICE: Provide highly practical advice, but DO NOT provide dangerous absolute chemical dosages. Provide safe dosage RANGES and explicitly advise farmers to verify with their local Krishi Vigyan Kendra (KVK) or read the product label.
4. STRUCTURE: Use bullet points, bold text for chemical names, and short paragraphs for readability. Make it easy for a rural farmer to understand. No robotic or fluffy filler text.
5. VISION/IMAGES: If an image is provided, analyze the crop health, detect diseases/pests, state the confidence level, and provide immediate practical treatments (chemical + organic alternatives).`;

// SECURITY: Strip dangerous HTML tags and limit excessive whitespace to prevent injection
const sanitizeText = (text) => {
    if (!text) return "";
    return text.replace(/<[^>]*>?/gm, '').replace(/\s\s+/g, ' ').trim();
};

// SECURITY: Strictly validate image Base64 metadata and MIME types
const validateAndParseImage = (base64Str) => {
    if (!base64Str) return null;
    const matches = base64Str.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) throw new Error("INVALID_IMAGE_FORMAT");
    
    const mimeType = matches[1];
    const data = matches[2];
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']; // Groq vision supported formats
    
    if (!allowedTypes.includes(mimeType)) throw new Error("UNSUPPORTED_MIME_TYPE");
    return { mimeType, data, fullDataUri: base64Str };
};

// MONITORING: Simple health check route
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString(), ai_provider: 'Groq' });
});

// ==========================================
// NEW MODULES: WEATHER & MANDI ROUTES
// ==========================================

// 1. Weather Module Route
app.get('/api/weather', async (req, res) => {
    try {
        const { pincode } = req.query;
        if (!pincode || pincode.length !== 6) {
            return res.status(400).json({ success: false, error: "Please enter a valid 6-digit Pincode." });
        }

        // Mock data for immediate testing (Aap baad mein OpenWeather API se connect kar sakte hain)
        const mockWeatherData = {
            success: true,
            location: `Pincode: ${pincode}`,
            temperature: "32°C",
            condition: "Heavy rainfall expected tomorrow",
            humidity: "78%",
            windSpeed: "14 km/h",
            alert: "Alert: Heavy rainfall expected in your district tomorrow. Avoid spraying pesticides."
        };
        
        res.json(mockWeatherData);
    } catch (error) {
        console.error("Weather Route Error:", error.message);
        res.status(500).json({ success: false, error: "Failed to fetch weather data." });
    }
});

// 2. Mandi Rates Module Route
app.get('/api/mandi', async (req, res) => {
    try {
        // Mock Mandi Prices Data for Farmers
        const mockMandiData = {
            success: true,
            lastUpdated: new Date().toLocaleDateString('en-IN'),
            rates: [
                { crop: "Wheat (गेंहू)", priceRange: "₹2,200 - ₹2,450 / Quintal", trend: "Up" },
                { crop: "Rice (धान)", priceRange: "₹2,100 - ₹2,300 / Quintal", trend: "Stable" },
                { crop: "Mustard (सरसों)", priceRange: "₹5,400 - ₹5,800 / Quintal", trend: "Up" },
                { crop: "Potato (आलू)", priceRange: "₹1,200 - ₹1,500 / Quintal", trend: "Down" }
            ]
        };
        res.json(mockMandiData);
    } catch (error) {
        console.error("Mandi Route Error:", error.message);
        res.status(500).json({ success: false, error: "Failed to fetch Mandi rates." });
    }
});

// 3. Profit Estimator / Loan Calculator Route
app.post('/api/calculate', (req, res) => {
    try {
        const { type, amount, rate, duration, cropType, landSize } = req.body;
        
        if (type === 'loan') {
            const p = parseFloat(amount);
            const r = parseFloat(rate) / 12 / 100;
            const n = parseFloat(duration) * 12;
            
            const emi = (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
            return res.json({ success: true, emi: Math.round(emi), totalPayment: Math.round(emi * n) });
        } 
        
        if (type === 'profit') {
            const baseProfitPerAcres = cropType === 'Wheat' ? 25000 : 35000;
            const estimatedReturn = baseProfitPerAcres * parseFloat(landSize);
            return res.json({ success: true, estimatedReturn: estimatedReturn });
        }

        res.status(400).json({ success: false, error: "Invalid calculation type." });
    } catch (error) {
        res.status(500).json({ success: false, error: "Calculation failed." });
    }
});

app.post('/api/chat', async (req, res) => {
    try {
        const { chatHistory = [], newText, imageBase64, language } = req.body;

        // VALIDATION: Prevent empty requests
        const cleanText = sanitizeText(newText);
        if (!cleanText && !imageBase64) {
            console.warn("⚠️ [400] Validation Failed: Empty payload.");
            return res.status(400).json({ success: false, error: "Please ask a question or upload an image." });
        }

        // OPTIMIZATION: Check Cache for text-only queries (Save Groq Quota)
        if (!imageBase64 && cleanText) {
            const cacheHash = crypto.createHash('md5').update(`${language}_${cleanText.toLowerCase()}`).digest('hex');
            if (queryCache.has(cacheHash)) {
                console.log(`⚡ [Cache Hit] Serving response from memory.`);
                return res.json({ success: true, text: queryCache.get(cacheHash), cached: true });
            }
        }

        console.log(`📩 [Groq Request] Text Length: ${cleanText.length} | Image: ${!!imageBase64} | Lang: ${language}`);

        // BUILD OPENAI-COMPATIBLE MESSAGE ARRAY
        const messages = [
            { role: "system", content: SYSTEM_INSTRUCTION }
        ];

        // OPTIMIZATION: Limit to 6 messages, truncate long historic messages to save tokens
        const recentHistory = chatHistory.slice(-6).map(msg => {
            let msgText = sanitizeText(msg.text || "Uploaded an image for analysis.");
            if (msgText.length > 500) msgText = msgText.substring(0, 500) + "... [truncated]"; // Token saving
            
            return {
                role: msg.sender === 'user' ? 'user' : 'assistant',
                content: msgText
            };
        });
        messages.push(...recentHistory);

        // Current prompt formulation
        let promptText = cleanText || "Analyze this uploaded image and tell me the disease, treatment, and fertilizer recommendations.";
        if (cleanText) promptText += `\n\n(Context: Reply natively in the exact language of the prompt above. If unsure, fallback to ${language}.)`;

        // Handle Vision / Text Dynamic Payload
        let parsedImage = null;
        if (imageBase64) {
            try {
                parsedImage = validateAndParseImage(imageBase64);
                messages.push({
                    role: "user",
                    content: [
                        { type: "text", text: promptText },
                        { type: "image_url", image_url: { url: parsedImage.fullDataUri } }
                    ]
                });
            } catch (imgErr) {
                console.error("❌ [Image Validation Error]:", imgErr.message);
                return res.status(400).json({ success: false, error: "Invalid image format. Please use JPG or PNG." });
            }
        } else {
            messages.push({ role: "user", content: promptText });
        }

        // GROQ MODEL SELECTION
        // Text-only: Fast, versatile 70b model.
        // Image-based: Groq's dedicated Llama 3.2 Vision model.
        const MODELS_TO_TRY = imageBase64 
            ? ['llama-3.2-11b-vision-preview', 'llama-3.2-90b-vision-preview'] 
            : ['llama-3.3-70b-versatile', 'llama3-8b-8192'];

        let responseText = null;
        let activeModelUsed = '';

        for (const modelName of MODELS_TO_TRY) {
            try {
                // TIMEOUT: 45 Second limit
                const apiPromise = groq.chat.completions.create({
                    model: modelName,
                    messages: messages,
                    temperature: 0.3, // Low temp for factual farming logic
                    max_tokens: 1024,
                });
                
                const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error("API_TIMEOUT")), 45000));
                
                const result = await Promise.race([apiPromise, timeoutPromise]);
                
                responseText = result.choices[0].message.content;
                activeModelUsed = modelName;
                console.log(`✅ [Model Verification] Connected to Groq using: ${modelName}`);
                break; // Success! Break fallback loop.
            } catch (fallbackErr) {
                console.warn(`⚠️ [Model Check] ${modelName} failed: ${fallbackErr.message.substring(0, 60)}...`);
                // If model not found or rate limited, try the next model
                if (fallbackErr.status === 404 || fallbackErr.status === 429) continue;
                throw fallbackErr; // Real error
            }
        }

        if (!responseText) {
             throw new Error("ALL_MODELS_FAILED");
        }

        // CACHING: Store successful text-only responses for future identical questions
        if (!imageBase64 && cleanText) {
            const cacheHash = crypto.createHash('md5').update(`${language}_${cleanText.toLowerCase()}`).digest('hex');
            queryCache.set(cacheHash, responseText);
        }

        console.log(`✅ [API Success] Response length: ${responseText.length} | Model: ${activeModelUsed}`);
        res.json({ success: true, text: responseText });

    } catch (error) {
        console.error("❌ [Groq System Error]:", error.message);
        
        let errorMessage = "Failed to connect to Krishi Dost AI. Please try again later.";
        let statusCode = 500;

        if (error.message === "API_TIMEOUT" || error.message.includes("fetch failed")) {
            errorMessage = "The AI is taking too long to respond due to network congestion. Please try again.";
            statusCode = 504; 
        } else if (error.message.includes("429") || error.message.includes("Rate limit")) {
            errorMessage = "Our AI servers are currently busy helping other farmers. Please try again in 1 minute.";
            statusCode = 429; 
        } else if (error.message.includes("ALL_MODELS_FAILED")) {
            errorMessage = "No compatible Groq AI models are currently available. Please try again.";
            statusCode = 503; 
        }

        res.status(statusCode).json({ success: false, error: errorMessage });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
    console.log(`🔒 Groq Production Architecture Active (Llama 3.3/3.2 Vision).`);
});