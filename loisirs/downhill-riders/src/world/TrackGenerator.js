/* Génération d'une descente à partir d'une graine : tracé, pente, virages relevés, sauts, passerelles, rails, drops,
   sections techniques, bifurcations (ligne sûre / ligne risquée), points de contrôle. Le terrain est une fonction
   analytique height(x, z) : un couloir autour de la piste, des flancs de vallée bruités ailleurs. */
import { mulberry32, seedFrom, vnoise, fbm, clamp, lerp, smooth } from '../core/rng.js';
import { diffById, SURF, SURF_PARAMS } from '../core/config.js';
import { K, makeFeature, featureDelta, featureStep } from './Features.js';
import { BIOMES } from './Biomes.js';

const STEP = 2, HASH = 16, OB_HASH = 8;
const key = (a, b) => a * 73856093 ^ b * 19349663;

export class Track {
  constructor(seedWord, diffId, biomeId) {
    this.seedWord = seedWord; this.diff = diffById(diffId); this.biomeId = biomeId; this.biome = BIOMES[biomeId];
    this.rng = mulberry32(seedFrom(seedWord + diffId + biomeId)); this.ns = seedFrom(seedWord) & 0xffff;
    this.lines = []; this.obstacles = []; this.checkpoints = []; this.forks = [];
    this.hash = new Map(); this.obHash = new Map(); this.chunkSet = new Set();
    this._q = { l: 0, i: 0, s: 0, y: 0, hw: 1.5, bank: 0, kind: 0, surf: 0, th: 0, dlat: 0, d: 0, risky: false };
    this._generate();
  }

  /* ───────── génération ───────── */
  _generate() {
    const D = this.diff, rng = this.rng, ns = this.ns, n = Math.floor(D.len / STEP) + 1;
    const X = new Float32Array(n), Z = new Float32Array(n), TH = new Float32Array(n), C = new Float32Array(n), YB = new Float32Array(n);
    let a = 0, px = 0, pz = 0, py = 0;
    for (let i = 0; i < n; i++) {
      const s = i * STEP;
      let c = i < 22 ? 0 : (vnoise(s * 0.018, 0, ns) - 0.5) * 2 * D.curv * 1.5 - a * 0.012;
      c = clamp(c, -D.curv * 1.25, D.curv * 1.25);
      X[i] = px; Z[i] = pz; TH[i] = a; C[i] = c; YB[i] = py;
      a += c * STEP; px += Math.sin(a) * STEP; pz -= Math.cos(a) * STEP;
      py -= D.slope * (1 + 0.45 * fbm(s * 0.01, 3.3, 2, ns)) * (s < 40 ? 0.5 : 1) * STEP;
    }
    // éléments sur la ligne principale
    const feats = [], w = this._weights();
    let s = 70;
    while (s < D.len - 70) {
      let type = this._pick(w);
      const i0 = Math.floor(s / STEP);
      let mc = 0; for (let k = 0; k < 14; k++) mc += Math.abs(C[Math.min(n - 1, i0 + k * 2)]);
      mc /= 14;
      if ((type === K.JUMP || type === K.TABLE || type === K.DROP || type === K.RAIL) && mc > D.curv * 0.75) type = K.ROLLER;
      const f = makeFeature(type, rng, D.sizeMul); f.s0 = s; feats.push(f);
      s += f.len + lerp(14, 38, rng()) * (1.35 - 0.4 * D.jumps);
    }
    const main = this._buildLine(0, X, Z, TH, C, YB, feats, false, 0);
    this.lines.push(main);

    // bifurcations : ligne risquée avec un gros saut
    const nf = D.forks, span = (D.len - 300) / nf;
    for (let k = 0; k < nf; k++) {
      const sa = 150 + k * span + rng() * span * 0.35, len = lerp(90, 130, rng()), sb = Math.min(sa + len, D.len - 120);
      this._addFork(main, sa, sb, k);
    }
    // points de contrôle, départ, arrivée
    const at = (sPos) => { const i = Math.min(n - 1, Math.round(sPos / STEP)); return { i, x: main.X[i], y: main.Y[i], z: main.Z[i], yaw: main.TH[i], s: sPos }; };
    this.start = at(14);
    for (let sc = 150; sc < D.len - 100; sc += 150) this.checkpoints.push(at(sc));
    this.finish = at(D.len - 26);
    this.length = D.len;
    // obstacles : rochers dans les zones techniques
    for (const l of this.lines) for (const f of l.feats) if (f.type === K.TECH) this._rocks(l, f);
    this._index();
  }

