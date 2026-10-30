const express = require('express');
const router = express.Router();
const {
  getProgress,
  saveLessonProgress,
  submitQuiz
} = require('../controllers/academyController');
const { optionalAuth } = require('../middleware/auth');

router.use(optionalAuth);

// GET user progress & streak
router.get('/progress', getProgress);

// POST record completed lesson
router.post('/lesson-complete', saveLessonProgress);

// POST submit end-of-course quiz
router.post('/quiz-submit', submitQuiz);

module.exports = router;
