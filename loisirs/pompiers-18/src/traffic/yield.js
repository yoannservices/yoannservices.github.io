// Laisser passer un engin prioritaire : logique pure (sans three), testée par test/logic.mjs.
import { HALF, LANE } from '../city/grid.js';

// décalage latéral (m, vers la droite) d'une voiture de largeur `wid` collée au trottoir
export const curbLat = (wid) => Math.max(0, HALF - LANE - wid / 2 - 0.1);

// le point (x, z) est-il à moins de `range` m devant l'engin (x, z, h) ? `back` tolère un peu l'arrière (longueur de l'engin)
export function sirenAhead(siren, x, z, range = 50, back = 4) {
  if (!siren) return false;
  const dx = x - siren.x, dz = z - siren.z;
  return dx * dx + dz * dz < range * range && dx * Math.sin(siren.h) + dz * Math.cos(siren.h) > -back;
}

// piéton sur un passage quand une sirène approche : avant le milieu il fait demi-tour, après il presse le pas.
// p = { t (0..1 depuis son côté de départ), side, back } ; renvoie le facteur de vitesse.
export function pedFlee(p) {
  if (!p.back && p.t < 0.5) { p.side ^= 1; p.t = 1 - p.t; p.back = true; }
  return 2.5;
}
