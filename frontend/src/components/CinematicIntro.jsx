import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * DISASTERCHAIN — CINEMATIC FIRST-OPEN EXPERIENCE
 * Duration: ~4-7s (user can press ENTER at any time).
 * Atmosphere: Quiet, warm dark-earth mist, abstract fluid/environmental wave motion,
 * sophisticated earth intelligence typography, seamless morph into main app.
 */
export default function CinematicIntro({ onEnter, isReplay = false }) {
  const canvasRef = useRef(null);
  const [phase, setPhase] = useState(0); // 0: atmospheric surface, 1: wave flow, 2: typography, 3: ready to enter
  const [isEntering, setIsEntering] = useState(false);
  const animFrameRef = useRef(null);

  // Check prefers-reduced-motion
  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const handleEnterClick = React.useCallback(() => {
    setIsEntering((prev) => {
      if (prev) return prev;
      // Smoothly animate out into main application
      setTimeout(() => {
        onEnter();
      }, 600);
      return true;
    });
  }, [onEnter]);

  useEffect(() => {
    if (prefersReducedMotion) {
      setPhase(3);
      const tAutoReduced = setTimeout(() => {
        handleEnterClick();
      }, 1200);
      return () => clearTimeout(tAutoReduced);
    }

    const t1 = setTimeout(() => setPhase(1), 900);
    const t2 = setTimeout(() => setPhase(2), 2200);
    const t3 = setTimeout(() => setPhase(3), 3600);
    // Automatic transition after full cinematic experience (~6.8s) so user is never trapped
    const tAuto = setTimeout(() => {
      handleEnterClick();
    }, 6800);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(tAuto);
    };
  }, [prefersReducedMotion, handleEnterClick]);

  // Abstract environmental wave canvas (silky, soundless, water / terrain / mist)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    let t = 0;
    const render = () => {
      t += 0.008;
      ctx.clearRect(0, 0, width, height);

      // Deep atmospheric gradient
      const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
      bgGrad.addColorStop(0, '#151C1A');
      bgGrad.addColorStop(0.5, '#1B2724');
      bgGrad.addColorStop(1, '#22332D');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Subtle atmospheric mist layers
      const horizonY = height * 0.58;

      // Layer 1: Distant terrain / water contour
      ctx.beginPath();
      ctx.moveTo(0, height);
      for (let x = 0; x <= width; x += 15) {
        const y =
          horizonY -
          Math.sin(x * 0.003 + t * 0.6) * 35 -
          Math.cos(x * 0.007 - t * 0.4) * 20;
        ctx.lineTo(x, y);
      }
      ctx.lineTo(width, height);
      ctx.closePath();
      const waveGrad1 = ctx.createLinearGradient(0, horizonY - 60, 0, height);
      waveGrad1.addColorStop(0, 'rgba(93, 137, 144, 0.28)'); // Water / cyan mist
      waveGrad1.addColorStop(0.6, 'rgba(46, 75, 64, 0.4)');
      waveGrad1.addColorStop(1, 'rgba(21, 28, 26, 0.9)');
      ctx.fillStyle = waveGrad1;
      ctx.fill();

      // Layer 2: Subtle flowing swell (wave / seismic energy)
      ctx.beginPath();
      ctx.moveTo(0, height);
      for (let x = 0; x <= width; x += 10) {
        const y =
          horizonY +
          25 +
          Math.sin(x * 0.0045 - t * 1.1) * 28 +
          Math.sin(x * 0.0018 + t * 0.8) * 15;
        ctx.lineTo(x, y);
      }
      ctx.lineTo(width, height);
      ctx.closePath();
      const waveGrad2 = ctx.createLinearGradient(0, horizonY, 0, height);
      waveGrad2.addColorStop(0, 'rgba(216, 185, 138, 0.22)'); // Warm sand / earth crest
      waveGrad2.addColorStop(0.5, 'rgba(73, 107, 90, 0.35)'); // Earth green
      waveGrad2.addColorStop(1, 'rgba(18, 24, 22, 0.95)');
      ctx.fillStyle = waveGrad2;
      ctx.fill();

      // Layer 3: Soft ambient mist particles
      ctx.fillStyle = 'rgba(241, 235, 221, 0.12)';
      for (let i = 0; i < 28; i++) {
        const px = ((i * 137.5 + t * 25) % width);
        const py = (horizonY - 120 + Math.sin(t + i) * 60 + (i % 5) * 30);
        const radius = (i % 3) + 1.2;
        ctx.beginPath();
        ctx.arc(px, py, radius, 0, Math.PI * 2);
        ctx.fill();
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  return (
    <AnimatePresence>
      <motion.div
        className="dc-cinematic-intro-wrapper"
        initial={{ opacity: 1 }}
        animate={{ opacity: isEntering ? 0 : 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 99999,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#151C1A',
          color: '#F1EBDD',
          overflow: 'hidden',
          fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif",
        }}
      >
        {/* Environmental Motion Canvas */}
        <canvas
          ref={canvasRef}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
          }}
        />

        {/* Soft Radial Vignette */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'radial-gradient(circle at 50% 45%, transparent 20%, rgba(17, 24, 22, 0.7) 80%, rgba(12, 17, 15, 0.95) 100%)',
            pointerEvents: 'none',
          }}
        />

        {/* Cinematic Content Container */}
        <div
          style={{
            position: 'relative',
            zIndex: 10,
            maxWidth: 720,
            textAlign: 'center',
            padding: '0 24px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          {/* Subtle Category Badge */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: phase >= 1 ? 0.8 : 0, y: phase >= 1 ? 0 : 15 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            style={{
              fontSize: '0.78rem',
              letterSpacing: '0.28em',
              textTransform: 'uppercase',
              color: '#D8B98A', // Sand
              fontWeight: 600,
              marginBottom: 16,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                backgroundColor: '#5D8990',
                display: 'inline-block',
                boxShadow: '0 0 10px #5D8990',
              }}
            />
            EARTH INTELLIGENCE PLATFORM
          </motion.div>

          {/* Main Wordmark: DISASTERCHAIN */}
          <motion.h1
            initial={{ opacity: 0, scale: 0.96, y: 20 }}
            animate={{
              opacity: phase >= 1 ? 1 : 0,
              scale: isEntering ? 1.05 : 1,
              y: isEntering ? -30 : phase >= 1 ? 0 : 20,
            }}
            transition={{
              duration: isEntering ? 0.6 : 1.1,
              ease: [0.22, 1, 0.36, 1],
            }}
            style={{
              fontSize: 'clamp(2.8rem, 7vw, 5.2rem)',
              fontWeight: 800,
              letterSpacing: '-0.035em',
              lineHeight: 1.02,
              color: '#FFFDF8',
              margin: '0 0 16px 0',
              textShadow: '0 4px 30px rgba(0,0,0,0.5)',
            }}
          >
            DISASTER<span style={{ color: '#D8B98A' }}>CHAIN</span>
          </motion.h1>

          {/* Core Philosophy Tagline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: phase >= 2 ? 0.92 : 0, y: phase >= 2 ? 0 : 20 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            style={{
              fontSize: 'clamp(1.05rem, 2.2vw, 1.35rem)',
              color: '#E7DECD',
              fontWeight: 400,
              lineHeight: 1.5,
              maxWidth: 540,
              margin: '0 0 36px 0',
            }}
          >
            Understand risk.
            <br />
            <span style={{ color: '#F1EBDD', fontWeight: 500 }}>
              Act before it becomes an emergency.
            </span>
          </motion.p>

          {/* Action Area: ENTER DISASTERCHAIN button */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: phase >= 3 ? 1 : 0, y: phase >= 3 ? 0 : 15 }}
            transition={{ duration: 0.6 }}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 16,
            }}
          >
            <button
              id="enter-disasterchain-btn"
              onClick={handleEnterClick}
              disabled={isEntering}
              style={{
                cursor: 'pointer',
                background: 'linear-gradient(135deg, #FFFDF8 0%, #E7DECD 100%)',
                color: '#1E2725',
                border: 'none',
                padding: '16px 36px',
                borderRadius: '999px',
                fontSize: '1.05rem',
                fontWeight: 700,
                letterSpacing: '-0.01em',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                boxShadow:
                  '0 12px 35px -8px rgba(0, 0, 0, 0.45), 0 0 0 1px rgba(255, 255, 255, 0.3)',
                transition: 'all 0.25s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
                e.currentTarget.style.boxShadow =
                  '0 16px 40px -6px rgba(216, 185, 138, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.boxShadow =
                  '0 12px 35px -8px rgba(0, 0, 0, 0.45)';
              }}
            >
              <span>ENTER DISASTERCHAIN</span>
              <span style={{ fontSize: '1.25rem', transition: 'transform 0.2s' }}>
                →
              </span>
            </button>

            {/* Subtle quick skip text */}
            <button
              onClick={handleEnterClick}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#8C938E',
                fontSize: '0.82rem',
                letterSpacing: '0.04em',
                cursor: 'pointer',
                padding: '4px 12px',
                transition: 'color 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#F1EBDD')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#8C938E')}
            >
              Direct to Hub (Skip Intro)
            </button>
          </motion.div>
        </div>

        {/* Bottom subtle ambient indicator */}
        <div
          style={{
            position: 'absolute',
            bottom: 24,
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            fontSize: '0.74rem',
            color: '#65706B',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
          }}
        >
          <span>EARTH</span>
          <span>·</span>
          <span>RISK</span>
          <span>·</span>
          <span>INTELLIGENCE</span>
          <span>·</span>
          <span>RESPONSE</span>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
