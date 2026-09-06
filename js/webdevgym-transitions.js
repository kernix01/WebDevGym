(() => {
  'use strict';

  const viewSelector = [
    '.section.active',
    '.wdgn-overview:not([hidden])',
    '.wdgn-sections-page:not([hidden])',
    '.wdgf-feature-page.open',
    '.wdgt-page.open',
    '.wdg-growth-page.open',
    '.wdgr-settings-view.open',
    '.wdgr-settings-page.active'
  ].join(',');

  const viewRootSelector = [
    '.section',
    '.wdgn-overview',
    '.wdgn-sections-page',
    '.wdgf-feature-page',
    '.wdgt-page',
    '.wdg-growth-page',
    '.wdgr-settings-view',
    '.wdgr-settings-page'
  ].join(',');

  const running = new Map();
  const queued = new Set();
  const watchedViews = new WeakSet();
  let ready = false;
  let frame = 0;

  function isActiveView(element) {
    return element instanceof HTMLElement && element.matches(viewSelector);
  }

  function isVisibleView(element) {
    if (!isActiveView(element) || element.hidden) return false;
    if (element.matches('.section') && document.body.matches('.wdgn-overview-open, .wdgn-custom-page-open, .wdgf-page-open, .wdgr-settings-open')) return false;
    return !element.closest('[hidden]');
  }

  function animateView(element) {
    if (!ready || !isVisibleView(element) || element.closest('[data-no-view-transition]')) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (element.matches('.section.active') && element.querySelectorAll('*').length > 700) return;

    running.get(element)?.cancel();

    const lightEffects = document.body.classList.contains('wdgr-light-effects');
    const animation = element.animate([
      { opacity: lightEffects ? 0.92 : 0.84, transform: `translate3d(0, ${lightEffects ? 2 : 4}px, 0)` },
      { opacity: 1, transform: 'translate3d(0, 0, 0)' }
    ], {
      duration: lightEffects ? 80 : 130,
      easing: 'cubic-bezier(.22, .8, .32, 1)',
      fill: 'both'
    });
    animation.id = 'webdevgym-view-transition';

    running.set(element, animation);
    animation.finished.catch(() => {}).finally(() => {
      if (running.get(element) !== animation) return;
      running.delete(element);
      animation.cancel();
    });
  }

  function flushQueue() {
    frame = 0;
    const views = [...queued].filter(isVisibleView);
    queued.clear();

    // When a full-screen view and one of its inner tabs open together,
    // animate only the outer view so opacity is not applied twice.
    views
      .filter(view => !views.some(parent => parent !== view && parent.contains(view)))
      .forEach(animateView);
  }

  function queueView(element, includeChildren = false) {
    if (!ready || !(element instanceof HTMLElement)) return;
    if (!isVisibleView(element) && running.has(element)) {
      running.get(element).cancel();
      running.delete(element);
    }
    if (isVisibleView(element)) queued.add(element);
    if (includeChildren) element.querySelectorAll?.(viewSelector).forEach(view => queued.add(view));
    if (!frame && queued.size) frame = requestAnimationFrame(flushQueue);
  }

  function watchView(view) {
    if (!(view instanceof HTMLElement) || watchedViews.has(view)) return;
    watchedViews.add(view);
    new MutationObserver(() => queueView(view)).observe(view, {
      attributes: true,
      attributeFilter: ['class', 'hidden']
    });
  }

  function discoverViews(root) {
    if (!(root instanceof Element || root instanceof Document)) return;
    if (root instanceof Element && root.matches(viewRootSelector)) watchView(root);
    root.querySelectorAll?.(viewRootSelector).forEach(watchView);
  }

  function start() {
    discoverViews(document);

    const observer = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        mutation.addedNodes.forEach(node => {
          if (!(node instanceof Element)) return;
          discoverViews(node);
          queueView(node, true);
        });
      });
      running.forEach((animation, element) => {
        if (isVisibleView(element)) return;
        animation.cancel();
        running.delete(element);
      });
    });

    observer.observe(document.body, {
      subtree: true,
      childList: true
    });

    // Existing content must stay still on the first paint. Only later
    // navigation changes receive the transition.
    requestAnimationFrame(() => { ready = true; });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once: true });
  } else {
    start();
  }
})();
