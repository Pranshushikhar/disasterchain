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
        bottom: '20px',
        left: '20px',
        right: 'auto',
        maxWidth: '360px',
        width: 'calc(100% - 40px)',
        boxSizing: 'border-box',
        zIndex: 9990,
        backgroundColor: '#111A23',
        border: '1px solid #202D38',
        borderRadius: '8px',
        padding: '10px 14px',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.75)',
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
            borderRadius: '6px',
            border: '1px solid #202D38',
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
              color: '#F4F7F8',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {t('pwa.installTitle', 'INSTALL DISASTERCHAIN')}
          </div>
          <div
            style={{
              fontSize: '0.72rem',
              color: '#A8B5BE',
              lineHeight: 1.25,
              marginTop: '1px',
            }}
          >
            {t('pwa.installDesc', 'Install for immediate emergency access.')}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
        <button
          type="button"
          onClick={dismissInstallPrompt}
          style={{
            background: 'transparent',
            border: '1px solid #202D38',
            color: '#A8B5BE',
            fontSize: '0.72rem',
            fontWeight: '600',
            padding: '5px 9px',
            borderRadius: '5px',
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
            background: '#42D9C8',
            border: 'none',
            color: '#070B10',
            fontSize: '0.74rem',
            fontWeight: '800',
            padding: '5px 12px',
            borderRadius: '5px',
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
