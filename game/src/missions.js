import { CFG } from './config.js';

export const CONTACT = { name: 'Mara Voss', role: 'fixer at the Harbor Row safehouse' };

export function buildMissions(rng) {
  const pts = [];
  const rp = () => ({ x: 300 + rng() * (CFG.WORLD_W - 600), y: 300 + rng() * (CFG.WORLD_H - 1000) });
  const safehouse = { x: 520, y: 520 };
  return [
    { id: 1, title: 'Meet Mara', type: 'goto', target: { ...safehouse }, reward: 150,
      brief: 'Mara Voss is waiting at the Harbor Row safehouse. Get there on foot or by car.',
      objective: 'Go to Mara at the safehouse', doneText: 'Mara sizes you up. "You drive. I pay. Simple."' },
    { id: 2, title: 'Hot Delivery', type: 'delivery', target: rp(), reward: 400, time: 75,
      brief: 'Mara hands you a sealed cooler. "Coral Heights, fast. No questions."',
      objective: 'Deliver the cooler before time runs out', doneText: 'Delivered cold. Mara wires your cut.' },
    { id: 3, title: 'Package Run', type: 'packages', target: rp(), reward: 550, count: 4,
      brief: 'Four dead-drops across Palm District. Grab every package.',
      objective: 'Collect the packages (0/4)', doneText: 'All drops cleared. Word travels fast in Solar Bay.' },
    { id: 4, title: 'Ram the Courier', type: 'ram', target: rp(), reward: 800,
      brief: 'A rival courier in a teal sedan is moving product. Stop his car — ram it until it dies.',
      objective: 'Ram the teal courier car until it is wrecked', doneText: 'Courier stopped. Mara is very pleased.' },
    { id: 5, title: 'Sunset Getaway', type: 'getaway', target: { x: CFG.WORLD_W / 2, y: CFG.WORLD_H - 520 }, reward: 1200, time: 90,
      brief: 'Heat is coming. Reach the beach pier and lose the cops before the timer ends.',
      objective: 'Reach the beach pier and lose the wanted level', doneText: 'You vanish into the sunset. Solar Bay is yours.' },
  ];
}

export class MissionSystem {
  constructor(rng) {
    this.list = buildMissions(rng);
    this.index = 0; this.active = null; this.timer = 0;
    this.collected = 0; this.packages = []; this.targetCar = null;
    this.completed = 0; this.banner = 0; this.bannerText = '';
    this.rng = rng;
  }
  current() { return this.active; }
  startNext(game) {
    if (this.index >= this.list.length) { this.active = null; return; }
    const m = this.list[this.index];
    this.active = m; this.timer = m.time || 0; this.collected = 0;
    this.packages = []; this.targetCar = null;
    if (m.type === 'packages') {
      for (let i = 0; i < m.count; i++) {
        this.packages.push({ x: 300 + this.rng() * (CFG.WORLD_W - 600), y: 300 + this.rng() * (CFG.WORLD_H - 1000), taken: false });
      }
    }
    if (m.type === 'ram') {
      game.spawnTargetCar(m.target);
    }
    if (m.type === 'getaway') game.wanted.addCrime(2);
    game.showBrief(m);
  }
  marker() {
    if (!this.active) return null;
    if (this.active.type === 'packages') {
      const p = this.packages.find((q) => !q.taken);
      return p ? { x: p.x, y: p.y } : null;
    }
    if (this.active.type === 'ram' && this.targetCar) return { x: this.targetCar.x, y: this.targetCar.y };
    return this.active.target;
  }
  objectiveText() {
    if (!this.active) return 'Free roam — press M for Mara\'s next job';
    const m = this.active;
    if (m.type === 'packages') return `Collect the packages (${this.collected}/${m.count})`;
    if (m.type === 'ram' && this.targetCar) return `Ram the courier car — damage ${Math.max(0, Math.round(100 - this.targetCar.health))}%`;
    if (m.time) return `${m.objective} — ${Math.ceil(this.timer)}s`;
    return m.objective;
  }
  update(dt, game) {
    this.banner = Math.max(0, this.banner - dt);
    if (!this.active) return;
    const m = this.active; const p = game.player;
    if (m.time) {
      this.timer -= dt;
      if (this.timer <= 0) { game.failMission('Out of time'); return; }
    }
    const dist = (t) => Math.hypot(p.x - t.x, p.y - t.y);
    if (m.type === 'goto' && dist(m.target) < 55) return this.complete(game);
    if (m.type === 'delivery' && dist(m.target) < 55) return this.complete(game);
    if (m.type === 'getaway' && dist(m.target) < 70 && game.wanted.stars === 0) return this.complete(game);
    if (m.type === 'packages') {
      for (const pk of this.packages) {
        if (!pk.taken && dist(pk) < 34) { pk.taken = true; this.collected++; game.audio.pickup(); game.addFloat(pk.x, pk.y - 24, 'PACKAGE', '#7CFC98'); }
      }
      if (this.collected >= m.count) return this.complete(game);
    }
    if (m.type === 'ram' && this.targetCar && this.targetCar.wrecked) return this.complete(game);
  }
  complete(game) {
    const m = this.active;
    game.player.cash += m.reward;
    this.completed++;
    this.banner = 4; this.bannerText = `MISSION PASSED  +$${m.reward}`;
    game.audio.cash();
    game.showDone(m);
    this.index++; this.active = null;
  }
  fail(game, why) {
    this.banner = 3.5; this.bannerText = `MISSION FAILED — ${why}`;
    this.active = null;
  }
}
