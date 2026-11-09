// Réglages graphiques du jeu. Le niveau commun (Auto / Haut / Moyen / Bas, ombres, 30 FPS) vient de assets/quality.js ;
// ce module ajoute ce qui est propre au jeu (résolution, reflets, phares dynamiques, volume).
import { Q, LEVELS, level, save as saveShared } from '../../../assets/quality.js';

const KEY = 'chantier-carriere.gfx.v1';
export const PRESETS = {
  haut: { lights: true, env: true, pixel: 2, rain: true },
  moyen: { lights: true, env: true, pixel: 1.5, rain: true },
  bas: { lights: false, env: false, pixel: 1, rain: false },
};
export const OPTIONS = {
  lights: { label: 'Phares et éclairage de nuit', values: [[true, 'Oui'], [false, 'Non']] },
  env: { label: 'Reflets (rendu physique)', values: [[true, 'Oui'], [false, 'Non']] },
  pixel: { label: 'Résolution max', values: [[2, '200 %'], [1.5, '150 %'], [1, '100 %']] },
  rain: { label: 'Gouttes de pluie', values: [[true, 'Oui'], [false, 'Non']] },
  volume: { label: 'Volume', values: [[0.7, 'Normal'], [0.35, 'Bas'], [0, 'Muet']] },
};
const read = () => { try { return JSON.parse(localStorage.getItem(KEY)) ?? {}; } catch { return {}; } };
export const GFX = { custom: read() };
export const levelName = () => (Q.mode === 'auto' ? 'auto' : Q.mode);
export const levelKey = () => (Q.mode === 'auto' ? Q.auto : Q.mode);
export function get(opt) { if (opt in GFX.custom) return GFX.custom[opt]; return opt === 'volume' ? 0.7 : PRESETS[levelKey()][opt]; }
export function setOption(opt, v) { GFX.custom[opt] = v; save(); }
export function setLevel(mode) { Q.mode = mode; if (mode === 'bas') Q.shadows = false; else if (mode === 'haut') Q.shadows = true; const vol = GFX.custom.volume; GFX.custom = vol === undefined ? {} : { volume: vol }; saveQ(); save(); }
export function setShared(k, v) { Q[k] = v; saveQ(); }
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(GFX.custom)); } catch { /* ignore */ } };
const saveQ = saveShared;
export { Q, LEVELS, level };
