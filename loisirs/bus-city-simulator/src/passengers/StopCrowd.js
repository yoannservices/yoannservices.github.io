// Voyageurs qui attendent à l'arrêt actif (instanciés).
import * as THREE from 'three';
import { PERSON_FILE, PERSON_SCALE, loadKit, instanceKit } from '../traffic/Kits.js';

const MAX = 16;

export class StopCrowd {
  constructor(scene) {
    this.body = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.2, 0.23, 1.2, 8), new THREE.MeshStandardMaterial({ color: '#fff' }), MAX);
    this.head = new THREE.InstancedMesh(new THREE.SphereGeometry(0.14, 8, 6), new THREE.MeshStandardMaterial({ color: '#e0b896' }), MAX);
    const pal = ['#c0392b', '#2980b9', '#27ae60', '#8e44ad', '#d35400', '#34495e', '#f1c40f', '#16a085'];
    for (let i = 0; i < MAX; i++) this.body.setColorAt(i, new THREE.Color(pal[(i * 3) % pal.length]));
    for (const m of [this.body, this.head]) { m.frustumCulled = false; m.count = 0; scene.add(m); }
    this.stop = null; this.d = new THREE.Object3D(); this.scene = scene;
    loadKit(PERSON_FILE, PERSON_SCALE).then((kit) => {
      this.real = instanceKit(scene, kit, MAX);
      for (let i = 0; i < MAX; i++) this.real.tint(i, new THREE.Color(pal[(i * 3) % pal.length]));
      for (const m of this.real.meshes) m.instanceColor.needsUpdate = true;
      scene.remove(this.body); scene.remove(this.head);
      this.set(this.stop, this.n ?? 0);
    }).catch((e) => console.warn('Voyageur non chargé', e));
  }
  // n voyageurs autour de l'abri de stop (null = aucun)
  set(stop, n) {
    const shown = stop ? Math.min(n, MAX) : 0, d = this.d;
    this.stop = stop; this.n = n;
    for (let i = 0; i < shown; i++) {
      const along = ((i % 8) - 3.5) * 0.55, lat = -0.5 - Math.floor(i / 8) * 0.6;
      const x = stop.shelter.x + stop.hx * along + -stop.hz * lat, z = stop.shelter.z + stop.hz * along + stop.hx * lat;
      if (this.real) { d.rotation.set(0, Math.atan2(stop.hx, stop.hz), 0); d.position.set(x, 0, z); d.scale.set(1, 1, 1); d.updateMatrix(); this.real.set(i, d.matrix); continue; }
      d.position.set(x, 0.75, z); d.updateMatrix(); this.body.setMatrixAt(i, d.matrix);
      d.position.set(x, 1.5, z); d.updateMatrix(); this.head.setMatrixAt(i, d.matrix);
    }
    if (this.real) { this.real.commit(shown); return; }
    this.body.count = this.head.count = shown;
    this.body.instanceMatrix.needsUpdate = this.head.instanceMatrix.needsUpdate = true;
  }
}
