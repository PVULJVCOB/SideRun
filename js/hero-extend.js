// hero-extend.js
// Lightweight no-op shim to avoid 404 during automated tests/CI.
// Real implementation can be swapped in later.
(function () {
  'use strict';
  // Safe guard: only run if document exists
  if (typeof document === 'undefined') return;
  try {
    // Minimal behavior: add a data attribute to body so tests can detect presence
    document.documentElement.setAttribute('data-hero-extend', 'shim');
    if (window && window.console && window.console.debug) {
      console.debug('hero-extend shim loaded');
    }
  } catch (e) { /* noop */ }
})();
