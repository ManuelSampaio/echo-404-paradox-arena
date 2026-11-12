
"use strict";

/*
========================================================
 ECHO//404 — PARADOX EVOLUTION
 VERSION 0.8 — SYSTEM REBELLION
 FILE: game.js

 DYNAMIC OBSTACLES / TEMPORAL ECHOES
 PARADOX SHIFT / MOBILE JOYSTICK
 CONTEXTUAL EVENTS / SCORE / MEDALS

 CREATED & DEVELOPED BY MANUEL SAMPAIO01
 © 2026 MANUEL SAMPAIO01
========================================================
*/

(() => {

  // ==================================================
  // 01. DEPENDENCY CHECK
  // ==================================================

  if (
    typeof GAME_WORLD === "undefined" ||
    typeof GAME_LEVELS === "undefined"
  ) {
    console.error(
      "ECHO//404: levels.js deve carregar antes de game.js."
    );
    return;
  }

  const WORLD = GAME_WORLD;
  const LEVELS = GAME_LEVELS;

  const STORAGE =
    typeof GameStorage !== "undefined"
      ? GameStorage
      : null;

  const AUDIO =
    typeof GameAudio !== "undefined"
      ? GameAudio
      : null;

  // ==================================================
  // 02. DOM REFERENCES
  // ==================================================

  const $ = id => document.getElementById(id);

  const canvas = $("gameCanvas");

  if (!canvas) {
    console.error(
      "ECHO//404: #gameCanvas não encontrado."
    );
    return;
  }

  const ctx = canvas.getContext("2d");

  if (!ctx) {
    console.error(
      "ECHO//404: Canvas 2D indisponível."
    );
    return;
  }

  const UI = {
    levelGrid: $("levelGrid"),
    progress: $("progress"),
    levelName: $("levelName"),
    levelHint: $("levelHint"),
    difficulty: $("difficultyBadge"),

    cycle: $("cycle"),
    timer: $("timer"),
    ghosts: $("ghosts"),
    score: $("score"),
    best: $("best"),
    timerBar: $("timerBar"),
    timerCard: $("timerCard"),

    overlay: $("overlay"),
    overlayTitle: $("overlayTitle"),
    overlayMessage: $("overlayMessage"),
    finalScore: $("finalScore"),

    startBtn: $("startBtn"),
    restartBtn: $("restartBtn"),
    shiftBtn: $("shiftBtn"),
    playAgainBtn: $("playAgainBtn"),
    nextBtn: $("nextBtn"),

    status: $("status"),
    systemStatus: $("systemStatus"),
    threatLevel: $("threatLevel"),
    arenaThreat: $("arenaThreatStatus"),

    warning: $("criticalWarning"),
    arenaGlitch: $("arenaGlitch"),
    globalGlitch: $("globalGlitch"),

    obstacleCount: $("obstacleCount"),
    movingLaserStatus: $("movingLaserStatus"),
    phaseWallStatus: $("phaseWallStatus"),
    platformStatus: $("platformStatus"),
    echoTrapStatus: $("echoTrapStatus"),

    mobileControls: $("mobileControls"),
    mobileDpad: $("mobileDpad"),
    mobileShift: $("mobileShiftBtn"),
    mobileRestart: $("mobileRestartBtn"),

    joystick: $("virtualJoystick"),
    joystickBase: $("joystickBase"),
    joystickStick: $("joystickStick"),
    controlModeBtn: $("controlModeBtn"),

    soundBtn: $("soundBtn"),
    medalResult: $("awakeningMedalResult"),
    medalSummary: $("awakeningMedalSummary")
  };

  canvas.width = WORLD.width;
  canvas.height = WORLD.height;

  // ==================================================
  // 03. CONSTANTS
  // ==================================================

  const W = WORLD.width;
  const H = WORLD.height;

  const MAX_DT = 0.04;
  const FIXED_STEP = 1 / 120;

  const PLAYER_RADIUS =
    WORLD.player?.radius ?? 12;

  const PLAYER_SPEED =
    WORLD.player?.speed ?? 230;

  const MEDAL_KEY =
    "echo404_awakening_medals_v07";

  const FALLBACK_SAVE_KEY =
    "echo404_v08_progress";

  const COLORS = {
    background: "#060e1e",
    grid: "rgba(72,246,255,0.055)",
    cyan: "#48f6ff",
    purple: "#a66bff",
    pink: "#ff4eb8",
    red: "#ff4c69",
    orange: "#ffad4d",
    green: "#52ffbb",
    white: "#f2f7ff",
    muted: "#7186aa",
    wall: "#192e51"
  };

  // ==================================================
  // 04. STATE
  // ==================================================

  const state = {
    levelIndex: 0,
    level: LEVELS[0],

    running: false,
    finished: false,
    won: false,

    cycle: 1,
    maxCycles: WORLD.maxCycles ?? 6,

    time: 0,
    elapsed: 0,
    cycleDuration: 10,

    player: {
      x: WORLD.start.x,
      y: WORLD.start.y,
      radius: PLAYER_RADIUS
    },

    echoes: [],
    recording: [],
    frozenEchoes: [],

    score: 0,
    deaths: 0,
    shifts: 0,
    portalsUsed: 0,

    doorOpen: false,

    hazards: {
      lasers: [],
      phaseWalls: [],
      platforms: [],
      traps: []
    },

    portalCooldown: 0,

    levelAttempts: 0,
    lastDeathReason: "",

    warningSent: false,
    firstMoveSent: false,
    doorWasOpen: false,

    lastFrame: 0,
    accumulator: 0,

    controlMode: "dpad",

    joystick: {
      x: 0,
      y: 0,
      pointerId: null
    }
  };

  const keys = new Set();

  const mobileKeys = new Set();

  let animationStarted = false;
  let muted = false;

  // ==================================================
  // 05. HELPERS
  // ==================================================

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function distance(ax, ay, bx, by) {
    return Math.hypot(ax - bx, ay - by);
  }

  function circleRect(cx, cy, radius, rect) {
    const px = clamp(
      cx,
      rect.x,
      rect.x + rect.w
    );

    const py = clamp(
      cy,
      rect.y,
      rect.y + rect.h
    );

    return distance(cx, cy, px, py) < radius;
  }

  function circleCircle(a, b) {
    return distance(
      a.x,
      a.y,
      b.x,
      b.y
    ) <= (a.radius ?? 0) + (b.radius ?? 0);
  }

  function segmentDistance(px, py, x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;

    const lengthSquared =
      dx * dx + dy * dy;

    if (lengthSquared === 0) {
      return distance(px, py, x1, y1);
    }

    const t = clamp(
      (
        (px - x1) * dx +
        (py - y1) * dy
      ) / lengthSquared,
      0,
      1
    );

    return distance(
      px,
      py,
      x1 + t * dx,
      y1 + t * dy
    );
  }

  function setText(element, text) {
    if (element) {
      element.textContent = String(text);
    }
  }

  function setHidden(element, hidden) {
    if (element) {
      element.classList.toggle(
        "hidden",
        hidden
      );
    }
  }

  function emit(name, detail = {}) {
    window.dispatchEvent(
      new CustomEvent(
        `echo404:${name}`,
        {
          detail: {
            level: state.levelIndex + 1,
            cycle: state.cycle,
            time: state.time,
            score: state.score,
            ...detail
          }
        }
      )
    );
  }

  function playSound(name) {
    if (
      muted ||
      !AUDIO ||
      typeof AUDIO[name] !== "function"
    ) {
      return;
    }

    try {
      AUDIO[name]();
    } catch (error) {
      console.warn(
        "ECHO//404 AUDIO:",
        error
      );
    }
  }

  function storageCall(method, ...args) {
    if (
      !STORAGE ||
      typeof STORAGE[method] !== "function"
    ) {
      return undefined;
    }

    try {
      return STORAGE[method](...args);
    } catch (error) {
      console.warn(
        `ECHO//404 STORAGE: ${method}`,
        error
      );

      return undefined;
    }
  }

  function localRead(key, fallback) {
    try {
      const raw = localStorage.getItem(key);

      return raw
        ? JSON.parse(raw)
        : fallback;
    } catch {
      return fallback;
    }
  }

  function localWrite(key, value) {
    try {
      localStorage.setItem(
        key,
        JSON.stringify(value)
      );
    } catch {
      // Storage can be unavailable in private mode.
    }
  }

  function getFallbackProgress() {
    return localRead(
      FALLBACK_SAVE_KEY,
      {
        unlocked: 1,
        completed: [],
        best: {}
      }
    );
  }

  function saveFallbackProgress(progress) {
    localWrite(
      FALLBACK_SAVE_KEY,
      progress
    );
  }

  function isUnlocked(index) {
    const stored = storageCall(
      "isUnlocked",
      index
    );

    if (typeof stored === "boolean") {
      return stored;
    }

    const progress = getFallbackProgress();

    return index + 1 <= progress.unlocked;
  }

  function isCompleted(index) {
    const stored = storageCall(
      "isCompleted",
      index
    );

    if (typeof stored === "boolean") {
      return stored;
    }

    return getFallbackProgress()
      .completed.includes(index + 1);
  }

  function getBest(index) {
    const stored = storageCall(
      "getBestScore",
      index
    );

    if (Number.isFinite(stored)) {
      return stored;
    }

    return (
      getFallbackProgress()
        .best[index + 1] || 0
    );
  }

  // ==================================================
  // 06. LEVEL INITIALIZATION
  // ==================================================

  function getDuration() {
    const configured =
      Number(state.level.timeLimit);

    return Number.isFinite(configured)
      ? configured
      : Math.max(
          3.5,
          10 - state.levelIndex * 0.75
        );
  }

  function cloneHazards() {
    const level = state.level;

    state.hazards.lasers = (
      level.lasers || []
    ).map((laser, index) => ({
      ...laser,
      id: laser.id || `laser_${index}`,
      currentX1: laser.x1,
      currentY1: laser.y1,
      currentX2: laser.x2,
      currentY2: laser.y2,
      enabled: true
    }));

    state.hazards.phaseWalls = (
      level.phaseWalls || []
    ).map(wall => ({
      ...wall,
      active: wall.startsActive !== false
    }));

    state.hazards.platforms = (
      level.temporalPlatforms || []
    ).map(platform => ({
      ...platform,
      active: true,
      touchedAt: null
    }));

    state.hazards.traps = (
      level.echoTraps || []
    ).map(trap => ({
      ...trap,
      triggeredAt: -Infinity,
      lastActivation: -Infinity,
      active: false,
      activations: 0
    }));
  }

  function resetPlayer() {
    state.player.x = WORLD.start.x;
    state.player.y = WORLD.start.y;
    state.portalCooldown = 0;
  }

  function clearInput() {
    keys.clear();
    mobileKeys.clear();

    state.joystick.x = 0;
    state.joystick.y = 0;
    state.joystick.pointerId = null;

    if (UI.joystickStick) {
      UI.joystickStick.style.transform =
        "translate(0px, 0px)";
    }

    document.querySelectorAll(
      ".dpad-btn.pressed"
    ).forEach(button => {
      button.classList.remove("pressed");
    });
  }

  function resetCycleHazards() {
    cloneHazards();

    state.warningSent = false;
    state.doorWasOpen = false;
    state.doorOpen = false;
  }

  function resetLevelState() {
    state.running = false;
    state.finished = false;
    state.won = false;

    state.cycle = 1;
    state.maxCycles =
      state.level.maxCycles ??
      WORLD.maxCycles ??
      6;

    state.time = 0;
    state.elapsed = 0;
    state.cycleDuration = getDuration();

    state.echoes = [];
    state.recording = [];
    state.frozenEchoes = [];

    state.score = 0;
    state.deaths = 0;
    state.shifts = 0;
    state.portalsUsed = 0;

    state.firstMoveSent = false;
    state.lastDeathReason = "";

    state.accumulator = 0;

    resetPlayer();
    resetCycleHazards();
    clearInput();

    document.body.classList.remove(
      "game-critical",
      "game-winning",
      "game-losing",
      "paradox-shift"
    );

    setHidden(UI.warning, true);

    setText(UI.medalResult, "");

    updateHUD();
    updateObstaclePanel();
  }

  // ==================================================
  // 07. ECHO RECORDING
  // ==================================================

  function recordPosition() {
    state.recording.push({
      t: state.time,
      x: state.player.x,
      y: state.player.y
    });
  }

  function sampleEcho(echo, time) {
    const points = echo.path;

    if (!points || points.length === 0) {
      return {
        x: WORLD.start.x,
        y: WORLD.start.y
      };
    }

    if (time <= points[0].t) {
      return points[0];
    }

    if (time >= points[points.length - 1].t) {
      return points[points.length - 1];
    }

    let low = 0;
    let high = points.length - 1;

    while (high - low > 1) {
      const mid = (low + high) >> 1;

      if (points[mid].t <= time) {
        low = mid;
      } else {
        high = mid;
      }
    }

    const a = points[low];
    const b = points[high];

    const fraction =
      (time - a.t) /
      Math.max(0.00001, b.t - a.t);

    return {
      x: a.x + (b.x - a.x) * fraction,
      y: a.y + (b.y - a.y) * fraction
    };
  }

  function getEchoPosition(echo) {
    if (echo.frozen) {
      return echo.frozenPosition;
    }

    return sampleEcho(
      echo,
      state.time
    );
  }

  function finishRecording() {
    if (state.recording.length === 0) {
      return;
    }

    const path = state.recording.map(
      point => ({ ...point })
    );

    state.echoes.push({
      path,
      frozen: false,
      frozenPosition: null,
      color: COLORS.purple
    });

    state.recording = [];

    playSound("echo");

    emit("echo", {
      count: state.echoes.length
    });
  }

  // ==================================================
  // 08. PARADOX SHIFT
  // ==================================================

  function paradoxShift() {
    if (!state.running) {
      return;
    }

    const echo = [...state.echoes]
      .reverse()
      .find(item => !item.frozen);

    if (!echo) {
      setStatus(
        "NO ECHO AVAILABLE FOR SHIFT"
      );

      playSound("error");
      return;
    }

    echo.frozenPosition = {
      ...getEchoPosition(echo)
    };

    echo.frozen = true;

    state.shifts++;
    state.score = Math.max(
      0,
      state.score - 75
    );

    storageCall("registerShift");

    playSound("shift");

    emit("shift", {
      shifts: state.shifts,
      frozenEchoes:
        state.echoes.filter(
          item => item.frozen
        ).length
    });

    triggerGlitch();

    setStatus(
      "PARADOX SHIFT ACTIVATED"
    );

    updateHUD();
  }

  // ==================================================
  // 09. DOOR AND PRESSURE PLATES
  // ==================================================

  function isPlatePressed(plate) {
    const radius = plate.radius ?? 23;

    const playerOnPlate =
      distance(
        state.player.x,
        state.player.y,
        plate.x,
        plate.y
      ) <= radius + PLAYER_RADIUS;

    const echoOnPlate =
      state.echoes.some(echo => {
        const position =
          getEchoPosition(echo);

        return distance(
          position.x,
          position.y,
          plate.x,
          plate.y
        ) <= radius + PLAYER_RADIUS;
      });

    if (plate.echoOnly) {
      return echoOnPlate;
    }

    if (plate.requiresEcho) {
      return echoOnPlate;
    }

    return playerOnPlate || echoOnPlate;
  }

  function updateDoor() {
    const plates =
      state.level.plates || [];

    state.doorOpen =
      plates.length === 0 ||
      plates.every(isPlatePressed);

    if (
      state.doorOpen !==
      state.doorWasOpen
    ) {
      emit(
        state.doorOpen
          ? "dooropen"
          : "doorclosed"
      );

      if (state.doorOpen) {
        playSound("door");
      }

      state.doorWasOpen =
        state.doorOpen;
    }
  }

  // ==================================================
  // 10. DYNAMIC LASERS
  // ==================================================

  function updateLasers() {
    const time = state.time;

    state.hazards.lasers.forEach(
      laser => {
        let offsetX = 0;
        let offsetY = 0;

        if (laser.moving) {
          const movement =
            Math.sin(
              time *
                (laser.movementSpeed ?? 1) *
                Math.PI +
              (laser.movementPhase ?? 0)
            ) * (laser.movementRange ?? 0);

          if (
            laser.movementAxis === "x"
          ) {
            offsetX = movement;
          }

          if (
            laser.movementAxis === "y"
          ) {
            offsetY = movement;
          }
        }

        laser.currentX1 =
          laser.x1 + offsetX;

        laser.currentY1 =
          laser.y1 + offsetY;

        laser.currentX2 =
          laser.x2 + offsetX;

        laser.currentY2 =
          laser.y2 + offsetY;

        let enabled =
          laser.active !== false;

        if (laser.pulse) {
          const interval = Math.max(
            0.1,
            laser.pulseInterval ?? 2
          );

          const duration = clamp(
            laser.pulseDuration ?? 1,
            0,
            interval
          );

          const phase =
            (
              time +
              (laser.phase ?? 0)
            ) % interval;

          enabled =
            enabled &&
            phase < duration;
        }

        laser.enabled = enabled;
      }
    );
  }

  function laserCollision(laser) {
    if (!laser.enabled) {
      return false;
    }

    const distanceToLaser =
      segmentDistance(
        state.player.x,
        state.player.y,
        laser.currentX1,
        laser.currentY1,
        laser.currentX2,
        laser.currentY2
      );

    return distanceToLaser <=
      PLAYER_RADIUS +
      (laser.width ?? 5) / 2;
  }

  // ==================================================
  // 11. PHASE WALLS
  // ==================================================

  function periodicActive(
    time,
    activeDuration,
    inactiveDuration,
    phase = 0,
    startsActive = true
  ) {
    const active = Math.max(
      0.05,
      activeDuration
    );

    const inactive = Math.max(
      0.05,
      inactiveDuration
    );

    const period = active + inactive;

    const position =
      (
        (time + phase) % period +
        period
      ) % period;

    const result = position < active;

    return startsActive
      ? result
      : !result;
  }

  function updatePhaseWalls() {
    state.hazards.phaseWalls.forEach(
      wall => {
        if (
          wall.echoControlled &&
          wall.triggerPlateId
        ) {
          const plate =
            (state.level.plates || [])
              .find(
                item =>
                  item.id ===
                  wall.triggerPlateId
              );

          wall.active = plate
            ? !isPlatePressed(plate)
            : true;

          return;
        }

        wall.active = periodicActive(
          state.time,
          wall.activeDuration ?? 1.5,
          wall.inactiveDuration ?? 1.5,
          wall.phase ?? 0,
          wall.startsActive !== false
        );
      }
    );
  }

  // ==================================================
  // 12. TEMPORAL PLATFORMS
  // ==================================================

  function updatePlatforms() {
    state.hazards.platforms.forEach(
      platform => {
        let active = periodicActive(
          state.time,
          platform.activeDuration ?? 2,
          platform.inactiveDuration ?? 1,
          platform.phase ?? 0,
          true
        );

        if (
          platform.collapseOnTouch &&
          platform.touchedAt !== null
        ) {
          const delay =
            platform.collapseDelay ?? 0.7;

          if (
            state.time -
            platform.touchedAt >= delay
          ) {
            active = false;
          }
        }

        platform.active = active;

        if (
          active &&
          platform.collapseOnTouch &&
          platform.touchedAt === null &&
          circleRect(
            state.player.x,
            state.player.y,
            PLAYER_RADIUS,
            platform
          )
        ) {
          platform.touchedAt =
            state.time;

          emit("platformtouch", {
            platformId: platform.id,
            collapseDelay:
              platform.collapseDelay
          });
        }
      }
    );
  }

  function platformCollision(platform) {
    /*
      A platform is treated as a hazardous
      floor zone when inactive.

      It is not a physical wall.
    */

    return (
      !platform.active &&
      circleRect(
        state.player.x,
        state.player.y,
        PLAYER_RADIUS,
        platform
      )
    );
  }

  // ==================================================
  // 13. ECHO-ACTIVATED TRAPS
  // ==================================================

  function updateEchoTraps() {
    state.hazards.traps.forEach(
      trap => {
        const echoInside =
          state.echoes.some(echo => {
            const position =
              getEchoPosition(echo);

            return distance(
              position.x,
              position.y,
              trap.x,
              trap.y
            ) <= (
              (trap.radius ?? 22) +
              PLAYER_RADIUS
            );
          });

        const playerInside =
          distance(
            state.player.x,
            state.player.y,
            trap.x,
            trap.y
          ) <= (
            (trap.radius ?? 22) +
            PLAYER_RADIUS
          );

        const triggerPresent =
          trap.trigger === "player"
            ? playerInside
            : trap.trigger === "both"
              ? playerInside || echoInside
              : echoInside;

        const cooldown =
          trap.cooldown ?? 1.5;

        if (
          triggerPresent &&
          state.time -
          trap.lastActivation >= cooldown &&
          state.time -
          trap.triggeredAt >= cooldown
        ) {
          trap.triggeredAt =
            state.time;

          trap.lastActivation =
            state.time;

          trap.activations++;

          emit("traptrigger", {
            trapId: trap.id,
            activations:
              trap.activations
          });

          playSound("warning");
        }

        const sinceTrigger =
          state.time -
          trap.triggeredAt;

        const delay =
          trap.activationDelay ?? 0.3;

        const duration =
          trap.activeDuration ?? 1.2;

        trap.active =
          sinceTrigger >= delay &&
          sinceTrigger <
            delay + duration;
      }
    );
  }

  function trapCollision(trap) {
    if (!trap.active) {
      return false;
    }

    if (trap.effect === "laser") {
      /*
        Creates a temporary vertical beam
        across the trap's position.
      */

      return segmentDistance(
        state.player.x,
        state.player.y,
        trap.x,
        Math.max(
          20,
          trap.y - 95
        ),
        trap.x,
        Math.min(
          H - 20,
          trap.y + 95
        )
      ) <= PLAYER_RADIUS + 5;
    }

    return distance(
      state.player.x,
      state.player.y,
      trap.x,
      trap.y
    ) <= (
      (trap.radius ?? 22) +
      PLAYER_RADIUS
    );
  }

  // ==================================================
  // 14. PORTALS
  // ==================================================

  function updatePortals(dt) {
    state.portalCooldown = Math.max(
      0,
      state.portalCooldown - dt
    );

    if (state.portalCooldown > 0) {
      return;
    }

    for (
      const portal of
      state.level.portals || []
    ) {
      const radius =
        portal.radius ?? 22;

      if (
        distance(
          state.player.x,
          state.player.y,
          portal.x,
          portal.y
        ) > radius + PLAYER_RADIUS
      ) {
        continue;
      }

      state.player.x = clamp(
        portal.targetX,
        PLAYER_RADIUS,
        W - PLAYER_RADIUS
      );

      state.player.y = clamp(
        portal.targetY,
        PLAYER_RADIUS,
        H - PLAYER_RADIUS
      );

      state.portalCooldown =
        Math.max(
          0.5,
          portal.cooldown ?? 0.6
        );

      state.portalsUsed++;

      playSound("portal");

      emit("portal", {
        portalsUsed:
          state.portalsUsed
      });

      triggerGlitch();

      break;
    }
  }

  // ==================================================
  // 15. COLLISION SYSTEM
  // ==================================================

  function solidCollision(x, y) {
    const candidate = {
      x,
      y
    };

    const walls = WORLD.walls || [];

    for (const wall of walls) {
      if (
        circleRect(
          candidate.x,
          candidate.y,
          PLAYER_RADIUS,
          wall
        )
      ) {
        return true;
      }
    }

    if (
      !state.doorOpen &&
      WORLD.door &&
      circleRect(
        x,
        y,
        PLAYER_RADIUS,
        WORLD.door
      )
    ) {
      return true;
    }

    for (
      const wall of
      state.hazards.phaseWalls
    ) {
      if (
        wall.active &&
        circleRect(
          x,
          y,
          PLAYER_RADIUS,
          wall
        )
      ) {
        return true;
      }
    }

    return false;
  }

  function checkHazardCollision() {
    for (
      const laser of
      state.hazards.lasers
    ) {
      if (laserCollision(laser)) {
        killPlayer("laser");
        return true;
      }
    }

    for (
      const platform of
      state.hazards.platforms
    ) {
      if (
        platformCollision(platform)
      ) {
        killPlayer("platform");
        return true;
      }
    }

    for (
      const trap of
      state.hazards.traps
    ) {
      if (trapCollision(trap)) {
        killPlayer("echo-trap");
        return true;
      }
    }

    return false;
  }

  // ==================================================
  // 16. MOVEMENT
  // ==================================================

  function getMovement() {
    let x = 0;
    let y = 0;

    const pressed = key =>
      keys.has(key) ||
      mobileKeys.has(key);

    if (
      pressed("arrowleft") ||
      pressed("a")
    ) {
      x--;
    }

    if (
      pressed("arrowright") ||
      pressed("d")
    ) {
      x++;
    }

    if (
      pressed("arrowup") ||
      pressed("w")
    ) {
      y--;
    }

    if (
      pressed("arrowdown") ||
      pressed("s")
    ) {
      y++;
    }

    if (
      state.controlMode ===
      "joystick"
    ) {
      x += state.joystick.x;
      y += state.joystick.y;
    }

    const length = Math.hypot(x, y);

    if (length > 1) {
      x /= length;
      y /= length;
    }

    return { x, y };
  }

  function movePlayer(dt) {
    const movement =
      getMovement();

    if (
      movement.x === 0 &&
      movement.y === 0
    ) {
      return;
    }

    if (!state.firstMoveSent) {
      state.firstMoveSent = true;

      emit("firstmove");
    }

    const speed =
      PLAYER_SPEED * dt;

    const nextX = clamp(
      state.player.x +
        movement.x * speed,
      PLAYER_RADIUS,
      W - PLAYER_RADIUS
    );

    const nextY = clamp(
      state.player.y +
        movement.y * speed,
      PLAYER_RADIUS,
      H - PLAYER_RADIUS
    );

    /*
      Resolve X and Y independently
      to allow sliding along walls.
    */

    if (
      !solidCollision(
        nextX,
        state.player.y
      )
    ) {
      state.player.x = nextX;
    }

    if (
      !solidCollision(
        state.player.x,
        nextY
      )
    ) {
      state.player.y = nextY;
    }
  }

  // ==================================================
  // 17. DEATH AND CYCLE MANAGEMENT
  // ==================================================

  function setStatus(text) {
    setText(UI.status, text);
  }

  function killPlayer(reason) {
    if (!state.running) {
      return;
    }

    state.deaths++;
    state.lastDeathReason = reason;

    state.score = Math.max(
      0,
      state.score - 100
    );

    storageCall("registerDeath");

    playSound("fail");

    emit("death", {
      reason,
      deaths: state.deaths
    });

    triggerGlitch();

    setStatus(
      `TEMPORAL FAILURE: ${reason.toUpperCase()}`
    );

    endCycle("death");
  }

  function endCycle(reason = "timeout") {
    if (!state.running) {
      return;
    }

    recordPosition();

    finishRecording();

    emit("cycleend", {
      reason,
      echoes: state.echoes.length
    });

    if (
      state.cycle >=
      state.maxCycles
    ) {
      loseGame();
      return;
    }

    state.cycle++;

    state.time = 0;
    state.elapsed = 0;

    resetPlayer();
    resetCycleHazards();

    recordPosition();

    emit("cyclestart", {
      echoes: state.echoes.length
    });

    setStatus(
      `CYCLE ${state.cycle} INITIALIZED`
    );

    updateHUD();
  }

  // ==================================================
  // 18. WIN / LOSE
  // ==================================================

  function goalReached() {
    const goal = WORLD.goal;

    return circleRect(
      state.player.x,
      state.player.y,
      PLAYER_RADIUS,
      goal
    );
  }

  function calculateScore() {
    const timeBonus =
      Math.round(
        Math.max(
          0,
          state.cycleDuration -
          state.time
        ) * 100
      );

    const cycleBonus =
      Math.max(
        0,
        state.maxCycles -
        state.cycle
      ) * 120;

    const base = 1000;

    return Math.max(
      100,
      base +
      timeBonus +
      cycleBonus -
      state.deaths * 75 -
      state.shifts * 50
    );
  }

  function calculateMedal(score) {
    if (
      state.deaths === 0 &&
      state.cycle <= 3 &&
      score >= 1500
    ) {
      return "gold";
    }

    if (
      state.deaths <= 2 &&
      state.cycle <= 5 &&
      score >= 1000
    ) {
      return "silver";
    }

    return "bronze";
  }

  function medalEmoji(medal) {
    return {
      gold: "🥇",
      silver: "🥈",
      bronze: "🥉"
    }[medal] || "";
  }

  function saveMedal(medal) {
    const index = state.levelIndex;

    /*
      Prefer the existing storage API.
      Keep the old medal key as fallback.
    */

    const saved = storageCall(
      "saveMedal",
      index,
      medal
    );

    if (saved !== undefined) {
      return;
    }

    const medals = localRead(
      MEDAL_KEY,
      {}
    );

    const rank = {
      bronze: 1,
      silver: 2,
      gold: 3
    };

    const current =
      medals[index];

    if (
      !current ||
      rank[medal] >
      (rank[current] || 0)
    ) {
      medals[index] = medal;
      localWrite(MEDAL_KEY, medals);
    }
  }

  function updateMedalSummary() {
    const stored =
      storageCall("getMedals");

    const medals =
      stored && typeof stored === "object"
        ? stored
        : localRead(MEDAL_KEY, {});

    const values = Array.isArray(medals)
      ? medals
      : Object.values(medals);

    const count = name =>
      values.filter(
        value =>
          value === name ||
          value?.medal === name
      ).length;

    setText(
      UI.medalSummary,
      `🥇 ${count("gold")}   ` +
      `🥈 ${count("silver")}   ` +
      `🥉 ${count("bronze")}`
    );
  }

  function saveVictory(score, medal) {
    /*
      GameStorage v0.7 keeps the existing
      progress from earlier versions.
    */

    storageCall(
      "win",
      state.levelIndex,
      score
    );

    saveMedal(medal);

    const progress =
      getFallbackProgress();

    const number =
      state.levelIndex + 1;

    if (
      !progress.completed.includes(
        number
      )
    ) {
      progress.completed.push(
        number
      );
    }

    progress.unlocked = Math.max(
      progress.unlocked,
      Math.min(
        LEVELS.length,
        number + 1
      )
    );

    progress.best[number] = Math.max(
      progress.best[number] || 0,
      score
    );

    saveFallbackProgress(progress);
  }

  function winGame() {
    if (!state.running) {
      return;
    }

    state.running = false;
    state.finished = true;
    state.won = true;

    state.score = calculateScore();

    const medal =
      calculateMedal(state.score);

    saveVictory(
      state.score,
      medal
    );

    playSound("win");
    playSound(medal);

    emit("win", {
      medal,
      deaths: state.deaths,
      shifts: state.shifts,
      cyclesUsed: state.cycle,
      timeRemaining:
        state.cycleDuration -
        state.time
    });

    document.body.classList.add(
      "game-winning"
    );

    setText(
      UI.overlayTitle,
      "LEVEL COMPLETED"
    );

    setText(
      UI.overlayMessage,
      state.levelIndex ===
      LEVELS.length - 1
        ? "Concluíste SYSTEM REBELLION. O paradoxo foi superado."
        : "Simulação concluída. O próximo sector foi desbloqueado."
    );

    setText(
      UI.finalScore,
      state.score
    );

    setText(
      UI.medalResult,
      `${medalEmoji(medal)} ${medal.toUpperCase()}`
    );

    setHidden(
      UI.nextBtn,
      state.levelIndex >=
        LEVELS.length - 1
    );

    setHidden(
      UI.overlay,
      false
    );

    setStatus(
      "SIMULATION COMPLETED"
    );

    renderLevelGrid();
    updateMedalSummary();
    updateHUD();
  }

  function loseGame() {
    state.running = false;
    state.finished = true;
    state.won = false;

    playSound("fail");

    emit("lose", {
      deaths: state.deaths,
      shifts: state.shifts,
      reason: "cycles-exhausted"
    });

    document.body.classList.add(
      "game-losing"
    );

    setText(
      UI.overlayTitle,
      "TEMPORAL COLLAPSE"
    );

    setText(
      UI.overlayMessage,
      "Os ciclos terminaram. Os teus ecos não conseguiram estabilizar a realidade."
    );

    setText(
      UI.finalScore,
      state.score
    );

    setText(
      UI.medalResult,
      ""
    );

    setHidden(
      UI.nextBtn,
      true
    );

    setHidden(
      UI.overlay,
      false
    );

    setStatus(
      "SYSTEM FAILURE"
    );

    updateHUD();
  }

  // ==================================================
  // 19. GAME LOOP
  // ==================================================

  function update(dt) {
    if (!state.running) {
      return;
    }

    state.time += dt;
    state.elapsed += dt;

    updateDoor();
    updatePhaseWalls();
    updateLasers();
    updatePlatforms();
    updateEchoTraps();

    movePlayer(dt);
    updatePortals(dt);

    /*
      Re-evaluate plates after movement,
      so a newly pressed plate can open
      the door immediately.
    */

    updateDoor();

    recordPosition();

    if (checkHazardCollision()) {
      return;
    }

    if (goalReached()) {
      winGame();
      return;
    }

    const remaining =
      state.cycleDuration -
      state.time;

    if (
      remaining <= 2 &&
      !state.warningSent
    ) {
      state.warningSent = true;

      emit("timecritical", {
        remaining
      });

      playSound("warning");
    }

    if (
      state.time >=
      state.cycleDuration
    ) {
      endCycle("timeout");
      return;
    }

    updateHUD();
    updateObstaclePanel();
  }

  function frame(timestamp) {
    if (!state.lastFrame) {
      state.lastFrame = timestamp;
    }

    const dt = clamp(
      (timestamp - state.lastFrame) /
        1000,
      0,
      MAX_DT
    );

    state.lastFrame = timestamp;

    if (state.running) {
      state.accumulator += dt;

      let iterations = 0;

      while (
        state.accumulator >=
          FIXED_STEP &&
        iterations < 6
      ) {
        update(FIXED_STEP);

        state.accumulator -=
          FIXED_STEP;

        iterations++;
      }
    } else {
      state.accumulator = 0;
    }

    render();

    requestAnimationFrame(frame);
  }

  // ==================================================
  // 20. CANVAS DRAW HELPERS
  // ==================================================

  function drawGlowCircle(
    x,
    y,
    radius,
    color,
    glow = 15
  ) {
    ctx.save();

    ctx.shadowBlur = glow;
    ctx.shadowColor = color;

    ctx.fillStyle = color;

    ctx.beginPath();
    ctx.arc(
      x,
      y,
      radius,
      0,
      Math.PI * 2
    );
    ctx.fill();

    ctx.restore();
  }

  function drawGrid() {
    ctx.strokeStyle =
      COLORS.grid;

    ctx.lineWidth = 1;

    ctx.beginPath();

    for (
      let x = 0;
      x <= W;
      x += 40
    ) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, H);
    }

    for (
      let y = 0;
      y <= H;
      y += 40
    ) {
      ctx.moveTo(0, y);
      ctx.lineTo(W, y);
    }

    ctx.stroke();
  }

  function drawBackground() {
    ctx.fillStyle =
      COLORS.background;

    ctx.fillRect(
      0,
      0,
      W,
      H
    );

    drawGrid();

    const gradient =
      ctx.createRadialGradient(
        W / 2,
        H / 2,
        40,
        W / 2,
        H / 2,
        500
      );

    gradient.addColorStop(
      0,
      "rgba(37,69,119,0.13)"
    );

    gradient.addColorStop(
      1,
      "rgba(0,0,0,0)"
    );

    ctx.fillStyle = gradient;

    ctx.fillRect(
      0,
      0,
      W,
      H
    );
  }

  function drawWalls() {
    const walls =
      WORLD.walls || [];

    ctx.fillStyle =
      COLORS.wall;

    ctx.strokeStyle =
      "rgba(72,246,255,0.35)";

    ctx.lineWidth = 2;

    walls.forEach(wall => {
      ctx.fillRect(
        wall.x,
        wall.y,
        wall.w,
        wall.h
      );

      ctx.strokeRect(
        wall.x,
        wall.y,
        wall.w,
        wall.h
      );
    });

    if (WORLD.door) {
      const door =
        WORLD.door;

      if (state.doorOpen) {
        ctx.save();

        ctx.strokeStyle =
          COLORS.green;

        ctx.shadowColor =
          COLORS.green;

        ctx.shadowBlur = 14;

        ctx.setLineDash([
          5,
          8
        ]);

        ctx.strokeRect(
          door.x,
          door.y,
          door.w,
          door.h
        );

        ctx.restore();
      } else {
        ctx.save();

        ctx.fillStyle =
          "rgba(255,76,105,0.6)";

        ctx.shadowColor =
          COLORS.red;

        ctx.shadowBlur = 16;

        ctx.fillRect(
          door.x,
          door.y,
          door.w,
          door.h
        );

        ctx.restore();
      }
    }
  }

  function drawGoal() {
    const goal =
      WORLD.goal;

    ctx.save();

    ctx.fillStyle =
      "rgba(82,255,187,0.1)";

    ctx.strokeStyle =
      COLORS.green;

    ctx.lineWidth = 3;

    ctx.shadowColor =
      COLORS.green;

    ctx.shadowBlur = 20;

    ctx.fillRect(
      goal.x,
      goal.y,
      goal.w,
      goal.h
    );

    ctx.strokeRect(
      goal.x,
      goal.y,
      goal.w,
      goal.h
    );

    ctx.restore();

    ctx.fillStyle =
      COLORS.green;

    ctx.font =
      "bold 11px monospace";

    ctx.textAlign =
      "center";

    ctx.fillText(
      "EXIT",
      goal.x + goal.w / 2,
      goal.y - 12
    );
  }

  function drawPlates() {
    (state.level.plates || [])
      .forEach(plate => {
        const pressed =
          isPlatePressed(plate);

        const color = pressed
          ? COLORS.green
          : plate.color ||
            COLORS.cyan;

        ctx.save();

        ctx.strokeStyle = color;

        ctx.fillStyle = pressed
          ? "rgba(82,255,187,0.22)"
          : "rgba(72,246,255,0.08)";

        ctx.lineWidth = 3;

        ctx.shadowColor = color;
        ctx.shadowBlur = pressed
          ? 22
          : 8;

        ctx.beginPath();

        ctx.arc(
          plate.x,
          plate.y,
          plate.radius ?? 23,
          0,
          Math.PI * 2
        );

        ctx.fill();
        ctx.stroke();

        ctx.restore();

        ctx.fillStyle = color;
        ctx.font =
          "bold 12px monospace";

        ctx.textAlign =
          "center";

        ctx.fillText(
          pressed ? "ON" : "PLATE",
          plate.x,
          plate.y + 4
        );
      });
  }

  function drawLasers() {
    state.hazards.lasers.forEach(
      laser => {
        const x1 =
          laser.currentX1;

        const y1 =
          laser.currentY1;

        const x2 =
          laser.currentX2;

        const y2 =
          laser.currentY2;

        ctx.save();

        ctx.strokeStyle =
          laser.enabled
            ? laser.color ||
              COLORS.red
            : "rgba(255,76,105,0.16)";

        ctx.lineWidth =
          laser.enabled
            ? laser.width ?? 5
            : 2;

        ctx.shadowColor =
          COLORS.red;

        ctx.shadowBlur =
          laser.enabled
            ? 20
            : 0;

        if (!laser.enabled) {
          ctx.setLineDash([
            6,
            10
          ]);
        }

        ctx.beginPath();

        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);

        ctx.stroke();

        ctx.restore();

        drawGlowCircle(
          x1,
          y1,
          5,
          laser.enabled
            ? COLORS.red
            : COLORS.muted,
          8
        );

        drawGlowCircle(
          x2,
          y2,
          5,
          laser.enabled
            ? COLORS.red
            : COLORS.muted,
          8
        );
      }
    );
  }

  function drawPhaseWalls() {
    state.hazards.phaseWalls.forEach(
      wall => {
        ctx.save();

        ctx.globalAlpha =
          wall.active
            ? 0.9
            : 0.16;

        ctx.fillStyle =
          "rgba(166,107,255,0.4)";

        ctx.strokeStyle =
          wall.color ||
          COLORS.purple;

        ctx.lineWidth = 2;

        ctx.shadowColor =
          COLORS.purple;

        ctx.shadowBlur =
          wall.active ? 15 : 0;

        ctx.fillRect(
          wall.x,
          wall.y,
          wall.w,
          wall.h
        );

        ctx.strokeRect(
          wall.x,
          wall.y,
          wall.w,
          wall.h
        );

        ctx.restore();
      }
    );
  }

  function drawPlatforms() {
    state.hazards.platforms.forEach(
      platform => {
        ctx.save();

        ctx.fillStyle =
          platform.active
            ? "rgba(72,246,255,0.11)"
            : "rgba(255,76,105,0.14)";

        ctx.strokeStyle =
          platform.active
            ? COLORS.cyan
            : COLORS.red;

        ctx.lineWidth = 2;

        ctx.setLineDash([
          8,
          5
        ]);

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

        ctx.fillStyle =
          platform.active
            ? COLORS.cyan
            : COLORS.red;

        ctx.font =
          "bold 10px monospace";

        ctx.textAlign =
          "center";

        ctx.fillText(
          platform.active
            ? "STABLE"
            : "COLLAPSED",
          platform.x +
            platform.w / 2,
          platform.y +
            platform.h / 2
        );
      }
    );
  }

  function drawTraps() {
    state.hazards.traps.forEach(
      trap => {
        const color =
          trap.active
            ? COLORS.red
            : COLORS.pink;

        ctx.save();

        ctx.strokeStyle = color;

        ctx.fillStyle =
          trap.active
            ? "rgba(255,76,105,0.2)"
            : "rgba(255,78,184,0.08)";

        ctx.lineWidth = 2;

        ctx.shadowColor = color;

        ctx.shadowBlur =
          trap.active ? 20 : 8;

        ctx.beginPath();

        ctx.arc(
          trap.x,
          trap.y,
          trap.radius ?? 22,
          0,
          Math.PI * 2
        );

        ctx.fill();
        ctx.stroke();

        ctx.restore();

        if (
          trap.active &&
          trap.effect === "laser"
        ) {
          ctx.save();

          ctx.strokeStyle =
            COLORS.red;

          ctx.lineWidth = 7;

          ctx.shadowColor =
            COLORS.red;

          ctx.shadowBlur = 20;

          ctx.beginPath();

          ctx.moveTo(
            trap.x,
            Math.max(
              20,
              trap.y - 95
            )
          );

          ctx.lineTo(
            trap.x,
            Math.min(
              H - 20,
              trap.y + 95
            )
          );

          ctx.stroke();

          ctx.restore();
        }
      }
    );
  }

  function drawPortals() {
    (state.level.portals || [])
      .forEach(portal => {
        const pulse =
          1 +
          Math.sin(
            performance.now() /
              230
          ) * 0.08;

        ctx.save();

        ctx.translate(
          portal.x,
          portal.y
        );

        ctx.strokeStyle =
          portal.color ||
          COLORS.purple;

        ctx.lineWidth = 4;

        ctx.shadowColor =
          COLORS.purple;

        ctx.shadowBlur = 22;

        ctx.beginPath();

        ctx.arc(
          0,
          0,
          (portal.radius ?? 22) *
            pulse,
          0,
          Math.PI * 2
        );

        ctx.stroke();

        ctx.beginPath();

        ctx.arc(
          0,
          0,
          9,
          0,
          Math.PI * 2
        );

        ctx.stroke();

        ctx.restore();
      });
  }

  function drawEchoes() {
    state.echoes.forEach(
      (echo, index) => {
        const position =
          getEchoPosition(echo);

        const color =
          echo.frozen
            ? COLORS.pink
            : COLORS.purple;

        ctx.save();

        ctx.globalAlpha =
          echo.frozen
            ? 0.9
            : 0.58;

        drawGlowCircle(
          position.x,
          position.y,
          PLAYER_RADIUS,
          color,
          15
        );

        ctx.restore();

        ctx.fillStyle =
          COLORS.white;

        ctx.font =
          "bold 9px monospace";

        ctx.textAlign =
          "center";

        ctx.fillText(
          `E${index + 1}`,
          position.x,
          position.y - 19
        );
      });
  }

  function drawPlayer() {
    const player =
      state.player;

    ctx.save();

    ctx.shadowColor =
      COLORS.cyan;

    ctx.shadowBlur = 25;

    ctx.fillStyle =
      COLORS.cyan;

    ctx.beginPath();

    ctx.arc(
      player.x,
      player.y,
      PLAYER_RADIUS,
      0,
      Math.PI * 2
    );

    ctx.fill();

    ctx.shadowBlur = 0;

    ctx.fillStyle =
      "#05121b";

    ctx.beginPath();

    ctx.arc(
      player.x,
      player.y,
      4,
      0,
      Math.PI * 2
    );

    ctx.fill();

    ctx.restore();
  }

  function drawArenaLabels() {
    ctx.fillStyle =
      "rgba(72,246,255,0.5)";

    ctx.font =
      "bold 10px monospace";

    ctx.textAlign =
      "left";

    ctx.fillText(
      `SECTOR ${String(
        state.levelIndex + 1
      ).padStart(2, "0")}`,
      18,
      24
    );

    ctx.textAlign =
      "right";

    ctx.fillText(
      "ECHO//404 v0.8",
      W - 18,
      24
    );

    ctx.textAlign =
      "center";

    ctx.fillStyle =
      "rgba(166,107,255,0.45)";

    ctx.fillText(
      "MANUEL SAMPAIO01",
      W / 2,
      H - 14
    );
  }

  function render() {
    ctx.clearRect(
      0,
      0,
      W,
      H
    );

    drawBackground();
    drawPlatforms();
    drawWalls();
    drawPhaseWalls();
    drawGoal();
    drawPlates();
    drawPortals();
    drawTraps();
    drawLasers();
    drawEchoes();
    drawPlayer();
    drawArenaLabels();
  }

  // ==================================================
  // 21. HUD
  // ==================================================

  function updateHUD() {
    const remaining =
      Math.max(
        0,
        state.cycleDuration -
        state.time
      );

    setText(
      UI.cycle,
      `${state.cycle} / ${state.maxCycles}`
    );

    setText(
      UI.timer,
      remaining.toFixed(1)
    );

    setText(
      UI.ghosts,
      state.echoes.length
    );

    setText(
      UI.score,
      state.score
    );

    setText(
      UI.best,
      getBest(state.levelIndex)
    );

    if (UI.timerBar) {
      const percent = clamp(
        remaining /
          state.cycleDuration *
          100,
        0,
        100
      );

      UI.timerBar.style.width =
        `${percent}%`;

      UI.timerBar.classList.toggle(
        "warning",
        remaining <= 3 &&
          remaining > 2
      );

      UI.timerBar.classList.toggle(
        "critical",
        remaining <= 2
      );
    }

    if (UI.timerCard) {
      UI.timerCard.classList.toggle(
        "warning",
        remaining <= 3 &&
          remaining > 2
      );

      UI.timerCard.classList.toggle(
        "critical",
        remaining <= 2 &&
          state.running
      );
    }

    document.body.classList.toggle(
      "game-critical",
      remaining <= 2 &&
        state.running
    );

    setHidden(
      UI.warning,
      !(
        remaining <= 2 &&
        state.running
      )
    );

    if (UI.startBtn) {
      UI.startBtn.disabled =
        state.running;
    }

    if (UI.shiftBtn) {
      UI.shiftBtn.disabled =
        !state.running ||
        !state.echoes.some(
          echo => !echo.frozen
        );
    }
  }

  function updateObstaclePanel() {
    const lasers =
      state.hazards.lasers;

    const moving =
      lasers.filter(
        laser => laser.moving
      );

    const walls =
      state.hazards.phaseWalls;

    const platforms =
      state.hazards.platforms;

    const traps =
      state.hazards.traps;

    const total =
      lasers.length +
      walls.length +
      platforms.length +
      traps.length;

    setText(
      UI.obstacleCount,
      `${total} CONFIGURED`
    );

    setText(
      UI.movingLaserStatus,
      moving.length
        ? `${moving.length} ACTIVE`
        : "NONE"
    );

    setText(
      UI.phaseWallStatus,
      walls.length
        ? `${
            walls.filter(
              wall => wall.active
            ).length
          } SOLID`
        : "NONE"
    );

    setText(
      UI.platformStatus,
      platforms.length
        ? `${
            platforms.filter(
              platform =>
                platform.active
            ).length
          } STABLE`
        : "NONE"
    );

    setText(
      UI.echoTrapStatus,
      traps.length
        ? `${
            traps.filter(
              trap => trap.active
            ).length
          } TRIGGERED`
        : "NONE"
    );

    const threat =
      state.level.threatLevel ||
      "LOW";

    setText(
      UI.threatLevel,
      `THREAT LEVEL: ${threat}`
    );

    setText(
      UI.arenaThreat,
      total
        ? `${total} TEMPORAL ANOMALIES`
        : "NO ANOMALIES DETECTED"
    );

    if (UI.threatLevel) {
      UI.threatLevel.classList.toggle(
        "warning",
        threat === "MODERATE" ||
          threat === "HIGH"
      );

      UI.threatLevel.classList.toggle(
        "critical",
        threat === "CRITICAL" ||
          threat === "SEVERE"
      );
    }
  }

  // ==================================================
  // 22. LEVEL SELECTION
  // ==================================================

  function renderLevelGrid() {
    if (!UI.levelGrid) {
      return;
    }

    UI.levelGrid.innerHTML = "";

    LEVELS.forEach(
      (level, index) => {
        const button =
          document.createElement(
            "button"
          );

        button.type = "button";
        button.textContent =
          index + 1;

        const unlocked =
          isUnlocked(index);

        const completed =
          isCompleted(index);

        button.disabled =
          !unlocked;

        button.classList.toggle(
          "locked",
          !unlocked
        );

        button.classList.toggle(
          "completed",
          completed
        );

        button.classList.toggle(
          "selected",
          index ===
            state.levelIndex
        );

        button.title =
          unlocked
            ? level.name
            : "Nível bloqueado";

        button.addEventListener(
          "click",
          () => {
            selectLevel(index);
          }
        );

        UI.levelGrid.appendChild(
          button
        );
      }
    );

    const completedCount =
      LEVELS.filter(
        (_, index) =>
          isCompleted(index)
      ).length;

    setText(
      UI.progress,
      `${completedCount} / ${LEVELS.length} COMPLETED`
    );
  }

  function selectLevel(index) {
    if (
      !Number.isInteger(index) ||
      index < 0 ||
      index >= LEVELS.length ||
      !isUnlocked(index)
    ) {
      return false;
    }

    state.levelIndex = index;
    state.level = LEVELS[index];

    resetLevelState();

    setText(
      UI.levelName,
      state.level.name
    );

    setText(
      UI.levelHint,
      state.level.description ||
      state.level.aiHint ||
      ""
    );

    setText(
      UI.difficulty,
      state.level.difficulty ||
      "UNKNOWN"
    );

    if (UI.difficulty) {
      const difficulty =
        String(
          state.level.difficulty || ""
        ).toLowerCase();

      UI.difficulty.className =
        "difficulty-badge";

      if (
        difficulty.includes(
          "interm"
        )
      ) {
        UI.difficulty.classList.add(
          "medium"
        );
      }

      if (
        difficulty.includes(
          "avan"
        ) ||
        difficulty.includes(
          "expert"
        ) ||
        difficulty.includes(
          "insano"
        ) ||
        difficulty.includes(
          "rebellion"
        )
      ) {
        UI.difficulty.classList.add(
          "hard"
        );
      }
    }

    setText(
      UI.overlayTitle,
      "ECHO//404"
    );

    setText(
      UI.overlayMessage,
      state.level.description
    );

    setText(
      UI.finalScore,
      0
    );

    setHidden(
      UI.overlay,
      false
    );

    setHidden(
      UI.nextBtn,
      true
    );

    setStatus(
      "SYSTEM READY"
    );

    renderLevelGrid();
    updateHUD();
    updateObstaclePanel();

    emit("levelselected", {
      name: state.level.name,
      difficulty:
        state.level.difficulty,
      aiMood:
        state.level.aiMood,
      aiIntro:
        state.level.aiIntro,
      aiHint:
        state.level.aiHint,
      threatLevel:
        state.level.threatLevel
    });

    return true;
  }

  // ==================================================
  // 23. START / RESTART
  // ==================================================

  function startGame() {
    if (state.running) {
      return;
    }

    resetLevelState();

    state.running = true;
    state.levelAttempts++;

    storageCall(
      "registerAttempt"
    );

    setHidden(
      UI.overlay,
      true
    );

    setStatus(
      "SIMULATION RUNNING"
    );

    recordPosition();

    playSound("start");

    emit("start", {
      attempt:
        state.levelAttempts,
      aiIntro:
        state.level.aiIntro,
      aiMood:
        state.level.aiMood
    });

    emit("cyclestart", {
      echoes: 0
    });

    updateHUD();
  }

  function restartGame() {
    resetLevelState();

    setText(
      UI.overlayTitle,
      "SIMULATION RESET"
    );

    setText(
      UI.overlayMessage,
      "A realidade foi restaurada. Prepara a próxima tentativa."
    );

    setHidden(
      UI.overlay,
      false
    );

    setHidden(
      UI.nextBtn,
      true
    );

    setStatus(
      "SIMULATION RESET"
    );

    emit("restart");

    playSound("click");

    updateHUD();
  }

  // ==================================================
  // 24. VISUAL EFFECTS
  // ==================================================

  function triggerGlitch() {
    const targets = [
      UI.arenaGlitch,
      UI.globalGlitch
    ];

    targets.forEach(
      element => {
        if (!element) {
          return;
        }

        element.classList.remove(
          "active"
        );

        void element.offsetWidth;

        element.classList.add(
          "active"
        );
      }
    );
  }

  // ==================================================
  // 25. KEYBOARD CONTROLS
  // ==================================================

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

  window.addEventListener(
    "keydown",
    event => {
      const target =
        event.target;

      if (
        target &&
        (
          target.tagName ===
            "INPUT" ||
          target.tagName ===
            "TEXTAREA" ||
          target.isContentEditable
        )
      ) {
        return;
      }

      const key =
        event.key.toLowerCase();

      if (
        movementKeys.has(key) ||
        key === " "
      ) {
        event.preventDefault();
      }

      if (movementKeys.has(key)) {
        keys.add(key);
      }

      if (
        key === " " &&
        !event.repeat
      ) {
        paradoxShift();
      }

      if (
        key === "r" &&
        !event.repeat
      ) {
        restartGame();
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
    clearInput
  );

  // ==================================================
  // 26. MOBILE D-PAD
  // ==================================================

  const directionMap = {
    up: "arrowup",
    down: "arrowdown",
    left: "arrowleft",
    right: "arrowright"
  };

  document.querySelectorAll(
    ".dpad-btn"
  ).forEach(button => {
    const direction =
      button.dataset.direction;

    const key =
      directionMap[direction];

    if (!key) {
      return;
    }

    const press = event => {
      event.preventDefault();

      mobileKeys.add(key);

      button.classList.add(
        "pressed"
      );

      if (
        event.pointerId !==
        undefined
      ) {
        try {
          button.setPointerCapture(
            event.pointerId
          );
        } catch {
          // Ignore unsupported capture.
        }
      }
    };

    const release = event => {
      event.preventDefault();

      mobileKeys.delete(key);

      button.classList.remove(
        "pressed"
      );
    };

    button.addEventListener(
      "pointerdown",
      press
    );

    button.addEventListener(
      "pointerup",
      release
    );

    button.addEventListener(
      "pointercancel",
      release
    );

    button.addEventListener(
      "lostpointercapture",
      () => {
        mobileKeys.delete(key);

        button.classList.remove(
          "pressed"
        );
      }
    );

    button.addEventListener(
      "contextmenu",
      event =>
        event.preventDefault()
    );
  });

  // ==================================================
  // 27. MOBILE JOYSTICK
  // ==================================================

  function updateJoystickPosition(
    clientX,
    clientY
  ) {
    if (
      !UI.joystickBase ||
      !UI.joystickStick
    ) {
      return;
    }

    const rect =
      UI.joystickBase
        .getBoundingClientRect();

    const centerX =
      rect.left +
      rect.width / 2;

    const centerY =
      rect.top +
      rect.height / 2;

    const dx =
      clientX - centerX;

    const dy =
      clientY - centerY;

    const maxDistance =
      rect.width * 0.28;

    const length =
      Math.hypot(dx, dy);

    const scale =
      length > maxDistance
        ? maxDistance / length
        : 1;

    const x = dx * scale;
    const y = dy * scale;

    state.joystick.x =
      x / maxDistance;

    state.joystick.y =
      y / maxDistance;

    UI.joystickStick.style.transform =
      `translate(${x}px, ${y}px)`;
  }

  function releaseJoystick() {
    state.joystick.x = 0;
    state.joystick.y = 0;
    state.joystick.pointerId = null;

    if (UI.joystickStick) {
      UI.joystickStick.style.transform =
        "translate(0px, 0px)";
    }
  }

  if (UI.joystick) {
    UI.joystick.addEventListener(
      "pointerdown",
      event => {
        event.preventDefault();

        if (
          state.joystick.pointerId !==
          null
        ) {
          return;
        }

        state.joystick.pointerId =
          event.pointerId;

        UI.joystick.setPointerCapture(
          event.pointerId
        );

        updateJoystickPosition(
          event.clientX,
          event.clientY
        );
      }
    );

    UI.joystick.addEventListener(
      "pointermove",
      event => {
        if (
          event.pointerId !==
          state.joystick.pointerId
        ) {
          return;
        }

        event.preventDefault();

        updateJoystickPosition(
          event.clientX,
          event.clientY
        );
      }
    );

    UI.joystick.addEventListener(
      "pointerup",
      event => {
        if (
          event.pointerId ===
          state.joystick.pointerId
        ) {
          releaseJoystick();
        }
      }
    );

    UI.joystick.addEventListener(
      "pointercancel",
      releaseJoystick
    );

    UI.joystick.addEventListener(
      "lostpointercapture",
      releaseJoystick
    );
  }

  function setControlMode(mode) {
    state.controlMode =
      mode === "joystick"
        ? "joystick"
        : "dpad";

    clearInput();

    setHidden(
      UI.mobileDpad,
      state.controlMode ===
        "joystick"
    );

    setHidden(
      UI.joystick,
      state.controlMode !==
        "joystick"
    );

    setText(
      UI.controlModeBtn,
      state.controlMode ===
        "joystick"
        ? "CONTROL MODE: JOYSTICK"
        : "CONTROL MODE: D-PAD"
    );

    emit("controlmode", {
      mode: state.controlMode
    });
  }

  UI.controlModeBtn?.addEventListener(
    "click",
    () => {
      setControlMode(
        state.controlMode ===
          "dpad"
          ? "joystick"
          : "dpad"
      );
    }
  );

  // ==================================================
  // 28. BUTTON EVENTS
  // ==================================================

  UI.startBtn?.addEventListener(
    "click",
    startGame
  );

  UI.restartBtn?.addEventListener(
    "click",
    restartGame
  );

  UI.shiftBtn?.addEventListener(
    "click",
    paradoxShift
  );

  UI.playAgainBtn?.addEventListener(
    "click",
    startGame
  );

  UI.nextBtn?.addEventListener(
    "click",
    () => {
      if (
        state.levelIndex <
        LEVELS.length - 1
      ) {
        selectLevel(
          state.levelIndex + 1
        );
      }
    }
  );

  UI.mobileShift?.addEventListener(
    "click",
    paradoxShift
  );

  UI.mobileRestart?.addEventListener(
    "click",
    restartGame
  );

  UI.soundBtn?.addEventListener(
    "click",
    () => {
      muted = !muted;

      if (
        AUDIO &&
        typeof AUDIO.toggle ===
          "function"
      ) {
        try {
          AUDIO.toggle();
        } catch {
          // Audio is optional.
        }
      }

      setText(
        UI.soundBtn,
        muted ? "🔇" : "🔊"
      );

      storageCall(
        "setSound",
        !muted
      );
    }
  );

  // ==================================================
  // 29. PUBLIC API
  // ==================================================

  function getState() {
    return {
      levelIndex:
        state.levelIndex,

      level:
        state.levelIndex + 1,

      levelName:
        state.level.name,

      running:
        state.running,

      finished:
        state.finished,

      won:
        state.won,

      cycle:
        state.cycle,

      maxCycles:
        state.maxCycles,

      time:
        state.time,

      timeRemaining:
        Math.max(
          0,
          state.cycleDuration -
            state.time
        ),

      score:
        state.score,

      deaths:
        state.deaths,

      shifts:
        state.shifts,

      echoes:
        state.echoes.length,

      doorOpen:
        state.doorOpen,

      player: {
        ...state.player
      },

      hazards: {
        movingLasers:
          state.hazards.lasers
            .filter(
              laser => laser.moving
            ).length,

        activeLasers:
          state.hazards.lasers
            .filter(
              laser => laser.enabled
            ).length,

        activeWalls:
          state.hazards.phaseWalls
            .filter(
              wall => wall.active
            ).length,

        stablePlatforms:
          state.hazards.platforms
            .filter(
              platform =>
                platform.active
            ).length,

        activeTraps:
          state.hazards.traps
            .filter(
              trap => trap.active
            ).length
      }
    };
  }

  window.EchoGame = {
    version: "0.8",

    getState,

    start: startGame,

    restart: restartGame,

    shift: paradoxShift,

    selectLevel,

    getMedals() {
      return (
        storageCall("getMedals") ||
        localRead(MEDAL_KEY, {})
      );
    },

    getLevel() {
      return state.level;
    },

    getLevels() {
      return LEVELS;
    },

    setControlMode,

    triggerGlitch,

    debug() {
      console.table(getState());
      return getState();
    }
  };

  // ==================================================
  // 30. INITIALIZATION
  // ==================================================

  function initialize() {
    if (animationStarted) {
      return;
    }

    animationStarted = true;

    const soundEnabled =
      storageCall("getSound");

    if (
      typeof soundEnabled ===
      "boolean"
    ) {
      muted = !soundEnabled;
    }

    setText(
      UI.soundBtn,
      muted ? "🔇" : "🔊"
    );

    setControlMode("dpad");

    selectLevel(0);

    updateMedalSummary();

    requestAnimationFrame(frame);

    console.log(
      "=================================="
    );

    console.log(
      "ECHO//404 — SYSTEM REBELLION"
    );

    console.log(
      "GAME ENGINE v0.8 INITIALIZED"
    );

    console.log(
      "DYNAMIC OBSTACLES ONLINE"
    );

    console.log(
      "TEMPORAL ECHO SYSTEM ONLINE"
    );

    console.log(
      "MOBILE CONTROLS ONLINE"
    );

    console.log(
      "CREATED & DEVELOPED BY"
    );

    console.log(
      "MANUEL SAMPAIO01"
    );

    console.log(
      "=================================="
    );
  }

  if (
    document.readyState ===
    "loading"
  ) {
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
 ECHO//404 — SYSTEM REBELLION v0.8

 CREATED & DEVELOPED BY
 MANUEL SAMPAIO01

 © 2026 MANUEL SAMPAIO01
========================================================
*/
