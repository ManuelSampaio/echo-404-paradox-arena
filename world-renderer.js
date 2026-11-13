
"use strict";

/*
========================================================
 ECHO//404 — PARADOX EVOLUTION
 WORLD RENDERER v3.2
 FILE: world-renderer.js

 CINEMATIC SCI-FI ENVIRONMENTS
 10 UNIQUE SECTORS
 INDUSTRIAL ARCHITECTURE
 ANIMATED ENERGY / ATMOSPHERE
 RESPONSIVE PIXIJS RENDERING

 CREATED & DEVELOPED BY MANUEL SAMPAIO01
 © 2026 MANUEL SAMPAIO01
========================================================
*/

(() => {
  const VERSION = "3.2";
  const WIDTH = 800;
  const HEIGHT = 500;
  const TAU = Math.PI * 2;

  const THEMES = [
    {
      name: "THE AWAKENING",
      background: 0x03131e,
      grid: 0x11677a,
      primary: 0x48f6ff,
      secondary: 0x157a9c,
      accent: 0xb5ffff
    },
    {
      name: "MEMORY FRACTURE",
      background: 0x12091f,
      grid: 0x543279,
      primary: 0xb77aff,
      secondary: 0x693ca8,
      accent: 0xf0baff
    },
    {
      name: "LASER PROTOCOL",
      background: 0x21080e,
      grid: 0x70252d,
      primary: 0xff435f,
      secondary: 0xa81d36,
      accent: 0xffb0b8
    },
    {
      name: "QUANTUM PASSAGE",
      background: 0x07162b,
      grid: 0x245c91,
      primary: 0x51aaff,
      secondary: 0x6553e8,
      accent: 0xb1e4ff
    },
    {
      name: "COLLAPSE ZONE",
      background: 0x241408,
      grid: 0x765024,
      primary: 0xffac43,
      secondary: 0xd66a26,
      accent: 0xffe1a0
    },
    {
      name: "SYSTEM REBELLION",
      background: 0x180508,
      grid: 0x69202a,
      primary: 0xff304d,
      secondary: 0x9e1531,
      accent: 0xff8c99
    },
    {
      name: "ECHO CORRUPTION",
      background: 0x0a1612,
      grid: 0x245b4a,
      primary: 0x58ff9a,
      secondary: 0xdf3fbd,
      accent: 0xc6ffe0
    },
    {
      name: "TEMPORAL SINGULARITY",
      background: 0x051c26,
      grid: 0x1b6377,
      primary: 0x37d7ee,
      secondary: 0x2478c1,
      accent: 0xa8ffff
    },
    {
      name: "REALITY BREAKDOWN",
      background: 0x171820,
      grid: 0x65606a,
      primary: 0xffdc8a,
      secondary: 0xa5a8bc,
      accent: 0xffffff
    },
    {
      name: "THE FINAL PARADOX",
      background: 0x14071c,
      grid: 0x652c76,
      primary: 0xff416c,
      secondary: 0x9b43ff,
      accent: 0xffc0f0
    }
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
    lights: [],
    time: 0,
    running: false,
    raf: 0,
    lastTime: 0,
    reducedMotion: false,
    resizeObserver: null,
    eventsBound: false
  };

  const rand = (min, max) =>
    min + Math.random() * (max - min);

  const clamp = (value, min, max) =>
    Math.max(min, Math.min(max, value));

  function normalizeLevel(value) {
    const number = Number(value);
    return Number.isFinite(number)
      ? clamp(Math.trunc(number), 1, 10)
      : 1;
  }

  function getGameState() {
    try {
      return window.EchoGame?.getState?.() || null;
    } catch {
      return null;
    }
  }

  function getLevelFromGame() {
    const game = getGameState();

    if (Number.isInteger(game?.levelIndex)) {
      return normalizeLevel(game.levelIndex + 1);
    }

    if (typeof game?.level === "number") {
      return normalizeLevel(game.level);
    }

    return 1;
  }

  function getCanvas() {
    return (
      window.EchoGame?.getCanvas?.() ||
      document.getElementById("gameCanvas")
    );
  }

  function getTheme(level) {
    return THEMES[normalizeLevel(level) - 1];
  }

  function createHost() {
    const canvas = getCanvas();
    const parent = canvas?.parentElement;

    if (!canvas || !parent) return null;

    if (getComputedStyle(parent).position === "static") {
      parent.style.position = "relative";
    }

    let host = document.getElementById(
      "echoWorldRenderer"
    );

    if (!host) {
      host = document.createElement("div");
      host.id = "echoWorldRenderer";
      parent.insertBefore(host, canvas);
    }

    Object.assign(host.style, {
      position: "absolute",
      pointerEvents: "none",
      overflow: "hidden",
      zIndex: "0"
    });

    canvas.style.position = "relative";
    canvas.style.zIndex = "1";
    canvas.style.background = "transparent";

    state.host = host;

    return host;
  }

  function rect(g, x, y, w, h, color, alpha = 1) {
    g.rect(x, y, w, h);
    g.fill({ color, alpha });
  }

  function outlinedRect(
    g, x, y, w, h, color, alpha = 1, width = 1
  ) {
    g.rect(x, y, w, h);
    g.stroke({ color, alpha, width });
  }

  function line(
    g, x1, y1, x2, y2, color, alpha = 1, width = 1
  ) {
    g.moveTo(x1, y1);
    g.lineTo(x2, y2);
    g.stroke({ color, alpha, width });
  }

  function circle(g, x, y, r, color, alpha = 1) {
    g.circle(x, y, r);
    g.fill({ color, alpha });
  }

  function ring(
    g, x, y, r, color, alpha = 1, width = 1
  ) {
    g.circle(x, y, r);
    g.stroke({ color, alpha, width });
  }

  function polygon(g, points, color, alpha = 1) {
    g.poly(points);
    g.fill({ color, alpha });
  }

  function createLayers() {
    const PIXI = window.PIXI;
    const names = [
      "atmosphere",
      "architecture",
      "details",
      "energy",
      "particles",
      "foreground"
    ];

    for (const name of names) {
      const layer = new PIXI.Container();
      state.layers[name] = layer;
      state.app.stage.addChild(layer);
    }
  }

  function clearLayer(name) {
    const layer = state.layers[name];
    if (!layer) return;

    const children = layer.removeChildren();

    for (const child of children) {
      child.destroy({ children: true });
    }
  }

  function graphics(name) {
    const g = new window.PIXI.Graphics();
    state.layers[name].addChild(g);
    return g;
  }

  /*
  ========================================================
   BACKGROUND ATMOSPHERE
  ========================================================
  */

  function drawAtmosphere() {
    const g = graphics("atmosphere");
    const t = state.theme;

    // Distant shadow bands.
    for (let i = 0; i < 11; i++) {
      const x = i * 90 - 45;
      const height = 150 + (i % 4) * 52;

      rect(
        g,
        x,
        HEIGHT - height,
        60,
        height,
        0x020813,
        0.24
      );

      line(
        g,
        x + 6,
        HEIGHT - height,
        x + 6,
        HEIGHT,
        t.secondary,
        0.12,
        2
      );
    }

    // Atmospheric light shafts.
    for (let i = 0; i < 5; i++) {
      const x = 65 + i * 165;

      polygon(
        g,
        [
          x - 13, 0,
          x + 13, 0,
          x + 80, HEIGHT,
          x - 80, HEIGHT
        ],
        t.primary,
        0.018
      );
    }

    // Distant circuitry: subtle, not a dominant grid.
    for (let y = 58; y < HEIGHT; y += 76) {
      line(
        g,
        0,
        y,
        WIDTH,
        y,
        t.grid,
        0.10,
        1
      );
    }

    // Low atmospheric haze.
    for (let i = 0; i < 8; i++) {
      const y = 290 + i * 29;

      rect(
        g,
        0,
        y,
        WIDTH,
        12,
        t.secondary,
        0.012 + i * 0.002
      );
    }
  }

  /*
  ========================================================
   INDUSTRIAL STRUCTURES
  ========================================================
  */

  function drawSupportColumn(g, x, t) {
    rect(g, x, 0, 30, HEIGHT, 0x020a13, 0.62);

    rect(
      g, x + 3, 0, 5, HEIGHT,
      t.secondary, 0.23
    );

    rect(
      g, x + 23, 0, 3, HEIGHT,
      t.primary, 0.15
    );

    for (let y = 28; y < HEIGHT; y += 90) {
      rect(g, x - 5, y, 40, 9, 0x142333, 0.88);

      rect(
        g, x - 5, y + 8, 40, 2,
        t.primary, 0.25
      );

      circle(
        g, x + 15, y + 4, 2,
        t.accent, 0.55
      );
    }
  }

  function drawWallPanels(g, t) {
    for (let i = 0; i < 9; i++) {
      const x = i * 100 + 8;

      outlinedRect(
        g,
        x,
        30,
        83,
        125,
        t.secondary,
        0.16
      );

      rect(
        g,
        x + 8,
        40,
        67,
        5,
        t.primary,
        0.07
      );

      for (let j = 0; j < 4; j++) {
        line(
          g,
          x + 12,
          65 + j * 18,
          x + 71,
          65 + j * 18,
          t.secondary,
          0.10
        );
      }
    }
  }

  function drawPipes(g, t) {
    const paths = [
      [0, 35, 190, 35],
      [190, 35, 190, 105],
      [190, 105, 360, 105],
      [500, 65, 650, 65],
      [650, 65, 650, 155],
      [650, 155, 800, 155]
    ];

    for (const p of paths) {
      line(
        g,
        p[0], p[1], p[2], p[3],
        0x010711, 0.90, 12
      );

      line(
        g,
        p[0], p[1], p[2], p[3],
        t.secondary, 0.36, 4
      );

      line(
        g,
        p[0], p[1], p[2], p[3],
        t.accent, 0.14, 1
      );
    }
  }

  function drawArchitecture() {
    const g = graphics("architecture");
    const t = state.theme;

    drawWallPanels(g, t);

    drawSupportColumn(g, 20, t);
    drawSupportColumn(g, 390, t);
    drawSupportColumn(g, 750, t);

    drawPipes(g, t);

    // Upper structural beam.
    rect(g, 0, 0, WIDTH, 20, 0x020813, 0.95);
    rect(g, 0, 18, WIDTH, 3, t.secondary, 0.38);

    // Lower industrial foundation.
    rect(
      g, 0, HEIGHT - 35, WIDTH, 35,
      0x020813, 0.88
    );

    rect(
      g, 0, HEIGHT - 37, WIDTH, 3,
      t.primary, 0.25
    );

    // Diagonal structural braces.
    for (let i = 0; i < 5; i++) {
      const x = 55 + i * 180;

      line(
        g,
        x,
        HEIGHT - 35,
        x + 65,
        HEIGHT - 125,
        t.secondary,
        0.14,
        5
      );
    }
  }

  /*
  ========================================================
   WORLD DETAILS
  ========================================================
  */

  function drawConsole(g, x, y, t) {
    rect(g, x, y, 60, 35, 0x06101b, 0.88);

    outlinedRect(
      g, x, y, 60, 35,
      t.primary, 0.34
    );

    rect(
      g, x + 6, y + 7, 48, 15,
      t.secondary, 0.20
    );

    for (let i = 0; i < 5; i++) {
      rect(
        g,
        x + 9 + i * 9,
        y + 26,
        5,
        2,
        i % 2 ? t.primary : t.accent,
        0.55
      );
    }
  }

  function drawDetails() {
    const g = graphics("details");
    const t = state.theme;

    drawConsole(g, 95, 65, t);
    drawConsole(g, 640, 88, t);

    for (let i = 0; i < 16; i++) {
      const x = 45 + i * 49;

      rect(
        g,
        x,
        14,
        18,
        3,
        t.primary,
        i % 3 === 0 ? 0.6 : 0.13
      );
    }

    // Ventilation panels.
    for (const x of [245, 545]) {
      rect(
        g,
        x,
        HEIGHT - 95,
        75,
        45,
        0x020813,
        0.75
      );

      outlinedRect(
        g,
        x,
        HEIGHT - 95,
        75,
        45,
        t.secondary,
        0.25
      );

      for (let i = 0; i < 5; i++) {
        line(
          g,
          x + 10,
          HEIGHT - 86 + i * 8,
          x + 65,
          HEIGHT - 86 + i * 8,
          t.primary,
          0.18,
          2
        );
      }
    }
  }

  /*
  ========================================================
   SECTOR-SPECIFIC ENVIRONMENTS
  ========================================================
  */

  function drawSector() {
    const g = graphics("details");
    const t = state.theme;
    const cx = WIDTH / 2;
    const cy = HEIGHT / 2;

    switch (state.level) {
      case 1: {
        // Awakening chamber.
        for (let i = 0; i < 4; i++) {
          ring(
            g, cx, cy, 58 + i * 27,
            t.primary, 0.09, 2
          );
        }

        outlinedRect(
          g, cx - 70, 65, 140, 105,
          t.primary, 0.24, 2
        );

        rect(
          g, cx - 50, 80, 100, 5,
          t.primary, 0.18
        );
        break;
      }

      case 2: {
        // Fragmented memory archives.
        for (let i = 0; i < 8; i++) {
          const x = 75 + (i % 4) * 170;
          const y = 85 + Math.floor(i / 4) * 235;

          outlinedRect(
            g, x, y, 105, 70,
            t.primary, 0.22
          );

          rect(
            g, x + 8, y + 8, 89, 3,
            t.accent, 0.25
          );
        }
        break;
      }

      case 3: {
        // Laser containment facility.
        for (let i = 0; i < 5; i++) {
          const x = 90 + i * 145;

          outlinedRect(
            g, x, 80, 52, 110,
            t.primary, 0.25, 2
          );

          line(
            g, x + 26, 80, x + 26, 190,
            t.primary, 0.17, 3
          );
        }
        break;
      }

      case 4: {
        // Quantum passage / phase gate.
        for (let i = 0; i < 5; i++) {
          const w = 100 + i * 43;
          const h = 190 + i * 43;

          outlinedRect(
            g,
            cx - w / 2,
            cy - h / 2,
            w,
            h,
            i % 2 ? t.secondary : t.primary,
            0.08 + i * 0.015,
            2
          );
        }

        for (let i = 0; i < 3; i++) {
          line(
            g,
            cx - 110,
            80 + i * 24,
            cx + 110,
            80 + i * 24,
            t.primary,
            0.12
          );
        }
        break;
      }

      case 5: {
        // Damaged reactor facility.
        polygon(
          g,
          [
            265, 70,
            535, 70,
            585, 140,
            535, 210,
            265, 210,
            215, 140
          ],
          t.secondary,
          0.11
        );

        for (let i = 0; i < 6; i++) {
          line(
            g,
            240 + i * 55,
            90,
            220 + i * 55,
            205,
            t.primary,
            0.18,
            3
          );
        }
        break;
      }

      case 6: {
        // Rebellion control room.
        for (let i = 0; i < 5; i++) {
          const x = 80 + i * 140;

          rect(
            g, x, 75, 95, 75,
            0x05090f, 0.85
          );

          outlinedRect(
            g, x, 75, 95, 75,
            t.primary, 0.3
          );

          for (let j = 0; j < 4; j++) {
            rect(
              g,
              x + 10,
              88 + j * 14,
              35 + (j % 3) * 16,
              3,
              t.primary,
              0.18
            );
          }
        }
        break;
      }

      case 7: {
        // Corrupted biological circuitry.
        for (let i = 0; i < 7; i++) {
          const x = 80 + i * 105;

          line(
            g,
            x, 0,
            x + 25, 140,
            t.primary,
            0.17,
            4
          );

          circle(
            g,
            x + 25,
            140,
            7,
            i % 2 ? t.secondary : t.primary,
            0.25
          );
        }
        break;
      }

      case 8: {
        // Temporal singularity chamber.
        for (let i = 0; i < 6; i++) {
          ring(
            g,
            cx,
            cy,
            45 + i * 33,
            t.primary,
            0.09,
            2
          );
        }

        for (let i = 0; i < 8; i++) {
          const angle = i * TAU / 8;

          line(
            g,
            cx + Math.cos(angle) * 75,
            cy + Math.sin(angle) * 75,
            cx + Math.cos(angle) * 205,
            cy + Math.sin(angle) * 205,
            t.secondary,
            0.14,
            2
          );
        }
        break;
      }

      case 9: {
        // Fractured reality panels.
        for (let i = 0; i < 12; i++) {
          const x = 35 + (i % 6) * 135;
          const y = 75 + Math.floor(i / 6) * 245;

          polygon(
            g,
            [
              x, y,
              x + 72, y - 15,
              x + 105, y + 50,
              x + 30, y + 90
            ],
            t.secondary,
            0.10
          );

          line(
            g,
            x, y,
            x + 105, y + 50,
            t.primary,
            0.20
          );
        }
        break;
      }

      case 10: {
        // Final paradox reactor.
        for (let i = 0; i < 8; i++) {
          ring(
            g,
            cx,
            cy,
            35 + i * 24,
            i % 2 ? t.secondary : t.primary,
            0.12,
            2
          );
        }

        polygon(
          g,
          [
            cx, cy - 65,
            cx + 56, cy,
            cx, cy + 65,
            cx - 56, cy
          ],
          t.primary,
          0.12
        );

        ring(
          g, cx, cy, 26,
          t.accent, 0.5, 2
        );
        break;
      }
    }
  }

  /*
  ========================================================
   ANIMATED LIGHTS
  ========================================================
  */

  function createLights() {
    const t = state.theme;

    state.lights = [];

    const g = graphics("energy");

    for (let i = 0; i < 9; i++) {
      const x = 48 + i * 89;
      const y = 23;

      // Fixed ceiling lamp housing.
      rect(
        g, x - 12, y - 8, 24, 10,
        0x020813, 0.9
      );

      rect(
        g, x - 9, y, 18, 3,
        t.primary, 0.45
      );

      const glow = new window.PIXI.Graphics();

      circle(
        glow, 0, 0, 9,
        t.primary, 0.12
      );

      circle(
        glow, 0, 0, 3,
        t.accent, 0.65
      );

      glow.x = x;
      glow.y = y + 4;

      state.layers.energy.addChild(glow);

      state.lights.push({
        sprite: glow,
        phase: i * 0.75,
        baseAlpha: 0.5 + (i % 3) * 0.1
      });
    }
  }

  /*
  ========================================================
   PARTICLE SYSTEM
  ========================================================
  */

  function createParticles() {
    const count = window.innerWidth < 700 ? 28 : 65;
    const t = state.theme;

    state.particles = [];

    for (let i = 0; i < count; i++) {
      const sprite = new window.PIXI.Graphics();
      const radius = rand(0.5, 2.2);

      circle(
        sprite,
        0,
        0,
        radius,
        i % 5 === 0 ? t.accent : t.primary,
        rand(0.25, 0.7)
      );

      const particle = {
        sprite,
        x: rand(0, WIDTH),
        y: rand(0, HEIGHT),
        speed: rand(4, 22),
        drift: rand(2, 12),
        phase: rand(0, TAU)
      };

      sprite.position.set(
        particle.x,
        particle.y
      );

      state.layers.particles.addChild(sprite);
      state.particles.push(particle);
    }
  }

  /*
  ========================================================
   FOREGROUND FRAME
  ========================================================
  */

  function drawForeground() {
    const g = graphics("foreground");
    const t = state.theme;

    // Thin technical borders.
    line(
      g, 0, 2, WIDTH, 2,
      t.primary, 0.30, 2
    );

    line(
      g, 0, HEIGHT - 2, WIDTH, HEIGHT - 2,
      t.secondary, 0.25, 2
    );

    // Corner brackets.
    const corners = [
      [8, 8, 1, 1],
      [WIDTH - 8, 8, -1, 1],
      [8, HEIGHT - 8, 1, -1],
      [WIDTH - 8, HEIGHT - 8, -1, -1]
    ];

    for (const [x, y, sx, sy] of corners) {
      line(
        g, x, y, x + sx * 25, y,
        t.primary, 0.55, 2
      );

      line(
        g, x, y, x, y + sy * 25,
        t.primary, 0.55, 2
      );
    }
  }

  /*
  ========================================================
   WORLD BUILDING
  ========================================================
  */

  function rebuildWorld() {
    if (!state.initialized) return;

    for (const name of Object.keys(state.layers)) {
      clearLayer(name);
    }

    state.particles = [];
    state.lights = [];

    drawAtmosphere();
    drawArchitecture();
    drawDetails();
    drawSector();
    createLights();
    createParticles();
    drawForeground();
  }

  function setLevel(level) {
    const nextLevel = normalizeLevel(level);

    state.level = nextLevel;
    state.theme = getTheme(nextLevel);

    if (!state.initialized) return;

    state.app.renderer.background.color =
      state.theme.background;

    rebuildWorld();

    if (state.host) {
      state.host.dataset.worldLevel =
        String(nextLevel);

      state.host.dataset.worldTheme =
        state.theme.name
          .toLowerCase()
          .replace(/\s+/g, "-");
    }

    window.dispatchEvent(
      new CustomEvent("echo404:worldthemechange", {
        detail: {
          level: nextLevel,
          theme: state.theme.name
        }
      })
    );
  }

  /*
  ========================================================
   ANIMATION LOOP
  ========================================================
  */

  function updateParticles(delta) {
    for (const p of state.particles) {
      p.y -= p.speed * delta;

      p.x +=
        Math.sin(state.time + p.phase) *
        p.drift *
        delta;

      if (p.y < -12) {
        p.y = HEIGHT + 12;
        p.x = rand(0, WIDTH);
      }

      if (p.x < -12) p.x = WIDTH + 12;
      if (p.x > WIDTH + 12) p.x = -12;

      p.sprite.position.set(p.x, p.y);

      p.sprite.alpha =
        0.55 +
        Math.sin(state.time * 1.8 + p.phase) * 0.22;
    }
  }

  function updateLights() {
    for (const light of state.lights) {
      light.sprite.alpha =
        light.baseAlpha +
        Math.sin(
          state.time * 2.4 + light.phase
        ) * 0.20;
    }
  }

  function animate(timestamp) {
    if (!state.running) return;

    if (!state.lastTime) {
      state.lastTime = timestamp;
    }

    const delta = clamp(
      (timestamp - state.lastTime) / 1000,
      0,
      0.05
    );

    state.lastTime = timestamp;

    if (!state.reducedMotion) {
      state.time += delta;

      updateParticles(delta);
      updateLights();
    }

    state.raf = requestAnimationFrame(animate);
  }

  /*
  ========================================================
   RESPONSIVE RENDERER
  ========================================================
  */

  function resize() {
    if (!state.initialized) return;

    const canvas = getCanvas();
    if (!canvas || !state.host) return;

    const bounds = canvas.getBoundingClientRect();

    const width = bounds.width || WIDTH;
    const height = bounds.height || HEIGHT;

    Object.assign(state.host.style, {
      left: `${canvas.offsetLeft}px`,
      top: `${canvas.offsetTop}px`,
      right: "auto",
      bottom: "auto",
      width: `${width}px`,
      height: `${height}px`
    });

    state.app.renderer.resize(
      Math.max(1, Math.round(width)),
      Math.max(1, Math.round(height))
    );

    state.app.stage.scale.set(
      width / WIDTH,
      height / HEIGHT
    );
  }

  function onLevelSelected(event) {
    const detail = event.detail || {};

    const level = Number.isInteger(detail.levelIndex)
      ? detail.levelIndex + 1
      : detail.level ?? getLevelFromGame();

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
      const canvas = getCanvas();

      if (canvas) {
        state.resizeObserver =
          new ResizeObserver(resize);

        state.resizeObserver.observe(canvas);
      }
    }
  }

  /*
  ========================================================
   INITIALIZATION
  ========================================================
  */

  async function initialize() {
    if (state.initialized) return true;

    if (state.initializing) {
      return state.initializing;
    }

    state.initializing = (async () => {
      if (!window.PIXI) {
        console.warn(
          "[ECHO//404] PixiJS não carregado."
        );
        return false;
      }

      const host = createHost();

      if (!host) {
        console.warn(
          "[ECHO//404] Arena não encontrada."
        );
        return false;
      }

      let app = null;

      try {
        const PIXI = window.PIXI;

        app = new PIXI.Application();

        await app.init({
          width: WIDTH,
          height: HEIGHT,
          background: THEMES[0].background,
          antialias: true,
          resolution: Math.min(
            window.devicePixelRatio || 1,
            2
          ),
          autoDensity: true,
          preference: "webgl"
        });

        state.app = app;

        host.appendChild(app.canvas);

        Object.assign(app.canvas.style, {
          display: "block",
          width: "100%",
          height: "100%",
          pointerEvents: "none"
        });

        createLayers();

        state.reducedMotion =
          window.matchMedia?.(
            "(prefers-reduced-motion: reduce)"
          )?.matches ?? false;

        state.initialized = true;

        bindEvents();
        setLevel(getLevelFromGame());
        resize();

        state.running = true;
        state.lastTime = 0;

        state.raf = requestAnimationFrame(animate);

        // Request a redraw of the transparent gameplay
        // canvas if the game exposes this method.
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
          `[ECHO//404] WORLD RENDERER v${VERSION} ONLINE`
        );

        return true;
      } catch (error) {
        console.error(
          "[ECHO//404] World Renderer failed:",
          error
        );

        state.running = false;
        state.initialized = false;

        if (app) {
          try {
            app.destroy(true, { children: true });
          } catch {
            // Ignore cleanup errors.
          }
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

  /*
  ========================================================
   CLEANUP
  ========================================================
  */

  function destroy() {
    state.running = false;

    if (state.raf) {
      cancelAnimationFrame(state.raf);
      state.raf = 0;
    }

    state.resizeObserver?.disconnect();
    state.resizeObserver = null;

    if (state.eventsBound) {
      window.removeEventListener(
        "echo404:levelselected",
        onLevelSelected
      );

      window.removeEventListener("resize", resize);
      state.eventsBound = false;
    }

    if (state.app) {
      state.app.destroy(true, {
        children: true
      });
    }

    state.host?.remove();

    state.app = null;
    state.host = null;
    state.layers = {};
    state.particles = [];
    state.lights = [];
    state.initialized = false;
  }

  /*
  ========================================================
   PUBLIC API
  ========================================================
  */

  window.EchoWorldRenderer = {
    version: VERSION,
    init: initialize,
    setLevel,
    resize,
    destroy,

    getLevel: () => state.level,

    getTheme: () => ({
      ...state.theme
    }),

    getThemes: () =>
      THEMES.map(theme => ({ ...theme })),

    getState: () => ({
      initialized: state.initialized,
      level: state.level,
      theme: state.theme.name,
      particles: state.particles.length,
      lights: state.lights.length,
      running: state.running
    })
  };

  /*
  ========================================================
   AUTO START
  ========================================================
  */

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      () => {
        initialize();
      },
      { once: true }
    );
  } else {
    initialize();
  }

})();

/*
========================================================
 ECHO//404 — WORLD RENDERER v3.2
 CREATED & DEVELOPED BY MANUEL SAMPAIO01
 © 2026 MANUEL SAMPAIO01
========================================================
*/

