/* Décor procédural : arbres (InstancedMesh), rochers, spectateurs, bottes de paille, glissières, barrières.
   Les pièces statiques d'un tronçon sont fusionnées en un seul maillage (StaticBatch). */
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { chevronTexture } from '../surfaces/textures.js';

const lin = (r, g, b) => new THREE.Color().setRGB(r, g, b, THREE.SRGBColorSpace);

/* géométrie non indexée avec couleur de sommet uniforme (sRGB) */
function paint(geo, rgb) {
  const g = geo.index ? geo.toNonIndexed() : geo, c = lin(...rgb), n = g.attributes.position.count, a = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) { a[i * 3] = c.r; a[i * 3 + 1] = c.g; a[i * 3 + 2] = c.b; }
  g.setAttribute('color', new THREE.BufferAttribute(a, 3));
  if (!g.attributes.uv) g.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(n * 2), 2));
  return g;
}
// déformation pseudo-aléatoire stable (mêmes sommets = même déplacement)
function jitter(geo, amt) {
  const p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), y = p.getY(i), z = p.getZ(i);
    const h = Math.sin(x * 12.9898 + y * 78.233 + z * 37.719) * 43758.5453, h2 = Math.sin(x * 39.3468 + y * 11.135 + z * 83.155) * 24634.6345, h3 = Math.sin(x * 73.156 + y * 52.235 + z * 9.151) * 51341.123;
    p.setXYZ(i, x + ((h - Math.floor(h)) - 0.5) * amt, y + ((h2 - Math.floor(h2)) - 0.5) * amt, z + ((h3 - Math.floor(h3)) - 0.5) * amt);
  }
  geo.computeVertexNormals(); return geo;
}
const at = (geo, x, y, z) => geo.translate(x, y, z);

function conifer(colors, trunk = [0.25, 0.16, 0.1], tiers = 4, height = 8) {
  const parts = [paint(at(new THREE.CylinderGeometry(0.2, 0.3, 1.8, 6), 0, 0.9, 0), trunk)];
  const th = height / tiers * 1.5;
  for (let i = 0; i < tiers; i++) {
    const r = 2.2 * (1 - i / (tiers + 0.6)), y = 1.4 + i * (height - 2.5) / tiers + th / 2;
    parts.push(paint(jitter(at(new THREE.ConeGeometry(r, th, 8, 1), 0, y, 0), 0.25), colors[Math.min(colors.length - 1, i)]));
  }
  return mergeGeometries(parts);
}
function blob(r, sx, sy, sz, x, y, z, rgb, det = 1) { return paint(jitter(at(new THREE.IcosahedronGeometry(r, det).scale(sx, sy, sz), x, y, z), r * 0.28), rgb); }

const TREES = {
  sapin: () => conifer([[0.05, 0.2, 0.09], [0.06, 0.24, 0.1], [0.07, 0.27, 0.11], [0.09, 0.3, 0.12]]),
  sapinclair: () => conifer([[0.14, 0.34, 0.12], [0.17, 0.38, 0.14], [0.2, 0.42, 0.16], [0.24, 0.46, 0.18]], [0.3, 0.2, 0.12], 4, 7),
  sapinneige: () => conifer([[0.16, 0.3, 0.22], [0.5, 0.62, 0.58], [0.82, 0.88, 0.9], [0.95, 0.97, 0.98]], [0.25, 0.17, 0.12], 4, 8),
  feuillu: () => mergeGeometries([
    paint(at(new THREE.CylinderGeometry(0.22, 0.32, 3.6, 6), 0, 1.8, 0), [0.28, 0.2, 0.13]),
    blob(2.4, 1, 0.9, 1, 0, 4.9, 0, [0.16, 0.34, 0.09]), blob(1.7, 1, 0.9, 1, 1.5, 4.0, 0.4, [0.2, 0.4, 0.1]), blob(1.6, 1, 0.9, 1, -1.3, 4.2, -0.6, [0.14, 0.3, 0.08]),
  ]),
  cypres: () => mergeGeometries([
    paint(at(new THREE.CylinderGeometry(0.12, 0.17, 1.4, 6), 0, 0.7, 0), [0.28, 0.2, 0.13]),
    blob(1, 0.78, 4.4, 0.78, 0, 4.4, 0, [0.06, 0.2, 0.1]),
  ]),
  olivier: () => mergeGeometries([
    paint(at(new THREE.CylinderGeometry(0.18, 0.3, 1.6, 6), 0.1, 0.8, 0), [0.32, 0.26, 0.2]),
    blob(2.0, 1.3, 0.75, 1.2, 0, 2.5, 0, [0.4, 0.5, 0.3]), blob(1.3, 1.1, 0.7, 1.1, 1.1, 2.2, 0.5, [0.47, 0.56, 0.35]),
  ]),
};
export const TREE_H = { sapin: 8, sapinclair: 7, sapinneige: 8, feuillu: 6.5, cypres: 8, olivier: 4 };
export const TREE_R = { sapin: 0.3, sapinclair: 0.3, sapinneige: 0.3, feuillu: 0.35, cypres: 0.25, olivier: 0.35 };

