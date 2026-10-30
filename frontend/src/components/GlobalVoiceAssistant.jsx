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
} from 'lucide-react';
import { useVoiceAssistant } from '../context/VoiceAssistantContext';
import { useTranslation } from '../i18n/i18n';

export default function GlobalVoiceAssistant() {
  const { t, currentLanguage } = useTranslation();
  const {
    isListening,
    isSpeaking,
    isProcessing,
    transcript,
    interimTranscript,
    lastSpokenText,
    statusMessage,
    voiceError,
    permissionState,
    isMuted,
    setIsMuted,
    sosConfirmation,
    startListening,
    stopListening,
    toggleListening,
    cancelSpeech,
    confirmSosExecution,
    cancelSosExecution,
    simulateVoiceInput,
  } = useVoiceAssistant();

  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // Auto-expand capsule when listening, speaking, or processing
  const isActive = isListening || isSpeaking || isProcessing || sosConfirmation.active;

  // Keyboard shortcut listener: Alt + V or Space while holding Alt
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.altKey && e.key.toLowerCase() === 'v') || (e.altKey && e.code === 'Space')) {
        e.preventDefault();
        toggleListening();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleListening]);

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
          2. FLOATING VOICE ASSISTANT CAPSULE (ACCESSIBLE FROM EVERY PAGE)
          ========================================================================= */}
      <div className="dc-voice-assistant-container" role="region" aria-label="Global Voice Control">
        {/* Expanded Transcript & Controls Card */}
        <AnimatePresence>
          {(isActive || isExpanded) && !sosConfirmation.active && (
            <motion.div
              className="dc-voice-transcript-card"
              initial={{ opacity: 0, y: 16, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.94 }}
              transition={{ duration: 0.18 }}
            >
              <div className="dc-voice-card-header">
                <div className="dc-voice-status-indicator">
                  <span
                    className={`dc-voice-status-dot ${
                      isListening ? 'listening' : isSpeaking ? 'speaking' : isProcessing ? 'processing' : 'idle'
                    }`}
                  />
                  <span className="dc-voice-status-label">
                    {isListening
                      ? t('voice.listening', 'Listening...')
                      : isSpeaking
                      ? t('voice.speaking', 'Speaking...')
                      : isProcessing
                      ? t('voice.processing', 'Processing command...')
                      : t('voice.ready', 'Voice Assistant')}
                  </span>
                </div>

                <div className="dc-voice-card-tools">
                  {isSpeaking && (
                    <>
                      <button
                        type="button"
                        onClick={cancelSpeech}
                        className="dc-voice-tool-btn"
                        title="Interrupt / Stop speech"
                        aria-label="Stop speech"
                      >
                        <Square size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsMuted(!isMuted)}
                        className={`dc-voice-tool-btn ${isMuted ? 'muted' : ''}`}
                        title={isMuted ? 'Unmute voice' : 'Mute voice'}
                        aria-label={isMuted ? 'Unmute voice' : 'Mute voice'}
                      >
                        {isMuted ? <VolumeX size={13} /> : <Volume2 size={13} />}
                      </button>
                    </>
                  )}
                  <button
                    type="button"
                    onClick={() => setIsHelpOpen(!isHelpOpen)}
                    className="dc-voice-tool-btn"
                    title="Voice command help"
                    aria-label="Voice command help"
                  >
                    <HelpCircle size={13} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsExpanded(false)}
                    className="dc-voice-tool-btn"
                    title="Collapse"
                    aria-label="Collapse voice card"
                  >
                    <X size={13} />
                  </button>
                </div>
              </div>

              {/* Live Speech Transcript / Spoken Output */}
              <div className="dc-voice-card-body">
                {isListening && (
                  <div className="dc-voice-live-text">
                    {interimTranscript || transcript ? (
                      <p className="dc-voice-transcript">
                        <span className="final">{transcript}</span>
                        <span className="interim"> {interimTranscript}</span>
                      </p>
                    ) : (
                      <p className="dc-voice-hint">
                        {t('voice.sayCommand', 'Speak naturally... e.g. "Open shelters", "What is the weather today?", or "SOS"')}
                      </p>
                    )}
                    {/* Audio Wave Visualizer Animation */}
                    <div className="dc-voice-wave-bars">
                      <span className="bar bar-1" />
                      <span className="bar bar-2" />
                      <span className="bar bar-3" />
                      <span className="bar bar-4" />
                      <span className="bar bar-5" />
                    </div>
                  </div>
                )}

                {isSpeaking && (
                  <div className="dc-voice-speaking-box">
                    <p className="dc-voice-spoken-text">{lastSpokenText || statusMessage}</p>
                    <div className="dc-voice-wave-bars speaking">
                      <span className="bar bar-1" />
                      <span className="bar bar-2" />
                      <span className="bar bar-3" />
                      <span className="bar bar-4" />
                      <span className="bar bar-5" />
                    </div>
                  </div>
                )}

                {isProcessing && (
                  <div className="dc-voice-processing-box">
                    <Loader2 size={16} className="dc-spin" />
                    <span>Executing application action...</span>
                  </div>
                )}

                {!isListening && !isSpeaking && !isProcessing && (
                  <div className="dc-voice-idle-content">
                    <p className="dc-voice-hint">
                      {statusMessage || t('voice.idleHint', 'Click microphone or press Alt+V to speak.')}
                    </p>
                  </div>
                )}

                {/* Permission Warning Notice */}
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
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating Persistent Activation Pill */}
        <div className="dc-voice-capsule-wrapper">
          <motion.button
            id="dc-global-voice-assistant-btn"
            type="button"
            onClick={toggleListening}
            className={`dc-voice-capsule-btn ${
              isListening ? 'listening' : isSpeaking ? 'speaking' : isProcessing ? 'processing' : 'idle'
            }`}
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.96 }}
            aria-label={isListening ? 'Stop listening' : 'Start voice control'}
            aria-pressed={isListening}
            title={isListening ? 'Listening (Click to stop)' : 'Voice Control (Alt+V)'}
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
              ) : (
                <Mic size={16} />
              )}
            </div>

            <span className="dc-voice-capsule-text">
              {isListening
                ? t('voice.listeningState', 'Listening...')
                : isSpeaking
                ? t('voice.speakingState', 'Speaking...')
                : isProcessing
                ? t('voice.processingState', 'Working...')
                : t('voice.voiceControl', 'Voice Control')}
            </span>

            {/* Micro Quick Status Indicator */}
            <span
              className={`dc-voice-capsule-led ${
                isListening ? 'active' : isSpeaking ? 'speaking' : 'ready'
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
                    Hands-Free Voice Commands
                  </h3>
                  <span className="dc-modal-subtitle">
                    DisasterChain supports natural voice control across all features & 20 languages
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
                  <h4>🚨 Emergency & SOS</h4>
                  <ul>
                    <li><code>"SOS"</code> or <code>"I need emergency help"</code></li>
                    <li><code>"Confirm SOS"</code> (Broadcast distress beacon)</li>
                    <li><code>"Cancel SOS"</code> (Abort emergency protocol)</li>
                  </ul>
                </div>

                <div className="dc-voice-help-category">
                  <h4>🧭 Navigation</h4>
                  <ul>
                    <li><code>"Open shelters"</code> / <code>"Show nearby shelters"</code></li>
                    <li><code>"Take me to weather"</code> / <code>"Open map"</code></li>
                    <li><code>"Show incident reports"</code> / <code>"Open safety"</code></li>
                    <li><code>"Return to home"</code> / <code>"Go back"</code></li>
                  </ul>
                </div>

                <div className="dc-voice-help-category">
                  <h4>🌦️ Weather & Atmospheric</h4>
                  <ul>
                    <li><code>"What is the weather today?"</code></li>
                    <li><code>"Tell me the temperature"</code></li>
                    <li><code>"Will it rain tomorrow?"</code></li>
                    <li><code>"Show tomorrow's forecast"</code></li>
                  </ul>
                </div>

                <div className="dc-voice-help-category">
                  <h4>🏥 Relief Shelters & Actions</h4>
                  <ul>
                    <li><code>"Find shelters near me"</code></li>
                    <li><code>"Show the nearest shelter"</code></li>
                    <li><code>"Get directions to this shelter"</code></li>
                    <li><code>"Show shelters on the map"</code></li>
                  </ul>
                </div>

                <div className="dc-voice-help-category">
                  <h4>🗺️ Spatial Map</h4>
                  <ul>
                    <li><code>"Show my current location"</code></li>
                    <li><code>"Zoom in"</code> / <code>"Zoom out"</code></li>
                    <li><code>"Show nearby incidents"</code></li>
                  </ul>
                </div>

                <div className="dc-voice-help-category">
                  <h4>🛡️ Safety Guidelines</h4>
                  <ul>
                    <li><code>"What should I do during a flood?"</code></li>
                    <li><code>"Show earthquake safety instructions"</code></li>
                    <li><code>"How can I prepare for a cyclone?"</code></li>
                  </ul>
                </div>

                <div className="dc-voice-help-category">
                  <h4>📞 Helplines & Settings</h4>
                  <ul>
                    <li><code>"Call emergency services"</code> (112)</li>
                    <li><code>"Show ambulance contact"</code> (108)</li>
                    <li><code>"Change language to Hindi / Punjabi"</code></li>
                    <li><code>"Turn on dark mode"</code></li>
                  </ul>
                </div>
              </div>

              <div className="dc-modal-footer">
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Tip: Press <strong>Alt + V</strong> anytime to activate the microphone.
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
