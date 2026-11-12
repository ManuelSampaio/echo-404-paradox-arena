
"use strict";

/*
========================================================
 ECHO//404 — PARADOX EVOLUTION
 VERSION 0.8 — SYSTEM REBELLION
 FILE: levels.js

 10 TEMPORAL SECTORS
 MOVING LASERS
 PHASE WALLS
 TEMPORAL PLATFORMS
 ECHO-ACTIVATED TRAPS

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

  start: {
    x: 60,
    y: 250
  },

  goal: {
    x: 720,
    y: 215,
    w: 48,
    h: 70
  },

  walls: [
    {
      x: 380,
      y: 0,
      w: 20,
      h: 195
    },
    {
      x: 380,
      y: 305,
      w: 20,
      h: 195
    }
  ],

  door: {
    x: 380,
    y: 195,
    w: 20,
    h: 110
  },

  player: {
    radius: 12,
    speed: 230
  },

  maxCycles: 6
});

// =====================================================
// 02. DIFFICULTY SETTINGS
// =====================================================

const LEVEL_DIFFICULTY = Object.freeze([
  {
    label: "INICIANTE",
    timeLimit: 10,
    laserSpeed: 0.7
  },
  {
    label: "INICIANTE",
    timeLimit: 9,
    laserSpeed: 0.85
  },
  {
    label: "INTERMÉDIO",
    timeLimit: 8,
    laserSpeed: 1
  },
  {
    label: "INTERMÉDIO",
    timeLimit: 7,
    laserSpeed: 1.15
  },
  {
    label: "AVANÇADO",
    timeLimit: 6,
    laserSpeed: 1.3
  },
  {
    label: "AVANÇADO",
    timeLimit: 5.5,
    laserSpeed: 1.45
  },
  {
    label: "EXPERT",
    timeLimit: 5,
    laserSpeed: 1.6
  },
  {
    label: "EXPERT",
    timeLimit: 4.5,
    laserSpeed: 1.75
  },
  {
    label: "INSANO",
    timeLimit: 4,
    laserSpeed: 1.9
  },
  {
    label: "SYSTEM REBELLION",
    timeLimit: 3.5,
    laserSpeed: 2.1
  }
]);

// =====================================================
// 03. OBJECT FACTORIES
// =====================================================

function createPlate(
  x,
  y,
  radius = 23,
  options = {}
) {
  return {
    x,
    y,
    radius,

    id: options.id || null,

    requiresEcho:
      options.requiresEcho === true,

    echoOnly:
      options.echoOnly === true,

    color:
      options.color || "#48f6ff"
  };
}

function createLaser(
  x1,
  y1,
  x2,
  y2,
  options = {}
) {
  return {
    x1,
    y1,
    x2,
    y2,

    speed:
      options.speed ?? 1,

    phase:
      options.phase ?? 0,

    width:
      options.width ?? 5,

    active:
      options.active !== false,

    // New v0.8 movement properties.
    moving:
      options.moving === true,

    movementAxis:
      options.movementAxis || "none",

    movementRange:
      options.movementRange ?? 0,

    movementSpeed:
      options.movementSpeed ?? 1,

    movementPhase:
      options.movementPhase ?? 0,

    pulse:
      options.pulse === true,

    pulseDuration:
      options.pulseDuration ?? 1,

    pulseInterval:
      options.pulseInterval ?? 2,

    color:
      options.color || "#ff4c69"
  };
}

function createMovingLaser(
  x1,
  y1,
  x2,
  y2,
  axis,
  range,
  speed = 1,
  options = {}
) {
  return createLaser(
    x1,
    y1,
    x2,
    y2,
    {
      ...options,

      moving: true,

      movementAxis: axis,
      movementRange: range,
      movementSpeed: speed
    }
  );
}

function createPortal(
  x,
  y,
  targetX,
  targetY,
  options = {}
) {
  return {
    x,
    y,

    targetX,
    targetY,

    radius:
      options.radius ?? 22,

    cooldown:
      options.cooldown ?? 0.6,

    color:
      options.color || "#a66bff"
  };
}

function createPhaseWall(
  x,
  y,
  w,
  h,
  options = {}
) {
  return {
    x,
    y,
    w,
    h,

    id:
      options.id || null,

    activeDuration:
      options.activeDuration ?? 1.5,

    inactiveDuration:
      options.inactiveDuration ?? 1.5,

    phase:
      options.phase ?? 0,

    startsActive:
      options.startsActive !== false,

    echoControlled:
      options.echoControlled === true,

    triggerPlateId:
      options.triggerPlateId || null,

    color:
      options.color || "#a66bff"
  };
}

function createTemporalPlatform(
  x,
  y,
  w,
  h,
  options = {}
) {
  return {
    x,
    y,
    w,
    h,

    id:
      options.id || null,

    activeDuration:
      options.activeDuration ?? 2,

    inactiveDuration:
      options.inactiveDuration ?? 1,

    phase:
      options.phase ?? 0,

    collapseOnTouch:
      options.collapseOnTouch === true,

    collapseDelay:
      options.collapseDelay ?? 0.7,

    resetOnCycle:
      options.resetOnCycle !== false,

    color:
      options.color || "#48f6ff"
  };
}

function createEchoTrap(
  x,
  y,
  radius = 22,
  options = {}
) {
  return {
    x,
    y,
    radius,

    id:
      options.id || null,

    trigger:
      options.trigger || "echo",

    effect:
      options.effect || "laser",

    activationDelay:
      options.activationDelay ?? 0.3,

    activeDuration:
      options.activeDuration ?? 1.2,

    cooldown:
      options.cooldown ?? 1.5,

    linkedLaserId:
      options.linkedLaserId || null,

    color:
      options.color || "#ff4eb8"
  };
}

// =====================================================
// 04. LEVEL CREATION
// =====================================================

function createLevel(
  id,
  name,
  description,
  configuration = {}
) {
  const difficulty =
    LEVEL_DIFFICULTY[id - 1];

  return {
    id,
    name,
    description,

    difficulty:
      difficulty.label,

    timeLimit:
      difficulty.timeLimit,

    laserSpeed:
      difficulty.laserSpeed,

    maxCycles:
      GAME_WORLD.maxCycles,

    plates:
      configuration.plates || [],

    lasers:
      configuration.lasers || [],

    portals:
      configuration.portals || [],

    // v0.8 dynamic systems.
    phaseWalls:
      configuration.phaseWalls || [],

    temporalPlatforms:
      configuration.temporalPlatforms || [],

    echoTraps:
      configuration.echoTraps || [],

    aiMood:
      configuration.aiMood || "observing",

    aiIntro:
      configuration.aiIntro || "",

    aiHint:
      configuration.aiHint || "",

    threatLevel:
      configuration.threatLevel || "LOW",

    mechanic:
      configuration.mechanic || "echo"
  };
}

// =====================================================
// 05. THE TEN TEMPORAL SECTORS
// =====================================================

const GAME_LEVELS = [

  // ---------------------------------------------------
  // LEVEL 01 — FIRST ECHO
  // ---------------------------------------------------

  createLevel(
    1,
    "O Primeiro Eco",
    "Aprende a criar ecos temporais e a abrir a porta.",
    {
      plates: [
        createPlate(
          130,
          250,
          24,
          { id: "plate_01" }
        )
      ],

      lasers: [],

      portals: [],

      phaseWalls: [],
      temporalPlatforms: [],
      echoTraps: [],

      mechanic: "echo",

      aiMood: "observing",

      aiIntro:
        "Bem-vindo à simulação. Tenta não morrer no primeiro nível.",

      aiHint:
        "Um eco pode permanecer sobre a placa enquanto atravessas a porta.",

      threatLevel: "LOW"
    }
  ),

  // ---------------------------------------------------
  // LEVEL 02 — LASER PROTOCOL
  // ---------------------------------------------------

  createLevel(
    2,
    "Protocolo Laser",
    "Aprende a atravessar uma arena com lasers pulsantes.",
    {
      plates: [
        createPlate(
          125,
          250,
          23,
          { id: "plate_02" }
        )
      ],

      lasers: [
        createLaser(
          535,
          160,
          535,
          340,
          {
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

  // ---------------------------------------------------
  // LEVEL 03 — MOVING TARGET
  // ---------------------------------------------------

  createLevel(
    3,
    "Alvo em Movimento",
    "O primeiro laser móvel patrulha o corredor.",
    {
      plates: [
        createPlate(
          130,
          250,
          23,
          { id: "plate_03" }
        )
      ],

      lasers: [
        createMovingLaser(
          540,
          180,
          540,
          320,
          "x",
          65,
          1.2,
          {
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

  // ---------------------------------------------------
  // LEVEL 04 — PHASE SHIFT
  // ---------------------------------------------------

  createLevel(
    4,
    "Paredes Fantasma",
    "Paredes temporárias surgem e desaparecem no caminho.",
    {
      plates: [
        createPlate(
          135,
          250,
          23,
          { id: "plate_04" }
        )
      ],

      lasers: [
        createLaser(
          610,
          120,
          610,
          195,
          {
            speed: 1.1,
            phase: 0.4
          }
        )
      ],

      phaseWalls: [
        createPhaseWall(
          490,
          195,
          18,
          110,
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

  // ---------------------------------------------------
  // LEVEL 05 — TEMPORAL COLLAPSE
  // ---------------------------------------------------

  createLevel(
    5,
    "Colapso Temporal",
    "Plataformas instáveis e lasers exigem movimentos rápidos.",
    {
      plates: [
        createPlate(
          120,
          250,
          23,
          { id: "plate_05" }
        )
      ],

      lasers: [
        createMovingLaser(
          560,
          170,
          560,
          330,
          "x",
          45,
          1.35,
          {
            width: 6,
            movementPhase: 0.4
          }
        )
      ],

      temporalPlatforms: [
        createTemporalPlatform(
          445,
          195,
          100,
          110,
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

  // ---------------------------------------------------
  // LEVEL 06 — ECHO BETRAYAL
  // ---------------------------------------------------

  createLevel(
    6,
    "Traição dos Ecos",
    "Os ecos podem activar armadilhas durante os ciclos seguintes.",
    {
      plates: [
        createPlate(
          125,
          250,
          23,
          { id: "plate_06" }
        )
      ],

      lasers: [
        createLaser(
          570,
          170,
          570,
          330,
          {
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
          195,
          250,
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

  // ---------------------------------------------------
  // LEVEL 07 — DOUBLE PARADOX
  // ---------------------------------------------------

  createLevel(
    7,
    "Duplo Paradoxo",
    "Dois lasers móveis e uma parede temporária.",
    {
      plates: [
        createPlate(
          120,
          250,
          23,
          { id: "plate_07" }
        )
      ],

      lasers: [
        createMovingLaser(
          490,
          165,
          490,
          335,
          "x",
          35,
          1.55,
          {
            movementPhase: 0,
            width: 5
          }
        ),

        createMovingLaser(
          635,
          165,
          635,
          335,
          "x",
          35,
          1.8,
          {
            movementPhase: Math.PI,
            width: 5
          }
        )
      ],

      phaseWalls: [
        createPhaseWall(
          555,
          195,
          16,
          110,
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
          435,
          250,
          680,
          250,
          {
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

  // ---------------------------------------------------
  // LEVEL 08 — SYSTEM INSTABILITY
  // ---------------------------------------------------

  createLevel(
    8,
    "Instabilidade do Sistema",
    "A arena alterna entre diferentes perigos temporais.",
    {
      plates: [
        createPlate(
          115,
          250,
          23,
          { id: "plate_08" }
        )
      ],

      lasers: [
        createMovingLaser(
          525,
          180,
          525,
          320,
          "x",
          55,
          1.9,
          {
            movementPhase: 1.2,
            width: 6
          }
        )
      ],

      phaseWalls: [
        createPhaseWall(
          610,
          195,
          18,
          110,
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
          440,
          200,
          90,
          100,
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
          435,
          250,
          690,
          250,
          {
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

  // ---------------------------------------------------
  // LEVEL 09 — REBELLION PROTOCOL
  // ---------------------------------------------------

  createLevel(
    9,
    "Protocolo de Rebelião",
    "Armadilhas, lasers e paredes temporárias desafiam a tua precisão.",
    {
      plates: [
        createPlate(
          115,
          250,
          22,
          { id: "plate_09" }
        )
      ],

      lasers: [
        createMovingLaser(
          500,
          170,
          500,
          330,
          "x",
          45,
          2,
          {
            width: 6
          }
        ),

        createMovingLaser(
          630,
          175,
          630,
          325,
          "x",
          40,
          2.2,
          {
            movementPhase: Math.PI
          }
        )
      ],

      phaseWalls: [
        createPhaseWall(
          565,
          195,
          18,
          110,
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
          190,
          250,
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
          435,
          250,
          685,
          250
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

  // ---------------------------------------------------
  // LEVEL 10 — SYSTEM REBELLION
  // ---------------------------------------------------

  createLevel(
    10,
    "SYSTEM REBELLION",
    "A ECHO controla a arena. Sobrevive ao último paradoxo.",
    {
      plates: [
        createPlate(
          110,
          250,
          22,
          {
            id: "plate_10",
            color: "#ff4eb8"
          }
        )
      ],

      lasers: [
        createMovingLaser(
          485,
          165,
          485,
          335,
          "x",
          40,
          2.2,
          {
            width: 7,
            movementPhase: 0
          }
        ),

        createMovingLaser(
          590,
          165,
          590,
          335,
          "x",
          45,
          2.5,
          {
            width: 7,
            movementPhase: Math.PI
          }
        ),

        createLaser(
          670,
          175,
          670,
          325,
          {
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
          545,
          195,
          18,
          110,
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
          425,
          195,
          100,
          110,
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
          185,
          250,
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
          430,
          250,
          690,
          250,
          {
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

// =====================================================
// 06. VALIDATION
// =====================================================

function validateGameLevels() {
  const errors = [];

  if (GAME_LEVELS.length !== 10) {
    errors.push(
      "O jogo deve conter exactamente 10 níveis."
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

    [
      "plates",
      "lasers",
      "portals",
      "phaseWalls",
      "temporalPlatforms",
      "echoTraps"
    ].forEach(key => {
      if (!Array.isArray(level[key])) {
        errors.push(
          `${key} inválido no nível ${level.id}.`
        );
      }
    });
  });

  if (errors.length > 0) {
    console.error(
      "ECHO//404: LEVEL VALIDATION FAILED",
      errors
    );

    return false;
  }

  console.log(
    "ECHO//404: 10 LEVELS VALIDATED"
  );

  return true;
}

// =====================================================
// 07. PUBLIC LEVEL HELPERS
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

  return LEVEL_DIFFICULTY[index];
}

function getLevelObstacleSummary(index) {
  const level = getGameLevel(index);

  if (!level) {
    return null;
  }

  return {
    movingLasers:
      level.lasers.filter(
        laser => laser.moving
      ).length,

    phaseWalls:
      level.phaseWalls.length,

    temporalPlatforms:
      level.temporalPlatforms.length,

    echoTraps:
      level.echoTraps.length,

    total:
      level.lasers.length +
      level.phaseWalls.length +
      level.temporalPlatforms.length +
      level.echoTraps.length
  };
}

// =====================================================
// 08. INITIALIZATION
// =====================================================

validateGameLevels();

console.log(
  "=================================="
);

console.log(
  "ECHO//404 — SYSTEM REBELLION v0.8"
);

console.log(
  "10 TEMPORAL SECTORS LOADED"
);

console.log(
  "DYNAMIC OBSTACLES CONFIGURED"
);

console.log(
  "CREATED BY MANUEL SAMPAIO01"
);

console.log(
  "=================================="
);

/*
========================================================
 ECHO//404 — SYSTEM REBELLION v0.8

 CREATED & DEVELOPED BY
 MANUEL SAMPAIO01

 © 2026 MANUEL SAMPAIO01
========================================================
*/
