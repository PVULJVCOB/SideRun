# SideRun Starter

This folder contains everything you need without a build tool:

- `siderun.js` — the runtime (JS)
- `siderun.css` — the styles (CSS)
- `index.html` — a tiny demo (open this file directly in your browser)

## Quickstart

1) Copy `SideRun/siderun.js` and `SideRun/siderun.css` into your project.
2) Add the host container to your HTML:

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

## Optional: npm

If you prefer a package manager:

```bash
npm install siderun
```

Example (ESM):

```js
import { init } from 'siderun';
import 'siderun/styles/siderun.css';

const cleanup = init(document.querySelector('.sr-container'), { radius: 12, tail: 14, margin: 11 });
```

## Theming

Use CSS variables to tune the visuals, for example:

```css
.sr-container {
  --sr-stroke-width: 3px;
  --sr-color-outer: var(--color-accent, #df6502);
  --sr-color-runner: var(--color-accent, #df6502);
  --sr-blur: 10px;
  --sr-radius: 6px;
}
```

See `siderun.css` for the full list of variables.
