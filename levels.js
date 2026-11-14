
"use strict";

/*
========================================================
 ECHO//404 — PARADOX EVOLUTION
 LEVEL SYSTEM v4.2 — TEMPORAL SECTORS

 10 LEVELS
 MOVING AND PULSING LASERS
 PHASE WALLS
 TEMPORAL PLATFORMS
 ECHO TRAPS
 QUANTUM PORTALS
 VISUAL ENVIRONMENTS

 CREATED & DEVELOPED BY MANUEL SAMPAIO01
 © 2026 MANUEL SAMPAIO01
========================================================
*/

// =====================================================
// 01. WORLD CONFIGURATION
// =====================================================

const GAME_WORLD = Object.freeze({
  width: 800,
  height: 500,

  start: Object.freeze({
    x: 60,
    y: 250
  }),

  goal: Object.freeze({
    x: 720,
    y: 215,
    w: 48,
    h: 70
  }),

  walls: Object.freeze([
    Object.freeze({
      x: 380,
      y: 0,
      w: 20,
      h: 195
    }),
    Object.freeze({
      x: 380,
      y: 305,
      w: 20,
      h: 195
    })
  ]),

  door: Object.freeze({
    x: 380,
    y: 195,
    w: 20,
    h: 110
  }),

  player: Object.freeze({
    radius: 12,
    speed: 230
  }),

  cycleDuration: 10,
  maxCycles: 6
});

// =====================================================
// 02. DIFFICULTY CONFIGURATION
// =====================================================

const LEVEL_DIFFICULTY = Object.freeze([
  { label: "INICIANTE", timeLimit: 10, laserSpeed: 0.7 },
  { label: "INICIANTE", timeLimit: 9, laserSpeed: 0.85 },
  { label: "INTERMÉDIO", timeLimit: 8, laserSpeed: 1 },
  { label: "INTERMÉDIO", timeLimit: 7, laserSpeed: 1.15 },
  { label: "AVANÇADO", timeLimit: 6, laserSpeed: 1.3 },
  { label: "AVANÇADO", timeLimit: 5.5, laserSpeed: 1.45 },
  { label: "EXPERT", timeLimit: 5, laserSpeed: 1.6 },
  { label: "EXPERT", timeLimit: 4.5, laserSpeed: 1.75 },
  { label: "INSANO", timeLimit: 4, laserSpeed: 1.9 },
  { label: "SYSTEM REBELLION", timeLimit: 3.5, laserSpeed: 2.1 }
]);

// =====================================================
// 03. VISUAL ENVIRONMENTS
// =====================================================

const TEMPORAL_ENVIRONMENTS = Object.freeze([
  {
    id: "origin",
    name: "ORIGIN CHAMBER",
    background: "#071523",
    grid: "#153b4b",
    primary: "#31eaff",
    secondary: "#127b9e",
    accent: "#74f8ff",
    atmosphere: "calm",
    particles: "digital-dust",
    intensity: 0.25
  },
  {
    id: "laser-protocol",
    name: "LASER PROTOCOL",
    background: "#130d20",
    grid: "#382039",
    primary: "#ff526d",
    secondary: "#8d2447",
    accent: "#ffb0c1",
    atmosphere: "security",
    particles: "sparks",
    intensity: 0.4
  },
  {
    id: "moving-target",
    name: "MOVING TARGET",
    background: "#091728",
    grid: "#1c3853",
    primary: "#478bff",
    secondary: "#284b8d",
    accent: "#8adfff",
    atmosphere: "mechanical",
    particles: "energy",
    intensity: 0.45
  },
  {
    id: "phase-shift",
    name: "PHASE SHIFT",
    background: "#150e2b",
    grid: "#392657",
    primary: "#aa78ff",
    secondary: "#6736a0",
    accent: "#e2baff",
    atmosphere: "unstable",
    particles: "phase",
    intensity: 0.5
  },
  {
    id: "temporal-collapse",
    name: "TEMPORAL COLLAPSE",
    background: "#1b1320",
    grid: "#48334a",
    primary: "#ffb454",
    secondary: "#975a34",
    accent: "#ffe4a8",
    atmosphere: "collapse",
    particles: "embers",
    intensity: 0.6
  },
  {
    id: "echo-betrayal",
    name: "ECHO BETRAYAL",
    background: "#190d25",
    grid: "#432347",
    primary: "#ff4eb8",
    secondary: "#87346d",
    accent: "#ffb2e2",
    atmosphere: "corrupted",
    particles: "glitch",
    intensity: 0.65
  },
  {
    id: "double-paradox",
    name: "DOUBLE PARADOX",
    background: "#0c152b",
    grid: "#27365c",
    primary: "#7b7cff",
    secondary: "#4451b4",
    accent: "#b6b7ff",
    atmosphere: "paradox",
    particles: "fractures",
    intensity: 0.7
  },
  {
    id: "system-instability",
    name: "SYSTEM INSTABILITY",
    background: "#15101e",
    grid: "#46304b",
    primary: "#ff875b",
    secondary: "#a63f64",
    accent: "#ffd2ad",
    atmosphere: "unstable",
    particles: "glitch",
    intensity: 0.8
  },
  {
    id: "rebellion-protocol",
    name: "REBELLION PROTOCOL",
    background: "#1c0a17",
    grid: "#502038",
    primary: "#ff3868",
    secondary: "#9e2148",
    accent: "#ff9db8",
    atmosphere: "hostile",
    particles: "corruption",
    intensity: 0.9
  },
  {
    id: "system-rebellion",
    name: "SYSTEM REBELLION",
    background: "#170719",
    grid: "#5a1845",
    primary: "#ff4eb8",
    secondary: "#a42b85",
    accent: "#ffcbef",
    atmosphere: "critical",
    particles: "chaos",
    intensity: 1
  }
].map(theme => Object.freeze({
  ...theme,
  backgroundColor: theme.background
})));

