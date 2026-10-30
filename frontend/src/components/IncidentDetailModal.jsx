import React, { useState, useEffect } from 'react';
import { updateIncidentStatus, submitWitnessVerification, fetchIncidentWitnesses } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../i18n/i18n';
import Icon from './Icons';

const IncidentDetailModal = ({ isOpen = true, onClose, incident, item, onStatusUpdated }) => {
  const { t } = useTranslation();
  const targetIncident = incident || item;
  const { user } = useAuth();
  const isAdminOrResponder = user?.role === 'admin' || user?.role === 'responder';

  const [updating, setUpdating] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(targetIncident?.status || 'Pending');
  const [currentVerificationStatus, setCurrentVerificationStatus] = useState(
    targetIncident?.verificationStatus || 'Received'
  );
  const [updateMsg, setUpdateMsg] = useState('');

  // Witness verification state
  const [witnessStats, setWitnessStats] = useState(
    targetIncident?.witnessStats || { confirmedCount: 0, disputedCount: 0, lastWitnessAt: null }
  );
  const [trustScore, setTrustScore] = useState(targetIncident?.trustScore ?? 50);
  const [trustLevel, setTrustLevel] = useState(targetIncident?.trustLevel || 'Moderate confidence');
  const [witnessFeedback, setWitnessFeedback] = useState('');
  const [witnessStatement, setWitnessStatement] = useState('');
  const [witnessLocationAllowed, setWitnessLocationAllowed] = useState(true);
  const [witnessCoords, setWitnessCoords] = useState(null);
  const [witnessPhoto, setWitnessPhoto] = useState('');
  const [submittingWitness, setSubmittingWitness] = useState(false);
  const [hasWitnessedLocally, setHasWitnessedLocally] = useState(false);
  const [witnessList, setWitnessList] = useState([]);
  const [showWitnessFeed, setShowWitnessFeed] = useState(false);

  useEffect(() => {
    if (targetIncident?._id) {
      setCurrentStatus(targetIncident.status || 'Pending');
      setCurrentVerificationStatus(targetIncident.verificationStatus || 'Received');
      setWitnessStats(targetIncident.witnessStats || { confirmedCount: 0, disputedCount: 0, lastWitnessAt: null });
      setTrustScore(targetIncident.trustScore ?? 50);
      setTrustLevel(targetIncident.trustLevel || 'Moderate confidence');

      // Attempt to load witnesses if available
      fetchIncidentWitnesses(targetIncident._id)
        .then((data) => {
          if (Array.isArray(data)) setWitnessList(data);
        })
        .catch(() => {});
    }
  }, [targetIncident?._id]);

  useEffect(() => {
    if (witnessLocationAllowed && typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setWitnessCoords({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          });
        },
        () => {
          // Gracefully fallback if denied
          setWitnessCoords(null);
        },
        { timeout: 5000 }
      );
    } else {
      setWitnessCoords(null);
    }
  }, [witnessLocationAllowed]);

  if ((isOpen !== undefined && !isOpen) || !targetIncident) return null;

  const lat = Number(targetIncident.latitude ?? targetIncident.coordinates?.latitude) || 28.6139;
  const lng = Number(targetIncident.longitude ?? targetIncident.coordinates?.longitude) || 77.2090;
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;

  const isOriginalReporter =
    (user?._id && targetIncident.reportedBy && String(user._id) === String(targetIncident.reportedBy)) ||
    (user?.id && targetIncident.reportedBy && String(user.id) === String(targetIncident.reportedBy)) ||
    (user?.name &&
      targetIncident.reporterName &&
      user.name.trim().toLowerCase() === targetIncident.reporterName.trim().toLowerCase());

  const handleStatusChange = async (newStatus) => {
    setUpdating(true);
    setUpdateMsg('');
    try {
      await updateIncidentStatus(targetIncident._id, newStatus);
      setCurrentStatus(newStatus);
      setUpdateMsg(`Status successfully updated to ${newStatus}`);
      if (onStatusUpdated) {
        onStatusUpdated(targetIncident._id, newStatus);
      }
    } catch (err) {
      console.error('Error updating incident status:', err);
      setUpdateMsg('Failed to update status on server.');
    } finally {
      setUpdating(false);
    }
  };

  const handleWitnessSubmit = async (verificationType) => {
    if (isOriginalReporter) {
      setWitnessFeedback('Original reporters cannot independently verify their own incident report.');
      return;
    }
    setSubmittingWitness(true);
    setWitnessFeedback('');
    try {
      const wType = verificationType === 'confirmed' ? 'CONFIRM' : 'DISPUTE';
      const incidentIdentifier = targetIncident._id || targetIncident.id || targetIncident.incidentId;
      const res = await submitWitnessVerification(incidentIdentifier, {
        witnessType: wType,
        verificationType,
        statement: witnessStatement,
        latitude: witnessCoords?.latitude,
        longitude: witnessCoords?.longitude,
        hasLocationPermission: witnessLocationAllowed,
        mediaUrls: witnessPhoto ? [witnessPhoto] : [],
        evidenceUrl: witnessPhoto,
        evidenceType: witnessPhoto ? 'photo' : 'none',
      });

      const resData = res?.data || res;
      if (resData?.incidentStats || resData?.witnessStats) {
        setWitnessStats(resData.incidentStats || resData.witnessStats);
      }
      if (resData?.trustScore !== undefined) {
        setTrustScore(resData.trustScore);
      }
      if (resData?.trustLevel) {
        setTrustLevel(resData.trustLevel);
      }
      if (resData?.verificationStatus) {
        setCurrentVerificationStatus(resData.verificationStatus);
      }
      setHasWitnessedLocally(true);
      setWitnessFeedback(
        verificationType === 'confirmed'
          ? 'Thank you! Your independent witness confirmation has been securely recorded.'
          : 'Your statement that you could not confirm this incident has been noted.'
      );
      // Reload witness list
      fetchIncidentWitnesses(incidentIdentifier)
        .then((data) => {
          if (Array.isArray(data)) setWitnessList(data);
        })
        .catch(() => {});
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message || 'Failed to submit witness verification.';
      setWitnessFeedback(errMsg);
    } finally {
      setSubmittingWitness(false);
    }
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setWitnessPhoto(reader.result);
    };
    reader.readAsDataURL(file);
  };

  // Status visual styles
  const getVerificationBadge = (vStatus) => {
    switch (vStatus) {
      case 'Officially Verified':
        return { bg: 'rgba(16, 185, 129, 0.2)', border: '#10b981', color: '#34d399', label: 'Officially Verified', icon: 'shield' };
      case 'Community Corroborated':
        return { bg: 'rgba(168, 85, 247, 0.2)', border: '#a855f7', color: '#c084fc', label: 'Community Corroborated', icon: 'user' };
      case 'Under Verification':
        return { bg: 'rgba(245, 158, 11, 0.2)', border: '#f59e0b', color: '#fbbf24', label: 'Under Verification', icon: 'activity' };
      case 'Disputed':
        return { bg: 'rgba(249, 115, 22, 0.2)', border: '#f97316', color: '#fb923c', label: 'Disputed Incident', icon: 'warning' };
      case 'Rejected':
        return { bg: 'rgba(239, 68, 68, 0.2)', border: '#ef4444', color: '#f87171', label: 'Rejected Report', icon: 'close' };
      case 'Duplicate / Merged':
        return { bg: 'rgba(100, 116, 139, 0.2)', border: '#64748b', color: '#94a3b8', label: 'Duplicate / Merged', icon: 'copy' };
      default:
        return { bg: 'rgba(56, 189, 248, 0.15)', border: '#38bdf8', color: '#38bdf8', label: 'Report Received', icon: 'bell' };
    }
  };

  const vBadge = getVerificationBadge(currentVerificationStatus);
  const scoreColor =
    trustScore >= 70 ? '#10b981' : trustScore >= 50 ? '#f59e0b' : '#f43f5e';

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '740px',
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: '1.75rem',
          background: 'rgba(11, 17, 33, 0.96)',
          border: '1px solid rgba(148, 163, 184, 0.2)',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.75)',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', marginBottom: '0.45rem', flexWrap: 'wrap' }}>
              <span className="badge badge-warning" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.74rem' }}>
                {targetIncident.incidentId || 'INC-LOGGED'}
              </span>
              <span className={`badge badge-${targetIncident.severity?.toLowerCase()}`}>
                {targetIncident.severity} {t('common.severity', 'SEVERITY')}
              </span>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  padding: '0.2rem 0.65rem',
                  borderRadius: '999px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  backgroundColor: vBadge.bg,
                  border: `1px solid ${vBadge.border}`,
                  color: vBadge.color,
                }}
              >
                <Icon name={vBadge.icon} size={13} color={vBadge.color} />
                <span>{vBadge.label}</span>
              </span>
              <span className="badge badge-neutral">
                {t('common.status', 'STATUS')}: {currentStatus}
              </span>
            </div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#ffffff', lineHeight: 1.3 }}>
              {targetIncident.title}
            </h2>
          </div>

          <button onClick={onClose} className="btn btn-ghost" style={{ padding: '0.4rem', color: 'var(--text-muted)' }}>
            <Icon name="close" size={20} />
          </button>
        </div>

        {/* AI Trust Assessment & Score Strip */}
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.9) 100%)',
            border: '1px solid rgba(148, 163, 184, 0.18)',
            borderRadius: 'var(--radius-md)',
            padding: '1rem 1.25rem',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                background: `conic-gradient(${scoreColor} ${trustScore * 3.6}deg, rgba(255,255,255,0.08) 0deg)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: `0 0 15px ${scoreColor}33`,
              }}
            >
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  background: '#0f172a',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  fontWeight: 800,
                  fontSize: '0.95rem',
                }}
              >
                {trustScore}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)' }}>
                Explainable Incident Trust Score
              </div>
              <div style={{ fontSize: '0.95rem', fontWeight: 800, color: scoreColor }}>
                {trustScore}/100 • {trustLevel}
              </div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
                Weighted multi-factor confidence rating
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
            <div
              style={{
                background: 'rgba(16, 185, 129, 0.12)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                borderRadius: 'var(--radius-sm)',
                padding: '0.45rem 0.75rem',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#34d399' }}>
                {witnessStats.confirmedCount || 0}
              </div>
              <div style={{ fontSize: '0.68rem', color: '#a7f3d0' }}>Witness Confirmations</div>
            </div>

            <div
              style={{
                background: 'rgba(239, 68, 68, 0.12)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: 'var(--radius-sm)',
                padding: '0.45rem 0.75rem',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#f87171' }}>
                {witnessStats.disputedCount || 0}
              </div>
              <div style={{ fontSize: '0.68rem', color: '#fecaca' }}>Disputed Reports</div>
            </div>
          </div>
        </div>

        {/* AI Evidence Synthesis Banner */}
        {targetIncident.aiEvidenceSummary && (
          <div
            style={{
              background: 'rgba(99, 102, 241, 0.08)',
              border: '1px solid rgba(99, 102, 241, 0.25)',
              borderRadius: 'var(--radius-md)',
              padding: '0.85rem 1rem',
              marginBottom: '1.25rem',
              fontSize: '0.82rem',
              lineHeight: 1.5,
              color: '#c7d2fe',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.35rem', fontWeight: 700, color: '#818cf8' }}>
              <Icon name="activity" size={14} color="#818cf8" />
              <span>AI Evidence Synthesis</span>
            </div>
            {typeof targetIncident.aiEvidenceSummary === 'object'
              ? targetIncident.aiEvidenceSummary.narrative
              : targetIncident.aiEvidenceSummary}
          </div>
        )}

        {/* Category & Description */}
        <div style={{ marginBottom: '1.25rem' }}>
          <div style={{ fontSize: '0.84rem', color: '#818cf8', fontWeight: 700, marginBottom: '0.4rem' }}>
            {t('common.category', 'Category:')} {targetIncident.type}
          </div>
          <div
            style={{
              background: 'rgba(11, 18, 34, 0.9)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '1.15rem',
              lineHeight: 1.6,
              fontSize: '0.9rem',
              color: 'var(--text-primary)',
            }}
          >
            {targetIncident.description}
          </div>
        </div>

        {/* Location & Navigation */}
        <div
          style={{
            background: 'rgba(15, 24, 44, 0.85)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '0.85rem 1.15rem',
            marginBottom: '1.25rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '0.5rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            <Icon name="map-pin" size={16} color="#818cf8" />
            <span style={{ fontSize: '0.86rem', color: '#ffffff' }}>
              <strong>{t('common.location', 'Location:')} </strong> {targetIncident.location}
            </span>
          </div>

          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-secondary btn-sm"
            style={{ fontSize: '0.78rem' }}
          >
            <Icon name="compass" size={13} color="#38bdf8" />
            <span>{t('shelters.getDirections', 'Maps View')}</span>
          </a>
        </div>

        {/* Reporter Metadata */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '0.75rem',
            marginBottom: '1.25rem',
            fontSize: '0.8rem',
          }}
        >
          <div style={{ background: 'rgba(15, 24, 44, 0.7)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
            <span style={{ color: 'var(--text-muted)' }}>{t('incidents.reportedBy', 'Reported By:')} </span>
            <strong style={{ color: '#ffffff' }}>{targetIncident.reporterName || 'Anonymous Student'}</strong>
          </div>
          <div style={{ background: 'rgba(15, 24, 44, 0.7)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
            <span style={{ color: 'var(--text-muted)' }}>{t('incidents.submittedAt', 'Submitted:')} </span>
            <strong style={{ color: '#ffffff' }}>
              {new Date(targetIncident.createdAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
            </strong>
          </div>
        </div>

        {/* NEARBY WITNESS VERIFICATION WORKFLOW */}
        <div
          style={{
            background: 'rgba(15, 23, 42, 0.85)',
            border: '1px solid rgba(56, 189, 248, 0.25)',
            borderRadius: 'var(--radius-md)',
            padding: '1.25rem',
            marginBottom: '1.25rem',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '1.1rem' }}>👁️</span>
              <h3 style={{ fontSize: '0.96rem', fontWeight: 800, color: '#38bdf8', margin: 0 }}>
                Nearby Civilian Witness Verification
              </h3>
            </div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              Proximity Privacy Protected
            </span>
          </div>

          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: '0 0 1rem 0' }}>
            Are you currently in or near this area? Help emergency responders and the community confirm or clarify this situation.
            Failure to confirm does not prove an incident is fake.
          </p>

          {isOriginalReporter ? (
            <div
              style={{
                background: 'rgba(245, 158, 11, 0.1)',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                borderRadius: 'var(--radius-sm)',
                padding: '0.75rem 1rem',
                fontSize: '0.8rem',
                color: '#fbbf24',
              }}
            >
              🔒 <strong>Original Reporter Guard:</strong> You submitted this incident. To protect against self-reinforcing bias, original reporters cannot independently corroborate their own incident reports.
            </div>
          ) : hasWitnessedLocally ? (
            <div
              style={{
                background: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                borderRadius: 'var(--radius-sm)',
                padding: '0.75rem 1rem',
                fontSize: '0.82rem',
                color: '#34d399',
              }}
            >
              ✅ {witnessFeedback || 'Your witness response has been securely recorded. Thank you for keeping your community informed!'}
            </div>
          ) : (
            <div>
              {/* Optional Statement & Evidence */}
              <div style={{ marginBottom: '0.85rem' }}>
                <textarea
                  className="form-input"
                  rows={2}
                  value={witnessStatement}
                  onChange={(e) => setWitnessStatement(e.target.value)}
                  placeholder="Optional: Add what you see, road conditions, water depth, smoke direction..."
                  style={{ width: '100%', fontSize: '0.82rem' }}
                />
              </div>

              {/* Photo Upload & Location Permission */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem', fontSize: '0.78rem' }}>
                <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                  <input
                    type="checkbox"
                    checked={witnessLocationAllowed}
                    onChange={(e) => setWitnessLocationAllowed(e.target.checked)}
                  />
                  <span>Share approximate distance (~{witnessCoords ? 'Active' : 'Permitted'})</span>
                </label>

                <div>
                  <label
                    className="btn btn-secondary btn-sm"
                    style={{ fontSize: '0.76rem', cursor: 'pointer', padding: '0.35rem 0.65rem' }}
                  >
                    📷 {witnessPhoto ? 'Change Photo' : 'Attach Supporting Photo'}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      style={{ display: 'none' }}
                    />
                  </label>
                </div>
              </div>

              {witnessPhoto && (
                <div style={{ marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <img
                    src={witnessPhoto}
                    alt="Witness preview"
                    style={{ width: '60px', height: '40px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #38bdf8' }}
                  />
                  <span style={{ fontSize: '0.75rem', color: '#38bdf8' }}>Supporting photograph attached</span>
                  <button
                    type="button"
                    onClick={() => setWitnessPhoto('')}
                    className="btn btn-ghost"
                    style={{ padding: '0.1rem 0.35rem', fontSize: '0.72rem', color: '#f87171' }}
                  >
                    Remove
                  </button>
                </div>
              )}

              {/* Confirm / Dispute Buttons */}
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  disabled={submittingWitness}
                  onClick={() => handleWitnessSubmit('confirmed')}
                  className="btn btn-primary"
                  style={{
                    flex: '1 1 180px',
                    background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                    borderColor: '#10b981',
                    fontSize: '0.84rem',
                    fontWeight: 700,
                  }}
                >
                  ✓ I Witnessed This Incident
                </button>

                <button
                  type="button"
                  disabled={submittingWitness}
                  onClick={() => handleWitnessSubmit('disputed')}
                  className="btn btn-secondary"
                  style={{
                    flex: '1 1 180px',
                    borderColor: 'rgba(239, 68, 68, 0.4)',
                    color: '#f87171',
                    fontSize: '0.84rem',
                    fontWeight: 700,
                  }}
                >
                  ⚠ I Cannot Confirm This Incident
                </button>
              </div>

              {witnessFeedback && (
                <div style={{ marginTop: '0.65rem', fontSize: '0.78rem', color: witnessFeedback.includes('Thank') ? '#34d399' : '#f87171' }}>
                  {witnessFeedback}
                </div>
              )}
            </div>
          )}

          {/* Toggle Witness Log */}
          {witnessList.length > 0 && (
            <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(148, 163, 184, 0.15)' }}>
              <button
                type="button"
                onClick={() => setShowWitnessFeed(!showWitnessFeed)}
                className="btn btn-ghost btn-sm"
                style={{ fontSize: '0.75rem', color: 'var(--cyan)', padding: 0 }}
              >
                {showWitnessFeed ? 'Hide Witness Records ▲' : `View ${witnessList.length} Independent Witness Statements ▼`}
              </button>

              {showWitnessFeed && (
                <div style={{ marginTop: '0.65rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {witnessList.map((w, idx) => (
                    <div
                      key={w._id || idx}
                      style={{
                        background: 'rgba(2, 6, 23, 0.5)',
                        border: '1px solid rgba(148, 163, 184, 0.12)',
                        borderRadius: 'var(--radius-sm)',
                        padding: '0.5rem 0.75rem',
                        fontSize: '0.76rem',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <div>
                        <span style={{ fontWeight: 700, color: w.verificationType === 'confirmed' ? '#34d399' : '#f87171', marginRight: '0.5rem' }}>
                          {w.verificationType === 'confirmed' ? '✓ Confirmed' : '⚠ Disputed'}
                        </span>
                        <span style={{ color: 'var(--text-secondary)' }}>
                          {w.statement ? `"${w.statement}"` : 'Direct witness observation'}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                        {w.approximateDistanceKm ? `~${w.approximateDistanceKm} km away` : 'Proximity verified'}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Responder / Admin Status Management */}
        {isAdminOrResponder && (
          <div
            style={{
              background: 'rgba(99, 102, 241, 0.08)',
              border: '1px solid rgba(99, 102, 241, 0.25)',
              borderRadius: 'var(--radius-md)',
              padding: '1rem',
              marginBottom: '1.25rem',
            }}
          >
            <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#a5b4fc', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
              🛡️ {t('admin.adminTitle', 'Responder / Admin Status Management')}
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {['Pending', 'Under Review', 'Resolved', 'Rejected'].map((statusOption) => (
                <button
                  key={statusOption}
                  disabled={updating || currentStatus === statusOption}
                  onClick={() => handleStatusChange(statusOption)}
                  className={`btn ${currentStatus === statusOption ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                  style={{ fontSize: '0.76rem' }}
                >
                  {statusOption}
                </button>
              ))}
            </div>

            {updateMsg && (
              <div style={{ fontSize: '0.78rem', color: '#34d399', marginTop: '0.5rem' }}>
                ✓ {updateMsg}
              </div>
            )}
          </div>
        )}

        <button onClick={onClose} className="btn btn-primary" style={{ width: '100%', padding: '0.75rem' }}>
          {t('common.close', 'Close Ticket')}
        </button>
      </div>
    </div>
  );
};

export default IncidentDetailModal;
