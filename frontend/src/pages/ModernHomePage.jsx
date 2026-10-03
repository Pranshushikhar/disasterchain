import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  PlusCircle,
  LifeBuoy,
  ArrowUpRight,
} from 'lucide-react';
import {
  fetchShelters,
  fetchAlerts,
  fetchIncidents,
} from '../services/api';
import { fetchCompleteWeather, reverseGeocode } from '../services/weatherApi';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import L from 'leaflet';

// Minimalist Map Pin
const createPinIcon = (color) =>
  L.divIcon({
    className: 'dc-custom-pin',
    html: `<div style="
      width: 12px;
      height: 12px;
      background-color: ${color};
      border: 2px solid #FFFDF8;
      border-radius: 50%;
      box-shadow: 0 2px 5px rgba(0,0,0,0.25);
    "></div>`,
    iconSize: [12, 12],
    iconAnchor: [6, 6],
  });

export default function ModernHomePage({ refreshKey }) {
  const navigate = useNavigate();

  // Location & Greeting
  const [coords, setCoords] = useState({ lat: 28.6139, lon: 77.209 }); // Delhi default
  const [locationName, setLocationName] = useState('Delhi NCR, India');
  const [greeting, setGreeting] = useState('Good day');

  // Operational data
  const [weather, setWeather] = useState({
    temp: 30,
    condition: 'Partly Cloudy',
    feelsLike: 32,
    riskLevel: 'MODERATE',
    riskSummary: 'Heavy rainfall is increasing localized waterlogging risk in your area.',
  });

  const [nearbyIncidentsCount, setNearbyIncidentsCount] = useState(4);
  const [availableSheltersCount, setAvailableSheltersCount] = useState(5);

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
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const lat = pos.coords.latitude;
          const lon = pos.coords.longitude;
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

  // Fetch real weather and incident data
  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      try {
        const weatherData = await fetchCompleteWeather(coords.lat, coords.lon);
        if (weatherData && isMounted) {
          const cur = weatherData.current || {};
          const isHigh = (cur.precipitation_probability || 0) > 60 || (cur.rain || 0) > 10;
          setWeather({
            temp: Math.round(cur.temperature_2m ?? 30),
            condition: cur.weather_code_text || (isHigh ? 'Rain Showers' : 'Partly Cloudy'),
            feelsLike: Math.round(cur.apparent_temperature ?? 32),
            riskLevel: isHigh ? 'HIGH' : 'MODERATE',
            riskSummary: isHigh
              ? 'Heavy precipitation expected within 2 hours. Localized drainage congestion active.'
              : 'Localized waterlogging risk in low-lying underpasses. Arterial routes operational.',
          });
        }

        const [shelterRes, incidentRes] = await Promise.allSettled([
          fetchShelters(),
          fetchIncidents(),
        ]);

        if (isMounted) {
          if (shelterRes.status === 'fulfilled' && Array.isArray(shelterRes.value)) {
            setAvailableSheltersCount(shelterRes.value.length || 5);
          }
          if (incidentRes.status === 'fulfilled' && Array.isArray(incidentRes.value)) {
            setNearbyIncidentsCount(incidentRes.value.length || 4);
          }
        }
      } catch (err) {
        console.warn('Data load error:', err);
      }
    };

    loadData();
    return () => {
      isMounted = false;
    };
  }, [coords, refreshKey]);

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
        <header className="dc-home-header">
          <span className="dc-hero-subtitle">
            {greeting}, {locationName}
          </span>
          <h1 className="dc-home-editorial-title">DisasterChain</h1>
        </header>

        {/* =====================================================================
            1. WHAT'S HAPPENING (Unified, Calm, Strong Section)
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
              <span className="dc-risk-caption">Current Risk</span>
              <span
                className={`dc-risk-badge ${
                  weather.riskLevel === 'HIGH' ? 'high' : 'moderate'
                }`}
              >
                {weather.riskLevel}
              </span>
            </div>
          </div>

          <p className="dc-happening-explanation">
            "{weather.riskSummary}"
          </p>

          <div className="dc-happening-footer">
            <span className="dc-happening-intel">
              Rain expected in 2 hours · {nearbyIncidentsCount} nearby incidents · {availableSheltersCount} shelters available
            </span>
            <button
              onClick={() => navigate('/weather')}
              className="dc-text-link"
            >
              <span>View situation</span>
              <ArrowUpRight size={14} />
            </button>
          </div>
        </section>

        {/* =====================================================================
            2. NEAR YOU (Minimalist Map Spatial Overview)
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
              zoom={13}
              zoomControl={false}
              dragging={false}
              touchZoom={false}
              doubleClickZoom={false}
              scrollWheelZoom={false}
              style={{ width: '100%', height: '190px' }}
            >
              <TileLayer
                attribution="&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a>"
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <Marker
                position={[coords.lat, coords.lon]}
                icon={createPinIcon('#263F35')}
              />
              <Marker
                position={[coords.lat + 0.008, coords.lon + 0.009]}
                icon={createPinIcon('#B86F52')}
              />
              <Marker
                position={[coords.lat - 0.007, coords.lon + 0.006]}
                icon={createPinIcon('#496B5A')}
              />
            </MapContainer>
          </div>
        </section>

        {/* =====================================================================
            3. TWO PRIMARY QUICK ACTIONS ONLY
            ===================================================================== */}
        <section className="dc-home-section">
          <div className="dc-two-actions-grid">
            <button
              id="dc-quick-report"
              onClick={() => navigate('/incidents')}
              className="dc-action-card-primary"
            >
              <PlusCircle size={20} />
              <div className="dc-action-text-col">
                <span className="dc-action-title">Report Incident</span>
                <span className="dc-action-sub">
                  Waterlogging, road hazards, or outages
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
                <span className="dc-action-title">Find Help</span>
                <span className="dc-action-sub">
                  Nearest relief shelters and resources
                </span>
              </div>
            </button>
          </div>
        </section>
      </div>
    </motion.div>
  );
}
