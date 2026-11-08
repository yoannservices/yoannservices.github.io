// Réglages graphiques du jeu. Le niveau commun (Auto / Haut / Moyen / Bas, ombres, 30 FPS) vient de assets/quality.js
// (distance d'affichage, brouillard, taille des ombres) ; ce module ajoute ce qui est propre au jeu et l'applique.
import { Q, LEVELS, level, save as saveShared } from '../../../assets/quality.js';

const KEY = 'pompiers18.gfx.v1';
// valeurs par niveau ; « auto » suit le niveau choisi par quality.js selon les FPS
export const PRESETS = {
  haut: { effects: 2, lights: true, env: true, pixel: 2, traffic: 60, textures: 2 },
  moyen: { effects: 1, lights: true, env: true, pixel: 1.5, traffic: 45, textures: 1 },
  bas: { effects: 0, lights: false, env: false, pixel: 1, traffic: 25, textures: 0 },
};
export const OPTIONS = {
  effects: { label: 'Flammes, fumée, eau', values: [[2, 'Élevés'], [1, 'Normaux'], [0, 'Réduits']] },
  lights: { label: 'Lumières dynamiques', values: [[true, 'Oui'], [false, 'Non']] },
  env: { label: 'Reflets (rendu physique)', values: [[true, 'Oui'], [false, 'Non']] },
  pixel: { label: 'Résolution max', values: [[2, '200 %'], [1.5, '150 %'], [1, '100 %']] },
  traffic: { label: 'Circulation', values: [[60, 'Dense'], [45, 'Normale'], [25, 'Légère']] },
  textures: { label: 'Textures des maisons', values: [[2, 'Fines'], [1, 'Normales'], [0, 'Simples']], reload: true },
};

const read = () => { try { return JSON.parse(localStorage.getItem(KEY)) ?? {}; } catch { return {}; } };
export const GFX = { custom: read() };   // custom : options forcées par le joueur (sinon valeur du niveau)

export const levelName = () => (Q.mode === 'auto' ? 'auto' : Q.mode);
export const levelKey = () => (Q.mode === 'auto' ? Q.auto : Q.mode);
export function get(opt) { return opt in GFX.custom ? GFX.custom[opt] : PRESETS[levelKey()][opt]; }
export function setOption(opt, v) { GFX.custom[opt] = v; save(); }
export function setLevel(mode) { Q.mode = mode; if (mode === 'bas') Q.shadows = false; else if (mode === 'haut') Q.shadows = true; GFX.custom = {}; saveQ(); save(); }   // Bas coupe les ombres (≈ 175 appels de dessin et 0,9 M triangles de moins)
export function setShared(k, v) { Q[k] = v; saveQ(); }
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(GFX.custom)); } catch { /* ignore */ } };
const saveQ = saveShared; // même sauvegarde que le panneau Réglages commun (assets/quality.js)
export { Q, LEVELS, level };
