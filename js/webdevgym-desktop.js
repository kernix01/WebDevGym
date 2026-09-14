(function () {
  'use strict';

  const api = window.webdevgymDesktop?.desktop;
  if (!api) return;

  const isEnglish = document.documentElement.lang === 'en' || location.pathname.endsWith('index-en.html');
  const copy = isEnglish ? {
    title: 'Desktop Center', subtitle: 'Local workspace', open: 'Open folder', projects: 'Files', terminal: 'Terminal',
    git: 'Git', backups: 'Backups', app: 'App', recents: 'Recent projects', noProject: 'Choose a project folder',
    noProjectShort: 'No project selected', save: 'Save', saved: 'Saved', saving: 'Saving...', reveal: 'Show in Explorer',
    preview: 'Preview', refresh: 'Refresh', run: 'Run', stop: 'Stop', command: 'Command', clear: 'Clear',
    status: 'Status', history: 'History', commit: 'Commit', push: 'Push', commitMessage: 'Commit message',
    createBackup: 'Create backup', restore: 'Restore', noBackups: 'No backups yet', version: 'Version',
    checkUpdate: 'Check for updates', notify: 'Test notification', tray: 'Minimize WebDevGym to tray', quit: 'Quit',
    close: 'Close', file: 'File', project: 'Project', ready: 'Ready', updateReady: 'Update available',
    upToDate: 'You have the latest version', restored: 'Backup restored', confirmRestore: 'Restore this backup over the current project?',
    timerDone: 'Timer finished', focusDone: 'Focus session finished', breakDone: 'Break finished', npmInstall: 'npm install',
    newFile: 'New file', newFolder: 'New folder', collapseAll: 'Collapse folders', rename: 'Rename',
    deleteItem: 'Delete', removeProject: 'Remove from recent projects', fileNamePrompt: 'File name',
    folderNamePrompt: 'Folder name', renamePrompt: 'New name', confirmDelete: 'Delete this item from disk?',
    confirmForget: 'Remove this project from recent projects? Files on disk will remain.', invalidName: 'Enter one valid name'
  } : {
    title: 'Desktop Center', subtitle: 'Локальное рабочее пространство', open: 'Открыть папку', projects: 'Файлы',
    terminal: 'Терминал', git: 'Git', backups: 'Снимки', app: 'Приложение', recents: 'Недавние проекты',
    noProject: 'Выбери папку проекта', noProjectShort: 'Проект не выбран', save: 'Сохранить', saved: 'Сохранено',
    saving: 'Сохранение...', reveal: 'Показать в проводнике', preview: 'Предпросмотр', refresh: 'Обновить',
    run: 'Запустить', stop: 'Остановить', command: 'Команда', clear: 'Очистить', status: 'Статус',
    history: 'История', commit: 'Коммит', push: 'Отправить', commitMessage: 'Сообщение коммита',
    createBackup: 'Создать снимок', restore: 'Восстановить', noBackups: 'Снимков пока нет', version: 'Версия',
    checkUpdate: 'Проверить обновления', notify: 'Тест уведомления', tray: 'Свернуть WebDevGym в трей',
    quit: 'Выйти', close: 'Закрыть', file: 'Файл', project: 'Проект', ready: 'Готово',
    updateReady: 'Доступно обновление', upToDate: 'Установлена последняя версия', restored: 'Снимок восстановлен',
    confirmRestore: 'Восстановить этот снимок поверх текущего проекта?', timerDone: 'Таймер завершён',
    focusDone: 'Фокус-сессия завершена', breakDone: 'Перерыв завершён', npmInstall: 'npm install',
    newFile: 'Новый файл', newFolder: 'Новая папка', collapseAll: 'Свернуть папки', rename: 'Переименовать',
    deleteItem: 'Удалить', removeProject: 'Убрать из недавних', fileNamePrompt: 'Имя файла',
    folderNamePrompt: 'Имя папки', renamePrompt: 'Новое имя', confirmDelete: 'Удалить этот элемент с диска?',
    confirmForget: 'Убрать проект из недавних? Файлы на диске останутся.', invalidName: 'Введи одно корректное имя'
  };

  const state = {
    activeView: 'projects',
    appInfo: null,
    currentFile: '',
    dirty: false,
    expandedFolders: new Set(),
    preview: null,
    processId: '',
    project: null,
    recents: [],
    saveTimer: 0,
    selectedPath: '',
    selectedType: ''
  };

  const icon = (name, size = 17) => `<iconify-icon icon="tabler:${name}" width="${size}" height="${size}" aria-hidden="true"></iconify-icon>`;

  function buildShell() {
    const launcher = document.createElement('button');
    launcher.id = 'wdgdLauncher';
    launcher.className = 'wdgd-launcher wdgd-launcher-fixed';
    launcher.type = 'button';
    launcher.title = copy.title;
    launcher.setAttribute('aria-label', copy.title);
    launcher.setAttribute('aria-expanded', 'false');
    launcher.innerHTML = icon('device-desktop-code', 19);

    const shell = document.createElement('section');
    shell.id = 'wdgdShell';
    shell.className = 'wdgd-shell';
    shell.hidden = true;
    shell.setAttribute('role', 'dialog');
    shell.setAttribute('aria-modal', 'true');
    shell.setAttribute('aria-label', copy.title);
    shell.innerHTML = `
      <div class="wdgd-window">
        <header class="wdgd-titlebar">
          ${icon('device-desktop-code', 20)}
          <div class="wdgd-titlebar-copy"><strong>${copy.title}</strong><small data-desktop-project-name>${copy.noProjectShort}</small></div>
          <button class="wdgd-icon-button" type="button" data-desktop-tray title="${copy.tray}" aria-label="${copy.tray}">${icon('minus', 18)}</button>
          <button class="wdgd-icon-button" type="button" data-desktop-close title="${copy.close}" aria-label="${copy.close}">${icon('x', 18)}</button>
        </header>
        <div class="wdgd-main">
          <aside class="wdgd-sidebar">
            <button class="wdgd-button primary wdgd-project-button" type="button" data-desktop-open>${icon('folder-open', 17)} ${copy.open}</button>
            <nav class="wdgd-nav" aria-label="${copy.title}">
              ${tabButton('projects', 'files', copy.projects)}
              ${tabButton('terminal', 'terminal-2', copy.terminal)}
              ${tabButton('git', 'brand-git', copy.git)}
              ${tabButton('backups', 'history', copy.backups)}
              ${tabButton('app', 'settings', copy.app)}
            </nav>
            <div class="wdgd-recents"><span class="wdgd-section-label">${copy.recents}</span><div data-desktop-recents></div></div>
          </aside>
          <main class="wdgd-content">
            <section class="wdgd-view" data-desktop-view="projects">
              <div class="wdgd-empty" data-desktop-empty><div>${icon('folder-plus', 34)}<strong>${copy.noProject}</strong><button class="wdgd-button primary" type="button" data-desktop-open>${copy.open}</button></div></div>
              <div class="wdgd-workspace" data-desktop-workspace hidden>
                <section class="wdgd-pane">
                  <header class="wdgd-pane-head"><strong data-desktop-tree-title>${copy.project}</strong><button class="wdgd-icon-button" type="button" data-desktop-new-file title="${copy.newFile}" aria-label="${copy.newFile}">${icon('file-plus', 16)}</button><button class="wdgd-icon-button" type="button" data-desktop-new-folder title="${copy.newFolder}" aria-label="${copy.newFolder}">${icon('folder-plus', 16)}</button><button class="wdgd-icon-button" type="button" data-desktop-collapse title="${copy.collapseAll}" aria-label="${copy.collapseAll}">${icon('chevrons-up', 16)}</button><button class="wdgd-icon-button" type="button" data-desktop-refresh title="${copy.refresh}" aria-label="${copy.refresh}">${icon('refresh', 16)}</button></header>
                  <div class="wdgd-tree" data-desktop-tree></div>
                </section>
                <section class="wdgd-pane">
                  <header class="wdgd-pane-head"><strong data-desktop-file-name>${copy.file}</strong><button class="wdgd-button" type="button" data-desktop-reveal>${icon('folder-share', 15)} ${copy.reveal}</button><button class="wdgd-button primary" type="button" data-desktop-save>${icon('device-floppy', 15)} ${copy.save}</button></header>
                  <div class="wdgd-editor-wrap"><textarea class="wdgd-editor" data-desktop-editor spellcheck="false" disabled></textarea><div class="wdgd-editor-status" data-desktop-editor-status>${copy.ready}</div></div>
                </section>
                <section class="wdgd-pane wdgd-preview-pane">
                  <header class="wdgd-pane-head"><strong>${copy.preview}</strong><button class="wdgd-icon-button" type="button" data-desktop-preview-refresh title="${copy.refresh}" aria-label="${copy.refresh}">${icon('refresh', 16)}</button><button class="wdgd-button" type="button" data-desktop-preview>${icon('player-play', 15)} ${copy.preview}</button></header>
                  <iframe class="wdgd-preview" data-desktop-preview-frame title="${copy.preview}" sandbox="allow-scripts allow-forms allow-modals allow-popups"></iframe>
                </section>
              </div>
            </section>
            <section class="wdgd-view" data-desktop-view="terminal" hidden>
              <div class="wdgd-console-view">
                <div class="wdgd-toolbar" data-desktop-scripts></div>
                <form class="wdgd-command-row" data-desktop-command-form><input type="text" data-desktop-command placeholder="${copy.command}" autocomplete="off"><button class="wdgd-button primary" type="submit">${icon('player-play', 15)} ${copy.run}</button><button class="wdgd-button danger" type="button" data-desktop-stop>${icon('player-stop', 15)} ${copy.stop}</button><button class="wdgd-button" type="button" data-desktop-clear>${copy.clear}</button></form>
                <pre class="wdgd-terminal" data-desktop-terminal></pre>
              </div>
            </section>
            <section class="wdgd-view" data-desktop-view="git" hidden>
              <div class="wdgd-git-view"><div class="wdgd-toolbar"><button class="wdgd-button primary" type="button" data-git-status>${icon('git-compare', 15)} ${copy.status}</button><button class="wdgd-button" type="button" data-git-history>${icon('history', 15)} ${copy.history}</button><button class="wdgd-button" type="button" data-git-push>${icon('cloud-upload', 15)} ${copy.push}</button></div><form class="wdgd-form-row" data-git-commit-form><input type="text" maxlength="120" data-git-message placeholder="${copy.commitMessage}"><button class="wdgd-button" type="submit">${icon('git-commit', 15)} ${copy.commit}</button></form><pre class="wdgd-git-output" data-git-output></pre></div>
            </section>
            <section class="wdgd-view" data-desktop-view="backups" hidden>
              <div class="wdgd-backup-view"><div class="wdgd-toolbar"><button class="wdgd-button primary" type="button" data-backup-create>${icon('device-floppy', 15)} ${copy.createBackup}</button><button class="wdgd-button" type="button" data-backup-refresh>${icon('refresh', 15)} ${copy.refresh}</button></div><div class="wdgd-backup-list" data-backup-list></div></div>
            </section>
            <section class="wdgd-view" data-desktop-view="app" hidden>
              <div class="wdgd-app-view"><div class="wdgd-grid"><section class="wdgd-section"><h3>${copy.app}</h3><p class="wdgd-muted" data-app-version>${copy.version}</p><div class="wdgd-toolbar"><button class="wdgd-button primary" type="button" data-app-update>${icon('refresh', 15)} ${copy.checkUpdate}</button><button class="wdgd-button" type="button" data-app-notify>${icon('bell', 15)} ${copy.notify}</button></div></section><section class="wdgd-section"><h3>WebDevGym</h3><div class="wdgd-toolbar"><button class="wdgd-button" type="button" data-desktop-tray>${icon('minus', 15)} ${copy.tray}</button><button class="wdgd-button danger" type="button" data-app-quit>${icon('power', 15)} ${copy.quit}</button></div></section></div></div>
            </section>
          </main>
        </div>
        <footer class="wdgd-statusbar"><span data-desktop-status>${copy.ready}</span><span data-desktop-root></span></footer>
      </div>`;

    document.body.append(shell, launcher);
    return { launcher, shell };
  }

  function tabButton(view, iconName, label) {
    return `<button class="wdgd-tab${view === 'projects' ? ' active' : ''}" type="button" data-desktop-tab="${view}">${icon(iconName, 17)}<span>${label}</span></button>`;
  }

  const elements = buildShell();
  const shell = elements.shell;
  const launcher = elements.launcher;
  const editor = shell.querySelector('[data-desktop-editor]');
  const editorStatus = shell.querySelector('[data-desktop-editor-status]');
  const terminal = shell.querySelector('[data-desktop-terminal]');
  const gitOutput = shell.querySelector('[data-git-output]');
  const previewFrame = shell.querySelector('[data-desktop-preview-frame]');

  function mountLauncher() {
    const toolbar = [...document.querySelectorAll('.wdg-commandbar, .top-bar')]
      .find(candidate => candidate.offsetParent !== null && candidate.getBoundingClientRect().width > 300);
    if (!toolbar) {
      if (!launcher.isConnected) document.body.append(launcher);
      launcher.classList.add('wdgd-launcher-fixed');
      return;
    }
    const candidate = toolbar.querySelector('#wdgAiBtn') || toolbar.querySelector('.wdg-lang');
    const anchor = candidate?.parentElement === toolbar ? candidate : null;
    try {
      toolbar.insertBefore(launcher, anchor);
      launcher.classList.remove('wdgd-launcher-fixed');
      requestAnimationFrame(() => {
        const rect = launcher.getBoundingClientRect();
        if (launcher.offsetParent !== null && rect.left >= 0 && rect.right <= window.innerWidth) return;
        document.body.append(launcher);
        launcher.classList.add('wdgd-launcher-fixed');
      });
    } catch {
      document.body.append(launcher);
      launcher.classList.add('wdgd-launcher-fixed');
    }
  }

  function setOpen(open) {
    shell.hidden = !open;
    document.body.classList.toggle('wdgd-open', open);
    launcher.setAttribute('aria-expanded', String(open));
    if (open) shell.querySelector('[data-desktop-open]').focus();
  }

  function setStatus(message, kind = '') {
    const target = shell.querySelector('[data-desktop-status]');
    target.textContent = message;
    target.className = kind;
  }

  function errorMessage(error) {
    return error?.message || String(error || 'Unknown error');
  }

  async function withStatus(action, successMessage = copy.ready) {
    try {
      const result = await action();
      setStatus(successMessage, 'ok');
      return result;
    } catch (error) {
      setStatus(errorMessage(error), 'error');
      return null;
    }
  }

  function switchView(view) {
    state.activeView = view;
    shell.querySelectorAll('[data-desktop-tab]').forEach(button => button.classList.toggle('active', button.dataset.desktopTab === view));
    shell.querySelectorAll('[data-desktop-view]').forEach(section => { section.hidden = section.dataset.desktopView !== view; });
    if (view === 'backups' && state.project) void renderBackups();
    if (view === 'git' && state.project) void showGit('status');
  }

  function renderRecents() {
    const root = shell.querySelector('[data-desktop-recents]');
    root.replaceChildren();
    state.recents.forEach(project => {
      const row = document.createElement('div');
      row.className = 'wdgd-recent-row';
      const button = document.createElement('button');
      button.className = `wdgd-recent${state.project?.root === project.path ? ' active' : ''}`;
      button.type = 'button';
      const name = document.createElement('strong');
      const location = document.createElement('small');
      name.textContent = project.name;
      location.textContent = project.path;
      button.append(name, location);
      button.addEventListener('click', () => void openProject(project.path));
      const remove = document.createElement('button');
      remove.className = 'wdgd-recent-remove';
      remove.type = 'button';
      remove.title = copy.removeProject;
      remove.setAttribute('aria-label', `${copy.removeProject}: ${project.name}`);
      remove.innerHTML = icon('x', 15);
      remove.addEventListener('click', () => void forgetProject(project.path));
      row.append(button, remove);
      root.append(row);
    });
  }

  function renderProject() {
    const hasProject = Boolean(state.project);
    shell.querySelector('[data-desktop-empty]').hidden = hasProject;
    shell.querySelector('[data-desktop-workspace]').hidden = !hasProject;
    shell.querySelector('[data-desktop-project-name]').textContent = state.project?.name || copy.noProjectShort;
    shell.querySelector('[data-desktop-root]').textContent = state.project?.root || '';
    renderRecents();
    if (!hasProject) {
      shell.querySelector('[data-desktop-tree]').replaceChildren();
      shell.querySelector('[data-desktop-tree-title]').textContent = copy.project;
      return;
    }
    shell.querySelector('[data-desktop-tree-title]').textContent = state.project.name;
    renderTree();
    renderScripts();
  }

  function renderTree() {
    const tree = shell.querySelector('[data-desktop-tree]');
    tree.replaceChildren();
    if (!state.project) return;
    const children = new Map();
    state.project.entries.forEach(entry => {
      const separator = entry.path.lastIndexOf('/');
      const parent = separator === -1 ? '' : entry.path.slice(0, separator);
      if (!children.has(parent)) children.set(parent, []);
      children.get(parent).push(entry);
    });
    children.forEach(entries => entries.sort((left, right) => {
      if (left.type !== right.type) return left.type === 'directory' ? -1 : 1;
      return left.path.localeCompare(right.path, undefined, { numeric: true });
    }));

    const appendChildren = (parent = '', depth = 0) => {
      (children.get(parent) || []).forEach(entry => {
        const container = document.createElement('div');
        container.className = 'wdgd-tree-entry';
        const row = document.createElement('button');
        row.className = `wdgd-tree-row${state.currentFile === entry.path ? ' active' : ''}${state.selectedPath === entry.path ? ' selected' : ''}`;
        row.type = 'button';
        row.style.paddingLeft = `${7 + depth * 13}px`;
        row.title = entry.path;

        const expanded = entry.type === 'directory' && state.expandedFolders.has(entry.path);
        const twisty = document.createElement('span');
        twisty.className = 'wdgd-tree-twisty';
        twisty.innerHTML = entry.type === 'directory' ? icon(expanded ? 'chevron-down' : 'chevron-right', 14) : '';
        const marker = document.createElement('span');
        marker.innerHTML = icon(entry.type === 'file' ? 'file-code' : expanded ? 'folder-open' : 'folder', 15);
        const label = document.createElement('span');
        label.textContent = entry.path.split('/').at(-1);
        row.append(twisty, marker, label);
        row.addEventListener('click', () => {
          state.selectedPath = entry.path;
          state.selectedType = entry.type;
          if (entry.type === 'directory') {
            if (expanded) state.expandedFolders.delete(entry.path);
            else state.expandedFolders.add(entry.path);
            renderTree();
          } else {
            void openFile(entry.path);
          }
        });

        const actions = document.createElement('div');
        actions.className = 'wdgd-tree-actions';
        const rename = document.createElement('button');
        rename.type = 'button';
        rename.title = copy.rename;
        rename.setAttribute('aria-label', `${copy.rename}: ${entry.path}`);
        rename.innerHTML = icon('pencil', 14);
        rename.addEventListener('click', () => void renameEntry(entry));
        const remove = document.createElement('button');
        remove.type = 'button';
        remove.title = copy.deleteItem;
        remove.setAttribute('aria-label', `${copy.deleteItem}: ${entry.path}`);
        remove.innerHTML = icon('trash', 14);
        remove.addEventListener('click', () => void deleteEntry(entry));
        actions.append(rename, remove);
        container.append(row, actions);
        tree.append(container);
        if (expanded) appendChildren(entry.path, depth + 1);
      });
    };

    appendChildren();
  }

  function renderScripts() {
    const root = shell.querySelector('[data-desktop-scripts]');
    root.replaceChildren();
    const install = document.createElement('button');
    install.className = 'wdgd-script-button';
    install.type = 'button';
    install.textContent = copy.npmInstall;
    install.addEventListener('click', () => void runCommand('npm install'));
    root.append(install);
    Object.keys(state.project?.scripts || {}).forEach(name => {
      const button = document.createElement('button');
      button.className = 'wdgd-script-button';
      button.type = 'button';
      button.textContent = `npm run ${name}`;
      button.addEventListener('click', () => void runCommand(`npm run ${name}`));
      root.append(button);
    });
  }

  function parentPath(entryPath = '') {
    const separator = entryPath.lastIndexOf('/');
    return separator === -1 ? '' : entryPath.slice(0, separator);
  }

  function selectedDirectory() {
    if (state.selectedType === 'directory') return state.selectedPath;
    return parentPath(state.selectedPath || state.currentFile);
  }

  function validEntryName(value) {
    const name = String(value || '').trim();
    if (!name || name === '.' || name === '..' || /[\\/:*?"<>|\0]/.test(name) || /[. ]$/.test(name)) return '';
    return name;
  }

  function childPath(directory, name) {
    return directory ? `${directory}/${name}` : name;
  }

  function rebasePath(value, from, to) {
    if (value === from) return to;
    return value.startsWith(`${from}/`) ? `${to}${value.slice(from.length)}` : value;
  }

  async function createEntry(type) {
    if (!state.project) return setStatus(copy.noProjectShort, 'error');
    const directory = selectedDirectory();
    const rawName = window.prompt(type === 'file' ? copy.fileNamePrompt : copy.folderNamePrompt, '');
    if (rawName === null) return;
    const name = validEntryName(rawName);
    if (!name) return setStatus(copy.invalidName, 'error');
    const entryPath = childPath(directory, name);
    const result = await withStatus(() => type === 'file'
      ? api.createFile(state.project.root, entryPath)
      : api.createDirectory(state.project.root, entryPath));
    if (!result) return;
    if (directory) state.expandedFolders.add(directory);
    state.selectedPath = entryPath;
    state.selectedType = type === 'file' ? 'file' : 'directory';
    await refreshProject();
    if (type === 'file') await openFile(entryPath);
  }

  async function renameEntry(entry) {
    if (!state.project) return;
    const oldName = entry.path.split('/').at(-1);
    const rawName = window.prompt(copy.renamePrompt, oldName);
    if (rawName === null) return;
    const name = validEntryName(rawName);
    if (!name) return setStatus(copy.invalidName, 'error');
    const nextPath = childPath(parentPath(entry.path), name);
    if (nextPath === entry.path) return;
    await saveNow();
    const result = await withStatus(() => api.renameEntry(state.project.root, entry.path, nextPath));
    if (!result) return;
    state.expandedFolders = new Set([...state.expandedFolders].map(value => rebasePath(value, entry.path, nextPath)));
    state.selectedPath = rebasePath(state.selectedPath, entry.path, nextPath);
    state.currentFile = rebasePath(state.currentFile, entry.path, nextPath);
    await refreshProject();
    if (state.currentFile) await openFile(state.currentFile);
  }

  async function deleteEntry(entry) {
    if (!state.project || !window.confirm(`${copy.confirmDelete}\n\n${entry.path}`)) return;
    await saveNow();
    const result = await withStatus(() => api.deleteEntry(state.project.root, entry.path));
    if (!result) return;
    const containsCurrentFile = state.currentFile === entry.path || state.currentFile.startsWith(`${entry.path}/`);
    if (containsCurrentFile) {
      state.currentFile = '';
      state.dirty = false;
      editor.value = '';
      editor.disabled = true;
      shell.querySelector('[data-desktop-file-name]').textContent = copy.file;
      editorStatus.textContent = copy.ready;
    }
    if (state.selectedPath === entry.path || state.selectedPath.startsWith(`${entry.path}/`)) {
      state.selectedPath = '';
      state.selectedType = '';
    }
    state.expandedFolders = new Set([...state.expandedFolders].filter(value => value !== entry.path && !value.startsWith(`${entry.path}/`)));
    await refreshProject();
  }

  async function forgetProject(root) {
    if (!window.confirm(copy.confirmForget)) return;
    if (state.project?.root === root) {
      await saveNow();
      await stopPreview();
    }
    const recents = await withStatus(() => api.forgetProject(root));
    if (!recents) return;
    state.recents = recents;
    if (state.project?.root === root) {
      state.project = null;
      state.currentFile = '';
      state.selectedPath = '';
      state.selectedType = '';
      state.expandedFolders.clear();
      state.dirty = false;
      editor.value = '';
      editor.disabled = true;
      shell.querySelector('[data-desktop-file-name]').textContent = copy.file;
    }
    renderProject();
  }

  async function chooseProject() {
    const project = await withStatus(() => api.chooseProject());
    if (!project) return;
    await selectProject(project);
  }

  async function openProject(root) {
    const project = await withStatus(() => api.openProject(root));
    if (!project) return;
    await selectProject(project);
  }

  async function selectProject(project) {
    await stopPreview();
    await saveNow();
    state.project = project;
    state.currentFile = '';
    state.selectedPath = '';
    state.selectedType = '';
    state.expandedFolders.clear();
    editor.value = '';
    editor.disabled = true;
    const recents = await api.recentProjects();
    state.recents = Array.isArray(recents) ? recents : [];
    renderProject();
    switchView('projects');
  }

  async function refreshProject() {
    if (!state.project) return;
    const project = await withStatus(() => api.refreshProject(state.project.root));
    if (!project) return;
    state.project = project;
    renderProject();
  }

  async function openFile(filePath) {
    if (!state.project) return;
    await saveNow();
    const result = await withStatus(() => api.readFile(state.project.root, filePath));
    if (!result) return;
    state.currentFile = filePath;
    state.selectedPath = filePath;
    state.selectedType = 'file';
    state.dirty = false;
    editor.value = result.content;
    editor.disabled = false;
    shell.querySelector('[data-desktop-file-name]').textContent = filePath;
    editorStatus.textContent = copy.ready;
    renderTree();
  }

  function scheduleSave() {
    if (!state.currentFile) return;
    state.dirty = true;
    editorStatus.textContent = copy.saving;
    clearTimeout(state.saveTimer);
    state.saveTimer = window.setTimeout(saveNow, 700);
  }

  async function saveNow() {
    clearTimeout(state.saveTimer);
    if (!state.project || !state.currentFile || !state.dirty) return true;
    const result = await withStatus(() => api.writeFile(state.project.root, state.currentFile, editor.value), copy.saved);
    if (!result) return false;
    state.dirty = false;
    editorStatus.textContent = copy.saved;
    if (state.preview) previewFrame.src = `${state.preview.url}?refresh=${Date.now()}`;
    return true;
  }

  async function startPreview() {
    if (!state.project) return setStatus(copy.noProjectShort, 'error');
    await saveNow();
    const preview = await withStatus(() => api.startPreview(state.project.root));
    if (!preview) return;
    state.preview = preview;
    previewFrame.src = preview.url;
  }

  async function stopPreview() {
    if (!state.preview) return;
    await api.stopPreview(state.preview.id).catch(() => {});
    state.preview = null;
    previewFrame.removeAttribute('src');
  }

  function appendTerminal(text, kind = '') {
    const span = document.createElement('span');
    span.className = kind;
    span.textContent = text;
    terminal.append(span);
    terminal.scrollTop = terminal.scrollHeight;
  }

  async function runCommand(command) {
    if (!state.project) return setStatus(copy.noProjectShort, 'error');
    if (state.processId) return setStatus(isEnglish ? 'Stop the current process first' : 'Сначала останови текущий процесс', 'error');
    appendTerminal(`\n> ${command}\n`, 'success');
    const result = await withStatus(() => api.startProcess(state.project.root, command));
    if (result) state.processId = result.id;
  }

  async function stopProcess() {
    if (!state.processId) return;
    await withStatus(() => api.stopProcess(state.processId));
    state.processId = '';
  }

  async function showGit(mode) {
    if (!state.project) return setStatus(copy.noProjectShort, 'error');
    gitOutput.textContent = isEnglish ? 'Loading...\n' : 'Загрузка...\n';
    const result = await withStatus(() => mode === 'history' ? api.gitHistory(state.project.root) : api.gitStatus(state.project.root));
    if (!result) return;
    gitOutput.textContent = `${result.stdout || ''}${result.stderr || ''}` || (isEnglish ? 'No output.' : 'Нет вывода.');
  }

  async function commitGit(message) {
    if (!state.project) return setStatus(copy.noProjectShort, 'error');
    const result = await withStatus(() => api.gitCommit(state.project.root, message));
    if (!result) return;
    gitOutput.textContent = `${result.stdout || ''}${result.stderr || ''}`;
    await showGit('status');
  }

  async function pushGit() {
    if (!state.project) return setStatus(copy.noProjectShort, 'error');
    const result = await withStatus(() => api.gitPush(state.project.root));
    if (result) gitOutput.textContent = `${result.stdout || ''}${result.stderr || ''}`;
  }

  async function renderBackups() {
    const list = shell.querySelector('[data-backup-list]');
    if (!state.project) {
      list.textContent = copy.noProjectShort;
      return;
    }
    const backups = await withStatus(() => api.listBackups(state.project.root));
    if (!backups) return;
    list.replaceChildren();
    if (!backups.length) {
      const empty = document.createElement('span');
      empty.className = 'wdgd-muted';
      empty.textContent = copy.noBackups;
      list.append(empty);
      return;
    }
    backups.forEach(backup => {
      const row = document.createElement('div');
      row.className = 'wdgd-backup-item';
      const time = document.createElement('time');
      time.dateTime = backup.createdAt;
      time.textContent = new Date(backup.createdAt).toLocaleString();
      const restore = document.createElement('button');
      restore.className = 'wdgd-button';
      restore.type = 'button';
      restore.textContent = copy.restore;
      restore.addEventListener('click', async () => {
        if (!window.confirm(copy.confirmRestore)) return;
        const restored = await withStatus(() => api.restoreBackup(state.project.root, backup.id), copy.restored);
        if (restored) await refreshProject();
      });
      row.append(time, restore);
      list.append(row);
    });
  }

  async function createBackup() {
    if (!state.project) return setStatus(copy.noProjectShort, 'error');
    const result = await withStatus(() => api.createBackup(state.project.root));
    if (result) await renderBackups();
  }

  async function checkUpdate() {
    const update = await withStatus(() => api.checkUpdate());
    if (!update) return;
    const message = update.hasUpdate ? `${copy.updateReady}: ${update.latest}` : copy.upToDate;
    setStatus(message, 'ok');
    if (update.hasUpdate && window.confirm(`${message}. ${isEnglish ? 'Open the release page?' : 'Открыть страницу релиза?'}`)) {
      await api.openExternal(update.url);
    }
  }

  function monitorTimer() {
    let previous = null;
    window.setInterval(() => {
      let current = null;
      try { current = JSON.parse(localStorage.getItem('wdgu_timer_state_v1') || 'null'); } catch {}
      if (previous?.status === 'running' && current) {
        if (previous.mode === 'timer' && current.status === 'idle' && current.remaining === 0) {
          void api.notify('WebDevGym', copy.timerDone);
        } else if (previous.phase === 'focus' && current.phase === 'break') {
          void api.notify('WebDevGym', copy.focusDone);
        } else if (previous.phase === 'break' && current.phase === 'focus') {
          void api.notify('WebDevGym', copy.breakDone);
        }
      }
      previous = current;
    }, 1000);
  }

  launcher.addEventListener('click', () => setOpen(shell.hidden));
  shell.addEventListener('click', event => {
    if (event.target === shell) setOpen(false);
    const tab = event.target.closest('[data-desktop-tab]');
    if (tab) switchView(tab.dataset.desktopTab);
  });
  shell.querySelectorAll('[data-desktop-open]').forEach(button => button.addEventListener('click', chooseProject));
  shell.querySelector('[data-desktop-close]').addEventListener('click', () => setOpen(false));
  shell.querySelectorAll('[data-desktop-tray]').forEach(button => button.addEventListener('click', () => api.hideToTray()));
  shell.querySelector('[data-desktop-new-file]').addEventListener('click', () => void createEntry('file'));
  shell.querySelector('[data-desktop-new-folder]').addEventListener('click', () => void createEntry('directory'));
  shell.querySelector('[data-desktop-collapse]').addEventListener('click', () => {
    state.expandedFolders.clear();
    renderTree();
  });
  shell.querySelector('[data-desktop-refresh]').addEventListener('click', refreshProject);
  shell.querySelector('[data-desktop-save]').addEventListener('click', saveNow);
  shell.querySelector('[data-desktop-reveal]').addEventListener('click', () => {
    if (state.project) void withStatus(() => api.revealFile(state.project.root, state.currentFile || '.'));
  });
  shell.querySelector('[data-desktop-preview]').addEventListener('click', startPreview);
  shell.querySelector('[data-desktop-preview-refresh]').addEventListener('click', () => {
    if (state.preview) previewFrame.src = `${state.preview.url}?refresh=${Date.now()}`;
  });
  editor.addEventListener('keydown', event => {
    window.WebDevGymCodeEditor?.handleKeydown(editor, event, { fileName: state.currentFile });
  });
  editor.addEventListener('input', scheduleSave);
  shell.querySelector('[data-desktop-command-form]').addEventListener('submit', event => {
    event.preventDefault();
    const input = shell.querySelector('[data-desktop-command]');
    const command = input.value.trim();
    if (!command) return;
    void runCommand(command);
    input.value = '';
  });
  shell.querySelector('[data-desktop-stop]').addEventListener('click', stopProcess);
  shell.querySelector('[data-desktop-clear]').addEventListener('click', () => terminal.replaceChildren());
  shell.querySelector('[data-git-status]').addEventListener('click', () => showGit('status'));
  shell.querySelector('[data-git-history]').addEventListener('click', () => showGit('history'));
  shell.querySelector('[data-git-push]').addEventListener('click', pushGit);
  shell.querySelector('[data-git-commit-form]').addEventListener('submit', event => {
    event.preventDefault();
    const input = shell.querySelector('[data-git-message]');
    if (!input.value.trim()) return;
    void commitGit(input.value.trim());
    input.value = '';
  });
  shell.querySelector('[data-backup-create]').addEventListener('click', createBackup);
  shell.querySelector('[data-backup-refresh]').addEventListener('click', renderBackups);
  shell.querySelector('[data-app-update]').addEventListener('click', checkUpdate);
  shell.querySelector('[data-app-notify]').addEventListener('click', () => api.notify('WebDevGym', copy.ready));
  shell.querySelector('[data-app-quit]').addEventListener('click', () => api.quit());
  api.onProcessOutput(payload => {
    if (payload.id !== state.processId) return;
    appendTerminal(payload.text, payload.stream === 'stderr' ? 'stderr' : payload.stream === 'exit' ? 'success' : '');
    if (payload.stream === 'exit') state.processId = '';
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !shell.hidden) setOpen(false);
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's' && !shell.hidden) {
      event.preventDefault();
      void saveNow();
    }
  });

  const observer = new MutationObserver(() => {
    if (!launcher.isConnected) mountLauncher();
  });
  observer.observe(document.body, { childList: true, subtree: true });
  window.setTimeout(mountLauncher, 0);
  window.setTimeout(mountLauncher, 1200);
  monitorTimer();

  Promise.all([api.recentProjects(), api.appInfo()]).then(([recents, appInfo]) => {
    state.recents = Array.isArray(recents) ? recents : [];
    state.appInfo = appInfo;
    renderRecents();
    shell.querySelector('[data-app-version]').textContent = `${copy.version} ${appInfo.version} · ${appInfo.platform} · ${appInfo.shortcut}`;
  }).catch(error => setStatus(errorMessage(error), 'error'));
})();
