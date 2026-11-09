// Engins : caractéristiques et physique (sans Three.js, testable avec Node). Repère : avant = +Z, gauche = +X, cap h : avant = (sin h, cos h).
// Commandes ctl : drive (-1 recule .. 1 avance), steer (>0 vers la gauche), brake, hand, t1..t4 (outils, -1..1).
import { boxCollider, deepestContact, vehicleBox } from '../collision.js';
export const FUEL_SCALE = 8;   // 1 h de moteur = 8 h de réservoir : une session reste jouable
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const approach = (v, t, d) => (v < t ? Math.min(t, v + d) : Math.max(t, v - d));

export const SPECS = {
  loader: { id: 'loader', name: 'Chargeuse sur pneus', short: 'Chargeuse', key: 1, type: 'wheel', L: 8.2, W: 3.0, wb: 3.4, max: 11, accel: 2.4, steer: 0.5, cap: 3.5, fuel: 320, burn: 24 },
  excavator: { id: 'excavator', name: 'Pelle hydraulique 30 t', short: 'Pelle', key: 2, type: 'tracked', L: 9.4, W: 3.4, ln: 4.6, max: 2.3, accel: 1.2, turn: 0.55, cap: 2.0, fuel: 420, burn: 28 },
  dumper: { id: 'dumper', name: 'Tombereau rigide 45 t', short: 'Tombereau', key: 3, type: 'wheel', L: 10.2, W: 3.7, wb: 4.8, max: 14, accel: 1.7, steer: 0.42, cap: 20, fuel: 520, burn: 42, bed: { x: 1.65, z0: -4.9, z1: 0.6 } },
  dozer: { id: 'dozer', name: 'Bouteur D8', short: 'Bouteur', key: 4, type: 'tracked', L: 7.4, W: 3.9, ln: 3.8, max: 3.6, accel: 1.8, turn: 0.75, cap: 0, fuel: 380, burn: 26 },
  truck: { id: 'truck', name: 'Camion benne 8x4', short: 'Camion benne', key: 5, type: 'wheel', L: 9.8, W: 2.55, wb: 5.4, max: 20, accel: 1.5, steer: 0.5, cap: 14, fuel: 400, burn: 20, bed: { x: 1.15, z0: -4.9, z1: 0.8 } },
};
const TOOLS = {
  loader: { arm: 0.12, tilt: 0.6 }, excavator: { swing: 0, boom: 0.5, stick: 1.3, bucket: 0.9 },
  dozer: { blade: 0.7 }, dumper: { bed: 0 }, truck: { bed: 0 },
};
export const EXC = { boomMin: -0.1, boomMax: 1.2, stickMin: 0.5, stickMax: 2.8, bucketMin: -0.3, bucketMax: 1.8 };

export class Machine {
  constructor(spec, x, z, heading = 0) {
    this.s = spec; this.id = spec.id;
    this.x = x; this.z = z; this.h = heading; this.speed = 0; this.steerA = 0; this.y = 0; this.pitch = 0; this.roll = 0;
    this.fuel = spec.fuel; this.damage = 0; this.cargo = { vol: 0, g: 0 };
    this.tool = { ...TOOLS[spec.id] }; this.toolSpeed = 0;
    this.lights = false; this.beacon = false; this.ai = false; this.dead = '';
    this.impact = 0; this.thr = 0; this.moveDist = 0;
    this.hl = (spec.ln ?? spec.L) / 2 * 0.92; this.hw = spec.W / 2 * 0.95;
  }
  capacity(mods = {}) { return this.s.cap * (this.s.id === 'loader' || this.s.id === 'excavator' ? (mods.bucket ?? 1) : 1); }
  fuelMax(mods = {}) { return this.s.fuel * (mods.tank ?? 1); }
  get running() { return !this.dead && this.fuel > 0 && this.damage < 1; }
  collider() { return boxCollider(this.x, this.z, this.hw, this.hl, -this.h); }

