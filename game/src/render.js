// Canvas renderer: tiles, buildings, and procedural sprites (no image assets).
// Everything is drawn with rects/arcs so the game needs zero external files.
import { TILE, COLORS } from "./config.js";
import { TILE_ROAD, TILE_BUILDING, TILE_GRASS, TILE_SAND, TILE_WATER } from "./city.js";

export function drawCity(ctx, city, camera) {
  const startTx = Math.max(0, Math.floor(camera.x / TILE));
  const startTy = Math.max(0, Math.floor(camera.y / TILE));
  const endTx = Math.min(city.grid[0].length - 1, startTx + Math.ceil(camera.w / TILE) + 1);
  const endTy = Math.min(city.grid.length - 1, startTy + Math.ceil(camera.h / TILE) + 1);

  for (let ty = startTy; ty <= endTy; ty++) {
    for (let tx = startTx; tx <= endTx; tx++) {
      const t = city.grid[ty][tx];
      const sx = tx * TILE - camera.x;
      const sy = ty * TILE - camera.y;
      if (t === TILE_ROAD) ctx.fillStyle = COLORS.road;
      else if (t === TILE_GRASS) ctx.fillStyle = COLORS.grass;
      else if (t === TILE_SAND) ctx.fillStyle = COLORS.sand;
      else if (t === TILE_WATER) ctx.fillStyle = COLORS.water;
      else ctx.fillStyle = COLORS.sidewalk;
      ctx.fillRect(sx, sy, TILE, TILE);

      if (t === TILE_ROAD) {
        ctx.fillStyle = COLORS.roadLine;
        ctx.fillRect(sx + TILE / 2 - 2, sy + 6, 4, 12);
        ctx.fillRect(sx + TILE / 2 - 2, sy + TILE - 18, 4, 12);
      }
      if (t === TILE_WATER) {
        ctx.fillStyle = COLORS.waterDeep;
        ctx.fillRect(sx, sy + TILE - 8, TILE, 8);
      }
    }
  }

  for (const b of city.buildings) {
    const sx = b.x - camera.x;
    const sy = b.y - camera.y;
    if (sx < -TILE || sy < -TILE || sx > camera.w || sy > camera.h) continue;
    ctx.fillStyle = "#22252a";
    ctx.fillRect(sx + 3, sy + 3, b.w, b.h);
    ctx.fillStyle = b.roof;
    ctx.fillRect(sx + 4, sy + 4, b.w - 8, b.h - 8);
    ctx.fillStyle = "rgba(255,255,255,0.25)";
    ctx.fillRect(sx + 10, sy + 10, 10, 8);
    ctx.fillRect(sx + 28, sy + 26, 10, 8);
  }
}

export function drawPerson(ctx, x, y, angle, color, radius = 14) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.fillStyle = "rgba(0,0,0,0.3)";
  ctx.beginPath();
  ctx.arc(2, 3, radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#f0c8a0";
  ctx.beginPath();
  ctx.arc(0, 0, radius * 0.55, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#222";
  ctx.fillRect(radius * 0.6, -3, radius * 0.8, 6); // gun / facing nub
  ctx.restore();
}

export function drawCar(ctx, car, camera) {
  const sx = car.x - camera.x;
  const sy = car.y - camera.y;
  ctx.save();
  ctx.translate(sx, sy);
  ctx.rotate(car.angle);
  ctx.fillStyle = "rgba(0,0,0,0.35)";
  ctx.fillRect(-car.length / 2 + 3, -car.width / 2 + 4, car.length, car.width);
  ctx.fillStyle = car.color;
  ctx.fillRect(-car.length / 2, -car.width / 2, car.length, car.width);
  ctx.fillStyle = "#1c2733";
  ctx.fillRect(-car.length * 0.18, -car.width / 2 + 4, car.length * 0.36, car.width - 8);
  ctx.fillStyle = "#ffe9a8";
  ctx.fillRect(car.length / 2 - 4, -car.width / 2 + 3, 4, 6);
  ctx.fillRect(car.length / 2 - 4, car.width / 2 - 9, 4, 6);
  if (car.isPolice) {
    ctx.fillStyle = "#2456a6";
    ctx.fillRect(-car.length * 0.1, -car.width / 2, car.length * 0.2, car.width);
    ctx.fillStyle = car.sirenOn ? "#ff3b30" : "#7a1f1a";
    ctx.fillRect(-5, -6, 10, 5);
    ctx.fillStyle = car.sirenOn ? "#3b82ff" : "#1f3a7a";
    ctx.fillRect(-5, 1, 10, 5);
  }
  ctx.restore();
}

export function drawMarker(ctx, x, y, camera, time) {
  const sx = x - camera.x;
  const sy = y - camera.y;
  const r = 26 + Math.sin(time * 4) * 5;
  ctx.strokeStyle = "#ffd23f";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(sx, sy, r, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = "rgba(255,210,63,0.18)";
  ctx.beginPath();
  ctx.arc(sx, sy, r, 0, Math.PI * 2);
  ctx.fill();
}
