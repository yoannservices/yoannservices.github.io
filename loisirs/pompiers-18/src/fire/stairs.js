// Escalier en lacets de l'immeuble (logique pure, testée dans test/logic.mjs).
// Volée k = étage k -> k+1. Voie A (k pair) monte vers +x, voie B (k impair) monte vers -x ; les deux voies sont côte à côte
// dans la cage (pièce du fond au centre), donc deux volées consécutives ne se superposent jamais.
export const STAIR = { x0: -1.4, x1: 1.6, z0: -4.85, z1: -3.65 };
export const LANES = [STAIR, { x0: STAIR.x0, x1: STAIR.x1, z0: -3.4, z1: -2.2 }];

// hauteur de la marche sous (x, z) pour un pied à la hauteur y ; null si on n'est sur aucune volée
export function stairY(x, z, y, flights, H = 3) {
  let best = null;
  for (let k = 0; k < flights; k++) {
    const L = LANES[k % 2];
    if (!(x > L.x0 - 0.05 && x < L.x1 + 0.05 && z > L.z0 && z < L.z1)) continue;
    const f = Math.min(1, Math.max(0, (k % 2 ? L.x1 - x : x - L.x0) / (L.x1 - L.x0))), h = H * (k + f);
    if (Math.abs(h - y) < 1 && (best === null || Math.abs(h - y) < Math.abs(best - y))) best = h;
  }
  return best;
}
