/* Une descente : mode run (vies limitées, un crash en coûte une, fin de run = résultats) ou mode libre (sans pression). */
export class Run {
  constructor(mode, diff) {
    this.mode = mode; this.maxLives = mode === 'run' ? diff.lives : Infinity; this.lives = this.maxLives;
    this.time = 0; this.started = false; this.crashes = 0; this.over = false; this.finished = false; this.respawns = 0;
  }
  get free() { return this.mode === 'free'; }
  tick(dt, moving) { if (!this.started && moving) this.started = true; if (this.started && !this.over && !this.finished) this.time += dt; }
  /* renvoie true quand la run est terminée (plus de vies) */
  crash() { this.crashes++; if (!this.free) { this.lives--; if (this.lives <= 0) { this.over = true; return true; } } return false; }
  finish() { this.finished = true; }
}
