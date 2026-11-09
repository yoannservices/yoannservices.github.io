// Terrain déformable de la carrière (grille de hauteurs, sans Three.js : testable avec Node).
// H = roche en place (ne s'éboule pas), L = matériau meuble au-dessus (éboulis, gravier : il s'éboule à l'angle de talus),
// G = part de gravier concassé dans le meuble (0 = roche brute, 1 = gravier). Volumes en m³.
export const CELL = 1.25, N = 129, HALF = (N - 1) * CELL / 2;
export const REPOSE = 0.78;                       // pente max du meuble (≈ 38°) : dénivelé par mètre
export const DENS = { rock: 1.55, gravel: 1.7 };  // t/m³ en vrac
export const tonnes = (vol, g) => vol * (DENS.rock + (DENS.gravel - DENS.rock) * g);

const smooth = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
const lerp = (a, b, t) => a + (b - a) * t;

// Gradins : plateau 0 m, gradin 1 à 5 m, gradin 2 à 10 m. Une rampe d'accès monte au nord (z ≈ -60).
export const BENCH = { x1: 25.5, x2: 53.5, h1: 5, h2: 10 };
export function baseHeight(x, z) {
  const bench = BENCH.h1 * smooth(BENCH.x1 - 1.5, BENCH.x1 + 1.5, x) + (BENCH.h2 - BENCH.h1) * smooth(BENCH.x2 - 1.5, BENCH.x2 + 1.5, x);
  const ramp = Math.min(BENCH.h2, Math.max(0, 0.17 * (x - 14)));
  const band = 1 - smooth(8, 13, Math.abs(z + 60));
  return lerp(bench, ramp, band);
}

