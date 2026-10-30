const puppeteer = require('puppeteer-core');
const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const path = require('path');
const express = require('../backend/node_modules/express');
const http = require('http');

const ARTIFACT_DIR = 'C:\\Users\\shikh\\.gemini\\antigravity-ide\\brain\\04542bf0-b323-41ac-a81d-2056569b8398';

(async () => {
  console.log('Starting backend mock / real bridge on port 5199...');
  const backendApp = express();
  backendApp.use(express.json());

  // Mount backend routes
  const aiRoutes = require('../backend/routes/aiAssistantRoutes');
  backendApp.use('/api/ai', aiRoutes);

  // Serve frontend build
  backendApp.use(express.static(path.join(__dirname, '../frontend/build')));
  backendApp.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
  });

  const server = http.createServer(backendApp);
  await new Promise((resolve) => server.listen(5199, resolve));
  console.log('Server listening on http://localhost:5199');

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
      localStorage.clear();
      localStorage.setItem('disasterchain_tour_completed', 'true');
    });

    await page.setRequestInterception(true);
    page.on('request', async (interceptedRequest) => {
      const url = interceptedRequest.url();
      if (url.includes('/api/ai/conversational-chat')) {
        if (interceptedRequest.method() === 'OPTIONS') {
          interceptedRequest.respond({
            status: 200,
            headers: {
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
              'Access-Control-Allow-Headers': '*',
            },
            body: '',
          });
          return;
        }

        try {
          const postData = JSON.parse(interceptedRequest.postData() || '{}');
          const { processConversationalChat } = require('../backend/services/conversationalAIService');
          const result = await processConversationalChat({
            message: postData.message,
            conversation: postData.conversation,
            latitude: postData.latitude,
            longitude: postData.longitude,
            location: postData.location,
            language: postData.language,
          });
          interceptedRequest.respond({
            status: 200,
            headers: {
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Headers': '*',
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ success: true, data: result }),
          });
        } catch (e) {
          console.error('[INTERCEPTION ERROR]', e);
          interceptedRequest.respond({
            status: 500,
            headers: {
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Headers': '*',
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ success: false, error: e.message }),
          });
        }
      } else {
        interceptedRequest.continue();
      }
    });

    console.log('Navigating to http://localhost:5199/?skip_intro=1');
    await page.goto('http://localhost:5199/?skip_intro=1', { waitUntil: 'networkidle2', timeout: 30000 });
    await sleep(2000);

    // Open unified AI assistant panel
    const assistantBtn = await page.$('#dc-global-voice-assistant-btn');
    if (!assistantBtn) {
      throw new Error('#dc-global-voice-assistant-btn not found!');
    }
    await assistantBtn.click();
    await sleep(1500);

    const inputSelector = '#dc-voice-chat-input';
    await page.waitForSelector(inputSelector, { timeout: 10000 });

    async function sendChat(text) {
      console.log(`\n💬 User says: "${text}"`);
      await page.focus(inputSelector);
      await page.evaluate((sel) => {
        const input = document.querySelector(sel);
        if (input) input.value = '';
      }, inputSelector);
      await page.type(inputSelector, text, { delay: 10 });
      await page.click('#dc-voice-send-btn');

      // Wait for assistant reply to be added
      await sleep(2500);
      const messages = await page.evaluate(() => {
        const msgs = Array.from(document.querySelectorAll('.dc-voice-msg-content, .dc-voice-chat-messages p'));
        return msgs.map((m) => m.innerText.trim()).filter((t) => t.length > 0);
      });
      const lastMsg = messages[messages.length - 1];
      console.log(`🤖 Assistant replies: "${lastMsg.slice(0, 150)}..."`);
      return lastMsg;
    }

    console.log('\n============================================================');
    console.log('TESTING CONVERSATION B: Weather -> Jacket -> Evening -> Umbrella');
    console.log('============================================================');

    const replyB1 = await sendChat("What's the weather tomorrow?");
    if (!/tomorrow|forecast|high|low|clear|rain/i.test(replyB1)) {
      throw new Error(`Unexpected B1 response: ${replyB1}`);
    }

    const replyB2 = await sendChat('Will I need a jacket?');
    if (!/jacket|layer/i.test(replyB2)) {
      throw new Error(`Unexpected B2 response: ${replyB2}`);
    }
    console.log('✓ Jacket answered directly based on forecast!');

    const replyB3 = await sendChat('What about in the evening?');
    if (!/evening|cool|temperatures|layer|sunset/i.test(replyB3)) {
      throw new Error(`Unexpected B3 response: ${replyB3}`);
    }
    console.log('✓ Evening temperature & conditions answered directly!');

    const replyB4 = await sendChat('Should I carry an umbrella?');
    if (!/umbrella/i.test(replyB4)) {
      throw new Error(`Unexpected B4 response: ${replyB4}`);
    }
    console.log('✓ Umbrella answered directly based on rain risk!');

    // Capture visual screenshot of full conversation
    const screenshotPath = path.join(ARTIFACT_DIR, 'e2e_multiturn_conversational_ai_verified.png');
    await page.screenshot({ path: screenshotPath, fullPage: false });
    console.log(`📸 Screenshot captured at: ${screenshotPath}`);

    console.log('\n============================================================');
    console.log('TESTING CONVERSATION A: Shelters -> "Will it be?" -> Night Arrival');
    console.log('============================================================');

    // Click new conversation (+) button
    const plusBtn = await page.$('button[title="Start New Chat"]');
    if (plusBtn) {
      await plusBtn.click();
      await sleep(1000);
    }

    const replyA1 = await sendChat('Will the shelters be open tomorrow?');
    if (!/open|shelters|24\/7/i.test(replyA1)) {
      throw new Error(`Unexpected A1 response: ${replyA1}`);
    }

    const replyA2 = await sendChat('Will it be?');
    if (!/open|24\/7|safe accommodation|around the clock/i.test(replyA2)) {
      throw new Error(`Unexpected A2 response: ${replyA2}`);
    }
    console.log('✓ "Will it be?" correctly resolved to shelter open status!');

    const replyA3 = await sendChat('What if I arrive at night?');
    if (!/arrive at any hour|at night|reception|intake|bedding/i.test(replyA3)) {
      throw new Error(`Unexpected A3 response: ${replyA3}`);
    }
    console.log('✓ Night arrival at shelters answered directly!');

    console.log('\n============================================================');
    console.log('TESTING CONVERSATION C: Heavy Rain Worry -> Action -> Indoor -> Electricity');
    console.log('============================================================');

    if (plusBtn) {
      await plusBtn.click();
      await sleep(1000);
    }

    const replyC1 = await sendChat('I am worried about heavy rain.');
    if (!/normal to feel concerned|heavy rain|precautions|drains/i.test(replyC1)) {
      throw new Error(`Unexpected C1 response: ${replyC1}`);
    }

    const replyC2 = await sendChat('What should I do?');
    if (!/drains|charge|avoid travel|waterproof/i.test(replyC2)) {
      throw new Error(`Unexpected C2 response: ${replyC2}`);
    }
    console.log('✓ Heavy rain action checklist provided!');

    const replyC3 = await sendChat('What if I am inside my house?');
    if (!/breaker|electrical|higher floors|attic|water/i.test(replyC3)) {
      throw new Error(`Unexpected C3 response: ${replyC3}`);
    }
    console.log('✓ Indoor flood safety protocol provided!');

    const replyC4 = await sendChat('What about electricity?');
    if (!/conducts electricity|breaker|wire|power lines|unplug/i.test(replyC4)) {
      throw new Error(`Unexpected C4 response: ${replyC4}`);
    }
    console.log('✓ Electrical storm safety protocol provided!');

    console.log('\n🎉 ALL MULTI-TURN CONVERSATIONS AND FOLLOW-UPS VERIFIED IN BROWSER!');
  } finally {
    await browser.close();
    server.close();
  }
})();
