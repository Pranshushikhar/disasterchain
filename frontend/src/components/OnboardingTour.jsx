import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Compass,
  ArrowRight,
  ArrowLeft,
  X,
  CheckCircle,
  Shield,
  CloudRain,
  MapPin,
  AlertTriangle,
  LifeBuoy,
  Sparkles,
  ExternalLink,
} from 'lucide-react';

const TOUR_STORAGE_KEY = 'disasterchain_tour_completed';

export const TOUR_STEPS = [
  {
    id: 'welcome',
    targetSelector: '.dc-home-header',
    fallbackPosition: 'center',
    badge: 'WELCOME',
    icon: Compass,
    title: 'Welcome to DisasterChain',
    description:
      'Earth Intelligence for personal safety. Designed with a clean, focused sidebar layout and calm situational awareness.',
    tip: 'Press Escape anytime to exit the tour.',
  },
  {
    id: 'nav',
    targetSelector: '.dc-sidebar, .dc-sidebar-nav, .dc-nav-links, .dc-mobile-bottom-nav',
    fallbackPosition: 'top',
    badge: 'SIDEBAR NAVIGATION',
    icon: Compass,
    title: 'Left Sidebar Navigation',
    description:
      'All application features are organized into Main Operations, Emergency Resources, and Platform Settings in the left sidebar.',
  },
  {
    id: 'home',
    targetSelector: '.dc-whats-happening-card, .dc-home-weather-card',
    fallbackPosition: 'center',
    badge: 'CURRENT CONDITIONS',
    icon: Shield,
    title: 'Clean Situational Overview',
    description:
      'Your opening dashboard is kept clean and minimal: live ambient temperature, conditions, and risk status without visual clutter.',
  },
  {
    id: 'weather',
    targetSelector: '#dc-sidebar-weather, a[href="/weather"]',
    fallbackPosition: 'bottom',
    badge: 'ATMOSPHERIC TELEMETRY',
    icon: CloudRain,
    title: 'Weather & Forecasts Tab',
    description:
      'High-resolution precipitation probabilities, hourly timelines, wind velocity, and air quality index reside inside the Weather tab.',
  },
  {
    id: 'map',
    targetSelector: '#dc-sidebar-map, a[href="/map"], .dc-map-preview-wrap',
    fallbackPosition: 'center',
    badge: 'SPATIAL RECONNAISSANCE',
    icon: MapPin,
    title: 'Interactive Map & Hazards',
    description:
      'View real-time risk perimeters, road blockages, open relief shelters, and active hazard zones with filterable geospatial layers.',
  },
  {
    id: 'incidents',
    targetSelector: '#dc-sidebar-incidents, a[href="/incidents"], #dc-quick-report',
    fallbackPosition: 'center',
    badge: 'VERIFIED REPORTS',
    icon: AlertTriangle,
    title: 'Field Incidents & Reporting',
    description:
      'Inspect verified citizen reports and submit new field observations (waterlogging, downed power lines, obstructions) to alert your community.',
  },
  {
    id: 'safety',
    targetSelector: '#dc-sidebar-safety, a[href="/safety"]',
    fallbackPosition: 'bottom',
    badge: 'PERSONAL DEFENSE',
    icon: Shield,
    title: 'Safety, Shelters & Contacts',
    description:
      'Access your 3 km perimeter safety assessment, nearest open relief shelter with verified capacity, one-tap emergency helplines, and go-bag checklist.',
  },
  {
    id: 'weathergpt',
    targetSelector: '#dc-sidebar-weathergpt, #dc-weathergpt-floating-btn',
    fallbackPosition: 'bottom-right',
    badge: 'COPILOT ASSISTANT',
    icon: Sparkles,
    title: 'WeatherGPT Intelligence',
    description:
      'Your conversational safety copilot. Available directly from the sidebar or floating button to answer plain-language safety questions.',
  },
  {
    id: 'sos',
    targetSelector: '#dc-sidebar-sos-btn, #dc-desktop-sos-btn, #dc-home-sos-btn, .dc-nav-sos-button, .dc-mobile-sos-btn',
    fallbackPosition: 'bottom',
    badge: 'EMERGENCY ACTION',
    icon: LifeBuoy,
    title: 'Emergency SOS Protocol',
    description:
      'Critical life-safety action. Pinned in the sidebar and home page for rapid distress beacon dispatch and 112 emergency coordination.',
    tip: 'Important: Real SOS triggers emergency workflows. Demonstration steps in this tour are completely safe.',
  },
  {
    id: 'finish',
    targetSelector: '.dc-home-content, main',
    fallbackPosition: 'center',
    badge: 'READY',
    icon: CheckCircle,
    title: 'You Are Ready',
    description:
      'You are all set to explore DisasterChain. You can replay this interactive guide at any time from the navigation menu.',
    actionText: 'Start exploring',
  },
];

