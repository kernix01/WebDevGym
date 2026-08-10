(() => {
  'use strict';

  const NOTES_KEY = 'webdevgym_nexus_notes_v1';
  const GRAPH_KEY = 'wdgn_nexus_graph_v3';
  const CAMERA_KEY = 'wdgn_nexus_camera_v3';
  const UI_KEY = 'wdgn_nexus_ui_v3';
  const isEnglish = document.documentElement.lang === 'en' || location.pathname.includes('index-en');
  const text = (ru, en) => isEnglish ? en : ru;
  const copy = {
    title: text('Nexus — карта знаний', 'Nexus — knowledge map'),
    subtitle: text('Связывай заметки, темы и уроки в одну живую систему.', 'Connect notes, topics and lessons into one living system.'),
    map: text('Карта', 'Map'),
    path: text('Путь', 'Path'),
    focus: text('Фокус', 'Focus'),
    knowledge: text('МОИ ЗНАНИЯ', 'MY KNOWLEDGE'),
    search: text('Найти заметку...', 'Find a note...'),
    all: text('Все заметки', 'All notes'),
    projects: text('Проекты', 'Projects'),
    errors: text('Ошибки', 'Errors'),
    newNote: text('Новая заметка', 'New note'),
    inspector: text('Инспектор', 'Inspector'),
    overview: text('Обзор', 'Overview'),
    links: text('Связи', 'Links'),
    edit: text('Заметка', 'Note'),
    mastery: text('Освоение', 'Mastery'),
    backlinks: text('Обратные ссылки', 'Backlinks'),
    outgoing: text('Исходящие связи', 'Outgoing links'),
    related: text('Связанные уроки', 'Related lessons'),
    noLinks: text('Пока нет связей. Добавь [[Название заметки]] в текст.', 'No links yet. Add [[Note title]] to the text.'),
    noLessons: text('Связанные уроки пока не найдены.', 'No related lessons found yet.'),
    openNote: text('Редактировать заметку', 'Edit note'),
    saved: text('Сохранено локально', 'Saved locally'),
    delete: text('Удалить', 'Delete'),
    titlePlaceholder: text('Название заметки', 'Note title'),
    bodyPlaceholder: text('Для связи используй [[Название заметки]].', 'Use [[Note title]] to create a link.'),
    confirmDelete: text('Удалить эту заметку?', 'Delete this note?'),
    importError: text('Не удалось импортировать заметки.', 'Could not import notes.'),
    hint: text('Перетаскивай узлы · колесо — масштаб · пустое место — движение карты', 'Drag nodes · wheel to zoom · drag empty space to pan'),
    notes: text('заметок', 'notes'),
    untitled: text('Без названия', 'Untitled'),
    updated: text('Обновлено', 'Updated'),
    import: text('Импорт', 'Import'),
    export: text('Экспорт', 'Export'),
    technologies: text('Технологии', 'Technologies'),
    noteFilter: text('Заметки', 'Notes')
  };

  const topics = [
    ['topic-dom', text('Интерфейс', 'Interface'), 'frontend', 850, 420, 58, '#a855f7'],
    ['topic-js', 'JavaScript', 'frontend', 625, 335, 43, '#20c7e8'],
    ['topic-events', 'Events', 'frontend', 800, 215, 36, '#ff667d'],
    ['topic-html', 'HTML', 'frontend', 1090, 300, 34, '#23d9ef'],
    ['topic-css', 'CSS', 'frontend', 1135, 510, 34, '#5a86ff'],
    ['topic-storage', text('Данные', 'Data'), 'frontend', 610, 540, 38, '#f4b323'],
    ['topic-ts', 'TypeScript', 'frontend', 450, 235, 31, '#4d94ff'],
    ['topic-react', 'React', 'frontend', 1220, 385, 31, '#54d4ff'],
    ['topic-node', 'Node.js', 'backend', 425, 650, 36, '#58bd72'],
    ['topic-api', 'API', 'backend', 610, 720, 30, '#2dd4a8'],
    ['topic-sql', 'SQL', 'backend', 810, 735, 30, '#76a7ff'],
    ['topic-git', 'Git', 'projects', 1110, 700, 30, '#ff775d'],
    ['topic-debug', 'Debug', 'errors', 1300, 620, 32, '#ff667d']
  ].map(([id, title, group, x, y, r, accent]) => ({ id, title, group, x, y, r, accent, type: 'topic' }));

  const topicLinks = [
    ['topic-dom', 'topic-js'], ['topic-dom', 'topic-events'], ['topic-dom', 'topic-html'],
    ['topic-dom', 'topic-css'], ['topic-dom', 'topic-storage'], ['topic-js', 'topic-ts'],
    ['topic-js', 'topic-react'], ['topic-js', 'topic-node'], ['topic-node', 'topic-api'],
    ['topic-api', 'topic-sql'], ['topic-js', 'topic-git'], ['topic-js', 'topic-debug']
  ];

  const state = {
    root: null,
    notes: [],
    selectedId: '',
    mode: 'map',
    query: '',
    group: 'all',
    explorerOpen: true,
    inspectorOpen: true,
    inspectorTab: 'overview',
    showTopics: true,
    showNotes: true,
    nodes: new Map(),
    links: [],
    camera: { x: 0, y: 0, zoom: 1 },
    dragging: null,
    panning: null,
    frame: 0,
    timer: 0,
    wasActive: false,
    compact: false
  };

  const isCompact = () => window.matchMedia('(max-width: 820px)').matches;
  const escapeHtml = value => String(value ?? '').replace(/[&<>'"]/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
  })[char]);
  const icon = (name, size = 18) => `<iconify-icon icon="${name}" width="${size}" height="${size}" aria-hidden="true"></iconify-icon>`;

  function readJson(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; }
  }

  function writeJson(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
  }

  function defaultNotes() {
    const now = Date.now();
    return [
      { id: 'nexus-dom', title: text('Интерфейс', 'Interface'), body: text('# Интерфейс\nВидимая часть проекта и её поведение.\n\nСвязано с [[JavaScript]] и [[Events]].', '# Interface\nThe visible part of a project and its behavior.\n\nConnected to [[JavaScript]] and [[Events]].'), updatedAt: now },
      { id: 'nexus-events', title: 'Events', body: text('# Events\nДействия пользователя: click, input, submit.\n\nСобытия изменяют [[Интерфейс]].', '# Events\nUser actions: click, input, submit.\n\nEvents change the [[Interface]].'), updatedAt: now - 1000 },
      { id: 'nexus-javascript', title: 'JavaScript', body: text('# JavaScript\nУправляет поведением и состоянием страницы.\n\nРаботает с [[Интерфейс]], [[Events]] и [[Данные]].', '# JavaScript\nControls page behavior and state.\n\nWorks with [[Interface]], [[Events]] and [[Data]].'), updatedAt: now - 2000 }
    ];
  }

  function loadNotes() {
    const saved = readJson(NOTES_KEY, []);
    const source = Array.isArray(saved) && saved.length ? saved : defaultNotes();
    if (!Array.isArray(saved) || !saved.length) writeJson(NOTES_KEY, source);
    return source.map((note, index) => ({
      id: String(note.id || `note-${Date.now()}-${index}`),
      title: String(note.title || copy.untitled),
      body: String(note.body || ''),
      updatedAt: Number(note.updatedAt || Date.now())
    }));
  }

  function linksFor(note) {
    return [...String(note?.body || '').matchAll(/\[\[([^\]]+)\]\]/g)].map(match => match[1].trim()).filter(Boolean);
  }

  function noteByTitle(title) {
    const wanted = String(title || '').trim().toLowerCase();
    return state.notes.find(note => note.title.trim().toLowerCase() === wanted);
  }

  function selectedNote() {
    return state.notes.find(note => note.id === state.selectedId) || state.notes[0] || null;
  }

  function inferGroup(note) {
    const value = `${note.title} ${note.body}`.toLowerCase();
    if (/error|ошиб|bug|debug|console/.test(value)) return 'errors';
    if (/node|sql|server|api|backend|сервер|баз[аы] данных/.test(value)) return 'backend';
    if (/project|проект|portfolio|github|git/.test(value)) return 'projects';
    return 'frontend';
  }

  function inferTopic(note) {
    const value = `${note.title} ${note.body}`.toLowerCase();
    const rules = [
      ['topic-ts', /typescript|\bts\b/], ['topic-react', /react/], ['topic-events', /event|событ|click|submit|input/],
      ['topic-html', /html|семантик|тег/], ['topic-css', /css|стил|flex|grid/], ['topic-storage', /storage|localstorage|хранилищ/],
      ['topic-node', /node|express|npm/], ['topic-api', /\bapi\b|fetch|http/], ['topic-sql', /sql|database|баз[аы] данных/],
      ['topic-git', /git|github|commit/], ['topic-debug', /debug|error|ошиб|bug|console/], ['topic-dom', /\bdom\b|queryselector|element/]
    ];
    return rules.find(([, pattern]) => pattern.test(value))?.[0] || 'topic-js';
  }

  function noteColor(note) {
    return ({ frontend: '#a855f7', backend: '#2dd4a8', projects: '#f4b323', errors: '#ff667d' })[inferGroup(note)];
  }

  function relatedLessons(note) {
    if (!note) return [];
    const words = [...new Set(`${note.title} ${note.body}`.toLowerCase()
      .replace(/[^\p{L}\p{N}+#.-]+/gu, ' ').split(/\s+/).filter(word => word.length > 2))];
    return Array.from(document.querySelectorAll('.section > .block')).map(block => {
      const title = block.querySelector('.block-title, h2, h3')?.textContent?.replace(/\s+/g, ' ').trim() || '';
      return { block, title, sectionId: block.closest('.section')?.id || '',
        score: words.filter(word => title.toLowerCase().includes(word)).length };
    }).filter(item => item.title && item.score > 0).sort((a, b) => b.score - a.score).slice(0, 4);
  }

  function markdown(body) {
    let html = escapeHtml(body);
    html = html.replace(/\[\[([^\]]+)\]\]/g, (_, title) => {
      const target = noteByTitle(title);
      return `<button type="button" class="nx-inline-link ${target ? '' : 'missing'}" data-nx-link="${escapeHtml(target?.id || '')}" data-nx-link-title="${escapeHtml(title)}">[[${escapeHtml(title)}]]</button>`;
    });
    return html.replace(/^### (.*)$/gm, '<h4>$1</h4>').replace(/^## (.*)$/gm, '<h3>$1</h3>')
      .replace(/^# (.*)$/gm, '<h2>$1</h2>').replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/`([^`]+)`/g, '<code>$1</code>').replace(/\n/g, '<br>');
  }

  function installShell() {
    const section = document.getElementById('sec-nexus');
    if (!section || section.dataset.nexusV3 === '1') return false;
    state.root = section;
    state.notes = loadNotes();
    const savedUi = readJson(UI_KEY, {});
    state.selectedId = state.notes.some(note => note.id === savedUi.selectedId) ? savedUi.selectedId : state.notes[0]?.id || '';
    state.mode = ['map', 'path', 'focus'].includes(savedUi.mode) ? savedUi.mode : 'map';
    state.compact = isCompact();
    state.explorerOpen = state.compact ? false : savedUi.explorerOpen !== false;
    state.inspectorOpen = state.compact ? false : savedUi.inspectorOpen !== false;
    state.camera = { ...state.camera, ...readJson(CAMERA_KEY, {}) };
    section.dataset.nexusV3 = '1';
    section.classList.add('wdgn-nexus-v3');
    section.innerHTML = `
      <div class="nx-workspace">
        <header class="nx-topbar">
          <div class="nx-title-wrap"><span class="nx-kicker">${icon('tabler:affiliate', 16)} Nexus</span><h1>${copy.title}</h1><p>${copy.subtitle}</p></div>
          <div class="nx-modes" role="tablist">${['map', 'path', 'focus'].map(mode => `<button type="button" data-nx-mode="${mode}" class="${state.mode === mode ? 'active' : ''}">${icon(mode === 'map' ? 'tabler:circles-relation' : mode === 'path' ? 'tabler:route' : 'tabler:focus-2', 16)} ${copy[mode]}</button>`).join('')}</div>
          <div class="nx-top-actions">
            <button type="button" class="nx-icon-button" data-nx-explorer-toggle title="${copy.knowledge}" aria-label="${copy.knowledge}">${icon('tabler:layout-sidebar-left-collapse')}</button>
            <button type="button" class="nx-icon-button" data-nx-import title="${copy.import}" aria-label="${copy.import}">${icon('tabler:upload')}</button>
            <button type="button" class="nx-icon-button" data-nx-export title="${copy.export}" aria-label="${copy.export}">${icon('tabler:download')}</button>
          </div>
        </header>
        <div class="nx-canvas-shell">
          <div class="nx-grid-surface" data-nx-stage>
            <svg class="nx-graph" data-nx-svg role="application" aria-label="${copy.title}">
              <defs>
                <filter id="nxGlow" x="-80%" y="-80%" width="260%" height="260%"><feGaussianBlur stdDeviation="7" result="blur"></feGaussianBlur><feMerge><feMergeNode in="blur"></feMergeNode><feMergeNode in="SourceGraphic"></feMergeNode></feMerge></filter>
                <filter id="nxSoft" x="-50%" y="-50%" width="200%" height="200%"><feDropShadow dx="0" dy="7" stdDeviation="8" flood-color="#02040a" flood-opacity=".7"></feDropShadow></filter>
              </defs>
              <g data-nx-world><g data-nx-edges></g><g data-nx-nodes></g></g>
            </svg>
            <div class="nx-empty-label">${copy.hint}</div>
          </div>
          <aside class="nx-explorer ${state.explorerOpen ? 'open' : ''}" data-nx-explorer>
            <div class="nx-panel-heading"><span>${icon('tabler:folders', 16)} ${copy.knowledge}</span><button type="button" class="nx-icon-button compact" data-nx-new title="${copy.newNote}" aria-label="${copy.newNote}">${icon('tabler:plus', 17)}</button></div>
            <label class="nx-search">${icon('tabler:search', 15)}<input type="search" data-nx-search placeholder="${copy.search}" autocomplete="off"></label>
            <div class="nx-folder-list" data-nx-folders></div>
            <div class="nx-explorer-footer"><span data-nx-note-count></span><span>${copy.saved}</span></div>
          </aside>
          <aside class="nx-inspector ${state.inspectorOpen ? 'open' : ''}" data-nx-inspector>
            <div class="nx-inspector-head"><div><span>${copy.inspector}</span><strong data-nx-inspector-title></strong></div><button type="button" class="nx-icon-button compact" data-nx-inspector-close title="${text('Закрыть', 'Close')}" aria-label="${text('Закрыть', 'Close')}">${icon('tabler:x', 17)}</button></div>
            <div class="nx-inspector-tabs" role="tablist">
              <button type="button" data-nx-tab="overview" class="active">${copy.overview}</button>
              <button type="button" data-nx-tab="links">${copy.links}</button>
              <button type="button" data-nx-tab="edit">${copy.edit}</button>
            </div>
            <div class="nx-inspector-body" data-nx-inspector-body></div>
          </aside>
          <div class="nx-filter-dock">
            <button type="button" class="active" data-nx-filter="topics">${icon('tabler:stack-2', 15)} ${copy.technologies}</button>
            <button type="button" class="active" data-nx-filter="notes">${icon('tabler:notes', 15)} ${copy.noteFilter}</button>
          </div>
          <div class="nx-graph-controls">
            <button type="button" data-nx-zoom-out title="${text('Уменьшить', 'Zoom out')}" aria-label="${text('Уменьшить', 'Zoom out')}">${icon('tabler:minus', 17)}</button>
            <button type="button" data-nx-fit title="${text('Вместить карту', 'Fit graph')}" aria-label="${text('Вместить карту', 'Fit graph')}">${icon('tabler:frame', 17)}</button>
            <button type="button" data-nx-center title="${text('Центрировать выбранное', 'Center selected')}" aria-label="${text('Центрировать выбранное', 'Center selected')}">${icon('tabler:focus-centered', 17)}</button>
            <button type="button" data-nx-reset title="${text('Сбросить расположение', 'Reset layout')}" aria-label="${text('Сбросить расположение', 'Reset layout')}">${icon('tabler:refresh', 17)}</button>
            <button type="button" data-nx-zoom-in title="${text('Увеличить', 'Zoom in')}" aria-label="${text('Увеличить', 'Zoom in')}">${icon('tabler:plus', 17)}</button>
          </div>
          <div class="nx-minimap"><svg viewBox="0 0 180 105"><g data-nx-mini-world></g><rect data-nx-mini-camera></rect></svg></div>
        </div>
      </div>`;
    bindEvents();
    rebuildGraph();
    renderExplorer();
    renderInspector();
    if (section.classList.contains('active')) requestAnimationFrame(fitGraph);
    return true;
  }

  function buildGraph(reset = false) {
    const saved = reset ? {} : readJson(GRAPH_KEY, {});
    const nodes = topics.map(topic => ({ ...topic, x: saved[topic.id]?.x ?? topic.x, y: saved[topic.id]?.y ?? topic.y, vx: 0, vy: 0 }));
    const graphLinks = topicLinks.map(([source, target]) => ({ source, target, type: 'topic' }));
    state.notes.forEach((note, index) => {
      const topicId = inferTopic(note);
      const parent = nodes.find(node => node.id === topicId) || nodes[0];
      const angle = (index * 2.399963) % (Math.PI * 2);
      const distance = 105 + (index % 4) * 26;
      nodes.push({ id: note.id, title: note.title, group: inferGroup(note), type: 'note', accent: noteColor(note), r: 24,
        x: saved[note.id]?.x ?? parent.x + Math.cos(angle) * distance,
        y: saved[note.id]?.y ?? parent.y + Math.sin(angle) * distance, vx: 0, vy: 0 });
      graphLinks.push({ source: topicId, target: note.id, type: 'membership' });
      linksFor(note).forEach(title => {
        const target = noteByTitle(title);
        if (target && target.id !== note.id) graphLinks.push({ source: note.id, target: target.id, type: 'note' });
      });
    });
    state.nodes = new Map(nodes.map(node => [node.id, node]));
    state.links = graphLinks.filter(link => state.nodes.has(link.source) && state.nodes.has(link.target));
  }

  function visibleNode(node) {
    if (node.type === 'topic' && !state.showTopics) return false;
    if (node.type === 'note' && !state.showNotes) return false;
    if (state.group !== 'all' && node.type === 'note' && node.group !== state.group) return false;
    if (state.query && node.type === 'note') {
      const note = state.notes.find(item => item.id === node.id);
      if (!`${note?.title} ${note?.body}`.toLowerCase().includes(state.query.toLowerCase())) return false;
    }
    if (state.mode === 'focus' && state.selectedId) {
      const near = new Set([state.selectedId]);
      state.links.forEach(link => {
        if (link.source === state.selectedId) near.add(link.target);
        if (link.target === state.selectedId) near.add(link.source);
      });
      return near.has(node.id);
    }
    return true;
  }

  function pathNodes() {
    const result = new Set([state.selectedId]);
    if (state.mode === 'path') state.links.forEach(link => {
      if (link.source === state.selectedId) result.add(link.target);
      if (link.target === state.selectedId) result.add(link.source);
    });
    return result;
  }

  function nodeMarkup(node, path) {
    const active = node.id === state.selectedId;
    const dim = state.mode === 'path' && !path.has(node.id);
    const label = escapeHtml(node.title.length > 18 ? `${node.title.slice(0, 17)}…` : node.title);
    if (node.type === 'topic') return `<g class="nx-node nx-node-topic${active ? ' active' : ''}${dim ? ' dim' : ''}" data-nx-node="${escapeHtml(node.id)}" transform="translate(${node.x} ${node.y})" style="--node-accent:${node.accent}">
      <circle class="nx-node-halo" r="${node.r + 12}"></circle><circle class="nx-node-core" r="${node.r}"></circle><text class="nx-node-label" text-anchor="middle" y="4">${label}</text></g>`;
    return `<g class="nx-node nx-node-note${active ? ' active' : ''}${dim ? ' dim' : ''}" data-nx-node="${escapeHtml(node.id)}" transform="translate(${node.x} ${node.y})" style="--node-accent:${node.accent}" filter="url(#nxSoft)">
      <circle class="nx-note-ring" r="${node.r + 3}"></circle><circle class="nx-note-core" r="${node.r}"></circle><text class="nx-note-icon" text-anchor="middle" y="5">◆</text><text class="nx-note-label" text-anchor="middle" y="${node.r + 20}">${label}</text></g>`;
  }

  function rebuildGraph(reset = false) {
    buildGraph(reset);
    renderGraph();
    if (reset) saveGraph();
  }

  function renderGraph() {
    const edgeLayer = state.root?.querySelector('[data-nx-edges]');
    const nodeLayer = state.root?.querySelector('[data-nx-nodes]');
    if (!edgeLayer || !nodeLayer) return;
    const visible = new Set([...state.nodes.values()].filter(visibleNode).map(node => node.id));
    edgeLayer.innerHTML = state.links.filter(link => visible.has(link.source) && visible.has(link.target)).map(link => {
      const a = state.nodes.get(link.source);
      const b = state.nodes.get(link.target);
      const active = state.mode === 'path' && (link.source === state.selectedId || link.target === state.selectedId);
      return `<line class="nx-edge nx-edge-${link.type}${active ? ' active' : ''}" data-source="${escapeHtml(link.source)}" data-target="${escapeHtml(link.target)}" x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}"></line>`;
    }).join('');
    const path = pathNodes();
    nodeLayer.innerHTML = [...state.nodes.values()].filter(node => visible.has(node.id)).map(node => nodeMarkup(node, path)).join('');
    applyCamera();
    bindGraphNodes();
    renderMinimap();
  }

  function applyCamera() {
    const world = state.root?.querySelector('[data-nx-world]');
    if (world) world.setAttribute('transform', `translate(${state.camera.x} ${state.camera.y}) scale(${state.camera.zoom})`);
    renderMinimap();
  }

  function clientToWorld(clientX, clientY) {
    const rect = state.root.querySelector('[data-nx-svg]').getBoundingClientRect();
    return { x: (clientX - rect.left - state.camera.x) / state.camera.zoom, y: (clientY - rect.top - state.camera.y) / state.camera.zoom };
  }

  function updateNode(node) {
    const element = state.root.querySelector(`[data-nx-node="${CSS.escape(node.id)}"]`);
    if (element) element.setAttribute('transform', `translate(${node.x} ${node.y})`);
    state.root.querySelectorAll(`[data-source="${CSS.escape(node.id)}"]`).forEach(line => { line.setAttribute('x1', node.x); line.setAttribute('y1', node.y); });
    state.root.querySelectorAll(`[data-target="${CSS.escape(node.id)}"]`).forEach(line => { line.setAttribute('x2', node.x); line.setAttribute('y2', node.y); });
  }

  function bindGraphNodes() {
    state.root.querySelectorAll('[data-nx-node]').forEach(element => {
      element.addEventListener('pointerdown', event => {
        event.stopPropagation();
        const node = state.nodes.get(element.dataset.nxNode);
        const point = clientToWorld(event.clientX, event.clientY);
        state.dragging = { node, offsetX: point.x - node.x, offsetY: point.y - node.y, lastX: point.x, lastY: point.y, lastTime: performance.now(), moved: false };
        element.classList.add('dragging');
        element.setPointerCapture(event.pointerId);
      });
      element.addEventListener('pointermove', event => {
        if (!state.dragging || state.dragging.node.id !== element.dataset.nxNode) return;
        const point = clientToWorld(event.clientX, event.clientY);
        const now = performance.now();
        const node = state.dragging.node;
        const nextX = point.x - state.dragging.offsetX;
        const nextY = point.y - state.dragging.offsetY;
        const dt = Math.max(8, now - state.dragging.lastTime);
        node.vx = (nextX - node.x) / dt * 16;
        node.vy = (nextY - node.y) / dt * 16;
        node.x = nextX; node.y = nextY;
        state.dragging.moved ||= Math.hypot(point.x - state.dragging.lastX, point.y - state.dragging.lastY) > 2;
        state.dragging.lastX = point.x; state.dragging.lastY = point.y; state.dragging.lastTime = now;
        updateNode(node); renderMinimap();
      });
      const finish = event => {
        if (!state.dragging || state.dragging.node.id !== element.dataset.nxNode) return;
        const { node, moved } = state.dragging;
        state.dragging = null;
        element.classList.remove('dragging');
        if (element.hasPointerCapture(event.pointerId)) element.releasePointerCapture(event.pointerId);
        if (moved) startInertia(node); else selectNode(node.id);
      };
      element.addEventListener('pointerup', finish);
      element.addEventListener('pointercancel', finish);
    });
  }

  function startInertia(node) {
    cancelAnimationFrame(state.frame);
    const tick = () => {
      node.vx *= 0.84; node.vy *= 0.84;
      node.x = Math.max(70, Math.min(1430, node.x + node.vx));
      node.y = Math.max(70, Math.min(790, node.y + node.vy));
      updateNode(node); renderMinimap();
      if (Math.hypot(node.vx, node.vy) > 0.18) state.frame = requestAnimationFrame(tick);
      else saveGraph();
    };
    state.frame = requestAnimationFrame(tick);
  }

  function saveGraph() {
    const positions = {};
    state.nodes.forEach(node => { positions[node.id] = { x: Math.round(node.x), y: Math.round(node.y) }; });
    writeJson(GRAPH_KEY, positions);
    writeJson(CAMERA_KEY, state.camera);
  }

  function persistUi() {
    writeJson(UI_KEY, { selectedId: state.selectedId, mode: state.mode, explorerOpen: state.explorerOpen, inspectorOpen: state.inspectorOpen });
  }

  function selectNode(id) {
    const note = state.notes.find(item => item.id === id);
    if (note) state.selectedId = id;
    else {
      const match = state.notes.find(item => inferTopic(item) === id);
      if (!match) return;
      state.selectedId = match.id;
    }
    state.inspectorOpen = true;
    if (isCompact()) state.explorerOpen = false;
    persistUi(); renderGraph(); renderExplorer(); renderInspector();
  }

  function renderExplorer() {
    const host = state.root?.querySelector('[data-nx-folders]');
    if (!host) return;
    const groups = [
      ['all', copy.all, 'tabler:notes'], ['frontend', 'Frontend', 'tabler:layout-dashboard'],
      ['backend', 'Backend', 'tabler:server-2'], ['projects', copy.projects, 'tabler:folder-code'],
      ['errors', copy.errors, 'tabler:bug']
    ];
    const searched = state.notes.filter(note => !state.query || `${note.title} ${note.body}`.toLowerCase().includes(state.query.toLowerCase()));
    host.innerHTML = groups.map(([group, label, groupIcon]) => {
      const items = group === 'all' ? searched : searched.filter(note => inferGroup(note) === group);
      if (group !== 'all' && !items.length) return '';
      return `<section class="nx-folder ${state.group === group ? 'active' : ''}">
        <button type="button" class="nx-folder-title" data-nx-group="${group}">${icon(groupIcon, 15)}<span>${label}</span><small>${items.length}</small>${icon('tabler:chevron-down', 14)}</button>
        ${state.group === group ? `<div class="nx-folder-notes">${items.map(note => `<button type="button" class="nx-note-item ${note.id === state.selectedId ? 'active' : ''}" data-nx-open="${escapeHtml(note.id)}"><i style="--note-color:${noteColor(note)}"></i><span>${escapeHtml(note.title)}</span><small>${linksFor(note).length}</small></button>`).join('')}</div>` : ''}
      </section>`;
    }).join('');
    state.root.querySelector('[data-nx-note-count]').textContent = `${state.notes.length} ${copy.notes}`;
    state.root.querySelector('[data-nx-explorer]')?.classList.toggle('open', state.explorerOpen);
  }

  function incomingLinks(note) {
    return state.notes.filter(item => item.id !== note.id && linksFor(item).some(title => title.toLowerCase() === note.title.toLowerCase()));
  }

  function renderInspector() {
    const panel = state.root?.querySelector('[data-nx-inspector]');
    const host = state.root?.querySelector('[data-nx-inspector-body]');
    const note = selectedNote();
    if (!panel || !host || !note) return;
    panel.classList.toggle('open', state.inspectorOpen);
    state.root.querySelector('[data-nx-inspector-title]').textContent = note.title;
    state.root.querySelectorAll('[data-nx-tab]').forEach(button => button.classList.toggle('active', button.dataset.nxTab === state.inspectorTab));
    const incoming = incomingLinks(note);
    const outgoing = linksFor(note).map(noteByTitle).filter(Boolean);
    const lessons = relatedLessons(note);
    const mastery = Math.max(12, Math.min(96, 18 + note.body.trim().split(/\s+/).filter(Boolean).length * 2 + linksFor(note).length * 9));
    if (state.inspectorTab === 'overview') {
      host.innerHTML = `<div class="nx-mastery"><div class="nx-mastery-ring" style="--mastery:${mastery * 3.6}deg"><strong>${mastery}%</strong></div><div><span>${copy.mastery}</span><strong>${escapeHtml(note.title)}</strong><small>${copy.updated}: ${new Date(note.updatedAt).toLocaleDateString(isEnglish ? 'en-US' : 'ru-RU')}</small></div></div>
        <div class="nx-tag-row"><span>#${inferGroup(note)}</span><span>#${inferTopic(note).replace('topic-', '')}</span><span>#knowledge</span></div>
        <div class="nx-note-preview">${markdown(note.body)}</div>
        <section class="nx-inspector-section"><header><strong>${copy.related}</strong><span>${lessons.length}</span></header>${lessons.length ? lessons.map(item => `<button type="button" class="nx-related-row" data-nx-lesson="${escapeHtml(item.sectionId)}" data-nx-lesson-title="${escapeHtml(item.title)}">${icon('tabler:book-2', 15)}<span>${escapeHtml(item.title)}</span>${icon('tabler:arrow-up-right', 14)}</button>`).join('') : `<p>${copy.noLessons}</p>`}</section>
        <button type="button" class="nx-primary-button" data-nx-edit-note>${icon('tabler:edit', 16)} ${copy.openNote}</button>`;
    } else if (state.inspectorTab === 'links') {
      const rows = (items, direction) => items.length ? items.map(item => `<button type="button" class="nx-related-row" data-nx-open="${escapeHtml(item.id)}">${icon(direction, 15)}<span>${escapeHtml(item.title)}</span></button>`).join('') : `<p>${copy.noLinks}</p>`;
      host.innerHTML = `<section class="nx-inspector-section"><header><strong>${copy.outgoing}</strong><span>${outgoing.length}</span></header>${rows(outgoing, 'tabler:arrow-up-right')}</section>
        <section class="nx-inspector-section"><header><strong>${copy.backlinks}</strong><span>${incoming.length}</span></header>${rows(incoming, 'tabler:corner-down-left')}</section>`;
    } else {
      host.innerHTML = `<label class="nx-editor-field"><span>${copy.titlePlaceholder}</span><input type="text" data-nx-note-title value="${escapeHtml(note.title)}"></label>
        <label class="nx-editor-field grow"><span>${copy.bodyPlaceholder}</span><textarea data-nx-note-body spellcheck="false">${escapeHtml(note.body)}</textarea></label>
        <div class="nx-editor-actions"><span data-nx-save-state>${copy.saved}</span><button type="button" class="nx-danger-button" data-nx-delete>${icon('tabler:trash', 15)} ${copy.delete}</button></div>`;
    }
  }

  function saveEditor() {
    const note = selectedNote();
    const title = state.root.querySelector('[data-nx-note-title]');
    const body = state.root.querySelector('[data-nx-note-body]');
    if (!note || !title || !body) return;
    note.title = title.value.trim() || copy.untitled;
    note.body = body.value;
    note.updatedAt = Date.now();
    clearTimeout(state.timer);
    state.timer = setTimeout(() => {
      writeJson(NOTES_KEY, state.notes);
      rebuildGraph(); renderExplorer();
      state.root.querySelector('[data-nx-inspector-title]').textContent = note.title;
    }, 320);
  }

  function createNote(title = copy.untitled) {
    const note = { id: `note-${Date.now().toString(36)}`, title, body: '', updatedAt: Date.now() };
    state.notes.unshift(note);
    state.selectedId = note.id;
    state.inspectorTab = 'edit'; state.inspectorOpen = true;
    writeJson(NOTES_KEY, state.notes); persistUi(); rebuildGraph(); renderExplorer(); renderInspector();
    requestAnimationFrame(() => state.root.querySelector('[data-nx-note-title]')?.select());
  }

  function deleteSelected() {
    const note = selectedNote();
    if (!note || !confirm(copy.confirmDelete)) return;
    state.notes = state.notes.filter(item => item.id !== note.id);
    if (!state.notes.length) state.notes = defaultNotes();
    state.selectedId = state.notes[0].id;
    writeJson(NOTES_KEY, state.notes); persistUi(); rebuildGraph(); renderExplorer(); renderInspector();
  }

  function exportNotes() {
    const payload = { version: 3, exportedAt: new Date().toISOString(), notes: state.notes, graph: readJson(GRAPH_KEY, {}), camera: state.camera };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob); link.download = 'webdevgym-nexus.json'; link.click();
    setTimeout(() => URL.revokeObjectURL(link.href), 0);
  }

  function importNotes() {
    const input = document.createElement('input');
    input.type = 'file'; input.accept = 'application/json,.json';
    input.onchange = () => {
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const payload = JSON.parse(String(reader.result || '{}'));
          if (!Array.isArray(payload.notes)) throw new Error('invalid');
          state.notes = payload.notes.map((note, index) => ({ id: String(note.id || `note-${Date.now()}-${index}`), title: String(note.title || copy.untitled), body: String(note.body || ''), updatedAt: Number(note.updatedAt || Date.now()) }));
          state.selectedId = state.notes[0]?.id || '';
          writeJson(NOTES_KEY, state.notes);
          if (payload.graph) writeJson(GRAPH_KEY, payload.graph);
          if (payload.camera) state.camera = { ...state.camera, ...payload.camera };
          rebuildGraph(); renderExplorer(); renderInspector();
        } catch { alert(copy.importError); }
      };
      if (input.files?.[0]) reader.readAsText(input.files[0]);
    };
    input.click();
  }

  function zoomAt(factor, clientX, clientY) {
    const rect = state.root.querySelector('[data-nx-svg]').getBoundingClientRect();
    const px = clientX ?? rect.left + rect.width / 2;
    const py = clientY ?? rect.top + rect.height / 2;
    const worldX = (px - rect.left - state.camera.x) / state.camera.zoom;
    const worldY = (py - rect.top - state.camera.y) / state.camera.zoom;
    const zoom = Math.max(0.35, Math.min(2.2, state.camera.zoom * factor));
    state.camera.x = px - rect.left - worldX * zoom;
    state.camera.y = py - rect.top - worldY * zoom;
    state.camera.zoom = zoom;
    applyCamera();
    clearTimeout(state.timer);
    state.timer = setTimeout(saveGraph, 160);
  }

  function fitGraph() {
    const svg = state.root?.querySelector('[data-nx-svg]');
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    state.camera.zoom = Math.max(0.42, Math.min(1.1, Math.min(rect.width / 1500, rect.height / 860) * 0.92));
    state.camera.x = (rect.width - 1500 * state.camera.zoom) / 2;
    state.camera.y = (rect.height - 860 * state.camera.zoom) / 2;
    applyCamera(); saveGraph();
  }

  function centerSelected() {
    const node = state.nodes.get(state.selectedId);
    const svg = state.root.querySelector('[data-nx-svg]');
    if (!node || !svg) return fitGraph();
    const rect = svg.getBoundingClientRect();
    state.camera.zoom = Math.max(0.75, Math.min(1.25, state.camera.zoom));
    state.camera.x = rect.width / 2 - node.x * state.camera.zoom;
    state.camera.y = rect.height / 2 - node.y * state.camera.zoom;
    applyCamera(); saveGraph();
  }

  function renderMinimap() {
    const mini = state.root?.querySelector('[data-nx-mini-world]');
    const viewport = state.root?.querySelector('[data-nx-mini-camera]');
    const svg = state.root?.querySelector('[data-nx-svg]');
    if (!mini || !viewport || !svg) return;
    mini.innerHTML = [...state.nodes.values()].filter(visibleNode).map(node => `<circle cx="${node.x * 0.12}" cy="${node.y * 0.122}" r="${node.type === 'topic' ? 3.2 : 2}" fill="${node.accent}" opacity="${node.id === state.selectedId ? 1 : .72}"></circle>`).join('');
    const rect = svg.getBoundingClientRect();
    viewport.setAttribute('x', Math.max(0, -state.camera.x / state.camera.zoom * 0.12));
    viewport.setAttribute('y', Math.max(0, -state.camera.y / state.camera.zoom * 0.122));
    viewport.setAttribute('width', Math.min(180, rect.width / state.camera.zoom * 0.12));
    viewport.setAttribute('height', Math.min(105, rect.height / state.camera.zoom * 0.122));
  }

  function bindEvents() {
    const root = state.root;
    root.addEventListener('click', event => {
      const button = event.target.closest('button');
      if (!button) return;
      if (button.dataset.nxMode) {
        state.mode = button.dataset.nxMode; persistUi();
        root.querySelectorAll('[data-nx-mode]').forEach(item => item.classList.toggle('active', item === button)); renderGraph();
      } else if (button.hasAttribute('data-nx-explorer-toggle')) {
        state.explorerOpen = !state.explorerOpen;
        if (isCompact() && state.explorerOpen) state.inspectorOpen = false;
        persistUi(); renderExplorer(); renderInspector();
      } else if (button.hasAttribute('data-nx-inspector-close')) {
        state.inspectorOpen = false; persistUi(); root.querySelector('[data-nx-inspector]').classList.remove('open');
      } else if (button.dataset.nxGroup) {
        state.group = button.dataset.nxGroup; renderExplorer(); renderGraph();
      } else if (button.dataset.nxOpen) selectNode(button.dataset.nxOpen);
      else if (button.dataset.nxTab) { state.inspectorTab = button.dataset.nxTab; renderInspector(); }
      else if (button.hasAttribute('data-nx-edit-note')) { state.inspectorTab = 'edit'; renderInspector(); }
      else if (button.hasAttribute('data-nx-new')) createNote();
      else if (button.hasAttribute('data-nx-delete')) deleteSelected();
      else if (button.hasAttribute('data-nx-export')) exportNotes();
      else if (button.hasAttribute('data-nx-import')) importNotes();
      else if (button.hasAttribute('data-nx-zoom-in')) zoomAt(1.18);
      else if (button.hasAttribute('data-nx-zoom-out')) zoomAt(0.84);
      else if (button.hasAttribute('data-nx-fit')) fitGraph();
      else if (button.hasAttribute('data-nx-center')) centerSelected();
      else if (button.hasAttribute('data-nx-reset')) { localStorage.removeItem(GRAPH_KEY); rebuildGraph(true); fitGraph(); }
      else if (button.dataset.nxFilter) {
        if (button.dataset.nxFilter === 'topics') state.showTopics = !state.showTopics;
        else state.showNotes = !state.showNotes;
        button.classList.toggle('active'); renderGraph();
      } else if (button.dataset.nxLink !== undefined) {
        if (button.dataset.nxLink) selectNode(button.dataset.nxLink);
        else createNote(button.dataset.nxLinkTitle || copy.untitled);
      } else if (button.dataset.nxLesson) {
        const name = button.dataset.nxLesson.replace(/^sec-/, '');
        if (typeof window.switchTabByName === 'function') window.switchTabByName(name);
        setTimeout(() => {
          const section = document.getElementById(button.dataset.nxLesson);
          const target = [...(section?.querySelectorAll(':scope > .block') || [])].find(block => block.textContent.includes(button.dataset.nxLessonTitle));
          target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 180);
      }
    });

    root.addEventListener('input', event => {
      if (event.target.matches('[data-nx-search]')) {
        state.query = event.target.value; renderExplorer(); renderGraph();
        requestAnimationFrame(() => { const input = root.querySelector('[data-nx-search]'); input?.focus(); input?.setSelectionRange(state.query.length, state.query.length); });
      }
      if (event.target.matches('[data-nx-note-title], [data-nx-note-body]')) saveEditor();
    });

    const stage = root.querySelector('[data-nx-stage]');
    stage.addEventListener('pointerdown', event => {
      if (event.target.closest('[data-nx-node], button, input, textarea, .nx-explorer, .nx-inspector')) return;
      state.panning = { startX: event.clientX, startY: event.clientY, x: state.camera.x, y: state.camera.y };
      stage.classList.add('panning'); stage.setPointerCapture(event.pointerId);
    });
    stage.addEventListener('pointermove', event => {
      if (!state.panning) return;
      state.camera.x = state.panning.x + event.clientX - state.panning.startX;
      state.camera.y = state.panning.y + event.clientY - state.panning.startY;
      applyCamera();
    });
    const endPan = event => {
      if (!state.panning) return;
      state.panning = null; stage.classList.remove('panning');
      if (stage.hasPointerCapture(event.pointerId)) stage.releasePointerCapture(event.pointerId);
      saveGraph();
    };
    stage.addEventListener('pointerup', endPan); stage.addEventListener('pointercancel', endPan);
    stage.addEventListener('wheel', event => { event.preventDefault(); zoomAt(event.deltaY < 0 ? 1.1 : 0.9, event.clientX, event.clientY); }, { passive: false });
    stage.addEventListener('dblclick', event => { if (!event.target.closest('[data-nx-node]')) zoomAt(1.24, event.clientX, event.clientY); });
    window.addEventListener('resize', () => {
      clearTimeout(state.timer);
      state.timer = setTimeout(() => {
        const compact = isCompact();
        if (compact && !state.compact) {
          state.explorerOpen = false;
          state.inspectorOpen = false;
          renderExplorer();
          renderInspector();
        }
        state.compact = compact;
        renderMinimap();
      }, 120);
    });
  }

  function init() {
    setTimeout(() => {
      if (installShell() && state.root?.classList.contains('active')) setTimeout(fitGraph, 100);
      state.wasActive = Boolean(state.root?.classList.contains('active'));
      const observer = new MutationObserver(() => {
        const section = document.getElementById('sec-nexus');
        if (section && section.dataset.nexusV3 !== '1') {
          setTimeout(installShell, 260);
          return;
        }
        const isActive = Boolean(section?.classList.contains('active'));
        if (isActive && !state.wasActive) setTimeout(fitGraph, 80);
        state.wasActive = isActive;
      });
      observer.observe(document.body, { subtree: true, childList: true, attributes: true, attributeFilter: ['class'] });
      window.WebDevGymNexusV3 = { fit: fitGraph, refresh: () => { state.root?.removeAttribute('data-nexus-v3'); installShell(); }, version: 3 };
    }, 440);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
