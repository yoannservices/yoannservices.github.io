/* Données du jeu : voitures, améliorations, environnements, rallyes, pilotes IA, difficultés. */
import { TERRE, GRAVIER, NEIGE, GLACE, ASPHALTE, BOUE } from '../surfaces/surfaces.js';

// mass kg ; wf : part de poids sur l'avant ; L : empattement ; h : hauteur du centre de gravité ; tw : voie ; iz : rayon de giration / L
// power kW ; turbo : perte de couple sans pression (0 = atmosphérique) ; tau : temps de réponse du turbo (s) ; split : part de couple avant (4x4)
// ratios : rapports de boîte × pont ; wing : appendice aéro ; visual : voir car/model.js
export const CARS = [
  {
    id: 'compacte', nom: 'Vega 16T', classe: 'Traction compacte', prix: 0, fact: 1,
    desc: 'Légère et agile. Elle rentre vite dans les virages mais le train avant plonge à la limite.',
    mass: 1080, wf: 0.62, L: 2.5, h: 0.5, tw: 1.46, iz: 0.46, power: 128, rpmMax: 7200, idle: 900, turbo: 0, tau: 0.3,
    drive: 'FWD', split: 1, ratios: [13.9, 8.5, 6.0, 4.6, 3.7, 3.1], rev: 13.4, wheelR: 0.31, steerMax: 0.6, brakeG: 1.05, cda: 0.62, arb: 0.55,
    vis: { color: '#e63946', accent: '#f1faee', L: 3.95, W: 1.72, belt: 0.85, roof: 1.43, nose: 0.66, hood: 0.86, tail: 0.98, trunk: 0.94, wf: 1.2, wr: -1.18, shape: 'hatch', wing: 0, scoop: 0, number: 11 },
  },
  {
    id: 'quatre', nom: 'Tora GT-S', classe: '4x4 turbo', prix: 28000, fact: 1.5,
    desc: 'Transmission intégrale et turbo : motricité sur toutes les surfaces, un peu lourde à relancer.',
    mass: 1280, wf: 0.58, L: 2.62, h: 0.52, tw: 1.52, iz: 0.47, power: 215, rpmMax: 7000, idle: 950, turbo: 0.32, tau: 0.5,
    drive: 'AWD', split: 0.42, ratios: [13.2, 8.6, 6.4, 5.0, 4.0, 3.3], rev: 12.8, wheelR: 0.325, steerMax: 0.56, brakeG: 1.12, cda: 0.68, arb: 0.5,
    vis: { color: '#2b6cff', accent: '#ffd23f', L: 4.45, W: 1.78, belt: 0.88, roof: 1.45, nose: 0.68, hood: 0.88, tail: 1.02, trunk: 0.98, wf: 1.34, wr: -1.28, shape: 'sedan', wing: 1, scoop: 1, number: 7 },
  },
  {
    id: 'propulsion', nom: 'Sierra RS 77', classe: 'Propulsion classique', prix: 14000, fact: 1.2,
    desc: 'Propulsion atmosphérique à l\'ancienne : de la glisse, du plaisir, mais il faut savoir rattraper l\'arrière.',
    mass: 1060, wf: 0.52, L: 2.55, h: 0.48, tw: 1.42, iz: 0.45, power: 150, rpmMax: 7800, idle: 1000, turbo: 0, tau: 0.3,
    drive: 'RWD', split: 0, ratios: [14.3, 9.0, 6.5, 5.0, 4.1, 3.4], rev: 13.8, wheelR: 0.325, steerMax: 0.66, brakeG: 1.02, cda: 0.64, arb: 0.45,
    vis: { color: '#f4a300', accent: '#1d1d1f', L: 4.1, W: 1.66, belt: 0.84, roof: 1.36, nose: 0.62, hood: 0.82, tail: 0.9, trunk: 0.9, wf: 1.28, wr: -1.27, shape: 'coupe', wing: 0, scoop: 0, number: 3 },
  },
  {
    id: 'groupb', nom: 'Tigre S4', classe: 'Groupe B', prix: 85000, fact: 2.5,
    desc: 'Moteur central, 450 chevaux, 980 kg. Terriblement rapide, terriblement nerveuse : à ne pas mettre entre toutes les mains.',
    mass: 980, wf: 0.44, L: 2.4, h: 0.46, tw: 1.56, iz: 0.38, power: 340, rpmMax: 7600, idle: 1000, turbo: 0.52, tau: 0.68,
    drive: 'AWD', split: 0.3, ratios: [12.6, 8.4, 6.3, 4.9, 3.9, 3.2], rev: 12.4, wheelR: 0.335, steerMax: 0.54, brakeG: 1.2, cda: 0.7, arb: 0.4,
    vis: { color: '#f5f5f5', accent: '#d90429', L: 4.0, W: 1.84, belt: 0.84, roof: 1.34, nose: 0.6, hood: 0.8, tail: 1.02, trunk: 1.0, wf: 1.18, wr: -1.2, shape: 'groupb', wing: 2, scoop: 2, number: 1 },
  },
];

