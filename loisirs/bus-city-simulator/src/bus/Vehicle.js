import { BUS_TYPES, energyPerMeter } from './BusStats.js';
import { BusPhysics } from './BusPhysics.js';
import { createBusModel } from './BusModel.js';

// Un bus en service : stats + physique + modèle + énergie (carburant ou batterie, 0..1).
export class Vehicle {
  constructor(id, scene, energy = 1) {
    this.id = id; this.stats = BUS_TYPES[id];
    this.phys = new BusPhysics(this.stats);
    this.model = createBusModel(this.stats);
    this.energy = energy;
    this.lights = false;
    this.perM = energyPerMeter(this.stats);
    this.scene = scene;
    scene.add(this.model.root);
  }
  place(x, z, heading) { this.phys.reset(x, z, heading); }
  burn(dt) { this.energy = Math.max(0, this.energy - Math.abs(this.phys.speed) * dt * this.perM); }
  dispose() {
    this.scene.remove(this.model.root);
    this.model.root.traverse((o) => {
      o.geometry?.dispose?.();
      for (const m of [].concat(o.material ?? [])) { m.map?.dispose?.(); m.dispose?.(); }
    });
  }
}
