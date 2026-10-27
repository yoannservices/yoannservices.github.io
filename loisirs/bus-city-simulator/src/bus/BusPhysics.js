// Modèle bicyclette 2D. Origine = milieu de l'essieu arrière (essieu médian pour l'articulé).
// Cap ψ : avant = (sinψ, cosψ). Braquage > 0 = vers la gauche (ψ croissant).
import { wrapAngle } from '../city/grid.js';

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const sign = (v) => (v < 0 ? -1 : 1);

export class BusPhysics {
  constructor(stats) {
    this.s = stats;
    this.grip = 1;           // 1 sec ; baissé par la pluie
    this.canDrive = true;    // faux : panne / plus d'énergie
    // traînée calibrée pour que la vitesse max soit atteinte à pleine puissance
    this.dragK = (stats.power * 1000 / (stats.mass * stats.maxSpeed)) / stats.maxSpeed ** 2;
    this.maxSteer = Math.atan(stats.wheelbase / stats.turnRadius);
    this.zFront = stats.wheelbase + stats.frontOverhang;
    this.reset(0, 0, 0);
  }

  reset(x, z, heading) {
    this.x = x; this.z = z; this.heading = heading;
    this.vx = 0; this.vz = 0; this.speed = 0;
    this.steer = 0; this.yawRate = 0; this.thr = 0;
    this.accelLong = 0; this.accelLat = 0;
    this.roll = 0; this.rollV = 0; this.pitch = 0; this.pitchV = 0;
    this.heading2 = heading; this.artic = 0;   // unité arrière : cap et angle relatif
  }

  // point de référence pour les arrêts (près de la porte avant)
  refPoint() {
    const d = this.s.wheelbase * 0.9;
    return { x: this.x + Math.sin(this.heading) * d, z: this.z + Math.cos(this.heading) * d };
  }

  update(dt, inp) {
    const s = this.s;
    const fx = Math.sin(this.heading), fz = Math.cos(this.heading);
    const vF = this.vx * fx + this.vz * fz;
    const vL = this.vx * fz - this.vz * fx;

    // --- longitudinal ---
    const want = this.canDrive ? inp.throttle : 0;
    this.thr += (want - this.thr) * Math.min(1, dt * (s.electric ? 1.6 : 6));   // électrique : montée en couple douce
    let a = 0;
    if (this.thr > 0.001) {
      a += vF < -0.5 ? 6 : this.thr * Math.min(s.maxAccel, s.power * 1000 / (s.mass * Math.max(vF, 4)));
    }
    if (inp.brake > 0) {
      a += vF > 0.5 ? -s.brake * inp.brake * this.grip : (vF > -4 && this.canDrive ? -1.8 * inp.brake : 0);
    }
    if (Math.abs(vF) > 0.05) a -= sign(vF) * (this.dragK * vF * vF + (s.electric ? 0.2 : 0.3));   // roulement + frein moteur
    if (inp.handbrake) a -= sign(vF) * 6 * this.grip;
    let nVF = vF + a * dt;
    // frottements seuls ne doivent pas faire repartir le bus en sens inverse
    if (!(this.thr > 0.001) && !inp.brake && vF * nVF < 0) nVF = 0;
    this.accelLong += ((nVF - vF) / dt - this.accelLong) * Math.min(1, dt * 8);

    // --- direction : braquage réduit avec la vitesse, vitesse de rotation du volant limitée ---
    const limit = this.maxSteer / (1 + (Math.abs(nVF) / 10) ** 2);
    const target = inp.steer * limit;
    const rate = (Math.abs(target) < Math.abs(this.steer) ? 2.5 : 1.5) * dt;
    this.steer += clamp(target - this.steer, -rate, rate);
    this.yawRate = nVF / s.wheelbase * Math.tan(this.steer);
    this.heading += this.yawRate * dt;

    // --- adhérence latérale : la vitesse monde est conservée, seule la composante latérale s'amortit ---
    const fx2 = Math.sin(this.heading), fz2 = Math.cos(this.heading);
    const wvx = fx * nVF + fz * vL, wvz = fz * nVF - fx * vL;
    const vF2 = wvx * fx2 + wvz * fz2;
    let vL2 = wvx * fz2 - wvz * fx2;
    vL2 *= Math.exp(-(inp.handbrake ? 1.2 : 8) * this.grip * dt);
    this.vx = fx2 * vF2 + fz2 * vL2;
    this.vz = fz2 * vF2 - fx2 * vL2;
    this.speed = vF2;
    this.x = clamp(this.x + this.vx * dt, -1900, 1900);
    this.z = clamp(this.z + this.vz * dt, -1900, 1900);

    // --- unité arrière de l'articulé : essieu arrière sans dérapage latéral ---
    const A = s.artic;
    if (A) {
      const rx = fx2 * A.hingeZ, rz = fz2 * A.hingeZ;
      const hvx = this.vx + this.yawRate * rz, hvz = this.vz - this.yawRate * rx;
      const n2x = Math.cos(this.heading2), n2z = -Math.sin(this.heading2);
      this.heading2 += ((hvx * n2x + hvz * n2z) / A.axleDist) * dt;
      this.artic = clamp(wrapAngle(this.heading2 - this.heading), -0.85, 0.85);
      this.heading2 = this.heading + this.artic;
    }

    // --- caisse : ressorts amortis sur l'accélération latérale / longitudinale ---
    this.accelLat += (this.yawRate * vF2 - this.accelLat) * Math.min(1, dt * 8);
    const rollT = this.accelLat * s.rollGain;     // > 0 : côté gauche monte, le bus penche vers l'extérieur du virage
    const pitchT = -this.accelLong * 0.008;       // > 0 : nez vers le bas au freinage
    this.rollV += (40 * (rollT - this.roll) - 5 * this.rollV) * dt;
    this.roll += this.rollV * dt;
    this.pitchV += (40 * (pitchT - this.pitch) - 6 * this.pitchV) * dt;
    this.pitch += this.pitchV * dt;
  }

  // cercles de collision monde {x,z,r} le long de la caisse (et de l'unité arrière)
  collisionPoints() {
    const s = this.s, r = s.width / 2 * 0.95, out = [];
    const fx = Math.sin(this.heading), fz = Math.cos(this.heading);
    const along = (z0, z1) => { for (let z = z0 + r; z <= z1 - r + 0.01; z += r * 1.4) out.push({ x: this.x + fx * z, z: this.z + fz * z, r }); };
    if (s.artic) {
      const A = s.artic, u2x = Math.sin(this.heading2), u2z = Math.cos(this.heading2);
      along(A.hingeZ + 0.3, this.zFront);
      const hx = this.x + fx * A.hingeZ, hz = this.z + fz * A.hingeZ;
      for (let d = 0.3 + r; d <= 0.3 + A.rearLen - r + 0.01; d += r * 1.4) out.push({ x: hx - u2x * d, z: hz - u2z * d, r });
    } else along(this.zFront - s.length, this.zFront);
    return out;
  }
}
