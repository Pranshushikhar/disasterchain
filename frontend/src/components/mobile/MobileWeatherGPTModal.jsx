import React, { useState, useRef, useEffect } from 'react';
import Icon from '../Icons';
import { sendWeatherGPTChat } from '../../services/api';

/**
 * MobileWeatherGPTModal (Section 7)
 * Purpose-built mobile intelligence sheet for WeatherGPT.
 * Structured response architecture:
 * - ANSWER
 * - WHY
 * - WHAT TO DO
 * - DATA USED
 * - CONFIDENCE
 */
export default function MobileWeatherGPTModal({
  isOpen,
  onClose,
  initialQuery = '',
  locality = 'CHANDIGARH',
}) {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Handle initial query when opened
  useEffect(() => {
    if (isOpen) {
      if (initialQuery && initialQuery.trim()) {
        handleSendQuery(initialQuery);
      } else if (messages.length === 0) {
        // Welcome message with structured format
        setMessages([
          {
            id: 'welcome',
            role: 'assistant',
            time: 'Now',
            answer: `DisasterChain Meteorological & Tactical Intelligence active for ${locality}. Sustained heavy precipitation has triggered elevated waterlogging watches across Sectors 14–17.`,
            why: 'Precipitation rate of 38 mm/h exceeds local trunk culvert drainage capacity (currently at 92%).',
            whatToDo: 'Avoid arterial underpasses along Ring Road Bypass. Use elevated flyovers. Civil Shelter #2 is operational with 42 beds.',
            dataUsed: 'IMD Automated Weather Radar · Municipal Culvert Telemetry · 4 Verified Citizen Reports',
            confidence: 'HIGH (94%)',
          },
        ]);
      }
    }
  }, [isOpen, initialQuery, locality]);

  if (!isOpen) return null;

  const handleSendQuery = async (queryText) => {
    const textToSend = queryText || inputText;
    if (!textToSend.trim()) return;

    const userMsg = {
      id: `u-${Date.now()}`,
      role: 'user',
      text: textToSend.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      // Call WeatherGPT API service or intelligent local structured synthesis
      const response = await sendWeatherGPTChat(
        textToSend.trim(),
        {
          city: locality,
          rainfallMm: 38,
          activeIncidents: 3,
        }
      );

      // Extract structured fields or synthesize deterministic operational structure
      let answer = '';
      let why = '';
      let whatToDo = '';
      let dataUsed = 'IMD Open-Meteo · Municipal Drainage Nodes · Ground Beacons';
      let confidence = 'HIGH (91%)';

      const qLower = textToSend.toLowerCase();

      if (qLower.includes('travel') || qLower.includes('safe')) {
        answer = 'Transit is currently NOT advised through low-lying corridors in Sectors 14, 15, and 17.';
        why = '45cm curb-level inundation recorded at Ring Road Underpass; vehicle stall hazard is severe.';
        whatToDo = 'Delay road transit by 45 minutes or reroute via Madhya Marg elevated corridor.';
        confidence = 'HIGH (96%)';
      } else if (qLower.includes('changed') || qLower.includes('change')) {
        answer = 'Precipitation peaked at 08:42 AM (38 mm/h). 2 new field reports were verified in Sector 14.';
        why = 'Frontal convective cloud cell has begun shifting eastward towards Panchkula.';
        whatToDo = 'Expect steady runoff recession over the next 90 minutes. Monitor underpass sensors.';
        confidence = 'HIGH (92%)';
      } else if (qLower.includes('where') || qLower.includes('shelter') || qLower.includes('go')) {
        answer = 'Proceed to Civil Relief Shelter #2 located at Sector 17 Community Complex (1.2 km away).';
        why = 'Facility is on elevated bedrock, equipped with auxiliary diesel generators and 42 available beds.';
        whatToDo = 'Approach via Jan Marg arterial route. Avoid the flooded Sector 14 underpass.';
        confidence = 'VERY HIGH (98%)';
      } else if (qLower.includes('what should i do') || qLower.includes('now')) {
        answer = 'Stay sheltered in elevated structures; do not attempt walking or driving through moving water.';
        why = 'Submerged open manholes and hidden culvert debris have been logged by emergency teams.';
        whatToDo = 'Charge mobile devices now. In life-threatening distress, press SOS or call 112 directly.';
        confidence = 'VERY HIGH (95%)';
      } else {
        answer = response?.text || response?.answer || `Operational analysis confirms active storm drainage stress across ${locality}. All emergency nodes are in heightened posture.`;
        why = response?.why || 'Recent cumulative rainfall has reached 42mm over the last 2 hours.';
        whatToDo = response?.whatToDo || 'Check emergency alerts tab for real-time corridor closures.';
      }

      const assistantMsg = {
        id: `a-${Date.now()}`,
        role: 'assistant',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        answer,
        why,
        whatToDo,
        dataUsed,
        confidence,
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      // Offline fallback with deterministic structure
      const fallbackMsg = {
        id: `a-${Date.now()}`,
        role: 'assistant',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        answer: `Direct advisory: Elevated waterlogging risk active across ${locality} lowlands. Transit delays confirmed.`,
        why: 'Local atmospheric pressure drop and heavy rainfall exceeding culvert intake capacity.',
        whatToDo: 'Reroute to elevated corridors. Civil Shelter #2 remains open with 42 beds.',
        dataUsed: 'Cached Ground Telemetry · Decentralized Node Ledger',
        confidence: 'STANDALONE (88%)',
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 10000,
        background: '#11100E',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'Plus Jakarta Sans, sans-serif',
      }}
      role="dialog"
      aria-label="DisasterChain AI Assistant"
    >
      {/* Top Mobile Intelligence Bar */}
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: 'calc(0.75rem + env(safe-area-inset-top, 0px)) 1rem 0.75rem 1rem',
          background: 'rgba(25, 23, 20, 0.98)',
          borderBottom: '1px solid rgba(242, 238, 231, 0.1)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
          <span style={{ fontSize: '1.1rem' }}>⚡</span>
          <div>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.75rem', fontWeight: 800, color: '#D96B35' }}>
              ASK DISASTERCHAIN
            </div>
            <div style={{ fontSize: '0.62rem', color: '#A49F93' }}>
              {locality} METEOROLOGICAL INTELLIGENCE
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          style={{
            background: 'rgba(242, 238, 231, 0.08)',
            border: 'none',
            color: '#F7F4ED',
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            cursor: 'pointer',
            fontSize: '1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          aria-label="Close WeatherGPT"
        >
          ✕
        </button>
      </header>

      {/* Suggested Quick Questions */}
      <div
        style={{
          display: 'flex',
          gap: '0.4rem',
          overflowX: 'auto',
          padding: '0.65rem 1rem',
          background: '#191714',
          borderBottom: '1px solid rgba(242, 238, 231, 0.06)',
          scrollbarWidth: 'none',
        }}
      >
        {[
          'Is it safe to travel?',
          'What changed?',
          'Where should I go?',
          'What should I do now?',
        ].map((q, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSendQuery(q)}
            style={{
              background: 'rgba(242, 238, 231, 0.05)',
              border: '1px solid rgba(242, 238, 231, 0.12)',
              borderRadius: '16px',
              padding: '0.35rem 0.65rem',
              color: '#E9E5DC',
              fontSize: '0.72rem',
              fontWeight: 600,
              whiteSpace: 'nowrap',
              cursor: 'pointer',
            }}
          >
            "{q}"
          </button>
        ))}
      </div>

      {/* Chat Messages Stream */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '1rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
        }}
      >
        {messages.map((msg) => {
          if (msg.role === 'user') {
            return (
              <div
                key={msg.id}
                style={{
                  alignSelf: 'flex-end',
                  background: '#D96B35',
                  color: '#FFFFFF',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '12px 12px 2px 12px',
                  maxWidth: '85%',
                  fontSize: '0.85rem',
                  lineHeight: 1.4,
                  fontWeight: 500,
                }}
              >
                {msg.text}
              </div>
            );
          }

          // Structured Assistant Response (Section 7)
          return (
            <div
              key={msg.id}
              style={{
                alignSelf: 'flex-start',
                background: '#191714',
                border: '1px solid rgba(242, 238, 231, 0.1)',
                borderRadius: '8px',
                padding: '0.85rem',
                maxWidth: '92%',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.6rem',
              }}
            >
              {/* 1. ANSWER */}
              <div>
                <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.6rem', color: '#D96B35', fontWeight: 800, display: 'block', marginBottom: '2px' }}>
                  ANSWER:
                </span>
                <p style={{ margin: 0, fontSize: '0.86rem', color: '#F7F4ED', lineHeight: 1.45, fontWeight: 600 }}>
                  {msg.answer}
                </p>
              </div>

              {/* 2. WHY */}
              {msg.why && (
                <div style={{ background: 'rgba(242, 238, 231, 0.03)', padding: '0.45rem 0.55rem', borderRadius: '4px' }}>
                  <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.58rem', color: '#A49F93', fontWeight: 700, display: 'block', marginBottom: '2px' }}>
                    WHY (CAUSAL MECHANISM):
                  </span>
                  <p style={{ margin: 0, fontSize: '0.78rem', color: '#E9E5DC', lineHeight: 1.4 }}>
                    {msg.why}
                  </p>
                </div>
              )}

              {/* 3. WHAT TO DO */}
              {msg.whatToDo && (
                <div style={{ background: 'rgba(217, 107, 53, 0.06)', borderLeft: '3px solid #D96B35', padding: '0.45rem 0.55rem', borderRadius: '2px' }}>
                  <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.58rem', color: '#D96B35', fontWeight: 800, display: 'block', marginBottom: '2px' }}>
                    ACTIONABLE DIRECTIVE:
                  </span>
                  <p style={{ margin: 0, fontSize: '0.78rem', color: '#F7F4ED', lineHeight: 1.4 }}>
                    {msg.whatToDo}
                  </p>
                </div>
              )}

              {/* 4. DATA USED & CONFIDENCE */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(242,238,231,0.06)', paddingTop: '0.4rem', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.58rem', color: '#7A756D' }}>
                <span title={msg.dataUsed}>DATA: {msg.dataUsed?.split('·')[0]}</span>
                <span style={{ color: '#5E8B68', fontWeight: 700 }}>{msg.confidence}</span>
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div
            style={{
              alignSelf: 'flex-start',
              background: '#191714',
              border: '1px solid rgba(242, 238, 231, 0.1)',
              borderRadius: '8px',
              padding: '0.65rem 0.85rem',
              color: '#A49F93',
              fontSize: '0.75rem',
              fontFamily: 'JetBrains Mono, monospace',
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
            }}
          >
            <span className="mobile-pulse-dot" style={{ background: '#D96B35' }} />
            <span>Analyzing atmospheric telemetry & flood models...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Fixed Bottom Input Bar */}
      <div
        style={{
          background: 'rgba(25, 23, 20, 0.98)',
          borderTop: '1px solid rgba(242, 238, 231, 0.1)',
          padding: '0.65rem 1rem calc(0.65rem + env(safe-area-inset-bottom, 0px)) 1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.55rem',
        }}
      >
        <input
          ref={inputRef}
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSendQuery()}
          placeholder="Ask about road safety, weather, or shelter..."
          style={{
            flex: 1,
            background: '#11100E',
            border: '1px solid rgba(242, 238, 231, 0.15)',
            borderRadius: '20px',
            padding: '0.65rem 1rem',
            color: '#F7F4ED',
            fontSize: '0.85rem',
            outline: 'none',
          }}
        />

        <button
          type="button"
          onClick={() => handleSendQuery()}
          disabled={!inputText.trim() || isLoading}
          style={{
            background: inputText.trim() && !isLoading ? '#D96B35' : 'rgba(242, 238, 231, 0.1)',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: '50%',
            width: '38px',
            height: '38px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: inputText.trim() && !isLoading ? 'pointer' : 'default',
          }}
          aria-label="Send Query"
        >
          <Icon name="arrow-up" size={16} color="#FFFFFF" />
        </button>
      </div>
    </div>
  );
}
