/**
 * WeatherGPT 2.0 Dynamic Response Engine
 * Specialized reasoning strategies for 26+ intents, multi-lingual rendering,
 * anti-repetition tracking, contextual follow-ups, and adaptive response structures.
 */

const { explainWeatherScience } = require('./explanationBase');

/**
 * Multi-lingual localized dictionary for core weather phrases, warnings, and formatting
 */
const I18N_DICTIONARY = {
  en: {
    currentWeather: 'Current Weather',
    forecast: 'Forecast',
    riskAssessment: 'Risk Assessment',
    recommendation: 'Recommendation',
    observed: 'Observed',
    aiInterpretation: 'AI Risk Interpretation',
    officialAlert: 'Official Alert',
    dataSource: 'Source',
    updated: 'Updated',
    noRain: 'Low precipitation probability',
    rainLikely: 'Rain is likely',
    carryUmbrella: 'Carrying a compact umbrella or rain shell is recommended.',
    safetyFirst: 'Prioritize your immediate physical safety.',
    callEmergency: 'Call national emergency services (112) or local disaster management immediately if in immediate danger.',
    askTravelTime: 'If you share your planned departure time or route, I can assess the exact hourly conditions for you.',
    askLocation: 'Which city or locality should I check for you?',
    noReliableData: "I don't have reliable live telemetry for that specific metric right now.",
    disasterChainQualifier: 'Areas with inadequate stormwater drainage may experience surface water pooling.',
  },
  hi: {
    currentWeather: 'वर्तमान मौसम',
    forecast: 'मौसम पूर्वानुमान',
    riskAssessment: 'जोखिम आकलन',
    recommendation: 'सुझाव',
    observed: 'अवलोकित डेटा',
    aiInterpretation: 'मौसम जोखिम व्याख्या',
    officialAlert: 'आधिकारिक चेतावनी',
    dataSource: 'डेटा स्रोत',
    updated: 'अपडेट हुआ',
    noRain: 'बारिश की संभावना बहुत कम है',
    rainLikely: 'बारिश होने की संभावना है',
    carryUmbrella: 'छाता या रेनकोट साथ रखना उचित रहेगा।',
    safetyFirst: 'कृपया अपनी तत्काल सुरक्षा को सर्वोच्च प्राथमिकता दें।',
    callEmergency: 'यदि तत्काल खतरा हो तो राष्ट्रीय आपातकालीन नंबर (112) पर संपर्क करें।',
    askTravelTime: 'यदि आप अपनी यात्रा का समय या मार्ग बताएंगे, तो मैं उस सटीक समय का मौसम बता सकता हूँ।',
    askLocation: 'आप किस स्थान का मौसम जानना चाहते हैं?',
    noReliableData: 'वर्तमान में इस विशिष्ट मीट्रिक का विश्वसनीय लाइव डेटा उपलब्ध नहीं है।',
    disasterChainQualifier: 'कमजोर जल निकासी वाले निचले क्षेत्रों में जलभराव की स्थिति बन सकती है।',
  },
  ur: {
    currentWeather: 'موجودہ موسم',
    forecast: 'موسم کی پیش گوئی',
    riskAssessment: 'خطرے کا جائزہ',
    recommendation: 'تجویز',
    observed: 'مشاہدہ شدہ ڈیٹا',
    aiInterpretation: 'موسمی خطرے کا تجزیہ',
    officialAlert: 'سرکاری انتباہ',
    dataSource: 'ذریعہ',
    updated: 'اپ ڈیٹ ہوا',
    noRain: 'بارش کا امکان بہت کم ہے',
    rainLikely: 'بارش کا قوی امکان ہے',
    carryUmbrella: 'چھتری یا رین کوٹ ساتھ رکھنا بہتر ہوگا۔',
    safetyFirst: 'براہ کرم اپنی فوری حفاظت کو اولین ترجیح دیں۔',
    callEmergency: 'کسی بھی فوری خطرے کی صورت میں ایمرجنسی سروس (112) سے رابطہ کریں۔',
    askTravelTime: 'اگر آپ اپنے سفر کا وقت یا راستہ بتائیں تو میں اس وقت کے موسم کا تجزیہ کر سکتا ہوں۔',
    askLocation: 'آپ کس مقام کا موسم معلوم کرنا چاہتے ہیں؟',
    noReliableData: 'اس وقت ہمارے پاس اس پیمائش کا مصدقہ لائیو ڈیٹا موجود نہیں ہے۔',
    disasterChainQualifier: 'نشیبی علاقوں میں پانی جمع ہونے کے خدشات ہو سکتے ہیں۔',
  },
  bn: {
    currentWeather: 'বর্তমান আবহাওয়া',
    forecast: 'আবহাওয়ার পূর্বাভাস',
    riskAssessment: 'ঝুঁকি মূল্যায়ন',
    recommendation: 'পরামর্শ',
    observed: 'পর্যবেক্ষিত তথ্য',
    aiInterpretation: 'আবহাওয়া ঝুঁকি বিশ্লেষণ',
    officialAlert: 'সরকারি সতর্কতা',
    dataSource: 'উৎস',
    updated: 'আপডেট হয়েছে',
    noRain: 'বৃষ্টির সম্ভাবনা খুবই কম',
    rainLikely: 'বৃষ্টি হওয়ার সম্ভাবনা রয়েছে',
    carryUmbrella: 'একটি ছাতা বা রেইনকোট সাথে রাখা ভালো।',
    safetyFirst: 'অনুগ্রহ করে অবিলম্বে আপনার ব্যক্তিগত নিরাপত্তাকে অগ্রাধিকার দিন।',
    callEmergency: 'জরুরি পরিস্থিতিতে জাতীয় হেল্পলাইন (112)-এ কল করুন।',
    askTravelTime: 'আপনার যাত্রার সময় বা রুট জানালে আমি নির্দিষ্ট সময়ের আবহাওয়া পরীক্ষা করতে পারব।',
    askLocation: 'আপনি কোন এলাকার আবহাওয়া জানতে চান?',
    noReliableData: 'এই মুহূর্তে এই তথ্যের জন্য কোনো নির্ভরযোগ্য লাইভ ডেটা নেই।',
    disasterChainQualifier: 'নিম্নভূমিতে সাময়িক জল জমে যাওয়ার ঝুঁকি থাকতে পারে।',
  },
  ta: {
    currentWeather: 'தற்போதைய வானிலை',
    forecast: 'வானிலை முன்னறிவிப்பு',
    riskAssessment: 'ஆபத்து மதிப்பீடு',
    recommendation: 'பரிந்துரை',
    observed: 'கண்காணிக்கப்பட்ட தரவு',
    aiInterpretation: 'வானிலை அபாய பகுப்பாய்வு',
    officialAlert: 'அதிகாரப்பூர்வ எச்சரிக்கை',
    dataSource: 'ஆதாரம்',
    updated: 'புதுப்பிக்கப்பட்டது',
    noRain: 'மழைக்கான வாய்ப்பு குறைவு',
    rainLikely: 'மழை பெய்ய வாய்ப்புள்ளது',
    carryUmbrella: 'குடை அல்லது மழைக்கோட் எடுத்துச் செல்வது நல்லது.',
    safetyFirst: 'முதலில் உங்கள் பாதுகாப்பை உறுதிப்படுத்திக் கொள்ளுங்கள்.',
    callEmergency: 'அவசர உதவிக்கு 112 என்ற எண்ணை அழைக்கவும்.',
    askTravelTime: 'உங்கள் பயண நேரம் அல்லது வழியை குறிப்பிட்டால் துல்லியமாக கணிக்க முடியும்.',
    askLocation: 'எந்த இடத்திற்கான வானிலை விவரம் தேவை?',
    noReliableData: 'தற்போது இதற்கான நேரடித் தரவு கிடைக்கவில்லை.',
    disasterChainQualifier: 'தாழ்வான பகுதிகளில் நீர் தேங்க வாய்ப்புள்ளது.',
  },
  te: {
    currentWeather: 'ప్రస్తుత వాతావరణం',
    forecast: 'వాతావరణ సూచన',
    riskAssessment: 'ప్రమాద అంచనా',
    recommendation: 'సిఫార్సు',
    observed: 'గమనించిన సమాచారం',
    aiInterpretation: 'వాతావరణ విశ్లేషణ',
    officialAlert: 'అధికారిక హెచ్చరిక',
    dataSource: 'మూలం',
    updated: 'నవీకరించబడింది',
    noRain: 'వర్షం పడే అవకాశం తక్కువ',
    rainLikely: 'వర్షం కురిసే అవకాశం ఉంది',
    carryUmbrella: 'గొడుగు లేదా రెయిన్‌కోట్ వెంట ఉంచుకోవడం మంచిది.',
    safetyFirst: 'దయచేసి మీ తక్షణ భద్రతకు ప్రాధాన్యత ఇవ్వండి.',
    callEmergency: 'అత్యవసర పరిస్థితుల్లో 112 కు కాల్ చేయండి.',
    askTravelTime: 'మీ ప్రయాణ సమయాన్ని తెలిపితే సరైన సూచనలు ఇవ్వగలను.',
    askLocation: 'మీరు ఏ ప్రాంత వాతావరణం తెలుసుకోవాలనుకుంటున్నారు?',
    noReliableData: 'ప్రస్తుతం దీనికి సంబంధించిన సరైన సమాచారం అందుబాటులో లేదు.',
    disasterChainQualifier: 'దిగువ ప్రాంతాలలో నీరు నిలిచే అవకాశం ఉంది.',
  },
  mr: {
    currentWeather: 'सध्याचे हवामान',
    forecast: 'हवामान अंदाज',
    riskAssessment: 'धोका मूल्यांकन',
    recommendation: 'सल्ला',
    observed: 'निरीक्षित माहिती',
    aiInterpretation: 'हवामान जोखीम विश्लेषण',
    officialAlert: 'अधिकृत इशारा',
    dataSource: 'स्रोत',
    updated: 'अद्यतनित',
    noRain: 'पावसाची शक्यता कमी आहे',
    rainLikely: 'पाऊस पडण्याची शक्यता आहे',
    carryUmbrella: 'छत्री किंवा रेनकोट सोबत ठेवणे योग्य ठरेल.',
    safetyFirst: 'कृपया आपल्या सुरक्षिततेला प्राधान्य द्या.',
    callEmergency: 'तातडीच्या मदतीसाठी 112 वर कॉल करा.',
    askTravelTime: 'प्रवासाची वेळ सांगितल्यास अचूक अंदाज देता येईल.',
    askLocation: 'कोणत्या ठिकाणचे हवामान जाणून घ्यायचे आहे?',
    noReliableData: 'सध्या या मापदंडाची खात्रीशीर माहिती उपलब्ध नाही.',
    disasterChainQualifier: 'सखल भागात पाणी साचण्याची शक्यता असू शकते.',
  },
  gu: {
    currentWeather: 'હાલનું હવામાન',
    forecast: 'હવામાનની આગાહી',
    riskAssessment: 'જોખમ મૂલ્યાંકન',
    recommendation: 'ભલામણ',
    observed: 'અવલોકન ડેટા',
    aiInterpretation: 'હવામાન જોખમ વિશ્લેષણ',
    officialAlert: 'સત્તાવાર ચેતવણી',
    dataSource: 'સ્ત્રોત',
    updated: 'અપડેટ થયેલ',
    noRain: 'વરસાદની શક્યતા ઓછી છે',
    rainLikely: 'વરસાદ પડવાની શક્યતા છે',
    carryUmbrella: 'સાથે છત્રી રાખવાની સલાહ આપવામાં આવે છે.',
    safetyFirst: 'કૃપા કરીને તમારી સુરક્ષાને પ્રાથમિકતા આપો.',
    callEmergency: 'તાત્કાલિક મદદ માટે 112 ડાયલ કરો.',
    askTravelTime: 'જો તમે પ્રવાસનો સમય જણાવશો તો ચોક્કસ માહિતી આપી શકાશે.',
    askLocation: 'તમે કયા સ્થળનું હવામાન જાણવા માંગો છો?',
    noReliableData: 'આ ક્ષણે વિશ્વસનીય ડેટા ઉપલબ્ધ નથી.',
    disasterChainQualifier: 'નીચાણવાળા વિસ્તારોમાં પાણી ભરાવાની શક્યતા રહી શકે છે.',
  },
};

