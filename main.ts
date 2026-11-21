// Solar Bay: Outlaw entry point.
// Deno: start the static server for ./game.
// Node: deterministic headless simulation, writes solar-bay-run.json, exits 0.
const isDeno = typeof Deno !== "undefined";

if (isDeno) {
  const mod = await import("./serve.ts");
  await mod.serveStatic(8000);
} else {
  try {
    const fs = await import("node:fs");
    const cityMod = await import("./game/src/city.js");
    const randomMod = await import("./game/src/random.js");
    const configMod = await import("./game/src/config.js");
    const seed = 1337; // fixed seed: headless run is deterministic
    const city = cityMod.generateCity(seed);
    const rng = randomMod.mulberry32(seed);
    const worldW = configMod.CONFIG.WORLD_W;
    const worldH = configMod.CONFIG.WORLD_H;
    const entities = [];
    for (let i = 0; i < 40; i++) {
      entities.push({
        x: rng() * worldW,
        y: rng() * worldH,
        vx: (rng() - 0.5) * 2,
        vy: (rng() - 0.5) * 2,
      });
    }
    for (let tick = 0; tick < 600; tick++) {
      for (const e of entities) {
        e.x += e.vx;
        e.y += e.vy;
        if (e.x < 0 || e.x > worldW) e.vx *= -1;
        if (e.y < 0 || e.y > worldH) e.vy *= -1;
        e.x = Math.max(0, Math.min(worldW, e.x));
        e.y = Math.max(0, Math.min(worldH, e.y));
      }
    }
    let checksum = 0;
    for (const e of entities) checksum += Math.round(e.x * 100) + Math.round(e.y * 100);
    const summary = {
      seed: seed,
      cityStats: city.stats,
      entityCount: entities.length,
      ticks: 600,
      checksum: checksum,
    };
    const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/tmp";
    fs.writeFileSync(outDir + "/solar-bay-run.json", JSON.stringify(summary, null, 2));
    console.log("Solar Bay headless run complete: " + JSON.stringify(summary));
  } catch (err) {
    try {
      const fs2 = await import("node:fs");
      const outDir2 = process.env.MAKEFUN_OUTPUT_DIR ?? "/tmp";
      const message = err && err.message ? err.message : String(err);
      fs2.writeFileSync(outDir2 + "/solar-bay-run.json", JSON.stringify({ error: message }, null, 2));
    } catch {
      // Nothing else we can do; still exit 0 per contract.
    }
    console.log("Solar Bay headless run error captured");
  }
}
