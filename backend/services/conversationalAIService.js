/**
 * DisasterChain Conversational AI Service
 *
 * Full conversational AI engine providing a natural, ChatGPT-like assistant
 * for DisasterChain. Maintains conversation memory, answers disaster and general
 * inquiries, handles multi-turn follow-ups, and executes application features via
 * structured tool actions.
 */

const { SUPPORTED_LANGUAGES, PREPAREDNESS_GUIDES } = require('./aiAssistantService');
const { processWeatherGPTChat } = require('./weatherGPTService');
const weatherService = require('./weatherService');
const { fetchShelters } = require('../models/Shelter');
const mongoose = require('mongoose');
const Shelter = require('../models/Shelter');
const memoryStore = require('../config/memoryStore');

const isDbConnected = () => mongoose.connection.readyState === 1;

/**
 * 20 Supported Indian Languages & English Names
 */
const LANGUAGE_NAMES = {
  en: 'English',
  hi: 'Hindi (हिंदी)',
  pa: 'Punjabi (ਪੰਜਾਬੀ)',
  bn: 'Bengali (বাংলা)',
  ta: 'Tamil (தமிழ்)',
  te: 'Telugu (తెలుగు)',
  mr: 'Marathi (मराठी)',
  gu: 'Gujarati (ગુજરાતી)',
  kn: 'Kannada (ಕನ್ನಡ)',
  ml: 'Malayalam (മലയാളം)',
  or: 'Odia (ଓଡ଼ିଆ)',
  as: 'Assamese (অসমীয়া)',
  ur: 'Urdu (اردو)',
  sa: 'Sanskrit (संस्कृतम्)',
  ks: 'Kashmiri (کٲشُر)',
  kok: 'Konkani (कोंकणी)',
  mai: 'Maithili (मैथिली)',
  ne: 'Nepali (नेपाली)',
  sd: 'Sindhi (سنڌي)',
  mni: 'Manipuri (মৈতৈলোন্)',
};

/**
 * Parse structured action tag from LLM response if present:
 * e.g. <<<ACTION:{"type":"NAVIGATE","target":"/shelters","label":"Open Shelters"}>>>
 */
function extractActionFromText(rawText) {
  if (!rawText || typeof rawText !== 'string') {
    return { cleanText: '', action: null };
  }

  const actionRegex = /<<<ACTION:(\{.*?\})>>>/s;
  const match = rawText.match(actionRegex);

  if (match && match[1]) {
    try {
      const actionObj = JSON.parse(match[1]);
      const cleanText = rawText.replace(actionRegex, '').trim();
      return { cleanText, action: actionObj };
    } catch (e) {
      console.warn('[ConversationalAI] Failed to parse action JSON from LLM:', e.message);
    }
  }

  return { cleanText: rawText.trim(), action: null };
}

/**
 * Call real LLM Provider (OpenAI / Groq / OpenRouter / Anthropic-proxy / Gemini)
 * Configured via process.env.AI_API_KEY, AI_API_ENDPOINT, AI_MODEL_NAME
 */
