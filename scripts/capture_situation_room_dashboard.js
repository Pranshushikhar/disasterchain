const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');
const WebSocket = require(path.join(__dirname, '../frontend/node_modules/ws'));

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const PORT = 9227;
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

async function capture() {
  console.log('🚀 Launching Edge on port ' + PORT + '...');
  const edgeProc = spawn(EDGE_PATH, [
    `--remote-debugging-port=${PORT}`,
    '--headless=new',
    '--disable-gpu',
    '--no-first-run',
    '--no-default-browser-check',
    '--user-data-dir=C:\\Users\\shikh\\New folder\\.edge_dashboard_qa',
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

  const viewports = [
    { name: 'situation_room_dashboard_1440.png', width: 1440, height: 900, isMobile: false },
    { name: 'situation_room_dashboard_1280.png', width: 1280, height: 800, isMobile: false },
    { name: 'situation_room_dashboard_390.png', width: 390, height: 844, isMobile: true },
    { name: 'situation_room_dashboard_412.png', width: 412, height: 915, isMobile: true },
  ];

  for (const vp of viewports) {
    console.log(`Setting viewport ${vp.width}x${vp.height} (${vp.name})...`);
    await client.send('Emulation.setDeviceMetricsOverride', {
      width: vp.width,
      height: vp.height,
      deviceScaleFactor: 2,
      mobile: vp.isMobile,
    });

    console.log('Navigating to http://localhost:3000/dashboard...');
    await client.send('Page.navigate', { url: 'http://localhost:3000/dashboard' });
    await sleep(3500); // Allow tiles and telemetry to settle

    const shot = await client.send('Page.captureScreenshot', { format: 'png' });
    const filePath = path.join(ARTIFACT_DIR, vp.name);
    fs.writeFileSync(filePath, Buffer.from(shot.data, 'base64'));
    console.log(`📸 Saved screenshot: ${vp.name}`);
  }

  client.close();
  edgeProc.kill();
  console.log('🎉 All Situation Room Dashboard screenshots captured successfully.');
}

capture().catch((e) => {
  console.error('Capture failed:', e);
  process.exit(1);
});
