// Seeded coastal city generation: road grid, blocks, buildings,
// and a beach + water strip along the east edge.

import { TILE, GRID_W, GRID_H, COLORS } from "./config.js";
import { makeRng } from "./random.js";

export const TILE_ROAD = 0;
export const TILE_BLOCK = 1;
export const TILE_SAND = 2;
export const TILE_WATER = 3;

const ROAD_EVERY = 6; // a road every 6 tiles in both axes — blocks are 5x5 tiles
const BEACH_START = GRID_W - 8;
const WATER_START = GRID_W - 5;

export function generateCity(seed) {
  const rng = makeRng(seed);
  const tiles = [];
  const buildings = [];

  for (let y = 0; y < GRID_H; y++) {
    const row = [];
    for (let x = 0; x < GRID_W; x++) {
      if (x >= WATER_START) row.push(TILE_WATER);
      else if (x >= BEACH_START) row.push(TILE_SAND);
      else if (x % ROAD_EVERY === 0 || y % ROAD_EVERY === 0) row.push(TILE_ROAD);
      else row.push(TILE_BLOCK);
    }
    tiles.push(row);
  }

  // Fill some blocks with buildings, leaving parks / lots elsewhere.
  for (let by = 0; by < GRID_H; by += ROAD_EVERY) {
    for (let bx = 0; bx < BEACH_START; bx += ROAD_EVERY) {
      if (!rng.chance(0.72)) continue;
      const w = rng.int(2, 4);
      const h = rng.int(2, 4);
      buildings.push({
        x: (bx + 1) * TILE,
        y: (by + 1) * TILE,
        w: w * TILE,
        h: h * TILE,
        color: rng.pick(COLORS.building),
        roof: rng.chance(0.4),
      });
    }
  }

  return { seed, tiles, buildings, beachStart: BEACH_START, waterStart: WATER_START };
}

export function tileAt(city, px, py) {
  const tx = Math.floor(px / TILE);
  const ty = Math.floor(py / TILE);
  if (tx < 0 || ty < 0 || tx >= GRID_W || ty >= GRID_H) return TILE_WATER;
  return city.tiles[ty][tx];
}

export function isRoad(city, px, py) {
  return tileAt(city, px, py) === TILE_ROAD;
}

export function isBlocked(city, px, py) {
  if (tileAt(city, px, py) === TILE_WATER) return true;
  return city.buildings.some(
    (b) => px >= b.x && px < b.x + b.w && py >= b.y && py < b.y + b.h,
  );
}

export function randomRoadPoint(city, rng) {
  for (let tries = 0; tries < 200; tries++) {
    const x = rng.int(1, GRID_W - 10) * TILE + TILE / 2;
    const y = rng.int(1, GRID_H - 2) * TILE + TILE / 2;
    if (isRoad(city, x, y)) return { x, y };
  }
  return { x: TILE * 3, y: TILE * 3 };
}
