// État persistant (localStorage) : argent, achats, sélection, contrats, options.
const KEY = 'tfs-save-v1';
const fresh = () => ({
  money: 150000, cabs: ['regional'], trailers: ['tarp'], cab: 'regional', trailer: 'tarp',
  contracts: {}, contract: null, stats: { delivered: 0, earned: 0 }, options: { shadows: true, lowres: false },
});

export const hasSave = () => { try { return localStorage.getItem(KEY) !== null; } catch { return false; } };

function load() {
  try { return { ...fresh(), ...JSON.parse(localStorage.getItem(KEY)) }; } catch { return fresh(); }
}

export const state = load();

export function save() {
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* stockage indisponible */ }
}

/** Nouvelle partie : remet l'objet partagé à zéro (les modules gardent la même référence). */
export function resetState() {
  const keep = state.options;
  for (const k in state) delete state[k];
  Object.assign(state, fresh(), { options: keep });
  save();
}
