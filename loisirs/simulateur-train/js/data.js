/* ═══════════════════════════════════════════════════════════
   SIMULATEUR TRAIN — DONNÉES
   Gares de France, engins moteurs, wagons et procédures.
   ═══════════════════════════════════════════════════════════ */
'use strict';
const TS = window.TS = window.TS || {};

/* ── Gares (q = nombre de voies à quai, v = électrification) ── */
TS.STATIONS = [
  ['paris-lyon', 'Paris-Gare-de-Lyon', 48.8443, 2.3743, 12, 1500],
  ['paris-nord', 'Paris-Nord', 48.8809, 2.3553, 12, 25000],
  ['paris-est', 'Paris-Est', 48.8768, 2.3592, 10, 25000],
  ['paris-mtp', 'Paris-Montparnasse', 48.8412, 2.3205, 12, 1500],
  ['paris-stl', 'Paris-Saint-Lazare', 48.8763, 2.3254, 12, 25000],
  ['paris-aus', 'Paris-Austerlitz', 48.8420, 2.3655, 10, 1500],
  ['lille', 'Lille-Flandres', 50.6366, 3.0707, 10, 25000],
  ['arras', 'Arras', 50.2866, 2.7810, 6, 25000],
  ['amiens', 'Amiens', 49.8902, 2.3080, 8, 25000],
  ['calais', 'Calais-Ville', 50.9530, 1.8510, 4, 25000],
  ['rouen', 'Rouen-Rive-Droite', 49.4489, 1.0937, 6, 25000],
  ['lehavre', 'Le Havre', 49.4930, 0.1250, 6, 25000],
  ['caen', 'Caen', 49.1764, -0.3484, 6, 25000],
  ['cherbourg', 'Cherbourg', 49.6334, -1.6224, 4, 25000],
  ['rennes', 'Rennes', 48.1035, -1.6722, 8, 25000],
  ['stbrieuc', 'Saint-Brieuc', 48.5072, -2.7660, 4, 25000],
  ['brest', 'Brest', 48.3880, -4.4795, 4, 25000],
  ['quimper', 'Quimper', 47.9944, -4.0918, 4, 25000],
  ['vannes', 'Vannes', 47.6650, -2.7520, 4, 25000],
  ['nantes', 'Nantes', 47.2172, -1.5424, 8, 25000],
  ['angers', 'Angers-Saint-Laud', 47.4645, -0.5567, 6, 25000],
  ['lemans', 'Le Mans', 47.9956, 0.1924, 8, 25000],
  ['tours', 'Saint-Pierre-des-Corps', 47.3858, 0.7239, 8, 1500],
  ['orleans', 'Les Aubrais-Orléans', 47.9260, 1.9070, 6, 1500],
  ['poitiers', 'Poitiers', 46.5823, 0.3335, 6, 1500],
  ['larochelle', 'La Rochelle-Ville', 46.1530, -1.1452, 4, 1500],
  ['angouleme', 'Angoulême', 45.6534, 0.1652, 4, 1500],
  ['bordeaux', 'Bordeaux-Saint-Jean', 44.8257, -0.5560, 10, 1500],
  ['arcachon', 'Arcachon', 44.6587, -1.1680, 4, 1500],
  ['dax', 'Dax', 43.7202, -1.0505, 4, 1500],
  ['bayonne', 'Bayonne', 43.4966, -1.4706, 4, 1500],
  ['hendaye', 'Hendaye', 43.3530, -1.7810, 6, 1500],
  ['pau', 'Pau', 43.2915, -0.3693, 4, 1500],
  ['tarbes', 'Tarbes', 43.2410, 0.0710, 4, 1500],
  ['agen', 'Agen', 44.2068, 0.6213, 4, 1500],
  ['montauban', 'Montauban-Ville-Bourbon', 44.0145, 1.3428, 4, 1500],
  ['toulouse', 'Toulouse-Matabiau', 43.6113, 1.4535, 8, 1500],
  ['carcassonne', 'Carcassonne', 43.2181, 2.3519, 4, 1500],
  ['narbonne', 'Narbonne', 43.1904, 3.0058, 6, 1500],
  ['perpignan', 'Perpignan', 42.6961, 2.8796, 6, 1500],
  ['beziers', 'Béziers', 43.3363, 3.2185, 4, 1500],
  ['montpellier', 'Montpellier-Saint-Roch', 43.6047, 3.8805, 8, 1500],
  ['nimes', 'Nîmes', 43.8326, 4.3660, 6, 1500],
  ['avignon', 'Avignon-TGV', 43.9216, 4.7862, 4, 25000],
  ['marseille', 'Marseille-Saint-Charles', 43.3027, 5.3806, 12, 1500],
  ['aix', 'Aix-en-Provence-TGV', 43.4553, 5.3172, 4, 25000],
  ['toulon', 'Toulon', 43.1281, 5.9296, 6, 1500],
  ['cannes', 'Cannes', 43.5534, 7.0196, 4, 1500],
  ['nice', 'Nice-Ville', 43.7046, 7.2619, 8, 1500],
  ['valence', 'Valence-TGV', 44.9914, 4.9783, 4, 25000],
  ['grenoble', 'Grenoble', 45.1913, 5.7147, 6, 1500],
  ['lyon', 'Lyon-Part-Dieu', 45.7606, 4.8597, 12, 1500],
  ['stetienne', 'Saint-Étienne-Châteaucreux', 45.4432, 4.3995, 6, 1500],
  ['chambery', 'Chambéry', 45.5713, 5.9191, 6, 1500],
  ['annecy', 'Annecy', 45.9020, 6.1218, 4, 1500],
  ['macon', 'Mâcon-Loché-TGV', 46.2826, 4.7783, 4, 25000],
  ['creusot', 'Le Creusot-Montceau-TGV', 46.7650, 4.4990, 4, 25000],
  ['dijon', 'Dijon-Ville', 47.3233, 5.0273, 8, 1500],
  ['besancon', 'Besançon-Viotte', 47.2468, 6.0221, 4, 25000],
  ['mulhouse', 'Mulhouse-Ville', 47.7419, 7.3424, 6, 25000],
  ['strasbourg', 'Strasbourg', 48.5850, 7.7349, 10, 25000],
  ['metz', 'Metz-Ville', 49.1096, 6.1773, 8, 25000],
  ['nancy', 'Nancy-Ville', 48.6896, 6.1745, 8, 25000],
  ['reims', 'Reims', 49.2590, 4.0247, 6, 25000],
  ['troyes', 'Troyes', 48.2965, 4.0650, 4, 25000],
  ['clermont', 'Clermont-Ferrand', 45.7787, 3.1003, 6, 1500],
  ['vichy', 'Vichy', 46.1260, 3.4340, 4, 1500],
  ['nevers', 'Nevers', 46.9870, 3.1500, 4, 1500],
  ['bourges', 'Bourges', 47.0900, 2.4080, 4, 1500],
  ['limoges', 'Limoges-Bénédictins', 45.8361, 1.2679, 6, 1500],
  ['brive', 'Brive-la-Gaillarde', 45.1530, 1.5290, 4, 1500],
  ['laroche', 'Laroche-Migennes', 47.9580, 3.5110, 4, 1500],
].map(([id, n, lat, lon, q, v]) => ({ id, n, lat, lon, q, v }));
TS.STATION = Object.fromEntries(TS.STATIONS.map(s => [s.id, s]));

