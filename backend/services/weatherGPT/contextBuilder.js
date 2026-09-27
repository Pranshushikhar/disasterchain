/**
 * WeatherGPT 2.0 Structured Weather Context Builder
 * Assembles a standardized, fully grounded WeatherContext object
 * with temporal analysis helpers and activity scoring.
 */

const WMO_CODE_MAP = {
  0: 'Clear sky',
  1: 'Mainly clear',
  2: 'Partly cloudy',
  3: 'Overcast',
  45: 'Fog',
  48: 'Depositing rime fog',
  51: 'Light drizzle',
  53: 'Moderate drizzle',
  55: 'Dense drizzle',
  56: 'Light freezing drizzle',
  57: 'Dense freezing drizzle',
  61: 'Slight rain',
  63: 'Moderate rain',
  65: 'Heavy rain',
  66: 'Light freezing rain',
  67: 'Heavy freezing rain',
  71: 'Slight snowfall',
  73: 'Moderate snowfall',
  75: 'Heavy snowfall',
  77: 'Snow grains',
  80: 'Slight rain showers',
  81: 'Moderate rain showers',
  82: 'Violent rain showers',
  85: 'Slight snow showers',
  86: 'Heavy snow showers',
  95: 'Thunderstorm',
  96: 'Thunderstorm with slight hail',
  99: 'Thunderstorm with heavy hail',
};

function getConditionDescription(code) {
  if (code == null) return 'Normal Conditions';
  return WMO_CODE_MAP[code] || 'Clear / Normal';
}

function formatHour(h) {
  const hour = (h + 24) % 24;
  const meridiem = hour >= 12 ? 'PM' : 'AM';
  const display = hour % 12 === 0 ? 12 : hour % 12;
  return `${display} ${meridiem}`;
}

/**
 * Builds a 5-hour timeline window centered around the target hour (or midday)
 * Highlights the requested target hour (e.g. 20:00).
 */
function buildHourlyTimeline(hourlyList = [], targetHour = null) {
  if (!Array.isArray(hourlyList) || hourlyList.length === 0) return [];

  let centerHour = targetHour != null ? targetHour : 14;
  let hours = [centerHour - 2, centerHour - 1, centerHour, centerHour + 1, centerHour + 2];

  if (hours[0] < 0) {
    const shift = -hours[0];
    hours = hours.map((h) => h + shift);
  } else if (hours[4] > 23) {
    const shift = hours[4] - 23;
    hours = hours.map((h) => h - shift);
  }

  return hours.map((hNum) => {
    let match = hourlyList.find((h) => h.hourNumber === hNum);
    if (!match && hourlyList.length > 0) {
      match = hourlyList.reduce((prev, curr) =>
        Math.abs(curr.hourNumber - hNum) < Math.abs(prev.hourNumber - hNum) ? curr : prev
      );
    }
    const timeFormatted = `${String(hNum).padStart(2, '0')}:00`;
    return {
      hourNumber: hNum,
      time: timeFormatted,
      timeFormatted,
      temp: match?.temperature != null ? `${match.temperature}°` : '--°',
      tempNum: match?.temperature ?? null,
      prob: match?.precipitationProbability != null ? `${match.precipitationProbability}%` : '0%',
      probNum: match?.precipitationProbability ?? 0,
      condition: match?.conditionDescription || 'Partly cloudy',
      isTarget: targetHour != null ? (hNum === targetHour) : (hNum === centerHour),
    };
  });
}

/**
 * Calculates peak precipitation probability and intensity window for an hourly array
 */
