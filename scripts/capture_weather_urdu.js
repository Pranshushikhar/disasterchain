const fs = require('fs');
const { spawn } = require('child_process');
const http = require('http');
const path = require('path');

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const PORT = 9225;
const ARTIFACT_DIR = 'C:\\Users\\shikh\\.gemini\\antigravity-ide\\brain\\863b411c-7f74-47fb-a2fd-ddbab2b8a6d5';

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
function getJson(url) {
  return new Promise((resolve, reject) => {
    http.get(url, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
  });
}

async function run() {
  const userDataDir = path.join(__dirname, '..', '.edge_qa_weather_rtl');
  const edgeArgs = [
    `--remote-debugging-port=${PORT}`,
    `--user-data-dir=${userDataDir}`,
    '--no-first-run',
    '--no-default-browser-check',
    '--window-size=1280,950',
    'http://localhost:3000/weather'
  ];
  const edge = spawn(EDGE_PATH, edgeArgs);
  let ws = null;
  try {
    let targets = null;
    for (let i = 0; i < 20; i++) {
      await sleep(500);
      try {
        targets = await getJson(`http://localhost:${PORT}/json`);
        if (targets && targets.length > 0) break;
      } catch (e) {}
    }
    const target = targets.find(t => t.type === 'page') || targets[0];
    ws = new WebSocket(target.webSocketDebuggerUrl);
    await new Promise(r => ws.onopen = r);
    
    let id = 1;
    const send = (method, params = {}) => new Promise((resolve, reject) => {
      const curId = id++;
      const handler = msg => {
        const d = JSON.parse(msg.data);
        if (d.id === curId) {
          ws.removeEventListener('message', handler);
          if (d.error) reject(d.error);
          else resolve(d.result);
        }
      };
      ws.addEventListener('message', handler);
      ws.send(JSON.stringify({ id: curId, method, params }));
    });

    await send('Page.enable');
    await send('Runtime.enable');
    await sleep(2000);

    // Switch to Urdu
    await send('Runtime.evaluate', {
      expression: `
        localStorage.setItem('disasterchain_language', 'ur');
        window.location.reload();
      `,
      awaitPromise: true
    });
    await sleep(3500);

    const shot = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(ARTIFACT_DIR, 'weather_editorial_rtl_urdu.png'), Buffer.from(shot.data, 'base64'));
    console.log('Urdu RTL screenshot captured.');
  } finally {
    if (ws) ws.close();
    edge.kill();
    try { fs.rmSync(userDataDir, { recursive: true, force: true }); } catch (e) {}
  }
}
run();
