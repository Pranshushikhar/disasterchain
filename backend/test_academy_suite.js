/**
 * DisasterChain Academy Backend API Test Suite
 * Tests:
 * 1. GET /api/academy/progress (retrieval & guest fallback)
 * 2. POST /api/academy/lesson-complete (XP award & streak calculation)
 * 3. POST /api/academy/quiz-submit (score validation, badge award, certificate ID generation)
 */

const http = require('http');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✅ [PASS] ${message}`);
  } else {
    failedTests++;
    console.error(`  ❌ [FAIL] ${message}`);
    throw new Error(`Assertion Failed: ${message}`);
  }
}

function request(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ status: res.statusCode, headers: res.headers, body: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, body });
        }
      });
    });

    req.on('error', (err) => reject(err));

    if (data) {
      req.write(typeof data === 'string' ? data : JSON.stringify(data));
    }
    req.end();
  });
}

async function runAcademyTests() {
  console.log('================================================================');
  console.log('🎓 DISASTERCHAIN ACADEMY BACKEND TEST SUITE');
  console.log('================================================================\n');

  const testUserId = `test-learner-${Date.now()}`;

  // 1. Initial Progress Fetch
  console.log('TEST 1: GET /api/academy/progress for new learner');
  const res1 = await request({
    hostname: 'localhost',
    port: 5000,
    path: `/api/academy/progress?userId=${testUserId}`,
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
  });

  assert(res1.status === 200, `HTTP Status is 200 (Got ${res1.status})`);
  assert(res1.body.success === true, 'Response success is true');
  assert(res1.body.progress.userId === testUserId, `Correct userId: ${res1.body.progress.userId}`);
  assert(res1.body.progress.totalXp === 0, `Initial XP is 0 (Got ${res1.body.progress.totalXp})`);
  assert(res1.body.progress.streak.count >= 1, `Initial streak >= 1 (Got ${res1.body.progress.streak.count})`);

  // 2. Complete Lesson 1
  console.log('\nTEST 2: POST /api/academy/lesson-complete (Earthquake Lesson 1)');
  const res2 = await request(
    {
      hostname: 'localhost',
      port: 5000,
      path: '/api/academy/lesson-complete',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    },
    {
      userId: testUserId,
      courseId: 'earthquake-safety',
      lessonId: 'eq-l1'
    }
  );

  assert(res2.status === 200, `HTTP Status is 200 (Got ${res2.status})`);
  assert(res2.body.xpEarned === 25, `Earned 25 XP for first lesson (Got ${res2.body.xpEarned})`);
  assert(res2.body.progress.totalXp === 25, `Total XP is 25 (Got ${res2.body.progress.totalXp})`);
  assert(res2.body.progress.completedLessons.length === 1, 'Completed lessons count is 1');

  // 3. Complete Same Lesson Again (Idempotency)
  console.log('\nTEST 3: Re-completing same lesson should not double-award XP');
  const res3 = await request(
    {
      hostname: 'localhost',
      port: 5000,
      path: '/api/academy/lesson-complete',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    },
    {
      userId: testUserId,
      courseId: 'earthquake-safety',
      lessonId: 'eq-l1'
    }
  );

  assert(res3.body.xpEarned === 0, `Duplicate completion awards 0 additional XP (Got ${res3.body.xpEarned})`);
  assert(res3.body.progress.totalXp === 25, 'Total XP remains unchanged at 25');

  // 4. Submit Quiz - Fail (<80%)
  console.log('\nTEST 4: POST /api/academy/quiz-submit with failing score (50%)');
  const res4 = await request(
    {
      hostname: 'localhost',
      port: 5000,
      path: '/api/academy/quiz-submit',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    },
    {
      userId: testUserId,
      courseId: 'earthquake-safety',
      score: 50,
      badgeId: 'badge-earthquake-master'
    }
  );

  assert(res4.status === 200, `HTTP Status is 200 (Got ${res4.status})`);
  assert(res4.body.passed === false, 'Quiz passed is false for 50%');
  assert(res4.body.certificateId === null, 'No certificate issued for failing quiz');

  // 5. Submit Quiz - Pass (100%)
  console.log('\nTEST 5: POST /api/academy/quiz-submit with perfect score (100%)');
  const res5 = await request(
    {
      hostname: 'localhost',
      port: 5000,
      path: '/api/academy/quiz-submit',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    },
    {
      userId: testUserId,
      courseId: 'earthquake-safety',
      score: 100,
      badgeId: 'badge-earthquake-master'
    }
  );

  assert(res5.status === 200, `HTTP Status is 200 (Got ${res5.status})`);
  assert(res5.body.passed === true, 'Quiz passed is true for 100%');
  assert(Boolean(res5.body.certificateId), `Certificate ID generated: ${res5.body.certificateId}`);
  assert(res5.body.certificateId.startsWith('DC-CERT-'), 'Certificate ID matches DC-CERT format');
  assert(res5.body.progress.badges.includes('badge-earthquake-master'), 'Badge badge-earthquake-master awarded');
  assert(res5.body.progress.badges.includes('badge-quiz-ace'), 'Perfect score badge-quiz-ace awarded');
  assert(res5.body.progress.totalXp === 125, `Total XP is 125 (25 + 100) (Got ${res5.body.progress.totalXp})`);

  console.log('\n================================================================');
  console.log(`🎉 ALL ACADEMY TESTS PASSED: ${passedTests}/${totalTests}`);
  console.log('================================================================\n');
}

// Check if server is running; if not, print instruction
const checkReq = http.get('http://localhost:5000/api/health', (res) => {
  runAcademyTests()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Test Suite Failed:', err.message);
      process.exit(1);
    });
});

checkReq.on('error', () => {
  console.log('Server is not running on port 5000. Launching tests via internal mock/server...');
  // Require server directly to run in-process
  require('./server');
  setTimeout(() => {
    runAcademyTests()
      .then(() => process.exit(0))
      .catch((err) => {
        console.error('Test Suite Failed:', err.message);
        process.exit(1);
      });
  }, 1200);
});
