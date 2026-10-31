const fs = require('fs');
const path = require('path');

const content = fs.readFileSync(path.join(__dirname, '../frontend/src/pages/ModernWeatherPage.jsx'), 'utf8');
const tRegex = /\bt\s*\(\s*['"]([a-zA-Z0-9_.-]+)['"](?:\s*,\s*['"]([^'"]*)['"])?/g;
let m;
const keys = [];
while ((m = tRegex.exec(content)) !== null) {
  keys.push({ key: m[1], fallback: m[2] });
}
console.log('Weather page calls count:', keys.length);
console.log(JSON.stringify(keys, null, 2));

