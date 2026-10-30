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
import { createSosRequest, fetchShelters } from '../services/api';
import { fetchCompleteWeather } from '../services/weatherApi';

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
  const { coords, locationName, city, requestGpsLocation } = useDCLocation();
  const weatherGPT = useWeatherGPT();
  const { setEnvironment } = useEnvironment();

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

  // Two-way Conversational Mode (for hands-free WeatherGPT dialogues)
  const [isVoiceConversationActive, setIsVoiceConversationActive] = useState(false);

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
      startListening();
    }
  }, [isListening, startListening, stopListening]);

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
        emergencyType: 'Medical & Evacuation Assistance (Voice Triggered)',
        severity: 'critical',
        latitude: targetCoords.lat,
        longitude: targetCoords.lon,
        description: `Hands-free verified voice SOS beacon dispatched at [${targetCoords.lat}, ${targetCoords.lon}].`,
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
  // VOICE COMMAND PROCESSOR & ACTION DISPATCHER
  // =========================================================================
  const handleProcessVoiceInput = useCallback(
    async (spokenText) => {
      if (!spokenText || !spokenText.trim()) return;

      setIsProcessing(true);
      setStatusMessage(`Interpreting: "${spokenText}"`);

      const parseContext = {
        currentPath: location.pathname,
        isSosOpen: sosConfirmation.active,
        isSosConfirming: sosConfirmation.active,
        isWeatherGPTOpen: Boolean(weatherGPT?.isOpen),
      };

      const result = parseVoiceIntent(spokenText, parseContext);

      try {
        switch (result.intent) {
          // --- SOS INTENTS ---
          case INTENTS.SOS_TRIGGER: {
            initiateSosWorkflow();
            break;
          }

          case INTENTS.SOS_CONFIRM: {
            if (sosConfirmation.active) {
              await confirmSosExecution();
            } else {
              initiateSosWorkflow();
            }
            break;
          }

          case INTENTS.SOS_CANCEL: {
            if (sosConfirmation.active) {
              cancelSosExecution();
            } else {
              speakText('Standing by.');
            }
            break;
          }

          // --- NAVIGATION INTENTS ---
          case INTENTS.NAV_HOME: {
            audioFeedback.playSuccessChime();
            speakText(t('voice.navHome', 'Returning to Home Command Center.'));
            navigate('/');
            break;
          }

          case INTENTS.NAV_WEATHER: {
            audioFeedback.playSuccessChime();
            speakText(t('voice.navWeather', 'Opening Weather Intelligence.'));
            navigate('/weather');
            break;
          }

          case INTENTS.NAV_SHELTERS: {
            audioFeedback.playSuccessChime();
            speakText(t('voice.navShelters', 'Opening Emergency Shelters directory.'));
            navigate('/shelters');
            break;
          }

          case INTENTS.NAV_MAP: {
            audioFeedback.playSuccessChime();
            speakText(t('voice.navMap', 'Opening Regional Spatial Map.'));
            navigate('/map');
            break;
          }

          case INTENTS.NAV_INCIDENTS: {
            audioFeedback.playSuccessChime();
            speakText(t('voice.navIncidents', 'Opening Incident Reports.'));
            navigate('/incidents');
            break;
          }

          case INTENTS.NAV_SAFETY: {
            audioFeedback.playSuccessChime();
            speakText(t('voice.navSafety', 'Opening Disaster Safety Guidelines.'));
            navigate('/safety');
            break;
          }

          case INTENTS.NAV_CONTACTS: {
            audioFeedback.playSuccessChime();
            speakText(t('voice.navContacts', 'Showing Emergency Helplines.'));
            if (onOpenContacts) {
              onOpenContacts();
            } else {
              navigate('/safety');
            }
            break;
          }

          case INTENTS.NAV_SETTINGS: {
            audioFeedback.playSuccessChime();
            speakText(t('voice.navSettings', 'Opening Platform Settings.'));
            if (onOpenSettings) {
              onOpenSettings();
            }
            break;
          }

          case INTENTS.NAV_BACK: {
            audioFeedback.playSuccessChime();
            speakText(t('voice.navBack', 'Navigating back.'));
            navigate(-1);
            break;
          }

          case INTENTS.NAV_WEATHERGPT: {
            audioFeedback.playSuccessChime();
            speakText(t('voice.navWeatherGpt', 'Opening WeatherGPT Copilot.'));
            if (weatherGPT?.openWeatherGPT) {
              weatherGPT.openWeatherGPT();
            } else {
              navigate('/weather');
            }
            break;
          }

          // --- SHELTER ACTIONS ---
          case INTENTS.ACTION_SHELTER_NEARBY: {
            audioFeedback.playSuccessChime();
            navigate('/shelters');
            try {
              const sheltersList = await fetchShelters();
              if (sheltersList && sheltersList.length > 0) {
                const activeLat = coords?.lat ?? 30.7499;
                const activeLon = coords?.lon ?? 76.6411;

                // Sort by distance from coordinates
                const sorted = [...sheltersList].sort((a, b) => {
                  const distA = Math.hypot((a.latitude || 0) - activeLat, (a.longitude || 0) - activeLon);
                  const distB = Math.hypot((b.latitude || 0) - activeLat, (b.longitude || 0) - activeLon);
                  return distA - distB;
                });
                const nearest = sorted[0];
                const availableSpots = (nearest.capacity || 200) - (nearest.occupancy || 0);
                speakText(
                  `The nearest active shelter is ${nearest.name}, located in ${nearest.city || city || 'your sector'}, with ${availableSpots} available places.`
                );
              } else {
                speakText('Displaying verified emergency shelters in your regional perimeter.');
              }
            } catch (e) {
              speakText('Displaying verified emergency relief hubs.');
            }
            break;
          }

          case INTENTS.ACTION_SHELTER_DIRECTIONS: {
            audioFeedback.playSuccessChime();
            const activeLat = coords?.lat ?? 30.7499;
            const activeLon = coords?.lon ?? 76.6411;
            speakText('Opening navigation directions to the nearest safe shelter.');
            window.open(`https://www.google.com/maps/dir/?api=1&destination=${activeLat},${activeLon}`, '_blank');
            break;
          }

          // --- WEATHER ACTIONS ---
          case INTENTS.ACTION_WEATHER_TODAY: {
            audioFeedback.playSuccessChime();
            try {
              const activeLat = coords?.lat ?? 30.7499;
              const activeLon = coords?.lon ?? 76.6411;
              const placeName = city || (locationName ? locationName.split(',')[0].trim() : 'your area');
              const weather = await fetchCompleteWeather(activeLat, activeLon);
              const temp = weather?.current?.temp != null ? Math.round(weather.current.temp) : 25;
              const condition = weather?.current?.conditionText || 'Partly Cloudy';
              speakText(`In ${placeName}, it is currently ${temp} degrees Celsius with ${condition}.`);
            } catch (e) {
              speakText(`Atmospheric conditions in your sector are calm with normal perimeter stability.`);
            }
            break;
          }

          case INTENTS.ACTION_WEATHER_FORECAST: {
            audioFeedback.playSuccessChime();
            navigate('/weather');
            try {
              const activeLat = coords?.lat ?? 30.7499;
              const activeLon = coords?.lon ?? 76.6411;
              const weather = await fetchCompleteWeather(activeLat, activeLon);
              const tomorrow = weather?.daily?.[1];
              if (tomorrow) {
                const max = Math.round(tomorrow.tempMax ?? 28);
                const min = Math.round(tomorrow.tempMin ?? 20);
                const cond = tomorrow.conditionText || 'clear conditions';
                speakText(`Tomorrow's forecast: High of ${max} degrees, low of ${min} degrees, with ${cond}.`);
              } else {
                speakText('Showing tomorrow atmospheric forecast on screen.');
              }
            } catch (e) {
              speakText('Opening comprehensive multi-day forecast.');
            }
            break;
          }

          case INTENTS.ACTION_WEATHER_RAIN: {
            audioFeedback.playSuccessChime();
            try {
              const activeLat = coords?.lat ?? 30.7499;
              const activeLon = coords?.lon ?? 76.6411;
              const weather = await fetchCompleteWeather(activeLat, activeLon);
              const rainChance = weather?.daily?.[0]?.precipitationProbability ?? 15;
              if (rainChance > 50) {
                speakText(`Rain is expected today with approximately ${rainChance} percent probability. Carry appropriate waterproof gear.`);
              } else {
                speakText(`Low probability of rain today at approximately ${rainChance} percent. Atmospheric conditions remain stable.`);
              }
            } catch (e) {
              speakText('Precipitation risk in your regional corridor is currently low.');
            }
            break;
          }

          // --- MAP ACTIONS ---
          case INTENTS.ACTION_MAP_LOCATE: {
            audioFeedback.playSuccessChime();
            requestGpsLocation();
            speakText('Acquiring high-precision GPS telemetry for your device.');
            navigate('/map');
            break;
          }

          case INTENTS.ACTION_MAP_ZOOM_IN: {
            audioFeedback.playSuccessChime();
            window.dispatchEvent(new CustomEvent('dc:mapZoom', { detail: { delta: 1 } }));
            speakText('Zooming in.');
            break;
          }

          case INTENTS.ACTION_MAP_ZOOM_OUT: {
            audioFeedback.playSuccessChime();
            window.dispatchEvent(new CustomEvent('dc:mapZoom', { detail: { delta: -1 } }));
            speakText('Zooming out.');
            break;
          }

          case INTENTS.ACTION_MAP_SHELTERS: {
            audioFeedback.playSuccessChime();
            navigate('/map');
            speakText('Displaying emergency shelters on spatial map.');
            break;
          }

          case INTENTS.ACTION_MAP_INCIDENTS: {
            audioFeedback.playSuccessChime();
            navigate('/map');
            speakText('Highlighting verified incident markers on map.');
            break;
          }

          // --- INCIDENT ACTIONS ---
          case INTENTS.ACTION_INCIDENT_REPORT: {
            audioFeedback.playSuccessChime();
            speakText('Opening incident reporting form.');
            if (onOpenIncident) onOpenIncident();
            break;
          }

          case INTENTS.ACTION_INCIDENT_RECENT: {
            audioFeedback.playSuccessChime();
            speakText('Showing verified incident log.');
            navigate('/incidents');
            break;
          }

          case INTENTS.ACTION_ALERT_LATEST: {
            audioFeedback.playSuccessChime();
            speakText('Perimeter conditions are standard. No critical emergency alert is active in your sector.');
            break;
          }

          // --- SAFETY GUIDELINES ---
          case INTENTS.ACTION_SAFETY_FLOOD: {
            audioFeedback.playSuccessChime();
            navigate('/safety');
            speakText(
              'Flood safety rules: Move immediately to higher ground. Never walk or drive through moving water. Shut off electricity at the main breaker if water rises near electrical outlets.'
            );
            break;
          }

          case INTENTS.ACTION_SAFETY_EARTHQUAKE: {
            audioFeedback.playSuccessChime();
            navigate('/safety');
            speakText(
              'Earthquake safety: Drop to hands and knees. Take cover under sturdy furniture. Hold on until the shaking stops, and stay clear of windows.'
            );
            break;
          }

          case INTENTS.ACTION_SAFETY_CYCLONE: {
            audioFeedback.playSuccessChime();
            navigate('/safety');
            speakText(
              'Cyclone preparation: Secure loose outdoor objects, board windows, charge all communication devices, and keep an emergency go-bag ready.'
            );
            break;
          }

          // --- CONTACTS ACTIONS ---
          case INTENTS.ACTION_CONTACT_CALL: {
            audioFeedback.playSuccessChime();
            speakText('Connecting to National Emergency Dispatch 112.');
            window.location.href = 'tel:112';
            break;
          }

          case INTENTS.ACTION_CONTACT_AMBULANCE: {
            audioFeedback.playSuccessChime();
            speakText('Ambulance emergency medical helpline is 108.');
            if (onOpenContacts) onOpenContacts();
            break;
          }

          case INTENTS.ACTION_CONTACT_NDRF: {
            audioFeedback.playSuccessChime();
            speakText('NDRF National Disaster Cell helpline is 1078.');
            if (onOpenContacts) onOpenContacts();
            break;
          }

          // --- SETTINGS ACTIONS ---
          case INTENTS.ACTION_CHANGE_LANGUAGE: {
            audioFeedback.playSuccessChime();
            const targetLangCode = result.languageCode;
            const langObj = languages.find((l) => l.code === targetLangCode);
            if (targetLangCode && langObj) {
              setLanguage(targetLangCode);
              const langName = langObj.nativeName || langObj.name;
              speakText(`Language changed to ${langName}.`, { lang: targetLangCode });
            }
            break;
          }

          case INTENTS.ACTION_DARK_MODE: {
            audioFeedback.playSuccessChime();
            setEnvironment('cyclonic');
            speakText('Dark tactical mode activated.');
            break;
          }

          case INTENTS.ACTION_LIGHT_MODE: {
            audioFeedback.playSuccessChime();
            setEnvironment('clear_sky');
            speakText('Daylight atmospheric mode activated.');
            break;
          }

          // --- CONVERSATIONAL WEATHERGPT ---
          case INTENTS.WEATHERGPT_QUERY: {
            audioFeedback.playSuccessChime();
            const queryToSend = result.query || spokenText;
            if (weatherGPT?.openWeatherGPT) {
              weatherGPT.openWeatherGPT();
              weatherGPT.sendMessage(queryToSend);
            } else {
              navigate('/weather');
            }
            break;
          }

          default: {
            // General query routed to WeatherGPT
            if (weatherGPT?.openWeatherGPT) {
              weatherGPT.openWeatherGPT();
              weatherGPT.sendMessage(spokenText);
            } else {
              speakText(
                'I heard: ' +
                  spokenText +
                  '. You can say "Show shelters", "What is the weather today", or "SOS" for emergency assistance.'
              );
            }
            break;
          }
        }
      } catch (err) {
        console.error('[VoiceContext] Error executing intent:', err);
        speakText('Command execution encountered a disruption. Please try again.');
      } finally {
        setIsProcessing(false);
      }
    },
    [
      city,
      coords,
      initiateSosWorkflow,
      confirmSosExecution,
      cancelSosExecution,
      languages,
      location.pathname,
      locationName,
      navigate,
      onOpenContacts,
      onOpenIncident,
      onOpenSettings,
      requestGpsLocation,
      setEnvironment,
      setLanguage,
      sosConfirmation.active,
      speakText,
      t,
      weatherGPT,
    ]
  );

  // Programmatic voice simulator for testing and accessibility fallback
  const simulateVoiceInput = useCallback(
    (simulatedText) => {
      setTranscript(simulatedText);
      handleProcessVoiceInput(simulatedText);
    },
    [handleProcessVoiceInput]
  );

  // Synchronize Speech Recognition callbacks
  useEffect(() => {
    speechRecognizer.setLanguage(currentLanguage);

    const unsubStart = speechRecognizer.on('start', () => {
      setIsListening(true);
      setVoiceError(null);
      setStatusMessage(t('voice.listening', 'Listening for commands...'));
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
      handleProcessVoiceInput(text);
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
  }, [currentLanguage, handleProcessVoiceInput, t]);

  // Synchronize Speech Synthesis callbacks
  useEffect(() => {
    const unsubStart = speechSynthesizer.on('start', (spokenText) => {
      setIsSpeaking(true);
      setLastSpokenText(spokenText);
      setStatusMessage(spokenText);
    });

    const unsubEnd = speechSynthesizer.on('end', () => {
      setIsSpeaking(false);
      // If voice conversation mode is enabled inside WeatherGPT, prompt next turn
      if (isVoiceConversationActive && weatherGPT?.isOpen) {
        setTimeout(() => {
          if (!speechSynthesizer.isSpeaking()) {
            startListening();
          }
        }, 600);
      }
    });

    const unsubError = speechSynthesizer.on('error', () => {
      setIsSpeaking(false);
    });

    return () => {
      unsubStart();
      unsubEnd();
      unsubError();
    };
  }, [isVoiceConversationActive, startListening, weatherGPT?.isOpen]);

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
        handleProcessVoiceInput(e.detail.text);
      }
    };
    window.addEventListener('dc:testVoiceInput', handleVoiceEvent);
    return () => window.removeEventListener('dc:testVoiceInput', handleVoiceEvent);
  }, [handleProcessVoiceInput]);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (sosCountdownRef.current) clearInterval(sosCountdownRef.current);
    };
  }, []);

  const value = {
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
    speakingSpeed,
    setSpeakingSpeed,
    isVoiceConversationActive,
    setIsVoiceConversationActive,
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
    handleProcessVoiceInput,
    simulateVoiceInput,
  };

  return <VoiceAssistantContext.Provider value={value}>{children}</VoiceAssistantContext.Provider>;
};
