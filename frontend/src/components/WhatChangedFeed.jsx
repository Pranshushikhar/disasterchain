import React, { useState } from 'react';
import SourceBadge from './SourceBadge';

/**
 * DISASTERCHAIN "WHAT CHANGED" OPERATIONAL ENGINE
 * Chronological operations activity stream tracking real-time triage events.
 */
export const DEFAULT_OPERATIONAL_LOGS = [
  {
    id: 'log-1018',
    time: '10:18',
    title: 'WeatherGPT updated local tactical assessment',
    category: 'Weather',
    severity: 'Medium',
    location: 'Delhi Metro Region',
    affectedArea: 'North & East Quadrants',
    source: 'DisasterChain WeatherGPT',
    confidence: 'High',
    isDemo: true,
    details: 'Precipitation trajectory updated to 2.4 mm/hr; drainage basin model reports stabilized outflow.',
  },
  {
    id: 'log-1012',
    time: '10:12',
    title: 'Civil Shelter #4 occupancy reached 74%',
    category: 'Logistics',
    severity: 'Low',
    location: 'Rohini Sector 9',
    affectedArea: 'Sector 9 & 10 Community Hall',
    source: 'Municipal Facility Telemetry (Simulated)',
    confidence: 'High',
    isDemo: true,
    details: '26 capacity slots remaining. Supplemental water and medical kits confirmed on site.',
  },
  {
    id: 'log-1003',
    time: '10:03',
    title: 'Roadway disruption: standing water on Ring Road Underpass',
    category: 'Hazard',
    severity: 'High',
    location: 'Ring Road Bypass / Junction 4',
    affectedArea: 'Southbound 2 lanes closed',
    source: 'Traffic Sensor Node (Simulated)',
    confidence: 'High',
    isDemo: true,
    details: 'Depth measured at 38cm. Traffic diversion active via Outer Flyover.',
  },
  {
    id: 'log-0951',
    time: '09:51',
    title: 'Low-lying zone crossed initial waterlogging threshold',
    category: 'Hazard',
    severity: 'High',
    location: 'Sector 14 Basin',
    affectedArea: 'Low-lying residential perimeter',
    source: 'Drainage Depth Sensor (Simulated)',
    confidence: 'High',
    isDemo: true,
    details: 'Runoff velocity 1.8 m/s. Pumping station #2 engaged automatically.',
  },
  {
    id: 'log-0942',
    time: '09:42',
    title: 'Precipitation rate elevated to 8.2 mm/hr',
    category: 'Weather',
    severity: 'Medium',
    location: 'Safdarjung Station',
    affectedArea: 'Central Delhi',
    source: 'Open-Meteo High-Res Model',
    confidence: 'High',
    isDemo: true,
    details: 'Cloud deck base at 420m; convective cell moving northeast at 16 km/h.',
  },
];