/* Contour simplifié de la France métropolitaine (lat, lon) */
TS.FRANCE = [[51.05,2.37],[50.95,1.85],[50.73,1.6],[50.2,1.6],[49.93,1.08],[49.7,0.2],[49.45,0.1],[49.3,-0.1],[49.35,-0.9],[49.4,-1.2],[49.7,-1.25],[49.65,-1.94],[49.35,-1.8],[48.85,-1.57],[48.65,-1.4],[48.65,-2.0],[48.5,-2.7],[48.85,-3.2],[48.7,-4.0],[48.6,-4.6],[48.35,-4.78],[48.1,-4.3],[47.8,-4.37],[47.8,-3.9],[47.7,-3.4],[47.5,-2.8],[47.3,-2.5],[47.15,-2.2],[46.9,-2.1],[46.5,-1.8],[46.2,-1.2],[45.7,-1.25],[45.3,-1.15],[44.65,-1.25],[44.0,-1.35],[43.5,-1.55],[43.35,-1.78],[43.0,-1.3],[42.85,0.0],[42.7,0.7],[42.6,1.5],[42.45,2.0],[42.45,3.15],[42.8,3.05],[43.2,3.25],[43.45,3.65],[43.55,4.1],[43.35,4.85],[43.35,5.35],[43.1,5.9],[43.15,6.4],[43.4,6.85],[43.6,7.1],[43.75,7.5],[44.1,7.7],[44.4,6.9],[44.85,6.95],[45.1,6.7],[45.4,7.15],[45.9,6.8],[46.4,6.8],[46.2,6.05],[46.6,6.15],[47.0,6.7],[47.5,7.0],[47.6,7.6],[48.0,7.6],[48.5,7.8],[48.95,8.2],[49.1,7.5],[49.15,6.7],[49.5,6.35],[49.55,5.8],[49.8,5.1],[50.15,4.85],[49.95,4.2],[50.3,4.0],[50.5,3.6],[50.75,3.2],[50.8,2.6],[51.05,2.37]];

