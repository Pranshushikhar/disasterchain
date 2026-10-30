const puppeteer = require('C:/Users/shikh/New folder/node_modules/puppeteer-core');
const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const http = require('http');
const fs = require('fs');
const path = require('path');

const BUILD_DIR = path.resolve(__dirname, '../frontend/build');
const PORT = 4174;

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
      console.log(`Local production server running at http://localhost:${PORT}`);
      resolve(server);
    });
  });
}

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

    // =========================================================================
    // SCENARIO 1: Select Kharar
    // =========================================================================
    console.log('\n--- SCENARIO 1: Select Kharar & Verify Single Source of Truth ---');
    await page.goto(`http://localhost:${PORT}/?skip_intro=1`, { waitUntil: 'networkidle2' });
    await page.waitForSelector('.dc-home-greeting-bar', { timeout: 10000 });

    // Open City Selector
    await page.click('.dc-home-location-pill');
    await page.waitForSelector('.dc-city-modal-panel', { timeout: 5000 });

    // Click 'Kharar' in popular cities
    const clickedKharar = await page.evaluate(() => {
      const chips = Array.from(document.querySelectorAll('.dc-popular-city-chip'));
      const found = chips.find((c) => c.textContent.includes('Kharar'));
      if (found) {
        found.click();
        return true;
      }
      return false;
    });

    if (!clickedKharar) throw new Error('Kharar chip not found in popular cities grid');
    await new Promise((r) => setTimeout(r, 600));

    // Verify Greeting and Badge
    const state1 = await page.evaluate(() => {
      const greeting = document.querySelector('.dc-home-greeting-text')?.textContent.trim() || '';
      const badge = document.querySelector('.dc-home-location-pill span')?.textContent.trim() || '';
      return { greeting, badge };
    });

    console.log(`  Greeting: "${state1.greeting}"`);
    console.log(`  Location Badge: "${state1.badge}"`);

    if (!state1.greeting.includes('Kharar')) {
      throw new Error(`❌ Greeting does not contain Kharar! Found: "${state1.greeting}"`);
    }
    if (state1.greeting.includes('Mumbai')) {
      throw new Error(`❌ Fatal Regression: Greeting contains Mumbai while Kharar is selected!`);
    }
    if (!state1.badge.includes('Kharar')) {
      throw new Error(`❌ Location badge does not contain Kharar! Found: "${state1.badge}"`);
    }
    console.log('  ✅ [PASS] Greeting and Badge both strictly display Kharar with ZERO Mumbai mismatch.');

    // =========================================================================
    // SCENARIO 2: Select Mumbai
    // =========================================================================
    console.log('\n--- SCENARIO 2: Select Mumbai & Immediate Dynamic Update ---');
    await page.click('.dc-home-location-pill');
    await page.waitForSelector('.dc-city-modal-panel', { timeout: 5000 });

    const clickedMumbai = await page.evaluate(() => {
      const chips = Array.from(document.querySelectorAll('.dc-popular-city-chip'));
      const found = chips.find((c) => c.textContent.includes('Mumbai'));
      if (found) {
        found.click();
        return true;
      }
      return false;
    });

    if (!clickedMumbai) throw new Error('Mumbai chip not found');
    await new Promise((r) => setTimeout(r, 600));

    const state2 = await page.evaluate(() => {
      const greeting = document.querySelector('.dc-home-greeting-text')?.textContent.trim() || '';
      const badge = document.querySelector('.dc-home-location-pill span')?.textContent.trim() || '';
      return { greeting, badge };
    });

    console.log(`  Greeting: "${state2.greeting}"`);
    console.log(`  Location Badge: "${state2.badge}"`);

    if (!state2.greeting.includes('Mumbai') || !state2.badge.includes('Mumbai')) {
      throw new Error(`❌ Mismatch: Expected Mumbai in both greeting and badge!`);
    }
    console.log('  ✅ [PASS] Components immediately updated to Mumbai.');

    // =========================================================================
    // SCENARIO 3: Refresh the Page & Ensure Location Persistence
    // =========================================================================
    console.log('\n--- SCENARIO 3: Page Reload & Persistence ---');
    await page.reload({ waitUntil: 'networkidle2' });
    await page.waitForSelector('.dc-home-greeting-bar', { timeout: 10000 });

    const state3 = await page.evaluate(() => {
      const greeting = document.querySelector('.dc-home-greeting-text')?.textContent.trim() || '';
      const badge = document.querySelector('.dc-home-location-pill span')?.textContent.trim() || '';
      return { greeting, badge };
    });

    console.log(`  Post-reload Greeting: "${state3.greeting}"`);
    console.log(`  Post-reload Badge: "${state3.badge}"`);

    if (!state3.greeting.includes('Mumbai') || !state3.badge.includes('Mumbai')) {
      throw new Error('❌ Persistence failed: Reload reverted or changed location!');
    }
    console.log('  ✅ [PASS] Selected location (Mumbai) persisted consistently across refresh.');

    // =========================================================================
    // SCENARIO 4: Switch Back to Kharar & Check Weather Tab Synchronization
    // =========================================================================
    console.log('\n--- SCENARIO 4: Switch Back to Kharar & Verify Weather Page ---');
    await page.click('.dc-home-location-pill');
    await page.waitForSelector('.dc-city-modal-panel', { timeout: 5000 });

    await page.evaluate(() => {
      const chips = Array.from(document.querySelectorAll('.dc-popular-city-chip'));
      const found = chips.find((c) => c.textContent.includes('Kharar'));
      if (found) found.click();
    });
    await new Promise((r) => setTimeout(r, 600));

    // Navigate to Weather tab
    await page.goto(`http://localhost:${PORT}/weather?skip_intro=1`, { waitUntil: 'networkidle2' });
    await page.waitForSelector('.dc-weather-hero', { timeout: 10000 });

    const weatherPageInfo = await page.evaluate(() => {
      const city = document.querySelector('.dc-weather-city')?.textContent.trim() || '';
      const badge = document.querySelector('.dc-weather-location-pill span')?.textContent.trim() || '';
      return { city, badge };
    });

    console.log(`  Weather City: "${weatherPageInfo.city}"`);
    console.log(`  Weather Badge: "${weatherPageInfo.badge}"`);

    if (!weatherPageInfo.city.includes('Kharar')) {
      throw new Error(`❌ Weather page city does not match Kharar! Found: "${weatherPageInfo.city}"`);
    }
    console.log('  ✅ [PASS] Weather tab is 100% synchronized with the active location (Kharar).');

    // =========================================================================
    // SCENARIO 5: Rapid Location Switching (Race Condition Protection)
    // =========================================================================
    console.log('\n--- SCENARIO 5: Rapid Location Switching (Race Condition Test) ---');
    await page.goto(`http://localhost:${PORT}/?skip_intro=1`, { waitUntil: 'networkidle2' });
    await page.waitForSelector('.dc-home-greeting-bar', { timeout: 10000 });

    // Rapidly switch: Kharar -> Bengaluru -> Mumbai -> Kharar
    for (const target of ['Bengaluru', 'Mumbai', 'Kharar']) {
      await page.click('.dc-home-location-pill');
      await page.waitForSelector('.dc-city-modal-panel', { timeout: 5000 });
      await page.evaluate((t) => {
        const chips = Array.from(document.querySelectorAll('.dc-popular-city-chip'));
        const found = chips.find((c) => c.textContent.includes(t));
        if (found) found.click();
      }, target);
      await new Promise((r) => setTimeout(r, 40)); // Rapid click!
    }

    await new Promise((r) => setTimeout(r, 1200));

    const finalState = await page.evaluate(() => {
      const greeting = document.querySelector('.dc-home-greeting-text')?.textContent.trim() || '';
      const badge = document.querySelector('.dc-home-location-pill span')?.textContent.trim() || '';
      return { greeting, badge };
    });

    console.log(`  Final Greeting: "${finalState.greeting}"`);
    console.log(`  Final Badge: "${finalState.badge}"`);

    if (!finalState.greeting.includes('Kharar') || !finalState.badge.includes('Kharar')) {
      throw new Error(`❌ Race condition detected: Final state did not settle on Kharar!`);
    }
    console.log('  ✅ [PASS] Rapid location switching handled with zero stale response overwrite.');

    console.log('\n================================================================');
    console.log('🎉 ALL LOCATION SINGLE SOURCE OF TRUTH VERIFICATIONS PASSED!');
    console.log('================================================================\n');
  } finally {
    await browser.close();
    server.close();
  }
}

runE2E().catch((err) => {
  console.error('Location E2E failed:', err);
  process.exit(1);
});
