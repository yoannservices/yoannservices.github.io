/* Détection des figures en l'air à partir des rotations accumulées par la physique. */
const TWO_PI = Math.PI * 2;
export const TRICK_POINTS = { Frontflip: 350, Backflip: 400, '180': 120, '360': 300, '540': 500, '720': 900, Tabletop: 250, 'No-hander': 150, Superman: 350, Barspin: 250, Whip: 120 };

export class Tricks {
  constructor() { this.reset(); }
  reset() { this.done = new Map(); this.hold = { table: 0, nohand: 0, superman: 0, whip: 0 }; this.flips = 0; this.spinHalf = 0; this.barTurns = 0; }

  /* appelé à chaque pas en l'air ; renvoie les figures nouvellement validées (pour l'affichage) */
  update(bike, dt) {
    const A = bike.air, out = [], add = (name, n = 1) => { const key = name + (n > 1 ? 'x' + n : ''); if (!this.done.has(key)) { const pts = TRICK_POINTS[name] * n * (n > 1 ? 1.25 : 1); this.done.set(key, pts); out.push({ name: n > 1 ? `${n === 2 ? 'Double ' : n === 3 ? 'Triple ' : n + 'x '}${name}` : name, pts }); } };
    const fl = Math.floor((Math.abs(A.flip) + 0.35) / TWO_PI);
    if (fl > this.flips) { this.flips = fl; this.done.forEach((_, k) => { if (/^(Front|Back)flip/.test(k)) this.done.delete(k); }); add(A.flip > 0 ? 'Frontflip' : 'Backflip', fl); }
    const half = Math.floor((Math.abs(A.spin) + 0.35) / Math.PI);
    if (half > this.spinHalf) {
      this.spinHalf = half; for (const k of ['180', '360', '540', '720']) this.done.delete(k);
      const deg = half * 180; add(deg >= 720 ? '720' : deg >= 540 ? '540' : deg >= 360 ? '360' : '180');
    }
    const bt = Math.floor((Math.abs(A.barA) + 0.55) / TWO_PI); if (bt > this.barTurns) { this.barTurns = bt; add('Barspin', bt); }
    this.hold.table = A.tableA > 1.2 ? this.hold.table + dt : 0; if (this.hold.table > 0.25) add('Tabletop');
    this.hold.nohand = A.hands > 0.9 && !A.superman ? this.hold.nohand + dt : 0; if (this.hold.nohand > 0.4) add('No-hander');
    this.hold.superman = A.legs > 0.8 ? this.hold.superman + dt : 0; if (this.hold.superman > 0.3) add('Superman');
    this.hold.whip = Math.abs(A.whipA) > 0.8 ? this.hold.whip + dt : 0; if (this.hold.whip > 0.2) add('Whip');
    return out;
  }
  /* figures et points de base du saut en cours */
  total() { let pts = 0; this.done.forEach((v) => { pts += v; }); return { pts, names: [...this.done.keys()] }; }
}
