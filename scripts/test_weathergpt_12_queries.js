const http = require('http');

const conversationId = `test_conv_${Date.now()}`;
const location = 'New Delhi, India';
const latitude = 28.6139;
const longitude = 77.2090;

function queryWeatherGPT(message, convId = conversationId, lang = 'en') {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      message,
      conversationId: convId,
      location,
      latitude,
      longitude,
      language: lang,
      userMode: 'HOME',
    });

    const options = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/weather-gpt/chat',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
      },
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

const testQuestions = [
  "What's the weather right now?",
  "Will it rain today?",
  "Will it rain tomorrow?",
  "How is the chance of rain tomorrow?",
  "What about tomorrow evening?",
  "Will it rain around 7 PM tomorrow?",
  "Is tomorrow wetter than today?",
  "What about my commute tomorrow?",
  "Tell me more.",
  "What about today?",
  "How strong will the wind be tomorrow?",
  "Is it safe to go outside tomorrow evening?",
];

async function runTests() {
  console.log(`\n======================================================`);
  console.log(`TESTING 12 WEATHERGPT QUERIES WITH CONVERSATIONAL MEMORY`);
  console.log(`Conversation ID: ${conversationId}`);
  console.log(`======================================================\n`);

  for (let i = 0; i < testQuestions.length; i++) {
    const q = testQuestions[i];
    console.log(`------------------------------------------------------`);
    console.log(`QUERY #${i + 1}: "${q}"`);
    try {
      const res = await queryWeatherGPT(q);
      if (!res.success || !res.data) {
        console.error(`❌ FAILED: ${res.message || 'No data returned'}`);
        continue;
      }

      const d = res.data;
      const debug = d.metaDebug || {};

      console.log(`✓ Intent: ${d.primaryIntent || debug.intent || 'N/A'}`);
      console.log(`✓ Time Scope: ${debug.timeScope || 'N/A'}`);
      console.log(`✓ Target Date: ${debug.targetDate || 'N/A'}`);
      if (debug.targetHour != null) console.log(`✓ Target Hour: ${debug.targetHour}:00`);
      if (debug.targetWindow) console.log(`✓ Target Window: ${debug.targetWindow}`);
      console.log(`✓ Data Trust: ${d.dataTrust || 'N/A'}`);
      console.log(`\nREPLY PREVIEW:`);
      console.log(d.reply.split('\n').slice(0, 8).join('\n'));
      if (d.reply.split('\n').length > 8) console.log('... [remaining text truncated for summary]');
      console.log(`\n`);
    } catch (err) {
      console.error(`❌ EXCEPTION on query "${q}":`, err.message);
    }
  }

  // Also test language switch (English -> Hindi)
  console.log(`======================================================`);
  console.log(`TESTING MULTILINGUAL HINDI SUPPORT`);
  console.log(`======================================================\n`);

  try {
    const hindiRes = await queryWeatherGPT("कल मौसम कैसा रहेगा?", `hindi_conv_${Date.now()}`, 'hi');
    console.log(`HINDI QUERY: "कल मौसम कैसा रहेगा?"`);
    console.log(`HINDI REPLY PREVIEW:`);
    console.log(hindiRes.data?.reply?.slice(0, 200) || 'No reply');
    console.log(`\n`);
  } catch (e) {
    console.error(`❌ HINDI TEST EXCEPTION:`, e.message);
  }
}

runTests();
