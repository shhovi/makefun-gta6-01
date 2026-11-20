// Combat: F to punch, mouse click to fire the pistol.
// Every violent act adds heat, so the wanted stars follow quickly.

import { scarePedestrians } from "./pedestrians.js";
import { addCrime } from "./police.js";

export const PUNCH_RANGE = 34;
export const PUNCH_DAMAGE = 12;
export const PISTOL_DAMAGE = 30;
export const PISTOL_RANGE = 520;

export function punch(player, peds, wanted, audio) {
  if (player.vehicle || player.punchCooldown > 0) return false;
  player.punchCooldown = 0.35;
  audio?.punch();
  for (const ped of peds) {
    if (ped.health <= 0) continue;
    const d = Math.hypot(ped.x - player.x, ped.y - player.y);
    if (d <= PUNCH_RANGE) {
      ped.health -= PUNCH_DAMAGE;
      ped.fleeTimer = 3;
      ped.angle = Math.atan2(ped.y - player.y, ped.x - player.x);
      addCrime(wanted, 12);
      scarePedestrians(peds, player.x, player.y, 180);
      return true;
    }
  }
  return false;
}

export function shoot(player, aimX, aimY, peds, vehicles, wanted, audio) {
  if (player.shootCooldown > 0) return false;
  player.shootCooldown = 0.28;
  audio?.gunshot();
  addCrime(wanted, 18);
  scarePedestrians(peds, player.x, player.y, 320);

  const dx = aimX - player.x;
  const dy = aimY - player.y;
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len;
  const uy = dy / len;

  // Nearest target roughly along the aim ray.
  let best = null;
  let bestDist = PISTOL_RANGE;
  const consider = (target, radius) => {
    const tx = target.x - player.x;
    const ty = target.y - player.y;
    const along = tx * ux + ty * uy;
    if (along < 0 || along > PISTOL_RANGE) return;
    const perp = Math.abs(tx * uy - ty * ux);
    if (perp <= radius && along < bestDist) {
      best = target;
      bestDist = along;
    }
  };
  for (const ped of peds) if (ped.health > 0) consider(ped, 12);
  for (const car of vehicles) consider(car, 20);

  if (best) {
    best.health = Math.max(0, (best.health ?? 100) - PISTOL_DAMAGE);
    if (best.fleeTimer !== undefined) best.fleeTimer = 3;
  }
  return true;
}
