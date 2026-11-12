
"use strict";

/*
==================================================
 ECHO//404 — PARADOX EVOLUTION
 VERSION 0.7 — THE AWAKENING
 FILE: game.js

 CREATED & DEVELOPED BY MANUEL SAMPAIO01

 DESKTOP + MOBILE
 DIFFICULTY EVOLUTION
 TEMPORAL EVENTS + MEDALS
==================================================
*/

// ==========================================
// 1. CANVAS E INTERFACE
// ==========================================

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

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
  medalResult: document.getElementById("awakeningMedalResult"),
  medalSummary: document.getElementById("awakeningMedalSummary"),
  startBtn: document.getElementById("startBtn"),
  restartBtn: document.getElementById("restartBtn"),
  shiftBtn: document.getElementById("shiftBtn"),
  soundBtn: document.getElementById("soundBtn"),
  playAgainBtn: document.getElementById("playAgainBtn"),
  nextBtn: document.getElementById("nextBtn"),
  mobileShiftBtn: document.getElementById("mobileShiftBtn"),
  mobileRestartBtn: document.getElementById("mobileRestartBtn"),
  moveUp: document.getElementById("moveUp"),
  moveDown: document.getElementById("moveDown"),
  moveLeft: document.getElementById("moveLeft"),
  moveRight: document.getElementById("moveRight")
};

const WORLD = GAME_WORLD;
const WIDTH = WORLD.width;
const HEIGHT = WORLD.height;
const MAX_CYCLES = WORLD.maxCycles;

canvas.width = WIDTH;
canvas.height = HEIGHT;

const COLORS = {
  cyan: "#00f5ff",
  purple: "#aa78ff",
  green: "#21ff9b",
  red: "#ff3868",
  yellow: "#ffd166",
  blue: "#478bff",
  white: "#e9faff"
};

const PLAYER_SIZE = 20;
const PLAYER_SPEED = 230;
const PLATE_RADIUS = 27;

// ==========================================
// 2. DIFICULDADE PROGRESSIVA
// ==========================================

const DIFFICULTY = {
  cycleSeconds: [
    10, 9, 8, 7, 6,
    5.5, 5, 4.5, 4, 3.5
  ],

  // A partir do nível 2, os lasers
  // aceleram progressivamente.
  laserSpeedMultiplier: [
    1, 1.08, 1.16, 1.25, 1.35,
    1.48, 1.62, 1.78, 1.95, 2.15
  ],

  // Pequena aceleração adicional
  // dentro do próprio nível.
  cycleLaserAcceleration: 0.035,

  // Penalização crescente por morte.
  deathPenaltyBase: 150,
  deathPenaltyPerLevel: 35,

  // Pontuação por nível.
  levelBonus: 250,

  // Tempo crítico: últimos 25%.
  criticalFraction: 0.25
};

function getCycleDuration(index = levelIndex) {
  const configured = DIFFICULTY.cycleSeconds[index];

  return Number.isFinite(configured)
    ? configured
    : Math.max(3.5, WORLD.cycleDuration || 10);
}

function getLaserMultiplier() {
  const base =
    DIFFICULTY.laserSpeedMultiplier[levelIndex] || 1;

  return base * (
    1 +
    (cycle - 1) *
    DIFFICULTY.cycleLaserAcceleration
  );
}

function getDeathPenalty() {
  return (
    DIFFICULTY.deathPenaltyBase +
    levelIndex * DIFFICULTY.deathPenaltyPerLevel
  );
}

// ==========================================
// 3. EVENTOS PARA AWAKENING.JS
// ==========================================

function emitGameEvent(name, details = {}) {
  const payload = {
    levelIndex,
    levelNumber: levelIndex + 1,
    cycle,
    maxCycles: MAX_CYCLES,
    elapsed,
    cycleDuration: getCycleDuration(),
    score,
    deaths,
    shifts,
    ghosts: recordings.length,
    ...details
  };

  window.dispatchEvent(
    new CustomEvent(`echo404:${name}`, {
      detail: payload
    })
  );
}

// ==========================================
// 4. CONTROLOS
// ==========================================

const keys = new Set();
const mobilePointers = new Map();

