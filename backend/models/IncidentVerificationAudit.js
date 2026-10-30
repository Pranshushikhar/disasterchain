const mongoose = require('mongoose');

const incidentVerificationAuditSchema = new mongoose.Schema({
  auditId: {
    type: String,
    required: true,
    unique: true,
    default: () => `AUD-${Math.floor(1000 + Math.random() * 9000)}`,
  },
  incidentId: {
    type: String,
    required: true,
    index: true,
  },
  adminId: {
    type: String,
    required: true,
  },
  adminName: {
    type: String,
    required: true,
  },
  adminEmail: {
    type: String,
    default: '',
  },
  action: {
    type: String,
    required: true,
    enum: [
      'VERIFY',
      'REQUEST_EVIDENCE',
      'MARK_DISPUTED',
      'REJECT',
      'MERGE',
      'ESCALATE',
      'ADD_NOTE',
      'REOPEN',
    ],
  },
  previousStatus: {
    type: String,
    default: '',
  },
  newStatus: {
    type: String,
    default: '',
  },
  reason: {
    type: String,
    required: true,
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('IncidentVerificationAudit', incidentVerificationAuditSchema);
