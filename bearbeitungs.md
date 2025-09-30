# Bearbeitungs-Plan und Code-Inventory

Zweck: Dieses Dokument ist ein vollständiger Audit-Bericht und Refactor-Plan für das SideRun-Projekt. Ziel ist ein sauberes, wartbares Frontend, bei dem das Logo stets dieselbe Breite/Größe hat wie die geschlossene Navbar (collapsed). Alle Duplikate, Overwrites und unbenutzten Teile werden identifiziert, dokumentiert und sicher entfernt.

---

## 1) Scan - verifizierte Hauptdateien (Lesedatum: 30. Sep 2025)
- `index.html` — Demo / Seite
- `js/siderun.js` — Core runtime (SideRun.init, SideRun.update)
- `js/navbar.js` — Desktop nav logic
- `js/hero-parallax.js` — Parallax layers for hero
- `js/scroll-effects.js` — IntersectionObserver / scroll animations
- `js/mobile-nav.js` — React UMD mobile nav
- `styles/navbar.css` — Navbar + logo tokens and layout
- `styles/siderun.css` — Siderun tokens and visuals
- `styles/main.css` — Page layout and demo styles

## 2) High-level findings
- Single authoritative runtime exists: `js/siderun.js` (exposed as `window.SideRun`). It is well-encapsulated and uses WeakMaps + a RafPool. Good.
- Navbar positioning was historically compensated for scrollbar width in JS; later CSS changes hid the scrollbar but JS compensation remained in some copies. We must remove that to avoid conflicting transforms.
- CSS tokens are defined in `styles/navbar.css` and `styles/siderun.css`. There is some duplication and scattered media-query overrides; unify them.
- Duplicated files exist in `docs/` — these are mirrors for Pages. Ensure sync strategy (docs should be generated/copied from root). Keep runtime only under `js/` and mirrored to `docs/` as artifacts.
- The collapsed navbar width is controlled by `--sr-navbar-min-width` (default: 200px). The logo width is `--sr-logo-min-width` (default: 120px). They must be unified.

## 3) Duplicate/unused code (initial pass)
- `js/navbar.js` (older versions) contained scrollbar calculation utilities — remove them if scrollbars are hidden.
- `styles/navbar.css` previously had `right: 0` edits but later reset — ensure consistent final value.
- `js/hero-extend.js` absent in the workspace read attempt (path missing). Verify presence or remove references.

## 4) Primary remediation plan (step-by-step)
1. Lock: create branch `refactor/navbar-logo-unify`.
2. Audit & tests: run local server and capture baseline screenshots (done manually).
3. Unify tokens:
   - Introduce single source tokens in `styles/navbar.css` root:
     - `--sr-xx-edge-gap`: real page inset (not including scrollbars)
     - `--sr-edge-gap-left` and `--sr-edge-gap-right` (derived)
     - set `--sr-logo-min-width`, `--sr-navbar-min-width` once and derive others from them.
4. CSS changes:
   - Set `.site-nav.siderun` and `.sr-navbar` to `right: var(--sr-edge-gap-right)`.
   - Ensure `.sr-logo` uses `left: var(--sr-edge-gap-left)`.
   - Ensure both components use same `min-width` & `height` tokens.
5. JS cleanup:
   - Remove scrollbar compensation logic from `js/navbar.js` (if present).
   - Ensure navbar measure logic uses `offsetWidth` and `getBoundingClientRect` only.
6. Verification harness:
   - Add a simple test in `tests/visual.md` describing how to measure elements in the browser console (getBoundingClientRect).
7. Commit, mirror to `docs/`, push, and open PR.

## 5) Detailed TODO (actionable)
- [ ] Branch `refactor/navbar-logo-unify`
- [ ] Update CSS tokens and variables
- [ ] Update `styles/navbar.css` + `styles/siderun.css` to derive sizes
- [ ] Update `js/navbar.js` to remove transforms and use CSS tokens
- [ ] Add `tests/verify-navbar-logo.md` with test steps and helper snippet
- [ ] Run local checks and tweak breakpoints
- [ ] Commit & push

## 6) Snippets for verification (console)
- check collapsed widths:
  ```js
  const logo = document.getElementById('logo');
  const nav = document.querySelector('.site-nav.siderun');
  console.log('logo w,h', logo.getBoundingClientRect());
  console.log('nav w,h', nav.getBoundingClientRect());
  ```

## 7) Acceptance Criteria
- Logo bounding width equals navbar collapsed bounding width on desktop (±1px acceptable).
- No JS transform moves the elements to compensate for scrollbars.
- Tokens clearly documented and only defined in one place.
- `docs/` is a faithful mirror of the built site.

---

Ende initialer Audit. Nächster Schritt: ich implementiere die Token-Unifizierung (ein Branch-Commit). Soll ich direkt die Änderungen in `styles/navbar.css` vornehmen (Token ableiten: `--sr-navbar-min-width: var(--sr-logo-min-width)`), oder möchtest du zuerst die Branch-Strategie und Testschritte sehen?
