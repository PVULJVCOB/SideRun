Automated tests (Playwright + Lighthouse)

1) Install dev dependencies
   npm install

2) Start a local server (in project root)
   npm run start
   # This runs `python -m http.server 8000`

3) Run Playwright tests (captures screenshots)
   npm run test:playwright

4) Run Lighthouse (Chrome required)
   npm run lighthouse

Results are written to `test-results/` (screenshots and lighthouse report).
