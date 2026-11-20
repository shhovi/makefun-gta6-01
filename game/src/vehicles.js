// Vehicles: arcade car physics (accel/brake/steer), parked + driven cars.
// Crashing into buildings/water bounces the car and costs health.
import { CAR_ACCEL, CAR_BRAKE, CAR_MAX_SPEED, CAR_REVERSE_SPEED, CAR_STEER, CAR_WIDTH, CAR_LENGTH } from "./config.js";
import { isSolid } from "./city.js";

let nextCarId = 1;

export class Car {
  constructor(x, y, angle, color, options = {}) {
    this.id = nextCarId++;
    this.x = x;
    this.y = y;
    this.angle = angle;
    this.speed = 0;
    this.color = color;
    this.width = CAR_WIDTH;
    this.length = CAR_LENGTH;
    this.health = options.health ?? 100;
    this.isPolice = options.isPolice ?? false;
    this.sirenOn = false;
    this.driver = null;
  }

  updateDriven(dt, input, city) {
    if (input.up) this.speed += CAR_ACCEL * dt;
    else if (input.down) {
      if (this.speed > 10) this.speed -= CAR_BRAKE * dt;
      else this.speed -= CAR_ACCEL * 0.6 * dt;
    } else {
      this.speed -= this.speed * 1.2 * dt; // drag
    }
    this.speed = Math.max(-CAR_REVERSE_SPEED, Math.min(CAR_MAX_SPEED, this.speed));

    if (Math.abs(this.speed) > 4) {
      const steerDir = Math.sign(this.speed);
      if (input.left) this.angle -= CAR_STEER * dt * steerDir;
      if (input.right) this.angle += CAR_STEER * dt * steerDir;
    }

    const nx = this.x + Math.cos(this.angle) * this.speed * dt;
    const ny = this.y + Math.sin(this.angle) * this.speed * dt;
    if (!isSolid(city, nx, ny)) {
      this.x = nx;
      this.y = ny;
    } else {
      this.speed *= -0.25;
      this.health -= 6;
    }
    if (this.driver) {
      this.driver.x = this.x;
      this.driver.y = this.y;
    }
  }

  damage(amount) {
    this.health = Math.max(0, this.health - amount);
  }

  get wrecked() {
    return this.health <= 0;
  }
}

export function spawnParkedCars(city, rng, count) {
  const cars = [];
  const { TILE } = { TILE: 48 };
  for (let i = 0; i < count && city.roadTiles.length > 0; i++) {
    const t = rng.pick(city.roadTiles);
    const angle = rng.pick([0, Math.PI / 2, Math.PI, -Math.PI / 2]);
    cars.push(new Car(t.tx * TILE + TILE / 2, t.ty * TILE + TILE / 2, angle, rng.pick(["#c0392b", "#2980b9", "#27ae60", "#f39c12", "#8e44ad", "#ecf0f1"])));
  }
  return cars;
}
