import React from 'react';
import { useTranslation } from '../i18n/i18n';

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer
      className="app-footer"
      role="contentinfo"
      style={{
        background: 'var(--dc-bg-2, #E7DECD)',
        borderTop: '1px solid var(--dc-border, #DCD3C3)',
        padding: '1.5rem 2rem',
        marginTop: 'auto',
        color: 'var(--dc-text-subtle, #65706B)',
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
              color: 'var(--dc-forest, #496B5A)',
              fontFamily: 'var(--font-display, inherit)',
            }}
          >
            DISASTERCHAIN / EARTH INTELLIGENCE
          </span>
          <span style={{ color: 'var(--dc-border, #DCD3C3)' }}>•</span>
          <span style={{ fontSize: '0.8rem', color: 'var(--dc-text-subtle, #65706B)' }}>
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
              color: 'var(--dc-text-subtle, #65706B)',
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
          color: var(--dc-forest, #263F35) !important;
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
