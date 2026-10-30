const express = require('express');
const router = express.Router();
const { handleAIChat, handleConversationalAIChat } = require('../controllers/aiAssistantController');
const { protect } = require('../middleware/auth');
const { aiLimiter } = require('../middleware/rateLimiter');

// POST /api/ai/chat - Process message through DisasterChain AI Assistant (JWT Protected Operational Engine)
router.post('/chat', protect, aiLimiter, handleAIChat);

// POST /api/ai/conversational-chat - Full Conversational AI Assistant (ChatGPT-style dialogue + tool actions)
router.post('/conversational-chat', aiLimiter, handleConversationalAIChat);

module.exports = router;
