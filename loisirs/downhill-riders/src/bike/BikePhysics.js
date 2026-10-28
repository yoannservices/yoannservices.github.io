/* Physique du vélo, codée à la main.
   Au sol : le vélo suit la surface (vitesse longitudinale vf et latérale vr), la gravité le long de la pente, pédalage, freins
   avant/arrière séparés, adhérence selon la surface, équilibre (manual, endo, chute sur le côté), suspensions ressort-amortisseur.
   En l'air : balistique, rotations pilotées (flips, spins, table, whip, barspin), assistance à la réception, puis évaluation.
   Un décollage arrive naturellement quand la surface s'éloigne plus vite que la chute libre (lèvre de saut, crête). */
import * as THREE from 'three';
import { G, SURF_PARAMS } from '../core/config.js';
import { clamp, lerp, smooth } from '../core/rng.js';
import { K } from '../world/Features.js';
import { evaluateLanding } from '../rider/Landing.js';

const V3 = THREE.Vector3, Q = THREE.Quaternion, M4 = THREE.Matrix4;
const UP = new V3(0, 1, 0), TWO_PI = Math.PI * 2;
const _a = new V3(), _b = new V3(), _n = new V3(), _ft = new V3(), _r = new V3(), _u = new V3(), _m = new M4(), _qa = new Q(), _qb = new Q(), _obs = [];

export class Bike {
  constructor(track, spec) {
    this.track = track; this.spec = spec; this.R = spec.R; this.wb = spec.wb;
    this.pos = new V3(); this.vel = new V3(); this.quat = new Q(); this.visPos = new V3();
    this.events = [];
    this.reset(track.start);
  }

  reset(p, speed = 0) {
    this.pos.set(p.x, p.y + this.R, p.z); this.yaw = p.yaw; this.vf = speed; this.vr = 0; this.vel.set(0, 0, 0);
    this.grounded = true; this.crashed = false; this.crashT = 0;
    this.lean = 0; this.steerA = 0; this.manual = 0; this.manualV = 0; this.endo = 0; this.lowside = 0; this.sliding = false;
    this.susF = 0.25; this.susR = 0.25; this.susFV = 0; this.susRV = 0; this.charge = 0; this.jumpHeld = false; this.lastGy = null; this.lastVy = 0; this.vyPrev = undefined; this.aNeedF = 0;
    this.spinWheel = 0; this.crank = 0; this.flipW = 0; this.spinW = 0; this.settle = 0; this.pivot = 0;
    this.resetAir(); this.grounded = true; this.airT = 0; this.quat.identity(); this._applyGround(); this.visPos.copy(this.pos);
    this.slope = 0; this.surf = 0; this.kind = 0; this.onRail = false; this.line = 0; this.s = p.s || 0; this.dlat = 0; this.risky = false;
  }
  resetAir() {
    this.air = { flip: 0, spin: 0, tableA: 0, barA: 0, whipA: 0, hands: 0, legs: 0, t: 0, maxH: 0, startY: this.pos.y, startPos: this.pos.clone(), table: 0, grab: 0, nohand: 0, superman: 0 };
    this.flipW = 0; this.spinW = 0;
  }

  get speed() { return this.grounded ? Math.abs(this.vf) : this.vel.length(); }
  get forwardH() { return _a.set(Math.sin(this.yaw), 0, -Math.cos(this.yaw)); }

  /* ───────── pas de simulation ───────── */
  step(dt, I) {
    if (this.crashed) { this._crashStep(dt); return; }
    const T = this.track, q = T.query(this.pos.x, this.pos.z);
    if (q) { this.surf = q.surf; this.kind = q.kind; this.line = q.l; this.s = q.s; this.dlat = q.dlat; this.risky = q.risky; this.hwQ = q.hw; this.qSide = q.bank; }
    if (this.grounded) this._ground(dt, I); else this._air(dt, I);
    this._checkHazards(dt, q);
  }

  _wheelPoints() {
    const f = this.forwardH, h = this.wb / 2, T = this.track;
    const xf = this.pos.x + f.x * h, zf = this.pos.z + f.z * h, xr = this.pos.x - f.x * h, zr = this.pos.z - f.z * h;
    return [xf, T.height(xf, zf), zf, xr, T.height(xr, zr), zr];
  }

