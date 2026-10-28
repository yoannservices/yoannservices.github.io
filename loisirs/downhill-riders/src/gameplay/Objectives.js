/* Objectifs par descente : chrono, figure précise, saut le plus long. Tirés de la graine. */
import { mulberry32, seedFrom, lerp } from '../core/rng.js';

const TRICKS = ['Backflip', 'Frontflip', '360', 'Tabletop', 'Superman', 'Barspin', 'No-hander', 'Whip'];

export function makeObjectives(track) {
  const r = mulberry32(seedFrom(track.seedWord + 'obj')), D = track.diff, di = ['green', 'blue', 'red', 'black'].indexOf(D.id);
  const par = track.length / (lerp(12, 15, r()) * (1 - di * 0.02));
  return [
    { id: 'time', label: `Finir en moins de ${fmt(par)}`, target: par, reward: 250 + di * 100, done: false },
    { id: 'trick', label: `Réussir un ${TRICKS[Math.floor(r() * (di < 1 ? 4 : TRICKS.length))]}`, target: TRICKS[0], reward: 200 + di * 80, done: false },
    { id: 'jump', label: `Sauter plus de ${Math.round(lerp(10, 16, r()) + di * 5)} m`, target: Math.round(lerp(10, 16, r()) + di * 5), reward: 200 + di * 80, done: false },
  ].map((o, i) => { if (o.id === 'trick') { const name = o.label.replace('Réussir un ', ''); o.target = name; } if (o.id === 'jump') { o.target = +o.label.match(/\d+/)[0]; } return o; });
}
export const fmt = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

export function checkObjectives(objs, state) {
  const gained = [];
  for (const o of objs) {
    if (o.done) continue;
    let ok = false;
    if (o.id === 'trick') ok = state.tricks?.has(o.target);
    else if (o.id === 'jump') ok = state.longest >= o.target;
    else if (o.id === 'time') ok = state.finished && state.time <= o.target;
    if (ok) { o.done = true; gained.push(o); }
  }
  return gained;
}
