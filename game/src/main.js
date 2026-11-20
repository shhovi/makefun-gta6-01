import { CFG } from './config.js';
import { makeRng } from './random.js';
import { City } from './city.js';
import { Input } from './input.js';
import { AudioSys } from './audio.js';
import { Player } from './player.js';
import { spawnParkedCars } from './vehicles.js';
import { spawnTraffic } from './traffic.js';
import { spawnPeds } from './pedestrians.js';
import { PoliceCar, WantedSystem } from './police.js';
import { MissionSystem } from './missions.js';
import { tryPunch, tryShoot } from './combat.js';
import { drawHUD } from './hud.js';
import { drawWorld, drawTitle, drawHowTo, drawPause, drawEndScreen } from './render.js';
import { saveGame, loadGame, hasSave } from './save.js';
import { getShotParams, setupShot, autopilotStep } from './shots.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

class Game {
  constructor(seed) {
    this.rng = makeRng(seed);
    this.city = new City(this.rng);
    this.input = new Input();
    this.audio = new AudioSys();
    this.player = new Player(620, 700);
    this.parked = spawnParkedCars(this.city, this.rng);
    this.traffic = spawnTraffic(this.city, this.rng);
    this.peds = spawnPeds(this.city, this.rng);
    this.police = [];
    this.wanted = new WantedSystem();
    this.missions = new MissionSystem(this.rng);
    this.camera = { x: 0, y: 0 };
    this.state = 'title'; // title | howto | play | pause | wasted | busted
    this.menuIndex = 0;
    this.time = 0; this.shake = 0;
    this.particles = []; this.floats = []; this.skids = []; this.bullets = [];
    this.brief = null; this.briefTimer = 0;
    this.lastPenalty = 0; this.policeTimer = 0;
    this.updateCamera(1);
  }
  allCars() { return [...this.parked, ...this.traffic, ...this.police]; }
  addFloat(x, y, text, color) { this.floats.push({ x, y, text, color, life: 1.4 }); }
  spawnSparks(x, y) {
    for (let i = 0; i < 10; i++) {
      const a = this.rng() * Math.PI * 2, s = 60 + this.rng() * 160;
      this.particles.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, r: 2.5, color: '#ffd166', life: 0.4, maxLife: 0.4 });
    }
  }
  spawnSmoke(x, y) {
    this.particles.push({ x: x + (this.rng() - 0.5) * 12, y: y + (this.rng() - 0.5) * 12, vx: (this.rng() - 0.5) * 20, vy: -30 - this.rng() * 30, r: 6 + this.rng() * 6, color: 'rgba(60,60,60,0.8)', life: 0.9, maxLife: 0.9 });
  }
  showBrief(m) { this.brief = { title: m.title, text: m.brief }; this.briefTimer = 7; }
  showDone(m) { this.brief = { title: m.title + ' — Done', text: m.doneText }; this.briefTimer = 6; }
  failMission(why) { this.missions.fail(this, why); }
  spawnTargetCar(at) {
    const { Vehicle } = { Vehicle: null };
    // use traffic-style car via dynamic import fallback: reuse a traffic car recolored
    const car = this.traffic.find((c) => !c.wrecked) || this.parked[0];
    if (car) {
      car.x = at.x; car.y = at.y; car.color = '#2a9d8f'; car.health = 100; car.wrecked = false;
      this.missions.targetCar = car;
    }
  }
  spawnPolice(n) {
    for (let i = 0; i < n; i++) {
      const a = this.rng() * Math.PI * 2;
      const d = 520 + this.rng() * 160;
      let x = this.player.x + Math.cos(a) * d, y = this.player.y + Math.sin(a) * d;
      x = Math.max(60, Math.min(CFG.WORLD_W - 60, x));
      y = Math.max(60, Math.min(CFG.WORLD_H - 500, y));
      const p = this.city.nearestRoadPoint(x, y);
      if (p) { x = p.x; y = p.y; }
      this.police.push(new PoliceCar(x, y));
    }
  }
  updateCamera(snap) {
    const tx = this.player.x - CFG.W / 2, ty = this.player.y - CFG.H / 2;
    const cx = Math.max(0, Math.min(CFG.WORLD_W - CFG.W, tx));
    const cy = Math.max(0, Math.min(CFG.WORLD_H - CFG.H, ty));
    if (snap) { this.camera.x = cx; this.camera.y = cy; }
    else { this.camera.x += (cx - this.camera.x) * 0.12; this.camera.y += (cy - this.camera.y) * 0.12; }
  }
  saveData() {
    return { cash: this.player.cash, health: this.player.health, hasPistol: this.player.hasPistol, ammo: this.player.ammo, missionIndex: this.missions.index, completed: this.missions.completed, x: this.player.x, y: this.player.y };
  }
  applySave(d) {
    if (!d) return;
    this.player.cash = d.cash ?? 250; this.player.health = d.health ?? 100;
    this.player.hasPistol = !!d.hasPistol; this.player.ammo = d.ammo ?? 0;
    this.missions.index = d.missionIndex ?? 0; this.missions.completed = d.completed ?? 0;
    if (d.x) { this.player.x = d.x; this.player.y = d.y; }
    this.updateCamera(1);
  }
  respawn() {
    const penalty = Math.min(300, Math.floor(this.player.cash * 0.15) + 50);
    this.lastPenalty = penalty;
    this.player.cash = Math.max(0, this.player.cash - penalty);
    this.player.health = 100; this.player.dead = false; this.player.busted = false;
    this.player.inCar = null;
    this.player.x = 520; this.player.y = 620;
    this.wanted.clear(); this.police = [];
    this.state = 'play';
    this.updateCamera(1);
    saveGame(this.saveData());
  }
  tryEnterExit() {
    const p = this.player;
    if (p.inCar) {
      const car = p.inCar;
      p.inCar = null;
      p.x = car.x + Math.cos(car.angle + Math.PI / 2) * 34;
      p.y = car.y + Math.sin(car.angle + Math.PI / 2) * 34;
      this.audio.door();
      return;
    }
    let best = null, bd = 70;
    for (const c of this.allCars()) {
      if (c.wrecked) continue;
      const d = Math.hypot(c.x - p.x, c.y - p.y);
      if (d < bd) { bd = d; best = c; }
    }
    if (best) {
      if (best.hasDriver) {
        this.wanted.addCrime(1);
        this.addFloat(best.x, best.y - 30, 'CARJACKED!', '#ffd166');
        best.hasDriver = false;
        // driver flees as a ped
        const { Pedestrian } = {};
        for (const q of this.peds) if (Math.hypot(q.x - p.x, q.y - p.y) < 200) q.scare(p.x, p.y);
      } else if (best.parked) {
        this.wanted.addCrime(0.5);
        this.addFloat(best.x, best.y - 30, 'STOLEN', '#ffd166');
      }
      p.inCar = best; this.audio.door();
      if (!p.hasPistol && this.rng() < 0.6) { p.hasPistol = true; p.ammo = 30; this.addFloat(p.x, p.y - 40, 'PISTOL +30', '#7CFC98'); }
    }
  }
  checkCarCollisions() {
    const cars = this.allCars();
    for (let i = 0; i < cars.length; i++) {
      for (let j = i + 1; j < cars.length; j++) {
        const a = cars[i], b = cars[j];
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        if (d < 44 && d > 0.1) {
          const push = (44 - d) / 2;
          const ux = (b.x - a.x) / d, uy = (b.y - a.y) / d;
          a.x -= ux * push; a.y -= uy * push; b.x += ux * push; b.y += uy * push;
          const rel = Math.abs(a.speed) + Math.abs(b.speed);
          if (rel > 220) {
            a.health -= 8; b.health -= 8;
            this.spawnSparks((a.x + b.x) / 2, (a.y + b.y) / 2);
            if (this.player.inCar === a || this.player.inCar === b) { this.shake = Math.max(this.shake, 6); this.audio.crash(); this.wanted.addCrime(0.4); }
          }
          a.speed *= 0.6; b.speed *= 0.6;
        }
      }
    }
    // car vs ped
    for (const c of cars) {
      if (Math.abs(c.speed) < 60) continue;
      for (const ped of this.peds) {
        if (ped.down) continue;
        if (Math.hypot(ped.x - c.x, ped.y - c.y) < 30) {
          ped.down = true;
          this.spawnSparks(ped.x, ped.y);
          if (this.player.inCar === c) { this.wanted.addCrime(1.2); this.shake = Math.max(this.shake, 5); this.audio.crash(); this.addFloat(ped.x, ped.y - 24, 'HIT!', '#ff6b6b'); }
        } else if (Math.hypot(ped.x - c.x, ped.y - c.y) < 90) ped.scare(c.x, c.y);
      }
    }
    // car vs player on foot (police ram damage / traffic bump)
    if (!this.player.inCar) {
      for (const c of cars) {
        if (Math.hypot(c.x - this.player.x, c.y - this.player.y) < 30 && Math.abs(c.speed) > 120) {
          this.player.damage(12); this.shake = Math.max(this.shake, 6);
          this.player.x += Math.cos(c.angle) * 40; this.player.y += Math.sin(c.angle) * 40;
        }
      }
    }
  }
  step(dt) {
    this.time += dt;
    const inp = this.input;
    if (this.state === 'title') {
      if (inp.hit('w') || inp.hit('arrowup')) this.menuIndex = (this.menuIndex + 2) % 3;
      if (inp.hit('s') || inp.hit('arrowdown')) this.menuIndex = (this.menuIndex + 1) % 3;
      if (inp.hit('enter')) {
        this.audio.ensure();
        if (this.menuIndex === 0) { this.state = 'play'; this.missions.startNext(this); }
        else if (this.menuIndex === 1) { this.applySave(loadGame()); this.state = 'play'; if (!this.missions.active) this.missions.startNext(this); }
        else this.state = 'howto';
      }
      inp.endFrame(); return;
    }
    if (this.state === 'howto') {
      if (inp.hit('escape') || inp.hit('enter')) this.state = 'title';
      inp.endFrame(); return;
    }
    if (this.state === 'wasted' || this.state === 'busted') {
      if (inp.hit('enter')) this.respawn();
      inp.endFrame(); return;
    }
    if (this.state === 'pause') {
      if (inp.hit('w') || inp.hit('arrowup')) this.menuIndex = (this.menuIndex + 2) % 3;
      if (inp.hit('s') || inp.hit('arrowdown')) this.menuIndex = (this.menuIndex + 1) % 3;
      if (inp.hit('escape') || inp.hit('p')) this.state = 'play';
      if (inp.hit('enter')) {
        if (this.menuIndex === 0) this.state = 'play';
        else if (this.menuIndex === 1) { saveGame(this.saveData()); this.state = 'play'; }
        else { this.state = 'title'; this.menuIndex = 0; }
      }
      inp.endFrame(); return;
    }
    // play
    this.audio.ensure();
    if (inp.hit('escape') || inp.hit('p')) { this.state = 'pause'; this.menuIndex = 0; inp.endFrame(); return; }
    if (inp.hit('e')) this.tryEnterExit();
    if (inp.hit('f')) tryPunch(this);
    if (inp.hit('q')) tryShoot(this);
    if (inp.hit('h') && this.player.inCar) this.audio.horn();
    if (inp.hit('m') && !this.missions.active) this.missions.startNext(this);

    const prevCarX = this.player.inCar ? this.player.inCar.x : 0;
    const prevCarY = this.player.inCar ? this.player.inCar.y : 0;
    this.player.update(dt, this.city, inp);
    if (this.player.inCar) {
      const c = this.player.inCar;
      if (c.crashed) { c.crashed = false; this.shake = Math.max(this.shake, 7); this.audio.crash(); this.spawnSparks(c.x, c.y); }
      if (Math.abs(c.speed) > 200 && inp.down(' ')) {
        this.skids.push({ x1: prevCarX, y1: prevCarY, x2: c.x, y2: c.y });
        if (this.skids.length > 220) this.skids.shift();
      }
      if (c.smoke > 0.2 && this.rng() < 0.5) this.spawnSmoke(c.x, c.y);
    }
    for (const c of this.traffic) c.updateAI(dt, this.city, this.allCars(), this.player);
    for (const pd of this.peds) pd.update(dt, this.city);
    // police management
    const wantCount = this.wanted.stars === 0 ? 0 : Math.min(6, this.wanted.stars + 1);
    this.policeTimer -= dt;
    if (this.police.length < wantCount && this.policeTimer <= 0) { this.spawnPolice(1); this.policeTimer = 2.5; }
    if (this.wanted.stars === 0) this.police = this.police.filter(() => false);
    let seen = false;
    for (const pc of this.police) {
      pc.updateAI(dt, this.city, this.player);
      if (Math.hypot(pc.x - this.player.x, pc.y - this.player.y) < 420) seen = true;
      if (pc.smoke > 0.2 && this.rng() < 0.4) this.spawnSmoke(pc.x, pc.y);
    }
    this.police = this.police.filter((c) => !c.wrecked || Math.hypot(c.x - this.player.x, c.y - this.player.y) < 900);
    this.wanted.update(dt, seen);
    // busted check: stopped + police close
    const pSpeed = this.player.inCar ? Math.abs(this.player.inCar.speed) : (this.player.moving ? 100 : 0);
    const nearPolice = this.police.filter((c) => Math.hypot(c.x - this.player.x, c.y - this.player.y) < 85).length;
    if (this.wanted.stars > 0 && pSpeed < 25 && nearPolice >= 1) {
      this.wanted.bustedTimer += dt;
      if (this.wanted.bustedTimer > 2.2) { this.player.busted = true; this.state = 'busted'; this.lastPenalty = Math.min(300, Math.floor(this.player.cash * 0.15) + 50); }
    } else this.wanted.bustedTimer = Math.max(0, this.wanted.bustedTimer - dt);
    if (this.player.dead) { this.state = 'wasted'; this.lastPenalty = Math.min(300, Math.floor(this.player.cash * 0.15) + 50); }

    this.checkCarCollisions();
    this.missions.update(dt, this);
    this.briefTimer = Math.max(0, this.briefTimer - dt);
    // particles / floats / bullets
    for (const pt of this.particles) { pt.x += pt.vx * dt; pt.y += pt.vy * dt; pt.life -= dt; }
    this.particles = this.particles.filter((p) => p.life > 0);
    for (const f of this.floats) { f.y -= 26 * dt; f.life -= dt; }
    this.floats = this.floats.filter((f) => f.life > 0);
    for (const b of this.bullets) b.life -= dt;
    this.bullets = this.bullets.filter((b) => b.life > 0);
    // audio
    this.audio.setEngine(!!this.player.inCar, this.player.inCar ? this.player.inCar.speed / CFG.CAR_MAX : 0);
    this.audio.setSiren(this.wanted.stars > 0 && this.police.length > 0, this.time);
    this.shake = Math.max(0, this.shake - dt * 14);
    this.updateCamera(0);
    inp.endFrame();
  }
  render() {
    ctx.save();
    if (this.shake > 0) ctx.translate((this.rng() - 0.5) * this.shake * 2, (this.rng() - 0.5) * this.shake * 2);
    if (this.state === 'title') drawTitle(ctx, this);
    else if (this.state === 'howto') drawHowTo(ctx);
    else {
      drawWorld(ctx, this);
      drawHUD(ctx, this);
      if (this.state === 'pause') drawPause(ctx, this);
      if (this.state === 'wasted') drawEndScreen(ctx, this, 'wasted');
      if (this.state === 'busted') drawEndScreen(ctx, this, 'busted');
      if (this.wanted.bustedTimer > 0.3 && this.state === 'play') {
        ctx.fillStyle = 'rgba(255,60,60,0.85)'; ctx.font = 'bold 22px system-ui, sans-serif'; ctx.textAlign = 'center';
        ctx.fillText('BUSTED IN ' + Math.max(0, (2.2 - this.wanted.bustedTimer)).toFixed(1) + 's — MOVE!', CFG.W / 2, 110);
        ctx.textAlign = 'left';
      }
    }
    ctx.restore();
  }
}

// Boot: shot mode or live mode
const shotInfo = getShotParams();
const seed = shotInfo ? shotInfo.seed : 7;
const game = new Game(seed);
window.__game = game;

if (shotInfo) {
  setupShot(game, shotInfo.shot);
  const STEP = 1 / 60;
  for (let i = 0; i < 90; i++) { autopilotStep(game); game.step(STEP); }
  // re-assert brief visibility for shots that need it
  if (shotInfo.shot === 'city' || shotInfo.shot === 'chase' || shotInfo.shot === 'mission') game.briefTimer = 999;
  if (shotInfo.shot === 'chase') { game.wanted.heat = 3; game.wanted.stars = 3; }
  game.render();
  window.__shotReady = true;
} else {
  let last = performance.now();
  const loop = (now) => {
    let dt = (now - last) / 1000; last = now;
    dt = Math.min(dt, 0.05);
    game.step(dt);
    game.render();
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
}
