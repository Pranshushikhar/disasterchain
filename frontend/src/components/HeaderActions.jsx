import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../i18n/i18n';
import { useAuth } from '../context/AuthContext';
import Icon from './Icons';
import LanguageSelector from './LanguageSelector';
import NotificationDropdown from './NotificationDropdown';
import ProfileDropdown from './ProfileDropdown';

/**
 * Clean Right Header Actions Zone
 * Language Selector (compact) | Notifications (bell + badge) | Profile (avatar + menu) | Emergency SOS
 */
const HeaderActions = ({ onOpenSos, onLogout }) => {
  const { t } = useTranslation();
  const { user, isAuthenticated } = useAuth();

  return (
    <div className="header-actions-track">
      {/* 1. Global Multilingual Language Selector (Compact [ EN ▾ ]) */}
      <div className="header-action-item header-lang-wrap" title="Select Global Language (20)">
        <LanguageSelector compact={true} />
      </div>

      {/* 2. Notifications Bell with Compact Unread Badge */}
      <div className="header-action-item header-notif-wrap">
        <NotificationDropdown />
      </div>

      {/* 3. Operator Identity / Profile Control */}
      <div className="header-action-item header-profile-wrap">
        {isAuthenticated ? (
          <ProfileDropdown user={user} onLogout={onLogout} />
        ) : (
          <Link
            to="/login"
            className="nav-btn-signin"
            id="navbar-signin-btn"
            title={t('nav.login', 'Sign In')}
          >
            <Icon name="user" size={15} />
            <span>{t('nav.login', 'Sign In')}</span>
          </Link>
        )}
      </div>

      {/* 4. Emergency SOS — The ONLY Visually Dominant CTA */}
      <div className="header-action-item header-sos-wrap">
        <button
          type="button"
          onClick={onOpenSos}
          className="header-sos-btn"
          id="navbar-emergency-sos-btn"
          aria-label={t('nav.broadcastSos', 'Broadcast Emergency SOS')}
          title={t('nav.broadcastSos', 'Broadcast Emergency SOS Beacon')}
        >
          <span className="sos-beacon-pulse" aria-hidden="true" />
          <Icon name="alert-circle" size={16} color="#ffffff" />
          <span className="header-sos-label">{t('nav.emergencySos', 'Emergency SOS')}</span>
        </button>
      </div>
    </div>
  );
};

export default HeaderActions;
