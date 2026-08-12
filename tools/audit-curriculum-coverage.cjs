const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const extensions = [
  'curriculum-depth-2026.js',
  'curriculum-audit-2026.js',
  'curriculum-corrections-2026.js',
  'curriculum-order-2026.js'
];

function load(locale) {
  const context = { window: {} };
  vm.createContext(context);
  vm.runInContext(
    fs.readFileSync(path.join(root, 'data', `curriculum-${locale}.js`), 'utf8'),
    context
  );

  for (const file of extensions) {
    const filePath = path.join(root, 'data', file);
    if (fs.existsSync(filePath)) {
      vm.runInContext(fs.readFileSync(filePath, 'utf8'), context);
    }
  }

  return context.window.WebDevGymCurriculumData;
}

function plainText(html) {
  return String(html || '')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&(?:nbsp|amp|lt|gt|quot|#39);/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function inspect(data) {
  return data.sections.map(section => {
    const lessons = section.lessons.map(lesson => {
      const html = String(lesson.html || '');
      return {
        id: lesson.id,
        title: lesson.title,
        textLength: plainText(html).length,
        hasCode: /class=["'][^"']*\bcode\b/.test(html),
        hasExplain: /class=["'][^"']*\bexplain\b/.test(html),
        hasChecklist: /\bprog-cb\b/.test(html),
        hasOfficialDocs: /https?:\/\//.test(html)
      };
    });

    return {
      id: section.id,
      title: section.title,
      lessonCount: lessons.length,
      shallow: lessons.filter(lesson => lesson.textLength < 650),
      noCode: lessons.filter(lesson => !lesson.hasCode),
      noExplain: lessons.filter(lesson => !lesson.hasExplain),
      noChecklist: lessons.filter(lesson => !lesson.hasChecklist),
      noOfficialDocs: lessons.filter(lesson => !lesson.hasOfficialDocs),
      averageTextLength: Math.round(
        lessons.reduce((sum, lesson) => sum + lesson.textLength, 0) /
        Math.max(lessons.length, 1)
      )
    };
  });
}

for (const locale of ['ru', 'en']) {
  const data = load(locale);
  const sections = inspect(data);
  const lessonCount = sections.reduce((sum, section) => sum + section.lessonCount, 0);
  console.log(`\n${locale.toUpperCase()}: ${lessonCount} lessons`);
  console.table(sections.map(section => ({
    section: section.id,
    lessons: section.lessonCount,
    avgChars: section.averageTextLength,
    shallow: section.shallow.length,
    noCode: section.noCode.length,
    noExplain: section.noExplain.length,
    noChecklist: section.noChecklist.length,
    noOfficialDocs: section.noOfficialDocs.length
  })));

  const shallow = sections.flatMap(section => section.shallow.map(lesson => ({
    section: section.id,
    id: lesson.id,
    title: lesson.title,
    chars: lesson.textLength
  })));

  console.log(`Shallow lessons (<650 text chars): ${shallow.length}`);
  console.table(shallow.slice(0, 40));
}
