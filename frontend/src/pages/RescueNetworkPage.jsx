import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Truck,
  LifeBuoy,
  Shield,
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowRight,
  ExternalLink,
  Building,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { useCrisisSimulation } from '../context/CrisisSimulationContext';
import { Link } from 'react-router-dom';

export default function RescueNetworkPage() {
  const {
    districtMeta,
    incidents,
    resources,
    facilities,
    assignResource,
    reassignResource,
    resolveIncident,
    selectedIncidentId,
    setSelectedIncidentId,
    decisions,
  } = useCrisisSimulation();

  const [activeTab, setActiveTab] = useState('triage'); // 'triage' | 'fleet' | 'facilities' | 'audit'
  const [autoDispatchMode, setAutoDispatchMode] = useState(false); // In simulation mode only
  const [selectedResourceId, setSelectedResourceId] = useState(null);

  const pendingIncidents = incidents.filter((i) => i.status === 'Pending');
  const inProgressIncidents = incidents.filter((i) => i.status === 'In Progress');
  const resolvedIncidents = incidents.filter((i) => i.status === 'Resolved');

  const availableResources = resources.filter((r) => r.status === 'Available');
  const deployedResources = resources.filter((r) => r.status === 'Dispatched' || r.status === 'On Scene');

  // Intelligent Matching Engine: Recommends best resource for an incident
  const getSmartRecommendation = (incident) => {
    if (!incident) return null;

    const available = resources.filter((r) => r.status === 'Available');
    if (available.length === 0) return { unit: null, reason: 'All specialized units currently deployed across Saraswati Nagar.' };

    // Match specialized needs
    if (incident.category === 'Flood' || incident.needsBoat) {
      const boat = available.find((r) => r.type === 'Rescue Boat' || r.specialization?.includes('Boat'));
      if (boat) return { unit: boat, reason: 'Specialized shallow-draft motorized boat with water-rescue trained crew.' };
    }

    if (incident.severity === 'Critical') {
      const als = available.find((r) => r.type === 'Ambulance' && r.specialization?.includes('ALS'));
      if (als) return { unit: als, reason: 'Advanced Life Support (ALS) with onboard trauma ventilator and paramedics.' };
    }

    const ndrf = available.find((r) => r.type === 'Rescue Team');
    if (ndrf) return { unit: ndrf, reason: 'High-capacity urban search and rescue battalion with hydraulic extraction tools.' };

    return { unit: available[0], reason: 'Nearest available multi-role response unit.' };
  };

  // Execute Auto-Assignment Workflow (Simulated demonstration)
  const handleAutoMatch = (incident) => {
    const rec = getSmartRecommendation(incident);
    if (rec && rec.unit) {
      assignResource(incident.id, rec.unit.id);
    }
  };

  return (
    <div className="dc-rescue-network-page" style={{ padding: '24px 32px', maxWidth: 1600, margin: '0 auto' }}>
      {/* 1. TOP HEADER */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span className="dc-badge" style={{ background: 'rgba(73, 107, 90, 0.15)', color: 'var(--dc-earth-green)', fontWeight: 800 }}>
                RESOURCE COORDINATION HUB
              </span>
              <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--dc-text-secondary)' }}>
                SARASWATI NAGAR EMERGENCY DISPATCH
              </span>
              <span style={{ fontSize: '0.78rem', background: 'rgba(184, 111, 82, 0.15)', color: 'var(--dc-clay)', padding: '2px 8px', borderRadius: 4, fontWeight: 700 }}>
                SIMULATED OPERATIONAL ENVIRONMENT
              </span>
            </div>
            <h1 style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--dc-forest, #263F35)', margin: '6px 0 2px' }}>
              RESCUE NETWORK — Intelligent Resource & Responder Coordination
            </h1>
            <p style={{ margin: 0, fontSize: '0.92rem', color: 'var(--dc-text-secondary)', maxWidth: 880 }}>
              Unified coordination connecting SOS requests, verified incidents, ambulances, NDRF rescue teams, and hospitals with capability-based matching.
            </p>
          </div>

          {/* Simulation Safeguard Notice */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 12px',
                borderRadius: 8,
                background: 'rgba(79, 128, 96, 0.1)',
                border: '1px solid rgba(79, 128, 96, 0.25)',
                fontSize: '0.78rem',
                color: 'var(--dc-safe)',
                fontWeight: 700,
              }}
            >
              <Shield size={14} /> Human Confirmation Required for Live Deployments
            </div>

            <Link to="/crisis-lab" className="dc-btn dc-btn-secondary" style={{ fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Activity size={15} /> CrisisLab
            </Link>
          </div>
        </div>
      </div>

      {/* 2. FLEET & FACILITY METRICS BAR */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 14,
          marginBottom: 20,
        }}
      >
        <div style={{ background: 'var(--dc-elevated)', padding: '14px 18px', borderRadius: 10, border: '1px solid var(--border-medium)' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--dc-text-secondary)', textTransform: 'uppercase' }}>
            Available Fleet
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 4 }}>
            <span style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--dc-safe)' }}>
              {availableResources.length}
            </span>
            <span style={{ fontSize: '0.8rem', color: 'var(--dc-text-muted)' }}>
              / {resources.length} units ready
            </span>
          </div>
        </div>

        <div style={{ background: 'var(--dc-elevated)', padding: '14px 18px', borderRadius: 10, border: '1px solid var(--border-medium)' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--dc-text-secondary)', textTransform: 'uppercase' }}>
            Actively Deployed
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 4 }}>
            <span style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--dc-forest)' }}>
              {deployedResources.length}
            </span>
            <span style={{ fontSize: '0.8rem', color: 'var(--dc-text-muted)' }}>
              units on scene / en route
            </span>
          </div>
        </div>

        <div style={{ background: 'var(--dc-elevated)', padding: '14px 18px', borderRadius: 10, border: '1px solid var(--border-medium)' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--dc-text-secondary)', textTransform: 'uppercase' }}>
            Pending Incident Triage
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 4 }}>
            <span style={{ fontSize: '1.6rem', fontWeight: 900, color: pendingIncidents.length > 0 ? 'var(--dc-warning)' : 'var(--dc-safe)' }}>
              {pendingIncidents.length}
            </span>
            <span style={{ fontSize: '0.8rem', color: 'var(--dc-text-muted)' }}>
              awaiting dispatch
            </span>
          </div>
        </div>

        <div style={{ background: 'var(--dc-elevated)', padding: '14px 18px', borderRadius: 10, border: '1px solid var(--border-medium)' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--dc-text-secondary)', textTransform: 'uppercase' }}>
            Hospital Trauma Capacity
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 4 }}>
            <span style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--dc-water)' }}>
              76 Beds
            </span>
            <span style={{ fontSize: '0.8rem', color: 'var(--dc-text-muted)' }}>
              (10 ICU available)
            </span>
          </div>
        </div>
      </div>

      {/* 3. TABS NAVIGATION */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
        {[
          { id: 'triage', label: `Live Triage Board (${pendingIncidents.length + inProgressIncidents.length})`, icon: AlertTriangle },
          { id: 'fleet', label: `Resource Registry (${resources.length})`, icon: Truck },
          { id: 'facilities', label: `Hospitals & Shelters (${facilities.length})`, icon: Building },
        ].map((tab) => {
          const active = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '10px 18px',
                borderRadius: 8,
                fontSize: '0.84rem',
                fontWeight: 700,
                border: active ? '1.5px solid var(--dc-forest)' : '1px solid var(--border-medium)',
                background: active ? 'var(--dc-forest)' : 'var(--dc-elevated)',
                color: active ? '#FFF' : 'var(--dc-text)',
                cursor: 'pointer',
              }}
            >
              <Icon size={16} /> {tab.label}
            </button>
          );
        })}
      </div>

      {/* 4. TAB CONTENT */}
      {activeTab === 'triage' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 20 }}>
          {/* COLUMN 1: PENDING INCIDENTS */}
          <div>
            <div style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--dc-forest)', textTransform: 'uppercase', marginBottom: 10 }}>
              Pending Distress Calls ({pendingIncidents.length})
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {pendingIncidents.length === 0 ? (
                <div style={{ padding: 24, textAlign: 'center', background: 'var(--dc-elevated)', borderRadius: 10, border: '1px dashed var(--border-medium)' }}>
                  <CheckCircle2 size={28} color="var(--dc-safe)" style={{ margin: '0 auto 8px' }} />
                  <div style={{ fontSize: '0.86rem', color: 'var(--dc-forest)', fontWeight: 700 }}>Zero Pending Calls</div>
                </div>
              ) : (
                pendingIncidents.map((inc) => {
                  const recommendation = getSmartRecommendation(inc);
                  return (
                    <div
                      key={inc.id}
                      style={{
                        background: 'var(--dc-elevated)',
                        border: '1.5px solid var(--border-medium)',
                        borderRadius: 10,
                        padding: '16px 18px',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                        <span className="dc-badge dc-badge-emergency" style={{ fontSize: '0.72rem', fontWeight: 800 }}>
                          {inc.severity?.toUpperCase()} TIER
                        </span>
                        <span style={{ fontSize: '0.74rem', color: 'var(--dc-text-muted)' }}>
                          Sector: {inc.sector?.toUpperCase()}
                        </span>
                      </div>

                      <h4 style={{ fontSize: '1rem', fontWeight: 800, margin: '4px 0', color: 'var(--dc-forest)' }}>
                        {inc.title}
                      </h4>
                      <p style={{ fontSize: '0.8rem', color: 'var(--dc-text-secondary)', margin: '0 0 10px', lineHeight: 1.4 }}>
                        {inc.description}
                      </p>

                      {/* AI Intelligent Match Card */}
                      {recommendation && recommendation.unit && (
                        <div style={{ background: 'var(--dc-surface-2)', padding: '10px 12px', borderRadius: 8, marginBottom: 12 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.74rem', fontWeight: 800, color: 'var(--dc-earth-green)' }}>
                            <Sparkles size={13} /> Recommended Responder:
                          </div>
                          <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--dc-forest)', marginTop: 2 }}>
                            {recommendation.unit.name} ({recommendation.unit.type})
                          </div>
                          <div style={{ fontSize: '0.74rem', color: 'var(--dc-text-secondary)', marginTop: 2 }}>
                            {recommendation.reason}
                          </div>
                        </div>
                      )}

                      {/* Dispatch Trigger */}
                      <button
                        onClick={() => handleAutoMatch(inc)}
                        style={{
                          width: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 6,
                          padding: '8px 14px',
                          borderRadius: 6,
                          background: 'var(--dc-forest)',
                          color: '#FFF',
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          border: 'none',
                          cursor: 'pointer',
                        }}
                      >
                        <Truck size={14} /> Confirm Unit Dispatch
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* COLUMN 2: IN-PROGRESS DEPLOYMENTS */}
          <div>
            <div style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--dc-forest)', textTransform: 'uppercase', marginBottom: 10 }}>
              Active Operations On Scene ({inProgressIncidents.length})
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {inProgressIncidents.map((inc) => {
                const assignedResList = (inc.assignedResources || [])
                  .map((rId) => resources.find((r) => r.id === rId))
                  .filter(Boolean);

                return (
                  <div
                    key={inc.id}
                    style={{
                      background: 'var(--dc-elevated)',
                      border: '1.5px solid rgba(79, 128, 96, 0.4)',
                      borderRadius: 10,
                      padding: '16px 18px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span style={{ fontSize: '0.72rem', padding: '2px 8px', borderRadius: 4, background: 'rgba(79, 128, 96, 0.15)', color: 'var(--dc-safe)', fontWeight: 800 }}>
                        ON SCENE
                      </span>
                      <span style={{ fontSize: '0.74rem', color: 'var(--dc-text-muted)' }}>
                        Sector: {inc.sector?.toUpperCase()}
                      </span>
                    </div>

                    <h4 style={{ fontSize: '1rem', fontWeight: 800, margin: '4px 0', color: 'var(--dc-forest)' }}>
                      {inc.title}
                    </h4>

                    {/* Assigned units */}
                    <div style={{ margin: '8px 0 12px' }}>
                      <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--dc-text-secondary)', textTransform: 'uppercase' }}>
                        Engaged Resources:
                      </span>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
                        {assignedResList.map((res) => (
                          <span
                            key={res.id}
                            style={{
                              fontSize: '0.76rem',
                              padding: '3px 8px',
                              borderRadius: 4,
                              background: 'rgba(79, 128, 96, 0.12)',
                              color: 'var(--dc-safe)',
                              fontWeight: 700,
                            }}
                          >
                            {res.name}
                          </span>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={() => resolveIncident(inc.id)}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 6,
                        padding: '8px 14px',
                        borderRadius: 6,
                        background: 'var(--dc-safe)',
                        color: '#FFF',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        border: 'none',
                        cursor: 'pointer',
                      }}
                    >
                      <CheckCircle2 size={14} /> Mark Rescue Complete
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: RESOURCE FLEET REGISTRY */}
      {activeTab === 'fleet' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
          {resources.map((res) => {
            const isAvail = res.status === 'Available';
            return (
              <div
                key={res.id}
                style={{
                  background: 'var(--dc-elevated)',
                  border: '1.5px solid var(--border-medium)',
                  borderRadius: 10,
                  padding: '16px 18px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span
                    style={{
                      fontSize: '0.72rem',
                      padding: '2px 8px',
                      borderRadius: 4,
                      fontWeight: 800,
                      background: isAvail ? 'rgba(79, 128, 96, 0.15)' : 'rgba(195, 138, 53, 0.15)',
                      color: isAvail ? 'var(--dc-safe)' : 'var(--dc-warning)',
                    }}
                  >
                    {res.status.toUpperCase()}
                  </span>
                  <span style={{ fontSize: '0.74rem', color: 'var(--dc-text-muted)' }}>
                    Base: {res.baseSector?.toUpperCase()}
                  </span>
                </div>

                <h4 style={{ fontSize: '1.02rem', fontWeight: 800, margin: '4px 0 2px', color: 'var(--dc-forest)' }}>
                  {res.name}
                </h4>
                <div style={{ fontSize: '0.8rem', color: 'var(--dc-earth-green)', fontWeight: 600, marginBottom: 8 }}>
                  {res.specialization}
                </div>

                <div style={{ fontSize: '0.76rem', color: 'var(--dc-text-secondary)', marginBottom: 6 }}>
                  Personnel: <strong>{res.personnelCount} specialists</strong>
                </div>

                {res.equipment && (
                  <div style={{ fontSize: '0.74rem', color: 'var(--dc-text-muted)' }}>
                    Gear: {res.equipment.join(' • ')}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 3: HOSPITALS & SHELTERS CAPACITY */}
      {activeTab === 'facilities' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16 }}>
          {facilities.map((fac) => {
            const isHosp = fac.type === 'Hospital';
            const capacityPercent = isHosp
              ? Math.round(((fac.totalBeds - fac.availableBeds) / fac.totalBeds) * 100)
              : Math.round((fac.currentOccupancy / fac.capacityTotal) * 100);

            return (
              <div
                key={fac.id}
                style={{
                  background: 'var(--dc-elevated)',
                  border: '1.5px solid var(--border-medium)',
                  borderRadius: 10,
                  padding: '16px 20px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span className="dc-badge" style={{ background: 'var(--dc-surface-2)', color: 'var(--dc-forest)', fontSize: '0.72rem', fontWeight: 800 }}>
                    {fac.type?.toUpperCase()}
                  </span>
                  <span style={{ fontSize: '0.74rem', color: 'var(--dc-text-muted)' }}>
                    {fac.sector?.toUpperCase()}
                  </span>
                </div>

                <h4 style={{ fontSize: '1.05rem', fontWeight: 800, margin: '4px 0 2px', color: 'var(--dc-forest)' }}>
                  {fac.name}
                </h4>

                {/* Capacity Progress Bar */}
                <div style={{ margin: '14px 0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.76rem', marginBottom: 4 }}>
                    <span style={{ color: 'var(--dc-text-secondary)' }}>Occupancy Burden:</span>
                    <strong>{capacityPercent}% full</strong>
                  </div>
                  <div style={{ height: 8, background: 'var(--dc-surface)', borderRadius: 4, overflow: 'hidden' }}>
                    <div
                      style={{
                        height: '100%',
                        width: `${capacityPercent}%`,
                        background: capacityPercent > 85 ? 'var(--dc-emergency)' : 'var(--dc-earth-green)',
                        borderRadius: 4,
                      }}
                    />
                  </div>
                </div>

                {isHosp ? (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: '0.78rem' }}>
                    <div>Total Beds: <strong>{fac.totalBeds}</strong></div>
                    <div>Available: <strong style={{ color: 'var(--dc-safe)' }}>{fac.availableBeds}</strong></div>
                    <div>ICU Beds Total: <strong>{fac.icuBedsTotal}</strong></div>
                    <div>ICU Available: <strong style={{ color: 'var(--dc-safe)' }}>{fac.icuBedsAvailable}</strong></div>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: '0.78rem' }}>
                    <div>Capacity: <strong>{fac.capacityTotal} evacuees</strong></div>
                    <div>Current: <strong>{fac.currentOccupancy}</strong></div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
