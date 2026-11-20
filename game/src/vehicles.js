import { CFG } from './config.js';

// Base vehicle physics shared by parked, traffic, and police cars.
const CAR_COLORS = ['#e63946', '#f4a261', '#2a9d8f', '#457b9d', '#e9c46a', '#9b5de5', '#f15bb5', '#00bbf9', '#fee440', '#ffffff', '#264653'];

export class Vehicle {
  constructor(x, y, angle, opts = {}) {
    this.x = x;
    this.y = y;
    this.angle = angle || 0;
    this.vx = 0;
    this.vy = 0;
    this.speed = 0;
    this.w = 46;
    this.h = 22;
    this.color = opts.color || CAR_COLORS[Math.floor(Math.random() * CAR_COLORS.length)];
    this.isPolice = !!opts.isPolice;
    this.hasDriver = !!opts.hasDriver;
    this.parked = !!opts.parked;
    this.health = 100;
    this.smoke = 0;
    this.driverName = opts.driverName || '';
    this.id = Math.random().toString(36).slice(2, 8);
    this.wrecked = false;
    this.crashed = false;
  }

  get r() {
    return 24;
  }

  update(dt, city, input) {
    if (this.wrecked) {
      this.speed *= Math.pow(0.02, dt);
      const nx = this.x + Math.cos(this.angle) * this.speed * dt;
      const ny = this.y + Math.sin(this.angle) * this.speed * dt;
      if (!city.collides(nx, ny, 20)) {
        this.x = nx;
        this.y = ny;
      }
      return;
    }

    if (input) {
      const ax = input.axis();
      const hand = input.down(' ');
      if (ax.y < 0) {
        this.speed += CFG.CAR_ACCEL * dt;
      } else if (ax.y > 0) {
        this.speed -= (this.speed > 5 ? CFG.CAR_BRAKE : CFG.CAR_ACCEL * 0.55) * dt;
      } else {
        this.speed -= this.speed * 0.7 * dt;
      }
      if (hand) {
        this.speed -= this.speed * 2.4 * dt;
      }
      this.speed = Math.max(-170, Math.min(CFG.CAR_MAX, this.speed));
      const steer = ax.x * (hand ? 2.6 : 1.9) * dt * (this.speed >= 0 ? 1 : -1) * Math.min(1, Math.abs(this.speed) / 120 + 0.15);
      this.angle += steer;
    } else {
      this.speed -= this.speed * 0.8 * dt;
    }

    const nx = this.x + Math.cos(this.angle) * this.speed * dt;
    const ny = this.y + Math.sin(this.angle) * this.speed * dt;
    if (!city.collides(nx, ny, 20)) {
      this.x = nx;
      this.y = ny;
    } else {
      if (Math.abs(this.speed) > 140) {
        this.health -= 12;
        this.crashed = true;
      }
      this.speed *= -0.25;
      const tx = this.x + Math.cos(this.angle) * this.speed * dt;
      if (!city.collides(tx, this.y, 20)) {
        this.x = tx;
      } else {
        const ty = this.y + Math.sin(this.angle) * this.speed * dt;
        if (!city.collides(this.x, ty, 20)) {
          this.y = ty;
        }
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

  speedKmh() {
    return Math.round(Math.abs(this.speed) * 0.36);
  }
}

export function spawnParkedCars(city, rng, count = 26) {
  const cars = [];
  for (let i = 0; i < count; i++) {
    const p = city.nearestRoadPoint(rng() * CFG.WORLD_W, rng() * (CFG.WORLD_H - 500));
    if (!p) continue;
    const horiz = rng() < 0.5;
    const x = p.x + (rng() - 0.5) * 30;
    const y = p.y + (rng() - 0.5) * 30;
    if (city.collides(x, y, 24)) continue;
    const color = CAR_COLORS[Math.floor(rng() * CAR_COLORS.length)];
    cars.push(new Vehicle(x, y, horiz ? 0 : Math.PI / 2, { parked: true, color }));
  }
  return cars;
}
