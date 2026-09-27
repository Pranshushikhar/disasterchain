/**
 * WeatherGPT 2.0 Intent Router
 * Classifies user queries into 26+ specific intents, extracts temporal horizons,
 * activity types, and conversational follow-up parameters.
 */

const INTENTS = {
  EMERGENCY: 'EMERGENCY',
  OFF_TOPIC: 'OFF_TOPIC',
  EXPLANATION: 'EXPLANATION',
  WEATHER_COMPARISON: 'WEATHER_COMPARISON',
  COMPARISON: 'WEATHER_COMPARISON',
  TRAVEL: 'TRAVEL',
  SCHOOL_COLLEGE: 'SCHOOL_COLLEGE',
  COMMUTE: 'COMMUTE',
  OUTDOOR_ACTIVITY: 'OUTDOOR_ACTIVITY',
  OUTDOOR: 'OUTDOOR_ACTIVITY',
  CLOTHING: 'CLOTHING',
  AGRICULTURE: 'AGRICULTURE',
  HEALTH_WEATHER: 'HEALTH_WEATHER',
  FLOOD: 'FLOOD',
  CYCLONE: 'CYCLONE',
  STORM: 'STORM',
  HEAT: 'HEAT',
  COLD: 'COLD',
  WIND: 'WIND',
  GUSTS: 'WIND',
  RAIN: 'RAIN',
  PRECIPITATION: 'RAIN',
  AIR_QUALITY: 'AIR_QUALITY',
  AQI: 'AIR_QUALITY',
  PM25: 'AIR_QUALITY',
  PM10: 'AIR_QUALITY',
  UV: 'HEAT',
  VISIBILITY: 'VISIBILITY',
  DISASTER_PREPAREDNESS: 'DISASTER_PREPAREDNESS',
  PREPAREDNESS: 'DISASTER_PREPAREDNESS',
  WEATHER_FORECAST: 'WEATHER_FORECAST',
  TODAY_FORECAST: 'WEATHER_FORECAST',
  TOMORROW_FORECAST: 'WEATHER_FORECAST',
  LOCATION_WEATHER: 'LOCATION_WEATHER',
  HISTORICAL_WEATHER: 'HISTORICAL_WEATHER',
  FOLLOW_UP: 'FOLLOW_UP',
  WEATHER_CURRENT: 'WEATHER_CURRENT',
  CURRENT_WEATHER: 'WEATHER_CURRENT',
  GENERAL_WEATHER: 'WEATHER_CURRENT',
  TEMPERATURE: 'WEATHER_CURRENT',
  HUMIDITY: 'WEATHER_CURRENT',
  TREND: 'WEATHER_COMPARISON',
  SPECIFIC_DATE: 'WEATHER_FORECAST',
  SPECIFIC_HOUR: 'WEATHER_FORECAST',
  UNKNOWN: 'UNKNOWN',
};

const EMERGENCY_KEYWORDS = [
  'trapped', 'drowning', 'water rising fast', 'flash flood', 'dying', 'cannot breathe',
  'house collapsed', 'buried', 'sos', 'save me', 'life threat', 'severe injury',
  'बचाओ', 'मदद', 'सहायता', 'বাঁচাও', 'உதவி', 'సహాయం', 'مدد'
];

const OFF_TOPIC_KEYWORDS = [
  'joke', 'riddle', 'poem', 'poetry', 'sing a song', 'recipe', 'cook',
  'cricket score', 'football match', 'crypto', 'bitcoin', 'stock market',
  'dating', 'movie review', 'video game', 'write code', 'do my homework'
];

/**
 * Format local date YYYY-MM-DD with offset
 */
