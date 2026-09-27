import React, { useState, useEffect } from 'react';

/**
 * DISASTERCHAIN REPLAY CONTROLLER
 * 12-hour temporal scrubber (T-6H to +6H) for historical analysis & predictive rehearsal.
 */
export const REPLAY_TIMESTEPS = [
  {
    id: 't-minus-6',
    offset: -6,
    label: 'T - 6H',
    timeLabel: '04:00',
    title: 'Baseline Conditions',
    summary: 'Dry ground baseline; regional drainage reservoirs at 42% capacity. No hazard signals.',
    waterLevel: '0.2m',
    incidentsCount: 0,
    riskLevel: 'Green',
  },
  {
    id: 't-minus-3',
    offset: -3,
    label: 'T - 3H',
    timeLabel: '07:00',
    title: 'Precipitation Ingress',
    summary: 'Early frontal rain cell reached Metro periphery (3.1 mm/hr). Inflow absorption nominal.',
    waterLevel: '0.6m',
    incidentsCount: 1,
    riskLevel: 'Yellow',
  },
  {
    id: 'now',
    offset: 0,
    label: 'NOW',
    timeLabel: '10:00 (LIVE)',
    title: 'Peak Operational Impact',
    summary: 'Sustained rain 8.2 mm/hr; Sector 14 basin crossed waterlogging threshold. 3 incidents active.',
    waterLevel: '1.4m',
    incidentsCount: 3,
    riskLevel: 'Orange',
  },
  {
    id: 't-plus-3',
    offset: 3,
    label: '+3H (FORECAST)',
    timeLabel: '13:00',
    title: 'Projected Peak Runoff',
    summary: 'Numerical forecast predicts runoff peak at 12:45; Ring Road underpass likely impassable.',
    waterLevel: '1.8m',
    incidentsCount: 5,
    riskLevel: 'Orange',
  },
  {
    id: 't-plus-6',
    offset: 6,
    label: '+6H (FORECAST)',
    timeLabel: '16:00',
    title: 'Gradual Dissipation',
    summary: 'Convective cell shifts northeast. Pumping stations restore drainage flow. Threat recedes.',
    waterLevel: '0.9m',
    incidentsCount: 2,
    riskLevel: 'Yellow',
  },
];

