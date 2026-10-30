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

async function verifyLiveSite() {
  console.log(`Checking HTTP status of ${LIVE_URL}...`);
  const httpRes = await checkLiveHttp();
  console.log(`HTTP Status: ${httpRes.statusCode}, Content-Length: ${httpRes.dataLength}`);
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
    await page.waitForSelector('.dc-sidebar', { timeout: 15000 });

    // Open Language Modal via #dc-sidebar-language
    console.log('Opening Language settings modal...');
    await page.click('#dc-sidebar-language');
    await page.waitForSelector('.dc-lang-grid', { timeout: 8000 });

    const langData = await page.evaluate(() => {
      const cards = Array.from(document.querySelectorAll('.dc-lang-grid .dc-lang-card-btn'));
      return cards.map(c => c.textContent.trim());
    });

    console.log(`Total language cards found on LIVE site: ${langData.length}`);
    console.log('Language cards preview:', langData.slice(0, 5));

    const hinglishFound = langData.some(txt => txt.toLowerCase().includes('hinglish'));
    console.log(`Hinglish present on live website: ${hinglishFound ? 'YES (❌ Still old build)' : 'NO (✅ CLEAN)'}`);

    if (langData.length === 20 && !hinglishFound) {
      console.log('🎉 LIVE VERCEL DEPLOYMENT IS READY WITH 20 LANGUAGES AND ZERO HINGLISH!');
    } else {
      console.log(`ℹ️ Current live count: ${langData.length} languages. Deployment may be processing on Vercel.`);
    }

    // Switch to Hindi on live site
    console.log('Testing language switch to Hindi on live site...');
    const switched = await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('.dc-lang-grid .dc-lang-card-btn'))
        .find(b => b.textContent.includes('हिन्दी') || b.textContent.includes('Hindi'));
      if (btn) {
        btn.click();
        return true;
      }
      return false;
    });

    if (switched) {
      await new Promise(r => setTimeout(r, 600));
      const htmlLang = await page.evaluate(() => document.documentElement.lang);
      const activeText = await page.evaluate(() => {
        const titleEl = document.querySelector('.dc-live-badge') || document.querySelector('.dc-section-title') || document.querySelector('h1');
        return titleEl ? titleEl.textContent.trim() : '';
      });
      console.log(`Language switch confirmed: html lang="${htmlLang}", title text preview="${activeText}"`);
    }

    // Close modal & take live screenshot
    const closeBtn = await page.$('.dc-modal-close-btn');
    if (closeBtn) await closeBtn.click();
    await new Promise(r => setTimeout(r, 500));

    const screenshotPath = 'C:/Users/shikh/.gemini/antigravity-ide/brain/04542bf0-b323-41ac-a81d-2056569b8398/vercel_live_20_languages.png';
    await page.screenshot({ path: screenshotPath });
    console.log(`Screenshot saved to ${screenshotPath}`);

    return {
      success: true,
      statusCode: httpRes.statusCode,
      langCount: langData.length,
      hinglishFound
    };
  } finally {
    await browser.close();
  }
}

verifyLiveSite().catch(err => {
  console.error('Live Vercel verification error:', err);
  process.exit(1);
});