export default function WhatChangedFeed({
  events = DEFAULT_OPERATIONAL_LOGS,
  maxItems = 8,
  compact = false,
}) {
  const [expandedId, setExpandedId] = useState(null);
  const [filterCategory, setFilterCategory] = useState('ALL');

  const filteredEvents = events.filter((ev) => {
    if (filterCategory === 'ALL') return true;
    return ev.category.toUpperCase() === filterCategory.toUpperCase();
  });

  const displayList = filteredEvents.slice(0, maxItems);

  const toggleExpand = (id) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const getSeverityStyle = (sev) => {
    switch (sev?.toLowerCase()) {
      case 'critical':
      case 'high':
        return { color: '#D66A35', dot: '#D66A35', border: 'rgba(214, 106, 53, 0.4)' };
      case 'medium':
        return { color: '#C69A3A', dot: '#C69A3A', border: 'rgba(198, 154, 58, 0.3)' };
      default:
        return { color: '#5E8B68', dot: '#5E8B68', border: 'rgba(94, 139, 104, 0.3)' };
    }
  };

  return (
    <div className={`dc-what-changed-surface ${compact ? 'compact' : ''}`} role="region" aria-label="What Changed Operations Feed">
      {/* Header */}
      <div className="dc-feed-header">
        <div className="dc-feed-title-block">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
            <span className="dc-feed-super">OPERATIONAL TIMELINE</span>
            <span style={{ fontSize: '0.62rem', padding: '0.08rem 0.35rem', background: 'rgba(198, 154, 58, 0.12)', color: '#C69A3A', border: '1px solid rgba(198, 154, 58, 0.25)', borderRadius: '2px', fontFamily: 'var(--font-mono, monospace)', fontWeight: 700 }}>
              SIMULATED LOGS
            </span>
          </div>
          <h3 className="dc-feed-heading">WHAT CHANGED</h3>
        </div>

        {/* Filter Pills */}
        <div className="dc-feed-filters" role="tablist">
          {['ALL', 'HAZARD', 'WEATHER', 'LOGISTICS'].map((cat) => (
            <button
              key={cat}
              type="button"
              className={`dc-filter-btn ${filterCategory === cat ? 'active' : ''}`}
              onClick={() => setFilterCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Chronological Stream */}
      <div className="dc-feed-stream">
        {displayList.length === 0 ? (
          <div className="dc-feed-empty">
            <span className="empty-sub">NO NOTABLE EVENTS</span>
            <p className="empty-p">No operational delta recorded in this filter window.</p>
          </div>
        ) : (
          displayList.map((ev) => {
            const isExpanded = expandedId === ev.id;
            const style = getSeverityStyle(ev.severity);

            return (
              <div
                key={ev.id}
                className={`dc-feed-row ${isExpanded ? 'expanded' : ''}`}
                onClick={() => toggleExpand(ev.id)}
              >
                {/* Time & Dot Track */}
                <div className="dc-row-meta">
                  <span className="dc-row-time">{ev.time}</span>
                  <div className="dc-row-timeline">
                    <span className="dc-row-dot" style={{ backgroundColor: style.dot }} />
                    <span className="dc-row-line" />
                  </div>
                </div>

                {/* Event Content */}
                <div className="dc-row-body">
                  <div className="dc-row-headline-bar">
                    <span className="dc-row-title">{ev.title}</span>
                    <span className="dc-row-category">{ev.category.toUpperCase()}</span>
                  </div>

                  <div className="dc-row-location-bar">
                    <span className="location-item">{ev.location}</span>
                    {ev.affectedArea && (
                      <>
                        <span className="loc-sep">·</span>
                        <span className="area-item">{ev.affectedArea}</span>
                      </>
                    )}
                  </div>

                  {/* Expandable Details Drawer */}
                  {isExpanded && (
                    <div className="dc-row-drawer">
                      <p className="drawer-desc">{ev.details}</p>
                      <div className="drawer-meta-row">
                        <SourceBadge
                          source={ev.source}
                          confidence={ev.confidence}
                          updatedAt={`Triage ${ev.time}`}
                          isDemo={ev.isDemo}
                          compact={true}
                        />
                        <span className="drawer-sev-badge" style={{ borderColor: style.border, color: style.color }}>
                          SEVERITY: {ev.severity.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      <style>{`
        .dc-what-changed-surface {
          background: #121413;
          border: 1px solid rgba(242, 238, 231, 0.08);
          border-radius: 4px;
          padding: 1.15rem;
          color: #E9E5DC;
          font-family: var(--font-sans, -apple-system, sans-serif);
        }

        .dc-feed-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 0.75rem;
          border-bottom: 1px solid rgba(242, 238, 231, 0.08);
          padding-bottom: 0.75rem;
          margin-bottom: 0.85rem;
        }

        .dc-feed-super {
          display: block;
          font-family: var(--font-mono, monospace);
          font-size: 0.65rem;
          font-weight: 700;
          letter-spacing: 0.12em;
          color: #D66A35;
          margin-bottom: 0.15rem;
        }

        .dc-feed-heading {
          font-size: 1.1rem;
          font-weight: 600;
          color: #F7F4ED;
          margin: 0;
          letter-spacing: -0.01em;
        }

        .dc-feed-filters {
          display: flex;
          gap: 0.3rem;
        }

        .dc-filter-btn {
          background: transparent;
          border: 1px solid rgba(242, 238, 231, 0.1);
          color: #A49F93;
          font-family: var(--font-mono, monospace);
          font-size: 0.65rem;
          padding: 0.2rem 0.5rem;
          border-radius: 2px;
          cursor: pointer;
          transition: all 0.12s ease;
        }

        .dc-filter-btn:hover {
          color: #F7F4ED;
          border-color: rgba(242, 238, 231, 0.25);
        }

        .dc-filter-btn.active {
          background: rgba(214, 106, 53, 0.12);
          color: #D66A35;
          border-color: #D66A35;
          font-weight: 700;
        }

        /* Stream */
        .dc-feed-stream {
          display: flex;
          flex-direction: column;
          gap: 0;
        }

        .dc-feed-row {
          display: flex;
          gap: 0.85rem;
          padding: 0.65rem 0.35rem;
          border-radius: 3px;
          cursor: pointer;
          transition: background 0.12s ease;
        }

        .dc-feed-row:hover {
          background: rgba(242, 238, 231, 0.025);
        }

        .dc-feed-row.expanded {
          background: rgba(24, 26, 24, 0.6);
        }

        .dc-row-meta {
          display: flex;
          gap: 0.5rem;
          align-items: flex-start;
          width: 58px;
          flex-shrink: 0;
        }

        .dc-row-time {
          font-family: var(--font-mono, monospace);
          font-size: 0.72rem;
          font-weight: 600;
          color: #E9E5DC;
          line-height: 1.3;
        }

        .dc-row-timeline {
          display: flex;
          flex-direction: column;
          align-items: center;
          height: 100%;
          padding-top: 4px;
        }

        .dc-row-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          flex-shrink: 0;
        }

        .dc-row-line {
          width: 1px;
          flex: 1;
          background: rgba(242, 238, 231, 0.08);
          margin-top: 4px;
          min-height: 18px;
        }

        .dc-row-body {
          flex: 1;
          min-width: 0;
        }

        .dc-row-headline-bar {
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          gap: 0.5rem;
          margin-bottom: 0.2rem;
        }

        .dc-row-title {
          font-size: 0.85rem;
          font-weight: 500;
          color: #F7F4ED;
          line-height: 1.35;
        }

        .dc-row-category {
          font-family: var(--font-mono, monospace);
          font-size: 0.6rem;
          color: #7A756D;
          flex-shrink: 0;
          letter-spacing: 0.06em;
        }

        .dc-row-location-bar {
          font-size: 0.72rem;
          color: #A49F93;
          display: flex;
          align-items: center;
          gap: 0.35rem;
        }

        .loc-sep {
          color: rgba(242, 238, 231, 0.2);
        }

        .dc-row-drawer {
          margin-top: 0.55rem;
          padding: 0.55rem;
          background: #181A18;
          border: 1px solid rgba(242, 238, 231, 0.08);
          border-radius: 3px;
          animation: drawerIn 0.15s ease-out;
        }

        .drawer-desc {
          font-size: 0.76rem;
          line-height: 1.4;
          color: #E9E5DC;
          margin: 0 0 0.45rem 0;
        }

        .drawer-meta-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 0.4rem;
        }

        .drawer-sev-badge {
          font-family: var(--font-mono, monospace);
          font-size: 0.6rem;
          font-weight: 700;
          letter-spacing: 0.06em;
          padding: 0.1rem 0.35rem;
          border: 1px solid;
          border-radius: 2px;
        }

        .dc-feed-empty {
          padding: 1.5rem;
          text-align: center;
        }

        .empty-sub {
          font-family: var(--font-mono, monospace);
          font-size: 0.68rem;
          font-weight: 700;
          color: #7A756D;
          letter-spacing: 0.1em;
        }

        .empty-p {
          font-size: 0.76rem;
          color: #A49F93;
          margin-top: 0.35rem;
        }

        @keyframes drawerIn {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
