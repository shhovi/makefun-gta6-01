// Deterministic screenshot mode, driven by shots.json (repo root).
// Usage: index.html?shot=city | drive | chase | mission
// Places the player, wanted level and time of day exactly as the
// scene describes, with a fixed seed — same scene, same frame.

export const FALLBACK_SCENES = [
  { name: "city", seed: 42, player: { x: 640, y: 360, inVehicle: false }, wanted: 0, timeOfDay: "day" },
  { name: "drive", seed: 7, player: { x: 512, y: 288, inVehicle: true }, wanted: 0, timeOfDay: "day" },
  { name: "chase", seed: 99, player: { x: 768, y: 432, inVehicle: true }, wanted: 3, timeOfDay: "dusk" },
  { name: "mission", seed: 1234, player: { x: 384, y: 216, inVehicle: false }, wanted: 0, timeOfDay: "day", mission: 1, dialog: "Mara Voss: One last job, and Solar Bay is ours." },
];

export async function loadShots(url = "../shots.json") {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`shots fetch ${res.status}`);
    const data = await res.json();
    return Array.isArray(data.scenes) ? data.scenes : FALLBACK_SCENES;
  } catch {
    return FALLBACK_SCENES;
  }
}

export function shotFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get("shot");
}

export function findScene(scenes, name) {
  return scenes.find((s) => s.name === name) ?? null;
}

export function applyScene(state, scene) {
  if (!scene) return false;
  state.seed = scene.seed;
  state.timeOfDay = scene.timeOfDay ?? "day";
  state.player.x = scene.player.x;
  state.player.y = scene.player.y;
  state.wanted.heat = scene.wanted * 20;
  state.wanted.level = scene.wanted;
  if (scene.mission) {
    state.missionState.index = Math.max(0, scene.mission - 1);
    state.missionState.dialogTimer = 30;
  }
  state.shot = scene;
  return true;
}
