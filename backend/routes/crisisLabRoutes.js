const express = require('express');
const router = express.Router();
const {
  getScenarios,
  askAdvisor,
  evaluateWhatIf,
  generateAfterActionReport,
} = require('../controllers/crisisLabController');

// GET /api/crisis-lab/scenarios - Load all scenarios and baseline infrastructure
router.get('/scenarios', getScenarios);

// POST /api/crisis-lab/advisor - Ask AI Command Advisor with live state
router.post('/advisor', askAdvisor);

// POST /api/crisis-lab/what-if - Run what-if contingency simulation
router.post('/what-if', evaluateWhatIf);

// POST /api/crisis-lab/after-action-report - Generate explainable AAR and score
router.post('/after-action-report', generateAfterActionReport);

module.exports = router;
