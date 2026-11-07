// Feu par graphe de pièces (logique pure, testée dans test/logic.mjs).
// Pièce : température T (°C), combustible restant, intensité du feu (0..1), fumée (0..1).
// Liens : porte, escalier, sortie ou fenêtre (b = -1 = extérieur). Une porte fermée freine presque tout.
export const AMBIENT = 20;
export const IGNITE_T = 280;     // auto-inflammation des objets d'une pièce voisine
export const SAFE_T = 100;       // sous ce seuil partout + plus de flammes = feu éteint

const K_HEAT = { door: 0.045, stair: 0.06, exit: 0.03, window: 0.03 };
const K_SMOKE = { door: 0.18, stair: 0.22, exit: 0.14, window: 0.14 };
const CLOSED = 0.03;             // part de l'échange qui passe une porte fermée

export class FireSim {
  constructor(rooms, links) {
    this.rooms = rooms.map((r, id) => ({ id, name: r.name, floor: r.floor ?? 0, fuel0: r.fuel ?? 100, fuel: r.fuel ?? 100, T: AMBIENT, fire: 0, smoke: 0, wet: 0 }));
    this.links = links.map((l) => ({ kind: 'door', open: true, ...l }));
  }
  ignite(id, fire = 0.15) { const r = this.rooms[id]; r.fire = Math.max(r.fire, fire); r.T = Math.max(r.T, IGNITE_T); }

  update(dt) {
    const R = this.rooms;
    for (const r of R) {
      r.wet = Math.max(0, r.wet - dt);
      if (r.fire > 0) {
        if (r.fuel > 0) {
          if (!r.wet) r.fire = Math.min(1, r.fire + 0.05 * dt);   // ~20 s pour un feu pleinement développé ; arrosé, il ne grandit plus
          r.fuel = Math.max(0, r.fuel - r.fire * 0.55 * dt);       // 100 de combustible ~ 3 min à plein
          r.T = Math.min(800, r.T + r.fire * 28 * dt);
        } else r.fire = Math.max(0, r.fire - 0.12 * dt);
        r.smoke = Math.min(1, r.smoke + r.fire * 0.09 * dt);
      } else if (r.fuel > 5 && r.T > IGNITE_T && !r.wet) r.fire = 0.1;   // reprise si on arrête d'arroser trop tôt
      r.T -= (r.T - AMBIENT) * 0.008 * dt;                         // pertes par les parois
    }
    for (const l of this.links) {
      const a = R[l.a], b = l.b < 0 ? null : R[l.b], k = l.open ? 1 : CLOSED;
      const Tb = b ? b.T : AMBIENT, Sb = b ? b.smoke : 0;
      let q = K_HEAT[l.kind] * k * (a.T - Tb) * dt;
      if (b && l.kind === 'stair' && (a.floor < b.floor) === (q > 0)) q *= 1.6;   // la chaleur monte par l'escalier
      a.T -= q; if (b) b.T += q;
      const s = K_SMOKE[l.kind] * k * (a.smoke - Sb) * dt;
      a.smoke -= s; if (b) b.smoke += s;
    }
    for (const r of R) r.smoke = Math.min(1, Math.max(0, r.smoke));
  }

  // Eau projetée dans une pièce. Jet : attaque le foyer. Diffusé : refroidit les gaz chauds (et protège le porte-lance).
  applyWater(id, litres, mode = 'jet') {
    const r = this.rooms[id];
    if (!r || litres <= 0) return;
    const jet = mode === 'jet';
    r.wet = 0.6;
    if (r.fire > 0) {
      r.fire -= litres * (jet ? 0.0065 : 0.0028);
      r.smoke = Math.min(1, r.smoke + litres * 0.002);              // vapeur
      if (r.fire < 0.02) r.fire = 0;
    }
    r.T = Math.max(AMBIENT, r.T - litres * (jet ? 2 : 3.5));
  }

  get burningCount() { return this.rooms.filter((r) => r.fire > 0).length; }
  get maxT() { return Math.max(...this.rooms.map((r) => r.T)); }
  get out() { return this.burningCount === 0 && this.maxT < SAFE_T; }
  // part du combustible brûlé (0..1) = dégâts
  damage() {
    let a = 0, b = 0;
    for (const r of this.rooms) { a += r.fuel0 - r.fuel; b += r.fuel0; }
    return b ? a / b : 0;
  }
}
