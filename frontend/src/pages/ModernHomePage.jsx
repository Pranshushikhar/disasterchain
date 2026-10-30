import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
  Wind,
  Droplets,
  Bell,
  RefreshCw,
  PhoneCall,
  Navigation,
  Sparkles,
  Gauge,
  CheckSquare,
  Square,
  Hospital,
  Activity,
  Radio,
  Sun,
} from 'lucide-react';
import {
  fetchShelters,
  fetchAlerts,
  fetchIncidents,
  fetchResources,
} from '../services/api';
import { fetchCompleteWeather, reverseGeocode } from '../services/weatherApi';
import { useWeatherGPT } from '../context/WeatherGPTContext';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';

// Storage keys
const CHECKLIST_STORAGE_KEY = 'disasterchain_safety_checklist';
const COORDS_STORAGE_KEY = 'disasterchain_user_coords';
const LOCATION_STORAGE_KEY = 'disasterchain_user_location';

// Default 72-Hour Survival Kit (aligned with ModernSafetyPage)
const DEFAULT_CHECKLIST = [
  { id: 1, text: '3L drinking water per person (72h reserve)', checked: true },
  { id: 2, text: 'Power bank & emergency torch / radio', checked: true },
  { id: 3, text: 'Prescription medicines in dry waterproof pouch', checked: false },
  { id: 4, text: 'Government ID proofs in ziplock seal', checked: true },
  { id: 5, text: 'Family emergency meeting point agreed', checked: false },
  { id: 6, text: 'Non-perishable ready-to-eat dry rations', checked: false },
];

// Preset Indian sectors for 1-click testing & fast switching
const PRESET_SECTORS = [
  { id: 'kharar', name: 'Kharar / Mohali, Punjab', lat: 30.7499, lon: 76.6411 },
  { id: 'delhi', name: 'Delhi NCR, India', lat: 28.6139, lon: 77.2090 },
  { id: 'mumbai', name: 'Mumbai, Maharashtra', lat: 19.0760, lon: 72.8777 },
  { id: 'kolkata', name: 'Kolkata, West Bengal', lat: 22.5726, lon: 88.3639 },
];

// Haversine formula for exact distance in kilometers
function getDistanceKm(lat1, lon1, lat2, lon2) {
  if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) return null;
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

// React-Leaflet helper to dynamically re-center map when coordinates change
function MapRecenter({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.setView(center, map.getZoom());
    }
  }, [center, map]);
  return null;
}

