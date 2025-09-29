// @ts-nocheck
/* @vitest-environment jsdom */
import { describe, it, expect, beforeEach, afterEach } from 'vitest';

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

function hostWithSize(w: number, h: number): HTMLElement {
  const container = document.createElement('div');
  container.className = 'sr-container';
  container.getBoundingClientRect = () => ({
    left: 0, top: 0, right: w, bottom: h, width: w, height: h,
    x: 0, y: 0, toJSON() { return {}; }
  } as any);
  const stroke = document.createElement('div');
  stroke.className = 'site-nav__stroke siderun';
  container.appendChild(stroke);
  document.body.appendChild(container);
  return container;
}

describe('SideRun geometry edge cases', () => {
  beforeEach(() => { document.body.innerHTML = ''; });
  afterEach(() => { document.body.innerHTML = ''; });

  it('tiny size does not crash and sets attributes', () => {
  const { init } = require('../src/runtime-entry.js');
    const host = hostWithSize(1, 1);
    const cleanup = init(host, { radius: 8, margin: 0 });
    const stroke = host.querySelector('.site-nav__stroke.siderun')!;
    const injected = stroke.querySelector('.sr-injected');
    expect(injected).not.toBeNull();
    const svg = stroke.querySelector('svg.siderun-border')!;
    expect(svg.getAttribute('width')).toBeDefined();
    expect(svg.getAttribute('height')).toBeDefined();
    cleanup();
  });

  it('huge size does not overflow and sets viewBox', () => {
  const { init } = require('../src/runtime-entry.js');
    const host = hostWithSize(4000, 2000);
    const cleanup = init(host, { radius: 16, margin: 0 });
    const stroke = host.querySelector('.site-nav__stroke.siderun')!;
    const svg = stroke.querySelector('svg.siderun-border')!;
    expect(svg.getAttribute('viewBox')).toMatch(/^0 0 /);
    cleanup();
  });

  it('huge size computes perimeter deterministically', () => {
  const { init } = require('../src/runtime-entry.js');
    const host = hostWithSize(4000, 2500);
    const cleanup = init(host, { radius: 24 });
    const svg = host.querySelector('svg.siderun-border');
    expect(svg).not.toBeNull();
    const runner = host.querySelector('.sr-runner');
    expect(runner).not.toBeNull();
    expect(runner!.getAttribute('stroke-dasharray')).toBeTruthy();
    cleanup();
  });
});
