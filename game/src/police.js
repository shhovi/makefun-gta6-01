// Police: wanted stars, chase behaviour, busted and wasted states.
import { CONFIG } from "./config.js";

export function createPoliceState() {
  return { wanted: 0, heat: 0, cops: [], bustedTimer: 0 };
}
export function addHeat(state, amount) {
  state.heat = Math.min(500, state.heat + amount);
  state.wanted = Math.min(5, Math.floor(state.heat / 100) + (state.heat > 0 ? 1 : 0));
  if (state.heat === 0) state.wanted = 0;
  return state.wanted;
}
export function decayHeat(state, dt) {
  state.heat = Math.max(0, state.heat - dt * 0.004);
  state.wanted = state.heat <= 0 ? 0 : Math.min(5, Math.floor(state.heat / 100) + 1);
}
export function updatePolice(state, player, rng, now) {
  const want = state.wanted * 2;
  while (state.cops.length < want) {
    state.cops.push({
      x: player.x + (rng() - 0.5) * 500,
      y: player.y + (rng() - 0.5) * 500,
      angle: 0, speed: CONFIG.POLICE_SPEED, color: CONFIG.COLORS.police,
    });
  }
  if (state.wanted === 0) state.cops.length = 0;
  let touching = false;
  for (const cop of state.cops) {
    const dx = player.x - cop.x, dy = player.y - cop.y;
    const d = Math.hypot(dx, dy) || 1;
    cop.angle = Math.atan2(dy, dx);
    cop.x += (dx / d) * cop.speed;
    cop.y += (dy / d) * cop.speed;
    if (d < 30) touching = true;
  }
  if (touching && state.wanted > 0) state.bustedTimer += 16;
  else state.bustedTimer = Math.max(0, state.bustedTimer - 16);
  return { busted: state.bustedTimer > 1500, touching: touching };
}
export function clearWanted(state) { state.heat = 0; state.wanted = 0; state.cops.length = 0; state.bustedTimer = 0; }
export function wantedLabel(state) { return state.wanted === 0 ? "clean" : "wanted x" + state.wanted; }
