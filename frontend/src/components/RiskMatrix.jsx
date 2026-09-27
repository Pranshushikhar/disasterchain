import React, { useState } from 'react';
import SourceBadge from './SourceBadge';

/**
 * DISASTERCHAIN RISK ENGINE & MATRIX
 * Visual Likelihood × Impact decision surface for multi-hazard operational triage.
 */
export const DEFAULT_RISK_FACTORS = [
  {
    id: 'flood',
    name: 'Flood & Waterlogging',
    likelihood: 3, // 1 to 4: Unlikely, Possible, Likely, Highly Likely
    impact: 3,     // 1 to 4: Minor, Moderate, Severe, Catastrophic
    level: 'Orange',
    levelLabel: 'ELEVATED RISK',
    horizon: 'Next 3–6 Hours',
    zone: 'Low-lying drainage basins / Sector 14–17',
    reason: 'Sustained precipitation exceeds local culvert absorption capacity by 34%.',
    action: 'Avoid basement underpasses. Relocate non-perishable assets to upper ground.',
    confidence: 'Moderate',
    updatedAt: '4m ago',
  },
  {
    id: 'road',
    name: 'Road Disruption',
    likelihood: 3,
    impact: 2,
    level: 'Yellow',
    levelLabel: 'MODERATE ADVISORY',
    horizon: 'Immediate (Next 1–2 Hours)',
    zone: 'Arterial Ring Road & Metro Concourse',
    reason: 'Traffic velocity reduced by 48% due to localized standing water.',
    action: 'Use elevated transit bypass or defer non-emergency transit.',
    confidence: 'High',
    updatedAt: '6m ago',
  },
  {
    id: 'air',
    name: 'Air Quality Stagnation',
    likelihood: 2,
    impact: 2,
    level: 'Yellow',
    levelLabel: 'MODERATE ADVISORY',
    horizon: 'Evening 20:00–02:00',
    zone: 'Metro Urban Core',
    reason: 'Surface temperature inversion capturing fine particulate PM2.5 (AQI 68).',
    action: 'Vulnerable respiratory cohorts should minimize sustained outdoor exertion.',
    confidence: 'High',
    updatedAt: '12m ago',
  },
  {
    id: 'wind',
    name: 'Convective Wind Gusts',
    likelihood: 1,
    impact: 2,
    level: 'Green',
    levelLabel: 'STABLE / LOW',
    horizon: 'Next 12 Hours',
    zone: 'Open perimeter corridors',
    reason: 'Anemometer telemetry peaks at 18 km/h, well below structural thresholds.',
    action: 'Normal baseline operations maintained.',
    confidence: 'High',
    updatedAt: '8m ago',
  },
  {
    id: 'lightning',
    name: 'Severe Lightning',
    likelihood: 1,
    impact: 3,
    level: 'Green',
    levelLabel: 'STABLE / LOW',
    horizon: 'Next 24 Hours',
    zone: 'District Wide',
    reason: 'Atmospheric instability index CAPE < 400 J/kg; low electrical discharge probability.',
    action: 'No lightning shelter protocols required currently.',
    confidence: 'High',
    updatedAt: '15m ago',
  },
];

