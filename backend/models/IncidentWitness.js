const mongoose = require('mongoose');

const incidentWitnessSchema = new mongoose.Schema({
  witnessId: {
    type: String,
    required: true,
    unique: true,
    default: () => `WIT-${Math.floor(1000 + Math.random() * 9000)}`,
  },
  incidentId: {
    type: String,
    required: true,
    index: true,
  },
  userId: {
    type: String,
    default: null,
  },
  userName: {
    type: String,
    default: 'Nearby Civilian Witness',
  },
  witnessType: {
    type: String,
    required: true,
    enum: ['CONFIRM', 'DISPUTE'],
  },
  statement: {
    type: String,
    default: '',
    trim: true,
  },
  mediaUrls: [{
    type: String,
  }],
  // Approximate distance (e.g. 0.4 km) - exact coords never stored or exposed to protect privacy
  approximateDistanceKm: {
    type: Number,
    default: null,
  },
  hasLocationPermission: {
    type: Boolean,
    default: false,
  },
  clientIpHash: {
    type: String,
    default: '',
  },
  deviceFingerprint: {
    type: String,
    default: '',
  },
  isOriginalReporter: {
    type: Boolean,
    default: false,
  },
  isSuspicious: {
    type: Boolean,
    default: false,
  },
  suspicionReason: {
    type: String,
    default: '',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('IncidentWitness', incidentWitnessSchema);
