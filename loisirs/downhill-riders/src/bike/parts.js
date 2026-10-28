/* Catalogue de la boutique : vélos (enduro, descente, freeride), cadres, roues, tenues, casques. Tout est généré en primitives. */
export const BIKES = {
  enduro: { id: 'enduro', name: 'Enduro', price: 0, desc: 'Polyvalent : bonne montée, bonne descente.', R: 0.35, wb: 1.2, travelF: 0.16, travelR: 0.15, grip: 1, tol: 1, impact: 15, agility: 1.05, mass: 15, geo: { reach: 0.46, head: 64.5, bar: 0.78 } },
  downhill: { id: 'downhill', name: 'Descente', price: 600, desc: 'Grand débattement : encaisse les gros impacts, plus lourd.', R: 0.345, wb: 1.28, travelF: 0.2, travelR: 0.2, grip: 1.1, tol: 1.2, impact: 19, agility: 0.9, mass: 17.5, geo: { reach: 0.5, head: 62.5, bar: 0.8 } },
  freeride: { id: 'freeride', name: 'Freeride', price: 450, desc: 'Réactif en l\'air, parfait pour les tricks.', R: 0.35, wb: 1.15, travelF: 0.18, travelR: 0.17, grip: 0.95, tol: 1.1, impact: 17, agility: 1.2, mass: 16, geo: { reach: 0.44, head: 65.5, bar: 0.8 } },
};
export const FRAMES = [
  { id: 'rouge', name: 'Rouge course', price: 0, col: 0xd62828 }, { id: 'bleu', name: 'Bleu électrique', price: 150, col: 0x1c64f2 },
  { id: 'vert', name: 'Vert lime', price: 150, col: 0x6bd400 }, { id: 'orange', name: 'Orange sunset', price: 150, col: 0xff7a00 },
  { id: 'noir', name: 'Noir mat', price: 200, col: 0x15161a }, { id: 'violet', name: 'Violet néon', price: 250, col: 0x8a2be2 },
  { id: 'or', name: 'Or', price: 600, col: 0xd4a017 },
];
export const WHEELS = [
  { id: 'noir', name: 'Jantes noires', price: 0, rim: 0x1a1b1e, hub: 0x8a8f98 }, { id: 'rouge', name: 'Jantes rouges', price: 120, rim: 0xc01818, hub: 0xc8cdd4 },
  { id: 'or', name: 'Jantes or', price: 220, rim: 0xd4a017, hub: 0xe8e0c0 }, { id: 'blanc', name: 'Jantes blanches', price: 160, rim: 0xe8e8e8, hub: 0x6b7480 },
  { id: 'bleu', name: 'Jantes bleues', price: 120, rim: 0x1c64f2, hub: 0xc8cdd4 },
];
export const OUTFITS = [
  { id: 'classique', name: 'Classique', price: 0, top: 0x2b6cb0, pants: 0x1b1d22, glove: 0x111111, shoe: 0x222222 },
  { id: 'feu', name: 'Feu', price: 140, top: 0xe2411a, pants: 0x1b1d22, glove: 0xffcc00, shoe: 0x111111 },
  { id: 'foret', name: 'Forêt', price: 140, top: 0x2f7d46, pants: 0x2a2c20, glove: 0x111111, shoe: 0x3b3b30 },
  { id: 'neon', name: 'Néon', price: 250, top: 0xd946ef, pants: 0x101018, glove: 0x00e5ff, shoe: 0x00e5ff },
  { id: 'blanc', name: 'Blanc pur', price: 180, top: 0xf2f2f2, pants: 0x4a5568, glove: 0x222222, shoe: 0xffffff },
];
export const HELMETS = [
  { id: 'ouvert', name: 'Casque ouvert', price: 0, type: 'open', col: 0xe8e8e8 }, { id: 'integral', name: 'Intégral', price: 220, type: 'full', col: 0x15161a },
  { id: 'dirt', name: 'Dirt visière', price: 160, type: 'dirt', col: 0xd62828 }, { id: 'integral2', name: 'Intégral doré', price: 500, type: 'full', col: 0xd4a017 },
];
export const CATALOG = { bike: Object.values(BIKES), frame: FRAMES, wheel: WHEELS, outfit: OUTFITS, helmet: HELMETS };
export const find = (cat, id) => CATALOG[cat].find((x) => x.id === id) || CATALOG[cat][0];
export const CAT_NAMES = { bike: 'Vélos', frame: 'Cadres', wheel: 'Roues', outfit: 'Tenues', helmet: 'Casques' };
