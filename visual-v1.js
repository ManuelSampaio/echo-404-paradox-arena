
/*
==========================================================
 ECHO//404 — PARADOX EVOLUTION
 VISUAL REBIRTH v2.0
 CINEMATIC OPERATOR SELECTION

 AXIOM / NYRA / KAI-7

 CREATED & DEVELOPED BY MANUEL SAMPAIO01
 © 2026 MANUEL SAMPAIO01
==========================================================
*/

(() => {
  "use strict";

  const VERSION = "2.0";
  const SAVE_KEY = "echo404_visual_v1";
  const OPERATOR_KEY = "echo404_operator";

  if (window.EchoVisual && window.EchoVisual.version === VERSION) {
    return;
  }

  const OPERATORS = [
    {
      id: "axiom",
      name: "AXIOM",
      role: "Alienígena de fase",
      color: "#48f6ff",
      dark: "#123b50",
      description: "Um sobrevivente extraterrestre capaz de sentir fendas temporais.",
      abilities: [
        "PHASE WALK — atravessa barreiras de fase",
        "Adaptação estratégica",
        "Equilíbrio operacional"
      ]
    },
    {
      id: "nyra",
      name: "NYRA",
      role: "Humana sobrevivente",
      color: "#c88cff",
      dark: "#43245e",
      description: "Inteligência. Instinto. Estratégia.",
      abilities: [
        "DASH — impulso de velocidade",
        "Sincronização temporal",
        "Equilíbrio operacional"
      ]
    },
    {
      id: "kai7",
      name: "KAI-7",
      role: "Robô de manutenção",
      color: "#ffad4d",
      dark: "#57321c",
      description: "Evolução. Lógica. Resistência.",
      abilities: [
        "OVERCHARGE — mantém placas energizadas",
        "Precisão mecânica",
        "Equilíbrio operacional"
      ]
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

  const $ = id => document.getElementById(id);

  let saved = {};

  try {
    saved = JSON.parse(localStorage.getItem(SAVE_KEY) || "{}");
  } catch (_) {}

  function normalizeId(value) {
    const text = String(value || "").toLowerCase();

    if (text.includes("axiom")) return "axiom";
    if (text.includes("nyra")) return "nyra";
    if (text.includes("kai")) return "kai7";

    return null;
  }

  let selected =
    normalizeId(saved.operator) ||
    normalizeId(localStorage.getItem(OPERATOR_KEY)) ||
    "axiom";

  let droneEnabled = saved.drone !== false;
  let hintsEnabled = saved.hints !== false;

  let menu = null;
  let toast = null;
  let toastTimer = null;
  let overlayCanvas = null;
  let overlayCtx = null;
  let gameCanvas = null;
  let initialized = false;
  let previousX = null;
  let previousY = null;
  let facing = 1;
  let moving = false;

  function operator() {
    return OPERATORS.find(p => p.id === selected) || OPERATORS[0];
  }

  function state() {
    return window.EchoGame?.getState?.() || null;
  }

  function theme() {
    const level = Number(state()?.level) || 1;
    return WORLDS[Math.max(0, Math.min(9, level - 1))];
  }

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

      localStorage.setItem(OPERATOR_KEY, operator().name);
    } catch (_) {}
  }

  function chooseOperator(id) {
    const normalized = normalizeId(id);
    if (!normalized) return;

    selected = normalized;
    persist();
    updateMenu();

    window.dispatchEvent(
      new CustomEvent("echo404:operatorselected", {
        detail: {
          id: selected,
          operator: operator().name,
          character: operator().name
        }
      })
    );

    if (window.EchoVisualRebirthV21?.selectCharacter) {
      window.EchoVisualRebirthV21.selectCharacter(
        operator().name
      );
    }
  }

  // ======================================================
  // CINEMATIC CHARACTER PORTRAITS
  // Self-contained SVG illustrations.
  // No external assets required.
  // ======================================================

  function portraitSVG(id) {
    const p = OPERATORS.find(item => item.id === id);
    const c = p.color;

    const defs = `
      <defs>
        <radialGradient id="halo-${id}">
          <stop offset="0" stop-color="${c}" stop-opacity=".48"/>
          <stop offset=".55" stop-color="${c}" stop-opacity=".10"/>
          <stop offset="1" stop-color="#050d1c" stop-opacity="0"/>
        </radialGradient>

        <linearGradient id="metal-${id}" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#7894a8"/>
          <stop offset=".28" stop-color="#314858"/>
          <stop offset=".65" stop-color="#142434"/>
          <stop offset="1" stop-color="#060f1e"/>
        </linearGradient>

        <linearGradient id="visor-${id}" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#eaffff"/>
          <stop offset=".3" stop-color="${c}"/>
          <stop offset="1" stop-color="#123b58"/>
        </linearGradient>

        <filter id="glow-${id}" x="-70%" y="-70%"
                width="240%" height="240%">
          <feGaussianBlur stdDeviation="5" result="blur"/>
          <feMerge>
            <feMergeNode in="blur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>

        <linearGradient id="fade-${id}" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#081425" stop-opacity="0"/>
          <stop offset="1" stop-color="#081425"/>
        </linearGradient>
      </defs>

      <rect width="340" height="390" fill="#071222"/>

      <circle cx="170" cy="155" r="175"
              fill="url(#halo-${id})"/>

      <g opacity=".18" stroke="${c}" fill="none">
        <circle cx="170" cy="162" r="126"/>
        <circle cx="170" cy="162" r="155"/>
        <path d="M0 310 H340 M0 340 H340
                 M170 0 V390 M30 0 V390 M310 0 V390"/>
      </g>

      <g opacity=".55" stroke="${c}" fill="none">
        <path d="M16 28 H52 M16 28 V64"/>
        <path d="M324 28 H288 M324 28 V64"/>
        <path d="M16 360 H52 M16 360 V324"/>
        <path d="M324 360 H288 M324 360 V324"/>
      </g>
    `;

    let figure = "";

    if (id === "axiom") {
      figure = `
        <!-- AXIOM: unmistakably alien, elongated neck and bioluminescent skin -->
        <path d="M88 267 L45 310 L23 390 H317 L295 310 L252 267 Z" fill="#0c2735" stroke="${c}" stroke-width="4"/>
        <path d="M128 257 L212 257 L235 390 H105 Z" fill="#13404a" stroke="#61b8b6" stroke-width="4"/>
        <path d="M144 230 L196 230 L202 283 L170 301 L138 283 Z" fill="#65cbb6" stroke="#c0ffeb" stroke-width="3"/>
        <path d="M170 49 C103 45 76 113 101 185 C109 226 139 256 170 263 C201 256 231 226 239 185 C264 113 237 45 170 49Z" fill="#61bda9" stroke="#b5ffdf" stroke-width="5"/>
        <path d="M105 154 Q129 119 162 156 Q148 192 111 185 Z" fill="#10183e" stroke="${c}" stroke-width="5"/>
        <path d="M235 154 Q211 119 178 156 Q192 192 229 185 Z" fill="#10183e" stroke="${c}" stroke-width="5"/>
        <path d="M115 162 L148 167 M225 162 L192 167" stroke="#e2fffc" stroke-width="4" opacity=".7"/>
        <path d="M153 220 Q170 230 187 220" fill="none" stroke="#164a51" stroke-width="4"/>
        <circle cx="170" cy="326" r="19" fill="#071f29" stroke="${c}" stroke-width="5"/>
        <path d="M170 310 L182 326 L170 342 L158 326Z" fill="${c}" filter="url(#glow-${id})"/>
        <path d="M111 96 L75 56 M229 96 L265 56" stroke="#69dfcc" stroke-width="8" stroke-linecap="round"/>
        <circle cx="75" cy="56" r="9" fill="${c}"/><circle cx="265" cy="56" r="9" fill="${c}"/>
      `;
    }

    if (id === "nyra") {
      figure = `
        <!-- Flowing dark violet hair -->
        <path d="M98 126 Q83 54 150 47
                 Q237 30 256 121
                 Q267 189 277 286
                 L228 311 L115 309
                 L66 290 Q90 209 98 126 Z"
              fill="#1c1029" stroke="#7843a1" stroke-width="4"/>

        <path d="M102 109 Q75 184 67 283"
              fill="none" stroke="#a765d8"
              stroke-width="8" opacity=".55"/>

        <!-- Armored shoulders -->
        <path d="M112 258 L63 271 L26 390 H314
                 L277 271 L228 258 Z"
              fill="#211b32" stroke="${c}" stroke-width="3"/>

        <path d="M94 267 L48 295 L35 346
                 L99 354 L127 295 Z"
              fill="#3a2b4e" stroke="#9a70c4" stroke-width="3"/>

        <path d="M246 267 L292 295 L305 346
                 L241 354 L213 295 Z"
              fill="#3a2b4e" stroke="#9a70c4" stroke-width="3"/>

        <path d="M62 305 L95 314 L86 337 L51 329"
              fill="#623e80" stroke="${c}" stroke-width="2"/>

        <path d="M278 305 L245 314 L254 337 L289 329"
              fill="#623e80" stroke="${c}" stroke-width="2"/>

        <!-- Chest suit -->
        <path d="M119 258 L221 258 L244 390 H96 Z"
              fill="#292239" stroke="#9b75b8" stroke-width="3"/>

        <path d="M133 282 L170 316 L207 282
                 L218 357 L170 382 L122 357 Z"
              fill="#121827" stroke="${c}" stroke-width="2"/>

        <path d="M145 310 L170 334 L195 310"
              stroke="${c}" stroke-width="5"
              fill="none" filter="url(#glow-${id})"/>

        <path d="M170 340 L181 353 L170 366 L159 353 Z"
              fill="${c}" filter="url(#glow-${id})"/>

        <!-- Neck -->
        <path d="M145 222 L195 222 L202 270
                 L170 290 L138 270 Z"
              fill="#a77f91"/>

        <!-- Face -->
        <path d="M113 116 Q117 79 170 77
                 Q223 79 227 119
                 L220 198 Q205 242 170 248
                 Q135 242 120 198 Z"
              fill="#c69aa5" stroke="#e0b7bf" stroke-width="2"/>

        <path d="M119 173 Q124 209 147 225"
              stroke="#a47b8a" stroke-width="3"
              fill="none"/>

        <path d="M221 173 Q216 209 193 225"
              stroke="#a47b8a" stroke-width="3"
              fill="none"/>

        <!-- Hair framing the face -->
        <path d="M111 150 Q98 83 133 66
                 Q174 39 213 70
                 Q233 88 228 146
                 Q211 118 202 104
                 Q169 141 117 137 Z"
              fill="#21102d" stroke="#6f3b90" stroke-width="3"/>

        <path d="M207 91 Q250 113 239 208
                 L260 278 L223 277
                 Q215 222 211 174 Z"
              fill="#291535" stroke="#9b54c4" stroke-width="3"/>

        <path d="M131 72 Q105 109 111 182"
              fill="none" stroke="#8c4eb1"
              stroke-width="5" opacity=".65"/>

        <!-- Natural eye -->
        <path d="M132 166 Q146 158 158 166"
              fill="none" stroke="#281e30" stroke-width="3"/>

        <circle cx="146" cy="166" r="3" fill="#242030"/>

        <!-- Cybernetic eyepiece -->
        <path d="M174 151 L209 145 L221 166
                 L211 185 L178 184 L169 168 Z"
              fill="#10364b" stroke="#6df0ff" stroke-width="3"/>

        <path d="M179 162 H208"
              stroke="#8dfaff" stroke-width="6"
              filter="url(#glow-${id})"/>

        <circle cx="195" cy="166" r="6"
                fill="#e5ffff"
                filter="url(#glow-${id})"/>

        <path d="M218 155 L237 145 L246 155"
              stroke="${c}" stroke-width="3" fill="none"/>

        <!-- Nose and mouth -->
        <path d="M169 177 L164 194 L173 197"
              stroke="#9e7180" stroke-width="2"
              fill="none"/>

        <path d="M155 212 Q170 218 185 212"
              stroke="#7c4d65" stroke-width="3"
              fill="none"/>

        <!-- Ear module -->
        <path d="M105 151 L92 155 L94 191 L111 194"
              fill="#342444" stroke="${c}" stroke-width="3"/>
      `;
    }

    if (id === "kai7") {
      figure = `
        <!-- Heavy mechanical shoulders -->
        <path d="M98 250 L43 263 L11 390 H329
                 L297 263 L242 250 Z"
              fill="#1b2631" stroke="#ffad4d" stroke-width="3"/>

        <path d="M99 254 L48 275 L24 337
                 L91 352 L125 292 Z"
              fill="url(#metal-${id})"
              stroke="#9babb5" stroke-width="4"/>

        <path d="M241 254 L292 275 L316 337
                 L249 352 L215 292 Z"
              fill="url(#metal-${id})"
              stroke="#9babb5" stroke-width="4"/>

        <path d="M48 293 L94 306 L83 331 L39 320"
              fill="#49392c" stroke="${c}" stroke-width="3"/>

        <path d="M292 293 L246 306 L257 331 L301 320"
              fill="#49392c" stroke="${c}" stroke-width="3"/>

        <!-- Reinforced torso -->
        <path d="M118 253 L222 253 L249 390 H91 Z"
              fill="url(#metal-${id})"
              stroke="#8396a2" stroke-width="4"/>

        <path d="M126 279 L170 302 L214 279
                 L226 353 L170 383 L114 353 Z"
              fill="#121c26" stroke="#7c8790" stroke-width="3"/>

        <path d="M133 302 L157 318 M207 302 L183 318"
              stroke="${c}" stroke-width="5"
              filter="url(#glow-${id})"/>

        <!-- Orange power core -->
        <circle cx="170" cy="340" r="22"
                fill="#2c241c" stroke="${c}" stroke-width="5"/>

        <circle cx="170" cy="340" r="12"
                fill="${c}" filter="url(#glow-${id})"/>

        <circle cx="170" cy="340" r="5" fill="#fff2ce"/>

        <!-- Neck mechanics -->
        <path d="M137 228 L203 228 L216 263
                 L170 289 L124 263 Z"
              fill="#263541" stroke="#8b9ca7" stroke-width="3"/>

        <path d="M145 250 H195 M149 260 H191"
              stroke="${c}" stroke-width="3"/>

        <!-- Android skull -->
        <path d="M115 83 L144 64 H196 L225 83
                 L248 119 L244 207
                 L213 243 H127 L96 207 L92 119 Z"
              fill="url(#metal-${id})"
              stroke="#a0adb6" stroke-width="5"/>

        <!-- Helmet crown -->
        <path d="M117 104 L137 76 L203 76 L223 104
                 L207 119 H133 Z"
              fill="#354652" stroke="#8e9ba5" stroke-width="3"/>

        <path d="M170 77 V114"
              stroke="${c}" stroke-width="4"/>

        <!-- Faceplate -->
        <path d="M111 126 L229 126 L230 191
                 L208 222 H132 L110 191 Z"
              fill="#080e16" stroke="#647784" stroke-width="4"/>

        <!-- Mechanical orange eyes -->
        <path d="M121 146 L159 151 L151 172
                 L127 168 Z"
              fill="${c}" filter="url(#glow-${id})"/>

        <path d="M219 146 L181 151 L189 172
                 L213 168 Z"
              fill="${c}" filter="url(#glow-${id})"/>

        <path d="M132 156 L151 159 M208 156 L189 159"
              stroke="#fff1cb" stroke-width="3"/>

        <!-- Lower jaw -->
        <path d="M137 185 H203 L194 209 H146 Z"
              fill="#26323b" stroke="#9ba6ae" stroke-width="2"/>

        <path d="M150 194 H190"
              stroke="${c}" stroke-width="4"/>

        <!-- Side mechanical connectors -->
        <path d="M95 134 L77 143 L80 204 L99 215"
              fill="#334550" stroke="${c}" stroke-width="3"/>

        <path d="M245 134 L263 143 L260 204 L241 215"
              fill="#334550" stroke="${c}" stroke-width="3"/>

        <circle cx="89" cy="178" r="8"
                fill="#16222c" stroke="${c}" stroke-width="3"/>

        <circle cx="251" cy="178" r="8"
                fill="#16222c" stroke="${c}" stroke-width="3"/>
      `;
    }

    return `
      <svg class="vr-operator-art"
           viewBox="0 0 340 390"
           xmlns="http://www.w3.org/2000/svg"
           role="img"
           aria-label="${p.name}">
        ${defs}
        ${figure}
        <rect y="340" width="340" height="50"
              fill="url(#fade-${id})"/>
      </svg>
    `;
  }

  // ======================================================
  // STYLES
  // ======================================================

  function injectStyles() {
    document.getElementById("vr-v2-styles")?.remove();

    const style = document.createElement("style");
    style.id = "vr-v2-styles";

    style.textContent = `
      #vr-menu,
      #vr-menu * {
        box-sizing: border-box;
      }

      #vr-menu {
        position: fixed;
        inset: 0;
        z-index: 9999;
        display: none;
        overflow-y: auto;
        color: #eef9ff;
        font-family: system-ui, Arial, sans-serif;
        background:
          radial-gradient(
            ellipse at 50% 8%,
            #193d59 0%,
            transparent 52%
          ),
          linear-gradient(
            135deg,
            #030813,
            #0a172a 52%,
            #030713
          );
      }

      #vr-menu.open {
        display: block;
      }

      #vr-menu::before {
        content: "";
        position: fixed;
        inset: 0;
        pointer-events: none;
        opacity: .35;
        background-image:
          linear-gradient(#48f6ff12 1px, transparent 1px),
          linear-gradient(90deg, #48f6ff12 1px, transparent 1px);
        background-size: 70px 70px;
      }

      .vr-shell {
        position: relative;
        width: min(95%, 1190px);
        margin: auto;
        padding: 22px 0 28px;
      }

      .vr-topbar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 12px;
        margin-bottom: 15px;
      }

      .vr-system {
        font-size: 11px;
        letter-spacing: 2px;
        font-weight: 900;
        color: #73fbd2;
      }

      .vr-heading {
        text-align: center;
        margin-bottom: 22px;
      }

      .vr-kicker {
        color: #48f6ff;
        font-size: 11px;
        font-weight: 900;
        letter-spacing: 5px;
      }

      .vr-logo {
        margin: 5px 0;
        font-size: clamp(35px, 6vw, 62px);
        font-weight: 1000;
        letter-spacing: 3px;
        text-shadow: 0 0 30px #48f6ff77;
      }

      .vr-version {
        color: #9abbd2;
        font-size: 11px;
        letter-spacing: 4px;
      }

      .vr-title {
        margin: 22px 0 6px;
        font-size: clamp(21px, 4vw, 32px);
      }

      .vr-subtitle {
        color: #9eb2c9;
        font-size: 13px;
      }

      .vr-characters {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 16px;
      }

      .vr-character {
        --accent: #48f6ff;
        position: relative;
        min-width: 0;
        padding: 6px;
        border: 1px solid #34526c;
        border-radius: 18px;
        background: #081729;
        color: white;
        cursor: pointer;
        text-align: center;
        overflow: hidden;
        transition:
          transform .2s,
          border-color .2s,
          box-shadow .2s;
      }

      .vr-character:hover {
        transform: translateY(-6px);
        border-color: var(--accent);
        box-shadow: 0 12px 35px #0008;
      }

      .vr-character.active {
        border: 2px solid var(--accent);
        padding: 5px;
        box-shadow: 0 0 25px
          color-mix(in srgb, var(--accent) 30%, transparent);
      }

      .vr-portrait {
        position: relative;
        height: clamp(220px, 31vw, 370px);
        border-radius: 12px;
        overflow: hidden;
        background: #071222;
      }

      .vr-operator-art {
        display: block;
        width: 100%;
        height: 100%;
        transition: transform .35s ease;
      }

      .vr-character:hover .vr-operator-art {
        transform: scale(1.065);
      }

      .vr-portrait::after {
        content: "";
        position: absolute;
        inset: 75% 0 0;
        pointer-events: none;
        background: linear-gradient(
          transparent,
          #061020cc
        );
      }

      .vr-character-name {
        display: block;
        padding: 13px 4px 3px;
        font-size: clamp(17px, 2vw, 24px);
        font-weight: 950;
      }

      .vr-character-role {
        display: block;
        min-height: 25px;
        font-size: clamp(10px, 1.3vw, 12px);
        font-weight: 800;
        color: var(--accent);
      }

      .vr-selected-mark {
        position: absolute;
        top: 14px;
        right: 14px;
        z-index: 3;
        display: none;
        padding: 7px 10px;
        border-radius: 7px;
        background: var(--accent);
        color: #06111c;
        font-size: 9px;
        font-weight: 950;
      }

      .vr-character.active .vr-selected-mark {
        display: block;
      }

      .vr-info {
        --accent: #48f6ff;
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 18px;
        align-items: center;
        margin-top: 17px;
        padding: 19px 22px;
        border: 1px solid var(--accent);
        border-radius: 15px;
        background: linear-gradient(
          110deg,
          #102b44,
          #091729
        );
      }

      .vr-info h3 {
        margin: 0 0 5px;
        color: var(--accent);
        font-size: 26px;
      }

      .vr-info p {
        margin: 5px 0;
        color: #b4c8dc;
        font-size: 12px;
      }

      .vr-abilities {
        display: grid;
        gap: 10px;
        padding-left: 20px;
        border-left: 1px solid #39516a;
      }

      .vr-ability {
        color: #d8edff;
        font-size: 12px;
      }

      .vr-ability::before {
        content: "◈";
        color: var(--accent);
        margin-right: 10px;
      }

      .vr-actions {
        display: grid;
        grid-template-columns: 1fr 2fr 1fr;
        gap: 12px;
        margin-top: 18px;
      }

      .vr-button,
      #vr-launch {
        border: 1px solid #3a5d79;
        border-radius: 10px;
        background: #11263f;
        color: #fff;
        font-weight: 900;
        cursor: pointer;
        transition: transform .15s;
      }

      .vr-button {
        min-height: 51px;
        font-size: 12px;
      }

      .vr-button:hover,
      #vr-launch:hover {
        transform: translateY(-2px);
      }

      .vr-primary {
        background: #48f6ff;
        color: #03141e;
        border-color: #48f6ff;
        box-shadow: 0 0 22px #48f6ff55;
        font-size: 14px;
      }

      .vr-settings {
        display: flex;
        justify-content: center;
        gap: 20px;
        margin-top: 17px;
        color: #afc4d8;
        font-size: 12px;
      }

      .vr-settings label {
        display: flex;
        align-items: center;
        gap: 7px;
      }

      .vr-credit {
        margin-top: 22px;
        text-align: center;
        color: #819eb8;
        font-size: 10px;
        line-height: 1.9;
        letter-spacing: 1px;
      }

      #vr-launch {
        position: fixed;
        top: 12px;
        right: 12px;
        z-index: 9998;
        padding: 11px 16px;
        border-color: #48f6ff88;
        background: #061729ee;
        color: #bffbff;
        font-size: 11px;
      }

      #vr-toast {
        position: fixed;
        bottom: 18px;
        left: 50%;
        transform: translateX(-50%);
        width: min(92vw, 450px);
        z-index: 9997;
        display: none;
        padding: 14px;
        border: 1px solid #a17bff;
        border-radius: 12px;
        background: #0b1b30f5;
        color: white;
        font: 12px system-ui;
        pointer-events: none;
      }

      #vr-toast strong {
        color: #d2b2ff;
      }

      #vr-overlay {
        position: absolute;
        z-index: 2;
        pointer-events: none;
      }

      @media (max-width: 650px) {
        .vr-shell {
          width: 96%;
          padding-top: 12px;
        }

        .vr-characters {
          gap: 6px;
        }

        .vr-character {
          padding: 3px;
          border-radius: 10px;
        }

        .vr-character.active {
          padding: 2px;
        }

        .vr-portrait {
          height: 195px;
          border-radius: 7px;
        }

        .vr-character-name {
          padding: 8px 2px 2px;
        }

        .vr-character-role {
          font-size: 9px;
          padding: 0 2px 7px;
        }

        .vr-info {
          grid-template-columns: 1fr;
          gap: 10px;
          padding: 13px;
        }

        .vr-abilities {
          padding: 0;
          border: 0;
        }

        .vr-actions {
          grid-template-columns: 1fr 1fr;
          gap: 7px;
        }

        .vr-primary {
          grid-column: 1 / -1;
          grid-row: 1;
        }

        .vr-button {
          min-height: 46px;
        }

        #vr-launch {
          top: auto;
          bottom: 10px;
        }
      }
    `;

    document.head.appendChild(style);
  }

  // ======================================================
  // MENU
  // ======================================================

  function createMenu() {
    menu = document.createElement("section");
    menu.id = "vr-menu";
    menu.setAttribute("role", "dialog");
    menu.setAttribute("aria-modal", "true");
    menu.setAttribute(
      "aria-label",
      "Selecção de operador ECHO//404"
    );

    menu.innerHTML = `
      <div class="vr-shell">

        <div class="vr-topbar">
          <div class="vr-system">
            ◈ ECHO SYSTEM ONLINE
          </div>

          <button
            class="vr-button"
            id="vr-close-top"
            type="button"
            style="padding:9px 14px;min-height:0">
            ✕ FECHAR
          </button>
        </div>

        <div class="vr-heading">
          <div class="vr-kicker">
            PARADOX EVOLUTION
          </div>

          <div class="vr-logo">
            ECHO//404
          </div>

          <div class="vr-version">
            VISUAL REBIRTH v2.0
          </div>

          <h1 class="vr-title">
            ESCOLHE O TEU OPERADOR
          </h1>

          <p class="vr-subtitle">
            O destino é o mesmo. A identidade é tua.
          </p>
        </div>

        <div class="vr-characters">
          ${OPERATORS.map(p => `
            <button
              type="button"
              class="vr-character"
              data-operator="${p.id}"
              style="--accent:${p.color}">

              <span class="vr-selected-mark">
                SELECCIONADO
              </span>

              <div class="vr-portrait">
                ${portraitSVG(p.id)}
              </div>

              <strong class="vr-character-name">
                ${p.name}
              </strong>

              <span class="vr-character-role">
                ${p.role}
              </span>
            </button>
          `).join("")}
        </div>

        <div class="vr-info" id="vr-info"></div>

        <div class="vr-actions">
          <button
            type="button"
            class="vr-button"
            id="vr-levels">
            ◈ NÍVEIS
          </button>

          <button
            type="button"
            class="vr-button vr-primary"
            id="vr-play">
            ▶ ENTRAR NO JOGO
          </button>

          <button
            type="button"
            class="vr-button"
            id="vr-close">
            ✕ FECHAR
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
          <div>© 2026 MANUEL SAMPAIO01</div>
        </div>
      </div>
    `;

    document.body.appendChild(menu);

    menu.querySelectorAll("[data-operator]").forEach(button => {
      button.addEventListener("click", () => {
        chooseOperator(button.dataset.operator);
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

      const details = $("vrLevelDetails");

      if (details) {
        details.open = true;
      }

      $("levelGrid")?.scrollIntoView?.({
        behavior: "smooth",
        block: "center"
      });
    });

    $("vr-close").addEventListener("click", closeMenu);
    $("vr-close-top").addEventListener("click", closeMenu);

    $("vr-drone").addEventListener("change", event => {
      droneEnabled = event.target.checked;
      persist();
    });

    $("vr-hints").addEventListener("change", event => {
      hintsEnabled = event.target.checked;
      persist();
    });

    updateMenu();
  }

  function updateMenu() {
    if (!menu) return;

    const p = operator();

    menu.querySelectorAll("[data-operator]").forEach(button => {
      button.classList.toggle(
        "active",
        button.dataset.operator === selected
      );
    });

    const info = $("vr-info");
    info.style.setProperty("--accent", p.color);

    info.innerHTML = `
      <div>
        <h3>${p.name}</h3>
        <p>${p.role}</p>
        <p>${p.description}</p>
        <p>Habilidades equilibradas • ECHO AI incluída</p>
      </div>

      <div class="vr-abilities">
        ${p.abilities.map(ability => `
          <div class="vr-ability">${ability}</div>
        `).join("")}
      </div>
    `;

    $("vr-drone").checked = droneEnabled;
    $("vr-hints").checked = hintsEnabled;
  }

  function openMenu() {
    if (!menu) return;

    updateMenu();
    menu.classList.add("open");
    document.body.style.overflow = "hidden";
  }

  function closeMenu() {
    if (!menu) return;

    menu.classList.remove("open");
    document.body.style.overflow = "";
  }

  function createLaunchButton() {
    const button = document.createElement("button");

    button.id = "vr-launch";
    button.type = "button";
    button.textContent = "☰ MENU";
    button.addEventListener("click", openMenu);

    document.body.appendChild(button);
  }

  // ======================================================
  // ECHO AI
  // ======================================================

  function createToast() {
    toast = document.createElement("div");
    toast.id = "vr-toast";
    document.body.appendChild(toast);
  }

  function say(message) {
    if (!hintsEnabled || !toast) return;

    toast.textContent = "";

    const label = document.createElement("strong");
    label.textContent = "ECHO AI";

    const content = document.createElement("span");
    content.textContent = " — " + message;

    toast.append(label, content);
    toast.style.display = "block";

    clearTimeout(toastTimer);

    toastTimer = setTimeout(() => {
      toast.style.display = "none";
    }, 4200);
  }

  // ======================================================
  // GAMEPLAY VISUAL OVERLAY
  // ======================================================

  function attachOverlay() {
    gameCanvas = $("gameCanvas");

    if (!gameCanvas) return;

    const shell = gameCanvas.parentElement;
    if (!shell) return;

    if (getComputedStyle(shell).position === "static") {
      shell.style.position = "relative";
    }

    overlayCanvas = document.createElement("canvas");
    overlayCanvas.id = "vr-overlay";

    overlayCanvas.width = gameCanvas.width;
    overlayCanvas.height = gameCanvas.height;

    shell.appendChild(overlayCanvas);
    overlayCtx = overlayCanvas.getContext("2d");

    syncOverlay();
  }

  function syncOverlay() {
    if (!gameCanvas || !overlayCanvas) return;

    if (
      overlayCanvas.width !== gameCanvas.width ||
      overlayCanvas.height !== gameCanvas.height
    ) {
      overlayCanvas.width = gameCanvas.width;
      overlayCanvas.height = gameCanvas.height;
    }

    const canvasRect = gameCanvas.getBoundingClientRect();
    const shell = gameCanvas.parentElement;
    const shellRect = shell.getBoundingClientRect();
    const shellStyle = getComputedStyle(shell);

    const borderLeft =
      parseFloat(shellStyle.borderLeftWidth) || 0;

    const borderTop =
      parseFloat(shellStyle.borderTopWidth) || 0;

    overlayCanvas.style.left =
      `${canvasRect.left - shellRect.left - borderLeft +
      shell.scrollLeft}px`;

    overlayCanvas.style.top =
      `${canvasRect.top - shellRect.top - borderTop +
      shell.scrollTop}px`;

    overlayCanvas.style.width = `${canvasRect.width}px`;
    overlayCanvas.style.height = `${canvasRect.height}px`;
  }

  function roundedRect(ctx, x, y, w, h, r) {
    ctx.beginPath();

    if (typeof ctx.roundRect === "function") {
      ctx.roundRect(x, y, w, h, r);
    } else {
      ctx.rect(x, y, w, h);
    }
  }

  function drawOperator(ctx, x, y, p, t) {
    const bounce = moving
      ? Math.abs(Math.sin(t * 12)) * 1.5
      : Math.sin(t * 2.5) * 0.5;

    const walk = moving ? Math.sin(t * 12) : 0;

    ctx.save();
    ctx.translate(x, y - bounce);
    ctx.scale(facing, 1);

    // Shadow
    ctx.fillStyle = "#0008";
    ctx.beginPath();
    ctx.ellipse(0, 15, 12, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    // Legs
    for (const side of [-1, 1]) {
      ctx.save();
      ctx.translate(side * 4, 5);
      ctx.rotate(walk * side * 0.18);

      ctx.fillStyle = "#283746";
      ctx.strokeStyle = p.color;
      ctx.lineWidth = 1;

      roundedRect(ctx, -3, 0, 6, 12, 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = "#101b28";
      ctx.fillRect(-4, 9, 8, 4);

      ctx.restore();
    }

    // Backpack
    ctx.fillStyle = "#0c1928";
    ctx.strokeStyle = p.color;
    ctx.lineWidth = 1;

    roundedRect(ctx, -11, -10, 22, 18, 4);
    ctx.fill();
    ctx.stroke();

    // Arms
    for (const side of [-1, 1]) {
      ctx.save();
      ctx.translate(side * 10, -8);
      ctx.rotate(walk * side * 0.12);

      ctx.fillStyle = "#354858";
      roundedRect(ctx, -3, 0, 6, 13, 2);
      ctx.fill();

      ctx.strokeStyle = p.color;
      ctx.stroke();

      ctx.restore();
    }

    // Torso
    ctx.fillStyle = "#263849";
    ctx.strokeStyle = p.color;
    ctx.lineWidth = 1.5;

    roundedRect(ctx, -8, -12, 16, 20, 4);
    ctx.fill();
    ctx.stroke();

    // Chest reactor
    ctx.save();
    ctx.shadowColor = p.color;
    ctx.shadowBlur = 12;
    ctx.fillStyle = p.color;

    ctx.beginPath();
    ctx.moveTo(0, -6);
    ctx.lineTo(4, -2);
    ctx.lineTo(0, 2);
    ctx.lineTo(-4, -2);
    ctx.closePath();
    ctx.fill();

    ctx.restore();

    // v7.1: operator-specific suit markings and animated energy straps.
    ctx.save();
    ctx.globalAlpha = 0.85;
    ctx.strokeStyle = p.color;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(-7,-9);ctx.lineTo(-4,-6);
    ctx.moveTo(7,-9);ctx.lineTo(4,-6);
    ctx.stroke();
    ctx.fillStyle = p.color;
    if (p.id === "axiom") {
      ctx.fillRect(-6,3,3,2);ctx.fillRect(3,3,3,2);
    } else if (p.id === "nyra") {
      ctx.beginPath();ctx.arc(-5,4,1.8,0,Math.PI*2);ctx.arc(5,4,1.8,0,Math.PI*2);ctx.fill();
    } else {
      ctx.fillRect(-6,4,12,1.5);
    }
    ctx.restore();

    // Character-specific heads
    if (p.id === "axiom") {
      ctx.fillStyle = "#6ad0b5";
      ctx.strokeStyle = "#c3ffed";
      ctx.beginPath();ctx.ellipse(0,-20,11,13,0,0,Math.PI*2);ctx.fill();ctx.stroke();
      ctx.fillStyle = "#101b39";
      ctx.beginPath();ctx.ellipse(-5,-21,4,6,-.35,0,Math.PI*2);ctx.fill();
      ctx.beginPath();ctx.ellipse(5,-21,4,6,.35,0,Math.PI*2);ctx.fill();
      ctx.strokeStyle=p.color;ctx.lineWidth=1.5;
      ctx.beginPath();ctx.moveTo(-7,-30);ctx.lineTo(-11,-36);ctx.moveTo(7,-30);ctx.lineTo(11,-36);ctx.stroke();
    } else if (p.id === "nyra") {
      ctx.fillStyle = "#24132f";

      roundedRect(ctx, -10, -30, 20, 24, 8);
      ctx.fill();

      ctx.fillStyle = "#bd919d";
      roundedRect(ctx, -7, -26, 14, 15, 6);
      ctx.fill();

      ctx.fillStyle = "#24132f";
      ctx.beginPath();
      ctx.moveTo(-9, -26);
      ctx.lineTo(-4, -31);
      ctx.lineTo(6, -30);
      ctx.lineTo(9, -25);
      ctx.lineTo(2, -26);
      ctx.lineTo(-4, -21);
      ctx.lineTo(-9, -20);
      ctx.closePath();
      ctx.fill();

      ctx.save();
      ctx.shadowColor = "#68eaff";
      ctx.shadowBlur = 9;
      ctx.fillStyle = "#68eaff";
      ctx.fillRect(1, -21, 6, 3);
      ctx.restore();

    } else {
      ctx.fillStyle = "#35434f";
      ctx.strokeStyle = p.color;

      roundedRect(ctx, -10, -29, 20, 19, 4);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = "#080f18";
      roundedRect(ctx, -8, -24, 16, 10, 3);
      ctx.fill();

      ctx.save();
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 12;
      ctx.fillStyle = p.color;

      ctx.fillRect(-6, -21, 5, 3);
      ctx.fillRect(1, -21, 5, 3);

      ctx.restore();
    }

    ctx.restore();
  }

  function drawDrone(ctx, x, y, t) {
    const dx = x + 29;
    const dy = y - 29 + Math.sin(t * 3) * 4;

    ctx.save();
    ctx.translate(dx, dy);

    ctx.shadowColor = "#b68cff";
    ctx.shadowBlur = 14;

    ctx.fillStyle = "#17203c";
    ctx.strokeStyle = "#b68cff";
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.ellipse(0, 0, 11, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#e1c5ff";
    ctx.beginPath();
    ctx.arc(0, 0, 3.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  function drawAtmosphere(ctx, w, h, t) {
    const [name, bg, accent] = theme();

    ctx.save();

    ctx.fillStyle = bg + "18";
    ctx.fillRect(0, 0, w, h);

    for (let i = 0; i < 24; i++) {
      const x = (
        i * 173.7 +
        Math.sin(t * 0.4 + i) * 12
      ) % w;

      const y = (
        i * 89.3 +
        t * (3 + i % 4)
      ) % h;

      ctx.globalAlpha = 0.08 + (i % 4) * 0.035;
      ctx.fillStyle = accent;
      ctx.fillRect(x, y, 2, 2);
    }

    ctx.globalAlpha = 0.8;
    ctx.fillStyle = accent;
    ctx.font = "bold 10px monospace";
    ctx.textAlign = "left";
    ctx.fillText(name, 17, 42);

    ctx.restore();
  }

  function renderVisual(timestamp) {
    requestAnimationFrame(renderVisual);

    if (!overlayCtx || !overlayCanvas) return;

    const s = state();
    if (!s) return;

    syncOverlay();

    const ctx = overlayCtx;
    const w = overlayCanvas.width;
    const h = overlayCanvas.height;
    const t = timestamp / 1000;

    ctx.clearRect(0, 0, w, h);

    drawAtmosphere(ctx, w, h, t);

    // v8: each temporal echo wears the currently selected operator's suit.
    // Reuse the exact same renderer as the player, tinted as a time projection.
    if (Array.isArray(s.ghosts)) {
      const currentMoving = moving;
      s.ghosts.forEach((ghost, index) => {
        if (!Number.isFinite(ghost?.x) || !Number.isFinite(ghost?.y)) return;
        ctx.save();
        ctx.globalAlpha = 0.48 + 0.09 * Math.sin(t * 4 + index);
        ctx.shadowColor = "#a77cff";
        ctx.shadowBlur = 8;
        moving = Boolean(s.running);
        drawOperator(ctx, ghost.x, ghost.y, operator(), t - index * 0.15);
        ctx.restore();
      });
      moving = currentMoving;
    }

    if (
      s.player &&
      Number.isFinite(s.player.x) &&
      Number.isFinite(s.player.y)
    ) {
      const x = s.player.x;
      const y = s.player.y;

      if (previousX !== null && previousY !== null) {
        const dx = x - previousX;
        const dy = y - previousY;

        moving =
          Boolean(s.running) &&
          Math.hypot(dx, dy) > 0.12;

        if (Math.abs(dx) > 0.1) {
          facing = dx > 0 ? 1 : -1;
        }
      }

      previousX = x;
      previousY = y;

      // Avoid rendering two different character
      // overlays if Visual Rebirth v2.1 is active.
      const otherRendererActive =
        Boolean(
          window.EchoVisualRebirthV21 &&
          document.getElementById("echo404CharacterOverlay")
        );

      if (!otherRendererActive) {
        drawOperator(ctx, x, y, operator(), t);
      }

      if (droneEnabled) {
        drawDrone(ctx, x, y, t);
      }
    }
  }

  // ======================================================
  // GAME EVENTS
  // ======================================================

  function bindEvents() {
    window.addEventListener(
      "echo404:levelselected",
      () => {
        const level = window.EchoGame?.getLevel?.();

        if (level?.aiIntro) {
          say(level.aiIntro);
        }
      }
    );

    const messages = {
      "echo404:dooropen":
        "A passagem está aberta.",

      "echo404:doorclosed":
        "A passagem voltou a ficar bloqueada.",

      "echo404:death":
        "Falhámos esta tentativa. Vamos tentar novamente.",

      "echo404:echo":
        "Novo eco criado. Observa os seus movimentos.",

      "echo404:shift":
        "PARADOX SHIFT activado.",

      "echo404:timecritical":
        "Atenção! O ciclo está quase a terminar.",

      "echo404:win":
        "Excelente trabalho. O próximo sector aguarda-nos."
    };

    Object.entries(messages).forEach(
      ([eventName, message]) => {
        window.addEventListener(
          eventName,
          () => say(message)
        );
      }
    );
  }

  // ======================================================
  // INITIALIZATION
  // ======================================================

  function initialize() {
    if (initialized) return;

    if (!window.EchoGame || !$("gameCanvas")) {
      console.warn(
        "VISUAL REBIRTH v2.0: game.js ou gameCanvas indisponível."
      );
      return;
    }

    initialized = true;

    injectStyles();
    createMenu();
    createLaunchButton();
    createToast();
    attachOverlay();
    bindEvents();
    persist();

    requestAnimationFrame(renderVisual);

    window.EchoVisual = {
      version: VERSION,
      openMenu,
      closeMenu,

      selectOperator(id) {
        chooseOperator(id);
      },

      getOperator() {
        return operator().name;
      },

      getTheme() {
        return theme()[0];
      },

      say
    };

    // Let the new ORIGIN prologue finish before showing the operator
    // selection. The menu must not cover the cinematic on first visit.
    let seenMenu = false;
    try { seenMenu = sessionStorage.getItem("echo404_v2_seen") === "1"; } catch (_) {}
    if (!seenMenu) {
      const reveal = () => {
        if (document.body.classList.contains("awakening-active")) {
          window.addEventListener("echo404:tutorialcomplete", reveal, {once:true});
          return;
        }
        openMenu();
        try { sessionStorage.setItem("echo404_v2_seen", "1"); } catch (_) {}
      };
      let newIntroSeen = false;
      try { newIntroSeen = localStorage.getItem("echo404_v82_collapse_prologue_seen") === "true"; } catch (_) {}
      if (!newIntroSeen) {
        window.addEventListener("echo404:introcomplete", () => {
          window.setTimeout(reveal, 80);
        }, {once:true});
      } else if (document.body.classList.contains("awakening-active")) {
        window.addEventListener("echo404:tutorialcomplete", reveal, {once:true});
      } else {
        reveal();
      }
    }

    console.log(
      "ECHO//404 VISUAL REBIRTH v2.0 ONLINE"
    );

    console.log(
      "ACTIVE OPERATOR:",
      operator().name
    );

    console.log(
      "CREATED & DEVELOPED BY MANUEL SAMPAIO01"
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
