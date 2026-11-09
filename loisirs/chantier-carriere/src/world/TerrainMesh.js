// Maillage du terrain déformable : hauteurs et couleurs recalculées quand le terrain change (au plus ~10 fois par seconde).
import * as THREE from 'three';
import { N, CELL, HALF } from '../core/terrain.js';

const C = {
  yard: new THREE.Color('#a39577'), road: new THREE.Color('#6b6a66'), rock: new THREE.Color('#9a9488'), strata: new THREE.Color('#b1a48b'),
  raw: new THREE.Color('#645d52'), gravel: new THREE.Color('#cdbd8d'), edge: new THREE.Color('#7d8a5c'),
};
// route des camions (x ≈ -70) et plateforme du site
export const onRoad = (x, z) => Math.abs(x + 70) < 4.2 || (x > -78 && x < -8 && z > 36 && z < 58 && false);

export class TerrainMesh {
  constructor(scene, terrain) {
    this.t = terrain; this.seen = -1;
    const g = this.geo = new THREE.PlaneGeometry((N - 1) * CELL, (N - 1) * CELL, N - 1, N - 1);
    g.rotateX(-Math.PI / 2);   // plan XZ, +Z vers le sud (z croissant)
    // PlaneGeometry : j (ligne) augmente vers -Z après rotation ; on remet l'ordre j -> +Z
    const p = g.attributes.position;
    for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) p.setXYZ(j * N + i, i * CELL - HALF, 0, j * CELL - HALF);
    const idx = []; for (let j = 0; j < N - 1; j++) for (let i = 0; i < N - 1; i++) { const a = j * N + i, b = a + 1, c = a + N, d = c + 1; idx.push(a, c, b, b, c, d); }
    g.setIndex(idx);
    g.setAttribute('color', new THREE.BufferAttribute(new Float32Array(N * N * 3), 3));
    this.noise = new Float32Array(N * N); for (let k = 0; k < N * N; k++) this.noise[k] = 0.92 + 0.16 * (Math.sin(k * 12.9898) * 43758.5453 % 1 + 1) / 2;
    this.mesh = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 1, metalness: 0 }));
    this.mesh.receiveShadow = true; this.mesh.frustumCulled = false; this.mesh.userData.noLod = true;
    scene.add(this.mesh); this.update(true);
  }
  update(force = false) {
    const t = this.t; if (!force && t.version === this.seen) return false;
    this.seen = t.version;
    const p = this.geo.attributes.position, c = this.geo.attributes.color, col = new THREE.Color();
    for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) {
      const k = j * N + i, H = t.H[k], L = t.L[k], x = i * CELL - HALF;
      p.setY(k, H + L);
      // roche en place : strates par hauteur ; plateau : terre battue / route
      const strat = 0.5 + 0.5 * Math.sin(H * 3.1);
      if (H < 0.05) col.copy(onRoad(x, j * CELL - HALF) ? C.road : C.yard); else col.copy(C.rock).lerp(C.strata, strat * 0.6);
      if (L > 0.02) { const m = Math.min(1, L / 0.35); col.lerp(new THREE.Color().copy(C.raw).lerp(C.gravel, t.G[k]), m); }
      const n = this.noise[k]; c.setXYZ(k, col.r * n, col.g * n, col.b * n);
    }
    p.needsUpdate = true; c.needsUpdate = true; this.geo.computeVertexNormals();
    return true;
  }
}
