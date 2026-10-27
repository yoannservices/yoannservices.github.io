// Circulation IA : voitures qui suivent des voies (polylignes), s'arrêtent aux feux / stops, évitent bus, piétons et autres voitures.
import * as THREE from 'three';
import { G, P, HALF, LANE, DIRS, rightOf, axisOfDir, nodeAt, inGrid, ekey, coord } from '../city/grid.js';
import { lightState } from '../city/TrafficLights.js';

const TAU = Math.PI * 2;
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const cross = (a, b) => a.x * b.z - a.z * b.x;

function makeLeg(type, pts, extra) {
  const cum = [0];
  for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + Math.hypot(pts[i].x - pts[i - 1].x, pts[i].z - pts[i - 1].z));
  return { type, pts, cum, len: cum[cum.length - 1], ...extra };
}
export function edgeLeg(a, k) {
  const d = DIRS[k], r = rightOf(d), b = nodeAt(a.i + d.x, a.j + d.z);
  return makeLeg('edge', [
    { x: a.x + d.x * HALF + r.x * LANE, z: a.z + d.z * HALF + r.z * LANE },
    { x: b.x - d.x * HALF + r.x * LANE, z: b.z - d.z * HALF + r.z * LANE },
  ], { a, b, k, key: ekey(a.i, a.j, b.i, b.j) });
}
function turnLeg(b, k, k2) {
  const d = DIRS[k], r = rightOf(d), d2 = DIRS[k2], r2 = rightOf(d2);
  const s = { x: b.x - d.x * HALF + r.x * LANE, z: b.z - d.z * HALF + r.z * LANE };
  const e = { x: b.x + d2.x * HALF + r2.x * LANE, z: b.z + d2.z * HALF + r2.z * LANE };
  const pts = [];
  if (b.type === 'round') {                                    // arc anti-horaire autour de l'îlot
    const R = Math.hypot(s.x - b.x, s.z - b.z);
    const a0 = Math.atan2(s.x - b.x, s.z - b.z), a1 = Math.atan2(e.x - b.x, e.z - b.z);
    const da = (((a1 - a0) % TAU) + TAU) % TAU;
    const n = Math.max(2, Math.ceil(da / 0.2));
    for (let i = 0; i <= n; i++) { const a = a0 + (da * i) / n; pts.push({ x: b.x + Math.sin(a) * R, z: b.z + Math.cos(a) * R }); }
  } else if (k2 === k) pts.push(s, e);
  else {
    const t = cross({ x: e.x - s.x, z: e.z - s.z }, d2) / cross(d, d2);
    const c = { x: s.x + d.x * t, z: s.z + d.z * t };
    for (let i = 0; i <= 8; i++) {
      const u = i / 8, w = 1 - u;
      pts.push({ x: w * w * s.x + 2 * w * u * c.x + u * u * e.x, z: w * w * s.z + 2 * w * u * c.z + u * u * e.z });
    }
  }
  return makeLeg('turn', pts, { b, k, k2 });
}
function legPos(leg, s, out) {
  const { pts, cum } = leg;
  let i = 1;
  while (i < pts.length - 1 && cum[i] < s) i++;
  const p0 = pts[i - 1], p1 = pts[i], l = cum[i] - cum[i - 1] || 1, t = clamp((s - cum[i - 1]) / l, 0, 1);
  out.x = p0.x + (p1.x - p0.x) * t; out.z = p0.z + (p1.z - p0.z) * t;
  out.h = Math.atan2(p1.x - p0.x, p1.z - p0.z);
  return out;
}
const turnType = (k, k2) => (k2 - k + 4) % 4;   // 0 tout droit, 1 droite, 3 gauche

export class Traffic {
  constructor(scene, count = 70) {
    this.cars = []; this.occ = new Map(); this.closed = new Set(); this.jam = new Set();
    this.n = count;
    const body = new THREE.InstancedMesh(new THREE.BoxGeometry(1.8, 0.75, 4.2), new THREE.MeshStandardMaterial({ color: '#fff', roughness: 0.5 }), count);
    const cab = new THREE.InstancedMesh(new THREE.BoxGeometry(1.6, 0.6, 2.2), new THREE.MeshStandardMaterial({ color: '#27313c', roughness: 0.2 }), count);
    this.lamps = new THREE.InstancedMesh(new THREE.BoxGeometry(0.4, 0.16, 0.06), new THREE.MeshBasicMaterial({ color: '#fff' }), count * 4);
    for (const m of [body, cab, this.lamps]) { m.frustumCulled = false; scene.add(m); }
    body.castShadow = cab.castShadow = true;
    this.body = body; this.cab = cab;
    this.dummy = new THREE.Object3D(); this.tmp = {};
    const pal = ['#c0392b', '#2980b9', '#ecf0f1', '#2c3e50', '#f39c12', '#27ae60', '#7f8c8d', '#8e44ad', '#bdc3c7'];
    for (let i = 0; i < count; i++) {
      this.cars.push({ leg: null, s: 0, v: 0, desired: 10, nextK: 0, stopT: 0, stuck: 0, x: 0, z: 0, h: 0, active: false });
      body.setColorAt(i, new THREE.Color(pal[i % pal.length]));
    }
    // lampes avant (blanches) et arrière (rouges)
    for (let i = 0; i < count; i++) for (let j = 0; j < 4; j++) this.lamps.setColorAt(i * 4 + j, new THREE.Color(j < 2 ? '#fff3c0' : '#c01010'));
  }

