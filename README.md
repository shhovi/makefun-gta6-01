# Solar Bay: Outlaw

[![make.fun · gta6-01](https://make.fun/badge/gta6-01.svg)](https://make.fun/bounty/gta6-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-01)
[![rank](https://make.fun/badge/gta6-01/shhovi/makefun-gta6-01/rank.svg)](https://make.fun/bounty/gta6-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-01)
[![reward](https://make.fun/badge/gta6-01/shhovi/makefun-gta6-01/reward.svg)](https://make.fun/bounty/gta6-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-01)

Solar Bay: Outlaw is a 2D top-down open-world crime game that runs entirely in the browser — no installs, no assets, just open the page and play. Explore a seeded coastal city with beach and water on one edge, wander on foot or steal and drive cars, dodge traffic and pedestrian AI, rack up wanted stars while police chase you down, fight with punches and a pistol, and work through a 5-mission Mara Voss story chain. The HUD includes a minimap, menus cover title/pause/busted/wasted states, progress saves to localStorage, all sound is synthesized with WebAudio (no audio files), and a deterministic screenshot mode renders fixed-seed scenes for reproducible captures.

Built for [make.fun](https://make.fun) bounty gta6-01.

## How to run

Requires Deno. From the repo root:

```bash
deno run --allow-read --allow-net main.ts
```

Then open http://localhost:8000/ in your browser (the server serves `game/index.html` from the `game/` directory via `serve.ts`).

You can also open `game/index.html` directly in a browser, or serve the `game/` folder with any static file server.

## Controls

- WASD / Arrow keys — move / drive
- E — enter or exit vehicle
- F — punch
- Mouse — aim, click to shoot
- Esc — pause

## Tech

Vanilla ES modules, Canvas 2D, no dependencies, no external assets. City generation is seeded (mulberry32 PRNG) so the same seed always produces the same city.
