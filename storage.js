
"use strict";

/*
==================================================
 ECHO//404 — PARADOX EVOLUTION
 VERSION: 0.6.1 MOBILE EDITION
 FILE: storage.js

 SISTEMA DE PROGRESSO E RECORDES

 DESKTOP + MOBILE
 LOCALSTORAGE
 COMPATÍVEL COM A VERSÃO 0.6
==================================================
*/

const GameStorage = {

  // ==========================================
  // 1. CONFIGURAÇÕES
  // ==========================================

  // Manter esta chave para preservar
  // o progresso da versão anterior.
  key: "echo404_paradox_v06",

  version: "0.6.1",

  totalLevels: 10,

  // ==========================================
  // 2. DADOS INICIAIS
  // ==========================================

  defaults() {
    return {
      version: this.version,

      // Nível máximo desbloqueado.
      unlocked: 1,

      // Melhores pontuações.
      bestScores: Array(this.totalLevels).fill(0),

      // Níveis concluídos.
      completed: Array(this.totalLevels).fill(false),

      // Preferência de áudio.
      sound: true,

      // Estatísticas gerais.
      stats: {
        totalWins: 0,
        totalAttempts: 0,
        totalDeaths: 0,
        totalShifts: 0,
        totalScore: 0
      },

      // Datas do progresso.
      createdAt: new Date().toISOString(),
      updatedAt: null
    };
  },

  // ==========================================
  // 3. FUNÇÕES AUXILIARES
  // ==========================================

  safeNumber(value, fallback = 0) {
    const number = Number(value);

    if (!Number.isFinite(number)) {
      return fallback;
    }

    return Math.max(0, number);
  },

  safeInteger(value, fallback = 0) {
    return Math.floor(
      this.safeNumber(value, fallback)
    );
  },

  isValidDate(value) {
    return (
      typeof value === "string" &&
      value.trim().length > 0 &&
      !Number.isNaN(Date.parse(value))
    );
  },

  // ==========================================
  // 4. NORMALIZAR PROGRESSO
  // ==========================================

  normalize(saved) {
    const fallback = this.defaults();

    if (
      !saved ||
      typeof saved !== "object" ||
      Array.isArray(saved)
    ) {
      return fallback;
    }

    const scores = Array.isArray(saved.bestScores)
      ? saved.bestScores
      : [];

    const completed = Array.isArray(saved.completed)
      ? saved.completed
      : [];

    const stats =
      saved.stats &&
      typeof saved.stats === "object" &&
      !Array.isArray(saved.stats)
        ? saved.stats
        : {};

    const normalizedCompleted = Array.from(
      { length: this.totalLevels },
      (_, index) => completed[index] === true
    );

    const normalizedScores = Array.from(
      { length: this.totalLevels },
      (_, index) => this.safeInteger(scores[index])
    );

    const requestedUnlocked = this.safeInteger(
      saved.unlocked,
      1
    );

    // Se existem níveis concluídos, garante
    // que o nível seguinte está desbloqueado.
    let unlocked = Math.max(
      1,
      Math.min(
        this.totalLevels,
        requestedUnlocked
      )
    );

    normalizedCompleted.forEach((done, index) => {
      if (done) {
        unlocked = Math.max(
          unlocked,
          Math.min(this.totalLevels, index + 2)
        );
      }
    });

    return {
      version: this.version,

      unlocked,

      bestScores: normalizedScores,

      completed: normalizedCompleted,

      sound: saved.sound !== false,

      stats: {
        totalWins: this.safeInteger(
          stats.totalWins
        ),

        totalAttempts: this.safeInteger(
          stats.totalAttempts
        ),

        totalDeaths: this.safeInteger(
          stats.totalDeaths
        ),

        totalShifts: this.safeInteger(
          stats.totalShifts
        ),

        totalScore: this.safeInteger(
          stats.totalScore
        )
      },

      createdAt: this.isValidDate(saved.createdAt)
        ? saved.createdAt
        : fallback.createdAt,

      updatedAt: this.isValidDate(saved.updatedAt)
        ? saved.updatedAt
        : null
    };
  },

  // ==========================================
  // 5. CARREGAR PROGRESSO
  // ==========================================

  load() {
    try {
      const raw = localStorage.getItem(this.key);

      if (!raw) {
        return this.defaults();
      }

      const saved = JSON.parse(raw);

      return this.normalize(saved);

    } catch (error) {
      console.warn(
        "ECHO//404: erro ao carregar progresso.",
        error
      );

      return this.defaults();
    }
  },

  // ==========================================
  // 6. GUARDAR PROGRESSO
  // ==========================================

  save(data) {
    try {
      const normalized = this.normalize(data);

      const payload = {
        ...normalized,
        version: this.version,
        updatedAt: new Date().toISOString()
      };

      localStorage.setItem(
        this.key,
        JSON.stringify(payload)
      );

      return true;

    } catch (error) {
      console.warn(
        "ECHO//404: não foi possível guardar.",
        error
      );

      return false;
    }
  },

  // ==========================================
  // 7. REGISTAR VITÓRIA
  // ==========================================

  win(levelIndex, score) {
    const data = this.load();

    if (
      !Number.isInteger(levelIndex) ||
      levelIndex < 0 ||
      levelIndex >= this.totalLevels
    ) {
      console.warn(
        "ECHO//404: nível inválido.",
        levelIndex
      );

      return data;
    }

    const finalScore = this.safeInteger(score);

    // Marcar nível como concluído.
    data.completed[levelIndex] = true;

    // Actualizar o recorde.
    data.bestScores[levelIndex] = Math.max(
      data.bestScores[levelIndex],
      finalScore
    );

    // Desbloquear o próximo nível.
    data.unlocked = Math.max(
      data.unlocked,
      Math.min(
        this.totalLevels,
        levelIndex + 2
      )
    );

    // Actualizar estatísticas.
    data.stats.totalWins += 1;
    data.stats.totalScore += finalScore;

    this.save(data);

    return data;
  },

  // ==========================================
  // 8. CONSULTAR RECORDE
  // ==========================================

  getBestScore(levelIndex) {
    if (
      !Number.isInteger(levelIndex) ||
      levelIndex < 0 ||
      levelIndex >= this.totalLevels
    ) {
      return 0;
    }

    const data = this.load();

    return data.bestScores[levelIndex];
  },

  // ==========================================
  // 9. VERIFICAR NÍVEL DESBLOQUEADO
  // ==========================================

  isUnlocked(levelIndex) {
    if (
      !Number.isInteger(levelIndex) ||
      levelIndex < 0 ||
      levelIndex >= this.totalLevels
    ) {
      return false;
    }

    const data = this.load();

    return levelIndex < data.unlocked;
  },

  // ==========================================
  // 10. VERIFICAR NÍVEL CONCLUÍDO
  // ==========================================

  isCompleted(levelIndex) {
    if (
      !Number.isInteger(levelIndex) ||
      levelIndex < 0 ||
      levelIndex >= this.totalLevels
    ) {
      return false;
    }

    const data = this.load();

    return data.completed[levelIndex] === true;
  },

  // ==========================================
  // 11. REGISTAR TENTATIVA
  // ==========================================

  registerAttempt() {
    const data = this.load();

    data.stats.totalAttempts += 1;

    return this.save(data);
  },

  // ==========================================
  // 12. REGISTAR MORTE
  // ==========================================

  registerDeath() {
    const data = this.load();

    data.stats.totalDeaths += 1;

    return this.save(data);
  },

  // ==========================================
  // 13. REGISTAR PARADOX SHIFT
  // ==========================================

  registerShift() {
    const data = this.load();

    data.stats.totalShifts += 1;

    return this.save(data);
  },

  // ==========================================
  // 14. CONFIGURAÇÕES DE SOM
  // ==========================================

  setSound(enabled) {
    const data = this.load();

    data.sound = Boolean(enabled);

    this.save(data);

    return data.sound;
  },

  getSound() {
    return this.load().sound;
  },

  // ==========================================
  // 15. PROGRESSO GERAL
  // ==========================================

  getProgress() {
    const data = this.load();

    const completedCount =
      data.completed.filter(Boolean).length;

    const percentage = Math.round(
      (completedCount / this.totalLevels) * 100
    );

    const totalBestScore =
      data.bestScores.reduce(
        (total, value) => total + value,
        0
      );

    return {
      completed: completedCount,
      total: this.totalLevels,
      percentage,
      unlocked: data.unlocked,
      totalBestScore
    };
  },

  // ==========================================
  // 16. ESTATÍSTICAS
  // ==========================================

  getStats() {
    return this.load().stats;
  },

  // ==========================================
  // 17. EXPORTAR PROGRESSO
  // ==========================================

  exportProgress() {
    const data = this.load();

    return JSON.stringify(data, null, 2);
  },

  // ==========================================
  // 18. IMPORTAR PROGRESSO
  // ==========================================

  importProgress(json) {
    try {
      const parsed =
        typeof json === "string"
          ? JSON.parse(json)
          : json;

      if (
        !parsed ||
        typeof parsed !== "object" ||
        Array.isArray(parsed) ||
        !Array.isArray(parsed.bestScores) ||
        !Array.isArray(parsed.completed)
      ) {
        console.warn(
          "ECHO//404: ficheiro de progresso inválido."
        );

        return false;
      }

      // Verificar se as estruturas têm
      // conteúdo compatível com o jogo.
      if (
        parsed.bestScores.length !== this.totalLevels ||
        parsed.completed.length !== this.totalLevels
      ) {
        console.warn(
          "ECHO//404: número de níveis incompatível."
        );

        return false;
      }

      const normalized = this.normalize(parsed);

      // Guardar apenas depois da validação.
      return this.save(normalized);

    } catch (error) {
      console.warn(
        "ECHO//404: importação falhou.",
        error
      );

      return false;
    }
  },

  // ==========================================
  // 19. APAGAR PROGRESSO
  // ==========================================

  resetProgress() {
    try {
      localStorage.removeItem(this.key);

      console.log(
        "ECHO//404: progresso reiniciado."
      );

      return true;

    } catch (error) {
      console.warn(
        "ECHO//404: não foi possível apagar o progresso.",
        error
      );

      return false;
    }
  },

  // ==========================================
  // 20. DIAGNÓSTICO
  // ==========================================

  debug() {
    console.log(
      "========== ECHO//404 STORAGE =========="
    );

    console.table(this.getProgress());
    console.table(this.getStats());

    console.log(
      "Versão:",
      this.version
    );

    console.log(
      "Dados completos:",
      this.load()
    );
  }
};

// ==========================================
// 21. INICIALIZAÇÃO
// ==========================================

console.log(
  "=================================="
);

console.log(
  "ECHO//404 — PARADOX EVOLUTION"
);

console.log(
  "STORAGE SYSTEM v0.6.1 READY"
);

console.log(
  "DESKTOP + MOBILE // LOCALSTORAGE"
);

console.log(
  "=================================="
);
