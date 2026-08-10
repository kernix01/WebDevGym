'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
const errors = [];
const warnings = [];

function fail(message) {
  errors.push(message);
}

function warn(message) {
  warnings.push(message);
}

function loadCurriculum(locale) {
  const filename = path.join(ROOT, 'data', `curriculum-${locale}.js`);
  const source = fs.readFileSync(filename, 'utf8');
  const sandbox = { window: {} };
  vm.runInNewContext(source, sandbox, { filename });
  return { data: sandbox.window.WebDevGymCurriculumData, source };
}

function allMatches(text, pattern) {
  return Array.from(text.matchAll(pattern), match => match[1] || match[0]);
}

function validateCurriculum(locale) {
  const { data, source } = loadCurriculum(locale);
  if (!data || !Array.isArray(data.sections)) {
    fail(`${locale}: curriculum data is missing or malformed`);
    return null;
  }
  if (data.locale !== locale) {
    fail(`${locale}: locale field is ${JSON.stringify(data.locale)}`);
  }

  const sectionIds = new Set();
  const lessonIds = new Set();
  const pageIds = new Set();
  let lessonCount = 0;

  data.sections.forEach(section => {
    if (!section.id || sectionIds.has(section.id)) {
      fail(`${locale}: duplicate or missing section id ${JSON.stringify(section.id)}`);
    }
    sectionIds.add(section.id);

    if (!Array.isArray(section.lessons) || section.lessons.length === 0) {
      fail(`${locale}: section ${section.id} has no lessons`);
      return;
    }

    section.lessons.forEach((lesson, index) => {
      lessonCount += 1;
      const label = `${locale}:${section.id}:${lesson.id || index}`;
      if (lesson.id) {
        if (lessonIds.has(lesson.id)) fail(`${label}: duplicate lesson id`);
        lessonIds.add(lesson.id);
      } else {
        warn(`${label}: lesson has no id`);
      }

      if (typeof lesson.html !== 'string' || !lesson.html.includes('class="block')) {
        fail(`${label}: lesson HTML does not contain a .block root`);
        return;
      }
      if (!lesson.html.includes('block-title')) {
        fail(`${label}: lesson has no .block-title`);
      }
      if (/[\x00-\x08\x0B\x0C\x0E-\x1F]/.test(lesson.html)) {
        fail(`${label}: lesson contains a control character`);
      }
      if (/<a\b[^>]*>\s*<button\b|<button\b[^>]*>\s*<a\b/i.test(lesson.html)) {
        fail(`${label}: nested link and button`);
      }

      allMatches(lesson.html, /\bdata-pid="([^"]+)"/g).forEach(pid => {
        if (pageIds.has(pid)) fail(`${label}: duplicate data-pid ${pid}`);
        pageIds.add(pid);
      });
    });
  });

  if (locale === 'en') {
    if (/[А-Яа-яЁё]/.test(source)) fail('en: Cyrillic text remains in curriculum data');
    if (/вЂ|вњ|рџ|�/.test(source)) fail('en: mojibake remains in curriculum data');
  }

  return { data, lessonCount, sectionIds };
}

function validateIndex(locale, curriculum) {
  if (!curriculum) return;
  const filename = locale === 'ru' ? 'index.html' : 'index-en.html';
  const source = fs.readFileSync(path.join(ROOT, filename), 'utf8');
  const expectedData = `data/curriculum-${locale}.js`;
  const renderer = 'js/webdevgym-curriculum-renderer.js';
  const core = `js/webdevgym-core-${locale}.js`;

  curriculum.sectionIds.forEach(sectionId => {
    const marker = `data-curriculum-slot="${sectionId}"`;
    const count = source.split(marker).length - 1;
    if (count !== 1) fail(`${filename}: expected one slot for ${sectionId}, found ${count}`);
  });

  if (source.includes('webdevgym-curriculum-2026.js') ||
      source.includes('webdevgym-curriculum-quality.js')) {
    fail(`${filename}: legacy curriculum patch scripts are still referenced`);
  }

  const dataIndex = source.indexOf(expectedData);
  const rendererIndex = source.indexOf(renderer);
  const coreIndex = source.indexOf(core);
  if (!(dataIndex >= 0 && dataIndex < rendererIndex && rendererIndex < coreIndex)) {
    fail(`${filename}: scripts must load data, renderer, then core`);
  }
}

const ru = validateCurriculum('ru');
const en = validateCurriculum('en');
validateIndex('ru', ru);
validateIndex('en', en);

if (ru && en && ru.lessonCount !== en.lessonCount) {
  fail(`locale lesson counts differ: ru=${ru.lessonCount}, en=${en.lessonCount}`);
}

warnings.forEach(message => console.warn(`WARN ${message}`));
errors.forEach(message => console.error(`ERROR ${message}`));

if (errors.length) {
  console.error(`\nCurriculum validation failed: ${errors.length} error(s).`);
  process.exit(1);
}

console.log(
  `Curriculum OK: ${ru.lessonCount} RU lessons, ${en.lessonCount} EN lessons, ` +
  `${ru.data.sections.length} sections per locale.`
);
