import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Satellite,
  Sliders,
  AlertTriangle,
  Upload,
} from 'lucide-react';
import { API_BASE_URL } from '../services/api';

const DEMO_PRESETS = [
  {
    id: 'saraswati-flood-2026',
    title: 'Saraswati River Embankment Inundation Analysis',
    region: 'Saraswati Nagar, Sector 2 & River Corridor',
    sensor: 'Sentinel-2 SAR / Multispectral 10m Resolution',
    task: 'FLOOD_EXTENT',
    beforeDate: '2026-10-15 (Baseline)',
    afterDate: '2026-10-30 (Post-Surge)',
    // Simulated SVG/Canvas visualizations for before & after imagery
    beforeGradient: 'linear-gradient(135deg, #a8c0a8 0%, #d8caa8 40%, #5d8990 70%, #496b5a 100%)',
    afterGradient: 'linear-gradient(135deg, #4b6f75 0%, #2f4858 35%, #3d5a80 70%, #1e2725 100%)',
    metrics: {
      estimatedFloodedAreaHectares: 142.8,
      waterVolumeIncreaseIndex: '+340%',
      submergedRoadKm: 4.8,
      affectedStructuresDetected: 38,
      confidenceScore: 0.91,
      uncertaintyRange: '±8.5%',
    },
    detections: [
      {
        id: 'det-1',
        label: 'Active Riverbank Embankment Breach',
        category: 'Severe Flood Extent',
        box: { top: 38, left: 22, width: 28, height: 26 },
        severity: 'Critical',
        notes: 'Water depth estimated at 1.2m - 1.8m over Promenade Riverbank Road.',
      },
      {
        id: 'det-2',
        label: 'Promenade Road Culvert Submersion',
        category: 'Road Obstruction',
        box: { top: 58, left: 44, width: 20, height: 16 },
        severity: 'High',
        notes: 'Complete loss of surface traction; impassable to wheeled vehicles.',
      },
      {
        id: 'det-3',
        label: 'Old Mandi Hall Lowland Ponding',
        category: 'Shelter Buffer Threat',
        box: { top: 28, left: 62, width: 22, height: 24 },
        severity: 'High',
        notes: 'Runoff pooling within 25m of community shelter exterior perimeter.',
      },
    ],
    technicalMetadata: {
      algorithm: 'DisasterChain Normalized Difference Water Index (NDWI) + Morphological Flood Segmenter',
      resolutionMetersPerPixel: 10,
      cloudCoverPercentage: 4.2,
      modelProvider: 'DisasterChain Vision Intelligence v2.0 (Neural Edge CV + Fallback Heuristics)',
      limitations: 'Optical and radar passes cannot measure internal structural integrity or submerged debris velocity. High turbidity may influence shallow edge demarcation.',
      humanReviewNotice: 'MANDATORY HUMAN VERIFICATION: Aerial indicators are decision-support heuristics. Ground rescue crews must confirm surface depth prior to wading.',
    },
  },
  {
    id: 'sector1-earthquake-damage',
    title: 'Historic Old Quarter Structural Rubble & Debris Scan',
    region: 'Saraswati Nagar, Sector 1 (Old Town)',
    sensor: 'WorldView-3 Very-High-Resolution (30cm Optical)',
    task: 'STRUCTURAL_DAMAGE',
    beforeDate: '2026-10-18 (Pre-Seismic)',
    afterDate: '2026-10-30 (Post-M6.8)',
    beforeGradient: 'linear-gradient(135deg, #d8b98a 0%, #c8a97a 50%, #b8986a 100%)',
    afterGradient: 'linear-gradient(135deg, #96836c 0%, #7d6b56 40%, #b86f52 80%, #524337 100%)',
    metrics: {
      detectedDebrisFieldsCount: 9,
      partialCollapseSignatures: 4,
      severedAlleywaysKm: 1.6,
      confidenceScore: 0.88,
      uncertaintyRange: '±11.0%',
    },
    detections: [
      {
        id: 'det-eq-1',
        label: 'Clocktower Plaza Parapet Rubble Spread',
        category: 'Masonry Debris Field',
        box: { top: 28, left: 30, width: 24, height: 22 },
        severity: 'High',
        notes: 'Roofline parapet detachment blocking east pedestrian egress.',
      },
      {
        id: 'det-eq-2',
        label: 'Residential Colony Block A Roof Fracture',
        category: 'Structural Damage Signature',
        box: { top: 52, left: 58, width: 26, height: 24 },
        severity: 'Critical',
        notes: 'Visible structural shift along transverse masonry axis.',
      },
    ],
    technicalMetadata: {
      algorithm: 'Bi-Temporal Feature Differential + Change Vector Analysis (CVA)',
      resolutionMetersPerPixel: 0.3,
      cloudCoverPercentage: 0.0,
      modelProvider: 'DisasterChain High-Res Damage Detection Pipeline',
      limitations: 'Vertical optical imagery cannot determine internal structural column failure. Predictions must not be used as official structural engineering certifications.',
      humanReviewNotice: 'USAR certified structural engineer on-site inspection required before rescue entry.',
    },
  },
  {
    id: 'sector6-hazmat-burn-scar',
    title: 'Udyog Vihar Chemical Fire Plume & Burn Scar Mapping',
    region: 'Saraswati Nagar, Sector 6 (Industrial)',
    sensor: 'Landsat-9 Thermal Infrared Sensor (TIRS) + Sentinel-2',
    task: 'BURNED_AREA',
    beforeDate: '2026-10-22 (Normal Operations)',
    afterDate: '2026-10-30 (Active Plume)',
    beforeGradient: 'linear-gradient(135deg, #b0bec5 0%, #cfd8dc 50%, #90a4ae 100%)',
    afterGradient: 'linear-gradient(135deg, #bf360c 0%, #e65100 30%, #37474f 70%, #263238 100%)',
    metrics: {
      burnScarAreaHectares: 18.5,
      thermalHotspotTemperatureCelsius: 385,
      dispersionPlumeLengthKm: 3.4,
      confidenceScore: 0.94,
      uncertaintyRange: '±6.0%',
    },
    detections: [
      {
        id: 'det-bm-1',
        label: 'PetroChem Tank #4 Thermal Core',
        category: 'Active Thermal Hotspot',
        box: { top: 38, left: 42, width: 22, height: 22 },
        severity: 'Critical',
        notes: 'Intense thermal emission indicating active petrochemical combustion.',
      },
      {
        id: 'det-bm-2',
        label: 'Northwest Toxic Vapor Plume Footprint',
        category: 'Smoke & SO2 Dispersion',
        box: { top: 16, left: 16, width: 34, height: 32 },
        severity: 'High',
        notes: 'Aerosol optical depth indicates toxic sulfur dioxide drifting toward Sector 5.',
      },
    ],
    technicalMetadata: {
      algorithm: 'Normalized Burn Ratio (NBR) + Thermal Radiance Thresholding',
      resolutionMetersPerPixel: 20,
      cloudCoverPercentage: 8.0,
      modelProvider: 'DisasterChain Multispectral Thermal Suite',
      limitations: 'Ground-level toxic gas concentration depends on atmospheric boundary layer height and local wind shear.',
      humanReviewNotice: 'Hazardous materials hazmat safety team must deploy portable photoionization detectors.',
    },
  },
];

