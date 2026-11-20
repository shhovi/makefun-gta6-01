import { CFG } from './config.js';
import { roundRect } from './hud.js';

// Canvas rendering for the world and menu screens.
function drawPed(ctx, ped, vx, vy) {
  const x = ped.x - vx;
  const y = ped.y - vy;
  ctx.beginPath();
  ctx.ellipse(x, y + 8, 10, 4, 0, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  ctx.fill();

  if (ped.down) {
    ctx.fillStyle = ped.shirt;
    ctx.fillRect(x - 12, y - 5, 24, 10);
    ctx.beginPath();
    ctx.arc(x + 14, y, 5.5, 0, Math.PI * 2);
    ctx.fillStyle = ped.skin;
    ctx.fill();
    return;
  }

  const swing = Math.sin(ped.walkPhase) * 5;
  ctx.strokeStyle = '#33415c';
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x, y + 4);
  ctx.lineTo(x - 4 + swing * 0.4, y + 12);
  ctx.moveTo(x, y + 4);
  ctx.lineTo(x + 4 - swing * 0.4, y + 12);
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(x, y, 9, 0, Math.PI * 2);
  ctx.fillStyle = ped.shirt;
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x, y - 2, 5.5, 0, Math.PI * 2);
  ctx.fillStyle = ped.skin;
  ctx.fill();
}

function drawPlayer(ctx, game, vx, vy) {
  const p = game.player;
  const x = p.x - vx;
  const y = p.y - vy;

  ctx.beginPath();
  ctx.ellipse(x, y + 9, 11, 4, 0, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  ctx.fill();

  if (p.moving) {
    const swing = Math.sin(p.walkPhase) * 5;
    ctx.strokeStyle = '#33415c';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(x, y + 4);
    ctx.lineTo(x - 4 + swing * 0.4, y + 13);
    ctx.moveTo(x, y + 4);
    ctx.lineTo(x + 4 - swing * 0.4, y + 13);
    ctx.stroke();
  }

  ctx.beginPath();
  ctx.arc(x, y, 10, 0, Math.PI * 2);
  ctx.fillStyle = '#ff7b00';
  ctx.fill();
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(x, y - 2, 6, 0, Math.PI * 2);
  ctx.fillStyle = '#f1c27d';
  ctx.fill();

  if (p.hasPistol) {
    const gx = x + Math.cos(p.angle) * 16;
    const gy = y + Math.sin(p.angle) * 16;
    ctx.strokeStyle = '#222222';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(gx, gy);
    ctx.stroke();
    if (p.muzzle > 0) {
      ctx.beginPath();
      ctx.arc(gx + Math.cos(p.angle) * 6, gy + Math.sin(p.angle) * 6, 6 * p.muzzle + 2, 0, Math.PI * 2);
      ctx.fillStyle = '#ffd166';
      ctx.fill();
    }
  } else if (p.punchTimer > 0.15) {
    ctx.beginPath();
    ctx.arc(x + Math.cos(p.angle) * 14, y + Math.sin(p.angle) * 14, 5, 0, Math.PI * 2);
    ctx.fillStyle = '#f1c27d';
    ctx.fill();
  }

  ctx.font = 'bold 11px Arial, sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.fillText('YOU', x, y - 20);
}

function drawCar(ctx, car, vx, vy, time) {
  const x = car.x - vx;
  const y = car.y - vy;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(car.angle);

  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  ctx.fillRect(-car.w / 2 + 3, -car.h / 2 + 4, car.w, car.h);

  roundRect(ctx, -car.w / 2, -car.h / 2, car.w, car.h, 6);
  ctx.fillStyle = car.wrecked ? '#3a3a3a' : car.color;
  ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,0.45)';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  if (car.isPolice) {
    ctx.fillStyle = '#1b263b';
    ctx.fillRect(-car.w / 2 + 4, -6, car.w - 8, 12);
    ctx.font = 'bold 9px Arial, sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('POLICE', 0, 0);
    const phase = Math.sin(car.lightPhase || time * 10) > 0;
    ctx.beginPath();
    ctx.arc(-6, -8, 4, 0, Math.PI * 2);
    ctx.fillStyle = phase ? '#ff5252' : 'rgba(255,82,82,0.3)';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(6, -8, 4, 0, Math.PI * 2);
    ctx.fillStyle = phase ? 'rgba(77,166,255,0.3)' : '#4da6ff';
    ctx.fill();
  } else {
    ctx.fillStyle = 'rgba(20,40,60,0.85)';
    ctx.fillRect(-12, -8, 24, 16);
    ctx.fillStyle = 'rgba(160,220,255,0.8)';
    ctx.fillRect(8, -7, 6, 14);
    ctx.fillRect(-14, -7, 5, 14);
  }

  ctx.fillStyle = '#ffe9a8';
  ctx.fillRect(car.w / 2 - 3, -car.h / 2 + 2, 3, 5);
  ctx.fillRect(car.w / 2 - 3, car.h / 2 - 7, 3, 5);
  ctx.fillStyle = '#ff5252';
  ctx.fillRect(-car.w / 2, -car.h / 2 + 2, 3, 5);
  ctx.fillRect(-car.w / 2, car.h / 2 - 7, 3, 5);

  ctx.restore();

  if (car.health < 100 && !car.wrecked) {
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(x - 22, y - 26, 44, 6);
    ctx.fillStyle = car.health > 45 ? '#3ddc84' : '#ff5252';
    ctx.fillRect(x - 22, y - 26, 44 * Math.max(0, car.health) / 100, 6);
  }
  if (car.wrecked) {
    ctx.font = 'bold 11px Arial, sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.fillText('WRECKED', x, y - 20);
  }
}

