// Solar Bay: Outlaw — shared world constants.

export const TILE = 32;
export const GRID_W = 80;
export const GRID_H = 60;
export const WORLD_W = TILE * GRID_W;
export const WORLD_H = TILE * GRID_H;

export const PLAYER_SPEED = 180; // px per second on foot
export const PLAYER_RUN = 260;
export const CAR_ACCEL = 320;
export const CAR_BRAKE = 420;
export const CAR_MAX_SPEED = 420;
export const CAR_TURN = 2.6; // radians per second at speed
export const POLICE_SPEED = 400;

export const MAX_WANTED = 5;
export const WANTED_DECAY_SECONDS = 18;

export const COLORS = {
  road: "#3c4046",
  roadLine: "#d8d8c8",
  grass: "#4a7c4f",
  sand: "#e6cf9a",
  water: "#2e6fb0",
  sidewalk: "#9aa0a6",
  building: ["#8d6e63", "#a1887f", "#90a4ae", "#b0bec5", "#c9a86a"],
  player: "#ffd23f",
  police: "#2456c8",
  policeStripe: "#ffffff",
  ped: ["#e57373", "#64b5f6", "#81c784", "#ffb74d", "#ba68c8"],
  car: ["#c0392b", "#2980b9", "#27ae60", "#f39c12", "#7f8c8d", "#8e44ad"],
};

// localStorage key — bump the version suffix if the save shape changes.
export const SAVE_KEY = "solar-bay-outlaw-save-v1";
export const DEFAULT_SEED = 42;
