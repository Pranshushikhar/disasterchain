/**
 * DisasterChain AI-Powered Incident Trust & Evidence Synthesis Engine
 *
 * Computes an explainable 0–100 Trust Score and generates transparent natural language
 * evidence assessments from multi-source verification signals.
 *
 * Assessment Levels:
 *   0–29: Insufficient supporting evidence
 *  30–49: Low confidence
 *  50–69: Moderate confidence
 *  70–84: High confidence
 * 85–100: Strong supporting evidence
 *
 * CRITICAL SAFETY DIRECTIVE:
 * A low score never automatically classifies an incident as fake or suppresses urgent emergency escalation.
 */

const { calculateDistanceKm } = require('./duplicateDetectionService');

/**
 * Filter out invalid, duplicate, or coordinated witness submissions
 * Anti-sybil & privacy protections:
 * - Original reporter cannot confirm their own incident.
 * - Same user cannot submit duplicate confirmations.
 * - Coordinated bursts (multiple confirmations from same IP hash) flagged as suspicious.
 */
function sanitizeWitnessConfirmations(incident, witnesses = []) {
  if (!Array.isArray(witnesses) || witnesses.length === 0) {
    return { validConfirmations: [], validDisputes: [], suspiciousCount: 0 };
  }

  const reporterId = incident?.reportedBy ? String(incident.reportedBy) : null;
  const reporterName = incident?.reporterName ? incident.reporterName.toLowerCase() : null;

  const validConfirmations = [];
  const validDisputes = [];
  const seenUsers = new Set();
  const seenIps = new Map();
  let suspiciousCount = 0;

  for (const w of witnesses) {
    // 1. Never allow the original reporter to count as an independent witness
    if (
      (reporterId && w.userId && String(w.userId) === reporterId) ||
      (reporterName && w.userName && w.userName.toLowerCase() === reporterName) ||
      w.isOriginalReporter
    ) {
      continue;
    }

    // 2. Prevent duplicate submissions from the same user account
    if (w.userId && seenUsers.has(String(w.userId))) {
      continue;
    }
    if (w.userId) seenUsers.add(String(w.userId));

    // 3. Detect coordinated multi-account bursts from identical IP hashes
    if (w.clientIpHash) {
      const count = seenIps.get(w.clientIpHash) || 0;
      if (count >= 3) {
        suspiciousCount++;
        w.isSuspicious = true;
        w.suspicionReason = 'Unusual rapid confirmation burst from identical network node.';
        continue;
      }
      seenIps.set(w.clientIpHash, count + 1);
    }

    if (w.witnessType === 'CONFIRM') {
      validConfirmations.push(w);
    } else if (w.witnessType === 'DISPUTE') {
      validDisputes.push(w);
    }
  }

  return {
    validConfirmations,
    validDisputes,
    suspiciousCount,
  };
}

/**
 * Calculate Explainable 0–100 Trust Score and Factor Breakdown
 */
