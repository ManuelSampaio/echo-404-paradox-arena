
"use strict";

/*
==================================================
 ECHO//404 — PARADOX EVOLUTION
 VERSION 0.7 — THE AWAKENING
 FILE: storage.js

 SAVE SYSTEM + PROGRESS + MEDALS
 LOCALSTORAGE / DESKTOP / MOBILE

 CREATED & DEVELOPED BY
 MANUEL SAMPAIO01

 © 2026 MANUEL SAMPAIO01
==================================================
*/

const GameStorage = {

  // ========================================
  // 1. CONFIGURAÇÕES
  // ========================================

  // Mantemos a chave original para
  // preservar os dados da v0.6.1.
  key: "echo404_paradox_v06",

  version: "0.7",

  totalLevels: 10,

  // Compatibilidade com game.js v0.7.
  medalKey: "echo404_awakening_medals_v07",

  // Compatibilidade com awakening.js.
  introKey: "echo404_v07_intro_seen",
  tutorialKey: "echo404_v07_tutorial_done",

  medalRanks: {
    bronze: 1,
    silver: 2,
    gold: 3
  },

  // ========================================
  // 2. DADOS INICIAIS
  // ========================================

  defaults() {
    return {
      version: this.version,

      unlocked: 1,

      bestScores:
        Array(this.totalLevels).fill(0),

      completed:
        Array(this.totalLevels).fill(false),

      sound: true,

      medals: {},

      awakening: {
        introSeen: false,
        tutorialDone: false
      },

      stats: {
        totalWins: 0,
        totalAttempts: 0,
        totalDeaths: 0,
        totalShifts: 0,
        totalScore: 0
      },

      createdAt: new Date().toISOString(),
      updatedAt: null
    };
  },

  // ========================================
  // 3. UTILITÁRIOS
  // ========================================

  safeNumber(value, fallback = 0) {
    const number = Number(value);

    return Number.isFinite(number)
      ? Math.max(0, number)
      : fallback;
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

  validLevel(index) {
    return (
      Number.isInteger(index) &&
      index >= 0 &&
      index < this.totalLevels
    );
  },

  safeRead(key) {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.warn(
        "ECHO//404: leitura indisponível.",
        error
      );
      return null;
    }
  },

  safeWrite(key, value) {
    try {
      localStorage.setItem(key, value);
      return true;
    } catch (error) {
      console.warn(
        "ECHO//404: gravação indisponível.",
        error
      );
      return false;
    }
  },

  safeRemove(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.warn(
        "ECHO//404: remoção indisponível.",
        error
      );
      return false;
    }
  },

  // ========================================
  // 4. NORMALIZAR MEDALHAS
  // ========================================

  normalizeMedals(value) {
    const result = {};

    if (
      !value ||
      typeof value !== "object" ||
      Array.isArray(value)
    ) {
      return result;
    }

    for (
      let index = 0;
      index < this.totalLevels;
      index++
    ) {
      const key = String(index);
      const medal = value[key];

      if (
        Object.prototype.hasOwnProperty.call(
          this.medalRanks,
          medal
        )
      ) {
        result[key] = medal;
      }
    }

    return result;
  },

  mergeMedals(first, second) {
    const a = this.normalizeMedals(first);
    const b = this.normalizeMedals(second);

    const merged = { ...a };

    for (const [key, medal] of Object.entries(b)) {
      const previous = merged[key];

      if (
        !previous ||
        this.medalRanks[medal] >
          this.medalRanks[previous]
      ) {
        merged[key] = medal;
      }
    }

    return merged;
  },

  // ========================================
  // 5. NORMALIZAR PROGRESSO
  // ========================================

  normalize(saved) {
    const fallback = this.defaults();

    if (
      !saved ||
      typeof saved !== "object" ||
      Array.isArray(saved)
    ) {
      return fallback;
    }

    const scores = Array.isArray(
      saved.bestScores
    ) ? saved.bestScores : [];

    const completed = Array.isArray(
      saved.completed
    ) ? saved.completed : [];

    const stats = (
      saved.stats &&
      typeof saved.stats === "object" &&
      !Array.isArray(saved.stats)
    ) ? saved.stats : {};

    const awakening = (
      saved.awakening &&
      typeof saved.awakening === "object" &&
      !Array.isArray(saved.awakening)
    ) ? saved.awakening : {};

    const normalizedScores = Array.from(
      { length: this.totalLevels },
      (_, index) =>
        this.safeInteger(scores[index])
    );

    const normalizedCompleted = Array.from(
      { length: this.totalLevels },
      (_, index) =>
        completed[index] === true
    );

    let unlocked = Math.max(
      1,
      Math.min(
        this.totalLevels,
        this.safeInteger(saved.unlocked, 1)
      )
    );

    normalizedCompleted.forEach(
      (done, index) => {
        if (done) {
          unlocked = Math.max(
            unlocked,
            Math.min(
              this.totalLevels,
              index + 2
            )
          );
        }
      }
    );

    return {
      version: this.version,

      unlocked,

      bestScores: normalizedScores,
      completed: normalizedCompleted,

      sound: saved.sound !== false,

      medals:
        this.normalizeMedals(saved.medals),

      awakening: {
        introSeen:
          awakening.introSeen === true,

        tutorialDone:
          awakening.tutorialDone === true
      },

      stats: {
        totalWins:
          this.safeInteger(stats.totalWins),

        totalAttempts:
          this.safeInteger(stats.totalAttempts),

        totalDeaths:
          this.safeInteger(stats.totalDeaths),

        totalShifts:
          this.safeInteger(stats.totalShifts),

        totalScore:
          this.safeInteger(stats.totalScore)
      },

      createdAt:
        this.isValidDate(saved.createdAt)
          ? saved.createdAt
          : fallback.createdAt,

      updatedAt:
        this.isValidDate(saved.updatedAt)
          ? saved.updatedAt
          : null
    };
  },

  // ========================================
  // 6. CARREGAR PROGRESSO
  // ========================================

  load() {
    try {
      const raw = this.safeRead(this.key);

      const saved = raw
        ? JSON.parse(raw)
        : this.defaults();

      const data = this.normalize(saved);

      // Reúne medalhas guardadas pelo
      // game.js v0.7 e pelo storage.js.
      const externalMedalsRaw =
        this.safeRead(this.medalKey);

      if (externalMedalsRaw) {
        try {
          data.medals = this.mergeMedals(
            data.medals,
            JSON.parse(externalMedalsRaw)
          );
        } catch (error) {
          console.warn(
            "ECHO//404: medalhas inválidas.",
            error
          );
        }
      }

      // Reconhece as preferências do
      // awakening.js, se existirem.
      const introRaw =
        this.safeRead(this.introKey);

      const tutorialRaw =
        this.safeRead(this.tutorialKey);

      if (introRaw === "true") {
        data.awakening.introSeen = true;
      }

      if (tutorialRaw === "true") {
        data.awakening.tutorialDone = true;
      }

      return data;

    } catch (error) {
      console.warn(
        "ECHO//404: erro ao carregar progresso.",
        error
      );

      return this.defaults();
    }
  },

  // ========================================
  // 7. GUARDAR PROGRESSO
  // ========================================

  save(data) {
    const normalized = this.normalize(data);

    const payload = {
      ...normalized,
      version: this.version,
      updatedAt: new Date().toISOString()
    };

    const success = this.safeWrite(
      this.key,
      JSON.stringify(payload)
    );

    if (!success) {
      return false;
    }

    // Mantém as chaves utilizadas
    // pelos outros ficheiros.
    this.safeWrite(
      this.medalKey,
      JSON.stringify(payload.medals)
    );

    this.safeWrite(
      this.introKey,
      String(payload.awakening.introSeen)
    );

    this.safeWrite(
      this.tutorialKey,
      String(payload.awakening.tutorialDone)
    );

    return true;
  },

  // ========================================
  // 8. REGISTAR VITÓRIA
  // ========================================

  win(levelIndex, score) {
    const data = this.load();

    if (!this.validLevel(levelIndex)) {
      console.warn(
        "ECHO//404: nível inválido.",
        levelIndex
      );

      return data;
    }

    const finalScore =
      this.safeInteger(score);

    data.completed[levelIndex] = true;

    data.bestScores[levelIndex] = Math.max(
      data.bestScores[levelIndex],
      finalScore
    );

    data.unlocked = Math.max(
      data.unlocked,
      Math.min(
        this.totalLevels,
        levelIndex + 2
      )
    );

    data.stats.totalWins += 1;
    data.stats.totalScore += finalScore;

    this.save(data);

    return data;
  },

  // ========================================
  // 9. RECORDES E DESBLOQUEIOS
  // ========================================

  getBestScore(levelIndex) {
    if (!this.validLevel(levelIndex)) {
      return 0;
    }

    return this.load()
      .bestScores[levelIndex];
  },

  isUnlocked(levelIndex) {
    if (!this.validLevel(levelIndex)) {
      return false;
    }

    return levelIndex <
      this.load().unlocked;
  },

  isCompleted(levelIndex) {
    if (!this.validLevel(levelIndex)) {
      return false;
    }

    return this.load()
      .completed[levelIndex] === true;
  },

  // ========================================
  // 10. ESTATÍSTICAS
  // ========================================

  registerAttempt() {
    const data = this.load();
    data.stats.totalAttempts += 1;
    return this.save(data);
  },

  registerDeath() {
    const data = this.load();
    data.stats.totalDeaths += 1;
    return this.save(data);
  },

  registerShift() {
    const data = this.load();
    data.stats.totalShifts += 1;
    return this.save(data);
  },

  getStats() {
    return this.load().stats;
  },

  // ========================================
  // 11. CONFIGURAÇÕES DE SOM
  // ========================================

  setSound(enabled) {
    const data = this.load();

    data.sound = Boolean(enabled);

    this.save(data);

    return data.sound;
  },

  getSound() {
    return this.load().sound;
  },

  // ========================================
  // 12. GUARDAR MEDALHA
  // ========================================

  saveMedal(levelIndex, medal) {
    if (
      !this.validLevel(levelIndex) ||
      !Object.prototype.hasOwnProperty.call(
        this.medalRanks,
        medal
      )
    ) {
      return false;
    }

    const data = this.load();
    const key = String(levelIndex);
    const previous = data.medals[key];

    if (
      !previous ||
      this.medalRanks[medal] >
        this.medalRanks[previous]
    ) {
      data.medals[key] = medal;
    }

    return this.save(data);
  },

  getMedal(levelIndex) {
    if (!this.validLevel(levelIndex)) {
      return null;
    }

    return this.load()
      .medals[String(levelIndex)] || null;
  },

  getMedals() {
    return {
      ...this.load().medals
    };
  },

  getMedalSummary() {
    const medals = Object.values(
      this.getMedals()
    );

    return {
      gold: medals.filter(
        medal => medal === "gold"
      ).length,

      silver: medals.filter(
        medal => medal === "silver"
      ).length,

      bronze: medals.filter(
        medal => medal === "bronze"
      ).length
    };
  },

  // ========================================
  // 13. INTRODUÇÃO CINEMATOGRÁFICA
  // ========================================

  hasSeenIntro() {
    return this.load()
      .awakening.introSeen;
  },

  setIntroSeen(seen = true) {
    const data = this.load();

    data.awakening.introSeen =
      Boolean(seen);

    return this.save(data);
  },

  // ========================================
  // 14. TUTORIAL
  // ========================================

  hasCompletedTutorial() {
    return this.load()
      .awakening.tutorialDone;
  },

  setTutorialDone(done = true) {
    const data = this.load();

    data.awakening.tutorialDone =
      Boolean(done);

    return this.save(data);
  },

  // ========================================
  // 15. PROGRESSO GERAL
  // ========================================

  getProgress() {
    const data = this.load();

    const completedCount =
      data.completed.filter(Boolean).length;

    const percentage = Math.round(
      completedCount /
      this.totalLevels * 100
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
      totalBestScore,
      medals: this.getMedalSummary()
    };
  },

  // ========================================
  // 16. EXPORTAR PROGRESSO
  // ========================================

  exportProgress() {
    return JSON.stringify(
      this.load(),
      null,
      2
    );
  },

  // ========================================
  // 17. IMPORTAR PROGRESSO
  // ========================================

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
          "ECHO//404: progresso inválido."
        );

        return false;
      }

      if (
        parsed.bestScores.length !==
          this.totalLevels ||
        parsed.completed.length !==
          this.totalLevels
      ) {
        console.warn(
          "ECHO//404: níveis incompatíveis."
        );

        return false;
      }

      const data = this.normalize(parsed);

      return this.save(data);

    } catch (error) {
      console.warn(
        "ECHO//404: importação falhou.",
        error
      );

      return false;
    }
  },

  // ========================================
  // 18. REINICIAR PROGRESSO
  // ========================================

  resetProgress() {
    const keys = [
      this.key,
      this.medalKey,
      this.introKey,
      this.tutorialKey
    ];

    let success = true;

    keys.forEach(key => {
      if (!this.safeRemove(key)) {
        success = false;
      }
    });

    if (success) {
      console.log(
        "ECHO//404: progresso reiniciado."
      );
    }

    return success;
  },

  // ========================================
  // 19. DIAGNÓSTICO
  // ========================================

  debug() {
    console.log(
      "========== ECHO//404 STORAGE =========="
    );

    console.table(
      this.getProgress()
    );

    console.table(
      this.getStats()
    );

    console.table(
      this.getMedalSummary()
    );

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
// 20. INICIALIZAÇÃO
// ==========================================

console.log(
  "=================================="
);

console.log(
  "ECHO//404 — THE AWAKENING v0.7"
);

console.log(
  "PROGRESS + MEDALS + INTRO READY"
);

console.log(
  "LOCALSTORAGE // DESKTOP + MOBILE"
);

console.log(
  "CREATED BY MANUEL SAMPAIO01"
);

console.log(
  "=================================="
);
