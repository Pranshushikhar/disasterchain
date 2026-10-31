/**
 * DisasterChain Incident Trust & Verification Controller
 * Handles:
 * - Nearby witness confirmations & disputes (with privacy-preserving approximate distance checks)
 * - Intelligent duplicate detection check and administrative duplicate merging
 * - AI media authenticity & synthetic artifact analysis
 * - Incident trust score calculation and AI evidence synthesis
 * - Administrative verification actions with immutable audit trail logging
 */

const mongoose = require('mongoose');
const Incident = require('../models/Incident');
const IncidentWitness = require('../models/IncidentWitness');
const IncidentVerificationAudit = require('../models/IncidentVerificationAudit');
const Alert = require('../models/Alert');
const memoryStore = require('../config/memoryStore');
const blockchainService = require('../services/blockchainService');
const { analyzeIncidentMedia, computePerceptualHash } = require('../services/aiMediaAnalysisService');
const {
  calculateDistanceKm,
  findDuplicateIncidents,
  executeDuplicateMerge,
} = require('../services/duplicateDetectionService');
const { calculateTrustScore, sanitizeWitnessConfirmations } = require('../services/incidentTrustService');

const isDbConnected = () => mongoose.connection.readyState === 1;

/**
 * Helper to find an incident by ID or incidentId across DB and memoryStore
 */
async function findIncident(id) {
  if (isDbConnected()) {
    const query = mongoose.isValidObjectId(id) ? { $or: [{ _id: id }, { incidentId: id }] } : { incidentId: id };
    const incident = await Incident.findOne(query);
    if (incident) return incident;
  }
  return memoryStore.incidents.find((i) => i.incidentId === id || String(i._id) === id);
}

/**
 * Helper to fetch all witnesses for an incident
 */
async function fetchWitnesses(incidentId) {
  if (isDbConnected()) {
    return await IncidentWitness.find({ incidentId }).sort({ createdAt: -1 });
  }
  return memoryStore.incidentWitnesses.filter((w) => w.incidentId === incidentId);
}

/**
 * Helper to fetch official alerts
 */
async function fetchOfficialAlerts() {
  if (isDbConnected()) {
    return await Alert.find({}).sort({ createdAt: -1 });
  }
  return memoryStore.alerts || [];
}

// =========================================================================
// 1. NEARBY WITNESS CONFIRMATION & DISPUTE
// =========================================================================

