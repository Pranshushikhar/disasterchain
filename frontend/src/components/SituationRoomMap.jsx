import React, { useState, useMemo, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Link } from 'react-router-dom';

const DEFAULT_CENTER = [28.6139, 77.2090];
const DEFAULT_ZOOM = 13;

// Map recenter and size invalidate controller helper
function RecenterController({ center, zoom, trigger }) {
  const map = useMap();

  React.useEffect(() => {
    // Invalidate size on initial mount to guarantee full tile rasterization
    const timer = setTimeout(() => {
      try {
        map.invalidateSize();
      } catch (e) {}
    }, 200);
    return () => clearTimeout(timer);
  }, [map]);

  React.useEffect(() => {
    if (trigger > 0) {
      map.setView(center, zoom, { animate: true });
    }
  }, [trigger, center, zoom, map]);
  return null;
}

// Marker icon generator with clean restrained styling
function createMarkerIcon(type, label = '') {
  let innerHtml = '';

  if (type === 'current') {
    innerHtml = `
      <div style="position:relative; width:16px; height:16px;">
        <div style="position:absolute; width:16px; height:16px; border-radius:50%; background:#3B82F6; border:2px solid #FFFFFF;"></div>
        <div style="position:absolute; width:30px; height:30px; top:-7px; left:-7px; border-radius:50%; background:rgba(59,130,246,0.25); pointer-events:none;"></div>
      </div>
    `;
    return L.divIcon({
      html: innerHtml,
      className: 'situation-marker-current',
      iconSize: [16, 16],
      iconAnchor: [8, 8],
    });
  }

  if (type === 'hazard' || type === 'incident') {
    innerHtml = `
      <div style="display:flex; align-items:center; justify-content:center; width:26px; height:26px; border-radius:3px; background:#C7473A; color:#FFFFFF; font-size:12px; font-weight:700; border:1px solid rgba(255,255,255,0.4); box-shadow:0 2px 6px rgba(0,0,0,0.6);">
        ▲
      </div>
    `;
    return L.divIcon({
      html: innerHtml,
      className: 'situation-marker-hazard',
      iconSize: [26, 26],
      iconAnchor: [13, 13],
      popupAnchor: [0, -14],
    });
  }

  if (type === 'shelter') {
    innerHtml = `
      <div style="display:flex; align-items:center; justify-content:center; width:26px; height:26px; border-radius:3px; background:#4D7352; color:#FFFFFF; font-size:12px; border:1px solid rgba(255,255,255,0.3); box-shadow:0 2px 6px rgba(0,0,0,0.6);">
        S
      </div>
    `;
    return L.divIcon({
      html: innerHtml,
      className: 'situation-marker-shelter',
      iconSize: [26, 26],
      iconAnchor: [13, 13],
      popupAnchor: [0, -14],
    });
  }

  if (type === 'sos') {
    innerHtml = `
      <div style="display:flex; align-items:center; justify-content:center; width:26px; height:26px; border-radius:3px; background:#991B1B; color:#FFFFFF; font-size:12px; font-weight:700; border:1px solid #EF4444; box-shadow:0 0 8px rgba(239,68,68,0.5);">
        !
      </div>
    `;
    return L.divIcon({
      html: innerHtml,
      className: 'situation-marker-sos',
      iconSize: [26, 26],
      iconAnchor: [13, 13],
      popupAnchor: [0, -14],
    });
  }

  return L.divIcon({
    html: `<div style="width:12px; height:12px; border-radius:50%; background:#A8A096;"></div>`,
    className: 'situation-marker-default',
    iconSize: [12, 12],
    iconAnchor: [6, 6],
  });
}

/**
 * DISASTERCHAIN SITUATION ROOM MAP
 * Focused, authentic geographic visualization of local crisis infrastructure.
 * Replaces decorative 3D and bloated controls with senior cartographic discipline.
 */