function calculatePeakRain(hourlyList = []) {
  if (!Array.isArray(hourlyList) || hourlyList.length === 0) {
    return { hasSignificantRain: false, maxProb: 0, maxMm: 0, window: 'No rain projected', windowLabel: 'Dry' };
  }

  let maxProb = 0;
  let maxMm = 0;
  let peakHour = null;
  let startHour = null;
  let endHour = null;

  for (const h of hourlyList) {
    const prob = h.precipitationProbability || 0;
    const mm = h.precipitationMm || h.precipitation || 0;

    if (prob > maxProb) {
      maxProb = prob;
      peakHour = h.hourNumber;
    }
    if (mm > maxMm) {
      maxMm = mm;
    }
    if (prob >= 35 || mm >= 1.0) {
      if (startHour === null) startHour = h.hourNumber;
      endHour = h.hourNumber;
    }
  }

  if (maxProb < 25 && maxMm < 0.5) {
    return {
      hasSignificantRain: false,
      maxProb,
      maxMm: Math.round(maxMm * 10) / 10,
      window: 'No significant rain window',
      windowLabel: 'Largely Dry',
    };
  }

  const sHour = startHour !== null ? startHour : Math.max(0, (peakHour || 14) - 2);
  const eHour = endHour !== null ? Math.min(23, endHour + 1) : Math.min(23, (peakHour || 14) + 2);
  const windowLabel = `${formatHour(sHour)}–${formatHour(eHour)}`;

  return {
    hasSignificantRain: true,
    maxProb,
    maxMm: Math.round(maxMm * 10) / 10,
    peakHour,
    peakTimeFormatted: peakHour != null ? formatHour(peakHour) : windowLabel,
    window: windowLabel,
    windowLabel,
    startHour: sHour,
    endHour: eHour,
  };
}

/**
 * Builds the canonical WeatherContext object with distinct CURRENT and FORECAST structures
 */
