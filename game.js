
"use strict";

// ==========================================
// ECHO//404 — PARADOX ARENA
// VERSION 0.2 — HYBRID EXPERIMENTAL
// ==========================================

// ELEMENTOS HTML
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const timerEl = document.getElementById("timer");
const cycleEl = document.getElementById("cycle");
const ghostsEl = document.getElementById("ghosts");
const scoreEl = document.getElementById("score");
const timerBar = document.getElementById("timerBar");

const statusEl = document.getElementById("status");
const startBtn = document.getElementById("startBtn");
const restartBtn = document.getElementById("restartBtn");

const overlay = document.getElementById("overlay");
const overlayTitle = document.getElementById("overlayTitle");
const overlayMessage = document.getElementById("overlayMessage");
const finalScore = document.getElementById("finalScore");
const playAgainBtn = document.getElementById("playAgainBtn");

// CONFIGURAÇÕES
const W = 800;
const H = 500;
const CYCLE_DURATION = 10;
const MAX_CYCLES = 6;

const COLORS = {
  cyan: "#00f5ff",
  purple: "#aa78ff",
  green: "#21ff9b",
  red: "#ff3868",
  yellow: "#ffd166",
  background: "#080d1c"
};

const START = { x: 60, y: 250 };

const PLATE = {
  x: 115,
  y: 100,
  radius: 25
};

const WALLS = [
  { x: 380, y: 0, w: 20, h: 195 },
  { x: 380, y: 305, w: 20, h: 195 }
];

const DOOR = {
  x: 380,
  y: 195,
  w: 20,
  h: 110
};

const GOAL = {
  x: 720,
  y: 215,
  w: 48,
  h: 70
};

const LASERS = [
  {
    x1: 510,
    y1: 80,
    x2: 510,
    y2: 420,
    period: 3,
    activeTime: 1.4,
    offset: 0
  },
  {
    x1: 625,
    y1: 80,
    x2: 625,
    y2: 420,
    period: 4,
    activeTime: 1.7,
    offset: 2
  }
];

// ESTADO
const keys = new Set();

let player;
let recordings;
let ghosts;
let currentRecording;
let particles;

let cycle;
let elapsed;
let totalTime;
let score;
let running;
let finished;
let doorOpen;
let lastTime;
let animationId;
let screenShake;
let deaths;
let lastParticleTime;

// UTILIDADES
function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function distance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function rectCollision(a, b) {
  return (
    a.x < b.x + b.w &&
    a.x + a.w > b.x &&
    a.y < b.y + b.h &&
    a.y + a.h > b.y
  );
}

function playerRect(x = player.x, y = player.y) {
  return {
    x: x - player.size / 2,
    y: y - player.size / 2,
    w: player.size,
    h: player.size
  };
}

// PARTÍCULAS
function spawnParticles(x, y, color, count = 12) {
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 30 + Math.random() * 140;

    particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 0.4 + Math.random() * 0.6,
      maxLife: 1,
      size: 2 + Math.random() * 4,
      color
    });
  }

  if (particles.length > 350) {
    particles.splice(0, particles.length - 350);
  }
}

function updateParticles(dt) {
  particles.forEach(p => {
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.life -= dt;
    p.vx *= Math.pow(0.96, dt * 60);
    p.vy *= Math.pow(0.96, dt * 60);
  });

  particles = particles.filter(p => p.life > 0);
}

function drawParticles() {
  particles.forEach(p => {
    ctx.globalAlpha = clamp(p.life / p.maxLife, 0, 1);
    ctx.fillStyle = p.color;
    ctx.fillRect(p.x, p.y, p.size, p.size);
  });

  ctx.globalAlpha = 1;
}