export function drawWorld(ctx, game) {
  const vx = game.camera.x;
  const vy = game.camera.y;
  const city = game.city;

  ctx.fillStyle = CFG.COLORS.grass;
  ctx.fillRect(0, 0, CFG.W, CFG.H);

  const waterY = CFG.WORLD_H - 260 - vy;
  const beachY = CFG.WORLD_H - 420 - vy;
  if (beachY < CFG.H) {
    ctx.fillStyle = CFG.COLORS.sand;
    ctx.fillRect(0, Math.max(0, beachY), CFG.W, CFG.H - Math.max(0, beachY));
    const grad = ctx.createLinearGradient(0, waterY, 0, CFG.H);
    grad.addColorStop(0, CFG.COLORS.water2);
    grad.addColorStop(1, CFG.COLORS.water);
    ctx.fillStyle = grad;
    ctx.fillRect(0, Math.max(0, waterY), CFG.W, CFG.H - Math.max(0, waterY));
    ctx.strokeStyle = 'rgba(255,255,255,0.8)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let sx = 0; sx <= CFG.W; sx += 16) {
      const sy = waterY + Math.sin(sx * 0.03 + game.time * 1.5) * 4;
      if (sx === 0) ctx.moveTo(sx, sy);
      else ctx.lineTo(sx, sy);
    }
    ctx.stroke();
  }

  ctx.fillStyle = CFG.COLORS.road;
  for (const rx of city.roadXs) {
    const sx = rx - vx;
    if (sx + CFG.ROAD < 0 || sx > CFG.W) continue;
    ctx.fillRect(sx, 0, CFG.ROAD, CFG.H);
  }
  for (const ry of city.roadYs) {
    const sy = ry - vy;
    if (sy + CFG.ROAD < 0 || sy > CFG.H) continue;
    ctx.fillRect(0, sy, CFG.W, CFG.ROAD);
  }

  ctx.fillStyle = CFG.COLORS.sidewalk;
  for (const rx of city.roadXs) {
    const sx = rx - vx;
    if (sx + CFG.ROAD + 8 < 0 || sx - 8 > CFG.W) continue;
    ctx.fillRect(sx - 8, 0, 8, CFG.H);
    ctx.fillRect(sx + CFG.ROAD, 0, 8, CFG.H);
  }
  for (const ry of city.roadYs) {
    const sy = ry - vy;
    if (sy + CFG.ROAD + 8 < 0 || sy - 8 > CFG.H) continue;
    ctx.fillRect(0, sy - 8, CFG.W, 8);
    ctx.fillRect(0, sy + CFG.ROAD, CFG.W, 8);
  }

  ctx.strokeStyle = CFG.COLORS.roadLine;
  ctx.lineWidth = 3;
  ctx.setLineDash([22, 18]);
  ctx.beginPath();
  for (const rx of city.roadXs) {
    const cx = rx + CFG.ROAD / 2 - vx;
    if (cx < -20 || cx > CFG.W + 20) continue;
    ctx.moveTo(cx, 0);
    ctx.lineTo(cx, CFG.H);
  }
  for (const ry of city.roadYs) {
    const cy = ry + CFG.ROAD / 2 - vy;
    if (cy < -20 || cy > CFG.H + 20) continue;
    ctx.moveTo(0, cy);
    ctx.lineTo(CFG.W, cy);
  }
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.strokeStyle = 'rgba(20,20,20,0.55)';
  ctx.lineWidth = 4;
  ctx.beginPath();
  for (const s of game.skids) {
    ctx.moveTo(s.x1 - vx, s.y1 - vy);
    ctx.lineTo(s.x2 - vx, s.y2 - vy);
  }
  ctx.stroke();

  for (const b of city.buildings) {
    const sx = b.x - vx;
    const sy = b.y - vy;
    if (sx + b.w < -20 || sy + b.h < -20 || sx > CFG.W + 20 || sy > CFG.H + 20) continue;
    ctx.fillStyle = 'rgba(0,0,0,0.22)';
    ctx.fillRect(sx + 8, sy + 10, b.w, b.h);
    ctx.fillStyle = b.color;
    ctx.fillRect(sx, sy, b.w, b.h);
    ctx.strokeStyle = 'rgba(0,0,0,0.35)';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(sx, sy, b.w, b.h);
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.fillRect(sx + 4, sy + 4, b.w - 8, 6);
    const cols = Math.max(2, Math.floor(b.w / 34));
    const rows = Math.max(2, Math.floor(b.h / 34));
    ctx.fillStyle = 'rgba(30,60,90,0.55)';
    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        if ((i * 7 + j * 13 + Math.floor(b.seed * 100)) % 5 === 0) continue;
        ctx.fillRect(sx + 10 + i * (b.w - 20) / cols, sy + 16 + j * (b.h - 24) / rows, 12, 10);
      }
    }
    ctx.fillStyle = 'rgba(0,0,0,0.12)';
    ctx.fillRect(sx + 12, sy + 12, Math.max(0, b.w - 24), Math.max(0, b.h - 24));
  }

  for (const prop of city.props) {
    const sx = prop.x - vx;
    const sy = prop.y - vy;
    if (sx < -30 || sy < -30 || sx > CFG.W + 30 || sy > CFG.H + 30) continue;
    if (prop.type === 'lamp') {
      ctx.strokeStyle = '#5a6573';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(sx, sy + 10);
      ctx.lineTo(sx, sy - 12);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(sx, sy - 14, 6, 0, Math.PI * 2);
      ctx.fillStyle = '#ffe9a8';
      ctx.fill();
    } else {
      ctx.fillStyle = '#8b5e3c';
      ctx.fillRect(sx - 12, sy - 4, 24, 5);
      ctx.fillRect(sx - 12, sy + 2, 24, 4);
    }
  }

  for (const palm of city.palms) {
    const sx = palm.x - vx;
    const sy = palm.y - vy;
    if (sx < -60 || sy < -60 || sx > CFG.W + 60 || sy > CFG.H + 60) continue;
    ctx.beginPath();
    ctx.ellipse(sx + 6, sy + 6, 16 * palm.s, 6 * palm.s, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0,0,0,0.18)';
    ctx.fill();
    const topX = sx + palm.lean * 30 * palm.s;
    const topY = sy - 34 * palm.s;
    ctx.strokeStyle = '#7a5230';
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.quadraticCurveTo(sx + palm.lean * 14 * palm.s, sy - 18 * palm.s, topX, topY);
    ctx.stroke();
    ctx.strokeStyle = '#2f9e44';
    ctx.lineWidth = 4;
    for (let i = 0; i < 7; i++) {
      const a = (i / 7) * Math.PI * 2 + palm.lean;
      ctx.beginPath();
      ctx.moveTo(topX, topY);
      ctx.lineTo(topX + Math.cos(a) * 22 * palm.s, topY + Math.sin(a) * 14 * palm.s - 6);
      ctx.stroke();
    }
  }

  const mark = game.missions.marker();
  if (mark) {
    const mx = mark.x - vx;
    const my = mark.y - vy;
    if (mx >= -40 && mx <= CFG.W + 40 && my >= -40 && my <= CFG.H + 40) {
      const r = 34 * (1 + Math.sin(game.time * 4) * 0.15);
      ctx.beginPath();
      ctx.arc(mx, my, r, 0, Math.PI * 2);
      ctx.strokeStyle = '#ffd166';
      ctx.lineWidth = 4;
      ctx.stroke();
      ctx.font = 'bold 20px Arial, sans-serif';
      ctx.fillStyle = '#ffd166';
      ctx.textAlign = 'center';
      ctx.fillText('!', mx, my + 7);
    } else {
      const cx = Math.max(30, Math.min(CFG.W - 30, mx));
      const cy = Math.max(70, Math.min(CFG.H - 70, my));
      const ang = Math.atan2(mark.y - game.player.y, mark.x - game.player.x);
      const dist = Math.round(Math.hypot(mark.x - game.player.x, mark.y - game.player.y) / 10);
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(ang);
      ctx.beginPath();
      ctx.moveTo(16, 0);
      ctx.lineTo(-8, -10);
      ctx.lineTo(-8, 10);
      ctx.closePath();
      ctx.fillStyle = '#ffd166';
      ctx.fill();
      ctx.restore();
      ctx.font = 'bold 13px Arial, sans-serif';
      ctx.fillStyle = '#ffd166';
      ctx.textAlign = 'center';
      ctx.fillText(dist + 'm', cx, cy + 28);
    }
  }

  for (const pk of game.missions.packages) {
    if (pk.taken) continue;
    const sx = pk.x - vx;
    const sy = pk.y - vy;
    if (sx < -30 || sy < -30 || sx > CFG.W + 30 || sy > CFG.H + 30) continue;
    ctx.fillStyle = '#8b5e3c';
    ctx.fillRect(sx - 11, sy - 11, 22, 22);
    ctx.fillStyle = '#ffd166';
    ctx.fillRect(sx - 11, sy - 3, 22, 6);
    ctx.strokeStyle = 'rgba(0,0,0,0.4)';
    ctx.strokeRect(sx - 11, sy - 11, 22, 22);
  }

  ctx.font = 'bold 13px Arial, sans-serif';
  ctx.fillStyle = '#4ecdc4';
  ctx.textAlign = 'left';
  ctx.fillText('SAFEHOUSE', 520 - vx - 42, 520 - vy - 44);

  for (const ped of game.peds) {
    const sx = ped.x - vx;
    const sy = ped.y - vy;
    if (sx < -40 || sy < -40 || sx > CFG.W + 40 || sy > CFG.H + 40) continue;
    drawPed(ctx, ped, vx, vy);
  }

  for (const car of game.allCars()) {
    const sx = car.x - vx;
    const sy = car.y - vy;
    if (sx < -80 || sy < -80 || sx > CFG.W + 80 || sy > CFG.H + 80) continue;
    drawCar(ctx, car, vx, vy, game.time);
  }

  if (!game.player.inCar) {
    drawPlayer(ctx, game, vx, vy);
  }

  ctx.strokeStyle = '#fff3a0';
  ctx.lineWidth = 2;
  ctx.beginPath();
  for (const b of game.bullets) {
    ctx.moveTo(b.x - vx, b.y - vy);
    ctx.lineTo(b.tx - vx, b.ty - vy);
  }
  ctx.stroke();

  for (const pt of game.particles) {
    ctx.globalAlpha = Math.max(0, pt.life / pt.maxLife);
    ctx.beginPath();
    ctx.arc(pt.x - vx, pt.y - vy, pt.r, 0, Math.PI * 2);
    ctx.fillStyle = pt.color;
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  ctx.font = 'bold 15px Arial, sans-serif';
  ctx.textAlign = 'center';
  for (const f of game.floats) {
    ctx.globalAlpha = Math.max(0, f.life / 1.4);
    ctx.fillStyle = f.color;
    ctx.fillText(f.text, f.x - vx, f.y - vy);
  }
  ctx.globalAlpha = 1;

  const vignette = ctx.createRadialGradient(CFG.W / 2, CFG.H / 2, CFG.H * 0.35, CFG.W / 2, CFG.H / 2, CFG.H * 0.85);
  vignette.addColorStop(0, 'rgba(20,40,70,0)');
  vignette.addColorStop(1, 'rgba(20,40,70,0.28)');
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, CFG.W, CFG.H);
}

