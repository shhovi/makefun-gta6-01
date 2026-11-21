# Solar Bay: Outlaw

[![make.fun · gta6-01](https://make.fun/badge/gta6-01.svg)](https://make.fun/bounty/gta6-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-01)
[![rank](https://make.fun/badge/gta6-01/shhovi/makefun-gta6-01/rank.svg)](https://make.fun/bounty/gta6-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-01)
[![reward](https://make.fun/badge/gta6-01/shhovi/makefun-gta6-01/reward.svg)](https://make.fun/bounty/gta6-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-01)

Built for [make.fun](https://make.fun) bounty gta6-01.

Solar Bay: Outlaw is a 2D top-down open-world crime game set in a seeded coastal city. Roam on foot or steal a car and drive, dodge traffic and pedestrian AI, earn wanted stars and outrun the police chase — or get busted, or wasted. Fight with punch and pistol combat, work through the 5-mission Mara Voss chain, and watch the HUD and minimap to stay alive. Menus, localStorage saves, WebAudio synth sound, and a deterministic screenshot mode round out the build. Every run with seed 1337 rebuilds the same bay, block for block.

## Features

- Seeded coastal city generation (same seed, same city)
- On-foot movement plus enterable vehicles and driving
- Traffic AI cars and wandering / fleeing pedestrians
- Wanted stars with police chase, busted, and wasted states
- Punch and pistol combat
- 5-mission Mara Voss story chain
- HUD with health, money, stars, objective, and minimap
- Title, pause, busted, and wasted menus
- localStorage save and load
- WebAudio synth effects (no audio files)
- Deterministic screenshot mode driven by shots.json

## How to run

### Play in the browser (Deno)

Run the Deno entry point, then open the game page:

```sh
deno run --allow-net --allow-read main.ts
```

Then open game/index.html in your browser (served by serve.ts), or open game/index.html directly as a static file.

### Grader / headless (Node)

```sh
node main.ts
```

Under Node, main.ts copies game/ and screenshots/ into the output directory, writes dossier.json via the vendored makefun helper, runs a deterministic 600-tick simulation with seed 1337, and writes solar-bay-run.json. It always exits 0.

## Screenshots

- [City](screenshots/1-city.jpg) — screenshots/1-city.jpg
- [Drive](screenshots/2-drive.jpg) — screenshots/2-drive.jpg
- [Chase](screenshots/3-chase.jpg) — screenshots/3-chase.jpg
- [Mission](screenshots/4-mission.jpg) — screenshots/4-mission.jpg

## Controls

- WASD / arrow keys: move and drive
- E: enter or exit vehicle
- Space: punch
- F or mouse click: fire pistol
- Esc: pause menu
