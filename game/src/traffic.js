import { CFG } from './config.js';
import { Vehicle } from './vehicles.js';

export class TrafficCar extends Vehicle {
  constructor(x, y, angle, rng) {
    super(x, y, angle, { hasDriver: true });
    this.rng = rng; this.cruise = 150 + rng() * 90;
    this.turnCooldown = 0; this.stuck = 0;
  }
  updateAI(dt, city, others, player) {
    if (this.wrecked) return;
    this.turnCooldown -= dt;
    // slow for obstacle ahead
    const aheadX = this.x + Math.cos(this.angle) * 60;
    const aheadY = this.y + Math.sin(this.angle) * 60;
    let blocked = city.collides(aheadX, aheadY, 20);
    for (const o of others) {
      if (o === this) continue;
      if (Math.hypot(o.x - aheadX, o.y - aheadY) < 55) { blocked = true; break; }
    }
    if (player && Math.hypot(player.x - aheadX, player.y - aheadY) < 50 && !player.inCar) blocked = true;
    const target = blocked ? 0 : this.cruise;
    this.speed += (target - this.speed) * Math.min(1, dt * 2.2);
    // at intersection, maybe turn
    const step = CFG.BLOCK + CFG.ROAD;
    const nearX = Math.abs((this.x % step)) < 60 || Math.abs((this.x % step) - step) < 60;
    const nearY = Math.abs((this.y % step)) < 60 || Math.abs((this.y % step) - step) < 60;
    if (nearX && nearY && this.turnCooldown <= 0 && this.rng() < 0.5) {
      this.angle += (this.rng() < 0.5 ? Math.PI / 2 : -Math.PI / 2);
      this.turnCooldown = 2;
    }
    // keep on roads: if off-road, steer back
    if (!city.isRoad(this.x, this.y)) {
      const p = city.nearestRoadPoint(this.x, this.y);
      if (p) {
        const want = Math.atan2(p.y - this.y, p.x - this.x);
        let diff = want - this.angle;
        while (diff > Math.PI) diff -= Math.PI * 2;
        while (diff < -Math.PI) diff += Math.PI * 2;
        this.angle += diff * Math.min(1, dt * 3);
      }
    }
    const nx = this.x + Math.cos(this.angle) * this.speed * dt;
    const ny = this.y + Math.sin(this.angle) * this.speed * dt;
    if (!city.collides(nx, ny, 20)) { this.x = nx; this.y = ny; this.stuck = 0; }
    else { this.speed *= 0.4; this.stuck += dt; if (this.stuck > 1.2) { this.angle += Math.PI / 2; this.stuck = 0; } }
    if (this.health < 45) this.smoke = Math.min(1, this.smoke + dt * 0.5);
    if (this.health <= 0) { this.health = 0; this.wrecked = true; }
  }
}

export function spawnTraffic(city, rng, count = 14) {
  const cars = [];
  for (let i = 0; i < count; i++) {
    const p = city.nearestRoadPoint(rng() * CFG.WORLD_W, rng() * (CFG.WORLD_H - 500));
    if (!p) continue;
    const horiz = rng() < 0.5;
    const angle = horiz ? (rng() < 0.5 ? 0 : Math.PI) : (rng() < 0.5 ? Math.PI / 2 : -Math.PI / 2);
    const c = new TrafficCar(p.x, p.y, angle, rng);
    cars.push(c);
  }
  return cars;
}
