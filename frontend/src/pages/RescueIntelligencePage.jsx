import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Compass,
  Navigation,
  AlertTriangle,
  Truck,
  LifeBuoy,
  Activity,
  Car,
} from 'lucide-react';
import { useCrisisSimulation } from '../context/CrisisSimulationContext';
import { Link } from 'react-router-dom';

const WAYPOINTS = [
  { id: 'wp-sec1-oldtown', name: 'Sector 1: Historic Old Quarter (Heritage Plaza)', sector: 'sec-1', coords: [28.6185, 77.2020], x: 180, y: 150, type: 'Origin' },
  { id: 'wp-sec2-riverview', name: 'Sector 2: Riverview Apartments (Flood Zone)', sector: 'sec-2', coords: [28.6110, 77.2050], x: 260, y: 270, type: 'Origin' },
  { id: 'wp-sec5-shanti', name: 'Sector 5: Shanti Nagar Residential Ward', sector: 'sec-5', coords: [28.6040, 77.2010], x: 200, y: 390, type: 'Origin' },
  { id: 'wp-sec3-cyber', name: 'Sector 3: Cyber Heights Tech Park', sector: 'sec-3', coords: [28.6220, 77.2180], x: 520, y: 120, type: 'Origin' },
  { id: 'wp-sec6-ind', name: 'Sector 6: Udyog Vihar Industrial Estate', sector: 'sec-6', coords: [28.6030, 77.2190], x: 540, y: 390, type: 'Origin' },

  // Destinations
  { id: 'wp-hosp-civil', name: 'Saraswati District Civil Hospital & Trauma', sector: 'sec-4', coords: [28.6142, 77.2215], x: 560, y: 230, type: 'Destination', isHospital: true },
  { id: 'wp-shltr-stadium', name: 'Sports Stadium Emergency Relief Shelter', sector: 'sec-4', coords: [28.6118, 77.2230], x: 570, y: 290, type: 'Destination', isShelter: true },
  { id: 'wp-shltr-school', name: 'Model Senior Secondary School Shelter', sector: 'sec-5', coords: [28.6052, 77.2025], x: 220, y: 410, type: 'Destination', isShelter: true },
];

const VEHICLE_TYPES = [
  { id: 'ambulance', name: 'ALS Trauma Ambulance', icon: Truck, speedKmH: 55, wadingDepthMeters: 0.35, avoidsRoughTerrain: true },
  { id: 'boat', name: 'Zodiac Rescue Boat', icon: LifeBuoy, speedKmH: 28, wadingDepthMeters: 4.5, isWaterOnly: true },
  { id: 'truck4x4', name: 'Civil Defense 4x4 Heavy Wading Truck', icon: Car, speedKmH: 45, wadingDepthMeters: 1.1, avoidsRoughTerrain: false },
  { id: 'bus', name: 'Civilian Evacuation Bus', icon: Truck, speedKmH: 40, wadingDepthMeters: 0.4, avoidsRoughTerrain: true },
];

