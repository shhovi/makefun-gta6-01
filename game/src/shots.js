export function getShotParams() {
  const q = new URLSearchParams(window.location.search);
  const shot = q.get('shot');
  const seed = parseInt(q.get('seed') || '1', 10) || 1;
  return shot ? { shot, seed } : null;
}

export function setupShot(game, name) {
  const g = game;
  g.state = 'play';
  if (name === 'city') {
    g.player.x = 700; g.player.y = 700; g.player.angle = 0.6;
    g.player.hasPistol = true; g.player.ammo = 24; g.player.cash = 1850;
    g.missions.startNext(g);
    // lively street: nudge a traffic car + peds near player
    if (g.traffic[0]) { g.traffic[0].x = 820; g.traffic[0].y = 700; g.traffic[0].angle = 0; }
    if (g.parked[0]) { g.parked[0].x = 640; g.parked[0].y = 780; g.parked[0].angle = 0.3; }
    g.peds.forEach((pd, i) => { if (i < 6) { pd.x = 650 + i * 38; pd.y = 640 + (i % 3) * 30; } });
    g.briefTimer = 999;
  } else if (name === 'drive') {
    const car = g.parked[0] || g.traffic[0];
    g.player.inCar = car;
    const rp = g.city.nearestRoadPoint(1100, 1000);
    car.x = rp ? rp.x : 1100; car.y = rp ? rp.y : 1000;
    car.angle = 0; car.speed = 320; car.health = 88;
    g.player.x = car.x; g.player.y = car.y; g.player.cash = 2400;
    g.missions.index = 1; g.missions.startNext(g);
    g.briefTimer = 0;
    g.shotCar = car; g.shotSpeed = 320;
  } else if (name === 'chase') {
    const car = g.parked[1] || g.parked[0];
    g.player.inCar = car;
    const rp = g.city.nearestRoadPoint(1500, 1300);
    car.x = rp ? rp.x : 1500; car.y = rp ? rp.y : 1300;
    car.angle = 0; car.speed = 340; car.health = 62;
    g.player.x = car.x; g.player.y = car.y; g.player.cash = 3100; g.player.health = 78;
    g.wanted.heat = 3; g.wanted.stars = 3;
    g.missions.index = 3; g.missions.startNext(g);
    g.briefTimer = 999;
    g.spawnPolice(3);
    g.police.forEach((pc, i) => {
      pc.x = car.x - 130 - i * 65; pc.y = car.y + (i - 1) * 55; pc.angle = car.angle; pc.speed = 330;
    });
    g.shake = 2;
    g.shotCar = car; g.shotSpeed = 340;
  } else if (name === 'mission') {
    g.player.x = 620; g.player.y = 620; g.player.angle = 2.2;
    g.player.hasPistol = true; g.player.ammo = 18; g.player.cash = 2750;
    g.missions.index = 2; g.missions.startNext(g);
    g.briefTimer = 999;
    // place a package near player for the shot
    if (g.missions.packages[0]) { g.missions.packages[0].x = 720; g.missions.packages[0].y = 700; }
    if (g.traffic[1]) { g.traffic[1].x = 760; g.traffic[1].y = 620; }
  } else {
    g.missions.startNext(g);
  }
  g.updateCamera(1);
}

export function autopilotStep(game) {
  // tiny deterministic drift so traffic/peds move between setup and render
  for (const c of game.traffic) c.speed = Math.max(c.speed, 120);
  // keep the shot car rolling so HUD speed reads as driving, and lay skid smoke
  if (game.shotCar) {
    game.shotCar.speed = game.shotSpeed || 320;
    game.spawnSmoke(game.shotCar.x - Math.cos(game.shotCar.angle) * 24, game.shotCar.y - Math.sin(game.shotCar.angle) * 24);
  }
}
