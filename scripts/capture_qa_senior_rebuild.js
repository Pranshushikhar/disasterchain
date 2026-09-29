const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');
const WebSocket = require(path.join(__dirname, '../frontend/node_modules/ws'));

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const PORT = 9226;
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
      this.ws.onopen = () => resolve();
      this.ws.onerror = (e) => reject(e);
      this.ws.onmessage = (msg) => {
        const data = JSON.parse(msg.data);
        if (data.id && this.callbacks.has(data.id)) {
          const { resolve, reject } = this.callbacks.get(data.id);
          this.callbacks.delete(data.id);
          if (data.error) reject(data.error);
          else resolve(data.result);
        }
      };
    });
  }

  send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = this.id++;
      this.callbacks.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  async eval(expression) {
    try {
      const res = await this.send('Runtime.evaluate', {
        expression,
        returnByValue: true,
        awaitPromise: false,
      });
      return res.result?.value;
    } catch (e) {
      return null;
    }
  }

  async setViewport(width, height, isMobile = false) {
    await this.send('Emulation.setDeviceMetricsOverride', {
      width,
      height,
      deviceScaleFactor: 2,
      mobile: isMobile,
    });
  }

  async captureScreenshot(filePath) {
    const res = await this.send('Page.captureScreenshot', { format: 'png' });
    const buffer = Buffer.from(res.data, 'base64');
    fs.writeFileSync(filePath, buffer);
    console.log(`📸 Saved screenshot: ${path.basename(filePath)}`);
  }

  close() {
    if (this.ws) {
      try {
        this.ws.close();
      } catch (e) {}
    }
  }
}

async function runSeniorQaCapture() {
  const profileDir = path.join(ARTIFACT_DIR, 'edge_qa_rebuild_profile2');
  if (!fs.existsSync(profileDir)) {
    fs.mkdirSync(profileDir, { recursive: true });
  }

  console.log(`🚀 Launching Edge on port ${PORT}...`);
  const edgeProc = spawn(
    EDGE_PATH,
    [
      `--remote-debugging-port=${PORT}`,
      `--user-data-dir=${profileDir}`,
      '--no-first-run',
      '--no-default-browser-check',
      '--window-size=1440,900',
      'http://localhost:3000/',
    ],
    { stdio: 'ignore' }
  );

  let targetWs = null;
  for (let i = 0; i < 25; i++) {
    await sleep(500);
    try {
      const targets = await getJson(`http://127.0.0.1:${PORT}/json`);
      const pageTarget = targets.find((t) => t.type === 'page');
      if (pageTarget && pageTarget.webSocketDebuggerUrl) {
        targetWs = pageTarget.webSocketDebuggerUrl;
        break;
      }
    } catch (e) {}
  }

  if (!targetWs) {
    console.error('❌ Failed to connect to Edge debug socket');
    edgeProc.kill();
    return;
  }

  const client = new CDPClient(targetWs);
  await client.connect();
  console.log('✅ Connected to Edge CDP socket.');

  await client.send('Page.enable');
  await client.send('Runtime.enable');

  const targets = [
    { name: '01_landing_desktop', url: 'http://localhost:3000/', width: 1440, height: 900, isMobile: false, wait: 2000 },
    { name: '02_dashboard_desktop', url: 'http://localhost:3000/dashboard', width: 1440, height: 900, isMobile: false, wait: 2500 },
    { name: '03_weather_desktop', url: 'http://localhost:3000/weather', width: 1440, height: 900, isMobile: false, wait: 3000 },
    { name: '04_weathergpt_desktop', url: 'http://localhost:3000/weather-gpt', width: 1440, height: 900, isMobile: false, wait: 2500 },
    { name: '05_map_desktop', url: 'http://localhost:3000/affected-areas', width: 1440, height: 900, isMobile: false, wait: 3000 },
    { name: '06_alerts_desktop', url: 'http://localhost:3000/alerts', width: 1440, height: 900, isMobile: false, wait: 2000 },
    { name: '07_sos_desktop', url: 'http://localhost:3000/sos', width: 1440, height: 900, isMobile: false, wait: 2000 },
    { name: '08_dashboard_mobile_390', url: 'http://localhost:3000/dashboard', width: 390, height: 844, isMobile: true, wait: 2500 },
    { name: '09_weather_mobile_390', url: 'http://localhost:3000/weather', width: 390, height: 844, isMobile: true, wait: 3000 },
    { name: '10_weathergpt_mobile_390', url: 'http://localhost:3000/weather-gpt', width: 390, height: 844, isMobile: true, wait: 2500 },
    { name: '11_drawer_mobile_390', url: 'http://localhost:3000/dashboard', width: 390, height: 844, isMobile: true, wait: 2000, action: 'openDrawer' },
    { name: '12_sos_mobile_390', url: 'http://localhost:3000/sos', width: 390, height: 844, isMobile: true, wait: 2000 },
    { name: '13_weathergpt_mobile_375', url: 'http://localhost:3000/weather-gpt', width: 375, height: 812, isMobile: true, wait: 2000 },
    { name: '14_weathergpt_mobile_412', url: 'http://localhost:3000/weather-gpt', width: 412, height: 915, isMobile: true, wait: 2000 },
  ];

  for (const t of targets) {
    console.log(`\nNavigating to ${t.name} (${t.url})...`);
    await client.setViewport(t.width, t.height, t.isMobile);
    await client.send('Page.navigate', { url: t.url });
    await sleep(t.wait);

    if (t.action === 'openDrawer') {
      console.log('Opening mobile navigation drawer...');
      await client.eval(`
        const btn = document.getElementById('mobile-nav-toggle-btn') || document.querySelector('.mobile-nav-toggle-btn');
        if (btn) btn.click();
      `);
      await sleep(700);
    }

    const outPath = path.join(ARTIFACT_DIR, `senior_rebuild_${t.name}.png`);
    await client.captureScreenshot(outPath);
  }

  client.close();
  edgeProc.kill();
  console.log(`\n🎉 All ${targets.length} QA Screenshots successfully captured.`);
}

runSeniorQaCapture().catch((err) => {
  console.error('Fatal error during capture:', err);
  process.exit(1);
});
