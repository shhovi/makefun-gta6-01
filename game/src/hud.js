import { CFG } from './config.js';

// On-screen overlays: status, objectives, and minimap.
export function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y, x + w, y + r, r);
  ctx.lineTo(x + w, y + h - r);
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h);
  ctx.arcTo(x, y + h, x, y + h - r, r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
}

export function wrapText(ctx, text, x, y, maxW, lh) {
  const words = String(text).split(' ');
  let line = '';
  let cy = y;
  for (const word of words) {
    const test = line ? line + ' ' + word : word;
    if (ctx.measureText(test).width > maxW && line) {
      ctx.fillText(line, x, cy);
      line = word;
      cy += lh;
    } else {
      line = test;
    }
  }
  if (line) {
    ctx.fillText(line, x, cy);
  }
}

function drawMinimap(ctx, game) {
  const size = 190;
  const mx = CFG.W - size - 16;
  const my = CFG.H - size - 52;
  const sx = size / CFG.WORLD_W;
  const sy = size / CFG.WORLD_H;

  roundRect(ctx, mx - 6, my - 6, size + 12, size + 30, 10);
  ctx.fillStyle = 'rgba(8,20,32,0.82)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.18)';
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.fillStyle = '#79b5d8';
  ctx.fillRect(mx, my, size, size);

  const landFrac = 1 - 420 / CFG.WORLD_H;
  ctx.fillStyle = '#8fd07a';
  ctx.fillRect(mx, my, size, size * landFrac);

  ctx.fillStyle = '#f2d492';
  ctx.fillRect(mx, my + size * landFrac, size, size * (160 / CFG.WORLD_H));

  ctx.strokeStyle = 'rgba(40,45,55,0.85)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  const step = CFG.BLOCK + CFG.ROAD;
  for (let x = 0; x <= CFG.WORLD_W; x += step) {
    ctx.moveTo(mx + x * sx, my);
    ctx.lineTo(mx + x * sx, my + size * landFrac);
  }
  for (let y = 0; y <= CFG.WORLD_H; y += step) {
    ctx.moveTo(mx, my + y * sy);
    ctx.lineTo(mx + size, my + y * sy);
  }
  ctx.stroke();

  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  for (const car of game.traffic) {
    ctx.fillRect(mx + car.x * sx - 1.5, my + car.y * sy - 1.5, 3, 3);
  }

  ctx.fillStyle = '#ff5252';
  for (const car of game.police) {
    ctx.beginPath();
    ctx.arc(mx + car.x * sx, my + car.y * sy, 3.5, 0, Math.PI * 2);
    ctx.fill();
  }

  const mark = game.missions.marker();
  if (mark) {
    ctx.beginPath();
    ctx.arc(mx + mark.x * sx, my + mark.y * sy, 6, 0, Math.PI * 2);
    ctx.fillStyle = '#ffd166';
    ctx.fill();
    ctx.strokeStyle = '#b58900';
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  const px = mx + game.player.x * sx;
  const py = my + game.player.y * sy;
  ctx.save();
  ctx.translate(px, py);
  ctx.rotate(game.player.angle);
  ctx.beginPath();
  ctx.moveTo(8, 0);
  ctx.lineTo(-5, -5);
  ctx.lineTo(-5, 5);
  ctx.closePath();
  ctx.fillStyle = '#ffffff';
  ctx.fill();
  ctx.strokeStyle = '#14243a';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.restore();

  ctx.font = 'bold 11px Arial, sans-serif';
  ctx.fillStyle = '#d7ecff';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText('MINIMAP — Solar Bay', mx, my + size + 18);
}

export function drawHUD(ctx, game) {
  const p = game.player;

  roundRect(ctx, 14, 14, 300, 86, 10);
  ctx.fillStyle = 'rgba(8,20,32,0.72)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.15)';
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.font = 'bold 15px Arial, sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'left';
  ctx.fillText('SOLAR BAY: OUTLAW', 26, 38);

  ctx.fillStyle = '#0f2a3d';
  ctx.fillRect(26, 48, 200, 14);
  ctx.fillStyle = p.health > 30 ? '#3ddc84' : '#ff5252';
  ctx.fillRect(26, 48, 200 * Math.max(0, p.health) / 100, 14);
  ctx.strokeStyle = 'rgba(255,255,255,0.6)';
  ctx.strokeRect(26, 48, 200, 14);

  ctx.font = 'bold 17px Arial, sans-serif';
  ctx.fillStyle = '#ffd166';
  ctx.fillText('$' + p.cash.toLocaleString('en-US'), 232, 62);

  ctx.font = '12px Arial, sans-serif';
  ctx.fillStyle = '#cfe8ff';
  const weaponLabel = p.inCar ? 'DRIVING' : p.hasPistol ? `PISTOL  ${p.ammo}` : 'FISTS';
  ctx.fillText(weaponLabel, 26, 82);
  if (p.inCar) {
    ctx.fillText(p.inCar.speedKmh() + ' km/h', 140, 82);
  }
  ctx.fillText(game.city.districtAt(p.x, p.y), 210, 82);

  ctx.font = '30px Arial, sans-serif';
  ctx.textAlign = 'right';
  for (let i = 0; i < 5; i++) {
    ctx.fillStyle = i < game.wanted.stars ? '#ffd166' : 'rgba(255,255,255,0.25)';
    ctx.fillText('★', CFG.W - 24 - (4 - i) * 34, 44);
  }
  if (game.wanted.stars > 0) {
    ctx.font = 'bold 13px Arial, sans-serif';
    ctx.fillStyle = 'rgba(255,82,82,0.9)';
    ctx.fillText('WANTED', CFG.W - 24, 68);
  }

  roundRect(ctx, CFG.W / 2 - 330, 14, 660, 40, 10);
  ctx.fillStyle = 'rgba(8,20,32,0.78)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.15)';
  ctx.stroke();
  ctx.textAlign = 'center';
  ctx.font = 'bold 13px Arial, sans-serif';
  ctx.fillStyle = '#ffe66d';
  ctx.fillText('OBJECTIVE', CFG.W / 2, 30);
  ctx.font = '15px Arial, sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.fillText(game.missions.objectiveText(), CFG.W / 2, 49);

  roundRect(ctx, CFG.W / 2 - 360, CFG.H - 36, 720, 26, 8);
  ctx.fillStyle = 'rgba(8,20,32,0.6)';
  ctx.fill();
  ctx.font = '12px Arial, sans-serif';
  ctx.fillStyle = '#d7ecff';
  ctx.fillText('WASD move/drive · Shift run · E enter car · F punch · Q shoot · Space handbrake · H horn · M mission · P pause', CFG.W / 2, CFG.H - 19);

  if (game.missions.banner > 0) {
    roundRect(ctx, CFG.W / 2 - 300, 130, 600, 64, 12);
    ctx.fillStyle = 'rgba(8,20,32,0.85)';
    ctx.fill();
    ctx.strokeStyle = '#ffd166';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.font = 'bold 26px Arial, sans-serif';
    ctx.fillStyle = '#ffd166';
    ctx.fillText(game.missions.bannerText, CFG.W / 2, 170);
  }

  if (game.briefTimer > 0 && game.brief) {
    roundRect(ctx, 14, CFG.H - 210, 470, 160, 12);
    ctx.fillStyle = 'rgba(8,20,32,0.88)';
    ctx.fill();
    ctx.strokeStyle = '#4ecdc4';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.textAlign = 'left';
    ctx.font = 'bold 17px Arial, sans-serif';
    ctx.fillStyle = '#4ecdc4';
    ctx.fillText(game.brief.title + '  —  Mara Voss', 28, CFG.H - 178);
    ctx.font = '14px Arial, sans-serif';
    ctx.fillStyle = '#ffffff';
    wrapText(ctx, game.brief.text, 28, CFG.H - 152, 440, 19);
  }

  ctx.textAlign = 'left';
  drawMinimap(ctx, game);
}
