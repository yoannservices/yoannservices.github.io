/* Déroulement chronométré d'une spéciale : compte à rebours, chrono, points de passage avec temps intermédiaires,
   pénalités (coupure de virage, remise en piste), comparaison au meilleur temps et enregistrement du fantôme. */
import { DS } from '../stage/spline.js';
import { loadGhost, saveGhost } from '../core/save.js';

export const RESCUE_PENALTY = 45, RESTART_PENALTY = 60, CUT_PENALTY = [0, 5, 5, 4, 3, 2, 0];
const SPLIT = 10;   // un temps de référence tous les 10 échantillons (40 m)
const REC_DT = 0.1;

export class StageRun {
  constructor(stage, key) {
    this.st = stage; this.key = key;
    this.state = 'wait';       // wait → countdown → run → finished | dnf
    this.t = 0; this.count = 0; this.pen = []; this.penTotal = 0;
    this.cp = []; this.cpNext = 0; this.cutDist = new Map(); this.cutDone = new Set();
    this.best = loadGhost(key);            // { time, split[], rec[] } du meilleur passage
    this.rec = []; this.recT = 0; this.split = []; this.sNext = 0;
    this.finishTime = 0; this.delta = null; this.events = [];
  }
  get total() { return this.t + this.penTotal; }
  startCountdown() { this.state = 'countdown'; this.count = 4.2; this.lastN = 4; }
  addPenalty(sec, why) { this.pen.push({ t: this.t, sec, why }); this.penTotal += sec; this.events.push({ type: 'penalty', sec, why }); }

  /* delta (s) par rapport au meilleur temps à l'indice courant */
  bestAt(i) {
    const b = this.best; if (!b?.split?.length) return null;
    const k = i / SPLIT, a = Math.floor(k), f = k - a;
    if (a >= b.split.length - 1) return b.split[b.split.length - 1];
    return b.split[a] + (b.split[a + 1] - b.split[a]) * f;
  }
  /* position fantôme à l'instant t : [x, y, z, yaw] */
  ghostAt(t) {
    const r = this.best?.rec; if (!r?.length) return null;
    const f = t / REC_DT, a = Math.floor(f), k = f - a; if (a >= r.length - 1) return null;
    const p = r[a], q = r[a + 1], pa = p[3] / 100; let dy = q[3] / 100 - pa; dy = Math.atan2(Math.sin(dy), Math.cos(dy));
    return [(p[0] + (q[0] - p[0]) * k) / 10, (p[1] + (q[1] - p[1]) * k) / 10, (p[2] + (q[2] - p[2]) * k) / 10, pa + dy * k];
  }

  update(dt, ph, track) {
    this.events.length = 0;
    const st = this.st;
    if (this.state === 'countdown') {
      this.count -= dt; const n = Math.ceil(this.count);
      if (n !== this.lastN && n >= 0 && n <= 3) { this.lastN = n; this.events.push({ type: 'count', n }); }
      if (this.count <= 0) { this.state = 'run'; this.t = 0; this.events.push({ type: 'go' }); }
      return;
    }
    if (this.state !== 'run') return;
    this.t += dt;
    const i = ph.idx;
    // enregistrement du fantôme et des temps de passage
    this.recT += dt; while (this.recT >= REC_DT) { this.recT -= REC_DT; this.rec.push([Math.round(ph.x * 10), Math.round(ph.y * 10), Math.round(ph.z * 10), Math.round(ph.yaw * 100)]); }
    while (this.sNext * SPLIT <= i) { this.split.push(this.t); this.sNext++; }
    const bt = this.bestAt(i); this.delta = bt == null ? null : this.total - bt;
    // points de passage
    while (this.cpNext < st.cps.length && i >= st.cps[this.cpNext]) {
      const time = this.total, ref = this.best?.cpTimes?.[this.cpNext];
      this.cp.push(time); this.events.push({ type: 'cp', n: this.cpNext + 1, time, diff: ref != null ? time - ref : null }); this.cpNext++;
    }
    // coupure de virage : rouler du côté intérieur au-delà de la bordure sur plusieurs mètres
    for (let c = 0; c < st.corners.length; c++) {
      const co = st.corners[c]; if (co.sev > 4 || i < co.i0 || i > co.i1 || this.cutDone.has(c)) continue;
      const g = ph.g[4], inner = co.dir === 'L' ? g.lat : -g.lat;
      if (inner > g.hw + 1.1 && !ph.air) {
        const d = (this.cutDist.get(c) || 0) + ph.speed * dt; this.cutDist.set(c, d);
        if (d > 7) { this.cutDone.add(c); this.addPenalty(CUT_PENALTY[co.sev], 'Coupure du virage'); }
      }
    }
    if (i >= st.finishI) { this.state = 'finished'; this.finishTime = this.total; this.events.push({ type: 'finish', time: this.finishTime }); }
    else if (ph.dead && ph.speed < 1.5) { this.state = 'dnf'; this.events.push({ type: 'dnf', why: 'Moteur détruit' }); }
    else if (this.t > st.tref * 3 + 150) { this.state = 'dnf'; this.events.push({ type: 'dnf', why: 'Temps maximum dépassé' }); }
  }
  abandon() { if (this.state === 'run' || this.state === 'countdown') { this.state = 'dnf'; this.events.push({ type: 'dnf', why: 'Abandon' }); } }

  /* enregistre le fantôme si c'est le meilleur temps ; renvoie true si nouveau record */
  commit() {
    if (this.state !== 'finished') return false;
    if (this.best && this.best.time <= this.finishTime) return false;
    saveGhost(this.key, { time: this.finishTime, split: this.split.map((x) => +x.toFixed(2)), rec: this.rec, cpTimes: this.cp.map((x) => +x.toFixed(2)) });
    return true;
  }
}
export { DS };