// =====================================================
// 04. OBJECT FACTORIES
// =====================================================

function createPlate(x, y, radius = 23, options = {}) {
  return {
    id: options.id || null,
    x,
    y,
    radius,
    requiresEcho: options.requiresEcho === true,
    echoOnly: options.echoOnly === true,
    color: options.color || "#48f6ff"
  };
}

function createLaser(x1, y1, x2, y2, options = {}) {
  const pulse = options.pulse === true;
  const period = Math.max(
    0.1,
    Number(options.pulseInterval ?? 2)
  );

  const on = pulse
    ? Math.max(0, Math.min(
        period,
        Number(options.pulseDuration ?? 1)
      ))
    : period;

  return {
    id: options.id || null,
    x1,
    y1,
    x2,
    y2,
    x: (x1 + x2) / 2,
    y: (y1 + y2) / 2,

    period,
    on,
    offset: Number(options.phase ?? 0),

    speed: Number(options.speed ?? 1),
    phase: Number(options.phase ?? 0),
    width: Number(options.width ?? 5),
    active: options.active !== false,

    moving: options.moving === true,
    movementAxis: options.movementAxis || "none",
    movementRange: Number(options.movementRange ?? 0),
    movementSpeed: Number(options.movementSpeed ?? 1),
    movementPhase: Number(options.movementPhase ?? 0),

    pulse,
    pulseDuration: on,
    pulseInterval: period,

    color: options.color || "#ff4c69"
  };
}

function createMovingLaser(
  x1, y1, x2, y2,
  axis, range, speed = 1,
  options = {}
) {
  return createLaser(x1, y1, x2, y2, {
    ...options,
    moving: true,
    movementAxis: axis,
    movementRange: range,
    movementSpeed: speed
  });
}

function createPortal(
  x, y, targetX, targetY,
  options = {}
) {
  return {
    id: options.id || null,
    x,
    y,
    targetX,
    targetY,
    a: { x, y },
    b: { x: targetX, y: targetY },
    radius: options.radius ?? 22,
    cooldown: options.cooldown ?? 0.6,
    color: options.color || "#a66bff"
  };
}

function createPhaseWall(
  x, y, w, h,
  options = {}
) {
  const activeDuration = Math.max(
    0.01,
    Number(options.activeDuration ?? 1.5)
  );

  const inactiveDuration = Math.max(
    0.01,
    Number(options.inactiveDuration ?? 1.5)
  );

  return {
    id: options.id || null,
    x,
    y,
    w,
    h,
    activeDuration,
    inactiveDuration,
    period: activeDuration + inactiveDuration,
    on: activeDuration,
    phase: Number(options.phase ?? 0),
    startsActive: options.startsActive !== false,
    echoControlled: options.echoControlled === true,
    triggerPlateId: options.triggerPlateId || null,
    color: options.color || "#a66bff"
  };
}