/* ── Engins moteurs ──
   kind : loco (locomotive + wagons), tgv / emu (rame automotrice, voitures du même type)
   trac : elec | diesel ; power kW, fmax kN, eb = frein électrique kN, mass t, len m */
TS.LOCOS = [
  { id: 'tgv', cat: 'pax', name: 'TGV Duplex', sub: 'Rame à grande vitesse · 2 motrices', kind: 'tgv', trac: 'elec', bi: true,
    vmax: 320, power: 8800, fmax: 220, eb: 160, mass: 68, len: 22.2, model: 'tgv', wagon: 'duplex', wmin: 4, wmax: 8, wdef: 8,
    liv: [['Argent & bleu', '#dfe3e8', '#3b4f9a'], ['Blanc & violet', '#f2f2f4', '#7a3d8f'], ['Carmillon', '#d9dbe0', '#b8213b']] },
  { id: 'bb26000', cat: 'pax', name: 'BB 26000 « Sybic »', sub: 'Locomotive électrique bicourant', kind: 'loco', trac: 'elec', bi: true,
    vmax: 200, power: 5600, fmax: 320, eb: 150, mass: 91, len: 17.7, model: 'bbmod', wagons: ['corail', 'couchette', 'vb2n'],
    liv: [['En voyage', '#c8ccd2', '#c0392b'], ['Béton & orange', '#cfcac0', '#e8742a'], ['Bleu Intercités', '#1d3d73', '#e7ecf2']] },
  { id: 'bb22200', cat: 'pax', name: 'BB 22200', sub: 'Locomotive électrique bicourant « nez cassé »', kind: 'loco', trac: 'elec', bi: true,
    vmax: 160, power: 4360, fmax: 260, eb: 120, mass: 89, len: 17.5, model: 'bbnez', wagons: ['corail', 'couchette', 'vb2n'],
    liv: [['Béton & orange', '#cfcac0', '#e8742a'], ['Bleu & blanc', '#1f4c96', '#eeeeee'], ['Carmillon', '#d9dbe0', '#b8213b']] },
  { id: 'bb67400', cat: 'pax', name: 'BB 67400', sub: 'Locomotive diesel', kind: 'loco', trac: 'diesel',
    vmax: 140, power: 1400, fmax: 230, eb: 0, mass: 80, len: 17.1, model: 'bbdiesel', wagons: ['corail', 'couchette', 'vb2n'],
    liv: [['Bleu & blanc', '#1f4c96', '#eeeeee'], ['Fret vert', '#3d7a4a', '#d8d8d0'], ['Béton & orange', '#cfcac0', '#e8742a']] },
  { id: 'regio2n', cat: 'pax', name: 'Regio 2N', sub: 'Automotrice électrique à deux niveaux (TER)', kind: 'emu', trac: 'elec', bi: true,
    vmax: 200, power: 3200, fmax: 190, eb: 120, mass: 50, len: 20, model: 'r2n', wagon: 'r2n', wmin: 2, wmax: 8, wdef: 4,
    liv: [['TER gris & bleu', '#e6e8ea', '#245aa6'], ['Région rouge', '#e6e8ea', '#c62828'], ['Région verte', '#e6e8ea', '#2e8b57']] },
  { id: 'agc', cat: 'pax', name: 'AGC X 76500', sub: 'Autorail diesel grande capacité', kind: 'emu', trac: 'diesel',
    vmax: 160, power: 1300, fmax: 130, eb: 0, mass: 52, len: 19.2, model: 'agc', wagon: 'agcm', wmin: 0, wmax: 2, wdef: 1,
    liv: [['TER gris & bleu', '#e6e8ea', '#245aa6'], ['Région orange', '#e6e8ea', '#e8742a'], ['Région violette', '#e6e8ea', '#7a3d8f']] },
  { id: 'bb27000', cat: 'fret', name: 'BB 27000 « Prima »', sub: 'Locomotive électrique bicourant fret', kind: 'loco', trac: 'elec', bi: true,
    vmax: 140, power: 4200, fmax: 320, eb: 160, mass: 90, len: 19.5, model: 'prima', wagons: ['citerne', 'conteneur', 'tombereau', 'couvert', 'autos', 'cereales'],
    liv: [['Fret vert', '#3d7a4a', '#d8d8d0'], ['Béton & orange', '#cfcac0', '#e8742a'], ['Gris & rouge', '#8c9096', '#c0392b']] },
  { id: 'bb36000', cat: 'fret', name: 'BB 36000 « Astride »', sub: 'Locomotive électrique tricourant', kind: 'loco', trac: 'elec', bi: true,
    vmax: 200, power: 5600, fmax: 320, eb: 170, mass: 90, len: 19.1, model: 'bbmod', wagons: ['citerne', 'conteneur', 'tombereau', 'couvert', 'autos', 'cereales'],
    liv: [['Fret vert', '#3d7a4a', '#d8d8d0'], ['Béton & orange', '#cfcac0', '#e8742a'], ['Bleu Europe', '#1d3d73', '#e7ecf2']] },
  { id: 'bb75000', cat: 'fret', name: 'BB 75000', sub: 'Locomotive diesel-électrique fret', kind: 'loco', trac: 'diesel',
    vmax: 120, power: 1350, fmax: 300, eb: 0, mass: 84, len: 20.3, model: 'prima', wagons: ['citerne', 'conteneur', 'tombereau', 'couvert', 'autos', 'cereales'],
    liv: [['Fret vert', '#3d7a4a', '#d8d8d0'], ['Gris & jaune', '#8c9096', '#f2c12e'], ['Béton & orange', '#cfcac0', '#e8742a']] },
  { id: 'cc72000', cat: 'fret', name: 'CC 72000', sub: 'Locomotive diesel lourde à 6 essieux', kind: 'loco', trac: 'diesel',
    vmax: 160, power: 2250, fmax: 380, eb: 0, mass: 114, len: 20.2, model: 'ccdiesel', wagons: ['citerne', 'conteneur', 'tombereau', 'couvert', 'autos', 'cereales'],
    liv: [['Bleu & blanc', '#1f4c96', '#eeeeee'], ['Fret vert', '#3d7a4a', '#d8d8d0'], ['Gris & jaune', '#8c9096', '#f2c12e']] },
];
TS.LOCO = Object.fromEntries(TS.LOCOS.map(l => [l.id, l]));