export function drawTitle(ctx, game) {
  const grad = ctx.createLinearGradient(0, 0, 0, CFG.H);
  grad.addColorStop(0, '#ffb347');
  grad.addColorStop(0.35, '#ff7b6b');
  grad.addColorStop(0.65, '#2e9fd8');
  grad.addColorStop(1, '#14507a');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, CFG.W, CFG.H);

  ctx.beginPath();
  ctx.arc(CFG.W / 2, 300, 160, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255,243,160,0.25)';
  ctx.fill();
  ctx.beginPath();
  ctx.arc(CFG.W / 2, 300, 110, 0, Math.PI * 2);
  ctx.fillStyle = '#fff3a0';
  ctx.fill();

  const heights = [120, 180, 90, 210, 140, 170, 100, 190, 130, 160, 110, 200];
  ctx.fillStyle = 'rgba(20,40,70,0.85)';
  const bw = CFG.W / heights.length;
  heights.forEach((h, i) => {
    ctx.fillRect(i * bw + 6, 430 - h, bw - 12, h);
  });

  ctx.strokeStyle = 'rgba(20,40,70,0.9)';
  ctx.lineWidth = 6;
  ctx.lineCap = 'round';
  for (const px of [120, 1150, 300, 980]) {
    ctx.beginPath();
    ctx.moveTo(px, 430);
    ctx.quadraticCurveTo(px + 10, 380, px + 26, 350);
    ctx.stroke();
    ctx.lineWidth = 4;
    for (let i = 0; i < 6; i++) {
      const a = -0.4 - i * 0.45;
      ctx.beginPath();
      ctx.moveTo(px + 26, 350);
      ctx.lineTo(px + 26 + Math.cos(a) * 44, 350 + Math.sin(a) * 30);
      ctx.stroke();
    }
    ctx.lineWidth = 6;
  }

  ctx.fillStyle = '#7ec850';
  ctx.fillRect(0, 430, CFG.W, 60);
  ctx.fillStyle = '#f2d492';
  ctx.fillRect(0, 490, CFG.W, 40);
  ctx.fillStyle = '#2e9fd8';
  ctx.fillRect(0, 530, CFG.W, CFG.H - 530);
  ctx.strokeStyle = 'rgba(255,255,255,0.8)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  for (let sx = 0; sx <= CFG.W; sx += 16) {
    const sy = 530 + Math.sin(sx * 0.03 + game.time * 1.5) * 4;
    if (sx === 0) ctx.moveTo(sx, sy);
    else ctx.lineTo(sx, sy);
  }
  ctx.stroke();

  ctx.textAlign = 'center';
  ctx.font = '900 92px Arial, sans-serif';
  ctx.fillStyle = 'rgba(20,40,70,0.6)';
  ctx.fillText('SOLAR BAY', CFG.W / 2 + 4, 154);
  ctx.fillStyle = '#ffffff';
  ctx.fillText('SOLAR BAY', CFG.W / 2, 150);
  ctx.font = '900 44px Arial, sans-serif';
  ctx.fillStyle = '#ffe66d';
  ctx.fillText('O U T L A W', CFG.W / 2, 202);
  ctx.font = '18px Arial, sans-serif';
  ctx.fillStyle = '#eaf6ff';
  ctx.fillText('An open-world crime caper in a sun-soaked coastal city', CFG.W / 2, 236);

  const items = ['New Game', 'Continue', 'How to Play'];
  items.forEach((label, i) => {
    const y = 580 + i * 44;
    const selected = game.menuIndex === i;
    roundRect(ctx, CFG.W / 2 - 170, y - 26, 340, 38, 10);
    ctx.fillStyle = selected ? '#ffe66d' : 'rgba(8,20,32,0.75)';
    ctx.fill();
    ctx.font = 'bold 17px Arial, sans-serif';
    ctx.fillStyle = selected ? '#14243a' : '#ffffff';
    ctx.fillText(label, CFG.W / 2, y);
  });

  ctx.font = '13px Arial, sans-serif';
  ctx.fillStyle = '#eaf6ff';
  ctx.fillText('W/S or arrows to choose · Enter to confirm · Keyboard required', CFG.W / 2, CFG.H - 12);
}

