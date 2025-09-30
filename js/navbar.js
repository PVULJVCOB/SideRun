/**
 * SideRun navigation: desktop expansion + SideRun init
 * - Mobile nav is handled by js/mobile-nav.js (React UMD). This file keeps desktop logic lean.
 */
(function () {
  'use strict';

  // Removed scrollbar-compensation logic: scrollbars are hidden via CSS and navbar is flush right

  // Desktop nav expand/collapse and SideRun init
  function initDesktopNav() {
    const desktopNav = document.querySelector('.site-nav.siderun');
    if (!desktopNav) return;
    const navLinks = desktopNav.querySelector('.site-nav__links.siderun');
    const measureLinksWidth = () => {
      if (!navLinks) return;
      const w = Math.ceil(navLinks.scrollWidth + 1);
      desktopNav.style.setProperty('--nav-links-max', `${w}px`);
    };
    let collapseTimer = null;
    const expand = () => {
      if (collapseTimer) { clearTimeout(collapseTimer); collapseTimer = null; }
      measureLinksWidth();
      desktopNav.classList.add('is-expanded');
    };
    const scheduleCollapse = () => {
      if (collapseTimer) clearTimeout(collapseTimer);
      collapseTimer = setTimeout(() => {
        desktopNav.classList.remove('is-expanded');
        collapseTimer = null;
      }, 1000);
    };
    desktopNav.addEventListener('mouseenter', expand);
    desktopNav.addEventListener('mouseleave', scheduleCollapse);
    desktopNav.addEventListener('focusin', expand);
    desktopNav.addEventListener('focusout', scheduleCollapse);
    measureLinksWidth();
    window.addEventListener('resize', measureLinksWidth);

    // Init SideRun for nav (logo/demo inits live in index.html to avoid double init)
    if (window.SideRun?.init) {
      try { window.SideRun.init(desktopNav, { margin: 11, trackPointer: true, ease: 0.08 }); } catch {}
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDesktopNav, { once: true });
  } else {
    initDesktopNav();
  }
})();
// Toggle button behaviour for <=1200px: supports touch and keyboard
(function () {
  'use strict';
  const TOGGLE_BREAKPOINT = 1200;
  const toggle = document.querySelector('.site-nav-toggle');
  const nav = document.querySelector('.site-nav.siderun');
  if (!toggle || !nav) return;

  let outsideListener = null;
  let hoverCloseTimer = null;

  const setExpanded = (expanded) => {
    toggle.setAttribute('aria-expanded', expanded ? 'true' : 'false');
    if (expanded) nav.classList.add('is-shown-by-toggle'); else nav.classList.remove('is-shown-by-toggle');
  };

  const closeNav = () => {
    setExpanded(false);
    if (outsideListener) { document.removeEventListener('pointerdown', outsideListener); outsideListener = null; }
    if (hoverCloseTimer) { clearTimeout(hoverCloseTimer); hoverCloseTimer = null; }
  };

  const openNav = () => {
    setExpanded(true);
    // close when clicking/tapping outside
    outsideListener = (e) => {
      if (!nav.contains(e.target) && !toggle.contains(e.target)) closeNav();
    };
    document.addEventListener('pointerdown', outsideListener);
  };

  // pointer hover: when pointer enters the toggle, hide the toggle and show nav (desktop hover behavior)
  const onTogglePointerEnter = (e) => {
    // only activate for pointer (not touch) and when within breakpoint
    if (e.pointerType === 'mouse' || e.pointerType === 'pen') {
      // cancel any pending close
      if (hoverCloseTimer) { clearTimeout(hoverCloseTimer); hoverCloseTimer = null; }
      toggle.classList.add('is-hidden-by-hover');
      openNav();
    }
  };

  const onNavPointerLeave = (e) => {
    // when pointer leaves the nav entirely, restore toggle and close nav
    // use relatedTarget to ensure we didn't move into the toggle
    const rt = e.relatedTarget;
    if (!nav.contains(rt) && !toggle.contains(rt)) {
      // schedule a short delay before closing so brief pointer exits don't immediately hide the nav
      if (hoverCloseTimer) clearTimeout(hoverCloseTimer);
      hoverCloseTimer = setTimeout(() => {
        toggle.classList.remove('is-hidden-by-hover');
        closeNav();
        hoverCloseTimer = null;
      }, 180);
    }
  };

  // if pointer re-enters the nav, cancel any scheduled close
  const onNavPointerEnter = () => {
    if (hoverCloseTimer) { clearTimeout(hoverCloseTimer); hoverCloseTimer = null; }
  };

  nav.addEventListener('pointerenter', onNavPointerEnter);

  toggle.addEventListener('pointerenter', onTogglePointerEnter);
  nav.addEventListener('pointerleave', onNavPointerLeave);

  // toggle on click/pointerdown
  toggle.addEventListener('click', (e) => {
    e.preventDefault();
    const expanded = toggle.getAttribute('aria-expanded') === 'true';
    if (expanded) closeNav(); else openNav();
  });

  // keyboard: Space or Enter activates the button
  toggle.addEventListener('keydown', (e) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      toggle.click();
    } else if (e.key === 'Escape') {
      closeNav();
      toggle.focus();
    }
  });

  // close on Escape when nav has focus
  nav.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { closeNav(); toggle.focus(); }
  });

  // ensure nav is hidden when resized above breakpoint
  const onResize = () => {
    if (window.innerWidth > TOGGLE_BREAKPOINT) { closeNav(); }
  };
  window.addEventListener('resize', onResize);
})();
