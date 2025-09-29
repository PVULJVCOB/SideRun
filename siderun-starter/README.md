# SideRun Starter

Dieses Verzeichnis enthält alles, was du ohne Build-Tool brauchst:

- `siderun.js` — die Runtime (JS)
- `siderun.css` — die Styles (CSS)
- `index.html` — Minimal-Demo (öffne diese Datei direkt im Browser)

## Schnellstart

1) Kopiere `siderun-starter/siderun.js` und `siderun-starter/siderun.css` in dein Projekt.
2) Füge im HTML den Host-Container ein:

```html
<div class="sr-container">
  <div class="site-nav__stroke siderun"></div>
  <!-- dein Inhalt -->
</div>
```

3) Binde die Dateien ein und initialisiere SideRun:

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

## Alternativen

- CDN (ohne Dateien zu kopieren):
  ```html
  <link rel="stylesheet" href="https://pvuljvcob.github.io/SideRun/cdn/siderun.css">
  <script type="module">
    import { init } from 'https://pvuljvcob.github.io/SideRun/cdn/siderun.esm.js';
    init(document.querySelector('.sr-container'), { radius: 12, tail: 14, margin: 11 });
  </script>
  ```
- npm (optional): `npm install siderun`

## Theming

Über CSS-Variablen kannst du die Optik einfach anpassen, z. B.:

```css
.sr-container {
  --sr-stroke-width: 3px;
  --sr-color-outer: var(--color-accent, #df6502);
  --sr-color-runner: var(--color-accent, #df6502);
  --sr-blur: 10px;
  --sr-radius: 6px;
}
```

Weitere Variablen findest du in `siderun.css`.