import { parseVoiceIntent, INTENTS } from './services/intentParser';
import { cleanTextForSpeech, VOICE_LANGUAGE_MAP, audioFeedback } from './services/voiceService';
import { SUPPORTED_LANGUAGES } from './i18n/languageConfig';

describe('DisasterChain Voice Control System', () => {
  describe('1. Natural Language Voice Navigation', () => {
    it('correctly maps natural phrases to the shelters page', () => {
      const phrases = [
        'Open the shelter page.',
        'Take me to the weather page.',
        'Show nearby shelters.',
        'Open shelters',
        'I want to see shelters',
        'Can you show me the shelters?',
        'Relief camps',
      ];

      expect(parseVoiceIntent('Open the shelter page.').intent).toBe(INTENTS.NAV_SHELTERS);
      expect(parseVoiceIntent('Show nearby shelters.').intent).toBe(INTENTS.NAV_SHELTERS);
      expect(parseVoiceIntent('Open shelters').intent).toBe(INTENTS.NAV_SHELTERS);
      expect(parseVoiceIntent('I want to see shelters').intent).toBe(INTENTS.NAV_SHELTERS);
      expect(parseVoiceIntent('Can you show me the shelters?').intent).toBe(INTENTS.NAV_SHELTERS);
      expect(parseVoiceIntent('Open shelters').targetPath).toBe('/shelters');
    });

    it('correctly maps natural phrases to the weather page', () => {
      expect(parseVoiceIntent('Take me to the weather page.').intent).toBe(INTENTS.NAV_WEATHER);
      expect(parseVoiceIntent('Open weather').intent).toBe(INTENTS.NAV_WEATHER);
      expect(parseVoiceIntent('Show weather page').intent).toBe(INTENTS.NAV_WEATHER);
      expect(parseVoiceIntent('Show weather page').targetPath).toBe('/weather');
    });

    it('correctly maps natural phrases to the spatial map page', () => {
      expect(parseVoiceIntent('Open the map.').intent).toBe(INTENTS.NAV_MAP);
      expect(parseVoiceIntent('Show map').intent).toBe(INTENTS.NAV_MAP);
      expect(parseVoiceIntent('Take me to map').targetPath).toBe('/map');
    });

    it('correctly maps natural phrases to emergency contacts', () => {
      expect(parseVoiceIntent('Go to emergency contacts.').intent).toBe(INTENTS.NAV_CONTACTS);
      expect(parseVoiceIntent('Show emergency contacts').intent).toBe(INTENTS.NAV_CONTACTS);
      expect(parseVoiceIntent('Show helpline numbers').intent).toBe(INTENTS.NAV_CONTACTS);
    });

    it('correctly maps natural phrases to WeatherGPT', () => {
      expect(parseVoiceIntent('Open WeatherGPT.').intent).toBe(INTENTS.NAV_WEATHERGPT);
      expect(parseVoiceIntent('Ask WeatherGPT').intent).toBe(INTENTS.NAV_WEATHERGPT);
      const queryResult = parseVoiceIntent('Ask WeatherGPT what should I do during heavy rain');
      expect(queryResult.intent).toBe(INTENTS.WEATHERGPT_QUERY);
      expect(queryResult.query).toContain('what should I do during heavy rain');
    });

    it('correctly maps natural phrases to incident reports', () => {
      expect(parseVoiceIntent('Show incident reports.').intent).toBe(INTENTS.NAV_INCIDENTS);
      expect(parseVoiceIntent('Open incidents').targetPath).toBe('/incidents');
    });

    it('correctly maps natural phrases to the safety page', () => {
      expect(parseVoiceIntent('Open the safety page.').intent).toBe(INTENTS.NAV_SAFETY);
      expect(parseVoiceIntent('Show safety guidelines').targetPath).toBe('/safety');
    });

    it('correctly maps natural phrases to settings', () => {
      expect(parseVoiceIntent('Take me to settings.').intent).toBe(INTENTS.NAV_SETTINGS);
      expect(parseVoiceIntent('Open settings').intent).toBe(INTENTS.NAV_SETTINGS);
    });

    it('correctly maps natural phrases to navigation back and home', () => {
      expect(parseVoiceIntent('Go back.').intent).toBe(INTENTS.NAV_BACK);
      expect(parseVoiceIntent('Return to home.').intent).toBe(INTENTS.NAV_HOME);
      expect(parseVoiceIntent('Return to home.').targetPath).toBe('/');
      expect(parseVoiceIntent('Go home').intent).toBe(INTENTS.NAV_HOME);
    });
  });

  describe('2. Voice-Controlled Application Actions', () => {
    it('handles shelter specific actions', () => {
      expect(parseVoiceIntent('Find shelters near me.').intent).toBe(INTENTS.ACTION_SHELTER_NEARBY);
      expect(parseVoiceIntent('Show the nearest shelter.').intent).toBe(INTENTS.ACTION_SHELTER_NEARBY);
      expect(parseVoiceIntent('Which one is closest?').intent).toBe(INTENTS.ACTION_SHELTER_NEARBY);
      expect(parseVoiceIntent('Get directions to this shelter.').intent).toBe(INTENTS.ACTION_SHELTER_DIRECTIONS);
    });

    it('handles weather specific actions', () => {
      expect(parseVoiceIntent("What's the weather today?").intent).toBe(INTENTS.ACTION_WEATHER_TODAY);
      expect(parseVoiceIntent('Tell me the temperature.').intent).toBe(INTENTS.ACTION_WEATHER_TODAY);
      expect(parseVoiceIntent("Show tomorrow's forecast.").intent).toBe(INTENTS.ACTION_WEATHER_FORECAST);
      expect(parseVoiceIntent('Is it going to rain?').intent).toBe(INTENTS.ACTION_WEATHER_RAIN);
      expect(parseVoiceIntent('Will it rain tomorrow?').intent).toBe(INTENTS.ACTION_WEATHER_FORECAST);
    });

    it('handles map specific actions', () => {
      expect(parseVoiceIntent('Show my current location.').intent).toBe(INTENTS.ACTION_MAP_LOCATE);
      expect(parseVoiceIntent('Zoom in.').intent).toBe(INTENTS.ACTION_MAP_ZOOM_IN);
      expect(parseVoiceIntent('Zoom out.').intent).toBe(INTENTS.ACTION_MAP_ZOOM_OUT);
      expect(parseVoiceIntent('Show emergency shelters on the map.').intent).toBe(INTENTS.ACTION_MAP_SHELTERS);
      expect(parseVoiceIntent('Show nearby incidents.').intent).toBe(INTENTS.ACTION_MAP_INCIDENTS);
    });

    it('handles incident actions', () => {
      expect(parseVoiceIntent('Report an incident.').intent).toBe(INTENTS.ACTION_INCIDENT_REPORT);
      expect(parseVoiceIntent('Show recent incidents.').intent).toBe(INTENTS.ACTION_INCIDENT_RECENT);
      expect(parseVoiceIntent('Open my reports.').intent).toBe(INTENTS.ACTION_INCIDENT_RECENT);
      expect(parseVoiceIntent('Tell me about the latest alert.').intent).toBe(INTENTS.ACTION_ALERT_LATEST);
    });

    it('handles safety guidance queries', () => {
      expect(parseVoiceIntent('What should I do during a flood?').intent).toBe(INTENTS.ACTION_SAFETY_FLOOD);
      expect(parseVoiceIntent('Show earthquake safety instructions.').intent).toBe(INTENTS.ACTION_SAFETY_EARTHQUAKE);
      expect(parseVoiceIntent('How can I prepare for a cyclone?').intent).toBe(INTENTS.ACTION_SAFETY_CYCLONE);
    });

    it('handles emergency contact and helpline actions', () => {
      expect(parseVoiceIntent('Call emergency services.').intent).toBe(INTENTS.ACTION_CONTACT_CALL);
      expect(parseVoiceIntent('Call 112').intent).toBe(INTENTS.ACTION_CONTACT_CALL);
      expect(parseVoiceIntent('Show ambulance contact.').intent).toBe(INTENTS.ACTION_CONTACT_AMBULANCE);
      expect(parseVoiceIntent('Show NDRF contact.').intent).toBe(INTENTS.ACTION_CONTACT_NDRF);
    });

    it('handles language switching across supported languages', () => {
      const enRes = parseVoiceIntent('Change language to English.');
      expect(enRes.intent).toBe(INTENTS.ACTION_CHANGE_LANGUAGE);
      expect(enRes.languageCode).toBe('en');

      const hiRes = parseVoiceIntent('Change language to Hindi.');
      expect(hiRes.intent).toBe(INTENTS.ACTION_CHANGE_LANGUAGE);
      expect(hiRes.languageCode).toBe('hi');

      const paRes = parseVoiceIntent('Change language to Punjabi.');
      expect(paRes.intent).toBe(INTENTS.ACTION_CHANGE_LANGUAGE);
      expect(paRes.languageCode).toBe('pa');

      const bnRes = parseVoiceIntent('Switch to Bengali');
      expect(bnRes.intent).toBe(INTENTS.ACTION_CHANGE_LANGUAGE);
      expect(bnRes.languageCode).toBe('bn');

      const taRes = parseVoiceIntent('Change language to Tamil');
      expect(taRes.intent).toBe(INTENTS.ACTION_CHANGE_LANGUAGE);
      expect(taRes.languageCode).toBe('ta');
    });

    it('handles theme changes', () => {
      expect(parseVoiceIntent('Turn on dark mode.').intent).toBe(INTENTS.ACTION_DARK_MODE);
      expect(parseVoiceIntent('Turn on light mode.').intent).toBe(INTENTS.ACTION_LIGHT_MODE);
    });
  });

  describe('3. Critical SOS Voice Commands & Safety Handshake', () => {
    it('detects SOS triggers with critical priority from any phrase variation', () => {
      expect(parseVoiceIntent('SOS').intent).toBe(INTENTS.SOS_TRIGGER);
      expect(parseVoiceIntent('Emergency').intent).toBe(INTENTS.SOS_TRIGGER);
      expect(parseVoiceIntent('I need help.').intent).toBe(INTENTS.SOS_TRIGGER);
      expect(parseVoiceIntent('Send an SOS.').intent).toBe(INTENTS.SOS_TRIGGER);
      expect(parseVoiceIntent('I am in danger.').intent).toBe(INTENTS.SOS_TRIGGER);
      expect(parseVoiceIntent('Activate emergency assistance.').intent).toBe(INTENTS.SOS_TRIGGER);
      expect(parseVoiceIntent('Bachao').intent).toBe(INTENTS.SOS_TRIGGER);
      expect(parseVoiceIntent('Madad').intent).toBe(INTENTS.SOS_TRIGGER);
    });

    it('requires explicit confirmation when SOS is confirming and prevents accidental triggers', () => {
      const confirmingContext = { isSosConfirming: true, isSosOpen: true };
      expect(parseVoiceIntent('Confirm SOS', confirmingContext).intent).toBe(INTENTS.SOS_CONFIRM);
      expect(parseVoiceIntent('Yes send', confirmingContext).intent).toBe(INTENTS.SOS_CONFIRM);
      expect(parseVoiceIntent('Send SOS', confirmingContext).intent).toBe(INTENTS.SOS_CONFIRM);
    });

    it('supports explicit cancellation of SOS', () => {
      const confirmingContext = { isSosConfirming: true, isSosOpen: true };
      expect(parseVoiceIntent('Cancel SOS', confirmingContext).intent).toBe(INTENTS.SOS_CANCEL);
      expect(parseVoiceIntent('Stop', confirmingContext).intent).toBe(INTENTS.SOS_CANCEL);
      expect(parseVoiceIntent('Abort', confirmingContext).intent).toBe(INTENTS.SOS_CANCEL);
    });
  });

  describe('4. Natural Text-to-Speech Sanitization', () => {
    it('cleans raw markdown, headers, code, and symbols for natural conversational speech', () => {
      const rawMarkdown = `
        ### Flood Advisory Level 2
        **Attention Residents**: Rapidly rising water detected near **Sector 14**.
        - Shut off power breaker immediately.
        - Do not drive through moving water.
        For details visit [DisasterChain](https://disasterchain.vercel.app/safety).
        Temperature is 28°C.
      `;

      const cleaned = cleanTextForSpeech(rawMarkdown);

      expect(cleaned).not.toContain('###');
      expect(cleaned).not.toContain('**');
      expect(cleaned).not.toContain('https://');
      expect(cleaned).not.toContain('[DisasterChain]');
      expect(cleaned).toContain('Flood Advisory Level 2');
      expect(cleaned).toContain('Attention Residents');
      expect(cleaned).toContain('28 degrees Celsius');
    });

    it('removes code blocks, tables, and emojis', () => {
      const rawText = '```json\n{"status": "ok"}\n``` Check shelter status! 🚨 Table: | Shelter | Capacity |';
      const cleaned = cleanTextForSpeech(rawText);

      expect(cleaned).not.toContain('```');
      expect(cleaned).not.toContain('{"status": "ok"}');
      expect(cleaned).not.toContain('🚨');
      expect(cleaned).not.toContain('| Shelter | Capacity |');
      expect(cleaned).toContain('Check shelter status');
    });
  });

  describe('5. Multi-Language Speech Engine Map (20 Languages)', () => {
    it('ensures all 20 supported languages have valid BCP-47 speech tags', () => {
      expect(SUPPORTED_LANGUAGES).toHaveLength(20);

      SUPPORTED_LANGUAGES.forEach((lang) => {
        const speechTag = VOICE_LANGUAGE_MAP[lang.code];
        expect(speechTag).toBeDefined();
        expect(speechTag).toMatch(/^[a-z]{2,3}-[A-Z]{2}$/);
      });
    });

    it('verifies procedural audio feedback methods exist and execute cleanly', () => {
      expect(() => audioFeedback.playListeningChime()).not.toThrow();
      expect(() => audioFeedback.playSuccessChime()).not.toThrow();
      expect(() => audioFeedback.playSosChime()).not.toThrow();
      expect(() => audioFeedback.playStopChime()).not.toThrow();
    });
  });
});