  _ground(dt, I) {
    const sp = SURF_PARAMS[this.surf] || SURF_PARAMS[0], gripK = sp[0] * this.spec.grip;
    // base de la surface sous les roues
    const [xf, hf, zf, xr, hr, zr] = this._wheelPoints();
    _ft.set(xf - xr, hf - hr, zf - zr).normalize();
    _r.crossVectors(_ft, UP).normalize(); _u.crossVectors(_r, _ft).normalize();
    this.track.normal(this.pos.x, this.pos.z, _n);
    const sideSlope = _n.dot(_r), slopeUp = _ft.y;
    this.slope = slopeUp;

    // commandes
    const steer = clamp(I.steer, -1, 1), vf = this.vf, av = Math.abs(vf);
    const pedal = I.pedal, brR = I.brakeR, brF = I.brakeF;
    let af = -G * _ft.y;                                                       // gravité le long de la pente
    if (pedal && !I.manual) af += 3.4 * (1 - clamp(vf / 10, 0, 1));
    else if (pedal) af += 2.2 * (1 - clamp(vf / 8, 0, 1));
    af -= 0.0045 * vf * av + sp[1] * G * Math.sign(vf) * (av > 0.2 ? 1 : av / 0.2); // traînée + résistance au roulement
    if (brR) af -= Math.sign(vf) * 5.2 * gripK * (av > 0.15 ? 1 : av / 0.15);
    if (brF) af -= Math.sign(vf) * 8.6 * gripK * (av > 0.15 ? 1 : av / 0.15);
    // frein avant brutal à vitesse : bascule vers l'avant (endo)
    this.endo = clamp(this.endo + (brF && av > 6 && !brR ? dt * (av / 14) * (1 + 0.8 * Math.max(0, -_ft.y * 4)) : -dt * 1.2), 0, 1.6);
    // direction : taux de lacet limité par l'adhérence ; la vitesse latérale (glisse) est conservée puis rattrapée par la gomme
    let yawRate = steer * 2.0 * this.spec.agility / (1 + av / 6.5);
    const aReq = Math.abs(av * yawRate), aCap = gripK * G * 0.95;
    let skid = brR && Math.abs(steer) > 0.3 && av > 4;
    if (aReq > aCap) { yawRate *= aCap / aReq; skid = true; }
    const dyaw = yawRate * dt * Math.sign(vf || 1);
    this.yaw += dyaw;
    const c = Math.cos(dyaw), s = Math.sin(dyaw), vf2 = vf * c + this.vr * s, vr2 = -vf * s + this.vr * c;
    this.vf = vf2 + af * dt; this.vr = vr2 - G * sideSlope * dt * 0.9;
    const kg = (skid ? 2.4 : 11) * gripK;                                         // retour de la vitesse latérale vers la trajectoire
    this.vr *= Math.exp(-kg * dt);
    this.sliding = Math.abs(this.vr) > 2.2;
    if (Math.abs(this.vr) > 7.2 + 4 * gripK && av > 5) this._crash('lowside');
    // inclinaison du pilote dans les virages, chute sur le côté si trop penché
    const leanT = clamp(Math.atan2(av * yawRate * Math.sign(vf || 1), G) * 0.9 + this.vr * 0.04, -1.1, 1.1);
    this.lean += (leanT - this.lean) * Math.min(1, dt * 9);
    this.steerA += (steer * 0.42 / (1 + av / 9) - this.steerA) * Math.min(1, dt * 14);
    this.lowside = clamp(this.lowside + (Math.abs(this.lean) > 0.95 && this.sliding ? dt * 3 : -dt * 2), 0, 1.4);
    if (this.lowside > 1) this._crash('lowside');

    // manual / nose manual : équilibre autour d'un angle d'appui
    this._manual(dt, I, av);

    // saut : maintenir pour charger (accroupi), relâcher pour décoller
    if (I.jump) { this.charge = Math.min(1, this.charge + dt * 1.6); this.jumpHeld = true; }
    let popped = false;
    if (!I.jump && this.jumpHeld) { popped = true; this.jumpHeld = false; }

    // vitesse et déplacement
    const v = this.vel; v.set(0, 0, 0).addScaledVector(_ft, this.vf).addScaledVector(_r, this.vr);
    if (this.vyPrev === undefined) this.vyPrev = v.y;
    const aNeed = (v.y - this.vyPrev) / dt; this.aNeedF += (aNeed - this.aNeedF) * Math.min(1, dt * 40);
    if (!popped && av > 3 && this.aNeedF < -1.3 * G && this._worthTakeoff(v)) { v.y = this.vyPrev; this.pos.addScaledVector(v, dt); this._takeoff(false, I); return; }
    this.vyPrev = v.y;
    if (popped) { const k = 2.4 + 3.6 * this.charge; v.addScaledVector(_u.lerp(UP, 0.35).normalize(), k * (0.85 + 0.3 * this.spec.agility / 1.2)); this.charge = 0; this._takeoff(true, I); return; }
    if (!I.jump) this.charge = Math.max(0, this.charge - dt * 3);
    this.pos.x += v.x * dt; this.pos.z += v.z * dt;
    const [, hf2, , , hr2] = this._wheelPoints(), gy = (hf2 + hr2) / 2 + this.R / Math.max(0.6, _u.y) * 0.98;
    // suspension : accélération verticale de la surface (rebond sur les bosses et compressions)
    const ag = clamp(this.aNeedF, -90, 90);
    this.pos.y = gy;
    this._suspension(dt, ag, (hf2 - (this.lastHf ?? hf2)) / dt, (hr2 - (this.lastHr ?? hr2)) / dt);
    this.lastHf = hf2; this.lastHr = hr2;
    this.spinWheel += this.vf / this.R * dt;
    this.crank += (pedal ? Math.max(2, this.vf * 1.1) : 0.4) * dt;
    this._applyGround();
    this.settle = Math.max(0, this.settle - dt);
  }

