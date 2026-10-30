import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  Pause,
  RotateCcw,
  Activity,
  AlertTriangle,
  LifeBuoy,
  Truck,
  Users,
  Compass,
  Sparkles,
  FileText,
  Clock,
  Radio,
  Building,
  CheckCircle2,
} from 'lucide-react';
import { useCrisisSimulation } from '../context/CrisisSimulationContext';
import AfterActionReportModal from '../components/AfterActionReportModal';
import { Link } from 'react-router-dom';

export default function CrisisLabPage() {
  const {
    districtMeta,
    allScenarios,
    selectedScenarioId,
    scenario,
    switchScenario,
    isRunning,
    simSpeed,
    elapsedSeconds,
    startSimulation,
    pauseSimulation,
    resetSimulation,
    changeSpeed,
    floodLevelMeters,
    rainfallRate,
    windSpeed,
    incidents,
    resources,
    selectedIncidentId,
    setSelectedIncidentId,
    assignResource,
    dispatchBoat,
    dispatchAmbulance,
    resolveIncident,
    triggerWhatIf,
    activeWhatIfs,
    askAIAdvisor,
    advisorData,
    advisorLoading,
    eventFeed,
    decisions,
    calculateScore,
    roadStatuses,
  } = useCrisisSimulation();

  const [isReportOpen, setIsReportOpen] = useState(false);
  const [customAdvisorQuery, setCustomAdvisorQuery] = useState('');
  const [activeTab, setActiveTab] = useState('incidents'); // 'incidents' | 'whatif' | 'advisor'

  const formatSeconds = (sec) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${mins < 10 ? '0' : ''}${mins}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleAdvisorSubmit = (e) => {
    e.preventDefault();
    if (!customAdvisorQuery.trim()) return;
    askAIAdvisor(customAdvisorQuery);
  };

  const activeIncidentsList = incidents.filter((i) => i.status !== 'Resolved');
  const resolvedIncidentsList = incidents.filter((i) => i.status === 'Resolved');
  const availableResourcesList = resources.filter((r) => r.status === 'Available');

  return (
    <div className="dc-crisislab-page" style={{ padding: '24px 32px', maxWidth: 1600, margin: '0 auto' }}>
      {/* 1. TOP HEADER & SIMULATION DISCLAIMER BAR */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span className="dc-badge dc-badge-emergency" style={{ fontSize: '0.75rem', fontWeight: 700, padding: '4px 10px' }}>
                LIVE COMMAND LAB
              </span>
              <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--dc-text-secondary)' }}>
                DISTRICT: {districtMeta.name.toUpperCase()} (SIMULATED)
              </span>
              <span style={{ fontSize: '0.78rem', background: 'rgba(184, 111, 82, 0.15)', color: 'var(--dc-clay)', padding: '2px 8px', borderRadius: 4, fontWeight: 700 }}>
                TRAINING ENVIRONMENT
              </span>
            </div>
            <h1 style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--dc-forest, #263F35)', margin: '6px 0 2px', letterSpacing: '-0.02em' }}>
              CRISISLAB — Interactive Emergency Command Simulation
            </h1>
            <p style={{ margin: 0, fontSize: '0.92rem', color: 'var(--dc-text-secondary)', maxWidth: 850 }}>
              Operate real-time disaster contingencies across Saraswati Nagar. Deterministic hydrologic, seismic and industrial state engine synchronized across 3D Digital Twin, Dynamic Evacuation Routing and Resource Coordination.
            </p>
          </div>

          {/* Quick Nav to other flagships */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <Link to="/digital-twin" className="dc-btn dc-btn-secondary" style={{ fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Building size={15} /> 3D Digital Twin
            </Link>
            <Link to="/rescue-intelligence" className="dc-btn dc-btn-secondary" style={{ fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Compass size={15} /> Evac Routes
            </Link>
            <Link to="/rescue-network" className="dc-btn dc-btn-secondary" style={{ fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Truck size={15} /> Resource Fleet
            </Link>
            <button
              onClick={() => setIsReportOpen(true)}
              className="dc-btn dc-btn-primary"
              style={{ fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: 6, background: 'var(--dc-earth-green)', color: '#FFF' }}
            >
              <FileText size={15} /> After-Action Report
            </button>
          </div>
        </div>
      </div>

      {/* 2. SCENARIO SELECTOR & TIMELINE CONTROLS BAR */}
      <div
        style={{
          background: 'var(--dc-elevated, #FFFDF8)',
          border: '1.5px solid var(--border-medium)',
          borderRadius: 12,
          padding: '16px 20px',
          marginBottom: 24,
          boxShadow: '0 4px 16px rgba(38, 63, 53, 0.05)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          {/* Scenario Tabs */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--dc-text-secondary)', textTransform: 'uppercase' }}>
              Scenario:
            </span>
            {allScenarios.map((sc) => {
              const active = sc.id === selectedScenarioId;
              return (
                <button
                  key={sc.id}
                  onClick={() => switchScenario(sc.id)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: 8,
                    fontSize: '0.82rem',
                    fontWeight: active ? 700 : 500,
                    border: active ? '1.5px solid var(--dc-forest)' : '1px solid var(--border-subtle)',
                    background: active ? 'var(--dc-forest)' : 'var(--dc-surface)',
                    color: active ? '#FFF' : 'var(--dc-text)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {sc.title}
                </button>
              );
            })}
          </div>

          {/* Engine Controls (Play / Pause / Speed / Restart) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--dc-surface-2)', padding: '4px 10px', borderRadius: 8 }}>
              <Clock size={16} color="var(--dc-forest)" />
              <span style={{ fontFamily: 'monospace', fontWeight: 800, fontSize: '1.1rem', color: 'var(--dc-forest)' }}>
                {formatSeconds(elapsedSeconds)}
              </span>
            </div>

            {/* Play/Pause Button */}
            {isRunning ? (
              <button
                onClick={pauseSimulation}
                className="dc-btn"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  background: 'var(--dc-warning, #C38A35)',
                  color: '#FFF',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: 8,
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                <Pause size={16} /> Pause
              </button>
            ) : (
              <button
                onClick={startSimulation}
                className="dc-btn"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  background: 'var(--dc-safe, #4F8060)',
                  color: '#FFF',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: 8,
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                <Play size={16} /> {elapsedSeconds > 0 ? 'Resume' : 'Start Simulation'}
              </button>
            )}

            {/* Speed Multiplier Controls */}
            <div style={{ display: 'flex', gap: 4 }}>
              {[1, 2, 5].map((spd) => (
                <button
                  key={spd}
                  onClick={() => changeSpeed(spd)}
                  style={{
                    padding: '6px 10px',
                    borderRadius: 6,
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    border: '1px solid var(--border-medium)',
                    background: simSpeed === spd ? 'var(--dc-earth-green)' : 'var(--dc-surface)',
                    color: simSpeed === spd ? '#FFF' : 'var(--dc-text)',
                  }}
                >
                  {spd}x
                </button>
              ))}
            </div>

            {/* Reset Button */}
            <button
              onClick={() => resetSimulation()}
              title="Reset Simulation to Initial Conditions"
              style={{
                background: 'var(--dc-surface)',
                border: '1px solid var(--border-medium)',
                borderRadius: 8,
                padding: '8px',
                cursor: 'pointer',
                color: 'var(--dc-text-secondary)',
              }}
            >
              <RotateCcw size={16} />
            </button>
          </div>
        </div>

        {/* Real-time Environmental Gauge Cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: 12,
            marginTop: 16,
            paddingTop: 14,
            borderTop: '1px solid var(--border-subtle)',
          }}
        >
          <div style={{ background: 'var(--dc-surface)', padding: '10px 14px', borderRadius: 8 }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--dc-text-secondary)', fontWeight: 700, textTransform: 'uppercase' }}>
              Saraswati River Level
            </span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 2 }}>
              <span style={{ fontSize: '1.4rem', fontWeight: 900, color: floodLevelMeters >= 2.2 ? 'var(--dc-emergency)' : 'var(--dc-water)' }}>
                {floodLevelMeters.toFixed(2)} m
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--dc-text-muted)' }}>
                {floodLevelMeters >= 2.2 ? 'Bridge Submerged' : 'Normal: < 1.8m'}
              </span>
            </div>
          </div>

          <div style={{ background: 'var(--dc-surface)', padding: '10px 14px', borderRadius: 8 }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--dc-text-secondary)', fontWeight: 700, textTransform: 'uppercase' }}>
              Precipitation Intensity
            </span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 2 }}>
              <span style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--dc-forest)' }}>
                {rainfallRate} mm/h
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--dc-text-muted)' }}>
                {rainfallRate > 80 ? 'Violent Cloudburst' : 'Monsoon Squall'}
              </span>
            </div>
          </div>

          <div style={{ background: 'var(--dc-surface)', padding: '10px 14px', borderRadius: 8 }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--dc-text-secondary)', fontWeight: 700, textTransform: 'uppercase' }}>
              Central Bridge Status
            </span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 2 }}>
              <span
                style={{
                  fontSize: '1.1rem',
                  fontWeight: 800,
                  color: roadStatuses['bridge-1'] === 'open' ? 'var(--dc-safe)' : 'var(--dc-emergency)',
                }}
              >
                {(roadStatuses['bridge-1'] || 'vulnerable').toUpperCase()}
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--dc-text-muted)' }}>
                Old Masonry Arch
              </span>
            </div>
          </div>

          <div style={{ background: 'var(--dc-surface)', padding: '10px 14px', borderRadius: 8 }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--dc-text-secondary)', fontWeight: 700, textTransform: 'uppercase' }}>
              Tactical Response Score
            </span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 2 }}>
              <span style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--dc-safe)' }}>
                {calculateScore()} / 100
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--dc-text-muted)' }}>
                {decisions.length} commands logged
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. MAIN COMMAND TWO-COLUMN GRID */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.6fr) minmax(0, 1.1fr)', gap: 24, alignItems: 'start' }}>
        {/* LEFT COLUMN: COMMAND DECISIONS, INCIDENTS & WHAT-IF ENGINE */}
        <div>
          {/* Sub-tab navigation */}
          <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
            <button
              onClick={() => setActiveTab('incidents')}
              className={`dc-tab-btn ${activeTab === 'incidents' ? 'active' : ''}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '10px 18px',
                borderRadius: 8,
                fontSize: '0.86rem',
                fontWeight: 700,
                border: activeTab === 'incidents' ? '1.5px solid var(--dc-forest)' : '1px solid var(--border-medium)',
                background: activeTab === 'incidents' ? 'var(--dc-forest)' : 'var(--dc-elevated)',
                color: activeTab === 'incidents' ? '#FFF' : 'var(--dc-text)',
                cursor: 'pointer',
              }}
            >
              <AlertTriangle size={16} /> Active Incidents & SOS ({activeIncidentsList.length})
            </button>

            <button
              onClick={() => setActiveTab('whatif')}
              className={`dc-tab-btn ${activeTab === 'whatif' ? 'active' : ''}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '10px 18px',
                borderRadius: 8,
                fontSize: '0.86rem',
                fontWeight: 700,
                border: activeTab === 'whatif' ? '1.5px solid var(--dc-forest)' : '1px solid var(--border-medium)',
                background: activeTab === 'whatif' ? 'var(--dc-forest)' : 'var(--dc-elevated)',
                color: activeTab === 'whatif' ? '#FFF' : 'var(--dc-text)',
                cursor: 'pointer',
              }}
            >
              <Activity size={16} /> What-If Stress Testing ({activeWhatIfs.length} Active)
            </button>
          </div>

          {/* TAB 1: INCIDENTS & TACTICAL DISPATCH */}
          {activeTab === 'incidents' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {activeIncidentsList.length === 0 ? (
                <div
                  style={{
                    padding: 36,
                    textAlign: 'center',
                    background: 'var(--dc-elevated)',
                    border: '1px dashed var(--border-medium)',
                    borderRadius: 12,
                  }}
                >
                  <CheckCircle2 size={36} color="var(--dc-safe)" style={{ margin: '0 auto 12px' }} />
                  <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--dc-forest)' }}>All Logged Incidents Resolved!</h3>
                  <p style={{ margin: '6px 0 0', fontSize: '0.85rem', color: 'var(--dc-text-secondary)' }}>
                    Advance simulation time or trigger what-if contingencies to simulate new secondary emergencies.
                  </p>
                </div>
              ) : (
                activeIncidentsList.map((inc) => {
                  const isCritical = inc.severity === 'Critical' || inc.severity === 'High';
                  const assignedResList = (inc.assignedResources || [])
                    .map((rId) => resources.find((r) => r.id === rId))
                    .filter(Boolean);

                  return (
                    <div
                      key={inc.id}
                      style={{
                        background: 'var(--dc-elevated)',
                        border: isCritical ? '1.5px solid rgba(201, 75, 75, 0.4)' : '1px solid var(--border-medium)',
                        borderRadius: 12,
                        padding: '18px 20px',
                        boxShadow: '0 3px 12px rgba(38, 63, 53, 0.04)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span
                              className={`dc-badge ${isCritical ? 'dc-badge-emergency' : 'dc-badge-warning'}`}
                              style={{ fontSize: '0.72rem', fontWeight: 800 }}
                            >
                              {inc.severity?.toUpperCase()} TIER
                            </span>
                            <span style={{ fontSize: '0.78rem', color: 'var(--dc-text-muted)' }}>
                              ID: {inc.id.toUpperCase()}
                            </span>
                            <span style={{ fontSize: '0.78rem', color: 'var(--dc-forest)', fontWeight: 600 }}>
                              Sector: {inc.sector?.toUpperCase() || 'Saraswati Nagar'}
                            </span>
                          </div>
                          <h3 style={{ fontSize: '1.12rem', fontWeight: 800, margin: '6px 0 4px', color: 'var(--dc-forest)' }}>
                            {inc.title}
                          </h3>
                          <p style={{ fontSize: '0.85rem', color: 'var(--dc-text)', margin: '0 0 10px', lineHeight: 1.5 }}>
                            {inc.description}
                          </p>
                        </div>

                        {/* Status Badge */}
                        <span
                          style={{
                            fontSize: '0.75rem',
                            padding: '4px 10px',
                            borderRadius: 6,
                            fontWeight: 700,
                            background: inc.status === 'In Progress' ? 'rgba(79, 128, 96, 0.15)' : 'rgba(195, 138, 53, 0.15)',
                            color: inc.status === 'In Progress' ? 'var(--dc-safe)' : 'var(--dc-warning)',
                          }}
                        >
                          {inc.status}
                        </span>
                      </div>

                      {/* Capabilities required */}
                      {inc.requiredCapabilities && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
                          {inc.requiredCapabilities.map((cap, cIdx) => (
                            <span
                              key={cIdx}
                              style={{
                                fontSize: '0.72rem',
                                padding: '2px 8px',
                                borderRadius: 4,
                                background: 'var(--dc-surface-2)',
                                color: 'var(--dc-text-secondary)',
                                fontWeight: 600,
                              }}
                            >
                              {cap}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Assigned Resources List */}
                      {assignedResList.length > 0 && (
                        <div style={{ marginBottom: 14, padding: '8px 12px', borderRadius: 6, background: 'var(--dc-surface)', border: '1px solid var(--border-subtle)' }}>
                          <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--dc-earth-green)', textTransform: 'uppercase' }}>
                            Deployed Responders:
                          </span>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
                            {assignedResList.map((res) => (
                              <span
                                key={res.id}
                                style={{
                                  fontSize: '0.78rem',
                                  padding: '3px 8px',
                                  borderRadius: 4,
                                  background: 'rgba(79, 128, 96, 0.12)',
                                  color: 'var(--dc-safe)',
                                  fontWeight: 700,
                                }}
                              >
                                {res.name} ({res.type})
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* TACTICAL COMMAND ACTION BUTTONS */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-subtle)', paddingTop: 12, flexWrap: 'wrap', gap: 8 }}>
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                          {/* Dispatch Boat */}
                          <button
                            onClick={() => dispatchBoat(inc.id)}
                            className="dc-btn dc-btn-secondary"
                            style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem', padding: '6px 12px' }}
                          >
                            <LifeBuoy size={14} /> Dispatch Boat
                          </button>

                          {/* Dispatch Ambulance */}
                          <button
                            onClick={() => dispatchAmbulance(inc.id)}
                            className="dc-btn dc-btn-secondary"
                            style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem', padding: '6px 12px' }}
                          >
                            <Truck size={14} /> Dispatch Ambulance
                          </button>

                          {/* Quick Assign NDRF */}
                          <button
                            onClick={() => {
                              const avail = availableResourcesList.find((r) => r.type === 'Rescue Team');
                              if (avail) assignResource(inc.id, avail.id);
                            }}
                            className="dc-btn dc-btn-secondary"
                            style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem', padding: '6px 12px' }}
                          >
                            <Users size={14} /> Assign NDRF Squad
                          </button>
                        </div>

                        {/* Mark Resolved */}
                        <button
                          onClick={() => resolveIncident(inc.id)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                            fontSize: '0.78rem',
                            padding: '6px 14px',
                            background: 'var(--dc-forest)',
                            color: '#FFF',
                            borderRadius: 6,
                            border: 'none',
                            fontWeight: 700,
                            cursor: 'pointer',
                          }}
                        >
                          <CheckCircle2 size={14} /> Resolve Incident
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* TAB 2: WHAT-IF CONTINGENCY SANDBOX */}
          {activeTab === 'whatif' && (
            <div
              style={{
                background: 'var(--dc-elevated)',
                border: '1.5px solid var(--border-medium)',
                borderRadius: 12,
                padding: '20px 24px',
              }}
            >
              <div style={{ marginBottom: 16 }}>
                <span className="dc-badge dc-badge-warning" style={{ fontSize: '0.72rem', fontWeight: 800 }}>
                  WHAT-IF STRESS EXPERIMENTS
                </span>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '6px 0 2px', color: 'var(--dc-forest)' }}>
                  Simulated Contingency Testing Engine
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--dc-text-secondary)', margin: 0 }}>
                  Simulate cascading failures and external shocks. Evaluate how the Saraswati Nagar ecosystem adapts.
                </p>
              </div>

              {/* Experiment Triggers Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12, marginBottom: 20 }}>
                <button
                  onClick={() => triggerWhatIf('DOUBLE_RAINFALL')}
                  className="dc-btn"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    padding: 14,
                    background: activeWhatIfs.includes('DOUBLE_RAINFALL') ? 'rgba(93, 137, 144, 0.15)' : 'var(--dc-surface)',
                    border: activeWhatIfs.includes('DOUBLE_RAINFALL') ? '1.5px solid var(--dc-water)' : '1px solid var(--border-subtle)',
                    borderRadius: 8,
                    textAlign: 'left',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, color: 'var(--dc-water)', fontSize: '0.88rem' }}>
                    <Activity size={16} /> Double Rainfall (+100%)
                  </div>
                  <span style={{ fontSize: '0.76rem', color: 'var(--dc-text-secondary)', marginTop: 4 }}>
                    Simulate cloudburst (120mm/h) and accelerate river level surge.
                  </span>
                </button>

                <button
                  onClick={() => triggerWhatIf('BRIDGE_COLLAPSE')}
                  className="dc-btn"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    padding: 14,
                    background: activeWhatIfs.includes('BRIDGE_COLLAPSE') ? 'rgba(201, 75, 75, 0.15)' : 'var(--dc-surface)',
                    border: activeWhatIfs.includes('BRIDGE_COLLAPSE') ? '1.5px solid var(--dc-emergency)' : '1px solid var(--border-subtle)',
                    borderRadius: 8,
                    textAlign: 'left',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, color: 'var(--dc-emergency)', fontSize: '0.88rem' }}>
                    <AlertTriangle size={16} /> Bridge Collapse Shock
                  </div>
                  <span style={{ fontSize: '0.76rem', color: 'var(--dc-text-secondary)', marginTop: 4 }}>
                    Force pier structural shear on Central Bridge, severing primary artery.
                  </span>
                </button>

                <button
                  onClick={() => triggerWhatIf('SHELTER_CLOSURE')}
                  className="dc-btn"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    padding: 14,
                    background: activeWhatIfs.includes('SHELTER_CLOSURE') ? 'rgba(195, 138, 53, 0.15)' : 'var(--dc-surface)',
                    border: activeWhatIfs.includes('SHELTER_CLOSURE') ? '1.5px solid var(--dc-warning)' : '1px solid var(--border-subtle)',
                    borderRadius: 8,
                    textAlign: 'left',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, color: 'var(--dc-warning)', fontSize: '0.88rem' }}>
                    <Building size={16} /> Stadium Shelter Closure
                  </div>
                  <span style={{ fontSize: '0.76rem', color: 'var(--dc-text-secondary)', marginTop: 4 }}>
                    Electrical transformer flood trips stadium; displace 1,260 evacuees.
                  </span>
                </button>

                <button
                  onClick={() => triggerWhatIf('DELAYED_RESCUE')}
                  className="dc-btn"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    padding: 14,
                    background: activeWhatIfs.includes('DELAYED_RESCUE') ? 'rgba(184, 111, 82, 0.15)' : 'var(--dc-surface)',
                    border: activeWhatIfs.includes('DELAYED_RESCUE') ? '1.5px solid var(--dc-clay)' : '1px solid var(--border-subtle)',
                    borderRadius: 8,
                    textAlign: 'left',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, color: 'var(--dc-clay)', fontSize: '0.88rem' }}>
                    <Clock size={16} /> Convoy Delay (+45m)
                  </div>
                  <span style={{ fontSize: '0.76rem', color: 'var(--dc-text-secondary)', marginTop: 4 }}>
                    Simulate highway logjam holding back external NDRF reinforcements.
                  </span>
                </button>
              </div>

              {/* Stress-Test Status Output */}
              <div style={{ padding: 16, borderRadius: 8, background: 'var(--dc-surface)', border: '1px solid var(--border-medium)' }}>
                <span style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--dc-forest)', textTransform: 'uppercase' }}>
                  Resilience Model Findings:
                </span>
                <p style={{ fontSize: '0.84rem', color: 'var(--dc-text)', margin: '6px 0 0', lineHeight: 1.6 }}>
                  {activeWhatIfs.length === 0
                    ? 'No compound stress tests currently activated. Click any scenario button above to assess system tolerance.'
                    : `Active Compound Factors: ${activeWhatIfs.join(', ')}. Evacuation routes dynamically rerouting traffic around high-risk pinch points. Dynamic score adjusted.`}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: AI COMMAND ADVISOR & LIVE EVENT FEED */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* AI COMMAND ADVISOR PANEL */}
          <div
            style={{
              background: 'var(--dc-elevated)',
              border: '1.5px solid var(--border-medium)',
              borderRadius: 12,
              padding: '20px 22px',
              boxShadow: '0 4px 16px rgba(38, 63, 53, 0.05)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span className="dc-badge" style={{ background: 'rgba(73, 107, 90, 0.12)', color: 'var(--dc-earth-green)', fontWeight: 800 }}>
                  <Sparkles size={12} style={{ display: 'inline', marginRight: 4 }} /> AI COMMAND ADVISOR
                </span>
              </div>
              <span style={{ fontSize: '0.74rem', color: 'var(--dc-text-muted)' }}>
                Neural + Heuristic Fallback
              </span>
            </div>

            <p style={{ fontSize: '0.84rem', color: 'var(--dc-text-secondary)', margin: '0 0 14px' }}>
              Query the decision engine for prioritization, resource allocation, and evacuation corridor safety trade-offs.
            </p>

            {/* Quick Prompt Chips */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
              {[
                'Which incident should I prioritize?',
                'Which shelter has capacity?',
                'Is Central Bridge safe to cross?',
                'Which team should I deploy?',
              ].map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setCustomAdvisorQuery(q);
                    askAIAdvisor(q);
                  }}
                  style={{
                    fontSize: '0.74rem',
                    padding: '4px 10px',
                    borderRadius: 6,
                    background: 'var(--dc-surface-2)',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--dc-text)',
                    cursor: 'pointer',
                    fontWeight: 600,
                  }}
                >
                  {q}
                </button>
              ))}
            </div>

            {/* Custom Query Input */}
            <form onSubmit={handleAdvisorSubmit} style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              <input
                type="text"
                placeholder="Ask tactical command question..."
                value={customAdvisorQuery}
                onChange={(e) => setCustomAdvisorQuery(e.target.value)}
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  borderRadius: 8,
                  border: '1px solid var(--border-medium)',
                  background: 'var(--dc-surface)',
                  fontSize: '0.84rem',
                  color: 'var(--dc-text)',
                }}
              />
              <button
                type="submit"
                disabled={advisorLoading}
                style={{
                  padding: '8px 14px',
                  borderRadius: 8,
                  background: 'var(--dc-forest)',
                  color: '#FFF',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                {advisorLoading ? 'Evaluating...' : 'Query'}
              </button>
            </form>

            {/* AI Advisor Response Display */}
            {advisorData && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  background: 'var(--dc-surface, #F8F5EE)',
                  border: '1px solid var(--border-medium)',
                  borderRadius: 8,
                  padding: 14,
                }}
              >
                <div style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--dc-forest)', marginBottom: 6 }}>
                  RECOMMENDATION:
                </div>
                <div style={{ fontSize: '0.86rem', color: 'var(--dc-text)', fontWeight: 600, lineHeight: 1.5, marginBottom: 10 }}>
                  {advisorData.recommendation}
                </div>

                {/* Evidence */}
                {advisorData.evidence && advisorData.evidence.length > 0 && (
                  <div style={{ marginBottom: 10 }}>
                    <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--dc-text-secondary)', fontWeight: 700 }}>
                      Evidence & Telemetry:
                    </div>
                    <ul style={{ margin: '4px 0 0', paddingLeft: 16, fontSize: '0.78rem', color: 'var(--dc-text-secondary)' }}>
                      {advisorData.evidence.map((ev, i) => (
                        <li key={i}>{ev}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Trade-Offs */}
                {advisorData.tradeOffs && advisorData.tradeOffs.length > 0 && (
                  <div>
                    <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--dc-clay)', fontWeight: 700 }}>
                      Operational Trade-Offs:
                    </div>
                    <ul style={{ margin: '4px 0 0', paddingLeft: 16, fontSize: '0.78rem', color: 'var(--dc-clay)' }}>
                      {advisorData.tradeOffs.map((to, i) => (
                        <li key={i}>{to}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </motion.div>
            )}
          </div>

          {/* REAL-TIME EVENT FEED & NOTIFICATION LOG */}
          <div
            style={{
              background: 'var(--dc-elevated)',
              border: '1.5px solid var(--border-medium)',
              borderRadius: 12,
              padding: '18px 20px',
              maxHeight: 460,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Radio size={16} color="var(--dc-emergency)" className="dc-pulse-icon" />
                <span style={{ fontSize: '0.84rem', fontWeight: 800, color: 'var(--dc-forest)' }}>
                  LIVE SIMULATION TIMELINE FEED
                </span>
              </div>
              <span style={{ fontSize: '0.72rem', color: 'var(--dc-text-muted)' }}>
                {eventFeed.length} Events
              </span>
            </div>

            <div style={{ overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10, paddingRight: 4 }}>
              {eventFeed.map((ev) => {
                const isCrit = ev.severity === 'critical';
                const isWarn = ev.severity === 'warning';
                const isSucc = ev.severity === 'success';

                let borderC = 'var(--border-subtle)';
                let bgC = 'var(--dc-surface)';
                if (isCrit) {
                  borderC = 'rgba(201, 75, 75, 0.35)';
                  bgC = 'rgba(201, 75, 75, 0.05)';
                } else if (isSucc) {
                  borderC = 'rgba(79, 128, 96, 0.35)';
                  bgC = 'rgba(79, 128, 96, 0.05)';
                }

                return (
                  <div
                    key={ev.id}
                    style={{
                      background: bgC,
                      border: `1px solid ${borderC}`,
                      borderRadius: 8,
                      padding: '10px 12px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 }}>
                      <span
                        style={{
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          color: isCrit ? 'var(--dc-emergency)' : isSucc ? 'var(--dc-safe)' : 'var(--dc-forest)',
                        }}
                      >
                        {ev.title}
                      </span>
                      <span style={{ fontSize: '0.7rem', color: 'var(--dc-text-muted)', fontFamily: 'monospace' }}>
                        {ev.timestamp}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.78rem', color: 'var(--dc-text-secondary)', margin: 0, lineHeight: 1.4 }}>
                      {ev.message}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* 4. AFTER-ACTION REPORT MODAL */}
      <AfterActionReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
      />
    </div>
  );
}
