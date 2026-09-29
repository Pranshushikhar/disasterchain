import React, { useState, useRef } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import Icon from '../Icons';

/**
 * MobileBottomNav (Section 2 & 8)
 * Dedicated Mobile Navigation Bar:
 * Exactly 4 Primary Destinations:
 * 1. SITUATION
 * 2. MAP
 * 3. ALERTS
 * 4. MORE
 *
 * Persistent, restrained emergency action:
 * SOS (with press-and-hold interaction, never covers content).
 */
export default function MobileBottomNav({
  onOpenSos,
  onOpenMore,
  alertCount = 3,
}) {
  const location = useLocation();
  const [holdProgress, setHoldProgress] = useState(0); // 0 to 100
  const holdTimerRef = useRef(null);
  const startTimeRef = useRef(null);

  // Press-and-hold logic for SOS (Specification 8)
  const handleHoldStart = (e) => {
    // Prevent long-press context menu on mobile
    if (e.type === 'touchstart') {
      // allow default touch handling for responsiveness
    }
    startTimeRef.current = Date.now();
    setHoldProgress(5);

    holdTimerRef.current = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const progress = Math.min(100, Math.round((elapsed / 1200) * 100));
      setHoldProgress(progress);

      if (progress >= 100) {
        clearInterval(holdTimerRef.current);
        holdTimerRef.current = null;
        setHoldProgress(0);
        // Trigger SOS immediately
        onOpenSos(true); // fast-track direct trigger
      }
    }, 40);
  };

  const handleHoldEnd = () => {
    if (holdTimerRef.current) {
      clearInterval(holdTimerRef.current);
      holdTimerRef.current = null;
    }
    const elapsed = startTimeRef.current ? Date.now() - startTimeRef.current : 0;
    setHoldProgress(0);

    // If tapped briefly (< 400ms), still open the standard SOS ready modal
    if (elapsed > 0 && elapsed < 400) {
      onOpenSos(false);
    }
  };

  const isMapActive = location.pathname === '/map' || location.pathname === '/affected-areas';
  const isSituationActive = location.pathname === '/' || location.pathname === '/dashboard';
  const isAlertsActive = location.pathname === '/alerts';
  const isMoreActive = location.pathname === '/more';

  return (
    <nav className="mobile-bottom-nav" aria-label="Mobile Emergency Navigation" id="mobile-bottom-nav">
      {/* 1. SITUATION */}
      <NavLink
        to="/"
        className={`mobile-nav-item ${isSituationActive ? 'active' : ''}`}
        aria-label="Situation Room"
      >
        <Icon name="activity" size={20} color={isSituationActive ? '#42D9C8' : '#64727D'} />
        <span>SITUATION</span>
      </NavLink>

      {/* 2. MAP */}
      <NavLink
        to="/affected-areas"
        className={`mobile-nav-item ${isMapActive ? 'active' : ''}`}
        aria-label="Full-Screen Crisis Map"
      >
        <Icon name="map-pin" size={20} color={isMapActive ? '#42D9C8' : '#64727D'} />
        <span>MAP</span>
      </NavLink>

      {/* PERSISTENT RESTRAINED SOS (Above/Within Nav) */}
      <div className="mobile-nav-sos-wrap">
        <button
          type="button"
          className="mobile-nav-sos-btn"
          id="mobile-nav-sos-btn"
          onMouseDown={handleHoldStart}
          onMouseUp={handleHoldEnd}
          onMouseLeave={handleHoldEnd}
          onTouchStart={handleHoldStart}
          onTouchEnd={handleHoldEnd}
          onTouchCancel={handleHoldEnd}
          aria-label="Emergency SOS — Hold for instant distress broadcast"
          title="Hold 1.2s for direct SOS signal"
        >
          {/* Circular SVG Progress Ring for Press-and-Hold */}
          {holdProgress > 0 && (
            <svg className="mobile-sos-ring-svg" viewBox="0 0 60 60">
              <circle
                cx="30"
                cy="30"
                r="27"
                fill="none"
                stroke="rgba(255, 255, 255, 0.3)"
                strokeWidth="3"
              />
              <circle
                cx="30"
                cy="30"
                r="27"
                fill="none"
                stroke="#FFFFFF"
                strokeWidth="3"
                strokeDasharray="170"
                strokeDashoffset={170 - (170 * holdProgress) / 100}
                strokeLinecap="round"
                transform="rotate(-90 30 30)"
              />
            </svg>
          )}
          <Icon name="alert-circle" size={17} color="#FFFFFF" />
          <span>SOS</span>
        </button>
      </div>

      {/* 3. ALERTS */}
      <NavLink
        to="/alerts"
        className={`mobile-nav-item ${isAlertsActive ? 'active' : ''}`}
        aria-label={`Emergency Alerts (${alertCount} active)`}
      >
        <Icon name="bell" size={20} color={isAlertsActive ? '#42D9C8' : '#64727D'} />
        <span>ALERTS</span>
        {alertCount > 0 && (
          <span className="mobile-nav-badge" aria-hidden="true">
            {alertCount}
          </span>
        )}
      </NavLink>

      {/* 4. MORE */}
      <button
        type="button"
        onClick={onOpenMore}
        className={`mobile-nav-item ${isMoreActive ? 'active' : ''}`}
        aria-label="More operational tools and options"
      >
        <Icon name="menu" size={20} color={isMoreActive ? '#42D9C8' : '#64727D'} />
        <span>MORE</span>
      </button>
    </nav>
  );
}
