/**
 * ============================================================================
 * SIDERUN NAVIGATION SYSTEM
 * ============================================================================
 * 
 * Professional navigation system with flying border effects
 * Enhanced for mobile-first responsive design with performance optimization
 * 
 * Features:
 * - Responsive desktop/mobile navigation
 * - SideRun flying border effects
 * - Centered mobile navbar with smooth animations
 * - Performance-optimized event handling
 * - Accessibility support (keyboard navigation, ARIA labels)
 * - Error handling and graceful degradation
 * 
 * @version 1.3.0
 * @author SideRun Team
 * @requires js/siderun.js
 * @performance Optimized for 60fps animations
 */

(function() {
  'use strict';
  
  // Performance monitoring (development mode)
  const DEBUG = false;
  const perfLog = DEBUG ? console.log : () => {};
  const perfTime = DEBUG ? console.time : () => {};
  const perfTimeEnd = DEBUG ? console.timeEnd : () => {};

  // === DOM ELEMENT CACHE ===
  // Cache DOM elements for better performance
  const menuPrompt = document.getElementById('menu-prompt');
  const clickCatch = document.getElementById('menu-overlay');
  const mobileMenu = document.getElementById('mobile-menu');
  
  // === MOBILE NAVIGATION ELEMENTS ===
  const centeredMobileNav = document.getElementById('centered-mobile-nav');
  const centeredMenuBtn = document.getElementById('centered-menu-btn');
  const centeredDropdown = document.getElementById('centered-mobile-dropdown');

  /**
   * Toggle the centered mobile navigation menu
   * Handles ARIA attributes and scroll prevention
   */
  function toggleCenteredMenu() {
    if (!centeredMobileNav || !centeredMenuBtn) return;
    
    const isExpanded = centeredMobileNav.classList.toggle('expanded');
    centeredMenuBtn.setAttribute('aria-expanded', isExpanded);
    document.body.classList.toggle('no-scroll', isExpanded);

    // Compute dropdown height and expose as CSS var to host
    if (isExpanded && centeredDropdown) {
      // Force layout and get the natural scrollHeight (content height)
      const h = centeredDropdown.scrollHeight;
      centeredMobileNav.style.setProperty('--sr-dropdown-height', `${h}px`);
    } else {
      centeredMobileNav.style.removeProperty('--sr-dropdown-height');
    }

    // Force SideRun to re-measure after state change (twice to catch transitions)
    if (window.SideRun && typeof window.SideRun.update === 'function') {
      window.SideRun.update(centeredMobileNav);
      requestAnimationFrame(() => window.SideRun.update(centeredMobileNav));
    }
  }

  /**
   * Close the centered mobile menu
   * Restores scroll and updates ARIA states
   */
  function closeCenteredMenu() {
    if (!centeredMobileNav || !centeredMenuBtn) return;
    
    centeredMobileNav.classList.remove('expanded');
    centeredMenuBtn.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('no-scroll');
  }

  /**
   * Initialize centered mobile navigation
   * Sets up event listeners with proper error handling
   */
  function initCenteredMobileNav() {
    if (!centeredMenuBtn || !centeredDropdown) return;

    // Main toggle functionality
    centeredMenuBtn.addEventListener('click', toggleCenteredMenu, { passive: true });
    
    // Auto-close when navigating
    const centeredLinks = centeredDropdown.querySelectorAll('.centered-mobile-nav__link');
    centeredLinks.forEach(link => {
      link.addEventListener('click', () => {
        // Use requestAnimationFrame for smoother UX
        requestAnimationFrame(() => {
          setTimeout(closeCenteredMenu, 150);
        });
      }, { passive: true });
    });

    // Keyboard accessibility
    document.addEventListener('keydown', handleKeyDown, { passive: true });

    // Click outside to close (with performance optimization)
    let clickOutsideTimer;
    document.addEventListener('click', (e) => {
      clearTimeout(clickOutsideTimer);
      clickOutsideTimer = setTimeout(() => {
        if (centeredMobileNav?.classList.contains('expanded') && 
            !centeredMobileNav.contains(e.target)) {
          closeCenteredMenu();
        }
      }, 10);
    }, { passive: true });
  }

  /**
   * Handle keyboard events for navigation
   */
  function handleKeyDown(e) {
    if (e.key === 'Escape' && centeredMobileNav?.classList.contains('expanded')) {
      closeCenteredMenu();
    }
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCenteredMobileNav);
  } else {
    initCenteredMobileNav();
  }

  // Device and viewport detection
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  let isMobile = window.matchMedia('(max-width: 768px)').matches;
  
  // Update mobile state on resize
  const mediaQuery = window.matchMedia('(max-width: 768px)');
  mediaQuery.addEventListener('change', (e) => {
    isMobile = e.matches;
    if (!isMobile) {
      closeMenu(); // Close mobile menu when switching to desktop
      closeCenteredMenu(); // Close new mobile menu when switching to desktop
    }
  });

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

  // Enhanced menu open with smooth animations
  function openMenu() {
    if (!menuPrompt || !clickCatch || !mobileMenu) return;
    
    // Store focus for restoration
    lastFocused = document.activeElement;
    
    // Update ARIA states
    menuPrompt.setAttribute('aria-expanded', 'true');
    menuPrompt.classList.add('is-open');
    mobileMenu.setAttribute('aria-hidden', 'false');
    mobileMenu.setAttribute('aria-modal', 'true');
    
    // Prevent body scroll
    document.body.classList.add('no-scroll');
    document.documentElement.classList.add('menu-open');
    
    // Show elements with animation
    clickCatch.classList.add('is-open');
    
    // Slight delay for backdrop animation
    setTimeout(() => {
      mobileMenu.classList.add('is-open');
    }, 50);
    
    // Update icon
    menuPrompt.innerHTML = closeIcon;
    
    // Focus management - use setTimeout for better touch device experience
    if (!isTouchDevice) {
      setTimeout(() => {
        try {
          mobileMenu.querySelector('a')?.focus();
        } catch {}
      }, 100);
    }
    
    // Event listeners
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keydown', onKeyDownTrap);
  }

  // Enhanced menu close with smooth animations  
  function closeMenu() {
    if (!menuPrompt || !clickCatch || !mobileMenu) return;
    
    // Update ARIA states
    menuPrompt.setAttribute('aria-expanded', 'false');
    menuPrompt.classList.remove('is-open');
    mobileMenu.setAttribute('aria-hidden', 'true');
    mobileMenu.setAttribute('aria-modal', 'false');
    
    // Start close animation
    mobileMenu.classList.remove('is-open');
    
    // Wait for animation before hiding backdrop
    setTimeout(() => {
      clickCatch.classList.remove('is-open');
      document.body.classList.remove('no-scroll');
      document.documentElement.classList.remove('menu-open');
    }, 150);
    
    // Update icon
    menuPrompt.innerHTML = burgerIcon;
    
    // Remove event listeners
    document.removeEventListener('keydown', onKeyDown);
    document.removeEventListener('keydown', onKeyDownTrap);
    
    // Restore focus
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

  // Enhanced event handling with touch optimization
  if (menuPrompt && clickCatch && mobileMenu) {
    // Touch-optimized menu button
    if (isTouchDevice) {
      menuPrompt.addEventListener('touchstart', (e) => {
        e.preventDefault(); // Prevent double-tap zoom
        toggleMenu();
      }, { passive: false });
    } else {
      menuPrompt.addEventListener('click', toggleMenu);
    }
    
    // Backdrop click/touch to close
    clickCatch.addEventListener('click', closeMenu);
    if (isTouchDevice) {
      clickCatch.addEventListener('touchstart', closeMenu, { passive: true });
    }
    
    // Close on navigation click/touch in mobile menu
    mobileMenu.addEventListener('click', (e) => {
      if (e.target.closest('a')) {
        // Add small delay for touch feedback
        if (isTouchDevice) {
          setTimeout(closeMenu, 100);
        } else {
          closeMenu();
        }
      }
    });
    
    if (isTouchDevice) {
      mobileMenu.addEventListener('touchstart', (e) => {
        if (e.target.closest('a')) {
          setTimeout(closeMenu, 150);
        }
      }, { passive: true });
    }
  }

  // Viewport size change handling
  function handleViewportChange() {
    // Close menu when switching from mobile to desktop
    if (!isMobile && mobileMenu && mobileMenu.classList.contains('is-open')) {
      closeMenu();
    }
  }

  // Listen for viewport changes
  window.addEventListener('resize', handleViewportChange);

  // Enhanced hover management for touch devices
  if (isTouchDevice) {
    // Remove hover states after touch ends
    document.addEventListener('touchend', () => {
      // Remove any lingering hover states
      const hoverElements = document.querySelectorAll(':hover');
      hoverElements.forEach(el => {
        if (el.blur) el.blur();
      });
    }, { passive: true });
  }

  // Scrollbar-aware positioning for navbar and logo centering
  function calculateScrollbarWidth() {
    const outer = document.createElement('div');
    outer.style.visibility = 'hidden';
    outer.style.overflow = 'scroll';
    outer.style.msOverflowStyle = 'scrollbar';
    document.body.appendChild(outer);
    
    const inner = document.createElement('div');
    outer.appendChild(inner);
    
    const scrollbarWidth = outer.offsetWidth - inner.offsetWidth;
    outer.parentNode.removeChild(outer);
    
    return scrollbarWidth;
  }

  function updateViewportCentering() {
    const scrollbarWidth = calculateScrollbarWidth();
    const hasVerticalScrollbar = document.documentElement.scrollHeight > document.documentElement.clientHeight;
    
    if (hasVerticalScrollbar && scrollbarWidth > 0) {
      // Adjust for scrollbar by offsetting elements slightly to the left
      document.documentElement.style.setProperty('--sr-scrollbar-offset', `${scrollbarWidth / 2}px`);
      
      // Apply offset to navbar and logo for better visual centering
      const navbar = document.querySelector('.site-nav.siderun');
      const logo = document.querySelector('#logo.nav_button-left.siderun');
      
      if (navbar) {
        navbar.style.transform = `translateX(-${scrollbarWidth / 4}px)`;
      }
      if (logo) {
        logo.style.transform = `translateX(${scrollbarWidth / 4}px)`;
      }
    } else {
      document.documentElement.style.removeProperty('--sr-scrollbar-offset');
      const navbar = document.querySelector('.site-nav.siderun');
      const logo = document.querySelector('#logo.nav_button-left.siderun');
      
      if (navbar) {
        navbar.style.removeProperty('transform');
      }
      if (logo) {
        logo.style.removeProperty('transform');
      }
    }
  }

  // Update on load and resize
  window.addEventListener('load', updateViewportCentering);
  window.addEventListener('resize', updateViewportCentering);
  
  // Update when content changes (for dynamic content)
  const resizeObserver = new ResizeObserver(updateViewportCentering);
  resizeObserver.observe(document.body);

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
  /**
   * Initialize all SideRun effects with performance optimization
   */
  function initializeAllSideRunEffects() {
    perfTime('SideRun-Init');
    
    if (!window.SideRun?.init) {
      console.warn('SideRun library not available');
      return;
    }

    try {
      // Optimized configuration presets
      const configs = {
        nav: { margin: 11, trackPointer: true, ease: 0.08 },
        mobile: { margin: 11, tail: 30, isBottom: true },
        logo: { margin: 11, ease: 0.1 },
        centered: { margin: 8, ease: 0.15, radius: 8, tail: 20 },
        cta: { margin: 11, trackPointer: false, ease: 0.12, radius: 8, tail: 15 }
      };

      // Batch initialize elements for better performance
      const initQueue = [
        { selector: desktopNav, config: configs.nav },
        { selector: mobileBar, config: { margin: 11 } },
        { selector: mobilePanel, config: configs.mobile },
        { selector: '#logo.nav_button-left.siderun', config: configs.logo },
        { selector: '.centered-mobile-nav.siderun', config: configs.centered }
      ];

      initQueue.forEach(({ selector, config }) => {
        const element = typeof selector === 'string' ? document.querySelector(selector) : selector;
        if (element) {
          SideRun.init(element, config);
          perfLog('SideRun initialized:', element);
        }
      });

      perfTimeEnd('SideRun-Init');
      console.log('SideRun effects initialized successfully');
    } catch (error) {
      console.error('SideRun initialization failed:', error);
    }
  }

  // Initialize SideRun effects
  initializeAllSideRunEffects();
})();
