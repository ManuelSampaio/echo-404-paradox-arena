# ECHO//404 — Living Worlds v11.0

Created & developed by **MANUEL SAMPAIO01**.

A browser game with two connected modes:

- **Campaign** (`index.html`): the primary entry, six lateral missions, temporal echoes, patrols and story progression.
- **Classic** (`classic.html`): the original temporal puzzle arena, operators, levels, medals and controls.

## Campaign worlds

| Mission | Setting | Enemies and objectives |
| --- | --- | --- |
| 01 — Último Sinal | Frozen ORIGIN ruins | Drones, scouts, echo training and escape |
| 02 — Sinal Fantasma | Foundry | Heavy robots, turrets and timed steam |
| 03 — The Forgotten | Overgrown biodome | Quadruped hunters, spores and NYRA rescue |
| 04 — The Truth | NULL reactor | Sentinels, electric pulses and echo-powered boss overload |
| 05 — The Architect | Rainy city rooftops | Sniper, scouts and three communication relays |
| 06 — Project ARCA | Origin server | Crawlers, drones and a timed ordered terminal sequence |

## Structure

- `campaign-worlds.js`: mission themes, layouts, briefings and enemy archetypes.
- `campaign-world.js`: shared Canvas renderer, articulated characters, patrol state machine, cover, projectiles and environmental hazards.
- `campaign-hub.js`: read-only campaign continuation and medal display.
- `origin-v97.html` through `origin-v102.html`: mission story, temporal recording, controls and mission-specific objectives.
- `game.js`, `storage.js` and the other classic engine modules retain the classic implementation.
- `origin-v91.html` and `origin-v961.html` remain accessible through the archive.

Campaign graphics use browser-native Canvas 2D; they require no external API, token or game library download. Classic keeps its existing optional CDN rendering dependencies.

## Run locally

Serve the repository with any static web server, for example:

```sh
python -m http.server 8000
```

Open `http://localhost:8000/`. Use left/right and up/space to move/jump, E to record an echo, or the two-hand touch controls.

## Verification

Dependency-free checks (Node.js):

```sh
node tests/navigation.cjs
node tests/worlds.cjs
```

Checks cover syntax/links, save preservation, both modes, mission completion/retry, actual echo gate physics, NULL overload, relays, ARCA ordering/timeout, patrol detection/chase/search, cover, damage, timed hazards, safe spawn and reachable platform geometry.

For real Canvas rendering checks, optionally install `@napi-rs/canvas` in your development environment and run:

```sh
ECHO_RENDER_DIR=/tmp/echo-worlds node tests/navigation.cjs
```

This generates one mission frame per world; it does not replace browser, touch or physical-device playtesting.

Progress remains in this browser's localStorage under the existing keys. No save migration or reset is required. Continue opens the next unfinished mission from its beginning; in-mission checkpoint positions are not saved between visits.
