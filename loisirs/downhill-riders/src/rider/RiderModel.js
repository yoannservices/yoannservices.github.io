/* Pilote en primitives : bassin, torse, tête avec casque (ouvert, intégral, dirt), bras et jambes en cônes, gants, chaussures.
   Les membres sont dessinés à partir de 11 points (hanche, poitrine, tête, genoux, pieds, coudes, mains) :
   la pose normale les calcule par cinématique inverse sur le vélo, le ragdoll les calcule par physique. */
import * as THREE from 'three';
import { clamp, lerp } from '../core/rng.js';

const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
const Y = V(0, 1, 0);
const NAMES = ['hip', 'chest', 'head', 'kneeL', 'kneeR', 'footL', 'footR', 'elbowL', 'elbowR', 'handL', 'handR'];
export const LEN = { thigh: 0.43, shin: 0.43, upper: 0.29, fore: 0.28, torso: 0.45, neck: 0.27 };
const std = (c, r = 0.7, m = 0.05) => new THREE.MeshStandardMaterial({ color: c, roughness: r, metalness: m });
const _d = V(), _p = V(), _q = new THREE.Quaternion();

/* cinématique inverse à deux os : renvoie le coude/genou, et ramène la cible à portée */
export function ik(a, target, l1, l2, pole, outJoint, outEnd) {
  _d.subVectors(target, a); let L = _d.length(); const max = l1 + l2 - 0.002;
  if (L > max) { _d.multiplyScalar(max / L); L = max; }
  if (L < 0.12) { _d.setLength(0.12); L = 0.12; }
  const x = (L * L + l1 * l1 - l2 * l2) / (2 * L), h = Math.sqrt(Math.max(0, l1 * l1 - x * x)), dn = _p.copy(_d).normalize();
  const pv = pole.clone().addScaledVector(dn, -pole.dot(dn)).normalize();
  outJoint.copy(a).addScaledVector(dn, x).addScaledVector(pv, h); outEnd.copy(a).add(_d);
}

