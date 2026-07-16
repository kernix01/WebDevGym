(function () {
  'use strict';

  const isEnglish = document.documentElement.lang.toLowerCase().startsWith('en');
  const copy = isEnglish ? {
    title: 'Upload files or a folder to GitHub',
    tip: 'Upload one file or a complete project folder. Folder structure is preserved and all files are added in one commit.',
    oneFile: 'One file', folder: 'Folder', fileLabel: 'File to upload', folderLabel: 'Project folder',
    chooseFolder: 'Choose a folder', destination: 'Destination in repository', destinationHint: 'Optional, for example: website',
    keepRoot: 'Keep the selected root folder', emptyFolders: 'Git does not store empty folders.',
    noFolder: 'Choose a folder to upload', missingFields: 'Fill in Username, Repository and Token',
    noFiles: 'No suitable files were found in this folder.', tooManyFiles: 'Choose a folder with no more than 300 files.',
    fileTooLarge: 'A file larger than 95 MB cannot be uploaded through this tool:',
    selected: 'selected', files: 'files', skipped: 'skipped', ready: 'Ready to upload',
    preparing: 'Preparing files', connecting: 'Connecting to the repository', uploading: 'Uploading files',
    committing: 'Creating one commit', success: 'Folder uploaded successfully', commit: 'Commit',
    pushFolder: 'Push folder to GitHub', pushFile: 'Push file to GitHub', branchMissing: 'The branch was not found. Initialize the repository with a README first.',
    badToken: 'The token is invalid or does not have Contents: write permission.', notFound: 'Repository not found or the token has no access.',
    conflict: 'The branch changed during upload. Run the upload again.', network: 'Network error', root: 'repository root'
  } : {
    title: 'Загрузить файлы или папку в GitHub',
    tip: 'Загрузи один файл или целую папку проекта. Структура подпапок сохранится, а все файлы попадут в один коммит.',
    oneFile: 'Один файл', folder: 'Папка', fileLabel: 'Файл для загрузки', folderLabel: 'Папка проекта',
    chooseFolder: 'Выбрать папку', destination: 'Путь в репозитории', destinationHint: 'Необязательно, например: website',
    keepRoot: 'Сохранить корневую папку', emptyFolders: 'Git не хранит пустые папки.',
    noFolder: 'Выбери папку для загрузки', missingFields: 'Заполни Username, Repository и Token',
    noFiles: 'В этой папке не найдено подходящих файлов.', tooManyFiles: 'Выбери папку, в которой не больше 300 файлов.',
    fileTooLarge: 'Через этот инструмент нельзя загрузить файл больше 95 МБ:',
    selected: 'выбрано', files: 'файлов', skipped: 'пропущено', ready: 'Готово к загрузке',
    preparing: 'Подготавливаем файлы', connecting: 'Подключаемся к репозиторию', uploading: 'Загружаем файлы',
    committing: 'Создаём один коммит', success: 'Папка успешно загружена', commit: 'Коммит',
    pushFolder: 'Загрузить папку в GitHub', pushFile: 'Загрузить файл в GitHub', branchMissing: 'Ветка не найдена. Сначала создай репозиторий с README.',
    badToken: 'Токен неверный или у него нет разрешения Contents: write.', notFound: 'Репозиторий не найден или у токена нет доступа.',
    conflict: 'Во время загрузки ветка изменилась. Запусти загрузку ещё раз.', network: 'Сетевая ошибка', root: 'корень репозитория'
  };

  const MODE_KEY = 'wdg_github_upload_mode_v1';
  const BASE_KEY = 'wdg_github_folder_base_v1';
  const ROOT_KEY = 'wdg_github_keep_root_v1';
  const IGNORED_DIRECTORIES = new Set(['.git', 'node_modules']);
  const IGNORED_FILES = new Set(['.DS_Store', 'Thumbs.db']);
  const MAX_FILES = 300;
  const MAX_FILE_SIZE = 95 * 1024 * 1024;
  let uploadMode = read(MODE_KEY, 'file');
  let legacyUpload = null;

  function read(key, fallback) {
    try { return localStorage.getItem(key) ?? fallback; } catch (error) { return fallback; }
  }

  function write(key, value) {
    try { localStorage.setItem(key, value); } catch (error) {}
  }

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>'"]/g, character => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
    })[character]);
  }

  function normalizePath(value) {
    return String(value || '')
      .replace(/\\/g, '/')
      .split('/')
      .map(part => part.trim())
      .filter(part => part && part !== '.' && part !== '..')
      .join('/');
  }

  function apiPath(value) {
    return String(value).split('/').map(encodeURIComponent).join('/');
  }

  function formatBytes(bytes) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  }

  function shouldIgnore(file) {
    const path = file.webkitRelativePath || file.name;
    const parts = path.replace(/\\/g, '/').split('/');
    return parts.some(part => IGNORED_DIRECTORIES.has(part)) || IGNORED_FILES.has(file.name);
  }

  function selectedFiles() {
    const input = document.getElementById('gh-folder-input');
    const all = Array.from(input?.files || []);
    return { all, files: all.filter(file => !shouldIgnore(file)) };
  }

  function repositoryPath(file, base, keepRoot) {
    let relative = normalizePath(file.webkitRelativePath || file.name);
    if (!keepRoot) {
      const parts = relative.split('/');
      if (parts.length > 1) relative = parts.slice(1).join('/');
    }
    return normalizePath([base, relative].filter(Boolean).join('/'));
  }

  function injectStyles() {
    if (document.getElementById('wdgGithubFolderStyles')) return;
    const style = document.createElement('style');
    style.id = 'wdgGithubFolderStyles';
    style.textContent = `
      .wdg-gh-mode{display:grid;grid-template-columns:1fr 1fr;gap:6px;margin:0 0 14px;padding:4px;border:1px solid #30363d;border-radius:9px;background:#090d14}
      .wdg-gh-mode button{min-height:38px;border:0;border-radius:6px;background:transparent;color:#8b949e;font:600 12px/1 inherit;cursor:pointer}
      .wdg-gh-mode button:hover{color:#e6edf3;background:#161b22}.wdg-gh-mode button.active{color:#fff;background:#6d28d9;box-shadow:0 0 0 1px #8b5cf6 inset}
      .wdg-gh-folder-panel[hidden],.wdg-gh-single-hidden{display:none!important}.wdg-gh-folder-panel{margin-bottom:16px}
      .wdg-gh-folder-input{display:block;width:100%;padding:10px 12px;border:1px dashed #4b5563;border-radius:8px;background:#161b22;color:#e6edf3;font:12px inherit;cursor:pointer;box-sizing:border-box}
      .wdg-gh-folder-options{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:12px;align-items:end;margin-top:12px}
      .wdg-gh-folder-options label>span,.wdg-gh-folder-label{display:block;margin-bottom:5px;color:#8b949e;font-size:12px;font-weight:600}
      .wdg-gh-folder-base{width:100%;padding:8px 12px;border:1px solid #30363d;border-radius:8px;background:#161b22;color:#e6edf3;font:13px inherit;outline:none;box-sizing:border-box}
      .wdg-gh-folder-base:focus{border-color:#8b5cf6}.wdg-gh-keep-root{display:flex!important;align-items:center;gap:8px;min-height:36px;color:#c9d1d9!important;font-size:12px!important;white-space:nowrap;cursor:pointer}
      .wdg-gh-folder-summary{margin-top:10px;padding:10px 12px;border:1px solid #30363d;border-radius:8px;background:#0b121c;color:#8b949e;font-size:12px;line-height:1.55}
      .wdg-gh-folder-summary strong{color:#e6edf3}.wdg-gh-folder-summary code{color:#c4b5fd}.wdg-gh-folder-paths{margin-top:6px;max-height:76px;overflow:auto;scrollbar-width:thin}
      .wdg-gh-folder-paths div{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.wdg-gh-note{margin-top:6px;color:#6e7681;font-size:11px}
      #gh-status .wdg-gh-progress{height:4px;margin-top:8px;border-radius:99px;background:#1f2937;overflow:hidden}#gh-status .wdg-gh-progress span{display:block;height:100%;border-radius:inherit;background:#8b5cf6;transition:width .2s}
      #gh-status .wdg-gh-detail{display:block;margin-top:4px;color:inherit;opacity:.8;font-size:11px}
      @media(max-width:720px){.wdg-gh-folder-options{grid-template-columns:1fr}.wdg-gh-keep-root{white-space:normal}.wdg-gh-mode button{min-height:42px}}
    `;
    document.head.appendChild(style);
  }

  function status(message, type = 'progress', detail = '', progress = null) {
    const element = document.getElementById('gh-status');
    if (!element) return;
    const palette = type === 'error'
      ? ['#2d0d0d', '#da3633', '#f85149']
      : type === 'success'
        ? ['#0d2d1a', '#238636', '#3fb950']
        : ['#101b2d', '#365a8d', '#79c0ff'];
    element.style.display = 'block';
    element.style.background = palette[0];
    element.style.border = `1px solid ${palette[1]}`;
    element.style.color = palette[2];
    element.innerHTML = `<strong>${escapeHtml(message)}</strong>${detail ? `<span class="wdg-gh-detail">${escapeHtml(detail)}</span>` : ''}${typeof progress === 'number' ? `<div class="wdg-gh-progress"><span style="width:${Math.max(0, Math.min(100, progress))}%"></span></div>` : ''}`;
  }

  function renderFolderSummary() {
    const summary = document.getElementById('gh-folder-summary');
    if (!summary) return;
    const { all, files } = selectedFiles();
    if (!all.length) {
      summary.innerHTML = `${copy.noFolder}<div class="wdg-gh-note">${copy.emptyFolders}</div>`;
      return;
    }
    const size = files.reduce((total, file) => total + file.size, 0);
    const skipped = all.length - files.length;
    const sample = files.slice(0, 5).map(file => `<div><code>${escapeHtml(file.webkitRelativePath || file.name)}</code></div>`).join('');
    summary.innerHTML = `<strong>${copy.ready}:</strong> ${copy.selected} ${files.length} ${copy.files}, ${formatBytes(size)}${skipped ? `, ${copy.skipped}: ${skipped}` : ''}<div class="wdg-gh-folder-paths">${sample}</div><div class="wdg-gh-note">${copy.emptyFolders}</div>`;
  }

  function setMode(mode) {
    uploadMode = mode === 'folder' ? 'folder' : 'file';
    write(MODE_KEY, uploadMode);
    document.querySelectorAll('[data-gh-upload-mode]').forEach(button => {
      const active = button.dataset.ghUploadMode === uploadMode;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
    });
    const folderPanel = document.getElementById('gh-folder-panel');
    if (folderPanel) folderPanel.hidden = uploadMode !== 'folder';
    document.getElementById('gh-file-input')?.closest('[data-gh-single-file]')?.classList.toggle('wdg-gh-single-hidden', uploadMode === 'folder');
    document.getElementById('gh-filepath')?.closest('[data-gh-filepath-field]')?.classList.toggle('wdg-gh-single-hidden', uploadMode === 'folder');
    const button = document.querySelector('#block-git-github-upload button[onclick="githubUpload()"]');
    if (button) button.textContent = uploadMode === 'folder' ? `↑ ${copy.pushFolder}` : `↑ ${copy.pushFile}`;
  }

  function enhanceForm() {
    const block = document.getElementById('block-git-github-upload');
    const fileInput = document.getElementById('gh-file-input');
    if (!block || !fileInput || block.dataset.folderUploadReady === '1') return false;
    block.dataset.folderUploadReady = '1';
    injectStyles();

    const titleText = Array.from(block.querySelector('.block-title')?.childNodes || []).find(node => node.nodeType === Node.TEXT_NODE);
    if (titleText) titleText.nodeValue = `📤 ${copy.title} `;
    const tip = block.querySelector('.tip');
    if (tip) tip.textContent = copy.tip;

    const singleWrap = fileInput.closest('div');
    singleWrap.dataset.ghSingleFile = '1';
    const singleLabel = singleWrap.querySelector('label');
    if (singleLabel) singleLabel.textContent = `📎 ${copy.fileLabel}`;
    const filepathField = document.getElementById('gh-filepath')?.closest('div');
    if (filepathField) filepathField.dataset.ghFilepathField = '1';

    const mode = document.createElement('div');
    mode.className = 'wdg-gh-mode';
    mode.innerHTML = `<button type="button" data-gh-upload-mode="file">📄 ${copy.oneFile}</button><button type="button" data-gh-upload-mode="folder">📁 ${copy.folder}</button>`;
    singleWrap.parentElement.insertBefore(mode, singleWrap);

    const panel = document.createElement('div');
    panel.id = 'gh-folder-panel';
    panel.className = 'wdg-gh-folder-panel';
    panel.innerHTML = `
      <label class="wdg-gh-folder-label" for="gh-folder-input">📁 ${copy.folderLabel}</label>
      <input class="wdg-gh-folder-input" id="gh-folder-input" type="file" webkitdirectory directory multiple>
      <div class="wdg-gh-folder-options">
        <label><span>📂 ${copy.destination}</span><input class="wdg-gh-folder-base" id="gh-folder-base" type="text" placeholder="${copy.destinationHint}" value="${escapeHtml(read(BASE_KEY, ''))}"></label>
        <label class="wdg-gh-keep-root"><input id="gh-folder-keep-root" type="checkbox"> <span>${copy.keepRoot}</span></label>
      </div>
      <div class="wdg-gh-folder-summary" id="gh-folder-summary"></div>`;
    singleWrap.insertAdjacentElement('afterend', panel);

    const keepRoot = panel.querySelector('#gh-folder-keep-root');
    keepRoot.checked = read(ROOT_KEY, 'true') !== 'false';
    panel.querySelector('#gh-folder-input').addEventListener('change', renderFolderSummary);
    panel.querySelector('#gh-folder-base').addEventListener('input', event => write(BASE_KEY, normalizePath(event.target.value)));
    keepRoot.addEventListener('change', () => {
      write(ROOT_KEY, String(keepRoot.checked));
      renderFolderSummary();
    });
    mode.addEventListener('click', event => {
      const button = event.target.closest('[data-gh-upload-mode]');
      if (button) setMode(button.dataset.ghUploadMode);
    });

    legacyUpload = window.githubUpload;
    window.githubUpload = function () {
      return uploadMode === 'folder' ? uploadFolder() : legacyUpload?.();
    };
    renderFolderSummary();
    setMode(uploadMode);
    return true;
  }

  async function githubRequest(url, token, options = {}) {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github+json',
        'Content-Type': 'application/json',
        'X-GitHub-Api-Version': '2022-11-28',
        ...(options.headers || {})
      }
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
      const error = new Error(result.message || `GitHub API: ${response.status}`);
      error.status = response.status;
      throw error;
    }
    return result;
  }

  async function fileToBase64(file) {
    const bytes = new Uint8Array(await file.arrayBuffer());
    let binary = '';
    const chunkSize = 0x8000;
    for (let offset = 0; offset < bytes.length; offset += chunkSize) {
      binary += String.fromCharCode(...bytes.subarray(offset, offset + chunkSize));
    }
    return btoa(binary);
  }

  async function mapWithConcurrency(items, concurrency, worker) {
    const results = new Array(items.length);
    let next = 0;
    async function run() {
      while (next < items.length) {
        const index = next++;
        results[index] = await worker(items[index], index);
      }
    }
    await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, run));
    return results;
  }

  function errorMessage(error) {
    if (error.status === 401 || error.status === 403) return copy.badToken;
    if (error.status === 404) return copy.notFound;
    if (error.status === 409) return copy.conflict;
    if (error.status === 422 && /reference|branch|ref/i.test(error.message)) return copy.branchMissing;
    return `${copy.network}: ${error.message}`;
  }

  async function uploadFolder() {
    const username = document.getElementById('gh-username')?.value.trim();
    const repo = document.getElementById('gh-repo')?.value.trim();
    const token = document.getElementById('gh-token')?.value.trim();
    const branch = document.getElementById('gh-branch')?.value.trim() || 'main';
    const message = document.getElementById('gh-message')?.value.trim() || 'upload: project folder';
    const base = normalizePath(document.getElementById('gh-folder-base')?.value);
    const keepRoot = document.getElementById('gh-folder-keep-root')?.checked !== false;
    const { all, files } = selectedFiles();

    if (!username || !repo || !token) return status(copy.missingFields, 'error');
    if (!all.length) return status(copy.noFolder, 'error');
    if (!files.length) return status(copy.noFiles, 'error');
    if (files.length > MAX_FILES) return status(copy.tooManyFiles, 'error', `${files.length} / ${MAX_FILES}`);
    const oversized = files.find(file => file.size > MAX_FILE_SIZE);
    if (oversized) return status(copy.fileTooLarge, 'error', `${oversized.name} — ${formatBytes(oversized.size)}`);

    const entries = files.map(file => ({ file, path: repositoryPath(file, base, keepRoot) }));
    const duplicate = entries.find((entry, index) => entries.findIndex(other => other.path === entry.path) !== index);
    if (duplicate) return status(isEnglish ? 'Duplicate repository path' : 'Повторяется путь в репозитории', 'error', duplicate.path);

    const uploadButton = document.querySelector('#block-git-github-upload button[onclick="githubUpload()"]');
    if (uploadButton) uploadButton.disabled = true;
    const api = `https://api.github.com/repos/${encodeURIComponent(username)}/${encodeURIComponent(repo)}`;
    const branchPath = apiPath(branch);

    try {
      status(copy.connecting, 'progress', `${username}/${repo} · ${branch}`, 4);
      let reference;
      try {
        reference = await githubRequest(`${api}/git/ref/heads/${branchPath}`, token);
      } catch (error) {
        if (error.status === 404) throw Object.assign(new Error(copy.branchMissing), { status: 422 });
        throw error;
      }
      const headSha = reference.object.sha;
      const headCommit = await githubRequest(`${api}/git/commits/${encodeURIComponent(headSha)}`, token);

      let completed = 0;
      const treeEntries = await mapWithConcurrency(entries, 3, async entry => {
        const content = await fileToBase64(entry.file);
        const blob = await githubRequest(`${api}/git/blobs`, token, {
          method: 'POST',
          body: JSON.stringify({ content, encoding: 'base64' })
        });
        completed += 1;
        const percent = 8 + Math.round((completed / entries.length) * 72);
        status(copy.uploading, 'progress', `${completed} / ${entries.length} · ${entry.path}`, percent);
        return { path: entry.path, mode: '100644', type: 'blob', sha: blob.sha };
      });

      status(copy.committing, 'progress', `${entries.length} ${copy.files}`, 84);
      const tree = await githubRequest(`${api}/git/trees`, token, {
        method: 'POST',
        body: JSON.stringify({ base_tree: headCommit.tree.sha, tree: treeEntries })
      });
      const commit = await githubRequest(`${api}/git/commits`, token, {
        method: 'POST',
        body: JSON.stringify({ message, tree: tree.sha, parents: [headSha] })
      });
      await githubRequest(`${api}/git/refs/heads/${branchPath}`, token, {
        method: 'PATCH',
        body: JSON.stringify({ sha: commit.sha, force: false })
      });

      const commitUrl = commit.html_url || `https://github.com/${encodeURIComponent(username)}/${encodeURIComponent(repo)}/commit/${commit.sha}`;
      const statusElement = document.getElementById('gh-status');
      status(copy.success, 'success', `${entries.length} ${copy.files} · ${base || copy.root}`, 100);
      if (statusElement) statusElement.innerHTML += `<span class="wdg-gh-detail"><a href="${escapeHtml(commitUrl)}" target="_blank" rel="noopener" style="color:#58a6ff">${copy.commit}: ${escapeHtml(commit.sha.slice(0, 7))}</a></span>`;
    } catch (error) {
      status(errorMessage(error), 'error');
    } finally {
      if (uploadButton) uploadButton.disabled = false;
    }
  }

  function init() {
    if (enhanceForm()) return;
    let attempts = 0;
    const timer = setInterval(() => {
      attempts += 1;
      if (enhanceForm() || attempts > 30) clearInterval(timer);
    }, 100);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
