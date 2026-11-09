// Caméras : engin en poursuite, éloignée ou cabine (clic + glisser pour tourner autour, repris de bus-city-simulator), vue subjective à pied.
const VIEWS = ['Vue poursuite', 'Vue éloignée', 'Vue cabine'];
const wrap = (a) => Math.atan2(Math.sin(a), Math.cos(a));

export class CameraRig {
  constructor(camera) {
    this.camera = camera; this.view = 0; this.follow = 0;
    this.orb = { yaw: 0, pitch: 0, drag: false, idle: 0 };
  }
  bind(el, active) {
    const o = this.orb;
    el.addEventListener('pointerdown', (e) => { if (e.button !== 0 || !active()) return; o.drag = true; o.idle = 0; });
    addEventListener('pointermove', (e) => { if (!o.drag) return; o.yaw -= (e.movementX || 0) * 0.006; o.pitch = Math.max(-0.15, Math.min(1.1, o.pitch + (e.movementY || 0) * 0.005)); o.idle = 0; });
    addEventListener('pointerup', () => { o.drag = false; });
  }
  get name() { return VIEWS[this.view]; }
  toggle() { this.view = (this.view + 1) % VIEWS.length; }

  get cabin() { return this.view === 2; }
  truck(dt, veh) {
    const p = veh.phys, L = veh.s.length;
    if (this.cabin) {   // poste de conduite : regard libre au clic + glisser
      veh.root.updateMatrixWorld(true);
      const e = veh.cockpit.eye, o = this.orb; o.idle += dt;
      if (!o.drag && o.idle > 3) { const k = Math.exp(-2 * dt); o.yaw *= k; o.pitch *= k; }
      e.getWorldPosition(this.camera.position);
      const a = p.heading + o.yaw * 1.5, pt = -0.12 - o.pitch * 0.6;
      this.camera.lookAt(this.camera.position.x + Math.sin(a), this.camera.position.y + pt, this.camera.position.z + Math.cos(a));
      this.camYaw = a; this.follow = p.heading; return;
    }
    this.follow += wrap(p.heading - this.follow) * (1 - Math.exp(-3 * dt));
    const o = this.orb; o.idle += dt;
    if (!o.drag && o.idle > 3) { const k = Math.exp(-2 * dt); o.yaw *= k; o.pitch *= k; }
    const far = this.view === 1, d = L * (far ? 1.9 : 0.85) + 7, a = this.follow + o.yaw, cp = Math.cos(o.pitch);
    this.camera.position.set(p.x - Math.sin(a) * d * cp, (far ? 9 : 4.8) + Math.sin(o.pitch) * d, p.z - Math.cos(a) * d * cp);
    this.camera.lookAt(p.x + Math.sin(p.heading) * L * 0.4, 2, p.z + Math.cos(p.heading) * L * 0.4);
    this.camYaw = Math.atan2(p.x - this.camera.position.x, p.z - this.camera.position.z);
  }

  // grande échelle : derrière la nacelle, regard vers l'avant de l'échelle ; clic + glisser pour tourner
  ladder(dt, lad, inBasket = false) {
    const tip = lad.tipWorld(), d = lad.dirWorld(), o = this.orb;
    if (inBasket) {   // vue depuis la nacelle : yeux à 1,6 m du plancher, regard libre au clic + glisser
      const a = Math.atan2(d.x, d.z) + o.yaw, pt = -o.pitch * 0.8;
      this.camera.position.set(tip.x, tip.y + 0.6, tip.z); this.camera.lookAt(tip.x + Math.sin(a), tip.y + 0.6 + pt, tip.z + Math.cos(a));
      this.camYaw = a; return;
    }
    const a = Math.atan2(d.x, d.z) + o.yaw, dist = 8, up = 2.4 + o.pitch * 6;
    this.camera.position.set(tip.x - Math.sin(a) * dist, tip.y + up, tip.z - Math.cos(a) * dist);
    this.camera.lookAt(tip.x + d.x * 3, tip.y, tip.z + d.z * 3);
    this.camYaw = Math.atan2(d.x, d.z);
  }

  foot(pl) {
    const d = pl.dir;
    this.camera.position.set(pl.x, pl.eyeY, pl.z);
    this.camera.lookAt(pl.x + d.x, pl.eyeY + d.y, pl.z + d.z);
    this.camYaw = pl.yaw; this.follow = pl.yaw;
  }
}
