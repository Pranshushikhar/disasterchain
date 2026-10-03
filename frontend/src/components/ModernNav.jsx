import React, { useState, useRef, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home,
  CloudRain,
  MapPin,
  AlertTriangle,
  Shield,
  LifeBuoy,
  MoreHorizontal,
  Download,
  BookOpen,
  HeartHandshake,
  FileText,
  RotateCcw,
} from 'lucide-react';

export default function ModernNav({ onOpenSos, onReplayIntro, onOpenAppModal }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const moreRef = useRef(null);

  // Close more menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (moreRef.current && !moreRef.current.contains(e.target)) {
        setIsMoreOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Primary 5 navigation items
  const navItems = [
    { to: '/', label: 'Home', icon: Home, exact: true },
    { to: '/weather', label: 'Weather', icon: CloudRain },
    { to: '/map', label: 'Map', icon: MapPin },
    { to: '/incidents', label: 'Incidents', icon: AlertTriangle },
    { to: '/safety', label: 'Safety', icon: Shield },
  ];

  const isCurrentActive = (item) => {
    if (item.exact) {
      return location.pathname === '/' || location.pathname === '/dashboard';
    }
    if (item.to === '/map') {
      return location.pathname === '/map' || location.pathname === '/affected-areas';
    }
    if (item.to === '/safety') {
      return location.pathname === '/safety' || location.pathname === '/sos';
    }
    return location.pathname.startsWith(item.to);
  };

  return (
    <>
      {/* =========================================================================
          DESKTOP TOP NAVIGATION
          ========================================================================= */}
      <header className="dc-desktop-nav" role="banner">
        <div className="dc-nav-container">
          {/* Brand Wordmark & Earth Status */}
          <div className="dc-brand-group">
            <NavLink to="/" className="dc-brand-link">
              <span className="dc-brand-earth-dot" />
              <span className="dc-brand-title">
                DISASTER<span className="dc-brand-accent">CHAIN</span>
              </span>
            </NavLink>
            <span className="dc-brand-tag">Earth Intelligence</span>
          </div>

          {/* Primary Centered Navigation Pills */}
          <nav className="dc-nav-links" role="navigation" aria-label="Main Navigation">
            {navItems.map((item) => {
              const active = isCurrentActive(item);
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={`dc-nav-tab ${active ? 'active' : ''}`}
                >
                  {active && (
                    <motion.div
                      layoutId="dc-active-pill"
                      className="dc-active-pill-background"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                  <Icon size={16} className="dc-tab-icon" />
                  <span className="dc-tab-label">{item.label}</span>
                </NavLink>
              );
            })}
          </nav>

          {/* Right Action Suite: SOS + More Dropdown */}
          <div className="dc-nav-actions">
            {/* SOS Emergency Button */}
            <button
              id="dc-desktop-sos-btn"
              onClick={onOpenSos}
              className="dc-nav-sos-button"
              title="Immediate Emergency Assistance"
            >
              <LifeBuoy size={16} />
              <span>SOS</span>
            </button>

            {/* More Menu Dropdown */}
            <div className="dc-more-dropdown-wrap" ref={moreRef}>
              <button
                className={`dc-more-toggle-btn ${isMoreOpen ? 'open' : ''}`}
                onClick={() => setIsMoreOpen((prev) => !prev)}
                title="More resources & tools"
                aria-haspopup="true"
                aria-expanded={isMoreOpen}
              >
                <MoreHorizontal size={18} />
              </button>

              <AnimatePresence>
                {isMoreOpen && (
                  <motion.div
                    className="dc-more-menu-panel"
                    initial={{ opacity: 0, y: 8, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.98 }}
                    transition={{ duration: 0.18, ease: 'easeOut' }}
                  >
                    <div className="dc-more-header">Operations & Resources</div>

                    <button
                      className="dc-more-item"
                      onClick={() => {
                        setIsMoreOpen(false);
                        navigate('/shelters');
                      }}
                    >
                      <MapPin size={15} />
                      <span>Shelters Directory</span>
                    </button>

                    <button
                      className="dc-more-item"
                      onClick={() => {
                        setIsMoreOpen(false);
                        navigate('/guides');
                      }}
                    >
                      <BookOpen size={15} />
                      <span>Disaster Preparedness</span>
                    </button>

                    <button
                      className="dc-more-item"
                      onClick={() => {
                        setIsMoreOpen(false);
                        navigate('/donations');
                      }}
                    >
                      <HeartHandshake size={15} />
                      <span>Aid & Resources</span>
                    </button>

                    <button
                      className="dc-more-item"
                      onClick={() => {
                        setIsMoreOpen(false);
                        navigate('/transparency');
                      }}
                    >
                      <FileText size={15} />
                      <span>Transparency Ledger</span>
                    </button>

                    {onOpenAppModal && (
                      <button
                        className="dc-more-item"
                        onClick={() => {
                          setIsMoreOpen(false);
                          onOpenAppModal();
                        }}
                      >
                        <Download size={15} />
                        <span>Android App (APK)</span>
                      </button>
                    )}

                    <div className="dc-more-divider" />

                    <button
                      className="dc-more-item dc-replay-item"
                      onClick={() => {
                        setIsMoreOpen(false);
                        if (onReplayIntro) onReplayIntro();
                      }}
                    >
                      <RotateCcw size={14} />
                      <span>Replay Cinematic Intro</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </header>

      {/* =========================================================================
          MOBILE TOP APP HEADER
          ========================================================================= */}
      <header className="dc-mobile-header">
        <NavLink to="/" className="dc-mobile-brand">
          <span className="dc-brand-earth-dot" />
          <span className="dc-brand-title">DISASTER<span className="dc-brand-accent">CHAIN</span></span>
        </NavLink>

        <div className="dc-mobile-header-actions">
          <button
            onClick={onOpenSos}
            className="dc-mobile-sos-pill"
            aria-label="Emergency SOS"
          >
            <LifeBuoy size={14} />
            <span>SOS</span>
          </button>
        </div>
      </header>

      {/* =========================================================================
          MOBILE BOTTOM NAVIGATION (5 Primary Tabs)
          ========================================================================= */}
      <nav className="dc-mobile-bottom-nav" aria-label="Mobile Navigation">
        {navItems.map((item) => {
          const active = isCurrentActive(item);
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={`dc-mobile-tab ${active ? 'active' : ''}`}
            >
              <div className="dc-mobile-tab-icon-wrap">
                <Icon size={20} />
                {active && (
                  <motion.span
                    layoutId="dc-mobile-active-dot"
                    className="dc-mobile-active-dot"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
              </div>
              <span className="dc-mobile-tab-label">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </>
  );
}
