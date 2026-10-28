/* Zone d'assistance : réparations avec temps limité (30 min). Chaque pièce a un coût en minutes par point de dégât ;
   le joueur choisit ses priorités. Les crevaisons se règlent par roue. */
export const PARTS = [
  { key: 'engine', label: 'Moteur', rate: 0.3, hint: 'puissance' },
  { key: 'steer', label: 'Direction', rate: 0.18, hint: 'trajectoire faussée' },
  { key: 'bumpF', label: 'Pare-chocs avant', rate: 0.05, hint: 'aérodynamique' },
  { key: 'bumpR', label: 'Pare-chocs arrière', rate: 0.05, hint: 'aérodynamique' },
  { key: 'body', label: 'Carrosserie', rate: 0.035, hint: 'esthétique' },
];
export const TIRE_MIN = 5;
export const TIRE_NAMES = ['Avant gauche', 'Avant droit', 'Arrière gauche', 'Arrière droit'];
export const STEP = 10;

/* minutes nécessaires pour amener un plan de réparation à partir de l'état actuel */
export function planCost(dmg, plan) {
  let m = 0;
  for (const p of PARTS) m += Math.max(0, dmg[p.key] - plan[p.key]) * p.rate;
  for (let i = 0; i < 4; i++) if (dmg.tires[i] > 0 && plan.tires[i] === 0) m += TIRE_MIN;
  return m;
}
/* plan = copie des dégâts ; on applique ensuite les réparations choisies */
export function newPlan(dmg) { return JSON.parse(JSON.stringify(dmg)); }
export function applyPlan(dmg, plan) { for (const p of PARTS) dmg[p.key] = plan[p.key]; for (let i = 0; i < 4; i++) dmg.tires[i] = plan.tires[i]; return dmg; }
/* réparation par pas de 10 points sur une pièce, sans dépasser le budget */
export function repairStep(dmg, plan, key, budget) {
  const p = PARTS.find((x) => x.key === key), cur = plan[key]; if (cur <= 0) return false;
  const to = Math.max(0, Math.floor((cur - 0.0001) / STEP) * STEP), trial = JSON.parse(JSON.stringify(plan)); trial[key] = to;
  if (planCost(dmg, trial) > budget + 1e-9) {
    // réparation partielle jusqu'à épuisement du budget
    const left = budget - planCost(dmg, plan), pts = left / p.rate; if (pts < 1) return false;
    plan[key] = Math.max(0, cur - pts); return true;
  }
  plan[key] = to; return true;
}
export function undoStep(dmg, plan, key) { if (plan[key] >= dmg[key]) return false; plan[key] = Math.min(dmg[key], plan[key] + STEP); return true; }
export function toggleTire(dmg, plan, i, budget) {
  if (dmg.tires[i] === 0) return false;
  if (plan.tires[i] > 0) { const t = JSON.parse(JSON.stringify(plan)); t.tires[i] = 0; if (planCost(dmg, t) > budget + 1e-9) return false; plan.tires[i] = 0; } else plan.tires[i] = dmg.tires[i];
  return true;
}
