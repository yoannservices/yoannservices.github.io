// Service d'une ligne : arrêts, portes, montée/descente, billets, ponctualité, satisfaction.
import { LINES, SPEED_PLAN, DWELL } from './Lines.js';
import { TICKET } from '../economy/Economy.js';
import { P, wrapAngle } from '../city/grid.js';

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const DENSITY = { gare: [10, 20], centre: [8, 16], commerce: [5, 12], peripherie: [2, 8] };

export class Service {
  constructor(game) {
    this.g = game;
    this.active = false; this.line = null; this.run = null; this.stopIdx = 0;
    this.onboard = 0; this.satisfaction = 100;
    this.doorsOpen = false; this.doorsF = 0; this.rampOn = false; this.rampF = 0;
    this.srv = null; this.waiting = 0; this.pmr = null;   // pmr : {line, k} arrêt où attend un passager PMR
    this.extra = 0;                                       // secondes de tolérance (déviation…)
    this.delay = 0; this.promptText = ''; this.lastFine = 0;
  }
  get capacity() { return this.g.vehicle.stats.seats; }
  get stop() { return this.line ? this.line.stops[this.stopIdx] : null; }
  get expected() { return this.run.t0 + this.line.sched[this.stopIdx] + this.extra; }

  start(lineId) {
    this.line = LINES.find((l) => l.id === lineId);
    this.active = true; this.stopIdx = 0; this.extra = 0; this.srv = null;
    this.run = { t0: this.g.time, punct: 0, early: 0 };
    this.g.economy.d.line = lineId;
    this.armStop();
    this.g.toast(`Service démarré : ${this.line.name}`, 'ok');
  }
  end() { this.active = false; this.line = null; this.srv = null; this.g.crowd.set(null, 0); }

  armStop() {
    const s = this.stop, [a, b] = DENSITY[s.zone];
    this.waiting = Math.round(a + Math.random() * (b - a));
    this.srv = null;
    this.g.crowd.set(s, this.waiting);
  }

  toggleDoors() {
    const g = this.g, p = g.vehicle.phys;
    if (!this.doorsOpen) {
      if (Math.abs(p.speed) > 0.8) return g.toast('Arrêtez le bus avant d\'ouvrir les portes', 'warn');
      this.doorsOpen = true; g.audio.doors();
    } else {
      if (this.srv && this.srv.phase !== 'done') { this.sat(-6); g.toast('Départ précipité : des voyageurs attendaient', 'warn'); this.srv.phase = 'done'; this.srv.aborted = true; }
      this.doorsOpen = false; g.audio.doors();
    }
  }
  toggleRamp() {
    if (!this.doorsOpen) return this.g.toast('Ouvrez les portes pour déployer la rampe', 'warn');
    this.rampOn = !this.rampOn; this.g.audio.beep(520, 0.1);
  }
  skipStop() {
    if (!this.active || this.doorsOpen) return;
    this.g.toast(`Arrêt « ${this.stop.name} » sauté`, 'bad');
    this.sat(-10); this.g.fine(30, 'Arrêt non desservi', 0);
    this.pmr = null; this.advance();
  }
  sat(v) { this.satisfaction = clamp(this.satisfaction + v, 0, 100); }

  inZone() {
    const s = this.stop, p = this.g.vehicle.phys, r = p.refPoint();
    const dx = r.x - s.x, dz = r.z - s.z;
    const along = dx * s.hx + dz * s.hz, lat = dx * -s.hz + dz * s.hx;
    return { ok: Math.abs(along) < 9 && Math.abs(lat) < 1.6 && Math.abs(wrapAngle(p.heading - s.heading)) < 0.25, along, lat, dist: Math.hypot(dx, dz) };
  }

