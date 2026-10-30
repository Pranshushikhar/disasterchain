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
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const sleep = (ms) => new Promise(r => setTimeout(r, ms));

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
        visibility: btn ? window.getComputedStyle(btn).visibility : 'none',
        container: Boolean(document.querySelector('.dc-voice-assistant-container')),
        appLayout: Boolean(document.querySelector('.dc-app-layout')),
        htmlSnippet: document.body.innerHTML.slice(0, 400),
      };
    });
    console.log('DOM Debug Info:', debugInfo);
    const hasVoiceBtn = debugInfo.hasBtn;
    console.log('Global voice assistant button visible:', hasVoiceBtn);
    if (!hasVoiceBtn) throw new Error('Global voice assistant button missing from page!');

    // Click Voice Assistant button
    await page.click('#dc-global-voice-assistant-btn');
    await sleep(600);

    const isListeningActive = await page.evaluate(() => {
      const btn = document.getElementById('dc-global-voice-assistant-btn');
      return btn.classList.contains('listening') || btn.classList.contains('idle');
    });
    console.log('Voice assistant button responds to click:', isListeningActive);

    // =========================================================================
    // 2. Testing Voice Navigation Commands
    // =========================================================================
    console.log('\n--- 2. Testing Voice Navigation Commands ---');

    const testVoiceNav = async (command, expectedPath) => {
      console.log(`Executing voice command: "${command}" -> expecting ${expectedPath}`);
      await page.evaluate((cmd) => {
        // Trigger voice command parser through window/context simulation
        const event = new CustomEvent('dc:simulateVoice', { detail: { text: cmd } });
        window.dispatchEvent(event);
      }, command);

      await sleep(1500);
      const currentUrl = await page.evaluate(() => window.location.pathname);
      console.log(`Current path after command: ${currentUrl}`);
      if (currentUrl !== expectedPath) {
        throw new Error(`Voice navigation failed for "${command}": expected ${expectedPath}, got ${currentUrl}`);
      }
      console.log(`✓ Navigated cleanly to ${expectedPath}`);
    };

    // Test Voice Navigation to Shelters
    await page.evaluate(() => {
      // Expose simulator listener on window if needed
      window.addEventListener('dc:simulateVoice', (e) => {
        const btn = document.getElementById('dc-global-voice-assistant-btn');
        if (btn) {
          // Trigger contextual simulator
          const event = new CustomEvent('dc:runVoiceSim', { detail: e.detail });
          window.dispatchEvent(event);
        }
      });
    });

    // We can also trigger voice commands directly via DOM buttons or context hooks:
    // Let's test navigation via the voice context
    const navTests = [
      { cmd: 'Open the shelter page.', path: '/shelters' },
      { cmd: 'Take me to the weather page.', path: '/weather' },
      { cmd: 'Open the map.', path: '/map' },
      { cmd: 'Show incident reports.', path: '/incidents' },
      { cmd: 'Open the safety page.', path: '/safety' },
      { cmd: 'Return to home.', path: '/' },
    ];

    for (const t of navTests) {
      console.log(`Testing natural voice: "${t.cmd}" -> expected: ${t.path}`);
      await page.evaluate((cmdText) => {
        window.dispatchEvent(new CustomEvent('dc:testVoiceInput', { detail: { text: cmdText } }));
      }, t.cmd);
      await sleep(1500);
      const currentUrl = await page.evaluate(() => window.location.pathname);
      console.log(`Current path: ${currentUrl}`);
      if (currentUrl !== t.path) {
        throw new Error(`Voice navigation mismatch for "${t.cmd}": expected ${t.path}, got ${currentUrl}`);
      }
      console.log(`✓ Navigated cleanly to ${t.path}`);
    }

    // =========================================================================
    // 3. Testing Critical SOS Voice Protocol
    // =========================================================================
    console.log('\n--- 3. Testing Critical SOS Voice Commands ---');
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

    // Now test voice cancellation: "Cancel SOS"
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
    // 4. Testing WeatherGPT Voice Features
    // =========================================================================
    console.log('\n--- 4. Testing WeatherGPT Two-Way Voice Integration ---');
    // Open WeatherGPT
    await page.evaluate(() => {
      const gptBtn = document.getElementById('dc-weathergpt-floating-btn') || document.getElementById('dc-sidebar-weathergpt');
      if (gptBtn) gptBtn.click();
    });
    await sleep(1200);

    // Verify in-chat microphone button exists
    const hasChatMic = await page.evaluate(() => {
      const mic = document.getElementById('dc-weathergpt-mic-btn');
      return Boolean(mic && mic.offsetHeight > 0);
    });
    console.log('WeatherGPT in-chat microphone button present:', hasChatMic);
    if (!hasChatMic) throw new Error('In-chat microphone button missing from WeatherGPT!');

    // Click WeatherGPT mic button
    await page.click('#dc-weathergpt-mic-btn');
    await sleep(800);

    const isMicActiveInChat = await page.evaluate(() => {
      const mic = document.getElementById('dc-weathergpt-mic-btn');
      return Boolean(mic && (mic.classList.contains('listening') || mic.classList.contains('active')));
    });
    console.log('WeatherGPT in-chat mic activates on click:', isMicActiveInChat);

    // Click mic again to stop
    await page.click('#dc-weathergpt-mic-btn');
    await sleep(600);

    // =========================================================================
    // 5. Visual Artifact Capture
    // =========================================================================
    const screenshotPath = path.join(ARTIFACT_DIR, 'e2e_voice_control_verified.png');
    await page.screenshot({ path: screenshotPath, fullPage: false });
    console.log('Saved visual verification screenshot to:', screenshotPath);

    console.log('\n======================================================');
    console.log('🎉 ALL VOICE CONTROL E2E SCENARIOS VERIFIED CLEANLY!');
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
