/**
 * Scroll + Parallax Effects 
 * - IntersectionObserver toggles entrance animations on [data-scroll]
 * - rAF parallax updates for [data-scroll*="parallax"] elements
 * - Reduced-motion support disables all motion
 */
(function () {
  const prefersReducedMotion =
    window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function initObserver() {
    if (prefersReducedMotion) return;
  const options = { threshold: [0, 0.05, 0.1], rootMargin: '0px 0px 240px 0px' };
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const el = entry.target;
        const type = el.getAttribute('data-scroll');
        if (entry.isIntersecting) {
          el.classList.add('visible');
          el.classList.remove('scroll-init');
          if (type) el.classList.add(`scroll-${type}`);
          const staggerChildren = el.querySelectorAll('[data-stagger-child]');
          if (staggerChildren.length) {
            const base = parseFloat(el.getAttribute('data-stagger-base') || '80'); // ms
            staggerChildren.forEach((child, i) => {
              child.style.transitionDelay = `${i * base}ms`;
            });
          }
          if (el.hasAttribute('data-scroll-once')) observer.unobserve(el);
        } else if (!el.hasAttribute('data-scroll-once')) {
          const exitBuffer = 80; 
          const r = el.getBoundingClientRect();
          if (r.bottom < -exitBuffer || r.top > window.innerHeight + exitBuffer) {
            el.classList.remove('visible');
            el.classList.add('scroll-init');
            if (type) el.classList.remove(`scroll-${type}`);
            if (type && type.indexOf('parallax') !== -1) {
              el.style.transform = '';
            }
            el.querySelectorAll('[data-stagger-child]').forEach((child) => {
              child.style.transitionDelay = '';
            });
          }
        }
      });
    }, options);

    const els = document.querySelectorAll('[data-scroll]');
    els.forEach((el) => {
      const inHero = el.closest && el.closest('#hero');
      if (inHero && el.matches('.hero, .hero *')) {
      }
      const hasSRHost = el.classList.contains('sr-container') || !!el.querySelector('.sr-container');
      if (hasSRHost) {
        el.classList.add('scroll-transform-only');
      }
      observer.observe(el);
      el.classList.add('scroll-init');
    });
    function isInViewport(el) {
      const rect = el.getBoundingClientRect();
      const buffer = 240;
      return rect.bottom > -buffer && rect.top < window.innerHeight + buffer;
    }
    els.forEach((el) => {
      if (isInViewport(el)) {
        const type = el.getAttribute('data-scroll');
        el.classList.add('visible');
        el.classList.remove('scroll-init');
        if (type) el.classList.add(`scroll-${type}`);
      }
    });
  }

  function computeRate(type, distanceFromCenter) {
    const base = distanceFromCenter / window.innerHeight;
    switch (type) {
      case 'parallax-slow':
        return base * -30;
      case 'parallax-medium':
        return base * -50;
      case 'parallax-fast':
        return base * -90;
      default:
        return base * -40;
    }
  }

  function initParallax() {
    if (prefersReducedMotion) return;

    // helper: small viewport / touch devices should avoid heavy parallax
    const isSmallViewport = () => (window.matchMedia && window.matchMedia('(max-width: 767px)').matches) || ('ontouchstart' in window && window.innerWidth < 900);

    let ticking = false;
    let resizeTimer = null;

    const getEls = () => document.querySelectorAll('[data-scroll*="parallax"]');

    function clearTransforms() {
      getEls().forEach((el) => {
        el.style.transform = '';
        el.style.willChange = '';
      });
    }

    // smoothing helpers
    function lerp(a, b, t) { return a + (b - a) * t; }

    // store state per element to animate smoothly
    const elemState = new WeakMap();

    function updateParallax() {
      // If on a small device, clear transforms and skip heavy updates
      if (isSmallViewport()) {
        clearTransforms();
        ticking = false;
        return;
      }

      const els = getEls();
      const vh = window.innerHeight;
      const viewportCenter = vh / 2;
      const buffer = 240;
      els.forEach((el) => {
        const rect = el.getBoundingClientRect();
        if (rect.bottom <= -buffer || rect.top >= vh + buffer) return;
        const elCenter = rect.top + rect.height / 2;
        const distance = elCenter - viewportCenter;
        const type = el.getAttribute('data-scroll') || '';

        // Reduce strength on medium-sized touch/tablet devices
        let rawRate = computeRate(type, distance);
        if (window.innerWidth >= 600 && window.innerWidth <= 1100 && ('ontouchstart' in window)) {
          rawRate *= 0.6; // dampen for tablets
        }

        // Smoothly interpolate from previous transform to target
        const prev = elemState.get(el) || 0;
        // choose a small lerp factor; lower = smoother/slower
        const t = 0.18; // smoothing factor
        const next = lerp(prev, rawRate, t);
        elemState.set(el, next);
        el.style.willChange = 'transform';
        el.style.transform = `translate3d(0, ${next}px, 0)`;
      });
      ticking = false;
    }

    function onScroll() {
      // On mobile, do nothing (other than ensure transforms are cleared)
      if (isSmallViewport()) {
        if (!ticking) {
          ticking = true;
          requestAnimationFrame(() => { clearTransforms(); ticking = false; });
        }
        return;
      }
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(updateParallax);
      }
    }

    function onResize() {
      if (resizeTimer) clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        if (isSmallViewport()) {
          clearTransforms();
        } else {
          updateParallax();
        }
      }, 120);
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize, { passive: true });

    // initial
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
      if (isSmallViewport()) clearTransforms(); else updateParallax();
    } else {
      document.addEventListener('DOMContentLoaded', () => {
        if (isSmallViewport()) clearTransforms(); else updateParallax();
      }, { once: true });
    }
  }
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    initObserver();
    initParallax();
  } else {
    document.addEventListener('DOMContentLoaded', () => {
      initObserver();
      initParallax();
    });
  }
})();
