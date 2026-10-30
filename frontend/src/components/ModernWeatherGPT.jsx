import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  X,
  Send,
  Loader2,
  RotateCcw,
  RefreshCw,
  AlertCircle,
  Globe,
} from 'lucide-react';
import { useWeatherGPT } from '../context/WeatherGPTContext';
import { useTranslation } from '../i18n/i18n';
import MarkdownRenderer from './MarkdownRenderer';

export default function ModernWeatherGPT() {
  const location = useLocation();
  const { t, languages } = useTranslation();
  const {
    isOpen,
    openWeatherGPT,
    closeWeatherGPT,
    messages,
    sendMessage,
    isLoading,
    clearMessages,
    chatLanguage,
    setChatLanguage,
  } = useWeatherGPT();

  const [input, setInput] = useState('');
  const chatBodyRef = useRef(null);
  const messagesEndRef = useRef(null);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);

  // Auto-scroll messages only when user is near bottom
  useEffect(() => {
    if (isOpen && shouldAutoScroll) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading, isOpen, shouldAutoScroll]);

  // Track if user scrolled up manually
  const handleScroll = useCallback(() => {
    if (!chatBodyRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = chatBodyRef.current;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 60;
    setShouldAutoScroll(isNearBottom);
  }, []);

  // Contextual chip prompts based on current page and language
  const contextualChips = React.useMemo(() => {
    const path = location.pathname;
    if (path === '/' || path === '/dashboard') {
      return [
        t('weatherGpt.chips.nearMe', 'What is happening near me?'),
        t('weatherGpt.chips.roadsSafe', 'Are local roads safe right now?'),
        t('weatherGpt.chips.rainExpected', 'When is rain expected today?'),
      ];
    }
    if (path === '/weather') {
      return [
        t('weatherGpt.chips.heavyRain', 'Will it rain heavily today?'),
        t('weatherGpt.chips.floodOutlook', 'What is the 3-day flood outlook?'),
        t('weatherGpt.chips.airQuality', 'Is air quality safe for travel?'),
      ];
    }
    if (path === '/map' || path === '/affected-areas') {
      return [
        t('weatherGpt.chips.activeWarnings', 'What are these active warnings?'),
        t('weatherGpt.chips.safestRoute', 'Show safest transit corridor'),
        t('weatherGpt.chips.closestCamp', 'Where is the closest relief camp?'),
      ];
    }
    if (path === '/safety' || path === '/sos') {
      return [
        t('weatherGpt.chips.whatToDo', 'What should I do right now?'),
        t('weatherGpt.chips.goBag', 'What items go into a go-bag?'),
        t('weatherGpt.chips.reportWater', 'How do I report rising water?'),
      ];
    }
    return [
      t('weatherGpt.chips.weatherArea', 'What is the weather in my area?'),
      t('weatherGpt.chips.safeSector', 'How safe is my sector?'),
      t('weatherGpt.chips.nearestShelter', 'Nearest available shelter'),
    ];
  }, [location.pathname, t]);

  const handleSend = (textToSend) => {
    const query = textToSend || input;
    if (!query.trim() || isLoading) return;
    setShouldAutoScroll(true);
    sendMessage(query);
    setInput('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Find last user prompt for retry
  const lastUserPrompt = React.useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === 'user') return messages[i].content;
    }
    return '';
  }, [messages]);

  return (
    <>
      {/* FLOATING BUTTON (◉ WeatherGPT) */}
      {!isOpen && (
        <motion.button
          id="dc-weathergpt-floating-btn"
          className="dc-weathergpt-floating-pill"
          onClick={() => openWeatherGPT()}
          initial={{ scale: 0.9, opacity: 0, y: 10 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          whileHover={{ scale: 1.04, y: -2 }}
          whileTap={{ scale: 0.97 }}
          transition={{ duration: 0.2 }}
          aria-label="Open WeatherGPT Assistant"
          title="Open WeatherGPT Intelligence Copilot"
        >
          <span className="dc-assistant-pulse-dot" />
          <span className="dc-assistant-pill-text">WeatherGPT</span>
        </motion.button>
      )}

      {/* EXPANDED FLOATING CHAT PANEL */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="dc-weathergpt-panel"
            initial={{ opacity: 0, y: 30, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.96 }}
            transition={{ type: 'spring', damping: 26, stiffness: 320 }}
            role="dialog"
            aria-label="WeatherGPT Earth Intelligence Copilot"
          >
            {/* Header */}
            <div className="dc-chat-header">
              <div className="dc-chat-brand">
                <span className="dc-assistant-pulse-dot" />
                <div>
                  <h4 className="dc-chat-title">WeatherGPT</h4>
                  <span className="dc-chat-sub">Earth Intelligence Copilot</span>
                </div>
              </div>

              <div className="dc-chat-header-actions">
                {/* Language Switcher Dropdown inside WeatherGPT */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Globe size={13} style={{ color: 'var(--text-muted)' }} />
                  <select
                    value={chatLanguage || 'en'}
                    onChange={(e) => setChatLanguage(e.target.value)}
                    aria-label="WeatherGPT Language"
                    style={{
                      background: 'var(--dc-surface)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 6,
                      padding: '2px 6px',
                      fontSize: '0.74rem',
                      fontWeight: 600,
                      color: 'var(--text-primary)',
                      cursor: 'pointer',
                      outline: 'none',
                    }}
                  >
                    <option value="en">English</option>
                    {languages
                      .filter((l) => l.code !== 'en')
                      .map((l) => (
                        <option key={l.code} value={l.code}>
                          {l.nativeName} ({l.name})
                        </option>
                      ))}
                  </select>
                </div>

                {messages.length > 0 && (
                  <button
                    type="button"
                    className="dc-chat-header-btn"
                    onClick={clearMessages}
                    title="Clear conversation"
                    aria-label="Clear conversation"
                  >
                    <RotateCcw size={15} />
                  </button>
                )}
                <button
                  type="button"
                  className="dc-chat-close-btn"
                  onClick={closeWeatherGPT}
                  aria-label="Close Assistant"
                  title="Close Assistant"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Contextual Suggestion Chips */}
            <div className="dc-context-chips-bar" role="toolbar" aria-label="Suggested prompts">
              {contextualChips.map((chip, idx) => (
                <button
                  key={idx}
                  type="button"
                  className="dc-context-chip"
                  onClick={() => handleSend(chip)}
                  disabled={isLoading}
                >
                  {chip}
                </button>
              ))}
            </div>

            {/* Chat Body */}
            <div
              className="dc-chat-body"
              ref={chatBodyRef}
              onScroll={handleScroll}
              role="log"
              aria-live="polite"
            >
              {messages.length === 0 ? (
                <div className="dc-chat-empty-state">
                  <div className="dc-chat-empty-icon">
                    <Sparkles size={24} />
                  </div>
                  <h5>
                    {t('weatherGpt.greeting', 'How can I assist your safety?')}
                  </h5>
                  <p>
                    {t('weatherGpt.emptyPrompt', 'Ask about localized rain, flood outlooks, road safety, evacuation corridors, or emergency go-bags.')}
                  </p>
                </div>
              ) : (
                messages.map((m) => {
                  const isError = m.id && String(m.id).startsWith('err_');
                  return (
                    <div
                      key={m.id}
                      className={`dc-chat-msg ${m.role === 'user' ? 'user' : 'assistant'} ${isError ? 'error' : ''}`}
                    >
                      <div className="dc-msg-bubble">
                        {isError && (
                          <div className="dc-msg-error-indicator">
                            <AlertCircle size={15} />
                            <span>Connection Disrupted</span>
                          </div>
                        )}

                        {m.role === 'user' ? (
                          <p className="dc-msg-text-user">{m.content}</p>
                        ) : (
                          <MarkdownRenderer
                            content={m.content}
                            className="dc-msg-text-markdown"
                          />
                        )}

                        {m.why && (
                          <div className="dc-msg-why">
                            <strong className="dc-msg-label">Why: </strong>
                            <span>{m.why}</span>
                          </div>
                        )}
                        {m.whatToDo && (
                          <div className="dc-msg-action">
                            <strong className="dc-msg-label">Action: </strong>
                            <span>{m.whatToDo}</span>
                          </div>
                        )}

                        {isError && lastUserPrompt && (
                          <button
                            type="button"
                            className="dc-chat-retry-btn"
                            onClick={() => handleSend(lastUserPrompt)}
                            disabled={isLoading}
                          >
                            <RefreshCw size={13} />
                            <span>Retry inquiry</span>
                          </button>
                        )}

                        {m.timestamp && (
                          <div className="dc-msg-timestamp">{m.timestamp}</div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}

              {isLoading && (
                <div className="dc-chat-msg assistant">
                  <div className="dc-msg-bubble loading">
                    <Loader2 size={16} className="dc-spin" />
                    <span>Analyzing atmospheric & hazard data...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="dc-chat-input-bar"
            >
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={t('weatherGpt.placeholder', 'Ask about weather, risk, or emergency...')}
                className="dc-chat-input"
                rows={1}
                aria-label="Ask WeatherGPT a question"
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="dc-chat-send-btn"
                aria-label="Send message"
                title="Send message (Enter)"
              >
                <Send size={16} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
