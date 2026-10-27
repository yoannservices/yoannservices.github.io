import { fbm, ridged, noise2 } from './noise.js';
import { sstep, rng } from '../core/config.js';

// Snowpark : plan incliné (descente vers +z) avec kickers fondus dans le relief
export const PARK = { x: -520, z: 380, w: 46, len: 300, slope: 0.27, y0: 0 };
const KICKERS = [
  { x: -14, z: 40, L: 9, H: 2.6, W: 12 }, { x: 14, z: 70, L: 8, H: 2.2, W: 10 },
  { x: 0, z: 165, L: 14, H: 5, W: 14 }, { x: -14, z: 230, L: 16, H: 6.5, W: 12 },
];
export const planeY = (z) => PARK.y0 - PARK.slope * (z - PARK.z);

function natural(x, z) {
  const r = Math.hypot(x, z);
  const edge = 1 - sstep(2200, 3050, r);
  const a = ridged(x * 0.0008 + 7.3, z * 0.0008 - 3.1, 4);
  let h = 60 + 300 * a * a * (0.6 + 0.4 * (0.5 + 0.5 * fbm(x * 0.0006 + 90, z * 0.0006, 2)))
    + 30 * fbm(x * 0.0032, z * 0.0032, 3) + 3 * fbm(x * 0.018, z * 0.018, 2);
  const t = sstep(0.45, 0.75, noise2(x * 0.0022 + 40, z * 0.0022 + 11)); // zones de falaises
  const q = h / 40, f = Math.floor(q);
  h += ((f + sstep(0.6, 1, q - f)) * 40 - h) * t * 0.5;
  return 30 + (h - 30) * edge;
}
PARK.y0 = natural(PARK.x, PARK.z) + 4;

function kick(k, lx, lz) {
  const u = (lz - k.z) / k.L;
  if (u < 0 || u > 1 + 3 / k.L) return 0;
  const wx = 1 - sstep(k.W / 2 - 1, k.W / 2 + 1, Math.abs(lx - k.x));
  if (wx <= 0) return 0;
  return wx * (u <= 1 ? k.H * Math.pow(u, 1.8) : k.H * (1 - sstep(1, 1 + 3 / k.L, u)));
}
export function parkWeight(x, z) {
  const lx = x - PARK.x, lz = z - PARK.z;
  if (lx < -PARK.w - 30 || lx > PARK.w + 30 || lz < -30 || lz > PARK.len + 50) return 0;
  return (1 - sstep(PARK.w, PARK.w + 30, Math.abs(lx))) * sstep(-20, 10, lz) * (1 - sstep(PARK.len - 10, PARK.len + 40, lz));
}
export function heightAt(x, z) {
  let h = natural(x, z);
  const w = parkWeight(x, z);
  if (w > 0) {
    let p = planeY(z);
    for (const k of KICKERS) p += kick(k, x - PARK.x, z - PARK.z);
    h += (p - h) * w;
  }
  return h;
}
export function normalAt(x, z, out) {
  const e = 0.6;
  return out.set(-(heightAt(x + e, z) - heightAt(x - e, z)) / (2 * e), 1, -(heightAt(x, z + e) - heightAt(x, z - e)) / (2 * e)).normalize();
}
export const slopeAt = (x, z) => {
  const e = 1;
  return Math.hypot(heightAt(x + e, z) - heightAt(x - e, z), heightAt(x, z + e) - heightAt(x, z - e)) / (2 * e);
};
// 0 poudreuse, 1 damée, 2 glace
export function snowAt(x, z, h, sl) {
  if (parkWeight(x, z) > 0.5) return 1;
  if ((h > 300 && noise2(x * 0.004 + 200, z * 0.004 + 60) > 0.25) || sl > 1.1) return 2;
  return noise2(x * 0.006 + 500, z * 0.006 - 80) > 0.2 ? 1 : 0;
}
export function forest(x, z, h, sl) {
  if (parkWeight(x, z) > 0) return -1;
  const d = 0.5 + 0.5 * fbm(x * 0.006 + 30, z * 0.006, 3);
  return d * (1 - sstep(170, 240, h)) * (1 - sstep(0.4, 0.7, sl)) * sstep(25, 45, h) - 0.3;
}
// Descente de plus grande pente
export function descend(x, z, len, step = 10) {
  let d = 0, dx = 0, dz = 0;
  const pts = [[x, z]];
  while (d < len && Math.hypot(x, z) < 2600) {
    const gx = heightAt(x + 2, z) - heightAt(x - 2, z), gz = heightAt(x, z + 2) - heightAt(x, z - 2), m = Math.hypot(gx, gz);
    // l'inertie permet de traverser les replats
    if (m > 0.02) { dx = dx * 0.5 - (gx / m) * 0.5; dz = dz * 0.5 - (gz / m) * 0.5; const n = Math.hypot(dx, dz) || 1; dx /= n; dz /= n; }
    else if (!dx && !dz) break;
    x += dx * step; z += dz * step; d += step; pts.push([x, z]);
  }
  return { x, z, len: d, pts };
}
export const downhillHeading = (x, z) => Math.atan2(-(heightAt(x + 2, z) - heightAt(x - 2, z)), -(heightAt(x, z + 2) - heightAt(x, z - 2)));

