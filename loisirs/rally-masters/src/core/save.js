/* Sauvegarde localStorage : argent, voitures, améliorations, réglages, championnat en cours, fantômes. */
const KEY = 'rally-masters:v1';
const DEF = () => ({
  cash: 5000,
  owned: ['compacte'],
  up: {},          // { carId: { moteur: 0..3, freins, suspension, protection } }
  setups: {},      // { carId: { suspF, suspR, frein, diffAv, diffAr, centre, pneus } }
  unlocked: ['forets'],
  finished: {},    // { rallyId: meilleure place }
  championship: null, // rallye en cours (voir main.js)
  settings: { volume: 0.7, voice: true, voiceVolume: 1, voiceRate: 1.05, anticipation: 6, detail: 2, ai: 1, view: 0, quality: 1, units: 'kmh' },
  stats: { stages: 0, wins: 0, crashes: 0, km: 0 },
});

function load() {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY));
    if (raw) { const d = DEF(); return { ...d, ...raw, settings: { ...d.settings, ...raw.settings }, stats: { ...d.stats, ...raw.stats } }; }
  } catch (e) { /* stockage indisponible */ }
  return DEF();
}
export const save = load();
export function persist() { try { localStorage.setItem(KEY, JSON.stringify(save)); } catch (e) { /* stockage indisponible */ } }
export function resetSave() { Object.assign(save, DEF()); persist(); }

// fantômes : un par spéciale (clé = graine + environnement), 10 images/s, on garde les 30 derniers
const GK = 'rally-masters:ghosts';
function ghosts() { try { return JSON.parse(localStorage.getItem(GK)) || {}; } catch (e) { return {}; } }
export function loadGhost(key) { return ghosts()[key] || null; }
export function saveGhost(key, g) {
  const all = ghosts();
  all[key] = { ...g, at: Date.now() };
  const keys = Object.keys(all).sort((a, b) => all[b].at - all[a].at);
  for (const k of keys.slice(30)) delete all[k];
  try { localStorage.setItem(GK, JSON.stringify(all)); } catch (e) { /* quota : on ignore */ }
}