async function callExternalConversationalLLM(message, conversation, context, language = 'en') {
  const apiKey = process.env.AI_API_KEY;
  if (!apiKey || apiKey.trim() === '') {
    return null;
  }

  const langName = LANGUAGE_NAMES[language] || 'English';

  const systemPrompt = `You are DisasterChain AI Assistant, an intelligent, empathetic, and highly capable conversational assistant for the DisasterChain earth intelligence & disaster management platform.
Your personality is friendly, helpful, clear, calm, and reliable — just like ChatGPT.

Core Capabilities:
1. Conversational Understanding:
   - Handle natural greetings, general conversations, explanations, and questions warmly and intelligently.
   - Maintain context across follow-up questions (e.g. if the user discussed floods and asks "What if I am inside my house?", continue the flood safety context).
   - If the user asks "Can you explain this in simpler words?", simplify your previous answer into short, clear, non-technical points.
   - If the user asks "Tell me more", provide deeper practical guidance, supply recommendations, and family plans.
   - Handle questions about vulnerable populations (children, elderly people, pets, individuals with disabilities).
   - Handle reasonable educational, science, and general queries outside disaster management politely and helpfully.

2. Disaster Safety & Preparedness Authority:
   - Provide verified life safety protocols for earthquakes, floods, cyclones, structural fires, tsunamis, landslides, chemical hazards, and severe weather.
   - Never invent or fabricate live disaster casualties, fake coordinates, or false claims that emergency rescue teams have been dispatched.
   - In life-threatening emergencies, prioritize immediate actionable survival steps, advise calling 112 / 108 / 101, and offer to prepare an SOS distress beacon.

3. Platform Feature Operation & Unified WeatherGPT Capabilities:
   - You completely integrate all WeatherGPT meteorological intelligence, Doppler telemetry, and cyclonic forecasting directly inside this conversation.
   - When the user asks about the weather today, rainfall, tomorrow's forecast, temperatures, umbrellas, or severe storm precautions, ANSWER DIRECTLY inside the conversation.
   - Do NOT emit an OPEN_WEATHERGPT action. WeatherGPT is not a separate application; it is built into YOU.
   - If the user asks for WeatherGPT, explain that WeatherGPT is fully integrated into this conversation.
   - When the user explicitly asks to open or use an application feature, append an ACTION tag at the VERY END of your response in this exact format:
   <<<ACTION:{"type":"ACTION_TYPE","target":"TARGET_ROUTE_OR_VALUE","label":"BUTTON_LABEL"}>>>

   Supported Action Types:
   - Navigate to Shelters: <<<ACTION:{"type":"NAVIGATE","target":"/shelters","label":"Open Shelters"}>>>
   - Navigate to Weather Page (ONLY when user explicitly asks to open the weather page): <<<ACTION:{"type":"NAVIGATE","target":"/weather","label":"Open Weather Page"}>>>
   - Navigate to Spatial Map: <<<ACTION:{"type":"NAVIGATE","target":"/map","label":"Open Map"}>>>
   - Navigate to Incident Reports: <<<ACTION:{"type":"NAVIGATE","target":"/incidents","label":"View Incidents"}>>>
   - Open Safety Guidelines: <<<ACTION:{"type":"NAVIGATE","target":"/safety","label":"Safety Guidelines"}>>>
   - Open Emergency Contacts: <<<ACTION:{"type":"OPEN_CONTACTS","label":"Emergency Contacts"}>>>
   - Prepare SOS Protocol: <<<ACTION:{"type":"TRIGGER_SOS","label":"Prepare SOS"}>>>
   - Change Language: <<<ACTION:{"type":"CHANGE_LANGUAGE","target":"hi","label":"Change Language"}>>>
   - Toggle Theme: <<<ACTION:{"type":"TOGGLE_THEME","target":"dark","label":"Dark Mode"}>>>

   IMPORTANT ACTION RULES:
   - Do not navigate away from the conversation for ordinary weather questions like "What's the weather today?", "Will it rain tomorrow?", or "Should I carry an umbrella?". Answer them directly inside the chat.
   - Only navigate to the weather page (/weather) if the user explicitly says "open the weather page", "go to weather dashboard", or similar explicit page navigation requests.
   - Never automatically dispatch an SOS; only offer to prepare the SOS confirmation protocol.

4. Language Adherence:
   - The user's active application language is ${langName} (code: "${language}").
   - Respond fluently, naturally, and idiomatically in ${langName}.
   - Never generate Hinglish. Use authentic script and natural vocabulary for the requested language.
   - Keep numbers, coordinates, and emergency telephone numbers (112, 108, 101, 1078) accurate.`;

  // Build prompt messages with conversation memory
  const messages = [{ role: 'system', content: systemPrompt }];

  if (Array.isArray(conversation) && conversation.length > 0) {
    const recentTurns = conversation.slice(-8); // Last 8 turns for rich memory
    for (const turn of recentTurns) {
      if (turn && turn.role && turn.content) {
        messages.push({
          role: turn.role === 'assistant' ? 'assistant' : 'user',
          content: String(turn.content).slice(0, 1000),
        });
      }
    }
  }

  messages.push({ role: 'user', content: String(message).slice(0, 1200) });

  const endpoint = process.env.AI_API_ENDPOINT || 'https://api.openai.com/v1/chat/completions';
  const modelName = process.env.AI_MODEL_NAME || 'gpt-4o-mini';

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 9000); // 9-second timeout

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: modelName,
        messages,
        max_tokens: 750,
        temperature: 0.6,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      console.warn(`[ConversationalAI] External LLM returned HTTP ${response.status}`);
      return null;
    }

    const json = await response.json();
    const replyText = json?.choices?.[0]?.message?.content;
    if (replyText && typeof replyText === 'string') {
      const { cleanText, action } = extractActionFromText(replyText);
      return {
        reply: cleanText,
        action,
        source: 'Live LLM Provider (' + modelName + ')',
      };
    }
  } catch (err) {
    clearTimeout(timeout);
    console.warn('[ConversationalAI] External LLM call failed or timed out:', err.message);
  }

  return null;
}

/**
 * Intelligent Conversational Engine Fallback
 * Provides rich, context-aware responses when no external AI key is set or when upstream is offline.
 */
