/* Points de contrôle : le dernier franchi sert à la réapparition (touche R ou après un crash). */
export class Checkpoints {
  constructor(track) { this.track = track; this.reset(); }
  reset() { this.idx = -1; this.point = this.track.start; }
  update(s) {
    const cps = this.track.checkpoints;
    while (this.idx + 1 < cps.length && s >= cps[this.idx + 1].s) { this.idx++; this.point = cps[this.idx]; this.justPassed = true; }
  }
  /* true une seule fois par point franchi */
  consumePassed() { const p = this.justPassed; this.justPassed = false; return p; }
}
