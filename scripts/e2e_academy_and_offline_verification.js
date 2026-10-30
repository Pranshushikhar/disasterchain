const puppeteer = require('puppeteer-core');
const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const path = require('path');
const express = require('../backend/node_modules/express');
const http = require('http');

const ARTIFACT_DIR = 'C:\\Users\\shikh\\.gemini\\antigravity-ide\\brain\\04542bf0-b323-41ac-a81d-2056569b8398';

(async () => {
  console.log('================================================================');
  console.log('🧪 DISASTERCHAIN: ACADEMY & OFFLINE EMERGENCY MODE E2E SUITE');
  console.log('================================================================');

  const app = express();
  app.use(express.json());

  // Mount backend API routes
  const aiRoutes = require('../backend/routes/aiAssistantRoutes');
  const academyRoutes = require('../backend/routes/academyRoutes');
  app.use('/api/ai', aiRoutes);
  app.use('/api/academy', academyRoutes);

  // Health endpoint
  app.get('/api/health', (req, res) => res.json({ status: 'ok', service: 'DisasterChain E2E' }));

  // Static build
  app.use(express.static(path.join(__dirname, '../frontend/build')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
  });

  const PORT = 5199;
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(PORT, resolve));
  console.log(`✅ Test server running on http://localhost:${PORT}`);

  const browser = await puppeteer.launch({
    executablePath: edgePath,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  let totalTests = 0;
  let passedTests = 0;

  function assert(condition, message) {
    totalTests++;
    if (!condition) {
      console.error(`  ❌ [FAIL] ${message}`);
      throw new Error(`Assertion Failed: ${message}`);
    }
    passedTests++;
    console.log(`  ✅ [PASS] ${message}`);
  }

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });

    await page.evaluateOnNewDocument(() => {
      localStorage.clear();
      localStorage.setItem('disasterchain_tour_completed', 'true');
    });

    await page.setRequestInterception(true);
    page.on('request', async (interceptedRequest) => {
      const url = interceptedRequest.url();
      if (url.includes('/api/')) console.log('  🌐 Request to:', url);
      if (url.includes('/api/ai/conversational-chat')) {
        if (interceptedRequest.method() === 'OPTIONS') {
          interceptedRequest.respond({
            status: 200,
            headers: {
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
              'Access-Control-Allow-Headers': '*',
            },
            body: '',
          });
          return;
        }

        try {
          const postData = JSON.parse(interceptedRequest.postData() || '{}');
          console.log('  🤖 Intercepted chat message:', postData.message);
          const { processConversationalChat } = require('../backend/services/conversationalAIService');
          const result = await processConversationalChat({
            message: postData.message,
            conversation: postData.conversation,
            latitude: postData.latitude,
            longitude: postData.longitude,
            location: postData.location,
            language: postData.language,
          });
          console.log('  🤖 Result action:', result?.action);
          interceptedRequest.respond({
            status: 200,
            headers: {
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Headers': '*',
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ success: true, data: result }),
          });
        } catch (e) {
          console.error('  ❌ [INTERCEPTION ERROR]:', e);
          interceptedRequest.respond({
            status: 500,
            headers: {
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Headers': '*',
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ success: false, error: e.message }),
          });
        }
      } else {
        interceptedRequest.continue();
      }
    });

    // -------------------------------------------------------------
    // PHASE 1: DISASTER ACADEMY DASHBOARD (/academy)
    // -------------------------------------------------------------
    console.log('\n--- Phase 1: Disaster Academy Dashboard (/academy) ---');
    await page.goto(`http://localhost:${PORT}/academy`, { waitUntil: 'networkidle0' });
    await sleep(800);

    const heroTag = await page.$eval('.dc-hero-tag', (el) => el.innerText);
    assert(heroTag.includes('ACADEMY'), `Hero tag identifies Disaster Academy (Got: "${heroTag}")`);

    const academyTitle = await page.$eval('.dc-academy-hero-title', (el) => el.innerText);
    assert(academyTitle.length > 5, `Hero headline loaded (Got: "${academyTitle}")`);

    const statCards = await page.$$('.dc-hud-stat-card');
    assert(statCards.length === 4, `HUD displays 4 telemetry stats cards (Found ${statCards.length})`);

    const courseCards = await page.$$('.dc-course-card');
    assert(courseCards.length >= 10, `Loaded authorized safety courses (Found ${courseCards.length} courses)`);

    // Test Search input
    await page.type('.dc-search-input', 'Earthquake');
    await sleep(400);
    const filteredCards = await page.$$('.dc-course-card');
    assert(filteredCards.length > 0 && filteredCards.length < courseCards.length, `Course search filters to matching items (${filteredCards.length} items)`);

    // -------------------------------------------------------------
    // PHASE 2: COURSE VIEWER, DIAGRAM, CHECKPOINT & QUIZ
    // -------------------------------------------------------------
    console.log('\n--- Phase 2: Course Viewer, Diagram, Checkpoint & Quiz ---');
    await page.goto(`http://localhost:${PORT}/academy/course/earthquake-safety`, { waitUntil: 'networkidle0' });
    await sleep(800);

    const courseHeadline = await page.$eval('.dc-course-headline', (el) => el.innerText);
    assert(courseHeadline.includes('Earthquake'), `Course headline matches (Got: "${courseHeadline}")`);

    const syllabusItems = await page.$$('.dc-lesson-nav-item');
    assert(syllabusItems.length >= 4, `Course contains step-by-step lesson syllabus (Found ${syllabusItems.length} items)`);

    // Verify Practical Steps and Diagram
    const hasDiagram = await page.$('.dc-academy-diagram-container');
    assert(Boolean(hasDiagram), 'Interactive safety schematic diagram rendered in lesson');

    const stepsBox = await page.$('.dc-practical-steps-box');
    assert(Boolean(stepsBox), 'Actionable practical survival steps displayed');

    // Test Knowledge Checkpoint interaction
    const checkpointOptions = await page.$$('.dc-checkpoint-opt');
    if (checkpointOptions.length > 0) {
      await checkpointOptions[0].click();
      await sleep(200);
      const submitCheckpointBtn = await page.$('.dc-checkpoint-submit-btn');
      if (submitCheckpointBtn) {
        await submitCheckpointBtn.click();
        await sleep(300);
        const feedback = await page.$('.dc-feedback-box');
        assert(Boolean(feedback), 'Knowledge checkpoint evaluated with instant feedback');
      }
    }

    // Switch to End-of-Course Quiz via Curriculum syllabus navigation
    const quizNavItem = await page.$('.dc-quiz-nav-item');
    assert(Boolean(quizNavItem), 'Curriculum sidebar contains Knowledge Assessment exam option');
    await page.evaluate((el) => el.click(), quizNavItem);
    await sleep(800);

    const viewerHtml = await page.$eval('.dc-course-content-viewer', (el) => el.innerHTML);
    console.log("VIEWER HTML SNIPPET:\n", viewerHtml.substring(0, 350));

    const quizCards = await page.$$('.dc-quiz-card');
    assert(quizCards.length >= 4, `End-of-course quiz loaded 4 multiple-choice questions (Found ${quizCards.length})`);

    // Correct answer indices for earthquake-safety: [1, 2, 0, 2]
    const correctIndices = [1, 2, 0, 2];
    for (let i = 0; i < quizCards.length; i++) {
      const opts = await quizCards[i].$$('.dc-quiz-opt-btn');
      const targetIdx = correctIndices[i] || 0;
      if (opts[targetIdx]) {
        await page.evaluate((el) => el.click(), opts[targetIdx]);
        await sleep(200);
      }
    }
    await sleep(500);

    const submitQuizBtn = await page.$('.dc-quiz-footer-actions button');
    assert(Boolean(submitQuizBtn), 'Quiz submit button present');
    await page.evaluate((el) => el.click(), submitQuizBtn);
    await sleep(1500);

    const quizScoreNum = await page.$eval('.dc-score-num', (el) => el.innerText);
    assert(quizScoreNum === '100%', `Quiz passed with 100% score (Got: "${quizScoreNum}")`);

    // Test Certificate Modal trigger
    const certBtn = await page.$('.dc-result-cta-row button');
    assert(Boolean(certBtn), 'View Completion Certificate button present upon passing');
    await page.evaluate((el) => el.click(), certBtn);
    await sleep(800);

    const certModal = await page.$('.dc-certificate-modal-wrapper');
    assert(Boolean(certModal), 'Certificate modal opened successfully');

    const certTitle = await page.$eval('.dc-cert-main-title', (el) => el.innerText);
    assert(certTitle.includes('CERTIFICATE'), `Certificate title rendered (Got: "${certTitle}")`);

    const disclaimer = await page.$eval('.dc-cert-disclaimer', (el) => el.innerText);
    assert(disclaimer.includes('educational completion') && disclaimer.includes('governmental'), 'Certificate carries explicit non-accredited educational disclaimer');

    const certScreenshotPath = path.join(ARTIFACT_DIR, 'academy_course_and_certificate_verified.png');
    await page.screenshot({ path: certScreenshotPath });
    console.log(`  📸 Saved screenshot: ${certScreenshotPath}`);

    const closeCertBtn = await page.$('.dc-cert-close-btn');
    if (closeCertBtn) await page.evaluate((el) => el.click(), closeCertBtn);
    await sleep(400);

    // -------------------------------------------------------------
    // PHASE 3: SCENARIO SIMULATIONS (/academy/simulations)
    // -------------------------------------------------------------
    console.log('\n--- Phase 3: Scenario Simulations (/academy/simulations) ---');
    await page.goto(`http://localhost:${PORT}/academy/simulations`, { waitUntil: 'networkidle0' });
    await sleep(800);

    const simHeading = await page.$eval('.dc-sim-main-heading', (el) => el.innerText);
    assert(simHeading.includes('Simulations'), `Simulations heading loaded (Got: "${simHeading}")`);

    const simCards = await page.$$('.dc-sim-card-btn');
    assert(simCards.length >= 4, `Loaded branching disaster scenarios (Found ${simCards.length})`);

    // Select second scenario
    await page.evaluate((el) => el.click(), simCards[1]);
    await sleep(400);

    // Make an interactive choice in simulation
    const choices = await page.$$('.dc-sim-action-option-btn');
    assert(choices.length >= 2, `Scenario presented branching decision options (Found ${choices.length})`);
    await page.evaluate((el) => el.click(), choices[0]);
    await sleep(400);

    const consequence = await page.$('.dc-sim-consequence-card');
    assert(Boolean(consequence), 'Consequence card revealed consequence of decision');

    const simScreenshotPath = path.join(ARTIFACT_DIR, 'academy_simulation_verified.png');
    await page.screenshot({ path: simScreenshotPath });
    console.log(`  📸 Saved screenshot: ${simScreenshotPath}`);

    // -------------------------------------------------------------
    // PHASE 4: OFFLINE EMERGENCY MODE (/offline)
    // -------------------------------------------------------------
    console.log('\n--- Phase 4: Offline Emergency Mode (/offline) ---');
    await page.goto(`http://localhost:${PORT}/offline`, { waitUntil: 'networkidle0' });
    await sleep(800);

    const statusBar = await page.$('.dc-offline-status-bar');
    assert(Boolean(statusBar), 'Minimal high-contrast status bar present');

    const hotlines = await page.$$('.dc-hotline-card');
    assert(hotlines.length >= 6, `Verified emergency hotlines displayed with direct calling (Found ${hotlines.length})`);

    // Verify hotline direct tel: link
    const firstCallBtnHref = await page.$eval('.dc-hotline-call-btn', (el) => el.getAttribute('href'));
    assert(firstCallBtnHref && firstCallBtnHref.startsWith('tel:'), `Emergency hotline uses direct carrier protocol (Got: "${firstCallBtnHref}")`);

    // Switch to Safety Guides tab
    const tabs = await page.$$('.dc-offline-tab-btn');
    // Tab 1 is Safety Guides
    await page.evaluate((el) => el.click(), tabs[1]);
    await sleep(400);

    const guideItems = await page.$$('.dc-guide-accordion-header');
    assert(guideItems.length >= 8, `Pre-cached safety guides loaded (Found ${guideItems.length} guides)`);

    // Expand guide
    await page.evaluate((el) => el.click(), guideItems[0]);
    await sleep(300);
    const verifiedTag = await page.$('.dc-guide-verified-tag');
    assert(Boolean(verifiedTag), 'Guide includes verified authority tag');

    // Switch to Checklists tab (Tab index 2)
    await page.evaluate((el) => el.click(), tabs[2]);
    await sleep(400);

    const checkItems = await page.$$('.dc-checklist-item-btn');
    assert(checkItems.length >= 4, `Checklist items present (Found ${checkItems.length})`);
    await page.evaluate((el) => el.click(), checkItems[0]);
    await sleep(200);
    const isChecked = await page.evaluate((el) => el.classList.contains('checked'), checkItems[0]);
    assert(isChecked, 'Checklist item toggles checked state on user click');

    // Switch to Personal Plan & Medical tab (Tab index 3)
    await page.evaluate((el) => el.click(), tabs[3]);
    await sleep(400);

    const consentNotice = await page.$('.dc-consent-box');
    assert(Boolean(consentNotice), 'Sensitive emergency data consent notice displayed');

    const medicalConsentCheckbox = await page.$('.dc-consent-label input[type="checkbox"]');
    if (medicalConsentCheckbox) {
      await page.evaluate((el) => el.click(), medicalConsentCheckbox);
      await sleep(300);
      const isConsentGranted = await page.$eval('.dc-consent-label input[type="checkbox"]', (el) => el.checked);
      assert(isConsentGranted, 'Medical consent enabled with explicit user confirmation');
    }

    const offlineScreenshotPath = path.join(ARTIFACT_DIR, 'offline_emergency_mode_verified.png');
    await page.screenshot({ path: offlineScreenshotPath });
    console.log(`  📸 Saved screenshot: ${offlineScreenshotPath}`);

    // -------------------------------------------------------------
    // PHASE 5: REAL SERVICE WORKER & BROWSER OFFLINE RELOAD
    // -------------------------------------------------------------
    console.log('\n--- Phase 5: Service Worker & Real Offline Reload Test ---');
    await page.goto(`http://localhost:${PORT}/offline?enable_sw=1`, { waitUntil: 'networkidle0' });
    await sleep(1500);

    // Emulate completely offline network via Chrome DevTools Protocol
    const client = await page.target().createCDPSession();
    await client.send('Network.enable');
    await client.send('Network.emulateNetworkConditions', {
      offline: true,
      latency: 0,
      downloadThroughput: -1,
      uploadThroughput: -1,
    });
    console.log('  🌐 Network connectivity emulated as DISCONNECTED (OFFLINE)');
    await sleep(600);

    // Trigger offline event in browser
    await page.evaluate(() => {
      window.dispatchEvent(new Event('offline'));
    });
    await sleep(400);

    const offlineDot = await page.$('.dc-status-dot.offline');
    assert(Boolean(offlineDot), 'Status indicator dynamically updated to OFFLINE state');

    // Reload the page while completely offline
    console.log('  🔄 Reloading page while network is disabled...');
    await page.reload({ waitUntil: 'domcontentloaded' });
    await sleep(1000);

    const reloadedHotlines = await page.$$('.dc-hotline-card');
    assert(reloadedHotlines.length >= 6, `Page loaded successfully from Service Worker cache while offline! (Found ${reloadedHotlines.length} hotlines)`);

    const offlineReloadScreenshotPath = path.join(ARTIFACT_DIR, 'offline_service_worker_cached_reload_verified.png');
    await page.screenshot({ path: offlineReloadScreenshotPath });
    console.log(`  📸 Saved screenshot: ${offlineReloadScreenshotPath}`);

    // Restore online network
    await client.send('Network.emulateNetworkConditions', {
      offline: false,
      latency: 0,
      downloadThroughput: -1,
      uploadThroughput: -1,
    });
    await page.evaluate(() => {
      window.dispatchEvent(new Event('online'));
    });
    await sleep(600);
    await client.detach();

    // -------------------------------------------------------------
    // PHASE 6: UNIFIED AI ASSISTANT ACADEMY & OFFLINE QUERIES
    // -------------------------------------------------------------
    console.log('\n--- Phase 6: Unified AI Assistant Integration ---');
    await page.goto(`http://localhost:${PORT}/`, { waitUntil: 'networkidle0' });
    await sleep(800);

    // Open Unified AI Assistant
    const aiBtn = await page.$('#dc-global-voice-assistant-btn');
    assert(Boolean(aiBtn), 'Single unified floating assistant button (#dc-global-voice-assistant-btn) present');
    await page.evaluate((el) => el.click(), aiBtn);
    await sleep(1500);

    const inputSelector = '#dc-voice-chat-input';
    await page.waitForSelector(inputSelector, { timeout: 10000 });

    async function sendChat(text) {
      await page.waitForSelector(inputSelector, { timeout: 10000 });
      await page.focus(inputSelector);
      await page.keyboard.down('Control');
      await page.keyboard.press('KeyA');
      await page.keyboard.up('Control');
      await page.keyboard.press('Backspace');
      await page.keyboard.type(text, { delay: 15 });
      await sleep(400);
      await page.click('#dc-voice-send-btn');
    }

    // Send query: "Open Disaster Academy"
    await sendChat('Open Disaster Academy');
    
    // Wait for navigation to /academy
    await page.waitForFunction(() => window.location.pathname === '/academy', { timeout: 10000 });
    let currentUrl = page.url();
    console.log('  🌐 Current URL after query:', currentUrl);
    assert(currentUrl.includes('/academy'), `Query "Open Disaster Academy" navigates user to /academy (Got: "${currentUrl}")`);

    // Ensure chat window is open for second query
    await sleep(1500);
    let chatInput = await page.$(inputSelector);
    if (!chatInput) {
      const aiBtn2 = await page.$('#dc-global-voice-assistant-btn');
      if (aiBtn2) await page.evaluate((el) => el.click(), aiBtn2);
      await sleep(1500);
    }

    await sendChat('Turn on Offline Emergency Mode');
    
    // Wait for navigation to /offline
    await page.waitForFunction(() => window.location.pathname === '/offline', { timeout: 10000 });
    currentUrl = page.url();
    console.log('  🌐 Current URL after second query:', currentUrl);
    assert(currentUrl.includes('/offline'), `Query "Turn on Offline Emergency Mode" navigates user to /offline (Got: "${currentUrl}")`);

    const aiIntegrationScreenshotPath = path.join(ARTIFACT_DIR, 'ai_assistant_academy_offline_integration_verified.png');
    await page.screenshot({ path: aiIntegrationScreenshotPath });
    console.log(`  📸 Saved screenshot: ${aiIntegrationScreenshotPath}`);

    console.log('\n================================================================');
    console.log(`🎉 ALL E2E VERIFICATION TESTS PASSED: ${passedTests}/${totalTests}`);
    console.log('================================================================\n');

  } catch (err) {
    console.error('❌ E2E TEST CRITICAL ERROR:', err);
    process.exitCode = 1;
  } finally {
    await browser.close();
    server.close();
    console.log('Browser and local test server closed.');
    process.exit(process.exitCode || 0);
  }
})();
