import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building,
  Satellite,
  Navigation,
  Users,
  Mic,
  ArrowRight,
  ArrowLeft,
  X,
  CheckCircle2,
  Sparkles,
  Activity,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const TOUR_STEPS = [
  {
    step: 1,
    title: 'DisasterChain 2.0 — Autonomous Master Ecosystem',
    subtitle: 'Integrated Disaster Intelligence & Emergency Command',
    icon: Sparkles,
    route: '/',
    content:
      'Welcome to DisasterChain 2.0! This release unites real-time disaster simulation, 3D geospatial awareness, satellite computer vision, dynamic evacuation routing, responder fleet coordination, and multilingual voice triage into one synchronized command platform.',
    highlight: 'All six flagship capabilities operate on shared deterministic telemetry for Saraswati Nagar (Simulated).',
  },
  {
    step: 2,
    title: 'Capability 1: CRISISLAB (/crisis-lab)',
    subtitle: 'Interactive Emergency Command Simulation',
    icon: Activity,
    route: '/crisis-lab',
    content:
      'Operate a live command center during an active flash flood. Monitor rising river gauges, assign NDRF squads or boats, stress-test what-if contingencies (Double Rainfall, Bridge Collapse), and query the AI Command Advisor.',
    highlight: 'Simulation events dynamically modify global infrastructure, road accessibility, and responder availability.',
  },
  {
    step: 3,
    title: 'Capability 2: 3D DIGITAL TWIN (/digital-twin)',
    subtitle: 'Disaster-Aware 3D Urban Model',
    icon: Building,
    route: '/digital-twin',
    content:
      'Explore Saraswati Nagar in full 3D WebGL. Orbit, zoom, and click individual structures to inspect flood and seismic risk scores. Watch the 3D water level plane physically rise as the CrisisLab simulation runs.',
    highlight: 'Bridge structures visibly change color to red when floodwaters breach their submersion threshold.',
  },
  {
    step: 4,
    title: 'Capability 3: SATELLITE EYE (/satellite-eye)',
    subtitle: 'AI-Powered Satellite & Aerial Imagery Analysis',
    icon: Satellite,
    route: '/satellite-eye',
    content:
      'Compare pre- and post-disaster satellite passes using the interactive split slider. Detect flooded hectares, structural rubble fields, and toxic burn scars with uncertainty margins and mandatory human review advisories.',
    highlight: 'Multi-task computer vision heuristics with transparent fallback across optical and SAR imagery.',
  },
  {
    step: 5,
    title: 'Capability 4: RESCUE ROUTE INTELLIGENCE (/rescue-intelligence)',
    subtitle: 'Dynamic Evacuation & Safe Route Planner',
    icon: Navigation,
    route: '/rescue-intelligence',
    content:
      'Multi-criteria route planner that dynamically recalculates when roads flood or bridges collapse in CrisisLab. Compare Shortest vs Fastest vs Lowest-Risk Safe Corridors tailored to vehicle wading limits.',
    highlight: 'When Central Bridge submerge, ambulances are automatically diverted to the high-clearance North Flyover.',
  },
  {
    step: 6,
    title: 'Capability 5: RESCUE NETWORK (/rescue-network)',
    subtitle: 'Intelligent Responder & Fleet Coordination',
    icon: Users,
    route: '/rescue-network',
    content:
      'Live triage Kanban board matching pending distress calls with specialized response units (Zodiac boats, ALS trauma ambulances, 4x4 wading trucks). Monitors live hospital bed and shelter capacity.',
    highlight: 'Strict safety safeguard: AI recommendations require explicit authorized human confirmation before deployment.',
  },
  {
    step: 7,
    title: 'Capability 6: GLOBAL VOICE COPILOT',
    subtitle: 'Multilingual Voice Intelligence & Accessibility Extraction',
    icon: Mic,
    route: '/crisis-lab',
    content:
      'Click the floating AI Assistant pill (or press Alt+V). Say or select: "My house is flooding, my mother uses a wheelchair". The assistant extracts the disaster type, accessibility needs (wheelchair/elderly), and prepares an unconfirmed draft.',
    highlight: 'Supports 20 Indian languages. Never silently dispatches emergency services without confirmation.',
  },
];

