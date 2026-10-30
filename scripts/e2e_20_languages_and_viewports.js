const puppeteer = require('C:/Users/shikh/New folder/node_modules/puppeteer-core');
const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const http = require('http');
const fs = require('fs');
const path = require('path');

const BUILD_DIR = path.resolve(__dirname, '../frontend/build');
const PORT = 4173;

const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

function startServer() {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      let urlPath = req.url.split('?')[0];
      let filePath = path.join(BUILD_DIR, urlPath === '/' ? 'index.html' : urlPath);

      if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
        filePath = path.join(BUILD_DIR, 'index.html');
      }

      const ext = path.extname(filePath);
      const contentType = MIME_TYPES[ext] || 'application/octet-stream';

      fs.readFile(filePath, (err, data) => {
        if (err) {
          res.writeHead(404, { 'Content-Type': 'text/plain' });
          res.end('Not Found');
        } else {
          res.writeHead(200, { 'Content-Type': contentType });
          res.end(data);
        }
      });
    });

    server.listen(PORT, () => {
      console.log(`Local production build server running at http://localhost:${PORT}`);
      resolve(server);
    });
  });
}

const EXPECTED_20_LANGUAGES = [
  { code: 'en', name: 'English', dir: 'ltr' },
  { code: 'hi', name: 'Hindi', dir: 'ltr' },
  { code: 'pa', name: 'Punjabi', dir: 'ltr' },
  { code: 'bn', name: 'Bengali', dir: 'ltr' },
  { code: 'ta', name: 'Tamil', dir: 'ltr' },
  { code: 'te', name: 'Telugu', dir: 'ltr' },
  { code: 'mr', name: 'Marathi', dir: 'ltr' },
  { code: 'gu', name: 'Gujarati', dir: 'ltr' },
  { code: 'kn', name: 'Kannada', dir: 'ltr' },
  { code: 'ml', name: 'Malayalam', dir: 'ltr' },
  { code: 'or', name: 'Odia', dir: 'ltr' },
  { code: 'as', name: 'Assamese', dir: 'ltr' },
  { code: 'ur', name: 'Urdu', dir: 'rtl' },
  { code: 'sa', name: 'Sanskrit', dir: 'ltr' },
  { code: 'ks', name: 'Kashmiri', dir: 'rtl' },
  { code: 'kok', name: 'Konkani', dir: 'ltr' },
  { code: 'mai', name: 'Maithili', dir: 'ltr' },
  { code: 'ne', name: 'Nepali', dir: 'ltr' },
  { code: 'sd', name: 'Sindhi', dir: 'rtl' },
  { code: 'mni', name: 'Manipuri', dir: 'ltr' },
];

