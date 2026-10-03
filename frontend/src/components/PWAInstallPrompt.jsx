import React from 'react';
import { usePWA } from '../context/PWAContext';
import { useTranslation } from '../i18n';
import Icon from './Icons';

/**
 * Mobile PWA Install Prompt Banner
 * Unobtrusive prompt complying with:
 * "INSTALL DISASTERCHAIN"
 * "Install DisasterChain for faster emergency access."
 * Buttons: Install / Not now
 * Stored locally to avoid repeated interruptions.
 */
const PWAInstallPrompt = () => {
  const { isInstallable, isInstalled, isDismissed, promptInstall, dismissInstallPrompt } = usePWA();
  const { t } = useTranslation();

  // If not installable, already installed, or previously dismissed by user, do not render
  if (!isInstallable || isInstalled || isDismissed) {
    return null;
  }

  const handleInstallClick = async () => {
    await promptInstall();
  };

  return (
    <aside
      role="region"
      aria-label={t('pwa.installTitle', 'Install DisasterChain Application')}
      className="pwa-install-banner-responsive"
      style={{
        position: 'fixed',
        bottom: '24px',
        left: '24px',
        right: 'auto',
        maxWidth: '360px',
        width: 'calc(100% - 48px)',
        boxSizing: 'border-box',
        zIndex: 9990,
        backgroundColor: '#FFFDF8',
        border: '1px solid #D8CDBA',
        borderRadius: '12px',
        padding: '12px 16px',
        boxShadow: '0 10px 30px rgba(30, 39, 37, 0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px',
        animation: 'slideUp 0.25s ease-out',
      }}
    >
      {/* Icon + Information */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
        <img
          src="/icon-192.png"
          alt="DisasterChain Logo"
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '8px',
            border: '1px solid #D8CDBA',
            flexShrink: 0,
            objectFit: 'cover',
          }}
        />
        <div style={{ minWidth: 0 }}>
          <div
            style={{
              fontSize: '0.8rem',
              fontWeight: '700',
              letterSpacing: '0.04em',
              color: '#1E2725',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {t('pwa.installTitle', 'INSTALL DISASTERCHAIN')}
          </div>
          <div
            style={{
              fontSize: '0.74rem',
              color: '#65706B',
              lineHeight: 1.3,
              marginTop: '1px',
            }}
          >
            {t('pwa.installDesc', 'Install for immediate emergency access.')}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
        <button
          type="button"
          onClick={dismissInstallPrompt}
          style={{
            background: 'transparent',
            border: '1px solid #D8CDBA',
            color: '#65706B',
            fontSize: '0.74rem',
            fontWeight: '600',
            padding: '6px 10px',
            borderRadius: '6px',
            cursor: 'pointer',
            minHeight: '30px',
          }}
        >
          {t('pwa.notNow', 'Dismiss')}
        </button>

        <button
          type="button"
          onClick={handleInstallClick}
          style={{
            background: '#263F35',
            border: 'none',
            color: '#FFFDF8',
            fontSize: '0.75rem',
            fontWeight: '600',
            padding: '6px 12px',
            borderRadius: '6px',
            cursor: 'pointer',
            minHeight: '30px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          <span>{t('nav.installApp', 'Install')}</span>
        </button>
      </div>
    </aside>
  );
};

export default PWAInstallPrompt;
