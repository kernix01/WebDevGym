(function () {
  'use strict';

  const runtime = window.WebDevGymRuntime;
  if (!runtime) {
    console.error('[WebDevGym] Shared runtime must load before Studio Suite.');
    return;
  }

  const { isEnglish, L, escapeHtml: esc, icon, readJson, writeJson, download, notify, emit } = runtime;
  const JOURNEY_KEY = 'wdg_project_journey_v1';
  const RECOVERY_KEY = 'wdg_recovery_v1';
  const RECOVERY_LIMIT = 8;
  const labCleanup = new WeakMap();
  let api = null;
  let journeyPage = null;
  let recoveryPage = null;

  const copy = {
    journey: L('Project journey', 'Путь проекта'),
    journeySub: L('Move one project from a lesson to a published portfolio entry.', 'Проведи один проект от темы до опубликованной работы в портфолио.'),
    recovery: L('Recovery center', 'Центр восстановления'),
    recoverySub: L('Local restore points without passwords, API keys or tokens.', 'Локальные точки восстановления без паролей, API-ключей и токенов.'),
    open: L('Open', 'Открыть'),
    continue: L('Continue', 'Продолжить'),
    completed: L('Completed', 'Готово'),
    mark: L('Mark completed', 'Отметить готовым'),
    addPortfolio: L('Add Forge project to portfolio', 'Добавить проект Forge в портфолио'),
    noForge: L('Finish at least one Forge project first.', 'Сначала заверши хотя бы один проект в Forge.'),
    addedPortfolio: L('Project added to the local portfolio.', 'Проект добавлен в локальное портфолио.'),
    snapshot: L('Create restore point', 'Создать точку восстановления'),
    restore: L('Restore', 'Восстановить'),
    remove: L('Delete', 'Удалить'),
    saveFile: L('Download', 'Скачать'),
    noSnapshots: L('No restore points yet.', 'Точек восстановления пока нет.'),
    restored: L('Restore point applied. The page will reload.', 'Точка восстановления применена. Страница будет перезагружена.'),
    created: L('Restore point created.', 'Точка восстановления создана.'),
    confirmRestore: L('Restore this state? Current local data will be overwritten.', 'Восстановить это состояние? Текущие локальные данные будут перезаписаны.'),
    pagesTitle: L('Publish with GitHub Pages', 'Опубликовать через GitHub Pages'),
    pagesTip: L('Turn the uploaded repository into a public website. The token needs Pages and Administration write permissions.', 'Преврати загруженный репозиторий в публичный сайт. Токену нужны права Pages и Administration: write.'),
    pagesSource: L('Publishing source', 'Источник публикации'),
    pagesRoot: L('Repository root', 'Корень репозитория'),
    pagesDocs: L('/docs folder', 'Папка /docs'),
    publish: L('Publish site', 'Опубликовать сайт'),
    publishing: L('Configuring GitHub Pages...', 'Настраиваю GitHub Pages...'),
    published: L('GitHub Pages is configured.', 'GitHub Pages настроен.'),
    pagesMissing: L('Fill in Username, Repository, Token and Branch above.', 'Заполни Username, Repository, Token и ветку выше.'),
    pagesPermission: L('The token needs Pages: write and Administration: write permissions.', 'Токену нужны права Pages: write и Administration: write.'),
    viewSite: L('Open website', 'Открыть сайт')
  };

  function cleanupLab(target) {
    const cleanup = labCleanup.get(target);
    if (cleanup) cleanup();
    labCleanup.delete(target);
  }

  function setLabCleanup(target, cleanup) {
    cleanupLab(target);
    labCleanup.set(target, cleanup);
  }

  const xrayScenarios = [
    {
      id: 'condition',
      title: L('Variables and a condition', 'Переменные и условие'),
      code: [
        'const age = 17;',
        'const hasPermission = true;',
        'let access = "closed";',
        '',
        'if (age >= 18 || hasPermission) {',
        '  access = "open";',
        '}',
        '',
        'console.log(access);'
      ],
      steps: [
        { line:0, vars:{age:17}, stack:['global'], output:[], text:L('A constant named age receives the number 17.', 'Константа age получает число 17.') },
        { line:1, vars:{age:17,hasPermission:true}, stack:['global'], output:[], text:L('The second constant stores a boolean value.', 'Вторая константа хранит логическое значение.') },
        { line:2, vars:{age:17,hasPermission:true,access:'closed'}, stack:['global'], output:[], text:L('let is used because access will be reassigned later.', 'Используется let, потому что access позже изменится.') },
        { line:4, vars:{age:17,hasPermission:true,access:'closed'}, stack:['global','if condition'], output:[], text:L('age >= 18 is false, but hasPermission is true. With || one true side is enough.', 'age >= 18 ложно, но hasPermission истинно. Для || достаточно одной истинной части.') },
        { line:5, vars:{age:17,hasPermission:true,access:'open'}, stack:['global','if block'], output:[], text:L('The condition passed, so access is reassigned.', 'Условие прошло, поэтому access получает новое значение.') },
        { line:8, vars:{age:17,hasPermission:true,access:'open'}, stack:['global','console.log'], output:['open'], text:L('console.log receives the current value: open.', 'console.log получает текущее значение: open.') }
      ]
    },
    {
      id: 'counter',
      title: L('DOM counter click', 'Клик по DOM-счётчику'),
      code: [
        'const count = document.querySelector(".count");',
        'const plus = document.querySelector(".plus");',
        'let score = 0;',
        '',
        'plus.addEventListener("click", () => {',
        '  score += 1;',
        '  count.textContent = score;',
        '});'
      ],
      steps: [
        { line:0, vars:{count:'<output.count>'}, stack:['global'], output:[], text:L('querySelector finds the first .count element and stores its reference.', 'querySelector находит первый элемент .count и сохраняет ссылку на него.') },
        { line:1, vars:{count:'<output.count>',plus:'<button.plus>'}, stack:['global'], output:[], text:L('The button reference is saved once instead of searching on every click.', 'Ссылка на кнопку сохраняется один раз, чтобы не искать её при каждом клике.') },
        { line:2, vars:{count:'<output.count>',plus:'<button.plus>',score:0}, stack:['global'], output:['DOM: 0'], text:L('score is application state. The DOM currently shows the same value.', 'score — состояние приложения. DOM пока показывает то же значение.') },
        { line:4, vars:{score:0,event:'click'}, stack:['global','click handler'], output:['DOM: 0'], text:L('A click places the event handler on the call stack.', 'Клик помещает обработчик события в стек вызовов.') },
        { line:5, vars:{score:1,event:'click'}, stack:['global','click handler'], output:['DOM: 0'], text:L('The state changes first: score becomes 1.', 'Сначала меняется состояние: score становится равен 1.') },
        { line:6, vars:{score:1,event:'click'}, stack:['global','click handler','DOM update'], output:['DOM: 1'], text:L('textContent synchronizes the interface with the new state.', 'textContent синхронизирует интерфейс с новым состоянием.') },
        { line:7, vars:{score:1}, stack:['global'], output:['DOM: 1'], text:L('The handler finishes and leaves the call stack.', 'Обработчик завершается и покидает стек вызовов.') }
      ]
    },
    {
      id: 'event-loop',
      title: L('Event loop order', 'Порядок Event Loop'),
      code: [
        'console.log("A");',
        'setTimeout(() => console.log("B"), 0);',
        'Promise.resolve().then(() => console.log("C"));',
        'console.log("D");'
      ],
      steps: [
        { line:0, vars:{}, stack:['global','console.log'], output:['A'], text:L('Synchronous code runs immediately.', 'Синхронный код выполняется сразу.') },
        { line:1, vars:{timer:'queued'}, stack:['global','setTimeout'], output:['A'], text:L('The timer callback goes to the task queue, even with a zero delay.', 'Колбэк таймера отправляется в очередь задач даже с задержкой 0.') },
        { line:2, vars:{timer:'queued',promise:'microtask'}, stack:['global','Promise.then'], output:['A'], text:L('Promise.then queues a microtask. Microtasks run before timer tasks.', 'Promise.then ставит микрозадачу. Микрозадачи выполняются раньше таймеров.') },
        { line:3, vars:{timer:'queued',promise:'microtask'}, stack:['global','console.log'], output:['A','D'], text:L('The remaining synchronous line runs before either queue.', 'Оставшаяся синхронная строка выполняется раньше обеих очередей.') },
        { line:2, vars:{timer:'queued',promise:'done'}, stack:['microtask','Promise callback'], output:['A','D','C'], text:L('The microtask queue is drained first.', 'Сначала очищается очередь микрозадач.') },
        { line:1, vars:{timer:'done',promise:'done'}, stack:['task','timer callback'], output:['A','D','C','B'], text:L('Only then does the timer callback run.', 'Только после этого выполняется колбэк таймера.') }
      ]
    }
  ];

  const xrayState = { scenario:'condition', step:0, timer:null };

  function renderXray(target) {
    const scenario = xrayScenarios.find(item => item.id === xrayState.scenario) || xrayScenarios[0];
    target.innerHTML = '<section class="wdgs-lab"><header class="wdgs-lab-head"><div><span class="wdgl-kicker">' + icon('tabler:xray',16) + ' Code X-Ray</span><h2>' + esc(scenario.title) + '</h2><p>' + esc(L('Step through code and watch state, stack and output change together.', 'Проходи код по шагам и одновременно наблюдай состояние, стек и вывод.')) + '</p></div><label class="wdgs-select-label"><span>' + esc(L('Scenario','Сценарий')) + '</span><select data-xray-scenario>' + xrayScenarios.map(item => '<option value="' + item.id + '" ' + (item.id===scenario.id?'selected':'') + '>' + esc(item.title) + '</option>').join('') + '</select></label></header>' +
      '<div class="wdgs-xray-grid"><div class="wdgs-code" data-xray-code>' + scenario.code.map((line,index) => '<div data-code-line="' + index + '"><span>' + (index+1) + '</span><code>' + (line ? esc(line) : '&nbsp;') + '</code></div>').join('') + '</div>' +
      '<aside class="wdgs-inspector"><section><h3>' + esc(L('Variables','Переменные')) + '</h3><div data-xray-vars></div></section><section><h3>Call stack</h3><div data-xray-stack></div></section><section><h3>Console</h3><pre data-xray-output></pre></section></aside></div>' +
      '<footer class="wdgs-lab-footer"><div><strong data-xray-progress></strong><p data-xray-explain></p></div><div class="wdgl-actions"><button class="wdgl-btn" data-xray-reset>' + icon('tabler:player-skip-back',15) + esc(L('Reset','Сброс')) + '</button><button class="wdgl-btn" data-xray-prev>' + icon('tabler:chevron-left',15) + esc(L('Back','Назад')) + '</button><button class="wdgl-btn primary" data-xray-next>' + esc(L('Next step','Следующий шаг')) + icon('tabler:chevron-right',15) + '</button><button class="wdgl-btn" data-xray-run>' + icon('tabler:player-play',15) + esc(L('Auto run','Автозапуск')) + '</button></div></footer></section>';

    function paint() {
      const active = scenario.steps[Math.min(xrayState.step, scenario.steps.length - 1)];
      target.querySelectorAll('[data-code-line]').forEach(line => line.classList.toggle('active', Number(line.dataset.codeLine) === active.line));
      target.querySelector('[data-xray-vars]').innerHTML = Object.keys(active.vars).length ? Object.entries(active.vars).map(([name,value]) => '<div class="wdgs-var"><code>' + esc(name) + '</code><span>' + esc(JSON.stringify(value)) + '</span></div>').join('') : '<p class="wdgs-empty">' + esc(L('No variables yet','Переменных пока нет')) + '</p>';
      target.querySelector('[data-xray-stack]').innerHTML = active.stack.slice().reverse().map((item,index) => '<div class="wdgs-stack-frame" style="--depth:' + index + '">' + esc(item) + '</div>').join('');
      target.querySelector('[data-xray-output]').textContent = active.output.length ? active.output.join('\n') : L('No output','Вывода пока нет');
      target.querySelector('[data-xray-progress]').textContent = L('Step ','Шаг ') + (xrayState.step + 1) + ' / ' + scenario.steps.length;
      target.querySelector('[data-xray-explain]').textContent = active.text;
      target.querySelector('[data-xray-prev]').disabled = xrayState.step === 0;
      target.querySelector('[data-xray-next]').disabled = xrayState.step >= scenario.steps.length - 1;
    }

    function stop() {
      clearInterval(xrayState.timer);
      xrayState.timer = null;
      const run = target.querySelector('[data-xray-run]');
      if (run) run.innerHTML = icon('tabler:player-play',15) + esc(L('Auto run','Автозапуск'));
    }

    target.querySelector('[data-xray-scenario]').addEventListener('change', event => {
      stop();
      xrayState.scenario = event.target.value;
      xrayState.step = 0;
      renderXray(target);
    });
    target.querySelector('[data-xray-reset]').addEventListener('click', () => { stop(); xrayState.step = 0; paint(); });
    target.querySelector('[data-xray-prev]').addEventListener('click', () => { stop(); xrayState.step = Math.max(0,xrayState.step-1); paint(); });
    target.querySelector('[data-xray-next]').addEventListener('click', () => { stop(); xrayState.step = Math.min(scenario.steps.length-1,xrayState.step+1); paint(); });
    target.querySelector('[data-xray-run]').addEventListener('click', event => {
      if (xrayState.timer) return stop();
      if (xrayState.step >= scenario.steps.length - 1) xrayState.step = 0;
      event.currentTarget.innerHTML = icon('tabler:player-stop',15) + esc(L('Stop','Стоп'));
      paint();
      xrayState.timer = setInterval(() => {
        if (xrayState.step >= scenario.steps.length - 1) return stop();
        xrayState.step += 1;
        paint();
      }, 720);
    });
    setLabCleanup(target, stop);
    paint();
  }

  const domState = {
    mode:'bubble',
    selected:'button',
    rules:[
      { id:'element', selector:'button', specificity:'0-0-1', weight:1, color:'#38bdf8', enabled:true },
      { id:'class', selector:'.card button', specificity:'0-1-1', weight:11, color:'#c084fc', enabled:true },
      { id:'id', selector:'#saveButton', specificity:'1-0-0', weight:100, color:'#34d399', enabled:true }
    ]
  };

  function renderDomCss(target) {
    const timers = [];
    target.innerHTML = '<section class="wdgs-lab"><header class="wdgs-lab-head"><div><span class="wdgl-kicker">' + icon('tabler:hierarchy-2',16) + ' DOM / CSS Lab</span><h2>' + esc(L('See structure, events and cascade','Увидь структуру, события и каскад')) + '</h2><p>' + esc(L('Click the preview button, switch propagation direction and disable CSS rules.', 'Нажми кнопку в предпросмотре, меняй направление событий и отключай CSS-правила.')) + '</p></div></header>' +
      '<div class="wdgs-dom-grid"><section class="wdgs-dom-panel"><div class="wdgs-panel-title"><h3>DOM tree</h3><div class="wdgs-segment"><button data-event-mode="capture">Capture</button><button data-event-mode="bubble">Bubble</button></div></div><div class="wdgs-dom-tree"><button data-dom-node="app"><span>&lt;main id="app"&gt;</span></button><div><button data-dom-node="card"><span>&lt;article class="card"&gt;</span></button><div><button data-dom-node="button"><span>&lt;button id="saveButton"&gt;</span></button></div></div></div><div class="wdgs-event-log" data-event-log>' + esc(L('Click the button in the preview.','Нажми кнопку в предпросмотре.')) + '</div></section>' +
      '<section class="wdgs-dom-preview"><div class="wdgs-preview-app" data-preview-node="app"><article class="wdgs-preview-card" data-preview-node="card"><span>' + esc(L('Draft project','Черновик проекта')) + '</span><button id="wdgsPreviewButton" data-preview-node="button" type="button">' + esc(L('Save','Сохранить')) + '</button></article></div></section>' +
      '<section class="wdgs-dom-panel"><div class="wdgs-panel-title"><h3>CSS cascade</h3><span class="wdgl-chip" data-css-winner></span></div><div class="wdgs-rule-list">' + domState.rules.map(rule => '<label class="wdgs-css-rule"><input type="checkbox" data-css-rule="' + rule.id + '" ' + (rule.enabled?'checked':'') + '><span><code>' + esc(rule.selector) + '</code><small>specificity ' + rule.specificity + '</small></span><i style="--rule-color:' + rule.color + '"></i></label>').join('') + '</div><p class="wdgs-cascade-note" data-cascade-note></p></section></div></section>';

    function enabledWinner() {
      return domState.rules.filter(rule => rule.enabled).sort((a,b) => a.weight-b.weight).at(-1) || null;
    }

    function paint() {
      target.querySelectorAll('[data-event-mode]').forEach(button => button.classList.toggle('active',button.dataset.eventMode===domState.mode));
      target.querySelectorAll('[data-dom-node]').forEach(button => button.classList.toggle('active',button.dataset.domNode===domState.selected));
      target.querySelectorAll('[data-preview-node]').forEach(node => node.classList.toggle('selected',node.dataset.previewNode===domState.selected));
      const winner = enabledWinner();
      const previewButton = target.querySelector('#wdgsPreviewButton');
      previewButton.style.background = winner?.color || '#334155';
      target.querySelector('[data-css-winner]').textContent = winner ? winner.selector : L('browser default','стили браузера');
      target.querySelector('[data-cascade-note]').textContent = winner
        ? L(`${winner.selector} wins because its specificity ${winner.specificity} is the strongest enabled rule.`, `${winner.selector} побеждает: специфичность ${winner.specificity} выше остальных включённых правил.`)
        : L('All author rules are disabled, so the browser default is visible.', 'Все авторские правила отключены, поэтому виден стиль браузера.');
    }

    function animateEvent() {
      timers.splice(0).forEach(clearTimeout);
      const order = domState.mode === 'capture' ? ['app','card','button'] : ['button','card','app'];
      target.querySelectorAll('[data-preview-node]').forEach(node => node.classList.remove('event-active'));
      const log = target.querySelector('[data-event-log]');
      log.innerHTML = '';
      order.forEach((name,index) => {
        timers.push(setTimeout(() => {
          target.querySelector('[data-preview-node="' + name + '"]')?.classList.add('event-active');
          log.insertAdjacentHTML('beforeend','<span><b>' + (index+1) + '</b>' + esc(name + ' · ' + domState.mode) + '</span>');
        }, index * 260));
        timers.push(setTimeout(() => target.querySelector('[data-preview-node="' + name + '"]')?.classList.remove('event-active'), index * 260 + 520));
      });
    }

    target.querySelectorAll('[data-event-mode]').forEach(button => button.addEventListener('click', () => { domState.mode=button.dataset.eventMode; paint(); }));
    target.querySelectorAll('[data-dom-node]').forEach(button => button.addEventListener('click', () => { domState.selected=button.dataset.domNode; paint(); }));
    target.querySelectorAll('[data-css-rule]').forEach(input => input.addEventListener('change', () => {
      const rule=domState.rules.find(item=>item.id===input.dataset.cssRule);
      if(rule) rule.enabled=input.checked;
      paint();
    }));
    target.querySelector('#wdgsPreviewButton').addEventListener('click', animateEvent);
    setLabCleanup(target, () => timers.forEach(clearTimeout));
    paint();
  }

  const badA11ySample = '<!doctype html>\n<html>\n<head><title>Order</title></head>\n<body>\n  <h1>Checkout</h1>\n  <h3>Contact data</h3>\n  <img src="product.jpg">\n  <input id="email" type="email" placeholder="Email">\n  <button></button>\n  <p style="color:#aaaaaa;background:#ffffff">Important note</p>\n  <a>Continue</a>\n</body>\n</html>';
  const goodA11ySample = '<!doctype html>\n<html lang="en">\n<head><title>Order</title></head>\n<body>\n  <main>\n    <h1>Checkout</h1>\n    <h2>Contact data</h2>\n    <img src="product.jpg" alt="Black running shoes">\n    <label for="email">Email</label>\n    <input id="email" type="email" autocomplete="email">\n    <button type="submit">Send order</button>\n    <p style="color:#334155;background:#ffffff">Important note</p>\n    <a href="/next">Continue</a>\n  </main>\n</body>\n</html>';

  function parseHexColor(value) {
    const match = String(value || '').trim().match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
    if (!match) return null;
    const hex = match[1].length === 3 ? match[1].split('').map(char => char + char).join('') : match[1];
    return [0,2,4].map(index => parseInt(hex.slice(index,index+2),16));
  }

  function luminance(rgb) {
    const channels = rgb.map(value => {
      const channel = value / 255;
      return channel <= .03928 ? channel / 12.92 : Math.pow((channel + .055) / 1.055, 2.4);
    });
    return .2126*channels[0] + .7152*channels[1] + .0722*channels[2];
  }

  function contrastRatio(foreground, background) {
    const first = luminance(foreground);
    const second = luminance(background);
    return (Math.max(first,second)+.05)/(Math.min(first,second)+.05);
  }

  function auditMarkup(markup) {
    const documentCopy = new DOMParser().parseFromString(markup, 'text/html');
    const issues = [];
    const add = (code, title, hint) => issues.push({code,title,hint});
    if (!documentCopy.documentElement.lang) add('lang',L('Page language is missing','Не указан язык страницы'),L('Add lang="en" or lang="ru" to <html>.','Добавь lang="en" или lang="ru" в <html>.'));
    if (!documentCopy.querySelector('main')) add('main',L('No main landmark','Нет основного ориентира main'),L('Wrap the primary page content in <main>.','Оберни основное содержимое страницы в <main>.'));
    documentCopy.querySelectorAll('img').forEach(image => { if (!image.hasAttribute('alt')) add('alt',L('Image has no alt text','У изображения нет alt'),L('Describe useful images or use alt="" for decorative ones.','Опиши полезное изображение или поставь alt="" для декоративного.')); });
    documentCopy.querySelectorAll('input,select,textarea').forEach(field => {
      const labelled = field.getAttribute('aria-label') || field.getAttribute('aria-labelledby') || Array.from(documentCopy.querySelectorAll('label[for]')).some(label => label.htmlFor === field.id) || field.closest('label');
      if (!labelled) add('label',L('Form field has no label','У поля формы нет label'),L('Connect <label for="..."> with the field id.','Свяжи <label for="..."> с id поля.'));
    });
    documentCopy.querySelectorAll('button').forEach(button => { if (!(button.textContent.trim() || button.getAttribute('aria-label'))) add('name',L('Button has no accessible name','У кнопки нет доступного имени'),L('Add visible text or aria-label.','Добавь видимый текст или aria-label.')); });
    documentCopy.querySelectorAll('a').forEach(anchor => { if (!anchor.hasAttribute('href')) add('link',L('Link has no href','У ссылки нет href'),L('Use a button for an action or add a real href for navigation.','Для действия используй button, а для перехода добавь настоящий href.')); });
    const ids = new Set();
    documentCopy.querySelectorAll('[id]').forEach(element => { if (ids.has(element.id)) add('id',L('Duplicate id: ','Повторяющийся id: ') + element.id,L('Every id must be unique on the page.','Каждый id на странице должен быть уникальным.')); ids.add(element.id); });
    let previousHeading = 0;
    documentCopy.querySelectorAll('h1,h2,h3,h4,h5,h6').forEach(heading => {
      const level=Number(heading.tagName.slice(1));
      if(previousHeading && level>previousHeading+1) add('heading',L('Heading level is skipped','Пропущен уровень заголовка'),L(`Use h${previousHeading+1} before h${level}.`,`Используй h${previousHeading+1} перед h${level}.`));
      previousHeading=level;
    });
    documentCopy.querySelectorAll('[tabindex]').forEach(element => { if (Number(element.getAttribute('tabindex')) > 0) add('tabindex',L('Positive tabindex changes natural order','Положительный tabindex ломает естественный порядок'),L('Prefer tabindex="0" or native focus order.','Используй tabindex="0" или естественный порядок фокуса.')); });
    documentCopy.querySelectorAll('[style]').forEach(element => {
      const style=element.getAttribute('style') || '';
      const color=parseHexColor(style.match(/(?:^|;)\s*color\s*:\s*(#[0-9a-f]{3,6})/i)?.[1]);
      const background=parseHexColor(style.match(/background(?:-color)?\s*:\s*(#[0-9a-f]{3,6})/i)?.[1]);
      if(color&&background&&contrastRatio(color,background)<4.5) add('contrast',L('Text contrast is below 4.5:1','Контраст текста ниже 4.5:1'),L('Choose a darker foreground or a lighter background.','Выбери более тёмный текст или более светлый фон.'));
    });
    return issues;
  }

  function renderA11y(target) {
    target.innerHTML = '<section class="wdgs-lab"><header class="wdgs-lab-head"><div><span class="wdgl-kicker">' + icon('tabler:accessible',16) + ' Accessibility Lab</span><h2>' + esc(L('Audit markup before users find the problems','Проверь разметку раньше пользователей')) + '</h2><p>' + esc(L('The audit runs locally with DOMParser. Your code is not uploaded anywhere.', 'Проверка выполняется локально через DOMParser. Код никуда не отправляется.')) + '</p></div><div class="wdgs-a11y-score" data-a11y-score><strong>0</strong><span>/ 100</span></div></header><div class="wdgs-a11y-grid"><section class="wdgs-editor-panel"><div class="wdgs-panel-title"><h3>HTML</h3><div class="wdgl-actions"><button class="wdgl-btn" data-a11y-sample>' + esc(L('Broken sample','Пример с ошибками')) + '</button><button class="wdgl-btn" data-a11y-fix>' + icon('tabler:wand',15) + esc(L('Accessible sample','Доступный пример')) + '</button></div></div><textarea spellcheck="false" data-a11y-code></textarea><button class="wdgl-btn primary" data-a11y-run>' + icon('tabler:scan',15) + esc(L('Run audit','Запустить проверку')) + '</button></section><section class="wdgs-a11y-results"><div class="wdgs-panel-title"><h3>' + esc(L('Findings','Результаты')) + '</h3><span class="wdgl-chip" data-a11y-count></span></div><div data-a11y-results></div></section></div></section>';
    const editor=target.querySelector('[data-a11y-code]');
    editor.value=badA11ySample;

    function run() {
      const issues=auditMarkup(editor.value);
      const score=Math.max(0,100-issues.length*12);
      target.querySelector('[data-a11y-score] strong').textContent=score;
      target.querySelector('[data-a11y-score]').classList.toggle('good',score>=90);
      target.querySelector('[data-a11y-count]').textContent=issues.length ? issues.length + ' ' + L('issues','ошибок') : L('No issues','Ошибок нет');
      target.querySelector('[data-a11y-results]').innerHTML=issues.length ? issues.map(issue => '<article class="wdgs-a11y-issue"><span>' + icon('tabler:alert-triangle',17) + '</span><div><strong>' + esc(issue.title) + '</strong><p>' + esc(issue.hint) + '</p><code>' + esc(issue.code) + '</code></div></article>').join('') : '<div class="wdgs-a11y-clear">' + icon('tabler:circle-check-filled',30) + '<strong>' + esc(L('The checked rules passed.','Проверенные правила пройдены.')) + '</strong></div>';
    }
    target.querySelector('[data-a11y-run]').addEventListener('click',run);
    target.querySelector('[data-a11y-sample]').addEventListener('click',()=>{editor.value=badA11ySample;run();});
    target.querySelector('[data-a11y-fix]').addEventListener('click',()=>{editor.value=goodA11ySample;run();});
    setLabCleanup(target,()=>{});
    run();
  }

  window.WebDevGymStudioLabs = {
    render(id, target) {
      if (!target) return;
      if (id === 'xray') renderXray(target);
      if (id === 'domcss') renderDomCss(target);
      if (id === 'a11y') renderA11y(target);
    },
    destroy(target) { if (target) cleanupLab(target); }
  };

  function journeyState() {
    return readJson(JOURNEY_KEY,{manual:{},githubUrl:'',updatedAt:0});
  }

  function saveJourney(state) {
    state.updatedAt=Date.now();
    writeJson(JOURNEY_KEY,state);
    emit('journey-updated',state);
  }

  function forgeSummary() {
    if (window.WebDevGymForge?.current) return window.WebDevGymForge.current();
    const data=readJson('wdg_forge_v1',{workspaces:{},activeProject:'counter'});
    const entries=Object.entries(data.workspaces||{});
    const completed=entries.find(([,work])=>work?.completedAt);
    return completed ? {id:completed[0],title:completed[0],completed:true} : null;
  }

  function derivedJourney() {
    const state=journeyState();
    const lab=readJson('wdg_lab_v1',{examHistory:[]});
    const portfolio=readJson('wdg_portfolio_v1',[]);
    const completedTopic=Object.keys(localStorage).some(key=>key.startsWith('prog_')&&localStorage.getItem(key)==='1');
    const forge=forgeSummary();
    return {
      state,
      forge,
      status:{
        learn:Boolean(state.manual.learn||completedTopic),
        practice:Boolean(state.manual.practice||(lab.examHistory||[]).length),
        forge:Boolean(state.manual.forge||forge?.completed),
        github:Boolean(state.manual.github||state.githubUrl),
        portfolio:Boolean(state.manual.portfolio||portfolio.length)
      }
    };
  }

  const journeySteps = [
    {id:'learn',icon:'tabler:book-2',title:L('Understand one topic','Разобрать одну тему'),text:L('Read the explanation and complete its checklist.','Прочитай объяснение и выполни чек-лист.'),action:L('Open next topic','Открыть следующую тему')},
    {id:'practice',icon:'tabler:flask-2',title:L('Check understanding','Проверить понимание'),text:L('Use a trainer instead of copying a finished answer.','Используй тренажёр вместо копирования готового ответа.'),action:L('Open Code X-Ray','Открыть Code X-Ray')},
    {id:'forge',icon:'tabler:hammer',title:L('Build the feature','Собрать функцию'),text:L('Finish a Forge project and pass every acceptance check.','Заверши проект Forge и пройди все критерии.'),action:L('Open Forge','Открыть Forge')},
    {id:'github',icon:'tabler:brand-github',title:L('Publish the source','Опубликовать исходники'),text:L('Upload the project and enable GitHub Pages.','Загрузи проект и включи GitHub Pages.'),action:L('Open GitHub','Открыть GitHub')},
    {id:'portfolio',icon:'tabler:user-star',title:L('Show the result','Показать результат'),text:L('Add the finished project and its public link to your portfolio.','Добавь завершённый проект и публичную ссылку в портфолио.'),action:L('Open portfolio','Открыть портфолио')}
  ];

  function openJourneyStep(id) {
    if(id==='learn') {
      const topic=window.WebDevGymGrowth?.chooseLearn?.();
      if(topic) window.WebDevGymGrowth.openTopic(topic);
      else if(typeof window.switchTab==='function') window.switchTab('html');
    }
    if(id==='practice') window.WebDevGymLab?.open?.('xray');
    if(id==='forge') window.WebDevGymForge?.open?.();
    if(id==='github') { api?.close?.(); if(typeof window.switchTab==='function') window.switchTab('github'); }
    if(id==='portfolio') api?.open?.('profile');
  }

  function addForgeToPortfolio() {
    const summary=forgeSummary();
    if(!summary?.completed) return notify(copy.noForge);
    const list=readJson('wdg_portfolio_v1',[]);
    if(!list.some(item=>item.forgeProjectId===summary.id)) {
      list.unshift({title:summary.title||summary.id,description:summary.description||L('Project completed and tested in WebDevGym Forge.','Проект собран и проверен в WebDevGym Forge.'),link:journeyState().githubUrl||'',stack:'HTML, CSS, JavaScript',createdAt:Date.now(),forgeProjectId:summary.id});
      writeJson('wdg_portfolio_v1',list.slice(0,30));
    }
    const state=journeyState();state.manual.portfolio=true;saveJourney(state);
    notify(copy.addedPortfolio);
    api.open('journey');
  }

  function renderJourney() {
    const current=derivedJourney();
    const done=journeySteps.filter(step=>current.status[step.id]).length;
    const body='<div class="wdgs-journey-summary"><div><strong>' + done + ' / ' + journeySteps.length + '</strong><span>' + esc(L('project stages','этапов проекта')) + '</span></div><div class="wdgs-journey-progress"><span style="width:' + (done/journeySteps.length*100) + '%"></span></div><button class="wdgf-btn primary" data-journey-continue>' + icon('tabler:player-play',15) + copy.continue + '</button></div><div class="wdgs-journey-list">' + journeySteps.map((step,index)=>'<article class="wdgs-journey-step ' + (current.status[step.id]?'complete':'') + '"><div class="wdgs-journey-index">' + (current.status[step.id]?icon('tabler:check',18):index+1) + '</div><div class="wdgs-journey-copy"><span>' + icon(step.icon,18) + esc(step.title) + '</span><p>' + esc(step.text) + '</p></div><div class="wdgs-journey-actions"><button class="wdgf-btn" data-journey-open="' + step.id + '">' + esc(step.action) + '</button><label><input type="checkbox" data-journey-mark="' + step.id + '" ' + (current.status[step.id]?'checked':'') + '> <span>' + esc(copy.mark) + '</span></label></div></article>').join('') + '</div><section class="wdgf-panel wdgs-journey-finish"><div class="wdgf-panel-body"><div><h2>' + esc(L('Finish the loop','Замкни цикл')) + '</h2><p>' + esc(L('A completed Forge project can become a portfolio item without retyping its title and stack.', 'Завершённый проект Forge можно перенести в портфолио без повторного ввода названия и стека.')) + '</p></div><button class="wdgf-btn" data-journey-portfolio>' + icon('tabler:user-plus',16) + copy.addPortfolio + '</button></div></section>';
    journeyPage=api.pageShell('journey',copy.journey,copy.journeySub,body);
    journeyPage.querySelectorAll('[data-journey-open]').forEach(button=>button.addEventListener('click',()=>openJourneyStep(button.dataset.journeyOpen)));
    journeyPage.querySelectorAll('[data-journey-mark]').forEach(input=>input.addEventListener('change',()=>{const state=journeyState();state.manual[input.dataset.journeyMark]=input.checked;saveJourney(state);api.open('journey');}));
    journeyPage.querySelector('[data-journey-continue]').addEventListener('click',()=>{const next=journeySteps.find(step=>!current.status[step.id])||journeySteps.at(-1);openJourneyStep(next.id);});
    journeyPage.querySelector('[data-journey-portfolio]').addEventListener('click',addForgeToPortfolio);
    return journeyPage;
  }

  function snapshotHash(storage) {
    const source=JSON.stringify(storage);
    let hash=2166136261;
    for(let index=0;index<source.length;index+=1){hash^=source.charCodeAt(index);hash=Math.imul(hash,16777619);}
    return (hash>>>0).toString(16);
  }

  function snapshots() {
    const value=readJson(RECOVERY_KEY,[]);
    return Array.isArray(value)?value:[];
  }

  function createSnapshot(reason='manual',silent=false) {
    const storage=runtime.safeStorageSnapshot();
    const list=snapshots();
    const hash=snapshotHash(storage);
    if(list[0]?.hash===hash) return list[0];
    const snapshot={id:'restore-'+Date.now().toString(36),createdAt:Date.now(),reason,hash,storage};
    list.unshift(snapshot);
    writeJson(RECOVERY_KEY,list.slice(0,RECOVERY_LIMIT));
    if(!silent) notify(copy.created);
    emit('recovery-created',{id:snapshot.id,reason});
    return snapshot;
  }

  function restoreSnapshot(id) {
    const snapshot=snapshots().find(item=>item.id===id);
    if(!snapshot||!confirm(copy.confirmRestore))return;
    createSnapshot('before-restore',true);
    runtime.restoreStorageSnapshot(snapshot.storage);
    notify(copy.restored);
    setTimeout(()=>location.reload(),500);
  }

  function renderRecovery() {
    const list=snapshots();
    const body='<div class="wdgs-recovery-head"><button class="wdgf-btn primary" data-recovery-create>' + icon('tabler:device-floppy',16) + copy.snapshot + '</button><span>' + esc(L('Up to eight local restore points. Sensitive keys are always excluded.','До восьми локальных точек. Секретные ключи всегда исключаются.')) + '</span></div><div class="wdgs-recovery-list">' + (list.length?list.map(item=>{const size=new Blob([JSON.stringify(item.storage)]).size;return '<article><div class="wdgs-recovery-icon">' + icon(item.reason==='manual'?'tabler:bookmark':'tabler:clock-shield',20) + '</div><div><strong>' + esc(new Date(item.createdAt).toLocaleString(isEnglish?'en-US':'ru-RU')) + '</strong><span>' + esc(item.reason) + ' · ' + Math.max(1,Math.round(size/1024)) + ' KB · ' + Object.keys(item.storage||{}).length + ' keys</span></div><div class="wdgl-actions"><button class="wdgf-btn" data-recovery-restore="' + item.id + '">' + copy.restore + '</button><button class="wdgf-btn" data-recovery-download="' + item.id + '" title="' + copy.saveFile + '">' + icon('tabler:download',16) + '</button><button class="wdgf-btn danger" data-recovery-remove="' + item.id + '" title="' + copy.remove + '">' + icon('tabler:trash',16) + '</button></div></article>';}).join(''):'<div class="wdgf-empty">' + esc(copy.noSnapshots) + '</div>') + '</div>';
    recoveryPage=api.pageShell('recovery',copy.recovery,copy.recoverySub,body);
    recoveryPage.querySelector('[data-recovery-create]').addEventListener('click',()=>{createSnapshot();api.open('recovery');});
    recoveryPage.querySelectorAll('[data-recovery-restore]').forEach(button=>button.addEventListener('click',()=>restoreSnapshot(button.dataset.recoveryRestore)));
    recoveryPage.querySelectorAll('[data-recovery-download]').forEach(button=>button.addEventListener('click',()=>{const item=snapshots().find(snapshot=>snapshot.id===button.dataset.recoveryDownload);if(item)download(JSON.stringify({app:'WebDevGym',version:61,type:'restore-point',...item},null,2),'webdevgym-restore-'+item.id+'.json');}));
    recoveryPage.querySelectorAll('[data-recovery-remove]').forEach(button=>button.addEventListener('click',()=>{writeJson(RECOVERY_KEY,snapshots().filter(item=>item.id!==button.dataset.recoveryRemove));api.open('recovery');}));
    return recoveryPage;
  }

  async function githubPagesRequest(url,token,options={}) {
    const response=await fetch(url,{...options,headers:{Authorization:'Bearer '+token,Accept:'application/vnd.github+json','Content-Type':'application/json','X-GitHub-Api-Version':'2022-11-28',...(options.headers||{})}});
    const result=response.status===204?{}:await response.json().catch(()=>({}));
    if(!response.ok){const error=new Error(result.message||'GitHub API: '+response.status);error.status=response.status;throw error;}
    return result;
  }

  async function publishPages(panel) {
    const username=document.getElementById('gh-username')?.value.trim();
    const repo=document.getElementById('gh-repo')?.value.trim();
    const token=document.getElementById('gh-token')?.value.trim();
    const branch=document.getElementById('gh-branch')?.value.trim()||'main';
    const path=panel.querySelector('[data-pages-path]').value;
    const status=panel.querySelector('[data-pages-status]');
    const button=panel.querySelector('[data-pages-publish]');
    if(!username||!repo||!token)return void(status.textContent=copy.pagesMissing);
    button.disabled=true;status.className='wdgs-pages-status progress';status.textContent=copy.publishing;
    const url='https://api.github.com/repos/'+encodeURIComponent(username)+'/'+encodeURIComponent(repo)+'/pages';
    try{
      let existing=null;
      try{existing=await githubPagesRequest(url,token);}catch(error){if(error.status!==404)throw error;}
      const payload=JSON.stringify({build_type:'legacy',source:{branch,path}});
      const result=await githubPagesRequest(url,token,{method:existing?'PUT':'POST',body:payload});
      const info=result.html_url?result:await githubPagesRequest(url,token);
      const siteUrl=info.html_url||('https://'+username.toLowerCase()+'.github.io/'+repo.replace(/\.github\.io$/i,'')+'/');
      status.className='wdgs-pages-status success';
      status.innerHTML='<strong>'+esc(copy.published)+'</strong><a href="'+esc(siteUrl)+'" target="_blank" rel="noopener">'+icon('tabler:external-link',15)+esc(copy.viewSite)+'</a>';
      const state=journeyState();state.githubUrl=siteUrl;state.manual.github=true;saveJourney(state);
      emit('pages-published',{username,repo,branch,path,url:siteUrl});
    }catch(error){status.className='wdgs-pages-status error';status.textContent=(error.status===403?copy.pagesPermission:error.message);}
    finally{button.disabled=false;}
  }

  function enhanceGithubPages() {
    const block=document.getElementById('block-git-github-upload');
    if(!block||document.getElementById('wdgsGithubPages'))return false;
    const panel=document.createElement('div');
    panel.id='wdgsGithubPages';panel.className='wdgs-pages-panel';
    panel.innerHTML='<div class="wdgs-pages-copy"><span>'+icon('tabler:world-upload',22)+'</span><div><h3>'+esc(copy.pagesTitle)+'</h3><p>'+esc(copy.pagesTip)+'</p></div></div><div class="wdgs-pages-controls"><label><span>'+esc(copy.pagesSource)+'</span><select data-pages-path><option value="/">'+esc(copy.pagesRoot)+'</option><option value="/docs">'+esc(copy.pagesDocs)+'</option></select></label><button class="wdgf-btn primary" data-pages-publish>'+icon('tabler:rocket',16)+esc(copy.publish)+'</button></div><div class="wdgs-pages-status" data-pages-status></div>';
    block.insertAdjacentElement('afterend',panel);
    panel.querySelector('[data-pages-publish]').addEventListener('click',()=>publishPages(panel));
    return true;
  }

  function installNavigation() {
    runtime.createNavigationButton({id:'wdgsJourneyNav',feature:'journey',icon:'tabler:route-2',label:copy.journey,after:'#wdgGrowthNavBtn',onClick:()=>api.open('journey')});
    runtime.createNavigationButton({id:'wdgsRecoveryNav',feature:'recovery',icon:'tabler:restore',label:copy.recovery,after:'#wdgfProfileBtn',onClick:()=>api.open('recovery')});
  }

  function installAutomaticRecovery() {
    setTimeout(()=>{
      const list=snapshots();
      const stale=!list[0]||Date.now()-list[0].createdAt>6*60*60*1000;
      if(stale)createSnapshot('automatic',true);
    },1800);
    document.addEventListener('webdevgym:before-import',()=>createSnapshot('before-import',true));
  }

  function init(features) {
    api=features;
    api.register('journey',renderJourney,{title:copy.journey,icon:'tabler:route-2',group:L('Learning','Обучение')});
    api.register('recovery',renderRecovery,{title:copy.recovery,icon:'tabler:restore',group:L('System','Система')});
    installNavigation();
    installAutomaticRecovery();
    if(!enhanceGithubPages()){
      let attempts=0;const timer=setInterval(()=>{attempts+=1;if(enhanceGithubPages()||attempts>50)clearInterval(timer);},100);
    }
    document.addEventListener('webdevgym:github-uploaded',event=>{const state=journeyState();state.manual.github=true;state.lastCommit=event.detail?.commitUrl||'';saveJourney(state);});
    document.addEventListener('webdevgym:forge-complete',()=>{const state=journeyState();state.manual.forge=true;saveJourney(state);});
    window.WebDevGymStudioSuite={openJourney:()=>api.open('journey'),openRecovery:()=>api.open('recovery'),createSnapshot};
  }

  runtime.waitForFeatures(init);
})();
