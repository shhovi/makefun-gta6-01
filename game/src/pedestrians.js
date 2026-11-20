import { CFG } from './config.js';

const SHIRTS = ['#ff6b6b','#4ecdc4','#ffe66d','#a78bfa','#f9a8d4','#6ee7b7','#93c5fd','#fca5a5'];
const SKIN = ['#f1c27d','#e0ac69','#c68642','#8d5524','#ffdbac'];

export class Pedestrian {
  constructor(x, y, rng) {
    this.x = x; this.y = y; this.rng = rng;
    this.angle = rng() * Math.PI * 2;
    this.speed = 55 + rng() * 40;
    this.shirt = SHIRTS[Math.floor(rng() * SHIRTS.length)];
    this.skin = SKIN[Math.floor(rng() * SKIN.length)];
    this.state = 'walk'; this.timer = rng() * 3; this.walkPhase = rng() * 6;
    this.down = false; this.fleeX = 0; this.fleeY = 0;
  }
  scare(fromX, fromY) {
    if (this.down) return;
    this.state = 'flee'; this.timer = 2.5;
    const a = Math.atan2(this.y - fromY, this.x - fromX);
    this.fleeX = Math.cos(a); this.fleeY = Math.sin(a);
  }
  update(dt, city) {
    if (this.down) return;
    this.timer -= dt;
    let dx, dy, sp = this.speed;
    if (this.state === 'flee') {
      dx = this.fleeX; dy = this.fleeY; sp = 230;
      if (this.timer <= 0) this.state = 'walk';
    } else {
      if (this.timer <= 0) { this.angle = this.rng() * Math.PI * 2; this.timer = 1.5 + this.rng() * 3; }
      dx = Math.cos(this.angle); dy = Math.sin(this.angle);
    }
    const nx = this.x + dx * sp * dt, ny = this.y + dy * sp * dt;
    if (!city.collides(nx, this.y, 9)) this.x = nx; else this.angle += Math.PI / 2;
    if (!city.collides(this.x, ny, 9)) this.y = ny; else this.angle -= Math.PI / 2;
    this.walkPhase += dt * 10;
  }
}

export function spawnPeds(city, rng, count = 36) {
  const peds = [];
  for (let i = 0; i < count; i++) {
    const x = rng() * CFG.WORLD_W, y = rng() * (CFG.WORLD_H - 480);
    if (city.collides(x, y, 10)) continue;
    peds.push(new Pedestrian(x, y, rng));
  }
  return peds;
}
