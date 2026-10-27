
/**
 * Score et combo, sans dépendance de rendu.
 * Les points gagnés restent "en jeu" (pending) pendant la chaîne : ils sont validés (banked)
 * quand la chaîne s'arrête en retrouvant l'adhérence, et validés aussi sur un choc, mais le combo repart de zéro.
 * emit({ text, kind }) sert aux messages à l'écran.
 */
class Score {
  constructor(cfg = SCORE, emit = () => {}) {
    this.cfg = cfg;
    this.emit = emit;
    this.reset();
  }

  reset() {
    this.banked = 0;
    this.pending = 0;
    this.combo = 1;
    this.chain = 0;       // s de glisse enchaînée (donne le combo)
    this.grace = 0;       // s écoulées hors glisse
    this.stats = { driftTime: 0, maxCombo: 1, bestAngle: 0, collisions: 0, nearMisses: 0 };
  }

  get inGrace() {
    return this.combo > 1 && this.grace > 0;
  }

  update(dt, car) {
    const c = this.cfg;
    if (car.drifting) {
      this.grace = 0;
      this.chain += dt;
      this.combo = Math.min(1 + c.comboRise * this.chain, c.comboMax);
      const angle = Math.abs(car.driftAngle) * 57.2958;
      this.pending += angle * car.speed * c.pointsK * this.combo * dt;
      this.stats.driftTime += dt;
      this.stats.maxCombo = Math.max(this.stats.maxCombo, this.combo);
      this.stats.bestAngle = Math.max(this.stats.bestAngle, angle);
    } else if (this.combo > 1 || this.pending > 0) {
      this.grace += dt;
      if (this.grace > c.graceTime) this.bank();
    }
  }

  onEvent(e) {
    const c = this.cfg;
    if (e.type === 'impact' && e.obstacle.comboBreak !== false && e.speed > c.comboBreakSpeed) {
      this.stats.collisions++;
      this.bank('CHOC');
    } else if (e.type === 'near' && e.speed > c.nearMinSpeed) {
      const gain = Math.round((c.nearBonus + e.speed * c.nearSpeedK) * this.combo);
      this.pending += gain;
      this.chain += c.nearComboBoost / c.comboRise;
      this.combo = Math.min(1 + c.comboRise * this.chain, c.comboMax);
      this.stats.nearMisses++;
      this.emit({ text: `FRÔLÉ +${gain}`, kind: 'near' });
    }
  }

  /** Valide la chaîne en cours (retour en adhérence, choc, fin de partie). reason : texte du message (choc). */
  bank(reason) {
    if (this.pending >= 1) this.emit({ text: `${reason ? reason + '  ' : ''}+${Math.round(this.pending).toLocaleString('fr-FR')}`, kind: reason ? 'lost' : 'bank' });
    this.banked += this.pending;
    this.reset_chain();
  }

  reset_chain() {
    this.pending = 0;
    this.combo = 1;
    this.chain = 0;
    this.grace = 0;
  }

  get total() {
    return this.banked;
  }
}
