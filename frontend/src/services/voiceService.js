/**
 * DisasterChain Voice Control & Speech Synthesis Engine
 * Complete, reliable, hands-free speech recognition and text-to-speech services.
 * Supports all 20 DisasterChain languages + English fallback.
 */

import { SUPPORTED_LANGUAGES } from '../i18n/languageConfig';

// Comprehensive language-code to BCP 47 IETF speech tag mapping
export const VOICE_LANGUAGE_MAP = {
  en: 'en-US',
  hi: 'hi-IN',
  bn: 'bn-IN',
  te: 'te-IN',
  mr: 'mr-IN',
  ta: 'ta-IN',
  gu: 'gu-IN',
  kn: 'kn-IN',
  ml: 'ml-IN',
  pa: 'pa-IN',
  or: 'or-IN',
  as: 'as-IN',
  ur: 'ur-IN',
  sa: 'sa-IN',
  ne: 'ne-NP',
  kok: 'kok-IN',
  ks: 'ks-IN',
  mai: 'mai-IN',
  sd: 'sd-IN',
  mni: 'mni-IN',
};

/**
 * Procedural Web Audio Sound Generator (Subtle audio feedback for voice actions)
 * Produces crisp, pleasant tones without needing external MP3/WAV assets.
 */
class ProceduralAudioFeedback {
  constructor() {
    this.ctx = null;
  }

