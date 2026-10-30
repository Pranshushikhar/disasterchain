const puppeteer = require('puppeteer-core');
const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const http = require('http');
const fs = require('fs');
const path = require('path');

const ARTIFACT_DIR = 'C:\\Users\\shikh\\.gemini\\antigravity-ide\\brain\\04542bf0-b323-41ac-a81d-2056569b8398';

// Simple static server for frontend build
function serveBuild(buildDir, port) {
  const mimeTypes = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpg',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
  };

  const server = http.createServer((req, res) => {
    let safeUrl = req.url.split('?')[0];
    let filePath = path.join(buildDir, safeUrl);

    if (safeUrl === '/' || !path.extname(safeUrl)) {
      filePath = path.join(buildDir, 'index.html');
    }

    fs.readFile(filePath, (err, content) => {
      if (err) {
        fs.readFile(path.join(buildDir, 'index.html'), (e2, fallback) => {
          if (e2) {
            res.writeHead(404);
            res.end('Not found');
          } else {
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(fallback);
          }
        });
      } else {
        const ext = path.extname(filePath).toLowerCase();
        res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
        res.end(content);
      }
    });
  });

  return new Promise((resolve) => {
    server.listen(port, () => resolve(server));
  });
}

async function captureAllCapabilities() {
  const port = 5174;
  const buildDir = path.join(__dirname, '..', 'frontend', 'build');

  console.log('Serving production build from:', buildDir);
  const server = await serveBuild(buildDir, port);
  console.log(`Server listening on http://localhost:${port}`);

  const browser = await puppeteer.launch({
    executablePath: edgePath,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--enable-webgl', '--ignore-gpu-blocklist'],
    defaultViewport: { width: 1440, height: 900 },
  });

  const page = await browser.newPage();

  // Ensure tour and intro are marked completed so screenshots are clean and unobstructed
  await page.evaluateOnNewDocument(() => {
    try {
      localStorage.setItem('disasterchain_tour_completed', 'true');
      localStorage.setItem('disasterchain_intro_seen', 'true');
      sessionStorage.setItem('skipIntro', 'true');
    } catch (e) {}
  });

  // Helper to wait and screenshot
  async function snap(route, filename, delayMs = 1200) {
    const url = `http://localhost:${port}${route}${route.includes('?') ? '&' : '?'}skip_intro=1`;
    console.log(`Navigating to: ${url}`);
    await page.goto(url, { waitUntil: 'networkidle2' });
    // Also explicitly verify localStorage on the active page
    await page.evaluate(() => {
      try {
        localStorage.setItem('disasterchain_tour_completed', 'true');
        // If tour card is mounted, dismiss it
        const closeBtn = document.querySelector('.dc-tour-close-btn, .dc-tour-btn-skip');
        if (closeBtn) closeBtn.click();
      } catch (e) {}
    });
    await new Promise((r) => setTimeout(r, delayMs));
    const outPath = path.join(ARTIFACT_DIR, filename);
    await page.screenshot({ path: outPath, fullPage: false });
    console.log(`📸 Saved screenshot: ${filename}`);
  }

  try {
    // 1. CrisisLab Command Simulation
    await snap('/crisis-lab', 'dc2_crisislab_command_sim.png', 1500);

    // 2. 3D Digital Twin City
    await snap('/digital-twin', 'dc2_digital_twin_3d.png', 2000);

    // 3. Satellite Eye Imagery Analysis
    await snap('/satellite-eye', 'dc2_satellite_eye_cv.png', 1500);

    // 4. Rescue Route Intelligence
    await snap('/rescue-intelligence', 'dc2_rescue_route_planner.png', 1500);

    // 5. Rescue Network Coordination
    await snap('/rescue-network', 'dc2_rescue_network_fleet.png', 1500);

    // 6. Homepage with updated navigation and brand identity
    await snap('/', 'dc2_homepage_navigation.png', 1200);

    console.log('\n🎉 ALL DISASTERCHAIN 2.0 VISUAL SCREENSHOTS CAPTURED SUCCESSFULLY!');
  } catch (err) {
    console.error('Screenshot capture error:', err);
  } finally {
    await browser.close();
    server.close();
  }
}

captureAllCapabilities();
