const express = require('express');
const router = express.Router();
const { seedDatabase } = require('../controllers/seedController');
const { protect, authorizeAdmin } = require('../middleware/auth');

// Guard seeder: Allow in development/test, or require admin credentials/SEED_KEY in production
const seedAuthGuard = (req, res, next) => {
  const isDev = process.env.NODE_ENV !== 'production';
  const seedKey = req.headers['x-seed-key'] || req.query.seedKey;
  if (isDev) {
    return next();
  }
  if (process.env.SEED_KEY && seedKey && seedKey === process.env.SEED_KEY) {
    return next();
  }
  // Otherwise require verified admin authentication
  return protect(req, res, () => {
    return authorizeAdmin(req, res, next);
  });
};

router.post('/', seedAuthGuard, seedDatabase);
router.get('/', seedAuthGuard, seedDatabase);

module.exports = router;
