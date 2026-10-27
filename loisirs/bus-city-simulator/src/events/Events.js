// Événements aléatoires pendant le service : PMR, embouteillage, déviation, panne.
import * as THREE from 'three';
import { DIRS, rightOf, ekey, nodeAt } from '../city/grid.js';

export class Events {
  constructor(game) {
    this.g = game; this.timer = 45; this.current = null; this.closed = [];   // closed : arêtes barrées {ax,az,bx,bz}
    this.group = new THREE.Group(); game.scene.add(this.group);
  }
  get label() { return this.current ? this.current.label : ''; }

  update(dt) {
    const g = this.g, s = g.service;
    if (this.current) {
      const c = this.current;
      c.left -= dt;
      if (c.type === 'breakdown' && c.left <= 0) { g.vehicle.phys.canDrive = true; g.toast('Moteur redémarré', 'ok'); this.end(); }
      else if ((c.type === 'jam' || c.type === 'detour') && c.left <= 0) { this.end(); }
      else if (c.type === 'pmr' && !s.pmr) this.end();
      return;
    }
    if (!s.active || s.srv) return;
    this.timer -= dt;
    if (this.timer > 0) return;
    this.timer = 60 + Math.random() * 50;
    const pick = ['pmr', 'jam', 'detour', 'breakdown'][Math.floor(Math.random() * 4)];
    this[pick]();
  }

  end() {
    const c = this.current;
    if (!c) return;
    if (c.type === 'jam') this.g.traffic.jam.delete(c.key);
    if (c.type === 'detour') {
      this.g.traffic.openEdge(c.key);
      for (const m of c.meshes) this.group.remove(m);
      for (const o of c.circles) this.g.city.col.dynamic.splice(this.g.city.col.dynamic.indexOf(o), 1);
      this.closed = [];
      this.g.toast('Route rouverte', 'ok');
    }
    this.current = null;
  }

  // arête de la ligne à l'indice e (modulo) : { a, b, k }
  edge(e) {
    const path = this.g.service.line.path, E = path.length;
    const a = path[((e % E) + E) % E], b = path[(((e + 1) % E) + E) % E];
    return { a: nodeAt(a.i, a.j), b: nodeAt(b.i, b.j), k: DIRS.findIndex((d) => d.x === Math.sign(b.i - a.i) && d.z === Math.sign(b.j - a.j)) };
  }

  pmr() {
    const s = this.g.service, stop = s.stop;
    s.pmr = { line: stop.line, k: stop.k };
    this.current = { type: 'pmr', left: 1e9, label: 'PMR' };
    this.g.toast(`Un passager PMR attend à l'arrêt « ${stop.name} » : rampe (R) une fois les portes ouvertes`, 'info');
  }

  jam() {
    const s = this.g.service, e = this.edge(s.stop.edgeIndex + 1), key = ekey(e.a.i, e.a.j, e.b.i, e.b.j);
    this.g.traffic.gather(e.a, e.k, 9, this.g.vehicle.phys);
    this.current = { type: 'jam', left: 80, key, label: 'Embouteillage' };
    this.g.toast('Embouteillage signalé sur votre parcours, après le prochain arrêt', 'warn');
  }

  detour() {
    const g = this.g, s = g.service;
    const stopEdges = new Set(s.line.stops.map((x) => x.edgeIndex));
    let idx = s.stop.edgeIndex + 1;
    for (let t = 0; t < 4 && stopEdges.has(((idx % s.line.path.length) + s.line.path.length) % s.line.path.length); t++) idx++;
    const e = this.edge(idx), key = ekey(e.a.i, e.a.j, e.b.i, e.b.j), d = DIRS[e.k], r = rightOf(d);
    const mx = (e.a.x + e.b.x) / 2, mz = (e.a.z + e.b.z) / 2, meshes = [], circles = [];
    const bm = new THREE.MeshStandardMaterial({ color: '#e0401c' });
    for (const o of [-3, 3]) {
      const m = new THREE.Mesh(new THREE.BoxGeometry(5.8, 1, 0.4), bm);
      m.position.set(mx + r.x * o, 0.5, mz + r.z * o);
      m.rotation.y = Math.atan2(r.x, r.z); m.castShadow = true;
      this.group.add(m); meshes.push(m);
      const c = { t: 1, x: m.position.x, z: m.position.z, r: 3.1, tag: 'barrier' };
      g.city.col.dynamic.push(c); circles.push(c);
    }
    g.traffic.closeEdge(key, g.vehicle.phys);
    this.closed = [{ ax: e.a.x, az: e.a.z, bx: e.b.x, bz: e.b.z }];
    s.extra += 60;
    this.current = { type: 'detour', left: 150, key, meshes, circles, label: 'Déviation' };
    g.toast('Déviation : route barrée après le prochain arrêt. Contournez par une rue voisine (+60 s de tolérance)', 'warn');
  }

  breakdown() {
    const g = this.g;
    if (Math.abs(g.vehicle.phys.speed) < 0.1) return;
    g.vehicle.phys.canDrive = false;
    g.service.sat(-5);
    this.current = { type: 'breakdown', left: 18, label: 'Panne moteur' };
    g.toast('Panne moteur ! Immobilisez-vous, le dépannage prend 18 s', 'bad');
    g.audio.beep(180, 0.5, 'sawtooth');
  }
}
