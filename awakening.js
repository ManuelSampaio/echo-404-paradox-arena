
/*
====================================================
 ECHO//404 — THE AWAKENING
 VERSION 0.7

 Cinematic intro
 Interactive tutorial
 ECHO artificial intelligence
 Glitch effects
 Medal system
 Persistent preferences

 Compatible with ECHO//404 v0.6.1
====================================================
*/

(() => {
  "use strict";

  const VERSION = "0.7.0";

  const KEYS = {
    intro: "echo404_v07_intro_seen",
    tutorial: "echo404_v07_tutorial_done",
    medals: "echo404_v07_medals"
  };

  const INTRO = [
    {
      title: "SINAL DETECTADO",
      text:
        "Se estás a ler isto, o sistema já te encontrou. " +
        "Não sabemos quem és. Mas sabemos que não " +
        "deverias estar aqui."
    },
    {
      title: "A EXPERIÊNCIA FALHOU",
      text:
        "O tempo está preso em ciclos de dez segundos. " +
        "Sempre que um ciclo termina, uma versão tua " +
        "fica para trás, condenada a repetir os " +
        "teus movimentos."
    },
    {
      title: "O TEU PASSADO É A TUA ARMA",
      text:
        "Os teus ecos podem abrir caminhos que sozinho " +
        "não conseguirias atravessar. Aprende a " +
        "colaborar contigo mesmo. Encontra a saída. " +
        "E não confies em tudo o que o sistema te diz."
    }
  ];

  const TUTORIAL = [
    {
      text:
        "Bem-vindo à simulação. Usa WASD ou as setas " +
        "no computador. No telemóvel, utiliza o " +
        "direccional táctil."
    },
    {
      text:
        "A placa amarela activa mecanismos temporais. " +
        "Experimenta posicionar o jogador sobre ela."
    },
    {
      text:
        "Cada ciclo dura dez segundos. Quando o tempo " +
        "termina, nasce um eco que repete os teus " +
        "movimentos anteriores."
    },
    {
      text:
        "Usa os teus ecos para manter mecanismos " +
        "activados enquanto procuras o portal verde. " +
        "Esse portal é a saída."
    }
  ];

  const ECHO_LINES = {
    start: [
      "Simulação iniciada. Tenta não destruir a realidade.",
      "A observar os teus movimentos. Por razões científicas, claro.",
      "Lembra-te: o tempo não espera por ninguém."
    ],

    cycle: [
      "Um novo ciclo. O teu passado acaba de ganhar vida.",
      "Outro eco criado. Agora já tens companhia.",
      "Interessante. Estás a construir uma equipa de ti próprio.",
      "O passado não desaparece. Aqui, trabalha para ti."
    ],

    shift: [
      "Paradox Shift detectado. A realidade foi alterada.",
      "Reescrever o passado? Uma escolha ousada.",
      "O sistema registou uma anomalia temporal."
    ],

    win: [
      "Paradoxo resolvido. Nada mau para um humano.",
      "Conseguiste! A realidade agradece.",
      "Um nível concluído. Ainda há perguntas sem resposta."
    ],

    lose: [
      "Falhaste. Felizmente, o tempo permite novas tentativas.",
      "O paradoxo venceu desta vez. Tenta outra abordagem.",
      "Não te preocupes. Eu também teria feito melhor."
    ]
  };

  const $ = (id) => document.getElementById(id);

  const state = {
    introStep: 0,
    introOpen: false,
    typingTimer: null,
    messageTimer: null,
    glitchTimer: null,
    tutorialStep: 0,
    tutorialVisible: false,
    currentLevel: 1,
    lastCycle: null,
    lastOverlayVisible: false,
    lastResultSignature: "",
    lastShiftTime: 0,
    lastMessageTime: 0,
    gameStarted: false,
    medals: {},
    initialized: false
  };

  function readStorage(key, fallback = null) {
    try {
      const value = localStorage.getItem(key);
      return value === null ? fallback : value;
    } catch (_) {
      return fallback;
    }
  }

  function writeStorage(key, value) {
    try {
      localStorage.setItem(key, value);
      return true;
    } catch (_) {
      return false;
    }
  }

  function loadMedals() {
    try {
      const parsed = JSON.parse(
        readStorage(KEYS.medals, "{}")
      );

      return parsed && typeof parsed === "object"
        ? parsed
        : {};
    } catch (_) {
      return {};
    }
  }

  function safeText(id, value) {
    const element = $(id);

    if (element) {
      element.textContent = value;
    }
  }

  function randomLine(lines) {
    return lines[
      Math.floor(Math.random() * lines.length)
    ];
  }

  function isOverlayVisible() {
    const overlay = $("overlay");

    if (!overlay) return false;

    return (
      !overlay.classList.contains("hidden") &&
      !overlay.hidden &&
      getComputedStyle(overlay).display !== "none"
    );
  }

  function playEffect(name) {
    try {
      if (
        typeof GameAudio !== "undefined" &&
        typeof GameAudio.play === "function"
      ) {
        GameAudio.play(name);
      }
    } catch (_) {
      // Optional audio never interrupts gameplay.
    }
  }

  /* ========================================
     CINEMATIC INTRODUCTION
  ======================================== */

  function typeText(element, text, speed = 24) {
    clearInterval(state.typingTimer);

    if (!element) return;

    element.textContent = "";

    let position = 0;

    state.typingTimer = setInterval(() => {
      if (!state.introOpen) {
        clearInterval(state.typingTimer);
        return;
      }

      position += 1;

      element.textContent = text.slice(0, position);

      if (position >= text.length) {
        clearInterval(state.typingTimer);
        state.typingTimer = null;
      }
    }, speed);
  }

  function showIntroStep() {
    const scene = INTRO[state.introStep];

    if (!scene) return;

    safeText("awakeningTitle", scene.title);

    safeText(
      "awakeningCounter",
      String(state.introStep + 1).padStart(2, "0") +
        " / 03"
    );

    const dots = document.querySelectorAll(
      ".awakening-dot"
    );

    dots.forEach((dot, index) => {
      dot.classList.toggle(
        "active",
        index === state.introStep
      );

      dot.classList.toggle(
        "completed",
        index < state.introStep
      );
    });

    safeText(
      "awakeningNext",
      state.introStep === INTRO.length - 1
        ? "ENTRAR NA SIMULAÇÃO →"
        : "CONTINUAR →"
    );

    typeText($("awakeningText"), scene.text);

    triggerGlitch(250);
  }

  function openIntro(force = false) {
    const intro = $("awakeningIntro");

    if (!intro) return;

    if (
      !force &&
      readStorage(KEYS.intro) === "true"
    ) {
      return;
    }

    state.introStep = 0;
    state.introOpen = true;

    intro.classList.remove("hidden");
    intro.setAttribute("aria-hidden", "false");

    document.body.classList.add(
      "awakening-intro-open"
    );

    showIntroStep();

    $("awakeningNext")?.focus();
  }

  function closeIntro() {
    const intro = $("awakeningIntro");

    clearInterval(state.typingTimer);
    state.typingTimer = null;
    state.introOpen = false;

    if (intro) {
      intro.classList.add("hidden");
      intro.setAttribute("aria-hidden", "true");
    }

    document.body.classList.remove(
      "awakening-intro-open"
    );

    writeStorage(KEYS.intro, "true");

    if (!state.gameStarted) {
      showEcho(
        "Transmissão terminada. Selecciona um nível e inicia a simulação.",
        5500
      );
    }
  }

  function nextIntroStep() {
    if (state.typingTimer) {
      clearInterval(state.typingTimer);
      state.typingTimer = null;

      safeText(
        "awakeningText",
        INTRO[state.introStep].text
      );

      return;
    }

    if (state.introStep < INTRO.length - 1) {
      state.introStep += 1;
      showIntroStep();
    } else {
      closeIntro();
    }
  }

  /* ========================================
     ECHO AI MESSAGES
  ======================================== */

  function showEcho(message, duration = 4500) {
    const box = $("echoMessage");
    const text = $("echoMessageText");

    if (!box || !text) return;

    clearTimeout(state.messageTimer);

    text.textContent = message;

    box.classList.add("visible");

    state.lastMessageTime = Date.now();

    state.messageTimer = setTimeout(() => {
      box.classList.remove("visible");
    }, duration);
  }

  function hideEcho() {
    clearTimeout(state.messageTimer);

    $("echoMessage")?.classList.remove("visible");
  }

  function echoCategory(category) {
    const lines = ECHO_LINES[category];

    if (!lines) return;

    showEcho(randomLine(lines));
  }

  /* ========================================
     GLITCH EFFECT
  ======================================== */

  function triggerGlitch(duration = 400) {
    const glitch = $("awakeningGlitch");

    if (!glitch) return;

    clearTimeout(state.glitchTimer);

    glitch.classList.remove("active");

    // Restart the CSS animation.
    void glitch.offsetWidth;

    glitch.classList.add("active");

    state.glitchTimer = setTimeout(() => {
      glitch.classList.remove("active");
    }, duration);
  }

  /* ========================================
     INTERACTIVE TUTORIAL
  ======================================== */

  function shouldShowTutorial() {
    return (
      state.currentLevel === 1 &&
      readStorage(KEYS.tutorial) !== "true"
    );
  }

  function showTutorialStep() {
    const tutorial = $("awakeningTutorial");

    if (!tutorial) return;

    const step = TUTORIAL[state.tutorialStep];

    if (!step) {
      finishTutorial();
      return;
    }

    safeText("tutorialText", step.text);

    safeText(
      "tutorialCounter",
      `${state.tutorialStep + 1}/${TUTORIAL.length}`
    );

    safeText(
      "tutorialNext",
      state.tutorialStep === TUTORIAL.length - 1
        ? "CONCLUÍDO ✓"
        : "ENTENDI →"
    );

    tutorial.classList.add("visible");
    state.tutorialVisible = true;
  }

  function beginTutorial() {
    if (!shouldShowTutorial()) return;

    state.tutorialStep = 0;

    showTutorialStep();
  }

  function nextTutorialStep() {
    if (!state.tutorialVisible) return;

    state.tutorialStep += 1;

    if (state.tutorialStep >= TUTORIAL.length) {
      finishTutorial();
    } else {
      showTutorialStep();
    }
  }

  function finishTutorial() {
    $("awakeningTutorial")?.classList.remove(
      "visible"
    );

    state.tutorialVisible = false;

    writeStorage(KEYS.tutorial, "true");

    showEcho(
      "Protocolo concluído. Agora o paradoxo está nas tuas mãos.",
      5000
    );
  }

  function hideTutorialTemporarily() {
    $("awakeningTutorial")?.classList.remove(
      "visible"
    );

    state.tutorialVisible = false;
  }

  /* ========================================
     MEDAL SYSTEM
  ======================================== */

  const MEDALS = {
    bronze: {
      label: "BRONZE",
      icon: "🥉",
      rank: 1
    },

    silver: {
      label: "PRATA",
      icon: "🥈",
      rank: 2
    },

    gold: {
      label: "OURO",
      icon: "🥇",
      rank: 3
    }
  };

  /*
   Medal thresholds are based on the final
   score exposed by the existing game.

   They can be balanced later using actual
   scores collected from gameplay.
  */

  function getMedal(score) {
    if (score >= 8000) return "gold";
    if (score >= 5000) return "silver";
    return "bronze";
  }

  function parseScore(value) {
    const text = String(value ?? "");

    // Supports "8 216", "8.216" and "8216".
    const match = text.match(
      /-?\d[\d\s.,]*/
    );

    if (!match) return null;

    const digits = match[0].replace(/[^\d-]/g, "");

    const score = Number(digits);

    return Number.isFinite(score)
      ? score
      : null;
  }

  function saveMedal(level, medal, score) {
    const key = String(level);
    const previous = state.medals[key];

    if (
      !previous ||
      MEDALS[medal].rank >
        MEDALS[previous.medal]?.rank ||
      (
        medal === previous.medal &&
        score > previous.score
      )
    ) {
      state.medals[key] = {
        medal,
        score,
        date: new Date().toISOString()
      };

      writeStorage(
        KEYS.medals,
        JSON.stringify(state.medals)
      );
    }

    updateMedalSummary();
  }

  function updateMedalSummary() {
    let summary = $("awakeningMedalSummary");

    if (!summary) {
      const menu = document.querySelector(".menu");

      if (!menu) return;

      summary = document.createElement("div");
      summary.id = "awakeningMedalSummary";
      summary.className = "awakening-medal-summary";

      menu.appendChild(summary);
    }

    const counts = {
      gold: 0,
      silver: 0,
      bronze: 0
    };

    Object.values(state.medals).forEach((entry) => {
      if (counts[entry.medal] !== undefined) {
        counts[entry.medal] += 1;
      }
    });

    summary.textContent =
      `🥇 ${counts.gold} OURO  ·  ` +
      `🥈 ${counts.silver} PRATA  ·  ` +
      `🥉 ${counts.bronze} BRONZE`;
  }

  function showMedalOnResult(score) {
    const panel = document.querySelector(
      "#overlay .result-panel"
    );

    if (!panel) return;

    const medal = getMedal(score);
    const info = MEDALS[medal];

    let badge = $("awakeningMedalResult");

    if (!badge) {
      badge = document.createElement("div");

      badge.id = "awakeningMedalResult";
      badge.className = "awakening-medal-result";

      const actions = panel.querySelector(
        ".result-actions"
      );

      if (actions) {
        panel.insertBefore(badge, actions);
      } else {
        panel.appendChild(badge);
      }
    }

    badge.dataset.medal = medal;

    badge.textContent =
      `${info.icon} MEDALHA DE ${info.label}`;

    saveMedal(state.currentLevel, medal, score);
  }

  /* ========================================
     LEVEL TRACKING
  ======================================== */

  function readLevelFromName() {
    const name = $("levelName")?.textContent || "";

    const match = name.match(
      /(?:N[IÍ]VEL|LEVEL)\s*(\d+)/i
    );

    if (!match) return null;

    const number = Number(match[1]);

    return Number.isInteger(number) &&
      number >= 1 &&
      number <= 10
      ? number
      : null;
  }

  function syncLevel() {
    const level = readLevelFromName();

    if (level !== null) {
      state.currentLevel = level;
    }
  }

  function onLevelChange() {
    syncLevel();

    hideTutorialTemporarily();

    state.gameStarted = false;
    state.lastCycle = null;
    state.lastResultSignature = "";
  }

  /* ========================================
     GAME STATE OBSERVERS
  ======================================== */

  function getCycleNumber() {
    const value = $("cycle")?.textContent || "";

    const match = value.match(/\d+/);

    return match ? Number(match[0]) : null;
  }

  function monitorCycle() {
    if (!state.gameStarted) return;

    const cycle = getCycleNumber();

    if (cycle === null) return;

    if (state.lastCycle === null) {
      state.lastCycle = cycle;
      return;
    }

    if (cycle > state.lastCycle) {
      triggerGlitch(350);

      echoCategory("cycle");

      if (
        state.tutorialVisible &&
        state.tutorialStep < 2
      ) {
        state.tutorialStep = 2;
        showTutorialStep();
      }
    }

    state.lastCycle = cycle;
  }

  function handleResult() {
    const visible = isOverlayVisible();

    if (!visible) {
      state.lastOverlayVisible = false;
      return;
    }

    const title =
      $("overlayTitle")?.textContent?.trim() || "";

    const scoreText =
      $("finalScore")?.textContent?.trim() || "";

    const signature = `${title}|${scoreText}`;

    if (
      state.lastOverlayVisible &&
      state.lastResultSignature === signature
    ) {
      return;
    }

    state.lastOverlayVisible = true;
    state.lastResultSignature = signature;

    if (!title && !scoreText) return;

    const normalized = title.toLowerCase();

    const victory =
      /resolvido|conclu[ií]do|vit[oó]ria|success|complete|win|escaped/i
        .test(normalized);

    const defeat =
      /falh|derrota|game over|morre|perde|failed|dead|lose/i
        .test(normalized);

    if (victory) {
      const score = parseScore(scoreText);

      if (score !== null) {
        showMedalOnResult(score);
      }

      triggerGlitch(650);
      echoCategory("win");

      if (state.currentLevel === 1) {
        hideTutorialTemporarily();
      }
    } else if (defeat) {
      const badge = $("awakeningMedalResult");

      if (badge) badge.remove();

      triggerGlitch(450);
      echoCategory("lose");
    }
  }

  function monitorGame() {
    if (state.introOpen) return;

    syncLevel();
    monitorCycle();
    handleResult();
  }

  /* ========================================
     EVENT HANDLERS
  ======================================== */

  function handleStart() {
    state.gameStarted = true;
    state.lastCycle = getCycleNumber();
    state.lastOverlayVisible = false;
    state.lastResultSignature = "";

    syncLevel();

    setTimeout(() => {
      if (isOverlayVisible()) return;

      echoCategory("start");

      if (shouldShowTutorial()) {
        beginTutorial();
      }
    }, 650);
  }

  function handleRestart() {
    state.lastCycle = null;
    state.lastResultSignature = "";
    state.lastOverlayVisible = false;

    hideTutorialTemporarily();

    triggerGlitch(400);
  }

  function handleShift() {
    if (!state.gameStarted) return;

    const now = Date.now();

    if (now - state.lastShiftTime < 1200) {
      return;
    }

    state.lastShiftTime = now;

    triggerGlitch(280);
    echoCategory("shift");
  }

  function setupListeners() {
    $("awakeningNext")?.addEventListener(
      "click",
      nextIntroStep
    );

    $("awakeningSkip")?.addEventListener(
      "click",
      closeIntro
    );

    $("awakeningReplayBtn")?.addEventListener(
      "click",
      () => openIntro(true)
    );

    $("echoMessageClose")?.addEventListener(
      "click",
      hideEcho
    );

    $("tutorialNext")?.addEventListener(
      "click",
      nextTutorialStep
    );

    $("tutorialSkip")?.addEventListener(
      "click",
      finishTutorial
    );

    $("startBtn")?.addEventListener(
      "click",
      handleStart
    );

    $("restartBtn")?.addEventListener(
      "click",
      handleRestart
    );

    $("mobileRestartBtn")?.addEventListener(
      "click",
      handleRestart
    );

    $("shiftBtn")?.addEventListener(
      "click",
      handleShift
    );

    $("mobileShiftBtn")?.addEventListener(
      "click",
      handleShift
    );

    $("playAgainBtn")?.addEventListener(
      "click",
      () => {
        state.gameStarted = true;
        handleRestart();
      }
    );

    $("nextBtn")?.addEventListener(
      "click",
      () => {
        state.gameStarted = false;
        handleRestart();

        setTimeout(onLevelChange, 150);
      }
    );

    $("levelGrid")?.addEventListener(
      "click",
      (event) => {
        if (event.target.closest("button")) {
          setTimeout(onLevelChange, 50);
        }
      }
    );

    document.addEventListener(
      "keydown",
      (event) => {
        if (state.introOpen) {
          if (
            event.key === "Enter" ||
            event.key === " "
          ) {
            event.preventDefault();
            event.stopImmediatePropagation();
            nextIntroStep();
          }

          if (event.key === "Escape") {
            event.preventDefault();
            event.stopImmediatePropagation();
            closeIntro();
          }

          return;
        }

        if (
          event.key.toLowerCase() === "e" &&
          state.gameStarted
        ) {
          handleShift();
        }
      },
      true
    );

    // Prevent keyboard controls from affecting
    // the underlying game during the introduction.
    document.addEventListener(
      "keydown",
      (event) => {
        if (!state.introOpen) return;

        const keys = [
          "ArrowUp",
          "ArrowDown",
          "ArrowLeft",
          "ArrowRight",
          "w",
          "a",
          "s",
          "d",
          "e",
          "r"
        ];

        if (
          keys.includes(event.key) ||
          keys.includes(event.key.toLowerCase())
        ) {
          event.preventDefault();
          event.stopImmediatePropagation();
        }
      },
      true
    );
  }

  /* ========================================
     INITIALIZATION
  ======================================== */

  function init() {
    if (state.initialized) return;

    state.initialized = true;

    state.medals = loadMedals();

    syncLevel();
    updateMedalSummary();
    setupListeners();

    state.lastOverlayVisible =
      isOverlayVisible();

    // Polling is intentionally lightweight:
    // it reads only a few DOM values and does
    // not modify the original game engine.
    setInterval(monitorGame, 300);

    if (readStorage(KEYS.intro) !== "true") {
      setTimeout(() => openIntro(), 200);
    }

    console.log(
      `[ECHO//404] THE AWAKENING v${VERSION} ready`
    );
  }

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      init,
      { once: true }
    );
  } else {
    init();
  }

  // Small public interface for future upgrades.
  window.EchoAwakening = {
    version: VERSION,

    showMessage: showEcho,

    glitch: triggerGlitch,

    replayIntro() {
      openIntro(true);
    },

    getMedals() {
      return { ...state.medals };
    },

    resetIntro() {
      try {
        localStorage.removeItem(KEYS.intro);
      } catch (_) {}

      openIntro(true);
    },

    resetTutorial() {
      try {
        localStorage.removeItem(KEYS.tutorial);
      } catch (_) {}

      state.tutorialStep = 0;
    }
  };
})();
