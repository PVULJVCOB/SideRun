# Dist files for SideRun

This folder contains distributable copies of the runtime and stylesheet for SideRun. These files are intended for direct download and drop-in use without build tooling.

Files
- `siderun.js` — runtime JavaScript (UMD/browser global)
- `siderun.css` — companion CSS with tokens and styles for the effect

Usage
- Copy `dist/siderun.js` and `dist/siderun.css` into your project and include them in your HTML:

```html
<link rel="stylesheet" href="/path/to/siderun.css">
<script src="/path/to/siderun.js"></script>
```

Notes
- These files are exact copies of `js/siderun.js` and `styles/siderun.css` at the moment they were added.
- For automatic publishing on GitHub Pages, make sure the repository Pages settings allow serving from the `main` branch (root) or from the `gh-pages` branch (if you create one).
