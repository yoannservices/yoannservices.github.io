// Carrière : argent, XP, grades, améliorations, sauvegarde localStorage (structure reprise de bus-city-simulator).
const KEY = 'pompiers18.save.v1';
export const GRADES = [
  { xp: 0, name: 'Sapeur 2e classe' }, { xp: 150, name: 'Sapeur 1re classe' }, { xp: 400, name: 'Caporal' },
  { xp: 800, name: 'Caporal-chef' }, { xp: 1400, name: 'Sergent' }, { xp: 2200, name: 'Adjudant' },
];
export const UPGRADES = {
  hose: { name: 'Tuyau de 20 m en plus', desc: 'Établissements plus longs (60 m de base).', price: 300, max: 3, grade: 0 },
  ari: { name: 'Bouteille ARI 9 L', desc: '50 % d\'air en plus pour l\'attaque intérieure.', price: 500, max: 1, grade: 1 },
  ldv: { name: 'Lance LDV 1000', desc: 'Jet droit à 1 000 L/min : éteint plus vite, vide la citerne plus vite.', price: 800, max: 1, grade: 2 },
};

const defaults = () => ({ money: 500, xp: 0, missions: 0, saved: 0, fines: 0, up: { hose: 0, ari: 0, ldv: 0 }, best: null });

export class Economy {
  constructor() {
    let d = null;
    try { d = JSON.parse(localStorage.getItem(KEY)); } catch { /* stockage indisponible */ }
    this.d = { ...defaults(), ...(d ?? {}) };
    this.d.up = { ...defaults().up, ...this.d.up };
    this.onGrade = () => {};
  }
  get gradeIndex() { let g = 0; GRADES.forEach((x, i) => { if (this.d.xp >= x.xp) g = i; }); return g; }
  get grade() { return GRADES[this.gradeIndex].name; }
  xpProgress() {
    const g = this.gradeIndex, a = GRADES[g].xp, b = GRADES[g + 1]?.xp;
    return b === undefined ? 1 : (this.d.xp - a) / (b - a);
  }
  addMoney(v) { this.d.money += v; }
  addXp(v) { const before = this.gradeIndex; this.d.xp += v; if (this.gradeIndex > before) this.onGrade(this.grade); }
  hoseMax() { return 60 + 20 * this.d.up.hose; }
  buy(id) {
    const u = UPGRADES[id], n = this.d.up[id];
    if (n >= u.max) return 'Déjà au maximum';
    if (this.gradeIndex < u.grade) return `Grade requis : ${GRADES[u.grade].name}`;
    if (this.d.money < u.price) return 'Fonds insuffisants';
    this.d.money -= u.price; this.d.up[id]++; this.save(); return null;
  }
  save() { try { localStorage.setItem(KEY, JSON.stringify(this.d)); } catch { /* ignore */ } }
  reset() { try { localStorage.removeItem(KEY); } catch { /* ignore */ } this.d = defaults(); }
}
