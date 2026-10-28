/* Réputation : points de figures, sauts, vitesse, lignes risquées ; combos qui se cumulent puis se valident ;
   un crash fait perdre le combo en cours. */
export class Score {
  constructor(diffMult = 1) { this.mult0 = diffMult; this.banked = 0; this.combo = { pts: 0, n: 0, t: 0, names: [] }; this.longest = 0; this.bestCombo = 0; this.tricksLanded = new Set(); this.riskyJumps = 0; this.log = []; }
  get mult() { return 1 + 0.5 * this.combo.n; }
  get total() { return Math.round(this.banked + this.combo.pts * this.mult); }

  /* saut réussi : figures validées, qualité de réception, durée et distance */
  landed(tr, e, onRisky) {
    if (e.micro) return null;
    const q = { perfect: 1.5, clean: 1, sketchy: 0.5 }[e.quality] ?? 0;
    const airBonus = 1 + Math.min(e.airT, 3) * 0.4, risk = onRisky ? 1.6 : 1;
    let pts = tr.pts * airBonus * q * risk, extra = 0;
    if (e.dist > 6) extra += e.dist * 6 * q * risk;
    if (e.airT > 0.6 && !tr.names.length) extra += e.airT * 40 * q;            // simple saut propre
    pts += extra; pts = Math.round(pts * this.mult0);
    tr.names.forEach((n) => this.tricksLanded.add(n.replace(/x\d+$/, '')));
    if (pts <= 0) return null;
    this.combo.pts += pts; this.combo.n += tr.names.length || 1; this.combo.t = 3.2; this.combo.names.push(...tr.names);
    if (e.dist > this.longest) this.longest = e.dist; if (onRisky) this.riskyJumps++;
    this.bestCombo = Math.max(this.bestCombo, Math.round(this.combo.pts * this.mult));
    return { pts, total: Math.round(this.combo.pts * this.mult), q: e.quality };
  }
  /* gains continus : vitesse, manual, rail, ligne risquée */
  tick(dt, { speed, manual, rail, risky, grounded }) {
    let g = 0;
    if (grounded && speed > 14) g += (speed - 14) * 1.6 * dt;
    if (manual) g += 12 * dt; if (rail) g += 24 * dt; if (risky && grounded) g += 8 * dt;
    if (g) this.combo.pts += g * this.mult0; // alimente le combo sans le prolonger
    if (this.combo.n > 0) { this.combo.t -= dt; if (this.combo.t <= 0) this.bank(); } else if (this.combo.pts > 0) { this.combo.t -= dt; if (this.combo.t <= -2) this.bank(); }
  }
  bank() { const v = Math.round(this.combo.pts * this.mult); this.banked += v; this.combo = { pts: 0, n: 0, t: 0, names: [] }; return v; }
  /* crash : le combo en cours est perdu en mode run, validé en mode libre */
  crash(keep) { const lost = Math.round(this.combo.pts * this.mult); if (keep) this.bank(); else this.combo = { pts: 0, n: 0, t: 0, names: [] }; return lost; }
}
