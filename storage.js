
"use strict";

/*
========================================================
 ECHO//404 — PARADOX EVOLUTION
 VERSION 0.8 — SYSTEM REBELLION
 FILE: storage.js

 PERSISTENT PROGRESS
 LEVEL UNLOCKS
 MEDALS
 STATISTICS
 SOUND PREFERENCES
 INTRO / TUTORIAL FLAGS
 EXPORT / IMPORT
 LEGACY SAVE COMPATIBILITY

 CREATED & DEVELOPED BY MANUEL SAMPAIO01
 © 2026 MANUEL SAMPAIO01
========================================================
*/

const GameStorage = (() => {

  // ==================================================
  // 01. CONFIGURATION
  // ==================================================

  const VERSION = "0.8";

  const TOTAL_LEVELS = 10;

  /*
    Keep the old progress key so players
    can retain their existing saves.
  */

  const STORAGE_KEY =
    "echo404_paradox_v06";

  const MEDALS_KEY =
    "echo404_awakening_medals_v07";

  const INTRO_KEY =
    "echo404_v08_intro_seen";

  const TUTORIAL_KEY =
    "echo404_v08_tutorial_done";

  const LEGACY_INTRO_KEY =
    "echo404_v07_intro_seen";

  const LEGACY_TUTORIAL_KEY =
    "echo404_v07_tutorial_done";

  const FALLBACK_PROGRESS_KEY =
    "echo404_v08_progress";

  const MEDAL_RANK = Object.freeze({
    bronze: 1,
    silver: 2,
    gold: 3
  });

  // ==================================================
  // 02. BASIC HELPERS
  // ==================================================

  function safeNumber(
    value,
    fallback = 0
  ) {
    const number = Number(value);

    return Number.isFinite(number)
      ? number
      : fallback;
  }

  function safeInteger(
    value,
    fallback = 0
  ) {
    const number = Number(value);

    return Number.isFinite(number)
      ? Math.trunc(number)
      : fallback;
  }

  function clamp(
    value,
    min,
    max
  ) {
    return Math.min(
      max,
      Math.max(min, value)
    );
  }

  function isValidDate(value) {
    return (
      typeof value === "string" &&
      !Number.isNaN(
        Date.parse(value)
      )
    );
  }

  function nowISO() {
    return new Date().toISOString();
  }

  function readJSON(
    key,
    fallback = null
  ) {
    try {
      const raw =
        localStorage.getItem(key);

      return raw === null
        ? fallback
        : JSON.parse(raw);
    } catch (error) {
      console.warn(
        "ECHO//404: Unable to read storage:",
        key,
        error
      );

      return fallback;
    }
  }

  function writeJSON(
    key,
    value
  ) {
    try {
      localStorage.setItem(
        key,
        JSON.stringify(value)
      );

      return true;
    } catch (error) {
      console.warn(
        "ECHO//404: Unable to write storage:",
        key,
        error
      );

      return false;
    }
  }

  function readFlag(key) {
    try {
      return (
        localStorage.getItem(key) ===
        "true"
      );
    } catch {
      return false;
    }
  }

  function writeFlag(
    key,
    value = true
  ) {
    try {
      localStorage.setItem(
        key,
        String(Boolean(value))
      );

      return true;
    } catch {
      return false;
    }
  }

  // ==================================================
  // 03. DEFAULT SAVE STRUCTURE
  // ==================================================

  function defaults() {
    return {
      version: VERSION,

      createdAt: nowISO(),
      updatedAt: nowISO(),

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
        controlMode: "dpad"
      }
    };
  }

  // ==================================================
  // 04. LEVEL INDEX HELPERS
  // ==================================================

  /*
    Public methods use ZERO-BASED indexes:

      Level 1 -> index 0
      Level 2 -> index 1
      ...
      Level 10 -> index 9

    This matches game.js v0.8.
  */

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

  function normalizeLevelIndex(
    value
  ) {
    const index =
      safeInteger(value, -1);

    return validIndex(index)
      ? index
      : null;
  }

  // ==================================================
  // 05. MEDAL NORMALIZATION
  // ==================================================

  function normalizeMedal(value) {
    let medal = value;

    if (
      medal &&
      typeof medal === "object"
    ) {
      medal =
        medal.medal ??
        medal.type ??
        medal.rank ??
        "";
    }

    if (
      typeof medal !== "string"
    ) {
      return null;
    }

    const normalized =
      medal.trim().toLowerCase();

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
      !source ||
      typeof source !== "object"
    ) {
      return result;
    }

    const entries =
      Array.isArray(source)
        ? source.map(
            (value, index) => [
              String(index),
              value
            ]
          )
        : Object.entries(source);

    entries.forEach(
      ([key, value]) => {
        const index =
          Number(key);

        if (!validIndex(index)) {
          return;
        }

        const medal =
          normalizeMedal(value);

        if (!medal) {
          return;
        }

        const existing =
          result[levelKey(index)];

        if (
          !existing ||
          MEDAL_RANK[medal] >
          MEDAL_RANK[existing]
        ) {
          result[levelKey(index)] =
            medal;
        }
      }
    );

    return result;
  }

  function mergeMedals(
    ...sources
  ) {
    const merged = {};

    sources.forEach(source => {
      const normalized =
        normalizeMedals(source);

      Object.entries(
        normalized
      ).forEach(
        ([key, medal]) => {
          const existing =
            merged[key];

          if (
            !existing ||
            MEDAL_RANK[medal] >
            MEDAL_RANK[existing]
          ) {
            merged[key] = medal;
          }
        }
      );
    });

    return merged;
  }

  // ==================================================
  // 06. NORMALIZE SAVED PROGRESS
  // ==================================================

  function normalize(source) {
    const base = defaults();

    if (
      !source ||
      typeof source !== "object" ||
      Array.isArray(source)
    ) {
      return base;
    }

    const stats =
      source.stats &&
      typeof source.stats === "object"
        ? source.stats
        : {};

    const settings =
      source.settings &&
      typeof source.settings === "object"
        ? source.settings
        : {};

    const completed = [];

    /*
      Support the v0.8 representation:
      completed = [0, 1, 2]

      Legacy saves may use:
      completedLevels = [1, 2, 3]
    */

    if (
      Array.isArray(source.completed)
    ) {
      source.completed.forEach(
        value => {
          const index =
            normalizeLevelIndex(value);

          if (
            index !== null &&
            !completed.includes(index)
          ) {
            completed.push(index);
          }
        }
      );
    }

    if (
      Array.isArray(
        source.completedLevels
      )
    ) {
      source.completedLevels.forEach(
        value => {
          const index =
            safeInteger(value, 0) - 1;

          if (
            validIndex(index) &&
            !completed.includes(index)
          ) {
            completed.push(index);
          }
        }
      );
    }

    completed.sort(
      (a, b) => a - b
    );

    const bestScores = {};

    const scoreSources = [
      source.bestScores,
      source.best,
      source.scores
    ];

    scoreSources.forEach(
      scoreSource => {
        if (
          !scoreSource ||
          typeof scoreSource !== "object"
        ) {
          return;
        }

        Object.entries(
          scoreSource
        ).forEach(
          ([key, value]) => {
            const index =
              Number(key);

            if (
              !validIndex(index)
            ) {
              return;
            }

            const score =
              Math.max(
                0,
                safeInteger(value, 0)
              );

            const storageKey =
              levelKey(index);

            bestScores[storageKey] =
              Math.max(
                bestScores[
                  storageKey
                ] || 0,
                score
              );
          }
        );
      }
    );

    const medals =
      mergeMedals(
        source.medals,
        readJSON(
          MEDALS_KEY,
          {}
        )
      );

    const unlocked =
      clamp(
        safeInteger(
          source.unlocked ??
          source.unlockedLevels ??
          1,
          1
        ),
        1,
        TOTAL_LEVELS
      );

    const maxCompleted =
      completed.length
        ? Math.max(...completed) + 2
        : 1;

    const result = {
      version: VERSION,

      createdAt:
        isValidDate(
          source.createdAt
        )
          ? source.createdAt
          : base.createdAt,

      updatedAt:
        isValidDate(
          source.updatedAt
        )
          ? source.updatedAt
          : base.updatedAt,

      unlocked: clamp(
        Math.max(
          unlocked,
          maxCompleted
        ),
        1,
        TOTAL_LEVELS
      ),

      completed,

      bestScores,

      medals,

      stats: {
        attempts: Math.max(
          0,
          safeInteger(
            stats.attempts
          )
        ),

        deaths: Math.max(
          0,
          safeInteger(
            stats.deaths
          )
        ),

        shifts: Math.max(
          0,
          safeInteger(
            stats.shifts
          )
        ),

        wins: Math.max(
          0,
          safeInteger(
            stats.wins
          )
        ),

        totalScore: Math.max(
          0,
          safeInteger(
            stats.totalScore
          )
        ),

        bestOverallScore:
          Math.max(
            0,
            safeInteger(
              stats.bestOverallScore
            )
          ),

        totalCycles: Math.max(
          0,
          safeInteger(
            stats.totalCycles
          )
        ),

        portalsUsed: Math.max(
          0,
          safeInteger(
            stats.portalsUsed
          )
        ),

        lasersHit: Math.max(
          0,
          safeInteger(
            stats.lasersHit
          )
        ),

        platformDeaths: Math.max(
          0,
          safeInteger(
            stats.platformDeaths
          )
        ),

        echoTrapDeaths: Math.max(
          0,
          safeInteger(
            stats.echoTrapDeaths
          )
        ),

        levelsCompleted:
          completed.length,

        lastPlayedLevel: clamp(
          safeInteger(
            stats.lastPlayedLevel,
            1
          ),
          1,
          TOTAL_LEVELS
        ),

        lastPlayedAt:
          isValidDate(
            stats.lastPlayedAt
          )
            ? stats.lastPlayedAt
            : null
      },

      settings: {
        sound:
          typeof settings.sound ===
            "boolean"
            ? settings.sound
            : typeof source.sound ===
                "boolean"
              ? source.sound
              : true,

        volume: clamp(
          safeNumber(
            settings.volume,
            0.7
          ),
          0,
          1
        ),

        controlMode:
          settings.controlMode ===
          "joystick"
            ? "joystick"
            : "dpad"
      }
    };

    return result;
  }

  // ==================================================
  // 07. LOAD AND SAVE
  // ==================================================

  function load() {
    const raw =
      readJSON(
        STORAGE_KEY,
        null
      );

    const data =
      normalize(raw);

    /*
      Merge medals from the separate
      medal key without deleting either
      source.
    */

    data.medals =
      mergeMedals(
        data.medals,
        readJSON(
          MEDALS_KEY,
          {}
        )
      );

    return data;
  }

  function save(input) {
    const data =
      normalize(input);

    data.version = VERSION;
    data.updatedAt = nowISO();

    /*
      Preserve the best medal rank from
      both storage locations.
    */

    data.medals =
      mergeMedals(
        data.medals,
        readJSON(
          MEDALS_KEY,
          {}
        )
      );

    const mainSaved =
      writeJSON(
        STORAGE_KEY,
        data
      );

    const medalsSaved =
      writeJSON(
        MEDALS_KEY,
        data.medals
      );

    return (
      mainSaved &&
      medalsSaved
    );
  }

  function mutate(callback) {
    const data = load();

    callback(data);

    save(data);

    return data;
  }

  // ==================================================
  // 08. LEVEL PROGRESS
  // ==================================================

  function isUnlocked(index) {
    if (!validIndex(index)) {
      return false;
    }

    return (
      index <
      load().unlocked
    );
  }

  function isCompleted(index) {
    if (!validIndex(index)) {
      return false;
    }

    return load()
      .completed.includes(index);
  }

  function getBestScore(index) {
    if (!validIndex(index)) {
      return 0;
    }

    const data = load();

    return (
      data.bestScores[
        levelKey(index)
      ] || 0
    );
  }

  function win(
    index,
    score = 0
  ) {
    if (!validIndex(index)) {
      return false;
    }

    const safeScore =
      Math.max(
        0,
        safeInteger(score)
      );

    mutate(data => {
      if (
        !data.completed.includes(
          index
        )
      ) {
        data.completed.push(
          index
        );

        data.completed.sort(
          (a, b) => a - b
        );
      }

      data.unlocked = Math.max(
        data.unlocked,
        Math.min(
          TOTAL_LEVELS,
          index + 2
        )
      );

      const key =
        levelKey(index);

      data.bestScores[key] =
        Math.max(
          data.bestScores[key] || 0,
          safeScore
        );

      data.stats.wins++;

      data.stats.totalScore +=
        safeScore;

      data.stats.bestOverallScore =
        Math.max(
          data.stats.bestOverallScore,
          safeScore
        );

      data.stats.levelsCompleted =
        data.completed.length;

      data.stats.lastPlayedLevel =
        index + 1;

      data.stats.lastPlayedAt =
        nowISO();
    });

    return true;
  }

  // ==================================================
  // 09. MEDALS
  // ==================================================

  function saveMedal(
    index,
    medal
  ) {
    if (!validIndex(index)) {
      return false;
    }

    const normalized =
      normalizeMedal(medal);

    if (!normalized) {
      return false;
    }

    mutate(data => {
      const key =
        levelKey(index);

      const previous =
        data.medals[key];

      if (
        !previous ||
        MEDAL_RANK[normalized] >
        MEDAL_RANK[previous]
      ) {
        data.medals[key] =
          normalized;
      }
    });

    return true;
  }

  function getMedal(index) {
    if (!validIndex(index)) {
      return null;
    }

    return (
      load().medals[
        levelKey(index)
      ] || null
    );
  }

  function getMedals() {
    return {
      ...load().medals
    };
  }

  function getMedalSummary() {
    const medals =
      Object.values(
        getMedals()
      );

    const summary = {
      gold: 0,
      silver: 0,
      bronze: 0,
      total: 0
    };

    medals.forEach(
      medal => {
        if (
          summary[medal] !==
          undefined
        ) {
          summary[medal]++;
          summary.total++;
        }
      }
    );

    return summary;
  }

  // ==================================================
  // 10. STATISTICS
  // ==================================================

  function registerAttempt(
    index = null
  ) {
    mutate(data => {
      data.stats.attempts++;

      if (
        validIndex(index)
      ) {
        data.stats.lastPlayedLevel =
          index + 1;
      }

      data.stats.lastPlayedAt =
        nowISO();
    });

    return true;
  }

  function registerDeath(
    reason = null
  ) {
    mutate(data => {
      data.stats.deaths++;

      if (reason === "laser") {
        data.stats.lasersHit++;
      }

      if (
        reason === "platform"
      ) {
        data.stats.platformDeaths++;
      }

      if (
        reason === "echo-trap"
      ) {
        data.stats.echoTrapDeaths++;
      }

      data.stats.lastPlayedAt =
        nowISO();
    });

    return true;
  }

  function registerShift() {
    mutate(data => {
      data.stats.shifts++;
      data.stats.lastPlayedAt =
        nowISO();
    });

    return true;
  }

  function registerCycle() {
    mutate(data => {
      data.stats.totalCycles++;
      data.stats.lastPlayedAt =
        nowISO();
    });

    return true;
  }

  function registerPortal() {
    mutate(data => {
      data.stats.portalsUsed++;
      data.stats.lastPlayedAt =
        nowISO();
    });

    return true;
  }

  // ==================================================
  // 11. SETTINGS
  // ==================================================

  function setSound(enabled) {
    mutate(data => {
      data.settings.sound =
        Boolean(enabled);
    });

    return true;
  }

  function getSound() {
    return load().settings.sound;
  }

  function setVolume(value) {
    mutate(data => {
      data.settings.volume =
        clamp(
          safeNumber(value, 0.7),
          0,
          1
        );
    });

    return true;
  }

  function getVolume() {
    return load().settings.volume;
  }

  function setControlMode(mode) {
    const normalized =
      mode === "joystick"
        ? "joystick"
        : "dpad";

    mutate(data => {
      data.settings.controlMode =
        normalized;
    });

    return true;
  }

  function getControlMode() {
    return load()
      .settings.controlMode;
  }

  // ==================================================
  // 12. INTRO AND TUTORIAL
  // ==================================================

  function hasSeenIntro() {
    return (
      readFlag(INTRO_KEY) ||
      readFlag(
        LEGACY_INTRO_KEY
      )
    );
  }

  function setIntroSeen(
    value = true
  ) {
    return writeFlag(
      INTRO_KEY,
      value
    );
  }

  function hasCompletedTutorial() {
    return (
      readFlag(TUTORIAL_KEY) ||
      readFlag(
        LEGACY_TUTORIAL_KEY
      )
    );
  }

  function setTutorialDone(
    value = true
  ) {
    return writeFlag(
      TUTORIAL_KEY,
      value
    );
  }

  // ==================================================
  // 13. PROGRESS AND STATS SUMMARY
  // ==================================================

  function getProgress() {
    const data = load();

    return {
      version: VERSION,

      unlocked:
        data.unlocked,

      completed:
        [...data.completed],

      completedCount:
        data.completed.length,

      totalLevels:
        TOTAL_LEVELS,

      percentage:
        Math.round(
          data.completed.length /
          TOTAL_LEVELS * 100
        ),

      medals:
        getMedalSummary()
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
  // 14. EXPORT / IMPORT
  // ==================================================

  function exportProgress() {
    const data = load();

    return JSON.stringify(
      {
        game: "ECHO//404",
        version: VERSION,
        exportedAt: nowISO(),
        progress: data,
        introSeen:
          hasSeenIntro(),
        tutorialDone:
          hasCompletedTutorial()
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
        message:
          "JSON inválido."
      };
    }

    if (
      !parsed ||
      typeof parsed !== "object"
    ) {
      return {
        success: false,
        message:
          "Dados inválidos."
      };
    }

    const candidate =
      parsed.progress &&
      typeof parsed.progress ===
        "object"
        ? parsed.progress
        : parsed;

    if (
      !candidate ||
      typeof candidate !==
        "object" ||
      (
        !Array.isArray(
          candidate.completed
        ) &&
        !Array.isArray(
          candidate.completedLevels
        ) &&
        typeof candidate.unlocked !==
          "number" &&
        typeof candidate.unlockedLevels !==
          "number"
      )
    ) {
      return {
        success: false,
        message:
          "O ficheiro não contém progresso válido."
      };
    }

    const imported =
      normalize(candidate);

    /*
      Merge medal achievements so
      importing an older save cannot
      downgrade existing medals.
    */

    imported.medals =
      mergeMedals(
        load().medals,
        imported.medals
      );

    const saved =
      save(imported);

    if (
      saved &&
      typeof parsed.introSeen ===
        "boolean"
    ) {
      setIntroSeen(
        parsed.introSeen
      );
    }

    if (
      saved &&
      typeof parsed.tutorialDone ===
        "boolean"
    ) {
      setTutorialDone(
        parsed.tutorialDone
      );
    }

    return {
      success: saved,
      message: saved
        ? "Progresso importado com sucesso."
        : "Não foi possível guardar o progresso."
    };
  }

  // ==================================================
  // 15. RESET PROGRESS
  // ==================================================

  function resetProgress(
    options = {}
  ) {
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

    /*
      Remove the medal key first;
      otherwise normalize() would
      merge old medals back in.
    */

    try {
      localStorage.removeItem(
        MEDALS_KEY
      );

      localStorage.removeItem(
        FALLBACK_PROGRESS_KEY
      );

      if (!preserveIntro) {
        localStorage.removeItem(
          INTRO_KEY
        );

        localStorage.removeItem(
          TUTORIAL_KEY
        );

        localStorage.removeItem(
          LEGACY_INTRO_KEY
        );

        localStorage.removeItem(
          LEGACY_TUTORIAL_KEY
        );
      }
    } catch {
      // Continue with the main reset.
    }

    return save(fresh);
  }

  // ==================================================
  // 16. DEBUG
  // ==================================================

  function debug() {
    const data = load();

    console.group(
      "ECHO//404 STORAGE v0.8"
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
      "Raw save:",
      data
    );

    console.groupEnd();

    return data;
  }

  // ==================================================
  // 17. PUBLIC API
  // ==================================================

  return Object.freeze({
    version: VERSION,

    STORAGE_KEY,
    MEDALS_KEY,

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

/*
========================================================
 ECHO//404 — SYSTEM REBELLION v0.8

 CREATED & DEVELOPED BY
 MANUEL SAMPAIO01

 © 2026 MANUEL SAMPAIO01
========================================================
*/
