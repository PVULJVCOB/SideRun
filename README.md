# SideRun — Flying Border Effect

SideRun is a lightweight JavaScript and CSS effect that creates an animated "flying" border around elements. The border follows hover interactions and pointer movements, creating smooth visual feedback for navigation elements, buttons, and interactive components.

## Features

- **Flying Border Animation**: Smooth animated border that follows hover interactions
- **Responsive Design**: Works seamlessly across desktop and mobile devices  
- **Touch Optimized**: Proper touch event handling for mobile devices
- **CSS Customization**: Fully customizable through CSS custom properties
- **Accessible**: Respects reduced motion preferences and maintains focus indicators
- **Performant**: GPU-accelerated animations with optimized rendering

**Live Demo**: https://pvuljvcob.github.io/SideRun/un — flying-border runner (JS + CSS)

SideRun is a tiny front‑end effect: an animated “running” frame with a soft blurred backdrop. Ideal for navbars, logos, and cards. It’s just a small JS runtime plus a CSS file.

Live demo: open `index.html` locally or visit the hosted demo: https://pvuljvcob.github.io/SideRun/

Note: GitHub Pages hosts the main site and the starter folder at `/SideRun/` (no ZIP archive). Download by browsing the folder and saving `siderun.js` and `siderun.css`.

## Quick Start

### Installation

```bash
# Copy the core files to your project
curl -O https://pvuljvcob.github.io/SideRun/js/siderun.js
curl -O https://pvuljvcob.github.io/SideRun/styles/siderun.css
curl -O https://pvuljvcob.github.io/SideRun/styles/navbar.css
```

### Basic Setup

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <!-- Core SideRun styles -->
  <link rel="stylesheet" href="./siderun.css">
  <link rel="stylesheet" href="./navbar.css">
</head>
<body>
  <!-- Any element with SideRun effect -->
  <div class="my-element siderun">
    <div class="site-nav__stroke siderun"></div>
    <span>Hover me for flying border!</span>
  </div>

  <!-- Button with SideRun effect -->
  <button class="my-button siderun">
    <div class="site-nav__stroke siderun"></div>
    <span>Click me</span>
  </button>

  <!-- Initialize SideRun -->
  <script src="./siderun.js"></script>
  <script>
    if (window.SideRun) {
      // Initialize elements with SideRun effect
      const elements = document.querySelectorAll('.siderun');
      elements.forEach(element => {
        SideRun.init(element, {
          radius: 8,     // Border radius
          tail: 15,      // Animation tail length
          ease: 0.1,     // Animation easing
          margin: 11     // Effect margin
        });
      });
    }
  </script>
</body>
</html>
```

## Customization

### CSS Tokens (Recommended)

Control all aspects through CSS custom properties:

```css
:root {
  /* Component sizing */
  --sr-navbar-height: 50px;
  --sr-logo-height: 50px;
  --sr-viewport-padding: 40px;
  
  /* Colors */
  --color-accent: #your-brand-color;
  --color-text: #your-text-color;
  
  /* Scaling */
  --sr-scale: 1.2; /* Makes everything 20% larger */
  
  /* Animation */
  --sr-animation-ease: 0.08;
  --sr-animation-tail: 20px;
}
```

### Responsive Breakpoints

```css
/* Large screens */
@media (min-width: 1400px) {
  :root { --sr-scale: 1.2; }
}

/* Mobile */
@media (max-width: 768px) {
  :root { --sr-scale: 0.8; }
}
```

### JavaScript Configuration

```js
// Advanced initialization with options
SideRun.init(element, {
  trackPointer: true,  // Follow mouse/touch
  hoverAxis: 'x',      // 'x' or 'y' axis tracking  
  ease: 0.1,          // Animation easing (0.01-0.3)
  radius: 8,          // Border radius
  tail: 15,           // Animation tail length
  margin: 11          // Effect margin/padding
});
		init(document.querySelector('.sr-container'), { radius: 12 });
	}
</script>
```

## Host-Markup

```html
<div class="sr-container">
	<div class="site-nav__stroke siderun"></div>
	<!-- content -->
	...
</div>
```

The effect injects its SVG/backdrop layers into the child `.site-nav__stroke.siderun` (legacy: `.nav_stroke.siderun`).

## API

`init(hostEl, options?) -> cleanup()`

Important options:
## Technical Details

### How SideRun Works

SideRun creates a flying border effect by:

1. **SVG Animation** - Uses stroke-dasharray and stroke-dashoffset for smooth border movement
2. **Backdrop Blur** - Adds a subtle blurred background effect behind the border
3. **Pointer Tracking** - Follows mouse hover or touch interactions on the target element

### Positioning System

Easily change navbar and logo positions using CSS tokens:

```css
/* Swap positions: navbar left, logo right */
.site-nav.siderun { 
  left: var(--sr-viewport-padding); 
  right: auto; 
}
#logo.nav_button-left.siderun { 
  left: auto; 
  right: var(--sr-viewport-padding); 
}

/* Move both to bottom */
.site-nav.siderun,
#logo.nav_button-left.siderun {
  top: auto;
  bottom: var(--sr-viewport-padding);
}
```

## Mobile & Responsive

### Automatic Adaptation
- **Large Desktop** (>1400px): Enhanced scaling with larger components
- **Medium Desktop** (1025-1399px): Standard sizing  
- **Small Desktop** (769-1024px): Compact scaling
- **Mobile** (≤768px): Centered navigation with touch optimization

### Touch Optimization
- Proper touch event handling with feedback delays
- Automatic hover state cleanup after touch ends
- 44px minimum touch targets on mobile
- Prevents double-tap zoom on interactive elements

## Performance & Accessibility

### GPU Acceleration
- Uses `transform` and `opacity` for smooth animations
- `will-change` properties for performance optimization
- Respects `prefers-reduced-motion` for accessibility

### Browser Support
- Modern browsers with CSS custom properties support
- Safari 14+ (backdrop-filter support)
- Chrome/Edge 76+, Firefox 103+
- Full mobile support including safe-area-inset

## Documentation

- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Complete technical documentation
- **[POSITION_GUIDE.md](./POSITION_GUIDE.md)** - Quick positioning reference
- **[TODO.md](./TODO.md)** - Development roadmap and implementation details

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Follow the established 3-layer architecture patterns
4. Test across desktop and mobile devices
5. Submit a pull request

## License
MIT — Copyright (c) 2025 Cedric Seidel (SideRun).
See `LICENSE` for the full text.
