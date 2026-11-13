
"use strict";

/*
========================================================
 ECHO//404 — PARADOX EVOLUTION
 WORLD RENDERER v3.0
 FILE: world-renderer.js

 PIXIJS ENVIRONMENT RENDERER
 10 UNIQUE SECTORS
 ANIMATED GRIDS / ENERGY / PARTICLES
 RESPONSIVE CANVAS
 PERFORMANCE OPTIMIZATION

 CREATED & DEVELOPED BY MANUEL SAMPAIO01
 © 2026 MANUEL SAMPAIO01
========================================================
*/

(() => {
  const VERSION = "3.0";

  const WIDTH = 800;
  const HEIGHT = 500;

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
    app: null,
    host: null,
    level: 1,
    theme: THEMES[0],
    grid: null,
    energy: null,
    particles: [],
    particleLayer: null,
    time: 0,
    lastTime: 0,
    raf: 0,
    running: false,
    reducedMotion: false
  };

  function getGameState() {
    try {
      return window.EchoGame?.getState?.() || null;
    } catch {
      return null;
    }
  }

  function normalizeLevel(value) {
    const number = Number(value);

    if (!Number.isFinite(number)) return 1;

    return Math.max(
      1,
      Math.min(10, Math.trunc(number))
    );
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

  function getTheme(level) {
    return THEMES[normalizeLevel(level) - 1];
  }

  function hexToCSS(value) {
    return `#${value.toString(16).padStart(6, "0")}`;
  }

  function getCanvas() {
    return (
      window.EchoGame?.getCanvas?.() ||
      document.getElementById("gameCanvas")
    );
  }

  function findHost() {
    const canvas = getCanvas();

    if (!canvas?.parentElement) return null;

    return canvas.parentElement;
  }

  function createHost() {
    const gameCanvas = getCanvas();
    const parent = findHost();

    if (!gameCanvas || !parent) return null;

    const computed = getComputedStyle(parent);

    if (computed.position === "static") {
      parent.style.position = "relative";
    }

    let host = document.getElementById(
      "echoWorldRenderer"
    );

    if (!host) {
      host = document.createElement("div");
      host.id = "echoWorldRenderer";

      host.style.position = "absolute";
      host.style.inset = "0";
      host.style.width = "100%";
      host.style.height = "100%";
      host.style.pointerEvents = "none";
      host.style.overflow = "hidden";
      host.style.zIndex = "0";

      parent.insertBefore(host, gameCanvas);
    }

    // The game canvas stays above the world renderer.
    gameCanvas.style.position = "relative";
    gameCanvas.style.zIndex = "1";

    state.host = host;

    return host;
  }

  function createGraphics() {
    const PIXI = window.PIXI;

    state.grid = new PIXI.Graphics();
    state.energy = new PIXI.Graphics();
    state.particleLayer = new PIXI.Container();

    state.app.stage.addChild(state.grid);
    state.app.stage.addChild(state.energy);
    state.app.stage.addChild(state.particleLayer);
  }

  function drawGrid() {
    const graphics = state.grid;
    const theme = state.theme;

    if (!graphics) return;

    graphics.clear();

    const spacing = 40;

    for (let x = 0; x <= WIDTH; x += spacing) {
      graphics.moveTo(x, 0);
      graphics.lineTo(x, HEIGHT);
    }

    for (let y = 0; y <= HEIGHT; y += spacing) {
      graphics.moveTo(0, y);
      graphics.lineTo(WIDTH, y);
    }

    graphics.stroke({
      color: theme.grid,
      width: 1,
      alpha: 0.36
    });

    graphics.rect(2, 2, WIDTH - 4, HEIGHT - 4);
    graphics.stroke({
      color: theme.primary,
      width: 2,
      alpha: 0.5
    });

    graphics.moveTo(0, HEIGHT / 2);
    graphics.lineTo(WIDTH, HEIGHT / 2);
    graphics.moveTo(WIDTH / 2, 0);
    graphics.lineTo(WIDTH / 2, HEIGHT);

    graphics.stroke({
      color: theme.primary,
      width: 1,
      alpha: 0.15
    });
  }

  function createParticles() {
    const PIXI = window.PIXI;

    state.particleLayer.removeChildren();

    state.particles = [];

    const mobile = window.innerWidth < 700;
    const count = mobile ? 24 : 55;

    for (let index = 0; index < count; index++) {
      const particle = new PIXI.Graphics();

      const radius = 0.8 + Math.random() * 2;

      particle.circle(0, 0, radius);
      particle.fill({
        color: state.theme.primary,
        alpha: 0.5 + Math.random() * 0.4
      });

      const item = {
        sprite: particle,
        x: Math.random() * WIDTH,
        y: Math.random() * HEIGHT,
        speed: 5 + Math.random() * 18,
        phase: Math.random() * Math.PI * 2,
        drift: 3 + Math.random() * 10
      };

      particle.x = item.x;
      particle.y = item.y;

      state.particles.push(item);
      state.particleLayer.addChild(particle);
    }
  }

  function drawEnergy() {
    const graphics = state.energy;
    const theme = state.theme;

    if (!graphics) return;

    graphics.clear();

    const time = state.time;
    const pulse = 0.5 + Math.sin(time * 1.6) * 0.5;

    const level = state.level;

    // Animated sector-specific geometry.
    switch (level) {
      case 1:
        for (let ring = 0; ring < 4; ring++) {
          const radius =
            65 + ring * 45 + pulse * 8;

          graphics.circle(
            WIDTH / 2,
            HEIGHT / 2,
            radius
          );

          graphics.stroke({
            color: theme.primary,
            width: 1.5,
            alpha: 0.14
          });
        }
        break;

      case 2:
        for (let i = 0; i < 12; i++) {
          const x =
            ((i * 83 + time * 12) % (WIDTH + 100)) - 50;

          graphics.rect(
            x,
            (i * 57) % HEIGHT,
            24,
            9
          );

          graphics.fill({
            color: theme.primary,
            alpha: 0.08 + pulse * 0.08
          });
        }
        break;

      case 3:
        for (let i = 0; i < 6; i++) {
          const x = 80 + i * 125;

          graphics.moveTo(x, 0);
          graphics.lineTo(x + Math.sin(time + i) * 16, HEIGHT);

          graphics.stroke({
            color: theme.primary,
            width: 2,
            alpha: 0.12 + pulse * 0.1
          });
        }
        break;

      case 4:
        for (let ring = 0; ring < 5; ring++) {
          graphics.ellipse(
            WIDTH / 2,
            HEIGHT / 2,
            45 + ring * 32,
            90 + ring * 25
          );

          graphics.stroke({
            color:
              ring % 2
                ? theme.secondary
                : theme.primary,
            width: 2,
            alpha: 0.12 + pulse * 0.05
          });
        }
        break;

      case 5:
        for (let i = 0; i < 9; i++) {
          const x = 50 + i * 85;
          const y =
            90 + (i % 3) * 130 +
            Math.sin(time + i) * 6;

          graphics.rect(x, y, 54, 12);
          graphics.fill({
            color: theme.secondary,
            alpha: 0.16
          });

          graphics.rect(x, y, 54, 12);
          graphics.stroke({
            color: theme.primary,
            width: 1,
            alpha: 0.4
          });
        }
        break;

      case 6:
        for (let i = 0; i < 7; i++) {
          const y = i * 82;

          graphics.moveTo(0, y);
          graphics.lineTo(WIDTH, y + Math.sin(time * 3 + i) * 8);

          graphics.stroke({
            color: theme.primary,
            width: 2,
            alpha: 0.1 + pulse * 0.12
          });
        }
        break;

      case 7:
        for (let i = 0; i < 14; i++) {
          const x =
            (i * 73 + Math.sin(time + i) * 12) % WIDTH;
          const y = (i * 97) % HEIGHT;

          graphics.rect(x, y, 18 + (i % 3) * 10, 3);
          graphics.fill({
            color:
              i % 2
                ? theme.secondary
                : theme.primary,
            alpha: 0.12 + pulse * 0.15
          });
        }
        break;

      case 8:
        for (let ring = 0; ring < 7; ring++) {
          const radius =
            30 + ring * 35 + Math.sin(time + ring) * 5;

          graphics.circle(
            WIDTH / 2,
            HEIGHT / 2,
            radius
          );

          graphics.stroke({
            color: theme.primary,
            width: 1,
            alpha: 0.07 + pulse * 0.06
          });
        }
        break;

      case 9:
        for (let i = 0; i < 12; i++) {
          const x = 40 + i * 65;
          const y = 70 + (i % 4) * 100;

          graphics.moveTo(x, y);
          graphics.lineTo(
            x + 22 + Math.sin(time + i) * 8,
            y - 28
          );
          graphics.lineTo(x + 42, y + 10);

          graphics.stroke({
            color: theme.primary,
            width: 1.5,
            alpha: 0.14
          });
        }
        break;

      case 10:
        for (let ring = 0; ring < 8; ring++) {
          const radius =
            35 + ring * 27 + pulse * 10;

          graphics.circle(
            WIDTH / 2,
            HEIGHT / 2,
            radius
          );

          graphics.stroke({
            color:
              ring % 2
                ? theme.secondary
                : theme.primary,
            width: 2,
            alpha: 0.12 + pulse * 0.08
          });
        }

        graphics.circle(
          WIDTH / 2,
          HEIGHT / 2,
          22 + pulse * 6
        );

        graphics.fill({
          color: theme.primary,
          alpha: 0.12
        });
        break;
    }
  }

  function updateParticles(delta) {
    for (const item of state.particles) {
      item.y -= item.speed * delta;

      item.x +=
        Math.sin(state.time + item.phase) *
        item.drift *
        delta;

      if (item.y < -10) {
        item.y = HEIGHT + 10;
        item.x = Math.random() * WIDTH;
      }

      if (item.x < -10) item.x = WIDTH + 10;
      if (item.x > WIDTH + 10) item.x = -10;

      item.sprite.x = item.x;
      item.sprite.y = item.y;

      item.sprite.alpha =
        0.35 +
        Math.sin(state.time * 2 + item.phase) * 0.2;
    }
  }

  function setLevel(level) {
    const nextLevel = normalizeLevel(level);

    state.level = nextLevel;
    state.theme = getTheme(nextLevel);

    if (!state.initialized) return;

    state.app.renderer.background.color =
      state.theme.background;

    drawGrid();
    createParticles();
    drawEnergy();

    if (state.host) {
      state.host.dataset.worldLevel = String(nextLevel);
      state.host.dataset.worldTheme =
        state.theme.name.toLowerCase().replace(/\s+/g, "-");
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

  function resize() {
    if (!state.app || !state.host) return;

    const canvas = getCanvas();

    if (!canvas) return;

    const bounds = canvas.getBoundingClientRect();

    const width = bounds.width || WIDTH;
    const height = bounds.height || HEIGHT;

    state.host.style.left = `${canvas.offsetLeft}px`;
    state.host.style.top = `${canvas.offsetTop}px`;
    state.host.style.right = "auto";
    state.host.style.bottom = "auto";
    state.host.style.width = `${width}px`;
    state.host.style.height = `${height}px`;

    state.app.renderer.resize(
      Math.max(1, Math.round(width)),
      Math.max(1, Math.round(height))
    );

    state.app.stage.scale.set(
      width / WIDTH,
      height / HEIGHT
    );
  }

  function animate(timestamp) {
    if (!state.running) return;

    if (!state.lastTime) {
      state.lastTime = timestamp;
    }

    const delta = Math.min(
      0.05,
      Math.max(0, (timestamp - state.lastTime) / 1000)
    );

    state.lastTime = timestamp;

    if (!state.reducedMotion) {
      state.time += delta;
      updateParticles(delta);
      drawEnergy();
    }

    state.raf = requestAnimationFrame(animate);
  }

  function bindEvents() {
    window.addEventListener(
      "echo404:levelselected",
      event => {
        const detail = event.detail || {};

        const level = Number.isInteger(detail.levelIndex)
          ? detail.levelIndex + 1
          : detail.level ?? getLevelFromGame();

        setLevel(level);
      }
    );

    window.addEventListener("resize", resize);

    if (typeof ResizeObserver !== "undefined") {
      const canvas = getCanvas();

      if (canvas) {
        const observer = new ResizeObserver(resize);
        observer.observe(canvas);
        state.resizeObserver = observer;
      }
    }
  }

  async function initialize() {
    if (state.initialized) return true;

    if (!window.PIXI) {
      console.warn(
        "ECHO//404: PixiJS não foi carregado."
      );
      return false;
    }

    const host = createHost();

    if (!host) {
      console.warn(
        "ECHO//404: #gameCanvas não encontrado."
      );
      return false;
    }

    try {
      const PIXI = window.PIXI;

      const app = new PIXI.Application();

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

      app.canvas.style.display = "block";
      app.canvas.style.width = "100%";
      app.canvas.style.height = "100%";
      app.canvas.style.pointerEvents = "none";

      createGraphics();

      state.reducedMotion =
        window.matchMedia?.(
          "(prefers-reduced-motion: reduce)"
        )?.matches ?? false;

      state.initialized = true;

      bindEvents();
      setLevel(getLevelFromGame());
      resize();

      state.running = true;
      state.raf = requestAnimationFrame(animate);

      console.log(
        `ECHO//404 WORLD RENDERER v${VERSION} ONLINE`
      );

      return true;
    } catch (error) {
      console.error(
        "ECHO//404: erro ao iniciar World Renderer:",
        error
      );

      return false;
    }
  }

  function destroy() {
    state.running = false;

    if (state.raf) {
      cancelAnimationFrame(state.raf);
      state.raf = 0;
    }

    state.resizeObserver?.disconnect();

    state.app?.destroy(true, {
      children: true
    });

    state.host?.remove();

    state.app = null;
    state.host = null;
    state.initialized = false;
  }

  window.EchoWorldRenderer = {
    version: VERSION,
    init: initialize,
    setLevel,
    getLevel: () => state.level,
    getTheme: () => ({ ...state.theme }),
    getThemes: () => THEMES.map(theme => ({ ...theme })),
    resize,
    destroy,
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
      initialize,
      { once: true }
    );
  } else {
    initialize();
  }
})();

/*
========================================================
 ECHO//404 — WORLD RENDERER v3.0
 CREATED & DEVELOPED BY MANUEL SAMPAIO01
 © 2026 MANUEL SAMPAIO01
========================================================
*/
