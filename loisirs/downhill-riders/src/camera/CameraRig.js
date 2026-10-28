/* Caméra : 3e personne avec FOV dynamique (vitesse), vue casque, vue éloignée ; orbite à la souris ; secousse à la réception. */
import * as THREE from 'three';
import { clamp, lerp } from '../core/rng.js';

const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
export const CAM_MODES = ['Troisième personne', 'Vue casque', 'Vue éloignée'];

export class CameraRig {
  constructor(camera, canvas) {
    this.camera = camera; this.mode = 0; this.pos = V(); this.look = V(); this.heading = 0; this.shake = 0; this.init = false; this.fov = 62;
    this.orb = { yaw: 0, pitch: 0, drag: false, idle: 0 };
    canvas.addEventListener('pointerdown', (e) => { if (e.button !== 0 || this.mode === 1) return; this.orb.drag = true; this.orb.x = e.clientX; this.orb.y = e.clientY; canvas.setPointerCapture(e.pointerId); });
    canvas.addEventListener('pointermove', (e) => { if (!this.orb.drag) return; this.orb.yaw -= (e.clientX - this.orb.x) * 0.006; this.orb.pitch = clamp(this.orb.pitch + (e.clientY - this.orb.y) * 0.005, -0.3, 1.1); this.orb.x = e.clientX; this.orb.y = e.clientY; this.orb.idle = 0; });
    const end = () => { this.orb.drag = false; this.orb.idle = 0; };
    canvas.addEventListener('pointerup', end); canvas.addEventListener('pointercancel', end);
  }
  cycle() { this.mode = (this.mode + 1) % CAM_MODES.length; this.init = false; return CAM_MODES[this.mode]; }

  /* focus : { pos, vel, quat, speed, head (position de la tête, monde) } */
  update(dt, focus, track) {
    const cam = this.camera, o = this.orb, sp = focus.speed;
    if (!o.drag) { o.idle += dt; if (o.idle > 1.5) { const f = Math.exp(-dt * 2.2); o.yaw *= f; o.pitch *= f; } }
    // cap de la caméra : suit la trajectoire quand on roule, le cap du vélo à l'arrêt
    const tgtH = sp > 2.5 ? Math.atan2(focus.vel.x, -focus.vel.z) : focus.yaw;
    let d = tgtH - this.heading; while (d > Math.PI) d -= Math.PI * 2; while (d < -Math.PI) d += Math.PI * 2;
    this.heading += d * Math.min(1, dt * (this.init ? 4 : 100));
    let fovT = 62 + clamp(sp * 1.15, 0, 26);
    if (this.mode === 1) {
      cam.position.copy(focus.head); const e = new THREE.Euler(0, 0, 0, 'YXZ'), q = focus.quat;
      const fwd = V(0, 0, -1).applyQuaternion(q); const yaw = Math.atan2(fwd.x, -fwd.z), pitch = Math.asin(clamp(fwd.y, -1, 1));
      e.set(pitch * 0.55 - 0.3, -yaw, 0); cam.quaternion.setFromEuler(e); fovT += 8;
    } else {
      const far = this.mode === 2, dist = (far ? 8.5 : 3.7) + sp * (far ? 0.05 : 0.035), h = far ? 3.6 : 1.55;
      const yaw = this.heading + o.yaw, pitch = Math.atan2(h, dist) + o.pitch, R = Math.hypot(dist, h);
      const target = focus.pos.clone().add(V(0, 0.45, 0));
      const want = V(target.x - Math.sin(yaw) * Math.cos(pitch) * R, target.y + Math.sin(pitch) * R, target.z + Math.cos(yaw) * Math.cos(pitch) * R);
      if (!this.init) { this.pos.copy(want); this.init = true; }
      this.pos.lerp(want, 1 - Math.exp(-dt * (o.drag ? 30 : 7.5)));
      const g = track.height(this.pos.x, this.pos.z) + 0.55; if (this.pos.y < g) this.pos.y = g;
      cam.position.copy(this.pos);
      this.look.lerp(target.clone().add(V(Math.sin(this.heading) * 2.2, 0.25, -Math.cos(this.heading) * 2.2)), 1 - Math.exp(-dt * 10));
      cam.lookAt(this.look);
    }
    if (this.shake > 0.001) { cam.position.add(V((Math.random() - 0.5) * this.shake, (Math.random() - 0.5) * this.shake, (Math.random() - 0.5) * this.shake)); this.shake *= Math.exp(-dt * 7); }
    this.fov = lerp(this.fov, fovT, 1 - Math.exp(-dt * 3)); cam.fov = this.fov; cam.updateProjectionMatrix();
  }
  kick(a) { this.shake = Math.min(0.5, this.shake + a); }
}