  /* une petite crête ne fait pas décoller : on compare la trajectoire balistique au sol 0,18 s plus loin, il faut au moins 22 cm d'écart */
  _worthTakeoff(v) {
    const t = 0.18, gx = this.pos.x + v.x * t, gz = this.pos.z + v.z * t, ball = this.pos.y + this.vyPrev * t - 0.5 * G * t * t;
    return ball - (this.track.height(gx, gz) + this.R) > 0.22;
  }

  _manual(dt, I, av) {
    let target = 0, k = 9;
    if (I.manual && !I.pedal) { target = 0.6; if (I.brakeR) target -= 0.28; }
    else if (I.manual && I.pedal) { target = -0.42; }
    else if (I.pedal && this.slope > 0.18 && av < 3) target = 0.12;
    if (this.endo > 0.3) target = Math.min(target, -0.4 * this.endo);
    const wob = (I.manual ? Math.sin(performance.now() * 0.006 * (1 + av * 0.05)) * 0.06 + (I.pedal ? 0.12 : 0) : 0);
    this.manualV += ((target + wob - this.manual) * k - this.manualV * 4.5) * dt;
    this.manual += this.manualV * dt;
    if (this.manual > 1.2 && I.manual) this._crash('looped');
    if (this.manual < -0.9 || this.endo >= 1.5) this._crash('endo');
  }

  _suspension(dt, ag, vF, vR) {
    const w2 = 520, cdmp = 24, sag = 0.25 + 0.35 * this.charge, tF = this.spec.travelF, tR = this.spec.travelR;
    // ressort-amortisseur par roue, excité par la surface
    for (const k of ['F', 'R']) {
      const t = k === 'F' ? tF : tR, comp = this['sus' + k] * t, vel = this['sus' + k + 'V'] * t, wv = clamp(k === 'F' ? vF : vR, -30, 30);
      const acc = ag * 0.55 + (wv - this.lastVy) * 0.0 - w2 * (comp - sag * t) - cdmp * vel;
      const nv = vel + acc * dt, nc = clamp(comp + nv * dt, 0, t * 1.15);
      this['sus' + k + 'V'] = nv / t; this['sus' + k] = nc / t;
      if (nc >= t * 1.1 && nv > 4) this['sus' + k + 'V'] *= 0.4; // fin de course : on encaisse
    }
  }

