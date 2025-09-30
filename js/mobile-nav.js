/**
 * Mobile Navigation (React + Tailwind)
 * - Visible only on small screens (root is hidden via CSS at md+)
 * - FAB with blurred circular backdrop containing a burger icon
 * - Smooth slide-in drawer with high-performance transforms
 * - Minimal state, no re-renders during scroll
 */
(function () {
  const prefersReducedMotion =
    window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const e = React.createElement;

  function classNames(...args) {
    return args.filter(Boolean).join(' ');
  }

  function useLockBodyScroll(locked) {
    React.useEffect(() => {
      if (!locked) return;
      const original = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = original;
      };
    }, [locked]);
  }

  function BurgerIcon({ open }) {
    const base = 'block h-0.5 w-6 bg-black rounded-full transition-transform duration-200';
    return e('div', { className: 'flex flex-col justify-center items-center gap-1.5' },
      e('span', { className: classNames(base, open && 'translate-y-2 rotate-45') }),
      e('span', { className: classNames(base, open && 'opacity-0') }),
      e('span', { className: classNames(base, open && '-translate-y-2 -rotate-45') })
    );
  }

  function DrawerLink({ href, children, onClick }) {
    return e('a', {
      href,
      onClick,
      className: 'block px-5 py-4 text-lg font-semibold text-gray-900 hover:text-black focus:outline-none focus-visible:ring-2 focus-visible:ring-black/30 rounded-md'
    }, children);
  }

  function MobileNav() {
    const [open, setOpen] = React.useState(false);
    const toggle = () => setOpen((v) => !v);
    const close = () => setOpen(false);

    useLockBodyScroll(open);

    // Avoid transition flicker on first paint
    const [hydrated, setHydrated] = React.useState(false);
    React.useEffect(() => setHydrated(true), []);

    return e(React.Fragment, null,
      // Backdrop overlay
      e('div', {
        'aria-hidden': !open,
        className: classNames(
          'fixed inset-0 z-[999] md:hidden',
          hydrated && !prefersReducedMotion ? 'transition-opacity duration-300' : '',
          open ? 'opacity-100' : 'opacity-0 pointer-events-none'
        ),
        style: { background: 'rgba(0,0,0,0.15)', backdropFilter: 'blur(2px)' },
        onClick: close
      }),

      // Drawer panel
      e('nav', {
        'aria-label': 'Mobile navigation',
        className: classNames(
          'fixed bottom-0 right-0 z-[1000] h-[72%] w-[82%] max-w-sm md:hidden',
          'bg-white/85 backdrop-blur-xl border border-black/10 rounded-tl-2xl shadow-2xl',
          'flex flex-col',
          hydrated && !prefersReducedMotion ? 'transition-transform duration-300 ease-out' : '',
          open ? 'translate-x-0' : 'translate-x-full'
        ),
        style: { paddingBottom: 'max(16px, env(safe-area-inset-bottom))', paddingRight: 'env(safe-area-inset-right)' }
      },
        e('div', { className: 'px-5 pt-5 pb-3 flex items-center justify-between' },
          e('span', { className: 'text-base font-semibold tracking-wide text-gray-800' }, 'Menu'),
          e('button', {
            className: 'p-2 rounded-full hover:bg-black/5 active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-black/30',
            onClick: close,
            'aria-label': 'Close menu'
          }, '✕')
        ),
        e('div', { className: 'mt-1 grow overflow-y-auto py-2' },
          e(DrawerLink, { href: '#hero', onClick: close }, 'Home'),
          e(DrawerLink, { href: '#siderun-demos', onClick: close }, 'Demos'),
          e(DrawerLink, { href: '#overview', onClick: close }, 'Overview'),
          e(DrawerLink, { href: 'https://github.com/PVULJVCOB/SideRun', onClick: close }, 'GitHub')
        )
      ),

      // Floating Action Button with blurred circle and burger icon
      e('button', {
        className: classNames(
          'fixed md:hidden z-[1001]',
          'h-16 w-16 rounded-full shadow-xl border border-black/10',
          'bg-white/70 backdrop-blur-2xl flex items-center justify-center',
          'active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-black/30'
        ),
        style: { bottom: 'calc(20px + env(safe-area-inset-bottom))', right: 'calc(20px + env(safe-area-inset-right))' },
        onClick: toggle,
        'aria-expanded': open,
        'aria-label': open ? 'Close navigation' : 'Open navigation'
      }, e(BurgerIcon, { open }))
    );
  }

  function mount() {
    const root = document.getElementById('mobile-nav-root');
    if (!root || window.innerWidth >= 768) return; // Respect desktop where default nav remains
    const r = ReactDOM.createRoot(root);
    r.render(React.createElement(MobileNav));
  }

  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    mount();
  } else {
    document.addEventListener('DOMContentLoaded', mount, { once: true });
  }
})();
