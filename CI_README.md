CI Integration (GitHub Actions)

This repository includes a GitHub Actions workflow at `.github/workflows/ci.yml` that:

- Installs Node and dependencies (npm ci)
- Downloads Playwright browsers
- Starts a simple static server (http-server)
- Runs Playwright tests (screenshots)
- Runs Lighthouse (uses Playwright Chromium if system Chrome is missing)
- Uploads `test-results/` as build artifacts

To enable CI: push the branch to GitHub; the workflow will run on push and pull_request to `main`.

Notes:
- The workflow uses `npx http-server` to serve the site on port 8000.
- If you prefer a different server, edit `.github/workflows/ci.yml`.
