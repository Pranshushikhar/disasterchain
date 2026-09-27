import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../Icons';

/**
 * MobileHeader (Section 2)
 * Clean, compact emergency header for phone viewports:
 * - compact DisasterChain wordmark
 * - current locality
 * - connection/data freshness indicator
 * - profile/menu trigger
 */
export default function MobileHeader({
  locality = 'CHANDIGARH',
  freshness = 'LIVE · 2m',
  isStale = false,
  isOffline = false,
  onOpenMenu,
  onLocalityClick,
}) {
  const [showLocalityPicker, setShowLocalityPicker] = useState(false);

  return (
    <header className="mobile-app-header" role="banner" id="mobile-app-header">
      {/* LEFT: Compact Wordmark & Locality */}
      <div className="mobile-header-left">
        <Link to="/" className="mobile-brand-mark-btn" aria-label="DisasterChain Home">
          <div className="mobile-brand-icon" aria-hidden="true">
            <Icon name="shield-check" size={14} color="#D96B35" />
          </div>
          <span className="mobile-brand-text">DISASTERCHAIN</span>
        </Link>

        {/* Current Locality Pill */}
        <button
          type="button"
          className="mobile-header-locality-btn"
          onClick={() => {
            if (onLocalityClick) onLocalityClick();
            else setShowLocalityPicker((prev) => !prev);
          }}
          title="Current Locality (tap to switch)"
          aria-label={`Current locality: ${locality}`}
        >
          <Icon name="map-pin" size={11} color="#D96B35" />
          <span className="mobile-locality-text">{locality}</span>
        </button>
      </div>

      {/* RIGHT: Freshness & Menu */}
      <div className="mobile-header-right">
        {/* Connection / Freshness Indicator */}
        <div
          className={`mobile-freshness-badge ${isOffline ? 'offline' : isStale ? 'stale' : 'live'}`}
          title={isOffline ? 'System Offline' : isStale ? 'Data Stale' : 'Continuous Telemetry'}
        >
          <span className="mobile-pulse-dot" aria-hidden="true" />
          <span>{isOffline ? 'OFFLINE' : freshness}</span>
        </div>

        {/* Profile / Menu Quick Trigger */}
        <button
          type="button"
          className="mobile-header-menu-btn"
          onClick={onOpenMenu}
          aria-label="Open emergency menu & settings"
          title="Menu & Settings"
        >
          <Icon name="user" size={16} color="#A49F93" />
        </button>
      </div>

      {/* Locality Quick Selector Dropdown (if clicked without custom handler) */}
      {showLocalityPicker && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(52px + env(safe-area-inset-top, 0px))',
            left: '1rem',
            right: '1rem',
            background: '#191714',
            border: '1px solid rgba(242, 238, 231, 0.15)',
            borderRadius: '6px',
            padding: '0.75rem',
            zIndex: 9999,
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.85)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', color: '#A49F93', fontWeight: 700 }}>
              SELECT OPERATIONAL SECTOR
            </span>
            <button
              type="button"
              onClick={() => setShowLocalityPicker(false)}
              style={{ background: 'transparent', border: 'none', color: '#A49F93', cursor: 'pointer' }}
            >
              ✕
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            {['CHANDIGARH (Metro Sector 14-17)', 'DELHI METRO (Central Basin)', 'MOHALI (Suburban Perimeter)', 'PANCHKULA (Foothills Zone)'].map(
              (loc) => (
                <button
                  key={loc}
                  type="button"
                  onClick={() => setShowLocalityPicker(false)}
                  style={{
                    textAlign: 'left',
                    padding: '0.45rem 0.65rem',
                    background: loc.startsWith(locality) ? 'rgba(217, 107, 53, 0.15)' : 'rgba(242, 238, 231, 0.03)',
                    border: '1px solid rgba(242, 238, 231, 0.08)',
                    borderRadius: '4px',
                    color: loc.startsWith(locality) ? '#D96B35' : '#E9E5DC',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  {loc}
                </button>
              )
            )}
          </div>
        </div>
      )}
    </header>
  );
}
