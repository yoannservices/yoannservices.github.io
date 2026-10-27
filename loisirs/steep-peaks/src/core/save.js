const KEY = 'steepPeaks.v1';
const def = () => ({
  xp: 0,
  equip: { snowboard: 'b0', ski: 's0', wingsuit: 'w0', outfit: 'o0' },
  stats: { dist: 0, topSpeed: 0, bestTrick: 0, flights: 0, crashes: 0, bestJump: 0, airTime: 0, wingDist: 0, time: 0 },
  challenges: {}, pois: [], pos: null,
});
export const data = def();
try {
  const s = JSON.parse(localStorage.getItem(KEY));
  if (s) { Object.assign(data, s); data.equip = { ...def().equip, ...s.equip }; data.stats = { ...def().stats, ...s.stats }; }
} catch {}
export const save = () => { try { localStorage.setItem(KEY, JSON.stringify(data)); } catch {} };
addEventListener('beforeunload', save);
