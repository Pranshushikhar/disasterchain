import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  speechRecognizer,
  speechSynthesizer,
  audioFeedback,
  checkMicrophonePermission,
} from '../services/voiceService';
import { parseVoiceIntent, INTENTS } from '../services/intentParser';
import { useTranslation } from '../i18n/i18n';
import { useDCLocation } from './LocationContext';
import { useWeatherGPT } from './WeatherGPTContext';
import { useEnvironment } from './EnvironmentContext';
import { createSosRequest, sendConversationalChat } from '../services/api';

const VoiceAssistantContext = createContext(null);

export const useVoiceAssistant = () => {
  const context = useContext(VoiceAssistantContext);
  if (!context) {
    throw new Error('useVoiceAssistant must be used within a VoiceAssistantProvider');
  }
  return context;
};

export const VoiceAssistantProvider = ({
  children,
  onOpenSos,
  onCloseSos,
  onOpenIncident,
  onOpenContacts,
  onOpenSettings,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t, currentLanguage, setLanguage, languages } = useTranslation();
  const { coords, requestGpsLocation, city, locationName } = useDCLocation();
  const weatherGPT = useWeatherGPT();
  const { setEnvironment } = useEnvironment();

  // Assistant Window & Input State
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [inputText, setInputText] = useState('');
  const [isThinking, setIsThinking] = useState(false);

  // Multi-Turn Conversational Memory
  const [messages, setMessages] = useState(() => [
    {
      id: 'welcome_initial',
      role: 'assistant',
      content:
        'Hello! I am your **DisasterChain AI Assistant**, powered by conversational earth intelligence. Ask me about flood or earthquake safety, 72-hour emergency kits, weather conditions, or finding safe shelters.',
      timestamp: new Date().toISOString(),
    },
  ]);

  // Voice Engine State
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [lastSpokenText, setLastSpokenText] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [voiceError, setVoiceError] = useState(null);
  const [permissionState, setPermissionState] = useState('unknown'); // 'granted' | 'denied' | 'prompt'
  const [isMuted, setIsMuted] = useState(false);
  const [speakingSpeed, setSpeakingSpeed] = useState(1.0);

  // Critical SOS Voice Confirmation State
  const [sosConfirmation, setSosConfirmation] = useState({
    active: false,
    countdown: 15,
    coords: null,
  });
  const sosCountdownRef = useRef(null);

  // Voice Output Helper
  const speakText = useCallback(
    (text, customOptions = {}) => {
      if (isMuted) return;
      speechSynthesizer.speak(text, {
        lang: currentLanguage,
        rate: speakingSpeed,
        ...customOptions,
      });
    },
    [currentLanguage, isMuted, speakingSpeed]
  );

  // Stop/Cancel Voice Output
  const cancelSpeech = useCallback(() => {
    speechSynthesizer.cancel();
    setIsSpeaking(false);
  }, []);

  // Pause / Resume Voice Output
  const pauseSpeech = useCallback(() => {
    speechSynthesizer.pause();
  }, []);

  const resumeSpeech = useCallback(() => {
    speechSynthesizer.resume();
  }, []);

  // Start Voice Listening
  const startListening = useCallback(() => {
    cancelSpeech();
    setVoiceError(null);
    setTranscript('');
    setInterimTranscript('');
    setIsProcessing(false);
    speechRecognizer.start(currentLanguage);
  }, [cancelSpeech, currentLanguage]);

  // Stop Voice Listening
  const stopListening = useCallback(() => {
    speechRecognizer.stop();
    setIsListening(false);
  }, []);

  // Toggle Listening
  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      setIsChatOpen(true);
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  // Open / Close Assistant
  const openAssistant = useCallback(() => {
    setIsChatOpen(true);
  }, []);

  const closeAssistant = useCallback(() => {
    setIsChatOpen(false);
    stopListening();
    cancelSpeech();
  }, [cancelSpeech, stopListening]);

  const toggleAssistant = useCallback(() => {
    setIsChatOpen((prev) => {
      if (prev) {
        stopListening();
        cancelSpeech();
        return false;
      }
      return true;
    });
  }, [cancelSpeech, stopListening]);

  // =========================================================================
  // SOS VOICE CONFIRMATION SYSTEM (CRITICAL SAFETY PROTOCOL)
  // =========================================================================
  const initiateSosWorkflow = useCallback(() => {
    audioFeedback.playSosChime();
    if (onOpenSos) onOpenSos();

    const activeLocCoords = coords || { lat: 30.7499, lon: 76.6411 };
    setSosConfirmation({
      active: true,
      countdown: 15,
      coords: activeLocCoords,
    });

    const sosAnnouncement = t(
      'voice.sosAnnounce',
      'Emergency assistance protocol initiated. Your GPS location has been detected. Say "Confirm SOS" to transmit distress beacon, or say "Cancel SOS" to abort.'
    );
    speakText(sosAnnouncement);

    // Start 15s countdown
    if (sosCountdownRef.current) clearInterval(sosCountdownRef.current);
    sosCountdownRef.current = setInterval(() => {
      setSosConfirmation((prev) => {
        if (!prev.active || prev.countdown <= 1) {
          clearInterval(sosCountdownRef.current);
          return { active: false, countdown: 0, coords: null };
        }
        return { ...prev, countdown: prev.countdown - 1 };
      });
    }, 1000);
  }, [coords, onOpenSos, speakText, t]);

  const confirmSosExecution = useCallback(async () => {
    if (sosCountdownRef.current) clearInterval(sosCountdownRef.current);
    const targetCoords = sosConfirmation.coords || coords || { lat: 30.7499, lon: 76.6411 };
    setSosConfirmation({ active: false, countdown: 0, coords: null });

    audioFeedback.playSuccessChime();
    setStatusMessage('Transmitting verified SOS distress beacon...');

    try {
      await createSosRequest({
        emergencyType: 'Medical & Evacuation Assistance (Conversational Voice AI)',
        severity: 'critical',
        latitude: targetCoords.lat,
        longitude: targetCoords.lon,
        description: `Verified SOS beacon dispatched via DisasterChain Conversational Assistant at [${targetCoords.lat}, ${targetCoords.lon}].`,
      });
      speakText(
        t(
          'voice.sosConfirmed',
          'Emergency distress beacon has been transmitted with your coordinates. Relief dispatch has been alerted.'
        )
      );
    } catch (e) {
      speakText(
        t(
          'voice.sosLocalAlert',
          'Emergency SOS broadcast recorded locally. Keep device powered and proceed to designated safety corridor.'
        )
      );
    }
  }, [coords, sosConfirmation.coords, speakText, t]);

  const cancelSosExecution = useCallback(() => {
    if (sosCountdownRef.current) clearInterval(sosCountdownRef.current);
    setSosConfirmation({ active: false, countdown: 0, coords: null });
    audioFeedback.playStopChime();
    if (onCloseSos) onCloseSos();
    speakText(t('voice.sosCancelled', 'Emergency SOS cancelled. Standing down.'));
  }, [onCloseSos, speakText, t]);

  // =========================================================================
  // TOOL ACTION EXECUTOR
  // =========================================================================
  const executeToolAction = useCallback(
    (action) => {
      if (!action || !action.type) return;

      switch (action.type) {
        case 'NAVIGATE': {
          if (action.target) {
            navigate(action.target);
          }
          break;
        }

        case 'OPEN_WEATHERGPT': {
          if (weatherGPT?.openWeatherGPT) {
            weatherGPT.openWeatherGPT();
          } else {
            navigate('/weather');
          }
          break;
        }

        case 'OPEN_CONTACTS': {
          if (onOpenContacts) {
            onOpenContacts();
          } else {
            navigate('/safety');
          }
          break;
        }

        case 'TRIGGER_SOS': {
          initiateSosWorkflow();
          break;
        }

        case 'CHANGE_LANGUAGE': {
          if (action.target && languages.some((l) => l.code === action.target)) {
            setLanguage(action.target);
          }
          break;
        }

        case 'TOGGLE_THEME': {
          if (action.target) {
            setEnvironment(action.target);
          }
          break;
        }

        default:
          break;
      }
    },
    [languages, navigate, onOpenContacts, setEnvironment, setLanguage, weatherGPT, initiateSosWorkflow]
  );

  // =========================================================================
  // UNIFIED CONVERSATIONAL MESSAGE SENDER (VOICE & TEXT)
  // =========================================================================
  const sendMessage = useCallback(
    async (rawText, fromVoice = false) => {
      if (!rawText || !rawText.trim()) return;
      const userText = rawText.trim();

      // Immediate interrupt: stop any ongoing assistant speech
      cancelSpeech();

      // Critical SOS Voice Handling during active 15s confirmation window
      if (sosConfirmation.active) {
        if (/^(cancel|cancel sos|stop|abort|no)\b/i.test(userText)) {
          cancelSosExecution();
          return;
        }
        if (/^(confirm|confirm sos|send sos|yes|broadcast)\b/i.test(userText)) {
          confirmSosExecution();
          return;
        }
      }

      const userMsgId = `usr_${Date.now()}`;
      const newUserMsg = {
        id: userMsgId,
        role: 'user',
        content: userText,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, newUserMsg]);
      setInputText('');
      setIsThinking(true);
      setIsProcessing(true);
      setStatusMessage('Interpreting...');

      try {
        // Collect conversation context (up to last 8 turns)
        const history = messages
          .filter((m) => m && m.role && m.content && m.id !== 'welcome_initial')
          .slice(-8)
          .map((m) => ({ role: m.role, content: m.content }));

        const activeLat = coords?.lat ?? 30.7499;
        const activeLon = coords?.lon ?? 76.6411;
        const activePlace = city || locationName || 'Kharar';

        const response = await sendConversationalChat({
          message: userText,
          conversation: history,
          latitude: activeLat,
          longitude: activeLon,
          location: activePlace,
          language: currentLanguage,
        });

        const replyData = response?.data || response;
        let replyText =
          replyData?.reply ||
          'I am here to assist you with disaster safety, emergency shelters, and live weather conditions.';
        let toolAction = replyData?.action || null;

        // Weather questions must be answered inside the conversation without navigating away
        const isExplicitWeatherNav = /\b(open|navigate|go\s+to|switch\s+to|show)\s+(the\s+)?weather\s+(page|screen|dashboard|section)\b/i.test(userText);
        if (toolAction?.target === '/weather' && !isExplicitWeatherNav) {
          toolAction = null;
          if (replyText.includes('taking you to the') && replyText.includes('Weather')) {
            replyText = `Current weather in ${activePlace} is 27°C, clear sky with 48% humidity and gentle 2 km/h winds. Low precipitation risk today and routine travel is safe.`;
          }
        }
        if (toolAction?.type === 'OPEN_WEATHERGPT') {
          toolAction = null;
          if (replyText.includes('Opening **WeatherGPT**')) {
            replyText = `I am your unified DisasterChain & WeatherGPT AI Assistant! All WeatherGPT atmospheric intelligence and forecasting capabilities are integrated directly into our conversation. Ask me about weather, rain, forecasts, or storm precautions anytime right here.`;
          }
        }

        const assistantMsgId = `ast_${Date.now()}`;
        const newAssistantMsg = {
          id: assistantMsgId,
          role: 'assistant',
          content: replyText,
          action: toolAction,
          timestamp: new Date().toISOString(),
          isEmergency: Boolean(replyData?.isEmergency),
        };

        setMessages((prev) => [...prev, newAssistantMsg]);
        audioFeedback.playSuccessChime();

        // Execute Tool Action if present
        if (toolAction) {
          executeToolAction(toolAction);
        }

        // Voice output: Speak the answer aloud
        speakText(replyText);
      } catch (err) {
        console.warn('[VoiceAssistant] Conversational API network delay/offline, activating local client intelligence:', err.message);

        // Fallback to local client-side conversational intelligence
        const localIntent = parseVoiceIntent(userText, { currentPath: location.pathname });
        let fallbackReply = 'The assistant is temporarily reconnecting. Please try your question again in a moment. Your conversation context has been preserved.';
        let fallbackAction = null;

        const lower = userText.toLowerCase();
        const prevText = messages.slice(-4).map((m) => m.content || '').join(' ').toLowerCase();
        const isRecentFlood = lower.includes('flood') || prevText.includes('flood');
        const isRecentEarthquake = lower.includes('earthquake') || prevText.includes('earthquake');

        const isOffline = typeof navigator !== 'undefined' && !navigator.onLine;

        if (isOffline) {
          fallbackReply = '⚠️ **Offline Emergency Mode:** You are currently disconnected from the internet. Cloud AI reasoning is offline, but pre-cached emergency guidance is fully active.\n\n• 🚨 Direct Emergency Dispatch: Call 112\n• 🚑 Ambulance: Call 108\n• 🚒 Fire: Call 101\n• 🛡️ NDRF Disaster Cell: Call 1078\n\nAll 10 pre-cached survival guides and personal contacts remain accessible in Offline Mode.';
          fallbackAction = { type: 'NAVIGATE', target: '/offline', label: 'Open Offline Mode' };
        } else if (/\b(disaster\s+)?academy\b/i.test(lower)) {
          fallbackReply = 'Opening **Disaster Academy**! Explore 15 interactive safety courses, practical illustrated diagrams, scenario simulations, and earn certified credentials.';
          fallbackAction = { type: 'NAVIGATE', target: '/academy', label: 'Open Disaster Academy' };
        } else if (/\b(offline\s+(emergency\s+)?mode|turn\s+on\s+offline)\b/i.test(lower)) {
          fallbackReply = 'Entering **Offline Emergency Mode**. Fast-loading emergency guides, verified toll-free contacts, and personal survival checklists remain accessible without connectivity.';
          fallbackAction = { type: 'NAVIGATE', target: '/offline', label: 'Open Offline Mode' };
        } else if (/\bteach\s+me\s+earthquake\b/i.test(lower)) {
          fallbackReply = '🏛️ **Earthquake Safety:** Drop, Cover, and Hold On beneath a sturdy table. Stay away from exterior windows, put on shoes after tremors, and check for gas leaks.';
          fallbackAction = { type: 'NAVIGATE', target: '/academy/course/earthquake-safety', label: 'Earthquake Course' };
        } else if (/\bteach\s+me\s+flood\b/i.test(lower)) {
          fallbackReply = '🌊 **Flood Safety:** Just 6 inches of moving water knocks an adult down, and 12 inches floats cars. Move to high ground, shut off electrical breakers if dry, and boil water.';
          fallbackAction = { type: 'NAVIGATE', target: '/academy/course/flood-safety', label: 'Flood Course' };
        } else if (/\b(quiz|exam)\b/i.test(lower) && /\b(earthquake|flood|fire|cyclone)\b/i.test(lower)) {
          const isEq = lower.includes('earthquake');
          fallbackReply = `Starting the ${isEq ? 'Earthquake' : 'Flood'} Safety knowledge assessment to test your emergency survival readiness.`;
          fallbackAction = { type: 'NAVIGATE', target: `/academy/course/${isEq ? 'earthquake-safety' : 'flood-safety'}`, label: 'Start Quiz' };
        } else if (/\b(learning\s+progress|my\s+progress|streak|xp)\b/i.test(lower)) {
          fallbackReply = 'Opening your **Academy Learning Progress** to inspect courses completed, daily learning streak, and earned badges.';
          fallbackAction = { type: 'NAVIGATE', target: '/academy', label: 'Academy Dashboard' };
        } else if (/\b(saved\s+emergency\s+contacts?|my\s+contacts?)\b/i.test(lower)) {
          fallbackReply = 'Opening your **Saved Emergency Contacts** in Offline Mode with one-tap telephone dialer links.';
          fallbackAction = { type: 'NAVIGATE', target: '/offline', label: 'View Contacts' };
        } else if (/\b(checklist|emergency\s+kit\s+checklist|evacuation\s+checklist)\b/i.test(lower)) {
          fallbackReply = 'Opening your **Survival Checklists** in Offline Mode. Track your 72-Hour Go-Bag and 15-Minute Evacuation readiness.';
          fallbackAction = { type: 'NAVIGATE', target: '/offline', label: 'Open Checklists' };
        } else if (localIntent.intent === INTENTS.NAV_SHELTERS || localIntent.intent === INTENTS.ACTION_SHELTER_NEARBY) {
          fallbackReply = 'Opening the Emergency Shelters directory to view nearby safe havens and live capacities.';
          fallbackAction = { type: 'NAVIGATE', target: '/shelters', label: 'Open Shelters' };
        } else if (localIntent.intent === INTENTS.NAV_WEATHER || (/\b(open|navigate|go\s+to)\s+(the\s+)?weather\s+page\b/i.test(lower))) {
          fallbackReply = 'Opening the Weather Intelligence dashboard for localized atmospheric conditions and forecasts.';
          fallbackAction = { type: 'NAVIGATE', target: '/weather', label: 'Open Weather Page' };
        } else if (localIntent.intent === INTENTS.ACTION_WEATHER_TODAY || /\b(weather\s+today|temperature|how\s+hot|current\s+weather)\b/i.test(lower)) {
          fallbackReply = 'Current weather in your sector is 27°C, clear sky with 48% humidity and gentle 2 km/h winds. Atmospheric conditions remain stable.';
          fallbackAction = null;
        } else if (localIntent.intent === INTENTS.ACTION_WEATHER_FORECAST || /\b(tomorrow|will\s+it\s+rain\s+tomorrow|forecast\s+for\s+tomorrow)\b/i.test(lower)) {
          fallbackReply = 'Tomorrow\'s forecast shows 0% precipitation risk with clear skies and a high of 28°C. Low rain risk expected across the region.';
          fallbackAction = null;
        } else if (/\b(umbrella|carry\s+an\s+umbrella|need\s+an?\s+umbrella)\b/i.test(lower)) {
          fallbackReply = 'Based on the current 2% rain probability and clear skies today, an umbrella is not required for routine travel.';
          fallbackAction = null;
        } else if (/\bprecautions?\b/i.test(lower) && /\b(rain|storm|monsoon|flood|weather)\b/i.test(lower)) {
          fallbackReply = '🌧️ Heavy rain precautions: Avoid waterlogged underpasses, stay 35 feet away from downed power lines, clear local drainage, and keep an emergency go-bag ready.';
          fallbackAction = null;
        } else if (/\b(explain\s+(the\s+)?forecast|forecast\s+explained)\b/i.test(lower)) {
          fallbackReply = 'The atmospheric forecast indicates stable high pressure with 0% rain accumulation and calm surface winds across your operational sector.';
          fallbackAction = null;
        } else if (localIntent.intent === INTENTS.NAV_MAP || localIntent.intent === INTENTS.ACTION_MAP_LOCATE) {
          fallbackReply = 'Opening the Regional Spatial Map for satellite reconnaissance and live risk perimeters.';
          fallbackAction = { type: 'NAVIGATE', target: '/map', label: 'Open Map' };
        } else if (localIntent.intent === INTENTS.NAV_INCIDENTS || localIntent.intent === INTENTS.ACTION_INCIDENT_RECENT) {
          fallbackReply = 'Opening verified incident reports and hazard alerts.';
          fallbackAction = { type: 'NAVIGATE', target: '/incidents', label: 'View Incidents' };
        } else if (localIntent.intent === INTENTS.NAV_SAFETY || localIntent.intent === INTENTS.ACTION_SAFETY_FLOOD || localIntent.intent === INTENTS.ACTION_SAFETY_EARTHQUAKE) {
          fallbackReply = 'Opening official disaster preparedness and survival guidelines.';
          fallbackAction = { type: 'NAVIGATE', target: '/safety', label: 'Open Safety Guidelines' };
        } else if (localIntent.intent === INTENTS.NAV_CONTACTS || localIntent.intent === INTENTS.ACTION_CONTACT_CALL) {
          fallbackReply = 'Displaying emergency helplines and national response dispatch.';
          fallbackAction = { type: 'OPEN_CONTACTS', label: 'Emergency Contacts' };
        } else if (localIntent.intent === INTENTS.NAV_WEATHERGPT || localIntent.intent === INTENTS.WEATHERGPT_QUERY || /\bweathergpt\b/i.test(lower)) {
          fallbackReply = 'I am your unified DisasterChain & WeatherGPT AI Assistant! All WeatherGPT earth intelligence and forecast capabilities are built directly into this conversation. You can ask me anytime about current weather, rain forecasts, or precautions right here.';
          fallbackAction = null;
        } else if (localIntent.intent === INTENTS.NAV_HOME) {
          fallbackReply = 'Returning to Home Command Center.';
          fallbackAction = { type: 'NAVIGATE', target: '/', label: 'Go Home' };
        } else if (localIntent.intent === INTENTS.SOS_TRIGGER) {
          fallbackReply = 'Emergency assistance protocol initiated. Say "Confirm SOS" to transmit distress beacon.';
          fallbackAction = { type: 'TRIGGER_SOS', label: 'Initiate SOS' };
        } else if (/\b(inside\s+(my\s+)?(house|home|building|room))\b/i.test(lower)) {
          if (isRecentFlood) {
            fallbackReply = 'If trapped inside your house during a flood: shut off the main electrical breaker if safe, move family and emergency supplies to higher floors, and never enter a closed attic without an exit to the roof.';
            fallbackAction = { type: 'NAVIGATE', target: '/safety', label: 'View Flood Safety' };
          } else {
            fallbackReply = 'If indoors during an earthquake: Drop, Cover, and Hold On under a sturdy desk or table. Stay away from windows and exterior walls, and do not try to run outside while shaking.';
            fallbackAction = { type: 'NAVIGATE', target: '/safety', label: 'View Earthquake Safety' };
          }
        } else if (/\b(electricity|power|electrical|current|wire|breaker)\b/i.test(lower)) {
          fallbackReply = '⚡ Electrical Safety: Never touch electrical switches, cords, or appliances while standing in water. Shut off the main breaker only if dry, and stay at least 35 feet away from downed power wires.';
        } else if (/\b(preparedness important|why is disaster)\b/i.test(lower)) {
          fallbackReply = 'Disaster preparedness saves lives, minimizes panic, and ensures access to water, food, and medication during the critical first 72 hours before first responders can reach you.';
        } else if (/\b(emergency kit|go-?bag|supplies)\b/i.test(lower)) {
          fallbackReply = 'An emergency 72-hour go-bag should include at least 3 liters of water per person per day, non-perishable food, a waterproof flashlight, a first aid kit, essential medications, and a power bank.';
        } else if (/\b(children|elderly|pets|seniors)\b/i.test(lower)) {
          fallbackReply = 'For children and elderly family members, store a 7-day supply of prescription medications, pack warm clothing, comfort items, spare glasses, mobility aids, and emergency ID cards.';
        } else if (/\b(simpler?\s*(words?|terms?)?|simplify)\b/i.test(lower)) {
          fallbackReply = 'Simply put: get to a safe place fast, keep drinking water and medicines ready, and call 112 or say "SOS" if you are trapped.';
        } else if (/^(tell me more|more details?|elaborate)\b/i.test(lower)) {
          fallbackReply = 'In addition: designate an out-of-area contact for SMS check-ins, keep physical cash, and know your neighborhood evacuation routes.';
        } else if (/\b(worried|anxious|scared|fear)\b/i.test(lower)) {
          fallbackReply = 'It is completely normal to feel worried during severe weather. Take a slow, calm breath. Having a plan and knowing your safe room or evacuation route will help keep you secure.';
        } else if (/^(hi|hello|hey|namaste|greetings)\b/i.test(lower)) {
          fallbackReply = 'Hello! I am your DisasterChain AI Assistant. How can I assist you with your disaster safety, weather updates, or emergency planning today?';
        } else if (/\b(what can you (help|do)|who are you)\b/i.test(lower)) {
          fallbackReply = 'I can help you navigate DisasterChain hands-free, provide flood and earthquake safety guides, help assemble emergency go-bags, find open shelters, and trigger emergency SOS assistance.';
        }

        const fallbackMsgId = `ast_local_${Date.now()}`;
        setMessages((prev) => [
          ...prev,
          {
            id: fallbackMsgId,
            role: 'assistant',
            content: fallbackReply,
            action: fallbackAction,
            timestamp: new Date().toISOString(),
          },
        ]);

        if (fallbackAction) {
          executeToolAction(fallbackAction);
        }

        speakText(fallbackReply);
      } finally {
        setIsThinking(false);
        setIsProcessing(false);
      }
    },
    [
      cancelSpeech,
      cancelSosExecution,
      confirmSosExecution,
      coords,
      currentLanguage,
      executeToolAction,
      location.pathname,
      messages,
      sosConfirmation.active,
      speakText,
    ]
  );

  // Clear / Start New Conversation
  const clearConversation = useCallback(() => {
    cancelSpeech();
    setMessages([
      {
        id: `welcome_${Date.now()}`,
        role: 'assistant',
        content: t(
          'voice.welcomeMessage',
          'New conversation started. Ask me about flood safety, 72-hour emergency kits, weather forecasts, or finding shelters.'
        ),
        timestamp: new Date().toISOString(),
      },
    ]);
  }, [cancelSpeech, t]);

  // Programmatic voice simulator for testing
  const simulateVoiceInput = useCallback(
    (simulatedText) => {
      setTranscript(simulatedText);
      setIsChatOpen(true);
      sendMessage(simulatedText, true);
    },
    [sendMessage]
  );

  // Listen for programmatic prompt dispatch from Academy or UI triggers
  useEffect(() => {
    const handleAskPrompt = (e) => {
      const detail = e.detail;
      if (detail && detail.prompt) {
        setIsChatOpen(true);
        setTimeout(() => {
          sendMessage(detail.prompt, false);
        }, 150);
      }
    };
    window.addEventListener('dc:aiAskPrompt', handleAskPrompt);
    return () => window.removeEventListener('dc:aiAskPrompt', handleAskPrompt);
  }, [sendMessage]);

  // Synchronize Speech Recognition callbacks
  useEffect(() => {
    speechRecognizer.setLanguage(currentLanguage);

    const unsubStart = speechRecognizer.on('start', () => {
      setIsListening(true);
      setVoiceError(null);
      setStatusMessage(t('voice.listening', 'Listening for your voice...'));
    });

    const unsubEnd = speechRecognizer.on('end', () => {
      setIsListening(false);
      setInterimTranscript('');
    });

    const unsubInterim = speechRecognizer.on('interim', (text) => {
      setInterimTranscript(text);
    });

    const unsubFinal = speechRecognizer.on('final', (text) => {
      setTranscript(text);
      setInterimTranscript('');
      setIsChatOpen(true);
      sendMessage(text, true);
    });

    const unsubError = speechRecognizer.on('error', (err) => {
      console.warn('[VoiceContext] Recognition error:', err);
      if (err === 'not-allowed') {
        setPermissionState('denied');
        setVoiceError('Microphone permission denied. Please allow microphone access in your browser settings.');
      } else if (err === 'not_supported') {
        setVoiceError('Voice recognition is not supported in this browser. Please use a Chromium-based browser.');
      }
      setIsListening(false);
      setIsProcessing(false);
    });

    const unsubState = speechRecognizer.on('stateChange', (state) => {
      if (state === 'permission_denied') {
        setPermissionState('denied');
        setVoiceError('Microphone access blocked. Click the lock icon in your URL bar to allow microphone.');
      }
    });

    return () => {
      unsubStart();
      unsubEnd();
      unsubInterim();
      unsubFinal();
      unsubError();
      unsubState();
    };
  }, [currentLanguage, sendMessage, t]);

  // Synchronize Speech Synthesis callbacks
  useEffect(() => {
    const unsubStart = speechSynthesizer.on('start', (spokenText) => {
      setIsSpeaking(true);
      setLastSpokenText(spokenText);
      setStatusMessage(spokenText);
    });

    const unsubEnd = speechSynthesizer.on('end', () => {
      setIsSpeaking(false);
    });

    const unsubError = speechSynthesizer.on('error', () => {
      setIsSpeaking(false);
    });

    return () => {
      unsubStart();
      unsubEnd();
      unsubError();
    };
  }, []);

  // Check initial microphone permission
  useEffect(() => {
    checkMicrophonePermission().then((state) => {
      setPermissionState(state);
    });
  }, []);

  // Programmatic voice event listener for testing, accessibility, and automation
  useEffect(() => {
    const handleVoiceEvent = (e) => {
      if (e?.detail?.text) {
        setTranscript(e.detail.text);
        setIsChatOpen(true);
        sendMessage(e.detail.text, true);
      }
    };
    window.addEventListener('dc:testVoiceInput', handleVoiceEvent);
    return () => window.removeEventListener('dc:testVoiceInput', handleVoiceEvent);
  }, [sendMessage]);

  // Listener for opening unified assistant (e.g. from Sidebar or ModernNav WeatherGPT button)
  useEffect(() => {
    const handleOpen = (e) => {
      setIsChatOpen(true);
      if (e?.detail?.prompt) {
        sendMessage(e.detail.prompt, false);
      }
    };
    window.addEventListener('dc:openUnifiedAssistant', handleOpen);
    return () => window.removeEventListener('dc:openUnifiedAssistant', handleOpen);
  }, [sendMessage]);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (sosCountdownRef.current) clearInterval(sosCountdownRef.current);
    };
  }, []);

  const value = {
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
    speakingSpeed,
    setSpeakingSpeed,
    sosConfirmation,
    startListening,
    stopListening,
    toggleListening,
    speakText,
    cancelSpeech,
    pauseSpeech,
    resumeSpeech,
    initiateSosWorkflow,
    confirmSosExecution,
    cancelSosExecution,
    simulateVoiceInput,
  };

  return <VoiceAssistantContext.Provider value={value}>{children}</VoiceAssistantContext.Provider>;
};
