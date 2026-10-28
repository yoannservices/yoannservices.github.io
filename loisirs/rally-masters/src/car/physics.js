/* Physique de la voiture, codée à la main : modèle bicyclette (repère carrosserie : u avant, v gauche, r lacet à gauche),
   forces de pneus saturées (cercle d'adhérence), adhérence par surface et par type de pneu, transfert de masse longitudinal
   et latéral réparti par les raideurs de suspension, différentiels, frein à main, boîte auto, turbo, suspension simulée
   (roulis, tangage, pompage), sauts, collisions et dégâts. */
import { clamp, lerp, smooth, sign } from '../core/util.js';
import { SURFACES, gripOf, WEATHERS, ASPHALTE, BOUE, GLACE, NEIGE } from '../surfaces/surfaces.js';
import { ENVS } from '../core/data.js';

const G = 9.81, STEP = 1 / 120, MU_SCALE = 1.12, LAMBDA = 0.1;
const curve = (x) => clamp(1 - 1.6 * (x - 0.62) ** 2, 0.5, 1);

export class CarPhysics {
  constructor(def, setup, upg, env, weather) {
    this.def = def; this.setup = { suspF: 1, suspR: 1, frein: 0.6, diffAv: 0.3, diffAr: 0.3, pneus: 'auto', centre: def.split, ...setup };
    this.up = { moteur: 0, freins: 0, suspension: 0, protection: 0, ...upg };
    this.weather = weather; this.tire = this.setup.pneus === 'auto' ? ENVS[env].tire : this.setup.pneus;
    const d = def, L = d.L;
    this.m = d.mass; this.a = L * (1 - d.wf); this.b = L * d.wf; this.Iz = d.mass * (d.iz * L) ** 2;
    this.P = d.power * 1000 * (1 + 0.07 * this.up.moteur);
    this.Tp = this.P / (curve(0.9) * 0.9 * d.rpmMax * 2 * Math.PI / 60);
    this.brakeF = d.brakeG * G * d.mass * (1 + 0.07 * this.up.freins);
    this.prot = 1 - 0.18 * this.up.protection;
    this.stiff = (this.setup.suspF + this.setup.suspR) / 2 * (1 + 0.04 * this.up.suspension);
    this.sF = (this.setup.suspF * d.arb) / (this.setup.suspF * d.arb + this.setup.suspR * (1 - d.arb));
    this.events = [];
    this.dmg = { bumpF: 0, bumpR: 0, steer: 0, steerSign: 1, engine: 0, body: 0, tires: [0, 0, 0, 0] };
    this.hint = [0, 0, 0, 0, 0]; this.g = [{}, {}, {}, {}, {}];
    this.reset(0, 0, 0, 0);
  }

  reset(x, z, yaw, y) {
    Object.assign(this, {
      x, z, yaw, y, vy: 0, u: 0, v: 0, r: 0, steer: 0, gear: 1, rpm: this.def.idle, boost: 0, shiftT: 0, throttle: 0, brake: 0,
      ax: 0, ay: 0, axF: 0, ayF: 0, air: false, airT: 0, pitch: 0, pitchV: 0, roll: 0, rollV: 0, heave: 0, heaveV: 0, pitchG: 0, rollG: 0,
      aF: 0, aR: 0, dead: false, speed: 0, kmh: 0, slide: [0, 0, 0, 0], spin: [0, 0, 0, 0], wheelAng: 0, hand: false, water: false, odo: 0, surfMain: 0,
      lockF: 0, lockR: 0, spinF: 0, spinR: 0, contact: [true, true, true, true], slipBody: 0, yPrev: y, skid: 0,
    });
    this.hint.fill(0);
  }
  /* repositionne la voiture le long du tracé (remise en piste payante) */
  place(track, i) { const p = track.pointAt(i); this.reset(p.x, p.z, p.h, p.y); this.hint.fill(i); }