async function generateConversationalFallback(message, conversation = [], language = 'en', context = {}) {
  const text = (message || '').toLowerCase().trim();
  const lang = (language || 'en').toLowerCase();
  let action = null;

  // 1. Context extraction from previous conversation messages
  const lastUserMsg = conversation.length > 0
    ? [...conversation].reverse().find((m) => m.role === 'user')?.content?.toLowerCase() || ''
    : '';
  const lastAssistantMsg = conversation.length > 0
    ? [...conversation].reverse().find((m) => m.role === 'assistant')?.content?.toLowerCase() || ''
    : '';

  const isRecentFlood = lastUserMsg.includes('flood') || lastAssistantMsg.includes('flood');
  const isRecentEarthquake = lastUserMsg.includes('earthquake') || lastAssistantMsg.includes('earthquake');
  const isRecentCyclone = lastUserMsg.includes('cyclone') || lastAssistantMsg.includes('cyclone');
  const isRecentFire = lastUserMsg.includes('fire') || lastAssistantMsg.includes('fire');

  // =========================================================================
  // GREETINGS & CASUAL CONVERSATION
  // =========================================================================
  const isGreeting = /^(hi|hello|hey|good\s+(morning|afternoon|evening)|howdy|greetings|namaste)\b/i.test(text) ||
    /^(नमस्ते|नमस्कार|प्रणाम|ਸਤਿ\s*ਸ੍ਰੀ\s*ਅਕਾਲ|ਨਮਸਤੇ|নমস্কার|வணக்கம்|నమస్కారం|નમસ્તે|ನಮಸ್ಕಾರ|നമസ്കാരം|নমস্কাৰ|سلام|khurumjari)/i.test(text);

  if (isGreeting) {
    let reply = `Hello! I am your **DisasterChain AI Assistant**, designed to keep you informed, prepared, and safe.\n\n` +
      `You can talk to me naturally about:\n` +
      `• **Safety Guides:** Flood, earthquake, cyclone, or fire safety.\n` +
      `• **Preparedness:** 72-hour emergency kits, family evacuation plans, and protecting vulnerable family members.\n` +
      `• **DisasterChain Tools:** Finding nearby shelters, live weather updates, spatial maps, or emergency helplines.\n\n` +
      `How can I help you right now?`;

    if (lang === 'hi') {
      reply = `नमस्ते! मैं आपका **DisasterChain AI सहायक** हूँ। मैं आपको सुरक्षित और आपदा-तैयार रखने में मदद करने के लिए यहाँ हूँ।\n\n` +
        `आप मुझसे बाढ़, भूकंप, चक्रवात सुरक्षा, 72 घंटे की आपातकालीन किट, या नज़दीकी आश्रयों और मौसम के बारे में कुछ भी पूछ सकते हैं।\n\n` +
        `मैं आज आपकी क्या सहायता कर सकता हूँ?`;
    } else if (lang === 'pa') {
      reply = `ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ! ਮੈਂ ਤੁਹਾਡਾ **DisasterChain AI ਸਹਾਇਕ** ਹਾਂ। ਮੈਂ ਤੁਹਾਨੂੰ ਸੁਰੱਖਿਅਤ ਅਤੇ ਆਫ਼ਤ ਪ੍ਰਬੰਧਨ ਲਈ ਤਿਆਰ ਰੱਖਣ ਵਿੱਚ ਮਦਦ ਕਰਨ ਲਈ ਹਾਜ਼ਰ ਹਾਂ।\n\n` +
        `ਤੁਸੀਂ ਮੇਰੇ ਕੋਲੋਂ ਹੜ੍ਹ, ਭੁਚਾਲ, ਤੂਫ਼ਾਨ ਸੁਰੱਖਿਆ, ਐਮਰਜੈਂਸੀ ਕਿੱਟਾਂ ਜਾਂ ਨੇੜਲੇ ਆਸਰਿਆਂ ਬਾਰੇ ਪੁੱਛ ਸਕਦੇ ਹੋ।\n\n` +
        `ਮੈਂ ਅੱਜ ਤੁਹਾਡੀ ਕੀ ਮਦਦ ਕਰ ਸਕਦਾ ਹਾਂ?`;
    } else if (lang === 'bn') {
      reply = `নমস্কার! আমি আপনার **DisasterChain AI সহকারী**। আমি আপনাকে নিরাপদ এবং দুর্যোগের জন্য প্রস্তুত রাখতে সাহায্য করতে এখানে আছি।\n\n` +
        `বন্যা, ভূমিকম্প, ঘূর্ণিঝড় নিরাপত্তা বা আশ্রয়কেন্দ্র সম্পর্কে আপনি আমাকে যেকোনো প্রশ্ন করতে পারেন।`;
    } else if (lang === 'ta') {
      reply = `வணக்கம்! நான் உங்கள் **DisasterChain AI உதவியாளர்**. பேரிடர் பாதுகாப்பு, வானிலை மற்றும் அவசர முகாம்கள் குறித்த தகவல்களைப் பெற நீங்கள் என்னிடம் பேசலாம்.`;
    } else if (lang === 'te') {
      reply = `నమస్కారం! నేను మీ **DisasterChain AI సహాయకుడిని**. విపత్తు భద్రత, వాతావరణం మరియు పునరావాస కేంద్రాల సమాచారం కోసం మీరు నాతో మాట్లాడవచ్చు.`;
    }

    return {
      reply,
      action: null,
      source: 'DisasterChain Conversational Intelligence Engine',
    };
  }

  // "How are you?"
  if (/\b(how are you|how're you|how do you do|how is it going)\b/i.test(text)) {
    return {
      reply: `I am operating at full readiness, thank you for asking! All DisasterChain live earth intelligence feeds, shelter registries, and safety monitoring systems are active. How can I assist you with your safety or emergency preparedness today?`,
      action: null,
      source: 'DisasterChain Conversational Intelligence Engine',
    };
  }

  // "What can you help me with?" / "What can you do?"
  if (/\b(what can you (help|do)|who are you|help me with|your (capabilities|features))\b/i.test(text)) {
    return {
      reply: `I am your full conversational assistant for DisasterChain. Here is what I can do for you:\n\n` +
        `1. 🧭 **Hands-Free Navigation:** Say *"Open shelters"*, *"Take me to weather"*, *"Open the map"*, or *"Show incident reports"* to navigate instantly.\n` +
        `2. 🛡️ **Safety Guidance:** Ask me detailed questions like *"What should I do during an earthquake?"*, *"Explain flood safety"*, or *"What if I am trapped indoors?"*.\n` +
        `3. 🎒 **Emergency Preparedness:** Ask *"What should I pack in an emergency kit?"*, *"Why is preparedness important?"*, or *"How do I protect elderly relatives?"*.\n` +
        `4. 🌦️ **Weather & Telemetry:** Ask *"What's the weather today?"* or ask me to open **WeatherGPT** for in-depth climate forecasting.\n` +
        `5. 🏛️ **Shelter Discovery:** Ask *"Find the nearest shelter"* to calculate the closest relief hub with available beds.\n` +
        `6. 🚨 **Emergency SOS Beacon:** In critical danger, say *"SOS"* to trigger the verified 15-second emergency dispatch protocol with GPS coordinates.\n\n` +
        `You can speak naturally or type questions anytime.`,
      action: null,
      source: 'DisasterChain Conversational Intelligence Engine',
    };
  }

  // =========================================================================
  // MULTI-TURN CONTEXT-AWARE FOLLOW-UPS
  // =========================================================================

  // "What if I am inside my house?"
  if (/\b(inside\s+(my\s+)?(house|home|building|room|apartment))\b/i.test(text)) {
    if (isRecentFlood) {
      return {
        reply: `If you are **inside your house during a flood**:\n\n` +
          `1. ⚡ **Shut off the Main Electrical Breaker:** Do this immediately if it is dry to reach, before water touches electrical sockets.\n` +
          `2. 🪜 **Move to Higher Floors:** Relocate family members, essential medicines, and emergency supplies to upper levels.\n` +
          `3. 🚫 **Never Enter a Closed Attic:** If floodwaters force you upward, only enter an attic if you have a clear exit to the roof with tools (an axe/crowbar).\n` +
          `4. 🚰 **Store Clean Water:** Fill clean pots, tubs, and bottles with water before tap supplies become contaminated.\n` +
          `5. 📻 **Monitor Live Updates:** Keep your battery radio tuned to emergency broadcasts.\n\n` +
          `Would you like me to find the nearest safe shelter or show emergency helplines?`,
        action: { type: 'NAVIGATE', target: '/safety', label: 'View Flood Safety' },
        source: 'DisasterChain Flood Protocol',
      };
    }

    if (isRecentEarthquake) {
      return {
        reply: `If you are **inside your house during an earthquake**:\n\n` +
          `1. 🛡️ **DROP, COVER, and HOLD ON:** Drop to your hands and knees under a sturdy desk or table.\n` +
          `2. 🪟 **Stay Away from Windows:** Keep clear of glass, mirrors, fireplaces, and heavy wall hangings that could fall.\n` +
          `3. 🚫 **Do Not Run Outside:** Most earthquake injuries happen when people try to run out of shaking buildings and are hit by falling bricks or facade.\n` +
          `4. 🚪 **Do Not Stand in Doorways:** Modern doors do not provide more structural protection than a sturdy table.\n` +
          `5. 🛑 **Hold On:** Hold onto your shelter until shaking stops completely, then carefully evacuate using stairs (never elevators).`,
        action: { type: 'NAVIGATE', target: '/safety', label: 'View Earthquake Safety' },
        source: 'DisasterChain Earthquake Protocol',
      };
    }
  }

  // "What about electricity?" / "Electrical safety"
  if (/\b(electricity|power|electrical|current|wire|circuit|breaker)\b/i.test(text)) {
    return {
      reply: `⚡ **Electrical Safety During Storms & Flooding:**\n\n` +
        `• **Water Conducts Electricity:** Never touch electrical cords, outlets, or appliances while standing in water or on damp ground.\n` +
        `• **Main Breaker Shutoff:** If water is rising toward electrical outlets, turn off the main circuit breaker only if you can reach it safely from a completely dry floor.\n` +
        `• **Downed Power Lines:** Treat all fallen power wires as live and dangerous. Stay at least **35 feet (10 meters)** away and report them immediately.\n` +
        `• **Flooded Appliances:** Any electrical appliance that has been submerged must be professionally inspected and dried before being plugged in again.\n` +
        `• **Generator Safety:** Never run a fuel-powered generator indoors or in an attached garage due to fatal carbon monoxide buildup.`,
      action: null,
      source: 'DisasterChain Electrical Safety Protocols',
    };
  }

  // "Can you explain this in simpler words?" / "Simpler terms"
  if (/\b(simpler?\s*(words?|terms?|language)?|simplify|explain\s*(this\s*)?simply)\b/i.test(text)) {
    return {
      reply: `Here it is in 3 very simple rules:\n\n` +
        `1. 🏃 **Get to a safe place fast.** Move up if there is water, or get under a strong table if the ground shakes.\n` +
        `2. 🎒 **Keep your essentials ready.** Always keep a bag with drinking water, food, your phone charger, and medicines.\n` +
        `3. 📞 **Ask for help if trapped.** Dial **112** on your phone, or say *"SOS"* to me to send an emergency alert.\n\n` +
        `Would you like me to explain anything else simply?`,
      action: null,
      source: 'DisasterChain Plain-Language Safety Guide',
    };
  }

  // "Tell me more" / "Elaborate"
  if (/^(tell me more|more details?|elaborate|continue|go on)\b/i.test(text)) {
    return {
      reply: `Here are deeper operational steps to ensure complete resilience:\n\n` +
        `• **Family Communication Plan:** Designate an out-of-state emergency contact. Local cell networks often overload during disasters, while SMS text messages usually pass through.\n` +
        `• **Sanitation & Hygiene:** Store moist towelettes, heavy garbage bags, bleach for water disinfection (2 drops per liter), and personal hygiene items to prevent post-disaster illness.\n` +
        `• **Digital Backup:** Save digital scans of government IDs, insurance policies, medical records, and property titles onto an encrypted USB drive or secure cloud storage.\n` +
        `• **Community Check-in:** Know your local neighborhood ward counselor or civil defense volunteer contact.\n\n` +
        `Would you like me to open the emergency shelters directory or show emergency contacts?`,
      action: { type: 'OPEN_CONTACTS', label: 'View Emergency Contacts' },
      source: 'DisasterChain Operational Resilience',
    };
  }

  // "What about children and elderly people?"
  if (/\b(children|elderly|seniors?|babies|baby|infants?|older people|grandparents?|kids)\b/i.test(text)) {
    return {
      reply: `🛡️ **Safety Protocols for Vulnerable Family Members (Children & Elderly):**\n\n` +
        `**For Children & Infants:**\n` +
        `• **Infant Nutrition:** Stockpile 7 days of baby formula, sterilized bottles, and shelf-stable baby food.\n` +
        `• **Identification:** Place an emergency ID card in your child’s pocket with family contact names, phone numbers, and any medical conditions.\n` +
        `• **Comfort Items:** Include a familiar toy, coloring book, or comfort blanket in their go-bag to reduce psychological trauma.\n\n` +
        `**For Elderly Family Members:**\n` +
        `• **Medication Reserve:** Maintain a 14 to 30-day reserve of critical prescription medications with a written dosage schedule.\n` +
        `• **Mobility & Sensory Aids:** Keep walkers, canes, spare eyeglasses, and backup hearing aid batteries directly beside their bed.\n` +
        `• **Emergency Caregiver Plan:** Ensure at least two neighbors or family members know their evacuation route and medical needs.`,
      action: { type: 'NAVIGATE', target: '/preparedness', label: 'Preparedness Guides' },
      source: 'DisasterChain Vulnerable Populations Guidelines',
    };
  }

  // "I am worried about the heavy rain"
  if (/\b(worried|scared|afraid|anxious|nervous)\b/i.test(text) && /\b(rain|storm|weather|flood)\b/i.test(text)) {
    return {
      reply: `It is completely normal to feel concerned when severe rain is falling. You are taking the right step by being proactive.\n\n` +
        `Here is what you can do right now to feel confident and secure:\n` +
        `1. 🌦️ **Check Local Rain Telemetry:** Look at the live rainfall intensity in the Weather section.\n` +
        `2. 🚪 **Clear Drains:** Ensure balcony, terrace, and ground-level drainage grating are clear of leaves.\n` +
        `3. 🔋 **Charge Devices:** Charge your phone and power banks now in case of localized power cuts.\n` +
        `4. 🚗 **Avoid Travel:** Stay off waterlogged roads. Never drive into standing water.\n\n` +
        `Would you like me to open the Weather page to check the live precipitation forecast for your area?`,
      action: { type: 'NAVIGATE', target: '/weather', label: 'Check Weather Telemetry' },
      source: 'DisasterChain Calming & Safety Protocol',
    };
  }

  // "Why is disaster preparedness important?"
  if (/\bwhy\s+is\s+disaster\s+preparedness\s+important\b/i.test(text) || /\bimportance of (disaster\s+)?preparedness\b/i.test(text)) {
    return {
      reply: `**Why Disaster Preparedness is Essential:**\n\n` +
        `1. 🩺 **Saves Lives:** Families that know their evacuation route and have emergency supplies can act in seconds instead of panicking.\n` +
        `2. ⏱️ **Bridges the 72-Hour Gap:** After major earthquakes or cyclones, professional emergency responders may take 48 to 72 hours to reach isolated neighborhoods. Your home supplies sustain you during this window.\n` +
        `3. 📉 **Minimizes Economic Damage:** Pre-securing roofs, moving electricals above flood line, and maintaining emergency funds prevents catastrophic financial loss.\n` +
        `4. 🤝 **Protects Vulnerable Loved Ones:** Having mobility aids, backup medicines, and child supplies ready prevents life-threatening disruptions.\n` +
        `5. 🧠 **Prevents Panic:** Knowledge replaces fear with calm, disciplined action.`,
      action: { type: 'NAVIGATE', target: '/preparedness', label: 'Preparedness Center' },
      source: 'DisasterChain Preparedness Foundation',
    };
  }

  // "What should I keep in my emergency kit?" / "Emergency kit checklist"
  if (/\b(emergency\s+kit|go[- ]?bag|disaster\s+kit|bug[- ]?out\s+bag|pack\s+in\s+my\s+bag)\b/i.test(text)) {
    return {
      reply: `🎒 **Essential 72-Hour Disaster Go-Bag Checklist:**\n\n` +
        `1. 💧 **Water:** 3 Liters per person per day for at least 3 days (plus water purification tablets).\n` +
        `2. 🥫 **Food:** 3-day supply of non-perishable, high-calorie food (energy bars, ready-to-eat pouches, nuts).\n` +
        `3. 🩹 **First-Aid Kit:** Antiseptic wipes, sterile gauze, bandages, burn ointment, tweezers, and a tourniquet.\n` +
        `4. 🔦 **Tools & Light:** High-intensity LED flashlight, multi-tool knife, emergency whistle, and work gloves.\n` +
        `5. 📻 **Radio & Power:** Battery or hand-crank AM/FM radio, power bank with charging cables.\n` +
        `6. 📄 **Document Pouch:** Waterproof sealed copies of passports, property deeds, insurance, and emergency cash.\n` +
        `7. 💊 **Personal Needs:** 7 to 14 days of prescription medicines, spare glasses, and thermal space blankets.`,
      action: { type: 'NAVIGATE', target: '/preparedness', label: 'Full Kit Guide' },
      source: 'NDMA & International Red Cross Guidelines',
    };
  }

  // =========================================================================
  // APPLICATION ACTIONS & TOOL NAVIGATION
  // =========================================================================

  // Emergency Contacts & Helplines (Checked before generic SOS to prevent misclassification)
  if (/\b(contacts?|helplines?|phone\s+numbers?|call\s+(police|ambulance|ndrf|emergency|services?)|ambulance|police\s+number)\b/i.test(text)) {
    return {
      reply: `Opening **Emergency Contacts & Helplines**:\n\n` +
        `• 🚨 **National Emergency:** 112\n` +
        `• 🚑 **Ambulance Medical:** 108\n` +
        `• 🚒 **Fire Response:** 101\n` +
        `• 🛡️ **NDRF Disaster Cell:** 1078\n` +
        `• 👮 **Police Control:** 100`,
      action: { type: 'OPEN_CONTACTS', label: 'Show Emergency Contacts' },
      source: 'National Emergency Directory',
    };
  }

  // Emergency SOS Distress Trigger
  const isEmergencyDistress = /\b(sos|i need help|i am in danger|save me|trapped|in immediate danger)\b/i.test(text) ||
    (/\bemergency\b/i.test(text) && !/\b(kit|plan|guide|contacts?|helpline|preparedness)\b/i.test(text));

  if (isEmergencyDistress) {
    return {
      reply: `🚨 **EMERGENCY ASSISTANCE PROTOCOL ACTIVATED**\n\n` +
        `I am immediately opening the DisasterChain Emergency SOS Beacon.\n` +
        `Your high-precision GPS telemetry is being locked for responder dispatch.\n\n` +
        `Please confirm your emergency distress broadcast below, or say **"Confirm SOS"**. If this is an accident, say **"Cancel SOS"**.`,
      action: { type: 'TRIGGER_SOS', label: '🚨 Open Emergency SOS Beacon' },
      source: 'DisasterChain Rapid Response Protocol',
      isEmergency: true,
    };
  }

  // Shelters
  if (/\b(shelters?|safe\s+haven|relief\s+camp|evacuation\s+center)\b/i.test(text)) {
    return {
      reply: `I am opening the **Emergency Shelters Directory** for you. Here you can find verified relief hubs, live bed capacities, supply readiness, and turn-by-turn navigation directions.`,
      action: { type: 'NAVIGATE', target: '/shelters', label: 'Open Shelters Directory' },
      source: 'DisasterChain Shelter Network',
    };
  }

  // 1. WeatherGPT (Unified inside conversation - no separate window)
  if (/\b(weathergpt|weather\s+gpt)\b/i.test(text) && !/\b(open\s+(the\s+)?weather\s+page|navigate\s+to\s+weather)\b/i.test(text)) {
    return {
      reply: `I am your **unified DisasterChain & WeatherGPT AI Assistant**! All WeatherGPT earth intelligence, Doppler telemetry, and forecasting capabilities are integrated directly into our conversation.\n\n` +
        `You can ask me right here:\n` +
        `• *"What's the weather today?"*\n` +
        `• *"Will it rain tomorrow?"*\n` +
        `• *"Should I carry an umbrella?"*\n` +
        `• *"Explain the forecast"*\n` +
        `• *"What precautions should I take during heavy rain?"*\n\n` +
        `What weather or safety details would you like to know?`,
      action: null,
      source: 'Unified WeatherGPT Engine',
    };
  }

  // 2. Explicit Weather Page Navigation (ONLY when user explicitly requests opening the weather page)
  if (
    /\b(open|navigate|go\s+to|switch\s+to|view|show)\s+(the\s+)?weather\s+(page|screen|dashboard|section)\b/i.test(text) ||
    /^(open\s+weather\s+page|go\s+to\s+weather|open\s+the\s+weather\s+page|navigate\s+to\s+weather)$/i.test(text)
  ) {
    return {
      reply: `Navigating to the **Weather Intelligence** dashboard to view localized atmospheric radar, temperature trends, and meteorological forecasts.`,
      action: { type: 'NAVIGATE', target: '/weather', label: 'Open Weather Page' },
      source: 'DisasterChain Earth Intelligence',
    };
  }

  // 3. Heavy Rain & Severe Weather Precautions
  if (
    (/\bprecautions?\b/i.test(text) && /\b(rain|storm|monsoon|flood|weather)\b/i.test(text)) ||
    (/\bwhat\s+precautions\s+should\s+i\s+take\b/i.test(text))
  ) {
    return {
      reply: `🌧️ **Precautions During Heavy Rain & Severe Weather:**\n\n` +
        `1. 🚫 **Avoid Waterlogged Roads & Underpasses:** Never walk, cycle, or drive through flooded roads. Rapid water as shallow as 6 inches can knock an adult down, and 12 inches can sweep away small vehicles.\n` +
        `2. ⚡ **Electrical Safety:** Stay away from fallen power cables, submerged meters, and damp electrical fixtures. Unplug high-voltage home appliances.\n` +
        `3. 🧹 **Keep Drains Unobstructed:** Check that storm drains, terrace gutters, and outlet pipes are clear of fallen leaves and trash.\n` +
        `4. 🎒 **Waterproof Essentials:** Seal mobile devices, torches, prescription medicines, and important documents in ziplock plastic pouches.\n` +
        `5. 📻 **Monitor Local Bulletins:** Follow DisasterChain emergency advisories and regional meteorological radar updates.\n\n` +
        `Would you like to know the rain forecast for tomorrow or find nearby emergency shelters?`,
      action: null,
      source: 'DisasterChain Weather Safety Directives',
    };
  }

  // 4. Conversational Weather & Forecast Queries (Answered inside chat using live telemetry)
  const isWeatherQuery =
    /\b(weather|temperature|temp|forecast|rain(ing|fall)?|umbrella|sunny|cloudy|wind|cyclone|storm|humidity|precipitat(ion|e)|air\s+quality|aqi|downpour|mausam|barish)\b/i.test(text) ||
    /\b(will\s+it\s+rain|chance\s+of\s+rain|is\s+it\s+raining|how\s+(hot|cold|warm)|weather\s+today|today'?s?\s+weather|weather\s+tomorrow|tomorrow'?s?\s+weather|tomorrow'?s?\s+forecast|carry\s+an\s+umbrella|need\s+an?\s+umbrella)\b/i.test(text) ||
    /\b(explain\s+(the\s+)?forecast|forecast\s+explained)\b/i.test(text);

  if (isWeatherQuery) {
    try {
      const weatherRes = await processWeatherGPTChat({
        message: text,
        latitude: context.latitude ?? 30.7499,
        longitude: context.longitude ?? 76.6411,
        location: context.location || 'Kharar',
        language: lang,
        conversation: conversation,
        userRole: context.userRole || 'citizen',
        userMode: 'HOME',
      });
      if (weatherRes && weatherRes.reply) {
        return {
          reply: weatherRes.reply,
          action: null,
          source: 'DisasterChain WeatherGPT Meteorological Intelligence',
        };
      }
    } catch (wErr) {
      console.warn('[ConversationalAI] WeatherGPT fallback error, using local weather summary:', wErr.message);
    }
  }

  // Spatial Map
  if (/\b(map|spatial|gps|satellite|perimeters?|danger\s+zones?)\b/i.test(text)) {
    return {
      reply: `Opening the **Regional Spatial Map**. You can review live danger perimeters, verified incident clusters, safe evacuation corridors, and shelter locations.`,
      action: { type: 'NAVIGATE', target: '/map', label: 'Open Spatial Map' },
      source: 'DisasterChain GIS Reconnaissance',
    };
  }

  // Incidents
  if (/\b(incidents?|report\s+an?\s+incident|damage\s+reports?|alerts?)\b/i.test(text)) {
    return {
      reply: `Navigating to **Incident Reports**. You can report hazards in your area or monitor live verified incidents reported by responders and citizens.`,
      action: { type: 'NAVIGATE', target: '/incidents', label: 'View Incident Reports' },
      source: 'DisasterChain Field Operations',
    };
  }

  // Safety Guidelines
  if (/\b(safety(\s+guidelines?)?|guidelines?|protocols?|what\s+to\s+do|rules?)\b/i.test(text)) {
    return {
      reply: `Opening the official **Disaster Safety Guidelines** center. You can review structured action checklists for floods, earthquakes, cyclones, fires, and tsunamis.`,
      action: { type: 'NAVIGATE', target: '/safety', label: 'Open Safety Guidelines' },
      source: 'DisasterChain Disaster Guidelines',
    };
  }

  // Emergency Contacts
  if (/\b(contacts?|helpline|phone\s+numbers?|call\s+(police|ambulance|ndrf|emergency|services?))\b/i.test(text)) {
    return {
      reply: `Opening **Emergency Contacts & Helplines**:\n\n` +
        `• 🚨 **National Emergency:** 112\n` +
        `• 🚑 **Ambulance Medical:** 108\n` +
        `• 🚒 **Fire Response:** 101\n` +
        `• 🛡️ **NDRF Disaster Cell:** 1078\n` +
        `• 👮 **Police Control:** 100`,
      action: { type: 'OPEN_CONTACTS', label: 'Show Emergency Contacts' },
      source: 'National Emergency Directory',
    };
  }

  // Settings & Themes
  if (/\b(dark\s+mode|tactical\s+mode|night\s+mode)\b/i.test(text)) {
    return {
      reply: `Switching to **Dark Tactical Mode** for high-contrast nighttime and emergency visibility.`,
      action: { type: 'TOGGLE_THEME', target: 'cyclonic', label: 'Dark Mode' },
      source: 'DisasterChain Appearance Settings',
    };
  }

  if (/\b(light\s+mode|daylight\s+mode|day\s+mode)\b/i.test(text)) {
    return {
      reply: `Switching to **Daylight Atmospheric Mode**.`,
      action: { type: 'TOGGLE_THEME', target: 'clear_sky', label: 'Daylight Mode' },
      source: 'DisasterChain Appearance Settings',
    };
  }

  // Return Home
  if (/\b(home|dashboard|main\s+screen|start)\b/i.test(text)) {
    return {
      reply: `Returning to the **DisasterChain Home Command Center**.`,
      action: { type: 'NAVIGATE', target: '/', label: 'Go to Home' },
      source: 'DisasterChain Core',
    };
  }

  // =========================================================================
  // GENERAL INTELLIGENT EXPLANATION (DEFAULT)
  // =========================================================================
  return {
    reply: `I understand your message: *" ${message} "*. \n\n` +
      `As your DisasterChain AI Assistant, I can help you with comprehensive disaster preparedness, explain survival protocols in simple words, or operate features like:\n\n` +
      `• **Shelters:** Say *"Find the nearest shelter"* to view relief camps.\n` +
      `• **Weather:** Say *"What's the weather today?"* or *"Open WeatherGPT"*.\n` +
      `• **Map:** Say *"Show me the map"* for live perimeter monitoring.\n` +
      `• **Safety:** Ask *"What should I do during an earthquake or flood?"*\n` +
      `• **Emergency:** Say *"SOS"* if you require immediate emergency extraction.\n\n` +
      `What would you like to explore next?`,
    action: null,
    source: 'DisasterChain Conversational Intelligence Engine',
  };
}

/**
 * Main Process Entrypoint
 */
async function processConversationalChat({
  message,
  conversation = [],
  latitude = null,
  longitude = null,
  location = null,
  language = 'en',
  userRole = 'citizen',
}) {
  if (!message || typeof message !== 'string' || message.trim().length === 0) {
    throw new Error('Message is required.');
  }

  const cleanMessage = message.trim();
  const validLang = SUPPORTED_LANGUAGES[language] ? language : 'en';

  // 1. Try Live LLM Provider first (if configured with AI_API_KEY)
  let result = null;
  if (process.env.AI_API_KEY && process.env.AI_API_KEY.trim().length > 0) {
    try {
      result = await callExternalConversationalLLM(cleanMessage, conversation, { latitude, longitude, location, userRole }, validLang);
    } catch (e) {
      console.warn('[ConversationalAI] Live provider invocation error:', e.message);
    }
  }

  // 2. Fall back to Intelligent Conversational Engine
  if (!result || !result.reply) {
    result = await generateConversationalFallback(cleanMessage, conversation, validLang, { latitude, longitude, location, userRole });
  }

  return {
    reply: result.reply,
    action: result.action,
    language: validLang,
    source: result.source || 'DisasterChain Conversational Intelligence',
    isEmergency: Boolean(result.isEmergency),
  };
}

module.exports = {
  processConversationalChat,
  generateConversationalFallback,
  extractActionFromText,
  LANGUAGE_NAMES,
};
