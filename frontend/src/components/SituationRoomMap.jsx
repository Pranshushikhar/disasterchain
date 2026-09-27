import React, { useState, useMemo, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import SourceBadge from './SourceBadge';

const DEFAULT_CENTER = [28.6139, 77.2090];
const DEFAULT_ZOOM = 13;

// Map recenter and size invalidate controller helper
function RecenterController({ center, zoom, trigger }) {
  const map = useMap();

  React.useEffect(() => {
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
function createMarkerIcon(type) {
  if (type === 'current') {
    const html = `
      <div style="position:relative; width:16px; height:16px;">
        <div style="position:absolute; width:16px; height:16px; border-radius:50%; background:#3B82F6; border:2px solid #FFFFFF;"></div>
        <div style="position:absolute; width:28px; height:28px; top:-6px; left:-6px; border-radius:50%; background:rgba(59,130,246,0.25); pointer-events:none;"></div>
      </div>
    `;
    return L.divIcon({ html, className: 'situation-marker-current', iconSize: [16, 16], iconAnchor: [8, 8] });
  }

  if (type === 'hazard' || type === 'incident') {
    const html = `
      <div style="display:flex; align-items:center; justify-content:center; width:24px; height:24px; border-radius:2px; background:#C84A3A; color:#FFFFFF; font-size:11px; font-weight:700; border:1px solid rgba(255,255,255,0.4); box-shadow:0 2px 6px rgba(0,0,0,0.6);">
        ▲
      </div>
    `;
    return L.divIcon({ html, className: 'situation-marker-hazard', iconSize: [24, 24], iconAnchor: [12, 12], popupAnchor: [0, -12] });
  }

  if (type === 'shelter') {
    const html = `
      <div style="display:flex; align-items:center; justify-content:center; width:24px; height:24px; border-radius:2px; background:#5E8B68; color:#FFFFFF; font-size:11px; font-weight:700; border:1px solid rgba(255,255,255,0.3); box-shadow:0 2px 6px rgba(0,0,0,0.6);">
        S
      </div>
    `;
    return L.divIcon({ html, className: 'situation-marker-shelter', iconSize: [24, 24], iconAnchor: [12, 12], popupAnchor: [0, -12] });
  }

  if (type === 'sos') {
    const html = `
      <div style="display:flex; align-items:center; justify-content:center; width:24px; height:24px; border-radius:2px; background:#C84A3A; color:#FFFFFF; font-size:12px; font-weight:700; border:1px solid #FF8080; box-shadow:0 0 10px rgba(200,74,58,0.7);">
        !
      </div>
    `;
    return L.divIcon({ html, className: 'situation-marker-sos', iconSize: [24, 24], iconAnchor: [12, 12], popupAnchor: [0, -12] });
  }

  if (type === 'hospital') {
    const html = `
      <div style="display:flex; align-items:center; justify-content:center; width:24px; height:24px; border-radius:2px; background:#557C91; color:#FFFFFF; font-size:11px; font-weight:700; border:1px solid rgba(255,255,255,0.3); box-shadow:0 2px 6px rgba(0,0,0,0.6);">
        +
      </div>
    `;
    return L.divIcon({ html, className: 'situation-marker-hospital', iconSize: [24, 24], iconAnchor: [12, 12], popupAnchor: [0, -12] });
  }

  return L.divIcon({
    html: `<div style="width:10px; height:10px; border-radius:50%; background:#A49F93;"></div>`,
    className: 'situation-marker-default',
    iconSize: [10, 10],
    iconAnchor: [5, 5],
  });
}

// Synthetic emergency sector definitions for municipal spatial overlays
const SECTORS = [
  {
    id: 'sec-14',
    name: 'Sector 14 Drainage Basin',
    center: [28.6180, 77.2050],
    radius: 950,
    risk: 'Elevated Waterlogging',
    riskColor: '#D66A35',
    currentRain: '8.2 mm/h',
    trend: 'Runoff velocity 1.8 m/s (Rising)',
    sheltersNearby: 2,
    hospitalsNearby: 1,
    incidentsCount: 2,
    source: 'DisasterChain Hydrology Model',
  },
  {
    id: 'sec-17',
    name: 'Sector 17 Urban Core',
    center: [28.6080, 77.2180],
    radius: 800,
    risk: 'Moderate Advisory',
    riskColor: '#C69A3A',
    currentRain: '4.0 mm/h',
    trend: 'Steady state; road diversions active',
    sheltersNearby: 1,
    hospitalsNearby: 2,
    incidentsCount: 1,
    source: 'Municipal Transit Telemetry',
  },
  {
    id: 'sec-22',
    name: 'Sector 22 Residential Perimeter',
    center: [28.6250, 77.2220],
    radius: 700,
    risk: 'Normal / Stable',
    riskColor: '#5E8B68',
    currentRain: '1.5 mm/h',
    trend: 'Stable absorption capacity',
    sheltersNearby: 1,
    hospitalsNearby: 1,
    incidentsCount: 0,
    source: 'Suburban Rain Gauge Node',
  },
];

// Sample evacuation and road closure polylines
const ROAD_CLOSURES = [
  [
    [28.6120, 77.2000],
    [28.6150, 77.2080],
    [28.6190, 77.2140],
  ],
];

const EVACUATION_ROUTE = [
  [
    [28.6185, 77.2045],
    [28.6210, 77.2080],
    [28.6260, 77.2150],
  ],
];

export default function SituationRoomMap({
  center = DEFAULT_CENTER,
  zoom = DEFAULT_ZOOM,
  hazards = [],
  shelters = [],
  sosSignals = [],
  affectedAreas = [],
  height = '480px',
  activeIncidentSector = null,
  onSelectEntity,
}) {
  const [recenterCount, setRecenterCount] = useState(0);
  const [userLocation, setUserLocation] = useState(null);
  const [selectedSector, setSelectedSector] = useState(null);

  // Progressive Layer Toggles
  const [layers, setLayers] = useState({
    hazards: true,
    shelters: true,
    sos: true,
    floodZones: true,
    roadClosures: true,
    evacRoutes: true,
    hospitals: true,
  });

  const toggleLayer = (layerKey) => {
    setLayers((prev) => ({ ...prev, [layerKey]: !prev[layerKey] }));
  };

  const handleLocateMe = useCallback(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation([pos.coords.latitude, pos.coords.longitude]);
        setRecenterCount((c) => c + 1);
      },
      (err) => console.warn('Geolocation unavailable:', err.message),
      { timeout: 7000 }
    );
  }, []);

  const activeCenter = userLocation || center;

  return (
    <div className="dc-spatial-model-root" style={{ height }} role="region" aria-label="DisasterChain Spatial Cartographic Model">
      {/* Floating Minimal Progressive Layer Rail */}
      <div className="dc-spatial-layer-rail" role="toolbar" aria-label="Map Layers">
        <div className="rail-header">
          <span>SPATIAL LAYERS</span>
        </div>
        <button
          type="button"
          className={`layer-btn ${layers.hazards ? 'active' : ''}`}
          onClick={() => toggleLayer('hazards')}
        >
          <span className="layer-dot" style={{ backgroundColor: '#C84A3A' }} />
          <span>Hazards ({hazards.length})</span>
        </button>

        <button
          type="button"
          className={`layer-btn ${layers.shelters ? 'active' : ''}`}
          onClick={() => toggleLayer('shelters')}
        >
          <span className="layer-dot" style={{ backgroundColor: '#5E8B68' }} />
          <span>Shelters ({shelters.length})</span>
        </button>

        <button
          type="button"
          className={`layer-btn ${layers.sos ? 'active' : ''}`}
          onClick={() => toggleLayer('sos')}
        >
          <span className="layer-dot" style={{ backgroundColor: '#D66A35' }} />
          <span>SOS Beacons ({sosSignals.length})</span>
        </button>

        <button
          type="button"
          className={`layer-btn ${layers.floodZones ? 'active' : ''}`}
          onClick={() => toggleLayer('floodZones')}
        >
          <span className="layer-dot" style={{ backgroundColor: '#557C91' }} />
          <span>Runoff Basins</span>
        </button>

        <button
          type="button"
          className={`layer-btn ${layers.roadClosures ? 'active' : ''}`}
          onClick={() => toggleLayer('roadClosures')}
        >
          <span className="layer-dot" style={{ backgroundColor: '#C84A3A' }} />
          <span>Road Diversions</span>
        </button>

        <button
          type="button"
          className={`layer-btn ${layers.evacRoutes ? 'active' : ''}`}
          onClick={() => toggleLayer('evacRoutes')}
        >
          <span className="layer-dot" style={{ backgroundColor: '#5E8B68' }} />
          <span>Evac Corridors</span>
        </button>

        <div className="rail-divider" />

        <button
          type="button"
          className="layer-btn locate-btn"
          onClick={handleLocateMe}
          title="Center on my current GPS position"
        >
          <span>📍 My GPS Fix</span>
        </button>
      </div>

      {/* Leaflet Map Surface */}
      <MapContainer
        center={activeCenter}
        zoom={zoom}
        style={{ width: '100%', height: '100%', background: '#121413' }}
        zoomControl={false}
      >
        <RecenterController center={activeCenter} zoom={zoom} trigger={recenterCount} />

        {/* OpenStreetMap Base Tile Layer with high-contrast calm operational styling */}
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors'
          maxZoom={19}
        />

        {/* User GPS Location Marker */}
        {userLocation && (
          <Marker position={userLocation} icon={createMarkerIcon('current')}>
            <Popup className="dc-carto-popup">
              <div className="popup-body">
                <strong>YOUR CURRENT LOCATION</strong>
                <span>GPS coordinates acquired</span>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Flood Susceptibility / Runoff Basin Zones */}
        {layers.floodZones &&
          SECTORS.map((sec) => (
            <Circle
              key={sec.id}
              center={sec.center}
              radius={sec.radius}
              pathOptions={{
                color: sec.riskColor,
                fillColor: sec.riskColor,
                fillOpacity: 0.15,
                weight: 1.5,
                dashArray: '3, 6',
              }}
              eventHandlers={{
                click: () => setSelectedSector(sec),
              }}
            >
              <Popup className="dc-carto-popup">
                <div className="popup-body">
                  <div className="popup-title">{sec.name}</div>
                  <div className="popup-tag" style={{ color: sec.riskColor }}>
                    {sec.risk.toUpperCase()}
                  </div>
                  <p className="popup-desc">
                    Rainfall rate: {sec.currentRain}. {sec.trend}.
                  </p>
                  <button
                    type="button"
                    className="popup-inspect-btn"
                    onClick={() => setSelectedSector(sec)}
                  >
                    Open Contextual Inspector →
                  </button>
                </div>
              </Popup>
            </Circle>
          ))}

        {/* Road Closures / Diversions */}
        {layers.roadClosures &&
          ROAD_CLOSURES.map((line, idx) => (
            <Polyline
              key={idx}
              positions={line}
              pathOptions={{
                color: '#C84A3A',
                weight: 4,
                dashArray: '6, 6',
              }}
            />
          ))}

        {/* Evacuation Routes */}
        {layers.evacRoutes &&
          EVACUATION_ROUTE.map((line, idx) => (
            <Polyline
              key={idx}
              positions={line}
              pathOptions={{
                color: '#5E8B68',
                weight: 3.5,
              }}
            />
          ))}

        {/* Hazards / Incidents Markers */}
        {layers.hazards &&
          hazards.map((h, idx) => {
            const lat = h.latitude || (DEFAULT_CENTER[0] + (idx - 1) * 0.008);
            const lng = h.longitude || (DEFAULT_CENTER[1] + (idx % 2 === 0 ? 0.01 : -0.01));

            return (
              <Marker
                key={h._id || h.incidentId || idx}
                position={[lat, lng]}
                icon={createMarkerIcon('hazard')}
              >
                <Popup className="dc-carto-popup">
                  <div className="popup-body">
                    <div className="popup-title">{h.title || 'Reported Incident'}</div>
                    <div className="popup-tag" style={{ color: '#C84A3A' }}>
                      SEVERITY: {(h.severity || 'Medium').toUpperCase()}
                    </div>
                    <p className="popup-desc">{h.description || 'Hazard verified by telemetry node.'}</p>
                    <div className="popup-meta">
                      <span>Location: {h.location || 'Metro District'}</span>
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}

        {/* Shelters Markers */}
        {layers.shelters &&
          shelters.map((s, idx) => {
            const lat = s.latitude || (DEFAULT_CENTER[0] - 0.005 + (idx * 0.009));
            const lng = s.longitude || (DEFAULT_CENTER[1] - 0.008 + (idx * 0.007));

            return (
              <Marker
                key={s._id || idx}
                position={[lat, lng]}
                icon={createMarkerIcon('shelter')}
              >
                <Popup className="dc-carto-popup">
                  <div className="popup-body">
                    <div className="popup-title">{s.name}</div>
                    <div className="popup-tag" style={{ color: '#5E8B68' }}>
                      STATUS: {(s.status || 'Open').toUpperCase()}
                    </div>
                    <p className="popup-desc">{s.address}</p>
                    <div className="popup-meta">
                      <span>Capacity: {s.occupancy || 0} / {s.capacity || 100}</span>
                      <span>·</span>
                      <span>{s.phone || 'Emergency Desk'}</span>
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}

        {/* SOS Emergency Signals Markers */}
        {layers.sos &&
          sosSignals.map((sos, idx) => {
            const lat = sos.latitude || (DEFAULT_CENTER[0] + 0.004);
            const lng = sos.longitude || (DEFAULT_CENTER[1] + 0.003);

            return (
              <Marker
                key={sos._id || idx}
                position={[lat, lng]}
                icon={createMarkerIcon('sos')}
              >
                <Popup className="dc-carto-popup">
                  <div className="popup-body">
                    <div className="popup-title" style={{ color: '#D84D3F' }}>
                      CIVILIAN DISTRESS BEACON
                    </div>
                    <div className="popup-tag" style={{ color: '#C84A3A' }}>
                      STATUS: {(sos.status || 'Active').toUpperCase()}
                    </div>
                    <p className="popup-desc">
                      {sos.message || 'Distress signal transmitted via mobile emergency trigger.'}
                    </p>
                    <div className="popup-meta">
                      <span>Reported: {new Date(sos.createdAt || Date.now()).toLocaleTimeString()}</span>
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}
      </MapContainer>

      {/* Contextual Intelligence Drawer on Sector / Entity Click */}
      {selectedSector && (
        <div className="dc-spatial-inspector-card" role="dialog" aria-label="Sector Inspection">
          <div className="inspector-head">
            <div className="head-text">
              <span className="head-super">CONTEXTUAL INTELLIGENCE</span>
              <h4 className="head-title">{selectedSector.name}</h4>
            </div>
            <button
              type="button"
              className="head-close"
              onClick={() => setSelectedSector(null)}
              aria-label="Close"
            >
              ✕
            </button>
          </div>

          <div className="inspector-grid">
            <div className="insp-item">
              <span className="insp-label">RISK LEVEL:</span>
              <span className="insp-val" style={{ color: selectedSector.riskColor, fontWeight: 700 }}>
                {selectedSector.risk.toUpperCase()}
              </span>
            </div>
            <div className="insp-item">
              <span className="insp-label">CURRENT RAINFALL:</span>
              <span className="insp-val">{selectedSector.currentRain}</span>
            </div>
            <div className="insp-item">
              <span className="insp-label">HYDROLOGIC TREND:</span>
              <span className="insp-val">{selectedSector.trend}</span>
            </div>
            <div className="insp-item">
              <span className="insp-label">NEARBY RESOURCES:</span>
              <span className="insp-val">
                {selectedSector.sheltersNearby} Shelters · {selectedSector.hospitalsNearby} Medical · {selectedSector.incidentsCount} Incidents
              </span>
            </div>
          </div>

          <div className="inspector-source-row">
            <SourceBadge
              source={selectedSector.source}
              confidence="High"
              updatedAt="Live model"
              compact={true}
            />
          </div>
        </div>
      )}

      <style>{`
        .dc-spatial-model-root {
          position: relative;
          width: 100%;
          background: #121413;
          border-radius: 4px;
          overflow: hidden;
          font-family: var(--font-sans, -apple-system, sans-serif);
        }

        /* Progressive Layer Rail */
        .dc-spatial-layer-rail {
          position: absolute;
          top: 12px;
          left: 12px;
          z-index: 1000;
          background: rgba(18, 20, 18, 0.88);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(242, 238, 231, 0.12);
          border-radius: 3px;
          padding: 0.5rem;
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.5);
        }

        .rail-header {
          font-family: var(--font-mono, monospace);
          font-size: 0.58rem;
          font-weight: 700;
          letter-spacing: 0.1em;
          color: #7A756D;
          margin-bottom: 0.2rem;
          padding: 0 0.35rem;
        }

        .layer-btn {
          background: transparent;
          border: 1px solid transparent;
          color: #A49F93;
          font-family: var(--font-mono, monospace);
          font-size: 0.65rem;
          padding: 0.22rem 0.5rem;
          border-radius: 2px;
          display: flex;
          align-items: center;
          gap: 0.45rem;
          cursor: pointer;
          transition: all 0.12s ease;
          text-align: left;
        }

        .layer-btn:hover {
          color: #F7F4ED;
          background: rgba(242, 238, 231, 0.05);
        }

        .layer-btn.active {
          color: #F7F4ED;
          background: rgba(242, 238, 231, 0.08);
          border-color: rgba(242, 238, 231, 0.12);
          font-weight: 600;
        }

        .layer-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          flex-shrink: 0;
        }

        .rail-divider {
          height: 1px;
          background: rgba(242, 238, 231, 0.08);
          margin: 0.2rem 0;
        }

        .locate-btn {
          color: #D66A35;
          font-weight: 600;
        }

        /* High-contrast calm operational cartography tiles */
        .dc-spatial-model-root .leaflet-tile {
          filter: brightness(0.6) invert(1) contrast(3) hue-rotate(200deg) saturate(0.2) brightness(0.7);
        }

        /* Carto Dark Popup Styling */
        .dc-carto-popup .leaflet-popup-content-wrapper {
          background: #181A18 !important;
          border: 1px solid rgba(242, 238, 231, 0.16) !important;
          border-radius: 3px !important;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.7) !important;
          color: #E9E5DC !important;
          padding: 0 !important;
        }

        .dc-carto-popup .leaflet-popup-tip {
          background: #181A18 !important;
        }

        .popup-body {
          padding: 0.75rem 0.85rem;
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .popup-title {
          font-size: 0.84rem;
          font-weight: 600;
          color: #F7F4ED;
        }

        .popup-tag {
          font-family: var(--font-mono, monospace);
          font-size: 0.6rem;
          font-weight: 700;
          letter-spacing: 0.06em;
        }

        .popup-desc {
          font-size: 0.74rem;
          color: #A49F93;
          margin: 0.2rem 0 0.35rem 0;
          line-height: 1.35;
        }

        .popup-meta {
          font-family: var(--font-mono, monospace);
          font-size: 0.62rem;
          color: #7A756D;
          border-top: 1px solid rgba(242, 238, 231, 0.08);
          padding-top: 0.35rem;
          display: flex;
          gap: 0.35rem;
        }

        .popup-inspect-btn {
          background: rgba(214, 106, 53, 0.12);
          border: 1px solid #D66A35;
          color: #D66A35;
          font-family: var(--font-mono, monospace);
          font-size: 0.62rem;
          padding: 0.25rem 0.45rem;
          border-radius: 2px;
          cursor: pointer;
          margin-top: 0.25rem;
        }

        /* Contextual Inspector Card */
        .dc-spatial-inspector-card {
          position: absolute;
          bottom: 12px;
          right: 12px;
          z-index: 1000;
          width: 320px;
          max-width: calc(100% - 24px);
          background: rgba(24, 26, 24, 0.95);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(242, 238, 231, 0.16);
          border-radius: 3px;
          padding: 0.85rem;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.7);
          animation: inspectorSlide 0.15s ease-out;
        }

        .inspector-head {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          border-bottom: 1px solid rgba(242, 238, 231, 0.08);
          padding-bottom: 0.45rem;
          margin-bottom: 0.55rem;
        }

        .head-super {
          font-family: var(--font-mono, monospace);
          font-size: 0.58rem;
          font-weight: 700;
          letter-spacing: 0.1em;
          color: #D66A35;
          display: block;
        }

        .head-title {
          font-size: 0.9rem;
          font-weight: 600;
          color: #F7F4ED;
          margin: 0.1rem 0 0 0;
        }

        .head-close {
          background: transparent;
          border: none;
          color: #7A756D;
          font-size: 0.85rem;
          cursor: pointer;
        }

        .inspector-grid {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
          font-size: 0.74rem;
          margin-bottom: 0.65rem;
        }

        .insp-item {
          display: flex;
          justify-content: space-between;
          gap: 0.5rem;
        }

        .insp-label {
          font-family: var(--font-mono, monospace);
          font-size: 0.6rem;
          color: #7A756D;
        }

        .insp-val {
          color: #E9E5DC;
          text-align: right;
        }

        .inspector-source-row {
          border-top: 1px solid rgba(242, 238, 231, 0.08);
          padding-top: 0.45rem;
        }

        @keyframes inspectorSlide {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @media (max-width: 600px) {
          .dc-spatial-layer-rail {
            top: 8px;
            left: 8px;
            padding: 0.35rem;
          }
          .layer-btn {
            font-size: 0.58rem;
            padding: 0.18rem 0.35rem;
          }
          .dc-spatial-inspector-card {
            bottom: 8px;
            right: 8px;
            width: calc(100% - 16px);
          }
        }
      `}</style>
    </div>
  );
}
