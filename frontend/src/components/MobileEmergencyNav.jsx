import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useTranslation } from '../i18n/i18n';
import Icon from './Icons';

/**
 * MobileEmergencyNav (Phase 13)
 * Persistent 1-tap thumb-friendly bottom emergency action bar for mobile devices (<= 768px).
 * Ensures instant access to the 5 life-safety essentials:
 * - SOS (distress trigger)
 * - ALERTS (evacuation & hazard warnings)
 * - NEARBY SHELTER (safe haven search)
 * - MAP (geospatial crisis grid)
 * - REPORT (field hazard submission)
 */
const MobileEmergencyNav = ({ onOpenSos, onOpenIncident, onToggleSidebar }) => {
  const { t } = useTranslation();
  const location = useLocation();

  // Hide on authentication and landing pages
  const isAuthOrLanding =
    location.pathname === '/' ||
    location.pathname === '/login' ||
    location.pathname === '/register' ||
    location.pathname === '/forgot-password' ||
    location.pathname === '/reset-password' ||
    location.pathname === '/verify-email';

  if (isAuthOrLanding) return null;

  return (
    <>
      <nav
        className="mobile-emergency-nav"
        aria-label="Mobile Navigation"
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          height: 'calc(62px + env(safe-area-inset-bottom, 0px))',
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
          background: 'rgba(25, 23, 20, 0.98)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderTop: '1px solid rgba(242, 238, 231, 0.1)',
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          alignItems: 'center',
          zIndex: 9990,
          paddingLeft: '0.25rem',
          paddingRight: '0.25rem',
          boxShadow: '0 -4px 24px rgba(0, 0, 0, 0.85)',
        }}
      >
        {/* 1. HOME */}
        <NavLink
          to="/dashboard"
          style={({ isActive }) => ({
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textDecoration: 'none',
            color: isActive ? '#D96B35' : '#9B958B',
            fontSize: '0.66rem',
            fontWeight: 700,
            gap: '3px',
            minHeight: '48px',
            touchAction: 'manipulation',
          })}
        >
          <Icon name="home" size={19} />
          <span>{t('nav.home', 'HOME')}</span>
        </NavLink>

        {/* 2. WEATHER */}
        <NavLink
          to="/weather"
          style={({ isActive }) => ({
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textDecoration: 'none',
            color: isActive ? '#D96B35' : '#9B958B',
            fontSize: '0.66rem',
            fontWeight: 700,
            gap: '3px',
            minHeight: '48px',
            touchAction: 'manipulation',
          })}
        >
          <Icon name="cloud-rain" size={19} />
          <span>{t('nav.weather', 'WEATHER')}</span>
        </NavLink>

        {/* 3. MAP */}
        <NavLink
          to="/affected-areas"
          style={({ isActive }) => ({
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textDecoration: 'none',
            color: isActive ? '#D96B35' : '#9B958B',
            fontSize: '0.66rem',
            fontWeight: 700,
            gap: '3px',
            minHeight: '48px',
            touchAction: 'manipulation',
          })}
        >
          <Icon name="map-pin" size={19} />
          <span>{t('nav.map', 'MAP')}</span>
        </NavLink>

        {/* 4. WEATHERGPT */}
        <NavLink
          to="/weather-gpt"
          style={({ isActive }) => ({
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textDecoration: 'none',
            color: isActive ? '#D96B35' : '#9B958B',
            fontSize: '0.66rem',
            fontWeight: 700,
            gap: '3px',
            minHeight: '48px',
            touchAction: 'manipulation',
          })}
        >
          <span style={{ fontSize: '1.15rem', lineHeight: 1 }}>⚡</span>
          <span>WEATHERGPT</span>
        </NavLink>

        {/* 5. MORE */}
        <button
          type="button"
          onClick={onToggleSidebar}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'transparent',
            border: 'none',
            color: '#9B958B',
            fontSize: '0.66rem',
            fontWeight: 700,
            gap: '3px',
            minHeight: '48px',
            cursor: 'pointer',
            padding: 0,
            touchAction: 'manipulation',
          }}
          aria-label="More navigation options"
        >
          <Icon name="menu" size={19} />
          <span>MORE</span>
        </button>
      </nav>

      {/* Media Query: show on all phone and portrait tablet screens (< 900px) */}
      <style>{`
        @media (min-width: 900px) {
          .mobile-emergency-nav {
            display: none !important;
          }
        }
        @media (max-width: 899px) {
          .main-content {
            padding-bottom: calc(72px + env(safe-area-inset-bottom, 0px)) !important;
          }
        }
      `}</style>
    </>
  );
};

export default MobileEmergencyNav;