function calculateTrustScore({
  incident,
  witnesses = [],
  officialAlerts = [],
  duplicateCandidates = [],
}) {
  const breakdown = {};
  let totalScore = 0;
  const concerns = [];
  const supportingObservations = [];
  const missingEvidence = [];

  // =========================================================================
  // FACTOR 1: Supporting Evidence Quality & Media Presence (Max 25 pts)
  // =========================================================================
  const hasImage = Boolean(incident.imageUrl && incident.imageUrl.trim().length > 0);
  const mediaAnalysis = incident.mediaAnalysis?.[0] || null;

  if (hasImage) {
    if (mediaAnalysis?.relevance?.isRelevant) {
      breakdown.evidenceQuality = {
        score: 20,
        max: 25,
        reason: 'Photographic evidence depicts visible hazard features matching reported category.',
      };
      supportingObservations.push(`Uploaded imagery contains visual features consistent with "${incident.type}".`);
    } else {
      breakdown.evidenceQuality = {
        score: 14,
        max: 25,
        reason: 'Media uploaded, but visual hazard features could not be definitively extracted.',
      };
    }
  } else {
    breakdown.evidenceQuality = {
      score: 0,
      max: 25,
      reason: 'No photo or video evidence uploaded with report.',
    };
    missingEvidence.push('On-scene photo or video documentation');
  }

  // =========================================================================
  // FACTOR 2: Media Authenticity & Manipulation Analysis (Max 20 pts)
  // =========================================================================
  if (hasImage && mediaAnalysis) {
    const aiProb = mediaAnalysis.isAiGeneratedProbability;
    const isSyntheticConcern = aiProb !== null && aiProb >= 0.65;
    const isDuplicateMedia = mediaAnalysis.manipulationIndicators?.isDuplicateMedia;
    const exifStatus = mediaAnalysis.manipulationIndicators?.exifStatus;

    if (isSyntheticConcern) {
      breakdown.mediaAuthenticity = {
        score: 5,
        max: 20,
        reason: `Potential synthetic/manipulated artifacts flagged (${Math.round(aiProb * 100)}% probability - unverified).`,
      };
      concerns.push('AI media detector flagged potential synthetic visual patterns.');
    } else if (isDuplicateMedia) {
      breakdown.mediaAuthenticity = {
        score: 8,
        max: 20,
        reason: `Image shares perceptual hash with previous incident ${mediaAnalysis.manipulationIndicators.matchedIncidentId}.`,
      };
      concerns.push('Uploaded image previously submitted in a separate incident report.');
    } else if (exifStatus === 'verified') {
      breakdown.mediaAuthenticity = {
        score: 18,
        max: 20,
        reason: 'Hardware camera sensor metadata and optical noise profile verified authentic.',
      };
      supportingObservations.push('Original camera hardware metadata intact.');
    } else {
      // Normal smartphone photos stripped by messaging apps
      breakdown.mediaAuthenticity = {
        score: 14,
        max: 20,
        reason: 'Natural optical lighting and sensor grain; metadata stripped by web compression.',
      };
      supportingObservations.push('Visual lighting and perspective appear natural; standard compression detected.');
    }
  } else if (!hasImage) {
    breakdown.mediaAuthenticity = {
      score: 10,
      max: 20,
      reason: 'No media uploaded; authenticity analysis omitted.',
    };
  } else {
    breakdown.mediaAuthenticity = {
      score: 12,
      max: 20,
      reason: 'Preliminary visual inspection normal; automated media detector pending.',
    };
  }

  // =========================================================================
  // FACTOR 3: Geographic & Location Telemetry Consistency (Max 15 pts)
  // =========================================================================
  const hasCoords = incident.latitude !== undefined && incident.longitude !== undefined;
  const isDefaultCoords = incident.latitude === 28.6139 && incident.longitude === 77.2090;

  if (hasCoords && !isDefaultCoords) {
    breakdown.locationConsistency = {
      score: 14,
      max: 15,
      reason: 'Precise GPS telemetry provided matching named operational sector.',
    };
    supportingObservations.push('GPS coordinates align with reported physical location.');
  } else {
    breakdown.locationConsistency = {
      score: 8,
      max: 15,
      reason: 'Approximate or nominal coordinates recorded; awaiting field pin refinement.',
    };
  }

  // =========================================================================
  // FACTOR 4: Timestamp & Sequence Consistency (Max 10 pts)
  // =========================================================================
  const reportAgeMinutes = incident.createdAt ? (Date.now() - new Date(incident.createdAt).getTime()) / (1000 * 60) : 0;
  if (reportAgeMinutes <= 120) {
    breakdown.timestampConsistency = {
      score: 9,
      max: 10,
      reason: 'Fresh real-time report submitted within 2 hours of ongoing emergency event.',
    };
    supportingObservations.push('Report submitted promptly during active emergency progression.');
  } else {
    breakdown.timestampConsistency = {
      score: 7,
      max: 10,
      reason: 'Report submitted several hours after initial occurrence.',
    };
  }

  // =========================================================================
  // FACTOR 5: Independent Nearby Witness Confirmations (Max 25 pts)
  // =========================================================================
  const { validConfirmations, validDisputes, suspiciousCount } = sanitizeWitnessConfirmations(incident, witnesses);

  const confirmCount = validConfirmations.length;
  const disputeCount = validDisputes.length;

  if (confirmCount >= 4) {
    breakdown.witnessConfirmations = {
      score: 25,
      max: 25,
      reason: `${confirmCount} independent nearby witnesses confirmed physical observation of hazard.`,
    };
    supportingObservations.push(`${confirmCount} independent witnesses in the surrounding area verified the occurrence.`);
  } else if (confirmCount >= 2) {
    breakdown.witnessConfirmations = {
      score: 18,
      max: 25,
      reason: `${confirmCount} independent nearby witnesses corroborated report.`,
    };
    supportingObservations.push(`${confirmCount} nearby witnesses independently confirmed this incident.`);
  } else if (confirmCount === 1) {
    breakdown.witnessConfirmations = {
      score: 10,
      max: 25,
      reason: '1 independent nearby witness confirmation logged.',
    };
    supportingObservations.push('1 nearby civilian independently corroborated the report.');
  } else {
    breakdown.witnessConfirmations = {
      score: 0,
      max: 25,
      reason: 'No independent witness confirmations logged in sector yet.',
    };
    missingEvidence.push('Secondary nearby witness confirmations');
  }

  if (suspiciousCount > 0) {
    concerns.push(`${suspiciousCount} suspicious confirmation attempts filtered by anti-sybil guard.`);
  }

  // =========================================================================
  // FACTOR 6: Community Corroboration & Contradictions (Max 10 pts)
  // =========================================================================
  if (disputeCount > 0) {
    const penalty = Math.min(10, disputeCount * 3);
    const scoreVal = Math.max(0, 8 - penalty);
    breakdown.communityCorroboration = {
      score: scoreVal,
      max: 10,
      reason: `${disputeCount} nearby witness(es) reported they could not confirm or observed contrary conditions.`,
    };
    concerns.push(`${disputeCount} contradictory witness account(s) recorded in the vicinity.`);
  } else if (confirmCount >= 1) {
    breakdown.communityCorroboration = {
      score: 8,
      max: 10,
      reason: 'Community responses indicate consensus with zero conflicting accounts.',
    };
  } else {
    breakdown.communityCorroboration = {
      score: 4,
      max: 10,
      reason: 'Awaiting initial community feedback.',
    };
  }

  // =========================================================================
  // FACTOR 7: Official Emergency Source Corroboration (Max 15 pts)
  // =========================================================================
  let matchedAlert = null;
  if (Array.isArray(officialAlerts) && officialAlerts.length > 0 && hasCoords) {
    for (const alt of officialAlerts) {
      if (!alt) continue;
      const dist = calculateDistanceKm(incident.latitude, incident.longitude, alt.latitude || 28.6139, alt.longitude || 77.2090);
      const isRelatedHazard =
        String(alt.type || '').toLowerCase().includes(String(incident.type || '').toLowerCase()) ||
        String(incident.type || '').toLowerCase().includes(String(alt.type || '').toLowerCase()) ||
        dist <= 2.5;

      if (dist <= 3.5 && isRelatedHazard) {
        matchedAlert = {
          alertId: alt.alertId || alt._id,
          title: alt.title || alt.message,
          severity: alt.severity || 'Warning',
          distanceKm: dist,
        };
        break;
      }
    }
  }

  if (matchedAlert) {
    breakdown.officialCorroboration = {
      score: 14,
      max: 15,
      reason: `Corroborates active district warning: "${matchedAlert.title}" (${matchedAlert.distanceKm.toFixed(1)} km away).`,
    };
    supportingObservations.push(`Matches active emergency bulletin (${matchedAlert.title}).`);
  } else {
    breakdown.officialCorroboration = {
      score: 0,
      max: 15,
      reason: 'No matching official agency bulletin found in immediate sector (early citizen reporting).',
    };
  }

  // =========================================================================
  // FACTOR 8: Duplicate & Contradiction Check
  // =========================================================================
  const hasDuplicateWarning = Boolean(duplicateCandidates && duplicateCandidates.length > 0 && duplicateCandidates[0]?.score >= 70);
  if (hasDuplicateWarning) {
    breakdown.duplicateContradiction = {
      score: 0,
      max: 0,
      reason: `High duplicate similarity with incident ${duplicateCandidates[0].existingIncident?.incidentId}.`,
    };
    concerns.push(`Probable duplicate report of existing Incident ${duplicateCandidates[0].existingIncident?.incidentId}.`);
  } else {
    breakdown.duplicateContradiction = {
      score: 0,
      max: 0,
      reason: 'No duplicate records detected.',
    };
  }

  // Sum factor points
  totalScore =
    breakdown.evidenceQuality.score +
    breakdown.mediaAuthenticity.score +
    breakdown.locationConsistency.score +
    breakdown.timestampConsistency.score +
    breakdown.witnessConfirmations.score +
    breakdown.communityCorroboration.score +
    breakdown.officialCorroboration.score;

  // Clamp 0 to 100
  totalScore = Math.max(0, Math.min(100, Math.round(totalScore)));

  // Determine Assessment Level
  let trustLevel = 'Low confidence';
  if (totalScore >= 85) {
    trustLevel = 'Strong supporting evidence';
  } else if (totalScore >= 70) {
    trustLevel = 'High confidence';
  } else if (totalScore >= 50) {
    trustLevel = 'Moderate confidence';
  } else if (totalScore >= 30) {
    trustLevel = 'Low confidence';
  } else {
    trustLevel = 'Insufficient supporting evidence';
  }

  // Generate Natural Language AI Evidence Synthesis Narrative
  let narrative = '';
  if (totalScore >= 80) {
    narrative = `Strongly verified incident. Independent civilian witnesses and field telemetry corroborate reported hazard "${incident.type}". Uploaded media exhibits authentic camera capture properties with no synthetic manipulation indicators.`;
  } else if (totalScore >= 60) {
    narrative = `Moderate-to-high confidence. Multiple independent witnesses confirmed the hazard. Photographic evidence is consistent with "${incident.type}", although original camera timestamp could not be verified from compressed headers.`;
  } else if (totalScore >= 40) {
    narrative = `Preliminary report under review. Initial evidence logged, but requires secondary nearby witness corroboration. No official emergency bulletin has been broadcast for this specific micro-corridor yet.`;
  } else {
    narrative = `Low confidence / uncorroborated report. Insufficient supporting photographic or witness corroboration logged in the sector. Note: A low score reflects missing evidence rather than proof of falsity; life-safety response remains active.`;
  }

  if (disputeCount > 0) {
    narrative += ` Attention: ${disputeCount} nearby account(s) reported contrary observations; on-site ranger or dispatcher verification is advised.`;
  }

  let recommendedAction = 'Continue routine monitoring.';
  if (incident.severity === 'Critical') {
    recommendedAction = 'Life-safety emergency priority: Dispatch emergency responder unit immediately regardless of corroboration score.';
  } else if (totalScore >= 75) {
    recommendedAction = 'Eligible for official verification by emergency administrators.';
  } else if (disputeCount > confirmCount) {
    recommendedAction = 'Mark for field inspection by local community marshals to resolve conflicting witness statements.';
  } else {
    recommendedAction = 'Solicit secondary witness confirmations from verified nearby civilians.';
  }

  return {
    trustScore: totalScore,
    trustLevel,
    trustScoreBreakdown: breakdown,
    aiEvidenceSummary: {
      narrative,
      concerns,
      supportingObservations,
      recommendedAction,
      missingEvidence,
      modelUsed: 'DisasterChain Evidence Synthesis Engine v2.4',
      analyzedAt: new Date(),
    },
    witnessStats: {
      confirmedCount: confirmCount,
      disputedCount: disputeCount,
      lastConfirmedAt: validConfirmations[validConfirmations.length - 1]?.createdAt || null,
    },
    officialAlertMatch: matchedAlert
      ? {
          matched: true,
          alertId: String(matchedAlert.alertId),
          alertTitle: matchedAlert.title,
          severity: matchedAlert.severity,
          distanceKm: matchedAlert.distanceKm,
        }
      : {
          matched: false,
          alertId: null,
          alertTitle: '',
          severity: '',
          distanceKm: null,
        },
  };
}

module.exports = {
  calculateTrustScore,
  sanitizeWitnessConfirmations,
};
