import { test, expect } from '@playwright/test';

const viewports = [
  { name: 'desktop', width: 1280, height: 720 },
  { name: 'iphone', width: 390, height: 844 },
  { name: 'galaxy', width: 412, height: 915 }
];

test.describe('Visual checks', () => {
  test('capture hero and nav', async ({ page }) => {
    await page.goto('/');
    // Wait for hero to stabilize
    await page.waitForTimeout(500);
    for (const vp of viewports) {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.waitForTimeout(250);
      await page.screenshot({ path: `screenshots/${vp.name}.png`, fullPage: true });
    }
  });
});
