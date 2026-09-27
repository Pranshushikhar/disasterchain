import React, { useState } from 'react';
import { createIncident } from '../services/api';
import SourceBadge from './SourceBadge';

/**
 * DISASTERCHAIN COMMUNITY SIGNAL MODAL
 * Citizen field reporting with transparent moderation status (UNVERIFIED -> VERIFIED).
 */
export const HAZARD_CATEGORIES = [
  'Waterlogging',
  'Fallen Tree',
  'Road Blocked',
  'Power Outage',
  'Fire Hazard',
  'Unsafe Structure',
  'Damaged Electrical',
  'Other',
];

export default function CommunityReportModal({ isOpen, onClose, onSuccess }) {
  const [category, setCategory] = useState('Waterlogging');
  const [locationName, setLocationName] = useState('');
  const [description, setDescription] = useState('');
  const [latitude, setLatitude] = useState(28.6139);
  const [longitude, setLongitude] = useState(77.2090);
  const [isLocating, setIsLocating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);

  if (!isOpen) return null;

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setFeedback({ type: 'error', text: 'Geolocation is not supported by your browser.' });
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatitude(Number(pos.coords.latitude.toFixed(6)));
        setLongitude(Number(pos.coords.longitude.toFixed(6)));
        if (!locationName) {
          setLocationName(`GPS ${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`);
        }
        setIsLocating(false);
      },
      (err) => {
        console.warn('Geolocation error:', err.message);
        setFeedback({ type: 'error', text: 'Unable to acquire GPS fix. Please enter street location manually.' });
        setIsLocating(false);
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!locationName.trim() || !description.trim()) {
      setFeedback({ type: 'error', text: 'Please fill in both the location and description.' });
      return;
    }

    setIsSubmitting(true);
    setFeedback(null);

    try {
      const payload = {
        title: `Community Signal: ${category} at ${locationName}`,
        type: category === 'Waterlogging' ? 'Flooding' : category === 'Fallen Tree' ? 'Fallen tree' : 'Other',
        description: `[COMMUNITY SIGNAL · UNVERIFIED]\n${description}`,
        location: locationName,
        latitude,
        longitude,
        severity: category === 'Fire Hazard' ? 'High' : 'Medium',
      };

      await createIncident(payload);

      setFeedback({
        type: 'success',
        text: 'Report submitted. Marked as UNVERIFIED COMMUNITY SIGNAL pending responder review.',
      });

      setTimeout(() => {
        if (onSuccess) onSuccess();
        onClose();
      }, 1800);
    } catch (err) {
      console.error('Community report submission error:', err);
      setFeedback({
        type: 'error',
        text: err.response?.data?.message || 'Unable to transmit report. Please check connection and retry.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="dc-modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="dc-modal-box" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="dc-modal-header">
          <div className="modal-title-col">
            <span className="modal-super">CITIZEN TELEMETRY</span>
            <h3 className="modal-heading">Report Community Signal</h3>
          </div>
          <button type="button" className="modal-close-btn" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="dc-modal-form">
          {/* Trust notice */}
          <div className="moderation-notice">
            <span className="notice-badge">STATUS: UNVERIFIED</span>
            <p className="notice-text">
              Community reports appear with an unverified label until confirmed by operators or on-the-ground responders. Never use for urgent life-threatening rescue; use SOS instead.
            </p>
          </div>

          {feedback && (
            <div className={`form-feedback ${feedback.type}`}>
              {feedback.text}
            </div>
          )}

          {/* Hazard Category */}
          <div className="form-field">
            <label className="field-label">HAZARD CATEGORY</label>
            <div className="category-grid">
              {HAZARD_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  className={`cat-btn ${category === cat ? 'active' : ''}`}
                  onClick={() => setCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Location & GPS Fix */}
          <div className="form-field">
            <div className="label-row">
              <label className="field-label">LOCATION / STREET IDENTIFIER</label>
              <button
                type="button"
                className="gps-btn"
                onClick={handleDetectLocation}
                disabled={isLocating}
              >
                {isLocating ? 'Acquiring GPS...' : '📍 Auto-detect GPS'}
              </button>
            </div>
            <input
              type="text"
              className="text-input"
              placeholder="e.g. Ring Road Underpass near Gate 2"
              value={locationName}
              onChange={(e) => setLocationName(e.target.value)}
              required
            />
            <div className="coords-readout">
              <span>LAT: {latitude}</span>
              <span>·</span>
              <span>LON: {longitude}</span>
            </div>
          </div>

          {/* Description */}
          <div className="form-field">
            <label className="field-label">OBSERVATIONAL DETAILS</label>
            <textarea
              className="textarea-input"
              rows={3}
              placeholder="Describe standing water depth, affected vehicle lanes, obstructions, or structural status..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          {/* Footer Submit */}
          <div className="modal-footer-row">
            <button
              type="button"
              className="btn-cancel"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Transmitting...' : 'Transmit Community Signal'}
            </button>
          </div>
        </form>
      </div>

      <style>{`
        .dc-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(13, 14, 13, 0.85);
          backdrop-filter: blur(8px);
          z-index: 9999;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1.5rem;
          animation: modalFadeIn 0.15s ease-out;
        }

        .dc-modal-box {
          width: 100%;
          max-width: 560px;
          background: #181A18;
          border: 1px solid rgba(242, 238, 231, 0.16);
          border-radius: 4px;
          box-shadow: 0 16px 48px rgba(0, 0, 0, 0.8);
          overflow: hidden;
          font-family: var(--font-sans, -apple-system, sans-serif);
          color: #E9E5DC;
        }

        .dc-modal-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          padding: 1rem 1.25rem;
          background: #121413;
          border-bottom: 1px solid rgba(242, 238, 231, 0.08);
        }

        .modal-super {
          font-family: var(--font-mono, monospace);
          font-size: 0.65rem;
          font-weight: 700;
          letter-spacing: 0.12em;
          color: #D66A35;
        }

        .modal-heading {
          font-size: 1.1rem;
          font-weight: 600;
          color: #F7F4ED;
          margin: 0.2rem 0 0 0;
        }

        .modal-close-btn {
          background: transparent;
          border: none;
          color: #A49F93;
          font-size: 1rem;
          cursor: pointer;
        }

        .dc-modal-form {
          padding: 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 1.15rem;
        }

        .moderation-notice {
          background: rgba(198, 154, 58, 0.08);
          border-left: 2px solid #C69A3A;
          padding: 0.65rem 0.85rem;
          border-radius: 2px;
        }

        .notice-badge {
          display: block;
          font-family: var(--font-mono, monospace);
          font-size: 0.62rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          color: #C69A3A;
          margin-bottom: 0.2rem;
        }

        .notice-text {
          font-size: 0.74rem;
          color: #E9E5DC;
          line-height: 1.35;
          margin: 0;
        }

        .form-feedback {
          padding: 0.65rem 0.85rem;
          border-radius: 2px;
          font-size: 0.78rem;
        }

        .form-feedback.success {
          background: rgba(94, 139, 104, 0.15);
          border: 1px solid #5E8B68;
          color: #5E8B68;
        }

        .form-feedback.error {
          background: rgba(200, 74, 58, 0.15);
          border: 1px solid #C84A3A;
          color: #D84D3F;
        }

        .form-field {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }

        .field-label {
          font-family: var(--font-mono, monospace);
          font-size: 0.65rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          color: #A49F93;
        }

        .category-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 0.4rem;
        }

        @media (max-width: 500px) {
          .category-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        .cat-btn {
          background: #121413;
          border: 1px solid rgba(242, 238, 231, 0.1);
          color: #A49F93;
          font-size: 0.72rem;
          padding: 0.4rem 0.2rem;
          border-radius: 2px;
          cursor: pointer;
          transition: all 0.12s ease;
        }

        .cat-btn:hover {
          color: #F7F4ED;
          border-color: rgba(242, 238, 231, 0.25);
        }

        .cat-btn.active {
          background: rgba(214, 106, 53, 0.15);
          border-color: #D66A35;
          color: #D66A35;
          font-weight: 600;
        }

        .label-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .gps-btn {
          background: transparent;
          border: none;
          color: #D66A35;
          font-family: var(--font-mono, monospace);
          font-size: 0.65rem;
          cursor: pointer;
        }

        .text-input,
        .textarea-input {
          background: #121413;
          border: 1px solid rgba(242, 238, 231, 0.14);
          color: #F7F4ED;
          font-size: 0.85rem;
          padding: 0.55rem 0.75rem;
          border-radius: 2px;
          outline: none;
        }

        .text-input:focus,
        .textarea-input:focus {
          border-color: #D66A35;
        }

        .coords-readout {
          display: flex;
          gap: 0.4rem;
          font-family: var(--font-mono, monospace);
          font-size: 0.62rem;
          color: #7A756D;
        }

        .modal-footer-row {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 0.75rem;
          border-top: 1px solid rgba(242, 238, 231, 0.08);
          padding-top: 1rem;
        }

        .btn-cancel {
          background: transparent;
          border: 1px solid rgba(242, 238, 231, 0.12);
          color: #A49F93;
          padding: 0.45rem 0.85rem;
          border-radius: 2px;
          font-size: 0.78rem;
          cursor: pointer;
        }

        .btn-submit {
          background: #D66A35;
          border: none;
          color: #121413;
          font-family: var(--font-mono, monospace);
          font-size: 0.74rem;
          font-weight: 700;
          letter-spacing: 0.06em;
          padding: 0.55rem 1rem;
          border-radius: 2px;
          cursor: pointer;
        }

        .btn-submit:hover:not(:disabled) {
          background: #E58A58;
        }

        .btn-submit:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        @keyframes modalFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