  update(dt) {
    const g = this.g, p = g.vehicle.phys, m = g.vehicle.model;
    // animations portes / rampe
    this.doorsF = clamp(this.doorsF + (this.doorsOpen ? 1 : -1) * dt / 1.2, 0, 1);
    if (!this.doorsOpen) this.rampOn = false;
    this.rampF = clamp(this.rampF + (this.rampOn ? 1 : -1) * dt / 1.0, 0, 1);
    m.setDoors(this.doorsF); m.setRamp(this.rampF); m.setPassengers(this.onboard);

    // confort : freinages / virages brusques, portes ouvertes en roulant
    if (this.onboard > 0) {
      let loss = 0;
      if (p.accelLong < -4.2) loss += (-p.accelLong - 4.2) * 2.5;
      if (p.accelLong > 2.4) loss += (p.accelLong - 2.4) * 2;
      if (Math.abs(p.accelLat) > 2.8 && Math.abs(p.speed) > 3) loss += (Math.abs(p.accelLat) - 2.8) * 3;
      if (this.doorsF > 0.1 && Math.abs(p.speed) > 2) loss += 6;
      this.sat(loss > 0 ? -loss * dt : 0.25 * dt);
    }

    this.promptText = '';
    if (!this.active) return;
    const z = this.inZone(), s = this.stop;
    this.delay = g.time - this.expected;

    if (!this.srv) {
      if (this.doorsOpen && z.ok && Math.abs(p.speed) < 0.8) this.beginServe(z);
      else if (z.ok && Math.abs(p.speed) < 0.8) this.promptText = 'Ouvrez les portes (O)';
      else if (z.dist < 40) this.promptText = `Arrêt « ${s.name} » : alignez-vous le long du trottoir`;
      return;
    }
    const v = this.srv;
    v.timer -= dt;
    if (v.phase === 'alight') {
      if (v.nOff <= 0) v.phase = 'board';
      else if (v.timer <= 0) { v.nOff--; this.onboard--; v.timer = 0.7; g.audio.beep(660, 0.05); }
    } else if (v.phase === 'board') {
      const pmrBlocked = v.pmr && !v.pmrDone && this.rampF < 0.95;
      if (v.nWait <= 0 && (!v.pmr || v.pmrDone)) { v.phase = 'done'; }
      else if (pmrBlocked && v.nWait <= 0) this.promptText = 'Passager PMR : déployez la rampe (R)';
      else if (v.timer <= 0) {
        if (this.onboard >= this.capacity) { g.toast('Bus complet', 'warn'); v.nWait = 0; v.phase = 'done'; }
        else if (v.nWait > 0) {
          v.nWait--; this.onboard++; v.timer = 0.9;
          const fare = TICKET * (0.7 + 0.3 * this.satisfaction / 100);
          v.revenue += fare; g.economy.addMoney(fare); g.economy.d.pax++; g.audio.ticket();
        } else if (v.pmr && !v.pmrDone && this.rampF >= 0.95) {
          v.pmrDone = true; this.onboard = Math.min(this.capacity, this.onboard + 1); v.timer = 2;
          g.economy.addMoney(25); this.sat(5); g.toast('Assistance PMR : +25 €', 'ok'); this.pmr = null; g.audio.ticket();
        }
        g.crowd.set(s, v.nWait + (v.pmr && !v.pmrDone ? 1 : 0));
      }
    }
    if (v.phase === 'done') {
      if (!v.finished) { v.finished = true; if (!v.aborted) this.promptText = ''; }
      if (this.doorsOpen) this.promptText = 'Fermez les portes (O) et repartez';
      else if (v.finished) this.completeStop();
    } else if (!this.promptText) this.promptText = `Arrêt en cours : ${this.onboard} à bord`;
  }

  beginServe(z) {
    const s = this.stop, last = this.stopIdx === this.line.stops.length - 1;
    const pmr = !!(this.pmr && this.pmr.line === s.line && this.pmr.k === s.k);
    this.srv = {
      phase: 'alight', timer: 0.5, arrive: this.g.time, expected: this.expected, lat: Math.abs(z.lat),
      nOff: last ? this.onboard : Math.floor(this.onboard * (0.25 + Math.random() * 0.3)),
      nWait: this.waiting, pmr, pmrDone: false, revenue: 0, finished: false, aborted: false,
    };
    this.g.audio.beep(880, 0.15);
  }

  completeStop() {
    const g = this.g, v = this.srv, e = g.economy, dev = v.arrive - v.expected;
    let msg = `Arrêt « ${this.stop.name} » : +${v.revenue.toFixed(0)} €`;
    if (Math.abs(dev) <= 20) { e.addMoney(15); this.sat(3); this.run.punct++; msg += ' · ponctuel +15 €'; }
    else if (dev > 60) { const pen = Math.min(40, Math.round((dev - 60) * 0.2)); e.addMoney(-pen); this.sat(-5); msg += ` · retard −${pen} €`; }
    let xp = 10;
    if (v.lat < 0.5) { e.addMoney(5); xp += 5; msg += ' · arrêt précis +5 €'; }
    e.addXp(xp); e.d.stopsDone++;
    g.toast(msg, dev > 60 ? 'warn' : 'ok');
    this.advance();
  }

  advance() {
    const n = this.line.stops.length;
    this.stopIdx++;
    if (this.stopIdx >= n) {
      const g = this.g, e = g.economy, bonus = Math.round(15 * n * (0.5 + this.satisfaction / 200));
      e.addMoney(bonus); e.addXp(40); e.d.runs++;
      g.toast(`Course terminée : bonus ${bonus} € · satisfaction ${Math.round(this.satisfaction)}%`, 'ok');
      const lastEdge = this.line.stops[n - 1].edgeIndex, E = this.line.path.length;
      const travel = (((E - lastEdge + this.line.stops[0].edgeIndex) * P) / SPEED_PLAN);
      this.stopIdx = 0; this.extra = 0;
      this.run = { t0: g.time + travel - this.line.sched[0], punct: 0 };
      e.save();
    }
    this.armStop();
  }
}
