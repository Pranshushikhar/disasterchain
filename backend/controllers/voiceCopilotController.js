/**
 * DISASTERCHAIN 2.0 — GLOBAL VOICE COPILOT CONTROLLER
 * Multilingual emergency extraction & accessibility triage engine.
 * Generates structured incident drafts requiring explicit confirmation.
 */

const SUPPORTED_LANG_NAMES = {
  en: 'English',
  hi: 'Hindi (हिंदी)',
  bn: 'Bengali (বাংলা)',
  te: 'Telugu (తెలుగు)',
  mr: 'Marathi (मराठी)',
  ta: 'Tamil (தமிழ்)',
  gu: 'Gujarati (ગુજરાતી)',
  kn: 'Kannada (ಕನ್ನಡ)',
  ml: 'Malayalam (മലയാളം)',
  pa: 'Punjabi (ਪੰਜਾਬੀ)',
  or: 'Odia (ଓଡ଼ିଆ)',
  as: 'Assamese (অসমীয়া)',
  ur: 'Urdu (اردو)',
  sa: 'Sanskrit (संस्कृतम्)',
  ne: 'Nepali (नेपाली)',
  kok: 'Konkani (कोंकणी)',
  ks: 'Kashmiri (کٲشُر)',
  mai: 'Maithili (मैथिली)',
  sd: 'Sindhi (سنڌي)',
  mni: 'Manipuri (মৈতৈলোন্)',
};

/**
 * @desc Triage spoken or typed emergency report, extract accessibility needs, and generate structured draft
 * @route POST /api/ai/voice-triage
 */
