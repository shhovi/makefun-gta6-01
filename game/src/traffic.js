// Traffic AI: cars driving along the road grid.
import { CONFIG } from "./config.js";
import { isRoad } from "./city.js";
import { pick } from "./random.js";

export function spawnTraffic(city, rng, count) {
  const cars = [];
  const colors = ["#c83a32", "#3a7fc8", "#e0a832", "#58a65c", "#dddddd"];
  for (let i = 0; i < count; i++) {
    const r = pick(rng, city.roads);
    cars.push({
      x: r.x * CONFIG.TILE + 16, y: r.y * CONFIG.TILE + 16,
      angle: rng() < 0.5 ? 0 : Math.PI / 2,
      speed: CONFIG.TRAFFIC_SPEED, color: pick(rng, colors),
    });
  }
  return cars;
}
export function trafficCount(cars) { return cars.length; }
export function updateTraffic(cars, city, rng) {
  const T = CONFIG.TILE;
  for (const car of cars) {
    const aheadX = Math.floor((car.x + Math.cos(car.angle) * 20) / T);
    const aheadY = Math.floor((car.y + Math.sin(car.angle) * 20) / T);
    if (!isRoad(city, aheadX, aheadY)) {
      car.angle += (rng() < 0.5 ? 1 : -1) * (Math.PI / 2);
    } else if (rng() < 0.01) {
      const turn = car.angle + (rng() < 0.5 ? 1 : -1) * (Math.PI / 2);
      const tx = Math.floor((car.x + Math.cos(turn) * 20) / T);
      const ty = Math.floor((car.y + Math.sin(turn) * 20) / T);
      if (isRoad(city, tx, ty)) car.angle = turn;
    }
    car.x += Math.cos(car.angle) * car.speed;
    car.y += Math.sin(car.angle) * car.speed;
    car.x = Math.max(16, Math.min(CONFIG.WORLD_W - 16, car.x));
    car.y = Math.max(16, Math.min(CONFIG.WORLD_H - 16, car.y));
  }
  return cars;
}
