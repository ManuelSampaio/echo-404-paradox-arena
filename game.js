
"use strict";

/*
========================================================
 ECHO//404 — PARADOX EVOLUTION
 VERSION 3.1 — WORLD INTEGRATION
 FILE: game.js

 MAIN GAME ENGINE
 PIXIJS WORLD RENDERER INTEGRATION
 10 LEVELS / TEMPORAL ECHOES / PARADOX SHIFT
 DESKTOP + MOBILE
 ADVANCED LEVEL MECHANICS

 CREATED & DEVELOPED BY MANUEL SAMPAIO01
 © 2026 MANUEL SAMPAIO01
========================================================
*/

(() => {

  // ==================================================
  // 01. CANVAS
  // ==================================================

  const canvas = document.getElementById("gameCanvas");

  if (!canvas) {
    throw new Error(
      "ECHO//404: #gameCanvas not found."
    );
  }

  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error(
      "ECHO//404: Canvas 2D unavailable."
    );
  }

  if (
    typeof GAME_WORLD === "undefined" ||
    typeof GAME_LEVELS === "undefined"
  ) {
    throw new Error(
      "ECHO//404: levels.js must load before game.js."
    );
  }

  const WORLD = GAME_WORLD;
  const LEVELS = GAME_LEVELS;

  const WIDTH = WORLD.width || 800;
  const HEIGHT = WORLD.height || 500;

  const MAX_CYCLES = WORLD.maxCycles || 6;

  const PLAYER_SIZE = 20;
  const PLAYER_SPEED = WORLD.player?.speed || 230;
  const PLATE_RADIUS = 27;

  canvas.width = WIDTH;
  canvas.height = HEIGHT;

  // ==================================================
  // 02. COLORS
  // ==================================================

  const COLORS = {
    cyan: "#00f5ff",
    purple: "#aa78ff",
    green: "#21ff9b",
    red: "#ff3868",
    yellow: "#ffd166",
    blue: "#478bff",
    white: "#e9faff",
    dark: "#080d1c"
  };

  // ==================================================
  // 03. UI
  // ==================================================

  const UI = {
    cycle: document.getElementById("cycle"),
    timer: document.getElementById("timer"),
    ghosts: document.getElementById("ghosts"),
    score: document.getElementById("score"),
    best: document.getElementById("best"),
    timerBar: document.getElementById("timerBar"),
    status: document.getElementById("status"),
    levelGrid: document.getElementById("levelGrid"),
    progress: document.getElementById("progress"),
    levelName: document.getElementById("levelName"),

    overlay: document.getElementById("overlay"),
    overlayTitle: document.getElementById("overlayTitle"),
    overlayMessage: document.getElementById("overlayMessage"),
    finalScore: document.getElementById("finalScore"),

    startBtn: document.getElementById("startBtn"),
    restartBtn: document.getElementById("restartBtn"),
    shiftBtn: document.getElementById("shiftBtn"),
    soundBtn: document.getElementById("soundBtn"),
    playAgainBtn: document.getElementById("playAgainBtn"),
    nextBtn: document.getElementById("nextBtn"),

    mobileControls: document.getElementById("mobileControls"),
    mobileShiftBtn: document.getElementById("mobileShiftBtn"),
    mobileRestartBtn: document.getElementById("mobileRestartBtn"),

    moveUp: document.getElementById("moveUp"),
    moveDown: document.getElementById("moveDown"),
    moveLeft: document.getElementById("moveLeft"),
    moveRight: document.getElementById("moveRight")
  };

  // ==================================================
  // 04. UTILITIES
  // ==================================================

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function distance(a, b) {
    return Math.hypot(
      a.x - b.x,
      a.y - b.y
    );
  }

  function intersects(a, b) {
    return (
      a.x < b.x + b.w &&
      a.x + a.w > b.x &&
      a.y < b.y + b.h &&
      a.y + a.h > b.y
    );
  }

  function playerRect(x, y) {
    return {
      x: x - PLAYER_SIZE / 2,
      y: y - PLAYER_SIZE / 2,
      w: PLAYER_SIZE,
      h: PLAYER_SIZE
    };
  }

  function formatScore(value) {
    return Math.floor(value || 0)
      .toLocaleString("pt-PT");
  }

  function setStatus(message) {
    if (UI.status) {
      UI.status.textContent = message;
    }
  }

  function playSound(name) {
    try {
      window.GameAudio?.play?.(name);
    } catch (error) {
      console.warn(
        "ECHO//404 audio:",
        error
      );
    }
  }

  function emitEvent(name, detail = {}) {
    window.dispatchEvent(
      new CustomEvent(`echo404:${name}`, {
        detail: {
          levelIndex,
          levelNumber: levelIndex + 1,
          ...detail
        }
      })
    );
  }

  function getStorage() {
    return window.GameStorage || null;
  }

  function storageCall(method, ...args) {
    const storage = getStorage();

    if (
      !storage ||
      typeof storage[method] !== "function"
    ) {
      return undefined;
    }

    try {
      return storage[method](...args);
    } catch (error) {
      console.warn(
        `ECHO//404 storage.${method}:`,
        error
      );

      return undefined;
    }
  }

  // ==================================================
  // 05. GAME STATE
  // ==================================================

  let levelIndex = 0;
  let level = LEVELS[0];

  let player = null;

  let recordings = [];
  let ghosts = [];
  let currentRecording = [];

  let particles = [];

  let cycle = 1;
  let elapsed = 0;
  let worldTime = 0;

  let score = 0;
  let deaths = 0;
  let shifts = 0;

  let running = false;
  let finished = false;

  let doorOpen = false;
  let previousDoorState = false;
  let shiftUsed = false;

  let portalCooldown = 0;
  let lastFrame = 0;
  let animationId = null;
  let lastTickSecond = null;

  let firstMoveEmitted = false;
  let criticalEmitted = false;

  const triggeredTraps = new Set();
  const touchedPlatforms = new Set();

  // ==================================================
  // 06. LEVEL SETTINGS
  // ==================================================

  function getCycleDuration() {
    const duration = Number(level?.timeLimit);

    return Number.isFinite(duration) &&
      duration > 0
      ? duration
      : WORLD.cycleDuration || 10;
  }

  function getMaxCycles() {
    const count = Number(level?.maxCycles);

    return Number.isFinite(count) &&
      count > 0
      ? Math.floor(count)
      : MAX_CYCLES;
  }

  function getVisualTheme() {
    const theme =
      level?.visualTheme ||
      level?.environment ||
      {};

    if (typeof theme === "string") {
      return { id: theme };
    }

    return theme && typeof theme === "object"
      ? theme
      : {};
  }

  function applyLevelTheme() {
    const theme = getVisualTheme();

    const id = String(
      theme.id ||
      theme.name ||
      `sector-${levelIndex + 1}`
    )
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, "-");

    document.body.dataset.environment = id;
    document.body.dataset.sector =
      String(levelIndex + 1);

    const renderer = window.EchoWorldRenderer;

    if (
      renderer &&
      typeof renderer.setLevel === "function"
    ) {
      renderer.setLevel(levelIndex + 1);
    }
  }

  // ==================================================
  // 07. WORLD RENDERER
  // ==================================================

  function isWorldRendererActive() {
    const renderer = window.EchoWorldRenderer;

    if (
      !renderer ||
      typeof renderer.getState !== "function"
    ) {
      return false;
    }

    try {
      return Boolean(
        renderer.getState().initialized
      );
    } catch {
      return false;
    }
  }

  function isOperatorRendererActive() {
    const renderer =
      window.EchoVisualRebirthV30 ||
      window.EchoVisualRebirthV21;

    if (
      !renderer ||
      typeof renderer.shouldHideOriginalPlayer !==
        "function"
    ) {
      return false;
    }

    try {
      return Boolean(
        renderer.shouldHideOriginalPlayer()
      );
    } catch {
      return false;
    }
  }

  // ==================================================
  // 08. PUBLIC API
  // ==================================================

  window.EchoGame = Object.assign(
    window.EchoGame || {},
    {
      version: "3.1",

      getState() {
        return {
          player: player ? { ...player } : null,
          running,
          finished,
          levelIndex,
          levelNumber: levelIndex + 1,
          level,
          cycle,
          elapsed,
          worldTime,
          cycleDuration: getCycleDuration(),
          maxCycles: getMaxCycles(),
          score,
          deaths,
          shifts,
          doorOpen,
          shiftUsed,
          ghosts: ghosts.map(
            ghost => ({ ...ghost })
          ),
          recordingsCount: recordings.length,
          width: WIDTH,
          height: HEIGHT,
          environment: getVisualTheme()
        };
      },

      getCanvas() {
        return canvas;
      },

      getLevel() {
        return level;
      },

      getVisualTheme,

      selectLevel(index) {
        return selectLevel(index);
      },

      start() {
        return startGame();
      },

      restart() {
        return startGame();
      },

      shift() {
        return paradoxShift();
      },

      getLaserPosition,

      isLaserActive,

      getWorldRendererState() {
        return window.EchoWorldRenderer
          ?.getState?.() || null;
      }
    }
  );

  // ==================================================
  // 09. CONTROLS
  // ==================================================

  const keys = new Set();
  const mobilePointers = new Map();

  const mobileDirections = {
    up: UI.moveUp,
    down: UI.moveDown,
    left: UI.moveLeft,
    right: UI.moveRight
  };

  const movementKeys = new Set([
    "w",
    "a",
    "s",
    "d",
    "arrowup",
    "arrowdown",
    "arrowleft",
    "arrowright"
  ]);

  function isDirectionPressed(direction) {
    const keyboardMap = {
      up: ["w", "arrowup"],
      down: ["s", "arrowdown"],
      left: ["a", "arrowleft"],
      right: ["d", "arrowright"]
    };

    const keyboard = keyboardMap[direction]
      .some(key => keys.has(key));

    const mobile = Array.from(
      mobilePointers.values()
    ).includes(direction);

    return keyboard || mobile;
  }

  function refreshMobileButtons() {
    for (
      const [direction, button]
      of Object.entries(mobileDirections)
    ) {
      if (!button) continue;

      button.classList.toggle(
        "pressed",
        Array.from(
          mobilePointers.values()
        ).includes(direction)
      );
    }
  }

  function clearMobileMovement() {
    mobilePointers.clear();
    refreshMobileButtons();
  }

  function clearAllMovement() {
    keys.clear();
    clearMobileMovement();
  }

  // ==================================================
  // 10. PARTICLES
  // ==================================================

  function emitParticles(
    x,
    y,
    color,
    amount = 15
  ) {
    for (let i = 0; i < amount; i++) {
      const angle =
        Math.random() * Math.PI * 2;

      const speed =
        30 + Math.random() * 120;

      const life =
        0.3 + Math.random() * 0.6;

      particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life,
        maxLife: life,
        size: 2 + Math.random() * 3,
        color
      });
    }

    if (particles.length > 300) {
      particles.splice(
        0,
        particles.length - 300
      );
    }
  }

  function updateParticles(dt) {
    for (const particle of particles) {
      particle.x += particle.vx * dt;
      particle.y += particle.vy * dt;
      particle.life -= dt;
    }

    particles = particles.filter(
      particle => particle.life > 0
    );
  }

  // ==================================================
  // 11. LEVEL MENU
  // ==================================================

  function isLevelCompleted(index) {
    const storage = getStorage();

    if (
      typeof storage?.isCompleted === "function"
    ) {
      return Boolean(
        storage.isCompleted(index)
      );
    }

    const data = storageCall("load") || {};
    const completed = data.completed || [];

    return completed.includes(index);
  }

  function isLevelUnlocked(index) {
    const storage = getStorage();

    if (
      typeof storage?.isUnlocked === "function"
    ) {
      return Boolean(
        storage.isUnlocked(index)
      );
    }

    const data = storageCall("load") || {};

    return index + 1 <= (data.unlocked || 1);
  }

  function buildLevelMenu() {
    if (UI.levelGrid) {
      UI.levelGrid.innerHTML = "";

      LEVELS.forEach((item, index) => {
        const button =
          document.createElement("button");

        const completed =
          isLevelCompleted(index);

        const unlocked =
          isLevelUnlocked(index);

        button.textContent = completed
          ? `✓${index + 1}`
          : String(index + 1);

        button.disabled = !unlocked;

        button.classList.toggle(
          "selected",
          index === levelIndex
        );

        button.title = unlocked
          ? item.name
          : "Nível bloqueado";

        button.addEventListener(
          "click",
          () => {
            if (selectLevel(index)) {
              playSound("click");
            }
          }
        );

        UI.levelGrid.appendChild(button);
      });
    }

    const completedCount = LEVELS.filter(
      (_, index) => isLevelCompleted(index)
    ).length;

    if (UI.progress) {
      UI.progress.textContent =
        `${completedCount} / ` +
        `${LEVELS.length} CONCLUÍDOS`;
    }

    if (UI.levelName) {
      UI.levelName.textContent =
        `NÍVEL ${levelIndex + 1} — ` +
        `${level.name} | ` +
        `${level.difficulty} | ` +
        `${level.hint}`;
    }

    if (UI.best) {
      UI.best.textContent = formatScore(
        storageCall(
          "getBestScore",
          levelIndex
        ) || 0
      );
    }
  }

  function selectLevel(index) {
    if (
      !Number.isInteger(index) ||
      index < 0 ||
      index >= LEVELS.length
    ) {
      return false;
    }

    if (!isLevelUnlocked(index)) {
      setStatus("NÍVEL BLOQUEADO.");
      playSound("error");
      return false;
    }

    levelIndex = index;
    level = LEVELS[index];

    applyLevelTheme();

    resetGame();

    emitEvent("levelselected", {
      level,
      levelIndex,
      levelNumber: index + 1
    });

    buildLevelMenu();

    return true;
  }

  // ==================================================
  // 12. RESET
  // ==================================================

  function resetGame() {
    if (animationId !== null) {
      cancelAnimationFrame(animationId);
      animationId = null;
    }

    clearAllMovement();

    player = {
      x: WORLD.start.x,
      y: WORLD.start.y,
      size: PLAYER_SIZE,
      speed: PLAYER_SPEED
    };

    recordings = [];
    ghosts = [];

    currentRecording = [{
      t: 0,
      x: player.x,
      y: player.y
    }];

    particles = [];

    cycle = 1;
    elapsed = 0;
    worldTime = 0;

    score = 0;
    deaths = 0;
    shifts = 0;

    running = false;
    finished = false;

    doorOpen = false;
    previousDoorState = false;
    shiftUsed = false;

    portalCooldown = 0;
    lastFrame = 0;
    lastTickSecond = null;

    firstMoveEmitted = false;
    criticalEmitted = false;

    triggeredTraps.clear();
    touchedPlatforms.clear();

    UI.overlay?.classList.add("hidden");

    if (UI.startBtn) {
      UI.startBtn.textContent =
        "INICIAR SIMULAÇÃO";
    }

    setStatus(level.hint || "");

    updateHUD();
    draw();
  }

  // ==================================================
  // 13. START
  // ==================================================

  function startGame() {
    resetGame();

    running = true;

    storageCall("registerAttempt");

    emitEvent("start", {
      level,
      cycle
    });

    window.GameAudio?.init?.();
    playSound("start");

    if (UI.startBtn) {
      UI.startBtn.textContent =
        "REINICIAR SIMULAÇÃO";
    }

    setStatus(
      `NÍVEL ${levelIndex + 1}: ${level.hint}`
    );

    updateHUD();

    animationId = requestAnimationFrame(
      gameLoop
    );

    return true;
  }

  // ==================================================
  // 14. HUD
  // ==================================================

  function updateHUD() {
    const duration = getCycleDuration();
    const maxCycles = getMaxCycles();

    const remaining = Math.max(
      0,
      duration - elapsed
    );

    if (UI.cycle) {
      UI.cycle.textContent =
        `${cycle}/${maxCycles}`;
    }

    if (UI.timer) {
      UI.timer.textContent =
        remaining.toFixed(1);
    }

    if (UI.ghosts) {
      UI.ghosts.textContent =
        recordings.length;
    }

    if (UI.score) {
      UI.score.textContent =
        formatScore(score);
    }

    if (UI.best) {
      UI.best.textContent =
        formatScore(
          storageCall(
            "getBestScore",
            levelIndex
          ) || 0
        );
    }

    const percentage = clamp(
      (remaining / duration) * 100,
      0,
      100
    );

    if (UI.timerBar) {
      UI.timerBar.style.width =
        `${percentage}%`;

      UI.timerBar.style.background =
        remaining < 2.5
          ? COLORS.red
          : COLORS.cyan;
    }

    const shiftDisabled =
      !running ||
      shiftUsed ||
      recordings.length === 0;

    if (UI.shiftBtn) {
      UI.shiftBtn.disabled =
        shiftDisabled;
    }

    if (UI.mobileShiftBtn) {
      UI.mobileShiftBtn.disabled =
        shiftDisabled;
    }
  }

  // ==================================================
  // 15. RECORDING
  // ==================================================

  function recordPlayer() {
    if (!player) return;

    currentRecording.push({
      t: Math.min(
        elapsed,
        getCycleDuration()
      ),
      x: player.x,
      y: player.y
    });
  }

  function positionAt(frames, time) {
    if (!frames?.length) {
      return {
        x: WORLD.start.x,
        y: WORLD.start.y
      };
    }

    if (time <= frames[0].t) {
      return {
        x: frames[0].x,
        y: frames[0].y
      };
    }

    const last =
      frames[frames.length - 1];

    if (time >= last.t) {
      return {
        x: last.x,
        y: last.y
      };
    }

    let low = 0;
    let high = frames.length - 1;

    while (low + 1 < high) {
      const middle =
        (low + high) >> 1;

      if (frames[middle].t <= time) {
        low = middle;
      } else {
        high = middle;
      }
    }

    const a = frames[low];
    const b = frames[high];

    const factor = clamp(
      (time - a.t) /
        Math.max(
          0.00001,
          b.t - a.t
        ),
      0,
      1
    );

    return {
      x: a.x + (b.x - a.x) * factor,
      y: a.y + (b.y - a.y) * factor
    };
  }

  function updateGhosts() {
    ghosts = recordings.map(
      frames => positionAt(
        frames,
        elapsed
      )
    );
  }

  // ==================================================
  // 16. PARADOX SHIFT
  // ==================================================

  function paradoxShift() {
    if (!running) return false;

    if (
      shiftUsed ||
      recordings.length === 0
    ) {
      playSound("error");

      setStatus(
        "PARADOX SHIFT INDISPONÍVEL."
      );

      return false;
    }

    const duration = getCycleDuration();

    const index =
      recordings.length - 1;

    const frames =
      recordings[index];

    const position =
      positionAt(frames, elapsed);

    const past = frames.filter(
      frame => frame.t < elapsed
    );

    past.push({
      t: elapsed,
      x: position.x,
      y: position.y
    });

    past.push({
      t: duration,
      x: position.x,
      y: position.y
    });

    recordings[index] = past;

    shiftUsed = true;
    shifts++;

    storageCall("registerShift");

    updateGhosts();
    updateDoor();

    emitParticles(
      position.x,
      position.y,
      COLORS.purple,
      40
    );

    emitEvent("shift", {
      x: position.x,
      y: position.y,
      shifts
    });

    playSound("shift");

    setStatus(
      "PARADOX SHIFT: FUTURO DO ECO ALTERADO!"
    );

    updateHUD();

    return true;
  }

  // ==================================================
  // 17. TEMPORAL PLATES
  // ==================================================

  function isPlateActive(plate) {
    if (
      player &&
      distance(player, plate) <
        PLATE_RADIUS
    ) {
      return true;
    }

    return ghosts.some(
      ghost =>
        distance(ghost, plate) <
        PLATE_RADIUS
    );
  }

  function updateDoor() {
    doorOpen = (
      level.plates || []
    ).every(isPlateActive);

    if (
      doorOpen !== previousDoorState
    ) {
      if (doorOpen) {
        playSound("door");

        emitParticles(
          WORLD.door.x +
            WORLD.door.w / 2,
          WORLD.door.y +
            WORLD.door.h / 2,
          COLORS.green,
          25
        );

        emitEvent("dooropen");

        setStatus(
          "PORTA TEMPORAL ABERTA!"
        );
      } else {
        emitEvent("doorclosed");
      }
    }

    previousDoorState = doorOpen;
  }

  // ==================================================
  // 18. PHASE WALLS
  // ==================================================

  function isPhaseWallActive(wall) {
    if (
      typeof window.isPhaseWallActive ===
      "function"
    ) {
      return window.isPhaseWallActive(
        wall,
        worldTime
      );
    }

    const period =
      Number(wall.period) || 3;

    const on =
      Number(wall.on) ||
      period / 2;

    const offset =
      Number(wall.offset) || 0;

    const phase =
      ((worldTime + offset) % period +
        period) % period;

    return phase < on;
  }

  function isBlocked(x, y) {
    const rect = playerRect(x, y);

    for (
      const wall of WORLD.walls || []
    ) {
      if (intersects(rect, wall)) {
        return true;
      }
    }

    if (
      !doorOpen &&
      intersects(rect, WORLD.door)
    ) {
      return true;
    }

    for (
      const wall of level.phaseWalls || []
    ) {
      if (
        isPhaseWallActive(wall) &&
        intersects(rect, wall)
      ) {
        return true;
      }
    }

    return false;
  }

  // ==================================================
  // 19. PLAYER MOVEMENT
  // ==================================================

  function updatePlayer(dt) {
    let dx = 0;
    let dy = 0;

    if (isDirectionPressed("up")) {
      dy--;
    }

    if (isDirectionPressed("down")) {
      dy++;
    }

    if (isDirectionPressed("left")) {
      dx--;
    }

    if (isDirectionPressed("right")) {
      dx++;
    }

    const length = Math.hypot(dx, dy);

    if (length === 0) return;

    dx /= length;
    dy /= length;

    if (!firstMoveEmitted) {
      firstMoveEmitted = true;

      emitEvent("firstmove", {
        x: player.x,
        y: player.y
      });
    }

    const nextX = clamp(
      player.x +
        dx * player.speed * dt,
      PLAYER_SIZE / 2,
      WIDTH - PLAYER_SIZE / 2
    );

    if (!isBlocked(nextX, player.y)) {
      player.x = nextX;
    }

    const nextY = clamp(
      player.y +
        dy * player.speed * dt,
      PLAYER_SIZE / 2,
      HEIGHT - PLAYER_SIZE / 2
    );

    if (!isBlocked(player.x, nextY)) {
      player.y = nextY;
    }
  }

  // ==================================================
  // 20. PORTALS
  // ==================================================

  function getPortalPoints(portal) {
    const a = portal.a || {
      x: portal.x,
      y: portal.y
    };

    const b = portal.b || {
      x: portal.targetX,
      y: portal.targetY
    };

    return { a, b };
  }

  function updatePortals(dt) {
    portalCooldown = Math.max(
      0,
      portalCooldown - dt
    );

    if (portalCooldown > 0) {
      return;
    }

    for (
      const portal of level.portals || []
    ) {
      const { a, b } =
        getPortalPoints(portal);

      let destination = null;

      if (
        distance(player, a) < 19
      ) {
        destination = b;
      } else if (
        distance(player, b) < 19
      ) {
        destination = a;
      }

      if (!destination) continue;

      player.x = destination.x;
      player.y = destination.y;

      portalCooldown = 1;

      storageCall("registerPortal");

      emitParticles(
        player.x,
        player.y,
        COLORS.blue,
        30
      );

      emitEvent("portal", {
        x: player.x,
        y: player.y
      });

      playSound("portal");

      setStatus(
        "SALTO QUÂNTICO EXECUTADO!"
      );

      return;
    }
  }

  // ==================================================
  // 21. LASERS
  // ==================================================

  function isLaserActive(laser) {
    const period =
      Number(laser.period) || 2;

    const on =
      Number(laser.on) ||
      period / 2;

    const offset =
      Number(laser.offset) || 0;

    const phase =
      ((worldTime + offset) % period +
        period) % period;

    return phase < on;
  }

  function getLaserPosition(laser) {
    if (
      typeof window.getLaserPosition ===
      "function"
    ) {
      const result =
        window.getLaserPosition(
          laser,
          worldTime
        );

      if (result) return result;
    }

    const baseX = Number(
      laser.x ??
      (
        (Number(laser.x1) +
          Number(laser.x2)) / 2
      )
    );

    const baseY = Number(
      laser.y ??
      (
        (Number(laser.y1) +
          Number(laser.y2)) / 2
      )
    );

    const moving = Boolean(
      laser.moving
    );

    const range =
      Number(laser.movementRange) || 0;

    const speed =
      Number(laser.movementSpeed) || 1;

    const phase =
      Number(laser.movementPhase) || 0;

    const displacement = moving
      ? Math.sin(
          worldTime * speed + phase
        ) * range
      : 0;

    const horizontal =
      laser.movementAxis === "x";

    return {
      x: baseX +
        (horizontal ? displacement : 0),

      y: baseY +
        (!horizontal ? displacement : 0)
    };
  }

  function getLaserSegment(laser) {
    const position =
      getLaserPosition(laser);

    const baseX =
      Number(laser.x) ||
      (
        Number(laser.x1) +
        Number(laser.x2)
      ) / 2;

    const baseY =
      Number(laser.y) ||
      (
        Number(laser.y1) +
        Number(laser.y2)
      ) / 2;

    if (
      Number.isFinite(laser.x1) &&
      Number.isFinite(laser.y1) &&
      Number.isFinite(laser.x2) &&
      Number.isFinite(laser.y2)
    ) {
      const dx =
        position.x - baseX;

      const dy =
        position.y - baseY;

      return {
        x1: laser.x1 + dx,
        y1: laser.y1 + dy,
        x2: laser.x2 + dx,
        y2: laser.y2 + dy
      };
    }

    return {
      x1: position.x,
      y1: 80,
      x2: position.x,
      y2: 420
    };
  }

  function distanceToSegment(
    px,
    py,
    segment
  ) {
    const vx =
      segment.x2 - segment.x1;

    const vy =
      segment.y2 - segment.y1;

    const wx =
      px - segment.x1;

    const wy =
      py - segment.y1;

    const lengthSquared =
      vx * vx + vy * vy;

    const t = lengthSquared > 0
      ? clamp(
          (wx * vx + wy * vy) /
            lengthSquared,
          0,
          1
        )
      : 0;

    const closestX =
      segment.x1 + t * vx;

    const closestY =
      segment.y1 + t * vy;

    return Math.hypot(
      px - closestX,
      py - closestY
    );
  }

  function isLaserHit(laser) {
    if (!isLaserActive(laser)) {
      return false;
    }

    const segment =
      getLaserSegment(laser);

    const width =
      Number(laser.width) || 5;

    return distanceToSegment(
      player.x,
      player.y,
      segment
    ) < PLAYER_SIZE / 2 +
        width / 2;
  }

  function checkLasers() {
    for (
      const laser of level.lasers || []
    ) {
      if (!isLaserHit(laser)) {
        continue;
      }

      killPlayer("laser");

      return true;
    }

    return false;
  }

  // ==================================================
  // 22. TEMPORAL PLATFORMS
  // ==================================================

  function isPlatformActive(platform) {
    if (
      typeof window.isTemporalPlatformActive ===
      "function"
    ) {
      return window.isTemporalPlatformActive(
        platform,
        worldTime
      );
    }

    const period =
      Number(platform.period) || 3;

    const on =
      Number(platform.on) ||
      period / 2;

    const phase =
      worldTime +
      (Number(platform.offset) || 0);

    return (
      ((phase % period) + period) %
      period
    ) < on;
  }

  function updatePlatforms() {
    const platforms =
      level.temporalPlatforms || [];

    platforms.forEach(
      (platform, index) => {
        const id =
          platform.id || index;

        const inside = intersects(
          playerRect(
            player.x,
            player.y
          ),
          platform
        );

        if (!inside) {
          touchedPlatforms.delete(id);
          return;
        }

        if (!touchedPlatforms.has(id)) {
          touchedPlatforms.add(id);

          emitEvent("platformtouch", {
            platform: id
          });
        }

        if (
          !isPlatformActive(platform)
        ) {
          killPlayer("platform");
        }
      }
    );
  }

  // ==================================================
  // 23. ECHO TRAPS
  // ==================================================

  function updateTraps() {
    const traps =
      level.echoTraps || [];

    traps.forEach((trap, index) => {
      const id =
        trap.id || index;

      if (triggeredTraps.has(id)) {
        return;
      }

      const radius =
        Number(trap.radius) || 22;

      const activatedByGhost =
        ghosts.some(
          ghost =>
            distance(ghost, trap) <
            radius
        );

      const activatedByPlayer =
        distance(player, trap) <
        radius;

      if (
        !activatedByGhost &&
        !activatedByPlayer
      ) {
        return;
      }

      triggeredTraps.add(id);

      emitEvent("traptrigger", {
        trap: id
      });

      playSound("trapTrigger");

      emitParticles(
        trap.x,
        trap.y,
        COLORS.red,
        20
      );

      if (activatedByPlayer) {
        killPlayer("trap");
      }
    });
  }

  // ==================================================
  // 24. PLAYER DEATH
  // ==================================================

  function killPlayer(reason) {
    if (!running) return;

    deaths++;

    storageCall("registerDeath");

    score = Math.max(
      0,
      score - 150
    );

    emitParticles(
      player.x,
      player.y,
      COLORS.red,
      40
    );

    emitEvent("death", {
      x: player.x,
      y: player.y,
      deaths,
      reason
    });

    playSound(
      reason === "laser"
        ? "laser"
        : "death"
    );

    endCycle(true);
  }

  // ==================================================
  // 25. END CYCLE
  // ==================================================

  function endCycle(died = false) {
    if (!running) return;

    const duration =
      getCycleDuration();

    if (died) {
      currentRecording.push({
        t: Math.min(
          elapsed,
          duration
        ),
        x: WORLD.start.x,
        y: WORLD.start.y
      });
    }

    currentRecording.push({
      t: duration,
      x: died
        ? WORLD.start.x
        : player.x,
      y: died
        ? WORLD.start.y
        : player.y
    });

    recordings.push(
      currentRecording
    );

    storageCall("registerCycle");

    if (
      cycle >= getMaxCycles()
    ) {
      finishGame(false);
      return;
    }

    cycle++;

    elapsed = 0;
    portalCooldown = 0;
    lastTickSecond = null;
    criticalEmitted = false;

    player.x = WORLD.start.x;
    player.y = WORLD.start.y;

    currentRecording = [{
      t: 0,
      x: player.x,
      y: player.y
    }];

    triggeredTraps.clear();
    touchedPlatforms.clear();

    updateGhosts();
    updateDoor();

    emitParticles(
      player.x,
      player.y,
      COLORS.purple,
      30
    );

    emitEvent("echo", {
      cycle,
      echoes: recordings.length
    });

    emitEvent("cyclestart", {
      cycle
    });

    playSound("echo");

    setStatus(
      `CICLO ${cycle}: ` +
      `${recordings.length} ECOS ACTIVOS.`
    );
  }

  // ==================================================
  // 26. GOAL
  // ==================================================

  function checkGoal() {
    if (
      intersects(
        playerRect(
          player.x,
          player.y
        ),
        WORLD.goal
      )
    ) {
      finishGame(true);
    }
  }

  // ==================================================
  // 27. FINISH GAME
  // ==================================================

  function finishGame(won) {
    if (finished) return;

    running = false;
    finished = true;

    clearAllMovement();

    if (won) {
      const cycleBonus =
        (
          getMaxCycles() -
          cycle + 1
        ) * 1000;

      const timeBonus =
        Math.floor(
          (
            getCycleDuration() -
            elapsed
          ) * 100
        );

      const survivalBonus =
        Math.max(
          0,
          1000 - deaths * 250
        );

      score +=
        2000 +
        cycleBonus +
        timeBonus +
        survivalBonus;

      storageCall(
        "win",
        levelIndex,
        score
      );

      playSound("win");

      emitEvent("win", {
        score,
        cycle,
        deaths,
        shifts
      });

      if (UI.overlayTitle) {
        UI.overlayTitle.textContent =
          "PARADOXO RESOLVIDO";
      }

      if (UI.overlayMessage) {
        UI.overlayMessage.textContent =
          `Nível ${levelIndex + 1} concluído! ` +
          `Ciclo ${cycle}, ` +
          `${recordings.length} ecos, ` +
          `${deaths} falhas e ` +
          `${shifts} Paradox Shifts.`;
      }

      if (UI.nextBtn) {
        UI.nextBtn.style.display =
          levelIndex <
          LEVELS.length - 1
            ? "inline-block"
            : "none";
      }

      setStatus(
        "SIMULAÇÃO CONCLUÍDA COM SUCESSO!"
      );
    } else {
      playSound("fail");

      emitEvent("lose", {
        score,
        cycle,
        deaths
      });

      if (UI.overlayTitle) {
        UI.overlayTitle.textContent =
          "SYSTEM FAILURE";
      }

      if (UI.overlayMessage) {
        UI.overlayMessage.textContent =
          "Os ciclos terminaram. " +
          "Reorganiza os ecos e tenta novamente.";
      }

      if (UI.nextBtn) {
        UI.nextBtn.style.display =
          "none";
      }

      setStatus(
        "COLAPSO TEMPORAL DETECTADO."
      );
    }

    if (UI.finalScore) {
      UI.finalScore.textContent =
        `${formatScore(score)} PONTOS`;
    }

    UI.overlay?.classList.remove(
      "hidden"
    );

    if (UI.startBtn) {
      UI.startBtn.textContent =
        "JOGAR NOVAMENTE";
    }

    buildLevelMenu();
    updateHUD();
  }

  // ==================================================
  // 28. DRAW HELPERS
  // ==================================================

  function glowRect(
    x,
    y,
    width,
    height,
    color,
    blur = 15
  ) {
    ctx.save();

    ctx.fillStyle = color;
    ctx.shadowColor = color;
    ctx.shadowBlur = blur;

    ctx.fillRect(
      x,
      y,
      width,
      height
    );

    ctx.restore();
  }

  function getThemeColor(
    key,
    fallback
  ) {
    const theme = getVisualTheme();

    const value = theme[key];

    if (typeof value === "string") {
      return value;
    }

    if (typeof value === "number") {
      return (
        "#" +
        value.toString(16).padStart(
          6,
          "0"
        )
      );
    }

    return fallback;
  }

  // ==================================================
  // 29. FALLBACK GRID
  // ==================================================

  function drawGrid() {
    ctx.save();

    ctx.strokeStyle =
      getThemeColor(
        "grid",
        "#19243d"
      );

    ctx.globalAlpha = 0.6;
    ctx.lineWidth = 1;

    for (
      let x = 0;
      x <= WIDTH;
      x += 40
    ) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, HEIGHT);
      ctx.stroke();
    }

    for (
      let y = 0;
      y <= HEIGHT;
      y += 40
    ) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(WIDTH, y);
      ctx.stroke();
    }

    ctx.restore();
  }

  // ==================================================
  // 30. WALLS AND DOOR
  // ==================================================

  function drawWalls() {
    const wallColor =
      getThemeColor(
        "secondary",
        "#35415e"
      );

    ctx.save();

    for (
      const wall of WORLD.walls || []
    ) {
      ctx.fillStyle = "#101b2a";

      ctx.fillRect(
        wall.x,
        wall.y,
        wall.w,
        wall.h
      );

      ctx.strokeStyle = wallColor;
      ctx.lineWidth = 2;

      ctx.strokeRect(
        wall.x,
        wall.y,
        wall.w,
        wall.h
      );

      ctx.fillStyle = wallColor;
      ctx.globalAlpha = 0.18;

      ctx.fillRect(
        wall.x + 3,
        wall.y + 3,
        Math.max(0, wall.w - 6),
        Math.max(0, wall.h - 6)
      );

      ctx.globalAlpha = 1;
    }

    ctx.restore();

    const door = WORLD.door;

    if (doorOpen) {
      ctx.save();

      ctx.strokeStyle =
        COLORS.green;

      ctx.lineWidth = 2;

      ctx.setLineDash([6, 6]);

      ctx.strokeRect(
        door.x,
        door.y,
        door.w,
        door.h
      );

      ctx.restore();
    } else {
      glowRect(
        door.x,
        door.y,
        door.w,
        door.h,
        COLORS.red,
        18
      );
    }
  }

  // ==================================================
  // 31. PHASE WALLS
  // ==================================================

  function drawPhaseWalls() {
    for (
      const wall of
      level.phaseWalls || []
    ) {
      const active =
        isPhaseWallActive(wall);

      ctx.save();

      ctx.globalAlpha =
        active ? 0.85 : 0.15;

      ctx.fillStyle =
        getThemeColor(
          "primary",
          COLORS.purple
        );

      ctx.shadowColor =
        COLORS.purple;

      ctx.shadowBlur =
        active ? 15 : 0;

      ctx.fillRect(
        wall.x,
        wall.y,
        wall.w,
        wall.h
      );

      ctx.restore();
    }
  }

  // ==================================================
  // 32. PLATES
  // ==================================================

  function drawPlates() {
    (
      level.plates || []
    ).forEach((plate, index) => {
      const active =
        isPlateActive(plate);

      const color = active
        ? COLORS.green
        : COLORS.yellow;

      ctx.save();

      ctx.strokeStyle = color;
      ctx.fillStyle = color;
      ctx.shadowColor = color;
      ctx.shadowBlur = 15;
      ctx.lineWidth = 3;

      ctx.beginPath();

      ctx.arc(
        plate.x,
        plate.y,
        24,
        0,
        Math.PI * 2
      );

      ctx.stroke();

      ctx.beginPath();

      ctx.arc(
        plate.x,
        plate.y,
        10,
        0,
        Math.PI * 2
      );

      ctx.fill();

      ctx.restore();

      ctx.save();

      ctx.fillStyle =
        COLORS.white;

      ctx.font =
        "11px monospace";

      ctx.textAlign =
        "center";

      ctx.fillText(
        `PLACA ${index + 1}`,
        plate.x,
        plate.y - 36
      );

      ctx.restore();
    });
  }

  // ==================================================
  // 33. LASERS
  // ==================================================

  function drawLasers() {
    for (
      const laser of
      level.lasers || []
    ) {
      const active =
        isLaserActive(laser);

      const segment =
        getLaserSegment(laser);

      ctx.save();

      ctx.beginPath();

      ctx.moveTo(
        segment.x1,
        segment.y1
      );

      ctx.lineTo(
        segment.x2,
        segment.y2
      );

      ctx.strokeStyle = active
        ? COLORS.red
        : "#50233a";

      ctx.lineWidth = active
        ? 5
        : 2;

      ctx.shadowColor =
        COLORS.red;

      ctx.shadowBlur = active
        ? 20
        : 0;

      ctx.stroke();

      ctx.restore();

      glowRect(
        segment.x1 - 8,
        segment.y1 - 8,
        16,
        16,
        active
          ? COLORS.red
          : "#71324a",
        8
      );

      glowRect(
        segment.x2 - 8,
        segment.y2 - 8,
        16,
        16,
        active
          ? COLORS.red
          : "#71324a",
        8
      );
    }
  }

  // ==================================================
  // 34. PORTALS
  // ==================================================

  function drawPortals() {
    for (
      const portal of
      level.portals || []
    ) {
      const { a, b } =
        getPortalPoints(portal);

      for (const point of [a, b]) {
        const radius =
          15 +
          Math.sin(
            worldTime * 5
          ) * 3;

        ctx.save();

        ctx.beginPath();

        ctx.arc(
          point.x,
          point.y,
          radius,
          0,
          Math.PI * 2
        );

        ctx.strokeStyle =
          COLORS.blue;

        ctx.lineWidth = 4;

        ctx.shadowColor =
          COLORS.blue;

        ctx.shadowBlur = 18;

        ctx.stroke();

        ctx.restore();
      }
    }
  }

  // ==================================================
  // 35. PLATFORMS
  // ==================================================

  function drawPlatforms() {
    for (
      const platform of
      level.temporalPlatforms || []
    ) {
      const active =
        isPlatformActive(platform);

      ctx.save();

      ctx.fillStyle = active
        ? "rgba(0,245,255,0.16)"
        : "rgba(255,56,104,0.08)";

      ctx.strokeStyle = active
        ? COLORS.cyan
        : COLORS.red;

      ctx.lineWidth = 2;

      ctx.setLineDash(
        active ? [] : [5, 5]
      );

      ctx.fillRect(
        platform.x,
        platform.y,
        platform.w,
        platform.h
      );

      ctx.strokeRect(
        platform.x,
        platform.y,
        platform.w,
        platform.h
      );

      ctx.restore();
    }
  }

  // ==================================================
  // 36. TRAPS
  // ==================================================

  function drawTraps() {
    (
      level.echoTraps || []
    ).forEach((trap, index) => {
      const id =
        trap.id || index;

      const triggered =
        triggeredTraps.has(id);

      const radius =
        Number(trap.radius) || 22;

      ctx.save();

      ctx.beginPath();

      ctx.arc(
        trap.x,
        trap.y,
        radius,
        0,
        Math.PI * 2
      );

      ctx.strokeStyle =
        triggered
          ? COLORS.red
          : COLORS.purple;

      ctx.lineWidth = 2;

      ctx.setLineDash([4, 4]);

      ctx.shadowColor =
        COLORS.red;

      ctx.shadowBlur =
        triggered ? 18 : 5;

      ctx.stroke();

      ctx.restore();
    });
  }

  // ==================================================
  // 37. GOAL
  // ==================================================

  function drawGoal() {
    const goal = WORLD.goal;

    glowRect(
      goal.x,
      goal.y,
      goal.w,
      goal.h,
      COLORS.green,
      22
    );

    ctx.fillStyle = "#083324";

    ctx.fillRect(
      goal.x + 10,
      goal.y + 10,
      goal.w - 20,
      goal.h - 20
    );

    ctx.save();

    ctx.fillStyle =
      COLORS.green;

    ctx.font =
      "12px monospace";

    ctx.textAlign =
      "center";

    ctx.fillText(
      "SAÍDA",
      goal.x + goal.w / 2,
      goal.y - 15
    );

    ctx.restore();
  }

  // ==================================================
  // 38. GHOSTS
  // ==================================================

  function drawGhosts() {
    ghosts.forEach(
      (ghost, index) => {
        ctx.save();

        ctx.globalAlpha =
          0.5 +
          Math.sin(
            worldTime * 7 +
            index
          ) * 0.12;

        glowRect(
          ghost.x - 10,
          ghost.y - 10,
          20,
          20,
          COLORS.purple,
          16
        );

        ctx.restore();
      }
    );
  }

  // ==================================================
  // 39. PLAYER
  // ==================================================

  function drawPlayer() {
    if (
      !player ||
      isOperatorRendererActive()
    ) {
      return;
    }

    glowRect(
      player.x - 10,
      player.y - 10,
      20,
      20,
      COLORS.cyan,
      20
    );

    ctx.fillStyle =
      "#ffffff";

    ctx.fillRect(
      player.x - 4,
      player.y - 4,
      8,
      8
    );
  }

  // ==================================================
  // 40. PARTICLES
  // ==================================================

  function drawParticles() {
    for (
      const particle of particles
    ) {
      ctx.save();

      ctx.globalAlpha = clamp(
        particle.life /
          particle.maxLife,
        0,
        1
      );

      ctx.fillStyle =
        particle.color;

      ctx.fillRect(
        particle.x,
        particle.y,
        particle.size,
        particle.size
      );

      ctx.restore();
    }
  }

  // ==================================================
  // 41. ARENA LABELS
  // ==================================================

  function drawLabels() {
    ctx.save();

    ctx.fillStyle =
      getThemeColor(
        "accent",
        "#7083a4"
      );

    ctx.globalAlpha = 0.75;

    ctx.font =
      "12px monospace";

    ctx.textAlign =
      "left";

    ctx.fillText(
      `SECTOR ${String(
        levelIndex + 1
      ).padStart(2, "0")} // ` +
      String(
        getVisualTheme().id ||
        "PARADOX"
      ).toUpperCase(),
      20,
      25
    );

    ctx.textAlign =
      "right";

    ctx.fillText(
      `LEVEL ${String(
        levelIndex + 1
      ).padStart(2, "0")}`,
      WIDTH - 20,
      25
    );

    ctx.restore();
  }

  // ==================================================
  // 42. MAIN RENDER
  // ==================================================

  function draw() {
    // Clear the 2D canvas.
    ctx.clearRect(
      0,
      0,
      WIDTH,
      HEIGHT
    );

    const pixiActive =
      isWorldRendererActive();

    // Only draw the old background
    // when PixiJS is unavailable.
    if (!pixiActive) {
      const theme =
        getVisualTheme();

      const background =
        theme.background ||
        theme.backgroundColor ||
        COLORS.dark;

      ctx.fillStyle =
        typeof background === "string"
          ? background
          : COLORS.dark;

      ctx.fillRect(
        0,
        0,
        WIDTH,
        HEIGHT
      );

      drawGrid();
    }

    // Gameplay objects stay on Canvas 2D.
    drawLabels();
    drawWalls();
    drawPhaseWalls();
    drawPlatforms();
    drawPlates();
    drawLasers();
    drawPortals();
    drawTraps();
    drawGoal();
    drawGhosts();
    drawPlayer();
    drawParticles();
  }

  // ==================================================
  // 43. COUNTDOWN
  // ==================================================

  function updateCountdown() {
    const remaining =
      getCycleDuration() -
      elapsed;

    if (
      remaining <= 2.5 &&
      !criticalEmitted
    ) {
      criticalEmitted = true;

      emitEvent("timecritical", {
        remaining
      });
    }

    const second =
      Math.ceil(remaining);

    if (
      second <= 3 &&
      second > 0 &&
      second !== lastTickSecond
    ) {
      lastTickSecond = second;
      playSound("tick");
    }
  }

  // ==================================================
  // 44. MAIN LOOP
  // ==================================================

  function gameLoop(timestamp) {
    if (!running) return;

    if (!lastFrame) {
      lastFrame = timestamp;
    }

    const dt = clamp(
      (
        timestamp -
        lastFrame
      ) / 1000,
      0,
      0.05
    );

    lastFrame = timestamp;

    elapsed += dt;
    worldTime += dt;

    updateGhosts();
    updateDoor();

    updatePlayer(dt);
    updatePortals(dt);

    updateDoor();

    recordPlayer();
    updateParticles(dt);
    updateCountdown();

    let died = checkLasers();

    if (!died && running) {
      const previousCycle = cycle;

      updatePlatforms();

      died = (
        cycle !== previousCycle ||
        !running
      );
    }

    if (!died && running) {
      const previousCycle = cycle;

      updateTraps();

      died = (
        cycle !== previousCycle ||
        !running
      );
    }

    if (!died && running) {
      checkGoal();
    }

    if (
      running &&
      elapsed >= getCycleDuration()
    ) {
      endCycle();
    }

    updateHUD();
    draw();

    if (running) {
      animationId =
        requestAnimationFrame(
          gameLoop
        );
    } else {
      animationId = null;
    }
  }

  // ==================================================
  // 45. KEYBOARD
  // ==================================================

  window.addEventListener(
    "keydown",
    event => {
      const key =
        event.key.toLowerCase();

      const target =
        event.target;

      const typing =
        target instanceof HTMLElement &&
        (
          target.isContentEditable ||
          ["INPUT", "TEXTAREA", "SELECT"]
            .includes(target.tagName)
        );

      if (typing) return;

      if (
        key.startsWith("arrow") ||
        key === " "
      ) {
        event.preventDefault();
      }

      if (
        key === "r" &&
        !event.repeat
      ) {
        startGame();
        return;
      }

      if (
        key === "e" &&
        !event.repeat
      ) {
        paradoxShift();
        return;
      }

      if (
        key === " " &&
        !running &&
        !event.repeat
      ) {
        startGame();
        return;
      }

      if (
        movementKeys.has(key)
      ) {
        keys.add(key);
      }
    }
  );

  window.addEventListener(
    "keyup",
    event => {
      keys.delete(
        event.key.toLowerCase()
      );
    }
  );

  window.addEventListener(
    "blur",
    () => {
      clearAllMovement();
      lastFrame = 0;
    }
  );

  document.addEventListener(
    "visibilitychange",
    () => {
      if (document.hidden) {
        clearAllMovement();
        lastFrame = 0;
      }
    }
  );

  // ==================================================
  // 46. MOBILE CONTROLS
  // ==================================================

  function setupMobileControls() {
    for (
      const [direction, button]
      of Object.entries(
        mobileDirections
      )
    ) {
      if (!button) continue;

      button.style.touchAction =
        "none";

      button.addEventListener(
        "pointerdown",
        event => {
          if (!running) return;

          event.preventDefault();

          try {
            button.setPointerCapture(
              event.pointerId
            );
          } catch (_) {}

          mobilePointers.set(
            event.pointerId,
            direction
          );

          refreshMobileButtons();
        }
      );

      const releasePointer = event => {
        if (
          !mobilePointers.has(
            event.pointerId
          )
        ) {
          return;
        }

        mobilePointers.delete(
          event.pointerId
        );

        refreshMobileButtons();
      };

      button.addEventListener(
        "pointerup",
        releasePointer
      );

      button.addEventListener(
        "pointercancel",
        releasePointer
      );

      button.addEventListener(
        "lostpointercapture",
        releasePointer
      );

      button.addEventListener(
        "contextmenu",
        event => event.preventDefault()
      );
    }

    UI.mobileShiftBtn
      ?.addEventListener(
        "click",
        paradoxShift
      );

    UI.mobileRestartBtn
      ?.addEventListener(
        "click",
        startGame
      );
  }

  // ==================================================
  // 47. BUTTONS
  // ==================================================

  UI.startBtn?.addEventListener(
    "click",
    startGame
  );

  UI.restartBtn?.addEventListener(
    "click",
    startGame
  );

  UI.playAgainBtn?.addEventListener(
    "click",
    startGame
  );

  UI.shiftBtn?.addEventListener(
    "click",
    paradoxShift
  );

  UI.nextBtn?.addEventListener(
    "click",
    () => {
      const nextIndex =
        levelIndex + 1;

      if (
        nextIndex < LEVELS.length &&
        selectLevel(nextIndex)
      ) {
        startGame();
      }
    }
  );

  UI.soundBtn?.addEventListener(
    "click",
    () => {
      const enabled =
        window.GameAudio?.toggle?.();

      UI.soundBtn.textContent =
        enabled
          ? "SOM: ON"
          : "SOM: OFF";
    }
  );

  // ==================================================
  // 48. WORLD RENDERER EVENTS
  // ==================================================

  window.addEventListener(
    "echo404:worldthemechange",
    () => {
      // Redraw the gameplay layer
      // after the PixiJS theme changes.
      if (!running) {
        draw();
      }
    }
  );

  // ==================================================
  // 49. INITIALIZATION
  // ==================================================

  function initialize() {
    if (UI.soundBtn) {
      const enabled =
        window.GameAudio
          ?.isEnabled?.() ??
        true;

      UI.soundBtn.textContent =
        enabled
          ? "SOM: ON"
          : "SOM: OFF";
    }

    setupMobileControls();

    applyLevelTheme();
    resetGame();
    buildLevelMenu();

    console.log(
      "=================================="
    );

    console.log(
      "ECHO//404 — PARADOX EVOLUTION"
    );

    console.log(
      "VERSION 3.1 — WORLD INTEGRATION"
    );

    console.log(
      `${LEVELS.length} LEVELS LOADED`
    );

    console.log(
      "PIXIJS WORLD RENDERER COMPATIBLE"
    );

    console.log(
      "TEMPORAL ECHOES / PARADOX SHIFT READY"
    );

    console.log(
      "DESKTOP + MOBILE CONTROLS READY"
    );

    console.log(
      "CREATED & DEVELOPED BY MANUEL SAMPAIO01"
    );

    console.log(
      "=================================="
    );
  }

  initialize();

})();

/*
========================================================
 ECHO//404 — PARADOX EVOLUTION
 GAME ENGINE v3.1 — WORLD INTEGRATION

 CREATED & DEVELOPED BY MANUEL SAMPAIO01
 © 2026 MANUEL SAMPAIO01
========================================================
*/
