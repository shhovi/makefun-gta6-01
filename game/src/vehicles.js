// Vehicle physics: acceleration, braking, steering.
import { CONFIG } from "./config.js";

export function createVehicle(x, y, color) {
  return { x: x, y: y, angle: 0, speed: 0, color: color || CONFIG.COLORS.car, health: 100 };
}
export function updateVehicle(car, input) {
  const ax = input.axis();
  if (ax.y < 0) car.speed += CONFIG.CAR_ACCEL;
  else if (ax.y > 0) car.speed -= CONFIG.CAR_BRAKE;
  else car.speed *= 0.98;
  car.speed = Math.max(-CONFIG.CAR_MAX_SPEED * 0.5, Math.min(CONFIG.CAR_MAX_SPEED, car.speed));
  if (Math.abs(car.speed) > 0.05) car.angle += ax.x * CONFIG.CAR_STEER * Math.sign(car.speed);
  car.x += Math.cos(car.angle) * car.speed;
  car.y += Math.sin(car.angle) * car.speed;
  car.x = Math.max(16, Math.min(CONFIG.WORLD_W - 16, car.x));
  car.y = Math.max(16, Math.min(CONFIG.WORLD_H - 16, car.y));
  return car;
}
export function stopVehicle(car) { car.speed = 0; }
export function damageVehicle(car, amount) {
  car.health = Math.max(0, car.health - amount);
  if (car.health === 0) car.speed = 0;
  return car.health;
}
