// Player: on-foot movement, vehicle entry/exit, health. Position syncs to the driven car.
import { PLAYER_SPEED, PLAYER_RADIUS, PLAYER_MAX_HEALTH, COLORS } from "./config.js";
import { isSolid } from "./city.js";

export class Player {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.angle = 0;
    this.radius = PLAYER_RADIUS;
    this.health = PLAYER_MAX_HEALTH;
    this.maxHealth = PLAYER_MAX_HEALTH;
    this.money = 0;
    this.vehicle = null; // currently driven car, or null on foot
    this.color = COLORS.player;
    this.alive = true;
  }

  get inVehicle() {
    return this.vehicle !== null;
  }

  updateOnFoot(dt, input, city, aimAngle) {
    let dx = 0;
    let dy = 0;
    if (input.left) dx -= 1;
    if (input.right) dx += 1;
    if (input.up) dy -= 1;
    if (input.down) dy += 1;
    const len = Math.hypot(dx, dy);
    if (len > 0) {
      dx /= len;
      dy /= len;
      const nx = this.x + dx * PLAYER_SPEED * dt;
      const ny = this.y + dy * PLAYER_SPEED * dt;
      if (!isSolid(city, nx, this.y)) this.x = nx;
      if (!isSolid(city, this.x, ny)) this.y = ny;
    }
    if (aimAngle !== undefined) this.angle = aimAngle;
    else if (len > 0) this.angle = Math.atan2(dy, dx);
  }

  tryEnterVehicle(cars) {
    let best = null;
    let bestDist = 56;
    for (const car of cars) {
      const d = Math.hypot(car.x - this.x, car.y - this.y);
      if (d < bestDist) {
        bestDist = d;
        best = car;
      }
    }
    if (best) {
      this.vehicle = best;
      best.driver = this;
      this.x = best.x;
      this.y = best.y;
      return best;
    }
    return null;
  }

  exitVehicle() {
    if (!this.vehicle) return;
    const car = this.vehicle;
    car.driver = null;
    this.x = car.x + Math.cos(car.angle + Math.PI / 2) * 34;
    this.y = car.y + Math.sin(car.angle + Math.PI / 2) * 34;
    this.vehicle = null;
  }

  damage(amount) {
    this.health = Math.max(0, this.health - amount);
    if (this.health <= 0) this.alive = false;
  }

  heal(amount) {
    this.health = Math.min(this.maxHealth, this.health + amount);
  }

  respawn(x, y) {
    this.x = x;
    this.y = y;
    this.health = this.maxHealth;
    this.alive = true;
    this.vehicle = null;
  }
}