/* ── Wagons et voitures ──
   opts : options par véhicule (classe, chargement…) ; m = masse à vide / chargé (t) */
TS.WAGONS = {
  corail:    { name: 'Voiture Corail', len: 26.4, m: 42, vmax: 200, cat: 'pax', seats: 80, model: 'corail', opts: ['1re classe', '2de classe', 'Voiture-bar'], def: 1,
               liv: [['Corail gris & orange', '#d6d4cf', '#e8742a'], ['Intercités bleu', '#e7ecf2', '#1d3d73'], ['Carmillon', '#d9dbe0', '#b8213b']] },
  couchette: { name: 'Voiture-couchettes', len: 26.4, m: 45, vmax: 160, cat: 'pax', seats: 60, model: 'corail', opts: ['Couchettes 4 places', 'Couchettes 6 places', 'Voiture-lits'], def: 0,
               liv: [['Bleu nuit', '#233a63', '#c7ccd6'], ['Corail gris & orange', '#d6d4cf', '#e8742a']] },
  vb2n:      { name: 'Voiture VB 2N', len: 24.3, m: 46, vmax: 140, cat: 'pax', seats: 120, model: 'vb2n', opts: ['1re classe', '2de classe', 'Voiture-pilote'], def: 1,
               liv: [['TER gris & bleu', '#e6e8ea', '#245aa6'], ['Île-de-France', '#e6e8ea', '#16726e']] },
  duplex:    { name: 'Remorque Duplex', len: 18.7, m: 30, vmax: 320, cat: 'pax', seats: 64, model: 'duplex', opts: ['1re classe', '2de classe', 'Voiture-bar'], def: 1, fixed: true },
  r2n:       { name: 'Caisse Regio 2N', len: 16.5, m: 30, vmax: 200, cat: 'pax', seats: 90, model: 'r2nm', opts: ['1re classe', '2de classe', 'Accès PMR & vélos'], def: 1, fixed: true },
  agcm:      { name: 'Caisse intermédiaire AGC', len: 17.4, m: 34, vmax: 160, cat: 'pax', seats: 60, model: 'agcm', opts: ['2de classe', '1re classe'], def: 0, fixed: true },
  citerne:   { name: 'Wagon-citerne', len: 15.2, m: [22, 88], vmax: 100, cat: 'fret', model: 'citerne', opts: ['Vide', 'Chargé'], def: 1,
               liv: [['Blanc produits chimiques', '#e8e8e4', '#d36b21'], ['Noir hydrocarbures', '#2a2b2e', '#d8d8d0'], ['Gris gaz', '#9ea4ab', '#e8742a']] },
  conteneur: { name: 'Porte-conteneurs', len: 19.7, m: [20, 72], vmax: 120, cat: 'fret', model: 'conteneur', opts: ['Vide', 'Chargé'], def: 1,
               liv: [['Conteneurs multicolores', '#5a5d62', 'mix'], ['Conteneurs bleus', '#5a5d62', '#2c5aa0'], ['Conteneurs rouges', '#5a5d62', '#a8322b']] },
  tombereau: { name: 'Tombereau', len: 14.0, m: [22, 80], vmax: 100, cat: 'fret', model: 'tombereau', opts: ['Vide', 'Chargé'], def: 1,
               liv: [['Rouille', '#7a4a32', '#4a3b30'], ['Gris', '#6b6f75', '#4a4a48']] },
  couvert:   { name: 'Wagon couvert', len: 23.0, m: [28, 90], vmax: 120, cat: 'fret', model: 'couvert', opts: ['Vide', 'Chargé'], def: 1,
               liv: [['Bleu', '#2c5aa0', '#c9cdd2'], ['Gris argent', '#a9adb2', '#4b5563'], ['Rouge', '#a8322b', '#c9cdd2']] },
  autos:     { name: 'Porte-autos', len: 27.0, m: [26, 45], vmax: 120, cat: 'fret', model: 'autos', opts: ['Vide', 'Chargé'], def: 1,
               liv: [['Bleu', '#2c5aa0', '#c9cdd2'], ['Gris', '#6b6f75', '#c9cdd2']] },
  cereales:  { name: 'Trémie céréalière', len: 15.0, m: [23, 90], vmax: 100, cat: 'fret', model: 'cereales', opts: ['Vide', 'Chargé'], def: 1,
               liv: [['Gris clair', '#c7c9c9', '#4a4a48'], ['Vert', '#4f7b52', '#d8d8d0']] },
};

