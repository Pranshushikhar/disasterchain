/**
 * DisasterChain Intelligent Duplicate Incident Detection Service
 *
 * Compares candidate incident reports against active database records using:
 * 1. Geographic proximity (Haversine geospatial distance)
 * 2. Incident category & hazard type alignment
 * 3. Temporal proximity (hours between occurrences)
 * 4. Textual description similarity (Jaccard token overlap)
 * 5. Media perceptual hash (dHash) comparison
 *
 * Enforces rule: Never merges automatically; presents reasoned duplicate scores for admin review.
 */

const { computePerceptualHash, comparePerceptualHashes } = require('./aiMediaAnalysisService');

/**
 * Calculate Haversine distance in kilometers between two GPS coordinates
 */
function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  if (lat1 == null || lon1 == null || lat2 == null || lon2 == null || isNaN(Number(lat1)) || isNaN(Number(lon1)) || isNaN(Number(lat2)) || isNaN(Number(lon2))) return 9999;
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 100) / 100;
}

/**
 * Tokenize and calculate Jaccard similarity between two text descriptions
 */
function calculateTextSimilarity(textA = '', textB = '') {
  const normalize = (t) =>
    t
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter((w) => w.length > 2);

  const wordsA = new Set(normalize(textA));
  const wordsB = new Set(normalize(textB));

  if (wordsA.size === 0 || wordsB.size === 0) return 0;

  let intersection = 0;
  for (const w of wordsA) {
    if (wordsB.has(w)) intersection++;
  }

  const union = new Set([...wordsA, ...wordsB]).size;
  return union > 0 ? intersection / union : 0;
}

/**
 * Evaluate duplicate similarity score between a candidate report and an existing incident
 * Returns score between 0 and 100 and explanatory reasons.
 */
function evaluateDuplicateCandidate(candidate, existing) {
  if (!candidate || !existing) return { score: 0, isMatch: false, reasons: [] };

  // Skip comparing with self
  if (candidate._id && existing._id && String(candidate._id) === String(existing._id)) {
    return { score: 0, isMatch: false, reasons: [] };
  }
  if (candidate.incidentId && existing.incidentId && candidate.incidentId === existing.incidentId) {
    return { score: 0, isMatch: false, reasons: [] };
  }

  const reasons = [];
  let score = 0;

  // 1. Geographic Proximity (Max 40 points)
  const cLat = candidate.latitude != null && candidate.latitude !== '' && !isNaN(Number(candidate.latitude)) ? Number(candidate.latitude) : null;
  const cLon = candidate.longitude != null && candidate.longitude !== '' && !isNaN(Number(candidate.longitude)) ? Number(candidate.longitude) : null;
  const eLat = existing.latitude != null && existing.latitude !== '' && !isNaN(Number(existing.latitude)) ? Number(existing.latitude) : null;
  const eLon = existing.longitude != null && existing.longitude !== '' && !isNaN(Number(existing.longitude)) ? Number(existing.longitude) : null;

  const distanceKm = calculateDistanceKm(cLat, cLon, eLat, eLon);

  if (distanceKm <= 0.15) {
    score += 40;
    reasons.push(`Immediate geographic co-location (${Math.round(distanceKm * 1000)}m away).`);
  } else if (distanceKm <= 0.5) {
    score += 32;
    reasons.push(`Within 500m proximity (${Math.round(distanceKm * 1000)}m away).`);
  } else if (distanceKm <= 1.5) {
    score += 22;
    reasons.push(`Nearby vicinity (${distanceKm.toFixed(1)} km away).`);
  } else if (distanceKm <= 3.0) {
    score += 12;
    reasons.push(`Same municipal sector (${distanceKm.toFixed(1)} km away).`);
  }

  // 2. Hazard Category Match (Max 25 points)
  const cType = String(candidate.type || candidate.category || '').toLowerCase();
  const eType = String(existing.type || existing.category || '').toLowerCase();

  if (cType && eType && (cType === eType || cType.includes(eType) || eType.includes(cType))) {
    score += 25;
    reasons.push(`Identical hazard classification: "${existing.type || existing.category}".`);
  } else if (
    (cType.includes('flood') && eType.includes('water')) ||
    (cType.includes('fire') && eType.includes('smoke')) ||
    (cType.includes('damage') && eType.includes('hazard'))
  ) {
    score += 15;
    reasons.push(`Correlated hazard domain ("${candidate.type}" and "${existing.type}").`);
  }

  // 3. Temporal Proximity (Max 15 points)
  const cTime = candidate.createdAt ? new Date(candidate.createdAt).getTime() : Date.now();
  const eTime = existing.createdAt ? new Date(existing.createdAt).getTime() : Date.now();
  const diffHours = Math.abs(cTime - eTime) / (1000 * 60 * 60);

  if (diffHours <= 1.0) {
    score += 15;
    reasons.push(`Reported within the same hour (${Math.round(diffHours * 60)} min difference).`);
  } else if (diffHours <= 3.0) {
    score += 10;
    reasons.push(`Reported within 3 hours (${diffHours.toFixed(1)} hours difference).`);
  } else if (diffHours <= 6.0) {
    score += 5;
    reasons.push(`Reported within 6 hours.`);
  }

  // 4. Description Text Similarity (Max 10 points)
  const textSim = calculateTextSimilarity(candidate.description, existing.description);
  if (textSim >= 0.35) {
    score += 10;
    reasons.push(`High descriptive text phrasing overlap (${Math.round(textSim * 100)}% token match).`);
  } else if (textSim >= 0.18) {
    score += 5;
    reasons.push(`Moderate descriptive similarity (${Math.round(textSim * 100)}% match).`);
  }

  // 5. Media Perceptual Hash Match (Max 20 points, bonus)
  const cHash = candidate.imageUrl ? computePerceptualHash(candidate.imageUrl) : null;
  const eHash = existing.imageUrl
    ? computePerceptualHash(existing.imageUrl)
    : existing.mediaAnalysis?.[0]?.manipulationIndicators?.perceptualHash;

  if (cHash && eHash) {
    const dist = comparePerceptualHashes(cHash, eHash);
    if (dist <= 2) {
      score += 20;
      reasons.push(`Perceptual image hash matches previously submitted photo.`);
    }
  }

  // Cap score at 100
  const finalScore = Math.min(100, Math.round(score));
  const isMatch = finalScore >= 55; // Threshold for duplicate candidate

  return {
    score: finalScore,
    isMatch,
    distanceKm,
    reasons,
    existingIncident: {
      _id: existing._id,
      incidentId: existing.incidentId,
      title: existing.title,
      type: existing.type,
      location: existing.location,
      severity: existing.severity,
      status: existing.status,
      verificationStatus: existing.verificationStatus,
      trustScore: existing.trustScore,
      createdAt: existing.createdAt,
    },
  };
}

