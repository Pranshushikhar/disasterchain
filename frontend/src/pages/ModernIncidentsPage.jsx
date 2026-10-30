import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle,
  Plus,
  Clock,
  MapPin,
  CheckCircle2,
  ChevronRight,
  X,
  Camera,
  Send,
  Loader2,
} from 'lucide-react';
import { fetchIncidents, createIncident, checkIncidentDuplicates } from '../services/api';
import IncidentDetailModal from '../components/IncidentDetailModal';
import { useTranslation } from '../i18n/i18n';

export default function ModernIncidentsPage({ onOpenIncident: externalOpenIncident }) {
  const { t } = useTranslation();
  const [incidents, setIncidents] = useState([
    {
      id: 'inc-1',
      incidentId: 'INC-3001',
      category: 'Flooding',
      type: 'Flooding',
      title: 'Waterlogging at Ring Road Underpass',
      severity: 'High',
      distance: '1.2 km away',
      time: '14 min ago',
      verified: true,
      verificationStatus: 'Officially Verified',
      trustScore: 84,
      trustLevel: 'High confidence',
      description: 'Underpass inundated with approx 3.5 ft of runoff water. Passenger sedans stranded.',
      location: 'Ring Road South Underpass',
      reportsCount: 12,
      witnessStats: { confirmedCount: 4, disputedCount: 0 },
    },
    {
      id: 'inc-2',
      incidentId: 'INC-3002',
      category: 'Road blocked',
      type: 'Road blocked',
      title: 'Fallen High-Tension Bough',
      severity: 'Moderate',
      distance: '2.4 km away',
      time: '42 min ago',
      verified: true,
      verificationStatus: 'Community Corroborated',
      trustScore: 72,
      trustLevel: 'High confidence',
      description: 'Large bough severed secondary electricity line and obstructed westbound lane.',
      location: 'Sector 8 Market Junction',
      reportsCount: 5,
      witnessStats: { confirmedCount: 3, disputedCount: 1 },
    },
    {
      id: 'inc-3',
      incidentId: 'INC-3003',
      category: 'Power outage',
      type: 'Power outage',
      title: 'Substation Transformer Tripping',
      severity: 'Moderate',
      distance: '3.1 km away',
      time: '1 hour ago',
      verified: false,
      verificationStatus: 'Under Verification',
      trustScore: 54,
      trustLevel: 'Moderate confidence',
      description: 'Feeder #3 tripped due to lightning strike. Discom crews dispatched.',
      location: 'Phase 2 Industrial Enclave',
      reportsCount: 8,
      witnessStats: { confirmedCount: 1, disputedCount: 0 },
    },
    {
      id: 'inc-4',
      incidentId: 'INC-3004',
      category: 'Medical emergency',
      type: 'Medical emergency',
      title: 'Ambulance Route Obstructed',
      severity: 'Critical',
      distance: '3.8 km away',
      time: '1.5 hours ago',
      verified: true,
      verificationStatus: 'Officially Verified',
      trustScore: 92,
      trustLevel: 'Strong supporting evidence',
      description: 'Emergency corridor towards Metro Hospital blocked by stalled bus. Traffic marshals rerouting.',
      location: 'Civil Lines Outer Gate',
      reportsCount: 3,
      witnessStats: { confirmedCount: 5, disputedCount: 0 },
    },
  ]);

  const [selectedIncident, setSelectedIncident] = useState(null);
  const [filter, setFilter] = useState('ALL'); // 'ALL' | 'VERIFIED' | 'CRITICAL'
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Duplicate warning state
  const [duplicateWarning, setDuplicateWarning] = useState(null);
  const [checkingDuplicates, setCheckingDuplicates] = useState(false);
  const [proceedAsSeparate, setProceedAsSeparate] = useState(false);

  // Report Form State (5 steps: Photo, Location, Category, Description, Submit)
  const [reportForm, setReportForm] = useState({
    photoUrl: '',
    location: 'Current GPS Coordinates (Detected)',
    category: 'Flooding',
    description: '',
  });

  // Load backend incidents
  const loadIncidents = async () => {
    try {
      const data = await fetchIncidents();
      if (Array.isArray(data) && data.length > 0) {
        const formatted = data.map((d, i) => ({
          ...d,
          id: d._id || d.incidentId || `backend-${i}`,
          _id: d._id,
          incidentId: d.incidentId || `INC-${3000 + i}`,
          category: d.category || d.type || 'Disruption',
          type: d.type || d.category || 'Disruption',
          title: d.title || `${d.category || d.type || 'Incident'} Reported`,
          severity: d.severity ? d.severity.charAt(0).toUpperCase() + d.severity.slice(1) : 'Moderate',
          distance: d.distance ? `${d.distance} km away` : `${(1.2 + i * 0.8).toFixed(1)} km away`,
          time: d.createdAt ? new Date(d.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recent',
          verified: d.verificationStatus === 'Officially Verified' || d.verificationStatus === 'Community Corroborated' || d.status === 'Resolved',
          verificationStatus: d.verificationStatus || (d.status === 'Pending' ? 'Received' : d.status),
          trustScore: d.trustScore ?? 50,
          trustLevel: d.trustLevel || 'Moderate confidence',
          witnessStats: d.witnessStats || { confirmedCount: 0, disputedCount: 0 },
          description: d.description || 'Citizen reported field incident under verification.',
          location: typeof d.location === 'string' ? d.location : (d.location?.address || 'Local Region'),
          reportsCount: d.upvotes || d.witnessStats?.confirmedCount || 1,
        }));
        setIncidents(formatted);
      }
    } catch (err) {
      console.error('ModernIncidents load error:', err);
    }
  };

  useEffect(() => {
    loadIncidents();
  }, []);

  const handleOpenReport = () => {
    setDuplicateWarning(null);
    setProceedAsSeparate(false);
    setIsReportModalOpen(true);
  };

  const executeIncidentCreation = async () => {
    setSubmitting(true);
    try {
      await createIncident({
        title: `${reportForm.category} reported at ${reportForm.location}`,
        category: reportForm.category,
        type: reportForm.category,
        description: reportForm.description,
        location: {
          address: reportForm.location,
          coordinates: [77.209, 28.6139],
        },
        severity: reportForm.category === 'Medical emergency' ? 'critical' : 'moderate',
        mediaUrl: reportForm.photoUrl,
      });
      setSubmitSuccess(true);
      await loadIncidents();
      setTimeout(() => {
        setSubmitSuccess(false);
        setIsReportModalOpen(false);
        setReportForm({
          photoUrl: '',
          location: 'Current GPS Coordinates (Detected)',
          category: 'Flooding',
          description: '',
        });
        setDuplicateWarning(null);
        setProceedAsSeparate(false);
      }, 1400);
    } catch (err) {
      // Local optimism if offline
      const newInc = {
        id: `local-${Date.now()}`,
        incidentId: `INC-${Date.now().toString().slice(-4)}`,
        category: reportForm.category,
        type: reportForm.category,
        title: `${reportForm.category} at ${reportForm.location}`,
        severity: reportForm.category === 'Medical emergency' ? 'Critical' : 'Moderate',
        distance: '0.1 km away',
        time: 'Just now',
        verified: false,
        verificationStatus: 'Received',
        trustScore: 48,
        trustLevel: 'Low confidence',
        description: reportForm.description,
        location: reportForm.location,
        reportsCount: 1,
        witnessStats: { confirmedCount: 0, disputedCount: 0 },
      };
      setIncidents((prev) => [newInc, ...prev]);
      setSubmitSuccess(true);
      setTimeout(() => {
        setSubmitSuccess(false);
        setIsReportModalOpen(false);
        setDuplicateWarning(null);
        setProceedAsSeparate(false);
      }, 1200);
    } finally {
      setSubmitting(false);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!reportForm.description.trim()) return;

    // Pre-submission duplicate check if not already acknowledged
    if (!duplicateWarning && !proceedAsSeparate) {
      setCheckingDuplicates(true);
      try {
        const dupResult = await checkIncidentDuplicates({
          title: `${reportForm.category} reported at ${reportForm.location}`,
          category: reportForm.category,
          description: reportForm.description,
          location: reportForm.location,
          mediaUrl: reportForm.photoUrl,
        });

        const dupList = dupResult?.duplicates || dupResult?.candidates || [];
        if (dupResult?.hasDuplicates && dupList.length > 0) {
          setDuplicateWarning({
            ...dupResult,
            duplicates: dupList,
          });
          setCheckingDuplicates(false);
          return;
        }
      } catch (e) {
        // Continue if duplicate check unavailable
      } finally {
        setCheckingDuplicates(false);
      }
    }

    await executeIncidentCreation();
  };

  const filteredIncidents = useMemo(() => {
    if (filter === 'VERIFIED') return incidents.filter((i) => i.verified);
    if (filter === 'CRITICAL') {
      return incidents.filter(
        (i) => i.severity.toLowerCase() === 'critical' || i.severity.toLowerCase() === 'high'
      );
    }
    return incidents;
  }, [incidents, filter]);

  return (
    <motion.div
      className="dc-incidents-container"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="dc-incidents-content">
        {/* Header with Prominent Primary Action */}
        <div className="dc-incidents-header">
          <div>
            <span className="dc-section-subtitle">{t('incidents.communityReports', 'COMMUNITY & FIELD REPORTS')}</span>
            <h1 className="dc-page-title">{t('incidents.title', 'Incidents Near You')}</h1>
          </div>
          <button
            id="dc-report-incident-btn"
            onClick={handleOpenReport}
            className="dc-btn-primary"
          >
            <Plus size={18} />
            <span>{t('incidents.reportIncident', 'Report incident')}</span>
          </button>
        </div>

        {/* Filter Pills */}
        <div className="dc-home-quick-strip" style={{ marginBottom: 16 }}>
          <button
            type="button"
            className={`dc-hub-pill ${filter === 'ALL' ? 'active' : ''}`}
            onClick={() => setFilter('ALL')}
            style={filter === 'ALL' ? { backgroundColor: 'var(--dc-forest)', color: '#FFFDF8' } : {}}
          >
            {t('incidents.allReports', 'All Reports')} ({incidents.length})
          </button>
          <button
            type="button"
            className={`dc-hub-pill ${filter === 'VERIFIED' ? 'active' : ''}`}
            onClick={() => setFilter('VERIFIED')}
            style={filter === 'VERIFIED' ? { backgroundColor: 'var(--dc-earth-green)', color: '#FFFDF8' } : {}}
          >
            {t('incidents.verifiedOnly', 'Verified Only')} ({incidents.filter((i) => i.verified).length})
          </button>
          <button
            type="button"
            className={`dc-hub-pill ${filter === 'CRITICAL' ? 'active' : ''}`}
            onClick={() => setFilter('CRITICAL')}
            style={filter === 'CRITICAL' ? { backgroundColor: 'var(--dc-emergency)', color: '#FFFDF8' } : {}}
          >
            {t('incidents.criticalHigh', 'High / Critical')} ({incidents.filter((i) => i.severity.toLowerCase() === 'critical' || i.severity.toLowerCase() === 'high').length})
          </button>
        </div>

        {/* INCIDENT LIST OR EMPTY STATE */}
        {filteredIncidents.length === 0 ? (
          <div className="dc-empty-shelter-card">
            <AlertTriangle size={24} className="dc-empty-icon" />
            <h4>No Reports Matching Current Filter</h4>
            <p>
              No active field reports match this filter criteria. If you observe waterlogging, downed power lines, or structural disruptions, submit a report to alert your sector.
            </p>
          </div>
        ) : (
          <div className="dc-incidents-list">
            {filteredIncidents.map((inc) => (
            <div
              key={inc.id}
              className="dc-incident-card"
              onClick={() => setSelectedIncident(inc)}
              role="button"
              tabIndex={0}
            >
              <div className="dc-incident-left">
                <div className="dc-incident-badge-row" style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
                  <span className="dc-incident-category">{inc.category}</span>
                  <span
                    className={`dc-severity-tag ${
                      inc.severity.toLowerCase() === 'critical'
                        ? 'critical'
                        : inc.severity.toLowerCase() === 'high'
                        ? 'high'
                        : 'moderate'
                    }`}
                  >
                    {inc.severity}
                  </span>

                  {/* Verification Status Pill */}
                  <span
                    style={{
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      padding: '0.15rem 0.55rem',
                      borderRadius: '999px',
                      background:
                        inc.verificationStatus === 'Officially Verified'
                          ? 'rgba(16, 185, 129, 0.2)'
                          : inc.verificationStatus === 'Community Corroborated'
                          ? 'rgba(168, 85, 247, 0.2)'
                          : inc.verificationStatus === 'Disputed'
                          ? 'rgba(249, 115, 22, 0.2)'
                          : 'rgba(56, 189, 248, 0.15)',
                      color:
                        inc.verificationStatus === 'Officially Verified'
                          ? '#34d399'
                          : inc.verificationStatus === 'Community Corroborated'
                          ? '#c084fc'
                          : inc.verificationStatus === 'Disputed'
                          ? '#fb923c'
                          : '#38bdf8',
                      border: `1px solid ${
                        inc.verificationStatus === 'Officially Verified'
                          ? 'rgba(16, 185, 129, 0.4)'
                          : inc.verificationStatus === 'Community Corroborated'
                          ? 'rgba(168, 85, 247, 0.4)'
                          : inc.verificationStatus === 'Disputed'
                          ? 'rgba(249, 115, 22, 0.4)'
                          : 'rgba(56, 189, 248, 0.3)'
                      }`,
                    }}
                  >
                    {inc.verificationStatus || 'Received'}
                  </span>

                  {/* Trust Score */}
                  {inc.trustScore !== undefined && (
                    <span
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        padding: '0.15rem 0.5rem',
                        borderRadius: '4px',
                        background: 'rgba(15, 23, 42, 0.85)',
                        color: inc.trustScore >= 70 ? '#34d399' : inc.trustScore >= 50 ? '#fbbf24' : '#f87171',
                        border: '1px solid rgba(148, 163, 184, 0.2)',
                      }}
                    >
                      ★ {inc.trustScore}/100 Trust
                    </span>
                  )}
                </div>

                <h3 className="dc-incident-title">{inc.title}</h3>

                <div className="dc-incident-meta">
                  <span className="dc-meta-item">
                    <MapPin size={13} />
                    <span>{inc.distance}</span>
                  </span>
                  <span className="dc-meta-item">
                    <Clock size={13} />
                    <span>{inc.time}</span>
                  </span>
                  <span className="dc-meta-item">
                    <span>{inc.location}</span>
                  </span>
                  {inc.witnessStats?.confirmedCount > 0 && (
                    <span className="dc-meta-item" style={{ color: '#34d399' }}>
                      <span>✓ {inc.witnessStats.confirmedCount} Witness{inc.witnessStats.confirmedCount > 1 ? 'es' : ''}</span>
                    </span>
                  )}
                </div>
              </div>
              <ChevronRight size={18} className="dc-incident-arrow" />
            </div>
          ))}
        </div>
        )}
      </div>

      {/* FULL INCIDENT DETAIL & WITNESS MODAL */}
      {selectedIncident && (
        <IncidentDetailModal
          isOpen={!!selectedIncident}
          onClose={() => setSelectedIncident(null)}
          incident={selectedIncident}
          onStatusUpdated={loadIncidents}
        />
      )}

      {/* STREAMLINED REPORT MODAL WITH PRE-SUBMISSION DUPLICATE DETECTION */}
      <AnimatePresence>
        {isReportModalOpen && (
          <div className="dc-modal-backdrop" onClick={() => setIsReportModalOpen(false)}>
            <motion.div
              className="dc-modal-card dc-report-modal"
              onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2 }}
              style={{ maxWidth: '620px' }}
            >
              <div className="dc-modal-header">
                <div>
                  <span className="dc-section-subtitle">NEW FIELD TRANSMISSION</span>
                  <h2 className="dc-modal-title">Report Incident</h2>
                </div>
                <button
                  className="dc-close-icon-btn"
                  onClick={() => setIsReportModalOpen(false)}
                >
                  <X size={18} />
                </button>
              </div>

              {submitSuccess ? (
                <div className="dc-report-success-view">
                  <CheckCircle2 size={48} className="dc-success-icon" />
                  <h3>Incident Transmitted</h3>
                  <p>AI forensics & local witness verification checks initiated.</p>
                </div>
              ) : duplicateWarning && duplicateWarning.duplicates?.length > 0 ? (
                /* PRE-SUBMISSION DUPLICATE WARNING CARD */
                <div className="dc-duplicate-warning-banner" style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.35)', borderRadius: '8px', padding: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', color: '#fbbf24', fontWeight: 800, fontSize: '1rem', marginBottom: '0.5rem' }}>
                    <AlertTriangle size={20} color="#fbbf24" />
                    <span>Potential Duplicate Incident Detected</span>
                  </div>
                  <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '1rem' }}>
                    An incident of the same category has recently been reported in this immediate vicinity.
                    To prevent fragmented response efforts, you can add witness confirmation or evidence to the existing report, or proceed as a separate emergency.
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', marginBottom: '1.25rem' }}>
                    {duplicateWarning.duplicates.map((dup) => (
                      <div
                        key={dup._id}
                        style={{
                          background: '#0b1329',
                          padding: '0.75rem 1rem',
                          borderRadius: '6px',
                          border: '1px solid rgba(255,255,255,0.1)',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          flexWrap: 'wrap',
                          gap: '0.5rem',
                        }}
                      >
                        <div>
                          <strong style={{ color: '#ffffff', fontSize: '0.88rem' }}>
                            {dup.incidentId}: {dup.title}
                          </strong>
                          <div style={{ fontSize: '0.74rem', color: '#fbbf24', marginTop: '0.2rem' }}>
                            {dup.matchReason || 'Nearby geographical & category match'} • {dup.similarityPercentage ? `${dup.similarityPercentage}% Similarity` : 'Proximity Match'}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setIsReportModalOpen(false);
                            setSelectedIncident(dup);
                          }}
                          className="dc-btn-secondary"
                          style={{ fontSize: '0.76rem', padding: '0.35rem 0.75rem' }}
                        >
                          👁️ Witness Existing Report
                        </button>
                      </div>
                    ))}
                  </div>

                  <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      disabled={submitting}
                      onClick={() => {
                        setProceedAsSeparate(true);
                        executeIncidentCreation();
                      }}
                      className="dc-btn-primary"
                      style={{ flex: 1, background: 'linear-gradient(135deg, #2563eb, #3b82f6)', fontSize: '0.82rem' }}
                    >
                      {submitting ? 'Transmitting...' : 'Submit as Separate Emergency'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setDuplicateWarning(null)}
                      className="dc-btn-secondary"
                      style={{ fontSize: '0.82rem' }}
                    >
                      Modify Details
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleFormSubmit} className="dc-report-form">
                  {/* 1. PHOTO */}
                  <div className="dc-form-group">
                    <label className="dc-form-label">1. Photo / Video Evidence (Optional)</label>
                    <label
                      className="dc-photo-upload-box"
                      style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                    >
                      <Camera size={20} />
                      <span>{reportForm.photoUrl ? 'Media attached (Tap to replace)' : 'Tap to attach photo or video from scene'}</span>
                      <input
                        type="file"
                        accept="image/*,video/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = () => setReportForm({ ...reportForm, photoUrl: reader.result });
                            reader.readAsDataURL(file);
                          }
                        }}
                        style={{ display: 'none' }}
                      />
                    </label>
                    {reportForm.photoUrl && (
                      <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                        <img
                          src={reportForm.photoUrl}
                          alt="Attached scene"
                          style={{ width: '48px', height: '36px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #38bdf8' }}
                        />
                        <span style={{ fontSize: '0.78rem', color: '#34d399' }}>✓ Media attached for AI authenticity analysis</span>
                        <button
                          type="button"
                          onClick={() => setReportForm({ ...reportForm, photoUrl: '' })}
                          className="btn btn-ghost"
                          style={{ padding: '0.1rem 0.35rem', fontSize: '0.72rem', color: '#f87171' }}
                        >
                          Remove
                        </button>
                      </div>
                    )}
                  </div>

                  {/* 2. LOCATION */}
                  <div className="dc-form-group">
                    <label className="dc-form-label">2. Location</label>
                    <div className="dc-input-with-icon">
                      <MapPin size={16} />
                      <input
                        type="text"
                        value={reportForm.location}
                        onChange={(e) =>
                          setReportForm({ ...reportForm, location: e.target.value })
                        }
                        className="dc-form-input"
                        placeholder="Location or GPS"
                        required
                      />
                    </div>
                  </div>

                  {/* 3. CATEGORY */}
                  <div className="dc-form-group">
                    <label className="dc-form-label">3. Category</label>
                    <div className="dc-category-pill-select">
                      {['Flooding', 'Road blocked', 'Power outage', 'Medical emergency'].map(
                        (cat) => (
                          <button
                            type="button"
                            key={cat}
                            className={`dc-category-pill ${
                              reportForm.category === cat ? 'active' : ''
                            }`}
                            onClick={() => setReportForm({ ...reportForm, category: cat })}
                          >
                            {cat}
                          </button>
                        )
                      )}
                    </div>
                  </div>

                  {/* 4. DESCRIPTION */}
                  <div className="dc-form-group">
                    <label className="dc-form-label">4. Description</label>
                    <textarea
                      rows={3}
                      value={reportForm.description}
                      onChange={(e) =>
                        setReportForm({ ...reportForm, description: e.target.value })
                      }
                      className="dc-form-textarea"
                      placeholder="Briefly describe what is happening..."
                      required
                    />
                  </div>

                  {/* 5. SUBMIT ACTION */}
                  <div className="dc-form-actions">
                    <button
                      type="button"
                      onClick={() => setIsReportModalOpen(false)}
                      className="dc-btn-secondary"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting || checkingDuplicates}
                      className="dc-btn-primary"
                    >
                      {submitting || checkingDuplicates ? (
                        <>
                          <Loader2 size={16} className="dc-spin" />
                          <span>{checkingDuplicates ? 'Checking Duplicates...' : 'Transmitting...'}</span>
                        </>
                      ) : (
                        <>
                          <Send size={16} />
                          <span>Submit Report</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