/* Trains de circulation (bots) */
TS.BOT_TYPES = {
  ter:   { name: 'TER', vmax: 160, stops: true, len: 110, model: 'r2n', liv: ['#e6e8ea', '#245aa6'], cars: 4 },
  ic:    { name: 'Intercités', vmax: 160, stops: true, len: 200, model: 'bbmod', liv: ['#1d3d73', '#e7ecf2'], cars: 7, wagon: 'corail', wliv: ['#e7ecf2', '#1d3d73'] },
  fret:  { name: 'Fret', vmax: 100, stops: false, len: 420, model: 'prima', liv: ['#3d7a4a', '#d8d8d0'], cars: 20, wagon: 'conteneur', wliv: ['#5a5d62', 'mix'] },
  fretc: { name: 'Fret citernes', vmax: 90, stops: false, len: 380, model: 'ccdiesel', liv: ['#1f4c96', '#eeeeee'], cars: 22, wagon: 'citerne', wliv: ['#2a2b2e', '#d8d8d0'] },
  tgv:   { name: 'TGV', vmax: 300, stops: true, len: 200, model: 'tgv', liv: ['#dfe3e8', '#3b4f9a'], cars: 8 },
};

/* ── Positions du robinet de frein (frein automatique) ── */
TS.BRAKE_POS = [
  { k: 'DES', name: 'Desserrage', cg: 5.4 },
  { k: 'MAR', name: 'Marche', cg: 5.0 },
  { k: 'S1', name: 'Serrage 1', cg: 4.6 },
  { k: 'S2', name: 'Serrage 2', cg: 4.3 },
  { k: 'S3', name: 'Serrage 3', cg: 4.0 },
  { k: 'S4', name: 'Serrage 4', cg: 3.8 },
  { k: 'S5', name: 'Serrage 5', cg: 3.6 },
  { k: 'SP', name: 'Serrage max', cg: 3.4 },
  { k: 'URG', name: 'Urgence', cg: 0 },
];

