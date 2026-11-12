
"use strict";

/*
==================================================
 ECHO//404 — PARADOX EVOLUTION
 VERSION 0.7 — THE AWAKENING
 FILE: audio.js

 FUTURISTIC AUDIO ENGINE
 WEB AUDIO API — NO EXTERNAL FILES

 CREATED & DEVELOPED BY
 MANUEL SAMPAIO01

 DESKTOP + ANDROID + iOS
==================================================
*/

const GameAudio = {

  // ========================================
  // 1. ESTADO E CONFIGURAÇÕES
  // ========================================

  context: null,
  masterGain: null,

  enabled: GameStorage.getSound(),

  volume: 0.32,
  initialized: false,

  lastPlayed: Object.create(null),

  // Evita sons excessivos quando vários
  // eventos acontecem no mesmo instante.
  cooldowns: {
    click: 35,
    tick: 120,
    plate: 120,
    door: 250,
    laser: 250,
    glitch: 160,
    warning: 350,
    echoMessage: 150
  },

  // ========================================
  // 2. INICIALIZAÇÃO
  // ========================================

  init() {
    if (!this.enabled) {
      return false;
    }

    try {
      const AudioContextClass =
        window.AudioContext ||
        window.webkitAudioContext;

      if (!AudioContextClass) {
        console.warn(
          "ECHO//404: Web Audio API indisponível."
        );
        return false;
      }

      if (
        !this.context ||
        this.context.state === "closed"
      ) {
        this.context = new AudioContextClass();

        this.masterGain =
          this.context.createGain();

        this.masterGain.gain.value =
          this.volume;

        this.masterGain.connect(
          this.context.destination
        );

        this.initialized = true;
      }

      if (this.context.state === "suspended") {
        this.context.resume().catch(() => {
          // Alguns browsers móveis só permitem
          // retomar após um gesto do utilizador.
        });
      }

      return true;

    } catch (error) {
      console.warn(
        "ECHO//404: erro ao iniciar áudio.",
        error
      );

      return false;
    }
  },

  // ========================================
  // 3. OSCILADOR
  // ========================================

  tone(
    frequency = 440,
    duration = 0.15,
    type = "sine",
    volume = 0.15,
    delay = 0,
    endFrequency = null
  ) {
    if (!this.enabled || !this.init()) {
      return;
    }

    const ac = this.context;

    if (
      !ac ||
      ac.state !== "running"
    ) {
      return;
    }

    const startTime =
      ac.currentTime + Math.max(0, delay);

    const safeDuration = Math.max(
      0.02,
      duration
    );

    const endTime =
      startTime + safeDuration;

    const oscillator =
      ac.createOscillator();

    const gain =
      ac.createGain();

    const safeFrequency = Math.max(
      1,
      frequency
    );

    const safeVolume = Math.max(
      0.0001,
      volume
    );

    oscillator.type = type;

    oscillator.frequency.setValueAtTime(
      safeFrequency,
      startTime
    );

    if (
      Number.isFinite(endFrequency) &&
      endFrequency > 0
    ) {
      oscillator.frequency.exponentialRampToValueAtTime(
        endFrequency,
        endTime
      );
    }

    const attackTime = Math.min(
      0.012,
      safeDuration / 3
    );

    gain.gain.setValueAtTime(
      0.0001,
      startTime
    );

    gain.gain.exponentialRampToValueAtTime(
      safeVolume,
      startTime + attackTime
    );

    gain.gain.exponentialRampToValueAtTime(
      0.0001,
      endTime
    );

    oscillator.connect(gain);

    gain.connect(
      this.masterGain
    );

    oscillator.start(startTime);
    oscillator.stop(endTime + 0.01);

    oscillator.onended = () => {
      oscillator.disconnect();
      gain.disconnect();
    };
  },

  // ========================================
  // 4. RUÍDO DIGITAL
  // ========================================

  noise(
    duration = 0.15,
    volume = 0.10,
    delay = 0,
    filterFrequency = 1800
  ) {
    if (!this.enabled || !this.init()) {
      return;
    }

    const ac = this.context;

    if (
      !ac ||
      ac.state !== "running"
    ) {
      return;
    }

    const safeDuration = Math.max(
      0.01,
      duration
    );

    const sampleRate = ac.sampleRate;

    const frameCount = Math.max(
      1,
      Math.floor(
        sampleRate * safeDuration
      )
    );

    const buffer = ac.createBuffer(
      1,
      frameCount,
      sampleRate
    );

    const data =
      buffer.getChannelData(0);

    for (let i = 0; i < frameCount; i++) {
      const fade =
        1 - i / frameCount;

      data[i] =
        (Math.random() * 2 - 1) * fade;
    }

    const source =
      ac.createBufferSource();

    const filter =
      ac.createBiquadFilter();

    const gain =
      ac.createGain();

    filter.type = "lowpass";

    filter.frequency.value =
      Math.max(100, filterFrequency);

    gain.gain.value =
      Math.max(0, volume);

    source.buffer = buffer;

    source.connect(filter);
    filter.connect(gain);

    gain.connect(
      this.masterGain
    );

    const startTime =
      ac.currentTime + Math.max(0, delay);

    source.start(startTime);

    source.onended = () => {
      source.disconnect();
      filter.disconnect();
      gain.disconnect();
    };
  },

  // ========================================
  // 5. SEQUÊNCIA DE NOTAS
  // ========================================

  sequence(
    notes,
    interval = 0.12,
    type = "sine",
    volume = 0.12
  ) {
    if (
      !this.enabled ||
      !Array.isArray(notes)
    ) {
      return;
    }

    notes.forEach((frequency, index) => {
      if (
        Number.isFinite(frequency) &&
        frequency > 0
      ) {
        this.tone(
          frequency,
          interval * 0.85,
          type,
          volume,
          index * interval
        );
      }
    });
  },

  // ========================================
  // 6. INICIAR SIMULAÇÃO
  // ========================================

  start() {
    this.sequence(
      [220, 330, 440, 660],
      0.09,
      "square",
      0.09
    );

    this.tone(
      110,
      0.45,
      "sine",
      0.12,
      0,
      220
    );
  },

  // ========================================
  // 7. CRIAR ECO TEMPORAL
  // ========================================

  echo() {
    this.tone(
      540,
      0.25,
      "sine",
      0.13,
      0,
      180
    );

    this.tone(
      810,
      0.20,
      "triangle",
      0.07,
      0.05,
      270
    );
  },

  // ========================================
  // 8. ACTIVAR PLACA
  // ========================================

  plate() {
    this.sequence(
      [440, 660],
      0.07,
      "triangle",
      0.08
    );
  },

  // ========================================
  // 9. ABRIR PORTA
  // ========================================

  door() {
    this.tone(
      160,
      0.35,
      "sawtooth",
      0.11,
      0,
      540
    );

    this.tone(
      720,
      0.20,
      "sine",
      0.06,
      0.15
    );
  },

  // ========================================
  // 10. LASER / MORTE
  // ========================================

  laser() {
    this.tone(
      700,
      0.35,
      "sawtooth",
      0.15,
      0,
      80
    );

    this.noise(
      0.25,
      0.11,
      0,
      1200
    );
  },

  // ========================================
  // 11. TELETRANSPORTE
  // ========================================

  portal() {
    this.tone(
      200,
      0.40,
      "sine",
      0.14,
      0,
      1200
    );

    this.tone(
      900,
      0.25,
      "triangle",
      0.07,
      0.10,
      300
    );
  },

  // ========================================
  // 12. PARADOX SHIFT
  // ========================================

  shift() {
    this.tone(
      900,
      0.45,
      "sawtooth",
      0.12,
      0,
      120
    );

    this.tone(
      180,
      0.50,
      "triangle",
      0.10,
      0.05,
      650
    );

    this.noise(
      0.12,
      0.07,
      0.10
    );
  },

  // ========================================
  // 13. VITÓRIA
  // ========================================

  win() {
    this.sequence(
      [
        392,
        523.25,
        659.25,
        783.99,
        1046.5
      ],
      0.14,
      "triangle",
      0.14
    );

    this.tone(
      1046.5,
      0.60,
      "sine",
      0.12,
      0.70
    );
  },

  // ========================================
  // 14. DERROTA
  // ========================================

  fail() {
    this.sequence(
      [
        440,
        349.23,
        261.63,
        174.61
      ],
      0.17,
      "sawtooth",
      0.10
    );

    this.tone(
      95,
      0.70,
      "sine",
      0.12,
      0.35,
      45
    );
  },

  // ========================================
  // 15. ERRO / ACÇÃO BLOQUEADA
  // ========================================

  error() {
    this.tone(
      150,
      0.12,
      "square",
      0.08
    );
  },

  // ========================================
  // 16. CLIQUE
  // ========================================

  click() {
    this.tone(
      650,
      0.06,
      "square",
      0.05
    );
  },

  // ========================================
  // 17. CONTAGEM REGRESSIVA
  // ========================================

  tick() {
    this.tone(
      880,
      0.05,
      "sine",
      0.045
    );
  },

  // ========================================
  // 18. INTRODUÇÃO CINEMATOGRÁFICA
  // ========================================

  awakening() {
    // Pulso inicial.
    this.tone(
      55,
      1.25,
      "sine",
      0.14,
      0,
      110
    );

    // Sequência de activação.
    this.sequence(
      [
        130.81,
        164.81,
        196,
        261.63,
        392
      ],
      0.22,
      "triangle",
      0.085
    );

    // Textura digital.
    this.noise(
      0.24,
      0.045,
      0.45,
      950
    );

    // Final ascendente.
    this.tone(
      440,
      0.75,
      "sine",
      0.09,
      1.05,
      880
    );
  },

  // ========================================
  // 19. TRANSIÇÃO CINEMATOGRÁFICA
  // ========================================

  transition() {
    this.tone(
      320,
      0.24,
      "triangle",
      0.07,
      0,
      780
    );

    this.noise(
      0.10,
      0.035,
      0.03,
      2400
    );
  },

  // ========================================
  // 20. GLITCH DIGITAL
  // ========================================

  glitch() {
    this.noise(
      0.09,
      0.075,
      0,
      3200
    );

    this.tone(
      1200,
      0.055,
      "square",
      0.035,
      0,
      220
    );

    this.tone(
      370,
      0.065,
      "sawtooth",
      0.035,
      0.07,
      920
    );
  },

  // ========================================
  // 21. MENSAGEM DA IA ECHO
  // ========================================

  echoMessage() {
    this.tone(
      740,
      0.075,
      "sine",
      0.055
    );

    this.tone(
      990,
      0.11,
      "triangle",
      0.045,
      0.09
    );
  },

  // ========================================
  // 22. ALERTA DE TEMPO CRÍTICO
  // ========================================

  warning() {
    this.tone(
      660,
      0.12,
      "square",
      0.085
    );

    this.tone(
      440,
      0.15,
      "square",
      0.075,
      0.15
    );
  },

  // ========================================
  // 23. MEDALHA DE BRONZE
  // ========================================

  bronze() {
    this.sequence(
      [261.63, 329.63, 392],
      0.15,
      "triangle",
      0.09
    );
  },

  // ========================================
  // 24. MEDALHA DE PRATA
  // ========================================

  silver() {
    this.sequence(
      [
        329.63,
        440,
        554.37,
        659.25
      ],
      0.13,
      "triangle",
      0.10
    );
  },

  // ========================================
  // 25. MEDALHA DE OURO
  // ========================================

  gold() {
    this.sequence(
      [
        392,
        493.88,
        587.33,
        783.99,
        987.77,
        1174.66
      ],
      0.12,
      "triangle",
      0.12
    );

    this.tone(
      1174.66,
      0.55,
      "sine",
      0.10,
      0.70
    );
  },

  // ========================================
  // 26. TUTORIAL
  // ========================================

  tutorial() {
    this.sequence(
      [523.25, 659.25],
      0.09,
      "sine",
      0.055
    );
  },

  // ========================================
  // 27. TUTORIAL CONCLUÍDO
  // ========================================

  tutorialComplete() {
    this.sequence(
      [
        523.25,
        659.25,
        783.99,
        1046.5
      ],
      0.11,
      "triangle",
      0.09
    );
  },

  // ========================================
  // 28. REPRODUZIR SOM PELO NOME
  // ========================================

  play(name) {
    if (!this.enabled) {
      return;
    }

    const sounds = {
      start: () => this.start(),
      echo: () => this.echo(),
      plate: () => this.plate(),
      door: () => this.door(),
      laser: () => this.laser(),
      portal: () => this.portal(),
      shift: () => this.shift(),
      win: () => this.win(),
      fail: () => this.fail(),
      error: () => this.error(),
      click: () => this.click(),
      tick: () => this.tick(),

      awakening: () => this.awakening(),
      intro: () => this.awakening(),
      transition: () => this.transition(),
      glitch: () => this.glitch(),
      echoMessage: () => this.echoMessage(),
      message: () => this.echoMessage(),
      warning: () => this.warning(),
      critical: () => this.warning(),

      bronze: () => this.bronze(),
      silver: () => this.silver(),
      gold: () => this.gold(),

      tutorial: () => this.tutorial(),
      tutorialComplete: () =>
        this.tutorialComplete()
    };

    if (
      !Object.prototype.hasOwnProperty.call(
        sounds,
        name
      )
    ) {
      return;
    }

    const cooldown =
      this.cooldowns[name] || 0;

    const now = performance.now();

    if (
      cooldown > 0 &&
      now - (this.lastPlayed[name] || 0) <
        cooldown
    ) {
      return;
    }

    this.lastPlayed[name] = now;

    sounds[name]();
  },

  // ========================================
  // 29. ACTIVAR / DESACTIVAR SOM
  // ========================================

  toggle() {
    this.enabled = !this.enabled;

    GameStorage.setSound(
      this.enabled
    );

    if (this.enabled) {
      this.init();
      this.play("click");
    }

    return this.enabled;
  },

  // ========================================
  // 30. DEFINIR VOLUME
  // ========================================

  setVolume(value) {
    const number = Number(value);

    if (!Number.isFinite(number)) {
      return this.volume;
    }

    this.volume = Math.max(
      0,
      Math.min(1, number)
    );

    if (
      this.masterGain &&
      this.context &&
      this.context.state !== "closed"
    ) {
      this.masterGain.gain.setTargetAtTime(
        this.volume,
        this.context.currentTime,
        0.025
      );
    }

    return this.volume;
  },

  // ========================================
  // 31. SUSPENDER ÁUDIO
  // ========================================

  pause() {
    if (
      this.context &&
      this.context.state === "running"
    ) {
      this.context.suspend().catch(() => {
        // Suspensão opcional.
      });
    }
  },

  // ========================================
  // 32. RETOMAR ÁUDIO
  // ========================================

  resume() {
    if (!this.enabled) {
      return;
    }

    this.init();
  },

  // ========================================
  // 33. DIAGNÓSTICO
  // ========================================

  debug() {
    console.log(
      "========== ECHO//404 AUDIO =========="
    );

    console.table({
      version: "0.7 THE AWAKENING",
      enabled: this.enabled,
      initialized: this.initialized,
      volume: this.volume,
      contextState:
        this.context?.state || "not created"
    });
  }
};

