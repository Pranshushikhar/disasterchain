import React from 'react';
import { useTranslation } from '../i18n/i18n';

/**
 * DISASTERCHAIN — GLOBAL APPLICATION FOOTER & DEVELOPER CREDIT
 * 
 * Elegant, understated footer matching the Earth & Paper aesthetic.
 * Seamlessly adapts across all 6 Living Environments:
 * Calm, Rain, Storm, Night, Snow, and Fog.
 */
export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="dc-global-footer" role="contentinfo">
      <div className="dc-footer-container">
        <div className="dc-footer-primary">
          <span className="dc-footer-copy">{t('footer.copyright', '© 2026 DisasterChain')}</span>
        </div>

        <div className="dc-footer-credit">
          <span className="dc-credit-prefix">{t('footer.designedDevelopedBy', 'Designed & Developed by')}</span>{' '}
          <span className="dc-credit-author">Pranshu Shikhar</span>
        </div>
      </div>
    </footer>
  );
}
