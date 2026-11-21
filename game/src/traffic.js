import { CONFIG } from "./config.js";
import { createCar, moveCarAI } from "./vehicles.js";

const COLORS = ["#e63946", "#457b9d", "#f4a261", "#2a9d8f", "#e9c46a", "#9b5de5"];

export function createTraffic(city, rng) {
  const cars = [];
  for (let i = 0; i < CONFIG.trafficCount; i++) {
    const road = city.roads[Math.floor(rng() * city.roads.length)];
    const car = createCar(road.x + 24, road.y + 24, Math.floor(rng() * 4) * Math.PI / 2, COLORS[i % COLORS.length]);
    car.driver = "ai";
    car.target = pickRoadTarget(city, rng);
    car.cruise = 2 + rng() * 2;
    car.lane = i % 2;
    cars.push(car);
  }
  return cars;
}

function pickRoadTarget(city, rng) {
  const road = city.roads[Math.floor(rng() * city.roads.length)];
  return { x: road.x + 24, y: road.y + 24 };
}

export function updateTraffic(cars, city, rng, dt, player) {
  for (const car of cars) {
    if (car.driver === "player") continue;
    const dx = car.target.x - car.x;
    const dy = car.target.y - car.y;
    if (dx * dx + dy * dy < 30 * 30) {
      car.target = pickRoadTarget(city, rng);
    }
    let speed = car.cruise;
    if (player) {
      const pdx = player.x - car.x;
      const pdy = player.y - car.y;
      if (pdx * pdx + pdy * pdy < 60 * 60) speed = 0.6;
    }
    moveCarAI(car, car.target.x, car.target.y, speed, dt);
  }
}
