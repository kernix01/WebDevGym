'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
const rendererSource = fs.readFileSync(
  path.join(ROOT, 'js', 'webdevgym-curriculum-renderer.js'),
  'utf8'
);
const depthSource = fs.readFileSync(
  path.join(ROOT, 'data', 'curriculum-depth-2026.js'),
  'utf8'
);
const orderSource = fs.readFileSync(
  path.join(ROOT, 'data', 'curriculum-order-2026.js'),
  'utf8'
);

for (const locale of ['ru', 'en']) {
  const dataSandbox = { window: {} };
  vm.runInNewContext(
    fs.readFileSync(path.join(ROOT, 'data', `curriculum-${locale}.js`), 'utf8'),
    dataSandbox
  );
  vm.runInNewContext(depthSource, dataSandbox);
  vm.runInNewContext(orderSource, dataSandbox);
  const data = dataSandbox.window.WebDevGymCurriculumData;
  const sections = new Map();

  data.sections.forEach(sectionData => {
    const slot = {
      replacement: null,
      replaceWith(fragment) {
        this.replacement = fragment;
      }
    };
    sections.set(sectionData.id, {
      slot,
      querySelector(selector) {
        return selector === `[data-curriculum-slot="${sectionData.id}"]` ? slot : null;
      }
    });
  });

  const template = {
    content: { childNodes: [] },
    set innerHTML(value) {
      this.content.childNodes = [{ html: value }];
    }
  };
  const document = {
    createElement(name) {
      assert.strictEqual(name, 'template');
      return template;
    },
    createDocumentFragment() {
      return {
        nodes: [],
        appendChild(node) {
          this.nodes.push(node);
        }
      };
    },
    getElementById(id) {
      return sections.get(id) || null;
    },
    dispatchEvent() {}
  };

  const sandbox = {
    window: { WebDevGymCurriculumData: data },
    document,
    CustomEvent: class CustomEvent {
      constructor(type, options) {
        this.type = type;
        this.detail = options.detail;
      }
    },
    console
  };
  vm.runInNewContext(rendererSource, sandbox, { filename: 'curriculum-renderer.js' });

  const expectedLessons = data.sections.reduce(
    (total, section) => total + section.lessons.length,
    0
  );
  assert.strictEqual(sandbox.window.WebDevGymCurriculumReady.lessons, expectedLessons);
  assert.deepStrictEqual(
    Array.from(sandbox.window.WebDevGymCurriculumReady.missingSections),
    []
  );
  data.sections.forEach(sectionData => {
    assert.strictEqual(
      sections.get(sectionData.id).slot.replacement.nodes.length,
      sectionData.lessons.length
    );
  });
}

console.log('Curriculum renderer OK for RU and EN.');
