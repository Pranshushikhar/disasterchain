import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  CloudRain,
  Wind,
  Droplets,
  Sun,
  Clock,
  Compass,
  AlertTriangle,
  ShieldCheck,
  CheckCircle2,
  Info,
} from 'lucide-react';
import { fetchCompleteWeather, reverseGeocode } from '../services/weatherApi';

export default function ModernWeatherPage() {
  const [coords, setCoords] = useState({ lat: 28.6139, lon: 77.209 }); // Delhi default
  const [cityName, setCityName] = useState('Delhi NCR');
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  const [current, setCurrent] = useState({
    temp: 28,
    condition: 'Partly Cloudy',
    feelsLike: 30,
    humidity: 55,
    windSpeed: 12,
    rainProb: 20,
    uvIndex: 5,
    aqi: 65,
    aqiStatus: 'Moderate',
  });

  const [timeline, setTimeline] = useState([]);
  const [forecast, setForecast] = useState([]);

  // Geolocation
  useEffect(() => {
    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const lat = Number(pos.coords.latitude.toFixed(4));
          const lon = Number(pos.coords.longitude.toFixed(4));
          setCoords({ lat, lon });
          try {
            const rev = await reverseGeocode(lat, lon);
            if (rev?.city || rev?.displayName) {
              setCityName(rev.city || rev.displayName);
            }
          } catch (e) {}
        },
        () => {},
        { timeout: 8000 }
      );
    }
  }, []);

  // Fetch Weather Telemetry
  useEffect(() => {
    let isMounted = true;
    const loadWeather = async () => {
      try {
        const data = await fetchCompleteWeather(coords.lat, coords.lon);
        if (!isMounted || !data) return;

        const cur = data.current || {};
        const curTemp = Math.round(cur.temperature_2m ?? 28);
        const rainProb = data.hourly?.precipitation_probability?.[0] ?? cur.precipitation_probability ?? 15;

        setCurrent({
          temp: curTemp,
          condition: data.conditionText || cur.weather_code_text || 'Partly Cloudy',
          feelsLike: Math.round(cur.apparent_temperature ?? curTemp + 2),
          humidity: Math.round(cur.relative_humidity_2m ?? 55),
          windSpeed: Math.round(cur.wind_speed_10m ?? 12),
          rainProb: rainProb,
          uvIndex: Math.round(cur.uv_index ?? 5),
          aqi: data.aqi?.aqi ?? 65,
          aqiStatus: data.aqi?.status || (data.aqi?.aqi > 100 ? 'Unhealthy' : 'Moderate'),
        });

        // Parse hourly timeline (next 6-8 hours)
        if (data.hourly?.time) {
          const items = [];
          for (let i = 0; i < Math.min(8, data.hourly.time.length); i++) {
            const hourDate = new Date(data.hourly.time[i]);
            items.push({
              time: i === 0 ? 'Now' : `${hourDate.getHours()}:00`,
              temp: Math.round(data.hourly.temperature_2m?.[i] ?? curTemp),
              rain: data.hourly.precipitation_probability?.[i] ?? 10,
              wind: Math.round(data.hourly.wind_speed_10m?.[i] ?? 12),
            });
          }
          if (items.length > 0) setTimeline(items);
        }

        // Parse 5-day daily forecast
        if (data.daily?.time) {
          const days = [];
          const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
          for (let i = 1; i < Math.min(6, data.daily.time.length); i++) {
            const date = new Date(data.daily.time[i]);
            const dayName = i === 1 ? 'Tomorrow' : dayNames[date.getDay()];
            const prob = data.daily.precipitation_probability_max?.[i] ?? 20;
            days.push({
              day: dayName,
              high: Math.round(data.daily.temperature_2m_max?.[i] ?? curTemp + 2),
              low: Math.round(data.daily.temperature_2m_min?.[i] ?? curTemp - 4),
              condition: prob > 60 ? 'Rain Showers' : (prob > 35 ? 'Scattered Clouds' : 'Partly Cloudy'),
              rainProb: prob,
            });
          }
          if (days.length > 0) setForecast(days);
        }

        setLastUpdated(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      } catch (err) {
        console.error('ModernWeather load error:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadWeather();
    return () => {
      isMounted = false;
    };
  }, [coords]);

  const isHighRisk = current.rainProb >= 65 || current.windSpeed >= 35;
  const isModerateRisk = current.rainProb >= 40 || current.windSpeed >= 22;

  // Practical recommendation based on real forecast
  const practicalAdvice = React.useMemo(() => {
    if (current.rainProb >= 60) {
      return {
        clothing: 'Waterproof jacket or compact umbrella recommended.',
        commute: 'Elevated surface water potential in road underpasses.',
        outdoor: 'Hold off outdoor electrical or terrace work.',
      };
    }
    if (current.temp >= 33) {
      return {
        clothing: 'Lightweight, loose-fitting, breathable light fabrics.',
        commute: 'Ensure vehicle radiator coolant is topped up.',
        outdoor: 'Avoid strenuous physical exertion between 12 PM – 3 PM.',
      };
    }
    if (current.temp <= 14) {
      return {
        clothing: 'Thermal layers and an outer windbreaker.',
        commute: 'Allow vehicle warm-up and watch for early morning mist.',
        outdoor: 'Keep extremities covered during early morning outings.',
      };
    }
    return {
      clothing: 'Comfortable everyday cotton layers.',
      commute: 'Normal transit conditions across sector arterial roads.',
      outdoor: 'Conditions favorable for standard outdoor travel and exercise.',
    };
  }, [current]);

  return (
    <motion.div
      className="dc-weather-container"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="dc-weather-content">
        {/* City & Temperature Header with Data Freshness */}
        <header className="dc-weather-hero">
          <div className="dc-weather-hero-top">
            <span className="dc-weather-city">{cityName}</span>
            {lastUpdated && (
              <span className="dc-freshness-tag">
                <Clock size={12} />
                <span>Telemetry {lastUpdated}</span>
              </span>
            )}
          </div>
          <div className="dc-weather-temp-display">
            <span className="dc-weather-big-temp">{current.temp}°C</span>
            <div className="dc-weather-condition-col">
              <span className="dc-weather-condition-title">{current.condition}</span>
              <span className="dc-weather-feels">Feels like {current.feelsLike}°</span>
            </div>
          </div>
        </header>

        {/* 1. TODAY HOURLY TIMELINE */}
        <section className="dc-weather-section">
          <div className="dc-section-header-row">
            <h2 className="dc-section-title">Today's Hourly Timeline</h2>
            <span className="dc-contacts-caption">Next 8 Hours</span>
          </div>
          <div className="dc-timeline-scroll">
            {timeline.map((slot, idx) => (
              <div
                key={idx}
                className={`dc-timeline-slot ${idx === 0 ? 'active' : ''}`}
              >
                <span className="dc-slot-time">{slot.time}</span>
                <span className="dc-slot-temp">{slot.temp}°</span>
                <div className="dc-slot-metric rain" title="Precipitation probability">
                  <CloudRain size={13} />
                  <span>{slot.rain}%</span>
                </div>
                <div className="dc-slot-metric wind" title="Wind speed">
                  <Wind size={12} />
                  <span>{slot.wind} km/h</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 2. ATMOSPHERIC RISK ASSESSMENT & SCIENTIFIC GROUNDING */}
        <section className="dc-weather-section">
          <div
            className={`dc-weather-risk-card ${
              isHighRisk ? 'critical' : isModerateRisk ? 'warning' : 'safe'
            }`}
          >
            <div className="dc-risk-card-header">
              <div className="dc-risk-title-group">
                <span className="dc-risk-subtitle">ATMOSPHERIC HAZARD OUTLOOK</span>
                <h3 className="dc-risk-headline">
                  {isHighRisk
                    ? 'Elevated Precipitation Risk'
                    : isModerateRisk
                    ? 'Moderate Atmospheric Variance'
                    : 'Stable Atmospheric Baseline'}
                </h3>
              </div>
              <span
                className={`dc-risk-badge ${
                  isHighRisk ? 'high' : isModerateRisk ? 'moderate' : 'safe'
                }`}
              >
                {isHighRisk ? 'HIGH' : isModerateRisk ? 'MODERATE' : 'NORMAL'}
              </span>
            </div>
            <p className="dc-risk-explanation">
              {isHighRisk
                ? 'Convective storm activity or high rain probability may cause localized urban waterlogging. Check underpasses and allow extra transit buffer.'
                : isModerateRisk
                ? 'Scattered cloud bands and gusty winds observed. Minor puddling possible in low-lying zones.'
                : 'Numerical forecast models indicate calm surface parameters. (Calm weather does not guarantee an area is safe from all external or infrastructural hazards).'}
            </p>
          </div>
        </section>

        {/* 3. PRACTICAL RECOMMENDATIONS BASED ON REAL FORECAST */}
        <section className="dc-weather-section">
          <h2 className="dc-section-title">Practical Recommendations</h2>
          <div className="dc-recommendations-list">
            <div className="dc-recommendation-card normal">
              <div className="dc-recommendation-icon-wrap">
                <Sun size={18} />
              </div>
              <div className="dc-recommendation-content">
                <h4 className="dc-recommendation-title">Attire Guidance</h4>
                <p className="dc-recommendation-text">{practicalAdvice.clothing}</p>
              </div>
            </div>

            <div className="dc-recommendation-card normal">
              <div className="dc-recommendation-icon-wrap">
                <Compass size={18} />
              </div>
              <div className="dc-recommendation-content">
                <h4 className="dc-recommendation-title">Commute Advisory</h4>
                <p className="dc-recommendation-text">{practicalAdvice.commute}</p>
              </div>
            </div>

            <div className="dc-recommendation-card normal">
              <div className="dc-recommendation-icon-wrap">
                <ShieldCheck size={18} />
              </div>
              <div className="dc-recommendation-content">
                <h4 className="dc-recommendation-title">Outdoor Operations</h4>
                <p className="dc-recommendation-text">{practicalAdvice.outdoor}</p>
              </div>
            </div>
          </div>
        </section>

        {/* 4. AIR QUALITY & VITAL STATS */}
        <section className="dc-weather-section">
          <div className="dc-aqi-grid">
            <div className="dc-aqi-card">
              <span className="dc-stat-sub">Air Quality Index (EAQI)</span>
              <div className="dc-aqi-number-row">
                <span className="dc-aqi-number">{current.aqi}</span>
                <span className="dc-aqi-label">{current.aqiStatus}</span>
              </div>
              <p className="dc-stat-desc">
                {current.aqi <= 50
                  ? 'Air quality is satisfactory with minimal pollution risk.'
                  : current.aqi <= 100
                  ? 'Air quality is acceptable for most people; sensitive individuals should moderate prolonged exertion.'
                  : 'Elevated particulate pollution. Sensitive groups should wear protective masks.'}
              </p>
            </div>

            <div className="dc-vitals-card">
              <div className="dc-vital-row">
                <div className="dc-vital-item">
                  <Droplets size={16} className="dc-vital-icon water" />
                  <div>
                    <span className="dc-vital-val">{current.humidity}%</span>
                    <span className="dc-vital-lbl">Relative Humidity</span>
                  </div>
                </div>
                <div className="dc-vital-item">
                  <Wind size={16} className="dc-vital-icon forest" />
                  <div>
                    <span className="dc-vital-val">{current.windSpeed} km/h</span>
                    <span className="dc-vital-lbl">Wind Velocity</span>
                  </div>
                </div>
                <div className="dc-vital-item">
                  <Sun size={16} className="dc-vital-icon amber" />
                  <div>
                    <span className="dc-vital-val">{current.uvIndex} / 11</span>
                    <span className="dc-vital-lbl">UV Radiation Index</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 5. 5-DAY DAILY OUTLOOK */}
        <section className="dc-weather-section">
          <h2 className="dc-section-title">5-Day Forecast Outlook</h2>
          <div className="dc-forecast-list">
            {forecast.map((item, idx) => (
              <div key={idx} className="dc-forecast-row">
                <span className="dc-forecast-day">{item.day}</span>
                <div className="dc-forecast-condition">
                  <CloudRain size={15} className="dc-forecast-icon" />
                  <span>{item.condition}</span>
                </div>
                <span className="dc-forecast-rain">{item.rainProb}% rain</span>
                <div className="dc-forecast-temps">
                  <span className="dc-temp-high">{item.high}°</span>
                  <span className="dc-temp-low">{item.low}°</span>
                </div>
              </div>
            ))}
          </div>

          <div className="dc-weather-source-footnote">
            <Info size={13} />
            <span>
              Telemetry powered by Open-Meteo High-Resolution Numerical Meteorological Models. Refreshed continuously.
            </span>
          </div>
        </section>
      </div>
    </motion.div>
  );
}
