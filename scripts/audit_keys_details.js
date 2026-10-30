const fs = require('fs');
const path = require('path');

const localesDir = path.join(__dirname, '../frontend/src/i18n/locales');
const en = JSON.parse(fs.readFileSync(path.join(localesDir, 'en.json'), 'utf8'));
const hi = JSON.parse(fs.readFileSync(path.join(localesDir, 'hi.json'), 'utf8'));

function resolveKey(obj, keyPath) {
  const parts = keyPath.split('.');
  let cur = obj;
  for (const p of parts) {
    if (!cur || typeof cur !== 'object' || !(p in cur)) return undefined;
    cur = cur[p];
  }
  return cur;
}

const targetFiles = [
  'frontend/src/components/ModernNav.jsx',
  'frontend/src/pages/ModernHomePage.jsx',
  'frontend/src/pages/ModernWeatherPage.jsx',
  'frontend/src/pages/ModernSafetyPage.jsx',
  'frontend/src/components/CitySelectorModal.jsx',
  'frontend/src/components/ModernWeatherGPT.jsx',
];

const foundKeys = new Set();
const keyRegex = /t\(\s*['"]([^'"]+)['"]\s*(?:,\s*['"]([^'"]+)['"])?\s*\)/g;

for (const relPath of targetFiles) {
  const fullPath = path.join(__dirname, '..', relPath);
  if (!fs.existsSync(fullPath)) continue;
  const content = fs.readFileSync(fullPath, 'utf8');
  let match;
  while ((match = keyRegex.exec(content)) !== null) {
    foundKeys.add({ key: match[1], fallback: match[2] || '', file: relPath });
  }
}

console.log(`Found ${foundKeys.size} t() calls in key files.`);
const missingInEn = [];
const missingInHi = [];

for (const item of foundKeys) {
  const valEn = resolveKey(en, item.key);
  if (valEn === undefined) {
    missingInEn.push(item);
  }
  const valHi = resolveKey(hi, item.key);
  if (valHi === undefined) {
    missingInHi.push(item);
  }
}

console.log(`\n--- MISSING IN EN.JSON (${missingInEn.length}) ---`);
missingInEn.forEach(m => console.log(`  ${m.key} (fallback: "${m.fallback}") [${m.file}]`));

console.log(`\n--- MISSING IN HI.JSON (${missingInHi.length}) ---`);
missingInHi.forEach(m => console.log(`  ${m.key} (fallback: "${m.fallback}") [${m.file}]`));
