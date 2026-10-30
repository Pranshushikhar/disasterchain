import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
  MapPin,
  RefreshCw,
  Search,
  Crosshair,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { fetchCompleteWeather } from '../services/weatherApi';
import { useDCLocation } from '../context/LocationContext';
import { useTranslation } from '../i18n/i18n';
import {
  translateWeatherConditionText,
  translateAqiStatus,
} from '../utils/weatherUtils';

export default function ModernWeatherPage() {
  const { t } = useTranslation();
  const {
    coords,
    locationName,
    city,
    state,
    country,
    isGpsLocked,
    isLocating,
    permissionDenied,
    requestGpsLocation,
    openCitySelector,
  } = useDCLocation();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const [current, setCurrent] = useState({
    temp: 26,
    condition: 'Partly Cloudy',
    feelsLike: 27,
    humidity: 55,
    windSpeed: 12,
    rainProb: 15,
    uvIndex: 5,
    aqi: 65,
    aqiStatus: 'Moderate',
  });

  const [timeline, setTimeline] = useState([]);
  const [forecast, setForecast] = useState([]);

  // Fetch Weather Telemetry for active coords
  const loadWeather = useCallback(async () => {
    if (!coords || coords.lat == null || coords.lon == null) return;
    setLoading(true);
    setError(null);

    try {
      const data = await fetchCompleteWeather(coords.lat, coords.lon);
      if (!data) throw new Error('No weather data received');

      const cur = data.current || {};
      const curTemp = Math.round(cur.temperature_2m ?? cur.temperature ?? 26);
      const rainProb =
        data.hourly?.precipitation_probability?.[0] ??
        cur.precipitation_probability ??
        15;

      setCurrent({
        temp: curTemp,
        condition: data.conditionText || cur.weather_code_text || 'Partly Cloudy',
        feelsLike: Math.round(cur.apparent_temperature ?? cur.apparentTemperature ?? curTemp),
        humidity: Math.round(cur.relative_humidity_2m ?? cur.relativeHumidity ?? 55),
        windSpeed: Math.round(cur.wind_speed_10m ?? cur.windSpeed ?? 12),
        rainProb: rainProb,
        uvIndex: Math.round(cur.uv_index ?? cur.uvIndex ?? 5),
        aqi: data.aqi?.aqi ?? cur.aqi ?? 65,
        aqiStatus: data.aqi?.status || (data.aqi?.aqi > 100 ? 'Unhealthy' : 'Moderate'),
      });

      // Parse hourly timeline (next 8 hours)
      if (data.hourly?.time) {
        const items = [];
        for (let i = 0; i < Math.min(8, data.hourly.time.length); i++) {
          const hourDate = new Date(data.hourly.time[i]);
          items.push({
            time: i === 0 ? t('common.now', 'Now') : `${hourDate.getHours()}:00`,
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
        const dayNames = [
          t('common.sun', 'Sun'),
          t('common.mon', 'Mon'),
          t('common.tue', 'Tue'),
          t('common.wed', 'Wed'),
          t('common.thu', 'Thu'),
          t('common.fri', 'Fri'),
          t('common.sat', 'Sat'),
        ];
        for (let i = 0; i < Math.min(5, data.daily.time.length); i++) {
          const d = new Date(data.daily.time[i]);
          days.push({
            day: i === 0 ? t('common.today', 'Today') : dayNames[d.getDay()],
            high: Math.round(data.daily.temperature_2m_max?.[i] ?? curTemp + 2),
            low: Math.round(data.daily.temperature_2m_min?.[i] ?? curTemp - 4),
            condition: data.daily.conditionText?.[i] || cur.weather_code_text || 'Partly Cloudy',
            rainProb: data.daily.precipitation_probability_max?.[i] ?? 20,
          });
        }
        if (days.length > 0) setForecast(days);
      }

      setLastUpdated(
        new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      );
    } catch (err) {
      console.warn('Weather telemetry load failure:', err.message);
      setError(err.message || 'Unable to sync atmospheric telemetry.');
    } finally {
      setLoading(false);
    }
  }, [coords, t]);

  useEffect(() => {
    loadWeather();
  }, [loadWeather]);

  const isHighRisk = current.rainProb >= 65 || current.windSpeed >= 35;
  const isModerateRisk = current.rainProb >= 40 || current.windSpeed >= 22;

  // Practical recommendation based on real forecast
  const practicalAdvice = useMemo(() => {
    if (current.rainProb >= 60) {
      return {
        clothing: t('weather.rainClothing', 'Waterproof jacket or compact umbrella recommended.'),
        commute: t('weather.rainCommute', 'Elevated surface water potential in road underpasses.'),
        outdoor: t('weather.rainOutdoor', 'Hold off outdoor electrical or terrace work.'),
      };
    }
    if (current.temp >= 33) {
      return {
        clothing: t('weather.hotClothing', 'Lightweight, loose-fitting, breathable light fabrics.'),
        commute: t('weather.hotCommute', 'Ensure vehicle radiator coolant is topped up.'),
        outdoor: t('weather.hotOutdoor', 'Avoid strenuous physical exertion between 12 PM – 3 PM.'),
      };
    }
    if (current.temp <= 14) {
      return {
        clothing: t('weather.coldClothing', 'Thermal layers and an outer windbreaker.'),
        commute: t('weather.coldCommute', 'Allow vehicle warm-up and watch for early morning mist.'),
        outdoor: t('weather.coldOutdoor', 'Keep extremities covered during early morning outings.'),
      };
    }
    return {
      clothing: t('weather.calmClothing', 'Comfortable everyday cotton layers.'),
      commute: t('weather.calmCommute', 'Normal transit conditions across sector arterial roads.'),
      outdoor: t('weather.calmOutdoor', 'Conditions favorable for standard outdoor travel and exercise.'),
    };
  }, [current, t]);

  return (
    <motion.div
      className="dc-weather-container"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="dc-weather-content">
        {/* Permission Denied Notice if user denied GPS */}
        {permissionDenied && (
          <div className="dc-location-denied-note" style={{ marginBottom: 18 }}>
            <AlertCircle size={15} />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
              <span>
                {t(
                  'common.locationPermissionDeniedNotice',
                  'Location permission was denied. You can select your city manually at any time.'
                )}
              </span>
              <button
                onClick={openCitySelector}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'inherit',
                  textDecoration: 'underline',
                  fontWeight: 600,
                  cursor: 'pointer',
                  marginLeft: 8,
                }}
              >
                {t('weather.changeLocation', 'Select City')}
              </button>
            </div>
          </div>
        )}

        {/* City & Temperature Header with Controls */}
        <header className="dc-weather-hero">
          <div className="dc-weather-hero-top">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <div
                onClick={openCitySelector}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  cursor: 'pointer',
                  padding: '4px 10px',
                  borderRadius: 8,
                  background: 'var(--dc-surface)',
                  border: '1px solid var(--border-subtle)',
                }}
                title={t('common.selectLocation', 'Click to change city')}
              >
                <MapPin size={14} color="var(--dc-earth-green)" />
                <span className="dc-weather-city" style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700 }}>
                  {locationName}
                </span>
                <span style={{ fontSize: '0.78rem', color: 'var(--dc-earth-green)', fontWeight: 600, marginLeft: 4 }}>
                  [{t('common.change', 'Change')}]
                </span>
              </div>

              {isGpsLocked && (
                <span className="dc-gps-pill" title="Live GPS Lock">
                  GPS ✓
                </span>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {lastUpdated && (
                <span className="dc-freshness-tag">
                  <Clock size={12} />
                  <span>
                    {t('common.updated', 'Updated')} {lastUpdated}
                  </span>
                </span>
              )}

              <button
                type="button"
                onClick={loadWeather}
                disabled={loading}
                className="dc-clean-link-btn"
                style={{ padding: '4px 8px', fontSize: '0.8rem' }}
                title={t('common.refresh', 'Refresh telemetry')}
              >
                <RefreshCw size={13} className={loading ? 'dc-spin' : ''} />
                <span>{t('common.refresh', 'Refresh')}</span>
              </button>
            </div>
          </div>

          <div className="dc-weather-temp-display">
            <span className="dc-weather-big-temp">{current.temp}°C</span>
            <div className="dc-weather-condition-col">
              <span className="dc-weather-condition-title">{translateWeatherConditionText(current.condition, t)}</span>
              <span className="dc-weather-feels">
                {t('weather.feelsLike', 'Feels like')} {current.feelsLike}°C
              </span>
            </div>
          </div>
        </header>

        {/* 1. TODAY HOURLY TIMELINE */}
        <section className="dc-weather-section">
          <div className="dc-section-header-row">
            <h2 className="dc-section-title">
              {t('weather.hourlyForecast', "Today's Hourly Timeline")}
            </h2>
            <span className="dc-contacts-caption">{t('weather.next8Hours', 'Next 8 Hours')}</span>
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
                <span className="dc-risk-subtitle">
                  {t('weather.riskAssessment', 'ATMOSPHERIC HAZARD OUTLOOK')}
                </span>
                <h3 className="dc-risk-headline">
                  {isHighRisk
                    ? t('weather.highRiskTitle', 'Elevated Precipitation Risk')
                    : isModerateRisk
                    ? t('weather.moderateRiskTitle', 'Moderate Atmospheric Variance')
                    : t('weather.stableTitle', 'Stable Atmospheric Baseline')}
                </h3>
              </div>
              <span
                className={`dc-risk-badge ${
                  isHighRisk ? 'high' : isModerateRisk ? 'moderate' : 'safe'
                }`}
              >
                {isHighRisk
                  ? t('common.high', 'HIGH')
                  : isModerateRisk
                  ? t('common.medium', 'MODERATE')
                  : t('common.safe', 'NORMAL')}
              </span>
            </div>
            <p className="dc-risk-explanation">
              {isHighRisk
                ? t(
                    'weather.highRiskDesc',
                    'Convective storm activity or high rain probability may cause localized urban waterlogging. Check underpasses and allow extra transit buffer.'
                  )
                : isModerateRisk
                ? t(
                    'weather.moderateRiskDesc',
                    'Scattered cloud bands and gusty winds observed. Minor puddling possible in low-lying zones.'
                  )
                : t(
                    'weather.stableDesc',
                    'Numerical forecast models indicate calm surface parameters. (Calm weather does not guarantee an area is safe from all external or infrastructural hazards).'
                  )}
            </p>
          </div>
        </section>

        {/* 3. PRACTICAL RECOMMENDATIONS BASED ON REAL FORECAST */}
        <section className="dc-weather-section">
          <h2 className="dc-section-title">
            {t('weather.recommendationsTitle', 'Practical Recommendations')}
          </h2>
          <div className="dc-recommendations-list">
            <div className="dc-recommendation-card normal">
              <div className="dc-recommendation-icon-wrap">
                <Sun size={18} />
              </div>
              <div className="dc-recommendation-content">
                <h4 className="dc-recommendation-title">
                  {t('weather.attireGuidance', 'Attire Guidance')}
                </h4>
                <p className="dc-recommendation-text">{practicalAdvice.clothing}</p>
              </div>
            </div>

            <div className="dc-recommendation-card normal">
              <div className="dc-recommendation-icon-wrap">
                <Compass size={18} />
              </div>
              <div className="dc-recommendation-content">
                <h4 className="dc-recommendation-title">
                  {t('weather.commuteAdvisory', 'Commute Advisory')}
                </h4>
                <p className="dc-recommendation-text">{practicalAdvice.commute}</p>
              </div>
            </div>

            <div className="dc-recommendation-card normal">
              <div className="dc-recommendation-icon-wrap">
                <ShieldCheck size={18} />
              </div>
              <div className="dc-recommendation-content">
                <h4 className="dc-recommendation-title">
                  {t('weather.outdoorOperations', 'Outdoor Operations')}
                </h4>
                <p className="dc-recommendation-text">{practicalAdvice.outdoor}</p>
              </div>
            </div>
          </div>
        </section>

        {/* 4. AIR QUALITY & VITAL STATS */}
        <section className="dc-weather-section">
          <div className="dc-aqi-grid">
            <div className="dc-aqi-card">
              <span className="dc-stat-sub">
                {t('weather.airQuality', 'Air Quality Index (EAQI)')}
              </span>
              <div className="dc-aqi-number-row">
                <span className="dc-aqi-number">{current.aqi}</span>
                <span className="dc-aqi-label">{translateAqiStatus(current.aqiStatus, t)}</span>
              </div>
              <p className="dc-stat-desc">
                {current.aqi <= 50
                  ? t('weather.aqiGood', 'Air quality is satisfactory with minimal pollution risk.')
                  : current.aqi <= 100
                  ? t(
                      'weather.aqiModerate',
                      'Air quality is acceptable for most people; sensitive individuals should moderate prolonged exertion.'
                    )
                  : t(
                      'weather.aqiUnhealthy',
                      'Elevated particulate pollution. Sensitive groups should wear protective masks.'
                    )}
              </p>
            </div>

            <div className="dc-vitals-card">
              <div className="dc-vital-row">
                <div className="dc-vital-item">
                  <Droplets size={16} className="dc-vital-icon water" />
                  <div>
                    <span className="dc-vital-val">{current.humidity}%</span>
                    <span className="dc-vital-lbl">
                      {t('weather.humidity', 'Relative Humidity')}
                    </span>
                  </div>
                </div>
                <div className="dc-vital-item">
                  <Wind size={16} className="dc-vital-icon forest" />
                  <div>
                    <span className="dc-vital-val">{current.windSpeed} km/h</span>
                    <span className="dc-vital-lbl">
                      {t('weather.windSpeed', 'Wind Velocity')}
                    </span>
                  </div>
                </div>
                <div className="dc-vital-item">
                  <Sun size={16} className="dc-vital-icon amber" />
                  <div>
                    <span className="dc-vital-val">{current.uvIndex} / 11</span>
                    <span className="dc-vital-lbl">
                      {t('weather.uvIndex', 'UV Radiation Index')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 5. 5-DAY DAILY OUTLOOK */}
        <section className="dc-weather-section">
          <h2 className="dc-section-title">
            {t('weather.dailyForecast', '5-Day Forecast Outlook')}
          </h2>
          <div className="dc-forecast-list">
            {forecast.map((item, idx) => (
              <div key={idx} className="dc-forecast-row">
                <span className="dc-forecast-day">{item.day}</span>
                <div className="dc-forecast-condition">
                  <CloudRain size={15} className="dc-forecast-icon" />
                  <span>{translateWeatherConditionText(item.condition, t)}</span>
                </div>
                <span className="dc-forecast-rain">{item.rainProb}% {t('weather.rain', 'rain')}</span>
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
              {t(
                'weather.source',
                'Telemetry powered by Open-Meteo High-Resolution Numerical Meteorological Models. Refreshed continuously.'
              )}
            </span>
          </div>
        </section>
      </div>
    </motion.div>
  );
}
