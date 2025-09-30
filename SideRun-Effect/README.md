# SideRun (Drop-in Bundle)

This folder is the ready-to-use download for integrating SideRun without a build tool. It is kept in sync with the main runtime.

- `siderun.js` — runtime (JS)
- `siderun.css` — styles (CSS)
- `index.html` — tiny demo (open directly in your browser)

## Quickstart

1) Copy `siderun.js` and `siderun.css` into your project.
2) Add a host container to your HTML:

```html
<div class="sr-container">
  <div class="site-nav__stroke siderun"></div>
  <!-- your content -->
  ...
  </div>
```

3) Include the files and initialize SideRun:

```html
<link rel="stylesheet" href="./siderun.css">
<script src="./siderun.js"></script>
<script>
  window.SideRun.init(document.querySelector('.sr-container'), {
    radius: 12,
    tail: 14,
    margin: 11
  });
  </script>
```

Optional (ESM-like usage in your own bundler):

```js
import { init } from 'siderun';
import 'siderun/styles/siderun.css';

const cleanup = init(document.querySelector('.sr-container'), { radius: 12, tail: 14, margin: 11 });
```

## Theming

Use CSS variables to tune the visuals, for example:

```css
.sr-container {
  /* stroke setup */
  --sr-stroke-width-base: 3px;
  --sr-stroke-width-outer: var(--sr-stroke-width-base);
  --sr-stroke-width-inner: var(--sr-stroke-width-base);
  --sr-stroke-width-runner: var(--sr-stroke-width-base);
  --sr-stroke-width-ghost: var(--sr-stroke-width-base);
  --sr-color-outer: var(--color-accent, #df6502);
  --sr-color-runner: var(--color-accent, #df6502);
  /* blur layer */
  --sr-blur-amount: 10px;
  --sr-blur-radius: 6px;
}
```

See `siderun.css` for the full list of variables.

## Notes

- The injected blur/backdrop and border SVG live inside your `.site-nav__stroke.siderun` container.
- The runtime reads sensible defaults from CSS custom properties; override them per host as needed.
- For pointer-tracking behavior, pass `trackPointer: true` in `SideRun.init(...)`.
