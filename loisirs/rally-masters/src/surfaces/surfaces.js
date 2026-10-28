/* Surfaces, pneus et météo : adhérence (mu), résistance au roulement, pic de glissement, poussière, sons. */
export const TERRE = 0, GRAVIER = 1, NEIGE = 2, GLACE = 3, ASPHALTE = 4, BOUE = 5;

// mu : adhérence de base ; rr : résistance au roulement ; peak : angle de dérive au pic d'adhérence (rad) ;
// C : forme de la courbe (plus bas = chute après le pic) ; wet : perte d'adhérence sous la pluie ;
// dust : [couleur, quantité] ; bump : rugosité (vibrations, sauts de caisse) ; snd : bruit de roulage
export const SURFACES = [
  { id: TERRE, nom: 'Terre', mu: 0.88, rr: 0.022, peak: 0.20, C: 1.45, wet: 0.28, dust: [0.60, 0.48, 0.34], dustAmt: 1, bump: 0.5, color: [0.43, 0.31, 0.2], snd: { f: 520, q: 0.8, g: 0.5 } },
  { id: GRAVIER, nom: 'Gravier', mu: 0.80, rr: 0.032, peak: 0.24, C: 1.35, wet: 0.12, dust: [0.74, 0.70, 0.62], dustAmt: 0.85, bump: 0.8, color: [0.62, 0.58, 0.5], snd: { f: 1500, q: 0.6, g: 0.75 } },
  { id: NEIGE, nom: 'Neige', mu: 0.48, rr: 0.038, peak: 0.28, C: 1.3, wet: 0.0, dust: [0.95, 0.97, 1.0], dustAmt: 1.1, bump: 0.2, color: [0.93, 0.95, 0.98], snd: { f: 380, q: 0.7, g: 0.35 } },
  { id: GLACE, nom: 'Glace', mu: 0.24, rr: 0.014, peak: 0.30, C: 1.2, wet: 0.0, dust: [0.85, 0.92, 1.0], dustAmt: 0.25, bump: 0.05, color: [0.70, 0.82, 0.92], snd: { f: 2600, q: 1.2, g: 0.25 } },
  { id: ASPHALTE, nom: 'Asphalte', mu: 1.18, rr: 0.012, peak: 0.13, C: 1.6, wet: 0.34, dust: [0.5, 0.5, 0.5], dustAmt: 0, bump: 0.08, color: [0.2, 0.2, 0.22], snd: { f: 900, q: 1.5, g: 0.55 } },
  { id: BOUE, nom: 'Boue', mu: 0.58, rr: 0.07, peak: 0.26, C: 1.3, wet: 0.0, dust: [0.24, 0.17, 0.10], dustAmt: 0.9, bump: 0.45, color: [0.22, 0.15, 0.09], snd: { f: 260, q: 0.5, g: 0.6 } },
];

// pneus : multiplicateur d'adhérence par surface (dans l'ordre TERRE, GRAVIER, NEIGE, GLACE, ASPHALTE, BOUE)
export const TIRES = [
  { id: 'route', nom: 'Route (asphalte)', k: [0.80, 0.75, 0.55, 0.50, 1.00, 0.60] },
  { id: 'mixte', nom: 'Mixtes', k: [0.95, 0.97, 0.75, 0.65, 0.90, 0.85] },
  { id: 'terre', nom: 'Terre / gravier', k: [1.05, 1.08, 0.85, 0.70, 0.78, 1.00] },
  { id: 'neige', nom: 'Neige cloutés', k: [0.82, 0.80, 1.12, 1.35, 0.65, 0.80] },
];

export const WEATHERS = {
  soleil: { nom: 'Soleil', wet: 0, snow: 0, fog: 0.0009, icon: '☀' },
  pluie: { nom: 'Pluie', wet: 1, snow: 0, fog: 0.0022, icon: '🌧' },
  brouillard: { nom: 'Brouillard', wet: 0.25, snow: 0, fog: 0.0085, icon: '🌫' },
  neige: { nom: 'Neige', wet: 0.15, snow: 1, fog: 0.0042, icon: '❄' },
};

/* adhérence effective d'une surface pour un type de pneu sous une météo donnée */
export function gripOf(surf, tireId, weather) {
  const S = SURFACES[surf], T = TIRES.find((t) => t.id === tireId) || TIRES[1];
  const w = WEATHERS[weather] || WEATHERS.soleil;
  let mu = S.mu * T.k[surf];
  mu *= 1 - w.wet * S.wet;
  if (w.snow && surf !== NEIGE && surf !== GLACE) mu *= 0.86; // fine couche de neige sur la route
  return mu;
}