  _weights() {
    const D = this.diff;
    return [[K.JUMP, D.jumps], [K.TABLE, 0.5], [K.DROP, 0.25 + 0.3 * D.jumps], [K.ROLLER, 0.35], [K.BRIDGE, 0.3], [K.RAIL, 0.28], [K.TECH, D.tech * 1.5]];
  }
  _pick(w) { let t = 0; for (const [, p] of w) t += p; let r = this.rng() * t; for (const [k, p] of w) { r -= p; if (r <= 0) return k; } return K.ROLLER; }

  _buildLine(id, X, Z, TH, C, YB, feats, risky, sStart) {
    const n = X.length, Y = new Float32Array(n), S = new Float32Array(n), HW = new Float32Array(n), BANK = new Float32Array(n), KIND = new Uint8Array(n), SURF = new Uint8Array(n);
    const D = this.diff, di = ['green', 'blue', 'red', 'black'].indexOf(D.id), hwBase = risky ? 1.2 : lerp(2, 1.4, di / 3), base = this.biome.surf;
    let cum = 0, fi = 0;
    for (let i = 0; i < n; i++) {
      const s = i * STEP; let delta = 0, kind = 0, surf = base;
      while (fi < feats.length && feats[fi].s0 + feats[fi].len <= s) { cum += featureStep(feats[fi]); fi++; }
      for (let k = fi; k < feats.length; k++) { const f = feats[k]; if (f.s0 > s) break; if (s <= f.s0 + f.len) { delta = featureDelta(f, s - f.s0); kind = f.type; break; } }
      if (id === 0 && s < 14) kind = K.START;
      if (kind === K.BRIDGE || kind === K.RAIL) surf = SURF.wood; else if (kind === K.TECH) surf = SURF.rock;
      Y[i] = YB[i] + cum + delta; S[i] = sStart + s; KIND[i] = kind; SURF[i] = surf;
      HW[i] = kind === K.BRIDGE ? 1 : hwBase;
      let cs = 0, m = 0; for (let k = -5; k <= 5; k++) { const j = i + k; if (j >= 0 && j < n) { cs += C[j]; m++; } } BANK[i] = cs / m;
    }
    return { id, n, X, Z, TH, Y, S, HW, BANK, KIND, SURF, risky, feats, step: cum };
  }

  _addFork(main, sa, sb, idx) {
    const rng = this.rng, D = this.diff, i0 = Math.floor(sa / STEP), i1 = Math.floor(sb / STEP), m = i1 - i0 + 1;
    const side = rng() < 0.5 ? -1 : 1, offMax = lerp(13, 19, rng());
    const X = new Float32Array(m), Z = new Float32Array(m), TH = new Float32Array(m), C = new Float32Array(m), YB = new Float32Array(m);
    // altitude : la pente de la ligne principale sans ses éléments, recalée en douceur sur sa sortie
    const baseY = (i) => main.Y[i] - this._localDelta(main, i);
    const yEnd = main.Y[i1], yStartB = baseY(i0), yEndB = baseY(i1), net = (yEnd - yEndB) - (main.Y[i0] - yStartB);
    for (let j = 0; j < m; j++) {
      const t = j / (m - 1), i = i0 + j, off = side * offMax * Math.pow(Math.sin(Math.PI * t), 0.7), th = main.TH[i];
      X[j] = main.X[i] + Math.cos(th) * off; Z[j] = main.Z[i] + Math.sin(th) * off;
      YB[j] = baseY(i) + (main.Y[i0] - yStartB) + net * smooth(0, 1, t);
    }
    for (let j = 0; j < m; j++) {
      const a = Math.max(0, j - 1), b = Math.min(m - 1, j + 1);
      TH[j] = Math.atan2(X[b] - X[a], -(Z[b] - Z[a]));
    }
    for (let j = 0; j < m; j++) { const a = Math.max(0, j - 1), b = Math.min(m - 1, j + 1); let d = TH[b] - TH[a]; if (d > Math.PI) d -= 2 * Math.PI; if (d < -Math.PI) d += 2 * Math.PI; C[j] = d / ((b - a) * STEP); }
    // gros saut au milieu, bosses ou rocher avant
    const feats = [], len = m * STEP;
    const big = makeFeature(K.JUMP, rng, D.sizeMul * 1.7); big.s0 = clamp(len * 0.45 - big.len / 2, 24, len - big.len - 12); feats.push(big);
    if (big.s0 > 50) { const r = makeFeature(rng() < 0.5 ? K.ROLLER : K.TECH, rng, D.sizeMul); r.s0 = 8; if (r.len + 8 < big.s0 - 6) feats.unshift(r); }
    const line = this._buildLine(this.lines.length, X, Z, TH, C, YB, feats, true, sa);
    this.lines.push(line);
    this.forks.push({ line: line.id, sa, sb, x: main.X[i0], z: main.Z[i0], y: main.Y[i0], side, big });
  }
  _localDelta(l, i) { // part « élément » de l'altitude d'un échantillon : Y - base (sans pas cumulés)
    let d = 0; const s = i * STEP;
    for (const f of l.feats) if (s >= f.s0 && s <= f.s0 + f.len) { d = featureDelta(f, s - f.s0); break; }
    let cum = 0; for (const f of l.feats) if (f.s0 + f.len <= s) cum += featureStep(f);
    return d + cum;
  }

