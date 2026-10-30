import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle,
  AlertTriangle,
  Share2,
  X,
} from 'lucide-react';
import { useCrisisSimulation } from '../context/CrisisSimulationContext';

export default function AfterActionReportModal({ isOpen, onClose }) {
  const {
    scenario,
    districtMeta,
    decisions,
    elapsedSeconds,
    calculateScore,
    incidents,
    activeWhatIfs,
  } = useCrisisSimulation();

  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const score = calculateScore();
  let grade = 'A';
  let gradeColor = 'var(--dc-safe)';
  if (score >= 90) {
    grade = 'A+ (Elite Tactical Commander)';
    gradeColor = 'var(--dc-safe)';
  } else if (score >= 80) {
    grade = 'A (Highly Effective Emergency Response)';
    gradeColor = 'var(--dc-earth-green)';
  } else if (score >= 70) {
    grade = 'B+ (Competent Command with Minor Route Lags)';
    gradeColor = 'var(--dc-warning)';
  } else {
    grade = 'C (Suboptimal Resource Allocation)';
    gradeColor = 'var(--dc-emergency)';
  }

  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const rem = secs % 60;
    return `${mins}m ${rem < 10 ? '0' : ''}${rem}s`;
  };

  const handleCopySummary = () => {
    const summary = `DISASTERCHAIN 2.0 COMMAND REPORT\nScenario: ${scenario?.title}\nDistrict: ${districtMeta.name} (Simulated)\nScore: ${score}/100 [Grade: ${grade}]\nDecisions Logged: ${decisions.length}\nSimulation Duration: ${formatTime(elapsedSeconds)}`;
    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AnimatePresence>
      <div className="dc-modal-overlay" style={{ zIndex: 9999 }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.25 }}
          className="dc-modal-card dc-aar-card"
          style={{
            maxWidth: 760,
            width: '92%',
            maxHeight: '90vh',
            overflowY: 'auto',
            background: 'var(--dc-elevated, #FFFDF8)',
            border: '1.5px solid var(--border-medium, rgba(30, 39, 37, 0.14))',
            borderRadius: 14,
            padding: '24px 28px',
            color: 'var(--dc-text, #1E2725)',
            boxShadow: '0 20px 45px rgba(38, 63, 53, 0.16)',
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: 16 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span className="dc-badge dc-badge-emergency" style={{ fontSize: '0.72rem', fontWeight: 700, padding: '3px 8px' }}>
                  SIMULATED AFTER-ACTION REPORT
                </span>
                <span style={{ fontSize: '0.8rem', color: 'var(--dc-text-secondary)', fontWeight: 600 }}>
                  AAR-REF: DC-2026-SN
                </span>
              </div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '6px 0 2px', color: 'var(--dc-forest, #263F35)' }}>
                Command Performance & Evacuation Assessment
              </h2>
              <p style={{ fontSize: '0.86rem', color: 'var(--dc-text-secondary)', margin: 0 }}>
                District: <strong>{districtMeta.name}</strong> • Scenario: <strong>{scenario?.title}</strong>
              </p>
            </div>
            <button
              onClick={onClose}
              style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 6, color: 'var(--dc-text-secondary)' }}
            >
              <X size={20} />
            </button>
          </div>

          {/* Score & Rating Banner */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: 16,
              background: 'var(--dc-surface, #F8F5EE)',
              border: '1px solid var(--border-medium)',
              borderRadius: 10,
              padding: 18,
              margin: '20px 0',
            }}
          >
            <div>
              <div style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--dc-text-secondary)', fontWeight: 700 }}>
                Response Index Score
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 4 }}>
                <span style={{ fontSize: '2.4rem', fontWeight: 900, color: gradeColor, lineHeight: 1 }}>
                  {score}
                </span>
                <span style={{ fontSize: '1rem', color: 'var(--dc-text-muted)', fontWeight: 600 }}>/ 100</span>
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--dc-text-secondary)', fontWeight: 700 }}>
                Tactical Grade
              </div>
              <div style={{ fontSize: '1.05rem', fontWeight: 800, color: gradeColor, marginTop: 6 }}>
                {grade}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--dc-text-secondary)', fontWeight: 700 }}>
                Operational Duration
              </div>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--dc-forest)', marginTop: 6 }}>
                {formatTime(elapsedSeconds)}
              </div>
            </div>
          </div>

          {/* Core Quantitative Metrics */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12, marginBottom: 20 }}>
            <div style={{ padding: '12px 14px', borderRadius: 8, background: 'var(--dc-surface-2, #EFE9DC)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.74rem', color: 'var(--dc-text-secondary)', fontWeight: 600 }}>Civilians Protected</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--dc-forest)', marginTop: 2 }}>
                {(1420 + decisions.length * 85).toLocaleString()}
              </div>
            </div>

            <div style={{ padding: '12px 14px', borderRadius: 8, background: 'var(--dc-surface-2, #EFE9DC)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.74rem', color: 'var(--dc-text-secondary)', fontWeight: 600 }}>Command Actions</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--dc-earth-green)', marginTop: 2 }}>
                {decisions.length} Executed
              </div>
            </div>

            <div style={{ padding: '12px 14px', borderRadius: 8, background: 'var(--dc-surface-2, #EFE9DC)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.74rem', color: 'var(--dc-text-secondary)', fontWeight: 600 }}>Trauma Route Continuity</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--dc-safe)', marginTop: 2 }}>
                98.6%
              </div>
            </div>

            <div style={{ padding: '12px 14px', borderRadius: 8, background: 'var(--dc-surface-2, #EFE9DC)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.74rem', color: 'var(--dc-text-secondary)', fontWeight: 600 }}>What-If Stress Tests</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--dc-clay)', marginTop: 2 }}>
                {activeWhatIfs.length} Evaluated
              </div>
            </div>
          </div>

          {/* Key Successes and Areas for Improvement */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16, marginBottom: 20 }}>
            <div style={{ padding: 14, borderRadius: 8, background: 'rgba(79, 128, 96, 0.08)', border: '1px solid rgba(79, 128, 96, 0.2)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--dc-safe)', fontWeight: 700, fontSize: '0.85rem', marginBottom: 8 }}>
                <CheckCircle size={16} /> Key Tactical Strengths
              </div>
              <ul style={{ margin: 0, paddingLeft: 18, fontSize: '0.82rem', color: 'var(--dc-text)', lineHeight: 1.6 }}>
                <li>Rapid dispatch of specialized shallow-water boats prevented riverfront casualties.</li>
                <li>Proactive diversion of trauma ambulances across North Elevated Flyover preserved hospital access.</li>
                <li>Shelter distribution maintained below 90% surge ceiling in Sector 4.</li>
              </ul>
            </div>

            <div style={{ padding: 14, borderRadius: 8, background: 'rgba(195, 138, 53, 0.08)', border: '1px solid rgba(195, 138, 53, 0.2)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--dc-warning)', fontWeight: 700, fontSize: '0.85rem', marginBottom: 8 }}>
                <AlertTriangle size={16} /> Operational Refinements
              </div>
              <ul style={{ margin: 0, paddingLeft: 18, fontSize: '0.82rem', color: 'var(--dc-text)', lineHeight: 1.6 }}>
                <li>Pre-position motorized rafts before river gauge reaches 2.0m threshold.</li>
                <li>Deploy high-clearance 4x4 supply vehicles earlier into Sector 2 backwaters.</li>
              </ul>
            </div>
          </div>

          {/* Chronological Audit Trail */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--dc-text-secondary)', fontWeight: 700, marginBottom: 8 }}>
              Incident Commander Audit Trail ({decisions.length} Actions)
            </div>
            <div
              style={{
                maxHeight: 160,
                overflowY: 'auto',
                background: 'var(--dc-surface, #F8F5EE)',
                borderRadius: 8,
                border: '1px solid var(--border-medium)',
                padding: '8px 12px',
              }}
            >
              {decisions.length === 0 ? (
                <div style={{ fontSize: '0.82rem', color: 'var(--dc-text-muted)', padding: '12px 0', textAlign: 'center' }}>
                  No decisions executed yet. Use the command buttons to dispatch units or run what-if scenarios.
                </div>
              ) : (
                decisions.map((dec, idx) => (
                  <div
                    key={dec.id || idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: '0.8rem',
                      padding: '6px 0',
                      borderBottom: idx < decisions.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontWeight: 700, color: 'var(--dc-earth-green)', width: 20 }}>#{idx + 1}</span>
                      <span style={{ fontWeight: 600 }}>{dec.action}</span>
                    </div>
                    <span style={{ color: 'var(--dc-text-muted)', fontSize: '0.74rem' }}>{dec.timestamp}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Footer Action Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-subtle)', paddingTop: 16 }}>
            <span style={{ fontSize: '0.74rem', color: 'var(--dc-text-muted)', fontStyle: 'italic' }}>
              Simulated demonstration for DisasterChain 2.0 evaluation.
            </span>
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={handleCopySummary}
                className="dc-btn dc-btn-secondary"
                style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.82rem', padding: '8px 14px' }}
              >
                <Share2 size={15} />
                {copied ? 'Copied!' : 'Copy Summary'}
              </button>
              <button
                onClick={onClose}
                className="dc-btn dc-btn-primary"
                style={{ fontSize: '0.82rem', padding: '8px 16px', background: 'var(--dc-forest, #263F35)', color: '#FFF' }}
              >
                Close Report
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
