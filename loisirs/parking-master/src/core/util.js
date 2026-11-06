/* Petites fonctions communes : maths, graine pseudo-aléatoire, bruit de valeur (relief et textures). */
export const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
export const lerp = (a, b, t) => a + (b - a) * t;
export const smooth = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
export const wrapPi = (a) => a - Math.PI * 2 * Math.round(a / (Math.PI * 2));
export const KMH = 3.6;

export function rng(seed) {
  let a = seed | 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const hash2 = (i, j, s) => {
  let h = Math.imul(i, 374761393) ^ Math.imul(j, 668265263) ^ Math.imul(s, 2147483647);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
};
export function noise2(x, z, s = 0) {
  const i = Math.floor(x), j = Math.floor(z), fx = x - i, fz = z - j;
  const u = fx * fx * (3 - 2 * fx), v = fz * fz * (3 - 2 * fz);
  return lerp(lerp(hash2(i, j, s), hash2(i + 1, j, s), u), lerp(hash2(i, j + 1, s), hash2(i + 1, j + 1, s), u), v);
}
export function fbm(x, z, oct = 4, s = 0) {
  let a = 0.5, f = 1, sum = 0, norm = 0;
  for (let o = 0; o < oct; o++) { sum += a * noise2(x * f, z * f, s + o * 17); norm += a; a *= 0.5; f *= 2.03; }
  return sum / norm;
}
export const ridged = (x, z, oct = 4, s = 0) => {
  let a = 0.5, f = 1, sum = 0, norm = 0;
  for (let o = 0; o < oct; o++) { sum += a * (1 - Math.abs(noise2(x * f, z * f, s + o * 31) * 2 - 1)); norm += a; a *= 0.5; f *= 2.1; }
  return sum / norm;
};
