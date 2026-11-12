
"use strict";

/*
==================================================
 ECHO//404 — PARADOX EVOLUTION
 VERSION: 0.6.1 MOBILE EDITION
 FILE: audio.js

 SISTEMA DE ÁUDIO FUTURISTA
 Web Audio API — Sem ficheiros externos

 DESKTOP + ANDROID + iOS
==================================================
*/

const GameAudio = {

  // ==========================================
  // 1. CONFIGURAÇÕES
  // ==========================================

  context: null,
  masterGain: null,

  enabled: GameStorage.getSound(),

  volume: 0.35,

  initialized: false,

  // ==========================================
  // 2. INICIALIZAR ÁUDIO
  // ==========================================

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

      if (!this.context || this.context.state === "closed") {
        this.context = new AudioContextClass();

        this.masterGain = this.context.createGain();

        this.masterGain.gain.value = this.volume;

        this.masterGain.connect(
          this.context.destination
        );

        this.initialized = true;
      }

      // Alguns dispositivos móveis suspendem
      // automaticamente o contexto de áudio.
      if (this.context.state === "suspended") {
        this.context.resume().catch(error => {
          console.warn(
            "ECHO//404: não foi possível activar o áudio.",
            error
          );
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

  // ==========================================
  // 3. GERADOR DE TONS
  // ==========================================

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

    if (!ac || ac.state === "closed") {
      return;
    }

    const oscillator = ac.createOscillator();
    const gain = ac.createGain();

    const startTime =
      ac.currentTime + Math.max(0, delay);

    const endTime =
      startTime + Math.max(0.02, duration);

    oscillator.type = type;

    oscillator.frequency.setValueAtTime(
      Math.max(1, frequency),
      startTime
    );

    if (
      endFrequency !== null &&
      endFrequency > 0
    ) {
      oscillator.frequency.exponentialRampToValueAtTime(
        Math.max(1, endFrequency),
        endTime
      );
    }

    const attackEnd = Math.min(
      startTime + 0.01,
      startTime + (endTime - startTime) / 2
    );

    gain.gain.setValueAtTime(
      0.0001,
      startTime
    );

    gain.gain.exponentialRampToValueAtTime(
      Math.max(0.0001, volume),
      attackEnd
    );

    gain.gain.exponentialRampToValueAtTime(
      0.0001,
      endTime
    );

    oscillator.connect(gain);
    gain.connect(this.masterGain);

    oscillator.start(startTime);
    oscillator.stop(endTime + 0.01);

    oscillator.onended = () => {
      oscillator.disconnect();
      gain.disconnect();
    };
  },

  // ==========================================
  // 4. RUÍDO DIGITAL
  // ==========================================

  noise(
    duration = 0.15,
    volume = 0.12,
    delay = 0
  ) {
    if (!this.enabled || !this.init()) {
      return;
    }

    const ac = this.context;

    if (!ac || ac.state === "closed") {
      return;
    }

    const sampleRate = ac.sampleRate;

    const safeDuration = Math.max(
      0.01,
      duration
    );

    const frameCount = Math.max(
      1,
      Math.floor(sampleRate * safeDuration)
    );

    const buffer = ac.createBuffer(
      1,
      frameCount,
      sampleRate
    );

    const channel = buffer.getChannelData(0);

    for (let i = 0; i < frameCount; i++) {
      channel[i] =
        (Math.random() * 2 - 1) *
        (1 - i / frameCount);
    }

    const source = ac.createBufferSource();
    const gain = ac.createGain();
    const filter = ac.createBiquadFilter();

    filter.type = "lowpass";
    filter.frequency.value = 1800;

    source.buffer = buffer;
    gain.gain.value = Math.max(0, volume);

    source.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    const startTime =
      ac.currentTime + Math.max(0, delay);

    source.start(startTime);

    source.onended = () => {
      source.disconnect();
      filter.disconnect();
      gain.disconnect();
    };
  },

  // ==========================================
  // 5. SEQUÊNCIA MUSICAL
  // ==========================================

  sequence(
    notes,
    interval = 0.12,
    type = "sine",
    volume = 0.12
  ) {
    if (!this.enabled || !Array.isArray(notes)) {
      return;
    }

    notes.forEach((frequency, index) => {
      if (frequency > 0) {
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

  // ==========================================
  // 6. INICIAR SIMULAÇÃO
  // ==========================================

  start() {
    this.sequence(
      [220, 330, 440, 660],
      0.09,
      "square",
      0.10
    );
  },

  // ==========================================
  // 7. CRIAR FANTASMA TEMPORAL
  // ==========================================

  echo() {
    this.tone(
      540,
      0.25,
      "sine",
      0.14,
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

  // ==========================================
  // 8. ACTIVAR PLACA
  // ==========================================

  plate() {
    this.sequence(
      [440, 660],
      0.07,
      "triangle",
      0.08
    );
  },

  // ==========================================
  // 9. ABRIR PORTA
  // ==========================================

  door() {
    this.tone(
      160,
      0.35,
      "sawtooth",
      0.12,
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

  // ==========================================
  // 10. LASER / DANOS
  // ==========================================

  laser() {
    this.tone(
      700,
      0.35,
      "sawtooth",
      0.16,
      0,
      80
    );

    this.noise(
      0.25,
      0.12
    );
  },

  // ==========================================
  // 11. TELETRANSPORTE
  // ==========================================

  portal() {
    this.tone(
      200,
      0.40,
      "sine",
      0.15,
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

  // ==========================================
  // 12. PARADOX SHIFT
  // ==========================================

  shift() {
    this.tone(
      900,
      0.45,
      "sawtooth",
      0.13,
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

  // ==========================================
  // 13. VITÓRIA
  // ==========================================

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
      0.15
    );

    this.tone(
      1046.5,
      0.60,
      "sine",
      0.12,
      0.70
    );
  },

  // ==========================================
  // 14. DERROTA
  // ==========================================

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
  },

  // ==========================================
  // 15. ERRO / ACÇÃO BLOQUEADA
  // ==========================================

  error() {
    this.tone(
      150,
      0.12,
      "square",
      0.08
    );
  },

  // ==========================================
  // 16. CLIQUE NOS BOTÕES
  // ==========================================

  click() {
    this.tone(
      650,
      0.06,
      "square",
      0.05
    );
  },

  // ==========================================
  // 17. CONTAGEM REGRESSIVA
  // ==========================================

  tick() {
    this.tone(
      880,
      0.05,
      "sine",
      0.045
    );
  },

  // ==========================================
  // 18. REPRODUÇÃO POR NOME
  // ==========================================

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
      tick: () => this.tick()
    };

    if (
      Object.prototype.hasOwnProperty.call(
        sounds,
        name
      )
    ) {
      sounds[name]();
    }
  },

  // ==========================================
  // 19. ACTIVAR / DESACTIVAR SOM
  // ==========================================

  toggle() {
    this.enabled = !this.enabled;

    GameStorage.setSound(this.enabled);

    if (this.enabled) {
      this.init();
      this.play("click");
    }

    return this.enabled;
  },

  // ==========================================
  // 20. DEFINIR VOLUME
  // ==========================================

  setVolume(value) {
    const number = Number(value);

    if (!Number.isFinite(number)) {
      return this.volume;
    }

    this.volume = Math.max(
      0,
      Math.min(1, number)
    );

    if (this.masterGain && this.context) {
      this.masterGain.gain.setTargetAtTime(
        this.volume,
        this.context.currentTime,
        0.02
      );
    }

    return this.volume;
  },

  // ==========================================
  // 21. SUSPENDER ÁUDIO
  // ==========================================

  pause() {
    if (
      this.context &&
      this.context.state === "running"
    ) {
      this.context.suspend().catch(error => {
        console.warn(
          "ECHO//404: não foi possível suspender áudio.",
          error
        );
      });
    }
  },

  // ==========================================
  // 22. RETOMAR ÁUDIO
  // ==========================================

  resume() {
    if (!this.enabled) {
      return;
    }

    this.init();
  },

  // ==========================================
  // 23. DIAGNÓSTICO
  // ==========================================

  debug() {
    console.log(
      "========== ECHO//404 AUDIO =========="
    );

    console.table({
      enabled: this.enabled,
      initialized: this.initialized,
      volume: this.volume,
      contextState:
        this.context?.state || "not created"
    });
  }
};

// ==========================================
// 24. COMPATIBILIDADE MOBILE
// ==========================================

// Em dispositivos móveis, o áudio deve ser
// activado através de uma interacção do utilizador.
// Não reproduzimos sons automaticamente ao carregar.

function unlockGameAudio() {
  if (!GameAudio.enabled) {
    return;
  }

  GameAudio.init();
}

// Primeira interacção por toque.
document.addEventListener(
  "pointerdown",
  unlockGameAudio,
  { once: true, passive: true }
);

// Primeira interacção por teclado.
document.addEventListener(
  "keydown",
  unlockGameAudio,
  { once: true }
);

// Quando o utilizador regressa à página,
// tenta retomar o áudio, caso esteja activo.
document.addEventListener(
  "visibilitychange",
  () => {
    if (!document.hidden && GameAudio.enabled) {
      GameAudio.resume();
    }
  }
);

// ==========================================
// 25. INICIALIZAÇÃO
// ==========================================

console.log(
  "=================================="
);

console.log(
  "ECHO//404 — PARADOX EVOLUTION"
);

console.log(
  "AUDIO SYSTEM v0.6.1 MOBILE READY"
);

console.log(
  "WEB AUDIO API // DESKTOP + MOBILE"
);

console.log(
  "=================================="
);
