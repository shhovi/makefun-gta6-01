// Traffic AI: cars follow the road grid, simple collision avoidance.
// Cars slow for traffic ahead and randomly turn at intersections.
import { TILE, TRAFFIC_SPEED } from "./config.js";
import { TILE_ROAD } from "./city.js";
import { Car } from "./vehicles.js";

export class TrafficCar extends Car {
  constructor(x, y, angle, color) {
    super(x, y, angle, color);
    this.cruiseSpeed = TRAFFIC_SPEED;
    this.turnCooldown = 0;
  }

  update(dt, city, others) {
    this.turnCooldown -= dt;
    // Collision avoidance: slow down if a car is close ahead.
    const aheadX = this.x + Math.cos(this.angle) * 56;
    const aheadY = this.y + Math.sin(this.angle) * 56;
    let blocked = false;
    for (const o of others) {
      if (o === this) continue;
      if (Math.hypot(o.x - aheadX, o.y - aheadY) < 40) { blocked = true; break; }
    }
    const target = blocked ? 0 : this.cruiseSpeed;
    this.speed += (target - this.speed) * Math.min(1, dt * 2);

    // At intersections, maybe turn onto a perpendicular road.
    const tx = Math.floor(this.x / TILE);
    const ty = Math.floor(this.y / TILE);
    if (this.turnCooldown <= 0 && city.grid[ty]?.[tx] === TILE_ROAD) {
      const options = [];
      const dirs = [[1, 0, 0], [-1, 0, Math.PI], [0, 1, Math.PI / 2], [0, -1, -Math.PI / 2]];
      for (const [dx, dy, ang] of dirs) {
        if (city.grid[ty + dy]?.[tx + dx] === TILE_ROAD) options.push(ang);
      }
      if (options.length > 1 && Math.random() < 0.35) {
        this.angle = options[Math.floor(Math.random() * options.length)];
        this.turnCooldown = 1.2;
      }
    }

    const nx = this.x + Math.cos(this.angle) * this.speed * dt;
    const ny = this.y + Math.sin(this.angle) * this.speed * dt;
    const ntx = Math.floor(nx / TILE);
    const nty = Math.floor(ny / TILE);
    if (city.grid[nty]?.[ntx] === TILE_ROAD) {
      this.x = nx;
      this.y = ny;
    } else {
      this.angle += Math.PI / 2; // steer back toward roads
      this.turnCooldown = 0.5;
    }
  }
}

export function spawnTraffic(city, rng, count) {
  const cars = [];
  for (let i = 0; i < count && city.roadTiles.length > 0; i++) {
    const t = rng.pick(city.roadTiles);
    const angle = rng.pick([0, Math.PI / 2, Math.PI, -Math.PI / 2]);
    cars.push(new TrafficCar(t.tx * TILE + TILE / 2, t.ty * TILE + TILE / 2, angle, rng.pick(["#c0392b", "#2980b9", "#27ae60", "#f39c12", "#ecf0f1"])));
  }
  return cars;
}
