const express = require('express');
const router = express.Router();
const { getPresets, analyzeImagery } = require('../controllers/satelliteEyeController');

// GET /api/satellite-eye/presets
router.get('/presets', getPresets);

// POST /api/satellite-eye/analyze
router.post('/analyze', analyzeImagery);

module.exports = router;
