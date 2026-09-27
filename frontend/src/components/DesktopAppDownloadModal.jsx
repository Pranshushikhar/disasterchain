import React, { useEffect } from 'react';
import { NATIVE_APP_CONFIG } from '../config/nativeApp';
import Icon from './Icons';
import QRCodeDownload from './QRCodeDownload';

/**
 * DesktopAppDownloadModal
 * Restrained modal for desktop users to discover the native Android app,
 * inspect emergency capabilities, scan the genuine QR code with their phone,
 * or directly download the APK.
 */
export default function DesktopAppDownloadModal({ isOpen, onClose }) {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleDownload = () => {
    window.open(NATIVE_APP_CONFIG.apkUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div
      className="dc-modal-overlay"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(9, 10, 9, 0.82)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="dc-modal-dialog"
        style={{
          background: '#121312',
          border: '1px solid #282A26',
          borderRadius: '12px',
          width: '100%',
          maxWidth: '680px',
          boxShadow: '0 24px 64px rgba(0, 0, 0, 0.65), 0 0 0 1px rgba(255, 255, 255, 0.04)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          animation: 'fadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Header Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid #1E201D',
            background: '#151614',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '6px',
                background: 'rgba(217, 107, 53, 0.12)',
                border: '1px solid rgba(217, 107, 53, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Icon name="shield-check" size={17} color="#D96B35" />
            </div>
            <div>
              <div
                style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: '0.66rem',
                  letterSpacing: '0.08em',
                  color: '#D96B35',
                  fontWeight: 700,
                }}
              >
                DISASTERCHAIN · NATIVE DISTRIBUTION
              </div>
              <h2
                style={{
                  fontFamily: 'Newsreader, Georgia, serif',
                  fontSize: '1.2rem',
                  fontWeight: 600,
                  color: '#F7F4ED',
                  margin: 0,
                }}
              >
                DisasterChain Android Application
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            style={{
              background: 'transparent',
              border: '1px solid #282A26',
              borderRadius: '6px',
              color: '#A49F93',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            ✕
          </button>
        </div>

        {/* Content Body */}
        <div
          style={{
            padding: '1.5rem',
            display: 'grid',
            gridTemplateColumns: '1.2fr 0.9fr',
            gap: '1.5rem',
            alignItems: 'center',
          }}
        >
          {/* Left Column: Purpose, Capabilities, Download CTA */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <span
                style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: '0.62rem',
                  color: '#7A756D',
                  letterSpacing: '0.06em',
                }}
              >
                CIVIL RESILIENCE INSTRUMENT
              </span>
              <p
                style={{
                  fontSize: '0.88rem',
                  color: '#E6E1D6',
                  lineHeight: 1.5,
                  margin: '0.35rem 0 0 0',
                }}
              >
                Built for the moments when a browser isn&apos;t enough. Provides direct hardware telemetry,
                background life-safety push alerts, tactical offline mesh maps, and one-tap SOS emergency routing.
              </p>
            </div>

            {/* Native Capabilities Pills */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
              <span
                style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: '0.6rem',
                  color: '#7A756D',
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                }}
              >
                Included Emergency Modules:
              </span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                {NATIVE_APP_CONFIG.capabilities.map((cap) => (
                  <span
                    key={cap.id}
                    style={{
                      fontFamily: 'JetBrains Mono, monospace',
                      fontSize: '0.62rem',
                      background: '#1A1C19',
                      border: '1px solid #2A2D28',
                      color: '#C7C2B6',
                      padding: '3px 7px',
                      borderRadius: '4px',
                    }}
                  >
                    {cap.label}
                  </span>
                ))}
              </div>
            </div>

            {/* Action Bar */}
            <div style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <button
                type="button"
                onClick={handleDownload}
                id="desktop-modal-download-apk-btn"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  background: '#D96B35',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '10px 18px',
                  fontWeight: 600,
                  fontSize: '0.84rem',
                  fontFamily: 'JetBrains Mono, monospace',
                  cursor: 'pointer',
                  letterSpacing: '0.02em',
                  boxShadow: '0 2px 10px rgba(217, 107, 53, 0.3)',
                  transition: 'background 0.15s ease',
                }}
              >
                <Icon name="download" size={16} color="#FFFFFF" />
                <span>DOWNLOAD APK DIRECTLY</span>
              </button>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: '0.64rem',
                  color: '#7A756D',
                }}
              >
                <span>Android 8.0+ · v{NATIVE_APP_CONFIG.version}</span>
                <span>SHA-signed EAS Preview</span>
              </div>
            </div>
          </div>

          {/* Right Column: Genuine QR Code */}
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <QRCodeDownload size={160} showLabel={true} />
          </div>
        </div>

        {/* Footer Note */}
        <div
          style={{
            padding: '0.75rem 1.5rem',
            background: '#0E0F0E',
            borderTop: '1px solid #1E201D',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.68rem',
            color: '#7A756D',
          }}
        >
          <span>Package: {NATIVE_APP_CONFIG.packageName}</span>
          <span>Expo / React Native Native Build</span>
        </div>
      </div>
    </div>
  );
}
