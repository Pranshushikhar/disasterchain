import React, { useState, useEffect, useRef } from 'react';
import SourceBadge from './SourceBadge';

/**
 * DISASTERCHAIN DIGITAL TWIN — SPATIAL RUNOFF ABSTRACTION
 * Ultra-performant 2.5D isometric spatial model simulating water accumulation,
 * infrastructure stress, and dynamic evacuation rerouting.
 */
export default function DigitalTwinModel({
  rainfallMm = 8.2,
  waterloggingActive = true,
  height = '380px',
}) {
  const canvasRef = useRef(null);
  const [waterLevel, setWaterLevel] = useState(waterloggingActive ? 35 : 10); // percentage
  const [showWater, setShowWater] = useState(true);
  const [showRoads, setShowRoads] = useState(true);
  const [showShelters, setShowShelters] = useState(true);
  const [viewMode, setViewMode] = useState('2.5D'); // '2.5D' | '2D'

  // Update water level smoothly when rainfall changes
  useEffect(() => {
    const target = Math.min(85, Math.max(12, Math.round(rainfallMm * 4.5)));
    setWaterLevel(target);
  }, [rainfallMm]);

  // Canvas render loop for 2.5D isometric spatial city abstraction
  useEffect(() => {
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

      // Background ambient fill
      ctx.fillStyle = '#121413';
      ctx.fillRect(0, 0, width, height);

      const centerX = width / 2;
      const centerY = height / 2 + 10;

      // Isometric projection helpers
      const toIso = (x, y, z) => {
        const isoX = centerX + (x - y) * 28;
        const isoY = centerY + (x + y) * 14 - z;
        return { x: isoX, y: isoY };
      };

      if (viewMode === '2.5D') {
        // 1. Base Ground Grid (Sector 14 Basin)
        ctx.strokeStyle = 'rgba(242, 238, 231, 0.06)';
        ctx.lineWidth = 1;

        for (let x = -4; x <= 4; x++) {
          const p1 = toIso(x, -4, 0);
          const p2 = toIso(x, 4, 0);
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
        }

        for (let y = -4; y <= 4; y++) {
          const p1 = toIso(-4, y, 0);
          const p2 = toIso(4, y, 0);
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
        }

        // 2. Isometric City Blocks / Buildings
        const buildings = [
          { x: -2, y: -2, w: 1.2, d: 1.2, h: 35, color: '#1B1E1C', roof: '#242825' },
          { x: -2, y: 1, w: 1.2, d: 1.2, h: 48, color: '#1E221F', roof: '#2A302C' },
          { x: 1, y: -2, w: 1.2, d: 1.2, h: 55, color: '#202421', roof: '#2C342F' },
          { x: 2, y: 1, w: 1.2, d: 1.2, h: 40, color: '#1B1E1C', roof: '#242825' },
        ];

        buildings.forEach((b) => {
          // Draw building faces
          const base = toIso(b.x, b.y, 0);
          const top = toIso(b.x, b.y, b.h);
          const right = toIso(b.x + b.w, b.y, 0);
          const rightTop = toIso(b.x + b.w, b.y, b.h);
          const front = toIso(b.x, b.y + b.d, 0);
          const frontTop = toIso(b.x, b.y + b.d, b.h);
          const corner = toIso(b.x + b.w, b.y + b.d, 0);
          const cornerTop = toIso(b.x + b.w, b.y + b.d, b.h);

          // Left Face
          ctx.fillStyle = b.color;
          ctx.beginPath();
          ctx.moveTo(base.x, base.y);
          ctx.lineTo(top.x, top.y);
          ctx.lineTo(frontTop.x, frontTop.y);
          ctx.lineTo(front.x, front.y);
          ctx.closePath();
          ctx.fill();
          ctx.strokeStyle = 'rgba(242, 238, 231, 0.08)';
          ctx.stroke();

          // Right Face
          ctx.fillStyle = b.roof;
          ctx.beginPath();
          ctx.moveTo(front.x, front.y);
          ctx.lineTo(frontTop.x, frontTop.y);
          ctx.lineTo(cornerTop.x, cornerTop.y);
          ctx.lineTo(corner.x, corner.y);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();

          // Roof Face
          ctx.fillStyle = '#2F3631';
          ctx.beginPath();
          ctx.moveTo(top.x, top.y);
          ctx.lineTo(rightTop.x, rightTop.y);
          ctx.lineTo(cornerTop.x, cornerTop.y);
          ctx.lineTo(frontTop.x, frontTop.y);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
        });

        // 3. Road Network & Disruption Corridors
        if (showRoads) {
          const r1 = toIso(-4, 0, 1);
          const r2 = toIso(4, 0, 1);
          ctx.strokeStyle = waterloggingActive ? '#D66A35' : '#5E8B68';
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.moveTo(r1.x, r1.y);
          ctx.lineTo(r2.x, r2.y);
          ctx.stroke();

          // Road lane dashes
          ctx.strokeStyle = '#121413';
          ctx.lineWidth = 1;
          ctx.setLineDash([4, 4]);
          ctx.beginPath();
          ctx.moveTo(r1.x, r1.y);
          ctx.lineTo(r2.x, r2.y);
          ctx.stroke();
          ctx.setLineDash([]);
        }

        // 4. Rising Dynamic Water Layer (Low-Lying Basin)
        if (showWater && waterLevel > 0) {
          const wave = Math.sin(tick) * 2;
          const waterZ = (waterLevel / 100) * 24 + wave;

          ctx.fillStyle = 'rgba(85, 124, 145, 0.38)';
          ctx.strokeStyle = 'rgba(85, 124, 145, 0.7)';
          ctx.lineWidth = 1;

          const pA = toIso(-1.5, -1.5, waterZ);
          const pB = toIso(1.5, -1.5, waterZ);
          const pC = toIso(1.5, 1.5, waterZ);
          const pD = toIso(-1.5, 1.5, waterZ);

          ctx.beginPath();
          ctx.moveTo(pA.x, pA.y);
          ctx.lineTo(pB.x, pB.y);
          ctx.lineTo(pC.x, pC.y);
          ctx.lineTo(pD.x, pD.y);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();

          // Water depth label
          ctx.font = '10px "JetBrains Mono", monospace';
          ctx.fillStyle = '#E9E5DC';
          ctx.fillText(`Basin Depth: ${(waterLevel * 0.03).toFixed(2)}m`, pD.x - 20, pD.y + 16);
        }

        // 5. Shelter Safety Beacon Marker
        if (showShelters) {
          const sPos = toIso(-2, 1, 56);
          const pulse = Math.abs(Math.sin(tick * 2)) * 4;

          ctx.fillStyle = '#5E8B68';
          ctx.beginPath();
          ctx.arc(sPos.x, sPos.y - 8, 4 + pulse, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#F7F4ED';
          ctx.font = 'bold 9px "JetBrains Mono", monospace';
          ctx.fillText('SHELTER #2 (ACTIVE)', sPos.x - 45, sPos.y - 20);
        }
      } else {
        // 2D Tactical Plan View (Fallback)
        ctx.strokeStyle = 'rgba(242, 238, 231, 0.1)';
        ctx.strokeRect(40, 40, width - 80, height - 80);

        // Water basin rectangle
        if (showWater) {
          ctx.fillStyle = 'rgba(85, 124, 145, 0.3)';
          ctx.fillRect(centerX - 80, centerY - 60, 160, 120);
          ctx.font = '11px "JetBrains Mono", monospace';
          ctx.fillStyle = '#557C91';
          ctx.fillText('LOW-LYING RUNOFF BASIN', centerX - 70, centerY);
        }

        // Road line
        if (showRoads) {
          ctx.strokeStyle = waterloggingActive ? '#D66A35' : '#5E8B68';
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.moveTo(40, centerY + 20);
          ctx.lineTo(width - 40, centerY + 20);
          ctx.stroke();
        }

        // Shelter pin
        if (showShelters) {
          ctx.fillStyle = '#5E8B68';
          ctx.beginPath();
          ctx.arc(centerX - 90, centerY - 80, 8, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#F7F4ED';
          ctx.font = '10px "JetBrains Mono", monospace';
          ctx.fillText('Civil Shelter #2 (Open)', centerX - 80, centerY - 76);
        }
      }

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [waterLevel, showWater, showRoads, showShelters, viewMode, waterloggingActive]);

  return (
    <div className="dc-twin-surface" role="region" aria-label="DisasterChain Digital Twin">
      {/* Top Telemetry Header */}
      <div className="dc-twin-header">
        <div className="twin-title-group">
          <span className="twin-super">SPATIAL DIGITAL TWIN (SIMULATION)</span>
          <h4 className="twin-title">Sector 14 Hydrodynamic Runoff Model</h4>
        </div>

        <div className="twin-controls">
          <SourceBadge
            source="DisasterChain Hydrodynamic Simulation"
            confidence="High"
            updatedAt="Continuous"
            isOfficial={false}
            isDemo={true}
            methodology="2.5D mathematical isometric runoff simulation visualizing elevation gradient and water accumulation dynamics for tactical civil defense planning."
            compact={true}
          />
          <button
            type="button"
            className="twin-toggle-btn"
            onClick={() => setViewMode(viewMode === '2.5D' ? '2D' : '2.5D')}
          >
            {viewMode === '2.5D' ? 'Switch to 2D Plan' : 'Switch to 2.5D Iso'}
          </button>
        </div>
      </div>

      {/* Canvas Viewport */}
      <div className="dc-twin-viewport" style={{ height }}>
        <canvas
          ref={canvasRef}
          width={640}
          height={380}
          className="dc-twin-canvas"
        />

        {/* Minimal On-Canvas Layer Toggles */}
        <div className="dc-twin-layer-pills">
          <button
            type="button"
            className={`layer-pill ${showWater ? 'active' : ''}`}
            onClick={() => setShowWater(!showWater)}
          >
            Water Accumulation
          </button>
          <button
            type="button"
            className={`layer-pill ${showRoads ? 'active' : ''}`}
            onClick={() => setShowRoads(!showRoads)}
          >
            Road Corridors
          </button>
          <button
            type="button"
            className={`layer-pill ${showShelters ? 'active' : ''}`}
            onClick={() => setShowShelters(!showShelters)}
          >
            Shelter Beacons
          </button>
        </div>
      </div>

      {/* Model Parameters Readout */}
      <div className="dc-twin-footer">
        <div className="param-item">
          <span className="param-label">RAINFALL FORCING:</span>
          <span className="param-val">{rainfallMm} mm/h</span>
        </div>
        <div className="param-item">
          <span className="param-label">WATERLOGGING STRESS:</span>
          <span className="param-val" style={{ color: waterLevel > 50 ? '#D66A35' : '#5E8B68' }}>
            {waterLevel}% Elevation Fill
          </span>
        </div>
        <div className="param-item">
          <span className="param-label">REROUTE POSTURE:</span>
          <span className="param-val">{waterloggingActive ? 'Active Diversion' : 'Nominal Transit'}</span>
        </div>
      </div>

      <style>{`
        .dc-twin-surface {
          background: #121413;
          border: 1px solid rgba(242, 238, 231, 0.08);
          border-radius: 4px;
          overflow: hidden;
          font-family: var(--font-sans, -apple-system, sans-serif);
          color: #E9E5DC;
        }

        .dc-twin-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.85rem 1.15rem;
          background: #181A18;
          border-bottom: 1px solid rgba(242, 238, 231, 0.08);
        }

        .twin-super {
          display: block;
          font-family: var(--font-mono, monospace);
          font-size: 0.62rem;
          font-weight: 700;
          letter-spacing: 0.12em;
          color: #D66A35;
        }

        .twin-title {
          font-size: 0.95rem;
          font-weight: 600;
          color: #F7F4ED;
          margin: 0.15rem 0 0 0;
        }

        .twin-controls {
          display: flex;
          align-items: center;
          gap: 0.6rem;
        }

        .twin-toggle-btn {
          background: transparent;
          border: 1px solid rgba(242, 238, 231, 0.15);
          color: #A49F93;
          font-family: var(--font-mono, monospace);
          font-size: 0.62rem;
          padding: 0.2rem 0.5rem;
          border-radius: 2px;
          cursor: pointer;
          transition: all 0.12s ease;
        }

        .twin-toggle-btn:hover {
          color: #F7F4ED;
          border-color: #D66A35;
        }

        .dc-twin-viewport {
          position: relative;
          width: 100%;
          background: #121413;
          overflow: hidden;
        }

        .dc-twin-canvas {
          width: 100%;
          height: 100%;
          display: block;
        }

        .dc-twin-layer-pills {
          position: absolute;
          bottom: 12px;
          left: 12px;
          display: flex;
          flex-wrap: wrap;
          gap: 0.4rem;
          z-index: 5;
        }

        .layer-pill {
          background: rgba(18, 20, 18, 0.85);
          border: 1px solid rgba(242, 238, 231, 0.1);
          color: #A49F93;
          font-family: var(--font-mono, monospace);
          font-size: 0.62rem;
          padding: 0.2rem 0.45rem;
          border-radius: 2px;
          cursor: pointer;
          backdrop-filter: blur(4px);
          transition: all 0.12s ease;
        }

        .layer-pill:hover {
          color: #F7F4ED;
        }

        .layer-pill.active {
          background: rgba(214, 106, 53, 0.15);
          border-color: #D66A35;
          color: #D66A35;
          font-weight: 600;
        }

        .dc-twin-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 0.75rem;
          padding: 0.65rem 1.15rem;
          background: #181A18;
          border-top: 1px solid rgba(242, 238, 231, 0.08);
          font-family: var(--font-mono, monospace);
          font-size: 0.65rem;
        }

        .param-item {
          display: flex;
          align-items: center;
          gap: 0.4rem;
        }

        .param-label {
          color: #7A756D;
        }

        .param-val {
          color: #F7F4ED;
          font-weight: 600;
        }
      `}</style>
    </div>
  );
}
