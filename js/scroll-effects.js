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
    // Trigger slightly before elements hit the center; allow re-hide when leaving viewport
  const options = { threshold: [0, 0.1], rootMargin: '0px 0px -100px 0px' };
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const el = entry.target;
        const type = el.getAttribute('data-scroll');
        if (entry.isIntersecting) {
          el.classList.add('visible');
          el.classList.remove('scroll-init');
          if (type) el.classList.add(`scroll-${type}`);
          // Stagger support for children: adds incremental transition-delay
          const staggerChildren = el.querySelectorAll('[data-stagger-child]');
          if (staggerChildren.length) {
            const base = parseFloat(el.getAttribute('data-stagger-base') || '80'); // ms
            staggerChildren.forEach((child, i) => {
              child.style.transitionDelay = `${i * base}ms`;
            });
          }
          if (el.hasAttribute('data-scroll-once')) observer.unobserve(el);
        } else if (!el.hasAttribute('data-scroll-once')) {
          el.classList.remove('visible');
          el.classList.add('scroll-init');
          if (type) el.classList.remove(`scroll-${type}`);
          if (type && type.indexOf('parallax') !== -1) {
            el.style.transform = '';
          }
          // Reset child delays when leaving view
          el.querySelectorAll('[data-stagger-child]').forEach((child) => {
            child.style.transitionDelay = '';
          });
        }
      });
    }, options);

    const els = document.querySelectorAll('[data-scroll]');
    els.forEach((el) => {
      // If element is a SideRun host or contains one, avoid opacity transitions (transform-only)
      const hasSRHost = el.classList.contains('sr-container') || !!el.querySelector('.sr-container');
      if (hasSRHost) {
        el.classList.add('scroll-transform-only');
      }
      observer.observe(el);
      el.classList.add('scroll-init');
    });

    // Initial reveal pass: if element is already in the viewport, mark as visible now.
    // This guards against cases near the bottom/top where rootMargin prevents initial intersect.
    function isInViewport(el) {
      const rect = el.getBoundingClientRect();
      return rect.bottom > 0 && rect.top < window.innerHeight;
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
        const elCenter = rect.top + rect.height / 2;
        const viewportCenter = window.innerHeight / 2;
        const distance = elCenter - viewportCenter;
        const type = el.getAttribute('data-scroll');

        // Skip if far off-screen to save work
        if (rect.bottom < -240 || rect.top > window.innerHeight + 240) return;

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

  // Bootstrap on DOM ready
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
