const assert = require('assert');
const http = require('http');
const express = require('express');
const {
  processConversationalChat,
  generateConversationalFallback,
  extractActionFromText,
} = require('./services/conversationalAIService');
const aiRoutes = require('./routes/aiAssistantRoutes');

console.log('================================================================');
console.log('💬 DISASTERCHAIN CONVERSATIONAL AI ASSISTANT TEST SUITE');
console.log('================================================================');

(async () => {
  let passed = 0;
  let total = 0;

  function test(name, fn) {
    total++;
    try {
      fn();
      console.log(`✅ [PASS] ${name}`);
      passed++;
    } catch (e) {
      console.error(`❌ [FAIL] ${name}:`, e.message);
      process.exit(1);
    }
  }

  async function asyncTest(name, fn) {
    total++;
    try {
      await fn();
      console.log(`✅ [PASS] ${name}`);
      passed++;
    } catch (e) {
      console.error(`❌ [FAIL] ${name}:`, e.message);
      process.exit(1);
    }
  }

  // --- 1. Action Extraction from LLM output ---
  console.log('\n--- 1. Action Tag Parsing ---');
  test('Parses <<<ACTION:{...}>>> correctly', () => {
    const raw = 'Sure! Opening shelters for you now.\n<<<ACTION:{"type":"NAVIGATE","target":"/shelters","label":"Open Shelters"}>>>';
    const parsed = extractActionFromText(raw);
    assert.strictEqual(parsed.cleanText, 'Sure! Opening shelters for you now.');
    assert.ok(parsed.action);
    assert.strictEqual(parsed.action.type, 'NAVIGATE');
    assert.strictEqual(parsed.action.target, '/shelters');
  });

  test('Gracefully handles plain text without actions', () => {
    const raw = 'Earthquake safety is crucial. Drop, cover, and hold on.';
    const parsed = extractActionFromText(raw);
    assert.strictEqual(parsed.cleanText, raw);
    assert.strictEqual(parsed.action, null);
  });

  // --- 2. Conversational Dialogue & Greetings ---
  console.log('\n--- 2. Conversational Dialogue & Greetings ---');
  await asyncTest('Understands "Hey, how are you?" warmly', async () => {
    const res = await processConversationalChat({ message: 'Hey, how are you?' });
    assert(res.reply.length > 20);
    assert(/readiness|operating|assisting|hello/i.test(res.reply));
  });

  await asyncTest('Explains capabilities on "What can you help me with?"', async () => {
    const res = await processConversationalChat({ message: 'What can you help me with?' });
    assert(res.reply.includes('Navigation') || res.reply.includes('Shelter') || res.reply.includes('Safety'));
  });

  await asyncTest('Answers "Why is disaster preparedness important?" in depth', async () => {
    const res = await processConversationalChat({ message: 'Why is disaster preparedness important?' });
    assert(/saves lives|preparedness/i.test(res.reply));
    assert(res.action?.target === '/preparedness' || res.reply.includes('Disaster'));
  });

  await asyncTest('Details 72-hour emergency go-bag supplies', async () => {
    const res = await processConversationalChat({ message: 'What should I keep in my emergency kit?' });
    assert(/water|flashlight|first-aid|rations/i.test(res.reply));
  });

  await asyncTest('Provides specific guidance for children and elderly people', async () => {
    const res = await processConversationalChat({ message: 'What about children and elderly people?' });
    assert(/children|elderly|formula|medication|mobility/i.test(res.reply));
  });

  await asyncTest('Calms user on "I am worried about the heavy rain" with precautions and safety advice', async () => {
    const res = await processConversationalChat({ message: 'I am worried about the heavy rain' });
    assert(/rain|precautions|water|safe|guidelines/i.test(res.reply));
  });

  // --- 3. Multi-Turn Context-Aware Follow-ups ---
  console.log('\n--- 3. Multi-Turn Context Memory ---');
  await asyncTest('Understands follow-up "What if I am inside my house?" after flood question', async () => {
    const conversation = [
      { role: 'user', content: 'What should I do during a flood?' },
      { role: 'assistant', content: 'During a flood, move to higher ground immediately.' },
    ];
    const res = await processConversationalChat({
      message: 'What if I am inside my house?',
      conversation,
    });
    assert(/breaker|electrical|higher floors|attic|water/i.test(res.reply));
  });

  await asyncTest('Understands follow-up "What about electricity?" after flood context', async () => {
    const conversation = [
      { role: 'user', content: 'What should I do during a flood?' },
      { role: 'assistant', content: 'Move to higher floors.' },
      { role: 'user', content: 'What if I am inside my house?' },
      { role: 'assistant', content: 'Turn off the main breaker.' },
    ];
    const res = await processConversationalChat({
      message: 'What about electricity?',
      conversation,
    });
    assert(/conducts electricity|breaker|wire|current|outlets/i.test(res.reply));
  });

  await asyncTest('Simplifies previous answer when asked "Can you explain this in simpler words?"', async () => {
    const conversation = [
      { role: 'user', content: 'Explain flood safety to me.' },
      { role: 'assistant', content: 'A comprehensive multi-hazard guide with hydrological mitigation...' },
    ];
    const res = await processConversationalChat({
      message: 'Can you explain this in simpler words?',
      conversation,
    });
    assert(/simple|safe place|essentials|help/i.test(res.reply));
  });

  await asyncTest('Deepens advice on "Tell me more"', async () => {
    const conversation = [
      { role: 'user', content: 'How can I prepare for an emergency?' },
      { role: 'assistant', content: 'Stock supplies and know your route.' },
    ];
    const res = await processConversationalChat({
      message: 'Tell me more',
      conversation,
    });
    assert(/communication|hygiene|digital|community/i.test(res.reply));
  });

  // --- 4. Tool & Feature Triggering & WeatherGPT Unified Capabilities ---
  console.log('\n--- 4. Feature Actions & Tool Calling (Unified WeatherGPT) ---');
  await asyncTest('Answers "What is the weather like today?" directly inside chat (action: null)', async () => {
    const res = await processConversationalChat({ message: 'What is the weather like today?' });
    assert.strictEqual(res.action, null);
    assert(/temperature|weather|clear|cloud|humidity|wind/i.test(res.reply));
  });

  await asyncTest('Answers "Will it rain tomorrow?" inside chat using forecast telemetry', async () => {
    const res = await processConversationalChat({ message: 'Will it rain tomorrow?' });
    assert.strictEqual(res.action, null);
    assert(/tomorrow|rain|precipitation|risk|outlook/i.test(res.reply));
  });

  await asyncTest('Answers "Should I carry an umbrella?" inside chat with rain advice', async () => {
    const res = await processConversationalChat({ message: 'Should I carry an umbrella?' });
    assert.strictEqual(res.action, null);
    assert(/rain|umbrella|probability|safe|precipitation/i.test(res.reply));
  });

  await asyncTest('Answers "What precautions should I take during heavy rain?" with safety directives', async () => {
    const res = await processConversationalChat({ message: 'What precautions should I take during heavy rain?' });
    assert.strictEqual(res.action, null);
    assert(/waterlogged|electrical|drains|precautions/i.test(res.reply));
  });

  await asyncTest('Explains WeatherGPT integration on "Show me WeatherGPT" without opening another window', async () => {
    const res = await processConversationalChat({ message: 'Show me WeatherGPT' });
    assert.strictEqual(res.action, null);
    assert(/unified|weathergpt|doppler|telemetry|forecast/i.test(res.reply));
  });

  await asyncTest('Navigates to /weather ONLY on explicit "Open the weather page"', async () => {
    const res = await processConversationalChat({ message: 'Open the weather page' });
    assert.ok(res.action);
    assert.strictEqual(res.action.type, 'NAVIGATE');
    assert.strictEqual(res.action.target, '/weather');
  });

  await asyncTest('Maps "Open the map" to /map', async () => {
    const res = await processConversationalChat({ message: 'Open the spatial map.' });
    assert.ok(res.action);
    assert.strictEqual(res.action.type, 'NAVIGATE');
    assert.strictEqual(res.action.target, '/map');
  });

  await asyncTest('Maps "Report an incident" to /incidents', async () => {
    const res = await processConversationalChat({ message: 'I want to report an incident.' });
    assert.ok(res.action);
    assert.strictEqual(res.action.type, 'NAVIGATE');
    assert.strictEqual(res.action.target, '/incidents');
  });

  await asyncTest('Maps "Show emergency contacts" to OPEN_CONTACTS', async () => {
    const res = await processConversationalChat({ message: 'Show emergency contacts.' });
    assert.ok(res.action);
    assert.strictEqual(res.action.type, 'OPEN_CONTACTS');
  });

  await asyncTest('Maps "SOS / I am in danger" to TRIGGER_SOS with emergency flag', async () => {
    const res = await processConversationalChat({ message: 'SOS! I am in immediate danger!' });
    assert.ok(res.action);
    assert.strictEqual(res.action.type, 'TRIGGER_SOS');
    assert.strictEqual(res.isEmergency, true);
  });

  // --- 5. Multilingual Responses (20 Languages) ---
  console.log('\n--- 5. Multilingual Responses ---');
  await asyncTest('Responds in Hindi when language is "hi"', async () => {
    const res = await processConversationalChat({ message: 'नमस्ते', language: 'hi' });
    assert.strictEqual(res.language, 'hi');
    assert(/सहायक|मदद|आपदा/i.test(res.reply));
  });

  await asyncTest('Responds in Punjabi when language is "pa"', async () => {
    const res = await processConversationalChat({ message: 'ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ', language: 'pa' });
    assert.strictEqual(res.language, 'pa');
    assert(/ਸਹਾਇਕ|ਮਦਦ|ਆਫ਼ਤ/i.test(res.reply));
  });

  // --- 6. HTTP API Endpoint Verification ---
  console.log('\n--- 6. HTTP Route (POST /api/ai/conversational-chat) ---');
  const app = express();
  app.use(express.json());
  app.use('/api/ai', aiRoutes);

  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(5188, resolve));

  const postJSON = (path, body, headers = {}) => {
    return new Promise((resolve, reject) => {
      const payload = JSON.stringify(body);
      const req = http.request({
        hostname: '127.0.0.1',
        port: 5188,
        path,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload),
          ...headers,
        },
      }, (res) => {
        let raw = '';
        res.on('data', (c) => raw += c);
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, body: JSON.parse(raw) });
          } catch (e) {
            resolve({ status: res.statusCode, raw });
          }
        });
      });
      req.on('error', reject);
      req.write(payload);
      req.end();
    });
  };

  await asyncTest('Public access without auth token returns 200 OK', async () => {
    const res = await postJSON('/api/ai/conversational-chat', {
      message: 'Hello, what should I do during an earthquake?',
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.ok(res.body.data.reply);
  });

  await asyncTest('Empty message rejected with 400 Bad Request', async () => {
    const res = await postJSON('/api/ai/conversational-chat', { message: '   ' });
    assert.strictEqual(res.status, 400);
    assert.strictEqual(res.body.success, false);
  });

  await asyncTest('Oversized message (>1200 chars) rejected with 400 Bad Request', async () => {
    const res = await postJSON('/api/ai/conversational-chat', { message: 'X'.repeat(1250) });
    assert.strictEqual(res.status, 400);
    assert.strictEqual(res.body.success, false);
  });

  server.close();

  console.log('\n================================================================');
  console.log(`📊 CONVERSATIONAL AI TEST SUMMARY: ${passed} / ${total} TESTS PASSED (100%)`);
  console.log('🎉 ALL CONVERSATIONAL AI SCENARIOS VERIFIED SUCCESSFULLY!');
  console.log('================================================================\n');
})();