export function drawHowTo(ctx) {
  ctx.fillStyle = 'rgba(8,20,32,0.94)';
  ctx.fillRect(0, 0, CFG.W, CFG.H);
  ctx.textAlign = 'center';
  ctx.font = 'bold 34px Arial, sans-serif';
  ctx.fillStyle = '#ffe66d';
  ctx.fillText('HOW TO PLAY', CFG.W / 2, 80);

  const lines = [
    'Work jobs for Mara Voss, the fixer at the Harbor Row safehouse, and build your name in Solar Bay.',
    '',
    'MOVE        WASD / Arrow keys      RUN  Hold Shift',
    'CAR         E near a car to enter / exit  ·  WASD to drive  ·  Space handbrake  ·  H horn',
    'COMBAT      F punch  ·  Q shoot pistol (find ammo pickups)  ·  R reload-free, watch ammo',
    "MISSIONS    Follow the yellow marker. Press M to start Mara's next job.",
    'WANTED      Crimes raise stars. Police chase and ram. Stay unseen to cool down.',
    'BUSTED      Stopped and surrounded = busted. WASTED = health gone. Both cost cash.',
    'PAUSE       P or Esc  ·  SAVE  Automatic + at safehouse  ·  MAP  Minimap, bottom right',
    '',
    'Steal cars, run deliveries, ram rivals, and make the beach getaway. Good luck, outlaw.',
  ];
  ctx.textAlign = 'left';
  ctx.font = '17px Arial, sans-serif';
  ctx.fillStyle = '#ffffff';
  lines.forEach((line, i) => {
    ctx.fillText(line, 190, 140 + i * 32);
  });

  ctx.textAlign = 'center';
  ctx.font = 'bold 16px Arial, sans-serif';
  ctx.fillStyle = '#ffe66d';
  ctx.fillText('Press Esc or Enter to go back', CFG.W / 2, CFG.H - 40);
}

