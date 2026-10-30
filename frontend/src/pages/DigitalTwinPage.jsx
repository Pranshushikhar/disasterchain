import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Building2,
  Layers,
  Shield,
  Compass,
  Info,
  Activity,
  ExternalLink,
} from 'lucide-react';
import { useCrisisSimulation } from '../context/CrisisSimulationContext';
import DigitalTwin3DCanvas from '../components/DigitalTwin3DCanvas';
import { Link } from 'react-router-dom';

export default function DigitalTwinPage() {
  const {
    districtMeta,
    floodLevelMeters,
    roadStatuses,
    buildings,
    facilities,
    selectedScenarioId,
    scenario,
  } = useCrisisSimulation();

  const [selectedBuilding, setSelectedBuilding] = useState(() => buildings[0]);
  const [activeLayers, setActiveLayers] = useState({
    infrastructure: true,
    hazards: true,
    waterPlane: true,
    evacRoutes: true,
  });

  const toggleLayer = (layerKey) => {
    setActiveLayers((prev) => ({ ...prev, [layerKey]: !prev[layerKey] }));
  };

  // Compute explainable risk assessment for selected building
  const calculateBuildingRisk = (bld) => {
    if (!bld) return null;

    let floodScore = bld.floodRisk || 30;
    // Adjust based on live river gauge
    if (floodLevelMeters > 2.0 && (bld.sector === 'sec-2' || bld.sector === 'sec-1')) {
      floodScore = Math.min(99, floodScore + 25);
    }

    let seismicScore = bld.seismicRisk || 45;

    let compositeRisk = Math.round(floodScore * 0.55 + seismicScore * 0.45);
    let riskTier = 'Low Exposure';
    let riskColor = 'var(--dc-safe)';

    if (compositeRisk >= 75) {
      riskTier = 'Critical Threat';
      riskColor = 'var(--dc-emergency)';
    } else if (compositeRisk >= 50) {
      riskTier = 'Elevated Risk';
      riskColor = 'var(--dc-warning)';
    } else if (compositeRisk >= 30) {
      riskTier = 'Moderate Caution';
      riskColor = 'var(--dc-earth-green)';
    }

    const reasons = [
      `Sector Location: ${bld.sector?.toUpperCase()} (${bld.sector === 'sec-2' ? 'Lowland River Embankment' : 'Urban Sector'}).`,
      `Construction Material: ${bld.material} (${bld.material.includes('Masonry') ? 'Vulnerable to shear deformation' : 'Engineered frame'}).`,
      `Occupancy Load: ${bld.occupants} individuals during normal hours.`,
      `Live River Hydro-Gauge: ${floodLevelMeters.toFixed(2)}m (Bridge 1: ${(roadStatuses['bridge-1'] || 'vulnerable').toUpperCase()}).`,
    ];

    return {
      compositeRisk,
      riskTier,
      riskColor,
      floodScore,
      seismicScore,
      reasons,
    };
  };

  const riskAssessment = calculateBuildingRisk(selectedBuilding);

  return (
    <div className="dc-digital-twin-page" style={{ padding: '24px 32px', maxWidth: 1600, margin: '0 auto' }}>
      {/* 1. HEADER */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span className="dc-badge" style={{ background: 'rgba(73, 107, 90, 0.14)', color: 'var(--dc-earth-green)', fontWeight: 800 }}>
                3D SPATIAL TWIN
              </span>
              <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--dc-text-secondary)' }}>
                SARASWATI NAGAR URBAN SPATIAL MODEL
              </span>
              <span style={{ fontSize: '0.78rem', background: 'rgba(184, 111, 82, 0.15)', color: 'var(--dc-clay)', padding: '2px 8px', borderRadius: 4, fontWeight: 700 }}>
                SIMULATED DATA
              </span>
            </div>
            <h1 style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--dc-forest, #263F35)', margin: '6px 0 2px' }}>
              DIGITAL TWIN — Interactive 3D Disaster-Aware City
            </h1>
            <p style={{ margin: 0, fontSize: '0.92rem', color: 'var(--dc-text-secondary)', maxWidth: 880 }}>
              Interactive 3D WebGL digital twin displaying multi-tier infrastructure, structural vulnerabilities, and dynamic hydrological flood dynamics synchronized with CrisisLab simulation state.
            </p>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <Link to="/crisis-lab" className="dc-btn dc-btn-secondary" style={{ fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Activity size={15} /> CrisisLab Sim
            </Link>
            <Link to="/rescue-intelligence" className="dc-btn dc-btn-primary" style={{ fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: 6, background: 'var(--dc-forest)', color: '#FFF' }}>
              <Compass size={15} /> Route Planner
            </Link>
          </div>
        </div>
      </div>

      {/* 2. MAIN 3D VIEWPORT & INSPECTION SIDEBAR */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.8fr) minmax(360px, 1fr)', gap: 24, alignItems: 'start' }}>
        {/* LEFT COLUMN: 3D THREE.JS CANVAS & LAYER TOGGLE BAR */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Layer Toggles Bar */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'var(--dc-elevated)',
              border: '1.5px solid var(--border-medium)',
              borderRadius: 10,
              padding: '10px 16px',
              flexWrap: 'wrap',
              gap: 10,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.82rem', fontWeight: 700, color: 'var(--dc-forest)' }}>
              <Layers size={16} /> Spatial Layers:
            </div>

            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {[
                { key: 'infrastructure', label: 'Critical Assets' },
                { key: 'hazards', label: 'Flood Contours' },
                { key: 'waterPlane', label: 'Dynamic River Flow' },
                { key: 'evacRoutes', label: 'Bridge Corridors' },
              ].map(({ key, label }) => {
                const active = activeLayers[key];
                return (
                  <button
                    key={key}
                    onClick={() => toggleLayer(key)}
                    style={{
                      fontSize: '0.76rem',
                      fontWeight: 600,
                      padding: '4px 10px',
                      borderRadius: 6,
                      border: active ? '1px solid var(--dc-earth-green)' : '1px solid var(--border-subtle)',
                      background: active ? 'rgba(73, 107, 90, 0.12)' : 'var(--dc-surface)',
                      color: active ? 'var(--dc-forest)' : 'var(--dc-text-muted)',
                      cursor: 'pointer',
                    }}
                  >
                    {active ? '✓ ' : ''}{label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3D WebGL Canvas Card */}
          <div
            style={{
              background: 'var(--dc-elevated)',
              border: '1.5px solid var(--border-medium)',
              borderRadius: 12,
              overflow: 'hidden',
              boxShadow: '0 8px 24px rgba(38, 63, 53, 0.08)',
              height: 600,
            }}
          >
            <DigitalTwin3DCanvas
              onSelectBuilding={(bld) => setSelectedBuilding(bld)}
              selectedBuildingId={selectedBuilding?.id}
              activeLayers={activeLayers}
            />
          </div>

          {/* Orbit Instructions & Mandatory Engineering Disclaimer */}
          <div
            style={{
              background: 'var(--dc-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 8,
              padding: '10px 14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '0.76rem',
              color: 'var(--dc-text-secondary)',
            }}
          >
            <span>
              🖱️ <strong>Controls:</strong> Left-click & drag to rotate orbit • Scroll wheel to zoom • Click building to inspect telemetry.
            </span>
            <span style={{ fontStyle: 'italic', color: 'var(--dc-text-muted)' }}>
              Non-authoritative simulated structural risk model.
            </span>
          </div>
        </div>

        {/* RIGHT COLUMN: DETAILED BUILDING / INFRASTRUCTURE INSPECTION CARD */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {selectedBuilding ? (
            <div
              style={{
                background: 'var(--dc-elevated)',
                border: '1.5px solid var(--border-medium)',
                borderRadius: 12,
                padding: '22px 24px',
                boxShadow: '0 4px 16px rgba(38, 63, 53, 0.05)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, borderBottom: '1px solid var(--border-subtle)', paddingBottom: 14 }}>
                <div>
                  <span className="dc-badge" style={{ background: 'var(--dc-surface-2)', color: 'var(--dc-forest)', fontWeight: 800, fontSize: '0.72rem' }}>
                    {selectedBuilding.isCritical ? 'CRITICAL ASSET' : 'URBAN STRUCTURE'}
                  </span>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '6px 0 2px', color: 'var(--dc-forest)' }}>
                    {selectedBuilding.name}
                  </h3>
                  <span style={{ fontSize: '0.8rem', color: 'var(--dc-text-secondary)' }}>
                    Sector: {selectedBuilding.sector?.toUpperCase()} • ID: {selectedBuilding.id}
                  </span>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--dc-text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                    Risk Tier
                  </div>
                  <div style={{ fontSize: '0.92rem', fontWeight: 800, color: riskAssessment?.riskColor }}>
                    {riskAssessment?.riskTier}
                  </div>
                </div>
              </div>

              {/* Exposure Ratings Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, margin: '18px 0' }}>
                <div style={{ background: 'var(--dc-surface)', padding: '12px 14px', borderRadius: 8, border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--dc-text-secondary)', fontWeight: 700 }}>
                    Flood Exposure
                  </div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginTop: 4 }}>
                    <span style={{ fontSize: '1.4rem', fontWeight: 900, color: riskAssessment?.floodScore > 70 ? 'var(--dc-emergency)' : 'var(--dc-water)' }}>
                      {riskAssessment?.floodScore}%
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--dc-text-muted)' }}>Hydro-risk</span>
                  </div>
                </div>

                <div style={{ background: 'var(--dc-surface)', padding: '12px 14px', borderRadius: 8, border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--dc-text-secondary)', fontWeight: 700 }}>
                    Seismic Vulnerability
                  </div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginTop: 4 }}>
                    <span style={{ fontSize: '1.4rem', fontWeight: 900, color: riskAssessment?.seismicScore > 70 ? 'var(--dc-emergency)' : 'var(--dc-earth-green)' }}>
                      {riskAssessment?.seismicScore}%
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--dc-text-muted)' }}>Shear load</span>
                  </div>
                </div>
              </div>

              {/* Physical Specifications */}
              <div style={{ background: 'var(--dc-surface-2)', padding: '14px 16px', borderRadius: 8, marginBottom: 18 }}>
                <div style={{ fontSize: '0.76rem', fontWeight: 800, color: 'var(--dc-forest)', textTransform: 'uppercase', marginBottom: 8 }}>
                  Structural Attributes & Capacity
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: '0.8rem' }}>
                  <div>
                    <span style={{ color: 'var(--dc-text-secondary)' }}>Material: </span>
                    <strong>{selectedBuilding.material}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--dc-text-secondary)' }}>Est. Occupants: </span>
                    <strong>{selectedBuilding.occupants}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--dc-text-secondary)' }}>Height: </span>
                    <strong>{selectedBuilding.height || 20} meters</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--dc-text-secondary)' }}>Base Elevation: </span>
                    <strong>214m datum</strong>
                  </div>
                </div>
              </div>

              {/* Explainable Risk Reasoning */}
              <div style={{ marginBottom: 18 }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--dc-forest)', textTransform: 'uppercase', marginBottom: 6 }}>
                  Explainable Risk Factors:
                </div>
                <ul style={{ margin: 0, paddingLeft: 18, fontSize: '0.8rem', color: 'var(--dc-text)', lineHeight: 1.6 }}>
                  {riskAssessment?.reasons.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              </div>

              {/* Mandatory Ethical Notice */}
              <div
                style={{
                  background: 'rgba(184, 111, 82, 0.08)',
                  border: '1px solid rgba(184, 111, 82, 0.25)',
                  borderRadius: 6,
                  padding: '8px 12px',
                  fontSize: '0.74rem',
                  color: 'var(--dc-clay)',
                  lineHeight: 1.4,
                }}
              >
                ⚠️ <strong>Simulated Heuristic Model:</strong> Digital Twin scores are mathematical training approximations. They do not constitute official certified structural engineering inspections.
              </div>
            </div>
          ) : (
            <div style={{ padding: 24, background: 'var(--dc-elevated)', borderRadius: 12, border: '1px solid var(--border-medium)', textAlign: 'center' }}>
              Select any building in the 3D scene to inspect structural risk data.
            </div>
          )}

          {/* Quick Building Directory */}
          <div
            style={{
              background: 'var(--dc-elevated)',
              border: '1.5px solid var(--border-medium)',
              borderRadius: 12,
              padding: '18px 20px',
            }}
          >
            <div style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--dc-forest)', textTransform: 'uppercase', marginBottom: 10 }}>
              Saraswati Nagar Critical Directory ({buildings.length} Assets)
            </div>
            <div style={{ maxHeight: 220, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 6 }}>
              {buildings.map((bld) => {
                const isSelected = selectedBuilding?.id === bld.id;
                return (
                  <button
                    key={bld.id}
                    onClick={() => setSelectedBuilding(bld)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 12px',
                      borderRadius: 6,
                      border: isSelected ? '1px solid var(--dc-earth-green)' : '1px solid var(--border-subtle)',
                      background: isSelected ? 'rgba(73, 107, 90, 0.12)' : 'var(--dc-surface)',
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.8rem', fontWeight: 700, color: isSelected ? 'var(--dc-forest)' : 'var(--dc-text)' }}>
                        {bld.name}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--dc-text-muted)' }}>
                        {bld.sector?.toUpperCase()} • {bld.occupants} occupants
                      </div>
                    </div>
                    <span style={{ fontSize: '0.74rem', fontWeight: 700, color: bld.floodRisk > 70 ? 'var(--dc-emergency)' : 'var(--dc-earth-green)' }}>
                      {bld.floodRisk}% Flood
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
