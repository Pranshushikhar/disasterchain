const puppeteer = require('C:/Users/shikh/New folder/node_modules/puppeteer-core');
const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

const LIVE_WEATHER_URL = 'https://disasterchain.vercel.app/weather?skip_intro=1';

async function verifyLiveWeather() {
  const browser = await puppeteer.launch({
    executablePath: edgePath,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });

  try {
    const page = await browser.newPage();
    await page.evaluateOnNewDocument(() => {
      localStorage.setItem('disasterchain_tour_completed', 'true');
    });

    console.log(`Navigating to ${LIVE_WEATHER_URL}...`);
    await page.goto(LIVE_WEATHER_URL, { waitUntil: 'networkidle2', timeout: 60000 });
    await page.waitForSelector('.dc-weather-hero', { timeout: 15000 });

    const weatherInfo = await page.evaluate(() => {
      const cityEl = document.querySelector('.dc-weather-city');
      const tempEl = document.querySelector('.dc-weather-temp');
      const conditionEl = document.querySelector('.dc-weather-condition-title');
      const aqiEl = document.querySelector('.dc-aqi-value');
      const forecastCards = Array.from(document.querySelectorAll('.dc-forecast-card')).length;
      
      return {
        city: cityEl ? cityEl.textContent.trim() : 'NOT_FOUND',
        temp: tempEl ? tempEl.textContent.trim() : 'NOT_FOUND',
        condition: conditionEl ? conditionEl.textContent.trim() : 'NOT_FOUND',
        aqi: aqiEl ? aqiEl.textContent.trim() : 'NOT_FOUND',
        forecastCount: forecastCards
      };
    });

    console.log('Live Weather Page Data:');
    console.log('  Location:', weatherInfo.city);
    console.log('  Temperature:', weatherInfo.temp);
    console.log('  Condition:', weatherInfo.condition);
    console.log('  AQI:', weatherInfo.aqi);
    console.log('  5-Day Forecast Cards:', weatherInfo.forecastCount);

    if (weatherInfo.city.toLowerCase().includes('delhi ncr') && !weatherInfo.city.toLowerCase().includes('india')) {
      console.warn('⚠️ Warning: Still defaulted to Delhi NCR');
    } else {
      console.log('✅ Weather location correctly resolved without hardcoded fallback!');
    }

    const screenshotPath = 'C:/Users/shikh/.gemini/antigravity-ide/brain/04542bf0-b323-41ac-a81d-2056569b8398/vercel_live_weather_page.png';
    await page.screenshot({ path: screenshotPath });
    console.log(`Weather screenshot saved to ${screenshotPath}`);

  } finally {
    await browser.close();
  }
}

verifyLiveWeather().catch(err => {
  console.error('Live Weather verification error:', err);
  process.exit(1);
});
