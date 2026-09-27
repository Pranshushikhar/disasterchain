import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../i18n/i18n';
import Icon from './Icons';

/**
 * Compact Profile Control with Identity Menu and Security Options
 */
const ProfileDropdown = ({ user, onLogout }) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

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

  const firstName = user?.name ? user.name.split(' ')[0] : 'Operator';
  const roleName = user?.role || 'Citizen';
  const initials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'OP';

  return (
    <div className="nav-dropdown-wrapper" ref={dropdownRef}>
      <button
        type="button"
        className={`nav-profile-btn ${isOpen ? 'active' : ''}`}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label={`User Menu: ${user?.name || 'Operator'}`}
        aria-expanded={isOpen}
        aria-haspopup="true"
        id="navbar-profile-btn"
      >
        <div className="nav-avatar-circle" aria-hidden="true">
          {initials}
        </div>
        <span className="nav-profile-name">{firstName}</span>
        <span
          className={`nav-chevron ${isOpen ? 'open' : ''}`}
          aria-hidden="true"
        >
          ▾
        </span>
      </button>

      {isOpen && (
        <div
          className="nav-popover nav-profile-popover"
          role="menu"
          aria-label="User account menu"
        >
          {/* Identity Header */}
          <div className="popover-profile-header">
            <div className="popover-profile-avatar">{initials}</div>
            <div className="popover-profile-info">
              <div className="popover-profile-name">{user?.name || 'Response Operator'}</div>
              <div className="popover-profile-meta">
                <span className="badge badge-info nav-user-role-badge">
                  {roleName}
                </span>
                <span className="popover-profile-email">
                  {user?.email || 'authenticated'}
                </span>
              </div>
            </div>
          </div>

          <div className="popover-divider" />

          {/* Links */}
          <div className="popover-menu-group" role="group">
            <Link
              to="/profile"
              className="popover-menu-item"
              onClick={() => setIsOpen(false)}
              role="menuitem"
            >
              <Icon name="user" size={16} />
              <span>{t('nav.profile', 'Profile & Identity')}</span>
            </Link>

            <Link
              to="/profile"
              className="popover-menu-item"
              onClick={() => setIsOpen(false)}
              role="menuitem"
            >
              <Icon name="shield" size={16} />
              <span>Security & Clearance</span>
            </Link>
          </div>

          <div className="popover-divider" />

          {/* Sign Out */}
          <button
            type="button"
            className="popover-menu-item popover-logout-btn"
            onClick={() => {
              setIsOpen(false);
              onLogout();
            }}
            role="menuitem"
            id="navbar-menu-logout-btn"
          >
            <Icon name="logout" size={16} color="var(--danger, #ef4444)" />
            <span>{t('nav.logout', 'Sign Out')}</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default ProfileDropdown;
