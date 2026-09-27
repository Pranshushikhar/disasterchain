import React from 'react';
import Icon from '../Icons';

/**
 * MobileStateView (Section 15)
 * Handles all core operational states:
 * - LOADING
 * - EMPTY
 * - ERROR
 * - OFFLINE
 * - STALE DATA
 * - NO LOCATION
 */
export default function MobileStateView({
  type = 'LOADING', // 'LOADING' | 'EMPTY' | 'ERROR' | 'OFFLINE' | 'STALE' | 'NO_LOCATION'
  message = '',
  onRetry,
  onPickCity,
}) {
  if (type === 'LOADING') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', padding: '1rem' }} aria-busy="true" aria-label="Loading situation data">
        <div style={{ height: '32px', background: 'rgba(242, 238, 231, 0.06)', borderRadius: '4px', animation: 'pulse 1.5s infinite' }} />
        <div style={{ height: '70px', background: 'rgba(242, 238, 231, 0.04)', borderRadius: '4px', animation: 'pulse 1.5s infinite' }} />
        <div style={{ height: '90px', background: 'rgba(242, 238, 231, 0.05)', borderRadius: '4px', animation: 'pulse 1.5s infinite' }} />
        <div style={{ height: '110px', background: 'rgba(242, 238, 231, 0.04)', borderRadius: '4px', animation: 'pulse 1.5s infinite' }} />
      </div>
    );
  }

  if (type === 'STALE') {
    return (
      <div
        style={{
          background: 'rgba(198, 154, 58, 0.1)',
          border: '1px solid rgba(198, 154, 58, 0.3)',
          borderRadius: '4px',
          padding: '0.65rem 0.85rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: '0.7rem',
          color: '#C69A3A',
        }}
        role="status"
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
          <span>⚠️</span>
          <span>DATA STALE · {message || 'Last updated 18 min ago'}</span>
        </div>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            style={{
              background: 'transparent',
              border: '1px solid #C69A3A',
              color: '#C69A3A',
              borderRadius: '3px',
              padding: '2px 6px',
              fontSize: '0.62rem',
              cursor: 'pointer',
            }}
          >
            REFRESH
          </button>
        )}
      </div>
    );
  }

  if (type === 'OFFLINE') {
    return (
      <div
        style={{
          background: 'rgba(200, 74, 58, 0.1)',
          border: '1px solid rgba(200, 74, 58, 0.35)',
          borderRadius: '4px',
          padding: '0.75rem 0.85rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.35rem',
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: '0.72rem',
          color: '#C84A3A',
        }}
        role="alert"
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontWeight: 800 }}>
          <Icon name="wifi-off" size={14} color="#C84A3A" />
          <span>NETWORK OFFLINE · CACHED TELEMETRY ACTIVE</span>
        </div>
        <span style={{ fontSize: '0.65rem', color: '#A49F93' }}>
          Local emergency protocols, offline maps, and cached shelter coordinates remain available.
        </span>
      </div>
    );
  }

  if (type === 'NO_LOCATION') {
    return (
      <div
        style={{
          background: '#191714',
          border: '1px solid rgba(242, 238, 231, 0.1)',
          borderRadius: '6px',
          padding: '1.25rem',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.65rem',
        }}
      >
        <Icon name="map-pin" size={24} color="#D96B35" />
        <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#F7F4ED' }}>
          Location Permission Denied or Unavailable
        </span>
        <p style={{ fontSize: '0.78rem', color: '#A49F93', margin: 0, lineHeight: 1.4 }}>
          Operating in manual operational sector mode. Selected default: Chandigarh Metro.
        </p>
        {onPickCity && (
          <button
            type="button"
            onClick={onPickCity}
            style={{
              background: 'rgba(217, 107, 53, 0.15)',
              border: '1px solid #D96B35',
              borderRadius: '4px',
              color: '#D96B35',
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '0.72rem',
              fontWeight: 700,
              padding: '0.5rem 1rem',
              cursor: 'pointer',
              marginTop: '0.35rem',
            }}
          >
            SWITCH OPERATIONAL CITY
          </button>
        )}
      </div>
    );
  }

  if (type === 'ERROR') {
    return (
      <div
        style={{
          background: '#191714',
          border: '1px solid rgba(200, 74, 58, 0.3)',
          borderRadius: '6px',
          padding: '1.25rem',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.65rem',
        }}
        role="alert"
      >
        <Icon name="alert-triangle" size={24} color="#C84A3A" />
        <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#F7F4ED' }}>
          Telemetry Feed Disrupted
        </span>
        <p style={{ fontSize: '0.78rem', color: '#A49F93', margin: 0, lineHeight: 1.4 }}>
          {message || 'Unable to sync with central emergency node. Cached mesh data is being served.'}
        </p>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            style={{
              background: '#C84A3A',
              border: 'none',
              borderRadius: '4px',
              color: '#FFFFFF',
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '0.72rem',
              fontWeight: 700,
              padding: '0.5rem 1rem',
              cursor: 'pointer',
              marginTop: '0.35rem',
            }}
          >
            RETRY SYNC
          </button>
        )}
      </div>
    );
  }

  // EMPTY
  return (
    <div
      style={{
        background: '#191714',
        border: '1px solid rgba(94, 139, 104, 0.25)',
        borderRadius: '6px',
        padding: '1.25rem',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '0.55rem',
      }}
    >
      <Icon name="shield-check" size={24} color="#5E8B68" />
      <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#F7F4ED' }}>
        Normal Operational Posture
      </span>
      <p style={{ fontSize: '0.78rem', color: '#A49F93', margin: 0 }}>
        {message || 'No critical emergency signals or flash flood warnings active in this sector.'}
      </p>
    </div>
  );
}
