/**
 * Automated 10-Case Verification Suite for WeatherGPT Time-Binding & Grounding
 */
const { processWeatherGPTChat } = require('./services/weatherGPTService');

const TEST_CASES = [
  {
    id: 1,
    query: "What's the weather right now?",
    expectedScope: 'CURRENT',
    description: 'Current weather inquiry should bind to CURRENT scope',
    validate: (res) => {
      const scope = res.metaDebug?.timeScope;
      const pass = scope === 'CURRENT';
      return { pass, reason: `timeScope=${scope}` };
    },
  },
  {
    id: 2,
    query: "Will it rain today?",
    expectedScope: 'TODAY',
    description: 'Today rain inquiry should bind to TODAY scope',
    validate: (res) => {
      const scope = res.metaDebug?.timeScope;
      const pass = scope === 'TODAY' && res.primaryIntent === 'RAIN';
      return { pass, reason: `timeScope=${scope}, intent=${res.primaryIntent}` };
    },
  },
  {
    id: 3,
    query: "Will it rain tomorrow?",
    expectedScope: 'TOMORROW',
    description: 'Tomorrow rain inquiry should bind to TOMORROW scope and not cite current weather',
    validate: (res) => {
      const scope = res.metaDebug?.timeScope;
      const reply = res.reply || '';
      const hasToday = /\bumbrella today\b/i.test(reply);
      const pass = scope === 'TOMORROW' && !hasToday && /tomorrow/i.test(reply);
      return { pass, reason: `timeScope=${scope}, hasToday=${hasToday}, mentionsTomorrow=${/tomorrow/i.test(reply)}` };
    },
  },
  {
    id: 4,
    query: "How is the chance of rain tomorrow?",
    expectedScope: 'TOMORROW',
    description: 'The exact user repro: must cite tomorrow rain % and never say carry umbrella today',
    validate: (res) => {
      const scope = res.metaDebug?.timeScope;
      const reply = res.reply || '';
      const citesProb = /\d+%\s*chance of rain/i.test(reply) || /\d+%/i.test(reply);
      const hasTodayUmbrella = /carry.*umbrella today/i.test(reply);
      const currentSkySub = /current condition.*is clear sky/i.test(reply);
      const pass = scope === 'TOMORROW' && citesProb && !hasTodayUmbrella && !currentSkySub;
      return {
        pass,
        reason: `timeScope=${scope}, citesProb=${citesProb}, hasTodayUmbrella=${hasTodayUmbrella}, currentSkySub=${currentSkySub}`
      };
    },
  },
  {
    id: 5,
    query: "What about tomorrow evening?",
    expectedScope: 'TOMORROW',
    description: 'Window inquiry: tomorrow evening must bind to TOMORROW scope with window/hour',
    validate: (res) => {
      const scope = res.metaDebug?.timeScope;
      const windowOrHour = res.metaDebug?.targetWindow || res.metaDebug?.targetHour;
      const pass = scope === 'TOMORROW' && (windowOrHour === 'evening' || typeof windowOrHour === 'number' || res.metaDebug?.targetForecast != null);
      return { pass, reason: `timeScope=${scope}, windowOrHour=${windowOrHour}` };
    },
  },
  {
    id: 6,
    query: "Will it rain around 7 PM tomorrow?",
    expectedScope: 'TOMORROW',
    description: 'Specific hour: 7 PM tomorrow must bind to hour 19 and TOMORROW scope',
    validate: (res) => {
      const scope = res.metaDebug?.timeScope;
      const hour = res.metaDebug?.targetHour;
      const hasHourData = Boolean(res.metaDebug?.targetForecast?.targetHourData);
      const pass = scope === 'TOMORROW' && hour === 19;
      return { pass, reason: `timeScope=${scope}, hour=${hour}, hasHourData=${hasHourData}` };
    },
  },
  {
    id: 7,
    query: "Is tomorrow wetter than today?",
    expectedScope: 'COMPARISON',
    description: 'Comparison inquiry: must bind to COMPARISON and compare today vs tomorrow',
    validate: (res) => {
      const scope = res.metaDebug?.timeScope;
      const reply = res.reply || '';
      const comparesBoth = /today/i.test(reply) && /tomorrow/i.test(reply);
      const pass = scope === 'COMPARISON' && comparesBoth;
      return { pass, reason: `timeScope=${scope}, comparesBoth=${comparesBoth}` };
    },
  },
  {
    id: 8,
    query: "What about my commute tomorrow?",
    expectedScope: 'TOMORROW',
    description: 'Travel intent bound to TOMORROW',
    validate: (res) => {
      const scope = res.metaDebug?.timeScope;
      const intent = res.primaryIntent;
      const pass = scope === 'TOMORROW' && (intent === 'TRAVEL' || intent === 'SCHOOL_COLLEGE');
      return { pass, reason: `timeScope=${scope}, intent=${intent}` };
    },
  },
  {
    id: 9,
    query: "Tell me more.",
    expectedScope: 'TOMORROW',
    description: 'Follow-up query: must inherit previous session TOMORROW scope from test 8',
    validate: (res) => {
      const scope = res.metaDebug?.timeScope;
      const pass = scope === 'TOMORROW';
      return { pass, reason: `inherited scope=${scope}` };
    },
  },
  {
    id: 10,
    query: "What about today?",
    expectedScope: 'TODAY',
    description: 'Explicit reset to TODAY scope',
    validate: (res) => {
      const scope = res.metaDebug?.timeScope;
      const pass = scope === 'TODAY';
      return { pass, reason: `reset scope=${scope}` };
    },
  },
];

async function runSuite() {
  console.log('====================================================');
  console.log('RUNNING WEATHERGPT 2.0 10-CASE TIME-BINDING SUITE');
  console.log('====================================================\n');

  const conversationId = `test_conv_${Date.now()}`;
  let passedCount = 0;

  for (const tc of TEST_CASES) {
    try {
      // Use conversational memory for sequential testing (especially tests 8 -> 9 -> 10)
      const res = await processWeatherGPTChat({
        message: tc.query,
        latitude: 28.6139,
        longitude: 77.2090,
        locationName: 'Delhi',
        language: 'en',
        conversationId,
      });

      const { pass, reason } = tc.validate(res);

      if (pass) {
        passedCount++;
        console.log(`✅ [CASE ${tc.id}] PASS: "${tc.query}"`);
        console.log(`   Scope: ${res.metaDebug?.timeScope} | Details: ${reason}`);
        console.log(`   Preview: ${res.reply.slice(0, 110).replace(/\n/g, ' ')}...\n`);
      } else {
        console.error(`❌ [CASE ${tc.id}] FAIL: "${tc.query}"`);
        console.error(`   Scope: ${res.metaDebug?.timeScope} | Details: ${reason}`);
        console.error(`   Full Reply: ${res.reply}\n`);
      }
    } catch (err) {
      console.error(`💥 [CASE ${tc.id}] ERROR: "${tc.query}"`, err.message);
    }
  }

  console.log('====================================================');
  console.log(`TEST SUITE RESULTS: ${passedCount} / ${TEST_CASES.length} PASSED`);
  console.log('====================================================');

  if (passedCount === TEST_CASES.length) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runSuite();
