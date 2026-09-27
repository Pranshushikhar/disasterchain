import React, { useState } from 'react';
import SourceBadge from './SourceBadge';

/**
 * DISASTERCHAIN PERSONAL SAFETY PANEL ("MY SAFETY")
 * Personalized multi-zone guardian with action-oriented "WHAT SHOULD I DO NOW?" guidance.
 */
export const DEFAULT_SAFETY_ZONES = [
  {
    id: 'home',
    label: 'HOME',
    address: 'Sector 14 Residential Block B',
    status: 'Elevated Risk',
    statusColor: '#D66A35',
    weather: '27°C · Heavy Rain 8.2mm/h · AQI 64',
    hazard: 'Waterlogging in adjacent street (22cm)',
    shelter: 'Civil Shelter #2 (Community Hall) · 450m',
    hospital: 'Metro District Hospital · 1.2km',
    actionSteps: [
      'Relocate power backups and critical documents above ground level.',
      'Check internal drain non-return valves to prevent backflow.',
      'Maintain cellular battery charge and keep emergency flashlight ready.',
    ],
  },
  {
    id: 'college',
    label: 'COLLEGE / CAMPUS',
    address: 'Engineering Campus / Main Quad',
    status: 'Moderate Advisory',
    statusColor: '#C69A3A',
    weather: '28°C · Moderate Rain 4.0mm/h · AQI 58',
    hazard: 'Standing water near Gate 3; underpass closed',
    shelter: 'Student Center Auditorium · On campus',
    hospital: 'Campus Health Center · 200m',
    actionSteps: [
      'Avoid lower quad walkways and basement parking structures.',
      'Follow campus security alerts via broadcast channels.',
      'Use the elevated covered walkway toward the north concourse.',
    ],
  },
  {
    id: 'work',
    label: 'WORK / OFFICE',
    address: 'Tech Park Tower 4, Sector 62',
    status: 'Stable',
    statusColor: '#5E8B68',
    weather: '28°C · Light Rain 1.5mm/h · AQI 52',
    hazard: 'No immediate perimeter disruptions',
    shelter: 'Tower 4 Lower Concourse · On site',
    hospital: 'Apollo Clinic Sector 62 · 800m',
    actionSteps: [
      'Normal operational posture.',
      'Monitor evening transit alerts before 17:00 departure.',
    ],
  },
  {
    id: 'travel',
    label: 'TRANSIT CORRIDOR',
    address: 'Metro Blue Line / Ring Road Expressway',
    status: 'Severe Disruption',
    statusColor: '#C84A3A',
    weather: '26°C · Torrential Rain 12.0mm/h · Visibility 1.2km',
    hazard: 'Underpass impassable; traffic diversion active',
    shelter: 'Metro Station Concourse · 300m',
    hospital: 'Trauma Center South · 2.4km',
    actionSteps: [
      'Do not attempt driving through standing water on flyover approach.',
      'Divert to elevated arterial ring bypass immediately.',
      'If stranded, stay inside vehicle unless water level reaches door frame.',
    ],
  },
];

