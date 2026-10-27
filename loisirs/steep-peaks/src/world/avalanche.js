import * as THREE from 'three';
import { G, clamp, lerp } from '../core/config.js';
import { heightAt } from './heightmap.js';

const MAXP = 360, LIFE = 14, m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), p3 = new THREE.Vector3(), s3 = new THREE.Vector3();

// Coulée : une tête suit la plus grande pente, laisse une traînée de bouffées de neige
export class Avalanche {
  constructor(scene) {
    this.on = false; this.trail = [];
    this.mesh = new THREE.InstancedMesh(
      new THREE.IcosahedronGeometry(1, 1),
      new THREE.MeshLambertMaterial({ color: 0xf2f6ff, flatShading: true, transparent: true, opacity: 0.93 }),
      MAXP,
    );
    this.mesh.count = 0; this.mesh.frustumCulled = false;
    scene.add(this.mesh);
  }
  get speed() { return this.on && this.alive ? Math.hypot(this.head.vx, this.head.vz) : 0; }

  trigger(x, z) {
    if (this.on) return false;
    Object.assign(this, { on: true, alive: true, t: 0, acc: 0, stopT: 0, trail: [], head: { x, z, vx: 0, vz: 0 } });
    return true;
  }

  // Renvoie true si le joueur (pos, vol haut exclu) est englouti
  update(dt, pos, aglP) {
    if (!this.on) { this.mesh.count = 0; return false; }
    const h = this.head;
    this.t += dt;
    if (this.alive) {
      const gx = heightAt(h.x + 2, h.z) - heightAt(h.x - 2, h.z), gz = heightAt(h.x, h.z + 2) - heightAt(h.x, h.z - 2);
      const m = Math.hypot(gx, gz) / 4, nx = -gx / (4 * m || 1), nz = -gz / (4 * m || 1);
      const a = G * Math.min(m, 1.4) * 0.85;
      h.vx += nx * a * dt; h.vz += nz * a * dt;
      let sp = Math.hypot(h.vx, h.vz);
      const f = Math.min(1, 2 * dt); h.vx = lerp(h.vx, nx * sp, f); h.vz = lerp(h.vz, nz * sp, f);
      sp = clamp(sp * (1 - 0.15 * dt), 0, 48); const cur = Math.hypot(h.vx, h.vz) || 1;
      h.vx *= sp / cur; h.vz *= sp / cur;
      h.x += h.vx * dt; h.z += h.vz * dt;
      this.stopT = sp < 4 && m < 0.15 ? this.stopT + dt : 0;
      if (this.stopT > 2.5 || this.t > 40) this.alive = false;
      this.acc += dt;
      if (this.acc > 0.1 && this.trail.length < MAXP / 4) {
        this.acc = 0;
        this.trail.push({ x: h.x, z: h.z, y: heightAt(h.x, h.z), age: 0, o: [0, 1, 2, 3].map(() => [Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random(), Math.random()]) });
      }
    }
    let n = 0, hit = false;
    for (let i = this.trail.length - 1; i >= 0; i--) {
      const e = this.trail[i];
      e.age += dt;
      if (e.age > LIFE) { this.trail.splice(i, 1); continue; }
      const spread = 6 + Math.min(e.age, 3) * 2.5, fade = e.age > LIFE - 3 ? (LIFE - e.age) / 3 : 1;
      for (const o of e.o) {
        const s = (3 + o[3] * 4) * (0.4 + 0.8 * Math.min(e.age, 2) / 2) * fade;
        m4.compose(p3.set(e.x + o[0] * spread, e.y + s * 0.5 + o[2] * 2 * Math.min(e.age, 2), e.z + o[1] * spread), q, s3.set(s, s * 0.8, s));
        this.mesh.setMatrixAt(n++, m4);
      }
      if (e.age < 9 && Math.hypot(pos.x - e.x, pos.z - e.z) < spread * 0.75 && pos.y - e.y < 8 && aglP < 14) hit = true;
    }
    this.mesh.count = n;
    this.mesh.instanceMatrix.needsUpdate = true;
    if (!this.alive && !this.trail.length) this.on = false;
    return hit;
  }
}
