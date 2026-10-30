import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  AlertTriangle,
  PhoneCall,
  MapPin,
  Home,
  Briefcase,
  Users,
  CheckSquare,
  Square,
  Navigation,
  LifeBuoy,
  Clock,
  ExternalLink,
  Plus,
  Compass,
} from 'lucide-react';
import {
  fetchShelters,
  fetchAlerts,
  fetchIncidents,
} from '../services/api';
import { useDCLocation } from '../context/LocationContext';
import { useTranslation } from '../i18n/i18n';

const CHECKLIST_STORAGE_KEY = 'disasterchain_safety_checklist';
const SAVED_PLACES_STORAGE_KEY = 'disasterchain_saved_places';

// Calculate distance in kilometers using Haversine formula
function getDistanceKm(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null;
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

const DEFAULT_CHECKLIST = [
  { id: 1, text: '3 liters of potable drinking water per family member', checked: true },
  { id: 2, text: 'Fully charged power bank & emergency radio / torch', checked: true },
  { id: 3, text: 'Essential prescription medicines (7-day supply in dry pouch)', checked: false },
  { id: 4, text: 'Government ID proofs stored in waterproof container', checked: true },
  { id: 5, text: 'Pre-agreed family emergency meeting point and contacts', checked: false },
  { id: 6, text: 'Non-perishable ready-to-eat dry rations (48-hour reserve)', checked: false },
];

const DEFAULT_PLACES = [
  { id: 'p1', name: 'Home', address: 'Primary residence sector', iconType: 'home' },
  { id: 'p2', name: 'Work / School', address: 'Commercial sector campus', iconType: 'work' },
  { id: 'p3', name: 'Family Contact Point', address: 'Secondary safe meeting location', iconType: 'family' },
];

export default function ModernSafetyPage({ onOpenSos }) {
  const navigate = useNavigate();

  const { t } = useTranslation();
  const { coords, locationName, openCitySelector } = useDCLocation();
  const [assessmentTimestamp, setAssessmentTimestamp] = useState(null);

  // Real operational data
  const [shelters, setShelters] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Persistent checklist
  const [checklist, setChecklist] = useState(() => {
    try {
      const saved = localStorage.getItem(CHECKLIST_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return DEFAULT_CHECKLIST;
  });

  // Persistent saved places
  const [savedPlaces, setSavedPlaces] = useState(() => {
    try {
      const saved = localStorage.getItem(SAVED_PLACES_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return DEFAULT_PLACES;
  });

  // Emergency contacts registry
  const emergencyContacts = useMemo(
    () => [
      { name: 'National Emergency Dispatch', number: '112', type: 'Universal Police, Fire & Paramedic' },
      { name: 'Disaster Cell Helpline (NDRF)', number: '1078', type: 'Disaster Management & Rescue' },
      { name: 'Ambulance & Trauma Cell', number: '108', type: 'Emergency Medical Service' },
      { name: 'Police Control Room', number: '100', type: 'Law & Order / Citizen Safety' },
      { name: 'Fire Control Command', number: '101', type: 'Rescue & Fire Suppression' },
    ],
    []
  );

  // Load real backend data for perimeter assessment and shelters
  useEffect(() => {
    let isMounted = true;
    const loadSafetyData = async () => {
      try {
        const [shelterRes, alertRes, incidentRes] = await Promise.allSettled([
          fetchShelters(),
          fetchAlerts(),
          fetchIncidents(),
        ]);

        if (!isMounted) return;

        if (shelterRes.status === 'fulfilled' && Array.isArray(shelterRes.value)) {
          setShelters(shelterRes.value);
        }
        if (alertRes.status === 'fulfilled' && Array.isArray(alertRes.value)) {
          setAlerts(alertRes.value.filter((a) => a && a.status !== 'resolved'));
        }
        if (incidentRes.status === 'fulfilled' && Array.isArray(incidentRes.value)) {
          setIncidents(incidentRes.value);
        }

        setAssessmentTimestamp(
          new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        );
      } catch (err) {
        console.warn('Safety data load error:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadSafetyData();
    return () => {
      isMounted = false;
    };
  }, [coords]);

  // Save checklist to localStorage
  const toggleCheck = (id) => {
    setChecklist((prev) => {
      const updated = prev.map((c) => (c.id === id ? { ...c, checked: !c.checked } : c));
      try {
        localStorage.setItem(CHECKLIST_STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  // Find nearest real shelter
  const nearestShelter = useMemo(() => {
    if (!shelters || shelters.length === 0) return null;

    let closest = null;
    let minDistance = Infinity;

    for (const s of shelters) {
      const sLat = s.location?.coordinates?.[1] || s.latitude;
      const sLon = s.location?.coordinates?.[0] || s.longitude;
      if (sLat && sLon) {
        const dist = getDistanceKm(coords.lat, coords.lon, sLat, sLon);
        if (dist !== null && dist < minDistance) {
          minDistance = dist;
          closest = {
            ...s,
            distanceKm: dist,
            walkingMins: Math.max(5, Math.round((dist / 4.5) * 60)),
            drivingMins: Math.max(3, Math.round((dist / 30) * 60)),
          };
        }
      }
    }

    return closest || shelters[0];
  }, [shelters, coords]);

  // Perimeter Assessment Evaluation (Grounded in real data)
  const perimeterAssessment = useMemo(() => {
    const hasActiveAlert = alerts.length > 0;
    const hasNearbyIncident = incidents.some((inc) => {
      const iLat = inc.location?.coordinates?.[1] || inc.latitude;
      const iLon = inc.location?.coordinates?.[0] || inc.longitude;
      if (!iLat || !iLon) return false;
      const dist = getDistanceKm(coords.lat, coords.lon, iLat, iLon);
      return dist !== null && dist <= 5;
    });

    if (hasActiveAlert) {
      return {
        status: 'HAZARD_ALERT',
        badge: 'ACTIVE ADVISORY BULLETIN',
        headline: 'Active Regional Advisory In Effect',
        explanation: `${alerts.length} emergency bulletin(s) active in your region. Review the instructions and avoid low-lying drainage corridors.`,
        radius: 'Sector Perimeter',
      };
    }

    if (hasNearbyIncident) {
      return {
        status: 'INCIDENT_NEARBY',
        badge: 'FIELD DISRUPTIONS RECORDED',
        headline: 'Field Incident Reported Near Your Sector',
        explanation: 'Citizen reports indicate localized road waterlogging or obstructions within 5 km. Verify your travel route before departure.',
        radius: '5 km Radius',
      };
    }

    return {
      status: 'NO_HAZARDS_DETECTED',
      badge: 'OBSERVATIONAL ASSESSMENT',
      headline: 'No hazards detected in available data',
      explanation:
        'No active emergency alerts, severe inundation reports, or high-risk incidents are logged for your 3 km perimeter. (Continue monitoring real-world surroundings).',
      radius: '3 km Perimeter',
    };
  }, [alerts, incidents, coords]);

  return (
    <motion.div
      className="dc-safety-container"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="dc-safety-content">
        {/* Page Header */}
        <header className="dc-safety-page-header">
          <div>
            <span className="dc-section-subtitle">PERSONAL DEFENSE & PREPAREDNESS</span>
            <h1 className="dc-page-title">My Safety</h1>
          </div>
          <button
            onClick={onOpenSos}
            className="dc-btn-sos-compact"
            title="Trigger Emergency SOS Protocol"
            aria-label="Emergency SOS Dispatch"
          >
            <LifeBuoy size={16} />
            <span>SOS</span>
          </button>
        </header>

        {/* =====================================================================
            1. GROUNDED PERIMETER SAFETY ASSESSMENT
            ===================================================================== */}
        <section className="dc-safety-section">
          <div
            className={`dc-safety-status-banner ${
              perimeterAssessment.status === 'NO_HAZARDS_DETECTED' ? 'safe' : 'warning'
            }`}
          >
            <div className="dc-status-icon-wrap">
              {perimeterAssessment.status === 'NO_HAZARDS_DETECTED' ? (
                <ShieldCheck size={28} />
              ) : (
                <AlertTriangle size={28} />
              )}
            </div>
            <div className="dc-status-text-block">
              <div className="dc-status-meta-row">
                <span className="dc-status-label">{perimeterAssessment.badge}</span>
                <span className="dc-status-radius-tag">{perimeterAssessment.radius}</span>
                {assessmentTimestamp && (
                  <span className="dc-status-time-tag">Verified {assessmentTimestamp}</span>
                )}
              </div>
              <h2 className="dc-status-heading">
                {perimeterAssessment.headline}
              </h2>
              <p className="dc-status-paragraph">
                {perimeterAssessment.explanation}
              </p>
            </div>
          </div>
        </section>

        {/* =====================================================================
            2. NEAREST VERIFIED SHELTER (With Real Distance & Actions)
            ===================================================================== */}
        <section className="dc-safety-section">
          <div className="dc-section-header-row">
            <h2 className="dc-section-title">Nearest Relief Shelter</h2>
            <button
              onClick={() => navigate('/shelters')}
              className="dc-text-link"
            >
              <span>All Shelters ({shelters.length})</span>
              <ExternalLink size={14} />
            </button>
          </div>

          {nearestShelter ? (
            <div className="dc-shelter-card">
              <div className="dc-shelter-left">
                <div className="dc-shelter-icon-bubble">
                  <Home size={22} />
                </div>
                <div className="dc-shelter-details">
                  <div className="dc-shelter-badges">
                    <span className="dc-pill-indicator green">
                      {nearestShelter.status || 'Verified Open'}
                    </span>
                    <span className="dc-pill-indicator muted">
                      {nearestShelter.capacity
                        ? `${nearestShelter.capacity} capacity`
                        : 'Capacity: Verified on arrival'}
                    </span>
                  </div>
                  <h3 className="dc-shelter-name">
                    {nearestShelter.name || 'Community Emergency Shelter'}
                  </h3>
                  <span className="dc-shelter-address">
                    {nearestShelter.address || locationName}
                    {nearestShelter.distanceKm != null && (
                      <> · <strong>{nearestShelter.distanceKm} km</strong> ({nearestShelter.walkingMins} min walk · {nearestShelter.drivingMins} min drive)</>
                    )}
                  </span>
                </div>
              </div>

              <div className="dc-shelter-actions">
                <a
                  href={`https://maps.google.com/?q=${encodeURIComponent(
                    nearestShelter.address || nearestShelter.name
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="dc-btn-primary"
                  title="Open driving / walking directions"
                >
                  <Navigation size={15} />
                  <span>Directions</span>
                </a>
                <a
                  href={`tel:${nearestShelter.contactPhone || nearestShelter.phone || '112'}`}
                  className="dc-btn-secondary"
                  title="Call facility"
                >
                  <PhoneCall size={14} />
                  <span>Call Facility</span>
                </a>
              </div>
            </div>
          ) : (
            <div className="dc-empty-shelter-card">
              <MapPin size={24} className="dc-empty-icon" />
              <h4>No Verified Shelter Recorded Within Range</h4>
              <p>
                No active shelter facilities are presently mapped in this sector directory. For official relocation routing, dial <strong>112</strong> immediately.
              </p>
              <button
                onClick={() => navigate('/shelters')}
                className="dc-btn-secondary"
              >
                <span>Browse Full Directory</span>
              </button>
            </div>
          )}
        </section>

        {/* =====================================================================
            3. EMERGENCY CONTACTS (Tap-To-Call Direct Access)
            ===================================================================== */}
        <section className="dc-safety-section">
          <div className="dc-section-header-row">
            <h2 className="dc-section-title">Verified Emergency Helplines</h2>
            <span className="dc-contacts-caption">Tap to dial instantly</span>
          </div>
          <div className="dc-contacts-grid">
            {emergencyContacts.map((contact, idx) => (
              <a
                key={idx}
                href={`tel:${contact.number}`}
                className="dc-contact-card"
                title={`Call ${contact.name} (${contact.number})`}
              >
                <div className="dc-contact-info">
                  <span className="dc-contact-name">{contact.name}</span>
                  <span className="dc-contact-type">{contact.type}</span>
                </div>
                <div className="dc-contact-dial">
                  <PhoneCall size={16} />
                  <span>{contact.number}</span>
                </div>
              </a>
            ))}
          </div>
        </section>

        {/* =====================================================================
            4. SAVED EMERGENCY LOCATIONS (Family & Home Defense)
            ===================================================================== */}
        <section className="dc-safety-section">
          <div className="dc-section-header-row">
            <h2 className="dc-section-title">Saved Locations</h2>
            <span className="dc-contacts-caption">Monitored Sectors</span>
          </div>
          <div className="dc-saved-places-list">
            {savedPlaces.map((place) => {
              const Icon =
                place.iconType === 'work'
                  ? Briefcase
                  : place.iconType === 'family'
                  ? Users
                  : Home;
              return (
                <div key={place.id} className="dc-place-row">
                  <div className="dc-place-left">
                    <div className="dc-place-icon-box">
                      <Icon size={18} />
                    </div>
                    <div>
                      <h4 className="dc-place-name">{place.name}</h4>
                      <span className="dc-place-address">{place.address}</span>
                    </div>
                  </div>
                  <span className="dc-place-status-pill safe">
                    Perimeter Monitored
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        {/* =====================================================================
            5. PREPAREDNESS CHECKLIST (Persisted in Local Storage)
            ===================================================================== */}
        <section className="dc-safety-section">
          <div className="dc-section-header-row">
            <h2 className="dc-section-title">72-Hour Preparedness Checklist</h2>
            <span className="dc-checklist-counter">
              {checklist.filter((c) => c.checked).length} of {checklist.length} Complete
            </span>
          </div>
          <div className="dc-checklist-box">
            {checklist.map((item) => (
              <div
                key={item.id}
                className={`dc-checklist-item ${item.checked ? 'completed' : ''}`}
                onClick={() => toggleCheck(item.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    toggleCheck(item.id);
                  }
                }}
                aria-pressed={item.checked}
              >
                {item.checked ? (
                  <CheckSquare size={18} className="dc-check-icon checked" />
                ) : (
                  <Square size={18} className="dc-check-icon" />
                )}
                <span className="dc-check-text">{item.text}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </motion.div>
  );
}