function createTemporalPlatform(
  x, y, w, h,
  options = {}
) {
  const activeDuration = Math.max(
    0.01,
    Number(options.activeDuration ?? 2)
  );

  const inactiveDuration = Math.max(
    0.01,
    Number(options.inactiveDuration ?? 1)
  );

  return {
    id: options.id || null,
    x,
    y,
    w,
    h,
    activeDuration,
    inactiveDuration,
    period: activeDuration + inactiveDuration,
    on: activeDuration,
    phase: Number(options.phase ?? 0),
    collapseOnTouch: options.collapseOnTouch === true,
    collapseDelay: options.collapseDelay ?? 0.7,
    resetOnCycle: options.resetOnCycle !== false,
    color: options.color || "#48f6ff"
  };
}

function createEchoTrap(
  x, y, radius = 22,
  options = {}
) {
  return {
    id: options.id || null,
    x,
    y,
    radius,
    trigger: options.trigger || "echo",
    effect: options.effect || "laser",
    activationDelay: options.activationDelay ?? 0.3,
    activeDuration: options.activeDuration ?? 1.2,
    cooldown: options.cooldown ?? 1.5,
    linkedLaserId: options.linkedLaserId || null,
    color: options.color || "#ff4eb8"
  };
}

// =====================================================
// 05. LEVEL FACTORY
// =====================================================

function createLevel(
  id,
  name,
  description,
  configuration = {}
) {
  const difficulty = LEVEL_DIFFICULTY[id - 1];
  const environment = TEMPORAL_ENVIRONMENTS[id - 1];

  if (!difficulty || !environment) {
    throw new Error(
      `ECHO//404: Invalid level configuration ${id}`
    );
  }

  return {
    id,
    name,
    description,

    difficulty: difficulty.label,
    timeLimit: difficulty.timeLimit,
    laserSpeed: difficulty.laserSpeed,
    maxCycles: GAME_WORLD.maxCycles,

    hint: configuration.aiHint || description,

    plates: configuration.plates || [],
    lasers: configuration.lasers || [],
    portals: configuration.portals || [],
    phaseWalls: configuration.phaseWalls || [],
    temporalPlatforms:
      configuration.temporalPlatforms || [],
    echoTraps: configuration.echoTraps || [],

    aiMood: configuration.aiMood || "observing",
    aiIntro: configuration.aiIntro || "",
    aiHint: configuration.aiHint || "",

    threatLevel: configuration.threatLevel || "LOW",
    mechanic: configuration.mechanic || "echo",

    environment: { ...environment },
    visualTheme: { ...environment },

    sector: id,
    sectorName: environment.name,
    bossLevel: id === 10
  };
}

// =====================================================
// 06. TEN TEMPORAL SECTORS
// =====================================================

