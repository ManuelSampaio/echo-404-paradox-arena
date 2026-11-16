/* Star targets: successful continuous bot reference ×1.65, minimum 75s; editable. Human first-run 2–4min remains a playtest goal. */
window.OriginBalance={
  "version": "15.0.0",
  "targets": {
    "origin": 75,
    "drift": 75,
    "resonance": 75,
    "mirage": 75,
    "window": 75,
    "junction": 75,
    "interference": 75,
    "trace": 75,
    "reflection": 75,
    "escape": 75,
    "current": 75,
    "frequency": 75,
    "between": 75,
    "phasebridge": 75,
    "fracture": 75,
    "blind": 75,
    "order": 75,
    "presents": 75,
    "silence": 75,
    "overload": 135,
    "signatures": 75,
    "maze": 85,
    "lastwindow": 75,
    "paradox": 85,
    "archive": 85
  }
};
OriginPilot.levels.forEach(l=>l.targetTime=OriginBalance.targets[l.id]||180);