function buildWeatherContext({
  locationName = 'Current Location',
  latitude = 28.6139,
  longitude = 77.2090,
  region = '',
  country = '',
  currentWeather = null,
  forecast = null,
  airQuality = null,
  cyclones = [],
  disasterEvents = [],
  operationalContext = {},
  feedStatus = 'LIVE',
  intentObj = {},
}) {
  const current = currentWeather || {};
  const hourlyRaw = Array.isArray(forecast?.hourly) ? forecast.hourly : [];
  const dailyRaw = Array.isArray(forecast?.daily) ? forecast.daily : [];

  const todayIso = dailyRaw[0]?.date || new Date().toISOString().slice(0, 10);
  const tomorrowIso = dailyRaw[1]?.date || new Date(Date.now() + 86400000).toISOString().slice(0, 10);

  // Helper to normalize an hourly item
  const mapHourlyItem = (h, idx) => {
    let hourNumber = idx % 24;
    let dateStr = todayIso;
    if (h.time) {
      const match = h.time.match(/T(\d{2}):/);
      if (match) hourNumber = parseInt(match[1], 10);
      dateStr = h.time.slice(0, 10);
    }
    return {
      index: idx,
      date: dateStr,
      time: h.time || '',
      hourNumber,
      timeFormatted: formatHour(hourNumber),
      temperature: h.temperature != null ? Math.round(h.temperature) : null,
      apparentTemperature: h.apparentTemperature != null ? Math.round(h.apparentTemperature) : null,
      precipitationProbability: h.precipitationProbability != null ? h.precipitationProbability : 0,
      precipitationMm: h.precipitation != null ? Math.round(h.precipitation * 10) / 10 : 0,
      precipitation: h.precipitation != null ? Math.round(h.precipitation * 10) / 10 : 0,
      weatherCode: h.weatherCode,
      condition: getConditionDescription(h.weatherCode),
      conditionDescription: getConditionDescription(h.weatherCode),
      windSpeed: h.windSpeed != null ? Math.round(h.windSpeed) : 0,
      windGusts: h.windGusts != null ? Math.round(h.windGusts) : 0,
      humidity: h.humidity != null ? h.humidity : null,
    };
  };

  // Full mapped hourly list
  const fullHourly = hourlyRaw.map(mapHourlyItem);

  // Partition hourly forecast into Today and Tomorrow
  let todayHourly = fullHourly.filter((h) => h.date === todayIso);
  let tomorrowHourly = fullHourly.filter((h) => h.date === tomorrowIso);

  // Fallback partition by index if dates are not attached
  if (todayHourly.length === 0) todayHourly = fullHourly.slice(0, 24);
  if (tomorrowHourly.length === 0) tomorrowHourly = fullHourly.slice(24, 48);

  const hourly = fullHourly.slice(0, 24); // Backwards compatibility for callers

  // Parse Daily Forecast (7 days)
  const daily = dailyRaw.slice(0, 7).map((d, idx) => {
    let dayName = idx === 0 ? 'Today' : idx === 1 ? 'Tomorrow' : '';
    if (d.date && !dayName) {
      try {
        const dateObj = new Date(d.date);
        dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
      } catch (e) {
        dayName = `Day ${idx + 1}`;
      }
    }
    return {
      index: idx,
      date: d.date || '',
      dayName,
      tempMax: d.tempMax != null ? Math.round(d.tempMax) : null,
      tempMin: d.tempMin != null ? Math.round(d.tempMin) : null,
      precipitationProbabilityMax: d.precipitationProbabilityMax != null ? d.precipitationProbabilityMax : 0,
      precipitationSum: d.precipitationSum != null ? Math.round(d.precipitationSum * 10) / 10 : 0,
      weatherCode: d.weatherCode,
      condition: getConditionDescription(d.weatherCode),
      conditionDescription: getConditionDescription(d.weatherCode),
      windSpeedMax: d.windSpeedMax != null ? Math.round(d.windSpeedMax) : 0,
      sunrise: d.sunrise ? d.sunrise.slice(11, 16) : '06:00',
      sunset: d.sunset ? d.sunset.slice(11, 16) : '18:00',
      uvIndexMax: d.uvIndexMax != null ? d.uvIndexMax : null,
    };
  });

  // Current Normalized
  const curTemp = current.temperature != null ? Math.round(current.temperature) : (hourly[0]?.temperature ?? 25);
  const curApparent = current.apparentTemperature != null ? Math.round(current.apparentTemperature) : curTemp;
  const curWind = current.windSpeed != null ? Math.round(current.windSpeed) : (hourly[0]?.windSpeed ?? 0);
  const curGusts = current.windGusts != null ? Math.round(current.windGusts) : curWind;
  const curCode = current.weatherCode != null ? current.weatherCode : (hourly[0]?.weatherCode ?? 0);
  const curCondition = getConditionDescription(curCode);
  const curPrecip = current.precipitation != null ? current.precipitation : (current.rain || 0);

  // 1. Separate CURRENT WEATHER Object
  const currentWeatherObj = {
    timestamp: current.fetchedAt || current.timestamp || new Date().toISOString(),
    temperature: curTemp,
    apparentTemperature: curApparent,
    feelsLike: curApparent,
    precipitationNow: curPrecip,
    precipitation: curPrecip,
    windNow: curWind,
    windSpeed: curWind,
    windGusts: curGusts,
    humidityNow: current.relativeHumidity != null ? current.relativeHumidity : (hourly[0]?.humidity ?? 50),
    relativeHumidity: current.relativeHumidity != null ? current.relativeHumidity : (hourly[0]?.humidity ?? 50),
    humidity: current.relativeHumidity != null ? current.relativeHumidity : (hourly[0]?.humidity ?? 50),
    visibilityNow: current.visibilityKm != null ? current.visibilityKm : 10,
    visibilityKm: current.visibilityKm != null ? current.visibilityKm : 10,
    conditionsNow: curCondition,
    condition: curCondition,
    conditionDescription: curCondition,
    weatherCode: curCode,
    cloudCover: current.cloudCover != null ? current.cloudCover : (hourly[0]?.cloudCover ?? 20),
    pressureMsl: current.pressureMsl != null ? Math.round(current.pressureMsl) : 1013,
    uvIndex: current.uvIndex != null ? current.uvIndex : 4,
    isDay: current.isDay != null ? current.isDay : 1,
    source: 'Open-Meteo High-Resolution Numerical Model',
    fetchedAt: current.fetchedAt || new Date().toISOString(),
  };

  // 2. Separate TODAY FORECAST Object
  const todayForecastObj = {
    date: todayIso,
    dayName: 'Today',
    minTemp: daily[0]?.tempMin ?? curTemp,
    maxTemp: daily[0]?.tempMax ?? curTemp,
    tempMin: daily[0]?.tempMin ?? curTemp,
    tempMax: daily[0]?.tempMax ?? curTemp,
    precipitationProbability: daily[0]?.precipitationProbabilityMax ?? 0,
    precipitationProbabilityMax: daily[0]?.precipitationProbabilityMax ?? 0,
    precipitationAmount: daily[0]?.precipitationSum ?? 0,
    precipitationSum: daily[0]?.precipitationSum ?? 0,
    precipitationIntensity: todayHourly.reduce((acc, h) => Math.max(acc, h.precipitationMm || 0), 0),
    wind: daily[0]?.windSpeedMax ?? curWind,
    conditions: daily[0]?.conditionDescription || curCondition,
    conditionDescription: daily[0]?.conditionDescription || curCondition,
    weatherCode: daily[0]?.weatherCode ?? curCode,
    hourlyForecast: todayHourly,
    peakRainWindow: calculatePeakRain(todayHourly),
  };

  // 3. Separate TOMORROW FORECAST Object
  const tomorrowForecastObj = {
    date: tomorrowIso,
    dayName: 'Tomorrow',
    minTemp: daily[1]?.tempMin ?? (curTemp - 2),
    maxTemp: daily[1]?.tempMax ?? (curTemp + 2),
    tempMin: daily[1]?.tempMin ?? (curTemp - 2),
    tempMax: daily[1]?.tempMax ?? (curTemp + 2),
    precipitationProbability: daily[1]?.precipitationProbabilityMax ?? 0,
    precipitationProbabilityMax: daily[1]?.precipitationProbabilityMax ?? 0,
    precipitationAmount: daily[1]?.precipitationSum ?? 0,
    precipitationSum: daily[1]?.precipitationSum ?? 0,
    precipitationIntensity: tomorrowHourly.reduce((acc, h) => Math.max(acc, h.precipitationMm || 0), 0),
    wind: daily[1]?.windSpeedMax ?? curWind,
    conditions: daily[1]?.conditionDescription || 'Partly cloudy',
    conditionDescription: daily[1]?.conditionDescription || 'Partly cloudy',
    weatherCode: daily[1]?.weatherCode ?? 1,
    hourlyForecast: tomorrowHourly,
    peakRainWindow: calculatePeakRain(tomorrowHourly),
  };

  // 4. Resolve TARGET FORECAST based on intent timeScope
  let targetForecastObj = null;
  const requestedScope = intentObj.timeScope || 'CURRENT';

  if (requestedScope === 'TOMORROW') {
    targetForecastObj = { ...tomorrowForecastObj };
    if (intentObj.targetHour != null) {
      let matchHour = tomorrowHourly.find((h) => h.hourNumber === intentObj.targetHour);
      let isNearest = false;
      if (!matchHour && tomorrowHourly.length > 0) {
        matchHour = tomorrowHourly.reduce((prev, curr) =>
          Math.abs(curr.hourNumber - intentObj.targetHour) < Math.abs(prev.hourNumber - intentObj.targetHour) ? curr : prev
        );
        isNearest = true;
      }
      if (matchHour) {
        targetForecastObj.targetHourData = {
          ...matchHour,
          isNearest,
          requestedHour: intentObj.targetHour,
        };
      }
    }
    targetForecastObj.timeline = buildHourlyTimeline(tomorrowHourly, intentObj.targetHour);
  } else if (requestedScope === 'TODAY') {
    targetForecastObj = { ...todayForecastObj };
    if (intentObj.targetHour != null) {
      let matchHour = todayHourly.find((h) => h.hourNumber === intentObj.targetHour);
      let isNearest = false;
      if (!matchHour && todayHourly.length > 0) {
        matchHour = todayHourly.reduce((prev, curr) =>
          Math.abs(curr.hourNumber - intentObj.targetHour) < Math.abs(prev.hourNumber - intentObj.targetHour) ? curr : prev
        );
        isNearest = true;
      }
      if (matchHour) {
        targetForecastObj.targetHourData = {
          ...matchHour,
          isNearest,
          requestedHour: intentObj.targetHour,
        };
      }
    }
    targetForecastObj.timeline = buildHourlyTimeline(todayHourly, intentObj.targetHour);
  } else if (requestedScope === 'COMPARISON') {
    targetForecastObj = {
      comparison: {
        today: todayForecastObj,
        tomorrow: tomorrowForecastObj,
      },
      timeline: buildHourlyTimeline(tomorrowHourly, 14),
    };
  } else {
    targetForecastObj = {
      ...todayForecastObj,
      timeline: buildHourlyTimeline(todayHourly, new Date().getHours()),
    };
  }

  // 5. Build strict ALLOWED CLAIMS supported by data
  const allowedClaims = [
    `Current conditions in ${locationName}: ${curTemp}°C, ${curCondition}, Wind: ${curWind} km/h, Precipitation: ${curPrecip} mm.`,
    `Today's forecast in ${locationName}: High ${todayForecastObj.maxTemp}°C / Low ${todayForecastObj.minTemp}°C, Rain probability: ${todayForecastObj.precipitationProbabilityMax}%, Expected rain sum: ${todayForecastObj.precipitationSum} mm.`,
    `Tomorrow's forecast in ${locationName}: High ${tomorrowForecastObj.maxTemp}°C / Low ${tomorrowForecastObj.minTemp}°C, Rain probability: ${tomorrowForecastObj.precipitationProbabilityMax}%, Expected rain sum: ${tomorrowForecastObj.precipitationSum} mm.`,
  ];

  if (tomorrowForecastObj.peakRainWindow?.hasSignificantRain) {
    allowedClaims.push(
      `Tomorrow highest rain probability is between ${tomorrowForecastObj.peakRainWindow.window} (up to ${tomorrowForecastObj.peakRainWindow.maxProb}%).`
    );
  } else {
    allowedClaims.push(`Tomorrow has low precipitation risk (${tomorrowForecastObj.precipitationProbabilityMax}% peak probability).`);
  }

  if (targetForecastObj?.targetHourData) {
    const th = targetForecastObj.targetHourData;
    allowedClaims.push(
      `${requestedScope === 'TOMORROW' ? 'Tomorrow' : 'Today'} around ${th.timeFormatted}: Rain probability ${th.precipitationProbability}%, Condition: ${th.conditionDescription}, Temperature: ${th.temperature}°C.`
    );
  }

  // Canonical Global Weather Context
  const canonicalContext = {
    location: locationName,
    coordinates: {
      latitude,
      longitude,
    },
    current: currentWeatherObj,
    today: todayForecastObj,
    tomorrow: tomorrowForecastObj,
    hourly: fullHourly.slice(0, 48),
    daily,
    airQuality: {
      europeanAqi: airQuality?.europeanAqi != null ? airQuality.europeanAqi : null,
      severity: airQuality?.severity || 'UNKNOWN',
      pm2_5: airQuality?.pm2_5 != null ? airQuality.pm2_5 : null,
      pm10: airQuality?.pm10 != null ? airQuality.pm10 : null,
      source: 'Copernicus Atmospheric Monitoring Service (CAMS)',
    },
    hazards: {
      cyclones: Array.isArray(cyclones?.cyclones) ? cyclones.cyclones : (Array.isArray(cyclones) ? cyclones : []),
      disasters: Array.isArray(disasterEvents?.events) ? disasterEvents.events : (Array.isArray(disasterEvents) ? disasterEvents : []),
      alerts: operationalContext.alerts || [],
      incidents: operationalContext.incidents || [],
      shelters: operationalContext.shelters || [],
    },
    source: 'Open-Meteo',
    fetchedAt: current.fetchedAt || new Date().toISOString(),
  };

  // 6. Response Contract (Section 5)
  const responseContract = {
    question: intentObj.rawText || '',
    intent: intentObj.primaryIntent || 'WEATHER_CURRENT',
    time_scope: requestedScope,
    location: locationName,
    target_date: intentObj.targetDate || (requestedScope === 'TOMORROW' ? tomorrowIso : todayIso),
    target_hour: intentObj.targetHour ?? null,
    target_window: intentObj.targetWindow ?? null,
    weather_data: {
      current_weather: currentWeatherObj,
      target_forecast: targetForecastObj,
      today_forecast: todayForecastObj,
      tomorrow_forecast: tomorrowForecastObj,
    },
    allowed_claims: allowedClaims,
  };

  const context = {
    locationName,
    location: {
      name: locationName,
      displayName: locationName,
      latitude,
      longitude,
      region,
      country,
      timezone: current.timezone || forecast?.timezone || 'auto',
    },
    metadata: {
      source: 'Open-Meteo',
      timestamp: current.fetchedAt || new Date().toISOString(),
    },
    // Distinct data layers
    currentWeather: currentWeatherObj,
    current: currentWeatherObj, // Backwards compatibility
    todayForecast: todayForecastObj,
    tomorrowForecast: tomorrowForecastObj,
    targetForecast: targetForecastObj,
    allowedClaims,
    responseContract,

    canonicalContext,
    canonical: canonicalContext,
    coordinates: canonicalContext.coordinates,
    today: todayForecastObj,
    tomorrow: tomorrowForecastObj,
    hazards: canonicalContext.hazards,
    source: 'Open-Meteo',
    fetchedAt: current.fetchedAt || new Date().toISOString(),

    airQuality: {
      europeanAqi: airQuality?.europeanAqi != null ? airQuality.europeanAqi : null,
      severity: airQuality?.severity || 'UNKNOWN',
      pm2_5: airQuality?.pm2_5 != null ? airQuality.pm2_5 : null,
      pm10: airQuality?.pm10 != null ? airQuality.pm10 : null,
      source: 'Copernicus Atmospheric Monitoring Service (CAMS)',
    },
    hourly,
    fullHourly,
    todayHourly,
    tomorrowHourly,
    daily,
    cyclones: Array.isArray(cyclones?.cyclones) ? cyclones.cyclones : (Array.isArray(cyclones) ? cyclones : []),
    disasterEvents: Array.isArray(disasterEvents?.events) ? disasterEvents.events : (Array.isArray(disasterEvents) ? disasterEvents : []),
    operational: {
      alerts: operationalContext.alerts || [],
      incidents: operationalContext.incidents || [],
      shelters: operationalContext.shelters || [],
      recommendedShelter: operationalContext.recommendedShelter || null,
      sosCount: operationalContext.activeSosCount || 0,
    },
    feedStatus,
    dataTrust: feedStatus === 'LIVE' ? 'LIVE TELEMETRY' : (feedStatus === 'CACHED' ? 'CACHED TELEMETRY' : 'PARTIAL_LIVE'),

    // --- REASONING HELPERS ---

    /**
     * Find highest rain probability window for target day
     */
    getPeakRainWindow(isTomorrow = false) {
      if (isTomorrow) {
        return tomorrowForecastObj.peakRainWindow;
      }
      return todayForecastObj.peakRainWindow;
    },

    /**
     * Get specific forecast at target hour
     */
    getConditionAtHour(targetHour, isTomorrow = false) {
      const sourceHourly = isTomorrow ? tomorrowHourly : todayHourly;
      if (sourceHourly.length === 0) return null;
      const match = sourceHourly.find((h) => h.hourNumber === targetHour) || sourceHourly[0];
      return match;
    },

    /**
     * Analyze whether conditions are worsening over next 1-4 hours
     */
    getTrendNextHours() {
      if (hourly.length < 4) return { trend: 'STABLE', description: 'Conditions are remaining relatively stable.' };

      const curRainRate = currentWeatherObj.precipitationNow || 0;
      const futureRainProbs = hourly.slice(1, 5).map((h) => h.precipitationProbability);
      const futureGusts = hourly.slice(1, 5).map((h) => h.windGusts);

      const maxFutureProb = Math.max(...futureRainProbs, 0);
      const maxFutureGust = Math.max(...futureGusts, 0);

      const isRainWorsening = maxFutureProb >= 60 && maxFutureProb > ((hourly[0]?.precipitationProbability || 0) + 20);
      const isWindWorsening = maxFutureGust >= 50 && maxFutureGust > ((currentWeatherObj.windGusts || 0) + 15);

      if (isRainWorsening || isWindWorsening) {
        return {
          trend: 'WORSENING',
          isWorse: true,
          rainProbabilityChange: `rises from ${hourly[0]?.precipitationProbability || 0}% currently to ${maxFutureProb}%`,
          maxFutureGust,
          description: isRainWorsening
            ? `Conditions are trending more unstable over the next few hours. Rain probability ${isRainWorsening ? `rises to ${maxFutureProb}%` : ''}${isWindWorsening ? `, and wind gusts reach ${maxFutureGust} km/h` : ''}.`
            : `Wind speeds are expected to intensify, with gusts reaching up to ${maxFutureGust} km/h over the next few hours.`,
        };
      }

      if (maxFutureProb <= 20 && curRainRate === 0) {
        return {
          trend: 'STABLE_CLEAR',
          isWorse: false,
          description: 'Atmospheric conditions look calm and stable over the next few hours.',
        };
      }

      return {
        trend: 'STABLE',
        isWorse: false,
        description: 'Conditions are holding steady with no sudden convective deterioration projected in the immediate hours.',
      };
    },

    /**
     * Compare Today vs Tomorrow
     */
    getComparisonTodayVsTomorrow() {
      const today = todayForecastObj;
      const tomorrow = tomorrowForecastObj;

      const diffMax = tomorrow.maxTemp - today.maxTemp;
      const diffMin = tomorrow.minTemp - today.minTemp;
      const rainDiff = tomorrow.precipitationProbabilityMax - today.precipitationProbabilityMax;

      let tempNarrative = 'Temperatures will be roughly unchanged';
      if (diffMax >= 2) tempNarrative = `Tomorrow will be warmer by about ${diffMax}°C`;
      else if (diffMax <= -2) tempNarrative = `Tomorrow will be cooler by about ${Math.abs(diffMax)}°C`;

      let rainNarrative = 'Precipitation chances remain similar';
      if (rainDiff >= 20) rainNarrative = `Tomorrow has a higher rain probability than today: ${tomorrow.precipitationProbabilityMax}% vs ${today.precipitationProbabilityMax}%`;
      else if (rainDiff <= -20) rainNarrative = `Tomorrow is projected to be noticeably drier than today: ${tomorrow.precipitationProbabilityMax}% vs ${today.precipitationProbabilityMax}%`;
      else rainNarrative = `Precipitation risk is comparable: ${tomorrow.precipitationProbabilityMax}% tomorrow vs ${today.precipitationProbabilityMax}% today`;

      return {
        today,
        tomorrow,
        diffMax,
        diffMin,
        rainDiff,
        tempNarrative,
        rainNarrative,
        summary: `${tempNarrative}. ${rainNarrative}.`,
      };
    },
  };

  return context;
}

module.exports = {
  buildWeatherContext,
  getConditionDescription,
  calculatePeakRain,
  buildHourlyTimeline,
};
