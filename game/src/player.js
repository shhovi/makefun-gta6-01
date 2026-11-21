// Player: on-foot movement, vehicle enter/exit, health.
import { CONFIG } from "./config.js";
import { isBlocked } from "./city.js";

export function createPlayer(x, y) {
  return { x: x, y: y, vx: 0, vy: 0, angle: 0, health: CONFIG.MAX_HEALTH, money: 0, vehicle: null, alive: true };
}
export function updatePlayer(player, input, city) {
  if (player.vehicle) {
    player.x = player.vehicle.x;
    player.y = player.vehicle.y;
    return;
  }
  const ax = input.axis();
  const run = input.isDown("shift") ? CONFIG.PLAYER_RUN : CONFIG.PLAYER_SPEED;
  const len = Math.hypot(ax.x, ax.y) || 1;
  const nx = player.x + (ax.x / len) * run * (ax.x || ax.y ? 1 : 0);
  const ny = player.y + (ax.y / len) * run * (ax.x || ax.y ? 1 : 0);
  const T = CONFIG.TILE;
  if (!isBlocked(city, Math.floor(nx / T), Math.floor(player.y / T))) player.x = nx;
  if (!isBlocked(city, Math.floor(player.x / T), Math.floor(ny / T))) player.y = ny;
  if (ax.x || ax.y) player.angle = Math.atan2(ax.y, ax.x);
  player.x = Math.max(8, Math.min(CONFIG.WORLD_W - 8, player.x));
  player.y = Math.max(8, Math.min(CONFIG.WORLD_H - 8, player.y));
}
export function nearestVehicle(player, vehicles, maxDist) {
  let best = null, bestD = maxDist || 48;
  for (const v of vehicles) {
    const d = Math.hypot(v.x - player.x, v.y - player.y);
    if (d < bestD) { bestD = d; best = v; }
  }
  return best;
}
export function damagePlayer(player, amount) {
  player.health = Math.max(0, player.health - amount);
  if (player.health <= 0) player.alive = false;
  return player.alive;
}
export function respawnPlayer(player, x, y) {
  player.x = x; player.y = y; player.health = CONFIG.MAX_HEALTH;
  player.alive = true; player.vehicle = null;
  return player;
}
export function healPlayer(player, amount) {
  player.health = Math.min(CONFIG.MAX_HEALTH, player.health + amount);
}
