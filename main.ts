// Solar Bay: Outlaw — Deno entrypoint.
// Starts the static file server for the browser game.

import { serveStatic } from "./serve.ts";

const PORT = 8000; // fixed port so the game URL is predictable

serveStatic({ root: "./game", port: PORT });

console.log(`Solar Bay: Outlaw running at http://localhost:${PORT}/`);
