
"use strict";

/*
 ECHO//404 — PARADOX EVOLUTION
 WORLD RENDERER v3.3 — VISUAL REBIRTH
 CREATED & DEVELOPED BY MANUEL SAMPAIO01
 © 2026 MANUEL SAMPAIO01
*/

(() => {
  const VERSION = "3.3";
  const W = 800;
  const H = 500;
  const TAU = Math.PI * 2;

  const THEMES = [
    { name: "AWAKENING LAB", bg: 0x061521, main: 0x46e8ff, secondary: 0x236b87, accent: 0x8dfaff },
    { name: "MEMORY ARCHIVE", bg: 0x130e26, main: 0xb48aff, secondary: 0x594283, accent: 0xf1d4ff },
    { name: "LASER CONTAINMENT", bg: 0x1d0b15, main: 0xff526d, secondary: 0x803344, accent: 0xffc1c8 },
    { name: "QUANTUM PASSAGE", bg: 0x08162b, main: 0x55b7ff, secondary: 0x5543a5, accent: 0xb3eaff },
    { name: "REACTOR COLLAPSE", bg: 0x251509, main: 0xffae45, secondary: 0x865125, accent: 0xffe0a4 },
    { name: "SYSTEM REBELLION", bg: 0x1b0910, main: 0xff4261, secondary: 0x7c263b, accent: 0xffb7c5 },
    { name: "ECHO CORRUPTION", bg: 0x091a17, main: 0x58ffb3, secondary: 0x315e58, accent: 0xf36bde },
    { name: "TEMPORAL SINGULARITY", bg: 0x071b29, main: 0x4be8ff, secondary: 0x285e98, accent: 0xc2ffff },
    { name: "REALITY BREAKDOWN", bg: 0x191925, main: 0xffdf94, secondary: 0x73718b, accent: 0xffffff },
    { name: "FINAL PARADOX", bg: 0x190a24, main: 0xff598e, secondary: 0x7d39b8, accent: 0xffd0f2 }
  ];

  const state = {
    initialized: false,
    initializing: null,
    app: null,
    host: null,
    level: 1,
    theme: THEMES[0],
    layers: {},
    particles: [],
    animated: [],
    running: false,
    time: 0,
    lastTime: 0,
    raf: 0,
    reducedMotion: false,
    observer: null,
    eventsBound: false
  };

  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const random = (a, b) => a + Math.random() * (b - a);

  function levelNumber(value) {
    const n = Number(value);
    return Number.isFinite(n) ? clamp(Math.trunc(n), 1, 10) : 1;
  }

  function currentGameLevel() {
    try {
      const s = window.EchoGame?.getState?.();
      if (Number.isInteger(s?.levelIndex)) {
        return levelNumber(s.levelIndex + 1);
      }
      if (Number.isFinite(s?.level)) {
        return levelNumber(s.level);
      }
    } catch (_) {}
    return 1;
  }

  function gameCanvas() {
    return window.EchoGame?.getCanvas?.() ||
      document.getElementById("gameCanvas");
  }

  function graphic(layer) {
    const g = new PIXI.Graphics();
    state.layers[layer].addChild(g);
    return g;
  }

  function fill(g, x, y, w, h, color, alpha = 1) {
    g.rect(x, y, w, h).fill({ color, alpha });
  }

  function stroke(g, x, y, w, h, color, alpha = 1, width = 1) {
    g.rect(x, y, w, h).stroke({ color, alpha, width });
  }

  function line(g, x1, y1, x2, y2, color, alpha = 1, width = 1) {
    g.moveTo(x1, y1).lineTo(x2, y2)
      .stroke({ color, alpha, width });
  }

  function circle(g, x, y, radius, color, alpha = 1) {
    g.circle(x, y, radius).fill({ color, alpha });
  }

  function ring(g, x, y, radius, color, alpha = 1, width = 1) {
    g.circle(x, y, radius).stroke({ color, alpha, width });
  }

  function poly(g, points, color, alpha = 1) {
    g.poly(points).fill({ color, alpha });
  }

  function createHost() {
    const canvas = gameCanvas();
    const parent = canvas?.parentElement;
    if (!canvas || !parent) return null;

    if (getComputedStyle(parent).position === "static") {
      parent.style.position = "relative";
    }

    let host = document.getElementById("echoWorldRenderer");

    if (!host) {
      host = document.createElement("div");
      host.id = "echoWorldRenderer";
      parent.insertBefore(host, canvas);
    }

    Object.assign(host.style, {
      position: "absolute",
      zIndex: "0",
      overflow: "hidden",
      pointerEvents: "none"
    });

    canvas.style.position = "relative";
    canvas.style.zIndex = "1";
    canvas.style.background = "transparent";

    state.host = host;
    return host;
  }

  function createLayers() {
    for (const name of [
      "sky",
      "distant",
      "structure",
      "machinery",
      "lighting",
      "atmosphere",
      "foreground"
    ]) {
      const layer = new PIXI.Container();
      state.layers[name] = layer;
      state.app.stage.addChild(layer);
    }
  }

  function clearWorld() {
    for (const layer of Object.values(state.layers)) {
      const children = layer.removeChildren();
      children.forEach(child => child.destroy({ children: true }));
    }
    state.particles = [];
    state.animated = [];
  }

  // --------------------------------------------------
  // ARCHITECTURAL DRAWING
  // --------------------------------------------------

  function drawPanel(g, x, y, w, h, t, intensity = 1) {
    fill(g, x, y, w, h, 0x091825, 0.95);
    fill(g, x + 4, y + 4, w - 8, h - 8, 0x102a3b, 0.65);
    stroke(g, x, y, w, h, t.secondary, 0.65 * intensity, 2);
    line(g, x + 8, y + 9, x + w - 8, y + 9, t.main, 0.35 * intensity, 2);

    for (let i = 0; i < Math.floor(w / 23); i++) {
      fill(g, x + 10 + i * 22, y + h - 12, 11, 2,
        i % 3 === 0 ? t.main : t.secondary, 0.5);
    }
  }

  function drawColumn(g, x, t) {
    fill(g, x, 0, 32, H, 0x07101b, 0.98);
    fill(g, x + 4, 0, 5, H, 0x1d4052, 0.85);
    fill(g, x + 24, 0, 3, H, t.secondary, 0.6);

    for (let y = 28; y < H; y += 110) {
      fill(g, x - 5, y, 42, 12, 0x1b3547);
      fill(g, x - 5, y + 10, 42, 2, t.main, 0.35);
      circle(g, x + 16, y + 6, 2, t.accent, 0.7);
    }
  }

  function drawPipe(g, points, t) {
    for (let i = 0; i < points.length - 1; i++) {
      const a = points[i];
      const b = points[i + 1];
      line(g, a[0], a[1], b[0], b[1], 0x020710, 0.95, 13);
      line(g, a[0], a[1], b[0], b[1], t.secondary, 0.85, 5);
      line(g, a[0], a[1], b[0], b[1], t.accent, 0.18, 1);
    }
  }

  function drawMonitor(g, x, y, t) {
    fill(g, x - 5, y - 5, 100, 74, 0x030912);
    fill(g, x, y, 90, 60, 0x09283a);
    stroke(g, x, y, 90, 60, t.main, 0.55, 2);

    for (let i = 0; i < 5; i++) {
      const yy = y + 12 + i * 9;
      line(g, x + 10, yy, x + 28 + (i % 3) * 17,
        yy, t.main, 0.25 + i * 0.07, 2);
    }

    fill(g, x + 11, y + 51, 68, 2, t.accent, 0.4);
    fill(g, x + 39, y + 60, 12, 12, 0x182f3d);
  }

  function drawFloor(g, t) {
    fill(g, 0, 457, W, 43, 0x07111b, 0.95);
    fill(g, 0, 457, W, 5, t.secondary, 0.75);
    line(g, 0, 462, W, 462, t.main, 0.25, 1);

    for (let x = 0; x < W; x += 66) {
      stroke(g, x + 3, 469, 57, 23, 0x315164, 0.55);
      line(g, x + 8, 473, x + 50, 473, t.secondary, 0.35);
    }
  }

  function drawCeiling(g, t) {
    fill(g, 0, 0, W, 31, 0x040b15, 0.98);
    fill(g, 0, 29, W, 5, 0x183648);
    line(g, 0, 34, W, 34, t.main, 0.3, 2);

    for (let x = 48; x < W; x += 112) {
      fill(g, x, 20, 54, 9, 0x183d51);
      fill(g, x + 7, 25, 40, 3, t.accent, 0.7);
    }
  }

  // --------------------------------------------------
  // LEVEL 1 — AWAKENING LAB
  // --------------------------------------------------

  function drawAwakeningLab() {
    const t = state.theme;

    const distant = graphic("distant");

    // Large observation windows with distant research wing.
    for (const x of [55, 280, 505]) {
      fill(distant, x, 52, 194, 290, 0x020e1b);
      fill(distant, x + 8, 60, 178, 274, 0x0b2838, 0.9);
      stroke(distant, x, 52, 194, 290, 0x2c6278, 0.85, 5);

      // Distant silhouette of machinery.
      for (let j = 0; j < 4; j++) {
        const xx = x + 19 + j * 41;
        fill(distant, xx, 205 - j * 15, 23, 128 + j * 15,
          0x061724, 0.85);
        fill(distant, xx + 6, 205 - j * 15, 3, 95,
          t.secondary, 0.3);
      }

      line(distant, x + 97, 55, x + 97, 339, 0x34647a, 0.5, 5);
      line(distant, x + 5, 194, x + 189, 194, 0x34647a, 0.45, 5);
    }

    // Large suspended experiment chamber.
    const machine = graphic("machinery");

    fill(machine, 310, 60, 180, 145, 0x071824, 0.92);
    stroke(machine, 310, 60, 180, 145, 0x417d95, 0.65, 6);

    fill(machine, 328, 77, 144, 110, 0x092b3e, 0.75);
    stroke(machine, 328, 77, 144, 110, t.main, 0.25, 2);

    // Chamber core: decorative, behind actual gameplay.
    for (let r = 28; r <= 67; r += 19) {
      ring(machine, 400, 132, r, t.main, 0.12, 2);
    }

    poly(machine, [
      400, 91, 431, 132, 400, 173, 369, 132
    ], t.secondary, 0.22);

    ring(machine, 400, 132, 22, t.accent, 0.45, 2);
    circle(machine, 400, 132, 7, t.accent, 0.45);

    // Industrial machinery at the sides.
    drawPanel(machine, 28, 270, 125, 160, t);
    drawPanel(machine, 650, 265, 125, 165, t);

    drawMonitor(machine, 52, 290, t);
    drawMonitor(machine, 672, 290, t);

    // Transparent storage tanks.
    for (const x of [175, 550]) {
      fill(machine, x, 265, 53, 165, 0x081a27, 0.9);
      fill(machine, x + 7, 280, 39, 130, 0x12617a, 0.18);
      stroke(machine, x, 265, 53, 165, 0x458ca5, 0.65, 3);
      fill(machine, x - 5, 260, 63, 12, 0x193747);
      fill(machine, x - 5, 423, 63, 12, 0x193747);
      line(machine, x + 16, 285, x + 16, 405, t.main, 0.18, 2);
    }

    // Wiring and cooling pipes.
    drawPipe(machine, [
      [0, 94], [145, 94], [145, 162], [310, 162]
    ], t);

    drawPipe(machine, [
      [490, 162], [620, 162], [620, 92], [800, 92]
    ], t);

    const light = graphic("lighting");

    // Ceiling light shafts.
    for (const x of [95, 345, 620]) {
      poly(light, [
        x - 15, 35,
        x + 15, 35,
        x + 96, 440,
        x - 96, 440
      ], t.main, 0.025);
    }

    // Glowing status indicators.
    for (const [x, y] of [
      [49, 250], [142, 250], [659, 245], [765, 245]
    ]) {
      circle(light, x, y, 7, t.main, 0.12);
      circle(light, x, y, 3, t.accent, 0.85);
    }
  }

  // --------------------------------------------------
  // LEVELS 2–10 — DISTINCT ENVIRONMENT MOTIFS
  // --------------------------------------------------

  function drawOtherSector() {
    const g = graphic("machinery");
    const t = state.theme;
    const level = state.level;

    // Shared distant architecture, but different motifs.
    for (let i = 0; i < 5; i++) {
      const x = 45 + i * 165;
      drawPanel(g, x, 65, 125, 125, t, 0.65);
    }

    switch (level) {
      case 2:
        // Memory archive towers.
        for (let x = 75; x < 800; x += 155) {
          fill(g, x, 205, 88, 225, 0x0b1023, 0.95);
          stroke(g, x, 205, 88, 225, t.main, 0.35, 2);
          for (let y = 220; y < 420; y += 25) {
            fill(g, x + 10, y, 68, 13, t.secondary, 0.55);
            line(g, x + 15, y + 5, x + 55, y + 5,
              t.accent, 0.25);
          }
        }
        break;

      case 3:
        // Laser security emitters.
        for (let x = 110; x < 800; x += 185) {
          fill(g, x, 220, 70, 185, 0x1d111b);
          stroke(g, x, 220, 70, 185, t.main, 0.45, 3);
          ring(g, x + 35, 275, 25, t.main, 0.6, 4);
          circle(g, x + 35, 275, 10, t.accent, 0.35);
        }
        break;

      case 4:
        // Quantum gateway.
        for (let i = 0; i < 6; i++) {
          ring(g, 400, 250, 45 + i * 32, t.main, 0.1, 3);
        }
        for (let x = 90; x < 800; x += 210) {
          drawColumn(g, x, t);
        }
        break;

      case 5:
        // Damaged reactor.
        poly(g, [
          260, 180, 325, 95, 475, 95,
          540, 180, 475, 285, 325, 285
        ], 0x40271a, 0.85);
        for (let i = 0; i < 6; i++) {
          line(g, 270 + i * 45, 120,
            240 + i * 50, 330, t.main, 0.23, 4);
        }
        ring(g, 400, 195, 65, t.main, 0.35, 5);
        break;

      case 6:
        // Hostile command center.
        for (let x = 90; x < 800; x += 175) {
          drawMonitor(g, x, 240, t);
          drawPanel(g, x - 10, 325, 120, 105, t);
        }
        break;

      case 7:
        // Organic corruption.
        for (let x = 55; x < 800; x += 115) {
          line(g, x, 0, x + 32, 230, t.main, 0.24, 6);
          ring(g, x + 32, 230, 17, t.accent, 0.4, 3);
          line(g, x + 32, 230, x + 70, 370,
            t.secondary, 0.45, 4);
        }
        break;

      case 8:
        // Singularity engine.
        for (let i = 0; i < 7; i++) {
          ring(g, 400, 255, 35 + i * 27,
            i % 2 ? t.secondary : t.main, 0.2, 3);
        }
        circle(g, 400, 255, 29, t.main, 0.18);
        break;

      case 9:
        // Broken reality.
        for (let i = 0; i < 10; i++) {
          const x = 30 + (i % 5) * 160;
          const y = 200 + Math.floor(i / 5) * 145;
          poly(g, [
            x, y, x + 90, y - 28,
            x + 125, y + 58, x + 30, y + 95
          ], t.secondary, 0.28);
          line(g, x, y, x + 125, y + 58, t.main, 0.35, 2);
        }
        break;

      case 10:
        // Final paradox core.
        for (let i = 0; i < 9; i++) {
          ring(g, 400, 245, 24 + i * 23,
            i % 2 ? t.main : t.secondary, 0.25, 3);
        }
        poly(g, [
          400, 150, 470, 245,
          400, 340, 330, 245
        ], t.main, 0.22);
        circle(g, 400, 245, 23, t.accent, 0.35);
        break;
    }
  }

  // --------------------------------------------------
  // ATMOSPHERE AND PARALLAX-LIKE DETAILS
  // --------------------------------------------------

  function drawAtmosphere() {
    const t = state.theme;
    const sky = graphic("sky");

    for (let i = 0; i < 10; i++) {
      const y = i * 50;
      fill(sky, 0, y, W, 50,
        i % 2 ? t.bg : 0x020912, i % 2 ? 0.4 : 0.1);
    }

    const distant = graphic("distant");

    // Distant structural silhouettes.
    for (let i = 0; i < 12; i++) {
      const x = i * 75 - 15;
      const height = 90 + (i % 5) * 35;
      fill(distant, x, 457 - height, 52, height,
        0x030d17, 0.5);
      line(distant, x + 8, 457 - height,
        x + 8, 457, t.secondary, 0.15, 2);
    }
  }

  function drawStructures() {
    const g = graphic("structure");
    const t = state.theme;

    drawCeiling(g, t);
    drawFloor(g, t);
    drawColumn(g, 9, t);
    drawColumn(g, 759, t);
  }

  function drawForeground() {
    const g = graphic("foreground");
    const t = state.theme;

    // Very subtle cinematic frame.
    for (const [x, y, sx, sy] of [
      [7, 7, 1, 1],
      [793, 7, -1, 1],
      [7, 493, 1, -1],
      [793, 493, -1, -1]
    ]) {
      line(g, x, y, x + sx * 22, y, t.main, 0.28, 2);
      line(g, x, y, x, y + sy * 22, t.main, 0.28, 2);
    }
  }

  function createParticles() {
    const count = window.innerWidth < 700 ? 22 : 50;
    const layer = state.layers.atmosphere;
    const t = state.theme;

    for (let i = 0; i < count; i++) {
      const g = new PIXI.Graphics();
      circle(g, 0, 0, random(0.5, 1.7),
        i % 5 ? t.main : t.accent, 0.7);

      const particle = {
        graphic: g,
        x: random(0, W),
        y: random(0, H),
        speed: random(3, 14),
        phase: random(0, TAU)
      };

      g.position.set(particle.x, particle.y);
      layer.addChild(g);
      state.particles.push(particle);
    }
  }

  function createAnimatedLights() {
    const t = state.theme;
    const layer = state.layers.lighting;

    for (let i = 0; i < 7; i++) {
      const x = 75 + i * 110;
      const g = new PIXI.Graphics();

      circle(g, 0, 0, 13, t.main, 0.09);
      circle(g, 0, 0, 4, t.accent, 0.7);
      g.position.set(x, 35);
      layer.addChild(g);

      state.animated.push({
        graphic: g,
        phase: i * 0.8
      });
    }
  }

  function rebuildWorld() {
    if (!state.initialized) return;

    clearWorld();
    drawAtmosphere();
    drawStructures();

    if (state.level === 1) {
      drawAwakeningLab();
    } else {
      drawOtherSector();
    }

    createAnimatedLights();
    createParticles();
    drawForeground();
  }

  function setLevel(level) {
    state.level = levelNumber(level);
    state.theme = THEMES[state.level - 1];

    if (!state.initialized) return;

    state.app.renderer.background.color = state.theme.bg;
    rebuildWorld();

    state.host.dataset.worldLevel = String(state.level);
    state.host.dataset.worldTheme = state.theme.name;

    window.dispatchEvent(
      new CustomEvent("echo404:worldthemechange", {
        detail: {
          level: state.level,
          theme: state.theme.name
        }
      })
    );
  }

  function resize() {
    if (!state.initialized) return;

    const canvas = gameCanvas();
    if (!canvas || !state.host) return;

    const bounds = canvas.getBoundingClientRect();
    const width = Math.max(1, bounds.width || W);
    const height = Math.max(1, bounds.height || H);

    Object.assign(state.host.style, {
      left: `${canvas.offsetLeft}px`,
      top: `${canvas.offsetTop}px`,
      width: `${width}px`,
      height: `${height}px`,
      right: "auto",
      bottom: "auto"
    });

    state.app.renderer.resize(
      Math.round(width),
      Math.round(height)
    );

    state.app.stage.scale.set(width / W, height / H);
  }

  function animate(timestamp) {
    if (!state.running) return;

    if (!state.lastTime) state.lastTime = timestamp;
    const delta = clamp(
      (timestamp - state.lastTime) / 1000, 0, 0.05
    );
    state.lastTime = timestamp;

    if (!state.reducedMotion) {
      state.time += delta;

      for (const p of state.particles) {
        p.y -= p.speed * delta;
        p.x += Math.sin(state.time + p.phase) * delta * 4;

        if (p.y < -5) {
          p.y = H + 5;
          p.x = random(0, W);
        }

        p.graphic.position.set(p.x, p.y);
        p.graphic.alpha =
          0.35 + Math.sin(state.time * 2 + p.phase) * 0.18;
      }

      for (const item of state.animated) {
        item.graphic.alpha =
          0.65 + Math.sin(state.time * 2.5 + item.phase) * 0.2;
      }
    }

    state.raf = requestAnimationFrame(animate);
  }

  function onLevelSelected(event) {
    const detail = event.detail || {};
    const level = Number.isInteger(detail.levelIndex)
      ? detail.levelIndex + 1
      : detail.level ?? currentGameLevel();

    setLevel(level);
  }

  function bindEvents() {
    if (state.eventsBound) return;
    state.eventsBound = true;

    window.addEventListener(
      "echo404:levelselected",
      onLevelSelected
    );

    window.addEventListener("resize", resize);

    if (typeof ResizeObserver !== "undefined") {
      const canvas = gameCanvas();

      if (canvas) {
        state.observer = new ResizeObserver(resize);
        state.observer.observe(canvas);
      }
    }
  }

  async function initialize() {
    if (state.initialized) return true;
    if (state.initializing) return state.initializing;

    state.initializing = (async () => {
      if (!window.PIXI) {
        console.warn("[ECHO//404] PixiJS indisponível.");
        return false;
      }

      const host = createHost();
      if (!host) return false;

      let app;

      try {
        app = new PIXI.Application();

        await app.init({
          width: W,
          height: H,
          background: THEMES[0].bg,
          antialias: true,
          resolution: Math.min(window.devicePixelRatio || 1, 2),
          autoDensity: true,
          preference: "webgl"
        });

        state.app = app;
        host.appendChild(app.canvas);

        Object.assign(app.canvas.style, {
          width: "100%",
          height: "100%",
          display: "block",
          pointerEvents: "none"
        });

        createLayers();

        state.reducedMotion =
          window.matchMedia?.(
            "(prefers-reduced-motion: reduce)"
          )?.matches ?? false;

        state.initialized = true;

        bindEvents();
        setLevel(currentGameLevel());
        resize();

        state.running = true;
        state.lastTime = 0;
        state.raf = requestAnimationFrame(animate);

        window.EchoGame?.redraw?.();

        window.dispatchEvent(
          new CustomEvent("echo404:worldready", {
            detail: {
              version: VERSION,
              level: state.level
            }
          })
        );

        console.info(
          `[ECHO//404] WORLD RENDERER v${VERSION} READY`
        );

        return true;
      } catch (error) {
        console.error(
          "[ECHO//404] World renderer error:",
          error
        );

        state.running = false;
        state.initialized = false;

        if (app) {
          try {
            app.destroy(true, { children: true });
          } catch (_) {}
        }

        state.app = null;
        state.layers = {};
        return false;
      }
    })();

    try {
      return await state.initializing;
    } finally {
      state.initializing = null;
    }
  }

  function destroy() {
    state.running = false;

    if (state.raf) {
      cancelAnimationFrame(state.raf);
      state.raf = 0;
    }

    state.observer?.disconnect();
    state.observer = null;

    if (state.eventsBound) {
      window.removeEventListener(
        "echo404:levelselected",
        onLevelSelected
      );
      window.removeEventListener("resize", resize);
      state.eventsBound = false;
    }

    if (state.app) {
      state.app.destroy(true, { children: true });
    }

    state.host?.remove();

    state.app = null;
    state.host = null;
    state.layers = {};
    state.particles = [];
    state.animated = [];
    state.initialized = false;
  }

  window.EchoWorldRenderer = {
    version: VERSION,
    init: initialize,
    setLevel,
    resize,
    destroy,
    getLevel: () => state.level,
    getTheme: () => ({ ...state.theme }),
    getThemes: () => THEMES.map(t => ({ ...t })),
    getState: () => ({
      initialized: state.initialized,
      level: state.level,
      theme: state.theme.name,
      particles: state.particles.length,
      running: state.running
    })
  };

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      () => { initialize(); },
      { once: true }
    );
  } else {
    initialize();
  }
})();
