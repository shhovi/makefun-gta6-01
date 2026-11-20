import { CFG } from './config.js';
// Game bootstrap and main loop.
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
    this.state = 'title';
    this.menuIndex = 0;
    this.time = 0;
    this.shake = 0;
    this.particles = [];
    this.floats = [];
    this.skids = [];
    this.bullets = [];
    this.brief = null;
    this.briefTimer = 0;
    this.lastPenalty = 0;
    this.policeTimer = 0;
    this.shotCar = null;
    this.shotSpeed = 0;
    this.updateCamera(1);
  }

  allCars() {
    return [...this.parked, ...this.traffic, ...this.police];
  }

  addFloat(x, y, text, color) {
    this.floats.push({ x, y, text, color, life: 1.4 });
  }

  spawnSparks(x, y) {
    for (let i = 0; i < 10; i++) {
      const a = Math.random() * Math.PI * 2;
      const sp = 60 + Math.random() * 160;
      this.particles.push({
        x,
        y,
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp,
        r: 2.5,
        color: '#ffd166',
        life: 0.4,
        maxLife: 0.4,
      });
    }
  }

  spawnSmoke(x, y) {
    this.particles.push({
      x: x + (Math.random() - 0.5) * 12,
      y: y + (Math.random() - 0.5) * 12,
      vx: (Math.random() - 0.5) * 20,
      vy: -30 - Math.random() * 30,
      r: 6 + Math.random() * 6,
      color: 'rgba(60,60,60,0.8)',
      life: 0.9,
      maxLife: 0.9,
    });
  }

  showBrief(m) {
    this.brief = { title: m.title, text: m.brief };
    this.briefTimer = 7;
  }

  showDone(m) {
    this.brief = { title: m.title + ' — Done', text: m.doneText };
    this.briefTimer = 6;
  }

  failMission(why) {
    this.missions.fail(this, why);
  }

  spawnTargetCar(at) {
    let car = this.traffic.find((c) => !c.wrecked) || this.parked[0];
    if (!car) return;
    car.x = at.x;
    car.y = at.y;
    car.color = '#2a9d8f';
    car.health = 100;
    car.wrecked = false;
    car.speed = 0;
    this.missions.targetCar = car;
  }

  spawnPolice(n) {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2;
      const dist = 520 + Math.random() * 160;
      let x = Math.max(60, Math.min(CFG.WORLD_W - 60, this.player.x + Math.cos(a) * dist));
      let y = Math.max(60, Math.min(CFG.WORLD_H - 500, this.player.y + Math.sin(a) * dist));
      const rp = this.city.nearestRoadPoint(x, y);
      if (rp) {
        x = rp.x;
        y = rp.y;
      }
      this.police.push(new PoliceCar(x, y));
    }
  }

  updateCamera(snap) {
    const tx = Math.max(0, Math.min(CFG.WORLD_W - CFG.W, this.player.x - CFG.W / 2));
    const ty = Math.max(0, Math.min(CFG.WORLD_H - CFG.H, this.player.y - CFG.H / 2));
    if (snap) {
      this.camera.x = tx;
      this.camera.y = ty;
    } else {
      this.camera.x += (tx - this.camera.x) * 0.12;
      this.camera.y += (ty - this.camera.y) * 0.12;
    }
  }

  saveData() {
    return {
      cash: this.player.cash,
      health: this.player.health,
      hasPistol: this.player.hasPistol,
      ammo: this.player.ammo,
      missionIndex: this.missions.index,
      completed: this.missions.completed,
      x: this.player.x,
      y: this.player.y,
    };
  }

  applySave(d) {
    if (!d) return;
    this.player.cash = d.cash ?? 250;
    this.player.health = d.health ?? 100;
    this.player.hasPistol = !!d.hasPistol;
    this.player.ammo = d.ammo ?? 0;
    this.missions.index = d.missionIndex ?? 0;
    this.missions.completed = d.completed ?? 0;
    if (typeof d.x === 'number') this.player.x = d.x;
    if (typeof d.y === 'number') this.player.y = d.y;
    this.updateCamera(1);
  }

  respawn() {
    const penalty = Math.min(300, Math.floor(this.player.cash * 0.15) + 50);
    this.lastPenalty = penalty;
    this.player.cash = Math.max(0, this.player.cash - penalty);
    this.player.health = 100;
    this.player.dead = false;
    this.player.busted = false;
    this.player.inCar = null;
    this.player.x = 520;
    this.player.y = 620;
    this.wanted.clear();
    this.police = [];
    this.state = 'play';
    this.updateCamera(1);
    saveGame(this.saveData());
  }

  tryEnterExit() {
    const p = this.player;
    if (p.inCar) {
      const car = p.inCar;
      const side = car.angle + Math.PI / 2;
      p.x = car.x + Math.cos(side) * 34;
      p.y = car.y + Math.sin(side) * 34;
      p.inCar = null;
      this.audio.door();
      return;
    }
    let best = null;
    let bestDist = 70;
    for (const car of this.allCars()) {
      if (car.wrecked) continue;
      const dist = Math.hypot(car.x - p.x, car.y - p.y);
      if (dist < bestDist) {
        bestDist = dist;
        best = car;
      }
    }
    if (!best) return;
    if (best.hasDriver) {
      this.wanted.addCrime(1);
      this.addFloat(best.x, best.y - 24, 'CARJACKED!', '#ffd166');
      best.hasDriver = false;
      for (const ped of this.peds) {
        if (Math.hypot(ped.x - p.x, ped.y - p.y) < 200) {
          ped.scare(p.x, p.y);
        }
      }
    } else if (best.parked) {
      this.wanted.addCrime(0.5);
      this.addFloat(best.x, best.y - 24, 'STOLEN', '#ffd166');
    }
    p.inCar = best;
    this.audio.door();
    if (!p.hasPistol && Math.random() < 0.6) {
      p.hasPistol = true;
      p.ammo = 30;
      this.addFloat(best.x, best.y - 40, 'PISTOL +30', '#7CFC98');
    }
  }

  checkCarCollisions() {
    const cars = this.allCars();
    for (let i = 0; i < cars.length; i++) {
      for (let j = i + 1; j < cars.length; j++) {
        const a = cars[i];
        const b = cars[j];
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const dist = Math.hypot(dx, dy);
        if (dist === 0 || dist >= 44) continue;
        const overlap = (44 - dist) / 2;
        const nx = dx / dist;
        const ny = dy / dist;
        a.x -= nx * overlap;
        a.y -= ny * overlap;
        b.x += nx * overlap;
        b.y += ny * overlap;
        if (Math.abs(a.speed) + Math.abs(b.speed) > 220) {
          a.health -= 8;
          b.health -= 8;
          this.spawnSparks((a.x + b.x) / 2, (a.y + b.y) / 2);
          if (this.player.inCar === a || this.player.inCar === b) {
            this.shake = Math.max(this.shake, 6);
            this.audio.crash();
            this.wanted.addCrime(0.4);
          }
        }
        a.speed *= 0.6;
        b.speed *= 0.6;
      }
    }

    for (const car of cars) {
      if (Math.abs(car.speed) < 60) continue;
      for (const ped of this.peds) {
        if (ped.down) continue;
        const dist = Math.hypot(ped.x - car.x, ped.y - car.y);
        if (dist < 30) {
          ped.down = true;
          this.spawnSparks(ped.x, ped.y);
          if (this.player.inCar === car) {
            this.wanted.addCrime(1.2);
            this.shake = Math.max(this.shake, 5);
            this.audio.crash();
            this.addFloat(ped.x, ped.y - 20, 'HIT!', '#ff6b6b');
          }
        } else if (dist < 90) {
          ped.scare(car.x, car.y);
        }
      }
    }

    if (!this.player.inCar && !this.player.dead) {
      for (const car of cars) {
        if (Math.abs(car.speed) <= 120) continue;
        if (Math.hypot(this.player.x - car.x, this.player.y - car.y) < 30) {
          this.player.damage(12);
          this.shake = Math.max(this.shake, 6);
          this.player.x += Math.cos(car.angle) * 40;
          this.player.y += Math.sin(car.angle) * 40;
        }
      }
    }
  }

  step(dt) {
    this.time += dt;
    const input = this.input;

    if (this.state === 'title') {
      if (input.hit('w') || input.hit('arrowup')) {
        this.menuIndex = (this.menuIndex + 2) % 3;
      }
      if (input.hit('s') || input.hit('arrowdown')) {
        this.menuIndex = (this.menuIndex + 1) % 3;
      }
      if (input.hit('enter')) {
        this.audio.ensure();
        if (this.menuIndex === 0) {
          this.state = 'play';
          this.missions.startNext(this);
        } else if (this.menuIndex === 1) {
          this.applySave(loadGame());
          this.state = 'play';
          if (!this.missions.active) this.missions.startNext(this);
        } else {
          this.state = 'howto';
        }
      }
      input.endFrame();
      return;
    }

    if (this.state === 'howto') {
      if (input.hit('escape') || input.hit('enter')) {
        this.state = 'title';
      }
      input.endFrame();
      return;
    }

    if (this.state === 'wasted' || this.state === 'busted') {
      if (input.hit('enter')) {
        this.respawn();
      }
      input.endFrame();
      return;
    }

    if (this.state === 'pause') {
      if (input.hit('w') || input.hit('arrowup')) {
        this.menuIndex = (this.menuIndex + 2) % 3;
      }
      if (input.hit('s') || input.hit('arrowdown')) {
        this.menuIndex = (this.menuIndex + 1) % 3;
      }
      if (input.hit('escape') || input.hit('p')) {
        this.state = 'play';
      } else if (input.hit('enter')) {
        if (this.menuIndex === 0) {
          this.state = 'play';
        } else if (this.menuIndex === 1) {
          saveGame(this.saveData());
          this.state = 'play';
        } else {
          this.state = 'title';
          this.menuIndex = 0;
        }
      }
      input.endFrame();
      return;
    }

    this.audio.ensure();
    if (input.hit('escape') || input.hit('p')) {
      this.state = 'pause';
      this.menuIndex = 0;
      input.endFrame();
      return;
    }
    if (input.hit('e')) this.tryEnterExit();
    if (input.hit('f')) tryPunch(this);
    if (input.hit('q')) tryShoot(this);
    if (input.hit('h') && this.player.inCar) this.audio.horn();
    if (input.hit('m') && !this.missions.active) this.missions.startNext(this);

    const prevCarX = this.player.inCar ? this.player.inCar.x : 0;
    const prevCarY = this.player.inCar ? this.player.inCar.y : 0;

    this.player.update(dt, this.city, input);

    if (this.player.inCar) {
      const car = this.player.inCar;
      if (car.crashed) {
        car.crashed = false;
        this.shake = Math.max(this.shake, 7);
        this.audio.crash();
        this.spawnSparks(car.x, car.y);
      }
      if (Math.abs(car.speed) > 200 && input.down(' ')) {
        this.skids.push({ x1: prevCarX, y1: prevCarY, x2: car.x, y2: car.y });
        if (this.skids.length > 220) this.skids.shift();
      }
      if (car.smoke > 0.2 && Math.random() < 0.5) {
        this.spawnSmoke(car.x, car.y);
      }
    }

    const all = this.allCars();
    for (const car of this.traffic) {
      car.updateAI(dt, this.city, all, this.player);
    }
    for (const ped of this.peds) {
      ped.update(dt, this.city);
    }

    const wantCount = this.wanted.stars === 0 ? 0 : Math.min(6, this.wanted.stars + 1);
    this.policeTimer -= dt;
    if (this.wanted.stars === 0) {
      this.police = [];
    } else if (this.police.length < wantCount && this.policeTimer <= 0) {
      this.spawnPolice(1);
      this.policeTimer = 2.5;
    }

    let seen = false;
    for (const cop of this.police) {
      cop.updateAI(dt, this.city, this.player);
      if (Math.hypot(cop.x - this.player.x, cop.y - this.player.y) < 420) {
        seen = true;
      }
      if (cop.smoke > 0.2 && Math.random() < 0.5) {
        this.spawnSmoke(cop.x, cop.y);
      }
    }
    this.police = this.police.filter(
      (cop) => !(cop.wrecked && Math.hypot(cop.x - this.player.x, cop.y - this.player.y) > 900),
    );

    this.wanted.update(dt, seen);

    const pSpeed = this.player.inCar ? Math.abs(this.player.inCar.speed) : this.player.moving ? 100 : 0;
    let nearPolice = 0;
    for (const cop of this.police) {
      if (Math.hypot(cop.x - this.player.x, cop.y - this.player.y) < 85) nearPolice += 1;
    }
    if (this.wanted.stars > 0 && pSpeed < 25 && nearPolice >= 1) {
      this.wanted.bustedTimer += dt;
      if (this.wanted.bustedTimer > 2.2) {
        this.player.busted = true;
        this.state = 'busted';
        this.lastPenalty = Math.min(300, Math.floor(this.player.cash * 0.15) + 50);
      }
    } else {
      this.wanted.bustedTimer = Math.max(0, this.wanted.bustedTimer - dt);
    }

    if (this.player.dead) {
      this.state = 'wasted';
      this.lastPenalty = Math.min(300, Math.floor(this.player.cash * 0.15) + 50);
    }

    this.checkCarCollisions();
    this.missions.update(dt, this);
    this.briefTimer = Math.max(0, this.briefTimer - dt);

    for (const pt of this.particles) {
      pt.x += pt.vx * dt;
      pt.y += pt.vy * dt;
      pt.life -= dt;
    }
    this.particles = this.particles.filter((pt) => pt.life > 0);

    for (const f of this.floats) {
      f.y -= 26 * dt;
      f.life -= dt;
    }
    this.floats = this.floats.filter((f) => f.life > 0);

    for (const b of this.bullets) {
      b.life -= dt;
    }
    this.bullets = this.bullets.filter((b) => b.life > 0);

    this.audio.setEngine(!!this.player.inCar, this.player.inCar ? this.player.inCar.speed / CFG.CAR_MAX : 0);
    this.audio.setSiren(this.wanted.stars > 0 && this.police.length > 0, this.time);
    this.shake = Math.max(0, this.shake - dt * 14);
    this.updateCamera(0);
    input.endFrame();
  }

  render() {
    ctx.save();
    if (this.shake > 0) {
      ctx.translate((Math.random() - 0.5) * 2 * this.shake, (Math.random() - 0.5) * 2 * this.shake);
    }
    if (this.state === 'title') {
      drawTitle(ctx, this);
    } else if (this.state === 'howto') {
      drawHowTo(ctx);
    } else {
      drawWorld(ctx, this);
      drawHUD(ctx, this);
      if (this.state === 'pause') {
        drawPause(ctx, this);
      }
      if (this.state === 'wasted') {
        drawEndScreen(ctx, this, 'wasted');
      }
      if (this.state === 'busted') {
        drawEndScreen(ctx, this, 'busted');
      }
      if (this.wanted.bustedTimer > 0.3 && this.state === 'play') {
        ctx.font = 'bold 22px Arial, sans-serif';
        ctx.fillStyle = '#ff5252';
        ctx.textAlign = 'center';
        ctx.fillText('BUSTED IN ' + Math.max(0, 2.2 - this.wanted.bustedTimer).toFixed(1) + 's — MOVE!', CFG.W / 2, 110);
      }
    }
    ctx.restore();
  }
}

const shotInfo = getShotParams();
const seed = shotInfo ? shotInfo.seed : 7;
const game = new Game(seed);
window.__game = game;

if (shotInfo) {
  setupShot(game, shotInfo.shot);
  for (let i = 0; i < 90; i++) {
    autopilotStep(game);
    game.step(1 / 60);
  }
  if (shotInfo.shot === 'city' || shotInfo.shot === 'chase' || shotInfo.shot === 'mission') {
    game.briefTimer = 999;
  }
  if (shotInfo.shot === 'chase') {
    game.wanted.heat = 3;
    game.wanted.stars = 3;
  }
  game.render();
  window.__shotReady = true;
} else {
  let last = performance.now();
  const loop = (now) => {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    game.step(dt);
    game.render();
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
}