// ==========================================
// 34. COMPATIBILIDADE MOBILE
// ==========================================

// O áudio só é desbloqueado após
// uma interacção do utilizador.

function unlockGameAudio() {
  if (GameAudio.enabled) {
    GameAudio.init();
  }
}

document.addEventListener(
  "pointerdown",
  unlockGameAudio,
  {
    once: true,
    passive: true
  }
);

document.addEventListener(
  "keydown",
  unlockGameAudio,
  {
    once: true
  }
);

// ==========================================
// 35. VISIBILIDADE DA PÁGINA
// ==========================================

document.addEventListener(
  "visibilitychange",
  () => {
    if (document.hidden) {
      GameAudio.pause();
    } else if (GameAudio.enabled) {
      // A retoma pode depender de uma
      // nova interacção no telemóvel.
      GameAudio.resume();
    }
  }
);

// ==========================================
// 36. EVENTOS DO GAME.JS V0.7
// ==========================================

// Estes eventos complementam o sistema
// de áudio já existente no game.js.
// Evitamos duplicar sons de vitória,
// derrota, lasers, portais e shifts.

window.addEventListener(
  "echo404:timecritical",
  () => {
    GameAudio.play("warning");
  }
);

window.addEventListener(
  "echo404:levelselected",
  () => {
    GameAudio.play("transition");
  }
);