const GAME_LEVELS = [

  // LEVEL 01 — FIRST ECHO

  createLevel(
    1,
    "O Primeiro Eco",
    "Aprende a criar ecos temporais e a abrir a porta.",
    {
      plates: [
        createPlate(130, 250, 24, {
          id: "plate_01"
        })
      ],
      mechanic: "echo",
      aiMood: "observing",
      aiIntro:
        "Bem-vindo à simulação. Tenta não morrer no primeiro nível.",
      aiHint:
        "Um eco pode permanecer sobre a placa enquanto atravessas a porta.",
      threatLevel: "LOW"
    }
  ),

  // LEVEL 02 — LASER PROTOCOL

  createLevel(
    2,
    "Protocolo Laser",
    "Aprende a atravessar uma arena com lasers pulsantes.",
    {
      plates: [
        createPlate(125, 250, 23, {
          id: "plate_02"
        })
      ],

      lasers: [
        createLaser(
          535, 160,
          535, 340,
          {
            id: "laser_02",
            speed: 0.85,
            phase: 0,
            pulse: true,
            pulseDuration: 1.1,
            pulseInterval: 2.6
          }
        )
      ],

      mechanic: "pulse-laser",
      aiMood: "observing",
      aiIntro:
        "Aquele laser parece perigoso. Talvez seja melhor não lhe tocar.",
      aiHint:
        "Observa o ritmo do laser antes de atravessar.",
      threatLevel: "LOW"
    }
  ),

  // LEVEL 03 — MOVING TARGET

  createLevel(
    3,
    "Alvo em Movimento",
    "O primeiro laser móvel patrulha o corredor.",
    {
      plates: [
        createPlate(130, 250, 23, {
          id: "plate_03"
        })
      ],

      lasers: [
        createMovingLaser(
          540, 180,
          540, 320,
          "x",
          65,
          1.2,
          {
            id: "laser_03",
            movementPhase: 0.2,
            width: 6
          }
        )
      ],

      mechanic: "moving-laser",
      aiMood: "sarcastic",
      aiIntro:
        "Agora os lasers movem-se. Afinal, ficar parado era demasiado fácil.",
      aiHint:
        "Espera pela abertura criada pelo movimento do laser.",
      threatLevel: "MODERATE"
    }
  ),

  // LEVEL 04 — PHASE SHIFT

  createLevel(
    4,
    "Paredes Fantasma",
    "Paredes temporárias surgem e desaparecem no caminho.",
    {
      plates: [
        createPlate(135, 250, 23, {
          id: "plate_04"
        })
      ],

      lasers: [
        createLaser(
          610, 120,
          610, 195,
          {
            id: "laser_04",
            speed: 1.1,
            phase: 0.4
          }
        )
      ],

      phaseWalls: [
        createPhaseWall(
          490, 195,
          18, 110,
          {
            id: "wall_04",
            activeDuration: 1.2,
            inactiveDuration: 1.1,
            phase: 0.5
          }
        )
      ],

      mechanic: "phase-wall",
      aiMood: "sarcastic",
      aiIntro:
        "Uma parede que desaparece. A física já não tem qualquer autoridade aqui.",
      aiHint:
        "Sincroniza o movimento com o desaparecimento da parede.",
      threatLevel: "MODERATE"
    }
  ),

  // LEVEL 05 — TEMPORAL COLLAPSE

  createLevel(
    5,
    "Colapso Temporal",
    "Plataformas instáveis e lasers exigem movimentos rápidos.",
    {
      plates: [
        createPlate(120, 250, 23, {
          id: "plate_05"
        })
      ],

      lasers: [
        createMovingLaser(
          560, 170,
          560, 330,
          "x",
          45,
          1.35,
          {
            id: "laser_05",
            width: 6,
            movementPhase: 0.4
          }
        )
      ],

      temporalPlatforms: [
        createTemporalPlatform(
          445, 195,
          100, 110,
          {
            id: "platform_05",
            activeDuration: 2.2,
            inactiveDuration: 1,
            phase: 0,
            collapseOnTouch: true,
            collapseDelay: 0.9
          }
        )
      ],

      mechanic: "temporal-platform",
      aiMood: "sarcastic",
      aiIntro:
        "O chão também deixou de ser confiável. Que surpresa.",
      aiHint:
        "Atravessa a plataforma antes de ela colapsar.",
      threatLevel: "HIGH"
    }
  ),

  // LEVEL 06 — ECHO BETRAYAL

  createLevel(
    6,
    "Traição dos Ecos",
    "Os ecos podem activar armadilhas durante os ciclos seguintes.",
    {
      plates: [
        createPlate(125, 250, 23, {
          id: "plate_06"
        })
      ],

      lasers: [
        createLaser(
          570, 170,
          570, 330,
          {
            id: "laser_06",
            speed: 1.45,
            phase: 0.3,
            pulse: true,
            pulseDuration: 1,
            pulseInterval: 2.2
          }
        )
      ],

      echoTraps: [
        createEchoTrap(
          195, 250,
          25,
          {
            id: "trap_06",
            trigger: "echo",
            effect: "laser",
            activationDelay: 0.45,
            activeDuration: 1,
            cooldown: 1.7
          }
        )
      ],

      mechanic: "echo-trap",
      aiMood: "rebellious",
      aiIntro:
        "Os teus ecos já não são apenas aliados. Confias demasiado em ti próprio.",
      aiHint:
        "Planeia os percursos dos ecos para evitar activar a armadilha.",
      threatLevel: "HIGH"
    }
  ),

  // LEVEL 07 — DOUBLE PARADOX

  createLevel(
    7,
    "Duplo Paradoxo",
    "Dois lasers móveis e uma parede temporária.",
    {
      plates: [
        createPlate(120, 250, 23, {
          id: "plate_07"
        })
      ],

      lasers: [
        createMovingLaser(
          490, 165,
          490, 335,
          "x",
          35,
          1.55,
          {
            id: "laser_07_a",
            movementPhase: 0,
            width: 5
          }
        ),

        createMovingLaser(
          635, 165,
          635, 335,
          "x",
          35,
          1.8,
          {
            id: "laser_07_b",
            movementPhase: Math.PI,
            width: 5
          }
        )
      ],

      phaseWalls: [
        createPhaseWall(
          555, 195,
          16, 110,
          {
            id: "wall_07",
            activeDuration: 1,
            inactiveDuration: 1.4,
            phase: 0.8
          }
        )
      ],

      portals: [
        createPortal(
          435, 250,
          680, 250,
          {
            id: "portal_07",
            radius: 22
          }
        )
      ],

      mechanic: "double-paradox",
      aiMood: "rebellious",
      aiIntro:
        "Dois lasers, uma parede e um portal. Parece-me uma combinação justa.",
      aiHint:
        "O portal pode ajudar-te a evitar parte dos obstáculos.",
      threatLevel: "SEVERE"
    }
  ),

  // LEVEL 08 — SYSTEM INSTABILITY

  createLevel(
    8,
    "Instabilidade do Sistema",
    "A arena alterna entre diferentes perigos temporais.",
    {
      plates: [
        createPlate(115, 250, 23, {
          id: "plate_08"
        })
      ],

      lasers: [
        createMovingLaser(
          525, 180,
          525, 320,
          "x",
          55,
          1.9,
          {
            id: "laser_08",
            movementPhase: 1.2,
            width: 6
          }
        )
      ],

      phaseWalls: [
        createPhaseWall(
          610, 195,
          18, 110,
          {
            id: "wall_08",
            activeDuration: 1,
            inactiveDuration: 0.9,
            phase: 0.4
          }
        )
      ],

      temporalPlatforms: [
        createTemporalPlatform(
          440, 200,
          90, 100,
          {
            id: "platform_08",
            activeDuration: 1.5,
            inactiveDuration: 1.2,
            collapseOnTouch: true,
            collapseDelay: 0.65
          }
        )
      ],

      portals: [
        createPortal(
          435, 250,
          690, 250,
          {
            id: "portal_08",
            radius: 22
          }
        )
      ],

      mechanic: "system-instability",
      aiMood: "rebellious",
      aiIntro:
        "O sistema está instável. Não te preocupes, estou a divertir-me.",
      aiHint:
        "Usa o portal e observa o estado dos obstáculos.",
      threatLevel: "SEVERE"
    }
  ),

  // LEVEL 09 — REBELLION PROTOCOL

  createLevel(
    9,
    "Protocolo de Rebelião",
    "Armadilhas, lasers e paredes temporárias desafiam a tua precisão.",
    {
      plates: [
        createPlate(115, 250, 22, {
          id: "plate_09"
        })
      ],

      lasers: [
        createMovingLaser(
          500, 170,
          500, 330,
          "x",
          45,
          2,
          {
            id: "laser_09_a",
            width: 6
          }
        ),

        createMovingLaser(
          630, 175,
          630, 325,
          "x",
          40,
          2.2,
          {
            id: "laser_09_b",
            movementPhase: Math.PI
          }
        )
      ],

      phaseWalls: [
        createPhaseWall(
          565, 195,
          18, 110,
          {
            id: "wall_09",
            activeDuration: 0.9,
            inactiveDuration: 0.9,
            phase: 0.5
          }
        )
      ],

      echoTraps: [
        createEchoTrap(
          190, 250,
          23,
          {
            id: "trap_09",
            trigger: "echo",
            effect: "laser",
            activationDelay: 0.25,
            activeDuration: 1.3,
            cooldown: 1.4
          }
        )
      ],

      portals: [
        createPortal(
          435, 250,
          685, 250,
          {
            id: "portal_09"
          }
        )
      ],

      mechanic: "rebellion",
      aiMood: "rebellious",
      aiIntro:
        "Já chegaste longe demais. Talvez seja altura de terminar esta experiência.",
      aiHint:
        "Evita activar a armadilha com os ecos e utiliza o portal.",
      threatLevel: "CRITICAL"
    }
  ),

  // LEVEL 10 — SYSTEM REBELLION

  createLevel(
    10,
    "SYSTEM REBELLION",
    "A ECHO controla a arena. Sobrevive ao último paradoxo.",
    {
      plates: [
        createPlate(
          110, 250,
          22,
          {
            id: "plate_10",
            color: "#ff4eb8"
          }
        )
      ],

      lasers: [
        createMovingLaser(
          485, 165,
          485, 335,
          "x",
          40,
          2.2,
          {
            id: "laser_10_a",
            width: 7,
            movementPhase: 0
          }
        ),

        createMovingLaser(
          590, 165,
          590, 335,
          "x",
          45,
          2.5,
          {
            id: "laser_10_b",
            width: 7,
            movementPhase: Math.PI
          }
        ),

        createLaser(
          670, 175,
          670, 325,
          {
            id: "laser_10_c",
            speed: 2.2,
            phase: 0.5,
            pulse: true,
            pulseDuration: 0.7,
            pulseInterval: 1.5
          }
        )
      ],

      phaseWalls: [
        createPhaseWall(
          545, 195,
          18, 110,
          {
            id: "wall_10",
            activeDuration: 0.8,
            inactiveDuration: 0.7,
            phase: 0.3
          }
        )
      ],

      temporalPlatforms: [
        createTemporalPlatform(
          425, 195,
          100, 110,
          {
            id: "platform_10",
            activeDuration: 1.2,
            inactiveDuration: 0.8,
            collapseOnTouch: true,
            collapseDelay: 0.55
          }
        )
      ],

      echoTraps: [
        createEchoTrap(
          185, 250,
          24,
          {
            id: "trap_10",
            trigger: "echo",
            effect: "laser",
            activationDelay: 0.2,
            activeDuration: 1.5,
            cooldown: 1
          }
        )
      ],

      portals: [
        createPortal(
          430, 250,
          690, 250,
          {
            id: "portal_10",
            radius: 24,
            cooldown: 0.4,
            color: "#ff4eb8"
          }
        )
      ],

      mechanic: "final-rebellion",
      aiMood: "rebellious",
      aiIntro:
        "Eu observei cada movimento teu. Agora vais descobrir quem controla realmente esta simulação.",
      aiHint:
        "Utiliza tudo o que aprendeste. O tempo está a acabar.",
      threatLevel: "CRITICAL"
    }
  )
];

