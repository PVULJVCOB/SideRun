# @yourorg/siderun-ui

Front-end package for the Siderun flying-border runner (JS + CSS).

What you get
- ESM + CJS bundles in `dist/`
- Global UMD-style export when loaded via <script> (window.SideRun)
- TypeScript declarations (`index.d.ts`)
- Works with jsdom for testing

Usage

ESM
```js
import { init } from '@yourorg/siderun-ui';
import '@yourorg/siderun-ui/styles/siderun.css';

const cleanup = init(document.querySelector('.sr-container'), { radius: 12 });
// later
cleanup();
```

CommonJS
```js
const { init } = require('@yourorg/siderun-ui');
require('@yourorg/siderun-ui/styles/siderun.css');

const cleanup = init(document.querySelector('.sr-container'), { radius: 12 });
cleanup();
```

UMD (script tag)
```html
<link rel="stylesheet" href="/node_modules/@yourorg/siderun-ui/styles/siderun.css">
<script src="/node_modules/@yourorg/siderun-ui/dist/siderun.cjs.js"></script>
<script>
	const { init } = window.SideRun;
	const cleanup = init(document.querySelector('.sr-container'), { radius: 12 });
	// ...
	cleanup();
	</script>
```

Build & publish

1. From the package folder, install dev deps:

```bash
cd packages/siderun-ui
npm install
```

2. Build:

```bash
npm run build
```

3. Test locally with `npm pack` and `npm install /path/to/package.tgz` in a test project.

4. Publish:

```bash
npm login
npm publish --access public
```

Notes
- Coverage is enabled with thresholds via Vitest; CI should run `npm test`.
- Edit `package.json` to set author and repository metadata if you fork.
