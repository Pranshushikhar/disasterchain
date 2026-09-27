import React, { useState } from 'react';
import Icon from '../Icons';

const REPLAY_SLICES = [
  {
    step: -2,
    tag: 'T - 6H',
    time: '02:40 AM',
    title: 'Dry Baseline',
    rain: '0.0 mm/h',
    incidents: 0,
    risk: 'LOW / STABLE',
    riskColor: '#5E8B68',
    reports: '0 reports',
    shelters: 'Standby / 140 beds',
    summary: 'Clear skies prior to ingress of frontal rain cell. Trunk culverts completely clear.',
  },
  {
    step: -1,
    tag: 'T - 3H',
    time: '05:40 AM',
    title: 'Precipitation Ingress',
    rain: '12.4 mm/h',
    incidents: 1,
    risk: 'MODERATE WATCH',
    riskColor: '#C69A3A',
    reports: '1 report (Curb puddle)',
    shelters: 'Open / 130 beds',
    summary: 'Moderate rain began over Metro perimeter. Initial storm drain inflow normal.',
  },
  {
    step: 0,
    tag: 'NOW',
    time: '08:42 AM (LIVE)',
    title: 'Peak Operational Impact',
    rain: '38.0 mm/h',
    incidents: 4,
    risk: 'ELEVATED RISK',
    riskColor: '#D96B35',
    reports: '4 verified reports',
    shelters: '42 beds available (Shelter #2)',
    summary: 'Intense downpour exceeding absorption limits. Sector 14 underpass closed due to 45cm water.',
  },
  {
    step: 1,
    tag: '+ 3H',
    time: '11:40 AM (FORECAST)',
    title: 'Runoff Dissipation',
    rain: '6.2 mm/h',
    incidents: 2,
    risk: 'RECEDING HAZARD',
    riskColor: '#C69A3A',
    reports: '2 resolving reports',
    shelters: '55 beds available',
    summary: 'Rain cell moves northeast toward Shivalik foothills. Auxiliary pumps lower underpass depth.',
  },
  {
    step: 2,
    tag: '+ 6H',
    time: '02:40 PM (FORECAST)',
    title: 'Return to Baseline',
    rain: '0.5 mm/h',
    incidents: 0,
    risk: 'STABLE POSTURE',
    riskColor: '#5E8B68',
    reports: 'All cleared',
    shelters: 'Nominal posture',
    summary: 'Road network clear and open for normal traffic. Municipal inspections completed.',
  },
];

/**
 * MobileReplayModal (Section 11)
 * Thumb-friendly temporal scrubber:
 * T-6H ───── NOW ───── +6H
 * Dragging updates: Rainfall, Incidents, Risk, Reports, Shelters
 * Clearly labeled: SIMULATION
 */
