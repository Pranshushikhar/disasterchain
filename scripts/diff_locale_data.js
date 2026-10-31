const fs = require('fs');
const path = require('path');

const enData = require('./locale_data/en.js');
const enLocale = require('../frontend/src/i18n/locales/en.json');

function flatten(obj, prefix = '') {
  let res = {};
  for (const k of Object.keys(obj)) {
    const val = obj[k];
    const fullKey = prefix ? `${prefix}.${k}` : k;
    if (val && typeof val === 'object' && !Array.isArray(val)) {
      Object.assign(res, flatten(val, fullKey));
    } else {
      res[fullKey] = val;
    }
  }
  return res;
}

const flatLocale = flatten(enLocale);
const flatData = flatten(enData);

const missingInData = [];
for (const k of Object.keys(flatData)) {
  if (!(k in flatLocale)) {
    missingInData.push({ key: k, value: flatData[k] });
  }
}

console.log('Total keys in locale_data/en.js:', Object.keys(flatData).length);
console.log('Keys in locale_data/en.js missing from current en.json:', missingInData.length);
console.log(JSON.stringify(missingInData.slice(0, 30), null, 2));