export default function SituationRoomMap({
  center = DEFAULT_CENTER,
  zoom = DEFAULT_ZOOM,
  hazards = [],
  shelters = [],
  sosSignals = [],
  affectedAreas = [],
  height = '480px',
  activeIncidentSector = null,
}) {
  const [activeLayer, setActiveLayer] = useState('ALL'); // 'ALL' | 'HAZARDS' | 'SHELTERS' | 'SOS'
  const [recenterTrigger, setRecenterTrigger] = useState(0);

  // Normalize markers
  const markers = useMemo(() => {
    const list = [];

    // Current location marker
    list.push({
      id: 'current-pos',
      type: 'current',
      title: 'Monitored Sector Center',
      coords: center,
      detail: `${center[0].toFixed(4)}°N, ${center[1].toFixed(4)}°E`,
    });

    if (activeLayer === 'ALL' || activeLayer === 'HAZARDS') {
      hazards.forEach((h, idx) => {
        const lat = h.latitude || h.lat || (center[0] + (idx % 2 === 0 ? 0.015 : -0.012));
        const lng = h.longitude || h.lng || (center[1] + (idx % 2 === 0 ? 0.018 : -0.016));
        list.push({
          id: h._id || `h-${idx}`,
          type: 'hazard',
          title: h.title || h.disasterType || 'Active Atmospheric Hazard',
          severity: h.severity || 'HIGH',
          coords: [lat, lng],
          detail: h.description || h.location || 'Hazard zone under active monitoring.',
        });
      });
    }

    if (activeLayer === 'ALL' || activeLayer === 'SHELTERS') {
      shelters.forEach((s, idx) => {
        const lat = s.latitude || (center[0] + (idx === 0 ? 0.008 : (idx === 1 ? -0.014 : 0.022)));
        const lng = s.longitude || (center[1] + (idx === 0 ? -0.011 : (idx === 1 ? 0.012 : -0.02)));
        list.push({
          id: s._id || `s-${idx}`,
          type: 'shelter',
          title: s.name || 'Civil Protection Shelter',
          coords: [lat, lng],
          capacity: s.capacity || 120,
          occupancy: s.currentOccupancy || 0,
          detail: `${s.capacity ? `${s.capacity - (s.currentOccupancy || 0)} spaces available` : 'Operating at nominal readiness'}`,
        });
      });
    }

    if (activeLayer === 'ALL' || activeLayer === 'SOS') {
      sosSignals.forEach((sos, idx) => {
        const lat = sos.latitude || (center[0] + (idx === 0 ? -0.006 : 0.009));
        const lng = sos.longitude || (center[1] + (idx === 0 ? 0.005 : -0.007));
        list.push({
          id: sos._id || `sos-${idx}`,
          type: 'sos',
          title: 'Distress Beacon',
          coords: [lat, lng],
          detail: sos.message || 'Distress signal received. Responders alerted.',
        });
      });
    }

    return list;
  }, [center, hazards, shelters, sosSignals, activeLayer]);

  const handleRecenter = useCallback(() => {
    setRecenterTrigger((prev) => prev + 1);
  }, []);

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height,
        background: '#11100E',
        border: '1px solid #201D19',
        borderRadius: '4px',
        overflow: 'hidden',
      }}
    >
      {/* Minimal Cartographic Header & Controls (Max 3-4 items) */}
      <div
        style={{
          position: 'absolute',
          top: '12px',
          left: '12px',
          right: '12px',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          pointerEvents: 'none',
        }}
      >
        {/* Layer Filters */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            background: 'rgba(17, 16, 14, 0.88)',
            backdropFilter: 'blur(8px)',
            border: '1px solid #201D19',
            borderRadius: '4px',
            padding: '3px 4px',
            pointerEvents: 'auto',
          }}
        >
          {['ALL', 'HAZARDS', 'SHELTERS'].map((layer) => (
            <button
              key={layer}
              type="button"
              onClick={() => setActiveLayer(layer)}
              style={{
                background: activeLayer === layer ? '#201D19' : 'transparent',
                color: activeLayer === layer ? '#F3EFE8' : '#A8A096',
                border: 'none',
                padding: '4px 8px',
                borderRadius: '3px',
                fontSize: '0.72rem',
                fontWeight: 600,
                letterSpacing: '0.04em',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {layer}
            </button>
          ))}
        </div>

        {/* Action Controls: Recenter & Open Full Map */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            pointerEvents: 'auto',
          }}
        >
          <button
            type="button"
            onClick={handleRecenter}
            title="Recenter monitored sector"
            style={{
              background: 'rgba(17, 16, 14, 0.88)',
              backdropFilter: 'blur(8px)',
              border: '1px solid #201D19',
              borderRadius: '4px',
              padding: '5px 9px',
              color: '#F3EFE8',
              fontSize: '0.74rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <span>⊙</span>
            <span>Recenter</span>
          </button>

          <Link
            to="/affected-areas"
            title="Open comprehensive metropolitan map"
            style={{
              background: 'rgba(17, 16, 14, 0.88)',
              backdropFilter: 'blur(8px)',
              border: '1px solid #201D19',
              borderRadius: '4px',
              padding: '5px 9px',
              color: '#A8A096',
              fontSize: '0.74rem',
              textDecoration: 'none',
              fontWeight: 600,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '3px',
            }}
          >
            <span>Full Map</span>
            <span>↗</span>
          </Link>
        </div>
      </div>

      {/* Map Engine */}
      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom={false}
        style={{ width: '100%', height: '100%', background: '#11100E' }}
        zoomControl={false}
      >
        <RecenterController center={center} zoom={zoom} trigger={recenterTrigger} />

        {/* Free, Public OpenStreetMap Tile Layer - Inverted to dark tactical appearance via index.css */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />

        {/* Affected Hazard Perimeters */}
        {affectedAreas.map((area, idx) => {
          const lat = area.latitude || (center[0] + 0.012);
          const lng = area.longitude || (center[1] + 0.015);
          const radius = area.radius || 1800;
          return (
            <Circle
              key={area._id || `area-${idx}`}
              center={[lat, lng]}
              radius={radius}
              pathOptions={{
                color: '#C7473A',
                fillColor: '#C7473A',
                fillOpacity: 0.14,
                weight: 1.5,
                dashArray: '4, 4',
              }}
            >
              <Popup>
                <div style={{ background: '#171512', color: '#F3EFE8', padding: '6px', fontSize: '0.8rem' }}>
                  <strong style={{ color: '#C7473A' }}>{area.name || 'Hazard Perimeter'}</strong>
                  <div style={{ fontSize: '0.72rem', color: '#A8A096', marginTop: '2px' }}>
                    Radius: {radius}m · Severity: {area.severity || 'CRITICAL'}
                  </div>
                </div>
              </Popup>
            </Circle>
          );
        })}

        {/* Markers */}
        {markers.map((m) => (
          <Marker
            key={m.id}
            position={m.coords}
            icon={createMarkerIcon(m.type, m.title)}
          >
            <Popup>
              <div
                style={{
                  background: '#171512',
                  color: '#F3EFE8',
                  padding: '8px 10px',
                  borderRadius: '3px',
                  fontFamily: 'system-ui, sans-serif',
                  minWidth: '150px',
                }}
              >
                <div
                  style={{
                    fontSize: '0.68rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    color: m.type === 'hazard' ? '#C7473A' : (m.type === 'shelter' ? '#66856A' : '#A8A096'),
                    fontWeight: 700,
                    marginBottom: '2px',
                  }}
                >
                  {m.type}
                </div>
                <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#F3EFE8', marginBottom: '4px' }}>
                  {m.title}
                </div>
                <div style={{ fontSize: '0.76rem', color: '#A8A096', lineHeight: 1.35 }}>
                  {m.detail}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
