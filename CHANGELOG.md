# Changelog

All notable changes to this project will be documented in this file.

## [1.3.0] - 2025-09-30

### Added
- SideRun-Effect download bundle synced with core runtime and styles
  - Added minified artifacts: `siderun.min.js`, `siderun.min.css`
  - Added API options table to bundle README
  - Added version/license banners to `siderun.js` and `siderun.css`

### Changed
- Unify CSS tokens (`--sr-blur-*`, `--sr-animation-*`) across JS and CSS
- Simplify `js/navbar.js` to avoid duplicate mobile nav and prevent double init
- Minor markup fix in `index.html`

### Fixed
- Blur/backdrop CSS variable mismatch between JS and CSS

