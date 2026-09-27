import React, { useState, useRef, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from '../i18n/i18n';
import { useAuth } from '../context/AuthContext';
import Icon from './Icons';
import OfflineSyncBadge from './OfflineSyncBadge';
import NetworkStatusIndicator from './NetworkStatusIndicator';

/**
 * Secondary Navigation Command Dropdown Menu
 * Houses secondary operational destinations, intelligence tools, and system status
 */
const MoreMenu = ({ onOpenDrawer }) => {
  const { t } = useTranslation();
  const { isAdmin } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [timeStr, setTimeStr] = useState('');

  // Live UTC Telemetry clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const h = String(now.getUTCHours()).padStart(2, '0');
      const m = String(now.getUTCMinutes()).padStart(2, '0');
      const s = String(now.getUTCSeconds()).padStart(2, '0');
      setTimeStr(`${h}:${m}:${s} UTC`);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Close on outside click or Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('pointerdown', handleOutsideClick);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('pointerdown', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const closeMenu = () => setIsOpen(false);

  return (
    <div className="nav-dropdown-wrapper" ref={dropdownRef}>
      <button
        type="button"
        className={`nav-link nav-more-btn ${isOpen ? 'active' : ''}`}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="Secondary navigation menu"
        aria-expanded={isOpen}
        aria-haspopup="true"
        id="navbar-more-menu-btn"
      >
        <span>{t('nav.more', 'More')}</span>
        <span
          className={`nav-chevron ${isOpen ? 'open' : ''}`}
          aria-hidden="true"
        >
          ▾
        </span>
      </button>

      {isOpen && (
        <div
          className="nav-popover nav-more-popover"
          role="menu"
          aria-label="Secondary Navigation Destinations"
        >
          <div className="more-grid">
            {/* Column 1: Response & Shelters */}
            <div className="more-col">
              <div className="more-col-title">
                {t('nav.response', 'RESPONSE OPERATIONS')}
              </div>
              <NavLink
                to="/shelters"
                className={({ isActive }) => `more-link ${isActive ? 'active' : ''}`}
                onClick={closeMenu}
                role="menuitem"
              >
                <div className="more-link-icon">
                  <Icon name="shelter" size={16} />
                </div>
                <div className="more-link-text">
                  <div className="more-link-title">{t('nav.shelters', 'Relief Shelters')}</div>
                  <div className="more-link-desc">Safe havens & supply centers</div>
                </div>
              </NavLink>

              <NavLink
                to="/incidents"
                className={({ isActive }) => `more-link ${isActive ? 'active' : ''}`}
                onClick={closeMenu}
                role="menuitem"
              >
                <div className="more-link-icon">
                  <Icon name="warning" size={16} />
                </div>
                <div className="more-link-text">
                  <div className="more-link-title">{t('nav.incidents', 'Incident Reports')}</div>
                  <div className="more-link-desc">Citizen alerts & hazard tracking</div>
                </div>
              </NavLink>

              <NavLink
                to="/resources"
                className={({ isActive }) => `more-link ${isActive ? 'active' : ''}`}
                onClick={closeMenu}
                role="menuitem"
              >
                <div className="more-link-icon">
                  <Icon name="hospital" size={16} />
                </div>
                <div className="more-link-text">
                  <div className="more-link-title">{t('nav.resources', 'Emergency Resources')}</div>
                  <div className="more-link-desc">Hospitals, blood banks & supplies</div>
                </div>
              </NavLink>
            </div>

            {/* Column 2: Community & Resilience */}
            <div className="more-col">
              <div className="more-col-title">
                {t('nav.community', 'COMMUNITY & GUIDES')}
              </div>
              <NavLink
                to="/guides"
                className={({ isActive }) => `more-link ${isActive ? 'active' : ''}`}
                onClick={closeMenu}
                role="menuitem"
              >
                <div className="more-link-icon">
                  <Icon name="info" size={16} />
                </div>
                <div className="more-link-text">
                  <div className="more-link-title">{t('nav.preparedness', 'Preparedness Guides')}</div>
                  <div className="more-link-desc">Survival protocols & checklists</div>
                </div>
              </NavLink>

              <NavLink
                to="/donations"
                className={({ isActive }) => `more-link ${isActive ? 'active' : ''}`}
                onClick={closeMenu}
                role="menuitem"
              >
                <div className="more-link-icon">
                  <Icon name="box" size={16} />
                </div>
                <div className="more-link-text">
                  <div className="more-link-title">{t('nav.donations', 'Aid Donations')}</div>
                  <div className="more-link-desc">Verified relief fund support</div>
                </div>
              </NavLink>

              <NavLink
                to="/transparency"
                className={({ isActive }) => `more-link ${isActive ? 'active' : ''}`}
                onClick={closeMenu}
                role="menuitem"
              >
                <div className="more-link-icon">
                  <Icon name="cpu" size={16} />
                </div>
                <div className="more-link-text">
                  <div className="more-link-title">Transparency Ledger</div>
                  <div className="more-link-desc">Cryptographic audit log</div>
                </div>
              </NavLink>
            </div>

            {/* Column 3: Intelligence & System */}
            <div className="more-col">
              <div className="more-col-title">
                {t('nav.system', 'INTELLIGENCE & SYSTEM')}
              </div>
              <NavLink
                to="/weather-gpt"
                className={({ isActive }) => `more-link ${isActive ? 'active' : ''}`}
                onClick={closeMenu}
                role="menuitem"
              >
                <div className="more-link-icon">
                  <Icon name="bot" size={16} />
                </div>
                <div className="more-link-text">
                  <div className="more-link-title">Weather-GPT</div>
                  <div className="more-link-desc">Predictive crisis intelligence</div>
                </div>
              </NavLink>

              <NavLink
                to="/offline"
                className={({ isActive }) => `more-link ${isActive ? 'active' : ''}`}
                onClick={closeMenu}
                role="menuitem"
              >
                <div className="more-link-icon">
                  <Icon name="wifi-off" size={16} />
                </div>
                <div className="more-link-text">
                  <div className="more-link-title">{t('nav.offlineMode', 'Offline Mode')}</div>
                  <div className="more-link-desc">Survivability mesh & cache</div>
                </div>
              </NavLink>

              {isAdmin && (
                <NavLink
                  to="/admin"
                  className={({ isActive }) => `more-link more-link-admin ${isActive ? 'active' : ''}`}
                  onClick={closeMenu}
                  role="menuitem"
                >
                  <div className="more-link-icon">
                    <Icon name="shield" size={16} color="var(--primary)" />
                  </div>
                  <div className="more-link-text">
                    <div className="more-link-title" style={{ color: 'var(--primary)', fontWeight: 700 }}>
                      {t('nav.adminCommand', 'ADMIN COMMAND')}
                    </div>
                    <div className="more-link-desc">System orchestration terminal</div>
                  </div>
                </NavLink>
              )}
            </div>
          </div>

          {/* System Telemetry Tray */}
          <div className="more-telemetry-tray">
            <div className="telemetry-tray-left">
              <div className="tray-status-chip">
                <span className="live-beacon-pulse" />
                <span className="tray-status-label">{t('common.operational', 'OPERATIONAL')}</span>
                <span className="tray-divider">|</span>
                <span className="tray-clock">{timeStr}</span>
              </div>
              <div className="tray-network-wrap">
                <NetworkStatusIndicator />
              </div>
              <div className="tray-sync-wrap">
                <OfflineSyncBadge />
              </div>
            </div>

            {onOpenDrawer && (
              <button
                type="button"
                className="tray-drawer-btn"
                onClick={() => {
                  closeMenu();
                  onOpenDrawer();
                }}
                title="Open Expanded Navigation Drawer"
              >
                <span>Full Drawer</span>
                <Icon name="menu" size={14} />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MoreMenu;
