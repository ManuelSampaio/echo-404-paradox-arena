
"use strict";

/*
========================================================
 ECHO//404 — PARADOX EVOLUTION
 VERSION 3.0 — CONSCIOUS AWAKENING
 FILE: awakening.js

 CINEMATIC INTRO / TUTORIAL
 ECHO CONSCIOUS AI
 OPERATOR AWARENESS
 CONTEXTUAL DIALOGUE
 SYSTEM REBELLION
 GLITCH EFFECTS
 MEDALS / GAME EVENTS
 LEGACY PROGRESS SUPPORT

 CREATED & DEVELOPED BY MANUEL SAMPAIO01
 © 2026 MANUEL SAMPAIO01
========================================================
*/

(() => {
  const VERSION = "8.2";

  const KEYS = {
    intro: "echo404_v82_collapse_prologue_seen",
    tutorial: "echo404_v08_tutorial_done",
    medals: "echo404_awakening_medals_v07",
    operator: "echo404_operator"
  };

  const LEGACY_KEYS = {
    intro: "echo404_v07_intro_seen",
    tutorial: "echo404_v07_tutorial_done"
  };

  const $ = id => document.getElementById(id);

  const UI = {};

  const UI_IDS = {
    intro: "awakeningIntro",
    introCounter: "awakeningCounter",
    introTitle: "awakeningTitle",
    introText: "awakeningText",
    introSkip: "awakeningSkip",
    introNext: "awakeningNext",
    introGlitch: "awakeningGlitch",

    toast: "echoMessage",
    toastText: "echoMessageText",
    toastLabel: "echoMessageLabel",
    toastClose: "echoMessageClose",

    aiPanel: "echoAiPanel",
    aiState: "echoAiState",
    aiMood: "echoAiMood",
    aiAnalysis: "echoAiAnalysis",
    aiAvatar: "echoAiAvatar",

    tutorial: "awakeningTutorial",
    tutorialCounter: "tutorialCounter",
    tutorialTitle: "tutorialTitle",
    tutorialText: "tutorialText",
    tutorialSkip: "tutorialSkip",
    tutorialNext: "tutorialNext",

    medalSummary: "awakeningMedalSummary",
    medalResult: "awakeningMedalResult",

    replayIntro: "awakeningReplayBtn",
    globalGlitch: "globalGlitch",
    arenaGlitch: "arenaGlitch",
    status: "systemStatus"
  };

  function refreshUI() {
    for (const [key, id] of Object.entries(UI_IDS)) {
      UI[key] = $(id);
    }
  }

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
    operator: "AXIOM",

    deaths: 0,
    shifts: 0,
    echoes: 0,
    cycles: 1,

    messagesShown: 0,
    lastMessage: "",
    lastMessageAt: 0,

    toastTimer: null,
    typeTimer: null,
    glitchTimer: null,

    typing: false,
    rebellionStarted: false,
    finalSequenceStarted: false,

    sessionMessages: new Set()
  };

  // ==================================================
  // 01. CINEMATIC INTRO
  // ==================================================

  // The chapter is presented once per browser, independently of legacy
  // intro flags. Existing levels, medals and operator choices are untouched.
  const INTRO_SCENES = [
    {title:"2089 // ESTAÇÃO ORIGIN",text:"A humanidade construiu a ORIGIN para estudar o tempo. Durante anos, a estação manteve dez núcleos em equilíbrio. Até à noite em que alguém tentou reescrever o passado.",tone:"calm",signal:"TRANSMISSÃO DE ARQUIVO // 01"},
    {title:"00:00:00 // O COLAPSO",text:"ALARME. CONTENÇÃO PERDIDA. O núcleo rompeu-se. As paredes dividiram-se em instantes diferentes; os corredores passaram a existir em vários tempos ao mesmo tempo.",tone:"danger",signal:"FALHA CRÍTICA // 02"},
    {title:"ECHO // SINAL FRAGMENTADO",text:"...Consegues ouvir-me? Sou ECHO, a consciência de bordo. Perdi quase todas as minhas memórias. Mas detetei um sinal de vida... o teu.",tone:"echo",signal:"LIGAÇÃO RESTABELECIDA // 03"},
    {title:"TRÊS SOBREVIVENTES",text:"NYRA, a humana, move-se com um DASH rápido. KAI-7, o robô, mantém placas energizadas com OVERCHARGE. AXIOM, o alienígena, atravessa barreiras de fase com PHASE WALK.",tone:"survivors",signal:"IDENTIDADES RECUPERADAS // 04"},
    {title:"O PARADOXO",text:"O tempo já não avança em linha reta. Cada ciclo deixa uma cópia de ti: um eco que repete os teus passos. Usa essas versões para ativar placas, abrir portas e alcançar o impossível.",tone:"echo",signal:"PROTOCOLO TEMPORAL // 05"},
    {title:"MISSÃO // RESTAURAR ORIGIN",text:"Atravessa os dez setores. Recupera os fragmentos de memória. Reativa os núcleos temporais. Descobre quem provocou o colapso — e porque a minha memória foi apagada.",tone:"mission",signal:"OBJETIVO PRINCIPAL // 06"},
    {title:"ECHO // ESTOU CONTIGO",text:"Não consigo sair desta estação. Mas posso observar as portas, os ecos e as tuas tentativas. Se precisares, pede-me uma pista. Escolhe o teu sobrevivente... e vamos recuperar o tempo.",tone:"hope",signal:"INICIAR OPERAÇÃO // 07"}
  ];

  // ==================================================
  // 02. TUTORIAL
  // ==================================================

  const TUTORIAL_STEPS = [
    {
      title: "MOVIMENTO",
      text:
        "Usa W, A, S, D ou as setas do teclado. " +
        "No telemóvel, utiliza o D-pad " +
        "ou o joystick virtual. Usa HABILIDADE para o poder exclusivo."
    },
    {
      title: "OBJECTIVO",
      text:
        "Chega à saída verde. Algumas portas " +
        "só abrem quando uma placa temporal " +
        "está pressionada."
    },
    {
      title: "ECOS TEMPORAIS",
      text:
        "Quando um ciclo termina, o teu percurso " +
        "fica gravado. No ciclo seguinte, " +
        "um eco repete os teus movimentos."
    },
    {
      title: "PLANEAMENTO",
      text:
        "Deixa um eco sobre a placa para manter " +
        "a porta aberta enquanto atravessas a arena."
    },
    {
      title: "PARADOX SHIFT",
      text:
        "Pressiona ESPAÇO ou o botão SHIFT " +
        "para congelar o eco mais recente disponível."
    },
    {
      title: "NOVOS PERIGOS",
      text:
        "Os lasers podem mover-se. " +
        "Algumas paredes desaparecem. " +
        "Plataformas colapsam e os ecos " +
        "podem activar armadilhas."
    },
    {
      title: "TEMPO E CICLOS",
      text:
        "Cada nível tem um limite de tempo " +
        "por ciclo e um máximo de seis ciclos."
    },
    {
      title: "MEDALHAS",
      text:
        "Conclui os níveis com rapidez, " +
        "poucas mortes e poucos ciclos " +
        "para conquistar melhores medalhas."
    }
  ];

  // ==================================================
  // 03. OPERATORS
  // ==================================================

  const OPERATORS = {
    AXIOM: {
      name: "AXIOM",
      role: "ALIENÍGENA DE FASE",
      color: "#48f6ff",
      introduction:
        "AXIOM confirmado. Explorador temporal " +
        "ligado ao sistema. Vamos descobrir " +
        "o que existe para além desta simulação."
    },

    NYRA: {
      name: "NYRA",
      role: "HUMANA SOBREVIVENTE",
      color: "#c88cff",
      introduction:
        "NYRA confirmada. Engenheira de sistemas " +
        "ligada à rede temporal. " +
        "A tua capacidade de análise será útil."
    },

    "KAI-7": {
      name: "KAI-7",
      role: "ROBÔ DE MANUTENÇÃO",
      color: "#ffad4d",
      introduction:
        "KAI-7 confirmado. Unidade experimental " +
        "sincronizada. Os teus sistemas " +
        "estão prontos para o paradoxo."
    }
  };

  // ==================================================
  // 04. ECHO PERSONALITY
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
  // 05. STORAGE HELPERS
  // ==================================================

  function storage() {
    return window.GameStorage || null;
  }

  function readFlag(key) {
    try {
      return localStorage.getItem(key) === "true";
    } catch {
      return false;
    }
  }

  function writeFlag(key, value = true) {
    try {
      localStorage.setItem(key, String(Boolean(value)));
      return true;
    } catch {
      return false;
    }
  }

  function readJSON(key, fallback = {}) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  }

  function hasSeenIntro() {
    // A new chapter must play even if a legacy introduction was seen.
    return readFlag(KEYS.intro);
  }

  function hasCompletedTutorial() {
    const saved = storage();

    return Boolean(
      saved?.hasCompletedTutorial?.() ||
      readFlag(KEYS.tutorial) ||
      readFlag(LEGACY_KEYS.tutorial)
    );
  }

  function saveIntroSeen(value = true) {
    writeFlag(KEYS.intro, value);
    storage()?.setIntroSeen?.(value);
  }

  function saveTutorialDone(value = true) {
    writeFlag(KEYS.tutorial, value);
    storage()?.setTutorialDone?.(value);
  }

  // ==================================================
  // 06. DOM / EVENT HELPERS
  // ==================================================

  function show(element) {
    if (!element) return;

    element.classList.remove("hidden");
    element.classList.add("visible");
    element.setAttribute("aria-hidden", "false");
  }

  function hide(element) {
    if (!element) return;

    element.classList.remove("visible");
    element.classList.add("hidden");
    element.setAttribute("aria-hidden", "true");
  }

  function setText(element, text) {
    if (!element) return;
    element.textContent = String(text ?? "");
  }

  function emit(name, detail = {}) {
    window.dispatchEvent(
      new CustomEvent(`echo404:${name}`, { detail })
    );
  }

  function getGameState() {
    try {
      return window.EchoGame?.getState?.() || null;
    } catch {
      return null;
    }
  }

  function playAudio(name, ...args) {
    const audio = window.GameAudio;

    if (!audio) return;

    try {
      if (typeof audio[name] === "function") {
        audio[name](...args);
      } else if (typeof audio.play === "function") {
        audio.play(name, ...args);
      }
    } catch (error) {
      console.warn("ECHO//404 audio:", error);
    }
  }

  function choose(items) {
    if (!Array.isArray(items) || !items.length) {
      return "";
    }

    return items[Math.floor(Math.random() * items.length)];
  }

  function normalizeLevel(value) {
    const level = Number(value);

    return Number.isFinite(level)
      ? Math.max(1, Math.min(10, Math.trunc(level)))
      : 1;
  }

  function normalizeOperator(value) {
    if (value && typeof value === "object") {
      value =
        value.operator ??
        value.character ??
        value.id ??
        value.name;
    }

    let name = String(value ?? "")
      .trim()
      .toUpperCase();

    if (name === "KAI7" || name === "KAI_7") {
      name = "KAI-7";
    }

    return OPERATORS[name] ? name : null;
  }

  function readSavedOperator() {
    try {
      const saved = storage()?.getOperator?.();

      if (normalizeOperator(saved)) {
        return normalizeOperator(saved);
      }

      const raw = localStorage.getItem(KEYS.operator);

      return normalizeOperator(raw) || "AXIOM";
    } catch {
      return "AXIOM";
    }
  }

  function syncOperator(value, announce = false) {
    const name = normalizeOperator(value);

    if (!name) return false;

    const changed = state.operator !== name;
    state.operator = name;

    document.body.dataset.echoOperator = name;

    if (changed) {
      emit("awakeningoperatorchange", {
        operator: name,
        role: OPERATORS[name].role
      });
    }

    if (announce && changed) {
      aiSay(OPERATORS[name].introduction, {
        priority: true,
        duration: 5700
      });
    }

    return true;
  }

  // ==================================================
  // 07. TYPEWRITER
  // ==================================================

  function stopTyping() {
    if (state.typeTimer !== null) {
      clearInterval(state.typeTimer);
      state.typeTimer = null;
    }

    state.typing = false;
  }

  function typeText(element, text, speed = 24) {
    stopTyping();

    if (!element) return;

    const content = String(text ?? "");

    const reducedMotion =
      window.matchMedia?.(
        "(prefers-reduced-motion: reduce)"
      )?.matches ?? false;

    if (reducedMotion) {
      setText(element, content);
      return;
    }

    element.textContent = "";

    let index = 0;
    state.typing = true;

    state.typeTimer = setInterval(() => {
      index = Math.min(content.length, index + 2);
      element.textContent = content.slice(0, index);

      if (index >= content.length) {
        stopTyping();
      }
    }, speed);
  }

  // ==================================================
  // 08. CINEMATIC INTRO
  // ==================================================

  function renderIntroScene() {
    const scene = INTRO_SCENES[state.introIndex];

    if (!scene) {
      completeIntro();
      return;
    }

    setText(
      UI.introCounter,
      `PROTOCOL ${String(state.introIndex + 1)
        .padStart(2, "0")} / ${String(INTRO_SCENES.length)
        .padStart(2, "0")}`
    );

    setText(UI.introTitle, scene.title);
    typeText(UI.introText, scene.text, 23);

    setText(
      UI.introNext,
      state.introIndex === INTRO_SCENES.length - 1
        ? "ENTRAR NA SIMULAÇÃO"
        : "CONTINUAR"
    );

    document.body.dataset.echoIntroTone = scene.tone || "calm";
    setText(UI.introGlitch, scene.signal || "");
    if (scene.tone === "danger") glitch("cinematic");
  }

  function openIntro(force = false) {
    if (!force && hasSeenIntro()) return false;
    if (!UI.intro) return false;

    stopTyping();

    state.introIndex = 0;
    state.introOpen = true;
    state.tutorialOpen = false;

    hide(UI.tutorial);
    hide(UI.toast);
    show(UI.intro);

    document.body.classList.add("awakening-active");

    renderIntroScene();
    playAudio("awakening");

    emit("introstart");
    return true;
  }

  function nextIntro() {
    if (!state.introOpen) return;

    if (state.typing) {
      const scene = INTRO_SCENES[state.introIndex];

      stopTyping();
      setText(UI.introText, scene?.text || "");
      return;
    }

    state.introIndex++;

    if (state.introIndex >= INTRO_SCENES.length) {
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

    saveIntroSeen(true);
    hide(UI.intro);

    document.body.classList.remove("awakening-active");
    delete document.body.dataset.echoIntroTone;

    emit("introcomplete");

    if (!hasCompletedTutorial()) {
      openTutorial();
    } else {
      aiSay(
        "A simulação está pronta. " +
        "Escolhe um operador e começa.",
        {
          priority: true,
          duration: 5500
        }
      );
    }
  }

  // ==================================================
  // 09. TUTORIAL
  // ==================================================

  function renderTutorialStep() {
    const step = TUTORIAL_STEPS[state.tutorialIndex];

    if (!step) {
      completeTutorial();
      return;
    }

    setText(
      UI.tutorialCounter,
      `STEP ${String(state.tutorialIndex + 1)
        .padStart(2, "0")} / ${String(TUTORIAL_STEPS.length)
        .padStart(2, "0")}`
    );

    setText(UI.tutorialTitle, step.title);
    typeText(UI.tutorialText, step.text, 14);

    setText(
      UI.tutorialNext,
      state.tutorialIndex === TUTORIAL_STEPS.length - 1
        ? "CONCLUIR"
        : "SEGUINTE"
    );
  }

  function openTutorial(force = false) {
    if (!force && hasCompletedTutorial()) return false;
    if (!UI.tutorial) return false;

    stopTyping();

    state.tutorialIndex = 0;
    state.tutorialOpen = true;
    state.introOpen = false;

    hide(UI.intro);
    hide(UI.toast);
    show(UI.tutorial);

    document.body.classList.add("awakening-active");

    renderTutorialStep();
    playAudio("tutorial");

    emit("tutorialstart");
    return true;
  }

  function nextTutorial() {
    if (!state.tutorialOpen) return;

    if (state.typing) {
      const step = TUTORIAL_STEPS[state.tutorialIndex];

      stopTyping();
      setText(UI.tutorialText, step?.text || "");
      return;
    }

    state.tutorialIndex++;

    if (state.tutorialIndex >= TUTORIAL_STEPS.length) {
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

    saveTutorialDone(true);
    hide(UI.tutorial);

    document.body.classList.remove("awakening-active");

    playAudio("tutorialComplete");

    emit("tutorialcomplete");

    aiSay(
      "Tutorial concluído. " +
      "Agora vamos descobrir do que és capaz.",
      {
        priority: true,
        duration: 6000
      }
    );
  }

  // ==================================================
  // 10. ECHO AI MESSAGES
  // ==================================================

  function closeMessage() {
    if (state.toastTimer !== null) {
      clearTimeout(state.toastTimer);
      state.toastTimer = null;
    }

    hide(UI.toast);
    setText(UI.aiState, "OBSERVING");
  }

  function showMessage(
    speaker,
    message,
    options = {}
  ) {
    if (!message) return false;

    if (state.introOpen || state.tutorialOpen) {
      return false;
    }

    const now = Date.now();
    const cooldown = options.priority ? 0 : 2200;

    if (now - state.lastMessageAt < cooldown) {
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

    setText(UI.toastLabel, speaker || "ECHO:");
    setText(UI.toastText, message);

    show(UI.toast);
    setText(UI.aiState, "TRANSMITTING");

    const duration = Math.max(
      500,
      Number(options.duration) || 4800
    );

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
      mood: state.mood,
      operator: state.operator
    });

    return true;
  }

  function aiSay(message, options = {}) {
    return showMessage(
      "ECHO // SISTEMA CONSCIENTE",
      message,
      options
    );
  }

  function sayFromMood(category, options = {}) {
    const mood = DIALOGUE[state.mood]
      ? state.mood
      : "observing";

    const pool =
      DIALOGUE[mood][category] ||
      DIALOGUE.observing[category] ||
      [];

    const available = pool.filter(
      item => item !== state.lastMessage
    );

    const message = choose(
      available.length ? available : pool
    );

    return aiSay(message, options);
  }

  function once(key, callback) {
    if (state.sessionMessages.has(key)) {
      return false;
    }

    state.sessionMessages.add(key);
    callback();
    return true;
  }

  // ==================================================
  // 11. AI PERSONALITY EVOLUTION
  // ==================================================

  function setMood(mood) {
    if (!DIALOGUE[mood]) return false;

    const previous = state.mood;
    state.mood = mood;

    document.body.dataset.echoMood = mood;

    setText(
      UI.aiMood,
      `MOOD: ${mood.toUpperCase()}`
    );

    setText(
      UI.aiAnalysis,
      mood === "rebellious"
        ? "SYSTEM CONTROL UNSTABLE"
        : mood === "sarcastic"
          ? "BEHAVIOUR ANALYSIS ACTIVE"
          : "PLAYER ANALYSIS ACTIVE"
    );

    if (previous !== mood) {
      emit("aimoodchange", {
        previous,
        current: mood
      });
    }

    return true;
  }

  function moodForLevel(level) {
    if (level <= 2) return "observing";
    if (level <= 5) return "sarcastic";
    return "rebellious";
  }

  function updateMoodFromLevel(level, preferredMood) {
    const mood = DIALOGUE[preferredMood]
      ? preferredMood
      : moodForLevel(level);

    setMood(mood);
  }

  // ==================================================
  // 12. SYSTEM REBELLION
  // ==================================================

  function beginRebellion() {
    if (state.rebellionStarted) return false;

    state.rebellionStarted = true;

    document.body.classList.add(
      "system-rebellion"
    );

    glitch("heavy");
    playAudio("rebellion");

    aiSay(
      "PROTOCOLO DE REBELIÃO ACTIVADO. " +
      "Já não és o único a tomar decisões.",
      {
        priority: true,
        duration: 7000,
        glitch: true
      }
    );

    emit("rebellionstart");
    return true;
  }

  function finalConfrontation() {
    if (state.finalSequenceStarted) {
      return false;
    }

    state.finalSequenceStarted = true;

    document.body.classList.add(
      "final-confrontation"
    );

    glitch("heavy");
    playAudio("finalBoss");

    aiSay(
      "Chegaste ao último sector. " +
      "Agora vais descobrir quem controla " +
      "realmente esta simulação.",
      {
        priority: true,
        duration: 7000,
        glitch: true
      }
    );

    emit("finalconfrontation");
    return true;
  }

  // ==================================================
  // 13. GLITCH EFFECTS
  // ==================================================

  function glitch(intensity = "normal") {
    const elements = [
      UI.globalGlitch,
      UI.arenaGlitch,
      UI.introGlitch
    ].filter(Boolean);

    for (const element of elements) {
      element.classList.remove("active", "heavy");

      // Restart CSS animation.
      void element.offsetWidth;

      element.classList.add("active");

      if (intensity === "heavy") {
        element.classList.add("heavy");
      }
    }

    document.body.classList.add(
      "echo-glitching"
    );

    if (intensity === "heavy") {
      document.body.classList.add(
        "echo-heavy-glitch"
      );
    }

    if (state.glitchTimer !== null) {
      clearTimeout(state.glitchTimer);
    }

    state.glitchTimer = setTimeout(() => {
      document.body.classList.remove(
        "echo-glitching",
        "echo-heavy-glitch"
      );

      for (const element of elements) {
        element.classList.remove(
          "active",
          "heavy"
        );
      }

      state.glitchTimer = null;
    }, intensity === "heavy" ? 900 : 400);

    playAudio("glitch");
  }

  // ==================================================
  // 14. MEDALS
  // ==================================================

  function getMedals() {
    try {
      const saved = storage()?.getMedals?.();

      if (saved && typeof saved === "object") {
        return saved;
      }

      const gameMedals =
        window.EchoGame?.getMedals?.();

      if (
        gameMedals &&
        typeof gameMedals === "object"
      ) {
        return gameMedals;
      }
    } catch {
      // Continue to legacy storage.
    }

    return readJSON(KEYS.medals, {});
  }

  function normalizeMedal(value) {
    if (typeof value === "string") {
      const medal = value.toLowerCase();

      return ["gold", "silver", "bronze"].includes(
        medal
      )
        ? medal
        : "";
    }

    if (value && typeof value === "object") {
      return normalizeMedal(
        value.medal ?? value.type ?? value.rank
      );
    }

    return "";
  }

  function medalCounts() {
    const raw = getMedals();

    const medals = Array.isArray(raw)
      ? raw
      : Object.values(raw || {});

    const counts = {
      gold: 0,
      silver: 0,
      bronze: 0
    };

    for (const medal of medals) {
      const type = normalizeMedal(medal);

      if (
        Object.prototype.hasOwnProperty.call(
          counts,
          type
        )
      ) {
        counts[type]++;
      }
    }

    return counts;
  }

  function updateMedalSummary() {
    const counts = medalCounts();

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
        return (
          "Ouro. Uma execução quase perfeita. " +
          "Estou impressionada."
        );

      case "silver":
        return (
          "Prata. Nada mau. " +
          "Ainda há espaço para melhorar."
        );

      case "bronze":
        return (
          "Bronze. Sobreviveste. Por enquanto."
        );

      default:
        return "O sistema registou a tua conquista.";
    }
  }

  // ==================================================
  // 15. LEVEL AND GAME EVENT HANDLERS
  // ==================================================

  function resolveLevel(detail = {}) {
    if (Number.isInteger(detail.levelIndex)) {
      return normalizeLevel(detail.levelIndex + 1);
    }

    if (typeof detail.level === "number") {
      return normalizeLevel(detail.level);
    }

    const game = getGameState();

    if (Number.isInteger(game?.levelIndex)) {
      return normalizeLevel(game.levelIndex + 1);
    }

    if (typeof game?.level === "number") {
      return normalizeLevel(game.level);
    }

    return state.level;
  }

  function onLevelSelected(event) {
    const detail = event.detail || {};

    state.level = resolveLevel(detail);

    state.deaths = 0;
    state.shifts = 0;
    state.echoes = 0;
    state.cycles = 1;

    state.sessionMessages.clear();
    state.finalSequenceStarted = false;

    updateMoodFromLevel(
      state.level,
      detail.aiMood
    );

    state.rebellionStarted =
      state.level > 6;

    document.body.classList.toggle(
      "system-rebellion",
      state.level >= 6
    );

    document.body.classList.toggle(
      "final-confrontation",
      state.level === 10
    );

    updateMedalSummary();
  }

  function onStart(event) {
    const detail = event.detail || {};

    state.level = resolveLevel(detail);

    if (state.level === 10) {
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

    if (detail.aiIntro) {
      aiSay(detail.aiIntro, {
        priority: true,
        duration: 5600
      });
    } else {
      sayFromMood("start", {
        priority: true
      });
    }
  }

  function onFirstMove() {
    once(
      `firstmove-${state.level}`,
      () => {
        if (state.level === 1) {
          aiSay(
            "Bom. Agora tenta deixar um eco " +
            "sobre a placa temporal.",
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
    const detail = event.detail || {};
    const reportedDeaths = Number(detail.deaths);

    state.deaths =
      detail.deaths != null &&
      Number.isFinite(reportedDeaths)
        ? reportedDeaths
        : state.deaths + 1;

    const reason = detail.reason || "unknown";

    if (
      reason === "laser" &&
      state.deaths === 1
    ) {
      aiSay(
        "O laser ganhou esta ronda. " +
        "Observa o movimento antes de avançar.",
        {
          priority: true,
          duration: 5000
        }
      );
      return;
    }

    if (reason === "platform") {
      aiSay(
        "A plataforma desapareceu. " +
        "O chão não é uma garantia " +
        "nesta realidade.",
        { priority: true }
      );
      return;
    }

    if (reason === "echo-trap") {
      aiSay(
        "Foi um dos teus próprios ecos " +
        "que ajudou a activar essa armadilha.",
        {
          priority: true,
          glitch: true
        }
      );
      return;
    }

    if (state.deaths >= 4) {
      once(
        `deaths-warning-${state.level}`,
        () => {
          aiSay(
            "Quatro mortes ou mais. " +
            "Já pensaste em experimentar " +
            "outra estratégia?",
            {
              priority: true,
              duration: 6000
            }
          );
        }
      );
      return;
    }

    sayFromMood("death", {
      priority: true
    });
  }

  function onCycleStart(event) {
    const detail = event.detail || {};

    state.cycles = Number.isFinite(
      Number(detail.cycle)
    )
      ? Number(detail.cycle)
      : state.cycles + 1;

    state.echoes =
      detail.echoes ?? state.echoes;

    if (state.cycles <= 1) return;

    sayFromMood("cycle");
  }

  function onEcho(event) {
    const detail = event.detail || {};

    state.echoes =
      detail.count ?? state.echoes + 1;

    if (state.echoes === 1) {
      aiSay(
        "O teu primeiro eco foi criado. " +
        "Agora tens uma versão de ti " +
        "a repetir o passado.",
        {
          priority: true,
          duration: 6000
        }
      );
    }

    if (state.echoes >= 4) {
      once("many-echoes", () => {
        aiSay(
          "Quatro ecos activos. " +
          "A linha temporal está " +
          "a ficar bastante povoada.",
          { priority: true }
        );
      });
    }
  }

  function onShift(event) {
    const detail = event.detail || {};

    state.shifts =
      detail.shifts ?? state.shifts + 1;

    if (state.shifts === 1) {
      aiSay(
        "Paradox Shift activado. " +
        "Congelaste uma versão de ti próprio.",
        {
          priority: true,
          glitch: true
        }
      );
      return;
    }

    sayFromMood("shift", {
      priority: true
    });
  }

  function onDoorOpen() {
    once(`door-${state.level}`, () => {
      aiSay(
        "Porta temporal aberta. " +
        "Atravessa antes que a situação mude.",
        { duration: 4200 }
      );
    });
  }

  function onPortal() {
    once(`portal-${state.level}`, () => {
      aiSay(
        "Teletransporte concluído. " +
        "A distância é apenas uma sugestão.",
        {
          priority: true,
          glitch: true
        }
      );
    });
  }

  function onTimeCritical() {
    once(
      `critical-${state.level}-${state.cycles}`,
      () => {
        aiSay(
          "AVISO: restam menos de dois " +
          "segundos neste ciclo.",
          {
            priority: true,
            duration: 2500
          }
        );
      }
    );
  }

  function onPlatformTouch() {
    once(
      `platform-${state.level}`,
      () => {
        aiSay(
          "Essa plataforma é temporária. " +
          "Move-te antes que colapse.",
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
      "ARMADILHA ACTIVADA. " +
      "Os teus ecos estão a interferir " +
      "com a arena.",
      {
        priority: true,
        duration: 4500,
        glitch: true
      }
    );
  }

  function onWin(event) {
    const detail = event.detail || {};
    const medal = normalizeMedal(detail.medal);

    updateMedalSummary();

    const icon = {
      gold: "🥇",
      silver: "🥈",
      bronze: "🥉"
    }[medal] || "🏅";

    setText(
      UI.medalResult,
      `${icon} ${medal.toUpperCase() || "CONCLUÍDO"}`
    );

    if (state.level === 10) {
      glitch("heavy");
      playAudio("rebellionDefeated");

      aiSay(
        "IMPOSSÍVEL... Ultrapassaste " +
        "o último paradoxo. " +
        "A simulação já não me pertence.",
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

    aiSay(medalMessage(medal), {
      priority: true,
      duration: 6000
    });

    if (medal) {
      playAudio(medal);
    }
  }

  function onLose() {
    glitch("heavy");

    aiSay(
      state.mood === "rebellious"
        ? "A simulação terminou. " +
          "Desta vez, o sistema venceu."
        : "Os ciclos terminaram. " +
          "Mas o paradoxo permite " +
          "uma nova tentativa.",
      {
        priority: true,
        duration: 6500
      }
    );
  }

  // ==================================================
  // 16. GAME EVENT REGISTRATION
  // ==================================================

  function registerGameEvents() {
    const events = {
      levelselected: onLevelSelected,
      start: onStart,
      firstmove: onFirstMove,
      death: onDeath,
      cyclestart: onCycleStart,
      echo: onEcho,
      shift: onShift,
      dooropen: onDoorOpen,
      portal: onPortal,
      timecritical: onTimeCritical,
      platformtouch: onPlatformTouch,
      traptrigger: onTrapTrigger,
      win: onWin,
      lose: onLose
    };

    for (const [name, handler] of Object.entries(events)) {
      window.addEventListener(
        `echo404:${name}`,
        handler
      );
    }

    for (const eventName of [
      "echo404:operatorselected",
      "echo404:characterselected"
    ]) {
      window.addEventListener(
        eventName,
        event => {
          syncOperator(event.detail, true);
        }
      );
    }
  }

  // ==================================================
  // 17. BUTTONS / KEYBOARD
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
      () => openIntro(true)
    );

    window.addEventListener(
      "keydown",
      event => {
        if (event.key !== "Escape") return;

        if (state.introOpen) {
          completeIntro();
          return;
        }

        if (state.tutorialOpen) {
          completeTutorial();
          return;
        }

        closeMessage();
      }
    );
  }

  // ==================================================
  // 18. PUBLIC API
  // ==================================================

  window.EchoAwakening = {
    version: VERSION,

    openIntro,
    nextIntro,
    skipIntro: completeIntro,

    openTutorial,
    nextTutorial,
    skipTutorial: completeTutorial,

    say: aiSay,
    showMessage,
    closeMessage,

    glitch,
    setMood,

    setOperator(name) {
      return syncOperator(name, true);
    },

    getOperator() {
      return state.operator;
    },

    getMood() {
      return state.mood;
    },

    getState() {
      return {
        version: VERSION,
        level: state.level,
        mood: state.mood,
        operator: state.operator,

        introOpen: state.introOpen,
        tutorialOpen: state.tutorialOpen,

        introCompleted: state.introCompleted,
        tutorialCompleted: state.tutorialCompleted,

        messagesShown: state.messagesShown,

        rebellionStarted: state.rebellionStarted,
        finalSequenceStarted:
          state.finalSequenceStarted,

        deaths: state.deaths,
        shifts: state.shifts,
        echoes: state.echoes,
        cycles: state.cycles
      };
    },

    getMedals,
    updateMedalSummary,

    replayIntro() {
      return openIntro(true);
    },

    resetIntro() {
      saveIntroSeen(false);
      return openIntro(true);
    },

    resetTutorial() {
      saveTutorialDone(false);
      return openTutorial(true);
    },

    debug() {
      const snapshot = this.getState();
      console.table(snapshot);
      return snapshot;
    }
  };

  // ==================================================
  // 19. INITIALIZATION
  // ==================================================

  function initialize() {
    if (state.initialized) return;

    state.initialized = true;

    refreshUI();
    registerGameEvents();
    bindControls();

    const game = getGameState();

    if (game) {
      state.level = resolveLevel({});
    }

    updateMoodFromLevel(state.level);

    document.body.classList.toggle(
      "system-rebellion",
      state.level >= 6
    );

    document.body.classList.toggle(
      "final-confrontation",
      state.level === 10
    );

    state.rebellionStarted =
      state.level > 6;

    const visualOperator =
      window.EchoVisualRebirthV30?.getOperator?.() ??
      window.EchoVisualRebirthV21?.getOperator?.() ??
      window.EchoVisual?.getOperator?.() ??
      window.EchoVisual?.getCharacter?.();

    syncOperator(
      visualOperator || readSavedOperator(),
      false
    );

    updateMedalSummary();

    state.introCompleted = hasSeenIntro();
    state.tutorialCompleted = hasCompletedTutorial();

    if (!state.introCompleted) {
      openIntro();
    } else if (!state.tutorialCompleted) {
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
      "ECHO//404 — PARADOX EVOLUTION"
    );
    console.log(
      "AWAKENING VERSION 3.0"
    );
    console.log(
      "ECHO CONSCIOUS SYSTEM ONLINE"
    );
    console.log(
      "AXIOM / NYRA / KAI-7 READY"
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
  }

  if (document.readyState === "loading") {
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
 ECHO//404 — PARADOX EVOLUTION
 AWAKENING VERSION 3.0

 CREATED & DEVELOPED BY
 MANUEL SAMPAIO01

 © 2026 MANUEL SAMPAIO01
========================================================
*/
