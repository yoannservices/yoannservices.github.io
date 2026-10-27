import * as THREE from 'three';

const VIEWS = ['Vue externe', 'Cabine conducteur', 'Intérieur passagers'];
const wrap = (a) => Math.atan2(Math.sin(a), Math.cos(a));

export class CameraRig {
  constructor(camera) {
    this.camera = camera; this.view = 0; this.follow = 0;
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
    const L = model.length, d = L * 0.8 + 8;
    this.camera.position.set(p.x - Math.sin(this.follow) * d, 4 + L * 0.2 + (vehicle.stats.height > 4 ? 1.5 : 0), p.z - Math.cos(this.follow) * d);
    this.camera.lookAt(p.x + Math.sin(p.heading) * L * 0.3, 1.8, p.z + Math.cos(p.heading) * L * 0.3);
  }
}
