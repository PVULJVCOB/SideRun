/**
 * SideRun navigation: desktop expansion + SideRun init
 */
(function () {
  'use strict';

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