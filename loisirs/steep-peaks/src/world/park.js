import * as THREE from 'three';
import { PARK, planeY } from './heightmap.js';

// Rails et boîtes du snowpark : segments suivant la pente, utilisés pour les grinds
const DEFS = [
  { x: -30, z0: 45, z1: 85, h: 0.9, kind: 'rail' },
  { x: 30, z0: 100, z1: 130, h: 0.55, kind: 'box', w: 1.6 },
  { x: -10, z0: 105, z1: 140, h: 0.9, kind: 'rail' },
  { x: 30, z0: 175, z1: 205, h: 0.9, kind: 'rail' },
];
export const rails = DEFS.map((d) => {
  const a = new THREE.Vector3(PARK.x + d.x, planeY(PARK.z + d.z0) + d.h, PARK.z + d.z0);
  const b = new THREE.Vector3(PARK.x + d.x, planeY(PARK.z + d.z1) + d.h, PARK.z + d.z1);
  const len = a.distanceTo(b);
  return { a, b, len, dir: b.clone().sub(a).divideScalar(len), r: (d.w || 0.12) / 2 + 0.25, kind: d.kind, w: d.w || 0.12 };
});

export function buildPark(scene) {
  const metal = new THREE.MeshLambertMaterial({ color: 0xcdd6e4 }), box = new THREE.MeshLambertMaterial({ color: 0x3b82f6 });
  const post = new THREE.MeshLambertMaterial({ color: 0xf97316 });
  for (const r of rails) {
    const mid = r.a.clone().add(r.b).multiplyScalar(0.5), g = new THREE.Group();
    const isBox = r.kind === 'box';
    const body = new THREE.Mesh(isBox ? new THREE.BoxGeometry(r.w, 0.22, r.len) : new THREE.CylinderGeometry(0.06, 0.06, r.len, 8), isBox ? box : metal);
    if (isBox) body.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), r.dir);
    else body.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), r.dir);
    body.position.copy(mid);
    g.add(body);
    for (let t = 0; t <= r.len; t += 6) {
      const p = r.a.clone().addScaledVector(r.dir, t);
      const s = new THREE.Mesh(new THREE.BoxGeometry(0.14, p.y - planeY(p.z) + 0.1, 0.14), post);
      s.position.set(p.x, (p.y + planeY(p.z)) / 2, p.z);
      g.add(s);
    }
    scene.add(g);
  }
}