let LIB = null;
/* ressources partagées, créées à la demande */
export function lib() {
  if (LIB) return LIB;
  const treeMat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.95 });
  const geos = {};
  for (const k in TREES) geos[k] = TREES[k]();
  const rock = paint(jitter(new THREE.IcosahedronGeometry(1, 1).scale(1, 0.75, 1), 0.5), [0.5, 0.49, 0.46]);
  const body = paint(at(new THREE.CylinderGeometry(0.2, 0.26, 0.95, 6), 0, 0.72, 0), [1, 1, 1]);
  const head = paint(at(new THREE.SphereGeometry(0.16, 8, 6), 0, 1.38, 0), [0.88, 0.68, 0.54]);
  LIB = {
    treeMat, treeGeo: geos,
    rockGeo: rock, rockMat: new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 1 }),
    bodyGeo: body, headGeo: head,
    bodyMat: new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.9 }),
    headMat: new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.8 }),
    staticMat: new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.75, metalness: 0.15 }),
    signMat: [-1, 1].map((d) => new THREE.MeshStandardMaterial({ map: chevronTexture(d), roughness: 0.6, side: THREE.DoubleSide })),
    signGeo: new THREE.PlaneGeometry(0.9, 1.7),
  };
  return LIB;
}

/* Lot de pièces statiques fusionnées : boîtes orientées, cylindres couchés. */
export class StaticBatch {
  constructor() { this.parts = []; this.m = new THREE.Matrix4(); this.q = new THREE.Quaternion(); this.e = new THREE.Euler(); }
  box(x, y, z, sx, sy, sz, heading, rgb, pitch = 0) {
    const g = new THREE.BoxGeometry(sx, sy, sz);
    this.e.set(pitch, heading, 0, 'YXZ'); this.q.setFromEuler(this.e);
    this.m.compose(new THREE.Vector3(x, y, z), this.q, new THREE.Vector3(1, 1, 1)); g.applyMatrix4(this.m);
    this.parts.push(paint(g, rgb)); return this;
  }
  bale(x, y, z, heading, rgb = [0.82, 0.68, 0.28]) {
    const g = new THREE.CylinderGeometry(0.5, 0.5, 1.0, 10);
    this.e.set(0, heading, Math.PI / 2, 'YXZ'); this.q.setFromEuler(this.e);
    this.m.compose(new THREE.Vector3(x, y + 0.5, z), this.q, new THREE.Vector3(1, 1, 1)); g.applyMatrix4(this.m);
    this.parts.push(paint(g, rgb)); return this;
  }
  build() {
    if (!this.parts.length) return null;
    const mesh = new THREE.Mesh(mergeGeometries(this.parts), lib().staticMat);
    mesh.castShadow = true; mesh.receiveShadow = true; this.parts.forEach((p) => p.dispose()); this.parts = [];
    return mesh;
  }
}

