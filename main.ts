// Solar Bay: Outlaw — Deno entrypoint. Starts the static server on port 8000.
// Run: deno run --allow-read --allow-net main.ts
import { serveStatic } from "./serve.ts";

const PORT = 8000;

serveStatic({ port: PORT, root: "./game" });
console.log(`Solar Bay: Outlaw running at http://localhost:${PORT}/`);
