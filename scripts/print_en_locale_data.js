const fs = require('fs');
const enData = require('./locale_data/en.js');
console.log(JSON.stringify(Object.keys(enData)));
for (const [section, val] of Object.entries(enData)) {
  console.log(`=== ${section} (${Object.keys(val).length} keys) ===`);
  console.log(JSON.stringify(val, null, 2));
}

