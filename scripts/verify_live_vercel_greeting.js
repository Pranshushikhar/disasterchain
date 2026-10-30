const puppeteer = require('puppeteer-core');
const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const path = require('path');

const ARTIFACT_DIR = 'C:\\Users\\shikh\\.gemini\\antigravity-ide\\brain\\04542bf0-b323-41ac-a81d-2056569b8398';

(async () => {
  const browser = await puppeteer.launch({
    executablePath: edgePath,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const sleep = (ms) => new Promise(r => setTimeout(r, ms));

  try {
    // =========================================================================
    // Test 1: Unauthenticated Visitor on Live Vercel Production
    // =========================================================================
    console.log('\n=== Test 1: Unauthenticated Visitor on Live Vercel Production ===');
    const pageUnauth = await browser.newPage();
    await pageUnauth.setViewport({ width: 1440, height: 900 });
    await pageUnauth.evaluateOnNewDocument(() => {
      if ('serviceWorker' in navigator) {
        delete navigator.__proto__.serviceWorker;
      }
      localStorage.clear();
      localStorage.setItem('disasterchain_tour_completed', 'true');
    });

    console.log('Navigating to live production site: https://disasterchain.vercel.app/?skip_intro=1');
    await pageUnauth.goto('https://disasterchain.vercel.app/?skip_intro=1', { waitUntil: 'networkidle2', timeout: 45000 });
    await sleep(2500);

    const unauthData = await pageUnauth.evaluate(() => {
      const greetingEl = document.querySelector('.dc-home-greeting-text');
      const locationPill = document.querySelector('.dc-home-location-pill');
      return {
        greeting: greetingEl ? greetingEl.innerText.trim() : null,
        locationPill: locationPill ? locationPill.innerText.trim() : null,
      };
    });

    console.log('Live Greeting (Unauthenticated):', unauthData.greeting);
    console.log('Live Location Badge:', unauthData.locationPill);

    // Verify unauthenticated greeting has no location, no username
    if (unauthData.greeting.includes('Kharar') || unauthData.greeting.includes('Mumbai') || unauthData.greeting.includes('Delhi')) {
      throw new Error(`FAILURE: Unauthenticated greeting leaked location: ${unauthData.greeting}`);
    }
    const expectedSalutations = ['Good morning.', 'Good afternoon.', 'Good evening.'];
    if (!expectedSalutations.includes(unauthData.greeting)) {
      throw new Error(`FAILURE: Expected clean salutation without placeholder/location, got: "${unauthData.greeting}"`);
    }
    console.log('✓ PASS: Unauthenticated visitor sees clean time-based greeting without location or placeholder.');

    await pageUnauth.screenshot({ path: path.join(ARTIFACT_DIR, 'vercel_live_unauth_greeting.png') });
    await pageUnauth.close();

    // =========================================================================
    // Test 2: Authenticated Visitor (Rahul Sharma) on Live Vercel Production
    // =========================================================================
    console.log('\n=== Test 2: Authenticated Visitor (Rahul Sharma) on Live Vercel Production ===');
    const pageAuth = await browser.newPage();
    await pageAuth.setViewport({ width: 1440, height: 900 });

    await pageAuth.setRequestInterception(true);
    pageAuth.on('request', (req) => {
      if (req.url().includes('/auth/me')) {
        if (req.method() === 'OPTIONS') {
          req.respond({
            status: 204,
            headers: {
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
              'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-disasterchain-cached',
            }
          });
          return;
        }
        req.respond({
          status: 200,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-disasterchain-cached',
          },
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: {
              _id: 'user_rahul_1',
              name: 'Rahul Sharma',
              email: 'rahul@example.com',
              role: 'citizen',
              isVerified: true
            }
          })
        });
        return;
      }
      req.continue();
    });

    await pageAuth.evaluateOnNewDocument(() => {
      if ('serviceWorker' in navigator) {
        delete navigator.__proto__.serviceWorker;
      }
      localStorage.clear();
      localStorage.setItem('disasterchain_tour_completed', 'true');
      localStorage.setItem('disasterchain_user', JSON.stringify({
        _id: 'user_rahul_1',
        name: 'Rahul Sharma',
        email: 'rahul@example.com',
        role: 'citizen',
        isVerified: true
      }));
      localStorage.setItem('disasterchain_token', 'mock_jwt_token_rahul_123');
    });

    await pageAuth.goto('https://disasterchain.vercel.app/?skip_intro=1', { waitUntil: 'networkidle2', timeout: 45000 });
    await sleep(2500);

    const authData = await pageAuth.evaluate(() => {
      const greetingEl = document.querySelector('.dc-home-greeting-text');
      const locationPill = document.querySelector('.dc-home-location-pill');
      return {
        greeting: greetingEl ? greetingEl.innerText.trim() : null,
        locationPill: locationPill ? locationPill.innerText.trim() : null,
      };
    });

    console.log('Live Greeting (Authenticated):', authData.greeting);
    console.log('Live Location Badge:', authData.locationPill);

    const expectedAuthGreetings = ['Good morning, Rahul.', 'Good afternoon, Rahul.', 'Good evening, Rahul.'];
    if (!expectedAuthGreetings.includes(authData.greeting)) {
      throw new Error(`FAILURE: Expected time greeting with user's name (Rahul), got: "${authData.greeting}"`);
    }
    console.log('✓ PASS: Authenticated user Rahul sees time greeting with their first name.');

    // =========================================================================
    // Test 3: Location Change Independence
    // =========================================================================
    console.log('\n=== Test 3: Location Change Independence on Live Vercel Production ===');
    // Open City Selector
    await pageAuth.evaluate(() => {
      const pill = document.querySelector('.dc-home-location-pill');
      if (pill) pill.click();
    });
    await sleep(1000);

    // Click Mumbai chip
    await pageAuth.evaluate(() => {
      const chips = Array.from(document.querySelectorAll('.dc-popular-city-chip'));
      const mumbai = chips.find(c => c.textContent.includes('Mumbai'));
      if (mumbai) mumbai.click();
    });
    await sleep(2000);

    const postCityChange = await pageAuth.evaluate(() => {
      const greetingEl = document.querySelector('.dc-home-greeting-text');
      const locationPill = document.querySelector('.dc-home-location-pill');
      return {
        greeting: greetingEl ? greetingEl.innerText.trim() : null,
        locationPill: locationPill ? locationPill.innerText.trim() : null,
      };
    });

    console.log('Live Greeting after City Switch to Mumbai:', postCityChange.greeting);
    console.log('Live Location Badge after City Switch to Mumbai:', postCityChange.locationPill);

    if (!expectedAuthGreetings.includes(postCityChange.greeting)) {
      throw new Error(`FAILURE: Greeting changed unexpectedly on city selection! Got: "${postCityChange.greeting}"`);
    }
    if (postCityChange.greeting.includes('Mumbai')) {
      throw new Error(`FAILURE: Greeting leaked Mumbai: "${postCityChange.greeting}"`);
    }
    if (!postCityChange.locationPill.includes('Mumbai')) {
      throw new Error(`FAILURE: Location pill did not update to Mumbai: "${postCityChange.locationPill}"`);
    }
    console.log('✓ PASS: Selected city updated in location badge only; greeting strictly remained user-based.');

    // =========================================================================
    // Test 4: Language Switcher Integration (e.g. Hindi)
    // =========================================================================
    console.log('\n=== Test 4: Language Switcher Integration (Hindi) ===');
    await pageAuth.evaluate(() => {
      const langBtn = document.getElementById('dc-sidebar-language');
      if (langBtn) langBtn.click();
    });
    await sleep(1000);

    await pageAuth.evaluate(() => {
      const cards = Array.from(document.querySelectorAll('.dc-lang-card-btn'));
      const hiCard = cards.find(c => c.innerText.includes('Hindi') || c.innerText.includes('हिन्दी'));
      if (hiCard) hiCard.click();
    });
    await sleep(1000);

    // Close settings modal
    await pageAuth.evaluate(() => {
      const closeBtn = document.querySelector('.dc-modal-close-btn');
      if (closeBtn) closeBtn.click();
    });
    await sleep(800);

    const hindiGreeting = await pageAuth.evaluate(() => {
      return document.querySelector('.dc-home-greeting-text')?.innerText.trim();
    });
    console.log('Live Greeting in Hindi:', hindiGreeting);
    const expectedHindiGreetings = ['शुभ प्रभात, Rahul.', 'शुभ दोपहर, Rahul.', 'शुभ संध्या, Rahul.'];
    if (!expectedHindiGreetings.includes(hindiGreeting)) {
      throw new Error(`FAILURE: Expected Hindi time greeting with Rahul, got: "${hindiGreeting}"`);
    }
    console.log('✓ PASS: Hindi greeting formatted correctly with username.');

    // Switch back to English
    await pageAuth.evaluate(() => {
      const langBtn = document.getElementById('dc-sidebar-language');
      if (langBtn) langBtn.click();
    });
    await sleep(1000);
    await pageAuth.evaluate(() => {
      const cards = Array.from(document.querySelectorAll('.dc-lang-card-btn'));
      const enCard = cards.find(c => c.innerText.includes('English'));
      if (enCard) enCard.click();
    });
    await sleep(1000);
    await pageAuth.evaluate(() => {
      const closeBtn = document.querySelector('.dc-modal-close-btn');
      if (closeBtn) closeBtn.click();
    });
    await sleep(800);

    const screenshotPath = path.join(ARTIFACT_DIR, 'vercel_live_user_greeting.png');
    await pageAuth.screenshot({ path: screenshotPath, fullPage: false });
    console.log('Saved live verification screenshot to:', screenshotPath);

    console.log('\n======================================================');
    console.log('🎉 ALL VERCEL PRODUCTION CHECKS VERIFIED SUCCESSFULLY!');
    console.log('======================================================');

    await pageAuth.close();
  } catch (err) {
    console.error('Error during Vercel live check:', err);
    process.exit(1);
  } finally {
    await browser.close();
  }
})();
