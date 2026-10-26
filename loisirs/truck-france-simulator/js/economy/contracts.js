import { CITIES } from '../map/cities.js';
import { planRoute } from '../map/routing.js';

const CARGO = {
  tarp: [['Palettes de matériaux', 1], ['Meubles', 1.1]],
  reefer: [['Produits frais', 1.25], ['Surgelés', 1.35]],
  tanker: [['Lait', 1.2], ['Carburant', 1.4]],
  flatbed: [['Poutres en acier', 1.15], ['Engins agricoles', 1.3]],
  container: [['Conteneur maritime', 1.1], ['Électronique', 1.3]],
};
const RATE = 2.6;        // €/km de base
const LATE_PER_HOUR = 0.1; // part du prix perdue par heure de retard (plafond 50 %)
const REPAIR_PER_PCT = 40; // € par % de dégâts camion
const TOW_FEE = 2000;      // camion hors service

const pick = (a) => a[Math.floor(Math.random() * a.length)];

/** n contrats pour un type de remorque : villes ≥ 150 km d'écart, prix et échéance (h simulées) calculés sur le trajet rapide. */
export function generateContracts(trailerId, n = 5) {
  const out = [];
  while (out.length < n) {
    const a = pick(CITIES), b = pick(CITIES);
    if (a === b) continue;
    const plan = planRoute([a.id, b.id], 'fast', { consumption: 35 });
    if (plan.km < 150) continue;
    const [cargo, mult] = pick(CARGO[trailerId]);
    const loadFrac = Math.round((0.5 + Math.random() * 0.5) * 20) / 20;
    out.push({
      id: `${Date.now()}-${out.length}`,
      from: a.id, to: b.id, trailerId, cargo, loadFrac,
      km: Math.round(plan.km),
      pay: Math.round((plan.km * RATE * mult * (0.6 + 0.4 * loadFrac)) / 10) * 10,
      deadline: Math.round((plan.hours * 1.25 + 0.75 * Math.floor(plan.hours / 4.5) + 1) * 10) / 10,
    });
  }
  return out;
}

/** r : { hours (temps écoulé), cargoDmg %, truckDmg %, failed }. Retourne les lignes du résumé et le net. */
export function settle(c, r) {
  if (r.failed) return { lines: [['Remorquage', -TOW_FEE]], net: -TOW_FEE, late: 0 };
  const late = Math.max(0, r.hours - c.deadline);
  const lines = [['Prix du contrat', c.pay]];
  if (!late && r.cargoDmg < 5) lines.push(['Bonus ponctualité', Math.round(c.pay * 0.1)]);
  if (late) lines.push([`Retard (${late.toFixed(1)} h)`, -Math.round(c.pay * Math.min(0.5, late * LATE_PER_HOUR))]);
  if (r.cargoDmg > 0) lines.push([`Cargaison abîmée (${Math.round(r.cargoDmg)} %)`, -Math.round((c.pay * r.cargoDmg) / 100)]);
  if (r.truckDmg > 0) lines.push([`Réparations (${Math.round(r.truckDmg)} %)`, -Math.round(r.truckDmg * REPAIR_PER_PCT)]);
  return { lines, net: lines.reduce((s, [, v]) => s + v, 0), late };
}
