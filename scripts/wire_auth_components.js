const fs = require('fs');
const path = require('path');

// 1. RegisterPage.jsx
const regPath = path.join(__dirname, '../frontend/src/pages/RegisterPage.jsx');
let reg = fs.readFileSync(regPath, 'utf8');

reg = reg.replace(
  '>Account Created<',
  '>{t(\'auth.accountCreated\', \'Account Created\')}<'
);
reg = reg.replace(
  'A verification link was dispatched to <strong>{registeredEmail}</strong>. Please check your inbox to activate your account.',
  "{t('auth.verificationDispatched', 'A verification link was dispatched to {{email}}. Please check your inbox to activate your account.').replace('{{email}}', registeredEmail)}"
);
reg = reg.replace(
  "{resending ? 'Dispatching...' : 'Resend Verification Link'}",
  "{resending ? t('common.loading', 'Dispatching...') : t('auth.resendLink', 'Resend Verification Link')}"
);
reg = reg.replace(
  '>Proceed to Sign In<',
  '>{t(\'auth.proceedLogin\', \'Proceed to Sign In\')}<'
);
reg = reg.replace(
  'CITIZEN & RESPONDER ENROLLMENT',
  "{t('auth.registerSubtitle', 'CITIZEN & RESPONDER ENROLLMENT')}"
);
reg = reg.replace(
  '>Create DisasterChain Account<',
  '>{t(\'auth.registerTitle\', \'Create DisasterChain Account\')}<'
);
reg = reg.replace(
  'Register to submit verified hazard reports, access emergency shelter reserves, and coordinate local community relief.',
  "{t('auth.registerDesc', 'Register to submit verified hazard reports, access emergency shelter reserves, and coordinate local community relief.')}"
);
reg = reg.replace('>Full Name<', ">{t('auth.name', 'Full Name')}<");
reg = reg.replace('>Email Address<', ">{t('auth.email', 'Email Address')}<");
reg = reg.replace('>Community Role<', ">{t('auth.role', 'Community Role')}<");
reg = reg.replace(
  '<option value="citizen">Citizen (General Access & Safety Updates)</option>',
  '<option value="citizen">{t(\'auth.roleCitizen\', \'Citizen (General Access & Safety Updates)\')}</option>'
);
reg = reg.replace(
  '<option value="volunteer">Volunteer (On-ground Community Aid)</option>',
  '<option value="volunteer">{t(\'auth.roleVolunteer\', \'Volunteer (On-ground Community Aid)\')}</option>'
);
reg = reg.replace(
  '<option value="ngo">NGO / Relief Organization</option>',
  '<option value="ngo">{t(\'auth.roleNgo\', \'NGO / Relief Organization\')}</option>'
);
reg = reg.replace(
  '<option value="responder">First Responder (Official Dispatch Team)</option>',
  '<option value="responder">{t(\'auth.roleResponder\', \'First Responder (Official Dispatch Team)\')}</option>'
);
reg = reg.replace('>Password<', ">{t('auth.password', 'Password')}<");
reg = reg.replace('8+ Characters', "{t('auth.criteriaLength', '8+ Characters')}");
reg = reg.replace('Uppercase Letter', "{t('auth.criteriaUpper', 'Uppercase Letter')}");
reg = reg.replace('Lowercase Letter', "{t('auth.criteriaLower', 'Lowercase Letter')}");
reg = reg.replace('Number (0-9)', "{t('auth.criteriaNumber', 'Number (0-9)')}");
reg = reg.replace('Special Symbol (!@#$)', "{t('auth.criteriaSpecial', 'Special Symbol (!@#$)')}");
reg = reg.replace('>Confirm Password<', ">{t('auth.confirmPassword', 'Confirm Password')}<");
reg = reg.replace(
  "{loading ? 'Creating Account...' : 'Create Account'}",
  "{loading ? t('common.loading', 'Creating Account...') : t('auth.registerBtn', 'Create Account')}"
);
fs.writeFileSync(regPath, reg, 'utf8');
console.log('RegisterPage.jsx updated');

// 2. ForgotPasswordPage.jsx
const fpPath = path.join(__dirname, '../frontend/src/pages/ForgotPasswordPage.jsx');
let fp = fs.readFileSync(fpPath, 'utf8');
fp = fp.replace('PASSWORD RECOVERY', "{t('auth.credentialReset', 'PASSWORD RECOVERY')}");
fp = fp.replace('>Account Recovery<', ">{t('auth.forgotPasswordTitle', 'Account Recovery')}<");
fp = fp.replace(
  'Submit your registered email address to verify identity and reset your authentication credentials.',
  "{t('auth.forgotPasswordDesc', 'Submit your registered email address to verify identity and reset your authentication credentials.')}"
);
fp = fp.replace('>Recovery Request Submitted<', ">{t('auth.recoveryLogged', 'Recovery Request Submitted')}<");
fp = fp.replace('Enter Recovery Code →', "{t('auth.enterCode', 'Enter Recovery Code →')}");
fp = fp.replace('>Back to Sign In<', ">{t('auth.returnToSignIn', 'Back to Sign In')}<");
fp = fp.replace('>Registered Email Address<', ">{t('auth.email', 'Registered Email Address')}<");
fp = fp.replace(
  "{loading ? 'Submitting Request...' : 'Send Recovery Instructions'}",
  "{loading ? t('common.loading', 'Submitting Request...') : t('auth.sendResetLink', 'Send Recovery Instructions')}"
);
fp = fp.replace('Have a recovery code?', "{t('auth.enterCode', 'Have a recovery code?')}");
fs.writeFileSync(fpPath, fp, 'utf8');
console.log('ForgotPasswordPage.jsx updated');

