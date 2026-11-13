
"use strict";

/*
========================================================
 ECHO//404 — PARADOX EVOLUTION
 VERSION 3.0 — PERSISTENT MEMORY
 FILE: storage.js

 PROGRESS / LEVEL UNLOCKS / MEDALS
 STATISTICS / OPERATOR SELECTION
 SOUND / MOBILE CONTROLS
 INTRO / TUTORIAL
 EXPORT / IMPORT / LEGACY MIGRATION

 CREATED & DEVELOPED BY MANUEL SAMPAIO01
 © 2026 MANUEL SAMPAIO01
========================================================
*/

const GameStorage = (() => {

  // ==================================================
  // 01. CONFIGURATION
  // ==================================================

  const VERSION = "3.0";
  const TOTAL_LEVELS = 10;

  // Preserve existing save keys.
  const STORAGE_KEY = "echo404_paradox_v06";
  const MEDALS_KEY = "echo404_awakening_medals_v07";

  const INTRO_KEY = "echo404_v08_intro_seen";
  const TUTORIAL_KEY = "echo404_v08_tutorial_done";

  const LEGACY_INTRO_KEY = "echo404_v07_intro_seen";
  const LEGACY_TUTORIAL_KEY = "echo404_v07_tutorial_done";
  const FALLBACK_PROGRESS_KEY = "echo404_v08_progress";

  const OPERATOR_KEY = "echo404_operator";

  const OPERATORS = Object.freeze([
    "AXIOM",
    "NYRA",
    "KAI-7"
  ]);

  const MEDAL_RANK = Object.freeze({
    bronze: 1,
    silver: 2,
    gold: 3
  });

  const STAT_KEYS = Object.freeze([
    "attempts",
    "deaths",
    "shifts",
    "wins",
    "totalScore",
    "bestOverallScore",
    "totalCycles",
    "portalsUsed",
    "lasersHit",
    "platformDeaths",
    "echoTrapDeaths"
  ]);

  // ==================================================
  // 02. BASIC HELPERS
  // ==================================================

  function safeNumber(value, fallback = 0) {
    if (value === null || value === undefined || value === "") {
      return fallback;
    }

    const number = Number(value);

    return Number.isFinite(number)
      ? number
      : fallback;
  }

  function safeInteger(value, fallback = 0) {
    return Math.trunc(safeNumber(value, fallback));
  }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function isValidDate(value) {
    return (
      typeof value === "string" &&
      !Number.isNaN(Date.parse(value))
    );
  }

  function nowISO() {
    return new Date().toISOString();
  }

  function readRaw(key) {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.warn("ECHO//404: Storage read failed", key, error);
      return null;
    }
  }

  function writeRaw(key, value) {
    try {
      localStorage.setItem(key, String(value));
      return true;
    } catch (error) {
      console.warn("ECHO//404: Storage write failed", key, error);
      return false;
    }
  }

  function removeRaw(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.warn("ECHO//404: Storage removal failed", key, error);
      return false;
    }
  }

  function readJSON(key, fallback = null) {
    const raw = readRaw(key);

    if (raw === null) return fallback;

    try {
      return JSON.parse(raw);
    } catch (error) {
      console.warn("ECHO//404: Invalid saved JSON", key, error);
      return fallback;
    }
  }

  function writeJSON(key, value) {
    try {
      return writeRaw(key, JSON.stringify(value));
    } catch (error) {
      console.warn("ECHO//404: JSON serialization failed", error);
      return false;
    }
  }

  function readFlag(key) {
    return readRaw(key) === "true";
  }

  function writeFlag(key, value = true) {
    return writeRaw(key, Boolean(value));
  }

  function isRecord(value) {
    return (
      value !== null &&
      typeof value === "object" &&
      !Array.isArray(value)
    );
  }

  // ==================================================
  // 03. DEFAULT SAVE STRUCTURE
  // ==================================================

  function defaults() {
    const timestamp = nowISO();

    return {
      version: VERSION,
      createdAt: timestamp,
      updatedAt: timestamp,

      unlocked: 1,
      completed: [],
      bestScores: {},
      medals: {},

      stats: {
        attempts: 0,
        deaths: 0,
        shifts: 0,
        wins: 0,

        totalScore: 0,
        bestOverallScore: 0,

        totalCycles: 0,
        portalsUsed: 0,

        lasersHit: 0,
        platformDeaths: 0,
        echoTrapDeaths: 0,

        levelsCompleted: 0,
        lastPlayedLevel: 1,
        lastPlayedAt: null
      },

      settings: {
        sound: true,
        volume: 0.7,
        controlMode: "dpad",
        operator: "AXIOM"
      }
    };
  }

  // ==================================================
  // 04. LEVEL INDEX HELPERS
  // ==================================================

  // Public API uses zero-based level indexes.
  // Level 1 = 0, Level 10 = 9.

  function validIndex(index) {
    return (
      Number.isInteger(index) &&
      index >= 0 &&
      index < TOTAL_LEVELS
    );
  }

  function levelKey(index) {
    return String(index);
  }

  function normalizeLevelIndex(value) {
    const index = safeInteger(value, -1);

    return validIndex(index)
      ? index
      : null;
  }

  // ==================================================
  // 05. OPERATOR NORMALIZATION
  // ==================================================

  function normalizeOperator(value) {
    if (typeof value !== "string") {
      return "AXIOM";
    }

    const name = value.trim().toUpperCase();

    if (name === "KAI7" || name === "KAI_7") {
      return "KAI-7";
    }

    return OPERATORS.includes(name)
      ? name
      : "AXIOM";
  }

  // ==================================================
  // 06. MEDAL NORMALIZATION
  // ==================================================

  function normalizeMedal(value) {
    let medal = value;

    if (isRecord(medal)) {
      medal =
        medal.medal ??
        medal.type ??
        medal.rank ??
        "";
    }

    if (typeof medal !== "string") {
      return null;
    }

    const normalized = medal.trim().toLowerCase();

    return Object.prototype.hasOwnProperty.call(
      MEDAL_RANK,
      normalized
    )
      ? normalized
      : null;
  }

  function normalizeMedals(source) {
    const result = {};

    if (!source || typeof source !== "object") {
      return result;
    }

    const entries = Array.isArray(source)
      ? source.map((value, index) => [String(index), value])
      : Object.entries(source);

    for (const [key, value] of entries) {
      const index = Number(key);

      if (!validIndex(index)) continue;

      const medal = normalizeMedal(value);
      if (!medal) continue;

      const storageKey = levelKey(index);
      const previous = result[storageKey];

      if (
        !previous ||
        MEDAL_RANK[medal] > MEDAL_RANK[previous]
      ) {
        result[storageKey] = medal;
      }
    }

    return result;
  }

  function mergeMedals(...sources) {
    const merged = {};

    for (const source of sources) {
      const normalized = normalizeMedals(source);

      for (const [key, medal] of Object.entries(normalized)) {
        const previous = merged[key];

        if (
          !previous ||
          MEDAL_RANK[medal] > MEDAL_RANK[previous]
        ) {
          merged[key] = medal;
        }
      }
    }

    return merged;
  }

  // ==================================================
  // 07. COMPLETED LEVEL NORMALIZATION
  // ==================================================

  function normalizeCompleted(source) {
    const completed = new Set();

    if (Array.isArray(source.completed)) {
      const values = source.completed;

      // Support boolean arrays from older versions.
      const booleanArray =
        values.length > 0 &&
        values.every(value => typeof value === "boolean");

      if (booleanArray) {
        values.forEach((done, index) => {
          if (done && validIndex(index)) {
            completed.add(index);
          }
        });
      } else {
        // Original v0.8 representation: [0, 1, 2].
        values.forEach(value => {
          const index = normalizeLevelIndex(value);

          if (index !== null) {
            completed.add(index);
          }
        });
      }
    }

    // Legacy representation: [1, 2, 3].
    if (Array.isArray(source.completedLevels)) {
      source.completedLevels.forEach(value => {
        const levelNumber = safeInteger(value, 0);
        const index = levelNumber - 1;

        if (validIndex(index)) {
          completed.add(index);
        }
      });
    }

    return [...completed].sort((a, b) => a - b);
  }

  // ==================================================
  // 08. BEST SCORE NORMALIZATION
  // ==================================================

  function normalizeBestScores(source) {
    const result = {};

    const sources = [
      source.bestScores,
      source.best,
      source.scores
    ];

    for (const candidate of sources) {
      if (!candidate || typeof candidate !== "object") {
        continue;
      }

      for (const [key, value] of Object.entries(candidate)) {
        const index = Number(key);

        if (!validIndex(index)) continue;

        const score = Math.max(0, safeInteger(value));
        const storageKey = levelKey(index);

        result[storageKey] = Math.max(
          result[storageKey] || 0,
          score
        );
      }
    }

    return result;
  }

  // ==================================================
  // 09. SAVE NORMALIZATION
  // ==================================================

  function normalize(source, options = {}) {
    const base = defaults();

    if (!isRecord(source)) {
      return base;
    }

    const stats = isRecord(source.stats)
      ? source.stats
      : {};

    const settings = isRecord(source.settings)
      ? source.settings
      : {};

    const completed = normalizeCompleted(source);
    const bestScores = normalizeBestScores(source);

    const medals = mergeMedals(
      source.medals,
      options.mergeStoredMedals === false
        ? null
        : readJSON(MEDALS_KEY, {})
    );

    const sourceUnlocked = clamp(
      safeInteger(
        source.unlocked ?? source.unlockedLevels,
        1
      ),
      1,
      TOTAL_LEVELS
    );

    const nextUnlocked = completed.length
      ? Math.max(...completed) + 2
      : 1;

    const unlocked = clamp(
      Math.max(sourceUnlocked, nextUnlocked),
      1,
      TOTAL_LEVELS
    );

    const result = {
      version: VERSION,

      createdAt: isValidDate(source.createdAt)
        ? source.createdAt
        : base.createdAt,

      updatedAt: isValidDate(source.updatedAt)
        ? source.updatedAt
        : base.updatedAt,

      unlocked,
      completed,
      bestScores,
      medals,

      stats: { ...base.stats },
      settings: { ...base.settings }
    };

    for (const key of STAT_KEYS) {
      result.stats[key] = Math.max(
        0,
        safeInteger(stats[key], 0)
      );
    }

    result.stats.levelsCompleted = completed.length;

    result.stats.lastPlayedLevel = clamp(
      safeInteger(stats.lastPlayedLevel, 1),
      1,
      TOTAL_LEVELS
    );

    result.stats.lastPlayedAt = isValidDate(
      stats.lastPlayedAt
    )
      ? stats.lastPlayedAt
      : null;

    result.settings.sound =
      typeof settings.sound === "boolean"
        ? settings.sound
        : typeof source.sound === "boolean"
          ? source.sound
          : true;

    result.settings.volume = clamp(
      safeNumber(settings.volume, 0.7),
      0,
      1
    );

    result.settings.controlMode =
      settings.controlMode === "joystick"
        ? "joystick"
        : "dpad";

    const savedOperator = readRaw(OPERATOR_KEY);

    result.settings.operator = normalizeOperator(
      savedOperator ||
      settings.operator ||
      source.operator ||
      "AXIOM"
    );

    return result;
  }

  // ==================================================
  // 10. LOAD / SAVE / MUTATE
  // ==================================================

  function load() {
    let raw = readJSON(STORAGE_KEY, null);

    // Only use fallback when primary save is absent.
    if (!isRecord(raw)) {
      const fallback = readJSON(
        FALLBACK_PROGRESS_KEY,
        null
      );

      if (isRecord(fallback)) {
        raw = isRecord(fallback.progress)
          ? fallback.progress
          : fallback;
      }
    }

    const data = normalize(raw);

    data.medals = mergeMedals(
      data.medals,
      readJSON(MEDALS_KEY, {})
    );

    return data;
  }

  function save(input) {
    const data = normalize(input);

    data.version = VERSION;
    data.updatedAt = nowISO();

    data.medals = mergeMedals(
      data.medals,
      readJSON(MEDALS_KEY, {})
    );

    const mainSaved = writeJSON(STORAGE_KEY, data);
    const medalsSaved = writeJSON(
      MEDALS_KEY,
      data.medals
    );

    if (mainSaved) {
      writeRaw(OPERATOR_KEY, data.settings.operator);
    }

    return mainSaved && medalsSaved;
  }

  function mutate(callback) {
    const data = load();

    callback(data);

    return save(data);
  }

  // ==================================================
  // 11. LEVEL PROGRESS
  // ==================================================

  function isUnlocked(index) {
    if (!validIndex(index)) return false;

    return index < load().unlocked;
  }

  function isCompleted(index) {
    if (!validIndex(index)) return false;

    return load().completed.includes(index);
  }

  function getBestScore(index) {
    if (!validIndex(index)) return 0;

    return load().bestScores[levelKey(index)] || 0;
  }

  function win(index, score = 0) {
    if (!validIndex(index)) return false;

    const safeScore = Math.max(
      0,
      safeInteger(score)
    );

    return mutate(data => {
      if (!data.completed.includes(index)) {
        data.completed.push(index);
        data.completed.sort((a, b) => a - b);
      }

      data.unlocked = Math.max(
        data.unlocked,
        Math.min(TOTAL_LEVELS, index + 2)
      );

      const key = levelKey(index);

      data.bestScores[key] = Math.max(
        data.bestScores[key] || 0,
        safeScore
      );

      data.stats.wins++;
      data.stats.totalScore += safeScore;

      data.stats.bestOverallScore = Math.max(
        data.stats.bestOverallScore,
        safeScore
      );

      data.stats.levelsCompleted = data.completed.length;
      data.stats.lastPlayedLevel = index + 1;
      data.stats.lastPlayedAt = nowISO();
    });
  }

  // ==================================================
  // 12. MEDALS
  // ==================================================

  function saveMedal(index, medal) {
    if (!validIndex(index)) return false;

    const normalized = normalizeMedal(medal);
    if (!normalized) return false;

    return mutate(data => {
      const key = levelKey(index);
      const previous = data.medals[key];

      if (
        !previous ||
        MEDAL_RANK[normalized] > MEDAL_RANK[previous]
      ) {
        data.medals[key] = normalized;
      }
    });
  }

  function getMedal(index) {
    if (!validIndex(index)) return null;

    return load().medals[levelKey(index)] || null;
  }

  function getMedals() {
    return { ...load().medals };
  }

  function getMedalSummary() {
    const medals = Object.values(getMedals());

    const summary = {
      gold: 0,
      silver: 0,
      bronze: 0,
      total: 0
    };

    for (const medal of medals) {
      if (Object.prototype.hasOwnProperty.call(summary, medal)) {
        summary[medal]++;
        summary.total++;
      }
    }

    return summary;
  }

  // ==================================================
  // 13. STATISTICS
  // ==================================================

  function registerAttempt(index = null) {
    return mutate(data => {
      data.stats.attempts++;

      if (validIndex(index)) {
        data.stats.lastPlayedLevel = index + 1;
      }

      data.stats.lastPlayedAt = nowISO();
    });
  }

  function registerDeath(reason = null) {
    return mutate(data => {
      data.stats.deaths++;

      if (reason === "laser") {
        data.stats.lasersHit++;
      } else if (reason === "platform") {
        data.stats.platformDeaths++;
      } else if (reason === "echo-trap") {
        data.stats.echoTrapDeaths++;
      }

      data.stats.lastPlayedAt = nowISO();
    });
  }

  function registerShift() {
    return mutate(data => {
      data.stats.shifts++;
      data.stats.lastPlayedAt = nowISO();
    });
  }

  function registerCycle() {
    return mutate(data => {
      data.stats.totalCycles++;
      data.stats.lastPlayedAt = nowISO();
    });
  }

  function registerPortal() {
    return mutate(data => {
      data.stats.portalsUsed++;
      data.stats.lastPlayedAt = nowISO();
    });
  }

  // ==================================================
  // 14. SETTINGS
  // ==================================================

  function setSound(enabled) {
    return mutate(data => {
      data.settings.sound = Boolean(enabled);
    });
  }

  function getSound() {
    return load().settings.sound;
  }

  function setVolume(value) {
    return mutate(data => {
      data.settings.volume = clamp(
        safeNumber(value, 0.7),
        0,
        1
      );
    });
  }

  function getVolume() {
    return load().settings.volume;
  }

  function setControlMode(mode) {
    const normalized =
      mode === "joystick" ? "joystick" : "dpad";

    return mutate(data => {
      data.settings.controlMode = normalized;
    });
  }

  function getControlMode() {
    return load().settings.controlMode;
  }

  // ==================================================
  // 15. OPERATOR SELECTION
  // ==================================================

  function getOperator() {
    const stored = readRaw(OPERATOR_KEY);

    if (stored) {
      return normalizeOperator(stored);
    }

    return load().settings.operator;
  }

  function setOperator(operator) {
    if (typeof operator !== "string") {
      return false;
    }

    const normalized = normalizeOperator(operator);

    const valid =
      OPERATORS.includes(operator.trim().toUpperCase()) ||
      ["KAI7", "KAI_7"].includes(
        operator.trim().toUpperCase()
      );

    if (!valid) return false;

    const saved = mutate(data => {
      data.settings.operator = normalized;
    });

    if (saved && typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("echo404:operatorselected", {
          detail: {
            operator: normalized,
            id: normalized
          }
        })
      );
    }

    return saved;
  }

  function getOperators() {
    return [...OPERATORS];
  }

  // ==================================================
  // 16. INTRO / TUTORIAL
  // ==================================================

  function hasSeenIntro() {
    return (
      readFlag(INTRO_KEY) ||
      readFlag(LEGACY_INTRO_KEY)
    );
  }

  function setIntroSeen(value = true) {
    return writeFlag(INTRO_KEY, value);
  }

  function hasCompletedTutorial() {
    return (
      readFlag(TUTORIAL_KEY) ||
      readFlag(LEGACY_TUTORIAL_KEY)
    );
  }

  function setTutorialDone(value = true) {
    return writeFlag(TUTORIAL_KEY, value);
  }

  // ==================================================
  // 17. PROGRESS SUMMARY
  // ==================================================

  function getProgress() {
    const data = load();

    return {
      version: VERSION,
      unlocked: data.unlocked,
      completed: [...data.completed],
      completedCount: data.completed.length,
      totalLevels: TOTAL_LEVELS,

      percentage: Math.round(
        data.completed.length / TOTAL_LEVELS * 100
      ),

      medals: getMedalSummary()
    };
  }

  function getStats() {
    const data = load();

    return {
      ...data.stats,
      completedLevels: data.completed.length,
      unlockedLevels: data.unlocked,
      medals: getMedalSummary(),
      version: VERSION
    };
  }

  // ==================================================
  // 18. EXPORT / IMPORT
  // ==================================================

  function exportProgress() {
    return JSON.stringify(
      {
        game: "ECHO//404",
        version: VERSION,
        exportedAt: nowISO(),
        progress: load(),
        introSeen: hasSeenIntro(),
        tutorialDone: hasCompletedTutorial(),
        operator: getOperator()
      },
      null,
      2
    );
  }

  function importProgress(input) {
    let parsed;

    try {
      parsed =
        typeof input === "string"
          ? JSON.parse(input)
          : input;
    } catch {
      return {
        success: false,
        message: "JSON inválido."
      };
    }

    if (!isRecord(parsed)) {
      return {
        success: false,
        message: "Dados inválidos."
      };
    }

    const candidate = isRecord(parsed.progress)
      ? parsed.progress
      : parsed;

    const hasProgress =
      Array.isArray(candidate.completed) ||
      Array.isArray(candidate.completedLevels) ||
      typeof candidate.unlocked === "number" ||
      typeof candidate.unlockedLevels === "number";

    if (!hasProgress) {
      return {
        success: false,
        message: "O ficheiro não contém progresso válido."
      };
    }

    const current = load();

    const imported = normalize(candidate, {
      mergeStoredMedals: false
    });

    // Preserve the best existing achievements.
    imported.medals = mergeMedals(
      current.medals,
      imported.medals
    );

    imported.unlocked = Math.max(
      current.unlocked,
      imported.unlocked
    );

    imported.completed = [
      ...new Set([
        ...current.completed,
        ...imported.completed
      ])
    ].sort((a, b) => a - b);

    for (const [key, value] of Object.entries(current.bestScores)) {
      imported.bestScores[key] = Math.max(
        imported.bestScores[key] || 0,
        value
      );
    }

    const saved = save(imported);

    if (saved && typeof parsed.introSeen === "boolean") {
      setIntroSeen(parsed.introSeen);
    }

    if (saved && typeof parsed.tutorialDone === "boolean") {
      setTutorialDone(parsed.tutorialDone);
    }

    if (saved && typeof parsed.operator === "string") {
      setOperator(parsed.operator);
    }

    return {
      success: saved,
      message: saved
        ? "Progresso importado com sucesso."
        : "Não foi possível guardar o progresso."
    };
  }

  // ==================================================
  // 19. RESET PROGRESS
  // ==================================================

  function resetProgress(options = {}) {
    const preserveSettings =
      options.preserveSettings !== false;

    const preserveIntro =
      options.preserveIntro !== false;

    const current = load();
    const fresh = defaults();

    if (preserveSettings) {
      fresh.settings = {
        ...current.settings
      };
    }

    // Clear medals before saving so they cannot
    // be merged back into the fresh progress.
    const medalsRemoved = removeRaw(MEDALS_KEY);
    const fallbackRemoved = removeRaw(FALLBACK_PROGRESS_KEY);

    if (!preserveIntro) {
      removeRaw(INTRO_KEY);
      removeRaw(TUTORIAL_KEY);
      removeRaw(LEGACY_INTRO_KEY);
      removeRaw(LEGACY_TUTORIAL_KEY);
    }

    if (!preserveSettings) {
      removeRaw(OPERATOR_KEY);
    }

    const saved = save(fresh);

    return saved && medalsRemoved && fallbackRemoved;
  }

  // ==================================================
  // 20. DEBUG
  // ==================================================

  function debug() {
    const data = load();

    console.group("ECHO//404 STORAGE v3.0");
    console.log("Progress:", getProgress());
    console.log("Statistics:", getStats());
    console.log("Medals:", getMedals());
    console.log("Settings:", data.settings);
    console.log("Operator:", getOperator());
    console.log("Raw save:", data);
    console.groupEnd();

    return data;
  }

  // ==================================================
  // 21. PUBLIC API
  // ==================================================

  return Object.freeze({
    version: VERSION,

    STORAGE_KEY,
    MEDALS_KEY,
    OPERATOR_KEY,

    defaults,
    safeNumber,
    safeInteger,
    isValidDate,
    normalize,

    load,
    save,
    win,

    isUnlocked,
    isCompleted,
    getBestScore,

    registerAttempt,
    registerDeath,
    registerShift,
    registerCycle,
    registerPortal,

    saveMedal,
    getMedal,
    getMedals,
    getMedalSummary,

    setSound,
    getSound,
    setVolume,
    getVolume,
    setControlMode,
    getControlMode,

    getOperator,
    setOperator,
    getOperators,

    hasSeenIntro,
    setIntroSeen,
    hasCompletedTutorial,
    setTutorialDone,

    getProgress,
    getStats,

    exportProgress,
    importProgress,
    resetProgress,

    debug
  });

})();

if (typeof window !== "undefined") {
  window.GameStorage = GameStorage;
}

console.log("==================================");
console.log("ECHO//404 — PARADOX EVOLUTION");
console.log("STORAGE VERSION 3.0");
console.log("PERSISTENT PROGRESS READY");
console.log("10 LEVELS / MEDALS / STATISTICS");
console.log("OPERATOR SELECTION ENABLED");
console.log("LEGACY SAVE COMPATIBILITY");
console.log("CREATED & DEVELOPED BY MANUEL SAMPAIO01");
console.log("© 2026 MANUEL SAMPAIO01");
console.log("==================================");
