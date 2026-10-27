import { G, clamp } from '../core/config.js';

export const KL = 0.0042;
// Décollage en wingsuit depuis le sol ou depuis un saut
export function enterWing(p) {
  const v = p.vel, hs = Math.hypot(v.x, v.z);
  if (hs < 18) { v.x = Math.sin(p.heading) * 18; v.z = Math.cos(p.heading) * 18; } else p.heading = Math.atan2(v.x, v.z);
  if (p.grounded) { v.y = Math.max(v.y, 4); p.pos.y += 0.5; }
  p.mode = 'wing'; p.disc = 'wingsuit'; p.grounded = false;
  p.wing.alpha = 0.17; p.wing.pitch = 0; p.wing.roll = 0; p.spin = p.flip = 0;
}

// Vol plané : portance/traînée selon l'angle d'attaque, virage par inclinaison
export function wingStep(p, inp, dt, suit) {
  const w = p.wing, v = p.vel;
  const s = Math.max(v.length(), 1);
  // le manche commande l'angle d'attaque : Z pique (vitesse), S cabre (finesse puis décrochage)
  w.alpha = clamp(w.alpha - inp.y * 0.55 * dt + (inp.y ? 0 : (0.17 - w.alpha) * 0.5 * dt), 0.04, 0.5);
  w.roll += (inp.x * 0.95 - w.roll) * Math.min(1, 3 * dt);
  p.heading -= Math.sin(w.roll) * 1.3 * suit.turn * dt;
  // la vitesse horizontale suit le cap (virage coordonné)
  const hs = Math.hypot(v.x, v.z), k = Math.min(1, 2.5 * dt);
  v.x += (Math.sin(p.heading) * hs - v.x) * k; v.z += (Math.cos(p.heading) * hs - v.z) * k;
  const gamma = Math.asin(clamp(v.y / s, -1, 1)), alpha = w.alpha, aa = Math.abs(alpha);
  w.pitch = gamma + alpha;
  const cl = Math.sign(alpha) * (aa < 0.3 ? 5.2 * aa : Math.max(0.5, 1.56 - 2.5 * (aa - 0.3))) * suit.lift;
  const cd = (0.38 + 3.2 * alpha * alpha) * suit.drag;
  const vx = v.x / s, vy = v.y / s, vz = v.z / s;
  let lx = -vx * vy, ly = 1 - vy * vy, lz = -vz * vy;
  const lm = Math.hypot(lx, ly, lz) || 1; lx /= lm; ly /= lm; lz /= lm;
  const q = KL * s * s;
  v.x += (lx * cl - vx * cd) * q * dt;
  v.y += ((ly * cl - vy * cd) * q - G) * dt;
  v.z += (lz * cl - vz * cd) * q * dt;
  p.pos.addScaledVector(v, dt);
}

export function chuteStep(p, inp, dt) {
  const v = p.vel;
  p.heading -= inp.x * 0.9 * dt;
  const k = Math.min(1, 1.6 * dt);
  v.x += (Math.sin(p.heading) * 8 - v.x) * k; v.z += (Math.cos(p.heading) * 8 - v.z) * k; v.y += (-5.5 - v.y) * k;
  p.pos.addScaledVector(v, dt);
}
