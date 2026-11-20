export function tryPunch(game) {
  const p = game.player;
  if (p.inCar || p.punchTimer > 0) return;
  p.punchTimer = 0.35;
  game.audio.punch();
  const hx = p.x + Math.cos(p.angle) * 26, hy = p.y + Math.sin(p.angle) * 26;
  for (const ped of game.peds) {
    if (!ped.down && Math.hypot(ped.x - hx, ped.y - hy) < 30) {
      ped.down = true;
      game.wanted.addCrime(0.6);
      game.addFloat(ped.x, ped.y - 20, 'KO!', '#ffd166');
      game.audio.crash();
      for (const q of game.peds) if (Math.hypot(q.x - p.x, q.y - p.y) < 180) q.scare(p.x, p.y);
      break;
    }
  }
}

export function tryShoot(game) {
  const p = game.player;
  if (p.inCar || !p.hasPistol || p.ammo <= 0 || p.shootTimer > 0) return;
  p.shootTimer = 0.22; p.ammo--; p.muzzle = 1;
  game.audio.gunshot();
  game.wanted.addCrime(0.8);
  game.shake = Math.max(game.shake, 3);
  const range = 420;
  let bestT = range, hit = null;
  const dx = Math.cos(p.angle), dy = Math.sin(p.angle);
  const test = (x, y, r, obj) => {
    const t = (x - p.x) * dx + (y - p.y) * dy;
    if (t < 0 || t > bestT) return;
    const px = p.x + dx * t, py = p.y + dy * t;
    if (Math.hypot(x - px, y - py) < r) { bestT = t; hit = obj; }
  };
  for (const ped of game.peds) if (!ped.down) test(ped.x, ped.y, 14, { type: 'ped', o: ped });
  for (const c of game.allCars()) test(c.x, c.y, 26, { type: 'car', o: c });
  game.bullets.push({ x: p.x + dx * 18, y: p.y + dy * 18, tx: p.x + dx * bestT, ty: p.y + dy * bestT, life: 0.07 });
  if (hit) {
    if (hit.type === 'ped') { hit.o.down = true; game.addFloat(hit.o.x, hit.o.y - 20, 'DOWN', '#ff6b6b'); }
    else { hit.o.health -= 18; game.spawnSparks(hit.o.x, hit.o.y); }
  }
  for (const q of game.peds) if (Math.hypot(q.x - p.x, q.y - p.y) < 260) q.scare(p.x, p.y);
}
