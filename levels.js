
"use strict";

/*
==================================================
 ECHO//404 — PARADOX EVOLUTION
 VERSION 0.7 — THE AWAKENING
 FILE: levels.js

 LEVEL DESIGN & DEVELOPMENT
 MANUEL SAMPAIO01

 10 PROGRESSIVE LEVELS
 DESKTOP + MOBILE
==================================================
*/

// ==========================================
// 1. CONFIGURAÇÃO GLOBAL DA ARENA
// ==========================================

const GAME_WORLD = {
  width: 800,
  height: 500,

  // O game.js v0.7 aplica os tempos
  // específicos de cada nível.
  cycleDuration: 10,
  maxCycles: 6,

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
  }
};

// ==========================================
// 2. CONFIGURAÇÕES DE DIFICULDADE
// ==========================================

const LEVEL_DIFFICULTY = [
  {
    time: 10,
    label: "INICIANTE",
    rank: 1
  },
  {
    time: 9,
    label: "INICIANTE+",
    rank: 2
  },
  {
    time: 8,
    label: "INTERMÉDIO",
    rank: 3
  },
  {
    time: 7,
    label: "INTERMÉDIO+",
    rank: 4
  },
  {
    time: 6,
    label: "AVANÇADO",
    rank: 5
  },
  {
    time: 5.5,
    label: "AVANÇADO+",
    rank: 6
  },
  {
    time: 5,
    label: "EXPERT",
    rank: 7
  },
  {
    time: 4.5,
    label: "EXPERT+",
    rank: 8
  },
  {
    time: 4,
    label: "PARADOX",
    rank: 9
  },
  {
    time: 3.5,
    label: "PARADOX MASTER",
    rank: 10
  }
];

// ==========================================
// 3. CONSTRUTORES DE ELEMENTOS
// ==========================================

function createPlate(x, y) {
  return { x, y };
}

function createLaser(x, period, on, offset = 0) {
  return {
    x,
    period,
    on,
    offset
  };
}

function createPortal(ax, ay, bx, by) {
  return {
    a: {
      x: ax,
      y: ay
    },
    b: {
      x: bx,
      y: by
    }
  };
}

// ==========================================
// 4. OS DEZ NÍVEIS
// ==========================================

