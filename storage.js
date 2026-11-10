
"use strict";

/*
================================================
 ECHO//404 — PARADOX EVOLUTION
 VERSION: 0.6
 FILE: storage.js

 SISTEMA DE PROGRESSO E RECORDES
================================================
*/

const GameStorage = {

  // ==========================================
  // 1. CHAVE DO ARMAZENAMENTO
  // ==========================================

  key: "echo404_paradox_v06",

  totalLevels: 10,

  // ==========================================
  // 2. DADOS INICIAIS
  // ==========================================

  defaults() {
    return {
      version: "0.6",

      // Nível máximo desbloqueado
      unlocked: 1,

      // Melhores pontuações de cada nível
      bestScores: Array(this.totalLevels).fill(0),

      // Níveis concluídos
      completed: Array(this.totalLevels).fill(false),

      // Preferência de áudio
      sound: true,

      // Estatísticas gerais
      stats: {
        totalWins: 0,
        totalAttempts: 0,
        totalDeaths: 0,
        totalShifts: 0,
        totalScore: 0
      },

      // Datas do progresso
      createdAt: new Date().toISOString(),
      updatedAt: null
    };
  },

  // ==========================================
  // 3. CARREGAR PROGRESSO
  // ==========================================

  load() {
    const fallback = this.defaults();

    try {
      const raw = localStorage.getItem(this.key);

      if (!raw) {
        return fallback;
      }

      const saved = JSON.parse(raw);

      if (!saved || typeof saved !== "object") {
        return fallback;
      }

      const scores = Array.isArray(saved.bestScores)
        ? saved.bestScores
        : [];

      const completed = Array.isArray(saved.completed)
        ? saved.completed
        : [];

      const stats = saved.stats || {};

      return {
        version: "0.6",

        unlocked: Math.max(
          1,
          Math.min(
            this.totalLevels,
            Math.floor(Number(saved.unlocked) || 1)
          )
        ),

        bestScores: Array.from(
          { length: this.totalLevels },
          (_, index) => {
            return Math.max(
              0,
              Number(scores[index]) || 0
            );
          }
        ),

        completed: Array.from(
          { length: this.totalLevels },
          (_, index) => completed[index] === true
        ),

        sound: saved.sound !== false,

        stats: {
          totalWins: Math.max(
            0, Number(stats.totalWins) || 0
          ),

          totalAttempts: Math.max(
            0, Number(stats.totalAttempts) || 0
          ),

          totalDeaths: Math.max(
            0, Number(stats.totalDeaths) || 0
          ),

          totalShifts: Math.max(
            0, Number(stats.totalShifts) || 0
          ),

          totalScore: Math.max(
            0, Number(stats.totalScore) || 0
          )
        },

        createdAt:
          typeof saved.createdAt === "string"
            ? saved.createdAt
            : fallback.createdAt,

        updatedAt: saved.updatedAt || null
      };

    } catch (error) {
      console.warn(
        "ECHO//404: erro ao carregar progresso.",
        error
      );

      return fallback;
    }
  },

  // ==========================================
  // 4. GUARDAR PROGRESSO
  // ==========================================

  save(data) {
    try {
      const payload = {
        ...data,
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
  // 5. REGISTAR VITÓRIA
  // ==========================================

  win(levelIndex, score) {
    const data = this.load();

    if (
      !Number.isInteger(levelIndex) ||
      levelIndex < 0 ||
      levelIndex >= this.totalLevels
    ) {
      console.warn("Nível inválido:", levelIndex);
      return data;
    }

    const finalScore = Math.max(
      0,
      Math.floor(Number(score) || 0)
    );

    // Marcar nível como concluído
    data.completed[levelIndex] = true;

    // Actualizar recorde, se for superior
    data.bestScores[levelIndex] = Math.max(
      data.bestScores[levelIndex],
      finalScore
    );

    // Desbloquear o nível seguinte
    data.unlocked = Math.max(
      data.unlocked,
      Math.min(
        this.totalLevels,
        levelIndex + 2
      )
    );

    // Actualizar estatísticas
    data.stats.totalWins += 1;
    data.stats.totalScore += finalScore;

    this.save(data);

    return data;
  },

  // ==========================================
  // 6. CONSULTAR RECORDE
  // ==========================================

  getBestScore(levelIndex) {
    const data = this.load();

    if (
      !Number.isInteger(levelIndex) ||
      levelIndex < 0 ||
      levelIndex >= this.totalLevels
    ) {
      return 0;
    }

    return data.bestScores[levelIndex];
  },

  // ==========================================
  // 7. VERIFICAR NÍVEL DESBLOQUEADO
  // ==========================================

  isUnlocked(levelIndex) {
    const data = this.load();

    return (
      Number.isInteger(levelIndex) &&
      levelIndex >= 0 &&
      levelIndex < data.unlocked
    );
  },

  // ==========================================
  // 8. VERIFICAR NÍVEL CONCLUÍDO
  // ==========================================

  isCompleted(levelIndex) {
    const data = this.load();

    return data.completed[levelIndex] === true;
  },

  // ==========================================
  // 9. REGISTAR TENTATIVA
  // ==========================================

  registerAttempt() {
    const data = this.load();

    data.stats.totalAttempts += 1;

    this.save(data);
  },

  // ==========================================
  // 10. REGISTAR MORTE
  // ==========================================

  registerDeath() {
    const data = this.load();

    data.stats.totalDeaths += 1;

    this.save(data);
  },

  // ==========================================
  // 11. REGISTAR PARADOX SHIFT
  // ==========================================

  registerShift() {
    const data = this.load();

    data.stats.totalShifts += 1;

    this.save(data);
  },

  // ==========================================
  // 12. CONFIGURAÇÕES DE SOM
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
  // 13. PROGRESSO GERAL
  // ==========================================

  getProgress() {
    const data = this.load();

    const completedCount =
      data.completed.filter(Boolean).length;

    const percentage = Math.round(
      (completedCount / this.totalLevels) * 100
    );

    const totalBestScore = data.bestScores.reduce(
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
  // 14. ESTATÍSTICAS
  // ==========================================

  getStats() {
    return this.load().stats;
  },

  // ==========================================
  // 15. EXPORTAR PROGRESSO
  // ==========================================

  exportProgress() {
    const data = this.load();

    return JSON.stringify(data, null, 2);
  },

  // ==========================================
  // 16. IMPORTAR PROGRESSO
  // ==========================================

  importProgress(json) {
    try {
      const parsed = JSON.parse(json);

      if (
        !parsed ||
        typeof parsed !== "object" ||
        !Array.isArray(parsed.bestScores) ||
        !Array.isArray(parsed.completed)
      ) {
        return false;
      }

      // Normalizar os dados antes de guardar.
      const backup = localStorage.getItem(this.key);

      try {
        localStorage.setItem(
          this.key,
          JSON.stringify(parsed)
        );

        const normalized = this.load();

        return this.save(normalized);

      } catch (error) {
        if (backup === null) {
          localStorage.removeItem(this.key);
        } else {
          localStorage.setItem(this.key, backup);
        }

        throw error;
      }

    } catch (error) {
      console.warn(
        "ECHO//404: importação falhou.",
        error
      );

      return false;
    }
  },

  // ==========================================
  // 17. APAGAR PROGRESSO
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
        "Não foi possível apagar o progresso.",
        error
      );

      return false;
    }
  },

  // ==========================================
  // 18. DIAGNÓSTICO
  // ==========================================

  debug() {
    console.log(
      "========== ECHO//404 STORAGE =========="
    );

    console.table(this.getProgress());
    console.table(this.getStats());

    console.log(
      "Dados completos:",
      this.load()
    );
  }
};

// ==========================================
// 19. INICIALIZAÇÃO
// ==========================================

console.log(
  "ECHO//404 STORAGE SYSTEM v0.6 READY"
);
