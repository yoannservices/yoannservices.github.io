/* Caméras : poursuite, proche, haute. Clic + glisser tourne autour de la voiture ; l'angle revient doucement une fois relâché. */
import * as THREE from 'three';
import { wrapPi } from '../core/util.js';
import { clearFraction } from '../gameplay/collision.js';

export const VIEWS = [
  { name: 'Poursuite', dist: 7.4, h: 2.9, look: 2.2, fov: 62, follow: 3.2 },
  { name: 'Proche', dist: 5.2, h: 1.7, look: 3.2, fov: 66, follow: 4 },
  { name: 'Haute', dist: 9, h: 17, look: 1.5, fov: 55, follow: 1.8 },
];

export class CameraRig {
  constructor(camera, dom) {
    this.cam = camera; this.view = 0; this.heading = 0; this.orbit = 0; this.pitchOff = 0; this.drag = false; this.ready = false;
    dom.addEventListener('pointerdown', (e) => { this.drag = true; dom.setPointerCapture?.(e.pointerId); });
    dom.addEventListener('pointerup', () => { this.drag = false; });
    dom.addEventListener('pointermove', (e) => { if (!this.drag) return; this.orbit -= e.movementX * 0.006; this.pitchOff = Math.max(-0.5, Math.min(1.2, this.pitchOff + e.movementY * 0.005)); });
  }
  next() { this.view = (this.view + 1) % VIEWS.length; return VIEWS[this.view].name; }
  snap() { this.ready = false; }

  /* obstacles : la caméra se rapproche quand un mur ou un arbre passe entre elle et la voiture ; maxY : plafond (parking souterrain) */
  update(dt, ph, carLength, obstacles = [], maxY = Infinity) {
    const v = VIEWS[this.view], cam = this.cam;
    if (!this.ready) { this.heading = ph.yaw; this.ready = true; this.orbit = 0; }
    this.heading += wrapPi(ph.yaw - this.heading) * (1 - Math.exp(-v.follow * dt));
    if (!this.drag) { this.orbit *= Math.exp(-1.8 * dt); this.pitchOff *= Math.exp(-1.8 * dt); }
    const a = this.heading + this.orbit, k = carLength / 4.4, dist = v.dist * (0.85 + 0.15 * k), h = v.h + this.pitchOff * dist * 0.9;
    const bx = ph.x - Math.sin(a) * dist, bz = ph.z - Math.cos(a) * dist, free = clearFraction(ph.x, ph.z, bx, bz, obstacles), f = Math.max(0.12, free);
    this.f = (this.f ?? 1) + (f - (this.f ?? 1)) * Math.min(1, (f < this.f ? 14 : 3) * dt);
    const y = Math.min(maxY, 0.9 + (Math.max(0.6, h) - 0.9) * (0.35 + 0.65 * this.f));
    cam.position.set(ph.x + (bx - ph.x) * this.f, Math.max(0.6, y), ph.z + (bz - ph.z) * this.f);
    cam.lookAt(ph.x + Math.sin(this.heading) * v.look, 0.9, ph.z + Math.cos(this.heading) * v.look);
    if (cam.fov !== v.fov) { cam.fov = v.fov; cam.updateProjectionMatrix(); }
  }
}