export default function OnboardingTour({
  isActive = false,
  onComplete,
  onDismiss,
}) {
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [targetRect, setTargetRect] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ top: 0, left: 0, placement: 'center' });
  const cardRef = useRef(null);

  const step = TOUR_STEPS[currentStepIdx] || TOUR_STEPS[0];
  const isFirstStep = currentStepIdx === 0;
  const isLastStep = currentStepIdx === TOUR_STEPS.length - 1;

  // Reduced motion preference
  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Measure and update target element rect
  const updateTargetRect = useCallback(() => {
    if (!isActive || !step) return;

    if (step.fallbackPosition === 'center' || !step.targetSelector) {
      setTargetRect(null);
      return;
    }

    const selectors = step.targetSelector.split(',').map((s) => s.trim());
    let elem = null;
    for (const sel of selectors) {
      const found = document.querySelector(sel);
      if (found) {
        elem = found;
        break;
      }
    }

    if (elem) {
      // Ensure element is visible
      elem.scrollIntoView({
        behavior: prefersReducedMotion ? 'auto' : 'smooth',
        block: 'nearest',
        inline: 'nearest',
      });

      const rect = elem.getBoundingClientRect();
      setTargetRect({
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
        bottom: rect.bottom,
        right: rect.right,
      });
    } else {
      setTargetRect(null);
    }
  }, [isActive, step, prefersReducedMotion]);

  // Recalculate positions on step change, resize, scroll
  useEffect(() => {
    updateTargetRect();
    const handleResize = () => updateTargetRect();
    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleResize, true);
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleResize, true);
    };
  }, [updateTargetRect, currentStepIdx]);

  // Keyboard navigation: Escape to skip, ArrowRight/Enter to Next, ArrowLeft to Back
  useEffect(() => {
    if (!isActive) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        handleSkip();
      } else if (e.key === 'ArrowRight' || (e.key === 'Enter' && !isLastStep)) {
        if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) return;
        e.preventDefault();
        handleNext();
      } else if (e.key === 'ArrowLeft' && !isFirstStep) {
        e.preventDefault();
        handleBack();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isActive, currentStepIdx, isFirstStep, isLastStep]);

  // Compute optimal tooltip position without viewport clipping
  useEffect(() => {
    if (!isActive) return;

    const viewportW = window.innerWidth;
    const viewportH = window.innerHeight;
    const cardW = Math.min(420, viewportW - 32);
    const cardH = 260; // Estimated height for clamping

    // Mobile fallback: dock smoothly at bottom
    if (viewportW < 640) {
      setTooltipPos({
        top: viewportH - cardH - 24,
        left: (viewportW - cardW) / 2,
        placement: 'bottom-docked',
      });
      return;
    }

    if (!targetRect) {
      // Center position
      setTooltipPos({
        top: Math.max(20, (viewportH - cardH) / 2),
        left: Math.max(16, (viewportW - cardW) / 2),
        placement: 'center',
      });
      return;
    }

    // Try below target
    let top = targetRect.bottom + 16;
    let left = targetRect.left + (targetRect.width - cardW) / 2;
    let placement = 'bottom';

    // If below overflows screen bottom, try above
    if (top + cardH > viewportH - 20) {
      top = targetRect.top - cardH - 16;
      placement = 'top';
    }

    // If above also overflows screen top, fallback to right or center
    if (top < 20) {
      top = Math.max(20, targetRect.top);
      left = targetRect.right + 16;
      placement = 'right';
      if (left + cardW > viewportW - 20) {
        left = targetRect.left - cardW - 16;
        placement = 'left';
      }
    }

    // Clamp horizontally to avoid clipping
    left = Math.max(16, Math.min(left, viewportW - cardW - 16));
    top = Math.max(20, Math.min(top, viewportH - cardH - 20));

    setTooltipPos({ top, left, placement });
  }, [targetRect, isActive, currentStepIdx]);

  const handleNext = () => {
    if (isLastStep) {
      handleComplete();
    } else {
      setCurrentStepIdx((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (!isFirstStep) {
      setCurrentStepIdx((prev) => prev - 1);
    }
  };

  const handleSkip = () => {
    try {
      localStorage.setItem(TOUR_STORAGE_KEY, 'true');
    } catch (e) {}
    if (onDismiss) onDismiss();
  };

  const handleComplete = () => {
    try {
      localStorage.setItem(TOUR_STORAGE_KEY, 'true');
    } catch (e) {}
    if (onComplete) onComplete();
  };

  if (!isActive) return null;

  const StepIcon = step.icon || Compass;

  return (
    <AnimatePresence>
      <div
        className="dc-tour-root"
        role="dialog"
        aria-modal="true"
        aria-label="DisasterChain Interactive Onboarding Guide"
      >
        {/* Soft SVG Backdrop Overlay with Cutout Spotlight */}
        <svg
          className="dc-tour-svg-mask"
          width="100%"
          height="100%"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <mask id="dc-tour-cutout-mask">
              <rect x="0" y="0" width="100%" height="100%" fill="white" />
              {targetRect && (
                <rect
                  x={Math.max(0, targetRect.left - 6)}
                  y={Math.max(0, targetRect.top - 6)}
                  width={targetRect.width + 12}
                  height={targetRect.height + 12}
                  rx="10"
                  ry="10"
                  fill="black"
                />
              )}
            </mask>
          </defs>
          <rect
            x="0"
            y="0"
            width="100%"
            height="100%"
            fill="rgba(14, 20, 18, 0.68)"
            mask="url(#dc-tour-cutout-mask)"
            style={{ pointerEvents: 'auto' }}
            onClick={handleSkip}
          />
        </svg>

        {/* Animated Target Spotlight Focus Ring */}
        {targetRect && (
          <motion.div
            className="dc-tour-spotlight-ring"
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
            style={{
              position: 'fixed',
              top: targetRect.top - 6,
              left: targetRect.left - 6,
              width: targetRect.width + 12,
              height: targetRect.height + 12,
              borderRadius: 12,
              pointerEvents: 'none',
              zIndex: 1999,
            }}
          />
        )}

        {/* Floating Tour Card */}
        <motion.div
          ref={cardRef}
          className="dc-tour-card"
          initial={{ opacity: 0, y: 14, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 14, scale: 0.96 }}
          transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          style={{
            position: 'fixed',
            top: tooltipPos.top,
            left: tooltipPos.left,
            zIndex: 2000,
          }}
        >
          {/* Top Bar: Badge, Step Indicator & Close */}
          <div className="dc-tour-card-header">
            <div className="dc-tour-badge-row">
              <span className="dc-tour-badge">
                <StepIcon size={13} className="dc-tour-badge-icon" />
                <span>{step.badge}</span>
              </span>
              <span className="dc-tour-step-counter">
                Step {currentStepIdx + 1} of {TOUR_STEPS.length}
              </span>
            </div>

            <button
              type="button"
              className="dc-tour-close-btn"
              onClick={handleSkip}
              title="Exit tour (Escape)"
              aria-label="Exit tour"
            >
              <X size={16} />
            </button>
          </div>

          {/* Progress Bar */}
          <div className="dc-tour-progress-track">
            <div
              className="dc-tour-progress-fill"
              style={{
                width: `${((currentStepIdx + 1) / TOUR_STEPS.length) * 100}%`,
              }}
            />
          </div>

          {/* Title & Description */}
          <div className="dc-tour-card-body">
            <h3 className="dc-tour-title">{step.title}</h3>
            <p className="dc-tour-desc">{step.description}</p>
            {step.tip && (
              <div className="dc-tour-tip">
                <span className="dc-tour-tip-dot" />
                <span>{step.tip}</span>
              </div>
            )}
          </div>

          {/* Navigation Controls */}
          <div className="dc-tour-card-footer">
            <button
              type="button"
              className="dc-tour-btn-skip"
              onClick={handleSkip}
            >
              Skip tour
            </button>

            <div className="dc-tour-btn-group">
              {!isFirstStep && (
                <button
                  type="button"
                  className="dc-tour-btn-back"
                  onClick={handleBack}
                  aria-label="Previous step"
                >
                  <ArrowLeft size={15} />
                  <span>Back</span>
                </button>
              )}

              <button
                type="button"
                className="dc-tour-btn-next"
                onClick={handleNext}
                autoFocus
              >
                <span>{step.actionText || (isLastStep ? 'Finish' : 'Next')}</span>
                {!isLastStep && <ArrowRight size={15} />}
                {isLastStep && <CheckCircle size={15} />}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
