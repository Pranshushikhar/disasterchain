const mongoose = require('mongoose');
const Incident = require('../models/Incident');
const memoryStore = require('../config/memoryStore');

const isDbConnected = () => mongoose.connection.readyState === 1;

// @desc    Get all incident reports
// @route   GET /api/incidents
// @access  Public
exports.getIncidents = async (req, res) => {
  try {
    const { status, type } = req.query;

    if (isDbConnected()) {
      const query = {};
      if (status) query.status = status;
      if (type) query.type = type;
      const incidents = await Incident.find(query).sort({ createdAt: -1 });
      return res.json({ success: true, count: incidents.length, data: incidents });
    }

    let incidents = memoryStore.incidents;
    if (status) incidents = incidents.filter((i) => i.status === status);
    if (type) incidents = incidents.filter((i) => i.type === type);

    return res.json({ success: true, count: incidents.length, data: incidents });
  } catch (error) {
    return res.json({ success: true, count: memoryStore.incidents.length, data: memoryStore.incidents });
  }
};

// @desc    Get single incident by ID
exports.getIncidentById = async (req, res) => {
  try {
    if (isDbConnected()) {
      const incident = await Incident.findOne({
        $or: [{ incidentId: req.params.id }, { _id: mongoose.isValidObjectId(req.params.id) ? req.params.id : null }],
      });
      if (incident) return res.json({ success: true, data: incident });
    }
    const incident = memoryStore.incidents.find(
      (i) => i.incidentId === req.params.id || i._id === req.params.id
    );
    if (!incident) return res.status(404).json({ success: false, message: 'Incident not found' });
    return res.json({ success: true, data: incident });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error' });
  }
};