// @desc    Submit witness confirmation or dispute
// @route   POST /api/incidents/:id/witness
// @access  Public / Civilian / Volunteer
exports.submitWitnessVerification = async (req, res) => {
  try {
    const { id } = req.params;
    const rawType = (req.body.witnessType || req.body.verificationType || '').toString().toUpperCase();
    const witnessType = rawType.includes('DISPUT')
      ? 'DISPUTE'
      : (rawType.includes('CONFIRM') || rawType.includes('WITNESS') ? 'CONFIRM' : null);

    const {
      statement = '',
      latitude,
      longitude,
      hasLocationPermission = false,
      userName = 'Nearby Civilian Witness',
      deviceFingerprint = '',
    } = req.body;

    const mediaUrls = Array.isArray(req.body.mediaUrls)
      ? req.body.mediaUrls
      : (req.body.evidenceUrl ? [req.body.evidenceUrl] : []);

    if (!witnessType) {
      return res.status(400).json({
        success: false,
        message: 'Valid witnessType required: "CONFIRM" (I witnessed this) or "DISPUTE" (I cannot confirm this).',
      });
    }

    const incident = await findIncident(id);
    if (!incident) {
      return res.status(404).json({ success: false, message: 'Incident not found' });
    }

    const currentUserId = req.user ? String(req.user.id || req.user._id) : (req.body.userId || `guest-wit-${Date.now()}`);
    const resolvedUserName = req.user ? req.user.name : userName;

    // RULE 1: Never allow original reporter to confirm their own incident
    const reporterId = incident.reportedBy ? String(incident.reportedBy) : null;
    const reporterName = incident.reporterName ? incident.reporterName.toLowerCase() : '';
    if (
      (reporterId && currentUserId === reporterId) ||
      (reporterName && resolvedUserName.toLowerCase() === reporterName)
    ) {
      return res.status(400).json({
        success: false,
        message: 'The original reporter cannot act as an independent witness for their own report.',
      });
    }

    // RULE 2: Calculate approximate proximity without storing exact witness coordinates
    let approximateDistanceKm = null;
    if (hasLocationPermission && latitude !== undefined && longitude !== undefined) {
      approximateDistanceKm = calculateDistanceKm(
        Number(latitude),
        Number(longitude),
        Number(incident.latitude || 28.6139),
        Number(incident.longitude || 77.2090)
      );
    }

    // IP Hash for anti-sybil bot burst checks
    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
    const clientIpHash = require('crypto').createHash('md5').update(clientIp).digest('hex').substring(0, 8);

    const witnessRecord = {
      witnessId: `WIT-${Math.floor(1000 + Math.random() * 9000)}`,
      incidentId: incident.incidentId || String(incident._id),
      userId: currentUserId,
      userName: resolvedUserName,
      witnessType,
      statement: statement.trim(),
      mediaUrls: Array.isArray(mediaUrls) ? mediaUrls : [],
      approximateDistanceKm,
      hasLocationPermission: Boolean(hasLocationPermission),
      clientIpHash,
      deviceFingerprint,
      isOriginalReporter: false,
      isSuspicious: false,
      createdAt: new Date(),
    };

    if (isDbConnected()) {
      await IncidentWitness.create(witnessRecord);
    } else {
      witnessRecord._id = `wit-${Date.now()}`;
      memoryStore.incidentWitnesses.unshift(witnessRecord);
    }

    // Re-evaluate Incident Trust Score & Community Status
    const allWitnesses = await fetchWitnesses(incident.incidentId || String(incident._id));
    const officialAlerts = await fetchOfficialAlerts();
    const evaluation = calculateTrustScore({
      incident,
      witnesses: allWitnesses,
      officialAlerts,
    });

    // Update incident fields
    incident.trustScore = evaluation.trustScore;
    incident.trustLevel = evaluation.trustLevel;
    incident.trustScoreBreakdown = evaluation.trustScoreBreakdown;
    incident.aiEvidenceSummary = evaluation.aiEvidenceSummary;
    incident.witnessStats = evaluation.witnessStats;

    // Automatic Community Status Promotion:
    // If not officially verified or rejected, promote to Community Corroborated when 3+ confirms and 0 disputes
    if (
      incident.verificationStatus !== 'Officially Verified' &&
      incident.verificationStatus !== 'Rejected' &&
      incident.verificationStatus !== 'Duplicate / Merged'
    ) {
      if (evaluation.witnessStats.confirmedCount >= 3 && evaluation.witnessStats.disputedCount === 0) {
        incident.verificationStatus = 'Community Corroborated';
        incident.status = 'Community Corroborated';
      } else if (evaluation.witnessStats.disputedCount > evaluation.witnessStats.confirmedCount) {
        incident.verificationStatus = 'Disputed';
        incident.status = 'Disputed';
      }
    }

    // Append to audit log
    if (!Array.isArray(incident.auditLog)) incident.auditLog = [];
    incident.auditLog.push({
      adminId: currentUserId,
      adminName: resolvedUserName,
      action: witnessType === 'CONFIRM' ? 'WITNESS_CONFIRMED' : 'WITNESS_DISPUTED',
      reason: statement || `Civic witness ${witnessType.toLowerCase()}ed observation of incident.`,
      timestamp: new Date(),
      metadata: { approximateDistanceKm },
    });

    if (isDbConnected()) {
      await incident.save();
    }

    return res.status(201).json({
      success: true,
      message: witnessType === 'CONFIRM' ? 'Incident witnessed and confirmed.' : 'Incident dispute recorded.',
      data: {
        witnessRecord: {
          witnessId: witnessRecord.witnessId,
          userName: witnessRecord.userName,
          witnessType: witnessRecord.witnessType,
          statement: witnessRecord.statement,
          approximateDistanceKm: witnessRecord.approximateDistanceKm,
          createdAt: witnessRecord.createdAt,
        },
        incidentStats: incident.witnessStats,
        trustScore: incident.trustScore,
        trustLevel: incident.trustLevel,
        verificationStatus: incident.verificationStatus,
      },
    });
  } catch (err) {
    console.error('Witness verification error:', err);
    res.status(500).json({ success: false, message: err.message || 'Server error processing witness confirmation' });
  }
};

