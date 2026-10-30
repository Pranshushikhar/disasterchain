const { processChat } = require('../services/aiAssistantService');

/**
 * @desc    Process a user message with the DisasterChain AI Emergency Assistant
 * @route   POST /api/ai/chat
 * @access  Private (JWT Required)
 */
exports.handleAIChat = async (req, res) => {
  try {
    const { message, conversation, latitude, longitude } = req.body;

    // 1. Input Validation
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Message text is required and cannot be empty.',
      });
    }

    if (message.length > 1000) {
      return res.status(400).json({
        success: false,
        message: 'Message exceeds the maximum permitted length of 1000 characters.',
      });
    }

    // 2. Validate user identity and role from verified JWT (never trust client-supplied role)
    const userRole = (req.user && req.user.role) || 'citizen';
    const userId = req.user && req.user._id ? String(req.user._id) : null;

    // 3. Coordinate validation
    let validLat = null;
    let validLon = null;
    if (latitude != null && !isNaN(Number(latitude))) {
      validLat = Number(latitude);
    }
    if (longitude != null && !isNaN(Number(longitude))) {
      validLon = Number(longitude);
    }

    // 4. Sanitize conversation history if provided
    let cleanConversation = [];
    if (Array.isArray(conversation)) {
      cleanConversation = conversation
        .filter((c) => c && typeof c === 'object' && c.role && c.content)
        .slice(-6); // Max 6 recent messages
    }

    // 5. Validate language against supported allowlist (fallback to English)
    const SUPPORTED_LANG_CODES = [
      'en', 'hi', 'bn', 'te', 'mr', 'ta', 'gu', 'kn', 'ml', 'pa',
      'or', 'as', 'ur', 'sa', 'ne', 'kok', 'ks', 'mai', 'sd', 'mni'
    ];
    let selectedLanguage = 'en';
    if (req.body.language && typeof req.body.language === 'string') {
      const normalizedLang = req.body.language.trim().toLowerCase();
      if (SUPPORTED_LANG_CODES.includes(normalizedLang)) {
        selectedLanguage = normalizedLang;
      }
    }

    // 6. Process through AI Assistant Service
    const result = await processChat({
      message: message.trim(),
      conversation: cleanConversation,
      latitude: validLat,
      longitude: validLon,
      userRole,
      userId,
      language: selectedLanguage,
    });

    return res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('DisasterChain AI Assistant Error:', error);
    return res.status(500).json({
      success: false,
      message: 'The AI Emergency Assistant is temporarily unavailable. DisasterChain live safety services remain online.',
      fallbackActions: [
        { type: 'NAVIGATE', label: 'OPEN ALERTS', route: '/alerts' },
        { type: 'NAVIGATE', label: 'FIND SHELTER', route: '/shelters' },
        { type: 'NAVIGATE', label: 'OPEN MAP', route: '/dashboard' },
        { type: 'TRIGGER_SOS', label: 'EMERGENCY SOS' },
      ],
    });
  }
};

const { processConversationalChat } = require('../services/conversationalAIService');
const jwt = require('jsonwebtoken');

/**
 * @desc    Full Conversational AI Assistant (ChatGPT-like natural dialogue + DisasterChain actions)
 * @route   POST /api/ai/conversational-chat
 * @access  Public / Optional Auth
 */
exports.handleConversationalAIChat = async (req, res) => {
  try {
    const { message, conversation, latitude, longitude, language } = req.body;

    // 1. Message Validation
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Message is required and cannot be empty.',
      });
    }

    if (message.length > 1200) {
      return res.status(400).json({
        success: false,
        message: 'Message exceeds maximum length of 1200 characters.',
      });
    }

    // 2. Resolve User Role from optional token
    let userRole = 'citizen';
    if (req.headers && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      const token = req.headers.authorization.split(' ')[1];
      if (token) {
        try {
          const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET || 'disasterchain_secure_jwt_secret_2026'
          );
          userRole = decoded.role || 'citizen';
        } catch (e) {
          // Token invalid: safely proceed as public citizen
        }
      }
    }

    // 3. Coordinate validation
    let validLat = null;
    let validLon = null;
    if (latitude != null && !isNaN(Number(latitude))) {
      const lat = Number(latitude);
      if (lat >= -90 && lat <= 90) validLat = lat;
    }
    if (longitude != null && !isNaN(Number(longitude))) {
      const lon = Number(longitude);
      if (lon >= -180 && lon <= 180) validLon = lon;
    }

    // 4. Sanitize conversation history (up to last 10 turns)
    let cleanConversation = [];
    if (Array.isArray(conversation)) {
      cleanConversation = conversation
        .filter((c) => c && typeof c === 'object' && c.role && c.content)
        .slice(-10);
    }

    // 5. Language validation
    const SUPPORTED_LANG_CODES = [
      'en', 'hi', 'pa', 'bn', 'ta', 'te', 'mr', 'gu', 'kn', 'ml',
      'or', 'as', 'ur', 'sa', 'ne', 'kok', 'ks', 'mai', 'sd', 'mni'
    ];
    let selectedLanguage = 'en';
    if (language && typeof language === 'string') {
      const code = language.trim().toLowerCase();
      if (SUPPORTED_LANG_CODES.includes(code)) {
        selectedLanguage = code;
      }
    }

    // 6. Process through Conversational AI Engine
    const result = await processConversationalChat({
      message: message.trim(),
      conversation: cleanConversation,
      latitude: validLat,
      longitude: validLon,
      location: req.body.location && typeof req.body.location === 'string' ? req.body.location.trim() : null,
      language: selectedLanguage,
      userRole,
    });

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('[ConversationalAI] Controller Error:', error);
    return res.status(500).json({
      success: false,
      message: 'The Conversational AI Assistant encountered an unexpected disruption. Please try again.',
    });
  }
};
