export const G = 9.81;

/* Niveaux : vert, bleu, rouge, noir. sizeMul agrandit sauts et bosses ; jumps/tech = densité d'obstacles. */
export const DIFFS = [
  { id: 'green', name: 'Verte', col: '#35c759', len: 700, slope: 0.11, curv: 0.035, jumps: 0.45, tech: 0.1, lives: 4, sizeMul: 0.7, minRep: 0, forks: 1, mult: 1 },
  { id: 'blue', name: 'Bleue', col: '#3b82f6', len: 900, slope: 0.14, curv: 0.045, jumps: 0.65, tech: 0.25, lives: 3, sizeMul: 0.9, minRep: 200, forks: 2, mult: 1.25 },
  { id: 'red', name: 'Rouge', col: '#ef4444', len: 1150, slope: 0.17, curv: 0.055, jumps: 0.85, tech: 0.45, lives: 3, sizeMul: 1.1, minRep: 800, forks: 2, mult: 1.6 },
  { id: 'black', name: 'Noire', col: '#9ca3af', len: 1400, slope: 0.2, curv: 0.065, jumps: 1, tech: 0.7, lives: 2, sizeMul: 1.35, minRep: 2000, forks: 3, mult: 2.2 },
];
export const diffById = (id) => DIFFS.find((d) => d.id === id) || DIFFS[0];

/* Réputation nécessaire pour débloquer chaque biome */
export const BIOME_REP = { forest: 0, mountain: 300, desert: 900, snow: 1800, volcano: 3000 };

export const SURF = { dirt: 0, wood: 1, rock: 2, sand: 3, snow: 4, ash: 5 };
// [adhérence, résistance au roulement, amplitude des bosses]
export const SURF_PARAMS = [[1, 0.012, 0.015], [0.9, 0.008, 0], [0.85, 0.02, 0.1], [0.7, 0.04, 0.03], [0.55, 0.02, 0.02], [0.8, 0.03, 0.04]];

export const FIXED_DT = 1 / 120;
