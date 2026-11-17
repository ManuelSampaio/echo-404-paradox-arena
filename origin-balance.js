/* Bot references ×2.2; human first-run pacing remains to be measured. */
window.OriginBalance={
  "version": "16.0.0",
  "targets": {
    "origin": 60,
    "drift": 80,
    "resonance": 90,
    "mirage": 70,
    "window": 105,
    "junction": 90,
    "interference": 80,
    "trace": 95,
    "reflection": 110,
    "escape": 100,
    "current": 95,
    "frequency": 90,
    "between": 115,
    "phasebridge": 85,
    "fracture": 105,
    "blind": 95,
    "order": 110,
    "presents": 105,
    "silence": 80,
    "overload": 105,
    "signatures": 160,
    "maze": 95,
    "lastwindow": 100,
    "paradox": 85,
    "archive": 115
  }
};
OriginPilot.levels.forEach(l=>l.targetTime=OriginBalance.targets[l.id]||180);
