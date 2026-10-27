(function (global) {
  'use strict';

  if (global.webdevgymDesktop?.isDesktop) return;

  const config = global.WebDevGymSupabaseConfig;
  const sdk = global.supabase;
  if (!config?.url || !config?.publishableKey || !sdk?.createClient) return;

  const CLIENT_KEY = 'wdg_cloud_sync_client_v1';
  const META_PREFIX = 'wdg_cloud_sync_meta_v1:';
  const LOCAL_SYNC_DELAY = 180;
  const MAX_VALUE_LENGTH = 1024 * 1024;
  const isEnglish = document.documentElement.lang === 'en' || /index-en\.html$/i.test(location.pathname);

  const copy = isEnglish ? {
    title: 'Cloud sync',
    subtitle: 'Use one account for progress, notes and settings in RU and EN.',
    signedOut: 'Sign in to sync your data',
    signedOutHint: 'Your local data stays on this device until you sign in.',
    email: 'Email',
    password: 'Password',
    emailPlaceholder: 'you@example.com',
    passwordPlaceholder: 'At least 6 characters',
    signIn: 'Sign in',
    signUp: 'Create account',
    signedIn: 'Cloud sync is active',
    syncing: 'Syncing...',
    synced: 'Synced',
    lastSync: 'Last sync',
    never: 'Not yet',
    now: 'just now',
    syncNow: 'Sync now',
    signOut: 'Sign out',
    confirmEmail: 'Check your email and confirm the account, then sign in.',
    authError: 'Could not complete authentication.',
    syncError: 'Could not sync data. Make sure the Supabase migration has been applied.',
    unavailable: 'Cloud sync is temporarily unavailable.',
    protected: 'Passwords, tokens, API keys, AI history, backgrounds and Playground projects are never uploaded.',
    close: 'Close'
  } : {
    title: 'Облачная синхронизация',
    subtitle: 'Один аккаунт для прогресса, заметок и настроек в RU и EN.',
    signedOut: 'Войди, чтобы синхронизировать данные',
    signedOutHint: 'До входа локальные данные остаются только на этом устройстве.',
    email: 'Email',
    password: 'Пароль',
    emailPlaceholder: 'you@example.com',
    passwordPlaceholder: 'Минимум 6 символов',
    signIn: 'Войти',
    signUp: 'Создать аккаунт',
    signedIn: 'Облачная синхронизация активна',
    syncing: 'Синхронизация...',
    synced: 'Синхронизировано',
    lastSync: 'Последняя синхронизация',
    never: 'Ещё не было',
    now: 'только что',
    syncNow: 'Синхронизировать',
    signOut: 'Выйти',
    confirmEmail: 'Подтверди аккаунт по ссылке из письма, затем войди.',
    authError: 'Не удалось выполнить вход.',
    syncError: 'Не удалось синхронизировать данные. Проверь, что миграция Supabase применена.',
    unavailable: 'Облачная синхронизация временно недоступна.',
    protected: 'Пароли, токены, API-ключи, история ИИ, фоны и проекты Playground никогда не загружаются.',
    close: 'Закрыть'
  };

  const client = sdk.createClient(config.url, config.publishableKey, {
    auth: {
      storageKey: 'wdg_supabase_auth_v1',
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  });

  const state = {
    started: false,
    session: null,
    syncing: false,
    modalOpen: false,
    lastSyncAt: 0,
    error: '',
    notice: '',
    applyingRemote: false,
    pendingSync: false,
    channel: null
  };

  let localSyncTimer = 0;

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, character => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    })[character]);
  }

  function readJson(key, fallback) {
    try {
      const value = JSON.parse(localStorage.getItem(key) || 'null');
      return value == null ? fallback : value;
    } catch {
      return fallback;
    }
  }

  function writeJson(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {}
  }

  function readClientId() {
    try {
      const saved = localStorage.getItem(CLIENT_KEY);
      if (saved) return saved;
      const id = crypto.randomUUID?.() || `cloud-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      localStorage.setItem(CLIENT_KEY, id);
      return id;
    } catch {
      return `cloud-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    }
  }

  const clientId = readClientId();

  function metadataKey() {
    return `${META_PREFIX}${state.session?.user?.id || 'anonymous'}`;
  }

  function isSyncableKey(key, value) {
    const lower = String(key || '').toLowerCase();
    if (!lower || lower.includes('cloud_sync') || lower.includes('device_sync')) return false;
    const blocked = [
      'token', 'secret', 'password', 'credential', 'api_key', 'apikey',
      'github', 'gh-', 'ai_custom_models', 'ai_active_custom_model',
      'ai_chat_history', 'ai_threads', 'ai_active_thread', 'custombg', 'wdga_projects',
      'iconify', 'wdgr_ai_window', 'wdgu_timer_window', 'supabase_auth', 'main_lang'
    ];
    if (blocked.some(part => lower.includes(part))) return false;
    if (lower.includes('sound') && String(value || '').startsWith('custom:')) return false;
    return String(value ?? '').length <= MAX_VALUE_LENGTH;
  }

  function valueHash(value) {
    const text = String(value ?? '');
    let hash = 2166136261;
    for (let index = 0; index < text.length; index += 1) {
      hash ^= text.charCodeAt(index);
      hash = Math.imul(hash, 16777619);
    }
    return `${text.length}:${(hash >>> 0).toString(36)}`;
  }

  function currentValues() {
    const values = new Map();
    try {
      for (let index = 0; index < localStorage.length; index += 1) {
        const key = localStorage.key(index);
        const value = key == null ? null : localStorage.getItem(key);
        if (key != null && value != null && isSyncableKey(key, value)) values.set(key, value);
      }
    } catch {}
    return values;
  }

  function collectChanges() {
    const metadata = readJson(metadataKey(), {});
    const values = currentValues();
    const entries = [];
    const now = Date.now();

    for (const key of Object.keys(metadata)) {
      if (!isSyncableKey(key, '')) delete metadata[key];
    }

    for (const [key, value] of values) {
      const hash = valueHash(value);
      const saved = metadata[key];
      if (!saved) {
        metadata[key] = { hash, updatedAt: 0, deleted: false };
        entries.push({ key, value, updatedAt: 0, deleted: false });
      } else if (saved.hash !== hash || saved.deleted) {
        metadata[key] = { hash, updatedAt: now, deleted: false };
        entries.push({ key, value, updatedAt: now, deleted: false });
      }
    }

    for (const [key, saved] of Object.entries(metadata)) {
      if (!isSyncableKey(key, '') || values.has(key) || saved.deleted) continue;
      metadata[key] = { hash: '', updatedAt: now, deleted: true };
      entries.push({ key, value: null, updatedAt: now, deleted: true });
    }

    writeJson(metadataKey(), metadata);
    return entries;
  }

  function applyRemoteEntries(entries) {
    const metadata = readJson(metadataKey(), {});
    const changedKeys = [];

    for (const entry of Array.isArray(entries) ? entries : []) {
      const key = String(entry.key || '');
      const remoteValue = entry.deleted ? null : String(entry.value ?? '');
      if (!isSyncableKey(key, remoteValue) || entry.updated_at == null) continue;

      const local = metadata[key];
      const localTime = Number(local?.updatedAt) || 0;
      const remoteTime = Number(entry.updated_at) || 0;
      const current = localStorage.getItem(key);
      const differs = current !== remoteValue;
      if (remoteTime < localTime || (!differs && local?.deleted === Boolean(entry.deleted))) continue;

      state.applyingRemote = true;
      try {
        if (entry.deleted) localStorage.removeItem(key);
        else localStorage.setItem(key, remoteValue);
      } finally {
        state.applyingRemote = false;
      }

      metadata[key] = {
        hash: entry.deleted ? '' : valueHash(remoteValue),
        updatedAt: remoteTime,
        deleted: Boolean(entry.deleted)
      };

      if (differs) {
        changedKeys.push(key);
        try {
          global.dispatchEvent(new StorageEvent('storage', {
            key,
            oldValue: current,
            newValue: remoteValue,
            storageArea: localStorage,
            url: location.href
          }));
        } catch {}
      }
    }

    writeJson(metadataKey(), metadata);
    if (changedKeys.length) {
      global.dispatchEvent(new CustomEvent('webdevgym:sync-applied', { detail: { keys: changedKeys, source: 'supabase' } }));
    }
  }

  async function sync() {
    if (!state.session) return;
    if (state.syncing) {
      state.pendingSync = true;
      return;
    }

    state.syncing = true;
    state.error = '';
    attach();
    render();

    try {
      const { data, error } = await client.rpc('sync_user_state', {
        p_entries: collectChanges(),
        p_client_id: clientId
      });
      if (error) throw error;
      applyRemoteEntries(data);
      state.lastSyncAt = Date.now();
    } catch (error) {
      console.error('[WebDevGym Cloud Sync]', error);
      state.error = copy.syncError;
    } finally {
      state.syncing = false;
      attach();
      render();
      if (state.pendingSync) {
        state.pendingSync = false;
        queueMicrotask(() => void sync());
      }
    }
  }

  function scheduleSync() {
    if (!state.session || state.applyingRemote) return;
    global.clearTimeout(localSyncTimer);
    localSyncTimer = global.setTimeout(() => void sync(), LOCAL_SYNC_DELAY);
  }

  function observeLocalStorageWrites() {
    const prototype = global.Storage?.prototype;
    if (!prototype || prototype.__webdevgymCloudSyncObserved) return;
    const setItem = prototype.setItem;
    const removeItem = prototype.removeItem;
    const clear = prototype.clear;
    Object.defineProperty(prototype, '__webdevgymCloudSyncObserved', { value: true });

    prototype.setItem = function (key, value) {
      const result = setItem.call(this, key, value);
      if (this === global.localStorage && isSyncableKey(key, value)) scheduleSync();
      return result;
    };
    prototype.removeItem = function (key) {
      const previous = this === global.localStorage ? this.getItem(key) : null;
      const result = removeItem.call(this, key);
      if (this === global.localStorage && isSyncableKey(key, previous)) scheduleSync();
      return result;
    };
    prototype.clear = function () {
      const result = clear.call(this);
      if (this === global.localStorage) scheduleSync();
      return result;
    };
  }

  function formatTime(value) {
    if (!value) return copy.never;
    if (Date.now() - value < 60000) return copy.now;
    return new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  function icon(name, size = 18) {
    const paths = {
      cloud: '<path d="M17.5 19H9a7 7 0 1 1 6.7-9h1.8a4.5 4.5 0 1 1 0 9Z"/><path d="m12 12-2 2 2 2M10 14h6"/>',
      close: '<path d="M18 6 6 18M6 6l12 12"/>',
      shield: '<path d="M20 13c0 5-3.5 7.5-8 9-4.5-1.5-8-4-8-9V5l8-3 8 3v8Z"/><path d="m9 12 2 2 4-4"/>',
      refresh: '<path d="M20 6v5h-5M4 18v-5h5"/><path d="M18.5 9A7 7 0 0 0 6 6.5L4 9M5.5 15A7 7 0 0 0 18 17.5l2-2.5"/>'
    };
    return `<svg class="wdg-device-sync-icon" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] || paths.cloud}</svg>`;
  }

  function ensureUi() {
    if (document.getElementById('wdgCloudSyncModal')) return;
    const modal = document.createElement('div');
    modal.id = 'wdgCloudSyncModal';
    modal.className = 'wdg-device-sync-modal wdg-cloud-sync-modal';
    modal.innerHTML = `
      <button type="button" class="wdg-device-sync-backdrop" data-cloud-close aria-label="${copy.close}"></button>
      <section class="wdg-device-sync-dialog" role="dialog" aria-modal="true" aria-labelledby="wdgCloudSyncTitle">
        <header>
          <div class="wdg-device-sync-mark">${icon('cloud', 22)}</div>
          <div><h2 id="wdgCloudSyncTitle">${copy.title}</h2><p>${copy.subtitle}</p></div>
          <button type="button" class="wdg-device-sync-close" data-cloud-close title="${copy.close}">${icon('close')}</button>
        </header>
        <div class="wdg-device-sync-content" data-cloud-content></div>
      </section>`;
    modal.addEventListener('click', event => {
      if (event.target.closest('[data-cloud-close]')) close();
    });
    document.body.appendChild(modal);
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && state.modalOpen) close();
    });
  }

  function render() {
    const content = document.querySelector('[data-cloud-content]');
    if (!content) return;

    if (!state.session) {
      content.innerHTML = `
        <div class="wdg-device-sync-status offline"><i></i><strong>${copy.signedOut}</strong><span>Supabase</span></div>
        <p class="wdg-cloud-sync-hint">${copy.signedOutHint}</p>
        <form class="wdg-cloud-auth-form" data-cloud-auth-form>
          <label>${copy.email}<input type="email" name="email" autocomplete="email" placeholder="${copy.emailPlaceholder}" required></label>
          <label>${copy.password}<input type="password" name="password" autocomplete="current-password" minlength="6" placeholder="${copy.passwordPlaceholder}" required></label>
          <div class="wdg-cloud-auth-actions">
            <button type="submit" class="primary">${copy.signIn}</button>
            <button type="button" class="secondary" data-cloud-sign-up>${copy.signUp}</button>
          </div>
        </form>
        ${state.notice ? `<p class="wdg-cloud-sync-notice">${escapeHtml(state.notice)}</p>` : ''}
        ${state.error ? `<p class="wdg-device-sync-error">${escapeHtml(state.error)}</p>` : ''}
        <p class="wdg-device-sync-protected">${icon('shield', 16)}${copy.protected}</p>`;

      const form = content.querySelector('[data-cloud-auth-form]');
      form?.addEventListener('submit', async event => {
        event.preventDefault();
        const formData = new FormData(form);
        await authenticate('signIn', String(formData.get('email') || ''), String(formData.get('password') || ''));
      });
      content.querySelector('[data-cloud-sign-up]')?.addEventListener('click', async () => {
        if (!form.reportValidity()) return;
        const formData = new FormData(form);
        await authenticate('signUp', String(formData.get('email') || ''), String(formData.get('password') || ''));
      });
      return;
    }

    const email = escapeHtml(state.session.user.email || '');
    content.innerHTML = `
      <div class="wdg-device-sync-status online"><i></i><strong>${state.syncing ? copy.syncing : copy.signedIn}</strong><span>Supabase</span></div>
      <div class="wdg-cloud-account-card">
        <span>${email}</span>
        <strong>${state.syncing ? copy.syncing : copy.synced}</strong>
        <small>${copy.lastSync}: ${formatTime(state.lastSyncAt)}</small>
      </div>
      ${state.error ? `<p class="wdg-device-sync-error">${escapeHtml(state.error)}</p>` : ''}
      <div class="wdg-device-sync-actions">
        <button type="button" class="secondary" data-cloud-sync ${state.syncing ? 'disabled' : ''}>${icon('refresh', 16)}${copy.syncNow}</button>
        <button type="button" class="danger" data-cloud-sign-out>${copy.signOut}</button>
      </div>
      <p class="wdg-device-sync-protected">${icon('shield', 16)}${copy.protected}</p>`;
    content.querySelector('[data-cloud-sync]')?.addEventListener('click', () => void sync());
    content.querySelector('[data-cloud-sign-out]')?.addEventListener('click', () => void client.auth.signOut());
  }

  async function authenticate(mode, email, password) {
    state.error = '';
    state.notice = '';
    if (!email || password.length < 6) {
      state.error = copy.authError;
      render();
      return;
    }

    let result;
    try {
      result = mode === 'signUp'
        ? await client.auth.signUp({ email, password, options: { emailRedirectTo: location.origin } })
        : await client.auth.signInWithPassword({ email, password });
    } catch {
      state.error = copy.unavailable;
      render();
      return;
    }

    if (result.error) state.error = result.error.message || copy.authError;
    else if (mode === 'signUp' && !result.data.session) state.notice = copy.confirmEmail;
    render();
  }

  function attach() {
    const buttons = [document.getElementById('wdgDeviceSyncButton'), document.getElementById('wdgDeviceSyncMobileButton')].filter(Boolean);
    const status = state.session ? (state.syncing ? 'ready' : 'paired') : 'offline';
    buttons.forEach(button => {
      button.dataset.syncStatus = status;
      button.title = `${copy.title}: ${state.session ? (state.syncing ? copy.syncing : copy.signedIn) : copy.signedOut}`;
      button.setAttribute('aria-label', button.title);
    });
  }

  function open() {
    ensureUi();
    state.modalOpen = true;
    document.getElementById('wdgCloudSyncModal')?.classList.add('open');
    document.body.classList.add('wdg-device-sync-open');
    render();
    if (state.session) void sync();
  }

  function close() {
    state.modalOpen = false;
    document.getElementById('wdgCloudSyncModal')?.classList.remove('open');
    document.body.classList.remove('wdg-device-sync-open');
  }

  async function subscribeToChanges() {
    if (state.channel) {
      await client.removeChannel(state.channel);
      state.channel = null;
    }
    const userId = state.session?.user?.id;
    if (!userId) return;

    state.channel = client
      .channel(`wdg-user-state-${userId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'user_state_entries',
        filter: `user_id=eq.${userId}`
      }, payload => {
        const source = payload.new?.updated_by || payload.old?.updated_by;
        if (source !== clientId) scheduleSync();
      })
      .subscribe();
  }

  async function handleSession(session) {
    state.session = session;
    state.error = '';
    state.notice = '';
    await subscribeToChanges();
    attach();
    render();
    if (session) void sync();
  }

  async function start() {
    if (state.started) return;
    state.started = true;
    ensureUi();
    observeLocalStorageWrites();

    const { data, error } = await client.auth.getSession();
    if (error) state.error = copy.unavailable;
    await handleSession(data?.session || null);

    client.auth.onAuthStateChange((_event, session) => {
      global.setTimeout(() => void handleSession(session), 0);
    });

    global.setInterval(() => {
      if (!document.hidden && state.session) void sync();
    }, 30000);
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden && state.session) void sync();
    });
  }

  global.WebDevGymCloudSync = Object.freeze({
    start,
    open,
    close,
    sync,
    attach,
    isSyncableKey
  });
})(window);