// REINICIAR
function reset() {
  if (animationId !== null) {
    cancelAnimationFrame(animationId);
  }

  keys.clear();

  player = {
    x: START.x,
    y: START.y,
    size: 20,
    speed: 230
  };

  recordings = [];
  ghosts = [];
  particles = [];

  currentRecording = [{
    t: 0,
    x: START.x,
    y: START.y
  }];

  cycle = 1;
  elapsed = 0;
  totalTime = 0;
  score = 0;
  deaths = 0;

  running = false;
  finished = false;
  doorOpen = false;
  lastTime = 0;
  lastParticleTime = 0;
  screenShake = 0;
  animationId = null;

  overlay.classList.add("hidden");
  startBtn.textContent = "INICIAR SIMULAÇÃO";

  statusEl.textContent =
    "Chega à placa amarela e prepara o teu eco.";

  updateHUD();
  draw();
}

function startGame() {
  reset();

  running = true;
  statusEl.textContent =
    "CICLO 1: posiciona-te sobre a placa amarela.";

  startBtn.textContent = "REINICIAR PARTIDA";
  animationId = requestAnimationFrame(loop);
}

// HUD
function updateHUD() {
  timerEl.textContent =
    Math.max(0, CYCLE_DURATION - elapsed).toFixed(1);

  cycleEl.textContent = `${cycle}/${MAX_CYCLES}`;
  ghostsEl.textContent = recordings.length;
  scoreEl.textContent = Math.floor(score);

  const percent =
    ((CYCLE_DURATION - elapsed) / CYCLE_DURATION) * 100;

  timerBar.style.width = `${clamp(percent, 0, 100)}%`;

  timerBar.style.background =
    percent < 25 ? COLORS.red : COLORS.cyan;
}

// FANTASMAS
function recordPosition() {
  currentRecording.push({
    t: Math.min(elapsed, CYCLE_DURATION),
    x: player.x,
    y: player.y
  });
}

function getRecordedPosition(frames, time) {
  if (!frames || frames.length === 0) {
    return { ...START };
  }

  if (time <= frames[0].t) {
    return { x: frames[0].x, y: frames[0].y };
  }

  const last = frames[frames.length - 1];

  if (time >= last.t) {
    return { x: last.x, y: last.y };
  }

  // Pesquisa binária para encontrar os frames
  let low = 0;
  let high = frames.length - 1;

  while (low + 1 < high) {
    const mid = Math.floor((low + high) / 2);

    if (frames[mid].t <= time) {
      low = mid;
    } else {
      high = mid;
    }
  }

  const a = frames[low];
  const b = frames[high];

  const fraction =
    (time - a.t) / Math.max(0.00001, b.t - a.t);

  return {
    x: a.x + (b.x - a.x) * fraction,
    y: a.y + (b.y - a.y) * fraction
  };
}

function updateGhosts() {
  ghosts = recordings.map(frames =>
    getRecordedPosition(frames, elapsed)
  );
}

// PLACA TEMPORAL
function isOnPlate(entity) {
  return distance(entity, PLATE) <
    PLATE.radius + 5;
}

function updateDoor() {
  const wasOpen = doorOpen;

  doorOpen =
    isOnPlate(player) ||
    ghosts.some(ghost => isOnPlate(ghost));

  if (doorOpen && !wasOpen) {
    spawnParticles(
      DOOR.x + DOOR.w / 2,
      DOOR.y + DOOR.h / 2,
      COLORS.green,
      20
    );

    statusEl.textContent =
      "PORTA ABERTA! Atravessa antes que feche.";
  }

  if (!doorOpen && wasOpen) {
    statusEl.textContent =
      "PORTA FECHADA! Activa novamente a placa.";
  }
}

// COLISÕES
function collidesWithWall(x, y) {
  const rect = playerRect(x, y);

  for (const wall of WALLS) {
    if (rectCollision(rect, wall)) {
      return true;
    }
  }

  if (!doorOpen && rectCollision(rect, DOOR)) {
    return true;
  }

  return false;
}

