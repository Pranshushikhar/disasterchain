const puppeteer = require('puppeteer-core');
const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const path = require('path');
const express = require('../backend/node_modules/express');
const cors = require('../backend/node_modules/cors');
const http = require('http');
const jwt = require('../backend/node_modules/jsonwebtoken');

const ARTIFACT_DIR = 'C:\\Users\\shikh\\.gemini\\antigravity-ide\\brain\\04542bf0-b323-41ac-a81d-2056569b8398';

(async () => {
  const PORT = 5198;
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

  backendApp.use(express.static(path.join(__dirname, '../frontend/build')));
  backendApp.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
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
    await page.setViewport({ width: 1440, height: 900 });

    await page.evaluateOnNewDocument((token) => {
      localStorage.clear();
      localStorage.setItem('disasterchain_tour_completed', 'true');
      localStorage.setItem('disasterchain_token', token);
      localStorage.setItem(
        'disasterchain_user',
        JSON.stringify({
          _id: 'user-admin-1',
          id: 'user-admin-1',
          name: 'Commander Pranshu',
          email: 'admin@disasterchain.gov.in',
          role: 'admin',
          isVerified: true,
        })
      );
    }, adminToken);

    await page.setRequestInterception(true);
    page.on('request', (interceptedRequest) => {
      const url = interceptedRequest.url();
      if (url.includes('/api/')) {
        const apiPath = url.substring(url.indexOf('/api/'));
        interceptedRequest.continue({
          url: `http://localhost:${PORT}${apiPath}`,
        });
      } else {
        interceptedRequest.continue();
      }
    });

    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

    // 1. Admin Dashboard
    console.log('Capturing Admin Dashboard...');
    await page.goto(`http://localhost:${PORT}/admin?skip_intro=1`, { waitUntil: 'networkidle2', timeout: 30000 });
    await sleep(2000);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'admin_dashboard_before.png'), fullPage: false });

    // 2. Disaster Academy Course Listing
    console.log('Capturing Disaster Academy...');
    await page.goto(`http://localhost:${PORT}/academy?skip_intro=1`, { waitUntil: 'networkidle2', timeout: 30000 });
    await sleep(2000);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'academy_listing_before.png'), fullPage: false });

    // 3. Academy Lesson Page
    console.log('Capturing Academy Lesson Page...');
    await page.goto(`http://localhost:${PORT}/academy/course/course-1?skip_intro=1`, { waitUntil: 'networkidle2', timeout: 30000 });
    await sleep(2000);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'academy_lesson_before.png'), fullPage: false });

    // 4. Academy Quiz View
    console.log('Capturing Academy Quiz View...');
    await page.goto(`http://localhost:${PORT}/academy/course/course-1?quiz=true&skip_intro=1`, { waitUntil: 'networkidle2', timeout: 30000 });
    await sleep(2000);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'academy_quiz_before.png'), fullPage: false });

    // 5. Home Page
    console.log('Capturing Home Page...');
    await page.goto(`http://localhost:${PORT}/?skip_intro=1`, { waitUntil: 'networkidle2', timeout: 30000 });
    await sleep(2000);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'home_before.png'), fullPage: false });

    console.log('✅ Audit screenshots captured successfully!');
  } catch (err) {
    console.error('Audit failed:', err);
  } finally {
    await browser.close();
    server.close();
  }
})();
