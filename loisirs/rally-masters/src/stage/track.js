/* Piste : maillage du ruban + talus, tronçons de 32 échantillons chargés / déchargés à la volée autour de la voiture,
   décor (InstancedMesh + fusion statique), requêtes de sol pour la physique, portiques de chrono. */
import * as THREE from 'three';
import { DS } from './spline.js';
import { ENVS } from '../core/data.js';
import { SURFACES, ASPHALTE } from '../surfaces/surfaces.js';
import { terrainAtlas, bannerTexture, waterTexture } from '../surfaces/textures.js';
import { lib, StaticBatch, instancedTrees, instancedRocks, spectators, signBoards, TREE_H, TREE_R } from './scenery.js';
import { mulberry32, clamp, lerp, smooth } from '../core/util.js';

export const CH = 32;            // échantillons par tronçon (128 m)
const PLATEAU = 380;             // largeur du plateau autour du talus (m)
const AHEAD = 6, BEHIND = 2;     // tronçons gardés devant / derrière
const V = 12;                    // sommets par rangée
const QUADS = [[0, 1], [1, 2], [2, 3], [3, 4], [5, 6], [7, 8], [8, 9], [9, 10], [10, 11]];
const lin = (r, g, b) => new THREE.Color().setRGB(r, g, b, THREE.SRGBColorSpace);
const mix = (a, b, t) => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
const mul = (a, k) => [a[0] * k, a[1] * k, a[2] * k];

export class Track {
  constructor(stage, scene, opts = {}) {
    this.st = stage; this.scene = scene; this.env = ENVS[stage.env];
    this.weather = stage.weather; this.quality = opts.quality ?? 1;
    this.group = new THREE.Group(); scene.add(this.group);
    this.chunks = new Map(); this.colBuf = [];
    this.lastSample = { y: 0 };
    const snow = this.weather === 'neige' || stage.env === 'neige';
    this.snow = snow; this.wet = this.weather === 'pluie' ? 1 : this.weather === 'brouillard' ? 0.3 : 0;
    this.mat = new THREE.MeshStandardMaterial({ map: terrainAtlas(), vertexColors: true, roughness: 0.97 - this.wet * 0.3, metalness: 0 });
    this.waterTex = waterTexture(); this.waterTex.repeat.set(3, 3);
    this.waterMat = new THREE.MeshStandardMaterial({ map: this.waterTex, color: 0x4a7a99, transparent: true, opacity: 0.78, roughness: 0.08, metalness: 0.25 });
    this._grid(); this._profile(); this._gates();
  }

  /* grille spatiale des points du tracé (distances aux autres tronçons de route) */
  _grid() {
    const { N, x, z } = this.st, cell = 20; this.cell = cell; this.gridMap = new Map();
    const key = (cx, cz) => cx * 73856093 ^ cz * 19349663;
    this.key = key;
    for (let i = 0; i < N; i++) { const k = key(Math.floor(x[i] / cell), Math.floor(z[i] / cell)); let a = this.gridMap.get(k); if (!a) this.gridMap.set(k, a = []); a.push(i); }
  }
  _minOther(i, R = 80) {
    const { x, z } = this.st, c = this.cell; let best = R * R;
    const cx = Math.floor(x[i] / c), cz = Math.floor(z[i] / c), r = Math.ceil(R / c);
    for (let dx = -r; dx <= r; dx++) for (let dz = -r; dz <= r; dz++) {
      const a = this.gridMap.get(this.key(cx + dx, cz + dz)); if (!a) continue;
      for (const j of a) { if (Math.abs(j - i) > 22) { const d = (x[i] - x[j]) ** 2 + (z[i] - z[j]) ** 2; if (d < best) best = d; } }
    }
    return Math.sqrt(best);
  }
  farFromRoad(px, pz, i, r) {
    const { x, z } = this.st, c = this.cell, cx = Math.floor(px / c), cz = Math.floor(pz / c);
    for (let dx = -1; dx <= 1; dx++) for (let dz = -1; dz <= 1; dz++) {
      const a = this.gridMap.get(this.key(cx + dx, cz + dz)); if (!a) continue;
      for (const j of a) { if (Math.abs(j - i) > 8 && (px - x[j]) ** 2 + (pz - z[j]) ** 2 < r * r) return false; }
    }
    return true;
  }