// MOVIMENTO
function movePlayer(dt) {
  let dx = 0;
  let dy = 0;

  if (keys.has("w") || keys.has("arrowup")) dy--;
  if (keys.has("s") || keys.has("arrowdown")) dy++;
  if (keys.has("a") || keys.has("arrowleft")) dx--;
  if (keys.has("d") || keys.has("arrowright")) dx++;

  const length = Math.hypot(dx, dy);

  if (length === 0) return;

  dx /= length;
  dy /= length;

  const step = player.speed * dt;

  const nextX = clamp(
    player.x + dx * step,
    player.size / 2,
    W - player.size / 2
  );

  if (!collidesWithWall(nextX, player.y)) {
    player.x = nextX;
  }

  const nextY = clamp(
    player.y + dy * step,
    player.size / 2,
    H - player.size / 2
  );

  if (!collidesWithWall(player.x, nextY)) {
    player.y = nextY;
  }
}

// LASERS
function isLaserActive(laser) {
  const phase =
    (totalTime + laser.offset) % laser.period;

  return phase < laser.activeTime;
}

function laserHitsPlayer(laser) {
  if (!isLaserActive(laser)) return false;

  const r = playerRect();

  if (laser.x1 === laser.x2) {
    return (
      Math.abs(player.x - laser.x1) < player.size / 2 + 4 &&
      r.y < Math.max(laser.y1, laser.y2) &&
      r.y + r.h > Math.min(laser.y1, laser.y2)
    );
  }

  return false;
}

function checkLasers() {
  for (const laser of LASERS) {
    if (laserHitsPlayer(laser)) {
      laserDeath();
      return true;
    }
  }

  return false;
}

function laserDeath() {
  deaths++;
  screenShake = 12;

  spawnParticles(
    player.x,
    player.y,
    COLORS.red,
    35
  );

  score = Math.max(0, score - 150);

  statusEl.textContent =
    "PARADOXO DETECTADO! O laser destruiu este ciclo.";

  nextCycle(true);
}

// CICLOS
function nextCycle(died = false) {
  if (!running) return;

  // Completa a gravação até aos 10 segundos.
  // Se o jogador morreu, o eco permanece na
  // posição inicial durante o tempo restante.
  if (died) {
    currentRecording.push({
      t: Math.min(elapsed, CYCLE_DURATION),
      x: START.x,
      y: START.y
    });
  }

  currentRecording.push({
    t: CYCLE_DURATION,
    x: died ? START.x : player.x,
    y: died ? START.y : player.y
  });

  recordings.push(currentRecording);

  if (cycle >= MAX_CYCLES) {
    finish(false);
    return;
  }

  cycle++;
  elapsed = 0;
  lastParticleTime = 0;

  player.x = START.x;
  player.y = START.y;

  currentRecording = [{
    t: 0,
    x: START.x,
    y: START.y
  }];

  updateGhosts();
  updateDoor();

  spawnParticles(
    START.x,
    START.y,
    COLORS.purple,
    25
  );

  statusEl.textContent =
    `CICLO ${cycle}: ${recordings.length} eco(s) regressaram!`;
}

// VITÓRIA
function checkGoal() {
  if (rectCollision(playerRect(), GOAL)) {
    finish(true);
  }
}

function finish(won) {
  if (finished) return;

  running = false;
  finished = true;

  if (won) {
    const cycleBonus =
      (MAX_CYCLES - cycle + 1) * 1000;

    const timeBonus =
      Math.floor((CYCLE_DURATION - elapsed) * 100);

    const survivalBonus =
      Math.max(0, 1000 - deaths * 250);

    score +=
      2000 +
      cycleBonus +
      timeBonus +
      survivalBonus;

    overlayTitle.textContent = "PARADOXO RESOLVIDO";

    overlayMessage.textContent =
      `Escapaste no ciclo ${cycle} com ` +
      `${recordings.length} ecos e ${deaths} falhas.`;

    statusEl.textContent =
      "SIMULAÇÃO CONCLUÍDA — PARABÉNS!";
  } else {
    overlayTitle.textContent = "SYSTEM FAILURE";

    overlayMessage.textContent =
      "Os seis ciclos terminaram. " +
      "Tenta alterar o teu passado.";

    statusEl.textContent =
      "SIMULAÇÃO TERMINADA — TENTA NOVAMENTE.";
  }

  finalScore.textContent =
    `${Math.floor(score)} PONTOS`;

  overlay.classList.remove("hidden");
  startBtn.textContent = "JOGAR NOVAMENTE";

  updateHUD();
}

