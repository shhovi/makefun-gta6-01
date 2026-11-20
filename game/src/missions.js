// The 5-mission Mara Voss story chain: objectives + dialog.
// Missions run in order; completing one pays cash and unlocks the next.

import { TILE } from "./config.js";

export const MISSIONS = [
  {
    id: 1,
    title: "First Pickup",
    dialog: "Mara Voss: Pick up the package by the pier. Keep it clean.",
    objective: "Reach the package marker",
    marker: { x: TILE * 66, y: TILE * 12 },
    reward: 150,
    needVehicle: false,
  },
  {
    id: 2,
    title: "Hot Wheels",
    dialog: "Mara Voss: I need a fast car. Bring one to the garage, no scratches.",
    objective: "Deliver a car to the garage marker",
    marker: { x: TILE * 12, y: TILE * 48 },
    reward: 300,
    needVehicle: true,
  },
  {
    id: 3,
    title: "Message Delivered",
    dialog: "Mara Voss: Take this to the old lighthouse crew. Don't be late.",
    objective: "Reach the lighthouse marker",
    marker: { x: TILE * 60, y: TILE * 54 },
    reward: 400,
    needVehicle: false,
  },
  {
    id: 4,
    title: "Heat",
    dialog: "Mara Voss: The PD is watching the bay. Lose them, then come back.",
    objective: "Reach the marker with no wanted stars",
    marker: { x: TILE * 30, y: TILE * 30 },
    reward: 600,
    needVehicle: false,
    needClean: true,
  },
  {
    id: 5,
    title: "The Big Score",
    dialog: "Mara Voss: One last job, and Solar Bay is ours. Meet me at the docks.",
    objective: "Reach the docks marker to finish the story",
    marker: { x: TILE * 72, y: TILE * 30 },
    reward: 1500,
    needVehicle: false,
  },
];

export function createMissionState() {
  return { index: 0, dialogTimer: 0, completed: false };
}

export function currentMission(state) {
  return state.completed ? null : MISSIONS[state.index] ?? null;
}

// Returns an event object when a mission completes, else null.
export function updateMissions(state, player, wanted, dt) {
  const mission = currentMission(state);
  if (!mission) return null;
  if (state.dialogTimer > 0) state.dialogTimer -= dt;

  const dist = Math.hypot(player.x - mission.marker.x, player.y - mission.marker.y);
  if (dist > 36) return null;
  if (mission.needVehicle && !player.vehicle) return null;
  if (mission.needClean && wanted.level > 0) return null;

  player.money += mission.reward;
  const finished = mission;
  state.index += 1;
  state.dialogTimer = 6;
  if (state.index >= MISSIONS.length) state.completed = true;
  return { type: "mission-complete", mission: finished };
}