export default function RiskMatrix({ risks = DEFAULT_RISK_FACTORS, onSelectRisk }) {
  const [activeRiskId, setActiveRiskId] = useState(risks[0]?.id || 'flood');
  const activeRisk = risks.find((r) => r.id === activeRiskId) || risks[0];

  const getCellColor = (l, i) => {
    const score = l * i;
    if (score >= 9) return { bg: 'rgba(200, 74, 58, 0.22)', border: '#C84A3A', text: '#D84D3F' }; // Red
    if (score >= 6) return { bg: 'rgba(214, 106, 53, 0.22)', border: '#D66A35', text: '#E58A58' }; // Orange
    if (score >= 3) return { bg: 'rgba(198, 154, 58, 0.16)', border: '#C69A3A', text: '#C69A3A' }; // Yellow
    return { bg: 'rgba(94, 139, 104, 0.12)', border: '#5E8B68', text: '#5E8B68' }; // Green
  };

  return (
    <div className="dc-risk-engine-surface" role="region" aria-label="DisasterChain Risk Assessment Matrix">
      {/* Editorial Header */}
      <div className="dc-risk-header">
        <div className="dc-risk-title-row">
          <span className="dc-risk-super">OPERATIONAL RISK ENGINE</span>
          <SourceBadge
            source="DisasterChain Assessment"
            confidence="Moderate"
            updatedAt="Live model"
            methodology="Multi-hazard deterministic assessment combining weather telemetry, elevation topology, and municipal incident feeds. Not an official government warning."
          />
        </div>
        <h3 className="dc-risk-heading">Likelihood × Impact Triage Model</h3>
        <p className="dc-risk-subtext">
          Hazard prioritization calibrated across regional civil defense dimensions. Select an active factor below for tactical assessment.
        </p>
      </div>

      {/* Main Split Layout: Matrix Grid (Left) & Risk Profile Inspector (Right) */}
      <div className="dc-risk-body">
        
        {/* Visual 4x4 Matrix Grid */}
        <div className="dc-matrix-container">
          <div className="dc-matrix-axis-y">
            <span className="axis-label">LIKELIHOOD →</span>
          </div>

          <div className="dc-matrix-grid-wrap">
            <div className="dc-matrix-grid">
              {[4, 3, 2, 1].map((likelihoodRow) => (
                <div key={likelihoodRow} className="dc-matrix-row">
                  {[1, 2, 3, 4].map((impactCol) => {
                    const cellStyle = getCellColor(likelihoodRow, impactCol);
                    const matchingRisks = risks.filter(
                      (r) => r.likelihood === likelihoodRow && r.impact === impactCol
                    );

                    return (
                      <div
                        key={impactCol}
                        className={`dc-matrix-cell ${matchingRisks.length > 0 ? 'has-risk' : ''}`}
                        style={{
                          backgroundColor: cellStyle.bg,
                          borderColor: cellStyle.border,
                        }}
                      >
                        {matchingRisks.map((r) => (
                          <button
                            key={r.id}
                            type="button"
                            className={`dc-risk-marker ${r.id === activeRiskId ? 'active' : ''}`}
                            onClick={() => {
                              setActiveRiskId(r.id);
                              if (onSelectRisk) onSelectRisk(r);
                            }}
                            title={`${r.name} (${r.levelLabel})`}
                          >
                            <span className="marker-name">{r.name.split(' ')[0]}</span>
                          </button>
                        ))}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
            
            <div className="dc-matrix-axis-x">
              <span className="axis-label">IMPACT / SEVERITY →</span>
            </div>
          </div>
        </div>

        {/* Selected Risk Inspection Inspector */}
        <div className="dc-risk-inspector">
          {activeRisk && (
            <div className="inspector-content">
              <div className="inspector-badge-row">
                <span
                  className="inspector-level"
                  style={{
                    color: activeRisk.level === 'Red' ? '#C84A3A' : activeRisk.level === 'Orange' ? '#D66A35' : activeRisk.level === 'Yellow' ? '#C69A3A' : '#5E8B68',
                    borderColor: activeRisk.level === 'Red' ? '#C84A3A' : activeRisk.level === 'Orange' ? '#D66A35' : activeRisk.level === 'Yellow' ? '#C69A3A' : '#5E8B68',
                  }}
                >
                  {activeRisk.levelLabel}
                </span>
                <span className="inspector-horizon">{activeRisk.horizon}</span>
              </div>

              <h4 className="inspector-title">{activeRisk.name}</h4>
              
              <div className="inspector-zone-row">
                <span className="zone-label">AFFECTED SECTOR:</span>
                <span className="zone-val">{activeRisk.zone}</span>
              </div>

              <div className="inspector-box reason">
                <div className="box-title">WHY THIS ASSESSMENT</div>
                <p className="box-text">{activeRisk.reason}</p>
              </div>

              <div className="inspector-box action">
                <div className="box-title">OPERATIONAL RECOMMENDATION</div>
                <p className="box-text">{activeRisk.action}</p>
              </div>

              {/* Selector Pills to Switch Risks */}
              <div className="inspector-pills">
                <span className="pills-label">EXAMINE HAZARD:</span>
                <div className="pills-list">
                  {risks.map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      className={`risk-pill-btn ${r.id === activeRiskId ? 'active' : ''}`}
                      onClick={() => {
                        setActiveRiskId(r.id);
                        if (onSelectRisk) onSelectRisk(r);
                      }}
                    >
                      {r.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .dc-risk-engine-surface {
          background: #121413;
          border: 1px solid rgba(242, 238, 231, 0.08);
          border-radius: 4px;
          padding: 1.25rem;
          color: #E9E5DC;
          font-family: var(--font-sans, -apple-system, sans-serif);
        }

        .dc-risk-header {
          border-bottom: 1px solid rgba(242, 238, 231, 0.08);
          padding-bottom: 0.85rem;
          margin-bottom: 1.15rem;
        }

        .dc-risk-title-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin-bottom: 0.35rem;
        }

        .dc-risk-super {
          font-family: var(--font-mono, "JetBrains Mono", monospace);
          font-size: 0.68rem;
          font-weight: 700;
          letter-spacing: 0.12em;
          color: #D66A35;
        }

        .dc-risk-heading {
          font-size: 1.15rem;
          font-weight: 600;
          color: #F7F4ED;
          margin: 0 0 0.35rem 0;
        }

        .dc-risk-subtext {
          font-size: 0.78rem;
          color: #A49F93;
          line-height: 1.4;
          margin: 0;
        }

        .dc-risk-body {
          display: grid;
          grid-template-columns: 240px 1fr;
          gap: 1.5rem;
          align-items: start;
        }

        @media (max-width: 768px) {
          .dc-risk-body {
            grid-template-columns: 1fr;
            gap: 1.25rem;
          }
        }

        /* Matrix Visualization */
        .dc-matrix-container {
          display: flex;
          gap: 0.4rem;
        }

        .dc-matrix-axis-y {
          writing-mode: vertical-lr;
          transform: rotate(180deg);
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: var(--font-mono, monospace);
          font-size: 0.6rem;
          color: #7A756D;
          letter-spacing: 0.1em;
        }

        .dc-matrix-grid-wrap {
          flex: 1;
        }

        .dc-matrix-grid {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .dc-matrix-row {
          display: flex;
          gap: 4px;
        }

        .dc-matrix-cell {
          flex: 1;
          height: 48px;
          border: 1px solid rgba(242, 238, 231, 0.08);
          border-radius: 2px;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          transition: all 0.15s ease;
        }

        .dc-matrix-cell.has-risk {
          border-width: 1.5px;
        }

        .dc-matrix-axis-x {
          text-align: center;
          margin-top: 0.4rem;
          font-family: var(--font-mono, monospace);
          font-size: 0.6rem;
          color: #7A756D;
          letter-spacing: 0.1em;
        }

        .dc-risk-marker {
          background: #181A18;
          border: 1px solid rgba(242, 238, 231, 0.25);
          color: #F7F4ED;
          font-family: var(--font-mono, monospace);
          font-size: 0.62rem;
          font-weight: 600;
          padding: 0.2rem 0.35rem;
          border-radius: 2px;
          cursor: pointer;
          transition: all 0.12s ease;
        }

        .dc-risk-marker:hover,
        .dc-risk-marker.active {
          background: #D66A35;
          color: #121413;
          border-color: #D66A35;
          font-weight: 700;
        }

        /* Inspector Details */
        .dc-risk-inspector {
          background: #181A18;
          border: 1px solid rgba(242, 238, 231, 0.08);
          border-radius: 3px;
          padding: 1rem;
        }

        .inspector-badge-row {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          margin-bottom: 0.45rem;
        }

        .inspector-level {
          font-family: var(--font-mono, monospace);
          font-size: 0.65rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          padding: 0.15rem 0.45rem;
          border: 1px solid currentColor;
          border-radius: 2px;
        }

        .inspector-horizon {
          font-family: var(--font-mono, monospace);
          font-size: 0.68rem;
          color: #A49F93;
        }

        .inspector-title {
          font-size: 1.05rem;
          font-weight: 600;
          color: #F7F4ED;
          margin: 0 0 0.5rem 0;
        }

        .inspector-zone-row {
          font-size: 0.74rem;
          margin-bottom: 0.75rem;
          display: flex;
          gap: 0.4rem;
        }

        .zone-label {
          font-family: var(--font-mono, monospace);
          font-size: 0.65rem;
          color: #7A756D;
        }

        .zone-val {
          color: #E9E5DC;
          font-weight: 500;
        }

        .inspector-box {
          border-radius: 3px;
          padding: 0.65rem;
          margin-bottom: 0.6rem;
          border-left: 2px solid #557C91;
          background: rgba(85, 124, 145, 0.05);
        }

        .inspector-box.action {
          border-left-color: #D66A35;
          background: rgba(214, 106, 53, 0.06);
        }

        .box-title {
          font-family: var(--font-mono, monospace);
          font-size: 0.62rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          color: #A49F93;
          margin-bottom: 0.25rem;
        }

        .inspector-box.action .box-title {
          color: #D66A35;
        }

        .box-text {
          font-size: 0.78rem;
          line-height: 1.35;
          color: #F7F4ED;
          margin: 0;
        }

        .inspector-pills {
          border-top: 1px solid rgba(242, 238, 231, 0.08);
          padding-top: 0.65rem;
          margin-top: 0.65rem;
        }

        .pills-label {
          display: block;
          font-family: var(--font-mono, monospace);
          font-size: 0.62rem;
          color: #7A756D;
          margin-bottom: 0.35rem;
        }

        .pills-list {
          display: flex;
          flex-wrap: wrap;
          gap: 0.35rem;
        }

        .risk-pill-btn {
          background: transparent;
          border: 1px solid rgba(242, 238, 231, 0.12);
          color: #A49F93;
          font-size: 0.7rem;
          padding: 0.2rem 0.45rem;
          border-radius: 2px;
          cursor: pointer;
          transition: all 0.12s ease;
        }

        .risk-pill-btn:hover {
          color: #F7F4ED;
          border-color: rgba(242, 238, 231, 0.3);
        }

        .risk-pill-btn.active {
          background: rgba(214, 106, 53, 0.15);
          color: #D66A35;
          border-color: #D66A35;
          font-weight: 600;
        }
      `}</style>
    </div>
  );
}
