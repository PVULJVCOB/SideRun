// mobile-nav.js
// Minimal shim for environments where the real mobile nav is not available.
(function () {
  'use strict';
  if (typeof window === 'undefined' || typeof document === 'undefined') return;
  try {
    // If React is present, mount a tiny placeholder to the mobile nav root
    const root = document.getElementById('mobile-nav-root');
    if (root) {
      root.setAttribute('data-mobile-nav', 'shim');
    }
    if (window && window.console && window.console.debug) console.debug('mobile-nav shim loaded');
  } catch (e) { /* noop */ }
})();
