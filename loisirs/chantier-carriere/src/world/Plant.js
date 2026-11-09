// Installation de concassage : trémie -> concasseur -> convoyeur -> stock de gravier (tas sur le terrain). Logique seule.
export const PLANT = {
  hopper: { x0: -48.5, x1: -41.5, z0: -3.5, z1: 3.5, cap: 40 },   // intérieur de la trémie (ouverte vers l'est)
  stock: { x: -60, z: -26 },                                       // bout du convoyeur
  rate: 0.55,                                                      // m³ de roche traités par seconde
  stockMax: 8,                                                     // hauteur max du tas
};
export class Plant {
  constructor() { this.hopper = 0; this.running = false; this.crushed = 0; this.full = false; this.rate = PLANT.rate; }
  inHopper(x, z) { const h = PLANT.hopper; return x > h.x0 && x < h.x1 && z > h.z0 && z < h.z1; }
  // vol de roche versée dans la trémie ; renvoie ce qui est accepté
  feed(vol) { const ok = Math.min(vol, PLANT.hopper.cap - this.hopper); this.hopper += ok; return ok; }
  update(dt, terrain, mul = 1) {
    const s = PLANT.stock;
    this.full = terrain.height(s.x, s.z) > PLANT.stockMax;
    const q = this.full ? 0 : Math.min(this.hopper, PLANT.rate * mul * dt);
    this.running = q > 1e-4; this.hopper -= q;
    if (q > 0) { terrain.add(s.x, s.z, 3.2, q * 0.96, 1); this.crushed += q; }
    return q;
  }
}
