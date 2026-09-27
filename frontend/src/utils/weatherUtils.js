/**
 * DisasterChain Weather & Atmospheric Intelligence Utilities
 * Centralized WMO Weather Code Mappings, AQI Severity, Wind Compass, and Atmospheric Risk Analysis
 * Fully localized with optional i18n translation function support.
 */

export const WMO_WEATHER_CODES = {
  0: { label: 'Clear Sky', icon: '☀️', condition: 'clear', key: 'weather.conditions.clear' },
  1: { label: 'Mainly Clear', icon: '🌤️', condition: 'mainly_clear', key: 'weather.conditions.mainlyClear' },
  2: { label: 'Partly Cloudy', icon: '⛅', condition: 'partly_cloudy', key: 'weather.conditions.partlyCloudy' },
  3: { label: 'Overcast', icon: '☁️', condition: 'overcast', key: 'weather.conditions.overcast' },
  45: { label: 'Fog', icon: '🌫️', condition: 'fog', key: 'weather.conditions.fog' },
  48: { label: 'Depositing Rime Fog', icon: '🌫️', condition: 'fog', key: 'weather.conditions.fog' },
  51: { label: 'Light Drizzle', icon: '🌦️', condition: 'drizzle', key: 'weather.conditions.drizzle' },
  53: { label: 'Moderate Drizzle', icon: '🌦️', condition: 'drizzle', key: 'weather.conditions.drizzle' },
  55: { label: 'Dense Drizzle', icon: '🌧️', condition: 'drizzle', key: 'weather.conditions.drizzle' },
  56: { label: 'Light Freezing Drizzle', icon: '🌧️', condition: 'freezing_rain', key: 'weather.conditions.freezingDrizzle' },
  57: { label: 'Dense Freezing Drizzle', icon: '🌧️', condition: 'freezing_rain', key: 'weather.conditions.freezingDrizzle' },
  61: { label: 'Slight Rain', icon: '🌧️', condition: 'rain', key: 'weather.conditions.rain' },
  63: { label: 'Moderate Rain', icon: '🌧️', condition: 'rain', key: 'weather.conditions.rain' },
  65: { label: 'Heavy Rain', icon: '🌧️', condition: 'heavy_rain', key: 'weather.conditions.heavyRain' },
  66: { label: 'Light Freezing Rain', icon: '🌨️', condition: 'freezing_rain', key: 'weather.conditions.freezingRain' },
  67: { label: 'Heavy Freezing Rain', icon: '🌨️', condition: 'freezing_rain', key: 'weather.conditions.freezingRain' },
  71: { label: 'Slight Snow Fall', icon: '❄️', condition: 'snow', key: 'weather.conditions.snow' },
  73: { label: 'Moderate Snow Fall', icon: '❄️', condition: 'snow', key: 'weather.conditions.snow' },
  75: { label: 'Heavy Snow Fall', icon: '❄️', condition: 'heavy_snow', key: 'weather.conditions.heavySnow' },
  77: { label: 'Snow Grains', icon: '❄️', condition: 'snow', key: 'weather.conditions.snow' },
  80: { label: 'Slight Rain Showers', icon: '🌦️', condition: 'showers', key: 'weather.conditions.showers' },
  81: { label: 'Moderate Rain Showers', icon: '🌧️', condition: 'showers', key: 'weather.conditions.showers' },
  82: { label: 'Violent Rain Showers', icon: '⛈️', condition: 'heavy_rain', key: 'weather.conditions.heavyRain' },
  85: { label: 'Slight Snow Showers', icon: '🌨️', condition: 'snow', key: 'weather.conditions.snow' },
  86: { label: 'Heavy Snow Showers', icon: '🌨️', condition: 'heavy_snow', key: 'weather.conditions.heavySnow' },
  95: { label: 'Thunderstorm', icon: '⛈️', condition: 'thunderstorm', key: 'weather.conditions.thunderstorm' },
  96: { label: 'Thunderstorm with Slight Hail', icon: '⛈️', condition: 'thunderstorm_hail', key: 'weather.conditions.thunderstormHail' },
  99: { label: 'Thunderstorm with Heavy Hail', icon: '⛈️', condition: 'thunderstorm_hail', key: 'weather.conditions.thunderstormHail' },
};

/**
 * Resolves WMO code to human-readable label and icon, optionally localized via t()
 */
