import React from 'react';
import { Link } from 'react-router-dom';
import Icon from '../Icons';

/**
 * MobileMoreScreen (Section 9)
 * Clean, structured secondary navigation sheet:
 * Groups operations, simulation models, citizen tools, and system health
 * without overwhelming the user with 15 flat links.
 */
export default function MobileMoreScreen({
  onOpenDigitalTwin,
  onOpenReplay,
  onOpenPersonalSafety,
  onOpenSystemStatus,
  onOpenNativeAppDownload,
  onClose,
}) {
  return (
    <div className="mobile-page-container" id="mobile-more-screen">
      {/* Header */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.68rem', color: '#D96B35', fontWeight: 700 }}>
            COMMAND DIRECTORY
          </span>
          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.62rem', color: '#7A756D' }}>
            OPERATIONAL TOOLS
          </span>
        </div>
        <h1 style={{ fontFamily: 'Newsreader, serif', fontSize: '1.45rem', fontWeight: 600, color: '#F7F4ED', margin: '0.25rem 0 0 0' }}>
          Secondary Operations
        </h1>
        <p style={{ fontSize: '0.78rem', color: '#A49F93', margin: 0 }}>
          Specialized diagnostic, simulation, and citizen coordination modules.
        </p>
      </section>

      <div className="mobile-more-grid">
        {/* GROUP 0: NATIVE CLIENT */}
        <div className="mobile-more-group">
          <span className="mobile-more-group-title">NATIVE CLIENT</span>
          <button
            type="button"
            className="mobile-more-item"
            id="more-get-native-app-btn"
            onClick={() => {
              if (onOpenNativeAppDownload) onOpenNativeAppDownload();
            }}
          >
            <div className="mobile-more-item-left">
              <div className="mobile-more-icon">
                <Icon name="smartphone" size={18} color="#D96B35" />
              </div>
              <div className="mobile-more-text" style={{ textAlign: 'left' }}>
                <span className="mobile-more-label">GET THE NATIVE APP</span>
                <span className="mobile-more-desc">Direct Android APK (v1.2.0) with offline maps & push alerts</span>
              </div>
            </div>
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.6rem', color: '#D96B35', background: 'rgba(217,107,53,0.15)', padding: '2px 6px', borderRadius: '3px' }}>
              APK v1.2.0
            </span>
          </button>
        </div>

        {/* GROUP 1: OPERATIONAL INFRASTRUCTURE */}
        <div className="mobile-more-group">
          <span className="mobile-more-group-title">OPERATIONAL INFRASTRUCTURE</span>

          <Link to="/weather" className="mobile-more-item" onClick={onClose}>
            <div className="mobile-more-item-left">
              <div className="mobile-more-icon">
                <Icon name="cloud-rain" size={18} color="#D96B35" />
              </div>
              <div className="mobile-more-text">
                <span className="mobile-more-label">Weather & Atmospheric Impact</span>
                <span className="mobile-more-desc">Deep rainfall telemetry, radar & barometric trends</span>
              </div>
            </div>
            <Icon name="chevron-right" size={15} color="#7A756D" />
          </Link>

          <Link to="/shelters" className="mobile-more-item" onClick={onClose}>
            <div className="mobile-more-item-left">
              <div className="mobile-more-icon">
                <Icon name="home" size={18} color="#5E8B68" />
              </div>
              <div className="mobile-more-text">
                <span className="mobile-more-label">Shelter Capacity Directory</span>
                <span className="mobile-more-desc">Verified bed vacancies, generators & medical supplies</span>
              </div>
            </div>
            <Icon name="chevron-right" size={15} color="#7A756D" />
          </Link>

          <Link to="/incidents" className="mobile-more-item" onClick={onClose}>
            <div className="mobile-more-item-left">
              <div className="mobile-more-icon">
                <Icon name="alert-triangle" size={18} color="#C84A3A" />
              </div>
              <div className="mobile-more-text">
                <span className="mobile-more-label">Field Incidents & Hazards</span>
                <span className="mobile-more-desc">Log or review road hazards, downed lines & blockages</span>
              </div>
            </div>
            <Icon name="chevron-right" size={15} color="#7A756D" />
          </Link>

          <Link to="/affected-areas" className="mobile-more-item" onClick={onClose}>
            <div className="mobile-more-item-left">
              <div className="mobile-more-icon">
                <Icon name="map-pin" size={18} color="#D96B35" />
              </div>
              <div className="mobile-more-text">
                <span className="mobile-more-label">Hazard Cartography & Basins</span>
                <span className="mobile-more-desc">Topological flood plains and municipal runoff basins</span>
              </div>
            </div>
            <Icon name="chevron-right" size={15} color="#7A756D" />
          </Link>
        </div>

        {/* GROUP 2: SPATIAL & SIMULATION (Section 10 & 11) */}
        <div className="mobile-more-group">
          <span className="mobile-more-group-title">SPATIAL & TEMPORAL SIMULATION</span>

          {/* Digital Twin (Section 10: Open from More -> Spatial Model) */}
          <button
            type="button"
            className="mobile-more-item"
            id="more-spatial-model-btn"
            onClick={() => {
              if (onOpenDigitalTwin) onOpenDigitalTwin();
            }}
          >
            <div className="mobile-more-item-left">
              <div className="mobile-more-icon">
                <Icon name="layers" size={18} color="#D96B35" />
              </div>
              <div className="mobile-more-text" style={{ textAlign: 'left' }}>
                <span className="mobile-more-label">Spatial Model (Digital Twin)</span>
                <span className="mobile-more-desc">Touch-first 2.5D hydrological city runoff simulation</span>
              </div>
            </div>
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.6rem', color: '#D96B35', background: 'rgba(217,107,53,0.15)', padding: '2px 6px', borderRadius: '3px' }}>
              INTERACTIVE
            </span>
          </button>

          {/* Historical Replay (Section 11: Thumb-friendly timeline) */}
          <button
            type="button"
            className="mobile-more-item"
            id="more-historical-replay-btn"
            onClick={() => {
              if (onOpenReplay) onOpenReplay();
            }}
          >
            <div className="mobile-more-item-left">
              <div className="mobile-more-icon">
                <Icon name="clock" size={18} color="#C69A3A" />
              </div>
              <div className="mobile-more-text" style={{ textAlign: 'left' }}>
                <span className="mobile-more-label">12-Hour Scenario Replay</span>
                <span className="mobile-more-desc">Temporal timeline scrubbing: T-6H to +6H forecast</span>
              </div>
            </div>
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.6rem', color: '#C69A3A', background: 'rgba(198,154,58,0.15)', padding: '2px 6px', borderRadius: '3px' }}>
              SIMULATION
            </span>
          </button>
        </div>

        {/* GROUP 3: CITIZEN & LIFE SAFETY */}
        <div className="mobile-more-group">
          <span className="mobile-more-group-title">CITIZEN & COMMUNITY TOOLS</span>

          <Link to="/my-reports" className="mobile-more-item" onClick={onClose}>
            <div className="mobile-more-item-left">
              <div className="mobile-more-icon">
                <Icon name="file-text" size={18} color="#E9E5DC" />
              </div>
              <div className="mobile-more-text">
                <span className="mobile-more-label">Community Field Signals</span>
                <span className="mobile-more-desc">Crowdsourced observations and report verification</span>
              </div>
            </div>
            <Icon name="chevron-right" size={15} color="#7A756D" />
          </Link>

          <Link to="/resources" className="mobile-more-item" onClick={onClose}>
            <div className="mobile-more-item-left">
              <div className="mobile-more-icon">
                <Icon name="package" size={18} color="#E9E5DC" />
              </div>
              <div className="mobile-more-text">
                <span className="mobile-more-label">Emergency Relief Logistics</span>
                <span className="mobile-more-desc">Rations, potable water, blankets & supply tracking</span>
              </div>
            </div>
            <Icon name="chevron-right" size={15} color="#7A756D" />
          </Link>

          <button
            type="button"
            className="mobile-more-item"
            onClick={() => {
              if (onOpenPersonalSafety) onOpenPersonalSafety();
            }}
          >
            <div className="mobile-more-item-left">
              <div className="mobile-more-icon">
                <Icon name="shield-check" size={18} color="#5E8B68" />
              </div>
              <div className="mobile-more-text" style={{ textAlign: 'left' }}>
                <span className="mobile-more-label">Personal Safety Protocol</span>
                <span className="mobile-more-desc">Evacuation readiness check and family emergency contact list</span>
              </div>
            </div>
            <Icon name="chevron-right" size={15} color="#7A756D" />
          </button>

          <Link to="/offline" className="mobile-more-item" onClick={onClose}>
            <div className="mobile-more-item-left">
              <div className="mobile-more-icon">
                <Icon name="wifi-off" size={18} color="#A49F93" />
              </div>
              <div className="mobile-more-text">
                <span className="mobile-more-label">Offline Emergency Kit</span>
                <span className="mobile-more-desc">Cached first-aid manuals and offline mesh guide</span>
              </div>
            </div>
            <Icon name="chevron-right" size={15} color="#7A756D" />
          </Link>
        </div>

        {/* GROUP 4: ACCOUNT & SYSTEM NODE */}
        <div className="mobile-more-group">
          <span className="mobile-more-group-title">NODE STATUS & GUIDES</span>

          <Link to="/profile" className="mobile-more-item" onClick={onClose}>
            <div className="mobile-more-item-left">
              <div className="mobile-more-icon">
                <Icon name="user" size={18} color="#A49F93" />
              </div>
              <div className="mobile-more-text">
                <span className="mobile-more-label">Profile & Emergency Contacts</span>
                <span className="mobile-more-desc">Registered identity and emergency notification numbers</span>
              </div>
            </div>
            <Icon name="chevron-right" size={15} color="#7A756D" />
          </Link>

          <button
            type="button"
            className="mobile-more-item"
            onClick={() => {
              if (onOpenSystemStatus) onOpenSystemStatus();
            }}
          >
            <div className="mobile-more-item-left">
              <div className="mobile-more-icon">
                <Icon name="cpu" size={18} color="#5E8B68" />
              </div>
              <div className="mobile-more-text" style={{ textAlign: 'left' }}>
                <span className="mobile-more-label">Decentralized Node Status</span>
                <span className="mobile-more-desc">Blockchain verification ledger & API node health</span>
              </div>
            </div>
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.62rem', color: '#5E8B68' }}>
              ONLINE
            </span>
          </button>

          <Link to="/guides" className="mobile-more-item" onClick={onClose}>
            <div className="mobile-more-item-left">
              <div className="mobile-more-icon">
                <Icon name="book" size={18} color="#A49F93" />
              </div>
              <div className="mobile-more-text">
                <span className="mobile-more-label">Disaster Response Handbooks</span>
                <span className="mobile-more-desc">Official civil defence survival protocols</span>
              </div>
            </div>
            <Icon name="chevron-right" size={15} color="#7A756D" />
          </Link>
        </div>
      </div>
    </div>
  );
}
