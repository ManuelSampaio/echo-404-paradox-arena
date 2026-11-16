/* Star targets: continuous bot reference ×2.2, minimum 60s; editable. Human first-run duration remains unconfirmed. */
window.OriginBalance={
  "version": "15.0.0",
  "targets": {
    "origin": 60,
    "drift": 60,
    "resonance": 60,
    "mirage": 60,
    "window": 60,
    "junction": 65,
    "interference": 65,
    "trace": 60,
    "reflection": 65,
    "escape": 65,
    "current": 60,
    "frequency": 60,
    "between": 60,
    "phasebridge": 60,
    "fracture": 60,
    "blind": 90,
    "order": 70,
    "presents": 65,
    "silence": 80,
    "overload": 65,
    "signatures": 70,
    "maze": 75,
    "lastwindow": 75,
    "paradox": 75,
    "archive": 75
  }
};
OriginPilot.levels.forEach(l=>l.targetTime=OriginBalance.targets[l.id]||180);
