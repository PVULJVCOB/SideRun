/**
 * SideRun navigation: desktop expansion + SideRun init
 * - Mobile nav is handled by js/mobile-nav.js (React UMD). This file keeps desktop logic lean.
 */
/* Navbar module removed — placeholder
 *
 * The project has removed the previous logo and desktop navbar markup and the
 * corresponding JS behavior. This file is intentionally a no-op to avoid
 * runtime errors from scripts that may still load it. To rebuild the navbar:
 *
 * 1. Create semantic markup in `index.html` (e.g., <header> with nav and a host
 *    container for SideRun stroke: <div class="site-nav__stroke siderun"></div>).
 * 2. Implement behavior in a new module that queries for the host and wires
 *    hover/focus expansion. Prefer measuring only the links container and
 *    setting a CSS custom property (e.g., --nav-links-max) rather than setting
 *    inline widths on the host element.
 * 3. If you want SideRun visuals on the nav, call SideRun.init(hostEl, opts)
 *    after the host exists and only once.
 *
 * This placeholder ensures the site remains stable while you rebuild the
 * navbar component in a cleaned-up, modular way.
 */
export default null;
