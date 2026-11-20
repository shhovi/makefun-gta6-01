// Traffic AI: cars that follow the road grid, turning at intersections.
// Traffic yields the driver's seat to the player when hijacked (E).

import { TILE, COLORS } from "./config.js";
import { isRoad, randomRoadPoint } from "./city.js";
import { createVehicle, stepVehicle } from "./vehicles.js";

const DIRS = [
  { x: 1, y: 0, angle: 0 },
  { x: -1, y: 0, angle: Math.PI },
  { x: 0, y: 1, angle: Math.PI / 2 },
  { x: 0, y: -1, angle: -Math.PI / 2 },
];

export function spawnTraffic(city, rng, count = 14) {
  const cars = [];
  for (let i = 0; i < count; i++) {
    const p = randomRoadPoint(city, rng);
    const dir = rng.pick(DIRS);
    const car = createVehicle(p.x, p.y, dir.angle, rng.pick(COLORS.car));
    car.speed = rng.float(90, 170);
    car.aiDir = dir;
    car.ai = true;
    cars.push(car);
  }
  return cars;
}

export function updateTraffic(cars, city, rng, dt) {
  for (const car of cars) {
    if (car.driver) continue; // player is driving this one
    // At an intersection, maybe turn onto another road direction.
    const aheadX = car.x + Math.cos(car.angle) * TILE;
    const aheadY = car.y + Math.sin(car.angle) * TILE;
    if (!isRoad(city, aheadX, aheadY) || rng.chance(0.004)) {
      const options = DIRS.filter((d) => isRoad(city, car.x + d.x * TILE, car.y + d.y * TILE));
      if (options.length) {
        car.aiDir = rng.pick(options);
        car.angle = car.aiDir.angle;
      }
    }
    if (car.speed < 110) car.speed += 120 * dt;
    if (stepVehicle(car, city, dt)) {
      car.angle += Math.PI / 2;
      car.speed = 60;
    }
  }
}
