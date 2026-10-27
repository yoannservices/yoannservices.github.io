// Argent, XP, niveaux, achats, sauvegarde localStorage.
import { BUS_TYPES } from '../bus/BusStats.js';
import { LINES } from '../lines/Lines.js';

const KEY = 'busCitySimulator.save.v1';
export const LEVEL_XP = [0, 150, 500, 1100, 2000];   // XP requise pour les niveaux 1..5
export const TICKET = 2.6;

const defaults = () => ({
  money: 1500, xp: 0, ownedBuses: ['minibus'], ownedLines: ['L1'], bus: 'minibus', line: 'L1',
  fines: 0, finesTotal: 0, runs: 0, pax: 0, stopsDone: 0, energy: { minibus: 1 }, hours: 8,
});

export class Economy {
  constructor() {
    let d = null;
    try { d = JSON.parse(localStorage.getItem(KEY)); } catch { /* stockage indisponible */ }
    this.d = { ...defaults(), ...(d ?? {}) };
    this.onLevel = () => {};
    this.dirty = false;
  }
  get level() { let l = 1; LEVEL_XP.forEach((x, i) => { if (this.d.xp >= x) l = i + 1; }); return l; }
  get maxLevel() { return this.level >= LEVEL_XP.length; }
  xpProgress() {
    const l = this.level, a = LEVEL_XP[l - 1], b = LEVEL_XP[l];
    return b === undefined ? 1 : (this.d.xp - a) / (b - a);
  }
  addMoney(v) { this.d.money += v; this.dirty = true; }
  addXp(v) {
    const before = this.level;
    this.d.xp += v; this.dirty = true;
    if (this.level > before) this.onLevel(this.level);
  }
  ownsBus(id) { return this.d.ownedBuses.includes(id); }
  ownsLine(id) { return this.d.ownedLines.includes(id); }
  buyBus(id) {
    const b = BUS_TYPES[id];
    if (this.ownsBus(id)) return 'Déjà possédé';
    if (this.level < b.level) return `Niveau ${b.level} requis`;
    if (this.d.money < b.price) return 'Fonds insuffisants';
    this.d.money -= b.price; this.d.ownedBuses.push(id); this.save(); return null;
  }
  buyLine(id) {
    const l = LINES.find((x) => x.id === id);
    if (this.ownsLine(id)) return 'Déjà possédée';
    if (this.level < l.level) return `Niveau ${l.level} requis`;
    if (this.d.money < l.price) return 'Fonds insuffisants';
    this.d.money -= l.price; this.d.ownedLines.push(id); this.save(); return null;
  }
  save() {
    try { localStorage.setItem(KEY, JSON.stringify(this.d)); } catch { /* ignore */ }
    this.dirty = false;
  }
  reset() { try { localStorage.removeItem(KEY); } catch { /* ignore */ } this.d = defaults(); }
}
