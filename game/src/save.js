const KEY = 'solarbay_outlaw_save_v1';
export function saveGame(data) {
  try { localStorage.setItem(KEY, JSON.stringify(data)); return true; } catch { return false; }
}
export function loadGame() {
  try { const s = localStorage.getItem(KEY); return s ? JSON.parse(s) : null; } catch { return null; }
}
export function hasSave() { try { return !!localStorage.getItem(KEY); } catch { return false; } }
export function clearSave() { try { localStorage.removeItem(KEY); } catch {} }
