import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PhoneCall,
  ShieldAlert,
  WifiOff,
  Wifi,
  Database,
  CheckSquare,
  Square,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  User,
  HeartPulse,
  MapPin,
  Clock,
  Download,
  Trash2,
  Plus,
  ArrowLeft,
  Info,
  Radio,
  FileText,
  LifeBuoy
} from 'lucide-react';
import {
  EMERGENCY_HOTLINES,
  OFFLINE_SAFETY_GUIDES,
  OFFLINE_GUIDES_VERSION,
  offlineEmergencyStorage
} from '../services/offlineEmergencyService';
import { useTranslation } from '../i18n/i18n';

export default function ModernOfflineEmergencyPage() {
  const { t } = useTranslation();

  // Network & Cache State
  const [isOnline, setIsOnline] = useState(() =>
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [lastSync, setLastSync] = useState(() =>
    offlineEmergencyStorage.getLastSyncTimestamp()
  );

  // Active Tab: 'guides' | 'hotlines' | 'personal' | 'checklists' | 'shelters'
  const [activeTab, setActiveTab] = useState('hotlines');

  // Safety Guides Expansion
  const [expandedGuideId, setExpandedGuideId] = useState('guide-earthquake');

  // Personal Emergency Data
  const [contacts, setContacts] = useState(() => offlineEmergencyStorage.getContacts());
  const [plan, setPlan] = useState(() => offlineEmergencyStorage.getPlan());
  const [hasMedicalConsent, setHasMedicalConsent] = useState(() =>
    offlineEmergencyStorage.hasMedicalConsent()
  );
  const [medicalInfo, setMedicalInfo] = useState(() =>
    offlineEmergencyStorage.getMedicalInfo() || {
      bloodType: 'Unknown',
      allergies: '',
      criticalConditions: '',
      medications: '',
      physicianPhone: ''
    }
  );

  // Checklists
  const [kitChecklist, setKitChecklist] = useState(() =>
    offlineEmergencyStorage.getKitChecklist()
  );
  const [evacChecklist, setEvacChecklist] = useState(() =>
    offlineEmergencyStorage.getEvacChecklist()
  );

  // Saved Locations
  const [savedLocations, setSavedLocations] = useState(() =>
    offlineEmergencyStorage.getSavedLocations()
  );

  // Form states for adding contact
  const [newContactName, setNewContactName] = useState('');
  const [newContactPhone, setNewContactPhone] = useState('');
  const [newContactRelation, setNewContactRelation] = useState('');
  const [isAddingContact, setIsAddingContact] = useState(false);
  const [actionNotice, setActionNotice] = useState('');

  // Track online/offline status in real-time
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      offlineEmergencyStorage.recordSyncTimestamp();
      setLastSync(new Date().toISOString());
    };
    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const showTemporaryNotice = (msg) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(''), 3500);
  };

  // Checklist toggle handlers
  const toggleKitItem = (id) => {
    const updated = kitChecklist.map((item) =>
      item.id === id ? { ...item, checked: !item.checked } : item
    );
    setKitChecklist(updated);
    offlineEmergencyStorage.saveKitChecklist(updated);
  };

  const toggleEvacItem = (id) => {
    const updated = evacChecklist.map((item) =>
      item.id === id ? { ...item, checked: !item.checked } : item
    );
    setEvacChecklist(updated);
    offlineEmergencyStorage.saveEvacChecklist(updated);
  };

  // Contact management
  const handleAddContact = (e) => {
    e.preventDefault();
    if (!newContactName.trim() || !newContactPhone.trim()) return;

    const newContact = {
      id: `c-${Date.now()}`,
      name: newContactName.trim(),
      phone: newContactPhone.trim(),
      relation: newContactRelation.trim() || 'Emergency Contact',
      priority: 'Personal'
    };

    const updated = [...contacts, newContact];
    setContacts(updated);
    offlineEmergencyStorage.saveContacts(updated);

    setNewContactName('');
    setNewContactPhone('');
    setNewContactRelation('');
    setIsAddingContact(false);
    showTemporaryNotice('Personal emergency contact saved locally.');
  };

  const handleDeleteContact = (id) => {
    const updated = contacts.filter((c) => c.id !== id);
    setContacts(updated);
    offlineEmergencyStorage.saveContacts(updated);
    showTemporaryNotice('Contact removed from local storage.');
  };

  // Medical info management
  const handleToggleMedicalConsent = (e) => {
    const checked = e.target.checked;
    setHasMedicalConsent(checked);
    offlineEmergencyStorage.setMedicalConsent(checked);
    if (!checked) {
      setMedicalInfo({
        bloodType: 'Unknown',
        allergies: '',
        criticalConditions: '',
        medications: '',
        physicianPhone: ''
      });
      showTemporaryNotice('Medical information wiped from local storage.');
    } else {
      showTemporaryNotice('Medical consent granted. Data stored strictly on this device.');
    }
  };

  const handleSaveMedicalInfo = () => {
    if (!hasMedicalConsent) return;
    offlineEmergencyStorage.saveMedicalInfo(medicalInfo);
    showTemporaryNotice('Medical records updated locally.');
  };

  const handleSavePlan = () => {
    offlineEmergencyStorage.savePlan(plan);
    showTemporaryNotice('Emergency plan saved locally.');
  };

  // Wipe data
  const handlePurgeAll = () => {
    if (window.confirm('Are you sure you want to delete all personal emergency data stored on this browser?')) {
      offlineEmergencyStorage.purgeAllPersonalOfflineData();
      setContacts([]);
      setPlan(offlineEmergencyStorage.getPlan());
      setHasMedicalConsent(false);
      setMedicalInfo(null);
      setKitChecklist(offlineEmergencyStorage.getKitChecklist());
      setEvacChecklist(offlineEmergencyStorage.getEvacChecklist());
      showTemporaryNotice('All locally stored emergency data has been erased.');
    }
  };

  // Export data
  const handleExportData = () => {
    const data = offlineEmergencyStorage.exportPersonalOfflineData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `disasterchain_emergency_plan_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showTemporaryNotice('Personal emergency data exported.');
  };

  return (
    <div className="dc-offline-emergency-page" role="main">
      {/* 1. MINIMAL HIGH-CONTRAST STATUS BAR */}
      <header className="dc-offline-status-bar">
        <div className="dc-status-bar-left">
          <Link to="/" className="dc-offline-exit-link" title={t('common.returnHome', 'Return to Hub')}>
            <ArrowLeft size={16} />
            <span>{t('offline.mainCommand', 'Main Command')}</span>
          </Link>

          {/* Status Indicator Chip */}
          <div className={`dc-connectivity-status-chip ${isOnline ? 'online' : 'offline'}`}>
            <span className={`dc-status-dot ${isOnline ? 'online' : 'offline'}`} />
            <span className="dc-status-label">
              {isOnline ? t('offline.statusOnline', 'ONLINE') : t('offline.statusOffline', 'OFFLINE EMERGENCY MODE')}
            </span>
          </div>

          <div className="dc-cache-meta-chip">
            <Database size={13} />
            <span>
              {lastSync
                ? `${t('offline.cachedData', 'Cached')}: ${new Date(lastSync).toLocaleDateString()} ${new Date(lastSync).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                : t('offline.preCached', 'Pre-cached Core Engine')}
            </span>
          </div>
        </div>

        <div className="dc-status-bar-right">
          <span className="dc-version-badge">{t('offline.version', 'Version')} {OFFLINE_GUIDES_VERSION}</span>
        </div>
      </header>

      {/* Temporary Notice Toast */}
      {actionNotice && (
        <div className="dc-offline-action-toast" role="status">
          <Info size={16} />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* 2. HONEST OFFLINE SOS DISCLAIMER */}
      <section className="dc-offline-sos-hero" aria-label="Emergency SOS Guidance">
        <div className="dc-sos-hero-card">
          <div className="dc-sos-hero-head">
            <Radio size={24} className="dc-sos-pulse-icon" />
            <div>
              <h1 className="dc-sos-headline">{t('offline.title', 'Offline Emergency Command')}</h1>
              <p className="dc-sos-subline">
                {t('offline.tagline', 'High-contrast, fast-loading emergency survival reference. Works 100% without internet.')}
              </p>
            </div>
          </div>

          {/* Clear Truth In Advertising Notice */}
          <div className="dc-sos-reality-alert" role="alert">
            <ShieldAlert size={20} className="dc-reality-icon" />
            <div className="dc-reality-text">
              <strong>{t('offline.truthNotice', 'CRITICAL CONNECTIVITY PROTOCOL:')}</strong>
              <p>
                {t('offline.criticalProtocolDesc', 'Sending an automated distress beacon, transmitting live GPS coordinates, or requesting online responder dispatch requires an active cellular or data network.')}
                <strong> {t('offline.criticalProtocolNotice', 'An automated SOS cannot be sent without internet or cellular connectivity.')}</strong>
              </p>
              <p className="dc-reality-alternative">
                {t('offline.criticalProtocolAlternative', 'If cellular voice calling is available on your device, tap the verified emergency hotlines below for immediate direct telephone dispatch.')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. NAVIGATION TABS */}
      <nav className="dc-offline-tabs-nav" aria-label="Offline Sections">
        <button
          onClick={() => setActiveTab('hotlines')}
          className={`dc-offline-tab-btn ${activeTab === 'hotlines' ? 'active' : ''}`}
        >
          <PhoneCall size={16} />
          <span>{t('offline.hotlines', 'Emergency Hotlines')}</span>
        </button>

        <button
          onClick={() => setActiveTab('guides')}
          className={`dc-offline-tab-btn ${activeTab === 'guides' ? 'active' : ''}`}
        >
          <LifeBuoy size={16} />
          <span>{t('offline.safetyGuides', '10 Safety Guides')}</span>
        </button>

        <button
          onClick={() => setActiveTab('checklists')}
          className={`dc-offline-tab-btn ${activeTab === 'checklists' ? 'active' : ''}`}
        >
          <CheckSquare size={16} />
          <span>{t('offline.checklists', 'Survival Checklists')}</span>
        </button>

        <button
          onClick={() => setActiveTab('personal')}
          className={`dc-offline-tab-btn ${activeTab === 'personal' ? 'active' : ''}`}
        >
          <User size={16} />
          <span>{t('offline.personalPlan', 'Personal Plan & Contacts')}</span>
        </button>

        <button
          onClick={() => setActiveTab('shelters')}
          className={`dc-offline-tab-btn ${activeTab === 'shelters' ? 'active' : ''}`}
        >
          <MapPin size={16} />
          <span>{t('offline.savedShelters', 'Saved Shelters')}</span>
        </button>
      </nav>

      {/* =========================================================================
          TAB 1: VERIFIED EMERGENCY HOTLINES
          ========================================================================= */}
      {activeTab === 'hotlines' && (
        <section className="dc-offline-tab-content" aria-label="Verified Emergency Numbers">
          <div className="dc-section-header">
            <h2 className="dc-section-title">{t('offline.hotlines', 'Verified Emergency Hotlines (India & Universal)')}</h2>
            <p className="dc-section-desc">
              {t('offline.criticalProtocolAlternative', 'Direct telephone links. Tap to place a voice call directly from your device’s cellular dialer.')}
            </p>
          </div>

          <div className="dc-hotlines-grid">
            {EMERGENCY_HOTLINES.map((h) => (
              <div key={h.id} className={`dc-hotline-card ${h.type}`}>
                <div className="dc-hotline-card-info">
                  <div className="dc-hotline-name-row">
                    <span className="dc-hotline-name">{h.name}</span>
                    <span className="dc-hotline-hours">{h.hours}</span>
                  </div>
                  <div className="dc-hotline-service">{h.service}</div>
                  <div className="dc-hotline-number">{h.number}</div>
                </div>

                <a
                  href={`tel:${h.number}`}
                  className="dc-hotline-call-btn"
                  title={`Dial ${h.name} (${h.number})`}
                >
                  <PhoneCall size={18} />
                  <span>{t('offline.callNumber', 'Call')} {h.number}</span>
                </a>
              </div>
            ))}
          </div>

          {/* Personal Saved Contacts Quick Call Bar */}
          {contacts.length > 0 && (
            <div className="dc-personal-hotlines-block">
              <h3 className="dc-sub-heading">{t('offline.personalContactsTitle', 'Your Personal Emergency Contacts')}</h3>
              <div className="dc-personal-contacts-list">
                {contacts.map((c) => (
                  <div key={c.id} className="dc-personal-contact-card">
                    <div>
                      <div className="dc-personal-c-name">{c.name}</div>
                      <div className="dc-personal-c-rel">{c.relation}</div>
                      <div className="dc-personal-c-phone">{c.phone || t('common.none', 'No phone recorded')}</div>
                    </div>
                    {c.phone && (
                      <a href={`tel:${c.phone}`} className="dc-btn dc-btn-primary dc-btn-sm">
                        <PhoneCall size={14} />
                        <span>{t('offline.callNumber', 'Dial')}</span>
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      {/* =========================================================================
          TAB 2: 10 PRE-CACHED DISASTER SAFETY GUIDES
          ========================================================================= */}
      {activeTab === 'guides' && (
        <section className="dc-offline-tab-content" aria-label="Pre-Cached Disaster Guides">
          <div className="dc-section-header">
            <h2 className="dc-section-title">{t('offline.survivalDirectivesTitle', 'Authoritative Offline Safety Guides')}</h2>
            <p className="dc-section-desc">
              {t('offline.survivalDirectivesDesc', 'Pre-cached emergency instructions. All procedures verified against NDMA and FEMA survival standards.')}
            </p>
          </div>

          <div className="dc-offline-guides-accordion">
            {OFFLINE_SAFETY_GUIDES.map((guide) => {
              const isExpanded = expandedGuideId === guide.id;

              return (
                <div key={guide.id} className={`dc-offline-guide-card ${isExpanded ? 'expanded' : ''}`}>
                  <button
                    type="button"
                    onClick={() => setExpandedGuideId(isExpanded ? null : guide.id)}
                    className="dc-guide-accordion-header"
                    aria-expanded={isExpanded}
                  >
                    <div className="dc-guide-header-left">
                      <span className="dc-guide-disaster-pill">{guide.disaster}</span>
                      <h3 className="dc-guide-title">{guide.title}</h3>
                    </div>
                    <div className="dc-guide-header-right">
                      <span className="dc-guide-verified-tag">{t('common.verified', 'Verified')} {guide.lastVerified}</span>
                      {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="dc-guide-accordion-body">
                      {/* Immediate Actions */}
                      <div className="dc-guide-section immediate">
                        <h4 className="dc-guide-sec-title">
                          <CheckSquare size={16} />
                          <span>{t('offline.immediateActions', 'IMMEDIATE ACTIONS (WHAT TO DO NOW)')}</span>
                        </h4>
                        <ul className="dc-guide-bullet-list">
                          {guide.immediateActions.map((act, idx) => (
                            <li key={idx}>{act}</li>
                          ))}
                        </ul>
                      </div>

                      {/* Things to Avoid */}
                      <div className="dc-guide-section avoid">
                        <h4 className="dc-guide-sec-title">
                          <AlertTriangle size={16} />
                          <span>{t('offline.thingsToAvoid', 'THINGS TO NEVER DO (LETHAL HAZARDS)')}</span>
                        </h4>
                        <ul className="dc-guide-bullet-list avoid">
                          {guide.thingsToAvoid.map((avoid, idx) => (
                            <li key={idx}>{avoid}</li>
                          ))}
                        </ul>
                      </div>

                      {/* Key Precautions */}
                      <div className="dc-guide-section precautions">
                        <h4 className="dc-guide-sec-title">
                          <Info size={16} />
                          <span>{t('offline.precautions', 'Safety Precautions & Secondary Risks')}</span>
                        </h4>
                        <ul className="dc-guide-bullet-list">
                          {guide.safetyPrecautions.map((prec, idx) => (
                            <li key={idx}>{prec}</li>
                          ))}
                        </ul>
                      </div>

                      {/* When to Evacuate & Call */}
                      <div className="dc-guide-meta-grid">
                        <div className="dc-guide-meta-cell">
                          <strong>{t('offline.whenToEvacuate', 'When to Evacuate')}:</strong>
                          <p>{guide.whenToEvacuate}</p>
                        </div>
                        <div className="dc-guide-meta-cell">
                          <strong>{t('offline.whenToCall', 'When to Contact Emergency Services')}:</strong>
                          <p>{guide.whenToContactServices}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* =========================================================================
          TAB 3: SURVIVAL CHECKLISTS (OFFLINE STORED)
          ========================================================================= */}
      {activeTab === 'checklists' && (
        <section className="dc-offline-tab-content" aria-label="Interactive Checklists">
          <div className="dc-section-header">
            <h2 className="dc-section-title">{t('offline.checklists', 'Offline Preparedness Checklists')}</h2>
            <p className="dc-section-desc">
              {t('offline.checklistsSubtitle', 'Your checkmarks are saved automatically in your device’s local browser memory.')}
            </p>
          </div>

          <div className="dc-checklists-two-col">
            {/* 72-Hour Survival Kit */}
            <div className="dc-checklist-card">
              <div className="dc-checklist-card-head">
                <CheckSquare size={18} />
                <h3>{t('offline.goBagTitle', '72-Hour Emergency Go-Bag Kit')}</h3>
              </div>
              <p className="dc-checklist-subtitle">{t('offline.goBagSubtitle', 'Essential supplies to sustain one person for 3 days.')}</p>

              <div className="dc-checklist-items-stack">
                {kitChecklist.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => toggleKitItem(item.id)}
                    className={`dc-checklist-item-btn ${item.checked ? 'checked' : ''}`}
                  >
                    {item.checked ? (
                      <CheckSquare size={18} className="dc-check-icon checked" />
                    ) : (
                      <Square size={18} className="dc-check-icon" />
                    )}
                    <span className="dc-item-text">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Evacuation Protocol */}
            <div className="dc-checklist-card">
              <div className="dc-checklist-card-head">
                <ShieldAlert size={18} />
                <h3>{t('offline.evacChecklistTitle', '15-Minute Evacuation Checklist')}</h3>
              </div>
              <p className="dc-checklist-subtitle">{t('offline.evacChecklistSubtitle', 'Immediate actions when sudden departure is ordered.')}</p>

              <div className="dc-checklist-items-stack">
                {evacChecklist.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => toggleEvacItem(item.id)}
                    className={`dc-checklist-item-btn ${item.checked ? 'checked' : ''}`}
                  >
                    {item.checked ? (
                      <CheckSquare size={18} className="dc-check-icon checked" />
                    ) : (
                      <Square size={18} className="dc-check-icon" />
                    )}
                    <span className="dc-item-text">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* =========================================================================
          TAB 4: PERSONAL PLAN, CONTACTS & SENSITIVE MEDICAL INFO
          ========================================================================= */}
      {activeTab === 'personal' && (
        <section className="dc-offline-tab-content" aria-label="Personal Emergency Plan">
          <div className="dc-section-header">
            <h2 className="dc-section-title">{t('offline.personalPlan', 'Personal Emergency Plan & Sensitive Data')}</h2>
            <p className="dc-section-desc">
              {t('offline.localDataNotice', 'All data below is stored STRICTLY ON THIS LOCAL DEVICE. It is never transmitted to any external server or cloud database without your explicit consent.')}
            </p>
          </div>

          <div className="dc-personal-plan-grid">
            {/* 1. Family Meeting Points */}
            <div className="dc-personal-card">
              <div className="dc-card-head">
                <MapPin size={18} />
                <h3>{t('offline.familyMusterTitle', 'Family Muster & Meeting Points')}</h3>
              </div>
              <div className="dc-form-stack">
                <div className="dc-form-group">
                  <label>{t('offline.tier1Label', 'Tier 1: Immediate Home Muster Point (e.g. tree outside gate)')}</label>
                  <input
                    type="text"
                    value={plan.tier1MeetingPoint}
                    onChange={(e) => setPlan({ ...plan, tier1MeetingPoint: e.target.value })}
                    className="dc-input"
                  />
                </div>
                <div className="dc-form-group">
                  <label>{t('offline.tier2Label', 'Tier 2: Neighborhood Point (outside immediate street)')}</label>
                  <input
                    type="text"
                    value={plan.tier2NeighborhoodPoint}
                    onChange={(e) => setPlan({ ...plan, tier2NeighborhoodPoint: e.target.value })}
                    className="dc-input"
                  />
                </div>
                <div className="dc-form-group">
                  <label>{t('offline.tier3Label', 'Tier 3: Regional Meeting Point (adjacent town/county)')}</label>
                  <input
                    type="text"
                    value={plan.tier3RegionalPoint}
                    onChange={(e) => setPlan({ ...plan, tier3RegionalPoint: e.target.value })}
                    className="dc-input"
                  />
                </div>
                <div className="dc-form-group">
                  <label>{t('offline.relayContactLabel', 'Designated Out-of-Area Relay Contact (person all text)')}</label>
                  <input
                    type="text"
                    value={plan.outOfAreaRelayPerson}
                    onChange={(e) => setPlan({ ...plan, outOfAreaRelayPerson: e.target.value })}
                    className="dc-input"
                  />
                </div>
                <button type="button" onClick={handleSavePlan} className="dc-btn dc-btn-primary">
                  {t('offline.savePlan', 'Save Meeting Points')}
                </button>
              </div>
            </div>

            {/* 2. Personal Emergency Contacts */}
            <div className="dc-personal-card">
              <div className="dc-card-head">
                <PhoneCall size={18} />
                <h3>{t('offline.personalContactsTitle', 'Personal Emergency Contacts')}</h3>
              </div>

              <div className="dc-contacts-table">
                {contacts.map((c) => (
                  <div key={c.id} className="dc-contact-row">
                    <div className="dc-contact-meta">
                      <strong>{c.name}</strong> ({c.relation})
                      <span className="dc-contact-num">{c.phone || t('common.none', 'No phone')}</span>
                    </div>
                    <div className="dc-contact-row-actions">
                      {c.phone && (
                        <a href={`tel:${c.phone}`} className="dc-btn dc-btn-sm dc-btn-outline">
                          {t('offline.callNumber', 'Dial')}
                        </a>
                      )}
                      <button
                        type="button"
                        onClick={() => handleDeleteContact(c.id)}
                        className="dc-contact-del-btn"
                        title="Delete contact"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {!isAddingContact ? (
                <button
                  type="button"
                  onClick={() => setIsAddingContact(true)}
                  className="dc-btn dc-btn-secondary dc-add-contact-trigger"
                >
                  <Plus size={16} />
                  <span>{t('offline.addContact', 'Add Emergency Contact')}</span>
                </button>
              ) : (
                <form onSubmit={handleAddContact} className="dc-add-contact-form">
                  <input
                    type="text"
                    placeholder={t('common.fullName', 'Full Name')}
                    value={newContactName}
                    onChange={(e) => setNewContactName(e.target.value)}
                    required
                    className="dc-input"
                  />
                  <input
                    type="tel"
                    placeholder={t('auth.phoneNumber', 'Telephone Number')}
                    value={newContactPhone}
                    onChange={(e) => setNewContactPhone(e.target.value)}
                    required
                    className="dc-input"
                  />
                  <input
                    type="text"
                    placeholder={t('emergencyContacts.relation', 'Relationship (e.g. Spouse, Parent)')}
                    value={newContactRelation}
                    onChange={(e) => setNewContactRelation(e.target.value)}
                    className="dc-input"
                  />
                  <div className="dc-form-actions-row">
                    <button type="submit" className="dc-btn dc-btn-primary dc-btn-sm">
                      {t('common.save', 'Save Contact')}
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsAddingContact(false)}
                      className="dc-btn dc-btn-ghost dc-btn-sm"
                    >
                      {t('common.cancel', 'Cancel')}
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* 3. Sensitive Medical Information (Explicit Consent Gated) */}
            <div className="dc-personal-card dc-medical-card">
              <div className="dc-card-head">
                <HeartPulse size={18} />
                <h3>{t('offline.medicalReferenceTitle', 'Confidential Medical Reference')}</h3>
              </div>

              {/* Explicit Consent Control */}
              <div className="dc-consent-box">
                <label className="dc-consent-label">
                  <input
                    type="checkbox"
                    checked={hasMedicalConsent}
                    onChange={handleToggleMedicalConsent}
                  />
                  <span>
                    {t('offline.explicitMedicalConsent', 'Explicit User Consent: I voluntarily choose to store sensitive medical and prescription details locally in this browser for emergency first-responder reference.')}
                  </span>
                </label>
              </div>

              {hasMedicalConsent && medicalInfo ? (
                <div className="dc-form-stack">
                  <div className="dc-form-group">
                    <label>{t('offline.bloodGroup', 'Blood Group')}</label>
                    <input
                      type="text"
                      placeholder="e.g. O+, A-, B+"
                      value={medicalInfo.bloodType}
                      onChange={(e) => setMedicalInfo({ ...medicalInfo, bloodType: e.target.value })}
                      className="dc-input"
                    />
                  </div>
                  <div className="dc-form-group">
                    <label>{t('offline.allergiesLabel', 'Known Severe Allergies (Penicillin, Peanuts, Latex, etc.)')}</label>
                    <input
                      type="text"
                      placeholder="List all life-threatening allergies"
                      value={medicalInfo.allergies}
                      onChange={(e) => setMedicalInfo({ ...medicalInfo, allergies: e.target.value })}
                      className="dc-input"
                    />
                  </div>
                  <div className="dc-form-group">
                    <label>{t('offline.chronicConditionsLabel', 'Chronic Medical Conditions (Asthma, Diabetes, Cardiac, etc.)')}</label>
                    <input
                      type="text"
                      placeholder="Diagnosed chronic conditions"
                      value={medicalInfo.criticalConditions}
                      onChange={(e) => setMedicalInfo({ ...medicalInfo, criticalConditions: e.target.value })}
                      className="dc-input"
                    />
                  </div>
                  <div className="dc-form-group">
                    <label>{t('offline.medicationsLabel', 'Critical Daily Medications & Dosage')}</label>
                    <textarea
                      rows={2}
                      placeholder="e.g. Insulin glargine 20u nightly; Albuterol inhaler"
                      value={medicalInfo.medications}
                      onChange={(e) => setMedicalInfo({ ...medicalInfo, medications: e.target.value })}
                      className="dc-input"
                    />
                  </div>
                  <button type="button" onClick={handleSaveMedicalInfo} className="dc-btn dc-btn-primary">
                    {t('offline.saveMedicalData', 'Save Confidential Medical Data')}
                  </button>
                </div>
              ) : (
                <div className="dc-consent-notice">
                  <Info size={16} />
                  <span>
                    {t('offline.medicalDisabledNotice', 'Medical storage is currently disabled. Check the consent box above to enable local medical records.')}
                  </span>
                </div>
              )}
            </div>

            {/* 4. Privacy & Data Controls */}
            <div className="dc-personal-card dc-privacy-card">
              <div className="dc-card-head">
                <FileText size={18} />
                <h3>{t('offline.dataGovernanceTitle', 'Data Governance & Export')}</h3>
              </div>
              <p className="dc-privacy-note">
                {t('offline.dataGovernanceDesc', 'You retain complete sovereignty over your emergency information. You can export a JSON backup to keep in your Go-Bag or erase all records permanently.')}
              </p>
              <div className="dc-privacy-actions">
                <button type="button" onClick={handleExportData} className="dc-btn dc-btn-outline">
                  <Download size={15} />
                  <span>{t('offline.exportData', 'Export JSON Backup')}</span>
                </button>
                <button type="button" onClick={handlePurgeAll} className="dc-btn dc-btn-danger">
                  <Trash2 size={15} />
                  <span>{t('offline.eraseData', 'Erase All Local Data')}</span>
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* =========================================================================
          TAB 5: SAVED SHELTERS & PREVIOUSLY CACHED LOCATIONS
          ========================================================================= */}
      {activeTab === 'shelters' && (
        <section className="dc-offline-tab-content" aria-label="Saved Shelters">
          <div className="dc-section-header">
            <h2 className="dc-section-title">{t('offline.savedSheltersTitle', 'Saved Locations & Cached Shelters')}</h2>
            <p className="dc-section-desc">
              {t('offline.savedSheltersDesc', 'Previously viewed shelters and home coordinates. Note: Live capacity cannot be updated without internet.')}
            </p>
          </div>

          <div className="dc-shelters-offline-grid">
            {savedLocations.map((loc) => (
              <div key={loc.id} className="dc-saved-location-card">
                <div className="dc-location-icon-box">
                  <MapPin size={22} />
                </div>
                <div className="dc-location-info">
                  <h3 className="dc-location-name">{loc.name}</h3>
                  <p className="dc-location-address">{loc.address}</p>
                  {loc.capacityNote && (
                    <span className="dc-capacity-warning-tag">
                      <AlertTriangle size={13} />
                      {loc.capacityNote}
                    </span>
                  )}
                  <div className="dc-location-timestamp">
                    <Clock size={12} />
                    <span>{t('offline.cachedData', 'Cached')}: {loc.lastUpdated}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="dc-map-disclaimer-box">
            <Info size={16} />
            <span>
              {t('offline.mapDataNotice', 'Map Data Notice: Offline maps display previously loaded vector boundaries and pinned shelter coordinates. Turn-by-turn road navigation and live bridge closures require active GPS telemetry and network routing.')}
            </span>
          </div>
        </section>
      )}
    </div>
  );
}
