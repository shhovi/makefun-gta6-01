// Pedestrians: wander the sidewalks, flee when shots are fired.
import { CONFIG } from "./config.js";
import { isBlocked } from "./city.js";

export function spawnPeds(city, rng, count) {
  const peds = [];
  const colors = ["#f2f2f2", "#f2c14e", "#7fc8f8", "#f88fb1", "#b8f88f"];
  for (let i = 0; i < count; i++) {
    peds.push({
      x: 64 + rng() * (CONFIG.WORLD_W - 400),
      y: 64 + rng() * (CONFIG.WORLD_H - 128),
      angle: rng() * Math.PI * 2,
      speed: CONFIG.PED_SPEED,
      color: colors[i % colors.length],
      health: 40, fleeUntil: 0, alive: true,
    });
  }
  return peds;
}
export function updatePeds(peds, city, now, threat) {
  const T = CONFIG.TILE;
  for (const ped of peds) {
    if (!ped.alive) continue;
    let speed = ped.speed;
    if (now < ped.fleeUntil && threat) {
      ped.angle = Math.atan2(ped.y - threat.y, ped.x - threat.x);
      speed = ped.speed * 2.6;
    } else if (Math.random() < 0.01) {
      ped.angle += (Math.random() - 0.5) * 1.2;
    }
    const nx = ped.x + Math.cos(ped.angle) * speed;
    const ny = ped.y + Math.sin(ped.angle) * speed;
    if (!isBlocked(city, Math.floor(nx / T), Math.floor(ny / T))) { ped.x = nx; ped.y = ny; }
    else ped.angle += Math.PI / 2;
  }
  return peds;
}
export function alivePeds(peds) { return peds.filter(function (p) { return p.alive; }).length; }
export function scarePeds(peds, x, y, radius, now) {
  for (const ped of peds) {
    if (Math.hypot(ped.x - x, ped.y - y) < radius) ped.fleeUntil = now + 3000;
  }
}