// Sons das medalhas são reproduzidos
// após o som principal de vitória.
window.addEventListener(
  "echo404:win",
  event => {
    const medal =
      event.detail?.medal;

    if (
      medal === "gold" ||
      medal === "silver" ||
      medal === "bronze"
    ) {
      // Agenda apenas a medalha.
// O motor Web Audio permite programar
// o som após o evento.
      const delay = 0.85;

      const notes = {
        bronze: [261.63, 329.63, 392],
        silver: [
          329.63, 440, 554.37, 659.25
        ],
        gold: [
          392, 493.88, 587.33,
          783.99, 987.77
        ]
      };

      notes[medal].forEach(
        (frequency, index) => {
          GameAudio.tone(
            frequency,
            0.12,
            "triangle",
            0.085,
            delay + index * 0.12
          );
        }
      );
    }
  }
);

// ==========================================
// 37. INICIALIZAÇÃO
// ==========================================

console.log(
  "=================================="
);

console.log(
  "ECHO//404 — THE AWAKENING v0.7"
);

console.log(
  "FUTURISTIC AUDIO ENGINE READY"
);

console.log(
  "DESKTOP + ANDROID + iOS"
);

console.log(
  "CREATED BY MANUEL SAMPAIO01"
);

console.log(
  "=================================="
);