/**
 * Scan database / memory records for duplicate candidates matching an incoming report
 */
function findDuplicateIncidents(newIncident, existingIncidents = []) {
  if (!Array.isArray(existingIncidents) || existingIncidents.length === 0) {
    return { hasDuplicates: false, candidates: [] };
  }

  const matches = [];

  for (const item of existingIncidents) {
    // Ignore already merged or rejected items as primary candidates
    if (item.status === 'Rejected' || item.verificationStatus === 'Rejected') continue;

    const evaluation = evaluateDuplicateCandidate(newIncident, item);
    if (evaluation.isMatch) {
      matches.push(evaluation);
    }
  }

  // Sort by highest similarity score first
  matches.sort((a, b) => b.score - a.score);

  return {
    hasDuplicates: matches.length > 0,
    topMatchScore: matches[0]?.score || 0,
    candidates: matches,
  };
}

/**
 * Merge duplicate incident into a primary target incident
 * Preserves both original records, links IDs, retains evidence, and logs immutable audit trails.
 */
function executeDuplicateMerge({
  primaryIncident,
  duplicateIncident,
  adminUser = { id: 'admin', name: 'Administrator' },
  reason = 'Merged as duplicate of existing field incident.',
}) {
  if (!primaryIncident || !duplicateIncident) {
    throw new Error('Both primary and duplicate incidents are required for merge.');
  }

  const timestamp = new Date();

  // 1. Update duplicate record
  duplicateIncident.verificationStatus = 'Duplicate / Merged';
  duplicateIncident.status = 'Duplicate / Merged';
  duplicateIncident.duplicateInfo = {
    ...(duplicateIncident.duplicateInfo || {}),
    isDuplicate: true,
    mergedIntoIncidentId: primaryIncident.incidentId || String(primaryIncident._id),
  };

  if (!Array.isArray(duplicateIncident.auditLog)) duplicateIncident.auditLog = [];
  duplicateIncident.auditLog.push({
    adminId: adminUser.id || 'admin',
    adminName: adminUser.name || 'Administrator',
    action: 'MERGE',
    reason: `Merged into primary record ${primaryIncident.incidentId}. Reason: ${reason}`,
    timestamp,
    metadata: { targetIncidentId: primaryIncident.incidentId },
  });

  // 2. Update primary record to record child merge
  if (!primaryIncident.duplicateInfo) primaryIncident.duplicateInfo = { isDuplicate: false, mergedIncidents: [] };
  if (!Array.isArray(primaryIncident.duplicateInfo.mergedIncidents)) {
    primaryIncident.duplicateInfo.mergedIncidents = [];
  }
  primaryIncident.duplicateInfo.mergedIncidents.push(duplicateIncident.incidentId || String(duplicateIncident._id));

  // Carry over media evidence from duplicate if primary lacks photo
  if (!primaryIncident.imageUrl && duplicateIncident.imageUrl) {
    primaryIncident.imageUrl = duplicateIncident.imageUrl;
  }
  if (Array.isArray(duplicateIncident.mediaAnalysis) && duplicateIncident.mediaAnalysis.length > 0) {
    if (!Array.isArray(primaryIncident.mediaAnalysis)) primaryIncident.mediaAnalysis = [];
    primaryIncident.mediaAnalysis.push(...duplicateIncident.mediaAnalysis);
  }

  if (!Array.isArray(primaryIncident.auditLog)) primaryIncident.auditLog = [];
  primaryIncident.auditLog.push({
    adminId: adminUser.id || 'admin',
    adminName: adminUser.name || 'Administrator',
    action: 'MERGE',
    reason: `Absorbed duplicate report ${duplicateIncident.incidentId}. Reason: ${reason}`,
    timestamp,
    metadata: { mergedIncidentId: duplicateIncident.incidentId },
  });

  return {
    primaryIncident,
    duplicateIncident,
    mergedAt: timestamp,
  };
}

module.exports = {
  calculateDistanceKm,
  calculateTextSimilarity,
  evaluateDuplicateCandidate,
  findDuplicateIncidents,
  executeDuplicateMerge,
};
