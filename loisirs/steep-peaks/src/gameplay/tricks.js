import { data } from '../core/save.js';
import { prog } from './progression.js';

const TAU = Math.PI * 2;
const blank = () => ({ grabT: 0, grabId: 0, prox: 0, proxIdle: 0, drift: 0, driftIdle: 0, grindPts: 0, grindKind: '' });

// Tricks, combos, multiplicateur et score
export class Tricks {
  constructor() {
    this.total = 0; this.chain = 0; this.timer = 0; this.proxTotal = 0; this.hud = null; this.audio = null;
    this.cur = blank();
  }
  get mult() { return 1 + Math.max(0, this.chain - 1) * 0.5; }
  reset() { this.cur = blank(); this.chain = 0; this.timer = 0; }
  takeoff() { this.cur = blank(); }

  // points et noms du saut en cours / terminé
  evaluate(p, info) {
    const D = p.D, spin = info?.spin ?? p.spin, flip = info?.flip ?? p.flip, air = info?.air ?? p.airT;
    const s180 = Math.round(Math.abs(spin) / Math.PI), fl = Math.round(Math.abs(flip) / TAU);
    const c = this.cur, names = [];
    let pts = 0;
    if (s180) { pts += 80 * s180 * (1 + 0.3 * s180); names.push(`${D.spinNames[spin < 0 ? 0 : 1]} ${s180 * 180}`); }
    if (fl) { pts += 300 * fl * (1 + 0.3 * fl); names.push(`${flip > 0 ? 'Front' : 'Back'} flip${fl > 1 ? ' x' + fl : ''}`); }
    if (c.grabT > 0.25) { pts += 90 * c.grabT * (1 + c.grabT * 0.3); names.push(`${D.grabs[c.grabId - 1] || 'Grab'} grab`); }
    if (air > 0.7) pts += 40 * air;
    if (!names.length && air > 0.7) names.push(D.jumpName + ' ' + air.toFixed(1) + 's');
    return { pts: Math.round(pts), names };
  }
  liveText(p) {
    if (p.mode !== 'air') return '';
    const e = this.evaluate(p);
    return e.names.length ? e.names.join(' + ') + '  ' + e.pts : '';
  }

  air(dt, p) { const c = this.cur; if (p.grab) { c.grabT += dt; c.grabId = p.grab; } }

  bank(names, pts, chainUp = true) {
    if (pts <= 0) return;
    if (chainUp) this.chain = this.timer > 0 ? this.chain + 1 : 1;
    this.timer = 4.5;
    const score = Math.round(pts * (chainUp ? this.mult : 1));
    this.total += score;
    data.stats.bestTrick = Math.max(data.stats.bestTrick, score);
    prog.addXp(score / 14);
    this.hud?.popup(names.join(' + '), score, chainUp ? this.mult : 1);
    this.audio?.ding(this.chain);
  }

  land(info, p) {
    data.stats.airTime += info.air;
    data.stats.bestJump = Math.max(data.stats.bestJump, info.dist);
    if (info.air > 1.2) this.hud?.toast(`Saut : ${info.dist.toFixed(0)} m`);
    const e = this.evaluate(p, info);
    this.bank(e.names, e.pts);
    this.cur = blank();
  }

  crash(wasWing) {
    if (this.chain || this.cur.prox || this.cur.drift) this.hud?.toast('Combo perdu');
    this.cur = blank(); this.chain = 0; this.timer = 0;
  }

  drift(dt, speed) { const c = this.cur; c.drift += dt * (10 + speed); c.driftIdle = 0; }
  grindStart(kind, p, fromAir) {
    if (fromAir) { const e = this.evaluate(p, { spin: p.spin, flip: p.flip, air: p.airT }); this.bank(e.names, e.pts); }
    this.cur = blank(); this.cur.grindKind = kind;
  }
  grind(dt, p) { this.cur.grindPts += dt * (kind(this.cur.grindKind) * 60) * (1 + Math.abs(p.spin) * 0.4); }
  grindEnd(p) {
    const c = this.cur, names = [(c.grindKind === 'box' ? 'Box slide' : 'Rail slide') + (Math.abs(p.spin) > 0.5 ? ' (board)' : ' 50-50')];
    this.bank(names, Math.round(c.grindPts) + 60);
    this.cur = blank();
  }

  wing(dt, p) {
    const c = this.cur;
    if (p.agl < 25 && p.speed > 28) {
      const r = (1 - p.agl / 25) * p.speed * 2.2 * dt;
      c.prox += r; this.proxTotal += r; c.proxIdle = 0;
    } else c.proxIdle += dt;
    if (c.proxIdle > 1.5 && c.prox > 50) { this.bank(['Vol rasant'], Math.round(c.prox), false); c.prox = 0; }
  }
  wingEnd() {
    const c = this.cur;
    if (c.prox > 50) this.bank(['Vol rasant'], Math.round(c.prox), false);
    this.cur = blank();
  }

  tick(dt, p) {
    const c = this.cur;
    if (this.timer > 0) { this.timer -= dt; if (this.timer <= 0) { this.chain = 0; } }
    if (c.drift > 0 && !p.drifting) { c.driftIdle += dt; if (c.driftIdle > 0.8) { if (c.drift > 40) this.bank(['Drift'], Math.round(c.drift), false); c.drift = 0; } }
  }
}
const kind = (k) => (k === 'box' ? 0.9 : 1);
