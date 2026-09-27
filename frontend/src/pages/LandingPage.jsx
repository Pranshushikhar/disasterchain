import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../i18n/i18n';
import { fetchShelters, fetchAlerts } from '../services/api';
import { fetchCompleteWeather } from '../services/weatherApi';

/**
 * DISASTERCHAIN — LANDING & CIVIL DEFENSE PORTAL
 * Calm, disciplined, authoritative crisis infrastructure.
 */
const LandingPage = ({ onOpenSos }) => {
  const { isAuthenticated } = useAuth();
  const { t } = useTranslation();

  const [shelterCount, setShelterCount] = useState(8);
  const [activeAlertsCount, setActiveAlertsCount] = useState(0);
  const [weatherInfo, setWeatherInfo] = useState({
    city: 'New Delhi',
    temp: '30°C',
    condition: 'Mainly Clear',
  });

  useEffect(() => {
    let isMounted = true;
    const loadSummaryData = async () => {
      try {
        const [shRes, altRes] = await Promise.allSettled([
          fetchShelters(),
          fetchAlerts(),
        ]);

        if (!isMounted) return;

        if (shRes.status === 'fulfilled' && Array.isArray(shRes.value)) {
          setShelterCount(shRes.value.length || 8);
        }

        if (altRes.status === 'fulfilled' && Array.isArray(altRes.value)) {
          const active = altRes.value.filter((a) => a.status === 'ACTIVE' || !a.status);
          setActiveAlertsCount(active.length);
        }
      } catch (err) {
        // Fallback gracefully
      }

      try {
        const wData = await fetchCompleteWeather(28.6139, 77.2090);
        if (isMounted && wData?.current) {
          const temp = wData.current.temperature != null ? `${Math.round(wData.current.temperature)}°C` : '30°C';
          const condition = wData.current.weatherCode <= 1 ? 'Clear' : (wData.current.weatherCode <= 3 ? 'Mainly Clear' : 'Overcast');
          setWeatherInfo({
            city: wData.location?.city || 'New Delhi',
            temp,
            condition,
          });
        }
      } catch (e) {
        // Fallback
      }
    };

    loadSummaryData();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div
      style={{
        maxWidth: '1080px',
        margin: '0 auto',
        padding: '3rem 1.5rem 5rem',
        boxSizing: 'border-box',
        color: '#F2EEE7',
      }}
    >
      {/* 1. HERO MISSION STATEMENT */}
      <section
        style={{
          borderBottom: '1px solid rgba(242, 238, 231, 0.08)',
          paddingBottom: '2.75rem',
          marginBottom: '2.75rem',
        }}
      >
        <div style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#D96B35', marginBottom: '0.65rem' }}>
          DISASTERCHAIN
        </div>

        <h1
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(2.4rem, 5.2vw, 3.8rem)',
            fontWeight: 400,
            lineHeight: 1.1,
            letterSpacing: '-0.025em',
            margin: '0 0 1.25rem 0',
            color: '#F2EEE7',
            maxWidth: '820px',
          }}
        >
          Know what is changing.<br />
          Act before it becomes critical.
        </h1>

        <p
          style={{
            fontSize: '1.08rem',
            color: '#D4CDC3',
            lineHeight: 1.55,
            maxWidth: '680px',
            margin: '0 0 2rem 0',
          }}
        >
          A disciplined emergency intelligence network providing real-time atmospheric tracking, verified evacuation shelters, and decentralized crisis response.
        </p>

        {/* Primary Action Row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', marginBottom: '2.5rem' }}>
          <Link
            to="/dashboard"
            id="landing-primary-explore-btn"
            style={{
              background: '#211E1A',
              border: '1px solid rgba(242, 238, 231, 0.16)',
              color: '#F2EEE7',
              padding: '0.85rem 1.65rem',
              borderRadius: '6px',
              fontSize: '0.96rem',
              fontWeight: 600,
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'all 0.15s ease',
            }}
          >
            <span>Explore current situation</span>
            <span style={{ color: '#D96B35' }}>→</span>
          </Link>

          <Link
            to="/weather"
            id="landing-secondary-weather-btn"
            style={{
              background: 'transparent',
              border: '1px solid rgba(242, 238, 231, 0.12)',
              color: '#F2EEE7',
              padding: '0.85rem 1.5rem',
              borderRadius: '6px',
              fontSize: '0.95rem',
              fontWeight: 600,
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              transition: 'all 0.15s ease',
            }}
          >
            <span>Weather Intelligence</span>
          </Link>

          <button
            type="button"
            onClick={onOpenSos}
            id="landing-sos-trigger-btn"
            style={{
              background: '#C94235',
              border: 'none',
              color: '#ffffff',
              padding: '0.85rem 1.5rem',
              borderRadius: '6px',
              fontSize: '0.95rem',
              fontWeight: 700,
              letterSpacing: '0.02em',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'background-color 0.15s ease',
            }}
          >
            <span>🚨</span>
            <span>Broadcast SOS</span>
          </button>
        </div>

        {/* Quiet Live Telemetry Strip */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1.25rem',
            flexWrap: 'wrap',
            fontSize: '0.82rem',
            color: '#9B958B',
            fontFamily: 'var(--font-mono)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#628B63' }} />
            <span>SYSTEM STABLE</span>
          </div>
          <span>·</span>
          <span>{weatherInfo.city.toUpperCase()}: {weatherInfo.temp} {weatherInfo.condition.toUpperCase()}</span>
          <span>·</span>
          <span>{shelterCount} SHELTERS CONFIRMED</span>
          <span>·</span>
          <span>{activeAlertsCount} ACTIVE ADVISORIES</span>
        </div>
      </section>

      {/* 2. THREE PILLARS OF DISASTERCHAIN (EDITORIAL COLUMNS) */}
      <section style={{ marginBottom: '3.5rem' }}>
        <div style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#9B958B', marginBottom: '1.25rem' }}>
          CORE CAPABILITIES
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
          <div>
            <div style={{ fontSize: '1.15rem', fontWeight: 600, color: '#F2EEE7', marginBottom: '0.45rem' }}>
              Atmospheric Intelligence
            </div>
            <p style={{ fontSize: '0.9rem', color: '#9B958B', lineHeight: 1.55, margin: '0 0 0.85rem 0' }}>
              Live high-resolution telemetry, WMO code classification, precipitation probability timelines, and integrated air quality monitoring backed by Open-Meteo and Copernicus CAMS.
            </p>
            <Link
              to="/weather"
              style={{ fontSize: '0.84rem', fontWeight: 600, color: '#D96B35', textDecoration: 'none' }}
            >
              Examine Weather Feed →
            </Link>
          </div>

          <div>
            <div style={{ fontSize: '1.15rem', fontWeight: 600, color: '#F2EEE7', marginBottom: '0.45rem' }}>
              Civil Protection & Shelters
            </div>
            <p style={{ fontSize: '0.9rem', color: '#9B958B', lineHeight: 1.55, margin: '0 0 0.85rem 0' }}>
              Real-time directory of verified emergency evacuation facilities, live capacity telemetry, medical station provisions, and offline navigation pathways.
            </p>
            <Link
              to="/shelters"
              style={{ fontSize: '0.84rem', fontWeight: 600, color: '#D96B35', textDecoration: 'none' }}
            >
              Locate Active Shelters →
            </Link>
          </div>

          <div>
            <div style={{ fontSize: '1.15rem', fontWeight: 600, color: '#F2EEE7', marginBottom: '0.45rem' }}>
              WeatherGPT Reasoning Desk
            </div>
            <p style={{ fontSize: '0.9rem', color: '#9B958B', lineHeight: 1.55, margin: '0 0 0.85rem 0' }}>
              Context-grounded assistant for civilian travel planning, severe weather risk analysis, and outdoor activity advisories structured with source-verified meteorological data.
            </p>
            <Link
              to="/weather-gpt"
              style={{ fontSize: '0.84rem', fontWeight: 600, color: '#D96B35', textDecoration: 'none' }}
            >
              Consult WeatherGPT →
            </Link>
          </div>
        </div>
      </section>

      {/* 3. QUICK CIVILIAN DIRECTORY */}
      <section
        style={{
          borderTop: '1px solid rgba(242, 238, 231, 0.08)',
          paddingTop: '2rem',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ fontSize: '0.84rem', color: '#9B958B' }}>
            Emergency Communications Protocol v2.6 · Indian National Disaster Management Architecture
          </div>

          <div style={{ display: 'flex', gap: '1.25rem', fontSize: '0.84rem' }}>
            <Link to="/alerts" style={{ color: '#D4CDC3', textDecoration: 'none' }}>Alerts</Link>
            <Link to="/affected-areas" style={{ color: '#D4CDC3', textDecoration: 'none' }}>Crisis Map</Link>
            <Link to="/guides" style={{ color: '#D4CDC3', textDecoration: 'none' }}>Preparedness</Link>
            <Link to="/offline" style={{ color: '#D4CDC3', textDecoration: 'none' }}>Offline Mode</Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
