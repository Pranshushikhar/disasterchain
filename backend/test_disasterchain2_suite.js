/**
 * DISASTERCHAIN 2.0 — COMPREHENSIVE AUTOMATED VERIFICATION SUITE
 * Tests all flagship capabilities, backend routes, and cross-module contracts.
 */

const assert = require('assert');
const {
  getScenarios,
  askAdvisor,
  evaluateWhatIf,
  generateAfterActionReport,
} = require('./controllers/crisisLabController');
const {
  getPresets,
  analyzeImagery,
} = require('./controllers/satelliteEyeController');
const {
  triageVoiceReport,
} = require('./controllers/voiceCopilotController');
const {
  DISTRICT_META,
  SECTORS,
  BRIDGES_AND_ROADS,
  CRITICAL_FACILITIES,
  SIMULATION_SCENARIOS,
} = require('./controllers/saraswatiNagarBackendData');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function runTest(testName, fn) {
  totalTests++;
  try {
    fn();
    passedTests++;
    console.log(`  ✓ [PASS] ${testName}`);
  } catch (err) {
    failedTests++;
    console.error(`  ✗ [FAIL] ${testName}`);
    console.error(`    ${err.message}`);
  }
}

async function runAsyncTest(testName, fn) {
  totalTests++;
  try {
    await fn();
    passedTests++;
    console.log(`  ✓ [PASS] ${testName}`);
  } catch (err) {
    failedTests++;
    console.error(`  ✗ [FAIL] ${testName}`);
    console.error(`    ${err.message}`);
  }
}

// Mock Express req/res
function createMockReqRes(body = {}, params = {}) {
  const req = { body, params };
  const res = {
    statusCode: 200,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(data) {
      this.data = data;
      return this;
    },
  };
  return { req, res };
}