export class RiderModel {
  constructor(outfit, helmet) {
    this.group = new THREE.Group(); this.P = {}; NAMES.forEach((n) => { this.P[n] = V(); });
    const top = std(outfit.top, 0.8), pants = std(outfit.pants, 0.85), glove = std(outfit.glove, 0.6), shoe = std(outfit.shoe, 0.7), skin = std(0xe0b090, 0.8), black = std(0x15161a, 0.5, 0.2);
    this.mats = { top, pants, glove, shoe, skin };
    const cyl = (mat, rt, rb) => { const m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, 1, 10), mat); m.castShadow = true; this.group.add(m); return m; };
    const ball = (mat, r) => { const m = new THREE.Mesh(new THREE.SphereGeometry(r, 12, 10), mat); m.castShadow = true; this.group.add(m); return m; };
    this.limb = {
      thighL: cyl(pants, 0.075, 0.06), thighR: cyl(pants, 0.075, 0.06), shinL: cyl(pants, 0.058, 0.048), shinR: cyl(pants, 0.058, 0.048),
      upperL: cyl(top, 0.052, 0.045), upperR: cyl(top, 0.052, 0.045), foreL: cyl(top, 0.045, 0.036), foreR: cyl(top, 0.045, 0.036), torso: cyl(top, 0.15, 0.13), neck: cyl(skin, 0.04, 0.045),
    };
    this.joint = { kneeL: ball(pants, 0.062), kneeR: ball(pants, 0.062), elbowL: ball(top, 0.048), elbowR: ball(top, 0.048), hip: ball(pants, 0.13), shoulderL: ball(top, 0.062), shoulderR: ball(top, 0.062), chest: ball(top, 0.155) };
    this.hands = [ball(glove, 0.05), ball(glove, 0.05)]; this.feet = [ball(shoe, 0.07), ball(shoe, 0.07)]; this.feet.forEach((f) => f.scale.set(0.85, 0.62, 1.7));
    this.head = new THREE.Group(); this.group.add(this.head); const hd = new THREE.Mesh(new THREE.SphereGeometry(0.1, 14, 12), skin); this.head.add(hd); this.faceHead = hd;
    this._helmet(helmet, black);
    const pack = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.3, 0.12), std(0x2a2d33, 0.8)); pack.position.set(0, 0.05, 0.12); pack.castShadow = true; this.pack = pack; this.group.add(pack);
    this.shoulderW = 0.2;
  }

  _helmet(h, black) {
    const hm = std(h.col, 0.35, 0.2), g = new THREE.Group(); this.helmet = g; this.head.add(g);
    const shell = new THREE.Mesh(new THREE.SphereGeometry(0.125, 16, 12, 0, Math.PI * 2, 0, h.type === 'full' ? Math.PI * 0.82 : Math.PI * 0.55), hm); shell.position.y = 0.01; shell.castShadow = true; g.add(shell);
    if (h.type === 'full') {
      const chin = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.09, 0.1), hm); chin.position.set(0, -0.07, -0.085); g.add(chin);
      const visor = new THREE.Mesh(new THREE.BoxGeometry(0.17, 0.05, 0.05), std(0x0c1018, 0.1, 0.6)); visor.position.set(0, 0.01, -0.105); g.add(visor);
    }
    if (h.type !== 'full') { const peak = new THREE.Mesh(new THREE.BoxGeometry(0.17, 0.012, 0.09), hm); peak.position.set(0, 0.035, -0.12); peak.rotation.x = -0.15; g.add(peak); }
    const goggle = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.05, 0.03), black); goggle.position.set(0, 0.0, -0.1); if (h.type !== 'full') g.add(goggle);
  }

  setLimb(m, a, b, r) {
    _d.subVectors(b, a); const len = _d.length(); m.position.copy(a).addScaledVector(_d, 0.5); m.scale.set(r, Math.max(len, 1e-3), r); m.quaternion.setFromUnitVectors(Y, _d.normalize());
  }

  /* dessine le corps à partir des 11 points (repère du groupe) */
  draw(lookDir) {
    const P = this.P, L = this.limb, J = this.joint, side = this.shoulderW;
    // épaules : à gauche / droite de la poitrine (axe latéral = perpendiculaire à l'axe torse et à la direction du regard)
    const up = _d.subVectors(P.chest, P.hip).normalize(), fwd = lookDir || V(0, 0, -1), lat = V().crossVectors(fwd, up).normalize(); if (lat.lengthSq() < 0.5) lat.set(1, 0, 0);
    const shL = P.chest.clone().addScaledVector(lat, -side).addScaledVector(up, -0.04), shR = P.chest.clone().addScaledVector(lat, side).addScaledVector(up, -0.04);
    this.shL = shL; this.shR = shR;
    this.setLimb(L.torso, P.hip, P.chest, 0.14); J.hip.position.copy(P.hip); J.chest.position.copy(P.chest); J.shoulderL.position.copy(shL); J.shoulderR.position.copy(shR);
    this.setLimb(L.neck, P.chest, P.head, 0.06);
    const hipL = P.hip.clone().addScaledVector(lat, -0.08), hipR = P.hip.clone().addScaledVector(lat, 0.08);
    this.setLimb(L.thighL, hipL, P.kneeL, 1); this.setLimb(L.thighR, hipR, P.kneeR, 1);
    this.setLimb(L.shinL, P.kneeL, P.footL, 1); this.setLimb(L.shinR, P.kneeR, P.footR, 1);
    this.setLimb(L.upperL, shL, P.elbowL, 1); this.setLimb(L.upperR, shR, P.elbowR, 1);
    this.setLimb(L.foreL, P.elbowL, P.handL, 1); this.setLimb(L.foreR, P.elbowR, P.handR, 1);
    J.kneeL.position.copy(P.kneeL); J.kneeR.position.copy(P.kneeR); J.elbowL.position.copy(P.elbowL); J.elbowR.position.copy(P.elbowR);
    this.hands[0].position.copy(P.handL); this.hands[1].position.copy(P.handR); this.feet[0].position.copy(P.footL).add(V(0, -0.02, -0.04)); this.feet[1].position.copy(P.footR).add(V(0, -0.02, -0.04));
    this.head.position.copy(P.head).addScaledVector(up, 0.06);
    _q.setFromUnitVectors(V(0, 0, -1), fwd.clone().normalize()); this.head.quaternion.copy(_q);
    this.pack.position.copy(P.chest).addScaledVector(up, -0.12).addScaledVector(fwd, 0.14); this.pack.quaternion.setFromUnitVectors(Y, up);
  }

  /* pose sur le vélo. p : { stand 0..1, lean (avant) rad, hands 0..1 (mains lâchées), legs 0..1 (superman), kneeOut } */
  pose(bike, p) {
    const P = this.P, S = bike.anchor('saddle', V()), gL = bike.anchor('gripL', V()), gR = bike.anchor('gripR', V()), pL = bike.anchor('pedalL', V()), pR = bike.anchor('pedalR', V());
    const stand = clamp(p.stand, 0, 1);
    P.hip.set(S.x, S.y + lerp(0.03, 0.2, stand) - p.crouch * 0.1, S.z + lerp(0.0, 0.1, stand) + (p.back || 0));
    const a = p.lean + p.leanExtra, tz = -Math.sin(a), ty = Math.cos(a);
    P.chest.copy(P.hip).add(V(0, ty * LEN.torso, tz * LEN.torso));
    P.head.copy(P.chest).add(V(0, Math.cos(a * 0.55) * LEN.neck, -Math.sin(a * 0.55) * LEN.neck - 0.03));
    // mains : sur les poignées, ou levées quand elles sont lâchées
    const free = (s) => P.chest.clone().add(V(s * 0.42, 0.18, -0.32)), tL = gL.clone().lerp(free(-1), p.hands), tR = gR.clone().lerp(free(1), p.hands);
    // jambes : pieds sur les pédales, ou tendus en arrière (superman)
    const bL = P.hip.clone().add(V(-0.12, -0.02, 0.62)), bR = P.hip.clone().add(V(0.12, -0.02, 0.62));
    const fL = pL.clone().add(V(0, 0.04, 0)).lerp(bL, p.legs), fR = pR.clone().add(V(0, 0.04, 0)).lerp(bR, p.legs);
    const hipL = P.hip.clone().add(V(-0.08, 0, 0)), hipR = P.hip.clone().add(V(0.08, 0, 0));
    const pole = V(0, 0.15, -1), shL = P.chest.clone().add(V(-this.shoulderW, -0.04, 0)), shR = P.chest.clone().add(V(this.shoulderW, -0.04, 0));
    ik(hipL, fL, LEN.thigh, LEN.shin, pole.clone().add(V(-0.35, 0, 0)), P.kneeL, P.footL); ik(hipR, fR, LEN.thigh, LEN.shin, pole.clone().add(V(0.35, 0, 0)), P.kneeR, P.footR);
    ik(shL, tL, LEN.upper, LEN.fore, V(-0.6, -0.8, 0.3), P.elbowL, P.handL); ik(shR, tR, LEN.upper, LEN.fore, V(0.6, -0.8, 0.3), P.elbowR, P.handR);
    this.draw(V(0, -Math.sin(a * 0.4) * 0.3, -1).normalize());
  }

  /* masque les parties visibles de près en vue casque */
  setFirstPerson(on) { this.head.visible = !on; this.limb.neck.visible = !on; this.pack.visible = !on; }
}
