const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const WebSocket = require('ws');

const BUILD_DIR = path.join(__dirname, '../frontend/build');

// Simple static file server
function serveStatic(port) {
  const mimeTypes = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
  };

  const server = http.createServer((req, res) => {
    let reqPath = req.url.split('?')[0];
    if (reqPath === '/') reqPath = '/index.html';
    let filePath = path.join(BUILD_DIR, reqPath);

    if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
      filePath = path.join(BUILD_DIR, 'index.html');
    }

    const ext = path.extname(filePath);
    const contentType = mimeTypes[ext] || 'application/octet-stream';

    fs.readFile(filePath, (err, content) => {
      if (err) {
        res.writeHead(500);
        res.end('Error loading file');
      } else {
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(content);
      }
    });
  });

  return new Promise((resolve) => {
    server.listen(port, () => {
      console.log(`Test server running at http://localhost:${port}`);
      resolve(server);
    });
  });
}

function getJson(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', (c) => (data += c));
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
}

async function run() {
  const server = await serveStatic(5173);

  console.log('Launching headless browser to verify localization...');
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const edgeProc = spawn(edgePath, [
    '--headless',
    '--disable-gpu',
    '--remote-debugging-port=9333',
    '--window-size=1440,900',
    'http://localhost:5173'
  ]);

  let targets = null;
  for (let i = 0; i < 20; i++) {
    await new Promise((r) => setTimeout(r, 500));
    try {
      targets = await getJson('http://localhost:9333/json/list');
      if (targets && targets.length > 0) break;
    } catch (e) {}
  }

  if (!targets) {
    console.error('Could not connect to Edge debug port');
    edgeProc.kill();
    server.close();
    process.exit(1);
  }

  const pageTarget = targets.find((t) => t.type === 'page') || targets[0];
  const cdp = new CDPClient(pageTarget.webSocketDebuggerUrl);
  await cdp.connect();
  await cdp.send('Page.enable');
  await cdp.send('Runtime.enable');

  await new Promise((r) => setTimeout(r, 3000));

  // Set language to Hindi in localStorage and verify UI
  console.log('\n--- TESTING HINDI (hi) LOCALIZATION ---');
  await cdp.evaluate(`
    localStorage.setItem('disasterchain_language', 'hi');
    window.location.reload();
  `);
  await new Promise((r) => setTimeout(r, 4000));

  const hindiHub = await cdp.evaluate(`
    (() => {
      const htmlDir = document.documentElement.dir || 'ltr';
      const htmlLang = document.documentElement.lang || '';
      const bodyText = document.body.innerText;
      const navLinks = Array.from(document.querySelectorAll('nav a, header a, .dc-nav-item')).map(a => a.innerText.trim()).filter(Boolean);
      return {
        htmlDir,
        htmlLang,
        navLinks: navLinks.slice(0, 10),
        hasHindiText: /[\\u0900-\\u097F]/.test(bodyText),
        sampleText: bodyText.slice(0, 300)
      };
    })()
  `);
  console.log('Hindi Hub Test Result:', JSON.stringify(hindiHub, null, 2));

  // Navigate to Weather page and verify
  console.log('\n--- TESTING WEATHER PAGE IN HINDI ---');
  await cdp.evaluate(`window.location.href = '/weather';`);
  await new Promise((r) => setTimeout(r, 3000));

  const weatherHindi = await cdp.evaluate(`
    (() => {
      const headings = Array.from(document.querySelectorAll('h1, h2, h3, .dc-weather-title, .dc-card-title')).map(h => h.innerText.trim()).filter(Boolean);
      const bodyText = document.body.innerText;
      return {
        headings: headings.slice(0, 8),
        hasHindiText: /[\\u0900-\\u097F]/.test(bodyText)
      };
    })()
  `);
  console.log('Hindi Weather Page Result:', JSON.stringify(weatherHindi, null, 2));

  // Test Urdu (RTL) localization
  console.log('\n--- TESTING URDU (ur) RTL LOCALIZATION ---');
  await cdp.evaluate(`
    localStorage.setItem('disasterchain_language', 'ur');
    window.location.reload();
  `);
  await new Promise((r) => setTimeout(r, 4000));

  const urduResult = await cdp.evaluate(`
    (() => {
      const htmlDir = document.documentElement.dir;
      const bodyText = document.body.innerText;
      return {
        htmlDir,
        hasArabicOrUrduScript: /[\\u0600-\\u06FF]/.test(bodyText)
      };
    })()
  `);
  console.log('Urdu RTL Test Result:', JSON.stringify(urduResult, null, 2));

  // Clean up
  edgeProc.kill();
  server.close();
  console.log('\nVerification complete! Server stopped.');
  process.exit(0);
}

run().catch((err) => {
  console.error('Test error:', err);
  process.exit(1);
});