export default function ReplayController({ onTimeSliceChange, activeStepId = 'now' }) {
  const [currentStepIndex, setCurrentStepIndex] = useState(
    REPLAY_TIMESTEPS.findIndex((t) => t.id === activeStepId) !== -1
      ? REPLAY_TIMESTEPS.findIndex((t) => t.id === activeStepId)
      : 2
  );
  const [isPlaying, setIsPlaying] = useState(false);

  const activeStep = REPLAY_TIMESTEPS[currentStepIndex];

  // Auto-play interval
  useEffect(() => {
    let timer;
    if (isPlaying) {
      timer = setInterval(() => {
        setCurrentStepIndex((prev) => {
          const next = (prev + 1) % REPLAY_TIMESTEPS.length;
          if (onTimeSliceChange) onTimeSliceChange(REPLAY_TIMESTEPS[next]);
          return next;
        });
      }, 3000);
    }
    return () => clearInterval(timer);
  }, [isPlaying, onTimeSliceChange]);

  const handleSelectStep = (idx) => {
    setCurrentStepIndex(idx);
    setIsPlaying(false);
    if (onTimeSliceChange) onTimeSliceChange(REPLAY_TIMESTEPS[idx]);
  };

  return (
    <div className="dc-replay-surface" role="region" aria-label="DisasterChain Replay Controller">
      {/* Title & Play/Pause Controls */}
      <div className="dc-replay-header">
        <div className="dc-replay-title-row">
          <span className="dc-replay-super">TEMPORAL REPLAY (SIMULATION)</span>
          <span className="dc-replay-badge">
            {activeStep.offset < 0 ? 'HISTORICAL TELEMETRY' : activeStep.offset === 0 ? 'LIVE NOW' : 'NUMERICAL PROJECTION'}
          </span>
        </div>

        <div className="dc-replay-controls">
          <button
            type="button"
            className="dc-ctrl-btn"
            onClick={() => handleSelectStep(Math.max(0, currentStepIndex - 1))}
            disabled={currentStepIndex === 0}
            title="Step backward"
          >
            ◀
          </button>
          <button
            type="button"
            className={`dc-ctrl-btn play ${isPlaying ? 'playing' : ''}`}
            onClick={() => setIsPlaying(!isPlaying)}
            title={isPlaying ? 'Pause replay' : 'Play replay'}
          >
            {isPlaying ? '❚❚ PAUSE' : '▶ PLAY'}
          </button>
          <button
            type="button"
            className="dc-ctrl-btn"
            onClick={() => handleSelectStep(Math.min(REPLAY_TIMESTEPS.length - 1, currentStepIndex + 1))}
            disabled={currentStepIndex === REPLAY_TIMESTEPS.length - 1}
            title="Step forward"
          >
            ▶
          </button>
        </div>
      </div>

      {/* Scrubbing Track */}
      <div className="dc-replay-timeline-track">
        {REPLAY_TIMESTEPS.map((step, idx) => {
          const isSelected = idx === currentStepIndex;
          const isLive = step.offset === 0;

          return (
            <button
              key={step.id}
              type="button"
              className={`dc-time-node ${isSelected ? 'selected' : ''} ${isLive ? 'live-node' : ''}`}
              onClick={() => handleSelectStep(idx)}
            >
              <span className="node-pip" />
              <span className="node-label">{step.label}</span>
              <span className="node-time">{step.timeLabel}</span>
            </button>
          );
        })}
        <div
          className="dc-timeline-progress"
          style={{ width: `${(currentStepIndex / (REPLAY_TIMESTEPS.length - 1)) * 100}%` }}
        />
      </div>

      {/* Active Temporal State Readout */}
      <div className="dc-replay-readout">
        <div className="readout-headline-row">
          <h4 className="readout-title">{activeStep.title}</h4>
          <div className="readout-metrics">
            <span>Water Accumulation: <strong>{activeStep.waterLevel}</strong></span>
            <span>·</span>
            <span>Active Incidents: <strong>{activeStep.incidentsCount}</strong></span>
          </div>
        </div>
        <p className="readout-summary">{activeStep.summary}</p>
      </div>

      <style>{`
        .dc-replay-surface {
          background: #181A18;
          border: 1px solid rgba(242, 238, 231, 0.12);
          border-radius: 4px;
          padding: 0.85rem 1rem;
          color: #E9E5DC;
          font-family: var(--font-sans, -apple-system, sans-serif);
        }

        .dc-replay-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin-bottom: 0.75rem;
        }

        .dc-replay-title-row {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .dc-replay-super {
          font-family: var(--font-mono, monospace);
          font-size: 0.65rem;
          font-weight: 700;
          letter-spacing: 0.12em;
          color: #D66A35;
        }

        .dc-replay-badge {
          font-family: var(--font-mono, monospace);
          font-size: 0.58rem;
          color: #7A756D;
          background: rgba(242, 238, 231, 0.05);
          padding: 0.1rem 0.35rem;
          border-radius: 2px;
        }

        .dc-replay-controls {
          display: flex;
          align-items: center;
          gap: 0.35rem;
        }

        .dc-ctrl-btn {
          background: #121413;
          border: 1px solid rgba(242, 238, 231, 0.12);
          color: #E9E5DC;
          font-family: var(--font-mono, monospace);
          font-size: 0.68rem;
          padding: 0.2rem 0.5rem;
          border-radius: 2px;
          cursor: pointer;
          transition: all 0.12s ease;
        }

        .dc-ctrl-btn:hover:not(:disabled) {
          border-color: #D66A35;
          color: #D66A35;
        }

        .dc-ctrl-btn:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }

        .dc-ctrl-btn.play.playing {
          background: rgba(214, 106, 53, 0.18);
          border-color: #D66A35;
          color: #D66A35;
        }

        /* Timeline Track */
        .dc-replay-timeline-track {
          position: relative;
          display: flex;
          justify-content: space-between;
          padding: 0.5rem 0.25rem 0.75rem 0.25rem;
          border-bottom: 1px solid rgba(242, 238, 231, 0.08);
          margin-bottom: 0.65rem;
        }

        .dc-timeline-progress {
          position: absolute;
          top: 10px;
          left: 0;
          height: 2px;
          background: #D66A35;
          z-index: 1;
          transition: width 0.25s ease;
        }

        .dc-time-node {
          background: transparent;
          border: none;
          display: flex;
          flex-direction: column;
          align-items: center;
          cursor: pointer;
          position: relative;
          z-index: 2;
          padding: 0;
        }

        .node-pip {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #121413;
          border: 2px solid #7A756D;
          margin-bottom: 0.35rem;
          transition: all 0.15s ease;
        }

        .dc-time-node.live-node .node-pip {
          border-color: #D66A35;
        }

        .dc-time-node.selected .node-pip {
          background: #D66A35;
          border-color: #F7F4ED;
          transform: scale(1.3);
        }

        .node-label {
          font-family: var(--font-mono, monospace);
          font-size: 0.62rem;
          font-weight: 600;
          color: #7A756D;
          transition: color 0.12s ease;
        }

        .node-time {
          font-family: var(--font-mono, monospace);
          font-size: 0.58rem;
          color: #555;
        }

        .dc-time-node.selected .node-label {
          color: #D66A35;
          font-weight: 700;
        }

        .dc-time-node.selected .node-time {
          color: #E9E5DC;
        }

        /* Readout */
        .dc-replay-readout {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .readout-headline-row {
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .readout-title {
          font-size: 0.88rem;
          font-weight: 600;
          color: #F7F4ED;
          margin: 0;
        }

        .readout-metrics {
          font-family: var(--font-mono, monospace);
          font-size: 0.68rem;
          color: #A49F93;
          display: flex;
          gap: 0.35rem;
        }

        .readout-metrics strong {
          color: #F7F4ED;
        }

        .readout-summary {
          font-size: 0.76rem;
          line-height: 1.35;
          color: #A49F93;
          margin: 0;
        }
      `}</style>
    </div>
  );
}