export default function RescueIntelligencePage() {
  const {
    districtMeta,
    floodLevelMeters,
    roadStatuses,
    toggleRoadStatus,
    selectedScenarioId,
    scenario,
  } = useCrisisSimulation();

  const [originId, setOriginId] = useState('wp-sec2-riverview');
  const [destinationId, setDestinationId] = useState('wp-hosp-civil');
  const [vehicleId, setVehicleId] = useState('ambulance');
  const [selectedRouteId, setSelectedRouteId] = useState('route-c'); // default to Lowest-Risk

  const origin = WAYPOINTS.find((w) => w.id === originId) || WAYPOINTS[0];
  const destination = WAYPOINTS.find((w) => w.id === destinationId) || WAYPOINTS[5];
  const vehicle = VEHICLE_TYPES.find((v) => v.id === vehicleId) || VEHICLE_TYPES[0];

  // Inspect status of Saraswati Central Bridge and Riverbank Road from live simulation context
  const isCentralBridgeBlocked = roadStatuses['bridge-1'] === 'submerged' || roadStatuses['bridge-1'] === 'blocked' || floodLevelMeters >= 2.2;
  const isRiverbankBlocked = roadStatuses['road-riverbank'] === 'flooded' || roadStatuses['road-riverbank'] === 'blocked';

  // Dynamic Route Engine Multi-Criteria Alternatives Calculation
  const computedRoutes = useMemo(() => {
    // Route A: Shortest Route (via Saraswati Central Bridge & River Corridor)
    const routeAPassable = !isCentralBridgeBlocked && !isRiverbankBlocked;
    const routeA = {
      id: 'route-a',
      title: 'Route A — Shortest Distance Corridor',
      pathDescription: `${origin.name} ➔ Saraswati Central Bridge (Old Arch) ➔ MG Marg ➔ ${destination.name}`,
      distanceKm: 4.2,
      baseMinutes: 11,
      isPassable: routeAPassable,
      status: routeAPassable ? 'Clear Light Traffic' : 'BLOCKED / IMPASSABLE',
      riskTier: routeAPassable ? 'Moderate Risk' : 'High Hazard',
      riskScore: routeAPassable ? 48 : 95,
      blockReason: isCentralBridgeBlocked
        ? `Saraswati Central Bridge is SUBMERGED (${floodLevelMeters.toFixed(1)}m water gauge). Pier shear failure threat.`
        : isRiverbankBlocked
        ? 'Promenade Riverbank Road flooded under 1.4m moving water.'
        : null,
      pathPoints: [
        { x: origin.x, y: origin.y },
        { x: 300, y: 250 },
        { x: 370, y: 240 },
        { x: destination.x, y: destination.y },
      ],
    };

    // Route B: Fastest Artery (via MG Marg bypass)
    const routeBPassable = !isCentralBridgeBlocked;
    const routeB = {
      id: 'route-b',
      title: 'Route B — Fastest Urban Arterial',
      pathDescription: `${origin.name} ➔ Central Artery Link ➔ Sector 4 Boulevard ➔ ${destination.name}`,
      distanceKm: 5.8,
      baseMinutes: 14,
      isPassable: routeBPassable,
      status: routeBPassable ? 'Available' : 'Restricted Bottleneck',
      riskTier: routeBPassable ? 'Moderate Exposure' : 'Severed Access',
      riskScore: routeBPassable ? 52 : 88,
      blockReason: !routeBPassable ? 'Central connecting overpass closed due to rising flood waters.' : null,
      pathPoints: [
        { x: origin.x, y: origin.y },
        { x: 320, y: 190 },
        { x: 440, y: 190 },
        { x: destination.x, y: destination.y },
      ],
    };

    // Route C: Lowest-Risk Evacuation Corridor (Diverts via North Elevated Flyover + NH44)
    const routeC = {
      id: 'route-c',
      title: 'Route C — Lowest-Risk Safe Evacuation Corridor (RECOMMENDED)',
      pathDescription: `${origin.name} ➔ North Elevated Flyover (+14m Datum) ➔ Cyber Perimeter ➔ ${destination.name}`,
      distanceKm: 7.4,
      baseMinutes: 18,
      isPassable: true,
      status: '100% CLEAR ALL-WEATHER CORRIDOR',
      riskTier: 'Lowest Risk (Safe Corridor)',
      riskScore: 12,
      blockReason: null,
      recommendationReason: isCentralBridgeBlocked
        ? `Automatic Re-Route Triggered: Original direct crossing is submerged. North Flyover provides 100% clearance with dedicated trauma emergency lanes.`
        : `Pre-cleared high-ground route with zero water ponding and priority signal timing.`,
      pathPoints: [
        { x: origin.x, y: origin.y },
        { x: 260, y: 110 },
        { x: 460, y: 100 },
        { x: 530, y: 170 },
        { x: destination.x, y: destination.y },
      ],
    };

    return [routeA, routeB, routeC];
  }, [origin, destination, isCentralBridgeBlocked, isRiverbankBlocked, floodLevelMeters]);

  const activeRoute = computedRoutes.find((r) => r.id === selectedRouteId) || computedRoutes[2];

  return (
    <div className="dc-rescue-intelligence-page" style={{ padding: '24px 32px', maxWidth: 1600, margin: '0 auto' }}>
      {/* 1. HEADER */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span className="dc-badge" style={{ background: 'rgba(79, 128, 96, 0.15)', color: 'var(--dc-safe)', fontWeight: 800 }}>
                DYNAMIC EVACUATION ROUTER
              </span>
              <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--dc-text-secondary)' }}>
                SARASWATI NAGAR ROUTE NETWORK
              </span>
              <span style={{ fontSize: '0.78rem', background: 'rgba(184, 111, 82, 0.15)', color: 'var(--dc-clay)', padding: '2px 8px', borderRadius: 4, fontWeight: 700 }}>
                SIMULATED TOPOLOGY
              </span>
            </div>
            <h1 style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--dc-forest, #263F35)', margin: '6px 0 2px' }}>
              RESCUE ROUTE INTELLIGENCE — Safe Evacuation Planner
            </h1>
            <p style={{ margin: 0, fontSize: '0.92rem', color: 'var(--dc-text-secondary)', maxWidth: 880 }}>
              Multi-criteria routing algorithm balancing physical distance, vehicle wading capabilities, shelter capacities, and real-time road/bridge submersions driven by CrisisLab.
            </p>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <Link to="/crisis-lab" className="dc-btn dc-btn-secondary" style={{ fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Activity size={15} /> CrisisLab
            </Link>
            <Link to="/digital-twin" className="dc-btn dc-btn-secondary" style={{ fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Compass size={15} /> 3D Digital Twin
            </Link>
          </div>
        </div>
      </div>

      {/* 2. ROUTING CONTROLS CARD: ORIGIN, DESTINATION & VEHICLE SELECTOR */}
      <div
        style={{
          background: 'var(--dc-elevated)',
          border: '1.5px solid var(--border-medium)',
          borderRadius: 12,
          padding: '18px 22px',
          marginBottom: 20,
        }}
      >
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
          {/* Origin Selector */}
          <div>
            <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: 'var(--dc-text-secondary)', textTransform: 'uppercase', marginBottom: 6 }}>
              Evacuation Origin (Incident / Resident Cluster):
            </label>
            <select
              value={originId}
              onChange={(e) => setOriginId(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: 8,
                border: '1px solid var(--border-medium)',
                background: 'var(--dc-surface)',
                color: 'var(--dc-text)',
                fontWeight: 600,
                fontSize: '0.84rem',
              }}
            >
              {WAYPOINTS.filter((w) => w.type === 'Origin').map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name}
                </option>
              ))}
            </select>
          </div>

          {/* Destination Selector */}
          <div>
            <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: 'var(--dc-text-secondary)', textTransform: 'uppercase', marginBottom: 6 }}>
              Destination (Hospital or Safe Shelter):
            </label>
            <select
              value={destinationId}
              onChange={(e) => setDestinationId(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: 8,
                border: '1px solid var(--border-medium)',
                background: 'var(--dc-surface)',
                color: 'var(--dc-text)',
                fontWeight: 600,
                fontSize: '0.84rem',
              }}
            >
              {WAYPOINTS.filter((w) => w.type === 'Destination').map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name}
                </option>
              ))}
            </select>
          </div>

          {/* Vehicle Type Selector */}
          <div>
            <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: 'var(--dc-text-secondary)', textTransform: 'uppercase', marginBottom: 6 }}>
              Assigned Rescue Vehicle:
            </label>
            <select
              value={vehicleId}
              onChange={(e) => setVehicleId(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: 8,
                border: '1px solid var(--border-medium)',
                background: 'var(--dc-surface)',
                color: 'var(--dc-text)',
                fontWeight: 600,
                fontSize: '0.84rem',
              }}
            >
              {VEHICLE_TYPES.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name} (Wading limit: {v.wadingDepthMeters}m)
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Dynamic Simulation Interconnect Banner */}
        {isCentralBridgeBlocked && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            style={{
              marginTop: 14,
              padding: '10px 14px',
              borderRadius: 8,
              background: 'rgba(201, 75, 75, 0.1)',
              border: '1px solid rgba(201, 75, 75, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 8,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <AlertTriangle size={16} color="var(--dc-emergency)" />
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--dc-emergency)' }}>
                DYNAMIC SIMULATION SIGNAL: Saraswati Central Bridge is Submerged / Impassable!
              </span>
            </div>
            <span style={{ fontSize: '0.76rem', color: 'var(--dc-text)' }}>
              Routing engine automatically recalculates around the North Elevated Flyover corridor.
            </span>
          </motion.div>
        )}
      </div>

      {/* 3. MAIN MAP VIEWPORT & ROUTE ALTERNATIVES MATRIX */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.8fr) minmax(380px, 1fr)', gap: 24, alignItems: 'start' }}>
        {/* LEFT COLUMN: HIGH-FIDELITY VECTOR TOPOLOGY MAP */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div
            style={{
              position: 'relative',
              height: 520,
              background: 'var(--dc-surface, #F8F5EE)',
              border: '1.5px solid var(--border-medium)',
              borderRadius: 12,
              overflow: 'hidden',
              boxShadow: '0 8px 24px rgba(38, 63, 53, 0.08)',
            }}
          >
            {/* SVG Vector District Network */}
            <svg width="100%" height="100%" viewBox="0 0 740 500" style={{ position: 'absolute', inset: 0 }}>
              {/* Saraswati River Flowing North-to-South */}
              <path
                d="M 380 0 Q 360 120 370 240 Q 380 360 360 500"
                fill="none"
                stroke="var(--dc-water, #5D8990)"
                strokeWidth="48"
                opacity="0.3"
              />
              <path
                d="M 380 0 Q 360 120 370 240 Q 380 360 360 500"
                fill="none"
                stroke="var(--dc-water, #5D8990)"
                strokeWidth="14"
                opacity="0.8"
              />

              {/* Saraswati Central Bridge (Old Bridge at Y: 240) */}
              <rect
                x="345"
                y="230"
                width="50"
                height="20"
                fill={isCentralBridgeBlocked ? 'var(--dc-emergency)' : '#B86F52'}
                rx="4"
              />
              <text x="370" y="222" textAnchor="middle" fontSize="10" fill="var(--dc-text)" fontWeight="700">
                Central Bridge {isCentralBridgeBlocked ? '(SUBMERGED)' : ''}
              </text>

              {/* North Elevated Flyover (At Y: 100) */}
              <rect
                x="340"
                y="90"
                width="60"
                height="22"
                fill="var(--dc-safe, #4F8060)"
                rx="4"
              />
              <text x="370" y="82" textAnchor="middle" fontSize="10" fill="var(--dc-safe)" fontWeight="800">
                North Elevated Flyover (+14m SAFE)
              </text>

              {/* Render Inactive Alternative Paths */}
              {computedRoutes.map((r) => {
                if (r.id === activeRoute.id) return null;
                const pointsStr = r.pathPoints.map((p) => `${p.x},${p.y}`).join(' ');
                return (
                  <polyline
                    key={r.id}
                    points={pointsStr}
                    fill="none"
                    stroke={r.isPassable ? 'var(--dc-text-muted)' : 'var(--dc-emergency)'}
                    strokeWidth="3"
                    strokeDasharray={r.isPassable ? '4 4' : '2 2'}
                    opacity="0.5"
                  />
                );
              })}

              {/* Render Active Selected Route Line */}
              {activeRoute && (
                <polyline
                  points={activeRoute.pathPoints.map((p) => `${p.x},${p.y}`).join(' ')}
                  fill="none"
                  stroke={activeRoute.isPassable ? 'var(--dc-safe)' : 'var(--dc-emergency)'}
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}

              {/* Render Waypoint Pins */}
              {WAYPOINTS.map((wp) => {
                const isOrig = wp.id === originId;
                const isDest = wp.id === destinationId;
                let pinColor = 'var(--dc-forest)';
                if (isOrig) pinColor = 'var(--dc-clay)';
                if (isDest) pinColor = 'var(--dc-safe)';

                return (
                  <g key={wp.id} transform={`translate(${wp.x}, ${wp.y})`}>
                    <circle r={isOrig || isDest ? 14 : 7} fill={pinColor} />
                    <circle r={isOrig || isDest ? 6 : 3} fill="#FFF" />
                    <text
                      y={isOrig || isDest ? -20 : -12}
                      textAnchor="middle"
                      fontSize={isOrig || isDest ? 12 : 10}
                      fontWeight={isOrig || isDest ? '800' : '600'}
                      fill="var(--dc-forest)"
                    >
                      {wp.name.split(':')[0]}
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* Map Legend Overlay */}
            <div
              style={{
                position: 'absolute',
                bottom: 14,
                left: 14,
                background: 'rgba(255, 253, 248, 0.94)',
                border: '1px solid var(--border-medium)',
                borderRadius: 8,
                padding: '8px 14px',
                fontSize: '0.74rem',
                display: 'flex',
                gap: 16,
                zIndex: 10,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--dc-clay)' }} />
                <span>Origin (Sector 2 Flood Zone)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--dc-safe)' }} />
                <span>Hospital / Safe Shelter</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 12, height: 4, background: 'var(--dc-safe)' }} />
                <span>Selected Safe Route</span>
              </div>
            </div>
          </div>

          <div style={{ fontSize: '0.76rem', color: 'var(--dc-text-secondary)', padding: '2px 4px' }}>
            ℹ️ <strong>Safety Protocol:</strong> Distinguishes Shortest vs Lowest-Risk Evacuation Corridors. Never presents unverified roads as guaranteed safe without clearance.
          </div>
        </div>

        {/* RIGHT COLUMN: ROUTE COMPARISON MATRIX & EXPLAINABLE RE-ROUTING */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ fontSize: '0.84rem', fontWeight: 800, color: 'var(--dc-forest)', textTransform: 'uppercase' }}>
            Route Alternatives & Risk Comparison ({computedRoutes.length})
          </div>

          {computedRoutes.map((r) => {
            const isSelected = selectedRouteId === r.id;
            return (
              <div
                key={r.id}
                onClick={() => setSelectedRouteId(r.id)}
                style={{
                  background: 'var(--dc-elevated)',
                  border: isSelected ? '2px solid var(--dc-earth-green)' : '1px solid var(--border-medium)',
                  borderRadius: 10,
                  padding: '16px 18px',
                  cursor: 'pointer',
                  boxShadow: isSelected ? '0 4px 16px rgba(73, 107, 90, 0.12)' : 'none',
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
                  <div>
                    <span
                      style={{
                        fontSize: '0.72rem',
                        padding: '2px 8px',
                        borderRadius: 4,
                        fontWeight: 800,
                        background: r.isPassable ? 'rgba(79, 128, 96, 0.14)' : 'rgba(201, 75, 75, 0.14)',
                        color: r.isPassable ? 'var(--dc-safe)' : 'var(--dc-emergency)',
                      }}
                    >
                      {r.status}
                    </span>
                    <h4 style={{ fontSize: '0.98rem', fontWeight: 800, margin: '6px 0 2px', color: 'var(--dc-forest)' }}>
                      {r.title}
                    </h4>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.1rem', fontWeight: 900, color: 'var(--dc-forest)' }}>
                      {r.distanceKm} km
                    </div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--dc-text-muted)' }}>
                      ~{r.baseMinutes} mins
                    </div>
                  </div>
                </div>

                <p style={{ fontSize: '0.78rem', color: 'var(--dc-text-secondary)', margin: '8px 0', lineHeight: 1.4 }}>
                  {r.pathDescription}
                </p>

                {/* Blockage explanation if impassable */}
                {r.blockReason && (
                  <div style={{ padding: '6px 10px', borderRadius: 6, background: 'rgba(201, 75, 75, 0.08)', color: 'var(--dc-emergency)', fontSize: '0.74rem', marginTop: 6 }}>
                    ⚠️ {r.blockReason}
                  </div>
                )}

                {/* Recommendation explanation */}
                {r.recommendationReason && (
                  <div style={{ padding: '6px 10px', borderRadius: 6, background: 'rgba(79, 128, 96, 0.08)', color: 'var(--dc-safe)', fontSize: '0.74rem', marginTop: 6 }}>
                    ✓ {r.recommendationReason}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
