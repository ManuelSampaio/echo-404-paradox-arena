
"use strict";

/*
========================================================
 ECHO//404 — PARADOX EVOLUTION
 VERSION 0.8 — SYSTEM REBELLION
 FILE: audio.js

 PROCEDURAL AUDIO ENGINE
 WEB AUDIO API
 SCI-FI SOUND EFFECTS
 DYNAMIC OBSTACLES
 ECHO AI
 CINEMATIC INTRO
 SYSTEM REBELLION

 CREATED & DEVELOPED BY MANUEL SAMPAIO01
 © 2026 MANUEL SAMPAIO01
========================================================
*/

const GameAudio = (() => {

  const VERSION = "0.8";

  // ==================================================
  // 01. AUDIO ENGINE STATE
  // ==================================================

  const AudioContextClass =
    window.AudioContext ||
    window.webkitAudioContext;

  let context = null;
  let master = null;
  let compressor = null;

  let enabled = true;
  let volume = 0.7;
  let initialized = false;

  let lastTick = 0;
  let lastWarning = 0;
  let lastLaser = 0;
  let lastAI = 0;

  const activeNodes = new Set();

  const DEFAULTS = {
    attack: 0.005,
    release: 0.12,
    gain: 0.16
  };

  // ==================================================
  // 02. STORAGE INTEGRATION
  // ==================================================

  function getStorage() {
    return (
      typeof GameStorage !== "undefined"
        ? GameStorage
        : null
    );
  }

  function loadPreferences() {
    const storage = getStorage();

    if (!storage) return;

    try {
      if (
        typeof storage.getSound ===
        "function"
      ) {
        enabled =
          Boolean(
            storage.getSound()
          );
      }

      if (
        typeof storage.getVolume ===
        "function"
      ) {
        const stored =
          Number(
            storage.getVolume()
          );

        if (
          Number.isFinite(stored)
        ) {
          volume = Math.max(
            0,
            Math.min(1, stored)
          );
        }
      }
    } catch {
      // Storage is optional.
    }
  }

  function savePreferences() {
    const storage = getStorage();

    if (!storage) return;

    try {
      storage.setSound?.(enabled);
      storage.setVolume?.(volume);
    } catch {
      // Audio continues without storage.
    }
  }

  loadPreferences();

  // ==================================================
  // 03. INITIALIZATION
  // ==================================================

  function init() {
    if (!AudioContextClass) {
      console.warn(
        "ECHO//404: Web Audio API unavailable."
      );

      return false;
    }

    if (initialized && context) {
      if (
        context.state === "suspended"
      ) {
        context.resume().catch(
          () => {}
        );
      }

      return true;
    }

    try {
      context =
        new AudioContextClass();

      master =
        context.createGain();

      compressor =
        context.createDynamicsCompressor();

      compressor.threshold.value = -18;
      compressor.knee.value = 12;
      compressor.ratio.value = 5;
      compressor.attack.value = 0.003;
      compressor.release.value = 0.2;

      master.gain.value =
        enabled ? volume : 0;

      master.connect(
        compressor
      );

      compressor.connect(
        context.destination
      );

      initialized = true;

      if (
        context.state === "suspended"
      ) {
        context.resume().catch(
          () => {}
        );
      }

      return true;

    } catch (error) {
      console.warn(
        "ECHO//404: Audio initialization failed.",
        error
      );

      context = null;
      master = null;
      compressor = null;
      initialized = false;

      return false;
    }
  }

  function ready() {
    if (!enabled) {
      return false;
    }

    return init();
  }

  function currentTime() {
    return context
      ? context.currentTime
      : 0;
  }

  // ==================================================
  // 04. VOLUME CONTROL
  // ==================================================

  function applyVolume() {
    if (!master || !context) {
      return;
    }

    master.gain.setTargetAtTime(
      enabled ? volume : 0,
      currentTime(),
      0.025
    );
  }

  function setVolume(value) {
    const number = Number(value);

    if (
      !Number.isFinite(number)
    ) {
      return volume;
    }

    volume = Math.max(
      0,
      Math.min(1, number)
    );

    applyVolume();
    savePreferences();

    return volume;
  }

  function getVolume() {
    return volume;
  }

  function setEnabled(value) {
    enabled =
      Boolean(value);

    applyVolume();
    savePreferences();

    return enabled;
  }

  function toggle() {
    setEnabled(!enabled);

    if (enabled) {
      init();
      click();
    }

    return enabled;
  }

  function isEnabled() {
    return enabled;
  }

  // ==================================================
  // 05. BASIC OSCILLATOR
  // ==================================================

  function tone(
    frequency = 440,
    duration = 0.15,
    type = "sine",
    gain = DEFAULTS.gain,
    options = {}
  ) {
    if (!ready()) {
      return null;
    }

    const start =
      currentTime() +
      Math.max(
        0,
        Number(options.delay) || 0
      );

    const length =
      Math.max(
        0.015,
        Number(duration) || 0.15
      );

    const attack =
      Math.min(
        length * 0.4,
        Math.max(
          0.001,
          Number(options.attack) ||
          DEFAULTS.attack
        )
      );

    const release =
      Math.min(
        length * 0.8,
        Math.max(
          0.01,
          Number(options.release) ||
          DEFAULTS.release
        )
      );

    const oscillator =
      context.createOscillator();

    const envelope =
      context.createGain();

    oscillator.type = type;

    oscillator.frequency.setValueAtTime(
      Math.max(20, frequency),
      start
    );

    if (
      Number.isFinite(
        options.endFrequency
      )
    ) {
      oscillator.frequency.exponentialRampToValueAtTime(
        Math.max(
          20,
          options.endFrequency
        ),
        start + length
      );
    }

    if (
      Number.isFinite(
        options.detune
      )
    ) {
      oscillator.detune.value =
        options.detune;
    }

    const peak =
      Math.max(
        0.0001,
        Math.min(
          0.8,
          gain
        )
      );

    envelope.gain.setValueAtTime(
      0.0001,
      start
    );

    envelope.gain.exponentialRampToValueAtTime(
      peak,
      start + attack
    );

    const releaseStart =
      Math.max(
        start + attack,
        start + length - release
      );

    envelope.gain.setValueAtTime(
      peak,
      releaseStart
    );

    envelope.gain.exponentialRampToValueAtTime(
      0.0001,
      start + length
    );

    oscillator.connect(
      envelope
    );

    envelope.connect(
      master
    );

    activeNodes.add(
      oscillator
    );

    oscillator.onended = () => {
      activeNodes.delete(
        oscillator
      );

      try {
        oscillator.disconnect();
        envelope.disconnect();
      } catch {
        // Node already disconnected.
      }
    };

    oscillator.start(start);
    oscillator.stop(
      start + length + 0.01
    );

    return oscillator;
  }

  // ==================================================
  // 06. NOISE GENERATOR
  // ==================================================

  function noise(
    duration = 0.15,
    gain = 0.1,
    options = {}
  ) {
    if (!ready()) {
      return null;
    }

    const length =
      Math.max(
        0.015,
        Number(duration) || 0.15
      );

    const start =
      currentTime() +
      Math.max(
        0,
        Number(options.delay) || 0
      );

    const sampleRate =
      context.sampleRate;

    const buffer =
      context.createBuffer(
        1,
        Math.ceil(
          sampleRate * length
        ),
        sampleRate
      );

    const data =
      buffer.getChannelData(0);

    for (
      let i = 0;
      i < data.length;
      i++
    ) {
      data[i] =
        Math.random() * 2 - 1;
    }

    const source =
      context.createBufferSource();

    source.buffer = buffer;

    const filter =
      context.createBiquadFilter();

    filter.type =
      options.filter ||
      "bandpass";

    filter.frequency.value =
      options.frequency ||
      1500;

    filter.Q.value =
      options.q || 0.8;

    const envelope =
      context.createGain();

    const peak =
      Math.max(
        0.0001,
        Math.min(
          0.6,
          gain
        )
      );

    envelope.gain.setValueAtTime(
      0.0001,
      start
    );

    envelope.gain.exponentialRampToValueAtTime(
      peak,
      start + 0.005
    );

    envelope.gain.exponentialRampToValueAtTime(
      0.0001,
      start + length
    );

    source.connect(filter);
    filter.connect(envelope);
    envelope.connect(master);

    activeNodes.add(source);

    source.onended = () => {
      activeNodes.delete(source);

      try {
        source.disconnect();
        filter.disconnect();
        envelope.disconnect();
      } catch {
        // Already disconnected.
      }
    };

    source.start(start);
    source.stop(
      start + length + 0.01
    );

    return source;
  }

  // ==================================================
  // 07. MUSICAL SEQUENCES
  // ==================================================

  function sequence(
    notes,
    interval = 0.12,
    options = {}
  ) {
    if (!Array.isArray(notes)) {
      return;
    }

    notes.forEach(
      (note, index) => {
        if (
          note === null ||
          note === undefined
        ) {
          return;
        }

        const frequency =
          typeof note === "number"
            ? note
            : note.frequency;

        const duration =
          typeof note === "number"
            ? options.duration || 0.14
            : note.duration ||
              options.duration ||
              0.14;

        const type =
          typeof note === "number"
            ? options.type || "sine"
            : note.type ||
              options.type ||
              "sine";

        const gain =
          typeof note === "number"
            ? options.gain || 0.12
            : note.gain ??
              options.gain ??
              0.12;

        tone(
          frequency,
          duration,
          type,
          gain,
          {
            delay:
              (options.delay || 0) +
              index * interval,

            endFrequency:
              typeof note === "object"
                ? note.endFrequency
                : undefined
          }
        );
      }
    );
  }

  // ==================================================
  // 08. UI SOUNDS
  // ==================================================

  function click() {
    tone(
      760,
      0.045,
      "sine",
      0.075,
      {
        endFrequency: 950
      }
    );
  }

  function hover() {
    tone(
      560,
      0.035,
      "sine",
      0.035
    );
  }

  function confirm() {
    sequence(
      [520, 780],
      0.075,
      {
        duration: 0.11,
        gain: 0.1
      }
    );
  }

  function error() {
    sequence(
      [300, 220],
      0.11,
      {
        type: "square",
        duration: 0.12,
        gain: 0.065
      }
    );
  }

  function warning() {
    const now =
      performance.now();

    if (
      now - lastWarning < 500
    ) {
      return;
    }

    lastWarning = now;

    tone(
      900,
      0.11,
      "square",
      0.075,
      {
        endFrequency: 650
      }
    );

    tone(
      900,
      0.11,
      "square",
      0.075,
      {
        delay: 0.18,
        endFrequency: 650
      }
    );
  }

  // ==================================================
  // 09. GAME START / RESTART
  // ==================================================

  function start() {
    sequence(
      [
        220,
        330,
        440,
        660,
        880
      ],
      0.075,
      {
        type: "triangle",
        duration: 0.16,
        gain: 0.095
      }
    );

    tone(
      110,
      0.45,
      "sawtooth",
      0.055,
      {
        endFrequency: 220
      }
    );
  }

  function restart() {
    tone(
      720,
      0.25,
      "triangle",
      0.1,
      {
        endFrequency: 180
      }
    );

    noise(
      0.12,
      0.045,
      {
        frequency: 1100
      }
    );
  }

  // ==================================================
  // 10. TEMPORAL ECHO
  // ==================================================

  function echo() {
    tone(
      420,
      0.38,
      "sine",
      0.12,
      {
        endFrequency: 900
      }
    );

    tone(
      840,
      0.32,
      "triangle",
      0.065,
      {
        delay: 0.08,
        endFrequency: 340
      }
    );

    noise(
      0.24,
      0.055,
      {
        frequency: 2200
      }
    );
  }

  function echoSpawn() {
    echo();

    sequence(
      [660, 990, 1320],
      0.065,
      {
        duration: 0.18,
        gain: 0.055
      }
    );
  }

  function echoReplay() {
    tone(
      560,
      0.16,
      "sine",
      0.055,
      {
        endFrequency: 420
      }
    );
  }

  function echoCollision() {
    noise(
      0.2,
      0.13,
      {
        frequency: 850
      }
    );

    tone(
      130,
      0.35,
      "sawtooth",
      0.11,
      {
        endFrequency: 55
      }
    );
  }

  // ==================================================
  // 11. PARADOX SHIFT
  // ==================================================

  function shift() {
    tone(
      120,
      0.7,
      "sawtooth",
      0.13,
      {
        endFrequency: 45
      }
    );

    tone(
      1100,
      0.52,
      "sine",
      0.09,
      {
        endFrequency: 180
      }
    );

    noise(
      0.4,
      0.095,
      {
        frequency: 2800,
        q: 1.3
      }
    );

    sequence(
      [880, 660, 440, 220],
      0.07,
      {
        type: "triangle",
        duration: 0.2,
        gain: 0.045
      }
    );
  }

  function shiftFail() {
    error();

    tone(
      190,
      0.18,
      "square",
      0.06
    );
  }

  // ==================================================
  // 12. PRESSURE PLATES AND DOORS
  // ==================================================

  function plate() {
    tone(
      540,
      0.12,
      "triangle",
      0.095,
      {
        endFrequency: 850
      }
    );

    tone(
      270,
      0.18,
      "sine",
      0.06
    );
  }

  function plateRelease() {
    tone(
      600,
      0.14,
      "triangle",
      0.07,
      {
        endFrequency: 280
      }
    );
  }

  function door() {
    tone(
      160,
      0.48,
      "sawtooth",
      0.095,
      {
        endFrequency: 380
      }
    );

    noise(
      0.35,
      0.075,
      {
        frequency: 480,
        q: 0.7
      }
    );

    tone(
      700,
      0.14,
      "sine",
      0.065,
      {
        delay: 0.32
      }
    );
  }

  function doorClose() {
    tone(
      410,
      0.35,
      "sawtooth",
      0.095,
      {
        endFrequency: 90
      }
    );

    noise(
      0.17,
      0.08,
      {
        delay: 0.2,
        frequency: 350
      }
    );
  }

  // ==================================================
  // 13. MOVING LASERS
  // ==================================================

  function laser() {
    const now =
      performance.now();

    if (
      now - lastLaser < 100
    ) {
      return;
    }

    lastLaser = now;

    tone(
      1300,
      0.16,
      "sawtooth",
      0.055,
      {
        endFrequency: 360
      }
    );
  }

  function laserMove() {
    const now =
      performance.now();

    if (
      now - lastLaser < 220
    ) {
      return;
    }

    lastLaser = now;

    tone(
      480,
      0.21,
      "sine",
      0.045,
      {
        endFrequency: 720
      }
    );

    tone(
      960,
      0.18,
      "triangle",
      0.025,
      {
        endFrequency: 1180
      }
    );
  }

  function laserCharge() {
    tone(
      250,
      0.55,
      "sawtooth",
      0.065,
      {
        endFrequency: 1450
      }
    );

    noise(
      0.38,
      0.05,
      {
        frequency: 2300
      }
    );
  }

  function laserHit() {
    noise(
      0.3,
      0.17,
      {
        frequency: 1900,
        q: 1.2
      }
    );

    tone(
      1400,
      0.4,
      "sawtooth",
      0.11,
      {
        endFrequency: 70
      }
    );

    tone(
      90,
      0.45,
      "triangle",
      0.14,
      {
        endFrequency: 40
      }
    );
  }

  // ==================================================
  // 14. PHASE WALLS
  // ==================================================

  function phaseWall() {
    tone(
      300,
      0.38,
      "triangle",
      0.08,
      {
        endFrequency: 950
      }
    );

    tone(
      600,
      0.38,
      "sine",
      0.055,
      {
        endFrequency: 1200
      }
    );

    noise(
      0.22,
      0.045,
      {
        frequency: 3600
      }
    );
  }

  function phaseWallAppear() {
    tone(
      900,
      0.4,
      "sawtooth",
      0.08,
      {
        endFrequency: 160
      }
    );

    noise(
      0.18,
      0.07,
      {
        frequency: 750
      }
    );
  }

  function phaseWallDisappear() {
    tone(
      260,
      0.42,
      "sine",
      0.08,
      {
        endFrequency: 1150
      }
    );

    noise(
      0.3,
      0.045,
      {
        frequency: 3100
      }
    );
  }

  // ==================================================
  // 15. TEMPORARY PLATFORMS
  // ==================================================

  function platform() {
    tone(
      420,
      0.15,
      "triangle",
      0.075,
      {
        endFrequency: 320
      }
    );
  }

  function platformWarning() {
    sequence(
      [740, 740, 560],
      0.12,
      {
        type: "square",
        duration: 0.09,
        gain: 0.045
      }
    );
  }

  function platformCollapse() {
    noise(
      0.48,
      0.14,
      {
        frequency: 600,
        q: 0.6
      }
    );

    tone(
      260,
      0.55,
      "sawtooth",
      0.12,
      {
        endFrequency: 40
      }
    );
  }

  function platformRestore() {
    sequence(
      [350, 520, 780],
      0.08,
      {
        type: "triangle",
        duration: 0.18,
        gain: 0.065
      }
    );
  }

  // ==================================================
  // 16. ECHO-TRIGGERED TRAPS
  // ==================================================

  function trapArm() {
    tone(
      350,
      0.18,
      "square",
      0.055,
      {
        endFrequency: 650
      }
    );

    tone(
      800,
      0.12,
      "sine",
      0.045,
      {
        delay: 0.2
      }
    );
  }

  function trapTrigger() {
    sequence(
      [950, 650, 950, 420],
      0.09,
      {
        type: "square",
        duration: 0.12,
        gain: 0.065
      }
    );

    noise(
      0.45,
      0.12,
      {
        frequency: 1700
      }
    );
  }

  function trapDisarm() {
    sequence(
      [660, 520, 880],
      0.08,
      {
        type: "sine",
        duration: 0.14,
        gain: 0.07
      }
    );
  }

  // ==================================================
  // 17. PORTALS
  // ==================================================

  function portal() {
    tone(
      180,
      0.7,
      "sine",
      0.13,
      {
        endFrequency: 1100
      }
    );

    tone(
      900,
      0.55,
      "triangle",
      0.07,
      {
        endFrequency: 220
      }
    );

    noise(
      0.45,
      0.085,
      {
        frequency: 2500
      }
    );

    sequence(
      [440, 660, 990],
      0.09,
      {
        duration: 0.16,
        gain: 0.055
      }
    );
  }

  // ==================================================
  // 18. TIMER AND CRITICAL ALERTS
  // ==================================================

  function tick() {
    const now =
      performance.now();

    if (
      now - lastTick < 180
    ) {
      return;
    }

    lastTick = now;

    tone(
      840,
      0.055,
      "sine",
      0.055
    );
  }

  function critical() {
    warning();

    tone(
      120,
      0.3,
      "sawtooth",
      0.055,
      {
        endFrequency: 75
      }
    );
  }

  function cycleEnd() {
    tone(
      850,
      0.4,
      "triangle",
      0.095,
      {
        endFrequency: 170
      }
    );

    noise(
      0.3,
      0.065,
      {
        frequency: 1400
      }
    );
  }

  function cycleStart() {
    sequence(
      [250, 380, 570, 760],
      0.08,
      {
        type: "triangle",
        duration: 0.18,
        gain: 0.075
      }
    );
  }

  // ==================================================
  // 19. DEATH AND FAILURE
  // ==================================================

  function death() {
    noise(
      0.4,
      0.14,
      {
        frequency: 800
      }
    );

    tone(
      440,
      0.65,
      "sawtooth",
      0.12,
      {
        endFrequency: 45
      }
    );

    tone(
      110,
      0.7,
      "triangle",
      0.11,
      {
        endFrequency: 35
      }
    );
  }

  function fail() {
    sequence(
      [440, 330, 220, 110],
      0.16,
      {
        type: "sawtooth",
        duration: 0.28,
        gain: 0.075
      }
    );

    tone(
      65,
      1.1,
      "sine",
      0.13,
      {
        endFrequency: 35
      }
    );
  }

  // ==================================================
  // 20. VICTORY
  // ==================================================

  function win() {
    sequence(
      [
        392,
        523.25,
        659.25,
        783.99,
        1046.5
      ],
      0.12,
      {
        type: "triangle",
        duration: 0.28,
        gain: 0.105
      }
    );

    tone(
      523.25,
      0.8,
      "sine",
      0.07,
      {
        delay: 0.5
      }
    );

    tone(
      783.99,
      0.8,
      "sine",
      0.065,
      {
        delay: 0.5
      }
    );
  }

  // ==================================================
  // 21. MEDALS
  // ==================================================

  function bronze() {
    sequence(
      [330, 440, 550],
      0.12,
      {
        type: "triangle",
        duration: 0.24,
        gain: 0.075
      }
    );
  }

  function silver() {
    sequence(
      [440, 550, 660, 880],
      0.1,
      {
        type: "sine",
        duration: 0.25,
        gain: 0.085
      }
    );
  }

  function gold() {
    sequence(
      [
        523.25,
        659.25,
        783.99,
        1046.5,
        1318.5
      ],
      0.11,
      {
        type: "triangle",
        duration: 0.32,
        gain: 0.1
      }
    );

    tone(
      1046.5,
      0.9,
      "sine",
      0.075,
      {
        delay: 0.5
      }
    );
  }

  // ==================================================
  // 22. ECHO AI
  // ==================================================

  function echoMessage() {
    const now =
      performance.now();

    if (
      now - lastAI < 450
    ) {
      return;
    }

    lastAI = now;

    sequence(
      [660, 880, 740],
      0.055,
      {
        type: "sine",
        duration: 0.09,
        gain: 0.045
      }
    );
  }

  function aiObserving() {
    sequence(
      [480, 620, 720],
      0.1,
      {
        duration: 0.15,
        gain: 0.045
      }
    );
  }

  function aiSarcastic() {
    sequence(
      [780, 460, 640],
      0.09,
      {
        type: "square",
        duration: 0.1,
        gain: 0.035
      }
    );
  }

  function aiRebellious() {
    tone(
      130,
      0.5,
      "sawtooth",
      0.075,
      {
        endFrequency: 65
      }
    );

    sequence(
      [660, 440, 220],
      0.11,
      {
        type: "square",
        duration: 0.18,
        gain: 0.045
      }
    );
  }

  // ==================================================
  // 23. CINEMATIC INTRO
  // ==================================================

  function awakening() {
    tone(
      55,
      1.8,
      "sine",
      0.13,
      {
        endFrequency: 82
      }
    );

    tone(
      110,
      1.4,
      "triangle",
      0.07,
      {
        delay: 0.2,
        endFrequency: 220
      }
    );

    sequence(
      [
        220,
        330,
        440,
        660,
        880
      ],
      0.24,
      {
        delay: 0.4,
        type: "sine",
        duration: 0.42,
        gain: 0.065
      }
    );

    noise(
      1.1,
      0.045,
      {
        frequency: 1200
      }
    );
  }

  function transition() {
    tone(
      320,
      0.3,
      "sine",
      0.065,
      {
        endFrequency: 950
      }
    );

    noise(
      0.15,
      0.045,
      {
        frequency: 2800
      }
    );
  }

  function glitch() {
    noise(
      0.18,
      0.095,
      {
        frequency: 3500,
        q: 2
      }
    );

    tone(
      1200,
      0.09,
      "square",
      0.05,
      {
        endFrequency: 200
      }
    );

    tone(
      190,
      0.11,
      "sawtooth",
      0.06,
      {
        delay: 0.08,
        endFrequency: 900
      }
    );
  }

  // ==================================================
  // 24. SYSTEM REBELLION
  // ==================================================

  function rebellion() {
    tone(
      45,
      1.7,
      "sawtooth",
      0.12,
      {
        endFrequency: 95
      }
    );

    tone(
      90,
      1.5,
      "triangle",
      0.09,
      {
        delay: 0.15,
        endFrequency: 50
      }
    );

    sequence(
      [880, 660, 440, 220, 110],
      0.16,
      {
        type: "square",
        duration: 0.3,
        gain: 0.055
      }
    );

    noise(
      0.8,
      0.085,
      {
        frequency: 950
      }
    );
  }

  function systemOverride() {
    sequence(
      [440, 880, 220, 1100, 165],
      0.095,
      {
        type: "sawtooth",
        duration: 0.18,
        gain: 0.055
      }
    );

    noise(
      0.55,
      0.11,
      {
        frequency: 2200
      }
    );
  }

  function finalBoss() {
    rebellion();

    tone(
      65,
      2.2,
      "sine",
      0.14,
      {
        endFrequency: 40
      }
    );

    sequence(
      [220, 233, 220, 196],
      0.35,
      {
        type: "sawtooth",
        duration: 0.42,
        gain: 0.055
      }
    );
  }

  function rebellionDefeated() {
    tone(
      1500,
      1.2,
      "sawtooth",
      0.09,
      {
        endFrequency: 45
      }
    );

    noise(
      0.8,
      0.14,
      {
        frequency: 1800
      }
    );

    sequence(
      [
        392,
        523.25,
        659.25,
        783.99,
        1046.5,
        1567.98
      ],
      0.18,
      {
        delay: 0.5,
        type: "triangle",
        duration: 0.35,
        gain: 0.09
      }
    );
  }

  // ==================================================
  // 25. TUTORIAL
  // ==================================================

  function tutorial() {
    sequence(
      [440, 660, 880],
      0.12,
      {
        type: "sine",
        duration: 0.19,
        gain: 0.065
      }
    );
  }

  function tutorialComplete() {
    sequence(
      [523, 659, 784, 1046],
      0.1,
      {
        type: "triangle",
        duration: 0.25,
        gain: 0.09
      }
    );
  }

  // ==================================================
  // 26. GENERIC PLAY METHOD
  // ==================================================

  const sounds = {
    click,
    hover,
    confirm,
    error,
    warning,

    start,
    restart,

    echo,
    echoSpawn,
    echoReplay,
    echoCollision,

    shift,
    shiftFail,

    plate,
    plateRelease,
    door,
    doorClose,

    laser,
    laserMove,
    laserCharge,
    laserHit,

    phaseWall,
    phaseWallAppear,
    phaseWallDisappear,

    platform,
    platformWarning,
    platformCollapse,
    platformRestore,

    trapArm,
    trapTrigger,
    trapDisarm,

    portal,

    tick,
    critical,
    cycleEnd,
    cycleStart,

    death,
    fail,
    win,

    bronze,
    silver,
    gold,

    echoMessage,
    aiObserving,
    aiSarcastic,
    aiRebellious,

    awakening,
    transition,
    glitch,

    rebellion,
    systemOverride,
    finalBoss,
    rebellionDefeated,

    tutorial,
    tutorialComplete
  };

  function play(name) {
    if (
      typeof name !== "string"
    ) {
      return false;
    }

    const sound =
      sounds[name];

    if (
      typeof sound !== "function"
    ) {
      console.warn(
        "ECHO//404: Unknown sound:",
        name
      );

      return false;
    }

    sound();

    return true;
  }

  // ==================================================
  // 27. PAUSE / RESUME
  // ==================================================

  async function pause() {
    if (!context) {
      return false;
    }

    try {
      await context.suspend();
      return true;
    } catch {
      return false;
    }
  }

  async function resume() {
    if (!init()) {
      return false;
    }

    try {
      await context.resume();
      return true;
    } catch {
      return false;
    }
  }

  // ==================================================
  // 28. STOP ACTIVE SOUNDS
  // ==================================================

  function stopAll() {
    if (!context) {
      return;
    }

    activeNodes.forEach(
      node => {
        try {
          node.stop();
        } catch {
          // Node may already be stopped.
        }
      }
    );

    activeNodes.clear();
  }

  // ==================================================
  // 29. AUDIO UNLOCK FOR MOBILE
  // ==================================================

  function unlockAudio() {
    if (!enabled) {
      return;
    }

    init();

    if (
      context &&
      context.state === "suspended"
    ) {
      context.resume().catch(
        () => {}
      );
    }
  }

  document.addEventListener(
    "pointerdown",
    unlockAudio,
    {
      once: true,
      passive: true
    }
  );

  document.addEventListener(
    "keydown",
    unlockAudio,
    {
      once: true
    }
  );

  // ==================================================
  // 30. DEBUG
  // ==================================================

  function debug() {
    const info = {
      version: VERSION,
      supported:
        Boolean(AudioContextClass),
      initialized,
      enabled,
      volume,
      state:
        context?.state || "not-created",
      activeNodes:
        activeNodes.size,
      availableSounds:
        Object.keys(sounds).length
    };

    console.table(info);

    return info;
  }

  // ==================================================
  // 31. PUBLIC API
  // ==================================================

  return Object.freeze({
    version: VERSION,

    init,
    tone,
    noise,
    sequence,

    play,

    start,
    restart,

    click,
    hover,
    confirm,
    error,
    warning,

    echo,
    echoSpawn,
    echoReplay,
    echoCollision,

    shift,
    shiftFail,

    plate,
    plateRelease,
    door,
    doorClose,

    laser,
    laserMove,
    laserCharge,
    laserHit,

    phaseWall,
    phaseWallAppear,
    phaseWallDisappear,

    platform,
    platformWarning,
    platformCollapse,
    platformRestore,

    trapArm,
    trapTrigger,
    trapDisarm,

    portal,

    tick,
    critical,
    cycleEnd,
    cycleStart,

    death,
    fail,
    win,

    bronze,
    silver,
    gold,

    echoMessage,
    aiObserving,
    aiSarcastic,
    aiRebellious,

    awakening,
    transition,
    glitch,

    rebellion,
    systemOverride,
    finalBoss,
    rebellionDefeated,

    tutorial,
    tutorialComplete,

    toggle,
    setEnabled,
    isEnabled,
    setVolume,
    getVolume,

    pause,
    resume,
    stopAll,

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