const NAMES = ["Pic de l'Aiguille", 'Dôme des Glaces', 'Crête du Loup', 'Mont Blanchot', 'Pointe Cristal', 'Col Sauvage'];
function findSummits() {
  const S = 100, N = 23, hs = [];
  for (let j = -N; j <= N; j++) for (let i = -N; i <= N; i++) hs.push(heightAt(i * S, j * S));
  const W = 2 * N + 1, c = [];
  for (let j = 3; j < W - 3; j++) for (let i = 3; i < W - 3; i++) {
    const v = hs[j * W + i];
    let ok = v > 130;
    for (let dj = -3; ok && dj <= 3; dj++) for (let di = -3; di <= 3; di++) if (hs[(j + dj) * W + i + di] > v) { ok = false; break; }
    if (ok) c.push({ x: (i - N) * S, z: (j - N) * S, y: v });
  }
  c.sort((a, b) => b.y - a.y);
  const out = [];
  for (const s of c) if (out.every((o) => Math.hypot(o.x - s.x, o.z - s.z) > 550) && Math.hypot(s.x - PARK.x, s.z - PARK.z) > 400) out.push(s);
  return out.slice(0, 6).map((s, i) => {
    const hd = downhillHeading(s.x, s.z), x = s.x + Math.sin(hd) * 14, z = s.z + Math.cos(hd) * 14;
    return { id: 's' + i, name: NAMES[i] || 'Sommet ' + i, x, z, y: heightAt(x, z), heading: hd };
  });
}
export const summits = findSummits();
export const starts = [
  ...summits,
  { id: 'park', name: 'Snowpark', x: PARK.x, z: PARK.z + 6, y: planeY(PARK.z + 6), heading: 0 },
];
const POI_NAMES = ['Cabane du trappeur', 'Lac gelé', 'Belvédère', 'Grotte de glace', 'Refuge abandonné', 'Cascade gelée',
  'Croix du sommet', "Épave d'hélicoptère", "Mur d'escalade", 'Source chaude', 'Totem', 'Observatoire'];
function findPois() {
  const r = rng(42), out = [];
  for (let n = 0; n < 4000 && out.length < POI_NAMES.length; n++) {
    const a = r() * 6.283, d = Math.sqrt(r()) * 2100, x = Math.cos(a) * d, z = Math.sin(a) * d, h = heightAt(x, z);
    if (h < 60 || h > 520 || slopeAt(x, z) > 0.45 || parkWeight(x, z) > 0) continue;
    if (out.some((o) => Math.hypot(o.x - x, o.z - z) < 380) || starts.some((o) => Math.hypot(o.x - x, o.z - z) < 150)) continue;
    out.push({ id: 'p' + out.length, name: POI_NAMES[out.length], x, z, y: h });
  }
  return out;
}
export const pois = findPois();