  /* profils latéraux : 5 points par côté (décalage, dénivelé), murs physiques à gauche / à droite */
  _profile() {
    const st = this.st, { N, hw, k, bridge } = st, rnd = mulberry32(st.seed ^ 0x9e37);
    this.PO = new Float32Array(N * 10); this.PD = new Float32Array(N * 10);
    this.wallL = new Float32Array(N); this.wallR = new Float32Array(N);
    this.cliff = new Int8Array(N);
    if (st.env === 'asphalte') for (let i = 0; i < N;) { const len = 25 + Math.floor(rnd() * 50), side = rnd() < 0.5 ? 1 : -1, on = rnd() < 0.45; if (on) for (let j = i; j < Math.min(N, i + len); j++) this.cliff[j] = side; i += len; }
    const allow = new Float32Array(N);
    for (let i = 0; i < N; i++) { const m = this._minOther(i); allow[i] = m >= 79 ? 400 : Math.max(6, m / 2 - 1); }
    const lim = [new Float32Array(N), new Float32Array(N)];
    for (let sd = 0; sd < 2; sd++) for (let i = 0; i < N; i++) {
      const inner = (k[i] > 0 && sd === 0) || (k[i] < 0 && sd === 1);
      lim[sd][i] = Math.min(allow[i], inner ? 0.8 / Math.max(Math.abs(k[i]), 1e-5) : 1e9);
    }
    for (let sd = 0; sd < 2; sd++) { const c = Float32Array.from(lim[sd]); for (let i = 0; i < N; i++) { let m = c[i]; for (let j = Math.max(0, i - 3); j <= Math.min(N - 1, i + 3); j++) m = Math.min(m, c[j]); lim[sd][i] = Math.max(m, hw[i] + 2.2); } }
    const BANK = [0, -0.12, 0.6, 3.4, 4.6], CLIFF = [0, -0.15, -0.3, -12, -16], GORGE = [0, -0.4, -3, -11, -13];
    for (let i = 0; i < N; i++) for (let sd = 0; sd < 2; sd++) {
      const cl = this.cliff[i] === (sd === 0 ? 1 : -1) ? 1 : 0, b = bridge[i], L = lim[sd][i], h = hw[i];
      const wallBase = lerp(h + 5.3, h + 1.25, cl), wall = lerp(wallBase, h + 0.35, b);
      const we = Math.max(h + 0.3, Math.min(wall, L - 1.4));
      const o = [h, Math.max(h + 0.05, Math.min(h + 2.5, we - 0.2)), we, Math.min(we + 1.4, L), Math.min(we + PLATEAU, L)];
      const base = (i * 2 + sd) * 5;
      for (let q = 0; q < 5; q++) { this.PO[base + q] = o[q]; this.PD[base + q] = lerp(lerp(BANK[q], CLIFF[q], cl), GORGE[q], b); }
      (sd === 0 ? this.wallL : this.wallR)[i] = we;
    }
  }

