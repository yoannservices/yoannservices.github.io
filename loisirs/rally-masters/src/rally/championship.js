/* Championnat : rallyes de 4 à 6 spéciales, cumul des temps, pilotes IA représentés par des temps réalistes
   (dérivés du temps de référence de chaque spéciale), argent, déblocages. L'état complet est dans save.championship. */
import { RALLIES, AI_NAMES, DIFFS, ENVS, CARS, SETUP_DEFAULT } from '../core/data.js';
import { save, persist } from '../core/save.js';
import { mulberry32, pickW } from '../core/util.js';

const WEATHER_W = {
  foret: [['soleil', 0.4], ['pluie', 0.35], ['brouillard', 0.25]],
  neige: [['neige', 0.55], ['soleil', 0.3], ['brouillard', 0.15]],
  asphalte: [['soleil', 0.5], ['pluie', 0.3], ['brouillard', 0.2]],
  gravier: [['soleil', 0.65], ['pluie', 0.2], ['brouillard', 0.15]],
};
export const freshDamage = () => ({ bumpF: 0, bumpR: 0, steer: 0, steerSign: 1, engine: 0, body: 0, tires: [0, 0, 0, 0] });
export const SERVICE_MIN = 30;
export const DNF_FACTOR = 3;                 // temps attribué en cas d'abandon : 3 × le temps de référence + 5 min
export const getRally = (id) => RALLIES.find((r) => r.id === id);

export function newChampionship(rallyId, carId, aiLevel) {
  const seed = (Math.random() * 4294967296) >>> 0, rnd = mulberry32(seed ^ 0xabc);
  const ai = AI_NAMES.slice(0, 11).map((name) => ({ name, skill: rnd() * 2 - 1 }));
  const champ = { rallyId, carId, aiLevel, seed, stage: 0, times: [], pens: [], aiTimes: [], ai, dmg: freshDamage(), restarts: 0, service: SERVICE_MIN, wins: 0, startedAt: Date.now(), log: [] };
  save.championship = champ; persist(); return champ;
}

/* définition de la k-ième spéciale (graine, terrain, longueur, météo, heure) */
export function stageDef(champ, k) {
  const r = getRally(champ.rallyId), rnd = mulberry32((champ.seed ^ (k * 7919 + 1)) >>> 0), n = r.stages.length;
  const env = r.env[k % r.env.length], f = n > 1 ? k / (n - 1) : 0;
  const tod = f < 0.34 ? 'jour' : f < 0.7 ? pickW(rnd, [['jour', 0.55], ['crepuscule', 0.45]]) : pickW(rnd, [['crepuscule', 0.4], ['nuit', 0.6]]);
  return { seed: (champ.seed + k * 104729) >>> 0, env, length: r.stages[k], weather: pickW(rnd, WEATHER_W[env]), tod, rallyId: r.id, index: k, key: `${r.id}:${champ.seed}:${k}` };
}

/* temps des pilotes IA sur une spéciale (secondes), à partir du temps de référence du tracé */
export function aiStageTimes(champ, stage, k) {
  const d = DIFFS[champ.aiLevel ?? 1], rnd = mulberry32((champ.seed ^ (k * 31337 + 7)) >>> 0);
  return champ.ai.map((a) => stage.tref * d.k * (1 + d.spread * (a.skill * 0.75 + (rnd() * 2 - 1) * 0.5) + 0.025));
}
/* temps de l'IA à une fraction f de la spéciale (profil de vitesse de référence) : sert au classement provisoire */
export function aiTimesAt(times, stage, i) { const fr = stage.tcum[Math.min(stage.N - 1, Math.max(0, i))] / stage.tref; return times.map((t) => t * fr); }

/* classement général après `upto` spéciales (exclu) : [{name, total, human, last}] */
export function standings(champ, upto = champ.times.length) {
  const rows = champ.ai.map((a, j) => ({ name: a.name, human: false, total: champ.aiTimes.slice(0, upto).reduce((s, t) => s + t[j], 0) }));
  rows.push({ name: 'Vous', human: true, total: champ.times.slice(0, upto).reduce((s, t) => s + t, 0) + (upto ? champ.restarts * 60 : 0) });
  rows.sort((a, b) => a.total - b.total);
  rows.forEach((r, i) => (r.rank = i + 1));
  return rows;
}
export function stageRanking(champ, k) {
  const rows = champ.ai.map((a, j) => ({ name: a.name, human: false, total: champ.aiTimes[k][j] }));
  rows.push({ name: 'Vous', human: true, total: champ.times[k] });
  rows.sort((a, b) => a.total - b.total); rows.forEach((r, i) => (r.rank = i + 1)); return rows;
}

/* enregistre le résultat de la spéciale k ; renvoie le classement de la spéciale */
export function recordStage(champ, k, humanTime, stage, dmg) {
  champ.times[k] = humanTime; champ.aiTimes[k] = aiStageTimes(champ, stage, k);
  champ.dmg = JSON.parse(JSON.stringify(dmg));
  const rk = stageRanking(champ, k); if (rk.find((r) => r.human).rank === 1) champ.wins++;
  champ.stage = k + 1; champ.service = SERVICE_MIN; persist(); return rk;
}

/* fin du rallye : prime, déblocages */
export function finishRally(champ) {
  const r = getRally(champ.rallyId), st = standings(champ), me = st.find((x) => x.human), rank = me.rank;
  const prize = r.prize[rank - 1] ?? 500, bonus = champ.wins * 500;
  save.cash += prize + bonus; save.stats.stages += champ.times.length; if (rank === 1) save.stats.wins++;
  const unlocked = [];
  if (!save.finished[r.id] || save.finished[r.id] > rank) save.finished[r.id] = rank;
  for (const n of RALLIES) if (n.req === r.id && !save.unlocked.includes(n.id)) { save.unlocked.push(n.id); unlocked.push(n.nom); }
  save.championship = null; persist();
  return { rank, prize, bonus, unlocked, standings: st };
}

/* ---------- boutique et améliorations ---------- */
export const upLevel = (carId, id) => (save.up[carId]?.[id]) || 0;
export const upPrice = (car, up, lvl) => Math.round(up.base[lvl] * car.fact);
export function buyCar(carId) {
  const c = CARS.find((x) => x.id === carId);
  if (save.owned.includes(carId) || save.cash < c.prix) return false;
  save.cash -= c.prix; save.owned.push(carId); persist(); return true;
}
export function buyUpgrade(carId, upId, ups) {
  const car = CARS.find((x) => x.id === carId), up = ups.find((u) => u.id === upId), l = upLevel(carId, upId);
  if (l >= 3 || save.cash < upPrice(car, up, l)) return false;
  save.cash -= upPrice(car, up, l); (save.up[carId] ||= {})[upId] = l + 1; persist(); return true;
}
export { ENVS };

/* réglages d'une voiture (valeurs par défaut + choix du joueur) */
export function getSetup(carId) {
  const c = CARS.find((x) => x.id === carId);
  return { ...SETUP_DEFAULT, centre: c.split, ...(save.setups[carId] || {}) };
}
export function setSetup(carId, key, v) { (save.setups[carId] ||= {})[key] = v; persist(); }
export const upgradesOf = (carId) => ({ moteur: upLevel(carId, 'moteur'), freins: upLevel(carId, 'freins'), suspension: upLevel(carId, 'suspension'), protection: upLevel(carId, 'protection') });
