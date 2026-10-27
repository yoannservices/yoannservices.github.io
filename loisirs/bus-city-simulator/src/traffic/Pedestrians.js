// Piétons : attendent au bord d'un passage puis traversent quand le feu de l'axe correspondant est rouge assez longtemps.
import * as THREE from 'three';
import { nodes, DIRS, rightOf, inGrid, axisOfDir } from '../city/grid.js';
import { lightState, timeToGreen } from '../city/TrafficLights.js';

const MAX = 120, HALF_W = 7.4, SPEED = 1.4;

export class Pedestrians {
  constructor(scene) {
    this.cws = [];
    for (const n of nodes) if (n.type === 'signal') DIRS.forEach((d, k) => {
      if (!inGrid(n.i + d.x, n.j + d.z)) return;
      const r = rightOf(d), cx = n.x + d.x * 9, cz = n.z + d.z * 9;
      this.cws.push({ n, axis: axisOfDir(k), ax: cx - r.x * HALF_W, az: cz - r.z * HALF_W, bx: cx + r.x * HALF_W, bz: cz + r.z * HALF_W, cx, cz });
    });
    this.list = []; this.active = []; this.lastScan = -9;
    this.body = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.22, 0.25, 1.1, 8), new THREE.MeshStandardMaterial({ color: '#fff' }), MAX);
    this.head = new THREE.InstancedMesh(new THREE.SphereGeometry(0.14, 8, 6), new THREE.MeshStandardMaterial({ color: '#e0b896' }), MAX);
    const pal = ['#c0392b', '#2980b9', '#27ae60', '#8e44ad', '#d35400', '#34495e', '#f1c40f', '#16a085'];
    for (let i = 0; i < MAX; i++) this.body.setColorAt(i, new THREE.Color(pal[i % pal.length]));
    for (const m of [this.body, this.head]) { m.frustumCulled = false; m.count = 0; m.castShadow = true; scene.add(m); }
    this.d = new THREE.Object3D();
    this.crossing = [];
  }

  update(dt, t, bus) {
    if (t - this.lastScan > 1) {
      this.lastScan = t;
      this.active = this.cws.filter((c) => Math.hypot(c.cx - bus.x, c.cz - bus.z) < 170);
    }
    if (this.list.length < MAX && this.active.length && Math.random() < dt * 4) {
      const cw = this.active[Math.floor(Math.random() * this.active.length)];
      this.list.push({ cw, side: Math.random() < 0.5 ? 0 : 1, t: 0, state: 'wait', wait: 1 + Math.random() * 10, x: 0, z: 0, ph: Math.random() * 6 });
    }
    this.crossing.length = 0;
    for (let i = this.list.length - 1; i >= 0; i--) {
      const p = this.list[i], cw = p.cw;
      if (Math.hypot(cw.cx - bus.x, cw.cz - bus.z) > 260) { this.list.splice(i, 1); continue; }
      if (p.state === 'wait') {
        p.wait -= dt;
        if (p.wait <= 0 && lightState(cw.n, cw.axis, t) === 'R' && timeToGreen(cw.n, cw.axis, t) >= 12.5) { p.state = 'cross'; p.t = 0; }
      } else {
        p.t += (SPEED * dt) / (2 * HALF_W);
        if (p.t >= 1) { p.state = 'wait'; p.t = 0; p.side ^= 1; p.wait = 4 + Math.random() * 14; }
      }
      const f = p.side === 0 ? p.t : 1 - p.t;
      // t parcourt 0..1 depuis le côté courant : on place A->B si side 0, sinon B->A
      const u = p.state === 'cross' ? f : p.side === 0 ? 0 : 1;
      p.x = cw.ax + (cw.bx - cw.ax) * u; p.z = cw.az + (cw.bz - cw.az) * u;
      if (p.state === 'cross') this.crossing.push(p);
    }
    const d = this.d;
    this.list.forEach((p, i) => {
      const bob = p.state === 'cross' ? Math.abs(Math.sin(t * 7 + p.ph)) * 0.05 : 0;
      d.rotation.set(0, 0, 0); d.scale.set(1, 1, 1);
      d.position.set(p.x, 0.7 + bob, p.z); d.updateMatrix(); this.body.setMatrixAt(i, d.matrix);
      d.position.set(p.x, 1.42 + bob, p.z); d.updateMatrix(); this.head.setMatrixAt(i, d.matrix);
    });
    this.body.count = this.head.count = this.list.length;
    this.body.instanceMatrix.needsUpdate = this.head.instanceMatrix.needsUpdate = true;
  }

  remove(p) { const i = this.list.indexOf(p); if (i >= 0) this.list.splice(i, 1); }
}
