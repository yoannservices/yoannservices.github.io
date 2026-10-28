/* Utilitaires communs : aléa déterministe (une spéciale = une graine), maths, formats. */
export const clamp = (x, a, b) => (x < a ? a : x > b ? b : x);
export const lerp = (a, b, t) => a + (b - a) * t;
export const smooth = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
export const sign = (x) => (x < 0 ? -1 : 1);

export function mulberry32(a) {
  return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
}
export function seedFrom(str) { let h = 2166136261; for (const c of String(str)) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; }

function hash1(x, s) {
  let h = Math.imul(x | 0, 374761393) ^ Math.imul(s | 0, 1274126177);
  h = Math.imul(h ^ h >>> 13, 1274126177); return ((h ^ h >>> 16) >>> 0) / 4294967295;
}
// bruit de valeur 1D (0..1) et fractal centré sur 0
export function vnoise1(x, s = 0) {
  const i = Math.floor(x), f = x - i, u = f * f * (3 - 2 * f);
  return hash1(i, s) * (1 - u) + hash1(i + 1, s) * u;
}
export function fbm1(x, o = 3, s = 0) { let t = 0, a = 0.5, f = 1; for (let i = 0; i < o; i++) { t += a * (vnoise1(x * f, s + i * 17) - 0.5) * 2; f *= 2.03; a *= 0.5; } return t; }

// pick pondéré : items [[valeur, poids], ...]
export function pickW(rnd, items) {
  let t = 0; for (const it of items) t += it[1];
  let r = rnd() * t;
  for (const it of items) { r -= it[1]; if (r <= 0) return it[0]; }
  return items[items.length - 1][0];
}

// 83.456 -> "1:23.45"
export function fmtTime(s, signed = false) {
  const neg = s < 0; s = Math.abs(s);
  const m = Math.floor(s / 60), r = s - m * 60;
  const t = `${m}:${r < 10 ? '0' : ''}${r.toFixed(2)}`;
  return signed ? (neg ? '−' : '+') + t.replace(/^0:/, '') : t;
}
export const fmtMoney = (n) => `${Math.round(n).toLocaleString('fr-FR')} €`;
