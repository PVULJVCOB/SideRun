(function () {
  // Navbar behavior and mobile menu logic (desktop-focused UI)
  const menuPrompt = document.getElementById('menu-prompt');
  const clickCatch = document.getElementById('menu-overlay');
  const mobileMenu = document.getElementById('mobile-menu');

  const burgerIcon = `
    <div class="menu-prompt__icon siderun">
      <svg width="37" height="37" viewBox="0 0 37 37" xmlns="http://www.w3.org/2000/svg" fill="#080232" class="siderun">
        <rect x="9" y="18" width="19" height="1"></rect>
        <rect x="9" y="22" width="19" height="1"></rect>
        <rect x="9" y="14" width="19" height="1"></rect>
      </svg>
    </div>`;
  const closeIcon = `
    <div class="menu-prompt__icon siderun">
      <svg width="37" height="37" viewBox="0 0 37 37" xmlns="http://www.w3.org/2000/svg" fill="#080232" class="siderun">
        <rect x="11" y="25.4351" width="19" height="1" transform="rotate(-45 11 25.4351)"></rect>
        <rect x="11.707" y="12.0005" width="19" height="1" transform="rotate(45 11.707 12.0005)"></rect>
      </svg>
    </div>`;

  // Focus management
  let lastFocused = null;
  const focusableSelector =
    'a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])';
  function trapFocus(container, e) {
    const nodes = Array.from(container.querySelectorAll(focusableSelector)).filter(
      (el) => !el.hasAttribute('disabled')
    );
    if (nodes.length === 0) return;
    const first = nodes[0];
    const last = nodes[nodes.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  function openMenu() {
    if (!menuPrompt || !clickCatch || !mobileMenu) return;
    lastFocused = document.activeElement;
    menuPrompt.setAttribute('aria-expanded', 'true');
    mobileMenu.setAttribute('aria-hidden', 'false');
    mobileMenu.setAttribute('aria-modal', 'true');
    document.body.classList.add('no-scroll');
    document.documentElement.classList.add('menu-open');
    mobileMenu.classList.add('is-open');
    clickCatch.classList.add('is-open');
    try {
      mobileMenu.querySelector('a')?.focus();
    } catch {}
    menuPrompt.innerHTML = closeIcon;
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keydown', onKeyDownTrap);
  }
  function closeMenu() {
    if (!menuPrompt || !clickCatch || !mobileMenu) return;
    menuPrompt.setAttribute('aria-expanded', 'false');
    mobileMenu.setAttribute('aria-hidden', 'true');
    mobileMenu.setAttribute('aria-modal', 'false');
    document.body.classList.remove('no-scroll');
    document.documentElement.classList.remove('menu-open');
    mobileMenu.classList.remove('is-open');
    clickCatch.classList.remove('is-open');
    menuPrompt.innerHTML = burgerIcon;
    document.removeEventListener('keydown', onKeyDown);
    document.removeEventListener('keydown', onKeyDownTrap);
    if (lastFocused && typeof lastFocused.focus === 'function') {
      try {
        lastFocused.focus();
      } catch {}
    }
  }
  function toggleMenu() {
    const expanded = menuPrompt.getAttribute('aria-expanded') === 'true';
    expanded ? closeMenu() : openMenu();
  }
  function onKeyDown(e) {
    if (e.key === 'Escape') closeMenu();
  }
  function onKeyDownTrap(e) {
    if (e.key !== 'Tab') return;
    trapFocus(mobileMenu, e);
  }

  if (menuPrompt && clickCatch && mobileMenu) {
    menuPrompt.addEventListener('click', toggleMenu);
    clickCatch.addEventListener('click', closeMenu);
    // Close on navigation click in mobile menu
    mobileMenu.addEventListener('click', (e) => {
      if (e.target.closest('a')) closeMenu();
    });
  }

  // Border effect (SideRun): provided by SideRun.init from js/siderun.js

  // Initialize SideRun for desktop nav and (hidden) mobile elements
  const desktopNav = document.querySelector('.site-nav.siderun');
  const mobileBar = document.querySelector('.mobile-nav.siderun');
  const mobilePanel = document.querySelector('#mobile-menu');
  const navLinks = desktopNav ? desktopNav.querySelector('.site-nav__links.siderun') : null;
  const measureLinksWidth = () => {
    if (!desktopNav || !navLinks) return;
    // Use scrollWidth to get the full width of links content
    const w = Math.ceil(navLinks.scrollWidth + 1);
    desktopNav.style.setProperty('--nav-links-max', `${w}px`);
  };
  // Desktop nav: expand on hover with delayed collapse
  if (desktopNav) {
    let collapseTimer = null;
    const expand = () => {
      if (collapseTimer) {
        clearTimeout(collapseTimer);
        collapseTimer = null;
      }
      measureLinksWidth();
      desktopNav.classList.add('is-expanded');
    };
    const scheduleCollapse = () => {
      if (collapseTimer) {
        clearTimeout(collapseTimer);
      }
      collapseTimer = setTimeout(() => {
        desktopNav.classList.remove('is-expanded');
        collapseTimer = null;
      }, 1000); // wait 1s before collapsing
    };
    desktopNav.addEventListener('mouseenter', expand);
    desktopNav.addEventListener('mouseleave', scheduleCollapse);
    // Keep open while focusing links via keyboard
    desktopNav.addEventListener('focusin', expand);
    desktopNav.addEventListener('focusout', scheduleCollapse);
    // Measure once at start and on resize
    measureLinksWidth();
    window.addEventListener('resize', measureLinksWidth);
  }
  if (window.SideRun && typeof window.SideRun.init === 'function') {
    const common = { margin: 11 };
    // For desktop nav: start effect on host hover and move smoothly
    SideRun.init(desktopNav, { ...common, trackPointer: true, ease: 0.08 });
    SideRun.init(mobileBar, common);
    SideRun.init(mobilePanel, { ...common, tail: 30, isBottom: true });
    // Note: no glass-card initialization; only navbar and mobile panel are initialized
  }
})();
