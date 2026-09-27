/**
 * WeatherGPT 2.0 Atmospheric Science Explanation Base
 * Bridges scientific meteorological principles directly with live active weather telemetry.
 */

function explainWeatherScience(topic, weatherContext, options = {}) {
  const { current, locationName } = weatherContext;
  const temp = current.temperature ?? 'N/A';
  const feelsLike = current.feelsLike ?? 'N/A';
  const humidity = current.humidity ?? 'N/A';
  const pressure = current.pressureHpa ?? 'N/A';
  const clouds = current.cloudCover ?? 'N/A';
  const wind = current.windSpeed ?? 'N/A';
  const uv = current.uvIndex ?? 'N/A';

  switch (topic) {
    case 'HUMIDITY_NO_RAIN':
      return {
        concept: 'High Humidity Without Rain',
        scientificCore:
          'Relative humidity measures how close the air at ground level is to its moisture-holding saturation point at current ambient temperature, not the total water content of the atmospheric column.',
        whyHappens:
          'Rain requires vertical convective lifting, adiabatic cooling aloft to reach the dew point, and cloud droplet coalescence around condensation nuclei. If the upper atmosphere is warm or stable (lacking an updraft or cold frontal boundary), ground air can remain near 90% humidity while clouds cannot precipitate.',
        groundedContext: `In ${locationName}, current surface humidity is ${humidity}% with ${clouds}% cloud cover. Even though the air feels saturated near ground level, rain will only occur if active convective updrafts lift this moisture into colder upper-air layers.`,
        takeaway: 'High surface humidity causes sweat evaporation to stall, but precipitation depends on upper-atmosphere cooling and condensation, not just surface air moisture.',
      };

    case 'FEELS_LIKE_TEMP': {
      const isHot = typeof temp === 'number' && temp >= 24;
      return {
        concept: 'Apparent Temperature ("Feels Like")',
        scientificCore:
          'The human body regulates temperature through evaporative cooling (perspiration) and convective heat transfer with ambient air.',
        whyHappens: isHot
          ? 'When relative humidity is elevated, the ambient air is already loaded with water vapor. Sweat cannot evaporate quickly from skin, trapping body heat and making the air feel substantially hotter than the thermometer reading.'
          : 'Wind speed strips the thin insulating boundary layer of warm air radiating from human skin, accelerating heat loss and making cold air feel sharply colder (wind chill).',
        groundedContext: `Right now in ${locationName}, the thermometer reads ${temp}°C, but it feels like ${feelsLike}°C (with ${humidity}% humidity and ${wind} km/h wind).`,
        takeaway: `Watch the "feels like" metric (${feelsLike}°C) rather than just ${temp}°C to gauge hydration needs and heat exhaustion risk.`,
      };
    }

    case 'PRESSURE_DROP':
      return {
        concept: 'Barometric Pressure Drop',
        scientificCore:
          'Barometric pressure reflects the weight of the air column above a location. Standard sea-level pressure averages ~1013 hPa.',
        whyHappens:
          'A sudden drop in pressure indicates a low-pressure trough, frontal system, or convective depression moving in. As surface air converges and rises rapidly, it expands, cools, and forms dense cloud decks, frequently heralding gusty winds, squalls, or heavy rain.',
        groundedContext: `The current barometric pressure in ${locationName} is ${pressure} hPa. A falling barometer is one of nature\'s earliest indicators that atmospheric stability is deteriorating.`,
        takeaway: 'If barometric pressure drops rapidly (more than 2–3 hPa over 3 hours), prepare for shifting wind directions, building clouds, and incoming precipitation.',
      };

    case 'CLOUDS_FORMING':
      return {
        concept: 'Cloud Formation & Cloud Cover',
        scientificCore:
          'Clouds form when invisible water vapor condenses into microscopic liquid droplets or ice crystals.',
        whyHappens:
          'When sun-warmed surface air rises, it encounters lower atmospheric pressure at higher altitudes. The parcel expands and cools adiabatically. Once temperature reaches the dew point, water vapor condenses around airborne aerosols (dust, salt, smoke). When millions of droplets gather, clouds become visible.',
        groundedContext: `Currently, ${locationName} has ${clouds}% cloud cover with ${humidity}% humidity. Higher cloud cover traps longwave thermal radiation emitted by Earth at night, keeping nighttime temperatures higher.`,
        takeaway: 'Increasing cumulus or cumulonimbus clouds indicate vigorous vertical updrafts and rising rain probability.',
      };

    case 'THUNDERSTORM_CAUSE':
      return {
        concept: 'Thunderstorm Genesis',
        scientificCore:
          'Thunderstorms are deep convective heat engines requiring three essential ingredients: atmospheric moisture, unstable air, and a lifting mechanism.',
        whyHappens:
          'Intense surface heating or a passing front forces warm, moist air upward into cold upper-tropospheric layers. As water vapor rapidly condenses, it releases latent heat, which accelerates the updraft. Colliding graupel and ice crystals in the cloud separate positive and negative electrical charges. When the electric field exceeds air insulation breakdown voltage, lightning strikes, superheating air to 30,000°C in microseconds to produce sonic thunder claps.',
        groundedContext: `In ${locationName}, current conditions show ${temp}°C with ${humidity}% humidity and ${wind} km/h wind. Rapid afternoon surface heating combined with high humidity is the classic trigger for convective squalls.`,
        takeaway: 'When thunder roars, go indoors. Lightning can strike up to 15 km away from the rain core of a storm.',
      };

    case 'UV_EXPLANATION':
      return {
        concept: 'Ultraviolet (UV) Radiation Index',
        scientificCore:
          'The Global Solar UV Index describes the level of solar UV radiation at the Earth\'s surface, primarily UVA and UVB wavelengths.',
        whyHappens:
          'UV intensity peaks when the sun is at its highest solar elevation angle (solar noon). While clouds scatter some visible light, up to 80% of UV rays penetrate thin or broken cloud layers, and reflection off concrete, water, or sand intensifies exposure.',
        groundedContext: `The UV index in ${locationName} is currently rated at ${uv}. At levels 6 and above, unprotected skin can experience erythema (sunburn) and cellular damage within 20 to 30 minutes.`,
        takeaway: 'Wear UV-blocking sunglasses, apply broad-spectrum sunscreen, and seek shade during peak midday hours.',
      };

    default:
      return {
        concept: 'Atmospheric Physics',
        scientificCore: 'Weather represents the continuous thermodynamic balancing of heat, moisture, and pressure across Earth\'s troposphere.',
        whyHappens: 'Solar radiation heats the equator more than the poles, creating pressure gradients that drive wind belts, jet streams, and moisture circulation.',
        groundedContext: `In ${locationName}, current temperature is ${temp}°C, humidity is ${humidity}%, and pressure is ${pressure} hPa.`,
        takeaway: 'All local weather changes stem from thermodynamic interactions between temperature, humidity, and barometric pressure.',
      };
  }
}

module.exports = {
  explainWeatherScience,
};
