// Code de la route : vitesse, feux rouges, stops, piétons, collisions → amendes.
import { P, HALF, nodeAt, G, SPEED_LIMIT, zoneAt, axisOfDir, dirFromHeading } from '../city/grid.js';
import { lightState } from '../city/TrafficLights.js';

export class Rules {
  constructor(game) {
    this.g = game; this.cool = { speed: 0, hit: 0 }; this.slow = -1; this.insideNode = -1; this.limit = 50;
  }
  update(dt) {
    const g = this.g, p = g.vehicle.phys, t = g.time;
    for (const k in this.cool) this.cool[k] = Math.max(0, this.cool[k] - dt);
    const kmh = Math.abs(p.speed) * 3.6;
    this.limit = SPEED_LIMIT[zoneAt(p.x, p.z)];
    if (kmh > this.limit + 10 && !this.cool.speed) {
      g.fine(45 + Math.round(kmh - this.limit - 10) * 2, `Excès de vitesse : ${Math.round(kmh)} km/h pour ${this.limit}`, 4);
      this.cool.speed = 10;
    }
    const r = p.refPoint();
    const i = Math.min(G - 1, Math.max(0, Math.round(r.x / P + 4.5))), j = Math.min(G - 1, Math.max(0, Math.round(r.z / P + 4.5)));
    const n = nodeAt(i, j), inside = Math.abs(r.x - n.x) < HALF && Math.abs(r.z - n.z) < HALF;
    if (!inside && Math.hypot(r.x - n.x, r.z - n.z) < 22 && Math.abs(p.speed) < 1.5) this.slow = n.idx;
    if (inside && this.insideNode !== n.idx && Math.abs(p.speed) > 1) {
      const axis = axisOfDir(dirFromHeading(p.heading));
      if (n.type === 'signal' && lightState(n, axis, t) === 'R') g.fine(135, 'Feu rouge grillé', 12);
      else if (n.type === 'stop' && axis !== n.major && this.slow !== n.idx) g.fine(90, 'Stop non marqué', 6);
    }
    this.insideNode = inside ? n.idx : -1;

    // piétons : cercles du bus contre piétons en train de traverser
    const circles = g.busCircles;
    for (const ped of g.peds.crossing) for (const c of circles) {
      if (Math.hypot(ped.x - c.x, ped.z - c.z) < c.r + 0.3) {
        g.fine(500, 'Piéton percuté !', 30); g.peds.remove(ped); g.audio.thud(); break;
      }
    }
  }
  collision(impact) {
    if (impact < 1.2 || this.cool.hit) return;
    this.cool.hit = 2.5;
    this.g.audio.thud();
    if (impact > 2.5) this.g.fine(100 + Math.round(impact * 25), 'Collision', Math.min(25, impact * 3));
  }
}