  init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  playTone(freq, type, duration, gainLevel = 0.08) {
    try {
      this.init();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      gain.gain.setValueAtTime(gainLevel, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch (e) {}
  }

  playListeningChime() {
    // Subtle ascending double chime (440Hz -> 660Hz)
    this.playTone(480, 'sine', 0.12, 0.05);
    setTimeout(() => this.playTone(720, 'sine', 0.18, 0.05), 90);
  }

  playSuccessChime() {
    // Soft high confirmation tone (880Hz)
    this.playTone(523.25, 'sine', 0.1, 0.05); // C5
    setTimeout(() => this.playTone(659.25, 'sine', 0.15, 0.05), 80); // E5
  }

  playSosChime() {
    // Urgent dual tone
    this.playTone(880, 'triangle', 0.16, 0.1);
    setTimeout(() => this.playTone(880, 'triangle', 0.22, 0.12), 160);
  }

  playStopChime() {
    // Gentle descending tone
    this.playTone(580, 'sine', 0.1, 0.04);
    setTimeout(() => this.playTone(380, 'sine', 0.12, 0.03), 80);
  }
}

export const audioFeedback = new ProceduralAudioFeedback();

/**
 * Strips raw Markdown, code, URLs, timestamps, HTML, and technical formatting
 * so that text-to-speech speaks natural, conversational language.
 */
export function cleanTextForSpeech(text) {
  if (!text || typeof text !== 'string') return '';

  let cleaned = text;

  // 1. Remove code blocks ```...``` and inline code `...`
  cleaned = cleaned.replace(/```[\s\S]*?```/g, ' ');
  cleaned = cleaned.replace(/`([^`]+)`/g, '$1');

  // 2. Remove markdown images ![alt](url) and convert links [label](url) to label
  cleaned = cleaned.replace(/!\[[^\]]*\]\([^)]*\)/g, ' ');
  cleaned = cleaned.replace(/\[([^\]]+)\]\([^)]*\)/g, '$1');

  // 3. Remove URLs
  cleaned = cleaned.replace(/https?:\/\/\S+/gi, ' ');

  // 4. Remove Markdown headers (#, ##, ###) even with leading indentation
  cleaned = cleaned.replace(/^\s*#{1,6}\s+/gm, ' ');

  // 5. Remove bold and italics formatting (**bold**, *italic*, __bold__, _italic_)
  cleaned = cleaned.replace(/(\*\*|__)(.*?)\1/g, '$2');
  cleaned = cleaned.replace(/(\*|_)(.*?)\1/g, '$2');

  // 6. Remove strikethrough (~~text~~)
  cleaned = cleaned.replace(/~~(.*?)~~/g, '$1');

  // 7. Remove blockquotes and list bullets
  cleaned = cleaned.replace(/^\s*>\s+/gm, ' ');
  cleaned = cleaned.replace(/^\s*[-*+]\s+/gm, ' ');
  cleaned = cleaned.replace(/^\s*\d+\.\s+/gm, ' ');

  // 8. Remove markdown tables (| header | header |)
  cleaned = cleaned.replace(/\|[^\n]+\|/g, ' ');
  cleaned = cleaned.replace(/[-:|]{3,}/g, ' ');

  // 9. Remove HTML tags
  cleaned = cleaned.replace(/<[^>]*>/g, ' ');

  // 10. Clean up temperature representations (e.g. 25°C -> 25 degrees Celsius)
  cleaned = cleaned.replace(/(\d+)\s*°\s*C\b/gi, '$1 degrees Celsius');
  cleaned = cleaned.replace(/(\d+)\s*°\s*F\b/gi, '$1 degrees Fahrenheit');

  // 11. Remove emojis and uncommon symbols
  cleaned = cleaned.replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, ' ');

  // 12. Normalize multiple spaces, newlines, and dangling punctuation
  cleaned = cleaned.replace(/\s+/g, ' ').trim();
  cleaned = cleaned.replace(/^[.,;:!?\s]+/, '').replace(/[.,;:!?\s]+$/, '.');

  return cleaned;
}

/**
 * Speech Recognition Wrapper (Web Speech API)
 * Seamlessly abstracts browser recognition with multi-language support,
 * interim transcripts, continuous listening, and error resilience.
 */
class SpeechRecognizerService {
  constructor() {
    this.recognition = null;
    this.isListening = false;
    this.currentLanguage = 'en';
    this.listeners = {
      start: [],
      end: [],
      interim: [],
      final: [],
      error: [],
      stateChange: [],
    };
    this.reconnectAttempts = 0;
    this.shouldKeepListening = false;
    this.initRecognition();
  }

  initRecognition() {
    if (typeof window === 'undefined') return;

    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRec) {
      console.warn('[VoiceService] Web SpeechRecognition is not supported in this environment.');
      return;
    }

    try {
      this.recognition = new SpeechRec();
      this.recognition.continuous = false; // Turn-based for natural command cadence
      this.recognition.interimResults = true;
      this.recognition.maxAlternatives = 2;

      this.recognition.onstart = () => {
        this.isListening = true;
        this.reconnectAttempts = 0;
        this.emit('start');
        this.emit('stateChange', 'listening');
      };

      this.recognition.onresult = (event) => {
        let interimText = '';
        let finalText = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const item = event.results[i];
          const transcript = item[0].transcript;
          if (item.isFinal) {
            finalText += transcript;
          } else {
            interimText += transcript;
          }
        }

        if (interimText.trim()) {
          this.emit('interim', interimText.trim());
        }

        if (finalText.trim()) {
          this.emit('final', finalText.trim());
        }
      };

      this.recognition.onerror = (event) => {
        console.warn('[VoiceService] Speech recognition error:', event.error);
        this.emit('error', event.error);

        // Do not crash on transient no-speech or network hiccups
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          this.shouldKeepListening = false;
          this.emit('stateChange', 'permission_denied');
        }
      };

      this.recognition.onend = () => {
        this.isListening = false;
        this.emit('end');

        // Continuous / wake mode handling
        if (this.shouldKeepListening && this.reconnectAttempts < 3) {
          this.reconnectAttempts++;
          setTimeout(() => {
            if (this.shouldKeepListening) {
              try {
                this.recognition.start();
              } catch (e) {}
            }
          }, 300);
        } else {
          this.emit('stateChange', 'idle');
        }
      };
    } catch (e) {
      console.warn('[VoiceService] Error initializing SpeechRecognition:', e);
    }
  }

  isSupported() {
    return Boolean(
      typeof window !== 'undefined' &&
        (window.SpeechRecognition || window.webkitSpeechRecognition)
    );
  }

  on(event, callback) {
    if (this.listeners[event]) {
      this.listeners[event].push(callback);
    }
    return () => this.off(event, callback);
  }

  off(event, callback) {
    if (this.listeners[event]) {
      this.listeners[event] = this.listeners[event].filter((cb) => cb !== callback);
    }
  }

  emit(event, data) {
    if (this.listeners[event]) {
      this.listeners[event].forEach((cb) => {
        try {
          cb(data);
        } catch (e) {
          console.error('[VoiceService] Listener error:', e);
        }
      });
    }
  }

  setLanguage(langCode) {
    this.currentLanguage = langCode || 'en';
    const speechTag = VOICE_LANGUAGE_MAP[this.currentLanguage] || 'en-US';
    if (this.recognition) {
      this.recognition.lang = speechTag;
    }
  }

  start(langCode = null, continuous = false) {
    if (!this.recognition) {
      this.initRecognition();
    }
    if (!this.recognition) {
      this.emit('error', 'not_supported');
      return false;
    }

    if (langCode) {
      this.setLanguage(langCode);
    } else {
      const speechTag = VOICE_LANGUAGE_MAP[this.currentLanguage] || 'en-US';
      this.recognition.lang = speechTag;
    }

    this.shouldKeepListening = Boolean(continuous);

    try {
      if (this.isListening) {
        this.recognition.stop();
      }
      this.recognition.start();
      audioFeedback.playListeningChime();
      return true;
    } catch (err) {
      console.warn('[VoiceService] Recognition start error:', err);
      return false;
    }
  }

  stop() {
    this.shouldKeepListening = false;
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
        audioFeedback.playStopChime();
      } catch (e) {}
    }
    this.isListening = false;
  }

  abort() {
    this.shouldKeepListening = false;
    if (this.recognition) {
      try {
        this.recognition.abort();
      } catch (e) {}
    }
    this.isListening = false;
    this.emit('stateChange', 'idle');
  }
}

export const speechRecognizer = new SpeechRecognizerService();

/**
 * Speech Synthesis Wrapper (Web Speech API)
 * High-quality text-to-speech with natural rate, language matching,
 * interruption, pause/resume, and voice fallback detection.
 */
class SpeechSynthesizerService {
  constructor() {
    this.synth = typeof window !== 'undefined' ? window.speechSynthesis : null;
    this.voices = [];
    this.currentUtterance = null;
    this.isSpeakingState = false;
    this.isPausedState = false;
    this.listeners = {
      start: [],
      end: [],
      pause: [],
      resume: [],
      error: [],
    };
    this.loadVoices();
  }

  loadVoices() {
    if (!this.synth) return;
    const updateVoices = () => {
      this.voices = this.synth.getVoices() || [];
    };
    updateVoices();
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }
  }

  isSupported() {
    return Boolean(typeof window !== 'undefined' && window.speechSynthesis);
  }

  on(event, callback) {
    if (this.listeners[event]) {
      this.listeners[event].push(callback);
    }
    return () => {
      if (this.listeners[event]) {
        this.listeners[event] = this.listeners[event].filter((cb) => cb !== callback);
      }
    };
  }

  emit(event, data) {
    if (this.listeners[event]) {
      this.listeners[event].forEach((cb) => {
        try {
          cb(data);
        } catch (e) {}
      });
    }
  }

  getBestVoice(langCode = 'en') {
    if (!this.voices.length) {
      this.loadVoices();
    }
    const targetTag = (VOICE_LANGUAGE_MAP[langCode] || 'en-US').toLowerCase();
    const shortTag = (langCode || 'en').toLowerCase();

    // 1. Exact BCP-47 match
    let match = this.voices.find(
      (v) => (v.lang || '').toLowerCase() === targetTag || (v.lang || '').toLowerCase().replace('_', '-') === targetTag
    );

    // 2. Prefix match (e.g. "hi" or "pa" or "bn")
    if (!match) {
      match = this.voices.find(
        (v) => (v.lang || '').toLowerCase().startsWith(shortTag)
      );
    }

    // 3. Indian English / Natural voices if available
    if (!match && shortTag === 'en') {
      match = this.voices.find((v) => (v.lang || '').toLowerCase().includes('en-in')) ||
              this.voices.find((v) => (v.name || '').toLowerCase().includes('natural')) ||
              this.voices.find((v) => (v.lang || '').toLowerCase().startsWith('en'));
    }

    // 4. Fallback to default system voice
    return match || this.voices.find((v) => v.default) || this.voices[0] || null;
  }

  speak(rawText, options = {}) {
    if (!this.synth) {
      console.warn('[VoiceService] SpeechSynthesis is not supported.');
      return false;
    }

    const {
      lang = 'en',
      rate = 1.0,
      pitch = 1.0,
      volume = 1.0,
      onStart = null,
      onEnd = null,
      onError = null,
    } = options;

    const textToSpeak = cleanTextForSpeech(rawText);
    if (!textToSpeak.trim()) return false;

    // Cancel any ongoing speech to allow clean interruption
    this.cancel();

    try {
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      const voice = this.getBestVoice(lang);
      if (voice) {
        utterance.voice = voice;
      }
      utterance.lang = VOICE_LANGUAGE_MAP[lang] || 'en-US';
      utterance.rate = Math.max(0.75, Math.min(1.5, rate));
      utterance.pitch = Math.max(0.8, Math.min(1.2, pitch));
      utterance.volume = Math.max(0, Math.min(1, volume));

      utterance.onstart = () => {
        this.isSpeakingState = true;
        this.isPausedState = false;
        this.emit('start', textToSpeak);
        if (onStart) onStart();
      };

      utterance.onend = () => {
        this.isSpeakingState = false;
        this.isPausedState = false;
        this.currentUtterance = null;
        this.emit('end');
        if (onEnd) onEnd();
      };

      utterance.onerror = (err) => {
        this.isSpeakingState = false;
        this.isPausedState = false;
        this.currentUtterance = null;
        this.emit('error', err);
        if (onError) onError(err);
      };

      this.currentUtterance = utterance;
      this.synth.speak(utterance);
      return true;
    } catch (e) {
      console.warn('[VoiceService] Speech synthesis error:', e);
      return false;
    }
  }

  pause() {
    if (this.synth && this.isSpeakingState && !this.isPausedState) {
      this.synth.pause();
      this.isPausedState = true;
      this.emit('pause');
    }
  }

  resume() {
    if (this.synth && this.isPausedState) {
      this.synth.resume();
      this.isPausedState = false;
      this.emit('resume');
    }
  }

  cancel() {
    if (this.synth) {
      try {
        this.synth.cancel();
      } catch (e) {}
    }
    this.isSpeakingState = false;
    this.isPausedState = false;
    this.currentUtterance = null;
    this.emit('end');
  }

  isSpeaking() {
    return this.isSpeakingState;
  }

  isPaused() {
    return this.isPausedState;
  }
}

export const speechSynthesizer = new SpeechSynthesizerService();

/**
 * Checks microphone permission status safely without unexpected browser popups
 */
export async function checkMicrophonePermission() {
  if (typeof navigator === 'undefined' || !navigator.permissions || !navigator.permissions.query) {
    return 'unknown';
  }
  try {
    const res = await navigator.permissions.query({ name: 'microphone' });
    return res.state; // 'granted' | 'denied' | 'prompt'
  } catch (e) {
    return 'unknown';
  }
}
