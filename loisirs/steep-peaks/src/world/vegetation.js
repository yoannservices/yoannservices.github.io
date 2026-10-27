import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { CHUNK, rng } from '../core/config.js';
import { heightAt, slopeAt, forest } from './heightmap.js';

function colored(geo, fn) {
  const p = geo.attributes.position, c = new Float32Array(p.count * 3);
  for (let i = 0; i < p.count; i++) fn(p.getY(i), c, i * 3);
  geo.setAttribute('color', new THREE.BufferAttribute(c, 3));
  return geo;
}
// Sapin = tronc + 3 cônes fusionnés en une seule géométrie (couleurs par sommet, pointes enneigées)
function treeGeometry() {
  const parts = [];
  const trunk = new THREE.CylinderGeometry(0.22, 0.34, 1.8, 6).translate(0, 0.9, 0);
  parts.push(colored(trunk, (y, c, o) => c.set([0.35, 0.24, 0.16], o)));
  [[2.3, 3.4, 1.7], [1.8, 3, 3.5], [1.25, 2.6, 5.3]].forEach(([r, h, y]) => {
    const g = new THREE.ConeGeometry(r, h, 7).translate(0, y + h / 2 - 0.4, 0);
    parts.push(colored(g, (py, c, o) => {
      const t = Math.max(0, Math.min(1, (py - y) / h));
      c.set([0.1 + 0.8 * t * t, 0.27 + 0.65 * t * t, 0.18 + 0.75 * t * t], o);
    }));
  });
  return mergeGeometries(parts);
}
function rockGeometry() {
  const g = new THREE.IcosahedronGeometry(1, 1);
  const p = g.attributes.position, r = rng(7);
  for (let i = 0; i < p.count; i++) { const k = 0.75 + r() * 0.5; p.setXYZ(i, p.getX(i) * k, p.getY(i) * k * 0.7, p.getZ(i) * k); }
  g.computeVertexNormals();
  return colored(g, (y, c, o) => c.set([0.42 + y * 0.1, 0.4 + y * 0.1, 0.42 + y * 0.1], o));
}
const treeGeo = treeGeometry(), rockGeo = rockGeometry();
const mat = new THREE.MeshLambertMaterial({ vertexColors: true });

const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), p3 = new THREE.Vector3(), s3 = new THREE.Vector3(), up = new THREE.Vector3(0, 1, 0);

// Sapins et rochers d'un chunk (InstancedMesh) + liste d'obstacles [x,z,rayon,hauteur]
export function buildVegetation(cx, cz) {
  const r = rng(cx * 73856093 ^ cz * 19349663), x0 = cx * CHUNK, z0 = cz * CHUNK;
  const trees = [], rocks = [];
  const CELL = 7;
  for (let gz = 0; gz < CHUNK / CELL; gz++) for (let gx = 0; gx < CHUNK / CELL; gx++) {
    const x = x0 + (gx + r()) * CELL, z = z0 + (gz + r()) * CELL, rr = r(), h = heightAt(x, z), sl = slopeAt(x, z);
    const f = forest(x, z, h, sl);
    if (f > 0 && rr < Math.min(0.95, f * 2.4)) trees.push([x, h, z, 0.8 + r() * 0.9, r() * 6.28]);
  }
  for (let i = 0; i < 26; i++) {
    const x = x0 + r() * CHUNK, z = z0 + r() * CHUNK, h = heightAt(x, z), sl = slopeAt(x, z), s = 0.7 + r() * r() * 3;
    if ((sl > 0.5 || h > 150 && r() < 0.5) && forest(x, z, h, 0) > -0.9) rocks.push([x, h, z, s, r() * 6.28]);
  }
  const obstacles = new Float32Array((trees.length + rocks.length) * 4);
  let o = 0;
  const mk = (geo, list, scaleFn) => {
    const im = new THREE.InstancedMesh(geo, mat, Math.max(1, list.length));
    im.count = list.length;
    list.forEach((t, i) => {
      scaleFn(t);
      m4.compose(p3.set(t[0], t[1] - 0.2, t[2]), q.setFromAxisAngle(up, t[4]), s3);
      im.setMatrixAt(i, m4);
    });
    im.instanceMatrix.needsUpdate = true;
    im.computeBoundingSphere();
    return im;
  };
  const tm = mk(treeGeo, trees, (t) => { s3.set(t[3], t[3], t[3]); obstacles.set([t[0], t[2], 0.5 * t[3] + 0.3, t[1] + 7 * t[3]], o); o += 4; });
  const rm = mk(rockGeo, rocks, (t) => { s3.set(t[3], t[3] * 0.9, t[3] * 1.1); obstacles.set([t[0], t[2], t[3] * 0.85, t[1] + t[3]], o); o += 4; });
  return { meshes: [tm, rm], obstacles };
}
