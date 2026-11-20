// HUD: wanted stars, health, money, minimap, mission objective text.
// Minimap shows roads, water, the mission marker, police (red) and the player (white).
import { TILE, WORLD_WIDTH, WORLD_HEIGHT } from "./config.js";
import { TILE_WATER, TILE_ROAD } from "./city.js";

export class HUD {
  constructor() {
    this.starsEl = document.getElementById("wanted-stars");
    this.statsEl = document.getElementById("stats");
    this.missionEl = document.getElementById("mission-text");
    this.minimap = document.getElementById("minimap-canvas");
    this.mmCtx = this.minimap?.getContext("2d");
  }

  update(player, wanted, missionChain, city, marker) {
    if (this.starsEl) {
      this.starsEl.textContent = "★".repeat(wanted.stars) + "☆".repeat(5 - wanted.stars);
      this.starsEl.style.opacity = wanted.stars > 0 ? "1" : "0.35";
    }
    if (this.statsEl) {
      const hearts = "♥".repeat(Math.ceil(player.health / 20));
      this.statsEl.textContent = `${hearts}  $${player.money}`;
    }
    if (this.missionEl) {
      const m = missionChain.current;
      this.missionEl.textContent = m
        ? `${m.title} — ${m.objective}`
        : "All Mara Voss missions complete. Solar Bay is yours.";
    }
    this.drawMinimap(player, wanted, city, marker);
  }

  drawMinimap(player, wanted, city, marker) {
    const ctx = this.mmCtx;
    if (!ctx || !this.minimap) return;
    const w = this.minimap.width;
    const h = this.minimap.height;
    const sx = w / WORLD_WIDTH;
    const sy = h / WORLD_HEIGHT;
    ctx.clearRect(0, 0, w, h);

    for (let ty = 0; ty < city.grid.length; ty++) {
      for (let tx = 0; tx < city.grid[ty].length; tx++) {
        const t = city.grid[ty][tx];
        ctx.fillStyle = t === TILE_WATER ? "#2b6cb0" : t === TILE_ROAD ? "#555b63" : "#3d4a3d";
        ctx.fillRect(tx * TILE * sx, ty * TILE * sy, TILE * sx + 1, TILE * sy + 1);
      }
    }

    if (marker) {
      ctx.fillStyle = "#ffd23f";
      ctx.beginPath();
      ctx.arc(marker.x * sx, marker.y * sy, 4, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.fillStyle = "#ff3b30";
    for (const cop of wanted.policeCars) {
      ctx.fillRect(cop.x * sx - 2, cop.y * sy - 2, 4, 4);
    }

    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(player.x * sx, player.y * sy, 3.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#e4572e";
    ctx.lineWidth = 2;
    ctx.stroke();
  }
}
