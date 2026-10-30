import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  MapPin,
  RefreshCw,
  ArrowRight,
  ShieldCheck,
  PlusCircle,
  Home,
  Radio,
} from 'lucide-react';
import { fetchShelters, fetchAlerts } from '../services/api';
import { fetchCompleteWeather } from '../services/weatherApi';
import { useDCLocation } from '../context/LocationContext';
import { useTranslation } from '../i18n/i18n';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';

// Helper to dynamically re-center Leaflet map when coordinates change
function MapRecenter({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.setView(center, map.getZoom());
    }
  }, [center, map]);
  return null;
}

// Custom Leaflet Pin Icons
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

export default function ModernHomePage({ onOpenSos, onOpenIncident, refreshKey }) {
  const navigate = useNavigate();
  const { t } = useTranslation();

  // Centralized unified location state & controls
  const {
    coords,
    locationName,
    city,
    isGpsLocked,
    isLocating,
    requestGpsLocation,
    openCitySelector,
  } = useDCLocation();

  // Weather & Conditions state
  const [weatherData, setWeatherData] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(true);

  // Operational intelligence (Alerts & Shelters)
  const [alerts, setAlerts] = useState([]);
  const [shelters, setShelters] = useState([]);

  // Time-of-day greeting (e.g. "Good morning, Kharar.")
  const greetingText = useMemo(() => {
    const hour = new Date().getHours();
    const salutation =
      hour < 12
        ? t('common.goodMorning', 'Good morning')
        : hour < 17
        ? t('common.goodAfternoon', 'Good afternoon')
        : t('common.goodEvening', 'Good evening');
    return `${salutation}, ${city}.`;
  }, [city, t]);

  // Fetch real atmospheric telemetry from Open-Meteo
  useEffect(() => {
    let isMounted = true;
    setWeatherLoading(true);

    fetchCompleteWeather(coords.lat, coords.lon)
      .then((data) => {
        if (!isMounted) return;
        setWeatherData(data);
        setWeatherLoading(false);
      })
      .catch((err) => {
        if (!isMounted) return;
        console.warn('Weather fetch error:', err);
        setWeatherLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [coords.lat, coords.lon, refreshKey]);

  // Fetch verified alerts and relief shelters
  useEffect(() => {
    let isMounted = true;

    Promise.allSettled([fetchAlerts(), fetchShelters()]).then(([alertsRes, sheltersRes]) => {
      if (!isMounted) return;
      if (alertsRes.status === 'fulfilled' && alertsRes.value) {
        setAlerts(alertsRes.value);
      }
      if (sheltersRes.status === 'fulfilled' && sheltersRes.value) {
        setShelters(sheltersRes.value);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [refreshKey]);

  // Find the single most important active verified warning, if any
  const primaryAlert = useMemo(() => {
    if (!alerts || alerts.length === 0) return null;
    const warning = alerts.find(
      (a) => a.severity === 'Warning' || a.severity === 'Critical' || a.priority === 'High'
    );
    return warning || alerts[0];
  }, [alerts]);

  // Current temperature and weather condition
  const currentTemp = weatherData?.current?.temp ?? 25;
  const currentCondition = weatherData?.current?.conditionText || 'Partly Cloudy';
  const feelsLike = weatherData?.current?.feelsLike != null ? Math.round(weatherData.current.feelsLike) : Math.round(currentTemp + 1);

  // Overall simple risk status
  const riskStatus = useMemo(() => {
    if (primaryAlert && (primaryAlert.severity === 'Critical' || primaryAlert.severity === 'Warning')) {
      return {
        label: 'Advisory Active',
        className: 'elevated',
        summary: 'Official weather advisory active in your regional corridor.',
      };
    }
    return {
      label: 'Normal Perimeter',
      className: 'normal',
      summary: 'Atmospheric telemetry is calm. Perimeter conditions standard.',
    };
  }, [primaryAlert]);

  return (
    <div className="dc-home-clean-page">
      <div className="dc-home-clean-container">
        {/* ===================================================================
            SECTION A & B: LOCATION GREETING & EDITORIAL HEADING
            =================================================================== */}
        <header id="dc-home-header" className="dc-home-header dc-home-clean-header">
          {/* Small Location Greeting */}
          <div className="dc-home-greeting-bar">
            <span className="dc-home-greeting-text">{greetingText}</span>
            <div
              className="dc-home-location-pill"
              onClick={openCitySelector}
              style={{ cursor: 'pointer' }}
              title={t('common.selectLocation', 'Click to change location')}
            >
              <MapPin size={13} className="dc-location-icon" />
              <span>{locationName}</span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  requestGpsLocation();
                }}
                disabled={isLocating}
                className="dc-detect-gps-icon-btn"
                title={t('common.useDeviceLocation', 'Detect live GPS location')}
              >
                <RefreshCw size={11} className={isLocating ? 'dc-spin' : ''} />
              </button>
            </div>
          </div>

          {/* Main Editorial Heading */}
          <h1 className="dc-home-editorial-title">
            {t('home.heroTitle', 'Stay informed. Stay safe.')}
          </h1>
          <p className="dc-home-editorial-sub">
            {t('home.heroSubtitle', 'Earth intelligence, localized conditions, and emergency coordination for your sector.')}
          </p>
        </header>

        {/* ===================================================================
            SECTION C: ONE ELEGANT WEATHER & CONDITIONS SECTION
            =================================================================== */}
        <section
          className="dc-home-clean-card dc-whats-happening-card dc-home-weather-card"
          aria-label="Current Weather and Conditions"
        >
          <div className="dc-clean-card-body">
            <div className="dc-weather-main-row">
              {/* Temperature & Condition */}
              <div className="dc-weather-temp-block">
                <span className="dc-clean-temp-value">{Math.round(currentTemp)}°</span>
                <div className="dc-clean-condition-meta">
                  <span className="dc-clean-condition-text">{currentCondition}</span>
                  <span className="dc-clean-feels-like">
                    {t('weather.feelsLike', 'Feels like')} {feelsLike}°C
                  </span>
                </div>
              </div>

              {/* Simple Risk Status Indicator */}
              <div className="dc-clean-risk-block">
                <div className={`dc-clean-risk-pill ${riskStatus.className}`}>
                  <span className="dc-risk-dot" />
                  <span>{riskStatus.label}</span>
                </div>
                <span className="dc-clean-risk-summary">{riskStatus.summary}</span>
              </div>
            </div>

            {/* Weather Action Link to Full Weather Tab */}
            <div className="dc-clean-card-footer">
              <button
                type="button"
                onClick={() => navigate('/weather')}
                className="dc-clean-link-btn"
              >
                <span>{t('home.viewWeather', 'View complete weather forecast & telemetry')}</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </section>

        {/* ===================================================================
            SECTION D: ONE IMPORTANT ALERT SECTION
            =================================================================== */}
        {primaryAlert ? (
          <section
            className="dc-home-clean-card dc-home-alert-card"
            aria-label="Verified Weather Advisory"
          >
            <div className="dc-clean-card-body">
              <div className="dc-alert-header-row">
                <div className="dc-alert-badge-group">
                  <span className="dc-alert-priority-tag">
                    {primaryAlert.priority || primaryAlert.severity || 'Notice'} Priority
                  </span>
                  {primaryAlert.target && (
                    <span className="dc-alert-target-tag">Target: {primaryAlert.target}</span>
                  )}
                </div>
                <span className="dc-alert-source-tag">Official Civil Watch</span>
              </div>

              <h2 className="dc-alert-title">{primaryAlert.title}</h2>
              <p className="dc-alert-desc">
                {primaryAlert.description ||
                  'Official advisory issued for your administrative corridor. Monitor surroundings and adhere to safety directives.'}
              </p>

              <div className="dc-alert-footer-row">
                <button
                  type="button"
                  onClick={() => navigate('/weather')}
                  className="dc-alert-action-btn"
                >
                  <span>View Advisory Details</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          </section>
        ) : (
          <div className="dc-clean-calm-banner">
            <ShieldCheck size={16} className="dc-calm-icon" />
            <span>All regional systems normal. No active emergency bulletins for your perimeter.</span>
          </div>
        )}

        {/* ===================================================================
            SECTION E: ONE REGIONAL MAP PREVIEW
            =================================================================== */}
        <section
          className="dc-home-clean-card dc-map-preview-wrap dc-home-map-card"
          aria-label="Regional Map Preview"
        >
          <div className="dc-map-preview-header">
            <div className="dc-map-header-left">
              <h2 className="dc-map-preview-title">Regional Map Preview</h2>
              <span className="dc-map-preview-sub">
                {coords.lat.toFixed(4)}°N, {coords.lon.toFixed(4)}°E · Live GIS overview
              </span>
            </div>

            <button
              type="button"
              onClick={() => navigate('/map')}
              className="dc-open-full-map-btn"
              title="Open full interactive map"
            >
              <span>{t('common.openFullMap', 'Open Full Map')}</span>
              <ArrowRight size={14} />
            </button>
          </div>

          <div className="dc-map-preview-leaflet-box">
            <MapContainer
              center={[coords.lat, coords.lon]}
              zoom={13}
              scrollWheelZoom={false}
              dragging={true}
              touchZoom={true}
              className="dc-clean-map-canvas"
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                maxZoom={18}
              />
              <MapRecenter center={[coords.lat, coords.lon]} />

              {/* User Location Marker */}
              <Marker position={[coords.lat, coords.lon]} icon={createUserPinIcon()}>
                <Popup>
                  <div className="dc-map-popup-clean">
                    <strong>{t('common.yourLocation', 'Your Location')}</strong>
                    <p>{locationName}</p>
                  </div>
                </Popup>
              </Marker>

              {/* Shelter Markers */}
              {shelters.slice(0, 5).map((s, idx) => {
                const sLat = Number(s.latitude);
                const sLon = Number(s.longitude);
                if (isNaN(sLat) || isNaN(sLon)) return null;
                return (
                  <Marker key={s._id || idx} position={[sLat, sLon]} icon={createShelterPinIcon()}>
                    <Popup>
                      <div className="dc-map-popup-clean">
                        <strong>{s.name}</strong>
                        <p>{s.address || 'Emergency Shelter'}</p>
                        <span className="dc-shelter-popup-badge">
                          {s.capacity ? `${s.capacity - (s.occupancy || 0)} beds available` : 'Open'}
                        </span>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}
            </MapContainer>
          </div>
        </section>

        {/* ===================================================================
            SECTION F: ONE SMALL QUICK-ACTIONS ROW
            =================================================================== */}
        <section className="dc-home-quick-actions" aria-label="Quick Actions">
          {/* Action 1: Report Incident */}
          <button
            type="button"
            id="dc-quick-report"
            onClick={onOpenIncident}
            className="dc-quick-action-btn dc-action-report"
            title={t('home.reportHazard', 'Submit a verified community hazard report')}
          >
            <PlusCircle size={18} />
            <span>{t('home.reportHazard', 'Report Incident')}</span>
          </button>

          {/* Action 2: Find Shelter */}
          <button
            type="button"
            id="dc-quick-help"
            onClick={() => navigate('/shelters')}
            className="dc-quick-action-btn dc-action-shelter"
            title={t('home.findShelter', 'Browse verified emergency shelters and relief centers')}
          >
            <Home size={18} />
            <span>{t('home.findShelter', 'Find Shelter')}</span>
          </button>

          {/* Action 3: Emergency SOS */}
          <button
            type="button"
            id="dc-home-sos-btn"
            onClick={onOpenSos}
            className="dc-quick-action-btn dc-action-sos"
            title={t('emergency.broadcastSos', 'Broadcast emergency SOS distress beacon')}
          >
            <Radio size={18} className="dc-pulse-icon" />
            <span>{t('emergency.broadcastSos', 'Emergency SOS')}</span>
          </button>
        </section>
      </div>
    </div>
  );
}
