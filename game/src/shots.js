// Deterministic screenshot mode: reads a shots.json scene, fixes seed/time, renders one frame.
// Open with ?shot=<scene-name>, e.g. index.html?shot=chase
export function getShotSceneFromURL() {
  const params = new URLSearchParams(window.location.search);
  if (!params.has("shot")) return null;
  return params.get("shot");
}

export async function loadShotScene(name) {
  try {
    const res = await fetch("../shots.json");
    if (!res.ok) return null;
    const scenes = await res.json();
    return scenes.find((s) => s.name === name) ?? null;
  } catch {
    return null;
  }
}

export function applyShotScene(scene, game) {
  if (!scene || !game) return;
  game.seed = scene.seed;
  if (scene.player) {
    game.player.x = scene.player.x;
    game.player.y = scene.player.y;
  }
  game.wanted.heat = scene.wanted ?? 0;
  game.wanted.stars = scene.wanted ?? 0;
  game.timeOfDay = scene.timeOfDay ?? "day";
  game.shotMode = true;
  game.fixedTime = 12.5; // frozen clock for identical frames
}

export function renderShotFrame(game) {
  // Advance the world by fixed steps so AI settles deterministically, then draw once.
  for (let i = 0; i < 30; i++) game.step(1 / 60, true);
  game.draw();
}
