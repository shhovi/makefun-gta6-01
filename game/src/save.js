const SAVE_KEY = "solar-bay-outlaw-save-v1";

export function saveGame(state) {
  const data = {
    seed: state.seed,
    player: {
      x: state.player.x,
      y: state.player.y,
      health: state.player.health,
      money: state.player.money,
    },
    missionIndex: state.missions.index,
    wanted: state.police.wanted,
    heat: state.police.heat,
    savedAt: Date.now(),
    game: "Solar Bay: Outlaw",
  };
  try {
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
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function clearSave() {
  try {
    localStorage.removeItem(SAVE_KEY);
  } catch {
    return false;
  }
  return true;
}

export function hasSave() {
  try {
    return localStorage.getItem(SAVE_KEY) !== null;
  } catch {
    return false;
  }
}
