# Development phases and validation gates

The owner confirmed 25 vertical platform levels. The six-level example does not replace them. Finish and pause after each phase for owner validation before beginning the next one.

| Stage | Scope | State |
| --- | --- | --- |
| Unification | One platform engine and controls across all 25 levels; old entries redirected | Merged in PR #38 |
| Phase 1 | Coyote/jump buffer around 100ms, variable short/high touch jumps, smooth acceleration, larger feedback buttons and safe areas | Implemented; awaiting owner play validation |
| Phase 2 | Configurable AXIOM phase shield, NYRA mobility, KAI-7 echo ability, dedicated HUD/button/cooldown | Pending phase 1 validation |
| Phase 3 | Five worlds of five levels; Tiled JSON; pressure buttons, doors, lasers, moving platforms and double-echo puzzles; three stars on all 25 | Pending |
| Phase 4 | Slow time, fragment magnet, extra shield, earned currency/upgrades, best-time ghost | Pending |
| Phase 5 | Particles/trails, subtle glitch/scanlines, shake, transitions, Howler audio, persistent mute | Pending |
| Phase 6 | Modular Vite build, PWA packaging, Capacitor Android then iOS preparation, store checklists and light non-pay-to-win monetization plan | Pending |

## Phase 1 validation

`origin-feel-config.js` holds the game-feel values. Coyote is 110ms and jump buffering is 120ms. CURTO and ALTO retain distinct jump families; holding each touch button increases height within that family. Keyboard retains variable Space jumps. Horizontal acceleration/braking are configurable. Movement buttons are 60×82 CSS pixels and actions are 60×56 (58 pixels wide on very narrow screens), with visible pressed state and safe-area padding.

The real Phaser suite verifies grace expiry, buffering, tap/held height differences for both jump buttons, pause/cancel cleanup and traversal of all 25 maps. It isolates traversal and uses damage immunity, not a continuous human combat playthrough. Browser viewport checks do not replace physical iPhone validation.

Validate on the phone: late jumps at a ledge, an early jump before landing, CURTO/ALTO taps versus holds, simultaneous movement/jump, and button placement with Safari/browser bars. Phase 2 must wait for the owner's feedback.