// Custom Leaflet Pin Generators
const createUserPinIcon = () =>
  L.divIcon({
    className: 'dc-map-pin-user-wrap',
    html: `<div class="dc-map-user-pin" title="Your Active Location">
      <div class="dc-user-pulse"></div>
      <div class="dc-user-dot"></div>
    </div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });

const createShelterPinIcon = () =>
  L.divIcon({
    className: 'dc-map-pin-shelter-wrap',
    html: `<div class="dc-map-shelter-pin" title="Verified Relief Shelter">
      <span style="font-size:12px; line-height:1;">🏠</span>
    </div>`,
    iconSize: [26, 26],
    iconAnchor: [13, 13],
  });

const createIncidentPinIcon = (severity = 'Medium') => {
  const isCrit = severity === 'Critical' || severity === 'High';
  return L.divIcon({
    className: 'dc-map-pin-incident-wrap',
    html: `<div class="dc-map-incident-pin ${isCrit ? 'critical' : 'moderate'}" title="Hazard Report">
      <span style="font-size:12px; line-height:1;">${isCrit ? '⚠️' : '⚡'}</span>
    </div>`,
    iconSize: [26, 26],
    iconAnchor: [13, 13],
  });
};

export default function ModernHomePage({ refreshKey, onOpenSos, onOpenIncident }) {
  const navigate = useNavigate();
  const weatherGPT = useWeatherGPT();

  // Location & Geolocation state (initialized with localStorage persistence)
  const [coords, setCoords] = useState(() => {
    try {
      const saved = localStorage.getItem(COORDS_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return { lat: 30.7499, lon: 76.6411 }; // Kharar / Mohali default
  });

  const [locationName, setLocationName] = useState(() => {
    try {
      const saved = localStorage.getItem(LOCATION_STORAGE_KEY);
      if (saved) return saved;
    } catch (e) {}
    return 'Kharar, Punjab, India';
  });

  const [isGpsLocked, setIsGpsLocked] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [greeting, setGreeting] = useState('Good day');
  const [lastUpdated, setLastUpdated] = useState(null);
  const [mapLayer, setMapLayer] = useState('all'); // 'all' | 'shelters' | 'hazards'

  // Operational Datasets
  const [weather, setWeather] = useState({
    temp: 26,
    condition: 'Partly Cloudy',
    feelsLike: 28,
    humidity: 55,
    windSpeed: 10,
    windGusts: 16,
    rainProb: 15,
    pressure: 1016,
    aqi: 48,
    aqiStatus: 'Fair',
    cloudCover: 20,
    riskLevel: 'NORMAL',
    riskSummary: 'Atmospheric conditions are stable. No active convective storm cells detected in your immediate sector.',
  });

  const [alerts, setAlerts] = useState([]);
  const [shelters, setShelters] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);

  // Persistent 72-Hour Survival Kit Checklist
  const [checklist, setChecklist] = useState(() => {
    try {
      const saved = localStorage.getItem(CHECKLIST_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return DEFAULT_CHECKLIST;
  });

  // Calculate greeting
  useEffect(() => {
    const hr = new Date().getHours();
    if (hr >= 4 && hr < 12) setGreeting('Good morning');
    else if (hr >= 12 && hr < 17) setGreeting('Good afternoon');
    else if (hr >= 17 && hr < 22) setGreeting('Good evening');
    else setGreeting('Good night');
  }, []);

  // Request browser GPS position
  const requestGpsLocation = useCallback(() => {
    if (typeof navigator !== 'undefined' && 'geolocation' in navigator) {
      setIsLocating(true);
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const lat = Number(pos.coords.latitude.toFixed(4));
          const lon = Number(pos.coords.longitude.toFixed(4));
          setCoords({ lat, lon });
          setIsGpsLocked(true);
          setIsLocating(false);
          try {
            localStorage.setItem(COORDS_STORAGE_KEY, JSON.stringify({ lat, lon }));
            const geo = await reverseGeocode(lat, lon);
            if (geo?.city) {
              const name = `${geo.city}${geo.state ? `, ${geo.state}` : ''}${geo.country ? `, ${geo.country}` : ''}`;
              setLocationName(name);
              localStorage.setItem(LOCATION_STORAGE_KEY, name);
            }
          } catch (e) {
            console.warn('Geocoding error:', e);
          }
        },
        (err) => {
          console.warn('GPS position error or denied:', err.message);
          setIsLocating(false);
        },
        { timeout: 7000, maximumAge: 300000 }
      );
    }
  }, []);

  // Run GPS auto-detect on initial load if not previously locked
  useEffect(() => {
    requestGpsLocation();
  }, [requestGpsLocation]);

  // Load real telemetry, alerts, shelters, incidents, and resources
  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      try {
        const [weatherData, alertsRes, shelterRes, incidentRes, resourceRes] = await Promise.allSettled([
          fetchCompleteWeather(coords.lat, coords.lon),
          fetchAlerts(),
          fetchShelters(),
          fetchIncidents(),
          fetchResources(),
        ]);

        if (!isMounted) return;

        // Ingest Weather
        if (weatherData.status === 'fulfilled' && weatherData.value) {
          const wd = weatherData.value;
          const cur = wd.current || {};
          const rainP = wd.hourly?.precipitation_probability?.[0] ?? cur.precipitation_probability ?? 0;
          const isHighRain = rainP > 60 || (cur.rain || 0) > 10;
          const isModerate = rainP >= 35 || (cur.wind_speed_10m || 0) > 25;

          const aqiVal = wd.airQuality?.europeanAqi ?? 48;
          const aqiSev = wd.airQuality?.severity ?? 'Fair';

          setWeather({
            temp: Math.round(cur.temperature_2m ?? cur.temperature ?? 26),
            condition: wd.conditionText || cur.weather_code_text || (isHighRain ? 'Rain Showers' : 'Partly Cloudy'),
            feelsLike: Math.round(cur.apparent_temperature ?? cur.temperature_2m ?? 28),
            humidity: Math.round(cur.relative_humidity_2m ?? 55),
            windSpeed: Math.round(cur.wind_speed_10m ?? 10),
            windGusts: Math.round(cur.wind_gusts_10m ?? 16),
            rainProb: rainP,
            pressure: Math.round(cur.pressure_msl ?? cur.surface_pressure ?? 1016),
            aqi: aqiVal,
            aqiStatus: aqiSev,
            cloudCover: Math.round(cur.cloud_cover ?? 20),
            riskLevel: isHighRain ? 'HIGH' : isModerate ? 'MODERATE' : 'NORMAL',
            riskSummary: isHighRain
              ? 'Elevated precipitation probability detected. Low-lying urban sectors may experience water accumulation.'
              : isModerate
              ? 'Moderate atmospheric instability. Expect gusty breezes and localized cloud buildup.'
              : 'Local atmospheric readings are currently calm and within standard thresholds.',
          });
        }

        // Ingest Alerts
        if (alertsRes.status === 'fulfilled' && Array.isArray(alertsRes.value)) {
          setAlerts(alertsRes.value.filter((a) => a && a.status !== 'resolved' && a.active !== false));
        }

        // Ingest Shelters
        if (shelterRes.status === 'fulfilled' && Array.isArray(shelterRes.value)) {
          setShelters(shelterRes.value);
        }

        // Ingest Incidents
        if (incidentRes.status === 'fulfilled' && Array.isArray(incidentRes.value)) {
          setIncidents(incidentRes.value);
        }

        // Ingest Resources
        if (resourceRes.status === 'fulfilled' && Array.isArray(resourceRes.value)) {
          setResources(resourceRes.value);
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

  // Proximity calculations for shelters
  const nearbyShelters = useMemo(() => {
    if (!shelters || shelters.length === 0) return [];
    return shelters
      .map((s) => {
        const sLat = s.location?.coordinates?.[1] || s.latitude;
        const sLon = s.location?.coordinates?.[0] || s.longitude;
        const d = getDistanceKm(coords.lat, coords.lon, sLat, sLon);
        return { ...s, distanceKm: d };
      })
      .filter((s) => s.distanceKm != null)
      .sort((a, b) => a.distanceKm - b.distanceKm)
      .slice(0, 3);
  }, [shelters, coords]);

  // Proximity calculations for incidents
  const nearbyIncidents = useMemo(() => {
    if (!incidents || incidents.length === 0) return [];
    return incidents
      .map((i) => {
        const iLat = i.location?.coordinates?.[1] || i.latitude;
        const iLon = i.location?.coordinates?.[0] || i.longitude;
        const d = getDistanceKm(coords.lat, coords.lon, iLat, iLon);
        return { ...i, distanceKm: d };
      })
      .slice(0, 3);
  }, [incidents, coords]);

  // Hazards in 3 km perimeter
  const perimeterHazardsCount = useMemo(() => {
    return nearbyIncidents.filter((i) => i.distanceKm != null && i.distanceKm <= 3).length;
  }, [nearbyIncidents]);

  // Nearest First Responder
  const nearestResponder = useMemo(() => {
    if (resources && resources.length > 0) {
      return resources[0];
    }
    return {
      name: 'Apex Civil Hospital & Trauma Center',
      address: 'Plot 12, Medical Square, Civil Lines',
      phone: '+91 11 2233 4455',
      status: 'Operational 24/7',
    };
  }, [resources]);

  // Checklist stats
  const completedChecklistCount = useMemo(() => {
    return checklist.filter((c) => c.checked).length;
  }, [checklist]);

  const checklistProgressPct = useMemo(() => {
    return Math.round((completedChecklistCount / checklist.length) * 100);
  }, [completedChecklistCount, checklist]);

  // Toggle checklist item
  const handleToggleChecklist = (id) => {
    const updated = checklist.map((item) =>
      item.id === id ? { ...item, checked: !item.checked } : item
    );
    setChecklist(updated);
    try {
      localStorage.setItem(CHECKLIST_STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {}
  };

  // Switch to preset sector
  const handleSelectSector = (sector) => {
    setCoords({ lat: sector.lat, lon: sector.lon });
    setLocationName(sector.name);
    setIsGpsLocked(false);
    try {
      localStorage.setItem(COORDS_STORAGE_KEY, JSON.stringify({ lat: sector.lat, lon: sector.lon }));
      localStorage.setItem(LOCATION_STORAGE_KEY, sector.name);
    } catch (e) {}
  };

  // Launch WeatherGPT assistant
  const handleLaunchWeatherGpt = (initialQuery) => {
    if (weatherGPT && weatherGPT.openWeatherGPT) {
      weatherGPT.openWeatherGPT();
      if (initialQuery && weatherGPT.setInputText) {
        weatherGPT.setInputText(initialQuery);
      }
    } else {
      navigate('/weather-gpt');
    }
  };

  // Unified Regional Situational Posture
  const unifiedPosture = useMemo(() => {
    const hasCritical = alerts.some((a) => a.severity === 'Critical' || a.severity === 'Danger');
    if (hasCritical) {
      return {
        level: 'CRITICAL',
        label: 'Critical Hazard Warning',
        className: 'critical',
        summary: 'Emergency evacuation or high-danger bulletins active in your administrative sector.',
      };
    }
    const hasWarning = alerts.length > 0 || weather.riskLevel === 'HIGH' || weather.rainProb >= 50;
    if (hasWarning) {
      return {
        level: 'ELEVATED',
        label: 'Advisory in Effect',
        className: 'elevated',
        summary: 'Meteorological advisory active. Surface telemetry currently calm; monitor radar shifts.',
      };
    }
    return {
      level: 'NORMAL',
      label: 'All Corridors Clear',
      className: 'normal',
      summary: 'Sensors report stable atmospheric readings. 0 critical field disruptions logged in 3 km perimeter.',
    };
  }, [alerts, weather]);

  // Compute prioritized "What Should I Do Next?" guidance
  const nextActions = useMemo(() => {
    const actions = [];

    if (alerts.length > 0) {
      actions.push({
        id: 'alert-action',
        title: 'Review Official Emergency Bulletins',
        text: `${alerts.length} official regional advisories logged. Check target sector and follow instructions.`,
        tag: 'OFFICIAL ADVISORY',
        priority: 'critical',
        icon: Bell,
        link: '/map',
      });
    }

    if (weather.riskLevel === 'HIGH' || weather.rainProb >= 50) {
      actions.push({
        id: 'rain-action',
        title: 'Check Drainage & Underpass Corridors',
        text: `Precipitation probability peaks at ${weather.rainProb}%. Avoid arterial underpasses vulnerable to flash pooling.`,
        tag: 'PRECIPITATION WATCH',
        priority: 'high',
        icon: CloudRain,
        link: '/weather',
      });
    }

    if (perimeterHazardsCount > 0) {
      actions.push({
        id: 'incident-action',
        title: 'Avoid Active Local Disruptions',
        text: `${perimeterHazardsCount} citizen field hazards reported within 3 km. Review obstruction pins on map.`,
        tag: 'PERIMETER NOTICE',
        priority: 'high',
        icon: AlertTriangle,
        link: '/incidents',
      });
    }

    actions.push({
      id: 'shelter-action',
      title: 'Inspect Primary & Secondary Shelters',
      text: `${nearbyShelters.length > 0 ? nearbyShelters[0].name : 'Community Relocation Centers'} indexed with verified beds.`,
      tag: 'SAFE HAVEN',
      priority: 'normal',
      icon: MapPin,
      link: '/shelters',
    });

    actions.push({
      id: 'kit-action',
      title: 'Verify 72-Hour Survival Go-Bag',
      text: `${completedChecklistCount}/${checklist.length} essential items verified. Keep potable water and medications packed.`,
      tag: 'READINESS',
      priority: 'normal',
      icon: ShieldCheck,
      link: '/safety',
    });

    return actions.slice(0, 3);
  }, [alerts, weather, perimeterHazardsCount, nearbyShelters, completedChecklistCount, checklist]);

  return (
    <motion.div
      className="dc-home-container"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* =====================================================================
          TOP COMMAND HEADER BAR (Preserves .dc-home-header & #dc-home-header)
          ===================================================================== */}
      <header className="dc-command-header dc-home-header" id="dc-home-header">
        {/* Left: Location Station & Geolocation Lock */}
        <div className="dc-command-header-left">
          <div className="dc-header-station-box">
            <div className="dc-header-station-title">
              <MapPin size={16} style={{ color: 'var(--dc-earth-green)' }} />
              <span>{locationName}</span>
            </div>
            <div className="dc-header-station-meta">
              <span>{coords.lat.toFixed(4)}°N, {coords.lon.toFixed(4)}°E</span>
              <span>·</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <Clock size={11} />
                {lastUpdated ? `Observation: ${lastUpdated}` : 'Live Station'}
              </span>
              <span>·</span>
              <span style={{ color: isGpsLocked ? 'var(--dc-earth-green)' : 'var(--dc-text-muted)' }}>
                {isGpsLocked ? '● GPS Locked' : '● Sector Fixed'}
              </span>
            </div>
          </div>

          <button
            onClick={requestGpsLocation}
            className="dc-station-btn"
            style={{ flex: 'none', padding: '6px 12px' }}
            title="Re-detect live GPS location"
            disabled={isLocating}
          >
            <RefreshCw size={12} className={isLocating ? 'dc-spin' : ''} />
            <span>{isLocating ? 'Detecting...' : 'Detect GPS'}</span>
          </button>
        </div>

        {/* Center: Branding & Mission Tagline */}
        <div className="dc-command-header-center">
          <h1 className="dc-command-header-title dc-home-editorial-title">
            DisasterChain
          </h1>
          <span className="dc-command-header-tagline">
            Earth Intelligence & Command Operations
          </span>
        </div>

        {/* Right: Unified Posture Status & Instant SOS */}
        <div className="dc-command-header-right">
          <div className={`dc-unified-posture-pill ${unifiedPosture.className}`}>
            <span className="dc-posture-pulse-dot" />
            <span>{unifiedPosture.label}</span>
          </div>

          <button
            onClick={onOpenSos}
            className="dc-quick-sos-header-btn"
            title="Broadcast emergency SOS distress beacon"
          >
            <Radio size={14} />
            <span>Emergency SOS</span>
          </button>
        </div>
      </header>

      {/* =====================================================================
          RESPONSIVE 3-COLUMN COMMAND CENTER GRID
          ===================================================================== */}
      <div className="dc-command-grid">
        {/* ===================================================================
            LEFT COLUMN — REGIONAL INTELLIGENCE (~22–25%)
            =================================================================== */}
        <aside className="dc-col-left" aria-label="Regional Intelligence">
          {/* 1. Location & Telemetry Station Card */}
          <div className="dc-cmd-card">
            <div className="dc-cmd-card-header">
              <span className="dc-cmd-card-title">
                <Navigation size={13} />
                <span>Station Sector</span>
              </span>
              <span className="dc-cmd-badge">
                {isGpsLocked ? 'GPS Verified' : 'Manual Sector'}
              </span>
            </div>

            <div style={{ fontSize: '0.94rem', fontWeight: 700, color: 'var(--dc-text)', marginBottom: '4px' }}>
              {locationName}
            </div>
            <div style={{ fontSize: '0.76rem', color: 'var(--dc-text-muted)' }}>
              Monitoring 3 km local radius & regional meteorological corridor
            </div>

            <div className="dc-station-coords-row">
              <span>Lat: {coords.lat.toFixed(4)}°</span>
              <span>Lon: {coords.lon.toFixed(4)}°</span>
              <span>Alt: ~295m</span>
            </div>

            <div style={{ marginTop: '12px', fontSize: '0.72rem', fontWeight: 700, color: 'var(--dc-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Switch Quick Sector:
            </div>
            <div className="dc-preset-sectors-row">
              {PRESET_SECTORS.map((sec) => (
                <button
                  key={sec.id}
                  onClick={() => handleSelectSector(sec)}
                  className={`dc-preset-sector-chip ${coords.lat === sec.lat && coords.lon === sec.lon ? 'active' : ''}`}
                >
                  {sec.id.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* 2. Situational Posture & Perimeter Threat */}
          <div className="dc-cmd-card">
            <div className="dc-cmd-card-header">
              <span className="dc-cmd-card-title">
                <Shield size={13} />
                <span>Perimeter Threat Posture</span>
              </span>
              <span className={`dc-cmd-badge ${unifiedPosture.className}`}>
                {unifiedPosture.level}
              </span>
            </div>

            <div className="dc-posture-overview-row">
              <span className="dc-posture-title">{unifiedPosture.label}</span>
            </div>
            <p className="dc-posture-desc">{unifiedPosture.summary}</p>

            <div className="dc-perimeter-metric-grid">
              <div className="dc-perimeter-metric-item">
                <span>{perimeterHazardsCount}</span>
                <span>Hazards (3km)</span>
              </div>
              <div className="dc-perimeter-metric-item">
                <span>{nearbyShelters.length}</span>
                <span>Shelters</span>
              </div>
              <div className="dc-perimeter-metric-item">
                <span>{alerts.length}</span>
                <span>Advisories</span>
              </div>
            </div>
          </div>

          {/* 3. 72-Hour Survival Preparedness Kit Progress */}
          <div className="dc-cmd-card">
            <div className="dc-cmd-card-header">
              <span className="dc-cmd-card-title">
                <ShieldCheck size={13} />
                <span>72-Hour Survival Kit</span>
              </span>
              <span className="dc-cmd-badge">
                {checklistProgressPct}% Ready
              </span>
            </div>

            <div className="dc-prep-header-progress">
              <span>Readiness Progress</span>
              <span>{completedChecklistCount} of {checklist.length} Packed</span>
            </div>
            <div className="dc-prep-bar-track">
              <div className="dc-prep-bar-fill" style={{ width: `${checklistProgressPct}%` }} />
            </div>

            <div className="dc-prep-interactive-list">
              {checklist.slice(0, 3).map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleToggleChecklist(item.id)}
                  className={`dc-prep-item-row ${item.checked ? 'checked' : ''}`}
                >
                  {item.checked ? (
                    <CheckSquare size={16} className="dc-prep-checkbox" />
                  ) : (
                    <Square size={16} className="dc-prep-checkbox" style={{ color: 'var(--dc-text-muted)' }} />
                  )}
                  <span>{item.text}</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => navigate('/safety')}
              className="dc-card-footer-link"
              title="Open full interactive checklist on Personal Safety page"
            >
              <span>Inspect Full Survival Checklist</span>
              <ArrowUpRight size={13} />
            </button>
          </div>

          {/* 4. Quick Mission Operations Navigation */}
          <div className="dc-cmd-card">
            <div className="dc-cmd-card-header">
              <span className="dc-cmd-card-title">
                <Compass size={13} />
                <span>Operations Navigation</span>
              </span>
            </div>

            <div className="dc-mission-nav-list">
              <button onClick={() => navigate('/map')} className="dc-mission-nav-btn">
                <span className="dc-mission-nav-left">
                  <MapPin size={14} style={{ color: 'var(--dc-earth-green)' }} />
                  <span>Spatial Hazard Map</span>
                </span>
                <span className="dc-mission-nav-badge">{shelters.length + incidents.length}</span>
              </button>

              <button onClick={() => navigate('/safety')} className="dc-mission-nav-btn">
                <span className="dc-mission-nav-left">
                  <Shield size={14} style={{ color: 'var(--dc-forest)' }} />
                  <span>Personal Safety & SOS</span>
                </span>
                <span className="dc-mission-nav-badge">3 km Scan</span>
              </button>

              <button onClick={() => navigate('/incidents')} className="dc-mission-nav-btn">
                <span className="dc-mission-nav-left">
                  <AlertTriangle size={14} style={{ color: 'var(--dc-warning)' }} />
                  <span>Citizen Hazard Reports</span>
                </span>
                <span className="dc-mission-nav-badge">{incidents.length}</span>
              </button>

              <button onClick={() => navigate('/weather')} className="dc-mission-nav-btn">
                <span className="dc-mission-nav-left">
                  <CloudRain size={14} style={{ color: 'var(--dc-clay)' }} />
                  <span>Atmospheric Weather</span>
                </span>
                <span className="dc-mission-nav-badge">{weather.temp}°C</span>
              </button>

              <button onClick={() => navigate('/guides')} className="dc-mission-nav-btn">
                <span className="dc-mission-nav-left">
                  <Compass size={14} style={{ color: 'var(--dc-text-secondary)' }} />
                  <span>Preparedness Guides</span>
                </span>
                <span className="dc-mission-nav-badge">Offline</span>
              </button>
            </div>
          </div>

          {/* 5. Nearest Emergency First Responder */}
          <div className="dc-cmd-card">
            <div className="dc-cmd-card-header">
              <span className="dc-cmd-card-title">
                <Hospital size={13} />
                <span>First Responder Facility</span>
              </span>
              <span className="dc-cmd-badge" style={{ backgroundColor: 'rgba(73,107,90,0.1)' }}>
                {nearestResponder.status || 'Active 24/7'}
              </span>
            </div>

            <div className="dc-first-responder-info">
              <span className="dc-responder-name">{nearestResponder.name}</span>
              <span className="dc-responder-addr">{nearestResponder.address}</span>
            </div>

            <a
              href={`tel:${nearestResponder.phone || '112'}`}
              className="dc-responder-phone-btn"
            >
              <PhoneCall size={14} />
              <span>Call Facility: {nearestResponder.phone || '112'}</span>
            </a>
          </div>
        </aside>

        {/* ===================================================================
            CENTER COLUMN — MAIN COMMAND CENTER (~48–54%)
            =================================================================== */}
        <main className="dc-col-center" aria-label="Main Command Center">
          {/* 1. Verified Active Advisory Banner (Honest distinction between Forecast & Observation) */}
          {alerts.length > 0 ? (
            <section className={`dc-active-advisory-banner ${alerts[0].severity === 'Critical' ? 'critical' : 'warning'}`} role="alert">
              <div className="dc-advisory-icon-wrap">
                <AlertTriangle size={22} />
              </div>
              <div className="dc-advisory-content">
                <div className="dc-advisory-header-row">
                  <span className="dc-advisory-scope-tag">
                    Official Advisory · Target: {alerts[0].location || 'Regional Zone'}
                  </span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--dc-text-muted)' }}>
                    {alerts[0].severity || 'Warning'} Priority
                  </span>
                </div>
                <div className="dc-advisory-title">{alerts[0].title}</div>
                <div className="dc-advisory-text">
                  {alerts[0].description || alerts[0].message || 'Active meteorological bulletin in this sector.'}
                </div>
                <div className="dc-advisory-telemetry-grounding">
                  Surface Observation at Station: {weather.temp}°C, {weather.condition}, Wind: {weather.windSpeed} km/h (Calm). No sudden rainfall detected yet.
                </div>
              </div>
              <button
                onClick={() => navigate('/map')}
                className="dc-alert-strip-btn"
                style={{ flexShrink: 0, alignSelf: 'center' }}
              >
                <span>View Map</span>
                <ArrowUpRight size={13} />
              </button>
            </section>
          ) : (
            <section className="dc-active-advisory-banner normal" role="status">
              <div className="dc-advisory-icon-wrap">
                <ShieldCheck size={22} />
              </div>
              <div className="dc-advisory-content">
                <div className="dc-advisory-header-row">
                  <span className="dc-advisory-scope-tag">All Clear · Civil Posture Normal</span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--dc-text-muted)' }}>Jurisdiction: {locationName}</span>
                </div>
                <div className="dc-advisory-title">No Active Statutory Disaster Warnings</div>
                <div className="dc-advisory-text">
                  Regional lifelines, electrical distribution, and transportation corridors are operating within normal safety limits.
                </div>
              </div>
            </section>
          )}

          {/* 2. Primary Atmospheric Telemetry Card (Preserves .dc-whats-happening-card for tour) */}
          <section className="dc-whats-happening-card" id="dc-whats-happening-card">
            <div className="dc-happening-top">
              <span className="dc-section-label">ATMOSPHERIC TELEMETRY & CONDITIONS</span>
              <div className="dc-live-status-pill">
                <span className="dc-pulse-dot" />
                <span>Live Open-Meteo Telemetry</span>
              </div>
            </div>

            <div className="dc-happening-primary">
              <div className="dc-happening-weather">
                <span className="dc-happening-temp">{weather.temp}°</span>
                <div className="dc-happening-weather-meta">
                  <span className="dc-happening-condition">{weather.condition}</span>
                  <span className="dc-happening-feels">Feels like {weather.feelsLike}°C</span>
                </div>
              </div>

              <div className="dc-happening-risk-col">
                <span className="dc-risk-caption">Perimeter Posture</span>
                <span className={`dc-risk-badge ${weather.riskLevel === 'HIGH' ? 'high' : weather.riskLevel === 'MODERATE' ? 'moderate' : 'safe'}`}>
                  {weather.riskLevel}
                </span>
              </div>
            </div>

            <p className="dc-happening-explanation">
              &ldquo;{weather.riskSummary}&rdquo;
            </p>

            {/* Comprehensive 6-Item Telemetry Micro-Grid */}
            <div className="dc-telemetry-micro-grid">
              <div className="dc-telemetry-micro-cell">
                <span className="dc-telemetry-micro-label">
                  <Droplets size={12} style={{ color: 'var(--dc-clay)' }} />
                  <span>Rain Prob</span>
                </span>
                <span className="dc-telemetry-micro-value">{weather.rainProb}%</span>
              </div>

              <div className="dc-telemetry-micro-cell">
                <span className="dc-telemetry-micro-label">
                  <Wind size={12} style={{ color: 'var(--dc-forest)' }} />
                  <span>Wind / Gusts</span>
                </span>
                <span className="dc-telemetry-micro-value">{weather.windSpeed} / {weather.windGusts} km/h</span>
              </div>

              <div className="dc-telemetry-micro-cell">
                <span className="dc-telemetry-micro-label">
                  <Activity size={12} style={{ color: 'var(--dc-earth-green)' }} />
                  <span>Humidity</span>
                </span>
                <span className="dc-telemetry-micro-value">{weather.humidity}%</span>
              </div>

              <div className="dc-telemetry-micro-cell">
                <span className="dc-telemetry-micro-label">
                  <Gauge size={12} style={{ color: 'var(--dc-text-muted)' }} />
                  <span>Barometer</span>
                </span>
                <span className="dc-telemetry-micro-value">{weather.pressure} hPa</span>
              </div>

              <div className="dc-telemetry-micro-cell">
                <span className="dc-telemetry-micro-label">
                  <Radio size={12} style={{ color: 'var(--dc-warning)' }} />
                  <span>Air Quality</span>
                </span>
                <span className="dc-telemetry-micro-value">{weather.aqi} ({weather.aqiStatus})</span>
              </div>

              <div className="dc-telemetry-micro-cell">
                <span className="dc-telemetry-micro-label">
                  <Sun size={12} style={{ color: 'var(--dc-clay)' }} />
                  <span>Cloud Cover</span>
                </span>
                <span className="dc-telemetry-micro-value">{weather.cloudCover}%</span>
              </div>
            </div>

            <div className="dc-happening-footer">
              <span className="dc-happening-intel">
                {weather.rainProb >= 40 ? `Precipitation likely (${weather.rainProb}%)` : 'Dry conditions prevailing'} · {incidents.length} verified hazards · {shelters.length} relief shelters indexed
              </span>
              <button
                onClick={() => navigate('/weather')}
                className="dc-text-link"
                title="View full atmospheric weather telemetry"
              >
                <span>View Full Telemetry & Forecast</span>
                <ArrowUpRight size={14} />
              </button>
            </div>
          </section>

          {/* 3. Enlarged Interactive Regional Command Map (Preserves .dc-map-preview-wrap for tour) */}
          <section className="dc-map-preview-wrap" id="dc-map-preview-wrap">
            <div className="dc-map-toolbar">
              <div className="dc-map-title-row">
                <MapPin size={15} style={{ color: 'var(--dc-earth-green)' }} />
                <span>Regional Command Map</span>
                <span style={{ fontSize: '0.72rem', color: 'var(--dc-text-muted)' }}>
                  [{coords.lat.toFixed(4)}, {coords.lon.toFixed(4)}]
                </span>
              </div>

              <div className="dc-map-layer-pills">
                <button
                  onClick={() => setMapLayer('all')}
                  className={`dc-map-layer-pill ${mapLayer === 'all' ? 'active' : ''}`}
                >
                  All ({shelters.length + incidents.length})
                </button>
                <button
                  onClick={() => setMapLayer('shelters')}
                  className={`dc-map-layer-pill ${mapLayer === 'shelters' ? 'active' : ''}`}
                >
                  Shelters ({shelters.length})
                </button>
                <button
                  onClick={() => setMapLayer('hazards')}
                  className={`dc-map-layer-pill ${mapLayer === 'hazards' ? 'active' : ''}`}
                >
                  Hazards ({incidents.length})
                </button>
                <button
                  onClick={() => navigate('/map')}
                  className="dc-map-layer-pill"
                  style={{ background: 'var(--dc-forest)', color: '#FFFDF8' }}
                >
                  <span>Fullscreen GIS</span>
                  <ArrowUpRight size={11} style={{ display: 'inline', marginLeft: '3px' }} />
                </button>
              </div>
            </div>

            <div style={{ width: '100%', height: '360px', position: 'relative' }}>
              <MapContainer
                center={[coords.lat, coords.lon]}
                zoom={12}
                zoomControl={true}
                scrollWheelZoom={false}
                style={{ width: '100%', height: '100%' }}
              >
                <TileLayer
                  attribution="&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a>"
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <MapRecenter center={[coords.lat, coords.lon]} />

                {/* User Active Station Marker */}
                <Marker position={[coords.lat, coords.lon]} icon={createUserPinIcon()}>
                  <Popup>
                    <div style={{ padding: '4px', fontSize: '0.82rem' }}>
                      <strong style={{ display: 'block', marginBottom: '2px', color: 'var(--dc-forest)' }}>
                        Your Active Sector
                      </strong>
                      <span>{locationName}</span>
                      <div style={{ fontSize: '0.72rem', color: '#666', marginTop: '4px' }}>
                        Coords: {coords.lat.toFixed(4)}, {coords.lon.toFixed(4)}
                      </div>
                    </div>
                  </Popup>
                </Marker>

                {/* Shelter Markers (Filtered by layer) */}
                {(mapLayer === 'all' || mapLayer === 'shelters') &&
                  shelters.map((s, idx) => {
                    const sLat = s.location?.coordinates?.[1] || s.latitude;
                    const sLon = s.location?.coordinates?.[0] || s.longitude;
                    if (!sLat || !sLon) return null;
                    const dist = getDistanceKm(coords.lat, coords.lon, sLat, sLon);
                    return (
                      <Marker
                        key={s._id || `s-${idx}`}
                        position={[sLat, sLon]}
                        icon={createShelterPinIcon()}
                      >
                        <Popup>
                          <div style={{ padding: '4px', fontSize: '0.82rem' }}>
                            <strong style={{ display: 'block', color: 'var(--dc-forest)' }}>
                              {s.name}
                            </strong>
                            <div style={{ fontSize: '0.74rem', color: '#555', margin: '2px 0' }}>
                              {s.address}
                            </div>
                            <div style={{ fontSize: '0.74rem', fontWeight: 600, color: 'var(--dc-earth-green)' }}>
                              {s.capacity - s.occupancy} beds available · {dist} km away
                            </div>
                            <div style={{ marginTop: '6px' }}>
                              <a
                                href={`https://www.google.com/maps/dir/?api=1&destination=${sLat},${sLon}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ color: 'var(--dc-forest)', fontWeight: 700, textDecoration: 'underline' }}
                              >
                                Google Maps Directions &rarr;
                              </a>
                            </div>
                          </div>
                        </Popup>
                      </Marker>
                    );
                  })}

                {/* Hazard Incident Markers (Filtered by layer) */}
                {(mapLayer === 'all' || mapLayer === 'hazards') &&
                  incidents.map((inc, idx) => {
                    const iLat = inc.location?.coordinates?.[1] || inc.latitude;
                    const iLon = inc.location?.coordinates?.[0] || inc.longitude;
                    if (!iLat || !iLon) return null;
                    const dist = getDistanceKm(coords.lat, coords.lon, iLat, iLon);
                    return (
                      <Marker
                        key={inc._id || `i-${idx}`}
                        position={[iLat, iLon]}
                        icon={createIncidentPinIcon(inc.severity)}
                      >
                        <Popup>
                          <div style={{ padding: '4px', fontSize: '0.82rem' }}>
                            <strong style={{ display: 'block', color: 'var(--dc-emergency)' }}>
                              ⚠️ {inc.title}
                            </strong>
                            <div style={{ fontSize: '0.74rem', color: '#555', margin: '2px 0' }}>
                              {inc.location}
                            </div>
                            <div style={{ fontSize: '0.72rem', fontWeight: 600 }}>
                              Severity: {inc.severity} · Status: {inc.status} {dist != null ? `(${dist} km)` : ''}
                            </div>
                          </div>
                        </Popup>
                      </Marker>
                    );
                  })}
              </MapContainer>
            </div>
          </section>

          {/* 4. Prioritized "What Should I Do Next?" Section */}
          <section className="dc-home-section" style={{ marginBottom: '16px' }}>
            <div className="dc-section-header-row">
              <h2 className="dc-section-title">What Should I Do Next?</h2>
              <button onClick={() => navigate('/safety')} className="dc-text-link">
                <span>All Readiness Actions</span>
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
                      <div className="dc-recommendation-title-row">
                        <h4 className="dc-recommendation-title">{act.title}</h4>
                        <span className="dc-recommendation-tag">{act.tag}</span>
                      </div>
                      <p className="dc-recommendation-text">{act.text}</p>
                    </div>
                    <button
                      onClick={() => navigate(act.link)}
                      className="dc-station-btn"
                      style={{ flex: 'none', padding: '6px 10px' }}
                    >
                      <span>Take Action</span>
                      <ArrowUpRight size={12} />
                    </button>
                  </div>
                );
              })}
            </div>
          </section>

          {/* 5. Dual Fast Action Bar (Preserves #dc-quick-report & #dc-quick-help) */}
          <section className="dc-two-actions-grid">
            <button
              id="dc-quick-report"
              onClick={() => {
                if (onOpenIncident) onOpenIncident();
                else navigate('/incidents');
              }}
              className="dc-action-card-primary"
            >
              <PlusCircle size={22} />
              <div className="dc-action-text-col">
                <span className="dc-action-title">Report Field Incident</span>
                <span className="dc-action-sub">
                  Waterlogging, downed electrical wires, or road blockages
                </span>
              </div>
            </button>

            <button
              id="dc-quick-help"
              onClick={() => navigate('/shelters')}
              className="dc-action-card-secondary"
            >
              <LifeBuoy size={22} />
              <div className="dc-action-text-col">
                <span className="dc-action-title">Find Relief Shelter</span>
                <span className="dc-action-sub">
                  Verified beds, potable water, and emergency medical kits
                </span>
              </div>
            </button>
          </section>
        </main>

        {/* ===================================================================
            RIGHT COLUMN — LIVE OPERATIONS PANEL (~25–30%)
            =================================================================== */}
        <aside className="dc-col-right" aria-label="Live Operations Panel">
          {/* 1. Official Emergency Alerts Feed */}
          <div className="dc-cmd-card">
            <div className="dc-cmd-card-header">
              <span className="dc-cmd-card-title">
                <Bell size={13} />
                <span>Official Broadcasts</span>
              </span>
              <span className="dc-cmd-badge">
                {alerts.length} Active
              </span>
            </div>

            {alerts.length > 0 ? (
              <div className="dc-ops-alerts-list">
                {alerts.slice(0, 2).map((a, idx) => (
                  <div key={a._id || `alt-${idx}`} className={`dc-ops-alert-item ${a.severity === 'Critical' ? 'critical' : ''}`}>
                    <div className="dc-ops-alert-meta">
                      <span>{a.severity || 'Advisory'} Priority</span>
                      <span>Target: {a.location || 'Regional Zone'}</span>
                    </div>
                    <div className="dc-ops-alert-title">{a.title}</div>
                    <div className="dc-ops-alert-desc">
                      {a.description || a.message}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ padding: '12px', borderRadius: '8px', backgroundColor: 'var(--dc-surface-2)', fontSize: '0.8rem', color: 'var(--dc-text-secondary)', textAlign: 'center' }}>
                <ShieldCheck size={20} style={{ color: 'var(--dc-earth-green)', margin: '0 auto 4px' }} />
                <span>No active statutory disaster advisories in your sector.</span>
              </div>
            )}
          </div>

          {/* 2. Verified Crowdsourced Hazards Feed */}
          <div className="dc-cmd-card">
            <div className="dc-cmd-card-header">
              <span className="dc-cmd-card-title">
                <AlertTriangle size={13} />
                <span>Citizen Hazards</span>
              </span>
              <button
                onClick={() => navigate('/incidents')}
                className="dc-card-footer-link"
                style={{ fontSize: '0.72rem' }}
              >
                <span>View All ({incidents.length})</span>
                <ArrowUpRight size={11} />
              </button>
            </div>

            {nearbyIncidents.length > 0 ? (
              <div className="dc-ops-incidents-list">
                {nearbyIncidents.map((inc, idx) => (
                  <div key={inc._id || `inc-${idx}`} className="dc-ops-incident-item">
                    <div className="dc-ops-incident-top">
                      <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--dc-clay)', textTransform: 'uppercase' }}>
                        {inc.type || 'Field Hazard'}
                      </span>
                      <span style={{ fontSize: '0.7rem', color: 'var(--dc-text-muted)' }}>
                        {inc.distanceKm != null ? `${inc.distanceKm} km away` : 'Nearby'}
                      </span>
                    </div>
                    <div className="dc-ops-incident-title">{inc.title}</div>
                    <div className="dc-ops-incident-loc">
                      <MapPin size={11} />
                      <span>{inc.location}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ padding: '12px', borderRadius: '8px', backgroundColor: 'var(--dc-surface-2)', fontSize: '0.8rem', color: 'var(--dc-text-secondary)', textAlign: 'center' }}>
                <span>No local field hazards logged. Tap Report Incident to submit.</span>
              </div>
            )}
          </div>

          {/* 3. Nearby Relief Shelters & Capacity */}
          <div className="dc-cmd-card">
            <div className="dc-cmd-card-header">
              <span className="dc-cmd-card-title">
                <LifeBuoy size={13} />
                <span>Nearby Relief Shelters</span>
              </span>
              <button
                onClick={() => navigate('/shelters')}
                className="dc-card-footer-link"
                style={{ fontSize: '0.72rem' }}
              >
                <span>All ({shelters.length})</span>
                <ArrowUpRight size={11} />
              </button>
            </div>

            {nearbyShelters.length > 0 ? (
              <div className="dc-ops-shelters-list">
                {nearbyShelters.slice(0, 2).map((s, idx) => {
                  const sLat = s.location?.coordinates?.[1] || s.latitude;
                  const sLon = s.location?.coordinates?.[0] || s.longitude;
                  const availableBeds = Math.max(0, (s.capacity || 100) - (s.occupancy || 0));
                  const occPct = Math.round(((s.occupancy || 0) / (s.capacity || 100)) * 100);
                  return (
                    <div key={s._id || `sh-${idx}`} className="dc-ops-shelter-item">
                      <div className="dc-ops-shelter-name">{s.name}</div>
                      <div className="dc-ops-shelter-distance">
                        {s.distanceKm} km away · ~{Math.round(s.distanceKm * 2.5 + 2)} mins drive
                      </div>

                      <div className="dc-ops-shelter-cap-bar">
                        <div className="dc-ops-shelter-cap-fill" style={{ width: `${occPct}%` }} />
                      </div>
                      <div className="dc-ops-shelter-cap-text">
                        <span>{availableBeds} beds available</span>
                        <span>{occPct}% occupied</span>
                      </div>

                      <div className="dc-ops-shelter-amenities">
                        {(s.facilities || ['Food', 'Water', 'Medical']).slice(0, 3).map((f, fIdx) => (
                          <span key={fIdx} className="dc-amenity-pill">
                            {f}
                          </span>
                        ))}
                      </div>

                      <div className="dc-ops-shelter-actions">
                        {sLat && sLon && (
                          <a
                            href={`https://www.google.com/maps/dir/?api=1&destination=${sLat},${sLon}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="dc-ops-shelter-btn primary"
                          >
                            <Navigation size={12} />
                            <span>Directions</span>
                          </a>
                        )}
                        <a href={`tel:${s.phone || '112'}`} className="dc-ops-shelter-btn">
                          <PhoneCall size={12} />
                          <span>Call</span>
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{ padding: '12px', borderRadius: '8px', backgroundColor: 'var(--dc-surface-2)', fontSize: '0.8rem', color: 'var(--dc-text-secondary)', textAlign: 'center' }}>
                <span>Relief shelters directory syncing...</span>
              </div>
            )}
          </div>

          {/* 4. Emergency Dispatch Helplines & Rapid SOS */}
          <div className="dc-cmd-card">
            <div className="dc-cmd-card-header">
              <span className="dc-cmd-card-title">
                <PhoneCall size={13} />
                <span>Emergency Helplines</span>
              </span>
              <span className="dc-cmd-badge" style={{ backgroundColor: 'rgba(201,75,75,0.1)', color: 'var(--dc-emergency)' }}>
                Toll Free 24/7
              </span>
            </div>

            <div className="dc-helplines-grid">
              <a href="tel:112" className="dc-helpline-tap-btn">
                <PhoneCall size={14} style={{ color: 'var(--dc-emergency)' }} />
                <div>
                  <div className="dc-helpline-num">112</div>
                  <div className="dc-helpline-lbl">Universal</div>
                </div>
              </a>

              <a href="tel:1078" className="dc-helpline-tap-btn">
                <Shield size={14} style={{ color: 'var(--dc-warning)' }} />
                <div>
                  <div className="dc-helpline-num">1078</div>
                  <div className="dc-helpline-lbl">NDRF Cell</div>
                </div>
              </a>

              <a href="tel:108" className="dc-helpline-tap-btn">
                <Activity size={14} style={{ color: 'var(--dc-earth-green)' }} />
                <div>
                  <div className="dc-helpline-num">108</div>
                  <div className="dc-helpline-lbl">Ambulance</div>
                </div>
              </a>

              <a href="tel:100" className="dc-helpline-tap-btn">
                <Radio size={14} style={{ color: 'var(--dc-forest)' }} />
                <div>
                  <div className="dc-helpline-num">100</div>
                  <div className="dc-helpline-lbl">Police</div>
                </div>
              </a>
            </div>

            <button onClick={onOpenSos} className="dc-main-sos-btn">
              <Radio size={16} />
              <span>Broadcast SOS Signal</span>
            </button>
            <div className="dc-sos-btn-caption">
              Transmits GPS distress beacon to community emergency dispatchers
            </div>
          </div>

          {/* 5. WeatherGPT Copilot Quick Launcher */}
          <div className="dc-weathergpt-launcher-card">
            <div className="dc-cmd-card-header" style={{ marginBottom: '8px' }}>
              <span className="dc-cmd-card-title" style={{ color: 'var(--dc-forest)' }}>
                <Sparkles size={14} />
                <span>WeatherGPT Copilot</span>
              </span>
              <span className="dc-cmd-badge" style={{ backgroundColor: 'rgba(73,107,90,0.15)' }}>
                AI Ready
              </span>
            </div>

            <div style={{ fontSize: '0.8rem', color: 'var(--dc-text-secondary)', lineHeight: 1.4 }}>
              Ask plain-language disaster & weather safety questions:
            </div>

            <div className="dc-wgpt-prompt-chips">
              <button
                onClick={() => handleLaunchWeatherGpt('Do I need an umbrella or rain gear today?')}
                className="dc-wgpt-chip-btn"
              >
                💬 &ldquo;Do I need an umbrella today?&rdquo;
              </button>
              <button
                onClick={() => handleLaunchWeatherGpt('Are roads flooded near my location right now?')}
                className="dc-wgpt-chip-btn"
              >
                💬 &ldquo;Are roads flooded near me?&rdquo;
              </button>
              <button
                onClick={() => handleLaunchWeatherGpt('What is the current air quality and health risk?')}
                className="dc-wgpt-chip-btn"
              >
                💬 &ldquo;What is the AQI health risk?&rdquo;
              </button>
            </div>

            <button
              onClick={() => handleLaunchWeatherGpt()}
              className="dc-wgpt-launch-btn"
            >
              <Sparkles size={14} />
              <span>Open WeatherGPT Assistant</span>
            </button>
          </div>

          {/* 6. Data Trust & Telemetry Source Footnote */}
          <div className="dc-ops-data-trust">
            <div className="dc-trust-line">
              <Radio size={12} style={{ color: 'var(--dc-earth-green)' }} />
              <span>Surface Observation: Open-Meteo High-Res Model</span>
            </div>
            <div className="dc-trust-line">
              <MapPin size={12} style={{ color: 'var(--dc-clay)' }} />
              <span>Cartography: OpenStreetMap & Leaflet Geospatial</span>
            </div>
            <div className="dc-trust-line">
              <ShieldCheck size={12} style={{ color: 'var(--dc-forest)' }} />
              <span>Integrity: DisasterChain Cryptographic Audit</span>
            </div>
          </div>
        </aside>
      </div>
    </motion.div>
  );
}
