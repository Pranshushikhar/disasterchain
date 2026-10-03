import React, { useState } from 'react';
import { motion } from 'framer-motion';
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
} from 'lucide-react';

export default function ModernSafetyPage({ onOpenSos }) {
  const [isActionRecommended, setIsActionRecommended] = useState(false);

  const [emergencyContacts] = useState([
    { name: 'National Emergency', number: '112', type: 'Universal Dispatch' },
    { name: 'Disaster Helpline', number: '1078', type: 'NDRF Disaster Cell' },
    { name: 'Ambulance & Paramedic', number: '108', type: 'Medical' },
    { name: 'Police Helpline', number: '100', type: 'Law & Order' },
    { name: 'Fire Control Room', number: '101', type: 'Rescue & Fire' },
  ]);

  const [savedPlaces] = useState([
    { name: 'Home', address: 'Sector 14, Civil Enclave', status: 'Safe', icon: Home },
    { name: 'Office', address: 'Connaught Place Outer Circle', status: 'Waterlogged Access', icon: Briefcase },
    { name: 'Family', address: 'Defense Colony, South Block', status: 'Safe', icon: Users },
  ]);

  const [nearestShelter] = useState({
    name: 'Sector 14 Municipal Relief Hub',
    address: 'Govt Model School, Ring Road Bypass',
    distance: '1.4 km',
    walkingTime: '18 min walk',
    capacity: '180 beds available',
    phone: '+91 11 2386 1100',
  });

  const [checklist, setChecklist] = useState([
    { id: 1, text: '3 liters of potable drinking water per family member', checked: true },
    { id: 2, text: 'Fully charged power bank & emergency radio', checked: true },
    { id: 3, text: 'Essential prescription medicines (7-day supply)', checked: false },
    { id: 4, text: 'Government ID proofs stored in waterproof pouch', checked: true },
    { id: 5, text: 'Family emergency meeting point agreed', checked: false },
  ]);

  const toggleCheck = (id) => {
    setChecklist((prev) =>
      prev.map((c) => (c.id === id ? { ...c, checked: !c.checked } : c))
    );
  };

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
            title="Trigger SOS Dispatch"
          >
            <LifeBuoy size={16} />
            <span>SOS</span>
          </button>
        </header>

        {/* 1. CURRENT STATUS CARD */}
        <section className="dc-safety-section">
          <div
            className={`dc-safety-status-banner ${
              isActionRecommended ? 'warning' : 'safe'
            }`}
          >
            <div className="dc-status-icon-wrap">
              {isActionRecommended ? (
                <AlertTriangle size={28} />
              ) : (
                <ShieldCheck size={28} />
              )}
            </div>
            <div className="dc-status-text-block">
              <span className="dc-status-label">CURRENT PERIMETER ASSESSMENT</span>
              <h2 className="dc-status-heading">
                {isActionRecommended ? 'ACTION RECOMMENDED' : 'You are currently safe.'}
              </h2>
              <p className="dc-status-paragraph">
                {isActionRecommended
                  ? 'Severe precipitation expected in your immediate sector within 2 hours. Review alternate route and prepare go-bag.'
                  : 'No critical hazards, active fires, or high-risk waterlogging detected within your 3 km perimeter.'}
              </p>
            </div>
          </div>
        </section>

        {/* 2. NEAREST SHELTER */}
        <section className="dc-safety-section">
          <h2 className="dc-section-title">Nearest Shelter</h2>
          <div className="dc-shelter-card">
            <div className="dc-shelter-left">
              <div className="dc-shelter-icon-bubble">
                <Home size={22} />
              </div>
              <div className="dc-shelter-details">
                <div className="dc-shelter-badges">
                  <span className="dc-pill-indicator green">Open Now</span>
                  <span className="dc-pill-indicator muted">{nearestShelter.capacity}</span>
                </div>
                <h3 className="dc-shelter-name">{nearestShelter.name}</h3>
                <span className="dc-shelter-address">
                  {nearestShelter.address} · {nearestShelter.distance} ({nearestShelter.walkingTime})
                </span>
              </div>
            </div>

            <div className="dc-shelter-actions">
              <a
                href={`https://maps.google.com/?q=${encodeURIComponent(nearestShelter.name)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="dc-btn-primary"
              >
                <Navigation size={15} />
                <span>Directions</span>
              </a>
              <a
                href={`tel:${nearestShelter.phone}`}
                className="dc-btn-secondary"
              >
                <span>Call Center</span>
              </a>
            </div>
          </div>
        </section>

        {/* 3. EMERGENCY CONTACTS */}
        <section className="dc-safety-section">
          <h2 className="dc-section-title">Emergency Contacts</h2>
          <div className="dc-contacts-grid">
            {emergencyContacts.map((contact, idx) => (
              <a
                key={idx}
                href={`tel:${contact.number}`}
                className="dc-contact-card"
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

        {/* 4. SAVED PLACES */}
        <section className="dc-safety-section">
          <h2 className="dc-section-title">Saved Places</h2>
          <div className="dc-saved-places-list">
            {savedPlaces.map((place, idx) => {
              const Icon = place.icon;
              const isSafe = place.status === 'Safe';
              return (
                <div key={idx} className="dc-place-row">
                  <div className="dc-place-left">
                    <div className="dc-place-icon-box">
                      <Icon size={18} />
                    </div>
                    <div>
                      <h4 className="dc-place-name">{place.name}</h4>
                      <span className="dc-place-address">{place.address}</span>
                    </div>
                  </div>
                  <span
                    className={`dc-place-status-pill ${
                      isSafe ? 'safe' : 'caution'
                    }`}
                  >
                    {place.status}
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        {/* 5. PREPAREDNESS CHECKLIST */}
        <section className="dc-safety-section">
          <div className="dc-section-header-row">
            <h2 className="dc-section-title">Preparedness Checklist</h2>
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
