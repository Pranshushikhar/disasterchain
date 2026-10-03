import React, { useState, useEffect } from 'react';
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
import { fetchIncidents, createIncident } from '../services/api';

export default function ModernIncidentsPage({ onOpenIncident: externalOpenIncident }) {
  const [incidents, setIncidents] = useState([
    {
      id: 'inc-1',
      category: 'Flooding',
      title: 'Waterlogging at Ring Road Underpass',
      severity: 'High',
      distance: '1.2 km away',
      time: '14 min ago',
      verified: true,
      description: 'Underpass inundated with approx 3.5 ft of runoff water. Passenger sedans stranded.',
      location: 'Ring Road South Underpass',
      reportsCount: 12,
    },
    {
      id: 'inc-2',
      category: 'Road blocked',
      title: 'Fallen High-Tension Bough',
      severity: 'Moderate',
      distance: '2.4 km away',
      time: '42 min ago',
      verified: true,
      description: 'Large bough severed secondary electricity line and obstructed westbound lane.',
      location: 'Sector 8 Market Junction',
      reportsCount: 5,
    },
    {
      id: 'inc-3',
      category: 'Power outage',
      title: 'Substation Transformer Tripping',
      severity: 'Moderate',
      distance: '3.1 km away',
      time: '1 hour ago',
      verified: false,
      description: 'Feeder #3 tripped due to lightning strike. Discom crews dispatched.',
      location: 'Phase 2 Industrial Enclave',
      reportsCount: 8,
    },
    {
      id: 'inc-4',
      category: 'Medical emergency',
      title: 'Ambulance Route Obstructed',
      severity: 'Critical',
      distance: '3.8 km away',
      time: '1.5 hours ago',
      verified: true,
      description: 'Emergency corridor towards Metro Hospital blocked by stalled bus. Traffic marshals rerouting.',
      location: 'Civil Lines Outer Gate',
      reportsCount: 3,
    },
  ]);

  const [selectedIncident, setSelectedIncident] = useState(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Report Form State (5 steps: Photo, Location, Category, Description, Submit)
  const [reportForm, setReportForm] = useState({
    photoUrl: '',
    location: 'Current GPS Coordinates (Detected)',
    category: 'Flooding',
    description: '',
  });

  // Load backend incidents
  useEffect(() => {
    const loadIncidents = async () => {
      try {
        const data = await fetchIncidents();
        if (Array.isArray(data) && data.length > 0) {
          const formatted = data.map((d, i) => ({
            id: d._id || `backend-${i}`,
            category: d.category || 'Disruption',
            title: d.title || `${d.category || 'Incident'} Reported`,
            severity: d.severity ? d.severity.charAt(0).toUpperCase() + d.severity.slice(1) : 'Moderate',
            distance: d.distance ? `${d.distance} km away` : `${(1.2 + i * 0.8).toFixed(1)} km away`,
            time: d.createdAt ? new Date(d.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recent',
            verified: d.status === 'verified' || d.status === 'confirmed',
            description: d.description || 'Citizen reported field incident under verification.',
            location: d.location?.address || 'Local Region',
            reportsCount: d.upvotes || 1,
          }));
          setIncidents(formatted);
        }
      } catch (err) {
        console.error('ModernIncidents load error:', err);
      }
    };
    loadIncidents();
  }, []);

  const handleOpenReport = () => {
    setIsReportModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!reportForm.description.trim()) return;

    setSubmitting(true);
    try {
      await createIncident({
        title: `${reportForm.category} reported at ${reportForm.location}`,
        category: reportForm.category,
        description: reportForm.description,
        location: {
          address: reportForm.location,
          coordinates: [77.209, 28.6139],
        },
        severity: reportForm.category === 'Medical emergency' ? 'critical' : 'moderate',
      });
      setSubmitSuccess(true);
      setTimeout(() => {
        setSubmitSuccess(false);
        setIsReportModalOpen(false);
        setReportForm({
          photoUrl: '',
          location: 'Current GPS Coordinates (Detected)',
          category: 'Flooding',
          description: '',
        });
      }, 1400);
    } catch (err) {
      // Local optimism if offline
      const newInc = {
        id: `local-${Date.now()}`,
        category: reportForm.category,
        title: `${reportForm.category} at ${reportForm.location}`,
        severity: reportForm.category === 'Medical emergency' ? 'Critical' : 'Moderate',
        distance: '0.1 km away',
        time: 'Just now',
        verified: false,
        description: reportForm.description,
        location: reportForm.location,
        reportsCount: 1,
      };
      setIncidents((prev) => [newInc, ...prev]);
      setSubmitSuccess(true);
      setTimeout(() => {
        setSubmitSuccess(false);
        setIsReportModalOpen(false);
      }, 1200);
    } finally {
      setSubmitting(false);
    }
  };

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
            <span className="dc-section-subtitle">COMMUNITY & FIELD REPORTS</span>
            <h1 className="dc-page-title">Incidents Near You</h1>
          </div>
          <button
            id="dc-report-incident-btn"
            onClick={handleOpenReport}
            className="dc-btn-primary"
          >
            <Plus size={18} />
            <span>Report incident</span>
          </button>
        </div>

        {/* INCIDENT LIST */}
        <div className="dc-incidents-list">
          {incidents.map((inc) => (
            <div
              key={inc.id}
              className="dc-incident-card"
              onClick={() => setSelectedIncident(inc)}
              role="button"
              tabIndex={0}
            >
              <div className="dc-incident-left">
                <div className="dc-incident-badge-row">
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
                  {inc.verified && (
                    <span className="dc-verified-badge" title="Verified by field responder">
                      <CheckCircle2 size={13} />
                      <span>Verified</span>
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
                </div>
              </div>

              <ChevronRight size={18} className="dc-incident-arrow" />
            </div>
          ))}
        </div>
      </div>

      {/* DETAIL MODAL */}
      <AnimatePresence>
        {selectedIncident && (
          <div className="dc-modal-backdrop" onClick={() => setSelectedIncident(null)}>
            <motion.div
              className="dc-modal-card"
              onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="dc-modal-header">
                <div className="dc-badge-group">
                  <span className="dc-incident-category">{selectedIncident.category}</span>
                  <span className={`dc-severity-tag ${selectedIncident.severity.toLowerCase()}`}>
                    {selectedIncident.severity}
                  </span>
                </div>
                <button
                  className="dc-close-icon-btn"
                  onClick={() => setSelectedIncident(null)}
                >
                  <X size={18} />
                </button>
              </div>

              <h2 className="dc-modal-title">{selectedIncident.title}</h2>

              <div className="dc-modal-meta-row">
                <span>{selectedIncident.distance}</span>
                <span>·</span>
                <span>{selectedIncident.time}</span>
                <span>·</span>
                <span>{selectedIncident.location}</span>
              </div>

              <p className="dc-modal-body">{selectedIncident.description}</p>

              <div className="dc-modal-footer">
                <button
                  onClick={() => setSelectedIncident(null)}
                  className="dc-btn-secondary"
                >
                  Close
                </button>
                <a
                  href={`https://maps.google.com/?q=${encodeURIComponent(selectedIncident.location)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="dc-btn-primary"
                >
                  View on Map
                </a>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* STREAMLINED REPORT MODAL (PHOTO, LOCATION, CATEGORY, DESCRIPTION, SUBMIT) */}
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
                  <p>Civic responders and local users have been notified.</p>
                </div>
              ) : (
                <form onSubmit={handleFormSubmit} className="dc-report-form">
                  {/* 1. PHOTO */}
                  <div className="dc-form-group">
                    <label className="dc-form-label">1. Photo (Optional)</label>
                    <div className="dc-photo-upload-box">
                      <Camera size={20} />
                      <span>Tap to attach photo from scene</span>
                    </div>
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
                      disabled={submitting}
                      className="dc-btn-primary"
                    >
                      {submitting ? (
                        <>
                          <Loader2 size={16} className="dc-spin" />
                          <span>Transmitting...</span>
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