// @desc    Get anonymized witness confirmations for an incident
// @route   GET /api/incidents/:id/witnesses
// @access  Public
exports.getIncidentWitnesses = async (req, res) => {
  try {
    const { id } = req.params;
    const incident = await findIncident(id);
    if (!incident) {
      return res.status(404).json({ success: false, message: 'Incident not found' });
    }

    const witnesses = await fetchWitnesses(incident.incidentId || String(incident._id));

    // Sanitize to protect private exact locations
    const sanitized = witnesses.map((w) => ({
      witnessId: w.witnessId,
      userName: w.userName,
      witnessType: w.witnessType,
      statement: w.statement,
      approximateDistanceKm: w.approximateDistanceKm,
      hasEvidence: Boolean(w.mediaUrls && w.mediaUrls.length > 0),
      mediaUrls: w.mediaUrls || [],
      createdAt: w.createdAt,
    }));

    return res.json({
      success: true,
      count: sanitized.length,
      confirmedCount: sanitized.filter((w) => w.witnessType === 'CONFIRM').length,
      disputedCount: sanitized.filter((w) => w.witnessType === 'DISPUTE').length,
      data: sanitized,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error retrieving witness confirmations' });
  }
};

// =========================================================================
// 2. INTELLIGENT DUPLICATE DETECTION
// =========================================================================

// @desc    Check draft incident for potential duplicate matches before creating
// @route   POST /api/incidents/check-duplicates
// @access  Public
exports.checkDuplicates = async (req, res) => {
  try {
    const { title, type, category, description, location, latitude, longitude, imageUrl } = req.body;

    const draftIncident = {
      title,
      type: type || category,
      description,
      location,
      latitude: Number(latitude) || 28.6139,
      longitude: Number(longitude) || 77.2090,
      imageUrl,
      createdAt: new Date(),
    };

    let existingList = [];
    if (isDbConnected()) {
      existingList = await Incident.find({}).sort({ createdAt: -1 }).limit(100);
    } else {
      existingList = memoryStore.incidents;
    }

    const duplicateResult = findDuplicateIncidents(draftIncident, existingList);

    const candidates = duplicateResult.candidates.map((c) => ({
      ...c.existingIncident,
      score: c.score,
      distanceKm: c.distanceKm,
      reasons: c.reasons,
      matchReason: c.reasons.join(', '),
      similarityPercentage: Math.round(c.score * 100),
      incident: c.existingIncident,
    }));

    return res.json({
      success: true,
      hasDuplicates: duplicateResult.hasDuplicates,
      topMatchScore: duplicateResult.topMatchScore,
      candidates,
      duplicates: candidates,
    });
  } catch (err) {
    console.error('Duplicate check error:', err);
    res.status(500).json({ success: false, message: 'Error checking duplicate incidents' });
  }
};

// =========================================================================
// 3. AI MEDIA AUTHENTICITY ANALYSIS
// =========================================================================

// @desc    Analyze media for synthetic artifacts, EXIF, and hazard relevance
// @route   POST /api/incidents/analyze-media
// @access  Public
exports.analyzeMedia = async (req, res) => {
  try {
    const { url, mediaType, category, description, latitude, longitude, exif } = req.body;

    if (!url) {
      return res.status(400).json({ success: false, message: 'Media URL or data URI required for analysis' });
    }

    let existingMediaHashes = [];
    const allIncidents = isDbConnected() ? await Incident.find({}) : memoryStore.incidents;
    for (const inc of allIncidents) {
      if (inc.imageUrl) {
        existingMediaHashes.push({
          incidentId: inc.incidentId,
          hash: computePerceptualHash(inc.imageUrl),
        });
      }
    }

    const analysis = await analyzeIncidentMedia({
      url,
      mediaType: mediaType || 'image',
      category: category || 'Disaster Hazard',
      description: description || '',
      latitude: Number(latitude) || 28.6139,
      longitude: Number(longitude) || 77.2090,
      existingMediaHashes,
      exif,
    });

    return res.json({
      success: true,
      data: analysis,
    });
  } catch (err) {
    console.error('Media analysis error:', err);
    res.status(500).json({ success: false, message: 'Error analyzing media authenticity' });
  }
};

// =========================================================================
// 4. INCIDENT TRUST SCORE & EVIDENCE ASSESSMENT
// =========================================================================

// @desc    Get detailed explainable trust score breakdown
// @route   GET /api/incidents/:id/trust-score
// @access  Public
exports.getIncidentTrustScore = async (req, res) => {
  try {
    const { id } = req.params;
    const incident = await findIncident(id);
    if (!incident) {
      return res.status(404).json({ success: false, message: 'Incident not found' });
    }

    const witnesses = await fetchWitnesses(incident.incidentId || String(incident._id));
    const officialAlerts = await fetchOfficialAlerts();

    const evaluation = calculateTrustScore({
      incident,
      witnesses,
      officialAlerts,
    });

    return res.json({
      success: true,
      data: {
        incidentId: incident.incidentId,
        trustScore: evaluation.trustScore,
        trustLevel: evaluation.trustLevel,
        trustScoreBreakdown: evaluation.trustScoreBreakdown,
        aiEvidenceSummary: evaluation.aiEvidenceSummary,
        witnessStats: evaluation.witnessStats,
        officialAlertMatch: evaluation.officialAlertMatch,
        auditHistory: incident.auditLog || [],
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error computing incident trust score' });
  }
};

// =========================================================================
// 5. ADMINISTRATIVE VERIFICATION ACTIONS (ROLE-BASED: ADMIN ONLY)
// =========================================================================

// Helper for admin verification actions
async function handleAdminVerificationAction({ req, res, action, newStatus, defaultReason }) {
  const { id } = req.params;
  const { reason = defaultReason, notes = '', metadata = {} } = req.body;

  if (action === 'REJECT' && (!reason || reason.trim().length === 0)) {
    return res.status(400).json({
      success: false,
      message: 'A mandatory reason is required to reject an incident report.',
    });
  }

  const incident = await findIncident(id);
  if (!incident) {
    return res.status(404).json({ success: false, message: 'Incident not found' });
  }

  const adminId = req.user ? String(req.user.id || req.user._id) : 'admin-master';
  const adminName = req.user ? req.user.name : 'Chief Disaster Officer';
  const adminEmail = req.user ? req.user.email : 'admin@disasterchain.org';
  const timestamp = new Date();
  const previousStatus = incident.verificationStatus || incident.status || 'Received';

  // Update status if applicable
  if (newStatus) {
    incident.verificationStatus = newStatus;
    incident.status = newStatus;
  }

  // When action is VERIFY, mint cryptographic blockchain block
  if (action === 'VERIFY') {
    try {
      const block = await blockchainService.recordTransaction({
        entityType: 'IncidentVerification',
        entityId: incident.incidentId || String(incident._id),
        donorOrSource: incident.reporterName || 'Civilian Witness',
        destination: incident.location || 'Emergency Command Verification Node',
        resourceName: `${incident.type || 'Hazard'}: ${incident.title}`,
        quantity: 1,
        unit: 'report',
        status: 'Officially Verified',
      });
      if (block) {
        incident.blockchainTransactionId = block.transactionId;
        incident.blockHash = block.blockHash;
        metadata.blockchainTransactionId = block.transactionId;
        metadata.blockHash = block.blockHash;
        metadata.blockNumber = block.blockNumber;

        if (!isDbConnected() && !memoryStore.blockchainRecords.some((r) => r.transactionId === block.transactionId)) {
          memoryStore.blockchainRecords.unshift(block);
        }
      }
    } catch (bcErr) {
      console.warn('[IncidentVerification] Blockchain mint error:', bcErr);
    }
  }

  // Record in immutable audit log
  const auditEntry = {
    auditId: `AUD-${Math.floor(1000 + Math.random() * 9000)}`,
    incidentId: incident.incidentId || String(incident._id),
    adminId,
    adminName,
    adminEmail,
    action,
    previousStatus,
    newStatus: newStatus || previousStatus,
    reason: reason || defaultReason,
    metadata: { ...metadata, notes },
    timestamp,
  };

  if (!Array.isArray(incident.auditLog)) incident.auditLog = [];
  incident.auditLog.push(auditEntry);

  if (isDbConnected()) {
    await IncidentVerificationAudit.create(auditEntry);
    await incident.save();
  } else {
    memoryStore.incidentAudits.push(auditEntry);
  }

  return res.json({
    success: true,
    message: `Incident verification updated: ${action}`,
    data: {
      incidentId: incident.incidentId,
      verificationStatus: incident.verificationStatus,
      status: incident.status,
      auditLog: incident.auditLog,
    },
  });
}

// @desc    Officially verify an incident report
// @route   POST /api/incidents/:id/admin/verify
// @access  Private / Admin
exports.adminVerifyIncident = async (req, res) => {
  return handleAdminVerificationAction({
    req,
    res,
    action: 'VERIFY',
    newStatus: 'Officially Verified',
    defaultReason: 'Officially verified by disaster command authority based on field evidence and witness corroboration.',
  });
};

// @desc    Mark incident as disputed
// @route   POST /api/incidents/:id/admin/dispute
// @access  Private / Admin
exports.adminDisputeIncident = async (req, res) => {
  return handleAdminVerificationAction({
    req,
    res,
    action: 'MARK_DISPUTED',
    newStatus: 'Disputed',
    defaultReason: 'Marked as disputed due to conflicting witness accounts and negative sensor/field corroboration.',
  });
};

// @desc    Reject incident with mandatory reason
// @route   POST /api/incidents/:id/admin/reject
// @access  Private / Admin
exports.adminRejectIncident = async (req, res) => {
  return handleAdminVerificationAction({
    req,
    res,
    action: 'REJECT',
    newStatus: 'Rejected',
    defaultReason: 'Incident rejected following comprehensive administrative evaluation.',
  });
};

// @desc    Request additional evidence for an incident
// @route   POST /api/incidents/:id/admin/request-evidence
// @access  Private / Admin
exports.adminRequestEvidence = async (req, res) => {
  const { id } = req.params;
  const { note } = req.body;

  if (!note || note.trim().length === 0) {
    return res.status(400).json({ success: false, message: 'Please specify the evidence required.' });
  }

  const incident = await findIncident(id);
  if (!incident) return res.status(404).json({ success: false, message: 'Incident not found' });

  const adminName = req.user ? req.user.name : 'Chief Disaster Officer';
  const adminId = req.user ? String(req.user.id || req.user._id) : 'admin-master';

  const requestRecord = {
    requestId: `EVR-${Math.floor(1000 + Math.random() * 9000)}`,
    requestedBy: adminId,
    requestedByName: adminName,
    note: note.trim(),
    requestedAt: new Date(),
    status: 'Pending',
  };

  if (!Array.isArray(incident.evidenceRequests)) incident.evidenceRequests = [];
  incident.evidenceRequests.push(requestRecord);

  // Set status to Under Verification if it was Received
  if (incident.verificationStatus === 'Received') {
    incident.verificationStatus = 'Under Verification';
    incident.status = 'Under Verification';
  }

  if (!Array.isArray(incident.auditLog)) incident.auditLog = [];
  incident.auditLog.push({
    adminId,
    adminName,
    action: 'REQUEST_EVIDENCE',
    reason: `Additional evidence requested: "${note}"`,
    timestamp: new Date(),
    metadata: { requestId: requestRecord.requestId },
  });

  if (isDbConnected()) await incident.save();

  return res.json({
    success: true,
    message: 'Evidence request broadcast to reporter and community.',
    data: {
      evidenceRequests: incident.evidenceRequests,
      verificationStatus: incident.verificationStatus,
    },
  });
};

// @desc    Merge duplicate incidents (Admin only)
// @route   POST /api/incidents/:id/admin/merge
// @access  Private / Admin
exports.adminMergeDuplicates = async (req, res) => {
  try {
    const { id } = req.params; // Primary incident ID
    const { duplicateIncidentId, reason } = req.body;

    if (!duplicateIncidentId) {
      return res.status(400).json({ success: false, message: 'duplicateIncidentId is required for merge.' });
    }

    const primaryIncident = await findIncident(id);
    const duplicateIncident = await findIncident(duplicateIncidentId);

    if (!primaryIncident || !duplicateIncident) {
      return res.status(404).json({ success: false, message: 'Primary or duplicate incident not found.' });
    }

    const adminUser = req.user || { id: 'admin', name: 'Chief Disaster Officer' };
    const mergeResult = executeDuplicateMerge({
      primaryIncident,
      duplicateIncident,
      adminUser,
      reason: reason || 'Administrative merge of co-located incident reports.',
    });

    if (isDbConnected()) {
      await primaryIncident.save();
      await duplicateIncident.save();
    }

    return res.json({
      success: true,
      message: `Incident ${duplicateIncident.incidentId} merged into primary incident ${primaryIncident.incidentId}.`,
      data: {
        primaryIncidentId: primaryIncident.incidentId,
        mergedIncidentId: duplicateIncident.incidentId,
        mergedAt: mergeResult.mergedAt,
      },
    });
  } catch (err) {
    console.error('Merge error:', err);
    res.status(500).json({ success: false, message: 'Error merging duplicate incidents' });
  }
};

// @desc    Escalate incident to emergency authorities
// @route   POST /api/incidents/:id/admin/escalate
// @access  Private / Admin
exports.adminEscalateIncident = async (req, res) => {
  return handleAdminVerificationAction({
    req,
    res,
    action: 'ESCALATE',
    newStatus: null, // Keep existing status, just log escalation
    defaultReason: 'Escalated to National Disaster Response Force (NDRF) & Municipal Emergency Services.',
  });
};

// @desc    Reopen a previously resolved/rejected/disputed incident
// @route   POST /api/incidents/:id/admin/reopen
// @access  Private / Admin
exports.adminReopenIncident = async (req, res) => {
  return handleAdminVerificationAction({
    req,
    res,
    action: 'REOPEN',
    newStatus: 'Under Verification',
    defaultReason: 'Reopened for active verification review upon receiving new telemetry or community reports.',
  });
};

// @desc    Get dashboard verification overview statistics (Admin cards)
// @route   GET /api/incidents/admin/verification-stats
// @access  Private / Admin
exports.getAdminVerificationStats = async (req, res) => {
  try {
    let incidents = [];
    if (isDbConnected()) {
      incidents = await Incident.find({});
    } else {
      incidents = memoryStore.incidents;
    }

    const totalReported = incidents.length;
    const awaitingVerification = incidents.filter(
      (i) => i.verificationStatus === 'Received' || i.status === 'Pending'
    ).length;
    const underReview = incidents.filter(
      (i) => i.verificationStatus === 'Under Verification' || i.status === 'Under Review'
    ).length;
    const communityCorroborated = incidents.filter(
      (i) => i.verificationStatus === 'Community Corroborated'
    ).length;
    const officiallyVerified = incidents.filter(
      (i) => i.verificationStatus === 'Officially Verified'
    ).length;
    const disputed = incidents.filter(
      (i) => i.verificationStatus === 'Disputed'
    ).length;
    const possibleDuplicates = incidents.filter(
      (i) => i.duplicateInfo?.isDuplicate || i.verificationStatus === 'Duplicate / Merged'
    ).length;
    const urgentReview = incidents.filter(
      (i) => (i.severity === 'Critical' || i.severity === 'High') && i.verificationStatus !== 'Officially Verified' && i.verificationStatus !== 'Rejected'
    ).length;

    return res.json({
      success: true,
      data: {
        totalReported,
        awaitingVerification,
        underReview,
        communityCorroborated,
        officiallyVerified,
        disputed,
        possibleDuplicates,
        urgentReview,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error retrieving verification statistics' });
  }
};
