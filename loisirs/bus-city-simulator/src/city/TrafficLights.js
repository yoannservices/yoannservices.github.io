// Feux tricolores : cycle 38 s par carrefour, déphasage propre à chaque nœud.
import * as THREE from 'three';
import { nodes, DIRS, rightOf, inGrid, axisOfDir } from './grid.js';

export const CYCLE = 38;

// axe 'x' = circulation est-ouest, 'z' = nord-sud. Retourne 'G', 'Y' ou 'R'.
export function lightState(node, axis, t) {
  const tt = (t + node.off) % CYCLE;
  if (axis === 'z') return tt < 14 ? 'G' : tt < 17 ? 'Y' : 'R';
  return tt >= 19 && tt < 33 ? 'G' : tt >= 33 && tt < 36 ? 'Y' : 'R';
}
// secondes avant que l'axe repasse au vert (0 s'il n'est pas rouge)
export function timeToGreen(node, axis, t) {
  const tt = (t + node.off) % CYCLE;
  if (axis === 'z') return tt >= 17 ? CYCLE - tt : 0;
  if (tt < 19) return 19 - tt;
  return tt >= 36 ? CYCLE - tt + 19 : 0;
}

const COLORS = {
  R: ['#ff2a2a', '#2a0a0a'], Y: ['#ffc400', '#2a2200'], G: ['#27e85f', '#052a10'],
};

export class TrafficLights {
  constructor(scene) {
    this.arms = [];
    for (const n of nodes) if (n.type === 'signal') DIRS.forEach((d, k) => {
      if (!inGrid(n.i + d.x, n.j + d.z)) return;
      const r = rightOf({ x: -d.x, z: -d.z });   // côté droit d'une voiture qui arrive (cap -d)
      this.arms.push({ n, k, axis: axisOfDir(k), x: n.x + d.x * 7.5 + r.x * 6.6, z: n.z + d.z * 7.5 + r.z * 6.6, d });
    });
    const N = this.arms.length, dummy = new THREE.Object3D();
    const mk = (geo, mat, count) => { const m = new THREE.InstancedMesh(geo, mat, count); m.frustumCulled = false; scene.add(m); return m; };
    this.poles = mk(new THREE.BoxGeometry(0.2, 4.2, 0.2), new THREE.MeshStandardMaterial({ color: '#333' }), N);
    this.heads = mk(new THREE.BoxGeometry(0.45, 1.3, 0.35), new THREE.MeshStandardMaterial({ color: '#111' }), N);
    this.bulbs = mk(new THREE.SphereGeometry(0.16, 8, 6), new THREE.MeshBasicMaterial({ color: '#fff' }), N * 3);
    this.arms.forEach((a, i) => {
      dummy.rotation.set(0, Math.atan2(a.d.x, a.d.z), 0); dummy.scale.set(1, 1, 1);
      dummy.position.set(a.x, 2.1, a.z); dummy.updateMatrix(); this.poles.setMatrixAt(i, dummy.matrix);
      dummy.position.set(a.x, 4.5, a.z); dummy.updateMatrix(); this.heads.setMatrixAt(i, dummy.matrix);
      [4.9, 4.5, 4.1].forEach((y, b) => {
        dummy.position.set(a.x + a.d.x * 0.2, y, a.z + a.d.z * 0.2); dummy.updateMatrix(); this.bulbs.setMatrixAt(i * 3 + b, dummy.matrix);
      });
    });
    this.cache = new Map();
    this.byNode = new Map();
    this.arms.forEach((a, i) => { const k = a.n.idx; if (!this.byNode.has(k)) this.byNode.set(k, []); this.byNode.get(k).push(i); });
    this.update(0, true);
  }

  update(t, force = false) {
    let dirty = false;
    for (const [idx, arms] of this.byNode) {
      const n = nodes[idx];
      for (const axis of ['x', 'z']) {
        const s = lightState(n, axis, t), key = idx + axis;
        if (!force && this.cache.get(key) === s) continue;
        this.cache.set(key, s); dirty = true;
        for (const i of arms) if (this.arms[i].axis === axis) {
          ['R', 'Y', 'G'].forEach((c, b) => this.bulbs.setColorAt(i * 3 + b, new THREE.Color(COLORS[c][s === c ? 0 : 1])));
        }
      }
    }
    if (dirty) this.bulbs.instanceColor.needsUpdate = true;
  }
}
