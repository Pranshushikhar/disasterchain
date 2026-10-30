const puppeteer = require('puppeteer-core');
const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const http = require('http');
const fs = require('fs');
const path = require('path');

const BUILD_DIR = path.join(__dirname, '../frontend/build');
const PORT = 4178;
const ARTIFACT_DIR = 'C:\\Users\\shikh\\.gemini\\antigravity-ide\\brain\\04542bf0-b323-41ac-a81d-2056569b8398';

const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
};

function startServer() {
  const server = http.createServer((req, res) => {
    let urlPath = req.url.split('?')[0];
    let filePath = path.join(BUILD_DIR, urlPath === '/' ? 'index.html' : urlPath);

    if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
      filePath = path.join(BUILD_DIR, 'index.html');
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    fs.readFile(filePath, (err, content) => {
      if (err) {
        res.writeHead(500);
        res.end('Error loading ' + filePath);
      } else {
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(content, 'utf-8');
      }
    });
  });

  return new Promise((resolve) => {
    server.listen(PORT, '127.0.0.1', () => {
      resolve(server);
    });
  });
}

(async () => {
  const server = await startServer();
  const browser = await puppeteer.launch({
    executablePath: edgePath,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });

    await page.evaluateOnNewDocument(() => {
      if ('serviceWorker' in navigator) {
        delete navigator.__proto__.serviceWorker;
      }
      localStorage.clear();
      localStorage.setItem('disasterchain_tour_completed', 'true');
    });

    await page.goto(`http://127.0.0.1:${PORT}/?skip_intro=1`, { waitUntil: 'networkidle0', timeout: 30000 });
    await sleep(2000);

    // Open unified assistant
    await page.click('#dc-global-voice-assistant-btn');
    await sleep(800);

    // Q1: What's the weather today?
    await page.type('#dc-voice-chat-input', 'What is the weather today?');
    await page.click('#dc-voice-send-btn');
    await sleep(1500);

    // Q2: Will it rain tomorrow?
    await page.type('#dc-voice-chat-input', 'Will it rain tomorrow?');
    await page.click('#dc-voice-send-btn');
    await sleep(1500);

    // Q3: Should I carry an umbrella?
    await page.type('#dc-voice-chat-input', 'Should I carry an umbrella?');
    await page.click('#dc-voice-send-btn');
    await sleep(1500);

    const screenshotPath = path.join(ARTIFACT_DIR, 'unified_ai_weather_conversation.png');
    await page.screenshot({ path: screenshotPath, fullPage: false });
    console.log('Saved visual verification screenshot to:', screenshotPath);

    await page.close();
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await browser.close();
    server.close();
  }
})();
