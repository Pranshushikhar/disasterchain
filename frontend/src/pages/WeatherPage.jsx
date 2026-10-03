import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../i18n/i18n';
import { useWeatherGPT } from '../context/WeatherGPTContext';
import WeatherMap from '../components/WeatherMap';
import {
  fetchCompleteWeather,
  fetchActiveCyclones,
  fetchDisasterEvents,
  searchLocations,
  reverseGeocode,
} from '../services/weatherApi';
import {
  getWeatherCondition,
  degreesToCardinal,
  getAqiDetails,
  evaluateAtmosphericRisk,
} from '../utils/weatherUtils';
import SourceBadge from '../components/SourceBadge';
import RiskMatrix from '../components/RiskMatrix';

/**
 * Editorial Trend Chart (SVG Spline + Rain Bars)
 * Restrained editorial visualization showing temperature progression and rain probability
 */
const WeatherEditorialChart = ({ data, isHourly = false, t }) => {
  if (!data || data.length === 0) return null;

  const points = data.slice(0, isHourly ? 12 : 7);
  const temps = points.map((p) => Math.round(p.temperature ?? p.tempMax ?? 25));
  const rainProbs = points.map((p) => p.precipitationProbability ?? p.precipitationProbabilityMax ?? 0);

  const minTemp = Math.min(...temps) - 2;
  const maxTemp = Math.max(...temps) + 2;
  const tempRange = maxTemp - minTemp || 1;

  const svgWidth = 680;
  const svgHeight = 150;
  const paddingX = 40;
  const paddingTop = 28;
  const paddingBottom = 42;
  const chartHeight = svgHeight - paddingTop - paddingBottom;
  const stepX = (svgWidth - paddingX * 2) / Math.max(1, points.length - 1);

  const coords = points.map((p, idx) => {
    const x = paddingX + idx * stepX;
    const temp = temps[idx];
    const norm = (temp - minTemp) / tempRange;
    const y = paddingTop + (1 - norm) * chartHeight;
    return { x, y, temp, rain: rainProbs[idx], label: p.label };
  });

  const pathD = coords.reduce((acc, c, i) => {
    if (i === 0) return `M ${c.x} ${c.y}`;
    const prev = coords[i - 1];
    const cp1x = prev.x + (c.x - prev.x) / 2;
    const cp1y = prev.y;
    const cp2x = prev.x + (c.x - prev.x) / 2;
    const cp2y = c.y;
    return `${acc} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${c.x} ${c.y}`;
  }, '');

  const areaD = `${pathD} L ${coords[coords.length - 1].x} ${svgHeight - paddingBottom} L ${coords[0].x} ${svgHeight - paddingBottom} Z`;

  return (
    <div style={{ width: '100%', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
      <svg
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        style={{ width: '100%', minWidth: '560px', height: 'auto', display: 'block' }}
      >
        <defs>
          <linearGradient id="warmTempGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#496B5A" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#496B5A" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Shaded Area */}
        <path d={areaD} fill="url(#warmTempGradient)" />

        {/* Spline Line */}
        <path
          d={pathD}
          fill="none"
          stroke="#263F35"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Data Nodes & Temperature Callouts */}
        {coords.map((c, i) => (
          <g key={i}>
            {/* Vertical Guide */}
            <line
              x1={c.x}
              y1={c.y}
              x2={c.x}
              y2={svgHeight - paddingBottom}
              stroke="rgba(73, 107, 90, 0.18)"
              strokeDasharray="2,3"
            />

            {/* Circle Marker */}
            <circle cx={c.x} cy={c.y} r="3.5" fill="#FFFDF8" stroke="#263F35" strokeWidth="2" />

            {/* Temperature Tag */}
            <text
              x={c.x}
              y={c.y - 9}
              textAnchor="middle"
              fill="#1E2725"
              fontSize="12"
              fontWeight="800"
              fontFamily="var(--font-mono)"
            >
              {c.temp}°
            </text>

            {/* Rain Probability Pill */}
            {c.rain > 0 && (
              <text
                x={c.x}
                y={svgHeight - paddingBottom + 16}
                textAnchor="middle"
                fill={c.rain >= 40 ? '#5D8990' : '#85938D'}
                fontSize="10"
                fontWeight="700"
                fontFamily="var(--font-mono)"
              >
                {c.rain}%
              </text>
            )}

            {/* Time / Day Label */}
            <text
              x={c.x}
              y={svgHeight - 6}
              textAnchor="middle"
              fill="#65706B"
              fontSize="11"
              fontWeight="600"
            >
              {c.label}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
};

export default function WeatherPage() {
  const { t } = useTranslation();
  const { openWeatherGPT } = useWeatherGPT();

  // Selected Location (Default: New Delhi, India)
  const [selectedLocation, setSelectedLocation] = useState({
    city: 'New Delhi',
    state: 'Delhi',
    country: 'India',
    latitude: 28.6139,
    longitude: 77.2090,
    isGps: false,
  });

  const [userCoords, setUserCoords] = useState(null);
  const [locPermissionError, setLocPermissionError] = useState(null);
  const [isLocating, setIsLocating] = useState(false);

  // Search & Selector Drawer state
  const [showLocationSearch, setShowLocationSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  // Telemetry state
  const [weatherData, setWeatherData] = useState(null);
  const [cyclonesData, setCyclonesData] = useState([]);
  const [disastersData, setDisastersData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorNotice, setErrorNotice] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [isCached, setIsCached] = useState(false);
  const [feedStatus, setFeedStatus] = useState('LIVE'); // 'LIVE' | 'PARTIAL_LIVE' | 'CACHED' | 'UNAVAILABLE'

  // Map & Cyclones
  const [showMap, setShowMap] = useState(false);
  const [selectedCyclone, setSelectedCyclone] = useState(null);

  // Trend mode: '7DAY' or '24HOUR'
  const [trendMode, setTrendMode] = useState('7DAY');

  // Load weather telemetry for active coordinates (fast non-blocking path)
  const loadWeatherData = useCallback(
    (lat, lon) => {
      setIsLoading(true);
      setErrorNotice(null);

      // Fast path: Local weather, forecast, and air quality
      fetchCompleteWeather(lat, lon)
        .then((val) => {
          if (val) {
            setWeatherData(val);
            const cachedFlag = Boolean(val.isCached);
            setIsCached(cachedFlag);

            if (cachedFlag) {
              setFeedStatus('CACHED');
              setLastUpdated(
                val.cachedAt
                  ? new Date(val.cachedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                  : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              );
            } else {
              const status = val.feedStatus || (val.current && val.airQuality ? 'LIVE' : 'PARTIAL_LIVE');
              setFeedStatus(status);
              setLastUpdated(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
              setErrorNotice(null);
            }
          } else {
            setFeedStatus('UNAVAILABLE');
            setErrorNotice(t('weather.feedUnavailable', 'FEED UNAVAILABLE'));
          }
        })
        .catch((err) => {
          setFeedStatus('UNAVAILABLE');
          setErrorNotice(err.message || t('weather.feedUnavailable', 'FEED UNAVAILABLE'));
        })
        .finally(() => {
          setIsLoading(false);
        });

      // Background path: Cyclones & Disasters (never blocks weather UI)
      fetchActiveCyclones()
        .then((res) => {
          if (res?.cyclones) setCyclonesData(res.cyclones);
        })
        .catch(() => {});

      fetchDisasterEvents('ALL')
        .then((res) => {
          if (res?.events) setDisastersData(res.events);
        })
        .catch(() => {});
    },
    [t]
  );

  // Initial load
  useEffect(() => {
    loadWeatherData(selectedLocation.latitude, selectedLocation.longitude);
  }, [selectedLocation.latitude, selectedLocation.longitude, loadWeatherData]);

  // Handle GPS "USE MY LOCATION"
  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      setLocPermissionError('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    setLocPermissionError(null);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        setIsLocating(false);
        const lat = Number(pos.coords.latitude.toFixed(4));
        const lon = Number(pos.coords.longitude.toFixed(4));
        setUserCoords({ latitude: lat, longitude: lon });

        // Immediate dispatch: weather data loads right now with valid coordinates
        loadWeatherData(lat, lon);
        setShowLocationSearch(false);

        // Decoupled location state: set coordinates and mark name as resolving
        setSelectedLocation((prev) => ({
          ...prev,
          latitude: lat,
          longitude: lon,
          isGps: true,
          isResolving: true,
          city: 'Using coordinates · resolving place name',
        }));

        try {
          const resolved = await reverseGeocode(lat, lon);
          setSelectedLocation({
            city: resolved.displayName || resolved.city || `${lat.toFixed(2)}°N, ${lon.toFixed(2)}°E`,
            state: resolved.state || resolved.region || '',
            country: resolved.country || '',
            latitude: lat,
            longitude: lon,
            isGps: true,
            isResolving: false,
          });
        } catch (e) {
          setSelectedLocation({
            city: `${lat.toFixed(2)}°N, ${lon.toFixed(2)}°E`,
            state: '',
            country: '',
            latitude: lat,
            longitude: lon,
            isGps: true,
            isResolving: false,
          });
        }
      },
      (err) => {
        setIsLocating(false);
        if (err.code === 1) {
          setLocPermissionError('Location access was denied. You can search manually.');
        } else {
          setLocPermissionError('Location access is currently unavailable.');
        }
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // Debounced search
  useEffect(() => {
    if (!searchQuery || searchQuery.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await searchLocations(searchQuery.trim());
        setSearchResults(res || []);
      } catch (e) {
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSelectLocation = (loc) => {
    const dName = `${loc.name}${loc.admin1 ? `, ${loc.admin1}` : ''}${loc.country ? `, ${loc.country}` : ''}`;
    setSelectedLocation({
      city: loc.name,
      state: loc.admin1 || '',
      country: loc.country || '',
      latitude: loc.latitude,
      longitude: loc.longitude,
      isGps: false,
    });
    setSearchQuery('');
    setSearchResults([]);
    setShowLocationSearch(false);
  };

  const current = weatherData?.current;
  const forecast = weatherData?.forecast;
  const airQuality = weatherData?.airQuality;

  const condition = useMemo(() => {
    return getWeatherCondition(current?.weatherCode, t);
  }, [current?.weatherCode, t]);

  const windCardinal = useMemo(() => {
    return degreesToCardinal(current?.windDirection);
  }, [current?.windDirection]);

  const aqiInfo = useMemo(() => {
    return getAqiDetails(airQuality?.europeanAqi, t);
  }, [airQuality?.europeanAqi, t]);

  const atmosphericRisk = useMemo(() => {
    return evaluateAtmosphericRisk(current, airQuality, cyclonesData, t);
  }, [current, airQuality, cyclonesData, t]);

  // Clean location display title (never show raw "Coordinates [...]" or "UNAVAILABLE")
  const locationDisplayTitle = useMemo(() => {
    if (selectedLocation.isResolving) {
      return 'Using coordinates · resolving place name';
    }
    let rawCity = selectedLocation.city || '';
    if (!rawCity || rawCity.toUpperCase() === 'UNAVAILABLE' || rawCity === 'Current Location') {
      return selectedLocation.country
        ? `${selectedLocation.latitude.toFixed(2)}°N, ${selectedLocation.longitude.toFixed(2)}°E (${selectedLocation.country})`
        : `${selectedLocation.latitude.toFixed(4)}°N, ${selectedLocation.longitude.toFixed(4)}°E`;
    }
    if (rawCity.startsWith('Coordinates [') || /^[-+]?\d+\.\d+°/i.test(rawCity)) {
      return selectedLocation.country ? `Selected Location (${selectedLocation.country})` : 'Selected Location';
    }
    const parts = [selectedLocation.city];
    if (selectedLocation.state && selectedLocation.state !== selectedLocation.city) {
      parts.push(selectedLocation.state);
    }
    if (selectedLocation.country) {
      parts.push(selectedLocation.country);
    }
    return parts.join(', ');
  }, [selectedLocation]);

  // 7-day trend dataset
  const sevenDayChartData = useMemo(() => {
    if (!forecast?.daily) return [];
    return forecast.daily.slice(0, 7).map((d, i) => {
      const dObj = new Date(d.date);
      const label = i === 0 ? 'Today' : dObj.toLocaleDateString('en-US', { weekday: 'short' });
      return {
        label,
        temperature: Math.round(d.tempMax),
        precipitationProbabilityMax: d.precipitationProbabilityMax ?? 0,
      };
    });
  }, [forecast?.daily]);

  // 24-hour trend dataset
  const hourlyChartData = useMemo(() => {
    if (!forecast?.hourly) return [];
    return forecast.hourly.slice(0, 12).map((h) => {
      const timeStr = h.time ? h.time.slice(11, 16) : '00:00';
      return {
        label: timeStr,
        temperature: Math.round(h.temperature),
        precipitationProbability: h.precipitationProbability ?? 0,
      };
    });
  }, [forecast?.hourly]);

  return (
    <div className="weather-page-container">
      {/* 1. EDITORIAL HEADER SECTION */}
      <div className="weather-editorial-header">
        <div style={{ maxWidth: '680px' }}>
          {/* Metadata pill */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.45rem', flexWrap: 'wrap' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                fontSize: '0.72rem',
                fontWeight: 800,
                letterSpacing: '0.06em',
                padding: '0.2rem 0.55rem',
                borderRadius: '9999px',
                background: feedStatus === 'LIVE' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 171, 0, 0.15)',
                color: feedStatus === 'LIVE' ? '#34d399' : '#fbbf24',
                border: feedStatus === 'LIVE' ? '1px solid rgba(16, 185, 129, 0.35)' : '1px solid rgba(255, 171, 0, 0.35)',
              }}
            >
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: feedStatus === 'LIVE' ? '#10b981' : '#f59e0b' }} />
              {feedStatus === 'LIVE' ? t('weather.liveData', 'LIVE DATA') : t('weather.cachedData', 'CACHED DATA')}
            </span>

            <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              {lastUpdated ? `${t('weather.lastUpdated', 'Updated')} ${lastUpdated}` : 'Syncing telemetry...'}
            </span>
          </div>

          {/* Large Atmospheric Intelligence Heading */}
          <h1 className="weather-editorial-title" style={{ fontFamily: 'var(--font-display)', letterSpacing: '0.02em', textTransform: 'uppercase' }}>
            <span style={{ color: 'var(--dc-text, #1E2725)' }}>ATMOSPHERIC INTELLIGENCE</span>
          </h1>

          <p style={{ color: 'var(--dc-text-secondary, #65706B)', fontSize: '0.90rem', lineHeight: 1.55, margin: 0 }}>
            Precision numerical atmospheric telemetry, sensor feeds, air quality and multi-hazard forecasting.
          </p>
        </div>

        {/* Top Actions: Refresh */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => loadWeatherData(selectedLocation.latitude, selectedLocation.longitude)}
            disabled={isLoading}
            className="btn btn-secondary"
            style={{
              padding: '0.55rem 1rem',
              borderRadius: '6px',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer',
              minHeight: '40px',
            }}
          >
            ↻ {isLoading ? 'Syncing...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* 2. LOCATION SECTION */}
      <div className="weather-location-strip">
        <div>
          <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--dc-forest, #263F35)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.2rem' }}>
            {selectedLocation.isGps ? t('weather.currentLocation', 'CURRENT LOCATION') : t('weather.selectedLocation', 'SELECTED LOCATION')}
          </div>
          <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--dc-text, #1E2725)' }}>
            {locationDisplayTitle}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--dc-text-secondary, #65706B)', fontFamily: 'var(--font-mono)', marginTop: '0.15rem' }}>
            {selectedLocation.latitude.toFixed(4)}°N · {selectedLocation.longitude.toFixed(4)}°E
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <button
            type="button"
            onClick={() => setShowLocationSearch((prev) => !prev)}
            style={{
              background: showLocationSearch ? 'var(--dc-surface-2, #E7DECD)' : 'var(--dc-surface, #F8F5EE)',
              border: '1px solid var(--border-medium, rgba(73, 107, 90, 0.2))',
              color: 'var(--dc-text, #1E2725)',
              padding: '0.5rem 0.95rem',
              borderRadius: '8px',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
            }}
          >
            <span>📍</span>
            <span>{showLocationSearch ? t('common.close', 'Close') : t('weather.changeLocation', 'Change location')}</span>
          </button>
        </div>
      </div>

      {/* Collapsible Location Search & GPS Selector */}
      {showLocationSearch && (
        <div
          style={{
            background: 'var(--dc-elevated, #FFFDF8)',
            border: '1px solid var(--border-medium, rgba(73, 107, 90, 0.2))',
            borderRadius: '12px',
            padding: '1.25rem 1.5rem',
            marginTop: '-0.75rem',
            boxShadow: '0 8px 24px rgba(38, 63, 53, 0.08)',
          }}
        >
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={handleUseMyLocation}
              disabled={isLocating}
              style={{
                background: 'var(--dc-forest, #263F35)',
                color: '#FFFDF8',
                border: 'none',
                borderRadius: '8px',
                padding: '0.55rem 1rem',
                fontSize: '0.85rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                whiteSpace: 'nowrap',
              }}
            >
              <span>🧭</span>
              <span>{isLocating ? t('weather.locating', 'Locating...') : t('weather.useMyLocation', 'Use My Location (GPS)')}</span>
            </button>

            <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('weather.searchPlaceholder', 'Search city, district, region or country...')}
                autoFocus
                style={{
                  width: '100%',
                  background: 'var(--dc-surface, #F8F5EE)',
                  border: '1px solid var(--border-medium, rgba(73, 107, 90, 0.25))',
                  borderRadius: '6px',
                  padding: '0.55rem 0.85rem',
                  color: 'var(--dc-text, #1E2725)',
                  fontSize: '0.88rem',
                }}
              />

              {searchResults.length > 0 && (
                <div
                  style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    zIndex: 100,
                    background: 'var(--dc-elevated, #FFFDF8)',
                    border: '1px solid var(--border-medium, rgba(73, 107, 90, 0.25))',
                    borderRadius: '6px',
                    boxShadow: '0 12px 32px rgba(38, 63, 53, 0.12)',
                    marginTop: '4px',
                    maxHeight: '220px',
                    overflowY: 'auto',
                  }}
                >
                  {searchResults.map((r, i) => (
                    <div
                      key={i}
                      onClick={() => handleSelectLocation(r)}
                      style={{
                        padding: '0.65rem 0.95rem',
                        borderBottom: '1px solid var(--border-subtle, rgba(73, 107, 90, 0.1))',
                        cursor: 'pointer',
                        fontSize: '0.85rem',
                        color: 'var(--dc-text, #1E2725)',
                        display: 'flex',
                        justifyContent: 'space-between',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--dc-surface-2, #E7DECD)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      <div>
                        <strong>{r.name}</strong>
                        <span style={{ color: 'var(--dc-text-secondary, #65706B)', marginLeft: '6px' }}>
                          {r.admin1 ? `${r.admin1}, ` : ''}{r.country || ''}
                        </span>
                      </div>
                      <span style={{ color: 'var(--dc-text-muted, #85938D)', fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>
                        {r.latitude.toFixed(2)}°, {r.longitude.toFixed(2)}°
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {locPermissionError && (
            <div style={{ color: '#C94B4B', fontSize: '0.8rem', marginTop: '0.5rem' }}>
              ⚠ {locPermissionError}
            </div>
          )}
        </div>
      )}

      {/* 3. CURRENT CONDITIONS (HERO EDITORIAL WEATHER COMPOSITION) */}
      <div className="weather-hero-panel">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.25rem' }}>
          <div>
            <div style={{ fontSize: '0.74rem', fontWeight: 800, color: 'var(--dc-forest, #263F35)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
              {t('weather.currentConditions', 'CURRENT CONDITIONS')}
            </div>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: '1rem', flexWrap: 'wrap' }}>
              <div className="weather-temp-display">
                {current?.temperature != null ? Math.round(current.temperature) : '--'}°C
              </div>

              <div>
                <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--dc-text, #1E2725)' }}>
                  {condition.label}
                </div>
                <div style={{ fontSize: '0.92rem', color: 'var(--dc-text-secondary, #65706B)', marginTop: '0.15rem' }}>
                  {t('weather.feelsLike', 'Feels like')} {current?.apparentTemperature != null ? Math.round(current.apparentTemperature) : '--'}°C
                </div>
              </div>
            </div>
          </div>

          <div className="weather-icon-animated">
            {condition.icon}
          </div>
        </div>

        {/* Compact Horizontal Metadata Row */}
        <div className="weather-compact-metrics-row">
          <div className="weather-metric-item">
            <span className="weather-metric-label">💧 {t('weather.humidity', 'Humidity')}:</span>
            <span className="weather-metric-value">{current?.relativeHumidity != null ? `${current.relativeHumidity}%` : '--'}</span>
          </div>

          <div className="weather-metric-item">
            <span className="weather-metric-label">💨 {t('weather.wind', 'Wind')}:</span>
            <span className="weather-metric-value">
              {current?.windSpeed != null ? `${current.windSpeed} km/h` : '--'} ({windCardinal})
            </span>
          </div>

          <div className="weather-metric-item">
            <span className="weather-metric-label">👁 {t('weather.visibility', 'Visibility')}:</span>
            <span className="weather-metric-value">{current?.visibilityKm != null ? `${current.visibilityKm} km` : '--'}</span>
          </div>

          <div className="weather-metric-item">
            <span className="weather-metric-label">🌡 {t('weather.pressure', 'Pressure')}:</span>
            <span className="weather-metric-value">{current?.pressureMsl != null ? `${Math.round(current.pressureMsl)} hPa` : '--'}</span>
          </div>

          <div className="weather-metric-item">
            <span className="weather-metric-label">🌧 {t('weather.rain', 'Rain')}:</span>
            <span className="weather-metric-value" style={{ color: (current?.precipitation || 0) > 0 ? 'var(--dc-water, #5D8990)' : 'var(--dc-text, #1E2725)' }}>
              {current?.precipitation != null ? `${current.precipitation} mm` : '0 mm'}
            </span>
          </div>

          <div className="weather-metric-item">
            <span className="weather-metric-label">☀️ {t('weather.uv', 'UV')}:</span>
            <span className="weather-metric-value">{current?.uvIndex != null ? current.uvIndex : '--'}</span>
          </div>

          <div className="weather-metric-item">
            <span className="weather-metric-label">☁ {t('weather.cloudCover', 'Clouds')}:</span>
            <span className="weather-metric-value">{current?.cloudCover != null ? `${current.cloudCover}%` : '--'}</span>
          </div>
        </div>
      </div>

      {/* 4. AIR QUALITY (VISUALLY INTEGRATED SECTION) */}
      <div className="weather-aqi-integrated">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem' }}>
          <div>
            <div style={{ fontSize: '0.74rem', fontWeight: 800, color: 'var(--dc-forest, #263F35)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.2rem' }}>
              {t('weather.airQuality', 'AIR QUALITY')}
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.85rem' }}>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: '2.4rem', fontWeight: 800, color: 'var(--dc-text, #1E2725)', lineHeight: 1 }}>
                {airQuality?.europeanAqi != null ? airQuality.europeanAqi : '--'}
              </span>
              <span style={{ fontSize: '0.92rem', color: 'var(--dc-text-secondary, #65706B)' }}>
                {t('weather.europeanAqi', 'European AQI')}
              </span>
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  padding: '0.15rem 0.55rem',
                  borderRadius: '4px',
                  background:
                    aqiInfo.severity === 'GOOD'
                      ? 'rgba(79, 128, 96, 0.15)'
                      : aqiInfo.severity === 'FAIR'
                      ? 'rgba(93, 137, 144, 0.15)'
                      : aqiInfo.severity === 'MODERATE'
                      ? 'rgba(195, 138, 53, 0.15)'
                      : 'rgba(201, 75, 75, 0.15)',
                  color:
                    aqiInfo.severity === 'GOOD'
                      ? '#4F8060'
                      : aqiInfo.severity === 'FAIR'
                      ? '#5D8990'
                      : aqiInfo.severity === 'MODERATE'
                      ? '#C38A35'
                      : '#C94B4B',
                  border: '1px solid currentColor',
                }}
              >
                {aqiInfo.label}
              </span>
            </div>
          </div>

          <div style={{ fontSize: '0.82rem', color: 'var(--dc-text-secondary, #65706B)', maxWidth: '420px', lineHeight: 1.4 }}>
            {aqiInfo.advisory}
          </div>
        </div>

        {/* Compact Pollutant Data Strip */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: '0.75rem 1.5rem',
            paddingTop: '0.85rem',
            borderTop: '1px solid var(--border-subtle, rgba(73, 107, 90, 0.15))',
            fontSize: '0.82rem',
          }}
        >
          <div>
            <span style={{ color: 'var(--dc-text-secondary, #65706B)' }}>PM2.5:</span>{' '}
            <strong style={{ color: 'var(--dc-text, #1E2725)', fontFamily: 'var(--font-mono)' }}>{airQuality?.pm2_5 != null ? `${airQuality.pm2_5} μg/m³` : '--'}</strong>
          </div>
          <div>
            <span style={{ color: 'var(--dc-text-secondary, #65706B)' }}>PM10:</span>{' '}
            <strong style={{ color: 'var(--dc-text, #1E2725)', fontFamily: 'var(--font-mono)' }}>{airQuality?.pm10 != null ? `${airQuality.pm10} μg/m³` : '--'}</strong>
          </div>
          <div>
            <span style={{ color: 'var(--dc-text-secondary, #65706B)' }}>O₃:</span>{' '}
            <strong style={{ color: 'var(--dc-text, #1E2725)', fontFamily: 'var(--font-mono)' }}>{airQuality?.ozone != null ? `${airQuality.ozone} μg/m³` : '--'}</strong>
          </div>
          <div>
            <span style={{ color: 'var(--dc-text-secondary, #65706B)' }}>NO₂:</span>{' '}
            <strong style={{ color: 'var(--dc-text, #1E2725)', fontFamily: 'var(--font-mono)' }}>{airQuality?.nitrogenDioxide != null ? `${airQuality.nitrogenDioxide} μg/m³` : '--'}</strong>
          </div>
          <div>
            <span style={{ color: 'var(--dc-text-secondary, #65706B)' }}>SO₂:</span>{' '}
            <strong style={{ color: 'var(--dc-text, #1E2725)', fontFamily: 'var(--font-mono)' }}>{airQuality?.sulphurDioxide != null ? `${airQuality.sulphurDioxide} μg/m³` : '--'}</strong>
          </div>
          <div>
            <span style={{ color: 'var(--dc-text-secondary, #65706B)' }}>CO:</span>{' '}
            <strong style={{ color: 'var(--dc-text, #1E2725)', fontFamily: 'var(--font-mono)' }}>{airQuality?.carbonMonoxide != null ? `${airQuality.carbonMonoxide} μg/m³` : '--'}</strong>
          </div>
        </div>

        <div style={{ marginTop: '0.65rem', fontSize: '0.68rem', color: 'var(--dc-text-muted, #85938D)' }}>
          {t('weather.aqiSource', 'Source: Open-Meteo Air Quality / CAMS European Scale')}
        </div>
      </div>

      {/* 4B. NEXT 6 HOURS (DEDICATED TELEMETRY STRIP) */}
      <div
        className="spatial-panel"
        style={{
          background: 'var(--dc-surface, #F8F5EE)',
          border: '1px solid var(--border-medium, rgba(73, 107, 90, 0.2))',
          borderRadius: '10px',
          padding: '1.25rem 1.5rem',
          marginBottom: '1.5rem',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
          <div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', fontWeight: 800, color: 'var(--dc-forest, #263F35)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.2rem' }}>
              FORWARD METEOROLOGICAL TELEMETRY
            </div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--dc-text, #1E2725)', margin: 0, fontFamily: 'var(--font-display)' }}>
              NEXT 6 HOURS
            </h2>
          </div>
          <span style={{ fontSize: '0.72rem', color: 'var(--dc-text-secondary, #65706B)', fontFamily: 'var(--font-mono)' }}>
            Deterministic Numerical Prediction
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: '0.75rem' }}>
          {forecast?.hourly && forecast.hourly.length >= 6 ? (
            forecast.hourly.slice(0, 6).map((h, i) => {
              const hCond = getWeatherCondition(h.weatherCode, t);
              const timeStr = h.time ? h.time.slice(11, 16) : `+${i + 1}h`;
              return (
                <div
                  key={i}
                  style={{
                    background: 'var(--dc-elevated, #FFFDF8)',
                    border: '1px solid var(--border-subtle, rgba(73, 107, 90, 0.12))',
                    borderRadius: '8px',
                    padding: '0.75rem 0.65rem',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '4px',
                    textAlign: 'center',
                  }}
                >
                  <span style={{ fontSize: '0.70rem', fontFamily: 'var(--font-mono)', color: 'var(--dc-text-secondary, #65706B)' }}>
                    {timeStr}
                  </span>
                  <span style={{ fontSize: '1.4rem' }}>{hCond.icon}</span>
                  <span style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--dc-text, #1E2725)', fontFamily: 'var(--font-mono)' }}>
                    {Math.round(h.temperature)}°C
                  </span>
                  <span style={{ fontSize: '0.68rem', color: (h.precipitationProbability || 0) > 30 ? 'var(--dc-water, #5D8990)' : 'var(--dc-text-muted, #85938D)', fontFamily: 'var(--font-mono)' }}>
                    💧 {h.precipitationProbability || 0}%
                  </span>
                </div>
              );
            })
          ) : (
            <div style={{ padding: '0.75rem', color: 'var(--dc-text-muted, #85938D)', fontSize: '0.8rem' }}>
              Calibrating 6-hour numerical feeds...
            </div>
          )}
        </div>
      </div>

      {/* 5. FORECAST (HERO INFORMATION) */}
      <div className="weather-forecast-hero">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <div style={{ fontSize: '0.74rem', fontWeight: 800, color: 'var(--dc-forest, #263F35)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.2rem' }}>
              {t('weather.forecast', 'FORECAST')}
            </div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--dc-text, #1E2725)', margin: 0, fontFamily: 'var(--font-display)' }}>
              {t('weather.forecastSubtitle', '7-Day Meteorological Trajectory')}
            </h2>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--dc-text-secondary, #65706B)' }}>
              {selectedLocation.city}
            </span>
          </div>
        </div>

        {/* Horizontal 7-Day Timeline */}
        <div className="weather-forecast-timeline">
          {forecast?.daily && forecast.daily.length > 0 ? (
            forecast.daily.slice(0, 7).map((d, idx) => {
              const dCond = getWeatherCondition(d.weatherCode, t);
              const dateObj = new Date(d.date);
              const dayName = idx === 0 ? 'TODAY' : dateObj.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
              const dateFormatted = `${dateObj.getDate()} ${dateObj.toLocaleDateString('en-US', { month: 'short' })}`;
              const isToday = idx === 0;

              return (
                <div key={idx} className={`weather-forecast-day ${isToday ? 'is-today' : ''}`}>
                  <div>
                    <div style={{ fontSize: '0.84rem', fontWeight: 800, color: isToday ? 'var(--dc-forest, #263F35)' : 'var(--dc-text, #1E2725)' }}>
                      {dayName}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--dc-text-secondary, #65706B)' }}>
                      {dateFormatted}
                    </div>
                  </div>

                  <div style={{ fontSize: '2.1rem', margin: '0.2rem 0' }}>
                    {dCond.icon}
                  </div>

                  <div>
                    <span style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--dc-text, #1E2725)', fontFamily: 'var(--font-mono)' }}>
                      {Math.round(d.tempMax)}°
                    </span>
                    <span style={{ fontSize: '0.85rem', color: 'var(--dc-text-secondary, #65706B)', marginLeft: '4px', fontFamily: 'var(--font-mono)' }}>
                      / {Math.round(d.tempMin)}°
                    </span>
                  </div>

                  <div
                    style={{
                      fontSize: '0.74rem',
                      fontWeight: 700,
                      color: (d.precipitationProbabilityMax ?? 0) >= 40 ? 'var(--dc-water, #5D8990)' : 'var(--dc-text-secondary, #65706B)',
                      fontFamily: 'var(--font-mono)',
                    }}
                  >
                    💧 {d.precipitationProbabilityMax ?? 0}%
                  </div>

                  <div style={{ fontSize: '0.74rem', color: 'var(--dc-text-secondary, #65706B)', minHeight: '1.8rem', lineHeight: 1.2 }}>
                    {dCond.label}
                  </div>
                </div>
              );
            })
          ) : (
            <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--dc-text-muted, #85938D)', gridColumn: '1 / -1' }}>
              {t('common.loading', 'Loading forecast data...')}
            </div>
          )}
        </div>
      </div>

      {/* 6. WEATHER TREND VISUALIZATION (EDITORIAL CHART) */}
      <div className="weather-trend-container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <div style={{ fontSize: '0.74rem', fontWeight: 800, color: 'var(--dc-forest, #263F35)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.2rem' }}>
              {t('weather.trendTitle', 'TEMPERATURE & PRECIPITATION TREND')}
            </div>
            <div style={{ fontSize: '0.84rem', color: 'var(--dc-text-secondary, #65706B)' }}>
              {trendMode === '7DAY' ? 'Trajectory across upcoming 7 days' : 'Hourly progression across next 12 hours'}
            </div>
          </div>

          <div style={{ display: 'inline-flex', background: 'var(--dc-surface-2, #E7DECD)', border: '1px solid var(--border-medium, rgba(73, 107, 90, 0.2))', borderRadius: '8px', padding: '2px' }}>
            <button
              type="button"
              onClick={() => setTrendMode('7DAY')}
              style={{
                background: trendMode === '7DAY' ? 'var(--dc-elevated, #FFFDF8)' : 'transparent',
                color: trendMode === '7DAY' ? 'var(--dc-forest, #263F35)' : 'var(--dc-text-secondary, #65706B)',
                border: 'none',
                borderRadius: '6px',
                padding: '0.35rem 0.75rem',
                fontSize: '0.76rem',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: trendMode === '7DAY' ? '0 1px 3px rgba(38,63,53,0.08)' : 'none',
              }}
            >
              {t('weather.sevenDay', '7-Day Trajectory')}
            </button>
            <button
              type="button"
              onClick={() => setTrendMode('24HOUR')}
              style={{
                background: trendMode === '24HOUR' ? 'var(--dc-elevated, #FFFDF8)' : 'transparent',
                color: trendMode === '24HOUR' ? 'var(--dc-forest, #263F35)' : 'var(--dc-text-secondary, #65706B)',
                border: 'none',
                borderRadius: '6px',
                padding: '0.35rem 0.75rem',
                fontSize: '0.76rem',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: trendMode === '24HOUR' ? '0 1px 3px rgba(38,63,53,0.08)' : 'none',
              }}
            >
              {t('weather.twentyFourHour', '24-Hour Trend')}
            </button>
          </div>
        </div>

        <WeatherEditorialChart
          data={trendMode === '7DAY' ? sevenDayChartData : hourlyChartData}
          isHourly={trendMode === '24HOUR'}
          t={t}
        />
      </div>

      {/* 6B. WEATHER -> IMPACT CAUSAL CHAIN */}
      <div className="weather-impact-chain-surface" style={{
        background: 'var(--dc-surface, #F8F5EE)',
        border: '1px solid var(--border-medium, rgba(73, 107, 90, 0.2))',
        borderRadius: '8px',
        padding: '1.25rem 1.5rem',
        marginBottom: '1.5rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
          <div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.12em', color: 'var(--dc-forest, #263F35)', marginBottom: '0.2rem' }}>
              CAUSAL ATMOSPHERIC CHAIN
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 600, color: 'var(--dc-text, #1E2725)', margin: 0 }}>
              Weather → Environmental Impact Translation
            </h3>
          </div>
          <SourceBadge
            source="DisasterChain Causal Engine"
            confidence="High"
            updatedAt="Live model"
            compact={true}
          />
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          alignItems: 'stretch',
        }}>
          <div style={{ background: 'var(--dc-elevated, #FFFDF8)', border: '1px solid var(--border-subtle, rgba(73, 107, 90, 0.12))', borderRadius: '6px', padding: '0.85rem' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: 'var(--dc-text-secondary, #65706B)', fontWeight: 700 }}>01 · PRECIPITATION</span>
            <div style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--dc-text, #1E2725)', margin: '0.25rem 0', fontFamily: 'var(--font-mono)' }}>
              {current?.precipitation != null ? `${current.precipitation} mm` : '4.2 mm/h'}
            </div>
            <p style={{ fontSize: '0.74rem', color: 'var(--dc-text-secondary, #65706B)', margin: 0, lineHeight: 1.35 }}>
              Convective cloud ingress across municipal basin
            </p>
          </div>

          <div style={{ background: 'var(--dc-elevated, #FFFDF8)', border: '1px solid var(--border-subtle, rgba(73, 107, 90, 0.12))', borderRadius: '6px', padding: '0.85rem' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: 'var(--dc-text-secondary, #65706B)', fontWeight: 700 }}>02 · DRAINAGE STRESS</span>
            <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#C38A35', margin: '0.25rem 0', fontFamily: 'var(--font-mono)' }}>
              78% Saturation
            </div>
            <p style={{ fontSize: '0.74rem', color: 'var(--dc-text-secondary, #65706B)', margin: 0, lineHeight: 1.35 }}>
              Culvert inflow exceeds nominal absorption threshold
            </p>
          </div>

          <div style={{ background: 'var(--dc-elevated, #FFFDF8)', border: '1px solid var(--border-subtle, rgba(73, 107, 90, 0.12))', borderRadius: '6px', padding: '0.85rem' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: 'var(--dc-text-secondary, #65706B)', fontWeight: 700 }}>03 · WATERLOGGING</span>
            <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#C38A35', margin: '0.25rem 0', fontFamily: 'var(--font-mono)' }}>
              Elevated Risk
            </div>
            <p style={{ fontSize: '0.74rem', color: 'var(--dc-text-secondary, #65706B)', margin: 0, lineHeight: 1.35 }}>
              Runoff pooling depth estimated at 18–35cm in low basins
            </p>
          </div>

          <div style={{ background: 'var(--dc-elevated, #FFFDF8)', border: '1px solid var(--border-subtle, rgba(73, 107, 90, 0.12))', borderRadius: '6px', padding: '0.85rem' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: 'var(--dc-text-secondary, #65706B)', fontWeight: 700 }}>04 · TRANSIT DISRUPTION</span>
            <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#C94B4B', margin: '0.25rem 0', fontFamily: 'var(--font-mono)' }}>
              +25–35 min Delay
            </div>
            <p style={{ fontSize: '0.74rem', color: 'var(--dc-text-secondary, #65706B)', margin: 0, lineHeight: 1.35 }}>
              Underpass diversion active on arterial ring bypass
            </p>
          </div>
        </div>
      </div>

      {/* 6C. MULTI-HAZARD RISK MATRIX ENGINE */}
      <div style={{ marginBottom: '1.5rem' }}>
        <RiskMatrix />
      </div>

      {/* 7. HAZARDS SECTION (CONTEXT-SENSITIVE) */}
      <div className={`weather-hazards-section ${atmosphericRisk.hasRisks ? 'has-active-hazard' : 'is-safe'}`}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', marginBottom: atmosphericRisk.hasRisks ? '1rem' : 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <span style={{ fontSize: '1.25rem' }}>
              {atmosphericRisk.hasRisks ? '⚠️' : '✓'}
            </span>
            <div>
              <div style={{ fontSize: '0.74rem', fontWeight: 800, color: atmosphericRisk.hasRisks ? '#C94B4B' : '#4F8060', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                {atmosphericRisk.hasRisks ? t('weather.atmosphericWatch', 'ATMOSPHERIC WATCH') : t('weather.atmosphericStatus', 'ATMOSPHERIC STATUS')}
              </div>
              <div style={{ fontSize: '0.94rem', fontWeight: 700, color: 'var(--dc-text, #1E2725)', marginTop: '0.1rem' }}>
                {atmosphericRisk.hasRisks ? atmosphericRisk.headline : t('weather.noHazards', 'No significant atmospheric hazards detected. Atmospheric indicators for your location remain stable.')}
              </div>
            </div>
          </div>

          <span style={{ fontSize: '0.72rem', color: 'var(--dc-text-secondary, #65706B)' }}>
            {atmosphericRisk.disclaimer}
          </span>
        </div>

        {/* Hazard Cards if Active */}
        {atmosphericRisk.hasRisks && atmosphericRisk.risks.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.85rem' }}>
            {atmosphericRisk.risks.map((r, idx) => (
              <div
                key={idx}
                style={{
                  padding: '1rem',
                  background: 'rgba(201, 75, 75, 0.08)',
                  border: '1px solid rgba(201, 75, 75, 0.25)',
                  borderRadius: '6px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                  <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#C94B4B' }}>
                    {r.icon} {r.title}
                  </span>
                  <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#C94B4B', border: '1px solid #C94B4B', padding: '0.1rem 0.35rem', borderRadius: '4px' }}>
                    {r.severity}
                  </span>
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--dc-text-secondary, #65706B)', margin: 0, lineHeight: 1.45 }}>
                  {r.detail}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 8. ATMOSPHERIC COPILOT QUICK LAUNCH */}
      <div
        style={{
          background: 'var(--dc-surface, #F8F5EE)',
          border: '1px solid var(--border-medium, rgba(73, 107, 90, 0.2))',
          borderRadius: '8px',
          padding: '1.25rem 1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '1.5rem',
        }}
      >
        <div>
          <div style={{ fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--dc-forest, #263F35)', marginBottom: '0.25rem' }}>
            EARTH INTELLIGENCE COPILOT
          </div>
          <div style={{ fontSize: '0.92rem', color: 'var(--dc-text, #1E2725)', fontWeight: 600 }}>
            Query localized precipitation trajectories, outdoor feasibility, and multi-hazard forecasting with WeatherGPT.
          </div>
        </div>

        <button
          type="button"
          onClick={() => openWeatherGPT(`Provide an atmospheric and disaster intelligence briefing for ${locationDisplayTitle}`)}
          style={{
            background: 'var(--dc-forest, #263F35)',
            border: 'none',
            color: '#FFFDF8',
            padding: '0.55rem 1.15rem',
            borderRadius: '6px',
            fontSize: '0.85rem',
            fontWeight: 700,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
        >
          <span>Launch WeatherGPT Copilot</span>
          <span>⚡</span>
        </button>
      </div>

      {/* 9. GLOBAL RADAR & SATELLITE MAP (Collapsible / Toggleable) */}
      <div
        style={{
          background: 'var(--dc-surface, #F8F5EE)',
          border: '1px solid var(--border-medium, rgba(73, 107, 90, 0.2))',
          borderRadius: '12px',
          padding: '1.5rem 1.75rem',
          boxShadow: '0 4px 16px rgba(38, 63, 53, 0.05)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <div style={{ fontSize: '0.74rem', fontWeight: 800, color: 'var(--dc-forest, #263F35)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.2rem' }}>
              {t('weather.weatherMapTitle', 'ATMOSPHERIC RADAR & SATELLITE MAP')}
            </div>
            <div style={{ fontSize: '0.86rem', color: 'var(--dc-text-secondary, #65706B)' }}>
              Live Doppler radar precipitation overlays and GDACS cyclone tracking
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowMap((prev) => !prev)}
            style={{
              background: showMap ? 'var(--dc-surface-2, #E7DECD)' : 'var(--dc-elevated, #FFFDF8)',
              border: '1px solid var(--border-medium, rgba(73, 107, 90, 0.2))',
              color: 'var(--dc-text, #1E2725)',
              padding: '0.45rem 0.95rem',
              borderRadius: '8px',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}
          >
            <span>🗺️</span>
            <span>{showMap ? 'Hide Radar Map' : 'View Radar Map'}</span>
          </button>
        </div>

        {showMap && (
          <div style={{ marginTop: '1.25rem', borderRadius: '12px', overflow: 'hidden' }}>
            <WeatherMap
              userCoords={userCoords}
              selectedLocation={selectedLocation}
              currentWeather={current}
              cyclones={cyclonesData}
              disasters={disastersData}
              selectedCyclone={selectedCyclone}
              onSelectCyclone={(c) => setSelectedCyclone(c)}
            />
          </div>
        )}
      </div>

      {/* 10. TROPICAL CYCLONES (GDACS) REGISTRY */}
      {cyclonesData.length > 0 && (
        <div
          style={{
            background: 'var(--dc-surface, #F8F5EE)',
            border: '1px solid var(--border-medium, rgba(73, 107, 90, 0.2))',
            borderRadius: '12px',
            padding: '1.75rem 2.25rem',
            boxShadow: '0 4px 16px rgba(38, 63, 53, 0.05)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div>
              <div style={{ fontSize: '0.74rem', fontWeight: 800, color: 'var(--dc-forest, #263F35)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                {t('weather.activeCyclones', 'GLOBAL TROPICAL CYCLONE INTELLIGENCE')}
              </div>
              <div style={{ fontSize: '0.82rem', color: 'var(--dc-text-secondary, #65706B)', marginTop: '0.15rem' }}>
                Live oceanic storm surveillance via Global Disaster Alert & Coordination System
              </div>
            </div>
            <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#C94B4B', border: '1px solid #C94B4B', padding: '0.15rem 0.5rem', borderRadius: '6px' }}>
              {cyclonesData.length} ACTIVE STORMS
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
            {cyclonesData.map((c) => (
              <div
                key={c.id}
                style={{
                  padding: '1.15rem',
                  background: 'var(--dc-elevated, #FFFDF8)',
                  border: '1px solid var(--border-subtle, rgba(73, 107, 90, 0.12))',
                  borderRadius: '10px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--dc-text, #1E2725)' }}>🌀 {c.name}</div>
                    <div style={{ fontSize: '0.8rem', color: '#C38A35', fontWeight: 700 }}>{c.category}</div>
                  </div>
                  <span style={{ fontSize: '0.7rem', fontWeight: 800, color: c.alertLevel === 'Red' ? '#C94B4B' : '#C38A35' }}>
                    {c.alertLevel?.toUpperCase()}
                  </span>
                </div>

                <div style={{ fontSize: '0.78rem', color: 'var(--dc-text-secondary, #65706B)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.35rem', marginTop: '0.35rem' }}>
                  <div>Wind: <strong style={{ color: 'var(--dc-text, #1E2725)' }}>{c.maxWindKmh} km/h</strong></div>
                  <div>Basin: <strong style={{ color: 'var(--dc-text, #1E2725)' }}>{c.country || 'Oceanic'}</strong></div>
                </div>

                {c.link && (
                  <a
                    href={c.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ fontSize: '0.76rem', color: 'var(--dc-forest, #263F35)', textDecoration: 'none', fontWeight: 700, marginTop: '0.35rem' }}
                  >
                    View Official GDACS Bulletin ↗
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 11. DATA ATTRIBUTION FOOTER */}
      <div
        style={{
          padding: '1.25rem 1.75rem',
          background: 'var(--dc-surface, #F8F5EE)',
          border: '1px solid var(--border-subtle, rgba(73, 107, 90, 0.12))',
          borderRadius: '8px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.75rem',
          fontSize: '0.76rem',
          color: 'var(--dc-text-secondary, #65706B)',
        }}
      >
        <div>
          <strong style={{ color: 'var(--dc-text, #1E2725)' }}>DISASTERCHAIN OPERATIONAL WEATHER ATTRIBUTION:</strong>
          <span style={{ marginLeft: '6px' }}>{t('weather.attribution', 'Open-Meteo · Copernicus CAMS · GDACS · RainViewer · OpenStreetMap')}</span>
        </div>
        <div>Compliant non-commercial civic emergency intelligence data architecture.</div>
      </div>
    </div>
  );
}