  /* ---------- pas de temps ---------- */
  update(dt, ctl, track) {
    this.events.length = 0;
    if (!(dt > 1e-4)) return;
    const n = Math.max(1, Math.min(8, Math.ceil(dt / STEP))), h = Math.min(dt, 0.05) / n;
    for (let k = 0; k < n; k++) this._step(h, ctl, track);
    this._collide(track);
    this.odo += Math.abs(this.u) * dt;
    // garde-fou : en cas de valeur aberrante, retour au dernier point sain du tracé
    if (Number.isFinite(this.x + this.z + this.y + this.u + this.v + this.r + this.yaw)) this.safeIdx = this.hint[4];
    else this.place(track, this.safeIdx || 0);
  }

  _mu(w, surf) {
    const S = SURFACES[surf], t = this.dmg.tires[w];
    let mu = gripOf(surf, this.tire, this.weather);
    mu *= 1 - t * 0.5;                                                // pneu crevé : on roule sur la jante
    mu *= 1 + 0.02 * this.up.suspension * S.bump - 0.05 * S.bump * (this.stiff - 1); // sol cassé : suspension souple = meilleur contact
    return mu;
  }

  _step(dt, ctl, track) {
    const d = this.def, S = this, W = this.g;
    const sy = Math.sin(this.yaw), cy = Math.cos(this.yaw);
    // --- sol sous les 4 roues + centre ---
    const hw = d.tw / 2, wp = [[hw, this.a], [-hw, this.a], [hw, -this.b], [-hw, -this.b], [0, 0]];
    for (let q = 0; q < 5; q++) {
      const px = this.x + sy * wp[q][1] + cy * wp[q][0], pz = this.z + cy * wp[q][1] - sy * wp[q][0];
      track.groundAt(px, pz, this.hint[q], W[q]); this.hint[q] = W[q].i;
    }
    const yFL = W[0].y, yFR = W[1].y, yRL = W[2].y, yRR = W[3].y;
    const yc = (yFL + yFR + yRL + yRR) / 4;
    const slopeAx = ((yFL + yFR) - (yRL + yRR)) / 2 / d.L, slopeLat = ((yFL + yRL) - (yFR + yRR)) / 2 / d.tw;
    // pente : nez en haut = tangage négatif ; en vol, la voiture suit sa trajectoire et non le relief en dessous
    this.pitchG += ((this.air ? -Math.atan2(this.vy, Math.max(Math.abs(this.u), 3)) : -Math.atan(slopeAx)) - this.pitchG) * Math.min(1, dt * (this.air ? 4 : 14));
    this.rollG += ((this.air ? 0 : Math.atan(slopeLat)) - this.rollG) * Math.min(1, dt * (this.air ? 2 : 14));

    // --- verticale ---
    const gv = (yc - this.yPrev) / dt;
    this.vy -= G * dt;
    const yNew = this.y + this.vy * dt;
    if (yNew <= yc + 0.03) {
      if (this.air) {
        const impact = -(this.vy - gv);
        if (impact > 3) this._landing(impact, track);
        this.air = false;
      }
      this.y = yc; this.vy = gv;
    } else { this.y = yNew; if (!this.air) { this.air = true; this.airT = 0; } }
    if (this.air) this.airT += dt;
    this.yPrev = yc;
    this.contact[0] = this.contact[1] = this.contact[2] = this.contact[3] = !this.air;

    // --- commande ---
    let thr = clamp(ctl.throttle, 0, 1), brk = clamp(ctl.brake, 0, 1);
    this.hand = !!ctl.hand;
    if (this.locked) { thr = 0; brk = 1; this.hand = true; }
    if (this.locked) { /* départ arrêté : pas de marche arrière */ }
    else if (this.gear > 0 && brk > 0.1 && thr < 0.1 && this.u < 1.2) { this.gear = -1; }
    else if (this.gear < 0 && thr > 0.1 && this.u > -1.2) { this.gear = 1; this.rpm = d.idle; }
    if (this.gear < 0) { const t = thr; thr = brk; brk = t; }
    if (this.dead) thr = 0;
    this.throttle += (thr - this.throttle) * Math.min(1, dt * 12);
    this.brake += (brk - this.brake) * Math.min(1, dt * 14);

    // --- direction ---
    const au = Math.abs(this.u), dmg = this.dmg;
    const dmax = d.steerMax * (1 - 0.25 * dmg.steer / 100) / (1 + (au / 22) ** 2);
    const target = clamp(-ctl.steer, -1, 1) * dmax + dmg.steerSign * dmg.steer / 100 * 0.07;
    this.steer += (target - this.steer) * (1 - Math.exp(-dt / 0.09));
    const dl = this.steer;

    // --- moteur / boîte ---
    const Rw = d.wheelR, gearK = this.gear > 0 ? d.ratios[this.gear - 1] : this.gear < 0 ? d.rev : 0;
    const wheelRpm = au / Rw * gearK * 60 / (2 * Math.PI);
    if (this.shiftT > 0) this.shiftT -= dt;
    const launch = this.throttle * (d.idle + (d.rpmMax * 0.5 - d.idle)) * (this.gear === 1 || this.gear < 0 ? 1 : 0);
    const free = this.air ? d.idle + this.throttle * (d.rpmMax * 0.9 - d.idle) : 0;
    const tgt = Math.max(d.idle, wheelRpm, au < 8 ? launch : 0, free);
    this.rpm += (tgt - this.rpm) * Math.min(1, dt * (tgt > this.rpm ? 18 : 10));
    if (this.gear > 0 && this.shiftT <= 0 && !this.air) {
      if (this.rpm > d.rpmMax * 0.93 && this.gear < d.ratios.length && this.throttle > 0.1) { this.gear++; this.shiftT = 0.2; this.events.push({ type: 'shift' }); }
      else if (this.gear > 1 && wheelRpm * d.ratios[this.gear - 2] / d.ratios[this.gear - 1] < d.rpmMax * 0.78 && wheelRpm < d.rpmMax * 0.4) { this.gear--; this.shiftT = 0.12; }
    }
    // turbo : la pression monte avec le régime et la charge, retombe au lever de pied
    const bt = d.turbo ? this.throttle * smooth(0.28, 0.62, this.rpm / d.rpmMax) : 0;
    this.boost += (bt - this.boost) * Math.min(1, dt / d.tau * (bt > this.boost ? 1 : 2.5));
    const x = this.rpm / d.rpmMax;
    let T = this.Tp * curve(x) * (d.turbo ? 1 - d.turbo * (1 - this.boost) : 1);
    if (x > 1) T = 0;
    T *= 1 - 0.65 * Math.pow(dmg.engine / 100, 1.2);
    let drive = this.shiftT > 0 || gearK === 0 ? 0 : T * this.throttle * gearK * 0.9 / Rw;
    // frein moteur
    const engBrake = this.throttle < 0.05 && gearK > 0 && !this.air ? 0.12 * this.Tp * x * gearK * 0.9 / Rw : 0;
    const dirv = this.gear < 0 ? -1 : 1;     // sens d'entraînement
    const driveF = drive * dirv - Math.sign(this.u) * engBrake * (au > 0.5 ? 1 : 0);

    // --- charges verticales par essieu ---
    const m = this.m, Fzs = this.air ? 0 : m * G * Math.cos(Math.atan(slopeAx));
    this.axF += (this.ax - this.axF) * Math.min(1, dt * 14); this.ayF += (this.ay - this.ayF) * Math.min(1, dt * 14);
    let Fzf = Fzs * (this.b / d.L) - d.h / d.L * m * this.axF, Fzr = Fzs * (this.a / d.L) + d.h / d.L * m * this.axF;
    Fzf = Fzs ? clamp(Fzf, Fzs * 0.12, Fzs * 0.9) : 0; Fzr = Fzs ? clamp(Fzr, Fzs * 0.12, Fzs * 0.9) : 0;
    const dTot = m * Math.abs(this.ayF) * d.h / d.tw, dF = dTot * this.sF, dR = dTot * (1 - this.sF), N0 = m * G / 4;
    const cap = (mu, Fz, dz) => Fz > 0 ? Math.max(0, mu * MU_SCALE * (Fz - LAMBDA * (Fz * Fz / 2 + 2 * dz * dz) / N0)) : 0;
    // adhérence moyenne des deux roues de chaque essieu
    const muF = (this._mu(0, W[0].surf) + this._mu(1, W[1].surf)) / 2, muR = (this._mu(2, W[2].surf) + this._mu(3, W[3].surf)) / 2;
    let capF = cap(muF, Fzf, dF), capR = cap(muR, Fzr, dR);
    const peak = (SURFACES[W[0].surf].peak + SURFACES[W[1].surf].peak) / 2, peakR = (SURFACES[W[2].surf].peak + SURFACES[W[3].surf].peak) / 2;
    const Cf = (SURFACES[W[0].surf].C + SURFACES[W[1].surf].C) / 2, Cr = (SURFACES[W[2].surf].C + SURFACES[W[3].surf].C) / 2;
    this.surfMain = W[4].surf;

    // --- répartition motrice et freins ---
    let FdF = 0, FdR = 0;
    if (d.drive === 'FWD') FdF = driveF; else if (d.drive === 'RWD') FdR = driveF; else { FdF = driveF * this.setup.centre; FdR = driveF * (1 - this.setup.centre); }
    // différentiels : verrouillé = moins de patinage mais plus de sous-virage / survirage sous couple
    const lf = this.setup.diffAv, lr = this.setup.diffAr;
    const tcapF = capF * (1 + 0.06 * lf - 0.08 * (1 - lf) * (d.drive !== 'RWD' ? 1 : 0)), tcapR = capR * (1 + 0.06 * lr - 0.08 * (1 - lr) * (d.drive !== 'FWD' ? 1 : 0));
    if (d.drive === 'AWD') {
      if (Math.abs(FdF) > tcapF) { const ex = FdF - Math.sign(FdF) * tcapF; FdF -= ex; FdR += ex * 0.6; }
      if (Math.abs(FdR) > tcapR) { const ex = FdR - Math.sign(FdR) * tcapR; FdR -= ex; FdF += ex * 0.6; }
    }
    const sg = au > 0.35 ? Math.sign(this.u) : 0;
    const Fbrk = this.brake * this.brakeF;
    const bias = this.setup.frein;
    let FxF = FdF - sg * Fbrk * bias, FxR = FdR - sg * Fbrk * (1 - bias);
    if (this.hand && !this.air) FxR += -sg * capR * 1.3;           // frein à main : roues arrière bloquées
    else if (this.hand) FxR = 0;
    if (au < 0.35 && Math.abs(driveF) < 1 && this.brake < 0.05 && !this.hand) { /* arrêt : rien à freiner */ }
    FxF = clamp(FxF, -tcapF, tcapF); FxR = clamp(FxR, -tcapR, tcapR);
    this.spinF = d.drive !== 'RWD' ? clamp((Math.abs(FdF) - tcapF * 0.98) / (tcapF + 1), 0, 1) + (Math.abs(FdF) > tcapF * 0.98 ? 0.2 : 0) : 0;
    this.spinR = d.drive !== 'FWD' ? clamp((Math.abs(FdR) - tcapR * 0.98) / (tcapR + 1), 0, 1) + (Math.abs(FdR) > tcapR * 0.98 ? 0.2 : 0) : 0;
    this.lockF = Math.abs(sg * Fbrk * bias) > capF ? 1 : 0; this.lockR = this.hand || Math.abs(sg * Fbrk * (1 - bias)) > capR ? 1 : 0;

    // --- forces latérales ---
    const uEff = Math.max(au, 1.5), us = this.u >= 0 ? 1 : -1;
    const alF = Math.atan2(this.v + this.a * this.r, uEff) - dl * us, alR = Math.atan2(this.v - this.b * this.r, uEff);
    const relax = (cur, tgt, sigma) => cur + (tgt - cur) * Math.min(1, au * dt / sigma + 0.02);
    this.aF = relax(this.aF, alF, 0.5); this.aR = relax(this.aR, alR, 0.5);
    const lat = (al, cp, C, cx, Fx, lock) => {
      const B = 2.6 / cp, avail = Math.sqrt(Math.max(0, cx * cx - Fx * Fx));
      return -avail * Math.sin(C * Math.atan(B * al)) * lock;
    };
    const useF = Math.abs(FxF) / (capF + 1), useR = Math.abs(FxR) / (capR + 1);
    const lockLatF = 1 - 0.22 * lf * useF, lockLatR = 1 - 0.22 * lr * useR - (this.hand ? 0.25 : 0);
    const FyF = this.air ? 0 : lat(this.aF, peak, Cf, capF, FxF, lockLatF), FyR = this.air ? 0 : lat(this.aR, peakR, Cr, capR, FxR, lockLatR);
    this.slide[0] = this.slide[1] = clamp((Math.hypot(FxF, FyF) / (capF + 1) - 0.82) * 5, 0, 1) * Math.min(1, au / 3) + this.spinF * 0.7 + this.lockF * 0.4 * Math.min(1, au / 3);
    this.slide[2] = this.slide[3] = clamp((Math.hypot(FxR, FyR) / (capR + 1) - 0.82) * 5, 0, 1) * Math.min(1, au / 3) + this.spinR * 0.7 + this.lockR * 0.5 * Math.min(1, au / 3);

    // --- résistances ---
    const mud = (SURFACES[W[0].surf].rr + SURFACES[W[1].surf].rr + SURFACES[W[2].surf].rr + SURFACES[W[3].surf].rr) / 4;
    const flats = dmg.tires.reduce((s, t) => s + t, 0);
    let Fres = (0.5 * 1.2 * d.cda * (1 + 0.12 * dmg.bumpF / 100) * this.u * Math.abs(this.u) + (mud + 0.05 * flats) * m * G * sg * (this.air ? 0 : 1));
    const water = W[0].water || W[1].water || W[2].water || W[3].water; this.water = !!water;
    if (water && !this.air) Fres += 900 * this.u;
    const Fslope = -m * G * slopeAx * (this.air ? 0 : 1), Fbank = -m * G * slopeLat * (this.air ? 0 : 1);
    const cd = Math.cos(dl), sd = Math.sin(dl);
    const Fx = FxF * cd - FyF * sd + FxR - Fres + Fslope;
    const Fy = FyF * cd + FxF * sd + FyR + Fbank;
    // pneu crevé : traînée côté crevé -> embardée
    const Mp = ((dmg.tires[0] + dmg.tires[2]) - (dmg.tires[1] + dmg.tires[3])) * 0.07 * m * G * d.tw / 2 * Math.min(1, au / 4);
    let Mz = this.a * (FyF * cd + FxF * sd) - this.b * FyR + Mp - this.Iz * (0.1 + 0.5 * (this.air ? 1 : 0)) * this.r;

    // --- intégration ---
    if (!this.air) {
      let du = Fx / m + this.v * this.r, dv = Fy / m - this.u * this.r, dr = Mz / this.Iz;
      this.u += du * dt; this.v += dv * dt; this.r += dr * dt;
      this.ax = Fx / m; this.ay = Fy / m;
      if (au < 0.35 && this.throttle < 0.05 && !this.hand) this.u *= Math.exp(-4 * dt);
      // basse vitesse : le modèle cinématique prend le relais (évite les oscillations de dérive)
      if (au < 4) {
        const k = 1 - au / 4;
        this.v *= Math.exp(-6 * k * dt);
        this.r += (this.u * Math.tan(dl) / d.L - this.r) * Math.min(1, 10 * k * dt);
      }
      if (this.gear > 0 && this.u < -0.3 && this.throttle > 0.2) this.u *= 0.9;   // pas de marche arrière involontaire
    } else {
      this.ax = 0; this.ay = 0;
      this.u *= 1 - 0.02 * dt; this.r *= 1 - 0.4 * dt;   // en l'air la vitesse est conservée
    }
    this.yaw += this.r * dt;
    const sy2 = Math.sin(this.yaw), cy2 = Math.cos(this.yaw);
    this.x += (this.u * sy2 + this.v * cy2) * dt; this.z += (this.u * cy2 - this.v * sy2) * dt;
    this.speed = Math.hypot(this.u, this.v); this.kmh = this.speed * 3.6; this.slipBody = Math.atan2(this.v, Math.max(au, 1));
    this.wheelAng += (this.u / Rw) * dt;
    // --- suspension simulée : roulis / tangage / pompage (ressorts amortis) ---
    const om = 9 * Math.sqrt(this.stiff), ze = 0.45;
    const kp = 0.0048 / this.stiff, kr = 0.0058 / this.stiff * (1 - 0.1 * this.up.suspension);
    const pT = this.air ? 0 : -this.axF * kp;
    const rT = this.air ? 0 : this.ayF * kr;
    this.pitchV += (om * om * (pT - this.pitch) - 2 * ze * om * this.pitchV) * dt; this.pitch += this.pitchV * dt;
    this.rollV += (om * om * (rT - this.roll) - 2 * ze * om * this.rollV) * dt; this.roll += this.rollV * dt;
    // rugosité du sol : secousses
    if (!this.air) {
      const bump = SURFACES[W[4].surf].bump * Math.min(1, au / 25) * (1 + 0.5 * this.stiff);
      this.heaveV += (Math.random() - 0.5) * bump * 14 * dt * 60 * 0.02;
      this.rollV += (Math.random() - 0.5) * bump * 0.5 * dt; this.pitchV += (Math.random() - 0.5) * bump * 0.35 * dt;
    }
    const oh = om * 1.4; this.heaveV += (-oh * oh * this.heave - oh * this.heaveV) * dt; this.heave += this.heaveV * dt;
    this.heave = clamp(this.heave, -0.2, 0.08);
    if (water && !this.air && au > 4 && Math.random() < dt * au * 0.9) this.events.push({ type: 'splash', x: this.x, z: this.z, y: yc, v: au });
  }

