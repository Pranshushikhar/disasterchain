const fs = require('fs');
const path = require('path');

const localesDir = path.join(__dirname, '../frontend/src/i18n/locales');
const enLocale = JSON.parse(fs.readFileSync(path.join(localesDir, 'en.json'), 'utf8'));

function resolveKey(obj, keyPath) {
  if (!obj || typeof obj !== 'object') return undefined;
  const parts = keyPath.split('.');
  let cur = obj;
  for (const p of parts) {
    if (!cur || typeof cur !== 'object' || !(p in cur)) return undefined;
    cur = cur[p];
  }
  return typeof cur === 'string' ? cur : undefined;
}

const allTCalls = [];
const tRegex = /\bt\s*\(\s*['"]([a-zA-Z0-9_.-]+)['"](?:\s*,\s*(?:['"]([^'"]*)['"]|([^),]+)))?/g;

function scanDir(dir) {
  for (const f of fs.readdirSync(dir)) {
    const p = path.join(dir, f);
    if (fs.statSync(p).isDirectory()) {
      if (f !== 'locales' && f !== 'node_modules') scanDir(p);
    } else if (f.endsWith('.js') || f.endsWith('.jsx')) {
      if (!f.endsWith('.test.js')) {
        const c = fs.readFileSync(p, 'utf8');
        let m;
        while ((m = tRegex.exec(c)) !== null) {
          allTCalls.push({ file: p, key: m[1], fallback: m[2] || '' });
        }
      }
    }
  }
}
scanDir(path.join(__dirname, '../frontend/src'));

const missing = {};
for (const c of allTCalls) {
  if (resolveKey(enLocale, c.key) === undefined) {
    if (!missing[c.key]) {
      missing[c.key] = { fallback: c.fallback, files: [] };
    }
    const relFile = path.relative(path.join(__dirname, '..'), c.file);
    if (!missing[c.key].files.includes(relFile)) {
      missing[c.key].files.push(relFile);
    }
  }
}

fs.writeFileSync(path.join(__dirname, 'missing_keys.json'), JSON.stringify(missing, null, 2), 'utf8');
console.log('Total unique missing keys in en.json:', Object.keys(missing).length);