export default function PersonalSafetyPanel({ onOpenSos }) {
  const [activeZoneId, setActiveZoneId] = useState('home');
  const activeZone = DEFAULT_SAFETY_ZONES.find((z) => z.id === activeZoneId) || DEFAULT_SAFETY_ZONES[0];

  return (
    <div className="dc-safety-surface" role="region" aria-label="My Safety Personal Guardian">
      {/* Editorial Header */}
      <div className="dc-safety-header">
        <div className="dc-safety-super-row">
          <span className="dc-safety-super">PERSONAL GUARDIAN</span>
          <SourceBadge
            source="DisasterChain Telemetry"
            confidence="High"
            updatedAt="Live feed"
            methodology="Tailored personal risk calculation matching your registered location against real-time municipal sensor readings."
          />
        </div>
        <h3 className="dc-safety-heading">MY SAFETY PROFILE</h3>

        {/* Location Zone Switcher */}
        <div className="dc-safety-zone-pills" role="tablist">
          {DEFAULT_SAFETY_ZONES.map((zone) => (
            <button
              key={zone.id}
              type="button"
              className={`dc-zone-pill-btn ${zone.id === activeZoneId ? 'active' : ''}`}
              onClick={() => setActiveZoneId(zone.id)}
            >
              <span className="zone-dot" style={{ backgroundColor: zone.statusColor }} />
              <span className="zone-name">{zone.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Selected Location Core Card */}
      <div className="dc-safety-content">
        <div className="safety-location-bar">
          <div className="loc-text-col">
            <span className="loc-title">{activeZone.address}</span>
            <span className="loc-weather">{activeZone.weather}</span>
          </div>
          <div className="loc-status-col">
            <span
              className="loc-status-pill"
              style={{
                color: activeZone.statusColor,
                borderColor: activeZone.statusColor,
                background: `${activeZone.statusColor}18`,
              }}
            >
              {activeZone.status.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Signature Action Section: WHAT SHOULD I DO NOW? */}
        <div className="dc-safety-action-box">
          <div className="action-box-header">
            <span className="action-box-icon">⚡</span>
            <span className="action-box-title">WHAT SHOULD I DO NOW?</span>
          </div>
          <ol className="action-steps-list">
            {activeZone.actionSteps.map((step, idx) => (
              <li key={idx} className="action-step-item">
                <span className="step-num">{idx + 1}</span>
                <span className="step-text">{step}</span>
              </li>
            ))}
          </ol>
        </div>

        {/* Quick Evacuation & Resource Linkages */}
        <div className="dc-safety-resources-grid">
          <div className="res-cell">
            <span className="res-cell-label">NEAREST SHELTER</span>
            <span className="res-cell-val">{activeZone.shelter}</span>
          </div>
          <div className="res-cell">
            <span className="res-cell-label">EMERGENCY MEDICAL</span>
            <span className="res-cell-val">{activeZone.hospital}</span>
          </div>
        </div>

        {/* Quick Action Footer */}
        <div className="dc-safety-footer">
          <button
            type="button"
            className="dc-safety-sos-btn"
            onClick={onOpenSos}
          >
            <span>SEND SOS FROM {activeZone.label}</span>
            <span className="btn-beacon" />
          </button>
        </div>
      </div>

      <style>{`
        .dc-safety-surface {
          background: #121413;
          border: 1px solid rgba(242, 238, 231, 0.08);
          border-radius: 4px;
          padding: 1.25rem;
          color: #E9E5DC;
          font-family: var(--font-sans, -apple-system, sans-serif);
        }

        .dc-safety-header {
          border-bottom: 1px solid rgba(242, 238, 231, 0.08);
          padding-bottom: 0.85rem;
          margin-bottom: 1rem;
        }

        .dc-safety-super-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin-bottom: 0.25rem;
        }

        .dc-safety-super {
          font-family: var(--font-mono, monospace);
          font-size: 0.65rem;
          font-weight: 700;
          letter-spacing: 0.12em;
          color: #D66A35;
        }

        .dc-safety-heading {
          font-size: 1.15rem;
          font-weight: 600;
          color: #F7F4ED;
          margin: 0 0 0.75rem 0;
        }

        .dc-safety-zone-pills {
          display: flex;
          flex-wrap: wrap;
          gap: 0.4rem;
        }

        .dc-zone-pill-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          background: #181A18;
          border: 1px solid rgba(242, 238, 231, 0.1);
          color: #A49F93;
          font-family: var(--font-mono, monospace);
          font-size: 0.65rem;
          padding: 0.25rem 0.6rem;
          border-radius: 2px;
          cursor: pointer;
          transition: all 0.12s ease;
        }

        .dc-zone-pill-btn:hover {
          color: #F7F4ED;
          border-color: rgba(242, 238, 231, 0.25);
        }

        .dc-zone-pill-btn.active {
          background: rgba(214, 106, 53, 0.12);
          color: #D66A35;
          border-color: #D66A35;
          font-weight: 700;
        }

        .zone-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
        }

        /* Content */
        .dc-safety-content {
          display: flex;
          flex-direction: column;
          gap: 0.85rem;
        }

        .safety-location-bar {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 0.75rem;
          background: #181A18;
          border: 1px solid rgba(242, 238, 231, 0.08);
          border-radius: 3px;
          padding: 0.75rem 0.95rem;
        }

        .loc-text-col {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .loc-title {
          font-size: 0.92rem;
          font-weight: 600;
          color: #F7F4ED;
        }

        .loc-weather {
          font-size: 0.74rem;
          color: #A49F93;
        }

        .loc-status-pill {
          font-family: var(--font-mono, monospace);
          font-size: 0.65rem;
          font-weight: 700;
          letter-spacing: 0.06em;
          padding: 0.2rem 0.5rem;
          border: 1px solid;
          border-radius: 2px;
        }

        /* WHAT TO DO BOX */
        .dc-safety-action-box {
          background: rgba(214, 106, 53, 0.06);
          border: 1px solid rgba(214, 106, 53, 0.25);
          border-left: 3px solid #D66A35;
          border-radius: 3px;
          padding: 0.85rem 1rem;
        }

        .action-box-header {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          margin-bottom: 0.65rem;
        }

        .action-box-icon {
          color: #D66A35;
          font-size: 0.9rem;
        }

        .action-box-title {
          font-family: var(--font-mono, monospace);
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          color: #D66A35;
        }

        .action-steps-list {
          margin: 0;
          padding: 0;
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 0.45rem;
        }

        .action-step-item {
          display: flex;
          align-items: baseline;
          gap: 0.5rem;
        }

        .step-num {
          font-family: var(--font-mono, monospace);
          font-size: 0.68rem;
          font-weight: 700;
          color: #D66A35;
          width: 14px;
        }

        .step-text {
          font-size: 0.82rem;
          color: #F7F4ED;
          line-height: 1.35;
        }

        /* Resources Grid */
        .dc-safety-resources-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.75rem;
        }

        @media (max-width: 600px) {
          .dc-safety-resources-grid {
            grid-template-columns: 1fr;
          }
        }

        .res-cell {
          background: #181A18;
          border: 1px solid rgba(242, 238, 231, 0.08);
          border-radius: 3px;
          padding: 0.65rem 0.85rem;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .res-cell-label {
          font-family: var(--font-mono, monospace);
          font-size: 0.6rem;
          color: #7A756D;
          letter-spacing: 0.06em;
        }

        .res-cell-val {
          font-size: 0.78rem;
          color: #E9E5DC;
          font-weight: 500;
        }

        /* SOS Button */
        .dc-safety-footer {
          margin-top: 0.25rem;
        }

        .dc-safety-sos-btn {
          width: 100%;
          background: #C84A3A;
          color: #FFF;
          border: none;
          border-radius: 3px;
          padding: 0.65rem 1rem;
          font-family: var(--font-mono, monospace);
          font-size: 0.74rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          cursor: pointer;
          transition: background 0.15s ease;
        }

        .dc-safety-sos-btn:hover {
          background: #D84D3F;
        }

        .btn-beacon {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #FFF;
          box-shadow: 0 0 8px rgba(255, 255, 255, 0.8);
        }
      `}</style>
    </div>
  );
}
