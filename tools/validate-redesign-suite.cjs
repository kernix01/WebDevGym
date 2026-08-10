const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const jsPath = path.join(root, 'js', 'webdevgym-redesign-suite.js');
const cssPath = path.join(root, 'css', 'webdevgym-redesign-suite.css');
const js = fs.readFileSync(jsPath, 'utf8');
const css = fs.readFileSync(cssPath, 'utf8');
const indexes = ['index.html', 'index-en.html'].map(file => ({
  file,
  source: fs.readFileSync(path.join(root, file), 'utf8')
}));

const requiredScreens = [
  'installNexus',
  'enhanceLearning',
  'installPlayground',
  'installCalendar',
  'enhanceTrainers',
  'enhanceRoutes'
];

for (const name of requiredScreens) {
  if (!js.includes(`function ${name}`)) throw new Error(`Missing redesign stage: ${name}`);
}

for (const { file, source } of indexes) {
  if (!source.includes('css/webdevgym-redesign-suite.css')) throw new Error(`${file}: suite CSS is not connected`);
  if (!source.includes('js/webdevgym-redesign-suite.js')) throw new Error(`${file}: suite JS is not connected`);
}

if (!css.includes('@media (max-width: 760px)')) throw new Error('Mobile layout is missing');
if (!js.includes('webdevgym_nexus_notes_v1')) throw new Error('Nexus storage compatibility is missing');
if (!js.includes('wdgCalGetSnapshot')) throw new Error('Calendar snapshot compatibility is missing');

console.log('Redesign suite OK: 6 stages connected, local data compatibility and mobile styles found.');