  // Cargo (benne ou godet) : ajoute vol de matière (g = part de gravier). Renvoie ce qui est accepté.
  load(vol, g, mods) {
    const room = this.capacity(mods) - this.cargo.vol, ok = Math.max(0, Math.min(vol, room));
    if (ok <= 0) return 0;
    this.cargo.g = (this.cargo.g * this.cargo.vol + g * ok) / (this.cargo.vol + ok); this.cargo.vol += ok; return ok;
  }
  unload(vol) { const v = Math.min(vol, this.cargo.vol); this.cargo.vol -= v; if (this.cargo.vol < 1e-4) { this.cargo.vol = 0; this.cargo.g = 0; } return v; }

  update(dt, ctl, world, mods = {}) {
    const s = this.s, T = this.tool, ter = world.terrain;
    const run = this.running ? 1 : 0;
    const power = run * (1 - 0.5 * this.damage) * (mods.speed ?? 1);
    const drive = run ? clamp(ctl.drive, -1, 1) : 0;
    // outils
    if (s.id === 'loader') { T.arm = clamp(T.arm + ctl.t1 * 0.55 * run * dt, 0, 1); T.tilt = clamp(T.tilt + ctl.t2 * 0.7 * run * dt, 0, 1); }
    else if (s.id === 'excavator') {
      T.swing += ctl.t1 * 0.75 * dt * run; T.swing = Math.atan2(Math.sin(T.swing), Math.cos(T.swing));
      T.boom = clamp(T.boom + ctl.t2 * 0.55 * dt * run, EXC.boomMin, EXC.boomMax);
      T.stick = clamp(T.stick - ctl.t3 * 0.8 * dt * run, EXC.stickMin, EXC.stickMax);
      T.bucket = clamp(T.bucket + ctl.t4 * 1.1 * dt * run, EXC.bucketMin, EXC.bucketMax);
    } else if (s.id === 'dozer') T.blade = clamp(T.blade + ctl.t1 * 0.55 * run * dt, 0, 1);
    else T.bed = clamp(T.bed + ctl.t1 * 0.22 * dt * run, 0, 1);
    this.toolSpeed = Math.abs(ctl.t1) + Math.abs(ctl.t2 ?? 0) + Math.abs(ctl.t3 ?? 0) + Math.abs(ctl.t4 ?? 0);

    // pente sous l'engin
    const fx = Math.sin(this.h), fz = Math.cos(this.h), sx = fz, sz = -fx;
    const hl = s.L * 0.34, hw = s.W * 0.4;
    const h1 = ter.height(this.x + fx * hl + sx * hw, this.z + fz * hl + sz * hw), h2 = ter.height(this.x + fx * hl - sx * hw, this.z + fz * hl - sz * hw);
    const h3 = ter.height(this.x - fx * hl + sx * hw, this.z - fz * hl + sz * hw), h4 = ter.height(this.x - fx * hl - sx * hw, this.z - fz * hl - sz * hw);
    const slope = ((h1 + h2) - (h3 + h4)) / 2 / (2 * hl);          // > 0 : on monte
    const fill = s.cap ? this.cargo.vol / this.capacity(mods) : 0;
    const heavy = s.id === 'dumper' || s.id === 'truck' ? 1 : 0.3;
    const vmax = s.max * power * (1 - 0.2 * fill * heavy);
    const target = drive * (drive > 0 ? vmax : vmax * 0.5);
    const braking = drive * this.speed < -0.05 || ctl.brake > 0.5;
    let a = clamp((target - this.speed) * (braking ? 3.5 : 1.1), -s.accel * 2.6, s.accel * (1.1 - 0.4 * fill));
    if (drive === 0 && ctl.brake <= 0) a = clamp(-this.speed * 0.9, -2.2, 2.2);   // frein moteur
    a -= 9.81 * slope * 0.55;
    if (ctl.hand) a = clamp(-this.speed * 6, -9, 9);
    this.speed += a * dt;
    this.speed = clamp(this.speed, -Math.max(vmax * 0.5, 0.4), Math.max(vmax, 0.4));
    if (Math.abs(this.speed) < 0.03 && drive === 0) this.speed = 0;
    this.thr = Math.abs(drive) * run;
    // direction
    if (s.type === 'wheel') {
      const lim = s.steer / (1 + Math.abs(this.speed) * 0.12);
      this.steerA = approach(this.steerA, clamp(ctl.steer, -1, 1) * lim * run, dt * 1.6);
      this.h += this.speed * Math.tan(this.steerA) / s.wb * dt;
    } else {
      this.steerA = approach(this.steerA, clamp(ctl.steer, -1, 1) * run, dt * 3);
      this.h += this.steerA * s.turn * (drive !== 0 ? 0.8 : 1) * dt * (1 - 0.3 * this.damage);
    }
    this.h = Math.atan2(Math.sin(this.h), Math.cos(this.h));
    // déplacement + pente impraticable
    const ox = this.x, oz = this.z, dir = this.speed >= 0 ? 1 : -1;
    this.x += Math.sin(this.h) * this.speed * dt; this.z += Math.cos(this.h) * this.speed * dt;
    const px = this.x + Math.sin(this.h) * dir * (this.hl + 0.4), pz = this.z + Math.cos(this.h) * dir * (this.hl + 0.4);
    const ground = ter.height(this.x, this.z);
    const maxSlope = s.id === 'dozer' && T.blade < 0.55 && this.speed > 0 ? 0.45 : 0.9;   // lame basse : on pousse le tas, on ne le grimpe pas
    if ((ter.height(px, pz) - ground) / (this.hl + 0.4) > maxSlope && Math.abs(this.speed) > 0.05) { this.x = ox; this.z = oz; this.speed = 0; }
    this.x = clamp(this.x, -76, 76); this.z = clamp(this.z, -76, 76);
    // collisions (décors + autres engins)
    this.impact = 0;
    for (let it = 0; it < 4; it++) {
      const c = deepestContact(vehicleBox(this.x, this.z, this.h, this.hl, this.hw), world.obstacles(this));
      if (!c) break;
      this.x += c.nx * (c.depth + 0.005); this.z += c.nz * (c.depth + 0.005);
      const fd = Math.sin(this.h) * c.nx + Math.cos(this.h) * c.nz;
      if (this.speed * fd < 0) { this.impact = Math.max(this.impact, Math.abs(this.speed * fd)); this.speed *= 1 - fd * fd; }
    }
    if (this.impact > 2.5) this.damage = clamp(this.damage + (this.impact - 2.5) * 0.012 * (mods.tires ?? 1), 0, 1);
    this.moveDist += Math.abs(this.speed) * dt;
    // hauteur et assiette
    const gy = ter.height(this.x, this.z), ty = (gy + (h1 + h2 + h3 + h4) / 4) / 2;
    this.y += (ty - this.y) * Math.min(1, dt * 12);
    this.pitch += (-Math.atan2((h1 + h2) / 2 - (h3 + h4) / 2, 2 * hl) - this.pitch) * Math.min(1, dt * 8);
    this.roll += (Math.atan2((h1 + h3) / 2 - (h2 + h4) / 2, 2 * hw) - this.roll) * Math.min(1, dt * 8);
    // carburant
    if (this.running) {
      const load = 0.25 + 0.5 * this.thr + 0.25 * Math.min(1, this.toolSpeed);
      this.fuel = Math.max(0, this.fuel - s.burn * FUEL_SCALE * load * dt / 3600);
    }
    return this;
  }
  snapshot() { return { id: this.id, x: this.x, z: this.z, h: this.h, fuel: this.fuel, damage: this.damage, cargo: this.cargo, tool: this.tool }; }
  restore(d) { if (!d) return; Object.assign(this, { x: d.x, z: d.z, h: d.h, fuel: d.fuel, damage: d.damage }); this.cargo = { ...this.cargo, ...d.cargo }; Object.assign(this.tool, d.tool); }
}
