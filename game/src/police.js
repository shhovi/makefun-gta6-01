import { CONFIG, clamp } from "./config.js";
import { createCar, moveCarAI } from "./vehicles.js";

export function createPolice() {
  return {
    wanted: 0,
    heat: 0,
    cars: [],
    bustedTimer: 0,
    state: "idle",
    unit: "Solar Bay PD",
  };
}

export function addHeat(police, amount) {
  police.heat = clamp(police.heat + amount, 0, 100);
  police.wanted = clamp(Math.ceil(police.heat / 20), 0, CONFIG.maxWanted);
}

export function updatePolice(police, player, rng, dt) {
  if (police.wanted > 0) {
    police.heat = Math.max(0, police.heat - dt * 1.2);
    if (police.heat <= 0) police.wanted = 0;
    else police.wanted = clamp(Math.ceil(police.heat / 20), 1, CONFIG.maxWanted);
  }
  const desired = police.wanted === 0 ? 0 : CONFIG.policeBase + police.wanted;
  while (police.cars.length < desired) {
    const sx = clamp(player.x + (rng() - 0.5) * 700, 30, CONFIG.worldWidth - 30);
    const sy = clamp(player.y + (rng() - 0.5) * 700, 30, CONFIG.worldHeight - 30);
    const car = createCar(sx, sy, 0, "#2b4c9b");
    car.driver = "police";
    police.cars.push(car);
  }
  while (police.cars.length > desired) police.cars.pop();
  let nearest = Infinity;
  for (const car of police.cars) {
    moveCarAI(car, player.x, player.y, 3.2 + police.wanted * 0.5, dt);
    const dx = car.x - player.x;
    const dy = car.y - player.y;
    const d = Math.hypot(dx, dy);
    if (d < nearest) nearest = d;
    if (d < 30 && !player.inVehicle) {
      player.health -= dt * 6;
    }
  }
  if (police.wanted > 0 && nearest < 44 && (!player.inVehicle || Math.abs(player.vehicle.speed) < 0.6)) {
    police.bustedTimer += dt;
    police.state = "busting";
  } else {
    police.bustedTimer = Math.max(0, police.bustedTimer - dt * 2);
    police.state = police.wanted > 0 ? "chase" : "idle";
  }
  if (police.bustedTimer > 2.5) return "busted";
  if (player.health <= 0) return "wasted";
  return null;
}

export function clearWanted(police) {
  police.wanted = 0;
  police.heat = 0;
  police.cars = [];
  police.bustedTimer = 0;
  police.state = "idle";
}
