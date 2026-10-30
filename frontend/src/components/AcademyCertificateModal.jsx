import React, { useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Award, CheckCircle, Download, Printer, X, Shield, Calendar, Hash } from 'lucide-react';

export default function AcademyCertificateModal({ isOpen, onClose, certificateData }) {
  const certRef = useRef(null);

  if (!isOpen || !certificateData) return null;

  const {
    userName = 'Disaster Preparedness Scholar',
    courseTitle = 'Earthquake Safety & Structural Survival',
    certificateId = 'DC-CERT-2026-X8291',
    completedDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
    score = 100
  } = certificateData;

  const handlePrint = () => {
    window.print();
  };

  return (
    <AnimatePresence>
      <div className="dc-modal-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-label="Certificate of Completion">
        <motion.div
          className="dc-certificate-modal-wrapper"
          onClick={(e) => e.stopPropagation()}
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 20 }}
          transition={{ type: 'spring', damping: 26, stiffness: 260 }}
        >
          {/* Action Bar */}
          <div className="dc-cert-action-bar no-print">
            <span className="dc-cert-action-title">DisasterChain Educational Credential</span>
            <div className="dc-cert-buttons">
              <button onClick={handlePrint} className="dc-btn dc-btn-outline" title="Print or save as PDF">
                <Printer size={16} />
                <span>Print / PDF</span>
              </button>
              <button onClick={onClose} className="dc-cert-close-btn" aria-label="Close certificate">
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Printable Certificate Canvas */}
          <div className="dc-printable-certificate" ref={certRef}>
            <div className="dc-cert-outer-border">
              <div className="dc-cert-inner-frame">
                {/* Certificate Header */}
                <div className="dc-cert-header">
                  <div className="dc-cert-brand">
                    <span className="dc-brand-earth-dot" />
                    <span className="dc-cert-brand-name">DISASTER<span className="dc-brand-accent">CHAIN</span> ACADEMY</span>
                  </div>
                  <div className="dc-cert-seal">
                    <Shield size={38} className="dc-seal-shield" />
                    <Award size={20} className="dc-seal-award" />
                  </div>
                </div>

                {/* Title */}
                <div className="dc-cert-headings">
                  <h1 className="dc-cert-main-title">CERTIFICATE OF COMPLETION</h1>
                  <p className="dc-cert-subtitle">This educational credential is proudly awarded to</p>
                </div>

                {/* Recipient Name */}
                <div className="dc-cert-recipient">
                  <h2 className="dc-recipient-name">{userName}</h2>
                  <div className="dc-recipient-underline" />
                </div>

                {/* Course Statement */}
                <div className="dc-cert-body">
                  <p className="dc-cert-text">
                    For successfully demonstrating mastery of disaster risk mitigation, rapid emergency response protocols,
                    and practical safety decision-making in the comprehensive curriculum:
                  </p>
                  <h3 className="dc-certified-course-name">{courseTitle}</h3>
                  <div className="dc-cert-performance-tag">
                    <CheckCircle size={15} />
                    <span>Examination Score: {score}% • Verified Proficiency</span>
                  </div>
                </div>

                {/* Signatures & Verification Meta */}
                <div className="dc-cert-footer">
                  <div className="dc-cert-meta-item">
                    <Calendar size={14} />
                    <span>Conferred on: <strong>{completedDate}</strong></span>
                  </div>

                  <div className="dc-cert-center-signature">
                    <span className="dc-signature-script">DisasterChain Earth Intelligence</span>
                    <span className="dc-signature-title">ACADEMY ACADEMIC COUNCIL</span>
                  </div>

                  <div className="dc-cert-meta-item">
                    <Hash size={14} />
                    <span>Verification ID: <strong className="dc-cert-mono-id">{certificateId}</strong></span>
                  </div>
                </div>

                {/* Mandatory Non-Accredited Legal Disclaimer */}
                <div className="dc-cert-disclaimer">
                  <strong>DISCLAIMER & LEGAL NOTICE:</strong> This certificate is an educational completion record issued by DisasterChain Academy to acknowledge self-paced civilian safety study. It does not constitute certified medical, governmental, military, or licensed occupational training.
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
