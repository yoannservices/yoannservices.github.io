export const G = 9.81, CHUNK = 128, VIEW = 6, WORLD_R = 3100;
export const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
export const lerp = (a, b, t) => a + (b - a) * t;
export const sstep = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
export const wrapPi = (a) => a - Math.PI * 2 * Math.round(a / (Math.PI * 2));
export function rng(seed) {
  let a = seed | 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
export const DISC = {
  snowboard: { label: 'Snowboard', icon: '🏂', col: '#22c55e' },
  ski: { label: 'Ski', icon: '⛷️', col: '#3b82f6' },
  wingsuit: { label: 'Wingsuit', icon: '🪂', col: '#f97316' },
};
