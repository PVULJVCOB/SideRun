# SideRun Effect — Integration Guide

This document gathers everything in the repository about the SideRun decorative border/runner effect: implementation details, usage, CSS tokens, HTML snippets, JS API, responsive handling, accessibility recommendations, and debugging tips.

## Summary
SideRun is a purely front-end decorative effect implemented in `js/siderun.js` plus companion styles in `styles/siderun.css`. It provides an animated border stroke and an inner blurred backdrop that reacts to hover or pointer position.

Primary files
- `js/siderun.js` — core runtime that injects an SVG and blur layer into a host element's `.site-nav__stroke.siderun` element. Exposes `SideRun.init(hostEl, options)`.
- `styles/siderun.css` — strokes, blur layer, and tokens used by the runtime.
- `index.html` — usage examples and initialization calls for navbar, logo, and demo boxes.
- `styles/main.css` and `styles/navbar.css` — site-specific rules and responsive tweaks for SideRun host containers.
- `packages/siderun/` — an experimental TypeScript CLI scaffold included in the repo for product context. This package is separate from the front-end SideRun effect described here.
- `docs/siderun/sources.md`, `docs/siderun/mvp.md` — research notes and MVP scope for the CLI.

## JS API
Signature
- `const cleanup = SideRun.init(hostEl, options?)`
  - `hostEl`: DOM element that contains a child `.site-nav__stroke.siderun` (or legacy `.nav_stroke.siderun`). The script injects an absolute-positioned wrapper containing a blur layer and SVG into that stroke host.
  - `options` (all optional):
    - `radius` (number): corner radius used for stroke/rect rounding (default: 8)
    - `tail` (number): tail length used to size the visible runner segment (default: 10)
    - `gap` (number): gap spacing used for inner/ghost segments (default: 10)
    - `ease` (number): easing factor for animation interpolation (default: 0.1)
    - `hoverAxis` (string): `'x'` or `'y'` — axis used when mapping hover positions into stroke offsets (default: `'x'`)
    - `isBottom` (boolean): invert base offsets for bottom-aligned runners (default: false)
    - `isTop` (boolean): invert base offsets for top-aligned runners (default: false)
    - `trackPointer` (boolean): if true, attaches pointerenter/pointermove/pointerleave on the host for direct pointer tracking (default: false)
    - `margin` (number): how much the wrapper should offset outside the host (default: 11)
  - Returns a `cleanup` function that removes event listeners, observers and cancels animation frames.

Behavior
- The runtime injects an SVG with 4 rects:
  - `.sr-runner` — the animated runner stroke (primary color)
  - `.sr-static-outer` — static outer stroke (accent)
  - `.sr-static-inner` — inner fill stroke (used for tail/ghost effects)
  - `.sr-runner-ghost` — ghost trailing stroke
- An inner `.sr-backdrop` div is injected and sized to the inner rect; CSS variables `--sr-inset` and `--sr-radius` are set to sync the blur layer.
- The script calculates perimeter metrics and updates `stroke-dasharray` / `stroke-dashoffset` values per-frame to animate the runner and trailing segments.
- Input for runner positioning can come from three sources (fallback order):
  1. `trackPointer === true`: pointer events on host (pointermove) drive `state.hoverX/Y`.
  2. If host contains anchor links, `mouseenter`/`mouseleave` on anchors set hover center from the link rect.
  3. Fallback host hover: the host center is used when entering the host element.
- The script honors `prefers-reduced-motion` and snaps to targets (no animation) when set.

## CSS tokens and selectors
From `styles/siderun.css` and related site styles:
- Selectors
  - `.siderun-border` — the injected SVG container class
  - `.sr-backdrop` — inner blur/tint div
  - `.sr-runner`, `.sr-static-outer`, `.sr-static-inner`, `.sr-runner-ghost` — SVG rect classes used by the script
- Tokens (CSS vars used across files)
  - `--sr-inset` — inset of the blur layer from the outer stroke (in px)
  - `--sr-radius` — corner radius applied to the blur layer
  - `--sr-blur` — blur amount (defaults set in `styles/siderun.css` via `var(--sr-blur, 10px)`)
  - `--sr-saturation` — saturation for the blur backdrop
  - `--sr-tint` — background tint used under the blur layer

Default visuals (from `styles/siderun.css`)
- `.sr-static-outer` stroke color: `#df6502` (accent)
- `.sr-static-inner` stroke color: `#ffffff`
- `.sr-runner` stroke color: `#df6502`
- `.sr-runner-ghost` stroke color: `#ffffff`
- `stroke-width` for rects: 3 (desktop-focused)
- `.sr-backdrop` uses `backdrop-filter: blur(var(--sr-blur, 10px)) saturate(var(--sr-saturation, 140%));`

Integration notes
- Host elements must include a child with class `.site-nav__stroke.siderun` (or legacy `.nav_stroke.siderun`) — this is where the script injects markup. Example:

```html
<div id="sr-demo-1" class="sr-container glass-bg">
  <div class="site-nav__stroke siderun"></div>
  <!-- content -->
</div>
```

- Initialize in JS after DOM is ready:

```js
const demo1 = document.getElementById('sr-demo-1');
if (demo1) SideRun.init(demo1, { radius: 12, tail: 14, margin: 11 });
```

- For cursor-follow behavior, set `trackPointer: true` and tune `ease` for responsiveness:

```js
SideRun.init(demo2, { trackPointer: true, ease: 0.08, tail: 18 });
```

Responsive & accessibility recommendations
- The effect is desktop-focused by default (3px strokes, 10px blur). For smaller viewports, reduce stroke widths, blur radius, and wrapper margins to avoid overflow and heavy GPU cost.
- Use media queries to scale tokens (recommended breakpoints: <=880px, <=600px, <=420px). Example:

```css
@media (max-width: 880px) {
  .siderun-border rect { stroke-width: 2; }
  .sr-backdrop { --sr-blur: 8px; }
}
@media (max-width: 420px) {
  .siderun-border rect { stroke-width: 1.5; }
  .sr-backdrop { --sr-blur: 4px; }
}
```

- Respect `prefers-reduced-motion`: `js/siderun.js` checks and snaps to targets; keep that behavior.

Troubleshooting
- If the injected SVG overflows its host, verify `wrapper.style.inset` (derived from `margin` option) and ensure host has `position: relative` or similar so absolute positioning calculates correctly.
- If strokes appear clipped, check that the wrapper width/height are being set (the script sets them during `recalc()` using hostRect + margin).
- If the runner doesn't move on hover, ensure your host is initialized (DOM loaded) and either contains links (for anchor hover behavior) or `trackPointer` is enabled.

Examples from this repo
- `index.html` initializes SideRun on multiple elements: the main `#logo` badge, the desktop nav `.site-nav`, and demo elements `#sr-demo-1/2`.
- `styles/main.css` contains `.sr-container .site-nav__stroke.siderun { ... }` rules to make the host scale responsively.

Related artifacts
- `docs/siderun/sources.md` — research showing there is no single authoritative upstream "siderun" package.
- `packages/siderun/` — an experimental CLI scaffold; see that package's README for details. The front-end effect is independent.

License & attribution
- SideRun front-end effect in this repo is MIT (see repository `LICENSE`).

Contact & next steps
- If you'd like, I can:
  - generate a dedicated `styles/siderun.responsive.css` with tuned tokens for the breakpoints described above,
  - add a `styles/siderun-vars.css` file that centralizes CSS variables (stroke colors, blur radius, inset, tint) for easy theming,
  - add a small interactive playground page under `docs/` to visualize options (radius/tail/ease/trackPointer) in real time.

---
Generated: 29.09.2025
