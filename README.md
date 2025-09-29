# Siderun — flying-border runner (JS + CSS)

Siderun is a small front-end effect: an animated "running" border (stroke) with a blurred backdrop. It's implemented with a tiny JavaScript runtime (`js/siderun.js`) and companion CSS (`styles/siderun.css`). Drop it into your site to give navs, logos and content cards a smooth running highlight that follows hover or the pointer.

This repository contains the front-end effect (root) and an experimental CLI scaffold under `packages/siderun/` (separate project).

## Demo
Open `index.html` in a browser to see the demos. The page demonstrates hover-driven and pointer-tracking modes.

## Quickstart (frontend)
1. Copy `js/siderun.js` and `styles/siderun.css` into your project (or reference them directly from this repo).
2. Include the CSS and JS in your page:

```html
<link rel="stylesheet" href="/path/to/styles/siderun.css">
<script defer src="/path/to/js/siderun.js"></script>
```

3. Add a host container. The script injects the visuals into a child element with the class `.site-nav__stroke.siderun` (or legacy `.nav_stroke.siderun`):

```html
<div id="my-host" class="sr-container">
  <div class="site-nav__stroke siderun"></div>
  <!-- your content -->
</div>
```

4. Initialize the runtime after DOM load:

```html
<script>
  window.addEventListener('DOMContentLoaded', () => {
    const host = document.getElementById('my-host');
    if (host && window.SideRun) {
      SideRun.init(host, { radius: 12, tail: 14, margin: 11 });
    }
  });
</script>
```

## API (quick)
`SideRun.init(hostEl, options?) -> cleanup()`

Options (selected):
- `radius` (number) — corner radius for frame (default in code: 8)
- `tail` (number) — tail length for the visible runner segment
- `gap` (number) — spacing used for inner/ghost segments
- `ease` (number) — easing factor for animation interpolation
- `hoverAxis` (string) — `'x'` or `'y'` when mapping hover into offsets
- `trackPointer` (boolean) — if `true`, pointermove drives the runner (direct pointer tracking)
- `margin` (number) — how much the wrapper offsets outside the host

The call returns a `cleanup()` function you can use to remove listeners and injected DOM.

See `docs/SIDERUN_EFFECT.md` for more implementation details.

## CSS variables (theming)
`styles/siderun.css` exposes a few variables you can override on the host to scale or theme the effect:
- `--sr-scale` — global scale factor (affects stroke width and blur)
- `--sr-stroke-width` — stroke thickness
- `--sr-blur` — blur radius for the backdrop
- `--sr-saturation` — backdrop saturation
- `--sr-tint` — backdrop tint color
- `--sr-inset` — inset of the blur layer (px)
- `--sr-radius` — corner radius used by backdrop

Override on your host (example):

```css
#my-host {
  --sr-scale: 0.9;
  --sr-tint: rgba(0,0,0,0.12);
}
```

## Accessibility & Performance
- The effect is purely decorative. Preserve keyboard focus outlines and do not rely on the effect for conveying essential state.
- The runtime respects `prefers-reduced-motion` and will snap to targets when motion should be reduced.
- For mobile and small viewports, reduce stroke width and blur using media queries to avoid heavy GPU cost.

## Contributing
- Issues and PRs are welcome. Small PRs that improve docs, accessibility or minor performance are easiest to review.
- There's an experimental CLI scaffold in `packages/siderun/` which is a separate project; see that directory's README for details.

## License
MIT — see `LICENSE` file.

## Publishing to npm (quick guide)
If you want others to be able to `npm install` the effect, publish it as a package. Minimal steps:

1. Choose package location and name
  - You can publish from the repo root or a subfolder (e.g. `packages/siderun/`).
  - Pick a package name: scoped (`@yourorg/siderun`) or unscoped (`siderun`). Scoped packages need `--access public` on first publish.

2. Add a `package.json` (example):

```json
{
  "name": "@yourorg/siderun",
  "version": "1.0.0",
  "description": "Lightweight flying-border runner (JS + CSS)",
  "main": "dist/siderun.cjs.js",
  "module": "dist/siderun.esm.js",
  "files": ["dist/","styles/siderun.css","README.md","LICENSE"],
  "scripts": {
   "build": "esbuild js/siderun.js --bundle --minify --format=esm --outdir=dist && esbuild js/siderun.js --bundle --minify --format=cjs --outfile=dist/siderun.cjs.js",
   "prepublishOnly": "npm run build"
  }
}
```

3. Add a small build step (recommended)
  - Install esbuild: `npm i -D esbuild`
  - Use the `build` script above to create `dist/` files.

4. Test locally
  - `npm pack` creates a .tgz you can `npm install` into another project to verify package contents.

5. Publish
  - Login: `npm login`
  - Scoped public: `npm publish --access public`
  - Unscoped: `npm publish`

6. After publish
  - Users can `npm install @yourorg/siderun` and import the ESM/CJS entry or include the UMD/IIFE script directly.

Notes:
 - Use `files` in package.json (or `.npmignore`) to control published contents.
 - Provide type definitions or JSDoc for better DX.
 - Automate build and publish on CI (GitHub Actions) for releases.

If you prefer a ready scaffold for publishing the front-end package, see `packages/siderun-ui/` — it contains a `package.json` and build script that bundles `js/siderun.js` into `dist/` using esbuild.
