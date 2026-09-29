const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');
const WebSocket = require(path.join(__dirname, '../frontend/node_modules/ws'));

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const PORT = 9229;
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
  console.log('🚀 Launching Edge for Comprehensive QA on port ' + PORT + '...');
  const edgeProc = spawn(EDGE_PATH, [
    `--remote-debugging-port=${PORT}`,
    '--headless=new',
    '--disable-gpu',
    '--no-first-run',
    '--no-default-browser-check',
    '--user-data-dir=C:\\Users\\shikh\\New folder\\.edge_qa_comprehensive',
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
    console.log(`📸 Saved: ${filename}`);
  };

  const setViewport = async (w, h, isMobile = false) => {
    await client.send('Emulation.setDeviceMetricsOverride', {
      width: w,
      height: h,
      deviceScaleFactor: 2,
      mobile: isMobile,
    });
  };

  // 1. Situation Room - Desktop 1440x900
  console.log('\n--- 1. SITUATION ROOM (1440x900) ---');
  await setViewport(1440, 900, false);
  await client.send('Page.navigate', { url: 'http://localhost:3000/' });
  await sleep(3500);
  await captureShot('qa_01_situation_room_1440.png');

  // Center Spatial View Switcher: Digital Twin
  console.log('Switching to Digital Twin 2.5D view...');
  await client.send('Runtime.evaluate', {
    expression: `
      const twinBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Digital Twin'));
      if (twinBtn) twinBtn.click();
    `,
  });
  await sleep(1500);
  await captureShot('qa_01b_digital_twin_view.png');

  // Center Spatial View Switcher: Risk Matrix
  console.log('Switching to Risk Matrix view...');
  await client.send('Runtime.evaluate', {
    expression: `
      const rmBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Risk Matrix'));
      if (rmBtn) rmBtn.click();
    `,
  });
  await sleep(1000);
  await captureShot('qa_01c_risk_matrix_view.png');

  // Center Spatial View Switcher: Replay Engine
  console.log('Switching to Temporal Replay view...');
  await client.send('Runtime.evaluate', {
    expression: `
      const replayBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Replay Scrubber'));
      if (replayBtn) replayBtn.click();
    `,
  });
  await sleep(1000);
  await captureShot('qa_01d_temporal_replay_view.png');

  // Switch back to Map
  await client.send('Runtime.evaluate', {
    expression: `
      const mapBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Cartographic Map'));
      if (mapBtn) mapBtn.click();
    `,
  });
  await sleep(1000);

  // 2. Test Global Command Bar (press '/')
  console.log('\n--- 2. GLOBAL COMMAND BAR ---');
  await client.send('Runtime.evaluate', {
    expression: `
      window.dispatchEvent(new KeyboardEvent('keydown', { key: '/', bubbles: true }));
    `,
  });
  await sleep(1000);
  await captureShot('qa_02_global_command_bar.png');

  // Close Command Bar (Escape)
  await client.send('Runtime.evaluate', {
    expression: `
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    `,
  });
  await sleep(600);

  // 3. Weather Intelligence (/weather)
  console.log('\n--- 3. WEATHER INTELLIGENCE (/weather) ---');
  await client.send('Page.navigate', { url: 'http://localhost:3000/weather' });
  await sleep(3000);
  await captureShot('qa_03_weather_intelligence.png');

  // 4. Incident Command Workspace (/incidents)
  console.log('\n--- 4. INCIDENT COMMAND (/incidents) ---');
  await client.send('Page.navigate', { url: 'http://localhost:3000/incidents' });
  await sleep(3000);
  await captureShot('qa_04_incident_command.png');

  // 5. Emergency Alert Center (/alerts)
  console.log('\n--- 5. ALERT CENTER (/alerts) ---');
  await client.send('Page.navigate', { url: 'http://localhost:3000/alerts' });
  await sleep(2500);
  await captureShot('qa_05_alert_center.png');

  // 6. Spatial Model Map (/affected-areas)
  console.log('\n--- 6. SPATIAL MODEL MAP (/affected-areas) ---');
  await client.send('Page.navigate', { url: 'http://localhost:3000/affected-areas' });
  await sleep(3500);
  await captureShot('qa_06_spatial_model_map.png');

  // 7. Shelter Network (/shelters)
  console.log('\n--- 7. SHELTER NETWORK (/shelters) ---');
  await client.send('Page.navigate', { url: 'http://localhost:3000/shelters' });
  await sleep(2500);
  await captureShot('qa_07_shelter_network.png');

  // 8. Profile & My Safety Guardian (/profile)
  console.log('\n--- 8. PERSONAL SAFETY GUARDIAN (/profile) ---');
  await client.send('Page.navigate', { url: 'http://localhost:3000/profile' });
  await sleep(2500);
  await captureShot('qa_08_personal_safety.png');

  // 9. Landing / Civil Defense Portal (/landing)
  console.log('\n--- 9. PUBLIC LANDING (/landing) ---');
  await client.send('Page.navigate', { url: 'http://localhost:3000/landing' });
  await sleep(2500);
  await captureShot('qa_09_public_landing.png');

  // 10. Multi-Viewport Situation Room: Laptop 1280x800
  console.log('\n--- 10. LAPTOP 1280x800 ---');
  await setViewport(1280, 800, false);
  await client.send('Page.navigate', { url: 'http://localhost:3000/' });
  await sleep(3000);
  await captureShot('qa_10_situation_room_1280.png');

  // 11. Multi-Viewport Situation Room: Mobile 390x844
  console.log('\n--- 11. MOBILE 390x844 ---');
  await setViewport(390, 844, true);
  await client.send('Page.navigate', { url: 'http://localhost:3000/' });
  await sleep(3000);
  await captureShot('qa_11_situation_room_mobile_390.png');

  // 12. Multi-Viewport Situation Room: Mobile 412x915
  console.log('\n--- 12. MOBILE 412x915 ---');
  await setViewport(412, 915, true);
  await client.send('Page.navigate', { url: 'http://localhost:3000/' });
  await sleep(3000);
  await captureShot('qa_12_situation_room_mobile_412.png');

  console.log('\n✨ All 12 QA tests captured successfully.');
  client.close();
  edgeProc.kill();
}

runQA().catch((err) => {
  console.error('QA Test execution failed:', err);
  process.exit(1);
});
