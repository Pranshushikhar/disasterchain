import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * DISASTERCHAIN GLOBAL COMMAND PALETTE ("Ask DisasterChain")
 * Global keyboard search & operational routing engine activated via '/' or 'Ctrl+K'.
 */
export default function GlobalCommandBar({ isOpen, onClose, onOpenSos, onOpenIncident }) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  // Core system commands and route destinations
  const COMMANDS = [
    {
      id: 'cmd-situation',
      category: 'OPERATIONS',
      title: 'Open Situation Room',
      subtitle: 'Central environmental telemetry and incident assessment',
      action: () => navigate('/'),
      keywords: ['home', 'overview', 'dashboard', 'situation', 'telemetry', 'status'],
    },
    {
      id: 'cmd-weather',
      category: 'WEATHER',
      title: 'Open Weather Intelligence',
      subtitle: '7-day outlook, convective risks, and Weather-to-Impact chain',
      action: () => navigate('/weather'),
      keywords: ['weather', 'forecast', 'rain', 'temperature', 'wind', 'aqi', 'air quality'],
    },
    {
      id: 'cmd-weather-gpt',
      category: 'WEATHER',
      title: 'Ask WeatherGPT Desk',
      subtitle: 'Atmospheric natural language conversational synthesis',
      action: () => navigate('/weather-gpt'),
      keywords: ['weathergpt', 'gpt', 'ai', 'ask', 'tomorrow', 'rain 8pm', 'chat'],
    },
    {
      id: 'cmd-map',
      category: 'SPATIAL',
      title: 'DisasterChain Spatial Model',
      subtitle: 'Interactive Leaflet cartographic map with progressive layer rail',
      action: () => navigate('/affected-areas'),
      keywords: ['map', 'spatial', 'cartography', 'layers', 'zones', 'sectors', 'flood risk'],
    },
    {
      id: 'cmd-incidents',
      category: 'HAZARDS',
      title: 'Active Incident Command',
      subtitle: 'Inspect civilian hazard reports, triage queue, and verification',
      action: () => navigate('/incidents'),
      keywords: ['incidents', 'hazards', 'fallen tree', 'waterlogging', 'reports', 'triage'],
    },
    {
      id: 'cmd-report-incident',
      category: 'HAZARDS',
      title: 'Submit Hazard / Incident Report',
      subtitle: 'Log a new local hazard for community verification',
      action: () => {
        onClose();
        if (onOpenIncident) onOpenIncident();
      },
      keywords: ['report', 'submit', 'hazard', 'new incident', 'damage'],
    },
    {
      id: 'cmd-alerts',
      category: 'ALERTS',
      title: 'Emergency Alert Center',
      subtitle: 'Review active public warning broadcasts and advisories',
      action: () => navigate('/alerts'),
      keywords: ['alerts', 'warnings', 'advisories', 'broadcasts', 'critical'],
    },
    {
      id: 'cmd-shelters',
      category: 'LOGISTICS',
      title: 'Nearest Operational Shelters',
      subtitle: 'Find open shelters, capacity telemetry, and evacuation routing',
      action: () => navigate('/shelters'),
      keywords: ['shelter', 'evacuation', 'relief center', 'safe zone', 'beds', 'capacity'],
    },
    {
      id: 'cmd-resources',
      category: 'LOGISTICS',
      title: 'Disaster Preparedness Guides',
      subtitle: 'Dos & Don’ts for Flood, Cyclone, Earthquake, Fire & Heatwaves',
      action: () => navigate('/guides'),
      keywords: ['preparedness', 'guides', 'dos and donts', 'flood guide', 'earthquake'],
    },
    {
      id: 'cmd-sos',
      category: 'EMERGENCY',
      title: 'Trigger Emergency SOS',
      subtitle: 'Broadcast emergency coordinates and initiate local rescue signal',
      action: () => {
        onClose();
        if (onOpenSos) onOpenSos();
      },
      keywords: ['sos', 'emergency', 'help', 'rescue', 'distress', 'urgent'],
    },
  ];

  // Filter commands by fuzzy match on title, category, and keywords
  const filteredCommands = query.trim()
    ? COMMANDS.filter((cmd) => {
        const q = query.toLowerCase();
        return (
          cmd.title.toLowerCase().includes(q) ||
          cmd.subtitle.toLowerCase().includes(q) ||
          cmd.category.toLowerCase().includes(q) ||
          cmd.keywords.some((k) => k.includes(q))
        );
      })
    : COMMANDS;

  // Keyboard navigation inside palette
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % filteredCommands.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filteredCommands.length) % filteredCommands.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredCommands[selectedIndex]) {
          filteredCommands[selectedIndex].action();
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredCommands, selectedIndex, onClose]);

  // Focus input upon open
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="dc-command-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="dc-command-modal" onClick={(e) => e.stopPropagation()}>
        {/* Search Input Bar */}
        <div className="dc-command-input-bar">
          <svg className="dc-search-icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            className="dc-command-input"
            placeholder="Ask DisasterChain or search locations, alerts, shelters, commands... (ESC to close)"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
          />
          <kbd className="dc-esc-key">ESC</kbd>
        </div>

        {/* Results List */}
        <div className="dc-command-results">
          {filteredCommands.length === 0 ? (
            <div className="dc-command-empty">
              <span>NO DIRECT MATCHES FOUND</span>
              <p>Try searching for "shelters", "weather", "incidents", "flood risk", or "sos".</p>
            </div>
          ) : (
            filteredCommands.map((cmd, idx) => (
              <div
                key={cmd.id}
                className={`dc-command-item ${idx === selectedIndex ? 'selected' : ''}`}
                onClick={() => {
                  cmd.action();
                  onClose();
                }}
                onMouseEnter={() => setSelectedIndex(idx)}
              >
                <div className="item-text-group">
                  <div className="item-title-row">
                    <span className="item-title">{cmd.title}</span>
                    <span className="item-category">{cmd.category}</span>
                  </div>
                  <span className="item-subtitle">{cmd.subtitle}</span>
                </div>
                <span className="item-enter-hint">↵</span>
              </div>
            ))
          )}
        </div>

        {/* Footer info bar */}
        <div className="dc-command-footer">
          <span>↑↓ to navigate</span>
          <span>↵ to execute</span>
          <span>ESC to dismiss</span>
        </div>
      </div>

      <style>{`
        .dc-command-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(13, 14, 13, 0.82);
          backdrop-filter: blur(8px);
          z-index: 9999;
          display: flex;
          align-items: flex-start;
          justify-content: center;
          padding-top: 14vh;
          animation: overlayFade 0.15s ease-out;
        }

        .dc-command-modal {
          width: 100%;
          max-width: 620px;
          background: #181A18;
          border: 1px solid rgba(242, 238, 231, 0.16);
          border-radius: 6px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.8);
          overflow: hidden;
          font-family: var(--font-sans, -apple-system, sans-serif);
          animation: modalSlide 0.15s ease-out;
        }

        .dc-command-input-bar {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem 1.25rem;
          border-bottom: 1px solid rgba(242, 238, 231, 0.08);
          background: #121413;
        }

        .dc-search-icon {
          color: #D66A35;
          flex-shrink: 0;
        }

        .dc-command-input {
          flex: 1;
          background: transparent;
          border: none;
          color: #F7F4ED;
          font-size: 0.95rem;
          outline: none;
        }

        .dc-command-input::placeholder {
          color: #7A756D;
          font-size: 0.85rem;
        }

        .dc-esc-key {
          font-family: var(--font-mono, monospace);
          font-size: 0.62rem;
          color: #7A756D;
          background: rgba(242, 238, 231, 0.06);
          border: 1px solid rgba(242, 238, 231, 0.1);
          padding: 0.2rem 0.4rem;
          border-radius: 2px;
        }

        .dc-command-results {
          max-height: 380px;
          overflow-y: auto;
          padding: 0.4rem;
        }

        .dc-command-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.65rem 0.85rem;
          border-radius: 3px;
          cursor: pointer;
          transition: background 0.1s ease;
        }

        .dc-command-item:hover,
        .dc-command-item.selected {
          background: rgba(214, 106, 53, 0.12);
        }

        .dc-command-item.selected .item-title {
          color: #D66A35;
        }

        .dc-command-item.selected .item-enter-hint {
          opacity: 1;
        }

        .item-text-group {
          display: flex;
          flex-direction: column;
          gap: 2px;
          min-width: 0;
        }

        .item-title-row {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .item-title {
          font-size: 0.88rem;
          font-weight: 500;
          color: #F7F4ED;
        }

        .item-category {
          font-family: var(--font-mono, monospace);
          font-size: 0.58rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          color: #7A756D;
          background: rgba(242, 238, 231, 0.04);
          padding: 0.1rem 0.35rem;
          border-radius: 2px;
        }

        .item-subtitle {
          font-size: 0.74rem;
          color: #A49F93;
        }

        .item-enter-hint {
          font-family: var(--font-mono, monospace);
          font-size: 0.72rem;
          color: #D66A35;
          opacity: 0;
          transition: opacity 0.1s ease;
        }

        .dc-command-empty {
          padding: 2rem 1.5rem;
          text-align: center;
        }

        .dc-command-empty span {
          display: block;
          font-family: var(--font-mono, monospace);
          font-size: 0.7rem;
          font-weight: 700;
          color: #7A756D;
          letter-spacing: 0.1em;
          margin-bottom: 0.35rem;
        }

        .dc-command-empty p {
          font-size: 0.78rem;
          color: #A49F93;
          margin: 0;
        }

        .dc-command-footer {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 1rem;
          padding: 0.45rem 1rem;
          background: #121413;
          border-top: 1px solid rgba(242, 238, 231, 0.06);
          font-family: var(--font-mono, monospace);
          font-size: 0.62rem;
          color: #7A756D;
        }

        @keyframes overlayFade {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes modalSlide {
          from { transform: translateY(-12px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
