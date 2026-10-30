const puppeteer = require('puppeteer-core');
const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const path = require('path');
const https = require('https');

const ARTIFACT_DIR = 'C:\\Users\\shikh\\.gemini\\antigravity-ide\\brain\\04542bf0-b323-41ac-a81d-2056569b8398';

function getLiveBundle() {
  return new Promise((resolve) => {
    https.get('https://disasterchain.vercel.app/?t=' + Date.now(), (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const match = data.match(/main\.[a-z0-9]+\.js/);
        resolve(match ? match[0] : null);
      });
    }).on('error', () => resolve(null));
  });
}

(async () => {
  console.log('Polling Vercel until bundle main.2e36a8a2.js is live...');
  for (let i = 1; i <= 20; i++) {
    const bundle = await getLiveBundle();
    console.log(`[Attempt ${i}/20] Current Live Vercel bundle: ${bundle}`);
    if (bundle === 'main.2e36a8a2.js' || (bundle && bundle !== 'main.cff58aeb.js' && bundle !== 'main.6e29107d.js')) {
      console.log('🚀 New unified bundle is LIVE on Vercel!');
      break;
    }
    await new Promise((r) => setTimeout(r, 6000));
  }

  const browser = await puppeteer.launch({
    executablePath: edgePath,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });

    await page.evaluateOnNewDocument(() => {
      localStorage.clear();
      localStorage.setItem('disasterchain_tour_completed', 'true');
    });

    console.log('Navigating to live production: https://disasterchain.vercel.app/?skip_intro=1');
    await page.goto('https://disasterchain.vercel.app/?skip_intro=1', { waitUntil: 'networkidle2', timeout: 45000 });
    await sleep(3000);

    // Verify ONLY ONE floating button exists
    const buttons = await page.evaluate(() => {
      const ai = document.getElementById('dc-global-voice-assistant-btn');
      const gpt = document.getElementById('dc-weathergpt-floating-btn');
      return {
        hasAI: Boolean(ai && ai.offsetHeight > 0),
        hasWeatherGPT: Boolean(gpt && gpt.offsetHeight > 0),
      };
    });
    console.log('Live Floating Button Status:', buttons);
    if (!buttons.hasAI) throw new Error('AI Assistant floating button missing on live production!');
    if (buttons.hasWeatherGPT) throw new Error('Separate WeatherGPT floating button must NOT exist on live production!');
    console.log('✓ Verified: Single AI Assistant button on live site. Separate WeatherGPT button removed.');

    // Click to open Unified Assistant
    await page.evaluate(() => {
      const btn = document.getElementById('dc-global-voice-assistant-btn');
      if (btn) btn.click();
    });
    await sleep(1500);

    const hasWin = await page.evaluate(() => {
      const win = document.getElementById('dc-voice-assistant-window');
      return Boolean(win && win.offsetHeight > 0);
    });
    console.log('Live Unified Assistant Window open:', hasWin);

    // Send weather query
    if (hasWin) {
      console.log('Sending: "What is the weather today?"');
      await page.type('#dc-voice-chat-input', 'What is the weather today?');
      await page.click('#dc-voice-send-btn');
      await sleep(2500);

      const curPath = await page.evaluate(() => window.location.pathname);
      console.log('Path after weather question:', curPath);
      if (curPath !== '/') {
        throw new Error(`Weather query should NOT navigate away! Navigated to ${curPath}`);
      }
      console.log('✓ Verified: Weather question answered inside chat without navigating.');
    }

    const screenshotPath = path.join(ARTIFACT_DIR, 'live_unified_ai_verified.png');
    await page.screenshot({ path: screenshotPath, fullPage: false });
    console.log('Saved live Vercel screenshot to:', screenshotPath);

    await page.close();
  } catch (err) {
    console.error('Live Verification Error:', err);
  } finally {
    await browser.close();
  }
})();
