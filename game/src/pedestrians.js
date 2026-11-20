// Pedestrians: wander the sidewalks, flee when shots are fired.
// Fleeing peds run directly away from the noise for a few seconds.

import { COLORS } from "./config.js";
import { randomRoadPoint } from "./city.js";

export function spawnPedestrians(city, rng, count = 22) {
  const peds = [];
  for (let i = 0; i < count; i++) {
    const p = randomRoadPoint(city, rng);
    peds.push({
      x: p.x,
      y: p.y,
      angle: rng.float(0, Math.PI * 2),
      speed: rng.float(28, 52),
      color: rng.pick(COLORS.ped),
      health: 30,
      fleeTimer: 0,
      wanderTimer: rng.float(1, 4),
    });
  }
  return peds;
}

export function scarePedestrians(peds, x, y, radius = 260) {
  for (const ped of peds) {
    const d = Math.hypot(ped.x - x, ped.y - y);
    if (d < radius) {
      ped.fleeTimer = 2.5;
      ped.angle = Math.atan2(ped.y - y, ped.x - x);
    }
  }
}

export function updatePedestrians(peds, rng, dt) {
  for (const ped of peds) {
    if (ped.health <= 0) continue;
    if (ped.fleeTimer > 0) {
      ped.fleeTimer -= dt;
      ped.x += Math.cos(ped.angle) * ped.speed * 2.6 * dt;
      ped.y += Math.sin(ped.angle) * ped.speed * 2.6 * dt;
      continue;
    }
    ped.wanderTimer -= dt;
    if (ped.wanderTimer <= 0) {
      ped.angle = rng.float(0, Math.PI * 2);
      ped.wanderTimer = rng.float(1.5, 4.5);
    }
    ped.x += Math.cos(ped.angle) * ped.speed * dt;
    ped.y += Math.sin(ped.angle) * ped.speed * dt;
  }
}
