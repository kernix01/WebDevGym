(function () {
  'use strict';

  const api = window.webdevgymDesktop?.desktop;
  if (!api) return;

  const isEnglish = document.documentElement.lang === 'en' || location.pathname.endsWith('index-en.html');
  const copy = isEnglish ? {
    title: 'Desktop Center', subtitle: 'Local workspace', open: 'Open folder', projects: 'Files', search: 'Search', terminal: 'Runner',
    git: 'Git', docs: 'Docs', backups: 'Backups', app: 'App', recents: 'Recent projects', noProject: 'Choose a project folder',
    noProjectShort: 'No project selected', save: 'Save', saved: 'Saved', saving: 'Saving...', reveal: 'Show in Explorer',
    preview: 'Preview', refresh: 'Refresh', run: 'Run', stop: 'Stop', command: 'Command', clear: 'Clear',
    status: 'Status', history: 'History', commit: 'Commit', push: 'Push', commitMessage: 'Commit message',
    sourceControl: 'Source control', changes: 'Changes', noChanges: 'Working tree is clean', branch: 'Branch',
    stage: 'Stage file', unstage: 'Unstage file', staged: 'Staged', unstaged: 'Unstaged', untracked: 'Untracked',
    selectDiff: 'Select a changed file to inspect its diff', noDiff: 'No textual diff for this file', gitOutput: 'Git output',
    createBackup: 'Create backup', restore: 'Restore', noBackups: 'No backups yet', version: 'Version',
    checkUpdate: 'Check for updates', notify: 'Test notification', tray: 'Minimize WebDevGym to tray', quit: 'Quit',
    close: 'Close', file: 'File', project: 'Project', ready: 'Ready', updateReady: 'Update available',
    upToDate: 'You have the latest version', downloadingUpdate: 'Downloading update', updateDownloaded: 'Update downloaded',
    installUpdate: 'Install it now?', installingUpdate: 'Starting installer...', restored: 'Backup restored', confirmRestore: 'Restore this backup over the current project?',
    timerDone: 'Timer finished', focusDone: 'Focus session finished', breakDone: 'Break finished', npmInstall: 'npm install',
    newFile: 'New file', newFolder: 'New folder', collapseAll: 'Collapse folders', rename: 'Rename',
    deleteItem: 'Delete', removeProject: 'Remove from recent projects', fileNamePrompt: 'File name',
    folderNamePrompt: 'Folder name', renamePrompt: 'New name', confirmDelete: 'Delete this item from disk?',
    confirmForget: 'Remove this project from recent projects? Files on disk will remain.', invalidName: 'Enter one valid name',
    runnerTitle: 'Project Runner', runnerSubtitle: 'Run package scripts and follow the process without leaving WebDevGym.',
    scripts: 'Project scripts', noScripts: 'No scripts found in package.json', installDependencies: 'Install dependencies',
    packageManager: 'Package manager', activeProcess: 'Active process', localAddress: 'Local address', openAddress: 'Open',
    customCommand: 'Custom command', output: 'Process output', processIdle: 'Ready', processStarting: 'Starting',
    processRunning: 'Running', processStopping: 'Stopping', processStopped: 'Stopped', processSuccess: 'Completed',
    processFailed: 'Failed', processNone: 'No process', pid: 'PID', problems: 'Problems',
    noProblems: 'No problems found', checkingCode: 'Checking code...', line: 'Line',
    externalChange: 'This file changed on disk', externalChangeHint: 'Choose which version to keep.',
    keepMine: 'Keep mine', loadDisk: 'Load from disk', reloadedFromDisk: 'Updated from disk',
    watchError: 'File watching stopped', searchTitle: 'Search in project', searchPlaceholder: 'Search text...',
    matchCase: 'Match case', searchAction: 'Search', searchStart: 'Enter text to search across the project',
    searchEmpty: 'No matches found', searchLoading: 'Searching...', searchMatches: 'matches', searchTruncated: 'First 500 matches shown',
    docsTitle: 'Offline documentation', docsSubtitle: 'A compact frontend reference bundled with WebDevGym.',
    docsSearch: 'Search topics, APIs, or commands...', docsAll: 'All', docsTopics: 'topics', docsEmpty: 'No matching topics',
    docsChoose: 'Choose a topic from the list', docsKeyPoints: 'Key points', docsExample: 'Example',
    docsCopy: 'Copy example', docsCopied: 'Example copied', docsOffline: 'Available without internet',
    aiContext: 'Add to AI context', aiContextAdded: 'Added to AI context', aiContextUnavailable: 'Open a readable project file first',
    aiEditChanged: 'A file changed after AI prepared the edit. Review it again.', aiEditEmpty: 'AI did not provide any valid file changes',
    dependencies: 'Dependencies', dependenciesTitle: 'Dependency manager',
    dependenciesSubtitle: 'Inspect, install, update, and remove project packages.', dependencySearch: 'Filter packages...',
    dependencyName: 'Package name, for example lucide or vite@latest', dependencyInstall: 'Install package',
    dependencyCheck: 'Check updates', dependencyRuntime: 'Runtime', dependencyDevelopment: 'Development',
    dependencyInstalled: 'Installed', dependencyRequested: 'Requested', dependencyLatest: 'Latest',
    dependencyMissing: 'Not installed', dependencyUpdate: 'Update', dependencyRemove: 'Remove',
    dependencyEmpty: 'No dependencies in package.json', dependencyNoProject: 'Open a project with package.json first',
    dependencyConfirmRemove: 'Remove this package from the project?', dependencyUpdatesReady: 'Package versions checked',
    dependencyOperationDone: 'Package operation completed', dependencyCount: 'packages'
  } : {
    title: 'Desktop Center', subtitle: 'Локальное рабочее пространство', open: 'Открыть папку', projects: 'Файлы', search: 'Поиск',
    terminal: 'Runner', git: 'Git', docs: 'Документация', backups: 'Снимки', app: 'Приложение', recents: 'Недавние проекты',
    noProject: 'Выбери папку проекта', noProjectShort: 'Проект не выбран', save: 'Сохранить', saved: 'Сохранено',
    saving: 'Сохранение...', reveal: 'Показать в проводнике', preview: 'Предпросмотр', refresh: 'Обновить',
    run: 'Запустить', stop: 'Остановить', command: 'Команда', clear: 'Очистить', status: 'Статус',
    history: 'История', commit: 'Коммит', push: 'Отправить', commitMessage: 'Сообщение коммита',
    sourceControl: 'Контроль версий', changes: 'Изменения', noChanges: 'Нет незакоммиченных изменений', branch: 'Ветка',
    stage: 'Добавить файл в коммит', unstage: 'Убрать файл из коммита', staged: 'Подготовлен', unstaged: 'Не подготовлен', untracked: 'Новый',
    selectDiff: 'Выбери изменённый файл, чтобы посмотреть diff', noDiff: 'Для этого файла нет текстового diff', gitOutput: 'Вывод Git',
    createBackup: 'Создать снимок', restore: 'Восстановить', noBackups: 'Снимков пока нет', version: 'Версия',
    checkUpdate: 'Проверить обновления', notify: 'Тест уведомления', tray: 'Свернуть WebDevGym в трей',
    quit: 'Выйти', close: 'Закрыть', file: 'Файл', project: 'Проект', ready: 'Готово',
    updateReady: 'Доступно обновление', upToDate: 'Установлена последняя версия', restored: 'Снимок восстановлен',
    downloadingUpdate: 'Скачивание обновления', updateDownloaded: 'Обновление скачано',
    installUpdate: 'Установить его сейчас?', installingUpdate: 'Запуск установщика...',
    confirmRestore: 'Восстановить этот снимок поверх текущего проекта?', timerDone: 'Таймер завершён',
    focusDone: 'Фокус-сессия завершена', breakDone: 'Перерыв завершён', npmInstall: 'npm install',
    newFile: 'Новый файл', newFolder: 'Новая папка', collapseAll: 'Свернуть папки', rename: 'Переименовать',
    deleteItem: 'Удалить', removeProject: 'Убрать из недавних', fileNamePrompt: 'Имя файла',
    folderNamePrompt: 'Имя папки', renamePrompt: 'Новое имя', confirmDelete: 'Удалить этот элемент с диска?',
    confirmForget: 'Убрать проект из недавних? Файлы на диске останутся.', invalidName: 'Введи одно корректное имя',
    runnerTitle: 'Project Runner', runnerSubtitle: 'Запускай скрипты проекта и следи за процессом, не выходя из WebDevGym.',
    scripts: 'Скрипты проекта', noScripts: 'В package.json нет скриптов', installDependencies: 'Установить зависимости',
    packageManager: 'Менеджер пакетов', activeProcess: 'Активный процесс', localAddress: 'Локальный адрес', openAddress: 'Открыть',
    customCommand: 'Своя команда', output: 'Вывод процесса', processIdle: 'Готов', processStarting: 'Запуск',
    processRunning: 'Работает', processStopping: 'Остановка', processStopped: 'Остановлен', processSuccess: 'Завершён',
    processFailed: 'Ошибка', processNone: 'Процесс не запущен', pid: 'PID', problems: 'Проблемы',
    noProblems: 'Проблем не найдено', checkingCode: 'Проверка кода...', line: 'Строка',
    externalChange: 'Файл изменился на диске', externalChangeHint: 'Выбери, какую версию оставить.',
    keepMine: 'Оставить мою', loadDisk: 'Загрузить с диска', reloadedFromDisk: 'Обновлено с диска',
    watchError: 'Отслеживание файлов остановлено', searchTitle: 'Поиск по проекту', searchPlaceholder: 'Текст для поиска...',
    matchCase: 'Учитывать регистр', searchAction: 'Найти', searchStart: 'Введи текст для поиска по проекту',
    searchEmpty: 'Совпадений не найдено', searchLoading: 'Ищем...', searchMatches: 'совпадений', searchTruncated: 'Показаны первые 500 совпадений',
    docsTitle: 'Офлайн-документация', docsSubtitle: 'Короткий справочник фронтенд-разработчика внутри WebDevGym.',
    docsSearch: 'Найти тему, API или команду...', docsAll: 'Все', docsTopics: 'тем', docsEmpty: 'Подходящих тем нет',
    docsChoose: 'Выбери тему из списка', docsKeyPoints: 'Главное', docsExample: 'Пример',
    docsCopy: 'Скопировать пример', docsCopied: 'Пример скопирован', docsOffline: 'Работает без интернета',
    aiContext: 'Добавить в контекст ИИ', aiContextAdded: 'Добавлено в контекст ИИ', aiContextUnavailable: 'Сначала открой читаемый файл проекта',
    aiEditChanged: 'Файл изменился после подготовки правки ИИ. Проверь изменения заново.', aiEditEmpty: 'ИИ не передал допустимых изменений файлов',
    dependencies: 'Зависимости', dependenciesTitle: 'Менеджер зависимостей',
    dependenciesSubtitle: 'Просматривай, устанавливай, обновляй и удаляй пакеты проекта.', dependencySearch: 'Фильтр пакетов...',
    dependencyName: 'Название пакета, например lucide или vite@latest', dependencyInstall: 'Установить пакет',
    dependencyCheck: 'Проверить обновления', dependencyRuntime: 'Основная', dependencyDevelopment: 'Для разработки',
    dependencyInstalled: 'Установлена', dependencyRequested: 'Указана', dependencyLatest: 'Последняя',
    dependencyMissing: 'Не установлена', dependencyUpdate: 'Обновить', dependencyRemove: 'Удалить',
    dependencyEmpty: 'В package.json пока нет зависимостей', dependencyNoProject: 'Сначала открой проект с package.json',
    dependencyConfirmRemove: 'Удалить этот пакет из проекта?', dependencyUpdatesReady: 'Версии пакетов проверены',
    dependencyOperationDone: 'Операция с пакетом завершена', dependencyCount: 'пакетов'
  };

  const state = {
    activeView: 'projects',
    appInfo: null,
    currentFile: '',
    diagnostics: [],
    diagnosticsRequest: 0,
    diagnosticsTimer: 0,
    docsCategory: 'all',
    docsQuery: '',
    docsSelectedId: '',
    dirty: false,
    expandedFolders: new Set(),
    externalConflict: false,
    externalPath: '',
    gitFiles: [],
    gitSelectedPath: '',
    lastFinishedProcessId: '',
    packageData: null,
    packageQuery: '',
    packageUpdatesChecked: false,
    ownWriteAt: 0,
    ownWritePath: '',
    preview: null,
    processCommand: '',
    processContext: '',
    processId: '',
    processPid: 0,
    processStatus: 'idle',
    processUrl: '',
    stopRequested: false,
    project: null,
    recents: [],
    saveTimer: 0,
    searchCaseSensitive: false,
    searchRequest: 0,
    selectedPath: '',
    selectedType: '',
    watchedRoot: ''
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
              ${tabButton('search', 'search', copy.search)}
              ${tabButton('terminal', 'terminal-2', copy.terminal)}
              ${tabButton('packages', 'packages', copy.dependencies)}
              ${tabButton('git', 'brand-git', copy.git)}
              ${tabButton('docs', 'books', copy.docs)}
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
                  <header class="wdgd-pane-head"><strong data-desktop-file-name>${copy.file}</strong><button class="wdgd-icon-button" type="button" data-desktop-ai-context disabled title="${copy.aiContext}" aria-label="${copy.aiContext}">${icon('sparkles', 16)}</button><button class="wdgd-button" type="button" data-desktop-reveal>${icon('folder-share', 15)} ${copy.reveal}</button><button class="wdgd-button primary" type="button" data-desktop-save>${icon('device-floppy', 15)} ${copy.save}</button></header>
                  <div class="wdgd-editor-wrap">
                    <div class="wdgd-file-change" data-desktop-file-change hidden>
                      <div>${icon('file-alert', 18)}<span><strong>${copy.externalChange}</strong><small>${copy.externalChangeHint}</small></span></div>
                      <div class="wdgd-file-change-actions"><button class="wdgd-button" type="button" data-external-keep>${copy.keepMine}</button><button class="wdgd-button primary" type="button" data-external-reload>${copy.loadDisk}</button></div>
                    </div>
                    <textarea class="wdgd-editor" data-desktop-editor spellcheck="false" disabled></textarea>
                    <details class="wdgd-problems" data-desktop-problems open>
                      <summary><span>${icon('alert-triangle', 15)} ${copy.problems}</span><span class="wdgd-problem-count" data-desktop-problem-count>0</span></summary>
                      <div class="wdgd-problem-list" data-desktop-problem-list><p class="wdgd-problem-empty">${copy.noProblems}</p></div>
                    </details>
                    <div class="wdgd-editor-status" data-desktop-editor-status>${copy.ready}</div>
                  </div>
                </section>
                <section class="wdgd-pane wdgd-preview-pane">
                  <header class="wdgd-pane-head"><strong>${copy.preview}</strong><button class="wdgd-icon-button" type="button" data-desktop-preview-refresh title="${copy.refresh}" aria-label="${copy.refresh}">${icon('refresh', 16)}</button><button class="wdgd-button" type="button" data-desktop-preview>${icon('player-play', 15)} ${copy.preview}</button></header>
                  <iframe class="wdgd-preview" data-desktop-preview-frame title="${copy.preview}" sandbox="allow-scripts allow-same-origin allow-forms allow-modals allow-popups"></iframe>
                </section>
              </div>
            </section>
            <section class="wdgd-view" data-desktop-view="search" hidden>
              <div class="wdgd-search-view">
                <header class="wdgd-search-header"><div><span class="wdgd-runner-eyebrow">PROJECT SEARCH</span><h2>${copy.searchTitle}</h2></div><span class="wdgd-search-summary" data-search-summary></span></header>
                <form class="wdgd-search-form" data-project-search-form>
                  <label class="wdgd-search-field">${icon('search', 18)}<input type="search" maxlength="200" autocomplete="off" data-project-search-input placeholder="${copy.searchPlaceholder}"></label>
                  <button class="wdgd-search-case" type="button" data-search-case aria-pressed="false" title="${copy.matchCase}" aria-label="${copy.matchCase}">Aa</button>
                  <button class="wdgd-button primary" type="submit">${icon('search', 16)} ${copy.searchAction}</button>
                </form>
                <div class="wdgd-search-results" data-search-results><div class="wdgd-search-empty">${icon('file-search', 28)}<span>${copy.searchStart}</span></div></div>
              </div>
            </section>
            <section class="wdgd-view" data-desktop-view="terminal" hidden>
              <div class="wdgd-runner-view">
                <header class="wdgd-runner-header">
                  <div><span class="wdgd-runner-eyebrow">PROJECT RUNNER</span><h2>${copy.runnerTitle}</h2><p>${copy.runnerSubtitle}</p></div>
                  <div class="wdgd-runner-state" data-runner-state="idle"><span></span><strong data-runner-status>${copy.processIdle}</strong></div>
                </header>
                <div class="wdgd-runner-meta">
                  <div><span>${icon('packages', 16)} ${copy.packageManager}</span><strong data-runner-manager>npm</strong></div>
                  <div><span>${icon('terminal-2', 16)} ${copy.activeProcess}</span><strong data-runner-process>${copy.processNone}</strong><small data-runner-pid hidden></small></div>
                  <div data-runner-url-card hidden><span>${icon('world-www', 16)} ${copy.localAddress}</span><button class="wdgd-runner-link" type="button" data-runner-open-url></button></div>
                </div>
                <section class="wdgd-runner-section">
                  <header><div><span class="wdgd-section-label">${copy.scripts}</span><small data-runner-script-count></small></div><button class="wdgd-button" type="button" data-runner-install>${icon('package-import', 15)} ${copy.installDependencies}</button></header>
                  <div class="wdgd-runner-scripts" data-desktop-scripts></div>
                </section>
                <section class="wdgd-runner-section wdgd-runner-command">
                  <span class="wdgd-section-label">${copy.customCommand}</span>
                  <form class="wdgd-command-row" data-desktop-command-form><input type="text" data-desktop-command placeholder="${copy.command}" autocomplete="off"><button class="wdgd-button primary" type="submit" data-runner-submit>${icon('player-play', 15)} ${copy.run}</button><button class="wdgd-button danger" type="button" data-desktop-stop disabled>${icon('player-stop', 15)} ${copy.stop}</button></form>
                </section>
                <section class="wdgd-runner-log">
                  <header><span class="wdgd-section-label">${copy.output}</span><button class="wdgd-button" type="button" data-desktop-clear>${copy.clear}</button></header>
                  <pre class="wdgd-terminal" data-desktop-terminal></pre>
                </section>
              </div>
            </section>
            <section class="wdgd-view" data-desktop-view="packages" hidden>
              <div class="wdgd-packages-view">
                <header class="wdgd-packages-header">
                  <div><span class="wdgd-runner-eyebrow">PACKAGE WORKSPACE</span><h2>${copy.dependenciesTitle}</h2><p>${copy.dependenciesSubtitle}</p></div>
                  <div class="wdgd-toolbar"><span class="wdgd-package-manager">${icon('packages', 15)} <strong data-packages-manager>—</strong></span><button class="wdgd-button" type="button" data-packages-refresh>${icon('refresh', 15)} ${copy.refresh}</button><button class="wdgd-button primary" type="button" data-packages-updates>${icon('cloud-search', 15)} ${copy.dependencyCheck}</button><button class="wdgd-button danger" type="button" data-package-stop disabled>${icon('player-stop', 15)} ${copy.stop}</button></div>
                </header>
                <form class="wdgd-package-install" data-package-install-form>
                  <label>${icon('package-import', 17)}<input type="text" maxlength="214" autocomplete="off" data-package-name placeholder="${copy.dependencyName}"></label>
                  <select data-package-type aria-label="${copy.dependencyDevelopment}"><option value="production">${copy.dependencyRuntime}</option><option value="development">${copy.dependencyDevelopment}</option></select>
                  <button class="wdgd-button primary" type="submit" data-package-install>${icon('plus', 15)} ${copy.dependencyInstall}</button>
                </form>
                <div class="wdgd-package-summary">
                  <div><span>${copy.dependencyCount}</span><strong data-package-total>0</strong></div>
                  <div><span>${copy.dependencyRuntime}</span><strong data-package-runtime>0</strong></div>
                  <div><span>${copy.dependencyDevelopment}</span><strong data-package-development>0</strong></div>
                  <div><span>${copy.dependencyMissing}</span><strong data-package-missing>0</strong></div>
                </div>
                <label class="wdgd-package-search">${icon('search', 17)}<input type="search" autocomplete="off" data-package-search placeholder="${copy.dependencySearch}"></label>
                <div class="wdgd-package-list" data-package-list></div>
                <details class="wdgd-package-output"><summary>${copy.output}</summary><pre class="wdgd-terminal" data-package-output></pre></details>
              </div>
            </section>
            <section class="wdgd-view" data-desktop-view="git" hidden>
              <div class="wdgd-git-view">
                <header class="wdgd-git-header"><div><span class="wdgd-runner-eyebrow">GIT WORKSPACE</span><h2>${copy.sourceControl}</h2></div><div class="wdgd-toolbar"><span class="wdgd-git-branch">${icon('git-branch', 14)} <span data-git-branch>${copy.branch}</span></span><button class="wdgd-icon-button" type="button" data-git-status title="${copy.refresh}" aria-label="${copy.refresh}">${icon('refresh', 16)}</button><button class="wdgd-button" type="button" data-git-history>${icon('history', 15)} ${copy.history}</button><button class="wdgd-button" type="button" data-git-push>${icon('cloud-upload', 15)} ${copy.push}</button></div></header>
                <div class="wdgd-git-workspace">
                  <section class="wdgd-git-changes"><header><strong>${copy.changes}</strong><span data-git-count>0</span></header><div class="wdgd-git-files" data-git-files></div></section>
                  <section class="wdgd-git-diff"><header><strong data-git-diff-title>${copy.selectDiff}</strong></header><pre data-git-diff>${copy.selectDiff}</pre></section>
                </div>
                <form class="wdgd-form-row wdgd-git-commit" data-git-commit-form><input type="text" maxlength="120" data-git-message placeholder="${copy.commitMessage}"><button class="wdgd-button primary" type="submit">${icon('git-commit', 15)} ${copy.commit}</button></form>
                <details class="wdgd-git-console"><summary>${copy.gitOutput}</summary><pre class="wdgd-git-output" data-git-output></pre></details>
              </div>
            </section>
            <section class="wdgd-view" data-desktop-view="docs" hidden>
              <div class="wdgd-docs-view">
                <header class="wdgd-docs-header">
                  <div><span class="wdgd-runner-eyebrow">LOCAL REFERENCE</span><h2>${copy.docsTitle}</h2><p>${copy.docsSubtitle}</p></div>
                  <span class="wdgd-docs-offline">${icon('cloud-off', 15)} ${copy.docsOffline}</span>
                </header>
                <label class="wdgd-docs-search">${icon('search', 18)}<input type="search" autocomplete="off" data-docs-search placeholder="${copy.docsSearch}"><kbd>Ctrl K</kbd></label>
                <div class="wdgd-docs-categories" data-docs-categories></div>
                <div class="wdgd-docs-workspace">
                  <aside class="wdgd-docs-index"><header><strong>${copy.docs}</strong><span data-docs-count>0</span></header><div class="wdgd-docs-list" data-docs-list></div></aside>
                  <article class="wdgd-docs-article" data-docs-article></article>
                </div>
              </div>
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
  const fileChange = shell.querySelector('[data-desktop-file-change]');
  const problemCount = shell.querySelector('[data-desktop-problem-count]');
  const problemList = shell.querySelector('[data-desktop-problem-list]');
  const terminal = shell.querySelector('[data-desktop-terminal]');
  const packageList = shell.querySelector('[data-package-list]');
  const packageOutput = shell.querySelector('[data-package-output]');
  const packageSearch = shell.querySelector('[data-package-search]');
  const gitOutput = shell.querySelector('[data-git-output]');
  const gitFiles = shell.querySelector('[data-git-files]');
  const gitDiff = shell.querySelector('[data-git-diff]');
  const gitDiffTitle = shell.querySelector('[data-git-diff-title]');
  const gitBranch = shell.querySelector('[data-git-branch]');
  const gitCount = shell.querySelector('[data-git-count]');
  const gitConsole = shell.querySelector('.wdgd-git-console');
  const previewFrame = shell.querySelector('[data-desktop-preview-frame]');
  const searchInput = shell.querySelector('[data-project-search-input]');
  const searchResults = shell.querySelector('[data-search-results]');
  const searchSummary = shell.querySelector('[data-search-summary]');
  const docsSearch = shell.querySelector('[data-docs-search]');
  const docsCategories = shell.querySelector('[data-docs-categories]');
  const docsList = shell.querySelector('[data-docs-list]');
  const docsArticle = shell.querySelector('[data-docs-article]');
  const docsCount = shell.querySelector('[data-docs-count]');
  const PROJECT_CONTEXT_EVENT = 'webdevgym:desktop-project-context-changed';
  const PROJECT_CONTEXT_MAX_FILES = 5;
  const PROJECT_CONTEXT_MAX_BYTES = 2 * 1024 * 1024;
  const PROJECT_CONTEXT_EXTENSIONS = new Set([
    'c', 'cc', 'cpp', 'cs', 'css', 'csv', 'env', 'gitignore', 'h', 'hpp', 'htm', 'html', 'ini', 'java',
    'js', 'json', 'jsx', 'less', 'md', 'mjs', 'php', 'py', 'rb', 'scss', 'sh', 'sql', 'svelte', 'svg',
    'toml', 'ts', 'tsx', 'txt', 'vue', 'xml', 'yaml', 'yml'
  ]);

  function isProjectContextFile(filePath) {
    const name = String(filePath || '').split('/').at(-1).toLowerCase();
    const extension = name.includes('.') ? name.split('.').at(-1) : name;
    return PROJECT_CONTEXT_EXTENSIONS.has(extension) || ['dockerfile', 'license', 'makefile'].includes(name);
  }

  function projectContextMime(filePath) {
    const extension = String(filePath || '').split('.').at(-1).toLowerCase();
    if (extension === 'html' || extension === 'htm') return 'text/html';
    if (extension === 'css') return 'text/css';
    if (['js', 'mjs', 'jsx'].includes(extension)) return 'text/javascript';
    if (extension === 'json') return 'application/json';
    if (['ts', 'tsx'].includes(extension)) return 'application/typescript';
    if (extension === 'svg') return 'image/svg+xml';
    if (extension === 'md') return 'text/markdown';
    return 'text/plain';
  }

  function projectContextSnapshot() {
    const files = (state.project?.entries || [])
      .filter(entry => entry.type === 'file' && isProjectContextFile(entry.path))
      .map(entry => ({ path: entry.path, name: entry.path.split('/').at(-1) }));
    return {
      available: Boolean(state.project),
      projectName: state.project?.name || '',
      currentFile: state.currentFile,
      files,
      maxFiles: PROJECT_CONTEXT_MAX_FILES
    };
  }

  function emitProjectContext() {
    const snapshot = projectContextSnapshot();
    const button = shell.querySelector('[data-desktop-ai-context]');
    if (button) button.disabled = !snapshot.currentFile || !isProjectContextFile(snapshot.currentFile);
    window.dispatchEvent(new CustomEvent(PROJECT_CONTEXT_EVENT, { detail: snapshot }));
  }

  async function attachProjectContextFiles(paths) {
    if (!state.project || typeof window.aiHandleFiles !== 'function') throw new Error(copy.aiContextUnavailable);
    const readable = new Set(projectContextSnapshot().files.map(file => file.path));
    const selected = [...new Set(Array.isArray(paths) ? paths : [])]
      .filter(filePath => readable.has(filePath))
      .slice(0, PROJECT_CONTEXT_MAX_FILES);
    if (!selected.length) throw new Error(copy.aiContextUnavailable);

    const files = [];
    const skipped = [];
    for (const filePath of selected) {
      try {
        const content = filePath === state.currentFile
          ? editor.value
          : (await api.readFile(state.project.root, filePath)).content;
        const file = new File([content], filePath.split('/').at(-1), {
          type: projectContextMime(filePath),
          lastModified: Date.now()
        });
        Object.defineProperty(file, 'webdevgymPath', { value: filePath });
        Object.defineProperty(file, 'webdevgymProjectRoot', { value: state.project.root });
        files.push(file);
      } catch {
        skipped.push(filePath);
      }
    }
    if (!files.length) throw new Error(copy.aiContextUnavailable);
    const attachedCount = Number(await window.aiHandleFiles(files)) || 0;
    return {
      attached: files.slice(0, attachedCount).map(file => file.webdevgymPath),
      skipped
    };
  }

  async function readProjectContextFiles(paths, expectedRoot = '') {
    if (!state.project || (expectedRoot && expectedRoot !== state.project.root)) {
      throw new Error(copy.noProjectShort);
    }
    const readable = new Set(projectContextSnapshot().files.map(file => file.path));
    const selected = [...new Set(Array.isArray(paths) ? paths : [])]
      .filter(filePath => readable.has(filePath))
      .slice(0, PROJECT_CONTEXT_MAX_FILES);
    if (!selected.length) throw new Error(copy.aiContextUnavailable);

    const files = [];
    for (const filePath of selected) {
      const content = filePath === state.currentFile
        ? editor.value
        : (await api.readFile(state.project.root, filePath)).content;
      files.push({
        path: filePath,
        name: filePath.split('/').at(-1),
        type: projectContextMime(filePath),
        size: new Blob([content]).size,
        text: content
      });
    }
    return { projectRoot: state.project.root, files };
  }

  async function reviewProjectEdits(edits) {
    if (!state.project) throw new Error(copy.noProjectShort);
    const readable = new Set(projectContextSnapshot().files.map(file => file.path));
    const unique = new Set();
    const candidates = (Array.isArray(edits) ? edits : []).filter(edit => {
      const filePath = String(edit?.path || '').replace(/\\/g, '/');
      if (!readable.has(filePath) || unique.has(filePath) || typeof edit?.content !== 'string') return false;
      if (new Blob([edit.content]).size > PROJECT_CONTEXT_MAX_BYTES) return false;
      unique.add(filePath);
      edit.path = filePath;
      return true;
    }).slice(0, PROJECT_CONTEXT_MAX_FILES);
    const files = [];
    for (const edit of candidates) {
      const before = edit.path === state.currentFile
        ? editor.value
        : (await api.readFile(state.project.root, edit.path)).content;
      if (before !== edit.content) files.push({ path: edit.path, before, after: edit.content });
    }
    if (!files.length) throw new Error(copy.aiEditEmpty);
    return {
      projectRoot: state.project.root,
      projectName: state.project.name,
      files
    };
  }

  async function applyProjectEdits(review) {
    if (!state.project || review?.projectRoot !== state.project.root) throw new Error(copy.noProjectShort);
    const files = Array.isArray(review.files) ? review.files.slice(0, PROJECT_CONTEXT_MAX_FILES) : [];
    if (!files.length) throw new Error(copy.aiEditEmpty);
    if (!(await saveNow())) throw new Error(copy.aiEditChanged);

    for (const file of files) {
      const current = await api.readFile(state.project.root, file.path);
      if (current.content !== file.before) throw new Error(copy.aiEditChanged);
    }

    await api.createBackup(state.project.root);
    const written = [];
    try {
      for (const file of files) {
        state.ownWriteAt = Date.now();
        state.ownWritePath = file.path;
        await api.writeFile(state.project.root, file.path, file.after);
        written.push(file);
      }
    } catch (error) {
      for (const file of written.reverse()) {
        await api.writeFile(state.project.root, file.path, file.before).catch(() => {});
      }
      throw error;
    }

    const currentChange = files.find(file => file.path === state.currentFile);
    if (currentChange) {
      editor.value = currentChange.after;
      state.dirty = false;
      hideExternalChange();
      editorStatus.textContent = copy.saved;
      void runDiagnostics();
    }
    await refreshProject();
    if (state.preview) previewFrame.src = `${state.preview.url}?refresh=${Date.now()}`;
    emitProjectContext();
    return { applied: files.map(file => file.path) };
  }

  async function attachCurrentFileToAi() {
    if (!state.currentFile) return;
    try {
      const result = await attachProjectContextFiles([state.currentFile]);
      if (!result.attached.length) return;
      setOpen(false);
      const aiWindow = document.getElementById('aiChatWin');
      if (aiWindow && !aiWindow.classList.contains('open')) window.toggleAiChat?.();
      window.setTimeout(() => {
        document.getElementById('aiChatWin')?.classList.add('wdgr-context-open');
      }, 0);
      setStatus(copy.aiContextAdded, 'success');
    } catch (error) {
      setStatus(error.message || copy.aiContextUnavailable, 'error');
    }
  }

  window.WebDevGymDesktopProjectContext = Object.freeze({
    snapshot: projectContextSnapshot,
    attach: attachProjectContextFiles,
    read: readProjectContextFiles,
    review: reviewProjectEdits,
    apply: applyProjectEdits
  });

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

  function editorOffset(line, column) {
    const lines = editor.value.split('\n');
    const targetLine = Math.max(1, Math.min(Number(line) || 1, lines.length));
    const targetColumn = Math.max(1, Number(column) || 1);
    let offset = 0;
    for (let index = 0; index < targetLine - 1; index += 1) offset += lines[index].length + 1;
    return offset + Math.min(targetColumn - 1, lines[targetLine - 1].length);
  }

  function jumpToProblem(problem) {
    const start = editorOffset(problem.line, problem.column);
    const end = Math.max(start + 1, editorOffset(problem.endLine, problem.endColumn));
    editor.focus();
    editor.setSelectionRange(start, end);
    const lineHeight = Number.parseFloat(getComputedStyle(editor).lineHeight) || 21;
    editor.scrollTop = Math.max(0, (problem.line - 3) * lineHeight);
  }

  function renderDiagnostics(problems = []) {
    state.diagnostics = problems;
    const errors = problems.filter(problem => problem.severity === 'error').length;
    problemCount.textContent = problems.length ? `${errors}/${problems.length}` : '0';
    problemCount.dataset.hasErrors = String(errors > 0);
    problemList.replaceChildren();
    if (!problems.length) {
      const empty = document.createElement('p');
      empty.className = 'wdgd-problem-empty';
      empty.textContent = copy.noProblems;
      problemList.append(empty);
      return;
    }
    problems.forEach(problem => {
      const button = document.createElement('button');
      button.className = `wdgd-problem ${problem.severity}`;
      button.type = 'button';
      button.innerHTML = `<span class="wdgd-problem-icon">${icon(problem.severity === 'error' ? 'circle-x' : 'alert-triangle', 15)}</span><span class="wdgd-problem-copy"><strong></strong><small></small></span><span class="wdgd-problem-location"></span>`;
      button.querySelector('strong').textContent = problem.message;
      button.querySelector('small').textContent = [problem.source, problem.rule].filter(Boolean).join(' · ');
      button.querySelector('.wdgd-problem-location').textContent = `${copy.line} ${problem.line}:${problem.column}`;
      button.addEventListener('click', () => jumpToProblem(problem));
      problemList.append(button);
    });
  }

  async function runDiagnostics() {
    clearTimeout(state.diagnosticsTimer);
    if (!state.project || !state.currentFile) return renderDiagnostics([]);
    const request = ++state.diagnosticsRequest;
    const root = state.project.root;
    const filePath = state.currentFile;
    const content = editor.value;
    editorStatus.textContent = copy.checkingCode;
    try {
      const problems = await api.diagnoseFile(root, filePath, content);
      if (request !== state.diagnosticsRequest || state.currentFile !== filePath) return;
      renderDiagnostics(Array.isArray(problems) ? problems : []);
      editorStatus.textContent = state.dirty ? copy.saving : copy.ready;
    } catch (error) {
      if (request !== state.diagnosticsRequest) return;
      editorStatus.textContent = errorMessage(error);
      renderDiagnostics([]);
    }
  }

  function scheduleDiagnostics() {
    clearTimeout(state.diagnosticsTimer);
    state.diagnosticsTimer = window.setTimeout(runDiagnostics, 450);
  }

  function resetDiagnostics() {
    clearTimeout(state.diagnosticsTimer);
    state.diagnosticsRequest += 1;
    renderDiagnostics([]);
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
    if (view === 'packages') void loadPackages(false);
    if (view === 'search') window.setTimeout(() => searchInput.focus(), 0);
    if (view === 'docs') {
      renderOfflineDocs();
      window.setTimeout(() => docsSearch.focus(), 0);
    }
  }

  function showSearchMessage(message, iconName = 'file-search') {
    searchResults.replaceChildren();
    const empty = document.createElement('div');
    empty.className = 'wdgd-search-empty';
    empty.innerHTML = icon(iconName, 28);
    const text = document.createElement('span');
    text.textContent = message;
    empty.append(text);
    searchResults.append(empty);
  }

  function resetSearchResults() {
    state.searchRequest += 1;
    searchInput.value = '';
    searchSummary.textContent = '';
    showSearchMessage(copy.searchStart);
  }

  async function jumpToSearchResult(result) {
    switchView('projects');
    await openFile(result.path);
    if (state.currentFile !== result.path) return;
    editor.focus();
    editor.setSelectionRange(result.offset, result.offset + result.length);
    editor.scrollTop = Math.max(0, (result.line - 1) * 21 - editor.clientHeight / 2);
  }

  function renderSearchResults(response) {
    searchResults.replaceChildren();
    const count = response.results.length;
    searchSummary.textContent = response.truncated
      ? `${count}+ ${copy.searchMatches} · ${copy.searchTruncated}`
      : `${count} ${copy.searchMatches}`;
    if (!count) return showSearchMessage(copy.searchEmpty, 'search-off');

    response.results.forEach(result => {
      const button = document.createElement('button');
      button.className = 'wdgd-search-result';
      button.type = 'button';
      const heading = document.createElement('span');
      heading.className = 'wdgd-search-result-heading';
      const file = document.createElement('strong');
      file.textContent = result.path;
      const location = document.createElement('span');
      location.textContent = `${result.line}:${result.column}`;
      heading.append(file, location);
      const preview = document.createElement('code');
      preview.textContent = result.preview || response.query;
      button.append(heading, preview);
      button.addEventListener('click', () => void jumpToSearchResult(result));
      searchResults.append(button);
    });
  }

  async function runProjectSearch(event) {
    event?.preventDefault();
    if (!state.project) return setStatus(copy.noProjectShort, 'error');
    const query = searchInput.value.trim();
    if (!query) {
      searchSummary.textContent = '';
      showSearchMessage(copy.searchStart);
      return;
    }
    const request = ++state.searchRequest;
    searchSummary.textContent = copy.searchLoading;
    showSearchMessage(copy.searchLoading, 'loader-2');
    const response = await withStatus(() => api.searchProject(state.project.root, query, state.searchCaseSensitive));
    if (!response || request !== state.searchRequest) return;
    renderSearchResults(response);
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
    emitProjectContext();
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
    const manager = state.project?.packageManager || 'npm';
    const hasPackageJson = Boolean(state.project?.hasPackageJson);
    const scripts = Object.entries(state.project?.scripts || {})
      .filter(([name, command]) => /^[\w:.-]+$/.test(name) && typeof command === 'string');
    shell.querySelector('[data-runner-manager]').textContent = hasPackageJson ? manager : '—';
    shell.querySelector('[data-runner-script-count]').textContent = String(scripts.length);
    const install = shell.querySelector('[data-runner-install]');
    install.dataset.runnerUnavailable = String(!hasPackageJson);
    install.onclick = () => void runCommand(installCommand(manager));

    if (!scripts.length) {
      const empty = document.createElement('p');
      empty.className = 'wdgd-runner-empty';
      empty.textContent = copy.noScripts;
      root.append(empty);
      updateRunnerUi();
      return;
    }

    scripts.forEach(([name, command]) => {
      const row = document.createElement('div');
      row.className = 'wdgd-runner-script';
      row.dataset.runnerScript = name;
      const info = document.createElement('div');
      const title = document.createElement('strong');
      const source = document.createElement('code');
      title.textContent = name;
      source.textContent = command;
      info.append(title, source);
      const button = document.createElement('button');
      button.className = 'wdgd-button wdgd-runner-script-run';
      button.type = 'button';
      button.dataset.runnerAction = 'run';
      button.innerHTML = `${icon('player-play', 15)} ${copy.run}`;
      button.addEventListener('click', () => void runCommand(scriptCommand(manager, name)));
      row.append(info, button);
      root.append(row);
    });
    updateRunnerUi();
  }

  function packageTypeLabel(type) {
    return type === 'development' ? copy.dependencyDevelopment : copy.dependencyRuntime;
  }

  function showPackageMessage(message, iconName = 'packages') {
    packageList.replaceChildren();
    const empty = document.createElement('div');
    empty.className = 'wdgd-package-empty';
    empty.innerHTML = icon(iconName, 28);
    const text = document.createElement('span');
    text.textContent = message;
    empty.append(text);
    packageList.append(empty);
  }

  function renderPackages() {
    const data = state.packageData;
    const dependencies = Array.isArray(data?.dependencies) ? data.dependencies : [];
    shell.querySelector('[data-packages-manager]').textContent = data?.hasPackageJson ? data.manager : '—';
    shell.querySelector('[data-package-total]').textContent = String(dependencies.length);
    shell.querySelector('[data-package-runtime]').textContent = String(dependencies.filter(item => item.type === 'production').length);
    shell.querySelector('[data-package-development]').textContent = String(dependencies.filter(item => item.type === 'development').length);
    shell.querySelector('[data-package-missing]').textContent = String(dependencies.filter(item => !item.installed).length);

    const available = Boolean(state.project && data?.hasPackageJson);
    shell.querySelectorAll('[data-package-name], [data-package-type], [data-package-install], [data-packages-updates]')
      .forEach(control => { control.disabled = !available; });
    if (!state.project || !data?.hasPackageJson) return showPackageMessage(copy.dependencyNoProject, 'package-off');

    const query = state.packageQuery.trim().toLocaleLowerCase();
    const visible = query ? dependencies.filter(item => item.name.toLocaleLowerCase().includes(query)) : dependencies;
    if (!visible.length) return showPackageMessage(dependencies.length ? copy.searchEmpty : copy.dependencyEmpty, dependencies.length ? 'search-off' : 'package');

    packageList.replaceChildren();
    visible.forEach(dependency => {
      const row = document.createElement('article');
      row.className = 'wdgd-package-row';
      row.dataset.packageName = dependency.name;
      if (!dependency.installed) row.classList.add('missing');
      if (dependency.updateAvailable) row.classList.add('update');

      const identity = document.createElement('div');
      identity.className = 'wdgd-package-identity';
      const heading = document.createElement('div');
      const name = document.createElement('strong');
      name.textContent = dependency.name;
      const type = document.createElement('span');
      type.textContent = packageTypeLabel(dependency.type);
      type.className = dependency.type;
      heading.append(name, type);
      const requested = document.createElement('small');
      requested.textContent = `${copy.dependencyRequested}: ${dependency.requested}`;
      identity.append(heading, requested);

      const versions = document.createElement('div');
      versions.className = 'wdgd-package-versions';
      const installed = document.createElement('span');
      installed.innerHTML = `<small>${copy.dependencyInstalled}</small><strong></strong>`;
      installed.querySelector('strong').textContent = dependency.installed || copy.dependencyMissing;
      versions.append(installed);
      if (state.packageUpdatesChecked) {
        const latest = document.createElement('span');
        latest.innerHTML = `<small>${copy.dependencyLatest}</small><strong></strong>`;
        latest.querySelector('strong').textContent = dependency.latest || '—';
        versions.append(latest);
      }

      const actions = document.createElement('div');
      actions.className = 'wdgd-package-actions';
      const update = document.createElement('button');
      update.type = 'button';
      update.className = `wdgd-button${dependency.updateAvailable ? ' primary' : ''}`;
      update.dataset.packageAction = dependency.installed ? 'update' : 'install';
      update.innerHTML = `${icon(dependency.installed ? 'arrow-up' : 'download', 14)} ${dependency.installed ? copy.dependencyUpdate : copy.dependencyInstall}`;
      update.addEventListener('click', () => void runPackageOperation(update.dataset.packageAction, dependency));
      const remove = document.createElement('button');
      remove.type = 'button';
      remove.className = 'wdgd-icon-button danger';
      remove.dataset.packageAction = 'remove';
      remove.title = copy.dependencyRemove;
      remove.setAttribute('aria-label', `${copy.dependencyRemove}: ${dependency.name}`);
      remove.innerHTML = icon('trash', 15);
      remove.addEventListener('click', () => void runPackageOperation('remove', dependency));
      actions.append(update, remove);
      row.append(identity, versions, actions);
      packageList.append(row);
    });
    updateRunnerUi();
  }

  async function loadPackages(checkUpdates = false) {
    if (!state.project) {
      state.packageData = null;
      state.packageUpdatesChecked = false;
      renderPackages();
      return;
    }
    const result = await withStatus(
      () => checkUpdates ? api.packageUpdates(state.project.root) : api.packages(state.project.root),
      checkUpdates ? copy.dependencyUpdatesReady : copy.ready
    );
    if (!result) return;
    state.packageData = result;
    state.packageUpdatesChecked = checkUpdates;
    renderPackages();
  }

  function appendPackageOutput(text, kind = '') {
    const span = document.createElement('span');
    span.className = kind;
    span.textContent = text;
    packageOutput.append(span);
    packageOutput.scrollTop = packageOutput.scrollHeight;
  }

  async function runPackageOperation(action, dependency = null) {
    if (!state.project || !state.project.hasPackageJson) return setStatus(copy.dependencyNoProject, 'error');
    if (state.processId) return setStatus(isEnglish ? 'Stop the current process first' : 'Сначала останови текущий процесс', 'error');
    const input = shell.querySelector('[data-package-name]');
    const type = shell.querySelector('[data-package-type]');
    const name = dependency?.name || input.value.trim();
    const development = dependency ? dependency.type === 'development' : type.value === 'development';
    if (!name) return input.focus();
    if (action === 'remove' && !window.confirm(`${copy.dependencyConfirmRemove}\n${name}`)) return;

    state.processCommand = `${action}: ${name}`;
    state.processContext = 'packages';
    state.processPid = 0;
    state.processStatus = 'starting';
    state.stopRequested = false;
    updateRunnerUi();
    appendPackageOutput(`\n> ${state.processCommand}\n`, 'success');
    const result = await withStatus(() => api.packageMutate(state.project.root, action, name, development));
    if (!result) {
      state.processStatus = 'failed';
      updateRunnerUi();
      return;
    }
    state.processCommand = result.command;
    if (action === 'install' && !dependency) input.value = '';
    if (state.lastFinishedProcessId === result.id) return;
    state.processId = result.id;
    state.processPid = result.pid || 0;
    state.processStatus = 'running';
    updateRunnerUi();
  }

  function installCommand(manager) {
    if (manager === 'yarn') return 'yarn install';
    if (manager === 'pnpm') return 'pnpm install';
    if (manager === 'bun') return 'bun install';
    return 'npm install';
  }

  function scriptCommand(manager, name) {
    if (manager === 'yarn') return `yarn ${name}`;
    if (manager === 'pnpm') return `pnpm run ${name}`;
    if (manager === 'bun') return `bun run ${name}`;
    return `npm run ${name}`;
  }

  function runnerStatusLabel(status) {
    return {
      idle: copy.processIdle,
      starting: copy.processStarting,
      running: copy.processRunning,
      stopping: copy.processStopping,
      stopped: copy.processStopped,
      success: copy.processSuccess,
      failed: copy.processFailed
    }[status] || copy.processIdle;
  }

  function updateRunnerUi() {
    const busy = ['starting', 'running', 'stopping'].includes(state.processStatus);
    const status = shell.querySelector('[data-runner-state]');
    status.dataset.runnerState = state.processStatus;
    shell.querySelector('[data-runner-status]').textContent = runnerStatusLabel(state.processStatus);
    shell.querySelector('[data-runner-process]').textContent = state.processCommand || copy.processNone;
    const pid = shell.querySelector('[data-runner-pid]');
    pid.hidden = !state.processPid;
    pid.textContent = state.processPid ? `${copy.pid} ${state.processPid}` : '';
    const urlCard = shell.querySelector('[data-runner-url-card]');
    const urlButton = shell.querySelector('[data-runner-open-url]');
    urlCard.hidden = !state.processUrl;
    urlButton.textContent = state.processUrl;
    shell.querySelectorAll('[data-runner-action="run"], [data-runner-install], [data-runner-submit]').forEach(button => {
      button.disabled = busy || button.dataset.runnerUnavailable === 'true';
    });
    shell.querySelector('[data-desktop-stop]').disabled = !busy || state.processStatus === 'stopping';
    const packageAvailable = Boolean(state.project?.hasPackageJson);
    shell.querySelectorAll('[data-package-name], [data-package-type], [data-package-install], [data-packages-updates], [data-packages-refresh], [data-package-action]')
      .forEach(control => { control.disabled = busy || !packageAvailable; });
    shell.querySelector('[data-package-stop]').disabled = !busy || state.processStatus === 'stopping';
  }

  function captureLocalAddress(text) {
    if (state.processUrl) return;
    const match = String(text || '').match(/https?:\/\/(?:localhost|127\.0\.0\.1|0\.0\.0\.0|\[::1\])(?::\d+)?(?:\/[^\s"'<>]*)?/i);
    if (!match) return;
    state.processUrl = match[0].replace('0.0.0.0', '127.0.0.1').replace(/[),.;]+$/, '');
    updateRunnerUi();
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
      resetDiagnostics();
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
      await api.unwatchProject().catch(() => {});
    }
    const recents = await withStatus(() => api.forgetProject(root));
    if (!recents) return;
    state.recents = recents;
    if (state.project?.root === root) {
      state.project = null;
      state.currentFile = '';
      state.packageData = null;
      state.packageQuery = '';
      state.packageUpdatesChecked = false;
      state.selectedPath = '';
      state.selectedType = '';
      state.expandedFolders.clear();
      state.dirty = false;
      state.watchedRoot = '';
      hideExternalChange();
      editor.value = '';
      editor.disabled = true;
      shell.querySelector('[data-desktop-file-name]').textContent = copy.file;
      resetDiagnostics();
      packageSearch.value = '';
      renderPackages();
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

  async function openLaunchRequest(request) {
    if (!request?.root) return;
    setOpen(true);
    await openProject(request.root);
    if (request.file && state.project?.root === request.root) {
      await openFile(request.file);
    }
  }

  async function selectProject(project) {
    if (state.processId) await stopProcess();
    await stopPreview();
    await saveNow();
    await api.unwatchProject().catch(() => {});
    state.project = project;
    state.currentFile = '';
    state.gitFiles = [];
    state.gitSelectedPath = '';
    state.packageData = null;
    state.packageQuery = '';
    state.packageUpdatesChecked = false;
    state.selectedPath = '';
    state.selectedType = '';
    state.expandedFolders.clear();
    hideExternalChange();
    editor.value = '';
    editor.disabled = true;
    resetDiagnostics();
    resetSearchResults();
    terminal.replaceChildren();
    packageOutput.replaceChildren();
    packageSearch.value = '';
    state.processCommand = '';
    state.processContext = '';
    state.lastFinishedProcessId = '';
    state.processPid = 0;
    state.processStatus = 'idle';
    state.processUrl = '';
    state.stopRequested = false;
    const recents = await api.recentProjects();
    state.recents = Array.isArray(recents) ? recents : [];
    renderProject();
    switchView('projects');
    await startWatchingProject(project.root);
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
    hideExternalChange();
    editor.value = result.content;
    editor.disabled = false;
    shell.querySelector('[data-desktop-file-name]').textContent = filePath;
    editorStatus.textContent = copy.ready;
    renderTree();
    emitProjectContext();
    void runDiagnostics();
  }

  function scheduleSave() {
    if (!state.currentFile) return;
    state.dirty = true;
    editorStatus.textContent = copy.saving;
    clearTimeout(state.saveTimer);
    if (state.externalConflict) return;
    state.saveTimer = window.setTimeout(saveNow, 700);
    scheduleDiagnostics();
  }

  async function saveNow() {
    clearTimeout(state.saveTimer);
    if (!state.project || !state.currentFile || !state.dirty) return true;
    state.ownWriteAt = Date.now();
    state.ownWritePath = state.currentFile;
    const result = await withStatus(() => api.writeFile(state.project.root, state.currentFile, editor.value), copy.saved);
    if (!result) return false;
    state.dirty = false;
    editorStatus.textContent = copy.saved;
    if (state.preview) previewFrame.src = `${state.preview.url}?refresh=${Date.now()}`;
    return true;
  }

  function hideExternalChange() {
    state.externalConflict = false;
    state.externalPath = '';
    fileChange.hidden = true;
  }

  function showExternalChange(filePath) {
    clearTimeout(state.saveTimer);
    state.externalConflict = true;
    state.externalPath = filePath;
    fileChange.hidden = false;
    editorStatus.textContent = copy.externalChange;
  }

  async function reloadCurrentFile() {
    if (!state.project || !state.currentFile) return false;
    const root = state.project.root;
    const filePath = state.currentFile;
    const result = await withStatus(() => api.readFile(root, filePath));
    if (!result || state.project?.root !== root || state.currentFile !== filePath) return false;
    editor.value = result.content;
    state.dirty = false;
    hideExternalChange();
    editorStatus.textContent = copy.reloadedFromDisk;
    void runDiagnostics();
    return true;
  }

  async function startWatchingProject(root) {
    try {
      await api.watchProject(root);
      state.watchedRoot = root;
    } catch (error) {
      state.watchedRoot = '';
      setStatus(`${copy.watchError}: ${errorMessage(error)}`, 'error');
    }
  }

  async function handleProjectChanges(payload = {}) {
    if (!state.project || payload.root !== state.project.root || !Array.isArray(payload.changes)) return;
    const now = Date.now();
    const currentChange = payload.changes.find(change => change.path === state.currentFile);
    let isOwnWrite = currentChange &&
      state.ownWritePath === currentChange.path &&
      now - state.ownWriteAt < 1500;

    if (isOwnWrite) {
      const diskFile = await api.readFile(state.project.root, currentChange.path).catch(() => null);
      isOwnWrite = diskFile?.content === editor.value;
    }

    if (currentChange && !isOwnWrite) {
      if (state.dirty) showExternalChange(currentChange.path);
      else await reloadCurrentFile();
    }

    if (payload.changes.some(change => change.eventType === 'rename')) {
      const project = await api.refreshProject(state.project.root).catch(() => null);
      if (project && state.project?.root === payload.root) {
        state.project = project;
        renderProject();
      }
    }
    if (state.preview && !isOwnWrite) previewFrame.src = `${state.preview.url}?refresh=${Date.now()}`;
    if (state.activeView === 'git') void refreshGitChanges();
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
    captureLocalAddress(text);
  }

  async function runCommand(command) {
    if (!state.project) return setStatus(copy.noProjectShort, 'error');
    if (state.processId) return setStatus(isEnglish ? 'Stop the current process first' : 'Сначала останови текущий процесс', 'error');
    state.processCommand = command;
    state.processContext = 'runner';
    state.processPid = 0;
    state.processStatus = 'starting';
    state.processUrl = '';
    state.stopRequested = false;
    updateRunnerUi();
    appendTerminal(`\n> ${command}\n`, 'success');
    const result = await withStatus(() => api.startProcess(state.project.root, command));
    if (!result) {
      state.processStatus = 'failed';
      updateRunnerUi();
      return;
    }
    if (state.lastFinishedProcessId === result.id) return;
    state.processId = result.id;
    state.processPid = result.pid || 0;
    state.processStatus = 'running';
    updateRunnerUi();
  }

  async function stopProcess() {
    if (!state.processId) return;
    const id = state.processId;
    state.stopRequested = true;
    state.processStatus = 'stopping';
    updateRunnerUi();
    const stopped = await withStatus(() => api.stopProcess(id));
    if (!stopped) {
      state.processId = '';
      state.processPid = 0;
      state.processStatus = 'stopped';
      updateRunnerUi();
    }
  }

  function gitFileState(file) {
    if (file.index === '?' && file.worktree === '?') return copy.untracked;
    if (file.staged && file.unstaged) return `${copy.staged} + ${copy.unstaged}`;
    return file.staged ? copy.staged : copy.unstaged;
  }

  function resetGitDiff() {
    state.gitSelectedPath = '';
    gitDiffTitle.textContent = copy.selectDiff;
    gitDiff.textContent = copy.selectDiff;
  }

  function renderGitFiles() {
    gitFiles.replaceChildren();
    gitCount.textContent = String(state.gitFiles.length);
    if (!state.gitFiles.length) {
      const empty = document.createElement('div');
      empty.className = 'wdgd-git-empty';
      empty.innerHTML = icon('circle-check', 24);
      const text = document.createElement('span');
      text.textContent = copy.noChanges;
      empty.append(text);
      gitFiles.append(empty);
      resetGitDiff();
      return;
    }

    state.gitFiles.forEach(file => {
      const row = document.createElement('div');
      row.className = 'wdgd-git-file';
      row.classList.toggle('active', file.path === state.gitSelectedPath);

      const select = document.createElement('button');
      select.className = 'wdgd-git-file-main';
      select.type = 'button';
      const pathText = document.createElement('span');
      pathText.className = 'wdgd-git-file-path';
      pathText.textContent = file.path;
      const stateText = document.createElement('span');
      stateText.className = 'wdgd-git-file-state';
      stateText.textContent = gitFileState(file);
      select.append(pathText, stateText);
      select.addEventListener('click', () => void loadGitDiff(file.path));
      row.append(select);

      const actions = document.createElement('div');
      actions.className = 'wdgd-git-file-actions';
      if (file.unstaged) {
        const stage = document.createElement('button');
        stage.className = 'wdgd-icon-button';
        stage.type = 'button';
        stage.title = copy.stage;
        stage.setAttribute('aria-label', `${copy.stage}: ${file.path}`);
        stage.innerHTML = icon('plus', 15);
        stage.addEventListener('click', () => void changeGitStage(file.path, true));
        actions.append(stage);
      }
      if (file.staged) {
        const unstage = document.createElement('button');
        unstage.className = 'wdgd-icon-button';
        unstage.type = 'button';
        unstage.title = copy.unstage;
        unstage.setAttribute('aria-label', `${copy.unstage}: ${file.path}`);
        unstage.innerHTML = icon('minus', 15);
        unstage.addEventListener('click', () => void changeGitStage(file.path, false));
        actions.append(unstage);
      }
      row.append(actions);
      gitFiles.append(row);
    });
  }

  async function refreshGitChanges() {
    if (!state.project) return setStatus(copy.noProjectShort, 'error');
    const selectedPath = state.gitSelectedPath;
    const result = await withStatus(() => api.gitChanges(state.project.root));
    if (!result) return;
    state.gitFiles = Array.isArray(result.files) ? result.files : [];
    state.gitSelectedPath = state.gitFiles.some(file => file.path === selectedPath) ? selectedPath : '';
    gitBranch.textContent = result.branch || 'HEAD';
    renderGitFiles();
    if (state.gitSelectedPath) await loadGitDiff(state.gitSelectedPath, false);
    else resetGitDiff();
  }

  async function loadGitDiff(filePath, rerender = true) {
    if (!state.project) return;
    state.gitSelectedPath = filePath;
    if (rerender) renderGitFiles();
    gitDiffTitle.textContent = filePath;
    gitDiff.textContent = isEnglish ? 'Loading diff...' : 'Загрузка diff...';
    const result = await withStatus(() => api.gitDiff(state.project.root, filePath));
    if (!result || state.gitSelectedPath !== filePath) return;
    const sections = [];
    if (result.staged) sections.push(`[${copy.staged.toUpperCase()}]\n${result.staged}`);
    if (result.unstaged) sections.push(`[${copy.unstaged.toUpperCase()}]\n${result.unstaged}`);
    gitDiff.textContent = sections.join('\n') || copy.noDiff;
  }

  async function changeGitStage(filePath, shouldStage) {
    if (!state.project) return;
    const action = shouldStage ? api.gitStage : api.gitUnstage;
    const result = await withStatus(() => action(state.project.root, filePath));
    if (!result) return;
    if (result.code !== 0) {
      setStatus(result.stderr || result.stdout || 'Git command failed', 'error');
      return;
    }
    state.gitSelectedPath = filePath;
    await refreshGitChanges();
  }

  async function showGit(mode) {
    if (mode !== 'history') return refreshGitChanges();
    if (!state.project) return setStatus(copy.noProjectShort, 'error');
    gitOutput.textContent = isEnglish ? 'Loading...\n' : 'Загрузка...\n';
    gitConsole.open = true;
    const result = await withStatus(() => api.gitHistory(state.project.root));
    if (!result) return;
    gitOutput.textContent = `${result.stdout || ''}${result.stderr || ''}` || (isEnglish ? 'No output.' : 'Нет вывода.');
  }

  async function commitGit(message) {
    if (!state.project) return false;
    const result = await withStatus(() => api.gitCommit(state.project.root, message));
    if (!result) return false;
    gitOutput.textContent = `${result.stdout || ''}${result.stderr || ''}`;
    gitConsole.open = true;
    if (result.code !== 0) {
      setStatus(result.stderr || result.stdout || 'Git commit failed', 'error');
      return false;
    }
    await refreshGitChanges();
    return true;
  }

  async function pushGit() {
    if (!state.project) return setStatus(copy.noProjectShort, 'error');
    const result = await withStatus(() => api.gitPush(state.project.root));
    if (!result) return;
    gitOutput.textContent = `${result.stdout || ''}${result.stderr || ''}`;
    gitConsole.open = true;
    if (result.code !== 0) setStatus(result.stderr || result.stdout || 'Git push failed', 'error');
  }

  function docsValue(value) {
    if (typeof value === 'string') return value;
    return value?.[isEnglish ? 'en' : 'ru'] || value?.en || value?.ru || '';
  }

  function docsData() {
    return window.WebDevGymOfflineDocs || { categories: [], articles: [] };
  }

  function docsCategory(categoryId) {
    return docsData().categories.find(category => category.id === categoryId);
  }

  function filteredDocs() {
    const query = state.docsQuery.trim().toLocaleLowerCase(isEnglish ? 'en' : 'ru');
    return docsData().articles.filter(article => {
      if (state.docsCategory !== 'all' && article.category !== state.docsCategory) return false;
      if (!query) return true;
      const searchable = [
        docsValue(article.title), docsValue(article.summary), docsValue(article.body),
        ...(article.points || []).map(docsValue), ...(article.tags || []), article.code || ''
      ].join(' ').toLocaleLowerCase(isEnglish ? 'en' : 'ru');
      return searchable.includes(query);
    });
  }

  function renderDocsCategories() {
    docsCategories.replaceChildren();
    const items = [{ id: 'all', label: copy.docsAll, icon: 'library' }, ...docsData().categories];
    items.forEach(category => {
      const button = document.createElement('button');
      button.className = `wdgd-docs-category${state.docsCategory === category.id ? ' active' : ''}`;
      button.type = 'button';
      button.dataset.docsCategory = category.id;
      const count = category.id === 'all'
        ? docsData().articles.length
        : docsData().articles.filter(article => article.category === category.id).length;
      button.innerHTML = `${icon(category.icon, 15)}<span></span><small>${count}</small>`;
      button.querySelector('span').textContent = docsValue(category.label);
      button.addEventListener('click', () => {
        state.docsCategory = category.id;
        state.docsSelectedId = '';
        renderOfflineDocs();
      });
      docsCategories.append(button);
    });
  }

  function renderDocsList(articles) {
    docsList.replaceChildren();
    docsCount.textContent = String(articles.length);
    if (!articles.length) {
      const empty = document.createElement('div');
      empty.className = 'wdgd-docs-empty';
      empty.innerHTML = icon('book-off', 28);
      const label = document.createElement('span');
      label.textContent = copy.docsEmpty;
      empty.append(label);
      docsList.append(empty);
      return;
    }
    articles.forEach(article => {
      const category = docsCategory(article.category);
      const button = document.createElement('button');
      button.className = `wdgd-docs-topic${state.docsSelectedId === article.id ? ' active' : ''}`;
      button.type = 'button';
      button.dataset.docsId = article.id;
      button.innerHTML = `<span class="wdgd-docs-topic-icon">${icon(category?.icon || 'file-text', 17)}</span><span class="wdgd-docs-topic-copy"><strong></strong><small></small></span>`;
      button.querySelector('strong').textContent = docsValue(article.title);
      button.querySelector('small').textContent = docsValue(category?.label);
      button.addEventListener('click', () => {
        state.docsSelectedId = article.id;
        renderDocsList(articles);
        renderDocsArticle(article);
      });
      docsList.append(button);
    });
  }

  async function copyDocsExample(code) {
    try {
      await navigator.clipboard.writeText(code);
    } catch {
      const fallback = document.createElement('textarea');
      fallback.value = code;
      fallback.style.position = 'fixed';
      fallback.style.opacity = '0';
      document.body.append(fallback);
      fallback.select();
      document.execCommand('copy');
      fallback.remove();
    }
    setStatus(copy.docsCopied, 'ok');
  }

  function renderDocsArticle(article) {
    docsArticle.replaceChildren();
    if (!article) {
      const empty = document.createElement('div');
      empty.className = 'wdgd-docs-article-empty';
      empty.innerHTML = icon('book-2', 34);
      const label = document.createElement('span');
      label.textContent = copy.docsChoose;
      empty.append(label);
      docsArticle.append(empty);
      return;
    }

    const category = docsCategory(article.category);
    const header = document.createElement('header');
    header.className = 'wdgd-docs-article-header';
    const eyebrow = document.createElement('span');
    eyebrow.className = 'wdgd-runner-eyebrow';
    eyebrow.textContent = docsValue(category?.label);
    const title = document.createElement('h3');
    title.textContent = docsValue(article.title);
    const summary = document.createElement('p');
    summary.textContent = docsValue(article.summary);
    header.append(eyebrow, title, summary);

    const body = document.createElement('p');
    body.className = 'wdgd-docs-body';
    body.textContent = docsValue(article.body);

    const pointsSection = document.createElement('section');
    pointsSection.className = 'wdgd-docs-points';
    const pointsTitle = document.createElement('h4');
    pointsTitle.textContent = copy.docsKeyPoints;
    const points = document.createElement('ul');
    (article.points || []).forEach(point => {
      const item = document.createElement('li');
      item.textContent = docsValue(point);
      points.append(item);
    });
    pointsSection.append(pointsTitle, points);

    const example = document.createElement('section');
    example.className = 'wdgd-docs-example';
    const exampleHeader = document.createElement('header');
    const exampleTitle = document.createElement('h4');
    exampleTitle.textContent = copy.docsExample;
    const language = document.createElement('span');
    language.textContent = article.language || 'text';
    const copyButton = document.createElement('button');
    copyButton.className = 'wdgd-icon-button';
    copyButton.type = 'button';
    copyButton.title = copy.docsCopy;
    copyButton.setAttribute('aria-label', copy.docsCopy);
    copyButton.innerHTML = icon('copy', 16);
    copyButton.addEventListener('click', () => void copyDocsExample(article.code || ''));
    exampleHeader.append(exampleTitle, language, copyButton);
    const code = document.createElement('pre');
    code.dataset.docsCode = article.id;
    code.textContent = article.code || '';
    example.append(exampleHeader, code);

    docsArticle.append(header, body, pointsSection, example);
  }

  function renderOfflineDocs() {
    const articles = filteredDocs();
    if (!articles.some(article => article.id === state.docsSelectedId)) {
      state.docsSelectedId = articles[0]?.id || '';
    }
    renderDocsCategories();
    renderDocsList(articles);
    renderDocsArticle(articles.find(article => article.id === state.docsSelectedId));
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
    if (!update.hasUpdate) return setStatus(copy.upToDate, 'ok');

    setStatus(`${copy.downloadingUpdate}: 0%`, 'ok');
    const downloaded = await withStatus(() => api.downloadUpdate(), copy.updateDownloaded);
    if (!downloaded) return;

    const message = `${copy.updateDownloaded}: ${downloaded.latest}`;
    setStatus(message, 'ok');
    if (window.confirm(`${message}. ${copy.installUpdate}`)) {
      await withStatus(() => api.installUpdate(downloaded.path), copy.installingUpdate);
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
  shell.querySelector('[data-desktop-ai-context]').addEventListener('click', () => void attachCurrentFileToAi());
  shell.querySelector('[data-external-keep]').addEventListener('click', () => {
    hideExternalChange();
    void saveNow();
  });
  shell.querySelector('[data-external-reload]').addEventListener('click', () => {
    void reloadCurrentFile();
  });
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
  shell.querySelector('[data-project-search-form]').addEventListener('submit', runProjectSearch);
  shell.querySelector('[data-search-case]').addEventListener('click', event => {
    state.searchCaseSensitive = !state.searchCaseSensitive;
    event.currentTarget.classList.toggle('active', state.searchCaseSensitive);
    event.currentTarget.setAttribute('aria-pressed', String(state.searchCaseSensitive));
    if (searchInput.value.trim()) void runProjectSearch();
  });
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
  shell.querySelector('[data-package-install-form]').addEventListener('submit', event => {
    event.preventDefault();
    void runPackageOperation('install');
  });
  shell.querySelector('[data-packages-refresh]').addEventListener('click', () => void loadPackages(false));
  shell.querySelector('[data-packages-updates]').addEventListener('click', () => void loadPackages(true));
  shell.querySelector('[data-package-stop]').addEventListener('click', stopProcess);
  packageSearch.addEventListener('input', () => {
    state.packageQuery = packageSearch.value;
    renderPackages();
  });
  shell.querySelector('[data-runner-open-url]').addEventListener('click', () => {
    if (state.processUrl) void api.openExternal(state.processUrl);
  });
  shell.querySelector('[data-git-status]').addEventListener('click', refreshGitChanges);
  shell.querySelector('[data-git-history]').addEventListener('click', () => showGit('history'));
  shell.querySelector('[data-git-push]').addEventListener('click', pushGit);
  shell.querySelector('[data-git-commit-form]').addEventListener('submit', async event => {
    event.preventDefault();
    const input = shell.querySelector('[data-git-message]');
    if (!input.value.trim()) return;
    if (await commitGit(input.value.trim())) input.value = '';
  });
  docsSearch.addEventListener('input', () => {
    state.docsQuery = docsSearch.value;
    state.docsSelectedId = '';
    renderOfflineDocs();
  });
  shell.querySelector('[data-backup-create]').addEventListener('click', createBackup);
  shell.querySelector('[data-backup-refresh]').addEventListener('click', renderBackups);
  shell.querySelector('[data-app-update]').addEventListener('click', checkUpdate);
  shell.querySelector('[data-app-notify]').addEventListener('click', () => api.notify('WebDevGym', copy.ready));
  shell.querySelector('[data-app-quit]').addEventListener('click', () => api.quit());
  api.onProcessOutput(payload => {
    if (!state.processId && state.processStatus === 'starting') state.processId = payload.id;
    if (payload.id !== state.processId) return;
    const outputKind = payload.stream === 'stderr' ? 'stderr' : payload.stream === 'exit' ? 'success' : '';
    if (state.processContext === 'packages') appendPackageOutput(payload.text, outputKind);
    else appendTerminal(payload.text, outputKind);
    if (payload.stream === 'exit') {
      const completedContext = state.processContext;
      state.lastFinishedProcessId = payload.id;
      state.processId = '';
      state.processPid = 0;
      state.processStatus = state.stopRequested ? 'stopped' : payload.code === 0 ? 'success' : 'failed';
      state.stopRequested = false;
      updateRunnerUi();
      if (completedContext === 'packages') {
        void refreshProject().then(() => loadPackages(false));
        if (payload.code === 0) setStatus(copy.dependencyOperationDone, 'ok');
      }
    }
  });
  api.onUpdateProgress?.(payload => {
    const percent = Number.isFinite(payload?.percent) ? payload.percent : 0;
    setStatus(`${copy.downloadingUpdate}: ${percent}%`, 'ok');
  });
  api.onOpenRequest(request => {
    void openLaunchRequest(request);
  });
  api.onProjectChanged(payload => {
    void handleProjectChanges(payload);
  });
  api.onProjectWatchError(payload => {
    if (payload.root !== state.project?.root) return;
    state.watchedRoot = '';
    setStatus(`${copy.watchError}: ${payload.message || ''}`, 'error');
  });
  document.addEventListener('keydown', event => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k' && !shell.hidden && state.activeView === 'docs') {
      event.preventDefault();
      event.stopImmediatePropagation();
      docsSearch.select();
      return;
    }
    if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key.toLowerCase() === 'f') {
      event.preventDefault();
      event.stopPropagation();
      setOpen(true);
      switchView('search');
      searchInput.select();
      return;
    }
    if (event.key === 'Escape' && !shell.hidden) setOpen(false);
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's' && !shell.hidden) {
      event.preventDefault();
      void saveNow();
    }
  }, true);

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
  api.consumeOpenRequest()
    .then(request => openLaunchRequest(request))
    .catch(error => setStatus(errorMessage(error), 'error'));
})();
