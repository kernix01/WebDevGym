(function () {
  'use strict';

  const isEnglish = document.documentElement.lang.toLowerCase().startsWith('en') || /index-en\.html$/i.test(location.pathname);
  const L = (en, ru) => isEnglish ? en : ru;
  const STORE_KEY = isEnglish ? 'wdg_mastery_en_v1' : 'wdg_mastery_ru_v1';
  const PATH_KEY = isEnglish ? 'wdg_active_path_en_v1' : 'wdg_active_path_ru_v1';
  const CHECKPOINT_KEY = isEnglish ? 'wdg_checkpoints_en_v1' : 'wdg_checkpoints_ru_v1';
  const COURSE_SECTIONS = ['html','css','js','ts','react','git','node','sql','devops','linux','pg','vite'];
  const LEVELS = [
    { value:0, label:L('Not started','Не начато'), short:'0' },
    { value:1, label:L('Read','Прочитал'), short:'1' },
    { value:2, label:L('Understood','Понял'), short:'2' },
    { value:3, label:L('With a hint','С подсказкой'), short:'3' },
    { value:4, label:L('Independently','Самостоятельно'), short:'4' }
  ];

  const copy = {
    title:L('Learning paths','Маршруты'),
    subtitle:L('Choose a goal and move through topics in a deliberate order.','Выбери цель и проходи темы в осмысленном порядке.'),
    nav:L('Paths','Маршруты'),
    mastery:L('Mastery','Владение темой'),
    level:L('Current level','Текущий уровень'),
    due:L('Review is due','Пора повторить'),
    active:L('Active path','Активный маршрут'),
    choose:L('Choose path','Выбрать маршрут'),
    continue:L('Continue','Продолжить'),
    open:L('Open topic','Открыть тему'),
    progress:L('Path progress','Прогресс маршрута'),
    checkpoint:L('Section checkpoint','Практический рубеж'),
    checkpointText:L('Build the task without copying the lesson example. Mark it only after you can explain every important line.','Собери задачу без копирования примера из урока. Отмечай только когда можешь объяснить каждую важную строку.'),
    done:L('Completed independently','Сделано самостоятельно'),
    openForge:L('Practice in Forge','Практика в Forge'),
    criteria:L('Ready when','Готово, когда'),
    noTopic:L('The closest section will open. Choose the matching topic inside it.','Откроется ближайший раздел. Выбери подходящую тему внутри него.'),
    stats:L('Mastered independently','Самостоятельно освоено')
  };

  const paths = [
    {
      id:'frontend', icon:'tabler:code',
      title:L('Frontend from zero','Frontend с нуля'),
      description:L('A direct route from page structure to browser logic and Git.','Прямой путь от структуры страницы до логики в браузере и Git.'),
      steps:[
        step('html',0,'HTML structure','Структура HTML',/doctype|структур|page structure/i),
        step('css',0,'CSS selectors and box model','Селекторы и блочная модель',/selector|селектор|box model|блочн/i),
        step('css',4,'Flexbox and responsive layout','Flexbox и адаптив',/flex|адаптив|responsive/i),
        step('js',0,'Variables and data types','Переменные и типы данных',/переменн|variable|let|const/i),
        step('js',2,'Conditions and comparison','Условия и сравнение',/услов|condition|\bif\b|\belse\b/i),
        step('js',8,'DOM and events','DOM и события',/dom|event|событ|queryselector/i),
        step('js',12,'Storage and persistence','Хранение состояния',/localstorage|storage|хранил/i),
        step('git',0,'Git basics','Основа Git',/commit|репозитор|repository|git/i)
      ]
    },
    {
      id:'freelance', icon:'tabler:briefcase-2',
      title:L('Freelance ready','Готовность к фрилансу'),
      description:L('The minimum practical stack for small client fixes and interface features.','Минимальный практический стек для небольших клиентских правок и интерфейсных функций.'),
      steps:[
        step('html',3,'Forms and accessible fields','Формы и доступные поля',/form|форм/i),
        step('css',4,'Responsive layout','Адаптивная верстка',/media|адаптив|responsive/i),
        step('js',8,'DOM selectors','DOM-селекторы',/queryselector|dom|селектор/i),
        step('js',9,'Events and form submit','События и submit формы',/event|submit|событ/i),
        step('js',12,'Saving user choices','Сохранение выбора',/localstorage|storage/i),
        step('git',1,'Safe changes with Git','Безопасные изменения через Git',/branch|commit|ветк/i)
      ]
    },
    {
      id:'react', icon:'tabler:brand-react',
      title:L('Route to React','Путь к React'),
      description:L('Strengthen JavaScript first, then add TypeScript, tooling and React.','Сначала укрепи JavaScript, затем добавь TypeScript, сборку и React.'),
      steps:[
        step('js',5,'Functions','Функции',/function|функц/i),
        step('js',6,'Arrays and transformations','Массивы и преобразования',/array|массив|map|filter/i),
        step('js',11,'Async code and fetch','Асинхронность и fetch',/async|fetch|promise|асинхрон/i),
        step('ts',0,'Types and interfaces','Типы и интерфейсы',/type|interface|тип|интерфейс/i),
        step('vite',0,'Vite and modules','Vite и модули',/vite|module|модул/i),
        step('react',0,'Components and props','Компоненты и props',/component|компонент|props/i),
        step('react',2,'State and effects','Состояние и эффекты',/state|effect|состояни|эффект/i)
      ]
    },
    {
      id:'js-review', icon:'tabler:brand-javascript',
      title:L('JavaScript review','Повторение JavaScript'),
      description:L('A compact cycle for rebuilding the foundation from memory.','Короткий цикл для восстановления базы по памяти.'),
      steps:[
        step('js',0,'Variables','Переменные',/variable|переменн|let|const/i),
        step('js',2,'Conditions','Условия',/condition|услов|\bif\b|\belse\b/i),
        step('js',3,'Loops','Циклы',/loop|цикл|for|while/i),
        step('js',4,'Arrays','Массивы',/array|массив/i),
        step('js',5,'Functions','Функции',/function|функц/i),
        step('js',8,'DOM','DOM',/dom|queryselector/i),
        step('js',9,'Events','События',/event|событ|submit|click/i),
        step('js',12,'localStorage','localStorage',/localstorage|storage/i)
      ]
    }
  ];

  const checkpointTasks = {
    html:[L('Create a semantic article page with navigation, image, list and feedback form.','Собери семантическую страницу статьи: навигация, изображение, список и форма обратной связи.'), L('The structure remains clear without CSS; every input has a label; the image has useful alt text.','Структура понятна без CSS; у каждого поля есть label; у изображения полезный alt.')],
    css:[L('Style one responsive interface block for desktop and a 390 px phone.','Оформи один адаптивный интерфейсный блок для компьютера и телефона шириной 390 px.'), L('No horizontal scroll; spacing comes from gap/padding; focus and hover states are visible.','Нет горизонтального скролла; отступы сделаны через gap/padding; focus и hover заметны.')],
    js:[L('Build a form that rejects an empty value, renders a result and clears only after success.','Собери форму: пустое значение не принимается, результат выводится на страницу, поле очищается только после успеха.'), L('The logic uses submit, trim, one render point and no page reload.','Логика использует submit, trim, одну точку обновления и не перезагружает страницу.')],
    ts:[L('Describe a user object, a function argument and its return value with TypeScript.','Опиши через TypeScript объект пользователя, аргумент функции и возвращаемое значение.'), L('There is no any; invalid input produces a type error; names explain the domain.','Нет any; неверные данные дают ошибку типов; имена объясняют предметную область.')],
    react:[L('Build a small controlled form component with a list and an empty state.','Собери небольшой компонент с управляемой формой, списком и пустым состоянием.'), L('State is not mutated; list items have stable keys; submit behavior is predictable.','State не мутируется; у элементов стабильные key; submit работает предсказуемо.')],
    git:[L('Create a feature branch, make two meaningful commits and inspect the diff before merge.','Создай ветку функции, сделай два осмысленных коммита и проверь diff перед слиянием.'), L('Commit messages explain intent; unrelated changes are absent; the main branch stays clean.','Коммиты объясняют цель; лишних изменений нет; основная ветка остается чистой.')]
  };

  let api = null;
  let activePathId = localStorage.getItem(PATH_KEY) || 'frontend';

  function step(section, index, en, ru, match) {
    return { section, index, title:L(en,ru), match };
  }

  function icon(name, size) {
    return '<iconify-icon icon="' + name + '" width="' + (size || 18) + '" height="' + (size || 18) + '"></iconify-icon>';
  }

  function escapeHtml(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[char]);
  }

  function readJson(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key) || 'null') || fallback; } catch (error) { return fallback; }
  }

  function writeJson(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (error) {}
  }

  function blockTitle(block) {
    const node = block.querySelector('.block-title, h2, h3');
    if (!node) return L('Untitled topic','Тема без названия');
    const clone = node.cloneNode(true);
    clone.querySelectorAll('button,.badge,.anchor-icon,.wdgf-deep-actions,.wdg-mastery').forEach(item => item.remove());
    return clone.textContent.replace(/\s+/g,' ').trim();
  }

  function topics() {
    return COURSE_SECTIONS.flatMap(sectionId => {
      const section = document.getElementById('sec-' + sectionId);
      if (!section) return [];
      return Array.from(section.querySelectorAll(':scope > .block')).map((block,index) => ({
        id:sectionId + '-' + index,
        sectionId,
        index,
        block,
        title:blockTitle(block),
        search:(blockTitle(block) + ' ' + (block.querySelector('pre,code')?.textContent || '')).toLowerCase()
      }));
    });
  }

  function state() {
    return readJson(STORE_KEY, {});
  }

  function mastery(id) {
    const value = state()[id];
    return value && typeof value === 'object' ? value : { level:0, updatedAt:0 };
  }

  function setMastery(id, level) {
    const data = state();
    data[id] = { level:Math.max(0,Math.min(4,Number(level) || 0)), updatedAt:Date.now() };
    writeJson(STORE_KEY, data);
    document.querySelectorAll('[data-mastery-id="' + CSS.escape(id) + '"]').forEach(control => paintMastery(control, data[id]));
    document.dispatchEvent(new CustomEvent('wdg:mastery-change', { detail:{ id, ...data[id] } }));
    refreshOpenPaths();
  }

  function isDue(value) {
    return value.level > 0 && value.level < 4 && value.updatedAt > 0 && Date.now() - value.updatedAt > 7 * 86400000;
  }

  function paintMastery(control, value) {
    control.querySelectorAll('[data-mastery-level]').forEach(button => {
      const selected = Number(button.dataset.masteryLevel) === Number(value.level || 0);
      button.classList.toggle('active', selected);
      button.setAttribute('aria-pressed', String(selected));
    });
    const label = control.querySelector('[data-mastery-label]');
    if (label) label.textContent = isDue(value) ? copy.due : LEVELS[value.level || 0].label;
    control.classList.toggle('due', isDue(value));
  }

  function masteryControl(topic) {
    const value = mastery(topic.id);
    const root = document.createElement('div');
    root.className = 'wdg-mastery';
    root.dataset.masteryId = topic.id;
    root.innerHTML = '<div class="wdg-mastery-copy"><span>' + copy.mastery + '</span><strong data-mastery-label></strong></div><div class="wdg-mastery-levels" role="group" aria-label="' + copy.level + '">' + LEVELS.map(item => '<button type="button" data-mastery-level="' + item.value + '" title="' + escapeHtml(item.label) + '" aria-label="' + escapeHtml(item.label) + '">' + item.short + '</button>').join('') + '</div>';
    root.querySelectorAll('[data-mastery-level]').forEach(button => button.addEventListener('click', event => {
      event.stopPropagation();
      setMastery(topic.id, Number(button.dataset.masteryLevel));
    }));
    paintMastery(root, value);
    return root;
  }

  function enhanceMastery() {
    topics().forEach(topic => {
      if (topic.block.querySelector(':scope > .wdg-mastery')) return;
      topic.block.appendChild(masteryControl(topic));
    });
    enhanceCheckpoints();
  }

  function findTopic(routeStep) {
    const list = topics().filter(topic => topic.sectionId === routeStep.section);
    return list.find(topic => routeStep.match?.test(topic.title.toLowerCase()))
      || list.find(topic => routeStep.match?.test(topic.search))
      || list[routeStep.index]
      || list[0]
      || null;
  }

  function openTopic(topic) {
    if (!topic) return;
    api?.close?.();
    if (typeof window.switchTabByName === 'function') window.switchTabByName(topic.sectionId);
    setTimeout(() => {
      topic.block.scrollIntoView({ behavior:'smooth', block:'start' });
      topic.block.classList.add('wdg-growth-target');
      setTimeout(() => topic.block.classList.remove('wdg-growth-target'), 1500);
    }, 100);
  }

  function pathProgress(path) {
    const values = path.steps.map(item => mastery(findTopic(item)?.id || '').level || 0);
    const total = values.reduce((sum,value) => sum + value,0);
    return { percent:Math.round(total / Math.max(1,path.steps.length * 4) * 100), independent:values.filter(value => value === 4).length };
  }

  function renderPaths() {
    const path = paths.find(item => item.id === activePathId) || paths[0];
    const body = '<div class="wdg-growth-layout"><aside class="wdg-growth-paths">' + paths.map(item => {
      const progress = pathProgress(item);
      return '<button type="button" class="wdg-growth-path-card ' + (item.id === path.id ? 'active' : '') + '" data-growth-path="' + item.id + '"><span>' + icon(item.icon,20) + '</span><div><strong>' + escapeHtml(item.title) + '</strong><small>' + progress.percent + '%</small></div><i><b style="width:' + progress.percent + '%"></b></i></button>';
    }).join('') + '</aside><main class="wdg-growth-route"><header><div><span>' + (path.id === activePathId ? copy.active : copy.choose) + '</span><h2>' + escapeHtml(path.title) + '</h2><p>' + escapeHtml(path.description) + '</p></div><div class="wdg-growth-score"><strong>' + pathProgress(path).independent + '/' + path.steps.length + '</strong><span>' + copy.stats + '</span></div></header><ol class="wdg-growth-steps">' + path.steps.map((item,index) => {
      const topic = findTopic(item);
      const value = mastery(topic?.id || '');
      return '<li class="level-' + value.level + '"><span class="wdg-growth-step-number">' + (index + 1) + '</span><div><small>' + item.section.toUpperCase() + '</small><strong>' + escapeHtml(topic?.title || item.title) + '</strong><span>' + (topic ? LEVELS[value.level].label : copy.noTopic) + '</span></div><button class="wdgf-btn" type="button" data-growth-open="' + escapeHtml(topic?.id || item.section + '-0') + '">' + icon('tabler:arrow-up-right',15) + ' ' + copy.open + '</button></li>';
    }).join('') + '</ol></main></div>';
    const page = api.pageShell('paths', copy.title, copy.subtitle, body);
    page.querySelectorAll('[data-growth-path]').forEach(button => button.addEventListener('click', () => {
      activePathId = button.dataset.growthPath;
      localStorage.setItem(PATH_KEY, activePathId);
      renderPaths();
    }));
    page.querySelectorAll('[data-growth-open]').forEach(button => button.addEventListener('click', () => {
      const topic = topics().find(item => item.id === button.dataset.growthOpen);
      openTopic(topic);
    }));
    return page;
  }

  function refreshOpenPaths() {
    if (document.querySelector('.wdgf-feature-page[data-feature-page="paths"].open')) renderPaths();
  }

  function checkpointData(sectionId) {
    return checkpointTasks[sectionId] || [
      L('Build one small example that combines the three most important ideas from this section.','Собери один небольшой пример, который объединяет три главные идеи раздела.'),
      L('It works after reload, has no console errors and you can explain every step.','Он работает после перезагрузки, не дает ошибок в консоли, и ты можешь объяснить каждый шаг.')
    ];
  }

  function enhanceCheckpoints() {
    const completed = readJson(CHECKPOINT_KEY, {});
    COURSE_SECTIONS.forEach(sectionId => {
      const section = document.getElementById('sec-' + sectionId);
      if (!section || section.querySelector(':scope > .wdg-growth-checkpoint')) return;
      const data = checkpointData(sectionId);
      const panel = document.createElement('section');
      panel.className = 'wdg-growth-checkpoint ' + (completed[sectionId] ? 'done' : '');
      panel.innerHTML = '<header><span>' + icon('tabler:flag-3',18) + '</span><div><small>' + copy.checkpoint + '</small><h2>' + sectionId.toUpperCase() + '</h2></div></header><p>' + escapeHtml(data[0]) + '</p><div class="wdg-growth-criteria"><strong>' + copy.criteria + '</strong><span>' + escapeHtml(data[1]) + '</span></div><footer><button class="wdgf-btn" type="button" data-checkpoint-forge>' + icon('tabler:hammer',15) + ' ' + copy.openForge + '</button><label><input type="checkbox" data-checkpoint-done ' + (completed[sectionId] ? 'checked' : '') + '><span>' + copy.done + '</span></label></footer>';
      panel.querySelector('[data-checkpoint-forge]').addEventListener('click', () => api?.open?.('forge'));
      panel.querySelector('[data-checkpoint-done]').addEventListener('change', event => {
        const values = readJson(CHECKPOINT_KEY, {});
        values[sectionId] = event.target.checked;
        writeJson(CHECKPOINT_KEY, values);
        panel.classList.toggle('done', event.target.checked);
        api?.logActivity?.(event.target.checked ? 3 : -1);
      });
      section.appendChild(panel);
    });
  }

  function chooseRepeat() {
    const list = topics().map(topic => ({ ...topic, mastery:mastery(topic.id) })).filter(topic => topic.mastery.level > 0);
    return list.sort((a,b) => (isDue(b.mastery) - isDue(a.mastery)) || (a.mastery.updatedAt - b.mastery.updatedAt))[0] || null;
  }

  function chooseLearn() {
    const active = paths.find(item => item.id === activePathId) || paths[0];
    for (const routeStep of active.steps) {
      const topic = findTopic(routeStep);
      if (topic && mastery(topic.id).level < 2) return topic;
    }
    return topics().find(topic => mastery(topic.id).level < 2) || null;
  }

  function addNavigation() {
    const nav = document.querySelector('.wdg-side-nav');
    if (!nav || document.getElementById('wdgGrowthNavBtn')) return;
    const button = document.createElement('button');
    button.className = 'wdg-nav-btn';
    button.id = 'wdgGrowthNavBtn';
    button.type = 'button';
    button.dataset.wdgFeature = 'paths';
    button.innerHTML = icon('tabler:route',19) + '<span>' + copy.nav + '</span>';
    button.addEventListener('click', () => api.open('paths'));
    const today = document.getElementById('wdgTodayBtn');
    if (today) today.after(button);
    else document.getElementById('wdgfDashboardBtn')?.after(button);
  }

  function init() {
    api = window.WebDevGymFeatures;
    if (!api?.register) { setTimeout(init,80); return; }
    api.register('paths', renderPaths, { title:copy.title, icon:'tabler:route', group:L('Learning','Обучение') });
    addNavigation();
    enhanceMastery();
    document.querySelectorAll('.section').forEach(section => new MutationObserver(enhanceMastery).observe(section,{childList:true,subtree:true}));
    window.WebDevGymGrowth = { topics, mastery, setMastery, chooseRepeat, chooseLearn, openTopic, open:() => api.open('paths') };
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => setTimeout(init,180));
  else setTimeout(init,180);
})();