  _takeoff(popped, I) {
    this.flipLock = Math.sign(I.flip); this.spinLock = Math.sign(I.spin);   // une touche déjà tenue au décollage ne déclenche pas de figure
    this.grounded = false; this.airT = 0; this.resetAir(); this.air.popped = popped; this.air.startY = this.pos.y;
    this.vf = 0;
    this.events.push({ type: 'takeoff', popped, speed: this.vel.length(), kind: this.kind });
    this.flipW = 0;
  }

  /* ───────── en l'air ───────── */
  _air(dt, I) {
    const A = this.air, v = this.vel, T = this.track;
    this.airT += dt; A.t = this.airT;
    v.y -= G * dt; v.multiplyScalar(1 - 0.0011 * dt * v.length());
    this.pos.addScaledVector(v, dt);
    A.maxH = Math.max(A.maxH, this.pos.y - A.startY);
    // commandes en l'air
    if (this.flipLock && Math.sign(I.flip) !== this.flipLock) this.flipLock = 0; if (this.spinLock && Math.sign(I.spin) !== this.spinLock) this.spinLock = 0;
    const flipIn = this.flipLock ? 0 : I.flip, spinIn = this.spinLock ? 0 : I.spin, tricky = Math.abs(flipIn) > 0.1 || Math.abs(spinIn) > 0.1 || I.table || I.whipL || I.whipR || I.bar || I.barB;
    // rotation : seulement tant que la touche est tenue, elle s'arrête net au relâchement (aucune élan, aucune fin de tour automatique)
    const ramp = (w, input, rate) => (Math.abs(input) > 0.1 ? w + (input * rate - w) * Math.min(1, dt * 18) : 0);
    this.flipW = ramp(this.flipW, flipIn, 9.5 * this.spec.agility);
    if (!this._rv) this.spinW = ramp(this.spinW, spinIn, 8.5 * this.spec.agility);
    if (I.revert && !this._rv) { this.spinW = 11; this._rv = 0.28; }
    if (this._rv) { this._rv -= dt; if (this._rv <= 0) { this._rv = 0; this.spinW = 0; } }
    const dFlip = this.flipW * dt, dSpin = this.spinW * dt;
    A.flip += dFlip; A.spin += dSpin;
    _qa.setFromAxisAngle(_a.set(1, 0, 0), -dFlip); this.quat.multiply(_qa);         // frontflip : nez vers le bas
    _qb.setFromAxisAngle(UP, -dSpin); this.quat.premultiply(_qb);
    // figures : table (roulis 90°), whip (lacet du vélo), barspin
    const tTgt = I.table ? 1.5 : 0; A.tableA += (tTgt - A.tableA) * Math.min(1, dt * 7);
    const wTgt = I.whipL ? 0.95 : I.whipR ? -0.95 : 0; A.whipA += (wTgt - A.whipA) * Math.min(1, dt * 9);
    if (I.bar || I.barB) A.barA += (I.bar ? 1 : -1) * 15 * dt;
    else { const nearest = Math.round(A.barA / TWO_PI) * TWO_PI; A.barA += (nearest - A.barA) * Math.min(1, dt * 6); }
    A.hands = Math.min(1, Math.max(0, (A.hands ?? 0) + ((I.nohand || I.bar || I.barB || (I.grab && I.manual)) ? dt * 6 : -dt * 6)));
    A.legs = Math.min(1, Math.max(0, A.legs + ((I.grab && I.manual) ? dt * 5 : -dt * 5)));
    A.superman = I.grab && I.manual ? 1 : 0; A.table = I.table ? 1 : 0; A.grab = I.grab && !I.manual ? 1 : 0; A.nohand = I.nohand || I.bar || I.barB ? 1 : 0;
    // saut sans aucune rotation : le vélo s'aligne doucement sur la pente ; dès qu'on a tourné, plus d'assistance
    if (!tricky && Math.abs(A.flip) < 0.04 && Math.abs(A.spin) < 0.04 && this.airT > 0.05) this._levelToGround(dt, 4.2);
    this.spinWheel += 4 * dt;
    this.visPos.copy(this.pos);                                                 // le modèle et la caméra suivent le vélo en l'air
    // contact des roues avec le sol
    this._wheelsContact();
  }

