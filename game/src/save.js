// localStorage save / load.
const KEY = "solar-bay-outlaw-save-v1";
export function saveGame(state) {
  try {
    const data = {
      seed: state.seed,
      player: { x: state.player.x, y: state.player.y, health: state.player.health, money: state.player.money },
      missionIndex: state.missions.index,
      wanted: state.police.wanted,
      savedAt: Date.now(),
    };
    localStorage.setItem(KEY, JSON.stringify(data));
    return true;
  } catch (e) { return false; }
}
export function loadGame() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) { return null; }
}
export function hasSave() {
  try { return !!localStorage.getItem(KEY); } catch (e) { return false; }
}
export function clearSave() {
  try { localStorage.removeItem(KEY); } catch (e) {}
}
export function applySave(state, data) {
  if (!data) return false;
  if (data.player) {
    state.player.x = data.player.x; state.player.y = data.player.y;
    state.player.health = data.player.health; state.player.money = data.player.money;
  }
  if (typeof data.missionIndex === "number") state.missions.index = data.missionIndex;
  return true;
}
