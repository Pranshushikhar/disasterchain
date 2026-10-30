import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PhoneCall,
  Share2,
  X,
  MapPin,
  CheckCircle2,
  Radio,
  Loader2,
  AlertTriangle,
  Clock,
} from 'lucide-react';
import { createSosRequest } from '../services/api';
import offlineSyncService from '../services/offlineSyncService';
import { useTranslation } from '../i18n/i18n';
import { useDCLocation } from '../context/LocationContext';

export default function ModernSosModal({ isOpen, onClose, onSosSubmitted }) {
  const { t } = useTranslation();
  const { coords: activeCoords } = useDCLocation();
  const [coords, setCoords] = useState(() => ({
    lat: activeCoords?.lat ?? null,
    lon: activeCoords?.lon ?? null,
  }));
  const [gpsStatus, setGpsStatus] = useState('idle'); // 'idle' | 'acquiring' | 'locked' | 'denied' | 'unavailable'
  const [gpsError, setGpsError] = useState('');
  const [beaconStatus, setBeaconStatus] = useState('idle'); // 'idle' | 'confirming' | 'sending' | 'sent' | 'queued_offline'

  // Keep coords aligned with active selected location
  useEffect(() => {
    if (activeCoords?.lat != null && activeCoords?.lon != null) {
      setCoords({ lat: activeCoords.lat, lon: activeCoords.lon });
      if (gpsStatus === 'idle') setGpsStatus('locked');
    }
  }, [activeCoords]);

  // Acquire high accuracy GPS on modal open
  useEffect(() => {
    if (isOpen) {
      setBeaconStatus('idle');
      setGpsError('');
      if (typeof navigator !== 'undefined' && navigator.geolocation) {
        setGpsStatus('acquiring');
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            setCoords({
              lat: Number(pos.coords.latitude.toFixed(5)),
              lon: Number(pos.coords.longitude.toFixed(5)),
            });
            setGpsStatus('locked');
            setGpsError('');
          },
          (err) => {
            if (err.code === 1) { // PERMISSION_DENIED
              setGpsStatus('denied');
              setGpsError('Location permission denied. Please allow GPS access in your browser or select your city from the header.');
            } else {
              setGpsStatus('unavailable');
              setGpsError('Unable to acquire precise satellite GPS fix. Please verify location services are enabled.');
            }
          },
          { enableHighAccuracy: true, timeout: 6000 }
        );
      } else {
        setGpsStatus('unavailable');
        setGpsError('Geolocation is not supported by your browser.');
      }
    }
  }, [isOpen]);

  const handleShareLocation = async () => {
    const latStr = coords.lat != null ? `${coords.lat}` : 'Unknown';
    const lonStr = coords.lon != null ? `${coords.lon}` : 'Unknown';
    const shareText = `EMERGENCY ALERT: I need immediate assistance. Coordinates: ${latStr !== 'Unknown' ? `https://maps.google.com/?q=${latStr},${lonStr}` : 'Location unconfirmed'} (Latitude: ${latStr}, Longitude: ${lonStr}). Sent via DisasterChain.`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'EMERGENCY SOS',
          text: shareText,
        });
        return;
      } catch (e) {}
    }
    // Fallback: copy to clipboard and open WhatsApp
    try {
      await navigator.clipboard.writeText(shareText);
      window.open(
        `https://wa.me/?text=${encodeURIComponent(shareText)}`,
        '_blank'
      );
    } catch (e) {
      window.open(
        `sms:?body=${encodeURIComponent(shareText)}`,
        '_blank'
      );
    }
  };

  const handleTransmitDistressBeacon = async () => {
    setBeaconStatus('sending');
    const payload = {
      emergencyType: 'Medical & Evacuation Assistance',
      severity: 'critical',
      latitude: coords.lat,
      longitude: coords.lon,
      description: `Urgent distress beacon triggered at [${coords.lat ?? 'Unresolved GPS'}, ${coords.lon ?? 'Unresolved GPS'}]`,
    };

    // Truthful check: if offline, enqueue locally
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      const queued = offlineSyncService.enqueueEmergency('sos', payload);
      setBeaconStatus('queued_offline');
      if (onSosSubmitted) onSosSubmitted({ ...payload, isOfflineQueued: true, queueId: queued?.queueId });
      return;
    }

    try {
      await createSosRequest(payload);
      setBeaconStatus('sent');
      if (onSosSubmitted) onSosSubmitted();
    } catch (err) {
      // Real network failure: queue in offline storage truthfully
      const queued = offlineSyncService.enqueueEmergency('sos', payload);
      setBeaconStatus('queued_offline');
      if (onSosSubmitted) onSosSubmitted({ ...payload, isOfflineQueued: true, queueId: queued?.queueId });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="dc-sos-overlay" onClick={onClose}>
      <motion.div
        className="dc-sos-card"
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ duration: 0.15 }}
      >
        {/* Header */}
        <div className="dc-sos-header">
          <div className="dc-sos-title-group">
            <span className="dc-sos-tag">{t('emergency.emergencyServices', 'EMERGENCY PROTOCOL')}</span>
            <h2 className="dc-sos-title">{t('emergency.sosTitle', 'Immediate SOS Assistance')}</h2>
          </div>
          <button className="dc-sos-close-btn" onClick={onClose} aria-label={t('common.close', 'Close')}>
            <X size={20} />
          </button>
        </div>

        {/* GPS Warning if denied or unavailable */}
        {gpsError && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 12px',
              borderRadius: '8px',
              backgroundColor: '#FEF3C7',
              border: '1px solid #F59E0B',
              color: '#92400E',
              fontSize: '0.8rem',
              fontWeight: 500,
              lineHeight: 1.3,
            }}
          >
            <AlertTriangle size={16} style={{ flexShrink: 0 }} />
            <span>{gpsError}</span>
          </div>
        )}

        {/* GPS Location Pill */}
        <div className="dc-sos-coords-pill">
          <MapPin size={14} />
          <span>
            {t('emergency.yourLocation', 'Current GPS')}:{' '}
            {coords.lat != null && coords.lon != null
              ? `${coords.lat}°N, ${coords.lon}°E`
              : 'Location Unconfirmed (enable GPS)'}
          </span>
        </div>

        {/* 1. CALL 112 (Primary Emergency Button) */}
        <a href="tel:112" className="dc-sos-action-btn emergency">
          <PhoneCall size={24} />
          <div className="dc-sos-action-text">
            <span className="dc-sos-primary-label">{t('emergency.call112', 'CALL 112')}</span>
            <span className="dc-sos-sub-label">{t('offline.nationalEmergency', 'National Universal Emergency Dispatch')}</span>
          </div>
        </a>

        {/* 2. SHARE LOCATION */}
        <button
          onClick={handleShareLocation}
          className="dc-sos-action-btn secondary"
        >
          <Share2 size={22} />
          <div className="dc-sos-action-text">
            <span className="dc-sos-primary-label">{t('emergency.enterLocation', 'SHARE LIVE GPS LOCATION')}</span>
            <span className="dc-sos-sub-label">{t('offline.smsDistressDesc', 'Transmit coordinates via WhatsApp / SMS / System')}</span>
          </div>
        </button>

        {/* 3. TRANSMIT DISTRESS BEACON (Explicit 2-Step Confirmation) */}
        {beaconStatus === 'confirming' ? (
          <div
            style={{
              padding: '14px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'rgba(201, 75, 75, 0.08)',
              border: '1.5px solid var(--dc-emergency)',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--dc-emergency)', fontWeight: 700, fontSize: '0.9rem' }}>
              <AlertTriangle size={18} />
              <span>Confirm Emergency Distress Broadcast</span>
            </div>
            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--dc-text)', lineHeight: 1.4 }}>
              Are you sure you want to broadcast an emergency distress signal? This notifies emergency response teams and relief coordinators.
            </p>
            <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
              <button
                onClick={handleTransmitDistressBeacon}
                style={{
                  flex: 1,
                  padding: '10px 14px',
                  backgroundColor: 'var(--dc-emergency)',
                  color: '#FFFDF8',
                  border: 'none',
                  borderRadius: 'var(--radius-sm)',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                }}
              >
                CONFIRM & BROADCAST
              </button>
              <button
                onClick={() => setBeaconStatus('idle')}
                style={{
                  flex: 1,
                  padding: '10px 14px',
                  backgroundColor: 'var(--dc-surface)',
                  color: 'var(--dc-text)',
                  border: '1px solid var(--border-medium)',
                  borderRadius: 'var(--radius-sm)',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                }}
              >
                CANCEL
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setBeaconStatus('confirming')}
            disabled={beaconStatus === 'sending' || beaconStatus === 'sent' || beaconStatus === 'queued_offline'}
            className={`dc-sos-action-btn beacon ${beaconStatus === 'sent' ? 'confirmed' : ''}`}
            style={beaconStatus === 'queued_offline' ? { backgroundColor: '#B45309', color: '#FFFDF8' } : undefined}
          >
            {beaconStatus === 'sending' ? (
              <Loader2 size={22} className="dc-spin" />
            ) : beaconStatus === 'sent' ? (
              <CheckCircle2 size={22} />
            ) : beaconStatus === 'queued_offline' ? (
              <Clock size={22} />
            ) : (
              <Radio size={22} />
            )}
            <div className="dc-sos-action-text">
              <span className="dc-sos-primary-label">
                {beaconStatus === 'sending'
                  ? t('sos.acquiringGps', 'BROADCASTING DISTRESS BEACON...')
                  : beaconStatus === 'sent'
                  ? t('sos.beaconBroadcasted', 'BEACON TRANSMITTED TO RESCUE LOG')
                  : beaconStatus === 'queued_offline'
                  ? 'BEACON QUEUED LOCALLY (DEVICE OFFLINE)'
                  : t('emergency.broadcastSos', 'BROADCAST DISTRESS BEACON')}
              </span>
              <span className="dc-sos-sub-label">
                {beaconStatus === 'queued_offline'
                  ? 'Stored securely on device · Will auto-sync when online'
                  : beaconStatus === 'sent'
                  ? 'Dispatched to nearby disaster responders & relief teams'
                  : t('sos.confirmDesc', 'Requires explicit confirmation before dispatching')}
              </span>
            </div>
          </button>
        )}

        {/* Direct Quick Lines */}
        <div className="dc-sos-lines-grid">
          <a href="tel:100" className="dc-sos-line-pill">
            {t('common.police', 'Police')}: 100
          </a>
          <a href="tel:108" className="dc-sos-line-pill">
            {t('common.ambulance', 'Ambulance')}: 108
          </a>
          <a href="tel:101" className="dc-sos-line-pill">
            {t('common.fire', 'Fire')}: 101
          </a>
          <a href="tel:1078" className="dc-sos-line-pill">
            {t('common.disaster', 'Disaster')}: 1078
          </a>
        </div>
      </motion.div>
    </div>
  );
}
