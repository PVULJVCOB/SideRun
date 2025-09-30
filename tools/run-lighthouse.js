#!/usr/bin/env node
/* Simple Lighthouse runner for localhost:8000
   Writes report to ./test-results/lighthouse-report.html and JSON
   Note: Requires Chrome installed and accessible in PATH. */
const LHModule = require('lighthouse');
const lighthouse = (typeof LHModule === 'function') ? LHModule : (LHModule && LHModule.lighthouse) ? LHModule.lighthouse : null;
const chromeLauncher = require('chrome-launcher');
const fs = require('fs');
const os = require('os');
const path = require('path');

function findPlaywrightChromium() {
  // Check common ms-playwright cache location on macOS and linux
  const home = os.homedir();
  const cacheBase = path.join(home, 'Library', 'Caches', 'ms-playwright');
  try {
    if (fs.existsSync(cacheBase)) {
      const entries = fs.readdirSync(cacheBase).filter((n) => n.startsWith('chromium'));
      // Prefer entries like 'chromium-<num>' over 'chromium_headless_shell-<num>'
      const prefer = entries.filter((n) => /^chromium-\d+$/.test(n)).sort();
      const candidates = (prefer.length ? prefer : entries.sort());
      for (let i = candidates.length - 1; i >= 0; i--) {
        const last = candidates[i];
        const candidate = path.join(cacheBase, last);
        const macPath = path.join(candidate, 'chrome-mac', 'Chromium.app', 'Contents', 'MacOS', 'Chromium');
        const linuxPath = path.join(candidate, 'chrome-linux', 'chrome');
        const winPath = path.join(candidate, 'chrome-win', 'chrome.exe');
        if (fs.existsSync(macPath)) return macPath;
        if (fs.existsSync(linuxPath)) return linuxPath;
        if (fs.existsSync(winPath)) return winPath;
      }
    }
  } catch (e) {
    // ignore
  }
  return null;
}

(async function run() {
  const url = 'http://localhost:8000';
  const outDir = './test-results';
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  let chrome;
  try {
    try {
      // Try to launch system Chrome first
      chrome = await chromeLauncher.launch({ chromeFlags: ['--headless', '--no-sandbox', '--disable-gpu'] });
    } catch (sysErr) {
      // If system Chrome not found, try Playwright's bundled Chromium
      const pwChromium = findPlaywrightChromium();
      if (pwChromium) {
        console.log('No system Chrome found, using Playwright Chromium at', pwChromium);
        chrome = await chromeLauncher.launch({
          chromePath: pwChromium,
          chromeFlags: ['--headless', '--no-sandbox', '--disable-gpu']
        });
      } else {
        throw sysErr;
      }
    }

    const options = { port: chrome.port };
    console.log('Running Lighthouse CLI against', url, 'on port', options.port);
    // Use the CLI via npx to avoid programmatic API mismatches
    const spawn = require('child_process').spawn;
    const outHtml = path.join(outDir, 'lighthouse-report.html');
    const outJson = path.join(outDir, 'lighthouse-report.json');
    const args = [
      'lighthouse',
      url,
      `--port=${options.port}`,
      `--output=html`,
      `--output=json`,
      `--output-path=${outHtml}`
    ];
    // When passing multiple outputs, the CLI writes first output to output-path; we'll write JSON separately using --output=json --output-path can accept a base name in newer versions, but to be safe we'll run twice.
    await new Promise((resolve, reject) => {
      const proc = spawn('npx', args, { stdio: 'inherit' });
      proc.on('close', (code) => {
        if (code === 0) {
          // Try to load JSON output (some lighthouse versions write both)
          try {
            // If the CLI didn't write JSON, run again specifically for JSON
            if (!fs.existsSync(outJson)) {
              const proc2 = spawn('npx', ['lighthouse', url, `--port=${options.port}`, `--output=json`, `--output-path=${outJson}`], { stdio: 'inherit' });
              proc2.on('close', (code2) => code2 === 0 ? resolve() : reject(new Error('Lighthouse JSON run failed')));
            } else {
              resolve();
            }
          } catch (e) { resolve(); }
        } else {
          reject(new Error('Lighthouse CLI failed with code ' + code));
        }
      });
    });
    console.log('Lighthouse reports written to', outDir);
  } catch (err) {
    console.error('Lighthouse run failed:', err && err.message ? err.message : err);
  } finally {
    if (chrome) await chrome.kill();
  }
})();
