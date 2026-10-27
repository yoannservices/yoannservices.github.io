// Topologie et zones de la ville. x = est, z = sud (vue de dessus). Cap ψ : avant = (sinψ, cosψ), ψ croissant = virage à gauche.
export const G = 10;          // carrefours par côté
export const P = 100;         // pas de la grille (m)
export const ROAD = 12;       // largeur de chaussée
export const HALF = ROAD / 2;
export const LANE = 3;        // décalage du centre de voie
export const CURB_LAT = 4.7;  // centre du bus garé le long du trottoir

// E, S, O, N
export const DIRS = [{ x: 1, z: 0 }, { x: 0, z: 1 }, { x: -1, z: 0 }, { x: 0, z: -1 }];
export const rightOf = (d) => ({ x: -d.z, z: d.x });
export const axisOfDir = (k) => (k % 2 === 0 ? 'x' : 'z');
export const coord = (i) => (i - (G - 1) / 2) * P;
export const inGrid = (i, j) => i >= 0 && i < G && j >= 0 && j < G;
export const nid = (i, j) => i * G + j;
export const ekey = (i1, j1, i2, j2) => { const a = nid(i1, j1), b = nid(i2, j2); return a < b ? `${a}-${b}` : `${b}-${a}`; };
export const wrapAngle = (a) => Math.atan2(Math.sin(a), Math.cos(a));
export const dirFromHeading = (psi) => {
  const fx = Math.sin(psi), fz = Math.cos(psi);
  return Math.abs(fx) > Math.abs(fz) ? (fx > 0 ? 0 : 2) : (fz > 0 ? 1 : 3);
};

export function blockZone(bi, bj) {
  if (bi >= 1 && bi <= 2 && bj >= 4 && bj <= 5) return 'gare';
  if (Math.abs(bi - 4) <= 1 && Math.abs(bj - 4) <= 1) return 'centre';
  if (bi >= 6 && bj <= 3) return 'commerce';
  return 'peripherie';
}
export const ZONE_LEVEL = { gare: 1, centre: 1, peripherie: 2, commerce: 3 };
export const ZONE_LABEL = { gare: 'Quartier de la gare', centre: 'Centre-ville', peripherie: 'Périphérie', commerce: 'Zone commerciale' };
export const SPEED_LIMIT = { gare: 30, centre: 30, peripherie: 50, commerce: 50 }; // km/h

export function zoneAt(x, z) {
  const bi = Math.min(G - 2, Math.max(0, Math.round(x / P) + 4));
  const bj = Math.min(G - 2, Math.max(0, Math.round(z / P) + 4));
  return blockZone(bi, bj);
}

const ROUND = new Set(['5,5', '2,1', '7,7', '8,2']);
export const nodes = [];
for (let i = 0; i < G; i++) for (let j = 0; j < G; j++) {
  const x = coord(i), z = coord(j);
  const type = ROUND.has(`${i},${j}`) ? 'round' : zoneAt(x, z) === 'peripherie' ? 'stop' : 'signal';
  nodes[nid(i, j)] = { i, j, x, z, idx: nid(i, j), type, off: (i * 7 + j * 13) % 38, major: (i + j) % 2 === 0 ? 'x' : 'z' };
}
export const nodeAt = (i, j) => nodes[nid(i, j)];

// bornes de recharge / station-service : sur la voie de droite d'une arête orientée est
export const CHARGERS = [{ i: 1, j: 4, name: 'Dépôt' }, { i: 4, j: 6, name: 'Centre' }, { i: 7, j: 3, name: 'Zone commerciale' }, { i: 2, j: 1, name: 'Périphérie' }]
  .map((c) => {
    const a = nodeAt(c.i, c.j), b = nodeAt(c.i + 1, c.j), mx = (a.x + b.x) / 2;
    return { ...c, x: mx, z: a.z + CURB_LAT, px: mx, pz: a.z + 7.6 };
  });

export const BUS_START = { x: coord(1) + 20, z: coord(4) + LANE, heading: Math.PI / 2 };
