// Camions clients (IA) : arrivent par la route à l'ouest, se placent au chargement, attendent d'être remplis par la chargeuse,
// passent à la pesée puis repartent vers le nord. Chaque camion livre la plus ancienne commande non terminée.
import { Machine, SPECS } from '../machines/Machine.js';
import { tonnes } from '../core/terrain.js';
import { ZONES } from './Site.js';

const ROAD_X = ZONES.bay.x;
export class Customers {
  constructor(world, orders, onSale, onSpawn, onLeave) { this.w = world; this.orders = orders; this.onSale = onSale; this.onSpawn = onSpawn; this.onLeave = onLeave; this.list = []; this.timer = 25; this.max = 2; }
  spawn() {
    const m = new Machine(SPECS.truck, ROAD_X, 80, Math.PI); m.ai = true; m.fuel = 1e9; m.speed = 6;
    const t = { m, phase: 'arrive', timer: 0, patience: 300, order: this.orders.pick(), pay: 0 };
    this.list.push(t); this.w.machines.push(m); this.onSpawn?.(m);
    return t;
  }
  ahead(t) { return this.list.filter((o) => o !== t && o.phase !== 'leave' && this.list.indexOf(o) < this.list.indexOf(t)).length; }
  update(dt, mods) {
    this.timer -= dt;
    if (this.timer <= 0) { this.timer = 70 + Math.random() * 50; if (this.orders.pick() && this.list.length < this.max) this.spawn(); }
    for (const t of [...this.list]) {
      const m = t.m, stopZ = ZONES.bay.z + 13 * this.ahead(t);
      if (t.phase === 'arrive') {
        const gap = m.z - stopZ, v = Math.min(7, Math.sqrt(2 * 2.2 * Math.max(0, gap)));
        m.speed += Math.max(-4 * dt, Math.min(2 * dt, v - m.speed)); m.z -= m.speed * dt;
        if (gap < 0.2 && m.speed < 0.4) { m.speed = 0; m.z = stopZ; t.phase = 'load'; t.order = this.orders.pick(); }
      } else if (t.phase === 'load') {
        if (m.z > ZONES.bay.z + 0.5 && this.ahead(t) === 0) { t.phase = 'arrive'; continue; }   // la file avance
        t.patience -= dt;
        if (m.cargo.vol >= m.capacity(mods) * 0.93 || t.patience <= 0) { t.phase = 'weigh'; t.timer = 4; }
      } else if (t.phase === 'weigh') {
        t.timer -= dt;
        if (t.timer <= 0) {
          const vol = m.cargo.vol, tn = tonnes(vol, m.cargo.g);
          this.onSale(t, tn, vol > 0.3 ? this.orders.deliver(t.order, tn) : { pay: 0, finished: false, bonus: 0 });
          m.cargo = { vol: 0, g: 0 }; m.tool.bed = 0; t.phase = 'leave';
        }
      } else {
        m.speed = Math.min(10, m.speed + 1.8 * dt); m.z -= m.speed * dt;
        if (m.z < -80) { this.list = this.list.filter((o) => o !== t); this.w.machines = this.w.machines.filter((o) => o !== m); this.onLeave?.(m); }
      }
      m.x = ROAD_X; m.h = Math.PI; m.y = this.w.terrain.height(m.x, m.z); m.pitch = 0; m.roll = 0;
    }
  }
}
