const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const indexes = ['index.html', 'index-en.html'].map(file => ({
  file,
  source: fs.readFileSync(path.join(root, file), 'utf8')
}));

const modules = [
  ['css/webdevgym-nexus-v3.css', 'js/webdevgym-nexus-v3.js'],
  ['css/webdevgym-learning-workspace.css', 'js/webdevgym-learning-workspace.js'],
  ['css/webdevgym-playground-atlas.css', 'js/webdevgym-playground-atlas.js'],
  ['css/webdevgym-calendar-v5.css', 'js/webdevgym-calendar-v5.js'],
  ['css/webdevgym-trainers-v2.css', 'js/webdevgym-trainers-v2.js']
];

for (const { file, source } of indexes) {
  for (const [cssFile, jsFile] of modules) {
    if (!source.includes(cssFile)) throw new Error(`${file}: ${cssFile} is not connected`);
    if (!source.includes(jsFile)) throw new Error(`${file}: ${jsFile} is not connected`);
  }
  if (!source.includes('css/webdevgym-routes-v2.css')) {
    throw new Error(`${file}: route workspace styles are not connected`);
  }
}

const mobileCss = modules
  .map(([cssFile]) => fs.readFileSync(path.join(root, cssFile), 'utf8'))
  .join('\n');
if (!mobileCss.includes('@media (max-width:')) throw new Error('Mobile layout is missing');

const nexus = fs.readFileSync(path.join(root, modules[0][1]), 'utf8');
const calendar = fs.readFileSync(path.join(root, modules[3][1]), 'utf8');
if (!nexus.includes('webdevgym_nexus_notes_v1')) {
  throw new Error('Nexus storage compatibility is missing');
}
if (!calendar.includes('wdgCalGetSnapshot')) {
  throw new Error('Calendar snapshot compatibility is missing');
}

console.log('Redesign modules OK: current workspaces are connected in RU and EN with mobile styles and local-data compatibility.');
