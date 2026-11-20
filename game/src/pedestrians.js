// Pedestrians: wander the city, flee when shots are fired nearby or when punched.
import { TILE, PED_SPEED, COLORS } from "./config.js";
import { isSolid } from "./city.js";

export class Pedestrian {
  constructor(x, y, color) {
    this.x = x;
    this.y = y;
    this.angle = Math.random() * Math.PI * 2;
    this.color = color;
    this.radius = 12;
    this.health = 40;
    this.alive = true;
    this.state = "wander"; // wander | flee
    this.fleeTimer = 0;
    this.wanderTimer = 0;
  }

  scare(fromX, fromY) {
    this.state = "flee";
    this.fleeTimer = 3;
    this.angle = Math.atan2(this.y - fromY, this.x - fromX);
  }

  update(dt, city) {
    if (!this.alive) return;
    let speed = PED_SPEED;
    if (this.state === "flee") {
      speed = PED_SPEED * 2.4;
      this.fleeTimer -= dt;
      if (this.fleeTimer <= 0) this.state = "wander";
    } else {
      this.wanderTimer -= dt;
      if (this.wanderTimer <= 0) {
        this.angle = Math.random() * Math.PI * 2;
        this.wanderTimer = 1 + Math.random() * 2.5;
      }
    }
    const nx = this.x + Math.cos(this.angle) * speed * dt;
    const ny = this.y + Math.sin(this.angle) * speed * dt;
    if (!isSolid(city, nx, ny)) {
      this.x = nx;
      this.y = ny;
    } else {
      this.angle += Math.PI * (0.5 + Math.random() * 0.5);
    }
  }

  damage(amount) {
    this.health -= amount;
    if (this.health <= 0) this.alive = false;
  }
}

export function spawnPedestrians(city, rng, count) {
  const peds = [];
  for (let i = 0; i < count && city.roadTiles.length > 0; i++) {
    const t = rng.pick(city.roadTiles);
    peds.push(new Pedestrian(t.tx * TILE + TILE / 2, t.ty * TILE + TILE / 2, rng.pick(COLORS.pedPalette)));
  }
  return peds;
}
