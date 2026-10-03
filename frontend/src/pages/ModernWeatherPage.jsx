import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  CloudRain,
  Wind,
  Droplets,
  Sun,
} from 'lucide-react';
import { fetchCompleteWeather, reverseGeocode } from '../services/weatherApi';

export default function ModernWeatherPage() {
  const [coords, setCoords] = useState({ lat: 28.6139, lon: 77.209 }); // Delhi default
  const [cityName, setCityName] = useState('Delhi NCR');
  const [loading, setLoading] = useState(true);

  const [current, setCurrent] = useState({
    temp: 30,
    condition: 'Partly Cloudy',
    feelsLike: 32,
    humidity: 72,
    windSpeed: 14,
    rainProb: 65,
    uvIndex: 6,
    aqi: 68,
    aqiStatus: 'Moderate',
  });

  const [timeline, setTimeline] = useState([
    { time: 'Now', temp: 30, rain: 65, wind: 14 },
    { time: '12:00', temp: 31, rain: 70, wind: 16 },
    { time: '14:00', temp: 29, rain: 85, wind: 22 },
    { time: '16:00', temp: 27, rain: 90, wind: 24 },
    { time: '18:00', temp: 26, rain: 45, wind: 15 },
    { time: '20:00', temp: 25, rain: 20, wind: 12 },
  ]);

  const [forecast, setForecast] = useState([
    { day: 'Tomorrow', high: 29, low: 24, condition: 'Heavy Rain', rainProb: 85 },
    { day: 'Wednesday', high: 31, low: 25, condition: 'Scattered Showers', rainProb: 60 },
    { day: 'Thursday', high: 32, low: 26, condition: 'Partly Cloudy', rainProb: 30 },
    { day: 'Friday', high: 33, low: 26, condition: 'Mostly Sunny', rainProb: 15 },
    { day: 'Saturday', high: 34, low: 27, condition: 'Clear Sky', rainProb: 10 },
  ]);

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

  // Fetch Weather
  useEffect(() => {
    let isMounted = true;
    const loadWeather = async () => {
      try {
        const data = await fetchCompleteWeather(coords.lat, coords.lon);
        if (!isMounted || !data) return;

        const curTemp = Math.round(data.current?.temperature_2m || 30);
        setCurrent({
          temp: curTemp,
          condition: data.conditionText || 'Partly Cloudy',
          feelsLike: Math.round(data.current?.apparent_temperature || curTemp + 2),
          humidity: Math.round(data.current?.relative_humidity_2m || 72),
          windSpeed: Math.round(data.current?.wind_speed_10m || 14),
          rainProb: data.hourly?.precipitation_probability?.[0] || 65,
          uvIndex: Math.round(data.current?.uv_index || 6),
          aqi: data.aqi?.aqi || 68,
          aqiStatus: data.aqi?.status || 'Moderate',
        });

        // Parse hourly timeline (next 6 hours)
        if (data.hourly?.time) {
          const nowHour = new Date().getHours();
          const items = [];
          for (let i = 0; i < 6; i++) {
            const index = i;
            const hourDate = new Date(data.hourly.time[index]);
            items.push({
              time: i === 0 ? 'Now' : `${hourDate.getHours()}:00`,
              temp: Math.round(data.hourly.temperature_2m?.[index] ?? 29),
              rain: data.hourly.precipitation_probability?.[index] ?? 40,
              wind: Math.round(data.hourly.wind_speed_10m?.[index] ?? 14),
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
            days.push({
              day: dayName,
              high: Math.round(data.daily.temperature_2m_max?.[i] ?? 32),
              low: Math.round(data.daily.temperature_2m_min?.[i] ?? 24),
              condition:
                (data.daily.precipitation_probability_max?.[i] || 0) > 60
                  ? 'Rain Showers'
                  : 'Partly Cloudy',
              rainProb: data.daily.precipitation_probability_max?.[i] ?? 30,
            });
          }
          if (days.length > 0) setForecast(days);
        }
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

  const isHighRisk = current.rainProb >= 70;

  return (
    <motion.div
      className="dc-weather-container"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="dc-weather-content">
        {/* City & Temperature Header */}
        <header className="dc-weather-hero">
          <span className="dc-weather-city">{cityName}</span>
          <div className="dc-weather-temp-display">
            <span className="dc-weather-big-temp">{current.temp}°C</span>
            <div className="dc-weather-condition-col">
              <span className="dc-weather-condition-title">{current.condition}</span>
              <span className="dc-weather-feels">Feels like {current.feelsLike}°</span>
            </div>
          </div>
        </header>

        {/* TODAY TIMELINE */}
        <section className="dc-weather-section">
          <h2 className="dc-section-title">Today</h2>
          <div className="dc-timeline-scroll">
            {timeline.map((slot, idx) => (
              <div
                key={idx}
                className={`dc-timeline-slot ${idx === 0 ? 'active' : ''}`}
              >
                <span className="dc-slot-time">{slot.time}</span>
                <span className="dc-slot-temp">{slot.temp}°</span>
                <div className="dc-slot-metric rain" title="Rain probability">
                  <CloudRain size={13} />
                  <span>{slot.rain}%</span>
                </div>
                <div className="dc-slot-metric wind" title="Wind velocity">
                  <Wind size={12} />
                  <span>{slot.wind} km/h</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CONCISE RISK BOX */}
        <section className="dc-weather-section">
          <div className={`dc-weather-risk-card ${isHighRisk ? 'critical' : 'warning'}`}>
            <div className="dc-risk-card-header">
              <div className="dc-risk-title-group">
                <span className="dc-risk-subtitle">ENVIRONMENTAL HAZARD</span>
                <h3 className="dc-risk-headline">Waterlogging Risk</h3>
              </div>
              <span className={`dc-risk-badge ${isHighRisk ? 'high' : 'moderate'}`}>
                {isHighRisk ? 'HIGH' : 'MODERATE'}
              </span>
            </div>
            <p className="dc-risk-explanation">
              {isHighRisk
                ? 'Heavy sustained rainfall will exceed urban drainage thresholds between 14:00 and 17:00. Low-lying arterial roads and underpasses are at high inundation risk.'
                : 'Scattered precipitation may cause minor localized puddling. Major transit corridors remain accessible.'}
            </p>
          </div>
        </section>

        {/* AIR QUALITY & VITAL STATS */}
        <section className="dc-weather-section">
          <div className="dc-aqi-grid">
            <div className="dc-aqi-card">
              <span className="dc-stat-sub">Air Quality Index</span>
              <div className="dc-aqi-number-row">
                <span className="dc-aqi-number">{current.aqi}</span>
                <span className="dc-aqi-label">{current.aqiStatus}</span>
              </div>
              <p className="dc-stat-desc">
                Air quality is acceptable for most individuals. Sensitive groups should monitor exertion.
              </p>
            </div>

            <div className="dc-vitals-card">
              <div className="dc-vital-row">
                <div className="dc-vital-item">
                  <Droplets size={16} className="dc-vital-icon water" />
                  <div>
                    <span className="dc-vital-val">{current.humidity}%</span>
                    <span className="dc-vital-lbl">Humidity</span>
                  </div>
                </div>
                <div className="dc-vital-item">
                  <Wind size={16} className="dc-vital-icon forest" />
                  <div>
                    <span className="dc-vital-val">{current.windSpeed} km/h</span>
                    <span className="dc-vital-lbl">Wind Speed</span>
                  </div>
                </div>
                <div className="dc-vital-item">
                  <Sun size={16} className="dc-vital-icon amber" />
                  <div>
                    <span className="dc-vital-val">{current.uvIndex} / 11</span>
                    <span className="dc-vital-lbl">UV Index</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 5-DAY FORECAST */}
        <section className="dc-weather-section">
          <h2 className="dc-section-title">5-Day Outlook</h2>
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
        </section>
      </div>
    </motion.div>
  );
}
