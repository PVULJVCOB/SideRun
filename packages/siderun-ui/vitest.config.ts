import { defineConfig } from 'vitest/config';

export default defineConfig({
  root: '../../',
  test: {
    include: ['packages/siderun-ui/test/**/*.ts'],
    environment: 'jsdom',
    coverage: {
      reporter: ['text', 'html', 'lcov'],
      provider: 'istanbul',
      all: true,
      include: ['packages/siderun-ui/src/**/*.js'],
      exclude: ['**/node_modules/**', '**/coverage/**', '**/dist/**', '**/test/**'],
      reportOnFailure: true,
      allowExternal: false,
      thresholds: {
        lines: 0,
        functions: 0,
        branches: 0,
        statements: 0,
      },
    },
  },
});
