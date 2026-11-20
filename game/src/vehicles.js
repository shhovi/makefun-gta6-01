// Car physics: acceleration, braking, steering, simple collisions.
// Arcade feel on purpose — instant response beats realism here.

import { CAR_ACCEL, CAR_BRAKE, CAR_MAX_SPEED, CAR_TURN, COLORS } from "./config.js";
import { isBlocked } from "./city.js";

let nextId = 1;

export function createVehicle(x, y, angle, color, opts = {}) {
  return {
    id: nextId++,
    x,
    y,
    angle,
    speed: 0,
    color: color ?? COLORS.car[0],
    driver: null,
    police: Boolean(opts.police),
    sirenOn: false,
    health: 100,
  };
}

export function driveVehicle(car, input, city, dt) {
  const axis = input.axis();
  if (axis.y < 0) car.speed += CAR_ACCEL * dt;
  else if (axis.y > 0) car.speed -= CAR_BRAKE * dt;
  else car.speed *= Math.max(0, 1 - 1.6 * dt); // rolling friction

  car.speed = Math.max(-CAR_MAX_SPEED * 0.4, Math.min(CAR_MAX_SPEED, car.speed));

  if (Math.abs(car.speed) > 4 && axis.x !== 0) {
    const dir = car.speed >= 0 ? 1 : -1;
    car.angle += axis.x * CAR_TURN * dir * dt * Math.min(1, Math.abs(car.speed) / 160);
  }

  stepVehicle(car, city, dt);
}

export function stepVehicle(car, city, dt) {
  const nx = car.x + Math.cos(car.angle) * car.speed * dt;
  const ny = car.y + Math.sin(car.angle) * car.speed * dt;
  if (isBlocked(city, nx, ny)) {
    car.speed *= -0.25;
    car.health = Math.max(0, car.health - 4);
    return true; // collided
  }
  car.x = nx;
  car.y = ny;
  return false;
}