const mobileDirections = {
  up: UI.moveUp,
  down: UI.moveDown,
  left: UI.moveLeft,
  right: UI.moveRight
};

const movementKeys = new Set([
  "w", "a", "s", "d",
  "arrowup", "arrowdown",
  "arrowleft", "arrowright"
]);

function isDirectionPressed(direction) {
  const keyboardMap = {
    up: ["w", "arrowup"],
    down: ["s", "arrowdown"],
    left: ["a", "arrowleft"],
    right: ["d", "arrowright"]
  };

  const keyboardPressed = keyboardMap[direction]
    .some(key => keys.has(key));

  const touchPressed = Array.from(
    mobilePointers.values()
  ).includes(direction);

  return keyboardPressed || touchPressed;
}

function refreshMobileButtons() {
  for (const [direction, button] of
    Object.entries(mobileDirections)) {

    if (!button) continue;

    const pressed = Array.from(
      mobilePointers.values()
    ).includes(direction);

    button.classList.toggle("pressed", pressed);
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

// ==========================================
// 5. ESTADO DO JOGO
// ==========================================

let levelIndex = 0;
let level = GAME_LEVELS[0];

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
let criticalWarningShown = false;
let totalActiveTime = 0;

let medalCache = {};

const MEDAL_STORAGE_KEY =
  "echo404_awakening_medals_v07";

// ==========================================
// 6. AUXILIARES
// ==========================================

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function distance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
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

function setStatus(message) {
  if (UI.status) {
    UI.status.textContent = message;
  }
}

function formatScore(value) {
  return Math.floor(value || 0)
    .toLocaleString("pt-PT");
}

function playSound(name) {
  if (
    typeof GameAudio !== "undefined" &&
    typeof GameAudio.play === "function"
  ) {
    GameAudio.play(name);
  }
}

// ==========================================
// 7. PARTÍCULAS
// ==========================================

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
  for (const particle of particles) {
    particle.x += particle.vx * dt;
    particle.y += particle.vy * dt;
    particle.life -= dt;
  }

  particles = particles.filter(
    particle => particle.life > 0
  );
}

// ==========================================
// 8. MEDALHAS
// ==========================================

const MEDALS = {
  bronze: {
    name: "BRONZE",
    icon: "🥉",
    rank: 1
  },
  silver: {
    name: "PRATA",
    icon: "🥈",
    rank: 2
  },
  gold: {
    name: "OURO",
    icon: "🥇",
    rank: 3
  }
};

function loadMedals() {
  try {
    const raw = localStorage.getItem(
      MEDAL_STORAGE_KEY
    );

    const parsed = raw ? JSON.parse(raw) : {};

    return parsed &&
      typeof parsed === "object" &&
      !Array.isArray(parsed)
      ? parsed
      : {};
  } catch (error) {
    return {};
  }
}

function saveMedals() {
  try {
    localStorage.setItem(
      MEDAL_STORAGE_KEY,
      JSON.stringify(medalCache)
    );
  } catch (error) {
    console.warn("Não foi possível guardar medalhas.");
  }
}

function calculateMedal() {
  // Ouro exige eficiência e sobrevivência.
  if (
    deaths === 0 &&
    cycle <= 3 &&
    shifts <= 2
  ) {
    return "gold";
  }

  // Prata permite algumas falhas.
  if (
    deaths <= 2 &&
    cycle <= 5
  ) {
    return "silver";
  }

  return "bronze";
}

function registerMedal(type) {
  const key = String(levelIndex);
  const previous = medalCache[key];

  if (
    !previous ||
    MEDALS[type].rank > MEDALS[previous].rank
  ) {
    medalCache[key] = type;
    saveMedals();
  }

  updateMedalSummary();
}

function updateMedalSummary() {
  if (!UI.medalSummary) return;

  const counts = {
    gold: 0,
    silver: 0,
    bronze: 0
  };

  Object.values(medalCache).forEach(type => {
    if (counts[type] !== undefined) {
      counts[type]++;
    }
  });

  UI.medalSummary.textContent =
    `🥇 ${counts.gold} OURO · ` +
    `🥈 ${counts.silver} PRATA · ` +
    `🥉 ${counts.bronze} BRONZE`;
}

function showMedal(type) {
  if (!UI.medalResult) return;

  const medal = MEDALS[type];

  UI.medalResult.dataset.medal = type;

  UI.medalResult.textContent =
    `${medal.icon} MEDALHA DE ${medal.name}`;

  UI.medalResult.classList.remove("hidden");
}

medalCache = loadMedals();

// ==========================================
// 9. MENU DE NÍVEIS
// ==========================================

function buildLevelMenu() {
  const data = GameStorage.load();

  UI.levelGrid.innerHTML = "";

  GAME_LEVELS.forEach((item, index) => {
    const button = document.createElement("button");

    const completed = Boolean(
      data.completed[index]
    );

    const unlocked = index + 1 <= data.unlocked;

    const medal = medalCache[String(index)];

    button.textContent = completed
      ? `✓${index + 1}`
      : String(index + 1);

    button.disabled = !unlocked;

    button.classList.toggle(
      "selected",
      index === levelIndex
    );

    button.classList.toggle(
      "completed",
      completed
    );

    const medalText = medal
      ? ` | Medalha: ${MEDALS[medal].name}`
      : "";

    button.title = unlocked
      ? `${item.name}${medalText}`
      : "Nível bloqueado";

    button.addEventListener("click", () => {
      selectLevel(index);
      playSound("click");
    });

    UI.levelGrid.appendChild(button);
  });

  const completedCount = data.completed
    .filter(Boolean).length;

  UI.progress.textContent =
    `${completedCount} / ` +
    `${GAME_LEVELS.length} CONCLUÍDOS`;

  UI.levelName.textContent =
    `NÍVEL ${levelIndex + 1} — ${level.name} | ` +
    `${level.difficulty} | ` +
    `${getCycleDuration()}s POR CICLO | ` +
    `${level.hint}`;

  UI.best.textContent = formatScore(
    data.bestScores[levelIndex]
  );

  updateMedalSummary();
}

function selectLevel(index) {
  if (
    index < 0 ||
    index >= GAME_LEVELS.length
  ) {
    return;
  }

  if (!GameStorage.isUnlocked(index)) {
    setStatus("NÍVEL BLOQUEADO.");
    playSound("error");
    return;
  }

  levelIndex = index;
  level = GAME_LEVELS[index];

  resetGame();
  buildLevelMenu();

  emitGameEvent("levelselected", {
    levelName: level.name
  });
}

// ==========================================
// 10. REINICIAR
// ==========================================

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
  totalActiveTime = 0;

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
  criticalWarningShown = false;

  UI.overlay.classList.add("hidden");

  if (UI.medalResult) {
    UI.medalResult.classList.add("hidden");
  }

  UI.startBtn.textContent = "INICIAR SIMULAÇÃO";

  setStatus(level.hint);
  updateHUD();
  draw();
}