  _levelToGround(dt, rate) {
    const T = this.track; T.normal(this.pos.x + this.vel.x * 0.3, this.pos.z + this.vel.z * 0.3, _n);
    _b.copy(this.vel).setY(0); if (_b.lengthSq() < 1) _b.set(0, 0, -1).applyQuaternion(this.quat).setY(0);
    _b.normalize(); _a.copy(_b).addScaledVector(_n, -_b.dot(_n)).normalize();      // avant = vitesse dans le plan de la pente
    _r.crossVectors(_a, _n).normalize();
    _m.makeBasis(_r, _n, _b.copy(_a).negate()); _qa.setFromRotationMatrix(_m);
    this.quat.slerp(_qa, 1 - Math.exp(-rate * dt));
  }

  _wheelsContact() {
    if (this.airT < 0.18) return;                                              // le temps de quitter la lèvre
    const T = this.track, f = _a.set(0, 0, -1).applyQuaternion(this.quat), h = this.wb / 2;
    let hit = false;
    for (const s of [1, -1]) {
      const wx = this.pos.x + f.x * h * s, wy = this.pos.y + f.y * h * s, wz = this.pos.z + f.z * h * s, g = T.height(wx, wz);
      if (wy - this.R < g + 0.02) { hit = true; break; }
    }
    if (!hit && this.pos.y - this.R > T.height(this.pos.x, this.pos.z) + 0.05) return;
    // atterrissage
    T.normal(this.pos.x, this.pos.z, _n);
    const res = evaluateLanding(this, _n, this.vel), A = this.air;
    // micro-saut sur une bosse : le vélo reste « collé », pas de pénalité ni de figure
    if (this.airT < 0.32 && A.maxH < 0.35 && (res.quality !== 'crash' || this.airT < 0.25)) { res.quality = 'clean'; res.micro = true; }
    if (res.micro) res.impact = Math.min(res.impact, 3);
    if (res.quality === 'crash') { this.events.push({ type: 'land', ...res, air: { ...A }, airT: this.airT }); this._crash('landing', res); return; }
    // reprise du sol : cap issu de l'orientation, vitesses recalculées dans la pente
    _b.set(0, 0, -1).applyQuaternion(this.quat); this.yaw = Math.atan2(_b.x, -_b.z);
    const v = this.vel; _ft.copy(v).addScaledVector(_n, -v.dot(_n)); const sp = _ft.length();
    this.track.normal(this.pos.x, this.pos.z, _n);
    const f2 = this.forwardH; _ft.copy(f2).addScaledVector(_n, -f2.dot(_n)).normalize(); _r.crossVectors(_ft, UP).normalize();
    const loss = res.micro ? 1 : res.quality === 'perfect' ? 0.99 : res.quality === 'clean' ? 0.96 : 0.86;
    this.vf = clamp((v.dot(_ft)) * loss, -30, 60); this.vr = v.dot(_r) * loss;
    const [, hf, , , hr] = this._wheelPoints(); this.pos.y = (hf + hr) / 2 + this.R; this.vyPrev = this.vf * _ft.y; this.aNeedF = 0; this.lastHf = hf; this.lastHr = hr;
    this.susF = clamp(0.25 + res.impact / 22, 0.25, 1); this.susR = this.susF; this.susFV = -3; this.susRV = -3; this.settle = res.quality === 'sketchy' ? 0.8 : 0.35;
    this.manual = 0; this.manualV = 0; this.grounded = true; if (!res.micro) this.lean = 0; this.endo = 0;
    this.events.push({ type: 'land', ...res, air: { ...A }, airT: this.airT, speed: Math.abs(this.vf), kind: this.kind });
    this.air = { ...A, tableA: 0, barA: 0, whipA: 0 };
    this._applyGround();
  }

