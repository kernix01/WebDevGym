const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const extensionSource = fs.readFileSync(
  path.join(root, 'data', 'curriculum-depth-2026.js'),
  'utf8'
);
const auditSource = fs.readFileSync(
  path.join(root, 'data', 'curriculum-audit-2026.js'),
  'utf8'
);
const correctionsSource = fs.readFileSync(
  path.join(root, 'data', 'curriculum-corrections-2026.js'),
  'utf8'
);
const orderSource = fs.readFileSync(
  path.join(root, 'data', 'curriculum-order-2026.js'),
  'utf8'
);

function load(locale) {
  const context = { window: {} };
  vm.createContext(context);
  vm.runInContext(
    fs.readFileSync(path.join(root, 'data', `curriculum-${locale}.js`), 'utf8'),
    context
  );
  vm.runInContext(extensionSource, context);
  vm.runInContext(auditSource, context);
  vm.runInContext(correctionsSource, context);
  vm.runInContext(orderSource, context);
  return {
    data: context.window.WebDevGymCurriculumData,
    learningPath: context.window.WebDevGymLearningPath
  };
}

const ruContext = load('ru');
const enContext = load('en');
const ru = ruContext.data;
const en = enContext.data;
const errors = [];

function lessons(data) {
  return data.sections.flatMap(section => (
    section.lessons.map(lesson => ({ ...lesson, sectionId: section.id }))
  ));
}

const ruLessons = lessons(ru);
const enLessons = lessons(en);
const ruIds = ruLessons.map(lesson => lesson.id);
const enIds = enLessons.map(lesson => lesson.id);

if (ruLessons.length !== 255 || enLessons.length !== 255) {
  errors.push(`Expected 255 lessons per locale, got RU ${ruLessons.length}, EN ${enLessons.length}.`);
}

if (new Set(ruIds).size !== ruIds.length) errors.push('RU contains duplicate lesson ids.');
if (new Set(enIds).size !== enIds.length) errors.push('EN contains duplicate lesson ids.');

if (ruIds.join('\n') !== enIds.join('\n')) {
  errors.push('RU and EN lesson order or ids do not match.');
}

for (const data of [ru, en]) {
  for (const section of data.sections) {
    section.lessons.forEach((lesson, index) => {
      if (lesson.learningOrder !== index + 1) {
        errors.push(`${section.id}/${lesson.id} has invalid learningOrder.`);
      }
    });
  }
}

const expectedRoutes = {
  frontend: ['html', 'css', 'js', 'git', 'vite', 'ts', 'react'],
  backend: ['js', 'git', 'node', 'sql', 'pg', 'linux', 'devops']
};
for (const [routeId, expected] of Object.entries(expectedRoutes)) {
  const ruRoute = Array.from(ruContext.learningPath.routes[routeId] || []);
  const enRoute = Array.from(enContext.learningPath.routes[routeId] || []);
  if (ruRoute.join() !== expected.join() || enRoute.join() !== expected.join()) {
    errors.push(`${routeId} route is not in the expected learning order.`);
  }
}

if (ruContext.learningPath.calendarTopics.ru.length < 40 ||
    enContext.learningPath.calendarTopics.en.length < 40) {
  errors.push('The ordered learning calendar is incomplete.');
}

const depthLessons = [...ruLessons, ...enLessons].filter(lesson => (
  lesson.html.includes('wdg-depth-lesson')
));

if (depthLessons.length !== 36) {
  errors.push(`Expected 36 localized depth lessons, got ${depthLessons.length}.`);
}

for (const lesson of depthLessons) {
  if (!lesson.html.includes(`id="${lesson.id}"`)) {
    errors.push(`${lesson.sectionId}/${lesson.id} does not render its own id.`);
  }
  if (!lesson.html.includes('class="code"')) {
    errors.push(`${lesson.sectionId}/${lesson.id} has no code/example block.`);
  }
  if (!lesson.html.includes('class="explain"')) {
    errors.push(`${lesson.sectionId}/${lesson.id} has no detailed explanation.`);
  }
  if (!lesson.html.includes('prog-cb')) {
    errors.push(`${lesson.sectionId}/${lesson.id} has no mastery checklist.`);
  }
}

const auditedLessons = [...ruLessons, ...enLessons].filter(lesson => (
  lesson.html.includes('wdg-audited-lesson')
));

if (auditedLessons.length !== 66) {
  errors.push(`Expected 66 localized audit lessons, got ${auditedLessons.length}.`);
}

for (const lesson of auditedLessons) {
  if (!lesson.html.includes(`id="${lesson.id}"`)) {
    errors.push(`${lesson.sectionId}/${lesson.id} does not render its own id.`);
  }
  if (!lesson.html.includes('class="code"')) {
    errors.push(`${lesson.sectionId}/${lesson.id} has no code/example block.`);
  }
  if (!lesson.html.includes('class="explain"')) {
    errors.push(`${lesson.sectionId}/${lesson.id} has no detailed explanation.`);
  }
  if (!lesson.html.includes('prog-cb')) {
    errors.push(`${lesson.sectionId}/${lesson.id} has no mastery checklist.`);
  }
  if (!lesson.html.includes('wdg-depth-docs') || !lesson.html.includes('https://')) {
    errors.push(`${lesson.sectionId}/${lesson.id} has no official documentation link.`);
  }
}

const correctedLessons = [...ruLessons, ...enLessons].filter(lesson => (
  lesson.html.includes('wdg-fact-checked-lesson')
));

if (correctedLessons.length !== 12) {
  errors.push(`Expected 12 localized fact-checked lessons, got ${correctedLessons.length}.`);
}

for (const lesson of correctedLessons) {
  if (!lesson.html.includes('class="code"') || !lesson.html.includes('class="explain"')) {
    errors.push(`${lesson.sectionId}/${lesson.id} is missing its corrected example or explanation.`);
  }
  if (!lesson.html.includes('prog-cb')) {
    errors.push(`${lesson.sectionId}/${lesson.id} lost its existing progress checklist.`);
  }
  if (!lesson.html.includes('wdg-depth-docs') || !lesson.html.includes('https://')) {
    errors.push(`${lesson.sectionId}/${lesson.id} has no official source after correction.`);
  }
}

if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}

console.log(
  `Curriculum order OK: ${ruLessons.length} RU lessons, ` +
  `${enLessons.length} EN lessons, routes and calendar match.`
);