// améliorations : 3 niveaux, prix = base[niveau] × fact de la voiture
export const UPGRADES = [
  { id: 'moteur', nom: 'Moteur', desc: '+7 % de puissance par niveau', base: [4000, 8500, 16000] },
  { id: 'freins', nom: 'Freins', desc: '+7 % de freinage par niveau', base: [2500, 5500, 11000] },
  { id: 'suspension', nom: 'Suspensions', desc: 'Meilleure tenue sur sol cassé, moins de roulis', base: [3000, 6500, 12000] },
  { id: 'protection', nom: 'Protections', desc: '−18 % de dégâts par niveau', base: [2000, 4500, 9000] },
];

export const ENVS = {
  foret: { nom: 'Forêt de terre', hw: 3.7, ground: [0.22, 0.28, 0.14], sky: 'temperate', amp: 22, surf: 'foret', verge: TERRE, trees: ['sapin', 'feuillu'], density: 0.85, rocks: 0.15, teamSurface: TERRE, tire: 'terre' },
  neige: { nom: 'Neige et glace', hw: 3.5, ground: [0.88, 0.9, 0.95], sky: 'cold', amp: 34, surf: 'neige', verge: NEIGE, trees: ['sapinneige'], density: 0.75, rocks: 0.1, teamSurface: NEIGE, tire: 'neige' },
  asphalte: { nom: 'Asphalte de montagne', hw: 4.0, ground: [0.30, 0.34, 0.2], sky: 'alpine', amp: 62, surf: 'asphalte', verge: GRAVIER, trees: ['sapin', 'sapinclair'], density: 0.4, rocks: 0.6, teamSurface: ASPHALTE, tire: 'route' },
  gravier: { nom: 'Gravier méditerranéen', hw: 3.8, ground: [0.62, 0.55, 0.38], sky: 'med', amp: 30, surf: 'gravier', verge: GRAVIER, trees: ['cypres', 'olivier'], density: 0.45, rocks: 0.45, teamSurface: GRAVIER, tire: 'terre' },
};

export const RALLIES = [
  { id: 'forets', nom: 'Rallye des Grands Bois', env: ['foret'], stages: [3200, 4200, 3800, 5000], prize: [12000, 7000, 4500, 3000, 2000, 1200], base: 'GB', req: null, desc: 'Pistes de terre tortueuses en pleine forêt, ornières et boue.' },
  { id: 'neige', nom: 'Rallye Nordique', env: ['neige'], stages: [3400, 4400, 4000, 5200], prize: [18000, 10000, 6500, 4500, 3000, 1800], base: 'NO', req: 'forets', desc: 'Neige tassée, plaques de glace et nuit polaire.' },
  { id: 'montagne', nom: 'Rallye de la Corniche', env: ['asphalte'], stages: [3600, 4600, 4200, 5400, 6000], prize: [24000, 14000, 9000, 6000, 4000, 2500], base: 'CO', req: 'neige', desc: 'Routes de col en asphalte : épingles, ponts et gouffres.' },
  { id: 'mediterranee', nom: 'Rallye Méditerranée', env: ['gravier'], stages: [3800, 4800, 4400, 5600, 6200], prize: [30000, 18000, 11000, 7500, 5000, 3000], base: 'ME', req: 'montagne', desc: 'Gravier blanc, garrigue, sauts et gués au soleil.' },
  { id: 'mondial', nom: 'Grand Rallye Mondial', env: ['foret', 'neige', 'asphalte', 'gravier', 'foret', 'asphalte'], stages: [4200, 4400, 5000, 5400, 5600, 6400], prize: [60000, 36000, 24000, 16000, 10000, 6000], base: 'GR', req: 'mediterranee', desc: 'Six spéciales sur quatre terrains : le championnat ultime.' },
];

export const AI_NAMES = ['M. Laroche', 'S. Virtanen', 'K. Novak', 'A. Moretti', 'J. Duval', 'T. Okada', 'L. Hansen', 'P. Garcia', 'R. Haddad', 'E. Silva', 'C. Dubois', 'N. Petrov', 'F. Rossi', 'H. Berg'];

// niveau IA : multiplicateur de temps (plus bas = plus rapide) et dispersion
export const DIFFS = [
  { id: 0, nom: 'Facile', k: 1.3, spread: 0.08 },
  { id: 1, nom: 'Normal', k: 1.2, spread: 0.07 },
  { id: 2, nom: 'Difficile', k: 1.12, spread: 0.06 },
  { id: 3, nom: 'Expert', k: 1.065, spread: 0.05 },
];

export const SETUP_DEFAULT = { suspF: 1, suspR: 1, frein: 0.6, diffAv: 0.3, diffAr: 0.3, pneus: 'auto' };
export const TIME_OF_DAY = ['jour', 'crepuscule', 'nuit'];
