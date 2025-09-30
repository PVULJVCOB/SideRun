// Mobile nav modal: clones nav links into a modal panel for touch devices
(function(){
  'use strict';
  function createModal(){
    const modal = document.createElement('div');
    modal.className = 'mobile-nav-modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-hidden', 'true');
    modal.setAttribute('aria-label', 'Mobile navigation');

    const panel = document.createElement('div');
    panel.className = 'mobile-nav-modal__panel';
    panel.tabIndex = -1;

    const list = document.createElement('nav');
    list.className = 'mobile-nav-modal__list';

    panel.appendChild(list);
    modal.appendChild(panel);
    document.body.appendChild(modal);
    return { modal, panel, list };
  }

  function openModal(modal){
    modal.setAttribute('aria-hidden', 'false');
    const panel = modal.querySelector('.mobile-nav-modal__panel');
    panel.focus();
    document.documentElement.style.overflow = 'hidden';
  }
  function closeModal(modal){
    modal.setAttribute('aria-hidden', 'true');
    document.documentElement.style.overflow = '';
  }

  function buildMobileNav(){
    const toggle = document.querySelector('.site-nav-toggle');
    const desktopNav = document.querySelector('.site-nav.siderun');
    if (!toggle || !desktopNav) return;

    const links = Array.from(desktopNav.querySelectorAll('.site-nav__links.siderun .site-nav__link.siderun'));
    const { modal, list } = createModal();

    // Populate modal list with clones of links
    links.forEach((lnk) => {
      const a = lnk.cloneNode(true);
      a.className = 'mobile-nav-modal__link';
      a.removeAttribute('data-siderun');
      list.appendChild(a);
    });

    // Close modal when clicking outside panel
    modal.addEventListener('pointerdown', (e) => {
      if (e.target === modal) closeModal(modal);
    });

    // Close on Escape
    modal.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeModal(modal);
    });

    // Open on toggle click for touch devices
    toggle.addEventListener('click', (e) => {
      const visible = modal.getAttribute('aria-hidden') === 'false';
      if (visible) closeModal(modal); else openModal(modal);
    });

    // When a link is clicked inside modal, close modal
    list.addEventListener('click', (e) => {
      const t = e.target.closest('a');
      if (t) {
        closeModal(modal);
      }
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', buildMobileNav, { once:true }); else buildMobileNav();
})();
