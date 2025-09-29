# Siderun — Front-end MVP Scope

Ziel: Ein kleines, robustes JS+CSS Effekt‑Paket, das eine animierte "running" Border und Blur‑Backdrop liefert. Fokus liegt auf einfacher Integration, guter UX und niedrigen Performance‑Kosten.

Kernfunktionen:
- Leichtgewichtige Laufzeit: `js/siderun.js` — API: `SideRun.init(hostEl, options) -> cleanup()`
- Kompakte Styles: `styles/siderun.css` mit CSS‑Variablen für einfache Theming/Scaling
- Zwei Eingabe‑Modi: Link/host hover (default) und direkter Pointer‑Tracking (`trackPointer: true`)
- Responsive token tuning (stroke width, blur, inset) via CSS vars and media queries
- Accessibility: honor `prefers-reduced-motion` and remain decorative (no focus trapping)

Nicht‑Ziele (MVP):
- Large component system or framework integration shims (keep it framework‑agnostic)
- Heavyweight runtime features — keep runtime < 5–10KB gzipped where practical

Schnittstellen (kurz):
- `SideRun.init(hostEl, options)` — see docs and `docs/SIDERUN_EFFECT.md` for full options
- `options` highlights: `radius`, `tail`, `gap`, `ease`, `trackPointer`, `margin`, `hoverAxis`

Entwicklung & Tests:
- Add a small demo page (already `index.html`) that initializes multiple hosts and demonstrates both modes.
- Performance tests: ensure animation costs are bounded (throttle pointermove with rAF; use vector-effect for non-scaling strokes).

Erweiterungen (später):
- Optionally expose a tiny module build for import (ESM), and a minimal bundler entry
- A small playground to interactively tune `radius`, `tail`, `ease`, `trackPointer`
