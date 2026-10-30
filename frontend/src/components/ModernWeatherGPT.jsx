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
  Mic,
  Volume2,
  Square,
  Radio,
} from 'lucide-react';
import { useWeatherGPT } from '../context/WeatherGPTContext';
import { useTranslation } from '../i18n/i18n';
import { useVoiceAssistant } from '../context/VoiceAssistantContext';
import { cleanTextForSpeech } from '../services/voiceService';
import MarkdownRenderer from './MarkdownRenderer';

export default function ModernWeatherGPT() {
  const location = useLocation();
  const { t, languages, currentLanguage } = useTranslation();
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

  const {
    isListening,
    isSpeaking,
    startListening,
    stopListening,
    speakText,
    cancelSpeech,
    isMuted,
    setIsMuted,
    isVoiceConversationActive,
    setIsVoiceConversationActive,
    transcript,
    interimTranscript,
  } = useVoiceAssistant();

  const [input, setInput] = useState('');
  const chatBodyRef = useRef(null);
  const messagesEndRef = useRef(null);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
  const [speakingMessageId, setSpeakingMessageId] = useState(null);
  const lastSpokenMessageIdRef = useRef(null);

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

  // Sync spoken transcript to input field when WeatherGPT is open
  useEffect(() => {
    if (isOpen && isListening) {
      if (interimTranscript) {
        setInput(interimTranscript);
      } else if (transcript) {
        setInput(transcript);
      }
    }
  }, [isOpen, isListening, interimTranscript, transcript]);

  // Auto-speak newly received assistant messages when in voice mode or when user spoke
  useEffect(() => {
    if (!isOpen || messages.length === 0) return;
    const lastMsg = messages[messages.length - 1];

    if (
      lastMsg &&
      lastMsg.role === 'assistant' &&
      lastMsg.id !== lastSpokenMessageIdRef.current &&
      (isVoiceConversationActive || isListening || lastMsg.id.startsWith('a_'))
    ) {
      lastSpokenMessageIdRef.current = lastMsg.id;

      // Speak text if voice mode is on or user used voice
      if (isVoiceConversationActive && !isMuted) {
        const textToSpeak = cleanTextForSpeech(lastMsg.content);
        setSpeakingMessageId(lastMsg.id);
        speakText(textToSpeak, {
          lang: chatLanguage || currentLanguage || 'en',
          onEnd: () => setSpeakingMessageId(null),
          onError: () => setSpeakingMessageId(null),
        });
      }
    }
  }, [messages, isOpen, isVoiceConversationActive, isMuted, speakText, chatLanguage, currentLanguage, isListening]);

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
    cancelSpeech();
    sendMessage(query);
    setInput('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const toggleMicInsideWeatherGPT = () => {
    cancelSpeech();
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const handlePlayMessageAudio = (msg) => {
    if (speakingMessageId === msg.id && isSpeaking) {
      cancelSpeech();
      setSpeakingMessageId(null);
    } else {
      cancelSpeech();
      setSpeakingMessageId(msg.id);
      const text = cleanTextForSpeech(msg.content);
      speakText(text, {
        lang: chatLanguage || currentLanguage || 'en',
        onEnd: () => setSpeakingMessageId(null),
        onError: () => setSpeakingMessageId(null),
      });
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
                {/* Voice Conversation Mode Toggle */}
                <button
                  type="button"
                  onClick={() => setIsVoiceConversationActive(!isVoiceConversationActive)}
                  className={`dc-chat-header-btn ${isVoiceConversationActive ? 'active-voice' : ''}`}
                  title={
                    isVoiceConversationActive
                      ? 'Two-Way Voice Conversation Active (Click to disable)'
                      : 'Enable Hands-Free Voice Conversation Mode'
                  }
                  aria-label="Toggle voice conversation mode"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    padding: '3px 8px',
                    borderRadius: 6,
                    background: isVoiceConversationActive ? 'rgba(88, 214, 141, 0.2)' : 'transparent',
                    border: isVoiceConversationActive ? '1px solid #58D68D' : '1px solid transparent',
                    color: isVoiceConversationActive ? '#58D68D' : 'var(--text-muted)',
                  }}
                >
                  <Radio size={13} className={isVoiceConversationActive ? 'dc-pulse-fast' : ''} />
                  <span style={{ fontSize: '0.7rem', fontWeight: 700 }}>
                    {isVoiceConversationActive ? 'Voice Mode' : 'Voice'}
                  </span>
                </button>

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
                  onClick={() => {
                    cancelSpeech();
                    closeWeatherGPT();
                  }}
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
            <div className="dc-chat-body" ref={chatBodyRef} onScroll={handleScroll}>
              {messages.length === 0 ? (
                <div className="dc-chat-empty-state">
                  <div className="dc-empty-icon-wrap">
                    <Sparkles size={28} className="dc-sparkle-icon" />
                  </div>
                  <h5 className="dc-empty-title">
                    {t('weatherGpt.emptyTitle', 'Operational Atmospheric Copilot')}
                  </h5>
                  <p className="dc-empty-desc">
                    {t(
                      'weatherGpt.emptyDesc',
                      'Ask about rainfall telemetry, cyclonic trajectories, flood risk, or shelter accessibility in any of 20 languages.'
                    )}
                  </p>
                </div>
              ) : (
                messages.map((m) => {
                  const isError = m.intentCard?.badge === 'TELEMETRY DISRUPTION';
                  const isThisSpeaking = speakingMessageId === m.id && isSpeaking;

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

                        {/* Assistant Message Audio & Timestamp Controls */}
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            marginTop: 6,
                            gap: 8,
                          }}
                        >
                          {m.role === 'assistant' && !isError && (
                            <button
                              type="button"
                              onClick={() => handlePlayMessageAudio(m)}
                              className="dc-msg-audio-btn"
                              title={isThisSpeaking ? 'Stop speech' : 'Listen to response'}
                              aria-label={isThisSpeaking ? 'Stop speech' : 'Listen to response'}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 4,
                                background: isThisSpeaking ? 'rgba(88, 214, 141, 0.25)' : 'rgba(255, 255, 255, 0.08)',
                                border: '1px solid var(--border-subtle)',
                                borderRadius: 4,
                                padding: '2px 6px',
                                fontSize: '0.7rem',
                                color: isThisSpeaking ? '#58D68D' : 'var(--text-secondary)',
                                cursor: 'pointer',
                              }}
                            >
                              {isThisSpeaking ? <Square size={11} /> : <Volume2 size={11} />}
                              <span>{isThisSpeaking ? 'Stop' : 'Listen'}</span>
                            </button>
                          )}

                          {m.timestamp && (
                            <div className="dc-msg-timestamp">{m.timestamp}</div>
                          )}
                        </div>

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
                placeholder={
                  isListening
                    ? 'Listening... speak your question...'
                    : t('weatherGpt.placeholder', 'Ask about weather, risk, or emergency...')
                }
                className={`dc-chat-input ${isListening ? 'listening-active' : ''}`}
                rows={1}
                aria-label="Ask WeatherGPT a question"
              />

              {/* In-chat Microphone Button */}
              <button
                type="button"
                id="dc-weathergpt-mic-btn"
                onClick={toggleMicInsideWeatherGPT}
                className={`dc-chat-mic-btn ${isListening ? 'listening' : ''}`}
                aria-label={isListening ? 'Stop listening' : 'Speak to WeatherGPT'}
                title={isListening ? 'Stop listening' : 'Speak to WeatherGPT'}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  border: isListening ? '1px solid #E74C3C' : '1px solid var(--border-subtle)',
                  background: isListening ? 'rgba(231, 76, 60, 0.25)' : 'var(--dc-surface)',
                  color: isListening ? '#E74C3C' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  flexShrink: 0,
                  transition: 'all 0.15s ease',
                }}
              >
                {isListening ? (
                  <Mic size={16} className="dc-pulse-fast" />
                ) : (
                  <Mic size={16} />
                )}
              </button>

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
