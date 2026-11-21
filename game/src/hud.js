import { CONFIG } from "./config.js";
import { currentMission } from "./missions.js";

export function createHud() {
  return {
    healthEl: document.getElementById("hud-health"),
    moneyEl: document.getElementById("hud-money"),
    starsEl: document.getElementById("hud-stars"),
    objectiveEl: document.getElementById("hud-objective"),
    minimap: document.getElementById("hud-minimap"),
    dialogEl: document.getElementById("dialog"),
  };
}

export function updateHud(hud, state) {
  const player = state.player;
  hud.healthEl.textContent = "Health " + String(Math.max(0, Math.round(player.health))) + " / 100";
  hud.moneyEl.textContent = "$" + String(player.money);
  let stars = "";
  for (let i = 0; i < state.police.wanted; i++) stars += "*";
  hud.starsEl.textContent = stars;
  const mission = currentMission(state.missions);
  if (mission) hud.objectiveEl.textContent = mission.title + ": " + mission.objective;
  else hud.objectiveEl.textContent = "Free roam in Solar Bay";
  if (state.missions.message) {
    hud.dialogEl.textContent = state.missions.message;
    hud.dialogEl.classList.add("active");
  }
  drawMinimap(hud.minimap, state);
}

function drawMinimap(canvas, state) {
  const ctx = canvas.getContext("2d");
  const sx = canvas.width / CONFIG.worldWidth;
  const sy = canvas.height / CONFIG.worldHeight;
  ctx.fillStyle = "#1c2b22";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#3a4a42";
  for (const b of state.city.buildings) {
    ctx.fillRect(b.x * sx, b.y * sy, Math.max(1, b.w * sx), Math.max(1, b.h * sy));
  }
  ctx.fillStyle = "#2e6f9e";
  ctx.fillRect(0, canvas.height - 16, canvas.width, 16);
  ctx.fillStyle = "#ffd23f";
  ctx.beginPath();
  ctx.arc(state.player.x * sx, state.player.y * sy, 3, 0, Math.PI * 2);
  ctx.fill();
  const mission = currentMission(state.missions);
  if (mission) {
    ctx.fillStyle = "#ff5964";
    ctx.beginPath();
    ctx.arc(mission.target.x * sx, mission.target.y * sy, 3, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = "#7fb3ff";
  for (const car of state.police.cars) {
    ctx.fillRect(car.x * sx - 2, car.y * sy - 2, 4, 4);
  }
}
