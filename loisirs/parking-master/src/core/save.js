/* Sauvegarde : meilleur temps et étoiles par niveau, volume. Stockée dans localStorage (peut être indisponible). */
const KEY = 'parkingmaster.save.v1';
const fresh = () => ({ best: {}, volume: 0.7 });

export const save = (() => {
  try { return { ...fresh(), ...JSON.parse(localStorage.getItem(KEY) || '{}') }; } catch { return fresh(); }
})();

export function persist() {
  try { localStorage.setItem(KEY, JSON.stringify(save)); } catch { /* stockage indisponible : on joue sans sauvegarde */ }
}

/* Enregistre un résultat ; garde le meilleur nombre d'étoiles puis le meilleur temps. Renvoie true si c'est un record de temps. */
export function record(id, time, stars) {
  const b = save.best[id];
  const better = !b || time < b.time;
  save.best[id] = { time: better ? time : b.time, stars: Math.max(stars, b ? b.stars : 0) };
  persist();
  return better;
}
