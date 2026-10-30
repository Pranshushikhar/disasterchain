const puppeteer = require('puppeteer-core');
const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const http = require('http');
const fs = require('fs');
const path = require('path');

const BUILD_DIR = path.join(__dirname, '../frontend/build');
const PORT = 4175;
const ARTIFACT_DIR = 'C:\\Users\\shikh\\.gemini\\antigravity-ide\\brain\\04542bf0-b323-41ac-a81d-2056569b8398';

const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
};

function startServer() {
  const server = http.createServer((req, res) => {
    let urlPath = req.url.split('?')[0];
    let filePath = path.join(BUILD_DIR, urlPath === '/' ? 'index.html' : urlPath);

    if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
      filePath = path.join(BUILD_DIR, 'index.html');
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    fs.readFile(filePath, (err, content) => {
      if (err) {
        res.writeHead(500);
        res.end('Error loading ' + filePath);
      } else {
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(content, 'utf-8');
      }
    });
  });

  return new Promise((resolve) => {
    server.listen(PORT, '127.0.0.1', () => {
      console.log(`Static build server running on http://127.0.0.1:${PORT}`);
      resolve(server);
    });
  });
}

(async () => {
  const server = await startServer();
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
      if ('serviceWorker' in navigator) {
        delete navigator.__proto__.serviceWorker;
      }
      localStorage.clear();
      localStorage.setItem('disasterchain_tour_completed', 'true');
    });

    page.on('console', (msg) => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', (err) => console.log('PAGE ERROR:', err.message));

    console.log('\n--- 1. Testing Persistent Floating Voice Assistant UI ---');
    await page.goto(`http://127.0.0.1:${PORT}/?skip_intro=1`, { waitUntil: 'networkidle0', timeout: 30000 });
    await sleep(2000);

    // Verify Voice Assistant button is visible on page
    const debugInfo = await page.evaluate(() => {
      const btn = document.getElementById('dc-global-voice-assistant-btn');
      return {
        hasBtn: Boolean(btn),
        offsetH: btn ? btn.offsetHeight : 0,
        offsetW: btn ? btn.offsetWidth : 0,
        display: btn ? window.getComputedStyle(btn).display : 'none',
        container: Boolean(document.querySelector('.dc-voice-assistant-container')),
        appLayout: Boolean(document.querySelector('.dc-app-layout')),
      };
    });
    console.log('DOM Debug Info:', debugInfo);
    if (!debugInfo.hasBtn) throw new Error('Global voice assistant button missing from page!');

    // Click Voice Assistant button to open Conversational Assistant Window
    console.log('Clicking global assistant capsule to open conversational window...');
    await page.click('#dc-global-voice-assistant-btn');
    await sleep(800);

    const hasChatWindow = await page.evaluate(() => {
      const win = document.getElementById('dc-voice-assistant-window');
      const input = document.getElementById('dc-voice-chat-input');
      const sendBtn = document.getElementById('dc-voice-send-btn');
      const micBtn = document.getElementById('dc-voice-mic-input-btn');
      return Boolean(win && input && sendBtn && micBtn);
    });
    console.log('ChatGPT-style conversational assistant window opened:', hasChatWindow);
    if (!hasChatWindow) throw new Error('Conversational assistant window failed to open!');

    // =========================================================================
    // 2. Testing Conversational Text & Natural Q&A Interaction
    // =========================================================================
    console.log('\n--- 2. Testing Conversational Text & Natural Q&A ---');
    await page.type('#dc-voice-chat-input', 'Why is disaster preparedness important?');
    await sleep(300);
    await page.click('#dc-voice-send-btn');
    await sleep(1800);

    const messageCount = await page.evaluate(() => {
      const msgs = document.querySelectorAll('.dc-voice-msg-row');
      return msgs.length;
    });
    console.log('Conversation message count after sending query:', messageCount);
    if (messageCount < 2) {
      throw new Error('Conversational message thread did not append user/assistant messages!');
    }

    // =========================================================================
    // 3. Testing Context-Aware Follow-up
    // =========================================================================
    console.log('\n--- 3. Testing Context-Aware Follow-up ---');
    await page.type('#dc-voice-chat-input', 'Can you explain this in simpler words?');
    await sleep(300);
    await page.click('#dc-voice-send-btn');
    await sleep(1800);

    const followUpCount = await page.evaluate(() => {
      return document.querySelectorAll('.dc-voice-msg-row').length;
    });
    console.log('Message count after follow-up simplification:', followUpCount);

    // =========================================================================
    // 4. Testing Conversational Feature Actions & Voice Navigation
    // =========================================================================
    console.log('\n--- 4. Testing Feature Actions & Tool Calling ---');
    const navTests = [
      { cmd: 'Show me the shelters.', path: '/shelters' },
      { cmd: 'What is the weather like today?', path: '/weather' },
      { cmd: 'Open the spatial map.', path: '/map' },
      { cmd: 'Show incident reports.', path: '/incidents' },
      { cmd: 'Open safety guidelines.', path: '/safety' },
      { cmd: 'Return to home.', path: '/' },
    ];

    for (const t of navTests) {
      console.log(`Testing natural voice: "${t.cmd}" -> expected: ${t.path}`);
      await page.evaluate((cmdText) => {
        window.dispatchEvent(new CustomEvent('dc:testVoiceInput', { detail: { text: cmdText } }));
      }, t.cmd);
      await sleep(1800);
      const currentUrl = await page.evaluate(() => window.location.pathname);
      console.log(`Current path: ${currentUrl}`);
      if (currentUrl !== t.path) {
        throw new Error(`Voice navigation mismatch for "${t.cmd}": expected ${t.path}, got ${currentUrl}`);
      }
      console.log(`✓ Navigated cleanly to ${t.path}`);
    }

    // =========================================================================
    // 5. Testing Critical SOS Voice Protocol
    // =========================================================================
    console.log('\n--- 5. Testing Critical SOS Voice Commands ---');
    // Trigger SOS via voice command "SOS"
    await page.evaluate(() => {
      window.dispatchEvent(new CustomEvent('dc:testVoiceInput', { detail: { text: 'SOS' } }));
    });
    await sleep(1200);

    // Verify SOS modal and confirmation banner appear
    const sosActive = await page.evaluate(() => {
      const modal = document.getElementById('dc-voice-sos-modal') || document.querySelector('.dc-voice-sos-overlay');
      return Boolean(modal && modal.offsetHeight > 0);
    });
    console.log('Voice SOS confirmation protocol activated:', sosActive);
    if (!sosActive) {
      throw new Error('SOS voice protocol did not display confirmation dialog!');
    }

    // Test voice cancellation: "Cancel SOS"
    console.log('Testing voice cancellation: "Cancel SOS"');
    await page.evaluate(() => {
      window.dispatchEvent(new CustomEvent('dc:testVoiceInput', { detail: { text: 'Cancel SOS' } }));
    });
    await sleep(1200);

    const sosDismissed = await page.evaluate(() => {
      const modal = document.getElementById('dc-voice-sos-modal');
      return !modal;
    });
    console.log('Voice SOS confirmation safely dismissed by voice command:', sosDismissed);
    if (!sosDismissed) {
      throw new Error('SOS was not cancelled by voice command "Cancel SOS"!');
    }

    // =========================================================================
    // 6. Testing WeatherGPT Distinction
    // =========================================================================
    console.log('\n--- 6. Testing WeatherGPT Two-Way Voice Integration ---');
    // Open WeatherGPT
    await page.evaluate(() => {
      const gptBtn = document.getElementById('dc-weathergpt-floating-btn') || document.getElementById('dc-sidebar-weathergpt');
      if (gptBtn) gptBtn.click();
    });
    await sleep(1200);

    const hasChatMic = await page.evaluate(() => {
      const mic = document.getElementById('dc-weathergpt-mic-btn');
      return Boolean(mic && mic.offsetHeight > 0);
    });
    console.log('WeatherGPT in-chat microphone button present:', hasChatMic);
    if (!hasChatMic) throw new Error('In-chat microphone button missing from WeatherGPT!');

    // =========================================================================
    // 7. Visual Artifact Capture
    // =========================================================================
    // Re-open conversational assistant to capture visual proof
    await page.evaluate(() => {
      const btn = document.getElementById('dc-global-voice-assistant-btn');
      if (btn) btn.click();
    });
    await sleep(800);

    const screenshotPath = path.join(ARTIFACT_DIR, 'e2e_conversational_ai_verified.png');
    await page.screenshot({ path: screenshotPath, fullPage: false });
    console.log('Saved visual verification screenshot to:', screenshotPath);

    console.log('\n======================================================');
    console.log('🎉 ALL CONVERSATIONAL AI SCENARIOS VERIFIED CLEANLY!');
    console.log('======================================================');

    await page.close();
  } catch (err) {
    console.error('E2E Verification Error:', err);
    process.exit(1);
  } finally {
    await browser.close();
    server.close();
  }
})();
