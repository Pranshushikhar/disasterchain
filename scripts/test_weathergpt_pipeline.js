/**
 * DisasterChain WeatherGPT Pipeline Automated Test Suite
 * Validates deterministic temporal routing, conversational context inheritance,
 * intent recognition, and hourly timeline generation.
 */

const { processWeatherGPTChat } = require('../backend/services/weatherGPTService');
const { routeIntent } = require('../backend/services/weatherGPT/intentRouter');

async function runTestSuite() {
  console.log('====================================================');
  console.log(' WEATHERGPT PIPELINE VALIDATION TEST SUITE');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✓ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ✗ FAIL: ${message}`);
      failed++;
    }
  }

  // 1. "What is the weather right now?" -> CURRENT
  console.log('[Test 1] "What is the weather right now?"');
  {
    const intent = routeIntent('What is the weather right now?', {});
    assert(intent.timeScope === 'CURRENT', `timeScope should be CURRENT (got: ${intent.timeScope})`);
    assert(intent.primaryIntent === 'CURRENT_WEATHER' || intent.primaryIntent === 'WEATHER_CURRENT', `primaryIntent should be current weather (got: ${intent.primaryIntent})`);
  }

  // 2. "Will it rain today?" -> TODAY
  console.log('\n[Test 2] "Will it rain today?"');
  {
    const intent = routeIntent('Will it rain today?', {});
    assert(intent.timeScope === 'TODAY', `timeScope should be TODAY (got: ${intent.timeScope})`);
    assert(intent.primaryIntent === 'RAIN' || intent.primaryIntent === 'PRECIPITATION', `primaryIntent should be RAIN (got: ${intent.primaryIntent})`);
  }

  // 3. "Will it rain tomorrow?" -> TOMORROW
  console.log('\n[Test 3] "Will it rain tomorrow?"');
  {
    const intent = routeIntent('Will it rain tomorrow?', {});
    assert(intent.timeScope === 'TOMORROW', `timeScope should be TOMORROW (got: ${intent.timeScope})`);
    assert(intent.primaryIntent === 'RAIN' || intent.primaryIntent === 'PRECIPITATION', `primaryIntent should be RAIN (got: ${intent.primaryIntent})`);
  }

  // 4. "Will it rain tomorrow evening?" -> TOMORROW + EVENING
  console.log('\n[Test 4] "Will it rain tomorrow evening?"');
  {
    const intent = routeIntent('Will it rain tomorrow evening?', {});
    assert(intent.timeScope === 'TOMORROW', `timeScope should be TOMORROW (got: ${intent.timeScope})`);
    assert(intent.targetWindow === 'EVENING', `targetWindow should be EVENING (got: ${intent.targetWindow})`);
    assert(intent.targetHour === 19 || intent.targetHour === 20, `targetHour should be 19 or 20 (got: ${intent.targetHour})`);
  }

  // 5. "Will it rain tomorrow at 8 PM?" -> TOMORROW + 20:00
  console.log('\n[Test 5] "Will it rain tomorrow at 8 PM?"');
  let convContext = {};
  {
    const intent = routeIntent('Will it rain tomorrow at 8 PM?', {});
    assert(intent.timeScope === 'TOMORROW', `timeScope should be TOMORROW (got: ${intent.timeScope})`);
    assert(intent.targetHour === 20, `targetHour should be 20 (got: ${intent.targetHour})`);
    assert(intent.primaryIntent === 'RAIN' || intent.primaryIntent === 'PRECIPITATION', `primaryIntent should be RAIN (got: ${intent.primaryIntent})`);
    convContext = {
      lastIntent: intent.primaryIntent,
      lastTimeScope: intent.timeScope,
      lastTargetDate: 'tomorrow',
      lastTargetHour: 20,
    };
  }

  // 6. "How about 9 PM?" -> inherit TOMORROW + 21:00
  console.log('\n[Test 6] "How about 9 PM?" (Context Inheritance)');
  {
    const intent = routeIntent('How about 9 PM?', convContext);
    assert(intent.timeScope === 'TOMORROW', `timeScope should inherit TOMORROW (got: ${intent.timeScope})`);
    assert(intent.targetHour === 21, `targetHour should be 21 (got: ${intent.targetHour})`);
    convContext.lastTargetHour = 21;
  }

  // 7. "Is tomorrow wetter than today?" -> COMPARISON
  console.log('\n[Test 7] "Is tomorrow wetter than today?"');
  {
    const intent = routeIntent('Is tomorrow wetter than today?', convContext);
    assert(intent.primaryIntent === 'WEATHER_COMPARISON' || intent.primaryIntent === 'COMPARISON', `primaryIntent should be COMPARISON (got: ${intent.primaryIntent})`);
    assert(intent.timeScope === 'COMPARISON', `timeScope should be COMPARISON (got: ${intent.timeScope})`);
  }

  // 8. "What about my commute tomorrow?" -> TOMORROW + COMMUTE
  console.log('\n[Test 8] "What about my commute tomorrow?"');
  {
    const intent = routeIntent('What about my commute tomorrow?', {});
    assert(intent.timeScope === 'TOMORROW', `timeScope should be TOMORROW (got: ${intent.timeScope})`);
    assert(intent.primaryIntent === 'COMMUTE' || intent.primaryIntent === 'TRAVEL', `primaryIntent should be COMMUTE or TRAVEL (got: ${intent.primaryIntent})`);
  }

  // 9. "What is the AQI?" -> CURRENT + AQI
  console.log('\n[Test 9] "What is the AQI?"');
  {
    const intent = routeIntent('What is the AQI?', {});
    assert(intent.timeScope === 'CURRENT', `timeScope should be CURRENT (got: ${intent.timeScope})`);
    assert(intent.primaryIntent === 'AIR_QUALITY' || intent.primaryIntent === 'AQI', `primaryIntent should be AQI (got: ${intent.primaryIntent})`);
  }

  // 10. "How strong will the wind be tomorrow?" -> TOMORROW + WIND
  console.log('\n[Test 10] "How strong will the wind be tomorrow?"');
  {
    const intent = routeIntent('How strong will the wind be tomorrow?', {});
    assert(intent.timeScope === 'TOMORROW', `timeScope should be TOMORROW (got: ${intent.timeScope})`);
    assert(intent.primaryIntent === 'WIND' || intent.primaryIntent === 'GUSTS', `primaryIntent should be WIND (got: ${intent.primaryIntent})`);
  }

  // 11. "Should I carry an umbrella tomorrow?" -> TOMORROW + RAIN
  console.log('\n[Test 11] "Should I carry an umbrella tomorrow?"');
  {
    const intent = routeIntent('Should I carry an umbrella tomorrow?', {});
    assert(intent.timeScope === 'TOMORROW', `timeScope should be TOMORROW (got: ${intent.timeScope})`);
    assert(intent.primaryIntent === 'RAIN' || intent.primaryIntent === 'PRECIPITATION', `primaryIntent should be RAIN (got: ${intent.primaryIntent})`);
  }

  // 12. "Tell me more." -> inherit previous context
  console.log('\n[Test 12] "Tell me more." (Inherit Context)');
  {
    const intent = routeIntent('Tell me more.', {
      lastIntent: 'RAIN',
      lastTimeScope: 'TOMORROW',
      lastTargetHour: 20,
    });
    assert(intent.timeScope === 'TOMORROW', `timeScope should inherit TOMORROW (got: ${intent.timeScope})`);
    assert(intent.primaryIntent === 'RAIN', `primaryIntent should inherit RAIN (got: ${intent.primaryIntent})`);
  }

  // 13. End-to-End Execution for "Will there be rain tomorrow at 8 PM?"
  console.log('\n[Test 13] End-to-End Live Open-Meteo Execution: "Will there be rain tomorrow at 8 PM?"');
  try {
    const res = await processWeatherGPTChat({
      message: 'Will there be rain tomorrow at 8 PM?',
      latitude: 30.7716,
      longitude: 76.5693,
      location: 'Mohali, Punjab',
      language: 'en',
    });

    assert(res && res.intentCard, 'Response must contain structured intentCard');
    assert(res.intentCard?.timeScope === 'TOMORROW', `intentCard.timeScope must be TOMORROW (got: ${res.intentCard?.timeScope})`);
    assert(res.intentCard?.badge?.includes('TOMORROW · 20:00'), `Badge must show TOMORROW · 20:00 (got: ${res.intentCard?.badge})`);
    assert(res.intentCard?.primaryMetric?.label === 'precipitation probability', 'Primary metric label must be precipitation probability');
    assert(Array.isArray(res.intentCard?.timeline) && res.intentCard?.timeline?.length === 5, `Timeline must have 5 hours (got: ${res.intentCard?.timeline?.length})`);

    const targetSlot = res.intentCard?.timeline?.find((s) => s.isTarget);
    assert(targetSlot && targetSlot.hourNumber === 20, `Target slot must be hour 20 (got: ${targetSlot?.hourNumber})`);

    assert(!res.reply.includes('Rain is unlikely ... today'), 'Response must NOT use today fallback phrasing');
    assert(res.reply.includes('tomorrow at around 8 PM'), 'Response must explicitly reference tomorrow at around 8 PM');
  } catch (err) {
    console.error('Error in Test 13:', err);
    failed++;
  }

  console.log('\n====================================================');
  console.log(` TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runTestSuite();
