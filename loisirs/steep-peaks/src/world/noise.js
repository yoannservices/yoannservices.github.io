import { rng } from '../core/config.js';
const F2 = 0.5 * (Math.sqrt(3) - 1), G2 = (3 - Math.sqrt(3)) / 6;
const GR = [[1, 1], [-1, 1], [1, -1], [-1, -1], [1, 0], [-1, 0], [0, 1], [0, -1]];
const perm = new Uint8Array(512), pm = new Uint8Array(512);
(() => {
  const r = rng(1337), p = [...Array(256).keys()];
  for (let i = 255; i > 0; i--) { const j = (r() * (i + 1)) | 0; [p[i], p[j]] = [p[j], p[i]]; }
  for (let i = 0; i < 512; i++) { perm[i] = p[i & 255]; pm[i] = perm[i] & 7; }
})();
// Simplex 2D, résultat dans [-1, 1]
export function noise2(x, y) {
  const s = (x + y) * F2, i = Math.floor(x + s), j = Math.floor(y + s), t = (i + j) * G2;
  const x0 = x - (i - t), y0 = y - (j - t);
  const i1 = x0 > y0 ? 1 : 0, j1 = 1 - i1;
  const x1 = x0 - i1 + G2, y1 = y0 - j1 + G2, x2 = x0 - 1 + 2 * G2, y2 = y0 - 1 + 2 * G2;
  const ii = i & 255, jj = j & 255;
  let n = 0, t0 = 0.5 - x0 * x0 - y0 * y0;
  if (t0 > 0) { t0 *= t0; const g = GR[pm[ii + perm[jj]]]; n += t0 * t0 * (g[0] * x0 + g[1] * y0); }
  let t1 = 0.5 - x1 * x1 - y1 * y1;
  if (t1 > 0) { t1 *= t1; const g = GR[pm[ii + i1 + perm[jj + j1]]]; n += t1 * t1 * (g[0] * x1 + g[1] * y1); }
  let t2 = 0.5 - x2 * x2 - y2 * y2;
  if (t2 > 0) { t2 *= t2; const g = GR[pm[ii + 1 + perm[jj + 1]]]; n += t2 * t2 * (g[0] * x2 + g[1] * y2); }
  return 70 * n;
}
export function fbm(x, y, o = 4) {
  let a = 1, f = 1, s = 0, n = 0;
  for (let i = 0; i < o; i++) { s += a * noise2(x * f, y * f); n += a; a *= 0.5; f *= 2.03; }
  return s / n;
}
export function ridged(x, y, o = 4) {
  let a = 1, f = 1, s = 0, n = 0, w = 1;
  for (let i = 0; i < o; i++) {
    let v = 1 - Math.abs(noise2(x * f, y * f)); v *= v * w; w = Math.min(1, v * 2);
    s += a * v; n += a; a *= 0.5; f *= 2.07;
  }
  return s / n;
}
