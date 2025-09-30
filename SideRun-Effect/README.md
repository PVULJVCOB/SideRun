# SideRun (Drop-in Bundle)

This folder is the ready-to-use download for integrating SideRun without a build tool. It is kept in sync with the main runtime.

- `siderun.js` — runtime (JS)
- `siderun.css` — styles (CSS)
- `siderun.min.js` / `siderun.min.css` — optional minified variants
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

3) Include die Dateien und initialisiere SideRun (alternativ die .min-Dateien verwenden):

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

## API Options

Initialize with `SideRun.init(host, options)`.

| Option         | Type    | Default | Description |
|----------------|---------|---------|-------------|
| radius         | number  | 8       | Corner radius of the animated rounded rect. |
| tail           | number  | 10      | Length of the runner’s trailing/leading segment used to compute dash lengths. |
| gap            | number  | 10      | Gap between runner and inner/ghost segments. |
| ease           | number  | 0.1     | Easing factor per frame (0..1) for smooth motion. Lower = smoother. |
| hoverAxis      | 'x'|'y' | 'x'     | Axis used to map hover progress (x = horizontal, y = vertical). |
| isBottom       | boolean | false   | Positions default runner towards the bottom side (visual variant). |
| isTop          | boolean | false   | Positions default runner towards the top side (visual variant). |
| trackPointer   | boolean | false   | Enable direct pointer tracking instead of link/host hover. |
| margin         | number  | 11      | Extra space around the host (wrapper inset) for the effect. |
| scale          | number  | 1       | Read from CSS `--sr-scale`; used for responsive token scaling. |

In addition, the runtime reads CSS tokens from computed styles (see `siderun.css`) to set sensible defaults without code.

## Notes

- The injected blur/backdrop and border SVG live inside your `.site-nav__stroke.siderun` container.
- The runtime reads sensible defaults from CSS custom properties; override them per host as needed.
- For pointer-tracking behavior, pass `trackPointer: true` in `SideRun.init(...)`.

## Changelog

Siehe die Datei `../CHANGELOG.md` im Repository.
