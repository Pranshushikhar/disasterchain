const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '../frontend/src');
const localesDir = path.join(__dirname, '../frontend/src/i18n/locales');

// Load en.json and hi.json
const enLocale = JSON.parse(fs.readFileSync(path.join(localesDir, 'en.json'), 'utf8'));
const hiLocale = JSON.parse(fs.readFileSync(path.join(localesDir, 'hi.json'), 'utf8'));

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

// Find all js and jsx files
function getAllFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      if (file !== 'locales' && file !== 'node_modules' && file !== '__tests__') {
        getAllFiles(filePath, fileList);
      }
    } else if (file.endsWith('.js') || file.endsWith('.jsx')) {
      if (!file.endsWith('.test.js') && !file.endsWith('.test.jsx')) {
        fileList.push(filePath);
      }
    }
  }
  return fileList;
}

const allFiles = getAllFiles(srcDir);
console.log(`Found ${allFiles.length} source files to inspect.`);

// 1. Audit t() calls
const allTCalls = [];
// Pattern for t('key', ...) or t("key", ...)
const tRegex = /\bt\s*\(\s*['"]([a-zA-Z0-9_.-]+)['"](?:\s*,\s*(?:['"]([^'"]*)['"]|([^),]+)))?/g;

for (const file of allFiles) {
  const content = fs.readFileSync(file, 'utf8');
  let match;
  while ((match = tRegex.exec(content)) !== null) {
    allTCalls.push({
      file: path.relative(path.join(__dirname, '..'), file),
      key: match[1],
      fallback: match[2] || '',
    });
  }
}

console.log(`Found ${allTCalls.length} total t() calls across codebase.`);

const missingInEn = new Map();
const missingInHi = new Map();

for (const call of allTCalls) {
  const valEn = resolveKey(enLocale, call.key);
  if (valEn === undefined) {
    if (!missingInEn.has(call.key)) {
      missingInEn.set(call.key, { fallback: call.fallback, files: new Set([call.file]) });
    } else {
      missingInEn.get(call.key).files.add(call.file);
    }
  }
  const valHi = resolveKey(hiLocale, call.key);
  if (valHi === undefined) {
    if (!missingInHi.has(call.key)) {
      missingInHi.set(call.key, { fallback: call.fallback, files: new Set([call.file]) });
    } else {
      missingInHi.get(call.key).files.add(call.file);
    }
  }
}

console.log(`Unique missing keys in en.json: ${missingInEn.size}`);
console.log(`Unique missing keys in hi.json: ${missingInHi.size}`);

// Print details of missing keys
console.log('\n--- SAMPLE MISSING IN EN.JSON ---');
let i = 0;
for (const [key, data] of missingInEn.entries()) {
  console.log(`${key} => fallback: "${data.fallback}" in [${Array.from(data.files).join(', ')}]`);
  if (++i >= 30) break;
}

// 2. Check files without useTranslation
console.log('\n--- FILES WITHOUT useTranslation ---');
const componentsWithoutT = [];
for (const file of allFiles) {
  const rel = path.relative(path.join(__dirname, '..'), file);
  if (rel.includes('context') || rel.includes('services') || rel.includes('utils') || rel.includes('config') || rel.includes('i18n')) {
    continue;
  }
  const content = fs.readFileSync(file, 'utf8');
  const hasUseTranslation = content.includes('useTranslation') || content.includes('useI18n');
  const hasT = content.includes('t(');
  if (!hasUseTranslation && !hasT) {
    componentsWithoutT.push(rel);
  }
}
componentsWithoutT.forEach(f => console.log(f));

