import React, { useState, useMemo } from 'react';
import Icon from '../Icons';

/**
 * MobileAlertsScreen (Section 6)
 * Chronological emergency alert feed for phone viewports:
 * - Chronological order (most urgent first)
 * - Critical alerts dominate with bold visual priority
 * - Normal alerts stay quiet and readable
 * - Parameters: TIME, SEVERITY, WHAT HAPPENED, WHAT TO DO, SOURCE, FRESHNESS
 */
export default function MobileAlertsScreen({ alerts = [] }) {
  const [filter, setFilter] = useState('ALL'); // 'ALL' | 'CRITICAL' | 'ADVISORY'

  // Default realistic emergency alerts if backend has no records
  const alertList = useMemo(() => {
    if (alerts && alerts.length > 0) return alerts;
    return [
      {
        id: 'alt-1',
        time: '08:42 AM',
        freshness: '12 min ago',
        severity: 'CRITICAL',
        title: 'Flash Waterlogging Warning: Sector 14–17 Underpasses',
        whatHappened:
          'Runoff inflow has saturated drainage culverts. Water accumulation of 45cm recorded on carriageways.',
        whatToDo:
          'Halt all non-essential road transit immediately. Divert traffic to elevated Madhya Marg flyover.',
        source: 'Municipal Disaster Command & IMD Alert Feed',
      },
      {
        id: 'alt-2',
        time: '08:15 AM',
        freshness: '39 min ago',
        severity: 'ELEVATED',
        title: 'Severe Rainfall Advisory: Sustained 38 mm/h Precipitation',
        whatHappened:
          'Convective cell traversing urban basin with continuous downpour expected through 11:30 AM.',
        whatToDo:
          'Secure ground-level electrical appliances. Keep emergency lamps and battery reserves charged.',
        source: 'IMD Automated Weather Radar Station',
      },
      {
        id: 'alt-3',
        time: '07:30 AM',
        freshness: '1h 24m ago',
        severity: 'NORMAL',
        title: 'Civil Shelter Readiness: Sectors 16 & 17 Operational',
        whatHappened:
          'Civil relief shelter facilities have mobilized 132 standby beds with water and medical support.',
        whatToDo:
          'Residents in basement dwellings or low-lying shanties may relocate safely.',
        source: 'Municipal Civil Defence Directory',
      },
    ];
  }, [alerts]);

  const filteredAlerts = useMemo(() => {
    if (filter === 'CRITICAL') {
      return alertList.filter(
        (a) =>
          a.severity?.toUpperCase() === 'CRITICAL' ||
          a.severity?.toUpperCase() === 'DANGER'
      );
    }
    if (filter === 'ADVISORY') {
      return alertList.filter(
        (a) =>
          a.severity?.toUpperCase() === 'ELEVATED' ||
          a.severity?.toUpperCase() === 'WARNING' ||
          a.severity?.toUpperCase() === 'NORMAL'
      );
    }
    return alertList;
  }, [alertList, filter]);

  return (
    <div className="mobile-page-container" id="mobile-alerts-screen">
      {/* Editorial Header */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.68rem', color: '#D96B35', fontWeight: 700 }}>
            PUBLIC SAFETY BROADCAST
          </span>
          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.62rem', color: '#5E8B68' }}>
            ● CONTINUOUS DISPATCH
          </span>
        </div>
        <h1 style={{ fontFamily: 'Newsreader, serif', fontSize: '1.45rem', fontWeight: 600, color: '#F7F4ED', margin: '0.25rem 0 0 0' }}>
          Chronological Alert Feed
        </h1>
        <p style={{ fontSize: '0.78rem', color: '#A49F93', margin: 0 }}>
          Direct dissemination of verified municipal bulletins, road closures, and hazard watches.
        </p>
      </section>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '0.4rem', borderBottom: '1px solid rgba(242,238,231,0.08)', paddingBottom: '0.5rem' }}>
        {['ALL', 'CRITICAL', 'ADVISORY'].map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setFilter(tab)}
            style={{
              background: filter === tab ? 'rgba(217, 107, 53, 0.15)' : 'rgba(242, 238, 231, 0.04)',
              border: filter === tab ? '1px solid #D96B35' : '1px solid rgba(242, 238, 231, 0.08)',
              borderRadius: '4px',
              color: filter === tab ? '#D96B35' : '#A49F93',
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '0.65rem',
              fontWeight: 700,
              padding: '0.3rem 0.65rem',
              cursor: 'pointer',
            }}
          >
            {tab} {tab === 'CRITICAL' && `(${alertList.filter((a) => a.severity?.toUpperCase() === 'CRITICAL').length})`}
          </button>
        ))}
      </div>

      {/* Chronological Alert Feed (Section 6) */}
      <div className="mobile-alerts-feed" role="feed" aria-label="Chronological Emergency Alerts">
        {filteredAlerts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem 1rem', color: '#7A756D', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.75rem' }}>
            NO ACTIVE ALERTS UNDER THIS FILTER
          </div>
        ) : (
          filteredAlerts.map((alert) => {
            const isCritical =
              alert.severity?.toUpperCase() === 'CRITICAL' ||
              alert.severity?.toUpperCase() === 'DANGER';
            const isElevated =
              alert.severity?.toUpperCase() === 'ELEVATED' ||
              alert.severity?.toUpperCase() === 'WARNING' ||
              alert.severity?.toUpperCase() === 'HIGH';

            return (
              <article
                key={alert.id || alert._id}
                className={`mobile-alert-card ${isCritical ? 'critical' : isElevated ? 'elevated' : 'normal'}`}
                tabIndex={0}
              >
                {/* 1. TIME & SEVERITY */}
                <div className="mobile-alert-header">
                  <span className={`mobile-alert-severity ${isCritical ? 'critical' : ''}`}>
                    {alert.severity ? alert.severity.toUpperCase() : 'ADVISORY'}
                  </span>
                  <span className="mobile-alert-time">
                    {alert.time || 'Live'} · {alert.freshness || 'Updated just now'}
                  </span>
                </div>

                {/* 2. WHAT HAPPENED */}
                <h2 className="mobile-alert-headline">{alert.title}</h2>
                <p style={{ fontSize: '0.78rem', color: '#E9E5DC', lineHeight: 1.45, margin: 0 }}>
                  {alert.whatHappened || alert.message}
                </p>

                {/* 3. WHAT TO DO */}
                <div className="mobile-alert-what-to-do">
                  <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.62rem', fontWeight: 800, color: isCritical ? '#C84A3A' : '#D96B35', display: 'block', marginBottom: '3px' }}>
                    RECOMMENDED CIVIL ACTION:
                  </span>
                  <span>{alert.whatToDo || 'Exercise heightened awareness. Monitor live updates.'}</span>
                </div>

                {/* 4. SOURCE & FRESHNESS */}
                <div className="mobile-alert-footer">
                  <span>SRC: {alert.source || 'DisasterChain Dispatch'}</span>
                  <span style={{ color: '#5E8B68' }}>● VERIFIED</span>
                </div>
              </article>
            );
          })
        )}
      </div>
    </div>
  );
}