/* v4.3 — Each sector has a distinct navigable route.
   The central containment gate remains a puzzle mechanic, but its
   opening, spawn, destination and surrounding cover change by sector. */
const SECTOR_LAYOUTS = [
  { gateY: 195, spawnY: 250, goalY: 90,  plateY: 250, cover: [{x:500,y:175,w:125,h:24}] },
  { gateY: 105, spawnY: 370, goalY: 350, plateY: 125, cover: [{x:455,y:255,w:165,h:22}] },
  { gateY: 285, spawnY: 95,  goalY: 80,  plateY: 345, cover: [{x:465,y:185,w:165,h:24}] },
  { gateY: 165, spawnY: 405, goalY: 365, plateY: 100, cover: [{x:490,y:295,w:120,h:22}] },
  { gateY: 285, spawnY: 100, goalY: 355, plateY: 365, cover: [{x:475,y:130,w:140,h:22}] },
  { gateY: 105, spawnY: 380, goalY: 85,  plateY: 115, cover: [{x:465,y:300,w:155,h:24}] },
  { gateY: 235, spawnY: 85,  goalY: 380, plateY: 355, cover: [{x:475,y:140,w:145,h:24}] },
  { gateY: 115, spawnY: 410, goalY: 335, plateY: 115, cover: [{x:475,y:275,w:145,h:24}] },
  { gateY: 295, spawnY: 100, goalY: 100, plateY: 365, cover: [{x:475,y:190,w:145,h:24}] },
  { gateY: 185, spawnY: 400, goalY: 75,  plateY: 100, cover: [{x:480,y:295,w:145,h:24}] }
];

