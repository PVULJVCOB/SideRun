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
    let ticking = false;

    function updateParallax() {
      const els = document.querySelectorAll('[data-scroll*="parallax"]');
      els.forEach((el) => {
        const rect = el.getBoundingClientRect();
  const buffer = 240;
  if (rect.bottom <= -buffer || rect.top >= window.innerHeight + buffer) return;
        const elCenter = rect.top + rect.height / 2;
        const viewportCenter = window.innerHeight / 2;
        const distance = elCenter - viewportCenter;
        const type = el.getAttribute('data-scroll');
  if (rect.bottom < -buffer || rect.top > window.innerHeight + buffer) return;

        const rate = computeRate(type, distance);
        el.style.transform = `translate3d(0, ${rate}px, 0)`;
      });
      ticking = false;
    }

    function onScroll() {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(updateParallax);
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', updateParallax, { passive: true });

    // initial
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
      updateParallax();
    } else {
      document.addEventListener('DOMContentLoaded', updateParallax, { once: true });
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
