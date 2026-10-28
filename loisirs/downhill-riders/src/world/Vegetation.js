/* Végétation et rochers : géométries fusionnées (une par type), placées en InstancedMesh par segment de terrain. */
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { hash2 } from '../core/rng.js';

const col = (g, hex) => { const c = new THREE.Color(hex), n = g.attributes.position.count, a = new Float32Array(n * 3); for (let i = 0; i < n; i++) { a[i * 3] = c.r; a[i * 3 + 1] = c.g; a[i * 3 + 2] = c.b; } g.setAttribute('color', new THREE.BufferAttribute(a, 3)); return g; };
const cone = (r, h, y, hex, seg = 7) => col(new THREE.ConeGeometry(r, h, seg).translate(0, y + h / 2, 0), hex);
const cyl = (r1, r2, h, y, hex, seg = 6) => col(new THREE.CylinderGeometry(r2, r1, h, seg).translate(0, y + h / 2, 0), hex);
const ball = (r, x, y, z, hex, sy = 1) => col(new THREE.IcosahedronGeometry(r, 1).scale(1, sy, 1).translate(x, y, z), hex);
const merge = (parts) => { const g = mergeGeometries(parts.map((p) => (p.index ? p.toNonIndexed() : p))); g.computeVertexNormals(); return g; };

function rockGeo(hex) {
  const g = new THREE.IcosahedronGeometry(1, 1), p = g.attributes.position;
  for (let i = 0; i < p.count; i++) { const k = 0.75 + 0.5 * hash2(Math.round(p.getX(i) * 50), Math.round(p.getY(i) * 50) + Math.round(p.getZ(i) * 50), 4); p.setXYZ(i, p.getX(i) * k, p.getY(i) * k * 0.8, p.getZ(i) * k); }
  g.translate(0, 0.45, 0); return col(g, hex);
}

const GEO = {
  pine: () => merge([cyl(0.35, 0.22, 2.2, 0, '#5b3d22'), cone(2.1, 3.2, 1.6, '#1f5a2a'), cone(1.6, 2.8, 3.2, '#266b33'), cone(1.1, 2.4, 4.8, '#2e7a3b'), cone(0.6, 1.6, 6.2, '#36894a')]),
  snowpine: () => merge([cyl(0.35, 0.22, 2.2, 0, '#4a3524'), cone(2.1, 3.2, 1.6, '#e9f1f7'), cone(1.6, 2.8, 3.2, '#dbe7ef'), cone(1.1, 2.4, 4.8, '#eef5fa'), cone(0.6, 1.6, 6.2, '#fff')]),
  oak: () => merge([cyl(0.4, 0.26, 3.2, 0, '#5a3b20'), ball(2, 0, 4.4, 0, '#3f8a34', 0.85), ball(1.5, 1.2, 3.8, 0.5, '#4a9a3c'), ball(1.4, -1.1, 4, -0.5, '#357a2c')]),
  bush: () => merge([ball(0.8, 0, 0.5, 0, '#3f7d32', 0.7), ball(0.6, 0.6, 0.4, 0.3, '#4c8f3a', 0.7)]),
  cactus: () => merge([cyl(0.35, 0.3, 3.4, 0, '#4f8a43', 8), cyl(0.2, 0.18, 1.2, 1.4, '#4f8a43', 6).translate(0.7, 0, 0), cyl(0.2, 0.18, 1.6, 1.8, '#4f8a43', 6).translate(-0.7, 0, 0)]),
  dead: () => merge([cyl(0.28, 0.12, 3.4, 0, '#4a3a30'), cyl(0.12, 0.06, 1.6, 1.8, '#4a3a30').rotateZ(0.9).translate(0.4, 0, 0), cyl(0.1, 0.05, 1.3, 2.4, '#4a3a30').rotateZ(-1).translate(-0.3, 0, 0)]),
  rock: () => rockGeo('#8a8a86'),
  lava: () => rockGeo('#2c2224'),
};
const mats = {};
const material = (kind) => mats[kind] || (mats[kind] = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.95, flatShading: kind !== 'oak' && kind !== 'bush', ...(kind === 'lava' ? { emissive: 0xff4a10, emissiveIntensity: 0.18 } : {}) }));
const geos = {};
const geo = (kind) => geos[kind] || (geos[kind] = GEO[kind]());

const SCALE = { pine: [0.8, 1.5], snowpine: [0.8, 1.5], oak: [0.8, 1.3], bush: [0.7, 1.5], cactus: [0.7, 1.4], dead: [0.8, 1.4], rock: [0.5, 2.2], lava: [0.5, 2.2] };
const TMP = new THREE.Object3D(), COL = new THREE.Color();

/* Cases de 6 m dans le segment [cx, cz] ; densité d par case et par type ; jamais sur la piste. */
export function* buildVegetation(track, biome, cx, cz, size = 40) {
  const out = [], x0 = cx * size, z0 = cz * size, cell = 6, n = Math.ceil(size / cell), lists = {};
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
    if (j === 0 && i % 2 === 1) yield;
    biome.veg.forEach((v, vi) => {
      const h = hash2(cx * n + i, cz * n + j, 100 + vi);
      if (h > v.d * 6) return;
      const x = x0 + (i + hash2(cx * n + i, cz * n + j, 200 + vi)) * cell, z = z0 + (j + hash2(cx * n + i, cz * n + j, 300 + vi)) * cell;
      const q = track.query(x, z); if (!q) return;
      const clear = v.kind === 'rock' || v.kind === 'lava' || v.kind === 'bush' ? 0.8 : 2.4;
      if (Math.abs(q.dlat) < q.hw + clear || q.kind === 4) return;
      (lists[v.kind] || (lists[v.kind] = [])).push([x, track.height(x, z) - 0.1, z, hash2(i, j, 400 + vi)]);
    });
  }
  for (const kind in lists) {
    const arr = lists[kind], im = new THREE.InstancedMesh(geo(kind), material(kind), arr.length), [s0, s1] = SCALE[kind];
    arr.forEach(([x, y, z, r], k) => {
      const s = s0 + (s1 - s0) * r; TMP.position.set(x, y, z); TMP.rotation.set(0, r * 40, kind === 'rock' || kind === 'lava' ? r * 0.4 : 0); TMP.scale.set(s, s * (0.9 + r * 0.3), s); TMP.updateMatrix(); im.setMatrixAt(k, TMP.matrix);
      im.setColorAt(k, COL.setHSL(0, 0, 0.82 + 0.3 * ((r * 7) % 1)));
    });
    im.castShadow = kind !== 'bush'; im.instanceMatrix.needsUpdate = true; if (im.instanceColor) im.instanceColor.needsUpdate = true;
    out.push(im);
  }
  return out;
}

/* Rochers placés par le générateur (sections techniques) : un seul InstancedMesh pour toute la descente */
export function buildObstacleMeshes(track, biome) {
  if (!track.obstacles.length) return null;
  const hex = new THREE.Color().setRGB(...biome.rock), im = new THREE.InstancedMesh(rockGeo('#' + hex.getHexString()), new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.95, flatShading: true }), track.obstacles.length);
  track.obstacles.forEach((o, k) => { TMP.position.set(o.x, track.height(o.x, o.z) - 0.12, o.z); TMP.rotation.set(0, k * 1.7, 0); TMP.scale.set(o.r * 1.15, o.h * 1.25, o.r * 1.15); TMP.updateMatrix(); im.setMatrixAt(k, TMP.matrix); });
  im.castShadow = true; return im;
}
export const disposeVegetation = (list) => list.forEach((m) => { m.dispose(); });
