# SideRun — flying-border runner (JS + CSS)

SideRun ist ein kleiner Frontend-Effekt: ein animierter „laufender“ Rahmen mit weichem Blur-Backdrop. Ideal für Navbars, Logos und Karten. Er besteht aus einer kleinen JS-Runtime und einer begleitenden CSS-Datei.

Live-Demo: einfach `index.html` im Browser öffnen.

## Installation

Variante A — ohne npm (CDN/Direct Import): Sie können SideRun direkt über GitHub Pages laden.

```html
<!-- CSS -->
<link rel="stylesheet" href="https://pvuljvcob.github.io/SideRun/cdn/siderun.css">
<!-- ESM (empfohlen) -->
<script type="module">
	import { init } from 'https://pvuljvcob.github.io/SideRun/cdn/siderun.esm.js';
	// optional: per-Host-Tuning über CSS-Variablen
	init(document.querySelector('.sr-container'), { radius: 12, tail: 14, margin: 11 });
	// window.SideRun ist für CJS nicht notwendig; ESM importiert nativ
	// Lizenz: https://pvuljvcob.github.io/SideRun/cdn/LICENSE
	// Hinweis: Pfade werden vom Pages-Workflow bereitgestellt
	// (siehe .github/workflows/pages.yml)
  
	// Alternativ können Sie die Dateien auch herunterladen:
	//  - JS (ESM): https://pvuljvcob.github.io/SideRun/cdn/siderun.esm.js
	//  - JS (CJS UMD-ähnlich): https://pvuljvcob.github.io/SideRun/cdn/siderun.cjs.js
	//  - CSS: https://pvuljvcob.github.io/SideRun/cdn/siderun.css
	// und lokal hosten.
  
	// CJS-Variante per Script-Tag (falls ESM nicht verfügbar):
	// <link rel="stylesheet" href="https://pvuljvcob.github.io/SideRun/cdn/siderun.css">
	// <script src="https://pvuljvcob.github.io/SideRun/cdn/siderun.cjs.js"></script>
	// <script> SideRun.init(document.querySelector('.sr-container'), { radius: 12 }); </script>
</script>
```

Variante B — npm (optional):

```bash
npm install siderun
# oder
yarn add siderun
# oder
pnpm add siderun
```

## Verwendung (ESM)

```js
import { init } from 'siderun';
import 'siderun/styles/siderun.css';

const host = document.querySelector('.sr-container');
const cleanup = init(host, { radius: 12, tail: 14, margin: 11 });
```

## Script-Tag

```html
<link rel="stylesheet" href="https://pvuljvcob.github.io/SideRun/cdn/siderun.css">
<script src="https://pvuljvcob.github.io/SideRun/cdn/siderun.cjs.js"></script>
<script>
	const { init } = window.SideRun;
	init(document.querySelector('.sr-container'), { radius: 12 });
</script>
```

## Host-Markup

```html
<div class="sr-container">
	<div class="site-nav__stroke siderun"></div>
	<!-- Inhalt -->
	...
</div>
```

Der Effekt injiziert seine SVG/Backdrop-Layer in das Kind `.site-nav__stroke.siderun` (Legacy: `.nav_stroke.siderun`).

## API

`init(hostEl, options?) -> cleanup()`

Wichtige Optionen:
- `radius` (px), `tail`, `gap`, `ease`
- `hoverAxis`: `'x' | 'y'`
- `trackPointer`: true aktiviert Pointer-Tracking
- `margin`: Außenabstand für den Effekt-Wrapper

Rückgabe ist eine `cleanup()`-Funktion, die Listener und DOM wieder entfernt.

## Theming (CSS Variablen)
Wichtige Variablen aus `siderun/styles/siderun.css`:
- `--sr-scale`, `--sr-stroke-width`, `--sr-blur`, `--sr-saturation`, `--sr-tint`, `--sr-inset`, `--sr-radius`

Beispiel:

```css
.sr-container {
	--sr-scale: 0.9;
	--sr-tint: rgba(0,0,0,0.12);
}
```

## Lizenz
MIT — siehe `LICENSE`.
