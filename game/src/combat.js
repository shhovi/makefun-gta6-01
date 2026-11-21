import { CONFIG } from "./config.js";

export function createBullets() {
  return [];
}

export function tryPunch(player, peds, police) {
  if (player.inVehicle || player.punchCooldown > 0) return false;
  player.punchCooldown = 0.35;
  player.lastPunchAt = Date.now();
  const fx = player.x + Math.cos(player.angle) * CONFIG.punchRange;
  const fy = player.y + Math.sin(player.angle) * CONFIG.punchRange;
  for (const ped of peds) {
    if (ped.dead) continue;
    const dx = ped.x - fx;
    const dy = ped.y - fy;
    if (dx * dx + dy * dy < 22 * 22) {
      ped.health -= CONFIG.punchDamage;
      ped.state = "flee";
      if (ped.health <= 0) {
        ped.dead = true;
        player.money += 15;
      }
      return true;
    }
  }
  return false;
}

export function tryShoot(player, bullets, aimAngle) {
  if (player.inVehicle || player.shootCooldown > 0) return false;
  player.shootCooldown = 0.28;
  bullets.push({
    x: player.x + Math.cos(aimAngle) * 14,
    y: player.y + Math.sin(aimAngle) * 14,
    vx: Math.cos(aimAngle) * 520,
    vy: Math.sin(aimAngle) * 520,
    life: CONFIG.pistolRange / 520,
  });
  return true;
}

export function updateBullets(bullets, peds, player, dt) {
  for (let i = bullets.length - 1; i >= 0; i--) {
    const b = bullets[i];
    b.x += b.vx * dt;
    b.y += b.vy * dt;
    b.life -= dt;
    if (b.life <= 0) {
      bullets.splice(i, 1);
      continue;
    }
    for (const ped of peds) {
      if (ped.dead) continue;
      const dx = ped.x - b.x;
      const dy = ped.y - b.y;
      if (dx * dx + dy * dy < 12 * 12) {
        ped.health -= CONFIG.pistolDamage;
        ped.state = "flee";
        if (ped.health <= 0) {
          ped.dead = true;
          player.money += 25;
        }
        bullets.splice(i, 1);
        break;
      }
    }
  }
}
