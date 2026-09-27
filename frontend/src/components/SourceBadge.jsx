import React, { useState } from 'react';

/**
 * DISASTERCHAIN SOURCE INTELLIGENCE & TRUST BADGE
 * Transparent provenance, confidence rating, and data freshness chip.
 */
export default function SourceBadge({
  source = 'DisasterChain assessment',
  confidence = 'High',
  updatedAt = '2m ago',
  isDemo = false,
  isOfficial = false,
  methodology = null,
  compact = false,
}) {
  const [showTooltip, setShowTooltip] = useState(false);

  const getSourceColor = () => {
    if (isDemo) return '#C69A3A'; // Yellow / Warning
    if (isOfficial) return '#5E8B68'; // Green / Verified
    return '#557C91'; // Atmospheric / Telemetry blue
  };

  const getConfidenceBadge = () => {
    switch (confidence?.toLowerCase()) {
      case 'high':
        return { label: 'CONF: HIGH', color: '#5E8B68' };
      case 'moderate':
        return { label: 'CONF: MOD', color: '#C69A3A' };
      case 'low':
        return { label: 'CONF: LOW', color: '#D66A35' };
      default:
        return { label: `CONF: ${confidence?.toUpperCase() || 'EST'}`, color: '#A49F93' };
    }
  };

  const confInfo = getConfidenceBadge();

  return (
    <div
      className={`dc-source-badge-wrap ${compact ? 'compact' : ''}`}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      role="region"
      aria-label="Source provenance and trust metadata"
    >
      <div className="dc-source-pill">
        <span
          className="dc-source-dot"
          style={{ backgroundColor: getSourceColor() }}
        />
        <span className="dc-source-label">
          {isDemo ? 'SAMPLE DATA' : source.toUpperCase()}
        </span>
        <span className="dc-source-divider">·</span>
        <span className="dc-source-conf" style={{ color: confInfo.color }}>
          {confInfo.label}
        </span>
        <span className="dc-source-divider">·</span>
        <span className="dc-source-time">{updatedAt}</span>
      </div>

      {showTooltip && (
        <div className="dc-source-popover" role="tooltip">
          <div className="popover-title">
            {isOfficial ? 'OFFICIAL EXTERNAL SIGNAL' : 'DISASTERCHAIN ASSESSMENT'}
          </div>
          <p className="popover-body">
            {methodology ||
              (isDemo
                ? 'Simulated environment event for operational rehearsal. Not a live civilian emergency signal.'
                : isOfficial
                ? 'Aggregated directly from authoritative external provider feeds.'
                : 'Synthesized by DisasterChain numerical telemetry and local sensory inputs.')}
          </p>
          <div className="popover-meta">
            <span>DisasterChain Confidence: {confidence}</span>
            <span>Refreshed: {updatedAt}</span>
            {isDemo && <span className="demo-tag">DEMO / NOT OFFICIAL</span>}
          </div>
        </div>
      )}

      <style>{`
        .dc-source-badge-wrap {
          position: relative;
          display: inline-flex;
          align-items: center;
          font-family: var(--font-mono, "JetBrains Mono", monospace);
          font-size: 0.68rem;
          color: #A49F93;
          user-select: none;
        }

        .dc-source-pill {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          background: rgba(24, 26, 24, 0.85);
          border: 1px solid rgba(242, 238, 231, 0.08);
          padding: 0.2rem 0.5rem;
          border-radius: 3px;
          cursor: pointer;
          transition: border-color 0.15s ease;
        }

        .dc-source-badge-wrap:hover .dc-source-pill {
          border-color: rgba(242, 238, 231, 0.2);
        }

        .dc-source-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          flex-shrink: 0;
        }

        .dc-source-label {
          font-weight: 600;
          color: #E9E5DC;
          letter-spacing: 0.04em;
        }

        .dc-source-divider {
          color: rgba(242, 238, 231, 0.2);
        }

        .dc-source-conf {
          font-weight: 600;
        }

        .dc-source-time {
          color: #7A756D;
        }

        .dc-source-badge-wrap.compact .dc-source-pill {
          padding: 0.12rem 0.35rem;
          font-size: 0.62rem;
        }

        .dc-source-popover {
          position: absolute;
          bottom: calc(100% + 6px);
          left: 0;
          z-index: 1000;
          width: 260px;
          background: #181A18;
          border: 1px solid rgba(242, 238, 231, 0.16);
          border-radius: 4px;
          padding: 0.65rem;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.6);
          pointer-events: none;
          animation: popoverFadeIn 0.15s ease-out;
        }

        .popover-title {
          font-size: 0.65rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          color: #D66A35;
          margin-bottom: 0.25rem;
        }

        .popover-body {
          font-family: var(--font-sans, -apple-system, sans-serif);
          font-size: 0.72rem;
          line-height: 1.35;
          color: #E9E5DC;
          margin: 0 0 0.45rem 0;
        }

        .popover-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          font-size: 0.62rem;
          color: #7A756D;
          border-top: 1px solid rgba(242, 238, 231, 0.08);
          padding-top: 0.35rem;
        }

        .demo-tag {
          color: #C69A3A;
          font-weight: 700;
        }

        @keyframes popoverFadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