// 3. ResetPasswordPage.jsx
const rpPath = path.join(__dirname, '../frontend/src/pages/ResetPasswordPage.jsx');
let rp = fs.readFileSync(rpPath, 'utf8');
rp = rp.replace('CREDENTIAL RESET', "{t('auth.credentialReset', 'CREDENTIAL RESET')}");
rp = rp.replace('>Set New Password<', ">{t('auth.resetPasswordTitle', 'Set New Password')}<");
rp = rp.replace(
  'Enter your verification recovery code and define your new secure account password.',
  "{t('auth.resetPasswordDesc', 'Enter your verification recovery code and define your new secure account password.')}"
);
rp = rp.replace('>Password Reset Successfully<', ">{t('auth.keyResetSuccess', 'Password Reset Successfully')}<");
rp = rp.replace('>Proceed to Sign In<', ">{t('auth.proceedLogin', 'Proceed to Sign In')}<");
rp = rp.replace('>New Password<', ">{t('auth.newPassword', 'New Password')}<");
rp = rp.replace('8+ Characters', "{t('auth.criteriaLength', '8+ Characters')}");
rp = rp.replace('Uppercase (A-Z)', "{t('auth.criteriaUpper', 'Uppercase (A-Z)')}");
rp = rp.replace('Lowercase (a-z)', "{t('auth.criteriaLower', 'Lowercase (a-z)')}");
rp = rp.replace('Number (0-9)', "{t('auth.criteriaNumber', 'Number (0-9)')}");
rp = rp.replace('Special (!@#...)', "{t('auth.criteriaSpecial', 'Special (!@#...)')}");
rp = rp.replace('>Confirm New Password<', ">{t('auth.confirmPassword', 'Confirm New Password')}<");
rp = rp.replace(
  "{loading ? 'Updating Credentials...' : 'Update Password'}",
  "{loading ? t('common.loading', 'Updating Credentials...') : t('auth.resetBtn', 'Update Password')}"
);
rp = rp.replace("Don't have a recovery code yet?", "{t('auth.dontHaveAccount', \"Don't have a recovery code yet?\")}");
rp = rp.replace('>Request Recovery<', ">{t('auth.requestFreshToken', 'Request Recovery')}<");
fs.writeFileSync(rpPath, rp, 'utf8');
console.log('ResetPasswordPage.jsx updated');

// 4. VerifyEmailPage.jsx
const vePath = path.join(__dirname, '../frontend/src/pages/VerifyEmailPage.jsx');
let ve = fs.readFileSync(vePath, 'utf8');
ve = ve.replace('>Validating Email Signature...<', ">{t('auth.validatingToken', 'Validating Email Signature...')}<");
ve = ve.replace(
  'Confirming account registration and initializing operational clearances.',
  "{t('auth.validatingDesc', 'Confirming account registration and initializing operational clearances.')}"
);
ve = ve.replace('EMAIL VERIFIED', "{t('auth.identityVerified', 'EMAIL VERIFIED')}");
ve = ve.replace('>Account Activated<', ">{t('auth.clearanceConfirmed', 'Account Activated')}<");
ve = ve.replace(
  'Your email credentials have been authenticated. You now possess full active clearance on DisasterChain.',
  "{t('auth.identityVerifiedDesc', 'Your email credentials have been authenticated. You now possess full active clearance on DisasterChain.')}"
);
ve = ve.replace('Proceed to Sign In →', "{t('auth.proceedLogin', 'Proceed to Sign In →')}");
ve = ve.replace('VERIFICATION EXPIRED', "{t('auth.verificationRejected', 'VERIFICATION EXPIRED')}");
ve = ve.replace('>Token Invalid or Expired<', ">{t('auth.tokenInvalid', 'Token Invalid or Expired')}<");
ve = ve.replace('>Request Fresh Verification Link<', ">{t('auth.requestFreshToken', 'Request Fresh Verification Link')}<");
ve = ve.replace(
  "{resending ? 'Sending...' : 'Resend Verification Link'}",
  "{resending ? t('common.loading', 'Sending...') : t('auth.resendBtn', 'Resend Verification Link')}"
);
ve = ve.replace('>Return to Sign In<', ">{t('auth.returnToSignIn', 'Return to Sign In')}<");
fs.writeFileSync(vePath, ve, 'utf8');
console.log('VerifyEmailPage.jsx updated');

// 5. LoginPage.jsx
const lpPath = path.join(__dirname, '../frontend/src/pages/LoginPage.jsx');
let lp = fs.readFileSync(lpPath, 'utf8');
lp = lp.replace('OPERATOR AUTHENTICATION', "{t('auth.authSubtitle', 'OPERATOR AUTHENTICATION')}");
lp = lp.replace(
  'Access real-time crisis intelligence, hazard dispatch, and community safety registries.',
  "{t('auth.loginSubtitle', 'Access real-time crisis intelligence, hazard dispatch, and community safety registries.')}"
);
lp = lp.replace(
  "{resending ? 'Sending verification...' : 'Resend verification email'}",
  "{resending ? t('common.loading', 'Sending verification...') : t('auth.resendBtn', 'Resend verification email')}"
);
lp = lp.replace('<span>Demo Evaluation:</span>', "<span>{t('auth.demoAccess', 'Demo Evaluation:')}</span>");
lp = lp.replace('>Student<', ">{t('auth.demoStudent', 'Civilian Account')}<");
lp = lp.replace('>Admin<', ">{t('auth.demoAdmin', 'System Administrator')}<");
fs.writeFileSync(lpPath, lp, 'utf8');
console.log('LoginPage.jsx updated');