export function getWeatherCondition(code, t = null) {
  if (code == null || WMO_WEATHER_CODES[code] == null) {
    const defaultLabel = t ? t('weather.conditions.clear', 'Clear / Normal') : 'Clear / Normal';
    return { label: defaultLabel, icon: '🌤️', condition: 'clear' };
  }
  const item = WMO_WEATHER_CODES[code];
  const localizedLabel = t && item.key ? t(item.key, item.label) : item.label;
  return { ...item, label: localizedLabel };
}

/**
 * Converts wind degrees (0-360) to cardinal direction
 */
export function degreesToCardinal(deg) {
  if (deg == null || isNaN(deg)) return 'N';
  const val = Math.floor((deg / 22.5) + 0.5);
  const arr = [
    'N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE',
    'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'
  ];
  return arr[val % 16];
}

/**
 * European Air Quality Index (EAQI) classification, color & advisory, optionally localized via t()
 */
export function getAqiDetails(aqiValue, t = null) {
  const aqi = parseFloat(aqiValue);
  if (isNaN(aqi) || aqi == null) {
    return {
      severity: 'UNKNOWN',
      label: t ? t('weather.aqi.unknown', 'Unavailable') : 'Unavailable',
      color: 'var(--text-muted)',
      badgeClass: 'badge-secondary',
      advisory: t ? t('weather.aqi.advisoryUnknown', 'Air quality telemetry is currently calibrating.') : 'Air quality telemetry is currently calibrating.',
    };
  }

  if (aqi <= 20) {
    return {
      severity: 'GOOD',
      label: t ? t('weather.aqi.good', 'GOOD') : 'GOOD',
      color: 'var(--mint)',
      badgeClass: 'badge-success',
      advisory: t ? t('weather.aqi.advisoryGood', 'Air quality is satisfactory. Atmospheric pollution poses minimal risk.') : 'Air quality is satisfactory. Atmospheric pollution poses minimal risk.',
    };
  }
  if (aqi <= 40) {
    return {
      severity: 'FAIR',
      label: t ? t('weather.aqi.fair', 'FAIR') : 'FAIR',
      color: 'var(--cyan)',
      badgeClass: 'badge-info',
      advisory: t ? t('weather.aqi.advisoryFair', 'Air quality is acceptable. Sensitive individuals should monitor symptoms.') : 'Air quality is acceptable. Sensitive individuals should monitor symptoms.',
    };
  }
  if (aqi <= 60) {
    return {
      severity: 'MODERATE',
      label: t ? t('weather.aqi.moderate', 'MODERATE') : 'MODERATE',
      color: 'var(--amber)',
      badgeClass: 'badge-warning',
      advisory: t ? t('weather.aqi.advisoryModerate', 'Respiratory symptoms possible for vulnerable individuals, elderly and children.') : 'Respiratory symptoms possible for vulnerable individuals, elderly and children.',
    };
  }
  if (aqi <= 80) {
    return {
      severity: 'POOR',
      label: t ? t('weather.aqi.poor', 'POOR') : 'POOR',
      color: 'var(--accent-orange)',
      badgeClass: 'badge-warning',
      advisory: t ? t('weather.aqi.advisoryPoor', 'Adverse health effects possible for general public; reduce strenuous outdoor activities.') : 'Adverse health effects possible for general public; reduce strenuous outdoor activities.',
    };
  }
  if (aqi <= 100) {
    return {
      severity: 'VERY POOR',
      label: t ? t('weather.aqi.veryPoor', 'VERY POOR') : 'VERY POOR',
      color: 'var(--crimson)',
      badgeClass: 'badge-critical',
      advisory: t ? t('weather.aqi.advisoryVeryPoor', 'High health warning: wear particulate filtering masks (N95) outdoors.') : 'High health warning: wear particulate filtering masks (N95) outdoors.',
    };
  }
  return {
    severity: 'EXTREMELY POOR',
    label: t ? t('weather.aqi.extremelyPoor', 'EXTREMELY POOR') : 'EXTREMELY POOR',
    color: '#990022',
    badgeClass: 'badge-critical',
    advisory: t ? t('weather.aqi.advisoryExtremelyPoor', 'Emergency atmospheric alert: entire population likely affected. Remain indoors.') : 'Emergency atmospheric alert: entire population likely affected. Remain indoors.',
  };
}

