/**
 * Hero Parallax for SideRun landing page
 * - Uses requestAnimationFrame for smooth updates
 * - Passive scroll/resize listeners
 * - Honors prefers-reduced-motion
 * - Isolated and non-intrusive: only affects .hero-parallax layers
 */
(function () {
  // Guard: respect reduced motion preferences
  const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion) return;

  let ticking = false;
  let viewportH = window.innerHeight || 0;

  /**
   * Cache parallax layers with depth factors
   */
  const root = document.querySelector('.hero');
  if (!root) return; // no hero on page

  const layers = Array.from(root.querySelectorAll('.hero-parallax__layer')).map((el) => {
    const depth = parseFloat(el.getAttribute('data-depth') || '0.1');
    return { el, depth };
  });

  if (!layers.length) return;

  /**
   * Compute a transform based on scroll position.
   * We translate layers vertically by (scrollProgress * depth * factor).
   */
  function update() {
    ticking = false;

    const rect = root.getBoundingClientRect();
    // progress: 0 when hero top at viewport top, increases as you scroll down
    const progress = Math.min(1.25, Math.max(0, (0 - rect.top) / (viewportH || 1)));
  const base = 50; // subtler translation to match minimal reference style

    for (const { el, depth } of layers) {
      const translateY = progress * depth * base;
      el.style.transform = `translate3d(0, ${translateY}px, 0)`;
    }
  }

  function onScroll() {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(update);
    }
  }

  function onResize() {
    viewportH = window.innerHeight || viewportH;
    onScroll();
  }

  // Initialize and bind events with passive listeners
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onResize, { passive: true });

  // Initial paint after DOM ready
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    onResize();
  } else {
    document.addEventListener('DOMContentLoaded', onResize, { once: true });
  }
})();
