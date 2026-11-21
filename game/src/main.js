import { CONFIG, clamp } from "./config.js";
import { mulberry32 } from "./random.js";
import { generateCity } from "./city.js";
import { createRenderer } from "./render.js";
import { createInput } from "./input.js";
import { createPlayer, updatePlayer, tryEnterVehicle, spawnParkedCars } from "./player.js";
import { createTraffic, updateTraffic } from "./traffic.js";
import { createPedestrians, updatePedestrians } from "./pedestrians.js";
import { createPolice, updatePolice, addHeat, clearWanted } from "./police.js";
import { createBullets, tryPunch, tryShoot, updateBullets } from "./combat.js";
import { createMissionState, updateMissions, currentMission } from "./missions.js";
import { createHud, updateHud } from "./hud.js";
import { createAudio } from "./audio.js";
import { saveGame, loadGame, hasSave } from "./save.js";
import { parseShotParam, applyShot } from "./shots.js";

const canvas = document.getElementById("game");
const renderer = createRenderer(canvas);
const input = createInput(canvas);
const hud = createHud();
const audio = createAudio();

const shotScene = parseShotParam(window.location.search);
const seed = shotScene ? shotScene.seed : CONFIG.seed;
const rng = mulberry32(seed);
const city = generateCity(seed);

const state = {
  seed,
  city,
  player: createPlayer(320, 240),
  parked: spawnParkedCars(city, rng),
  traffic: createTraffic(city, rng),
  peds: createPedestrians(city, rng),
  police: createPolice(),
  bullets: createBullets(),
  missions: createMissionState(),
  camera: { x: 0, y: 0 },
  missionTarget: null,
  shotMode: false,
  shotName: null,
  timeOfDay: 12,
  mode: "title",
  title: "Solar Bay: Outlaw",
};

if (shotScene) {
  applyShot(state, shotScene);
  state.mode = "playing";
  hideAllMenus();
}

function showMenu(id) {
  hideAllMenus();
  if (id) document.getElementById(id).classList.add("active");
}

function hideAllMenus() {
  for (const el of document.querySelectorAll(".menu")) el.classList.remove("active");
}

function respawn() {
  state.player.x = 320;
  state.player.y = 240;
  state.player.health = CONFIG.startHealth;
  state.player.inVehicle = false;
  state.player.vehicle = null;
  state.player.money = Math.max(0, state.player.money - 100);
  clearWanted(state.police);
  state.mode = "playing";
  hideAllMenus();
}

function startNew() {
  audio.unlock();
  state.mode = "playing";
  hideAllMenus();
}

function continueGame() {
  const data = loadGame();
  if (data) {
    state.player.x = data.player.x;
    state.player.y = data.player.y;
    state.player.health = data.player.health;
    state.player.money = data.player.money;
    state.missions.index = data.missionIndex;
    state.police.wanted = data.wanted;
    state.police.heat = data.heat;
  }
  startNew();
}

document.getElementById("btn-start").addEventListener("click", startNew);
document.getElementById("btn-continue").addEventListener("click", continueGame);
document.getElementById("btn-resume").addEventListener("click", startNew);
document.getElementById("btn-save").addEventListener("click", () => saveGame(state));
document.getElementById("btn-busted").addEventListener("click", respawn);
document.getElementById("btn-wasted").addEventListener("click", respawn);
if (!hasSave()) document.getElementById("btn-continue").disabled = true;

let last = performance.now();
let sirenTimer = 0;

function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  if (state.mode === "playing") {
    step(dt);
  }
  if (input.wasPressed("escape")) {
    if (state.mode === "playing") {
      state.mode = "paused";
      showMenu("menu-pause");
    } else if (state.mode === "paused") {
      state.mode = "playing";
      hideAllMenus();
    }
  }
  const mission = currentMission(state.missions);
  state.missionTarget = mission ? mission.target : null;
  state.camera.x = clamp(state.player.x - CONFIG.canvasWidth / 2, 0, CONFIG.worldWidth - CONFIG.canvasWidth);
  state.camera.y = clamp(state.player.y - CONFIG.canvasHeight / 2, 0, CONFIG.worldHeight - CONFIG.canvasHeight);
  renderer.draw(state);
  updateHud(hud, state);
  input.endFrame();
  requestAnimationFrame(frame);
}

function step(dt) {
  updatePlayer(state.player, input, state.city, dt);
  if (!state.player.inVehicle && input.wasPressed("e")) {
    if (tryEnterVehicle(state.player, state.parked, state.traffic)) addHeat(state.police, 8);
  }
  if (input.wasPressed(" ")) {
    if (tryPunch(state.player, state.peds, state.police)) {
      audio.punch();
      addHeat(state.police, 6);
    }
  }
  const wantShoot = input.wasPressed("f") || input.mouse.clicked;
  if (wantShoot) {
    const wx = state.camera.x + input.mouse.x;
    const wy = state.camera.y + input.mouse.y;
    const aim = Math.atan2(wy - state.player.y, wx - state.player.x);
    if (tryShoot(state.player, state.bullets, aim)) {
      audio.shoot();
      addHeat(state.police, 14);
    }
  }
  updateBullets(state.bullets, state.peds, state.player, dt);
  updateTraffic(state.traffic, state.city, rng, dt, state.player);
  const threat = state.player.inVehicle ? state.player.vehicle : state.player;
  updatePedestrians(state.peds, state.player, threat, rng, dt);
  const result = updatePolice(state.police, state.player, rng, dt);
  sirenTimer -= dt;
  if (state.police.wanted > 0 && sirenTimer <= 0) {
    audio.siren();
    sirenTimer = 1.2;
  }
  if (state.player.inVehicle && state.player.vehicle) audio.engine(state.player.vehicle.speed);
  const done = updateMissions(state.missions, state.player, state.police.wanted);
  if (done) audio.cash();
  if (result === "busted") {
    state.mode = "busted";
    showMenu("menu-busted");
  } else if (result === "wasted") {
    state.mode = "wasted";
    showMenu("menu-wasted");
  }
}

requestAnimationFrame(frame);
