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
        backgroundColor: 'var(--dc-elevated, #FFFDF8)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: '1px solid var(--dc-border, #DCD3C3)',
        borderRadius: '12px',
        padding: '12px 16px',
        boxShadow: '0 10px 30px rgba(38, 63, 53, 0.15)',
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
            background: 'var(--dc-surface, #F8F5EE)',
            border: '1px solid var(--dc-border, #DCD3C3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Icon name="refresh" size={16} color="var(--dc-forest, #496B5A)" />
        </div>
        <div>
          <div
            style={{
              fontSize: '0.80rem',
              fontWeight: '800',
              letterSpacing: '0.05em',
              color: 'var(--dc-forest, #496B5A)',
              fontFamily: 'var(--font-heading, sans-serif)',
            }}
          >
            {t('pwa.updateTitle', 'NEW VERSION AVAILABLE')}
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--dc-text-subtle, #65706B)', marginTop: '1px' }}>
            {t('pwa.updateDesc', 'Refresh to update DisasterChain.')}
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={triggerUpdate}
        style={{
          background: 'var(--dc-forest, #263F35)',
          border: 'none',
          color: '#FFFDF8',
          fontSize: '0.76rem',
          fontWeight: '700',
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
