const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');
const WebSocket = require(path.join(__dirname, '../frontend/node_modules/ws'));

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const CDP_PORT = 9223;
const APP_PORT = 8086;
const ARTIFACT_DIR = 'C:\\Users\\shikh\\.gemini\\antigravity-ide\\brain\\cce069f5-9bfa-4574-8757-4ffc2d268221';
const DIST_DIR = path.join(__dirname, '../mobile/dist');

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

// Static file server for mobile/dist
function startServer() {
  const mimeTypes = {
    '.html': 'text/html',
    '.js': 'application/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.ico': 'image/x-icon',
    '.svg': 'image/svg+xml',
    '.hbc': 'application/octet-stream',
  };

  const server = http.createServer((req, res) => {
    let reqPath = req.url.split('?')[0];
    if (reqPath === '/') reqPath = '/index.html';

    let filePath = path.join(DIST_DIR, reqPath);

    // If no extension, try .html
    if (!path.extname(filePath)) {
      if (fs.existsSync(filePath + '.html')) {
        filePath = filePath + '.html';
      } else if (fs.existsSync(path.join(filePath, 'index.html'))) {
        filePath = path.join(filePath, 'index.html');
      }
    }

    if (!fs.existsSync(filePath)) {
      // Fallback to (tabs).html or index.html
      filePath = path.join(DIST_DIR, 'index.html');
    }

    const ext = path.extname(filePath);
    const contentType = mimeTypes[ext] || 'application/octet-stream';

    fs.readFile(filePath, (err, content) => {
      if (err) {
        res.writeHead(500);
        res.end('Error reading file: ' + err.code);
      } else {
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(content, 'utf-8');
      }
    });
  });

  return new Promise((resolve) => {
    server.listen(APP_PORT, () => {
      console.log(`Mobile app server running at http://localhost:${APP_PORT}`);
      resolve(server);
    });
  });
}

async function captureScreenshot(cdp, filename, width = 390, height = 844) {
  await cdp.send('Emulation.setDeviceMetricsOverride', {
    width,
    height,
    deviceScaleFactor: 2,
    mobile: true,
  });
  await sleep(1200);

  const res = await cdp.send('Page.captureScreenshot', {
    format: 'png',
    captureBeyondViewport: false,
  });

  const outPath = path.join(ARTIFACT_DIR, filename);
  fs.writeFileSync(outPath, Buffer.from(res.data, 'base64'));
  console.log(`Saved screenshot: ${filename} (${width}x${height})`);
}

async function runQA() {
  const server = await startServer();

  const edgeProcess = spawn(
    EDGE_PATH,
    [
      `--remote-debugging-port=${CDP_PORT}`,
      '--headless=new',
      '--disable-gpu',
      '--no-sandbox',
      '--hide-scrollbars',
      `http://localhost:${APP_PORT}`,
    ],
    { stdio: 'ignore' }
  );

  await sleep(2500);

  try {
    const targets = await getJson(`http://127.0.0.1:${CDP_PORT}/json`);
    const pageTarget = targets.find((t) => t.type === 'page');
    if (!pageTarget) throw new Error('No page target found');

    const cdp = new CDPClient(pageTarget.webSocketDebuggerUrl);
    await cdp.connect();

    await cdp.send('Page.enable');
    await cdp.send('Network.enable');

    console.log('--- Capturing Native Mobile Application QA Screenshots ---');

    // 1. Launch / Situation (390x844 - iPhone 14/15/16 standard)
    await cdp.send('Page.navigate', { url: `http://localhost:${APP_PORT}/(tabs)` });
    await sleep(2000);
    await captureScreenshot(cdp, 'native_mobile_launch_390.png', 390, 844);

    // 2. Situation Android (360x800 & 412x915)
    await captureScreenshot(cdp, 'native_mobile_situation_360.png', 360, 800);
    await captureScreenshot(cdp, 'native_mobile_situation_412.png', 412, 915);

    // 3. Map (390x844)
    await cdp.send('Page.navigate', { url: `http://localhost:${APP_PORT}/(tabs)/map` });
    await sleep(2000);
    await captureScreenshot(cdp, 'native_mobile_map_390.png', 390, 844);

    // 4. Alerts feed (390x844)
    await cdp.send('Page.navigate', { url: `http://localhost:${APP_PORT}/(tabs)/alerts` });
    await sleep(2000);
    await captureScreenshot(cdp, 'native_mobile_alerts_390.png', 390, 844);

    // 5. Life-Safety SOS (390x844)
    await cdp.send('Page.navigate', { url: `http://localhost:${APP_PORT}/(tabs)/sos` });
    await sleep(2000);
    await captureScreenshot(cdp, 'native_mobile_sos_390.png', 390, 844);

    // 6. More Screen (Directory navigation)
    await cdp.send('Page.navigate', { url: `http://localhost:${APP_PORT}/(tabs)/more` });
    await sleep(2000);
    await captureScreenshot(cdp, 'native_mobile_more_390.png', 390, 844);

    // 7. WeatherGPT (Ask DisasterChain intelligence console)
    await cdp.send('Page.navigate', { url: `http://localhost:${APP_PORT}/weathergpt` });
    await sleep(2000);
    await captureScreenshot(cdp, 'native_mobile_weathergpt_390.png', 390, 844);

    // 8. Civil Shelters
    await cdp.send('Page.navigate', { url: `http://localhost:${APP_PORT}/shelters` });
    await sleep(2000);
    await captureScreenshot(cdp, 'native_mobile_shelters_390.png', 390, 844);

    // 9. Community Incident Report
    await cdp.send('Page.navigate', { url: `http://localhost:${APP_PORT}/report-incident` });
    await sleep(2000);
    await captureScreenshot(cdp, 'native_mobile_report_390.png', 390, 844);

    // 10. Digital Twin Simulation
    await cdp.send('Page.navigate', { url: `http://localhost:${APP_PORT}/digital-twin` });
    await sleep(2000);
    await captureScreenshot(cdp, 'native_mobile_digital_twin_390.png', 390, 844);

    // 11. Replay Scrubbing
    await cdp.send('Page.navigate', { url: `http://localhost:${APP_PORT}/replay` });
    await sleep(2000);
    await captureScreenshot(cdp, 'native_mobile_replay_390.png', 390, 844);

    // 12. Safety Profile
    await cdp.send('Page.navigate', { url: `http://localhost:${APP_PORT}/profile` });
    await sleep(2000);
    await captureScreenshot(cdp, 'native_mobile_profile_390.png', 390, 844);

    // 13. Tablet Portrait (768x1024)
    await cdp.send('Page.navigate', { url: `http://localhost:${APP_PORT}/(tabs)` });
    await sleep(2000);
    await captureScreenshot(cdp, 'native_mobile_tablet_768.png', 768, 1024);

    console.log('✅ ALL NATIVE MOBILE QA SCREENSHOTS CAPTURED SUCCESSFULLY!');
    cdp.close();
  } catch (err) {
    console.error('QA Execution error:', err);
  } finally {
    edgeProcess.kill();
    server.close();
  }
}

runQA();
