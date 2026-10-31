const express = require('express');
const router = express.Router();
const {
  getBlockchainTransactions,
  getBlockchainTransactionById,
  getBlockchainStats,
  verifyBlockchainIntegrity,
  recordManualTransaction,
} = require('../controllers/blockchainController');
const { protect, authorizeAdmin } = require('../middleware/auth');

router.route('/stats')
  .get(getBlockchainStats);

router.route('/verify/:id')
  .get(verifyBlockchainIntegrity);

router.route('/transactions')
  .get(getBlockchainTransactions);

router.route('/transactions/:id')
  .get(getBlockchainTransactionById);

router.route('/record')
  .post(protect, authorizeAdmin, recordManualTransaction);

module.exports = router;
