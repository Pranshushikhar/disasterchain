import React, { useState } from 'react';
import { NATIVE_APP_CONFIG } from '../../config/nativeApp';
import Icon from '../Icons';
import './nativeAppTakeover.css';

/**
 * NativeAppDownloadTakeover
 * Dedicated full-screen landing experience for Android visitors.
 * Calm Future / Operational Humanism design language.
 */
export default function NativeAppDownloadTakeover({
  isOpen = true,
  onContinueInBrowser,
  isIos = false,
}) {
  const [downloadStarted, setDownloadStarted] = useState(false);

  if (!isOpen) return null;

  const handleDownload = () => {
    setDownloadStarted(true);
    // Trigger direct APK download via browser
    window.location.href = NATIVE_APP_CONFIG.apkUrl;
  };

  const handleOpenInstalledApp = () => {
    // Attempt deep link scheme
    window.location.href = NATIVE_APP_CONFIG.scheme;
  };

  return (
    <div
      className="dc-takeover-root"
      id="native-app-download-takeover"
      role="dialog"
      aria-modal="true"
      aria-labelledby="dc-takeover-heading"
    >
      <div className="dc-takeover-container">
        {/* TOP: DisasterChain Wordmark & Version */}
        <header className="dc-takeover-header">
          <div className="dc-takeover-brand">
            <div className="dc-takeover-brand-mark">
              <Icon name="shield-check" size={16} color="#D96B35" />
            </div>
            <span className="dc-takeover-brand-text">DISASTERCHAIN</span>
          </div>

          <div className="dc-takeover-status-badge">
            {isIos ? 'iOS PLATFORM' : `ANDROID · v${NATIVE_APP_CONFIG.version}`}
          </div>
        </header>

        {/* HERO: Operational Statement */}
        <section className="dc-takeover-hero">
          <div className="dc-takeover-kicker">CIVIL RESPONSE INFRASTRUCTURE</div>
          <h1 className="dc-takeover-title" id="dc-takeover-heading">
            Emergency intelligence, in your pocket.
          </h1>
          <p className="dc-takeover-subtitle">
            {isIos
              ? 'The DisasterChain native client for iOS is undergoing TestFlight verification. You can continue with full capabilities in your mobile browser.'
              : 'DisasterChain is available as a purpose-built native Android client. Engineered for high-resilience field communication when seconds matter.'}
          </p>
        </section>

        {/* MIDDLE: Real Native App Representation (Screenshot) */}
        <div className="dc-takeover-device-frame" aria-hidden="true">
          <img
            src={NATIVE_APP_CONFIG.previewImage}
            alt="DisasterChain Native App Interface"
            className="dc-takeover-device-screen"
            onError={(e) => {
              // Graceful fallback to launch asset if situation asset fails
              e.currentTarget.src = NATIVE_APP_CONFIG.launchImage;
            }}
          />
          <div className="dc-takeover-device-overlay-badge">
            <span>● NATIVE REACT NATIVE CLIENT</span>
          </div>
        </div>

        {/* CAPABILITIES: Concise Operational Pills */}
        <div className="dc-takeover-capabilities" aria-label="Application capabilities">
          {NATIVE_APP_CONFIG.capabilities.map((cap) => (
            <span key={cap.id} className="dc-capability-pill">
              <Icon name={cap.icon} size={11} color="#D96B35" />
              <span>{cap.label}</span>
            </span>
          ))}
        </div>

        {/* ACTIONS & POST-DOWNLOAD INSTRUCTIONS */}
        <section className="dc-takeover-actions">
          {isIos ? (
            /* iOS Flow: Inform and continue to browser */
            <>
              <button
                type="button"
                className="dc-takeover-btn-primary"
                onClick={onContinueInBrowser}
                id="ios-continue-browser-btn"
              >
                <span>CONTINUE IN BROWSER</span>
                <Icon name="arrow-right" size={16} />
              </button>
              <div style={{ textAlign: 'center', fontSize: '0.72rem', color: '#7A756D', fontFamily: 'JetBrains Mono, monospace' }}>
                iOS app coming soon to Apple App Store
              </div>
            </>
          ) : (
            /* Android Flow: Primary APK Download + Browser Fallback */
            <>
              {downloadStarted && (
                <div className="dc-takeover-instructions" role="status">
                  <div className="dc-takeover-instructions-head">
                    <Icon name="check-circle" size={14} color="#D96B35" />
                    <span>Download started</span>
                  </div>
                  <div className="dc-takeover-instructions-body">
                    Open the downloaded APK and allow installation from this source if Android asks.
                  </div>
                </div>
              )}

              <button
                type="button"
                className="dc-takeover-btn-primary"
                onClick={handleDownload}
                id="mobile-download-apk-btn"
              >
                <Icon name="download" size={17} color="#FFFFFF" />
                <span>DOWNLOAD ANDROID APP</span>
              </button>

              <button
                type="button"
                className="dc-takeover-btn-secondary"
                onClick={onContinueInBrowser}
                id="mobile-continue-browser-btn"
              >
                <span>CONTINUE IN BROWSER</span>
              </button>

              {/* Deep link option for already-installed app */}
              <button
                type="button"
                className="dc-takeover-deeplink-btn"
                onClick={handleOpenInstalledApp}
                id="mobile-open-native-scheme-btn"
              >
                Already installed? Open DisasterChain App
              </button>
            </>
          )}

          <footer className="dc-takeover-footer">
            <span>Android • Version {NATIVE_APP_CONFIG.version} (Direct EAS Build)</span>
          </footer>
        </section>
      </div>
    </div>
  );
}
