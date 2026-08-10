'use strict';

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'sw.js'), 'utf8');
const shellMatch = source.match(/const APP_SHELL = \[([\s\S]*?)\];/);

if (!shellMatch) {
  console.error('APP_SHELL was not found in sw.js');
  process.exit(1);
}

const entries = Array.from(shellMatch[1].matchAll(/'\.\/([^']+)'/g), match => match[1]);
const missing = entries.filter(entry => {
  const filePath = entry.split(/[?#]/, 1)[0];
  return !fs.existsSync(path.join(root, filePath));
});
const duplicates = entries.filter((entry, index) => entries.indexOf(entry) !== index);

if (missing.length || duplicates.length) {
  missing.forEach(entry => console.error(`Missing app-shell file: ${entry}`));
  [...new Set(duplicates)].forEach(entry => console.error(`Duplicate app-shell file: ${entry}`));
  process.exit(1);
}

if (/webdevgym-curriculum-(?:2026|quality)\.js/.test(source)) {
  console.error('Legacy curriculum patch remains in the service worker.');
  process.exit(1);
}

console.log(`App shell OK: ${entries.length} cached files exist.`);
