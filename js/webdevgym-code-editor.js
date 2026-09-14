(function (global) {
  'use strict';

  const INDENT = '  ';
  const OPEN_PAIRS = { '(': ')', '[': ']', '{': '}', '"': '"', "'": "'", '`': '`' };
  const CLOSE_PAIRS = new Set([')', ']', '}', '"', "'", '`']);

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
    const engine = global.WebDevGymEmmet;
    const context = emmetContext(fileName);
    if (!engine || typeof engine.extract !== 'function' || typeof engine.expand !== 'function' || !context) return false;
    if (editor.selectionStart !== editor.selectionEnd) return false;
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

  const api = Object.freeze({ completeHtmlAttribute, expandEmmet, handleKeydown, indentSelection, smartEnter });
  global.WebDevGymCodeEditor = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
