// Solar Bay: Outlaw — game loop and menu state machine (title/playing/paused/busted/wasted).
// Wires every module together: city, player, traffic, peds, police,
// combat, missions, HUD, audio, saves and screenshot mode.

import { DEFAULT_SEED, CAR_MAX_SPEED, COLORS } from "./config.js";
import { makeRng } from "./random.js";
import { generateCity } from "./city.js";
import { drawWorld, drawCar, drawPerson, drawMarker, cameraFor } from "./render.js";
import { Input } from "./input.js";
import { createPlayer, updatePlayer, toggleVehicle } from "./player.js";
import { driveVehicle, createVehicle } from "./vehicles.js";
import { spawnTraffic, updateTraffic } from "./traffic.js";
import { spawnPedestrians, updatePedestrians } from "./pedestrians.js";
import { createWanted, updateWanted, spawnPolice, updatePolice, checkOutcome } from "./police.js";
import { punch, shoot } from "./combat.js";
import { createMissionState, currentMission, updateMissions } from "./missions.js";
import { updateHud, drawMinimap } from "./hud.js";
import { GameAudio } from "./audio.js";
import { saveGame, loadGame, applySave } from "./save.js";
import { loadShots, shotFromUrl, findScene, applyScene } from "./shots.js";

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const minimap = document.getElementById("minimap");
const minimapCtx = minimap.getContext("2d");

const els = {
  wanted: document.getElementById("wanted"),
  health: document.getElementById("health"),
  money: document.getElementById("money"),
  objective: document.getElementById("objective"),
  dialog: document.getElementById("dialog"),
};

const screens = {
  title: document.getElementById("title"),
  pause: document.getElementById("pause"),
  busted: document.getElementById("busted"),
  wasted: document.getElementById("wasted"),
};

function showScreen(name) {
  for (const [key, el] of Object.entries(screens)) {
    el.classList.toggle("visible", key === name);
  }
}

const state = {
  mode: "title", // title | playing | paused | busted | wasted
  seed: DEFAULT_SEED,
  timeOfDay: "day",
  city: null,
  rng: null,
  player: null,
  traffic: [],
  peds: [],
  police: [],
  wanted: createWanted(),
  missionState: createMissionState(),
  shot: null,
  saveTimer: 0,
};

const input = new Input(canvas);
const audio = new GameAudio();

function newGame(seed, scene) {
  state.seed = seed;
  state.rng = makeRng(seed);
  state.city = generateCity(seed);
  state.player = createPlayer(640, 360);
  state.wanted = createWanted();
  state.missionState = createMissionState();
  state.missionState.dialogTimer = 8;
  state.traffic = spawnTraffic(state.city, state.rng, 14);
  state.peds = spawnPedestrians(state.city, state.rng, 22);
  state.police = [];
  state.shot = null;
  state.timeOfDay = "day";

  if (scene) {
    applyScene(state, scene);
    if (scene.player.inVehicle) {
      const car = createVehicle(state.player.x, state.player.y, 0, state.rng.pick(COLORS.car));
      car.driver = state.player;
      state.player.vehicle = car;
      state.traffic.push(car);
    }
    if (state.wanted.level > 0) {
      state.police = spawnPolice(state.city, state.rng, state.wanted.level);
    }
  } else {
    const saved = loadGame();
    if (saved) applySave(state, saved);
  }
}

function startPlaying() {
  state.mode = "playing";
  showScreen(null);
  audio.ensure();
}

function endGame(outcome) {
  state.mode = outcome;
  showScreen(outcome);
  audio.setEngine(false);
  audio.setSiren(false, 0);
}

function step(dt, timeMs) {
  const player = state.player;

  if (input.wasPressed("e")) {
    toggleVehicle(player, [...state.traffic, ...state.police]);
  }
  if (input.wasPressed("f")) {
    punch(player, state.peds, state.wanted, audio);
  }

  updatePlayer(player, input, state.city, dt);
  if (player.vehicle) {
    driveVehicle(player.vehicle, input, state.city, dt);
    audio.setEngine(true, player.vehicle.speed / CAR_MAX_SPEED);
  } else {
    audio.setEngine(false);
  }

  if (input.mouse.clicked) {
    const cam = cameraFor(player, canvas.width, canvas.height);
    shoot(player, input.mouse.x + cam.x, input.mouse.y + cam.y, state.peds, state.traffic, state.wanted, audio);
  }

  updateTraffic(state.traffic, state.city, state.rng, dt);
  updatePedestrians(state.peds, state.rng, dt);

  const wantedBefore = state.wanted.level;
  updateWanted(state.wanted, dt, state.police.length > 0 && state.wanted.level > 0);
  if (state.wanted.level !== wantedBefore || (state.wanted.level > 0 && state.police.length === 0)) {
    state.police = state.wanted.level > 0 ? spawnPolice(state.city, state.rng, state.wanted.level) : [];
  }
  const nearestPolice = state.police.length ? updatePolice(state.police, player, state.city, dt, timeMs) : Infinity;
  audio.setSiren(state.police.length > 0, timeMs);

  const missionEvent = updateMissions(state.missionState, player, state.wanted, dt);
  if (missionEvent) audio.pickup();

  const outcome = checkOutcome(state.wanted, player, nearestPolice, dt);
  if (outcome) endGame(outcome);

  state.saveTimer += dt;
  if (state.saveTimer > 5) {
    state.saveTimer = 0;
    saveGame(state);
  }
}

function render(timeMs) {
  const player = state.player;
  const cam = cameraFor(player, canvas.width, canvas.height);
  drawWorld(ctx, state.city, cam, canvas.width, canvas.height);

  const mission = currentMission(state.missionState);
  if (mission) drawMarker(ctx, mission.marker.x, mission.marker.y, cam);

  for (const car of state.traffic) drawCar(ctx, car, cam);
  for (const car of state.police) drawCar(ctx, car, cam);
  for (const ped of state.peds) {
    if (ped.health > 0) drawPerson(ctx, ped, cam, ped.color);
  }
  if (!player.vehicle) drawPerson(ctx, player, cam, COLORS.player);

  if (state.timeOfDay === "dusk") {
    ctx.fillStyle = "rgba(255,140,60,.14)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  updateHud(els, player, state.wanted, mission, state.missionState);
  drawMinimap(minimapCtx, state.city, player, mission, state.police, 160);
  void timeMs;
}

let last = performance.now();
function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;

  if (state.mode === "playing") {
    if (input.wasPressed("p") || input.wasPressed("escape")) {
      state.mode = "paused";
      showScreen("pause");
    } else {
      step(dt, now);
    }
  } else if (state.mode === "paused") {
    if (input.wasPressed("p") || input.wasPressed("escape")) startPlaying();
  }

  if (state.city) render(now);
  input.endFrame();
  requestAnimationFrame(frame);
}

document.getElementById("startBtn").addEventListener("click", startPlaying);
document.getElementById("resumeBtn").addEventListener("click", startPlaying);
document.getElementById("bustedBtn").addEventListener("click", () => { newGame(state.seed, null); startPlaying(); });
document.getElementById("wastedBtn").addEventListener("click", () => { newGame(state.seed, null); startPlaying(); });

// Boot: deterministic screenshot mode if ?shot= is present.
(async () => {
  const shotName = shotFromUrl();
  if (shotName) {
    const scenes = await loadShots();
    const scene = findScene(scenes, shotName);
    newGame(scene?.seed ?? DEFAULT_SEED, scene);
    startPlaying();
  } else {
    newGame(DEFAULT_SEED, null);
    showScreen("title");
  }
  requestAnimationFrame(frame);
})();
