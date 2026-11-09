// Commandes clients : chaque camion client qui vient charger livre une commande. Prime à la fin, pénalité si en retard.
import { PRICES } from './Economy.js';
const CLIENTS = ['Maçonnerie Duval', 'TP Mistral', 'Béton du Midi', 'Commune de Saint-Aubin', 'Routes & Cie', 'Terrassement Roux', 'Lotissement Les Chênes', 'Carrelages Martin'];
const rnd = (a, b) => a + Math.random() * (b - a);

export class Orders {
  constructor(list = null) { this.list = list ?? []; this.next = 5; this.id = this.list.reduce((m, o) => Math.max(m, o.id), 0); }
  make(grade = 0) {
    const qty = Math.round(rnd(25, 55 + grade * 25) / 5) * 5;
    return { id: ++this.id, client: CLIENTS[Math.floor(Math.random() * CLIENTS.length)], qty, done: 0, left: Math.round(qty * 11 + rnd(300, 600)), bonus: Math.round(rnd(8, 22)), late: false };
  }
  // dt en secondes ; ajoute des commandes jusqu'à 3 ; retourne les commandes devenues en retard
  update(dt, grade = 0) {
    const late = [];
    this.next -= dt;
    if (this.next <= 0 && this.list.length < 3) { this.list.push(this.make(grade)); this.next = rnd(60, 120); }
    for (const o of this.list) { o.left -= dt; if (o.left <= 0 && !o.late) { o.late = true; late.push(o); } }
    return late;
  }
  // commande à servir par le prochain camion (la plus ancienne non terminée)
  pick() { return this.list.find((o) => o.done < o.qty) ?? null; }
  // livraison de t tonnes de gravier pour la commande o : renvoie { pay, finished, bonus }
  deliver(o, t, grade = 0) {
    if (!o) return { pay: Math.round(t * PRICES.rock), finished: false, bonus: 0 };
    o.done = Math.min(o.qty, o.done + t);
    let pay = Math.round(t * (PRICES.gravel + o.bonus * 0.1)), bonus = 0;
    const finished = o.done >= o.qty - 1e-6;
    if (finished) {
      bonus = Math.round(o.qty * 2.5 * (o.late ? -0.5 : 1));
      this.list = this.list.filter((x) => x !== o);
    }
    return { pay, finished, bonus };
  }
}