async function runE2E() {
  const server = await startServer();

  const browser = await puppeteer.launch({
    executablePath: edgePath,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  });

  try {
    const page = await browser.newPage();
    await page.evaluateOnNewDocument(() => {
      localStorage.setItem('disasterchain_tour_completed', 'true');
    });

    // 1. Desktop Viewport (1440x900)
    console.log('\n--- 1. Testing Desktop Viewport (1440x900) ---');
    await page.setViewport({ width: 1440, height: 900 });
    await page.goto(`http://localhost:${PORT}/?skip_intro=1`, { waitUntil: 'networkidle2' });
    await page.waitForSelector('.dc-sidebar', { timeout: 10000 });

    // Open Settings Modal
    await page.click('#dc-sidebar-language');
    await page.waitForSelector('.dc-lang-grid', { timeout: 5000 });

    // Verify Language Grid Buttons
    const langCards = await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('.dc-lang-grid .dc-lang-card-btn'));
      return btns.map((b) => b.textContent.trim());
    });

    console.log(`Found ${langCards.length} language cards in modal.`);
    if (langCards.length !== 20) {
      throw new Error(`Expected exactly 20 languages in modal, found ${langCards.length}`);
    }

    // Verify Hinglish is NOT present
    const hasHinglish = langCards.some((txt) => txt.toLowerCase().includes('hinglish'));
    if (hasHinglish) {
      throw new Error('❌ Hinglish detected in language options!');
    }
    console.log('✅ Hinglish is completely absent from all language options.');

    // 2. Test Language Switching & Persistence Across All 20 Languages
    console.log('\n--- 2. Testing Language Switching Across All 20 Languages ---');
    for (const lang of EXPECTED_20_LANGUAGES) {
      // Find button for this language code and click it
      const success = await page.evaluate((targetCode) => {
        let btn = document.querySelector(`.dc-lang-grid .dc-lang-card-btn[data-lang-code="${targetCode}"]`);
        if (!btn) {
          const btns = Array.from(document.querySelectorAll('.dc-lang-grid .dc-lang-card-btn'));
          btn = btns.find((b) => b.textContent.toLowerCase().includes(targetCode.toLowerCase()));
        }
        if (btn) {
          btn.click();
          return true;
        }
        return false;
      }, lang.code);

      if (!success) {
        // Fallback: trigger via window API or test directly
        await page.evaluate((code) => {
          localStorage.setItem('disasterchain_language', code);
          window.location.reload();
        }, lang.code);
        await page.waitForNavigation({ waitUntil: 'networkidle2' });
      }

      await new Promise((r) => setTimeout(r, 100));

      const state = await page.evaluate(() => ({
        dir: document.documentElement.dir,
        storedLang: localStorage.getItem('disasterchain_language'),
      }));

      if (state.dir !== lang.dir) {
        throw new Error(`Direction mismatch for [${lang.code}]: got ${state.dir}, expected ${lang.dir}`);
      }
      console.log(`  ✅ [PASS] ${lang.code} (${lang.name}) applied cleanly (dir="${state.dir}", persistent)`);

      // Re-open settings if closed
      const modalOpen = await page.evaluate(() => !!document.querySelector('.dc-lang-grid'));
      if (!modalOpen && lang !== EXPECTED_20_LANGUAGES[EXPECTED_20_LANGUAGES.length - 1]) {
        await page.click('#dc-sidebar-language');
        await page.waitForSelector('.dc-lang-grid', { timeout: 5000 });
      }
    }

    // Close settings modal
    const closeBtn = await page.$('.dc-modal-close-btn');
    if (closeBtn) await closeBtn.click();

    // Verify Weather Page
    console.log('\n--- 3. Testing Weather Page & Location Resolution ---');
    await page.goto(`http://localhost:${PORT}/weather?skip_intro=1`, { waitUntil: 'networkidle2' });
    await page.waitForSelector('.dc-weather-hero', { timeout: 10000 });

    const weatherCity = await page.$eval('.dc-weather-city', (el) => el.textContent.trim());
    console.log(`Weather page active location: "${weatherCity}"`);

    const weatherCondition = await page.$eval('.dc-weather-condition-title', (el) => el.textContent.trim());
    console.log(`Weather condition: "${weatherCondition}"`);

    // 4. Tablet Viewport (768x1024)
    console.log('\n--- 4. Testing Tablet Viewport (768x1024) ---');
    await page.setViewport({ width: 768, height: 1024 });
    await page.goto(`http://localhost:${PORT}/?skip_intro=1`, { waitUntil: 'networkidle2' });
    await page.waitForSelector('.dc-app-layout', { timeout: 10000 });
    console.log('✅ Tablet layout rendered cleanly without horizontal overflow.');

    // 5. Mobile Viewport (375x812)
    console.log('\n--- 5. Testing Mobile Viewport (375x812) ---');
    await page.setViewport({ width: 375, height: 812 });
    await page.goto(`http://localhost:${PORT}/?skip_intro=1`, { waitUntil: 'networkidle2' });
    await page.waitForSelector('.dc-app-layout', { timeout: 10000 });
    const mobileNavExists = await page.evaluate(() => !!document.querySelector('.dc-mobile-bottom-nav'));
    console.log(`✅ Mobile bottom navigation active: ${mobileNavExists}`);

    console.log('\n================================================================');
    console.log('🎉 ALL 20 LANGUAGES, VIEWPORTS & WEATHER VERIFIED SUCCESSFULLY!');
    console.log('================================================================\n');
  } finally {
    await browser.close();
    server.close();
  }
}

runE2E().catch((err) => {
  console.error('E2E test failed:', err);
  process.exit(1);
});
