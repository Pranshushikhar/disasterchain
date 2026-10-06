import React, { useEffect, useRef } from 'react';
import { useEnvironment } from '../context/EnvironmentContext';

/**
 * LIVING ENVIRONMENT ATMOSPHERIC RENDERER
 * 
 * Non-intrusive full-viewport atmospheric simulation that sits behind the UI.
 * Simulates real weather dynamics (Rain, Storm, Snow, Fog, Night, Calm Earth)
 * with depth layering, smooth transitions, mobile optimization, and zero CPU waste.
 */
export default function LivingEnvironment() {
  const { environment, isTransitioning } = useEnvironment();
  const canvasRef = useRef(null);
  const animFrameRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);
    const isMobile = width < 768;

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Particle pools
    const maxParticles = isMobile ? 40 : 120;
    const particles = [];
    for (let i = 0; i < maxParticles; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: Math.random() * 2 + 1,
        size: Math.random() * 2 + 0.8,
        layer: Math.floor(Math.random() * 3), // 0: background, 1: midground, 2: foreground
        alpha: Math.random() * 0.6 + 0.2,
        swayOffset: Math.random() * Math.PI * 2,
        life: Math.random(),
      });
    }

    // Condensation water beads for rain/storm (sliding down window)
    const droplets = [];
    const dropletCount = isMobile ? 6 : 14;
    for (let i = 0; i < dropletCount; i++) {
      droplets.push({
        x: Math.random() * width,
        y: Math.random() * height,
        r: Math.random() * 2.5 + 1.2,
        vy: Math.random() * 0.35 + 0.1,
        trail: [],
        alpha: Math.random() * 0.35 + 0.15,
      });
    }

    // Storm lightning state
    let lightningState = {
      active: false,
      flashAlpha: 0,
      nextFlashTime: performance.now() + 8000 + Math.random() * 10000,
    };

    let lastTime = performance.now();
    let isVisible = !document.hidden;

    const handleVisibilityChange = () => {
      isVisible = !document.hidden;
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    const render = (now) => {
      if (!isVisible) {
        animFrameRef.current = requestAnimationFrame(render);
        return;
      }

      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      ctx.clearRect(0, 0, width, height);

      // If user prefers reduced motion, draw subtle static ambient tint only
      if (prefersReducedMotion) {
        animFrameRef.current = requestAnimationFrame(render);
        return;
      }

      // =====================================================================
      // 1. RAIN & STORM SIMULATION
      // =====================================================================
      if (environment === 'rain' || environment === 'storm') {
        const isStorm = environment === 'storm';
        const windX = isStorm ? -2.2 : -0.8;
        const speedMult = isStorm ? 1.6 : 1.1;

        // Draw Rain Streaks by Depth Layer
        ctx.lineWidth = 1;
        particles.forEach((p) => {
          p.x += (p.vx + windX) * (1 + p.layer * 0.5) * speedMult;
          p.y += (p.vy * 8 + 8) * (1 + p.layer * 0.6) * speedMult;

          if (p.y > height) {
            p.y = -20;
            p.x = Math.random() * (width + 200);
          }
          if (p.x < -50) {
            p.x = width + 50;
          }

          const streakLen = (12 + p.layer * 14) * (isStorm ? 1.4 : 1.0);
          const alpha = (0.12 + p.layer * 0.15) * (isStorm ? 0.85 : 0.75);

          ctx.strokeStyle = isStorm
            ? `rgba(180, 205, 225, ${alpha})`
            : `rgba(125, 165, 180, ${alpha})`;

          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x + windX * 2, p.y + streakLen);
          ctx.stroke();
        });

        // Soft Foreground Screen Condensation Droplets (Water on screen glass)
        droplets.forEach((d) => {
          d.y += d.vy * (isStorm ? 1.4 : 1.0);
          if (d.y > height + 10) {
            d.y = -10;
            d.x = Math.random() * width;
          }

          ctx.fillStyle = `rgba(160, 190, 205, ${d.alpha * 0.35})`;
          ctx.beginPath();
          ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
          ctx.fill();

          // Droplet highlight
          ctx.fillStyle = `rgba(255, 255, 255, ${d.alpha * 0.5})`;
          ctx.beginPath();
          ctx.arc(d.x - d.r * 0.3, d.y - d.r * 0.3, d.r * 0.35, 0, Math.PI * 2);
          ctx.fill();
        });

        // Distant Horizon Lightning for Storm (Rare, realistic soft atmospheric glow)
        if (isStorm) {
          if (now > lightningState.nextFlashTime) {
            lightningState.active = true;
            lightningState.flashAlpha = 0.22;
            lightningState.nextFlashTime = now + 12000 + Math.random() * 14000;
          }

          if (lightningState.active) {
            lightningState.flashAlpha -= dt * 0.8;
            if (lightningState.flashAlpha <= 0) {
              lightningState.flashAlpha = 0;
              lightningState.active = false;
            } else {
              // Soft atmospheric sky flash
              const skyFlash = ctx.createLinearGradient(0, 0, 0, height * 0.6);
              skyFlash.addColorStop(0, `rgba(210, 230, 255, ${lightningState.flashAlpha * 0.35})`);
              skyFlash.addColorStop(1, 'rgba(210, 230, 255, 0)');
              ctx.fillStyle = skyFlash;
              ctx.fillRect(0, 0, width, height * 0.6);
            }
          }
        }
      }

      // =====================================================================
      // 2. SNOW SIMULATION
      // =====================================================================
      else if (environment === 'snow') {
        particles.forEach((p, idx) => {
          p.swayOffset += dt * 1.5;
          const sway = Math.sin(p.swayOffset) * (0.8 + p.layer * 0.5);
          p.x += p.vx + sway + 0.3; // Slight easterly drift
          p.y += (p.vy * 0.8 + 0.6) * (0.8 + p.layer * 0.6);

          if (p.y > height + 10) {
            p.y = -10;
            p.x = Math.random() * width;
          }
          if (p.x > width + 10) p.x = -10;
          if (p.x < -10) p.x = width + 10;

          const radius = p.size * (0.8 + p.layer * 0.7);
          const alpha = 0.2 + p.layer * 0.25;

          // Foreground soft bokeh snowflakes
          if (p.layer === 2 && idx % 4 === 0) {
            const radGrad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, radius * 2.2);
            radGrad.addColorStop(0, `rgba(240, 248, 255, ${alpha * 0.6})`);
            radGrad.addColorStop(1, 'rgba(240, 248, 255, 0)');
            ctx.fillStyle = radGrad;
            ctx.beginPath();
            ctx.arc(p.x, p.y, radius * 2.2, 0, Math.PI * 2);
            ctx.fill();
          } else {
            ctx.fillStyle = `rgba(235, 245, 255, ${alpha})`;
            ctx.beginPath();
            ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
            ctx.fill();
          }
        });
      }

      // =====================================================================
      // 3. FOG SIMULATION (Volumetric Mist Bands)
      // =====================================================================
      else if (environment === 'fog') {
        const timeSec = now * 0.0003;
        const fogBands = 3;
        for (let i = 0; i < fogBands; i++) {
          const yPos = (height * 0.25 * (i + 1)) + Math.sin(timeSec + i) * 30;
          const bandHeight = height * 0.35;
          const driftX = (timeSec * 40 * (i + 1)) % width;

          const fogGrad = ctx.createLinearGradient(0, yPos - bandHeight * 0.5, 0, yPos + bandHeight * 0.5);
          fogGrad.addColorStop(0, 'rgba(230, 226, 218, 0)');
          fogGrad.addColorStop(0.5, `rgba(235, 230, 222, ${0.12 + i * 0.04})`);
          fogGrad.addColorStop(1, 'rgba(230, 226, 218, 0)');

          ctx.fillStyle = fogGrad;
          ctx.fillRect(0, yPos - bandHeight * 0.5, width, bandHeight);
        }
      }

      // =====================================================================
      // 4. NIGHT SIMULATION (Twinkling Atmospheric Stars)
      // =====================================================================
      else if (environment === 'night') {
        const count = isMobile ? 35 : 75;
        for (let i = 0; i < count; i++) {
          const p = particles[i];
          const twinkle = Math.sin(now * 0.002 + p.swayOffset) * 0.4 + 0.6;
          const alpha = p.alpha * twinkle * 0.5;

          ctx.fillStyle = `rgba(215, 230, 250, ${alpha})`;
          ctx.beginPath();
          ctx.arc(p.x, (p.y % (height * 0.7)), p.size * 0.7, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // =====================================================================
      // 5. CALM EARTH (Sunlight Dust Motes)
      // =====================================================================
      else {
        // Calm environment: very subtle golden dust motes drifting in sunlight
        const count = isMobile ? 18 : 36;
        for (let i = 0; i < count; i++) {
          const p = particles[i];
          p.x += Math.sin(now * 0.0008 + p.swayOffset) * 0.2;
          p.y += (p.vy * 0.15) - 0.05; // Gentle float upwards/downwards

          if (p.y < -10) p.y = height + 10;
          if (p.y > height + 10) p.y = -10;

          const alpha = (Math.sin(now * 0.001 + p.swayOffset) * 0.2 + 0.3) * 0.35;
          ctx.fillStyle = `rgba(216, 185, 138, ${alpha})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 0.8, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [environment]);

  return (
    <div
      className={`dc-living-environment-layer ${isTransitioning ? 'transitioning' : ''}`}
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 0,
        overflow: 'hidden',
        transition: 'opacity 1.2s ease',
      }}
      aria-hidden="true"
    >
      <canvas
        ref={canvasRef}
        style={{
          width: '100%',
          height: '100%',
          display: 'block',
        }}
      />
    </div>
  );
}
