export const MISSIONS = [
  {
    id: 1,
    title: "First Ride",
    giver: "Mara Voss",
    brief: "Mara Voss: Get in a car and drive to the pier marker.",
    objective: "Enter a vehicle and reach the pier",
    reward: 150,
    target: { x: 480, y: 1248 },
    needVehicle: true,
  },
  {
    id: 2,
    title: "Hot Wheels",
    giver: "Mara Voss",
    brief: "Mara Voss: Bring me a clean car. Watch the heat.",
    objective: "Deliver a car to the garage",
    reward: 250,
    target: { x: 960, y: 480 },
    needVehicle: true,
  },
  {
    id: 3,
    title: "Bay Runner",
    giver: "Mara Voss",
    brief: "Mara Voss: Run the package across the bay, fast.",
    objective: "Reach the drop point on foot or by car",
    reward: 350,
    target: { x: 1440, y: 720 },
    needVehicle: false,
  },
  {
    id: 4,
    title: "Heat Wave",
    giver: "Mara Voss",
    brief: "Mara Voss: Lose the police, then come back to me.",
    objective: "Lose your wanted stars, then return",
    reward: 500,
    target: { x: 720, y: 360 },
    needVehicle: false,
  },
  {
    id: 5,
    title: "Outlaw",
    giver: "Mara Voss",
    brief: "Mara Voss: One last score. Make it count, outlaw.",
    objective: "Reach the final marker and survive",
    reward: 1000,
    target: { x: 1680, y: 240 },
    needVehicle: false,
  },
];

export function createMissionState() {
  return { index: 0, active: true, completed: [], message: MISSIONS[0].brief, giver: "Mara Voss" };
}

export function currentMission(state) {
  if (!state.active || state.index >= MISSIONS.length) return null;
  return MISSIONS[state.index];
}

export function updateMissions(state, player, wanted) {
  const mission = currentMission(state);
  if (!mission) return null;
  if (mission.needVehicle && !player.inVehicle) return null;
  if (mission.id === 4 && wanted > 0) return null;
  const dx = player.x - mission.target.x;
  const dy = player.y - mission.target.y;
  if (dx * dx + dy * dy < 36 * 36) {
    player.money += mission.reward;
    state.completed.push(mission.id);
    state.index += 1;
    if (state.index >= MISSIONS.length) {
      state.active = false;
      state.message = "Mara Voss: You own Solar Bay now.";
    } else {
      state.message = MISSIONS[state.index].brief;
    }
    return mission;
  }
  return null;
}