/* InstancedMesh d'un type d'arbre ; placements : [{x, y, z, s, r}] ; tint légère par instance */
export function instancedTrees(kind, items, tintBase = [1, 1, 1]) {
  const L = lib(), mesh = new THREE.InstancedMesh(L.treeGeo[kind], L.treeMat, items.length);
  const m = new THREE.Matrix4(), q = new THREE.Quaternion(), c = new THREE.Color();
  items.forEach((it, i) => {
    q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), it.r); m.compose(new THREE.Vector3(it.x, it.y, it.z), q, new THREE.Vector3(it.s, it.s * (0.9 + (it.r % 0.3)), it.s));
    mesh.setMatrixAt(i, m); const v = 0.82 + (it.r * 7 % 1) * 0.3; c.setRGB(tintBase[0] * v, tintBase[1] * v, tintBase[2] * (0.9 + v * 0.1)); mesh.setColorAt(i, c);
  });
  mesh.castShadow = true; mesh.frustumCulled = false; mesh.instanceMatrix.needsUpdate = true; if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  return mesh;
}
export function instancedRocks(items, tint) {
  const L = lib(), mesh = new THREE.InstancedMesh(L.rockGeo, L.rockMat, items.length);
  const m = new THREE.Matrix4(), q = new THREE.Quaternion(), c = new THREE.Color();
  items.forEach((it, i) => {
    q.setFromEuler(new THREE.Euler(it.r * 0.3, it.r * 6, it.r * 0.2)); m.compose(new THREE.Vector3(it.x, it.y + it.s * 0.2, it.z), q, new THREE.Vector3(it.s, it.s * (0.7 + (it.r * 5 % 1) * 0.5), it.s * (0.8 + (it.r * 3 % 1) * 0.5)));
    mesh.setMatrixAt(i, m); const v = 0.75 + (it.r * 11 % 1) * 0.4; c.setRGB(tint[0] * v, tint[1] * v, tint[2] * v); mesh.setColorAt(i, c);
  });
  mesh.castShadow = true; mesh.frustumCulled = false; if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  return mesh;
}
const JACKETS = [[0.9, 0.2, 0.2], [0.2, 0.4, 0.9], [0.95, 0.8, 0.2], [0.2, 0.7, 0.4], [0.9, 0.5, 0.15], [0.85, 0.85, 0.9], [0.55, 0.25, 0.7], [0.2, 0.2, 0.25]];
export function spectators(items) {
  const L = lib(), g = new THREE.Group();
  const body = new THREE.InstancedMesh(L.bodyGeo, L.bodyMat, items.length), head = new THREE.InstancedMesh(L.headGeo, L.headMat, items.length);
  const m = new THREE.Matrix4(), q = new THREE.Quaternion(), c = new THREE.Color();
  items.forEach((it, i) => {
    q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), it.r); m.compose(new THREE.Vector3(it.x, it.y, it.z), q, new THREE.Vector3(it.s, it.s, it.s));
    body.setMatrixAt(i, m); head.setMatrixAt(i, m); const j = JACKETS[Math.floor(Math.abs(it.r) * 97) % JACKETS.length]; c.setRGB(j[0], j[1], j[2]); body.setColorAt(i, c);
  });
  body.castShadow = head.castShadow = true; body.frustumCulled = head.frustumCulled = false;
  g.add(body, head); return g;
}
export function signBoards(dir, items) {
  const L = lib(), mesh = new THREE.InstancedMesh(L.signGeo, L.signMat[dir > 0 ? 1 : 0], items.length), m = new THREE.Matrix4(), q = new THREE.Quaternion();
  items.forEach((it, i) => { q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), it.r); m.compose(new THREE.Vector3(it.x, it.y + 1.35, it.z), q, new THREE.Vector3(1, 1, 1)); mesh.setMatrixAt(i, m); });
  mesh.frustumCulled = false; return mesh;
}