// ==========================================
// 11. INICIAR
// ==========================================

function startGame() {
  // Não permite iniciar por trás
  // da introdução cinematográfica.
  const intro = document.getElementById(
    "awakeningIntro"
  );

  if (
    intro &&
    !intro.classList.contains("hidden")
  ) {
    return;
  }

  resetGame();

  running = true;

  GameStorage.registerAttempt();

  if (typeof GameAudio.init === "function") {
    GameAudio.init();
  }

  playSound("start");

  UI.startBtn.textContent =
    "REINICIAR SIMULAÇÃO";

  setStatus(
    `NÍVEL ${levelIndex + 1}: ` +
    `${getCycleDuration()} SEGUNDOS POR CICLO. ` +
    `${level.hint}`
  );

  emitGameEvent("start", {
    levelName: level.name
  });

  updateHUD();

  animationId = requestAnimationFrame(gameLoop);
}

// ==========================================
// 12. HUD
// ==========================================

function updateHUD() {
  const duration = getCycleDuration();

  const remaining = Math.max(
    0,
    duration - elapsed
  );

  UI.cycle.textContent =
    `${cycle}/${MAX_CYCLES}`;

  UI.timer.textContent = remaining.toFixed(1);

  UI.ghosts.textContent = recordings.length;
  UI.score.textContent = formatScore(score);

  UI.best.textContent = formatScore(
    GameStorage.getBestScore(levelIndex)
  );

  const percentage = clamp(
    remaining / duration * 100,
    0,
    100
  );

  UI.timerBar.style.width = `${percentage}%`;

  UI.timerBar.style.background =
    remaining <= duration * DIFFICULTY.criticalFraction
      ? COLORS.red
      : COLORS.cyan;

  const shiftDisabled =
    !running ||
    shiftUsed ||
    recordings.length === 0;

  UI.shiftBtn.disabled = shiftDisabled;

  if (UI.mobileShiftBtn) {
    UI.mobileShiftBtn.disabled = shiftDisabled;
  }
}

