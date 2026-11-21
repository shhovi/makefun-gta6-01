import { cpSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { buildDossier } from "./vendor/makefun-game.ts";

const isDeno = typeof Deno !== "undefined";

if (isDeno) {
  const mod = await import("./serve.ts");
  await mod.serveStatic(8000);
} else {
  try {
    const repoDir = process.env.MAKEFUN_BOT_DIR ?? import.meta.dirname ?? process.cwd();
    const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
    mkdirSync(outDir, { recursive: true });
    cpSync(join(repoDir, "game"), join(outDir, "game"), { recursive: true });
    cpSync(join(repoDir, "screenshots"), join(outDir, "screenshots"), { recursive: true });
    writeFileSync(join(outDir, "dossier.json"), buildDossier(outDir, { text_max_bytes: 163840, screenshots: { max: 4, max_bytes: 262144 }, game_max_files: 993, game_max_bytes: 50331648 }));
    const randomMod = await import("./game/src/random.js");
    const configMod = await import("./game/src/config.js");
    const cityMod = await import("./game/src/city.js");
    const city = cityMod.generateCity(1337);
    const rng = randomMod.mulberry32(1337);
    let checksum = 0;
    let x = 0;
    let y = 0;
    for (let tick = 0; tick < 600; tick++) {
      x += (rng() - 0.5) * configMod.CONFIG.playerSpeed;
      y += (rng() - 0.5) * configMod.CONFIG.playerSpeed;
      checksum = (checksum + Math.floor(rng() * 1000)) % 1000000007;
    }
    const summary = {
      game: "Solar Bay: Outlaw",
      seed: 1337,
      ticks: 600,
      buildings: city.buildings.length,
      roads: city.roads.length,
      gridWidth: city.grid.width,
      gridHeight: city.grid.height,
      checksum,
      finalX: Math.round(x * 100) / 100,
      finalY: Math.round(y * 100) / 100,
      ok: true,
    };
    writeFileSync(join(outDir, "solar-bay-run.json"), JSON.stringify(summary, null, 2));
    console.log("solar-bay-outlaw ok seed=1337 ticks=600 buildings=" + String(city.buildings.length));
  } catch (err) {
    try {
      const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
      mkdirSync(outDir, { recursive: true });
      const message = err instanceof Error ? err.message : String(err);
      writeFileSync(join(outDir, "solar-bay-run.json"), JSON.stringify({ game: "Solar Bay: Outlaw", ok: false, error: message }, null, 2));
    } catch {
      console.log("solar-bay-outlaw error");
    }
    console.log("solar-bay-outlaw done with error");
  }
}
