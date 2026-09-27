import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from '../i18n/i18n';
import { sendWeatherGPTChat } from '../services/api';
import {
  fetchCompleteWeather,
  searchLocations,
  reverseGeocode,
} from '../services/weatherApi';
import './weathergpt.css';

/**
 * WEATHERGPT — ATMOSPHERIC INTELLIGENCE DESK
 * Professional meteorological intelligence interface with deterministic time binding,
 * hourly forecast timeline highlighting, and conversational continuity.
 */
export default function WeatherGPTPage() {
  const { t, language } = useTranslation();

  // Decoupled Location Model
  const [locationPermission, setLocationPermission] = useState('prompt'); // 'prompt' | 'granted' | 'denied' | 'unavailable'
  const [locationCoordinates, setLocationCoordinates] = useState({
    latitude: 30.7716,
    longitude: 76.5693,
  });
  const [locationName, setLocationName] = useState({
    displayName: 'Mohali, Punjab',
    city: 'Mohali',
    state: 'Punjab',
    country: 'India',
    isResolving: false,
  });
  const [weatherDataStatus, setWeatherDataStatus] = useState('LIVE'); // 'IDLE' | 'LOADING' | 'LIVE' | 'PARTIAL_LIVE' | 'CACHED' | 'ERROR'

  // Location search UI state
  const [showLocationSearch, setShowLocationSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  // Live telemetry summary
  const [liveTelemetry, setLiveTelemetry] = useState(null);

  // Conversation session state
  const [conversationId, setConversationId] = useState(() => `wgpt_${Date.now()}`);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // 1. Initial Geolocation and Telemetry Bootstrap
  useEffect(() => {
    // If browser supports geolocation, acquire position without blocking UI
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          setLocationPermission('granted');
          const lat = Number(pos.coords.latitude.toFixed(4));
          const lon = Number(pos.coords.longitude.toFixed(4));
          setLocationCoordinates({ latitude: lat, longitude: lon });
          setLocationName((prev) => ({
            ...prev,
            isResolving: true,
          }));

          // Reverse geocode place name in background
          try {
            const rev = await reverseGeocode(lat, lon);
            const resolvedCity = rev?.displayName || rev?.city || `${lat.toFixed(2)}°N, ${lon.toFixed(2)}°E`;
            setLocationName({
              displayName: resolvedCity,
              city: rev?.city || resolvedCity,
              state: rev?.region || rev?.state || '',
              country: rev?.country || '',
              isResolving: false,
            });
          } catch (e) {
            setLocationName({
              displayName: `${lat.toFixed(2)}°N, ${lon.toFixed(2)}°E`,
              city: `${lat.toFixed(2)}°N, ${lon.toFixed(2)}°E`,
              state: '',
              country: '',
              isResolving: false,
            });
          }
        },
        () => {
          setLocationPermission('denied');
        },
        { timeout: 8000, enableHighAccuracy: true }
      );
    }
  }, []);

  // 2. Fetch live telemetry whenever coordinates change
  const refreshTelemetry = useCallback(async (lat, lon) => {
    setWeatherDataStatus('LOADING');
    try {
      const data = await fetchCompleteWeather(lat, lon);
      if (data && data.current) {
        setLiveTelemetry({
          temperature: Math.round(data.current.temperature),
          condition: data.current.weatherCode != null ? data.current.weatherCode : 'Clear',
          windSpeed: Math.round(data.current.windSpeed || 0),
          windGusts: Math.round(data.current.windGusts || 0),
          humidity: data.current.relativeHumidity,
          precipitation: data.current.precipitation || 0,
        });
        setWeatherDataStatus(data.isCached ? 'CACHED' : (data.feedStatus || 'LIVE'));
      } else {
        setWeatherDataStatus('PARTIAL_LIVE');
      }
    } catch (err) {
      setWeatherDataStatus('PARTIAL_LIVE');
    }
  }, []);

  useEffect(() => {
    refreshTelemetry(locationCoordinates.latitude, locationCoordinates.longitude);
  }, [locationCoordinates.latitude, locationCoordinates.longitude, refreshTelemetry]);

  // Scroll to show latest user interaction and response
  const hasUserInteractedRef = useRef(false);
  useEffect(() => {
    if (messages.length > 0) {
      hasUserInteractedRef.current = true;
      const lastUserEl = document.querySelector('.wgpt-turn-user:last-of-type');
      if (lastUserEl) {
        lastUserEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [messages.length, isLoading]);

  // Handle GPS Button Click
  const handleGpsClick = () => {
    if (!navigator.geolocation) return;
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        setIsLocating(false);
        const lat = Number(pos.coords.latitude.toFixed(4));
        const lon = Number(pos.coords.longitude.toFixed(4));
        setLocationCoordinates({ latitude: lat, longitude: lon });
        setLocationName((prev) => ({ ...prev, isResolving: true }));
        try {
          const rev = await reverseGeocode(lat, lon);
          const resolved = rev?.displayName || rev?.city || `${lat.toFixed(2)}°N, ${lon.toFixed(2)}°E`;
          setLocationName({
            displayName: resolved,
            city: rev?.city || resolved,
            state: rev?.region || rev?.state || '',
            country: rev?.country || '',
            isResolving: false,
          });
        } catch (e) {
          setLocationName({
            displayName: `${lat.toFixed(2)}°N, ${lon.toFixed(2)}°E`,
            city: `${lat.toFixed(2)}°N, ${lon.toFixed(2)}°E`,
            state: '',
            country: '',
            isResolving: false,
          });
        }
      },
      () => {
        setIsLocating(false);
        setShowLocationSearch(true);
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  };

  // Handle Search Submission
  const handleSearchSubmit = async (e) => {
    e?.preventDefault();
    if (!searchQuery || searchQuery.trim().length < 2) return;
    setIsSearching(true);
    try {
      const results = await searchLocations(searchQuery.trim());
      setSearchResults(results || []);
    } catch (e) {
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectLocation = (loc) => {
    const lat = Number(loc.latitude.toFixed(4));
    const lon = Number(loc.longitude.toFixed(4));
    setLocationCoordinates({ latitude: lat, longitude: lon });
    setLocationName({
      displayName: loc.name,
      city: loc.name,
      state: loc.admin1 || '',
      country: loc.country || '',
      isResolving: false,
    });
    setShowLocationSearch(false);
    setSearchQuery('');
    setSearchResults([]);
  };

  // 3. Send Message through WeatherGPT Pipeline
  const sendMessage = async (userPrompt) => {
    const text = (userPrompt || inputText || '').trim();
    if (!text || isLoading) return;

    setInputText('');

    const userTurn = {
      id: `u_${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userTurn]);
    setIsLoading(true);

    // Build recent conversation history for memory
    const recentHistory = messages
      .slice(-6)
      .map((m) => ({ role: m.role, content: m.content }));
    recentHistory.push({ role: 'user', content: text });

    try {
      const activePlaceName = locationName.isResolving
        ? 'Current Coordinates'
        : (locationName.displayName || locationName.city || 'Local Atmosphere');

      const res = await sendWeatherGPTChat({
        message: text,
        latitude: locationCoordinates.latitude,
        longitude: locationCoordinates.longitude,
        location: activePlaceName,
        language: language || 'en',
        conversationId,
        conversation: recentHistory,
      });

      if (res && res.data) {
        const d = res.data;
        if (d.conversationId) setConversationId(d.conversationId);

        const assistantTurn = {
          id: `a_${Date.now()}`,
          role: 'assistant',
          content: d.reply,
          intentCard: d.intentCard || null,
          timeline: d.timeline || d.intentCard?.timeline || [],
          why: d.intentCard?.why || null,
          whatToDo: d.intentCard?.whatToDo || null,
          source: d.intentCard?.source || 'Open-Meteo · Atmospheric numerical model',
          followUpSuggestions: d.followUpSuggestions || [],
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };

        setMessages((prev) => [...prev, assistantTurn]);
      } else {
        throw new Error('Invalid response structure');
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: `err_${Date.now()}`,
          role: 'assistant',
          content: 'Atmospheric telemetry server momentarily unreachable. Please verify network connectivity.',
          intentCard: {
            badge: 'TELEMETRY DISRUPTION',
            primaryMetric: { value: '—', label: 'offline mode' },
            why: 'Unable to synchronize telemetry feeds with meteorological server.',
            whatToDo: 'Retry the query or verify local internet access.',
            source: 'System monitor',
          },
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  // Header display location
  const stationPlace = locationName.isResolving
    ? 'RESOLVING PLACE NAME'
    : (locationName.city || locationName.displayName || 'LOCAL ATMOSPHERE').toUpperCase().split(',')[0];

  const stationCoords = `${locationCoordinates.latitude.toFixed(2)}°N ${locationCoordinates.longitude.toFixed(2)}°E`;
  const stationFeed = weatherDataStatus === 'LIVE' ? 'LIVE DATA' : (weatherDataStatus === 'CACHED' ? 'CACHED DATA' : 'TELEMETRY ACTIVE');

  // The 6 requested editorial quick prompts
  const quickPrompts = [
    { label: 'Rain tomorrow', query: 'Will it rain tomorrow?' },
    { label: 'Tomorrow evening', query: 'Will it rain tomorrow evening?' },
    { label: 'AQI', query: 'What is the AQI right now?' },
    { label: 'Wind', query: 'How strong will the wind be tomorrow?' },
    { label: 'Travel', query: 'Is it safe to travel tomorrow?' },
    { label: '7-day outlook', query: 'What is the 7-day weather outlook?' },
  ];

  return (
    <div className="wgpt-desk-container">
      {/* 1. EDITORIAL HEADER */}
      <header className="wgpt-header">
        <div className="wgpt-super-title">
          WEATHERGPT / ATMOSPHERIC INTELLIGENCE
        </div>
        <h1 className="wgpt-editorial-title">
          Ask a question about your local atmosphere.
        </h1>
        <div className="wgpt-station-strip">
          <div className="wgpt-station-telemetry">
            <span className="wgpt-live-dot" />
            <span>{stationPlace} · {stationCoords} · {stationFeed}</span>
          </div>

          <div className="wgpt-station-controls">
            <button
              type="button"
              className="wgpt-btn-station"
              onClick={() => setShowLocationSearch((prev) => !prev)}
              aria-label="Change weather location"
            >
              <span>📍</span>
              <span>{showLocationSearch ? 'Close' : 'Change Location'}</span>
            </button>
            <button
              type="button"
              className="wgpt-btn-station"
              onClick={handleGpsClick}
              disabled={isLocating}
              aria-label="Acquire GPS coordinates"
            >
              <span>{isLocating ? '…' : 'GPS'}</span>
            </button>
          </div>
        </div>

        {/* Location Search Drawer */}
        {showLocationSearch && (
          <div className="wgpt-location-drawer">
            <form onSubmit={handleSearchSubmit} className="wgpt-search-form">
              <input
                type="text"
                className="wgpt-search-input"
                placeholder="Search city, district, or coordinates (e.g. Chandigarh, Mumbai, 28.61, 77.20)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
              />
              <button type="submit" className="wgpt-search-btn" disabled={isSearching}>
                {isSearching ? 'Resolving...' : 'Search'}
              </button>
            </form>

            {searchResults.length > 0 && (
              <div className="wgpt-search-results">
                {searchResults.map((loc, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className="wgpt-search-item"
                    onClick={() => handleSelectLocation(loc)}
                  >
                    <span>{loc.name}, {loc.admin1 || ''} {loc.country || ''}</span>
                    <span style={{ fontFamily: 'var(--font-mono, monospace)', color: '#9B958B' }}>
                      {loc.latitude.toFixed(2)}°, {loc.longitude.toFixed(2)}°
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </header>

      {/* 2. 6 EDITORIAL PROMPTS */}
      <section className="wgpt-prompts-bar" aria-label="Quick atmospheric queries">
        {quickPrompts.map((qp, idx) => (
          <button
            key={idx}
            type="button"
            className="wgpt-prompt-btn"
            onClick={() => sendMessage(qp.query)}
            disabled={isLoading}
          >
            {qp.label}
          </button>
        ))}
      </section>

      {/* 3. CONVERSATION STREAM */}
      <main className="wgpt-conversation-stream" aria-live="polite">
        <div className="wgpt-conversation-header">
          CONVERSATION
        </div>

        {messages.length === 0 && (
          <div className="wgpt-turn wgpt-turn-assistant">
            <div className="wgpt-speaker-tag">WEATHERGPT</div>
            <div className="wgpt-response-block">
              <div className="wgpt-meta-badge">ATMOSPHERIC DESK READY</div>
              <div className="wgpt-primary-metric-wrap">
                <div className="wgpt-primary-metric-number">
                  {liveTelemetry?.temperature != null ? `${liveTelemetry.temperature}°C` : '26°C'}
                </div>
                <div className="wgpt-primary-metric-label">
                  current local atmospheric temperature
                </div>
              </div>
              <div className="wgpt-secondary-strip">
                <span className="wgpt-sec-val">{stationPlace}</span>
                <span className="wgpt-sec-dot">·</span>
                <span className="wgpt-sec-val">{liveTelemetry?.windSpeed || 8} km/h</span>
                <span className="wgpt-sec-lbl">wind</span>
                <span className="wgpt-sec-dot">·</span>
                <span className="wgpt-sec-val">{liveTelemetry?.humidity || 50}%</span>
                <span className="wgpt-sec-lbl">humidity</span>
              </div>
              <div className="wgpt-section-divider" />
              <div className="wgpt-editorial-section">
                <div className="wgpt-section-heading">WHAT TO DO</div>
                <p className="wgpt-section-text">
                  Ask any question about tomorrow&apos;s rain, evening timing, wind gusts, air quality, or 7-day outlook.
                </p>
              </div>
              <div className="wgpt-section-divider" />
              <div className="wgpt-editorial-section">
                <div className="wgpt-section-heading">SOURCE</div>
                <div className="wgpt-source-text">Open-Meteo · Atmospheric numerical telemetry</div>
              </div>
            </div>
          </div>
        )}

        {messages.map((msg) => {
          if (msg.role === 'user') {
            return (
              <div key={msg.id} className="wgpt-turn wgpt-turn-user">
                <div className="wgpt-speaker-tag">YOU</div>
                <div className="wgpt-user-content">{msg.content}</div>
              </div>
            );
          }

          const card = msg.intentCard;
          const timeline = msg.timeline || card?.timeline || [];
          const whyText = msg.why || card?.why;
          const whatToDoText = msg.whatToDo || card?.whatToDo;
          const sourceText = msg.source || card?.source;

          return (
            <div key={msg.id} className="wgpt-turn wgpt-turn-assistant">
              <div className="wgpt-speaker-tag">WEATHERGPT</div>

              <div className="wgpt-response-block">
                {/* 1. Meta Badge (e.g. TOMORROW · 20:00) */}
                {card?.badge && (
                  <div className="wgpt-meta-badge">
                    {card.badge}
                  </div>
                )}

                {/* 2. Primary Metric (e.g. 38% precipitation probability) */}
                {card?.primaryMetric && (
                  <div className="wgpt-primary-metric-wrap">
                    <div className="wgpt-primary-metric-number">
                      {card.primaryMetric.value}
                    </div>
                    <div className="wgpt-primary-metric-label">
                      {card.primaryMetric.label}
                    </div>
                  </div>
                )}

                {/* 3. Secondary Metrics Strip (e.g. Mostly cloudy · 26°C · Wind 8 km/h) */}
                {card?.secondaryMetrics?.length > 0 && (
                  <div className="wgpt-secondary-strip">
                    {card.secondaryMetrics.map((sm, smIdx) => (
                      <React.Fragment key={smIdx}>
                        {smIdx > 0 && <span className="wgpt-sec-dot">·</span>}
                        <span className="wgpt-sec-val">{sm.value}</span>
                        {sm.label && <span className="wgpt-sec-lbl"> {sm.label.toLowerCase()}</span>}
                      </React.Fragment>
                    ))}
                  </div>
                )}

                {/* Fallback text if intentCard not fully structured */}
                {!card && msg.content && (
                  <p className="wgpt-section-text" style={{ whiteSpace: 'pre-line' }}>
                    {msg.content}
                  </p>
                )}

                {/* 4. Forecast Timeline (5-hour window with target hour highlighted) */}
                {timeline.length > 0 && (
                  <div className="wgpt-forecast-timeline" role="region" aria-label="Forecast hourly timeline">
                    <div className="wgpt-timeline-grid">
                      {timeline.map((slot, sIdx) => (
                        <div
                          key={sIdx}
                          className={`wgpt-timeline-cell ${slot.isTarget ? 'is-target' : ''}`}
                        >
                          <div className="wgpt-cell-hour">{slot.time || slot.timeFormatted}</div>
                          <div className="wgpt-cell-temp">{slot.temp}</div>
                          <div className="wgpt-cell-prob">{slot.prob}</div>
                          {slot.isTarget && <div className="wgpt-cell-badge">TARGET</div>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 5. Relevant Editorial Sections (Only rendered when relevant) */}
                {whyText && (
                  <>
                    <div className="wgpt-section-divider" />
                    <div className="wgpt-editorial-section">
                      <div className="wgpt-section-heading">WHY</div>
                      <p className="wgpt-section-text">{whyText}</p>
                    </div>
                  </>
                )}

                {whatToDoText && (
                  <>
                    <div className="wgpt-section-divider" />
                    <div className="wgpt-editorial-section">
                      <div className="wgpt-section-heading">WHAT TO DO</div>
                      <p className="wgpt-section-text">{whatToDoText}</p>
                    </div>
                  </>
                )}

                {sourceText && (
                  <>
                    <div className="wgpt-section-divider" />
                    <div className="wgpt-editorial-section">
                      <div className="wgpt-section-heading">SOURCE</div>
                      <div className="wgpt-source-text">{sourceText}</div>
                    </div>
                  </>
                )}

                {/* Contextual follow-up suggestions */}
                {msg.followUpSuggestions?.length > 0 && (
                  <div className="wgpt-followup-row">
                    {msg.followUpSuggestions.map((fu, fIdx) => (
                      <button
                        key={fIdx}
                        type="button"
                        className="wgpt-followup-chip"
                        onClick={() => sendMessage(typeof fu === 'string' ? fu : (fu.query || fu.label))}
                      >
                        {typeof fu === 'string' ? fu : (fu.label || fu.query)}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="wgpt-turn wgpt-turn-assistant">
            <div className="wgpt-speaker-tag">WEATHERGPT</div>
            <div className="wgpt-loading-indicator">
              <span className="wgpt-spinner" />
              <span>Analyzing atmospheric telemetry model...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </main>

      {/* 4. PINNED BOTTOM INPUT DOCK */}
      <footer className="wgpt-input-dock">
        <form
          className="wgpt-input-inner"
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage();
          }}
        >
          <input
            ref={inputRef}
            type="text"
            className="wgpt-chat-input"
            placeholder="Ask another question about your local atmosphere..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={isLoading}
            autoFocus
          />
          <button
            type="submit"
            className="wgpt-send-btn"
            disabled={!inputText.trim() || isLoading}
            aria-label="Send atmospheric inquiry"
          >
            →
          </button>
        </form>
      </footer>
    </div>
  );
}
