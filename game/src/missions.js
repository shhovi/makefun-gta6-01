// 5-mission Mara Voss story chain: sequential objectives with dialog lines.
// Objective types: goto a marker, deliver a car, or escape the police.
export const MISSIONS = [
  {
    id: 1,
    title: "First Wheels",
    giver: "Mara Voss",
    objective: "Go to the marker at the boardwalk garage.",
    type: "goto",
    reward: 150,
    dialog: ["Mara: You made it to Solar Bay. Good.", "Mara: I need wheels. Meet me at the boardwalk garage."],
  },
  {
    id: 2,
    title: "Hot Delivery",
    giver: "Mara Voss",
    objective: "Steal a car and deliver it to the docks marker.",
    type: "deliver-car",
    reward: 400,
    dialog: ["Mara: That ride by the pier? It's ours now.", "Mara: Bring it to the docks. Don't scratch it."],
  },
  {
    id: 3,
    title: "Heat Wave",
    giver: "Mara Voss",
    objective: "Lose the police (reach 2 stars, then clear your wanted level).",
    type: "escape-police",
    reward: 600,
    dialog: ["Mara: Cops are sniffing around my crew.", "Mara: Make some noise, then vanish. Show me you can."],
  },
  {
    id: 4,
    title: "Beach Run",
    giver: "Mara Voss",
    objective: "Reach the beach marker on the east coast.",
    type: "goto",
    reward: 500,
    dialog: ["Mara: Package on the beach. East side.", "Mara: Grab it before the tide — or the PD — does."],
  },
  {
    id: 5,
    title: "Solar Bay Outlaw",
    giver: "Mara Voss",
    objective: "Deliver a car to the final marker and clear your wanted level.",
    type: "deliver-car",
    reward: 1500,
    dialog: ["Mara: Last job, outlaw.", "Mara: One car, one clean getaway. Then Solar Bay is yours."],
  },
];

export class MissionChain {
  constructor(startIndex = 0) {
    this.index = startIndex;
    this.phase = "goto"; // goto | deliver | escape | done
    this.sawStars = false;
  }

  get current() {
    return this.index < MISSIONS.length ? MISSIONS[this.index] : null;
  }

  get complete() {
    return this.index >= MISSIONS.length;
  }

  markerFor(city) {
    const m = this.current;
    if (!m) return null;
    // Deterministic marker spots derived from mission id.
    const spots = [
      { tx: 6, ty: 6 }, { tx: 32, ty: 8 }, { tx: 18, ty: 18 },
      { tx: city.waterStartCol - 1, ty: 20 }, { tx: 10, ty: 32 },
    ];
    const s = spots[m.id - 1];
    return { x: s.tx * 48 + 24, y: s.ty * 48 + 24 };
  }

  update(player, wanted, city) {
    const m = this.current;
    if (!m) return null;
    const marker = this.markerFor(city);
    const nearMarker = marker && Math.hypot(player.x - marker.x, player.y - marker.y) < 60;

    if (m.type === "goto" && nearMarker) return this.finish(player);
    if (m.type === "deliver-car" && nearMarker && player.inVehicle) return this.finish(player);
    if (m.type === "escape-police") {
      if (wanted.stars >= 2) this.sawStars = true;
      if (this.sawStars && wanted.stars === 0) return this.finish(player);
    }
    return null;
  }

  finish(player) {
    const m = this.current;
    player.money += m.reward;
    this.index++;
    this.sawStars = false;
    return m;
  }
}
