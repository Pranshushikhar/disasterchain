const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');
const WebSocket = require(path.join(__dirname, '../frontend/node_modules/ws'));

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const PORT = 9229;
const ARTIFACT_DIR = 'C:\\Users\\shikh\\.gemini\\antigravity-ide\\brain\\cce069f5-9bfa-4574-8757-4ffc2d268221';

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

async function runVisualQA() {
  console.log('🚀 Launching Edge on remote debugging port ' + PORT + '...');
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
    throw new Error('Failed to connect to Edge debugging port ' + PORT);
  }

  const targets = await getJson(`http://127.0.0.1:${PORT}/json/list`);
  const pageTarget = targets.find((t) => t.type === 'page') || targets[0];
  const client = new CDPClient(pageTarget.webSocketDebuggerUrl);
  await client.connect();
  console.log('✅ Connected to Edge DevTools socket.');

  await client.send('Page.enable');
  await client.send('DOM.enable');

  const testCases = [
    // 1. Mobile Situation Screen at 390x844
    {
      name: 'mobile_situation_390.png',
      url: 'http://localhost:3000/',
      width: 390,
      height: 844,
      mobile: true,
      waitMs: 2500,
    },
    // 1b. Mobile Situation Screen Scrolled at 390x844 (Weather & Impact Chain)
    {
      name: 'mobile_situation_scrolled_390.png',
      url: 'http://localhost:3000/',
      width: 390,
      height: 844,
      mobile: true,
      waitMs: 2000,
      action: async (client) => {
        await client.send('Runtime.evaluate', { expression: 'window.scrollTo(0, 480)' });
        await sleep(1000);
      },
    },
    // 2. Mobile Situation Screen at 412x915
    {
      name: 'mobile_situation_412.png',
      url: 'http://localhost:3000/',
      width: 412,
      height: 915,
      mobile: true,
      waitMs: 2500,
    },
    // 3. Mobile Situation Screen at 360x800
    {
      name: 'mobile_situation_360.png',
      url: 'http://localhost:3000/',
      width: 360,
      height: 800,
      mobile: true,
      waitMs: 2500,
    },
    // 4. Mobile Fullscreen Map Screen at 390x844
    {
      name: 'mobile_map_fullscreen_390.png',
      url: 'http://localhost:3000/affected-areas',
      width: 390,
      height: 844,
      mobile: true,
      waitMs: 3500,
    },
    // 5. Mobile Alerts Chronological Feed at 390x844
    {
      name: 'mobile_alerts_feed_390.png',
      url: 'http://localhost:3000/alerts',
      width: 390,
      height: 844,
      mobile: true,
      waitMs: 2500,
    },
    // 6. Mobile More Screen at 390x844
    {
      name: 'mobile_more_screen_390.png',
      url: 'http://localhost:3000/more',
      width: 390,
      height: 844,
      mobile: true,
      waitMs: 2500,
    },
    // 7. Mobile WeatherGPT Screen at 390x844
    {
      name: 'mobile_weathergpt_390.png',
      url: 'http://localhost:3000/weather-gpt',
      width: 390,
      height: 844,
      mobile: true,
      waitMs: 2500,
    },
    // 8. Mobile SOS Modal at 390x844 (Section 8)
    {
      name: 'mobile_sos_modal_390.png',
      url: 'http://localhost:3000/',
      width: 390,
      height: 844,
      mobile: true,
      waitMs: 2000,
      action: async (client) => {
        await client.send('Runtime.evaluate', {
          expression: `
            const btn = document.getElementById('mobile-nav-sos-btn');
            if (btn) {
              btn.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
              setTimeout(() => {
                btn.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
              }, 120);
            }
          `,
        });
        await sleep(1200);
      },
    },
    // 9. Mobile SOS Logged & CALL 112 Screen at 390x844 (Section 8)
    {
      name: 'mobile_sos_logged_390.png',
      url: 'http://localhost:3000/',
      width: 390,
      height: 844,
      mobile: true,
      waitMs: 2000,
      action: async (client) => {
        await client.send('Runtime.evaluate', {
          expression: `
            const btn = document.getElementById('mobile-nav-sos-btn');
            if (btn) {
              btn.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
              setTimeout(() => {
                const trigger = document.getElementById('mobile-sos-hold-trigger');
                if (trigger) {
                  trigger.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
                }
              }, 400);
            }
          `,
        });
        await sleep(2200);
      },
    },
    // 10. Mobile Digital Twin Modal at 390x844 (Section 10)
    {
      name: 'mobile_digital_twin_390.png',
      url: 'http://localhost:3000/more',
      width: 390,
      height: 844,
      mobile: true,
      waitMs: 2000,
      action: async (client) => {
        await client.send('Runtime.evaluate', {
          expression: `document.getElementById('more-spatial-model-btn')?.click();`,
        });
        await sleep(1500);
      },
    },
    // 11. Mobile Replay Modal at 390x844 (Section 11)
    {
      name: 'mobile_replay_390.png',
      url: 'http://localhost:3000/more',
      width: 390,
      height: 844,
      mobile: true,
      waitMs: 2000,
      action: async (client) => {
        await client.send('Runtime.evaluate', {
          expression: `document.getElementById('more-historical-replay-btn')?.click();`,
        });
        await sleep(1500);
      },
    },
    // 12. Tablet Portrait at 768x1024
    {
      name: 'mobile_tablet_portrait_768.png',
      url: 'http://localhost:3000/',
      width: 768,
      height: 1024,
      mobile: true,
      waitMs: 2500,
    },
    // 13. Desktop Regression Check at 1440x900
    {
      name: 'desktop_situation_room_1440.png',
      url: 'http://localhost:3000/',
      width: 1440,
      height: 900,
      mobile: false,
      waitMs: 3500,
    },
  ];

  for (const tc of testCases) {
    console.log(`📸 Capturing ${tc.name} (${tc.width}x${tc.height}, ${tc.url})...`);
    await client.send('Emulation.setDeviceMetricsOverride', {
      width: tc.width,
      height: tc.height,
      deviceScaleFactor: 2,
      mobile: tc.mobile,
    });

    await client.send('Page.navigate', { url: tc.url });
    await sleep(tc.waitMs);

    if (tc.action) {
      await tc.action(client);
    }

    const shot = await client.send('Page.captureScreenshot', { format: 'png' });
    const filePath = path.join(ARTIFACT_DIR, tc.name);
    fs.writeFileSync(filePath, Buffer.from(shot.data, 'base64'));
    console.log(`✅ Saved ${tc.name} to ${filePath}`);
  }

  client.close();
  edgeProc.kill();
  console.log('🎉 Visual QA capture suite complete!');
}

runVisualQA().catch((err) => {
  console.error('QA script failed:', err);
  process.exit(1);
});
