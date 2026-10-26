// node js/map/routing.test.mjs
import assert from 'node:assert/strict';
import { buildGraph, astar } from './graph.js';
import { CITIES } from './cities.js';
import { planAll, planRoute } from './routing.js';

const truck = { consumption: 35 };
const adj = buildGraph();

// graphe connexe : toute ville atteignable depuis Paris
for (const c of CITIES) assert.ok(astar(adj, 'paris', c.id, (e) => e.dist), `inaccessible : ${c.id}`);

// A* (avec heuristique) == Dijkstra (h = 0) en coût
const tot = (p) => p.reduce((s, e) => s + e.dist, 0);
assert.ok(Math.abs(tot(astar(adj, 'brest', 'nice', (e) => e.dist)) - tot(astar(adj, 'brest', 'nice', (e) => e.dist, () => 0))) < 1e-9);

// chaque mode est optimal sur son propre critère
const [fast, eco, scenic] = planAll(['paris', 'marseille'], truck);
assert.ok(fast.hours <= eco.hours + 1e-9 && fast.hours <= scenic.hours + 1e-9, 'rapide pas le plus rapide');
const ecoCost = (r) => r.fuelCost + r.tolls;
assert.ok(ecoCost(eco) <= ecoCost(fast) + 1e-9 && ecoCost(eco) <= ecoCost(scenic) + 1e-9, 'éco pas le moins cher');

// étapes : l'itinéraire passe bien par l'étape
assert.ok(planRoute(['paris', 'bordeaux', 'lyon'], 'fast', truck).path.includes('bordeaux'));
console.log('OK', [fast, eco, scenic].map((r) => `${r.mode}: ${r.km.toFixed(0)} km ${r.hours.toFixed(1)} h ${ecoCost(r).toFixed(0)} €`).join(' | '));