// DESENHO DA ARENA
function drawGrid() {
  ctx.strokeStyle = "#19243d";
  ctx.lineWidth = 1;

  for (let x = 0; x <= W; x += 40) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, H);
    ctx.stroke();
  }

  for (let y = 0; y <= H; y += 40) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(W, y);
    ctx.stroke();
  }
}

function glowRect(x, y, w, h, color, blur = 15) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.shadowColor = color;
  ctx.shadowBlur = blur;
  ctx.fillRect(x, y, w, h);
  ctx.restore();
}

function drawWalls() {
  WALLS.forEach(wall => {
    ctx.fillStyle = "#35415e";
    ctx.fillRect(wall.x, wall.y, wall.w, wall.h);

    ctx.fillStyle = "#64769d";
    ctx.fillRect(wall.x, wall.y, 3, wall.h);
  });
}

function drawPlate() {
  const pulse =
    Math.sin(totalTime * 5) * 3;

  ctx.save();
  ctx.beginPath();
  ctx.arc(
    PLATE.x,
    PLATE.y,
    PLATE.radius + pulse,
    0,
    Math.PI * 2
  );

  ctx.strokeStyle =
    doorOpen ? COLORS.green : COLORS.yellow;

  ctx.lineWidth = 3;
  ctx.shadowColor = ctx.strokeStyle;
  ctx.shadowBlur = 18;
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(PLATE.x, PLATE.y, 12, 0, Math.PI * 2);

  ctx.fillStyle =
    doorOpen ? COLORS.green : COLORS.yellow;

  ctx.fill();

  ctx.restore();

  ctx.fillStyle = "#cbd6ef";
  ctx.font = "12px monospace";
  ctx.textAlign = "center";
  ctx.fillText("PLACA", PLATE.x, PLATE.y - 40);
}

function drawDoor() {
  if (doorOpen) {
    ctx.save();
    ctx.strokeStyle = COLORS.green;
    ctx.setLineDash([6, 6]);
    ctx.lineWidth = 2;
    ctx.strokeRect(
      DOOR.x,
      DOOR.y,
      DOOR.w,
      DOOR.h
    );
    ctx.restore();
  } else {
    glowRect(
      DOOR.x,
      DOOR.y,
      DOOR.w,
      DOOR.h,
      COLORS.red,
      20
    );
  }
}

function drawGoal() {
  const pulse =
    Math.sin(totalTime * 4) * 5;

  ctx.save();

  ctx.shadowColor = COLORS.green;
  ctx.shadowBlur = 20 + pulse;
  ctx.fillStyle = COLORS.green;

  ctx.fillRect(
    GOAL.x,
    GOAL.y,
    GOAL.w,
    GOAL.h
  );

  ctx.fillStyle = "#083324";
  ctx.fillRect(
    GOAL.x + 10,
    GOAL.y + 10,
    GOAL.w - 20,
    GOAL.h - 20
  );

  ctx.restore();

  ctx.fillStyle = COLORS.green;
  ctx.font = "12px monospace";
  ctx.textAlign = "center";
  ctx.fillText(
    "SAÍDA",
    GOAL.x + GOAL.w / 2,
    GOAL.y - 15
  );
}

function drawLasers() {
  LASERS.forEach(laser => {
    const active = isLaserActive(laser);

    ctx.save();

    ctx.beginPath();
    ctx.moveTo(laser.x1, laser.y1);
    ctx.lineTo(laser.x2, laser.y2);

    ctx.strokeStyle =
      active ? COLORS.red : "#52223c";

    ctx.lineWidth = active ? 5 : 2;
    ctx.shadowColor = COLORS.red;
    ctx.shadowBlur = active ? 20 : 0;
    ctx.stroke();

    ctx.restore();

    // Emissores
    glowRect(
      laser.x1 - 8,
      laser.y1 - 8,
      16,
      16,
      active ? COLORS.red : "#71324a",
      8
    );

    glowRect(
      laser.x2 - 8,
      laser.y2 - 8,
      16,
      16,
      active ? COLORS.red : "#71324a",
      8
    );
  });
}