  _landing(impact, track) {
    this.heaveV -= impact * 0.18; this.pitchV += impact * 0.03;
    this.events.push({ type: 'land', v: impact });
    if (impact > 7.5) {
      const d = (impact - 7.5) ** 1.5 * 2.2 * this.prot;
      this.dmg.body = Math.min(100, this.dmg.body + d * 0.4); this.dmg.engine = Math.min(100, this.dmg.engine + d * 0.2);
      this.dmg.bumpF = Math.min(100, this.dmg.bumpF + d * (this.pitch > 0 ? 1.2 : 0.4)); this.dmg.steer = Math.min(100, this.dmg.steer + d * 0.25);
      if (Math.random() < clamp((impact - 8) / 8, 0, 0.9)) this._puncture(Math.floor(Math.random() * 4));
      this.events.push({ type: 'impact', sev: impact, hard: true, cx: 0, cz: 1 });
    }
  }
  _puncture(w) { if (this.dmg.tires[w] < 1) { this.dmg.tires[w] = 1; this.events.push({ type: 'puncture', w }); } }

  /* ---------- collisions : murs de la piste (talus, glissières, parapets) et obstacles ---------- */
  _collide(track) {
    const d = this.def, hl = d.vis.L / 2, hwid = d.vis.W / 2 - 0.05;
    const sy = Math.sin(this.yaw), cy = Math.cos(this.yaw);
    const loc = (lx, lz) => [this.x + sy * lz + cy * lx, this.z + cy * lz - sy * lx];
    const corners = [[hwid, hl - 0.1], [-hwid, hl - 0.1], [hwid, -hl + 0.1], [-hwid, -hl + 0.1], [hwid, 0], [-hwid, 0]];
    let worst = null;
    const g = this.g[5] || (this.g[5] = {});
    for (const [lx, lz] of corners) {
      const [px, pz] = loc(lx, lz); track.groundAt(px, pz, this.hint[4], g);
      let pen = 0, nx = 0, nz = 0;
      const lxv = Math.cos(g.hh), lzv = -Math.sin(g.hh);
      if (g.lat > g.wl) { pen = g.lat - g.wl; nx = -lxv; nz = -lzv; } else if (-g.lat > g.wr) { pen = -g.lat - g.wr; nx = lxv; nz = lzv; }
      if (pen > 0 && (!worst || pen > worst.pen)) worst = { pen, nx, nz, lx, lz, k: 4 };
    }
    if (worst) this._resolve(worst, 0.28, 1);
    // obstacles : trois cercles le long de la voiture
    const cols = track.colliders(this.hint[4]), circles = [[0, hl - 0.7], [0, 0], [0, -hl + 0.7]], rc = hwid + 0.05;
    for (const co of cols) {
      for (const [lx, lz] of circles) {
        const [px, pz] = loc(lx, lz), dx = px - co.x, dz = pz - co.z, dist = Math.hypot(dx, dz), pen = rc + co.r - dist;
        if (pen > 0 && dist > 1e-4) {
          const k = co.k; this._resolve({ pen, nx: dx / dist, nz: dz / dist, lx, lz, k }, k === 2 ? 0.05 : k === 3 ? 0.1 : 0.18, k === 2 ? 0.35 : k === 3 ? 0.5 : 1);
        }
      }
    }
  }
  /* résolution d'un contact : repousse la voiture, supprime la vitesse normale, ajoute du lacet, inflige les dégâts */
  _resolve(c, e, dmgK) {
    const sy = Math.sin(this.yaw), cy = Math.cos(this.yaw);
    this.x += c.nx * c.pen; this.z += c.nz * c.pen;
    const vx = this.u * sy + this.v * cy, vz = this.u * cy - this.v * sy, vn = vx * c.nx + vz * c.nz;
    if (vn < 0) {
      const j = -(1 + e) * vn;
      let nvx = vx + c.nx * j, nvz = vz + c.nz * j;
      const tx = -c.nz, tz = c.nx, vt = nvx * tx + nvz * tz; nvx -= tx * vt * 0.1; nvz -= tz * vt * 0.1;   // frottement du contact
      this.u = nvx * sy + nvz * cy; this.v = nvx * cy - nvz * sy;
      const nlx = c.nx * cy - c.nz * sy, nlz = c.nx * sy + c.nz * cy;     // normale en repère carrosserie (x gauche, z avant)
      const tau = c.lz * nlx - c.lx * nlz;
      this.r = clamp(this.r + tau * j * 0.22, -4, 4);
      const sev = -vn;
      this.heaveV -= sev * 0.05;
      if (sev > 1.5) this._damage(sev, c.lx, c.lz, dmgK);
    }
  }
  _damage(sev, lx, lz, k) {
    const dm = this.dmg, d = sev * sev * 0.33 * k * this.prot, hl = this.def.vis.L / 2;
    dm.body = Math.min(100, dm.body + d * 0.5);
    if (lz > hl * 0.35) {
      dm.bumpF = Math.min(100, dm.bumpF + d * 1.1); if (sev > 5) dm.engine = Math.min(100, dm.engine + d * 0.45);
      if (Math.abs(lx) > 0.45) { dm.steer = Math.min(100, dm.steer + d * 0.3); dm.steerSign = lx > 0 ? -1 : 1; }
    } else if (lz < -hl * 0.35) dm.bumpR = Math.min(100, dm.bumpR + d * 1.1);
    else { dm.steer = Math.min(100, dm.steer + d * 0.1); }
    if (sev > 6 && Math.abs(lx) > 0.5 && Math.abs(lz) > this.def.L * 0.25 && Math.random() < clamp((sev - 5) / 10, 0, 0.8)) this._puncture((lx > 0 ? 0 : 1) + (lz > 0 ? 0 : 2));
    if (dm.engine >= 100) { this.dead = true; this.events.push({ type: 'dead' }); }
    this.events.push({ type: 'impact', sev, cx: lx, cz: lz });
  }

  get idx() { return this.hint[4]; }

  /* santé globale 0..1 (pour l'affichage) */
  health() { const d = this.dmg; return 1 - Math.max(d.engine, d.steer * 0.6, d.bumpF * 0.3, d.body * 0.3, ...d.tires.map((t) => t * 0.5)) / 100; }
}
