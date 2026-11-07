// Grande échelle de l'EPA (échelle pivotante automatique) : tourelle à l'arrière, 3 plans télescopiques (9 à 30 m),
// nacelle toujours horizontale, 4 stabilisateurs. Construite en primitives sur le FPT du pack npc.
// Repère du véhicule : avant = +z, gauche = +x. yaw > 0 = vers la gauche, pitch > 0 = vers le haut.
import * as THREE from 'three';

export const LADDER = { min: 9, max: 30, pitchMin: -0.24, pitchMax: 1.31, yawRate: 0.45, pitchRate: 0.28, extRate: 1.8 };
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

function rungTexture() {
  const c = Object.assign(document.createElement('canvas'), { width: 32, height: 64 }), g = c.getContext('2d');
  g.clearRect(0, 0, 32, 64); g.fillStyle = '#cfd3d6'; g.fillRect(0, 26, 32, 10);
  const t = new THREE.CanvasTexture(c); t.wrapT = THREE.RepeatWrapping; return t;
}

export class Ladder {
  constructor(truck) {
    const s = truck.s, steel = new THREE.MeshStandardMaterial({ color: '#d9dcdf', metalness: 0.7, roughness: 0.35 }), red = new THREE.MeshStandardMaterial({ color: '#b3121b', roughness: 0.5 });
    this.truck = truck; this.yaw = 0; this.pitch = 0.03; this.ext = LADDER.min; this.out = 0; this.stowing = false; this.load = [];
    const rear = -(s.length - s.wheelbase - s.frontOverhang);
    this.base = new THREE.Group(); this.base.position.set(0, s.deckH, rear + 1.4); truck.tilt.add(this.base);
    const turret = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 1, 0.5, 20), red); turret.position.y = 0.25; this.base.add(turret);
    this.yawG = new THREE.Group(); this.yawG.position.y = 0.5; this.base.add(this.yawG);
    const cab = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.9, 0.7), red); cab.position.set(0.85, 0.45, -0.2); this.yawG.add(cab);   // poste de commande
    this.pitchG = new THREE.Group(); this.pitchG.position.y = 0.6; this.yawG.add(this.pitchG);
    const rung = rungTexture();
    this.sections = [0, 1, 2].map((k) => {
      const g = new THREE.Group(), w = 0.9 - k * 0.12, L = LADDER.min;
      for (const x of [-w / 2, w / 2]) { const r = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.16, L), steel); r.position.set(x, 0.08 + k * 0.05, L / 2); g.add(r); }
      const tex = rung.clone(); tex.needsUpdate = true; tex.repeat.set(1, L / 0.3);
      const steps = new THREE.Mesh(new THREE.PlaneGeometry(w, L).rotateX(-Math.PI / 2), new THREE.MeshStandardMaterial({ map: tex, transparent: true, alphaTest: 0.5, side: THREE.DoubleSide, metalness: 0.6, roughness: 0.4 }));
      steps.position.set(0, 0.06 + k * 0.05, L / 2); g.add(steps);
      this.pitchG.add(g); return g;
    });
    // nacelle (reste horizontale)
    this.tip = new THREE.Group(); this.pitchG.add(this.tip);
    this.basket = new THREE.Group(); this.tip.add(this.basket);
    const floor = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.1, 1.1), steel); floor.position.set(0, -0.9, 0.55); this.basket.add(floor);
    for (const [w, d, x, z] of [[1.7, 0.05, 0, 1.1], [1.7, 0.05, 0, 0], [0.05, 1.1, 0.85, 0.55], [0.05, 1.1, -0.85, 0.55]]) { const r = new THREE.Mesh(new THREE.BoxGeometry(w, 0.06, d), red); r.position.set(x, 0.1, z); this.basket.add(r); const p = new THREE.Mesh(new THREE.BoxGeometry(Math.min(w, 0.05), 1, Math.min(d, 0.05)), steel); p.position.set(x, -0.4, z); this.basket.add(p); }
    this.lamp = new THREE.PointLight('#fff4d6', 0, 18, 1.5); this.lamp.position.set(0, 0.4, 1.2); this.basket.add(this.lamp);
    // stabilisateurs
    this.legs = [];
    for (const zz of [rear + 0.6, s.wheelbase - 0.3]) for (const sx of [-1, 1]) {
      const leg = new THREE.Mesh(new THREE.BoxGeometry(1, 0.18, 0.3), red); leg.position.set(sx * (s.width / 2 - 0.5), 0.55, zz); truck.tilt.add(leg);
      const foot = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.5, 0.4), steel); foot.position.set(sx * 0.5, -0.25, 0); leg.add(foot);
      this.legs.push({ leg, sx });
    }
    this.sync();
  }

  get stowed() { return this.out < 0.02 && Math.abs(this.pitch - 0.03) < 0.03 && this.ext < LADDER.min + 0.1 && Math.abs(this.yaw) < 0.05; }
  get deployed() { return this.out > 0.98; }

  // commande : { yaw, pitch, ext } dans [-1, 1] ; collide(p) = vrai si la nacelle entre dans un bâtiment
  control(dt, c, collide) {
    if (this.stowing) {   // repli automatique
      const go = (v, t, r) => v + clamp(t - v, -r * dt, r * dt);
      this.ext = go(this.ext, LADDER.min, LADDER.extRate * 1.5);
      if (this.ext < LADDER.min + 0.5) { this.yaw = go(this.yaw, 0, LADDER.yawRate); if (Math.abs(this.yaw) < 0.05) this.pitch = go(this.pitch, 0.03, LADDER.pitchRate); }
      if (Math.abs(this.yaw) < 0.02 && Math.abs(this.pitch - 0.03) < 0.01 && this.ext < LADDER.min + 0.05) { this.out = Math.max(0, this.out - dt * 0.8); if (!this.out) { this.stowing = false; this.wantDeploy = false; } }
      this.sync(); return;
    }
    if (!this.deployed) { if (this.wantDeploy) this.out = Math.min(1, this.out + dt * 0.8); this.sync(); return; }   // stabilisateurs d'abord (à la prise des commandes)
    const prev = [this.yaw, this.pitch, this.ext];
    this.yaw += c.yaw * LADDER.yawRate * dt;
    this.pitch = clamp(this.pitch + c.pitch * LADDER.pitchRate * dt, LADDER.pitchMin, LADDER.pitchMax);   // sous l'horizontale : la nacelle descend jusqu'au sol
    this.ext = clamp(this.ext + c.ext * LADDER.extRate * dt, LADDER.min, LADDER.max);
    this.sync();
    const p = this.tipWorld();
    this.blocked = p.y < 0.6 || collide(p);
    if (this.blocked) { [this.yaw, this.pitch, this.ext] = prev; this.sync(); }
  }
  stow() { this.stowing = true; }

  sync() {
    this.yawG.rotation.y = this.yaw; this.pitchG.rotation.x = -this.pitch;
    const step = (this.ext - LADDER.min) / 2;
    this.sections.forEach((g, k) => { g.position.z = k * step; });
    this.tip.position.set(0, 0.2, this.ext); this.basket.rotation.x = this.pitch + this.truck.phys.pitch;
    for (const { leg, sx } of this.legs) leg.position.x = sx * (this.truck.s.width / 2 - 0.5 + this.out * 1.2);
    this.lamp.intensity = this.deployed ? 18 : 0;
  }
  // centre de la nacelle (sol de la nacelle + 1 m) et direction horizontale de l'échelle, en monde
  tipWorld() { this.truck.root.updateMatrixWorld(true); return this.basket.localToWorld(new THREE.Vector3(0, 0.1, 0.55)); }
  dirWorld() { const h = this.truck.phys.heading + this.yaw; return { x: Math.sin(h), z: Math.cos(h) }; }
  heightAboveGround() { return this.tipWorld().y - 1; }
}
