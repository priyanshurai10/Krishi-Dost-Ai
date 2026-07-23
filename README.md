# 🌾 Krishi Dost AI (कृषि दोस्त AI)
> **Empowering 140+ Million Indian Farmers with Next-Gen Artificial Intelligence**

[![React](https://img.shields.io/badge/Frontend-React%20%2B%20Vite-emerald)](https://vitejs.dev/)
[![Node.js](https://img.shields.io/badge/Backend-Node.js%20%2B%20Express-blue)](https://nodejs.org/)
[![Groq AI](https://img.shields.io/badge/AI%20Model-Groq%20Llama%203.3--70B-orange)](https://groq.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

**Krishi Dost AI** is an all-in-one digital agriculture platform designed specifically for Indian farmers. It combines real-time meteorological advisories, live Mandi commodity prices, AI-driven crop leaf disease diagnosis, subsidized Kisan Credit Card (KCC) loan calculators, and government agricultural scheme portals into a clean, modern web application.

---

## 🌟 Key Application Features

### 1. 🏡 Personalized Home Dashboard
- **Farmer Profile Greeting**: Displays custom greeting (`Welcome, Priyanshu Rai! 🌾`) with simple, jargon-free explanations.
- **All-India Pincode Directory**: Built-in 6-digit Pincode & State/District selector covering all 36 Indian States and Union Territories.
- **Real-Time Weather Advisories**: Instant temperature, humidity, wind speed, and rain probability powered by Open-Meteo.
- **Live Mandi Commodity Prices**: Real-time mandi rates (Wheat, Rice, Mustard, Potato, Cotton, Soybean) with Minimum Support Price (MSP) benchmarks.
- **Emergency Farmer Helplines**: One-touch dialing to Kisan Call Center (`1800-180-1551`), PMFBY Insurance (`14447`), and Agri Emergency (`112`).

### 2. 🤖 AI Assistant & Crop Health Vision
- **Strict Language-Matched AI**: Built using Groq's `llama-3.3-70b-versatile` LLM. Responds strictly in the **exact language and script** in which the user asks (Hindi Devanagari, Hinglish, English, Bengali, Marathi, Punjabi, Tamil, Telugu, etc.).
- **Crop Disease Diagnosis**: Upload photos of infected crop leaves for instant AI diagnosis, severity rating, chemical treatment, and organic neem oil spray guidelines.
- **Dynamic Full-Screen Interface**: Scaled to 100% viewport height for a clean, distraction-free chat experience.

### 3. 💳 Farm Loan & Kisan Credit Card (KCC) Calculator
- **Subsidized EMI Calculation**: Calculates monthly payments, total interest, and total repayment under the effective **4% KCC interest rate** (with prompt 3% interest subvention).
- **Interactive Visual Breakdown**: Live progress bar comparing Principal vs. Payable Interest.
- **Profit & Yield Estimator**: Predicts net farm profit per acre based on seed, fertilizer, labor, and irrigation costs against expected harvest yield.

### 4. 📱 Collapsible Drawer Navigation Menu
- Clean, toggleable side drawer menu that **automatically closes** when any service link is clicked.
- Includes quick access to Government Schemes (PM-Kisan, PMFBY, SMAM, Soil Health Card) and Agri-Chemical Library (fertilizers, fungicides, bio-pesticides).

---

## 🛠️ Technology Stack

- **Frontend**: React 18, Vite 8, Tailwind CSS, Lucide Icons, Glassmorphism UI
- **Backend**: Node.js, Express.js, Helmet, Express-Rate-Limit, Node-Cache
- **AI Infrastructure**: Groq Cloud API (`llama-3.3-70b-versatile`)
- **Weather & Geo Engine**: Open-Meteo Weather Forecast API + All-India Pincode Dataset

---

## 🚀 Quick Setup & Installation Guide

### Prerequisites
- Node.js (v18+)
- npm or yarn

### 1. Clone the Repository
```bash
git clone https://github.com/priyanshurai10/Krishi-Dost-Ai.git
cd Krishi-Dost-Ai
```

### 2. Backend Setup
```bash
cd backend
npm install
```
Create a `.env` file inside `backend/`:
```env
PORT=5000
GROQ_API_KEY=your_groq_api_key_here
```
Start the backend server:
```bash
node server.js
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install
npm run dev
```
Open **`http://localhost:5173/`** in your web browser.

---

## 👨‍💻 Developer & Author Profile

Designed & Built by **Priyanshu Rai**:

- **GitHub Repository**: [github.com/priyanshurai10/Krishi-Dost-Ai](https://github.com/priyanshurai10/Krishi-Dost-Ai)
- **GitHub Profile**: [github.com/priyanshurai10](https://github.com/priyanshurai10)
- **LinkedIn Profile**: [linkedin.com/in/priyanshu-rai-2114722ab](https://linkedin.com/in/priyanshu-rai-2114722ab)
- **Personal Portfolio**: [priyanshurai-portfolio.vercel.app](https://priyanshurai-portfolio.vercel.app/)

---

## 📜 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
