export const CONFIG = {
  worldWidth: 1920,
  worldHeight: 1440,
  tileSize: 48,
  gridCols: 40,
  gridRows: 30,
  canvasWidth: 960,
  canvasHeight: 600,
  playerSpeed: 3.2,
  playerSprint: 4.6,
  playerRadius: 10,
  carMaxSpeed: 9,
  carAccel: 0.22,
  carFriction: 0.96,
  carTurn: 0.045,
  trafficCount: 10,
  pedCount: 14,
  policeBase: 2,
  maxWanted: 5,
  punchRange: 26,
  punchDamage: 12,
  pistolRange: 240,
  pistolDamage: 25,
  startHealth: 100,
  startMoney: 250,
  seed: 1337,
  version: "round6",
};

export function clamp(value, min, max) {
  if (value < min) return min;
  if (value > max) return max;
  return value;
}

export function dist2(ax, ay, bx, by) {
  const dx = ax - bx;
  const dy = ay - by;
  return dx * dx + dy * dy;
}
