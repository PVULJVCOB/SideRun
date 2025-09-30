Responsives Testprotokoll (kurz)
=================================

1) Lokaler Server starten
   - Im Projektordner: `python -m http.server 8000` oder ein beliebiger Live-Server.
   - Öffne `http://localhost:8000` im Browser.

2) DevTools Device Emulation
   - Öffne Chrome/Edge: DevTools (F12) → Toggle device toolbar (Cmd+Shift+M / Ctrl+Shift+M).
   - Wähle als Gerät z.B. "iPhone 15 Pro" oder nutze "Responsive" mit folgenden Maßen:
     - iPhone 17 (aktuelle): Breite 393px, Höhe 852px; setze DPR 3.
     - Galaxy Ultra: Breite 393px, Höhe 915px; DPR 3.
   - Achte darauf, die Option für "Device toolbar: Throttling" auszuschalten für realistische Performance.

3) Was zu prüfen ist
   - Hero-Bereich füllt den Bildschirm vollständig (kein weißer Streifen oben/unten), Hintergrund sollte bis unter die Browser-Chrome-Bereiche reichen.
   - Navigation: Toggle sichtbar, Tap-Targets groß genug (mind. 44x44px), Links reagieren auf Touch ohne Zoom/Fehlpositionierung.
   - Buttons: `.hero__cta` und Nav-Links haben größere Padding-Werte und sind leicht anzutippen.
   - Bild- und Medien-Elemente sind fluid (skalieren bei Breitenänderung).
   - Prüfe "Reduce motion" unter System-Einstellungen: Animationen sollten minimiert werden.

4) Browser-spezifische Checks
   - Safari iOS (Simulator / Device): prüfe, dass Hintergrund unter transparenter Browserleiste sichtbar ist.
   - Chrome Android: Performance beim Scrollen und Tap-Responsiveness.

5) Probleme melden
   - Wenn du visuelles Springen/Layout shift siehst: notiere Browser + Version + Device-Emulation + Reproduktionsschritte.
