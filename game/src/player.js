// The player: on-foot movement, entering/exiting vehicles, health.
// While driving, the player position simply follows the vehicle.

import { PLAYER_SPEED, PLAYER_RUN, WORLD_W, WORLD_H } from "./config.js";
import { isBlocked } from "./city.js";

export function createPlayer(x, y) {
  return {
    x,
    y,
    angle: 0,
    health: 100,
    money: 0,
    vehicle: null,
    punchCooldown: 0,
    shootCooldown: 0,
  };
}

export function updatePlayer(player, input, city, dt) {
  if (player.punchCooldown > 0) player.punchCooldown -= dt;
  if (player.shootCooldown > 0) player.shootCooldown -= dt;

  if (player.vehicle) {
    player.x = player.vehicle.x;
    player.y = player.vehicle.y;
    player.angle = player.vehicle.angle;
    return;
  }

  const axis = input.axis();
  const len = Math.hypot(axis.x, axis.y);
  if (len === 0) return;
  const running = input.keys.has("shift");
  const speed = running ? PLAYER_RUN : PLAYER_SPEED;
  const nx = player.x + (axis.x / len) * speed * dt;
  const ny = player.y + (axis.y / len) * speed * dt;

  if (!isBlocked(city, nx, player.y)) player.x = nx;
  if (!isBlocked(city, player.x, ny)) player.y = ny;
  player.x = Math.max(10, Math.min(WORLD_W - 10, player.x));
  player.y = Math.max(10, Math.min(WORLD_H - 10, player.y));
  player.angle = Math.atan2(axis.y, axis.x);
}

export function nearestVehicle(player, vehicles, maxDist = 48) {
  let best = null;
  let bestDist = maxDist;
  for (const v of vehicles) {
    const d = Math.hypot(v.x - player.x, v.y - player.y);
    if (d < bestDist) {
      best = v;
      bestDist = d;
    }
  }
  return best;
}

export function toggleVehicle(player, vehicles) {
  if (player.vehicle) {
    const car = player.vehicle;
    car.driver = null;
    player.vehicle = null;
    player.x = car.x + Math.cos(car.angle + Math.PI / 2) * 26;
    player.y = car.y + Math.sin(car.angle + Math.PI / 2) * 26;
    return "exited";
  }
  const car = nearestVehicle(player, vehicles);
  if (car) {
    car.driver = player;
    player.vehicle = car;
    return "entered";
  }
  return null;
}

export function damagePlayer(player, amount) {
  player.health = Math.max(0, player.health - amount);
  return player.health <= 0;
}
