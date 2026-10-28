/* Obstacles de piste. Chaque élément est un profil de hauteur le long de la ligne (u = mètres depuis son début)
   ajouté à la pente de base. Les sauts ont une lèvre, un vide, puis une bosse de réception qui redescend. */
import { smooth, lerp } from '../core/rng.js';

export const K = { NONE: 0, JUMP: 1, TABLE: 2, DROP: 3, BRIDGE: 4, RAIL: 5, TECH: 6, ROLLER: 7, START: 8 };
export const KIND_NAME = ['', 'Saut', 'Tabletop', 'Drop', 'Passerelle', 'Rail', 'Technique', 'Bosses', 'Départ'];

export function makeFeature(type, rng, size, line = 0) {
  const r = (a, b) => lerp(a, b, rng());
  switch (type) {
    case K.JUMP: { const lip = r(6, 8), gap = r(3.5, 8) * size, ld = r(8, 11); return { type, lip, gap, h: r(0.9, 1.5) * size, pit: 1 + 0.3 * size, hl: 0.55 * size, ld, len: lip + gap + 4 + ld }; }
    case K.TABLE: { const up = r(6, 7.5), top = r(5, 9), down = r(6.5, 8); return { type, up, top, down, h: r(0.9, 1.4) * size, len: up + top + down }; }
    case K.DROP: { const D = r(1.4, 2.8) * size; return { type, pre: 4, ramp: 3.6, D, drop: D, len: 14 }; }
    case K.BRIDGE: { const len = r(20, 30); return { type, len, h: 0.6 }; }
    case K.RAIL: return { type, len: r(14, 20) };
    case K.TECH: return { type, len: r(35, 60), amp: r(0.07, 0.14) * size };
    case K.ROLLER: { const w = r(6.5, 8) , n = 3 + Math.floor(rng() * 3); return { type, w, n, amp: r(0.3, 0.5) * size, len: w * n + 4 }; }
    default: return { type: K.NONE, len: 10 };
  }
}

/* Variation d'altitude (m) au point u de l'élément */
export function featureDelta(f, u) {
  if (u < 0 || u > f.len) return 0;
  switch (f.type) {
    case K.JUMP: {
      const { lip, gap, h, pit, hl, ld } = f;
      if (u < lip) return h * Math.pow(u / lip, 2.2);
      if (u < lip + gap) return lerp(h, -pit, smooth(0, Math.min(gap * 0.5, 3), u - lip));
      if (u < lip + gap + 4) return lerp(-pit, hl, smooth(0, 4, u - lip - gap));
      return hl * (1 - smooth(0, ld, u - lip - gap - 4));
    }
    case K.TABLE: {
      if (u < f.up) return f.h * smooth(0, f.up, u);
      if (u < f.up + f.top) return f.h;
      return f.h * (1 - smooth(0, f.down, u - f.up - f.top));
    }
    case K.DROP: return u < f.pre ? 0.12 * smooth(0, f.pre, u) : -f.D * smooth(f.pre, f.pre + f.ramp, u) + 0.12 * (1 - smooth(f.pre, f.pre + 1, u));
    case K.BRIDGE: return f.h * smooth(0, 3, u) * (1 - smooth(f.len - 3, f.len, u));
    case K.ROLLER: { if (u > f.w * f.n) return 0; return f.amp * 0.5 * (1 - Math.cos(2 * Math.PI * u / f.w)); }
    case K.TECH: { const root = Math.max(0, Math.sin(u * 1.7 + f.len)) ** 6; return f.amp * (0.45 * Math.sin(u * 2.3) + 0.9 * root); }
    default: return 0;
  }
}
/* Perte d'altitude permanente après l'élément (drop) */
export const featureStep = (f) => (f.type === K.DROP ? -f.D : 0);
