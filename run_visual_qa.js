const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const WebSocket = require('ws');

const ARTIFACTS_DIR = 'C:\\Users\\shikh\\.gemini\\antigravity-ide\\brain\\8324d33f-d6f1-41ae-ad4e-0d902ee072ae\\scratch';
if (!fs.existsSync(ARTIFACTS_DIR)) {
  fs.mkdirSync(ARTIFACTS_DIR, { recursive: true });
}

async function sleep(ms) {
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
    this.ws = new WebSocket(this.wsUrl);
    await new Promise((resolve, reject) => {
      this.ws.on('open', resolve);
      this.ws.on('error', reject);
    });

    this.ws.on('message', (msg) => {
      const data = JSON.parse(msg);
      if (data.id && this.callbacks.has(data.id)) {
        const { resolve, reject } = this.callbacks.get(data.id);
        this.callbacks.delete(data.id);
        if (data.error) reject(data.error);
        else resolve(data.result);
      }
    });
  }

  send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = this.id++;
      this.callbacks.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  async evaluate(expression) {
    const res = await this.send('Runtime.evaluate', {
      expression,
      returnByValue: true,
      awaitPromise: true,
    });
    return res.result ? res.result.value : null;
  }

  async captureScreenshot(filename) {
    const res = await this.send('Page.captureScreenshot', { format: 'png' });
    const buffer = Buffer.from(res.data, 'base64');
    const fullPath = path.join(ARTIFACTS_DIR, filename);
    fs.writeFileSync(fullPath, buffer);
    console.log(`Saved screenshot: ${filename} (${buffer.length} bytes)`);
    return fullPath;
  }
}

async function run() {
  console.log('Launching headless Edge on port 9222...');
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const edgeProc = spawn(edgePath, [
    '--headless',
    '--disable-gpu',
    '--remote-debugging-port=9222',
    '--window-size=1440,900',
    'http://localhost:3000',
  ]);

  edgeProc.stderr.on('data', (d) => {});

  let targets = null;
  for (let i = 0; i < 20; i++) {
    await sleep(500);
    try {
      targets = await getJson('http://localhost:9222/json/list');
      if (targets && targets.length > 0) break;
    } catch (e) {}
  }

  if (!targets || targets.length === 0) {
    throw new Error('Failed to connect to Edge debug port');
  }

  const pageTarget = targets.find((t) => t.type === 'page') || targets[0];
  console.log('Connecting to target:', pageTarget.webSocketDebuggerUrl);

  const cdp = new CDPClient(pageTarget.webSocketDebuggerUrl);
  await cdp.connect();
  await cdp.send('Page.enable');
  await cdp.send('Runtime.enable');

  console.log('Waiting for initial load and React mount...');
  await sleep(4000);

  // 1. Initial Desktop Dashboard Screenshot
  await cdp.captureScreenshot('qa_01_situation_room.png');

  // 2. Locate and inspect WeatherGPT floating pod
  const podInfo = await cdp.evaluate(`
    (() => {
      const btn = document.getElementById('weathergpt-launcher-btn');
      if (!btn) return { found: false };
      const rect = btn.getBoundingClientRect();
      return {
        found: true,
        text: btn.innerText,
        x: rect.x,
        y: rect.y,
        width: rect.width,
        height: rect.height,
        visible: rect.width > 0 && rect.height > 0
      };
    })()
  `);
  console.log('WeatherGPT launcher pod status:', podInfo);

  // 3. Click WeatherGPT launcher to open terminal panel
  console.log('Clicking WeatherGPT launcher pod...');
  await cdp.evaluate(`
    (() => {
      const btn = document.getElementById('weathergpt-launcher-btn');
      if (btn) btn.click();
    })()
  `);
  await sleep(1500);

  // 4. Capture screenshot of opened WeatherGPT terminal panel
  await cdp.captureScreenshot('qa_02_terminal_opened.png');

  // 5. Click the first quick action chip: "What's the current risk?"
  console.log('Clicking quick action chip: "What\'s the current risk?"...');
  const quickActionClicked = await cdp.evaluate(`
    (() => {
      const chips = Array.from(document.querySelectorAll('.quick-chip-btn'));
      if (chips.length > 0) {
        chips[0].click();
        return { clicked: true, text: chips[0].innerText };
      }
      return { clicked: false };
    })()
  `);
  console.log('Quick action click result:', quickActionClicked);

  // Wait for AI response to stream or render
  await sleep(4000);
  await cdp.captureScreenshot('qa_03_copilot_response.png');

  // 6. Test persistence across navigation: navigate to /weather
  console.log('Navigating to /weather via rail while copilot is active...');
  await cdp.evaluate(`
    (() => {
      const railWeather = Array.from(document.querySelectorAll('.rail-nav-item')).find(el => el.getAttribute('href') === '/weather');
      if (railWeather) {
        railWeather.click();
        return { clicked: true };
      } else {
        window.location.href = '/weather';
        return { redirected: true };
      }
    })()
  `);
  await sleep(2500);

  // 7. Verify Weather page and persistent copilot state
  const persistenceCheck = await cdp.evaluate(`
    (() => {
      const panel = document.getElementById('weathergpt-chat-panel');
      const messages = Array.from(document.querySelectorAll('.message-turn')).map(m => m.innerText);
      const pathname = window.location.pathname;
      return {
        panelVisible: !!panel,
        messagesCount: messages.length,
        pathname
      };
    })()
  `);
  console.log('Persistence check on /weather:', persistenceCheck);
  await cdp.captureScreenshot('qa_04_weather_page_persisted.png');

  // 8. Test Mobile Viewport (390x844)
  console.log('Testing Mobile Viewport (390x844)...');
  await cdp.send('Emulation.setDeviceMetricsOverride', {
    width: 390,
    height: 844,
    deviceScaleFactor: 2,
    mobile: true,
  });
  await sleep(1500);
  await cdp.captureScreenshot('qa_05_mobile_overview.png');

  // Check mobile SOS button status and position vs WeatherGPT
  const mobileMetrics = await cdp.evaluate(`
    (() => {
      const sosBtn = document.getElementById('mobile-nav-sos-btn') || document.querySelector('.mobile-nav-sos-btn');
      const gptBtn = document.getElementById('weathergpt-launcher-btn');
      const panel = document.getElementById('weathergpt-chat-panel');
      return {
        sos: sosBtn ? {
          x: sosBtn.getBoundingClientRect().x,
          y: sosBtn.getBoundingClientRect().y,
          w: sosBtn.getBoundingClientRect().width,
          h: sosBtn.getBoundingClientRect().height
        } : null,
        gpt: gptBtn ? {
          x: gptBtn.getBoundingClientRect().x,
          y: gptBtn.getBoundingClientRect().y,
          w: gptBtn.getBoundingClientRect().width,
          h: gptBtn.getBoundingClientRect().height
        } : null,
        panelOpen: !!panel
      };
    })()
  `);
  console.log('Mobile layout metrics:', mobileMetrics);

  console.log('All QA steps completed successfully!');
  edgeProc.kill();
  process.exit(0);
}

run().catch((err) => {
  console.error('QA script error:', err);
  process.exit(1);
});
