// Pure seeded coastal city generation. No DOM access in this module.
import { CONFIG, TILE_TYPES } from "./config.js";
import { mulberry32, randInt, pick } from "./random.js";

export function generateCity(seed) {
  const rng = mulberry32(seed);
  const W = CONFIG.GRID_W;
  const H = CONFIG.GRID_H;
  const grid = [];
  const roads = [];
  const buildings = [];
  for (let y = 0; y < H; y++) {
    const row = [];
    for (let x = 0; x < W; x++) {
      let t = TILE_TYPES.GRASS;
      if (x >= CONFIG.BEACH_X + 3) t = TILE_TYPES.WATER;
      else if (x >= CONFIG.BEACH_X) t = TILE_TYPES.BEACH;
      else if (x % CONFIG.ROAD_EVERY === 0 || y % CONFIG.ROAD_EVERY === 0) t = TILE_TYPES.ROAD;
      row.push(t);
      if (t === TILE_TYPES.ROAD) roads.push({ x: x, y: y });
    }
    grid.push(row);
  }
  const palette = [CONFIG.COLORS.building, CONFIG.COLORS.building2, "#8a6db5", "#4da38a"];
  for (let by = 1; by < H - 2; by += CONFIG.BLOCK) {
    for (let bx = 1; bx < CONFIG.BEACH_X - 2; bx += CONFIG.BLOCK) {
      if (rng() < 0.18) continue;
      const bw = randInt(rng, 2, 4);
      const bh = randInt(rng, 2, 4);
      const color = pick(rng, palette);
      for (let y = by; y < Math.min(by + bh, H); y++) {
        for (let x = bx; x < Math.min(bx + bw, W); x++) grid[y][x] = TILE_TYPES.BUILDING;
      }
      buildings.push({ x: bx, y: by, w: bw, h: bh, color: color });
    }
  }
  const stats = {
    seed: seed,
    gridW: W,
    gridH: H,
    roadTiles: roads.length,
    buildingCount: buildings.length,
    worldW: CONFIG.WORLD_W,
    worldH: CONFIG.WORLD_H,
  };
  return { grid: grid, roads: roads, buildings: buildings, stats: stats };
}
export function tileAt(city, x, y) {
  if (!city || y < 0 || y >= city.grid.length) return TILE_TYPES.WATER;
  const row = city.grid[y];
  if (x < 0 || x >= row.length) return TILE_TYPES.WATER;
  return row[x];
}
export function isRoad(city, x, y) {
  return tileAt(city, x, y) === TILE_TYPES.ROAD;
}
export function isWater(city, x, y) {
  return tileAt(city, x, y) === TILE_TYPES.WATER;
}
export function isBlocked(city, x, y) {
  const t = tileAt(city, x, y);
  return t === TILE_TYPES.BUILDING || t === TILE_TYPES.WATER;
}