  /* ---------- requêtes de sol ---------- */
  /* échantillon le plus proche : renvoie l'indice, remplit out.t / out.lat. hint = indice proche (recherche locale) */
  locate(px, pz, hint, out) {
    const { x, z, h, N } = this.st;
    let best = -1, bd = 1e18, bt = 0;
    const scan = (a, b, step) => {
      for (let i = a; i < b; i += step) {
        const dx = x[i + 1] - x[i], dz = z[i + 1] - z[i], ex = px - x[i], ez = pz - z[i];
        const t = clamp((ex * dx + ez * dz) / (dx * dx + dz * dz), 0, 1), cx = ex - dx * t, cz = ez - dz * t, d = cx * cx + cz * cz;
        if (d < bd) { bd = d; best = i; bt = t; }
      }
    };
    scan(Math.max(0, hint - 8), Math.min(N - 1, hint + 16), 1);
    if (bd > 1600) { bd = 1e18; scan(0, N - 1, 2); scan(Math.max(0, best - 2), Math.min(N - 1, best + 3), 1); }
    const i = best, hh = lerp(h[i], h[Math.min(N - 1, i + 1)], bt);
    const cx = lerp(x[i], x[i + 1], bt), cz = lerp(z[i], z[i + 1], bt);
    out.i = i; out.t = bt; out.lat = (px - cx) * Math.cos(hh) - (pz - cz) * Math.sin(hh); out.hh = hh;
    return i;
  }
  /* hauteur et surface au sol en (x, z) */
  groundAt(px, pz, hint, out = {}) {
    const st = this.st; this.locate(px, pz, hint, out);
    const { i, t, lat } = out, a = Math.abs(lat), sd = lat >= 0 ? 0 : 1, base = (i * 2 + sd) * 5, i2 = Math.min(st.N - 1, i + 1);
    const yc = lerp(st.y[i], st.y[i2], t), hw = lerp(st.hw[i], st.hw[i2], t);
    let dy = 0, sl = 0, surf = st.surf[t < 0.5 ? i : i2];
    if (a > hw) {
      surf = st.verge;
      let q = 0; while (q < 3 && a > this.PO[base + q + 1]) q++;
      const o0 = this.PO[base + q], o1 = this.PO[base + q + 1], d0 = this.PD[base + q], d1 = this.PD[base + q + 1];
      const u = o1 > o0 + 1e-4 ? clamp((a - o0) / (o1 - o0), 0, 1) : 1; dy = lerp(d0, d1, u); sl = o1 > o0 + 1e-4 ? (d1 - d0) / (o1 - o0) : 0;
      if (st.bridge[i] > 0.5 && a < hw + 0.4) surf = ASPHALTE;
    }
    out.y = yc + dy; out.surf = surf; out.hw = hw; out.slopeA = (st.y[i2] - st.y[i]) / DS; out.slopeL = sd === 0 ? sl : -sl;
    out.wl = lerp(this.wallL[i], this.wallL[i2], t); out.wr = lerp(this.wallR[i], this.wallR[i2], t);
    out.water = st.ford[i] && a < hw + 3 ? 1 : 0;
    return out;
  }
  pointAt(i) { const st = this.st; return { x: st.x[i], z: st.z[i], y: st.y[i], h: st.h[i] }; }
  /* colliders autour d'un indice (arbres de bas-côté, rochers, bottes, poteaux) */
  colliders(i) {
    const c = Math.floor(i / CH), buf = this.colBuf; buf.length = 0;
    for (let q = c - 1; q <= c + 1; q++) { const ch = this.chunks.get(q); if (ch) for (const co of ch.cols) buf.push(co); }
    return buf;
  }

  /* ---------- tronçons ---------- */
  update(idx, force = false) {
    const c = Math.floor(idx / CH), maxC = Math.floor((this.st.N - 1) / CH);
    let built = 0;
    for (let q = Math.max(0, c - BEHIND); q <= Math.min(maxC, c + AHEAD); q++) {
      if (!this.chunks.has(q) && (force || built < 1)) { this.chunks.set(q, this._chunk(q)); built++; }
    }
    for (const [q, ch] of this.chunks) if (q < c - BEHIND - 1 || q > c + AHEAD + 1) { this._free(ch); this.chunks.delete(q); }
  }
  _free(ch) { this.group.remove(ch.group); ch.owned.forEach((g) => g.dispose()); }

  _colors(i, sd, rnd) {
    const st = this.st, S = SURFACES;
    const v = 0.94 + rnd() * 0.12, cl = this.cliff[i] === (sd === 0 ? 1 : -1);
    let verge = S[st.verge].color.slice(), ground = this.env.ground.slice();
    if (this.snow) { ground = mix(ground, [0.92, 0.94, 0.98], 0.85); verge = mix(verge, [0.9, 0.93, 0.97], 0.5); }
    const dark = 1 - this.wet * 0.25; verge = mul(verge, dark * v); ground = mul(ground, dark * v);
    const rock = [0.42, 0.4, 0.38];
    return [verge, mix(verge, ground, 0.5), ground, cl || st.bridge[i] > 0.3 ? rock : mul(ground, 0.7), cl ? rock : mul(ground, 0.85)];
  }

