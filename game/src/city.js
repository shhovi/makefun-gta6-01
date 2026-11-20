// Seeded coastal city generation: road grid, blocks with buildings, beach + water edge.
// The eastern columns are always coast: one sand column, then open water.
import { CITY_COLS, CITY_ROWS, TILE, BLOCK_SIZE, COLORS } from "./config.js";
import { Random } from "./random.js";

export const TILE_ROAD = 0;
export const TILE_BUILDING = 1;
export const TILE_GRASS = 2;
export const TILE_SAND = 3;
export const TILE_WATER = 4;

export function generateCity(seed) {
  const rng = new Random(seed);
  const grid = [];
  const buildings = [];
  const waterStartCol = CITY_COLS - 5; // eastern edge is coast

  for (let y = 0; y < CITY_ROWS; y++) {
    const row = [];
    for (let x = 0; x < CITY_COLS; x++) {
      if (x >= waterStartCol + 1) row.push(TILE_WATER);
      else if (x === waterStartCol) row.push(TILE_SAND);
      else if (x % BLOCK_SIZE === 0 || y % BLOCK_SIZE === 0) row.push(TILE_ROAD);
      else row.push(rng.chance(0.72) ? TILE_BUILDING : TILE_GRASS);
    }
    grid.push(row);
  }

  for (let y = 0; y < CITY_ROWS; y++) {
    for (let x = 0; x < CITY_COLS; x++) {
      if (grid[y][x] === TILE_BUILDING) {
        buildings.push({
          tx: x,
          ty: y,
          x: x * TILE,
          y: y * TILE,
          w: TILE,
          h: TILE,
          roof: rng.pick(COLORS.buildingRoofs),
          height: rng.int(1, 4),
        });
      }
    }
  }

  const roadTiles = [];
  for (let y = 0; y < CITY_ROWS; y++) {
    for (let x = 0; x < CITY_COLS; x++) {
      if (grid[y][x] === TILE_ROAD) roadTiles.push({ tx: x, ty: y });
    }
  }

  return { grid, buildings, roadTiles, waterStartCol, seed };
}

export function tileAt(city, wx, wy) {
  const tx = Math.floor(wx / TILE);
  const ty = Math.floor(wy / TILE);
  if (tx < 0 || ty < 0 || tx >= CITY_COLS || ty >= CITY_ROWS) return TILE_WATER;
  return city.grid[ty][tx];
}

export function isSolid(city, wx, wy) {
  const t = tileAt(city, wx, wy);
  return t === TILE_BUILDING || t === TILE_WATER;
}
