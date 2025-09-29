# SideRun — flying-border runner (JS + CSS)

SideRun is a tiny front‑end effect: an animated “running” frame with a soft blurred backdrop. Ideal for navbars, logos, and cards. It’s just a small JS runtime plus a CSS file.

Live demo: open `index.html` locally or visit the hosted demo: https://pvuljvcob.github.io/SideRun/

Note: GitHub Pages hosts the main site and the starter folder at `/SideRun/` (no ZIP archive). Download by browsing the folder and saving `siderun.js` and `siderun.css`.

## Installation

Option A — Starter (recommended, no build):

1) Browse the starter folder on GitHub Pages: `https://pvuljvcob.github.io/SideRun/SideRun/`
2) Copy `siderun.js` and `siderun.css` into your project
3) Add the host markup and initialize (see below)

Option B — direct files (no npm): copy `siderun.js` and `siderun.css` from the `SideRun/` folder (or the ZIP) into your project and initialize.

```html
<!-- CSS -->
<link rel="stylesheet" href="./siderun.css">
<!-- Script (CJS-style global) -->
<script src="./siderun.js"></script>
<script>
  // optional: per-host tuning via CSS variables
  const host = document.querySelector('.sr-container');
  if (window.SideRun && host) {
    SideRun.init(host, { radius: 12, tail: 14, margin: 11 });
  }
</script>
```

## Usage (ESM)

```js
import { init } from 'siderun';
import 'siderun/styles/siderun.css';

const host = document.querySelector('.sr-container');
const cleanup = init(host, { radius: 12, tail: 14, margin: 11 });
```

## Script tag (no build)

```html
<link rel="stylesheet" href="./siderun.css">
<script src="./siderun.js"></script>
<script>
	if (window.SideRun) {
		const { init } = window.SideRun;
		init(document.querySelector('.sr-container'), { radius: 12 });
	}
</script>
```

## Host-Markup

```html
<div class="sr-container">
	<div class="site-nav__stroke siderun"></div>
	<!-- content -->
	...
</div>
```

The effect injects its SVG/backdrop layers into the child `.site-nav__stroke.siderun` (legacy: `.nav_stroke.siderun`).

## API

`init(hostEl, options?) -> cleanup()`

Important options:
- `radius` (px), `tail`, `gap`, `ease`
- `hoverAxis`: `'x' | 'y'`
- `trackPointer`: enable direct pointer tracking
- `margin`: outer padding around the effect wrapper

Returns a `cleanup()` function that removes listeners and DOM.

## Theming (CSS variables)
Important variables from `styles/siderun.css`:
- `--sr-scale`, `--sr-stroke-width`, `--sr-blur`, `--sr-saturation`, `--sr-tint`, `--sr-inset`, `--sr-radius`

Example:

```css
.sr-container {
	--sr-scale: 0.9;
	--sr-tint: rgba(0,0,0,0.12);
}
```

## License
MIT — Copyright (c) 2025 Cedric Seidel (SideRun).
See `LICENSE` for the full text.
