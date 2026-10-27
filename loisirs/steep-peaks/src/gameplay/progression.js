import { data, save } from '../core/save.js';

// Matériel et tenues débloqués par niveau. Tout le visuel est généré par code (palette + motif).
export const CATALOG = {
  snowboard: [
    { id: 'b0', name: 'Classic 152', lvl: 1, speed: 1, grip: 1, pop: 1, agi: 1, pal: ['#22c55e', '#0f0f13'], deco: 'stripes' },
    { id: 'b1', name: 'Freeride 158', lvl: 3, speed: 1.08, grip: 1.05, pop: 0.95, agi: 0.95, pal: ['#3b82f6', '#e2e8f0'], deco: 'waves' },
    { id: 'b2', name: 'Park Pop 150', lvl: 5, speed: 0.97, grip: 1, pop: 1.2, agi: 1.1, pal: ['#f97316', '#1a1a24'], deco: 'dots' },
    { id: 'b3', name: 'Carver Pro', lvl: 8, speed: 1.15, grip: 1.2, pop: 1, agi: 1.05, pal: ['#a855f7', '#e2e8f0'], deco: 'checks' },
    { id: 'b4', name: 'Aurora', lvl: 12, speed: 1.2, grip: 1.25, pop: 1.2, agi: 1.15, pal: ['#06b6d4', '#ec4899'], deco: 'waves' },
  ],
  ski: [
    { id: 's0', name: 'All-Mountain', lvl: 1, speed: 1, grip: 1, pop: 1, agi: 1, pal: ['#3b82f6', '#0f0f13'], deco: 'stripes' },
    { id: 's1', name: 'Slalom GS', lvl: 2, speed: 1.06, grip: 1.15, pop: 0.95, agi: 1.1, pal: ['#ef4444', '#e2e8f0'], deco: 'checks' },
    { id: 's2', name: 'Twin Tip', lvl: 4, speed: 0.98, grip: 1, pop: 1.2, agi: 1.05, pal: ['#eab308', '#1a1a24'], deco: 'dots' },
    { id: 's3', name: 'Poudreuse 110', lvl: 7, speed: 1.12, grip: 1.05, pop: 1.05, agi: 1, pal: ['#10b981', '#e2e8f0'], deco: 'waves' },
    { id: 's4', name: 'Apex', lvl: 11, speed: 1.2, grip: 1.25, pop: 1.15, agi: 1.15, pal: ['#f97316', '#a855f7'], deco: 'stripes' },
  ],
  wingsuit: [
    { id: 'w0', name: 'Flyer', lvl: 1, lift: 1, drag: 1, turn: 1, pal: ['#f97316', '#1a1a24'], deco: 'stripes' },
    { id: 'w1', name: 'Glider', lvl: 4, lift: 1.12, drag: 0.95, turn: 0.95, pal: ['#3b82f6', '#e2e8f0'], deco: 'waves' },
    { id: 'w2', name: 'Racer', lvl: 6, lift: 1, drag: 0.88, turn: 1.1, pal: ['#ef4444', '#0f0f13'], deco: 'checks' },
    { id: 'w3', name: 'Phantom', lvl: 9, lift: 1.2, drag: 0.85, turn: 1.15, pal: ['#a855f7', '#06b6d4'], deco: 'dots' },
  ],
  outfit: [
    { id: 'o0', name: 'Classique', lvl: 1, jacket: '#ef4444', pants: '#1f2937', helmet: '#e2e8f0', goggle: '#38bdf8', pattern: 'none' },
    { id: 'o1', name: 'Rayures', lvl: 2, jacket: '#3b82f6', pants: '#0f172a', helmet: '#3b82f6', goggle: '#fbbf24', pattern: 'stripes' },
    { id: 'o2', name: 'Camo Neige', lvl: 3, jacket: '#cbd5e1', pants: '#64748b', helmet: '#94a3b8', goggle: '#f97316', pattern: 'camo' },
    { id: 'o3', name: 'Vagues', lvl: 5, jacket: '#06b6d4', pants: '#155e75', helmet: '#e2e8f0', goggle: '#ec4899', pattern: 'waves' },
    { id: 'o4', name: 'Pixel', lvl: 6, jacket: '#22c55e', pants: '#14532d', helmet: '#0f0f13', goggle: '#22c55e', pattern: 'checks' },
    { id: 'o5', name: 'Pois Néon', lvl: 8, jacket: '#a855f7', pants: '#1e1b4b', helmet: '#ec4899', goggle: '#eab308', pattern: 'dots' },
    { id: 'o6', name: 'Légende', lvl: 10, jacket: '#eab308', pants: '#0f0f13', helmet: '#eab308', goggle: '#ef4444', pattern: 'stripes' },
  ],
};

const need = (L) => Math.round(120 * Math.pow(L - 1, 1.7)); // XP cumulé requis pour atteindre le niveau L
export const levelOf = (xp) => { let L = 1; while (xp >= need(L + 1)) L++; return L; };
export const progress = () => {
  const L = levelOf(data.xp), a = need(L), b = need(L + 1);
  return { level: L, into: data.xp - a, span: b - a };
};
export const prog = {
  onLevel: null,
  get level() { return levelOf(data.xp); },
  addXp(n) {
    const before = levelOf(data.xp);
    data.xp += Math.round(n);
    const after = levelOf(data.xp);
    if (after > before) {
      const unlocked = Object.values(CATALOG).flat().filter((i) => i.lvl > before && i.lvl <= after);
      this.onLevel?.(after, unlocked);
    }
    save();
  },
  equipped(kind) {
    const list = CATALOG[kind];
    return list.find((i) => i.id === data.equip[kind] && i.lvl <= this.level) || list[0];
  },
  equip(kind, id) {
    const it = CATALOG[kind].find((i) => i.id === id);
    if (it && it.lvl <= this.level) { data.equip[kind] = id; save(); return true; }
    return false;
  },
};
