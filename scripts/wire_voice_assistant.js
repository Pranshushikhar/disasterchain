const fs = require('fs');
const path = require('path');

const gvaPath = path.join(__dirname, '../frontend/src/components/GlobalVoiceAssistant.jsx');
let gva = fs.readFileSync(gvaPath, 'utf8');

gva = gva.replace(
  '<span>VOICE SOS PROTOCOL ACTIVE</span>',
  "<span>{t('voice.voiceSosProtocol', 'VOICE SOS PROTOCOL ACTIVE')}</span>"
);
gva = gva.replace(
  '<span>Confirm SOS Broadcast</span>',
  "<span>{t('voice.confirmSos', 'Confirm SOS Broadcast')}</span>"
);
gva = gva.replace(
  '<span>Cancel (Say "Cancel SOS")</span>',
  "<span>{t('voice.cancelSos', 'Cancel (Say \"Cancel SOS\")')}</span>"
);
gva = gva.replace(
  '<h3 className="dc-voice-chat-title">DisasterChain AI Assistant</h3>',
  '<h3 className="dc-voice-chat-title">{t(\'auth.emergencyAssistant\', \'DisasterChain AI Assistant\')}</h3>'
);
gva = gva.replace(
  ": isThinking\n                        ? 'Thinking...'\n                        : 'Conversational Intelligence & Operations'}",
  ": isThinking\n                        ? t('voice.thinkingState', 'Thinking...')\n                        : t('voice.idleState', 'Conversational Intelligence & Operations')}"
);
gva = gva.replace(
  ': isThinking\r\n                        ? \'Thinking...\'\r\n                        : \'Conversational Intelligence & Operations\'}',
  ": isThinking\r\n                        ? t('voice.thinkingState', 'Thinking...')\r\n                        : t('voice.idleState', 'Conversational Intelligence & Operations')}"
);
gva = gva.replace(
  'title="Start New Chat"',
  "title={t('voice.startNewChat', 'Start New Chat')}"
);
gva = gva.replace(
  'aria-label="Start New Chat"',
  "aria-label={t('voice.startNewChat', 'Start New Chat')}"
);
gva = gva.replace(
  "title={isMuted ? 'Unmute voice' : 'Mute voice'}",
  "title={isMuted ? t('voice.unmuteVoice', 'Unmute voice') : t('voice.muteVoice', 'Mute voice')}"
);
gva = gva.replace(
  "aria-label={isMuted ? 'Unmute voice' : 'Mute voice'}",
  "aria-label={isMuted ? t('voice.unmuteVoice', 'Unmute voice') : t('voice.muteVoice', 'Mute voice')}"
);
gva = gva.replace(
  'title="Voice command help"',
  "title={t('voice.help', 'Voice command help')}"
);
gva = gva.replace(
  'aria-label="Voice command help"',
  "aria-label={t('voice.help', 'Voice command help')}"
);
gva = gva.replace(
  '<p className="dc-voice-msg-text">{msg.content}</p>',
  '<p className="dc-voice-msg-text">{msg.id === \'welcome_initial\' ? t(\'voice.welcomeInitial\') : msg.content}</p>'
);
gva = gva.replace(
  '<span className="dc-voice-thinking-label">Synthesizing intelligence...</span>',
  '<span className="dc-voice-thinking-label">{t(\'voice.thinkingState\', \'Synthesizing intelligence...\')}</span>'
);
gva = gva.replace(
  '<span className="dc-voice-suggestions-title">Ask or try saying:</span>',
  '<span className="dc-voice-suggestions-title">{t(\'voice.starterTitle\', \'Ask or try saying:\')}</span>'
);
gva = gva.replace(
  '"What can you help me with?"',
  '"{t(\'voice.starter1\', \'What can you help me with?\')}"'
);
gva = gva.replace(
  '"Why is preparedness important?"',
  '"{t(\'voice.starter2\', \'Why is preparedness important?\')}"'
);
gva = gva.replace(
  '"What goes in an emergency kit?"',
  '"{t(\'voice.starter3\', \'What goes in an emergency kit?\')}"'
);
gva = gva.replace(
  '<span>Interrupt</span>',
  "<span>{t('voice.interrupt', 'Interrupt')}</span>"
);
gva = gva.replace(
  '<span>Microphone access blocked. Click the lock icon in your URL bar to allow.</span>',
  "<span>{t('voice.micBlocked', 'Microphone access blocked. Click the lock icon in your URL bar to allow.')}</span>"
);
gva = gva.replace(
  "isListening\n                      ? 'Listening... (or type your message)'\n                      : 'Ask a question or say a command...'",
  "isListening ? t('voice.inputListening', 'Listening... (or type your message)') : t('voice.inputPlaceholder', 'Ask a question or say a command...')"
);
gva = gva.replace(
  "isListening\r\n                      ? 'Listening... (or type your message)'\r\n                      : 'Ask a question or say a command...'",
  "isListening ? t('voice.inputListening', 'Listening... (or type your message)') : t('voice.inputPlaceholder', 'Ask a question or say a command...')"
);
gva = gva.replace(
  ": isThinking || isProcessing\n                ? 'Thinking...'\n                : 'AI Assistant'",
  ": isThinking || isProcessing ? t('voice.thinkingState', 'Thinking...') : t('common.ai', 'AI Assistant')"
);
gva = gva.replace(
  ": isThinking || isProcessing\r\n                ? 'Thinking...'\r\n                : 'AI Assistant'",
  ": isThinking || isProcessing ? t('voice.thinkingState', 'Thinking...') : t('common.ai', 'AI Assistant')"
);

fs.writeFileSync(gvaPath, gva, 'utf8');
console.log('GlobalVoiceAssistant.jsx updated');

