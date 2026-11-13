
"use strict";

/*
 ECHO//404 — PARADOX EVOLUTION
 CINEMATIC VISUAL EFFECTS v4.1

 CREATED & DEVELOPED BY MANUEL SAMPAIO01
 © 2026 MANUEL SAMPAIO01
*/

(() => {
  const VERSION = "4.1";

  const CONFIG = {
    bloom: {
      enabled: true,
      threshold: 0.65,
      bloomScale: 0.55,
      brightness: 1,
      blur: 3,
      quality: 3
    },

    lighting: {
      enabled: true,
      desktopAlpha: 0.72,
      mobileAlpha: 0.88,
      duration: 2.8
    },

    performance: {
      mobileBreakpoint: 767,
      disableBloomOnMobile: true
    }
  };

  const state = {
    initialized: false,
    bloom: null,
    tween: null,
    target: null,
    world: null,
    reducedMotion: false,
    mobile: false,
    effectsEnabled: true,
    refreshCount: 0
  };

  // ==========================================
  // DEVICE AND ACCESSIBILITY
  // ==========================================

  function mediaMatches(query) {
    try {
      return Boolean(
        window.matchMedia?.(query)?.matches
      );
    } catch (_) {
      return false;
    }
  }

  function detectDevice() {
    state.mobile = mediaMatches(
      `(max-width: ${CONFIG.performance.mobileBreakpoint}px)`
    );

    state.reducedMotion = mediaMatches(
      "(prefers-reduced-motion: reduce)"
    );
  }

  // ==========================================
  // REMOVE PREVIOUS EFFECTS
  // ==========================================

  function cleanup() {
    if (state.tween) {
      try {
        state.tween.kill();
      } catch (error) {
        console.warn(
          "[ECHO//404 FX] Tween cleanup:",
          error
        );
      }

      state.tween = null;
    }

    const target = state.target;
    const bloom = state.bloom;

    if (target) {
      try {
        if (bloom) {
          const filters = target.filters;

          if (Array.isArray(filters)) {
            const remaining = filters.filter(
              filter => filter !== bloom
            );

            target.filters =
              remaining.length > 0
                ? remaining
                : null;
          } else if (filters === bloom) {
            target.filters = null;
          }
        }

        target.alpha = 1;
      } catch (error) {
        console.warn(
          "[ECHO//404 FX] Layer cleanup:",
          error
        );
      }
    }

    if (bloom) {
      try {
        bloom.destroy?.();
      } catch (error) {
        console.warn(
          "[ECHO//404 FX] Filter cleanup:",
          error
        );
      }
    }

    state.bloom = null;
    state.target = null;
    state.initialized = false;
  }

  // ==========================================
  // BLOOM FILTER DETECTION
  // ==========================================

  function getBloomFilter() {
    const pixi = window.PIXI;
    const filters = window.PixiFilters;

    return (
      pixi?.filters?.AdvancedBloomFilter ||
      filters?.AdvancedBloomFilter ||
      pixi?.filters?.BloomFilter ||
      filters?.BloomFilter ||
      null
    );
  }

  // ==========================================
  // APPLY BLOOM
  // ==========================================

  function applyBloom(layer) {
    if (!CONFIG.bloom.enabled) {
      return false;
    }

    if (
      state.mobile &&
      CONFIG.performance.disableBloomOnMobile
    ) {
      return false;
    }

    if (state.reducedMotion) {
      return false;
    }

    const Filter = getBloomFilter();

    if (!Filter) {
      return false;
    }

    let filter = null;

    try {
      filter = new Filter({
        threshold: CONFIG.bloom.threshold,
        bloomScale: CONFIG.bloom.bloomScale,
        brightness: CONFIG.bloom.brightness,
        blur: CONFIG.bloom.blur,
        quality: CONFIG.bloom.quality
      });

      const existing = layer.filters;

      layer.filters = [
        ...(Array.isArray(existing)
          ? existing
          : existing
            ? [existing]
            : []),
        filter
      ];

      state.bloom = filter;

      return true;
    } catch (error) {
      console.warn(
        "[ECHO//404 FX] Bloom unavailable:",
        error
      );

      try {
        filter?.destroy?.();
      } catch (_) {}

      state.bloom = null;

      return false;
    }
  }

  // ==========================================
  // ANIMATED ATMOSPHERIC LIGHTING
  // ==========================================

  function animateLighting(layer) {
    if (!CONFIG.lighting.enabled) {
      return false;
    }

    if (state.reducedMotion) {
      layer.alpha = 1;
      return false;
    }

    const gsap = window.gsap;

    if (!gsap?.to) {
      layer.alpha = 1;
      return false;
    }

    const minimumAlpha = state.mobile
      ? CONFIG.lighting.mobileAlpha
      : CONFIG.lighting.desktopAlpha;

    try {
      layer.alpha = 1;

      state.tween = gsap.to(layer, {
        alpha: minimumAlpha,
        duration: CONFIG.lighting.duration,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        overwrite: true
      });

      return true;
    } catch (error) {
      console.warn(
        "[ECHO//404 FX] Lighting animation:",
        error
      );

      layer.alpha = 1;
      state.tween = null;

      return false;
    }
  }

  // ==========================================
  // INITIALIZE OR REFRESH EFFECTS
  // ==========================================

  function refresh() {
    cleanup();
    detectDevice();

    if (!state.effectsEnabled) {
      return false;
    }

    const world = window.EchoWorldRenderer;

    if (
      !world ||
      typeof world.getState !== "function" ||
      typeof world.getLayer !== "function"
    ) {
      return false;
    }

    const worldState = world.getState();

    if (!worldState?.initialized) {
      return false;
    }

    const lightingLayer =
      world.getLayer("lighting");

    if (!lightingLayer) {
      return false;
    }

    state.world = world;
    state.target = lightingLayer;

    applyBloom(lightingLayer);
    animateLighting(lightingLayer);

    state.initialized = true;
    state.refreshCount++;

    return true;
  }

  // ==========================================
  // ENABLE / DISABLE EFFECTS
  // ==========================================

  function enable() {
    state.effectsEnabled = true;
    return refresh();
  }

  function disable() {
    state.effectsEnabled = false;
    cleanup();
  }

  // ==========================================
  // PERFORMANCE MODE
  // ==========================================

  function setPerformanceMode(enabled) {
    CONFIG.bloom.enabled = !enabled;

    CONFIG.lighting.duration =
      enabled ? 4 : 2.8;

    refresh();
  }

  // ==========================================
  // STATE INFORMATION
  // ==========================================

  function getState() {
    return {
      version: VERSION,
      initialized: state.initialized,
      enabled: state.effectsEnabled,
      mobile: state.mobile,
      reducedMotion: state.reducedMotion,
      bloomActive: Boolean(state.bloom),
      lightingAnimated: Boolean(state.tween),
      refreshCount: state.refreshCount
    };
  }

  // ==========================================
  // EVENT HANDLERS
  // ==========================================

  function onWorldReady() {
    refresh();
  }

  function onThemeChange() {
    refresh();
  }

  function onResize() {
    const wasMobile = state.mobile;

    detectDevice();

    if (wasMobile !== state.mobile) {
      refresh();
    }
  }

  // ==========================================
  // REGISTER EVENTS
  // ==========================================

  window.addEventListener(
    "echo404:worldready",
    onWorldReady
  );

  window.addEventListener(
    "echo404:worldthemechange",
    onThemeChange
  );

  window.addEventListener(
    "resize",
    onResize,
    { passive: true }
  );

  window.addEventListener(
    "load",
    refresh,
    { once: true }
  );

  // ==========================================
  // PUBLIC API
  // ==========================================

  window.EchoVisualEffects = {
    version: VERSION,

    init: refresh,
    refresh,
    destroy: cleanup,

    enable,
    disable,
    setPerformanceMode,
    getState
  };

  // ==========================================
  // INITIAL DEVICE DETECTION
  // ==========================================

  detectDevice();

  // If the renderer is already running,
  // apply the effects immediately.
  if (
    window.EchoWorldRenderer
      ?.getState?.()
      ?.initialized
  ) {
    refresh();
  }

  console.info(
    `[ECHO//404] VISUAL EFFECTS v${VERSION} LOADED`
  );

})();
