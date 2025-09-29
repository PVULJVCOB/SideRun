// Vitest coverage-friendly entry: import the repo runtime and re-export init
// Ensures Vite instruments the dependency and coverage thresholds apply.
import mod from '../../../js/siderun.js';

// Support both CJS (module.exports = { init }) and direct function export fallback
const exported = mod && (mod.init || mod.default || mod);

export const init = exported && exported.init ? exported.init : exported;
