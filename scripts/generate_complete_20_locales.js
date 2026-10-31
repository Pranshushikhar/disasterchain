const fs = require('fs');
const path = require('path');

const localesDir = path.resolve(__dirname, '../frontend/src/i18n/locales');
const localeDataDir = path.resolve(__dirname, 'locale_data');

// Deep merge helper
function deepMerge(target, source) {
  for (const key of Object.keys(source)) {
    if (
      source[key] &&
      typeof source[key] === 'object' &&
      !Array.isArray(source[key])
    ) {
      if (!target[key] || typeof target[key] !== 'object') {
        target[key] = {};
      }
      deepMerge(target[key], source[key]);
    } else {
      target[key] = source[key];
    }
  }
  return target;
}

// 1. Load existing extensions from locale_data (bn, en, gu, hi, kn, mr, pa, ta, te)
const existingLocaleData = {};
for (const lang of ['en', 'hi', 'bn', 'gu', 'kn', 'mr', 'pa', 'ta', 'te']) {
  const p = path.join(localeDataDir, `${lang}.js`);
  if (fs.existsSync(p)) {
    try {
      existingLocaleData[lang] = require(p);
    } catch (e) {
      console.warn(`Could not load ${p}:`, e.message);
    }
  }
}

console.log('Loaded locale_data for:', Object.keys(existingLocaleData));