export default function MobileReplayModal({ isOpen, onClose }) {
  const [sliderIndex, setSliderIndex] = useState(2); // Default to 'NOW'

  if (!isOpen) return null;

  const currentSlice = REPLAY_SLICES[sliderIndex] || REPLAY_SLICES[2];

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 10000,
        background: '#11100E',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'Plus Jakarta Sans, sans-serif',
      }}
      role="dialog"
      aria-label="12-Hour Scenario Replay"
    >
      {/* Top Header */}
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: 'calc(0.75rem + env(safe-area-inset-top, 0px)) 1rem 0.75rem 1rem',
          background: 'rgba(25, 23, 20, 0.98)',
          borderBottom: '1px solid rgba(242, 238, 231, 0.1)',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', color: '#C69A3A', fontWeight: 800 }}>
              TEMPORAL REPLAY
            </span>
            <span
              style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '0.6rem',
                color: '#C69A3A',
                background: 'rgba(198, 154, 58, 0.15)',
                border: '1px solid rgba(198, 154, 58, 0.3)',
                padding: '1px 5px',
                borderRadius: '3px',
                fontWeight: 800,
              }}
            >
              SIMULATION
            </span>
          </div>
          <h2 style={{ fontSize: '0.92rem', color: '#F7F4ED', margin: '2px 0 0 0', fontWeight: 700 }}>
            12-Hour Scenario Time Scrubber
          </h2>
        </div>

        <button
          type="button"
          onClick={onClose}
          style={{
            background: 'rgba(242, 238, 231, 0.08)',
            border: 'none',
            color: '#F7F4ED',
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            cursor: 'pointer',
            fontSize: '1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          aria-label="Close Replay"
        >
          ✕
        </button>
      </header>

      {/* Main Content Area */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '1.25rem 1rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem',
        }}
      >
        {/* Prominent Current Slice Card */}
        <div
          style={{
            background: '#191714',
            border: `1px solid ${currentSlice.riskColor || 'rgba(242,238,231,0.1)'}`,
            borderRadius: '6px',
            padding: '1.1rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '1.1rem', fontWeight: 900, color: currentSlice.riskColor }}>
              {currentSlice.tag}
            </span>
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.78rem', color: '#A49F93' }}>
              {currentSlice.time}
            </span>
          </div>

          <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#F7F4ED', fontWeight: 700 }}>
            {currentSlice.title}
          </h3>

          <p style={{ margin: 0, fontSize: '0.82rem', color: '#E9E5DC', lineHeight: 1.45 }}>
            {currentSlice.summary}
          </p>

          {/* Dynamic Metrics Updating as Slider Drags (Section 11) */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '0.65rem',
              background: 'rgba(242, 238, 231, 0.03)',
              padding: '0.75rem',
              borderRadius: '4px',
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '0.72rem',
            }}
          >
            <div>
              <span style={{ color: '#7A756D', display: 'block', fontSize: '0.6rem' }}>RAINFALL</span>
              <span style={{ color: '#D96B35', fontWeight: 700 }}>{currentSlice.rain}</span>
            </div>
            <div>
              <span style={{ color: '#7A756D', display: 'block', fontSize: '0.6rem' }}>RISK POSTURE</span>
              <span style={{ color: currentSlice.riskColor, fontWeight: 700 }}>{currentSlice.risk}</span>
            </div>
            <div>
              <span style={{ color: '#7A756D', display: 'block', fontSize: '0.6rem' }}>ACTIVE HAZARDS</span>
              <span style={{ color: '#F7F4ED', fontWeight: 700 }}>{currentSlice.incidents} Incidents</span>
            </div>
            <div>
              <span style={{ color: '#7A756D', display: 'block', fontSize: '0.6rem' }}>RELIEF SHELTER</span>
              <span style={{ color: '#5E8B68', fontWeight: 700 }}>{currentSlice.shelters}</span>
            </div>
          </div>
        </div>

        {/* THUMB-FRIENDLY TIMELINE CONTROLLER (Section 11) */}
        <div
          style={{
            background: '#191714',
            border: '1px solid rgba(242, 238, 231, 0.08)',
            borderRadius: '6px',
            padding: '1rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.85rem',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.68rem', color: '#7A756D' }}>
            <span>T - 6H</span>
            <span style={{ color: '#D96B35', fontWeight: 800 }}>NOW (LIVE)</span>
            <span>+ 6H</span>
          </div>

          {/* Large Thumb Slider */}
          <input
            type="range"
            min={0}
            max={4}
            step={1}
            value={sliderIndex}
            onChange={(e) => setSliderIndex(Number(e.target.value))}
            style={{
              width: '100%',
              accentColor: '#D96B35',
              cursor: 'pointer',
              height: '10px',
            }}
            aria-label="Replay Timeline Scrubber"
          />

          {/* Quick Step Buttons for 1-Tap Thumb Navigation */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '4px' }}>
            {REPLAY_SLICES.map((s, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setSliderIndex(idx)}
                style={{
                  background: sliderIndex === idx ? 'rgba(217, 107, 53, 0.2)' : 'rgba(242, 238, 231, 0.04)',
                  border: sliderIndex === idx ? '1px solid #D96B35' : '1px solid rgba(242, 238, 231, 0.08)',
                  borderRadius: '3px',
                  color: sliderIndex === idx ? '#D96B35' : '#7A756D',
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: '0.62rem',
                  fontWeight: 700,
                  padding: '0.4rem 0',
                  cursor: 'pointer',
                }}
              >
                {s.tag.replace(' ', '')}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
