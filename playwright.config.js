const { devices } = require('@playwright/test');

module.exports = {
  testDir: 'tests',
  timeout: 60 * 1000,
  use: {
    headless: true,
    screenshot: 'only-on-failure',
    video: 'off',
    trace: 'off'
  },
  projects: [
    { name: 'Desktop 1366x768', use: { viewport: { width: 1366, height: 768 } } },
    { name: 'iPhone 15 Pro', use: { ...devices['iPhone 13 Pro'] } },
    { name: 'Galaxy S23 Ultra', use: { viewport: { width: 412, height: 915 }, userAgent: 'Mozilla/5.0 (Linux; Android 13; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36' } }
  ]
};
