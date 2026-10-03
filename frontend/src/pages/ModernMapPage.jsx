import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import {
  X,
  Home,
  Navigation,
  Clock,
  MapPin,
} from 'lucide-react';
import { fetchAffectedAreas, fetchIncidents, fetchShelters } from '../services/api';

// Minimalist, high-contrast pin icons
const createCustomMarker = (type, color) =>
  L.divIcon({
    className: `dc-map-pin ${type}`,
    html: `<div style="
      width: 22px;
      height: 22px;
      background-color: ${color};
      border: 3px solid #FFFDF8;
      border-radius: 50%;
      box-shadow: 0 4px 12px rgba(30, 39, 37, 0.25);
      display: flex;
      align-items: center;
      justify-content: center;
    ">
      <div style="width: 6px; height: 6px; background-color: #FFFDF8; border-radius: 50%;"></div>
    </div>`,
    iconSize: [22, 22],
    iconAnchor: [11, 11],
  });

const icons = {
  hazard: createCustomMarker('hazard', '#C94B4B'),
  incident: createCustomMarker('incident', '#B86F52'),
  shelter: createCustomMarker('shelter', '#496B5A'),
  user: createCustomMarker('user', '#263F35'),
};

// Map Recenter component
function ChangeView({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

export default function ModernMapPage() {
  const [filter, setFilter] = useState('ALL'); // 'ALL' | 'HAZARDS' | 'INCIDENTS' | 'SHELTERS'
  const [center, setCenter] = useState([28.6139, 77.209]); // Delhi coordinates
  const [selectedEntity, setSelectedEntity] = useState(null);

  const [hazards, setHazards] = useState([
    {
      id: 'h-1',
      type: 'hazard',
      title: 'Yamuna River Over-topping Alert',
      severity: 'Critical',
      category: 'Inundation',
      location: 'Old Iron Bridge Corridor',
      coords: [28.6562, 77.241],
      description: 'Water discharge levels exceeded 205.33 meters. Evacuation warning active in low-lying bastis.',
      time: '18 min ago',
    },
    {
      id: 'h-2',
      type: 'hazard',
      title: 'Underpass Submersion',
      severity: 'High',
      category: 'Waterlogging',
      location: 'Moolchand Flyover Sub-surface',
      coords: [28.5684, 77.234],
      description: '1.2 meters of standing water. Traffic diverted through Outer Ring Road.',
      time: '34 min ago',
    },
  ]);

  const [incidents, setIncidents] = useState([
    {
      id: 'i-1',
      type: 'incident',
      title: 'Tree Fallen Across Arterial Way',
      severity: 'Moderate',
      category: 'Road Blocked',
      location: 'Barakhamba Road Sector 4',
      coords: [28.6289, 77.225],
      description: 'Heavy banyan tree fallen blocking north-bound traffic. Civic teams deployed.',
      time: '1 hour ago',
    },
    {
      id: 'i-2',
      type: 'incident',
      title: 'Local Sub-station Power Outage',
      severity: 'Moderate',
      category: 'Power Outage',
      location: 'Lajpat Nagar Block 2',
      coords: [28.57, 77.24],
      description: 'Feeder tripping due to damp cable insulation. Restoration expected in 90 mins.',
      time: '2 hours ago',
    },
  ]);

  const [shelters, setShelters] = useState([
    {
      id: 's-1',
      type: 'shelter',
      title: 'Community Relief Center #4',
      status: 'Open',
      capacity: '240 / 400',
      location: 'Govt Higher Secondary School, Civil Lines',
      coords: [28.675, 77.223],
      description: 'Potable water, dry rations, emergency medical cot facility, mobile recharge stations.',
      phone: '+91 11 2386 1102',
    },
    {
      id: 's-2',
      type: 'shelter',
      title: 'St. Stephen Disaster Relief Camp',
      status: 'Open',
      capacity: '120 / 250',
      location: 'University Enclave Sector 1',
      coords: [28.69, 77.21],
      description: 'Bedding, heated soup kitchen, pediatric care, sanitation kits available.',
      phone: '+91 11 2766 7192',
    },
  ]);

  // Load real backend data
  useEffect(() => {
    const loadData = async () => {
      try {
        const [aRes, iRes, sRes] = await Promise.allSettled([
          fetchAffectedAreas(),
          fetchIncidents(),
          fetchShelters(),
        ]);

        if (aRes.status === 'fulfilled' && Array.isArray(aRes.value) && aRes.value.length > 0) {
          const mappedHazards = aRes.value.map((a, i) => ({
            id: a._id || `h-${i}`,
            type: 'hazard',
            title: a.areaName || a.title || 'Hazard Perimeter',
            severity: a.riskLevel || 'High',
            category: a.hazardType || 'Flood',
            location: a.district || 'Metro Region',
            coords: [
              a.coordinates?.lat || a.latitude || 28.61 + (i * 0.02),
              a.coordinates?.lng || a.longitude || 77.20 + (i * 0.02),
            ],
            description: a.description || 'Active risk perimeter under operational observation.',
            time: 'Live',
          }));
          setHazards(mappedHazards);
        }

        if (iRes.status === 'fulfilled' && Array.isArray(iRes.value) && iRes.value.length > 0) {
          const mappedIncidents = iRes.value.map((inc, i) => ({
            id: inc._id || `i-${i}`,
            type: 'incident',
            title: inc.title || inc.category || 'Field Incident',
            severity: inc.severity || 'Moderate',
            category: inc.category || 'Incident',
            location: inc.location?.address || 'Reported Location',
            coords: [
              inc.location?.coordinates?.[1] || 28.62 + (i * 0.015),
              inc.location?.coordinates?.[0] || 77.21 + (i * 0.015),
            ],
            description: inc.description || 'Verified citizen field report.',
            time: inc.createdAt ? new Date(inc.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recent',
          }));
          setIncidents(mappedIncidents);
        }

        if (sRes.status === 'fulfilled' && Array.isArray(sRes.value) && sRes.value.length > 0) {
          const mappedShelters = sRes.value.map((s, i) => ({
            id: s._id || `s-${i}`,
            type: 'shelter',
            title: s.name || 'Shelter Facility',
            status: s.status || 'Open',
            capacity: `${s.currentOccupancy || 80} / ${s.capacity || 200}`,
            location: s.address || 'Public Facility',
            coords: [
              s.location?.coordinates?.[1] || 28.65 + (i * 0.01),
              s.location?.coordinates?.[0] || 77.22 + (i * 0.01),
            ],
            description: s.services?.join(', ') || 'Shelter with bedding and emergency water.',
            phone: s.contactPhone || '+91 112',
          }));
          setShelters(mappedShelters);
        }
      } catch (err) {
        console.error('ModernMap data error:', err);
      }
    };
    loadData();
  }, []);

  // Filter items
  const showHazards = filter === 'ALL' || filter === 'HAZARDS';
  const showIncidents = filter === 'ALL' || filter === 'INCIDENTS';
  const showShelters = filter === 'ALL' || filter === 'SHELTERS';

  return (
    <div className="dc-map-screen-wrapper">
      {/* FLOATING TOP FILTER PILLS */}
      <div className="dc-map-filter-bar">
        <button
          className={`dc-map-pill ${filter === 'ALL' ? 'active' : ''}`}
          onClick={() => setFilter('ALL')}
        >
          All Layers
        </button>
        <button
          className={`dc-map-pill red ${filter === 'HAZARDS' ? 'active' : ''}`}
          onClick={() => setFilter('HAZARDS')}
        >
          <span className="dc-pill-dot red" />
          <span>Hazards ({hazards.length})</span>
        </button>
        <button
          className={`dc-map-pill clay ${filter === 'INCIDENTS' ? 'active' : ''}`}
          onClick={() => setFilter('INCIDENTS')}
        >
          <span className="dc-pill-dot clay" />
          <span>Incidents ({incidents.length})</span>
        </button>
        <button
          className={`dc-map-pill green ${filter === 'SHELTERS' ? 'active' : ''}`}
          onClick={() => setFilter('SHELTERS')}
        >
          <span className="dc-pill-dot green" />
          <span>Shelters ({shelters.length})</span>
        </button>
      </div>

      {/* FULL BLEED LEAFLET MAP CANVAS */}
      <div className="dc-map-canvas-container">
        <MapContainer
          center={center}
          zoom={12}
          zoomControl={true}
          style={{ width: '100%', height: '100%' }}
        >
          <ChangeView center={center} zoom={12} />
          <TileLayer
            attribution="&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a>"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* User Location Pin */}
          <Marker position={center} icon={icons.user}>
            <Popup>
              <strong>Your Approximate Location</strong>
            </Popup>
          </Marker>

          {/* Hazards */}
          {showHazards &&
            hazards.map((h) => (
              <Marker
                key={h.id}
                position={h.coords}
                icon={icons.hazard}
                eventHandlers={{
                  click: () => setSelectedEntity(h),
                }}
              />
            ))}

          {/* Incidents */}
          {showIncidents &&
            incidents.map((inc) => (
              <Marker
                key={inc.id}
                position={inc.coords}
                icon={icons.incident}
                eventHandlers={{
                  click: () => setSelectedEntity(inc),
                }}
              />
            ))}

          {/* Shelters */}
          {showShelters &&
            shelters.map((s) => (
              <Marker
                key={s.id}
                position={s.coords}
                icon={icons.shelter}
                eventHandlers={{
                  click: () => setSelectedEntity(s),
                }}
              />
            ))}
        </MapContainer>
      </div>

      {/* SLIDING DETAIL SHEET */}
      <AnimatePresence>
        {selectedEntity && (
          <motion.div
            className="dc-map-detail-sheet"
            initial={{ y: 150, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 150, opacity: 0 }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
          >
            <div className="dc-detail-header">
              <div className="dc-detail-type-tag">
                <span
                  className={`dc-type-dot ${
                    selectedEntity.type === 'hazard'
                      ? 'red'
                      : selectedEntity.type === 'incident'
                      ? 'clay'
                      : 'green'
                  }`}
                />
                <span className="dc-type-text">
                  {selectedEntity.type.toUpperCase()} · {selectedEntity.category || selectedEntity.status}
                </span>
              </div>
              <button
                className="dc-detail-close-btn"
                onClick={() => setSelectedEntity(null)}
                aria-label="Close details"
              >
                <X size={18} />
              </button>
            </div>

            <h3 className="dc-detail-title">{selectedEntity.title}</h3>

            <div className="dc-detail-meta-row">
              <span className="dc-meta-item">
                <MapPin size={14} />
                <span>{selectedEntity.location}</span>
              </span>
              {selectedEntity.time && (
                <span className="dc-meta-item">
                  <Clock size={14} />
                  <span>{selectedEntity.time}</span>
                </span>
              )}
              {selectedEntity.capacity && (
                <span className="dc-meta-item">
                  <Home size={14} />
                  <span>Capacity: {selectedEntity.capacity}</span>
                </span>
              )}
            </div>

            <p className="dc-detail-desc">{selectedEntity.description}</p>

            <div className="dc-detail-action-row">
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${selectedEntity.coords[0]},${selectedEntity.coords[1]}`}
                target="_blank"
                rel="noopener noreferrer"
                className="dc-btn-primary"
              >
                <Navigation size={15} />
                <span>Get Directions</span>
              </a>
              {selectedEntity.phone && (
                <a
                  href={`tel:${selectedEntity.phone}`}
                  className="dc-btn-secondary"
                >
                  <span>Call {selectedEntity.phone}</span>
                </a>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