async function runAllTests() {
  console.log('\n======================================================');
  console.log(' DISASTERCHAIN 2.0 — FLAGSHIP CAPABILITY TEST SUITE');
  console.log('======================================================\n');

  // --- SECTION 1: DATA MODELS & NAMESPACE INTEGRITY ---
  console.log('--- SECTION 1: SARASWATI NAGAR DATA MODEL & ISOLATION ---');

  runTest('District metadata specifies Saraswati Nagar and is simulated', () => {
    assert.strictEqual(DISTRICT_META.name, 'Saraswati Nagar');
    assert.strictEqual(DISTRICT_META.isSimulated, true);
    assert.ok(DISTRICT_META.disclaimer.includes('SIMULATION'));
  });

  runTest('Sectors definition has 6 complete sectors with elevations', () => {
    assert.strictEqual(SECTORS.length, 6);
    assert.ok(SECTORS.every((s) => s.id && s.name && s.elevationMeters));
  });

  runTest('Bridges & roads include Central Bridge and Elevated Flyover with submersion thresholds', () => {
    const centralBridge = BRIDGES_AND_ROADS.find((b) => b.id === 'bridge-1');
    const flyover = BRIDGES_AND_ROADS.find((b) => b.id === 'bridge-2');
    assert.ok(centralBridge, 'Central bridge must exist');
    assert.ok(flyover, 'Flyover must exist');
    assert.strictEqual(centralBridge.submersionThresholdMeters, 2.2);
    assert.strictEqual(flyover.submersionThresholdMeters, 8.5);
  });

  // --- SECTION 2: CRISISLAB SIMULATION BACKEND ---
  console.log('\n--- SECTION 2: CRISISLAB SIMULATION BACKEND ---');

  await runAsyncTest('GET /api/crisis-lab/scenarios loads all 4 disaster scenarios', async () => {
    const { req, res } = createMockReqRes();
    await getScenarios(req, res);
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.data.success, true);
    assert.strictEqual(res.data.scenarios.length, 4);
    assert.ok(res.data.scenarios.some((s) => s.id === 'flash-flood'));
    assert.ok(res.data.scenarios.some((s) => s.id === 'major-earthquake'));
  });

  await runAsyncTest('POST /api/crisis-lab/advisor returns actionable recommendation with evidence and trade-offs', async () => {
    const { req, res } = createMockReqRes({
      scenarioId: 'flash-flood',
      query: 'Which incident should I prioritize first?',
      simulationState: {
        floodLevelMeters: 2.4,
        roadStatuses: { 'bridge-1': 'submerged' },
      },
    });
    await askAdvisor(req, res);
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.data.success, true);
    assert.ok(res.data.advisor.recommendation.length > 10);
    assert.ok(Array.isArray(res.data.advisor.evidence));
    assert.ok(Array.isArray(res.data.advisor.tradeOffs));
    assert.ok(res.data.advisor.confidence > 0.8);
  });

  await runAsyncTest('POST /api/crisis-lab/what-if evaluates DOUBLE_RAINFALL contingency consequences', async () => {
    const { req, res } = createMockReqRes({
      scenarioId: 'flash-flood',
      experimentType: 'DOUBLE_RAINFALL',
      currentState: { floodLevelMeters: 1.5 },
    });
    await evaluateWhatIf(req, res);
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.data.success, true);
    assert.ok(res.data.whatIfResult.consequences.predictedFloodIncrease.includes('+1.6'));
    assert.ok(res.data.whatIfResult.consequences.impactedSectors.length >= 2);
  });

  await runAsyncTest('POST /api/crisis-lab/after-action-report computes explainable score and audit trail', async () => {
    const { req, res } = createMockReqRes({
      scenarioId: 'flash-flood',
      decisions: [
        { type: 'DISPATCH_BOAT', action: 'Deployed SDRF Boat 1' },
        { type: 'CLOSE_BRIDGE', action: 'Closed Central Bridge' },
        { type: 'DISPATCH_AMBULANCE', action: 'Rerouted Ambulance to Flyover' },
      ],
      durationSeconds: 240,
    });
    await generateAfterActionReport(req, res);
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.data.success, true);
    assert.ok(res.data.report.score >= 50 && res.data.report.score <= 100);
    assert.ok(res.data.report.grade.length > 0);
    assert.strictEqual(res.data.report.auditTrail.length, 3);
  });

  // --- SECTION 3: SATELLITE EYE AI IMAGERY ---
  console.log('\n--- SECTION 3: SATELLITE EYE AI IMAGERY ---');

  await runAsyncTest('GET /api/satellite-eye/presets returns optical and SAR presets', async () => {
    const { req, res } = createMockReqRes();
    await getPresets(req, res);
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.data.presets.length, 3);
    assert.ok(res.data.presets.some((p) => p.task === 'FLOOD_EXTENT'));
  });

  await runAsyncTest('POST /api/satellite-eye/analyze returns detections with confidence and uncertainty bounds', async () => {
    const { req, res } = createMockReqRes({
      presetId: 'saraswati-flood-2026',
      taskType: 'FLOOD_EXTENT',
    });
    await analyzeImagery(req, res);
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.data.analysis.presetId, 'saraswati-flood-2026');
    assert.ok(res.data.analysis.detections.length > 0);
    assert.ok(res.data.analysis.metrics.confidenceScore > 0.85);
    assert.ok(res.data.analysis.technicalMetadata.limitations.length > 10);
    assert.ok(res.data.analysis.technicalMetadata.humanReviewNotice.includes('HUMAN VERIFICATION'));
  });

  // --- SECTION 4: GLOBAL VOICE COPILOT EMERGENCY TRIAGE ---
  console.log('\n--- SECTION 4: GLOBAL VOICE COPILOT EMERGENCY TRIAGE ---');

  await runAsyncTest('Voice Triage extracts wheelchair and flood emergency from speech', async () => {
    const speechText = 'My house is flooding in Sector 2. My mother uses a wheelchair and cannot leave the building.';
    const { req, res } = createMockReqRes({
      transcript: speechText,
      language: 'en',
      clientCoordinates: { latitude: 28.6110, longitude: 77.2050 },
    });
    await triageVoiceReport(req, res);
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.data.success, true);

    const draft = res.data.incidentDraft;
    assert.ok(draft.emergencyType.includes('Flood'), 'Must identify flood emergency');
    assert.strictEqual(draft.urgency, 'Critical', 'Trapped occupant must elevate to Critical');
    assert.ok(
      draft.accessibilityNeeds.some((n) => n.type === 'WHEELCHAIR_ASSISTANCE'),
      'Must extract WHEELCHAIR_ASSISTANCE'
    );
    assert.ok(
      draft.accessibilityNeeds.some((n) => n.type === 'ELDERLY_ASSISTANCE' || n.type === 'LIMITED_MOBILITY'),
      'Must extract senior / mobility limitations'
    );
    assert.strictEqual(draft.requiresExplicitConfirmation, true, 'Safety policy must require confirmation');
    assert.ok(draft.dispatchSafetyNotice.includes('SAFETY POLICY'), 'Safety notice required');
  });

  await runAsyncTest('Voice Triage extracts Hindi speech emergency and accessibility', async () => {
    const speechText = 'हमारे घर में बाढ़ का पानी घुस गया है, मेरी माताजी व्हीलचेयर पर हैं।';
    const { req, res } = createMockReqRes({
      transcript: speechText,
      language: 'hi',
    });
    await triageVoiceReport(req, res);
    assert.strictEqual(res.statusCode, 200);
    const draft = res.data.incidentDraft;
    assert.ok(draft.emergencyType.includes('Flood'));
    assert.ok(draft.accessibilityNeeds.some((n) => n.type === 'WHEELCHAIR_ASSISTANCE'));
  });

  // --- SUMMARY ---
  console.log('\n======================================================');
  console.log(` RESULTS: ${passedTests}/${totalTests} PASSED (Failed: ${failedTests})`);
  console.log('======================================================\n');

  if (failedTests > 0) {
    process.exit(1);
  }
}

runAllTests();
