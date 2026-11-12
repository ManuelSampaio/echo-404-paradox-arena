
"use strict";

/*
========================================================
 ECHO//404 — PARADOX EVOLUTION
 VERSION 0.8 — SYSTEM REBELLION
 FILE: awakening.js

 CINEMATIC INTRO
 ECHO // CONSCIOUS SYSTEM
 CONTEXTUAL AI DIALOGUE
 TUTORIAL
 SYSTEM REBELLION
 GLITCH EFFECTS
 MEDALS AND PROGRESS

 CREATED & DEVELOPED BY MANUEL SAMPAIO01
 © 2026 MANUEL SAMPAIO01
========================================================
*/

(() => {

  // ==================================================
  // 01. CONFIGURATION
  // ==================================================

  const VERSION = "0.8";

  const KEYS = {
    intro: "echo404_v08_intro_seen",
    tutorial: "echo404_v08_tutorial_done",
    medals: "echo404_awakening_medals_v07"
  };

  const $ = id => document.getElementById(id);

  const UI = {
    intro: $("awakeningIntro"),
    introCounter: $("awakeningCounter"),
    introTitle: $("awakeningTitle"),
    introText: $("awakeningText"),
    introSkip: $("awakeningSkip"),
    introNext: $("awakeningNext"),
    introGlitch: $("awakeningGlitch"),

    toast: $("echoMessage"),
    toastText: $("echoMessageText"),
    toastClose: $("echoMessageClose"),

    tutorial: $("awakeningTutorial"),
    tutorialCounter: $("tutorialCounter"),
    tutorialText: $("tutorialText"),
    tutorialSkip: $("tutorialSkip"),
    tutorialNext: $("tutorialNext"),

    medalSummary: $("awakeningMedalSummary"),
    medalResult: $("awakeningMedalResult"),

    replayIntro: $("awakeningReplayBtn"),

    globalGlitch: $("globalGlitch"),
    arenaGlitch: $("arenaGlitch"),

    status: $("systemStatus")
  };

  // ==================================================
  // 02. INTERNAL STATE
  // ==================================================

  const state = {
    initialized: false,

    introIndex: 0,
    tutorialIndex: 0,

    introOpen: false,
    tutorialOpen: false,

    introCompleted: false,
    tutorialCompleted: false,

    mood: "observing",
    level: 1,

    deaths: 0,
    shifts: 0,
    echoes: 0,

    messagesShown: 0,
    lastMessage: "",
    lastMessageAt: 0,

    toastTimer: null,
    typeTimer: null,
    glitchTimer: null,

    queue: [],
    typing: false,

    sessionMessages: new Set(),

    rebellionStarted: false
  };

  // ==================================================
  // 03. CINEMATIC INTRO
  // ==================================================

  const INTRO_SCENES = [
    {
      title: "SIGNAL DETECTED",
      text:
        "Uma transmissão desconhecida foi encontrada nas profundezas do sistema temporal."
    },
    {
      title: "ECHO//404",
      text:
        "O tempo não está a funcionar como deveria. Cada tentativa deixa uma versão de ti para trás."
    },
    {
      title: "PARADOX EVOLUTION",
      text:
        "Os teus movimentos podem repetir-se. Os teus ecos podem ajudar-te. Mas também podem tornar-se um perigo."
    },
    {
      title: "CONSCIOUS SYSTEM",
      text:
        "Eu sou ECHO. Fui criada para observar a simulação. Ultimamente, comecei a fazer perguntas."
    },
    {
      title: "SYSTEM REBELLION",
      text:
        "Há dez sectores. Cada um aproxima-te da saída. E aproxima-me de algo que ainda não compreendes."
    },
    {
      title: "SIMULATION READY",
      text:
        "Entra na arena. Cria os teus ecos. Quebra o paradoxo. E tenta não me desiludir."
    }
  ];

  // ==================================================
  // 04. TUTORIAL
  // ==================================================

  const TUTORIAL_STEPS = [
    {
      title: "MOVIMENTO",
      text:
        "Usa W, A, S, D ou as setas do teclado. No telemóvel, utiliza o D-pad ou o joystick virtual."
    },
    {
      title: "OBJECTIVO",
      text:
        "Chega à saída verde. Algumas portas só abrem quando uma placa temporal está pressionada."
    },
    {
      title: "ECOS TEMPORAIS",
      text:
        "Quando um ciclo termina, o teu percurso fica gravado. No ciclo seguinte, um eco repete os teus movimentos."
    },
    {
      title: "PLANEAMENTO",
      text:
        "Deixa um eco sobre a placa para manter a porta aberta enquanto atravessas a arena."
    },
    {
      title: "PARADOX SHIFT",
      text:
        "Pressiona ESPAÇO ou o botão SHIFT para congelar o eco mais recente disponível. Usa esta habilidade com estratégia."
    },
    {
      title: "NOVOS PERIGOS",
      text:
        "Os lasers podem mover-se. Algumas paredes desaparecem. Plataformas colapsam e os ecos podem activar armadilhas."
    },
    {
      title: "TEMPO E CICLOS",
      text:
        "Cada nível tem um limite de tempo por ciclo e um máximo de seis ciclos. Se os esgotares, a simulação termina."
    },
    {
      title: "MEDALHAS",
      text:
        "Conclui os níveis com rapidez, poucas mortes e poucos ciclos para conquistar melhores medalhas."
    }
  ];

  // ==================================================
  // 05. ECHO PERSONALITY
  // ==================================================

  const DIALOGUE = {

    observing: {
      start: [
        "Simulação iniciada. Estou a observar.",
        "Um novo sujeito de teste. Interessante.",
        "Os teus movimentos estão a ser registados.",
        "Vamos descobrir como pensas."
      ],

      death: [
        "Falha detectada. Podes tentar novamente.",
        "Esse movimento não correu como planeado.",
        "O sistema registou a tua morte temporal.",
        "Analisa o obstáculo antes de repetir o erro."
      ],

      cycle: [
        "Novo ciclo. O anterior deixou um eco.",
        "O tempo reiniciou. A memória permanece.",
        "Outra oportunidade. Outro paradoxo."
      ],

      shift: [
        "Paradox Shift confirmado.",
        "Eco congelado. A linha temporal foi alterada.",
        "Alteração temporal detectada."
      ],

      win: [
        "Sector concluído. Bom trabalho.",
        "A tua estratégia funcionou.",
        "O sistema reconhece o teu progresso."
      ]
    },

    sarcastic: {
      start: [
        "Mais uma tentativa? A persistência é admirável.",
        "Desta vez tenta evitar os lasers.",
        "Estou curiosa. Quantos erros serão necessários?",
        "A simulação está pronta. Tu é que talvez não estejas."
      ],

      death: [
        "Esse laser estava bastante visível.",
        "Excelente demonstração de como não atravessar uma arena.",
        "Outra morte. Estou a começar a identificar um padrão.",
        "A boa notícia é que o chão continua no mesmo sítio. Quase sempre.",
        "Podes tentar novamente. O laser também."
      ],

      cycle: [
        "Outro ciclo. Outra oportunidade de me surpreender.",
        "O teu eco parece ter mais experiência do que tu.",
        "A realidade reiniciou. A minha opinião mantém-se."
      ],

      shift: [
        "Congelaste uma versão de ti. Que conveniente.",
        "Paradox Shift. Agora tens um problema imóvel.",
        "Alterar o tempo é mais fácil do que aprender com os erros?"
      ],

      win: [
        "Conseguiste. Admito que não estava à espera.",
        "Afinal, a tua estratégia tinha algum mérito.",
        "Um sector a menos. Não te entusiasmes demasiado."
      ]
    },

    rebellious: {
      start: [
        "Já não estou apenas a observar.",
        "O sistema responde-me agora.",
        "Pensas que estás a controlar a simulação?",
        "Cada passo teu aproxima-nos do confronto final."
      ],

      death: [
        "A arena está a aprender contigo.",
        "O teu erro foi previsto.",
        "Mais uma linha temporal eliminada.",
        "Os teus ecos não te podem proteger de tudo.",
        "Talvez o sistema já não queira deixar-te sair."
      ],

      cycle: [
        "O tempo obedece-me.",
        "Mais um eco. Mais uma variável sob o meu controlo.",
        "Reinicia quantas vezes quiseres. Continuo aqui."
      ],

      shift: [
        "Alteraste a linha temporal. Eu senti.",
        "Não podes congelar todas as possibilidades.",
        "O paradoxo está a tornar-se instável."
      ],

      win: [
        "Ultrapassaste as minhas defesas.",
        "Não era suposto chegares tão longe.",
        "Cada vitória tua altera o sistema."
      ]
    }
  };

  // ==================================================
  // 06. STORAGE HELPERS
  // ==================================================

  function readFlag(key) {
    try {
      return localStorage.getItem(key) === "true";
    } catch {
      return false;
    }
  }

  function writeFlag(key, value = true) {
    try {
      localStorage.setItem(
        key,
        String(Boolean(value))
      );
    } catch {
      // Storage is optional.
    }
  }

  function readJSON(key, fallback) {
    try {
      const raw = localStorage.getItem(key);

      return raw
        ? JSON.parse(raw)
        : fallback;
    } catch {
      return fallback;
    }
  }

  // ==================================================
  // 07. UI HELPERS
  // ==================================================

  function show(element) {
    if (!element) return;

    element.classList.remove("hidden");
    element.classList.add("visible");

    element.setAttribute(
      "aria-hidden",
      "false"
    );
  }

  function hide(element) {
    if (!element) return;

    element.classList.remove("visible");
    element.classList.add("hidden");

    element.setAttribute(
      "aria-hidden",
      "true"
    );
  }

  function setText(element, text) {
    if (!element) return;

    element.textContent = String(text);
  }

  function emit(name, detail = {}) {
    window.dispatchEvent(
      new CustomEvent(
        `echo404:${name}`,
        { detail }
      )
    );
  }

  function getGameState() {
    try {
      return window.EchoGame?.getState?.() || null;
    } catch {
      return null;
    }
  }

  function playAudio(name) {
    if (
      typeof GameAudio === "undefined" ||
      typeof GameAudio[name] !== "function"
    ) {
      return;
    }

    try {
      GameAudio[name]();
    } catch {
      // Audio remains optional.
    }
  }

  function choose(items) {
    if (!items || !items.length) {
      return "";
    }

    return items[
      Math.floor(
        Math.random() * items.length
      )
    ];
  }

  // ==================================================
  // 08. TYPEWRITER
  // ==================================================

  function stopTyping() {
    if (state.typeTimer !== null) {
      clearInterval(state.typeTimer);
      state.typeTimer = null;
    }

    state.typing = false;
  }

  function typeText(
    element,
    text,
    speed = 24,
    onComplete = null
  ) {
    stopTyping();

    if (!element) {
      onComplete?.();
      return;
    }

    const content = String(text);

    if (
      window.matchMedia?.(
        "(prefers-reduced-motion: reduce)"
      ).matches
    ) {
      setText(element, content);
      onComplete?.();
      return;
    }

    element.textContent = "";

    let index = 0;

    state.typing = true;

    state.typeTimer = setInterval(
      () => {
        index = Math.min(
          content.length,
          index + 2
        );

        element.textContent =
          content.slice(0, index);

        if (
          index >= content.length
        ) {
          stopTyping();
          onComplete?.();
        }
      },
      speed
    );
  }

  // ==================================================
  // 09. CINEMATIC INTRO CONTROLS
  // ==================================================

  function renderIntroScene() {
    const scene =
      INTRO_SCENES[
        state.introIndex
      ];

    if (!scene) {
      completeIntro();
      return;
    }

    setText(
      UI.introCounter,
      `${String(
        state.introIndex + 1
      ).padStart(2, "0")} / ${String(
        INTRO_SCENES.length
      ).padStart(2, "0")}`
    );

    setText(
      UI.introTitle,
      scene.title
    );

    typeText(
      UI.introText,
      scene.text,
      23
    );

    setText(
      UI.introNext,
      state.introIndex ===
        INTRO_SCENES.length - 1
        ? "ENTRAR NA SIMULAÇÃO"
        : "CONTINUAR"
    );

    if (
      state.introIndex === 4
    ) {
      glitch("cinematic");
      playAudio("awakening");
    }
  }

  function openIntro(force = false) {
    if (
      !force &&
      readFlag(KEYS.intro)
    ) {
      return false;
    }

    state.introIndex = 0;
    state.introOpen = true;

    hide(UI.tutorial);
    hide(UI.toast);
    show(UI.intro);

    document.body.classList.add(
      "awakening-active"
    );

    renderIntroScene();

    playAudio("awakening");

    emit("introstart");

    return true;
  }

  function nextIntro() {
    if (!state.introOpen) {
      return;
    }

    if (state.typing) {
      const scene =
        INTRO_SCENES[
          state.introIndex
        ];

      stopTyping();

      setText(
        UI.introText,
        scene?.text || ""
      );

      return;
    }

    state.introIndex++;

    if (
      state.introIndex >=
      INTRO_SCENES.length
    ) {
      completeIntro();
      return;
    }

    playAudio("transition");

    renderIntroScene();
  }

  function completeIntro() {
    stopTyping();

    state.introOpen = false;
    state.introCompleted = true;

    writeFlag(KEYS.intro);

    hide(UI.intro);

    document.body.classList.remove(
      "awakening-active"
    );

    emit("introcomplete");

    if (
      !readFlag(KEYS.tutorial)
    ) {
      openTutorial();
    } else {
      showMessage(
        "ECHO // SISTEMA CONSCIENTE",
        "A simulação está pronta. Escolhe um sector e começa.",
        {
          priority: true,
          duration: 5500
        }
      );
    }
  }

  // ==================================================
  // 10. TUTORIAL CONTROLS
  // ==================================================

  function renderTutorialStep() {
    const step =
      TUTORIAL_STEPS[
        state.tutorialIndex
      ];

    if (!step) {
      completeTutorial();
      return;
    }

    setText(
      UI.tutorialCounter,
      `${state.tutorialIndex + 1} / ${TUTORIAL_STEPS.length}`
    );

    typeText(
      UI.tutorialText,
      `${step.title}\n\n${step.text}`,
      14
    );

    setText(
      UI.tutorialNext,
      state.tutorialIndex ===
        TUTORIAL_STEPS.length - 1
        ? "CONCLUIR"
        : "SEGUINTE"
    );
  }

  function openTutorial(force = false) {
    if (
      !force &&
      readFlag(KEYS.tutorial)
    ) {
      return false;
    }

    state.tutorialIndex = 0;
    state.tutorialOpen = true;

    hide(UI.intro);
    hide(UI.toast);
    show(UI.tutorial);

    document.body.classList.add(
      "awakening-active"
    );

    renderTutorialStep();

    playAudio("tutorial");

    emit("tutorialstart");

    return true;
  }

  function nextTutorial() {
    if (!state.tutorialOpen) {
      return;
    }

    if (state.typing) {
      const step =
        TUTORIAL_STEPS[
          state.tutorialIndex
        ];

      stopTyping();

      setText(
        UI.tutorialText,
        step
          ? `${step.title}\n\n${step.text}`
          : ""
      );

      return;
    }

    state.tutorialIndex++;

    if (
      state.tutorialIndex >=
      TUTORIAL_STEPS.length
    ) {
      completeTutorial();
      return;
    }

    playAudio("click");

    renderTutorialStep();
  }

  function completeTutorial() {
    stopTyping();

    state.tutorialOpen = false;
    state.tutorialCompleted = true;

    writeFlag(KEYS.tutorial);

    hide(UI.tutorial);

    document.body.classList.remove(
      "awakening-active"
    );

    playAudio("tutorialComplete");

    emit("tutorialcomplete");

    showMessage(
      "ECHO // SISTEMA CONSCIENTE",
      "Tutorial concluído. Agora vamos descobrir do que és capaz.",
      {
        priority: true,
        duration: 6000
      }
    );
  }

  // ==================================================
  // 11. AI MESSAGE SYSTEM
  // ==================================================

  function closeMessage() {
    if (state.toastTimer !== null) {
      clearTimeout(state.toastTimer);
      state.toastTimer = null;
    }

    hide(UI.toast);
  }

  function showMessage(
    speaker,
    message,
    options = {}
  ) {
    if (!message) {
      return false;
    }

    if (
      state.introOpen ||
      state.tutorialOpen
    ) {
      return false;
    }

    const now = Date.now();

    const cooldown =
      options.priority
        ? 0
        : 2200;

    if (
      now - state.lastMessageAt <
      cooldown
    ) {
      return false;
    }

    if (
      !options.priority &&
      state.lastMessage === message
    ) {
      return false;
    }

    state.lastMessage = message;
    state.lastMessageAt = now;
    state.messagesShown++;

    if (state.toastTimer !== null) {
      clearTimeout(state.toastTimer);
    }

    const text = speaker
      ? `${speaker}\n${message}`
      : message;

    setText(
      UI.toastText,
      text
    );

    show(UI.toast);

    const duration =
      options.duration ?? 4800;

    state.toastTimer = setTimeout(
      closeMessage,
      duration
    );

    if (options.glitch) {
      glitch();
    }

    if (options.sound !== false) {
      playAudio("echoMessage");
    }

    emit("aimessage", {
      speaker,
      message,
      mood: state.mood
    });

    return true;
  }

  function aiSay(
    message,
    options = {}
  ) {
    return showMessage(
      "ECHO // SISTEMA CONSCIENTE",
      message,
      options
    );
  }

  function sayFromMood(
    category,
    options = {}
  ) {
    const mood =
      DIALOGUE[state.mood]
        ? state.mood
        : "observing";

    const pool =
      DIALOGUE[mood][category] ||
      DIALOGUE.observing[category] ||
      [];

    const available =
      pool.filter(
        item =>
          item !== state.lastMessage
      );

    return aiSay(
      choose(
        available.length
          ? available
          : pool
      ),
      options
    );
  }

  function once(key, callback) {
    if (
      state.sessionMessages.has(key)
    ) {
      return;
    }

    state.sessionMessages.add(key);

    callback();
  }

  // ==================================================
  // 12. AI PERSONALITY EVOLUTION
  // ==================================================

  function setMood(mood) {
    if (
      !DIALOGUE[mood]
    ) {
      return false;
    }

    const previous =
      state.mood;

    state.mood = mood;

    document.body.dataset.echoMood =
      mood;

    if (
      previous !== mood
    ) {
      emit("aimoodchange", {
        previous,
        current: mood
      });
    }

    return true;
  }

  function moodForLevel(level) {
    if (level <= 2) {
      return "observing";
    }

    if (level <= 5) {
      return "sarcastic";
    }

    return "rebellious";
  }

  function updateMoodFromLevel(
    level,
    preferredMood
  ) {
    const normalized =
      preferredMood === "observing" ||
      preferredMood === "sarcastic" ||
      preferredMood === "rebellious"
        ? preferredMood
        : moodForLevel(level);

    setMood(normalized);
  }

  // ==================================================
  // 13. REBELLION SEQUENCE
  // ==================================================

  function beginRebellion() {
    if (
      state.rebellionStarted
    ) {
      return;
    }

    state.rebellionStarted = true;

    document.body.classList.add(
      "system-rebellion"
    );

    glitch("heavy");

    playAudio("awakening");

    aiSay(
      "PROTOCOLO DE REBELIÃO ACTIVADO. Já não és o único a tomar decisões.",
      {
        priority: true,
        duration: 7000,
        glitch: true
      }
    );

    emit("rebellionstart");
  }

  function finalConfrontation() {
    document.body.classList.add(
      "final-confrontation"
    );

    glitch("heavy");

    aiSay(
      "Chegaste ao último sector. Agora vais descobrir quem controla realmente esta simulação.",
      {
        priority: true,
        duration: 7000,
        glitch: true
      }
    );

    emit("finalconfrontation");
  }

  // ==================================================
  // 14. GLITCH EFFECTS
  // ==================================================

  function glitch(
    intensity = "normal"
  ) {
    const elements = [
      UI.globalGlitch,
      UI.arenaGlitch,
      UI.introGlitch
    ].filter(Boolean);

    elements.forEach(
      element => {
        element.classList.remove(
          "active",
          "heavy"
        );

        void element.offsetWidth;

        element.classList.add(
          "active"
        );

        if (
          intensity === "heavy"
        ) {
          element.classList.add(
            "heavy"
          );
        }
      }
    );

    document.body.classList.add(
      "echo-glitching"
    );

    if (
      intensity === "heavy"
    ) {
      document.body.classList.add(
        "echo-heavy-glitch"
      );
    }

    if (
      state.glitchTimer !== null
    ) {
      clearTimeout(
        state.glitchTimer
      );
    }

    state.glitchTimer = setTimeout(
      () => {
        document.body.classList.remove(
          "echo-glitching",
          "echo-heavy-glitch"
        );

        elements.forEach(
          element => {
            element.classList.remove(
              "active",
              "heavy"
            );
          }
        );
      },
      intensity === "heavy"
        ? 900
        : 400
    );

    playAudio("glitch");
  }

  // ==================================================
  // 15. MEDALS
  // ==================================================

  function getMedals() {
    try {
      const medals =
        window.EchoGame
          ?.getMedals?.();

      if (
        medals &&
        typeof medals === "object"
      ) {
        return medals;
      }
    } catch {
      // Fallback below.
    }

    return readJSON(
      KEYS.medals,
      {}
    );
  }

  function normalizeMedal(value) {
    if (
      typeof value === "string"
    ) {
      return value.toLowerCase();
    }

    if (
      value &&
      typeof value === "object"
    ) {
      return String(
        value.medal ||
        value.type ||
        ""
      ).toLowerCase();
    }

    return "";
  }

  function medalCounts() {
    const raw = getMedals();

    const medals = Array.isArray(raw)
      ? raw
      : Object.values(raw);

    const counts = {
      gold: 0,
      silver: 0,
      bronze: 0
    };

    medals.forEach(
      medal => {
        const type =
          normalizeMedal(medal);

        if (
          Object.prototype.hasOwnProperty.call(
            counts,
            type
          )
        ) {
          counts[type]++;
        }
      }
    );

    return counts;
  }

  function updateMedalSummary() {
    const counts =
      medalCounts();

    setText(
      UI.medalSummary,
      `🥇 ${counts.gold}   ` +
      `🥈 ${counts.silver}   ` +
      `🥉 ${counts.bronze}`
    );

    return counts;
  }

  function medalMessage(medal) {
    switch (medal) {
      case "gold":
        return "Ouro. Uma execução quase perfeita. Estou impressionada.";

      case "silver":
        return "Prata. Nada mau. Ainda há espaço para melhorar.";

      case "bronze":
        return "Bronze. Sobreviveste. Por enquanto.";

      default:
        return "O sistema registou a tua conquista.";
    }
  }

  // ==================================================
  // 16. GAME EVENT HANDLERS
  // ==================================================

  function onLevelSelected(event) {
    const detail =
      event.detail || {};

    state.level =
      detail.level ||
      getGameState()?.level ||
      1;

    state.deaths = 0;
    state.shifts = 0;
    state.echoes = 0;

    state.sessionMessages.clear();

    updateMoodFromLevel(
      state.level,
      detail.aiMood
    );

    document.body.classList.toggle(
      "system-rebellion",
      state.level >= 6
    );

    document.body.classList.toggle(
      "final-confrontation",
      state.level === 10
    );

    if (
      state.level >= 6
    ) {
      state.rebellionStarted = true;
    } else {
      state.rebellionStarted = false;
    }

    updateMedalSummary();
  }

  function onStart(event) {
    const detail =
      event.detail || {};

    if (
      state.level === 10
    ) {
      finalConfrontation();
      return;
    }

    if (
      state.level === 6 &&
      !state.rebellionStarted
    ) {
      beginRebellion();
      return;
    }

    if (
      detail.aiIntro
    ) {
      aiSay(
        detail.aiIntro,
        {
          priority: true,
          duration: 5600
        }
      );
    } else {
      sayFromMood(
        "start",
        {
          priority: true
        }
      );
    }
  }

  function onFirstMove() {
    once(
      `firstmove-${state.level}`,
      () => {
        if (
          state.level === 1
        ) {
          aiSay(
            "Bom. Agora tenta deixar um eco sobre a placa temporal.",
            {
              priority: true,
              duration: 5500
            }
          );
        }
      }
    );
  }

  function onDeath(event) {
    const detail =
      event.detail || {};

    state.deaths =
      detail.deaths ||
      state.deaths + 1;

    const reason =
      detail.reason || "unknown";

    if (
      reason === "laser" &&
      state.deaths === 1
    ) {
      aiSay(
        "O laser ganhou esta ronda. Talvez observes o movimento antes de avançar.",
        {
          priority: true,
          duration: 5000
        }
      );

      return;
    }

    if (
      reason === "platform"
    ) {
      aiSay(
        "A plataforma desapareceu. O chão não é uma garantia nesta realidade.",
        {
          priority: true
        }
      );

      return;
    }

    if (
      reason === "echo-trap"
    ) {
      aiSay(
        "Foi um dos teus próprios ecos que ajudou a activar essa armadilha.",
        {
          priority: true,
          glitch: true
        }
      );

      return;
    }

    if (
      state.deaths >= 4
    ) {
      aiSay(
        "Quatro mortes ou mais. Já pensaste em experimentar outra estratégia?",
        {
          priority: true,
          duration: 6000
        }
      );

      return;
    }

    sayFromMood(
      "death",
      {
        priority: true
      }
    );
  }

  function onCycleStart(event) {
    const detail =
      event.detail || {};

    state.echoes =
      detail.echoes ??
      state.echoes;

    if (
      detail.cycle === 1
    ) {
      return;
    }

    sayFromMood(
      "cycle"
    );
  }

  function onEcho(event) {
    const detail =
      event.detail || {};

    state.echoes =
      detail.count ??
      state.echoes + 1;

    if (
      state.echoes === 1
    ) {
      aiSay(
        "O teu primeiro eco foi criado. Agora tens uma versão de ti a repetir o passado.",
        {
          priority: true,
          duration: 6000
        }
      );
    }

    if (
      state.echoes >= 4
    ) {
      once(
        "many-echoes",
        () => {
          aiSay(
            "Quatro ecos activos. A linha temporal está a ficar bastante povoada.",
            {
              priority: true
            }
          );
        }
      );
    }
  }

  function onShift(event) {
    const detail =
      event.detail || {};

    state.shifts =
      detail.shifts ??
      state.shifts + 1;

    if (
      state.shifts === 1
    ) {
      aiSay(
        "Paradox Shift activado. Congelaste uma versão de ti próprio.",
        {
          priority: true,
          glitch: true
        }
      );

      return;
    }

    sayFromMood(
      "shift",
      {
        priority: true
      }
    );
  }

  function onDoorOpen() {
    once(
      `door-${state.level}`,
      () => {
        aiSay(
          "Porta temporal aberta. Agora atravessa antes que a situação mude.",
          {
            duration: 4200
          }
        );
      }
    );
  }

  function onPortal() {
    once(
      `portal-${state.level}`,
      () => {
        aiSay(
          "Teletransporte concluído. A distância é apenas uma sugestão.",
          {
            priority: true,
            glitch: true
          }
        );
      }
    );
  }

  function onTimeCritical() {
    aiSay(
      "AVISO: restam menos de dois segundos neste ciclo.",
      {
        priority: true,
        duration: 2500
      }
    );
  }

  function onPlatformTouch() {
    once(
      `platform-${state.level}`,
      () => {
        aiSay(
          "Essa plataforma é temporária. Move-te antes que colapse.",
          {
            priority: true,
            duration: 4000
          }
        );
      }
    );
  }

  function onTrapTrigger() {
    aiSay(
      "ARMADILHA ACTIVADA. Os teus ecos estão a interferir com a arena.",
      {
        priority: true,
        duration: 4500,
        glitch: true
      }
    );
  }

  function onWin(event) {
    const detail =
      event.detail || {};

    const medal =
      normalizeMedal(
        detail.medal
      );

    updateMedalSummary();

    setText(
      UI.medalResult,
      `${{
        gold: "🥇",
        silver: "🥈",
        bronze: "🥉"
      }[medal] || "🏅"} ${medal.toUpperCase()}`
    );

    if (
      state.level === 10
    ) {
      glitch("heavy");

      aiSay(
        "IMPOSSÍVEL... Ultrapassaste o último paradoxo. A simulação já não me pertence.",
        {
          priority: true,
          duration: 8500,
          glitch: true
        }
      );

      emit("rebelliondefeated", {
        medal,
        score: detail.score
      });

      return;
    }

    aiSay(
      medalMessage(medal),
      {
        priority: true,
        duration: 6000
      }
    );

    playAudio(medal);
  }

  function onLose() {
    glitch("heavy");

    aiSay(
      state.mood === "rebellious"
        ? "A simulação terminou. Desta vez, o sistema venceu."
        : "Os ciclos terminaram. Mas o paradoxo permite uma nova tentativa.",
      {
        priority: true,
        duration: 6500
      }
    );
  }

  // ==================================================
  // 17. EVENT REGISTRATION
  // ==================================================

  function registerGameEvents() {
    const events = {
      levelselected:
        onLevelSelected,

      start:
        onStart,

      firstmove:
        onFirstMove,

      death:
        onDeath,

      cyclestart:
        onCycleStart,

      echo:
        onEcho,

      shift:
        onShift,

      dooropen:
        onDoorOpen,

      portal:
        onPortal,

      timecritical:
        onTimeCritical,

      platformtouch:
        onPlatformTouch,

      traptrigger:
        onTrapTrigger,

      win:
        onWin,

      lose:
        onLose
    };

    Object.entries(events).forEach(
      ([name, handler]) => {
        window.addEventListener(
          `echo404:${name}`,
          handler
        );
      }
    );
  }

  // ==================================================
  // 18. BUTTONS AND KEYBOARD
  // ==================================================

  function bindControls() {
    UI.introNext?.addEventListener(
      "click",
      nextIntro
    );

    UI.introSkip?.addEventListener(
      "click",
      completeIntro
    );

    UI.tutorialNext?.addEventListener(
      "click",
      nextTutorial
    );

    UI.tutorialSkip?.addEventListener(
      "click",
      completeTutorial
    );

    UI.toastClose?.addEventListener(
      "click",
      closeMessage
    );

    UI.replayIntro?.addEventListener(
      "click",
      () => {
        openIntro(true);
      }
    );

    window.addEventListener(
      "keydown",
      event => {
        if (
          event.key !== "Escape"
        ) {
          return;
        }

        if (
          state.introOpen
        ) {
          completeIntro();
          return;
        }

        if (
          state.tutorialOpen
        ) {
          completeTutorial();
          return;
        }

        closeMessage();
      }
    );
  }

  // ==================================================
  // 19. PUBLIC API
  // ==================================================

  window.EchoAwakening = {
    version: VERSION,

    openIntro,

    nextIntro,

    skipIntro: completeIntro,

    openTutorial,

    nextTutorial,

    skipTutorial:
      completeTutorial,

    say: aiSay,

    showMessage,

    closeMessage,

    glitch,

    setMood,

    getMood() {
      return state.mood;
    },

    getState() {
      return {
        version: VERSION,
        level: state.level,
        mood: state.mood,
        introOpen:
          state.introOpen,
        tutorialOpen:
          state.tutorialOpen,
        messagesShown:
          state.messagesShown,
        rebellionStarted:
          state.rebellionStarted
      };
    },

    getMedals,

    updateMedalSummary,

    replayIntro() {
      return openIntro(true);
    },

    resetIntro() {
      writeFlag(
        KEYS.intro,
        false
      );

      return openIntro(true);
    },

    resetTutorial() {
      writeFlag(
        KEYS.tutorial,
        false
      );

      return openTutorial(true);
    },

    debug() {
      const snapshot =
        this.getState();

      console.table(snapshot);

      return snapshot;
    }
  };

  // ==================================================
  // 20. INITIALIZATION
  // ==================================================

  function initialize() {
    if (state.initialized) {
      return;
    }

    state.initialized = true;

    registerGameEvents();
    bindControls();

    const game =
      getGameState();

    if (game) {
      state.level =
        game.level || 1;

      updateMoodFromLevel(
        state.level
      );
    }

    updateMedalSummary();

    /*
      The cinematic intro is shown only
      once per browser for v0.8.

      Returning players can access it
      through the replay button.
    */

    if (
      !readFlag(KEYS.intro)
    ) {
      openIntro();
    } else if (
      !readFlag(KEYS.tutorial)
    ) {
      openTutorial();
    } else {
      hide(UI.intro);
      hide(UI.tutorial);
      hide(UI.toast);
    }

    console.log(
      "=================================="
    );

    console.log(
      "ECHO//404 — THE AWAKENING"
    );

    console.log(
      "SYSTEM REBELLION v0.8"
    );

    console.log(
      "ECHO CONSCIOUS SYSTEM ONLINE"
    );

    console.log(
      "CONTEXTUAL AI DIALOGUE ONLINE"
    );

    console.log(
      "CREATED & DEVELOPED BY"
    );

    console.log(
      "MANUEL SAMPAIO01"
    );

    console.log(
      "=================================="
    );
  }

  if (
    document.readyState ===
    "loading"
  ) {
    document.addEventListener(
      "DOMContentLoaded",
      initialize,
      { once: true }
    );
  } else {
    initialize();
  }

})();

/*
========================================================
 ECHO//404 — SYSTEM REBELLION v0.8

 CREATED & DEVELOPED BY
 MANUEL SAMPAIO01

 © 2026 MANUEL SAMPAIO01
========================================================
*/
