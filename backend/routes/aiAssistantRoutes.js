const express = require('express');
const router = express.Router();
const { handleAIChat, handleConversationalAIChat } = require('../controllers/aiAssistantController');
const { triageVoiceReport } = require('../controllers/voiceCopilotController');
const { protect } = require('../middleware/auth');
const { aiLimiter } = require('../middleware/rateLimiter');

// POST /api/ai/chat - Process message through DisasterChain AI Assistant (JWT Protected Operational Engine)
router.post('/chat', protect, aiLimiter, handleAIChat);

// POST /api/ai/conversational-chat - Full Conversational AI Assistant (ChatGPT-style dialogue + tool actions)
router.post('/conversational-chat', aiLimiter, handleConversationalAIChat);

// POST /api/ai/voice-triage - Voice-to-incident triage with accessibility extraction
router.post('/voice-triage', aiLimiter, triageVoiceReport);

module.exports = router;

