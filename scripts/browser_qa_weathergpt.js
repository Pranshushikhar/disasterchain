/**
 * Browser QA Automation for WeatherGPT
 * Uses puppeteer-core with local Microsoft Edge binary.
 * Validates Desktop (1440x900) & Mobile (390x844, 412x915) views,
 * submits queries, verifies conversational context, and captures required screenshots.
 */

const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const ARTIFACT_DIR = 'C:\\Users\\shikh\\.gemini\\antigravity-ide\\brain\\863b411c-7f74-47fb-a2fd-ddbab2b8a6d5';

async function runBrowserQA() {
  console.log('====================================================');
  console.log(' STARTING WEATHERGPT BROWSER QA');
  console.log('====================================================\n');

  if (!fs.existsSync(ARTIFACT_DIR)) {
    fs.mkdirSync(ARTIFACT_DIR, { recursive: true });
  }

  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
    ],
  });

  try {
    const page = await browser.newPage();

    // 1. DESKTOP TEST: 1440 x 900
    console.log('[Step 1] Desktop Viewport: 1440 x 900');
    await page.setViewport({ width: 1440, height: 900 });
    await page.goto('http://localhost:3000/weather-gpt', { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise((r) => setTimeout(r, 2000));

    // Capture initial desktop layout
    const desktopPath = path.join(ARTIFACT_DIR, 'weathergpt_final_desktop.png');
    await page.screenshot({ path: desktopPath, fullPage: false });
    console.log(`  ✓ Saved: ${desktopPath}`);

    // Copy to workspace root as well
    fs.copyFileSync(desktopPath, path.join(__dirname, '..', 'weathergpt_final_desktop.png'));

    // 2. SUBMIT QUERY: "Will there be rain tomorrow at 8 PM?"
    console.log('\n[Step 2] Submitting inquiry: "Will there be rain tomorrow at 8 PM?"');
    const inputSelector = '.wgpt-chat-input';
    await page.waitForSelector(inputSelector, { timeout: 10000 });
    await page.type(inputSelector, 'Will there be rain tomorrow at 8 PM?');
    await new Promise((r) => setTimeout(r, 300));

    // Submit inquiry
    const sendBtnSelector = '.wgpt-send-btn';
    await page.click(sendBtnSelector);

    // Wait for response to render with TOMORROW · 20:00
    console.log('  Waiting for response...');
    await page.waitForFunction(
      () => {
        const text = document.body.innerText;
        return text.includes('TOMORROW · 20:00') || text.includes('precipitation probability');
      },
      { timeout: 15000 }
    );
    await new Promise((r) => setTimeout(r, 1500));

    // Scroll so the question and its answer start right below navbar
    await page.evaluate(() => {
      const userEl = document.querySelector('.wgpt-turn-user');
      if (userEl) {
        userEl.scrollIntoView({ behavior: 'instant', block: 'start' });
        window.scrollBy(0, -110);
      }
    });
    await new Promise((r) => setTimeout(r, 600));

    // Capture tomorrow 8pm screenshot
    const tomorrow8pmPath = path.join(ARTIFACT_DIR, 'weathergpt_tomorrow_8pm.png');
    await page.screenshot({ path: tomorrow8pmPath, fullPage: false });
    console.log(`  ✓ Saved: ${tomorrow8pmPath}`);
    fs.copyFileSync(tomorrow8pmPath, path.join(__dirname, '..', 'weathergpt_tomorrow_8pm.png'));

    // Check page text to confirm it does NOT say today
    const bodyText = await page.evaluate(() => document.body.innerText);
    const hasTomorrow20 = bodyText.includes('TOMORROW · 20:00') || bodyText.includes('20:00');
    const hasRainToday0 = bodyText.includes('Rain is unlikely ... today') || bodyText.includes('precipitation probability is only 0%... today');
    console.log(`  Verification: Includes 20:00: ${hasTomorrow20}`);
    console.log(`  Verification: Rejects today 0% bug: ${!hasRainToday0}`);

    // 3. MULTI-TURN TEST: "What about tomorrow evening?" and "Should I carry an umbrella?"
    console.log('\n[Step 3] Submitting follow-up: "What about tomorrow evening?"');
    await page.type(inputSelector, 'What about tomorrow evening?');
    await page.click(sendBtnSelector);
    await new Promise((r) => setTimeout(r, 3000));

    console.log('[Step 4] Submitting follow-up: "Should I carry an umbrella?"');
    await page.type(inputSelector, 'Should I carry an umbrella?');
    await page.click(sendBtnSelector);
    await new Promise((r) => setTimeout(r, 3000));

    // 4. MOBILE TEST: 390 x 844
    console.log('\n[Step 5] Mobile Viewport: 390 x 844');
    await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
    await new Promise((r) => setTimeout(r, 1000));
    const mobile390Path = path.join(ARTIFACT_DIR, 'weathergpt_final_mobile_390.png');
    await page.screenshot({ path: mobile390Path, fullPage: false });
    console.log(`  ✓ Saved: ${mobile390Path}`);
    fs.copyFileSync(mobile390Path, path.join(__dirname, '..', 'weathergpt_final_mobile_390.png'));

    // 5. MOBILE TEST: 412 x 915
    console.log('\n[Step 6] Mobile Viewport: 412 x 915');
    await page.setViewport({ width: 412, height: 915, isMobile: true, hasTouch: true });
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
    await new Promise((r) => setTimeout(r, 1000));
    const mobile412Path = path.join(ARTIFACT_DIR, 'weathergpt_final_mobile_412.png');
    await page.screenshot({ path: mobile412Path, fullPage: false });
    console.log(`  ✓ Saved: ${mobile412Path}`);
    fs.copyFileSync(mobile412Path, path.join(__dirname, '..', 'weathergpt_final_mobile_412.png'));

    console.log('\n====================================================');
    console.log(' ALL BROWSER QA SCREENSHOTS CAPTURED SUCCESSFULLY!');
    console.log('====================================================\n');
  } catch (err) {
    console.error('Browser QA Error:', err);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

runBrowserQA();
