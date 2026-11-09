// Carrière : argent, XP, grades, améliorations, statistiques, sauvegarde localStorage.
const KEY = 'chantier-carriere.save.v2';
export const GRADES = [
  { xp: 0, name: 'Manœuvre' }, { xp: 200, name: 'Conducteur d\'engins' }, { xp: 600, name: 'Conducteur confirmé' },
  { xp: 1400, name: 'Chef de poste' }, { xp: 3000, name: 'Chef de carrière' }, { xp: 6000, name: 'Directeur' },
];
export const UPGRADES = {
  bucket: { name: 'Godets plus grands', desc: '+20 % de capacité pour la chargeuse et la pelle.', price: 900, max: 3, grade: 0 },
  engine: { name: 'Moteurs renforcés', desc: '+10 % de vitesse et de puissance, tous engins.', price: 1200, max: 3, grade: 1 },
  tank: { name: 'Réservoirs étendus', desc: '+25 % de carburant embarqué.', price: 700, max: 2, grade: 0 },
  crusher: { name: 'Concasseur 2e étage', desc: '+30 % de débit du concasseur.', price: 2500, max: 3, grade: 2 },
  tires: { name: 'Pneus de carrière', desc: 'Les chocs abîment 30 % de moins les engins.', price: 1500, max: 1, grade: 1 },
};
export const PRICES = { gravel: 14, rock: 5, fuel: 1.25, blast: 250, repairPerPoint: 900 };   // € par tonne / litre / tir / 100 % de dégâts
const defaults = () => ({ money: 1500, xp: 0, sold: 0, soldMoney: 0, orders: 0, trucks: 0, blasts: 0, crushed: 0, up: { bucket: 0, engine: 0, tank: 0, crusher: 0, tires: 0 }, machines: null, orderList: null, hours: 7, tuto: false });

export class Economy {
  constructor(storage = globalThis.localStorage) {
    this.storage = storage;
    let d = null;
    try { d = JSON.parse(storage?.getItem(KEY)); } catch { /* stockage indisponible */ }
    this.d = { ...defaults(), ...(d ?? {}) };
    this.d.up = { ...defaults().up, ...this.d.up };
    this.onGrade = () => {};
  }
  get gradeIndex() { let g = 0; GRADES.forEach((x, i) => { if (this.d.xp >= x.xp) g = i; }); return g; }
  get grade() { return GRADES[this.gradeIndex].name; }
  xpProgress() { const g = this.gradeIndex, a = GRADES[g].xp, b = GRADES[g + 1]?.xp; return b === undefined ? 1 : (this.d.xp - a) / (b - a); }
  addMoney(v) { this.d.money += v; }
  spend(v) { if (this.d.money < v) return false; this.d.money -= v; return true; }
  addXp(v) { const before = this.gradeIndex; this.d.xp += v; if (this.gradeIndex > before) this.onGrade(this.grade); }
  mult(id, per) { return 1 + per * this.d.up[id]; }
  buy(id) {
    const u = UPGRADES[id], n = this.d.up[id];
    if (n >= u.max) return 'Déjà au maximum';
    if (this.gradeIndex < u.grade) return `Grade requis : ${GRADES[u.grade].name}`;
    if (this.d.money < u.price * (n + 1)) return 'Fonds insuffisants';
    this.d.money -= u.price * (n + 1); this.d.up[id]++; this.save(); return null;
  }
  price(id) { return UPGRADES[id].price * (this.d.up[id] + 1); }
  save() { try { this.storage?.setItem(KEY, JSON.stringify(this.d)); } catch { /* ignore */ } }
  reset() { try { this.storage?.removeItem(KEY); this.storage?.removeItem(KEY + '.terrain'); } catch { /* ignore */ } this.d = defaults(); }
}
