// Canvas renderer with procedural sprites — no image assets.
// Everything is drawn with rects/circles so the game needs zero downloads.

import { TILE, COLORS, WORLD_W, WORLD_H } from "./config.js";
import { TILE_ROAD, TILE_SAND, TILE_WATER } from "./city.js";

export function drawWorld(ctx, city, camera, viewW, viewH) {
  ctx.fillStyle = COLORS.grass;
  ctx.fillRect(0, 0, viewW, viewH);

  const x0 = Math.max(0, Math.floor(camera.x / TILE));
  const y0 = Math.max(0, Math.floor(camera.y / TILE));
  const x1 = Math.min(city.tiles[0].length - 1, x0 + Math.ceil(viewW / TILE) + 1);
  const y1 = Math.min(city.tiles.length - 1, y0 + Math.ceil(viewH / TILE) + 1);

  for (let ty = y0; ty <= y1; ty++) {
    for (let tx = x0; tx <= x1; tx++) {
      const t = city.tiles[ty][tx];
      const sx = tx * TILE - camera.x;
      const sy = ty * TILE - camera.y;
      if (t === TILE_ROAD) {
        ctx.fillStyle = COLORS.road;
        ctx.fillRect(sx, sy, TILE, TILE);
        ctx.fillStyle = COLORS.roadLine;
        if (tx % 6 === 0) ctx.fillRect(sx + TILE / 2 - 1, sy + 6, 2, 8);
        if (ty % 6 === 0) ctx.fillRect(sx + 6, sy + TILE / 2 - 1, 8, 2);
      } else if (t === TILE_SAND) {
        ctx.fillStyle = COLORS.sand;
        ctx.fillRect(sx, sy, TILE, TILE);
      } else if (t === TILE_WATER) {
        ctx.fillStyle = COLORS.water;
        ctx.fillRect(sx, sy, TILE, TILE);
      }
    }
  }

  for (const b of city.buildings) {
    const sx = b.x - camera.x;
    const sy = b.y - camera.y;
    if (sx + b.w < 0 || sy + b.h < 0 || sx > viewW || sy > viewH) continue;
    ctx.fillStyle = b.color;
    ctx.fillRect(sx, sy, b.w, b.h);
    ctx.strokeStyle = "rgba(0,0,0,.35)";
    ctx.strokeRect(sx + 0.5, sy + 0.5, b.w - 1, b.h - 1);
    if (b.roof) {
      ctx.fillStyle = "rgba(255,255,255,.18)";
      ctx.fillRect(sx + 6, sy + 6, b.w - 12, b.h - 12);
    }
  }
}

export function drawCar(ctx, car, camera) {
  const sx = car.x - camera.x;
  const sy = car.y - camera.y;
  ctx.save();
  ctx.translate(sx, sy);
  ctx.rotate(car.angle);
  ctx.fillStyle = car.color;
  ctx.fillRect(-18, -9, 36, 18);
  ctx.fillStyle = "#bfe6f5";
  ctx.fillRect(2, -7, 9, 14);
  ctx.fillRect(-12, -7, 7, 14);
  if (car.police) {
    ctx.fillStyle = COLORS.policeStripe;
    ctx.fillRect(-4, -9, 8, 18);
    ctx.fillStyle = car.sirenOn ? "#ff3b30" : "#3b82f6";
    ctx.fillRect(-3, -3, 6, 6);
  }
  ctx.restore();
}

export function drawPerson(ctx, person, camera, color) {
  const sx = person.x - camera.x;
  const sy = person.y - camera.y;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(sx, sy, 7, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#f1c27d";
  ctx.beginPath();
  ctx.arc(sx, sy - 1, 3.5, 0, Math.PI * 2);
  ctx.fill();
}

export function drawMarker(ctx, x, y, camera, color = "#ffd23f") {
  const sx = x - camera.x;
  const sy = y - camera.y;
  const pulse = 14 + Math.sin(Date.now() / 300) * 4;
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(sx, sy, pulse, 0, Math.PI * 2);
  ctx.stroke();
}

export function cameraFor(target, viewW, viewH) {
  return {
    x: Math.max(0, Math.min(WORLD_W - viewW, target.x - viewW / 2)),
    y: Math.max(0, Math.min(WORLD_H - viewH, target.y - viewH / 2)),
  };
}
