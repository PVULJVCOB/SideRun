# SideRun — Flying Border Effect

SideRun is a lightweight JS + CSS effect that draws a “flying” animated border around any host element and adds a soft blurred backdrop behind it. It’s perfect for navbars, logos, buttons, and cards. The new variant uses a robust 3-layer system, CSS tokens, and a single runtime with pointer-aware interactions.

• Live demo: open `index.html` locally or visit https://pvuljvcob.github.io/SideRun/

## Features

- Flying border animation that follows hover or pointer movement
- Touch-optimized interactions and hover cleanup on mobile
- CSS token system with responsive scaling and theming
- Respects prefers-reduced-motion and maintains focus indicators
- GPU-friendly rendering and a shared RAF for many instances

## Quick Start

### 1) Get the files

```bash
# Copy the core files to your project (no build tools needed)
curl -O https://pvuljvcob.github.io/SideRun/js/siderun.js
curl -O https://pvuljvcob.github.io/SideRun/styles/siderun.css
```

### 2) Add the host markup

The host element needs a child stroke container where the effect injects its UI:

```html
<div class="sr-container">
  <div class="site-nav__stroke siderun"></div>
  <!-- your content -->
  ...
</div>
```

Tip: Use `.sr-container` (or your own host class) for the host. Do not initialize the inner `.site-nav__stroke` itself.

### 3) Include and initialize

```html
<link rel="stylesheet" href="./siderun.css" />
<script src="./siderun.js"></script>
<script>
  window.addEventListener('DOMContentLoaded', () => {
    if (!window.SideRun) return;
    document.querySelectorAll('.sr-container').forEach((host) => {
      SideRun.init(host, {
        radius: 12,
        tail: 14,
        margin: 11
      });
    });
  });
  </script>
```

Pointer-follow variant:

```js
SideRun.init(document.getElementById('siderun-follow'), {
  radius: 12,
  tail: 18,
  margin: 11,
  trackPointer: true,
  ease: 0.08
});
```

## Configuration (JS)

```js
SideRun.init(hostElement, {
  radius: 8,          // corner radius of the rounded rect
  tail: 15,           // runner tail length
  gap: 10,            // spacing between runner and inner/ghost strokes
  ease: 0.1,          // easing factor (0.01–0.3)
  hoverAxis: 'x',     // 'x' -> react across width, 'y' -> react across height
  isBottom: false,    // bias the default resting position to bottom side
  isTop: false,       // bias the default resting position to top side
  trackPointer: false,// direct pointer tracking (great for demos and cards)
  margin: 11          // extra space around the host for the effect
});
```

## Theming (CSS tokens)

All visual aspects can be tuned via CSS custom properties on the host (or globally):

```css
.sr-container {
  /* scale */
  --sr-scale: 1; /* 0.8 mobile, 0.9 tablet, 1 desktop recommended */

  /* stroke widths & style */
  --sr-stroke-width-base: calc(var(--sr-scale) * 3px);
  --sr-stroke-width-outer: var(--sr-stroke-width-base);
  --sr-stroke-width-inner: var(--sr-stroke-width-base);
  --sr-stroke-width-runner: var(--sr-stroke-width-base);
  --sr-stroke-width-ghost: var(--sr-stroke-width-base);
  --sr-stroke-linecap: round;

  /* colors */
  --sr-color-outer: var(--color-accent);
  --sr-color-inner: #fff;
  --sr-color-runner: var(--color-accent);
  --sr-color-ghost: #fff;

  /* opacities */
  --sr-opacity-outer: 1;
  --sr-opacity-inner: 1;
  --sr-opacity-runner: 1;
  --sr-opacity-ghost: 1;

  /* backdrop layer */
  --sr-blur-amount: calc(var(--sr-scale) * 10px);
  --sr-blur-saturation: 140%;
  --sr-blur-tint: rgba(255, 255, 255, 0.12);
  --sr-blur-inset: calc(var(--sr-scale) * 1px);
  --sr-blur-radius: calc(var(--sr-scale) * 6px);

  /* animation defaults */
  --sr-animation-radius: calc(var(--sr-scale) * 8px);
  --sr-animation-tail: calc(var(--sr-scale) * 10px);
  --sr-animation-gap: calc(var(--sr-scale) * 10px);
  --sr-animation-ease: 0.1;
  --sr-animation-margin: calc(var(--sr-scale) * 11px);
}
```

Responsive scaling (optional):

```css
@media (max-width: 1024px) and (min-width: 769px) {
  .sr-container { --sr-scale: 0.9; }
}
@media (max-width: 768px) {
  .sr-container { --sr-scale: 0.8; }
}
```

## Host markup (required)

```html
<div class="sr-container">
  <div class="site-nav__stroke siderun"></div>
  <!-- content -->
  ...
</div>
```

The effect injects its DOM (blur layer + SVG) into the child `.site-nav__stroke.siderun` (legacy: `.nav_stroke.siderun`).

## API

`init(hostEl, options?) -> cleanup()` — initializes the effect on a host element and returns a cleanup function. A companion `SideRun.update(host)` is available to force a geometry recalculation.

## Performance & Accessibility

- Uses transform-friendly properties and a shared RAF loop
- Honors `prefers-reduced-motion` and keeps content accessible (`aria-hidden` for injected UI)
- Works well across modern browsers with CSS custom properties and backdrop-filter support

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/improvement`
3. Follow the 3-layer architecture patterns
4. Test across desktop and mobile devices
5. Submit a pull request

## License
MIT — see `LICENSE` for details. © 2025 Cedric Seidel.
