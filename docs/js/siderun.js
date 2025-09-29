(function () {
  // SideRun: animated running border with inner blur backdrop
  // Public API:
  //   SideRun.init(hostEl, options?) -> () => void (cleanup)
  //   - hostEl: element containing a child '.site-nav__stroke.siderun' (or legacy '.nav_stroke.siderun') where SVG/blur is injected
  //   - options: { radius, tail, gap, ease, hoverAxis, isBottom, isTop, trackPointer, margin }
  const NS = 'http://www.w3.org/2000/svg';

  // Math helpers
  function clamp(v, min, max) {
    return Math.min(Math.max(v, min), max);
  }
  function mix(a, b, t) {
    return a * (1 - t) + b * t;
  }

  // internal maps for instance state (avoid mutating host DOM)
  const cleanupMap = new WeakMap();
  const prevPosMap = new WeakMap();
  const pointerHandlersMap = new WeakMap();
  const hostHoverHandlersMap = new WeakMap();
  // Map host element -> instance API (recalc, cleanup, etc.)
  const instanceMap = new WeakMap();
  // Guard against concurrent init on the same host's stroke container
  const initInProgress = new WeakSet();

  // Shared RAF manager to drive all instances with a single loop
  const RafPool = (() => {
    let rafId = null;
    const callbacks = new Set();
    function tick() {
      callbacks.forEach((cb) => {
        try { cb(); } catch (e) {}
      });
      rafId = requestAnimationFrame(tick);
    }
    return {
      add(cb) {
        callbacks.add(cb);
        if (callbacks.size === 1 && rafId == null) {
          rafId = requestAnimationFrame(tick);
        }
        return () => {
          callbacks.delete(cb);
          if (callbacks.size === 0 && rafId != null) {
            cancelAnimationFrame(rafId);
            rafId = null;
          }
        };
      },
    };
  })();

  // Initialize the effect on a host element
  function init(hostEl, options = {}) {
    if (!hostEl) return () => {};
  const strokeHost = hostEl.querySelector('.site-nav__stroke.siderun, .nav_stroke.siderun');
    if (!strokeHost) return () => {};

    // Prevent concurrent initialization on the same stroke host
    if (initInProgress.has(strokeHost)) return () => {};
    initInProgress.add(strokeHost);

    // Avoid destructively clearing host content. If a previous injection exists, cleanup first.
    const prevInjected = strokeHost.querySelector('.sr-injected');
    const existingCleanup = cleanupMap.get(strokeHost);
    if (existingCleanup) {
      try { existingCleanup(); } catch (e) { /* swallow cleanup errors */ }
    } else if (prevInjected) {
      prevInjected.remove();
    }

  // Read CSS tokens from computed styles
  function readCSSTokens() {
    const style = getComputedStyle(hostEl);
    return {
      radius: parseFloat(style.getPropertyValue('--sr-animation-radius')) || 8,
      tail: parseFloat(style.getPropertyValue('--sr-animation-tail')) || 10,
      gap: parseFloat(style.getPropertyValue('--sr-animation-gap')) || 10,
      ease: parseFloat(style.getPropertyValue('--sr-animation-ease')) || 0.1,
      margin: parseFloat(style.getPropertyValue('--sr-animation-margin')) || 11,
      scale: parseFloat(style.getPropertyValue('--sr-scale')) || 1,
    };
  }

  // Default configuration merged with CSS tokens
  const cssTokens = readCSSTokens();
  const defaults = {
    radius: cssTokens.radius,
    tail: cssTokens.tail,
    gap: cssTokens.gap,
    ease: cssTokens.ease,
    hoverAxis: 'x',
    isBottom: false,
    isTop: false,
    trackPointer: false,
    margin: cssTokens.margin,
    scale: cssTokens.scale,
  };
  const cfg = Object.assign({}, defaults, options);
  if (options.hoverHorizontal === false) cfg.hoverAxis = 'y';    // Create container to hold the blur layer and the SVG strokes
  // Create a safe injected container to avoid touching other host content
  const injected = document.createElement('div');
  injected.className = 'sr-injected';
  // mark injected UI as purely decorative for assistive tech
  injected.setAttribute('aria-hidden', 'true');
  injected.setAttribute('role', 'presentation');

  const wrapper = document.createElement('div');
  wrapper.className = 'sr-wrapper';
  wrapper.style.position = 'absolute';
  wrapper.style.inset = `-${cfg.margin}px`;
  wrapper.style.pointerEvents = 'none';

    const blurLayer = document.createElement('div');
    blurLayer.className = 'sr-backdrop';

    const svg = document.createElementNS(NS, 'svg');
    svg.classList.add('siderun-border');

    const srRunner = document.createElementNS(NS, 'rect');
    srRunner.setAttribute('class', 'sr-runner');
    const srOuter = document.createElementNS(NS, 'rect');
    srOuter.setAttribute('class', 'sr-static-outer');
    const srInner = document.createElementNS(NS, 'rect');
    srInner.setAttribute('class', 'sr-static-inner');
    const srGhost = document.createElementNS(NS, 'rect');
    srGhost.setAttribute('class', 'sr-runner-ghost');

    svg.appendChild(srRunner);
    svg.appendChild(srOuter);
    svg.appendChild(srInner);
    svg.appendChild(srGhost);
    wrapper.appendChild(blurLayer);
    wrapper.appendChild(svg);

    // If host is not positioned (computed), temporarily set inline position so absolute wrapper positions correctly.
    const prevInlinePos = strokeHost.style.position;
    const computedPos = (typeof window !== 'undefined' && window.getComputedStyle) ? window.getComputedStyle(strokeHost).position : '';
    if (!prevInlinePos && computedPos === 'static') {
      strokeHost.style.position = 'relative';
      // use null as marker that we set an inline position that should be cleared
      prevPosMap.set(strokeHost, null);
    } else {
      prevPosMap.set(strokeHost, prevInlinePos);
    }

    injected.appendChild(wrapper);
    strokeHost.appendChild(injected);

    const metrics = {
      perimeter: 0,
      arcQuarter: 0,
      runnerSegment: 0,
      runnerHead: 0,
      widthSpan: 0,
      bases: {
        primaryStart: 0,
        primaryEnd: 0,
        secondaryStart: 0,
        secondaryEnd: 0,
        wrap: 0,
      },
    };

  const state = { hoverX: 0.5, hoverY: 0.5, isHover: false };
    const primary = { target: 0, eased: 0 };
    const secondary = { target: 0, eased: 0 };

    let hostRect = hostEl.getBoundingClientRect();
  // per-instance unregister function from the shared RAF
  let unregisterFromPool = null;
    let pmRaf = null; // throttle pointermove updates
    const prefersReducedMotion =
      window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    // Disposed flag to guard async callbacks after cleanup
    let disposed = false;

    // Update rectangles geometry and blur layer CSS vars
    function setGeometry(width, height, radius) {
      const innerW = Math.max(0, width - 3);
      const innerH = Math.max(0, height - 3);
      [srRunner, srOuter, srInner, srGhost].forEach((rect) => {
        rect.setAttribute('x', '1.5');
        rect.setAttribute('y', '1.5');
        rect.setAttribute('width', innerW);
        rect.setAttribute('height', innerH);
        rect.setAttribute('rx', radius);
      });
      // Sync blur layer size and corner radius via CSS vars
  const inset = 1; // reduce inset so blur reaches closer to the strokes (avoid visible gap)
  blurLayer.style.setProperty('--sr-inset', `${inset}px`);
  // Match blur corner radius exactly to the stroke radius
  blurLayer.style.setProperty('--sr-radius', `${Math.max(0, radius)}px`);
    }

    // Recalculate sizes on host/viewport changes
    function recalc() {
      if (disposed) return;
      hostRect = hostEl.getBoundingClientRect();
      // Allow CSS to request extra space beyond the host's rect (e.g., dropdowns)
      const cs = getComputedStyle(hostEl);
      const extraTop = parseFloat(cs.getPropertyValue('--sr-extra-top') || '0') || 0;
      const extraRight = parseFloat(cs.getPropertyValue('--sr-extra-right') || '0') || 0;
      const extraBottom = parseFloat(cs.getPropertyValue('--sr-extra-bottom') || '0') || 0;
      const extraLeft = parseFloat(cs.getPropertyValue('--sr-extra-left') || '0') || 0;
      const m = Math.max(0, Number(cfg.margin) || 0);
      const width = Math.max(0, hostRect.width + m * 2 + extraLeft + extraRight);
      const height = Math.max(0, hostRect.height + m * 2 + extraTop + extraBottom);
      svg.setAttribute('width', width);
      svg.setAttribute('height', height);
      svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
      // Ensure wrapper matches computed box
      wrapper.style.width = `${width}px`;
      wrapper.style.height = `${height}px`;

      const innerW = Math.max(0, width - 3);
      const innerH = Math.max(0, height - 3);
      const radius = Math.min(cfg.radius, Math.max(0, Math.min(innerW, innerH) / 2));
      setGeometry(width, height, radius);

      // Compute perimeter of rounded rect deterministically to avoid reliance on getTotalLength
      // Perimeter = 2*(w + h) - 8*r + 2*pi*r  (straight segments plus 4 quarter-circle arcs)
      const r = radius;
      let perimeter = 2 * (innerW + innerH) - 8 * r + 2 * Math.PI * r;
      if (!isFinite(perimeter) || perimeter <= 0) {
        // fallback to a safe estimate
        perimeter = Math.max(1, 2 * (innerW + innerH));
      }
      metrics.perimeter = perimeter;
      metrics.arcQuarter = 2 * Math.PI * radius * 0.25;
      metrics.runnerSegment = metrics.arcQuarter + cfg.tail * 2;
      metrics.runnerHead = metrics.arcQuarter + cfg.tail;
      metrics.widthSpan = Math.max(0, innerW - radius * 2);

      metrics.bases.primaryStart = metrics.runnerHead;
      metrics.bases.primaryEnd = -metrics.widthSpan - metrics.arcQuarter + metrics.runnerHead;
      metrics.bases.secondaryStart = metrics.runnerHead - perimeter * 0.5;
      metrics.bases.secondaryEnd =
        -perimeter * 0.5 - metrics.widthSpan - metrics.arcQuarter + metrics.runnerHead;
      metrics.bases.wrap = metrics.bases.secondaryEnd + perimeter;

      const defaultPrimary = cfg.isBottom ? metrics.bases.secondaryEnd : metrics.bases.primaryStart;
      const defaultSecondary = cfg.isTop ? metrics.bases.primaryEnd : metrics.bases.secondaryStart;
      primary.eased = primary.target = defaultPrimary;
      secondary.eased = secondary.target = defaultSecondary;

      applyDashes();
    }

    // Update animated dash targets based on hover state and axis
    function updateTargets() {
      if (!metrics.perimeter) return;
      if (state.isHover) {
        if ((cfg.hoverAxis || 'x').toLowerCase() === 'y') {
          const ratio = clamp(state.hoverY, 0, 1);
          primary.target = mix(metrics.bases.primaryStart, metrics.bases.wrap, ratio);
          secondary.target = mix(metrics.bases.primaryEnd, metrics.bases.secondaryStart, ratio);
        } else {
          const ratio = clamp(state.hoverX, 0, 1);
          primary.target = mix(metrics.bases.primaryStart, metrics.bases.primaryEnd, ratio);
          secondary.target = mix(metrics.bases.secondaryEnd, metrics.bases.secondaryStart, ratio);
        }
      } else {
        primary.target = cfg.isBottom ? metrics.bases.secondaryEnd : metrics.bases.primaryStart;
        secondary.target = cfg.isTop ? metrics.bases.primaryEnd : metrics.bases.secondaryStart;
      }
    }

    // Apply stroke dash arrays/offsets for runner, outer, inner, ghost
    function applyDashes() {
      if (!metrics.perimeter) return;
      const segment = Math.min(metrics.perimeter, Math.max(1, metrics.runnerSegment));
      const mainGap = Math.max(0, metrics.perimeter - segment);
      srRunner.setAttribute('stroke-dasharray', `${segment} ${mainGap}`);
      srRunner.setAttribute('stroke-dashoffset', `${primary.eased}`);
      srOuter.setAttribute('stroke-dasharray', `${segment} ${mainGap}`);
      srOuter.setAttribute('stroke-dashoffset', `${secondary.eased}`);

      const tailLength = -secondary.eased + primary.eased - cfg.gap * 2 - segment;
      const leading = Math.max(0, tailLength);
      const leadingGap = Math.max(0, metrics.perimeter - leading);
      srInner.setAttribute('stroke-dasharray', `${leading} ${leadingGap}`);
      srInner.setAttribute('stroke-dashoffset', `${primary.eased - segment - cfg.gap}`);

      const trailingLength =
        metrics.perimeter + secondary.eased - primary.eased - cfg.gap * 2 - segment;
      const trailing = Math.max(0, trailingLength);
      const trailingGap = Math.max(0, metrics.perimeter - trailing);
      srGhost.setAttribute('stroke-dasharray', `${trailing} ${trailingGap}`);
      srGhost.setAttribute(
        'stroke-dashoffset',
        `${secondary.eased - segment - cfg.gap + metrics.perimeter * 2}`
      );
    }

    // RAF loop easing toward targets
    function step() {
      if (disposed) return;
      updateTargets();
      if (prefersReducedMotion) {
        primary.eased = primary.target;
        secondary.eased = secondary.target;
      } else {
        primary.eased += (primary.target - primary.eased) * cfg.ease;
        secondary.eased += (secondary.target - secondary.eased) * cfg.ease;
      }
      applyDashes();
    }

    // Calculate hover position (normalized) from a rect center
    function updateHoverFromRect(rect) {
      hostRect = hostEl.getBoundingClientRect();
      const centerX = (rect.left + rect.right) / 2;
      const centerY = (rect.top + rect.bottom) / 2;
      state.hoverX = clamp((centerX - hostRect.left) / (hostRect.width || 1), 0, 1);
      state.hoverY = clamp((centerY - hostRect.top) / (hostRect.height || 1), 0, 1);
    }

    // Calculate hover position from pointer event
    function updateHoverFromEvent(e) {
      const apply = () => {
        hostRect = hostEl.getBoundingClientRect();
        const x = e.clientX;
        const y = e.clientY;
        state.hoverX = clamp((x - hostRect.left) / (hostRect.width || 1), 0, 1);
        state.hoverY = clamp((y - hostRect.top) / (hostRect.height || 1), 0, 1);
        pmRaf = null;
      };
      if (pmRaf == null) {
        pmRaf = requestAnimationFrame(apply);
      }
    }

    // Hover handlers for link-based hosts
    function handleEnter(event) {
      state.isHover = true;
      updateHoverFromRect(event.currentTarget.getBoundingClientRect());
    }
    function handleLeave() {
      state.isHover = false;
    }

  const links = hostEl.querySelectorAll('a');
  let pointerHandlersAttached = false;
  let linkHandlersAttached = false;
  let hostHoverAttached = false;
  
  // Mobile and touch detection
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  const isMobile = window.matchMedia('(max-width: 768px)').matches;

  // Backwards-compat: accept deprecated `hoverHorizontal` option but prefer `hoverAxis`.
  if ('hoverHorizontal' in options) {
    console.warn('SideRun: option `hoverHorizontal` is deprecated; use `hoverAxis: "x"|"y"` instead.');
    cfg.hoverAxis = options.hoverHorizontal === false ? 'y' : 'x';
  }  // Enhanced interaction handling for mobile and desktop
  if (cfg.trackPointer || isTouchDevice) {
    const onPointerEnter = (e) => {
      state.isHover = true;
      updateHoverFromEvent(e);
    };
    const onPointerMove = (e) => {
      updateHoverFromEvent(e);
    };
    const onPointerLeave = () => {
      state.isHover = false;
    };
    
    // Touch-specific handling
    const onTouchStart = (e) => {
      state.isHover = true;
      updateHoverFromEvent(e.touches[0]);
    };
    const onTouchEnd = () => {
      // Delay hover state removal for better UX
      setTimeout(() => {
        state.isHover = false;
      }, 150);
    };

    if (isTouchDevice) {
      hostEl.addEventListener('touchstart', onTouchStart, { passive: true });
      hostEl.addEventListener('touchend', onTouchEnd, { passive: true });
    } else {
      hostEl.addEventListener('pointerenter', onPointerEnter, { passive: true });
      hostEl.addEventListener('pointermove', onPointerMove, { passive: true });
      hostEl.addEventListener('pointerleave', onPointerLeave, { passive: true });
    }
    
    pointerHandlersAttached = true;
    pointerHandlersMap.set(hostEl, { 
      onPointerEnter, 
      onPointerMove, 
      onPointerLeave,
      onTouchStart,
      onTouchEnd
    });
  } else {
    if (links.length > 0 && !isTouchDevice) {
      links.forEach((link) => {
        link.addEventListener('mouseenter', handleEnter);
        link.addEventListener('mouseleave', handleLeave);
      });
      hostEl.addEventListener('mouseleave', handleLeave);
      linkHandlersAttached = true;
    } else {
      // Fallback: behave like a single interactive element
      const onHostEnter = () => {
        state.isHover = true;
        updateHoverFromRect(hostEl.getBoundingClientRect());
      };
      const onHostLeave = () => {
        state.isHover = false;
      };
      
      if (isTouchDevice) {
        const onTouchStart = (e) => {
          state.isHover = true;
          updateHoverFromRect(hostEl.getBoundingClientRect());
          setTimeout(() => { state.isHover = false; }, 150);
        };
        hostEl.addEventListener('touchstart', onTouchStart, { passive: true });
      } else {
        hostEl.addEventListener('mouseenter', onHostEnter);
        hostEl.addEventListener('mouseleave', onHostLeave);
      }
      
      hostHoverAttached = true;
      hostHoverHandlersMap.set(hostEl, { onHostEnter, onHostLeave });
    }
  }

    // Observe host resize and window resize
    const ro = new ResizeObserver(recalc);
    ro.observe(hostEl);
    window.addEventListener('resize', recalc);

  try {
      recalc();
      unregisterFromPool = RafPool.add(step);
    } finally {
      // Allow future init calls on this strokeHost
      initInProgress.delete(strokeHost);
    }

    // cleanup function to remove listeners/observers
    const cleanup = () => {
      disposed = true;
      if (typeof unregisterFromPool === 'function') {
        try { unregisterFromPool(); } catch (e) {}
        unregisterFromPool = null;
      }
      if (pmRaf != null) {
        cancelAnimationFrame(pmRaf);
        pmRaf = null;
      }
      ro.disconnect();
      window.removeEventListener('resize', recalc);
      if (linkHandlersAttached) {
        links.forEach((link) => {
          link.removeEventListener('mouseenter', handleEnter);
          link.removeEventListener('mouseleave', handleLeave);
        });
        hostEl.removeEventListener('mouseleave', handleLeave);
      }
      if (pointerHandlersAttached) {
        const handlers = pointerHandlersMap.get(hostEl);
        if (handlers) {
          const { 
            onPointerEnter, 
            onPointerMove, 
            onPointerLeave,
            onTouchStart,
            onTouchEnd
          } = handlers;
          
          if (isTouchDevice) {
            hostEl.removeEventListener('touchstart', onTouchStart);
            hostEl.removeEventListener('touchend', onTouchEnd);
          } else {
            hostEl.removeEventListener('pointerenter', onPointerEnter);
            hostEl.removeEventListener('pointermove', onPointerMove);
            hostEl.removeEventListener('pointerleave', onPointerLeave);
          }
          pointerHandlersMap.delete(hostEl);
        }
      }
      if (hostHoverAttached) {
        const handlers = hostHoverHandlersMap.get(hostEl);
        if (handlers) {
          const { onHostEnter, onHostLeave } = handlers;
          hostEl.removeEventListener('mouseenter', onHostEnter);
          hostEl.removeEventListener('mouseleave', onHostLeave);
          hostHoverHandlersMap.delete(hostEl);
        }
      }
      // remove injected DOM and restore previous inline position if we set it
      try {
        injected.remove();
      } catch (e) {}
      const prev = prevPosMap.get(strokeHost);
      if (typeof prev !== 'undefined') {
        if (prev === null) {
          // we set an inline pos before; clear it
          strokeHost.style.position = '';
        } else if (typeof prev === 'string') {
          strokeHost.style.position = prev;
        }
        prevPosMap.delete(strokeHost);
      }
      // remove stored cleanup reference
      cleanupMap.delete(strokeHost);
    };

    // save cleanup in WeakMap so future inits can call it without mutating host DOM
    cleanupMap.set(strokeHost, cleanup);

    // Store instance API for external updates
    instanceMap.set(hostEl, {
      recalc,
      cleanup,
    });

    return cleanup;
  }

  // Expose API for CommonJS and for browser global (no reassignments)
  function update(host) {
    if (!host) return;
    // Support selector string or NodeList/Array
    const toArray = (val) => {
      if (typeof val === 'string') return Array.from(document.querySelectorAll(val));
      if (val instanceof Element) return [val];
      if (val && typeof val.length === 'number') return Array.from(val);
      return [];
    };
    const list = toArray(host);
    list.forEach((el) => {
      const inst = instanceMap.get(el);
      if (inst && typeof inst.recalc === 'function') {
        // Do an immediate recalc and one more on next frame to catch CSS transitions
        try { inst.recalc(); } catch {}
        requestAnimationFrame(() => {
          try { inst.recalc(); } catch {}
        });
      }
    });
  }

  const exported = { init, update };
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = exported;
  }
  if (typeof window !== 'undefined') {
    window.SideRun = exported;
  }
})();
