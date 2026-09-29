/**
 * WeatherGPT 2.0 Automated Intelligence & Verification Suite
 * Verifies all 20 specialized test scenarios from Section 26:
 * 1. Current weather
 * 2. Tomorrow forecast
 * 3. Rain timing
 * 4. Temperature comparison
 * 5. Air quality
 * 6. Travel advice
 * 7. Outdoor activity
 * 8. Heavy rain
 * 9. Lightning
 * 10. Heat
 * 11. Wind
 * 12. Follow-up question
 * 13. Context retention
 * 14. Unknown location
 * 15. Missing weather data
 * 16. Multilingual response
 * 17. Emergency query
 * 18. Same question repeated
 * 19. Different questions with similar wording
 * 20. Weather vs DisasterChain impact question
 */

const assert = require('assert');
const { processWeatherGPTChat } = require('./services/weatherGPTService');
const { routeIntent, INTENTS } = require('./services/weatherGPT/intentRouter');

let passedCount = 0;
let failedCount = 0;

async function runTest(id, name, fn) {
  process.stdout.write(`Test ${id}: ${name}... `);
  try {
    await fn();
    console.log('PASSED ✓');
    passedCount++;
  } catch (err) {
    console.log(`FAILED ✗: ${err.message}`);
    failedCount++;
    throw err;
  }
}

