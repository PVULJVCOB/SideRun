Playwright Visual Tests

1) Install dependencies (requires Node.js >= 16):

   npm install
   npx playwright install

2) Start a local static server in the project root (required before running tests):

   # in zsh
   python3 -m http.server 8000

3) Run visual tests:

   npm run test:visual

Screenshots will be created in `screenshots/` as `desktop.png`, `iphone.png`, `galaxy.png`.

Notes:
- Playwright must be installed; the repo includes a minimal package.json that declares `@playwright/test` as devDependency.
- Running installs requires internet access to download browsers.
