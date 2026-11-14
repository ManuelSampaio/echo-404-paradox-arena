"use strict";
/* ECHO//404 v5.0 — THE REBIRTH / PHASE 1
   Interactive first-level guidance; additive to Awakening and the v4.3 engine.
   Created & developed by MANUEL SAMPAIO01. */
(() => {
  const $ = id => document.getElementById(id);
  const KEY = "echo404_rebirth_guided_v1";
  const steps = [
    { title: "MOVE-TE", detail: "Usa WASD, as setas ou o controlo no telemóvel.", target: "move" },
    { title: "PISA A PLACA", detail: "Procura o círculo luminoso e fica sobre ele.", target: "plate" },
    { title: "CRIA UM ECO", detail: "Espera pelo fim do ciclo. O teu percurso será repetido.", target: "echo" },
    { title: "ABRE AS DUAS PORTAS", detail: "Usa os ecos para manter as duas placas ativas e chegar à saída.", target: "door" }
  ];
  let enabled = false;
  let step = 0;
  let lastRunning = false;
  let loop = 0;
  let lastLevel = -1;
  let lastPlateActive = false;
  const panel = document.createElement("aside");
  panel.id = "rebirthGuide";
  panel.className = "rebirth-guide";
  panel.setAttribute("aria-label", "Objetivo da missão");
  panel.innerHTML = '<div class="rebirth-top"><span id="rebirthTag">MISSÃO</span><button id="rebirthToggle" type="button">GUIA</button></div><strong id="rebirthTitle"></strong><p id="rebirthDetail"></p><div class="rebirth-progress" id="rebirthProgress"></div><button id="rebirthSkip" type="button">SALTAR GUIA</button>';
  const anchor = $("arenaShell");
  if (!anchor || !window.EchoGame) return;
  anchor.insertAdjacentElement("beforebegin", panel);
  const title = $("rebirthTitle"), detail = $("rebirthDetail");
  const skip = $("rebirthSkip"), toggle = $("rebirthToggle");
  const dots = $("rebirthProgress");
  const readDone = () => { try { return localStorage.getItem(KEY) === "done"; } catch (_) { return false; } };
  const saveDone = () => { try { localStorage.setItem(KEY, "done"); } catch (_) {} };
  const state = () => window.EchoGame?.getState?.();
  const activeLevel = s => s?.levelIndex === 0;
  const legacyOverlayOpen = () => {
    const intro = $("awakeningIntro"), tutorial = $("awakeningTutorial");
    return [intro,tutorial].some(el => el && !el.classList.contains("hidden"));
  };
  function render(s) {
    const current = steps[step];
    const guide = enabled && activeLevel(s) && !s?.finished;
    panel.classList.toggle("rebirth-guided", guide);
    $("rebirthTag").textContent = guide ? "TREINO INTERATIVO · " + (step + 1) + "/4" : "OBJETIVO · NÍVEL " + (s?.levelNumber || 1);
    title.textContent = guide ? current.title : objective(s).title;
    detail.textContent = guide ? current.detail : objective(s).detail;
    dots.textContent = guide ? "● ".repeat(step + 1) + "○ ".repeat(3 - step) : "";
    skip.hidden = !guide;
    toggle.textContent = guide ? "GUIA ATIVO" : "REVER GUIA";
    toggle.disabled = guide;
  }
  function objective(s) {
    if (!s?.running && !s?.finished) return {title:"PRONTO PARA JOGAR",detail:"Toca em JOGAR para começar. Procura a saída verde."};
    if (s?.finished) return {title:"SIMULAÇÃO TERMINADA",detail:"Toca em JOGAR NOVAMENTE ou escolhe outro nível."};
    if (s?.doorOpen) return {title:"PORTAS ABERTAS",detail:"Segue para a saída verde!"};
    if (s?.doorStates?.length > 1) return {title:"ABRE AS DUAS PORTAS",detail:"Portas abertas: " + s.doorStates.filter(Boolean).length + "/2. Usa ecos nas placas para atravessar."};
    if ((s?.recordingsCount || 0) > 0) return {title:"USA O TEU ECO",detail:"Deixa o eco sobre a placa para abrir a porta."};
    return {title:"ATIVA A PLACA",detail:"Pisa a placa luminosa. O teu percurso será gravado."};
  }
  function advance(target) {
    if (!enabled || steps[step]?.target !== target) return;
    if (step < steps.length - 1) step++;
    else { enabled = false; saveDone(); }
    render(state());
  }
  function startGuide() {
    step = 0;
    enabled = true;
    render(state());
  }
  toggle.addEventListener("click", startGuide);
  skip.addEventListener("click", () => { enabled = false; saveDone(); render(state()); });
  window.addEventListener("echo404:firstmove", () => advance("move"));
  window.addEventListener("echo404:echo", () => advance("echo"));
  window.addEventListener("echo404:dooropen", () => advance("door"));
  window.addEventListener("echo404:win", () => { if(enabled){enabled=false;saveDone();} render(state()); });
  window.addEventListener("echo404:levelselected", () => {
    const s = state();
    if (!activeLevel(s)) enabled = false;
    render(s);
  });
  window.addEventListener("echo404:start", () => render(state()));
  const plateActive = s => {
    const p = s?.player;
    const plates = s?.level?.plates || [];
    return Boolean(p && plates.some(q => Math.hypot(p.x - q.x,p.y - q.y) < 27));
  };
  function tick() {
    const s = state();
    if (!s) return;
    if (s.levelIndex !== lastLevel) {
      lastLevel = s.levelIndex;
      if (!readDone() && activeLevel(s)) startGuide();
      else render(s);
    }
    const onPlate = plateActive(s);
    if (s.running && onPlate && !lastPlateActive) advance("plate");
    lastPlateActive = onPlate;
    if (s.running !== lastRunning) { lastRunning = s.running; render(s); }
    if (!enabled && s.running) render(s);
    loop = window.setTimeout(tick, 350);
  }
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) { clearTimeout(loop); loop = 0; }
    else if (!loop) tick();
  });
  render(state());
  tick();
  window.EchoRebirthGuide = { restart: startGuide, getState: () => ({enabled,step,completed:readDone()}) };
})();