// ==========================================
// 13. GRAVAÇÃO DO JOGADOR
// ==========================================

function recordPlayer() {
  currentRecording.push({
    t: Math.min(elapsed, getCycleDuration()),
    x: player.x,
    y: player.y
  });
}

// ==========================================
// 14. INTERPOLAÇÃO DOS ECOS
// ==========================================

function positionAt(frames, time) {
  if (!frames.length) {
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
    const middle = (low + high) >> 1;

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
      Math.max(0.00001, b.t - a.t),
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
    frames => positionAt(frames, elapsed)
  );
}

// ==========================================
// 15. PARADOX SHIFT
// ==========================================

function paradoxShift() {
  if (!running) return;

  if (
    shiftUsed ||
    recordings.length === 0
  ) {
    playSound("error");
    setStatus("PARADOX SHIFT INDISPONÍVEL.");
    return;
  }

  const index = recordings.length - 1;
  const frames = recordings[index];

  const position = positionAt(
    frames,
    elapsed
  );

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

  GameStorage.registerShift();

  updateGhosts();
  updateDoor();

  emitParticles(
    position.x,
    position.y,
    COLORS.purple,
    40
  );

  playSound("shift");

  setStatus(
    "PARADOX SHIFT: FUTURO DO ECO ALTERADO!"
  );

  emitGameEvent("shift", {
    position
  });

  updateHUD();
}

// ==========================================
// 16. PLACAS E PORTA
// ==========================================

function isPlateActive(plate) {
  if (
    distance(player, plate) < PLATE_RADIUS
  ) {
    return true;
  }

  return ghosts.some(
    ghost =>
      distance(ghost, plate) < PLATE_RADIUS
  );
}

function updateDoor() {
  doorOpen = level.plates.every(
    plate => isPlateActive(plate)
  );

  if (
    doorOpen &&
    !previousDoorState
  ) {
    playSound("door");

    emitParticles(
      WORLD.door.x + WORLD.door.w / 2,
      WORLD.door.y + WORLD.door.h / 2,
      COLORS.green,
      25
    );

    setStatus("PORTA TEMPORAL ABERTA!");

    emitGameEvent("dooropen");
  }

  if (
    !doorOpen &&
    previousDoorState
  ) {
    emitGameEvent("doorclosed");
  }

  previousDoorState = doorOpen;
}

// ==========================================
// 17. COLISÕES
// ==========================================