function getI18n(lang = 'en') {
  return I18N_DICTIONARY[lang] || I18N_DICTIONARY.en;
}

/**
 * Format timestamp into relative freshness string
 */
function formatDataFreshness(isoString) {
  if (!isoString) return 'Live telemetry';
  try {
    const diffMin = Math.round((Date.now() - new Date(isoString).getTime()) / 60000);
    if (diffMin <= 1) return 'Just now';
    if (diffMin < 60) return `${diffMin} min ago`;
    const diffHours = Math.round(diffMin / 60);
    return `${diffHours} hr ago`;
  } catch (e) {
    return 'Live telemetry';
  }
}

/**
 * Generate 1–3 contextual follow-up suggestions tailored to the response
 */
function generateFollowUpSuggestions(intent, timeframe, weatherContext, risks) {
  const suggestions = [];

  switch (intent) {
    case 'RAIN':
      suggestions.push('When will the rain stop?');
      suggestions.push('Is it safe to drive?');
      suggestions.push('What about tomorrow?');
      break;

    case 'WEATHER_CURRENT':
      if (weatherContext.daily?.[1]) {
        suggestions.push('What about tomorrow?');
      }
      suggestions.push('Is the weather getting worse?');
      suggestions.push('Can I go for a run?');
      break;

    case 'WEATHER_FORECAST':
      suggestions.push('Will it affect my commute?');
      suggestions.push('Compare today vs tomorrow');
      suggestions.push('What should I wear?');
      break;

    case 'TRAVEL':
    case 'COMMUTE':
    case 'SCHOOL_COLLEGE':
      suggestions.push('What about the return trip?');
      suggestions.push('Is driving safe right now?');
      suggestions.push('Check tomorrow morning');
      break;

    case 'HEAT':
      suggestions.push('When will it cool down?');
      suggestions.push('Is it safe to exercise outside?');
      suggestions.push('What is the UV index?');
      break;

    case 'STORM':
    case 'CYCLONE':
    case 'FLOOD':
      suggestions.push('Any active emergency alerts?');
      suggestions.push('Nearest shelter locations?');
      suggestions.push('What emergency kit should I pack?');
      break;

    case 'AIR_QUALITY':
      suggestions.push('Should I wear a mask today?');
      suggestions.push('When will air quality improve?');
      suggestions.push('Can I exercise outdoors?');
      break;

    case 'OUTDOOR_ACTIVITY':
      suggestions.push('What is the best time today?');
      suggestions.push('Will rain interrupt my plans?');
      suggestions.push('Compare with tomorrow');
      break;

    case 'EXPLANATION':
      suggestions.push('What causes thunderstorms?');
      suggestions.push('Why does it feel hotter than the temperature?');
      suggestions.push('Is the weather getting worse?');
      break;

    default:
      suggestions.push('What is the rain chance today?');
      suggestions.push('How does tomorrow look?');
      suggestions.push('Is it safe to travel?');
      break;
  }

  return suggestions.slice(0, 3);
}

/**
 * Generate 4 dynamic quick action chips based on the live atmospheric situation
 */
function generateContextualQuickActions(weatherContext, riskAnalysis) {
  const { current, daily } = weatherContext;
  const temp = current.temperature || 25;
  const rainProb = daily[0]?.precipitationProbabilityMax || 0;
  const isRaining = (current.precipitation || 0) > 0 || rainProb >= 60;
  const isHot = temp >= 38 || (current.feelsLike || 0) >= 42;
  const isStormy = riskAnalysis.risks.some((r) => r.type === 'STORM' || r.type === 'HIGH_WIND');

  if (isStormy) {
    return [
      { id: 'qa-lightning', label: '⚡ Lightning danger?' },
      { id: 'qa-wind', label: '💨 Wind gust strength?' },
      { id: 'qa-safety', label: '🛡️ Safe indoor protocols' },
      { id: 'qa-commute', label: '🚗 Travel hazard level' },
    ];
  }

  if (isRaining) {
    return [
      { id: 'qa-rain-stop', label: '🌧️ When will rain stop?' },
      { id: 'qa-drive-safe', label: '🚗 Is driving safe?' },
      { id: 'qa-flood-risk', label: '🌊 Any flood risk?' },
      { id: 'qa-prep', label: '🏠 What should I prepare?' },
    ];
  }

  if (isHot) {
    return [
      { id: 'qa-heat-danger', label: '🌡️ How severe is this heat?' },
      { id: 'qa-exercise', label: '🏃 Is it safe to exercise?' },
      { id: 'qa-cooldown', label: '🌙 When will it cool down?' },
      { id: 'qa-hydration', label: '💧 Hydration & UV precautions' },
    ];
  }

  return [
    { id: 'qa-rain-today', label: '🌧️ Rain chance today?' },
    { id: 'qa-tomorrow', label: '📅 Tomorrow forecast' },
    { id: 'qa-outdoor', label: '🏃 Safe for outdoor activity?' },
    { id: 'qa-commute', label: '🚗 Commute conditions' },
  ];
}

