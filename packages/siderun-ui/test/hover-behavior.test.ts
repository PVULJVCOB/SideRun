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
// Polyfill PointerEvent if missing
if (typeof (globalThis as any).PointerEvent === 'undefined') {
  class PointerEventPolyfill extends MouseEvent {
    constructor(type: string, params: any = {}) {
      super(type, params);
      try { Object.defineProperty(this, 'pointerId', { value: params.pointerId ?? 1, configurable: true }); } catch {}
      try { Object.defineProperty(this, 'pointerType', { value: params.pointerType ?? 'mouse', configurable: true }); } catch {}
    }
  }
  (globalThis as any).PointerEvent = PointerEventPolyfill as any;
}

function makeHostWithLink() {
  const host = document.createElement('div');
  host.className = 'sr-container';
  host.getBoundingClientRect = () => ({ left: 0, top: 0, right: 300, bottom: 150, width: 300, height: 150, x: 0, y: 0, toJSON() { return {}; } } as any);
  const stroke = document.createElement('div');
  stroke.className = 'site-nav__stroke siderun';
  host.appendChild(stroke);
  const link = document.createElement('a');
  link.href = '#';
  link.textContent = 'Item';
  host.appendChild(link);
  document.body.appendChild(host);
  return { host, link, stroke };
}

describe('SideRun hover/pointer behavior', () => {
  beforeEach(() => { document.body.innerHTML = ''; });
  afterEach(() => { document.body.innerHTML = ''; });

  it('hover over link sets hover state and keeps injection', async () => {
  const { init } = require('../src/runtime-entry.js');
    const { host, link, stroke } = makeHostWithLink();
    const cleanup = init(host, { radius: 10, margin: 0, hoverAxis: 'x' });
    expect(stroke.querySelector('.sr-injected')).not.toBeNull();
    // simulate enter/leave
    link.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
    link.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }));
    // Not asserting internal state directly, but ensuring no errors and injection remains
    expect(stroke.querySelector('.sr-injected')).not.toBeNull();
    cleanup();
    expect(stroke.querySelector('.sr-injected')).toBeNull();
  });

  it('pointer tracking attaches and detaches listeners without crash', async () => {
  const { init } = require('../src/runtime-entry.js');
    const host = document.createElement('div');
    host.className = 'sr-container';
    host.getBoundingClientRect = () => ({ left: 0, top: 0, right: 300, bottom: 150, width: 300, height: 150, x: 0, y: 0, toJSON() { return {}; } } as any);
    const stroke = document.createElement('div');
    stroke.className = 'site-nav__stroke siderun';
    host.appendChild(stroke);
    document.body.appendChild(host);

    const cleanup = init(host, { radius: 10, margin: 0, trackPointer: true, ease: 0.5 });
    expect(stroke.querySelector('.sr-injected')).not.toBeNull();
    // simulate pointer events
    host.dispatchEvent(new PointerEvent('pointerenter', { bubbles: true, clientX: 10, clientY: 10 }));
    host.dispatchEvent(new PointerEvent('pointermove', { bubbles: true, clientX: 50, clientY: 20 }));
    host.dispatchEvent(new PointerEvent('pointerleave', { bubbles: true }));
    // cleanup
    cleanup();
    expect(stroke.querySelector('.sr-injected')).toBeNull();
  });
});
function setupHost() {
  const host = document.createElement('div');
  host.className = 'sr-container';
  Object.defineProperty(host, 'getBoundingClientRect', {
    value: () => ({ left: 0, top: 0, right: 200, bottom: 100, width: 200, height: 100 }),
  });
  const stroke = document.createElement('div');
  stroke.className = 'site-nav__stroke siderun';
  host.appendChild(stroke);

  // add a link to trigger link-based hover behavior
  const link = document.createElement('a');
  link.href = '#';
  link.textContent = 'Link';
  host.appendChild(link);

  document.body.appendChild(host);
  return { host, link };
}

describe('SideRun pointer tracking and hover axis', () => {
  beforeEach(() => { document.body.innerHTML = ''; });
  afterEach(() => { document.body.innerHTML = ''; });

  it('moves on pointer tracking (x axis)', () => {
  const { init } = require('../src/runtime-entry.js');
    const { host } = setupHost();
    const cleanup = init(host, { radius: 10, trackPointer: true });

    const evt = new PointerEvent('pointermove', { clientX: 150, clientY: 50 });
    host.dispatchEvent(evt);

    // ensure dashoffsets are set (indicates update ran)
    const runner = host.querySelector('.sr-runner');
    const outer = host.querySelector('.sr-static-outer');
    expect(runner).not.toBeNull();
    expect(outer).not.toBeNull();
    expect(runner!.getAttribute('stroke-dashoffset')).toBeTruthy();
    expect(outer!.getAttribute('stroke-dashoffset')).toBeTruthy();

    cleanup();
  });

  it('uses hoverAxis=y when configured', () => {
  const { init } = require('../src/runtime-entry.js');
    const { host, link } = setupHost();
    const cleanup = init(host, { radius: 10, hoverAxis: 'y' });

    // simulate link hover
    const enter = new Event('mouseenter', { bubbles: true });
    link.dispatchEvent(enter);

    const runner = host.querySelector('.sr-runner');
    const outer = host.querySelector('.sr-static-outer');
    expect(runner).not.toBeNull();
    expect(outer).not.toBeNull();
    expect(runner!.getAttribute('stroke-dashoffset')).toBeTruthy();
    expect(outer!.getAttribute('stroke-dashoffset')).toBeTruthy();

    cleanup();
  });
});
