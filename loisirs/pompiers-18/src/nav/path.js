// Itinéraire sur la grille de routes (logique pure, testée dans test/logic.mjs).
import { G, P, coord, nodeAt, inGrid, DIRS } from '../city/grid.js';

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const MIN = coord(0), MAX = coord(G - 1);

// point de route le plus proche et les deux carrefours de son tronçon
export function snap(p) {
  const jz = clamp(Math.round(p.z / P + (G - 1) / 2), 0, G - 1), ix = clamp(Math.round(p.x / P + (G - 1) / 2), 0, G - 1);
  const hx = clamp(p.x, MIN, MAX), hz = coord(jz), vx = coord(ix), vz = clamp(p.z, MIN, MAX);
  const horiz = Math.hypot(p.x - hx, p.z - hz) <= Math.hypot(p.x - vx, p.z - vz);
  if (horiz) { const i0 = clamp(Math.floor(hx / P + (G - 1) / 2), 0, G - 2); return { x: hx, z: hz, a: nodeAt(i0, jz), b: nodeAt(i0 + 1, jz) }; }
  const j0 = clamp(Math.floor(vz / P + (G - 1) / 2), 0, G - 2); return { x: vx, z: vz, a: nodeAt(ix, j0), b: nodeAt(ix, j0 + 1) };
}

// polyligne : départ projeté, carrefours, arrivée projetée, cible
export function routePoints(from, to) {
  const s = snap(from), e = snap(to);
  const dist = new Map(), prev = new Map(), open = [];
  const push = (n, d, pr) => { if (d < (dist.get(n.idx) ?? Infinity)) { dist.set(n.idx, d); prev.set(n.idx, pr); open.push(n); } };
  for (const n of [s.a, s.b]) push(n, Math.hypot(n.x - s.x, n.z - s.z), null);
  const goal = new Set([e.a.idx, e.b.idx]);
  let best = null, bestD = Infinity;
  // même tronçon : ligne droite
  if ((s.a === e.a && s.b === e.b)) return [{ x: s.x, z: s.z }, { x: e.x, z: e.z }, { x: to.x, z: to.z }];
  while (open.length) {
    open.sort((p, q) => dist.get(p.idx) - dist.get(q.idx));
    const u = open.shift(), du = dist.get(u.idx);
    if (goal.has(u.idx)) { const tot = du + Math.hypot(u.x - e.x, u.z - e.z); if (tot < bestD) { bestD = tot; best = u; } }
    if (du > bestD) break;
    for (const d of DIRS) { const i = u.i + d.x, j = u.j + d.z; if (inGrid(i, j)) push(nodeAt(i, j), du + P, u); }
  }
  const nodes = [];
  for (let n = best; n; n = prev.get(n.idx)) nodes.unshift(n);
  return [{ x: s.x, z: s.z }, ...nodes.map((n) => ({ x: n.x, z: n.z })), { x: e.x, z: e.z }, { x: to.x, z: to.z }];
}

const len = (pts) => pts.reduce((a, p, i) => (i ? a + Math.hypot(p.x - pts[i - 1].x, p.z - pts[i - 1].z) : 0), 0);

// prochain virage : { turn: 'gauche' | 'droite' | null, dist }
export function nextTurn(pts) {
  let acc = 0;
  for (let i = 1; i < pts.length - 2; i++) {
    const a = pts[i - 1], b = pts[i], c = pts[i + 1];
    acc += Math.hypot(b.x - a.x, b.z - a.z);
    const ux = b.x - a.x, uz = b.z - a.z, vx = c.x - b.x, vz = c.z - b.z, lu = Math.hypot(ux, uz), lv = Math.hypot(vx, vz);
    if (lu < 1 || lv < 1) continue;
    const cr = (ux * vz - uz * vx) / (lu * lv);
    if (Math.abs(cr) > 0.5) return { turn: cr > 0 ? 'droite' : 'gauche', dist: acc };   // x = est, z = sud : produit > 0 = virage à droite
  }
  return { turn: null, dist: len(pts) };
}

