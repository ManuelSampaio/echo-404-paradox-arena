# Development phases and validation gates

The owner confirmed 25 vertical platform levels. The six-level example does not replace them. Finish and pause after each phase for owner validation before beginning the next one.

| Stage | Scope | State |
| --- | --- | --- |
| Unification | One platform engine and controls across all 25 levels; old entries redirected | Merged in PR #38 |
| Phase 1 | Coyote/jump buffer around 100ms, variable short/high touch jumps, smooth acceleration, larger feedback buttons and safe areas | Merged in PR #39; owner authorized phase 2 |
| Phase 2 | Configurable AXIOM phase shield, NYRA mobility, KAI-7 echo ability, dedicated HUD/button/cooldown | Implemented; awaiting owner play validation |
| Phase 3 | Five worlds of five levels; Tiled JSON; pressure buttons, doors, lasers, moving platforms and double-echo puzzles; three stars on all 25 | Pending |
| Phase 4 | Slow time, fragment magnet, extra shield, earned currency/upgrades, best-time ghost | Pending |
| Phase 5 | Particles/trails, subtle glitch/scanlines, shake, transitions, Howler audio, persistent mute | Pending |
| Phase 6 | Modular Vite build, PWA packaging, Capacitor Android then iOS preparation, store checklists and light non-pay-to-win monetization plan | Pending |

## Phase 1 validation

`origin-feel-config.js` holds the game-feel values. Coyote is 110ms and jump buffering is 120ms. CURTO and ALTO retain distinct jump families; holding each touch button increases height within that family. Keyboard retains variable Space jumps. Horizontal acceleration/braking are configurable. Movement buttons are 60×82 CSS pixels and actions are 60×56 (58 pixels wide on very narrow screens), with visible pressed state and safe-area padding.

The real Phaser suite verifies grace expiry, buffering, tap/held height differences for both jump buttons, pause/cancel cleanup and traversal of all 25 maps. It isolates traversal and uses damage immunity, not a continuous human combat playthrough. Browser viewport checks do not replace physical iPhone validation.

Validate on the phone: late jumps at a ledge, an early jump before landing, CURTO/ALTO taps versus holds, simultaneous movement/jump, and button placement with Safari/browser bars. The owner authorized advancing from phase 1. Phase 3 must wait for phase 2 feedback.

## Phase 2 validation

| Operator | Ability | Recovery | Rules |
| --- | --- | --- | --- |
| AXIOM | Phase shield for 1.5s | 8s | Blocks incoming damage; does not stop falls |
| NYRA | Second jump in the air | 4s | One per flight; landing resets the flight limit |
| KAI-7 | Record a second independent echo | 12s | Requires a fixed first echo; recording uses ECO to fix; at most two echoes coexist |

All values and icons are in `origin-feel-config.js`. The dedicated button and HUD indicate readiness/recovery. Q is the keyboard binding. Timers freeze during pause; invalid uses do not consume recovery. The six-step simulator teaches each selected ability and clears practice echoes/shields/cooldowns before the actual mission. Trained returning players keep their existing entry preference and can select repeat practice.

Tests cover shield protection/expiry, one jump per flight, cooldown rejection, two independent traces maintaining the anchor, retirement of the oldest echo, full practice for all three operators and all 25 traversal routes. No physical iPhone test or continuous combat playthrough is claimed. Stop after publishing phase 2 for owner validation; do not begin phase 3 automatically.
