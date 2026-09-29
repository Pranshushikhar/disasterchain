const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const PORT = 9222;
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

async function runBrowserQA() {
  console.log('====================================================');
  console.log('STARTING REAL BROWSER QA FOR WEATHERGPT 2.0');
  console.log('====================================================\n');

  const userDataDir = path.join(__dirname, '..', '.edge_qa_profile');
  const edgeArgs = [
    `--remote-debugging-port=${PORT}`,
    `--user-data-dir=${userDataDir}`,
    '--no-first-run',
    '--no-default-browser-check',
    '--window-size=1280,850',
    'http://localhost:3000/weather-gpt',
  ];

  console.log('Launching Microsoft Edge...');
  const edgeProc = spawn(EDGE_PATH, edgeArgs);

  let cdp = null;

  try {
    // Wait for CDP endpoint to be available
    let targets = null;
    for (let i = 0; i < 20; i++) {
      await sleep(500);
      try {
        targets = await getJson(`http://localhost:${PORT}/json`);
        if (targets && targets.length > 0) break;
      } catch (e) {}
    }

    if (!targets || targets.length === 0) {
      throw new Error('Failed to connect to Microsoft Edge CDP endpoint');
    }

    const pageTarget = targets.find((t) => t.type === 'page') || targets[0];
    console.log(`Connecting to page target: ${pageTarget.title} (${pageTarget.webSocketDebuggerUrl})`);

    cdp = new CDPClient(pageTarget.webSocketDebuggerUrl);
    await cdp.connect();
    await cdp.send('Page.enable');
    await cdp.send('Runtime.enable');

    console.log('Waiting for WeatherGPT application to initialize...');
    await sleep(3000);

    // TEST CASE 1: "how is the chance of rain TOMORROW"
    console.log('\n--- Step 1: Submit query "how is the chance of rain TOMORROW" ---');
    const inputFound = await cdp.eval(`
      (() => {
        const input = document.querySelector('input[type="text"], textarea') || document.querySelector('.weather-gpt-input-bar input');
        if (!input) return false;
        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
        nativeInputValueSetter.call(input, 'how is the chance of rain TOMORROW');
        input.dispatchEvent(new Event('input', { bubbles: true }));
        return true;
      })()
    `);

    if (!inputFound) {
      throw new Error('Chat input element not found in DOM');
    }

    console.log('Input populated. Clicking send button...');
    await cdp.eval(`
      (() => {
        const sendBtn = document.querySelector('.weather-gpt-send-btn') || document.querySelector('button[type="submit"]') || Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Send') || b.querySelector('svg'));
        if (sendBtn) sendBtn.click();
      })()
    `);

    console.log('Waiting for response to arrive...');
    let responded = false;
    for (let i = 0; i < 30; i++) {
      await sleep(500);
      const msgCount = await cdp.eval(`document.querySelectorAll('.weather-gpt-msg-wrapper').length`);
      if (msgCount >= 3) {
        responded = true;
        break;
      }
    }

    if (!responded) {
      console.warn('Timed out waiting for message count >= 3, continuing to check DOM...');
    }

    await sleep(1500);

    // Capture screenshot of Tomorrow rain query response
    const screenshot1Path = path.join(ARTIFACT_DIR, 'weathergpt_qa_tomorrow_rain.png');
    await cdp.captureScreenshot(screenshot1Path);

    // Validate DOM content of the assistant response
    const validationResult1 = await cdp.eval(`
      (() => {
        const bubbles = Array.from(document.querySelectorAll('.weather-gpt-bubble'));
        const lastBubble = bubbles[bubbles.length - 1];
        const bubbleText = lastBubble ? lastBubble.innerText : '';
        const debugPanel = document.querySelector('[data-testid="weathergpt-debug-panel"]');
        const debugText = debugPanel ? debugPanel.innerText : '';

        return {
          bubbleText,
          debugText,
          hasDebugPanel: Boolean(debugPanel),
          mentionsTomorrow: /tomorrow/i.test(bubbleText),
          hasTodayUmbrella: /carry.*umbrella today/i.test(bubbleText),
          hasCurrentSkySub: /current condition.*is clear sky/i.test(bubbleText),
          citesRainProb: /\\d+%/i.test(bubbleText),
          debugScope: debugText.includes('TOMORROW'),
          debugIntent: debugText.includes('RAIN'),
        };
      })()
    `);

    console.log('\nValidation Result for "how is the chance of rain TOMORROW":');
    console.log('• Mentions Tomorrow:', validationResult1.mentionsTomorrow ? '✅ YES' : '❌ NO');
    console.log('• Cites Rain Probability:', validationResult1.citesRainProb ? '✅ YES' : '❌ NO');
    console.log('• Umbrella Today Absent:', !validationResult1.hasTodayUmbrella ? '✅ YES (clean)' : '❌ FOUND TODAY UMBRELLA');
    console.log('• Current Clear Sky Absent:', !validationResult1.hasCurrentSkySub ? '✅ YES (clean)' : '❌ FOUND CURRENT SKY SUBSTITUTION');
    console.log('• Debug Panel Present:', validationResult1.hasDebugPanel ? '✅ YES' : '❌ NO');
    console.log('• Debug Panel Scope TOMORROW:', validationResult1.debugScope ? '✅ YES' : '❌ NO');
    console.log('• Debug Panel Intent RAIN:', validationResult1.debugIntent ? '✅ YES' : '❌ NO');

    // TEST CASE 2: "Will it rain around 7 PM tomorrow?"
    console.log('\n--- Step 2: Submit query "Will it rain around 7 PM tomorrow?" ---');
    await cdp.eval(`
      (() => {
        const input = document.querySelector('input[type="text"], textarea') || document.querySelector('.weather-gpt-input-bar input');
        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
        nativeInputValueSetter.call(input, 'Will it rain around 7 PM tomorrow?');
        input.dispatchEvent(new Event('input', { bubbles: true }));
        const sendBtn = document.querySelector('.weather-gpt-send-btn') || document.querySelector('button[type="submit"]') || Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Send') || b.querySelector('svg'));
        if (sendBtn) sendBtn.click();
      })()
    `);

    console.log('Waiting for 7 PM hour response...');
    for (let i = 0; i < 30; i++) {
      await sleep(500);
      const msgCount = await cdp.eval(`document.querySelectorAll('.weather-gpt-msg-wrapper').length`);
      if (msgCount >= 5) break;
    }

    await sleep(1500);

    const screenshot2Path = path.join(ARTIFACT_DIR, 'weathergpt_qa_tomorrow_7pm.png');
    await cdp.captureScreenshot(screenshot2Path);

    const validationResult2 = await cdp.eval(`
      (() => {
        const bubbles = Array.from(document.querySelectorAll('.weather-gpt-bubble'));
        const lastBubble = bubbles[bubbles.length - 1];
        const bubbleText = lastBubble ? lastBubble.innerText : '';
        const debugPanels = Array.from(document.querySelectorAll('[data-testid="weathergpt-debug-panel"]'));
        const lastDebug = debugPanels[debugPanels.length - 1];
        const debugText = lastDebug ? lastDebug.innerText : '';

        return {
          bubbleText,
          debugText,
          mentions7PM: /7\\s*PM/i.test(bubbleText) || /19:00/i.test(bubbleText),
          mentionsTomorrow: /tomorrow/i.test(bubbleText),
          debugScope: debugText.includes('TOMORROW'),
          debugHour: debugText.includes('19:00'),
        };
      })()
    `);

    console.log('\nValidation Result for "Will it rain around 7 PM tomorrow?":');
    console.log('• Mentions 7 PM:', validationResult2.mentions7PM ? '✅ YES' : '❌ NO');
    console.log('• Mentions Tomorrow:', validationResult2.mentionsTomorrow ? '✅ YES' : '❌ NO');
    console.log('• Debug Panel Scope TOMORROW:', validationResult2.debugScope ? '✅ YES' : '❌ NO');
    console.log('• Debug Panel Hour 19:00:', validationResult2.debugHour ? '✅ YES' : '❌ NO');

    console.log('\n====================================================');
    console.log('BROWSER QA COMPLETED SUCCESSFULLY');
    console.log('====================================================');
  } catch (err) {
    console.error('Browser QA Execution Error:', err);
  } finally {
    if (cdp) cdp.close();
    edgeProc.kill();
  }
}

runBrowserQA();
