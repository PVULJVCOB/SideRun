# SideRun Position Guide - Navbar & Logo verschieben

## Schnelle Position Changes

### Position der Navbar ändern

Die Navbar ist standardmäßig **oben rechts** positioniert. Hier ist wie du sie verschieben kannst:

#### CSS Tokens anpassen:
```css
:root {
  /* Standard: oben rechts */
  /* Für andere Positionen, überschreibe diese Werte: */
}

/* Navbar nach links verschieben */
.site-nav.siderun {
  left: var(--sr-viewport-padding);
  right: auto;
}

/* Navbar nach unten verschieben */
.site-nav.siderun {
  top: auto;
  bottom: var(--sr-viewport-padding);
}

/* Navbar zentrieren (horizontal) */
.site-nav.siderun {
  left: 50%;
  right: auto;
  transform: translateX(-50%);
}
```

### Position des Logos ändern

Das Logo ist standardmäßig **oben links** positioniert:

```css
/* Logo nach rechts verschieben */
#logo.nav_button-left.siderun {
  left: auto;
  right: var(--sr-viewport-padding);
}

/* Logo nach unten verschieben */
#logo.nav_button-left.siderun {
  top: auto;
  bottom: var(--sr-viewport-padding);
}

/* Logo zentrieren */
#logo.nav_button-left.siderun {
  left: 50%;
  transform: translateX(-50%);
}
```

### Beide Elemente vertauschen (Logo rechts, Navbar links)

```css
/* Logo nach rechts */
#logo.nav_button-left.siderun {
  left: auto;
  right: var(--sr-viewport-padding);
}

/* Navbar nach links */
.site-nav.siderun {
  left: var(--sr-viewport-padding);
  right: auto;
}
```

## Mobile Anpassungen

Für mobile Geräte musst du auch die entsprechenden Media Queries anpassen:

```css
@media (max-width: 768px) {
  /* Deine mobilen Position-Anpassungen hier */
  .sr-mobile-navbar {
    /* Mobile navbar ist zentriert - kann auch verschoben werden */
    left: 20px; /* Beispiel: weiter links */
    transform: none;
  }
}
```

## Advanced: Komplett neue Position

Für völlig custom Positionen:

```css
/* Navbar in der Mitte rechts (vertikal zentriert) */
.site-nav.siderun {
  top: 50%;
  right: var(--sr-viewport-padding);
  transform: translateY(-50%);
}

/* Logo unten rechts */
#logo.nav_button-left.siderun {
  top: auto;
  bottom: var(--sr-viewport-padding);
  left: auto;
  right: calc(var(--sr-viewport-padding) + var(--sr-navbar-min-width) + var(--sr-component-gap));
}

/* Floating navbar (zentriert, oben) */
.site-nav.siderun {
  left: 50%;
  right: auto;
  transform: translateX(-50%);
  top: 20px; /* Näher zum oberen Rand */
}
```

## Wichtige Hinweise

1. **Safe Area**: Verwende immer `var(--sr-viewport-padding)` für konsistente Abstände
2. **Mobile First**: Teste deine Änderungen auf mobilen Geräten
3. **Z-Index**: Die Z-Index-Werte bleiben automatisch korrekt durch das Token-System
4. **SideRun Effekt**: Funktioniert automatisch in jeder Position

## Live-Vorschau Änderungen

Du kannst Positionen auch direkt in den Browser Dev Tools testen:

1. **F12** drücken (Developer Tools öffnen)
2. **Element auswählen** (`.site-nav.siderun` oder `#logo.nav_button-left.siderun`)
3. **CSS Properties bearbeiten**:
   ```css
   top: 50px;        /* Höhe anpassen */
   left: 100px;      /* Von links */
   right: auto;      /* Rechts-Position deaktivieren */
   bottom: auto;     /* Unten-Position deaktivieren */
   ```
4. **Ergebnis in echtem CSS übernehmen**

## Schnell-Commands

Die häufigsten Änderungen als Copy-Paste CSS:

```css
/* NAVBAR LINKS, LOGO RECHTS */
.site-nav.siderun { left: var(--sr-viewport-padding); right: auto; }
#logo.nav_button-left.siderun { left: auto; right: var(--sr-viewport-padding); }

/* BEIDE UNTEN */
.site-nav.siderun { top: auto; bottom: var(--sr-viewport-padding); }
#logo.nav_button-left.siderun { top: auto; bottom: var(--sr-viewport-padding); }

/* NAVBAR ZENTRIERT OBEN */
.site-nav.siderun { left: 50%; right: auto; transform: translateX(-50%); }

/* LOGO ZENTRIERT UNTEN */
#logo.nav_button-left.siderun { 
  top: auto; 
  bottom: var(--sr-viewport-padding); 
  left: 50%; 
  transform: translateX(-50%); 
}
```

Einfach in deine `navbar.css` am Ende hinzufügen und die gewünschte Position wählen!