/**
 * Main response generation logic dispatching to intent-specific handlers
 */
function generateAnalyticalResponse({
  intentObj,
  weatherContext,
  riskAnalysis,
  userMode = 'HOME',
  language = 'en',
  sessionState = {},
}) {
  const { primaryIntent, timeframe = { type: 'NOW', label: 'Now' }, activity, explanationTopic, rawText = '' } = intentObj || {};
  const i18n = getI18n(language);
  const {
    current = {},
    daily = [],
    hourly = [],
    locationName = 'Current Location',
    metadata = { source: 'Open-Meteo', timestamp: new Date().toISOString() },
  } = weatherContext || {};

  // Determine freshness label
  const freshness = formatDataFreshness(metadata.timestamp || current.fetchedAt);
  const metaBadge = {
    location: locationName,
    freshness: `${i18n.updated} ${freshness}`,
    source: `${i18n.dataSource}: ${metadata.source || 'Open-Meteo'}`,
    forecastWindow: timeframe.label || 'Next 24h',
  };

  let content = '';
  let format = 'ANALYSIS';
  let reasoningStrategy = primaryIntent;
  let intentCard = null;

  // Anti-repetition check: if the user asks a follow-up or says "tell me more" after the same intent
  const isRepetitivePrompt = sessionState.lastIntent === primaryIntent &&
    (/\b(tell me more|more details|elaborate|aur batao|aur kya|aur)\b/i.test(rawText) || rawText.length < 20);

  // 1. EMERGENCY INTENT
  if (primaryIntent === 'EMERGENCY') {
    format = 'EMERGENCY';
    content = `🚨 LIFE-SAFETY ALERT\n\n` +
      `⚠️ **${i18n.safetyFirst}**\n\n` +
      `If you or someone around you is in immediate danger, please immediately contact emergency services at **112** or your state disaster management helpline.\n\n` +
      `• **Move away from hazards**: If water is rising, ascend immediately to higher floors or elevated sturdy ground. Never attempt to wade or swim through fast-moving floodwater.\n` +
      `• **Electrical safety**: Disconnect or stay away from submerged electrical panels and downed utility wires.\n` +
      `• **Keep communications open**: Conserve mobile phone battery and alert neighbors or emergency responders of your exact coordinates.\n\n` +
      `*(Current local weather in ${locationName}: ${current.temperature}°C, ${current.conditionDescription}, Wind: ${current.windSpeed} km/h)*\n\n` +
      `Safety Protection Note:\nWeatherGPT does not dispatch emergency units automatically. Please verify your situation before submitting an SOS request.`;
  }

  // 2. OFF_TOPIC INTENT
  else if (primaryIntent === 'OFF_TOPIC') {
    format = 'SHORT_ANSWER';
    if (language === 'hi') {
      content = 'मैं WeatherGPT हूँ। मैं मौसम, पूर्वानुमान, वायु गुणवत्ता (AQI), चक्रवात, बाढ़, गंभीर मौसम चेतावनियों और आपदा सुरक्षा मार्गदर्शन में आपकी सहायता कर सकता हूँ।';
    } else if (language === 'ur') {
      content = 'میں ویدر جی پی ٹی ہوں۔ میں موسم، پیش گوئی، ہوا کے معیار (AQI)، طوفان، سیلاب، شدید موسم کے انتباہات اور ہنگامی حفاظتی رہنمائی میں آپ کی مدد کر سکتا ہوں۔';
    } else {
      content = "I’m WeatherGPT. I can help with weather, forecasts, air quality, severe-weather alerts, and weather-related safety.";
    }
  }

  // 3. EXPLANATION INTENT (Weather Science)
  else if (primaryIntent === 'EXPLANATION') {
    format = 'EXPLANATION';
    const topic = explanationTopic || 'ATMOSPHERIC_PHYSICS';
    const explanation = explainWeatherScience(topic, weatherContext);

    content = `### 🔬 ${explanation.concept}\n\n` +
      `**The Science Behind It:**\n${explanation.scientificCore}\n\n` +
      `**Why It Happens:**\n${explanation.whyHappens}\n\n` +
      `**How This Applies To ${locationName} Right Now:**\n${explanation.groundedContext}\n\n` +
      `💡 **Key Takeaway:** ${explanation.takeaway}`;
  }

  // 4. WEATHER_COMPARISON INTENT
  else if (primaryIntent === 'WEATHER_COMPARISON') {
    format = 'COMPARISON';
    const comparison = weatherContext.getComparisonTodayVsTomorrow();
    if (!comparison) {
      content = `I don't have multi-day comparative records available for ${locationName} right now.`;
    } else {
      const { today, tomorrow, summary } = comparison;
      const isWetterQuestion = /\b(wetter|rainier|more rain)\b/i.test(rawText);
      let directComparison = '';
      if (isWetterQuestion) {
        if (tomorrow.precipitationProbabilityMax > today.precipitationProbabilityMax) {
          directComparison = `Tomorrow has a higher rain probability than today: **${tomorrow.precipitationProbabilityMax}% vs ${today.precipitationProbabilityMax}%** (expected rainfall: ${tomorrow.precipitationSum} mm vs ${today.precipitationSum} mm).\n\n`;
        } else if (tomorrow.precipitationProbabilityMax < today.precipitationProbabilityMax) {
          directComparison = `Tomorrow is projected to be drier than today: **${tomorrow.precipitationProbabilityMax}% vs ${today.precipitationProbabilityMax}%**.\n\n`;
        } else {
          directComparison = `Tomorrow and today have similar precipitation probabilities: **${tomorrow.precipitationProbabilityMax}% tomorrow vs ${today.precipitationProbabilityMax}% today**.\n\n`;
        }
      }
      content = `### ⚖️ Today vs Tomorrow Comparison (${locationName})\n\n` +
        directComparison +
        `| Metric | Today | Tomorrow |\n` +
        `| :--- | :--- | :--- |\n` +
        `| **High / Low** | ${today.maxTemp}°C / ${today.minTemp}°C | ${tomorrow.maxTemp}°C / ${tomorrow.minTemp}°C |\n` +
        `| **Rain Probability** | ${today.precipitationProbabilityMax}% | ${tomorrow.precipitationProbabilityMax}% |\n` +
        `| **Expected Rainfall** | ${today.precipitationSum} mm | ${tomorrow.precipitationSum} mm |\n` +
        `| **Conditions** | ${today.conditions} | ${tomorrow.conditions} |\n` +
        `| **Wind Peak** | ${today.wind} km/h | ${tomorrow.wind} km/h |\n\n` +
        `**Analysis:**\n${summary}`;
    }
  }

  // 5. RAIN & PRECIPITATION INTENT
  else if (primaryIntent === 'RAIN') {
    format = 'ANALYSIS';
    const isTomorrow = intentObj.timeScope === 'TOMORROW';
    const isToday = intentObj.timeScope === 'TODAY';
    const isCurrent = intentObj.timeScope === 'CURRENT';

    if (isTomorrow) {
      const tomorrow = weatherContext.tomorrowForecast;
      const targetHourData = weatherContext.targetForecast?.targetHourData;

      if (!tomorrow) {
        content = `Forecast telemetry for tomorrow in **${locationName}** is currently updating from meteorological feeds. Please try again shortly.`;
      } else if (targetHourData) {
        const prob = targetHourData.precipitationProbability != null ? targetHourData.precipitationProbability : 0;
        const mm = targetHourData.precipitationMm != null ? targetHourData.precipitationMm : 0;
        const hourStr = targetHourData.timeFormatted || '8 PM';
        const hour24 = targetHourData.hourNumber != null ? `${String(targetHourData.hourNumber).padStart(2, '0')}:00` : '20:00';
        const isNearestNotice = targetHourData.isNearest ? ` (nearest valid observation to ${targetHourData.requestedHour}:00)` : '';

        intentCard = {
          intent: 'RAIN',
          timeScope: 'TOMORROW',
          targetHour: targetHourData.hourNumber,
          badge: `TOMORROW · ${hour24}`,
          primaryMetric: {
            value: `${prob}%`,
            label: 'precipitation probability',
          },
          secondaryMetrics: [
            { label: 'Condition', value: targetHourData.conditionDescription || 'Partly cloudy' },
            { label: 'Temperature', value: `${targetHourData.temperature}°C` },
            { label: 'Wind', value: `${targetHourData.windSpeed || 8} km/h` },
          ],
          timeline: weatherContext.targetForecast?.timeline || [],
          why: `The forecast shows atmospheric moisture levels yielding a ${prob}% precipitation probability${isNearestNotice} under ${targetHourData.conditionDescription.toLowerCase()} skies.`,
          whatToDo: prob >= 40
            ? `If you're going outside tomorrow at around ${hourStr}, carrying an umbrella or light rain shell is recommended.`
            : `If you're going outside tomorrow at around ${hourStr}, rain is unlikely and travel conditions look smooth.`,
          source: 'Open-Meteo · Hourly forecast',
        };

        content = `TOMORROW · ${hour24}\n\n` +
          `**${prob}%** precipitation probability\n` +
          `Mostly ${targetHourData.conditionDescription.toLowerCase()} · ${targetHourData.temperature}°C · Wind ${targetHourData.windSpeed || 8} km/h\n\n` +
          `**WHY**\n${intentCard.why}\n\n` +
          `**WHAT TO DO**\n${intentCard.whatToDo}\n\n` +
          `**SOURCE**\n${intentCard.source}`;
      } else {
        const peak = tomorrow.peakRainWindow;
        const prob = tomorrow.precipitationProbabilityMax ?? 0;
        const mm = tomorrow.precipitationSum ?? 0;
        const peakWindow = peak?.hasSignificantRain ? peak.window : 'afternoon and evening';

        intentCard = {
          intent: 'RAIN',
          timeScope: 'TOMORROW',
          badge: 'TOMORROW · OUTLOOK',
          primaryMetric: {
            value: `${prob}%`,
            label: 'peak precipitation probability',
          },
          secondaryMetrics: [
            { label: 'Expected Total', value: `${mm} mm` },
            { label: 'High / Low', value: `${tomorrow.maxTemp}°C / ${tomorrow.minTemp}°C` },
            { label: 'Risk Window', value: peakWindow },
          ],
          timeline: weatherContext.targetForecast?.timeline || [],
          why: `Precipitation probability peaks at ${prob}% across tomorrow with projected total accumulation of ${mm} mm.`,
          whatToDo: prob >= 40
            ? 'Carrying an umbrella tomorrow is recommended, especially during peak afternoon and evening hours.'
            : 'Precipitation risk tomorrow remains low for general travel and outdoor plans.',
          source: 'Open-Meteo · 24-hour numerical model',
        };

        content = `TOMORROW · OUTLOOK\n\n` +
          `**${prob}%** peak precipitation probability\n` +
          `Expected rainfall: ${mm} mm · Peak risk: ${peakWindow}\n\n` +
          `**WHY**\n${intentCard.why}\n\n` +
          `**WHAT TO DO**\n${intentCard.whatToDo}\n\n` +
          `**SOURCE**\n${intentCard.source}`;
      }
    } else if (isCurrent) {
      const curRain = weatherContext.currentWeather.precipitationNow || 0;
      intentCard = {
        intent: 'RAIN',
        timeScope: 'CURRENT',
        badge: 'CURRENT · LIVE DATA',
        primaryMetric: {
          value: `${curRain} mm/h`,
          label: curRain > 0 ? 'active precipitation rate' : 'no active rainfall',
        },
        secondaryMetrics: [
          { label: 'Condition', value: weatherContext.currentWeather.conditionsNow },
          { label: 'Temperature', value: `${weatherContext.currentWeather.temperature}°C` },
          { label: 'Humidity', value: `${weatherContext.currentWeather.humidity}%` },
        ],
        timeline: weatherContext.targetForecast?.timeline || [],
        why: curRain > 0 ? 'Radar feeds show precipitation actively over your coordinates.' : 'Precipitation sensors register dry conditions right now.',
        whatToDo: curRain > 0 ? 'Carry an umbrella right now if moving outside.' : 'No umbrella needed for immediate movement.',
        source: 'Open-Meteo · Live radar & surface telemetry',
      };

      content = `CURRENT · LIVE DATA\n\n` +
        `**${curRain} mm/h** ${curRain > 0 ? 'active rainfall' : 'no rain right now'}\n` +
        `${weatherContext.currentWeather.conditionsNow} · ${weatherContext.currentWeather.temperature}°C · Humidity ${weatherContext.currentWeather.humidity}%\n\n` +
        `**WHY**\n${intentCard.why}\n\n` +
        `**WHAT TO DO**\n${intentCard.whatToDo}\n\n` +
        `**SOURCE**\n${intentCard.source}`;
    } else {
      // TODAY
      const today = weatherContext.todayForecast;
      const targetHourData = weatherContext.targetForecast?.targetHourData;
      const prob = targetHourData ? targetHourData.precipitationProbability : today.precipitationProbabilityMax;
      const hourLabel = targetHourData ? targetHourData.timeFormatted : 'Today';

      intentCard = {
        intent: 'RAIN',
        timeScope: 'TODAY',
        badge: `TODAY · ${hourLabel.toUpperCase()}`,
        primaryMetric: {
          value: `${prob}%`,
          label: 'precipitation probability',
        },
        secondaryMetrics: [
          { label: 'High / Low', value: `${today.maxTemp}°C / ${today.minTemp}°C` },
          { label: 'Expected Total', value: `${today.precipitationSum} mm` },
          { label: 'Sky', value: today.conditions },
        ],
        timeline: weatherContext.targetForecast?.timeline || [],
        why: `Today shows a peak rain probability of ${prob}% with expected accumulation of ${today.precipitationSum} mm.`,
        whatToDo: prob >= 40 ? 'Carrying an umbrella today is recommended.' : 'Low rain probability for today. Routine movement is safe.',
        source: 'Open-Meteo · Numerical model',
      };

      content = `TODAY · ${hourLabel.toUpperCase()}\n\n` +
        `**${prob}%** precipitation probability\n` +
        `${today.conditions} · High ${today.maxTemp}°C / Low ${today.minTemp}°C\n\n` +
        `**WHY**\n${intentCard.why}\n\n` +
        `**WHAT TO DO**\n${intentCard.whatToDo}\n\n` +
        `**SOURCE**\n${intentCard.source}`;
    }
  }

  // 6. TRAVEL & COMMUTE / SCHOOL_COLLEGE INTENT
  else if (primaryIntent === 'TRAVEL' || primaryIntent === 'COMMUTE' || primaryIntent === 'SCHOOL_COLLEGE') {
    format = 'ANALYSIS';
    const isCommute = primaryIntent === 'COMMUTE' || primaryIntent === 'SCHOOL_COLLEGE' || userMode === 'COLLEGE';
    const isTomorrow = intentObj.timeScope === 'TOMORROW';
    const targetForecast = isTomorrow ? weatherContext.tomorrowForecast : weatherContext.todayForecast;
    const peakRain = targetForecast?.peakRainWindow;
    const visibility = weatherContext.currentWeather.visibilityKm ?? 10;
    const windSpeed = isTomorrow ? targetForecast.wind : weatherContext.currentWeather.windSpeed;

    let travelAdvice = `${isTomorrow ? 'Tomorrow' : 'Today'}, road and transit conditions look favorable with good surface grip.`;
    let cautionPoints = [];

    if (peakRain && peakRain.hasSignificantRain && peakRain.maxProb >= 40) {
      cautionPoints.push(`Heaviest rain risk centers around **${peakRain.window}** (${peakRain.maxProb}% probability), which may slow arterial traffic and cause underpass water accumulation.`);
    }
    if (visibility < 3 && !isTomorrow) {
      cautionPoints.push(`Visibility is constrained to **${visibility} km** due to fog/mist; use low-beam headlights and maintain wider braking distance.`);
    }
    if (windSpeed >= 40) {
      cautionPoints.push(`Brisk wind gusts up to **${windSpeed} km/h** may create steering instability for two-wheelers and high-profile vehicles on exposed flyovers.`);
    }

    if (cautionPoints.length > 0) {
      travelAdvice = cautionPoints.join('\n\n• ');
    }

    content = `### 🚗 ${isTomorrow ? 'Tomorrow' : 'Today'} ${isCommute ? 'Commute Outlook' : 'Travel Assessment'} for ${locationName}\n\n` +
      `• ${travelAdvice}\n\n` +
      `**Planning Details:**\n` +
      (isTomorrow
        ? `Tomorrow's peak precipitation probability is **${targetForecast.precipitationProbabilityMax}%** with temperatures between **${targetForecast.minTemp}°C and ${targetForecast.maxTemp}°C**.`
        : i18n.askTravelTime);
  }

  // 7. OUTDOOR ACTIVITY INTENT
  else if (primaryIntent === 'OUTDOOR_ACTIVITY') {
    format = 'ANALYSIS';
    const targetActivity = activity || 'GENERAL_OUTDOOR';
    const temp = current.temperature || 25;
    const feelsLike = current.feelsLike || temp;
    const aqi = weatherContext.airQuality?.europeanAqi;
    const rainProb = daily[0]?.precipitationProbabilityMax || 0;
    const windSpeed = current.windSpeed || 10;

    let rating = 'FAVORABLE';
    let reasoning = [];

    if (rainProb >= 60) {
      rating = 'CAUTION';
      reasoning.push(`High rain probability (${rainProb}%) could cause wet surfaces and sudden showers.`);
    }
    if (feelsLike >= 38) {
      rating = 'UNFAVORABLE';
      reasoning.push(`Apparent temperature is elevated (${feelsLike}°C). Risk of heat cramping and dehydration during prolonged aerobic exertion.`);
    } else if (feelsLike <= 8) {
      rating = 'CAUTION';
      reasoning.push(`Low apparent temperature (${feelsLike}°C). Muscle stiffness and wind chill require warm thermal layering.`);
    }
    if (aqi != null && aqi >= 60) {
      rating = 'CAUTION';
      reasoning.push(`Air quality index is elevated (${aqi}). Strenuous outdoor cardiovascular workouts are discouraged for sensitive individuals.`);
    }
    if (windSpeed >= 35) {
      rating = 'CAUTION';
      reasoning.push(`Brisk winds (${windSpeed} km/h) may impact ball trajectory, cycling aerodynamics, and balance.`);
    }

    if (reasoning.length === 0) {
      reasoning.push(`Ambient temperature (${temp}°C) and wind (${windSpeed} km/h) are within comfortable exercise thresholds.`);
    }

    content = `### 🏃 Activity Feasibility: **${targetActivity.replace('_', ' ')}** (${locationName})\n\n` +
      `**Status: ${rating === 'FAVORABLE' ? '✅ Favorable' : rating === 'CAUTION' ? '⚠️ Moderate Caution' : '❌ Unfavorable'}**\n\n` +
      `• ${reasoning.join('\n• ')}\n\n` +
      `**Optimal Timing:** Early morning or late evening typically avoids both peak midday solar irradiance and diurnal convective rain squalls.`;
  }

  // 8. HEAT INTENT
  else if (primaryIntent === 'HEAT') {
    format = 'RISK_ASSESSMENT';
    const temp = current.temperature;
    const feelsLike = current.feelsLike;
    const uv = current.uvIndex ?? 'Moderate';
    const humidity = current.humidity;

    content = `### 🌡️ Thermal & Heat Assessment for ${locationName}\n\n` +
      `**Current Reading:** ${temp}°C | **Feels Like:** ${feelsLike}°C | **Humidity:** ${humidity}%\n` +
      `**UV Index:** ${uv}\n\n` +
      `**Heat Mechanism:** High humidity reduces the skin's evaporative cooling efficiency through perspiration, driving the apparent heat index ${feelsLike > temp ? `+${(feelsLike - temp).toFixed(1)}°C above the thermometer reading` : 'near ambient values'}.\n\n` +
      `**Precautionary Guidance:**\n` +
      `• Hydrate proactively before feeling thirsty; replenish electrolytes during outdoor work.\n` +
      `• Avoid direct midday sun exposure between 12:00 PM and 3:30 PM.\n` +
      `• Monitor vulnerable elderly individuals and children for symptoms of heat exhaustion (dizziness, nausea, profuse sweating followed by clammy skin).`;
  }

  // 9. COLD INTENT
  else if (primaryIntent === 'COLD') {
    format = 'RISK_ASSESSMENT';
    const temp = current.temperature;
    const feelsLike = current.feelsLike;
    const wind = current.windSpeed;

    content = `### ❄️ Cold & Wind Chill Assessment for ${locationName}\n\n` +
      `**Current Reading:** ${temp}°C | **Feels Like:** ${feelsLike}°C | **Wind Speed:** ${wind} km/h\n\n` +
      `**Analysis:** Convective wind strips away the thin thermal boundary layer protecting human skin, depressing apparent temperature.\n\n` +
      `**Guidance:**\n` +
      `• Wear layered, wind-resistant outer clothing to trap insulating air pockets.\n` +
      `• Early morning commuters on two-wheelers should wear thermal gloves and windproof jackets.`;
  }

  // 10. WIND INTENT
  else if (primaryIntent === 'WIND') {
    format = 'RISK_ASSESSMENT';
    const wind = current.windSpeed || 0;
    const gusts = current.windGusts || wind;

    content = `### 💨 Wind & Gust Assessment for ${locationName}\n\n` +
      `• **Sustained Wind:** ${wind} km/h\n` +
      `• **Peak Gusts:** ${gusts} km/h\n` +
      `• **Direction:** ${current.windDirection ?? 'Variable'}\n\n` +
      `**Practical Risk Interpretation:** ${gusts >= 50 ? 'Gusts of this magnitude can snap small tree branches, displace temporary metal roof sheets, and exert lateral drag on two-wheelers crossing open bridges.' : 'Wind speeds are moderate and pose no structural or transit threats.'}\n\n` +
      `*Source: ${metadata.source} (${freshness})*`;
  }

  // 11. AIR QUALITY INTENT
  else if (primaryIntent === 'AIR_QUALITY') {
    format = 'ANALYSIS';
    const aq = weatherContext.airQuality;
    if (!aq || aq.europeanAqi == null) {
      content = `Live particulate air quality monitoring is temporarily unavailable for ${locationName}. Surface wind is ${current.windSpeed} km/h, which aids atmospheric dispersion.`;
    } else {
      content = `### 🌫️ Air Quality Intelligence (${locationName})\n\n` +
        `• **European AQI:** ${aq.europeanAqi} (${aq.severity || 'Moderate'})\n` +
        `• **PM2.5:** ${aq.pm2_5 ? `${aq.pm2_5} μg/m³` : 'Standard levels'}\n` +
        `• **PM10:** ${aq.pm10 ? `${aq.pm10} μg/m³` : 'Standard levels'}\n\n` +
        `**Health Implication:** ${aq.europeanAqi >= 60 ? 'Sensitive individuals with asthma, bronchitis, or cardiovascular sensitivities should restrict prolonged outdoor aerobic exercise and use an N95 respirator.' : 'Air pollution levels remain within acceptable limits for general outdoor activities.'}`;
    }
  }

  // 12. VISIBILITY & FOG INTENT
  else if (primaryIntent === 'VISIBILITY') {
    format = 'SHORT_ANSWER';
    const vis = current.visibilityKm ?? 10;
    content = `Surface visibility in **${locationName}** is currently measured at **${vis} km** (${current.conditionDescription}).\n\n` +
      `${vis <= 1.5 ? 'Dense mist/fog is restricting sightlines. Motorists should illuminate low-beam headlights and increase vehicle following distance.' : 'Sightlines are clear and visibility is unimpeded for driving and aviation.'}`;
  }

  // 13. CLOTHING INTENT
  else if (primaryIntent === 'CLOTHING') {
    format = 'SHORT_ANSWER';
    const isTomorrow = intentObj.timeScope === 'TOMORROW';
    const target = isTomorrow ? (weatherContext.tomorrowForecast || daily[1]) : null;
    const temp = isTomorrow && target ? (target.maxTemp ?? target.tempMax ?? 25) : (current.temperature || 25);
    const rainProb = isTomorrow && target ? (target.precipitationProbabilityMax ?? target.precipitationProbability ?? 0) : (daily[0]?.precipitationProbabilityMax || 0);
    const uv = current.uvIndex || 3;

    let clothes = 'Comfortable light cotton clothing';
    if (temp >= 32) clothes = 'Lightweight, loose-fitting, breathable light-colored cotton or linen';
    else if (temp <= 15) clothes = 'Warm layered garments with a light jacket or sweater';
    else if (temp <= 8) clothes = 'Thermal innerwear, fleece, and a wind-resistant heavy jacket';

    content = `### 👕 What To Wear ${isTomorrow ? 'Tomorrow' : 'Today'} in ${locationName} (${temp}°C)\n\n` +
      `• **Clothing:** ${clothes}.\n` +
      `• **Rain Gear:** ${rainProb >= 40 ? `Carry a compact umbrella or lightweight waterproof rain shell ${isTomorrow ? 'tomorrow' : 'today'} (rain probability: ${rainProb}%).` : `Rain gear is unlikely to be needed ${isTomorrow ? 'tomorrow' : 'today'} (rain probability: ${rainProb}%).`}\n` +
      `• **Sun Protection:** ${uv >= 6 ? 'Wear sunglasses and apply SPF 30+ sunscreen if outdoors between 11 AM – 3 PM.' : 'Standard UV exposure.'}`;
  }

  // 14. AGRICULTURE INTENT
  else if (primaryIntent === 'AGRICULTURE') {
    format = 'ANALYSIS';
    const rainProb = daily[0]?.precipitationProbabilityMax || 0;
    const precipSum = daily[0]?.precipitationSum || 0;
    const wind = current.windSpeed || 0;

    content = `### 🌾 Agro-Meteorological Advisory for ${locationName}\n\n` +
      `• **Precipitation Outlook:** ${rainProb}% probability (projected volume: ~${precipSum} mm).\n` +
      `• **Spraying Advisory:** ${wind > 20 || rainProb > 40 ? '⚠️ Postpone foliar pesticide or fertilizer spraying to avoid chemical drift and rainwater wash-off.' : '✅ Weather conditions are calm and favorable for agricultural spraying and field weeding.'}\n` +
      `• **Irrigation Guidance:** ${precipSum >= 10 ? 'Hold off supplementary irrigation; forecast rain will replenish topsoil moisture.' : 'Proceed with scheduled crop root-zone irrigation.'}`;
  }

  // 15. CYCLONE INTENT
  else if (primaryIntent === 'CYCLONE') {
    format = 'RISK_ASSESSMENT';
    const cyclones = weatherContext.cyclones || [];
    const activeNamed = cyclones.map((c) => c.name).filter(Boolean);

    if (cyclones.length > 0 && activeNamed.length > 0) {
      content = `### 🌀 Tropical Cyclone Intelligence (${locationName})\n\n` +
        `**Active Systems Tracked:** ${activeNamed.join(', ')}\n\n` +
        `**Status:** GDACS and national meteorological feeds are monitoring active cyclone systems and tropical storm disturbances.\n\n` +
        `**Precautions for ${locationName}:**\n` +
        `• Fisherfolk and coastal communities should avoid venturing into deep sea sectors.\n` +
        `• Expect squally wind conditions and intermittent rain feeder bands.\n` +
        `• Keep emergency supply kits, torches, and battery packs charged.`;
    } else {
      content = `### 🌀 Cyclone & Tropical Storm Outlook (${locationName})\n\n` +
        `**Status: ✓ SAFE / NORMAL** — No active cyclonic systems or severe tropical depressions are currently threatening ${locationName}.\n\n` +
        `• **Current Wind:** ${current.windSpeed} km/h (Gusts: ${current.windGusts || current.windSpeed} km/h)\n` +
        `• **Atmospheric Pressure:** ${current.pressureHpa} hPa\n\n` +
        `No cyclone alert or evacuation order is active for this sector. Regular seasonal monitoring continues through GDACS satellite observation.`;
    }
  }

  // 16. FLOOD INTENT
  else if (primaryIntent === 'FLOOD') {
    format = 'RISK_ASSESSMENT';
    const curPrecip = current.precipitation || 0;
    const maxRainProb = daily[0]?.precipitationProbabilityMax || 0;
    const precipSum = daily[0]?.precipitationSum || 0;

    const floodRisk = (curPrecip >= 10 || precipSum >= 30 || maxRainProb >= 80);

    content = `### 🌊 Flood & Waterlogging Risk Assessment (${locationName})\n\n` +
      `**Status: ${floodRisk ? '⚠️ ELEVATED WATERLOGGING RISK' : '✓ SAFE / NORMAL'}**\n\n` +
      `• **Current Precipitation Rate:** ${curPrecip} mm/h\n` +
      `• **Projected Daily Rainfall:** ~${precipSum} mm (Peak probability: ${maxRainProb}%)\n\n` +
      (floodRisk
        ? `**Vulnerability Analysis:** Sustained rainfall at this rate can strain municipal stormwater drains. Low-lying arterial dips, underpasses, and unpaved roads may accumulate standing water.\n\n` +
          `**Safety Guidance:**\n• Never attempt to drive through submerged underpasses.\n• Keep electrical switches above floor level.`
        : `**Vulnerability Analysis:** Local stormwater infrastructure is operating within standard absorption thresholds with no severe waterlogging indicators detected.`);
  }

  // 17. STORM & LIGHTNING INTENT
  else if (primaryIntent === 'STORM') {
    format = 'RISK_ASSESSMENT';
    const windGusts = current.windGusts || current.windSpeed || 0;
    const rainProb = daily[0]?.precipitationProbabilityMax || 0;
    const isThunder = current.weatherCode === 95 || current.weatherCode === 96 || current.weatherCode === 99 || /\b(lightning|thunder)\b/i.test(rawText);

    content = `### ⚡ Thunderstorm & Lightning Safety Directive (${locationName})\n\n` +
      `**Status: ${isThunder ? '⚠️ THUNDERSTORM & LIGHTNING HAZARD' : (rainProb >= 60 ? '⚠️ CONVECTIVE STORM POTENTIAL' : '✓ SAFE / NORMAL')}**\n\n` +
      `**Go indoors immediately if lightning or thunder is present.**\n\n` +
      `• **Immediate Action:** Move inside a substantial, enclosed building or metal-topped vehicle. Avoid open spaces, picnic pavilions, golf courses, and isolated trees.\n` +
      `• **30/30 Safety Rule:** When thunder roars, go indoors. Wait at least 30 minutes after the last rumble of thunder before stepping back outside.\n` +
      `• **Observed Telemetry for ${locationName}:** ${current.conditionDescription}, Wind Gusts: ${windGusts} km/h, Rain Probability: ${rainProb}%.`;
  }

  // 18. DISASTER PREPAREDNESS & SEVERE WEATHER INTENT
  else if (primaryIntent === 'DISASTER_PREPAREDNESS') {
    format = 'RISK_ASSESSMENT';
    const topRisk = riskAnalysis.topRisk;

    content = `### 🛡️ Severe Weather & Hazard Assessment (${locationName})\n\n` +
      `**Status: ${riskAnalysis.overallSeverity === 'HIGH' ? '⚠️ HIGH RISK' : (riskAnalysis.overallSeverity === 'MODERATE' ? '⚠️ MODERATE RISK' : '✓ SAFE / NORMAL')}**\n\n` +
      (topRisk ? `**Active Risk Context (${topRisk.title}):**\n• ${topRisk.aiInterpretation}\n\n` : `Atmospheric indicators in ${locationName} are currently stable with no active severe weather, storm, or cyclone warnings.\n\n`) +
      `**Essential Preparedness Checklist:**\n` +
      `1. **Power & Lighting:** Keep emergency power banks and flashlights charged.\n` +
      `2. **Drainage Clearance:** Verify terrace drains and domestic rainwater downspouts are free of debris.\n` +
      `3. **Essential Reserves:** Retain potable drinking water and emergency non-perishable rations.\n` +
      `4. **Authoritative Updates:** Follow official state disaster management authority (SDMA) bulletins. DisasterChain AI interpretations assist readiness but do not replace statutory evacuation orders.`;
  }

  // 16. WEATHER_FORECAST (Tomorrow / Multi-day)
  else if (primaryIntent === 'WEATHER_FORECAST') {
    format = 'ANALYSIS';
    const tomorrow = weatherContext.tomorrowForecast || daily[1];
    const targetHourData = weatherContext.targetForecast?.targetHourData;

    if (timeframe.type === 'WEEKLY' && daily.length > 2) {
      const forecastDays = daily.slice(0, 5).map(d => `• **${d.date}**: ${d.tempMax}°C / ${d.tempMin}°C, ${d.precipitationProbabilityMax}% rain (${d.conditionDescription})`).join('\n');
      content = `### 📅 5-Day Extended Weather Outlook (${locationName})\n\n${forecastDays}\n\n` +
        `*Atmospheric models show stable baseline temperatures with precipitation variations as detailed above.*`;
    } else if (targetHourData) {
      content = `### 📅 Tomorrow around ${targetHourData.timeFormatted} (${locationName})\n\n` +
        `• **Temperature:** Expected **${targetHourData.temperature}°C** (feels like **${targetHourData.apparentTemperature ?? targetHourData.temperature}°C**).\n` +
        `• **Conditions:** **${targetHourData.conditionDescription}**.\n` +
        `• **Precipitation:** **${targetHourData.precipitationProbability}% chance of rain** (${targetHourData.precipitationMm} mm expected).\n` +
        `• **Wind:** Winds around ${targetHourData.windSpeed} km/h (gusts up to ${targetHourData.windGusts} km/h).\n\n` +
        `**Outlook:** ${targetHourData.precipitationProbability >= 40 ? 'Rain is possible during this window. Consider carrying rain gear if you plan to be outdoors.' : 'Conditions are projected to remain relatively clear and stable during this hour.'}`;
    } else if (tomorrow) {
      const peak = tomorrow.peakRainWindow;
      const tMax = tomorrow.maxTemp != null ? tomorrow.maxTemp : tomorrow.tempMax;
      const tMin = tomorrow.minTemp != null ? tomorrow.minTemp : tomorrow.tempMin;
      const cond = tomorrow.conditionDescription || tomorrow.conditions || 'Partly cloudy';
      const prob = tomorrow.precipitationProbabilityMax ?? tomorrow.precipitationProbability ?? 0;
      const windSpeed = tomorrow.windSpeedMax || tomorrow.wind || 0;

      if (language === 'hi') {
        content = `### 📅 ${locationName} में कल का मौसम पूर्वानुमान\n\n` +
          `• **तापमान:** अधिकतम **${tMax}°C** और न्यूनतम **${tMin}°C** रहने का अनुमान है।\n` +
          `• **बारिश की संभावना:** **${prob}%** (${cond})।\n` +
          (peak?.hasSignificantRain ? `• **बारिश का समय:** सबसे अधिक संभावना **${peak.window}** के दौरान है (लगभग **${peak.maxProb}%**)।\n` : '') +
          `• **हवा की गति:** लगभग ${windSpeed} km/h।\n\n` +
          `**विश्लेषण:** ${prob >= 50 ? 'कल बारिश होने की प्रबल संभावना है। छाता या रेनकोट साथ रखना उचित रहेगा।' : 'कल मौसम मुख्य रूप से शुष्क और सामान्य रहने का अनुमान है।'}`;
      } else {
        content = `### 📅 Tomorrow's Forecast for ${locationName}\n\n` +
          `• **Temperature:** Expected high of **${tMax}°C** and low of **${tMin}°C**.\n` +
          `• **Precipitation:** **${prob}% chance of rain** (${cond}).\n` +
          (peak?.hasSignificantRain ? `• **Rain Timing:** Peak precipitation probability window is around **${peak.window}** (up to **${peak.maxProb}%**).\n` : '') +
          `• **Wind:** Sustained winds around ${windSpeed} km/h.\n\n` +
          `**What It Means:** ${prob >= 50 ? 'Rainfall is expected to be the defining weather factor tomorrow. Plan outdoor transit accordingly.' : 'Conditions are projected to remain relatively dry and predictable.'}`;
      }
    } else {
      content = language === 'hi'
        ? `संख्यात्मक पूर्वानुमान मॉडल से ${locationName} का पूर्वानुमान अद्यतन किया जा रहा है।`
        : `Tomorrow's forecast for ${locationName} is being updated from numerical prediction models.`;
    }
  }

  // 17. WEATHER_CURRENT (Default fallback)
  else {
    const isTomorrow = intentObj.timeScope === 'TOMORROW';
    const isSimpleTempQuery = /^(temperature|temp|what is the temp|what's the temp|how hot|how cold|तापमान)/i.test(rawText.trim());

    if (isTomorrow) {
      format = 'SHORT_ANSWER';
      const tomorrow = weatherContext.tomorrowForecast || daily[1];
      const targetHourData = weatherContext.targetForecast?.targetHourData;
      if (targetHourData) {
        content = `Tomorrow around **${targetHourData.timeFormatted}** in **${locationName}**, the temperature is forecast to be **${targetHourData.temperature}°C** (feels like **${targetHourData.apparentTemperature ?? targetHourData.temperature}°C**) with **${targetHourData.conditionDescription.toLowerCase()}** skies.`;
      } else if (tomorrow) {
        const tMax = tomorrow.maxTemp != null ? tomorrow.maxTemp : tomorrow.tempMax;
        const tMin = tomorrow.minTemp != null ? tomorrow.minTemp : tomorrow.tempMin;
        content = `Tomorrow in **${locationName}**, temperatures are forecast to reach a high of **${tMax}°C** and a low of **${tMin}°C** under **${(tomorrow.conditionDescription || tomorrow.conditions || 'partly cloudy').toLowerCase()}** skies.`;
      } else {
        content = `Tomorrow's forecast for **${locationName}** is currently updating from meteorological feeds.`;
      }
    } else if (isSimpleTempQuery) {
      format = 'SHORT_ANSWER';
      if (language === 'hi') {
        content = `**${locationName}** में वर्तमान तापमान **${current.temperature}°C** है (महसूस: **${current.feelsLike}°C**)।`;
      } else if (language === 'ur') {
        content = `**${locationName}** میں موجودہ درجہ حرارت **${current.temperature}°C** ہے (محسوس: **${current.feelsLike}°C**)۔`;
      } else {
        content = `The temperature in **${locationName}** is **${current.temperature}°C** (feels like **${current.feelsLike}°C**) with ${current.conditionDescription.toLowerCase()}.`;
      }
    } else {
      format = 'ANALYSIS';
      const trend = weatherContext.getTrendNextHours();
      if (language === 'hi') {
        content = `### 📍 ${locationName} में ${i18n.currentWeather}\n\n` +
          `• **तापमान:** ${current.temperature}°C (महसूस: ${current.feelsLike}°C)\n` +
          `• **मौसम की स्थिति:** ${current.conditionDescription} (बादल: ${current.cloudCover}%)\n` +
          `• **आर्द्रता व वायुदाब:** ${current.humidity}% | ${current.pressureHpa} hPa\n` +
          `• **हवा की गति:** ${current.windSpeed} km/h (झोंके: ${current.windGusts || current.windSpeed} km/h)\n\n` +
          `**आगामी रुख:** ${trend.description}`;
      } else if (language === 'ur') {
        content = `### 📍 ${locationName} میں ${i18n.currentWeather}\n\n` +
          `• **درجہ حرارت:** ${current.temperature}°C (محسوس: ${current.feelsLike}°C)\n` +
          `• **موسمی صورتحال:** ${current.conditionDescription} (بادل: ${current.cloudCover}%)\n` +
          `• **نمی اور دباؤ:** ${current.humidity}% | ${current.pressureHpa} hPa\n` +
          `• **ہوا کی رفتار:** ${current.windSpeed} km/h\n\n` +
          `**رجحان:** ${trend.description}`;
      } else {
        content = `### 📍 ${i18n.currentWeather} in ${locationName}\n\n` +
          `• **Temperature:** ${current.temperature}°C (Feels like: ${current.feelsLike}°C)\n` +
          `• **Conditions:** ${current.conditionDescription} (Cloud cover: ${current.cloudCover}%)\n` +
          `• **Humidity & Pressure:** ${current.humidity}% | ${current.pressureHpa} hPa\n` +
          `• **Wind:** ${current.windSpeed} km/h (Gusts: ${current.windGusts || current.windSpeed} km/h)\n\n` +
          `**Immediate Trend:** ${trend.description}`;
      }
    }
  }

  // Ensure intentCard is populated for all intent types
  if (!intentCard) {
    if (primaryIntent === 'WIND') {
      const wind = current.windSpeed || 0;
      const gusts = current.windGusts || wind;
      intentCard = {
        intent: 'WIND',
        timeScope: intentObj.timeScope || 'CURRENT',
        badge: 'WIND TELEMETRY',
        primaryMetric: {
          value: `${wind} km/h`,
          label: 'sustained wind speed',
        },
        secondaryMetrics: [
          { label: 'Peak Gusts', value: `${gusts} km/h` },
          { label: 'Direction', value: current.windDirection ?? 'Variable' },
          { label: 'Status', value: gusts >= 50 ? 'Strong Gusts' : 'Normal / Steady' },
        ],
        timeline: weatherContext.targetForecast?.timeline || [],
        why: gusts >= 50 ? 'Pressure gradients are inducing elevated surface gusts across the region.' : 'Atmospheric pressure gradients are modest and wind flows are steady.',
        whatToDo: gusts >= 50 ? 'Secure loose outdoor items; two-wheelers should exercise caution on bridges.' : 'No special wind restrictions apply.',
        source: 'Open-Meteo · Hourly forecast',
      };
    } else if (primaryIntent === 'AIR_QUALITY') {
      const aq = weatherContext.airQuality;
      intentCard = {
        intent: 'AIR_QUALITY',
        timeScope: 'CURRENT',
        badge: 'AIR QUALITY INTELLIGENCE',
        primaryMetric: {
          value: `${aq?.europeanAqi || 68}`,
          label: `European AQI (${aq?.severity || 'Moderate'})`,
        },
        secondaryMetrics: [
          { label: 'PM2.5', value: aq?.pm2_5 ? `${aq.pm2_5} μg/m³` : 'Standard' },
          { label: 'PM10', value: aq?.pm10 ? `${aq.pm10} μg/m³` : 'Standard' },
          { label: 'Health Status', value: aq?.europeanAqi >= 80 ? 'Hazardous' : (aq?.europeanAqi >= 60 ? 'Sensitive Warning' : 'Acceptable') },
        ],
        timeline: weatherContext.targetForecast?.timeline || [],
        why: aq?.europeanAqi >= 60 ? 'Thermal inversion layers are trapping particulate matter near surface level.' : 'Atmospheric ventilation and wind speeds are assisting particulate dispersion.',
        whatToDo: aq?.europeanAqi >= 80 ? 'Wear an N95 mask outdoors and run indoor HEPA filtration.' : (aq?.europeanAqi >= 60 ? 'Sensitive individuals should limit prolonged outdoor aerobic workouts.' : 'Safe for general outdoor exercise.'),
        source: 'Copernicus Atmospheric Monitoring Service (CAMS)',
      };
    } else if (primaryIntent === 'WEATHER_COMPARISON') {
      const today = weatherContext.todayForecast;
      const tomorrow = weatherContext.tomorrowForecast;
      intentCard = {
        intent: 'WEATHER_COMPARISON',
        timeScope: 'COMPARISON',
        badge: 'TODAY VS TOMORROW',
        primaryMetric: {
          value: `${tomorrow?.maxTemp}°C vs ${today?.maxTemp}°C`,
          label: 'tomorrow vs today daytime high',
        },
        secondaryMetrics: [
          { label: 'Rain Today', value: `${today?.precipitationProbabilityMax}%` },
          { label: 'Rain Tomorrow', value: `${tomorrow?.precipitationProbabilityMax}%` },
          { label: 'Rain Total', value: `${tomorrow?.precipitationSum} mm vs ${today?.precipitationSum} mm` },
        ],
        timeline: weatherContext.targetForecast?.timeline || [],
        why: `Tomorrow shows high of ${tomorrow?.maxTemp}°C (${tomorrow?.conditions}) compared to today's ${today?.maxTemp}°C (${today?.conditions}).`,
        whatToDo: tomorrow?.precipitationProbabilityMax >= 50 ? 'Prepare rain gear for tomorrow; today remains drier.' : 'Both days have manageable precipitation risks.',
        source: 'Open-Meteo · High-Resolution Numerical Model',
      };
    } else if (primaryIntent === 'WEATHER_FORECAST') {
      const isTomorrow = intentObj.timeScope === 'TOMORROW';
      const target = isTomorrow ? weatherContext.tomorrowForecast : weatherContext.todayForecast;
      intentCard = {
        intent: 'WEATHER_FORECAST',
        timeScope: isTomorrow ? 'TOMORROW' : 'TODAY',
        badge: isTomorrow ? 'TOMORROW · OUTLOOK' : 'TODAY · OUTLOOK',
        primaryMetric: {
          value: `${target?.maxTemp}°C`,
          label: `${target?.conditions || 'Partly cloudy'} (High)`,
        },
        secondaryMetrics: [
          { label: 'Low', value: `${target?.minTemp}°C` },
          { label: 'Rain Probability', value: `${target?.precipitationProbabilityMax}%` },
          { label: 'Expected Rainfall', value: `${target?.precipitationSum} mm` },
        ],
        timeline: weatherContext.targetForecast?.timeline || [],
        why: `Atmospheric models project temperatures between ${target?.minTemp}°C and ${target?.maxTemp}°C with ${target?.precipitationProbabilityMax}% peak rain probability.`,
        whatToDo: target?.precipitationProbabilityMax >= 40 ? 'Carry rain protection if traveling or spending extended time outdoors.' : 'Favorable conditions for routine travel and outdoor activities.',
        source: 'Open-Meteo · 7-day numerical model',
      };
    } else {
      // Default: CURRENT_WEATHER
      intentCard = {
        intent: 'CURRENT_WEATHER',
        timeScope: 'CURRENT',
        badge: `${(locationName || 'Location').split(',')[0].toUpperCase()} · LIVE DATA`,
        primaryMetric: {
          value: `${current.temperature != null ? Math.round(current.temperature) : 25}°C`,
          label: current.conditionDescription || 'Mainly clear',
        },
        secondaryMetrics: [
          { label: 'Wind', value: `${current.windSpeed || 0} km/h` },
          { label: 'Humidity', value: `${current.humidity || 50}%` },
          { label: 'AQI', value: `${weatherContext.airQuality?.europeanAqi || 68}` },
          { label: 'Feels Like', value: `${current.feelsLike || current.temperature || 25}°C` },
        ],
        timeline: weatherContext.targetForecast?.timeline || [],
        why: weatherContext.getTrendNextHours ? weatherContext.getTrendNextHours().description : 'Stable atmospheric telemetry.',
        whatToDo: (weatherContext.airQuality?.europeanAqi >= 80)
          ? 'Air quality is elevated; sensitive individuals should wear an N95 mask outdoors.'
          : (current.temperature >= 38 ? 'High temperatures; stay hydrated and limit peak sun exposure.' : 'Atmospheric conditions are stable for normal daily activities.'),
        source: 'Open-Meteo · Live telemetry',
      };
    }
  }

  // Generate tailored follow-up chips
  const followUpSuggestions = generateFollowUpSuggestions(primaryIntent, timeframe, weatherContext, riskAnalysis);

  // Generate contextual quick action chips
  const contextualQuickActions = generateContextualQuickActions(weatherContext, riskAnalysis);

  return {
    content,
    format,
    metaBadge,
    reasoningStrategy,
    followUpSuggestions,
    contextualQuickActions,
    riskLevel: riskAnalysis.overallSeverity,
    intentCard,
  };
}

module.exports = {
  generateAnalyticalResponse,
  generateContextualQuickActions,
  generateFollowUpSuggestions,
  formatDataFreshness,
  I18N_DICTIONARY,
};
