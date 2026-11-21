import { CONFIG, clamp } from "./config.js";
import { collidesBuilding } from "./city.js";
import { updateCar, createCar } from "./vehicles.js";

export function createPlayer(x, y) {
  return {
    x,
    y,
    angle: 0,
    health: CONFIG.startHealth,
    money: CONFIG.startMoney,
    inVehicle: false,
    vehicle: null,
    punchCooldown: 0,
    shootCooldown: 0,
    name: "Outlaw",
  };
}

export function updatePlayer(player, input, city, dt) {
  if (player.punchCooldown > 0) player.punchCooldown -= dt;
  if (player.shootCooldown > 0) player.shootCooldown -= dt;
  if (player.inVehicle && player.vehicle) {
    updateCar(player.vehicle, input, city, dt);
    player.x = player.vehicle.x;
    player.y = player.vehicle.y;
    player.angle = player.vehicle.angle;
    if (input.wasPressed("e")) {
      player.inVehicle = false;
      player.vehicle.driver = null;
      player.x = player.vehicle.x + 24;
      player.y = player.vehicle.y;
      player.vehicle = null;
    }
    return;
  }
  const ax = input.axis();
  const len = Math.hypot(ax.x, ax.y) || 1;
  const speed = input.isDown("shift") ? CONFIG.playerSprint : CONFIG.playerSpeed;
  if (ax.x !== 0 || ax.y !== 0) {
    player.angle = Math.atan2(ax.y, ax.x);
    const nx = player.x + (ax.x / len) * speed * dt * 60 * 0.016;
    const ny = player.y + (ax.y / len) * speed * dt * 60 * 0.016;
    if (!collidesBuilding(city, nx, player.y, CONFIG.playerRadius)) player.x = nx;
    if (!collidesBuilding(city, player.x, ny, CONFIG.playerRadius)) player.y = ny;
  }
  player.x = clamp(player.x, 16, CONFIG.worldWidth - 16);
  player.y = clamp(player.y, 16, CONFIG.worldHeight - 16);
}

export function tryEnterVehicle(player, parked, traffic) {
  const all = parked.concat(traffic);
  for (const car of all) {
    const dx = car.x - player.x;
    const dy = car.y - player.y;
    if (dx * dx + dy * dy < 40 * 40) {
      player.inVehicle = true;
      player.vehicle = car;
      car.driver = "player";
      car.speed = 0;
      return true;
    }
  }
  return false;
}

export function spawnParkedCars(city, rng) {
  const cars = [];
  const colors = ["#e63946", "#457b9d", "#f4a261", "#2a9d8f", "#e9c46a"];
  for (let i = 0; i < 8; i++) {
    const road = city.roads[Math.floor(rng() * city.roads.length)];
    cars.push(createCar(road.x + 24, road.y + 24, rng() * Math.PI * 2, colors[i % colors.length]));
  }
  return cars;
}
