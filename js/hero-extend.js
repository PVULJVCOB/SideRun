/**
 * Hero extension logic
 * - Ensures the hero background visually bleeds beyond actual content height
 * - Prevents white bands on ultra-tall devices (very long screens)
 * - Works by computing safe viewport sizes and exposing CSS vars
 * - Non-intrusive: no layout jumps; respects reduced motion
 */
(function () {
  const docEl = document.documentElement;
  const hero = document.getElementById('hero');
  if (!hero) return;

  function updateVars() {
    // Compute visual viewport height with fallbacks
    const svh = window.innerHeight; // maps to 100svh in many browsers
    const dvh = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
    // Amount of extra visual space versus layout viewport
    const bleed = Math.max(0, svh - dvh);
    // Expose as CSS custom properties for hero.css to use
    docEl.style.setProperty('--hero-bleed-extra', bleed + 'px');
    // Ensure hero min-height respects safe visual viewport
    docEl.style.setProperty('--hero-height', Math.max(svh, 540) + 'px');
  }

  const ro = new ResizeObserver(() => updateVars());
  ro.observe(document.documentElement);
  window.addEventListener('orientationchange', updateVars, { passive: true });
  window.addEventListener('resize', updateVars, { passive: true });

  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    updateVars();
  } else {
    document.addEventListener('DOMContentLoaded', updateVars, { once: true });
  }
})();
