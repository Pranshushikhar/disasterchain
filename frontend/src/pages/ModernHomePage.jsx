import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  PlusCircle,
  LifeBuoy,
  ArrowUpRight,
  ShieldCheck,
  AlertTriangle,
  Clock,
  Compass,
  MapPin,
  CloudRain,
  Shield,
  CheckCircle2,
  Wind,
  Droplets,
  Bell,
} from 'lucide-react';
import {
  fetchShelters,
  fetchAlerts,
  fetchIncidents,
} from '../services/api';
import { fetchCompleteWeather, reverseGeocode } from '../services/weatherApi';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

// Minimalist Map Pin generator
const createPinIcon = (color, label = '') =>
  L.divIcon({
    className: 'dc-custom-pin',
    html: `<div style="
      width: 14px;
      height: 14px;
      background-color: ${color};
      border: 2px solid #FFFDF8;
      border-radius: 50%;
      box-shadow: 0 2px 6px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
    ">
      <div style="width: 4px; height: 4px; background: #FFFDF8; border-radius: 50%;"></div>
    </div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  });

export default function ModernHomePage({ refreshKey, onOpenSos, onOpenIncident }) {
  const navigate = useNavigate();

  // Location & Greeting
  const [coords, setCoords] = useState({ lat: 28.6139, lon: 77.209 }); // Delhi default
  const [locationName, setLocationName] = useState('Delhi NCR, India');
  const [greeting, setGreeting] = useState('Good day');
  const [lastUpdated, setLastUpdated] = useState(null);

  // Operational data
  const [weather, setWeather] = useState({
    temp: 28,
    condition: 'Partly Cloudy',
    feelsLike: 30,
    humidity: 55,
    windSpeed: 12,
    rainProb: 20,
    riskLevel: 'NORMAL',
    riskSummary: 'Atmospheric conditions are stable. No severe convective storms detected.',
  });

  const [alerts, setAlerts] = useState([]);
  const [shelters, setShelters] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Time-based greeting
  useEffect(() => {
    const hr = new Date().getHours();
    if (hr >= 4 && hr < 12) setGreeting('Good morning');
    else if (hr >= 12 && hr < 17) setGreeting('Good afternoon');
    else if (hr >= 17 && hr < 22) setGreeting('Good evening');
    else setGreeting('Good night');
  }, []);

  // Geolocation & Reverse Geocoding
  useEffect(() => {
    if (typeof navigator !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const lat = Number(pos.coords.latitude.toFixed(4));
          const lon = Number(pos.coords.longitude.toFixed(4));
          setCoords({ lat, lon });
          try {
            const geo = await reverseGeocode(lat, lon);
            if (geo?.city) {
              setLocationName(
                `${geo.city}${geo.state ? `, ${geo.state}` : ''}${geo.country ? `, ${geo.country}` : ''}`
              );
            }
          } catch (e) {
            console.warn('Geocoding error:', e);
          }
        },
        () => {},
        { timeout: 7000, maximumAge: 600000 }
      );
    }
  }, []);

  // Fetch real weather, alerts, shelters, and incidents
  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      try {
        const [weatherData, alertsRes, shelterRes, incidentRes] = await Promise.allSettled([
          fetchCompleteWeather(coords.lat, coords.lon),
          fetchAlerts(),
          fetchShelters(),
          fetchIncidents(),
        ]);

        if (!isMounted) return;

        // Process Weather
        if (weatherData.status === 'fulfilled' && weatherData.value) {
          const wd = weatherData.value;
          const cur = wd.current || {};
          const rainP = wd.hourly?.precipitation_probability?.[0] ?? cur.precipitation_probability ?? 0;
          const isHigh = rainP > 60 || (cur.rain || 0) > 10;
          const isModerate = rainP >= 35 || (cur.wind_speed_10m || 0) > 25;

          setWeather({
            temp: Math.round(cur.temperature_2m ?? 28),
            condition: wd.conditionText || cur.weather_code_text || (isHigh ? 'Rain Showers' : 'Partly Cloudy'),
            feelsLike: Math.round(cur.apparent_temperature ?? cur.temperature_2m ?? 30),
            humidity: Math.round(cur.relative_humidity_2m ?? 55),
            windSpeed: Math.round(cur.wind_speed_10m ?? 12),
            rainProb: rainP,
            riskLevel: isHigh ? 'HIGH' : (isModerate ? 'MODERATE' : 'NORMAL'),
            riskSummary: isHigh
              ? 'Elevated precipitation probability detected. Low-lying urban sectors may experience water accumulation.'
              : (isModerate
                ? 'Moderate atmospheric instability. Expect gusty breezes and localized cloud buildup.'
                : 'Local atmospheric readings are currently calm and within standard thresholds.'),
          });
        }

        // Process Alerts
        if (alertsRes.status === 'fulfilled' && Array.isArray(alertsRes.value)) {
          setAlerts(alertsRes.value.filter((a) => a && a.status !== 'resolved'));
        }

        // Process Shelters
        if (shelterRes.status === 'fulfilled' && Array.isArray(shelterRes.value)) {
          setShelters(shelterRes.value);
        }

        // Process Incidents
        if (incidentRes.status === 'fulfilled' && Array.isArray(incidentRes.value)) {
          setIncidents(incidentRes.value);
        }

        setLastUpdated(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      } catch (err) {
        console.warn('Dashboard data load error:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadData();
    return () => {
      isMounted = false;
    };
  }, [coords, refreshKey]);

  // Compute smart, actionable recommendations based on real data
  const nextActions = useMemo(() => {
    const actions = [];

    if (weather.riskLevel === 'HIGH' || weather.rainProb >= 60) {
      actions.push({
        id: 'rain-prep',
        title: 'Review Transit Corridors',
        text: `Precipitation probability is elevated (${weather.rainProb}%). Check underpasses and arterial drainage routes.`,
        priority: 'high',
        icon: CloudRain,
      });
    }

    if (alerts.length > 0) {
      actions.push({
        id: 'alert-check',
        title: 'Inspect Active Warning Bulletins',
        text: `${alerts.length} official regional emergency bulletins active. Follow emergency responder guidelines.`,
        priority: 'critical',
        icon: Bell,
      });
    }

    if (incidents.length > 0) {
      actions.push({
        id: 'incidents-nearby',
        title: 'Field Reports Active',
        text: `${incidents.length} verified citizen field disruptions logged. Avoid obstructed corridors.`,
        priority: 'medium',
        icon: AlertTriangle,
      });
    }

    // Baseline readiness recommendations
    actions.push({
      id: 'shelter-ready',
      title: 'Locate Nearest Safe Haven',
      text: `${shelters.length} community relief facilities indexed in your regional network.`,
      priority: 'normal',
      icon: MapPin,
    });

    actions.push({
      id: 'go-bag',
      title: 'Verify Emergency Supplies',
      text: 'Confirm 3 liters drinking water per person and essential prescriptions in your waterproof go-bag.',
      priority: 'normal',
      icon: ShieldCheck,
    });

    return actions.slice(0, 3);
  }, [weather, alerts, incidents, shelters]);

  return (
    <motion.div
      className="dc-home-container"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="dc-home-content">
        {/* Editorial Greeting Header */}
        <header className="dc-home-header" id="dc-home-header">
          <div className="dc-home-header-meta">
            <span className="dc-hero-subtitle">
              {greeting}, {locationName}
            </span>
            {lastUpdated && (
              <span className="dc-freshness-tag">
                <Clock size={12} />
                <span>Updated {lastUpdated}</span>
              </span>
            )}
          </div>
          <h1 className="dc-home-editorial-title">DisasterChain</h1>
        </header>

        {/* Active Emergency Alert Banner if official alerts exist */}
        {alerts.length > 0 && (
          <section className="dc-active-alert-strip" role="alert">
            <div className="dc-alert-strip-icon">
              <AlertTriangle size={18} />
            </div>
            <div className="dc-alert-strip-text">
              <strong>{alerts[0].title || 'Emergency Advisory'}: </strong>
              <span>{alerts[0].description || alerts[0].message || 'Active bulletin in this sector.'}</span>
            </div>
            <button
              onClick={() => navigate('/map')}
              className="dc-alert-strip-btn"
            >
              <span>View Map</span>
              <ArrowUpRight size={13} />
            </button>
          </section>
        )}

        {/* =====================================================================
            1. WHAT'S HAPPENING (Live Atmospheric & Hazard Overview)
            ===================================================================== */}
        <section className="dc-whats-happening-card">
          <div className="dc-happening-top">
            <span className="dc-section-label">WHAT'S HAPPENING</span>
            <div className="dc-live-status-pill">
              <span className="dc-pulse-dot" />
              <span>Live Conditions</span>
            </div>
          </div>

          <div className="dc-happening-primary">
            <div className="dc-happening-weather">
              <span className="dc-happening-temp">{weather.temp}°</span>
              <div className="dc-happening-weather-meta">
                <span className="dc-happening-condition">{weather.condition}</span>
                <span className="dc-happening-feels">Feels like {weather.feelsLike}°</span>
              </div>
            </div>

            <div className="dc-happening-risk-col">
              <span className="dc-risk-caption">Perimeter Risk</span>
              <span
                className={`dc-risk-badge ${
                  weather.riskLevel === 'HIGH' ? 'high' : (weather.riskLevel === 'MODERATE' ? 'moderate' : 'safe')
                }`}
              >
                {weather.riskLevel}
              </span>
            </div>
          </div>

          <p className="dc-happening-explanation">
            &ldquo;{weather.riskSummary}&rdquo;
          </p>

          {/* Environmental Telemetry Strip */}
          <div className="dc-telemetry-micro-strip">
            <div className="dc-telemetry-item">
              <Droplets size={14} className="dc-telemetry-icon" />
              <span>Rain Prob: <strong>{weather.rainProb}%</strong></span>
            </div>
            <div className="dc-telemetry-item">
              <Wind size={14} className="dc-telemetry-icon" />
              <span>Wind: <strong>{weather.windSpeed} km/h</strong></span>
            </div>
            <div className="dc-telemetry-item">
              <ShieldCheck size={14} className="dc-telemetry-icon" />
              <span>Humidity: <strong>{weather.humidity}%</strong></span>
            </div>
          </div>

          <div className="dc-happening-footer">
            <span className="dc-happening-intel">
              {weather.rainProb >= 40 ? `Rain possible today (${weather.rainProb}%)` : 'Dry conditions prevailing'} · {incidents.length} verified reports · {shelters.length} relief shelters
            </span>
            <button
              onClick={() => navigate('/weather')}
              className="dc-text-link"
              title="View full atmospheric weather telemetry"
            >
              <span>View Weather</span>
              <ArrowUpRight size={14} />
            </button>
          </div>
        </section>

        {/* =====================================================================
            2. WHAT SHOULD I DO NEXT? (Dynamic, Grounded Preparedness Guidance)
            ===================================================================== */}
        <section className="dc-home-section">
          <div className="dc-section-header-row">
            <h2 className="dc-section-title">What Should I Do Next?</h2>
            <button
              onClick={() => navigate('/safety')}
              className="dc-text-link"
            >
              <span>Safety Checklist</span>
              <ArrowUpRight size={14} />
            </button>
          </div>

          <div className="dc-recommendations-list">
            {nextActions.map((act) => {
              const ActionIcon = act.icon;
              return (
                <div key={act.id} className={`dc-recommendation-card ${act.priority}`}>
                  <div className="dc-recommendation-icon-wrap">
                    <ActionIcon size={18} />
                  </div>
                  <div className="dc-recommendation-content">
                    <h4 className="dc-recommendation-title">{act.title}</h4>
                    <p className="dc-recommendation-text">{act.text}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* =====================================================================
            3. NEAR YOU (Spatial Map Overview With Real Markers)
            ===================================================================== */}
        <section className="dc-home-section">
          <div className="dc-section-header-row">
            <h2 className="dc-section-title">Near You</h2>
            <button
              onClick={() => navigate('/map')}
              className="dc-text-link"
            >
              <span>Open Map</span>
              <ArrowUpRight size={14} />
            </button>
          </div>

          <div
            className="dc-map-preview-wrap"
            onClick={() => navigate('/map')}
            role="button"
            tabIndex={0}
            title="Open Interactive Map"
          >
            <MapContainer
              center={[coords.lat, coords.lon]}
              zoom={12}
              zoomControl={false}
              dragging={false}
              touchZoom={false}
              doubleClickZoom={false}
              scrollWheelZoom={false}
              style={{ width: '100%', height: '210px' }}
            >
              <TileLayer
                attribution="&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a>"
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {/* User Station Pin */}
              <Marker
                position={[coords.lat, coords.lon]}
                icon={createPinIcon('#263F35')}
              />

              {/* Real Shelters Pins if available */}
              {shelters.slice(0, 4).map((s, idx) => {
                const sLat = s.location?.coordinates?.[1] || s.latitude;
                const sLon = s.location?.coordinates?.[0] || s.longitude;
                if (!sLat || !sLon) return null;
                return (
                  <Marker
                    key={s._id || `s-${idx}`}
                    position={[sLat, sLon]}
                    icon={createPinIcon('#496B5A')}
                  />
                );
              })}

              {/* Real Incidents Pins if available */}
              {incidents.slice(0, 4).map((inc, idx) => {
                const iLat = inc.location?.coordinates?.[1] || inc.latitude;
                const iLon = inc.location?.coordinates?.[0] || inc.longitude;
                if (!iLat || !iLon) return null;
                return (
                  <Marker
                    key={inc._id || `i-${idx}`}
                    position={[iLat, iLon]}
                    icon={createPinIcon('#B86F52')}
                  />
                );
              })}
            </MapContainer>
          </div>
        </section>

        {/* =====================================================================
            4. QUICK ACCESS OPERATIONS HUB
            ===================================================================== */}
        <section className="dc-home-section">
          <div className="dc-two-actions-grid">
            <button
              id="dc-quick-report"
              onClick={() => {
                if (onOpenIncident) onOpenIncident();
                else navigate('/incidents');
              }}
              className="dc-action-card-primary"
            >
              <PlusCircle size={20} />
              <div className="dc-action-text-col">
                <span className="dc-action-title">Report Incident</span>
                <span className="dc-action-sub">
                  Waterlogging, road obstructions, or power cuts
                </span>
              </div>
            </button>

            <button
              id="dc-quick-help"
              onClick={() => navigate('/shelters')}
              className="dc-action-card-secondary"
            >
              <LifeBuoy size={20} />
              <div className="dc-action-text-col">
                <span className="dc-action-title">Find Relief Shelter</span>
                <span className="dc-action-sub">
                  Verified beds, potable water, and emergency medical kits
                </span>
              </div>
            </button>
          </div>
        </section>

        {/* Quick Nav Chips */}
        <section className="dc-home-quick-strip">
          <button onClick={() => navigate('/weather')} className="dc-hub-pill">
            <CloudRain size={14} />
            <span>Weather Telemetry</span>
          </button>
          <button onClick={() => navigate('/map')} className="dc-hub-pill">
            <MapPin size={14} />
            <span>Interactive Map</span>
          </button>
          <button onClick={() => navigate('/safety')} className="dc-hub-pill">
            <Shield size={14} />
            <span>Perimeter Safety</span>
          </button>
          <button onClick={() => navigate('/guides')} className="dc-hub-pill">
            <Compass size={14} />
            <span>Preparedness Guides</span>
          </button>
        </section>
      </div>
    </motion.div>
  );
}
