import { CFG } from './config.js';
import { Vehicle } from './vehicles.js';

// Ambient drivers that cruise the road grid.
export class TrafficCar extends Vehicle {
  constructor(x, y, angle, rng) {
    super(x, y, angle, { hasDriver: true });
    this.rng = rng;
    this.cruise = 150 + rng() * 90;
    this.turnCooldown = 0;
    this.stuck = 0;
  }

  updateAI(dt, city, others, player) {
    if (this.wrecked) return;
    this.turnCooldown -= dt;

    const aheadX = this.x + Math.cos(this.angle) * 60;
    const aheadY = this.y + Math.sin(this.angle) * 60;
    let blocked = city.collides(aheadX, aheadY, 20);
    if (!blocked) {
      for (const other of others) {
        if (other === this) continue;
        if (Math.hypot(other.x - aheadX, other.y - aheadY) < 55) {
          blocked = true;
          break;
        }
      }
    }
    if (!blocked && player && !player.inCar) {
      if (Math.hypot(player.x - aheadX, player.y - aheadY) < 50) {
        blocked = true;
      }
    }

    const target = blocked ? 0 : this.cruise;
    this.speed += (target - this.speed) * Math.min(1, dt * 2.2);

    const step = CFG.BLOCK + CFG.ROAD;
    const mx = ((this.x % step) + step) % step;
    const my = ((this.y % step) + step) % step;
    const nearX = mx < 60 || mx > step - 60;
    const nearY = my < 60 || my > step - 60;
    if (nearX && nearY && this.turnCooldown <= 0 && this.rng() < 0.5) {
      this.angle += (this.rng() < 0.5 ? 1 : -1) * (Math.PI / 2);
      this.turnCooldown = 2;
    }

    if (!city.isRoad(this.x, this.y)) {
      const rp = city.nearestRoadPoint(this.x, this.y);
      if (rp) {
        const want = Math.atan2(rp.y - this.y, rp.x - this.x);
        let diff = want - this.angle;
        while (diff > Math.PI) diff -= Math.PI * 2;
        while (diff < -Math.PI) diff += Math.PI * 2;
        this.angle += diff * Math.min(1, dt * 3);
      }
    }

    const nx = this.x + Math.cos(this.angle) * this.speed * dt;
    const ny = this.y + Math.sin(this.angle) * this.speed * dt;
    if (!city.collides(nx, ny, 20)) {
      this.x = nx;
      this.y = ny;
      this.stuck = 0;
    } else {
      this.speed *= 0.4;
      this.stuck += dt;
      if (this.stuck > 1.2) {
        this.angle += Math.PI / 2;
        this.stuck = 0;
      }
    }

    if (this.health < 45) {
      this.smoke = Math.min(1, this.smoke + dt * 0.5);
    }
    if (this.health <= 0) {
      this.health = 0;
      this.wrecked = true;
    }
  }
}

export function spawnTraffic(city, rng, count = 14) {
  const cars = [];
  for (let i = 0; i < count; i++) {
    const p = city.nearestRoadPoint(rng() * CFG.WORLD_W, rng() * (CFG.WORLD_H - 500));
    if (!p) continue;
    const horiz = rng() < 0.5;
    const angle = horiz ? (rng() < 0.5 ? 0 : Math.PI) : (rng() < 0.5 ? Math.PI / 2 : -Math.PI / 2);
    cars.push(new TrafficCar(p.x, p.y, angle, rng));
  }
  return cars;
}