export class Terrain {
  constructor() {
    this.H = new Float32Array(N * N); this.L = new Float32Array(N * N); this.G = new Float32Array(N * N);
    this.active = new Set(); this.version = 0;
    for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) this.H[j * N + i] = baseHeight(i * CELL - HALF, j * CELL - HALF);
  }
  idx(i, j) { return j * N + i; }
  tot(k) { return this.H[k] + this.L[k]; }
  // hauteur de la surface en (x, z) : interpolation bilinéaire
  height(x, z) {
    const fx = Math.min(N - 1.001, Math.max(0, (x + HALF) / CELL)), fz = Math.min(N - 1.001, Math.max(0, (z + HALF) / CELL));
    const i = Math.floor(fx), j = Math.floor(fz), tx = fx - i, tz = fz - j, k = j * N + i;
    const a = this.H[k] + this.L[k], b = this.H[k + 1] + this.L[k + 1], c = this.H[k + N] + this.L[k + N], d = this.H[k + N + 1] + this.L[k + N + 1];
    return lerp(lerp(a, b, tx), lerp(c, d, tx), tz);
  }
  // cellules dans un disque
  cells(x, z, r, fn) {
    const i0 = Math.max(0, Math.floor((x - r + HALF) / CELL)), i1 = Math.min(N - 1, Math.ceil((x + r + HALF) / CELL));
    const j0 = Math.max(0, Math.floor((z - r + HALF) / CELL)), j1 = Math.min(N - 1, Math.ceil((z + r + HALF) / CELL));
    for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) {
      const d = Math.hypot(i * CELL - HALF - x, j * CELL - HALF - z);
      if (d <= r) fn(j * N + i, 1 - d / r, i, j);
    }
  }
  // Creuse : retire la matière au-dessus de tipY dans le disque (r), au plus maxVol. Renvoie { vol, g }.
  // solid : part de la roche en place que l'outil sait arracher (0 = chargeuse : seulement le meuble ; 0,35 = pelle sur roche non abattue).
  dig(x, z, r, tipY, maxVol, solid = 0) {
    let vol = 0, gs = 0, sum = 0; const A = CELL * CELL;
    const parts = (k) => { const a = Math.max(0, this.tot(k) - tipY), l = Math.min(this.L[k], a), h = (a - l) * solid; const s = Math.min(1.2, l + h) / ((l + h) || 1); return [l * s, h * s]; };
    // 1re passe : matière disponible ; 2e passe : même fraction retirée partout (pas de biais de direction)
    this.cells(x, z, r, (k) => { const [l, h] = parts(k); sum += (l + h) * A; });
    if (sum <= 0 || maxVol <= 0) return { vol: 0, g: 0 };
    const f = Math.min(1, maxVol / sum);
    this.cells(x, z, r, (k) => {
      const [l, h] = parts(k); if (l + h <= 0) return;
      const fromL = l * f, fromH = h * f;
      gs += fromL * A * this.G[k]; this.L[k] -= fromL; this.H[k] -= fromH; vol += (fromL + fromH) * A;
      if (this.L[k] < 1e-4) { this.L[k] = 0; this.G[k] = 0; }
      this.touch(k);
    });
    if (vol > 0) this.version++;
    return { vol, g: vol > 0 ? gs / vol : 0 };
  }
  // Dépose vol m³ de meuble (fraction de gravier g) autour de (x, z), dans un disque de rayon r.
  add(x, z, r, vol, g = 0) {
    let sw = 0; this.cells(x, z, r, (k, w) => { sw += w; });
    if (sw <= 0) { this.cells(x, z, CELL * 1.5, (k, w) => { sw += w; }); r = CELL * 1.5; }
    if (sw <= 0) return 0;
    const A = CELL * CELL;
    this.cells(x, z, r, (k, w) => {
      const dv = vol * w / sw / A, old = this.L[k];
      this.G[k] = (this.G[k] * old + g * dv) / (old + dv || 1);
      this.L[k] = old + dv; this.touch(k);
    });
    this.version++;
    return vol;
  }
  // Retire du meuble dans une zone sans condition (utilisé par les tests et le tir de mine). Renvoie le volume retiré.
  total(x0, x1, z0, z1) {
    let v = 0; const A = CELL * CELL;
    for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) {
      const x = i * CELL - HALF, z = j * CELL - HALF;
      if (x >= x0 && x <= x1 && z >= z0 && z <= z1) v += this.L[j * N + i] * A;
    }
    return v;
  }
  touch(k) { this.active.add(k); }
  // Éboulement : le meuble coule vers les voisins trop bas. Renvoie le nombre de cellules traitées.
  relax(budget = 2500) {
    let n = 0; const MAXD = REPOSE * CELL, nb = [1, -1, N, -N];
    for (const k of this.active) {
      this.active.delete(k);
      if (++n > budget) break;
      const i = k % N, j = (k - i) / N;
      if (i < 1 || j < 1 || i > N - 2 || j > N - 2) continue;
      let moved = false;
      for (const o of nb) {
        const m = k + o, dt = this.tot(k) - this.tot(m);
        if (dt > MAXD && this.L[k] > 0) {
          const q = Math.min(this.L[k], (dt - MAXD) * 0.25);
          const old = this.L[m];
          this.G[m] = (this.G[m] * old + this.G[k] * q) / (old + q || 1);
          this.L[m] = old + q; this.L[k] -= q; if (this.L[k] < 1e-4) { this.L[k] = 0; this.G[k] = 0; }
          this.active.add(m); moved = true;
        }
      }
      if (moved) this.active.add(k);
    }
    if (n) this.version++;
    return n;
  }
  // Volume de roche en place restant dans un rectangle, au-dessus de floor
  solidAbove(x0, x1, z0, z1, floor) {
    let v = 0; const A = CELL * CELL;
    for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) {
      const x = i * CELL - HALF, z = j * CELL - HALF;
      if (x >= x0 && x <= x1 && z >= z0 && z <= z1) v += Math.max(0, this.H[j * N + i] - floor) * A;
    }
    return v;
  }
  // Tir de mine : détache la roche de la tranche [x0, x0+depth] au-dessus de floor (au plus 3 m) et l'éboule devant le front.
  blast(site) {
    let vol = 0; const A = CELL * CELL, x0 = site.x0, z0 = site.cz - site.halfW, z1 = site.cz + site.halfW;
    for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) {
      const x = i * CELL - HALF, z = j * CELL - HALF;
      if (x < x0 || x > x0 + site.depth || z < z0 || z > z1) continue;
      const k = j * N + i, cut = Math.min(3, Math.max(0, this.H[k] - site.floor - 0.4));
      if (cut > 0) { this.H[k] -= cut; vol += cut * A; }
    }
    if (vol > 1) this.add(x0 - 5, site.cz, 8.5, vol * 1.25, 0);   // foisonnement : la roche abattue occupe plus de place
    if (vol > 1) { site.x0 += 4; this.version++; }
    return vol;
  }
  // Sauvegarde compacte (hauteurs quantifiées) pour localStorage
  encode() {
    const q = (a, lo, span) => { const u = new Uint16Array(a.length); for (let k = 0; k < a.length; k++) u[k] = Math.max(0, Math.min(65535, Math.round((a[k] - lo) / span * 65535))); return u; };
    const g = new Uint8Array(N * N); for (let k = 0; k < g.length; k++) g[k] = Math.round(this.G[k] * 255);
    const buf = new Uint8Array(N * N * 5), dv = new DataView(buf.buffer);
    const H = q(this.H, -10, 60), L = q(this.L, 0, 30);
    for (let k = 0; k < N * N; k++) { dv.setUint16(k * 5, H[k]); dv.setUint16(k * 5 + 2, L[k]); buf[k * 5 + 4] = g[k]; }
    let s = ''; for (let k = 0; k < buf.length; k += 8192) s += String.fromCharCode.apply(null, buf.subarray(k, k + 8192));
    return btoa(s);
  }
  decode(b64) {
    const s = atob(b64); if (s.length !== N * N * 5) return false;
    const buf = new Uint8Array(s.length); for (let k = 0; k < s.length; k++) buf[k] = s.charCodeAt(k);
    const dv = new DataView(buf.buffer);
    for (let k = 0; k < N * N; k++) { this.H[k] = dv.getUint16(k * 5) / 65535 * 60 - 10; this.L[k] = dv.getUint16(k * 5 + 2) / 65535 * 30; this.G[k] = buf[k * 5 + 4] / 255; }
    this.version++; return true;
  }
}
