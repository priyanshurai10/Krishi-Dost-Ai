/**
 * 🌾 KRISHI DOST AI - ADVANCED AGRONOMIC EXPERT SYSTEM
 * Provides scientifically validated, dosage-accurate, crop-specific advisories
 * for all Indian crops, pests, fertilizers, irrigation, and farm schemes.
 * Supports Hindi (Devanagari), Hinglish, and English.
 */

export const generateDynamicAgriResponse = (text = '', imageBase64 = null, selectedLang = 'en') => {
  const raw = String(text || '').trim();
  const lower = raw.toLowerCase();
  
  // 1. Detect Script & Dialect
  const isDevanagari = /[\u0900-\u097F]/.test(raw);
  const hinglishKeywords = [
    'kya', 'kaise', 'kare', 'karein', 'konsa', 'konsi', 'kon', 'dale', 'dalen', 'kab',
    'hai', 'hain', 'me', 'mein', 'khet', 'fasal', 'bimari', 'keeda', 'kida', 'patta', 
    'patti', 'peela', 'mud', 'pani', 'khad', 'dawa', 'dawai', 'spray', 'gehu', 'dhan', 
    'aloo', 'tamatar', 'sarso', 'mirch', 'pyaz', 'aam', 'ganna', 'ilaaj', 'upchar', 
    'chahiye', 'batao', 'bataye', 'bhav', 'paidawar', 'ghas', 'deemak', 'nursery'
  ];
  const isHinglish = !isDevanagari && hinglishKeywords.some(w => new RegExp(`\\b${w}\\b`, 'i').test(lower));
  const isHindiMode = isDevanagari || isHinglish || selectedLang === 'hi';
  const langMode = isDevanagari ? 'hi' : isHinglish ? 'hinglish' : (selectedLang === 'hi' ? 'hi' : 'en');

  // 2. Crop Detection
  let crop = null;
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

  // 3. Intent & Problem Keywords Detection
  const hasWater = /pani|paani|water|sinchai|irrigation|पानी|सिंचाई|पहला पानी|दूसरा पानी/.test(lower);
  const hasFertilizer = /fertilizer|urea|dap|npk|potash|mop|zinc|khad|खाद|उर्वरक|पोषण|dose|डोज/.test(lower);
  const hasMedicine = /dawa|dawai|dawayi|medicine|spray|chemical|दवा|दवाई|छिड़काव|स्प्रे|इलाज|उपचार/.test(lower);
  const hasDisease = /disease|rog|bimari|samasya|beemari|infection|blight|rust|rot|fungus|curl|mud|sikud|yellow|peela|peeli|रोग|बीमारी|झुलसा|फफूंद|धब्बा|सूख|मुड़|सिकुड़|पीला/.test(lower);
  const hasInsect = imageBase64 || /pest|insect|keeda|kida|sundi|larva|worm|caterpillar|fly|whitefly|aphid|thrips|jassid|mahu|chepa|makkhi|borer|कीड़ा|इल्ली|कीट|माहू|मक्खी|सफेद मक्खी|तना छेदक/.test(lower);
  const hasPestOrDisease = hasMedicine || hasDisease || hasInsect;
  const hasWeed = /weed|grass|ghas|kharpatwar|खरपतवार|घास|weedicide|nindai|निंदाई/.test(lower);
  const hasLoan = /loan|kcc|credit|kisan credit|interest|byaj|ऋण|लोन|ब्याज/.test(lower);
  const hasScheme = /scheme|yojana|subsidy|pm kisan|pmfby|योजना|सब्सिडी|सम्मान निधि/.test(lower);
  const hasSoilTest = /soil|mitti|मिट्टी|mrrida|janch|test|जांच|परीक्षण|sample/.test(lower);
  const hasFruitDrop = /drop|fall|gir|jhad|गिर|झड़|bor|फूल झड़|फल झड़|बौर/.test(lower);
  const hasOrganic = /organic|jaivik|जैविक|neemastra|jeevamrit|जीवामृत|नीमास्त्र|vermicompost|देसी खाद/.test(lower);
  const hasProfit = /profit|munafa|मुनाफा|kamai|कमाई|lagat|income|kam lagat|लागत/.test(lower);
  const hasSowing = /sowing|buai|buaai|बुआई|बुवाई|kab lagaye|kab boin|timing|kism|variety|बीज दर|नर्सरी|nursery/.test(lower);
  const hasTermite = /termite|deemak|दीमक/.test(lower);
  const hasGreeting = /^(hi|hello|hey|namaste|नमस्ते|राम राम|kaun ho|who are you)/.test(lower);

  // -------------------------------------------------------------------
  // A. GREETINGS
  // -------------------------------------------------------------------
  if (hasGreeting && !crop && !hasPestOrDisease && !hasFertilizer) {
    if (isHindiMode) {
      return `👨‍🌾 **नमस्ते किसान भाई! मैं आपका कृषि दोस्त AI सहायक हूँ**:
      
मैं आपकी भाषा में खेती के हर सवाल का सटीक वैज्ञानिक समाधान देने के लिए तैयार हूँ।

आप मुझसे पूछ सकते हैं:
• **फसल रोग व दवा**: (जैसे "टमाटर में कौन सी दवा डालें", "गेहूं में पीला रतुआ")
• **उर्वरक व खाद की सही मात्रा**: (जैसे "गेहूं में यूरिया और DAP कब डालें")
• **सिंचाई समय सारणी**: (जैसे "गेहूं में पहला पानी कब दें")
• **खरपतवार व कीट नियंत्रण**: (जैसे "धान में तना छेदक", "खरपतवार नाशी दवा")
• **KCC लोन व सरकारी योजनाएं**: (4% ब्याज पर KCC व PM-किसान)`;
    } else if (langMode === 'hinglish') {
      return `👨‍🌾 **Namaste Kisan Bhai! Main aapka Krishi Dost AI Assistant hoon**:

Aap mujhse kheti se juda koi bhi sawal pooch sakte hain:
• **Fasal ke rog aur dawa spray**: (e.g. "tamatar me konsi dawa dale", "gehu me peela ratua")
• **Khad aur fertilizer dose**: (e.g. "gehu me urea aur DAP kab dale")
• **Sinchai ka sahi samay**: (e.g. "gehu me pehla pani kab de")
• **KCC Loan aur Govt Schemes**: (4% interest par KCC loan aur PM-Kisan)`;
    } else {
      return `👨‍🌾 **Namaste! I am your Krishi Dost AI Agriculture Assistant**:

Ask me anything about your farm:
• **Crop Health & Disease Spray**: e.g., "Tomato leaf curl remedy", "Wheat yellow rust"
• **Fertilizer Dosage & Timing**: e.g., "Wheat NPK and Urea split dose"
• **Irrigation Stages**: e.g., "When to apply first irrigation in wheat"
• **KCC Loans & Schemes**: Subsidized 4% credit and PM-Kisan subsidies.`;
    }
  }

  // -------------------------------------------------------------------
  // B. SPECIFIC CROP ADVISORIES (Direct Match)
  // -------------------------------------------------------------------

  // 1. TOMATO (टमाटर)
  if (crop === 'tomato') {
    if (hasWater) {
      return isHindiMode 
        ? `🍅 **टमाटर की फसल में वैज्ञानिक सिंचाई प्रबंधन**:
• **सिंचाई का अंतराल**: गर्मियों में 4-5 दिन पर और सर्दियों में 8-10 दिन के अंतराल पर हल्की सिंचाई करें।
• **फूल व फल बनते समय**: मिट्टी में लगातार हल्की नमी बनी रहनी चाहिए; अचानक भारी पानी देने से फल फट (Fruit Cracking) जाते हैं।
• **सर्वोत्तम तकनीक**: ड्रिप सिंचाई (टपक सिंचाई) अपनाएं, जिससे 50% पानी बचता है और फंगल बीमारियां 80% कम होती हैं।`
        : `🍅 **Tomato Irrigation Advisory**:
• **Schedule**: Irrigate every 4–5 days in summer and 8–10 days in winter.
• **Crucial Stage**: Maintain uniform light moisture during flowering and fruit setting. Avoid flood irrigation to prevent fruit cracking and blossom end rot.
• **Best Method**: Drip irrigation saves 50% water and drastically curtails foliar blight.`;
    }

    if (hasFertilizer) {
      return isHindiMode
        ? `🍅 **टमाटर की फसल के लिए उर्वरक खुराक (प्रति एकड़)**:
• **रोपाई के समय (Basal)**: सड़ा हुआ गोबर 8-10 टन + **DAP**: 60 किग्रा + **MOP (पोटाश)**: 40 किग्रा + **यूरिया**: 30 किग्रा।
• **रोपाई के 25-30 दिन बाद**: **यूरिया**: 35 किग्रा प्रति एकड़।
• **फल बनते समय**: **कैल्शियम नाइट्रेट**: 10 किग्रा + **बोरॉन 20%**: 1 किग्रा ड्रिप या मिट्टी में दें (इससे फल चमकदार और ठोस बनते हैं)।`
        : `🍅 **Tomato Fertilizer Schedule (Per Acre)**:
• **Basal**: Well-rotted FYM 8–10 tonnes + **DAP**: 60 kg + **MOP (Potash)**: 40 kg + **Urea**: 30 kg.
• **Top Dressing (25–30 DAT)**: **Urea**: 35 kg per acre.
• **Fruiting Stage**: Apply **Calcium Nitrate** @ 10 kg/acre + **Boron 20%** @ 1 kg/acre for firm, unblemished fruit development.`;
    }

    // Default Tomato Disease & Medicine Spray Guide
    return isHindiMode
      ? `🍅 **टमाटर की फसल में प्रमुख रोग एवं संपूर्ण स्प्रे दवा चार्ट**:

1. **पत्ती मुड़ना (Leaf Curl) व सफेद मक्खी**:
   • **इमिडाक्लोप्रिड 17.8% SL** @ 0.5 मि.ली. प्रति लीटर पानी, या **एसिटामिप्रिड 20% SP** @ 0.5 ग्राम/लीटर का छिड़काव करें।
   • खेत में 15–20 **पीले चिपचिपे कार्ड (Yellow Sticky Traps)** प्रति एकड़ लगाएं।
2. **अगेती व पछेती झुलसा (Early & Late Blight)**:
   • बचाव हेतु: **मैनकोज़ेब 75% WP** @ 2.5 ग्राम/लीटर पानी।
   • रोग फैलने पर: **साइमोक्सानिल 8% + मैनकोज़ेब 64% (Curzate)** @ 3 ग्राम/लीटर या **एज़ोक्सीस्ट्रोबिन + डिफेनोकोनाज़ोल (Custodia)** @ 1 मि.ली./लीटर।
3. **फल छेदक इल्ली (Fruit Borer)**:
   • **क्लोरांट्रानिलीप्रोल 18.5% SC (Coragen)** @ 0.4 मि.ली./लीटर पानी (60 मि.ली./एकड़) या **इमामेक्टिन बेंजोएट 5% SG** @ 4 ग्राम प्रति 10 लीटर पानी में छिड़कें।
4. **जैविक विकल्प**: **नीम का तेल (10,000 PPM)** @ 5 मि.ली./लीटर पानी का नियमित छिड़काव करें।`
      : `🍅 **Tomato Disease, Pest & Medicine Spray Guide**:

1. **Leaf Curl Virus & Whitefly Control**:
   • Spray **Imidacloprid 17.8% SL** @ 0.5 ml/litre water or **Acetamiprid 20% SP** @ 0.5 g/litre.
   • Install 15–20 **Yellow Sticky Traps** per acre to capture vector whiteflies.
2. **Blight (Early & Late Blight)**:
   • Preventative: Spray **Mancozeb 75% WP** @ 2.5 g/litre water.
   • Curative: Spray **Cymoxanil + Mancozeb (Curzate)** @ 3 g/L or **Azoxystrobin + Difenoconazole** @ 1 ml/L.
3. **Fruit Borer (Caterpillar)**:
   • Spray **Chlorantraniliprole 18.5% SC (Coragen)** @ 0.4 ml/L (60 ml/acre in 200L water) or **Emamectin Benzoate 5% SG** @ 4 g/10L water.
4. **Organic Option**: Spray **Neem Oil (10,000 PPM)** @ 5 ml/litre water mixed with liquid surfactant.`;
  }

  // 2. WHEAT (गेहूं)
  if (crop === 'wheat') {
    if (hasWater) {
      return isHindiMode
        ? `🌾 **गेहूं की फसल में सिंचाई की 6 क्रांतिक अवस्थाएं (Critical Stages)**:

1. **पहली सिंचाई (CRI - ताज मूल अवस्था)**: बुआई के **20 से 25 दिन बाद**। (यह सिंचाई सबसे जरूरी है, इसे कभी न छोड़ें)।
2. **दूसरी सिंचाई (कल्ले फूटने पर - Tillering)**: बुआई के **40 से 45 दिन बाद**।
3. **तीसरी सिंचाई (गांठें बनते समय - Late Jointing)**: बुआई के **60 से 65 दिन बाद**।
4. **चौथी सिंचाई (फूल/बालियां निकलते समय - Flowering)**: बुआई के **80 से 85 दिन बाद**।
5. **पांचवी सिंचाई (दूधिया अवस्था - Milking)**: बुआई के **100 से 105 दिन बाद**।
6. **छठी सिंचाई (दाना सख्त होते समय - Dough)**: बुआई के **115 से 120 दिन बाद**।

*(यदि पानी की कमी हो और केवल 2 सिंचाई उपलब्ध हों, तो 21 दिन और 85 दिन पर सिंचाई करें)*।`
        : `🌾 **Wheat Critical Irrigation Schedule (6 Stages)**:

1. **1st Irrigation (CRI Stage)**: **20–25 days after sowing**. The most vital irrigation for root anchorage.
2. **2nd Irrigation (Tillering)**: **40–45 days after sowing**.
3. **3rd Irrigation (Jointing)**: **60–65 days after sowing**.
4. **4th Irrigation (Flowering)**: **80–85 days after sowing**.
5. **5th Irrigation (Milking)**: **100–105 days after sowing**.
6. **6th Irrigation (Dough Stage)**: **115–120 days after sowing**.

*(If water is constrained to only 2 irrigations, apply at CRI (21 DAS) and Flowering (85 DAS))*.`;
    }

    if (hasFertilizer) {
      return isHindiMode
        ? `🌾 **गेहूं की फसल में वैज्ञानिक उर्वरक प्रबंधन (प्रति एकड़ खुराक)**:

• **बुआई के समय (Basal Dose)**:
  - **DAP**: 50 किग्रा (1 बैग) + **MOP (पोटाश)**: 25 किग्रा + **यूरिया**: 20 किग्रा।
• **पहली सिंचाई पर (21-25 दिन - CRI अवस्था)**:
  - **यूरिया**: 45 किग्रा (1 बैग) प्रति एकड़ टॉप ड्रेसिंग।
• **दूसरी सिंचाई पर (40-45 दिन - कल्ले फूटते समय)**:
  - **यूरिया**: 45 किग्रा + **जिंक सल्फेट 33%**: 5 किग्रा प्रति एकड़।
• **बालियां निकलने पर**: 1% **NPK (19:19:19)** का पर्णीय स्प्रे दानों की चमक और वजन को 15% बढ़ाता है।`
        : `🌾 **Wheat Fertilizer Dosage & Schedule (Per Acre)**:

• **Basal Dose (At Sowing)**:
  - **DAP**: 50 kg (1 bag) + **MOP (Potash)**: 25 kg + **Urea**: 20 kg.
• **1st Top Dressing (21–25 DAS - CRI Stage)**:
  - **Urea**: 45 kg (1 bag) post 1st irrigation.
• **2nd Top Dressing (40–45 DAS - Tillering)**:
  - **Urea**: 45 kg + **Zinc Sulphate 33%**: 5 kg per acre.
• **Flag Leaf Stage**: Foliar spray of 1% **NPK (19:19:19)** boosts test weight and grain lustre.`;
    }

    // Default Wheat Disease, Pest & Weed Medicine Guide
    return isHindiMode
      ? `🌾 **गेहूं की फसल में रोग, खरपतवार एवं संपूर्ण दवा चार्ट**:

1. **पीला रतुआ (Yellow Rust)**:
   • पत्तियों पर पीली पाउडर जैसी धारियां दिखने पर तुरंत **प्रोपीकोनाज़ोल 25% EC (Tilt)** @ 1 मि.ली. प्रति लीटर पानी (200 मि.ली./एकड़ 200L पानी में) का छिड़काव करें।
2. **खरपतवार (गुल्ली डंडा / मंडूसी एवं चौड़ी पत्ती घास)**:
   • बुआई के 30-35 दिन बाद (पहली सिंचाई के बाद): **सल्फोसल्फ्यूरोन 75% + मेटसल्फ्यूरोन 5% (Total/Leader)** @ 16 ग्राम प्रति एकड़ 150 लीटर पानी में फ्लैट फैन नोजल से स्प्रे करें।
3. **माहू / चेपा (Aphids)**:
   • **थियामेथोक्सम 25% WG** @ 0.5 ग्राम/लीटर पानी या **इमिडाक्लोप्रिड 17.8% SL** @ 0.5 मि.ली./लीटर पानी में छिड़कें।
4. **पीलापन (पोषक तत्व कमी)**:
   • 1% यूरिया (1 किग्रा/100L पानी) + 0.5% जिंक सल्फेट 33% (500 ग्राम/100L पानी) का पर्णीय छिड़काव करें।`
      : `🌾 **Wheat Disease, Weed & Chemical Spray Protocol**:

1. **Yellow Rust (*Puccinia striiformis*)**:
   • Spray **Propiconazole 25% EC (Tilt)** @ 1 ml/litre water (200 ml/acre in 200L water) at the first onset of yellow stripe pustules.
2. **Weed Management (Phalaris minor + Broadleaf Weeds)**:
   • At 30–35 DAS (post 1st irrigation): Spray **Sulfosulfuron 75% + Metsulfuron 5% WG (Total/Leader)** @ 16 g/acre in 150L water using a flat-fan nozzle.
3. **Aphids (Mahu/Chepa)**:
   • Spray **Thiamethoxam 25% WG** @ 0.5 g/L or **Imidacloprid 17.8% SL** @ 0.5 ml/L.
4. **Nutrient Chlorosis (Yellowing)**:
   • Foliar spray of 1% Urea + 0.5% Zinc Sulphate 33% restores lush green vegetative canopy.`;
  }

  // 3. RICE / PADDY (धान)
  if (crop === 'rice') {
    if (hasWater) {
      return isHindiMode
        ? `🌾 **धान की फसल में वैज्ञानिक जल प्रबंधन (Water Management)**:
• **रोपाई से 15 दिन तक**: खेत में 2 से 3 सेमी पानी का छिछला स्तर बनाए रखें ताकि पौधे अच्छी तरह जड़ पकड़ सकें।
• **कल्ले फूटते समय**: खेत में अत्यधिक पानी न भरें; 3-5 सेमी पानी पर्याप्त है।
• **कटाई से 10-12 दिन पहले**: खेत से सारा पानी निकाल दें ताकि दाना अच्छी तरह सूखकर पके।`
        : `🌾 **Paddy Water Management Guidelines**:
• **Transplanting (0–15 DAT)**: Maintain shallow 2–3 cm standing water for optimum seedling establishment.
• **Tillering Stage**: Maintain 3–5 cm water depth; avoid deep inundation as it suppresses tiller initiation.
• **Harvest Preparation**: Drain the field completely 10–12 days prior to harvesting for uniform grain ripening.`;
    }

    if (hasFertilizer) {
      return isHindiMode
        ? `🌾 **धान की फसल के लिए उर्वरक खुराक (प्रति एकड़)**:
• **रोपाई के समय (Basal)**: **DAP**: 50 किग्रा + **MOP (पोटाश)**: 30 किग्रा + **जिंक सल्फेट 33%**: 5 किग्रा।
• **20-25 दिन बाद (कल्ले फूटने पर)**: **यूरिया**: 45 किग्रा प्रति एकड़।
• **45-50 दिन बाद (बालियां बनते समय)**: **यूरिया**: 35 किग्रा प्रति एकड़।
• **सावधानी**: बालियां निकलने के बाद यूरिया कभी न डालें, इससे ब्लास्ट बीमारी बढ़ जाती है।`
        : `🌾 **Rice Fertilizer Schedule (Per Acre)**:
• **Basal Application**: **DAP**: 50 kg + **MOP (Potash)**: 30 kg + **Zinc Sulphate 33%**: 5 kg.
• **1st Top Dressing (20–25 DAT)**: **Urea**: 45 kg per acre.
• **2nd Top Dressing (45–50 DAT)**: **Urea**: 35 kg per acre.
• **Caution**: Never apply nitrogen after panicle emergence to avoid triggering blast outbreaks.`;
    }

    // Default Rice Disease & Medicine Guide
    return isHindiMode
      ? `🌾 **धान की फसल में प्रमुख रोग एवं दवा स्प्रे गाइड**:

1. **तना छेदक (Stem Borer) एवं पत्ती लपेटक (Leaf Folder)**:
   • **क्लोरांट्रानिलीप्रोल 18.5% SC (Coragen)** @ 0.4 मि.ली. प्रति लीटर पानी, या
   • **कार्टाप हाइड्रोक्लोराइड 4% G** दानेदार @ 7.5 किग्रा प्रति एकड़ 2-3 सेमी खड़े पानी में डालें।
2. **झोंका रोग (Blast)**:
   • **ट्राइसाइक्लाज़ोल 75% WP** @ 0.6 ग्राम प्रति लीटर पानी का छिड़काव करें।
3. **शीथ ब्लाइट (Sheath Blight)**:
   • **हेक्साकोनाज़ोल 5% SC (Contaf)** @ 2 मि.ली./लीटर या **वेलिडामाइसिन 3% L** @ 2.5 मि.ली./लीटर पानी में छिड़कें।
4. **भूरा फुदका (Brown Plant Hopper - BPH)**:
   • तनों के पास पानी की सतह पर भूरे फुदके दिखने पर **पाइमेट्रोज़िन 50% WG (Chess)** @ 120 ग्राम प्रति एकड़ 200 लीटर पानी में छिड़कें।`
      : `🌾 **Paddy Disease, Pest & Medicine Spray Chart**:

1. **Stem Borer & Leaf Folder**:
   • Foliar: Spray **Chlorantraniliprole 18.5% SC (Coragen)** @ 0.4 ml/L (60 ml/acre).
   • Soil Granule: Broadcast **Cartap Hydrochloride 4G** @ 7.5 kg/acre with shallow standing water.
2. **Blast Disease (*Magnaporthe oryzae*)**:
   • Spray **Tricyclazole 75% WP** @ 0.6 g/litre water.
3. **Sheath Blight**:
   • Spray **Hexaconazole 5% SC (Contaf)** @ 2 ml/L or **Validamycin 3% L** @ 2.5 ml/L.
4. **Brown Plant Hopper (BPH)**:
   • Spray **Pymetrozine 50% WG (Chess)** @ 120 g/acre directly targeting the lower stem base.`;
  }

  // 4. POTATO (आलू)
  if (crop === 'potato') {
    if (hasFertilizer) {
      return isHindiMode
        ? `🥔 **आलू की फसल में उर्वरक खुराक (प्रति एकड़)**:
• **बुआई के समय (Basal)**: **DAP**: 75 किग्रा + **MOP (पोटाश)**: 50 किग्रा (पोटाश कंद का आकार और छिलका मजबूत करता है) + **यूरिया**: 45 किग्रा।
• **मिट्टी चढ़ाते समय (30-35 दिन)**: **यूरिया**: 45 किग्रा प्रति एकड़ टॉप ड्रेसिंग।`
        : `🥔 **Potato Fertilizer Dose (Per Acre)**:
• **Basal**: **DAP**: 75 kg + **MOP (Potash)**: 50 kg (critical for tuber bulking) + **Urea**: 45 kg.
• **Earthing Up (30–35 DAS)**: Top dress **Urea**: 45 kg per acre.`;
    }

    return isHindiMode
      ? `🥔 **आलू की फसल में झुलसा रोग एवं संपूर्ण स्प्रे दवा**:

1. **पछेती झुलसा (Late Blight)**:
   • बचाव हेतु: **मैनकोज़ेब 75% WP** @ 2.5 ग्राम प्रति लीटर पानी का स्प्रे करें।
   • बीमारी दिखने पर: **साइमोक्सानिल 8% + मैनकोज़ेब 64% WP (Curzate)** @ 3 ग्राम/लीटर या **मेटालेक्सिल 8% + मैनकोज़ेब 64% (Ridomil Gold)** @ 2.5 ग्राम/लीटर का छिड़काव करें।
2. **अगेती झुलसा (Early Blight)**:
   • **डिफेनोकोनाज़ोल 25% EC (Score)** @ 1 मि.ली./लीटर पानी में छिड़कें।
3. **माहू व रस चूसक कीट**:
   • **इमिडाक्लोप्रिड 17.8% SL** @ 0.5 मि.ली./लीटर पानी।
4. **सिंचाई सावधानी**: खेत की मेड़ के ऊपर तक पानी न चढ़ाएं; कंद को हमेशा ढका रखें।`
      : `🥔 **Potato Blight Management & Medicine Chart**:

1. **Late Blight (*Phytophthora infestans*)**:
   • Preventative: Spray **Mancozeb 75% WP** @ 2.5 g/L.
   • Curative: Spray **Metalaxyl 8% + Mancozeb 64% WP (Ridomil Gold)** @ 2.5 g/L or **Cymoxanil + Mancozeb (Curzate)** @ 3 g/L.
2. **Early Blight**:
   • Spray **Difenoconazole 25% EC (Score)** @ 1 ml/L.
3. **Aphid Vector Control**:
   • Spray **Imidacloprid 17.8% SL** @ 0.5 ml/L to prevent secondary virus transmission.`;
  }

  // 5. MUSTARD (सरसों)
  if (crop === 'mustard') {
    if (hasWater) {
      return isHindiMode
        ? `🌼 **सरसों की फसल में सिंचाई का सही समय**:
• **पहली सिंचाई**: बुआई के **28 से 35 दिन बाद** (फूल खिलने से ठीक पहले)।
• **दूसरी सिंचाई**: बुआई के **60 से 65 दिन बाद** (फलियां/सिलिकुआ बनते समय)।
• **सावधानी**: जब फूल पूरी तरह खिल रहे हों तब सिंचाई न करें, इससे परागण प्रभावित होता है।`
        : `🌼 **Mustard Irrigation Schedule**:
• **1st Irrigation**: **28–35 days after sowing** (pre-flowering stage).
• **2nd Irrigation**: **60–65 days after sowing** (pod formation stage).
• **Precaution**: Avoid irrigation during peak flowering to protect cross-pollination.`;
    }

    if (hasFertilizer) {
      return isHindiMode
        ? `🌼 **सरसों में खाद एवं उर्वरक खुराक (प्रति एकड़)**:
• **बुआई के समय**: **Single Super Phosphate (SSP)**: 100 किग्रा (2 बैग) - इसमें 11% सल्फर होता है जो तेल की मात्रा 3-4% बढ़ाता है + **यूरिया**: 35 किग्रा + **पोटाश**: 20 किग्रा।
• **पहली सिंचाई पर (30 दिन)**: **यूरिया**: 35 किग्रा प्रति एकड़।`
        : `🌼 **Mustard Fertilizer Schedule**:
• **At Sowing**: **SSP**: 100 kg (contains 11% Sulfur, augmenting oil recovery by 3–4%) + **Urea**: 35 kg + **MOP**: 20 kg.
• **At 1st Irrigation (30 DAS)**: Top dress **Urea**: 35 kg per acre.`;
    }

    return isHindiMode
      ? `🌼 **सरसों में माहू (चेपा) एवं सफेद रतुआ रोग की दवा**:

1. **माहू / चेपा कीट (Aphids)**:
   • जैसे ही पत्तियों या शाखाओं पर काले-हरे माहू दिखें: **डाइमेथोएट 30% EC (Rogor)** @ 1.5 मि.ली. प्रति लीटर पानी, या **इमिडाक्लोप्रिड 17.8% SL** @ 0.5 मि.ली./लीटर, या **थियामेथोक्सम 25% WG** @ 0.5 ग्राम/लीटर का तुरंत छिड़काव करें।
2. **सफेद रतुआ (White Rust) व अल्टरनेरिया झुलसा**:
   • **मैनकोज़ेब 75% WP** @ 2 ग्राम प्रति लीटर पानी का छिड़काव करें।
3. **जैविक नियंत्रण**: **नीम का तेल (10,000 PPM)** @ 5 मि.ली./लीटर पानी में घोलकर छिड़कें।`
      : `🌼 **Mustard Aphid & White Rust Management**:

1. **Mustard Aphid (*Lipaphis erysimi*)**:
   • Spray **Dimethoate 30% EC (Rogor)** @ 1.5 ml/L, or **Imidacloprid 17.8% SL** @ 0.5 ml/L, or **Thiamethoxam 25% WG** @ 0.5 g/L at the first appearance of aphid colonies on flower racemes.
2. **White Rust (*Albugo candida*)**:
   • Spray **Mancozeb 75% WP** @ 2.0 g/litre water.`;
  }

  // 6. CHILLI (मिर्च)
  if (crop === 'chilli') {
    return isHindiMode
      ? `🌶️ **मिर्च की फसल में पत्ती मुड़ना (चूड़ा-मुड़ा) एवं रोग नियंत्रण**:

1. **थ्रिप्स एवं पत्ती मुड़ना (Leaf Curl & Thrips)**:
   • **फिप्रोनिल 5% SC (Regent)** @ 2 मि.ली. प्रति लीटर पानी, अथवा
   • **डाइफेनथियुरॉन 50% WP (Pegasus)** @ 1.2 ग्राम/लीटर पानी, अथवा
   • **स्पिनोसाड 45% SC** @ 0.3 मि.ली./लीटर पानी का छिड़काव करें।
   • खेत में 15 नीले और 15 पीले चिपचिपे ट्रैप प्रति एकड़ लगाएं।
2. **फल सड़न व डाईबैक (Anthracnose / Dieback)**:
   • **एज़ोक्सीस्ट्रोबिन + डिफेनोकोनाज़ोल (Amistar Top)** @ 1 मि.ली./लीटर या **कॉपर ऑक्सीक्लोराइड 50% WP** @ 2.5 ग्राम/लीटर पानी।`
      : `🌶️ **Chilli Leaf Curl & Pest Management**:
1. **Thrips & Leaf Curl Complex**:
   • Spray **Fipronil 5% SC** @ 2 ml/L or **Diafenthiuron 50% WP (Pegasus)** @ 1.2 g/L or **Spinosad 45% SC** @ 0.3 ml/L.
   • Install blue sticky traps for thrips and yellow traps for whiteflies.
2. **Fruit Rot / Dieback**:
   • Spray **Azoxystrobin + Difenoconazole (Amistar Top)** @ 1 ml/L or **Copper Oxychloride 50% WP** @ 2.5 g/L.`;
  }

  // 7. MANGO (आम)
  if (crop === 'mango') {
    if (hasFruitDrop || /bor|बौर|फूल/.test(lower)) {
      return isHindiMode
        ? `🥭 **आम में बौर व फल झड़ने की समस्या का पक्का समाधान**:
1. **हार्मोनल छिड़काव**: मटर के दाने के बराबर फल बनने पर **प्लानोफिक्स (Alpha NAA 4.5% SL)** @ 4 मि.ली. प्रति 15 लीटर पानी (0.25 मि.ली./लीटर) में मिलाकर छिड़कें। (सावधानी: अधिक खुराक न डालें)।
2. **पोषक तत्व स्प्रे**: **बोरॉन 20%** @ 1.5 ग्राम/लीटर + **पोटाश (0:0:50)** @ 5 ग्राम/लीटर का पर्णीय छिड़काव करें।
3. **सिंचाई**: बौर खिलते समय भारी सिंचाई न करें; फल सेट होने के बाद हल्की सिंचाई शुरू करें।`
        : `🥭 **Mango Fruit & Flower Drop Remedy**:
1. **Plant Growth Regulator**: Spray **Planofix (Alpha NAA 4.5% SL)** @ 4 ml per 15 litres water (0.25 ml/L) at pea-sized fruit stage.
2. **Foliar Nutrition**: Mix **Boron 20%** @ 1.5 g/L + **SOP (0:0:50)** @ 5 g/L to strengthen fruit pedicels.
3. **Irrigation**: Avoid flood irrigation during active bloom; resume light watering post fruit set.`;
    }

    return isHindiMode
      ? `🥭 **आम की फसल में कीट व रोग प्रबंधन**:
1. **मधुआ कीट (Mango Hopper)**: बौर आते समय **इमिडाक्लोप्रिड 17.8% SL** @ 0.5 मि.ली./लीटर या **थियामेथोक्सम 25% WG** @ 0.5 ग्राम/लीटर का छिड़काव करें।
2. **चूर्णिल आसिता (Powdery Mildew - सफेद फफूंद)**: **घुलनशील गंधक (Sulphur 80% WDG)** @ 2 ग्राम/लीटर या **हेक्साकोनाज़ोल (Contaf)** @ 1.5 मि.ली./लीटर छिड़कें।
3. **फल मक्खी (Fruit Fly)**: फल पकते समय मिथाइल यूजेनॉल फेरोमोन ट्रैप (6 प्रति एकड़) लगाएं।`
      : `🥭 **Mango Pest & Disease Advisory**:
1. **Mango Hopper**: Spray **Imidacloprid 17.8% SL** @ 0.5 ml/L or **Thiamethoxam 25% WG** @ 0.5 g/L before panicle opening.
2. **Powdery Mildew**: Spray **Wettable Sulphur 80% WDG** @ 2 g/L or **Hexaconazole (Contaf)** @ 1.5 ml/L.
3. **Fruit Fly**: Hang Methyl Eugenol Pheromone traps @ 6 traps/acre during fruit ripening.`;
  }

  // 8. COTTON (कपास)
  if (crop === 'cotton') {
    return isHindiMode
      ? `🌿 **कपास में गुलाबी सुंडी एवं सफेद मक्खी नियंत्रण**:
1. **गुलाबी सुंडी (Pink Bollworm)**: **इमामेक्टिन बेंजोएट 5% SG** @ 5 ग्राम प्रति 10 लीटर पानी या **क्लोरांट्रानिलीप्रोल 18.5% SC** @ 0.4 मि.ली./लीटर का छिड़काव करें। खेत में फेरोमोन ट्रैप लगाएं।
2. **सफेद मक्खी (Whitefly)**: **उलाला (Flonicamid 50% WG)** @ 60 ग्राम प्रति एकड़ 200 लीटर पानी में छिड़कें।`
      : `🌿 **Cotton Pest Management**:
1. **Pink Bollworm**: Spray **Emamectin Benzoate 5% SG** @ 5 g/10L water or **Chlorantraniliprole 18.5% SC** @ 0.4 ml/L.
2. **Whitefly**: Spray **Flonicamid 50% WG (Ulala)** @ 60 g/acre in 200L water.`;
  }

  // 9. ONION (प्याज)
  if (crop === 'onion') {
    return isHindiMode
      ? `🧅 **प्याज में थ्रिप्स एवं बैंगनी धब्बा (Purple Blotch) का उपचार**:
1. **थ्रिप्स कीट (पत्तियों का मुड़ना व पीलापन)**: **फिप्रोनिल 5% SC** @ 2 मि.ली./लीटर पानी में थोड़ा स्टीकर (चिपकाने वाला गोंद) मिलाकर छिड़कें।
2. **बैंगनी धब्बा (Purple Blotch)**: **टेबुकोनाज़ोल 25.9% EC** @ 1.5 मि.ली./लीटर या **मैनकोज़ेब 75% WP** @ 2.5 ग्राम/लीटर पानी में छिड़कें।`
      : `🧅 **Onion Thrips & Purple Blotch Protocol**:
1. **Thrips**: Spray **Fipronil 5% SC** @ 2 ml/L mixed with agricultural adjuvant.
2. **Purple Blotch**: Spray **Tebuconazole 25.9% EC** @ 1.5 ml/L or **Mancozeb 75% WP** @ 2.5 g/L.`;
  }

  // 10. GRAM / CHICKPEA (चना)
  if (crop === 'gram') {
    return isHindiMode
      ? `🌱 **चना में घेंटे की इल्ली (Pod Borer) एवं उकठा रोग नियंत्रण**:
1. **घेंटे की इल्ली (Pod Borer)**: फलियां बनते ही **इमामेक्टिन बेंजोएट 5% SG** @ 4 ग्राम प्रति 10 लीटर पानी या **क्लोरांट्रानिलीप्रोल 18.5% SC** @ 0.3 मि.ली./लीटर पानी का छिड़काव करें। खेत में 'T' आकार की खूंटियां (Bird Perches) लगाएं।
2. **उकठा रोग (Wilt)**: बुआई पूर्व बीज को **ट्राइकोडर्मा विरिडी** @ 5-10 ग्राम/किग्रा बीज से उपचारित करें।`
      : `🌱 **Chickpea Pod Borer & Wilt Advisory**:
1. **Pod Borer (*Helicoverpa armigera*)**: Spray **Emamectin Benzoate 5% SG** @ 4 g/10L or **Chlorantraniliprole 18.5% SC** @ 0.3 ml/L at pod set.
2. **Wilt Management**: Pre-treat seed with **Trichoderma viride** @ 10 g/kg seed.`;
  }

  // -------------------------------------------------------------------
  // C. NON-CROP GENERAL TOPICS
  // -------------------------------------------------------------------

  // Soil Testing
  if (hasSoilTest) {
    return isHindiMode
      ? `🧪 **वैज्ञानिक मिट्टी परीक्षण (Soil Health Testing) विधि गाइड**:
1. **नमूना लेने का समय**: रबी या खरीफ फसल की कटाई के बाद खेत खाली होने पर।
2. **तरीका**: खेत में 8-10 अलग-अलग स्थानों पर 'V' आकार का 15 सेमी (6 इंच) गहरा गड्ढा बनाएं। दीवार से 1 इंच मोटी मिट्टी की परत ऊपर से नीचे तक छीलें।
3. **क्वार्टरिंग विधि**: सभी सैंपलों को मिलाकर गोल ढेर बनाएं, 4 भागों में बांटें और आमने-सामने के 2 भाग हटा दें। जब तक 500 ग्राम मिट्टी न बचे, यह दोहराएं।
4. **जांच केंद्र**: इसे कपड़े की थैली में भरकर निकटतम **KVK (कृषि विज्ञान केंद्र)** या **मृदा स्वास्थ्य प्रयोगशाला** में जमा करें।`
      : `🧪 **Scientific Soil Health Testing Guide**:
1. **Sampling Depth**: Dig 'V'-shaped pits 15 cm (6 inches) deep across 8–10 representative spots per acre.
2. **Quartering Method**: Thoroughly blend all samples into a uniform pile, quarter into 4 segments, and discard opposite segments until ~500 grams remains.
3. **Submission**: Pack in a clean cloth bag and submit to the nearest Krishi Vigyan Kendra (KVK).`;
  }

  // KCC Loan
  if (hasLoan) {
    return isHindiMode
      ? `💳 **किसान क्रेडिट कार्ड (KCC) 4% ऋण सुविधा**:
• **ब्याज दर**: केवल **4% वार्षिक** (7% सामान्य दर पर सरकार 3% की ब्याज छूट देती है यदि समय पर चुकता किया जाए)।
• **ऋण सीमा**: ₹3.00 लाख तक रियायती दर पर (₹1.60 लाख तक बिना किसी बंधक/Collateral के)।
• **दस्तावेज**: खतौनी/खसरा नकल, आधार कार्ड, पैन कार्ड और बैंक पासबुक।
• **आवेदन**: निकटतम बैंक शाखा (SBI, PNB, BoB) या PM-Kisan पोर्टल से सीधा आवेदन करें।`
      : `💳 **Kisan Credit Card (KCC) Subsidized Loan**:
• **Interest Rate**: Effective **4% per annum** with prompt repayment incentive.
• **Limit**: Up to ₹3.00 Lakh (Collateral-free limit up to ₹1.60 Lakh).
• **Documents**: Land records (Khatauni/Khasra), Aadhaar, PAN, and Bank passbook.`;
  }

  // Schemes
  if (hasScheme) {
    return isHindiMode
      ? `🏛️ **प्रमुख सरकारी कृषि योजनाएं**:
1. **PM-किसान सम्मान निधि**: ₹6,000 प्रति वर्ष (₹2,000 की 3 समान किस्तों में DBT द्वारा)।
2. **PM फसल बीमा योजना (PMFBY)**: खरीफ 2% और रबी 1.5% प्रीमियम पर पूर्ण फसल सुरक्षा।
3. **PM-KUSUM सोलर पंप योजना**: सोलर कृषि पंप लगाने पर 60% तक की भारी सरकारी सब्सिडी।
4. **SMAM कृषि यंत्रीकरण**: ट्रैक्टर, रोटावेटर, सीड ड्रिल पर 40% से 50% सब्सिडी।`
      : `🏛️ **Government Agriculture Welfare Schemes**:
1. **PM-Kisan**: ₹6,000/year direct financial support in 3 equal installments of ₹2,000.
2. **PMFBY**: Crop insurance at 1.5%–2% subsidized farmer premium.
3. **PM-KUSUM**: Up to 60% capital subsidy on agricultural solar pumps.`;
  }

  // Fruit/Flower Drop
  if (hasFruitDrop) {
    return isHindiMode
      ? `🥭 **फूल व फल झड़ने की समस्या का वैज्ञानिक इलाज**:
1. **हार्मोन स्प्रे**: **प्लानोफिक्स (Alpha NAA 4.5% SL)** @ 4 मि.ली. प्रति 15 लीटर पानी में मिलाकर छिड़कें।
2. **पोषक तत्व**: **बोरॉन 20%** @ 1.5 ग्राम/लीटर + **पोटाश (0:0:50)** @ 5 ग्राम/लीटर पानी का छिड़काव करें।
3. **नमी संतुलन**: फूल खिलते समय अत्यधिक जलभराव से बचें; हल्की सिंचाई बनाए रखें।`
      : `🥭 **Fruit & Flower Drop Prevention Advisory**:
1. **PGR Spray**: Spray **Planofix (Alpha NAA 4.5% SL)** @ 4 ml per 15L water (0.25 ml/L).
2. **Micronutrient Spray**: Mix **Boron 20%** @ 1.5 g/L + **SOP (0:0:50)** @ 5 g/L.`;
  }

  // Weed Control
  if (hasWeed) {
    return isHindiMode
      ? `🌾 **खरपतवार (घास/कचरा) नाशक दवा गाइड**:
• **गेहूं में खरपतवार**: बुआई के 30-35 दिन बाद **सल्फोसल्फ्यूरोन + मेटसल्फ्यूरोन (Total/Leader)** @ 16 ग्राम प्रति एकड़ 150 लीटर पानी में फ्लैट फैन नोजल से स्प्रे करें।
• **धान में खरपतवार**: रोपाई के 2-3 दिन में **प्रेटिलाक्लोर 50% EC** @ 500 मि.ली./एकड़ या 20 दिन बाद **बिस्पायरीबैक सोडियम (Nominee Gold)** @ 100 मि.ली./एकड़।`
      : `🌾 **Weed & Herbicide Management**:
• **Wheat**: Spray **Sulfosulfuron 75% + Metsulfuron 5% (Total)** @ 16 g/acre at 30–35 DAS.
• **Rice**: Pre-emergence **Pretilachlor 50% EC** @ 500 ml/acre or post-emergence **Bispyribac Sodium** @ 100 ml/acre.`;
  }

  // Organic bio-formulations
  if (hasOrganic) {
    return isHindiMode
      ? `🌿 **प्राकृतिक कीटनाशक: नीमास्त्र एवं जीवामृत बनाने की विधि**:
1. **नीमास्त्र (कीट नियंत्रण हेतु)**:
   • 5 किग्रा नीम के पत्ते + 5 लीटर गोमूत्र + 2 किग्रा ताजा गोबर को 100 लीटर पानी में 48 घंटे सड़ाएं। छानकर प्रति एकड़ स्प्रे करें।
2. **जीवामृत (मिट्टी की उर्वरता हेतु)**:
   • 200 लीटर पानी + 10 किग्रा गोबर + 10 लीटर गोमूत्र + 2 किग्रा गुड़ + 2 किग्रा बेसन + एक मुट्ठी खेत की मेड़ की मिट्टी। 4 दिन में तैयार घोल सिंचाई में बहाएं।`
      : `🌿 **Organic Bio-Formulations**:
1. **Neemastra**: 5 kg crushed neem leaves + 5L cow urine + 2 kg fresh cow dung in 100L water. Ferment 48 hours, filter and spray.
2. **Jeevamrit**: 200L water + 10 kg cow dung + 10L cow urine + 2 kg jaggery + 2 kg pulse flour + soil handful. Ferment 4 days and apply with irrigation.`;
  }

  // Termites
  if (hasTermite) {
    return isHindiMode
      ? `🐜 **दीमक (Termite) का पक्का इलाज**:
1. **खड़ी फसल में**: **फिप्रोनिल 0.3% GR (Regent)** @ 8-10 किग्रा प्रति एकड़ बालू में मिलाकर खेत में डालें और तुरंत सिंचाई करें, या **क्लोरपायरीफॉस 20% EC** @ 1.5 लीटर प्रति एकड़ सिंचाई के पानी के साथ बहाएं।
2. **बुआई पूर्व**: बीज को **इमिडाक्लोप्रिड 600 FS** @ 5 मि.ली./किग्रा बीज से उपचारित करें।`
      : `🐜 **Termite Management Protocol**:
1. **Standing Crop**: Broadcast **Fipronil 0.3% GR (Regent)** @ 8–10 kg/acre or apply **Chlorpyrifos 20% EC** @ 1.5 L/acre through irrigation water.
2. **Seed Treatment**: Dress seed with **Imidacloprid 600 FS** @ 5 ml/kg seed.`;
  }

  // Profit / Cost Reduction
  if (hasProfit) {
    return isHindiMode
      ? `💰 **खेती में कम लागत में ज्यादा कमाई के 4 उपाय**:
1. **मल्चिंग + ड्रिप सिंचाई**: 50% पानी और 40% खाद की बचत, खरपतवार 90% बंद; उत्पादन 35% बढ़ता है (सरकार से 55-70% सब्सिडी)।
2. **इंटरक्रॉपिंग (मिश्रित खेती)**: गन्ने या कपास के साथ मूंग/उड़द/आलू लगाकर ₹40,000–60,000 अतिरिक्त मुनाफा कमाएं।
3. **मिट्टी जांच आधारित संतुलित खाद**: फालतू यूरिया और DAP बंद करके ₹3,000/एकड़ बचाएं।
4. **उच्च मूल्य वाली फसलें**: 1 एकड़ में लहसुन, प्याज, शिमला मिर्च या सरसों जैसी नकदी फसलें लगाएं।`
      : `💰 **Farm Profit Maximization Strategies**:
1. **Drip Irrigation & Mulching**: Saves 50% water, eliminates weeds, increases yield 35% with state subsidies.
2. **Intercropping**: Pair main crops with short-duration pulses for extra profit per acre.
3. **Soil-Based Fertilizer Optimization**: Cut unneeded DAP/Urea to save ~₹3,000/acre.`;
  }

  // Sowing calendar
  if (hasSowing) {
    return isHindiMode
      ? `📅 **प्रमुख फसलों का सही बुआई समय**:
• **गेहूं**: 1 नवंबर से 25 नवंबर (समय पर बुआई सर्वोत्तम पैदावार देती है)।
• **सरसों**: 25 सितंबर से 20 अक्टूबर।
• **चना**: 10 अक्टूबर से 10 नवंबर।
• **आलू**: 15 अक्टूबर से 5 नवंबर।
• **धान (रोपाई)**: 20 जून से 15 जुलाई।`
      : `📅 **Major Sowing Windows**:
• **Wheat**: Nov 1 to Nov 25.
• **Mustard**: Sept 25 to Oct 20.
• **Chickpea (Gram)**: Oct 10 to Nov 10.
• **Potato**: Oct 15 to Nov 5.
• **Paddy**: June 20 to July 15.`;
  }

  // -------------------------------------------------------------------
  // D. SMART GENERAL ADVISORY
  // -------------------------------------------------------------------
  if (isHindiMode) {
    return `🌾 **कृषि दोस्त AI कृषि सलाहकार**:

आपके प्रश्न **"${raw}"** के संबंध में व्यावहारिक सलाह:
• **फसल पोषण**: खेत में मिट्टी जांच के अनुसार ही यूरिया, DAP और सूक्ष्म पोषक तत्वों (जिंक, सल्फर) का प्रयोग करें।
• **सिंचाई**: खेत में जलभराव न होने दें; नमी देखकर हल्की सिंचाई करें।
• **कीट व रोग सुरक्षा**: यदि किसी पौधे पर कीड़ा या धब्बा दिखे, तो ऊपर **कैमरा बटन** दबाकर तुरंत फोटो भेजें।
• **टोल-फ्री किसान हेल्पलाइन**: किसी भी तत्काल सरकारी सहायता के लिए **1800-180-1551 (Kisan Call Centre)** पर मुफ्त कॉल करें।`;
  } else if (langMode === 'hinglish') {
    return `🌾 **Krishi Dost AI Farmer Advisory**:

Aapke sawal **"${raw}"** ke context me:
• **Balanced Nutrition**: Soil test ke hisab se hi Urea, DAP aur Zinc dalein.
• **Pest / Disease Photo**: Agar patti ya fasal me koi bimari hai, toh upar **Camera icon** se photo upload karein for instant diagnosis.
• **Kisan Helpline**: Free helpline number par baat karein: **1800-180-1551 (Kisan Call Centre)**.`;
  } else {
    return `🌾 **Krishi Dost AI Agricultural Advisory**:

Regarding your query **"${raw}"**:
• **Balanced Nutrition**: Apply fertilizers based on soil test values to avoid wasteful input costs.
• **Disease Diagnostics**: Upload a clear photograph of any damaged leaves via the **Camera button** above for instant analysis.
• **National Helpline**: Call the Government Kisan Call Centre free at **1800-180-1551** for instant local agronomic advice.`;
  }
};
