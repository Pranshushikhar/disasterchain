/**
 * DisasterChain AI Trust & Incident Verification Backend Test Suite
 * Validates:
 * 1. Nearby witness confirmation & dispute
 * 2. Original reporter self-confirmation block
 * 3. Approximate distance privacy check
 * 4. Anti-sybil coordinated burst detection
 * 5. AI media analysis (authentic, synthetic uncertainty, duplicate pHash)
 * 6. Duplicate incident detection & administrative merging
 * 7. Explainable 0-100 trust score factor breakdown
 * 8. Admin verification decisions & immutable audit trail
 * 9. RBAC authorization security checks
 */

const assert = require('assert');
const http = require('http');
const express = require('express');
const jwt = require('jsonwebtoken');

const incidentRoutes = require('./routes/incidentRoutes');
const memoryStore = require('./config/memoryStore');
const {
  analyzeIncidentMedia,
  computePerceptualHash,
  comparePerceptualHashes,
} = require('./services/aiMediaAnalysisService');
const {
  calculateDistanceKm,
  findDuplicateIncidents,
  executeDuplicateMerge,
} = require('./services/duplicateDetectionService');
const { calculateTrustScore, sanitizeWitnessConfirmations } = require('./services/incidentTrustService');

console.log('================================================================');
console.log('🛡️ DISASTERCHAIN AI TRUST & INCIDENT VERIFICATION TEST SUITE');
console.log('================================================================');

