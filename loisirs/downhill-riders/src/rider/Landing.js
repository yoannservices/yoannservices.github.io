/* Réception : succès ou crash selon l'alignement du vélo sur la pente, la vitesse d'impact et les figures non terminées.
   predictLanding() alimente la jauge de réception du HUD pendant le saut. */
import * as THREE from 'three';
import { G } from '../core/config.js';
import { clamp } from '../core/rng.js';

const _f = new THREE.Vector3(), _u = new THREE.Vector3(), _h = new THREE.Vector3();
const wrapAng = (a) => { a = a % (Math.PI * 2); if (a > Math.PI) a -= Math.PI * 2; if (a < -Math.PI) a += Math.PI * 2; return a; };

/* erreur d'alignement (rad) entre le vélo et la surface de réception */
export function alignError(quat, n, vel, trick) {
  _u.set(0, 1, 0).applyQuaternion(quat); _f.set(0, 0, -1).applyQuaternion(quat);
  const upErr = Math.acos(clamp(_u.dot(n), -1, 1));
  _h.copy(vel).setY(0); // cap contre trajectoire, à plat : indépendant de l'inclinaison de la pente
  let yawErr = 0;
  if (_h.lengthSq() > 4) { _f.setY(0); if (_f.lengthSq() > 1e-4) yawErr = Math.acos(clamp(_f.normalize().dot(_h.normalize()), -1, 1)); }
  const trickErr = trick ? Math.abs(wrapAng(trick.tableA)) * 0.7 + Math.abs(wrapAng(trick.barA)) * 0.25 + Math.abs(trick.whipA) * 0.5 : 0;
  return { upErr, yawErr, trickErr, err: upErr + yawErr * 0.7 + trickErr };
}

/* quality : 'perfect' | 'clean' | 'sketchy' | 'crash' */
export function evaluateLanding(bike, n, vel) {
  const a = alignError(bike.quat, n, vel, bike.air), impact = Math.max(0, -vel.dot(n));
  const absorb = 1 - 0.3 * clamp(1 - bike.susF, 0, 1) - (bike.jumpHeld ? 0.1 : 0); // fourche et amortisseur déjà comprimés encaissent moins
  const impEff = impact * absorb, E = a.err / bike.spec.tol, lim = bike.spec.impact;
  let quality = 'clean';
  if (E > 0.9 || impEff > lim * 1.05) quality = 'crash';
  else if (E > 0.45 || impEff > lim * 0.75) quality = 'sketchy';
  else if (E < 0.16 && impEff < lim * 0.5) quality = 'perfect';
  return { quality, impact: impEff, err: E, ...a };
}

/* trajectoire balistique jusqu'au sol : point d'impact, normale, durée, et qualité estimée avec la rotation en cours */
const _p = new THREE.Vector3(), _v = new THREE.Vector3(), _n = new THREE.Vector3(), _q = new THREE.Quaternion(), _e = new THREE.Quaternion();
export function predictLanding(bike, track) {
  _p.copy(bike.pos); _v.copy(bike.vel);
  let t = 0;
  for (let i = 0; i < 90; i++) {
    _v.y -= G * 0.04; _p.addScaledVector(_v, 0.04); t += 0.04;
    if (_p.y - bike.R < track.height(_p.x, _p.z)) break;
  }
  track.normal(_p.x, _p.z, _n);
  // orientation attendue : rotation actuelle prolongée de t secondes
  _q.copy(bike.quat);
  _e.setFromAxisAngle(_u.set(1, 0, 0), bike.flipW * t); _q.multiply(_e);
  const a = alignError(_q, _n, _v, { tableA: bike.air.tableA, barA: bike.air.barA, whipA: bike.air.whipA });
  const err = a.err / bike.spec.tol;
  return { x: _p.x, y: _p.y, z: _p.z, t, quality: clamp(1 - err / 0.9, 0, 1), err };
}
