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

  // Initialize the effect on a host element
  function init(hostEl, options = {}) {
    if (!hostEl) return () => {};
  const strokeHost = hostEl.querySelector('.site-nav__stroke.siderun, .nav_stroke.siderun');
    if (!strokeHost) return () => {};

    strokeHost.innerHTML = '';

    // Default configuration
    const defaults = {
      radius: 8,
      tail: 10,
      gap: 10,
      ease: 0.1,
      hoverAxis: 'x',
      isBottom: false,
      isTop: false,
      trackPointer: false,
      margin: 11,
    };
    const cfg = Object.assign({}, defaults, options);
    if (options.hoverHorizontal === false) cfg.hoverAxis = 'y';

    // Create container to hold the blur layer and the SVG strokes
    const wrapper = document.createElement('div');
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
    strokeHost.appendChild(wrapper);

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
    let rafId;
    let pmRaf = null; // throttle pointermove updates
    const prefersReducedMotion =
      window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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
      const inset = 3; // keep blur inside, away from strokes
      blurLayer.style.setProperty('--sr-inset', `${inset}px`);
      blurLayer.style.setProperty('--sr-radius', `${Math.max(0, radius - inset)}px`);
    }

    // Recalculate sizes on host/viewport changes
    function recalc() {
      hostRect = hostEl.getBoundingClientRect();
      const m = Math.max(0, Number(cfg.margin) || 0);
      const width = Math.max(0, hostRect.width + m * 2);
      const height = Math.max(0, hostRect.height + m * 2);
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

      const perimeter = srRunner.getTotalLength ? srRunner.getTotalLength() : 2 * (innerW + innerH);
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
    function animate() {
      updateTargets();
      if (prefersReducedMotion) {
        // Snap to targets to minimize motion
        primary.eased = primary.target;
        secondary.eased = secondary.target;
      } else {
        primary.eased += (primary.target - primary.eased) * cfg.ease;
        secondary.eased += (secondary.target - secondary.eased) * cfg.ease;
      }
      applyDashes();
      rafId = requestAnimationFrame(animate);
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

    if (cfg.trackPointer) {
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
      hostEl.addEventListener('pointerenter', onPointerEnter);
      hostEl.addEventListener('pointermove', onPointerMove);
      hostEl.addEventListener('pointerleave', onPointerLeave);
      pointerHandlersAttached = true;
      // Save for cleanup
      hostEl.__srPointerHandlers = { onPointerEnter, onPointerMove, onPointerLeave };
    } else {
      if (links.length > 0) {
        links.forEach((link) => {
          link.addEventListener('mouseenter', handleEnter);
          link.addEventListener('mouseleave', handleLeave);
        });
        hostEl.addEventListener('mouseleave', handleLeave);
        linkHandlersAttached = true;
      } else {
        // Fallback: behave like a single interactive element (center-based)
        const onHostEnter = () => {
          state.isHover = true;
          updateHoverFromRect(hostEl.getBoundingClientRect());
        };
        const onHostLeave = () => {
          state.isHover = false;
        };
        hostEl.addEventListener('mouseenter', onHostEnter);
        hostEl.addEventListener('mouseleave', onHostLeave);
        hostHoverAttached = true;
        hostEl.__srHostHoverHandlers = { onHostEnter, onHostLeave };
      }
    }

    // Observe host resize and window resize
    const ro = new ResizeObserver(recalc);
    ro.observe(hostEl);
    window.addEventListener('resize', recalc);

    recalc();
    animate();

    // Return cleanup function to remove listeners/observers
    return () => {
      cancelAnimationFrame(rafId);
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
      if (pointerHandlersAttached && hostEl.__srPointerHandlers) {
        const { onPointerEnter, onPointerMove, onPointerLeave } = hostEl.__srPointerHandlers;
        hostEl.removeEventListener('pointerenter', onPointerEnter);
        hostEl.removeEventListener('pointermove', onPointerMove);
        hostEl.removeEventListener('pointerleave', onPointerLeave);
        delete hostEl.__srPointerHandlers;
      }
      if (hostHoverAttached && hostEl.__srHostHoverHandlers) {
        const { onHostEnter, onHostLeave } = hostEl.__srHostHoverHandlers;
        hostEl.removeEventListener('mouseenter', onHostEnter);
        hostEl.removeEventListener('mouseleave', onHostLeave);
        delete hostEl.__srHostHoverHandlers;
      }
    };
  }

  // Expose API as global
  window.SideRun = { init };
})();
