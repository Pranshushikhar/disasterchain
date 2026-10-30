/**
 * DisasterChain Natural Language Voice Intent Parser
 * Maps spoken natural language variations to structured application actions.
 * Multi-lingual support with primary coverage for English, Hindi, Punjabi,
 * and semantic keyword matching across all 20 supported languages.
 */

export const INTENTS = {
  // SOS & Emergency (Critical Priority)
  SOS_TRIGGER: 'SOS_TRIGGER',
  SOS_CONFIRM: 'SOS_CONFIRM',
  SOS_CANCEL: 'SOS_CANCEL',

  // Navigation
  NAV_HOME: 'NAV_HOME',
  NAV_WEATHER: 'NAV_WEATHER',
  NAV_SHELTERS: 'NAV_SHELTERS',
  NAV_MAP: 'NAV_MAP',
  NAV_INCIDENTS: 'NAV_INCIDENTS',
  NAV_SAFETY: 'NAV_SAFETY',
  NAV_CONTACTS: 'NAV_CONTACTS',
  NAV_WEATHERGPT: 'NAV_WEATHERGPT',
  NAV_SETTINGS: 'NAV_SETTINGS',
  NAV_BACK: 'NAV_BACK',

  // Shelter Actions
  ACTION_SHELTER_NEARBY: 'ACTION_SHELTER_NEARBY',
  ACTION_SHELTER_DIRECTIONS: 'ACTION_SHELTER_DIRECTIONS',

  // Weather Actions
  ACTION_WEATHER_TODAY: 'ACTION_WEATHER_TODAY',
  ACTION_WEATHER_FORECAST: 'ACTION_WEATHER_FORECAST',
  ACTION_WEATHER_RAIN: 'ACTION_WEATHER_RAIN',

  // Map Actions
  ACTION_MAP_LOCATE: 'ACTION_MAP_LOCATE',
  ACTION_MAP_ZOOM_IN: 'ACTION_MAP_ZOOM_IN',
  ACTION_MAP_ZOOM_OUT: 'ACTION_MAP_ZOOM_OUT',
  ACTION_MAP_SHELTERS: 'ACTION_MAP_SHELTERS',
  ACTION_MAP_INCIDENTS: 'ACTION_MAP_INCIDENTS',

  // Incident Actions
  ACTION_INCIDENT_REPORT: 'ACTION_INCIDENT_REPORT',
  ACTION_INCIDENT_RECENT: 'ACTION_INCIDENT_RECENT',
  ACTION_ALERT_LATEST: 'ACTION_ALERT_LATEST',

  // Safety Guidelines
  ACTION_SAFETY_GUIDELINES: 'ACTION_SAFETY_GUIDELINES',
  ACTION_SAFETY_FLOOD: 'ACTION_SAFETY_FLOOD',
  ACTION_SAFETY_EARTHQUAKE: 'ACTION_SAFETY_EARTHQUAKE',
  ACTION_SAFETY_CYCLONE: 'ACTION_SAFETY_CYCLONE',

  // Emergency Contacts
  ACTION_CONTACT_CALL: 'ACTION_CONTACT_CALL',
  ACTION_CONTACT_AMBULANCE: 'ACTION_CONTACT_AMBULANCE',
  ACTION_CONTACT_NDRF: 'ACTION_CONTACT_NDRF',

  // Settings & Localization
  ACTION_CHANGE_LANGUAGE: 'ACTION_CHANGE_LANGUAGE',
  ACTION_DARK_MODE: 'ACTION_DARK_MODE',
  ACTION_LIGHT_MODE: 'ACTION_LIGHT_MODE',

  // Conversational WeatherGPT
  WEATHERGPT_QUERY: 'WEATHERGPT_QUERY',
  UNKNOWN: 'UNKNOWN',
};

