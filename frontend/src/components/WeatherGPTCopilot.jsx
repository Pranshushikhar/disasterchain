import React, { useState, useRef, useEffect } from 'react';
import { useWeatherGPT } from '../context/WeatherGPTContext';
import WeatherGPTOrb from './WeatherGPTOrb';
import Icon from './Icons';

/**
 * DISASTERCHAIN — WEATHERGPT PERSISTENT FLOATING COPILOT
 * 
 * "Earth Intelligence / Emergency Command"
 * Embedded global operational copilot available across all views.
 */
export default function WeatherGPTCopilot() {
  const {
    isOpen,
    isMinimized,
    messages,
    isLoading,
    inputText,
    setInputText,
    currentScreenContext,
    locationCoordinates,
    locationName,
    openWeatherGPT,
    closeWeatherGPT,
    minimizeWeatherGPT,
    toggleWeatherGPT,
    sendMessage,
    clearMessages,
  } = useWeatherGPT();

  const [isHovered, setIsHovered] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const panelRef = useRef(null);

  // Auto-scroll chat to latest message
  useEffect(() => {
    if (isOpen && !isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading, isOpen, isMinimized]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && !isMinimized) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, isMinimized]);

  // Handle ESC key to minimize/close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen && !isMinimized) {
        // Only close WeatherGPT, never trigger emergency actions
        e.stopPropagation();
        closeWeatherGPT();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isMinimized, closeWeatherGPT]);

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!inputText.trim() || isLoading) return;
    sendMessage(inputText.trim());
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleFormSubmit(e);
    }
  };

  const quickActions = [
    { label: "What's the current risk?", query: "What is the current atmospheric and disaster risk in this area?" },
    { label: "Will weather worsen?", query: "Will the weather condition deteriorate over the next 6 to 12 hours?" },
    { label: "Show nearby shelters", query: "What are the nearest open emergency shelters with available capacity?" },
    { label: "What should I prepare?", query: "What emergency supplies and precautions should I prepare right now?" },
    { label: "Explain today's alerts", query: "Explain all active emergency alerts and advisories currently in effect." },
    { label: "Is it safe to travel?", query: "Is it safe to travel or commute on local roadways right now?" },
  ];

  return (
    <>
      {/* =========================================================================
          1. FLOATING COPILOT LAUNCHER POD (Fixed Bottom-Right)
          ========================================================================= */}
      {(!isOpen || isMinimized) && (
        <aside
          className={`weathergpt-floating-pod ${isHovered ? 'hovered' : ''}`}
          aria-label="WeatherGPT Emergency Intelligence Copilot"
        >
          {/* Tooltip */}
          {isHovered && (
            <div className="weathergpt-pod-tooltip" role="tooltip">
              <span className="tooltip-title">ASK WEATHERGPT</span>
              <span className="tooltip-sub">Emergency Intelligence Copilot</span>
            </div>
          )}

          <button
            type="button"
            className="weathergpt-pod-button"
            onClick={toggleWeatherGPT}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            aria-expanded={isOpen}
            id="weathergpt-launcher-btn"
            title="Ask WeatherGPT — Emergency Intelligence"
          >
            {/* 3D Earth Miniature Visual */}
            <div className="pod-orb-wrap">
              <WeatherGPTOrb size={46} showOrbit={true} />
            </div>

            {/* Pill Label */}
            <div className="pod-label-block">
              <div className="pod-title-row">
                <span className="pod-name">WEATHERGPT</span>
                <span className="pod-online-dot" aria-label="Status: Online">
                  <span className="dot-pulse" />
                  <span className="dot-core" />
                </span>
              </div>
              <div className="pod-subtitle">Emergency Intelligence</div>
            </div>
          </button>
        </aside>
      )}

      {/* =========================================================================
          2. ANCHORED COMMAND TERMINAL PANEL (Fixed Bottom-Right / Mobile Sheet)
          ========================================================================= */}
      {isOpen && !isMinimized && (
        <div
          ref={panelRef}
          className="weathergpt-terminal-panel"
          role="dialog"
          aria-labelledby="weathergpt-panel-title"
          aria-modal="false"
          id="weathergpt-chat-panel"
        >
          {/* TERMINAL HEADER */}
          <div className="terminal-header">
            <div className="header-brand-wrap">
              <div className="header-orb">
                <WeatherGPTOrb size={34} showOrbit={false} />
              </div>
              <div className="header-text-block">
                <div className="header-title-row">
                  <h2 id="weathergpt-panel-title" className="header-title">
                    WEATHERGPT
                  </h2>
                  <span className="live-status-pill">
                    <span className="pill-dot" />
                    LIVE
                  </span>
                </div>
                <div className="header-tagline">
                  Emergency Intelligence · Copilot
                </div>
              </div>
            </div>

            {/* Window Controls */}
            <div className="header-controls">
              <button
                type="button"
                className="btn-window-ctl"
                onClick={clearMessages}
                title="Clear terminal session"
                aria-label="Clear session"
              >
                <Icon name="refresh" size={13} />
              </button>
              <button
                type="button"
                className="btn-window-ctl"
                onClick={minimizeWeatherGPT}
                title="Minimize terminal"
                aria-label="Minimize terminal"
              >
                —
              </button>
              <button
                type="button"
                className="btn-window-ctl close-btn"
                onClick={closeWeatherGPT}
                title="Close terminal (Esc)"
                aria-label="Close terminal"
              >
                ✕
              </button>
            </div>
          </div>

          {/* DYNAMIC CONTEXT STRIP */}
          <div className="terminal-context-strip">
            <div className="context-indicator">
              <span className="context-prefix">CONTEXT:</span>
              <span className="context-name">{currentScreenContext.label}</span>
            </div>
            <div className="context-location">
              <span className="loc-dot">⌖</span>
              <span className="loc-text">
                {locationName.city || 'LOCAL SECTOR'}
              </span>
            </div>
          </div>

          {/* CHAT MESSAGES SCROLL AREA */}
          <div className="terminal-messages-body" tabIndex={0} aria-live="polite">
            {/* Operator Initial Welcome */}
            <div className="message-turn message-assistant operator-init">
              <div className="assistant-meta-row">
                <span className="badge-system">SYSTEM OPERATOR</span>
                <span className="meta-time">READY</span>
              </div>
              <div className="message-text">
                WeatherGPT online. Operational disaster intelligence ready.
                What do you need to know?
              </div>
            </div>

            {/* Quick Action Chips when no turns or few turns */}
            {messages.length === 0 && (
              <div className="quick-actions-rack">
                <div className="rack-label">PRIORITY TELEMETRY QUERIES</div>
                <div className="rack-chips">
                  {quickActions.map((qa) => (
                    <button
                      key={qa.label}
                      type="button"
                      className="quick-chip-btn"
                      onClick={() => sendMessage(qa.query)}
                      disabled={isLoading}
                    >
                      <span className="chip-bullet">›</span>
                      <span>{qa.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Rendered Conversation Turns */}
            {messages.map((turn) => {
              const isUser = turn.role === 'user';
              return (
                <div
                  key={turn.id}
                  className={`message-turn ${isUser ? 'message-user' : 'message-assistant'}`}
                >
                  <div className="turn-header-meta">
                    <span className={isUser ? 'meta-user-tag' : 'badge-system'}>
                      {isUser ? 'FIELD QUERY' : 'WEATHERGPT'}
                    </span>
                    {turn.context && isUser && (
                      <span className="meta-context-tag">[{turn.context}]</span>
                    )}
                    <span className="meta-time">{turn.timestamp}</span>
                  </div>

                  <div className="message-text">{turn.content}</div>

                  {/* Contextual Intelligence Card (Structured Data Instrument) */}
                  {turn.intentCard && (
                    <div className="copilot-intent-card">
                      {turn.intentCard.badge && (
                        <div className="intent-badge-row">
                          <span className="card-severity-badge">
                            {turn.intentCard.badge}
                          </span>
                          {turn.source && (
                            <span className="card-source-provenance">
                              {turn.source}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Primary Telemetry Metric Grid */}
                      {turn.intentCard.primaryMetric && (
                        <div className="intent-metric-display">
                          <div className="metric-val">
                            {turn.intentCard.primaryMetric.value}
                          </div>
                          <div className="metric-lbl">
                            {turn.intentCard.primaryMetric.label}
                          </div>
                        </div>
                      )}

                      {/* Why & What To Do */}
                      {turn.intentCard.why && (
                        <div className="card-intel-section">
                          <div className="intel-sec-hdr">OPERATIONAL REASONING</div>
                          <div className="intel-sec-body">{turn.intentCard.why}</div>
                        </div>
                      )}

                      {turn.intentCard.whatToDo && (
                        <div className="card-intel-section actionable">
                          <div className="intel-sec-hdr">RECOMMENDED ACTION</div>
                          <div className="intel-sec-body">
                            {turn.intentCard.whatToDo}
                          </div>
                        </div>
                      )}

                      {/* Forecast Timeline Bar */}
                      {turn.timeline && turn.timeline.length > 0 && (
                        <div className="card-timeline-strip">
                          <div className="intel-sec-hdr">FORWARD TIMELINE</div>
                          <div className="timeline-items">
                            {turn.timeline.slice(0, 5).map((pt, i) => (
                              <div key={i} className="timeline-col">
                                <span className="tl-time">{pt.time || pt.label}</span>
                                <span className="tl-val">
                                  {pt.temp != null ? `${pt.temp}°` : (pt.condition || pt.risk || '—')}
                                </span>
                                {pt.rain && (
                                  <span className="tl-rain">{pt.rain}</span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Follow-up suggestions */}
                  {turn.followUpSuggestions && turn.followUpSuggestions.length > 0 && (
                    <div className="turn-suggestions-row">
                      {turn.followUpSuggestions.slice(0, 3).map((sug, i) => (
                        <button
                          key={i}
                          type="button"
                          className="suggestion-pill-btn"
                          onClick={() => sendMessage(sug)}
                          disabled={isLoading}
                        >
                          › {sug}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Loading Indicator */}
            {isLoading && (
              <div className="message-turn message-assistant is-telemetry-syncing">
                <div className="turn-header-meta">
                  <span className="badge-system">WEATHERGPT</span>
                  <span className="meta-time">SYNCHRONIZING</span>
                </div>
                <div className="syncing-telemetry-indicator">
                  <span className="sync-pulse-bar" />
                  <span className="sync-text">
                    CALIBRATING ATMOSPHERIC RISK & SECTOR FEEDS...
                  </span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* CHAT INPUT AREA */}
          <form className="terminal-input-bar" onSubmit={handleFormSubmit}>
            <div className="input-wrap">
              <input
                ref={inputRef}
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={currentScreenContext.promptHint || "Ask about weather, risk, alerts, shelters..."}
                disabled={isLoading}
                className="terminal-input-field"
                aria-label="Ask WeatherGPT"
                id="weathergpt-terminal-input"
              />
              <button
                type="submit"
                disabled={!inputText.trim() || isLoading}
                className="btn-terminal-send"
                aria-label="Send message"
              >
                <Icon name="arrow-right" size={16} />
              </button>
            </div>

            <div className="terminal-reassurance-footer">
              <span className="reassurance-text">
                Mission Copilot · Live Geolocation Enabled
              </span>
              <span className="backup-emergency-link">
                Direct Emergency: <strong style={{ color: '#FF5C5C' }}>112</strong>
              </span>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