// @desc    Create incident report
// @route   POST /api/incidents
// @access  Public
exports.createIncident = async (req, res) => {
  try {
    const { title, type, category, description, location, latitude, longitude, severity, imageUrl, exif } = req.body;

    const resolvedType = type || category;
    if (!title || !resolvedType || !description || !location) {
      return res.status(400).json({ success: false, message: 'Please provide title, hazard type, description, and location' });
    }

    const incidentId = `INC-${Math.floor(1000 + Math.random() * 9000)}`;
    const effectiveLat = Number(latitude) || 28.6139;
    const effectiveLon = Number(longitude) || 77.2090;

    const { analyzeIncidentMedia, computePerceptualHash } = require('../services/aiMediaAnalysisService');
    const { findDuplicateIncidents } = require('../services/duplicateDetectionService');
    const { calculateTrustScore } = require('../services/incidentTrustService');

    // 1. Check for duplicate incident candidates in database or memoryStore
    let existingIncidents = [];
    if (isDbConnected()) {
      existingIncidents = await Incident.find({}).sort({ createdAt: -1 }).limit(100);
    } else {
      existingIncidents = memoryStore.incidents;
    }

    const duplicateCheck = findDuplicateIncidents(
      { title, type: resolvedType, description, latitude: effectiveLat, longitude: effectiveLon, imageUrl },
      existingIncidents
    );

    const isDuplicate = duplicateCheck.hasDuplicates && duplicateCheck.topMatchScore >= 60;
    const duplicateInfo = {
      isDuplicate,
      mergedIntoIncidentId: null,
      mergedIncidents: [],
      duplicateMatchScore: duplicateCheck.topMatchScore || 0,
      matchReasons: duplicateCheck.candidates?.[0]?.reasons || [],
    };

    // 2. Perform AI Media Analysis if image is attached
    const mediaAnalysisList = [];
    if (imageUrl && imageUrl.trim().length > 0) {
      const existingHashes = existingIncidents
        .filter((i) => i.imageUrl)
        .map((i) => ({ incidentId: i.incidentId, hash: computePerceptualHash(i.imageUrl) }));

      const analysis = await analyzeIncidentMedia({
        url: imageUrl,
        category: resolvedType,
        description,
        latitude: effectiveLat,
        longitude: effectiveLon,
        existingMediaHashes: existingHashes,
        exif,
      });
      mediaAnalysisList.push(analysis);
    }

    const reporterName = (req.user && req.user.name) ? req.user.name : (req.body.reporterName || 'Anonymous Student');
    const reportedBy = req.user ? (req.user.id || req.user._id) : null;

    const incidentDraft = {
      incidentId,
      title,
      type: resolvedType,
      description,
      location,
      latitude: effectiveLat,
      longitude: effectiveLon,
      severity: severity || 'Medium',
      imageUrl: imageUrl || '',
      reportedBy,
      reporterName,
      status: 'Received',
      verificationStatus: 'Received',
      duplicateInfo,
      mediaAnalysis: mediaAnalysisList,
      witnessStats: { confirmedCount: 0, disputedCount: 0, lastConfirmedAt: null },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // 3. Compute initial trust score
    const initialTrust = calculateTrustScore({
      incident: incidentDraft,
      witnesses: [],
      officialAlerts: memoryStore.alerts || [],
      duplicateCandidates: duplicateCheck.candidates || [],
    });

    incidentDraft.trustScore = initialTrust.trustScore;
    incidentDraft.trustLevel = initialTrust.trustLevel;
    incidentDraft.trustScoreBreakdown = initialTrust.trustScoreBreakdown;
    incidentDraft.aiEvidenceSummary = initialTrust.aiEvidenceSummary;
    incidentDraft.officialAlertMatch = initialTrust.officialAlertMatch;
    incidentDraft.auditLog = [
      {
        adminId: reportedBy ? String(reportedBy) : 'system',
        adminName: reporterName,
        action: 'REPORT_CREATED',
        reason: 'Initial citizen incident report created and submitted to verification pipeline.',
        timestamp: new Date(),
        metadata: { duplicateCheckScore: duplicateCheck.topMatchScore },
      },
    ];

    if (isDbConnected()) {
      const incident = await Incident.create(incidentDraft);
      return res.status(201).json({
        success: true,
        message: 'Hazard incident reported successfully',
        data: incident,
        duplicateWarning: duplicateCheck.hasDuplicates ? duplicateCheck.candidates[0] : null,
      });
    }

    const memoryIncident = { _id: `inc-${Date.now()}`, ...incidentDraft };
    memoryStore.incidents.unshift(memoryIncident);
    return res.status(201).json({
      success: true,
      message: 'Hazard incident reported (In-Memory)',
      data: memoryIncident,
      duplicateWarning: duplicateCheck.hasDuplicates ? duplicateCheck.candidates[0] : null,
    });
  } catch (error) {
    console.error('Create incident error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error reporting incident' });
  }
};

// @desc    Update incident report status (Admin only)
// @route   PUT /api/incidents/:id/status
// @access  Private / Admin
exports.updateIncidentStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (isDbConnected()) {
      const incident = await Incident.findByIdAndUpdate(req.params.id, { status }, { new: true });
      if (!incident) {
        return res.status(404).json({ success: false, message: 'Incident not found' });
      }
      return res.json({ success: true, message: `Status updated to ${status}`, data: incident });
    }

    const idx = memoryStore.incidents.findIndex((i) => i._id === req.params.id);
    if (idx !== -1) {
      memoryStore.incidents[idx].status = status;
      return res.json({ success: true, message: `Status updated to ${status} (In-Memory)`, data: memoryStore.incidents[idx] });
    }

    res.status(404).json({ success: false, message: 'Incident not found' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error updating incident status' });
  }
};

// @desc    Delete incident (Admin only)
exports.deleteIncident = async (req, res) => {
  try {
    if (isDbConnected()) {
      await Incident.findByIdAndDelete(req.params.id);
      return res.json({ success: true, message: 'Incident deleted' });
    }
    memoryStore.incidents = memoryStore.incidents.filter((i) => i._id !== req.params.id);
    res.json({ success: true, message: 'Incident deleted (In-Memory)' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error' });
  }
};
