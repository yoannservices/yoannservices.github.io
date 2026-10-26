import { CITIES, EDGES } from './cities.js';

export const byId = Object.fromEntries(CITIES.map((c) => [c.id, c]));
const rad = (d) => (d * Math.PI) / 180;

/** Distance à vol d'oiseau en km. */
export function haversine(a, b) {
  const dLat = rad(b.lat - a.lat), dLon = rad(b.lon - a.lon);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLon / 2) ** 2;
  return 12742 * Math.asin(Math.sqrt(h));
}

/** Liste d'adjacence ; la distance routière = vol d'oiseau × facteur de sinuosité. */
export function buildGraph(edges = EDGES) {
  const adj = new Map(CITIES.map((c) => [c.id, []]));
  for (const e of edges) {
    const dist = haversine(byId[e.a], byId[e.b]) * (e.t === 'A' ? 1.1 : 1.2);
    adj.get(e.a).push({ ...e, from: e.a, to: e.b, dist });
    adj.get(e.b).push({ ...e, from: e.b, to: e.a, dist });
  }
  return adj;
}

/**
 * A* (avec h = () => 0 c'est Dijkstra). cost(edge) >= 0 ; h(id) doit sous-estimer.
 * Retourne la liste des arêtes du chemin, ou null s'il n'existe pas.
 */
export function astar(adj, from, to, cost, h = () => 0) {
  const g = new Map([[from, 0]]), prev = new Map(), open = new Map([[from, h(from)]]), done = new Set();
  while (open.size) {
    let cur, best = Infinity;
    for (const [id, f] of open) if (f < best) { best = f; cur = id; } // ≤ 34 nœuds : un tas serait superflu
    if (cur === to) {
      const path = [];
      for (let e = prev.get(cur); e; e = prev.get(e.from)) path.unshift(e);
      return path;
    }
    open.delete(cur);
    done.add(cur);
    for (const e of adj.get(cur)) {
      if (done.has(e.to)) continue;
      const ng = g.get(cur) + cost(e);
      if (ng < (g.get(e.to) ?? Infinity)) {
        g.set(e.to, ng);
        prev.set(e.to, e);
        open.set(e.to, ng + h(e.to));
      }
    }
  }
  return null;
}