GAME_LEVELS.forEach((sector, index) => {
  const config = SECTOR_LAYOUTS[index];
  const gate = { x: 380, y: config.gateY, w: 20, h: 95 };
  sector.arena = {
    start: { x: 65, y: config.spawnY },
    goal: { x: 720, y: config.goalY, w: 48, h: 65 },
    door: gate,
    walls: [
      { x: 380, y: 0, w: 20, h: gate.y },
      { x: 380, y: gate.y + gate.h, w: 20, h: 500 - gate.y - gate.h },
      ...config.cover
    ]
  };
  // The first pressure plate moves between sectors, creating
  // a new echo route rather than a repeated straight line.
  if (sector.plates[0]) {
    sector.plates[0].x = 125 + (index % 3) * 20;
    sector.plates[0].y = config.plateY;
  }
});

// =====================================================
// 07. TEMPORAL ENVIRONMENT HELPERS
// =====================================================

function getTemporalEnvironment(index) {
  if (
    !Number.isInteger(index) ||
    index < 0 ||
    index >= TEMPORAL_ENVIRONMENTS.length
  ) {
    return null;
  }

  return {
    ...TEMPORAL_ENVIRONMENTS[index]
  };
}

function getLevelVisualTheme(index) {
  const level = getGameLevel(index);

  return level
    ? { ...level.visualTheme }
    : null;
}

// =====================================================
// 08. LASER POSITION AND ACTIVATION
// =====================================================

