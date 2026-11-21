// Game loop and menu state machine wiring all modules together.
import { CONFIG } from "./config.js";
import { mulberry32 } from "./random.js";
import { generateCity } from "./city.js";
import { drawWorld } from "./render.js";
import { createInput } from "./input.js";
import { createPlayer, updatePlayer, nearestVehicle, damagePlayer } from "./player.js";
import { createVehicle, updateVehicle, stopVehicle } from "./vehicles.js";
import { spawnTraffic, updateTraffic } from "./traffic.js";
import { spawnPeds, updatePeds, scarePeds } from "./pedestrians.js";
import { createPoliceState, addHeat, decayHeat, updatePolice, clearWanted } from "./police.js";
import { tryPunch, tryShoot } from "./combat.js";
import { createMissionState, currentObjective, checkMission, MISSIONS } from "./missions.js";
import { updateHud, drawMinimap } from "./hud.js";
import { createAudio } from "./audio.js";
import { saveGame, loadGame, applySave } from "./save.js";
import { parseShotParams, loadShots, applyShot, findShot } from "./shots.js";

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const minimapCtx = document.getElementById("minimap").getContext("2d");
const els = {
  stars: document.getElementById("stars"),
  stats: document.getElementById("stats"),
  mission: document.getElementById("mission"),
};
const screens = {
  title: document.getElementById("title"),
  pause: document.getElementById("pause"),
  busted: document.getElementById("busted"),
  wasted: document.getElementById("wasted"),
};
function showScreen(name) {
  for (const k in screens) screens[k].classList.toggle("on", k === name);
}
const shotParams = parseShotParams(window.location.search);
const seed = shotParams.seed || 1337;
const rng = mulberry32(seed);
const city = generateCity(seed);
const player = createPlayer(320, 320);
const parked = [createVehicle(352, 320, "#3a7fc8"), createVehicle(640, 352, "#e0a832"), createVehicle(960, 320, "#58a65c")];
const state = {
  seed: seed, city: city, player: player, playerVehicle: null,
  traffic: spawnTraffic(city, rng, 14),
  peds: spawnPeds(city, rng, 24),
  police: createPoliceState(),
  missions: createMissionState(),
  objective: null, mode: "title", timeOfDay: "day", shotMode: false,
};
state.objective = currentObjective(state.missions);
const saved = loadGame();
if (saved && !shotParams.shot) { applySave(state, saved); state.missions.active = MISSIONS[state.missions.index] || null; state.objective = currentObjective(state.missions); }
const input = createInput(canvas);
const audio = createAudio();
loadShots("../shots.json").then(function (scenes) {
  if (shotParams.shot) {
    const scene = findShot(scenes, shotParams.shot);
    if (scene) { applyShot(state, scene); state.mode = "playing"; showScreen(null); }
  }
});
document.getElementById("startBtn").addEventListener("click", function () {
  audio.unlock(); state.mode = "playing"; showScreen(null);
});
for (const btn of document.querySelectorAll("[data-restart]")) {
  btn.addEventListener("click", function () { respawn(); });
}
function respawn() {
  player.health = CONFIG.MAX_HEALTH; player.alive = true;
  player.x = 320; player.y = 320; player.vehicle = null; state.playerVehicle = null;
  clearWanted(state.police); state.mode = "playing"; showScreen(null);
}
let last = performance.now();
let sirenTimer = 0;
function frame(now) {
  requestAnimationFrame(frame);
  const dt = Math.min(50, now - last); last = now;
  if (input.wasPressed("escape")) {
    if (state.mode === "playing") { state.mode = "pause"; showScreen("pause"); }
    else if (state.mode === "pause") { state.mode = "playing"; showScreen(null); }
  }
  if (state.mode !== "playing") { render(); return; }
  if (input.wasPressed("e")) {
    if (player.vehicle) { stopVehicle(player.vehicle); player.vehicle = null; state.playerVehicle = null; audio.engine(false); }
    else {
      const v = nearestVehicle(player, parked.concat(state.traffic), 52);
      if (v) { player.vehicle = v; state.playerVehicle = v; audio.engine(true); }
    }
  }
  if (player.vehicle) updateVehicle(player.vehicle, input);
  updatePlayer(player, input, city);
  updateTraffic(state.traffic, city, rng);
  updatePeds(state.peds, city, now, player);
  if (input.wasPressed("f")) {
    if (tryPunch(player, state.peds, state.police, now)) { audio.punch(); addHeat(state.police, 35); scarePeds(state.peds, player.x, player.y, 140, now); }
  }
  if (input.wasPressed("mouse")) {
    const cam = camera();
    const res = tryShoot(player, input.mouseX + cam.x, input.mouseY + cam.y, state.peds, state.police);
    audio.gunshot(); scarePeds(state.peds, player.x, player.y, 260, now);
    addHeat(state.police, res.hit ? 120 : 60);
  }
  decayHeat(state.police, dt);
  const pol = updatePolice(state.police, player, rng, now);
  if (state.police.wanted > 0) { sirenTimer += dt; if (sirenTimer > 900) { audio.siren(); sirenTimer = 0; } }
  if (pol.busted) { state.mode = "busted"; showScreen("busted"); saveGame(state); }
  if (!player.alive || player.health <= 0) { state.mode = "wasted"; showScreen("wasted"); }
  const done = checkMission(state.missions, player, state.police.wanted);
  if (done) { audio.missionDone(); saveGame(state); }
  state.objective = currentObjective(state.missions);
  if (input.wasPressed("k")) saveGame(state);
  render();
}
function camera() {
  return {
    x: Math.max(0, Math.min(CONFIG.WORLD_W - canvas.width, player.x - canvas.width / 2)),
    y: Math.max(0, Math.min(CONFIG.WORLD_H - canvas.height, player.y - canvas.height / 2)),
  };
}
function render() {
  const view = { city: city, traffic: state.traffic, police: state.police.cops, peds: state.peds, player: player, playerVehicle: state.playerVehicle, objective: state.objective };
  drawWorld(ctx, view, camera());
  updateHud(els, state);
  drawMinimap(minimapCtx, state);
}
requestAnimationFrame(frame);