  place(c, a, k, s) {
    c.leg = edgeLeg(a, k); c.s = s; c.stopT = 0; c.active = true;
    this.pickNext(c);
    legPos(c.leg, s, c);
  }
  pickNext(c) {
    const b = c.leg.b, opts = [];
    DIRS.forEach((d, k2) => {
      if (k2 === (c.leg.k + 2) % 4) return;
      const ni = b.i + d.x, nj = b.j + d.z;
      if (inGrid(ni, nj) && !this.closed.has(ekey(b.i, b.j, ni, nj))) opts.push(k2);
    });
    c.nextK = opts.length ? opts[Math.floor(Math.random() * opts.length)] : -1;
  }

  respawn(c, bus, minD = 90, maxD = 380) {
    for (let tries = 0; tries < 20; tries++) {
      const i = clamp(Math.round(bus.x / P + 4.5 + (Math.random() - 0.5) * 2 * (maxD / P)), 0, G - 1);
      const j = clamp(Math.round(bus.z / P + 4.5 + (Math.random() - 0.5) * 2 * (maxD / P)), 0, G - 1);
      const k = Math.floor(Math.random() * 4), a = nodeAt(i, j);
      if (!inGrid(i + DIRS[k].x, j + DIRS[k].z) || this.closed.has(ekey(i, j, i + DIRS[k].x, j + DIRS[k].z))) continue;
      this.place(c, a, k, 5 + Math.random() * (P - 2 * HALF - 14));
      const d = Math.hypot(c.x - bus.x, c.z - bus.z);
      if (d < minD || d > maxD * 1.3 || this.cars.some((o) => o !== c && o.active && Math.hypot(o.x - c.x, o.z - c.z) < 8)) { c.active = false; continue; }
      c.v = 0; c.desired = 8 + Math.random() * 4;
      return true;
    }
    c.active = false; return false;
  }
  leaveNode(c) { if (c.inNode != null) { const a = this.occ.get(c.inNode); if (a) a.splice(a.indexOf(c), 1); c.inNode = null; } }

  init(bus) { for (const c of this.cars) this.respawn(c, bus, 30, 450); }

  // retire les voitures d'une arête fermée
  closeEdge(key, bus) {
    this.closed.add(key);
    for (const c of this.cars) if (c.active && c.leg.key === key) { this.leaveNode(c); this.respawn(c, bus); }
  }
  openEdge(key) { this.closed.delete(key); }
  // embouteillage : ramène n voitures lointaines sur l'arête (a -> k) à faible vitesse
  gather(a, k, n, bus) {
    const far = this.cars.slice().sort((p, q) => Math.hypot(q.x - bus.x, q.z - bus.z) - Math.hypot(p.x - bus.x, p.z - bus.z)).slice(0, n);
    far.forEach((c, i) => { this.leaveNode(c); this.place(c, a, k, 8 + i * 6.5); c.v = 1; });
    this.jam.add(ekey(a.i, a.j, a.i + DIRS[k].x, a.j + DIRS[k].z));
  }

  canEnter(c, t, gapStop, bus) {
    const b = c.leg.b, kin = c.leg.k;
    if (b.type === 'signal') {
      const s = lightState(b, axisOfDir(kin), t);
      if (s === 'R') return false;
      if (s === 'Y' && gapStop > (c.v * c.v) / 6) return false;
    } else if (b.type === 'stop' && axisOfDir(kin) !== b.major && c.stopT < 1.5) return false;
    const tu = c.nextK < 0 ? 0 : turnType(kin, c.nextK);
    const clash = (ok, otu) => {
      if (ok === kin) return false;
      if (b.type === 'round') return true;
      if (ok === (kin + 2) % 4) return tu === 3 || otu === 3;
      return true;
    };
    for (const o of this.occ.get(b.idx) ?? []) if (clash(o.leg.k, turnType(o.leg.k, o.nextK))) return false;
    for (const o of bus.nodes) if (o.idx === b.idx && clash(o.k, 3)) return false;
    return true;
  }

