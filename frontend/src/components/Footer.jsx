import React from 'react';
import { useTranslation } from '../i18n/i18n';

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer
      className="app-footer"
      role="contentinfo"
      style={{
        background: 'var(--bg-secondary, #0E151D)',
        borderTop: '1px solid var(--border-subtle, #202D38)',
        padding: '1.5rem 2rem',
        marginTop: 'auto',
        color: 'var(--text-secondary, #A8B5BE)',
        fontFamily: 'var(--font-sans)',
        position: 'relative',
        zIndex: 10,
      }}
    >
      <div
        style={{
          maxWidth: '1440px',
          margin: '0 auto',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
        }}
      >
        {/* Platform Identity */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <span
            style={{
              fontWeight: 800,
              fontSize: '0.85rem',
              letterSpacing: '0.08em',
              color: 'var(--primary, #42D9C8)',
              fontFamily: 'var(--font-display, inherit)',
            }}
          >
            DISASTERCHAIN / EARTH INTELLIGENCE
          </span>
          <span style={{ color: 'var(--border-medium, #263541)' }}>•</span>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted, #64727D)' }}>
            {t('landing.footerText', 'DisasterChain Emergency Network v2.6 • Global Disaster Intelligence & Mission Control')}
          </span>
        </div>

        {/* Developer Credit */}
        <div
          className="developer-credit-wrapper"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.82rem',
          }}
        >
          <span
            className="developer-credit-text"
            style={{
              color: 'var(--text-muted, #64727D)',
              fontWeight: 500,
              letterSpacing: '0.02em',
              transition: 'color 0.2s ease, transform 0.2s ease',
              display: 'inline-block',
            }}
          >
            {t('footer.developedBy', 'Developed by Pranshu Shikhar')}
          </span>
        </div>
      </div>

      <style>{`
        .developer-credit-text:hover {
          color: var(--primary, #42D9C8) !important;
        }
        @media (max-width: 768px) {
          .app-footer {
            padding: 1.25rem 1.25rem 2rem 1.25rem !important;
            text-align: center;
          }
          .app-footer > div {
            flex-direction: column;
            justify-content: center !important;
            align-items: center !important;
            gap: 0.75rem !important;
          }
        }
      `}</style>
    </footer>
  );
}
