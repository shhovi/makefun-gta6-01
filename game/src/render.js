import { CFG } from './config.js';
import { roundRect } from './hud.js';

export function drawWorld(ctx, game) {
  const cam = game.camera;
  const vx = cam.x, vy = cam.y;
  // sky / ground base
  ctx.fillStyle = CFG.COLORS.grass;
  ctx.fillRect(0, 0, CFG.W, CFG.H);
  // water + beach (world space)
  const waterY = CFG.WORLD_H - 260 - vy, beachY = CFG.WORLD_H - 420 - vy;
  if (beachY < CFG.H) {
    ctx.fillStyle = CFG.COLORS.sand;
    ctx.fillRect(0, Math.max(0, beachY), CFG.W, CFG.H);
    const grad = ctx.createLinearGradient(0, Math.max(0, waterY), 0, CFG.H);
    grad.addColorStop(0, CFG.COLORS.water2); grad.addColorStop(1, CFG.COLORS.water);
    ctx.fillStyle = grad;
    ctx.fillRect(0, Math.max(0, waterY), CFG.W, CFG.H);
    ctx.strokeStyle = 'rgba(255,255,255,0.7)'; ctx.lineWidth = 3;
    ctx.beginPath();
    for (let x = 0; x <= CFG.W; x += 24) {
      const yy = waterY + Math.sin((x + vx) * 0.02 + game.time * 1.5) * 4;
      if (x === 0) ctx.moveTo(x, yy); else ctx.lineTo(x, yy);
    }
    ctx.stroke();
  }
  // roads
  const step = CFG.BLOCK + CFG.ROAD;
  ctx.fillStyle = CFG.COLORS.road;
  for (let x = 0; x <= CFG.WORLD_W; x += step) {
    const sx = x - vx;
    if (sx + CFG.ROAD < 0 || sx > CFG.W) continue;
    ctx.fillRect(sx, 0, CFG.ROAD, CFG.H);
  }
  for (let y = 0; y <= CFG.WORLD_H; y += step) {
    const sy = y - vy;
    if (sy + CFG.ROAD < 0 || sy > CFG.H) continue;
    ctx.fillRect(0, sy, CFG.W, CFG.ROAD);
  }
  // sidewalks (light strips along roads)
  ctx.fillStyle = CFG.COLORS.sidewalk;
  for (let x = 0; x <= CFG.WORLD_W; x += step) {
    const sx = x - vx;
    ctx.fillRect(sx - 8, 0, 8, CFG.H); ctx.fillRect(sx + CFG.ROAD, 0, 8, CFG.H);
  }
  for (let y = 0; y <= CFG.WORLD_H; y += step) {
    const sy = y - vy;
    ctx.fillRect(0, sy - 8, CFG.W, 8); ctx.fillRect(0, sy + CFG.ROAD, CFG.W, 8);
  }
  // center lines
  ctx.strokeStyle = CFG.COLORS.roadLine; ctx.lineWidth = 3; ctx.setLineDash([22, 18]);
  for (let x = 0; x <= CFG.WORLD_W; x += step) {
    const sx = x + CFG.ROAD / 2 - vx;
    ctx.beginPath(); ctx.moveTo(sx, 0); ctx.lineTo(sx, CFG.H); ctx.stroke();
  }
  for (let y = 0; y <= CFG.WORLD_H; y += step) {
    const sy = y + CFG.ROAD / 2 - vy;
    ctx.beginPath(); ctx.moveTo(0, sy); ctx.lineTo(CFG.W, sy); ctx.stroke();
  }
  ctx.setLineDash([]);
  // skid marks
  ctx.strokeStyle = 'rgba(20,20,20,0.55)'; ctx.lineWidth = 4;
  for (const s of game.skids) {
    ctx.beginPath(); ctx.moveTo(s.x1 - vx, s.y1 - vy); ctx.lineTo(s.x2 - vx, s.y2 - vy); ctx.stroke();
  }
  // buildings
  for (const b of game.city.buildings) {
    const sx = b.x - vx, sy = b.y - vy;
    if (sx + b.w < -20 || sy + b.h < -20 || sx > CFG.W + 20 || sy > CFG.H + 20) continue;
    ctx.fillStyle = 'rgba(0,0,0,0.22)';
    ctx.fillRect(sx + 8, sy + 10, b.w, b.h);
    ctx.fillStyle = b.color;
    ctx.fillRect(sx, sy, b.w, b.h);
    ctx.strokeStyle = 'rgba(0,0,0,0.35)'; ctx.lineWidth = 2;
    ctx.strokeRect(sx, sy, b.w, b.h);
    // rooftop details
    ctx.fillStyle = 'rgba(255,255,255,0.25)';
    ctx.fillRect(sx + 8, sy + 8, b.w - 16, 10);
    const cols = Math.max(2, Math.floor(b.w / 34)), rows = Math.max(2, Math.floor(b.h / 34));
    ctx.fillStyle = 'rgba(30,60,90,0.55)';
    for (let i = 0; i < cols; i++) for (let j = 0; j < rows; j++) {
      if (((i * 7 + j * 13 + Math.floor(b.seed * 100)) % 5) === 0) continue;
      ctx.fillRect(sx + 12 + i * ((b.w - 24) / cols), sy + 24 + j * ((b.h - 36) / rows), 12, 10);
    }
    ctx.fillStyle = 'rgba(0,0,0,0.18)';
    ctx.fillRect(sx + b.w * 0.3, sy + b.h * 0.35, b.w * 0.4, b.h * 0.3);
  }
  // props
  for (const pr of game.city.props) {
    const sx = pr.x - vx, sy = pr.y - vy;
    if (sx < -30 || sy < -30 || sx > CFG.W + 30 || sy > CFG.H + 30) continue;
    if (pr.type === 'lamp') {
      ctx.fillStyle = '#5a6b7a'; ctx.fillRect(sx - 2, sy - 12, 4, 14);
      ctx.fillStyle = '#ffe9a8'; ctx.beginPath(); ctx.arc(sx, sy - 14, 5, 0, Math.PI * 2); ctx.fill();
    } else {
      ctx.fillStyle = '#8a5a33'; ctx.fillRect(sx - 14, sy - 4, 28, 8);
      ctx.fillStyle = '#6d4423'; ctx.fillRect(sx - 14, sy - 10, 28, 5);
    }
  }
  // palms
  for (const pm of game.city.palms) {
    const sx = pm.x - vx, sy = pm.y - vy;
    if (sx < -40 || sy < -40 || sx > CFG.W + 40 || sy > CFG.H + 40) continue;
    ctx.strokeStyle = '#7a5230'; ctx.lineWidth = 5;
    ctx.beginPath(); ctx.moveTo(sx, sy); ctx.quadraticCurveTo(sx + pm.lean * 18, sy - 12 * pm.s, sx + pm.lean * 26, sy - 24 * pm.s); ctx.stroke();
    const tx = sx + pm.lean * 26, ty = sy - 24 * pm.s;
    ctx.strokeStyle = '#2f9e44'; ctx.lineWidth = 4;
    for (let i = 0; i < 7; i++) {
      const a = (i / 7) * Math.PI * 2 + pm.lean;
      ctx.beginPath(); ctx.moveTo(tx, ty);
      ctx.quadraticCurveTo(tx + Math.cos(a) * 16 * pm.s, ty + Math.sin(a) * 10 * pm.s - 6, tx + Math.cos(a) * 26 * pm.s, ty + Math.sin(a) * 16 * pm.s + 4);
      ctx.stroke();
    }
    ctx.fillStyle = 'rgba(0,0,0,0.18)';
    ctx.beginPath(); ctx.ellipse(sx + 8, sy + 4, 18 * pm.s, 7, 0, 0, Math.PI * 2); ctx.fill();
  }
  // mission packages + marker
  const mk = game.missions.marker();
  if (mk) {
    const sx = mk.x - vx, sy = mk.y - vy;
    const pulse = 1 + Math.sin(game.time * 4) * 0.15;
    ctx.fillStyle = 'rgba(255,230,109,0.35)';
    ctx.beginPath(); ctx.arc(sx, sy, 34 * pulse, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#ffe66d'; ctx.lineWidth = 3; ctx.stroke();
    ctx.fillStyle = '#ffe66d'; ctx.font = 'bold 20px system-ui, sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('!', sx, sy + 7); ctx.textAlign = 'left';
    // offscreen arrow
    if (sx < 0 || sy < 0 || sx > CFG.W || sy > CFG.H) {
      const cx = Math.max(40, Math.min(CFG.W - 40, sx)), cy = Math.max(90, Math.min(CFG.H - 90, sy));
      const a = Math.atan2(sy - cy, sx - cx);
      ctx.save(); ctx.translate(cx, cy); ctx.rotate(a);
      ctx.fillStyle = '#ffe66d'; ctx.beginPath(); ctx.moveTo(16, 0); ctx.lineTo(-8, -9); ctx.lineTo(-8, 9); ctx.closePath(); ctx.fill();
      ctx.restore();
      ctx.fillStyle = '#fff'; ctx.font = 'bold 12px system-ui, sans-serif'; ctx.textAlign = 'center';
      ctx.fillText(Math.round(Math.hypot(mk.x - game.player.x, mk.y - game.player.y)) + 'm', cx, cy - 18);
      ctx.textAlign = 'left';
    }
  }
  for (const pk of game.missions.packages) {
    if (pk.taken) continue;
    const sx = pk.x - vx, sy = pk.y - vy;
    ctx.fillStyle = '#8a5a33'; ctx.fillRect(sx - 11, sy - 11, 22, 22);
    ctx.strokeStyle = '#5c3a1e'; ctx.lineWidth = 2; ctx.strokeRect(sx - 11, sy - 11, 22, 22);
    ctx.fillStyle = '#ffe66d'; ctx.fillRect(sx - 11, sy - 2, 22, 4);
  }
  // safehouse marker
  ctx.fillStyle = '#4ecdc4';
  ctx.font = 'bold 13px system-ui, sans-serif';
  ctx.fillText('SAFEHOUSE', 520 - vx - 42, 520 - vy - 44);

  // peds
  for (const ped of game.peds) drawPed(ctx, ped, vx, vy);
  // cars
  for (const c of game.allCars()) drawCar(ctx, c, vx, vy, game.time);
  // player
  if (!game.player.inCar) drawPlayer(ctx, game.player, vx, vy);
  // bullets
  ctx.strokeStyle = '#fff3a0'; ctx.lineWidth = 2;
  for (const b of game.bullets) { ctx.beginPath(); ctx.moveTo(b.x - vx, b.y - vy); ctx.lineTo(b.tx - vx, b.ty - vy); ctx.stroke(); }
  // particles
  for (const pt of game.particles) {
    ctx.fillStyle = pt.color;
    ctx.globalAlpha = Math.max(0, pt.life / pt.maxLife);
    ctx.beginPath(); ctx.arc(pt.x - vx, pt.y - vy, pt.r, 0, Math.PI * 2); ctx.fill();
  }
  ctx.globalAlpha = 1;
  // floating texts
  ctx.font = 'bold 15px system-ui, sans-serif'; ctx.textAlign = 'center';
  for (const f of game.floats) {
    ctx.globalAlpha = Math.max(0, f.life / 1.4);
    ctx.fillStyle = f.color;
    ctx.fillText(f.text, f.x - vx, f.y - vy);
  }
  ctx.globalAlpha = 1; ctx.textAlign = 'left';
  // sun glare vignette
  const vg = ctx.createRadialGradient(CFG.W / 2, CFG.H / 2, CFG.H * 0.45, CFG.W / 2, CFG.H / 2, CFG.H * 0.95);
  vg.addColorStop(0, 'rgba(255,220,120,0)');
  vg.addColorStop(1, 'rgba(20,40,70,0.28)');
  ctx.fillStyle = vg; ctx.fillRect(0, 0, CFG.W, CFG.H);
}

function drawPed(ctx, ped, vx, vy) {
  const sx = ped.x - vx, sy = ped.y - vy;
  if (sx < -30 || sy < -30 || sx > CFG.W + 30 || sy > CFG.H + 30) return;
  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  ctx.beginPath(); ctx.ellipse(sx + 3, sy + 5, 10, 5, 0, 0, Math.PI * 2); ctx.fill();
  if (ped.down) {
    ctx.fillStyle = ped.shirt; ctx.fillRect(sx - 14, sy - 5, 28, 10);
    ctx.fillStyle = ped.skin; ctx.beginPath(); ctx.arc(sx + 16, sy, 6, 0, Math.PI * 2); ctx.fill();
    return;
  }
  const swing = Math.sin(ped.walkPhase) * 5;
  ctx.strokeStyle = '#33415c'; ctx.lineWidth = 4;
  ctx.beginPath(); ctx.moveTo(sx, sy + 2); ctx.lineTo(sx + swing, sy + 11); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(sx, sy + 2); ctx.lineTo(sx - swing, sy + 11); ctx.stroke();
  ctx.fillStyle = ped.shirt;
  ctx.beginPath(); ctx.arc(sx, sy, 9, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = ped.skin;
  ctx.beginPath(); ctx.arc(sx, sy - 2, 5.5, 0, Math.PI * 2); ctx.fill();
}

function drawPlayer(ctx, p, vx, vy) {
  const sx = p.x - vx, sy = p.y - vy;
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.beginPath(); ctx.ellipse(sx + 3, sy + 6, 11, 5, 0, 0, Math.PI * 2); ctx.fill();
  const swing = p.moving ? Math.sin(p.walkPhase) * 6 : 0;
  ctx.strokeStyle = '#1b263b'; ctx.lineWidth = 5;
  ctx.beginPath(); ctx.moveTo(sx, sy + 2); ctx.lineTo(sx + swing, sy + 12); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(sx, sy + 2); ctx.lineTo(sx - swing, sy + 12); ctx.stroke();
  ctx.fillStyle = '#ff7b00';
  ctx.beginPath(); ctx.arc(sx, sy, 10, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.stroke();
  ctx.fillStyle = '#f1c27d';
  ctx.beginPath(); ctx.arc(sx, sy - 2, 6, 0, Math.PI * 2); ctx.fill();
  // facing indicator + weapon
  const hx = sx + Math.cos(p.angle) * 14, hy = sy + Math.sin(p.angle) * 14;
  if (p.hasPistol) {
    ctx.strokeStyle = '#222'; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(hx, hy); ctx.stroke();
    if (p.muzzle > 0) {
      ctx.fillStyle = '#ffd166';
      ctx.beginPath(); ctx.arc(hx + Math.cos(p.angle) * 8, hy + Math.sin(p.angle) * 8, 7 * p.muzzle, 0, Math.PI * 2); ctx.fill();
    }
  } else if (p.punchTimer > 0.15) {
    ctx.fillStyle = '#f1c27d';
    ctx.beginPath(); ctx.arc(hx, hy, 5, 0, Math.PI * 2); ctx.fill();
  }
  ctx.fillStyle = '#fff'; ctx.font = 'bold 11px system-ui, sans-serif'; ctx.textAlign = 'center';
  ctx.fillText('YOU', sx, sy - 20); ctx.textAlign = 'left';
}

function drawCar(ctx, c, vx, vy, time) {
  const sx = c.x - vx, sy = c.y - vy;
  if (sx < -80 || sy < -80 || sx > CFG.W + 80 || sy > CFG.H + 80) return;
  ctx.save(); ctx.translate(sx, sy); ctx.rotate(c.angle);
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.fillRect(-c.w / 2 + 3, -c.h / 2 + 4, c.w, c.h);
  ctx.fillStyle = c.wrecked ? '#3a3a3a' : c.color;
  roundRect(ctx, -c.w / 2, -c.h / 2, c.w, c.h, 6); ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,0.45)'; ctx.lineWidth = 2; ctx.stroke();
  if (c.isPolice) {
    ctx.fillStyle = '#1b263b'; ctx.fillRect(-6, -c.h / 2, 14, c.h);
    ctx.fillStyle = '#fff'; ctx.font = 'bold 9px system-ui, sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('POLICE', 0, 3);
    const on = Math.sin(c.lightPhase || time * 10) > 0;
    ctx.fillStyle = on ? '#ff3b30' : '#7a1f1a';
    ctx.beginPath(); ctx.arc(-2, -6, 5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = on ? '#2f6bff' : '#1a3a7a';
    ctx.beginPath(); ctx.arc(-2, 6, 5, 0, Math.PI * 2); ctx.fill();
    ctx.textAlign = 'left';
  } else {
    ctx.fillStyle = 'rgba(20,40,60,0.85)';
    ctx.fillRect(-8, -c.h / 2 + 3, 16, c.h - 6);
    ctx.fillStyle = 'rgba(160,220,255,0.8)';
    ctx.fillRect(8, -c.h / 2 + 4, 6, c.h - 8);
    ctx.fillRect(-16, -c.h / 2 + 4, 5, c.h - 8);
  }
  ctx.fillStyle = '#ffe9a8';
  ctx.fillRect(c.w / 2 - 4, -c.h / 2 + 2, 4, 5);
  ctx.fillRect(c.w / 2 - 4, c.h / 2 - 7, 4, 5);
  ctx.fillStyle = '#ff5252';
  ctx.fillRect(-c.w / 2, -c.h / 2 + 2, 4, 5);
  ctx.fillRect(-c.w / 2, c.h / 2 - 7, 4, 5);
  ctx.restore();
  if (c.health < 100 && !c.wrecked) {
    ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.fillRect(sx - 22, sy - 26, 44, 6);
    ctx.fillStyle = c.health > 45 ? '#3ddc84' : '#ff5252';
    ctx.fillRect(sx - 22, sy - 26, 44 * c.health / 100, 6);
  }
  if (c.wrecked) {
    ctx.fillStyle = '#fff'; ctx.font = 'bold 11px system-ui, sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('WRECKED', sx, sy - 24); ctx.textAlign = 'left';
  }
}

export function drawTitle(ctx, game) {
  const grad = ctx.createLinearGradient(0, 0, 0, CFG.H);
  grad.addColorStop(0, '#ffb347'); grad.addColorStop(0.45, '#ff7b6b'); grad.addColorStop(0.75, '#2e9fd8'); grad.addColorStop(1, '#14507a');
  ctx.fillStyle = grad; ctx.fillRect(0, 0, CFG.W, CFG.H);
  // sun
  ctx.fillStyle = '#fff3a0';
  ctx.beginPath(); ctx.arc(CFG.W / 2, 300, 110, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = 'rgba(255,243,160,0.35)';
  ctx.beginPath(); ctx.arc(CFG.W / 2, 300, 160, 0, Math.PI * 2); ctx.fill();
  // skyline silhouette
  ctx.fillStyle = 'rgba(20,40,70,0.85)';
  const heights = [120, 180, 90, 210, 140, 170, 100, 190, 130, 160, 110, 200];
  let bx = 0;
  for (let i = 0; i < heights.length; i++) {
    const w = CFG.W / heights.length;
    ctx.fillRect(bx, 430 - heights[i], w - 6, heights[i]);
    bx += w;
  }
  // palms silhouette
  ctx.strokeStyle = 'rgba(15,35,55,0.9)'; ctx.lineWidth = 7;
  for (const px of [120, 1150, 300, 980]) {
    ctx.beginPath(); ctx.moveTo(px, 500); ctx.quadraticCurveTo(px + 14, 430, px + 30, 390); ctx.stroke();
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      ctx.beginPath(); ctx.moveTo(px + 30, 390);
      ctx.quadraticCurveTo(px + 30 + Math.cos(a) * 30, 390 + Math.sin(a) * 16 - 8, px + 30 + Math.cos(a) * 48, 390 + Math.sin(a) * 26 + 8);
      ctx.stroke();
    }
  }
  ctx.fillStyle = 'rgba(20,40,70,0.85)'; ctx.fillRect(0, 430, CFG.W, 90);
  ctx.fillStyle = '#f2d492'; ctx.fillRect(0, 500, CFG.W, 30);
  ctx.fillStyle = '#2e9fd8'; ctx.fillRect(0, 530, CFG.W, CFG.H - 530);
  ctx.strokeStyle = 'rgba(255,255,255,0.6)'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(0, 532);
  for (let x = 0; x <= CFG.W; x += 30) ctx.lineTo(x, 532 + Math.sin(x * 0.03 + game.time * 2) * 4);
  ctx.stroke();
  // title text
  ctx.textAlign = 'center';
  ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.font = '900 92px system-ui, sans-serif';
  ctx.fillText('SOLAR BAY', CFG.W / 2 + 4, 154);
  ctx.fillStyle = '#ffffff';
  ctx.fillText('SOLAR BAY', CFG.W / 2, 150);
  ctx.fillStyle = '#ffe66d'; ctx.font = '900 44px system-ui, sans-serif';
  ctx.fillText('O U T L A W', CFG.W / 2, 202);
  ctx.fillStyle = '#eaf6ff'; ctx.font = '18px system-ui, sans-serif';
  ctx.fillText('An open-world crime caper in a sun-soaked coastal city', CFG.W / 2, 236);
  // menu
  const items = ['New Game', 'Continue', 'How to Play'];
  items.forEach((label, i) => {
    const y = 580 + i * 44;
    const sel = game.menuIndex === i;
    ctx.fillStyle = sel ? '#ffe66d' : 'rgba(8,20,32,0.75)';
    roundRect(ctx, CFG.W / 2 - 170, y - 26, 340, 38, 10); ctx.fill();
    ctx.fillStyle = sel ? '#0b1c2c' : '#ffffff';
    ctx.font = 'bold 19px system-ui, sans-serif';
    ctx.fillText(label, CFG.W / 2, y);
  });
  ctx.fillStyle = 'rgba(255,255,255,0.85)'; ctx.font = '13px system-ui, sans-serif';
  ctx.fillText('W/S or arrows to choose · Enter to confirm · Keyboard required', CFG.W / 2, CFG.H - 14);
  ctx.textAlign = 'left';
}

export function drawHowTo(ctx) {
  ctx.fillStyle = 'rgba(8,20,32,0.94)'; ctx.fillRect(0, 0, CFG.W, CFG.H);
  ctx.fillStyle = '#ffe66d'; ctx.font = 'bold 34px system-ui, sans-serif'; ctx.textAlign = 'center';
  ctx.fillText('HOW TO PLAY', CFG.W / 2, 80);
  ctx.fillStyle = '#fff'; ctx.font = '17px system-ui, sans-serif'; ctx.textAlign = 'left';
  const lines = [
    'You are a new arrival in Solar Bay. Mara Voss has work for drivers who ask no questions.',
    '',
    'MOVE        WASD / Arrow keys      RUN  Hold Shift',
    'CAR         E near a car to enter / exit  ·  WASD to drive  ·  Space handbrake  ·  H horn',
    'COMBAT      F punch  ·  Q shoot pistol (find ammo pickups)  ·  R reload-free, watch ammo',
    'MISSIONS    Follow the yellow marker. Press M to start Mara\'s next job.',
    'WANTED      Crimes raise stars. Police chase and ram. Stay unseen to cool down.',
    'BUSTED      Stopped and surrounded = busted. WASTED = health gone. Both cost cash.',
    'PAUSE       P or Esc  ·  SAVE  Automatic + at safehouse  ·  MAP  Minimap, bottom right',
    '',
    'Steal cars, run deliveries, ram rivals, and make the beach getaway. Good luck, outlaw.',
  ];
  lines.forEach((l, i) => ctx.fillText(l, 190, 140 + i * 32));
  ctx.fillStyle = '#ffe66d'; ctx.font = 'bold 16px system-ui, sans-serif'; ctx.textAlign = 'center';
  ctx.fillText('Press Esc or Enter to go back', CFG.W / 2, CFG.H - 40);
  ctx.textAlign = 'left';
}

export function drawPause(ctx, game) {
  ctx.fillStyle = 'rgba(8,20,32,0.82)'; ctx.fillRect(0, 0, CFG.W, CFG.H);
  ctx.fillStyle = '#ffe66d'; ctx.font = 'bold 44px system-ui, sans-serif'; ctx.textAlign = 'center';
  ctx.fillText('PAUSED', CFG.W / 2, 200);
  ctx.fillStyle = '#fff'; ctx.font = '19px system-ui, sans-serif';
  ctx.fillText('Cash $' + game.player.cash + '  ·  Missions done: ' + game.missions.completed + ' / ' + game.missions.list.length, CFG.W / 2, 250);
  const items = ['Resume', 'Save Game', 'Quit to Title'];
  items.forEach((label, i) => {
    const y = 320 + i * 52;
    const sel = game.menuIndex === i;
    ctx.fillStyle = sel ? '#ffe66d' : 'rgba(255,255,255,0.12)';
    roundRect(ctx, CFG.W / 2 - 180, y - 28, 360, 42, 10); ctx.fill();
    ctx.fillStyle = sel ? '#0b1c2c' : '#fff'; ctx.font = 'bold 20px system-ui, sans-serif';
    ctx.fillText(label, CFG.W / 2, y);
  });
  ctx.textAlign = 'left';
}

export function drawEndScreen(ctx, game, kind) {
  ctx.fillStyle = kind === 'wasted' ? 'rgba(60,10,10,0.88)' : 'rgba(10,20,60,0.88)';
  ctx.fillRect(0, 0, CFG.W, CFG.H);
  ctx.textAlign = 'center';
  ctx.fillStyle = '#ffffff'; ctx.font = '900 84px system-ui, sans-serif';
  ctx.fillText(kind === 'wasted' ? 'WASTED' : 'BUSTED', CFG.W / 2, 280);
  ctx.fillStyle = '#ffd166'; ctx.font = '20px system-ui, sans-serif';
  ctx.fillText(kind === 'wasted' ? 'You wake up at the clinic. The bill stings.' : 'Solar Bay PD hauls you in. Bail is not cheap.', CFG.W / 2, 330);
  ctx.fillStyle = '#fff'; ctx.font = '18px system-ui, sans-serif';
  ctx.fillText('Cash penalty: -$' + game.lastPenalty + '   ·   New balance: $' + game.player.cash, CFG.W / 2, 380);
  ctx.fillText('Missions completed: ' + game.missions.completed, CFG.W / 2, 412);
  ctx.fillStyle = '#ffe66d'; ctx.font = 'bold 19px system-ui, sans-serif';
  ctx.fillText('Press Enter to respawn at the safehouse', CFG.W / 2, 490);
  ctx.textAlign = 'left';
}
