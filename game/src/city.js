import { CFG } from './config.js';
import { pick, randRange } from './random.js';

// Seeded city layout: roads, blocks, palms, and props.
export class City {
  constructor(rng) {
    this.rng = rng;
    this.buildings = [];
    this.palms = [];
    this.props = [];
    this.roadXs = [];
    this.roadYs = [];
    this.generate();
  }

  generate() {
    const rng = this.rng;
    const step = CFG.BLOCK + CFG.ROAD;
    for (let x = 0; x <= CFG.WORLD_W; x += step) {
      this.roadXs.push(x);
    }
    for (let y = 0; y <= CFG.WORLD_H; y += step) {
      this.roadYs.push(y);
    }
    const beachY = CFG.WORLD_H - 420;

    for (let by = 0; by < CFG.WORLD_H; by += step) {
      for (let bx = 0; bx < CFG.WORLD_W; bx += step) {
        const ix = bx + CFG.ROAD;
        const iy = by + CFG.ROAD;
        const iw = CFG.BLOCK - CFG.ROAD;
        const ih = CFG.BLOCK - CFG.ROAD;
        if (iw <= 0 || ih <= 0 || iy > beachY) continue;
        const n = 1 + Math.floor(rng() * 2);
        for (let i = 0; i < n; i++) {
          const w = randRange(rng, 90, Math.min(190, iw - 20));
          const h = randRange(rng, 80, Math.min(170, ih - 20));
          const x = ix + 10 + rng() * Math.max(1, iw - w - 20);
          const y = iy + 10 + rng() * Math.max(1, ih - h - 20);
          this.buildings.push({
            x,
            y,
            w,
            h,
            color: pick(rng, CFG.COLORS.roof),
            floors: 1 + Math.floor(rng() * 4),
            seed: rng(),
          });
        }
      }
    }

    for (let i = 0; i < 220; i++) {
      const onBeach = rng() < 0.35;
      const x = rng() * CFG.WORLD_W;
      const y = onBeach ? beachY + rng() * 140 : rng() * (beachY - 40);
      if (!onBeach && this.isRoad(x, y)) continue;
      this.palms.push({
        x,
        y,
        s: randRange(rng, 0.8, 1.4),
        lean: randRange(rng, -0.3, 0.3),
      });
    }

    for (let i = 0; i < 80; i++) {
      this.props.push({
        x: rng() * CFG.WORLD_W,
        y: rng() * (beachY - 60),
        type: rng() < 0.5 ? 'lamp' : 'bench',
      });
    }
  }

  isRoad(x, y) {
    const step = CFG.BLOCK + CFG.ROAD;
    const mx = ((x % step) + step) % step;
    const my = ((y % step) + step) % step;
    return mx < CFG.ROAD || my < CFG.ROAD;
  }

  isWater(x, y) {
    return y > CFG.WORLD_H - 260;
  }

  isBeach(x, y) {
    return y > CFG.WORLD_H - 420 && y <= CFG.WORLD_H - 260;
  }

  collides(x, y, r) {
    if (x - r < 8 || y - r < 8 || x + r > CFG.WORLD_W - 8 || y + r > CFG.WORLD_H - 8) {
      return true;
    }
    if (this.isWater(x, y)) return true;
    for (const b of this.buildings) {
      if (x + r > b.x && x - r < b.x + b.w && y + r > b.y && y - r < b.y + b.h) {
        return true;
      }
    }
    return false;
  }

  nearestRoadPoint(x, y) {
    let best = null;
    let bestDist = Infinity;
    for (const rx of this.roadXs) {
      const px = rx + CFG.ROAD / 2;
      const dist = Math.abs(px - x);
      if (dist < bestDist) {
        bestDist = dist;
        best = { x: px, y };
      }
    }
    for (const ry of this.roadYs) {
      const py = ry + CFG.ROAD / 2;
      const dist = Math.abs(py - y);
      if (dist < bestDist) {
        bestDist = dist;
        best = { x, y: py };
      }
    }
    return best;
  }

  districtAt(x, y) {
    const col = Math.min(2, Math.floor(x / (CFG.WORLD_W / 3)));
    const row = Math.min(1, Math.floor(y / (CFG.WORLD_H / 2)));
    return CFG.DISTRICTS[row * 3 + col];
  }
}
