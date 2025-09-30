const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const OUT = path.join(process.cwd(), 'test-results');
if (!fs.existsSync(OUT)) fs.mkdirSync(OUT);

test('homepage visual check', async ({ page, context, browserName, viewport }) => {
  // start on local server
  await page.goto('http://localhost:8000', { waitUntil: 'networkidle' });
  // wait a bit for fonts and scripts
  await page.waitForTimeout(600);

  // ensure hero is visible
  const hero = await page.$('#hero');
  expect(hero).not.toBeNull();

  // ensure hero has a visible white background (check element and ::before)
  const bg = await page.evaluate(el => getComputedStyle(el).backgroundColor, hero);
  const bgBefore = await page.evaluate(el => getComputedStyle(el, '::before').backgroundColor, hero);
  const computedBg = bgBefore || bg;
  // Accept both rgb(...) and rgba(..., 1) forms
  expect(['rgb(255, 255, 255)', 'rgba(255, 255, 255, 1)']).toContain(computedBg);

  // capture full page screenshot
  const name = `${browserName}-${context._options.viewport?.width || viewport?.width || 'auto'}x${context._options.viewport?.height || viewport?.height || 'auto'}`.replace(/\s+/g, '_');
  const shotPath = path.join(OUT, `${name}.png`);
  await page.screenshot({ path: shotPath, fullPage: true });
});
