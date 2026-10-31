import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home,
  CloudRain,
  MapPin,
  AlertTriangle,
  Shield,
  ShieldAlert,
  PhoneCall,
  Sparkles,
  Compass,
  Settings,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  User,
  LogOut,
  Radio,
  Download,
  RotateCcw,
  FileText,
  Volume2,
  VolumeX,
  Check,
  Globe,
  Search,
  Mic,
  GraduationCap,
  WifiOff,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useWeatherGPT } from '../context/WeatherGPTContext';
import { useEnvironment, ENVIRONMENTS } from '../context/EnvironmentContext';
import { useTranslation } from '../i18n/i18n';

const SIDEBAR_COLLAPSED_KEY = 'disasterchain_sidebar_collapsed';

export default function ModernNav({ onOpenSos, onReplayIntro, onOpenAppModal, onStartTour }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const weatherGPT = useWeatherGPT();
  const { environment, setEnvironment, currentMeta, isSoundEnabled, toggleSound } = useEnvironment();
  const { t, currentLanguage, setLanguage, languages, languageConfig, isRtl } = useTranslation();

  // Collapsed state on desktop (persisted in localStorage)
  const [isCollapsed, setIsCollapsed] = useState(() => {
    try {
      return localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === 'true';
    } catch (e) {
      return false;
    }
  });

  // Mobile drawer, settings & search states
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isContactsOpen, setIsContactsOpen] = useState(false);
  const [langSearch, setLangSearch] = useState('');

  // Sync CSS variable --dc-sidebar-width to root document for smooth layout adaptation
  useEffect(() => {
    const width = isCollapsed ? '72px' : '260px';
    document.documentElement.style.setProperty('--dc-sidebar-width', width);
    try {
      localStorage.setItem(SIDEBAR_COLLAPSED_KEY, isCollapsed ? 'true' : 'false');
    } catch (e) {}
  }, [isCollapsed]);

  // Close mobile drawer on route change
  useEffect(() => {
    setIsMobileDrawerOpen(false);
  }, [location.pathname]);

  // Listen for voice-triggered modal openings
  useEffect(() => {
    const handleOpenContacts = () => setIsContactsOpen(true);
    const handleOpenSettings = () => setIsSettingsOpen(true);
    window.addEventListener('dc:openContacts', handleOpenContacts);
    window.addEventListener('dc:openSettings', handleOpenSettings);
    return () => {
      window.removeEventListener('dc:openContacts', handleOpenContacts);
      window.removeEventListener('dc:openSettings', handleOpenSettings);
    };
  }, []);

  const toggleCollapse = () => {
    setIsCollapsed((prev) => !prev);
  };

  const isCurrentActive = (path, exact = false) => {
    if (exact) {
      return location.pathname === '/' || location.pathname === '/dashboard';
    }
    if (path === '/map') {
      return location.pathname === '/map' || location.pathname === '/affected-areas';
    }
    if (path === '/safety') {
      return location.pathname === '/safety' || location.pathname === '/sos';
    }
    return location.pathname.startsWith(path);
  };

  // Main 5 core navigation items
  const mainItems = [
    { to: '/', label: t('nav.home', 'Home'), icon: Home, exact: true, id: 'dc-sidebar-home' },
    { to: '/weather', label: t('nav.weather', 'Weather'), icon: CloudRain, id: 'dc-sidebar-weather' },
    { to: '/map', label: t('nav.map', 'Map'), icon: MapPin, id: 'dc-sidebar-map' },
    { to: '/incidents', label: t('nav.incidents', 'Incidents'), icon: AlertTriangle, id: 'dc-sidebar-incidents' },
    { to: '/safety', label: t('nav.safety', 'Safety'), icon: Shield, id: 'dc-sidebar-safety' },
  ];

  // Emergency Contacts quick registry
  const emergencyContacts = [
    { name: 'National Emergency Dispatch', number: '112', desc: 'Universal Police, Fire & Paramedic' },
    { name: 'Disaster Cell Helpline (NDRF)', number: '1078', desc: 'National Disaster Management' },
    { name: 'Ambulance & Trauma Cell', number: '108', desc: 'Emergency Medical Services' },
    { name: 'Police Control Room', number: '100', desc: 'Citizen Safety & Law Enforcement' },
  ];

  return (
    <>
      {/* =========================================================================
          DESKTOP & TABLET FIXED LEFT SIDEBAR
          ========================================================================= */}
      <aside
        className={`dc-sidebar ${isCollapsed ? 'collapsed' : ''}`}
        aria-label="Main Navigation Sidebar"
      >
        {/* Sidebar Brand Header */}
        <div className="dc-sidebar-header">
          <NavLink to="/" className="dc-sidebar-brand" title="DisasterChain Home">
            <span className="dc-brand-earth-dot" />
            {!isCollapsed && (
              <div className="dc-sidebar-brand-text">
                <span className="dc-brand-title">
                  DISASTER<span className="dc-brand-accent">CHAIN</span>
                </span>
                <span className="dc-brand-tag">Earth Intelligence</span>
              </div>
            )}
          </NavLink>

          <button
            onClick={toggleCollapse}
            className="dc-sidebar-toggle-btn"
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
          </button>
        </div>

        {/* Scrollable Navigation Body */}
        <div className="dc-sidebar-scroll-body dc-sidebar-nav">
          {/* SECTION: MAIN */}
          <div className="dc-sidebar-section">
            {!isCollapsed && (
              <span className="dc-sidebar-section-title">
                {t('nav.main', 'MAIN')}
              </span>
            )}
            <nav className="dc-sidebar-items" aria-label="Main Operations">
              {mainItems.map((item) => {
                const active = isCurrentActive(item.to, item.exact);
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    id={item.id}
                    to={item.to}
                    className={`dc-sidebar-link ${active ? 'active' : ''}`}
                    title={isCollapsed ? item.label : undefined}
                  >
                    <Icon size={18} className="dc-sidebar-icon" />
                    {!isCollapsed && <span className="dc-sidebar-label">{item.label}</span>}
                    {active && <span className="dc-sidebar-active-indicator" />}
                  </NavLink>
                );
              })}
            </nav>
          </div>

          {/* SECTION: RESOURCES */}
          <div className="dc-sidebar-section">
            {!isCollapsed && (
              <span className="dc-sidebar-section-title">
                {t('nav.resources', 'RESOURCES')}
              </span>
            )}
            <nav className="dc-sidebar-items" aria-label="Emergency Resources">
              <NavLink
                to="/shelters"
                id="dc-sidebar-shelters"
                className={`dc-sidebar-link ${isCurrentActive('/shelters') ? 'active' : ''}`}
                title={isCollapsed ? t('nav.shelters', 'Shelters') : undefined}
              >
                <Home size={18} className="dc-sidebar-icon" />
                {!isCollapsed && (
                  <span className="dc-sidebar-label">{t('nav.shelters', 'Shelters')}</span>
                )}
                {isCurrentActive('/shelters') && <span className="dc-sidebar-active-indicator" />}
              </NavLink>

              <NavLink
                to="/academy"
                id="dc-sidebar-academy"
                className={`dc-sidebar-link ${isCurrentActive('/academy') ? 'active' : ''}`}
                title={isCollapsed ? t('nav.academy', 'Disaster Academy') : undefined}
              >
                <GraduationCap size={18} className="dc-sidebar-icon" />
                {!isCollapsed && (
                  <span className="dc-sidebar-label">{t('nav.academy', 'Disaster Academy')}</span>
                )}
                {isCurrentActive('/academy') && <span className="dc-sidebar-active-indicator" />}
              </NavLink>

              <NavLink
                to="/offline"
                id="dc-sidebar-offline"
                className={`dc-sidebar-link ${isCurrentActive('/offline') ? 'active' : ''}`}
                title={isCollapsed ? t('nav.offlineMode', 'Offline Mode') : undefined}
              >
                <WifiOff size={18} className="dc-sidebar-icon" />
                {!isCollapsed && (
                  <span className="dc-sidebar-label">{t('nav.offlineMode', 'Offline Mode')}</span>
                )}
                {isCurrentActive('/offline') && <span className="dc-sidebar-active-indicator" />}
              </NavLink>

              <button
                type="button"
                id="dc-sidebar-contacts"
                onClick={() => setIsContactsOpen(true)}
                className="dc-sidebar-link dc-sidebar-action-btn"
                title={isCollapsed ? t('nav.emergencyContacts', 'Emergency Contacts') : undefined}
              >
                <PhoneCall size={18} className="dc-sidebar-icon" />
                {!isCollapsed && (
                  <span className="dc-sidebar-label">
                    {t('nav.emergencyContacts', 'Emergency Contacts')}
                  </span>
                )}
              </button>

              <button
                type="button"
                id="dc-sidebar-weathergpt"
                onClick={() => {
                  if (weatherGPT?.openWeatherGPT) {
                    weatherGPT.openWeatherGPT();
                  } else {
                    navigate('/weather');
                  }
                }}
                className="dc-sidebar-link dc-sidebar-action-btn dc-sidebar-copilot-link"
                title={isCollapsed ? 'WeatherGPT Copilot' : undefined}
              >
                <Sparkles size={18} className="dc-sidebar-icon dc-sparkle-icon" />
                {!isCollapsed && (
                  <div className="dc-sidebar-copilot-label">
                    <span>WeatherGPT</span>
                    <span className="dc-copilot-badge">AI</span>
                  </div>
                )}
              </button>
            </nav>
          </div>

          {/* SECTION: ADMINISTRATION (Persistently visible after admin login across all pages) */}
          {isAdmin && (
            <div className="dc-sidebar-section" id="dc-sidebar-admin-section">
              {!isCollapsed && (
                <span className="dc-sidebar-section-title">
                  {t('admin.adminCommand', 'ADMINISTRATION')}
                </span>
              )}
              <nav className="dc-sidebar-items" aria-label="Administrator Command">
                <NavLink
                  to="/admin"
                  id="dc-sidebar-admin"
                  className={`dc-sidebar-link dc-sidebar-admin-link ${isCurrentActive('/admin') ? 'active' : ''}`}
                  title={isCollapsed ? t('admin.adminTitle', 'Admin Command') : undefined}
                >
                  <ShieldAlert size={18} className="dc-sidebar-icon dc-admin-icon" />
                  {!isCollapsed && (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                      <span className="dc-sidebar-label">{t('admin.adminCommand', 'Admin Command')}</span>
                      <span className="dc-admin-badge">ADMIN</span>
                    </div>
                  )}
                  {isCurrentActive('/admin') && <span className="dc-sidebar-active-indicator" />}
                </NavLink>
              </nav>
            </div>
          )}

          {/* SECTION: OTHER */}
          <div className="dc-sidebar-section">
            {!isCollapsed && (
              <span className="dc-sidebar-section-title">
                {t('nav.system', 'OTHER')}
              </span>
            )}
            <nav className="dc-sidebar-items" aria-label="System Tools">
              <button
                type="button"
                id="dc-sidebar-tour"
                onClick={() => {
                  if (onStartTour) onStartTour();
                }}
                className="dc-sidebar-link dc-sidebar-action-btn"
                title={isCollapsed ? t('nav.helpTour', 'Help & Tour') : undefined}
              >
                <Compass size={18} className="dc-sidebar-icon" />
                {!isCollapsed && (
                  <span className="dc-sidebar-label">{t('nav.helpTour', 'Help & Tour')}</span>
                )}
              </button>

              <button
                type="button"
                id="dc-sidebar-voice-btn"
                onClick={() => {
                  const voiceBtn = document.getElementById('dc-global-voice-assistant-btn');
                  if (voiceBtn) voiceBtn.click();
                }}
                className="dc-sidebar-link dc-sidebar-action-btn"
                title={isCollapsed ? 'Voice Control (Alt+V)' : undefined}
              >
                <Mic size={18} className="dc-sidebar-icon" />
                {!isCollapsed && (
                  <span className="dc-sidebar-label">Voice Control</span>
                )}
              </button>

              <button
                type="button"
                id="dc-sidebar-settings"
                onClick={() => setIsSettingsOpen(true)}
                className="dc-sidebar-link dc-sidebar-action-btn"
                title={isCollapsed ? t('nav.settings', 'Settings') : undefined}
              >
                <Settings size={18} className="dc-sidebar-icon" />
                {!isCollapsed && (
                  <span className="dc-sidebar-label">{t('nav.settings', 'Settings')}</span>
                )}
              </button>

              {/* Quick Language Switcher Trigger */}
              <button
                type="button"
                id="dc-sidebar-language"
                onClick={() => setIsSettingsOpen(true)}
                className="dc-sidebar-link dc-sidebar-action-btn"
                title={`Language: ${languageConfig?.nativeName || languageConfig?.name || 'English'}`}
              >
                <Globe size={18} className="dc-sidebar-icon" />
                {!isCollapsed && (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                    <span className="dc-sidebar-label">
                      {languageConfig?.nativeName?.split('/')[0]?.trim() || languageConfig?.name || 'English'}
                    </span>
                    <span style={{ fontSize: '0.68rem', padding: '1px 5px', borderRadius: 4, background: 'rgba(73, 107, 90, 0.14)', color: 'var(--dc-earth-green)', fontWeight: 700 }}>
                      {currentLanguage.toUpperCase()}
                    </span>
                  </div>
                )}
              </button>
            </nav>
          </div>
        </div>

        {/* Sidebar Pinned Footer: SOS Action & Operator Status */}
        <div className="dc-sidebar-footer">
          {/* Emergency SOS Button */}
          <button
            type="button"
            id="dc-sidebar-sos-btn"
            onClick={onOpenSos}
            className="dc-sidebar-sos-btn"
            title="Emergency SOS Distress Dispatch"
            aria-label="Broadcast Emergency SOS"
          >
            <Radio size={16} className="dc-pulse-icon" />
            {!isCollapsed && <span>{t('emergency.broadcastSos', 'EMERGENCY SOS')}</span>}
          </button>

          {/* Operator / Account Row */}
          <div className="dc-sidebar-account-row">
            {isAuthenticated ? (
              <div className="dc-sidebar-user-info" title={user?.email || 'Logged In'}>
                <div className="dc-sidebar-avatar">
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                {!isCollapsed && (
                  <div className="dc-sidebar-user-meta">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflow: 'hidden' }}>
                      <span className="dc-sidebar-username">{user?.name?.split(' ')[0] || 'Operator'}</span>
                      {isAdmin && (
                        <span className="dc-admin-badge" style={{ fontSize: '0.62rem', padding: '1px 5px' }}>
                          ADMIN
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => {
                        logout();
                        navigate('/');
                      }}
                      className="dc-sidebar-signout-btn"
                      title="Sign Out"
                    >
                      <LogOut size={12} />
                      <span>Exit</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <NavLink
                to="/login"
                className="dc-sidebar-login-link"
                title={isCollapsed ? 'Sign In / Operator' : undefined}
              >
                <User size={16} />
                {!isCollapsed && <span>Sign In</span>}
              </NavLink>
            )}
          </div>
        </div>
      </aside>

      {/* =========================================================================
          MOBILE TOP HEADER (< 768px)
          ========================================================================= */}
      <header className="dc-mobile-header" role="banner">
        <button
          type="button"
          onClick={() => setIsMobileDrawerOpen(true)}
          className="dc-mobile-menu-btn"
          aria-label="Open Navigation Menu"
        >
          <Menu size={20} />
        </button>

        <NavLink to="/" className="dc-mobile-brand">
          <span className="dc-brand-earth-dot" />
          <span className="dc-brand-title">
            DISASTER<span className="dc-brand-accent">CHAIN</span>
          </span>
        </NavLink>

        <button
          type="button"
          id="dc-mobile-sos-btn"
          onClick={onOpenSos}
          className="dc-mobile-sos-header-btn"
          title="Emergency SOS"
          aria-label="Broadcast Emergency SOS"
        >
          <Radio size={14} className="dc-pulse-icon" />
          <span>SOS</span>
        </button>
      </header>

      {/* =========================================================================
          MOBILE OFF-CANVAS DRAWER (< 768px)
          ========================================================================= */}
      <AnimatePresence>
        {isMobileDrawerOpen && (
          <>
            <motion.div
              className="dc-mobile-drawer-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileDrawerOpen(false)}
            />

            <motion.div
              className="dc-mobile-drawer"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
              role="dialog"
              aria-modal="true"
              aria-label="Navigation Drawer"
            >
              <div className="dc-drawer-header">
                <div className="dc-sidebar-brand-text">
                  <span className="dc-brand-title">
                    DISASTER<span className="dc-brand-accent">CHAIN</span>
                  </span>
                  <span className="dc-brand-tag">Earth Intelligence</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsMobileDrawerOpen(false)}
                  className="dc-drawer-close-btn"
                  aria-label="Close menu"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="dc-drawer-content">
                <span className="dc-sidebar-section-title">MAIN OPERATIONS</span>
                <nav className="dc-drawer-nav">
                  {mainItems.map((item) => {
                    const active = isCurrentActive(item.to, item.exact);
                    const Icon = item.icon;
                    return (
                      <NavLink
                        key={item.to}
                        to={item.to}
                        onClick={() => setIsMobileDrawerOpen(false)}
                        className={`dc-drawer-link ${active ? 'active' : ''}`}
                      >
                        <Icon size={18} />
                        <span>{item.label}</span>
                      </NavLink>
                    );
                  })}
                </nav>

                <div className="dc-drawer-divider" />
                <span className="dc-sidebar-section-title">RESOURCES</span>
                <nav className="dc-drawer-nav">
                  <NavLink
                    to="/shelters"
                    onClick={() => setIsMobileDrawerOpen(false)}
                    className="dc-drawer-link"
                  >
                    <Home size={18} />
                    <span>Shelters Directory</span>
                  </NavLink>

                  <NavLink
                    to="/academy"
                    onClick={() => setIsMobileDrawerOpen(false)}
                    className="dc-drawer-link"
                  >
                    <GraduationCap size={18} />
                    <span>Disaster Academy</span>
                  </NavLink>

                  <NavLink
                    to="/offline"
                    onClick={() => setIsMobileDrawerOpen(false)}
                    className="dc-drawer-link"
                  >
                    <WifiOff size={18} />
                    <span>Offline Emergency Mode</span>
                  </NavLink>

                  <button
                    type="button"
                    onClick={() => {
                      setIsMobileDrawerOpen(false);
                      setIsContactsOpen(true);
                    }}
                    className="dc-drawer-link dc-drawer-btn"
                  >
                    <PhoneCall size={18} />
                    <span>Emergency Contacts</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsMobileDrawerOpen(false);
                      if (weatherGPT?.openWeatherGPT) weatherGPT.openWeatherGPT();
                    }}
                    className="dc-drawer-link dc-drawer-btn dc-copilot-link"
                  >
                    <Sparkles size={18} className="dc-sparkle-icon" />
                    <span>WeatherGPT Copilot</span>
                  </button>
                </nav>

                {isAdmin && (
                  <>
                    <div className="dc-drawer-divider" />
                    <span className="dc-sidebar-section-title">ADMINISTRATION</span>
                    <nav className="dc-drawer-nav">
                      <NavLink
                        to="/admin"
                        onClick={() => setIsMobileDrawerOpen(false)}
                        className={`dc-drawer-link ${isCurrentActive('/admin') ? 'active' : ''}`}
                      >
                        <ShieldAlert size={18} />
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                          <span>{t('admin.adminCommand', 'Admin Command')}</span>
                          <span className="dc-admin-badge">ADMIN</span>
                        </div>
                      </NavLink>
                    </nav>
                  </>
                )}

                <div className="dc-drawer-divider" />
                <span className="dc-sidebar-section-title">SYSTEM TOOLS</span>
                <nav className="dc-drawer-nav">
                  <button
                    type="button"
                    onClick={() => {
                      setIsMobileDrawerOpen(false);
                      if (onStartTour) onStartTour();
                    }}
                    className="dc-drawer-link dc-drawer-btn"
                  >
                    <Compass size={18} />
                    <span>Help & Tour</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsMobileDrawerOpen(false);
                      setIsSettingsOpen(true);
                    }}
                    className="dc-drawer-link dc-drawer-btn"
                  >
                    <Settings size={18} />
                    <span>Atmospheric Settings</span>
                  </button>
                </nav>
              </div>

              <div className="dc-drawer-footer">
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileDrawerOpen(false);
                    onOpenSos();
                  }}
                  className="dc-sidebar-sos-btn"
                >
                  <Radio size={16} className="dc-pulse-icon" />
                  <span>EMERGENCY SOS</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* =========================================================================
          MOBILE BOTTOM NAVIGATION (< 768px)
          ========================================================================= */}
      <nav className="dc-mobile-bottom-nav" role="navigation" aria-label="Mobile Navigation">
        {mainItems.map((item) => {
          const active = isCurrentActive(item.to, item.exact);
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={`dc-mobile-tab ${active ? 'active' : ''}`}
            >
              <Icon size={18} className="dc-mobile-tab-icon" />
              <span className="dc-mobile-tab-label">{item.label}</span>
              {active && <span className="dc-mobile-tab-indicator" />}
            </NavLink>
          );
        })}
      </nav>

      {/* =========================================================================
          EMERGENCY CONTACTS MODAL
          ========================================================================= */}
      <AnimatePresence>
        {isContactsOpen && (
          <div className="dc-modal-overlay" onClick={() => setIsContactsOpen(false)}>
            <motion.div
              className="dc-contacts-modal"
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-labelledby="dc-contacts-modal-title"
            >
              <div className="dc-modal-header">
                <div>
                  <h3 id="dc-contacts-modal-title" className="dc-modal-title">
                    National Emergency Contacts
                  </h3>
                  <span className="dc-modal-subtitle">
                    Direct helplines for urgent life safety and crisis dispatch
                  </span>
                </div>
                <button
                  onClick={() => setIsContactsOpen(false)}
                  className="dc-modal-close-btn"
                  aria-label="Close contacts"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="dc-contacts-modal-body">
                {emergencyContacts.map((c) => (
                  <a
                    key={c.number}
                    href={`tel:${c.number}`}
                    className="dc-contact-modal-card"
                    title={`Dial ${c.name} (${c.number})`}
                  >
                    <div className="dc-contact-modal-info">
                      <span className="dc-contact-modal-name">{c.name}</span>
                      <span className="dc-contact-modal-desc">{c.desc}</span>
                    </div>
                    <div className="dc-contact-modal-dial">
                      <PhoneCall size={15} />
                      <span>{c.number}</span>
                    </div>
                  </a>
                ))}
              </div>

              <div className="dc-modal-footer">
                <button
                  type="button"
                  onClick={() => {
                    setIsContactsOpen(false);
                    onOpenSos();
                  }}
                  className="dc-contacts-sos-action-btn"
                >
                  <Radio size={14} />
                  <span>Broadcast SOS Distress Beacon</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* =========================================================================
          SETTINGS & ATMOSPHERE MODAL
          ========================================================================= */}
      <AnimatePresence>
        {isSettingsOpen && (
          <div className="dc-modal-overlay" onClick={() => setIsSettingsOpen(false)}>
            <motion.div
              className="dc-settings-modal"
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-labelledby="dc-settings-modal-title"
            >
              <div className="dc-modal-header">
                <div>
                  <h3 id="dc-settings-modal-title" className="dc-modal-title">
                    Platform Settings & Atmosphere
                  </h3>
                  <span className="dc-modal-subtitle">
                    Customize environmental ambiance, sound effects, and preferences
                  </span>
                </div>
                <button
                  onClick={() => setIsSettingsOpen(false)}
                  className="dc-modal-close-btn"
                  aria-label="Close settings"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="dc-settings-modal-body">
                {/* 0. Global Language Selector (20 Supported Languages) */}
                <div className="dc-settings-section">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span className="dc-settings-section-title" style={{ margin: 0 }}>
                      {t('common.language', 'Language')} ({languages.length})
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--dc-earth-green)', fontWeight: 600 }}>
                      Active: {languageConfig?.nativeName || 'English'}
                    </span>
                  </div>
                  <div style={{ position: 'relative', marginBottom: 10 }}>
                    <Search size={14} style={{ position: 'absolute', left: 10, top: 9, color: 'var(--text-muted)' }} />
                    <input
                      type="text"
                      value={langSearch}
                      onChange={(e) => setLangSearch(e.target.value)}
                      placeholder={t('common.searchLanguage', 'Search language (e.g. Hindi, Punjabi, Bengali, Tamil)...')}
                      style={{
                        width: '100%',
                        padding: '7px 12px 7px 32px',
                        borderRadius: 8,
                        border: '1px solid var(--border-subtle)',
                        background: 'var(--dc-surface)',
                        fontSize: '0.82rem',
                        outline: 'none',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>
                  <div className="dc-lang-grid">
                    {languages
                      .filter((l) =>
                        l.name.toLowerCase().includes(langSearch.toLowerCase()) ||
                        l.nativeName.toLowerCase().includes(langSearch.toLowerCase()) ||
                        l.code.toLowerCase().includes(langSearch.toLowerCase())
                      )
                      .map((lang) => {
                        const isSelected = currentLanguage === lang.code;
                        return (
                          <button
                            key={lang.code}
                            type="button"
                            data-lang-code={lang.code}
                            onClick={() => setLanguage(lang.code)}
                            className={`dc-lang-card-btn ${isSelected ? 'active' : ''}`}
                          >
                            <span style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                              {lang.nativeName}
                            </span>
                            <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                              {lang.name} {lang.isRtl ? '· RTL' : ''}
                            </span>
                            {isSelected && (
                              <span style={{ fontSize: '0.7rem', color: 'var(--dc-earth-green)', fontWeight: 700, marginTop: 2 }}>
                                ✓ Active
                              </span>
                            )}
                          </button>
                        );
                      })}
                  </div>
                </div>

                {/* 1. Atmospheric Canvas Environment */}
                <div className="dc-settings-section">
                  <span className="dc-settings-section-title">Living Atmosphere Canvas</span>
                  <div className="dc-env-chips-grid">
                    {ENVIRONMENTS.map((env) => {
                      const isSelected = environment === env.id;
                      return (
                        <button
                          key={env.id}
                          type="button"
                          onClick={() => setEnvironment(env.id)}
                          className={`dc-env-chip ${isSelected ? 'active' : ''}`}
                        >
                          <span
                            className="dc-env-color-dot"
                            style={{ backgroundColor: env.color }}
                          />
                          <span>{env.label}</span>
                          {isSelected && <Check size={14} className="dc-env-check" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Audio Effects */}
                <div className="dc-settings-section dc-settings-row-between">
                  <div>
                    <span className="dc-settings-row-label">Ambient Atmospheric Sound</span>
                    <span className="dc-settings-row-desc">
                      Subtle procedural background wind and rain textures
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={toggleSound}
                    className={`dc-sound-toggle-btn ${isSoundEnabled ? 'enabled' : ''}`}
                  >
                    {isSoundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
                    <span>{isSoundEnabled ? 'Sound On' : 'Muted'}</span>
                  </button>
                </div>

                {/* 3. Replay Intro */}
                {onReplayIntro && (
                  <div className="dc-settings-section dc-settings-row-between">
                    <div>
                      <span className="dc-settings-row-label">Cinematic Intro Experience</span>
                      <span className="dc-settings-row-desc">
                        Re-experience the 5-scene Earth Intelligence prologue
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setIsSettingsOpen(false);
                        onReplayIntro();
                      }}
                      className="dc-settings-action-btn"
                    >
                      <RotateCcw size={14} />
                      <span>Replay Intro</span>
                    </button>
                  </div>
                )}

                {/* 4. Android APK */}
                {onOpenAppModal && (
                  <div className="dc-settings-section dc-settings-row-between">
                    <div>
                      <span className="dc-settings-row-label">Android Mobile Application</span>
                      <span className="dc-settings-row-desc">
                        Direct download for Android APK / TWA installer
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setIsSettingsOpen(false);
                        onOpenAppModal();
                      }}
                      className="dc-settings-action-btn"
                    >
                      <Download size={14} />
                      <span>Download APK</span>
                    </button>
                  </div>
                )}

                {/* 5. Transparency Ledger */}
                <div className="dc-settings-section dc-settings-row-between">
                  <div>
                    <span className="dc-settings-row-label">Audit & Transparency Ledger</span>
                    <span className="dc-settings-row-desc">
                      Cryptographic immutable ledger for relief resources
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setIsSettingsOpen(false);
                      navigate('/transparency');
                    }}
                    className="dc-settings-action-btn"
                  >
                    <FileText size={14} />
                    <span>View Ledger</span>
                  </button>
                </div>
              </div>

              <div className="dc-modal-footer">
                <button
                  type="button"
                  onClick={() => setIsSettingsOpen(false)}
                  className="dc-modal-done-btn"
                >
                  Done
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
