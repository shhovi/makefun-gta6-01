// Combat: punch melee + pistol shooting, damage, NPC reactions.
// Hitscan pistol with tracer lines; gunfire scares nearby pedestrians and raises heat.
import { PUNCH_RANGE, PUNCH_DAMAGE, PISTOL_DAMAGE, PISTOL_RANGE } from "./config.js";

export class Combat {
  constructor() {
    this.shotCooldown = 0;
    this.muzzleFlash = 0;
    this.tracers = [];
  }

  punch(player, peds, wanted, audio) {
    let hit = false;
    for (const ped of peds) {
      if (!ped.alive) continue;
      const d = Math.hypot(ped.x - player.x, ped.y - player.y);
      if (d <= PUNCH_RANGE + ped.radius) {
        ped.damage(PUNCH_DAMAGE);
        ped.scare(player.x, player.y);
        hit = true;
      }
    }
    if (hit) {
      wanted.addCrime(0.4);
      audio?.punch();
    }
    return hit;
  }

  shoot(player, aimAngle, peds, cars, wanted, audio) {
    if (this.shotCooldown > 0) return false;
    this.shotCooldown = 0.28;
    this.muzzleFlash = 0.06;
    audio?.gunshot();
    wanted.addCrime(0.6);

    const dx = Math.cos(aimAngle);
    const dy = Math.sin(aimAngle);
    let bestDist = PISTOL_RANGE;
    let bestPed = null;
    let bestCar = null;

    for (const ped of peds) {
      if (!ped.alive) continue;
      const vx = ped.x - player.x;
      const vy = ped.y - player.y;
      const along = vx * dx + vy * dy;
      if (along < 0 || along > bestDist) continue;
      const perp = Math.abs(vx * dy - vy * dx);
      if (perp <= ped.radius + 4) {
        bestDist = along;
        bestPed = ped;
        bestCar = null;
      }
    }
    for (const car of cars) {
      const vx = car.x - player.x;
      const vy = car.y - player.y;
      const along = vx * dx + vy * dy;
      if (along < 0 || along > bestDist) continue;
      const perp = Math.abs(vx * dy - vy * dx);
      if (perp <= car.width) {
        bestDist = along;
        bestCar = car;
        bestPed = null;
      }
    }

    this.tracers.push({
      x1: player.x, y1: player.y,
      x2: player.x + dx * bestDist, y2: player.y + dy * bestDist,
      ttl: 0.07,
    });

    if (bestPed) {
      bestPed.damage(PISTOL_DAMAGE);
      if (bestPed.alive) bestPed.scare(player.x, player.y);
      wanted.addCrime(0.8);
    }
    if (bestCar) bestCar.damage(PISTOL_DAMAGE * 0.5);

    // Nearby pedestrians flee at the sound of gunfire.
    for (const ped of peds) {
      if (ped.alive && Math.hypot(ped.x - player.x, ped.y - player.y) < 320) {
        ped.scare(player.x, player.y);
      }
    }
    return true;
  }

  update(dt) {
    this.shotCooldown = Math.max(0, this.shotCooldown - dt);
    this.muzzleFlash = Math.max(0, this.muzzleFlash - dt);
    this.tracers = this.tracers.filter((t) => (t.ttl -= dt) > 0);
  }

  drawTracers(ctx, camera) {
    ctx.strokeStyle = "rgba(255,230,150,0.9)";
    ctx.lineWidth = 2;
    for (const t of this.tracers) {
      ctx.beginPath();
      ctx.moveTo(t.x1 - camera.x, t.y1 - camera.y);
      ctx.lineTo(t.x2 - camera.x, t.y2 - camera.y);
      ctx.stroke();
    }
  }
}
