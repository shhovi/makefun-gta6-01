import { CFG } from './config.js';

export class Player {
  constructor(x, y) {
    this.x = x; this.y = y; this.angle = -Math.PI / 2;
    this.health = 100; this.maxHealth = 100;
    this.cash = 250; this.inCar = null;
    this.weapon = 'fists'; this.ammo = 0; this.hasPistol = false;
    this.walkPhase = 0; this.moving = false;
    this.punchTimer = 0; this.shootTimer = 0; this.muzzle = 0;
    this.dead = false; this.busted = false;
  }
  update(dt, city, input) {
    if (this.dead || this.busted) return;
    if (this.inCar) {
      this.inCar.update(dt, city, input);
      this.x = this.inCar.x; this.y = this.inCar.y; this.angle = this.inCar.angle;
      this.moving = Math.abs(this.inCar.speed) > 10;
      return;
    }
    const ax = input.axis();
    const run = input.down('shift');
    const sp = run ? CFG.PLAYER_RUN : CFG.PLAYER_SPEED;
    this.moving = (ax.x !== 0 || ax.y !== 0);
    if (this.moving) {
      const len = Math.hypot(ax.x, ax.y) || 1;
      const nx = this.x + (ax.x / len) * sp * dt;
      const ny = this.y + (ax.y / len) * sp * dt;
      if (!city.collides(nx, this.y, 11)) this.x = nx;
      if (!city.collides(this.x, ny, 11)) this.y = ny;
      this.angle = Math.atan2(ax.y, ax.x);
      this.walkPhase += dt * (run ? 14 : 9);
    }
    this.punchTimer = Math.max(0, this.punchTimer - dt);
    this.shootTimer = Math.max(0, this.shootTimer - dt);
    this.muzzle = Math.max(0, this.muzzle - dt * 8);
    if (this.health < this.maxHealth) this.health = Math.min(this.maxHealth, this.health + dt * 1.2);
  }
  damage(n) { this.health = Math.max(0, this.health - n); if (this.health <= 0) this.dead = true; }
}
