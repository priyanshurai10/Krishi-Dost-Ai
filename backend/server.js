import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import NodeCache from 'node-cache';
import crypto from 'crypto';
import OpenAI from 'openai';

dotenv.config();

const app = express();

// SECURITY & MIDDLEWARES
app.use(helmet());
app.use(cors({ origin: '*', methods: ['GET', 'POST', 'OPTIONS'], allowedHeaders: ['Content-Type', 'Authorization'] }));
app.use(express.json({ limit: '10mb' })); 

const apiLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });

// AI CONFIG
const groq = new OpenAI({ apiKey: process.env.GROQ_API_KEY, baseURL: "https://api.groq.com/openai/v1" });
const queryCache = new NodeCache({ stdTTL: 86400 });

const SYSTEM_INSTRUCTION = `You are Krishi Dost, an elite agricultural AI assistant for Indian farmers. Reply strictly in the language of the user. Only farming, crops, fertilizers, pesticides, weather, loans, and govt schemes.`;

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
        location: `Pincode: ${pincode}`,
        temp: "32°C",
        condition: "Clear",
        alert: "Alert: Heavy rainfall expected in your district tomorrow. Avoid spraying pesticides."
    });
});

// 3. Mandi Route
app.get('/api/mandi', (req, res) => {
    res.json({ 
        success: true, 
        rates: [
            { crop: "Wheat (गेंहू)", price: "₹2,400 /q", trend: "Up" },
            { crop: "Rice (धान)", price: "₹2,200 /q", trend: "Stable" },
            { crop: "Mustard (सरसों)", price: "₹5,600 /q", trend: "Up" },
            { crop: "Potato (आलू)", price: "₹1,300 /q", trend: "Down" }
        ]
    });
});

// 4. Calculator Route
app.post('/api/calculate', (req, res) => {
    const { type, amount, rate, duration, cropType, landSize } = req.body;
    if (type === 'loan') {
        const p = parseFloat(amount), r = parseFloat(rate)/12/100, n = parseFloat(duration)*12;
        const emi = (p*r*Math.pow(1+r, n))/(Math.pow(1+r, n)-1);
        return res.json({ success: true, emi: Math.round(emi), totalPayment: Math.round(emi*n) });
    }
    res.json({ success: true, estimatedReturn: 35000 * parseFloat(landSize) });
});

// 5. Chat Route (The Brain)
app.post('/api/chat', apiLimiter, async (req, res) => {
    try {
        const { chatHistory, newText, imageBase64, language } = req.body;
        const messages = [{ role: "system", content: SYSTEM_INSTRUCTION }];
        
        // Push history and current message...
        messages.push({ role: "user", content: newText || "Analyze this." });

        const completion = await groq.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: messages,
        });

        res.json({ success: true, text: completion.choices[0].message.content });
    } catch (err) {
        res.status(500).json({ success: false, error: "AI service busy." });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));