  _chunk(c) {
    const st = this.st, { N, x, z, y, h, hw, surf } = st, i0 = c * CH, i1 = Math.min(N - 1, i0 + CH), rows = i1 - i0 + 1;
    const rnd = mulberry32((st.seed ^ (c * 7919 + 13)) >>> 0), group = new THREE.Group(), owned = [], cols = [];
    // --- terrain ---
    const pos = new Float32Array(rows * V * 3), col = new Float32Array(rows * V * 3), uv = new Float32Array(rows * V * 2), idx = [];
    const put = (r, q, px, py, pz, c3, u, vv) => {
      const o = r * V + q; pos.set([px, py, pz], o * 3);
      const cc = lin(c3[0], c3[1], c3[2]); col.set([cc.r, cc.g, cc.b], o * 3); uv.set([u, vv], o * 2);
    };
    for (let r = 0; r < rows; r++) {
      const i = i0 + r, lx = Math.cos(h[i]), lz = -Math.sin(h[i]), vv = i * DS / 16;
      const asph = surf[i] === ASPHALTE, rc = mul(SURFACES[surf[i]].color, (0.95 + rnd() * 0.1) * (1 - this.wet * (asph ? 0.3 : 0.18)));
      const ru = asph ? 0.25 : 0, cL = this._colors(i, 0, rnd), cR = this._colors(i, 1, rnd);
      for (let q = 0; q < 5; q++) {
        const k = 4 - q, bL = i * 10 + k, bR = i * 10 + 5 + q, oL = this.PO[bL], oR = this.PO[bR];
        put(r, q, x[i] + lx * oL, y[i] + this.PD[bL], z[i] + lz * oL, cL[k], 0.5 + 0.12 * k, vv);
        put(r, 7 + q, x[i] - lx * oR, y[i] + this.PD[bR], z[i] - lz * oR, cR[q], 0.5 + 0.12 * q, vv);
      }
      put(r, 5, x[i] + lx * hw[i], y[i], z[i] + lz * hw[i], rc, ru + 0.01, vv);
      put(r, 6, x[i] - lx * hw[i], y[i], z[i] - lz * hw[i], rc, ru + 0.24, vv);
    }
    for (let r = 0; r < rows - 1; r++) for (const [a, b] of QUADS) {
      const A = r * V + a, B = r * V + b, C = (r + 1) * V + a, D = (r + 1) * V + b; idx.push(A, B, C, B, D, C);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3)); geo.setAttribute('color', new THREE.BufferAttribute(col, 3)); geo.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
    geo.setIndex(idx); geo.computeVertexNormals(); geo.computeBoundingSphere(); owned.push(geo);
    const terrain = new THREE.Mesh(geo, this.mat); terrain.receiveShadow = true; group.add(terrain);

