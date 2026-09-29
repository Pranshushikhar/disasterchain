import React from 'react';
import { usePWA } from '../context/PWAContext';
import { useTranslation } from '../i18n';
import Icon from './Icons';

/**
 * PWA Update Notification Toast
 * Renders when a new service worker version is waiting to activate.
 * Prompts: "NEW VERSION AVAILABLE — Refresh to update DisasterChain."
 */
const PWAUpdateToast = () => {
  const { isUpdateAvailable, triggerUpdate } = usePWA();
  const { t } = useTranslation();

  if (!isUpdateAvailable) {
    return null;
  }

  return (
    <div
      role="alert"
      aria-live="assertive"
      style={{
        position: 'fixed',
        top: 'calc(16px + env(safe-area-inset-top, 0px))',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 99999,
        maxWidth: '92vw',
        width: '440px',
        backgroundColor: '#111A23',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: '1px solid #42D9C8',
        borderRadius: '12px',
        padding: '12px 16px',
        boxShadow: '0 10px 35px rgba(0,0,0,0.8), 0 0 20px rgba(66, 217, 200, 0.25)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px',
        animation: 'slideDown 0.3s ease-out',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
        <div
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            background: 'rgba(66, 217, 200, 0.15)',
            border: '1px solid rgba(66, 217, 200, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Icon name="refresh" size={16} color="#42D9C8" />
        </div>
        <div>
          <div
            style={{
              fontSize: '0.80rem',
              fontWeight: '800',
              letterSpacing: '0.05em',
              color: '#42D9C8',
              fontFamily: 'var(--font-heading, sans-serif)',
            }}
          >
            {t('pwa.updateTitle', 'NEW VERSION AVAILABLE')}
          </div>
          <div style={{ fontSize: '0.74rem', color: '#A8B5BE', marginTop: '1px' }}>
            {t('pwa.updateDesc', 'Refresh to update DisasterChain.')}
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={triggerUpdate}
        style={{
          background: '#42D9C8',
          border: 'none',
          color: '#070B10',
          fontSize: '0.76rem',
          fontWeight: '800',
          padding: '7px 14px',
          borderRadius: '8px',
          cursor: 'pointer',
          whiteSpace: 'nowrap',
          flexShrink: 0,
          minHeight: '36px',
        }}
      >
        {t('common.retry', 'Refresh')}
      </button>
    </div>
  );
};

export default PWAUpdateToast;
