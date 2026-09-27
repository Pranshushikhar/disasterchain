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
        backgroundColor: '#181A18',
        border: '1px solid rgba(242, 238, 231, 0.16)',
        borderRadius: '4px',
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
            border: '1px solid rgba(242, 238, 231, 0.12)',
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
              color: '#F2EEE7',
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
              color: '#9B958B',
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
            border: '1px solid rgba(242, 238, 231, 0.12)',
            color: '#9B958B',
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
            background: '#D96B35',
            border: 'none',
            color: '#ffffff',
            fontSize: '0.74rem',
            fontWeight: '700',
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