/* Distance orthodromique (km) */
TS.dist = function (a, b) {
  const R = 6371, r = Math.PI / 180;
  const dLat = (b.lat - a.lat) * r, dLon = (b.lon - a.lon) * r;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * r) * Math.cos(b.lat * r) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
};

/* Générateur pseudo-aléatoire reproductible */
TS.rng = function (seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = a + 0x6D2B79F5 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
};
TS.hash = function (x, y) {
  let h = (Math.imul(x | 0, 374761393) + Math.imul(y | 0, 668265263)) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
};
TS.noise2 = function (x, y) {
  const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi;
  const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
  const a = TS.hash(xi, yi), b = TS.hash(xi + 1, yi), c = TS.hash(xi, yi + 1), d = TS.hash(xi + 1, yi + 1);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
};
TS.clamp = (v, a, b) => v < a ? a : v > b ? b : v;
TS.smooth = t => t <= 0 ? 0 : t >= 1 ? 1 : t * t * (3 - 2 * t);
TS.fmtTime = function (sec, withSec) {
  sec = ((sec % 86400) + 86400) % 86400;
  const h = Math.floor(sec / 3600), m = Math.floor(sec / 60) % 60, s = Math.floor(sec) % 60;
  return String(h).padStart(2, '0') + ':' + String(m).padStart(2, '0') + (withSec ? ':' + String(s).padStart(2, '0') : '');
};
TS.fmtDist = m => m >= 1000 ? (m / 1000).toFixed(m >= 10000 ? 0 : 1).replace('.', ',') + ' km' : Math.round(m) + ' m';
