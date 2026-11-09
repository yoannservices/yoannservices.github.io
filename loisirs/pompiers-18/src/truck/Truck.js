// Engins : physique, vrai modèle .glb, gyrophares bleus. Le FPT porte la citerne, le VSAV le brancard.
// FPT : npc/veh-fire_truck.glb, VSAV : npc/veh-ambulance.glb (pack « Generic civil service vehicles », Comrade1280, CC-BY).
import * as THREE from 'three';
import { TruckPhysics } from './TruckPhysics.js';
import { loadGLB, fitGLB } from '../../../../assets/glb.js';
import { WaterSupply } from '../firefighter/water.js';
import { Ladder } from './Ladder.js';
import { Cockpit } from './Cockpit.js';
import { groundY } from '../city/grid.js';

// Le pack npc marque la carrosserie et les autocollants « transparents » (opacité 1, sans écriture de profondeur) :
// on voyait à travers (roues, sol, tracé GPS). Opaques avec découpe alpha ; seules les vitres restent transparentes.
export function fixMaterials(root) {
  root.traverse((o) => {
    if (!o.isMesh) return;
    for (const m of [].concat(o.material)) {
      if (m.transparent && m.opacity >= 0.99) { m.transparent = false; m.depthWrite = true; m.alphaTest = 0.5; }
      if (!m.transparent) m.side = THREE.DoubleSide;   // vue cabine : l'intérieur de la caisse cache les roues et le sol
      m.needsUpdate = true;
    }
  });
}

export const FPT = {
  name: 'FPT', length: 8.2, width: 2.5, height: 3.2, wheelbase: 4.3, frontOverhang: 1.5, cabH: 3.15,
  mass: 15000, power: 250, maxSpeed: 25, maxAccel: 1.5, brake: 6.5, turnRadius: 9.5, rollGain: 0.012,
  model: '../../assets/models/npc/veh-fire_truck.glb', color: '#b3121b', barZ: 1.3,
};
// EPA : même porteur que le FPT, grande échelle en primitives (Ladder.js)
export const EPA = {
  name: 'EPA', length: 9.4, width: 2.5, height: 3.4, wheelbase: 4.9, frontOverhang: 1.5, cabH: 3.15, deckH: 2.75,
  mass: 16500, power: 240, maxSpeed: 24, maxAccel: 1.3, brake: 6.2, turnRadius: 10.5, rollGain: 0.011,
  model: '../../assets/models/npc/veh-fire_truck.glb', color: '#b3121b', ladder: true, barZ: 1.5,
};
export const VSAV = {
  name: 'VSAV', length: 6.4, width: 2.2, height: 2.8, wheelbase: 3.7, frontOverhang: 1.0, cabH: 2.75,
  mass: 4500, power: 130, maxSpeed: 31, maxAccel: 2.2, brake: 7.5, turnRadius: 7, rollGain: 0.016,
  model: '../../assets/models/npc/veh-ambulance.glb', color: '#e8e8e8', barZ: 2.0,
};