// Supported language name mappings to language codes
const LANGUAGE_NAME_MAP = {
  english: 'en',
  angrezi: 'en',
  hindi: 'hi',
  hind: 'hi',
  punjabi: 'pa',
  panjabi: 'pa',
  bengali: 'bn',
  bangla: 'bn',
  tamil: 'ta',
  telugu: 'te',
  marathi: 'mr',
  gujarati: 'gu',
  kannada: 'kn',
  malayalam: 'ml',
  odia: 'or',
  oriya: 'or',
  assamese: 'as',
  asamiya: 'as',
  urdu: 'ur',
  sanskrit: 'sa',
  kashmiri: 'ks',
  konkani: 'kok',
  maithili: 'mai',
  nepali: 'ne',
  sindhi: 'sd',
  manipuri: 'mni',
  meitei: 'mni',
};

/**
 * Normalizes input text for resilient matching
 */
function normalize(str) {
  return (str || '')
    .toLowerCase()
    .trim()
    .replace(/[.,?!:;'"()\[\]{}]/g, '')
    .replace(/\s+/g, ' ');
}

/**
 * Parses user speech text and returns the detected intent with parameters
 * @param {string} rawText Spoken text
 * @param {object} context Active page route, location, modal states
 */
export function parseVoiceIntent(rawText, context = {}) {
  const text = normalize(rawText);
  if (!text) {
    return { intent: INTENTS.UNKNOWN, rawText, confidence: 0 };
  }

  // 1. SOS Critical Confirmations & Cancellations (Priority 1)
  if (
    context.isSosConfirming ||
    context.isSosOpen
  ) {
    if (
      /^(confirm|confirm sos|yes send|send sos|yes emergency|proceed|confirm emergency|haan bhejo|sos bhejo)$/i.test(
        text
      ) ||
      text.includes('confirm sos') ||
      text.includes('yes send')
    ) {
      return { intent: INTENTS.SOS_CONFIRM, rawText, confidence: 0.99 };
    }

    if (
      /^(cancel|cancel sos|stop|abort|no|don't send|dont send|close|ruk jao|band karo)$/i.test(
        text
      ) ||
      text.includes('cancel sos') ||
      text.includes('stop emergency')
    ) {
      return { intent: INTENTS.SOS_CANCEL, rawText, confidence: 0.99 };
    }
  }

  // Exclude specific informational queries from generic SOS trigger
  const isEmergencyExclusion = /\bemergency\s+(contacts?|helplines?|numbers?|shelters?|services?)\b/i.test(text);

  // 2. SOS Trigger (Critical Priority from any page)
  if (
    !isEmergencyExclusion &&
    /\b(sos|emergency|distress|i need help|send an sos|send sos|i am in danger|activate emergency assistance|bachao|madad|khatra|emergency lagao|help me|immediate help)\b/i.test(
      text
    )
  ) {
    return {
      intent: INTENTS.SOS_TRIGGER,
      rawText,
      confidence: 0.98,
      guidance: 'Preparing emergency protocol. Say "Confirm SOS" to transmit distress beacon.',
    };
  }

  // 3. Language Switching
  const langMatch = text.match(
    /(?:change language to|switch language to|set language to|change to|switch to|language|bhasha badlo)\s+([a-zA-Z\u0900-\u097F]+)/i
  );
  if (langMatch && langMatch[1]) {
    const rawTarget = langMatch[1].toLowerCase().trim();
    const targetCode = LANGUAGE_NAME_MAP[rawTarget];
    if (targetCode) {
      return {
        intent: INTENTS.ACTION_CHANGE_LANGUAGE,
        rawText,
        languageCode: targetCode,
        languageName: rawTarget,
        confidence: 0.95,
      };
    }
  }

  // Direct short language switches: "hindi", "punjabi", "english" if preceded by "in" or "to"
  const directLang = text.match(/\b(?:to|in)\s+(english|hindi|punjabi|bengali|tamil|telugu|marathi|gujarati|kannada|malayalam|urdu)\b/i);
  if (directLang && LANGUAGE_NAME_MAP[directLang[1].toLowerCase()]) {
    return {
      intent: INTENTS.ACTION_CHANGE_LANGUAGE,
      rawText,
      languageCode: LANGUAGE_NAME_MAP[directLang[1].toLowerCase()],
      languageName: directLang[1],
      confidence: 0.9,
    };
  }

  // 4. Specific Application Actions (Action before generic Navigation)

  // 4A. Shelter Specific Actions
  if (
    /\b(nearest shelter|closest shelter|find shelters near me|shelters near me|show the nearest shelter|which one is closest|closest safe shelter|nearest safe shelter)\b/i.test(
      text
    )
  ) {
    return { intent: INTENTS.ACTION_SHELTER_NEARBY, rawText, confidence: 0.95 };
  }

  if (
    /\b(get directions to this shelter|directions to shelter|navigate to shelter|how do i get there|route to shelter)\b/i.test(
      text
    )
  ) {
    return { intent: INTENTS.ACTION_SHELTER_DIRECTIONS, rawText, confidence: 0.92 };
  }

  // 4B. Weather Specific Actions
  if (
    /\b(tomorrow'?s? forecast|forecast for tomorrow|weather tomorrow|kal ka mausam|will it rain tomorrow)\b/i.test(
      text
    )
  ) {
    return { intent: INTENTS.ACTION_WEATHER_FORECAST, rawText, confidence: 0.94 };
  }

  if (
    /\b(is it going to rain|will it rain|rain expected|chance of rain|barish hogi|kya barish hogi|is it raining)\b/i.test(
      text
    )
  ) {
    return { intent: INTENTS.ACTION_WEATHER_RAIN, rawText, confidence: 0.92 };
  }

  if (
    /\b(what'?s? the weather today|what is the weather like today|tell me the temperature|what is the temperature|current temperature|temperature today|aaj ka mausam)\b/i.test(
      text
    )
  ) {
    return { intent: INTENTS.ACTION_WEATHER_TODAY, rawText, confidence: 0.95 };
  }

  // 4C. Map Specific Actions
  if (
    /\b(show my current location|find my current location|where am i|locate me|find my location|my coordinates|mera sthan)\b/i.test(
      text
    )
  ) {
    return { intent: INTENTS.ACTION_MAP_LOCATE, rawText, confidence: 0.95 };
  }

  if (/\b(zoom in|magnify map)\b/i.test(text)) {
    return { intent: INTENTS.ACTION_MAP_ZOOM_IN, rawText, confidence: 0.95 };
  }

  if (/\b(zoom out)\b/i.test(text)) {
    return { intent: INTENTS.ACTION_MAP_ZOOM_OUT, rawText, confidence: 0.95 };
  }

  if (/\b(show emergency shelters on the map|shelters on map|shelter map)\b/i.test(text)) {
    return { intent: INTENTS.ACTION_MAP_SHELTERS, rawText, confidence: 0.92 };
  }

  if (/\b(show nearby incidents|incidents on the map|incidents on map)\b/i.test(text)) {
    return { intent: INTENTS.ACTION_MAP_INCIDENTS, rawText, confidence: 0.92 };
  }

  // 4D. Incident Specific Actions
  if (/\b(report an incident|report incident|submit an incident|new report|hadsa darj karo)\b/i.test(text)) {
    return { intent: INTENTS.ACTION_INCIDENT_REPORT, rawText, confidence: 0.95 };
  }

  if (/\b(recent incidents|show recent incidents|open my reports|my incident reports)\b/i.test(text)) {
    return { intent: INTENTS.ACTION_INCIDENT_RECENT, rawText, confidence: 0.92 };
  }

  if (/\b(latest alert|active alerts|tell me about the latest alert|warning bulletins|active bulletins)\b/i.test(text)) {
    return { intent: INTENTS.ACTION_ALERT_LATEST, rawText, confidence: 0.9 };
  }

  // 4E. Safety & Disaster Preparedness Guidance
  if (/\b(flood|badh)\b/i.test(text) && /\b(what should i do|safety|guidelines|prepare|instructions)\b/i.test(text)) {
    return { intent: INTENTS.ACTION_SAFETY_FLOOD, rawText, confidence: 0.95 };
  }

  if (/\b(earthquake|bhookamp)\b/i.test(text) && /\b(safety|instructions|what should i do|guidelines)\b/i.test(text)) {
    return { intent: INTENTS.ACTION_SAFETY_EARTHQUAKE, rawText, confidence: 0.95 };
  }

  if (/\b(cyclone|toofan|storm)\b/i.test(text) && /\b(prepare|preparation|safety|what should i do|guidelines)\b/i.test(text)) {
    return { intent: INTENTS.ACTION_SAFETY_CYCLONE, rawText, confidence: 0.95 };
  }

  // 4F. Emergency Contacts Actions
  if (/\b(call emergency services|dial 112|call 112|call police|call dispatch)\b/i.test(text)) {
    return { intent: INTENTS.ACTION_CONTACT_CALL, rawText, number: '112', confidence: 0.95 };
  }

  if (/\b(ambulance contact|show ambulance contact|call ambulance|ambulance number|108)\b/i.test(text)) {
    return { intent: INTENTS.ACTION_CONTACT_AMBULANCE, rawText, number: '108', confidence: 0.95 };
  }

  if (/\b(ndrf contact|show ndrf contact|ndrf helpline|disaster cell|1078)\b/i.test(text)) {
    return { intent: INTENTS.ACTION_CONTACT_NDRF, rawText, number: '1078', confidence: 0.95 };
  }

  // 4G. Theme & Environment Settings
  if (/\b(dark mode|night mode|turn on dark mode)\b/i.test(text)) {
    return { intent: INTENTS.ACTION_DARK_MODE, rawText, confidence: 0.9 };
  }

  if (/\b(light mode|day mode|turn on light mode)\b/i.test(text)) {
    return { intent: INTENTS.ACTION_LIGHT_MODE, rawText, confidence: 0.9 };
  }

  // 5. Complete Voice Navigation
  // 5A. Shelters Page
  if (
    /\b(shelter|shelters|relief camp|relief camps|ashray|sharan)\b/i.test(text) &&
    /\b(open|take me to|show|go to|see|want to see|navigate to|page)\b/i.test(text)
  ) {
    return { intent: INTENTS.NAV_SHELTERS, rawText, targetPath: '/shelters', confidence: 0.94 };
  }
  if (/^(open shelters|show shelters|shelters|relief camps|take me to shelters)$/i.test(text)) {
    return { intent: INTENTS.NAV_SHELTERS, rawText, targetPath: '/shelters', confidence: 0.96 };
  }

  // 5B. Weather Page
  if (
    /\b(weather|forecast|mausam)\b/i.test(text) &&
    /\b(open|take me to|show|go to|see|page)\b/i.test(text)
  ) {
    return { intent: INTENTS.NAV_WEATHER, rawText, targetPath: '/weather', confidence: 0.94 };
  }
  if (/^(open weather|show weather|weather page|take me to weather|weather)$/i.test(text)) {
    return { intent: INTENTS.NAV_WEATHER, rawText, targetPath: '/weather', confidence: 0.96 };
  }

  // 5C. Map Page
  if (
    /\b(map|satellite|naksha)\b/i.test(text) &&
    /\b(open|take me to|show|go to|view|page)\b/i.test(text)
  ) {
    return { intent: INTENTS.NAV_MAP, rawText, targetPath: '/map', confidence: 0.94 };
  }
  if (/^(open map|show map|map page|take me to map|open the map|map)$/i.test(text)) {
    return { intent: INTENTS.NAV_MAP, rawText, targetPath: '/map', confidence: 0.96 };
  }

  // 5D. Incidents Page
  if (
    /\b(incident|incidents|incident reports|reports|ghatna)\b/i.test(text) &&
    /\b(open|take me to|show|go to|view|page)\b/i.test(text)
  ) {
    return { intent: INTENTS.NAV_INCIDENTS, rawText, targetPath: '/incidents', confidence: 0.94 };
  }
  if (/^(open incidents|show incidents|incident reports|take me to incidents)$/i.test(text)) {
    return { intent: INTENTS.NAV_INCIDENTS, rawText, targetPath: '/incidents', confidence: 0.96 };
  }

  // 5E. Safety Page
  if (
    /\b(safety|preparedness|safety guidelines|guides|suraksha)\b/i.test(text) &&
    /\b(open|take me to|show|go to|view|page)\b/i.test(text)
  ) {
    return { intent: INTENTS.NAV_SAFETY, rawText, targetPath: '/safety', confidence: 0.94 };
  }
  if (/^(open safety|safety page|show safety|open safety guidelines|safety)$/i.test(text)) {
    return { intent: INTENTS.NAV_SAFETY, rawText, targetPath: '/safety', confidence: 0.96 };
  }

  // 5F. Emergency Contacts
  if (
    /\b(emergency contacts|contacts|helpline|helpline numbers|phone numbers|sampark)\b/i.test(text) &&
    /\b(open|take me to|show|go to|view)\b/i.test(text)
  ) {
    return { intent: INTENTS.NAV_CONTACTS, rawText, confidence: 0.94 };
  }
  if (/^(emergency contacts|contacts|show contacts|open emergency contacts)$/i.test(text)) {
    return { intent: INTENTS.NAV_CONTACTS, rawText, confidence: 0.96 };
  }

  // 5G. WeatherGPT
  if (
    /\b(weathergpt|weather gpt|ai assistant|copilot|open weathergpt|ask weathergpt)\b/i.test(text)
  ) {
    // If it contains a specific question for WeatherGPT
    const questionMatch = rawText.match(/(?:ask weathergpt|ask ai|weathergpt)\s+(.+)/i);
    if (questionMatch && questionMatch[1].trim()) {
      return {
        intent: INTENTS.WEATHERGPT_QUERY,
        rawText,
        query: questionMatch[1].trim(),
        confidence: 0.95,
      };
    }
    return { intent: INTENTS.NAV_WEATHERGPT, rawText, confidence: 0.96 };
  }

  // 5H. Settings
  if (
    /\b(settings|preferences|open settings|take me to settings)\b/i.test(text)
  ) {
    return { intent: INTENTS.NAV_SETTINGS, rawText, confidence: 0.95 };
  }

  // 5I. Navigation Back
  if (
    /^(go back|back|return|previous page|peeche jao)$/i.test(text) ||
    /\b(go back to previous|take me back)\b/i.test(text)
  ) {
    return { intent: INTENTS.NAV_BACK, rawText, confidence: 0.95 };
  }

  // 5J. Navigation Home
  if (
    /^(return to home|go to home|go home|home page|home|main page|dashboard|ghar jao)$/i.test(text) ||
    /\b(take me home|back to home|return home)\b/i.test(text)
  ) {
    return { intent: INTENTS.NAV_HOME, rawText, targetPath: '/', confidence: 0.96 };
  }

  // 6. Conversational WeatherGPT Queries (Fallback for any natural weather / emergency inquiry)
  // If user is already on WeatherGPT or asks a natural language question (e.g. "What should I carry outside?")
  if (
    context.isWeatherGPTOpen ||
    /\b(what should i|how can i|can i|is it safe|what are|should i carry|why is|explain)\b/i.test(text)
  ) {
    return {
      intent: INTENTS.WEATHERGPT_QUERY,
      rawText,
      query: rawText,
      confidence: 0.85,
    };
  }

  return { intent: INTENTS.UNKNOWN, rawText, confidence: 0.2 };
}
