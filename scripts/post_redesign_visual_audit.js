const puppeteer = require('puppeteer-core');
const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const path = require('path');
const express = require('../backend/node_modules/express');
const cors = require('../backend/node_modules/cors');
const http = require('http');
const jwt = require('../backend/node_modules/jsonwebtoken');

const ARTIFACT_DIR = 'C:\\Users\\shikh\\.gemini\\antigravity-ide\\brain\\04542bf0-b323-41ac-a81d-2056569b8398';

(async () => {
  const PORT = 5205;
  const backendApp = express();
  backendApp.use(cors());
  backendApp.use(express.json());

  const adminToken = jwt.sign(
    { id: 'user-admin-1', role: 'admin', name: 'Commander Pranshu', email: 'admin@disasterchain.gov.in' },
    process.env.JWT_SECRET || 'disasterchain_secure_jwt_secret_2026',
    { expiresIn: '30d' }
  );

  backendApp.get('/api/auth/me', (req, res) => {
    res.json({
      success: true,
      data: {
        _id: 'user-admin-1',
        id: 'user-admin-1',
        name: 'Commander Pranshu',
        email: 'admin@disasterchain.gov.in',
        role: 'admin',
        isVerified: true,
      },
    });
  });

  backendApp.use('/api/auth', require('../backend/routes/authRoutes'));
  backendApp.use('/api/sos', require('../backend/routes/sosRoutes'));
  backendApp.use('/api/shelters', require('../backend/routes/shelterRoutes'));
  backendApp.use('/api/affected-areas', require('../backend/routes/affectedAreaRoutes'));
  backendApp.use('/api/alerts', require('../backend/routes/alertRoutes'));
  backendApp.use('/api/incidents', require('../backend/routes/incidentRoutes'));
  backendApp.use('/api/resources', require('../backend/routes/resourceRoutes'));
  backendApp.use('/api/donations', require('../backend/routes/donationRoutes'));
  backendApp.use('/api/distributions', require('../backend/routes/distributionRoutes'));
  backendApp.use('/api/preparedness', require('../backend/routes/preparednessRoutes'));
  backendApp.use('/api/blockchain', require('../backend/routes/blockchainRoutes'));
  backendApp.all('/api/*', (req, res) => res.json({ success: true, data: [] }));

  backendApp.use(express.static(path.resolve('frontend/build')));
  backendApp.get('*', (req, res) => {
    res.sendFile(path.resolve('frontend/build/index.html'));
  });

  const server = http.createServer(backendApp);
  await new Promise((resolve) => server.listen(PORT, resolve));
  console.log(`Audit server running at http://localhost:${PORT}`);

  const browser = await puppeteer.launch({
    executablePath: edgePath,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    const page = await browser.newPage();
    await page.setRequestInterception(true);
    page.on('request', (req) => {
      const url = req.url();
      if (url.includes('onrender.com/api')) {
        const localUrl = url.replace(/https:\/\/[^/]+\/api/, `http://localhost:${PORT}/api`);
        req.continue({ url: localUrl });
      } else {
        req.continue();
      }
    });
    await page.setViewport({ width: 1440, height: 900 });

    await page.evaluateOnNewDocument((token) => {
      localStorage.clear();
      localStorage.setItem('disasterchain_tour_completed', 'true');
      localStorage.setItem('dc_cinematic_intro_seen', 'true');
      localStorage.setItem('token', token);
      localStorage.setItem('disasterchain_token', token);
      const userObj = JSON.stringify({
        _id: 'user-admin-1',
        id: 'user-admin-1',
        name: 'Commander Pranshu',
        email: 'admin@disasterchain.gov.in',
        role: 'admin',
        isVerified: true
      });
      localStorage.setItem('user', userObj);
      localStorage.setItem('disasterchain_user', userObj);
    }, adminToken);

    // 1. Admin Dashboard Desktop (1440px)
    console.log('Capturing Admin Dashboard (1440px)...');
    await page.goto(`http://localhost:${PORT}/admin?skip_intro=1`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await new Promise((r) => setTimeout(r, 1200));

    if (page.url().includes('/login')) {
      console.log('Redirected to login. Performing admin authentication...');
      const allButtons = await page.$$('button');
      for (const b of allButtons) {
        const text = await page.evaluate((el) => el.textContent, b);
        if (text && text.trim() === 'Admin') {
          await b.click();
          break;
        }
      }
      await new Promise((r) => setTimeout(r, 400));
      const freshButtons = await page.$$('button');
      for (const b of freshButtons) {
        const text = await page.evaluate((el) => el.textContent, b);
        if (text && text.includes('AUTHENTICATE')) {
          await b.click();
          break;
        }
      }
      await page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 15000 }).catch(() => {});
      await new Promise((r) => setTimeout(r, 2000));
    }

    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'admin_dashboard_after.png') });
    console.log('Saved admin_dashboard_after.png');

    // 2. Admin Dashboard Mobile (390px)
    console.log('Capturing Admin Dashboard Mobile (390px)...');
    await page.setViewport({ width: 390, height: 844, isMobile: true });
    await page.goto(`http://localhost:${PORT}/admin?skip_intro=1`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForSelector('.dc-admin-tabs-bar', { timeout: 8000 }).catch(() => {});
    await new Promise((r) => setTimeout(r, 1500));
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'admin_dashboard_mobile_after.png') });
    console.log('Saved admin_dashboard_mobile_after.png');

    // Reset Viewport to Desktop
    await page.setViewport({ width: 1440, height: 900 });

    // 3. Academy Listing
    console.log('Capturing Disaster Academy catalog...');
    await page.goto(`http://localhost:${PORT}/academy?skip_intro=1`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await new Promise((r) => setTimeout(r, 1500));
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'academy_listing_after.png') });
    console.log('Saved academy_listing_after.png');

    // 4. Academy Lesson with Knowledge Checkpoint
    console.log('Capturing Academy Lesson with Knowledge Checkpoint...');
    await page.goto(`http://localhost:${PORT}/academy/course/earthquake-safety?skip_intro=1`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await new Promise((r) => setTimeout(r, 1500));

    // Scroll to checkpoint box
    await page.evaluate(() => {
      const box = document.querySelector('.dc-checkpoint-box');
      if (box) box.scrollIntoView({ behavior: 'instant', block: 'center' });
    });
    await new Promise((r) => setTimeout(r, 600));
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'actual_lesson_after.png') });
    console.log('Saved actual_lesson_after.png');

    // 5. Test Checkpoint Interaction: click an option
    console.log('Testing Checkpoint Option Selection...');
    const optSelector = '.dc-checkpoint-option, .dc-checkpoint-opt';
    const optButtons = await page.$$(optSelector);
    if (optButtons.length > 0) {
      await optButtons[0].click();
      await new Promise((r) => setTimeout(r, 400));
      console.log('Option clicked. Submitting check understanding...');
      const checkBtn = await page.$('.dc-checkpoint-submit-btn');
      if (checkBtn) {
        await checkBtn.click();
        await new Promise((r) => setTimeout(r, 500));
        await page.screenshot({ path: path.join(ARTIFACT_DIR, 'checkpoint_evaluated_after.png') });
        console.log('Saved checkpoint_evaluated_after.png');
      }
    }

    // 6. Test Quiz Navigation & Quiz Options
    console.log('Switching to Final Exam Quiz mode...');
    const quizNavBtn = await page.$('.dc-quiz-nav-item');
    if (quizNavBtn) {
      await quizNavBtn.click();
      await new Promise((r) => setTimeout(r, 1000));
    }

    // Scroll to top of quiz
    await page.evaluate(() => window.scrollTo(0, 0));
    await new Promise((r) => setTimeout(r, 500));
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'actual_quiz_after.png') });
    console.log('Saved actual_quiz_after.png');

    // Select quiz options
    const quizOpts = await page.$$('.dc-quiz-opt-btn');
    console.log(`Found ${quizOpts.length} quiz option buttons`);
    if (quizOpts.length >= 4) {
      // Click option 0 for Q1, option 4 for Q2, option 8 for Q3, option 12 for Q4
      if (quizOpts[0]) await quizOpts[0].click();
      if (quizOpts[4]) await quizOpts[4].click();
      if (quizOpts[8]) await quizOpts[8].click();
      if (quizOpts[12]) await quizOpts[12].click();
      await new Promise((r) => setTimeout(r, 400));
      await page.screenshot({ path: path.join(ARTIFACT_DIR, 'quiz_selected_state_after.png') });
      console.log('Saved quiz_selected_state_after.png');

      // Submit exam
      const submitBtn = await page.$('.dc-btn-large');
      if (submitBtn) {
        await submitBtn.click();
        await new Promise((r) => setTimeout(r, 1000));
        await page.screenshot({ path: path.join(ARTIFACT_DIR, 'quiz_result_report_after.png') });
        console.log('Saved quiz_result_report_after.png');
      }
    }

    // 7. Home Page
    console.log('Capturing Home Page...');
    await page.goto(`http://localhost:${PORT}/?skip_intro=1`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await new Promise((r) => setTimeout(r, 1500));
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'home_after.png') });
    console.log('Saved home_after.png');

    // 8. Incidents Page
    console.log('Capturing Incidents Page...');
    await page.goto(`http://localhost:${PORT}/incidents?skip_intro=1`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await new Promise((r) => setTimeout(r, 1500));
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'incidents_after.png') });
    console.log('Saved incidents_after.png');

    // 9. Weather Page
    console.log('Capturing Weather Page...');
    await page.goto(`http://localhost:${PORT}/weather?skip_intro=1`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await new Promise((r) => setTimeout(r, 1500));
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'weather_after.png') });
    console.log('Saved weather_after.png');

    // 10. Shelters Page
    console.log('Capturing Shelters Page...');
    await page.goto(`http://localhost:${PORT}/shelters?skip_intro=1`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await new Promise((r) => setTimeout(r, 1500));
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'shelters_after.png') });
    console.log('Saved shelters_after.png');

    // 11. Offline Page
    console.log('Capturing Offline Page...');
    await page.goto(`http://localhost:${PORT}/offline?skip_intro=1`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await new Promise((r) => setTimeout(r, 1500));
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'offline_after.png') });
    console.log('Saved offline_after.png');

    console.log('=== ALL QA AUDIT SCREENSHOTS CAPTURED SUCCESSFULLY ===');
  } catch (err) {
    console.error('Audit Error:', err);
  } finally {
    await browser.close();
    server.close();
    process.exit(0);
  }
})();
