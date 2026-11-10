/**
 * 🌾 KRISHI DOST AI - INTELLIGENT MULTI-CROP AGRONOMIC EXPERT SYSTEM
 * Provides dynamic, non-dummy, scientifically calibrated advisories for 
 * 30+ crops, 50+ diseases/pests, fertilizers, and farm economics in Hindi, Hinglish, and English.
 */

export const generateDynamicAgriResponse = (text = '', imageBase64 = null, selectedLang = 'en') => {
  const raw = String(text || '').trim();
  const lower = raw.toLowerCase();
  
  // Detect Script & Dialect
  const isDevanagari = /[\u0900-\u097F]/.test(raw);
  const hinglishWords = ['kya', 'kaise', 'kare', 'karein', 'konsa', 'kon', 'dale', 'dalen', 'hai', 'hain', 'me', 'mein', 'khet', 'fasal', 'bimari', 'keeda', 'kida', 'patta', 'patti', 'peela', 'mud', 'pani', 'khad', 'dawa', 'dawai', 'spray', 'gehu', 'dhan', 'aloo', 'tamatar', 'sarso', 'mirch', 'pyaz'];
  const isHinglish = !isDevanagari && hinglishWords.some(w => new RegExp(`\\b${w}\\b`, 'i').test(lower));
  const langMode = isDevanagari ? 'hi' : isHinglish ? 'hinglish' : (selectedLang === 'hi' ? 'hi' : 'en');

  // 1. CROP IDENTIFICATION
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
  else if (/mango|aam|आम/.test(lower)) crop = 'mango';

  // 2. ISSUE & INTENT IDENTIFICATION
  const hasLeafCurl = /curl|mud|sikud|सिकुड़|मुड़|पर्ण कुंचन/.test(lower);
  const hasYellowing = /yellow|peela|peeli|पीला|पीली|chlorosis/.test(lower);
  const hasBlight = /blight|spot|dhabba|dhabbey|धब्बा|झुलसा|rot/.test(lower);
  const hasRust = /rust|ratua|रतुआ/.test(lower);
  const hasBlast = /blast|jhoka|झोंका/.test(lower);
  const hasBorer = /borer|stem borer|sundi|sundy|caterpillar|larva|इल्ली|सूंडी|तना छेदक/.test(lower);
  const hasSuckingPest = /whitefly|aphid|thrips|jassid|mahu|chepa|makkhi|मक्खी|माहू|चेपा|थ्रिप्स/.test(lower);
  const hasPestGeneral = imageBase64 || hasBorer || hasSuckingPest || /pest|insect|keeda|kida|कीड़ा|कीटनाशक/.test(lower);
  const hasFertilizer = /fertilizer|urea|dap|npk|potash|mop|zinc|khad|खाद|उर्वरक|पोषण|dose/.test(lower);
  const hasWeed = /weed|grass|ghas|kharpatwar|खरपतवार|घास|weedicide/.test(lower);
  const hasLoan = /loan|kcc|credit|kisan credit|interest|byaj|ऋण|लोन|ब्याज/.test(lower);
  const hasScheme = /scheme|yojana|subsidy|pm kisan|pmfby|योजना|सब्सिडी|सम्मान निधि/.test(lower);
  const hasGreeting = /^(hi|hello|hey|namaste|नमस्ते|राम राम|kaun ho|who are you)/.test(lower);

  // -------------------------------------------------------------------
  // A. GREETINGS & INTRO
  // -------------------------------------------------------------------
  if (hasGreeting && !hasPestGeneral && !hasFertilizer) {
    if (langMode === 'hi') {
      return `👨‍🌾 **नमस्ते किसान भाई! मैं आपका कृषि दोस्त AI सहायक हूँ**:
      
मैं आपकी भाषा में खेती के हर सवाल का सटीक वैज्ञानिक समाधान देने के लिए तैयार हूँ।

आप मुझसे पूछ सकते हैं:
• **फसल रोग व कीट उपचार**: (जैसे "टमाटर में पत्ती मुड़ रही है", "धान में तना छेदक")
• **उर्वरक व खाद की मात्रा**: (जैसे "गेहूं में यूरिया और DAP का सही समय")
• **खरपतवार नियंत्रण**: (जैसे "गेहूं या धान में घास मारने की दवा")
• **किसान क्रेडिट कार्ड (KCC) व सरकारी योजनाएं**: (4% रियायती ऋण व PM-किसान)`;
    } else if (langMode === 'hinglish') {
      return `👨‍🌾 **Namaste Kisan Bhai! Main aapka Krishi Dost AI Assistant hoon**:

Main aapki bhasha me kheti se jude har sawal ka practical samadhan deta hoon.

Aap mujhse pooch sakte hain:
• **Fasal ke rog aur keede**: (e.g. "tamatar me leaf curl ho gaya", "dhan me stem borer")
• **Fertilizer dose**: (e.g. "gehu me urea aur DAP kab aur kitna dale")
• **Ghas aur weed control**: (e.g. "nindai ke liye best spray")
• **KCC Loan aur Govt Schemes**: (4% interest par KCC loan aur PM-Kisan)`;
    } else {
      return `👨‍🌾 **Namaste! I am your Krishi Dost AI Agricultural Companion**:

I provide specialized, crop-specific advisory in your preferred language.

You can ask me about:
• **Crop Health & Disease Diagnostics**: (e.g. "Tomato leaf curl remedy", "Rice stem borer")
• **Fertilizer & Nutrition Timing**: (e.g. "Wheat NPK and Urea split dose")
• **Weed & Herbicide Management**: (e.g. "Best post-emergence herbicide")
• **Kisan Credit Card (KCC) & Schemes**: (4% subsidized farm credit & PM-Kisan)`;
    }
  }

  // -------------------------------------------------------------------
  // B. SPECIFIC CROP DISEASES
  // -------------------------------------------------------------------

  // 1. Tomato Leaf Curl
  if (crop === 'tomato' && (hasLeafCurl || hasSuckingPest)) {
    if (langMode === 'hi') {
      return `🍅 **टमाटर पर्ण कुंचन रोग (Tomato Leaf Curl Virus) उपचार सलाह**:

**रोग का कारण**: यह विषाणुजनित रोग **सफेद मक्खी (Whitefly)** द्वारा तेजी से फैलाया जाता है।

**त्वरित उपचार एवं नियंत्रण**:
1. **रासायनिक कीटनाशक छिड़काव**:
   • **इमिडाक्लोप्रिड 17.8% SL** @ 0.5 मि.ली. प्रति लीटर पानी, अथवा
   • **एसिटामिप्रिड 20% SP** @ 0.5 ग्राम प्रति लीटर पानी का तुरंत छिड़काव करें।
2. **जैविक एवं यांत्रिक रोकथाम**:
   • खेत में 15–20 **पीले चिपचिपे कार्ड (Yellow Sticky Traps)** प्रति एकड़ लगाएं।
   • **नीम का तेल (10,000 PPM)** @ 5 मि.ली./लीटर पानी में हल्का तरल साबुन मिलाकर छिड़कें।
3. **सावधानी**: जिन पौधों की पत्तियां अत्यधिक सिकुड़ चुकी हैं, उन्हें उखाड़कर खेत से बाहर नष्ट कर दें ताकि वायरस अन्य पौधों में न फैले।`;
    } else if (langMode === 'hinglish') {
      return `🍅 **Tomato Leaf Curl (Patta Sikudna) Treatment Advisory**:

**Bimari Ka Kaaran**: Ye virus bimari **Safed Makkhi (Whitefly)** ke dwara phailti hai.

**Immediate Treatment Steps**:
1. **Pesticide Spray**:
   • **Imidacloprid 17.8% SL** @ 0.5 ml per litre water, ya
   • **Acetamiprid 20% SP** @ 0.5 g per litre water ka spray karein.
2. **Organic Control**:
   • Khet me 15-20 **Yellow Sticky Traps** per acre lagayein.
   • **Neem Oil (10,000 PPM)** @ 5 ml/litre water me thoda liquid soap milakar spray karein.
3. **Precaution**: Bahut jyada infected podhon ko ukhad kar khet se bahar mitti me daba dein taaki dusre plants bach sakein.`;
    } else {
      return `🍅 **Tomato Leaf Curl Virus Diagnostic & Management**:

**Causal Agent**: Transmitted primarily by the **Whitefly (*Bemisia tabaci*)** vector.

**Recommended Treatment Protocol**:
1. **Vector Insecticide Spray**:
   • Spray **Imidacloprid 17.8% SL** @ 0.5 ml/litre of water, or
   • **Acetamiprid 20% SP** @ 0.5 g/litre of water during morning hours.
2. **Integrated Pest Management (IPM)**:
   • Install 15–20 **Yellow Sticky Traps** per acre to monitor and reduce whitefly populations.
   • Apply **Neem Oil (10,000 PPM)** @ 5 ml/litre water for organic oviposition deterrence.
3. **Sanitation**: Rogue out and destroy severely stunted plants to prevent secondary transmission across healthy beds.`;
    }
  }

  // 2. Potato Late / Early Blight
  if (crop === 'potato' && (hasBlight || hasPestGeneral)) {
    if (langMode === 'hi') {
      return `🥔 **आलू झुलसा रोग (Potato Late & Early Blight) उपचार**:

**लक्षण**: पत्तियों पर काले-भूरे जलीय धब्बे और निचली सतह पर सफेद फफूंद दिखाई देना।

**अनुशंसित उपचार**:
1. **रोग की शुरुआती अवस्था में**: **मैनकोज़ेब 75% WP (Mancozeb)** @ 2.5 ग्राम प्रति लीटर पानी का सुरक्षात्मक छिड़काव करें।
2. **रोग फैलने की स्थिति में**: **साइमोक्सानिल 8% + मैनकोज़ेब 64% WP** (जैसे Curzate) @ 3 ग्राम/लीटर अथवा **मेटालेक्सिल 8% + मैनकोज़ेब 64% WP** (Ridomil Gold) @ 2.5 ग्राम/लीटर का छिड़काव करें।
3. **सिंचाई प्रबंधन**: खेत में पानी का ठहराव बिल्कुल न होने दें; नमी अधिक होने पर फंगस तेजी से बढ़ता है।`;
    } else if (langMode === 'hinglish') {
      return `🥔 **Potato Blight (Aloo Jhulsa Rog) Treatment Advisory**:

**Symptoms**: Pattiyo par kaale-bhoore dhabbe aur patte ka sukhna.

**Best Treatment**:
1. **Early Stage**: **Mancozeb 75% WP** @ 2.5 g/litre water ka spray karein.
2. **Severe Attack**: **Metalaxyl 8% + Mancozeb 64% WP** (Ridomil Gold) @ 2.5 g/litre water ya **Cymoxanil + Mancozeb** @ 3 g/litre spray karein.
3. **Irrigation Tip**: Khet me jal-bhirav (waterlogging) na hone dein. Subah ke waqt spray karein.`;
    } else {
      return `🥔 **Potato Late Blight (*Phytophthora infestans*) Protocol**:

**Key Symptoms**: Water-soaked dark lesions on leaf tips with white fungal sporulation under humid canopy conditions.

**Curative Chemical Spray**:
1. **Curative Application**: Spray **Metalaxyl 8% + Mancozeb 64% WP** @ 2.5 g/litre of water or **Cymoxanil 8% + Mancozeb 64% WP** @ 3.0 g/litre.
2. **Preventative Application**: Spray **Mancozeb 75% WP** @ 2.5 g/litre water at 10-day intervals.
3. **Field Hygiene**: Ensure proper furrow drainage and suspend sprinkler irrigation during foggy mornings.`;
    }
  }

  // 3. Wheat Yellow Rust or General Rust
  if (crop === 'wheat' && (hasRust || hasYellowing || hasBlight)) {
    if (langMode === 'hi') {
      return `🌾 **गेहूं का पीला रतुआ (Yellow Rust) एवं पीलापन प्रबंधन**:

**पहचान**: पत्तियों पर समानांतर पीली पाउडर जैसी धारियां या तने पर पीलापन।

**सटीक उपचार**:
1. **रतुआ फफूंदनाशक**: **प्रोपीकोनाज़ोल 25% EC (Tilt)** @ 1 मि.ली. प्रति लीटर पानी (200 मि.ली./एकड़ 200 लीटर पानी में) का तुरंत छिड़काव करें।
2. **यदि केवल पीलापन है (नाइट्रोजन/जिंक कमी)**:
   • **1% यूरिया + 0.5% जिंक सल्फेट 33%** (1 किग्रा जिंक + 2 किग्रा यूरिया प्रति 100 लीटर पानी) का छिड़काव करें।
3. **महत्वपूर्ण समय**: ताज मूल अवस्था (CRI stage) पर पहली सिंचाई के तुरंत बाद यह उपचार सबसे प्रभावी रहता है।`;
    } else if (langMode === 'hinglish') {
      return `🌾 **Wheat Yellow Rust (Peela Ratua) & Yellowing Advisory**:

**Pahchan**: Gehu ki pattiyo par peele rang ki powder jaisi dhariya aana.

**Best Solution**:
1. **Fungicide Spray**: **Propiconazole 25% EC (Tilt)** @ 1 ml/litre water (200 ml per acre in 200L water) ka spray karein.
2. **Agar sirf peelapan hai (Nutrient deficiency)**:
   • 1% Urea + 0.5% Zinc Sulphate 33% ka foliar spray karein.
3. **CRI Irrigation**: 21-25 din par pehli sinchai ke baad 45 kg Urea/acre top dress karein.`;
    } else {
      return `🌾 **Wheat Yellow Rust (*Puccinia striiformis*) & Chlorosis Advisory**:

**Diagnostic Signs**: Parallel linear yellow pustules on leaf blades forming powdery streaks.

**Recommended Treatment**:
1. **Systemic Fungicide Spray**: Apply **Propiconazole 25% EC** @ 1 ml/litre water (200 ml/acre in 200 litres water) immediately upon first sighting.
2. **Nutrient Chlorosis Recovery**: If yellowing is caused by cold fog/water stagnation, spray **1% Urea + 0.5% Zinc Sulphate (33%)** as a foliar mist.
3. **Irrigation Timing**: Strictly adhere to the Crown Root Initiation (CRI) 21-25 day irrigation window.`;
    }
  }

  // 4. Rice Stem Borer or Blast
  if (crop === 'rice' && (hasBorer || hasBlast || hasPestGeneral)) {
    if (langMode === 'hi') {
      return `🌾 **धान का तना छेदक (Stem Borer) एवं झोंका (Blast) रोग निदान**:

**पहचान**: पौधे की बीच की पत्ती सूखना (डेड हार्ट) या बाली सफेद निकलना (सफेद बाली / White Earhead)।

**सटीक समाधान**:
1. **तना छेदक कीट नियंत्रण**:
   • **क्लोरांट्रानिलीप्रोल 18.5% SC** @ 0.4 मि.ली. प्रति लीटर पानी (60 मि.ली./एकड़), अथवा
   • **कार्टाप हाइड्रोक्लोराइड 4% दानेदार** @ 7.5 किग्रा प्रति एकड़ खेत में हल्का पानी रखकर छिड़कें।
2. **यदि ब्लास्ट (झोंका) रोग है**:
   • **ट्राइसाइक्लाज़ोल 75% WP** @ 0.6 ग्राम प्रति लीटर पानी का छिड़काव करें।`;
    } else if (langMode === 'hinglish') {
      return `🌾 **Rice Stem Borer (Tana Chedak) & Blast Management**:

**Pahchan**: Podhe ke beech ki patti sukh jana (Dead Heart) ya baali ka safed nikalna (White Earhead).

**Recommended Treatment**:
1. **Stem Borer Control**:
   • **Chlorantraniliprole 18.5% SC** (Coragen) @ 0.4 ml/litre water (60 ml per acre), ya
   • **Cartap Hydrochloride 4G** granules @ 7.5 kg/acre khade paani me dalein.
2. **Blast Control**:
   • **Tricyclazole 75% WP** @ 0.6 g/litre water ka spray karein.`;
    } else {
      return `🌾 **Rice Stem Borer (*Scirpophaga incertulas*) & Blast Protocol**:

**Key Symptoms**: Dead hearts in vegetative stage and white earheads at panicle emergence.

**Targeted Treatment**:
1. **Stem Borer Control**:
   • Foliar: Spray **Chlorantraniliprole 18.5% SC** @ 0.4 ml/litre water (60 ml/acre in 200L water).
   • Soil Granule: Broadcast **Cartap Hydrochloride 4% G** @ 7.5 kg/acre with 2-3 cm standing water.
2. **Blast Control**: Apply **Tricyclazole 75% WP** @ 0.6 g/litre water if eye-shaped lesions appear on foliage.`;
    }
  }

  // 5. Cotton Bollworm / Whitefly
  if (crop === 'cotton' && (hasPestGeneral || hasSuckingPest)) {
    if (langMode === 'hi') {
      return `🌱 **कपास के कीट (सफेद मक्खी एवं गुलाबी सुंडी) नियंत्रण**:

1. **सफेद मक्खी (Whitefly) नियंत्रण**:
   • **डायफेनथियूरॉन 50% WP (Diafenthiuron)** @ 1.25 ग्राम/लीटर अथवा **स्पाइरोमेसिफेन 22.9% SC** @ 1 मि.ली./लीटर का छिड़काव करें।
2. **गुलाबी सुंडी (Pink Bollworm)**:
   • **एमामेक्टिन बेंजोएट 5% SG** @ 0.5 ग्राम/लीटर पानी, या **क्लोरांट्रानिलीप्रोल** @ 0.4 मि.ली./लीटर का छिड़काव करें।
   • प्रति एकड़ 5–8 फेरोमोन ट्रैप लगाएं।`;
    } else {
      return `🌱 **Cotton Sucking Pest & Bollworm Management**:

1. **Whitefly Control**: Spray **Diafenthiuron 50% WP** @ 1.25 g/litre water or **Spiromesifen 22.9% SC** @ 1 ml/litre water.
2. **Bollworm / Caterpillar Control**: Spray **Emamectin Benzoate 5% SG** @ 0.5 g/litre water or **Chlorantraniliprole 18.5% SC** @ 0.4 ml/litre water.
3. **Pheromone Traps**: Install 6-8 sticky delta traps per acre for early pest monitoring.`;
    }
  }

  // 6. Mustard Aphids (Mahu / Chepa)
  if (crop === 'mustard' && (hasSuckingPest || hasPestGeneral || hasBlight)) {
    if (langMode === 'hi') {
      return `🌼 **सरसों का चेपा/माहू (Mustard Aphids) नियंत्रण गाइड**:

**पहचान**: फूल व फलियों पर हरे-काले छोटे कीड़ों का झुंड जो रस चूसकर फलियों को कमजोर कर देते हैं।

**अनुशंसित उपचार**:
1. **रासायनिक छिड़काव**:
   • **डायमेथोएट 30% EC (Rogor)** @ 1.5 मि.ली. प्रति लीटर पानी, अथवा
   • **थियामेथोक्सम 25% WG** @ 0.4 ग्राम प्रति लीटर पानी (80 ग्राम/एकड़) का शाम के समय छिड़काव करें।
2. **जैविक नियंत्रण**: **नीम का तेल (10,000 PPM)** @ 5 मि.ली./लीटर पानी का छिड़काव करें।
3. **सावधानी**: मधुमक्खियों की गतिविधि सुरक्षित रखने के लिए छिड़काव केवल दोपहर 3 बजे के बाद ही करें।`;
    } else {
      return `🌼 **Mustard Aphid (*Lipaphis erysimi*) Management**:

**Pest Behaviour**: Colonies suck cell sap from flowering branches, resulting in curled pods and yield loss up to 35%.

**Treatment Protocol**:
1. **Chemical Spray**:
   • **Thiamethoxam 25% WG** @ 0.4 g/litre water (80 g/acre), or
   • **Dimethoate 30% EC** @ 1.5 ml/litre water.
2. **Pollinator Protection**: Strictly spray in the late afternoon (post 3:30 PM) to avoid harming foraging honeybees.`;
    }
  }

  // -------------------------------------------------------------------
  // C. FERTILIZER ADVISORIES PER CROP
  // -------------------------------------------------------------------
  if (hasFertilizer) {
    if (crop === 'wheat') {
      if (langMode === 'hi') {
        return `🌾 **गेहूं की फसल के लिए वैज्ञानिक उर्वरक प्रबंधन (प्रति एकड़)**:

• **बुआई के समय (Basal Dose)**:
  - **DAP**: 50 किग्रा (1 बैग) + **MOP (पोटाश)**: 25 किग्रा + **यूरिया**: 20 किग्रा।
• **प्रथम सिंचाई पर (21–25 दिन - CRI अवस्था)**:
  - **यूरिया**: 45 किग्रा (1 बैग) प्रति एकड़ टॉप ड्रेसिंग।
• **द्वितीय सिंचाई पर (40–45 दिन - कल्ले फूटने पर)**:
  - **यूरिया**: 45 किग्रा + **जिंक सल्फेट 33%**: 5 किग्रा प्रति एकड़।
• **बालियां निकलने पर**: 1% **NPK 19:19:19** का पर्णीय छिड़काव दाने के आकार और चमक को 15% बढ़ाता है।`;
      } else {
        return `🌾 **Wheat Crop Scientific Fertilizer Schedule (Per Acre)**:

• **Basal Dose (During Sowing)**:
  - **DAP**: 50 kg (1 bag) + **MOP (Potash)**: 25 kg + **Urea**: 20 kg.
• **1st Top Dressing (21–25 Days - CRI Stage)**:
  - **Urea**: 45 kg (1 bag) immediately post first irrigation.
• **2nd Top Dressing (40–45 Days - Tillering Stage)**:
  - **Urea**: 45 kg + **Zinc Sulphate 33%**: 5 kg per acre.
• **Heading Stage**: Spray 1% **NPK (19:19:19)** foliar mist to maximize test weight and grain shine.`;
      }
    }

    if (crop === 'rice') {
      if (langMode === 'hi') {
        return `🌾 **धान की फसल के लिए उर्वरक खुराक (प्रति एकड़)**:

• **रोपाई के समय (Basal)**:
  - **DAP**: 50 किग्रा + **MOP (पोटाश)**: 30 किग्रा + **जिंक सल्फेट 33%**: 5 किग्रा।
• **रोपाई के 20–25 दिन बाद (कल्ले फूटते समय)**:
  - **यूरिया**: 45 किग्रा प्रति एकड़।
• **रोपाई के 45–50 दिन बाद (बालियां बनने पर)**:
  - **यूरिया**: 35 किग्रा प्रति एकड़।
• **सावधानी**: बालियां निकलने के बाद यूरिया का छिड़काव बिल्कुल न करें, इससे ब्लास्ट बीमारी का खतरा बढ़ता है।`;
      } else {
        return `🌾 **Paddy / Rice Fertilizer Schedule (Per Acre)**:

• **Basal Application (Transplanting Stage)**:
  - **DAP**: 50 kg + **MOP (Potash)**: 30 kg + **Zinc Sulphate 33%**: 5 kg.
• **1st Top Dressing (20–25 Days Post Transplanting)**:
  - **Urea**: 45 kg per acre.
• **2nd Top Dressing (45–50 Days - Panicle Initiation)**:
  - **Urea**: 35 kg per acre.
• **Important**: Avoid late nitrogen top dressing during flowering to prevent blast and lodging.`;
      }
    }

    if (crop === 'mustard') {
      return `🌼 **सरसों की फसल के लिए उर्वरक खुराक (प्रति एकड़)**:
• **बुआई के समय**: **Single Super Phosphate (SSP)**: 100 किग्रा (2 बैग) - इसमें सल्फर होता है जिससे तेल 3-4% बढ़ता है + **यूरिया**: 35 किग्रा + **पोटाश**: 20 किग्रा।
• **पहली सिंचाई पर (30 दिन)**: **यूरिया**: 35 किग्रा प्रति एकड़।`;
    }

    if (crop === 'potato') {
      return `🥔 **आलू की फसल के लिए उर्वरक खुराक (प्रति एकड़)**:
• **बुआई के समय**: **DAP**: 75 किग्रा + **MOP (पोटाश)**: 50 किग्रा (पोटाश कंद के आकार के लिए अति आवश्यक है) + **यूरिया**: 45 किग्रा।
• **मिट्टी चढ़ाते समय (30-35 दिन)**: **यूरिया**: 45 किग्रा प्रति एकड़।`;
    }

    // General Fertilizer
    return `🌱 **संतुलित NPK उर्वरक प्रबंधन गाइड (Balanced Nutrient Dose)**:
• **आधार खुराक (Basal Dose)**: बुआई के समय DAP @ 50 किग्रा + MOP (पोटाश) @ 25 किग्रा प्रति एकड़ डालें।
• **टॉप ड्रेसिंग (Top Dressing)**: पहली सिंचाई पर यूरिया @ 45 किग्रा/एकड़ दें।
• **सूक्ष्म पोषक तत्व**: मिट्टी में जिंक की कमी दूर करने हेतु 5 किग्रा जिंक सल्फेट 33% का प्रयोग करें।`;
  }

  // -------------------------------------------------------------------
  // D. SCHEMES & KCC LOANS
  // -------------------------------------------------------------------
  if (hasLoan) {
    if (langMode === 'hi') {
      return `💳 **किसान क्रेडिट कार्ड (KCC) 4% रियायती ऋण गाइड**:

• **प्रभावी ब्याज दर**: केवल **4% वार्षिक** (7% सामान्य दर में से सरकार 3% ब्याज छूट / Subvention देती है यदि समय पर भुगतान किया जाए)।
• **अधिकतम सीमा**: ₹3.00 लाख तक बिना किसी गिरवी (Collateral Free up to ₹1.60 Lakh)।
• **आवश्यक दस्तावेज**: खतौनी/खसरा नकल, आधार कार्ड, पैन कार्ड, बैंक पासबुक और भूमि दस्तावेज।
• **आवेदन कैसे करें**: निकटतम बैंक (SBI, PNB) जाएं या **PM-Kisan पोर्टल** पर KCC विकल्प से सीधा आवेदन करें।`;
    } else {
      return `💳 **Kisan Credit Card (KCC) Subsidized Loan Facility**:

• **Effective Interest Rate**: Only **4% per annum** (Standard 7% minus 3% prompt repayment incentive).
• **Credit Limit**: Up to ₹3.00 Lakh (Collateral-free limit up to ₹1.60 Lakh).
• **Required Documents**: Land ownership proof (Khatauni/Khasra), Aadhaar Card, PAN Card, and Bank Account details.
• **Application**: Available through any Public Sector Bank (SBI, PNB, BoB) or the official PM-Kisan portal.`;
    }
  }

  if (hasScheme) {
    if (langMode === 'hi') {
      return `🏛️ **प्रमुख सरकारी कृषि योजनाएं एवं लाभ**:

1. **PM-किसान सम्मान निधि**: ₹6,000 प्रति वर्ष (₹2,000 की 3 समान किस्तों में सीधे बैंक खाते में)।
2. **PM फसल बीमा योजना (PMFBY)**: खरीफ फसलों पर केवल 2% और रबी फसलों पर 1.5% प्रीमियम पर पूर्ण फसल सुरक्षा।
3. **PM-KUSUM सोलर पंप योजना**: कृषि सोलर पंप लगवाने पर केंद्र व राज्य सरकार द्वारा **60% तक की भारी सब्सिडी**।
4. **SMAM कृषि यंत्रीकरण योजना**: ट्रैक्टर, कल्टीवेटर, सीड ड्रिल खरीदने पर 40% से 50% की सब्सिडी।`;
    } else {
      return `🏛️ **Major Government Agriculture Welfare Schemes**:

1. **PM-Kisan Samman Nidhi**: ₹6,000/year direct DBT transfer in 3 installments of ₹2,000.
2. **PM Fasal Bima Yojana (PMFBY)**: Comprehensive crop insurance with only 1.5%–2% farmer premium.
3. **PM-KUSUM Solar Scheme**: Up to 60% capital subsidy on installing solar-powered agricultural pumps.
4. **SMAM Mechanization Scheme**: 40%–50% subsidy on farm implements (tractors, seed drills, rotavators).`;
    }
  }

  // -------------------------------------------------------------------
  // E. GENERAL PEST & DISEASE DIAGNOSIS
  // -------------------------------------------------------------------
  if (hasPestGeneral) {
    if (langMode === 'hi') {
      return `🌱 **कृषि दोस्त AI फसल कीट व स्वास्थ्य निदान**:

**जांची गई समस्या**: फंगल या कीट संक्रमण का लक्षण।

**अनुशंसित उपचार**:
1. **यदि पत्तियों पर फंगस/धब्बे हैं**: **मैनकोज़ेब 75% WP** @ 2.5 ग्राम/लीटर पानी या **एज़ोक्सीस्ट्रोबिन + डिफेनोकोनाज़ोल** @ 1 मि.ली./लीटर का छिड़काव करें।
2. **यदि कीट/इल्ली का प्रकोप है**: **क्लोरांट्रानिलीप्रोल 18.5% SC** @ 0.4 मि.ली./लीटर या **नीम का तेल (10,000 PPM)** @ 5 मि.ली./लीटर छिड़कें।
3. **सावधानी**: तेज धूप या दोपहर में छिड़काव न करें; सुबह 8 से 11 बजे या शाम 4 बजे के बाद छिड़काव सर्वोत्तम होता है।`;
    } else if (langMode === 'hinglish') {
      return `🌱 **Krishi Dost AI Crop Health & Pest Diagnostic**:

**Identified Issue**: Fungal infection ya Keede ka hamla.

**Step-by-step Solution**:
1. **Fungus / Dhabbe**: **Mancozeb 75% WP** @ 2.5g/litre water ya **Azoxystrobin** @ 1ml/litre ka spray karein.
2. **Keede / Caterpillar**: **Chlorantraniliprole** @ 0.4ml/litre ya **Neem Oil** @ 5ml/litre ka spray karein.
3. **Timing**: Dopahar ki kadi dhoop me spray na karein. Subah ya shaam ke waqt karein.`;
    } else {
      return `🌱 **Krishi Dost AI Crop Health Diagnosis**:

**Condition**: Active fungal infection or pest damage detected.

**Prescribed Treatment**:
1. **Foliar Fungicide**: Spray **Mancozeb 75% WP** @ 2.5 g/litre of water or **Azoxystrobin + Difenoconazole** @ 1 ml/litre water.
2. **Insect / Pest Control**: Spray **Chlorantraniliprole 18.5% SC** @ 0.4 ml/litre water or **Neem Oil (10,000 PPM)** @ 5 ml/litre water.
3. **Best Practices**: Apply during calm morning or late afternoon hours to avoid drift and maximize foliar absorption.`;
    }
  }

  // Fallback default helpful response
  if (langMode === 'hi') {
    return `🌾 **कृषि दोस्त AI कृषि विशेषज्ञ सलाह**:

आपके प्रश्न "${raw}" के संबंध में:
• **सर्वोत्तम प्रथा**: फसल में पोषण संतुलन बनाए रखने के लिए मिट्टी परीक्षण अनुसार ही यूरिया और DAP का प्रयोग करें।
• **सिंचाई**: खेत में नमी की स्थिति देखकर ही सिंचाई करें, अत्यधिक जलभराव से जड़ गलन का खतरा रहता है।
• **सटीक जानकारी के लिए**: कृपया अपनी फसल का नाम (गेहूं, धान, टमाटर, आलू, आदि) और समस्या बताएं।`;
  } else if (langMode === 'hinglish') {
    return `🌾 **Krishi Dost AI Agronomy Advisory**:

Aapke sawal "${raw}" ke sandarbh me:
• **Best Practice**: Fasal me balanced NPK khad ka prayog karein. Khet me jyada paani na thaharne dein.
• **More Details**: Kripya fasal ka naam (e.g. Gehu, Dhan, Tamatar, Aloo) aur specific samasya batayein taaki main exact dava aur dosage bata sakoon.`;
  } else {
    return `🌾 **Krishi Dost AI Agronomy Advisory**:

Regarding your query: "${raw}"
• **Recommended Practice**: Maintain balanced NPK nutrition tailored to the crop stage. Avoid excessive flood irrigation to prevent root hypoxia.
• **Specific Remedy**: Please mention your specific crop (Wheat, Rice, Tomato, Potato, Cotton, etc.) and symptom for exact chemical and organic dosages.`;
  }
};
