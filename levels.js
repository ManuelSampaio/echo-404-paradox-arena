
"use strict";

/*
============================================
 ECHO//404 — PARADOX EVOLUTION
 VERSION 0.6.1 MOBILE EDITION
 FILE: levels.js

 Sistema de níveis e configuração da arena

 10 NÍVEIS
 DESKTOP + MOBILE
============================================
*/

// ==========================================
// 1. CONFIGURAÇÕES GLOBAIS
// ==========================================

const GAME_WORLD = {
  width: 800,
  height: 500,

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

  // Paredes que dividem os dois sectores.
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

  // Porta temporal central.
  door: {
    x: 380,
    y: 195,
    w: 20,
    h: 110
  }
};

// ==========================================
// 2. CONFIGURAÇÃO DOS NÍVEIS
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
      "Deixa um eco na placa para abrir a porta.",

    plates: [
      {
        x: 115,
        y: 100
      }
    ],

    lasers: [
      {
        x: 510,
        period: 3,
        on: 1.3,
        offset: 0
      }
    ],

    portals: []
  },

  // ========================================
  // NÍVEL 02 — DOIS CAMINHOS
  // ========================================

  {
    id: 2,
    name: "Dois Caminhos",

    difficulty: "INICIANTE",

    hint:
      "Sincroniza os teus ecos e evita dois lasers.",

    plates: [
      {
        x: 115,
        y: 100
      }
    ],

    lasers: [
      {
        x: 510,
        period: 3,
        on: 1.5,
        offset: 0
      },
      {
        x: 625,
        period: 4,
        on: 1.8,
        offset: 2
      }
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
      "Dois ecos devem activar duas placas ao mesmo tempo.",

    plates: [
      {
        x: 115,
        y: 100
      },
      {
        x: 115,
        y: 390
      }
    ],

    lasers: [
      {
        x: 510,
        period: 3,
        on: 1.5,
        offset: 0
      },
      {
        x: 625,
        period: 3.5,
        on: 1.5,
        offset: 1
      }
    ],

    portals: []
  },

  // ========================================
  // NÍVEL 04 — SALTO QUÂNTICO
  // ========================================

  {
    id: 4,
    name: "Salto Quântico",

    difficulty: "INTERMÉDIO",

    hint:
      "Utiliza o portal azul para atravessar a arena.",

    plates: [
      {
        x: 115,
        y: 100
      }
    ],

    lasers: [
      {
        x: 560,
        period: 2.7,
        on: 1.4,
        offset: 0
      }
    ],

    portals: [
      {
        a: {
          x: 450,
          y: 100
        },

        b: {
          x: 690,
          y: 390
        }
      }
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
      "Três placas exigem três posições simultâneas.",

    plates: [
      {
        x: 115,
        y: 100
      },
      {
        x: 115,
        y: 250
      },
      {
        x: 115,
        y: 390
      }
    ],

    lasers: [
      {
        x: 510,
        period: 3,
        on: 1.4,
        offset: 0
      },
      {
        x: 625,
        period: 3,
        on: 1.4,
        offset: 1.5
      }
    ],

    portals: []
  },

  // ========================================
  // NÍVEL 06 — INTERFERÊNCIA
  // ========================================

  {
    id: 6,
    name: "Interferência",

    difficulty: "AVANÇADO",

    hint:
      "Encontra a janela temporal entre três lasers rápidos.",

    plates: [
      {
        x: 115,
        y: 100
      },
      {
        x: 115,
        y: 390
      }
    ],

    lasers: [
      {
        x: 480,
        period: 2.2,
        on: 1.1,
        offset: 0
      },
      {
        x: 570,
        period: 2.6,
        on: 1.2,
        offset: 1
      },
      {
        x: 660,
        period: 3,
        on: 1.4,
        offset: 2
      }
    ],

    portals: []
  },

  // ========================================
  // NÍVEL 07 — HORIZONTE PARTIDO
  // ========================================

  {
    id: 7,
    name: "Horizonte Partido",

    difficulty: "AVANÇADO",

    hint:
      "Combina ecos sincronizados com teletransporte.",

    plates: [
      {
        x: 115,
        y: 100
      },
      {
        x: 115,
        y: 390
      }
    ],

    lasers: [
      {
        x: 530,
        period: 2.5,
        on: 1.2,
        offset: 0
      },
      {
        x: 640,
        period: 3,
        on: 1.5,
        offset: 1
      }
    ],

    portals: [
      {
        a: {
          x: 445,
          y: 390
        },

        b: {
          x: 690,
          y: 100
        }
      }
    ]
  },

  // ========================================
  // NÍVEL 08 — TRÊS PARADOXOS
  // ========================================

  {
    id: 8,
    name: "Três Paradoxos",

    difficulty: "EXPERT",

    hint:
      "Três placas, três lasers e apenas seis ciclos.",

    plates: [
      {
        x: 115,
        y: 100
      },
      {
        x: 115,
        y: 250
      },
      {
        x: 115,
        y: 390
      }
    ],

    lasers: [
      {
        x: 480,
        period: 2.1,
        on: 1,
        offset: 0
      },
      {
        x: 560,
        period: 2.5,
        on: 1.2,
        offset: 1
      },
      {
        x: 650,
        period: 2.8,
        on: 1.4,
        offset: 2
      }
    ],

    portals: []
  },

  // ========================================
  // NÍVEL 09 — COLAPSO TEMPORAL
  // ========================================

  {
    id: 9,
    name: "Colapso Temporal",

    difficulty: "EXPERT",

    hint:
      "Mantém os ecos sincronizados e domina o portal.",

    plates: [
      {
        x: 115,
        y: 100
      },
      {
        x: 115,
        y: 250
      },
      {
        x: 115,
        y: 390
      }
    ],

    lasers: [
      {
        x: 470,
        period: 2,
        on: 1,
        offset: 0
      },
      {
        x: 550,
        period: 2.3,
        on: 1.1,
        offset: 1
      },
      {
        x: 630,
        period: 2.6,
        on: 1.3,
        offset: 2
      }
    ],

    portals: [
      {
        a: {
          x: 450,
          y: 100
        },

        b: {
          x: 700,
          y: 390
        }
      }
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
      "O desafio final. Domina todos os teus ecos.",

    plates: [
      {
        x: 115,
        y: 100
      },
      {
        x: 115,
        y: 250
      },
      {
        x: 115,
        y: 390
      }
    ],

    lasers: [
      {
        x: 470,
        period: 1.9,
        on: 0.9,
        offset: 0
      },
      {
        x: 540,
        period: 2.2,
        on: 1.1,
        offset: 1
      },
      {
        x: 610,
        period: 2.5,
        on: 1.2,
        offset: 2
      },
      {
        x: 680,
        period: 2.8,
        on: 1.3,
        offset: 1.5
      }
    ],

    portals: [
      {
        a: {
          x: 450,
          y: 100
        },

        b: {
          x: 700,
          y: 390
        }
      }
    ]
  }
];

// ==========================================
// 3. VALIDAÇÃO DAS CONFIGURAÇÕES
// ==========================================

function validateGameLevels() {
  const errors = [];
  const warnings = [];

  if (
    !Number.isFinite(GAME_WORLD.width) ||
    !Number.isFinite(GAME_WORLD.height) ||
    GAME_WORLD.width <= 0 ||
    GAME_WORLD.height <= 0
  ) {
    errors.push("Dimensões da arena inválidas.");
  }

  if (
    !Number.isFinite(GAME_WORLD.cycleDuration) ||
    GAME_WORLD.cycleDuration <= 0
  ) {
    errors.push("Duração dos ciclos inválida.");
  }

  if (
    !Number.isInteger(GAME_WORLD.maxCycles) ||
    GAME_WORLD.maxCycles <= 0
  ) {
    errors.push("Número máximo de ciclos inválido.");
  }

  if (!Array.isArray(GAME_LEVELS)) {
    errors.push("Lista de níveis inválida.");
  } else {
    const ids = new Set();

    GAME_LEVELS.forEach((level, index) => {
      const number = index + 1;
      const prefix = `Nível ${number}`;

      if (!level || typeof level !== "object") {
        errors.push(`${prefix}: configuração inválida.`);
        return;
      }

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
        typeof level.difficulty !== "string" ||
        !level.difficulty.trim()
      ) {
        warnings.push(`${prefix}: dificuldade não definida.`);
      }

      if (
        typeof level.hint !== "string" ||
        !level.hint.trim()
      ) {
        warnings.push(`${prefix}: dica não definida.`);
      }

      if (!Array.isArray(level.plates)) {
        errors.push(`${prefix}: placas inválidas.`);
      } else {
        level.plates.forEach((plate, plateIndex) => {
          if (
            !plate ||
            !Number.isFinite(plate.x) ||
            !Number.isFinite(plate.y)
          ) {
            errors.push(
              `${prefix}: placa ${plateIndex + 1} inválida.`
            );
          }
        });
      }

      if (!Array.isArray(level.lasers)) {
        errors.push(`${prefix}: lasers inválidos.`);
      } else {
        level.lasers.forEach((laser, laserIndex) => {
          if (
            !laser ||
            !Number.isFinite(laser.x) ||
            !Number.isFinite(laser.period) ||
            !Number.isFinite(laser.on) ||
            !Number.isFinite(laser.offset) ||
            laser.period <= 0 ||
            laser.on < 0 ||
            laser.on > laser.period
          ) {
            errors.push(
              `${prefix}: laser ${laserIndex + 1} inválido.`
            );
          }
        });
      }

      if (!Array.isArray(level.portals)) {
        errors.push(`${prefix}: portais inválidos.`);
      } else {
        level.portals.forEach((portal, portalIndex) => {
          const validPoint = point =>
            point &&
            Number.isFinite(point.x) &&
            Number.isFinite(point.y);

          if (
            !portal ||
            !validPoint(portal.a) ||
            !validPoint(portal.b)
          ) {
            errors.push(
              `${prefix}: portal ${portalIndex + 1} inválido.`
            );
          }
        });
      }
    });
  }

  warnings.forEach(message => console.warn(message));
  errors.forEach(message => console.error(message));

  if (errors.length > 0) {
    console.error(
      `ECHO//404: ${errors.length} erro(s) de configuração.`
    );

    return false;
  }

  console.log(
    `ECHO//404: ${GAME_LEVELS.length} níveis carregados.`
  );

  console.log(
    "ECHO//404 v0.6.1 — LEVEL SYSTEM READY"
  );

  return true;
}

// ==========================================
// 4. INICIALIZAÇÃO
// ==========================================

validateGameLevels();
