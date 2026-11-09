// Caméras : poursuite, éloignée, cabine (comme les autres jeux). Clic + glisser pour tourner autour, stick droit à la manette.
const VIEWS = ['Vue poursuite', 'Vue éloignée', 'Vue cabine'];
const wrap = (a) => Math.atan2(Math.sin(a), Math.cos(a));

export class CameraRig {
  constructor(camera) { this.camera = camera; this.view = 0; this.follow = 0; this.orb = { yaw: 0, pitch: 0, drag: false, idle: 0 }; this.shake = 0; this.dist = 0; }
  bind(el) {
    const o = this.orb;
    el.addEventListener('pointerdown', (e) => { if (e.button === 0 || e.button === 2) { o.drag = true; o.idle = 0; } });
    el.addEventListener('contextmenu', (e) => e.preventDefault());
    addEventListener('pointermove', (e) => { if (!o.drag) return; o.yaw -= (e.movementX || 0) * 0.006; o.pitch = Math.max(-0.2, Math.min(1.2, o.pitch + (e.movementY || 0) * 0.005)); o.idle = 0; });
    addEventListener('pointerup', () => { o.drag = false; });
    el.addEventListener('wheel', (e) => { this.dist = Math.max(-0.4, Math.min(1.2, this.dist + Math.sign(e.deltaY) * 0.08)); }, { passive: true });
  }
  get name() { return VIEWS[this.view]; }
  get cabin() { return this.view === 2; }
  toggle() { this.view = (this.view + 1) % VIEWS.length; }
  // m : machine active ; mdl : son modèle ; camX : stick droit horizontal
  follow3(dt, m, mdl, camX = 0) {
    const o = this.orb; o.idle += dt; o.yaw -= camX * 2 * dt; if (camX) o.idle = 0;
    if (!o.drag && o.idle > 3) { const k = Math.exp(-2 * dt); o.yaw *= k; o.pitch *= k; }
    const cam = this.camera;
    if (this.cabin) {
      mdl.root.updateMatrixWorld(true); mdl.eye.getWorldPosition(cam.position);
      const base = m.id === 'excavator' ? m.h + m.tool.swing : m.h, a = base + o.yaw * 1.5, pt = -0.12 - o.pitch * 0.6;
      cam.lookAt(cam.position.x + Math.sin(a), cam.position.y + pt, cam.position.z + Math.cos(a)); this.camYaw = a; this.follow = m.h;
    } else {
      this.follow += wrap(m.h - this.follow) * (1 - Math.exp(-(m.s.type === 'tracked' ? 1.6 : 3) * dt));
      const far = this.view === 1, d = (m.s.L * (far ? 1.8 : 0.95) + 6) * (1 + this.dist), a = this.follow + o.yaw, cp = Math.cos(o.pitch);
      const hgt = (far ? 11 : 5.2) + (m.id === 'excavator' ? 3 : 0);
      cam.position.set(m.x - Math.sin(a) * d * cp, m.y + hgt * (1 + this.dist * 0.5) + Math.sin(o.pitch) * d, m.z - Math.cos(a) * d * cp);
      const ahead = m.id === 'excavator' ? 0 : m.s.L * 0.3;
      cam.lookAt(m.x + Math.sin(m.h) * ahead, m.y + 1.8, m.z + Math.cos(m.h) * ahead); this.camYaw = Math.atan2(m.x - cam.position.x, m.z - cam.position.z);
    }
    if (this.shake > 0.001) { cam.position.x += (Math.random() - 0.5) * this.shake; cam.position.y += (Math.random() - 0.5) * this.shake; this.shake *= Math.exp(-4 * dt); }
  }
}
