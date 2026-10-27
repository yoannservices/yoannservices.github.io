// Voyageurs qui attendent à l'arrêt actif (instanciés).
import * as THREE from 'three';

const MAX = 16;

export class StopCrowd {
  constructor(scene) {
    this.body = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.2, 0.23, 1.2, 8), new THREE.MeshStandardMaterial({ color: '#fff' }), MAX);
    this.head = new THREE.InstancedMesh(new THREE.SphereGeometry(0.14, 8, 6), new THREE.MeshStandardMaterial({ color: '#e0b896' }), MAX);
    const pal = ['#c0392b', '#2980b9', '#27ae60', '#8e44ad', '#d35400', '#34495e', '#f1c40f', '#16a085'];
    for (let i = 0; i < MAX; i++) this.body.setColorAt(i, new THREE.Color(pal[(i * 3) % pal.length]));
    for (const m of [this.body, this.head]) { m.frustumCulled = false; m.count = 0; scene.add(m); }
    this.stop = null; this.d = new THREE.Object3D();
  }
  // n voyageurs autour de l'abri de stop (null = aucun)
  set(stop, n) {
    const shown = stop ? Math.min(n, MAX) : 0, d = this.d;
    for (let i = 0; i < shown; i++) {
      const along = ((i % 8) - 3.5) * 0.55, lat = -0.5 - Math.floor(i / 8) * 0.6;
      const x = stop.shelter.x + stop.hx * along + -stop.hz * lat, z = stop.shelter.z + stop.hz * along + stop.hx * lat;
      d.position.set(x, 0.75, z); d.updateMatrix(); this.body.setMatrixAt(i, d.matrix);
      d.position.set(x, 1.5, z); d.updateMatrix(); this.head.setMatrixAt(i, d.matrix);
    }
    this.body.count = this.head.count = shown;
    this.body.instanceMatrix.needsUpdate = this.head.instanceMatrix.needsUpdate = true;
  }
}
