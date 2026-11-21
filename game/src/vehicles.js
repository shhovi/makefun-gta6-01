import { CONFIG, clamp } from "./config.js";
import { collidesBuilding } from "./city.js";

export function createCar(x, y, angle, color) {
  return {
    x,
    y,
    angle,
    speed: 0,
    color: color || "#cccccc",
    health: 100,
    driver: null,
    w: 36,
    h: 18,
    kind: "car",
  };
}

export function updateCar(car, input, city, dt) {
  const step = dt * 60;
  if (input.isDown("w") || input.isDown("arrowup")) car.speed += CONFIG.carAccel * step;
  if (input.isDown("s") || input.isDown("arrowdown")) car.speed -= CONFIG.carAccel * 0.7 * step;
  if (input.isDown(" ")) car.speed *= 0.9;
  car.speed *= Math.pow(CONFIG.carFriction, step);
  car.speed = clamp(car.speed, -CONFIG.carMaxSpeed * 0.5, CONFIG.carMaxSpeed);
  if (Math.abs(car.speed) > 0.05) {
    const turn = CONFIG.carTurn * step * Math.sign(car.speed);
    if (input.isDown("a") || input.isDown("arrowleft")) car.angle -= turn;
    if (input.isDown("d") || input.isDown("arrowright")) car.angle += turn;
  }
  const nx = car.x + Math.cos(car.angle) * car.speed * step * 0.16;
  const ny = car.y + Math.sin(car.angle) * car.speed * step * 0.16;
  if (!collidesBuilding(city, nx, ny, 14)) {
    car.x = nx;
    car.y = ny;
  } else {
    car.speed *= -0.3;
    car.health = Math.max(0, car.health - 4);
  }
  car.x = clamp(car.x, 20, CONFIG.worldWidth - 20);
  car.y = clamp(car.y, 20, CONFIG.worldHeight - 20);
}

export function moveCarAI(car, targetX, targetY, speed, dt) {
  const dx = targetX - car.x;
  const dy = targetY - car.y;
  const desired = Math.atan2(dy, dx);
  let diff = desired - car.angle;
  while (diff > Math.PI) diff -= Math.PI * 2;
  while (diff < -Math.PI) diff += Math.PI * 2;
  car.angle += clamp(diff, -0.06 * dt * 60, 0.06 * dt * 60);
  car.speed = speed;
  car.x += Math.cos(car.angle) * car.speed * dt * 60 * 0.16;
  car.y += Math.sin(car.angle) * car.speed * dt * 60 * 0.16;
}