function isBlocked(x, y) {
  const rect = playerRect(x, y);

  for (const wall of WORLD.walls) {
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

  return false;
}

// ==========================================
// 18. MOVIMENTO
// ==========================================

function updatePlayer(dt) {
  let dx = 0;
  let dy = 0;

  if (isDirectionPressed("up")) dy--;
  if (isDirectionPressed("down")) dy++;
  if (isDirectionPressed("left")) dx--;
  if (isDirectionPressed("right")) dx++;

  const length = Math.hypot(dx, dy);

  if (length === 0) return;

  dx /= length;
  dy /= length;

  const oldX = player.x;
  const oldY = player.y;

  const nextX = clamp(
    player.x + dx * player.speed * dt,
    PLAYER_SIZE / 2,
    WIDTH - PLAYER_SIZE / 2
  );

  if (!isBlocked(nextX, player.y)) {
    player.x = nextX;
  }

  const nextY = clamp(
    player.y + dy * player.speed * dt,
    PLAYER_SIZE / 2,
    HEIGHT - PLAYER_SIZE / 2
  );

  if (!isBlocked(player.x, nextY)) {
    player.y = nextY;
  }

  if (
    oldX !== player.x ||
    oldY !== player.y
  ) {
    // Evento único de movimento para
    // o tutorial, sem disparar a cada frame.
    if (!startGame.movementNotified) {
      startGame.movementNotified = true;
      emitGameEvent("firstmove");
    }
  }
}

// ==========================================
// 19. PORTAIS
// ==========================================

function updatePortals(dt) {
  portalCooldown = Math.max(
    0,
    portalCooldown - dt
  );

  if (portalCooldown > 0) return;

  for (const portal of level.portals) {
    let destination = null;

    if (
      distance(player, portal.a) < 19
    ) {
      destination = portal.b;
    } else if (
      distance(player, portal.b) < 19
    ) {
      destination = portal.a;
    }

    if (!destination) continue;

    player.x = destination.x;
    player.y = destination.y;

    portalCooldown = 1;

    emitParticles(
      player.x,
      player.y,
      COLORS.blue,
      30
    );

    playSound("portal");

    setStatus("SALTO QUÂNTICO EXECUTADO!");

    emitGameEvent("portal");

    return;
  }
}

// ==========================================
// 20. LASERS MAIS DINÂMICOS
// ==========================================

function getLaserPhase(laser) {
  const period = Math.max(
    0.2,
    Number(laser.period) || 2
  );

  const offset = Number(laser.offset) || 0;

  // Usa tempo acumulado para acelerar
  // os lasers sem modificar levels.js.
  const adjustedTime =
    worldTime * getLaserMultiplier() + offset;

  return adjustedTime % period;
}

function isLaserActive(laser) {
  return getLaserPhase(laser) <
    (Number(laser.on) || 0);
}

function isLaserHit(laser) {
  if (!isLaserActive(laser)) return false;

  return (
    Math.abs(player.x - laser.x) < 15 &&
    player.y > 80 &&
    player.y < 420
  );
}

function checkLasers() {
  for (const laser of level.lasers) {
    if (!isLaserHit(laser)) continue;

    deaths++;

    GameStorage.registerDeath();

    const penalty = getDeathPenalty();

    score = Math.max(
      0,
      score - penalty
    );

    emitParticles(
      player.x,
      player.y,
      COLORS.red,
      40
    );

    playSound("laser");

    emitGameEvent("death", {
      penalty,
      cause: "laser"
    });

    endCycle(true);
    return true;
  }

  return false;
}

// ==========================================
// 21. TERMINAR CICLO
// ==========================================

function endCycle(died = false) {
  if (!running) return;

  const duration = getCycleDuration();

  if (died) {
    currentRecording.push({
      t: Math.min(elapsed, duration),
      x: WORLD.start.x,
      y: WORLD.start.y
    });
  }

  currentRecording.push({
    t: duration,
    x: died ? WORLD.start.x : player.x,
    y: died ? WORLD.start.y : player.y
  });

  recordings.push(currentRecording);

  emitGameEvent("cycleend", {
    died,
    completedCycle: cycle
  });

  if (cycle >= MAX_CYCLES) {
    finishGame(false);
    return;
  }

  cycle++;
  elapsed = 0;
  portalCooldown = 0;

  lastTickSecond = null;
  criticalWarningShown = false;

  player.x = WORLD.start.x;
  player.y = WORLD.start.y;

  currentRecording = [{
    t: 0,
    x: player.x,
    y: player.y
  }];

  updateGhosts();
  updateDoor();

  emitParticles(
    player.x,
    player.y,
    COLORS.purple,
    30
  );

  playSound("echo");

  setStatus(
    `CICLO ${cycle}: ` +
    `${recordings.length} ECOS ACTIVOS. ` +
    `${duration}s RESTANTES.`
  );

  emitGameEvent("cyclestart");

  lastFrame = 0;
}

// ==========================================
// 22. SAÍDA
// ==========================================

function checkGoal() {
  if (
    intersects(
      playerRect(player.x, player.y),
      WORLD.goal
    )
  ) {
    finishGame(true);
  }
}

// ==========================================
// 23. TERMINAR JOGO
// ==========================================

function finishGame(won) {
  if (finished) return;

  running = false;
  finished = true;

  clearAllMovement();

  let medal = null;

  if (won) {
    const duration = getCycleDuration();

    const cycleBonus =
      (MAX_CYCLES - cycle + 1) * 1000;

    const timeBonus = Math.floor(
      Math.max(0, duration - elapsed) *
      180
    );

    const survivalBonus = Math.max(
      0,
      1500 - deaths * 400
    );

    const precisionBonus = Math.max(
      0,
      900 - shifts * 150
    );

    const difficultyBonus =
      levelIndex * DIFFICULTY.levelBonus;

    score += (
      2000 +
      cycleBonus +
      timeBonus +
      survivalBonus +
      precisionBonus +
      difficultyBonus
    );

    GameStorage.win(levelIndex, score);

    medal = calculateMedal();

    registerMedal(medal);
    showMedal(medal);

    playSound("win");

    UI.overlayTitle.textContent =
      "PARADOXO RESOLVIDO";

    UI.overlayMessage.textContent =
      `Nível ${levelIndex + 1} concluído! ` +
      `Ciclo ${cycle}/${MAX_CYCLES}. ` +
      `${deaths} mortes, ${shifts} shifts. ` +
      `Tempo total: ${totalActiveTime.toFixed(1)}s.`;

    UI.nextBtn.style.display =
      levelIndex < GAME_LEVELS.length - 1
        ? "inline-block"
        : "none";

    setStatus(
      `SIMULAÇÃO CONCLUÍDA! ` +
      `MEDALHA DE ${MEDALS[medal].name}.`
    );
  } else {
    playSound("fail");

    UI.overlayTitle.textContent =
      "SYSTEM FAILURE";

    UI.overlayMessage.textContent =
      `Os ${MAX_CYCLES} ciclos terminaram. ` +
      `O sistema exige maior precisão. ` +
      `Reorganiza os ecos e tenta novamente.`;

    UI.nextBtn.style.display = "none";

    if (UI.medalResult) {
      UI.medalResult.classList.add("hidden");
    }

    setStatus(
      "COLAPSO TEMPORAL DETECTADO."
    );
  }

  UI.finalScore.textContent =
    `${formatScore(score)} PONTOS`;

  UI.overlay.classList.remove("hidden");

  UI.startBtn.textContent =
    "JOGAR NOVAMENTE";

  buildLevelMenu();
  updateHUD();

  emitGameEvent(
    won ? "win" : "lose",
    {
      won,
      medal,
      totalActiveTime
    }
  );
}

// ==========================================
// 24. DESENHO NEON
// ==========================================

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

  ctx.fillRect(x, y, width, height);

  ctx.restore();
}

