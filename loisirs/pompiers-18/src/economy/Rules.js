// Code de la route du FPT (adapté de bus-city-simulator) : sirène et gyrophares allumés = véhicule prioritaire,
// il peut franchir un feu rouge ou dépasser la limite avec prudence, sans infraction. Les chocs comptent toujours.
import { P, HALF, nodeAt, G, SPEED_LIMIT, zoneAt, axisOfDir, dirFromHeading } from '../city/grid.js';
import { lightState } from '../city/TrafficLights.js';
import { ruleFine } from './fines.js';

export class Rules {
  constructor(game) { this.g = game; this.cool = { speed: 0, hit: 0 }; this.slow = -1; this.insideNode = -1; this.limit = 50; }

  update(dt) {
    const g = this.g, tr = g.driving ?? g.truck, p = tr.phys, t = g.time, siren = tr.siren;
    for (const k in this.cool) this.cool[k] = Math.max(0, this.cool[k] - dt);
    const kmh = Math.abs(p.speed) * 3.6;
    this.limit = SPEED_LIMIT[zoneAt(p.x, p.z)];
    const sp = ruleFine('speed', { siren, kmh, limit: this.limit });
    if (sp && !this.cool.speed) { g.infraction(sp, `Excès de vitesse sans sirène : ${Math.round(kmh)} km/h pour ${this.limit}`); this.cool.speed = 10; }
    const r = p.refPoint();
    const i = Math.min(G - 1, Math.max(0, Math.round(r.x / P + 4.5))), j = Math.min(G - 1, Math.max(0, Math.round(r.z / P + 4.5)));
    const n = nodeAt(i, j), inside = Math.abs(r.x - n.x) < HALF && Math.abs(r.z - n.z) < HALF;
    if (!inside && Math.hypot(r.x - n.x, r.z - n.z) < 22 && Math.abs(p.speed) < 1.5) this.slow = n.idx;
    if (inside && this.insideNode !== n.idx && Math.abs(p.speed) > 1) {
      const axis = axisOfDir(dirFromHeading(p.heading));
      if (n.type === 'signal' && lightState(n, axis, t) === 'R') {
        const f = ruleFine('red', { siren });
        if (f) g.infraction(f, 'Feu rouge grillé sans sirène');
        else if (kmh > 30) g.toast('Feu rouge franchi trop vite : ralentis aux carrefours, même en urgence', 'warn');
      } else if (n.type === 'stop' && axis !== n.major && this.slow !== n.idx) {
        const f = ruleFine('stop', { siren });
        if (f) g.infraction(f, 'Stop non marqué');
      }
    }
    this.insideNode = inside ? n.idx : -1;
  }

  collision(impact) {
    if (impact < 1.2 || this.cool.hit) return;
    this.cool.hit = 2.5;
    this.g.audio.thud();
    if (impact > 2.5) this.g.infraction(ruleFine('collision'), 'Collision avec le FPT');
  }
}
