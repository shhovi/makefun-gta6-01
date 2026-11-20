import { Vehicle } from './vehicles.js';

export class PoliceCar extends Vehicle {
  constructor(x, y) {
    super(x, y, 0, { isPolice: true, color: '#ffffff', hasDriver: true });
    this.lightPhase = Math.random() * 6;
  }
  updateAI(dt, city, player) {
    if (this.wrecked) return;
    this.lightPhase += dt * 10;
    const tx = player.x + (player.inCar ? Math.cos(player.inCar.angle) * player.inCar.speed * 0.35 : 0);
    const ty = player.y + (player.inCar ? Math.sin(player.inCar.angle) * player.inCar.speed * 0.35 : 0);
    const want = Math.atan2(ty - this.y, tx - this.x);
    let diff = want - this.angle;
    while (diff > Math.PI) diff -= Math.PI * 2;
    while (diff < -Math.PI) diff += Math.PI * 2;
    this.angle += Math.max(-2.4 * dt, Math.min(2.4 * dt, diff * 3 * dt));
    const dist = Math.hypot(tx - this.x, ty - this.y);
    const cruise = dist > 320 ? 430 : dist > 90 ? 340 : 180;
    this.speed += (cruise - this.speed) * Math.min(1, dt * 1.8);
    const nx = this.x + Math.cos(this.angle) * this.speed * dt;
    const ny = this.y + Math.sin(this.angle) * this.speed * dt;
    if (!city.collides(nx, ny, 20)) { this.x = nx; this.y = ny; }
    else {
      if (Math.abs(this.speed) > 160) this.health -= 10;
      this.speed *= 0.35; this.angle += 0.6 * dt * 4;
    }
    if (this.health < 45) this.smoke = Math.min(1, this.smoke + dt * 0.5);
    if (this.health <= 0) { this.health = 0; this.wrecked = true; }
  }
}

export class WantedSystem {
  constructor() { this.stars = 0; this.heat = 0; this.lastSeen = 0; this.bustedTimer = 0; }
  addCrime(amount) {
    this.heat = Math.min(5, this.heat + amount);
    this.stars = Math.max(1, Math.ceil(this.heat));
    this.lastSeen = 0;
  }
  update(dt, seenByPolice) {
    if (seenByPolice) this.lastSeen = 0; else this.lastSeen += dt;
    if (this.lastSeen > 7 && this.heat > 0) {
      this.heat = Math.max(0, this.heat - dt * 0.14);
      this.stars = Math.ceil(this.heat);
      if (this.heat <= 0.01) { this.heat = 0; this.stars = 0; }
    }
  }
  clear() { this.stars = 0; this.heat = 0; this.bustedTimer = 0; }
}
