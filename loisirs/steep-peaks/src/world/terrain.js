import * as THREE from 'three';
import { CHUNK, VIEW, WORLD_R, sstep } from '../core/config.js';
import { heightAt, snowAt, forest } from './heightmap.js';
import { buildVegetation } from './vegetation.js';

const RES = [64, 32, 16, 8];
const lodFor = (d) => (d <= 1 ? 0 : d === 2 ? 1 : d <= 3 ? 2 : 3);
const TRACK_PX = 512, TRACK_CAP = 36;

// Texture de grain de neige (CanvasTexture), tuilée 16x par chunk
function makeGrain() {
  const c = document.createElement('canvas');
  c.width = c.height = 256;
  const g = c.getContext('2d');
  g.fillStyle = '#f2f6fc'; g.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 5000; i++) {
    const v = 205 + Math.random() * 50 | 0;
    g.fillStyle = `rgba(${v - 8},${v},${Math.min(255, v + 8)},${0.25 + Math.random() * 0.4})`;
    const s = 1 + Math.random() * 2.2;
    g.fillRect(Math.random() * 256, Math.random() * 256, s, s);
  }
  for (let i = 0; i < 40; i++) { // sastrugi
    g.strokeStyle = 'rgba(190,205,225,0.18)'; g.lineWidth = 1 + Math.random() * 2;
    g.beginPath(); const x = Math.random() * 256, y = Math.random() * 256;
    g.moveTo(x, y); g.lineTo(x + 20 + Math.random() * 40, y + Math.random() * 6 - 3); g.stroke();
  }
  return c;
}

export class Terrain {
  constructor(scene) {
    this.scene = scene;
    this.chunks = new Map();
    this.tracks = new Map(); // persistance des traces tant que la session dure
    this.grainCanvas = makeGrain();
    this.grain = new THREE.CanvasTexture(this.grainCanvas);
    this.grain.wrapS = this.grain.wrapT = THREE.RepeatWrapping;
    this.grain.repeat.set(16, 16);
    this.grain.anisotropy = 4;
    this.grain.colorSpace = THREE.SRGBColorSpace;
    this.mat = new THREE.MeshLambertMaterial({ vertexColors: true, map: this.grain, side: THREE.DoubleSide });
    this.dirty = new Set();
  }

