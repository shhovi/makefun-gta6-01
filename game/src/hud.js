import { CFG } from './config.js';

export function drawHUD(ctx, game) {
  const p = game.player;
  // top-left: health + cash
  ctx.fillStyle = 'rgba(8,20,32,0.72)';
  roundRect(ctx, 14, 14, 300, 86, 10); ctx.fill();
  ctx.fillStyle = '#fff'; ctx.font = 'bold 15px system-ui, sans-serif';
  ctx.fillText('SOLAR BAY: OUTLAW', 26, 38);
  ctx.fillStyle = '#0f2a3d'; ctx.fillRect(26, 48, 200, 14);
  ctx.fillStyle = p.health > 30 ? '#3ddc84' : '#ff5252';
  ctx.fillRect(26, 48, 200 * Math.max(0, p.health) / 100, 14);
  ctx.strokeStyle = 'rgba(255,255,255,0.5)'; ctx.strokeRect(26, 48, 200, 14);
  ctx.fillStyle = '#ffd166'; ctx.font = 'bold 17px system-ui, sans-serif';
  ctx.fillText('$' + p.cash.toLocaleString('en-US'), 232, 62);
  ctx.fillStyle = '#cfe8ff'; ctx.font = '12px system-ui, sans-serif';
  const wpn = p.inCar ? 'DRIVING' : (p.hasPistol ? `PISTOL  ${p.ammo}` : 'FISTS');
  ctx.fillText(wpn, 26, 82);
  if (p.inCar) ctx.fillText(p.inCar.speedKmh() + ' km/h', 140, 82);
  ctx.fillText(game.city.districtAt(p.x, p.y), 210, 82);

  // wanted stars top-right
  const stars = game.wanted.stars;
  ctx.font = '30px system-ui, sans-serif'; ctx.textAlign = 'right';
  for (let i = 0; i < 5; i++) {
    ctx.fillStyle = i < stars ? '#ffd166' : 'rgba(255,255,255,0.25)';
    ctx.fillText('★', CFG.W - 24 - (4 - i) * 34, 46);
  }
  ctx.textAlign = 'left';
  if (stars > 0) {
    ctx.fillStyle = 'rgba(255,82,82,0.9)'; ctx.font = 'bold 13px system-ui, sans-serif'; ctx.textAlign = 'right';
    ctx.fillText('WANTED', CFG.W - 24, 68); ctx.textAlign = 'left';
  }

  // objective bar
  const obj = game.missions.objectiveText();
  ctx.fillStyle = 'rgba(8,20,32,0.78)';
  roundRect(ctx, CFG.W / 2 - 330, 14, 660, 40, 10); ctx.fill();
  ctx.fillStyle = '#ffe66d'; ctx.font = 'bold 13px system-ui, sans-serif'; ctx.textAlign = 'center';
  ctx.fillText('OBJECTIVE', CFG.W / 2, 30);
  ctx.fillStyle = '#ffffff'; ctx.font = '15px system-ui, sans-serif';
  ctx.fillText(obj, CFG.W / 2, 49);
  ctx.textAlign = 'left';

  // controls hint bottom-center
  ctx.fillStyle = 'rgba(8,20,32,0.6)';
  roundRect(ctx, CFG.W / 2 - 360, CFG.H - 36, 720, 26, 8); ctx.fill();
  ctx.fillStyle = '#d7ecff'; ctx.font = '12px system-ui, sans-serif'; ctx.textAlign = 'center';
  ctx.fillText('WASD move/drive · Shift run · E enter car · F punch · Q shoot · Space handbrake · H horn · M mission · P pause', CFG.W / 2, CFG.H - 19);
  ctx.textAlign = 'left';

  // mission banner
  if (game.missions.banner > 0) {
    ctx.fillStyle = 'rgba(8,20,32,0.85)';
    roundRect(ctx, CFG.W / 2 - 300, 130, 600, 64, 12); ctx.fill();
    ctx.strokeStyle = '#ffd166'; ctx.lineWidth = 2; ctx.stroke();
    ctx.fillStyle = '#ffd166'; ctx.font = 'bold 26px system-ui, sans-serif'; ctx.textAlign = 'center';
    ctx.fillText(game.missions.bannerText, CFG.W / 2, 170); ctx.textAlign = 'left';
  }

  // brief box
  if (game.briefTimer > 0 && game.brief) {
    ctx.fillStyle = 'rgba(8,20,32,0.88)';
    roundRect(ctx, 14, CFG.H - 210, 470, 160, 12); ctx.fill();
    ctx.strokeStyle = '#4ecdc4'; ctx.lineWidth = 2; ctx.stroke();
    ctx.fillStyle = '#4ecdc4'; ctx.font = 'bold 17px system-ui, sans-serif';
    ctx.fillText(game.brief.title + '  —  Mara Voss', 28, CFG.H - 178);
    ctx.fillStyle = '#ffffff'; ctx.font = '14px system-ui, sans-serif';
    wrapText(ctx, game.brief.text, 28, CFG.H - 152, 440, 19);
  }

  drawMinimap(ctx, game);
}

