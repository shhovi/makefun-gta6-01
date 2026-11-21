import { CONFIG } from "./config.js";
import { mulberry32, randInt, pick } from "./random.js";

const BUILDING_COLORS = ["#c96f4a", "#7a9e7e", "#5b8e7d", "#d9c5a0", "#8d6e63", "#6d8ea0", "#b56576"];

export function generateCity(seed) {
  const rng = mulberry32(seed);
  const cols = CONFIG.gridCols;
  const rows = CONFIG.gridRows;
  const tile = CONFIG.tileSize;
  const cells = [];
  for (let y = 0; y < rows; y++) {
    const row = [];
    for (let x = 0; x < cols; x++) {
      const isRoad = x % 6 === 0 || y % 6 === 0;
      const isWater = y >= rows - 3;
      const isSand = y === rows - 4;
      let kind = "block";
      if (isWater) kind = "water";
      else if (isSand) kind = "sand";
      else if (isRoad) kind = "road";
      row.push(kind);
    }
    cells.push(row);
  }
  const roads = [];
  const buildings = [];
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const kind = cells[y][x];
      if (kind === "road") {
        roads.push({ x: x * tile, y: y * tile, w: tile, h: tile, cx: x, cy: y });
      } else if (kind === "block" && rng() > 0.25) {
        const w = tile * randInt(rng, 1, 2);
        const h = tile * randInt(rng, 1, 2);
        buildings.push({
          x: x * tile + 4,
          y: y * tile + 4,
          w: Math.max(24, w - 8),
          h: Math.max(24, h - 8),
          color: pick(rng, BUILDING_COLORS),
          height: randInt(rng, 1, 5),
        });
      }
    }
  }
  const stats = {
    seed,
    roadTiles: roads.length,
    buildingCount: buildings.length,
    waterRows: 3,
    coastal: true,
  };
  return {
    grid: { width: cols, height: rows, tileSize: tile, cells },
    roads,
    buildings,
    stats,
  };
}

export function isRoadAt(city, wx, wy) {
  const tx = Math.floor(wx / city.grid.tileSize);
  const ty = Math.floor(wy / city.grid.tileSize);
  if (tx < 0 || ty < 0 || tx >= city.grid.width || ty >= city.grid.height) return false;
  return city.grid.cells[ty][tx] === "road";
}

export function collidesBuilding(city, wx, wy, radius) {
  for (const b of city.buildings) {
    if (wx + radius > b.x && wx - radius < b.x + b.w && wy + radius > b.y && wy - radius < b.y + b.h) {
      return true;
    }
  }
  return false;
}
