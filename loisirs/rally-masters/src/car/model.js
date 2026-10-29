/* Voiture de rallye : vraie voiture (Sketchfab « 1965-2002 Rally Cars » par DisneyCars, CC-BY, voir assets/models/CREDITS.md).
   Repère : avant +Z, gauche +X, origine au sol sous le centre de gravité. Les caméras se posent sur des repères (`markers`) placés sur le modèle. */
import * as THREE from 'three';
import { loadGLB, fitGLB, rigWheels, poseWheel } from '../../../../assets/glb.js';

const REAL = { compacte: 'peugeot-205', quatre: 'subaru-impreza', propulsion: 'ford-escort', groupb: 'lancia-s4' };
// position (fraction de la longueur, arrière 0 → avant 1) de la base du pare-brise, pour placer la caméra cabine
const WF = { hatch: 0.74, sedan: 0.7, coupe: 0.66, groupb: 0.7 };

export class CarModel {
  constructor(def, opts = {}) {
    this.def = def; this.ghost = !!opts.ghost; const v = def.vis;
    this.root = new THREE.Group(); this.root.rotation.order = 'YXZ';
    this.a = def.L * (1 - def.wf); this.b = def.L * def.wf; this.zc = (this.a - this.b) / 2;
    this.body = new THREE.Group(); this.body.position.set(0, 0.45, this.zc); this.root.add(this.body);
    this.shell = new THREE.Group(); this.shell.position.y = -0.45; this.body.add(this.shell);
    const mk = (name, x, y, z) => { const o = new THREE.Object3D(); o.position.set(x, y, z); this.shell.add(o); return (this.markers[name] = o); };
    this.markers = {};
    const zWF = (WF[v.shape] - 0.5) * v.L;
    mk('eye', 0.36, v.belt + 0.3, zWF - 0.95); mk('hood', 0, v.hood + 0.5, (WF[v.shape] + 0.04 - 0.5) * v.L); mk('bumper', 0, 0.52, v.L / 2 + 0.1); mk('smoke', 0, v.hood + 0.05, v.L * 0.25);
    // repères de roues pour les effets (poussière, éclaboussures) : fl, fr, rl, rr
    this.wheels = [0, 1, 2, 3].map((i) => {
      const g = new THREE.Object3D(); g.position.set(i % 2 === 0 ? v.W / 2 - 0.075 : -(v.W / 2 - 0.075), def.wheelR, i < 2 ? this.a : -this.b); this.root.add(g); return { g };
    });
    this.ang = [0, 0, 0, 0]; this.view = 0; this.gw = [];
    this._load();
    if (!this.ghost) this._buildLights();
  }

  async _load() {
    const url = new URL(`../../../../assets/models/rally-${REAL[this.def.id]}.glb`, import.meta.url).href;
    const m = fitGLB(await loadGLB(url), this.def.vis.L);
    this.gw = rigWheels(m); this.gw.forEach((w) => { w.i = (w.front ? 0 : 2) + (w.left ? 0 : 1); });
    m.traverse((o) => { if (o.isMesh) { o.castShadow = !this.ghost; if (this.ghost) { o.material = o.material.clone(); Object.assign(o.material, { transparent: true, opacity: 0.32, depthWrite: false }); } } });
    this.shell.add(m);
  }

  /* ---------- feux ---------- */
  _buildLights() {
    const v = this.def.vis, zf = v.L / 2, W2 = v.W / 2;
    this.spots = [];
    for (const s of [-1, 1]) {
      const sp = new THREE.SpotLight(0xfff0d0, 0, 140, 0.5, 0.55, 1.2); sp.position.set(s * W2 * 0.6, v.nose - 0.05, zf - 0.1); sp.visible = false;
      const tg = new THREE.Object3D(); tg.position.set(s * W2 * 0.3, v.nose - 1.1, zf + 30); this.shell.add(sp, tg); sp.target = tg; this.spots.push(sp);
    }
    this.lightsOn = false;
  }
  setLights(on) {
    if (this.ghost || this.lightsOn === on) return; this.lightsOn = on;
    for (const s of this.spots) { s.visible = on; s.intensity = on ? 140 : 0; }
  }

  // la vraie carrosserie ne se déforme pas : les dégâts restent dans la physique et la jauge d'état
  dent() {}
  repairBody() {}

  /* ---------- mise à jour par image ---------- */
  update(ph, dt) {
    const r = this.root;
    r.position.set(ph.x, ph.y, ph.z); r.rotation.set(ph.pitchG, ph.yaw, ph.rollG);
    this.body.position.y = 0.45 + ph.heave; this.body.rotation.set(ph.pitch, 0, ph.roll);
    const d = this.def;
    for (let i = 0; i < 4; i++) {
      const front = i < 2;
      if (this.ghost) this.ang[i] += (ph.u / d.wheelR) * dt;
      else {
        const spinBoost = front ? ph.spinF : ph.spinR, lock = front ? ph.lockF : ph.lockR;
        const rate = lock && Math.abs(ph.u) > 1 ? 0 : (ph.u / d.wheelR) * (1 + spinBoost * 2.2) + (spinBoost > 0.1 ? Math.sign(ph.gear) * 18 * spinBoost : 0);
        this.ang[i] += rate * dt;
      }
    }
    for (const w of this.gw) poseWheel(w, this.ang[w.i], ph.steer);
  }
  setView(v) { this.view = v; }
  dispose() { this.root.traverse((o) => { o.geometry?.dispose(); }); }
}
