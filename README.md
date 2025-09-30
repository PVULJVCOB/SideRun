# SideRun — Flying Border Effect

SideRun is a lightweight JavaScript + CSS effect that draws a "flying" animated border around a host element and adds a soft blurred backdrop behind it. It works great for navbars, logos, buttons, and cards. This repository contains the runtime and companion styles using a 3-layer approach and CSS custom properties.

Live demo: open `index.html` locally or view the demo pages in this repo.

Download / dist

Pre-built distributable files are available in the `dist/` folder and can be downloaded directly from the repository or the live site (when published).

- `dist/siderun.js` — runtime JavaScript (drop-in)
- `dist/siderun.css` — companion stylesheet (drop-in)

You can copy those files into your project or use the download links on the homepage.

Current runtime/style version: 1.3.0

## Features

- Animated flying border that follows hover or pointer input
- Touch-optimized interactions and mobile-friendly hover cleanup
- CSS token system (custom properties) for responsive scaling and theming
- Respects `prefers-reduced-motion` and preserves keyboard focus indicators
- GPU-friendly rendering with a shared RAF loop for multiple instances

## Quick Start

### 1) Copy the files

Copy the core files into your project (no build tools needed):

```bash
# from the repo root (example)
cp js/siderun.js path/to/your/project/
cp styles/siderun.css path/to/your/project/
```

### 2) Host markup

Provide a host element with a child stroke container where SideRun injects its DOM:

```html
<div class="sr-container">
  <div class="site-nav__stroke siderun"></div>
  <!-- your content -->
</div>
```

Do not initialize the inner stroke container directly — call SideRun on the host element.

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

Pointer-follow example:

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

Call `SideRun.init(hostEl, options?)` with the following options:

```js
SideRun.init(hostElement, {
  radius: 8,          // corner radius in px
  tail: 15,           // runner tail length in px
  gap: 10,            // spacing between runner and inner/ghost strokes in px
  ease: 0.1,          // easing factor (0.01–0.3)
  hoverAxis: 'x',     // 'x' (react across width) or 'y' (react across height)
  isBottom: false,    // true to bias resting position to bottom
  isTop: false,       // true to bias resting position to top
  trackPointer: false,// true to enable direct pointer tracking
  margin: 11          // extra space around the host for the effect
});
```

## Theming (CSS tokens)

Tune visual aspects via CSS custom properties on the host (or globally). Example tokens used by SideRun are documented in `styles/siderun.css` and include `--sr-scale`, `--sr-color-*`, `--sr-stroke-width-*`, and blur-related tokens.

Responsive scaling example:

```css
@media (max-width: 1024px) and (min-width: 769px) {
  .sr-container { --sr-scale: 0.9; }
}
@media (max-width: 768px) {
  .sr-container { --sr-scale: 0.8; }
}
```

## Host markup (required)

The effect injects a blur layer and an SVG-based border into the child `.site-nav__stroke.siderun` (legacy selector: `.nav_stroke.siderun`). Keep your interactive content as children of the host element.

## API

init(hostEl, options?) -> cleanup()

Initializes the effect on `hostEl` and returns a cleanup function. Use `SideRun.update(hostEl)` to force a geometry recalculation if the host changes size.

## Performance & Accessibility

- Uses transform-friendly properties and a shared RAF loop to minimize redraws
- Honors `prefers-reduced-motion` and keeps injected UI `aria-hidden` when appropriate
- Works in modern browsers that support CSS custom properties and backdrop filters

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-change`
3. Run and test changes across desktop and mobile
4. Submit a pull request with a clear description

## License
MIT — see `LICENSE` for details. © 2025 Cedric Seidel.
