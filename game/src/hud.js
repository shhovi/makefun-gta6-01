// HUD: wanted stars, health, money, objective text, minimap.
// The minimap is a second small canvas updated every frame.

import { MAX_WANTED, WORLD_W, WORLD_H } from "./config.js";

export function starsText(level) {
  let out = "";
  for (let i = 0; i < MAX_WANTED; i++) out += i < level ? "★" : "☆";
  return out;
}

export function updateHud(els, player, wanted, mission, missionState) {
  els.wanted.textContent = starsText(wanted.level);
  els.health.textContent = `Health: ${Math.ceil(player.health)}`;
  els.money.textContent = `Money: $${player.money}`;
  if (missionState.completed) {
    els.objective.textContent = "Story complete — Solar Bay is yours.";
    els.dialog.style.display = "none";
  } else if (mission) {
    els.objective.textContent = `${mission.title}: ${mission.objective} ($${mission.reward})`;
    if (missionState.dialogTimer > 0) {
      els.dialog.textContent = mission.dialog;
      els.dialog.style.display = "block";
    } else {
      els.dialog.style.display = "none";
    }
  }
}

export function drawMinimap(ctx, city, player, mission, policeCars, size = 160) {
  const sx = size / WORLD_W;
  const sy = size / WORLD_H;
  ctx.fillStyle = "#24402a";
  ctx.fillRect(0, 0, size, size);

  // Water strip on the east edge.
  ctx.fillStyle = "#2e6fb0";
  ctx.fillRect(city.waterStart * 32 * sx, 0, size, size);

  for (const b of city.buildings) {
    ctx.fillStyle = "#8d9aa5";
    ctx.fillRect(b.x * sx, b.y * sy, Math.max(2, b.w * sx), Math.max(2, b.h * sy));
  }

  if (mission) {
    ctx.fillStyle = "#ffd23f";
    ctx.beginPath();
    ctx.arc(mission.marker.x * sx, mission.marker.y * sy, 4, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.fillStyle = "#3b82f6";
  for (const car of policeCars) {
    ctx.fillRect(car.x * sx - 2, car.y * sy - 2, 4, 4);
  }

  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.arc(player.x * sx, player.y * sy, 3.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#161616";
  ctx.stroke();
}