export default function SatelliteEyePage() {
  const [selectedPresetId, setSelectedPresetId] = useState(DEMO_PRESETS[0].id);
  const activePreset = DEMO_PRESETS.find((p) => p.id === selectedPresetId) || DEMO_PRESETS[0];

  const [viewMode, setViewMode] = useState('slider'); // 'slider' | 'side-by-side'
  const [sliderPosition, setSliderPosition] = useState(50); // percentage 0-100
  const [selectedTask, setSelectedTask] = useState(activePreset.task);
  const [activeDetectionId, setActiveDetectionId] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Custom Upload Simulation State
  const [customUploadName, setCustomUploadName] = useState(null);
  const fileInputRef = useRef(null);
  const sliderContainerRef = useRef(null);
  const isDraggingSlider = useRef(false);

  // Sync task on preset change
  useEffect(() => {
    setSelectedTask(activePreset.task);
    setActiveDetectionId(null);
  }, [selectedPresetId, activePreset.task]);

  // Handle Split Slider Dragging
  const handleSliderMove = (clientX) => {
    if (!sliderContainerRef.current) return;
    const rect = sliderContainerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(rect.width, clientX - rect.left));
    const percent = Math.round((x / rect.width) * 100);
    setSliderPosition(percent);
  };

  const handleMouseDown = () => {
    isDraggingSlider.current = true;
  };

  const handleMouseUp = () => {
    isDraggingSlider.current = false;
  };

  const handleMouseMove = (e) => {
    if (isDraggingSlider.current) {
      handleSliderMove(e.clientX);
    }
  };

  const handleTouchMove = (e) => {
    if (e.touches && e.touches[0]) {
      handleSliderMove(e.touches[0].clientX);
    }
  };

  // Custom File Upload
  const handleFileUpload = (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      setIsAnalyzing(true);
      setCustomUploadName(file.name);
      setTimeout(() => {
        setIsAnalyzing(false);
      }, 900);
    }
  };

  return (
    <div
      className="dc-satellite-eye-page"
      style={{ padding: '24px 32px', maxWidth: 1600, margin: '0 auto' }}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      {/* 1. HEADER */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span className="dc-badge" style={{ background: 'rgba(93, 137, 144, 0.15)', color: 'var(--dc-water)', fontWeight: 800 }}>
                <Satellite size={13} style={{ display: 'inline', marginRight: 4 }} /> SATELLITE EYE CV
              </span>
              <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--dc-text-secondary)' }}>
                SENTINEL & WORLDVIEW ORBITAL INTELLIGENCE
              </span>
              <span style={{ fontSize: '0.78rem', background: 'rgba(184, 111, 82, 0.15)', color: 'var(--dc-clay)', padding: '2px 8px', borderRadius: 4, fontWeight: 700 }}>
                DEMONSTRATION DATA
              </span>
            </div>
            <h1 style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--dc-forest, #263F35)', margin: '6px 0 2px' }}>
              SATELLITE EYE — AI-Powered Satellite & Aerial Image Analysis
            </h1>
            <p style={{ margin: 0, fontSize: '0.92rem', color: 'var(--dc-text-secondary)', maxWidth: 880 }}>
              Detect flood extents, structural rubble, thermal fire scars, and severed roadway arteries with explainable change detection and uncertainty metrics.
            </p>
          </div>

          {/* Upload Custom Imagery Button */}
          <div style={{ display: 'flex', gap: 10 }}>
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: 'none' }}
              accept="image/*"
              onChange={handleFileUpload}
            />
            <button
              onClick={() => fileInputRef.current && fileInputRef.current.click()}
              className="dc-btn dc-btn-secondary"
              style={{ fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <Upload size={15} /> Upload Satellite Imagery
            </button>
          </div>
        </div>
      </div>

      {/* 2. PRESET SELECTION & TASK CONTROLS */}
      <div
        style={{
          background: 'var(--dc-elevated)',
          border: '1.5px solid var(--border-medium)',
          borderRadius: 12,
          padding: '16px 20px',
          marginBottom: 20,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14 }}>
          {/* Preset Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--dc-text-secondary)', textTransform: 'uppercase' }}>
              Imagery Scenario:
            </span>
            {DEMO_PRESETS.map((p) => {
              const active = p.id === selectedPresetId;
              return (
                <button
                  key={p.id}
                  onClick={() => setSelectedPresetId(p.id)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: 8,
                    fontSize: '0.82rem',
                    fontWeight: active ? 700 : 500,
                    border: active ? '1.5px solid var(--dc-forest)' : '1px solid var(--border-subtle)',
                    background: active ? 'var(--dc-forest)' : 'var(--dc-surface)',
                    color: active ? '#FFF' : 'var(--dc-text)',
                    cursor: 'pointer',
                  }}
                >
                  {p.title.split('—')[0].split('Analysis')[0].trim()}
                </button>
              );
            })}
          </div>

          {/* View Mode Toggle (Split Slider vs Side-by-Side) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--dc-surface-2)', padding: '4px', borderRadius: 8 }}>
            <button
              onClick={() => setViewMode('slider')}
              style={{
                padding: '6px 12px',
                borderRadius: 6,
                fontSize: '0.78rem',
                fontWeight: 700,
                border: 'none',
                background: viewMode === 'slider' ? 'var(--dc-forest)' : 'transparent',
                color: viewMode === 'slider' ? '#FFF' : 'var(--dc-text)',
                cursor: 'pointer',
              }}
            >
              Interactive Slider
            </button>
            <button
              onClick={() => setViewMode('side-by-side')}
              style={{
                padding: '6px 12px',
                borderRadius: 6,
                fontSize: '0.78rem',
                fontWeight: 700,
                border: 'none',
                background: viewMode === 'side-by-side' ? 'var(--dc-forest)' : 'transparent',
                color: viewMode === 'side-by-side' ? '#FFF' : 'var(--dc-text)',
                cursor: 'pointer',
              }}
            >
              Side-by-Side
            </button>
          </div>
        </div>

        {/* Task Filter Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 14, paddingTop: 12, borderTop: '1px solid var(--border-subtle)', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--dc-text-secondary)', textTransform: 'uppercase' }}>
            Analysis Task:
          </span>
          {[
            { id: 'FLOOD_EXTENT', label: 'Flood Extent (NDWI)' },
            { id: 'STRUCTURAL_DAMAGE', label: 'Structural Damage (CVA)' },
            { id: 'BURNED_AREA', label: 'Burned Area / Thermal' },
            { id: 'ROAD_OBSTRUCTION', label: 'Road Obstructions' },
          ].map((t) => {
            const active = selectedTask === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setSelectedTask(t.id)}
                style={{
                  fontSize: '0.76rem',
                  padding: '3px 10px',
                  borderRadius: 6,
                  border: active ? '1px solid var(--dc-earth-green)' : '1px solid var(--border-subtle)',
                  background: active ? 'rgba(73, 107, 90, 0.12)' : 'var(--dc-surface)',
                  color: active ? 'var(--dc-forest)' : 'var(--dc-text-muted)',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. MAIN INTERACTIVE COMPARISON VIEWPORT & REPORT GRID */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.8fr) minmax(380px, 1fr)', gap: 24, alignItems: 'start' }}>
        {/* LEFT COLUMN: INTERACTIVE SLIDER / SIDE-BY-SIDE CANVAS */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {viewMode === 'slider' ? (
            /* INTERACTIVE SPLIT SLIDER */
            <div
              ref={sliderContainerRef}
              style={{
                position: 'relative',
                height: 520,
                borderRadius: 12,
                overflow: 'hidden',
                border: '1.5px solid var(--border-medium)',
                boxShadow: '0 8px 24px rgba(38, 63, 53, 0.08)',
                userSelect: 'none',
              }}
              onTouchMove={handleTouchMove}
            >
              {/* After Image (Background layer) */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: activePreset.afterGradient,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {/* Simulated Geographic Grid & Landforms */}
                <svg width="100%" height="100%" style={{ position: 'absolute', opacity: 0.35 }}>
                  <pattern id="grid-post" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#FFF" strokeWidth="0.5" />
                  </pattern>
                  <rect width="100%" height="100%" fill="url(#grid-post)" />
                </svg>

                <div style={{ position: 'absolute', top: 16, right: 16, background: 'rgba(38, 63, 53, 0.85)', color: '#FFF', padding: '6px 12px', borderRadius: 6, fontSize: '0.78rem', fontWeight: 700 }}>
                  POST-EVENT: {activePreset.afterDate}
                </div>

                {/* Bounding Box Highlights for Detected Areas */}
                {activePreset.detections.map((det) => {
                  const isActive = activeDetectionId === det.id;
                  return (
                    <div
                      key={det.id}
                      onClick={() => setActiveDetectionId(det.id)}
                      style={{
                        position: 'absolute',
                        top: `${det.box.top}%`,
                        left: `${det.box.left}%`,
                        width: `${det.box.width}%`,
                        height: `${det.box.height}%`,
                        border: `2px dashed ${isActive ? '#FFF' : 'var(--dc-emergency)'}`,
                        background: isActive ? 'rgba(201, 75, 75, 0.4)' : 'rgba(201, 75, 75, 0.18)',
                        borderRadius: 6,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'flex-start',
                        padding: 6,
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <span
                        style={{
                          background: 'var(--dc-emergency)',
                          color: '#FFF',
                          fontSize: '0.68rem',
                          fontWeight: 800,
                          padding: '2px 6px',
                          borderRadius: 4,
                          boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
                        }}
                      >
                        {det.label}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Before Image (Clipped overlay on top) */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  width: `${sliderPosition}%`,
                  overflow: 'hidden',
                  background: activePreset.beforeGradient,
                  borderRight: '2px solid #FFF',
                  boxShadow: '4px 0 16px rgba(0,0,0,0.25)',
                }}
              >
                <div style={{ width: sliderContainerRef.current?.clientWidth || 800, height: 520, position: 'relative' }}>
                  <svg width="100%" height="100%" style={{ position: 'absolute', opacity: 0.25 }}>
                    <pattern id="grid-pre" width="40" height="40" patternUnits="userSpaceOnUse">
                      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#263F35" strokeWidth="0.5" />
                    </pattern>
                    <rect width="100%" height="100%" fill="url(#grid-pre)" />
                  </svg>
                  <div style={{ position: 'absolute', top: 16, left: 16, background: 'rgba(248, 245, 238, 0.92)', color: 'var(--dc-forest)', padding: '6px 12px', borderRadius: 6, fontSize: '0.78rem', fontWeight: 700 }}>
                    BASELINE: {activePreset.beforeDate}
                  </div>
                </div>
              </div>

              {/* Draggable Divider Handle */}
              <div
                onMouseDown={handleMouseDown}
                style={{
                  position: 'absolute',
                  top: 0,
                  bottom: 0,
                  left: `${sliderPosition}%`,
                  width: 32,
                  marginLeft: -16,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'ew-resize',
                  zIndex: 20,
                }}
              >
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    background: 'var(--dc-forest)',
                    color: '#FFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                    border: '2px solid #FFF',
                  }}
                >
                  <Sliders size={16} />
                </div>
              </div>
            </div>
          ) : (
            /* SIDE BY SIDE VIEW */
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div style={{ height: 460, borderRadius: 10, background: activePreset.beforeGradient, border: '1.5px solid var(--border-medium)', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 14, left: 14, background: 'rgba(255,255,255,0.92)', padding: '6px 10px', borderRadius: 6, fontSize: '0.76rem', fontWeight: 700, color: 'var(--dc-forest)' }}>
                  BASELINE: {activePreset.beforeDate}
                </div>
              </div>
              <div style={{ height: 460, borderRadius: 10, background: activePreset.afterGradient, border: '1.5px solid var(--border-medium)', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 14, left: 14, background: 'rgba(38, 63, 53, 0.88)', padding: '6px 10px', borderRadius: 6, fontSize: '0.76rem', fontWeight: 700, color: '#FFF' }}>
                  POST-SURGE: {activePreset.afterDate}
                </div>
              </div>
            </div>
          )}

          {/* Interactive Slider Slider Note */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.76rem', color: 'var(--dc-text-secondary)', padding: '4px 6px' }}>
            <span>↔️ Drag circular slider horizontally to reveal before vs after changes.</span>
            <span>Click any red bounding box to inspect ground findings.</span>
          </div>
        </div>

        {/* RIGHT COLUMN: EXPLAINABLE ANALYSIS REPORT CARD */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div
            style={{
              background: 'var(--dc-elevated)',
              border: '1.5px solid var(--border-medium)',
              borderRadius: 12,
              padding: '22px 24px',
              boxShadow: '0 4px 16px rgba(38, 63, 53, 0.05)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: 12 }}>
              <div>
                <span className="dc-badge" style={{ background: 'var(--dc-surface-2)', color: 'var(--dc-forest)', fontSize: '0.72rem', fontWeight: 800 }}>
                  CV ANALYSIS REPORT
                </span>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '6px 0 2px', color: 'var(--dc-forest)' }}>
                  {activePreset.title}
                </h3>
                <span style={{ fontSize: '0.78rem', color: 'var(--dc-text-secondary)' }}>
                  Sensor: {activePreset.sensor}
                </span>
              </div>

              {/* Confidence Badge */}
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--dc-text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                  Confidence
                </div>
                <div style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--dc-safe)' }}>
                  {Math.round(activePreset.metrics.confidenceScore * 100)}%
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--dc-text-muted)' }}>
                  Uncertainty: {activePreset.metrics.uncertaintyRange}
                </div>
              </div>
            </div>

            {/* Quantitative Metrics Summary */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, margin: '16px 0' }}>
              {activePreset.metrics.estimatedFloodedAreaHectares && (
                <div style={{ background: 'var(--dc-surface)', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--dc-text-secondary)', fontWeight: 700 }}>Flooded Area Extent</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--dc-water)', marginTop: 2 }}>
                    {activePreset.metrics.estimatedFloodedAreaHectares} Ha
                  </div>
                </div>
              )}

              {activePreset.metrics.submergedRoadKm && (
                <div style={{ background: 'var(--dc-surface)', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--dc-text-secondary)', fontWeight: 700 }}>Submerged Roadways</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--dc-emergency)', marginTop: 2 }}>
                    {activePreset.metrics.submergedRoadKm} km
                  </div>
                </div>
              )}

              {activePreset.metrics.detectedDebrisFieldsCount && (
                <div style={{ background: 'var(--dc-surface)', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--dc-text-secondary)', fontWeight: 700 }}>Rubble Debris Fields</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--dc-clay)', marginTop: 2 }}>
                    {activePreset.metrics.detectedDebrisFieldsCount} clusters
                  </div>
                </div>
              )}

              {activePreset.metrics.thermalHotspotTemperatureCelsius && (
                <div style={{ background: 'var(--dc-surface)', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--dc-text-secondary)', fontWeight: 700 }}>Core Thermal Hotspot</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--dc-emergency)', marginTop: 2 }}>
                    {activePreset.metrics.thermalHotspotTemperatureCelsius}°C
                  </div>
                </div>
              )}
            </div>

            {/* Detected Anomalies List */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--dc-forest)', textTransform: 'uppercase', marginBottom: 8 }}>
                Detected Region Anomalies ({activePreset.detections.length})
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {activePreset.detections.map((det) => {
                  const isSel = activeDetectionId === det.id;
                  return (
                    <div
                      key={det.id}
                      onClick={() => setActiveDetectionId(det.id)}
                      style={{
                        padding: '10px 12px',
                        borderRadius: 8,
                        background: isSel ? 'rgba(201, 75, 75, 0.1)' : 'var(--dc-surface)',
                        border: isSel ? '1.5px solid var(--dc-emergency)' : '1px solid var(--border-subtle)',
                        cursor: 'pointer',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--dc-forest)' }}>
                          {det.label}
                        </span>
                        <span style={{ fontSize: '0.7rem', padding: '2px 6px', borderRadius: 4, background: 'rgba(201, 75, 75, 0.15)', color: 'var(--dc-emergency)', fontWeight: 800 }}>
                          {det.severity}
                        </span>
                      </div>
                      <p style={{ margin: '4px 0 0', fontSize: '0.76rem', color: 'var(--dc-text-secondary)', lineHeight: 1.4 }}>
                        {det.notes}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Limitations & Mandatory Human Review Notice */}
            <div
              style={{
                background: 'rgba(184, 111, 82, 0.08)',
                border: '1px solid rgba(184, 111, 82, 0.25)',
                borderRadius: 8,
                padding: '12px 14px',
                marginBottom: 10,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--dc-clay)', fontWeight: 700, fontSize: '0.78rem', marginBottom: 4 }}>
                <AlertTriangle size={15} /> Methodological Limitations
              </div>
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--dc-text)', lineHeight: 1.5 }}>
                {activePreset.technicalMetadata.limitations}
              </p>
            </div>

            <div
              style={{
                background: 'rgba(79, 128, 96, 0.08)',
                border: '1px solid rgba(79, 128, 96, 0.25)',
                borderRadius: 8,
                padding: '10px 14px',
                fontSize: '0.75rem',
                color: 'var(--dc-safe)',
                lineHeight: 1.4,
              }}
            >
              <strong>Human Review Protocol:</strong> {activePreset.technicalMetadata.humanReviewNotice}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