  // ctx : { t, bus:{x,z,circles,nodes,}, peds:[{x,z}] }
  update(dt, ctx) {
    const { t, bus, peds } = ctx;
    let respawned = 0;
    this.cars.forEach((c, idx) => {
      if (!c.active) { if (respawned++ < 2) this.respawn(c, bus); return; }
      const leg = c.leg;
      // --- obstacles ---
      let gap = Infinity, gapStop = Infinity;
      if (leg.type === 'edge') {
        gapStop = leg.len - 5.5 - 2.2 - c.s;
        if (gapStop > -1) {
          if (c.v < 0.3 && gapStop < 2) c.stopT += dt; else if (gapStop >= 2) c.stopT = 0;
          if (!this.canEnter(c, t, Math.max(gapStop, 0), bus)) gap = gapStop;
        }
      }
      const hx = Math.sin(c.h), hz = Math.cos(c.h);
      const look = (ox, oz, r, wid) => {
        const dx = ox - c.x, dz = oz - c.z, f = dx * hx + dz * hz;
        if (f < 0.5 || f > 30 || Math.abs(dx * hz - dz * hx) > wid) return;
        gap = Math.min(gap, f - r - 2.2);
      };
      for (let i = 0; i < this.cars.length; i++) { const o = this.cars[i]; if (i !== idx && o.active) look(o.x, o.z, 2.1, 1.9); }
      for (const b of bus.circles) look(b.x, b.z, b.r, b.r + 1.0);
      for (const p of peds) look(p.x, p.z, 0.3, 1.6);

      let scale = 1;
      if (leg.type === 'edge' && this.jam.has(leg.key)) scale = 0.12;
      let vt = c.desired * scale;
      if (leg.type === 'turn') vt = Math.min(vt, 6);
      if (gap < Infinity) vt = Math.min(vt, Math.sqrt(2 * 3.5 * Math.max(gap - 1.2, 0)));
      c.v += clamp(vt - c.v, -6 * dt, 2.2 * dt);
      c.stuck = c.v < 0.2 ? c.stuck + dt : 0;
      c.s += c.v * dt;

      // --- fin de tronçon ---
      if (c.s >= leg.len) {
        const over = c.s - leg.len;
        if (leg.type === 'edge') {
          if (c.nextK < 0) { this.respawn(c, bus); return; }
          const tl = turnLeg(leg.b, leg.k, c.nextK);
          c.inNode = leg.b.idx;
          let a = this.occ.get(c.inNode); if (!a) this.occ.set(c.inNode, a = []);
          a.push(c);
          c.turn = tl; c.edgeLeg = leg; c.leg = Object.assign(tl, { b: leg.b, k: leg.k }); c.s = over;
        } else {
          this.leaveNode(c);
          const a = leg.b, k2 = leg.k2, d = DIRS[k2];
          if (!inGrid(a.i + d.x, a.j + d.z)) { this.respawn(c, bus); return; }
          c.leg = edgeLeg(a, k2); c.s = over; c.stopT = 0; this.pickNext(c);
        }
      }
      legPos(c.leg, c.s, c);
      if (c.stuck > 45 && Math.hypot(c.x - bus.x, c.z - bus.z) > 80) { this.leaveNode(c); this.respawn(c, bus); }
      else if (Math.hypot(c.x - bus.x, c.z - bus.z) > 450) { this.leaveNode(c); this.respawn(c, bus); }
    });
    this.render();
  }

  render() {
    const d = this.dummy;
    this.cars.forEach((c, i) => {
      const s = c.active ? 1 : 0, sn = Math.sin(c.h), cs = Math.cos(c.h);
      d.rotation.set(0, c.h, 0);
      d.position.set(c.x, 0.7, c.z); d.scale.set(s, s, s); d.updateMatrix(); this.body.setMatrixAt(i, d.matrix);
      d.position.set(c.x - sn * 0.2, 1.4, c.z - cs * 0.2); d.updateMatrix(); this.cab.setMatrixAt(i, d.matrix);
      [[0.6, 2.1, 0], [-0.6, 2.1, 0], [0.6, -2.1, 0], [-0.6, -2.1, 0]].forEach(([lx, lz], j) => {
        d.position.set(c.x + cs * lx + sn * lz, 0.75, c.z - sn * lx + cs * lz); d.updateMatrix(); this.lamps.setMatrixAt(i * 4 + j, d.matrix);
      });
    });
    this.body.instanceMatrix.needsUpdate = this.cab.instanceMatrix.needsUpdate = this.lamps.instanceMatrix.needsUpdate = true;
    this.body.instanceColor.needsUpdate = true;
  }
}
