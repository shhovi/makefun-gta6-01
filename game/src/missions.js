// Five-mission Mara Voss story chain with objectives and dialog.
export const MISSIONS = [
  { id: 1, title: "Welcome to Solar Bay", giver: "Mara Voss", dialog: "Mara Voss: New in town? Meet me at the pier and I will show you the ropes.", objective: "Go to the pier marker", x: 1600, y: 320, reward: 100 },
  { id: 2, title: "First Wheels", giver: "Mara Voss", dialog: "Mara Voss: Borrow a car and bring it to the garage on Palm Street.", objective: "Deliver a car to the garage", x: 320, y: 960, reward: 200 },
  { id: 3, title: "Hot Package", giver: "Mara Voss", dialog: "Mara Voss: Take this package across town. Do not stop for anyone.", objective: "Deliver the package downtown", x: 960, y: 960, reward: 350 },
  { id: 4, title: "Heat Wave", giver: "Mara Voss", dialog: "Mara Voss: The police are watching the beach. Lose them, then come back.", objective: "Reach the safehouse with no wanted stars", x: 640, y: 1600, reward: 500 },
  { id: 5, title: "Solar Bay Finale", giver: "Mara Voss", dialog: "Mara Voss: One last run at sunset. Make it count, outlaw.", objective: "Reach the lighthouse lookout", x: 1700, y: 1700, reward: 1000 },
];
export function missionCount() { return MISSIONS.length; }
export function createMissionState() {
  return { index: 0, active: MISSIONS[0], done: [] };
}
export function currentObjective(ms) {
  if (!ms.active) return null;
  return { x: ms.active.x, y: ms.active.y, text: ms.active.objective };
}
export function checkMission(ms, player, wanted) {
  if (!ms.active) return null;
  const m = ms.active;
  const d = Math.hypot(player.x - m.x, player.y - m.y);
  if (d > 40) return null;
  if (m.id === 4 && wanted > 0) return null;
  ms.done.push(m.id);
  player.money += m.reward;
  ms.index += 1;
  ms.active = MISSIONS[ms.index] || null;
  return m;
}
