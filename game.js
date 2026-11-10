
"use strict";

/*
==================================================
 ECHO//404 — PARADOX EVOLUTION
 VERSION: 0.6
 FILE: game.js

 MOTOR PRINCIPAL
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

  startBtn: document.getElementById("startBtn"),
  restartBtn: document.getElementById("restartBtn"),
  shiftBtn: document.getElementById("shiftBtn"),
  soundBtn: document.getElementById("soundBtn"),

  playAgainBtn: document.getElementById("playAgainBtn"),
  nextBtn: document.getElementById("nextBtn")
};

// ==========================================
// 2. CONSTANTES
// ==========================================

const WORLD = GAME_WORLD;

const WIDTH = WORLD.width;
const HEIGHT = WORLD.height;

const CYCLE_DURATION = WORLD.cycleDuration;
const MAX_CYCLES = WORLD.maxCycles;

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

const keys = new Set();

// ==========================================
// 3. ESTADO DO JOGO
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

// ==========================================
// 4. FUNÇÕES AUXILIARES
// ==========================================

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

function setStatus(message) {
  UI.status.textContent = message;
}

function formatScore(value) {
  return Math.floor(value).toLocaleString("pt-PT");
}

// ==========================================
// 5. PARTÍCULAS
// ==========================================

function emitParticles(
  x,
  y,
  color,
  amount = 15
) {
  for (let i = 0; i < amount; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 30 + Math.random() * 120;

    particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 0.3 + Math.random() * 0.6,
      maxLife: 0.9,
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

// ==========================================
// 6. MENU DE NÍVEIS
// ==========================================

function buildLevelMenu() {
  const data = GameStorage.load();

  UI.levelGrid.innerHTML = "";

  GAME_LEVELS.forEach((item, index) => {
    const button = document.createElement("button");

    const completed = data.completed[index];
    const unlocked = index + 1 <= data.unlocked;

    button.textContent = completed
      ? "✓" + (index + 1)
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
      selectLevel(index);
      GameAudio.play("click");
    });

    UI.levelGrid.appendChild(button);
  });

  const completedCount =
    data.completed.filter(Boolean).length;

  UI.progress.textContent =
    `${completedCount} / ${GAME_LEVELS.length} CONCLUÍDOS`;

  UI.levelName.textContent =
    `NÍVEL ${levelIndex + 1} — ${level.name} | ` +
    `${level.difficulty} | ${level.hint}`;

  UI.best.textContent = formatScore(
    data.bestScores[levelIndex]
  );
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
    GameAudio.play("error");
    return;
  }

  levelIndex = index;
  level = GAME_LEVELS[index];

  resetGame();
  buildLevelMenu();
}

// ==========================================
// 7. REINICIAR JOGO
// ==========================================

function resetGame() {
  if (animationId !== null) {
    cancelAnimationFrame(animationId);
    animationId = null;
  }

  keys.clear();

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

  UI.overlay.classList.add("hidden");

  UI.startBtn.textContent = "INICIAR SIMULAÇÃO";

  setStatus(level.hint);

  updateHUD();
  draw();
}

// ==========================================
// 8. INICIAR SIMULAÇÃO
// ==========================================

function startGame() {
  resetGame();

  running = true;

  GameStorage.registerAttempt();

  GameAudio.init();
  GameAudio.play("start");

  UI.startBtn.textContent = "REINICIAR SIMULAÇÃO";

  setStatus(
    `NÍVEL ${levelIndex + 1}: ${level.hint}`
  );

  animationId = requestAnimationFrame(gameLoop);
}

// ==========================================
// 9. ACTUALIZAR HUD
// ==========================================

function updateHUD() {
  UI.cycle.textContent =
    `${cycle}/${MAX_CYCLES}`;

  UI.timer.textContent = Math.max(
    0,
    CYCLE_DURATION - elapsed
  ).toFixed(1);

  UI.ghosts.textContent = recordings.length;

  UI.score.textContent = formatScore(score);

  UI.best.textContent = formatScore(
    GameStorage.getBestScore(levelIndex)
  );

  const percentage = clamp(
    (CYCLE_DURATION - elapsed) /
    CYCLE_DURATION * 100,
    0,
    100
  );

  UI.timerBar.style.width =
    `${percentage}%`;

  UI.timerBar.style.background =
    CYCLE_DURATION - elapsed < 2.5
      ? COLORS.red
      : COLORS.cyan;

  UI.shiftBtn.disabled =
    !running ||
    shiftUsed ||
    recordings.length === 0;
}

// ==========================================
// 10. GRAVAÇÃO DOS MOVIMENTOS
// ==========================================

function recordPlayer() {
  currentRecording.push({
    t: Math.min(elapsed, CYCLE_DURATION),
    x: player.x,
    y: player.y
  });
}

// ==========================================
// 11. INTERPOLAÇÃO DOS FANTASMAS
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

// ==========================================
// 12. ACTUALIZAR FANTASMAS
// ==========================================

function updateGhosts() {
  ghosts = recordings.map(
    frames => positionAt(frames, elapsed)
  );
}

// ==========================================
// 13. PARADOX SHIFT
// ==========================================

function paradoxShift() {
  if (!running) {
    return;
  }

  if (shiftUsed || recordings.length === 0) {
    GameAudio.play("error");

    setStatus(
      "PARADOX SHIFT INDISPONÍVEL."
    );

    return;
  }

  const index = recordings.length - 1;
  const frames = recordings[index];

  const position = positionAt(
    frames,
    elapsed
  );

  // Preserva o passado do último fantasma.
  const past = frames.filter(
    frame => frame.t < elapsed
  );

  // Congela o fantasma no local actual.
  past.push({
    t: elapsed,
    x: position.x,
    y: position.y
  });

  past.push({
    t: CYCLE_DURATION,
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

  GameAudio.play("shift");

  setStatus(
    "PARADOX SHIFT: FUTURO DO ECO ALTERADO!"
  );

  updateHUD();
}

// ==========================================
// 14. PLACAS TEMPORAIS
// ==========================================

function isPlateActive(plate) {
  if (distance(player, plate) < PLATE_RADIUS) {
    return true;
  }

  return ghosts.some(
    ghost => distance(ghost, plate) < PLATE_RADIUS
  );
}

// ==========================================
// 15. PORTA TEMPORAL
// ==========================================

function updateDoor() {
  doorOpen = level.plates.every(
    plate => isPlateActive(plate)
  );

  if (
    doorOpen &&
    !previousDoorState
  ) {
    GameAudio.play("door");

    emitParticles(
      WORLD.door.x + WORLD.door.w / 2,
      WORLD.door.y + WORLD.door.h / 2,
      COLORS.green,
      25
    );

    setStatus(
      "PORTA TEMPORAL ABERTA!"
    );
  }

  previousDoorState = doorOpen;
}

// ==========================================
// 16. COLISÕES COM PAREDES
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
// 17. MOVIMENTO DO JOGADOR
// ==========================================

function updatePlayer(dt) {
  let dx = 0;
  let dy = 0;

  if (
    keys.has("w") ||
    keys.has("arrowup")
  ) {
    dy--;
  }

  if (
    keys.has("s") ||
    keys.has("arrowdown")
  ) {
    dy++;
  }

  if (
    keys.has("a") ||
    keys.has("arrowleft")
  ) {
    dx--;
  }

  if (
    keys.has("d") ||
    keys.has("arrowright")
  ) {
    dx++;
  }

  const length = Math.hypot(dx, dy);

  if (length === 0) {
    return;
  }

  dx /= length;
  dy /= length;

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
}

// ==========================================
// 18. TELETRANSPORTES
// ==========================================

function updatePortals(dt) {
  portalCooldown = Math.max(
    0,
    portalCooldown - dt
  );

  if (portalCooldown > 0) {
    return;
  }

  for (const portal of level.portals) {
    let destination = null;

    if (distance(player, portal.a) < 19) {
      destination = portal.b;
    } else if (distance(player, portal.b) < 19) {
      destination = portal.a;
    }

    if (destination) {
      player.x = destination.x;
      player.y = destination.y;

      portalCooldown = 1;

      emitParticles(
        player.x,
        player.y,
        COLORS.blue,
        30
      );

      GameAudio.play("portal");

      setStatus(
        "SALTO QUÂNTICO EXECUTADO!"
      );

      return;
    }
  }
}

// ==========================================
// 19. LASERS
// ==========================================

function isLaserActive(laser) {
  const phase =
    (worldTime + laser.offset) %
    laser.period;

  return phase < laser.on;
}

function isLaserHit(laser) {
  if (!isLaserActive(laser)) {
    return false;
  }

  return (
    Math.abs(player.x - laser.x) < 15 &&
    player.y > 80 &&
    player.y < 420
  );
}

function checkLasers() {
  for (const laser of level.lasers) {
    if (isLaserHit(laser)) {
      deaths++;

      GameStorage.registerDeath();

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

      GameAudio.play("laser");

      endCycle(true);

      return true;
    }
  }

  return false;
}

// ==========================================
// 20. TERMINAR CICLO
// ==========================================

function endCycle(died = false) {
  if (!running) {
    return;
  }

  if (died) {
    // Após a morte, o eco volta à origem.
    currentRecording.push({
      t: Math.min(elapsed, CYCLE_DURATION),
      x: WORLD.start.x,
      y: WORLD.start.y
    });
  }

  currentRecording.push({
    t: CYCLE_DURATION,
    x: died ? WORLD.start.x : player.x,
    y: died ? WORLD.start.y : player.y
  });

  recordings.push(currentRecording);

  if (cycle >= MAX_CYCLES) {
    finishGame(false);
    return;
  }

  cycle++;
  elapsed = 0;
  portalCooldown = 0;

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

  GameAudio.play("echo");

  setStatus(
    `CICLO ${cycle}: ${recordings.length} ECOS ACTIVOS.`
  );
}

// ==========================================
// 21. VERIFICAR SAÍDA
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
// 22. TERMINAR JOGO
// ==========================================

function finishGame(won) {
  if (finished) {
    return;
  }

  running = false;
  finished = true;

  if (won) {
    const cycleBonus =
      (MAX_CYCLES - cycle + 1) * 1000;

    const timeBonus = Math.floor(
      (CYCLE_DURATION - elapsed) * 100
    );

    const survivalBonus = Math.max(
      0,
      1000 - deaths * 250
    );

    score += (
      2000 +
      cycleBonus +
      timeBonus +
      survivalBonus
    );

    GameStorage.win(
      levelIndex,
      score
    );

    GameAudio.play("win");

    UI.overlayTitle.textContent =
      "PARADOXO RESOLVIDO";

    UI.overlayMessage.textContent =
      `Nível ${levelIndex + 1} concluído! ` +
      `Ciclo ${cycle}, ${recordings.length} ecos, ` +
      `${deaths} falhas e ${shifts} Paradox Shifts.`;

    UI.nextBtn.style.display =
      levelIndex < GAME_LEVELS.length - 1
        ? "inline-block"
        : "none";

    setStatus(
      "SIMULAÇÃO CONCLUÍDA COM SUCESSO!"
    );

  } else {
    GameAudio.play("fail");

    UI.overlayTitle.textContent =
      "SYSTEM FAILURE";

    UI.overlayMessage.textContent =
      "Os seis ciclos terminaram. " +
      "Reorganiza os ecos e tenta novamente.";

    UI.nextBtn.style.display = "none";

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
}

// ==========================================
// 23. DESENHO — RECTÂNGULO NEON
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

  ctx.fillRect(
    x,
    y,
    width,
    height
  );

  ctx.restore();
}

// ==========================================
// 24. DESENHO — GRELHA
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
// 25. DESENHO — PAREDES E PORTA
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
// 26. DESENHO — PLACAS
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
// 27. DESENHO — LASERS
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
// 28. DESENHO — PORTAIS
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
// 29. DESENHO — SAÍDA
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
// 30. DESENHO — FANTASMAS
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
// 31. DESENHO — JOGADOR
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
// 32. DESENHO — PARTÍCULAS
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
// 33. DESENHO — INFORMAÇÕES
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
}

// ==========================================
// 34. RENDERIZAÇÃO PRINCIPAL
// ==========================================

function draw() {
  ctx.clearRect(
    0,
    0,
    WIDTH,
    HEIGHT
  );

  ctx.fillStyle = "#080d1c";

  ctx.fillRect(
    0,
    0,
    WIDTH,
    HEIGHT
  );

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
// 35. CONTAGEM REGRESSIVA
// ==========================================

function updateCountdown() {
  const remaining = Math.ceil(
    CYCLE_DURATION - elapsed
  );

  if (
    remaining <= 3 &&
    remaining > 0 &&
    remaining !== lastTickSecond
  ) {
    lastTickSecond = remaining;
    GameAudio.play("tick");
  }
}

// ==========================================
// 36. LOOP PRINCIPAL
// ==========================================

function gameLoop(timestamp) {
  if (!running) {
    return;
  }

  if (!lastFrame) {
    lastFrame = timestamp;
  }

  const dt = Math.min(
    (timestamp - lastFrame) / 1000,
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

  const hit = checkLasers();

  if (!hit && running) {
    checkGoal();
  }

  if (
    running &&
    elapsed >= CYCLE_DURATION
  ) {
    endCycle();
  }

  updateHUD();
  draw();

  if (running) {
    animationId = requestAnimationFrame(
      gameLoop
    );
  }
}

// ==========================================
// 37. TECLADO
// ==========================================

window.addEventListener("keydown", event => {
  const key = event.key.toLowerCase();

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

  keys.add(key);
});

window.addEventListener("keyup", event => {
  keys.delete(
    event.key.toLowerCase()
  );
});

window.addEventListener("blur", () => {
  keys.clear();
  lastFrame = 0;
});

// ==========================================
// 38. BOTÕES
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
// 39. INICIALIZAÇÃO
// ==========================================

UI.soundBtn.textContent =
  GameAudio.enabled
    ? "SOM: ON"
    : "SOM: OFF";

resetGame();
buildLevelMenu();

console.log(
  "=================================="
);

console.log(
  "ECHO//404 — PARADOX EVOLUTION"
);

console.log(
  "VERSION 0.6 — GAME ENGINE READY"
);

console.log(
  `${GAME_LEVELS.length} LEVELS LOADED`
);

console.log(
  "=================================="
);
GameAudio.play("portal");
GameAudio.play("shift");
GameAudio.play("win");