/**
 * Atmospheric Risk Context Evaluator
 * Analyzes observable conditions against practical safety thresholds.
 * Returns derived advisory context (NOT an official civil defense warning).
 */
export function evaluateAtmosphericRisk(currentWeather, airQuality, activeCyclones = [], t = null) {
  const risks = [];

  const defaultHeadlineNoRisk = t ? t('weather.risk.noHazard', 'NO SIGNIFICANT WEATHER HAZARD DETECTED') : 'NO SIGNIFICANT WEATHER HAZARD DETECTED';
  const disclaimerText = t ? t('weather.risk.disclaimer', 'Advisory context — not an official warning.') : 'Advisory context — not an official warning.';

  if (!currentWeather) {
    return {
      hasRisks: false,
      risks: [],
      headline: defaultHeadlineNoRisk,
      badgeClass: 'badge-success',
      disclaimer: disclaimerText,
    };
  }

  const { temperature, windSpeed, windGusts, precipitation, rain, weatherCode, visibilityKm } = currentWeather;

  // 1. High Wind Risk
  if ((windSpeed && windSpeed >= 45) || (windGusts && windGusts >= 60)) {
    const isCrit = windSpeed >= 65 || windGusts >= 80;
    risks.push({
      type: 'WIND',
      severity: isCrit ? (t ? t('weather.risk.critical', 'CRITICAL') : 'CRITICAL') : (t ? t('weather.risk.warning', 'WARNING') : 'WARNING'),
      title: t ? t('weather.risk.highWind', 'HIGH WIND HAZARD') : 'HIGH WIND HAZARD',
      detail: `Observed sustained wind: ${windSpeed} km/h (Gusts: ${windGusts || windSpeed} km/h). Loose debris, fallen tree branches, and power line damage hazards present.`,
      icon: '💨',
    });
  }

  // 2. Heavy Precipitation / Flash Flood Potential
  if ((precipitation && precipitation >= 10) || (rain && rain >= 10)) {
    const isCrit = precipitation >= 25;
    risks.push({
      type: 'PRECIPITATION',
      severity: isCrit ? (t ? t('weather.risk.critical', 'CRITICAL') : 'CRITICAL') : (t ? t('weather.risk.warning', 'WARNING') : 'WARNING'),
      title: t ? t('weather.risk.heavyPrecip', 'HEAVY PRECIPITATION ADVISORY') : 'HEAVY PRECIPITATION ADVISORY',
      detail: `Current precipitation rate: ${precipitation} mm/h. Low-lying roadways and drainage culverts may experience rapid inundation.`,
      icon: '🌧️',
    });
  }

  // 3. Thunderstorm / Lightning Activity
  if (weatherCode != null && (weatherCode === 95 || weatherCode === 96 || weatherCode === 99)) {
    const isCrit = weatherCode >= 96;
    risks.push({
      type: 'THUNDERSTORM',
      severity: isCrit ? (t ? t('weather.risk.critical', 'CRITICAL') : 'CRITICAL') : (t ? t('weather.risk.warning', 'WARNING') : 'WARNING'),
      title: t ? t('weather.risk.activeThunderstorm', 'ACTIVE THUNDERSTORM / HAIL') : 'ACTIVE THUNDERSTORM / HAIL',
      detail: 'Cloud-to-ground electrical discharge hazard. Seek interior shelter; stay away from open fields, water bodies, and metal masts.',
      icon: '⛈️',
    });
  }

  // 4. Extreme Heat / Heatwave
  if (temperature != null && temperature >= 40) {
    const isCrit = temperature >= 44;
    risks.push({
      type: 'HEAT',
      severity: isCrit ? (t ? t('weather.risk.critical', 'CRITICAL') : 'CRITICAL') : (t ? t('weather.risk.warning', 'WARNING') : 'WARNING'),
      title: t ? t('weather.risk.heatwave', 'EXTREME AMBIENT HEATWAVE') : 'EXTREME AMBIENT HEATWAVE',
      detail: `Recorded temperature: ${temperature}°C. Elevated risk of heat stroke, dehydration, and hyperthermia. Hydrate with ORS and avoid sun exposure.`,
      icon: '🔥',
    });
  } else if (temperature != null && temperature <= 2) {
    // 5. Extreme Cold / Freeze
    const isCrit = temperature <= -5;
    risks.push({
      type: 'COLD',
      severity: isCrit ? (t ? t('weather.risk.critical', 'CRITICAL') : 'CRITICAL') : (t ? t('weather.risk.warning', 'WARNING') : 'WARNING'),
      title: t ? t('weather.risk.coldFreeze', 'FREEZING / HYPOTHERMIA RISK') : 'FREEZING / HYPOTHERMIA RISK',
      detail: `Recorded temperature: ${temperature}°C. Frostbite and hypothermia hazard; layer thermal clothing and safeguard elderly/infants.`,
      icon: '❄️',
    });
  }

  // 6. Low Visibility
  if (visibilityKm != null && visibilityKm <= 1.5) {
    const isCrit = visibilityKm < 0.5;
    risks.push({
      type: 'VISIBILITY',
      severity: isCrit ? (t ? t('weather.risk.critical', 'CRITICAL') : 'CRITICAL') : (t ? t('weather.risk.warning', 'WARNING') : 'WARNING'),
      title: t ? t('weather.risk.lowVisibility', 'LOW VISIBILITY HAZARD') : 'LOW VISIBILITY HAZARD',
      detail: `Atmospheric visibility reduced to ${visibilityKm} km. Surface vehicular transport and aviation subject to hazardous navigation conditions.`,
      icon: '👁️',
    });
  }

  // 7. Air Quality Hazard
  if (airQuality && airQuality.europeanAqi && airQuality.europeanAqi >= 60) {
    const isCrit = airQuality.europeanAqi >= 80;
    risks.push({
      type: 'AQI',
      severity: isCrit ? (t ? t('weather.risk.critical', 'CRITICAL') : 'CRITICAL') : (t ? t('weather.risk.warning', 'WARNING') : 'WARNING'),
      title: t ? t('weather.risk.hazardousAqi', 'HAZARDOUS AIR QUALITY') : 'HAZARDOUS AIR QUALITY',
      detail: `European AQI: ${airQuality.europeanAqi} (${airQuality.severity}). Particulate matter PM2.5: ${airQuality.pm2_5 || 'elevated'} μg/m³. Respiratory protection advised.`,
      icon: '🍃',
    });
  }

  // 8. Active Cyclone Proximity (regional proximity to current location)
  if (activeCyclones && activeCyclones.length > 0 && currentWeather.latitude != null && currentWeather.longitude != null) {
    const nearbyCyclones = activeCyclones.filter((c) => {
      const isSevere = c.alertLevel === 'Red' || c.alertLevel === 'Orange';
      if (!isSevere) return false;
      const cLat = Number(c.latitude ?? c.lat);
      const cLon = Number(c.longitude ?? c.lon);
      if (isNaN(cLat) || isNaN(cLon)) return false;
      const dist = Math.hypot(cLat - currentWeather.latitude, cLon - currentWeather.longitude);
      return dist <= 12; // ~1300km regional radius
    });

    if (nearbyCyclones.length > 0) {
      risks.push({
        type: 'CYCLONE',
        severity: t ? t('weather.risk.critical', 'CRITICAL') : 'CRITICAL',
        title: t ? t('weather.risk.activeCyclone', 'ACTIVE REGIONAL TROPICAL CYCLONE') : 'ACTIVE REGIONAL TROPICAL CYCLONE',
        detail: `${nearbyCyclones.length} severe storm system(s) in proximity: ${nearbyCyclones.map((c) => c.name).join(', ')}. Monitor storm path and emergency coastal directives.`,
        icon: '🌀',
      });
    }
  }

  const hasRisks = risks.length > 0;
  const isCritical = risks.some((r) => r.severity === 'CRITICAL' || r.severity === (t && t('weather.risk.critical', 'CRITICAL')));

  const criticalHeadline = t ? t('weather.risk.criticalHazards', 'CRITICAL ATMOSPHERIC HAZARDS DETECTED') : 'CRITICAL ATMOSPHERIC HAZARDS DETECTED';
  const advisoryHeadline = t ? t('weather.risk.advisoryConditions', 'ADVISORY ATMOSPHERIC CONDITIONS DETECTED') : 'ADVISORY ATMOSPHERIC CONDITIONS DETECTED';

  return {
    hasRisks,
    risks,
    headline: hasRisks
      ? (isCritical ? criticalHeadline : advisoryHeadline)
      : defaultHeadlineNoRisk,
    badgeClass: hasRisks ? (isCritical ? 'badge-critical' : 'badge-warning') : 'badge-success',
    disclaimer: disclaimerText,
  };
}
