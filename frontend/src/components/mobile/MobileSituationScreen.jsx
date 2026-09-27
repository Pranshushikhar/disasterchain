import React from 'react';
import Icon from '../Icons';

/**
 * MobileSituationScreen (Section 3, 4, 7)
 * Purpose-built emergency response situation room for mobile devices.
 *
 * First 3 Seconds Principle:
 * 1. WHERE AM I? (CHANDIGARH · LIVE SITUATION)
 * 2. WHAT IS HAPPENING? (Dominant statement)
 * 3. DO I NEED TO ACT? (CURRENT RISK: ELEVATED + advice)
 * 4. WHAT CHANGED? (Top 3 meaningful events with timestamps)
 * 5. WHAT CAN I DO RIGHT NOW? (Ask DisasterChain, Shelter directions, SOS)
 */
export default function MobileSituationScreen({
  locality = 'CHANDIGARH',
  situation = {
    level: 'ELEVATED',
    color: '#D96B35',
    headline: 'Heavy rainfall is increasing waterlogging risk in low-lying areas.',
    explanation: 'Low-lying roadway culverts in Sectors 14–17 are running near absorption limits. Standby drainage pumps are active, but transit delays and localized basement ingress remain probable.',
    advice: 'Avoid low-lying underpasses along Ring Road Bypass. Check ground-level power points.',
  },
  weather = {
    temp: '28°C',
    condition: 'Heavy Overcast · Active Rainfall',
    rain: '4.2 mm/h',
    wind: '14 km/h',
    aqi: 64,
  },
  hourlyForecast = [
    { time: '14:00', temp: '28°', rain: '65%' },
    { time: '15:00', temp: '27°', rain: '80%' },
    { time: '16:00', temp: '26°', rain: '70%' },
    { time: '17:00', temp: '26°', rain: '40%' },
    { time: '18:00', temp: '25°', rain: '20%' },
    { time: '19:00', temp: '25°', rain: '10%' },
  ],
  changes = [
    {
      time: '08:42',
      text: 'Rainfall intensity increased to 38 mm/h',
      source: 'IMD Automated Weather Station · Live',
    },
    {
      time: '08:31',
      text: '2 field reports received for Sector 14 underpass',
      source: 'Community Verified Signal · 14m ago',
    },
    {
      time: '08:18',
      text: 'Shelter capacity updated: 42 beds open at Civil Shelter #2',
      source: 'Municipal Civil Node · 27m ago',
    },
  ],
  nearestShelter = {
    name: 'Civil Relief Shelter #2',
    sector: 'Sector 17 Community Complex',
    beds: 42,
    distance: '1.2 km',
  },
  onOpenWeatherGPT,
  onOpenMap,
  onOpenShelter,
}) {
  return (
    <div className="mobile-page-container" id="mobile-situation-screen">
      {/* =========================================================
          1. TOP LOCALITY & DOMINANT SITUATION STATEMENT (Section 3)
          ========================================================= */}
      <section className="mobile-situation-top" aria-label="Current Situation">
        <div className="mobile-locality-eyebrow">
          <span>{locality.toUpperCase()}</span>
          <span className="mobile-status-tag">● LIVE SITUATION</span>
        </div>

        {/* ONE dominant situation statement */}
        <h1 className="mobile-dominant-statement">
          {situation.headline || 'Heavy rainfall is increasing waterlogging risk in low-lying areas.'}
        </h1>
      </section>

      {/* =========================================================
          2. CURRENT RISK & ACTION (Section 3)
          ========================================================= */}
      <section className="mobile-risk-card" aria-label="Risk Assessment">
        <div className="mobile-risk-header">
          <span className="mobile-risk-title">CURRENT RISK</span>
          <span className="mobile-risk-level" style={{ color: situation.color || '#D96B35' }}>
            {situation.level || 'ELEVATED'}
          </span>
        </div>
        <p className="mobile-risk-summary">
          {situation.advice || 'Avoid low-lying underpasses along Ring Road Bypass. Standby drainage pumps active.'}
        </p>
      </section>

      {/* =========================================================
          3. WHY (Section 3)
          ========================================================= */}
      <section aria-label="Risk Factors">
        <div className="mobile-section-header">
          <span>WHY</span>
          <span style={{ fontSize: '0.6rem', color: '#7A756D' }}>VERIFIED SIGNALS</span>
        </div>
        <div className="mobile-why-list">
          <div className="mobile-why-item">
            <div className="mobile-why-icon">
              <Icon name="cloud-rain" size={17} color="#D96B35" />
            </div>
            <div className="mobile-why-content">
              <span className="mobile-why-title">Rainfall Threshold Exceeded</span>
              <span className="mobile-why-desc">
                Current 38 mm/h precipitation exceeds nominal municipal storm drain absorption capacity.
              </span>
            </div>
          </div>

          <div className="mobile-why-item">
            <div className="mobile-why-icon">
              <Icon name="alert-triangle" size={17} color="#D96B35" />
            </div>
            <div className="mobile-why-content">
              <span className="mobile-why-title">Drainage Stress at 92%</span>
              <span className="mobile-why-desc">
                Sector 14–17 trunk culverts operating near capacity; runoff backflow active near arterial roads.
              </span>
            </div>
          </div>

          <div className="mobile-why-item">
            <div className="mobile-why-icon">
              <Icon name="activity" size={17} color="#D96B35" />
            </div>
            <div className="mobile-why-content">
              <span className="mobile-why-title">4 Field Reports Verified</span>
              <span className="mobile-why-desc">
                Localized curb pooling (30–45 cm) reported along Sector 15 underpass and market corridor.
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          4. WHAT CHANGED (Section 3: ONLY latest 3 meaningful changes)
          ========================================================= */}
      <section aria-label="Recent Operational Changes">
        <div className="mobile-section-header">
          <span>WHAT CHANGED</span>
          <span style={{ fontSize: '0.6rem', color: '#7A756D' }}>PAST 60 MIN</span>
        </div>
        <div className="mobile-what-changed-card">
          {changes.slice(0, 3).map((item, idx) => (
            <div className="mobile-change-row" key={idx}>
              <span className="mobile-change-time">{item.time}</span>
              <div className="mobile-change-info">
                <span className="mobile-change-text">{item.text}</span>
                <span className="mobile-change-source">{item.source}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* =========================================================
          5. ASK DISASTERCHAIN (Section 7: Obvious on Situation Screen)
          ========================================================= */}
      <section className="mobile-ask-dc-card" aria-label="Crisis Intelligence Assistant">
        <div className="mobile-ask-dc-header">
          <div className="mobile-ask-dc-title">
            <span>⚡</span>
            <span>ASK DISASTERCHAIN</span>
          </div>
          <span className="mobile-ask-dc-sub">METEOROLOGICAL AI</span>
        </div>

        <p style={{ fontSize: '0.76rem', color: '#A49F93', margin: 0, lineHeight: 1.4 }}>
          Structured situational guidance powered by real-time meteorological models & municipal data.
        </p>

        {/* 4 Example Quick Questions */}
        <div className="mobile-quick-questions">
          {[
            'Is it safe to travel?',
            'What changed?',
            'Where should I go?',
            'What should I do now?',
          ].map((query, idx) => (
            <button
              key={idx}
              type="button"
              className="mobile-quick-q-btn"
              onClick={() => onOpenWeatherGPT && onOpenWeatherGPT(query)}
            >
              "{query}"
            </button>
          ))}
        </div>
      </section>

      {/* =========================================================
          6. MOBILE WEATHER & IMPACT CHAIN (Section 4)
          ========================================================= */}
      <section className="mobile-weather-card" aria-label="Atmospheric Telemetry">
        <div className="mobile-section-header" style={{ margin: 0 }}>
          <span>WEATHER & RUNOFF</span>
          <span style={{ fontSize: '0.6rem', color: '#7A756D' }}>OPEN-METEO FEED</span>
        </div>

        {/* NOW: temperature, rain, wind */}
        <div className="mobile-weather-now-strip">
          <div className="mobile-weather-temp-wrap">
            <span className="mobile-weather-temp">{weather.temp || '28°C'}</span>
            <span className="mobile-weather-condition">{weather.condition || 'Overcast'}</span>
          </div>

          <div className="mobile-weather-metrics-row">
            <div className="mobile-metric-item" title="Precipitation">
              <Icon name="cloud-rain" size={13} color="#D96B35" />
              <span className="mobile-metric-val">{weather.rain || '4.2 mm/h'}</span>
            </div>
            <div className="mobile-metric-item" title="Wind Speed">
              <Icon name="wind" size={13} color="#A49F93" />
              <span className="mobile-metric-val">{weather.wind || '14 km/h'}</span>
            </div>
          </div>
        </div>

        {/* NEXT 6 HOURS Horizontal Timeline */}
        <div className="mobile-forecast-timeline" role="region" aria-label="Next 6 Hours Forecast">
          {hourlyForecast.slice(0, 6).map((slot, idx) => (
            <div className="mobile-forecast-slot" key={idx}>
              <span className="mobile-slot-time">{slot.time}</span>
              <span className="mobile-slot-temp">{slot.temp}</span>
              <span className="mobile-slot-rain">{slot.rain || '60%'}</span>
            </div>
          ))}
        </div>

        {/* WEATHER -> IMPACT Visual Chain (Section 4) */}
        <div className="mobile-impact-chain">
          <span className="mobile-chain-title">WEATHER → INFRASTRUCTURE IMPACT</span>
          <div className="mobile-chain-steps">
            <div className="mobile-chain-step">
              <span style={{ fontWeight: 700, color: '#F7F4ED' }}>Rain:</span>
              <span>Intense 38 mm/h rainfall active</span>
            </div>
            <div className="mobile-chain-arrow">↓</div>
            <div className="mobile-chain-step">
              <span style={{ fontWeight: 700, color: '#F7F4ED' }}>Drainage stress:</span>
              <span>Culverts at 92% capacity in low basins</span>
            </div>
            <div className="mobile-chain-arrow">↓</div>
            <div className="mobile-chain-step">
              <span style={{ fontWeight: 700, color: '#D96B35' }}>Waterlogging risk:</span>
              <span>Road inundation probable at Ring Road underpass</span>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          7. NEAREST SAFE HAVEN (Fast Life-Safety Anchor)
          ========================================================= */}
      {nearestShelter && (
        <section
          style={{
            background: '#191714',
            border: '1px solid rgba(94, 139, 104, 0.3)',
            borderRadius: '4px',
            padding: '0.85rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.45rem',
          }}
          aria-label="Nearest Relief Shelter"
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', color: '#5E8B68', fontWeight: 800 }}>
              NEAREST RELIEF SHELTER
            </span>
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.62rem', color: '#5E8B68', background: 'rgba(94,139,104,0.1)', padding: '2px 6px', borderRadius: '3px' }}>
              {nearestShelter.beds} BEDS AVAILABLE
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <span style={{ fontSize: '0.92rem', fontWeight: 700, color: '#F7F4ED' }}>
              {nearestShelter.name}
            </span>
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.72rem', color: '#A49F93' }}>
              {nearestShelter.distance}
            </span>
          </div>

          <span style={{ fontSize: '0.75rem', color: '#A49F93' }}>
            {nearestShelter.sector}
          </span>

          <button
            type="button"
            onClick={onOpenMap}
            style={{
              marginTop: '0.25rem',
              background: 'rgba(94, 139, 104, 0.15)',
              border: '1px solid rgba(94, 139, 104, 0.4)',
              borderRadius: '4px',
              color: '#5E8B68',
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '0.72rem',
              fontWeight: 700,
              padding: '0.5rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.35rem',
            }}
          >
            <Icon name="map-pin" size={14} color="#5E8B68" />
            <span>VIEW ON CRISIS MAP</span>
          </button>
        </section>
      )}
    </div>
  );
}