const GAME_LEVELS = [

  // ========================================
  // NÍVEL 01 — O PRIMEIRO ECO
  // ========================================

  {
    id: 1,
    name: "O Primeiro Eco",
    difficulty: "INICIANTE",

    hint:
      "Aprende a gravar um eco. Activa a placa, " +
      "espera pelo próximo ciclo e atravessa.",

    plates: [
      createPlate(115, 250)
    ],

    lasers: [
      createLaser(540, 3.5, 1.1, 0)
    ],

    portals: []
  },

  // ========================================
  // NÍVEL 02 — DOIS CAMINHOS
  // ========================================

  {
    id: 2,
    name: "Dois Caminhos",
    difficulty: "INICIANTE+",

    hint:
      "Deixa um eco na placa e encontra a " +
      "janela certa entre os dois lasers.",

    plates: [
      createPlate(145, 220)
    ],

    lasers: [
      createLaser(515, 3.2, 1.3, 0),
      createLaser(640, 3.7, 1.4, 1.8)
    ],

    portals: []
  },

  // ========================================
  // NÍVEL 03 — MEMÓRIA DUPLA
  // ========================================

  {
    id: 3,
    name: "Memória Dupla",
    difficulty: "INTERMÉDIO",

    hint:
      "Dois ecos, duas placas. Sincroniza as " +
      "posições antes de avançar.",

    plates: [
      createPlate(120, 170),
      createPlate(120, 330)
    ],

    lasers: [
      createLaser(520, 3.0, 1.2, 0),
      createLaser(645, 3.4, 1.3, 1.5)
    ],

    portals: []
  },

  // ========================================
  // NÍVEL 04 — SALTO QUÂNTICO
  // ========================================

  {
    id: 4,
    name: "Salto Quântico",
    difficulty: "INTERMÉDIO+",

    hint:
      "Activa a placa e utiliza o portal " +
      "para ultrapassar os lasers.",

    plates: [
      createPlate(145, 250)
    ],

    lasers: [
      createLaser(535, 2.8, 1.25, 0),
      createLaser(625, 3.3, 1.35, 1.4)
    ],

    portals: [
      createPortal(
        445, 250,
        690, 250
      )
    ]
  },

  // ========================================
  // NÍVEL 05 — O TERCEIRO FANTASMA
  // ========================================

  {
    id: 5,
    name: "O Terceiro Fantasma",
    difficulty: "AVANÇADO",

    hint:
      "Três placas precisam de três " +
      "posições sincronizadas. Planeia " +
      "os ciclos com precisão.",

    plates: [
      createPlate(115, 150),
      createPlate(165, 250),
      createPlate(115, 350)
    ],

    lasers: [
      createLaser(525, 2.8, 1.2, 0),
      createLaser(635, 3.1, 1.25, 1.5)
    ],

    portals: []
  },

  // ========================================
  // NÍVEL 06 — INTERFERÊNCIA
  // ========================================

  {
    id: 6,
    name: "Interferência",
    difficulty: "AVANÇADO+",

    hint:
      "Sincroniza dois ecos e atravessa " +
      "três lasers de alta frequência.",

    plates: [
      createPlate(135, 185),
      createPlate(135, 315)
    ],

    lasers: [
      createLaser(475, 2.4, 1.05, 0),
      createLaser(565, 2.7, 1.15, 1.2),
      createLaser(655, 3.0, 1.2, 2.0)
    ],

    portals: []
  },

  // ========================================
  // NÍVEL 07 — HORIZONTE PARTIDO
  // ========================================

  {
    id: 7,
    name: "Horizonte Partido",
    difficulty: "EXPERT",

    hint:
      "Dois ecos abrem a porta. " +
      "O portal oferece um atalho, " +
      "mas exige timing perfeito.",

    plates: [
      createPlate(130, 185),
      createPlate(130, 315)
    ],

    lasers: [
      createLaser(520, 2.4, 1.1, 0),
      createLaser(635, 2.8, 1.2, 1.2)
    ],

    portals: [
      createPortal(
        445, 250,
        690, 250
      )
    ]
  },

  // ========================================
  // NÍVEL 08 — TRÊS PARADOXOS
  // ========================================

  {
    id: 8,
    name: "Três Paradoxos",
    difficulty: "EXPERT+",

    hint:
      "Três ecos sincronizados, três lasers " +
      "e apenas 4,5 segundos por ciclo.",

    plates: [
      createPlate(110, 185),
      createPlate(160, 250),
      createPlate(110, 315)
    ],

    lasers: [
      createLaser(475, 2.3, 1.05, 0),
      createLaser(565, 2.6, 1.15, 1.1),
      createLaser(650, 2.9, 1.2, 2.0)
    ],

    portals: [
      createPortal(
        440, 250,
        690, 250
      )
    ]
  },

  // ========================================
  // NÍVEL 09 — COLAPSO TEMPORAL
  // ========================================

  {
    id: 9,
    name: "Colapso Temporal",
    difficulty: "PARADOX",

    hint:
      "Quatro segundos. Três placas. " +
      "Cada movimento precisa de " +
      "ser calculado.",

    plates: [
      createPlate(115, 190),
      createPlate(165, 250),
      createPlate(115, 310)
    ],

    lasers: [
      createLaser(470, 2.15, 1.0, 0),
      createLaser(550, 2.45, 1.1, 1.0),
      createLaser(630, 2.75, 1.2, 1.8)
    ],

    portals: [
      createPortal(
        435, 250,
        690, 250
      )
    ]
  },

  // ========================================
  // NÍVEL 10 — ECHO//404
  // ========================================

  {
    id: 10,
    name: "ECHO//404",
    difficulty: "PARADOX MASTER",

    hint:
      "O despertar final. Três placas, " +
      "quatro lasers e 3,5 segundos. " +
      "Não existe margem para hesitar.",

    plates: [
      createPlate(105, 190),
      createPlate(150, 250),
      createPlate(105, 310)
    ],

    lasers: [
      createLaser(465, 2.05, 0.95, 0),
      createLaser(540, 2.3, 1.05, 0.8),
      createLaser(610, 2.55, 1.15, 1.6),
      createLaser(680, 2.85, 1.25, 2.2)
    ],

    portals: [
      createPortal(
        435, 250,
        695, 250
      )
    ]
  }
];

// ==========================================
// 5. METADADOS DOS NÍVEIS
// ==========================================

GAME_LEVELS.forEach((level, index) => {
  const config = LEVEL_DIFFICULTY[index];

  level.timeLimit = config.time;
  level.rank = config.rank;
  level.difficulty = config.label;

  level.objectives = {
    plates: level.plates.length,
    lasers: level.lasers.length,
    portals: level.portals.length
  };
});

// ==========================================
// 6. VALIDAÇÃO
// ==========================================