function getLocalDateString(offsetDays = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Hard Time-Window Extraction & Temporal Resolution Engine
 * Explicitly resolves temporal horizons: CURRENT, TODAY, TOMORROW, WEEKEND,
 * NEXT_3_DAYS, NEXT_7_DAYS, COMPARISON, and specific hourly bindings.
 */
function resolveTimeScope(text, conversationContext = {}) {
  const t = (text || '').toLowerCase().trim();
  const todayDate = getLocalDateString(0);
  const tomorrowDate = getLocalDateString(1);

  // 1. Comparison queries (e.g. "Is tomorrow wetter than today?", "compare today and tomorrow")
  const isComparisonQuery = /\b(compare|difference between|vs|versus|wetter than|hotter than|colder than|drier than|rainier than|what changed since today)\b/i.test(t) &&
    (/\b(today|tomorrow|yesterday)\b/i.test(t) || /\b(is tomorrow|will tomorrow be|compare today)\b/i.test(t));
  if (isComparisonQuery) {
    return {
      timeScope: 'COMPARISON',
      type: 'COMPARISON',
      isComparison: true,
      comparisonScopes: ['TODAY', 'TOMORROW'],
      targetDate: tomorrowDate,
      targetHour: null,
      targetHours: null,
      targetWindow: null,
      label: 'Today vs Tomorrow',
    };
  }

  // 2. Extract hour if mentioned:
  // e.g. "at 8 pm", "around 8 pm", "8pm", "8 pm", "20:00", "8:00 pm", "tomorrow 8pm", "around 8"
  let targetHour = null;
  const hourMatch = t.match(/\b(?:at|around|by|from|till|until)?\s*(\d{1,2})(?::(\d{2}))?\s*(am|pm)\b/i) ||
                    t.match(/\b(?:at|around)?\s*(\d{1,2}):(\d{2})\b/i) ||
                    t.match(/\b(?:at|around)\s+(\d{1,2})\b/i) ||
                    t.match(/\b(\d{1,2})\s*(am|pm)\b/i);
  if (hourMatch) {
    let hour = parseInt(hourMatch[1], 10);
    const meridiem = (hourMatch[3] || hourMatch[2] || '').toLowerCase();
    if (meridiem === 'pm' && hour < 12) hour += 12;
    else if (meridiem === 'am' && hour === 12) hour = 0;
    else if (!meridiem) {
      // Check contextual hints like "evening", "shaam", "night", "raat"
      if (/\b(evening|night|shaam|raat)\b/i.test(t) && hour <= 12) {
        hour += 12;
      }
    }
    if (hour >= 0 && hour <= 23) {
      targetHour = hour;
    }
  }

  // 3. Explicit switch back to TODAY (e.g. "what about today?", "what is the weather today?", "and today?", "today", "aaj")
  const isExplicitToday = /\b(what about today|what is the weather today|how is the weather today|weather today|and today|how about today|today|aaj)\b/i.test(t) || /(आज|आज का)/i.test(t);
  const isTodayMorning = /\b(this morning|today morning|aaj subah)\b/i.test(t) || /(आज सुबह|आज प्रातः)/i.test(t);
  const isTodayAfternoon = /\b(this afternoon|today afternoon|aaj dopahar)\b/i.test(t) || /(आज दोपहर)/i.test(t);
  const isTonight = /\b(tonight|this evening|today evening|aaj shaam|aaj raat)\b/i.test(t) || /(आज शाम|आज रात)/i.test(t);

  // 4. Explicit TOMORROW
  const isExplicitTomorrow = /\b(tomorrow|next day|kal)\b/i.test(t) || /(कल|कल का|आगामी कल)/i.test(t);
  const isTomorrowMorning = /\b(tomorrow morning|kal subah)\b/i.test(t) || /(कल सुबह|कल प्रातः)/i.test(t);
  const isTomorrowAfternoon = /\b(tomorrow afternoon|kal dopahar)\b/i.test(t) || /(कल दोपहर)/i.test(t);
  const isTomorrowEvening = /\b(tomorrow evening|tomorrow night|kal shaam|kal raat)\b/i.test(t) || /(कल शाम|कल सायंकाल|कल रात)/i.test(t);
  const isTomorrowNight = /\b(tomorrow night|kal raat)\b/i.test(t) || /(कल रात)/i.test(t);

  // 5. Explicit CURRENT
  const isExplicitCurrent = /\b(right now|currently|at the moment|at present|now|abhi|live)\b/i.test(t) ||
    /(अभी|वर्तमान|इस समय)/i.test(t) ||
    /^(what('?s| is) the weather right now|how is the weather right now|current weather)/i.test(t);

  if (isExplicitCurrent && !isExplicitTomorrow && !isExplicitToday) {
    return {
      timeScope: 'CURRENT',
      type: 'NOW',
      targetDate: todayDate,
      targetHour: null,
      targetHours: null,
      targetWindow: null,
      label: 'Right Now',
    };
  }

  // Handle Tomorrow explicitly
  if (isExplicitTomorrow) {
    let targetWindow = null;
    let targetHours = targetHour != null ? [targetHour] : null;
    let label = 'Tomorrow';

    if (targetHour != null) {
      const hDisplay = targetHour % 12 === 0 ? 12 : targetHour % 12;
      const meridiem = targetHour >= 12 ? 'PM' : 'AM';
      label = `Tomorrow at ${hDisplay}:00 ${meridiem}`;
    } else if (isTomorrowMorning) {
      targetWindow = 'MORNING';
      targetHours = [6, 7, 8, 9, 10, 11];
      label = 'Tomorrow Morning';
    } else if (isTomorrowAfternoon) {
      targetWindow = 'AFTERNOON';
      targetHours = [12, 13, 14, 15, 16];
      label = 'Tomorrow Afternoon';
    } else if (isTomorrowEvening) {
      targetWindow = 'EVENING';
      targetHours = [17, 18, 19, 20, 21];
      label = 'Tomorrow Evening';
      targetHour = 19; // Default representative evening hour if not specified
    } else if (isTomorrowNight) {
      targetWindow = 'NIGHT';
      targetHours = [21, 22, 23];
      label = 'Tomorrow Night';
      targetHour = 21;
    }

    return {
      timeScope: 'TOMORROW',
      type: targetHour != null ? 'SPECIFIC_HOUR' : (targetWindow ? `TOMORROW_${targetWindow}` : 'TOMORROW'),
      targetDate: tomorrowDate,
      targetHour,
      targetHours,
      targetWindow,
      label,
    };
  }

  // Handle Today explicitly
  if (isExplicitToday || isTodayMorning || isTodayAfternoon || isTonight) {
    let targetWindow = null;
    let targetHours = targetHour != null ? [targetHour] : null;
    let label = 'Today';

    if (targetHour != null) {
      const hDisplay = targetHour % 12 === 0 ? 12 : targetHour % 12;
      const meridiem = targetHour >= 12 ? 'PM' : 'AM';
      label = `Today at ${hDisplay}:00 ${meridiem}`;
    } else if (isTodayMorning) {
      targetWindow = 'MORNING';
      targetHours = [6, 7, 8, 9, 10, 11];
      label = 'This Morning';
    } else if (isTodayAfternoon) {
      targetWindow = 'AFTERNOON';
      targetHours = [12, 13, 14, 15, 16];
      label = 'This Afternoon';
    } else if (isTonight) {
      targetWindow = 'EVENING';
      targetHours = [17, 18, 19, 20, 21, 22];
      label = 'Tonight';
    }

    return {
      timeScope: 'TODAY',
      type: targetHour != null ? 'SPECIFIC_HOUR' : (targetWindow || 'TODAY'),
      targetDate: todayDate,
      targetHour,
      targetHours,
      targetWindow,
      label,
    };
  }

  // Handle Multi-day Horizons
  if (/\b(this weekend|weekend|saturday|sunday)\b/i.test(t)) {
    return {
      timeScope: 'WEEKEND',
      type: 'WEEKEND',
      targetDate: null,
      targetHour: null,
      targetHours: null,
      targetWindow: null,
      label: 'This Weekend',
    };
  }
  if (/\b(next 3 days|3 days|upcoming 3 days)\b/i.test(t)) {
    return {
      timeScope: 'NEXT_3_DAYS',
      type: 'NEXT_3_DAYS',
      targetDate: null,
      targetHour: null,
      targetHours: null,
      targetWindow: null,
      label: 'Next 3 Days',
    };
  }
  if (/\b(week|next week|7 days|7-day|upcoming days|7-day outlook)\b/i.test(t)) {
    return {
      timeScope: 'NEXT_7_DAYS',
      type: 'WEEKLY',
      targetDate: null,
      targetHour: null,
      targetHours: null,
      targetWindow: null,
      label: 'Next 7 Days',
    };
  }

  // 6. Conversational Memory: Inherit TOMORROW from parent conversation context!
  // If previous turn was TOMORROW, queries like:
  // "What about 8 PM?", "How about 9 PM?", "Should I carry an umbrella?", "Can I go outside?", "What about my commute?"
  // MUST INHERIT TOMORROW!
  const parentScope = conversationContext?.lastTimeScope;
  if (parentScope === 'TOMORROW') {
    const targetDate = tomorrowDate;
    const finalHour = targetHour != null ? targetHour : conversationContext?.lastTargetHour;
    const hDisplay = finalHour != null ? (finalHour % 12 === 0 ? 12 : finalHour % 12) : null;
    const meridiem = finalHour != null ? (finalHour >= 12 ? 'PM' : 'AM') : null;
    const label = finalHour != null ? `Tomorrow around ${hDisplay}:00 ${meridiem}` : 'Tomorrow';

    return {
      timeScope: 'TOMORROW',
      type: finalHour != null ? 'SPECIFIC_HOUR' : 'TOMORROW',
      targetDate,
      targetHour: finalHour,
      targetHours: finalHour != null ? [finalHour] : null,
      targetWindow: conversationContext?.lastTargetWindow || null,
      label,
      inherited: true,
    };
  }

  // Handle Hour Follow-up with Today as default if no parent scope
  if (targetHour != null) {
    const hDisplay = targetHour % 12 === 0 ? 12 : targetHour % 12;
    const meridiem = targetHour >= 12 ? 'PM' : 'AM';
    const label = `Today around ${hDisplay}:00 ${meridiem}`;

    return {
      timeScope: 'TODAY',
      type: 'SPECIFIC_HOUR',
      targetDate: todayDate,
      targetHour,
      targetHours: [targetHour],
      targetWindow: null,
      label,
      inherited: false,
    };
  }

  // Handle Context Preservation for "Tell me more" or short follow-ups
  const isTellMeMore = /\b(tell me more|more details|elaborate|aur batao|explain more)\b/i.test(t);
  if (isTellMeMore && conversationContext?.lastTimeScope) {
    return {
      timeScope: conversationContext.lastTimeScope,
      type: conversationContext.lastTimeframe?.type || conversationContext.lastTimeScope,
      targetDate: conversationContext.lastTargetDate || (conversationContext.lastTimeScope === 'TOMORROW' ? tomorrowDate : todayDate),
      targetHour: conversationContext.lastTargetHour ?? null,
      targetHours: conversationContext.lastTargetHours ?? null,
      targetWindow: conversationContext.lastTargetWindow ?? null,
      label: conversationContext.lastTimeframe?.label || conversationContext.lastTimeScope,
      inherited: true,
    };
  }

  // Default fallback:
  // If the query asks "will it rain" or "is it going to rain" without mentioning tomorrow or today:
  if (/\b(rain|raining|umbrella|precipitation)\b/i.test(t)) {
    return {
      timeScope: 'TODAY',
      type: 'TODAY',
      targetDate: todayDate,
      targetHour: null,
      targetHours: null,
      targetWindow: null,
      label: 'Today',
    };
  }

  return {
    timeScope: 'CURRENT',
    type: 'NOW',
    targetDate: todayDate,
    targetHour: null,
    targetHours: null,
    targetWindow: null,
    label: 'Now',
  };
}

/**
 * Extract specific activity type
 */
function extractActivity(text) {
  const t = text.toLowerCase();
  if (/\b(run|running|jog|jogging|morning run|evening jog)\b/i.test(t)) return 'RUNNING';
  if (/\b(cycling|cycle|bike ride|biking)\b/i.test(t)) return 'CYCLING';
  if (/\b(drive|driving|drive car|ride bike|highway travel|road trip)\b/i.test(t)) return 'DRIVING';
  if (/\b(outdoor event|picnic|wedding|party outside|barbecue|bbq|gathering)\b/i.test(t)) return 'OUTDOOR_EVENT';
  if (/\b(dry clothes|drying clothes|wash clothes|washing clothes|kapde)\b/i.test(t)) return 'DRYING_CLOTHES';
  if (/\b(photo|photography|golden hour|photoshoot|camera)\b/i.test(t)) return 'PHOTOGRAPHY';
  if (/\b(football|cricket|tennis|basketball|match|play outside|ground)\b/i.test(t)) return 'SPORTS';
  if (/\b(walk|stroll|go outside|step out|safe to go out)\b/i.test(t)) return 'GENERAL_OUTDOOR';
  return null;
}

/**
 * Extract Weather Science Explanation Topic
 */
function extractExplanationTopic(text) {
  const t = (text || '').toLowerCase();
  const isExplanatoryQuestion = /\b(why|how|what causes|what does|explain|science)\b/i.test(t);

  if (/\b(humidity|humid)\b/i.test(t) && /\b(doesn'?t rain|no rain|why)\b/i.test(t)) {
    return 'HUMIDITY_NO_RAIN';
  }
  if (isExplanatoryQuestion && /\b(feel|feels like|apparent temperature|hotter than|colder than|why does it feel)\b/i.test(t)) {
    return 'FEELS_LIKE_TEMP';
  }
  if (isExplanatoryQuestion && /\b(pressure|barometer|barometric)\b/i.test(t) && /\b(dropping|falling|mean)\b/i.test(t)) {
    return 'PRESSURE_DROP';
  }
  if (isExplanatoryQuestion && /\b(clouds|cloud formation|increasing|form)\b/i.test(t)) {
    return 'CLOUDS_FORMING';
  }
  if (isExplanatoryQuestion && /\b(thunderstorm|thunderstorms|lightning|thunder)\b/i.test(t)) {
    return 'THUNDERSTORM_CAUSE';
  }
  if (isExplanatoryQuestion && /\b(dew point|dewpoint)\b/i.test(t)) {
    return 'DEW_POINT';
  }
  if (isExplanatoryQuestion && /\b(uv|uv index|ultraviolet)\b/i.test(t)) {
    return 'UV_EXPLANATION';
  }
  return null;
}

/**
 * Analyze user message into primary intent, secondary intents, timeframe, and parameters
 */
function routeIntent(message, conversationContext = {}) {
  const rawText = String(message || '').trim();
  const text = rawText.toLowerCase();

  // 1. Life-Threatening Emergency
  if (EMERGENCY_KEYWORDS.some((k) => text.includes(k))) {
    return {
      primaryIntent: INTENTS.EMERGENCY,
      timeframe: { type: 'NOW', label: 'Immediate' },
      isEmergency: true,
      rawText,
    };
  }

  // 2. Off-Topic Query
  if (OFF_TOPIC_KEYWORDS.some((k) => text.includes(k))) {
    return {
      primaryIntent: INTENTS.OFF_TOPIC,
      timeframe: { type: 'NOW', label: 'Now' },
      isOffTopic: true,
      rawText,
    };
  }

  const timeframe = resolveTimeScope(text, conversationContext);
  const activity = extractActivity(text);
  const explanationTopic = extractExplanationTopic(text);

  let rawResult = null;

  // 3. Follow-up Query Resolution (e.g. "What about my college commute?", "Around 7 PM", "Tell me more")
  const isShortFollowUp = text.length < 35 && (
    /^(what about|and for|how about|what of|tell me more|what about my|around\s+\d|at\s+\d)/i.test(text) ||
    /^(will it affect|is it safe|should i go|can i still|and tomorrow|what then)/i.test(text)
  );

  if (isShortFollowUp && conversationContext?.lastIntent) {
    if (/\b(commute|college|school|class|office)\b/i.test(text)) {
      rawResult = {
        primaryIntent: INTENTS.SCHOOL_COLLEGE,
        secondaryIntent: INTENTS.FOLLOW_UP,
        inheritedFromContext: true,
        activity: 'COMMUTE',
      };
    } else if (/\b(drive|driving|car|travel|bike)\b/i.test(text)) {
      rawResult = {
        primaryIntent: INTENTS.TRAVEL,
        secondaryIntent: INTENTS.FOLLOW_UP,
        inheritedFromContext: true,
        activity: 'DRIVING',
      };
    } else if (timeframe.targetHour != null || timeframe.type === 'SPECIFIC_HOUR') {
      rawResult = {
        primaryIntent: conversationContext.lastIntent || INTENTS.WEATHER_FORECAST,
        secondaryIntent: INTENTS.FOLLOW_UP,
        inheritedFromContext: true,
      };
    }
  }

  // 4. Weather Science Explanation Mode ("Why is humidity 90%?", "What does pressure dropping mean?")
  if (!rawResult && (explanationTopic || (/\b(why|how come|explain|what is the science|what causes)\b/i.test(text) && /\b(weather|rain|cloud|humidity|heat|temp|pressure|wind|aqi)\b/i.test(text)))) {
    rawResult = {
      primaryIntent: INTENTS.EXPLANATION,
      explanationTopic,
    };
  }

  // 5. Weather Comparison Mode ("Today vs tomorrow", "Is tomorrow wetter than today?", "Compare")
  if (!rawResult && (timeframe.isComparison || /\b(compare|difference between|vs|versus|wetter than|hotter tomorrow|colder tomorrow|getting worse|getting better)\b/i.test(text))) {
    rawResult = {
      primaryIntent: INTENTS.WEATHER_COMPARISON,
      isTrend: /\b(getting worse|getting better|trend|changing)\b/i.test(text),
    };
  }

  // 6. Travel & Driving Safety (Flights, Highways, Road Trips)
  if (!rawResult && /\b(flight|fly|airport|airplane|highway|drive|driving|safe to drive|safe to travel|road trip|train)\b/i.test(text)) {
    rawResult = {
      primaryIntent: INTENTS.TRAVEL,
      activity: 'DRIVING',
    };
  }

  // 7. School / College Commute
  if (!rawResult && /\b(college|school|university|campus|commute|morning commute|evening commute|class)\b/i.test(text)) {
    const isCommute = /\b(commute|commuter|commuting)\b/i.test(text);
    rawResult = {
      primaryIntent: isCommute ? INTENTS.COMMUTE : INTENTS.SCHOOL_COLLEGE,
      activity: 'COMMUTE',
    };
  }

  // 8. Flood & Waterlogging (First-class disaster category)
  if (!rawResult && /\b(flood|flooding|water rise|water rising|waterlogging|waterlogged|submerged|deluge|inundation)\b/i.test(text)) {
    rawResult = {
      primaryIntent: INTENTS.FLOOD,
    };
  }

  // 9. Cyclone & Severe Tropical Depressions
  if (!rawResult && /\b(cyclone|typhoon|hurricane|tropical storm|storm track|gdacs)\b/i.test(text)) {
    rawResult = {
      primaryIntent: INTENTS.CYCLONE,
    };
  }

  // 10. Severe Storms & Lightning
  if (!rawResult && /\b(storm|thunderstorm|lightning|squall|thunder|hail|cloudburst|gusty storm)\b/i.test(text)) {
    rawResult = {
      primaryIntent: INTENTS.STORM,
    };
  }

  // 11. Specific Outdoor Activities (Running, Sports, Drying Clothes, Photography)
  if (!rawResult && activity) {
    rawResult = {
      primaryIntent: INTENTS.OUTDOOR_ACTIVITY,
      activity,
    };
  }

  // 12. Clothing Advice
  if (!rawResult && /\b(wear|clothing|clothes|jacket|sweater|heavy clothes|light clothes)\b/i.test(text) && !/\b(dry clothes|washing clothes)\b/i.test(text)) {
    rawResult = {
      primaryIntent: INTENTS.CLOTHING,
    };
  }

  // 13. Agriculture & Farming
  if (!rawResult && /\b(crops|crop|farming|farmer|agriculture|irrigation|harvest|paddy|wheat|sow)\b/i.test(text)) {
    rawResult = {
      primaryIntent: INTENTS.AGRICULTURE,
    };
  }

  // 14. Health & Vulnerable Population Guidance
  if (!rawResult && /\b(asthma|breathe|respiratory|allergy|allergies|elderly|children|headache|dehydration)\b/i.test(text)) {
    rawResult = {
      primaryIntent: INTENTS.HEALTH_WEATHER,
    };
  }

  // 15. Extreme Heat & Heatwave
  if (!rawResult && /\b(heat|heatwave|hot weather|extreme heat|sunstroke|too hot|scorching|high temperature)\b/i.test(text)) {
    rawResult = {
      primaryIntent: INTENTS.HEAT,
    };
  }

  // 16. Cold Wave & Freezing
  if (!rawResult && /\b(cold|coldwave|freezing|chilly|frost|too cold|shivering)\b/i.test(text)) {
    rawResult = {
      primaryIntent: INTENTS.COLD,
    };
  }

  // 17. Rain & Precipitation (including timing inquiries)
  if (!rawResult && (/\b(rain|raining|umbrella|drizzle|showers|precipitation|downpour|wet|when will it rain|when will rain stop|chance of rain)\b/i.test(text) || /(बारिश|वर्षा|बरसात|छाता|बूंदाबांदी)/i.test(text))) {
    rawResult = {
      primaryIntent: INTENTS.RAIN,
      isRainTiming: /\b(when will|what time|how long will|duration)\b/i.test(text) || /(कब होगी|कब तक|किस समय)/i.test(text),
    };
  }

  // 18. Air Quality (AQI) & Smoke / Smog
  if (!rawResult && (/\b(air quality|aqi|pm2\.5|pm10|pollution|smog|smoke|clean air|toxic air)\b/i.test(text) || /(वायु गुणवत्ता|प्रदूषण|हवा की गुणवत्ता|एक्यूआई)/i.test(text))) {
    rawResult = {
      primaryIntent: INTENTS.AIR_QUALITY,
    };
  }

  // 19. Wind Speed & Gusts
  if (!rawResult && (/\b(wind|windy|gust|gusts|breeze|gale|wind speed)\b/i.test(text) || /(हवा|आंधी|तूफान|पवन|हवा की गति)/i.test(text))) {
    rawResult = {
      primaryIntent: INTENTS.WIND,
    };
  }

  // 20. Fog & Visibility
  if (!rawResult && (/\b(fog|foggy|visibility|mist|misty|dense fog|see road)\b/i.test(text) || /(कोहरा|धुंध|दृश्यता)/i.test(text))) {
    rawResult = {
      primaryIntent: INTENTS.VISIBILITY,
    };
  }

  // 21. Disaster Preparedness & Severe Weather Hazards
  if (!rawResult && (/\b(shelter|relief center|evacuate|evacuation|go bag|preparedness|safety kit|severe weather|hazard|hazards|dangerous weather|bad weather)\b/i.test(text) || /(आपदा|सुरक्षा|राहत शिविर|खतरा)/i.test(text))) {
    rawResult = {
      primaryIntent: INTENTS.DISASTER_PREPAREDNESS,
    };
  }

  // 22. Historical Climate Records
  if (!rawResult && /\b(climate|normally rain|usually hot|typical weather|historical weather|annual rainfall|monsoon season)\b/i.test(text)) {
    rawResult = {
      primaryIntent: INTENTS.HISTORICAL_WEATHER,
    };
  }

  // 23. Tomorrow / 7-Day Forecast
  if (!rawResult && (timeframe.timeScope === 'TOMORROW' || timeframe.timeScope === 'NEXT_7_DAYS' || /\b(forecast|upcoming|next few days|outlook)\b/i.test(text) || /(पूर्वानुमान|कल का मौसम|आगामी मौसम)/i.test(text))) {
    rawResult = {
      primaryIntent: INTENTS.WEATHER_FORECAST,
    };
  }

  // 24. General Current Weather (Default)
  if (!rawResult) {
    rawResult = {
      primaryIntent: INTENTS.WEATHER_CURRENT,
    };
  }

  return {
    ...rawResult,
    intent: rawResult.primaryIntent,
    timeframe,
    timeScope: timeframe.timeScope || 'CURRENT',
    targetDate: timeframe.targetDate || getLocalDateString(0),
    targetHour: timeframe.targetHour ?? null,
    targetHours: timeframe.targetHours ?? null,
    targetWindow: timeframe.targetWindow ?? null,
    isComparison: Boolean(timeframe.isComparison),
    comparisonScopes: timeframe.comparisonScopes || [],
    activity: rawResult.activity || activity || null,
    rawText,
  };
}

module.exports = {
  INTENTS,
  routeIntent,
  resolveTimeScope,
  extractTimeframe: resolveTimeScope,
  extractActivity,
  extractExplanationTopic,
  getLocalDateString,
};
