// Minimal accessible dropdown for the hero download CTA
(function () {
  const init = () => {
    const container = document.querySelector('[data-dropdown]');
    if (!container) return;
    const toggle = container.querySelector('.download-dropdown__toggle');
    const menu = container.querySelector('.download-dropdown__menu');

    const open = () => {
      menu.hidden = false;
      toggle.setAttribute('aria-expanded', 'true');
      document.addEventListener('click', onDocClick);
      document.addEventListener('keydown', onKeyDown);
    };
    const close = () => {
      menu.hidden = true;
      toggle.setAttribute('aria-expanded', 'false');
      document.removeEventListener('click', onDocClick);
      document.removeEventListener('keydown', onKeyDown);
    };

    const onDocClick = (e) => {
      if (!container.contains(e.target)) close();
    };

    const onKeyDown = (e) => {
      if (e.key === 'Escape') { close(); toggle.focus(); }
      // simple arrow navigation between menu items
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        const items = Array.from(menu.querySelectorAll('[role="menuitem"]'));
        if (!items.length) return;
        let idx = items.indexOf(document.activeElement);
        if (idx === -1) idx = 0;
        if (e.key === 'ArrowDown') idx = (idx + 1) % items.length; else idx = (idx - 1 + items.length) % items.length;
        items[idx].focus();
      }
    };

    toggle.addEventListener('click', (e) => {
      const expanded = toggle.getAttribute('aria-expanded') === 'true';
      if (expanded) close(); else open();
    });

    // Ensure menu items are focusable
    const items = menu.querySelectorAll('[role="menuitem"]');
    items.forEach(i => i.setAttribute('tabindex', '0'));
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