exports.triageVoiceReport = async (req, res) => {
  try {
    const { transcript, language = 'en', clientCoordinates } = req.body;

    if (!transcript || typeof transcript !== 'string' || transcript.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Speech transcript or message text is required.',
      });
    }

    const text = transcript.trim().toLowerCase();

    // 1. Detect Emergency Category
    let emergencyType = 'General Emergency Distress';
    let urgency = 'High';
    let urgencyConfidence = 0.88;

    if (text.includes('flood') || text.includes('water') || text.includes('drown') || text.includes('बाढ़') || text.includes('पानी')) {
      emergencyType = 'Flash Flood / Rising Water Inundation';
      urgency = text.includes('trapped') || text.includes('cannot leave') || text.includes('drowning') ? 'Critical' : 'High';
    } else if (text.includes('quake') || text.includes('earthquake') || text.includes('collapse') || text.includes('rubble') || text.includes('भूकंप')) {
      emergencyType = 'Earthquake Structural Damage';
      urgency = text.includes('under') || text.includes('stuck') ? 'Critical' : 'High';
    } else if (text.includes('fire') || text.includes('burn') || text.includes('smoke') || text.includes('आग')) {
      emergencyType = 'Fire / Toxic Smoke Emergency';
      urgency = 'Critical';
    } else if (text.includes('medical') || text.includes('heart') || text.includes('bleed') || text.includes('injury') || text.includes('सांस')) {
      emergencyType = 'Acute Medical Trauma';
      urgency = 'Critical';
    } else if (text.includes('cyclone') || text.includes('storm') || text.includes('wind') || text.includes('तूफान')) {
      emergencyType = 'Cyclone / Severe Squall Distress';
      urgency = 'High';
    }

    // 2. Identify Accessibility Requirements
    const accessibilityNeeds = [];

    if (text.includes('wheelchair') || text.includes('wheel chair') || text.includes('व्हीलचेयर')) {
      accessibilityNeeds.push({
        type: 'WHEELCHAIR_ASSISTANCE',
        label: 'Wheelchair Assistance Required',
        description: 'Resident relies on a wheelchair and requires accessible ramping or lifting transfer equipment.',
      });
    }

    if (text.includes('mother') || text.includes('father') || text.includes('elderly') || text.includes('old') || text.includes('senior') || text.includes('बुजुर्ग')) {
      accessibilityNeeds.push({
        type: 'ELDERLY_ASSISTANCE',
        label: 'Elderly Person Requiring Evacuation Support',
        description: 'Senior citizen in residence with limited independent mobility.',
      });
    }

    if (text.includes('cannot leave') || text.includes('cannot walk') || text.includes('bedridden') || text.includes('mobility') || text.includes('चल नहीं')) {
      accessibilityNeeds.push({
        type: 'LIMITED_MOBILITY',
        label: 'Limited Physical Mobility',
        description: 'Occupant cannot independently traverse stairs or flooded terrain.',
      });
    }

    if (text.includes('baby') || text.includes('child') || text.includes('children') || text.includes('kid') || text.includes('बच्चा')) {
      accessibilityNeeds.push({
        type: 'PEDIATRIC_ASSISTANCE',
        label: 'Infant / Child Evacuation Needs',
        description: 'Children present requiring pediatric floatation vests and specialized transport.',
      });
    }

    if (text.includes('oxygen') || text.includes('dialysis') || text.includes('insulin') || text.includes('ventilator') || text.includes('medicine')) {
      accessibilityNeeds.push({
        type: 'MEDICAL_EQUIPMENT_DEPENDENCE',
        label: 'Medical Life Support / Critical Medication',
        description: 'Dependent on powered medical equipment or urgent temperature-controlled medication.',
      });
    }

    if (text.includes('deaf') || text.includes('blind') || text.includes('mute') || text.includes('speech')) {
      accessibilityNeeds.push({
        type: 'COMMUNICATION_ASSISTANCE',
        label: 'Sensory / Communication Assistance',
        description: 'Sensory or communication barrier requiring visual or tactile guidance.',
      });
    }

    // 3. Extract Location (ONLY when explicitly supplied or shared by user)
    let extractedLocation = null;
    let locationSource = 'None';

    const locationKeywords = ['saraswati nagar', 'riverview', 'sector 1', 'sector 2', 'sector 3', 'sector 4', 'sector 5', 'sector 6', 'clocktower', 'mandi', 'mg marg'];
    for (const kw of locationKeywords) {
      if (text.includes(kw)) {
        extractedLocation = kw.toUpperCase();
        locationSource = 'User Speech Transcript';
        break;
      }
    }

    if (!extractedLocation && clientCoordinates && clientCoordinates.latitude && clientCoordinates.longitude) {
      extractedLocation = `${clientCoordinates.latitude.toFixed(4)}, ${clientCoordinates.longitude.toFixed(4)}`;
      locationSource = 'User Authorized Browser GPS';
    }

    // 4. Recommend Specialized Responder Capabilities
    const recommendedCapabilities = [];
    if (emergencyType.includes('Flood')) {
      recommendedCapabilities.push('Zodiac Inflatable Rescue Boat (Shallow Draft)');
      recommendedCapabilities.push('Water Wading Search Team');
    }
    if (accessibilityNeeds.some((n) => n.type === 'WHEELCHAIR_ASSISTANCE' || n.type === 'LIMITED_MOBILITY')) {
      recommendedCapabilities.push('Stretcher / Basket Transfer Kit');
      recommendedCapabilities.push('Wheelchair Accessible Vehicle');
    }
    if (accessibilityNeeds.some((n) => n.type === 'MEDICAL_EQUIPMENT_DEPENDENCE') || urgency === 'Critical') {
      recommendedCapabilities.push('ALS Paramedic with Portable Oxygen / Life Support');
    }
    if (recommendedCapabilities.length === 0) {
      recommendedCapabilities.push('Rapid Assessment Emergency Team');
    }

    // 5. Structure Incident Draft (Requires User Confirmation)
    const incidentDraft = {
      draftId: `DRAFT-VOICE-${Date.now().toString(36).toUpperCase()}`,
      status: 'UNCONFIRMED_DRAFT',
      originalSpokenText: transcript,
      detectedLanguage: SUPPORTED_LANG_NAMES[language] || language,
      emergencyType,
      urgency,
      urgencyConfidence,
      accessibilityNeeds,
      location: extractedLocation || 'Unspecified (Please confirm below)',
      locationSource,
      hasExplicitLocation: Boolean(extractedLocation),
      recommendedCapabilities,
      requiresExplicitConfirmation: true,
      dispatchSafetyNotice: 'SAFETY POLICY: This report is a DRAFT. Emergency responders will NOT be dispatched until you click "Confirm & Submit SOS".',
      createdAt: new Date().toISOString(),
    };

    return res.json({
      success: true,
      incidentDraft,
    });
  } catch (error) {
    console.error('VoiceCopilot triageVoiceReport Error:', error);
    return res.status(500).json({ success: false, message: 'Voice triage processing failed' });
  }
};