export class Truck {
  constructor(scene, spec = FPT) {
    this.s = spec; this.phys = new TruckPhysics(spec);
    this.siren = false; this.water = spec === FPT ? new WaterSupply() : null;
    this.root = new THREE.Group(); this.tilt = new THREE.Group(); this.root.add(this.tilt); scene.add(this.root);
    const zMid = spec.wheelbase + spec.frontOverhang - spec.length / 2;
    // boîte de collision dans le repère de l'engin (x = gauche, z = avant), recalée sur le vrai modèle au chargement
    this.box = { x0: -spec.width / 2, x1: spec.width / 2, z0: zMid - spec.length / 2, z1: zMid + spec.length / 2, top: spec.height };
    this.temp = new THREE.Mesh(new THREE.BoxGeometry(spec.width, spec.height - 0.5, spec.length), new THREE.MeshStandardMaterial({ color: spec.color }));
    this.temp.position.set(0, spec.height / 2 + 0.25, zMid); this.tilt.add(this.temp);
    // gyrophares : rampe sur la cabine + feux à éclats de calandre, lumières ponctuelles alternées
    this.bar = [];
    const zf = spec.wheelbase + spec.frontOverhang;
    const mk = (x, y, z) => {
      const m = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.16, 0.28), new THREE.MeshStandardMaterial({ color: '#0b2a8a', emissive: '#2a6bff', emissiveIntensity: 0 }));
      m.position.set(x, y, z); this.tilt.add(m); this.bar.push(m);
    };
    mk(-0.6, spec.cabH + 0.1, zf - 1.3); mk(0.6, spec.cabH + 0.1, zf - 1.3); mk(-0.85, 1.05, zf + 0.04); mk(0.85, 1.05, zf + 0.04);
    this.flash = [new THREE.PointLight('#3b7bff', 0, 26, 1.6), new THREE.PointLight('#3b7bff', 0, 26, 1.6)];
    this.flash[0].position.set(-1, spec.cabH + 0.5, zf - 1.3); this.flash[1].position.set(1, spec.cabH + 0.5, zf - 1.3);
    this.tilt.add(...this.flash);
    this._load(zMid);
    if (spec.ladder) this.ladder = new Ladder(this);
    this.cockpit = new Cockpit(this);
  }

  _load(zMid) {
    const s = this.s;
    loadGLB(new URL(s.model, location.href).href).then((scene) => {
      fixMaterials(scene);
      const f = fitGLB(scene, s.length, 0); f.position.z = zMid;
      f.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
      this.tilt.remove(this.temp); this.tilt.add(f);
      this.model = f;
      // boîte de collision = emprise exacte du modèle (repère de l'engin)
      this.tilt.updateMatrixWorld(true);
      const inv = this.tilt.matrixWorld.clone().invert(), v = new THREE.Vector3();
      const bx = { x0: Infinity, x1: -Infinity, z0: Infinity, z1: -Infinity, top: 0 };
      f.traverse((o) => { if (!o.isMesh) return; const p = o.geometry.attributes.position, m = inv.clone().multiply(o.matrixWorld); for (let i = 0; i < p.count; i++) { v.fromBufferAttribute(p, i).applyMatrix4(m); bx.x0 = Math.min(bx.x0, v.x); bx.x1 = Math.max(bx.x1, v.x); bx.z0 = Math.min(bx.z0, v.z); bx.z1 = Math.max(bx.z1, v.z); bx.top = Math.max(bx.top, v.y); } });
      this.box = bx; s.width = bx.x1 - bx.x0;   // les cercles de collision (trafic, bâtiments) prennent la vraie largeur
      // gyrophares posés sur la carrosserie par lancer de rayons (repère de l'engin) : rampe sur le toit de cabine, feux de calandre
      const ray = new THREE.Raycaster(), meshes = []; f.traverse((o) => { if (o.isMesh) meshes.push(o); });
      const hit = (o, d) => { ray.set(o.applyMatrix4(this.tilt.matrixWorld), d.transformDirection(this.tilt.matrixWorld)); const h = ray.intersectObjects(meshes, false)[0]; return h ? h.point.applyMatrix4(inv) : null; };
      const zb = bx.z1 - s.barZ;
      this.bar.slice(0, 2).forEach((m, k) => { const h = hit(new THREE.Vector3(k ? 0.55 : -0.55, bx.top + 1, zb), new THREE.Vector3(0, -1, 0)); m.position.set(k ? 0.55 : -0.55, (h ? h.y : bx.top) + 0.08, zb); });
      this.bar.slice(2).forEach((m, k) => { const x = k ? 0.75 : -0.75, h = hit(new THREE.Vector3(x, 1.0, bx.z1 + 1), new THREE.Vector3(0, 0, -1)); m.position.set(x, 1.0, (h ? h.z : bx.z1) - 0.08); });   // encastrés dans la calandre
      for (const l of this.flash) { l.position.y = this.bar[0].position.y + 0.4; l.position.z = zb; }
    }).catch((e) => console.warn(`${s.name} non chargé`, e));
  }

  // repousse un cercle (x, z, rayon r) hors de la boîte de l'engin ; renvoie { x, z, hit }
  pushOut(x, z, r) {
    const p = this.phys, c = Math.cos(p.heading), sn = Math.sin(p.heading), b = this.box;
    const dx = x - p.x, dz = z - p.z, lx = dx * c - dz * sn, lz = dx * sn + dz * c;
    if (lx < b.x0 - r || lx > b.x1 + r || lz < b.z0 - r || lz > b.z1 + r) return { x, z, hit: false };
    const pen = [[lx - (b.x0 - r), 'x0'], [b.x1 + r - lx, 'x1'], [lz - (b.z0 - r), 'z0'], [b.z1 + r - lz, 'z1']].sort((u, w) => u[0] - w[0])[0][1];
    const nx = pen === 'x0' ? b.x0 - r : pen === 'x1' ? b.x1 + r : lx, nz = pen === 'z0' ? b.z0 - r : pen === 'z1' ? b.z1 + r : lz;
    return { x: p.x + nx * c + nz * sn, z: p.z - nx * sn + nz * c, hit: true };
  }
  // distance d'un point à la boîte (0 dedans)
  boxDist(x, z) {
    const p = this.phys, c = Math.cos(p.heading), sn = Math.sin(p.heading), b = this.box;
    const dx = x - p.x, dz = z - p.z, lx = dx * c - dz * sn, lz = dx * sn + dz * c;
    return Math.hypot(Math.max(b.x0 - lx, 0, lx - b.x1), Math.max(b.z0 - lz, 0, lz - b.z1));
  }
  // centre de la boîte en monde
  center() { const p = this.phys, b = this.box, lx = (b.x0 + b.x1) / 2, lz = (b.z0 + b.z1) / 2; return { x: p.x + lx * Math.cos(p.heading) + lz * Math.sin(p.heading), z: p.z - lx * Math.sin(p.heading) + lz * Math.cos(p.heading) }; }

  place(x, z, heading) { this.phys.reset(x, z, heading); this.gy = groundY(x, z); this.sync(); }
  setSiren(on) { this.siren = on; }

  // points utiles en monde : arrière (lance, brancard), portière conducteur (gauche)
  rearPoint() { const p = this.phys, b = -this.s.length + this.s.wheelbase + this.s.frontOverhang - 0.6; return { x: p.x + Math.sin(p.heading) * b, z: p.z + Math.cos(p.heading) * b }; }
  cabDoor() {
    const p = this.phys, f = this.s.wheelbase + 0.4, side = this.s.width / 2 + 0.9;
    return { x: p.x + Math.sin(p.heading) * f + Math.cos(p.heading) * side, z: p.z + Math.cos(p.heading) * f - Math.sin(p.heading) * side };
  }

  sync() {
    const p = this.phys;
    this.root.position.set(p.x, this.gy ?? 0, p.z); this.root.rotation.y = p.heading;   // posé sur la chaussée, le trottoir ou la cour
    this.tilt.rotation.set(p.pitch, 0, -p.roll);
  }

  update(dt, time, lights = true, cabin = false) {
    this.gy += (groundY(this.phys.x, this.phys.z) - this.gy) * Math.min(1, dt * 8);   // montée de trottoir adoucie
    this.sync();
    this.cockpit.update(dt, cabin);
    const on = this.siren, a = on && Math.floor(time * 6) % 2 === 0, b = on && !a;
    this.bar.forEach((m, i) => { m.material.emissiveIntensity = (i % 2 === 0 ? a : b) ? 6 : 0; });
    this.flash[0].intensity = lights && a ? 60 : 0; this.flash[1].intensity = lights && b ? 60 : 0;
  }
}
