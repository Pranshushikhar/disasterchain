import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { NATIVE_APP_CONFIG } from '../config/nativeApp';
import Icon from './Icons';

/**
 * QRCodeDownload
 * Generates an authentic QR code from the official APK URL
 * for desktop users scanning from their mobile phones.
 */
export default function QRCodeDownload({ size = 180, showLabel = true }) {
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    QRCode.toDataURL(NATIVE_APP_CONFIG.apkUrl, {
      width: size,
      margin: 1,
      color: {
        dark: '#0D0E0D',
        light: '#FFFFFF',
      },
      errorCorrectionLevel: 'M',
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error('Failed to generate QR code:', err));
  }, [size]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(NATIVE_APP_CONFIG.apkUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  return (
    <div className="dc-qr-card" style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '1.25rem',
      background: '#181917',
      borderRadius: '8px',
      border: '1px solid #282926',
      maxWidth: '280px',
      margin: '0 auto',
      textAlign: 'center',
    }}>
      {showLabel && (
        <span style={{
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: '0.68rem',
          color: '#A49F93',
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
          marginBottom: '0.75rem',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
        }}>
          <Icon name="smartphone" size={13} color="#D96B35" />
          Scan with your Android phone
        </span>
      )}

      {/* QR Code Frame */}
      <div style={{
        background: '#FFFFFF',
        padding: '10px',
        borderRadius: '6px',
        boxShadow: '0 4px 14px rgba(0,0,0,0.3)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        {qrDataUrl ? (
          <img
            src={qrDataUrl}
            alt="DisasterChain Android APK QR Code"
            width={size}
            height={size}
            style={{ display: 'block', borderRadius: '2px' }}
          />
        ) : (
          <div style={{ width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: '#0D0E0D', fontSize: '0.8rem', fontFamily: 'monospace' }}>Generating...</span>
          </div>
        )}
      </div>

      {/* Metadata Under QR */}
      <div style={{ marginTop: '0.85rem', width: '100%' }}>
        <div style={{
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: '0.72rem',
          fontWeight: 700,
          color: '#F7F4ED',
          letterSpacing: '0.04em',
        }}>
          DISASTERCHAIN ANDROID APP
        </div>
        <div style={{
          fontSize: '0.68rem',
          color: '#7A756D',
          fontFamily: 'JetBrains Mono, monospace',
          marginTop: '2px',
        }}>
          Version {NATIVE_APP_CONFIG.version} (Direct EAS Build)
        </div>

        {/* Copy APK link helper */}
        <button
          type="button"
          onClick={handleCopyLink}
          style={{
            marginTop: '0.6rem',
            background: 'transparent',
            border: 'none',
            color: copied ? '#5E8B68' : '#A49F93',
            fontSize: '0.65rem',
            fontFamily: 'JetBrains Mono, monospace',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            padding: '3px 6px',
            borderRadius: '4px',
            transition: 'color 0.15s ease',
          }}
          title="Copy direct APK download link to clipboard"
        >
          <Icon name={copied ? 'check' : 'copy'} size={11} color={copied ? '#5E8B68' : '#A49F93'} />
          <span>{copied ? 'APK Link Copied' : 'Copy Direct Link'}</span>
        </button>
      </div>
    </div>
  );
}
