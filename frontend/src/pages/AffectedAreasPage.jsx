import React, { useState, useEffect } from 'react';
import { fetchAffectedAreas, fetchIncidents, fetchShelters, fetchSosRequests } from '../services/api';
import SituationRoomMap from '../components/SituationRoomMap';
import ReplayController from '../components/ReplayController';
import SourceBadge from '../components/SourceBadge';
import { useTranslation } from '../i18n/i18n';

/**
 * DISASTERCHAIN SPATIAL MODEL PAGE (/map and /affected-areas)
 * High-precision cartographic situational intelligence workspace.
 */
export default function AffectedAreasPage() {
  const { t } = useTranslation();
  const [hazards, setHazards] = useState([]);
  const [shelters, setShelters] = useState([]);
  const [sosSignals, setSosSignals] = useState([]);
  const [affectedAreas, setAffectedAreas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showReplay, setShowReplay] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const loadSpatialData = async () => {
      try {
        const [incRes, shRes, sosRes, areaRes] = await Promise.allSettled([
          fetchIncidents(),
          fetchShelters(),
          fetchSosRequests(),
          fetchAffectedAreas(),
        ]);

        if (!isMounted) return;

        if (incRes.status === 'fulfilled') setHazards(incRes.value || []);
        if (shRes.status === 'fulfilled') setShelters(shRes.value || []);
        if (sosRes.status === 'fulfilled') setSosSignals(sosRes.value || []);
        if (areaRes.status === 'fulfilled') setAffectedAreas(areaRes.value || []);
      } catch (err) {
        console.error('Failed to load spatial data:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadSpatialData();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="dc-map-page-root" role="region" aria-label="DisasterChain Spatial Model">
      {/* Top Editorial Header */}
      <div className="dc-map-header">
        <div className="header-left">
          <div className="header-super-row">
            <span className="header-super">DISASTERCHAIN SPATIAL MODEL</span>
            <SourceBadge
              source="OpenStreetMap · Municipal Nodes"
              confidence="High"
              updatedAt="Continuous"
              compact={true}
            />
          </div>
          <h1 className="header-title">Hazard & Infrastructure Cartography</h1>
          <p className="header-desc">
            Multi-layer geospatial command interface tracking runoff drainage basins, active hazard perimeters, relief shelter beds, and road diversions.
          </p>
        </div>

        <div className="header-right">
          <button
            type="button"
            className={`replay-toggle-btn ${showReplay ? 'active' : ''}`}
            onClick={() => setShowReplay(!showReplay)}
          >
            <span>⏱️ 12-Hour Replay Scrubber</span>
            <span className="btn-pill">{showReplay ? 'ACTIVE' : 'OFF'}</span>
          </button>
        </div>
      </div>

      {/* Spatial Telemetry Stat Strip */}
      <div className="spatial-kpi-strip">
        <div className="kpi-cell">
          <span className="kpi-label">MONITORED HAZARDS</span>
          <span className="kpi-val" style={{ color: hazards.length > 0 ? '#C84A3A' : '#5E8B68' }}>
            {hazards.length} Active
          </span>
        </div>
        <div className="kpi-sep" />
        <div className="kpi-cell">
          <span className="kpi-label">RELIEF SHELTERS</span>
          <span className="kpi-val" style={{ color: '#5E8B68' }}>
            {shelters.length} Operational
          </span>
        </div>
        <div className="kpi-sep" />
        <div className="kpi-cell">
          <span className="kpi-label">DISTRESS BEACONS</span>
          <span className="kpi-val" style={{ color: sosSignals.length > 0 ? '#D66A35' : '#7A756D' }}>
            {sosSignals.length} Logged
          </span>
        </div>
        <div className="kpi-sep" />
        <div className="kpi-cell">
          <span className="kpi-label">RUNOFF STRESS BASINS</span>
          <span className="kpi-val" style={{ color: '#D66A35' }}>
            Sector 14 & 17
          </span>
        </div>
      </div>

      {/* Replay Controller Scrubber (Expandable) */}
      {showReplay && (
        <div className="map-replay-tray">
          <ReplayController
            onTimeSliceChange={(slice) => console.log('Map temporal step:', slice.label)}
          />
        </div>
      )}

      {/* Primary Full-Height Cartographic Surface */}
      <div className="map-canvas-container">
        <SituationRoomMap
          center={[28.6139, 77.2090]}
          zoom={13}
          hazards={hazards}
          shelters={shelters}
          sosSignals={sosSignals}
          affectedAreas={affectedAreas}
          height="620px"
        />
      </div>

      <style>{`
        .dc-map-page-root {
          max-width: 1400px;
          margin: 0 auto;
          padding: 1.5rem 1.5rem 4rem 1.5rem;
          color: #E9E5DC;
          font-family: var(--font-sans, -apple-system, sans-serif);
        }

        .dc-map-header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 1.25rem;
          border-bottom: 1px solid rgba(242, 238, 231, 0.08);
          padding-bottom: 1.25rem;
          margin-bottom: 1rem;
        }

        .header-super-row {
          display: flex;
          align-items: center;
          gap: 0.65rem;
          margin-bottom: 0.25rem;
        }

        .header-super {
          font-family: var(--font-mono, monospace);
          font-size: 0.68rem;
          font-weight: 700;
          letter-spacing: 0.12em;
          color: #D66A35;
        }

        .header-title {
          font-size: 1.85rem;
          font-weight: 600;
          color: #F7F4ED;
          margin: 0 0 0.35rem 0;
          letter-spacing: -0.01em;
        }

        .header-desc {
          font-size: 0.85rem;
          line-height: 1.45;
          color: #A49F93;
          margin: 0;
          max-width: 720px;
        }

        .replay-toggle-btn {
          background: #181A18;
          border: 1px solid rgba(242, 238, 231, 0.14);
          color: #E9E5DC;
          font-family: var(--font-mono, monospace);
          font-size: 0.72rem;
          font-weight: 600;
          padding: 0.45rem 0.85rem;
          border-radius: 3px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          transition: all 0.12s ease;
        }

        .replay-toggle-btn:hover {
          border-color: #D66A35;
          color: #F7F4ED;
        }

        .replay-toggle-btn.active {
          background: rgba(214, 106, 53, 0.15);
          border-color: #D66A35;
          color: #D66A35;
        }

        .btn-pill {
          background: rgba(242, 238, 231, 0.08);
          font-size: 0.58rem;
          padding: 0.1rem 0.35rem;
          border-radius: 2px;
        }

        /* KPI Strip */
        .spatial-kpi-strip {
          display: flex;
          align-items: center;
          gap: 1.5rem;
          background: #121413;
          border: 1px solid rgba(242, 238, 231, 0.08);
          border-radius: 3px;
          padding: 0.65rem 1.25rem;
          margin-bottom: 1rem;
          font-family: var(--font-mono, monospace);
          font-size: 0.68rem;
          overflow-x: auto;
        }

        .kpi-cell {
          display: flex;
          align-items: baseline;
          gap: 0.5rem;
        }

        .kpi-label {
          color: #7A756D;
          font-size: 0.62rem;
        }

        .kpi-val {
          font-weight: 700;
          color: #F7F4ED;
        }

        .kpi-sep {
          width: 1px;
          height: 14px;
          background: rgba(242, 238, 231, 0.08);
        }

        .map-replay-tray {
          margin-bottom: 1rem;
          animation: trayIn 0.15s ease-out;
        }

        .map-canvas-container {
          border: 1px solid rgba(242, 238, 231, 0.1);
          border-radius: 4px;
          overflow: hidden;
          box-shadow: 0 12px 36px rgba(0, 0, 0, 0.6);
        }

        @keyframes trayIn {
          from { opacity: 0; transform: translateY(-6px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