    // --- décor ---
    const env = this.env, treesBy = {}, rocks = [], specs = [], signs = { '-1': [], 1: [] }, batch = new StaticBatch(), d2r = Math.PI / 180;
    const frame = (i) => ({ fx: Math.sin(h[i]), fz: Math.cos(h[i]), lx: Math.cos(h[i]), lz: -Math.sin(h[i]) });
    const dyAt = (i, sd, off) => { const b = (i * 2 + sd) * 5; let q = 0; while (q < 3 && off > this.PO[b + q + 1]) q++; const o0 = this.PO[b + q], o1 = this.PO[b + q + 1]; return lerp(this.PD[b + q], this.PD[b + q + 1], o1 > o0 + 1e-4 ? clamp((off - o0) / (o1 - o0), 0, 1) : 1); };
    const at = (i, sd, off, along = 0) => {
      const f = frame(i), s = sd === 0 ? 1 : -1;
      const px = x[i] + f.fx * along + f.lx * off * s, pz = z[i] + f.fz * along + f.lz * off * s;
      return { x: px, z: pz, y: y[i] + dyAt(i, sd, off) };
    };
    for (let i = i0; i < i1; i++) {
      if (i < 4 && c === 0) continue;
      for (let sd = 0; sd < 2; sd++) {
        const wall = sd === 0 ? this.wallL[i] : this.wallR[i], Lout = this.PO[(i * 2 + sd) * 5 + 4], cliff = this.cliff[i] === (sd === 0 ? 1 : -1);
        if (cliff || st.bridge[i] > 0.2) continue;
        // arbres sur le plateau (au-delà du talus)
        const n = Math.floor(env.density * (this.quality > 0.5 ? 1.7 : 1.1) + rnd());
        for (let q = 0; q < n; q++) {
          const kind = env.trees[Math.floor(rnd() * env.trees.length)], d = wall + 1.8 + Math.pow(rnd(), 1.6) * 26;
          if (d > Lout - 1.5) continue;
          const p = at(i, sd, d, (rnd() - 0.5) * DS); if (!this.farFromRoad(p.x, p.z, i, hw[i] + 7)) continue;
          (treesBy[kind] ||= []).push({ x: p.x, y: p.y - 0.15, z: p.z, s: 0.85 + rnd() * 0.75, r: rnd() * 6.28 });
        }
        // quelques arbres de bas-côté : vrais obstacles
        if (rnd() < 0.16 * env.density && wall - hw[i] > 3.6) {
          const kind = env.trees[Math.floor(rnd() * env.trees.length)], d = hw[i] + 3.2 + rnd() * (wall - hw[i] - 3.8);
          const p = at(i, sd, d, (rnd() - 0.5) * DS), sc = 0.8 + rnd() * 0.5;
          (treesBy[kind] ||= []).push({ x: p.x, y: p.y - 0.1, z: p.z, s: sc, r: rnd() * 6.28 }); cols.push({ x: p.x, z: p.z, r: TREE_R[kind] * sc + 0.15, k: 0 });
        }
        // rochers
        if (rnd() < env.rocks * 0.3) {
          const d = wall - 3 + rnd() * 9, p = at(i, sd, Math.max(hw[i] + 2.6, d), (rnd() - 0.5) * DS), sc = 0.5 + rnd() * 1.3;
          rocks.push({ x: p.x, y: p.y, z: p.z, s: sc, r: rnd() });
          if (d < wall - 0.2) cols.push({ x: p.x, z: p.z, r: sc * 0.85, k: 1 });
        }
      }
    }
    // virages : spectateurs, bottes, panneaux, barrières
    for (const co of st.corners) {
      if (co.i1 < i0 || co.i0 >= i1) continue;
      const out = co.dir === 'L' ? 1 : 0, inn = 1 - out;   // côté extérieur / intérieur (0 = gauche +lat)
      if (co.sev <= 4) {
        const apex = (co.i0 + co.i1) >> 1;
        if (apex >= i0 && apex < i1 && rnd() < 0.8) {
          const sdv = rnd() < 0.7 ? inn : out, n = 7 + Math.floor(rnd() * 11);
          for (let q = 0; q < n; q++) {
            const i = clamp(apex + Math.floor((rnd() - 0.5) * 10), 1, N - 2), wall = sdv === 0 ? this.wallL[i] : this.wallR[i];
            if (this.cliff[i] === (sdv === 0 ? 1 : -1)) continue;
            const p = at(i, sdv, hw[i] + 2.8 + rnd() * Math.max(0.5, Math.min(3, wall - hw[i] - 3.2)), (rnd() - 0.5) * 8), f = frame(i), s = sdv === 0 ? 1 : -1;
            specs.push({ x: p.x, y: p.y, z: p.z, s: 0.9 + rnd() * 0.25, r: Math.atan2(-s * f.lx, -s * f.lz) });
          }
        }
      }
      if (co.sev <= 3) {
        for (let i = Math.max(i0, co.i0 - 1); i < Math.min(i1, co.i1 + 2); i += 2) {
          const wall = out === 0 ? this.wallL[i] : this.wallR[i]; if (this.cliff[i] === (out === 0 ? 1 : -1)) continue;
          const p = at(i, out, hw[i] + 2.1, 0);
          batch.bale(p.x, p.y, p.z, h[i] + (rnd() - 0.5) * 0.3); cols.push({ x: p.x, z: p.z, r: 0.62, k: 2 });
          if (rnd() < 0.5) { batch.bale(p.x, p.y + 1, p.z, h[i] + 0.2); }
        }
        // panneaux chevrons à l'extérieur
        for (const fr of [0.2, 0.5, 0.8]) {
          const i = Math.round(lerp(co.i0, co.i1, fr)); if (i < i0 || i >= i1 || this.cliff[i] === (out === 0 ? 1 : -1)) continue;
          const p = at(i, out, hw[i] + 3.0), f = frame(i), s = out === 0 ? 1 : -1;
          signs[co.dir === 'L' ? 1 : -1].push({ x: p.x, y: p.y, z: p.z, r: Math.atan2(-s * f.lx, -s * f.lz) });
          batch.box(p.x, p.y + 0.7, p.z, 0.08, 1.4, 0.08, 0, [0.35, 0.35, 0.38]);
        }
      }
      if (co.sev <= 4 && st.env !== 'asphalte') {
        for (let i = Math.max(i0, co.i0); i < Math.min(i1, co.i1 + 1); i++) { // barrière en bois côté extérieur
          if (this.cliff[i] === (out === 0 ? 1 : -1)) continue;
          const wall = out === 0 ? this.wallL[i] : this.wallR[i], p = at(i, out, Math.min(hw[i] + 4.1, wall - 0.5));
          batch.box(p.x, p.y + 0.55, p.z, 0.14, 1.1, 0.14, h[i], [0.5, 0.35, 0.2]);
          batch.box(p.x, p.y + 0.9, p.z, 0.06, 0.1, DS, h[i], [0.88, 0.88, 0.85]); batch.box(p.x, p.y + 0.55, p.z, 0.06, 0.1, DS, h[i], [0.85, 0.15, 0.15]);
          if (i % 2 === 0) cols.push({ x: p.x, z: p.z, r: 0.22, k: 3 });
        }
      }
    }
    // glissières : côté vide des routes de montagne et ponts ; fusion avec le reste du statique
    for (let i = i0; i < i1; i++) {
      for (let sd = 0; sd < 2; sd++) {
        const cl = this.cliff[i] === (sd === 0 ? 1 : -1), br = st.bridge[i] > 0.3;
        if (!cl && !br) continue;
        const wall = sd === 0 ? this.wallL[i] : this.wallR[i], p = at(i, sd, wall + (br ? 0.12 : 0.08));
        if (br) batch.box(p.x, p.y + 0.5, p.z, 0.26, 1.0, DS, h[i], [0.62, 0.62, 0.6]);
        else { batch.box(p.x, p.y + 0.35, p.z, 0.1, 0.7, 0.1, h[i], [0.5, 0.5, 0.52]); batch.box(p.x, p.y + 0.55, p.z, 0.06, 0.32, DS, h[i], [0.78, 0.8, 0.82]); }
      }
      if (st.bridge[i] > 0.3) {
        const f = frame(i); batch.box(x[i], y[i] - 0.3, z[i], hw[i] * 2 + 0.6, 0.5, DS, h[i], [0.56, 0.56, 0.54]);
        if ((i % 5) === 0 && st.bridge[i] > 0.9) for (const s of [-1, 1]) batch.box(x[i] + f.lx * (hw[i] - 0.6) * s, y[i] - 7, z[i] + f.lz * (hw[i] - 0.6) * s, 1.1, 14, 1.1, h[i], [0.55, 0.55, 0.53]);
      }
    }
    const sMesh = batch.build(); if (sMesh) { group.add(sMesh); owned.push(sMesh.geometry); }
    // gué : plan d'eau au-dessus de la piste abaissée
    const ford = []; for (let i = i0; i <= i1; i++) if (st.ford[i]) ford.push(i);
    if (ford.length > 1) {
      const wp = [], wi = []; let r = 0;
      for (const i of ford) { const f = frame(i), w = hw[i] + 3.2, yy = y[i] + 0.2; wp.push(x[i] + f.lx * w, yy, z[i] + f.lz * w, x[i] - f.lx * w, yy, z[i] - f.lz * w); if (r > 0) { const a = (r - 1) * 2; wi.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); } r++; }
      const wg = new THREE.BufferGeometry(); wg.setAttribute('position', new THREE.Float32BufferAttribute(wp, 3));
      const wuv = []; ford.forEach((_, k2) => wuv.push(0, k2 * 0.6, 1, k2 * 0.6)); wg.setAttribute('uv', new THREE.Float32BufferAttribute(wuv, 2)); wg.setIndex(wi); wg.computeVertexNormals();
      const wm = new THREE.Mesh(wg, this.waterMat); wm.renderOrder = 2; group.add(wm); owned.push(wg);
    }
    // instances
    const tint = this.snow ? [1.15, 1.15, 1.2] : [1, 1, 1];
    for (const kind in treesBy) group.add(instancedTrees(kind, treesBy[kind], tint));
    if (rocks.length) group.add(instancedRocks(rocks, this.snow ? [0.95, 0.97, 1] : st.env === 'gravier' ? [1.3, 1.2, 1] : [1, 1, 1]));
    if (specs.length) group.add(spectators(specs));
    for (const d of [-1, 1]) if (signs[d].length) group.add(signBoards(d, signs[d]));
    this.group.add(group);
    return { group, owned, cols };
  }

  /* ---------- portiques ---------- */
  _gates() {
    const st = this.st; this.gates = [];
    this.gateGroup = new THREE.Group(); this.group.add(this.gateGroup);
    const mk = (i, text, bg, checker) => {
      const g = new THREE.Group(), w = st.hw[i] + 1.4;
      const tex = bannerTexture(text, bg, checker), banner = new THREE.Mesh(new THREE.PlaneGeometry(w * 2, 1.2), new THREE.MeshBasicMaterial({ map: tex, side: THREE.DoubleSide }));
      banner.position.y = 5.2;
      const postM = new THREE.MeshStandardMaterial({ color: 0x2a2d36, metalness: 0.3, roughness: 0.5 });
      for (const s of [-1, 1]) { const p = new THREE.Mesh(new THREE.BoxGeometry(0.28, 5.8, 0.28), postM); p.position.set(s * w, 2.9, 0); g.add(p); }
      const top = new THREE.Mesh(new THREE.BoxGeometry(w * 2 + 0.3, 0.25, 0.3), postM); top.position.y = 5.85; g.add(banner, top);
      const lights = [];
      for (let k = -1; k <= 1; k++) { const m = new THREE.MeshBasicMaterial({ color: 0x331111 }), l = new THREE.Mesh(new THREE.SphereGeometry(0.2, 10, 8), m); l.position.set(k * 0.7, 4.3, 0.1); g.add(l); lights.push(m); }
      g.position.set(st.x[i], st.y[i], st.z[i]); g.rotation.y = st.h[i] + Math.PI;
      this.gateGroup.add(g); return { i, g, lights };
    };
    this.startGate = mk(st.startI, 'DÉPART', '#0b7a3b', false);
    this.finishGate = mk(st.finishI, 'ARRIVÉE', '#111', true);
    this.cpGates = st.cps.map((i, k) => mk(i, `CHRONO ${k + 1}`, '#1d4ed8', false));
  }

  animate(dt) { this.waterTex.offset.y -= dt * 0.12; this.waterTex.offset.x += dt * 0.03; }
  dispose() { for (const ch of this.chunks.values()) this._free(ch); this.chunks.clear(); this.scene.remove(this.group); this.gateGroup.traverse((o) => { o.geometry?.dispose(); o.material?.map?.dispose(); o.material?.dispose?.(); }); }
}
