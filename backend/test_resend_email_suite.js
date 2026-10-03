/**
 * DisasterChain - Resend Transactional Email & Auth Flow Test Suite
 * Validates real transactional email configuration, template rendering,
 * registration verification, forgot-password reset dispatch, token verification,
 * anti-enumeration, and zero-exposure security constraints.
 */

const assert = require('assert');
const crypto = require('crypto');
const emailService = require('./services/emailService');
const memoryStore = require('./config/memoryStore');
const authController = require('./controllers/authController');

async function runTestSuite() {
  console.log('========================================================================');
  console.log('📧 DISASTERCHAIN RESEND EMAIL & AUTHENTICATION INTEGRITY SUITE');
  console.log('========================================================================\n');

  let passedTests = 0;
  let totalTests = 0;

  function test(name, fn) {
    totalTests++;
    try {
      fn();
      console.log(`✅ [PASS ${totalTests}] ${name}`);
      passedTests++;
    } catch (err) {
      console.error(`❌ [FAIL ${totalTests}] ${name}`);
      console.error(`   Error: ${err.message}`);
    }
  }

  async function testAsync(name, fn) {
    totalTests++;
    try {
      await fn();
      console.log(`✅ [PASS ${totalTests}] ${name}`);
      passedTests++;
    } catch (err) {
      console.error(`❌ [FAIL ${totalTests}] ${name}`);
      console.error(`   Error: ${err.message}`);
    }
  }

  // 1. Verify Configuration & Provider Safety
  test('Email config status reports non-sensitive health indicators without exposing secrets', () => {
    const configStatus = emailService.checkEmailConfigStatus();
    assert(configStatus && typeof configStatus === 'object', 'Config status should be an object');
    assert('RESEND_API_KEY' in configStatus, 'Contains RESEND_API_KEY indicator');
    assert('EMAIL_FROM' in configStatus, 'Contains EMAIL_FROM indicator');
    assert('FRONTEND_URL' in configStatus, 'Contains FRONTEND_URL indicator');
    // Ensure no raw secrets are in the returned strings
    const serialized = JSON.stringify(configStatus);
    assert(!serialized.includes('re_'), 'Must never expose real API key values');
  });

  // 2. Mock Resend Emails prototype to intercept dispatches and verify payload correctness
  let dispatchedEmails = [];
  const originalResendApiKey = process.env.RESEND_API_KEY;
  process.env.RESEND_API_KEY = 're_test_mock_token_123456789';

  const { Resend } = require('resend');
  const dummyResend = new Resend('mock_key');
  const emailsProto = Object.getPrototypeOf(dummyResend.emails);
  const originalSend = emailsProto.send;
  const originalGet = emailsProto.get;

  emailsProto.send = async function (payload) {
    dispatchedEmails.push(payload);
    return {
      data: { id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 6)}` },
      error: null,
    };
  };

  emailsProto.get = async function (id) {
    return {
      data: {
        id,
        to: ['operator@disasterchain.org'],
        from: 'DisasterChain <onboarding@resend.dev>',
        subject: 'Test Subject',
        last_event: 'delivered',
        created_at: new Date().toISOString(),
      },
      error: null,
    };
  };

  // 3. Test Registration Verification Email Dispatch
  await testAsync('sendVerificationEmail produces correct recipient, sender, subject and Earth & Paper HTML', async () => {
    dispatchedEmails = [];
    const testEmail = 'newoperator@test.disasterchain.org';
    const testToken = 'abc123verificationtoken456';
    const result = await emailService.sendVerificationEmail({
      email: testEmail,
      name: 'Sarah Connor',
      token: testToken,
    });

    assert(result.success === true, 'Verification email dispatch should succeed');
    assert(dispatchedEmails.length === 1, 'Exactly one email dispatched');

    const email = dispatchedEmails[0];
    assert.deepStrictEqual(email.to, [testEmail], 'Correct recipient email');
    assert.strictEqual(email.from, 'DisasterChain <onboarding@resend.dev>', 'Sender must strictly be DisasterChain <onboarding@resend.dev>');
    assert.strictEqual(email.subject, 'Verify your DisasterChain account', 'Correct verification subject line');
    
    // Verify Earth & Paper Theme Tokens
    assert(email.html.includes('#F1EBDD'), 'Includes Earth Parchment background token (#F1EBDD)');
    assert(email.html.includes('#FFFDF8'), 'Includes Paper Card container token (#FFFDF8)');
    assert(email.html.includes('#1E2725'), 'Includes Primary Ink text token (#1E2725)');
    assert(email.html.includes('#496B5A'), 'Includes Forest accent token (#496B5A)');
    assert(email.html.includes('#263F35'), 'Includes Deep Pine button token (#263F35)');
    assert(email.html.includes('#DCD3C3'), 'Includes Warm border token (#DCD3C3)');
    assert(email.html.includes('DISASTERCHAIN'), 'Includes Brand Name DISASTERCHAIN');
    assert(email.html.includes('Earth Intelligence & Emergency Operations'), 'Includes brand sub-tag');
    assert(email.html.includes(`/verify-email?token=${testToken}`), 'Includes formatted verification URL with token');
    assert(email.html.includes('24 hours'), 'Specifies 24-hour validity duration');
  });

  // 4. Test Forgot Password Reset Email Dispatch
  await testAsync('sendPasswordResetEmail produces correct 15-minute reset link and sender', async () => {
    dispatchedEmails = [];
    const testEmail = 'responder@test.disasterchain.org';
    const testToken = 'resetsecrettoken789';
    const result = await emailService.sendPasswordResetEmail({
      email: testEmail,
      name: 'John Connor',
      token: testToken,
    });

    assert(result.success === true, 'Password reset email dispatch should succeed');
    assert(dispatchedEmails.length === 1, 'Exactly one email dispatched');

    const email = dispatchedEmails[0];
    assert.deepStrictEqual(email.to, [testEmail], 'Correct recipient email');
    assert.strictEqual(email.from, 'DisasterChain <onboarding@resend.dev>', 'Sender must strictly be DisasterChain <onboarding@resend.dev>');
    assert.strictEqual(email.subject, 'Reset your DisasterChain password', 'Correct reset subject line');
    
    // Verify Earth & Paper styling & tokens
    assert(email.html.includes('#F1EBDD'), 'Contains Earth & Paper background (#F1EBDD)');
    assert(email.html.includes('#263F35'), 'Contains Forest Pine action button (#263F35)');
    assert(email.html.includes(`/reset-password?token=${testToken}`), 'Contains formatted reset URL');
    assert(email.html.includes('15 minutes'), 'States 15 minutes expiration window');
  });

  // 5. Test Password Changed Email Dispatch
  await testAsync('sendPasswordChangedEmail confirms password update securely', async () => {
    dispatchedEmails = [];
    const testEmail = 'responder@test.disasterchain.org';
    const result = await emailService.sendPasswordChangedEmail({
      email: testEmail,
      name: 'John Connor',
    });

    assert(result.success === true, 'Password changed email dispatch should succeed');
    assert(dispatchedEmails.length === 1, 'Exactly one email dispatched');

    const email = dispatchedEmails[0];
    assert.deepStrictEqual(email.to, [testEmail], 'Correct recipient email');
    assert.strictEqual(email.from, 'DisasterChain <onboarding@resend.dev>', 'Sender must be DisasterChain <onboarding@resend.dev>');
    assert.strictEqual(email.subject, 'Your DisasterChain password was changed', 'Subject confirms password change');
    assert(email.html.includes('#F1EBDD'), 'Matches Earth & Paper theme');
  });

  // 6. Test Forgot Password Controller: Anti-Enumeration & Token Generation (In-Memory)
  await testAsync('authController.forgotPassword provides anti-enumeration and creates valid reset token', async () => {
    dispatchedEmails = [];

    // Setup user in memoryStore
    const testUser = {
      _id: 'user_test_reset_001',
      name: 'Elena Rostova',
      email: 'elena.rostova@disasterchain.org',
      password: 'OldPassword123!',
      role: 'volunteer',
      isVerified: true,
    };
    memoryStore.users = memoryStore.users.filter((u) => u.email !== testUser.email);
    memoryStore.users.push(testUser);

    // Helper mock req/res
    function createMockRes() {
      const res = {
        statusCode: 200,
        status(code) {
          this.statusCode = code;
          return this;
        },
        jsonData: null,
        json(data) {
          this.jsonData = data;
          return this;
        },
      };
      return res;
    }

    // A. Request for non-existent email (anti-enumeration check)
    const reqNonExistent = { body: { email: 'nonexistent@nowhere.org' } };
    const resNonExistent = createMockRes();
    await authController.forgotPassword(reqNonExistent, resNonExistent);

    assert.strictEqual(resNonExistent.statusCode, 200, 'Returns 200 for non-existent email');
    assert.strictEqual(resNonExistent.jsonData.success, true, 'Returns success: true for anti-enumeration');
    assert.strictEqual(
      resNonExistent.jsonData.message,
      'If an account is associated with that email, a password reset link has been sent to your inbox.',
      'Returns exact uniform anti-enumeration message'
    );
    assert.strictEqual(dispatchedEmails.length, 0, 'No email sent for non-existent user');

    // B. Request for existing email
    const reqExisting = { body: { email: testUser.email } };
    const resExisting = createMockRes();
    await authController.forgotPassword(reqExisting, resExisting);

    assert.strictEqual(resExisting.statusCode, 200, 'Returns 200 for existing email');
    assert.strictEqual(resExisting.jsonData.success, true, 'Returns success: true');
    assert.strictEqual(
      resExisting.jsonData.message,
      'If an account is associated with that email, a password reset link has been sent to your inbox.',
      'Returns exact same message as non-existent user'
    );
    assert.strictEqual(dispatchedEmails.length, 1, 'Dispatches reset email via Resend');

    // Inspect memory user
    const updatedUser = memoryStore.users.find((u) => u.email === testUser.email);
    assert(updatedUser.resetPasswordToken, 'Generates resetPasswordToken on user');
    assert(updatedUser.resetPasswordExpires > Date.now(), 'Token has future expiration date');
  });

  // 7. Test Reset Password Controller: Successful Reset & Invalidation
  await testAsync('authController.resetPassword successfully updates password and invalidates token', async () => {
    dispatchedEmails = [];
    const testUser = memoryStore.users.find((u) => u.email === 'elena.rostova@disasterchain.org');
    assert(testUser && testUser.resetPasswordToken, 'Test user must have active reset token');

    // We need the raw token that generated updatedUser.resetPasswordToken
    // Let's create a known token to test reset
    const knownRawToken = 'testknownrawsecrettoken999';
    testUser.resetPasswordToken = crypto.createHash('sha256').update(knownRawToken).digest('hex');
    testUser.resetPasswordExpires = Date.now() + 15 * 60 * 1000;

    function createMockRes() {
      const res = {
        statusCode: 200,
        status(code) {
          this.statusCode = code;
          return this;
        },
        jsonData: null,
        json(data) {
          this.jsonData = data;
          return this;
        },
      };
      return res;
    }

    const resetReq = {
      body: {
        token: knownRawToken,
        password: 'NewStrongPassword2026!',
        confirmPassword: 'NewStrongPassword2026!',
      },
    };
    const resetRes = createMockRes();
    await authController.resetPassword(resetReq, resetRes);

    assert.strictEqual(resetRes.statusCode, 200, 'Returns 200 OK');
    assert.strictEqual(resetRes.jsonData.success, true, 'Returns success: true');
    assert.strictEqual(testUser.password, 'NewStrongPassword2026!', 'User password updated');
    assert.strictEqual(testUser.resetPasswordToken, undefined, 'Reset token invalidated after use');
    assert.strictEqual(testUser.resetPasswordExpires, undefined, 'Reset expiration cleared');

    // Verify confirmation email was sent
    assert.strictEqual(dispatchedEmails.length, 1, 'Password changed confirmation email dispatched');
    assert.strictEqual(dispatchedEmails[0].subject, 'Your DisasterChain password was changed', 'Confirmation subject matches');

    // Attempting to reuse the same token must now fail
    const reuseRes = createMockRes();
    await authController.resetPassword(resetReq, reuseRes);
    assert.strictEqual(reuseRes.statusCode, 400, 'Reusing used token returns 400 Bad Request');
    assert.strictEqual(reuseRes.jsonData.success, false, 'Reusing token fails');
  });

  // 8. Test Error Handling when Resend fails
  await testAsync('Handles Resend service errors gracefully without unhandled exceptions', async () => {
    emailsProto.send = async () => ({
      data: null,
      error: { message: 'Network connection timeout to Resend API', name: 'ResendError' },
    });

    const result = await emailService.sendVerificationEmail({
      email: 'errortest@disasterchain.org',
      name: 'Error Test',
      token: 'some_token',
    });

    assert.strictEqual(result.success, false, 'Returns failure result when provider errors');
    assert.strictEqual(result.code, 'EMAIL_DELIVERY_FAILED', 'Returns EMAIL_DELIVERY_FAILED code');
    assert(result.error.includes('Network connection timeout'), 'Passes sanitized error message');
  });

  // Restore env & prototype
  process.env.RESEND_API_KEY = originalResendApiKey;

  console.log('\n================================================================');
  console.log(`📊 TEST SUITE SUMMARY: ${passedTests} / ${totalTests} TESTS PASSED (${Math.round((passedTests / totalTests) * 100)}%)`);
  console.log('================================================================\n');

  if (passedTests === totalTests && totalTests > 0) {
    console.log('🎉 ALL RESEND EMAIL AUTH INTEGRATION TESTS PASSED PERFECTLY!\n');
    process.exit(0);
  } else {
    console.error('⚠️ SOME TESTS FAILED.\n');
    process.exit(1);
  }
}

runTestSuite().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
