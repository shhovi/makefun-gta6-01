// Melee and hitscan pistol combat.
export function tryPunch(game) {
  const p = game.player;
  if (p.inCar || p.punchTimer > 0) return;
  p.punchTimer = 0.35;
  game.audio.punch();
  const hx = p.x + Math.cos(p.angle) * 26;
  const hy = p.y + Math.sin(p.angle) * 26;
  for (const ped of game.peds) {
    if (ped.down) continue;
    if (Math.hypot(ped.x - hx, ped.y - hy) <= 30) {
      ped.down = true;
      game.wanted.addCrime(0.6);
      game.addFloat(ped.x, ped.y - 20, 'KO!', '#ffd166');
      game.audio.crash();
      for (const other of game.peds) {
        if (Math.hypot(other.x - p.x, other.y - p.y) < 180) {
          other.scare(p.x, p.y);
        }
      }
      break;
    }
  }
}

export function tryShoot(game) {
  const p = game.player;
  if (p.inCar || !p.hasPistol || p.ammo <= 0 || p.shootTimer > 0) return;
  p.shootTimer = 0.22;
  p.ammo -= 1;
  p.muzzle = 1;
  game.audio.gunshot();
  game.wanted.addCrime(0.8);
  game.shake = Math.max(game.shake, 3);

  const dx = Math.cos(p.angle);
  const dy = Math.sin(p.angle);
  const range = 420;
  let bestDist = range;
  let bestPed = null;
  let bestCar = null;

  const consider = (tx, ty, radius) => {
    const rx = tx - p.x;
    const ry = ty - p.y;
    const along = rx * dx + ry * dy;
    if (along < 0 || along > range) return -1;
    const px = p.x + dx * along;
    const py = p.y + dy * along;
    const perp = Math.hypot(tx - px, ty - py);
    if (perp > radius) return -1;
    return along;
  };

  for (const ped of game.peds) {
    if (ped.down) continue;
    const dist = consider(ped.x, ped.y, 14);
    if (dist >= 0 && dist < bestDist) {
      bestDist = dist;
      bestPed = ped;
      bestCar = null;
    }
  }
  for (const car of game.allCars()) {
    const dist = consider(car.x, car.y, 26);
    if (dist >= 0 && dist < bestDist) {
      bestDist = dist;
      bestCar = car;
      bestPed = null;
    }
  }

  game.bullets.push({
    x: p.x + dx * 18,
    y: p.y + dy * 18,
    tx: p.x + dx * bestDist,
    ty: p.y + dy * bestDist,
    life: 0.07,
  });

  if (bestPed) {
    bestPed.down = true;
    game.addFloat(bestPed.x, bestPed.y - 20, 'DOWN', '#ff6b6b');
  } else if (bestCar) {
    bestCar.health -= 18;
    game.spawnSparks(bestCar.x, bestCar.y);
  }

  for (const ped of game.peds) {
    if (Math.hypot(ped.x - p.x, ped.y - p.y) < 260) {
      ped.scare(p.x, p.y);
    }
  }
}
