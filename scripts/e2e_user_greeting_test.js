const puppeteer = require('C:/Users/shikh/New folder/node_modules/puppeteer-core');
const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const http = require('http');
const fs = require('fs');
const path = require('path');

const BUILD_DIR = path.resolve(__dirname, '../frontend/build');
const PORT = 4175;

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

      if (urlPath === '/api/auth/me') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, data: { name: 'Rahul Sharma', email: 'rahul@example.com' } }));
        return;
      }

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

async function runE2E() {
  const server = await startServer();

  const browser = await puppeteer.launch({
    executablePath: edgePath,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  });

  try {
    const page = await browser.newPage();
    await page.setRequestInterception(true);
    let mockAuthActive = false;

    page.on('request', (req) => {
      if (req.url().includes('/auth/me')) {
        if (mockAuthActive) {
          req.respond({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              success: true,
              data: { _id: 'u1', name: 'Rahul Sharma', email: 'rahul@example.com', role: 'citizen' }
            }),
          });
          return;
        } else {
          req.respond({
            status: 401,
            contentType: 'application/json',
            body: JSON.stringify({ success: false, message: 'Not authorized' }),
          });
          return;
        }
      }
      req.continue();
    });

    // =========================================================================
    // TEST 1: Unauthenticated User Greeting (Clean without location or placeholder)
    // =========================================================================
    console.log('\n--- 1. Testing Unauthenticated User Greeting ---');
    await page.goto(`http://localhost:${PORT}/?skip_intro=1`, { waitUntil: 'networkidle2' });
    await page.evaluate(() => {
      localStorage.removeItem('disasterchain_token');
      localStorage.removeItem('disasterchain_user');
    });
    await page.reload({ waitUntil: 'networkidle2' });
    await page.waitForSelector('.dc-home-greeting-bar', { timeout: 10000 });

    const unauthState = await page.evaluate(() => {
      const greeting = document.querySelector('.dc-home-greeting-text')?.textContent.trim() || '';
      const badge = document.querySelector('.dc-home-location-pill span')?.textContent.trim() || '';
      return { greeting, badge };
    });

    console.log(`Unauthenticated Greeting: "${unauthState.greeting}"`);
    console.log(`Separate Location Badge: "${unauthState.badge}"`);

    // Verify greeting does NOT contain location
    if (unauthState.greeting.includes('Kharar') || unauthState.greeting.includes('Mumbai') || unauthState.greeting.includes('Sector')) {
      throw new Error(`❌ Unauthenticated greeting leaked location or placeholder! Found: "${unauthState.greeting}"`);
    }
    // Verify greeting matches clean time-based greeting format (e.g. "Good afternoon.")
    if (!unauthState.greeting.startsWith('Good') || !unauthState.greeting.endsWith('.')) {
      throw new Error(`❌ Invalid greeting format: "${unauthState.greeting}"`);
    }
    console.log('✅ [PASS] Unauthenticated user greeting is clean, time-based, and completely free of location/placeholder leaks.');

    // =========================================================================
    // TEST 2: Authenticated User Greeting with Name ("Rahul")
    // =========================================================================
    console.log('\n--- 2. Testing Authenticated User Greeting with Name ("Rahul") ---');
    mockAuthActive = true;
    await page.evaluate(() => {
      const mockUser = {
        _id: 'user_rahul_1',
        name: 'Rahul Sharma',
        email: 'rahul@example.com',
        role: 'citizen',
        isVerified: true
      };
      localStorage.setItem('disasterchain_token', 'mock_valid_token');
      localStorage.setItem('disasterchain_user', JSON.stringify(mockUser));
      window.location.reload();
    });

    await page.waitForNavigation({ waitUntil: 'networkidle2' });
    await page.waitForSelector('.dc-home-greeting-bar', { timeout: 10000 });

    const authState = await page.evaluate(() => {
      const greeting = document.querySelector('.dc-home-greeting-text')?.textContent.trim() || '';
      const badge = document.querySelector('.dc-home-location-pill span')?.textContent.trim() || '';
      return { greeting, badge };
    });

    console.log(`Authenticated Greeting: "${authState.greeting}"`);
    console.log(`Separate Location Badge: "${authState.badge}"`);

    if (!authState.greeting.includes('Rahul')) {
      throw new Error(`❌ Authenticated greeting did not include username! Found: "${authState.greeting}"`);
    }
    if (authState.greeting.includes('Kharar') || authState.greeting.includes('Mumbai')) {
      throw new Error(`❌ Authenticated greeting leaked location! Found: "${authState.greeting}"`);
    }
    console.log('✅ [PASS] Authenticated user greeting displays "Good [afternoon/morning/evening], Rahul."');

    // =========================================================================
    // TEST 3: Location Badge Independence
    // =========================================================================
    console.log('\n--- 3. Testing Location Badge Independence ---');
    await new Promise((r) => setTimeout(r, 600));
    await page.evaluate(() => {
      const pill = document.querySelector('.dc-home-location-pill');
      if (pill) pill.click();
    });
    await page.waitForSelector('.dc-city-modal-panel', { timeout: 8000 });

    // Select Mumbai
    await page.evaluate(() => {
      const chips = Array.from(document.querySelectorAll('.dc-popular-city-chip'));
      const chip = chips.find(c => c.textContent.includes('Mumbai'));
      if (chip) chip.click();
    });
    await new Promise(r => setTimeout(r, 600));

    const postCityChange = await page.evaluate(() => {
      const greeting = document.querySelector('.dc-home-greeting-text')?.textContent.trim() || '';
      const badge = document.querySelector('.dc-home-location-pill span')?.textContent.trim() || '';
      return { greeting, badge };
    });

    console.log(`Greeting after selecting Mumbai: "${postCityChange.greeting}"`);
    console.log(`Location Badge after selecting Mumbai: "${postCityChange.badge}"`);

    // Greeting must STILL be "Good [time], Rahul.", and badge must be Mumbai
    if (!postCityChange.greeting.includes('Rahul') || postCityChange.greeting.includes('Mumbai')) {
      throw new Error(`❌ Greeting wrongly changed with location! Found: "${postCityChange.greeting}"`);
    }
    if (!postCityChange.badge.includes('Mumbai')) {
      throw new Error(`❌ Location badge did not update to Mumbai! Found: "${postCityChange.badge}"`);
    }
    console.log('✅ [PASS] Greeting retains username ("Rahul") while location badge updates independently to Mumbai.');

    console.log('\n================================================================');
    console.log('🎉 ALL HOME PAGE USERNAME GREETING TESTS PASSED!');
    console.log('================================================================\n');
  } finally {
    await browser.close();
    server.close();
  }
}

runE2E().catch((err) => {
  console.error('Greeting E2E failed:', err);
  process.exit(1);
});
