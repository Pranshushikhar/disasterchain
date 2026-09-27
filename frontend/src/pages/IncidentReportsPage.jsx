import React, { useState, useEffect, useMemo } from 'react';
import { fetchIncidents, updateIncidentStatus } from '../services/api';
import SourceBadge from '../components/SourceBadge';
import { useTranslation } from '../i18n/i18n';

/**
 * DISASTERCHAIN INCIDENT COMMAND WORKSPACE (/incidents)
 * Mission-critical operational triage queue tracking civilian hazard reports,
 * verification states, assigned response teams, and incident resolution lifecycles.
 */
export const INCIDENT_STATUSES = [
  'ALL',
  'NEW',
  'ACKNOWLEDGED',
  'INVESTIGATING',
  'ACTIVE',
  'CONTAINED',
  'RESOLVED',
];

export default function IncidentReportsPage({ onOpenIncident }) {
  const { t } = useTranslation();
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  const loadIncidents = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchIncidents();
      setIncidents(data || []);
      if (data && data.length > 0) {
        setSelectedIncident(data[0]);
      }
    } catch (err) {
      console.error('Error loading incidents:', err);
      setError('Unable to load telemetry incident queue.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadIncidents();
  }, []);

  const handleUpdateStatus = async (id, newStatus) => {
    setUpdatingId(id);
    try {
      await updateIncidentStatus(id, newStatus);
      setIncidents((prev) =>
        prev.map((inc) => (inc._id === id ? { ...inc, status: newStatus } : inc))
      );
      if (selectedIncident && selectedIncident._id === id) {
        setSelectedIncident((prev) => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      console.error('Failed to update incident status:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  // Normalizing status labels
  const normalizeStatus = (s) => {
    if (!s) return 'NEW';
    const upper = s.toUpperCase();
    if (upper === 'PENDING') return 'NEW';
    if (upper === 'UNDER REVIEW') return 'INVESTIGATING';
    return upper;
  };

  const filteredIncidents = useMemo(() => {
    return incidents.filter((inc) => {
      const curStatus = normalizeStatus(inc.status);
      if (statusFilter !== 'ALL' && curStatus !== statusFilter) return false;
      if (severityFilter !== 'ALL' && (inc.severity || 'Medium').toUpperCase() !== severityFilter) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const idMatch = (inc.incidentId || '').toLowerCase().includes(q);
        const titleMatch = (inc.title || '').toLowerCase().includes(q);
        const locMatch = (inc.location || '').toLowerCase().includes(q);
        const descMatch = (inc.description || '').toLowerCase().includes(q);
        return idMatch || titleMatch || locMatch || descMatch;
      }
      return true;
    });
  }, [incidents, statusFilter, severityFilter, searchQuery]);

  const getSeverityColor = (sev) => {
    switch (sev?.toLowerCase()) {
      case 'critical':
        return '#C84A3A';
      case 'high':
        return '#D66A35';
      case 'medium':
        return '#C69A3A';
      default:
        return '#5E8B68';
    }
  };

  return (
    <div className="dc-incidents-page-root" role="region" aria-label="Incident Command Workspace">
      {/* Header */}
      <div className="dc-inc-header">
        <div>
          <div className="inc-super-row">
            <span className="inc-super">INCIDENT COMMAND WORKSPACE</span>
            <SourceBadge
              source="Municipal Field Nodes"
              confidence="High"
              updatedAt="Continuous feed"
              compact={true}
            />
          </div>
          <h1 className="inc-title">Active Incident Triage Queue</h1>
          <p className="inc-desc">
            Operational triage management across reported hazards, waterlogging pooling, structural obstructions, and civic relief requests.
          </p>
        </div>

        <button
          type="button"
          className="inc-report-btn"
          onClick={onOpenIncident}
        >
          + Log Incident Report
        </button>
      </div>

      {/* Triage Filter Bar */}
      <div className="dc-inc-filter-bar">
        {/* Status Lifecycle Pills */}
        <div className="status-pills-track" role="tablist">
          {INCIDENT_STATUSES.map((st) => (
            <button
              key={st}
              type="button"
              className={`status-pill ${statusFilter === st ? 'active' : ''}`}
              onClick={() => setStatusFilter(st)}
            >
              {st}
            </button>
          ))}
        </div>

        {/* Severity Selector & Search */}
        <div className="filter-right-group">
          <select
            className="sev-select"
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
          >
            <option value="ALL">All Severities</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>

          <input
            type="text"
            className="inc-search-box"
            placeholder="Search incident ID, street, hazard..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Main Split Layout: Triage List (Left) & Incident Inspector (Right) */}
      <div className="dc-inc-split-layout">

        {/* Left Column: Triage List */}
        <div className="dc-inc-list-column">
          {loading ? (
            <div className="inc-empty-state">
              <span>SYNCING TELEMETRY QUEUE...</span>
            </div>
          ) : filteredIncidents.length === 0 ? (
            <div className="inc-empty-state">
              <span>NO INCIDENTS MATCHING CRITERIA</span>
              <p>All monitored hazard sectors within selected parameters are clear.</p>
            </div>
          ) : (
            filteredIncidents.map((inc) => {
              const isSelected = selectedIncident?._id === inc._id;
              const sevColor = getSeverityColor(inc.severity);
              const statusNormalized = normalizeStatus(inc.status);

              return (
                <div
                  key={inc._id || inc.incidentId}
                  className={`dc-inc-card ${isSelected ? 'selected' : ''}`}
                  onClick={() => setSelectedIncident(inc)}
                >
                  <div className="card-top-row">
                    <span className="card-id font-mono">{inc.incidentId || 'INC-LIVE'}</span>
                    <span
                      className="card-sev-pill"
                      style={{ color: sevColor, borderColor: sevColor }}
                    >
                      {(inc.severity || 'Medium').toUpperCase()}
                    </span>
                  </div>

                  <h4 className="card-title">{inc.title}</h4>

                  <div className="card-meta-row">
                    <span className="card-loc">{inc.location}</span>
                    <span className="card-sep">·</span>
                    <span className="card-time font-mono">
                      {new Date(inc.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <div className="card-bottom-row">
                    <span className="card-status-badge font-mono">
                      {statusNormalized}
                    </span>
                    <span className="card-type font-mono">{inc.type}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Column: Detailed Incident Inspector */}
        <div className="dc-inc-inspector-column">
          {selectedIncident ? (
            <div className="inspector-panel">
              {/* Top Banner */}
              <div className="insp-header-row">
                <div>
                  <span className="insp-id-tag font-mono">
                    {selectedIncident.incidentId || 'INC-LIVE'}
                  </span>
                  <h3 className="insp-title">{selectedIncident.title}</h3>
                </div>
                <span
                  className="insp-sev-pill"
                  style={{
                    color: getSeverityColor(selectedIncident.severity),
                    borderColor: getSeverityColor(selectedIncident.severity),
                  }}
                >
                  {selectedIncident.severity?.toUpperCase()} SEVERITY
                </span>
              </div>

              {/* Lifecycle Progress Stepper */}
              <div className="insp-stepper">
                {['NEW', 'ACKNOWLEDGED', 'INVESTIGATING', 'CONTAINED', 'RESOLVED'].map((step, idx) => {
                  const currentNorm = normalizeStatus(selectedIncident.status);
                  const stepIndex = ['NEW', 'ACKNOWLEDGED', 'INVESTIGATING', 'CONTAINED', 'RESOLVED'].indexOf(currentNorm);
                  const isDone = idx <= (stepIndex !== -1 ? stepIndex : 0);

                  return (
                    <div key={step} className={`step-node ${isDone ? 'done' : ''}`}>
                      <div className="step-circle">{idx + 1}</div>
                      <span className="step-label font-mono">{step}</span>
                    </div>
                  );
                })}
              </div>

              {/* Core Details Grid */}
              <div className="insp-fields-grid">
                <div className="insp-field">
                  <span className="field-lbl">LOCATION / SECTOR</span>
                  <span className="field-val">{selectedIncident.location}</span>
                </div>
                <div className="insp-field">
                  <span className="field-lbl">GPS COORDINATES</span>
                  <span className="field-val font-mono">
                    {selectedIncident.latitude || 28.6139}°, {selectedIncident.longitude || 77.2090}°
                  </span>
                </div>
                <div className="insp-field">
                  <span className="field-lbl">HAZARD CATEGORY</span>
                  <span className="field-val font-mono">{selectedIncident.type}</span>
                </div>
                <div className="insp-field">
                  <span className="field-lbl">LOGGED TIMESTAMP</span>
                  <span className="field-val font-mono">
                    {new Date(selectedIncident.createdAt || Date.now()).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Description Box */}
              <div className="insp-desc-box">
                <span className="desc-box-lbl font-mono">OBSERVATIONAL REPORT</span>
                <p className="desc-box-text">{selectedIncident.description}</p>
              </div>

              {/* Associated Resources */}
              <div className="insp-resources-box">
                <span className="res-box-lbl font-mono">RELATED RESCUE LINKAGES</span>
                <div className="res-items-row">
                  <div className="res-chip">
                    <span className="chip-k">Assigned Team:</span>
                    <span className="chip-v">Municipal Drainage Unit 4</span>
                  </div>
                  <div className="res-chip">
                    <span className="chip-k">Nearest Shelter:</span>
                    <span className="chip-v">Civil Shelter #2 (650m)</span>
                  </div>
                </div>
              </div>

              {/* Status Action Buttons */}
              <div className="insp-actions-row">
                <span className="actions-lbl font-mono">TRANSITION STATUS:</span>
                <div className="actions-btns">
                  {['ACKNOWLEDGED', 'INVESTIGATING', 'CONTAINED', 'RESOLVED'].map((nextSt) => (
                    <button
                      key={nextSt}
                      type="button"
                      className="status-change-btn"
                      disabled={updatingId === selectedIncident._id}
                      onClick={() => handleUpdateStatus(selectedIncident._id, nextSt)}
                    >
                      Mark {nextSt}
                    </button>
                  ))}
                </div>
              </div>

              <div className="insp-trust-row">
                <SourceBadge
                  source="Municipal Field Dispatch"
                  confidence="High"
                  updatedAt="Verified"
                  compact={true}
                />
              </div>
            </div>
          ) : (
            <div className="inspector-placeholder">
              <span>SELECT AN INCIDENT FROM THE TRIAGE QUEUE TO INSPECT</span>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .dc-incidents-page-root {
          max-width: 1400px;
          margin: 0 auto;
          padding: 1.5rem 1.5rem 4rem 1.5rem;
          color: #E9E5DC;
          font-family: var(--font-sans, -apple-system, sans-serif);
        }

        .dc-inc-header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 1.25rem;
          border-bottom: 1px solid rgba(242, 238, 231, 0.08);
          padding-bottom: 1.25rem;
          margin-bottom: 1.15rem;
        }

        .inc-super-row {
          display: flex;
          align-items: center;
          gap: 0.65rem;
          margin-bottom: 0.25rem;
        }

        .inc-super {
          font-family: var(--font-mono, monospace);
          font-size: 0.68rem;
          font-weight: 700;
          letter-spacing: 0.12em;
          color: #D66A35;
        }

        .inc-title {
          font-size: 1.85rem;
          font-weight: 600;
          color: #F7F4ED;
          margin: 0 0 0.35rem 0;
          letter-spacing: -0.01em;
        }

        .inc-desc {
          font-size: 0.85rem;
          line-height: 1.45;
          color: #A49F93;
          margin: 0;
          max-width: 720px;
        }

        .inc-report-btn {
          background: #D66A35;
          color: #121413;
          border: none;
          font-family: var(--font-mono, monospace);
          font-size: 0.74rem;
          font-weight: 700;
          letter-spacing: 0.06em;
          padding: 0.55rem 1rem;
          border-radius: 2px;
          cursor: pointer;
          transition: background 0.12s ease;
        }

        .inc-report-btn:hover {
          background: #E58A58;
        }

        /* Filter Bar */
        .dc-inc-filter-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 0.85rem;
          background: #121413;
          border: 1px solid rgba(242, 238, 231, 0.08);
          border-radius: 3px;
          padding: 0.55rem 0.85rem;
          margin-bottom: 1.25rem;
        }

        .status-pills-track {
          display: flex;
          flex-wrap: wrap;
          gap: 0.3rem;
        }

        .status-pill {
          background: transparent;
          border: 1px solid rgba(242, 238, 231, 0.1);
          color: #A49F93;
          font-family: var(--font-mono, monospace);
          font-size: 0.62rem;
          padding: 0.2rem 0.5rem;
          border-radius: 2px;
          cursor: pointer;
          transition: all 0.12s ease;
        }

        .status-pill:hover {
          color: #F7F4ED;
          border-color: rgba(242, 238, 231, 0.25);
        }

        .status-pill.active {
          background: rgba(214, 106, 53, 0.15);
          color: #D66A35;
          border-color: #D66A35;
          font-weight: 700;
        }

        .filter-right-group {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .sev-select {
          background: #181A18;
          border: 1px solid rgba(242, 238, 231, 0.12);
          color: #E9E5DC;
          font-family: var(--font-mono, monospace);
          font-size: 0.68rem;
          padding: 0.3rem 0.5rem;
          border-radius: 2px;
          outline: none;
        }

        .inc-search-box {
          background: #181A18;
          border: 1px solid rgba(242, 238, 231, 0.12);
          color: #F7F4ED;
          font-size: 0.78rem;
          padding: 0.3rem 0.65rem;
          border-radius: 2px;
          width: 220px;
          outline: none;
        }

        .inc-search-box:focus {
          border-color: #D66A35;
        }

        /* Split Layout */
        .dc-inc-split-layout {
          display: grid;
          grid-template-columns: 420px 1fr;
          gap: 1.5rem;
          align-items: start;
        }

        @media (max-width: 990px) {
          .dc-inc-split-layout {
            grid-template-columns: 1fr;
          }
        }

        /* List Column */
        .dc-inc-list-column {
          display: flex;
          flex-direction: column;
          gap: 0.65rem;
          max-height: calc(100vh - 260px);
          overflow-y: auto;
          padding-right: 0.25rem;
        }

        .dc-inc-card {
          background: #121413;
          border: 1px solid rgba(242, 238, 231, 0.08);
          border-radius: 3px;
          padding: 0.85rem;
          cursor: pointer;
          transition: all 0.12s ease;
        }

        .dc-inc-card:hover {
          border-color: rgba(242, 238, 231, 0.25);
          background: rgba(24, 26, 24, 0.6);
        }

        .dc-inc-card.selected {
          border-color: #D66A35;
          border-left: 3px solid #D66A35;
          background: rgba(214, 106, 53, 0.05);
        }

        .card-top-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 0.35rem;
        }

        .card-id {
          font-size: 0.65rem;
          color: #7A756D;
          font-weight: 700;
        }

        .card-sev-pill {
          font-family: var(--font-mono, monospace);
          font-size: 0.58rem;
          font-weight: 700;
          letter-spacing: 0.06em;
          padding: 0.1rem 0.35rem;
          border: 1px solid;
          border-radius: 2px;
        }

        .card-title {
          font-size: 0.92rem;
          font-weight: 600;
          color: #F7F4ED;
          margin: 0 0 0.35rem 0;
          line-height: 1.3;
        }

        .card-meta-row {
          font-size: 0.74rem;
          color: #A49F93;
          display: flex;
          align-items: center;
          gap: 0.35rem;
          margin-bottom: 0.55rem;
        }

        .card-sep {
          color: rgba(242, 238, 231, 0.15);
        }

        .card-bottom-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-top: 1px solid rgba(242, 238, 231, 0.06);
          padding-top: 0.45rem;
        }

        .card-status-badge {
          font-size: 0.62rem;
          color: #D66A35;
          font-weight: 700;
        }

        .card-type {
          font-size: 0.62rem;
          color: #7A756D;
        }

        /* Inspector Column */
        .inspector-panel {
          background: #121413;
          border: 1px solid rgba(242, 238, 231, 0.1);
          border-radius: 4px;
          padding: 1.5rem;
        }

        .insp-header-row {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 1rem;
          border-bottom: 1px solid rgba(242, 238, 231, 0.08);
          padding-bottom: 1rem;
          margin-bottom: 1.25rem;
        }

        .insp-id-tag {
          font-size: 0.68rem;
          font-weight: 700;
          color: #D66A35;
          display: block;
          margin-bottom: 0.2rem;
        }

        .insp-title {
          font-size: 1.35rem;
          font-weight: 600;
          color: #F7F4ED;
          margin: 0;
          line-height: 1.3;
        }

        .insp-sev-pill {
          font-family: var(--font-mono, monospace);
          font-size: 0.65rem;
          font-weight: 700;
          letter-spacing: 0.06em;
          padding: 0.2rem 0.5rem;
          border: 1px solid;
          border-radius: 2px;
          white-space: nowrap;
        }

        /* Stepper */
        .insp-stepper {
          display: flex;
          justify-content: space-between;
          background: #181A18;
          border: 1px solid rgba(242, 238, 231, 0.06);
          border-radius: 3px;
          padding: 0.75rem 1rem;
          margin-bottom: 1.25rem;
          overflow-x: auto;
        }

        .step-node {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          opacity: 0.4;
        }

        .step-node.done {
          opacity: 1;
        }

        .step-circle {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: #121413;
          border: 1px solid #7A756D;
          font-size: 0.6rem;
          font-family: var(--font-mono, monospace);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #A49F93;
        }

        .step-node.done .step-circle {
          background: #D66A35;
          border-color: #D66A35;
          color: #121413;
          font-weight: 700;
        }

        .step-label {
          font-size: 0.62rem;
          color: #E9E5DC;
        }

        /* Details Grid */
        .insp-fields-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
          margin-bottom: 1.25rem;
        }

        .insp-field {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .field-lbl {
          font-family: var(--font-mono, monospace);
          font-size: 0.6rem;
          color: #7A756D;
          letter-spacing: 0.06em;
        }

        .field-val {
          font-size: 0.85rem;
          color: #F7F4ED;
          font-weight: 500;
        }

        /* Desc Box */
        .insp-desc-box {
          background: #181A18;
          border: 1px solid rgba(242, 238, 231, 0.08);
          border-radius: 3px;
          padding: 0.95rem;
          margin-bottom: 1.25rem;
        }

        .desc-box-lbl {
          display: block;
          font-size: 0.62rem;
          color: #7A756D;
          letter-spacing: 0.08em;
          margin-bottom: 0.35rem;
        }

        .desc-box-text {
          font-size: 0.85rem;
          line-height: 1.45;
          color: #E9E5DC;
          margin: 0;
        }

        /* Resources Box */
        .insp-resources-box {
          margin-bottom: 1.25rem;
        }

        .res-box-lbl {
          display: block;
          font-size: 0.62rem;
          color: #7A756D;
          letter-spacing: 0.08em;
          margin-bottom: 0.45rem;
        }

        .res-items-row {
          display: flex;
          flex-wrap: wrap;
          gap: 0.75rem;
        }

        .res-chip {
          background: #181A18;
          border: 1px solid rgba(242, 238, 231, 0.08);
          border-radius: 2px;
          padding: 0.35rem 0.65rem;
          font-size: 0.74rem;
          display: flex;
          gap: 0.35rem;
        }

        .chip-k {
          color: #7A756D;
        }

        .chip-v {
          color: #E9E5DC;
          font-weight: 600;
        }

        /* Transition Actions */
        .insp-actions-row {
          border-top: 1px solid rgba(242, 238, 231, 0.08);
          padding-top: 1rem;
          margin-bottom: 1rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 0.65rem;
        }

        .actions-lbl {
          font-size: 0.62rem;
          color: #7A756D;
        }

        .actions-btns {
          display: flex;
          flex-wrap: wrap;
          gap: 0.45rem;
        }

        .status-change-btn {
          background: #181A18;
          border: 1px solid rgba(242, 238, 231, 0.15);
          color: #E9E5DC;
          font-family: var(--font-mono, monospace);
          font-size: 0.65rem;
          padding: 0.25rem 0.55rem;
          border-radius: 2px;
          cursor: pointer;
          transition: all 0.12s ease;
        }

        .status-change-btn:hover:not(:disabled) {
          border-color: #D66A35;
          color: #D66A35;
        }

        .insp-trust-row {
          border-top: 1px solid rgba(242, 238, 231, 0.06);
          padding-top: 0.75rem;
        }

        .inspector-placeholder {
          background: #121413;
          border: 1px dashed rgba(242, 238, 231, 0.12);
          border-radius: 4px;
          padding: 4rem 2rem;
          text-align: center;
          font-family: var(--font-mono, monospace);
          font-size: 0.72rem;
          color: #7A756D;
          letter-spacing: 0.08em;
        }

        .inc-empty-state {
          padding: 3rem 1.5rem;
          text-align: center;
          font-family: var(--font-mono, monospace);
        }

        .inc-empty-state span {
          display: block;
          font-size: 0.72rem;
          font-weight: 700;
          color: #7A756D;
          letter-spacing: 0.1em;
          margin-bottom: 0.35rem;
        }

        .inc-empty-state p {
          font-size: 0.78rem;
          color: #A49F93;
          margin: 0;
          font-family: var(--font-sans, sans-serif);
        }
      `}</style>
    </div>
  );
}
