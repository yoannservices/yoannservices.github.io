/* Sauvegarde localStorage : réputation, argent, déblocages, boutique, meilleurs scores, réglages. */
const KEY = 'downhill-riders:v1';
const DEF = () => ({
  rep: 0, cash: 0, best: {},
  owned: { bike: ['enduro'], frame: ['rouge'], wheel: ['noir'], outfit: ['classique'], helmet: ['ouvert'] },
  eq: { bike: 'enduro', frame: 'rouge', wheel: 'noir', outfit: 'classique', helmet: 'ouvert' },
  settings: { blur: true, volume: 0.7 },
  lastSeed: '', stats: { runs: 0, crashes: 0, bestCombo: 0, longestJump: 0 },
});

function load() {
  try { const raw = JSON.parse(localStorage.getItem(KEY)); if (raw) { const d = DEF(); return { ...d, ...raw, owned: { ...d.owned, ...raw.owned }, eq: { ...d.eq, ...raw.eq }, settings: { ...d.settings, ...raw.settings }, stats: { ...d.stats, ...raw.stats } }; } } catch (e) { /* stockage indisponible */ }
  return DEF();
}
export const save = load();
export function persist() { try { localStorage.setItem(KEY, JSON.stringify(save)); } catch (e) { /* stockage indisponible */ } }
export function addRep(n) { save.rep += n; save.cash += n; persist(); }
