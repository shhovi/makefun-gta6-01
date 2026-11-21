// Combat: punch and pistol, damage and reactions.
import { CONFIG } from "./config.js";

export function tryPunch(player, peds, police, now) {
  let hit = false;
  const targets = peds.concat(police ? police.cops : []);
  for (const t of targets) {
    const d = Math.hypot(t.x - player.x, t.y - player.y);
    if (d < CONFIG.PUNCH_RANGE) {
      t.health = (t.health === undefined ? 40 : t.health) - CONFIG.PUNCH_DAMAGE;
      if (t.health <= 0) t.alive = false;
      hit = true;
    }
  }
  return hit;
}
export function tryShoot(player, aimX, aimY, peds, police) {
  const angle = Math.atan2(aimY - player.y, aimX - player.x);
  const targets = peds.concat(police ? police.cops : []);
  let best = null, bestD = CONFIG.PISTOL_RANGE;
  for (const t of targets) {
    if (t.alive === false) continue;
    const d = Math.hypot(t.x - player.x, t.y - player.y);
    const ta = Math.atan2(t.y - player.y, t.x - player.x);
    let diff = Math.abs(ta - angle);
    if (diff > Math.PI) diff = Math.PI * 2 - diff;
    if (d < bestD && diff < 0.25) { best = t; bestD = d; }
  }
  if (best) {
    best.health = (best.health === undefined ? 40 : best.health) - CONFIG.PISTOL_DAMAGE;
    if (best.health <= 0) best.alive = false;
  }
  return { fired: true, hit: !!best, angle: angle };
}
export function rewardForDown(t) { return t && t.alive === false ? 25 : 0; }
export function punchCooldownMs() { return 280; }
export function pistolCooldownMs() { return 220; }
