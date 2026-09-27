import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useTranslation } from '../i18n/i18n';
import { useAuth } from '../context/AuthContext';
import MoreMenu from './MoreMenu';

/**
 * Clean Center Primary Navigation
 * Editorial text navigation with subtle bottom indicator accents
 * Overview | Weather | Map | Alerts | More ▾
 */
const PrimaryNavigation = ({ onOpenDrawer }) => {
  const { t } = useTranslation();
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const currentPath = location.pathname;

  // Active route matching logic
  const isOverviewActive = currentPath === '/dashboard' || currentPath === '/';
  const isWeatherActive = currentPath === '/weather';
  const isMapActive = currentPath === '/affected-areas' || currentPath === '/map';
  const isAlertsActive = currentPath === '/alerts';

  const overviewPath = '/';

  return (
    <nav className="primary-nav-track" aria-label="Primary Application Navigation">
      {/* 1. Overview */}
      <NavLink
        to={overviewPath}
        className={`nav-text-link ${isOverviewActive ? 'active' : ''}`}
        id="nav-link-overview"
      >
        <span>{t('nav.dashboard', 'Overview')}</span>
      </NavLink>

      {/* 2. Weather */}
      <NavLink
        to="/weather"
        className={`nav-text-link ${isWeatherActive ? 'active' : ''}`}
        id="nav-link-weather"
      >
        <span>{t('nav.weather', 'Weather')}</span>
      </NavLink>

      {/* 3. Map */}
      <NavLink
        to="/affected-areas"
        className={`nav-text-link ${isMapActive ? 'active' : ''}`}
        id="nav-link-map"
      >
        <span>{t('nav.map', 'Map')}</span>
      </NavLink>

      {/* 4. Alerts */}
      <NavLink
        to="/alerts"
        className={`nav-text-link ${isAlertsActive ? 'active' : ''}`}
        id="nav-link-alerts"
      >
        <span>{t('nav.alerts', 'Alerts')}</span>
      </NavLink>

      {/* 5. More / Command Menu */}
      <MoreMenu onOpenDrawer={onOpenDrawer} />
    </nav>
  );
};

export default PrimaryNavigation;