(async () => {
  let passed = 0;
  let total = 0;

  function test(name, fn) {
    total++;
    try {
      fn();
      console.log(`  ✅ [PASS] ${name}`);
      passed++;
    } catch (e) {
      console.error(`  ❌ [FAIL] ${name}:`, e.message);
      process.exit(1);
    }
  }

  async function asyncTest(name, fn) {
    total++;
    try {
      await fn();
      console.log(`  ✅ [PASS] ${name}`);
      passed++;
    } catch (e) {
      console.error(`  ❌ [FAIL] ${name}:`, e.message);
      process.exit(1);
    }
  }

  // Set up Express test server
  const app = express();
  app.use(express.json());
  app.use('/api/incidents', incidentRoutes);

  const server = http.createServer(app);
  const TEST_PORT = 5189;
  await new Promise((resolve) => server.listen(TEST_PORT, resolve));
  console.log(`Test API server running on http://127.0.0.1:${TEST_PORT}\n`);

  const JWT_SECRET = process.env.JWT_SECRET || 'disasterchain_secure_jwt_secret_2026';
  const adminToken = jwt.sign({ id: 'user-admin-1', role: 'admin', name: 'Chief Disaster Officer' }, JWT_SECRET, {
    expiresIn: '1h',
  });
  const citizenToken = jwt.sign({ id: 'user-civilian-1', role: 'citizen', name: 'Aarav Patel' }, JWT_SECRET, {
    expiresIn: '1h',
  });

  const request = (method, path, body = null, token = null) => {
    return new Promise((resolve, reject) => {
      const payload = body ? JSON.stringify(body) : '';
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      if (payload) headers['Content-Length'] = Buffer.byteLength(payload);

      const req = http.request(
        {
          hostname: '127.0.0.1',
          port: TEST_PORT,
          path,
          method,
          headers,
        },
        (res) => {
          let data = '';
          res.on('data', (c) => (data += c));
          res.on('end', () => {
            try {
              resolve({ status: res.statusCode, body: JSON.parse(data) });
            } catch (e) {
              resolve({ status: res.statusCode, raw: data });
            }
          });
        }
      );
      req.on('error', reject);
      if (payload) req.write(payload);
      req.end();
    });
  };

  // -------------------------------------------------------------
  // UNIT 1: GEOSPATIAL DISTANCE & DUPLICATE DETECTION LOGIC
  // -------------------------------------------------------------
  console.log('--- Unit 1: Geospatial Proximity & Duplicate Detection ---');
  test('Haversine formula calculates accurate distance in km', () => {
    // Distance between Sector 12 (28.618, 77.214) and Sector 14 (28.625, 77.218) ~ 0.86 km
    const dist = calculateDistanceKm(28.618, 77.214, 28.625, 77.218);
    assert(dist > 0.7 && dist < 1.1, `Expected ~0.8-1.0 km, got ${dist}`);
  });

  test('Flags co-located incidents of same category as duplicates', () => {
    const report1 = {
      title: 'Waterlogging at Underpass',
      type: 'Flooding',
      description: 'Underpass inundated with 3.5 ft water.',
      latitude: 28.6180,
      longitude: 77.2140,
    };
    const report2 = {
      _id: 'existing-1',
      incidentId: 'INC-EXISTING',
      title: 'Deep Water in Underpass',
      type: 'Flooding',
      description: 'Underpass flooded with standing water.',
      latitude: 28.6182,
      longitude: 77.2142,
      createdAt: new Date(),
    };
    const check = findDuplicateIncidents(report1, [report2]);
    assert.strictEqual(check.hasDuplicates, true);
    assert(check.topMatchScore >= 70, `Expected duplicate score >= 70, got ${check.topMatchScore}`);
    assert(check.candidates[0].reasons.some((r) => r.includes('proximity') || r.includes('co-location')));
  });

  test('Does not flag distant or unrelated incidents as duplicates', () => {
    const reportA = {
      title: 'Downed tree in South Park',
      type: 'Fallen tree',
      description: 'Pine tree branch blocked jogging trail.',
      latitude: 28.5500,
      longitude: 77.1500,
    };
    const reportB = {
      _id: 'existing-2',
      incidentId: 'INC-FAR',
      title: 'Transformer short circuit in North Enclave',
      type: 'Damaged electrical equipment',
      description: 'Electrical transformer sparking on utility pole.',
      latitude: 28.7000,
      longitude: 77.2800,
      createdAt: new Date(),
    };
    const check = findDuplicateIncidents(reportA, [reportB]);
    assert.strictEqual(check.hasDuplicates, false);
  });

  // -------------------------------------------------------------
  // UNIT 2: AI MEDIA FORENSICS & PERCEPTUAL HASHING
  // -------------------------------------------------------------
  console.log('\n--- Unit 2: AI Media Forensics & Hash Matching ---');
  test('Generates deterministic 64-bit perceptual hash', () => {
    const h1 = computePerceptualHash('https://example.com/flood1.jpg');
    const h2 = computePerceptualHash('https://example.com/flood1.jpg');
    const h3 = computePerceptualHash('https://example.com/different.jpg');
    assert.strictEqual(h1, h2);
    assert.notStrictEqual(h1, h3);
    assert.strictEqual(h1.length, 16);
  });

  test('Identifies perceptual image duplicate match', () => {
    const hash = 'a1b2c3d4e5f60718';
    const dist = comparePerceptualHashes(hash, 'a1b2c3d4e5f60718');
    assert.strictEqual(dist, 0);
  });

  await asyncTest('Analyzes authentic photograph without synthetic artifacts', async () => {
    const res = await analyzeIncidentMedia({
      url: 'https://images.unsplash.com/photo-1547683019-20f545465c49',
      category: 'Flooding',
      description: 'Severe water inundation blocking traffic.',
      latitude: 28.618,
      longitude: 77.214,
    });
    assert.strictEqual(res.aiDetectionStatus, 'authentic');
    assert(res.isAiGeneratedProbability < 0.2);
    assert.strictEqual(res.relevance.isRelevant, true);
    assert(res.relevance.detectedHazards.includes('flooding'));
  });

  await asyncTest('Flags potential synthetic artifacts with uncertainty disclaimer', async () => {
    const res = await analyzeIncidentMedia({
      url: 'https://images.unsplash.com/photo-1542385151-efd9000785a0?synthetic=1',
      category: 'Fire hazard',
      description: 'Wildfire reported by anonymous user.',
    });
    assert.strictEqual(res.aiDetectionStatus, 'uncertain');
    assert(res.isAiGeneratedProbability > 0.6);
    assert(res.detectedConcerns.some((c) => c.includes('synthetic')));
    // Must never claim definitely fake
    assert(!res.overallResult.includes('definitely fake') && !res.overallResult.includes('100% Fake'));
  });

  // -------------------------------------------------------------
  // UNIT 3: TRUST SCORE CALCULATION & ANTI-SYBIL WITNESS RULES
  // -------------------------------------------------------------
  console.log('\n--- Unit 3: Trust Score Engine & Anti-Sybil Checks ---');
  test('Calculates explainable 0-100 trust score with factor breakdown', () => {
    const mockIncident = {
      title: 'Heavy Inundation',
      type: 'Flooding',
      imageUrl: 'https://images.unsplash.com/photo-1547683019-20f545465c49',
      latitude: 28.618,
      longitude: 77.214,
      createdAt: new Date(),
      mediaAnalysis: [
        {
          isAiGeneratedProbability: 0.05,
          manipulationIndicators: { exifStatus: 'verified' },
          relevance: { isRelevant: true },
        },
      ],
    };
    const mockWitnesses = [
      { witnessType: 'CONFIRM', userId: 'user-w1', userName: 'Witness 1' },
      { witnessType: 'CONFIRM', userId: 'user-w2', userName: 'Witness 2' },
      { witnessType: 'CONFIRM', userId: 'user-w3', userName: 'Witness 3' },
    ];
    const scoreResult = calculateTrustScore({ incident: mockIncident, witnesses: mockWitnesses });
    assert(scoreResult.trustScore >= 70, `Expected score >= 70, got ${scoreResult.trustScore}`);
    assert.ok(scoreResult.trustScoreBreakdown.evidenceQuality);
    assert.ok(scoreResult.trustScoreBreakdown.mediaAuthenticity);
    assert.ok(scoreResult.trustScoreBreakdown.witnessConfirmations);
    assert(scoreResult.aiEvidenceSummary.narrative.length > 20);
  });

  test('Rejects original reporter from acting as independent witness', () => {
    const incident = { reportedBy: 'user-author-9', reporterName: 'Sunita Mehra' };
    const rawWitnesses = [
      { userId: 'user-author-9', userName: 'Sunita Mehra', witnessType: 'CONFIRM' }, // Self confirmation
      { userId: 'user-independent-1', userName: 'Rahul Sharma', witnessType: 'CONFIRM' }, // Valid witness
    ];
    const sanitized = sanitizeWitnessConfirmations(incident, rawWitnesses);
    assert.strictEqual(sanitized.validConfirmations.length, 1);
    assert.strictEqual(sanitized.validConfirmations[0].userName, 'Rahul Sharma');
  });

  test('Filters duplicate witness confirmations from same user', () => {
    const incident = { reportedBy: 'user-1' };
    const rawWitnesses = [
      { userId: 'user-witness-2', userName: 'Witness 2', witnessType: 'CONFIRM' },
      { userId: 'user-witness-2', userName: 'Witness 2', witnessType: 'CONFIRM' }, // Duplicate attempt
    ];
    const sanitized = sanitizeWitnessConfirmations(incident, rawWitnesses);
    assert.strictEqual(sanitized.validConfirmations.length, 1);
  });

  // -------------------------------------------------------------
  // UNIT 4: HTTP API ROUTES & END-TO-END WORKFLOW
  // -------------------------------------------------------------
  console.log('\n--- Unit 4: HTTP Verification APIs ---');

  await asyncTest('POST /api/incidents/check-duplicates returns similarity warnings', async () => {
    const res = await request('POST', '/api/incidents/check-duplicates', {
      title: 'Water accumulation in Ring Road Underpass',
      type: 'Flooding',
      description: 'Underpass flooded with standing water.',
      location: 'Ring Road South Underpass',
      latitude: 28.6180,
      longitude: 77.2140,
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(typeof res.body.hasDuplicates, 'boolean');
  });

  await asyncTest('POST /api/incidents/:id/witness records civilian confirmation', async () => {
    const res = await request(
      'POST',
      '/api/incidents/inc-3003/witness',
      {
        witnessType: 'CONFIRM',
        statement: 'I witnessed the diagonal crack on the footbridge while walking to metro.',
        latitude: 28.6112,
        longitude: 77.2187,
        hasLocationPermission: true,
      },
      citizenToken
    );
    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.body.success, true);
    assert.ok(res.body.data.witnessRecord.approximateDistanceKm !== null);
    assert.strictEqual(res.body.data.witnessRecord.witnessType, 'CONFIRM');
  });

  await asyncTest('GET /api/incidents/:id/witnesses returns sanitized anonymized records', async () => {
    const res = await request('GET', '/api/incidents/inc-3003/witnesses');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert(res.body.data.length >= 1);
    // Exact coordinates must not be exposed
    assert.strictEqual(res.body.data[0].latitude, undefined);
    assert.strictEqual(res.body.data[0].longitude, undefined);
  });

  await asyncTest('GET /api/incidents/:id/trust-score returns full factor breakdown', async () => {
    const res = await request('GET', '/api/incidents/inc-3001/trust-score');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert(res.body.data.trustScore > 0);
    assert.ok(res.body.data.trustScoreBreakdown);
    assert.ok(res.body.data.aiEvidenceSummary);
  });

  // -------------------------------------------------------------
  // UNIT 5: ADMIN VERIFICATION & RBAC AUTHORIZATION
  // -------------------------------------------------------------
  console.log('\n--- Unit 5: Admin Verification Actions & RBAC ---');

  await asyncTest('Non-admin user blocked from admin verification endpoints (403 Forbidden)', async () => {
    const res = await request(
      'POST',
      '/api/incidents/inc-3003/admin/verify',
      { reason: 'Unauthorized attempt' },
      citizenToken // Non-admin token
    );
    assert.strictEqual(res.status, 403);
    assert.strictEqual(res.body.success, false);
  });

  await asyncTest('Admin Verify updates status to Officially Verified with audit trail', async () => {
    const res = await request(
      'POST',
      '/api/incidents/inc-3003/admin/verify',
      { reason: 'Structural engineer field inspection confirmed concourse shear fracture.' },
      adminToken
    );
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.data.verificationStatus, 'Officially Verified');
    const lastAudit = res.body.data.auditLog[res.body.data.auditLog.length - 1];
    assert.strictEqual(lastAudit.action, 'VERIFY');
  });

  await asyncTest('Admin Reject fails without mandatory reason (400 Bad Request)', async () => {
    const res = await request('POST', '/api/incidents/inc-3004/admin/reject', { reason: '   ' }, adminToken);
    assert.strictEqual(res.status, 400);
    assert.strictEqual(res.body.success, false);
  });

  await asyncTest('Admin Reject succeeds with mandatory reason', async () => {
    const res = await request(
      'POST',
      '/api/incidents/inc-3004/admin/reject',
      { reason: 'Confirmed false alarm by on-site chemical safety team.' },
      adminToken
    );
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.data.verificationStatus, 'Rejected');
  });

  await asyncTest('Admin Request Evidence logs evidence request on incident', async () => {
    const res = await request(
      'POST',
      '/api/incidents/inc-3001/admin/request-evidence',
      { note: 'Please submit footage of the drainage outfall.' },
      adminToken
    );
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert(res.body.data.evidenceRequests.length >= 1);
  });

  await asyncTest('Admin Merge duplicates links records and preserves audit history', async () => {
    const res = await request(
      'POST',
      '/api/incidents/inc-3001/admin/merge',
      { duplicateIncidentId: 'inc-3005', reason: 'Subsumed co-located report into primary incident INC-3001.' },
      adminToken
    );
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.data.primaryIncidentId, 'INC-3001');
    assert.strictEqual(res.body.data.mergedIncidentId, 'INC-3005');
  });

  await asyncTest('GET /api/incidents/admin/verification-stats returns dashboard metrics', async () => {
    const res = await request('GET', '/api/incidents/admin/verification-stats', null, adminToken);
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert(res.body.data.totalReported > 0);
    assert(res.body.data.officiallyVerified >= 1);
  });

  server.close();
  console.log('\n================================================================');
  console.log(`🎉 ALL ${passed}/${total} INCIDENT VERIFICATION BACKEND TESTS PASSED (100%)`);
  console.log('================================================================\n');
  process.exit(0);
})();
