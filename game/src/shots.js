// Deterministic screenshot mode driven by shots.json scenes.
export function parseShotParams(search) {
  const params = new URLSearchParams(search || "");
  return { shot: params.get("shot"), seed: params.get("seed") ? Number(params.get("seed")) : null };
}
export async function loadShots(url) {
  try {
    const res = await fetch(url || "../shots.json");
    if (!res.ok) return [];
    const data = await res.json();
    return data.scenes || [];
  } catch (e) { return []; }
}
export function applyShot(state, scene) {
  if (!scene) return;
  if (scene.player) { state.player.x = scene.player.x; state.player.y = scene.player.y; }
  if (typeof scene.wanted === "number") {
    state.police.wanted = scene.wanted;
    state.police.heat = scene.wanted > 0 ? (scene.wanted - 1) * 100 + 50 : 0;
  }
  state.timeOfDay = scene.timeOfDay || "day";
  state.shotName = scene.name;
  state.shotMode = true;
}
export function shotNames(scenes) { return scenes.map(function (s) { return s.name; }); }
export function findShot(scenes, name) {
  for (const s of scenes) if (s.name === name) return s;
  return null;
}