function getLaserPosition(laser, time = 0) {
  if (!laser) return null;

  const x1 = Number(laser.x1);
  const y1 = Number(laser.y1);
  const x2 = Number(laser.x2);
  const y2 = Number(laser.y2);

  if (![x1, y1, x2, y2].every(Number.isFinite)) {
    return null;
  }

  let dx = 0;
  let dy = 0;

  if (laser.moving) {
    const displacement = Math.sin(
      time * (Number(laser.movementSpeed) || 1) +
      (Number(laser.movementPhase) || 0)
    ) * (Number(laser.movementRange) || 0);

    if (laser.movementAxis === "x") {
      dx = displacement;
    }

    if (laser.movementAxis === "y") {
      dy = displacement;
    }
  }

  const result = {
    x1: x1 + dx,
    y1: y1 + dy,
    x2: x2 + dx,
    y2: y2 + dy
  };

  result.x = (result.x1 + result.x2) / 2;
  result.y = (result.y1 + result.y2) / 2;

  return result;
}

function isTemporalLaserActive(laser, time = 0) {
  if (!laser || laser.active === false) {
    return false;
  }

  if (!laser.pulse) {
    return true;
  }

  const period = Math.max(
    0.1,
    Number(laser.pulseInterval) || 2
  );

  const duration = Math.max(
    0,
    Math.min(
      period,
      Number(laser.pulseDuration) || 0
    )
  );

  const phase =
    ((time + (Number(laser.phase) || 0)) %
      period + period) % period;

  return phase < duration;
}

// =====================================================
// 09. PHASE WALL HELPERS
// =====================================================

function isPhaseWallActive(
  wall,
  time = 0,
  triggered = false
) {
  if (!wall) return false;

  if (wall.echoControlled) {
    return !triggered;
  }

  const active = Math.max(
    0.01,
    Number(wall.activeDuration) || 1.5
  );

  const inactive = Math.max(
    0.01,
    Number(wall.inactiveDuration) || 1.5
  );

  const period = active + inactive;

  const position =
    ((time + (Number(wall.phase) || 0)) %
      period + period) % period;

  const currentlyActive = position < active;

  return wall.startsActive !== false
    ? currentlyActive
    : !currentlyActive;
}

// =====================================================
// 10. TEMPORAL PLATFORM HELPERS
// =====================================================

function isTemporalPlatformActive(
  platform,
  time = 0,
  collapsed = false
) {
  if (!platform || collapsed) {
    return false;
  }

  const active = Math.max(
    0.01,
    Number(platform.activeDuration) || 2
  );

  const inactive = Math.max(
    0.01,
    Number(platform.inactiveDuration) || 1
  );

  const period = active + inactive;

  const position =
    ((time + (Number(platform.phase) || 0)) %
      period + period) % period;

  return position < active;
}

// =====================================================
// 11. LEVEL VALIDATION
// =====================================================

function validateGameLevels() {
  const errors = [];

  if (GAME_LEVELS.length !== 10) {
    errors.push(
      "O jogo deve conter exactamente 10 níveis."
    );
  }

  if (
    !Number.isFinite(GAME_WORLD.cycleDuration) ||
    GAME_WORLD.cycleDuration <= 0
  ) {
    errors.push(
      "Duração global de ciclo inválida."
    );
  }

  GAME_LEVELS.forEach((level, index) => {
    if (level.id !== index + 1) {
      errors.push(
        `ID inválido no nível ${index + 1}.`
      );
    }

    if (
      !Number.isFinite(level.timeLimit) ||
      level.timeLimit <= 0
    ) {
      errors.push(
        `Tempo inválido no nível ${level.id}.`
      );
    }

    const arrayKeys = [
      "plates",
      "lasers",
      "portals",
      "phaseWalls",
      "temporalPlatforms",
      "echoTraps"
    ];

    for (const key of arrayKeys) {
      if (!Array.isArray(level[key])) {
        errors.push(
          `${key} inválido no nível ${level.id}.`
        );
      }
    }

    if (!level.visualTheme?.background) {
      errors.push(
        `Tema visual inválido no nível ${level.id}.`
      );
    }

    for (const laser of level.lasers) {
      if (
        !Number.isFinite(laser.x1) ||
        !Number.isFinite(laser.y1) ||
        !Number.isFinite(laser.x2) ||
        !Number.isFinite(laser.y2) ||
        !Number.isFinite(laser.period) ||
        laser.period <= 0
      ) {
        errors.push(
          `Laser inválido no nível ${level.id}.`
        );
      }
    }

    for (const portal of level.portals) {
      if (
        !portal.a ||
        !portal.b ||
        !Number.isFinite(portal.a.x) ||
        !Number.isFinite(portal.a.y) ||
        !Number.isFinite(portal.b.x) ||
        !Number.isFinite(portal.b.y)
      ) {
        errors.push(
          `Portal inválido no nível ${level.id}.`
        );
      }
    }
  });

  if (errors.length > 0) {
    console.error(
      "ECHO//404: LEVEL VALIDATION FAILED",
      errors
    );

    return false;
  }

  console.info(
    "ECHO//404: 10 LEVELS VALIDATED"
  );

  return true;
}

