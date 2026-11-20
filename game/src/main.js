// Solar Bay: Outlaw — main game loop and wiring. requestAnimationFrame, menu state machine.
// States: title → playing ⇄ paused, plus busted/wasted end screens with respawn.
import { DEFAULT_SEED, TILE } from "./config.js";
import { Random } from "./random.js";
import { generateCity } from "./city.js";
import { drawCity, drawPerson, drawCar, drawMarker } from "./render.js";
import { Input } from "./input.js";
import { Player } from "./player.js";
import { spawnParkedCars } from "./vehicles.js";
import { spawnTraffic } from "./traffic.js";
import { spawnPedestrians } from "./pedestrians.js";
import { WantedSystem } from "./police.js";
import { Combat } from "./combat.js";
import { MissionChain } from "./missions.js";
import { HUD } from "./hud.js";
import { SynthAudio } from "./audio.js";
import { saveGame, loadGame } from "./save.js";
import { getShotSceneFromURL, loadShotScene, applyShotScene, renderShotFrame } from "./shots.js";

const canvas = document.getElementById("game-canvas");
const ctx = canvas.getContext("2d");

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener("resize", resize);
resize();

class Game {
  constructor() {
    this.seed = DEFAULT_SEED;
    this.state = "title"; // title | playing | paused | busted | wasted
    this.time = 0;
    this.timeOfDay = "day";
    this.shotMode = false;
    this.fixedTime = null;
    this.input = new Input(canvas);
    this.audio = new SynthAudio();
    this.hud = new HUD();
    this.reset(loadGame());
    this.bindMenus();
  }

  reset(save) {
    if (save?.seed) this.seed = save.seed;
    this.rng = new Random(this.seed);
    this.city = generateCity(this.seed);
    const spawn = save && save.x ? { x: save.x, y: save.y } : { x: 5 * TILE + 24, y: 5 * TILE + 24 };
    this.player = new Player(spawn.x, spawn.y);
    if (save) {
      this.player.money = save.money ?? 0;
      this.player.health = save.health ?? 100;
    }
    this.parkedCars = spawnParkedCars(this.city, this.rng, 24);
    this.trafficCars = spawnTraffic(this.city, this.rng, 14);
    this.peds = spawnPedestrians(this.city, this.rng, 30);
    this.wanted = new WantedSystem();
    this.combat = new Combat();
    this.missions = new MissionChain(save?.missionIndex ?? 0);
    this.camera = { x: 0, y: 0, w: canvas.width, h: canvas.height };
  }

  bindMenus() {
    const show = (id) => {
      for (const el of document.querySelectorAll(".menu-screen")) el.classList.remove("active");
      if (id) document.getElementById(id)?.classList.add("active");
    };
    this._showMenu = show;
    document.getElementById("btn-start")?.addEventListener("click", () => {
      this.audio.ensure();
      this.state = "playing";
      show(null);
    });
    document.getElementById("btn-resume")?.addEventListener("click", () => {
      this.state = "playing";
      show(null);
    });
    const respawn = () => {
      this.wanted.clear();
      this.player.respawn(5 * TILE + 24, 5 * TILE + 24);
      this.state = "playing";
      show(null);
    };
    document.getElementById("btn-busted-restart")?.addEventListener("click", respawn);
    document.getElementById("btn-wasted-restart")?.addEventListener("click", respawn);
  }

  get allCars() {
    return [...this.parkedCars, ...this.trafficCars, ...this.wanted.policeCars];
  }

