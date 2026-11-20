// World constants for Solar Bay: Outlaw. All distances in pixels, speeds in px/s.
export const TILE = 48;
export const CITY_COLS = 40;
export const CITY_ROWS = 40;
export const BLOCK_SIZE = 5; // tiles per block including road
export const WORLD_WIDTH = CITY_COLS * TILE;
export const WORLD_HEIGHT = CITY_ROWS * TILE;

export const PLAYER_SPEED = 210;
export const PLAYER_RUN_SPEED = 300;
export const PLAYER_RADIUS = 14;
export const PLAYER_MAX_HEALTH = 100;

export const CAR_ACCEL = 320;
export const CAR_BRAKE = 420;
export const CAR_MAX_SPEED = 420;
export const CAR_REVERSE_SPEED = 140;
export const CAR_STEER = 2.6;
export const CAR_WIDTH = 30;
export const CAR_LENGTH = 52;

export const TRAFFIC_SPEED = 170;
export const POLICE_SPEED = 360;
export const PED_SPEED = 70;

export const PUNCH_RANGE = 36;
export const PUNCH_DAMAGE = 12;
export const PISTOL_DAMAGE = 34;
export const PISTOL_RANGE = 520;

export const COLORS = {
  road: "#3a3f46",
  roadLine: "#f2d16b",
  sidewalk: "#8a8f96",
  grass: "#4f8f4f",
  sand: "#e6cf9a",
  water: "#2b6cb0",
  waterDeep: "#1d4e79",
  buildingRoofs: ["#b5654d", "#7a6a8a", "#5d7a8a", "#a08a5a", "#6a7a5a", "#8a5a6a"],
  player: "#e4572e",
  police: "#f4f4f4",
  policeBlue: "#2456a6",
  pedPalette: ["#d9a05b", "#5b8ad9", "#7ad95b", "#d95b8a", "#9a5bd9", "#5bd9c8"],
  carPalette: ["#c0392b", "#2980b9", "#27ae60", "#f39c12", "#8e44ad", "#ecf0f1", "#2c3e50"],
};

export const DEFAULT_SEED = 1337;
