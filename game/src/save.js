// localStorage save / load for player + mission progress.
// Saves are versioned so old data can be rejected safely.

import { SAVE_KEY } from "./config.js";

export function saveGame(state) {
  try {
    const data = {
      version: 1,
      savedAt: Date.now(),
      player: {
        x: state.player.x,
        y: state.player.y,
        health: state.player.health,
        money: state.player.money,
      },
      missionIndex: state.missionState.index,
      missionCompleted: state.missionState.completed,
      wantedHeat: state.wanted.heat,
    };
    localStorage.setItem(SAVE_KEY, JSON.stringify(data));
    return true;
  } catch {
    return false;
  }
}

export function loadGame() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (data.version !== 1) return null;
    return data;
  } catch {
    return null;
  }
}

export function clearSave() {
  try {
    localStorage.removeItem(SAVE_KEY);
  } catch {
    // storage unavailable — nothing to clear
  }
}

export function applySave(state, data) {
  if (!data) return false;
  state.player.x = data.player.x;
  state.player.y = data.player.y;
  state.player.health = data.player.health;
  state.player.money = data.player.money;
  state.missionState.index = data.missionIndex ?? 0;
  state.missionState.completed = Boolean(data.missionCompleted);
  state.wanted.heat = data.wantedHeat ?? 0;
  state.wanted.level = state.wanted.heat > 0 ? Math.max(1, Math.floor(state.wanted.heat / 20)) : 0;
  return true;
}
