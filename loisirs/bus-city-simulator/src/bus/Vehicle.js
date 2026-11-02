import { Box3, Matrix4 } from 'three';
import { BUS_TYPES, energyPerMeter } from './BusStats.js';
import { BusPhysics } from './BusPhysics.js';
import { createBusModel } from './BusModel.js';
import { GLTFLoader } from '../../lib/addons/loaders/GLTFLoader.js';
import { fitGLB, purge } from '../../../../assets/glb.js';

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
    this._loadReal();
  }
  // vrai bus (Sketchfab « Generic Town Bus » par own.guest, CC-BY) : remplace le modèle procédural, son intérieur, ses voyageurs et ses portes (supprimés) ; mis à l'échelle de la longueur de chaque type
  _loadReal() {
    const s = this.stats, tilt = this.model.root.children[0];
    const load = new GLTFLoader().loadAsync(new URL('../../assets/models/town-bus.glb', location.href).href);
    window.GameLoader.trackPromise('Modèle 3D town-bus.glb', load).then((g) => {
      const f = fitGLB(g.scene, s.length, Math.PI); f.position.z = s.wheelbase + s.frontOverhang - s.length / 2;
      purge(this.model.root); tilt.add(f);
      // caméras intérieures : le vrai bus est plus bas que les cotes du type (minibus), les ancres suivent sa boîte réelle
      tilt.updateMatrixWorld(true);
      const inv = tilt.matrixWorld.clone().invert(), b = new Box3(), m4 = new Matrix4(), c = new Box3();
      f.traverse((o) => { if (o.isMesh) { o.geometry.computeBoundingBox(); c.copy(o.geometry.boundingBox).applyMatrix4(m4.multiplyMatrices(inv, o.matrixWorld)); b.union(c); } });
      const H = b.max.y, k = s.length / 12;
      this.model.eye.position.set(0.24 * (b.max.x - b.min.x), 0.69 * H, b.max.z - 1.7 * k);
      this.model.eyeInt.position.y = 0.67 * H;
    }).catch((e) => console.warn('Bus non chargé', e));
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
