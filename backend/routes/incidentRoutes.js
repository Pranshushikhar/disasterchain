const express = require('express');
const router = express.Router();
const {
  getIncidents,
  getIncidentById,
  createIncident,
  updateIncidentStatus,
  deleteIncident,
} = require('../controllers/incidentController');
const {
  submitWitnessVerification,
  getIncidentWitnesses,
  checkDuplicates,
  analyzeMedia,
  getIncidentTrustScore,
  adminVerifyIncident,
  adminDisputeIncident,
  adminRejectIncident,
  adminRequestEvidence,
  adminMergeDuplicates,
  adminEscalateIncident,
  adminReopenIncident,
  getAdminVerificationStats,
} = require('../controllers/incidentVerificationController');
const { protect, authorize, authorizeAdmin, optionalAuth } = require('../middleware/auth');

// --- Pre-creation & Analysis routes ---
router.post('/check-duplicates', checkDuplicates);
router.post('/analyze-media', analyzeMedia);

// --- Admin Verification Overview Statistics ---
router.get('/admin/verification-stats', protect, authorizeAdmin, getAdminVerificationStats);

// --- Base CRUD routes ---
router.route('/')
  .get(getIncidents)
  .post(optionalAuth, createIncident);

router.route('/:id')
  .get(getIncidentById)
  .delete(protect, authorizeAdmin, deleteIncident);

router.route('/:id/status')
  .put(protect, authorize('admin', 'responder'), updateIncidentStatus);

// --- Witness Verification routes ---
router.post('/:id/witness', optionalAuth, submitWitnessVerification);
router.get('/:id/witnesses', getIncidentWitnesses);

// --- Trust Score Breakdown route ---
router.get('/:id/trust-score', getIncidentTrustScore);

// --- Administrative Verification Decisions (RBAC Protected: Admin Only) ---
router.post('/:id/admin/verify', protect, authorizeAdmin, adminVerifyIncident);
router.post('/:id/admin/dispute', protect, authorizeAdmin, adminDisputeIncident);
router.post('/:id/admin/reject', protect, authorizeAdmin, adminRejectIncident);
router.post('/:id/admin/request-evidence', protect, authorizeAdmin, adminRequestEvidence);
router.post('/:id/admin/merge', protect, authorizeAdmin, adminMergeDuplicates);
router.post('/:id/admin/escalate', protect, authorizeAdmin, adminEscalateIncident);
router.post('/:id/admin/reopen', protect, authorizeAdmin, adminReopenIncident);

module.exports = router;
