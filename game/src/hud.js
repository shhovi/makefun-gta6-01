// HUD: wanted stars, health, money, minimap, objective text.
import { CONFIG } from "./config.js";

export function starString(wanted) {
  let s = "";
  for (let i = 0; i < 5; i++) s += i < wanted ? "\u2605" : "\u2606";
  return s;
}
export function updateHud(els, state) {
  if (els.stars) els.stars.textContent = starString(state.police.wanted);
  if (els.stats) els.stats.textContent = "Health: " + Math.round(state.player.health) + "  Money: $" + state.player.money;
  if (els.mission) {
    const m = state.missions.active;
    els.mission.textContent = m ? m.dialog + " — " + m.objective : "Mara Voss: You run Solar Bay now. Free roam.";
  }
}
export function healthBarWidth(health, maxW) { return Math.round((Math.max(0, health) / CONFIG.MAX_HEALTH) * maxW); }
export function drawMinimap(ctx, state) {
  const w = ctx.canvas.width, h = ctx.canvas.height;
  const sx = w / CONFIG.WORLD_W, sy = h / CONFIG.WORLD_H;
  ctx.fillStyle = "#123524";
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = CONFIG.COLORS.water;
  ctx.fillRect(CONFIG.BEACH_X * CONFIG.TILE * sx, 0, w, h);
  ctx.fillStyle = "#888";
  for (const r of state.city.roads) ctx.fillRect(r.x * CONFIG.TILE * sx, r.y * CONFIG.TILE * sy, 2, 2);
  if (state.objective) {
    ctx.fillStyle = "#ffd23f";
    ctx.fillRect(state.objective.x * sx - 3, state.objective.y * sy - 3, 6, 6);
  }
  for (const cop of state.police.cops) { ctx.fillStyle = "#4da3ff"; ctx.fillRect(cop.x * sx - 2, cop.y * sy - 2, 4, 4); }
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(state.player.x * sx - 3, state.player.y * sy - 3, 6, 6);
}
