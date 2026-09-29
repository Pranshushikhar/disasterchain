import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { sendWeatherGPTChat } from '../services/api';
import { reverseGeocode } from '../services/weatherApi';

const WeatherGPTContext = createContext(null);

export const useWeatherGPT = () => {
  const context = useContext(WeatherGPTContext);
  if (!context) {
    throw new Error('useWeatherGPT must be used within a WeatherGPTProvider');
  }
  return context;
};

export const WeatherGPTProvider = ({ children }) => {
  const location = useLocation();

  // Assistant Window State (Persistent across navigation)
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  // Conversation State
  const [conversationId, setConversationId] = useState(() => `wgpt_${Date.now()}`);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [inputText, setInputText] = useState('');

  // Geolocation & Station Telemetry
  const [locationCoordinates, setLocationCoordinates] = useState({
    latitude: 30.7333,
    longitude: 76.7794,
  });
  const [locationName, setLocationName] = useState({
    displayName: 'Chandigarh Operations Center',
    city: 'Chandigarh',
    state: 'Punjab',
    country: 'India',
    isResolving: false,
  });

  // Background Geolocation Bootstrap
  useEffect(() => {
    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const lat = Number(pos.coords.latitude.toFixed(4));
          const lon = Number(pos.coords.longitude.toFixed(4));
          setLocationCoordinates({ latitude: lat, longitude: lon });
          setLocationName((prev) => ({ ...prev, isResolving: true }));
          try {
            const rev = await reverseGeocode(lat, lon);
            const resolved = rev?.displayName || rev?.city || `${lat.toFixed(2)}°N, ${lon.toFixed(2)}°E`;
            setLocationName({
              displayName: resolved,
              city: rev?.city || resolved,
              state: rev?.region || rev?.state || '',
              country: rev?.country || '',
              isResolving: false,
            });
          } catch (e) {
            setLocationName((prev) => ({ ...prev, isResolving: false }));
          }
        },
        () => {
          // Graceful fallback to default station coordinates
        },
        { timeout: 7000, enableHighAccuracy: false }
      );
    }
  }, []);

  // Screen Context Awareness (Dynamically adapts to current route without breaking chat)
  const currentScreenContext = useMemo(() => {
    const path = location.pathname;
    if (path === '/' || path === '/dashboard') {
      return {
        id: 'SITUATION',
        label: 'SITUATION ROOM',
        sub: 'Multi-hazard operational overview',
        promptHint: 'Ask about overall threat level, active hazards, or tactical priority...',
      };
    }
    if (path === '/weather') {
      return {
        id: 'WEATHER',
        label: 'ATMOSPHERIC INTELLIGENCE',
        sub: 'Local telemetry & cyclonic monitoring',
        promptHint: 'Ask about rainfall forecast, wind velocity, or cyclonic risk...',
      };
    }
    if (path === '/map' || path === '/affected-areas') {
      return {
        id: 'MAP',
        label: 'SPATIAL RECONNAISSANCE',
        sub: 'Satellite overlays & danger perimeters',
        promptHint: 'Ask about risk zones on the map, safe corridors, or terrain...',
      };
    }
    if (path === '/alerts') {
      return {
        id: 'ALERTS',
        label: 'ACTIVE ALERTS',
        sub: 'Emergency broadcast & CAP bulletins',
        promptHint: 'Ask for clarification on current warning bulletins and severity...',
      };
    }
    if (path === '/shelters') {
      return {
        id: 'SHELTERS',
        label: 'SHELTER NETWORK',
        sub: 'Evacuation hubs & supply logistics',
        promptHint: 'Ask for nearest open shelter with space or available amenities...',
      };
    }
    if (path === '/incidents' || path === '/my-reports') {
      return {
        id: 'INCIDENTS',
        label: 'INCIDENT LOGISTICS',
        sub: 'Field reports & responder coordination',
        promptHint: 'Ask about verified incident clusters and local disruptions...',
      };
    }
    if (path === '/sos') {
      return {
        id: 'SOS',
        label: 'CRITICAL RESCUE',
        sub: 'Distress dispatch & priority safety',
        promptHint: 'Ask for emergency guidance, triage steps, or 112 coordination...',
      };
    }
    return {
      id: 'GLOBAL',
      label: 'EARTH INTELLIGENCE',
      sub: 'Disaster response copilot',
      promptHint: 'Ask about weather, risk, alerts, or disaster preparedness...',
    };
  }, [location.pathname]);

  // Handle Send Message
  const sendMessage = useCallback(
    async (rawText) => {
      const text = (rawText || inputText || '').trim();
      if (!text || isLoading) return;

      setInputText('');

      const userTurn = {
        id: `u_${Date.now()}`,
        role: 'user',
        content: text,
        context: currentScreenContext.label,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, userTurn]);
      setIsLoading(true);

      const recentHistory = messages
        .slice(-6)
        .map((m) => ({ role: m.role, content: m.content }));
      recentHistory.push({ role: 'user', content: text });

      try {
        const placeLabel = locationName.city || locationName.displayName || 'Operations Area';
        const res = await sendWeatherGPTChat({
          message: text,
          latitude: locationCoordinates.latitude,
          longitude: locationCoordinates.longitude,
          location: placeLabel,
          language: 'en',
          conversationId,
          conversation: recentHistory,
          userMode: currentScreenContext.id,
        });

        if (res && res.data) {
          const d = res.data;
          if (d.conversationId) setConversationId(d.conversationId);

          const assistantTurn = {
            id: `a_${Date.now()}`,
            role: 'assistant',
            content: d.reply,
            intentCard: d.intentCard || null,
            timeline: d.timeline || d.intentCard?.timeline || [],
            why: d.intentCard?.why || null,
            whatToDo: d.intentCard?.whatToDo || null,
            source: d.intentCard?.source || 'Open-Meteo · Atmospheric Numerical Model',
            followUpSuggestions: d.followUpSuggestions || [],
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          };

          setMessages((prev) => [...prev, assistantTurn]);
        } else {
          throw new Error('Unexpected response format');
        }
      } catch (err) {
        setMessages((prev) => [
          ...prev,
          {
            id: `err_${Date.now()}`,
            role: 'assistant',
            content:
              'WeatherGPT telemetry signal disrupted. Operating in autonomous local guidance mode.',
            intentCard: {
              badge: 'TELEMETRY DISRUPTION',
              primaryMetric: { value: 'ACTIVE', label: 'Local Guidance' },
              why: 'Network synchronization delay with atmospheric forecasting engine.',
              whatToDo: 'Verify connectivity or proceed with standard emergency protocols.',
              source: 'DisasterChain Edge Copilot',
            },
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    },
    [
      inputText,
      isLoading,
      messages,
      currentScreenContext,
      locationName,
      locationCoordinates,
      conversationId,
    ]
  );

  const openWeatherGPT = useCallback(
    (initialPrompt = null) => {
      setIsOpen(true);
      setIsMinimized(false);
      if (initialPrompt && typeof initialPrompt === 'string') {
        setTimeout(() => {
          sendMessage(initialPrompt);
        }, 120);
      }
    },
    [sendMessage]
  );

  const closeWeatherGPT = useCallback(() => {
    setIsOpen(false);
    setIsMinimized(false);
  }, []);

  const minimizeWeatherGPT = useCallback(() => {
    setIsMinimized(true);
  }, []);

  const toggleWeatherGPT = useCallback(() => {
    setIsOpen((prev) => !prev);
    setIsMinimized(false);
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setConversationId(`wgpt_${Date.now()}`);
  }, []);

  const value = {
    isOpen,
    isMinimized,
    messages,
    isLoading,
    inputText,
    setInputText,
    conversationId,
    currentScreenContext,
    locationCoordinates,
    locationName,
    openWeatherGPT,
    closeWeatherGPT,
    minimizeWeatherGPT,
    toggleWeatherGPT,
    sendMessage,
    clearMessages,
  };

  return <WeatherGPTContext.Provider value={value}>{children}</WeatherGPTContext.Provider>;
};