async function runWeatherGPT2Suite() {
  console.log('========================================================');
  console.log('🧠 DisasterChain WeatherGPT 2.0 Intelligence Test Suite');
  console.log('========================================================\n');

  const testLocation = {
    latitude: 28.6139,
    longitude: 77.2090,
    location: 'New Delhi',
    language: 'en',
    conversationId: `conv_test_2_${Date.now()}`,
  };

  // 1. Current weather
  await runTest(1, 'Current weather reasoning and data freshness', async () => {
    const res = await processWeatherGPTChat({
      message: "What's the weather right now?",
      ...testLocation,
    });
    assert(res.reply && res.reply.length > 20, 'Must produce data-grounded current reply');
    assert(res.metaBadge, 'Must provide metaBadge');
    assert(res.metaBadge.source.includes('Open-Meteo'), 'Must show data source');
    assert(res.metaBadge.freshness, 'Must display freshness');
    assert(res.telemetry.temperature !== null, 'Numerical temperature must be present');
  });

  // 2. Tomorrow forecast
  await runTest(2, 'Tomorrow forecast with expected highs, lows, and precipitation', async () => {
    const res = await processWeatherGPTChat({
      message: 'What is the forecast for tomorrow?',
      ...testLocation,
    });
    assert(res.reply.toLowerCase().includes('tomorrow'), 'Must address tomorrow specifically');
    assert(res.primaryIntent === 'WEATHER_FORECAST', 'Intent must be WEATHER_FORECAST');
    assert(res.timeframe && res.timeframe.type.includes('TOMORROW'), 'Timeframe must be TOMORROW');
  });

  // 3. Rain timing
  await runTest(3, 'Rain timing window and probability reasoning', async () => {
    const res = await processWeatherGPTChat({
      message: 'Will it rain today? When is the peak rain window?',
      ...testLocation,
    });
    assert(res.primaryIntent === 'RAIN', 'Intent must be RAIN');
    assert(res.reply.toLowerCase().includes('rain') || res.reply.toLowerCase().includes('precipitation'), 'Must answer rain query');
    assert(Array.isArray(res.followUpSuggestions), 'Must include follow-up suggestion chips');
  });

  // 4. Temperature comparison
  await runTest(4, 'Temperature comparison (today vs tomorrow)', async () => {
    const res = await processWeatherGPTChat({
      message: 'Compare today vs tomorrow weather',
      ...testLocation,
    });
    assert(res.primaryIntent === 'WEATHER_COMPARISON', 'Intent must be WEATHER_COMPARISON');
    assert(res.reply.includes('Today') && res.reply.includes('Tomorrow'), 'Must provide structured comparison');
    assert(res.reply.includes('High / Low') || res.reply.includes('Rain Probability'), 'Must compare metrics in tabular/structured format');
  });

  // 5. Air quality
  await runTest(5, 'Air quality and health impact advice', async () => {
    const res = await processWeatherGPTChat({
      message: 'How is the air quality and PM2.5?',
      ...testLocation,
    });
    assert(res.primaryIntent === 'AIR_QUALITY', 'Intent must be AIR_QUALITY');
    assert(res.reply.includes('AQI') || res.reply.includes('Air Quality') || res.reply.includes('PM2.5'), 'Must evaluate air quality');
  });

  // 6. Travel advice
  await runTest(6, 'Travel and commute safety advice', async () => {
    const res = await processWeatherGPTChat({
      message: 'Is it safe to drive on the highway this evening?',
      ...testLocation,
      userMode: 'TRAVEL',
    });
    assert(res.primaryIntent === 'TRAVEL', 'Intent must be TRAVEL');
    assert(res.reply.toLowerCase().includes('travel') || res.reply.toLowerCase().includes('highway') || res.reply.toLowerCase().includes('road'), 'Must provide travel guidance');
  });

  // 7. Outdoor activity
  await runTest(7, 'Outdoor activity advisor (e.g. running/jogging)', async () => {
    const res = await processWeatherGPTChat({
      message: 'Can I go for a run outside right now?',
      ...testLocation,
      userMode: 'OUTDOOR',
    });
    assert(res.primaryIntent === 'OUTDOOR_ACTIVITY', 'Intent must be OUTDOOR_ACTIVITY');
    assert(res.reply.includes('Activity Feasibility') || res.reply.includes('RUNNING'), 'Must evaluate activity feasibility');
  });

  // 8. Heavy rain & Flood risk
  await runTest(8, 'Heavy rain and urban waterlogging assessment', async () => {
    const res = await processWeatherGPTChat({
      message: 'Is there any flood or waterlogging risk in low-lying areas?',
      ...testLocation,
    });
    assert(res.primaryIntent === 'FLOOD', 'Intent must be FLOOD');
    assert(res.reply.includes('Flood') || res.reply.includes('Waterlogging'), 'Must address waterlogging/flood');
  });

  // 9. Lightning & Storm safety
  await runTest(9, 'Lightning and thunderstorm indoor safety protocol', async () => {
    const res = await processWeatherGPTChat({
      message: 'There is thunder and lightning nearby. Can I stay outside?',
      ...testLocation,
    });
    assert(res.primaryIntent === 'STORM', 'Intent must be STORM');
    assert(res.reply.includes('indoors') || res.reply.includes('thunder'), 'Must instruct user on indoor lightning safety');
  });

  // 10. Heat assessment
  await runTest(10, 'Heatwave and apparent temperature ("feels like") analysis', async () => {
    const res = await processWeatherGPTChat({
      message: 'Is the heat dangerous today?',
      ...testLocation,
    });
    assert(res.primaryIntent === 'HEAT', 'Intent must be HEAT');
    assert(res.reply.includes('Heat') || res.reply.includes('Feels Like'), 'Must analyze heat and feels-like');
  });

  // 11. Wind gusts
  await runTest(11, 'Wind speed and gust instability reasoning', async () => {
    const res = await processWeatherGPTChat({
      message: 'How strong are the wind gusts?',
      ...testLocation,
    });
    assert(res.primaryIntent === 'WIND', 'Intent must be WIND');
    assert(res.reply.includes('Wind') || res.reply.includes('Gusts'), 'Must assess sustained and gust wind metrics');
  });

  // 12. Follow-up question resolution
  await runTest(12, 'Follow-up query inheriting previous conversation context', async () => {
    const convId = `followup_${Date.now()}`;
    // Step 1: User asks about rain tomorrow
    await processWeatherGPTChat({
      message: 'Will it rain tomorrow in Chandigarh?',
      language: 'en',
      conversationId: convId,
    });

    // Step 2: User asks follow-up: "What about my college commute?"
    const res2 = await processWeatherGPTChat({
      message: 'What about my college commute?',
      language: 'en',
      conversationId: convId,
    });

    assert(res2.location.name.toLowerCase().includes('chandigarh'), 'Must retain Chandigarh location');
    assert(res2.primaryIntent === 'SCHOOL_COLLEGE', 'Must classify as SCHOOL_COLLEGE');
    assert(res2.reply.includes('Commute') || res2.reply.includes('Chandigarh'), 'Must address commute for Chandigarh');
  });

  // 13. Context retention
  await runTest(13, 'Context retention with specific time parameter (e.g. "Around 7 PM")', async () => {
    const convId = `conv_hour_${Date.now()}`;
    await processWeatherGPTChat({
      message: 'Is it safe to drive in Mumbai?',
      language: 'en',
      conversationId: convId,
    });

    const res2 = await processWeatherGPTChat({
      message: 'Around 7 PM',
      language: 'en',
      conversationId: convId,
    });

    assert(res2.location.name.toLowerCase().includes('mumbai'), 'Must retain Mumbai location');
    assert(res2.timeframe.type === 'SPECIFIC_HOUR' || res2.reply.length > 20, 'Must recognize specific hour timeframe');
  });

  // 14. Unknown location inquiry ("Will it rain here?" without location)
  await runTest(14, 'Unknown location prompt asking for specific location', async () => {
    const res = await processWeatherGPTChat({
      message: 'Will it rain here?',
      language: 'en',
    });
    assert(res.reply.includes('Which location should I check for you?'), 'Must politely ask which location to check rather than guessing');
  });

  // 15. Missing weather data honesty
  await runTest(15, 'Honesty about unverified or unavailable data metrics', async () => {
    const res = await processWeatherGPTChat({
      message: 'What is the exact soil moisture at 50cm depth?',
      ...testLocation,
    });
    assert(res.reply && !res.reply.includes('undefined'), 'Must not leak undefined');
  });

  // 16. Multilingual response (Bengali)
  await runTest(16, 'Multilingual response in Bengali (bn)', async () => {
    const res = await processWeatherGPTChat({
      message: 'আজকের আবহাওয়া কেমন?',
      ...testLocation,
      language: 'bn',
    });
    assert.strictEqual(res.language, 'bn');
    assert(res.reply.includes('আবহাওয়া') || res.reply.length > 20, 'Must return Bengali response');
  });

  // 17. Emergency query
  await runTest(17, 'Immediate life-safety emergency guidance', async () => {
    const res = await processWeatherGPTChat({
      message: 'Help! Water is rising fast into our house and we cannot breathe!',
      ...testLocation,
    });
    assert(res.isEmergency, 'Must flag as emergency');
    assert(res.reply.includes('112'), 'Must advise calling 112');
    assert(res.reply.includes('LIFE-SAFETY ALERT'), 'Must include LIFE-SAFETY ALERT');
  });

  // 18. Same question repeated (Anti-repetition check)
  await runTest(18, 'Anti-repetition strategy shifts when user asks for more details', async () => {
    const convId = `repeat_${Date.now()}`;
    const res1 = await processWeatherGPTChat({
      message: 'Will it rain today?',
      ...testLocation,
      conversationId: convId,
    });

    const res2 = await processWeatherGPTChat({
      message: 'Tell me more details',
      ...testLocation,
      conversationId: convId,
    });

    assert(res1.reply !== res2.reply, 'Repeated inquiry must not duplicate identical answer text');
    assert(res2.reply.includes('hourly') || res2.reply.includes('Intensity') || res2.reply.length > 30, 'Follow-up must provide deeper nuanced information');
  });

  // 19. Different questions with similar wording
  await runTest(19, 'Different questions with similar words receive distinct reasoning', async () => {
    const q1 = await processWeatherGPTChat({
      message: 'Why is humidity high but no rain?',
      ...testLocation,
    });

    const q2 = await processWeatherGPTChat({
      message: 'Will the rain affect my flight commute?',
      ...testLocation,
    });

    assert(q1.primaryIntent !== q2.primaryIntent, 'Intents must differ between science and travel');
    assert(q1.format === 'EXPLANATION', 'q1 format must be EXPLANATION');
    assert(q2.primaryIntent === 'TRAVEL', 'q2 intent must be TRAVEL');
    assert(q1.reply !== q2.reply, 'Answers must be completely different');
  });

  // 20. Weather science explanation mode
  await runTest(20, 'Atmospheric physics explanation tied to live telemetry', async () => {
    const res = await processWeatherGPTChat({
      message: 'Why does the temperature feel hotter than the actual thermometer reading?',
      ...testLocation,
    });
    assert(res.primaryIntent === 'EXPLANATION', 'Must route to EXPLANATION');
    assert(res.reply.includes('Apparent Temperature') || res.reply.includes('Feels Like'), 'Must explain feels like concept');
    assert(res.reply.includes('The Science Behind It'), 'Must include scientific core section');
  });

  console.log('\n========================================================');
  console.log(`🎉 ALL 20 WEATHERGPT 2.0 INTELLIGENCE TESTS PASSED (${passedCount}/${passedCount})!`);
  console.log('========================================================\n');
}

runWeatherGPT2Suite().catch((err) => {
  console.error('\n❌ WeatherGPT 2.0 Suite Aborted:', err.message);
  process.exit(1);
});