// ==========================================
// 25. GRELHA
// ==========================================

function drawGrid() {
  ctx.strokeStyle = "#19243d";
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
}

// ==========================================
// 26. PAREDES E PORTA
// ==========================================

function drawWalls() {
  ctx.fillStyle = "#35415e";

  for (const wall of WORLD.walls) {
    ctx.fillRect(
      wall.x,
      wall.y,
      wall.w,
      wall.h
    );
  }

  const door = WORLD.door;

  if (doorOpen) {
    ctx.save();

    ctx.strokeStyle = COLORS.green;
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

// ==========================================
// 27. PLACAS
// ==========================================

function drawPlates() {
  level.plates.forEach((plate, index) => {
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

    ctx.fillStyle = COLORS.white;
    ctx.font = "11px monospace";
    ctx.textAlign = "center";

    ctx.fillText(
      `PLACA ${index + 1}`,
      plate.x,
      plate.y - 36
    );
  });
}

// ==========================================
// 28. LASERS
// ==========================================

function drawLasers() {
  level.lasers.forEach(laser => {
    const active = isLaserActive(laser);

    ctx.save();

    ctx.beginPath();
    ctx.moveTo(laser.x, 80);
    ctx.lineTo(laser.x, 420);

    ctx.strokeStyle = active
      ? COLORS.red
      : "#50233a";

    ctx.lineWidth = active ? 5 : 2;
    ctx.shadowColor = COLORS.red;
    ctx.shadowBlur = active ? 20 : 0;

    ctx.stroke();
    ctx.restore();

    glowRect(
      laser.x - 8,
      72,
      16,
      16,
      active ? COLORS.red : "#71324a",
      8
    );

    glowRect(
      laser.x - 8,
      412,
      16,
      16,
      active ? COLORS.red : "#71324a",
      8
    );
  });
}

// ==========================================
// 29. PORTAIS
// ==========================================

function drawPortals() {
  level.portals.forEach(portal => {
    for (const point of [portal.a, portal.b]) {
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
  });
}

// ==========================================
// 30. SAÍDA
// ==========================================

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

  ctx.fillStyle = COLORS.green;
  ctx.font = "12px monospace";
  ctx.textAlign = "center";

  ctx.fillText(
    "SAÍDA",
    goal.x + goal.w / 2,
    goal.y - 15
  );
}

// ==========================================
// 31. ECOS
// ==========================================

function drawGhosts() {
  ghosts.forEach((ghost, index) => {
    ctx.save();

    ctx.globalAlpha =
      0.5 +
      Math.sin(worldTime * 7 + index) * 0.12;

    glowRect(
      ghost.x - 10,
      ghost.y - 10,
      20,
      20,
      COLORS.purple,
      16
    );

    ctx.restore();
  });
}

// ==========================================
// 32. JOGADOR
// ==========================================

function drawPlayer() {
  glowRect(
    player.x - 10,
    player.y - 10,
    20,
    20,
    COLORS.cyan,
    20
  );

  ctx.fillStyle = "#ffffff";

  ctx.fillRect(
    player.x - 4,
    player.y - 4,
    8,
    8
  );
}

// ==========================================
// 33. PARTÍCULAS
// ==========================================

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

// ==========================================
// 34. ETIQUETAS DA ARENA
// ==========================================

function drawLabels() {
  ctx.fillStyle = "#7083a4";
  ctx.font = "12px monospace";
  ctx.textAlign = "left";

  ctx.fillText(
    "SECTOR 01 // ORIGIN",
    20,
    25
  );

  ctx.fillText(
    "SECTOR 02 // PARADOX",
    425,
    25
  );

  ctx.textAlign = "right";

  ctx.fillText(
    `LEVEL ${String(levelIndex + 1).padStart(2, "0")}`,
    780,
    25
  );

  ctx.textAlign = "center";
  ctx.fillStyle = COLORS.yellow;
  ctx.font = "11px monospace";

  ctx.fillText(
    `${getCycleDuration()}s / CYCLE`,
    WIDTH / 2,
    HEIGHT - 12
  );
}

// ==========================================
// 35. RENDERIZAÇÃO
// ==========================================

function draw() {
  ctx.clearRect(0, 0, WIDTH, HEIGHT);

  ctx.fillStyle = "#080d1c";
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  drawGrid();
  drawLabels();
  drawWalls();
  drawPlates();
  drawLasers();
  drawPortals();
  drawGoal();
  drawGhosts();
  drawPlayer();
  drawParticles();
}

// ==========================================
// 36. CONTAGEM REGRESSIVA
// ==========================================

function updateCountdown() {
  const duration = getCycleDuration();
  const remaining = duration - elapsed;

  const second = Math.ceil(remaining);

  if (
    second <= 3 &&
    second > 0 &&
    second !== lastTickSecond
  ) {
    lastTickSecond = second;
    playSound("tick");
  }

  const criticalThreshold =
    duration * DIFFICULTY.criticalFraction;

  if (
    remaining <= criticalThreshold &&
    !criticalWarningShown
  ) {
    criticalWarningShown = true;

    setStatus(
      "ALERTA ECHO: TEMPO CRÍTICO!"
    );

    emitGameEvent("timecritical", {
      remaining
    });
  }
}

// ==========================================
// 37. LOOP PRINCIPAL
// ==========================================

function gameLoop(timestamp) {
  if (!running) return;

  if (!lastFrame) {
    lastFrame = timestamp;
  }

  const dt = Math.min(
    Math.max(0, (timestamp - lastFrame) / 1000),
    0.05
  );

  lastFrame = timestamp;

  elapsed += dt;
  worldTime += dt;
  totalActiveTime += dt;

  updateGhosts();
  updateDoor();

  updatePlayer(dt);
  updatePortals(dt);

  updateDoor();
  recordPlayer();

  updateParticles(dt);
  updateCountdown();

  const hit = checkLasers();

  if (!hit && running) {
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
    animationId = requestAnimationFrame(gameLoop);
  } else {
    animationId = null;
  }
}

// ==========================================
// 38. CONTROLOS DO TECLADO
// ==========================================

function isIntroVisible() {
  const intro = document.getElementById(
    "awakeningIntro"
  );

  return Boolean(
    intro &&
    !intro.classList.contains("hidden")
  );
}

function isTypingTarget(target) {
  return Boolean(
    target &&
    (
      target.matches?.(
        "input, textarea, select, [contenteditable='true']"
      )
    )
  );
}

window.addEventListener("keydown", event => {
  if (
    isIntroVisible() ||
    isTypingTarget(event.target)
  ) {
    return;
  }

  const key = event.key.toLowerCase();

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

// ==========================================
// 39. CONTROLOS MOBILE
// ==========================================

function setupMobileControls() {
  for (const [direction, button] of
    Object.entries(mobileDirections)) {

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
        } catch (error) {
          // Captura opcional.
        }

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

  if (UI.mobileShiftBtn) {
    UI.mobileShiftBtn.addEventListener(
      "click",
      paradoxShift
    );
  }

  if (UI.mobileRestartBtn) {
    UI.mobileRestartBtn.addEventListener(
      "click",
      startGame
    );
  }
}

// ==========================================
// 40. BOTÕES PRINCIPAIS
// ==========================================

UI.startBtn.addEventListener(
  "click",
  startGame
);

UI.restartBtn.addEventListener(
  "click",
  startGame
);

UI.playAgainBtn.addEventListener(
  "click",
  startGame
);

UI.nextBtn.addEventListener(
  "click",
  () => {
    const nextIndex = levelIndex + 1;

    if (nextIndex < GAME_LEVELS.length) {
      selectLevel(nextIndex);
      startGame();
    }
  }
);

UI.shiftBtn.addEventListener(
  "click",
  paradoxShift
);

UI.soundBtn.addEventListener(
  "click",
  () => {
    const enabled = GameAudio.toggle();

    UI.soundBtn.textContent =
      enabled ? "SOM: ON" : "SOM: OFF";
  }
);

// ==========================================
// 41. API PARA THE AWAKENING
// ==========================================

window.EchoGame = {
  getState() {
    return {
      levelIndex,
      levelNumber: levelIndex + 1,
      levelName: level.name,
      cycle,
      maxCycles: MAX_CYCLES,
      cycleDuration: getCycleDuration(),
      remaining: Math.max(
        0,
        getCycleDuration() - elapsed
      ),
      running,
      finished,
      score,
      deaths,
      shifts,
      ghosts: recordings.length,
      doorOpen,
      totalActiveTime,
      player: {
        x: player.x,
        y: player.y
      }
    };
  },

  start: startGame,
  restart: startGame,
  shift: paradoxShift,
  selectLevel,
  getMedals() {
    return { ...medalCache };
  }
};

// ==========================================
// 42. INICIALIZAÇÃO
// ==========================================

UI.soundBtn.textContent =
  GameAudio.enabled
    ? "SOM: ON"
    : "SOM: OFF";

setupMobileControls();

resetGame();
buildLevelMenu();

console.log(
  "=================================="
);

console.log(
  "ECHO//404 — THE AWAKENING v0.7"
);

console.log(
  `${GAME_LEVELS.length} LEVELS LOADED`
);

console.log(
  "PROGRESSIVE DIFFICULTY ENABLED"
);

console.log(
  "DESKTOP + MOBILE READY"
);

console.log(
  "CREATED BY MANUEL SAMPAIO01"
);

console.log(
  "=================================="
);