export default function GuidedDemoTourModal({ isOpen, onClose }) {
  const navigate = useNavigate();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  if (!isOpen) return null;

  const currentTourStep = TOUR_STEPS[currentStepIndex];
  const Icon = currentTourStep.icon;

  const handleNext = () => {
    if (currentStepIndex < TOUR_STEPS.length - 1) {
      const nextIdx = currentStepIndex + 1;
      setCurrentStepIndex(nextIdx);
      if (TOUR_STEPS[nextIdx].route) {
        navigate(TOUR_STEPS[nextIdx].route);
      }
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      const prevIdx = currentStepIndex - 1;
      setCurrentStepIndex(prevIdx);
      if (TOUR_STEPS[prevIdx].route) {
        navigate(TOUR_STEPS[prevIdx].route);
      }
    }
  };

  return (
    <AnimatePresence>
      <div className="dc-modal-overlay" style={{ zIndex: 10000 }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2 }}
          className="dc-modal-card"
          style={{
            maxWidth: 620,
            width: '90%',
            background: 'var(--dc-elevated, #FFFDF8)',
            border: '1.5px solid var(--border-medium)',
            borderRadius: 14,
            padding: '24px 28px',
            boxShadow: '0 24px 50px rgba(38, 63, 53, 0.2)',
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 10,
                  background: 'rgba(73, 107, 90, 0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--dc-earth-green)',
                }}
              >
                <Icon size={20} />
              </div>
              <div>
                <span style={{ fontSize: '0.74rem', fontWeight: 800, color: 'var(--dc-earth-green)', textTransform: 'uppercase' }}>
                  GUIDED JUDGE DEMO • STEP {currentTourStep.step} OF {TOUR_STEPS.length}
                </span>
                <h3 style={{ fontSize: '1.18rem', fontWeight: 800, margin: '2px 0 0', color: 'var(--dc-forest)' }}>
                  {currentTourStep.title}
                </h3>
              </div>
            </div>

            <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--dc-text-muted)' }}>
              <X size={20} />
            </button>
          </div>

          {/* Subtitle & Body */}
          <div style={{ margin: '18px 0' }}>
            <div style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--dc-text-secondary)', marginBottom: 8 }}>
              {currentTourStep.subtitle}
            </div>
            <p style={{ fontSize: '0.88rem', color: 'var(--dc-text)', lineHeight: 1.6, margin: 0 }}>
              {currentTourStep.content}
            </p>

            <div
              style={{
                marginTop: 14,
                padding: '10px 14px',
                borderRadius: 8,
                background: 'var(--dc-surface-2)',
                border: '1px solid var(--border-subtle)',
                fontSize: '0.8rem',
                color: 'var(--dc-forest)',
                fontWeight: 600,
              }}
            >
              💡 <strong>Key Highlight:</strong> {currentTourStep.highlight}
            </div>
          </div>

          {/* Progress Indicators & Navigation Controls */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-subtle)', paddingTop: 16 }}>
            {/* Step Dots */}
            <div style={{ display: 'flex', gap: 6 }}>
              {TOUR_STEPS.map((_, i) => (
                <span
                  key={i}
                  style={{
                    width: i === currentStepIndex ? 20 : 6,
                    height: 6,
                    borderRadius: 3,
                    background: i === currentStepIndex ? 'var(--dc-earth-green)' : 'var(--border-medium)',
                    transition: 'all 0.2s ease',
                  }}
                />
              ))}
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              {currentStepIndex > 0 && (
                <button
                  onClick={handlePrev}
                  className="dc-btn dc-btn-secondary"
                  style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.82rem', padding: '8px 14px' }}
                >
                  <ArrowLeft size={14} /> Previous
                </button>
              )}

              <button
                onClick={handleNext}
                className="dc-btn dc-btn-primary"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  fontSize: '0.82rem',
                  padding: '8px 18px',
                  background: 'var(--dc-forest)',
                  color: '#FFF',
                }}
              >
                {currentStepIndex === TOUR_STEPS.length - 1 ? (
                  <>
                    <CheckCircle2 size={15} /> Finish Demo Tour
                  </>
                ) : (
                  <>
                    Next Step <ArrowRight size={14} />
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