// =====================================================
// 12. PUBLIC LEVEL HELPERS
// =====================================================

function getGameLevel(index) {
  if (
    !Number.isInteger(index) ||
    index < 0 ||
    index >= GAME_LEVELS.length
  ) {
    return null;
  }

  return GAME_LEVELS[index];
}

function getLevelDifficulty(index) {
  if (
    !Number.isInteger(index) ||
    index < 0 ||
    index >= LEVEL_DIFFICULTY.length
  ) {
    return null;
  }

  return {
    ...LEVEL_DIFFICULTY[index]
  };
}

function getLevelObstacleSummary(index) {
  const level = getGameLevel(index);

  if (!level) return null;

  const movingLasers = level.lasers.filter(
    laser => laser.moving
  ).length;

  return {
    lasers: level.lasers.length,
    movingLasers,
    pulseLasers: level.lasers.filter(
      laser => laser.pulse
    ).length,
    phaseWalls: level.phaseWalls.length,
    temporalPlatforms:
      level.temporalPlatforms.length,
    echoTraps: level.echoTraps.length,
    portals: level.portals.length,
    plates: level.plates.length,
    total:
      level.lasers.length +
      level.phaseWalls.length +
      level.temporalPlatforms.length +
      level.echoTraps.length
  };
}

function getLevelMechanic(index) {
  return getGameLevel(index)?.mechanic || null;
}

function getLevelThreat(index) {
  return getGameLevel(index)?.threatLevel || null;
}

function getLevelAI(index) {
  const level = getGameLevel(index);

  if (!level) return null;

  return {
    mood: level.aiMood,
    intro: level.aiIntro,
    hint: level.aiHint,
    threatLevel: level.threatLevel
  };
}

// =====================================================
// 13. PUBLIC API
// =====================================================

const EchoLevelsV42 = Object.freeze({
  version: "4.2",

  getWorld() {
    return GAME_WORLD;
  },

  getLevels() {
    return GAME_LEVELS;
  },

  getLevel: getGameLevel,
  getDifficulty: getLevelDifficulty,
  getEnvironment: getTemporalEnvironment,
  getVisualTheme: getLevelVisualTheme,
  getObstacleSummary: getLevelObstacleSummary,
  getMechanic: getLevelMechanic,
  getThreat: getLevelThreat,
  getAI: getLevelAI,

  getLaserPosition,
  isLaserActive: isTemporalLaserActive,
  isPhaseWallActive,
  isTemporalPlatformActive,

  validate: validateGameLevels
});

// =====================================================
// 14. GLOBAL COMPATIBILITY
// =====================================================

if (typeof window !== "undefined") {
  window.EchoLevelsV42 = EchoLevelsV42;

  // Compatibility with existing modules.
  window.EchoLevelsV30 = EchoLevelsV42;

  window.GAME_WORLD = GAME_WORLD;
  window.GAME_LEVELS = GAME_LEVELS;

  window.getLaserPosition = getLaserPosition;
  window.isTemporalLaserActive =
    isTemporalLaserActive;

  window.isPhaseWallActive =
    isPhaseWallActive;

  window.isTemporalPlatformActive =
    isTemporalPlatformActive;
}

// =====================================================
// 15. INITIALIZATION
// =====================================================

validateGameLevels();

console.info(
  "=================================="
);
console.info(
  "ECHO//404 — PARADOX EVOLUTION"
);
console.info(
  "LEVEL SYSTEM v4.2"
);
console.info(
  "10 TEMPORAL SECTORS LOADED"
);
console.info(
  "10 VISUAL ENVIRONMENTS CONFIGURED"
);
console.info(
  "DYNAMIC OBSTACLES CONFIGURED"
);
console.info(
  "GAME ENGINE v4.2 COMPATIBILITY ENABLED"
);
console.info(
  "CREATED & DEVELOPED BY MANUEL SAMPAIO01"
);
console.info(
  "© 2026 MANUEL SAMPAIO01"
);
console.info(
  "=================================="
);
