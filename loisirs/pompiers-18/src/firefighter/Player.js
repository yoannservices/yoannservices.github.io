// Le chef d'agrès à pied, en vue subjective : déplacement avec collisions (ville + maison), escalier,
// ARI (air limité dès qu'on entre), chaleur, tuyau tiré depuis l'arrière du FPT.
import * as THREE from 'three';
import { pathLength, HOSE_SECTION } from './water.js';

const R = 0.26;                  // rayon du corps
export const ARI_AIR = 480;      // s d'air de la bouteille de base (jeu accéléré)

export class Player {
  constructor(scene) {
    this.x = 0; this.y = 0; this.z = 0; this.yaw = 0; this.pitch = 0;
    this.crouch = false; this.eye = 1.7; this.floor = 0;
    this.air = ARI_AIR; this.airMax = ARI_AIR; this.hp = 100; this.inside = false;
    this.hose = null;            // { pts:[{x,y,z}], max }
    this.mode = 'jet';
    this.hoseLine = new THREE.Mesh(new THREE.BufferGeometry(), new THREE.MeshStandardMaterial({ color: '#d8d2c4', roughness: 0.7 }));
    this.hoseLine.frustumCulled = false; this.hoseLine.visible = false; scene.add(this.hoseLine);
    // lance tenue en main (visible en vue subjective)
    this.nozzle = new THREE.Group();
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.07, 0.55, 12).rotateX(Math.PI / 2), new THREE.MeshStandardMaterial({ color: '#c0c4c8', metalness: 0.7, roughness: 0.3 }));
    const grip = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.14, 0.06), new THREE.MeshStandardMaterial({ color: '#1b1b1b' }));
    grip.position.set(0, -0.08, 0.08); this.nozzle.add(body, grip); this.nozzle.visible = false;
  }

  place(x, z, yaw = 0) { this.x = x; this.z = z; this.y = 0; this.yaw = yaw; this.floor = 0; }
  get eyeY() { return this.y + this.eye; }
  get dir() { return { x: Math.sin(this.yaw) * Math.cos(this.pitch), y: Math.sin(this.pitch), z: Math.cos(this.yaw) * Math.cos(this.pitch) }; }

  takeHose(from, maxLen) { this.hose = { pts: [{ x: from.x, y: 0.1, z: from.z }], max: maxLen, from }; this.hoseLine.visible = true; this.nozzle.visible = true; }
  dropHose() { this.hose = null; this.hoseLine.visible = false; this.nozzle.visible = false; }
  hoseLength() { return this.hose ? pathLength([...this.hose.pts, { x: this.x, y: this.y, z: this.z }]) : 0; }
  hoseSections() { return Math.ceil(this.hoseLength() / HOSE_SECTION); }

  // inp : sortie de readInput ; world : { col (ville), building (ou null) }
  update(dt, inp, world) {
    if (inp.crouch) this.crouch = !this.crouch;
    this.eye += ((this.crouch ? 0.95 : 1.7) - this.eye) * Math.min(1, dt * 10);
    this.yaw -= inp.lookX * 0.0024 + inp.turn * 2.2 * dt;
    this.pitch = Math.max(-1.2, Math.min(1.2, this.pitch - inp.lookY * 0.0022));
    if (inp.mode) this.mode = this.mode === 'jet' ? 'diffuse' : 'jet';

    const speed = (this.crouch ? 1.3 : inp.run ? 4.6 : 2.6) * (this.hp < 30 ? 0.6 : 1) * (this.slow ?? 1);
    const fx = Math.sin(this.yaw), fz = Math.cos(this.yaw);
    let vx = fx * inp.fwd - fz * inp.strafe, vz = fz * inp.fwd + fx * inp.strafe;
    const m = Math.hypot(vx, vz); if (m > 1) { vx /= m; vz /= m; }
    const ox = this.x, oz = this.z, oy = this.y;
    this.x += vx * speed * dt; this.z += vz * speed * dt;

    const b = world.building;
    for (let it = 0; it < 2; it++) {
      let r = world.col.resolve(this.x, this.z, R); this.x += r.px; this.z += r.pz;
      if (b && b.near(this.x, this.z, 2)) { r = b.cols[this.floor].resolve(this.x, this.z, R); this.x += r.px; this.z += r.pz; }
    }
    if (b) {
      const g = b.groundY(this.x, this.z, this.y);
      if (Math.abs(g - this.y) > 0.9) { this.x = ox; this.z = oz; }      // marche trop haute : on reste
      else this.y += (g - this.y) * Math.min(1, dt * 14);
      this.floor = Math.min(b.floors - 1, Math.round(this.y / 3));
      this.inside = b.inside(this.x, this.z);
    } else { this.y = 0; this.floor = 0; this.inside = false; }

    // tuyau : un point tous les 0,8 m ; revenir sur ses pas l'enroule ; au bout de la longueur, on ne peut pas aller plus loin
    if (this.hose) {
      const h = this.hose, last = h.pts[h.pts.length - 1];
      if (this.hoseLength() > h.max) { this.x = ox; this.z = oz; this.y = oy; }
      if (h.pts.length > 1) { const prev = h.pts[h.pts.length - 2]; if (Math.hypot(prev.x - this.x, prev.z - this.z) < 0.5) h.pts.pop(); }
      if (Math.hypot(last.x - this.x, last.z - this.z) > 0.8) h.pts.push({ x: this.x, y: this.y + 0.08, z: this.z });
      this.drawHose();
    }
  }

  drawHose() {
    const pts = [...this.hose.pts, { x: this.x, y: this.y + 0.9, z: this.z }].map((p) => new THREE.Vector3(p.x, p.y, p.z));
    if (pts.length < 2) return;
    this.hoseLine.geometry.dispose();
    this.hoseLine.geometry = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts, false, 'catmullrom', 0.2), Math.min(400, pts.length * 3), 0.045, 6, false);
  }

  // ARI et chaleur : smoke 0..1 vu par le joueur, heatT température de la pièce
  breathe(dt, { masked, smoke, heatT, running }) {
    if (masked) this.air = Math.max(0, this.air - dt * (running ? 1.6 : 1));
    else this.air = Math.min(this.airMax, this.air + dt * 20);   // bouteille changée dehors, au FPT
    let dmg = 0;
    if (heatT > 120) dmg += (heatT - 120) / 110 * (this.crouch ? 0.35 : 1);
    if (smoke > 0.15 && (!masked || this.air <= 0)) dmg += smoke * 12;
    this.hp = Math.max(0, Math.min(100, this.hp - dmg * dt + (dmg === 0 ? dt * 2 : 0)));
  }
}
