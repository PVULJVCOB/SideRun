/**
 * SideRun navigation: desktop expansion + SideRun init
 * - Mobile nav is handled by js/mobile-nav.js (React UMD). This file keeps desktop logic lean.
 */
(function () {
  'use strict';

  // Scrollbar-aware slight centering to visually balance logo/nav when scrollbar appears
  function calculateScrollbarWidth() {
    const outer = document.createElement('div');
    outer.style.visibility = 'hidden';
    outer.style.overflow = 'scroll';
    document.body.appendChild(outer);
    const inner = document.createElement('div');
    outer.appendChild(inner);
    const w = outer.offsetWidth - inner.offsetWidth;
    outer.remove();
    return w;
  }
  function updateViewportCentering() {
    const sw = calculateScrollbarWidth();
    const hasVScroll = document.documentElement.scrollHeight > document.documentElement.clientHeight;
    const navbar = document.querySelector('.site-nav.siderun');
    const logo = document.querySelector('#logo.nav_button-left.siderun');
    if (hasVScroll && sw > 0) {
      document.documentElement.style.setProperty('--sr-scrollbar-offset', `${sw / 2}px`);
      if (navbar) navbar.style.transform = `translateX(-${sw / 4}px)`;
      if (logo) logo.style.transform = `translateX(${sw / 4}px)`;
    } else {
      document.documentElement.style.removeProperty('--sr-scrollbar-offset');
      if (navbar) navbar.style.removeProperty('transform');
      if (logo) logo.style.removeProperty('transform');
    }
  }
  window.addEventListener('load', updateViewportCentering);
  window.addEventListener('resize', updateViewportCentering);
  const ro = new ResizeObserver(updateViewportCentering);
  ro.observe(document.body);

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
