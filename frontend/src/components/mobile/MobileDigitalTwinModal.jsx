import React, { useState, useEffect, useRef } from 'react';
import Icon from '../Icons';

/**
 * MobileDigitalTwinModal (Section 10)
 * Touch-first 2.5D hydrological spatial twin simulation.
 * Loaded on-demand from More → Spatial Model.
 *
 * Requirements:
 * - Touch-first: drag to rotate/pan, tap object to inspect
 * - Bottom information sheet displaying inspected object telemetry
 * - No tiny desktop canvas buttons
 */
export default function MobileDigitalTwinModal({ isOpen, onClose }) {
  const canvasRef = useRef(null);
  const [rotation, setRotation] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [selectedEntity, setSelectedEntity] = useState({
    name: 'Sector 14 Storm Drain Culvert #3',
    type: 'Subsurface Trunk Drain',
    status: '92% Capacity (Near Saturation)',
    intake: '38 mm/h',
    risk: 'Elevated Backflow',
    recommendation: 'Auxiliary pump unit #2 running on diesel standby.',
  });

  const lastTouchRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId;
    let tick = 0;

    const render = () => {
      tick += 0.03;
      const width = canvas.width;
      const height = canvas.height;

      ctx.clearRect(0, 0, width, height);

      // Deep operational background
      ctx.fillStyle = '#11100E';
      ctx.fillRect(0, 0, width, height);

      const centerX = width / 2;
      const centerY = height / 2 + 10;

      // Isometric projection math with touch rotation & zoom
      const cosR = Math.cos(rotation);
      const sinR = Math.sin(rotation);

      const project = (x, y, z) => {
        const rx = (x * cosR - y * sinR) * zoomLevel;
        const ry = (x * sinR + y * cosR) * zoomLevel;
        const isoX = centerX + (rx - ry) * 26;
        const isoY = centerY + (rx + ry) * 13 - z * zoomLevel;
        return { x: isoX, y: isoY };
      };

      // 1. Grid base
      ctx.strokeStyle = 'rgba(242, 238, 231, 0.08)';
      ctx.lineWidth = 1;
      for (let i = -3; i <= 3; i++) {
        const p1 = project(i, -3, 0);
        const p2 = project(i, 3, 0);
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();

        const p3 = project(-3, i, 0);
        const p4 = project(3, i, 0);
        ctx.beginPath();
        ctx.moveTo(p3.x, p3.y);
        ctx.lineTo(p4.x, p4.y);
        ctx.stroke();
      }

      // 2. Animated Water Basin (Culvert Ingress)
      const waterHeight = 8 + Math.sin(tick) * 3;
      ctx.fillStyle = 'rgba(217, 107, 53, 0.25)';
      ctx.beginPath();
      const wp1 = project(-1.5, -1.5, waterHeight);
      const wp2 = project(1.5, -1.5, waterHeight);
      const wp3 = project(1.5, 1.5, waterHeight);
      const wp4 = project(-1.5, 1.5, waterHeight);
      ctx.moveTo(wp1.x, wp1.y);
      ctx.lineTo(wp2.x, wp2.y);
      ctx.lineTo(wp3.x, wp3.y);
      ctx.lineTo(wp4.x, wp4.y);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#D96B35';
      ctx.stroke();

      // 3. Buildings / Infrastructure Blocks
      const buildings = [
        { x: -2, y: -2, w: 1, h: 1, z: 28, label: 'Civil Shelter #2' },
        { x: 1, y: -2, w: 1.2, h: 1, z: 36, label: 'Sector 17 Complex' },
        { x: -2, y: 1, w: 1, h: 1.2, z: 22, label: 'Pumping Station' },
        { x: 1.5, y: 1.5, w: 0.8, h: 0.8, z: 18, label: 'Culvert Sensor' },
      ];

      buildings.forEach((b) => {
        // Draw 3D isometric block
        const b1 = project(b.x, b.y, b.z);
        const b2 = project(b.x + b.w, b.y, b.z);
        const b3 = project(b.x + b.w, b.y + b.h, b.z);
        const b4 = project(b.x, b.y + b.h, b.z);

        const base1 = project(b.x, b.y, 0);
        const base2 = project(b.x + b.w, b.y, 0);
        const base3 = project(b.x + b.w, b.y + b.h, 0);
        const base4 = project(b.x, b.y + b.h, 0);

        // Sides
        ctx.fillStyle = '#1A1816';
        ctx.beginPath();
        ctx.moveTo(base2.x, base2.y);
        ctx.lineTo(b2.x, b2.y);
        ctx.lineTo(b3.x, b3.y);
        ctx.lineTo(base3.x, base3.y);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = 'rgba(242, 238, 231, 0.15)';
        ctx.stroke();

        // Top
        ctx.fillStyle = '#282420';
        ctx.beginPath();
        ctx.moveTo(b1.x, b1.y);
        ctx.lineTo(b2.x, b2.y);
        ctx.lineTo(b3.x, b3.y);
        ctx.lineTo(b4.x, b4.y);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#D96B35';
        ctx.stroke();
      });

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animId) cancelAnimationFrame(animId);
    };
  }, [isOpen, rotation, zoomLevel]);

  if (!isOpen) return null;

  // Touch drag interaction for rotating spatial model
  const handleTouchStart = (e) => {
    if (e.touches.length === 1) {
      lastTouchRef.current = e.touches[0].clientX;
    }
  };

  const handleTouchMove = (e) => {
    if (e.touches.length === 1 && lastTouchRef.current != null) {
      const deltaX = e.touches[0].clientX - lastTouchRef.current;
      setRotation((r) => r + deltaX * 0.015);
      lastTouchRef.current = e.touches[0].clientX;
    }
  };

  const handleTouchEnd = () => {
    lastTouchRef.current = null;
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 10000,
        background: '#11100E',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'Plus Jakarta Sans, sans-serif',
      }}
      role="dialog"
      aria-label="Spatial Model Digital Twin"
    >
      {/* Top Header */}
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: 'calc(0.75rem + env(safe-area-inset-top, 0px)) 1rem 0.75rem 1rem',
          background: 'rgba(25, 23, 20, 0.98)',
          borderBottom: '1px solid rgba(242, 238, 231, 0.1)',
        }}
      >
        <div>
          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', color: '#D96B35', fontWeight: 800 }}>
            SPATIAL MODEL · DIGITAL TWIN
          </span>
          <h2 style={{ fontSize: '0.92rem', color: '#F7F4ED', margin: 0, fontWeight: 700 }}>
            Sector 14–17 Runoff Simulation
          </h2>
        </div>

        <button
          type="button"
          onClick={onClose}
          style={{
            background: 'rgba(242, 238, 231, 0.08)',
            border: 'none',
            color: '#F7F4ED',
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            cursor: 'pointer',
            fontSize: '1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          aria-label="Close Spatial Model"
        >
          ✕
        </button>
      </header>

      {/* Interactive Canvas Viewport */}
      <div
        style={{
          flex: 1,
          position: 'relative',
          overflow: 'hidden',
          touchAction: 'none',
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <canvas
          ref={canvasRef}
          width={window.innerWidth || 390}
          height={380}
          style={{ width: '100%', height: '100%', display: 'block' }}
        />

        {/* Touch Hint Overlay */}
        <div
          style={{
            position: 'absolute',
            top: '12px',
            left: '12px',
            background: 'rgba(17, 16, 14, 0.85)',
            border: '1px solid rgba(242, 238, 231, 0.1)',
            borderRadius: '4px',
            padding: '0.25rem 0.55rem',
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '0.62rem',
            color: '#A49F93',
            backdropFilter: 'blur(8px)',
          }}
        >
          ↔ DRAG TO ROTATE · TAP OBJECT
        </div>

        {/* Zoom Controls */}
        <div
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.35rem',
          }}
        >
          <button
            type="button"
            onClick={() => setZoomLevel((z) => Math.min(1.6, z + 0.15))}
            style={{
              width: '34px',
              height: '34px',
              background: 'rgba(25, 23, 20, 0.9)',
              border: '1px solid rgba(242, 238, 231, 0.15)',
              borderRadius: '4px',
              color: '#F7F4ED',
              fontSize: '1.1rem',
              fontWeight: 'bold',
              cursor: 'pointer',
            }}
          >
            +
          </button>
          <button
            type="button"
            onClick={() => setZoomLevel((z) => Math.max(0.7, z - 0.15))}
            style={{
              width: '34px',
              height: '34px',
              background: 'rgba(25, 23, 20, 0.9)',
              border: '1px solid rgba(242, 238, 231, 0.15)',
              borderRadius: '4px',
              color: '#F7F4ED',
              fontSize: '1.1rem',
              fontWeight: 'bold',
              cursor: 'pointer',
            }}
          >
            −
          </button>
        </div>
      </div>

      {/* Touch-First Bottom Information Sheet (Section 10) */}
      <div
        style={{
          background: 'rgba(25, 23, 20, 0.98)',
          borderTop: '1px solid rgba(242, 238, 231, 0.12)',
          padding: '0.85rem 1rem calc(0.85rem + env(safe-area-inset-bottom, 0px)) 1rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.55rem',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#F7F4ED' }}>
            {selectedEntity.name}
          </span>
          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.62rem', color: '#D96B35', background: 'rgba(217,107,53,0.15)', padding: '2px 6px', borderRadius: '3px', fontWeight: 700 }}>
            {selectedEntity.type}
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.45rem', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.68rem' }}>
          <div>
            <span style={{ color: '#7A756D', display: 'block', fontSize: '0.58rem' }}>CURRENT STATUS</span>
            <span style={{ color: '#D96B35', fontWeight: 600 }}>{selectedEntity.status}</span>
          </div>
          <div>
            <span style={{ color: '#7A756D', display: 'block', fontSize: '0.58rem' }}>RUNOFF INTAKE</span>
            <span style={{ color: '#E9E5DC', fontWeight: 600 }}>{selectedEntity.intake}</span>
          </div>
        </div>

        <p style={{ margin: 0, fontSize: '0.75rem', color: '#A49F93', lineHeight: 1.4 }}>
          {selectedEntity.recommendation}
        </p>
      </div>
    </div>
  );
}
