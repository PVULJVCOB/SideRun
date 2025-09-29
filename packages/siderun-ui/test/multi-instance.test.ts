// @ts-nocheck
/* @vitest-environment jsdom */
import { describe, it, expect, beforeEach, afterEach } from 'vitest';

// Minimal polyfills for jsdom
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

function createHost(id: string): HTMLElement {
  const container = document.createElement('div');
  container.id = `host-${id}`;
  container.className = 'sr-container';
  // Provide some size for geometry
  container.getBoundingClientRect = () => ({
    left: 0, top: 0, right: 200, bottom: 100, width: 200, height: 100,
    x: 0, y: 0, toJSON() { return {}; }
  } as any);
  const stroke = document.createElement('div');
  stroke.className = 'site-nav__stroke siderun';
  container.appendChild(stroke);
  document.body.appendChild(container);
  return container;
}

describe('SideRun multi-instance cleanup', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('init two hosts, cleanup both, and allow re-init without duplicates', async () => {
    const { init } = require('../src/runtime-entry.js');
    expect(typeof init).toBe('function');

    const h1 = createHost('a');
    const h2 = createHost('b');

    const c1 = init(h1, { radius: 8, margin: 0 });
    const c2 = init(h2, { radius: 8, margin: 0 });
    expect(typeof c1).toBe('function');
    expect(typeof c2).toBe('function');

    const s1 = h1.querySelector('.site-nav__stroke.siderun')!;
    const s2 = h2.querySelector('.site-nav__stroke.siderun')!;
    expect(s1.querySelectorAll('.sr-injected').length).toBe(1);
    expect(s2.querySelectorAll('.sr-injected').length).toBe(1);

    c1();
    c2();
    expect(s1.querySelector('.sr-injected')).toBeNull();
    expect(s2.querySelector('.sr-injected')).toBeNull();

    // re-init first host should inject exactly one container
    const c3 = init(h1, { radius: 8, margin: 0 });
    expect(typeof c3).toBe('function');
    expect(s1.querySelectorAll('.sr-injected').length).toBe(1);
    c3();
    expect(s1.querySelector('.sr-injected')).toBeNull();
  });
});