  geometry(cx, cz, lod) {
    const n = RES[lod], step = CHUNK / n, x0 = cx * CHUNK, z0 = cz * CHUNK, m = n + 3;
    const H = new Float32Array(m * m);
    for (let j = 0; j < m; j++) for (let i = 0; i < m; i++) H[j * m + i] = heightAt(x0 + (i - 1) * step, z0 + (j - 1) * step);
    const vn = (n + 1) * (n + 1), total = vn + 4 * (n + 1);
    const pos = new Float32Array(total * 3), nor = new Float32Array(total * 3), col = new Float32Array(total * 3), uv = new Float32Array(total * 2);
    for (let j = 0; j <= n; j++) for (let i = 0; i <= n; i++) {
      const k = j * (n + 1) + i, hc = (j + 1) * m + i + 1;
      const x = x0 + i * step, z = z0 + j * step, y = H[hc];
      const dx = (H[hc + 1] - H[hc - 1]) / (2 * step), dz = (H[hc + m] - H[hc - m]) / (2 * step);
      const sl = Math.hypot(dx, dz), il = 1 / Math.hypot(dx, 1, dz);
      pos[k * 3] = x; pos[k * 3 + 1] = y; pos[k * 3 + 2] = z;
      nor[k * 3] = -dx * il; nor[k * 3 + 1] = il; nor[k * 3 + 2] = -dz * il;
      uv[k * 2] = i / n; uv[k * 2 + 1] = j / n;
      // couleur : type de neige, roche en pente, sous-bois
      const t = snowAt(x, z, y, sl);
      let r = 0.97, g = 0.98, b = 1;
      if (t === 2) { r = 0.66; g = 0.82; b = 0.95; } else if (t === 1) { r = 0.88; g = 0.91; b = 0.96; }
      const rk = sstep(0.75, 1.2, sl);
      r += (0.43 - r) * rk; g += (0.41 - g) * rk; b += (0.42 - b) * rk;
      const f = forest(x, z, y, sl);
      if (f > 0) { const q = Math.min(1, f * 3); r *= 1 - 0.22 * q; g *= 1 - 0.1 * q; b *= 1 - 0.18 * q; }
      col[k * 3] = r; col[k * 3 + 1] = g; col[k * 3 + 2] = b;
    }
    // jupes pour masquer les jointures entre LOD
    const edges = [
      (t) => t, (t) => n * (n + 1) + t, (t) => t * (n + 1), (t) => t * (n + 1) + n,
    ];
    const idx = [];
    for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) {
      const a = j * (n + 1) + i, b = a + 1, c = a + n + 1, d = c + 1;
      idx.push(a, c, b, b, c, d);
    }
    edges.forEach((e, ei) => {
      const base = vn + ei * (n + 1);
      for (let t = 0; t <= n; t++) {
        const s = e(t), k = base + t;
        pos[k * 3] = pos[s * 3]; pos[k * 3 + 1] = pos[s * 3 + 1] - 25; pos[k * 3 + 2] = pos[s * 3 + 2];
        nor[k * 3 + 1] = 1; col.set([col[s * 3], col[s * 3 + 1], col[s * 3 + 2]], k * 3);
        uv[k * 2] = uv[s * 2]; uv[k * 2 + 1] = uv[s * 2 + 1];
        if (t < n) { const s2 = e(t + 1), k2 = k + 1; idx.push(s, s2, k, s2, k2, k); }
      }
    });
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('normal', new THREE.BufferAttribute(nor, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
    geo.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
    geo.setIndex(idx);
    geo.computeBoundingSphere();
    return geo;
  }

  build(cx, cz, lod, d) {
    const key = cx + ',' + cz;
    let c = this.chunks.get(key);
    if (!c) {
      c = { cx, cz, lod: -1, mesh: null, veg: null };
      this.chunks.set(key, c);
    }
    if (c.lod !== lod) {
      const geo = this.geometry(cx, cz, lod);
      if (c.mesh) { c.mesh.geometry.dispose(); c.mesh.geometry = geo; } else {
        c.mesh = new THREE.Mesh(geo, this.tracks.get(key)?.mat || this.mat);
        c.mesh.matrixAutoUpdate = false;
        this.scene.add(c.mesh);
      }
      c.lod = lod;
    }
    if (d <= 2 && !c.veg) { c.veg = buildVegetation(cx, cz); c.veg.meshes.forEach((m) => this.scene.add(m)); }
    else if (d > 3 && c.veg) { this.dropVeg(c); }
  }

  dropVeg(c) { c.veg.meshes.forEach((m) => { this.scene.remove(m); m.dispose(); }); c.veg = null; }

  // Charge/décharge les chunks autour de (px,pz) ; budget de construction par frame en ms
  update(px, pz, budget = 5, full = false) {
    const pcx = Math.floor(px / CHUNK), pcz = Math.floor(pz / CHUNK);
    const want = [];
    for (let dz = -VIEW; dz <= VIEW; dz++) for (let dx = -VIEW; dx <= VIEW; dx++) {
      if (dx * dx + dz * dz > (VIEW + 0.5) ** 2) continue;
      const cx = pcx + dx, cz = pcz + dz;
      if (Math.hypot((cx + 0.5) * CHUNK, (cz + 0.5) * CHUNK) > WORLD_R + CHUNK) continue;
      const d = Math.max(Math.abs(dx), Math.abs(dz)), c = this.chunks.get(cx + ',' + cz), lod = lodFor(d);
      if (!c || c.lod !== lod || (d <= 2 && !c.veg) || (d > 3 && c.veg)) want.push({ cx, cz, lod, d });
    }
    want.sort((a, b) => a.d - b.d);
    const t0 = performance.now();
    for (const w of want) {
      this.build(w.cx, w.cz, w.lod, w.d);
      if (!full && performance.now() - t0 > budget) break;
    }
    for (const [key, c] of this.chunks) {
      if (Math.max(Math.abs(c.cx - pcx), Math.abs(c.cz - pcz)) > VIEW + 1) {
        this.scene.remove(c.mesh); c.mesh.geometry.dispose();
        if (c.veg) this.dropVeg(c);
        this.chunks.delete(key);
      }
    }
    for (const t of this.dirty) t.tex.needsUpdate = true;
    this.dirty.clear();
  }

  trackFor(cx, cz) {
    const key = cx + ',' + cz;
    let t = this.tracks.get(key);
    if (t) { this.tracks.delete(key); this.tracks.set(key, t); return t; }
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = TRACK_PX;
    const g = canvas.getContext('2d');
    const tile = TRACK_PX / 16;
    for (let j = 0; j < 16; j++) for (let i = 0; i < 16; i++) g.drawImage(this.grainCanvas, i * tile, j * tile, tile, tile);
    const tex = new THREE.CanvasTexture(canvas);
    tex.flipY = false; tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 4;
    const mat = new THREE.MeshLambertMaterial({ vertexColors: true, map: tex, side: THREE.DoubleSide });
    t = { canvas, g, tex, mat };
    this.tracks.set(key, t);
    const c = this.chunks.get(key);
    if (c) c.mesh.material = mat;
    if (this.tracks.size > TRACK_CAP) {
      const [ok, ot] = this.tracks.entries().next().value;
      this.tracks.delete(ok);
      const oc = this.chunks.get(ok);
      if (oc) oc.mesh.material = this.mat;
      ot.tex.dispose(); ot.mat.dispose();
    }
    return t;
  }

  // Dessine une trace (x0,z0)->(x1,z1) de largeur w mètres ; a = opacité
  stamp(x0, z0, x1, z1, w, a, rgb = '150,170,200') {
    const mx = (x0 + x1) / 2, mz = (z0 + z1) / 2;
    const cx = Math.floor(mx / CHUNK), cz = Math.floor(mz / CHUNK);
    if (!this.chunks.has(cx + ',' + cz)) return;
    const t = this.trackFor(cx, cz), k = TRACK_PX / CHUNK, g = t.g;
    g.strokeStyle = `rgba(${rgb},${a})`;
    g.lineWidth = Math.max(1, w * k); g.lineCap = 'round';
    g.beginPath();
    g.moveTo((x0 - cx * CHUNK) * k, (z0 - cz * CHUNK) * k);
    g.lineTo((x1 - cx * CHUNK) * k, (z1 - cz * CHUNK) * k);
    g.stroke();
    this.dirty.add(t);
  }

  // Obstacles (arbres, rochers) autour d'un point : renvoie la distance de pénétration max ou 0
  hitObstacle(x, y, z) {
    const pcx = Math.floor(x / CHUNK), pcz = Math.floor(z / CHUNK);
    for (let dz = -1; dz <= 1; dz++) for (let dx = -1; dx <= 1; dx++) {
      const c = this.chunks.get(pcx + dx + ',' + (pcz + dz));
      const o = c?.veg?.obstacles;
      if (!o) continue;
      for (let i = 0; i < o.length; i += 4) {
        const ox = o[i] - x, oz = o[i + 1] - z, r = o[i + 2];
        if (ox * ox + oz * oz < r * r && y < o[i + 3]) return r;
      }
    }
    return 0;
  }
}
