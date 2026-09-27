import React, { useState, useMemo, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import Icon from '../Icons';

// Default Chandigarh/Delhi Metro coordinates
const DEFAULT_CENTER = [30.7333, 76.7794]; // Chandigarh Sector 17
const DEFAULT_ZOOM = 13;

function MapFlyToController({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, zoom || 14, { animate: true });
    }
  }, [center, zoom, map]);

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        map.invalidateSize();
      } catch (e) {}
    }, 250);
    return () => clearTimeout(timer);
  }, [map]);

  return null;
}

// Crisp, high-contrast mobile marker icons
const createMobileIcon = (type) => {
  if (type === 'hazard' || type === 'incident') {
    const html = `
      <div style="width:26px; height:26px; border-radius:4px; background:#C84A3A; border:2px solid #FFFFFF; display:flex; align-items:center; justify-content:center; color:#FFFFFF; font-weight:800; font-size:12px; box-shadow:0 3px 8px rgba(0,0,0,0.7);">
        ▲
      </div>
    `;
    return L.divIcon({ html, className: 'mobile-marker-hazard', iconSize: [26, 26], iconAnchor: [13, 13] });
  }

  if (type === 'shelter') {
    const html = `
      <div style="width:26px; height:26px; border-radius:4px; background:#5E8B68; border:2px solid #FFFFFF; display:flex; align-items:center; justify-content:center; color:#FFFFFF; font-weight:800; font-size:12px; box-shadow:0 3px 8px rgba(0,0,0,0.7);">
        S
      </div>
    `;
    return L.divIcon({ html, className: 'mobile-marker-shelter', iconSize: [26, 26], iconAnchor: [13, 13] });
  }

  if (type === 'sos') {
    const html = `
      <div style="width:28px; height:28px; border-radius:50%; background:#C84A3A; border:2px solid #FFFFFF; display:flex; align-items:center; justify-content:center; color:#FFFFFF; font-weight:900; font-size:14px; box-shadow:0 0 12px #C84A3A; animation: pulse 1.5s infinite;">
        !
      </div>
    `;
    return L.divIcon({ html, className: 'mobile-marker-sos', iconSize: [28, 28], iconAnchor: [14, 14] });
  }

  return L.divIcon({
    html: `<div style="width:14px; height:14px; border-radius:50%; background:#D96B35; border:2px solid #FFF;"></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  });
};

/**
 * MobileMapScreen (Section 5)
 * TRUE FULL-SCREEN Map experience for phone viewports:
 * - map occupies nearly entire viewport
 * - minimal top controls (filter chips)
 * - floating layer button & locate-me button
 * - incident, shelter, and SOS markers
 * - interactive Bottom Sheet for selected location
 */
export default function MobileMapScreen({
  hazards = [],
  shelters = [],
  sosSignals = [],
  onSelectShelter,
}) {
  const [filter, setFilter] = useState('ALL'); // 'ALL' | 'HAZARDS' | 'SHELTERS' | 'SOS'
  const [mapCenter, setMapCenter] = useState(DEFAULT_CENTER);
  const [mapZoom, setMapZoom] = useState(DEFAULT_ZOOM);
  const [tileMode, setTileMode] = useState('DARK'); // 'DARK' | 'LIGHT'

  // Fallback realistic markers if props are empty
  const defaultHazards = useMemo(() => {
    if (hazards && hazards.length > 0) return hazards;
    return [
      {
        id: 'h1',
        title: 'Sector 14 Underpass Inundation',
        type: 'Flooding',
        lat: 30.7420,
        lng: 76.7680,
        severity: 'Critical',
        depth: '45 cm water accumulation',
        reportedAt: '08:31 AM (14m ago)',
        status: 'Active Inundation',
      },
      {
        id: 'h2',
        title: 'Sector 15 Market Road Runoff Obstruction',
        type: 'Obstruction',
        lat: 30.7510,
        lng: 76.7820,
        severity: 'High',
        depth: '30 cm localized pooling',
        reportedAt: '08:12 AM (33m ago)',
        status: 'Drainage Pumping Active',
      },
    ];
  }, [hazards]);

  const defaultShelters = useMemo(() => {
    if (shelters && shelters.length > 0) return shelters;
    return [
      {
        id: 's1',
        name: 'Civil Relief Shelter #2',
        address: 'Sector 17 Community Center',
        lat: 30.7380,
        lng: 76.7850,
        status: 'Open',
        capacity: 120,
        occupied: 78,
        bedsAvailable: 42,
        supplies: 'Medical kits, dry food, clean water, blankets',
      },
      {
        id: 's2',
        name: 'Municipal Sports Complex Shelter',
        address: 'Sector 16 Stadium Grounds',
        lat: 30.7490,
        lng: 76.7720,
        status: 'Open',
        capacity: 200,
        occupied: 110,
        bedsAvailable: 90,
        supplies: 'Emergency generator, first aid triage',
      },
    ];
  }, [shelters]);

  const defaultSosSignals = useMemo(() => {
    if (sosSignals && sosSignals.length > 0) return sosSignals;
    return [
      {
        id: 'sos-101',
        name: 'Civilian Distress Beacon',
        emergencyType: 'Flooded Vehicle / Ingress',
        lat: 30.7395,
        lng: 76.7620,
        severity: 'Critical',
        description: 'Water entering vehicle cabin near culvert barrier.',
        time: '08:40 AM',
      },
    ];
  }, [sosSignals]);

  // Set default selected item so bottom sheet is immediately visible (Section 5)
  const [selectedItem, setSelectedItem] = useState({
    type: 'hazard',
    data: {
      id: 'h1',
      title: 'Sector 14 Underpass Inundation',
      type: 'Flooding',
      lat: 30.742,
      lng: 76.768,
      severity: 'Critical',
      depth: '45 cm water accumulation',
      reportedAt: '08:31 AM (14m ago)',
      status: 'Active Inundation',
    },
  });
  const [isLocating, setIsLocating] = useState(false);

  // GPS Geolocation Locate-Me
  const handleLocateMe = () => {
    if ('geolocation' in navigator) {
      setIsLocating(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setIsLocating(false);
          setMapCenter([pos.coords.latitude, pos.coords.longitude]);
          setMapZoom(15);
        },
        () => {
          setIsLocating(false);
          setMapCenter(DEFAULT_CENTER);
        },
        { timeout: 6000 }
      );
    }
  };

  return (
    <div className="mobile-page-container full-viewport-map" id="mobile-map-screen">
      <div className="mobile-map-viewport">
        {/* Minimal Top Controls (Filter Chips) */}
        <div className="mobile-map-top-bar">
          <div className="mobile-map-filter-scroll">
            {['ALL', 'HAZARDS', 'SHELTERS', 'SOS'].map((f) => (
              <button
                key={f}
                type="button"
                className={`mobile-map-filter-btn ${filter === f ? 'active' : ''}`}
                onClick={() => setFilter(f)}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Leaflet True Fullscreen Map */}
        <MapContainer
          center={mapCenter}
          zoom={mapZoom}
          zoomControl={false}
          style={{ width: '100%', height: 'calc(100vh - 116px)', minHeight: '520px', background: '#191714' }}
        >
          <MapFlyToController center={mapCenter} zoom={mapZoom} />

          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* 1. Incident / Hazard Markers */}
          {(filter === 'ALL' || filter === 'HAZARDS') &&
            defaultHazards.map((h) => {
              const lat = Number(h.lat || h.latitude);
              const lng = Number(h.lng || h.longitude);
              if (!lat || !lng) return null;
              return (
                <Marker
                  key={h.id || h._id}
                  position={[lat, lng]}
                  icon={createMobileIcon('hazard')}
                  eventHandlers={{
                    click: () => setSelectedItem({ type: 'hazard', data: h }),
                  }}
                />
              );
            })}

          {/* 2. Relief Shelter Markers */}
          {(filter === 'ALL' || filter === 'SHELTERS') &&
            defaultShelters.map((s) => {
              const lat = Number(s.lat || s.latitude);
              const lng = Number(s.lng || s.longitude);
              if (!lat || !lng) return null;
              return (
                <Marker
                  key={s.id || s._id}
                  position={[lat, lng]}
                  icon={createMobileIcon('shelter')}
                  eventHandlers={{
                    click: () => setSelectedItem({ type: 'shelter', data: s }),
                  }}
                />
              );
            })}

          {/* 3. SOS Distress Markers */}
          {(filter === 'ALL' || filter === 'SOS') &&
            defaultSosSignals.map((sos) => {
              const lat = Number(sos.lat || sos.latitude);
              const lng = Number(sos.lng || sos.longitude);
              if (!lat || !lng) return null;
              return (
                <Marker
                  key={sos.id || sos._id}
                  position={[lat, lng]}
                  icon={createMobileIcon('sos')}
                  eventHandlers={{
                    click: () => setSelectedItem({ type: 'sos', data: sos }),
                  }}
                />
              );
            })}
        </MapContainer>

        {/* Minimal Floating Controls */}
        <div className="mobile-map-floating-controls">
          {/* Layer Toggle */}
          <button
            type="button"
            className="mobile-map-ctrl-btn"
            onClick={() => setTileMode((m) => (m === 'DARK' ? 'LIGHT' : 'DARK'))}
            title="Toggle Map Style"
            aria-label="Toggle Map Style"
          >
            <Icon name="layers" size={17} color="#F7F4ED" />
          </button>

          {/* Locate-Me GPS */}
          <button
            type="button"
            className="mobile-map-ctrl-btn"
            onClick={handleLocateMe}
            title="Locate My Position"
            aria-label="Locate My Position"
          >
            <Icon name="navigation" size={17} color={isLocating ? '#D96B35' : '#F7F4ED'} />
          </button>
        </div>

        {/* =========================================================
            BOTTOM SHEET: SELECTED LOCATION (Section 5)
            ========================================================= */}
        {selectedItem && (
          <div className="mobile-map-bottom-sheet" role="region" aria-label="Selected Location Details">
            <div className="mobile-sheet-drag-handle" />

            <div className="mobile-sheet-title-row">
              <span className="mobile-sheet-title">
                {selectedItem.data.title || selectedItem.data.name || 'Selected Sector Area'}
              </span>
              <span
                className="mobile-sheet-badge"
                style={{
                  background:
                    selectedItem.type === 'shelter'
                      ? 'rgba(94, 139, 104, 0.2)'
                      : selectedItem.type === 'sos'
                      ? 'rgba(200, 74, 58, 0.2)'
                      : 'rgba(217, 107, 53, 0.2)',
                  color:
                    selectedItem.type === 'shelter'
                      ? '#5E8B68'
                      : selectedItem.type === 'sos'
                      ? '#C84A3A'
                      : '#D96B35',
                }}
              >
                {selectedItem.type.toUpperCase()}
              </span>
            </div>

            {/* Structured Location Parameters */}
            <div className="mobile-sheet-details-grid">
              <div className="mobile-sheet-detail-item">
                <span className="mobile-sheet-detail-label">STATUS</span>
                <span className="mobile-sheet-detail-val">
                  {selectedItem.data.status || 'Active Inundation'}
                </span>
              </div>

              <div className="mobile-sheet-detail-item">
                <span className="mobile-sheet-detail-label">RISK LEVEL</span>
                <span
                  className="mobile-sheet-detail-val"
                  style={{
                    color: selectedItem.type === 'shelter' ? '#5E8B68' : '#D96B35',
                  }}
                >
                  {selectedItem.data.severity || (selectedItem.type === 'shelter' ? 'SECURE' : 'ELEVATED')}
                </span>
              </div>

              <div className="mobile-sheet-detail-item">
                <span className="mobile-sheet-detail-label">NEAREST SHELTER</span>
                <span className="mobile-sheet-detail-val">
                  Civil Shelter #2 (1.2 km)
                </span>
              </div>

              <div className="mobile-sheet-detail-item">
                <span className="mobile-sheet-detail-label">LATEST REPORT</span>
                <span className="mobile-sheet-detail-val">
                  {selectedItem.data.depth || selectedItem.data.reportedAt || '08:31 AM Verified'}
                </span>
              </div>
            </div>

            {/* Quick Action Button */}
            <button
              type="button"
              className="mobile-sheet-action-btn"
              onClick={() => {
                if (selectedItem.type === 'shelter' && onSelectShelter) {
                  onSelectShelter(selectedItem.data);
                } else {
                  alert(`Directing route away from ${selectedItem.data.title || selectedItem.data.name}`);
                }
              }}
            >
              {selectedItem.type === 'shelter' ? 'NAVIGATE TO SHELTER' : 'AVOID THIS ZONE · REROUTE'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