function validateGameLevels() {
  const errors = [];
  const warnings = [];

  const isValidPoint = point => (
    point &&
    Number.isFinite(point.x) &&
    Number.isFinite(point.y) &&
    point.x >= 0 &&
    point.x <= GAME_WORLD.width &&
    point.y >= 0 &&
    point.y <= GAME_WORLD.height
  );

  const isInsideRect = (point, rect) => (
    point.x >= rect.x &&
    point.x <= rect.x + rect.w &&
    point.y >= rect.y &&
    point.y <= rect.y + rect.h
  );

  if (
    !Number.isFinite(GAME_WORLD.width) ||
    !Number.isFinite(GAME_WORLD.height) ||
    GAME_WORLD.width <= 0 ||
    GAME_WORLD.height <= 0
  ) {
    errors.push(
      "Dimensões da arena inválidas."
    );
  }

  if (
    !Number.isFinite(GAME_WORLD.cycleDuration) ||
    GAME_WORLD.cycleDuration <= 0
  ) {
    errors.push(
      "Duração global dos ciclos inválida."
    );
  }

  if (
    !Number.isInteger(GAME_WORLD.maxCycles) ||
    GAME_WORLD.maxCycles <= 0
  ) {
    errors.push(
      "Número máximo de ciclos inválido."
    );
  }

  if (
    !Array.isArray(GAME_LEVELS) ||
    GAME_LEVELS.length === 0
  ) {
    errors.push(
      "A lista de níveis está vazia."
    );
  } else {
    const ids = new Set();

    GAME_LEVELS.forEach((level, index) => {
      const prefix = `Nível ${index + 1}`;

      if (!Number.isInteger(level.id)) {
        errors.push(`${prefix}: ID inválido.`);
      } else if (ids.has(level.id)) {
        errors.push(`${prefix}: ID duplicado.`);
      } else {
        ids.add(level.id);
      }

      if (
        typeof level.name !== "string" ||
        !level.name.trim()
      ) {
        errors.push(`${prefix}: nome inválido.`);
      }

      if (
        typeof level.hint !== "string" ||
        !level.hint.trim()
      ) {
        warnings.push(
          `${prefix}: dica não definida.`
        );
      }

      if (
        !Number.isFinite(level.timeLimit) ||
        level.timeLimit <= 0
      ) {
        errors.push(
          `${prefix}: tempo inválido.`
        );
      }

      if (
        !Array.isArray(level.plates) ||
        level.plates.length === 0
      ) {
        errors.push(
          `${prefix}: placas inválidas.`
        );
      } else {
        level.plates.forEach((plate, i) => {
          if (!isValidPoint(plate)) {
            errors.push(
              `${prefix}: placa ${i + 1} inválida.`
            );
          }

          if (
            isValidPoint(plate) &&
            isInsideRect(
              plate,
              GAME_WORLD.door
            )
          ) {
            warnings.push(
              `${prefix}: placa ${i + 1} ` +
              "sobreposta à porta."
            );
          }
        });
      }

      if (!Array.isArray(level.lasers)) {
        errors.push(
          `${prefix}: lasers inválidos.`
        );
      } else {
        level.lasers.forEach((laser, i) => {
          const valid = (
            Number.isFinite(laser.x) &&
            Number.isFinite(laser.period) &&
            Number.isFinite(laser.on) &&
            Number.isFinite(laser.offset) &&
            laser.period > 0 &&
            laser.on >= 0 &&
            laser.on <= laser.period &&
            laser.x > 0 &&
            laser.x < GAME_WORLD.width
          );

          if (!valid) {
            errors.push(
              `${prefix}: laser ${i + 1} inválido.`
            );
          }
        });
      }

      if (!Array.isArray(level.portals)) {
        errors.push(
          `${prefix}: portais inválidos.`
        );
      } else {
        level.portals.forEach((portal, i) => {
          if (
            !isValidPoint(portal.a) ||
            !isValidPoint(portal.b)
          ) {
            errors.push(
              `${prefix}: portal ${i + 1} inválido.`
            );
          }

          if (
            isValidPoint(portal.a) &&
            isValidPoint(portal.b) &&
            Math.hypot(
              portal.a.x - portal.b.x,
              portal.a.y - portal.b.y
            ) < 50
          ) {
            warnings.push(
              `${prefix}: portal ${i + 1} ` +
              "tem pontos demasiado próximos."
            );
          }
        });
      }
    });
  }

  warnings.forEach(message => {
    console.warn(
      `[ECHO//404 WARNING] ${message}`
    );
  });

  errors.forEach(message => {
    console.error(
      `[ECHO//404 ERROR] ${message}`
    );
  });

  if (errors.length > 0) {
    console.error(
      `ECHO//404: ${errors.length} ` +
      "erro(s) encontrados."
    );

    return false;
  }

  console.log(
    `ECHO//404: ${GAME_LEVELS.length} ` +
    "níveis validados."
  );

  return true;
}

// ==========================================
// 7. INICIALIZAÇÃO
// ==========================================

validateGameLevels();

console.log(
  "=================================="
);

console.log(
  "ECHO//404 — THE AWAKENING v0.7"
);

console.log(
  "10 PROGRESSIVE LEVELS READY"
);

console.log(
  "DESKTOP + MOBILE"
);

console.log(
  "LEVEL DESIGN BY MANUEL SAMPAIO01"
);

console.log(
  "=================================="
);
