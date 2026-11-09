// Topologie et zones de la ville (reprise de bus-city-simulator). x = est, z = sud (vue de dessus). Cap ψ : avant = (sinψ, cosψ), ψ croissant = virage à gauche.
export const G = 10;          // carrefours par côté
export const P = 100;         // pas de la grille (m)
export const ROAD = 12;       // largeur de chaussée
export const HALF = ROAD / 2;
export const LANE = 3;        // décalage du centre de voie

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
  if (bi === 1 && bj === 4) return 'caserne';
  if (Math.abs(bi - 4) <= 1 && Math.abs(bj - 4) <= 1) return 'centre';
  if (bi >= 6 && bj <= 3) return 'commerce';
  return 'peripherie';
}
export const SPEED_LIMIT = { caserne: 30, centre: 30, peripherie: 50, commerce: 50 }; // km/h

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

// Caserne (îlot 1,4) : le FPT attend devant la remise, nez vers la rue au sud.
export const CASERNE = { x: (1 - 4) * P, z: 0 };
// hauteur du sol : chaussée 0,02 m, trottoir des îlots 0,15 m, cour de la caserne 0,18 m (voir City.build)
export function groundY(x, z) {
  const off = (v) => { const d = (((v - P / 2) % P) + P) % P; return Math.min(d, P - d); };
  if (off(x) < HALF || off(z) < HALF) return 0.02;
  return Math.abs(x - CASERNE.x) < 40 && Math.abs(z - CASERNE.z) < 40 ? 0.18 : 0.15;
}
export const TRUCK_START = { x: CASERNE.x, z: CASERNE.z + 24, heading: 0 };
export const PLAYER_START = { x: CASERNE.x - 6, z: CASERNE.z + 24 };

// Maisons où peuvent tomber les feux : îlot (bi, bj), maison au bord sud de l'îlot, façade vers la rue.
const STREETS = ['rue des Lilas', 'allée des Tilleuls', 'rue Victor-Hugo', 'rue de la Paix', 'impasse des Acacias', 'rue Jean-Jaurès', 'chemin du Moulin', 'rue Pasteur'];
export const MISSION_LOTS = [[0, 0], [1, 2], [3, 1], [2, 7], [5, 7], [7, 6], [8, 5], [0, 6]].map(([bi, bj], k) => {
  const cx = (bi - 4) * P, cz = (bj - 4) * P;
  return { k, bi, bj, x: cx, z: cz + 26, address: `${3 + k * 7} ${STREETS[k]}`, park: { x: cx + 4, z: cz + P / 2 - LANE }, hydrant: { x: cx + 12, z: cz + P / 2 - 7.6 } };
});

// Immeubles R+4 (même emprise que les maisons, au bord sud de l'îlot).
const AVENUES = ['résidence Les Peupliers', 'avenue Foch', 'résidence du Parc', 'rue Émile-Zola'];
export const IMMEUBLE_LOTS = [[2, 3], [6, 7], [1, 6], [3, 7]].map(([bi, bj], k) => {
  const cx = (bi - 4) * P, cz = (bj - 4) * P;
  return { k, bi, bj, x: cx, z: cz + 26, immeuble: true, address: `${5 + k * 11} ${AVENUES[k]}`, park: { x: cx + 4, z: cz + P / 2 - LANE }, hydrant: { x: cx + 12, z: cz + P / 2 - 7.6 } };
});

// Poteaux incendie : un à l'angle sud-est de chaque carrefour, plus un devant chaque maison de mission.
export const HYDRANTS = [
  ...nodes.filter((n) => n.i < G - 1 && n.j < G - 1).map((n) => ({ x: n.x + 8.2, z: n.z + 8.2 })),
  ...MISSION_LOTS.map((l) => l.hydrant),
  ...IMMEUBLE_LOTS.map((l) => l.hydrant),
];

// VSAV dans la travée est de la remise, EPA dans la travée ouest ; hôpital (îlot 6,5) avec dépose des urgences au sud.
export const VSAV_START = { x: CASERNE.x + 12, z: CASERNE.z + 22, heading: 0 };
export const EPA_START = { x: CASERNE.x - 12, z: CASERNE.z + 22, heading: 0 };
export const HOSPITAL = { bi: 6, bj: 5, x: (6 - 4) * P, z: (5 - 4) * P, drop: { x: (6 - 4) * P, z: (5 - 4) * P + P / 2 - LANE } };
// lieux d'un secours à personne : trottoirs au milieu des rues, loin de la caserne
export const SAP_SPOTS = [[2, 2], [6, 2], [3, 6], [7, 4], [1, 7], [5, 3], [8, 7], [4, 8]].map(([i, j], k) => {
  const x = coord(i) + P / 2, z = coord(j) + 8.5;
  return { k, x, z, park: { x: x - 4, z: coord(j) + LANE }, address: `${12 + k * 9} ${['avenue de la République', 'rue du Marché', 'boulevard Gambetta', 'rue des Écoles', 'place de la Mairie', 'rue Carnot', 'quai des Brumes', 'rue de la Gare'][k]}` };
});
