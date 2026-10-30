import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { WifiOff, Wifi, ArrowRight, X } from 'lucide-react';
import { offlineEmergencyStorage } from '../services/offlineEmergencyService';

export default function OfflineDetectionBanner() {
  const navigate = useNavigate();
  const location = useLocation();

  const [isOnline, setIsOnline] = useState(() =>
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [showReconnected, setShowReconnected] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowReconnected(true);
      setIsDismissed(false);
      offlineEmergencyStorage.recordSyncTimestamp();

      const timer = setTimeout(() => {
        setShowReconnected(false);
      }, 4500);
      return () => clearTimeout(timer);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowReconnected(false);
      setIsDismissed(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Do not show the banner if user is already on the /offline emergency page
  if (location.pathname === '/offline') {
    return null;
  }

  return (
    <AnimatePresence>
      {!isOnline && !isDismissed && (
        <motion.div
          id="dc-offline-detection-banner"
          className="dc-offline-banner offline"
          initial={{ y: -60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -60, opacity: 0 }}
          transition={{ duration: 0.3 }}
          role="status"
          aria-live="polite"
        >
          <div className="dc-offline-banner-content">
            <div className="dc-offline-banner-left">
              <span className="dc-offline-banner-icon-box">
                <WifiOff size={18} />
              </span>
              <div className="dc-offline-banner-text">
                <strong>Network Offline:</strong> Live operational updates paused. Essential survival guides and verified emergency contacts remain accessible.
              </div>
            </div>

            <div className="dc-offline-banner-actions">
              <button
                type="button"
                id="dc-enter-offline-mode-btn"
                onClick={() => navigate('/offline')}
                className="dc-offline-banner-btn"
              >
                <span>Switch to Offline Emergency Mode</span>
                <ArrowRight size={15} />
              </button>
              <button
                type="button"
                onClick={() => setIsDismissed(true)}
                className="dc-offline-banner-close"
                aria-label="Dismiss banner"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {isOnline && showReconnected && (
        <motion.div
          id="dc-reconnected-banner"
          className="dc-offline-banner online"
          initial={{ y: -60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -60, opacity: 0 }}
          transition={{ duration: 0.3 }}
          role="status"
          aria-live="polite"
        >
          <div className="dc-offline-banner-content">
            <div className="dc-offline-banner-left">
              <span className="dc-offline-banner-icon-box online">
                <Wifi size={18} />
              </span>
              <div className="dc-offline-banner-text">
                <strong>Connection Restored:</strong> DisasterChain live earth intelligence and cloud services are active.
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowReconnected(false)}
              className="dc-offline-banner-close"
              aria-label="Dismiss banner"
            >
              <X size={16} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