  _rocks(l, f) {
    const rng = this.rng, i0 = Math.floor(f.s0 / STEP), i1 = Math.min(l.n - 1, Math.floor((f.s0 + f.len) / STEP));
    let side = 1;
    for (let i = i0 + 2; i < i1; i += 3 + Math.floor(rng() * 3)) {
      const hw = l.HW[i], off = side * lerp(0.95, Math.max(1, hw * 0.95), rng()); side = -side;
      const th = l.TH[i], x = l.X[i] + Math.cos(th) * off, z = l.Z[i] + Math.sin(th) * off;
      this.obstacles.push({ x, z, y: l.Y[i], r: lerp(0.32, 0.5, rng()), h: lerp(0.45, 0.8, rng()), type: 'rock' });
    }
  }

  /* ───────── index spatial ───────── */
  _index() {
    for (const l of this.lines) for (let i = 0; i < l.n; i++) {
      const cx = Math.floor(l.X[i] / HASH), cz = Math.floor(l.Z[i] / HASH), k = key(cx, cz);
      let arr = this.hash.get(k); if (!arr) this.hash.set(k, arr = []); arr.push(l.id << 16 | i);
      if (i % 4 === 0) { const kx = Math.floor(l.X[i] / 40), kz = Math.floor(l.Z[i] / 40); for (let a = -2; a <= 2; a++) for (let b = -2; b <= 2; b++) this.chunkSet.add((kx + a) + ',' + (kz + b)); }
    }
    this.obstacles.forEach((o, i) => { const k = key(Math.floor(o.x / OB_HASH), Math.floor(o.z / OB_HASH)); let arr = this.obHash.get(k); if (!arr) this.obHash.set(k, arr = []); arr.push(i); });
  }
  obstaclesNear(x, z, out) {
    out.length = 0; const cx = Math.floor(x / OB_HASH), cz = Math.floor(z / OB_HASH);
    for (let a = -1; a <= 1; a++) for (let b = -1; b <= 1; b++) { const arr = this.obHash.get(key(cx + a, cz + b)); if (arr) for (const i of arr) out.push(this.obstacles[i]); }
    return out;
  }

