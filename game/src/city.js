import { CFG } from './config.js';
import { pick, randRange } from './random.js';

export class City {
  constructor(rng) {
    this.rng = rng;
    this.buildings = []; this.palms = []; this.props = [];
    this.roadXs = []; this.roadYs = [];
    this.generate();
  }
  generate() {
    const { WORLD_W, WORLD_H, BLOCK, ROAD } = CFG;
    const step = BLOCK + ROAD;
    for (let x = ROAD / 2; x < WORLD_W; x += step) this.roadXs.push(x + BLOCK);
    for (let y = ROAD / 2; y < WORLD_H; y += step) this.roadYs.push(y + BLOCK);
    // Simpler: roads at regular grid lines
    this.roadXs = []; this.roadYs = [];
    for (let x = 0; x <= WORLD_W; x += step) this.roadXs.push(x);
    for (let y = 0; y <= WORLD_H; y += step) this.roadYs.push(y);
    const rng = this.rng;
    const beachY = WORLD_H - 420;
    for (let bx = 0; bx < WORLD_W; bx += step) {
      for (let by = 0; by < WORLD_H; by += step) {
        const ix = bx + ROAD, iy = by + ROAD;
        const iw = BLOCK - ROAD, ih = BLOCK - ROAD;
        if (iw <= 0 || ih <= 0) continue;
        if (iy > beachY) continue; // beach / water zone
        const n = 1 + Math.floor(rng() * 2);
        for (let i = 0; i < n; i++) {
          const w = randRange(rng, 90, Math.min(190, iw - 20));
          const h = randRange(rng, 80, Math.min(170, ih - 20));
          const x = ix + 10 + rng() * Math.max(1, iw - w - 20);
          const y = iy + 10 + rng() * Math.max(1, ih - h - 20);
          this.buildings.push({ x, y, w, h, color: pick(rng, CFG.COLORS.roof), floors: 1 + Math.floor(rng() * 4), seed: rng() });
        }
      }
    }
    // palms along roads + beach
    for (let i = 0; i < 220; i++) {
      const onBeach = rng() < 0.35;
      const x = rng() * WORLD_W;
      const y = onBeach ? beachY + rng() * 140 : rng() * (beachY - 40);
      if (!onBeach && this.isRoad(x, y)) continue;
      this.palms.push({ x, y, s: randRange(rng, 0.8, 1.4), lean: randRange(rng, -0.3, 0.3) });
    }
    // street lamps / benches as props
    for (let i = 0; i < 80; i++) this.props.push({ x: rng() * WORLD_W, y: rng() * (beachY - 60), type: rng() < 0.5 ? 'lamp' : 'bench' });
  }
  isRoad(x, y) {
    const step = CFG.BLOCK + CFG.ROAD;
    const mx = x % step, my = y % step;
    return mx < CFG.ROAD || my < CFG.ROAD;
  }
  isWater(x, y) { return y > CFG.WORLD_H - 260; }
  isBeach(x, y) { return y > CFG.WORLD_H - 420 && y <= CFG.WORLD_H - 260; }
  collides(x, y, r) {
    if (x - r < 8 || y - r < 8 || x + r > CFG.WORLD_W - 8 || y + r > CFG.WORLD_H - 8) return true;
    if (this.isWater(x, y)) return true;
    for (const b of this.buildings) {
      if (x + r > b.x && x - r < b.x + b.w && y + r > b.y && y - r < b.y + b.h) return true;
    }
    return false;
  }
  nearestRoadPoint(x, y) {
    let best = null, bd = 1e18;
    for (const rx of this.roadXs) { const d = Math.abs(rx + CFG.ROAD / 2 - x); if (d < bd) { bd = d; best = { x: rx + CFG.ROAD / 2, y }; } }
    for (const ry of this.roadYs) { const d = Math.abs(ry + CFG.ROAD / 2 - y); if (d < bd) { bd = d; best = { x, y: ry + CFG.ROAD / 2 }; } }
    return best;
  }
  districtAt(x, y) {
    const col = Math.min(2, Math.floor(x / (CFG.WORLD_W / 3)));
    const row = Math.min(1, Math.floor(y / (CFG.WORLD_H / 2)));
    return CFG.DISTRICTS[row * 3 + col];
  }
}
