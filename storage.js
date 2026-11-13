
"use strict";

/*
========================================================
 ECHO//404 — PARADOX EVOLUTION
 STORAGE SYSTEM v4.2
 FILE: storage.js

 PERSISTENT PROGRESS
 LEVEL UNLOCKS / COMPLETION / MEDALS
 STATISTICS / OPERATOR SELECTION
 SOUND / MOBILE CONTROLS
 INTRO / TUTORIAL
 EXPORT / IMPORT / LEGACY MIGRATION
 SAFE RESET / DATA VALIDATION

 CREATED & DEVELOPED BY MANUEL SAMPAIO01
 © 2026 MANUEL SAMPAIO01
========================================================
*/

const GameStorage = (() => {

  // ==================================================
  // 01. CONFIGURATION
  // ==================================================

  const VERSION = "4.2";
  const TOTAL_LEVELS = 10;

  // Keep original keys to preserve existing progress.
  const STORAGE_KEY = "echo404_paradox_v06";
  const MEDALS_KEY = "echo404_awakening_medals_v07";

  const INTRO_KEY = "echo404_v08_intro_seen";
  const TUTORIAL_KEY = "echo404_v08_tutorial_done";

  const LEGACY_INTRO_KEY = "echo404_v07_intro_seen";
  const LEGACY_TUTORIAL_KEY = "echo404_v07_tutorial_done";

  const FALLBACK_PROGRESS_KEY = "echo404_v08_progress";
  const OPERATOR_KEY = "echo404_operator";
  const VISUAL_KEY = "echo404_visual_v1";

  // Prevent deleted legacy data from being restored.
  const RESET_MARKER_KEY = "echo404_storage_reset_v42";

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
  // 02. HELPERS
  // ==================================================

  const memoryFallback = new Map();

  function safeNumber(value, fallback = 0) {
    if (
      value === null ||
      value === undefined ||
      value === "" ||
      typeof value === "boolean"
    ) {
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

  function isRecord(value) {
    return (
      value !== null &&
      typeof value === "object" &&
      !Array.isArray(value)
    );
  }

  function isValidDate(value) {
    return (
      typeof value === "string" &&
      value.trim() !== "" &&
      Number.isFinite(Date.parse(value))
    );
  }

  function nowISO() {
    return new Date().toISOString();
  }

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  // ==================================================
  // 03. SAFE STORAGE
  // ==================================================

  function readRaw(key) {
    if (memoryFallback.has(key)) {
      return memoryFallback.get(key);
    }

    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.warn(
        "[ECHO//404] Storage read unavailable:",
        key,
        error
      );

      return null;
    }
  }

  function writeRaw(key, value) {
    const text = String(value);

    try {
      localStorage.setItem(key, text);
      memoryFallback.delete(key);
      return true;
    } catch (error) {
      memoryFallback.set(key, text);

      console.warn(
        "[ECHO//404] Using temporary memory:",
        key,
        error
      );

      return false;
    }
  }

  function removeRaw(key) {
    memoryFallback.delete(key);

    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.warn(
        "[ECHO//404] Storage removal failed:",
        key,
        error
      );

      return false;
    }
  }

  function readJSON(key, fallback = null) {
    const raw = readRaw(key);

    if (raw === null) {
      return fallback;
    }

    try {
      return JSON.parse(raw);
    } catch (error) {
      console.warn(
        "[ECHO//404] Invalid JSON:",
        key,
        error
      );

      return fallback;
    }
  }

  function writeJSON(key, value) {
    try {
      return writeRaw(key, JSON.stringify(value));
    } catch (error) {
      console.warn(
        "[ECHO//404] JSON serialization failed:",
        error
      );

      return false;
    }
  }

  function readFlag(key) {
    const value = readRaw(key);

    return value === "true" || value === "1";
  }

  function writeFlag(key, value = true) {
    return writeRaw(key, Boolean(value));
  }

  // ==================================================
  // 04. DEFAULT SAVE DATA
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
  // 05. LEVEL HELPERS
  // ==================================================

  // Public level indexes are zero-based:
  // Level 1 = index 0
  // Level 10 = index 9

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
    if (
      typeof value === "boolean" ||
      value === null ||
      value === undefined ||
      value === ""
    ) {
      return null;
    }

    const number = Number(value);

    return validIndex(number)
      ? number
      : null;
  }

  function normalizeLevelNumber(value) {
    const number = safeInteger(value, -1);

    return (
      number >= 1 &&
      number <= TOTAL_LEVELS
    )
      ? number
      : null;
  }

  // ==================================================
  // 06. OPERATOR NORMALIZATION
  // ==================================================

  function normalizeOperator(value) {
    if (typeof value !== "string") {
      return "AXIOM";
    }

    const name = value
      .trim()
      .toUpperCase()
      .replace(/\s+/g, "");

    if (
      name === "KAI7" ||
      name === "KAI_7" ||
      name === "KAI-7"
    ) {
      return "KAI-7";
    }

    if (name === "NYRA") {
      return "NYRA";
    }

    return "AXIOM";
  }

  function isValidOperator(value) {
    if (typeof value !== "string") {
      return false;
    }

    const name = value
      .trim()
      .toUpperCase()
      .replace(/\s+/g, "");

    return [
      "AXIOM",
      "NYRA",
      "KAI7",
      "KAI_7",
      "KAI-7"
    ].includes(name);
  }

  function operatorId(value) {
    const normalized = normalizeOperator(value);

    if (normalized === "KAI-7") {
      return "kai7";
    }

    return normalized.toLowerCase();
  }

  // ==================================================
  // 07. MEDAL NORMALIZATION
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

    if (
      source === null ||
      typeof source !== "object"
    ) {
      return result;
    }

    const entries = Array.isArray(source)
      ? source.map((value, index) => [
          String(index),
          value
        ])
      : Object.entries(source);

    for (const [key, value] of entries) {
      const index = normalizeLevelIndex(key);

      if (index === null) {
        continue;
      }

      const medal = normalizeMedal(value);

      if (!medal) {
        continue;
      }

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
  // 08. COMPLETED LEVEL NORMALIZATION
  // ==================================================

  function normalizeCompleted(source) {
    const completed = new Set();

    if (!isRecord(source)) {
      return [];
    }

    if (Array.isArray(source.completed)) {
      const values = source.completed;

      const booleanArray =
        values.length > 0 &&
        values.every(
          value => typeof value === "boolean"
        );

      if (booleanArray) {
        values.forEach((done, index) => {
          if (done && validIndex(index)) {
            completed.add(index);
          }
        });
      } else {
        values.forEach(value => {
          const index = normalizeLevelIndex(value);

          if (index !== null) {
            completed.add(index);
          }
        });
      }
    }

    // Legacy completedLevels uses 1-based values.
    if (Array.isArray(source.completedLevels)) {
      source.completedLevels.forEach(value => {
        const level = normalizeLevelNumber(value);

        if (level !== null) {
          completed.add(level - 1);
        }
      });
    }

    return [...completed].sort((a, b) => a - b);
  }

  // ==================================================
  // 09. BEST SCORES
  // ==================================================

  function normalizeBestScores(source) {
    const result = {};

    if (!isRecord(source)) {
      return result;
    }

    const candidates = [
      source.bestScores,
      source.best,
      source.scores
    ];

    for (const candidate of candidates) {
      if (
        candidate === null ||
        typeof candidate !== "object"
      ) {
        continue;
      }

      for (const [key, value] of Object.entries(candidate)) {
        const index = normalizeLevelIndex(key);

        if (index === null) {
          continue;
        }

        const score = Math.max(
          0,
          safeInteger(value)
        );

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
  // 10. NORMALIZE SAVE
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
        source.unlocked ??
        source.unlockedLevels,
        1
      ),
      1,
      TOTAL_LEVELS
    );

    const completedUnlocked = completed.length
      ? Math.max(...completed) + 2
      : 1;

    const unlocked = clamp(
      Math.max(
        sourceUnlocked,
        completedUnlocked
      ),
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
      safeInteger(
        stats.lastPlayedLevel,
        1
      ),
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
      safeNumber(
        settings.volume,
        0.7
      ),
      0,
      1
    );

    result.settings.controlMode =
      settings.controlMode === "joystick"
        ? "joystick"
        : "dpad";

    const savedOperator =
      options.ignoreExternalOperator === true
        ? null
        : readRaw(OPERATOR_KEY);

    result.settings.operator = normalizeOperator(
      savedOperator ||
      settings.operator ||
      source.operator ||
      "AXIOM"
    );

    return result;
  }

  // ==================================================
  // 11. LOAD / SAVE
  // ==================================================

  function load() {
    let raw = readJSON(STORAGE_KEY, null);

    // Migrate legacy data only if no reset was made.
    if (
      !isRecord(raw) &&
      !readFlag(RESET_MARKER_KEY)
    ) {
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

  function save(input, options = {}) {
    if (!isRecord(input)) {
      console.warn(
        "[ECHO//404] Save rejected: invalid data."
      );

      return false;
    }

    const data = normalize(input, {
      mergeStoredMedals:
        options.replaceMedals !== true,

      ignoreExternalOperator:
        options.ignoreExternalOperator === true
    });

    data.version = VERSION;
    data.updatedAt = nowISO();

    if (options.replaceMedals !== true) {
      data.medals = mergeMedals(
        data.medals,
        readJSON(MEDALS_KEY, {})
      );
    }

    const mainSaved = writeJSON(
      STORAGE_KEY,
      data
    );

    const medalsSaved = writeJSON(
      MEDALS_KEY,
      data.medals
    );

    if (mainSaved) {
      writeRaw(
        OPERATOR_KEY,
        data.settings.operator
      );
    }

    return mainSaved && medalsSaved;
  }

  function mutate(callback) {
    if (typeof callback !== "function") {
      return false;
    }

    const data = load();

    try {
      callback(data);
    } catch (error) {
      console.error(
        "[ECHO//404] Storage mutation failed:",
        error
      );

      return false;
    }

    return save(data);
  }

  // ==================================================
  // 12. LEVEL PROGRESS
  // ==================================================

  function isUnlocked(index) {
    if (!validIndex(index)) {
      return false;
    }

    return index < load().unlocked;
  }

  function isCompleted(index) {
    if (!validIndex(index)) {
      return false;
    }

    return load().completed.includes(index);
  }

  function getBestScore(index) {
    if (!validIndex(index)) {
      return 0;
    }

    return (
      load().bestScores[levelKey(index)] || 0
    );
  }

  function unlockLevel(index) {
    if (!validIndex(index)) {
      return false;
    }

    return mutate(data => {
      data.unlocked = Math.max(
        data.unlocked,
        index + 1
      );
    });
  }

  function win(index, score = 0) {
    if (!validIndex(index)) {
      return false;
    }

    const safeScore = Math.max(
      0,
      safeInteger(score)
    );

    const saved = mutate(data => {
      if (!data.completed.includes(index)) {
        data.completed.push(index);
        data.completed.sort((a, b) => a - b);
      }

      data.unlocked = Math.max(
        data.unlocked,
        Math.min(
          TOTAL_LEVELS,
          index + 2
        )
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

      data.stats.levelsCompleted =
        data.completed.length;

      data.stats.lastPlayedLevel = index + 1;
      data.stats.lastPlayedAt = nowISO();
    });

    if (saved) {
      emit("echo404:progresssaved", {
        type: "win",
        level: index + 1,
        score: safeScore
      });
    }

    return saved;
  }

  // ==================================================
  // 13. MEDALS
  // ==================================================

  function saveMedal(index, medal) {
    if (!validIndex(index)) {
      return false;
    }

    const normalized = normalizeMedal(medal);

    if (!normalized) {
      return false;
    }

    const saved = mutate(data => {
      const key = levelKey(index);
      const previous = data.medals[key];

      if (
        !previous ||
        MEDAL_RANK[normalized] >
          MEDAL_RANK[previous]
      ) {
        data.medals[key] = normalized;
      }
    });

    if (saved) {
      emit("echo404:medalsaved", {
        level: index + 1,
        medal: getMedal(index)
      });
    }

    return saved;
  }

  function getMedal(index) {
    if (!validIndex(index)) {
      return null;
    }

    return (
      load().medals[levelKey(index)] || null
    );
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
      if (
        Object.prototype.hasOwnProperty.call(
          MEDAL_RANK,
          medal
        )
      ) {
        summary[medal]++;
        summary.total++;
      }
    }

    return summary;
  }

  // ==================================================
  // 14. STATISTICS
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
    const saved = mutate(data => {
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

    return saved;
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
  // 15. SETTINGS
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
      mode === "joystick"
        ? "joystick"
        : "dpad";

    return mutate(data => {
      data.settings.controlMode = normalized;
    });
  }

  function getControlMode() {
    return load().settings.controlMode;
  }

  // ==================================================
  // 16. OPERATOR SELECTION
  // ==================================================

  function getOperator() {
    const stored = readRaw(OPERATOR_KEY);

    if (
      stored &&
      isValidOperator(stored)
    ) {
      return normalizeOperator(stored);
    }

    return load().settings.operator;
  }

  function setOperator(value) {
    if (!isValidOperator(value)) {
      return false;
    }

    const normalized = normalizeOperator(value);

    const data = load();
    data.settings.operator = normalized;

    const saved = save(data, {
      ignoreExternalOperator: true
    });

    if (!saved) {
      return false;
    }

    // Keep the existing visual selection synchronized.
    const visualData = readJSON(VISUAL_KEY, {});

    if (isRecord(visualData)) {
      visualData.operator = operatorId(normalized);

      writeJSON(VISUAL_KEY, visualData);
    }

    emit("echo404:operatorselected", {
      operator: normalized,
      character: normalized,
      id: operatorId(normalized)
    });

    return true;
  }

  function getOperators() {
    return [...OPERATORS];
  }

  // ==================================================
  // 17. INTRO / TUTORIAL
  // ==================================================

  function hasSeenIntro() {
    return (
      readFlag(INTRO_KEY) ||
      readFlag(LEGACY_INTRO_KEY)
    );
  }

  function setIntroSeen(value = true) {
    return writeFlag(
      INTRO_KEY,
      Boolean(value)
    );
  }

  function hasCompletedTutorial() {
    return (
      readFlag(TUTORIAL_KEY) ||
      readFlag(LEGACY_TUTORIAL_KEY)
    );
  }

  function setTutorialDone(value = true) {
    return writeFlag(
      TUTORIAL_KEY,
      Boolean(value)
    );
  }

  // ==================================================
  // 18. PROGRESS SUMMARY
  // ==================================================

  function getProgress() {
    const data = load();

    const completedCount =
      data.completed.length;

    return {
      version: VERSION,
      unlocked: data.unlocked,
      completed: [...data.completed],
      completedCount,
      totalLevels: TOTAL_LEVELS,

      percentage: Math.round(
        completedCount / TOTAL_LEVELS * 100
      ),

      medals: getMedalSummary()
    };
  }

  function getStats() {
    const data = load();

    return {
      ...data.stats,

      completedLevels:
        data.completed.length,

      unlockedLevels:
        data.unlocked,

      medals:
        getMedalSummary(),

      version: VERSION
    };
  }

  // ==================================================
  // 19. EXPORT PROGRESS
  // ==================================================

  function exportProgress() {
    return JSON.stringify(
      {
        game: "ECHO//404",
        version: VERSION,
        exportedAt: nowISO(),

        progress: load(),

        introSeen: hasSeenIntro(),
        tutorialDone:
          hasCompletedTutorial(),

        operator: getOperator()
      },
      null,
      2
    );
  }

  // ==================================================
  // 20. IMPORT PROGRESS
  // ==================================================

  function importProgress(input) {
    let parsed;

    try {
      parsed =
        typeof input === "string"
          ? JSON.parse(input)
          : input;
    } catch (_) {
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

    if (!isRecord(candidate)) {
      return {
        success: false,
        message: "Progresso inválido."
      };
    }

    const hasProgress =
      Array.isArray(candidate.completed) ||
      Array.isArray(candidate.completedLevels) ||
      typeof candidate.unlocked === "number" ||
      typeof candidate.unlockedLevels === "number";

    if (!hasProgress) {
      return {
        success: false,
        message:
          "O ficheiro não contém progresso válido."
      };
    }

    const current = load();

    const imported = normalize(candidate, {
      mergeStoredMedals: false,
      ignoreExternalOperator: true
    });

    // Merge achievements instead of deleting
    // progress already earned on this device.

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

    for (const [key, value] of Object.entries(
      current.bestScores
    )) {
      imported.bestScores[key] = Math.max(
        imported.bestScores[key] || 0,
        value
      );
    }

    imported.unlocked = clamp(
      Math.max(
        imported.unlocked,
        imported.completed.length
          ? Math.max(...imported.completed) + 2
          : 1
      ),
      1,
      TOTAL_LEVELS
    );

    imported.stats.levelsCompleted =
      imported.completed.length;

    // Keep the highest existing counters.
    for (const key of STAT_KEYS) {
      imported.stats[key] = Math.max(
        current.stats[key] || 0,
        imported.stats[key] || 0
      );
    }

    const requestedOperator =
      typeof parsed.operator === "string"
        ? parsed.operator
        : candidate.settings?.operator;

    if (isValidOperator(requestedOperator)) {
      imported.settings.operator =
        normalizeOperator(requestedOperator);
    } else {
      imported.settings.operator =
        current.settings.operator;
    }

    const saved = save(imported, {
      ignoreExternalOperator: true
    });

    if (!saved) {
      return {
        success: false,
        message:
          "Não foi possível guardar o progresso."
      };
    }

    // Do not undo completed intro/tutorial flags.
    if (parsed.introSeen === true) {
      setIntroSeen(true);
    }

    if (parsed.tutorialDone === true) {
      setTutorialDone(true);
    }

    // Synchronize operator without overwriting progress.
    if (isValidOperator(requestedOperator)) {
      setOperator(requestedOperator);
    }

    emit("echo404:progressimported", {
      completed: imported.completed.length,
      unlocked: imported.unlocked
    });

    return {
      success: true,
      message:
        "Progresso importado com sucesso."
    };
  }

  // ==================================================
  // 21. RESET PROGRESS
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

    const previousIntro = hasSeenIntro();
    const previousTutorial =
      hasCompletedTutorial();

    // Block fallback migration before removing
    // old save data.
    const markerSaved = writeFlag(
      RESET_MARKER_KEY,
      true
    );

    const medalsRemoved =
      removeRaw(MEDALS_KEY);

    const fallbackRemoved =
      removeRaw(FALLBACK_PROGRESS_KEY);

    if (!preserveIntro) {
      removeRaw(INTRO_KEY);
      removeRaw(TUTORIAL_KEY);

      removeRaw(LEGACY_INTRO_KEY);
      removeRaw(LEGACY_TUTORIAL_KEY);
    }

    if (!preserveSettings) {
      removeRaw(OPERATOR_KEY);
      removeRaw(VISUAL_KEY);
    }

    const saved = save(fresh, {
      replaceMedals: true,
      ignoreExternalOperator: true
    });

    if (
      saved &&
      preserveIntro
    ) {
      if (previousIntro) {
        setIntroSeen(true);
      }

      if (previousTutorial) {
        setTutorialDone(true);
      }
    }

    if (saved) {
      emit("echo404:progressreset", {
        preserveSettings,
        preserveIntro
      });
    }

    return (
      saved &&
      markerSaved &&
      medalsRemoved &&
      fallbackRemoved
    );
  }

  // ==================================================
  // 22. EVENTS
  // ==================================================

  function emit(name, detail = {}) {
    if (
      typeof window === "undefined" ||
      typeof window.dispatchEvent !== "function"
    ) {
      return;
    }

    try {
      window.dispatchEvent(
        new CustomEvent(name, {
          detail
        })
      );
    } catch (error) {
      console.warn(
        "[ECHO//404] Event failed:",
        name,
        error
      );
    }
  }

  // ==================================================
  // 23. DEBUG
  // ==================================================

  function debug() {
    const data = load();

    console.group(
      "ECHO//404 STORAGE v" + VERSION
    );

    console.log(
      "Progress:",
      getProgress()
    );

    console.log(
      "Statistics:",
      getStats()
    );

    console.log(
      "Medals:",
      getMedals()
    );

    console.log(
      "Settings:",
      data.settings
    );

    console.log(
      "Operator:",
      getOperator()
    );

    console.log(
      "Raw save:",
      clone(data)
    );

    console.groupEnd();

    return data;
  }

  // ==================================================
  // 24. PUBLIC API
  // ==================================================

  return Object.freeze({
    version: VERSION,

    TOTAL_LEVELS,
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

    unlockLevel,
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

// ==================================================
// 25. GLOBAL REGISTRATION
// ==================================================

if (typeof window !== "undefined") {
  window.GameStorage = GameStorage;
}

console.log(
  "=================================="
);

console.log(
  "ECHO//404 — PARADOX EVOLUTION"
);

console.log(
  "STORAGE SYSTEM v4.2"
);

console.log(
  "PERSISTENT MEMORY READY"
);

console.log(
  "10 LEVELS / MEDALS / STATISTICS"
);

console.log(
  "AXIOM / NYRA / KAI-7"
);

console.log(
  "LEGACY SAVE COMPATIBILITY"
);

console.log(
  "CREATED & DEVELOPED BY MANUEL SAMPAIO01"
);

console.log(
  "© 2026 MANUEL SAMPAIO01"
);

console.log(
  "=================================="
);
