// Wanted stars, police chase, and the busted / wasted outcomes.
// Heat decays only while no police unit is close — break line of sight.

import { MAX_WANTED, WANTED_DECAY_SECONDS, POLICE_SPEED, COLORS } from "./config.js";
import { randomRoadPoint } from "./city.js";
import { createVehicle, stepVehicle } from "./vehicles.js";

export function createWanted() {
  return { level: 0, heat: 0, decayTimer: 0, bustTimer: 0 };
}

export function addCrime(wanted, amount) {
  wanted.heat = Math.min(100, wanted.heat + amount);
  wanted.level = Math.min(MAX_WANTED, Math.floor(wanted.heat / 20) + (wanted.heat > 0 ? 1 : 0));
  if (wanted.heat <= 0) wanted.level = 0;
  wanted.decayTimer = 0;
}

export function updateWanted(wanted, dt, policeNearby) {
  if (wanted.level === 0) return;
  if (policeNearby) {
    wanted.decayTimer = 0;
    return;
  }
  wanted.decayTimer += dt;
  if (wanted.decayTimer >= WANTED_DECAY_SECONDS) {
    wanted.heat = Math.max(0, wanted.heat - 20);
    wanted.level = wanted.heat > 0 ? Math.max(1, wanted.level - 1) : 0;
    wanted.decayTimer = 0;
  }
}

export function spawnPolice(city, rng, wantedLevel) {
  const cars = [];
  const count = wantedLevel; // one unit per star, roughly
  for (let i = 0; i < count; i++) {
    const p = randomRoadPoint(city, rng);
    const car = createVehicle(p.x, p.y, 0, COLORS.police, { police: true });
    car.speed = POLICE_SPEED * 0.6;
    cars.push(car);
  }
  return cars;
}

export function updatePolice(cars, player, city, dt, timeMs) {
  let nearest = Infinity;
  for (const car of cars) {
    car.sirenOn = Math.floor(timeMs / 250) % 2 === 0;
    const dx = player.x - car.x;
    const dy = player.y - car.y;
    const dist = Math.hypot(dx, dy);
    nearest = Math.min(nearest, dist);
    car.angle = Math.atan2(dy, dx);
    car.speed = Math.min(POLICE_SPEED, car.speed + 260 * dt);
    stepVehicle(car, city, dt);
  }
  return nearest;
}

// Returns "busted", "wasted", or null.
export function checkOutcome(wanted, player, nearestPoliceDist, dt) {
  if (player.health <= 0) return "wasted";
  if (wanted.level > 0 && nearestPoliceDist < 34 && !player.vehicle) {
    wanted.bustTimer += dt;
    if (wanted.bustTimer > 1.6) return "busted";
  } else if (wanted.level > 0 && nearestPoliceDist < 30 && player.vehicle && Math.abs(player.vehicle.speed) < 12) {
    wanted.bustTimer += dt;
    if (wanted.bustTimer > 1.6) return "busted";
  } else {
    wanted.bustTimer = Math.max(0, wanted.bustTimer - dt);
  }
  return null;
}
