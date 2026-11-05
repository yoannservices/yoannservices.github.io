import * as THREE from 'three';

const VIEWS = ['Vue externe', 'Cabine conducteur', 'Intérieur passagers'];
const wrap = (a) => Math.atan2(Math.sin(a), Math.cos(a));

export class CameraRig {
  constructor(camera) {
    this.camera = camera; this.view = 0; this.follow = 0;
    this.orb = { yaw: 0, pitch: 0, drag: false, idle: 0 }; // vue externe libre : clic + glisser (souris, ou joystick droit via gamepad.js)
  }
  /* à appeler avec le canvas de la scène */
  bind(el) {
    const o = this.orb;
    el.addEventListener('pointerdown', (e) => { if (e.button !== 0 || this.inside) return; o.drag = true; o.idle = 0; try { el.setPointerCapture(e.pointerId); } catch (_) { /* pointeur simulé par la manette */ } });
    el.addEventListener('pointermove', (e) => { if (!o.drag) return; o.yaw -= (e.movementX || 0) * 0.006; o.pitch = Math.max(-0.15, Math.min(1.1, o.pitch + (e.movementY || 0) * 0.005)); o.idle = 0; });
    const up = () => { o.drag = false; };
    el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up);
  }
  get name() { return VIEWS[this.view]; }
  get cabin() { return this.view === 1; }
  get inside() { return this.view > 0; }
  toggle() { this.view = (this.view + 1) % VIEWS.length; this.camera.fov = this.inside ? 70 : 60; this.camera.updateProjectionMatrix(); }

  update(dt, vehicle) {
    const p = vehicle.phys, model = vehicle.model;
    if (this.inside) {
      model.root.updateMatrixWorld(true);
      const eye = this.view === 1 ? model.eye : model.eyeInt;
      eye.getWorldPosition(this.camera.position);
      eye.getWorldQuaternion(this.camera.quaternion);
      this.follow = p.heading;
      return;
    }
    this.follow += wrap(p.heading - this.follow) * (1 - Math.exp(-3 * dt));
    const o = this.orb; o.idle += dt;
    if (!o.drag && o.idle > 3) { const k = Math.exp(-2 * dt); o.yaw *= k; o.pitch *= k; }
    const L = model.length, d = L * 0.8 + 8, a = this.follow + o.yaw, cp = Math.cos(o.pitch);
    this.camera.position.set(p.x - Math.sin(a) * d * cp, 4 + L * 0.2 + (vehicle.stats.height > 4 ? 1.5 : 0) + Math.sin(o.pitch) * d, p.z - Math.cos(a) * d * cp);
    this.camera.lookAt(p.x + Math.sin(p.heading) * L * 0.3, 1.8, p.z + Math.cos(p.heading) * L * 0.3);
  }
}
