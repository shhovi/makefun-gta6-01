// localStorage save/load of progress: mission index, money, position.
// All operations are try/catch wrapped so private-mode browsers never crash the game.
const SAVE_KEY = "solar-bay-outlaw-save-v1";

export function saveGame(state) {
  try {
    const data = {
      missionIndex: state.missionIndex ?? 0,
      money: state.money ?? 0,
      x: state.x ?? 0,
      y: state.y ?? 0,
      health: state.health ?? 100,
      seed: state.seed ?? 1337,
      savedAt: Date.now(),
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
    if (typeof data !== "object" || data === null) return null;
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

export function hasSave() {
  return loadGame() !== null;
}
