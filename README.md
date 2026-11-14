# ECHO//404 — ORIGIN REBORN v12.0

Created & developed by **MANUEL SAMPAIO01**.

A browser game with two connected modes:

- **Campaign** (`index.html`): the primary entry, six lateral missions, temporal echoes, patrols and story progression.
- **Classic** (`classic.html`): the original temporal puzzle arena, operators, levels, medals and controls.

## Campaign worlds

| Mission | Setting | Enemies and objectives |
| --- | --- | --- |
| 01 — ORIGIN REBORN | Ruined dock, vertical silo, crane and roofs | Phaser pilot, dash, echo-powered crane and hidden memories |
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

## v12.0 — ORIGIN REBORN pilot

`origin-reborn.html` is the new mission 01 and the first Phaser mission. Missions 02–06 keep their previous engine for now. `origin-v97.html` remains in the archive, and `classic.html` is unchanged.

The new authored map climbs from a ruined dock through a switchback silo, an echo-powered crane and upper rooftops. Movement has acceleration/braking, variable-height jumps, jump buffering, coyote time and a short dash. A recorded echo replays once and holds its final pose; keeping it on the anchor powers the moving crane. Three required fragments lead to evacuation, with three optional memories, checkpoint recovery and bronze/silver/gold runs. Both the new pilot and the older missions use smaller completion cards with optional story details.

The pilot uses the locally vendored **Phaser 3.90.0** distribution (MIT, `vendor/PHASER-LICENSE.md`). All images are served from this repository. No API key, runtime CDN or build step is needed. The original completion/result keys remain compatible, and completing the pilot cannot downgrade a previously saved gold medal or best time.

New source files:

- `origin-pilot-data.js`: map, replay interpolation, medal rules and compatible save handling.
- `origin-pilot.js`: Phaser scene, Arcade movement/collisions, echo crane, controls, audio and patrols.
- `origin-pilot.css`: responsive gameplay UI and compact notifications.
- `scripts/create-origin-art.cjs`: reproducible explorer/patrol sprite sheets, terrain and backdrop.

For the real Phaser physics and Canvas rendering checks:

```sh
npm ci
npm test
npm run test:phaser
# Optional: export an actual Phaser-rendered frame.
RENDER=/tmp/origin-reborn.png npm run test:phaser
```

The Phaser suite uses a DOM adapter and predecoded local art while running the actual Arcade solver. It checks every authored jump, the optional rooftop route, echo recording, crane carrying, movement, pause, recovery and victory. It is not a physical iPhone test or a browser asset-loader test.
