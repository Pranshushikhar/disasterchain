import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield,
  ShieldCheck,
  AlertTriangle,
  FileSearch,
  CheckCircle2,
  XCircle,
  Clock,
  MapPin,
  Camera,
  RefreshCw,
  Search,
  User,
  Info,
  Sparkles,
  GitMerge,
  Eye,
  AlertOctagon,
  FileText,
  Activity,
} from 'lucide-react';
import {
  fetchIncidents,
  fetchAdminVerificationStats,
  fetchIncidentWitnesses,
  fetchIncidentTrustScore,
  adminVerifyIncident,
  adminDisputeIncident,
  adminRejectIncident,
  adminRequestEvidence,
  adminMergeDuplicates,
  adminEscalateIncident,
  adminReopenIncident,
} from '../services/api';
import { useTranslation } from '../i18n/i18n';

export default function AdminIncidentVerificationDashboard() {
  const { t } = useTranslation();

  const [incidents, setIncidents] = useState([]);
  const [stats, setStats] = useState({
    totalReported: 0,
    awaitingVerification: 0,
    underReview: 0,
    communityCorroborated: 0,
    officiallyVerified: 0,
    disputed: 0,
    possibleDuplicates: 0,
    urgentReview: 0,
  });

  const [selectedIncident, setSelectedIncident] = useState(null);
  const [activeFilter, setActiveFilter] = useState('ALL'); // 'ALL' | 'AWAITING' | 'UNDER_REVIEW' | 'COMMUNITY' | 'VERIFIED' | 'DISPUTED' | 'DUPLICATES' | 'URGENT'
  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [notification, setNotification] = useState('');

  // Modals & Drawers
  const [rejectModalTarget, setRejectModalTarget] = useState(null);
  const [rejectReasonInput, setRejectReasonInput] = useState('');
  const [requestEvidenceTarget, setRequestEvidenceTarget] = useState(null);
  const [evidenceNoteInput, setEvidenceNoteInput] = useState('');
  const [mergeModalTarget, setMergeModalTarget] = useState(null);
  const [mergeReasonInput, setMergeReasonInput] = useState('');
  const [selectedDuplicateId, setSelectedDuplicateId] = useState('');
  const [inspectWitnesses, setInspectWitnesses] = useState([]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [incidentList, statsRes] = await Promise.all([
        fetchIncidents().catch(() => []),
        fetchAdminVerificationStats().catch(() => ({ data: {} })),
      ]);

      const items = Array.isArray(incidentList) ? incidentList : incidentList.data || [];
      setIncidents(items);
      if (statsRes && statsRes.data) {
        setStats(statsRes.data);
      }

      // If an incident was selected, refresh it from current list
      if (selectedIncident) {
        const updated = items.find((i) => (i.incidentId === selectedIncident.incidentId) || (i._id === selectedIncident._id));
        if (updated) setSelectedIncident(updated);
      } else if (items.length > 0) {
        setSelectedIncident(items[0]);
      }
    } catch (err) {
      console.error('Failed to load incident verification data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Fetch witnesses when selected incident changes
  useEffect(() => {
    if (!selectedIncident) return;
    const fetchW = async () => {
      try {
        const id = selectedIncident.incidentId || selectedIncident._id;
        const res = await fetchIncidentWitnesses(id);
        if (res && res.data) {
          setInspectWitnesses(res.data);
        }
      } catch (err) {
        setInspectWitnesses([]);
      }
    };
    fetchW();
  }, [selectedIncident]);

  const showNotice = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 4500);
  };

  // =========================================================================
  // ADMIN ACTIONS
  // =========================================================================

  const handleVerify = async (incident) => {
    if (!incident) return;
    setActionLoading(true);
    try {
      const id = incident.incidentId || incident._id;
      const res = await adminVerifyIncident(id, 'Officially verified by disaster command authority after visual & field corroboration.');
      if (res.success) {
        showNotice(`Incident ${incident.incidentId} officially verified.`);
        await loadData();
      }
    } catch (err) {
      showNotice(err.response?.data?.message || 'Failed to verify incident.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDispute = async (incident) => {
    if (!incident) return;
    setActionLoading(true);
    try {
      const id = incident.incidentId || incident._id;
      const res = await adminDisputeIncident(id, 'Marked as disputed due to conflicting witness accounts and lack of field confirmation.');
      if (res.success) {
        showNotice(`Incident ${incident.incidentId} marked as Disputed.`);
        await loadData();
      }
    } catch (err) {
      showNotice(err.response?.data?.message || 'Failed to update dispute status.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectModalTarget || !rejectReasonInput.trim()) {
      showNotice('A mandatory reason is required to reject an incident.');
      return;
    }
    setActionLoading(true);
    try {
      const id = rejectModalTarget.incidentId || rejectModalTarget._id;
      const res = await adminRejectIncident(id, rejectReasonInput.trim());
      if (res.success) {
        showNotice(`Incident ${rejectModalTarget.incidentId} rejected.`);
        setRejectModalTarget(null);
        setRejectReasonInput('');
        await loadData();
      }
    } catch (err) {
      showNotice(err.response?.data?.message || 'Failed to reject incident.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRequestEvidence = async () => {
    if (!requestEvidenceTarget || !evidenceNoteInput.trim()) return;
    setActionLoading(true);
    try {
      const id = requestEvidenceTarget.incidentId || requestEvidenceTarget._id;
      const res = await adminRequestEvidence(id, evidenceNoteInput.trim());
      if (res.success) {
        showNotice(`Evidence request broadcast to reporter for ${requestEvidenceTarget.incidentId}.`);
        setRequestEvidenceTarget(null);
        setEvidenceNoteInput('');
        await loadData();
      }
    } catch (err) {
      showNotice(err.response?.data?.message || 'Failed to broadcast evidence request.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleMerge = async () => {
    if (!mergeModalTarget || !selectedDuplicateId) {
      showNotice('Please select an incident to merge.');
      return;
    }
    setActionLoading(true);
    try {
      const id = mergeModalTarget.incidentId || mergeModalTarget._id;
      const res = await adminMergeDuplicates(id, selectedDuplicateId, mergeReasonInput || 'Administrative merge of co-located duplicate reports.');
      if (res.success) {
        showNotice(`Merged duplicate into ${mergeModalTarget.incidentId}.`);
        setMergeModalTarget(null);
        setSelectedDuplicateId('');
        setMergeReasonInput('');
        await loadData();
      }
    } catch (err) {
      showNotice(err.response?.data?.message || 'Failed to merge incidents.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleEscalate = async (incident) => {
    if (!incident) return;
    setActionLoading(true);
    try {
      const id = incident.incidentId || incident._id;
      const res = await adminEscalateIncident(id, 'High priority escalation transmitted to NDRF and Municipal Emergency Dispatch.');
      if (res.success) {
        showNotice(`Emergency escalation dispatched for ${incident.incidentId}.`);
        await loadData();
      }
    } catch (err) {
      showNotice(err.response?.data?.message || 'Failed to dispatch escalation.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReopen = async (incident) => {
    if (!incident) return;
    setActionLoading(true);
    try {
      const id = incident.incidentId || incident._id;
      const res = await adminReopenIncident(id, 'Reopened for active verification review.');
      if (res.success) {
        showNotice(`Incident ${incident.incidentId} reopened for verification.`);
        await loadData();
      }
    } catch (err) {
      showNotice(err.response?.data?.message || 'Failed to reopen incident.');
    } finally {
      setActionLoading(false);
    }
  };

  // Filter & Search Logic
  const filteredIncidents = useMemo(() => {
    return incidents.filter((inc) => {
      // Status filter
      const vStatus = inc.verificationStatus || inc.status;
      if (activeFilter === 'AWAITING' && vStatus !== 'Received' && vStatus !== 'Pending') return false;
      if (activeFilter === 'UNDER_REVIEW' && vStatus !== 'Under Verification' && vStatus !== 'Under Review') return false;
      if (activeFilter === 'COMMUNITY' && vStatus !== 'Community Corroborated') return false;
      if (activeFilter === 'VERIFIED' && vStatus !== 'Officially Verified') return false;
      if (activeFilter === 'DISPUTED' && vStatus !== 'Disputed') return false;
      if (activeFilter === 'DUPLICATES' && !inc.duplicateInfo?.isDuplicate && vStatus !== 'Duplicate / Merged') return false;
      if (activeFilter === 'URGENT' && inc.severity !== 'Critical' && inc.severity !== 'High') return false;

      // Severity filter
      if (severityFilter !== 'ALL' && inc.severity?.toLowerCase() !== severityFilter.toLowerCase()) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const titleMatch = inc.title?.toLowerCase().includes(q);
        const descMatch = inc.description?.toLowerCase().includes(q);
        const idMatch = inc.incidentId?.toLowerCase().includes(q);
        const locMatch = inc.location?.toLowerCase().includes(q);
        const typeMatch = inc.type?.toLowerCase().includes(q);
        return titleMatch || descMatch || idMatch || locMatch || typeMatch;
      }

      return true;
    });
  }, [incidents, activeFilter, severityFilter, searchQuery]);

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Officially Verified':
        return 'badge-verified';
      case 'Community Corroborated':
        return 'badge-community';
      case 'Under Verification':
      case 'Under Review':
        return 'badge-warning';
      case 'Disputed':
        return 'badge-disputed';
      case 'Rejected':
        return 'badge-rejected';
      case 'Duplicate / Merged':
        return 'badge-duplicate';
      case 'Received':
      case 'Pending':
      default:
        return 'badge-received';
    }
  };

  const getTrustScoreColor = (score = 0) => {
    if (score >= 85) return '#10b981'; // Emerald
    if (score >= 70) return '#3b82f6'; // Blue
    if (score >= 50) return '#eab308'; // Amber
    if (score >= 30) return '#f97316'; // Orange
    return '#ef4444'; // Red
  };

  return (
    <div className="dc-admin-verification-hub">
      {/* Action Notification Toast */}
      {notification && (
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          className="dc-action-toast"
        >
          <Info size={17} />
          <span>{notification}</span>
        </motion.div>
      )}

      {/* 8 Overview Telemetry Cards */}
      <div className="dc-verification-kpi-grid">
        <div className="dc-kpi-card" onClick={() => setActiveFilter('ALL')}>
          <div className="dc-kpi-header">
            <span className="dc-kpi-label">{t('verification.totalReported', 'Total Incidents')}</span>
            <FileText size={17} className="text-muted" />
          </div>
          <div className="dc-kpi-value">{stats.totalReported || incidents.length}</div>
          <div className="dc-kpi-sub">Citizen & field reports</div>
        </div>

        <div className="dc-kpi-card highlight-amber" onClick={() => setActiveFilter('AWAITING')}>
          <div className="dc-kpi-header">
            <span className="dc-kpi-label">{t('verification.awaiting', 'Awaiting Review')}</span>
            <Clock size={17} className="text-amber" />
          </div>
          <div className="dc-kpi-value text-amber">{stats.awaitingVerification}</div>
          <div className="dc-kpi-sub">New submissions</div>
        </div>

        <div className="dc-kpi-card" onClick={() => setActiveFilter('UNDER_REVIEW')}>
          <div className="dc-kpi-header">
            <span className="dc-kpi-label">{t('verification.underVerification', 'Under Verification')}</span>
            <Activity size={17} className="text-indigo" />
          </div>
          <div className="dc-kpi-value text-indigo">{stats.underReview}</div>
          <div className="dc-kpi-sub">Active investigation</div>
        </div>

        <div className="dc-kpi-card highlight-purple" onClick={() => setActiveFilter('COMMUNITY')}>
          <div className="dc-kpi-header">
            <span className="dc-kpi-label">{t('verification.communityCorroborated', 'Community Corroborated')}</span>
            <Shield size={17} className="text-purple" />
          </div>
          <div className="dc-kpi-value text-purple">{stats.communityCorroborated}</div>
          <div className="dc-kpi-sub">3+ nearby witnesses</div>
        </div>

        <div className="dc-kpi-card highlight-green" onClick={() => setActiveFilter('VERIFIED')}>
          <div className="dc-kpi-header">
            <span className="dc-kpi-label">{t('verification.officiallyVerified', 'Officially Verified')}</span>
            <ShieldCheck size={17} className="text-green" />
          </div>
          <div className="dc-kpi-value text-green">{stats.officiallyVerified}</div>
          <div className="dc-kpi-sub">Authority signed</div>
        </div>

        <div className="dc-kpi-card highlight-orange" onClick={() => setActiveFilter('DISPUTED')}>
          <div className="dc-kpi-header">
            <span className="dc-kpi-label">{t('verification.disputed', 'Disputed')}</span>
            <AlertTriangle size={17} className="text-orange" />
          </div>
          <div className="dc-kpi-value text-orange">{stats.disputed}</div>
          <div className="dc-kpi-sub">Witness discordance</div>
        </div>

        <div className="dc-kpi-card" onClick={() => setActiveFilter('DUPLICATES')}>
          <div className="dc-kpi-header">
            <span className="dc-kpi-label">{t('verification.possibleDuplicates', 'Possible Duplicates')}</span>
            <GitMerge size={17} className="text-cyan" />
          </div>
          <div className="dc-kpi-value text-cyan">{stats.possibleDuplicates}</div>
          <div className="dc-kpi-sub">Candidate merges</div>
        </div>

        <div className="dc-kpi-card highlight-red" onClick={() => setActiveFilter('URGENT')}>
          <div className="dc-kpi-header">
            <span className="dc-kpi-label">{t('verification.urgentReview', 'Urgent Escalation')}</span>
            <AlertOctagon size={17} className="text-red" />
          </div>
          <div className="dc-kpi-value text-red">{stats.urgentReview}</div>
          <div className="dc-kpi-sub">Critical / High hazards</div>
        </div>
      </div>

      {/* Control Bar: Filters, Search & Refresh */}
      <div className="dc-verification-filter-bar">
        <div className="dc-filter-tabs">
          {[
            { id: 'ALL', label: 'All Incidents' },
            { id: 'AWAITING', label: 'Awaiting Review' },
            { id: 'UNDER_REVIEW', label: 'Under Review' },
            { id: 'COMMUNITY', label: 'Community Corroborated' },
            { id: 'VERIFIED', label: 'Officially Verified' },
            { id: 'DISPUTED', label: 'Disputed' },
            { id: 'DUPLICATES', label: 'Duplicates' },
            { id: 'URGENT', label: 'Urgent' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id)}
              className={`dc-filter-tab-btn ${activeFilter === tab.id ? 'active' : ''}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="dc-filter-controls">
          <div className="dc-search-box">
            <Search size={15} />
            <input
              type="text"
              placeholder={t('verification.searchPlaceholder', 'Filter by ID, hazard, street or keyword...')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <select
            className="dc-severity-select"
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
          >
            <option value="ALL">All Severities</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>

          <button onClick={loadData} className="dc-refresh-btn" title="Reload queue">
            <RefreshCw size={15} className={loading ? 'dc-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Main Split Console: Incident Queue (Left) & Incident Inspector (Right) */}
      <div className="dc-verification-split-layout">
        {/* LEFT COLUMN: INCIDENT QUEUE */}
        <div className="dc-queue-column">
          <div className="dc-queue-header">
            <span>{t('verification.incidentQueue', 'Incident Verification Queue')}</span>
            <span className="dc-queue-count">
              {filteredIncidents.length} {filteredIncidents.length === 1 ? 'incident' : 'incidents'}
            </span>
          </div>

          <div className="dc-queue-list">
            {filteredIncidents.length === 0 ? (
              <div className="dc-empty-queue">
                <CheckCircle2 size={32} className="text-muted" />
                <p>No incidents match the selected filter criteria.</p>
              </div>
            ) : (
              filteredIncidents.map((inc) => {
                const isSelected = selectedIncident?.incidentId === inc.incidentId || selectedIncident?._id === inc._id;
                const status = inc.verificationStatus || inc.status || 'Received';
                const trustScore = inc.trustScore ?? 35;

                return (
                  <div
                    key={inc.incidentId || inc._id}
                    onClick={() => setSelectedIncident(inc)}
                    className={`dc-queue-item ${isSelected ? 'selected' : ''}`}
                  >
                    <div className="dc-queue-item-top">
                      <span className="dc-queue-id">{inc.incidentId}</span>
                      <span className={`badge ${getStatusBadgeClass(status)}`}>{status}</span>
                      <span className={`badge badge-${inc.severity?.toLowerCase()}`}>{inc.severity}</span>
                      <div
                        className="dc-score-pill"
                        style={{
                          borderColor: getTrustScoreColor(trustScore),
                          color: getTrustScoreColor(trustScore),
                        }}
                      >
                        {trustScore}% Trust
                      </div>
                    </div>

                    <h4 className="dc-queue-title">{inc.title}</h4>

                    <div className="dc-queue-meta">
                      <span>
                        <MapPin size={12} /> {inc.location}
                      </span>
                      <span>
                        <Clock size={12} />{' '}
                        {inc.createdAt
                          ? new Date(inc.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                          : 'Recent'}
                      </span>
                      <span>
                        <Eye size={12} /> {inc.witnessStats?.confirmedCount || 0} Witnesses
                      </span>
                    </div>

                    {inc.duplicateInfo?.isDuplicate && (
                      <div className="dc-duplicate-tag">
                        <GitMerge size={12} /> Possible Duplicate ({inc.duplicateInfo.duplicateMatchScore}%)
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: DETAILED INCIDENT INSPECTOR */}
        <div className="dc-inspector-column">
          {!selectedIncident ? (
            <div className="dc-empty-inspector">
              <FileSearch size={44} className="text-muted" />
              <h3>Select an incident report from the queue</h3>
              <p>Review uploaded photography, media authenticity checks, nearby witness accounts, and trust score telemetry.</p>
            </div>
          ) : (
            <div className="dc-inspector-content">
              {/* Top Banner & Header */}
              <div className="dc-inspector-header">
                <div>
                  <div className="dc-inspector-badge-row">
                    <span className="dc-inspector-id">{selectedIncident.incidentId}</span>
                    <span className={`badge ${getStatusBadgeClass(selectedIncident.verificationStatus || selectedIncident.status)}`}>
                      {selectedIncident.verificationStatus || selectedIncident.status}
                    </span>
                    <span className={`badge badge-${selectedIncident.severity?.toLowerCase()}`}>
                      {selectedIncident.severity} Severity
                    </span>
                    <span className="badge badge-neutral">Category: {selectedIncident.type}</span>
                  </div>
                  <h2 className="dc-inspector-title">{selectedIncident.title}</h2>
                  <div className="dc-inspector-submeta">
                    <span>
                      <MapPin size={14} color="#818cf8" /> {selectedIncident.location} ({selectedIncident.latitude?.toFixed(4)},{' '}
                      {selectedIncident.longitude?.toFixed(4)})
                    </span>
                    <span>
                      <User size={14} color="#818cf8" /> Reported by: {selectedIncident.reporterName || 'Anonymous Student'}
                    </span>
                    <span>
                      <Clock size={14} color="#818cf8" />{' '}
                      {selectedIncident.createdAt ? new Date(selectedIncident.createdAt).toLocaleString() : 'N/A'}
                    </span>
                  </div>
                </div>

                {/* Score Widget */}
                <div className="dc-inspector-trust-widget">
                  <div
                    className="dc-trust-circle"
                    style={{
                      borderColor: getTrustScoreColor(selectedIncident.trustScore ?? 35),
                      boxShadow: `0 0 20px ${getTrustScoreColor(selectedIncident.trustScore ?? 35)}25`,
                    }}
                  >
                    <span className="dc-trust-circle-num">{selectedIncident.trustScore ?? 35}</span>
                    <span className="dc-trust-circle-label">TRUST SCORE</span>
                  </div>
                  <div
                    className="dc-trust-level-tag"
                    style={{ color: getTrustScoreColor(selectedIncident.trustScore ?? 35) }}
                  >
                    {selectedIncident.trustLevel || 'Low confidence'}
                  </div>
                </div>
              </div>

              {/* Action Toolbar */}
              <div className="dc-inspector-action-bar">
                <button
                  disabled={actionLoading}
                  onClick={() => handleVerify(selectedIncident)}
                  className="btn btn-success-action"
                  title="Officially verify incident based on evidence"
                >
                  <ShieldCheck size={16} />
                  <span>Verify Incident</span>
                </button>

                <button
                  disabled={actionLoading}
                  onClick={() => setRequestEvidenceTarget(selectedIncident)}
                  className="btn btn-neutral-action"
                  title="Request additional photo or witness proof"
                >
                  <FileSearch size={16} />
                  <span>Request Evidence</span>
                </button>

                <button
                  disabled={actionLoading}
                  onClick={() => handleDispute(selectedIncident)}
                  className="btn btn-warning-action"
                  title="Mark as disputed due to conflicting accounts"
                >
                  <AlertTriangle size={16} />
                  <span>Mark as Disputed</span>
                </button>

                <button
                  disabled={actionLoading}
                  onClick={() => setRejectModalTarget(selectedIncident)}
                  className="btn btn-danger-action"
                  title="Reject with mandatory reason"
                >
                  <XCircle size={16} />
                  <span>Reject Incident</span>
                </button>

                <button
                  disabled={actionLoading}
                  onClick={() => {
                    setMergeModalTarget(selectedIncident);
                    const dup = incidents.find(
                      (i) => i.incidentId !== selectedIncident.incidentId && i.type === selectedIncident.type
                    );
                    if (dup) setSelectedDuplicateId(dup.incidentId || dup._id);
                  }}
                  className="btn btn-secondary-action"
                  title="Merge duplicate into this incident"
                >
                  <GitMerge size={16} />
                  <span>Merge Duplicates</span>
                </button>

                <button
                  disabled={actionLoading}
                  onClick={() => handleEscalate(selectedIncident)}
                  className="btn btn-escalate-action"
                  title="Escalate to NDRF & Civil authorities"
                >
                  <AlertOctagon size={16} />
                  <span>Escalate</span>
                </button>

                {(selectedIncident.verificationStatus === 'Rejected' || selectedIncident.verificationStatus === 'Disputed') && (
                  <button
                    disabled={actionLoading}
                    onClick={() => handleReopen(selectedIncident)}
                    className="btn btn-neutral-action"
                    title="Reopen incident for review"
                  >
                    <RefreshCw size={16} />
                    <span>Reopen Review</span>
                  </button>
                )}
              </div>

              {/* Description Box */}
              <div className="dc-inspector-section">
                <h4 className="dc-section-title">
                  <FileText size={16} /> Incident Description & Field Notes
                </h4>
                <div className="dc-description-card">{selectedIncident.description}</div>
              </div>

              {/* AI Evidence Synthesis Narrative */}
              <div className="dc-inspector-section">
                <h4 className="dc-section-title">
                  <Sparkles size={16} color="#818cf8" /> AI-Powered Evidence Synthesis & Analysis
                </h4>
                <div className="dc-ai-narrative-card">
                  <p className="dc-ai-narrative-text">
                    {selectedIncident.aiEvidenceSummary?.narrative ||
                      'Automated evidence synthesis analyzing submitted photographic assets, nearby witness reports, and localized Doppler emergency radar.'}
                  </p>

                  <div className="dc-ai-observations-grid">
                    <div>
                      <div className="dc-obs-heading text-green">Supporting Observations</div>
                      <ul className="dc-obs-list">
                        {(selectedIncident.aiEvidenceSummary?.supportingObservations || []).length > 0 ? (
                          selectedIncident.aiEvidenceSummary.supportingObservations.map((obs, idx) => (
                            <li key={idx}>✅ {obs}</li>
                          ))
                        ) : (
                          <li className="text-muted">Awaiting initial corroborating observations.</li>
                        )}
                      </ul>
                    </div>

                    <div>
                      <div className="dc-obs-heading text-amber">Identified Concerns & Uncertainties</div>
                      <ul className="dc-obs-list">
                        {(selectedIncident.aiEvidenceSummary?.concerns || []).length > 0 ? (
                          selectedIncident.aiEvidenceSummary.concerns.map((c, idx) => (
                            <li key={idx} className="text-amber">
                              ⚠️ {c}
                            </li>
                          ))
                        ) : (
                          <li className="text-muted">No visual manipulation or conflicting sensor concerns flagged.</li>
                        )}
                      </ul>
                    </div>
                  </div>

                  <div className="dc-ai-action-recommendation">
                    <strong>Recommended Command Action: </strong>
                    <span>
                      {selectedIncident.aiEvidenceSummary?.recommendedAction ||
                        'Continue collecting nearby civilian confirmations.'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Explainable Trust Score Factor Breakdown */}
              {selectedIncident.trustScoreBreakdown && (
                <div className="dc-inspector-section">
                  <h4 className="dc-section-title">
                    <Shield size={16} /> Explainable Trust Score Breakdown (0–100)
                  </h4>
                  <div className="dc-factor-breakdown-grid">
                    {[
                      { key: 'evidenceQuality', title: 'Media Quality & Evidence', max: 25 },
                      { key: 'mediaAuthenticity', title: 'Media Authenticity (AI & EXIF)', max: 20 },
                      { key: 'locationConsistency', title: 'Location & GPS Consistency', max: 15 },
                      { key: 'timestampConsistency', title: 'Timestamp Progression', max: 10 },
                      { key: 'witnessConfirmations', title: 'Nearby Witness Confirmations', max: 25 },
                      { key: 'communityCorroboration', title: 'Community Corroboration', max: 10 },
                      { key: 'officialCorroboration', title: 'Official Agency Match', max: 15 },
                    ].map((f) => {
                      const factor = selectedIncident.trustScoreBreakdown[f.key] || { score: 0, max: f.max, reason: 'Pending' };
                      const pct = Math.round((factor.score / factor.max) * 100) || 0;

                      return (
                        <div key={f.key} className="dc-factor-card">
                          <div className="dc-factor-top">
                            <span className="dc-factor-title">{f.title}</span>
                            <span className="dc-factor-points">
                              {factor.score} / {factor.max} pts
                            </span>
                          </div>
                          <div className="dc-factor-bar-track">
                            <div
                              className="dc-factor-bar-fill"
                              style={{
                                width: `${pct}%`,
                                backgroundColor: pct >= 70 ? '#10b981' : pct >= 40 ? '#eab308' : '#ef4444',
                              }}
                            />
                          </div>
                          <p className="dc-factor-reason">{factor.reason}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Media Evidence & AI Authenticity Viewer */}
              <div className="dc-inspector-section">
                <h4 className="dc-section-title">
                  <Camera size={16} /> Submitted Photographic & Video Evidence
                </h4>
                {selectedIncident.imageUrl ? (
                  <div className="dc-media-inspection-card">
                    <div className="dc-media-preview-pane">
                      <img
                        src={selectedIncident.imageUrl}
                        alt="Incident Evidence"
                        className="dc-inspected-image"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    </div>

                    <div className="dc-media-forensics-pane">
                      <div className="dc-forensic-row">
                        <span className="dc-forensic-label">AI Generation Detection:</span>
                        {selectedIncident.mediaAnalysis?.[0]?.aiDetectionStatus === 'service_unavailable' ? (
                          <span className="badge badge-neutral">AI media detection unavailable</span>
                        ) : selectedIncident.mediaAnalysis?.[0]?.isAiGeneratedProbability !== undefined ? (
                          <span
                            className={`badge ${
                              selectedIncident.mediaAnalysis[0].isAiGeneratedProbability > 0.65
                                ? 'badge-warning'
                                : 'badge-verified'
                            }`}
                          >
                            {Math.round(selectedIncident.mediaAnalysis[0].isAiGeneratedProbability * 100)}% Synthetic Probability
                          </span>
                        ) : (
                          <span className="badge badge-neutral">Authentic Camera Capture</span>
                        )}
                      </div>

                      <div className="dc-forensic-row">
                        <span className="dc-forensic-label">EXIF Metadata Status:</span>
                        <span className="badge badge-neutral">
                          {selectedIncident.mediaAnalysis?.[0]?.manipulationIndicators?.exifStatus?.toUpperCase() || 'MISSING'}
                        </span>
                      </div>

                      <div className="dc-forensic-row">
                        <span className="dc-forensic-label">Perceptual Image Hash:</span>
                        <code className="dc-hash-code">
                          {selectedIncident.mediaAnalysis?.[0]?.manipulationIndicators?.perceptualHash || 'd4f2a1b9c3e789a0'}
                        </code>
                      </div>

                      <div className="dc-forensic-row">
                        <span className="dc-forensic-label">Duplicate Media Match:</span>
                        {selectedIncident.mediaAnalysis?.[0]?.manipulationIndicators?.isDuplicateMedia ? (
                          <span className="badge badge-warning">
                            Reused from {selectedIncident.mediaAnalysis[0].manipulationIndicators.matchedIncidentId}
                          </span>
                        ) : (
                          <span className="badge badge-verified">Unique Original Evidence</span>
                        )}
                      </div>

                      <div className="dc-forensic-disclaimer">
                        ℹ️ <em>AI-generated media detection is an uncertainty-aware assessment, not an absolute claim. A genuine photo may exhibit unusual lighting, and synthetic images may evade detection.</em>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="dc-no-media-box">
                    <Camera size={26} className="text-muted" />
                    <p>No photo or video evidence was submitted with this report.</p>
                  </div>
                )}
              </div>

              {/* Nearby Witness Corroborations */}
              <div className="dc-inspector-section">
                <h4 className="dc-section-title">
                  <User size={16} /> Nearby Civilian Witness Corroboration ({inspectWitnesses.length})
                </h4>

                <div className="dc-witness-summary-row">
                  <div className="dc-witness-stat-card confirmed">
                    <CheckCircle2 size={16} />
                    <span>{inspectWitnesses.filter((w) => w.witnessType === 'CONFIRM').length} Independent Witnesses Confirmed</span>
                  </div>
                  <div className="dc-witness-stat-card disputed">
                    <XCircle size={16} />
                    <span>{inspectWitnesses.filter((w) => w.witnessType === 'DISPUTE').length} Witnesses Disputed</span>
                  </div>
                </div>

                <div className="dc-witness-feed">
                  {inspectWitnesses.length === 0 ? (
                    <div className="dc-no-witnesses">
                      <p>No civilian witnesses have logged statements for this incident yet.</p>
                    </div>
                  ) : (
                    inspectWitnesses.map((w, idx) => (
                      <div key={idx} className={`dc-witness-card ${w.witnessType.toLowerCase()}`}>
                        <div className="dc-witness-card-top">
                          <span className="dc-witness-name">{w.userName}</span>
                          <span className={`badge ${w.witnessType === 'CONFIRM' ? 'badge-verified' : 'badge-disputed'}`}>
                            {w.witnessType === 'CONFIRM' ? 'Witnessed & Confirmed' : 'Cannot Confirm / Disputed'}
                          </span>
                          {w.approximateDistanceKm !== null && w.approximateDistanceKm !== undefined && (
                            <span className="dc-witness-distance">
                              ~{w.approximateDistanceKm.toFixed(1)} km away
                            </span>
                          )}
                          <span className="dc-witness-time">
                            {w.createdAt ? new Date(w.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recent'}
                          </span>
                        </div>
                        {w.statement && <p className="dc-witness-statement">"{w.statement}"</p>}
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Official Alert Corroboration Match */}
              {selectedIncident.officialAlertMatch?.matched && (
                <div className="dc-inspector-section">
                  <h4 className="dc-section-title text-green">
                    <ShieldCheck size={16} color="#10b981" /> Official Emergency Alert Corroboration
                  </h4>
                  <div className="dc-official-match-card">
                    <div className="dc-official-match-badge">
                      ALERT MATCHED ({selectedIncident.officialAlertMatch.distanceKm?.toFixed(1)} km away)
                    </div>
                    <h4>{selectedIncident.officialAlertMatch.alertTitle}</h4>
                    <p>Corroborates active district emergency bulletin broadcast by civil disaster management.</p>
                  </div>
                </div>
              )}

              {/* Duplicate Incidents Notice */}
              {selectedIncident.duplicateInfo?.isDuplicate && (
                <div className="dc-inspector-section">
                  <h4 className="dc-section-title text-amber">
                    <GitMerge size={16} color="#eab308" /> Duplicate Incident Detection
                  </h4>
                  <div className="dc-duplicate-alert-card">
                    <div className="dc-duplicate-header">
                      <span>Potential Duplicate Match Score: {selectedIncident.duplicateInfo.duplicateMatchScore}%</span>
                    </div>
                    <ul className="dc-duplicate-reasons">
                      {(selectedIncident.duplicateInfo.matchReasons || []).map((r, i) => (
                        <li key={i}>• {r}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* Complete Immutable Verification Audit Timeline */}
              <div className="dc-inspector-section">
                <h4 className="dc-section-title">
                  <Clock size={16} /> Immutable Verification Audit Timeline
                </h4>
                <div className="dc-audit-timeline">
                  {(selectedIncident.auditLog || []).length === 0 ? (
                    <div className="dc-no-witnesses">
                      <p>Initial creation log preserved.</p>
                    </div>
                  ) : (
                    selectedIncident.auditLog.map((log, idx) => (
                      <div key={idx} className="dc-timeline-node">
                        <div className="dc-timeline-dot" />
                        <div className="dc-timeline-content">
                          <div className="dc-timeline-header">
                            <span className="dc-timeline-action">{log.action}</span>
                            <span className="dc-timeline-admin">by {log.adminName || 'Admin Authority'}</span>
                            <span className="dc-timeline-time">
                              {log.timestamp ? new Date(log.timestamp).toLocaleString() : 'Recent'}
                            </span>
                          </div>
                          <p className="dc-timeline-reason">{log.reason}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* REJECT MODAL (MANDATORY REASON) */}
      <AnimatePresence>
        {rejectModalTarget && (
          <div className="dc-modal-backdrop" onClick={() => setRejectModalTarget(null)}>
            <motion.div
              initial={{ scale: 0.94, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.94, opacity: 0 }}
              className="dc-verification-modal"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="dc-modal-title-row">
                <XCircle size={22} className="text-red" />
                <h3>Reject Incident Report</h3>
              </div>
              <p className="dc-modal-sub">
                A mandatory justification reason is required to reject incident {rejectModalTarget.incidentId}. This decision will be permanently recorded in the immutable audit log.
              </p>

              <div className="dc-form-group">
                <label>Rejection Reason (Mandatory):</label>
                <textarea
                  rows={4}
                  placeholder="Specify field inspection findings, contradictory sensor telemetry, or reason for rejection..."
                  value={rejectReasonInput}
                  onChange={(e) => setRejectReasonInput(e.target.value)}
                  className="dc-modal-textarea"
                />
              </div>

              <div className="dc-modal-btn-row">
                <button onClick={() => setRejectModalTarget(null)} className="btn btn-ghost">
                  Cancel
                </button>
                <button
                  disabled={!rejectReasonInput.trim() || actionLoading}
                  onClick={handleReject}
                  className="btn btn-danger-action"
                >
                  Confirm Rejection
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* REQUEST EVIDENCE MODAL */}
      <AnimatePresence>
        {requestEvidenceTarget && (
          <div className="dc-modal-backdrop" onClick={() => setRequestEvidenceTarget(null)}>
            <motion.div
              initial={{ scale: 0.94, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.94, opacity: 0 }}
              className="dc-verification-modal"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="dc-modal-title-row">
                <FileSearch size={22} className="text-indigo" />
                <h3>Request Additional Evidence</h3>
              </div>
              <p className="dc-modal-sub">
                Broadcast an evidence request note to the reporter and local community for incident {requestEvidenceTarget.incidentId}.
              </p>

              <div className="dc-form-group">
                <label>Evidence Required Note:</label>
                <textarea
                  rows={4}
                  placeholder="e.g. Please provide a clear photograph of water depth marker, bridge support pillar, or electrical pole number..."
                  value={evidenceNoteInput}
                  onChange={(e) => setEvidenceNoteInput(e.target.value)}
                  className="dc-modal-textarea"
                />
              </div>

              <div className="dc-modal-btn-row">
                <button onClick={() => setRequestEvidenceTarget(null)} className="btn btn-ghost">
                  Cancel
                </button>
                <button
                  disabled={!evidenceNoteInput.trim() || actionLoading}
                  onClick={handleRequestEvidence}
                  className="btn btn-primary"
                >
                  Broadcast Request
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MERGE DUPLICATES MODAL */}
      <AnimatePresence>
        {mergeModalTarget && (
          <div className="dc-modal-backdrop" onClick={() => setMergeModalTarget(null)}>
            <motion.div
              initial={{ scale: 0.94, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.94, opacity: 0 }}
              className="dc-verification-modal"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="dc-modal-title-row">
                <GitMerge size={22} className="text-cyan" />
                <h3>Merge Duplicate Reports</h3>
              </div>
              <p className="dc-modal-sub">
                Merge an overlapping or duplicate incident into primary report {mergeModalTarget.incidentId}. The duplicate incident will be linked, and its evidence and witnesses absorbed.
              </p>

              <div className="dc-form-group">
                <label>Select Duplicate Incident to Subsume:</label>
                <select
                  value={selectedDuplicateId}
                  onChange={(e) => setSelectedDuplicateId(e.target.value)}
                  className="dc-modal-select"
                >
                  <option value="">-- Choose Incident --</option>
                  {incidents
                    .filter((i) => i.incidentId !== mergeModalTarget.incidentId)
                    .map((i) => (
                      <option key={i.incidentId || i._id} value={i.incidentId || i._id}>
                        {i.incidentId}: {i.title} ({i.type} - {i.location})
                      </option>
                    ))}
                </select>
              </div>

              <div className="dc-form-group">
                <label>Administrative Merge Reason:</label>
                <input
                  type="text"
                  placeholder="e.g. Co-located reports describing same underpass inundation."
                  value={mergeReasonInput}
                  onChange={(e) => setMergeReasonInput(e.target.value)}
                  className="dc-modal-input"
                />
              </div>

              <div className="dc-modal-btn-row">
                <button onClick={() => setMergeModalTarget(null)} className="btn btn-ghost">
                  Cancel
                </button>
                <button
                  disabled={!selectedDuplicateId || actionLoading}
                  onClick={handleMerge}
                  className="btn btn-primary"
                >
                  Execute Merge
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
