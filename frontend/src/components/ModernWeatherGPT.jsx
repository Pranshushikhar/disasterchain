import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  X,
  Send,
  Loader2,
} from 'lucide-react';
import { useWeatherGPT } from '../context/WeatherGPTContext';

export default function ModernWeatherGPT() {
  const location = useLocation();
  const {
    isOpen,
    openWeatherGPT,
    closeWeatherGPT,
    messages,
    sendMessage,
    isLoading,
    currentScreenContext,
  } = useWeatherGPT();

  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  // Auto-scroll messages
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // Contextual chip prompts based on current page
  const contextualChips = React.useMemo(() => {
    const path = location.pathname;
    if (path === '/' || path === '/dashboard') {
      return [
        'What is happening near me?',
        'Are local roads safe right now?',
        'When is rain expected today?',
      ];
    }
    if (path === '/weather') {
      return [
        'Will it rain heavily today?',
        'What is the 3-day flood outlook?',
        'Is air quality safe for travel?',
      ];
    }
    if (path === '/map' || path === '/affected-areas') {
      return [
        'What are these active warnings?',
        'Show safest transit corridor',
        'Where is the closest relief camp?',
      ];
    }
    if (path === '/safety' || path === '/sos') {
      return [
        'What should I do right now?',
        'What items go into a go-bag?',
        'How do I report rising water?',
      ];
    }
    return [
      'What is happening near me?',
      'How safe is my sector?',
      'Nearest available shelter',
    ];
  }, [location.pathname]);

  const handleSend = (textToSend) => {
    const query = textToSend || input;
    if (!query.trim() || isLoading) return;
    sendMessage(query);
    setInput('');
  };

  return (
    <>
      {/* FLOATING BUTTON (◉ WeatherGPT) */}
      {!isOpen && (
        <motion.button
          id="dc-weathergpt-floating-btn"
          className="dc-weathergpt-floating-pill"
          onClick={openWeatherGPT}
          initial={{ scale: 0.9, opacity: 0, y: 10 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          whileHover={{ scale: 1.04, y: -2 }}
          whileTap={{ scale: 0.97 }}
          transition={{ duration: 0.2 }}
          aria-label="Open WeatherGPT Assistant"
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

              <button
                className="dc-chat-close-btn"
                onClick={closeWeatherGPT}
                aria-label="Close Assistant"
              >
                <X size={18} />
              </button>
            </div>

            {/* Contextual Suggestion Chips */}
            <div className="dc-context-chips-bar">
              {contextualChips.map((chip, idx) => (
                <button
                  key={idx}
                  className="dc-context-chip"
                  onClick={() => handleSend(chip)}
                  disabled={isLoading}
                >
                  {chip}
                </button>
              ))}
            </div>

            {/* Chat Body */}
            <div className="dc-chat-body">
              {messages.length === 0 ? (
                <div className="dc-chat-empty-state">
                  <div className="dc-chat-empty-icon">
                    <Sparkles size={24} />
                  </div>
                  <h5>How can I assist your safety?</h5>
                  <p>
                    Ask about real-time localized rainfall, drainage risks, safe
                    evacuation corridors, or emergency protocols.
                  </p>
                </div>
              ) : (
                messages.map((m) => (
                  <div
                    key={m.id}
                    className={`dc-chat-msg ${m.role === 'user' ? 'user' : 'assistant'}`}
                  >
                    <div className="dc-msg-bubble">
                      <p className="dc-msg-text">{m.content}</p>
                      {m.why && (
                        <div className="dc-msg-why">
                          <strong>Why: </strong>
                          {m.why}
                        </div>
                      )}
                      {m.whatToDo && (
                        <div className="dc-msg-action">
                          <strong>Action: </strong>
                          {m.whatToDo}
                        </div>
                      )}
                    </div>
                  </div>
                ))
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
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about weather, risk, or emergency..."
                className="dc-chat-input"
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="dc-chat-send-btn"
                aria-label="Send query"
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
