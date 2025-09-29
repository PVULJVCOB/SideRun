// @ts-nocheck
/* @vitest-environment jsdom */
import { describe, it, expect, beforeEach, afterEach } from 'vitest';

// jsdom polyfills
if (typeof (globalThis as any).ResizeObserver === 'undefined') {
  (globalThis as any).ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}
if (typeof (globalThis as any).requestAnimationFrame === 'undefined') {
  (globalThis as any).requestAnimationFrame = (cb: FrameRequestCallback) => setTimeout(() => cb(Date.now()), 0) as unknown as number;
  (globalThis as any).cancelAnimationFrame = (id: number) => clearTimeout(id as unknown as NodeJS.Timeout);
}

describe('SideRun smoke', () => {
  let container: HTMLElement;

  beforeEach(() => {
    // setup DOM container similar to host
    document.body.innerHTML = '';
    container = document.createElement('div');
    container.className = 'sr-container';
    const stroke = document.createElement('div');
    stroke.className = 'site-nav__stroke siderun';
    container.appendChild(stroke);
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('init and cleanup', () => {
    const { init } = require('../src/runtime-entry.js');
    expect(typeof init).toBe('function');
    const cleanup = init(container, { radius: 8 });
    expect(typeof cleanup).toBe('function');
    // ensure injected node exists under the stroke host
    const stroke = container.querySelector('.site-nav__stroke.siderun');
    expect(stroke).not.toBeNull();
    if (stroke) {
      const injected = stroke.querySelector('.sr-injected');
      expect(injected).not.toBeNull();
    }
    // run cleanup
    cleanup();
    if (stroke) {
      expect(stroke.querySelector('.sr-injected')).toBeNull();
    }
  });
});
