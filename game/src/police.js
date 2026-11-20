// Police & wanted system: stars, chase cars, busted (stopped + surrounded), wasted on death.
// More stars spawn more cruisers; heat decays when no cruiser is active.
import { POLICE_SPEED } from "./config.js";
import { Car } from "./vehicles.js";

export class WantedSystem {
  constructor() {
    this.stars = 0;
    this.heat = 0;
    this.bustedTimer = 0;
    this.policeCars = [];
  }

  addCrime(amount) {
    this.heat = Math.min(5, this.heat + amount);
    this.stars = Math.ceil(this.heat);
  }

  clear() {
    this.stars = 0;
    this.heat = 0;
    this.bustedTimer = 0;
    this.policeCars = [];
  }

  update(dt, player, city, rng) {
    // Heat decays slowly when no police can see the player.
    if (this.stars > 0 && this.policeCars.length === 0) {
      this.heat = Math.max(0, this.heat - dt * 0.05);
      this.stars = Math.ceil(this.heat);
    }

    // Spawn police to match star level.
    const desired = this.stars === 0 ? 0 : 1 + this.stars;
    while (this.policeCars.length < desired && city.roadTiles.length > 0) {
      const t = rng.pick(city.roadTiles);
      const car = new Car(t.tx * 48 + 24, t.ty * 48 + 24, 0, "#f4f4f4", { isPolice: true });
      car.sirenOn = true;
      this.policeCars.push(car);
    }
    if (this.stars === 0) this.policeCars = [];

    // Chase: steer toward the player.
    let nearbyStopped = 0;
    const playerSpeed = player.vehicle ? Math.abs(player.vehicle.speed) : 0;
    for (const cop of this.policeCars) {
      const dx = player.x - cop.x;
      const dy = player.y - cop.y;
      const dist = Math.hypot(dx, dy);
      const targetAngle = Math.atan2(dy, dx);
      let diff = targetAngle - cop.angle;
      while (diff > Math.PI) diff -= Math.PI * 2;
      while (diff < -Math.PI) diff += Math.PI * 2;
      cop.angle += Math.max(-2.8 * dt, Math.min(2.8 * dt, diff));
      cop.speed = dist > 60 ? POLICE_SPEED : POLICE_SPEED * 0.4;
      cop.x += Math.cos(cop.angle) * cop.speed * dt;
      cop.y += Math.sin(cop.angle) * cop.speed * dt;
      if (dist < 70 && playerSpeed < 15) nearbyStopped++;
    }

    // Busted: player stopped and surrounded for 2 seconds.
    if (nearbyStopped >= 2 && playerSpeed < 15) {
      this.bustedTimer += dt;
    } else {
      this.bustedTimer = Math.max(0, this.bustedTimer - dt);
    }
    return this.bustedTimer >= 2 ? "busted" : null;
  }
}
