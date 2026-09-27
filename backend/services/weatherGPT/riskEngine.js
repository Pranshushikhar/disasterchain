/**
 * WeatherGPT 2.0 Risk Interpretation Engine
 * Layered evaluation of atmospheric and geophysical hazards:
 * OBSERVED | FORECAST | MODEL-DERIVED | AI INTERPRETATION | OFFICIAL ALERT
 */

function analyzeRisks(weatherContext) {
  const { current, airQuality, hourly, daily, cyclones, operational } = weatherContext;
  const risks = [];
  let overallSeverity = 'LOW';

  // 1. High Wind & Gale Squalls
  const windSpeed = current.windSpeed || 0;
  const windGusts = current.windGusts || windSpeed;
  if (windSpeed >= 60 || windGusts >= 75) {
    overallSeverity = 'HIGH';
    risks.push({
      type: 'HIGH_WIND',
      severity: 'HIGH',
      title: 'Severe Wind Gust Hazard',
      observed: `Wind speed: ${windSpeed} km/h, peak gusts: ${windGusts} km/h.`,
      forecast: `Elevated gusts projected to persist over the next 3–6 hours.`,
      aiInterpretation: 'Risk of flying tin sheets, broken tree branches, and severe instability for two-wheelers and high-profile vehicles on bridges/flyovers.',
      officialAlert: operational.alerts?.find((a) => /wind|squall/i.test(a.headline))?.headline || null,
      recommendations: [
        'Secure loose terrace objects, solar panels, and outdoor signs.',
        'Avoid parking vehicles underneath mature trees or utility poles.',
        'Postpone non-essential two-wheeler highway travel.',
      ],
    });
  } else if (windSpeed >= 40 || windGusts >= 55) {
    if (overallSeverity === 'LOW') overallSeverity = 'MODERATE';
    risks.push({
      type: 'HIGH_WIND',
      severity: 'MODERATE',
      title: 'Brisk Wind Squalls',
      observed: `Sustained winds of ${windSpeed} km/h with gusts up to ${windGusts} km/h.`,
      aiInterpretation: 'Noticeable aerodynamic resistance; hold vehicle steering firmly on open highways.',
    });
  }

  // 2. Heavy Precipitation & Flood / Waterlogging
  const curPrecip = current.precipitation || 0;
  const todayPrecipSum = daily[0]?.precipitationSum || 0;
  const maxRainProbToday = daily[0]?.precipitationProbabilityMax || 0;
  const isHeavyRain = curPrecip >= 12 || todayPrecipSum >= 30 || (maxRainProbToday >= 80 && curPrecip >= 4);

  if (isHeavyRain) {
    overallSeverity = 'HIGH';
    risks.push({
      type: 'FLOOD',
      severity: 'HIGH',
      title: 'Waterlogging & Flood Risk',
      observed: `Rainfall rate: ${curPrecip} mm/h. Today's projected precipitation sum: ${todayPrecipSum} mm.`,
      forecast: `Precipitation probability remains high at ${maxRainProbToday}%.`,
      aiInterpretation: 'Stormwater drainage capacity in low-lying underpasses and arterial dips may be stressed, increasing localized road submersion risk.',
      officialAlert: operational.alerts?.find((a) => /flood|heavy rain|inundation/i.test(a.headline))?.headline || null,
      recommendations: [
        'Do not drive through submerged underpasses or roads with standing water.',
        'Keep electrical main switches clear of ground-level moisture.',
        'Monitor local municipal drainage advisories and shelter locations.',
      ],
    });
  } else if (curPrecip >= 4 || todayPrecipSum >= 12 || maxRainProbToday >= 55) {
    if (overallSeverity === 'LOW') overallSeverity = 'MODERATE';
    risks.push({
      type: 'RAIN',
      severity: 'MODERATE',
      title: 'Moderate Rainfall Advisory',
      observed: `Current precipitation rate is ${curPrecip} mm/h with ${maxRainProbToday}% rain probability today.`,
      aiInterpretation: 'Wet road surfaces reduce braking traction; expect slower city traffic.',
      recommendations: [
        'Carry an umbrella or waterproof rainwear.',
        'Increase vehicle following distance on wet asphalt.',
      ],
    });
  }

  // 3. Thunderstorm & Lightning Hazard
  const isThunderstormCode = [95, 96, 99].includes(current.weatherCode) ||
                             hourly.slice(0, 4).some((h) => [95, 96, 99].includes(h.weatherCode));
  if (isThunderstormCode) {
    overallSeverity = 'HIGH';
    risks.push({
      type: 'LIGHTNING',
      severity: 'HIGH',
      title: 'Convective Thunderstorm & Lightning Hazard',
      observed: `Active convective cloud activity (WMO Code ${current.weatherCode}: ${current.condition}).`,
      aiInterpretation: 'Direct cloud-to-ground lightning strike hazard. Open sports fields, rooftops, and standing water become high-risk zones.',
      officialAlert: operational.alerts?.find((a) => /thunder|lightning/i.test(a.headline))?.headline || null,
      recommendations: [
        'Move indoors into a sturdy, enclosed building or metal-topped vehicle immediately.',
        'Do not seek shelter under isolated trees, metal towers, or tin sheds.',
        'Unplug sensitive electronics and avoid wired electrical devices.',
      ],
    });
  }

  // 4. Extreme Heat / Heatwave
  const curTemp = current.temperature;
  const feelsLike = current.apparentTemperature || curTemp;
  if (curTemp != null && (curTemp >= 40 || (feelsLike != null && feelsLike >= 42))) {
    overallSeverity = 'HIGH';
    risks.push({
      type: 'EXTREME_HEAT',
      severity: 'HIGH',
      title: 'Extreme Heatwave Stress',
      observed: `Ambient temperature: ${curTemp}°C. Heat index (feels like): ${feelsLike}°C.`,
      aiInterpretation: 'Elevated physiological thermal stress with heightened susceptibility to heat cramps, dehydration, and sunstroke during midday hours.',
      officialAlert: operational.alerts?.find((a) => /heat|heatwave/i.test(a.headline))?.headline || null,
      recommendations: [
        'Stay indoors during peak solar intensity hours (11:00 AM – 4:00 PM).',
        'Hydrate frequently with water and oral electrolyte fluids.',
        'Wear loose, light-colored cotton clothing.',
      ],
    });
  }

  // 5. Air Quality & Particulate Hazard
  const aqiVal = airQuality?.europeanAqi;
  if (aqiVal != null && aqiVal >= 75) {
    overallSeverity = 'HIGH';
    risks.push({
      type: 'POOR_AIR_QUALITY',
      severity: 'HIGH',
      title: 'Hazardous Atmospheric Pollution',
      observed: `European AQI: ${aqiVal} (${airQuality.severity}). PM2.5: ${airQuality.pm2_5 ? airQuality.pm2_5 + ' μg/m³' : 'Elevated'}.`,
      aiInterpretation: 'Fine particulate matter can trigger acute asthma flares, throat irritation, and cardiovascular strain.',
      recommendations: [
        'Wear a certified N95 / P2 respirator mask outdoors.',
        'Avoid strenuous outdoor running or cardiovascular exercise.',
        'Keep residential windows shut and utilize air purification.',
      ],
    });
  }

  // 6. Active Cyclones
  if (cyclones && cyclones.length > 0) {
    const criticalCyclones = cyclones.filter((c) => c.alertLevel === 'Red' || c.alertLevel === 'Orange' || c.category?.toLowerCase().includes('cyclone'));
    if (criticalCyclones.length > 0) {
      overallSeverity = 'HIGH';
      risks.push({
        type: 'CYCLONE',
        severity: 'HIGH',
        title: 'Tropical Cyclone System Monitored',
        observed: `${cyclones.length} cyclonic storm system(s) active in global tracking feeds (${criticalCyclones.map((c) => c.name).join(', ')}).`,
        aiInterpretation: 'Maritime gale conditions, coastal storm surges, and squally precipitation bands.',
        recommendations: [
          'Fisherfolk must not venture into deep oceanic sectors.',
          'Verify emergency supplies, battery backups, and local evacuation routes.',
        ],
      });
    }
  }

  // 7. Low Visibility / Fog
  if (current.visibilityKm != null && current.visibilityKm <= 1.5) {
    if (overallSeverity === 'LOW') overallSeverity = 'MODERATE';
    risks.push({
      type: 'LOW_VISIBILITY',
      severity: current.visibilityKm <= 0.5 ? 'HIGH' : 'MODERATE',
      title: 'Dense Fog & Reduced Visibility',
      observed: `Surface visibility restricted to ${current.visibilityKm} km.`,
      aiInterpretation: 'Severely compressed stopping sight distance for highway commuters and airport flight delays.',
      recommendations: [
        'Use low-beam headlights and dedicated vehicle fog lamps.',
        'Drive strictly within lane markings with increased headway.',
      ],
    });
  }

  return {
    overallSeverity,
    risks,
    isHighRisk: overallSeverity === 'HIGH',
    isModerateRisk: overallSeverity === 'MODERATE',
    isSafe: overallSeverity === 'LOW',
    topRisk: risks[0] || null,
  };
}

module.exports = {
  analyzeRisks,
};
