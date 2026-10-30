import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin,
  Search,
  Crosshair,
  X,
  Check,
  Loader2,
  AlertCircle,
  Building2,
  Globe,
} from 'lucide-react';
import { useDCLocation } from '../context/LocationContext';
import { useTranslation } from '../i18n/i18n';

export default function CitySelectorModal() {
  const {
    isCitySelectorOpen,
    closeCitySelector,
    coords,
    locationName,
    setManualLocation,
    requestGpsLocation,
    isLocating,
    isGpsLocked,
    permissionDenied,
    searchCities,
    popularCities,
  } = useDCLocation();

  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const inputRef = useRef(null);

  // Focus input when opened
  useEffect(() => {
    if (isCitySelectorOpen) {
      setQuery('');
      setSearchResults([]);
      setTimeout(() => inputRef.current?.focus(), 80);
    }
  }, [isCitySelectorOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape' && isCitySelectorOpen) {
        closeCitySelector();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isCitySelectorOpen, closeCitySelector]);

  // Debounced live geocoding search
  useEffect(() => {
    if (!query.trim() || query.trim().length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const timer = setTimeout(async () => {
      try {
        const results = await searchCities(query.trim());
        setSearchResults(results || []);
      } catch (e) {
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 280);

    return () => clearTimeout(timer);
  }, [query, searchCities]);

  if (!isCitySelectorOpen) return null;

  const handleSelectCity = (cityItem) => {
    setManualLocation(cityItem);
  };

  const handleUseGps = () => {
    requestGpsLocation();
    closeCitySelector();
  };

  return (
    <AnimatePresence>
      <div className="dc-modal-backdrop" onClick={closeCitySelector} style={{ zIndex: 10000 }}>
        <motion.div
          className="dc-city-modal-panel"
          onClick={(e) => e.stopPropagation()}
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="city-selector-title"
        >
          {/* Header */}
          <div className="dc-city-modal-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div className="dc-city-icon-pill">
                <MapPin size={18} color="var(--earth-green, #496B5A)" />
              </div>
              <div>
                <h3 id="city-selector-title" style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {t('common.selectLocation', 'Select Location')}
                </h3>
                <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  {t('common.selectLocationSub', 'Choose your city to update localized weather, warnings, and shelters')}
                </p>
              </div>
            </div>
            <button
              onClick={closeCitySelector}
              className="dc-close-icon-btn"
              aria-label={t('common.close', 'Close')}
            >
              <X size={18} />
            </button>
          </div>

          {/* Active location indicator */}
          <div className="dc-city-active-badge">
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              {t('common.currentlyActive', 'Active:')}
            </span>
            <span style={{ fontSize: '0.86rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              {locationName}
            </span>
            {isGpsLocked && (
              <span className="dc-gps-pill" title="Live GPS Lock">
                GPS ✓
              </span>
            )}
          </div>

          {/* GPS Button */}
          <button
            onClick={handleUseGps}
            disabled={isLocating}
            className="dc-gps-action-btn"
          >
            {isLocating ? (
              <Loader2 size={16} className="dc-spin" />
            ) : (
              <Crosshair size={16} />
            )}
            <span>
              {isLocating
                ? t('common.acquiringGps', 'Acquiring GPS...')
                : t('common.useDeviceLocation', 'Use My Current Device Location (GPS)')}
            </span>
          </button>

          {permissionDenied && (
            <div className="dc-location-denied-note">
              <AlertCircle size={14} />
              <span>
                {t(
                  'common.locationPermissionDeniedNotice',
                  'Location permission was denied. You can select your city manually below.'
                )}
              </span>
            </div>
          )}

          {/* Search Input */}
          <div className="dc-city-search-box">
            <Search size={16} className="dc-search-icon" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('common.searchCityPlaceholder', 'Search any city, district, or region...')}
              className="dc-city-search-input"
            />
            {isSearching && <Loader2 size={14} className="dc-spin dc-search-spinner" />}
            {query && !isSearching && (
              <button
                onClick={() => setQuery('')}
                className="dc-clear-query-btn"
                aria-label="Clear search"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Search Results List */}
          {query.trim().length >= 2 && (
            <div className="dc-city-results-container">
              <div className="dc-city-section-header">
                <span>{t('common.searchResults', 'Search Results')}</span>
                {searchResults.length > 0 && <span style={{ fontWeight: 400 }}>({searchResults.length})</span>}
              </div>

              {isSearching ? (
                <div className="dc-city-loading-state">
                  <Loader2 size={20} className="dc-spin" />
                  <span>{t('common.searchingCities', 'Searching locations...')}</span>
                </div>
              ) : searchResults.length > 0 ? (
                <div className="dc-city-results-list">
                  {searchResults.map((res, idx) => {
                    const cityName = res.name;
                    const region = res.admin1 || res.admin2 || '';
                    const country = res.country || '';
                    const label = region ? `${cityName}, ${region}, ${country}` : `${cityName}, ${country}`;
                    const isSelected = Math.abs(coords.lat - res.latitude) < 0.05 && Math.abs(coords.lon - res.longitude) < 0.05;

                    return (
                      <button
                        key={`${res.id || idx}-${cityName}`}
                        onClick={() =>
                          handleSelectCity({
                            city: cityName,
                            state: region,
                            country,
                            displayName: label,
                            lat: res.latitude,
                            lon: res.longitude,
                          })
                        }
                        className={`dc-city-item-btn ${isSelected ? 'active' : ''}`}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <Building2 size={15} color="var(--text-muted)" />
                          <div style={{ textAlign: 'left' }}>
                            <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                              {cityName}
                            </div>
                            <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
                              {[region, country].filter(Boolean).join(' · ')}
                            </div>
                          </div>
                        </div>
                        {isSelected && <Check size={16} color="var(--earth-green)" />}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="dc-city-empty-state">
                  <span>{t('common.noCitiesFound', 'No cities found for this query.')}</span>
                </div>
              )}
            </div>
          )}

          {/* Popular Cities Quick Grid */}
          {!query && (
            <div className="dc-popular-cities-wrap">
              <div className="dc-city-section-header">
                <Globe size={14} />
                <span>{t('common.popularCities', 'Popular Locations (India)')}</span>
              </div>
              <div className="dc-popular-cities-grid">
                {popularCities.map((c) => {
                  const isSelected = Math.abs(coords.lat - c.lat) < 0.05 && Math.abs(coords.lon - c.lon) < 0.05;
                  return (
                    <button
                      key={c.city}
                      onClick={() => handleSelectCity(c)}
                      className={`dc-popular-city-chip ${isSelected ? 'selected' : ''}`}
                    >
                      <span>{c.city}</span>
                      {isSelected && <Check size={12} />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
