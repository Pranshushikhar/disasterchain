import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, VolumeX, ArrowRight, ShieldCheck } from 'lucide-react';
import { useEnvironment } from '../context/EnvironmentContext';

/**
 * DISASTERCHAIN — PHOTOREALISTIC DISASTER FILM CINEMATIC INTRO
 * 
 * Choreographed Single Continuous Shot (Target: ~12-14s)
 * - Scene 1: Calm Earth (~2.5s) — tranquil dawn landscape, atmospheric haze, distant sunlight.
 * - Scene 2: Volcanic Activity (~3s) — caldera silhouette, magma vent glow, volumetric smoke, seismic tremor.
 * - Scene 3: Tsunami (~3s) — deep ocean swell, realistic massive wave, pitching boats, spray & foam.
 * - Scene 4: Coastal Flood (~3s) — inundated streets, reflective water, damaged structures, patrol searchlight.
 * - Scene 5: Intelligence Transition (~3s) — chaotic weather transforms into telemetry, telemetry into DisasterChain.
 */
export default function CinematicIntro({ onEnter, isReplay = false }) {
  const { environment, isSoundEnabled, toggleSound, initAudio } = useEnvironment();
  const canvasRef = useRef(null);
  const animFrameRef = useRef(null);
  const containerRef = useRef(null);

  // Timeline and interaction state
  const [sceneIndex, setSceneIndex] = useState(1); // 1: Calm, 2: Volcano, 3: Tsunami, 4: Flood, 5: Intelligence
  const [isEntering, setIsEntering] = useState(false);
  const progressRef = useRef(null);
  const currentSceneRef = useRef(1);

  // Parallax coordinates from mouse movement
  const mousePosRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });

  // Prefers reduced motion
  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const handleEnterClick = useCallback(() => {
    setIsEntering(true);
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    onEnter();
  }, [onEnter]);

  // Keyboard navigation: Enter or Space triggers entry, Esc skips immediately
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'Escape') {
        e.preventDefault();
        handleEnterClick();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleEnterClick]);

  // Mouse move parallax listener
  useEffect(() => {
    const handleMouseMove = (e) => {
      const nx = (e.clientX / window.innerWidth - 0.5) * 2;
      const ny = (e.clientY / window.innerHeight - 0.5) * 2;
      mousePosRef.current.targetX = nx;
      mousePosRef.current.targetY = ny;
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Main Canvas Rendering Engine
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);
    const isMobile = width < 768;

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Particle pools for smoke, ash, spray, and telemetry data
    const smokeParticles = [];
    const smokeCount = isMobile ? 35 : 75;
    for (let i = 0; i < smokeCount; i++) {
      smokeParticles.push({
        x: width * 0.5 + (Math.random() - 0.5) * 160,
        y: height * 0.7 - Math.random() * 250,
        radius: Math.random() * 35 + 20,
        vy: -(Math.random() * 1.2 + 0.8),
        vx: (Math.random() - 0.4) * 0.8,
        alpha: Math.random() * 0.4 + 0.1,
        growth: Math.random() * 0.15 + 0.08,
      });
    }

    const ashParticles = [];
    const ashCount = isMobile ? 30 : 70;
    for (let i = 0; i < ashCount; i++) {
      ashParticles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 1.5,
        vy: -(Math.random() * 1.8 + 0.5),
        size: Math.random() * 2.5 + 1,
        color: Math.random() > 0.4 ? 'rgba(255, 120, 50,' : 'rgba(180, 160, 150,',
        life: Math.random(),
      });
    }

    const rainStreaks = [];
    const rainCount = isMobile ? 50 : 130;
    for (let i = 0; i < rainCount; i++) {
      rainStreaks.push({
        x: Math.random() * (width + 200),
        y: Math.random() * height,
        vy: Math.random() * 12 + 16,
        vx: -(Math.random() * 3 + 4),
        len: Math.random() * 25 + 18,
        alpha: Math.random() * 0.5 + 0.2,
      });
    }

    const dataBeacons = [];
    const beaconCount = isMobile ? 18 : 36;
    for (let i = 0; i < beaconCount; i++) {
      dataBeacons.push({
        x: (width / beaconCount) * i + Math.random() * 20,
        y: Math.random() * height,
        vy: -(Math.random() * 2.5 + 1.2),
        size: Math.random() * 3 + 1.5,
        alpha: Math.random() * 0.7 + 0.3,
      });
    }

    // Boats on ocean wave (scene 3)
    const boats = [
      { relX: 0.35, length: 28, width: 9, elevation: 0, tilt: 0 },
      { relX: 0.68, length: 22, width: 7, elevation: 0, tilt: 0 },
    ];

    let startTime = performance.now();
    let isVisible = !document.hidden;

    const handleVisibility = () => {
      isVisible = !document.hidden;
    };
    document.addEventListener('visibilitychange', handleVisibility);

    // Smooth render loop for all 5 choreographed scenes
    const render = (now) => {
      if (!isVisible) {
        animFrameRef.current = requestAnimationFrame(render);
        return;
      }

      const elapsedSec = (now - startTime) / 1000;
      if (progressRef.current) {
        progressRef.current.style.width = `${Math.min(100, (elapsedSec / 14.5) * 100)}%`;
      }

      // Smooth mouse parallax interpolation
      mousePosRef.current.x += (mousePosRef.current.targetX - mousePosRef.current.x) * 0.05;
      mousePosRef.current.y += (mousePosRef.current.targetY - mousePosRef.current.y) * 0.05;
      const px = mousePosRef.current.x * 24;
      const py = mousePosRef.current.y * 14;

      ctx.clearRect(0, 0, width, height);

      // =========================================================================
      // TIMELINE ORCHESTRATION (~14.5s Total Duration)
      // 0.0s - 2.8s:  Scene 1 (Calm Earth)
      // 2.8s - 5.8s:  Scene 2 (Volcano)
      // 5.8s - 8.8s:  Scene 3 (Tsunami)
      // 8.8s - 11.8s: Scene 4 (Flood)
      // 11.8s+:       Scene 5 (DisasterChain Intelligence Transition)
      // =========================================================================
      let currentScene = 1;
      if (elapsedSec < 2.8) currentScene = 1;
      else if (elapsedSec < 5.8) currentScene = 2;
      else if (elapsedSec < 8.8) currentScene = 3;
      else if (elapsedSec < 11.8) currentScene = 4;
      else currentScene = 5;

      if (currentScene !== currentSceneRef.current) {
        currentSceneRef.current = currentScene;
        setSceneIndex(currentScene);
      }

      // Camera shake during volcanic eruption (3.8s to 4.8s)
      let shakeX = 0;
      let shakeY = 0;
      if (elapsedSec >= 3.8 && elapsedSec <= 4.8) {
        const shakeDecay = 1 - (elapsedSec - 3.8);
        const freq = elapsedSec * 45;
        shakeX = Math.sin(freq) * 7 * shakeDecay;
        shakeY = Math.cos(freq * 1.3) * 5 * shakeDecay;
      }

      ctx.save();
      ctx.translate(shakeX + px * 0.2, shakeY + py * 0.2);

      // =========================================================================
      // SCENE 01: CALM EARTH (0.0s - 2.8s)
      // =========================================================================
      if (elapsedSec <= 3.2) {
        const scene1Alpha = elapsedSec > 2.6 ? Math.max(0, 1 - (elapsedSec - 2.6) / 0.6) : 1;
        ctx.globalAlpha = scene1Alpha;

        // Sky: Dawn atmospheric twilight gradient
        const skyGrad = ctx.createLinearGradient(0, 0, 0, height);
        skyGrad.addColorStop(0, '#0E1413');
        skyGrad.addColorStop(0.4, '#1A2522');
        skyGrad.addColorStop(0.7, '#2D3E37');
        skyGrad.addColorStop(1, '#3F4D45');
        ctx.fillStyle = skyGrad;
        ctx.fillRect(0, 0, width, height);

        // Distant soft sunbeams breaking through mist
        const sunX = width * 0.55;
        const sunY = height * 0.42;
        const sunGlow = ctx.createRadialGradient(sunX, sunY, 10, sunX, sunY, width * 0.5);
        sunGlow.addColorStop(0, 'rgba(235, 205, 160, 0.22)');
        sunGlow.addColorStop(0.5, 'rgba(180, 170, 145, 0.08)');
        sunGlow.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = sunGlow;
        ctx.fillRect(0, 0, width, height);

        // Layer 1: Distant mountain ridge (hazy)
        ctx.fillStyle = '#1B2623';
        ctx.beginPath();
        ctx.moveTo(0, height);
        for (let x = 0; x <= width; x += 30) {
          const my = height * 0.55 - Math.sin(x * 0.0025 + 1.2) * 60 - Math.cos(x * 0.005) * 30;
          ctx.lineTo(x, my);
        }
        ctx.lineTo(width, height);
        ctx.closePath();
        ctx.fill();

        // Layer 2: Midground tranquil terrain
        ctx.fillStyle = '#141E1C';
        ctx.beginPath();
        ctx.moveTo(0, height);
        for (let x = 0; x <= width; x += 25) {
          const my = height * 0.68 - Math.sin(x * 0.004) * 45 - Math.sin(x * 0.0015) * 20;
          ctx.lineTo(x, my);
        }
        ctx.lineTo(width, height);
        ctx.closePath();
        ctx.fill();

        // Morning atmospheric mist band
        const mistGrad = ctx.createLinearGradient(0, height * 0.52, 0, height * 0.75);
        mistGrad.addColorStop(0, 'rgba(215, 205, 185, 0)');
        mistGrad.addColorStop(0.5, 'rgba(215, 205, 185, 0.12)');
        mistGrad.addColorStop(1, 'rgba(215, 205, 185, 0)');
        ctx.fillStyle = mistGrad;
        ctx.fillRect(0, height * 0.52, width, height * 0.23);
      }

      // =========================================================================
      // SCENE 02: VOLCANIC ACTIVITY (2.6s - 6.2s)
      // =========================================================================
      if (elapsedSec >= 2.6 && elapsedSec <= 6.2) {
        const scene2Alpha =
          elapsedSec < 3.2
            ? (elapsedSec - 2.6) / 0.6
            : elapsedSec > 5.6
            ? Math.max(0, 1 - (elapsedSec - 5.6) / 0.6)
            : 1;

        ctx.globalAlpha = scene2Alpha;

        // Dark volcanic twilight sky with amber glow
        const vSky = ctx.createLinearGradient(0, 0, 0, height);
        vSky.addColorStop(0, '#100C0A');
        vSky.addColorStop(0.5, '#1C130E');
        vSky.addColorStop(0.85, '#351C12');
        vSky.addColorStop(1, '#4A2214');
        ctx.fillStyle = vSky;
        ctx.fillRect(0, 0, width, height);

        // Volcano Mountain Silhouette in Center-Horizon
        const craterX = width * 0.52;
        const craterY = height * 0.54;

        ctx.fillStyle = '#130E0C';
        ctx.beginPath();
        ctx.moveTo(0, height);
        ctx.lineTo(0, height * 0.72);
        ctx.lineTo(craterX - 160, height * 0.64);
        ctx.lineTo(craterX - 45, craterY); // West crater rim
        ctx.lineTo(craterX + 45, craterY); // East crater rim
        ctx.lineTo(craterX + 180, height * 0.65);
        ctx.lineTo(width, height * 0.74);
        ctx.lineTo(width, height);
        ctx.closePath();
        ctx.fill();

        // Molten Caldera Vent Glow
        const ventPulse = Math.sin(elapsedSec * 4) * 0.15 + 0.85;
        const ventGlow = ctx.createRadialGradient(
          craterX,
          craterY + 5,
          5,
          craterX,
          craterY + 5,
          180 * ventPulse
        );
        ventGlow.addColorStop(0, 'rgba(255, 110, 30, 0.9)');
        ventGlow.addColorStop(0.3, 'rgba(235, 60, 20, 0.45)');
        ventGlow.addColorStop(0.7, 'rgba(120, 25, 10, 0.2)');
        ventGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = ventGlow;
        ctx.fillRect(craterX - 200, craterY - 120, 400, 250);

        // Eruption heat burst at ~4.0s
        if (elapsedSec >= 3.8 && elapsedSec <= 4.9) {
          const eruptProgress = (elapsedSec - 3.8) / 1.1;
          const burstAlpha = Math.sin(eruptProgress * Math.PI) * 0.35;
          ctx.fillStyle = `rgba(255, 140, 40, ${burstAlpha})`;
          ctx.fillRect(0, 0, width, height * 0.8);
        }

        // Volumetric Rising Smoke Particles
        smokeParticles.forEach((sp) => {
          sp.y += sp.vy;
          sp.x += sp.vx + Math.sin(elapsedSec + sp.radius) * 0.4;
          sp.radius += sp.growth;

          if (sp.y < height * 0.05 || sp.radius > 90) {
            sp.y = craterY - 5;
            sp.x = craterX + (Math.random() - 0.5) * 50;
            sp.radius = Math.random() * 25 + 15;
          }

          const sGrad = ctx.createRadialGradient(sp.x, sp.y, 0, sp.x, sp.y, sp.radius);
          sGrad.addColorStop(0, `rgba(32, 24, 20, ${sp.alpha * 0.7})`);
          sGrad.addColorStop(0.6, `rgba(45, 30, 25, ${sp.alpha * 0.4})`);
          sGrad.addColorStop(1, 'rgba(15, 10, 8, 0)');
          ctx.fillStyle = sGrad;
          ctx.beginPath();
          ctx.arc(sp.x, sp.y, sp.radius, 0, Math.PI * 2);
          ctx.fill();
        });

        // Drifting Ash Particles
        ashParticles.forEach((ap) => {
          ap.y += ap.vy;
          ap.x += ap.vx;
          if (ap.y < -10) {
            ap.y = height + 10;
            ap.x = Math.random() * width;
          }
          ctx.fillStyle = `${ap.color}${ap.life * 0.75})`;
          ctx.beginPath();
          ctx.arc(ap.x, ap.y, ap.size, 0, Math.PI * 2);
          ctx.fill();
        });
      }

      // =========================================================================
      // SCENE 03: TSUNAMI WAVE FORMATION (5.6s - 9.2s)
      // =========================================================================
      if (elapsedSec >= 5.6 && elapsedSec <= 9.2) {
        const scene3Alpha =
          elapsedSec < 6.2
            ? (elapsedSec - 5.6) / 0.6
            : elapsedSec > 8.6
            ? Math.max(0, 1 - (elapsedSec - 8.6) / 0.6)
            : 1;

        ctx.globalAlpha = scene3Alpha;

        // Dark oceanic storm horizon
        const seaSky = ctx.createLinearGradient(0, 0, 0, height);
        seaSky.addColorStop(0, '#0B1114');
        seaSky.addColorStop(0.5, '#121C22');
        seaSky.addColorStop(0.85, '#1A2930');
        seaSky.addColorStop(1, '#243A44');
        ctx.fillStyle = seaSky;
        ctx.fillRect(0, 0, width, height);

        // Huge Tsunami Swell forming in the distance
        // Tsunami height builds between 6.0s and 8.5s
        const waveProgress = Math.min(1, Math.max(0, (elapsedSec - 5.8) / 2.6));
        const tsunamiCrestY = height * (0.64 - waveProgress * 0.28); // Swell rises from 0.64 down to 0.36
        const waveTime = elapsedSec * 2.2;

        // Wave elevation function for continuous hydraulic motion
        const getWaveY = (xCoord) => {
          const normX = xCoord / width;
          const peakEnvelope = Math.exp(-Math.pow((normX - 0.5) * 2.5, 2));
          const swell = Math.sin(normX * Math.PI * 2 - waveTime) * 35;
          const macroSwell = Math.sin(normX * Math.PI * 4 + waveTime * 0.5) * 15;
          return tsunamiCrestY + (1 - peakEnvelope) * 120 + swell * 0.7 + macroSwell;
        };

        // Draw Deep Ocean Volume
        ctx.beginPath();
        ctx.moveTo(0, height);
        ctx.lineTo(0, getWaveY(0));
        for (let x = 0; x <= width; x += 15) {
          ctx.lineTo(x, getWaveY(x));
        }
        ctx.lineTo(width, height);
        ctx.closePath();

        const seaGrad = ctx.createLinearGradient(0, tsunamiCrestY, 0, height);
        seaGrad.addColorStop(0, '#1E3942');
        seaGrad.addColorStop(0.3, '#14272E');
        seaGrad.addColorStop(0.7, '#0C181D');
        seaGrad.addColorStop(1, '#070D10');
        ctx.fillStyle = seaGrad;
        ctx.fill();

        // Wave Crest Foam Line & Spray
        ctx.strokeStyle = 'rgba(215, 235, 240, 0.65)';
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        for (let x = 0; x <= width; x += 10) {
          const y = getWaveY(x);
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y + Math.sin(x * 0.08 + waveTime * 3) * 3);
        }
        ctx.stroke();

        // Coastal Boats bobbing and tilting naturally on water
        boats.forEach((boat) => {
          const bx = boat.relX * width;
          const by = getWaveY(bx);
          const dy = getWaveY(bx + 10) - getWaveY(bx - 10);
          const angle = Math.atan2(dy, 20); // Tilt follows wave slope

          ctx.save();
          ctx.translate(bx, by - 4);
          ctx.rotate(angle);

          // Boat Hull
          ctx.fillStyle = '#0F1214';
          ctx.beginPath();
          ctx.moveTo(-boat.length * 0.5, 0);
          ctx.lineTo(boat.length * 0.45, 0);
          ctx.lineTo(boat.length * 0.35, boat.width);
          ctx.lineTo(-boat.length * 0.4, boat.width);
          ctx.closePath();
          ctx.fill();

          // Cabin & Mast
          ctx.fillStyle = '#1A2124';
          ctx.fillRect(-boat.length * 0.15, -boat.width * 0.9, boat.length * 0.3, boat.width * 0.9);
          // Small mast light
          ctx.fillStyle = 'rgba(255, 180, 80, 0.85)';
          ctx.beginPath();
          ctx.arc(0, -boat.width * 1.2, 1.8, 0, Math.PI * 2);
          ctx.fill();

          ctx.restore();
        });

        // Atmospheric sea spray mist
        const sprayGrad = ctx.createLinearGradient(0, tsunamiCrestY - 40, 0, tsunamiCrestY + 80);
        sprayGrad.addColorStop(0, 'rgba(210, 235, 245, 0)');
        sprayGrad.addColorStop(0.5, 'rgba(210, 235, 245, 0.22)');
        sprayGrad.addColorStop(1, 'rgba(210, 235, 245, 0)');
        ctx.fillStyle = sprayGrad;
        ctx.fillRect(0, tsunamiCrestY - 40, width, 120);
      }

      // =========================================================================
      // SCENE 04: URBAN COASTAL FLOOD (8.6s - 12.2s)
      // =========================================================================
      if (elapsedSec >= 8.6 && elapsedSec <= 12.2) {
        const scene4Alpha =
          elapsedSec < 9.2
            ? (elapsedSec - 8.6) / 0.6
            : elapsedSec > 11.6
            ? Math.max(0, 1 - (elapsedSec - 11.6) / 0.6)
            : 1;

        ctx.globalAlpha = scene4Alpha;

        // Dark overcast storm sky over city
        const fSky = ctx.createLinearGradient(0, 0, 0, height);
        fSky.addColorStop(0, '#090E11');
        fSky.addColorStop(0.5, '#121A1E');
        fSky.addColorStop(1, '#18242A');
        ctx.fillStyle = fSky;
        ctx.fillRect(0, 0, width, height);

        const waterLineY = height * 0.68;

        // Background Coastal City Silhouettes (Partially Submerged)
        const buildings = [
          { x: 0.12, w: 0.08, h: 0.28 },
          { x: 0.22, w: 0.11, h: 0.38 }, // Damaged tilted roofline
          { x: 0.36, w: 0.09, h: 0.22 },
          { x: 0.58, w: 0.13, h: 0.34 },
          { x: 0.74, w: 0.09, h: 0.26 },
          { x: 0.85, w: 0.10, h: 0.31 },
        ];

        buildings.forEach((b) => {
          const bx = b.x * width;
          const bw = b.w * width;
          const bh = b.h * height;
          const topY = waterLineY - bh;

          ctx.fillStyle = '#0D1418';
          ctx.fillRect(bx, topY, bw, bh + 30);

          // Submerged reflections into water
          const refGrad = ctx.createLinearGradient(0, waterLineY, 0, waterLineY + bh * 0.6);
          refGrad.addColorStop(0, 'rgba(13, 20, 24, 0.45)');
          refGrad.addColorStop(1, 'rgba(13, 20, 24, 0)');
          ctx.fillStyle = refGrad;
          ctx.fillRect(bx, waterLineY, bw, bh * 0.6);
        });

        // Rising Reflective Floodwater Surface
        const floodGrad = ctx.createLinearGradient(0, waterLineY, 0, height);
        floodGrad.addColorStop(0, '#1A2930');
        floodGrad.addColorStop(0.4, '#131F25');
        floodGrad.addColorStop(1, '#0B1317');
        ctx.fillStyle = floodGrad;
        ctx.fillRect(0, waterLineY, width, height - waterLineY);

        // Water specular ripples
        ctx.strokeStyle = 'rgba(160, 200, 215, 0.28)';
        ctx.lineWidth = 1.2;
        for (let i = 0; i < 9; i++) {
          const ry = waterLineY + i * 28 + Math.sin(elapsedSec * 2 + i) * 3;
          ctx.beginPath();
          ctx.moveTo(0, ry);
          for (let x = 0; x <= width; x += 30) {
            ctx.lineTo(x, ry + Math.sin(x * 0.015 + elapsedSec * 2.5) * 2.5);
          }
          ctx.stroke();
        }

        // Search & Rescue Patrol Boat with Spotlight
        const patrolX = width * 0.42 + Math.sin(elapsedSec * 0.8) * 60;
        const patrolY = waterLineY + 12;

        // Spotlight Beam cutting through misty rain
        const spotAngle = Math.PI * 0.25 + Math.sin(elapsedSec * 1.5) * 0.2;
        ctx.save();
        ctx.translate(patrolX + 10, patrolY - 14);
        const spotGrad = ctx.createRadialGradient(0, 0, 5, 120, 100, 240);
        spotGrad.addColorStop(0, 'rgba(255, 245, 210, 0.55)');
        spotGrad.addColorStop(0.4, 'rgba(240, 230, 190, 0.2)');
        spotGrad.addColorStop(1, 'rgba(240, 230, 190, 0)');
        ctx.fillStyle = spotGrad;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(Math.cos(spotAngle - 0.25) * 320, Math.sin(spotAngle - 0.25) * 320);
        ctx.lineTo(Math.cos(spotAngle + 0.25) * 320, Math.sin(spotAngle + 0.25) * 320);
        ctx.closePath();
        ctx.fill();
        ctx.restore();

        // Patrol Boat Hull
        ctx.fillStyle = '#0A0E11';
        ctx.fillRect(patrolX - 24, patrolY - 8, 48, 14);
        ctx.fillStyle = '#C94B4B'; // Safety Red stripe
        ctx.fillRect(patrolX - 24, patrolY - 6, 48, 3);

        // Torrential Rainfall Streaks
        ctx.lineWidth = 1.2;
        rainStreaks.forEach((r) => {
          r.y += r.vy;
          r.x += r.vx;
          if (r.y > height) {
            r.y = -20;
            r.x = Math.random() * (width + 200);
          }
          ctx.strokeStyle = `rgba(180, 210, 225, ${r.alpha * 0.6})`;
          ctx.beginPath();
          ctx.moveTo(r.x, r.y);
          ctx.lineTo(r.x + r.vx * 1.5, r.y + r.len);
          ctx.stroke();
        });
      }

      // =========================================================================
      // SCENE 05: DISASTERCHAIN INTELLIGENCE TRANSITION (11.6s+)
      // =========================================================================
      if (elapsedSec >= 11.6) {
        const scene5Progress = Math.min(1, (elapsedSec - 11.6) / 1.4);
        ctx.globalAlpha = scene5Progress;

        // Deep Mission Control Dark Earth Backdrop
        const mSky = ctx.createLinearGradient(0, 0, 0, height);
        mSky.addColorStop(0, '#0A0F0E');
        mSky.addColorStop(0.5, '#121A18');
        mSky.addColorStop(1, '#1A2522');
        ctx.fillStyle = mSky;
        ctx.fillRect(0, 0, width, height);

        // Organizing Data Beacons & Geographic Telemetry Lines
        const centerX = width * 0.5;
        const centerY = height * 0.52;

        // Concentric Radar Range Rings
        const ringCount = 4;
        ctx.lineWidth = 1;
        for (let r = 1; r <= ringCount; r++) {
          const radius = (width * 0.15) * r * scene5Progress;
          ctx.strokeStyle = `rgba(93, 137, 144, ${0.18 - r * 0.03})`;
          ctx.beginPath();
          ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
          ctx.stroke();
        }

        // Bathymetric Coordinate Grid Lines
        ctx.strokeStyle = 'rgba(73, 107, 90, 0.14)';
        ctx.beginPath();
        ctx.moveTo(centerX - width * 0.45, centerY);
        ctx.lineTo(centerX + width * 0.45, centerY);
        ctx.moveTo(centerX, centerY - height * 0.4);
        ctx.lineTo(centerX, centerY + height * 0.4);
        ctx.stroke();

        // Vertical Telemetry Particles rising into data vectors
        dataBeacons.forEach((db) => {
          db.y += db.vy;
          if (db.y < 0) {
            db.y = height;
            db.x = Math.random() * width;
          }
          ctx.fillStyle = `rgba(216, 185, 138, ${db.alpha * 0.6})`;
          ctx.beginPath();
          ctx.arc(db.x, db.y, db.size, 0, Math.PI * 2);
          ctx.fill();

          // Subtle coordinate trail
          ctx.strokeStyle = `rgba(93, 137, 144, ${db.alpha * 0.25})`;
          ctx.beginPath();
          ctx.moveTo(db.x, db.y);
          ctx.lineTo(db.x, db.y + 16);
          ctx.stroke();
        });
      }

      ctx.restore();

      // Vignette border
      const vignette = ctx.createRadialGradient(
        width * 0.5,
        height * 0.5,
        Math.min(width, height) * 0.35,
        width * 0.5,
        height * 0.5,
        Math.max(width, height) * 0.75
      );
      vignette.addColorStop(0, 'rgba(0,0,0,0)');
      vignette.addColorStop(0.7, 'rgba(10, 16, 14, 0.45)');
      vignette.addColorStop(1, 'rgba(8, 12, 11, 0.92)');
      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, width, height);

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', handleVisibility);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [prefersReducedMotion]);

  // Audio start trigger on first user interaction if enabled
  const handleSoundToggle = (e) => {
    e.stopPropagation();
    initAudio();
    toggleSound();
  };

  return (
    <AnimatePresence>
      <motion.div
        ref={containerRef}
        className="dc-cinematic-intro-wrapper"
        initial={{ opacity: 1 }}
        animate={{
          opacity: isEntering ? 0 : 1,
          scale: isEntering ? 1.04 : 1,
        }}
        transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 99999,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0A0F0E',
          color: '#F1EBDD',
          overflow: 'hidden',
          fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif",
          cursor: isEntering ? 'wait' : 'default',
        }}
      >
        {/* Fullscreen Master Cinematic Canvas */}
        <canvas
          ref={canvasRef}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            display: 'block',
          }}
        />

        {/* Top Floating Controls: Ambient Audio Toggle & Direct Skip */}
        <div
          style={{
            position: 'absolute',
            top: 'calc(20px + env(safe-area-inset-top, 0px))',
            left: 0,
            right: 0,
            padding: '0 28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            zIndex: 30,
            pointerEvents: 'auto',
          }}
        >
          {/* Audio Synthesizer Toggle */}
          <button
            type="button"
            onClick={handleSoundToggle}
            aria-label={isSoundEnabled ? 'Mute ambient sound' : 'Enable ambient sound'}
            title={isSoundEnabled ? 'Ambient Sound: ON' : 'Ambient Sound: OFF (Click to enable)'}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: 'rgba(20, 28, 25, 0.65)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: 999,
              padding: '7px 14px',
              color: '#F1EBDD',
              fontSize: '0.74rem',
              fontWeight: 600,
              cursor: 'pointer',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              transition: 'all 0.2s ease',
            }}
          >
            {isSoundEnabled ? (
              <Volume2 size={15} color="#D8B98A" />
            ) : (
              <VolumeX size={15} color="#8C938E" />
            )}
            <span style={{ color: isSoundEnabled ? '#D8B98A' : '#8C938E' }}>
              {isSoundEnabled ? 'ATMOSPHERE ON' : 'AUDIO OFF'}
            </span>
          </button>

          {/* Quick Direct Access */}
          <button
            className="dc-cinematic-skip-btn"
            type="button"
            onClick={handleEnterClick}
            style={{
              background: 'rgba(20, 28, 25, 0.65)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: 999,
              padding: '7px 16px',
              color: '#D8B98A',
              fontSize: '0.76rem',
              fontWeight: 600,
              cursor: 'pointer',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(38, 55, 48, 0.8)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(20, 28, 25, 0.65)';
            }}
          >
            Direct to Hub (Skip)
          </button>
        </div>

        {/* Central Overlay Typography Container */}
        <div
          style={{
            position: 'relative',
            zIndex: 20,
            maxWidth: 820,
            textAlign: 'center',
            padding: '0 24px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            pointerEvents: 'none',
          }}
        >
          {/* Scene 1 & 2 Opening Brand Accent */}
          {sceneIndex <= 2 && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.1 }}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 12,
              }}
            >
              <div
                style={{
                  fontSize: '0.75rem',
                  letterSpacing: '0.3em',
                  textTransform: 'uppercase',
                  color: '#D8B98A',
                  fontWeight: 600,
                }}
              >
                EARTH INTELLIGENCE
              </div>
              <h2
                style={{
                  fontSize: 'clamp(2.4rem, 6vw, 4.4rem)',
                  fontWeight: 800,
                  letterSpacing: '-0.03em',
                  color: '#FFFDF8',
                  margin: 0,
                  textShadow: '0 4px 30px rgba(0,0,0,0.6)',
                }}
              >
                DISASTER<span style={{ color: '#D8B98A' }}>CHAIN</span>
              </h2>
            </motion.div>
          )}

          {/* Scene 3 & 4 Real-time Planetary Intelligence Subtitles */}
          {(sceneIndex === 3 || sceneIndex === 4) && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
              style={{
                maxWidth: 620,
                padding: '14px 24px',
                borderRadius: 16,
                backgroundColor: 'rgba(10, 16, 14, 0.65)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
              }}
            >
              <div
                style={{
                  fontSize: '0.72rem',
                  letterSpacing: '0.22em',
                  textTransform: 'uppercase',
                  color: sceneIndex === 3 ? '#5D8990' : '#C94B4B',
                  fontWeight: 700,
                  marginBottom: 6,
                }}
              >
                {sceneIndex === 3 ? 'OCEANIC VOLUMETRIC SWELL' : 'URBAN PRECIPITATION FLOODING'}
              </div>
              <div
                style={{
                  fontSize: 'clamp(0.92rem, 1.8vw, 1.15rem)',
                  color: '#E7DECD',
                  lineHeight: 1.45,
                  fontWeight: 400,
                }}
              >
                Earth is connected. Risk evolves before impact.
              </div>
            </motion.div>
          )}

          {/* Scene 5 Master Command Hub Transition & Elegant ENTER Button */}
          {sceneIndex === 5 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 20,
                pointerEvents: 'auto',
              }}
            >
              {/* Category Pill */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '5px 14px',
                  borderRadius: 999,
                  backgroundColor: 'rgba(73, 107, 90, 0.25)',
                  border: '1px solid rgba(93, 137, 144, 0.35)',
                  fontSize: '0.75rem',
                  letterSpacing: '0.2em',
                  textTransform: 'uppercase',
                  color: '#D8B98A',
                  fontWeight: 700,
                }}
              >
                <ShieldCheck size={14} color="#5D8990" />
                <span>EARTH INTELLIGENCE PLATFORM</span>
              </div>

              {/* Title Wordmark */}
              <h1
                style={{
                  fontSize: 'clamp(2.8rem, 7.5vw, 5.4rem)',
                  fontWeight: 800,
                  letterSpacing: '-0.04em',
                  lineHeight: 1.02,
                  color: '#FFFDF8',
                  margin: '0 0 4px 0',
                  textShadow: '0 8px 40px rgba(0,0,0,0.7)',
                }}
              >
                DISASTER<span style={{ color: '#D8B98A' }}>CHAIN</span>
              </h1>

              {/* Tagline */}
              <p
                style={{
                  fontSize: 'clamp(1.05rem, 2.2vw, 1.35rem)',
                  color: '#E7DECD',
                  fontWeight: 400,
                  lineHeight: 1.5,
                  maxWidth: 580,
                  margin: '0 0 16px 0',
                }}
              >
                Understand risk.
                <br />
                <span style={{ color: '#FFFDF8', fontWeight: 600 }}>
                  Act before it becomes an emergency.
                </span>
              </p>

              {/* Tactile Physical ENTER Button */}
              <button
                id="enter-disasterchain-btn"
                className="dc-cinematic-enter-btn"
                type="button"
                onClick={handleEnterClick}
                disabled={isEntering}
                style={{
                  cursor: isEntering ? 'wait' : 'pointer',
                  background: 'linear-gradient(135deg, #FFFDF8 0%, #E7DECD 100%)',
                  color: '#1E2725',
                  border: 'none',
                  padding: '16px 40px',
                  borderRadius: 999,
                  fontSize: '1.05rem',
                  fontWeight: 700,
                  letterSpacing: '-0.01em',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  boxShadow:
                    '0 14px 40px -8px rgba(0, 0, 0, 0.55), 0 0 0 1px rgba(255, 255, 255, 0.4)',
                  transition: 'all 0.25s ease',
                  transform: isEntering ? 'scale(0.96)' : 'none',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
                  e.currentTarget.style.boxShadow =
                    '0 18px 46px -6px rgba(216, 185, 138, 0.45)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0) scale(1)';
                  e.currentTarget.style.boxShadow =
                    '0 14px 40px -8px rgba(0, 0, 0, 0.55)';
                }}
              >
                <span>ENTER DISASTERCHAIN</span>
                <ArrowRight size={18} />
              </button>
            </motion.div>
          )}
        </div>

        {/* Bottom Atmospheric Timeline Indicator (5 Stages of Earth Dynamics) */}
        <div
          style={{
            position: 'absolute',
            bottom: 'calc(24px + env(safe-area-inset-bottom, 0px))',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 10,
            zIndex: 30,
            pointerEvents: 'none',
          }}
        >
          {/* Subtle Progress Track */}
          <div
            style={{
              width: 220,
              height: 2,
              backgroundColor: 'rgba(255, 255, 255, 0.14)',
              borderRadius: 2,
              overflow: 'hidden',
            }}
          >
            <div
              ref={progressRef}
              style={{
                width: '0%',
                height: '100%',
                backgroundColor: '#D8B98A',
                transition: 'width 0.1s linear',
              }}
            />
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              fontSize: '0.68rem',
              color: '#8C938E',
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              fontWeight: 600,
            }}
          >
            <span style={{ color: sceneIndex === 1 ? '#D8B98A' : '#8C938E' }}>Calm</span>
            <span>·</span>
            <span style={{ color: sceneIndex === 2 ? '#D8B98A' : '#8C938E' }}>Volcano</span>
            <span>·</span>
            <span style={{ color: sceneIndex === 3 ? '#5D8990' : '#8C938E' }}>Tsunami</span>
            <span>·</span>
            <span style={{ color: sceneIndex === 4 ? '#C94B4B' : '#8C938E' }}>Flood</span>
            <span>·</span>
            <span style={{ color: sceneIndex === 5 ? '#FFFDF8' : '#8C938E' }}>Intelligence</span>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
