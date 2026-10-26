import { buildGraph, astar, byId, haversine } from './graph.js';

export const FUEL_PRICE = 1.75;   // €/L
export const TOLL_PER_KM = 0.27;  // € poids lourd
const SPEED = { A: 85, N: 65 };    // km/h moyens camion

const speed = (e) => e.v ?? SPEED[e.t];
const graph = buildGraph();

// cost : coût d'une arête ; hk : borne basse du coût par km à vol d'oiseau (heuristique admissible)
const MODES = {
  fast:   { label: 'Rapide', color: '#3b82f6', cost: () => (e) => e.dist / speed(e), hk: () => 1 / 90 },
  eco:    { label: 'Économique', color: '#22c55e', cost: (fpk) => (e) => e.dist * fpk + (e.toll ? e.dist * TOLL_PER_KM : 0), hk: (fpk) => fpk },
  scenic: { label: 'Pittoresque', color: '#f97316', cost: () => (e) => e.dist * (1.8 - 1.4 * e.sc), hk: () => 0.4 },
};
export const MODE_IDS = Object.keys(MODES);
export const modeInfo = (id) => MODES[id];

/**
 * stops : ids de villes (départ, étapes…, arrivée) ; truck : { consumption: L/100 km }.
 * Retourne { mode, path: [ids], km, hours, fuelL, fuelCost, tolls, difficulty } ou null.
 */
export function planRoute(stops, modeId, truck) {
  const m = MODES[modeId], fpk = (truck.consumption / 100) * FUEL_PRICE;
  const cost = m.cost(fpk);
  const edges = [];
  for (let i = 0; i < stops.length - 1; i++) {
    const goal = byId[stops[i + 1]];
    const seg = astar(graph, stops[i], stops[i + 1], cost, (id) => haversine(byId[id], goal) * m.hk(fpk));
    if (!seg) return null;
    edges.push(...seg);
  }
  const km = edges.reduce((s, e) => s + e.dist, 0);
  const kmN = edges.filter((e) => e.t === 'N').reduce((s, e) => s + e.dist, 0);
  const winding = edges.reduce((s, e) => s + e.sc * e.dist, 0) / (km || 1);
  const tolls = edges.reduce((s, e) => s + (e.toll ? e.dist * TOLL_PER_KM : 0), 0);
  const fuelL = (km * truck.consumption) / 100;
  return {
    mode: modeId,
    stops,
    path: edges.length ? [edges[0].from, ...edges.map((e) => e.to)] : stops,
    km,
    hours: edges.reduce((s, e) => s + e.dist / speed(e), 0),
    fuelL,
    fuelCost: fuelL * FUEL_PRICE,
    tolls,
    difficulty: Math.max(1, Math.min(5, Math.round(1 + 2 * (kmN / (km || 1)) + Math.min(1.5, km / 600) + winding))),
  };
}

export const planAll = (stops, truck) => MODE_IDS.map((id) => planRoute(stops, id, truck));
