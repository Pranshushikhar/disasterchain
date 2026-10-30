const puppeteer = require('puppeteer-core');
const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const path = require('path');

const ARTIFACT_DIR = 'C:\\Users\\shikh\\.gemini\\antigravity-ide\\brain\\04542bf0-b323-41ac-a81d-2056569b8398';

(async () => {
  const browser = await puppeteer.launch({
    executablePath: edgePath,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });

    page.on('console', (msg) => console.log('LIVE PAGE LOG:', msg.text()));
    page.on('pageerror', (err) => console.log('LIVE PAGE ERROR:', err.message));

    await page.evaluateOnNewDocument(() => {
      localStorage.clear();
      localStorage.setItem('disasterchain_tour_completed', 'true');
    });

    console.log('Navigating to live production: https://disasterchain.vercel.app/?skip_intro=1');
    await page.goto('https://disasterchain.vercel.app/?skip_intro=1', { waitUntil: 'networkidle2', timeout: 45000 });
    await sleep(2500);

    const btnInfo = await page.evaluate(() => {
      const btn = document.getElementById('dc-global-voice-assistant-btn');
      return {
        exists: Boolean(btn),
        offsetH: btn ? btn.offsetHeight : 0,
        offsetW: btn ? btn.offsetWidth : 0,
        text: btn ? btn.innerText : '',
      };
    });
    console.log('Button Info:', btnInfo);

    console.log('Invoking click via page.evaluate...');
    await page.evaluate(() => {
      const btn = document.getElementById('dc-global-voice-assistant-btn');
      if (btn) btn.click();
    });
    await sleep(1500);

    const windowInfo = await page.evaluate(() => {
      const win = document.getElementById('dc-voice-assistant-window');
      const input = document.getElementById('dc-voice-chat-input');
      return {
        hasWin: Boolean(win),
        winH: win ? win.offsetHeight : 0,
        hasInput: Boolean(input),
      };
    });
    console.log('Window Info after click:', windowInfo);

    if (windowInfo.hasWin) {
      console.log('Sending question: "Why is disaster preparedness important?"');
      await page.type('#dc-voice-chat-input', 'Why is disaster preparedness important?');
      await sleep(300);
      await page.click('#dc-voice-send-btn');
      await sleep(2500);

      const msgCount = await page.evaluate(() => {
        return document.querySelectorAll('.dc-voice-msg-row').length;
      });
      console.log('Live message count:', msgCount);
    }

    const screenshotPath = path.join(ARTIFACT_DIR, 'vercel_live_conversational_ai.png');
    await page.screenshot({ path: screenshotPath, fullPage: false });
    console.log('Saved live Vercel screenshot to:', screenshotPath);

    await page.close();
  } catch (err) {
    console.error('Live Verification Error:', err);
  } finally {
    await browser.close();
  }
})();
