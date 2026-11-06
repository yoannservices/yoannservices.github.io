/* PNJ : voitures qui roulent en suivant un chemin (elles s'arrêtent devant un obstacle) et piétons qui marchent (ils s'arrêtent quand la voiture
   approche). Chaque PNJ est un obstacle mobile : voiture = rectangle, piéton = cercle « fatal » (le toucher fait perdre le niveau). */
import * as THREE from 'three';
import { loadGLB, bakeParts } from '../../../../assets/glb.js';
import { box } from '../gameplay/collision.js';
import { carKit } from './kit.js';

const _m = new THREE.Matrix4(), _q = new THREE.Quaternion(), _e = new THREE.Euler(), _p = new THREE.Vector3(), _s = new THREE.Vector3(1, 1, 1), _c = new THREE.Color();

function pathData(pts, closed) {
  const p = closed ? [...pts, pts[0]] : pts, cum = [0];
  for (let i = 1; i < p.length; i++) cum.push(cum[i - 1] + Math.hypot(p[i][0] - p[i - 1][0], p[i][1] - p[i - 1][1]));
  return { p, cum, total: cum[cum.length - 1] };
}
function sample(pd, s) {
  s = Math.max(0, Math.min(pd.total - 1e-6, s));
  let i = 1; while (i < pd.cum.length - 1 && pd.cum[i] < s) i++;
  const a = pd.p[i - 1], b = pd.p[i], t = (s - pd.cum[i - 1]) / ((pd.cum[i] - pd.cum[i - 1]) || 1);
  return { x: a[0] + (b[0] - a[0]) * t, z: a[1] + (b[1] - a[1]) * t, yaw: Math.atan2(b[0] - a[0], b[1] - a[1]) };
}
const approach = (v, t, d) => (v < t ? Math.min(v + d, t) : Math.max(v - d, t));

export class NPCs {
  constructor(scene) { this.scene = scene; this.cars = []; this.peds = []; this.colliders = []; this.t = 0; }

  /* defs : [{ type, path: [[x, z], ...], closed?, speed (m/s), start (0..1), color }] ; chemin ouvert = la voiture réapparaît au départ */
  async addCars(defs) {
    const by = {};
    for (const d of defs) {
      const kit = await carKit(d.type), pd = pathData(d.path, d.closed);
      const car = { d, pd, kit, s: (d.start || 0) * pd.total, v: 0, hx: kit.size.x * 0.49, hz: kit.size.z * 0.49 };
      car.col = box(0, 0, car.hx, car.hz, 0); car.col.dyn = true; this.colliders.push(car.col);
      this.cars.push(car); (by[d.type] = by[d.type] || []).push(car);
    }
    for (const type of Object.keys(by)) {
      const list = by[type];
      const meshes = list[0].kit.parts.map((part) => {
        const body = /body/i.test(part.mat.name || ''), im = new THREE.InstancedMesh(part.geo, part.mat, list.length);
        list.forEach((c, i) => im.setColorAt(i, body && c.d.color != null ? _c.set(c.d.color) : _c.set(0xffffff)));
        im.castShadow = true; im.frustumCulled = false; this.scene.add(im); return im;
      });
      list.forEach((c, i) => { c.i = i; c.meshes = meshes; });
    }
  }

  /* defs : [{ path, speed (m/s), start (0..1), tint }] ; les piétons font des allers-retours */
  async addPeds(defs) {
    if (!defs.length) return;
    if (!this.kit) {
      const url = new URL('../../../../assets/models/proportional_low_poly_man__free_download.glb', import.meta.url).href;
      this.kit = bakeParts((await loadGLB(url)), 1.75 / 5.75);
      this.pedMeshes = this.kit.parts.map((part) => { const im = new THREE.InstancedMesh(part.geo, part.mat, 64); im.count = 0; im.castShadow = true; im.frustumCulled = false; this.scene.add(im); return im; });
    }
    for (const d of defs) {
      const pd = pathData(d.path, false), ped = { d, pd, s: (d.start || 0) * pd.total, dir: 1, v: 0, col: { k: 'circle', x: 0, z: 0, r: 0.38, fatal: true, ped: true, dyn: true }, ph: Math.random() * 6 };
      this.colliders.push(ped.col); this.peds.push(ped);
    }
    this.pedMeshes.forEach((im) => { im.count = this.peds.length; });
    this.peds.forEach((p, i) => { const tint = p.d.tint ?? [0xd9a066, 0x6b8fc4, 0xc46b6b, 0x8fb86b, 0xe0d6b0, 0x7a6ba8][i % 6]; for (const im of this.pedMeshes) im.setColorAt(i, _c.set(tint)); });
    this.pedMeshes.forEach((im) => { im.instanceColor.needsUpdate = true; });
  }