function drawGhosts() {
  ghosts.forEach((ghost, index) => {
    const flicker =
      0.45 + Math.sin(totalTime * 8 + index) * 0.15;

    ctx.save();
    ctx.globalAlpha = flicker;
    ctx.shadowColor = COLORS.purple;
    ctx.shadowBlur = 18;
    ctx.fillStyle = COLORS.purple;

    ctx.fillRect(
      ghost.x - 10,
      ghost.y - 10,
      20,
      20
    );

    ctx.restore();
  });
}

function drawPlayer() {
  ctx.save();

  ctx.shadowColor = COLORS.cyan;
  ctx.shadowBlur = 20;
  ctx.fillStyle = COLORS.cyan;

  ctx.fillRect(
    player.x - player.size / 2,
    player.y - player.size / 2,
    player.size,
    player.size
  );

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(
    player.x - 4,
    player.y - 4,
    8,
    8
  );

  ctx.restore();
}

function drawLabels() {
  ctx.save();
  ctx.font = "12px monospace";
  ctx.fillStyle = "#6e829f";
  ctx.textAlign = "left";

  ctx.fillText("SECTOR 01 // ORIGIN", 20, 25);
  ctx.fillText("SECTOR 02 // PARADOX", 425, 25);

  ctx.restore();
}

function draw() {
  ctx.clearRect(0, 0, W, H);

  ctx.save();

  if (screenShake > 0) {
    ctx.translate(
      (Math.random() - 0.5) * screenShake,
      (Math.random() - 0.5) * screenShake
    );
  }

  ctx.fillStyle = COLORS.background;
  ctx.fillRect(0, 0, W, H);

  drawGrid();
  drawLabels();
  drawWalls();
  drawPlate();
  drawDoor();
  drawGoal();
  drawLasers();
  drawGhosts();
  drawPlayer();
  drawParticles();

  ctx.restore();
}

// LOOP PRINCIPAL
function loop(timestamp) {
  if (!running) return;

  if (!lastTime) lastTime = timestamp;

  const dt = Math.min(
    (timestamp - lastTime) / 1000,
    0.05
  );

  lastTime = timestamp;

  elapsed += dt;
  totalTime += dt;

  // Actualiza ecos e porta antes do movimento.
  updateGhosts();
  updateDoor();

  movePlayer(dt);

  // Actualiza a placa depois do movimento.
  updateDoor();

  recordPosition();

  updateParticles(dt);

  if (screenShake > 0) {
    screenShake = Math.max(
      0,
      screenShake - dt * 35
    );
  }

  // Partículas ocasionais do jogador.
  lastParticleTime += dt;

  if (lastParticleTime > 0.08) {
    lastParticleTime = 0;

    spawnParticles(
      player.x,
      player.y,
      COLORS.cyan,
      1
    );
  }

  // Verificar perigos e objectivo.
  const hit = checkLasers();

  if (!hit && running) {
    checkGoal();
  }

  if (running && elapsed >= CYCLE_DURATION) {
    nextCycle();
  }

  updateHUD();
  draw();

  if (running) {
    animationId = requestAnimationFrame(loop);
  }
}

// CONTROLOS
window.addEventListener("keydown", event => {
  const key = event.key.toLowerCase();

  if (
    key.startsWith("arrow") ||
    key === " "
  ) {
    event.preventDefault();
  }

  if (key === "r") {
    startGame();
    return;
  }

  if (key === " " && !running) {
    startGame();
    return;
  }

  keys.add(key);
});

window.addEventListener("keyup", event => {
  keys.delete(event.key.toLowerCase());
});

window.addEventListener("blur", () => {
  keys.clear();
  lastTime = 0;
});

startBtn.addEventListener("click", startGame);
restartBtn.addEventListener("click", startGame);
playAgainBtn.addEventListener("click", startGame);

// INICIALIZAÇÃO
reset();

console.log(
  "%c ECHO//404 — PARADOX ARENA v0.2 ",
  "background:#050711;color:#00f5ff;font-size:18px;"
);