export function drawPause(ctx, game) {
  ctx.fillStyle = 'rgba(8,20,32,0.82)';
  ctx.fillRect(0, 0, CFG.W, CFG.H);
  ctx.textAlign = 'center';
  ctx.font = 'bold 44px Arial, sans-serif';
  ctx.fillStyle = '#ffe66d';
  ctx.fillText('PAUSED', CFG.W / 2, 200);
  ctx.font = '19px Arial, sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.fillText('Cash $' + game.player.cash.toLocaleString('en-US') + '  ·  Missions done: ' + game.missions.completed + ' / ' + game.missions.list.length, CFG.W / 2, 250);

  const items = ['Resume', 'Save Game', 'Quit to Title'];
  items.forEach((label, i) => {
    const y = 320 + i * 52;
    const selected = game.menuIndex === i;
    roundRect(ctx, CFG.W / 2 - 180, y - 28, 360, 42, 10);
    ctx.fillStyle = selected ? '#ffe66d' : 'rgba(255,255,255,0.12)';
    ctx.fill();
    ctx.font = 'bold 18px Arial, sans-serif';
    ctx.fillStyle = selected ? '#14243a' : '#ffffff';
    ctx.fillText(label, CFG.W / 2, y);
  });
}

export function drawEndScreen(ctx, game, kind) {
  ctx.fillStyle = kind === 'wasted' ? 'rgba(60,10,10,0.88)' : 'rgba(10,20,60,0.88)';
  ctx.fillRect(0, 0, CFG.W, CFG.H);
  ctx.textAlign = 'center';
  ctx.font = '900 84px Arial, sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.fillText(kind === 'wasted' ? 'WASTED' : 'BUSTED', CFG.W / 2, 280);
  ctx.font = '20px Arial, sans-serif';
  ctx.fillStyle = '#ffd166';
  ctx.fillText(kind === 'wasted' ? 'You wake up at the clinic. The bill stings.' : 'Solar Bay PD hauls you in. Bail is not cheap.', CFG.W / 2, 330);
  ctx.font = '18px Arial, sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.fillText('Cash penalty: -$' + game.lastPenalty + '   ·   New balance: $' + game.player.cash.toLocaleString('en-US'), CFG.W / 2, 380);
  ctx.fillText('Missions completed: ' + game.missions.completed, CFG.W / 2, 412);
  ctx.font = 'bold 19px Arial, sans-serif';
  ctx.fillStyle = '#ffe66d';
  ctx.fillText('Press Enter to respawn at the safehouse', CFG.W / 2, 490);
}
