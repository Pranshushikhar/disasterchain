/**
 * DisasterChain - Resend Transactional Email & Auth Flow Test Suite
 * Validates real transactional email configuration, template rendering,
 * registration verification dispatch, forgot-password reset dispatch,
 * invalid/expired verification token handling, invalid/expired reset token handling,
 * anti-enumeration, Resend provider failure handling, and missing API key behavior.
 */

const assert = require('assert');
const crypto = require('crypto');
const emailService = require('./services/emailService');
const memoryStore = require('./config/memoryStore');
const authController = require('./controllers/authController');

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

  // Preserve initial environment
  const originalResendApiKey = process.env.RESEND_API_KEY;

  // ---------------------------------------------------------------------------
  // 1. API KEY MISSING BEHAVIOR & CONFIGURATION
  // ---------------------------------------------------------------------------
  delete process.env.RESEND_API_KEY;

  test('Missing API key reports unconfigured status without throwing or leaking secrets', () => {
    const configStatus = emailService.checkEmailConfigStatus();
    assert(configStatus && typeof configStatus === 'object', 'Config status should be an object');
    assert.strictEqual(configStatus.RESEND_API_KEY, '✗ missing', 'Reports missing API key status');
    assert(configStatus.EMAIL_FROM.includes('onboarding@resend.dev'), 'Default testing sender configured');
    assert(configStatus.FRONTEND_URL.includes('https://disasterchain.vercel.app'), 'Production Vercel frontend URL configured');
  });

  await testAsync('Missing API key returns EMAIL_DELIVERY_FAILED result safely without crashing', async () => {
    const result = await emailService.sendVerificationEmail({
      email: 'unconfigured@disasterchain.org',
      name: 'Unconfigured Test',
      token: 'mocktoken123',
    });

    assert.strictEqual(result.success, false, 'Dispatch fails gracefully when API key is missing');
    assert.strictEqual(result.code, 'EMAIL_DELIVERY_FAILED', 'Returns standard EMAIL_DELIVERY_FAILED code');
    assert.strictEqual(result.status, 'unconfigured', 'Indicates unconfigured provider status');
    assert.strictEqual(result.mode, 'none', 'Indicates no active provider mode');
  });

  // ---------------------------------------------------------------------------
  // 2. MOCK RESEND ENGINE FOR AUTOMATED TESTING
  // ---------------------------------------------------------------------------
  process.env.RESEND_API_KEY = 're_test_mock_token_123456789';
  let dispatchedEmails = [];

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

  // ---------------------------------------------------------------------------
  // 3. REGISTRATION TRIGGERS VERIFICATION EMAIL
  // ---------------------------------------------------------------------------
  await testAsync('User registration triggers real verification email dispatch with correct payload and styling', async () => {
    dispatchedEmails = [];
    const testRegEmail = `cadet_${Date.now()}@disasterchain.org`;
    const regReq = {
      body: {
        name: 'Cadet Anya',
        email: testRegEmail,
        password: 'SecurePassword2026!',
        confirmPassword: 'SecurePassword2026!',
        role: 'volunteer',
      },
    };
    const regRes = createMockRes();
    await authController.register(regReq, regRes);

    assert.strictEqual(regRes.statusCode, 201, 'Registration returns 201 Created');
    assert.strictEqual(regRes.jsonData.success, true, 'Registration succeeds');
    assert.strictEqual(dispatchedEmails.length, 1, 'Exactly one verification email was dispatched via Resend');

    const email = dispatchedEmails[0];
    assert.deepStrictEqual(email.to, [testRegEmail], 'Recipient matches registered email address');
    assert.strictEqual(email.from, 'DisasterChain <onboarding@resend.dev>', 'Sender strictly matches DisasterChain <onboarding@resend.dev>');
    assert.strictEqual(email.subject, 'Verify your DisasterChain account', 'Subject strictly matches: Verify your DisasterChain account');

    // Email Design & Content Verification (Earth & Paper Identity)
    assert(email.html.includes('#F1EBDD'), 'Contains Earth Parchment background token (#F1EBDD)');
    assert(email.html.includes('#FFFDF8'), 'Contains Paper Card container token (#FFFDF8)');
    assert(email.html.includes('#1E2725'), 'Contains Primary Ink typography token (#1E2725)');
    assert(email.html.includes('#496B5A'), 'Contains Forest badge accent token (#496B5A)');
    assert(email.html.includes('#263F35'), 'Contains Deep Pine action button token (#263F35)');
    assert(email.html.includes('#DCD3C3'), 'Contains Warm border token (#DCD3C3)');
    assert(email.html.includes('DISASTERCHAIN'), 'Displays DisasterChain branding');
    assert(email.html.includes('VERIFY EMAIL'), 'Contains clear VERIFY EMAIL button');
    assert(email.html.includes('24 hours'), 'Specifies 24-hour expiration duration');
    assert(email.html.includes('/verify-email?token='), 'Contains verification link to frontend route');
    assert(email.html.includes('disregard this transmission'), 'Includes security disclaimer note');

    // Plain text alternative
    assert(email.text && email.text.includes('/verify-email?token='), 'Contains plain text alternative URL');
  });

  // ---------------------------------------------------------------------------
  // 4. INVALID & EXPIRED VERIFICATION TOKEN
  // ---------------------------------------------------------------------------
  await testAsync('Email verification rejects invalid verification token with 400 Bad Request', async () => {
    const invalidReq = { body: { token: 'completely_bogus_token_xyz999' } };
    const invalidRes = createMockRes();
    await authController.verifyEmail(invalidReq, invalidRes);

    assert.strictEqual(invalidRes.statusCode, 400, 'Invalid token returns 400 Bad Request');
    assert.strictEqual(invalidRes.jsonData.success, false, 'Invalid verification fails');
    assert(
      invalidRes.jsonData.message.includes('Invalid') || invalidRes.jsonData.message.includes('expired'),
      'Error message notes token is invalid or expired'
    );
  });

  await testAsync('Email verification rejects expired verification token with 400 Bad Request', async () => {
    // Inject expired user into memoryStore
    const expiredTokenRaw = 'expired_raw_token_111222';
    const expiredTokenHash = crypto.createHash('sha256').update(expiredTokenRaw).digest('hex');
    const expiredUser = {
      _id: 'expired_user_001',
      name: 'Expired Subject',
      email: 'expired@disasterchain.org',
      password: 'HashPassword123!',
      role: 'citizen',
      isVerified: false,
      verificationToken: expiredTokenHash,
      rawToken: expiredTokenRaw,
      verificationTokenExpires: Date.now() - 3600 * 1000, // Expired 1 hour ago
    };
    memoryStore.users.push(expiredUser);

    const expiredReq = { body: { token: expiredTokenRaw } };
    const expiredRes = createMockRes();
    await authController.verifyEmail(expiredReq, expiredRes);

    assert.strictEqual(expiredRes.statusCode, 400, 'Expired token returns 400 Bad Request');
    assert.strictEqual(expiredRes.jsonData.success, false, 'Expired verification fails');
    assert.strictEqual(expiredUser.isVerified, false, 'Expired user remains unverified');
  });

  await testAsync('Email verification succeeds with valid token and dispatches welcome email', async () => {
    dispatchedEmails = [];
    const validRawToken = 'valid_active_token_333444';
    const validTokenHash = crypto.createHash('sha256').update(validRawToken).digest('hex');
    const validUser = {
      _id: 'valid_user_002',
      name: 'Dr. Marcus Vance',
      email: 'marcus.vance@disasterchain.org',
      password: 'SecurePassword123!',
      role: 'responder',
      isVerified: false,
      verificationToken: validTokenHash,
      rawToken: validRawToken,
      verificationTokenExpires: Date.now() + 24 * 3600 * 1000,
    };
    memoryStore.users.push(validUser);

    const verifyReq = { body: { token: validRawToken } };
    const verifyRes = createMockRes();
    await authController.verifyEmail(verifyReq, verifyRes);

    assert.strictEqual(verifyRes.statusCode, 200, 'Valid verification returns 200 OK');
    assert.strictEqual(verifyRes.jsonData.success, true, 'Verification succeeds');
    assert.strictEqual(validUser.isVerified, true, 'User is marked verified in store');
    assert.strictEqual(validUser.verificationToken, undefined, 'Verification token cleared after activation');
    assert(verifyRes.jsonData.token, 'Returns authenticated JWT token upon successful email verification');
  });

  // ---------------------------------------------------------------------------
  // 5. FORGOT PASSWORD TRIGGERS RESET EMAIL & ANTI-ENUMERATION
  // ---------------------------------------------------------------------------
  await testAsync('Forgot password triggers reset email with anti-enumeration protection', async () => {
    dispatchedEmails = [];

    const existingUser = {
      _id: 'user_reset_test_003',
      name: 'Maya Lin',
      email: 'maya.lin@disasterchain.org',
      password: 'CurrentPassword123!',
      role: 'ngo',
      isVerified: true,
    };
    memoryStore.users = memoryStore.users.filter((u) => u.email !== existingUser.email);
    memoryStore.users.push(existingUser);

    // A. Test non-existent user returns exact anti-enumeration response
    const nonExistentReq = { body: { email: 'nobody_here@disasterchain.org' } };
    const nonExistentRes = createMockRes();
    await authController.forgotPassword(nonExistentReq, nonExistentRes);

    assert.strictEqual(nonExistentRes.statusCode, 200, 'Non-existent account returns 200 OK');
    assert.strictEqual(nonExistentRes.jsonData.success, true, 'Returns success: true for anti-enumeration');
    const antiEnumMsg = nonExistentRes.jsonData.message;
    assert(antiEnumMsg.includes('If an account is associated with that email'), 'Uniform anti-enumeration message returned');
    assert.strictEqual(dispatchedEmails.length, 0, 'No email dispatched for non-existent account');

    // B. Test existing user triggers real email and returns identical message
    const existingReq = { body: { email: existingUser.email } };
    const existingRes = createMockRes();
    await authController.forgotPassword(existingReq, existingRes);

    assert.strictEqual(existingRes.statusCode, 200, 'Existing account returns 200 OK');
    assert.strictEqual(existingRes.jsonData.success, true, 'Returns success: true');
    assert.strictEqual(existingRes.jsonData.message, antiEnumMsg, 'Returns identical message (zero enumeration leakage)');
    assert.strictEqual(dispatchedEmails.length, 1, 'Exactly one reset email dispatched via Resend');

    const resetEmail = dispatchedEmails[0];
    assert.deepStrictEqual(resetEmail.to, [existingUser.email], 'Recipient matches requested email');
    assert.strictEqual(resetEmail.from, 'DisasterChain <onboarding@resend.dev>', 'Sender is DisasterChain <onboarding@resend.dev>');
    assert.strictEqual(resetEmail.subject, 'Reset your DisasterChain password', 'Subject strictly matches: Reset your DisasterChain password');
    assert(resetEmail.html.includes('RESET PASSWORD'), 'Contains RESET PASSWORD action button');
    assert(resetEmail.html.includes('15 minutes'), 'Mentions 15-minute token expiry');
    assert(resetEmail.html.includes('/reset-password?token='), 'Link points to frontend reset-password route');
    assert(resetEmail.html.includes('disregard this transmission'), 'Contains security disclaimer');
    assert(resetEmail.text && resetEmail.text.includes('/reset-password?token='), 'Contains plain text fallback link');
  });

  // ---------------------------------------------------------------------------
  // 6. INVALID & EXPIRED PASSWORD RESET TOKEN
  // ---------------------------------------------------------------------------
  await testAsync('Password reset rejects invalid reset token with 400 Bad Request', async () => {
    const invalidResetReq = {
      body: {
        token: 'invalid_reset_token_code_999',
        password: 'NewValidPassword2026!',
        confirmPassword: 'NewValidPassword2026!',
      },
    };
    const invalidResetRes = createMockRes();
    await authController.resetPassword(invalidResetReq, invalidResetRes);

    assert.strictEqual(invalidResetRes.statusCode, 400, 'Invalid reset token returns 400 Bad Request');
    assert.strictEqual(invalidResetRes.jsonData.success, false, 'Invalid reset token fails');
  });

  await testAsync('Password reset rejects expired reset token with 400 Bad Request', async () => {
    const rawExpiredResetToken = 'expired_raw_reset_token_555';
    const hashedExpiredResetToken = crypto.createHash('sha256').update(rawExpiredResetToken).digest('hex');

    const userWithExpiredReset = {
      _id: 'user_expired_reset_004',
      name: 'Expired Reset User',
      email: 'expired.reset@disasterchain.org',
      password: 'CurrentPassword123!',
      role: 'citizen',
      isVerified: true,
      resetPasswordToken: hashedExpiredResetToken,
      resetPasswordExpires: Date.now() - 60 * 1000, // Expired 1 minute ago
    };
    memoryStore.users.push(userWithExpiredReset);

    const expiredResetReq = {
      body: {
        token: rawExpiredResetToken,
        password: 'BrandNewPassword2026!',
        confirmPassword: 'BrandNewPassword2026!',
      },
    };
    const expiredResetRes = createMockRes();
    await authController.resetPassword(expiredResetReq, expiredResetRes);

    assert.strictEqual(expiredResetRes.statusCode, 400, 'Expired reset token returns 400 Bad Request');
    assert.strictEqual(expiredResetRes.jsonData.success, false, 'Expired reset token rejected');
    assert.strictEqual(userWithExpiredReset.password, 'CurrentPassword123!', 'Password remains unchanged');
  });

  await testAsync('Password reset succeeds with valid token, updates password, clears token, and sends confirmation', async () => {
    dispatchedEmails = [];
    const validResetToken = 'valid_raw_reset_token_777';
    const hashedValidResetToken = crypto.createHash('sha256').update(validResetToken).digest('hex');

    const userValidReset = {
      _id: 'user_valid_reset_005',
      name: 'Rohan Sharma',
      email: 'rohan.sharma@disasterchain.org',
      password: 'OldPassword123!',
      role: 'volunteer',
      isVerified: true,
      resetPasswordToken: hashedValidResetToken,
      resetPasswordExpires: Date.now() + 15 * 60 * 1000,
    };
    memoryStore.users.push(userValidReset);

    const validResetReq = {
      body: {
        token: validResetToken,
        password: 'UpdatedSecurePass2026!',
        confirmPassword: 'UpdatedSecurePass2026!',
      },
    };
    const validResetRes = createMockRes();
    await authController.resetPassword(validResetReq, validResetRes);

    assert.strictEqual(validResetRes.statusCode, 200, 'Valid reset returns 200 OK');
    assert.strictEqual(validResetRes.jsonData.success, true, 'Reset succeeds');
    assert.strictEqual(userValidReset.password, 'UpdatedSecurePass2026!', 'User password successfully updated');
    assert.strictEqual(userValidReset.resetPasswordToken, undefined, 'Reset token cleared after single use');
    assert.strictEqual(userValidReset.resetPasswordExpires, undefined, 'Reset expiration cleared');

    // Verify confirmation email was sent
    assert.strictEqual(dispatchedEmails.length, 1, 'Password changed confirmation email dispatched');
    assert.strictEqual(dispatchedEmails[0].subject, 'Your DisasterChain password was changed', 'Confirmation subject matches');

    // Replay attack prevention: Same token fails immediately on second use
    const replayRes = createMockRes();
    await authController.resetPassword(validResetReq, replayRes);
    assert.strictEqual(replayRes.statusCode, 400, 'Replay attack blocked: single-use token cannot be reused');
  });

  // ---------------------------------------------------------------------------
  // 7. RESEND SERVICE FAILURE HANDLING
  // ---------------------------------------------------------------------------
  await testAsync('Handles Resend network errors gracefully without crashing or leaking secrets', async () => {
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
    assert(!result.error.includes('re_'), 'Never leaks API key in error message');
  });

  await testAsync('Handles Resend sandbox restrictions gracefully and marks isSandboxRestriction', async () => {
    emailsProto.send = async () => ({
      data: null,
      error: {
        message: 'You can only send testing emails to your own email address (onboarding@resend.dev)',
        name: 'validation_error',
      },
    });

    const result = await emailService.sendPasswordResetEmail({
      email: 'unverified_sandbox_user@disasterchain.org',
      name: 'Sandbox User',
      token: 'sandbox_token',
    });

    assert.strictEqual(result.success, false, 'Returns failure object on sandbox error');
    assert.strictEqual(result.isSandboxRestriction, true, 'Accurately detects Resend sandbox limitation');
  });

  // Restore env & prototype
  process.env.RESEND_API_KEY = originalResendApiKey;
  emailsProto.send = originalSend;
  emailsProto.get = originalGet;

  console.log('\n================================================================');
  console.log(`📊 TEST SUITE SUMMARY: ${passedTests} / ${totalTests} TESTS PASSED (${Math.round((passedTests / totalTests) * 100)}%)`);
  console.log('================================================================\n');

  if (passedTests === totalTests && totalTests >= 10) {
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
