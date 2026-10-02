(function (global) {
  'use strict';

  const INDENT = '  ';
  const OPEN_PAIRS = { '(': ')', '[': ']', '{': '}', '"': '"', "'": "'", '`': '`' };
  const CLOSE_PAIRS = new Set([')', ']', '}', '"', "'", '`']);
  const COMPLETIONS = {
    javascript: [
      ['console.log', 'console.log()', 12, 'function'], ['const', 'const ', 6, 'keyword'],
      ['let', 'let ', 4, 'keyword'], ['function', 'function name() {\n  \n}', 9, 'keyword'],
      ['return', 'return ', 7, 'keyword'], ['document.querySelector', 'document.querySelector("")', 24, 'DOM'],
      ['addEventListener', 'addEventListener("click", () => {\n  \n})', 18, 'DOM'],
      ['forEach', 'forEach((item) => {\n  \n})', 18, 'array'], ['map', 'map((item) => item)', 18, 'array'],
      ['filter', 'filter((item) => )', 17, 'array'], ['JSON.parse', 'JSON.parse()', 11, 'function'],
      ['JSON.stringify', 'JSON.stringify()', 15, 'function'], ['localStorage.getItem', 'localStorage.getItem("")', 22, 'storage'],
      ['localStorage.setItem', 'localStorage.setItem("", "")', 22, 'storage']
    ],
    html: [
      ['div', 'div', 3, 'tag'], ['section', 'section', 7, 'tag'], ['main', 'main', 4, 'tag'],
      ['header', 'header', 6, 'tag'], ['button', 'button', 6, 'tag'], ['input', 'input', 5, 'tag'],
      ['class', 'class=""', 7, 'attribute'], ['id', 'id=""', 4, 'attribute'],
      ['aria-label', 'aria-label=""', 12, 'attribute']
    ],
    css: [
      ['display', 'display: ;', 9, 'property'], ['position', 'position: ;', 10, 'property'],
      ['background', 'background: ;', 12, 'property'], ['color', 'color: ;', 7, 'property'],
      ['padding', 'padding: ;', 9, 'property'], ['margin', 'margin: ;', 8, 'property'],
      ['grid-template-columns', 'grid-template-columns: ;', 23, 'property'],
      ['align-items', 'align-items: center;', 20, 'property'], ['justify-content', 'justify-content: center;', 24, 'property']
    ]
  };

  function isMarkupFile(fileName) {
    return /\.(html?|xhtml|jsx|tsx|vue|svelte|astro)$/i.test(String(fileName || ''));
  }

  function emmetContext(fileName) {
    const extension = String(fileName || '').split('.').pop().toLowerCase();
    if (['html', 'htm', 'xhtml', 'vue', 'svelte', 'astro'].includes(extension)) return { syntax: 'html', type: 'markup' };
    if (['jsx', 'tsx'].includes(extension)) return { syntax: 'jsx', type: 'markup' };
    if (['css', 'scss', 'sass', 'less', 'styl', 'stylus', 'postcss'].includes(extension)) {
      return { syntax: extension === 'styl' ? 'stylus' : extension, type: 'stylesheet' };
    }
    return null;
  }

  function emitInput(editor) {
    editor.dispatchEvent(new Event('input', { bubbles: true }));
  }

  function replaceRange(editor, text, start, end, caretOffset = text.length) {
    editor.setRangeText(text, start, end, 'end');
    const caret = start + caretOffset;
    editor.setSelectionRange(caret, caret);
    emitInput(editor);
  }

  function completeHtmlAttribute(editor, fileName) {
    if (!isMarkupFile(fileName) || editor.selectionStart !== editor.selectionEnd) return false;
    const caret = editor.selectionStart;
    const before = editor.value.slice(0, caret);
    const tagStart = before.lastIndexOf('<');
    const tagEnd = before.lastIndexOf('>');
    if (tagStart <= tagEnd) return false;
    const tagText = before.slice(tagStart + 1);
    if (/^[!/]/.test(tagText) || !/^\S+\s+/.test(tagText)) return false;
    const match = tagText.match(/([:@a-zA-Z_][\w:.-]*)$/);
    if (!match) return false;
    const name = match[1];
    replaceRange(editor, `${name}=""`, caret - name.length, caret, name.length + 2);
    return true;
  }

  function expandEmmet(editor, fileName) {
    const context = emmetContext(fileName);
    if (!context) return false;
    if (editor.selectionStart !== editor.selectionEnd) return false;
    const caret = editor.selectionStart;
    const before = editor.value.slice(0, caret);
    const boilerplate = before.match(/(^|\n)([\t ]*)!$/);
    if (context.syntax === 'html' && boilerplate) {
      const indent = boilerplate[2] || '';
      const cursorMarker = '\uE000';
      const template = [
        '<!DOCTYPE html>', '<html lang="en">', '<head>', '  <meta charset="UTF-8">',
        '  <meta name="viewport" content="width=device-width, initial-scale=1.0">',
        '  <title>Document</title>', '</head>', '<body>', `  ${cursorMarker}`, '</body>', '</html>'
      ].map(line => indent + line).join('\n');
      const markerIndex = template.indexOf(cursorMarker);
      const clean = template.replace(cursorMarker, '');
      replaceRange(editor, clean, caret - 1, caret, markerIndex);
      return true;
    }
    const engine = global.WebDevGymEmmet;
    if (!engine || typeof engine.extract !== 'function' || typeof engine.expand !== 'function') return false;
    let extracted;
    try {
      extracted = engine.extract(editor.value, editor.selectionStart, { type: context.type });
    } catch {
      return false;
    }
    const abbreviation = extracted?.abbreviation || '';
    if (!abbreviation) return false;
    const lineStart = editor.value.lastIndexOf('\n', Math.max(0, extracted.start - 1)) + 1;
    const baseIndent = (editor.value.slice(lineStart, extracted.start).match(/^[\t ]*/) || [''])[0];
    const cursorMarker = '\uE000';
    let cursorPlaced = false;
    let expanded;
    try {
      expanded = engine.expand(abbreviation, {
        syntax: context.syntax,
        type: context.type,
        options: {
          'output.indent': INDENT,
          'output.baseIndent': baseIndent,
          'output.field': (index, placeholder) => {
            if (!cursorPlaced && (index === 1 || !placeholder)) {
              cursorPlaced = true;
              return cursorMarker;
            }
            return placeholder || '';
          }
        }
      });
    } catch {
      return false;
    }
    if (!expanded || expanded.trim() === abbreviation.trim()) return false;
    const markerIndex = expanded.indexOf(cursorMarker);
    const clean = expanded.replace(cursorMarker, '');
    replaceRange(
      editor,
      clean,
      extracted.start,
      extracted.end,
      markerIndex >= 0 ? markerIndex : clean.length
    );
    return true;
  }

  function completionLanguage(fileName) {
    const extension = String(fileName || '').split('.').pop().toLowerCase();
    if (['js', 'mjs', 'cjs', 'jsx', 'ts', 'tsx'].includes(extension)) return 'javascript';
    if (['html', 'htm', 'xhtml', 'vue', 'svelte', 'astro'].includes(extension)) return 'html';
    if (['css', 'scss', 'sass', 'less', 'styl', 'stylus', 'postcss'].includes(extension)) return 'css';
    return '';
  }

  function completionPrefix(editor, language) {
    const before = editor.value.slice(0, editor.selectionStart);
    if (language === 'html') return (before.match(/[a-zA-Z][\w:-]*$/) || [''])[0];
    if (language === 'javascript') return (before.match(/[a-zA-Z_$][\w$]*(?:\.[\w$]*)?$/) || [''])[0];
    return (before.match(/[a-zA-Z-]+$/) || [''])[0];
  }

  function attachAutocomplete(editor, options = {}) {
    if (!editor?.parentElement) return null;
    const popup = document.createElement('div');
    popup.className = 'wdg-code-completions';
    popup.hidden = true;
    popup.setAttribute('role', 'listbox');
    editor.parentElement.appendChild(popup);
    let items = [];
    let selectedIndex = 0;
    let prefix = '';

    const fileName = () => typeof options.fileName === 'function' ? options.fileName() : options.fileName || '';
    const hide = () => {
      popup.hidden = true;
      popup.replaceChildren();
      items = [];
      prefix = '';
    };
    const render = () => {
      popup.innerHTML = items.map((item, index) => `<button type="button" role="option" class="${index === selectedIndex ? 'active' : ''}" data-completion-index="${index}"><span>${item[0]}</span><small>${item[3]}</small></button>`).join('');
    };
    const refresh = () => {
      if (typeof options.disabled === 'function' && options.disabled()) return hide();
      const language = completionLanguage(fileName());
      prefix = completionPrefix(editor, language);
      if (!language || prefix.length < 2 || editor.selectionStart !== editor.selectionEnd) return hide();
      const lower = prefix.toLowerCase();
      items = COMPLETIONS[language].filter(item => item[0].toLowerCase().startsWith(lower)).slice(0, 9);
      if (!items.length || (items.length === 1 && items[0][0] === prefix)) return hide();
      selectedIndex = 0;
      render();
      popup.hidden = false;
    };
    const accept = index => {
      const item = items[index];
      if (!item) return false;
      const start = editor.selectionStart - prefix.length;
      replaceRange(editor, item[1], start, editor.selectionStart, item[2]);
      hide();
      return true;
    };
    const handleKeydown = event => {
      if (typeof options.disabled === 'function' && options.disabled()) return false;
      if (popup.hidden || !items.length) return false;
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault();
        selectedIndex = (selectedIndex + (event.key === 'ArrowDown' ? 1 : items.length - 1)) % items.length;
        render();
        return true;
      }
      if (event.key === 'Tab' || event.key === 'Enter') {
        event.preventDefault();
        return accept(selectedIndex);
      }
      if (event.key === 'Escape') {
        event.preventDefault();
        hide();
        return true;
      }
      return false;
    };
    popup.addEventListener('mousedown', event => {
      const button = event.target.closest('[data-completion-index]');
      if (!button) return;
      event.preventDefault();
      accept(Number(button.dataset.completionIndex));
      editor.focus();
    });
    editor.addEventListener('input', refresh);
    editor.addEventListener('click', refresh);
    editor.addEventListener('blur', () => window.setTimeout(hide, 120));
    return { handleKeydown, refresh, hide };
  }

  function indentSelection(editor, outdent) {
    const value = editor.value;
    const start = editor.selectionStart;
    const end = editor.selectionEnd;
    const lineStart = value.lastIndexOf('\n', Math.max(0, start - 1)) + 1;
    const lineEndIndex = value.indexOf('\n', end);
    const lineEnd = lineEndIndex === -1 ? value.length : lineEndIndex;
    const block = value.slice(lineStart, lineEnd);
    const changed = outdent ? block.replace(/^( {1,2}|\t)/gm, '') : block.replace(/^/gm, INDENT);
    editor.setRangeText(changed, lineStart, lineEnd, 'select');
    editor.setSelectionRange(lineStart, lineStart + changed.length);
    emitInput(editor);
  }

  function smartEnter(editor) {
    const value = editor.value;
    const start = editor.selectionStart;
    const end = editor.selectionEnd;
    const lineStart = value.lastIndexOf('\n', Math.max(0, start - 1)) + 1;
    const lineBefore = value.slice(lineStart, start);
    const indent = (lineBefore.match(/^[\t ]*/) || [''])[0];
    const previous = value[start - 1] || '';
    const next = value[end] || '';
    const betweenPair = OPEN_PAIRS[previous] === next || (previous === '>' && next === '<');
    const opensBlock = /[{[(]$/.test(lineBefore.trimEnd()) || /<[a-z][^<>]*>$/i.test(lineBefore.trimEnd());
    const insertion = betweenPair
      ? `\n${indent}${INDENT}\n${indent}`
      : `\n${indent}${opensBlock ? INDENT : ''}`;
    const caretOffset = betweenPair
      ? 1 + indent.length + INDENT.length
      : insertion.length;
    replaceRange(editor, insertion, start, end, caretOffset);
  }

  function handleKeydown(editor, event, options = {}) {
    if (!editor || event.defaultPrevented || event.ctrlKey || event.metaKey || event.altKey) return false;
    const fileName = options.fileName || '';

    if (event.key === 'Tab') {
      event.preventDefault();
      if (!event.shiftKey && completeHtmlAttribute(editor, fileName)) return true;
      if (!event.shiftKey && editor.selectionStart === editor.selectionEnd && options.expandAbbreviation?.()) return true;
      if (!event.shiftKey && editor.selectionStart === editor.selectionEnd && expandEmmet(editor, fileName)) return true;
      if (!event.shiftKey && editor.selectionStart === editor.selectionEnd) {
        replaceRange(editor, INDENT, editor.selectionStart, editor.selectionEnd);
      } else {
        indentSelection(editor, event.shiftKey);
      }
      return true;
    }

    if (event.key === 'Enter') {
      event.preventDefault();
      if (!event.shiftKey && completeHtmlAttribute(editor, fileName)) return true;
      smartEnter(editor);
      return true;
    }

    if (event.key === '=' && isMarkupFile(fileName) && editor.selectionStart === editor.selectionEnd) {
      const before = editor.value.slice(0, editor.selectionStart);
      const tagStart = before.lastIndexOf('<');
      const tagEnd = before.lastIndexOf('>');
      if (tagStart > tagEnd && !/^[!/]/.test(before.slice(tagStart + 1)) && /[:@\w.-]$/.test(before)) {
        event.preventDefault();
        replaceRange(editor, '=""', editor.selectionStart, editor.selectionEnd, 2);
        return true;
      }
    }

    const nextCharacter = editor.value[editor.selectionStart] || '';
    if (CLOSE_PAIRS.has(event.key) && nextCharacter === event.key && editor.selectionStart === editor.selectionEnd) {
      event.preventDefault();
      editor.setSelectionRange(editor.selectionStart + 1, editor.selectionStart + 1);
      return true;
    }

    if (OPEN_PAIRS[event.key]) {
      event.preventDefault();
      const start = editor.selectionStart;
      const end = editor.selectionEnd;
      const selected = editor.value.slice(start, end);
      const close = OPEN_PAIRS[event.key];
      replaceRange(editor, `${event.key}${selected}${close}`, start, end, selected ? selected.length + 2 : 1);
      return true;
    }

    if (event.key === 'Backspace' && editor.selectionStart === editor.selectionEnd) {
      const caret = editor.selectionStart;
      const previous = editor.value[caret - 1];
      const next = editor.value[caret];
      if (previous && OPEN_PAIRS[previous] === next) {
        event.preventDefault();
        replaceRange(editor, '', caret - 1, caret + 1, 0);
        return true;
      }
    }

    return false;
  }

  const api = Object.freeze({ attachAutocomplete, completeHtmlAttribute, expandEmmet, handleKeydown, indentSelection, smartEnter });
  global.WebDevGymCodeEditor = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
