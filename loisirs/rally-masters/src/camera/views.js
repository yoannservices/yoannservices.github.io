/* Caméras : 0 poursuite (3e personne), 1 capot, 2 pare-chocs, 3 cabine. Touche C pour passer à la suivante. */
import * as THREE from 'three';
import { clamp, lerp } from '../core/util.js';

export const VIEWS = ['Poursuite', 'Capot', 'Pare-chocs', 'Cabine'];
const _p = new THREE.Vector3(), _q = new THREE.Quaternion(), _e = new THREE.Euler(), _t = new THREE.Vector3();

export class CameraRig {
  constructor(camera) { this.cam = camera; this.mode = 0; this.pos = new THREE.Vector3(); this.look = new THREE.Vector3(); this.heading = 0; this.fov = 62; this.shake = 0; this.init = false; }
  set(mode, model) { this.mode = ((mode % 4) + 4) % 4; this.init = false; if (model) model.setView(this.mode); }
  next(model) { this.set(this.mode + 1, model); return VIEWS[this.mode]; }

  update(dt, ph, model, t) {
    const cam = this.cam, m = this.mode;
    if (m === 0) {
      // poursuite basse : suit le cap de la voiture avec un léger retard, recule et s'élargit avec la vitesse
      const vh = ph.speed > 4 ? Math.atan2(ph.u * Math.sin(ph.yaw) + ph.v * Math.cos(ph.yaw), ph.u * Math.cos(ph.yaw) - ph.v * Math.sin(ph.yaw)) : ph.yaw;
      let tgt = ph.yaw * 0.6 + (ph.u >= 0 ? vh : ph.yaw) * 0.4;
      let dh = tgt - this.heading; dh = Math.atan2(Math.sin(dh), Math.cos(dh));
      this.heading = this.init ? this.heading + dh * Math.min(1, dt * 4.5) : tgt;
      const dist = 5.6 + ph.speed * 0.04, h = 1.7 + ph.speed * 0.006;
      _p.set(ph.x - Math.sin(this.heading) * dist, ph.y + h, ph.z - Math.cos(this.heading) * dist);
      if (!this.init) { this.pos.copy(_p); this.init = true; } else this.pos.lerp(_p, 1 - Math.exp(-dt * 12));
      cam.position.copy(this.pos);
      this.look.set(ph.x + Math.sin(this.heading) * 4, ph.y + 1.0, ph.z + Math.cos(this.heading) * 4); cam.lookAt(this.look);
      this.fov = lerp(this.fov, 60 + clamp(ph.speed / 40, 0, 1) * 14, Math.min(1, dt * 3));
    } else {
      const name = m === 1 ? 'hood' : m === 2 ? 'bumper' : 'eye', o = model.markers[name];
      o.getWorldPosition(_p); o.getWorldQuaternion(_q);
      // tremblements de la route (surface et vitesse) + secousse d'impact
      const sh = this.shake * Math.sin(t * 60) * 0.03 + (ph.air ? 0 : (m === 3 ? 0.0015 : 0.002) * Math.min(1, ph.speed / 30) * Math.sin(t * 47 + 1.3));
      cam.position.copy(_p); cam.position.y += sh; cam.quaternion.copy(_q);
      // la caméra regarde vers l'avant de la caisse (−Z de la caméra = +Z de la voiture) : on retourne de 180° autour de Y
      _e.set(0, Math.PI, 0); _q.setFromEuler(_e); cam.quaternion.multiply(_q);
      // regard dans le virage en cabine
      if (m === 3) { _e.set(0, ph.steer * 0.5, 0); _q.setFromEuler(_e); cam.quaternion.multiply(_q); }
      this.fov = lerp(this.fov, (m === 3 ? 76 : m === 1 ? 70 : 82) + clamp(ph.speed / 50, 0, 1) * 6, Math.min(1, dt * 3));
    }
    this.shake *= Math.exp(-dt * 6);
    if (Math.abs(cam.fov - this.fov) > 0.05) { cam.fov = this.fov; cam.updateProjectionMatrix(); }
  }
  kick(a) { this.shake = Math.min(1, this.shake + a); }
}
