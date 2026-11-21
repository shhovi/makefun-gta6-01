import { CONFIG, clamp } from "./config.js";

const COLORS = ["#f1fa8c", "#8be9fd", "#ff79c6", "#50fa7b", "#ffb86b", "#bd93f9"];

export function createPedestrians(city, rng) {
  const peds = [];
  for (let i = 0; i < CONFIG.pedCount; i++) {
    const road = city.roads[Math.floor(rng() * city.roads.length)];
    peds.push({
      x: road.x + 12 + rng() * 24,
      y: road.y + 12 + rng() * 24,
      angle: rng() * Math.PI * 2,
      speed: 0.8 + rng() * 0.7,
      health: 30,
      color: COLORS[i % COLORS.length],
      state: "wander",
      timer: rng() * 3,
      dead: false,
      homeRoad: road.cx + "," + road.cy,
    });
  }
  return peds;
}

export function updatePedestrians(peds, player, threat, rng, dt) {
  for (const ped of peds) {
    if (ped.dead) continue;
    ped.timer -= dt;
    let fleeing = false;
    if (threat) {
      const dx = ped.x - threat.x;
      const dy = ped.y - threat.y;
      if (dx * dx + dy * dy < 120 * 120) {
        ped.state = "flee";
        ped.angle = Math.atan2(dy, dx);
        fleeing = true;
      }
    }
    if (!fleeing && ped.timer <= 0) {
      ped.state = "wander";
      ped.angle = rng() * Math.PI * 2;
      ped.timer = 1 + rng() * 3;
    }
    const speed = ped.state === "flee" ? ped.speed * 2.2 : ped.speed;
    ped.x += Math.cos(ped.angle) * speed * dt * 60 * 0.16;
    ped.y += Math.sin(ped.angle) * speed * dt * 60 * 0.16;
    ped.x = clamp(ped.x, 16, CONFIG.worldWidth - 16);
    ped.y = clamp(ped.y, 16, CONFIG.worldHeight - 16);
  }
}
