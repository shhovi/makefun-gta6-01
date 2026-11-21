// Canvas renderer with procedural sprites.
import { CONFIG, TILE_TYPES } from "./config.js";

export function drawWorld(ctx, state, cam) {
  const T = CONFIG.TILE;
  const city = state.city;
  ctx.fillStyle = CONFIG.COLORS.grass;
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  const x0 = Math.max(0, Math.floor(cam.x / T) - 1);
  const y0 = Math.max(0, Math.floor(cam.y / T) - 1);
  const x1 = Math.min(CONFIG.GRID_W, x0 + Math.ceil(ctx.canvas.width / T) + 3);
  const y1 = Math.min(CONFIG.GRID_H, y0 + Math.ceil(ctx.canvas.height / T) + 3);
  for (let y = y0; y < y1; y++) {
    for (let x = x0; x < x1; x++) {
      const t = city.grid[y][x];
      const sx = x * T - cam.x;
      const sy = y * T - cam.y;
      if (t === TILE_TYPES.WATER) ctx.fillStyle = CONFIG.COLORS.water;
      else if (t === TILE_TYPES.BEACH) ctx.fillStyle = CONFIG.COLORS.beach;
      else if (t === TILE_TYPES.ROAD) ctx.fillStyle = CONFIG.COLORS.road;
      else if (t === TILE_TYPES.BUILDING) ctx.fillStyle = "#777";
      else ctx.fillStyle = CONFIG.COLORS.grass;
      ctx.fillRect(sx, sy, T, T);
      if (t === TILE_TYPES.ROAD) {
        ctx.fillStyle = "rgba(255,255,255,.35)";
        ctx.fillRect(sx + T / 2 - 1, sy + 4, 2, 8);
      }
    }
  }
  for (const b of city.buildings) {
    ctx.fillStyle = b.color;
    ctx.fillRect(b.x * T - cam.x + 2, b.y * T - cam.y + 2, b.w * T - 4, b.h * T - 4);
    ctx.fillStyle = "rgba(255,255,255,.25)";
    ctx.fillRect(b.x * T - cam.x + 6, b.y * T - cam.y + 6, 8, 8);
  }
  for (const car of state.traffic) drawCar(ctx, car, cam, car.color);
  for (const cop of state.police) drawCar(ctx, cop, cam, CONFIG.COLORS.police);
  if (state.playerVehicle) drawCar(ctx, state.playerVehicle, cam, state.playerVehicle.color);
  for (const ped of state.peds) drawPerson(ctx, ped.x - cam.x, ped.y - cam.y, ped.color);
  if (!state.playerVehicle) drawPerson(ctx, state.player.x - cam.x, state.player.y - cam.y, CONFIG.COLORS.player);
  if (state.objective) {
    ctx.fillStyle = "#ffd23f";
    ctx.beginPath();
    ctx.arc(state.objective.x - cam.x, state.objective.y - cam.y, 10, 0, Math.PI * 2);
    ctx.fill();
  }
}
export function drawCar(ctx, car, cam, color) {
  ctx.save();
  ctx.translate(car.x - cam.x, car.y - cam.y);
  ctx.rotate(car.angle || 0);
  ctx.fillStyle = color || CONFIG.COLORS.car;
  ctx.fillRect(-16, -8, 32, 16);
  ctx.fillStyle = "#bfe3ff";
  ctx.fillRect(-6, -6, 12, 12);
  ctx.fillStyle = "#111";
  ctx.fillRect(-14, -10, 7, 4);
  ctx.fillRect(7, -10, 7, 4);
  ctx.fillRect(-14, 6, 7, 4);
  ctx.fillRect(7, 6, 7, 4);
  ctx.restore();
}
export function drawMarker(ctx, x, y) {
  ctx.fillStyle = "#ffd23f";
  ctx.beginPath();
  ctx.moveTo(x, y - 18);
  ctx.lineTo(x - 7, y - 6);
  ctx.lineTo(x + 7, y - 6);
  ctx.closePath();
  ctx.fill();
}
export function drawPerson(ctx, x, y, color) {
  ctx.fillStyle = color || "#fff";
  ctx.beginPath();
  ctx.arc(x, y, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#222";
  ctx.fillRect(x - 4, y + 5, 8, 8);
}
