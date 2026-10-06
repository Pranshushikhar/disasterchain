import React, { useEffect, useRef } from 'react';
import { useEnvironment } from '../context/EnvironmentContext';

/**
 * DISASTERCHAIN LIVING ENVIRONMENT ATMOSPHERIC ENGINE
 * 
 * Multi-layer real-time environmental simulation (Rain, Storm, Night, Snow, Fog, Calm).
 * 
 * Architectural Layering:
 * - Layer 0/1 (Background Canvas, z-index: 0):
 *   Atmospheric sky gradients, background & midground precipitation, surface ripples, stars, fog banks.
 * - Layer 10 (Page UI & Content, z-index: 10):
 *   Application navigation, cards, charts, maps, and interactive elements.
 * - Layer 2 (Foreground Canvas, z-index: 12, pointer-events: none):
 *   Screen condensation droplets sliding down glass, soft foreground depth-of-field rain/snow,
 *   ambient environmental mist. 100% click-through, never obstructs reading.
 */
export default function LivingEnvironment() {
  const { environment, isTransitioning } = useEnvironment();
  const bgCanvasRef = useRef(null);
  const fgCanvasRef = useRef(null);
  const animFrameRef = useRef(null);

  useEffect(() => {
    const bgCanvas = bgCanvasRef.current;
    const fgCanvas = fgCanvasRef.current;
    if (!bgCanvas || !fgCanvas) return;

    const bgCtx = bgCanvas.getContext('2d');
    const fgCtx = fgCanvas.getContext('2d');

    let width = (bgCanvas.width = fgCanvas.width = window.innerWidth);
    let height = (bgCanvas.height = fgCanvas.height = window.innerHeight);
    const isMobile = width < 768;

    const handleResize = () => {
      if (!bgCanvas || !fgCanvas) return;
      width = bgCanvas.width = fgCanvas.width = window.innerWidth;
      height = bgCanvas.height = fgCanvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // =========================================================================
    // PARTICLE SYSTEMS
    // =========================================================================

    // 1. Rain Streaks (Background & Midground)
    const rainCount = isMobile ? 180 : 380;
    const rainParticles = [];
    for (let i = 0; i < rainCount; i++) {
      rainParticles.push({
        x: Math.random() * (width + 300) - 100,
        y: Math.random() * height,
        speed: Math.random() * 14 + 18,
        length: Math.random() * 32 + 22,
        width: Math.random() * 1.2 + 0.9,
        layer: Math.floor(Math.random() * 3), // 0: distant faint, 1: midground crisp, 2: mid-foreground
        alpha: Math.random() * 0.45 + 0.4,
      });
    }

    // 2. Foreground Fast Raindrops (Layer 2, close to camera)
    const fgRainCount = isMobile ? 18 : 42;
    const fgRainParticles = [];
    for (let i = 0; i < fgRainCount; i++) {
      fgRainParticles.push({
        x: Math.random() * (width + 300) - 50,
        y: Math.random() * height,
        speed: Math.random() * 18 + 26,
        length: Math.random() * 55 + 45,
        width: Math.random() * 1.6 + 1.4,
        alpha: Math.random() * 0.35 + 0.45,
      });
    }

    // 3. Screen Glass Droplets (Water sliding down screen window)
    const screenDropletCount = isMobile ? 14 : 32;
    const screenDroplets = [];
    for (let i = 0; i < screenDropletCount; i++) {
      screenDroplets.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 2.8 + 1.4,
        speedY: Math.random() * 0.45 + 0.12,
        wobble: Math.random() * Math.PI * 2,
        trailLen: Math.random() * 18 + 8,
        alpha: Math.random() * 0.4 + 0.45,
      });
    }

    // 4. Snow Flakes (Multi-layer depth with sine turbulence)
    const snowCount = isMobile ? 90 : 220;
    const snowParticles = [];
    for (let i = 0; i < snowCount; i++) {
      snowParticles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 2.6 + 1.0,
        layer: Math.floor(Math.random() * 3),
        speedY: Math.random() * 1.4 + 0.8,
        speedX: (Math.random() - 0.5) * 0.4,
        swaySpeed: Math.random() * 1.8 + 0.8,
        swayPhase: Math.random() * Math.PI * 2,
        alpha: Math.random() * 0.5 + 0.4,
      });
    }

    // 5. Foreground Bokeh Snow Flakes (Layer 2)
    const fgSnowCount = isMobile ? 10 : 22;
    const fgSnowParticles = [];
    for (let i = 0; i < fgSnowCount; i++) {
      fgSnowParticles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 5.5 + 3.5,
        speedY: Math.random() * 1.8 + 1.2,
        swaySpeed: Math.random() * 1.2 + 0.6,
        swayPhase: Math.random() * Math.PI * 2,
        alpha: Math.random() * 0.3 + 0.3,
      });
    }

    // 6. Night Stars with Atmospheric Scintillation
    const starCount = isMobile ? 60 : 140;
    const stars = [];
    for (let i = 0; i < starCount; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * (height * 0.85),
        radius: Math.random() * 1.8 + 0.7,
        twinkleSpeed: Math.random() * 2.5 + 1.0,
        twinklePhase: Math.random() * Math.PI * 2,
        baseAlpha: Math.random() * 0.5 + 0.35,
      });
    }

    // 7. Calm Sun Dust Motes
    const dustCount = isMobile ? 25 : 55;
    const dustParticles = [];
    for (let i = 0; i < dustCount; i++) {
      dustParticles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 2.0 + 0.8,
        speedY: (Math.random() - 0.5) * 0.3,
        speedX: Math.random() * 0.4 + 0.1,
        swaySpeed: Math.random() * 1.0 + 0.5,
        swayPhase: Math.random() * Math.PI * 2,
        alpha: Math.random() * 0.45 + 0.25,
      });
    }

    // Storm lightning controller
    const lightning = {
      active: false,
      flashAlpha: 0,
      nextTime: performance.now() + 6000 + Math.random() * 8000,
    };

    let lastTime = performance.now();
    let isVisible = !document.hidden;

    const handleVisibility = () => {
      isVisible = !document.hidden;
    };
    document.addEventListener('visibilitychange', handleVisibility);

    // =========================================================================
    // MAIN RENDER LOOP (60 FPS)
    // =========================================================================
    const render = (now) => {
      if (!isVisible) {
        animFrameRef.current = requestAnimationFrame(render);
        return;
      }

      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      // Clear both layers
      bgCtx.clearRect(0, 0, width, height);
      fgCtx.clearRect(0, 0, width, height);

      // =======================================================================
      // 1. RAIN & STORM THEMES
      // =======================================================================
      if (environment === 'rain' || environment === 'storm') {
        const isStorm = environment === 'storm';
        const windX = isStorm ? -5.8 : -3.2;
        const speedMult = isStorm ? 1.45 : 1.18;

        // --- BACKGROUND & MIDGROUND LAYERS (z-index 0) ---
        rainParticles.forEach((p) => {
          p.x += (windX + (p.layer - 1) * 0.7) * speedMult;
          p.y += (p.speed + p.layer * 5.5) * speedMult;

          if (p.y > height + 25) {
            p.y = -p.length - 15;
            p.x = Math.random() * (width + 350) - 100;
          }
          if (p.x < -150) p.x = width + 100;

          const streakLen = p.length * (isStorm ? 1.35 : 1.05);

          // Contrast color: On light grey (#E1E6E7) rain is cool slate; on storm (#131A1F) it is bright cyan
          if (p.layer === 0) {
            // Background: thin, faint, slow, high density
            bgCtx.lineWidth = isStorm ? 1.1 : 1.0;
            bgCtx.strokeStyle = isStorm
              ? `rgba(165, 205, 230, ${p.alpha * 0.65})`
              : `rgba(55, 88, 102, ${p.alpha * 0.55})`;
          } else {
            // Midground: medium width, visible, medium speed
            bgCtx.lineWidth = isStorm ? 1.8 : 1.6;
            bgCtx.strokeStyle = isStorm
              ? `rgba(195, 230, 255, ${p.alpha * 0.88})`
              : `rgba(38, 72, 86, ${p.alpha * 0.78})`;
          }

          bgCtx.beginPath();
          bgCtx.moveTo(p.x, p.y);
          bgCtx.lineTo(p.x + windX * (streakLen / p.speed), p.y + streakLen);
          bgCtx.stroke();
        });

        // Storm Horizon Lightning Flashes
        if (isStorm) {
          if (now > lightning.nextTime) {
            lightning.active = true;
            lightning.flashAlpha = 0.38;
            lightning.nextTime = now + 8000 + Math.random() * 10000;
          }

          if (lightning.active) {
            lightning.flashAlpha -= dt * 0.8;
            if (lightning.flashAlpha <= 0) {
              lightning.flashAlpha = 0;
              lightning.active = false;
            } else {
              // Soft horizon illumination
              const flashGrad = bgCtx.createLinearGradient(0, 0, 0, height * 0.6);
              flashGrad.addColorStop(0, `rgba(225, 240, 255, ${lightning.flashAlpha * 0.65})`);
              flashGrad.addColorStop(0.7, `rgba(200, 225, 250, ${lightning.flashAlpha * 0.2})`);
              flashGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
              bgCtx.fillStyle = flashGrad;
              bgCtx.fillRect(0, 0, width, height * 0.6);
            }
          }
        }

        // --- FOREGROUND LAYER (z-index 2): Fast Close Drops & Glass Droplets ---
        // Foreground Rain: larger, faster, fewer particles
        fgCtx.lineWidth = isStorm ? 2.8 : 2.4;
        fgRainParticles.forEach((fp) => {
          fp.x += windX * 1.6 * speedMult;
          fp.y += fp.speed * speedMult;

          if (fp.y > height + 40) {
            fp.y = -fp.length - 20;
            fp.x = Math.random() * (width + 300) - 50;
          }
          if (fp.x < -150) fp.x = width + 100;

          fgCtx.strokeStyle = isStorm
            ? `rgba(225, 245, 255, ${fp.alpha * 0.85})`
            : `rgba(32, 62, 75, ${fp.alpha * 0.75})`;
          fgCtx.beginPath();
          fgCtx.moveTo(fp.x, fp.y);
          fgCtx.lineTo(fp.x + windX * 2.3, fp.y + fp.length);
          fgCtx.stroke();
        });

        // Subtle windshield/screen glass droplets trickling down
        screenDroplets.forEach((d) => {
          d.wobble += dt * 2.2;
          d.y += d.speedY * (isStorm ? 1.7 : 1.2);
          d.x += Math.sin(d.wobble) * 0.18;

          if (d.y > height + 25) {
            d.y = -15;
            d.x = Math.random() * width;
          }

          // Specular Shadow rim for realism
          fgCtx.fillStyle = isStorm
            ? `rgba(15, 25, 35, ${d.alpha * 0.5})`
            : `rgba(25, 48, 58, ${d.alpha * 0.45})`;
          fgCtx.beginPath();
          fgCtx.arc(d.x + 0.5, d.y + 0.5, d.radius, 0, Math.PI * 2);
          fgCtx.fill();

          // Droplet body
          fgCtx.fillStyle = isStorm
            ? `rgba(175, 215, 240, ${d.alpha * 0.65})`
            : `rgba(65, 105, 120, ${d.alpha * 0.55})`;
          fgCtx.beginPath();
          fgCtx.arc(d.x, d.y, d.radius * 0.9, 0, Math.PI * 2);
          fgCtx.fill();

          // Droplet bright glint
          fgCtx.fillStyle = `rgba(255, 255, 255, ${d.alpha * 0.9})`;
          fgCtx.beginPath();
          fgCtx.arc(d.x - d.radius * 0.35, d.y - d.radius * 0.35, d.radius * 0.4, 0, Math.PI * 2);
          fgCtx.fill();

          // Trickle trail behind droplet
          fgCtx.strokeStyle = isStorm
            ? `rgba(180, 220, 240, ${d.alpha * 0.3})`
            : `rgba(45, 80, 95, ${d.alpha * 0.28})`;
          fgCtx.lineWidth = d.radius * 0.5;
          fgCtx.beginPath();
          fgCtx.moveTo(d.x, d.y - d.radius);
          fgCtx.lineTo(d.x, d.y - d.radius - d.trailLen);
          fgCtx.stroke();
        });
      }

      // =======================================================================
      // 2. SNOW THEME
      // =======================================================================
      else if (environment === 'snow') {
        // --- BACKGROUND LAYER: Multi-depth snowfall ---
        snowParticles.forEach((sp) => {
          sp.swayPhase += dt * sp.swaySpeed;
          const sway = Math.sin(sp.swayPhase) * (1.2 + sp.layer * 0.6);
          sp.x += sp.speedX + sway + 0.4;
          sp.y += (sp.speedY + sp.layer * 0.8);

          if (sp.y > height + 10) {
            sp.y = -10;
            sp.x = Math.random() * width;
          }
          if (sp.x > width + 15) sp.x = -10;
          if (sp.x < -15) sp.x = width + 10;

          const radius = sp.radius * (0.8 + sp.layer * 0.6);
          // Soft icy rim for visibility on light winter sky
          bgCtx.fillStyle = `rgba(145, 178, 198, ${sp.alpha * 0.45})`;
          bgCtx.beginPath();
          bgCtx.arc(sp.x, sp.y, radius + 0.6, 0, Math.PI * 2);
          bgCtx.fill();

          // Crisp snow core
          bgCtx.fillStyle = `rgba(255, 255, 255, ${sp.alpha * 0.95})`;
          bgCtx.beginPath();
          bgCtx.arc(sp.x, sp.y, radius, 0, Math.PI * 2);
          bgCtx.fill();
        });

        // --- FOREGROUND LAYER: Soft Blurred Bokeh Snowflakes ---
        fgSnowParticles.forEach((fsp) => {
          fsp.swayPhase += dt * fsp.swaySpeed;
          fsp.x += Math.sin(fsp.swayPhase) * 1.5 + 0.5;
          fsp.y += fsp.speedY;

          if (fsp.y > height + 20) {
            fsp.y = -20;
            fsp.x = Math.random() * width;
          }
          if (fsp.x > width + 20) fsp.x = -15;

          const radGrad = fgCtx.createRadialGradient(
            fsp.x,
            fsp.y,
            0,
            fsp.x,
            fsp.y,
            fsp.radius * 1.8
          );
          radGrad.addColorStop(0, `rgba(245, 252, 255, ${fsp.alpha * 0.75})`);
          radGrad.addColorStop(0.5, `rgba(240, 248, 255, ${fsp.alpha * 0.35})`);
          radGrad.addColorStop(1, 'rgba(240, 248, 255, 0)');

          fgCtx.fillStyle = radGrad;
          fgCtx.beginPath();
          fgCtx.arc(fsp.x, fsp.y, fsp.radius * 1.8, 0, Math.PI * 2);
          fgCtx.fill();
        });
      }

      // =======================================================================
      // 3. NIGHT THEME
      // =======================================================================
      else if (environment === 'night') {
        // --- BACKGROUND LAYER: Deep Night Sky & Twinkling Stars ---
        stars.forEach((st) => {
          st.twinklePhase += dt * st.twinkleSpeed;
          const twinkle = Math.sin(st.twinklePhase) * 0.35 + 0.65;
          const alpha = st.baseAlpha * twinkle;

          bgCtx.fillStyle = `rgba(220, 235, 255, ${alpha})`;
          bgCtx.beginPath();
          bgCtx.arc(st.x, st.y, st.radius, 0, Math.PI * 2);
          bgCtx.fill();

          // Star cross diffraction glint on brighter stars
          if (st.radius > 1.8 && alpha > 0.6) {
            bgCtx.strokeStyle = `rgba(200, 225, 255, ${alpha * 0.4})`;
            bgCtx.lineWidth = 0.8;
            bgCtx.beginPath();
            bgCtx.moveTo(st.x - 3, st.y);
            bgCtx.lineTo(st.x + 3, st.y);
            bgCtx.moveTo(st.x, st.y - 3);
            bgCtx.lineTo(st.x, st.y + 3);
            bgCtx.stroke();
          }
        });

        // Moonlight soft ambient haze
        const moonGrad = bgCtx.createRadialGradient(
          width * 0.78,
          height * 0.18,
          20,
          width * 0.78,
          height * 0.18,
          width * 0.45
        );
        moonGrad.addColorStop(0, 'rgba(165, 195, 225, 0.08)');
        moonGrad.addColorStop(0.6, 'rgba(140, 175, 210, 0.03)');
        moonGrad.addColorStop(1, 'rgba(0,0,0,0)');
        bgCtx.fillStyle = moonGrad;
        bgCtx.fillRect(0, 0, width, height);
      }

      // =======================================================================
      // 4. FOG THEME
      // =======================================================================
      else if (environment === 'fog') {
        const timeSec = now * 0.0004;
        const fogBands = 4;
        for (let i = 0; i < fogBands; i++) {
          const yPos = (height * 0.22 * (i + 1)) + Math.sin(timeSec * 2 + i * 1.5) * 35;
          const bandHeight = height * 0.38;

          const fogGrad = bgCtx.createLinearGradient(
            0,
            yPos - bandHeight * 0.5,
            0,
            yPos + bandHeight * 0.5
          );
          fogGrad.addColorStop(0, 'rgba(235, 230, 222, 0)');
          fogGrad.addColorStop(0.5, `rgba(238, 232, 224, ${0.16 + i * 0.05})`);
          fogGrad.addColorStop(1, 'rgba(235, 230, 222, 0)');

          bgCtx.fillStyle = fogGrad;
          bgCtx.fillRect(0, yPos - bandHeight * 0.5, width, bandHeight);
        }

        // Foreground soft mist filter
        const fgFog = fgCtx.createLinearGradient(0, height * 0.7, 0, height);
        fgFog.addColorStop(0, 'rgba(235, 230, 222, 0)');
        fgFog.addColorStop(1, 'rgba(235, 230, 222, 0.14)');
        fgCtx.fillStyle = fgFog;
        fgCtx.fillRect(0, height * 0.7, width, height * 0.3);
      }

      // =======================================================================
      // 5. CALM EARTH THEME (Default)
      // =======================================================================
      else {
        // --- BACKGROUND LAYER: Warm Sunlight Dust Motes ---
        dustParticles.forEach((dp) => {
          dp.swayPhase += dt * dp.swaySpeed;
          dp.x += dp.speedX + Math.sin(dp.swayPhase) * 0.25;
          dp.y += dp.speedY;

          if (dp.y < -10) dp.y = height + 10;
          if (dp.y > height + 10) dp.y = -10;
          if (dp.x > width + 10) dp.x = -10;

          bgCtx.fillStyle = `rgba(216, 185, 138, ${dp.alpha * 0.65})`;
          bgCtx.beginPath();
          bgCtx.arc(dp.x, dp.y, dp.radius, 0, Math.PI * 2);
          bgCtx.fill();
        });

        // Gentle warm sunbeam aura
        const sunbeam = bgCtx.createRadialGradient(
          width * 0.5,
          height * 0.15,
          10,
          width * 0.5,
          height * 0.15,
          width * 0.65
        );
        sunbeam.addColorStop(0, 'rgba(235, 210, 170, 0.07)');
        sunbeam.addColorStop(0.6, 'rgba(216, 185, 138, 0.02)');
        sunbeam.addColorStop(1, 'rgba(0,0,0,0)');
        bgCtx.fillStyle = sunbeam;
        bgCtx.fillRect(0, 0, width, height);
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', handleVisibility);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [environment]);

  return (
    <>
      {/* 1. BACKGROUND ATMOSPHERIC LAYER (z-index 0: behind cards & page content) */}
      <div
        className={`dc-living-env-bg-layer ${isTransitioning ? 'transitioning' : ''}`}
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
          ref={bgCanvasRef}
          style={{
            width: '100%',
            height: '100%',
            display: 'block',
          }}
        />
      </div>

      {/* 2. FOREGROUND SCREEN GLASS LAYER (z-index 12: window droplets & depth haze, 100% click-through) */}
      <div
        className="dc-living-env-fg-layer"
        style={{
          position: 'fixed',
          inset: 0,
          pointerEvents: 'none',
          zIndex: 12,
          overflow: 'hidden',
        }}
        aria-hidden="true"
      >
        <canvas
          ref={fgCanvasRef}
          style={{
            width: '100%',
            height: '100%',
            display: 'block',
          }}
        />
      </div>
    </>
  );
}
