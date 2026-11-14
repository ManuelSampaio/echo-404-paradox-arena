
"use strict";

/*
====================================================
 ECHO//404 — PARADOX EVOLUTION
 GAME ENGINE v4.2

 TEMPORAL ECHOES / PARADOX SHIFT
 10 LEVELS / PIXIJS WORLD INTEGRATION
 DESKTOP + MOBILE

 CREATED & DEVELOPED BY MANUEL SAMPAIO01
 © 2026 MANUEL SAMPAIO01
====================================================
*/

(() => {
  const VERSION = "8.0";

  // ================================================
  // CANVAS AND DEPENDENCIES
  // ================================================

  const canvas = document.getElementById("gameCanvas");

  if (!canvas) {
    throw new Error("ECHO//404: #gameCanvas not found");
  }

  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("ECHO//404: Canvas 2D unavailable");
  }

  if (
    typeof GAME_WORLD === "undefined" ||
    typeof GAME_LEVELS === "undefined"
  ) {
    throw new Error(
      "ECHO//404: Load levels.js before game.js"
    );
  }

  const WORLD = GAME_WORLD;
  const LEVELS = GAME_LEVELS;

  const WIDTH = WORLD.width || 800;
  const HEIGHT = WORLD.height || 500;

  const PLAYER_SIZE = 20;
  const PLAYER_SPEED = WORLD.player?.speed || 230;
  const PLATE_RADIUS = 27;

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

  canvas.width = WIDTH;
  canvas.height = HEIGHT;

  // ================================================
  // USER INTERFACE
  // ================================================

  const $ = id => document.getElementById(id);

  const UI = {
    cycle: $("cycle"),
    timer: $("timer"),
    ghosts: $("ghosts"),
    score: $("score"),
    best: $("best"),
    timerBar: $("timerBar"),
    status: $("status"),
    levelGrid: $("levelGrid"),
    progress: $("progress"),
    levelName: $("levelName"),

    overlay: $("overlay"),
    overlayTitle: $("overlayTitle"),
    overlayMessage: $("overlayMessage"),
    finalScore: $("finalScore"),

    startBtn: $("startBtn"),
    restartBtn: $("restartBtn"),
    shiftBtn: $("shiftBtn"),
    soundBtn: $("soundBtn"),
    playAgainBtn: $("playAgainBtn"),
    nextBtn: $("nextBtn"),

    mobileShiftBtn: $("mobileShiftBtn"),
    mobileRestartBtn: $("mobileRestartBtn"),

    moveUp: $("moveUp"),
    moveDown: $("moveDown"),
    moveLeft: $("moveLeft"),
    moveRight: $("moveRight")
  };

  // ================================================
  // UTILITIES
  // ================================================

  const clamp = (v, min, max) =>
    Math.max(min, Math.min(max, v));

  const distance = (a, b) =>
    Math.hypot(a.x - b.x, a.y - b.y);

  function intersects(a, b) {
    if (!a || !b) return false;

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
      console.warn("[ECHO//404] Audio:", error);
    }
  }

  function storageCall(method, ...args) {
    try {
      const storage = window.GameStorage;

      if (typeof storage?.[method] === "function") {
        return storage[method](...args);
      }
    } catch (error) {
      console.warn(
        `[ECHO//404] Storage ${method}:`,
        error
      );
    }

    return undefined;
  }

  // ================================================
  // GAME STATE
  // ================================================

  let levelIndex = 0;
  let level = LEVELS[0];

  // Per-sector geometry; retain GAME_WORLD as the legacy fallback.
  const arena = () => level?.arena || WORLD;

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
  let doorStates = [];
  let threatInvulnerability = 0;
  let shiftUsed = false;
  let relayAwarded = false;
  // Operator abilities: deterministic, short-lived, and reset per attempt.
  let abilityUntil = 0;
  let abilityCooldownUntil = 0;
  let overchargePlate = -1;
  let overchargeUntil = 0;
  function currentOperator() {
    let id = "";
    try { id = String(localStorage.getItem("echo404_operator") || "").toLowerCase(); } catch (_) {}
    return id.includes("nyra") ? "nyra" : id.includes("kai") ? "kai7" : "axiom";
  }
  function activateAbility() {
    if (!running || worldTime < abilityCooldownUntil) return false;
    const id = currentOperator();
    if (id === "kai7") {
      overchargePlate = (level.plates || []).findIndex(p => distance(player,p) < PLATE_RADIUS);
      if (overchargePlate < 0) { setStatus("KAI-7: APROXIMA-TE DE UMA PLACA."); return false; }
      overchargeUntil = worldTime + 3;
      setStatus("OVERCHARGE: PLACA ENERGIZADA POR 3s");
    } else {
      abilityUntil = worldTime + (id === "nyra" ? 0.9 : 2.5);
      setStatus(id === "nyra" ? "NYRA: DASH ATIVO!" : "AXIOM: PHASE WALK ATIVO!");
    }
    abilityCooldownUntil = worldTime + 9;
    emitEvent("ability",{operator:id,cycle});
    playSound("shift");
    return true;
  }


  // v9.0 experimental temporal mode. Legacy cycles remain the default.
  let freeExplore = false;
  let captureActive = false;
  let captureTime = 0;
  let freeEchoes = [];
  const CAPTURE_LIMIT = 8;
  const FREE_ECHO_LIMIT = 2;
  function toggleFreeExplore() {
    freeExplore = !freeExplore;
    startGame();
    setStatus(freeExplore ? "EXPLORAÇÃO LIVRE: grava até 8s e cria ecos." : "MODO CLÁSSICO: ciclos temporais ativos.");
    emitEvent("temporalmode",{freeExplore});
    return freeExplore;
  }
  function toggleCapture() {
    if (!freeExplore || !running) return false;
    if (captureActive) {
      captureActive = false;
      if (currentRecording.length > 1) {
        const frames = currentRecording.map(frame => ({...frame}));
        freeEchoes.push({frames,startedAt:worldTime});
        if (freeEchoes.length > FREE_ECHO_LIMIT) freeEchoes.shift();
        recordings = freeEchoes.map(e => e.frames);
        setStatus("ECO CRIADO! Usa-o para ativar mecanismos.");
        emitEvent("echo",{cycle,echoes:freeEchoes.length});
      }
      currentRecording = [];
      return true;
    }
    captureTime = 0;
    currentRecording = [{t:0,x:player.x,y:player.y}];
    captureActive = true;
    setStatus("GRAVAÇÃO TEMPORAL INICIADA (MÁX. 8s).");
    return true;
  }

  let portalCooldown = 0;
  let lastFrame = 0;
  let animationId = null;
  let lastTickSecond = null;

  let firstMoveEmitted = false;
  let criticalEmitted = false;

  let deathTriggered = false;

  const triggeredTraps = new Set();
  const touchedPlatforms = new Set();

  // ================================================
  // LEVEL CONFIGURATION
  // ================================================

  function getCycleDuration() {
    const duration = Number(level?.timeLimit);

    return Number.isFinite(duration) && duration > 0
      ? duration
      : WORLD.cycleDuration || 10;
  }

  function getMaxCycles() {
    const count = Number(level?.maxCycles);

    return Number.isFinite(count) && count > 0
      ? Math.floor(count)
      : WORLD.maxCycles || 6;
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

  function getThemeColor(key, fallback) {
    const value = getVisualTheme()[key];

    if (typeof value === "string") {
      return value;
    }

    if (typeof value === "number") {
      return "#" + value.toString(16).padStart(6, "0");
    }

    return fallback;
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

    if (typeof renderer?.setLevel === "function") {
      try {
        renderer.setLevel(levelIndex + 1);
      } catch (error) {
        console.warn(
          "[ECHO//404] World theme:",
          error
        );
      }
    }
  }

  function isWorldRendererActive() {
    try {
      return Boolean(
        window.EchoWorldRenderer
          ?.getState?.()
          ?.initialized
      );
    } catch (_) {
      return false;
    }
  }

  function isOperatorRendererActive() {
    const renderer =
      window.EchoVisualRebirthV30 ||
      window.EchoVisualRebirthV21;

    try {
      return Boolean(
        renderer?.shouldHideOriginalPlayer?.()
      );
    } catch (_) {
      return false;
    }
  }

  // ================================================
  // CONTROLS
  // ================================================

  const keys = new Set();
  const mobilePointers = new Map();

  const directionButtons = {
    up: UI.moveUp,
    down: UI.moveDown,
    left: UI.moveLeft,
    right: UI.moveRight
  };

  const keyboardDirections = {
    up: ["w", "arrowup"],
    down: ["s", "arrowdown"],
    left: ["a", "arrowleft"],
    right: ["d", "arrowright"]
  };

  function isDirectionPressed(direction) {
    return (
      keyboardDirections[direction].some(
        key => keys.has(key)
      ) ||
      [...mobilePointers.values()].includes(direction)
    );
  }

  function refreshMobileButtons() {
    for (const [direction, button] of
      Object.entries(directionButtons)) {

      button?.classList.toggle(
        "pressed",
        [...mobilePointers.values()].includes(direction)
      );
    }
  }

  function clearAllMovement() {
    keys.clear();
    mobilePointers.clear();
    refreshMobileButtons();
  }

  // ================================================
  // PARTICLES
  // ================================================

  function emitParticles(x, y, color, amount = 15) {
    for (let i = 0; i < amount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 30 + Math.random() * 120;
      const life = 0.3 + Math.random() * 0.6;

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
      particles.splice(0, particles.length - 300);
    }
  }

  function updateParticles(dt) {
    for (const p of particles) {
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life -= dt;
    }

    particles = particles.filter(p => p.life > 0);
  }

  // ================================================
  // LEVEL PROGRESSION
  // ================================================

  function isLevelCompleted(index) {
    const storage = window.GameStorage;

    if (typeof storage?.isCompleted === "function") {
      return Boolean(storageCall("isCompleted", index));
    }

    const data = storageCall("load") || {};
    return (data.completed || []).includes(index);
  }

  function isLevelUnlocked(index) {
    if (index === 0) return true;

    const storage = window.GameStorage;

    if (typeof storage?.isUnlocked === "function") {
      return Boolean(storageCall("isUnlocked", index));
    }

    const data = storageCall("load") || {};
    return index + 1 <= (data.unlocked || 1);
  }

  function buildLevelMenu() {
    if (UI.levelGrid) {
      UI.levelGrid.innerHTML = "";

      LEVELS.forEach((item, index) => {
        const button = document.createElement("button");

        const completed = isLevelCompleted(index);
        const unlocked = isLevelUnlocked(index);

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

        button.addEventListener("click", () => {
          if (selectLevel(index)) {
            playSound("click");
          }
        });

        UI.levelGrid.appendChild(button);
      });
    }

    const completedCount = LEVELS.filter(
      (_, index) => isLevelCompleted(index)
    ).length;

    if (UI.progress) {
      UI.progress.textContent =
        `${completedCount} / ${LEVELS.length} CONCLUÍDOS`;
    }

    if (UI.levelName) {
      UI.levelName.textContent =
        `NÍVEL ${levelIndex + 1} — ${level.name} | ` +
        `${level.difficulty || ""} | ${level.hint || ""}`;
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

  // ================================================
  // RESET AND START
  // ================================================

  function resetGame() {
    if (animationId !== null) {
      cancelAnimationFrame(animationId);
      animationId = null;
    }

    clearAllMovement();

    player = {
      x: arena().start.x,
      y: arena().start.y,
      size: PLAYER_SIZE,
      speed: PLAYER_SPEED
    };

    recordings = [];
    ghosts = [];
    freeEchoes = [];
    captureActive = false;
    captureTime = 0;

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
    doorStates = [];
    threatInvulnerability = 0;
    shiftUsed = false;
    relayAwarded = false;
    abilityUntil = 0; abilityCooldownUntil = 0;
    overchargePlate = -1; overchargeUntil = 0;

    portalCooldown = 0;
    lastFrame = 0;
    lastTickSecond = null;

    firstMoveEmitted = false;
    criticalEmitted = false;
    deathTriggered = false;

    triggeredTraps.clear();
    touchedPlatforms.clear();

    UI.overlay?.classList.add("hidden");

    if (UI.startBtn) {
      UI.startBtn.textContent = "INICIAR SIMULAÇÃO";
    }

    setStatus(level.hint || "");

    updateHUD();
    draw();
  }

  function startGame() {
    resetGame();

    running = true;

    storageCall("registerAttempt");

    emitEvent("start", {
      level,
      cycle
    });

    try {
      window.GameAudio?.init?.();
    } catch (_) {}

    playSound("start");

    if (UI.startBtn) {
      UI.startBtn.textContent = "REINICIAR SIMULAÇÃO";
    }

    setStatus(
      `NÍVEL ${levelIndex + 1}: ${level.hint || ""}`
    );

    updateHUD();

    animationId = requestAnimationFrame(gameLoop);

    return true;
  }

  // ================================================
  // HUD
  // ================================================

  function updateHUD() {
    const duration = getCycleDuration();
    const remaining = freeExplore ? Math.max(0,CAPTURE_LIMIT-captureTime) : Math.max(0,duration-elapsed);

    if (UI.cycle) {
      UI.cycle.textContent =
        `${cycle}/${getMaxCycles()}`;
    }

    if (UI.timer) {
      UI.timer.textContent = freeExplore ? (captureActive ? remaining.toFixed(1) : "LIVRE") : remaining.toFixed(1);
    }

    if (UI.ghosts) {
      UI.ghosts.textContent = recordings.length;
    }

    if (UI.score) {
      UI.score.textContent = formatScore(score);
    }

    if (UI.best) {
      UI.best.textContent = formatScore(
        storageCall("getBestScore", levelIndex) || 0
      );
    }

    if (UI.timerBar) {
      UI.timerBar.style.width =
        `${clamp(remaining / (freeExplore ? CAPTURE_LIMIT : duration) * 100, 0, 100)}%`;

      UI.timerBar.style.background =
        remaining < 2.5 ? COLORS.red : COLORS.cyan;
    }

    const shiftDisabled =
      !freeExplore && (!running ||
      shiftUsed ||
      recordings.length === 0);

    if (UI.shiftBtn) {
      UI.shiftBtn.disabled = shiftDisabled;
    }

    if (UI.mobileShiftBtn) {
      UI.mobileShiftBtn.disabled = shiftDisabled;
    }
  }

  // ================================================
  // TEMPORAL RECORDING
  // ================================================

  function recordPlayer() {
    if (!player) return;

    if (freeExplore && !captureActive) return;
    currentRecording.push({
      t: freeExplore ? Math.min(captureTime,CAPTURE_LIMIT) : Math.min(elapsed, getCycleDuration()),
      x: player.x,
      y: player.y
    });
  }

  function positionAt(frames, time) {
    if (!frames?.length) {
      return { ...arena().start };
    }

    if (time <= frames[0].t) {
      return {
        x: frames[0].x,
        y: frames[0].y
      };
    }

    const last = frames[frames.length - 1];

    if (time >= last.t) {
      return {
        x: last.x,
        y: last.y
      };
    }

    let low = 0;
    let high = frames.length - 1;

    while (low + 1 < high) {
      const mid = (low + high) >> 1;

      if (frames[mid].t <= time) {
        low = mid;
      } else {
        high = mid;
      }
    }

    const a = frames[low];
    const b = frames[high];

    const factor = clamp(
      (time - a.t) / Math.max(0.00001, b.t - a.t),
      0,
      1
    );

    return {
      x: a.x + (b.x - a.x) * factor,
      y: a.y + (b.y - a.y) * factor
    };
  }

  function updateGhosts() {
    ghosts = freeExplore ? freeEchoes.map(e => positionAt(e.frames, Math.min(worldTime-e.startedAt,e.frames[e.frames.length-1].t))) : recordings.map(frames => positionAt(frames, elapsed));
  }

  // ================================================
  // PARADOX SHIFT
  // ================================================

  function paradoxShift() {
    if (!running) return false;
    if (freeExplore) return toggleCapture();

    if (shiftUsed || recordings.length === 0) {
      playSound("error");
      setStatus("PARADOX SHIFT INDISPONÍVEL.");
      return false;
    }

    const index = recordings.length - 1;
    const frames = recordings[index];

    const position = positionAt(frames, elapsed);

    const past = frames.filter(
      frame => frame.t < elapsed
    );

    past.push({
      t: elapsed,
      x: position.x,
      y: position.y
    });

    past.push({
      t: getCycleDuration(),
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

  // ================================================
  // TEMPORAL PLATES AND DOOR
  // ================================================

  function isPlateActive(plate) {
    return (
      (player && distance(player, plate) < PLATE_RADIUS) ||
      ghosts.some(
        ghost => distance(ghost, plate) < PLATE_RADIUS
      ) || (overchargePlate === (level.plates || []).indexOf(plate) && worldTime < overchargeUntil)
    );
  }

  function getDoors() {
    return arena().doors?.length ? arena().doors : [arena().door];
  }

  function updateDoor() {
    const doors = getDoors();
    const previous = doorStates;
    doorStates = doors.map((gate, index) => {
      // v5.3 gates each use their own pressure plate.
      // Legacy levels keep the original all-plates requirement.
      if (arena().mazeRevolution && gate.plateIndex != null) {
        const plate = level.plates?.[gate.plateIndex];
        return Boolean(plate && isPlateActive(plate));
      }
      return (level.plates || []).every(isPlateActive);
    });
    doorOpen = doorStates.every(Boolean);
    // v8 cooperative relay: the living operator and a recorded echo
    // must occupy different plates at the same instant. Reward once
    // per cycle without altering existing gates or progression.
    if (running && !relayAwarded && level.plates?.length >= 2 && ghosts.length) {
      const playerPlate = level.plates.findIndex(p => player && distance(player,p) < PLATE_RADIUS);
      const echoPlate = level.plates.findIndex((p,i) =>
        i !== playerPlate && ghosts.some(g => distance(g,p) < PLATE_RADIUS));
      if (playerPlate >= 0 && echoPlate >= 0) {
        relayAwarded = true;
        score += 250;
        emitParticles(player.x,player.y,COLORS.purple,14);
        emitEvent("echorelay",{cycle,playerPlate,echoPlate,bonus:250});
        setStatus("SINCRONIA TEMPORAL! +250 PONTOS");
      }
    }
    doorStates.forEach((open, index) => {
      if (open && !previous[index]) {
        const gate = doors[index];
        playSound("door");
        emitParticles(gate.x + gate.w / 2, gate.y + gate.h / 2, COLORS.green, 18);
        emitEvent("dooropen", {doorIndex:index, totalDoors:doors.length});
        setStatus("PORTA " + (index + 1) + " ABERTA!");
      } else if (!open && previous[index]) {
        emitEvent("doorclosed", {doorIndex:index});
      }
    });
    previousDoorState = doorOpen;
  }

  // ================================================
  // TIMED MECHANICS
  // ================================================

  function timedActive(object, fallback = 3) {
    const period = Number(object.period) || fallback;

    const on = object.on == null
      ? period / 2
      : Number(object.on);

    const offset = Number(object.offset) || 0;

    const phase =
      ((worldTime + offset) % period + period) %
      period;

    return phase < on;
  }

  function isPhaseWallActive(wall) {
    if (typeof window.isPhaseWallActive === "function") {
      return Boolean(
        window.isPhaseWallActive(wall, worldTime)
      );
    }

    return timedActive(wall);
  }

  function isPlatformActive(platform) {
    if (
      typeof window.isTemporalPlatformActive ===
      "function"
    ) {
      return Boolean(
        window.isTemporalPlatformActive(
          platform,
          worldTime
        )
      );
    }

    return timedActive(platform);
  }

  function isLaserActive(laser) {
    return timedActive(laser, 2);
  }

  // ================================================
  // COLLISIONS AND MOVEMENT
  // ================================================

  function isBlocked(x, y) {
    const rect = playerRect(x, y);

    for (const wall of arena().walls || []) {
      if (intersects(rect, wall)) return true;
    }

    if (getDoors().some((gate, index) => !doorStates[index] && intersects(rect, gate))) {
      return true;
    }

    for (const wall of level.phaseWalls || []) {
      if (
        !(currentOperator() === "axiom" && worldTime < abilityUntil) &&
        isPhaseWallActive(wall) &&
        intersects(rect, wall)
      ) {
        return true;
      }
    }

    return false;
  }

  function updatePlayer(dt) {
    let dx = 0;
    let dy = 0;

    if (isDirectionPressed("up")) dy--;
    if (isDirectionPressed("down")) dy++;
    if (isDirectionPressed("left")) dx--;
    if (isDirectionPressed("right")) dx++;

    const length = Math.hypot(dx, dy);

    if (!length) return;

    dx /= length;
    dy /= length;

    if (!firstMoveEmitted) {
      firstMoveEmitted = true;

      emitEvent("firstmove", {
        x: player.x,
        y: player.y
      });
    }

    const boost = currentOperator() === "nyra" && worldTime < abilityUntil ? 2.2 : 1;
    const distanceX = dx * player.speed * boost * dt;
    const distanceY = dy * player.speed * boost * dt;

    // Move in small steps to prevent tunnelling
    // through narrow walls during frame drops.
    const steps = Math.max(
      1,
      Math.ceil(
        Math.max(
          Math.abs(distanceX),
          Math.abs(distanceY)
        ) / 5
      )
    );

    for (let i = 0; i < steps; i++) {
      const nextX = clamp(
        player.x + distanceX / steps,
        PLAYER_SIZE / 2,
        WIDTH - PLAYER_SIZE / 2
      );

      if (!isBlocked(nextX, player.y)) {
        player.x = nextX;
      }

      const nextY = clamp(
        player.y + distanceY / steps,
        PLAYER_SIZE / 2,
        HEIGHT - PLAYER_SIZE / 2
      );

      if (!isBlocked(player.x, nextY)) {
        player.y = nextY;
      }
    }
  }

  // ================================================
  // PORTALS
  // ================================================

  function getPortalPoints(portal) {
    return {
      a: portal.a || {
        x: portal.x,
        y: portal.y
      },
      b: portal.b || {
        x: portal.targetX,
        y: portal.targetY
      }
    };
  }

  function updatePortals(dt) {
    portalCooldown = Math.max(
      0,
      portalCooldown - dt
    );

    if (portalCooldown > 0) return;

    for (const portal of level.portals || []) {
      const { a, b } = getPortalPoints(portal);

      let destination = null;

      if (distance(player, a) < 19) {
        destination = b;
      } else if (distance(player, b) < 19) {
        destination = a;
      }

      if (!destination) continue;

      if (
        !Number.isFinite(destination.x) ||
        !Number.isFinite(destination.y)
      ) {
        continue;
      }

      if (isBlocked(destination.x, destination.y)) {
        continue;
      }

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
      setStatus("SALTO QUÂNTICO EXECUTADO!");

      return;
    }
  }

  // ================================================
  // LASERS
  // ================================================

  function getLaserPosition(laser) {
    if (
      typeof window.getLaserPosition === "function"
    ) {
      const position = window.getLaserPosition(
        laser,
        worldTime
      );

      if (position) return position;
    }

    const baseX = Number(
      laser.x ??
      (Number(laser.x1) + Number(laser.x2)) / 2
    );

    const baseY = Number(
      laser.y ??
      (Number(laser.y1) + Number(laser.y2)) / 2
    );

    const range = Number(laser.movementRange) || 0;
    const speed = Number(laser.movementSpeed) || 1;
    const phase = Number(laser.movementPhase) || 0;

    const displacement = laser.moving
      ? Math.sin(worldTime * speed + phase) * range
      : 0;

    return {
      x: baseX + (
        laser.movementAxis === "x"
          ? displacement
          : 0
      ),
      y: baseY + (
        laser.movementAxis === "x"
          ? 0
          : displacement
      )
    };
  }

  function getLaserSegment(laser) {
    const position = getLaserPosition(laser);

    if (
      Number.isFinite(laser.x1) &&
      Number.isFinite(laser.y1) &&
      Number.isFinite(laser.x2) &&
      Number.isFinite(laser.y2)
    ) {
      const baseX = Number(
        laser.x ??
        (laser.x1 + laser.x2) / 2
      );

      const baseY = Number(
        laser.y ??
        (laser.y1 + laser.y2) / 2
      );

      const dx = position.x - baseX;
      const dy = position.y - baseY;

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

  function distanceToSegment(px, py, segment) {
    const vx = segment.x2 - segment.x1;
    const vy = segment.y2 - segment.y1;

    const wx = px - segment.x1;
    const wy = py - segment.y1;

    const lengthSquared = vx * vx + vy * vy;

    const t = lengthSquared > 0
      ? clamp(
          (wx * vx + wy * vy) / lengthSquared,
          0,
          1
        )
      : 0;

    return Math.hypot(
      px - (segment.x1 + t * vx),
      py - (segment.y1 + t * vy)
    );
  }

  function checkLasers() {
    for (const laser of level.lasers || []) {
      if (!isLaserActive(laser)) continue;

      const segment = getLaserSegment(laser);
      const width = Number(laser.width) || 5;

      if (
        distanceToSegment(
          player.x,
          player.y,
          segment
        ) < PLAYER_SIZE / 2 + width / 2
      ) {
        killPlayer("laser");
        return true;
      }
    }

    return false;
  }

  // ================================================
  // TEMPORAL PLATFORMS
  // ================================================

  function updatePlatforms() {
    const platforms = level.temporalPlatforms || [];

    for (let index = 0; index < platforms.length; index++) {
      const platform = platforms[index];
      const id = platform.id ?? index;

      const inside = intersects(
        playerRect(player.x, player.y),
        platform
      );

      if (!inside) {
        touchedPlatforms.delete(id);
        continue;
      }

      if (!touchedPlatforms.has(id)) {
        touchedPlatforms.add(id);

        emitEvent("platformtouch", {
          platform: id
        });
      }

      if (!isPlatformActive(platform)) {
        killPlayer("platform");
        return true;
      }
    }

    return false;
  }

  // ================================================
  // ECHO TRAPS
  // ================================================

  function updateTraps() {
    const traps = level.echoTraps || [];

    for (let index = 0; index < traps.length; index++) {
      const trap = traps[index];
      const id = trap.id ?? index;

      if (triggeredTraps.has(id)) continue;

      const radius = Number(trap.radius) || 22;

      const ghostTriggered = ghosts.some(
        ghost => distance(ghost, trap) < radius
      );

      const playerTriggered =
        distance(player, trap) < radius;

      if (!ghostTriggered && !playerTriggered) {
        continue;
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

      if (playerTriggered) {
        killPlayer("trap");
        return true;
      }
    }

    return false;
  }

  // ================================================
  // DEATH AND TEMPORAL CYCLES
  // ================================================

  function killPlayer(reason) {
    if (!running || deathTriggered) return;

    deathTriggered = true;
    deaths++;

    storageCall("registerDeath");

    score = Math.max(0, score - 150);

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
      reason === "laser" ? "laser" : "death"
    );

    endCycle(true);
  }

  function endCycle(died = false) {
    if (!running) return;

    const duration = getCycleDuration();

    // Preserve the real trajectory until death.
    // Do not create an impossible teleporting echo.
    const lastPosition = {
      x: player.x,
      y: player.y
    };

    const endTime = Math.min(elapsed, duration);

    currentRecording.push({
      t: endTime,
      x: lastPosition.x,
      y: lastPosition.y
    });

    currentRecording.push({
      t: duration,
      x: lastPosition.x,
      y: lastPosition.y
    });

    recordings.push(currentRecording);

    storageCall("registerCycle");

    if (cycle >= getMaxCycles()) {
      finishGame(false);
      return;
    }

    cycle++;

    elapsed = 0;
    portalCooldown = 0;
    lastTickSecond = null;
    criticalEmitted = false;
    deathTriggered = false;

    // One Paradox Shift per cycle.
    shiftUsed = false;
    relayAwarded = false;
    abilityUntil = 0; abilityCooldownUntil = 0;
    overchargePlate = -1; overchargeUntil = 0;

    player.x = arena().start.x;
    player.y = arena().start.y;

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

    updateHUD();
  }

  // ================================================
  // GOAL AND VICTORY
  // ================================================

  function checkGoal() {
    if (
      intersects(
        playerRect(player.x, player.y),
        arena().goal
      )
    ) {
      finishGame(true);
      return true;
    }

    return false;
  }

  function finishGame(won) {
    if (finished) return;
    if (won && levelIndex === 9) {
      window.EchoSystemBoss?.onVictory?.();
    }

    running = false;
    finished = true;

    clearAllMovement();

    if (won) {
      const cycleBonus =
        (getMaxCycles() - cycle + 1) * 1000;

      const timeBonus = Math.floor(
        Math.max(0, getCycleDuration() - elapsed) * 100
      );

      const survivalBonus = Math.max(
        0,
        1000 - deaths * 250
      );

      score +=
        2000 +
        cycleBonus +
        timeBonus +
        survivalBonus;

      storageCall("win", levelIndex, score);

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
          levelIndex < LEVELS.length - 1
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
        UI.nextBtn.style.display = "none";
      }

      setStatus(
        "COLAPSO TEMPORAL DETECTADO."
      );
    }

    if (UI.finalScore) {
      UI.finalScore.textContent =
        `${formatScore(score)} PONTOS`;
    }

    UI.overlay?.classList.remove("hidden");

    if (UI.startBtn) {
      UI.startBtn.textContent = "JOGAR NOVAMENTE";
    }

    buildLevelMenu();
    updateHUD();
  }

  // ================================================
  // RENDER HELPERS
  // ================================================

  function glowRect(
    x, y, width, height, color, blur = 15
  ) {
    ctx.save();

    ctx.fillStyle = color;
    ctx.shadowColor = color;
    ctx.shadowBlur = blur;

    ctx.fillRect(x, y, width, height);

    ctx.restore();
  }

  function drawGrid() {
    if (window.EchoWorldRebirth?.draw) {
      window.EchoWorldRebirth.draw(ctx, levelIndex, WIDTH, HEIGHT);
      return;
    }
    ctx.save();

    ctx.strokeStyle = getThemeColor(
      "grid",
      "#19243d"
    );

    ctx.globalAlpha = 0.6;
    ctx.lineWidth = 1;

    for (let x = 0; x <= WIDTH; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, HEIGHT);
      ctx.stroke();
    }

    for (let y = 0; y <= HEIGHT; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(WIDTH, y);
      ctx.stroke();
    }

    ctx.restore();
  }

  // ================================================
  // DRAW WALLS AND DOOR
  // ================================================

  function drawWalls() {
    const wallColor = getThemeColor(
      "secondary",
      "#35415e"
    );

    ctx.save();

    for (const wall of arena().walls || []) {
      ctx.fillStyle = "#101b2a";

      ctx.fillRect(
        wall.x, wall.y, wall.w, wall.h
      );

      ctx.strokeStyle = wallColor;
      ctx.lineWidth = 2;

      ctx.strokeRect(
        wall.x, wall.y, wall.w, wall.h
      );

      ctx.globalAlpha = 0.18;
      ctx.fillStyle = wallColor;

      ctx.fillRect(
        wall.x + 3,
        wall.y + 3,
        Math.max(0, wall.w - 6),
        Math.max(0, wall.h - 6)
      );

      ctx.globalAlpha = 1;
    }

    ctx.restore();

    getDoors().forEach((door, index) => {
      if (doorStates[index]) {
        ctx.save();
        ctx.strokeStyle = COLORS.green;
        ctx.lineWidth = 2;
        ctx.setLineDash([6, 6]);
        ctx.strokeRect(door.x, door.y, door.w, door.h);
        ctx.restore();
      } else {
        glowRect(door.x, door.y, door.w, door.h, COLORS.red, 18);
      }
    });
  }

  // ================================================
  // DRAW PHASE WALLS
  // ================================================

  function drawPhaseWalls() {
    for (const wall of level.phaseWalls || []) {
      const active = isPhaseWallActive(wall);

      ctx.save();

      ctx.globalAlpha = active ? 0.85 : 0.15;

      ctx.fillStyle = getThemeColor(
        "primary",
        COLORS.purple
      );

      ctx.shadowColor = COLORS.purple;
      ctx.shadowBlur = active ? 15 : 0;

      ctx.fillRect(
        wall.x, wall.y, wall.w, wall.h
      );

      ctx.restore();
    }
  }

  // ================================================
  // DRAW PLATES
  // ================================================

  function drawPlates() {
    (level.plates || []).forEach((plate, index) => {
      const active = isPlateActive(plate);

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
        plate.x, plate.y, 24, 0, Math.PI * 2
      );
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(
        plate.x, plate.y, 10, 0, Math.PI * 2
      );
      ctx.fill();

      ctx.restore();

      ctx.save();

      ctx.fillStyle = COLORS.white;
      ctx.font = "11px monospace";
      ctx.textAlign = "center";

      const echoHere = ghosts.some(g => distance(g,plate) < PLATE_RADIUS);
      const playerHere = player && distance(player,plate) < PLATE_RADIUS;
      ctx.fillText(
        (echoHere ? "ECO " : playerHere ? "TU " : "") + `PLACA ${index + 1}`,
        plate.x,
        plate.y - 36
      );

      ctx.restore();
    });
  }

  // ================================================
  // DRAW LASERS
  // ================================================

  function drawLasers() {
    for (const laser of level.lasers || []) {
      const active = isLaserActive(laser);
      const segment = getLaserSegment(laser);

      ctx.save();

      ctx.beginPath();
      ctx.moveTo(segment.x1, segment.y1);
      ctx.lineTo(segment.x2, segment.y2);

      ctx.strokeStyle = active
        ? COLORS.red
        : "#50233a";

      ctx.lineWidth = active ? 5 : 2;
      ctx.shadowColor = COLORS.red;
      ctx.shadowBlur = active ? 20 : 0;

      ctx.stroke();
      ctx.restore();

      for (const point of [
        { x: segment.x1, y: segment.y1 },
        { x: segment.x2, y: segment.y2 }
      ]) {
        glowRect(
          point.x - 8,
          point.y - 8,
          16,
          16,
          active ? COLORS.red : "#71324a",
          8
        );
      }
    }
  }

  // ================================================
  // DRAW PORTALS
  // ================================================

  function drawPortals() {
    for (const portal of level.portals || []) {
      const { a, b } = getPortalPoints(portal);

      for (const point of [a, b]) {
        const radius =
          15 + Math.sin(worldTime * 5) * 3;

        ctx.save();

        ctx.beginPath();
        ctx.arc(
          point.x,
          point.y,
          radius,
          0,
          Math.PI * 2
        );

        ctx.strokeStyle = COLORS.blue;
        ctx.lineWidth = 4;
        ctx.shadowColor = COLORS.blue;
        ctx.shadowBlur = 18;

        ctx.stroke();
        ctx.restore();
      }
    }
  }

  // ================================================
  // DRAW TEMPORAL PLATFORMS
  // ================================================

  function drawPlatforms() {
    for (const platform of
      level.temporalPlatforms || []) {

      const active = isPlatformActive(platform);

      ctx.save();

      ctx.fillStyle = active
        ? "rgba(0,245,255,0.16)"
        : "rgba(255,56,104,0.08)";

      ctx.strokeStyle = active
        ? COLORS.cyan
        : COLORS.red;

      ctx.lineWidth = 2;
      ctx.setLineDash(active ? [] : [5, 5]);

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

  // ================================================
  // DRAW TRAPS
  // ================================================

  function drawTraps() {
    (level.echoTraps || []).forEach((trap, index) => {
      const id = trap.id ?? index;
      const triggered = triggeredTraps.has(id);
      const radius = Number(trap.radius) || 22;

      ctx.save();

      ctx.beginPath();
      ctx.arc(
        trap.x,
        trap.y,
        radius,
        0,
        Math.PI * 2
      );

      ctx.strokeStyle = triggered
        ? COLORS.red
        : COLORS.purple;

      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.shadowColor = COLORS.red;
      ctx.shadowBlur = triggered ? 18 : 5;

      ctx.stroke();
      ctx.restore();
    });
  }

  // ================================================
  // DRAW GOAL
  // ================================================

  function drawGoal() {
    const goal = arena().goal;

    glowRect(
      goal.x,
      goal.y,
      goal.w,
      goal.h,
      COLORS.green,
      22
    );

    ctx.save();

    ctx.fillStyle = "#083324";

    ctx.fillRect(
      goal.x + 10,
      goal.y + 10,
      Math.max(0, goal.w - 20),
      Math.max(0, goal.h - 20)
    );

    ctx.fillStyle = COLORS.green;
    ctx.font = "12px monospace";
    ctx.textAlign = "center";

    ctx.fillText(
      "SAÍDA",
      goal.x + goal.w / 2,
      goal.y - 15
    );

    ctx.restore();
  }

  // ================================================
  // DRAW GHOSTS
  // ================================================

  // v7.1: time echoes are translucent operator silhouettes, never generic balls.
  // The renderer shares the same proportions for every recorded movement.
  function drawEchoOperator(x, y, index) {
    const bob = Math.sin(worldTime * 7 + index * 1.9) * 1.2;
    ctx.save();
    ctx.translate(x, y + bob);
    ctx.globalAlpha = 0.55 + Math.sin(worldTime * 5 + index) * 0.09;
    ctx.shadowColor = "#bd84ff";
    ctx.shadowBlur = 11;
    // Boots, body, helmet and luminous visor: recognisable as a player clone.
    ctx.fillStyle = "#6146a5";
    ctx.fillRect(-7, 7, 5, 6);
    ctx.fillRect(2, 7, 5, 6);
    ctx.fillStyle = "#a47dff";
    ctx.fillRect(-9, -4, 18, 13);
    ctx.fillStyle = "#34235e";
    ctx.fillRect(-7, -12, 14, 11);
    ctx.fillStyle = "#d8baff";
    ctx.fillRect(-5, -9, 10, 4);
    ctx.fillStyle = "#e6d4ff";
    ctx.fillRect(-3, -8, 6, 2);
    ctx.fillStyle = "#7954d4";
    ctx.fillRect(-12, -2, 3, 9);
    ctx.fillRect(9, -2, 3, 9);
    ctx.shadowBlur = 0;
    ctx.strokeStyle = "#d2aaff";
    ctx.lineWidth = 1.3;
    ctx.strokeRect(-9, -4, 18, 13);
    ctx.strokeRect(-7, -12, 14, 11);
    ctx.restore();
  }

  function drawGhosts() {
    ghosts.forEach((ghost, index) => {
      if (!Number.isFinite(ghost?.x) || !Number.isFinite(ghost?.y)) return;
      drawEchoOperator(ghost.x, ghost.y, index);
    });
  }

  // ================================================
  // DRAW PLAYER
  // ================================================

  function drawPlayer() {
    if (!player || isOperatorRendererActive()) {
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

    ctx.fillStyle = COLORS.white;

    ctx.fillRect(
      player.x - 4,
      player.y - 4,
      8,
      8
    );
  }

  // ================================================
  // DRAW PARTICLES
  // ================================================

  function drawParticles() {
    for (const particle of particles) {
      ctx.save();

      ctx.globalAlpha = clamp(
        particle.life / particle.maxLife,
        0,
        1
      );

      ctx.fillStyle = particle.color;

      ctx.fillRect(
        particle.x,
        particle.y,
        particle.size,
        particle.size
      );

      ctx.restore();
    }
  }

  // ================================================
  // DRAW LEVEL LABELS
  // ================================================

  function drawLabels() {
    ctx.save();

    ctx.fillStyle = getThemeColor(
      "accent",
      "#7083a4"
    );

    ctx.globalAlpha = 0.75;
    ctx.font = "12px monospace";
    ctx.textAlign = "left";

    ctx.fillText(
      `SECTOR ${String(levelIndex + 1).padStart(2, "0")}` +
      ` // ${String(
        getVisualTheme().id || "PARADOX"
      ).toUpperCase()}`,
      20,
      25
    );

    ctx.textAlign = "right";

    ctx.fillText(
      `LEVEL ${String(levelIndex + 1).padStart(2, "0")}`,
      WIDTH - 20,
      25
    );

    ctx.restore();
  }

  // ================================================
  // MAIN DRAW
  // ================================================

  function draw() {
    ctx.clearRect(0, 0, WIDTH, HEIGHT);

    if (!isWorldRendererActive()) {
      const theme = getVisualTheme();

      const background =
        theme.background ||
        theme.backgroundColor ||
        COLORS.dark;

      ctx.fillStyle =
        typeof background === "string"
          ? background
          : typeof background === "number"
            ? "#" + background.toString(16).padStart(6, "0")
            : COLORS.dark;

      ctx.fillRect(0, 0, WIDTH, HEIGHT);

      drawGrid();
    }

    drawLabels();
    drawWalls();
    drawPhaseWalls();
    drawPlatforms();
    drawPlates();
    drawLasers();
    drawPortals();
    drawTraps();
    window.EchoDynamicThreats?.draw?.(ctx, {levelIndex, worldTime, level, running});
    window.EchoSystemBoss?.draw?.(ctx, {levelIndex, worldTime, level, running, doorStates});
    drawGoal();
    // The visual overlay draws operator-matched echoes; keep a fallback
    // for reduced/failed visual modules.
    if (!document.getElementById("vr-overlay")) drawGhosts();
    drawPlayer();
    drawParticles();
  }

  // ================================================
  // COUNTDOWN
  // ================================================

  function updateCountdown() {
    if (freeExplore) return;
    const remaining = getCycleDuration() - elapsed;

    if (
      remaining <= 2.5 &&
      !criticalEmitted
    ) {
      criticalEmitted = true;

      emitEvent("timecritical", {
        remaining
      });
    }

    const second = Math.ceil(remaining);

    if (
      second <= 3 &&
      second > 0 &&
      second !== lastTickSecond
    ) {
      lastTickSecond = second;
      playSound("tick");
    }
  }

  // ================================================
  // GAME LOOP
  // ================================================

  function gameLoop(timestamp) {
    if (!running) {
      animationId = null;
      return;
    }

    if (!lastFrame) {
      lastFrame = timestamp;
    }

    const dt = clamp(
      (timestamp - lastFrame) / 1000,
      0,
      0.05
    );

    lastFrame = timestamp;

    elapsed += dt;
    worldTime += dt;
    if (freeExplore && captureActive) {
      captureTime = Math.min(CAPTURE_LIMIT,captureTime+dt);
    }
    threatInvulnerability = Math.max(0, threatInvulnerability - dt);

    updateGhosts();
    updateDoor();

    updatePlayer(dt);
    updatePortals(dt);
    updateDoor();

    recordPlayer();
    if (freeExplore && captureActive && captureTime >= CAPTURE_LIMIT) toggleCapture();
    updateParticles(dt);
    updateCountdown();

    let interrupted = checkLasers();

    if (!interrupted && running) {
      interrupted = updatePlatforms();
    }

    if (!interrupted && running) {
      interrupted = updateTraps();
    }

    if (!interrupted && running && window.EchoSystemBoss?.collides?.({player, levelIndex, worldTime, level})) {
      killPlayer("boss");
      interrupted = true;
    }

    if (!interrupted && running && threatInvulnerability <= 0 &&
        window.EchoDynamicThreats?.collides?.({player, levelIndex, worldTime, level})) {
      threatInvulnerability = 1.2;
      killPlayer("drone");
      interrupted = true;
    }

    if (!interrupted && running) {
      checkGoal();
    }

    if (
      running &&
      !interrupted &&
      !freeExplore && elapsed >= getCycleDuration()
    ) {
      endCycle();
    }

    updateHUD();
    draw();

    if (running) {
      animationId = requestAnimationFrame(gameLoop);
    } else {
      animationId = null;
    }
  }

  // ================================================
  // KEYBOARD CONTROLS
  // ================================================

  const movementKeys = new Set([
    "w", "a", "s", "d",
    "arrowup", "arrowdown",
    "arrowleft", "arrowright"
  ]);

  window.addEventListener("keydown", event => {
    const key = event.key.toLowerCase();
    const target = event.target;

    const typing =
      target instanceof HTMLElement &&
      (
        target.isContentEditable ||
        ["INPUT", "TEXTAREA", "SELECT"].includes(
          target.tagName
        )
      );

    if (typing) return;

    if (
      key.startsWith("arrow") ||
      key === " "
    ) {
      event.preventDefault();
    }

    if (key === "r" && !event.repeat) {
      startGame();
      return;
    }

    if (key === "e" && !event.repeat) {
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

    if (movementKeys.has(key)) {
      keys.add(key);
    }
  });

  window.addEventListener("keyup", event => {
    keys.delete(event.key.toLowerCase());
  });

  window.addEventListener("blur", () => {
    clearAllMovement();
    lastFrame = 0;
  });

  document.addEventListener(
    "visibilitychange",
    () => {
      if (document.hidden) {
        clearAllMovement();
        lastFrame = 0;
      }
    }
  );

  // ================================================
  // MOBILE CONTROLS
  // ================================================

  function setupMobileControls() {
    for (const [direction, button] of
      Object.entries(directionButtons)) {

      if (!button) continue;

      button.style.touchAction = "none";

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
        mobilePointers.delete(event.pointerId);
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

    UI.mobileShiftBtn?.addEventListener(
      "click",
      paradoxShift
    );

    UI.mobileRestartBtn?.addEventListener(
      "click",
      startGame
    );
  }

  // ================================================
  // UI BUTTONS
  // ================================================

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
      const nextIndex = levelIndex + 1;

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
        enabled ? "SOM: ON" : "SOM: OFF";
    }
  );

  // ================================================
  // WORLD RENDERER EVENTS
  // ================================================

  window.addEventListener(
    "echo404:worldthemechange",
    () => {
      if (!running) draw();
    }
  );

  window.addEventListener(
    "echo404:worldready",
    () => {
      draw();
    }
  );

  // ================================================
  // PUBLIC API
  // ================================================

  window.EchoGame = Object.assign(
    window.EchoGame || {},
    {
      version: VERSION,

      getState() {
        return {
          relayAwarded,
          freeExplore,
          captureActive,
          captureRemaining: Math.max(0,CAPTURE_LIMIT-captureTime),
          freeEchoCount: freeEchoes.length,
          abilityCooldown: Math.max(0,abilityCooldownUntil-worldTime),
          abilityActive: worldTime < abilityUntil || worldTime < overchargeUntil,
          operator: currentOperator(),
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
          doorStates: [...doorStates],
          shiftUsed,
          ghosts: ghosts.map(g => ({ ...g })),
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

      selectLevel,

      start: startGame,

      restart: startGame,

      shift: paradoxShift,

      ability: activateAbility,
      toggleFreeExplore,
      toggleCapture,

      redraw: draw,

      getLaserPosition,

      isLaserActive,

      getWorldRendererState() {
        return window.EchoWorldRenderer
          ?.getState?.() || null;
      }
    }
  );

  // ================================================
  // INITIALIZATION
  // ================================================

  function initialize() {
    if (UI.soundBtn) {
      const enabled =
        window.GameAudio?.isEnabled?.() ?? true;

      UI.soundBtn.textContent =
        enabled ? "SOM: ON" : "SOM: OFF";
    }

    setupMobileControls();

    applyLevelTheme();
    resetGame();
    buildLevelMenu();

    console.info(
      "=================================="
    );
    console.info(
      "ECHO//404 — PARADOX EVOLUTION"
    );
    console.info(
      `GAME ENGINE v${VERSION}`
    );
    console.info(
      `${LEVELS.length} LEVELS LOADED`
    );
    console.info(
      "TEMPORAL ECHOES / PARADOX SHIFT READY"
    );
    console.info(
      "PIXIJS WORLD RENDERER COMPATIBLE"
    );
    console.info(
      "DESKTOP + MOBILE CONTROLS READY"
    );
    console.info(
      "CREATED & DEVELOPED BY MANUEL SAMPAIO01"
    );
    console.info(
      "=================================="
    );
  }

  initialize();

})();

/*
 ECHO//404 — PARADOX EVOLUTION
 GAME ENGINE v4.2

 CREATED & DEVELOPED BY MANUEL SAMPAIO01
 © 2026 MANUEL SAMPAIO01
*/
