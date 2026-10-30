const puppeteer = require('puppeteer-core');
const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const http = require('http');
const fs = require('fs');
const path = require('path');

const BUILD_DIR = path.join(__dirname, '../frontend/build');
const PORT = 4177;
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

    console.log('\n--- 1. Testing Single Floating Assistant Button Verification ---');
    await page.goto(`http://127.0.0.1:${PORT}/?skip_intro=1`, { waitUntil: 'networkidle0', timeout: 30000 });
    await sleep(2000);

    // Verify ONLY ONE floating AI Assistant button exists
    const buttonChecks = await page.evaluate(() => {
      const aiBtn = document.getElementById('dc-global-voice-assistant-btn');
      const gptBtn = document.getElementById('dc-weathergpt-floating-btn');
      return {
        hasUnifiedAIBtn: Boolean(aiBtn && aiBtn.offsetHeight > 0),
        hasSeparateWeatherGPTBtn: Boolean(gptBtn && gptBtn.offsetHeight > 0),
      };
    });
    console.log('Button Checks:', buttonChecks);
    if (!buttonChecks.hasUnifiedAIBtn) {
      throw new Error('Unified AI Assistant floating button missing!');
    }
    if (buttonChecks.hasSeparateWeatherGPTBtn) {
      throw new Error('Separate WeatherGPT floating button must be removed! Only ONE button allowed.');
    }
    console.log('✓ Verified: Exactly ONE floating AI Assistant button exists; separate WeatherGPT button is removed.');

    // Open Unified Conversational Assistant
    console.log('Clicking unified AI assistant button...');
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
    // 2. Testing Weather Q&A Inside The Same Conversation (WeatherGPT Unified)
    // =========================================================================
    console.log('\n--- 2. Testing Weather Questions Answered Inside Conversation ---');
    
    // Q1: What's the weather today?
    console.log('Sending: "What is the weather today?"');
    await page.type('#dc-voice-chat-input', 'What is the weather today?');
    await page.click('#dc-voice-send-btn');
    await sleep(1500);

    let curPath = await page.evaluate(() => window.location.pathname);
    if (curPath !== '/') {
      throw new Error(`Weather query should NOT navigate away from current page! Navigated to ${curPath}`);
    }
    console.log('✓ Verified: "What is the weather today?" remained inside conversation without navigating.');

    // Q2: Will it rain tomorrow?
    console.log('Sending follow-up: "Will it rain tomorrow?"');
    await page.type('#dc-voice-chat-input', 'Will it rain tomorrow?');
    await page.click('#dc-voice-send-btn');
    await sleep(1500);

    // Q3: Should I carry an umbrella?
    console.log('Sending follow-up: "Should I carry an umbrella?"');
    await page.type('#dc-voice-chat-input', 'Should I carry an umbrella?');
    await page.click('#dc-voice-send-btn');
    await sleep(1500);

    // Q4: Heavy rain precautions
    console.log('Sending: "What precautions should I take during heavy rain?"');
    await page.type('#dc-voice-chat-input', 'What precautions should I take during heavy rain?');
    await page.click('#dc-voice-send-btn');
    await sleep(1500);

    // Q5: Show me WeatherGPT
    console.log('Sending: "Show me WeatherGPT"');
    await page.type('#dc-voice-chat-input', 'Show me WeatherGPT');
    await page.click('#dc-voice-send-btn');
    await sleep(1500);

    const messageCount = await page.evaluate(() => {
      const msgs = document.querySelectorAll('.dc-voice-msg-row');
      return msgs.length;
    });
    console.log('Total conversational messages in thread:', messageCount);
    if (messageCount < 10) {
      throw new Error('Expected at least 10 messages from continuous multi-turn weather dialogue!');
    }
    console.log('✓ Verified continuous conversational weather Q&A thread.');

    // =========================================================================
    // 3. Testing Explicit Navigation Actions
    // =========================================================================
    console.log('\n--- 3. Testing Explicit Navigation Actions ---');
    const navTests = [
      { cmd: 'Open the weather page.', path: '/weather' },
      { cmd: 'Show me the shelters.', path: '/shelters' },
      { cmd: 'Open the spatial map.', path: '/map' },
      { cmd: 'Show incident reports.', path: '/incidents' },
      { cmd: 'Open safety guidelines.', path: '/safety' },
      { cmd: 'Return to home.', path: '/' },
    ];

    for (const t of navTests) {
      console.log(`Testing explicit voice command: "${t.cmd}" -> expected: ${t.path}`);
      await page.evaluate((cmdText) => {
        window.dispatchEvent(new CustomEvent('dc:testVoiceInput', { detail: { text: cmdText } }));
      }, t.cmd);
      await sleep(1800);
      const urlPath = await page.evaluate(() => window.location.pathname);
      console.log(`Current path: ${urlPath}`);
      if (urlPath !== t.path) {
        throw new Error(`Voice navigation mismatch for "${t.cmd}": expected ${t.path}, got ${urlPath}`);
      }
      console.log(`✓ Navigated cleanly to ${t.path}`);
    }

    // =========================================================================
    // 4. Testing Critical SOS Voice Protocol
    // =========================================================================
    console.log('\n--- 4. Testing Critical SOS Voice Commands ---');
    await page.evaluate(() => {
      window.dispatchEvent(new CustomEvent('dc:testVoiceInput', { detail: { text: 'SOS' } }));
    });
    await sleep(1200);

    const sosActive = await page.evaluate(() => {
      const modal = document.getElementById('dc-voice-sos-modal') || document.querySelector('.dc-voice-sos-overlay');
      return Boolean(modal && modal.offsetHeight > 0);
    });
    console.log('Voice SOS confirmation protocol activated:', sosActive);
    if (!sosActive) {
      throw new Error('SOS voice protocol did not display confirmation dialog!');
    }

    // Test voice cancellation: "Cancel SOS"
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

    // Capture visual screenshot
    await page.evaluate(() => {
      const btn = document.getElementById('dc-global-voice-assistant-btn');
      if (btn) btn.click();
    });
    await sleep(800);

    const screenshotPath = path.join(ARTIFACT_DIR, 'unified_ai_assistant_verified.png');
    await page.screenshot({ path: screenshotPath, fullPage: false });
    console.log('Saved visual verification screenshot to:', screenshotPath);

    console.log('\n======================================================');
    console.log('🎉 ALL UNIFIED AI ASSISTANT SCENARIOS VERIFIED CLEANLY!');
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
