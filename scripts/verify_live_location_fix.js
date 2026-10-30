const puppeteer = require('C:/Users/shikh/New folder/node_modules/puppeteer-core');
const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const https = require('https');

const LIVE_URL = 'https://disasterchain.vercel.app';

function checkLiveHttp() {
  return new Promise((resolve, reject) => {
    https.get(LIVE_URL, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          dataLength: data.length
        });
      });
    }).on('error', reject);
  });
}

async function verifyLive() {
  console.log(`Checking HTTP status of ${LIVE_URL}...`);
  const httpRes = await checkLiveHttp();
  console.log(`HTTP Status: ${httpRes.statusCode}`);
  console.log(`Vercel Deployment Header (x-vercel-id): ${httpRes.headers['x-vercel-id'] || 'None'}`);

  const browser = await puppeteer.launch({
    executablePath: edgePath,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });

  try {
    const page = await browser.newPage();
    await page.evaluateOnNewDocument(() => {
      localStorage.setItem('disasterchain_tour_completed', 'true');
    });

    console.log(`Navigating to ${LIVE_URL}/?skip_intro=1 ...`);
    await page.goto(`${LIVE_URL}/?skip_intro=1`, { waitUntil: 'networkidle2', timeout: 60000 });
    await page.waitForSelector('.dc-home-greeting-bar', { timeout: 15000 });

    // 1. Initial State Check
    const initial = await page.evaluate(() => {
      const greeting = document.querySelector('.dc-home-greeting-text')?.textContent.trim() || '';
      const badge = document.querySelector('.dc-home-location-pill span')?.textContent.trim() || '';
      return { greeting, badge };
    });

    console.log('\n--- Initial Live Site State ---');
    console.log(`Greeting: "${initial.greeting}"`);
    console.log(`Location Badge: "${initial.badge}"`);

    // 2. Select Kharar explicitly in CitySelectorModal
    console.log('\n--- Selecting Kharar on Live Site ---');
    await page.click('.dc-home-location-pill');
    await page.waitForSelector('.dc-city-modal-panel', { timeout: 8000 });

    const khararClicked = await page.evaluate(() => {
      const chips = Array.from(document.querySelectorAll('.dc-popular-city-chip'));
      const chip = chips.find(c => c.textContent.includes('Kharar'));
      if (chip) {
        chip.click();
        return true;
      }
      return false;
    });

    if (!khararClicked) throw new Error('Kharar chip not found on live site');
    await new Promise(r => setTimeout(r, 800));

    const khararState = await page.evaluate(() => {
      const greeting = document.querySelector('.dc-home-greeting-text')?.textContent.trim() || '';
      const badge = document.querySelector('.dc-home-location-pill span')?.textContent.trim() || '';
      return { greeting, badge };
    });

    console.log(`Live Greeting after selecting Kharar: "${khararState.greeting}"`);
    console.log(`Live Badge after selecting Kharar: "${khararState.badge}"`);

    if (!khararState.greeting.includes('Kharar') || !khararState.badge.includes('Kharar')) {
      throw new Error(`❌ Live location mismatch on Kharar! Greeting: "${khararState.greeting}", Badge: "${khararState.badge}"`);
    }
    if (khararState.greeting.includes('Mumbai')) {
      throw new Error(`❌ Stale Mumbai text detected on Kharar!`);
    }
    console.log('✅ [CONFIRMED LIVE]: Greeting and Badge are 100% synchronized to Kharar!');

    // 3. Select Mumbai explicitly in CitySelectorModal
    console.log('\n--- Selecting Mumbai on Live Site ---');
    await page.click('.dc-home-location-pill');
    await page.waitForSelector('.dc-city-modal-panel', { timeout: 8000 });

    const mumbaiClicked = await page.evaluate(() => {
      const chips = Array.from(document.querySelectorAll('.dc-popular-city-chip'));
      const chip = chips.find(c => c.textContent.includes('Mumbai'));
      if (chip) {
        chip.click();
        return true;
      }
      return false;
    });

    if (!mumbaiClicked) throw new Error('Mumbai chip not found on live site');
    await new Promise(r => setTimeout(r, 800));

    const mumbaiState = await page.evaluate(() => {
      const greeting = document.querySelector('.dc-home-greeting-text')?.textContent.trim() || '';
      const badge = document.querySelector('.dc-home-location-pill span')?.textContent.trim() || '';
      return { greeting, badge };
    });

    console.log(`Live Greeting after selecting Mumbai: "${mumbaiState.greeting}"`);
    console.log(`Live Badge after selecting Mumbai: "${mumbaiState.badge}"`);

    if (!mumbaiState.greeting.includes('Mumbai') || !mumbaiState.badge.includes('Mumbai')) {
      throw new Error(`❌ Live location mismatch on Mumbai! Greeting: "${mumbaiState.greeting}", Badge: "${mumbaiState.badge}"`);
    }
    console.log('✅ [CONFIRMED LIVE]: Greeting and Badge are 100% synchronized to Mumbai!');

    // 4. Reload page and confirm persistence
    console.log('\n--- Reloading Live Page to Verify Persistence ---');
    await page.reload({ waitUntil: 'networkidle2' });
    await page.waitForSelector('.dc-home-greeting-bar', { timeout: 15000 });

    const reloadedState = await page.evaluate(() => {
      const greeting = document.querySelector('.dc-home-greeting-text')?.textContent.trim() || '';
      const badge = document.querySelector('.dc-home-location-pill span')?.textContent.trim() || '';
      return { greeting, badge };
    });

    console.log(`Live Greeting after reload: "${reloadedState.greeting}"`);
    console.log(`Live Badge after reload: "${reloadedState.badge}"`);

    if (!reloadedState.greeting.includes('Mumbai') || !reloadedState.badge.includes('Mumbai')) {
      throw new Error(`❌ Persistence failed after reload!`);
    }
    console.log('✅ [CONFIRMED LIVE]: Location persisted consistently across reload!');

    // Capture screenshot of live production site
    const screenshotPath = 'C:/Users/shikh/.gemini/antigravity-ide/brain/04542bf0-b323-41ac-a81d-2056569b8398/vercel_live_location_fixed.png';
    await page.screenshot({ path: screenshotPath });
    console.log(`\nScreenshot saved to ${screenshotPath}`);

    console.log('\n================================================================');
    console.log('🎉 LIVE VERCEL PRODUCTION VERIFICATION SUCCEEDED 100%!');
    console.log('================================================================\n');
  } finally {
    await browser.close();
  }
}

verifyLive().catch(err => {
  console.error('Live verification failed:', err);
  process.exit(1);
});
