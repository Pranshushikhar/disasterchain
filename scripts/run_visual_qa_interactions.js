const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');
const WebSocket = require(path.join(__dirname, '../frontend/node_modules/ws'));

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const PORT = 9228;
const ARTIFACT_DIR = 'C:\\Users\\shikh\\.gemini\\antigravity-ide\\brain\\863b411c-7f74-47fb-a2fd-ddbab2b8a6d5';

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getJson(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

class CDPClient {
  constructor(wsUrl) {
    this.wsUrl = wsUrl;
    this.ws = null;
    this.id = 1;
    this.callbacks = new Map();
  }

  async connect() {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(this.wsUrl);
      this.ws.on('open', () => resolve());
      this.ws.on('error', reject);
      this.ws.on('message', (data) => {
        try {
          const msg = JSON.parse(data.toString());
          if (msg.id && this.callbacks.has(msg.id)) {
            const cb = this.callbacks.get(msg.id);
            this.callbacks.delete(msg.id);
            if (msg.error) cb.reject(msg.error);
            else cb.resolve(msg.result);
          }
        } catch (e) {
          console.error('CDP parse error:', e);
        }
      });
    });
  }

  send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = this.id++;
      this.callbacks.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  close() {
    if (this.ws) this.ws.close();
  }
}

async function runQA() {
  console.log('🚀 Launching Edge for Visual QA on port ' + PORT + '...');
  const edgeProc = spawn(EDGE_PATH, [
    `--remote-debugging-port=${PORT}`,
    '--headless=new',
    '--disable-gpu',
    '--no-first-run',
    '--no-default-browser-check',
    '--user-data-dir=C:\\Users\\shikh\\New folder\\.edge_qa_visual',
    'about:blank',
  ]);

  edgeProc.stderr.on('data', () => {});

  let versionInfo = null;
  for (let i = 0; i < 30; i++) {
    await sleep(500);
    try {
      versionInfo = await getJson(`http://127.0.0.1:${PORT}/json/version`);
      if (versionInfo && versionInfo.webSocketDebuggerUrl) break;
    } catch (e) {}
  }

  if (!versionInfo) {
    throw new Error('Failed to connect to Edge remote debugging port ' + PORT);
  }

  const targets = await getJson(`http://127.0.0.1:${PORT}/json/list`);
  const pageTarget = targets.find((t) => t.type === 'page') || targets[0];
  const client = new CDPClient(pageTarget.webSocketDebuggerUrl);
  await client.connect();
  console.log('✅ Connected to Edge CDP socket.');

  await client.send('Page.enable');
  await client.send('DOM.enable');
  await client.send('Runtime.enable');

  const captureShot = async (filename) => {
    const shot = await client.send('Page.captureScreenshot', { format: 'png' });
    const filePath = path.join(ARTIFACT_DIR, filename);
    fs.writeFileSync(filePath, Buffer.from(shot.data, 'base64'));
    console.log(`📸 Saved screenshot: ${filename}`);
  };

  // 1. DESKTOP 1440x900
  console.log('1. Setting viewport 1440x900...');
  await client.send('Emulation.setDeviceMetricsOverride', {
    width: 1440,
    height: 900,
    deviceScaleFactor: 2,
    mobile: false,
  });
  await client.send('Page.navigate', { url: 'http://localhost:3000/dashboard' });
  await sleep(3500);
  await captureShot('qa_dashboard_1440.png');

  // Check if AI Assistant exists in DOM
  const aiCheck = await client.send('Runtime.evaluate', {
    expression: `!!document.querySelector('.ai-floating-assistant, .ai-assistant-btn, [aria-label*="AI Assistant"]')`,
  });
  console.log('Floating AI Assistant present in DOM:', aiCheck.result.value);

  // Check Map Markers
  const markerCheck = await client.send('Runtime.evaluate', {
    expression: `document.querySelectorAll('.leaflet-marker-icon').length`,
  });
  console.log('Map markers count in DOM:', markerCheck.result.value);

  // 2. Click a hazard marker on the map to test popup
  console.log('2. Clicking hazard marker...');
  await client.send('Runtime.evaluate', {
    expression: `
      const hazardMarker = document.querySelector('.situation-marker-hazard');
      if (hazardMarker) hazardMarker.click();
    `,
  });
  await sleep(800);
  await captureShot('qa_dashboard_map_popup.png');

  // 3. Test Recenter click
  console.log('3. Testing Recenter button...');
  await client.send('Runtime.evaluate', {
    expression: `
      const recenterBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Recenter'));
      if (recenterBtn) recenterBtn.click();
    `,
  });
  await sleep(800);

  // 4. Test SOS modal trigger
  console.log('4. Testing SOS trigger...');
  await client.send('Runtime.evaluate', {
    expression: `
      const sosBtn = document.querySelector('.nav-rail-link-sos') || Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('EMERGENCY SOS'));
      if (sosBtn) sosBtn.click();
    `,
  });
  await sleep(1000);
  await captureShot('qa_dashboard_sos_modal.png');

  // Close SOS modal without submitting
  await client.send('Runtime.evaluate', {
    expression: `
      const closeBtn = document.querySelector('.modal-close-btn, button[aria-label="Close"], [data-testid="close-modal"]');
      if (closeBtn) closeBtn.click();
      else {
        // Press Escape
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
      }
    `,
  });
  await sleep(800);

  // 5. LAPTOP 1280x800
  console.log('5. Setting viewport 1280x800...');
  await client.send('Emulation.setDeviceMetricsOverride', {
    width: 1280,
    height: 800,
    deviceScaleFactor: 2,
    mobile: false,
  });
  await client.send('Page.navigate', { url: 'http://localhost:3000/dashboard' });
  await sleep(3000);
  await captureShot('qa_dashboard_1280.png');

  // 6. MOBILE 390x844
  console.log('6. Setting viewport 390x844...');
  await client.send('Emulation.setDeviceMetricsOverride', {
    width: 390,
    height: 844,
    deviceScaleFactor: 2,
    mobile: true,
  });
  await client.send('Page.navigate', { url: 'http://localhost:3000/dashboard' });
  await sleep(3000);
  await captureShot('qa_dashboard_390.png');

  // 7. MOBILE 412x915
  console.log('7. Setting viewport 412x915...');
  await client.send('Emulation.setDeviceMetricsOverride', {
    width: 412,
    height: 915,
    deviceScaleFactor: 2,
    mobile: true,
  });
  await client.send('Page.navigate', { url: 'http://localhost:3000/dashboard' });
  await sleep(3000);
  await captureShot('qa_dashboard_412.png');

  // 8. Navigation verification (WeatherGPT and Alerts)
  console.log('8. Testing WeatherGPT navigation...');
  await client.send('Page.navigate', { url: 'http://localhost:3000/weather-gpt' });
  await sleep(2000);
  const wgptTitle = await client.send('Runtime.evaluate', { expression: `document.title` });
  console.log('WeatherGPT loaded:', wgptTitle.result.value);

  console.log('Testing Alerts navigation...');
  await client.send('Page.navigate', { url: 'http://localhost:3000/alerts' });
  await sleep(2000);
  const alertsTitle = await client.send('Runtime.evaluate', { expression: `document.title` });
  console.log('Alerts loaded:', alertsTitle.result.value);

  // Return to dashboard
  console.log('Returning to Dashboard...');
  await client.send('Page.navigate', { url: 'http://localhost:3000/dashboard' });
  await sleep(2000);

  client.close();
  edgeProc.kill();
  console.log('🎉 Comprehensive Visual QA session completed.');
}

runQA().catch((e) => {
  console.error('QA session failed:', e);
  process.exit(1);
});
