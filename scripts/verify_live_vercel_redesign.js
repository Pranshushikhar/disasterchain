const puppeteer = require('puppeteer-core');
const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const path = require('path');

const ARTIFACT_DIR = 'C:\\Users\\shikh\\.gemini\\antigravity-ide\\brain\\04542bf0-b323-41ac-a81d-2056569b8398';
const LIVE_URL = 'https://disasterchain.vercel.app';

(async () => {
  const browser = await puppeteer.launch({
    executablePath: edgePath,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });

    await page.evaluateOnNewDocument(() => {
      localStorage.setItem('disasterchain_tour_completed', 'true');
      localStorage.setItem('dc_cinematic_intro_seen', 'true');
    });

    console.log('Capturing Live Vercel Home Page...');
    await page.goto(`${LIVE_URL}/?skip_intro=1`, { waitUntil: 'domcontentloaded', timeout: 35000 });
    await new Promise((r) => setTimeout(r, 2000));
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'live_vercel_home_restored.png') });
    console.log('Saved live_vercel_home_restored.png');

    console.log('Capturing Live Vercel Academy Catalog...');
    await page.goto(`${LIVE_URL}/academy?skip_intro=1`, { waitUntil: 'domcontentloaded', timeout: 35000 });
    await new Promise((r) => setTimeout(r, 2000));
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'live_vercel_academy_catalog_restored.png') });
    console.log('Saved live_vercel_academy_catalog_restored.png');

    console.log('Capturing Live Academy Course page...');
    await page.goto(`${LIVE_URL}/academy/course/earthquake-safety?skip_intro=1`, { waitUntil: 'domcontentloaded', timeout: 35000 });
    await new Promise((r) => setTimeout(r, 2000));
    await page.evaluate(() => {
      const box = document.querySelector('.dc-checkpoint-box');
      if (box) box.scrollIntoView({ behavior: 'instant', block: 'center' });
    });
    await new Promise((r) => setTimeout(r, 800));
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'live_vercel_academy_lesson_restored.png') });
    console.log('Saved live_vercel_academy_lesson_restored.png');

    console.log('Capturing Live Academy Quiz...');
    const quizNavBtn = await page.$('.dc-quiz-nav-item');
    if (quizNavBtn) {
      await quizNavBtn.click();
      await new Promise((r) => setTimeout(r, 1500));
      await page.screenshot({ path: path.join(ARTIFACT_DIR, 'live_vercel_academy_quiz_restored.png') });
      console.log('Saved live_vercel_academy_quiz_restored.png');
    }

    console.log('=== LIVE VERCEL RESTORED REDESIGN VERIFICATION COMPLETE ===');
  } catch (err) {
    console.error('Error during live verification:', err);
  } finally {
    await browser.close();
    process.exit(0);
  }
})();
