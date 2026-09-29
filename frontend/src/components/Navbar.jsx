import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../i18n/i18n';
import Icon from './Icons';
import PrimaryNavigation from './PrimaryNavigation';
import HeaderActions from './HeaderActions';

/**
 * DISASTERCHAIN COMMAND INTERFACE HEADER
 * Premium, clean, uncluttered emergency intelligence navigation
 * 
 * Desktop Structure (>= 900px):
 * Zone 1 (Left):   [Logo Mark] DISASTERCHAIN / RESPONSE NETWORK (~20-25% width)
 * Zone 2 (Center): Overview | Weather | Map | Alerts | More ▾ (editorial text nav)
 * Zone 3 (Right):  Language [ EN ▾ ] | Notifications [ 🔔 3 ] | Profile [ avatar ] Operator ▾ | [ Emergency SOS ]
 * 
 * Mobile Structure (< 900px):
 * [ ☰ ] DISASTERCHAIN [ SOS ]
 */
const Navbar = ({ onOpenSos, onToggleSidebar, isMobileMenuOpen, onOpenAppModal }) => {
  const { isAuthenticated, logout } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);

  // Scroll listener for dynamic compression and glassmorphic elevation
  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY > 15;
      setIsScrolled(scrolled);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial check

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const brandDestination = '/';

  return (
    <header
      className={`app-navbar ${isScrolled ? 'navbar-scrolled' : ''}`}
      id="disasterchain-app-header"
      role="banner"
    >
      <div className="navbar-container">
        {/* ==================================================================
            DESKTOP & TABLET LAYOUT (>= 900px)
            ================================================================== */}
        <div className="navbar-desktop-layout">
          {/* ZONE 1: BRAND (LEFT, 20-25% width) */}
          <div className="nav-zone-left">
            <Link
              to={brandDestination}
              className="nav-brand-link"
              id="disasterchain-brand-logo"
              title="DisasterChain Earth Intelligence"
            >
              <div className="nav-brand-mark" aria-hidden="true">
                <Icon name="shield-check" size={20} color="var(--primary)" />
              </div>
              <div className="nav-brand-text">
                <span className="nav-brand-title">DISASTERCHAIN</span>
                <span className="nav-brand-subtitle">EARTH INTELLIGENCE</span>
              </div>
            </Link>
          </div>

          {/* ZONE 2: PRIMARY NAVIGATION (CENTER) */}
          <div className="nav-zone-center">
            <PrimaryNavigation onOpenDrawer={onToggleSidebar} />
          </div>

          {/* ZONE 3: ACTIONS & IDENTITY (RIGHT) */}
          <div className="nav-zone-right">
            <HeaderActions onOpenSos={onOpenSos} onLogout={handleLogout} onOpenAppModal={onOpenAppModal} />
          </div>
        </div>

        {/* ==================================================================
            MOBILE COMMAND HEADER (< 900px)
            Strictly: [ ☰ ]   DISASTERCHAIN   [ SOS ]
            ================================================================== */}
        <div className="navbar-mobile-layout">
          {/* Left: Mobile Navigation Drawer Toggle */}
          <button
            type="button"
            className="mobile-nav-toggle-btn"
            onClick={onToggleSidebar}
            aria-label={isMobileMenuOpen ? t('common.close', 'Close navigation') : t('nav.navigationMenu', 'Open navigation')}
            aria-expanded={isMobileMenuOpen}
            id="mobile-nav-toggle-btn"
          >
            {isMobileMenuOpen ? (
              <span className="mobile-toggle-close-icon">✕</span>
            ) : (
              <Icon name="menu" size={22} color="#ffffff" />
            )}
          </button>

          {/* Center: Clean Brand Identity */}
          <Link
            to={brandDestination}
            className="mobile-brand-link"
            title="DisasterChain Earth Intelligence"
          >
            <div className="mobile-brand-mark" aria-hidden="true">
              <Icon name="shield-check" size={17} color="var(--primary)" />
            </div>
            <div className="mobile-brand-title-wrap">
              <span className="mobile-brand-name">DISASTERCHAIN</span>
            </div>
          </Link>

          {/* Right: Restrained Emergency SOS Action */}
          <button
            type="button"
            onClick={onOpenSos}
            className="mobile-sos-btn"
            id="navbar-mobile-sos-btn"
            aria-label={t('nav.broadcastSos', 'Broadcast Emergency SOS')}
            title={t('nav.broadcastSos', 'Broadcast Emergency SOS')}
          >
            <span className="sos-beacon-pulse" aria-hidden="true" />
            <Icon name="alert-circle" size={15} color="#ffffff" />
            <span className="mobile-sos-text">{t('nav.sos', 'SOS')}</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
