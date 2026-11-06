/* Voiture arcade, sans dépendance à Three.js (testable en Node). Modèle « bicyclette » autour de l'essieu arrière : la voiture
   pivote comme une vraie voiture en créneau, mais sans dérapage. Cap yaw : l'avant pointe vers (sin yaw, cos yaw) ; steer > 0 = gauche.
   Vitesse en m/s, positive en marche avant. */
import { clamp, smooth } from '../core/util.js';

export const VMAX = 11;        // m/s en avant (≈ 40 km/h) : un parking ne demande pas plus
export const VMAX_REV = 4.2;   // m/s en marche arrière (≈ 15 km/h)

export class CarPhysics {
  /* dim : { length, width, wheelbase, rearBehind } ; rearBehind = distance entre l'essieu arrière et le centre de la caisse. */
  constructor(dim) {
    this.d = dim;
    this.place(0, 0, 0);
  }

  place(x, z, yaw) {
    const d = this.d;
    this.yaw = yaw;
    this.rx = x - Math.sin(yaw) * d.rearBehind; // essieu arrière
    this.rz = z - Math.cos(yaw) * d.rearBehind;
    this.v = 0; this.steer = 0; this.acc = 0; this.yawRate = 0;
  }

  get x() { return this.rx + Math.sin(this.yaw) * this.d.rearBehind; }
  get z() { return this.rz + Math.cos(this.yaw) * this.d.rearBehind; }

  step(dt, inp) {
    const n = Math.max(1, Math.ceil(dt * 120)), h = dt / n;
    for (let i = 0; i < n; i++) this.sub(h, inp);
  }

  sub(dt, inp) {
    const v0 = this.v;
    let v = v0;
    const thr = clamp(inp.throttle, 0, 1), brk = clamp(inp.brake, 0, 1);
    if (inp.hand) v = approach(v, 0, 7.5 * dt);
    else if (thr > 0 && brk === 0) {
      if (v < -0.25) v = approach(v, 0, 9 * dt);                       // on freine d'abord, puis on repart
      else v += 3.6 * thr * (1 - clamp(Math.max(v, 0) / VMAX, 0, 1) ** 1.5) * dt + (v < 0.4 ? 0.9 * thr * dt : 0);
    } else if (brk > 0) {
      if (v > 0.25) v = approach(v, 0, 9.5 * brk * dt);
      else v -= 2.8 * brk * (1 - clamp(-v / VMAX_REV, 0, 1) ** 1.5) * dt - (v > -0.4 ? 0.8 * brk * dt : 0);
    } else {
      v = approach(v, 0, (Math.abs(v) < 1.5 ? 2.4 : 1.4) * dt);          // frein moteur : on s'arrête sans traîner
    }
    this.v = clamp(v, -VMAX_REV, VMAX);

    // direction : braquage maxi décroissant avec la vitesse, lissage exponentiel pour rester fluide
    const max = 0.62 - 0.4 * smooth(0, 10, Math.abs(this.v));
    const target = inp.steer * max;
    this.steer += (target - this.steer) * (1 - Math.exp(-(inp.steer ? 7 : 9) * dt));

    const L = this.d.wheelbase;
    this.yawRate = this.v * Math.tan(this.steer) / L;
    this.yaw += this.yawRate * dt;
    this.rx += Math.sin(this.yaw) * this.v * dt;
    this.rz += Math.cos(this.yaw) * this.v * dt;
    this.acc += ((this.v - v0) / dt - this.acc) * Math.min(1, 6 * dt);   // accélération lissée (tangage de la caisse)
  }

  /* Repousse la voiture hors d'un obstacle (normale n de l'obstacle vers la voiture) et retire la vitesse qui allait dedans. */
  push(nx, nz, depth) {
    this.rx += nx * depth; this.rz += nz * depth;
    const fn = Math.sin(this.yaw) * nx + Math.cos(this.yaw) * nz;
    if (this.v * fn < 0) this.v *= 1 - fn * fn;
  }
}

function approach(v, target, step) {
  return v < target ? Math.min(v + step, target) : Math.max(v - step, target);
}
