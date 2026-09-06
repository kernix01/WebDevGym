const { test } = require('node:test');
const assert = require('node:assert/strict');
const engine = require('../js/webdevgym-naming-engine.js');

for (const [description, kind, expected] of [
  ['индекс текущего трека в массиве', 'variable', 'currentTrackIndex'],
  ['Общая сумма расходов', 'variable', 'totalExpenses'],
  ['Все музыкальные треки', 'array', 'tracks'],
  ['Отображает плейлист', 'function', 'renderPlaylist'],
  ['Количество задач', 'variable', 'taskCount'],
  ['выбранный ответ', 'variable', 'selectedAnswer'],
  ['сохраняет настройки', 'function', 'saveSettings'],
  ['форматирует время', 'function', 'formatTime'],
  ['идет загрузка', 'boolean', 'isLoading'],
  ['есть выбранный ответ', 'boolean', 'hasSelectedAnswer'],
  ['index of the current track', 'variable', 'currentTrackIndex'],
  ['all transactions', 'array', 'transactions'],
  ['filter all tasks', 'function', 'filterTasks'],
  ['total expenses', 'constant', 'TOTAL_EXPENSES']
]) {
  test(description, () => {
    for (const english of [true, false]) {
      const [result] = engine.suggestLocal(description, kind, english);
      assert.equal(result.name, expected);
      assert.ok(engine.validName(result.name));
      assert.ok(result.explanation.length > 20);
    }
  });
}
test('unknown description is not disguised as a meaningful name', () => {
  assert.deepEqual(engine.suggestLocal('квантовая сингулярность', 'variable'), []);
  assert.deepEqual(engine.suggestLocal('tracks', 'function'), []);
});
test('AI output is parsed, deduplicated and identifiers are validated', () => {
  const result = engine.parseSuggestions('```json\n' + JSON.stringify({ suggestions: [
    { name: 'currentTrack', explanation: 'One current track.' },
    { name: 'currentTrack', explanation: 'Duplicate.' },
    { name: 'const', explanation: 'Keyword.' },
    { name: '<img>', explanation: 'Markup.' },
    { name: '123name', explanation: 'Starts with number.' },
    { name: 'selectedTrack', explanation: 'Selected track.' }
  ] }) + '\n```');
  assert.deepEqual(result.map(item => item.name), ['currentTrack', 'selectedTrack']);
});
test('malformed and empty AI results rejected', () => {
  for (const value of ['null', '{}', '[]', 'not json', '{"suggestions":[]}', 'x'.repeat(20001)]) {
    assert.throws(() => engine.parseSuggestions(value));
  }
});
test('reserved words and injection are not accepted as identifiers', () => {
  for (const value of ['class', 'await', 'return', '1track', 'track-name', 'a;alert(1)', 'a'.repeat(65)]) assert.equal(engine.validName(value), false);
});