  /* pl : { x, z, v, yaw } de la voiture du joueur */
  update(dt, pl) {
    this.t += dt;
    for (const c of this.cars) {
      const pos = sample(c.pd, c.s), fx = Math.sin(pos.yaw), fz = Math.cos(pos.yaw), stop = 2.2 + c.v * 1.3 + c.hz;
      let go = c.d.speed;
      const test = (x, z, hx) => { const dx = x - pos.x, dz = z - pos.z, ahead = dx * fx + dz * fz, lat = Math.abs(dx * fz - dz * fx); return ahead > 0.2 && ahead < stop + hx && lat < c.hx + 0.8 + hx; };
      if (test(pl.x, pl.z, 1.5)) go = 0;
      if (go) for (const o of this.cars) if (o !== c) { const q = sample(o.pd, o.s); if (test(q.x, q.z, o.hz)) { go = 0; break; } }
      if (go) for (const p of this.peds) { const q = sample(p.pd, p.s); if (test(q.x, q.z, 0.6)) { go = 0; break; } }
      c.v = approach(c.v, go, (go < c.v ? 6 : 2.2) * dt);
      c.s += c.v * dt;
      if (c.s >= c.pd.total) c.s = c.d.closed ? c.s - c.pd.total : 0;
      const q = sample(c.pd, c.s);
      c.x = q.x; c.z = q.z; c.yaw = q.yaw;
      Object.assign(c.col, { x: q.x, z: q.z, c: Math.cos(-q.yaw), s: Math.sin(-q.yaw) });
      _q.setFromEuler(_e.set(0, q.yaw, 0)); _m.compose(_p.set(q.x, 0, q.z), _q, _s);
      for (const im of c.meshes) { im.setMatrixAt(c.i, _m); im.instanceMatrix.needsUpdate = true; }
    }
    this.peds.forEach((p, i) => {
      const pos = sample(p.pd, p.s), yw = p.dir > 0 ? pos.yaw : pos.yaw + Math.PI, fx = Math.sin(yw), fz = Math.cos(yw);
      // le piéton attend si la voiture est devant lui sur son chemin (ou lui fonce dessus de près) ; une voiture arrêtée derrière lui ne le bloque pas
      const hit = (x, z, v, dmax) => { const dx = x - pos.x, dz = z - pos.z, ahead = dx * fx + dz * fz, lat = Math.abs(dx * fz - dz * fx), dist = Math.hypot(dx, dz); return (ahead > 0 && lat < 2.4 && dist < dmax) || (dist < 3.2 && Math.abs(v) > 0.3); };
      let wait = hit(pl.x, pl.z, pl.v, 5.2);
      if (!wait) for (const c of this.cars) if (hit(c.x, c.z, c.v, 4.2)) { wait = true; break; }
      p.v = approach(p.v, wait ? 0 : p.d.speed || 1.15, 3 * dt);
      p.s += p.v * dt * p.dir;
      if (p.s > p.pd.total) { p.s = p.pd.total; p.dir = -1; } else if (p.s < 0) { p.s = 0; p.dir = 1; }
      const q = sample(p.pd, p.s), yaw = p.dir > 0 ? q.yaw : q.yaw + Math.PI, bob = Math.abs(Math.sin(this.t * 7 + p.ph)) * 0.035 * Math.min(1, p.v);
      p.col.x = q.x; p.col.z = q.z;
      _q.setFromEuler(_e.set(0, yaw, Math.sin(this.t * 7 + p.ph) * 0.05 * Math.min(1, p.v))); _m.compose(_p.set(q.x, bob, q.z), _q, _s);
      for (const im of this.pedMeshes) { im.setMatrixAt(i, _m); im.instanceMatrix.needsUpdate = true; }
    });
  }
}

/* Raccourci pour un décor : crée les PNJ, ajoute leurs obstacles, renvoie la fonction de mise à jour. */
export async function makeNpcs(scene, colliders, { cars = [], peds = [] } = {}) {
  const n = new NPCs(scene);
  await n.addCars(cars); await n.addPeds(peds);
  colliders.push(...n.colliders);
  n.update(0.001, { x: 1e5, z: 1e5, v: 0 });
  return (dt, pl) => n.update(dt, pl);
}
