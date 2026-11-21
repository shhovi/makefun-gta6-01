import { CONFIG } from "./config.js";

export function createRenderer(canvas) {
  const ctx = canvas.getContext("2d");
  return {
    ctx,
    draw(state) {
      const camX = state.camera.x;
      const camY = state.camera.y;
      ctx.fillStyle = "#3f7a52";
      ctx.fillRect(0, 0, CONFIG.canvasWidth, CONFIG.canvasHeight);
      ctx.fillStyle = "#ffffff";
      ctx.font = "12px sans-serif";
      ctx.fillText("Solar Bay", 8, CONFIG.canvasHeight - 8);
      drawCity(ctx, state.city, camX, camY);
      drawVehicles(ctx, state.traffic, camX, camY, false);
      drawVehicles(ctx, state.parked, camX, camY, false);
      drawVehicles(ctx, state.police.cars, camX, camY, true);
      drawPeds(ctx, state.peds, camX, camY);
      if (state.player.inVehicle && state.player.vehicle) {
        drawCar(ctx, state.player.vehicle, camX, camY, "#ffd23f");
      } else {
        drawPerson(ctx, state.player.x - camX, state.player.y - camY, state.player.angle, "#ffd23f");
      }
      drawBullets(ctx, state.bullets, camX, camY);
      if (state.missionTarget) {
        const tx = state.missionTarget.x - camX;
        const ty = state.missionTarget.y - camY;
        ctx.strokeStyle = "#ffd23f";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(tx, ty, 18, 0, Math.PI * 2);
        ctx.stroke();
      }
    },
  };
}

function drawCity(ctx, city, camX, camY) {
  const tile = city.grid.tileSize;
  for (let y = 0; y < city.grid.height; y++) {
    for (let x = 0; x < city.grid.width; x++) {
      const kind = city.grid.cells[y][x];
      const sx = x * tile - camX;
      const sy = y * tile - camY;
      if (sx < -tile || sy < -tile || sx > CONFIG.canvasWidth + tile || sy > CONFIG.canvasHeight + tile) continue;
      if (kind === "road") ctx.fillStyle = "#333a40";
      else if (kind === "water") ctx.fillStyle = "#2e6f9e";
      else if (kind === "sand") ctx.fillStyle = "#e6d3a3";
      else ctx.fillStyle = "#4a8a5f";
      ctx.fillRect(sx, sy, tile, tile);
      if (kind === "road") {
        ctx.fillStyle = "#f2f2f2";
        ctx.fillRect(sx + tile / 2 - 1, sy + 6, 2, 10);
        ctx.fillRect(sx + tile / 2 - 1, sy + tile - 16, 2, 10);
      }
    }
  }
  for (const b of city.buildings) {
    const sx = b.x - camX;
    const sy = b.y - camY;
    ctx.fillStyle = b.color;
    ctx.fillRect(sx, sy, b.w, b.h);
    ctx.strokeStyle = "#222222";
    ctx.lineWidth = 1;
    ctx.strokeRect(sx, sy, b.w, b.h);
    ctx.fillStyle = "rgba(0,0,0,0.15)";
    ctx.fillRect(sx + 4, sy + 4, Math.max(4, b.w - 8), 6);
  }
}

function drawCar(ctx, car, camX, camY, color) {
  const sx = car.x - camX;
  const sy = car.y - camY;
  ctx.save();
  ctx.translate(sx, sy);
  ctx.rotate(car.angle);
  ctx.fillStyle = color;
  ctx.fillRect(-18, -9, 36, 18);
  ctx.fillStyle = "#1c1c1c";
  ctx.fillRect(-8, -7, 16, 14);
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(14, -7, 3, 4);
  ctx.fillRect(14, 3, 3, 4);
  ctx.restore();
}

function drawVehicles(ctx, cars, camX, camY, police) {
  for (const car of cars) {
    drawCar(ctx, car, camX, camY, police ? "#2b4c9b" : car.color);
    if (police) {
      const sx = car.x - camX;
      const sy = car.y - camY;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(sx - 6, sy - 3, 12, 6);
      ctx.fillStyle = "#e63946";
      ctx.fillRect(sx - 6, sy - 3, 6, 6);
    }
  }
}

function drawPerson(ctx, sx, sy, angle, color) {
  ctx.save();
  ctx.translate(sx, sy);
  ctx.rotate(angle);
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(0, 0, 9, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#222222";
  ctx.fillRect(4, -2, 8, 4);
  ctx.restore();
}

function drawPeds(ctx, peds, camX, camY) {
  for (const ped of peds) {
    if (ped.dead) continue;
    drawPerson(ctx, ped.x - camX, ped.y - camY, ped.angle, ped.color);
  }
}

function drawBullets(ctx, bullets, camX, camY) {
  ctx.fillStyle = "#fff3b0";
  for (const b of bullets) {
    ctx.fillRect(b.x - camX - 2, b.y - camY - 2, 4, 4);
  }
}
