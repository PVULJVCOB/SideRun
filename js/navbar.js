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

  // Mobile-friendly menu toggle + safe viewport handling
  function initMobileNav() {
    const nav = document.querySelector('.site-nav.siderun');
    if (!nav) return;

    // If small viewport (phone) we intentionally hide the navbar (CSS handles it)
    // and set aria-hidden for assistive tech. Skip adding mobile handlers.
    if (window.matchMedia && window.matchMedia('(max-width: 767px)').matches) {
      nav.setAttribute('aria-hidden', 'true');
      nav.classList.remove('is-open');
      return;
    }
    const button = nav.querySelector('.site-nav__button.siderun');
    const links = nav.querySelector('.site-nav__links.siderun');

    // Helper: set CSS --vh to the current innerHeight to avoid mobile chrome white bars
    const setVh = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };
    setVh();
    window.addEventListener('resize', setVh, { passive: true });

    // Toggle handler
    const openMenu = () => {
      nav.classList.add('is-open');
      nav.setAttribute('aria-expanded', 'true');
      if (links) links.setAttribute('aria-hidden', 'false');
      // Optionally push focus to first link for keyboard and a11y
      const first = nav.querySelector('.site-nav__link.siderun');
      if (first) first.focus({ preventScroll: true });
      // If nav supports overlay, enable it via data-attribute
      if (nav.hasAttribute('data-overlay')) document.body.style.overflow = 'hidden';
      // Focus trap: keep focus within nav when overlay is open (desktop only)
      if (!window.matchMedia || !window.matchMedia('(max-width: 767px)').matches) {
        // mark main content as hidden to screen readers
        const main = document.querySelector('main');
        if (main) main.setAttribute('aria-hidden', 'true');
        // add focus sentinels to cycle focus
        if (!nav.querySelector('.sr-focus-start')) {
          const start = document.createElement('button');
          start.className = 'sr-focus-start sr-visually-hidden';
          start.type = 'button';
          start.tabIndex = 0;
          start.addEventListener('focus', () => { const last = nav.querySelector('.site-nav__link.siderun:last-of-type'); if (last) last.focus(); });
          nav.insertBefore(start, nav.firstChild);
        }
        if (!nav.querySelector('.sr-focus-end')) {
          const end = document.createElement('button');
          end.className = 'sr-focus-end sr-visually-hidden';
          end.type = 'button';
          end.tabIndex = 0;
          end.addEventListener('focus', () => { const firstLink = nav.querySelector('.site-nav__link.siderun'); if (firstLink) firstLink.focus(); });
          nav.appendChild(end);
        }
      }
    };
    const closeMenu = () => {
      nav.classList.remove('is-open');
      nav.setAttribute('aria-expanded', 'false');
      if (links) links.setAttribute('aria-hidden', 'true');
      if (nav.hasAttribute('data-overlay')) document.body.style.overflow = '';
      button.focus({ preventScroll: true });
      // remove focus trap and restore main content a11y
      const main = document.querySelector('main');
      if (main) main.removeAttribute('aria-hidden');
      const start = nav.querySelector('.sr-focus-start');
      const end = nav.querySelector('.sr-focus-end');
      if (start) start.remove();
      if (end) end.remove();
    };

    if (button) {
      button.addEventListener('click', (e) => {
        const isOpen = nav.classList.contains('is-open');
        if (isOpen) closeMenu(); else openMenu();
      });
      // Keyboard: close on Escape
      document.addEventListener('keydown', (ev) => {
        if (ev.key === 'Escape' && nav.classList.contains('is-open')) closeMenu();
      });
    }

    // Close when clicking outside (for overlay behavior)
    document.addEventListener('click', (ev) => {
      if (!nav.classList.contains('is-open')) return;
      if (nav.contains(ev.target)) return;
      closeMenu();
    }, { capture: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => { initDesktopNav(); initMobileNav(); }, { once: true });
  } else {
    initDesktopNav();
    initMobileNav();
  }
})();