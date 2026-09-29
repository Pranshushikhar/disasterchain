const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const PORT = 9224;
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
    const res = await this.send('Runtime.evaluate', {
      expression,
      returnByValue: true,
      awaitPromise: true,
    });
    if (res.exceptionDetails) {
      throw new Error(`Eval error: ${JSON.stringify(res.exceptionDetails)}`);
    }
    return res.result?.value;
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
    console.log(`📸 Screenshot saved: ${filePath}`);
  }

  close() {
    if (this.ws) {
      try {
        this.ws.close();
      } catch (e) {}
    }
  }
}

async function capture() {
  const userDataDir = path.join(__dirname, '..', '.edge_qa_weather_after');
  const edgeArgs = [
    `--remote-debugging-port=${PORT}`,
    `--user-data-dir=${userDataDir}`,
    '--no-first-run',
    '--no-default-browser-check',
    '--window-size=1280,950',
    'http://localhost:3000/weather',
  ];

  const edgeProc = spawn(EDGE_PATH, edgeArgs);
  let cdp = null;

  try {
    let targets = null;
    for (let i = 0; i < 20; i++) {
      await sleep(500);
      try {
        targets = await getJson(`http://localhost:${PORT}/json`);
        if (targets && targets.length > 0) break;
      } catch (e) {}
    }

    const pageTarget = targets.find((t) => t.type === 'page') || targets[0];
    cdp = new CDPClient(pageTarget.webSocketDebuggerUrl);
    await cdp.connect();
    await cdp.send('Page.enable');
    await cdp.send('Console.enable');
    await cdp.send('Runtime.enable');

    cdp.ws.onmessage = (msg) => {
      const data = JSON.parse(msg.data);
      if (data.method === 'Console.messageAdded') {
        console.log('BROWSER LOG:', data.params.message.text);
      }
      if (data.method === 'Runtime.consoleAPICalled') {
        console.log('BROWSER CONSOLE:', ...data.params.args.map(a => a.value || a.description));
      }
      if (data.id && cdp.callbacks.has(data.id)) {
        const { resolve, reject } = cdp.callbacks.get(data.id);
        cdp.callbacks.delete(data.id);
        if (data.error) reject(data.error);
        else resolve(data.result);
      }
    };

    console.log('Waiting for weather data to populate...');
    for (let i = 0; i < 30; i++) {
      await sleep(500);
      const text = await cdp.eval('document.querySelector(".weather-temp-display")?.innerText');
      if (text && !text.includes('--')) {
        console.log('Weather data populated:', text);
        break;
      }
    }
    await sleep(1000);

    // 1. Desktop Top (Header + Location + Current Conditions)
    await cdp.setViewport(1280, 950, false);
    await cdp.eval('window.scrollTo({ top: 0, behavior: "instant" })');
    await sleep(400);
    const desktopPath = path.join(ARTIFACT_DIR, 'weather_editorial_desktop.png');
    await cdp.captureScreenshot(desktopPath);

    // 2. Desktop Forecast Timeline + AQI
    await cdp.eval('window.scrollTo({ top: 600, behavior: "instant" })');
    await sleep(400);
    const desktopPath2 = path.join(ARTIFACT_DIR, 'weather_editorial_desktop_lower.png');
    await cdp.captureScreenshot(desktopPath2);

    // 3. Desktop Trend Chart + Hazards
    await cdp.eval('window.scrollTo({ top: 1200, behavior: "instant" })');
    await sleep(400);
    const desktopPath3 = path.join(ARTIFACT_DIR, 'weather_editorial_desktop_chart_hazards.png');
    await cdp.captureScreenshot(desktopPath3);

    // 4. Desktop WeatherGPT + Radar Map
    await cdp.eval('window.scrollTo({ top: 1800, behavior: "instant" })');
    await sleep(400);
    const desktopPath4 = path.join(ARTIFACT_DIR, 'weather_editorial_desktop_gpt_map.png');
    await cdp.captureScreenshot(desktopPath4);

    // 5. Mobile Top
    await cdp.eval('window.scrollTo({ top: 0, behavior: "instant" })');
    await cdp.setViewport(390, 844, true);
    await sleep(400);
    const mobilePath = path.join(ARTIFACT_DIR, 'weather_editorial_mobile.png');
    await cdp.captureScreenshot(mobilePath);

    // 6. Mobile Current Conditions & AQI
    await cdp.eval('window.scrollTo({ top: 550, behavior: "instant" })');
    await sleep(400);
    const mobilePath2 = path.join(ARTIFACT_DIR, 'weather_editorial_mobile_lower.png');
    await cdp.captureScreenshot(mobilePath2);

    // 7. Mobile Forecast & Trend Chart
    await cdp.eval('window.scrollTo({ top: 1250, behavior: "instant" })');
    await sleep(400);
    const mobilePath3 = path.join(ARTIFACT_DIR, 'weather_editorial_mobile_forecast.png');
    await cdp.captureScreenshot(mobilePath3);

    // 8. Mobile Hazards & WeatherGPT
    await cdp.eval('window.scrollTo({ top: 1950, behavior: "instant" })');
    await sleep(400);
    const mobilePath4 = path.join(ARTIFACT_DIR, 'weather_editorial_mobile_hazards_gpt.png');
    await cdp.captureScreenshot(mobilePath4);

    console.log('All verification screenshots captured successfully.');
  } catch (err) {
    console.error('Error during capture:', err);
  } finally {
    if (cdp) cdp.close();
    edgeProc.kill();
    try {
      fs.rmSync(userDataDir, { recursive: true, force: true });
    } catch (e) {}
  }
}

capture();
