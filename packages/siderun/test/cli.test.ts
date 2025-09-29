import { describe, it, expect } from 'vitest';

// Minimal smoke test to ensure module loads

describe('siderun cli', () => {
  it('should be importable', async () => {
    const mod = await import('../src/cli');
    expect(mod).toBeTruthy();
  });
});
