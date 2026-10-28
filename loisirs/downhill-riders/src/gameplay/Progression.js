/* Réputation -> biomes et niveaux débloqués ; gains de fin de descente ; achats de la boutique. */
import { DIFFS, BIOME_REP } from '../core/config.js';
import { BIOME_IDS } from '../world/Biomes.js';
import { save, persist, addRep } from '../core/save.js';
import { CATALOG, find } from '../bike/parts.js';

export const biomeUnlocked = (id) => save.rep >= BIOME_REP[id];
export const diffUnlocked = (d) => save.rep >= d.minRep;
export const nextUnlock = () => {
  const c = [...BIOME_IDS.map((b) => ({ name: b, rep: BIOME_REP[b], kind: 'biome' })), ...DIFFS.map((d) => ({ name: d.name, rep: d.minRep, kind: 'diff' }))].filter((u) => u.rep > save.rep).sort((a, b) => a.rep - b.rep);
  return c[0] || null;
};

/* gain de réputation d'une descente */
export function runReward({ score, finished, diff, objectives }) {
  let rep = Math.round(score / 8) + (finished ? Math.round(120 * diff.mult) : 0);
  const obj = objectives.filter((o) => o.done).reduce((a, o) => a + o.reward, 0);
  return { rep: rep + obj, base: rep, obj };
}
export function applyReward(r, stats) {
  const beforeBiomes = BIOME_IDS.filter(biomeUnlocked), beforeDiffs = DIFFS.filter(diffUnlocked);
  addRep(r.rep);
  Object.assign(save.stats, { runs: save.stats.runs + 1, crashes: save.stats.crashes + (stats.crashes || 0), bestCombo: Math.max(save.stats.bestCombo, stats.bestCombo || 0), longestJump: Math.max(save.stats.longestJump, stats.longest || 0) });
  persist();
  return { biomes: BIOME_IDS.filter((b) => biomeUnlocked(b) && !beforeBiomes.includes(b)), diffs: DIFFS.filter((d) => diffUnlocked(d) && !beforeDiffs.includes(d)) };
}

export const owns = (cat, id) => save.owned[cat].includes(id);
export function buy(cat, id) { const it = find(cat, id); if (owns(cat, id) || save.cash < it.price) return false; save.cash -= it.price; save.owned[cat].push(id); save.eq[cat] = id; persist(); return true; }
export function equip(cat, id) { if (!owns(cat, id)) return false; save.eq[cat] = id; persist(); return true; }
export { CATALOG };
