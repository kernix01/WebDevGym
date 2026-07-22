const CACHE_NAME = 'webdevgym-shell-2026-07-22-v17';
const APP_SHELL = [
  './index.html',
  './index-en.html',
  './favicon.svg',
  './manifest.webmanifest',
  './css/modern-language-fixes.css',
  './css/webdevgym-base-ru.css',
  './css/webdevgym-base-en.css',
  './css/modern-ui.css',
  './css/modern-ui-fixes.css',
  './css/modern-ui-v2.css',
  './css/modern-ui-v3.css',
  './css/modern-ui-v5.css',
  './css/webdevgym-features.css',
  './css/webdevgym-lab.css',
  './css/webdevgym-personalization.css',
  './css/webdevgym-custom-sounds.css',
  './css/webdevgym-forge.css',
  './css/webdevgym-studio-suite.css',
  './css/webdevgym-today.css',
  './css/webdevgym-growth.css',
  './css/webdevgym-nexus.css',
  './css/webdevgym-mobile.css',
  './css/webdevgym-ai-settings.css',
  './css/webdevgym-splash.css',
  './css/webdevgym-github-token-vault.css',
  './css/webdevgym-github-workspace.css',
  './data/curriculum-ru.js',
  './data/curriculum-en.js',
  './js/webdevgym-curriculum-renderer.js',
  './js/modern-language-bootstrap-v2.js',
  './js/webdevgym-core-ru.js',
  './js/webdevgym-core-en.js',
  './js/modern-ui-bootstrap.js',
  './js/modern-ui.js',
  './js/modern-ui-v2.js',
  './js/modern-ui-v3.js',
  './js/modern-ui-v4.js',
  './js/modern-ui-v5.js',
  './js/modern-ui-v6.js',
  './js/webdevgym-shared-runtime.js',
  './js/webdevgym-features.js',
  './js/webdevgym-today.js',
  './js/webdevgym-learning.js',
  './js/webdevgym-growth.js',
  './js/webdevgym-lab.js',
  './js/webdevgym-personalization.js',
  './js/webdevgym-custom-sounds.js',
  './js/webdevgym-forge.js',
  './js/webdevgym-pwa.js',
  './js/webdevgym-mobile.js',
  './js/webdevgym-ai-settings.js',
  './js/webdevgym-github-token-vault.js',
  './js/webdevgym-github-folder.js',
  './js/webdevgym-studio-suite.js',
  './js/webdevgym-github-workspace.js',
  './js/webdevgym-mobile-performance.js'
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL)));
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (request.destination === 'script' || request.destination === 'style') {
    event.respondWith(
      fetch(request)
        .then(response => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
          }
          return response;
        })
        .catch(() => caches.match(request))
    );
    return;
  }


  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(response => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
          return response;
        })
        .catch(() => caches.match(request).then(response => response || caches.match('./index.html')))
    );
    return;
  }

  event.respondWith(
    caches.match(request).then(cached => {
      if (cached) return cached;
      return fetch(request).then(response => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
        }
        return response;
      });
    })
  );
});
