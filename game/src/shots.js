export const SHOT_SCENES = [
  { name: "city", file: "1-city.jpg", seed: 1337, time: 12, wanted: 0, money: 250, health: 100, mission: 0, player: { x: 320, y: 240, angle: 0, inVehicle: false } },
  { name: "drive", file: "2-drive.jpg", seed: 1337, time: 15, wanted: 1, money: 400, health: 100, mission: 1, player: { x: 480, y: 360, angle: 1.57, inVehicle: true } },
  { name: "chase", file: "3-chase.jpg", seed: 1337, time: 18, wanted: 3, money: 650, health: 72, mission: 2, player: { x: 640, y: 300, angle: 0.78, inVehicle: true } },
  { name: "mission", file: "4-mission.jpg", seed: 1337, time: 10, wanted: 0, money: 900, health: 100, mission: 3, player: { x: 400, y: 400, angle: 0, inVehicle: false } },
];

export function parseShotParam(search) {
  const params = new URLSearchParams(search || "");
  const shot = params.get("shot");
  if (!shot) return null;
  for (const scene of SHOT_SCENES) {
    if (scene.name === shot) return scene;
  }
  return null;
}

export function applyShot(state, scene) {
  state.seed = scene.seed;
  state.player.x = scene.player.x;
  state.player.y = scene.player.y;
  state.player.angle = scene.player.angle;
  state.player.health = scene.health;
  state.player.money = scene.money;
  state.police.wanted = scene.wanted;
  state.police.heat = scene.wanted * 20;
  state.missions.index = scene.mission;
  state.shotMode = true;
  state.shotName = scene.name;
  state.timeOfDay = scene.time;
  state.shotFile = scene.file;
  return state;
}
