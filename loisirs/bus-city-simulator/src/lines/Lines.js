// Lignes = boucles rectangulaires sur la grille, parcourues dans le sens horaire (arrêts sur la voie de droite).
import { DIRS, rightOf, nodeAt, ekey, coord, CURB_LAT, zoneAt, P } from '../city/grid.js';

export const LINE_DEFS = [
  { id: 'L1', name: 'Ligne 1 · Gare – Centre', rect: [1, 4, 5, 6], level: 1, price: 0, color: '#ffb000' },
  { id: 'L2', name: 'Ligne 2 · Circulaire Centre', rect: [3, 3, 6, 6], level: 1, price: 1000, color: '#4aa3ff' },
  { id: 'L3', name: 'Ligne 3 · Périphérie Nord-Ouest', rect: [0, 0, 4, 3], level: 2, price: 2500, color: '#3ddc84' },
  { id: 'L4', name: 'Ligne 4 · Zone commerciale', rect: [6, 0, 9, 3], level: 3, price: 5000, color: '#ff6bd6' },
  { id: 'L5', name: 'Ligne 5 · Grande ceinture', rect: [0, 0, 9, 9], level: 4, price: 9000, color: '#b48bff' },
];

const NAMES = ['Gare', 'Marché', 'Mairie', 'Hôpital', 'Lycée', 'Parc', 'Musée', 'Théâtre', 'Stade', 'Port', 'Cathédrale', 'Université',
  'Poste', 'Bibliothèque', 'Piscine', 'Cinéma', 'Jardin', 'Place Neuve', 'Fontaine', 'Zone Sud'];
export const SPEED_PLAN = 8;     // m/s utilisé pour l'horaire théorique
export const DWELL = 16;         // s d'arrêt prévues

function buildLine(def, defIndex) {
  const [i0, j0, i1, j1] = def.rect;
  // nœuds dans le sens horaire (z vers le bas) : haut vers l'est, droite vers le sud, bas vers l'ouest, gauche vers le nord
  const path = [];
  for (let i = i0; i < i1; i++) path.push([i, j0]);
  for (let j = j0; j < j1; j++) path.push([i1, j]);
  for (let i = i1; i > i0; i--) path.push([i, j1]);
  for (let j = j1; j > j0; j--) path.push([i0, j]);
  const E = path.length;
  const n = Math.min(12, Math.max(6, Math.floor(E * 0.7)));
  const stops = [];
  for (let k = 0; k < n; k++) {
    const e = Math.floor((k * E) / n);
    const [ai, aj] = path[e], [bi, bj] = path[(e + 1) % E];
    const dk = DIRS.findIndex((d) => d.x === Math.sign(bi - ai) && d.z === Math.sign(bj - aj));
    const d = DIRS[dk], r = rightOf(d), a = nodeAt(ai, aj), b = nodeAt(bi, bj);
    const mx = (a.x + b.x) / 2, mz = (a.z + b.z) / 2;
    stops.push({
      k, line: def.id, edgeIndex: e, edge: ekey(ai, aj, bi, bj), dirK: dk, axis: dk % 2 === 0 ? 'x' : 'z',
      x: mx + r.x * CURB_LAT, z: mz + r.z * CURB_LAT, hx: d.x, hz: d.z, heading: Math.atan2(d.x, d.z),
      shelter: { x: mx + r.x * 7.4, z: mz + r.z * 7.4 },
      name: NAMES[(defIndex * 5 + k * 3) % NAMES.length], zone: zoneAt(mx, mz),
    });
  }
  // horaire théorique (s depuis le début de la course)
  const sched = [15];
  for (let k = 1; k < n; k++) {
    const edges = stops[k].edgeIndex - stops[k - 1].edgeIndex;
    sched.push(sched[k - 1] + DWELL + (edges * P) / SPEED_PLAN);
  }
  const lap = (E * P) / SPEED_PLAN + n * DWELL;
  return { ...def, path: path.map(([i, j]) => ({ i, j, x: coord(i), z: coord(j) })), stops, sched, lapTime: lap };
}

export const LINES = LINE_DEFS.map(buildLine);
export const allStops = LINES.flatMap((l) => l.stops);
