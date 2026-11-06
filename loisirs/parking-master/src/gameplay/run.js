/* Une tentative de niveau : chrono, chocs (avertissement sous 10 km/h, niveau perdu à partir de 10 km/h), stationnement réussi, étoiles. */
import { carBox, worstContact, insideSpot } from './collision.js';
import { starsFor } from '../levels/levels.js';
import { KMH } from '../core/util.js';

export const CRASH_KMH = 10;
const PARK_SPEED = 0.25, PARK_HOLD = 0.8, WARN_COOLDOWN = 1.4;

export class Run {
  /* ev : { warn(kmh), crash(kmh), park({ time, stars }) } */
  constructor(level, phys, obstacles, ev) {
    Object.assign(this, { level, phys, obstacles, ev, state: 'ready', time: 0, hold: 0, warns: 0, cool: 0, inside: false });
  }
  get box() { const p = this.phys, d = p.d; return carBox(p.x, p.z, p.yaw, d.length * 0.49, d.width * 0.49); }
  get stars() { return starsFor(this.level, this.time); }

  update(dt, inp) {
    if (this.state === 'parked' || this.state === 'failed') { this.phys.step(dt, { throttle: 0, brake: 1, steer: 0, hand: true }); return; }
    if (this.state === 'ready' && (inp.throttle > 0 || inp.brake > 0)) this.state = 'driving';
    if (this.state === 'driving') this.time += dt;
    this.phys.step(dt, inp);
    this.cool = Math.max(0, this.cool - dt);

    for (let pass = 0; pass < 3; pass++) {            // plusieurs obstacles à la fois : on résout le plus profond d'abord
      const c = worstContact(this.box, this.obstacles);
      if (!c) break;
      const kmh = Math.abs(this.phys.v) * KMH;
      if (kmh >= CRASH_KMH || c.obj.fatal) { this.phys.push(c.nx, c.nz, c.depth); this.state = 'failed'; this.ev.crash(kmh, c.obj); return; }
      this.phys.push(c.nx, c.nz, c.depth + 0.005);
      if (this.cool === 0 && this.state === 'driving') { this.warns++; this.cool = WARN_COOLDOWN; this.ev.warn(kmh); }
    }

    this.inside = insideSpot(this.box, this.level.spot);
    if (this.inside && Math.abs(this.phys.v) < PARK_SPEED && this.state === 'driving') this.hold += dt; else this.hold = 0;
    if (this.hold >= PARK_HOLD) { this.state = 'parked'; this.ev.park({ time: this.time, stars: this.stars }); }
  }
  get progress() { return Math.min(1, this.hold / PARK_HOLD); }
}
