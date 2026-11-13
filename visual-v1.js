
/*
 ECHO//404 — VISUAL REBIRTH v1.0
 Visual companion module

 CREATED & DEVELOPED BY MANUEL SAMPAIO01
 © 2026 MANUEL SAMPAIO01

 Requires the existing game.js.
 Does not change levels, collisions or scoring.
*/

(() => {
  "use strict";

  const VERSION = "1.0";
  const SAVE_KEY = "echo404_visual_v1";

  const OPERATORS = [
    {
      id: "axiom",
      name: "AXIOM",
      role: "Explorador temporal",
      color: "#48f6ff",
      dark: "#123a52",
      description: "Precisão. Coragem. Controlo."
    },
    {
      id: "nyra",
      name: "NYRA",
      role: "Engenheira de sistemas",
      color: "#c88cff",
      dark: "#42265c",
      description: "Inteligência. Instinto. Estratégia."
    },
    {
      id: "kai7",
      name: "KAI-7",
      role: "Androide experimental",
      color: "#ffad4d",
      dark: "#56371e",
      description: "Evolução. Lógica. Resistência."
    }
  ];

  const WORLDS = [
    ["AWAKENING LAB", "#061b32", "#48f6ff"],
    ["INDUSTRIAL SECTOR", "#21160f", "#ffad4d"],
    ["NEON DISTRICT", "#190e35", "#db75ff"],
    ["BIOZONE", "#071f1a", "#52ffbb"],
    ["REACTOR CORE", "#290c19", "#ff526c"],
    ["CRYO STATION", "#0b2337", "#8fdcff"],
    ["ORBITAL STATION", "#111632", "#a7a2ff"],
    ["GLITCH DIMENSION", "#220b32", "#ff5cd9"],
    ["AI CORE", "#170c25", "#c178ff"],
    ["PARADOX ZERO", "#142339", "#ffe4a2"]
  ];

  let saved = {};
  try {
    saved = JSON.parse(
      localStorage.getItem(SAVE_KEY) || "{}"
    );
  } catch (_) {}

  let selected = OPERATORS.some(
    p => p.id === saved.operator
  ) ? saved.operator : "axiom";

  let droneEnabled = saved.drone !== false;
  let hintsEnabled = saved.hints !== false;

  let overlayCanvas = null;
  let overlayCtx = null;
  let gameCanvas = null;
  let gameShell = null;
  let menu = null;
  let toast = null;
  let toastTimer = null;
  let lastLevel = -1;
  let started = false;
  let hintStep = 0;

  const $ = id => document.getElementById(id);

  function persist() {
    try {
      localStorage.setItem(
        SAVE_KEY,
        JSON.stringify({
          operator: selected,
          drone: droneEnabled,
          hints: hintsEnabled
        })
      );
    } catch (_) {}
  }

  function operator() {
    return OPERATORS.find(
      p => p.id === selected
    ) || OPERATORS[0];
  }

  function state() {
    return window.EchoGame?.getState?.() || null;
  }

  function theme() {
    const index = Math.max(
      0,
      Math.min(9, (state()?.level || 1) - 1)
    );
    return WORLDS[index];
  }

  function injectStyles() {
    const style = document.createElement("style");

    style.textContent = `
      #vr-launch {
        position: fixed;
        top: 12px;
        right: 12px;
        z-index: 9998;
        border: 1px solid #48f6ff88;
        background: #08182aee;
        color: #bdfaff;
        padding: 10px 14px;
        border-radius: 12px;
        font: 700 11px system-ui;
        cursor: pointer;
        backdrop-filter: blur(12px);
      }

      #vr-menu {
        position: fixed;
        inset: 0;
        z-index: 9999;
        display: none;
        overflow-y: auto;
        padding: 20px;
        background:
          radial-gradient(
            circle at 50% 20%,
            #17345d 0%,
            #070e1c 55%,
            #030711 100%
          );
        color: #eef8ff;
        font-family: system-ui, sans-serif;
      }

      #vr-menu.open {
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .vr-content {
        width: min(100%, 650px);
        margin: auto;
        text-align: center;
      }

      .vr-kicker {
        color: #48f6ff;
        letter-spacing: 4px;
        font-size: 10px;
        font-weight: 800;
      }

      .vr-title {
        font-size: clamp(25px, 7vw, 45px);
        letter-spacing: -1px;
        margin: 12px 0 5px;
      }

      .vr-subtitle {
        color: #9db0ca;
        font-size: 13px;
        margin-bottom: 24px;
      }

      .vr-characters {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 9px;
      }

      .vr-character {
        appearance: none;
        border: 1px solid #29435f;
        background: #0d1a2e;
        color: white;
        border-radius: 15px;
        padding: 13px 5px;
        cursor: pointer;
        min-width: 0;
      }

      .vr-character.active {
        border: 2px solid var(--accent);
        box-shadow: 0 0 20px #48f6ff25;
      }

      .vr-character svg {
        display: block;
        width: 100%;
        max-width: 100px;
        height: 118px;
        margin: 0 auto 8px;
      }

      .vr-character strong {
        display: block;
        font-size: 13px;
      }

      .vr-character small {
        display: block;
        margin-top: 4px;
        color: #8b9db9;
        font-size: 9px;
      }

      .vr-info {
        margin: 16px 0;
        padding: 15px;
        background: #101f35;
        border-radius: 14px;
      }

      .vr-info h3 {
        margin: 0 0 5px;
        color: var(--accent);
      }

      .vr-info p {
        color: #b4c4dc;
        font-size: 12px;
        margin: 4px;
      }

      .vr-button {
        border: 0;
        border-radius: 12px;
        padding: 15px 20px;
        font-weight: 800;
        font-size: 13px;
        cursor: pointer;
      }

      .vr-primary {
        width: 100%;
        background: #48f6ff;
        color: #04131d;
      }

      .vr-secondary {
        background: #182a43;
        color: #d4e9ff;
      }

      .vr-actions {
        display: flex;
        gap: 8px;
        margin-top: 10px;
      }

      .vr-actions button {
        flex: 1;
      }

      .vr-settings {
        display: flex;
        justify-content: center;
        gap: 16px;
        flex-wrap: wrap;
        padding: 16px 0;
        color: #aebfda;
        font-size: 12px;
      }

      .vr-settings label {
        display: flex;
        gap: 6px;
        align-items: center;
      }

      .vr-credit {
        font-size: 9px;
        color: #7086a8;
        margin-top: 24px;
      }

      #vr-toast {
        position: fixed;
        left: 50%;
        bottom: 18px;
        transform: translateX(-50%);
        width: min(90vw, 420px);
        z-index: 9997;
        background: #0b1b30f2;
        border: 1px solid #986bff88;
        border-radius: 13px;
        padding: 12px;
        color: #e9e1ff;
        font: 12px system-ui;
        box-shadow: 0 12px 35px #0007;
        pointer-events: none;
        display: none;
      }

      #vr-toast strong {
        color: #cda9ff;
      }

      #vr-overlay {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 2;
      }

      @media (max-width: 600px) {
        #vr-launch {
          top: auto;
          bottom: 10px;
          right: 10px;
          padding: 8px 10px;
          font-size: 10px;
        }

        .vr-character svg {
          height: 100px;
        }

        .vr-character {
          padding: 10px 3px;
        }
      }
    `;

    document.head.appendChild(style);
  }

  function characterSVG(p) {
    const android = p.id === "kai7";
    const visor = android ? "#ffdb93" : p.color;

    return `
      <svg viewBox="0 0 90 130"
           xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="g-${p.id}"
                          x1="0" y1="0"
                          x2="1" y2="1">
            <stop stop-color="${p.color}"/>
            <stop offset="1" stop-color="${p.dark}"/>
          </linearGradient>
        </defs>
        <ellipse cx="45" cy="122" rx="25" ry="5"
                 fill="${p.color}" opacity=".2"/>
        <path d="M30 80 L25 117 L39 117
                 L45 91 L51 117 L65 117
                 L60 80 Z"
              fill="#26364e"
              stroke="${p.color}" stroke-width="2"/>
        <path d="M26 48 L17 82 L27 87
                 L37 62 L53 62 L63 87
                 L73 82 L64 48 Z"
              fill="#26364e"
              stroke="${p.color}" stroke-width="2"/>
        <path d="M30 47 L60 47 L65 82
                 L25 82 Z"
              fill="url(#g-${p.id})"
              stroke="${p.color}" stroke-width="2"/>
        <rect x="35" y="57" width="20" height="12"
              rx="4" fill="#0a1828"/>
        <path d="M38 63 H52" stroke="${p.color}"
              stroke-width="3"/>
        <rect x="24" y="10" width="42" height="43"
              rx="${android ? 8 : 19}"
              fill="#172a40"
              stroke="${p.color}" stroke-width="3"/>
        <rect x="30" y="25" width="30" height="15"
              rx="${android ? 3 : 8}"
              fill="#07131f"
              stroke="${visor}" stroke-width="2"/>
        ${
          android
          ? `<circle cx="38" cy="32" r="3" fill="${visor}"/>
             <circle cx="52" cy="32" r="3" fill="${visor}"/>`
          : `<path d="M34 33 H56"
                   stroke="${visor}" stroke-width="4"
                   stroke-linecap="round"/>`
        }
        <path d="M45 10 V3" stroke="${p.color}"
              stroke-width="2"/>
        <circle cx="45" cy="3" r="3"
                fill="${p.color}"/>
      </svg>
    `;
  }

  function createMenu() {
    menu = document.createElement("div");
    menu.id = "vr-menu";

    menu.innerHTML = `
      <div class="vr-content">
        <div class="vr-kicker">
          ECHO//404 — VISUAL REBIRTH
        </div>

        <h1 class="vr-title">
          ESCOLHE O TEU OPERADOR
        </h1>

        <p class="vr-subtitle">
          O destino é o mesmo. A identidade é tua.
        </p>

        <div class="vr-characters">
          ${OPERATORS.map(p => `
            <button class="vr-character"
                    data-operator="${p.id}"
                    style="--accent:${p.color}">
              ${characterSVG(p)}
              <strong>${p.name}</strong>
              <small>${p.role}</small>
            </button>
          `).join("")}
        </div>

        <div class="vr-info" id="vr-info"></div>

        <button class="vr-button vr-primary"
                id="vr-play">
          ENTRAR NO JOGO
        </button>

        <div class="vr-actions">
          <button class="vr-button vr-secondary"
                  id="vr-levels">
            NÍVEIS
          </button>
          <button class="vr-button vr-secondary"
                  id="vr-close">
            FECHAR
          </button>
        </div>

        <div class="vr-settings">
          <label>
            <input type="checkbox" id="vr-drone">
            Drone ECHO
          </label>
          <label>
            <input type="checkbox" id="vr-hints">
            Dicas
          </label>
        </div>

        <div class="vr-credit">
          CREATED & DEVELOPED BY MANUEL SAMPAIO01
          <p>© 2026 MANUEL SAMPAIO01</p>
        </div>
      </div>
    `;

    document.body.appendChild(menu);

    menu.querySelectorAll(
      "[data-operator]"
    ).forEach(button => {
      button.addEventListener("click", () => {
        selected = button.dataset.operator;
        persist();
        updateMenu();
      });
    });

    $("vr-play").addEventListener("click", () => {
      closeMenu();

      if (!state()?.running) {
        window.EchoGame?.start?.();
      }
    });

    $("vr-levels").addEventListener("click", () => {
      closeMenu();
      $("levelGrid")?.scrollIntoView?.({
        behavior: "smooth",
        block: "center"
      });
    });

    $("vr-close").addEventListener(
      "click",
      closeMenu
    );

    $("vr-drone").addEventListener(
      "change",
      event => {
        droneEnabled = event.target.checked;
        persist();
      }
    );

    $("vr-hints").addEventListener(
      "change",
      event => {
        hintsEnabled = event.target.checked;
        persist();
      }
    );

    updateMenu();
  }

  function updateMenu() {
    const p = operator();

    menu.querySelectorAll(
      "[data-operator]"
    ).forEach(button => {
      button.classList.toggle(
        "active",
        button.dataset.operator === selected
      );
    });

    $("vr-info").style.setProperty(
      "--accent",
      p.color
    );

    $("vr-info").innerHTML = `
      <h3>${p.name}</h3>
      <p>${p.role}</p>
      <p>${p.description}</p>
      <p>
        Habilidades equilibradas • ECHO AI incluída
      </p>
    `;

    $("vr-drone").checked = droneEnabled;
    $("vr-hints").checked = hintsEnabled;
  }

  function openMenu() {
    updateMenu();
    menu.classList.add("open");
  }

  function closeMenu() {
    menu.classList.remove("open");
  }

  function createLaunchButton() {
    const button = document.createElement("button");
    button.id = "vr-launch";
    button.textContent = "☰ MENU";
    button.addEventListener("click", openMenu);
    document.body.appendChild(button);
  }

  function createToast() {
    toast = document.createElement("div");
    toast.id = "vr-toast";
    document.body.appendChild(toast);
  }

  function say(message) {
    if (!hintsEnabled || !toast) return;

    toast.innerHTML = `
      <strong>ECHO AI</strong>
      <span> — ${message}</span>
    `;

    toast.style.display = "block";

    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.style.display = "none";
    }, 4200);
  }

  function attachOverlay() {
    gameCanvas = $("gameCanvas");

    if (!gameCanvas) return;

    gameShell = gameCanvas.parentElement;

    if (
      getComputedStyle(gameShell).position === "static"
    ) {
      gameShell.style.position = "relative";
    }

    overlayCanvas = document.createElement("canvas");
    overlayCanvas.id = "vr-overlay";

    overlayCanvas.width = gameCanvas.width;
    overlayCanvas.height = gameCanvas.height;

    gameShell.appendChild(overlayCanvas);

    overlayCtx = overlayCanvas.getContext("2d");
  }

  function roundedRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, r);
  }

  function drawOperator(ctx, x, y, p, t) {
    const bounce = Math.sin(t * 5) * 1.3;

    ctx.save();
    ctx.translate(x, y + bounce);

    // Covers the original circular player.
    ctx.fillStyle = "#071422";
    ctx.beginPath();
    ctx.arc(0, 0, 15, 0, Math.PI * 2);
    ctx.fill();

    ctx.shadowColor = p.color;
    ctx.shadowBlur = 12;

    ctx.fillStyle = p.dark;
    roundedRect(ctx, -8, -3, 16, 15, 4);
    ctx.fill();

    ctx.strokeStyle = p.color;
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.shadowBlur = 0;

    ctx.fillStyle = "#24364d";
    ctx.fillRect(-7, 10, 5, 6);
    ctx.fillRect(2, 10, 5, 6);

    ctx.fillStyle = "#17283e";
    roundedRect(ctx, -9, -15, 18, 15, 6);
    ctx.fill();

    ctx.strokeStyle = p.color;
    ctx.stroke();

    ctx.fillStyle = "#06131d";
    roundedRect(ctx, -7, -10, 14, 6, 3);
    ctx.fill();

    ctx.fillStyle = p.color;

    if (p.id === "kai7") {
      ctx.fillRect(-5, -8, 3, 2);
      ctx.fillRect(2, -8, 3, 2);
    } else {
      ctx.fillRect(-5, -8, 10, 2);
    }

    ctx.restore();
  }

  function drawDrone(ctx, x, y, t) {
    const dx = x + 29;
    const dy = y - 28 + Math.sin(t * 3) * 4;

    ctx.save();
    ctx.translate(dx, dy);

    ctx.shadowColor = "#b68cff";
    ctx.shadowBlur = 15;

    ctx.fillStyle = "#17203c";
    ctx.strokeStyle = "#b68cff";
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.ellipse(0, 0, 11, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#d5b5ff";
    ctx.beginPath();
    ctx.arc(0, 0, 3.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.shadowBlur = 0;
    ctx.strokeStyle = "#8e77e8";
    ctx.beginPath();
    ctx.moveTo(-16, 1);
    ctx.lineTo(-11, 1);
    ctx.moveTo(11, 1);
    ctx.lineTo(16, 1);
    ctx.stroke();

    ctx.restore();
  }

  function drawAtmosphere(ctx, w, h, t) {
    const [name, bg, accent] = theme();

    // Transparent tint: original puzzle remains visible.
    ctx.fillStyle = bg + "28";
    ctx.fillRect(0, 0, w, h);

    const count = 20;

    for (let i = 0; i < count; i++) {
      const x = (
        i * 173.7 + Math.sin(t * .4 + i) * 12
      ) % w;

      const y = (
        i * 89.3 + t * (3 + i % 4)
      ) % h;

      ctx.fillStyle = accent;
      ctx.globalAlpha = .08 + (i % 4) * .035;
      ctx.fillRect(x, y, 2, 2);
    }

    ctx.globalAlpha = 1;

    ctx.save();
    ctx.strokeStyle = accent;
    ctx.globalAlpha = .15;
    ctx.lineWidth = 1;

    for (let i = 0; i < 5; i++) {
      const px = 30 + i * (w - 60) / 4;
      ctx.beginPath();
      ctx.moveTo(px, 0);
      ctx.lineTo(px, 12);
      ctx.stroke();
    }

    ctx.restore();

    ctx.fillStyle = accent;
    ctx.globalAlpha = .7;
    ctx.font = "bold 10px monospace";
    ctx.textAlign = "left";
    ctx.fillText(name, 17, 42);
    ctx.globalAlpha = 1;
  }

  function renderVisual(timestamp) {
    requestAnimationFrame(renderVisual);

    if (!overlayCtx || !gameCanvas) return;

    const s = state();
    if (!s) return;

    const ctx = overlayCtx;
    const w = overlayCanvas.width;
    const h = overlayCanvas.height;
    const t = timestamp / 1000;

    ctx.clearRect(0, 0, w, h);

    drawAtmosphere(ctx, w, h, t);

    if (s.player) {
      drawOperator(
        ctx,
        s.player.x,
        s.player.y,
        operator(),
        t
      );

      if (droneEnabled) {
        drawDrone(
          ctx,
          s.player.x,
          s.player.y,
          t
        );
      }
    }

    if (s.level !== lastLevel) {
      lastLevel = s.level;
      hintStep = 0;
    }
  }

  function bindEvents() {
    window.addEventListener(
      "echo404:levelselected",
      () => {
        hintStep = 0;
        const level = window.EchoGame?.getLevel?.();

        if (level?.aiIntro) {
          say(level.aiIntro);
        }
      }
    );

    window.addEventListener(
      "echo404:dooropen",
      () => say(
        "A ligação foi estabelecida. A passagem está aberta."
      )
    );

    window.addEventListener(
      "echo404:doorclosed",
      () => say(
        "A passagem voltou a ficar bloqueada."
      )
    );

    window.addEventListener(
      "echo404:death",
      () => say(
        "Falhámos esta tentativa. Podemos aprender com ela."
      )
    );

    window.addEventListener(
      "echo404:echo",
      () => say(
        "Um novo eco foi criado. Observa os seus movimentos."
      )
    );

    window.addEventListener(
      "echo404:shift",
      () => say(
        "SHIFT activado. O eco está estabilizado."
      )
    );

    window.addEventListener(
      "echo404:timecritical",
      () => say(
        "Atenção! O ciclo temporal está quase a terminar."
      )
    );

    window.addEventListener(
      "echo404:win",
      () => say(
        "Excelente trabalho. O próximo sector aguarda-nos."
      )
    );
  }

  function initialize() {
    if (started) return;
    started = true;

    if (!window.EchoGame || !$("gameCanvas")) {
      console.warn(
        "VISUAL REBIRTH: game.js ou canvas indisponível."
      );
      return;
    }

    injectStyles();
    createMenu();
    createLaunchButton();
    createToast();
    attachOverlay();
    bindEvents();

    requestAnimationFrame(renderVisual);

    if (!sessionStorage.getItem("echo404_v1_seen")) {
      openMenu();
      sessionStorage.setItem("echo404_v1_seen", "1");
    }

    window.EchoVisual = {
      version: VERSION,
      openMenu,
      closeMenu,
      selectOperator(id) {
        if (OPERATORS.some(p => p.id === id)) {
          selected = id;
          persist();
          updateMenu();
        }
      },
      getOperator: () => operator().name,
      getTheme: () => theme()[0],
      say
    };

    console.log(
      "ECHO//404 VISUAL REBIRTH v1.0 ONLINE"
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
