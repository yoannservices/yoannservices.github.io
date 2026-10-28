/* Ragdoll simplifié : 11 points en intégration de Verlet, contraintes de longueur, collision avec le terrain.
   Les points initiaux viennent de la pose du pilote au moment du crash. */
import * as THREE from 'three';
import { G } from '../core/config.js';
import { LEN } from './RiderModel.js';

const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
const NAMES = ['hip', 'chest', 'head', 'kneeL', 'kneeR', 'footL', 'footR', 'elbowL', 'elbowR', 'handL', 'handR'];
const LINKS = [
  ['hip', 'chest', LEN.torso], ['chest', 'head', LEN.neck + 0.05], ['hip', 'kneeL', LEN.thigh], ['kneeL', 'footL', LEN.shin], ['hip', 'kneeR', LEN.thigh], ['kneeR', 'footR', LEN.shin],
  ['chest', 'elbowL', LEN.upper], ['elbowL', 'handL', LEN.fore], ['chest', 'elbowR', LEN.upper], ['elbowR', 'handR', LEN.fore],
  ['kneeL', 'kneeR', 0.2], ['elbowL', 'elbowR', 0.4], ['hip', 'head', 0.7], ['chest', 'kneeL', 0.55], ['chest', 'kneeR', 0.55], ['hip', 'elbowL', 0.5], ['hip', 'elbowR', 0.5],
];

export class Ragdoll {
  constructor(track) { this.track = track; this.pts = {}; this.prev = {}; NAMES.forEach((n) => { this.pts[n] = V(); this.prev[n] = V(); }); this.active = false; this.t = 0; }
  /* start : points du pilote (repère monde), vel : vitesse du vélo */
  start(worldPts, vel) {
    NAMES.forEach((n) => {
      this.pts[n].copy(worldPts[n]);
      // le haut du corps part plus vite (projection par-dessus le guidon), avec un peu de chaos
      const k = n === 'head' || n === 'chest' || n.startsWith('hand') || n.startsWith('elbow') ? 1.1 : 0.9;
      this.prev[n].copy(worldPts[n]).addScaledVector(vel, -k / 60).add(V((Math.random() - 0.5) * 0.04, (Math.random() - 0.3) * 0.03, (Math.random() - 0.5) * 0.04));
    });
    this.active = true; this.t = 0;
  }
  step(dt) {
    if (!this.active) return; this.t += dt;
    const T = this.track, g = G * dt * dt;
    for (const n of NAMES) {
      const p = this.pts[n], q = this.prev[n], vx = (p.x - q.x) * 0.995, vy = (p.y - q.y) * 0.995, vz = (p.z - q.z) * 0.995;
      q.copy(p); p.x += vx; p.y += vy - g; p.z += vz;
    }
    for (let it = 0; it < 5; it++) {
      for (const [a, b, len] of LINKS) {
        const pa = this.pts[a], pb = this.pts[b], d = pb.clone().sub(pa), l = d.length() || 1e-4, k = (l - len) / l * 0.5;
        pa.addScaledVector(d, k); pb.addScaledVector(d, -k);
      }
      for (const n of NAMES) { const p = this.pts[n], h = T.height(p.x, p.z) + (n === 'head' ? 0.11 : 0.06); if (p.y < h) { p.y = h; const q = this.prev[n]; q.x += (p.x - q.x) * 0.25; q.z += (p.z - q.z) * 0.25; q.y = p.y + (p.y - q.y) * -0.15 + 0.0; } }
    }
  }
  /* vitesse moyenne du corps (m/s) : pour savoir quand il est immobile */
  get speed() { const h = this.pts.hip, p = this.prev.hip; return h.distanceTo(p) * 60; }
}
