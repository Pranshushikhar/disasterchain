import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mic,
  Volume2,
  VolumeX,
  Square,
  AlertTriangle,
  HelpCircle,
  X,
  Radio,
  Loader2,
  ShieldAlert,
  Send,
  Plus,
  Sparkles,
  User,
  ExternalLink,
} from 'lucide-react';
import { useVoiceAssistant } from '../context/VoiceAssistantContext';
import { useTranslation } from '../i18n/i18n';

export default function GlobalVoiceAssistant() {
  const { t, currentLanguage } = useTranslation();
  const {
    // Conversational Chat Window State
    isChatOpen,
    setIsChatOpen,
    openAssistant,
    closeAssistant,
    toggleAssistant,
    messages,
    inputText,
    setInputText,
    isThinking,
    sendMessage,
    clearConversation,

    // Voice Engine State
    isListening,
    isSpeaking,
    isProcessing,
    transcript,
    interimTranscript,
    lastSpokenText,
    statusMessage,
    voiceError,
    setVoiceError,
    permissionState,
    isMuted,
    setIsMuted,
    sosConfirmation,
    startListening,
    stopListening,
    toggleListening,
    speakText,
    cancelSpeech,
    confirmSosExecution,
    cancelSosExecution,
  } = useVoiceAssistant();

  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll messages to bottom
  useEffect(() => {
    if (isChatOpen && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isThinking, isChatOpen]);

  // Focus input when chat opens
  useEffect(() => {
    if (isChatOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 250);
    }
  }, [isChatOpen]);

  // Keyboard shortcut listener: Alt + V or Alt + Space
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.altKey && e.key.toLowerCase() === 'v') || (e.altKey && e.code === 'Space')) {
        e.preventDefault();
        toggleAssistant();
        if (!isListening && !isChatOpen) {
          setTimeout(() => startListening(), 200);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isChatOpen, isListening, startListening, toggleAssistant]);

  const handleSend = (e) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || isThinking) return;
    sendMessage(inputText.trim(), false);
  };

  const handleSuggestionClick = (queryText) => {
    sendMessage(queryText, false);
  };

  return (
    <>
      {/* =========================================================================
          1. SOS EMERGENCY VOICE CONFIRMATION BANNER (CRITICAL SAFETY PROTOCOL)
          ========================================================================= */}
      <AnimatePresence>
        {sosConfirmation.active && (
          <motion.div
            id="dc-voice-sos-modal"
            className="dc-voice-sos-overlay"
            initial={{ opacity: 0, y: -40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -40 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            role="alertdialog"
            aria-live="assertive"
            aria-labelledby="dc-voice-sos-title"
          >
            <div className="dc-voice-sos-card">
              <div className="dc-voice-sos-header">
                <div className="dc-voice-sos-badge">
                  <ShieldAlert size={18} className="dc-pulse-fast" />
                  <span>VOICE SOS PROTOCOL ACTIVE</span>
                </div>
                <div className="dc-voice-sos-timer" title="Auto-abort timer to prevent false alarms">
                  {sosConfirmation.countdown}s
                </div>
              </div>

              <h2 id="dc-voice-sos-title" className="dc-voice-sos-title">
                {t('voice.sosTitle', 'Emergency Assistance Requested')}
              </h2>

              <p className="dc-voice-sos-desc">
                {t(
                  'voice.sosInstruction',
                  'Your location has been locked. Say "Confirm SOS" or click confirm below to dispatch emergency rescue.'
                )}
              </p>

              {sosConfirmation.coords && (
                <div className="dc-voice-sos-coords">
                  <span>GPS Telemetry:</span>
                  <strong>
                    {sosConfirmation.coords.lat}°N, {sosConfirmation.coords.lon}°E
                  </strong>
                </div>
              )}

              {/* Progress Countdown Bar */}
              <div className="dc-voice-sos-progress-track">
                <div
                  className="dc-voice-sos-progress-fill"
                  style={{ width: `${(sosConfirmation.countdown / 15) * 100}%` }}
                />
              </div>

              <div className="dc-voice-sos-actions">
                <button
                  type="button"
                  id="dc-voice-confirm-sos-btn"
                  onClick={confirmSosExecution}
                  className="dc-voice-sos-confirm-btn"
                >
                  <Radio size={16} />
                  <span>Confirm SOS Broadcast</span>
                </button>

                <button
                  type="button"
                  id="dc-voice-cancel-sos-btn"
                  onClick={cancelSosExecution}
                  className="dc-voice-sos-cancel-btn"
                >
                  <X size={16} />
                  <span>Cancel (Say "Cancel SOS")</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* =========================================================================
          2. FLOATING ACTIVATION CAPSULE & CHATGPT-STYLE CONVERSATIONAL ASSISTANT
          ========================================================================= */}
      <div className="dc-voice-assistant-container" role="region" aria-label="Conversational AI Assistant">
        {/* Full Conversational AI Chat Window (ChatGPT-Style) */}
        <AnimatePresence>
          {isChatOpen && !sosConfirmation.active && (
            <motion.div
              id="dc-voice-assistant-window"
              className="dc-voice-chat-window"
              initial={{ opacity: 0, y: 24, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 24, scale: 0.95 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            >
              {/* Window Header */}
              <div className="dc-voice-chat-header">
                <div className="dc-voice-chat-identity">
                  <div className="dc-voice-avatar-ring">
                    <Sparkles size={16} className="dc-voice-avatar-icon" />
                    <span
                      className={`dc-voice-status-led-header ${
                        isListening ? 'listening' : isSpeaking ? 'speaking' : isThinking ? 'thinking' : 'idle'
                      }`}
                    />
                  </div>
                  <div>
                    <h3 className="dc-voice-chat-title">DisasterChain AI Assistant</h3>
                    <div className="dc-voice-chat-status-text">
                      {isListening
                        ? t('voice.listeningState', 'Listening to you...')
                        : isSpeaking
                        ? t('voice.speakingState', 'Speaking response...')
                        : isThinking
                        ? 'Thinking...'
                        : 'Conversational Intelligence & Operations'}
                    </div>
                  </div>
                </div>

                <div className="dc-voice-chat-tools">
                  <button
                    type="button"
                    onClick={clearConversation}
                    className="dc-voice-tool-btn"
                    title="Start New Chat"
                    aria-label="Start New Chat"
                  >
                    <Plus size={15} />
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsMuted(!isMuted)}
                    className={`dc-voice-tool-btn ${isMuted ? 'muted' : ''}`}
                    title={isMuted ? 'Unmute voice' : 'Mute voice'}
                    aria-label={isMuted ? 'Unmute voice' : 'Mute voice'}
                  >
                    {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsHelpOpen(true)}
                    className="dc-voice-tool-btn"
                    title="Voice command help"
                    aria-label="Voice command help"
                  >
                    <HelpCircle size={15} />
                  </button>

                  <button
                    type="button"
                    onClick={closeAssistant}
                    className="dc-voice-tool-btn"
                    title="Close"
                    aria-label="Close voice assistant"
                  >
                    <X size={15} />
                  </button>
                </div>
              </div>

              {/* Microphone / Speech Recognition Warning Banner */}
              {voiceError && (
                <div
                  style={{
                    margin: '8px 12px 0 12px',
                    padding: '8px 12px',
                    backgroundColor: '#FEF3C7',
                    border: '1px solid #F59E0B',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '0.8rem',
                    color: '#92400E',
                    lineHeight: 1.35,
                  }}
                  role="alert"
                >
                  <AlertTriangle size={16} style={{ flexShrink: 0, color: '#D97706' }} />
                  <span style={{ flex: 1 }}>{voiceError}</span>
                  {setVoiceError && (
                    <button
                      type="button"
                      onClick={() => setVoiceError(null)}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '2px',
                        color: '#92400E',
                        display: 'flex',
                        alignItems: 'center',
                      }}
                      aria-label="Dismiss error"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              )}

              {/* Chat Thread Messages */}
              <div className="dc-voice-chat-messages">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`dc-voice-msg-row ${msg.role === 'user' ? 'user' : 'assistant'}`}
                  >
                    <div className="dc-voice-msg-avatar">
                      {msg.role === 'user' ? <User size={13} /> : <Sparkles size={13} />}
                    </div>

                    <div className="dc-voice-msg-bubble">
                      <p className="dc-voice-msg-text">{msg.content}</p>

                      {/* Tool Action Badge */}
                      {msg.action && (
                        <div className="dc-voice-action-badge">
                          <ExternalLink size={12} />
                          <span>Action: {msg.action.label || msg.action.type}</span>
                        </div>
                      )}

                      {/* Spoken Message Replay / Stop Control */}
                      {msg.role === 'assistant' && (
                        <div className="dc-voice-msg-footer">
                          <button
                            type="button"
                            onClick={() => {
                              if (isSpeaking) {
                                cancelSpeech();
                              } else {
                                speakText(msg.content);
                              }
                            }}
                            className="dc-voice-replay-btn"
                            title={isSpeaking ? 'Stop speaking' : 'Read aloud'}
                          >
                            {isSpeaking ? <Square size={11} /> : <Volume2 size={11} />}
                            <span>{isSpeaking ? 'Stop' : 'Listen'}</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {/* Thinking Shimmer Indicator */}
                {isThinking && (
                  <div className="dc-voice-msg-row assistant">
                    <div className="dc-voice-msg-avatar">
                      <Sparkles size={13} />
                    </div>
                    <div className="dc-voice-msg-bubble thinking">
                      <div className="dc-voice-thinking-dots">
                        <span className="dot dot-1" />
                        <span className="dot dot-2" />
                        <span className="dot dot-3" />
                      </div>
                      <span className="dc-voice-thinking-label">Synthesizing intelligence...</span>
                    </div>
                  </div>
                )}

                {/* Quick Starter Suggestions (when chat has only initial greeting) */}
                {messages.length <= 1 && (
                  <div className="dc-voice-suggestions-wrap">
                    <span className="dc-voice-suggestions-title">Ask or try saying:</span>
                    <div className="dc-voice-suggestions-grid">
                      <button
                        type="button"
                        onClick={() => handleSuggestionClick('What can you help me with?')}
                        className="dc-voice-suggestion-chip"
                      >
                        "What can you help me with?"
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSuggestionClick('Why is disaster preparedness important?')}
                        className="dc-voice-suggestion-chip"
                      >
                        "Why is preparedness important?"
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSuggestionClick('What should I keep in my emergency kit?')}
                        className="dc-voice-suggestion-chip"
                      >
                        "What goes in an emergency kit?"
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSuggestionClick('What should I do during a flood?')}
                        className="dc-voice-suggestion-chip"
                      >
                        "What should I do during a flood?"
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSuggestionClick('What is the weather like today?')}
                        className="dc-voice-suggestion-chip"
                      >
                        "What is the weather today?"
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSuggestionClick('Will it rain tomorrow?')}
                        className="dc-voice-suggestion-chip"
                      >
                        "Will it rain tomorrow?"
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSuggestionClick('Show me the shelters.')}
                        className="dc-voice-suggestion-chip"
                      >
                        "Show me the shelters"
                      </button>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Active Audio Waveform & Speech Streaming Preview */}
              {(isListening || isSpeaking) && (
                <div className="dc-voice-live-audio-bar">
                  <div className="dc-voice-wave-bars">
                    <span className="bar bar-1" />
                    <span className="bar bar-2" />
                    <span className="bar bar-3" />
                    <span className="bar bar-4" />
                    <span className="bar bar-5" />
                  </div>

                  <div className="dc-voice-live-text-stream">
                    {isListening && (
                      <span className="dc-voice-interim-stream">
                        {interimTranscript || transcript || t('voice.sayCommand', 'Listening... speak naturally')}
                      </span>
                    )}
                    {isSpeaking && (
                      <span className="dc-voice-speaking-stream">
                        {lastSpokenText || statusMessage}
                      </span>
                    )}
                  </div>

                  {isSpeaking && (
                    <button
                      type="button"
                      onClick={cancelSpeech}
                      className="dc-voice-interrupt-btn"
                      title="Interrupt speech"
                    >
                      <Square size={12} />
                      <span>Interrupt</span>
                    </button>
                  )}
                </div>
              )}

              {/* Microphone Permission Warning Notice */}
              {permissionState === 'denied' && (
                <div className="dc-voice-perm-warning">
                  <AlertTriangle size={14} />
                  <span>Microphone access blocked. Click the lock icon in your URL bar to allow.</span>
                </div>
              )}

              {voiceError && permissionState !== 'denied' && (
                <div className="dc-voice-error-text">
                  <span>{voiceError}</span>
                </div>
              )}

              {/* Conversational Input Bar (Type or Speak) */}
              <form onSubmit={handleSend} className="dc-voice-chat-input-bar">
                <input
                  id="dc-voice-chat-input"
                  ref={inputRef}
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={
                    isListening
                      ? 'Listening... (or type your message)'
                      : 'Ask a question or say a command...'
                  }
                  className="dc-voice-chat-input"
                  disabled={isThinking}
                />

                {/* Microphone Toggle Button */}
                <button
                  id="dc-voice-mic-input-btn"
                  type="button"
                  onClick={toggleListening}
                  className={`dc-voice-mic-input-btn ${isListening ? 'listening' : ''}`}
                  title={isListening ? 'Stop listening' : 'Speak message'}
                  aria-label={isListening ? 'Stop listening' : 'Start voice recognition'}
                >
                  <Mic size={17} />
                  {isListening && <span className="dc-pulse-ring ring-1" />}
                </button>

                {/* Send Button */}
                <button
                  id="dc-voice-send-btn"
                  type="submit"
                  disabled={!inputText.trim() || isThinking}
                  className="dc-voice-send-btn"
                  title="Send message"
                  aria-label="Send message"
                >
                  <Send size={15} />
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating Persistent Activation Pill */}
        <div className="dc-voice-capsule-wrapper">
          <motion.button
            id="dc-global-voice-assistant-btn"
            type="button"
            onClick={toggleAssistant}
            className={`dc-voice-capsule-btn ${
              isListening ? 'listening' : isSpeaking ? 'speaking' : isProcessing || isThinking ? 'processing' : 'idle'
            }`}
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.96 }}
            aria-label={isChatOpen ? 'Close Conversational AI' : 'Open Conversational AI Assistant'}
            aria-pressed={isChatOpen}
            title={isListening ? 'Listening (Click to toggle)' : 'Conversational AI Assistant (Alt+V)'}
          >
            <div className="dc-voice-mic-icon-wrap">
              {isListening ? (
                <div className="dc-voice-pulsing-rings">
                  <span className="dc-pulse-ring ring-1" />
                  <span className="dc-pulse-ring ring-2" />
                  <Mic size={16} className="dc-mic-active-icon" />
                </div>
              ) : isSpeaking ? (
                <Volume2 size={16} className="dc-volume-active-icon" />
              ) : isThinking ? (
                <Loader2 size={16} className="dc-spin" />
              ) : (
                <Sparkles size={16} />
              )}
            </div>

            <span className="dc-voice-capsule-text">
              {isListening
                ? t('voice.listeningState', 'Listening...')
                : isSpeaking
                ? t('voice.speakingState', 'Speaking...')
                : isThinking || isProcessing
                ? 'Thinking...'
                : 'AI Assistant'}
            </span>

            {/* Micro Quick Status Indicator */}
            <span
              className={`dc-voice-capsule-led ${
                isListening ? 'active' : isSpeaking ? 'speaking' : isThinking ? 'thinking' : 'ready'
              }`}
            />
          </motion.button>
        </div>
      </div>

      {/* =========================================================================
          3. VOICE COMMANDS CHEAT SHEET / HELP MODAL
          ========================================================================= */}
      <AnimatePresence>
        {isHelpOpen && (
          <div className="dc-modal-overlay" onClick={() => setIsHelpOpen(false)}>
            <motion.div
              className="dc-voice-help-modal"
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-labelledby="dc-voice-help-title"
            >
              <div className="dc-modal-header">
                <div>
                  <h3 id="dc-voice-help-title" className="dc-modal-title">
                    Conversational AI & Voice Commands
                  </h3>
                  <span className="dc-modal-subtitle">
                    DisasterChain AI Assistant understands natural language, context follow-ups, and operates platform features
                  </span>
                </div>
                <button
                  onClick={() => setIsHelpOpen(false)}
                  className="dc-modal-close-btn"
                  aria-label="Close help"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="dc-voice-help-grid">
                <div className="dc-voice-help-category">
                  <h4>💬 Natural Conversation</h4>
                  <ul>
                    <li><code>"Hey, how are you?"</code></li>
                    <li><code>"What can you help me with?"</code></li>
                    <li><code>"Why is disaster preparedness important?"</code></li>
                    <li><code>"Can you explain this in simpler words?"</code></li>
                  </ul>
                </div>

                <div className="dc-voice-help-category">
                  <h4>🛡️ Safety Guidance & Follow-ups</h4>
                  <ul>
                    <li><code>"What should I do during a flood?"</code></li>
                    <li><code>"What if I am inside my house?"</code> (Context-aware)</li>
                    <li><code>"What about electricity?"</code> (Context-aware)</li>
                    <li><code>"What about children and elderly people?"</code></li>
                  </ul>
                </div>

                <div className="dc-voice-help-category">
                  <h4>🌦️ Unified WeatherGPT & Tools</h4>
                  <ul>
                    <li><code>"What is the weather today?"</code> (Live telemetry)</li>
                    <li><code>"Will it rain tomorrow?"</code> (Forecast data)</li>
                    <li><code>"Should I carry an umbrella?"</code></li>
                    <li><code>"Open the weather page"</code> (Navigates to /weather)</li>
                    <li><code>"Show me the shelters"</code> (Navigates to /shelters)</li>
                    <li><code>"Open the map"</code> (Navigates to /map)</li>
                  </ul>
                </div>

                <div className="dc-voice-help-category">
                  <h4>🚨 Critical Emergency SOS</h4>
                  <ul>
                    <li><code>"SOS"</code> or <code>"I need emergency help"</code></li>
                    <li>Announces protocol, locks GPS telemetry</li>
                    <li>Say <code>"Confirm SOS"</code> to broadcast</li>
                    <li>Say <code>"Cancel SOS"</code> to abort</li>
                  </ul>
                </div>
              </div>

              <div className="dc-modal-footer">
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Tip: Press <strong>Alt + V</strong> anytime to open the assistant.
                </span>
                <button
                  type="button"
                  onClick={() => setIsHelpOpen(false)}
                  className="dc-modal-done-btn"
                >
                  Got it
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
