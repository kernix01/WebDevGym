(function () {
  'use strict';

  const isEnglish = document.documentElement.lang.toLowerCase().startsWith('en');
  const copy = isEnglish ? {
    progress: 'Your progress', course: 'Course progress', learned: 'topics complete',
    learn: 'Learn', playground: 'Playground', nexus: 'Nexus', calendar: 'Calendar',
    continue: 'Continue', seeAll: 'See all', notes: 'Notes', previous: 'Previous', next: 'Continue',
    inProgress: 'In progress', locked: 'Next', openGraph: 'Drag nodes to explore', search: 'Search',
    noteText: 'Your progress, notes and graph are saved locally in this browser.',
    graph: 'Knowledge graph', center: 'Center graph', reset: 'Reset positions'
  } : {
    progress: 'Твой прогресс', course: 'Прогресс курса', learned: 'тем изучено',
    learn: 'Обучение', playground: 'Playground', nexus: 'Nexus', calendar: 'Календарь',
    continue: 'Продолжить', seeAll: 'Все темы', notes: 'Заметки', previous: 'Назад', next: 'Продолжить',
    inProgress: 'Изучается', locked: 'Дальше', openGraph: 'Перетаскивай узлы и исследуй связи', search: 'Поиск',
    noteText: 'Прогресс, заметки и расположение графа сохраняются локально в этом браузере.',
    graph: 'Граф знаний', center: 'Центрировать', reset: 'Сбросить позиции'
  };

  const navItems = [
    { id: 'learn', label: copy.learn, icon: 'tabler:book-2', tab: 'html' },
    { id: 'playground', label: copy.playground, icon: 'tabler:code', tab: 'playground' },
    { id: 'nexus', label: copy.nexus, icon: 'tabler:binary-tree-2', tab: 'nexus' },
    { id: 'calendar', label: copy.calendar, icon: 'tabler:calendar', tab: 'calendar' }
  ];

  const state = {
    activeSection: 'html',
    activeBlock: 0,
    graph: { x: 0, y: 0, scale: 1, positions: {} }
  };

  function icon(name, size) {
    return '<iconify-icon icon="' + name + '" width="' + (size || 18) + '" height="' + (size || 18) + '"></iconify-icon>';
  }

  function run(name) {
    const args = Array.prototype.slice.call(arguments, 1);
    if (typeof window[name] === 'function') return window[name].apply(window, args);
  }

  function openTab(tab) {
    if (typeof window.switchTabByName === 'function') window.switchTabByName(tab);
    else {
      const button = document.querySelector('.tab[onclick*="\'' + tab + '\'"]');
      if (button) button.click();
    }
    requestAnimationFrame(syncWorkspace);
  }

  function buildSidebar() {
    const sidebar = document.createElement('aside');
    sidebar.className = 'wdg-sidebar';
    sidebar.innerHTML =
      '<div class="wdg-brand"><span class="wdg-brand-mark">&lt;&gt;</span><span>WebDev<em>Gym</em></span></div>' +
      '<div class="wdg-progress-card">' +
        '<div class="wdg-progress-label">' + copy.progress + '</div>' +
        '<div class="wdg-progress-ring" id="wdgProgressRing"><div class="wdg-progress-copy"><strong id="wdgProgressPct">0%</strong><span>' + copy.course + '</span></div></div>' +
        '<div class="wdg-progress-detail" id="wdgProgressDetail">0 / 0 ' + copy.learned + '</div>' +
      '</div>' +
      '<nav class="wdg-side-nav" aria-label="Primary">' + navItems.map(function (item) {
        return '<button class="wdg-nav-btn" type="button" data-wdg-nav="' + item.id + '" data-tab="' + item.tab + '">' + icon(item.icon) + '<span>' + item.label + '</span></button>';
      }).join('') + '</nav>' +
      '<div class="wdg-sidebar-foot"><div class="wdg-streak"><span>' + icon('tabler:bolt', 15) + ' Streak boost</span><b id="wdgStreak">3/3</b></div></div>';
    document.body.appendChild(sidebar);
    sidebar.querySelectorAll('[data-tab]').forEach(function (button) {
      button.addEventListener('click', function () { openTab(button.dataset.tab); });
    });
  }

  function buildCommandbar() {
    const bar = document.createElement('header');
    bar.className = 'wdg-commandbar';
    bar.innerHTML =
      '<button class="wdg-command-icon" type="button" id="wdgMenuBtn" title="Menu">' + icon('tabler:terminal-2') + '</button>' +
      '<div class="wdg-crumb"><span id="wdgCrumbParent">WebDevGym</span><span>/</span><strong id="wdgCrumbTitle">HTML</strong></div>' +
      '<div class="wdg-command-spacer"></div>' +
      '<button class="wdg-icon-btn" id="wdgSearchBtn" type="button" title="' + copy.search + '">' + icon('tabler:search') + '</button>' +
      '<button class="wdg-icon-btn desktop-only" id="wdgBookmarkBtn" type="button" title="Bookmarks">' + icon('tabler:bookmark') + '</button>' +
      '<button class="wdg-icon-btn desktop-only" id="wdgThemeBtn" type="button" title="Theme">' + icon('tabler:moon-stars') + '</button>' +
      '<div class="wdg-lang"><a class="' + (!isEnglish ? 'active' : '') + '" href="https://kernix01.github.io/WebDevGym/">RU</a><span>|</span><a class="' + (isEnglish ? 'active' : '') + '" href="https://kernix01.github.io/WebDevGym-EN/">EN</a></div>' +
      '<button class="wdg-top-action desktop-only" id="wdgExportBtn" type="button">' + icon('tabler:download', 15) + '<span>Export</span></button>';
    document.body.appendChild(bar);
    bar.querySelector('#wdgSearchBtn').addEventListener('click', function () {
      const fab = document.querySelector('.search-fab');
      if (fab) fab.click();
    });
    bar.querySelector('#wdgBookmarkBtn').addEventListener('click', function () { run('toggleBmFilter'); });
    bar.querySelector('#wdgThemeBtn').addEventListener('click', function () { run('toggleDark'); });
    bar.querySelector('#wdgExportBtn').addEventListener('click', function () { run('exportProgressJson'); });
    bar.querySelector('#wdgMenuBtn').addEventListener('click', function () {
      document.querySelector('.wdg-sidebar')?.classList.toggle('peek');
    });
  }

  function miniGraphMarkup() {
    return '<div class="wdg-mini-graph" id="wdgMiniGraph" role="button" tabindex="0" aria-label="Nexus">' +
      '<svg viewBox="0 0 304 280" aria-hidden="true">' +
        '<path class="wdg-mini-edge" d="M154 141 C112 131 95 94 65 74 M154 141 C197 122 214 90 248 75 M154 141 C204 151 221 184 253 201 M154 141 C119 161 107 194 73 213 M154 141 C155 99 155 79 155 48 M65 74 C99 65 124 54 155 48 M248 75 C215 62 190 52 155 48" />' +
        '<g class="wdg-mini-node main" transform="translate(154 141)"><circle r="43"/><text>DOM</text></g>' +
        '<g class="wdg-mini-node cyan" transform="translate(65 74)"><circle r="34"/><text>JavaScript</text></g>' +
        '<g class="wdg-mini-node coral" transform="translate(155 48)"><circle r="29"/><text>Events</text></g>' +
        '<g class="wdg-mini-node cyan" transform="translate(248 75)"><circle r="25"/><text>HTML</text></g>' +
        '<g class="wdg-mini-node" transform="translate(253 201)"><circle r="24"/><text>CSS</text></g>' +
        '<g class="wdg-mini-node orange" transform="translate(73 213)"><circle r="31"/><text>Storage</text></g>' +
      '</svg></div><div class="wdg-graph-caption">' + icon('tabler:hand-move', 14) + '<span>' + copy.openGraph + '</span></div>';
  }

  function buildRightbar() {
    const right = document.createElement('aside');
    right.className = 'wdg-rightbar';
    right.innerHTML =
      '<section class="wdg-context-section"><div class="wdg-context-head"><h3>' + copy.continue + '</h3><button id="wdgSeeAll">' + copy.seeAll + '</button></div><div class="wdg-lesson-list" id="wdgLessonList"></div></section>' +
      '<section class="wdg-context-section"><div class="wdg-context-head"><h3>' + copy.notes + '</h3><button id="wdgOpenNotes" title="Nexus">' + icon('tabler:pencil', 16) + '</button></div><div class="wdg-note-copy"><strong>WebDevGym</strong><br>' + copy.noteText + '</div></section>' +
      '<section class="wdg-context-section"><div class="wdg-context-head"><h3>Nexus</h3><button id="wdgOpenNexus">' + icon('tabler:arrows-maximize', 16) + '</button></div>' + miniGraphMarkup() + '</section>';
    document.body.appendChild(right);
    right.querySelector('#wdgOpenNexus').addEventListener('click', function () { openTab('nexus'); });
    right.querySelector('#wdgOpenNotes').addEventListener('click', function () { openTab('nexus'); });
    right.querySelector('#wdgMiniGraph').addEventListener('click', function () { openTab('nexus'); });
    right.querySelector('#wdgSeeAll').addEventListener('click', function () { document.querySelector('.wdg-sidebar')?.scrollIntoView(); });
  }

  function buildBottomDock() {
    const dock = document.createElement('div');
    dock.className = 'wdg-bottom-dock';
    dock.innerHTML =
      '<button class="wdg-dock-btn" type="button" id="wdgPrev">' + icon('tabler:arrow-left', 15) + ' ' + copy.previous + '</button>' +
      '<div class="wdg-dock-track"><div class="wdg-dock-fill" id="wdgDockFill"></div><span class="wdg-dock-dot" id="wdgDockDot"></span></div>' +
      '<button class="wdg-dock-btn primary" type="button" id="wdgNext">' + copy.next + ' ' + icon('tabler:arrow-right', 15) + '</button>';
    document.body.appendChild(dock);
    dock.querySelector('#wdgPrev').addEventListener('click', function () { moveBlock(-1); });
    dock.querySelector('#wdgNext').addEventListener('click', function () { moveBlock(1); });
  }

  function activeSection() {
    return document.querySelector('.section.active') || document.querySelector('.section');
  }

  function cleanText(value) {
    return String(value || '').replace(/\s+/g, ' ').replace(/[🔗⭐📌🖥️⚙️🧠]/g, '').trim();
  }

  function sectionId(section) {
    return section && section.id ? section.id.replace(/^sec-/, '') : 'html';
  }

  function sectionTitle(section) {
    return cleanText(section?.querySelector('.lang-section-hero-title, h2, .block-title')?.textContent) || 'WebDevGym';
  }

  function blocksIn(section) {
    return Array.from(section?.querySelectorAll(':scope > .block, :scope > .tool-block') || []).filter(function (el) {
      return getComputedStyle(el).display !== 'none';
    });
  }

  function renderLessons(section) {
    const list = document.getElementById('wdgLessonList');
    if (!list) return;
    const blocks = blocksIn(section).slice(0, 7);
    if (!blocks.length) {
      list.innerHTML = '<button class="wdg-lesson-row active"><span>' + icon('tabler:player-play-filled', 14) + '</span><span>' + sectionTitle(section) + '</span><small>' + copy.inProgress + '</small></button>';
      return;
    }
    state.activeBlock = Math.min(state.activeBlock, blocks.length - 1);
    list.innerHTML = blocks.map(function (block, index) {
      const title = cleanText(block.querySelector('.block-title, h3, h2')?.textContent) || ('Topic ' + (index + 1));
      return '<button class="wdg-lesson-row ' + (index === state.activeBlock ? 'active' : '') + '" type="button" data-index="' + index + '"><span>' + icon(index === state.activeBlock ? 'tabler:player-play-filled' : 'tabler:circle', 13) + '</span><span>' + (index + 1) + '. ' + title + '</span><small>' + (index === state.activeBlock ? copy.inProgress : copy.locked) + '</small></button>';
    }).join('');
    list.querySelectorAll('[data-index]').forEach(function (button) {
      button.addEventListener('click', function () {
        state.activeBlock = Number(button.dataset.index);
        blocks[state.activeBlock]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        renderLessons(section);
        updateDock(section);
      });
    });
  }

  function updateDock(section) {
    const blocks = blocksIn(section);
    const total = Math.max(1, blocks.length);
    const pct = Math.round(((Math.min(state.activeBlock, total - 1) + 1) / total) * 100);
    const fill = document.getElementById('wdgDockFill');
    const dot = document.getElementById('wdgDockDot');
    if (fill) fill.style.width = pct + '%';
    if (dot) dot.style.left = pct + '%';
  }

  function moveBlock(delta) {
    const section = activeSection();
    const blocks = blocksIn(section);
    if (!blocks.length) return;
    state.activeBlock = Math.max(0, Math.min(blocks.length - 1, state.activeBlock + delta));
    blocks[state.activeBlock].scrollIntoView({ behavior: 'smooth', block: 'start' });
    renderLessons(section);
    updateDock(section);
  }

  function updateProgressShell() {
    const all = document.querySelectorAll('.prog-cb:not([disabled])');
    const done = document.querySelectorAll('.prog-cb:not([disabled]):checked');
    const pct = all.length ? Math.round(done.length / all.length * 100) : 0;
    const ring = document.getElementById('wdgProgressRing');
    if (ring) ring.style.setProperty('--value', pct);
    const pctEl = document.getElementById('wdgProgressPct');
    const detail = document.getElementById('wdgProgressDetail');
    if (pctEl) pctEl.textContent = pct + '%';
    if (detail) detail.textContent = done.length + ' / ' + all.length + ' ' + copy.learned;
  }

  function syncNavigation(id) {
    const direct = ['playground', 'nexus', 'calendar'].includes(id) ? id : 'learn';
    document.querySelectorAll('[data-wdg-nav]').forEach(function (button) {
      button.classList.toggle('active', button.dataset.wdgNav === direct);
    });
  }

  function syncWorkspace() {
    const section = activeSection();
    if (!section) return;
    const id = sectionId(section);
    if (state.activeSection !== id) state.activeBlock = 0;
    state.activeSection = id;
    const title = sectionTitle(section);
    const crumb = document.getElementById('wdgCrumbTitle');
    const parent = document.getElementById('wdgCrumbParent');
    if (crumb) crumb.textContent = title;
    if (parent) parent.textContent = id === 'nexus' ? 'Knowledge' : id.toUpperCase();
    syncNavigation(id);
    renderLessons(section);
    updateDock(section);
    updateProgressShell();
    if (id === 'nexus') setTimeout(renderNexusGraph, 30);
  }

  function observeOldApp() {
    document.querySelectorAll('.section').forEach(function (section) {
      new MutationObserver(syncWorkspace).observe(section, { attributes: true, attributeFilter: ['class'] });
    });
    document.addEventListener('change', function (event) {
      if (event.target.matches('.prog-cb')) requestAnimationFrame(updateProgressShell);
    });
    window.addEventListener('hashchange', syncWorkspace);
  }

  /* Nexus --------------------------------------------------------------- */
  const GRAPH_POSITION_KEY = 'webdevgym_nexus_graph_positions_v2';
  const GRAPH_CAMERA_KEY = 'webdevgym_nexus_graph_camera_v2';
  const baseTitles = ['HTML', 'CSS', 'JavaScript', 'DOM', 'Events', 'localStorage', 'TypeScript', 'React', 'Git', 'Vite', 'Node.js', 'SQL'];
  const baseEdges = [
    ['HTML', 'DOM'], ['CSS', 'DOM'], ['JavaScript', 'DOM'], ['DOM', 'Events'],
    ['DOM', 'localStorage'], ['JavaScript', 'Events'], ['JavaScript', 'TypeScript'],
    ['TypeScript', 'React'], ['JavaScript', 'React'], ['Git', 'Vite'], ['HTML', 'Vite'],
    ['CSS', 'Vite'], ['JavaScript', 'Vite'], ['Vite', 'React'], ['Vite', 'Node.js'], ['Node.js', 'SQL']
  ];
  const defaultPositions = {
    HTML: [90, 90], CSS: [90, 245], JavaScript: [300, 170], DOM: [505, 170],
    Events: [505, 40], localStorage: [505, 315], TypeScript: [300, 355], React: [725, 170],
    Git: [90, 425], Vite: [725, 345], 'Node.js': [725, 505], SQL: [505, 505]
  };
  const topicRoutes = {
    HTML:'html', CSS:'css', JavaScript:'js', DOM:'js', Events:'js', localStorage:'js',
    TypeScript:'ts', React:'react', Git:'git', Vite:'vite', 'Node.js':'node', SQL:'sql'
  };
  const topicSearch = {
    DOM:'dom', Events:'event', localStorage:'localstorage', HTML:'html', CSS:'css', JavaScript:'javascript',
    TypeScript:'typescript', React:'react', Git:'git', Vite:'vite', 'Node.js':'node', SQL:'sql'
  };

  function safeNotes() {
    try { return typeof nexusNotes !== 'undefined' && Array.isArray(nexusNotes) ? nexusNotes : []; }
    catch (error) { return []; }
  }

  function graphData() {
    const notes = safeNotes();
    const byTitle = new Map();
    notes.forEach(function (note) { byTitle.set(note.title.toLowerCase(), note); });
    const titles = new Set(baseTitles);
    const edges = baseEdges.slice();
    notes.forEach(function (note) {
      titles.add(note.title);
      const links = typeof window.nexusLinks === 'function' ? window.nexusLinks(note.body) : [];
      links.forEach(function (target) { titles.add(target); edges.push([note.title, target]); });
    });
    return {
      nodes: Array.from(titles).map(function (title) { return { title: title, note: byTitle.get(title.toLowerCase()) || null }; }),
      edges: edges.filter(function (edge, index, arr) {
        return index === arr.findIndex(function (other) { return other[0].toLowerCase() === edge[0].toLowerCase() && other[1].toLowerCase() === edge[1].toLowerCase(); });
      })
    };
  }

  function loadGraphState() {
    try { state.graph.positions = JSON.parse(localStorage.getItem(GRAPH_POSITION_KEY) || '{}') || {}; } catch (e) { state.graph.positions = {}; }
    try {
      const camera = JSON.parse(localStorage.getItem(GRAPH_CAMERA_KEY) || 'null');
      if (camera) Object.assign(state.graph, camera);
    } catch (e) {}
  }

  function saveGraphState() {
    localStorage.setItem(GRAPH_POSITION_KEY, JSON.stringify(state.graph.positions));
    localStorage.setItem(GRAPH_CAMERA_KEY, JSON.stringify({ x: state.graph.x, y: state.graph.y, scale: state.graph.scale }));
  }

  function graphPosition(title, index) {
    if (state.graph.positions[title]) return state.graph.positions[title];
    if (defaultPositions[title]) return defaultPositions[title].slice();
    const angle = index * 2.399;
    const radius = 170 + (index % 4) * 38;
    return [430 + Math.cos(angle) * radius, 260 + Math.sin(angle) * radius];
  }

  function applyGraphCamera(host) {
    const world = host?.querySelector('.wdg-graph-world');
    if (!world) return;
    world.style.transform = 'translate(' + state.graph.x + 'px,' + state.graph.y + 'px) scale(' + state.graph.scale + ')';
  }

  function updateGraphLines(host, data) {
    const svg = host.querySelector('.wdg-graph-lines');
    if (!svg) return;
    const active = (typeof nexusActive === 'function' ? nexusActive() : null)?.title || '';
    svg.innerHTML = data.edges.map(function (edge) {
      const a = host.querySelector('[data-node-title="' + CSS.escape(edge[0]) + '"]');
      const b = host.querySelector('[data-node-title="' + CSS.escape(edge[1]) + '"]');
      if (!a || !b) return '';
      const x1 = parseFloat(a.style.left) + a.offsetWidth / 2;
      const y1 = parseFloat(a.style.top) + a.offsetHeight / 2;
      const x2 = parseFloat(b.style.left) + b.offsetWidth / 2;
      const y2 = parseFloat(b.style.top) + b.offsetHeight / 2;
      const curve = Math.max(35, Math.abs(x2 - x1) * .22);
      const isActive = edge.some(function (title) { return title.toLowerCase() === active.toLowerCase(); });
      return '<path class="wdg-graph-line ' + (isActive ? 'active' : '') + '" d="M ' + x1 + ' ' + y1 + ' C ' + (x1 + curve) + ' ' + y1 + ', ' + (x2 - curve) + ' ' + y2 + ', ' + x2 + ' ' + y2 + '" />';
    }).join('');
  }

  function toneFor(title, index) {
    const tones = { JavaScript:'cyan', Events:'coral', localStorage:'orange', HTML:'cyan', CSS:'blue', DOM:'violet', React:'violet', TypeScript:'blue', Git:'coral', Vite:'violet', 'Node.js':'cyan', SQL:'orange' };
    return tones[title] || ['blue', 'cyan', 'coral', 'orange', 'violet'][index % 5];
  }

  function graphEscape(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (char) { return ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' })[char]; });
  }

  function graphProgress(title) {
    const route = topicRoutes[title];
    const section = route ? document.getElementById('sec-' + route) : null;
    if (!section) return null;
    const boxes = Array.from(section.querySelectorAll('.prog-cb:not([disabled])'));
    const done = boxes.filter(function (box) { return box.checked || localStorage.getItem('prog_' + box.dataset.pid) === '1'; }).length;
    return boxes.length ? Math.round(done / boxes.length * 100) : 0;
  }

  function graphOpenNode(node) {
    const route = topicRoutes[node.title];
    if (route) {
      if (typeof window.switchTabByName === 'function') window.switchTabByName(route);
      setTimeout(function () {
        const query = topicSearch[node.title];
        const blocks = Array.from(document.querySelectorAll('#sec-' + route + ' > .block'));
        const target = query ? blocks.find(function (block) { return block.textContent.toLowerCase().includes(query.toLowerCase()); }) : blocks[0];
        target?.scrollIntoView({ behavior:'smooth', block:'start' });
      }, 160);
      return;
    }
    if (node.note && typeof nexusOpen === 'function') nexusOpen(node.note.id);
    else if (typeof nexusCreateNote === 'function') nexusCreateNote(node.title);
  }

  function fitGraph(host) {
    const viewport = host?.querySelector('.wdg-graph-viewport');
    const nodes = Array.from(host?.querySelectorAll('.wdg-graph-node') || []);
    if (!viewport || !nodes.length) return;
    const bounds = nodes.reduce(function (acc, node) {
      const left = parseFloat(node.style.left) || 0;
      const top = parseFloat(node.style.top) || 0;
      acc.minX = Math.min(acc.minX, left);
      acc.minY = Math.min(acc.minY, top);
      acc.maxX = Math.max(acc.maxX, left + node.offsetWidth);
      acc.maxY = Math.max(acc.maxY, top + node.offsetHeight);
      return acc;
    }, { minX:Infinity, minY:Infinity, maxX:-Infinity, maxY:-Infinity });
    const padding = 52;
    const width = Math.max(1, bounds.maxX - bounds.minX);
    const height = Math.max(1, bounds.maxY - bounds.minY);
    state.graph.scale = Math.max(.45, Math.min(1.35, (viewport.clientWidth - padding * 2) / width, (viewport.clientHeight - padding * 2) / height));
    state.graph.x = (viewport.clientWidth - width * state.graph.scale) / 2 - bounds.minX * state.graph.scale;
    state.graph.y = (viewport.clientHeight - height * state.graph.scale) / 2 - bounds.minY * state.graph.scale;
    applyGraphCamera(host);
    saveGraphState();
  }

  function bindGraphInteractions(host, data) {
    const viewport = host.querySelector('.wdg-graph-viewport');
    const world = host.querySelector('.wdg-graph-world');
    if (!viewport || !world) return;
    let pan = null;

    viewport.addEventListener('pointerdown', function (event) {
      if (event.target.closest('.wdg-graph-node')) return;
      pan = { px: event.clientX, py: event.clientY, x: state.graph.x, y: state.graph.y };
      viewport.setPointerCapture(event.pointerId);
      viewport.classList.add('dragging');
    });
    viewport.addEventListener('pointermove', function (event) {
      if (!pan) return;
      state.graph.x = pan.x + event.clientX - pan.px;
      state.graph.y = pan.y + event.clientY - pan.py;
      applyGraphCamera(host);
    });
    viewport.addEventListener('pointerup', function () { pan = null; viewport.classList.remove('dragging'); saveGraphState(); });
    viewport.addEventListener('pointercancel', function () { pan = null; viewport.classList.remove('dragging'); });
    viewport.addEventListener('wheel', function (event) {
      event.preventDefault();
      const oldScale = state.graph.scale;
      const next = Math.max(.45, Math.min(2.1, oldScale * (event.deltaY > 0 ? .9 : 1.1)));
      const rect = viewport.getBoundingClientRect();
      const mx = event.clientX - rect.left;
      const my = event.clientY - rect.top;
      state.graph.x = mx - (mx - state.graph.x) * (next / oldScale);
      state.graph.y = my - (my - state.graph.y) * (next / oldScale);
      state.graph.scale = next;
      applyGraphCamera(host);
      saveGraphState();
    }, { passive: false });

    host.querySelectorAll('.wdg-graph-node').forEach(function (element) {
      const node = data.nodes.find(function (item) { return item.title === element.dataset.nodeTitle; });
      let drag = null;
      element.addEventListener('pointerdown', function (event) {
        event.stopPropagation();
        drag = { px: event.clientX, py: event.clientY, left: parseFloat(element.style.left), top: parseFloat(element.style.top), moved: false };
        element.setPointerCapture(event.pointerId);
      });
      element.addEventListener('pointermove', function (event) {
        if (!drag) return;
        const dx = (event.clientX - drag.px) / state.graph.scale;
        const dy = (event.clientY - drag.py) / state.graph.scale;
        if (Math.abs(dx) + Math.abs(dy) > 2) drag.moved = true;
        element.style.left = drag.left + dx + 'px';
        element.style.top = drag.top + dy + 'px';
        state.graph.positions[element.dataset.nodeTitle] = [drag.left + dx, drag.top + dy];
        updateGraphLines(host, data);
      });
      element.addEventListener('pointerup', function () {
        const moved = drag?.moved;
        drag = null;
        saveGraphState();
        if (!moved && node) graphOpenNode(node);
      });
    });

    host.querySelector('[data-graph-action="zoom-in"]')?.addEventListener('click', function () { state.graph.scale = Math.min(2.1, state.graph.scale + .15); applyGraphCamera(host); saveGraphState(); });
    host.querySelector('[data-graph-action="zoom-out"]')?.addEventListener('click', function () { state.graph.scale = Math.max(.45, state.graph.scale - .15); applyGraphCamera(host); saveGraphState(); });
    host.querySelector('[data-graph-action="center"]')?.addEventListener('click', function () { state.graph.x = 0; state.graph.y = 0; state.graph.scale = 1; applyGraphCamera(host); saveGraphState(); });
    host.querySelector('[data-graph-action="fit"]')?.addEventListener('click', function () { fitGraph(host); });
    host.querySelector('[data-graph-action="reset"]')?.addEventListener('click', function () { state.graph.positions = {}; localStorage.removeItem(GRAPH_POSITION_KEY); renderNexusGraph(); });
  }

  function renderNexusGraph() {
    const host = document.getElementById('nexusGraph');
    if (!host) return;
    host.className = 'nexus-graph wdg-graph-host';
    const data = graphData();
    const activeTitle = (typeof nexusActive === 'function' ? nexusActive() : null)?.title || '';
    host.innerHTML = '<div class="wdg-graph-shell">' +
      '<div class="wdg-graph-toolbar"><strong>' + copy.graph + '</strong>' +
        '<button class="wdg-graph-tool" type="button" data-graph-action="zoom-in" title="Zoom in">' + icon('tabler:plus', 15) + '</button>' +
        '<button class="wdg-graph-tool" type="button" data-graph-action="zoom-out" title="Zoom out">' + icon('tabler:minus', 15) + '</button>' +
        '<button class="wdg-graph-tool" type="button" data-graph-action="center" title="' + copy.center + '">' + icon('tabler:focus-centered', 15) + '</button>' +
        '<button class="wdg-graph-tool" type="button" data-graph-action="fit" title="Fit graph">' + icon('tabler:arrows-maximize', 15) + '</button>' +
        '<button class="wdg-graph-tool" type="button" data-graph-action="reset" title="' + copy.reset + '">' + icon('tabler:refresh', 15) + '</button>' +
      '</div><div class="wdg-graph-viewport"><div class="wdg-graph-world"><svg class="wdg-graph-lines"></svg>' +
      data.nodes.map(function (node, index) {
        const pos = graphPosition(node.title, index);
        const active = node.title.toLowerCase() === activeTitle.toLowerCase();
        const progress = graphProgress(node.title);
        return '<button class="wdg-graph-node ' + (active ? 'active' : '') + (progress === 100 ? ' completed' : '') + '" type="button" data-tone="' + toneFor(node.title, index) + '" data-node-title="' + graphEscape(node.title) + '" style="left:' + pos[0] + 'px;top:' + pos[1] + 'px"><span>' + graphEscape(node.title) + '</span>' + (progress == null ? '' : '<small>' + progress + '%</small>') + '</button>';
      }).join('') + '</div><div class="wdg-graph-status">' + copy.openGraph + '</div></div></div>';
    applyGraphCamera(host);
    requestAnimationFrame(function () { updateGraphLines(host, data); bindGraphInteractions(host, data); });
  }

  function enhanceNexus() {
    if (typeof window.nexusRenderGraph === 'function') {
      window.nexusRenderGraph = function () { renderNexusGraph(); };
    }
    const shell = document.querySelector('#sec-nexus .nexus-shell');
    if (shell) shell.classList.add('wdg-nexus-enhanced');
    renderNexusGraph();
  }

  function init() {
    if (document.body.classList.contains('wdg-modern')) return;
    document.body.classList.add('wdg-modern', 'dark');
    try { localStorage.setItem('darkMode', '1'); } catch (e) {}
    buildSidebar();
    buildCommandbar();
    buildRightbar();
    buildBottomDock();
    loadGraphState();
    enhanceNexus();
    observeOldApp();
    syncWorkspace();
    setTimeout(syncWorkspace, 400);
    setTimeout(syncWorkspace, 1500);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();