  step(dt, silent = false) {
    this.time += dt;
    const input = this.input;
    const player = this.player;

    const aimAngle = Math.atan2(
      input.mouseY + this.camera.y - player.y,
      input.mouseX + this.camera.x - player.x
    );

    if (input.enterCar) {
      if (player.inVehicle) {
        player.exitVehicle();
        this.audio.stopEngine();
      } else {
        const car = player.tryEnterVehicle(this.allCars.filter((c) => !c.isPolice));
        if (car) {
          this.audio.startEngine();
          this.wanted.addCrime(0.3); // carjacking is a crime
        }
      }
    }

    if (player.inVehicle) {
      player.vehicle.updateDriven(dt, input, this.city);
      this.audio.setEngineSpeed(player.vehicle.speed);
    } else {
      player.updateOnFoot(dt, input, this.city, aimAngle);
      if (input.punch) this.combat.punch(player, this.peds, this.wanted, this.audio);
      if (input.mouseDown) this.combat.shoot(player, aimAngle, this.peds, this.allCars, this.wanted, this.audio);
    }

    for (const car of this.trafficCars) car.update(dt, this.city, this.allCars);
    for (const ped of this.peds) ped.update(dt, this.city);
    this.combat.update(dt);

    const bustResult = this.wanted.update(dt, player, this.city, this.rng);
    if (this.wanted.stars > 0) this.audio.startSiren();
    else this.audio.stopSiren();

    if (!silent) {
      if (bustResult === "busted") {
        this.state = "busted";
        this._showMenu("menu-busted");
        this.audio.stopSiren();
        this.audio.stopEngine();
      }
      if (!player.alive) {
        this.state = "wasted";
        this._showMenu("menu-wasted");
        this.audio.stopSiren();
        this.audio.stopEngine();
      }
    }

    const done = this.missions.update(player, this.wanted, this.city);
    if (done && !silent) {
      this.audio.missionComplete();
      saveGame({ missionIndex: this.missions.index, money: player.money, x: player.x, y: player.y, health: player.health, seed: this.seed });
    }

    this.camera.w = canvas.width;
    this.camera.h = canvas.height;
    this.camera.x = Math.max(0, Math.min(player.x - this.camera.w / 2, this.city.grid[0].length * TILE - this.camera.w));
    this.camera.y = Math.max(0, Math.min(player.y - this.camera.h / 2, this.city.grid.length * TILE - this.camera.h));

    input.endFrame();
  }

  draw() {
    const time = this.fixedTime ?? this.time;
    ctx.fillStyle = this.timeOfDay === "dusk" ? "#2a2438" : "#1d4e79";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    drawCity(ctx, this.city, this.camera);

    const marker = this.missions.markerFor(this.city);
    if (marker) drawMarker(ctx, marker.x, marker.y, this.camera, time);

    for (const car of this.allCars) drawCar(ctx, car, this.camera);
    for (const ped of this.peds) {
      if (ped.alive) drawPerson(ctx, ped.x - this.camera.x, ped.y - this.camera.y, ped.angle, ped.color, ped.radius);
    }
    if (!this.player.inVehicle) {
      drawPerson(ctx, this.player.x - this.camera.x, this.player.y - this.camera.y, this.player.angle, this.player.color, this.player.radius);
    }
    this.combat.drawTracers(ctx, this.camera);

    if (this.timeOfDay === "dusk") {
      ctx.fillStyle = "rgba(40,20,60,0.25)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    this.hud.update(this.player, this.wanted, this.missions, this.city, marker);
  }

  frame(now) {
    const dt = Math.min(0.05, (now - (this._last ?? now)) / 1000);
    this._last = now;
    if (this.input.pause && this.state === "playing") {
      this.state = "paused";
      this._showMenu("menu-pause");
    }
    if (this.state === "playing") this.step(dt);
    this.draw();
    requestAnimationFrame((t) => this.frame(t));
  }
}

const game = new Game();
window.__solarBay = game;

(async () => {
  const shotName = getShotSceneFromURL();
  if (shotName) {
    const scene = await loadShotScene(shotName);
    if (scene) {
      game.reset(null);
      game.seed = scene.seed;
      game.reset({ seed: scene.seed });
      applyShotScene(scene, game);
      game.state = "playing";
      game._showMenu(null);
      renderShotFrame(game);
      return;
    }
  }
  requestAnimationFrame((t) => game.frame(t));
})();