  /* orientation au sol : base issue des deux points de contact, roulis (inclinaison) et assiette (manual) */
  _applyGround() {
    const [xf, hf, zf, xr, hr, zr] = this._wheelPoints();
    _ft.set(xf - xr, hf - hr, zf - zr).normalize(); _r.crossVectors(_ft, UP).normalize(); _u.crossVectors(_r, _ft).normalize();
    this.track.normal(this.pos.x, this.pos.z, _n);
    const rollG = Math.atan2(_n.dot(_r), _n.dot(_u)) * 0.55;
    _qa.setFromAxisAngle(_ft, this.lean + rollG);   // angle positif autour de l'avant = le haut part vers la droite
    _r.applyQuaternion(_qa); _u.applyQuaternion(_qa);
    const m = this.manual, cm = Math.cos(m), sm = Math.sin(m), f2 = _b.copy(_ft).multiplyScalar(cm).addScaledVector(_u, sm), u2 = _a.copy(_u).multiplyScalar(cm).addScaledVector(_ft, -sm);
    _m.makeBasis(_r, u2, f2.negate()); this.quat.setFromRotationMatrix(_m);
    // position visuelle : le centre pivote autour de la roue qui reste au sol
    this.visPos.copy(this.pos);
    const h = this.wb / 2;
    if (m > 0) { this.visPos.addScaledVector(_ft, -h * (1 - cm)); this.visPos.y += h * sm * 0.9; } else if (m < 0) { this.visPos.addScaledVector(_ft, h * (1 - cm)); this.visPos.y += h * -sm * 0.9; }
  }

  /* ───────── dangers ───────── */
  _checkHazards(dt, q) {
    if (this.crashed) return;
    const T = this.track;
    // rochers dans la piste
    T.obstaclesNear(this.pos.x, this.pos.z, _obs);
    for (const o of _obs) {
      const dx = this.pos.x - o.x, dz = this.pos.z - o.z, d = Math.hypot(dx, dz);
      if (d < o.r + 0.32 && this.pos.y - this.R < T.height(o.x, o.z) + o.h * 0.9) { if (this.speed > 3.2) { this._crash('rocher'); return; } this.vf *= -0.2; }
    }
    if (q) {
      this.onRail = q.kind === K.RAIL && Math.abs(q.dlat) < 0.3 && this.grounded;
      if (q.kind === K.BRIDGE && Math.abs(q.dlat) > q.hw + 0.25 && this.pos.y - this.R < q.y - 0.4 && this.grounded) this._crash('chute');
      if (q.d > 48) this._crash('hors-piste');
    }
    if (this.pos.y < q?.y - 30) this._crash('chute');
  }

  _crash(reason, info) {
    if (this.crashed) return;
    this.crashed = true; this.crashT = 0; this.crashReason = reason;
    if (this.grounded) { this.vel.set(0, 0, 0).addScaledVector(_ft, this.vf).addScaledVector(_r, this.vr); }
    this.grounded = false; this.tumble = new V3((Math.random() - 0.5) * 6, (Math.random() - 0.5) * 3, (Math.random() - 0.5) * 6);
    this.events.push({ type: 'crash', reason, info, speed: this.vel.length() });
  }
  _crashStep(dt) {
    this.crashT += dt; const v = this.vel, T = this.track;
    v.y -= G * dt; this.pos.addScaledVector(v, dt);
    _qa.setFromEuler(new THREE.Euler(this.tumble.x * dt, this.tumble.y * dt, this.tumble.z * dt)); this.quat.multiply(_qa);
    const g = T.height(this.pos.x, this.pos.z) + this.R * 0.9;
    if (this.pos.y < g) { this.pos.y = g; T.normal(this.pos.x, this.pos.z, _n); const vn = v.dot(_n); if (vn < 0) v.addScaledVector(_n, -vn * 1.35); v.x *= 0.96; v.z *= 0.96; this.tumble.multiplyScalar(0.92); }
    this.visPos.copy(this.pos);
  }

  /* réapparition au dernier point de contrôle */
  respawn(cp) { this.reset({ x: cp.x, y: cp.y, z: cp.z, yaw: cp.yaw, s: cp.s }, 3); this.events.push({ type: 'respawn' }); }
}
