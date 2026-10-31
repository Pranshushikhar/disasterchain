const fs = require('fs');
const path = require('path');
const enData = require('./locale_data/en.js');

let output = '';
for (const [section, val] of Object.entries(enData)) {
  output += `\n=== ${section} (${Object.keys(val).length} keys) ===\n`;
  output += JSON.stringify(val, null, 2);
}
fs.writeFileSync(path.join(__dirname, 'en_locale_data.json'), output, 'utf8');
console.log('Written en_locale_data.json');