function drawMinimap(ctx, game) {
  const size = 190, x0 = CFG.W - size - 16, y0 = CFG.H - size - 52;
  const sx = size / CFG.WORLD_W, sy = size / CFG.WORLD_H;
  ctx.fillStyle = 'rgba(8,20,32,0.85)';
  roundRect(ctx, x0 - 6, y0 - 6, size + 12, size + 30, 10); ctx.fill();
  ctx.fillStyle = '#79b5d8'; ctx.fillRect(x0, y0, size, size);
  // land
  ctx.fillStyle = '#8fd07a'; ctx.fillRect(x0, y0, size, size * (1 - 420 / CFG.WORLD_H));
  ctx.fillStyle = '#f2d492'; ctx.fillRect(x0, y0 + size * (1 - 420 / CFG.WORLD_H), size, size * (160 / CFG.WORLD_H));
  // roads
  ctx.strokeStyle = 'rgba(40,45,55,0.85)'; ctx.lineWidth = 2;
  const step = CFG.BLOCK + CFG.ROAD;
  for (let x = 0; x <= CFG.WORLD_W; x += step) { ctx.beginPath(); ctx.moveTo(x0 + x * sx, y0); ctx.lineTo(x0 + x * sx, y0 + size * 0.89); ctx.stroke(); }
  for (let y = 0; y <= CFG.WORLD_H; y += step) { ctx.beginPath(); ctx.moveTo(x0, y0 + y * sy); ctx.lineTo(x0 + size, y0 + y * sy); ctx.stroke(); }
  // mission marker
  const mk = game.missions.marker();
  if (mk) {
    ctx.fillStyle = '#ffe66d';
    const mx = x0 + mk.x * sx, my = y0 + mk.y * sy;
    ctx.beginPath(); ctx.arc(mx, my, 6, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#b58900'; ctx.lineWidth = 2; ctx.stroke();
  }
  // police blips
  for (const c of game.police) {
    ctx.fillStyle = '#ff3b30';
    ctx.beginPath(); ctx.arc(x0 + c.x * sx, y0 + c.y * sy, 3.5, 0, Math.PI * 2); ctx.fill();
  }
  // traffic blips faint
  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  for (const c of game.traffic) { ctx.fillRect(x0 + c.x * sx - 1.5, y0 + c.y * sy - 1.5, 3, 3); }
  // player arrow
  const p = game.player;
  const px = x0 + p.x * sx, py = y0 + p.y * sy;
  ctx.save(); ctx.translate(px, py); ctx.rotate(p.angle);
  ctx.fillStyle = '#ffffff'; ctx.strokeStyle = '#0b1c2c'; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(9, 0); ctx.lineTo(-6, -5); ctx.lineTo(-3, 0); ctx.lineTo(-6, 5); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.restore();
  ctx.fillStyle = '#d7ecff'; ctx.font = 'bold 11px system-ui, sans-serif';
  ctx.fillText('MINIMAP — Solar Bay', x0, y0 + size + 18);
}

export function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

export function wrapText(ctx, text, x, y, maxW, lh) {
  const words = text.split(' '); let line = '', yy = y;
  for (const w of words) {
    const test = line ? line + ' ' + w : w;
    if (ctx.measureText(test).width > maxW && line) { ctx.fillText(line, x, yy); line = w; yy += lh; }
    else line = test;
  }
  if (line) ctx.fillText(line, x, yy);
}