  /* Projection d'un point sur la piste la plus proche : abscisse s, distance latérale signée, altitude de ligne, etc. */
  query(x, z) {
    const cx = Math.floor(x / HASH), cz = Math.floor(z / HASH);
    let best = 1e12, bl = -1, bi = -1;
    for (let r = 1; r <= 6; r += (r < 3 ? 1 : 3)) {
      for (let a = -r; a <= r; a++) for (let b = -r; b <= r; b++) {
        const arr = this.hash.get(key(cx + a, cz + b)); if (!arr) continue;
        for (let k = 0; k < arr.length; k++) { const v = arr[k], l = this.lines[v >> 16], i = v & 0xffff, dx = l.X[i] - x, dz = l.Z[i] - z, d = dx * dx + dz * dz; if (d < best) { best = d; bl = v >> 16; bi = v & 0xffff; } }
      }
      if (best < (r * HASH) * (r * HASH) * 0.5) break;
    }
    if (bl < 0) return null;
    const l = this.lines[bl], q = this._q;
    // meilleur segment autour de l'échantillon le plus proche
    let bt = 0, bj = bi, bd = 1e12;
    for (const j of [bi - 1, bi]) {
      if (j < 0 || j + 1 >= l.n) continue;
      const ax = l.X[j], az = l.Z[j], ex = l.X[j + 1] - ax, ez = l.Z[j + 1] - az, t = clamp(((x - ax) * ex + (z - az) * ez) / (ex * ex + ez * ez), 0, 1);
      const dx = ax + ex * t - x, dz = az + ez * t - z, d = dx * dx + dz * dz;
      if (d < bd) { bd = d; bt = t; bj = j; }
    }
    if (bd === 1e12) { bj = Math.min(bi, l.n - 2); bt = bi > bj ? 1 : 0; }
    const j = bj, t = bt, j1 = Math.min(l.n - 1, j + 1);
    const th = l.TH[j] + (l.TH[j1] - l.TH[j]) * t, px = l.X[j] + (l.X[j1] - l.X[j]) * t, pz = l.Z[j] + (l.Z[j1] - l.Z[j]) * t;
    const rx = Math.cos(th), rz = Math.sin(th), ox = x - px, oz = z - pz;
    const near = t < 0.5 ? j : j1;
    q.l = bl; q.i = near; q.s = l.S[j] + (l.S[j1] - l.S[j]) * t; q.y = l.Y[j] + (l.Y[j1] - l.Y[j]) * t;
    q.hw = l.HW[j] + (l.HW[j1] - l.HW[j]) * t; q.bank = l.BANK[j] + (l.BANK[j1] - l.BANK[j]) * t;
    q.kind = l.KIND[near]; q.surf = l.SURF[near]; q.th = th; q.dlat = ox * rx + oz * rz; q.d = Math.hypot(ox, oz); q.risky = l.risky;
    return q;
  }

  height(x, z) {
    const q = this.query(x, z); if (!q) return this.lines[0].Y[0] - 40;
    const hw = q.hw, ad = Math.abs(q.dlat), side = -Math.sign(q.bank) * q.dlat, bm = Math.min(1.1, Math.abs(q.bank) / (this.diff.curv * 0.8)) * 1.0;
    let y = q.y;
    if (ad <= hw) {
      y += (vnoise(x * 0.7, z * 0.7, 7) - 0.5) * SURF_PARAMS[q.surf][2] * 0.45; // bosses douces : un bruit fin à vitesse élevée décollait le vélo en continu
      if (side > hw * 0.3) y += bm * smooth(hw * 0.3, hw, side);
      if (q.kind === K.RAIL) y += 0.5 * (1 - smooth(0.16, 0.3, ad));
    } else {
      const e = ad - hw, valley = e * 0.16 + e * e * 0.012;
      y += valley + fbm(x * 0.05, z * 0.05, 3, this.ns) * 2.2 * smooth(0, 12, e) + fbm(x * 0.21, z * 0.21, 2, this.ns + 5) * 0.35 * smooth(0, 6, e);
      if (side > 0) y += bm * (1 - smooth(0, 3, e));
      if (q.kind === K.BRIDGE) y -= 3.4 * (1 - smooth(1.5, 10, e)) * smooth(0, 0.6, e);
    }
    return y;
  }
  normal(x, z, out) {
    const e = 0.4, hx = this.height(x - e, z) - this.height(x + e, z), hz = this.height(x, z - e) - this.height(x, z + e);
    const l = Math.hypot(hx, 2 * e, hz); out.x = hx / l; out.y = 2 * e / l; out.z = hz / l; return out;
  }
  /* échantillon de ligne à l'indice i, pour les structures et les cartes */
  pos(line, i) { const l = this.lines[line]; return { x: l.X[i], y: l.Y[i], z: l.Z[i], th: l.TH[i], hw: l.HW[i] }; }
}
