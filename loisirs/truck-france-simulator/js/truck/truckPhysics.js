import { WHEELBASE, HITCH_OFFSET } from './truckData.js';

const G = 9.81;
const MAX_SPEED = 25; // limiteur 90 km/h
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const wrap = (a) => Math.atan2(Math.sin(a), Math.cos(a));

/** Consommation en L/100 km. */
export const consumption = (mass, kmh) => 20 + (mass / 1000) * 0.45 + (kmh / 90) ** 2 * 8;

/** Modèle vélo simplifié + remorque articulée. Avance le long de +Z local (cap h). */
export class TruckPhysics {
  /** pose : {x, z, h} de départ ; scale : mètres réels par mètre de jeu (carburant et odomètre). */
  constructor(cab, trailer, loadFrac, pose, scale = 1) {
    this.cab = cab;
    this.trailer = trailer;
    this.loadFrac = loadFrac;
    this.scale = scale;
    Object.assign(this, { x: pose.x, z: pose.z, h: pose.h, th: pose.h, v: 0, steer: 0, fuel: cab.tank, odo: 0, wheelAngle: 0, accel: 0, lat: 0, gear: 0, rpm: 0 });
  }

  get load() { return this.trailer.maxLoad * this.loadFrac; }
  get mass() { return this.cab.mass + this.trailer.empty + this.load + this.fuel * 0.84; }
  get hitch() { return { x: this.x + Math.sin(this.h) * HITCH_OFFSET, z: this.z + Math.cos(this.h) * HITCH_OFFSET }; }

  /** inp : {throttle, brake, steer(+gauche), handbrake} ; env : {offroad, mu, locked} */
  update(dt, inp, env = {}) {
    const m = this.mass;
    const mu = 0.85 * (env.mu ?? 1) * (env.offroad ? 0.5 : 1);
    const v = this.v;
    let thr = inp.throttle, brk = inp.brake, reverse = 0;
    if (brk > 0 && v < 0.5) { reverse = brk; brk = 0; } // S à l'arrêt = marche arrière
    if (thr > 0 && v < -0.5) { brk = thr; thr = 0; }     // avant en reculant = frein
    if (this.fuel <= 0 || env.locked) { thr = 0; reverse = 0; }

    // force motrice (puissance constante, couple limité par adhérence)
    const P = this.cab.powerKw * 1000 * (env.power ?? 1);
    const fMax = Math.min(mu * m * G * 0.6, P / 5);
    const lim = clamp((MAX_SPEED + 1 - Math.abs(v)) / 2, 0, 1);
    let drive = 0;
    if (thr > 0) drive = Math.min(P * thr / Math.max(v, 2), fMax) * lim;
    if (reverse > 0) drive = -Math.min(P * reverse / Math.max(-v, 2), fMax * 0.6) * clamp((6 - -v) / 2, 0, 1);

    const drag = 3.8 * v * v + 0.007 * m * G * (Math.abs(v) > 0.05 ? 1 : 0) + (env.offroad ? 0.04 * m * G : 0);
    const fBrake = brk * mu * m * G * 0.9 * this.trailer.brake + (inp.handbrake ? 0.5 * mu * m * G : 0);
    const resist = drag + fBrake;

    const s = Math.sign(v) || Math.sign(drive);
    let nv = v + ((drive - s * resist) / m) * dt;
    if (v * nv < 0 && Math.abs(drive) < resist) nv = 0;
    this.accel = (nv - v) / dt;
    this.v = nv;

    // direction : angle limité par la vitesse, la charge et l'adhérence (sous-virage)
    const loadPen = 1 - 0.25 * this.loadFrac;
    let maxSteer = (0.62 / (1 + (Math.abs(nv) / 9) ** 2)) * this.cab.steer * this.trailer.steerPenalty * loadPen;
    const rate = 1.6 * clamp(Math.sqrt(12000 / m), 0.5, 1.2);
    const target = inp.steer * maxSteer;
    this.steer += clamp(target - this.steer, -rate * dt, rate * dt);
    let tan = Math.tan(this.steer);
    if (Math.abs(nv) > 1) {
      const tanMax = (mu * G * 0.5 * WHEELBASE) / (nv * nv);
      tan = clamp(tan, -tanMax, tanMax);
    }
    const dh = (nv / WHEELBASE) * tan * dt;
    this.h = wrap(this.h + dh);
    this.lat = nv * (dh / dt);

    this.x += Math.sin(this.h) * nv * dt;
    this.z += Math.cos(this.h) * nv * dt;

    // remorque : suit le tracteur, instable en marche arrière
    this.th = wrap(this.th + ((nv / this.trailer.axleDist) * Math.sin(this.h - this.th) * this.trailer.sway) * dt);
    const rel = wrap(this.h - this.th);
    if (Math.abs(rel) > 1.5) this.th = wrap(this.h - Math.sign(rel) * 1.5);

    // carburant (L) : conso/100 km selon masse et vitesse
    const kmh = Math.abs(nv) * 3.6;
    const dist = Math.abs(nv) * dt;
    const per100 = consumption(m, kmh);
    this.fuel = Math.max(0, this.fuel - ((per100 * dist) / 100000 + (2 / 3600) * dt) * this.scale);
    this.odo += dist * this.scale;

    // boîte auto 8 rapports
    const step = (MAX_SPEED + 2) / 8;
    this.gear = Math.abs(nv) < 0.3 ? 0 : nv < 0 ? -1 : Math.min(8, Math.floor(Math.abs(nv) / step) + 1);
    this.rpm = this.gear === 0 ? 0 : 0.2 + 0.8 * ((Math.abs(nv) % step) / step) * (0.6 + 0.4 * thr) + 0.1 * thr;
    this.wheelAngle += (nv / 0.5) * dt;
  }
}
