// Eau du FPT et du tuyau (logique pure, testée dans test/logic.mjs).
// Ordres de grandeur d'un FPT français : citerne ~3 000 L, pompe ~1 000 L/min ; lance à débit variable (LDV) 250 / 500 L/min ; tuyaux en tronçons de 20 m.
export const FPT_TANK = 3000;        // L
export const HYDRANT_LPM = 1000;     // L/min apportés par le poteau incendie
export const HOSE_SECTION = 20;      // m
export const LANCE = {
  jet: { flow: 500, range: 16, label: 'Jet droit 500 L/min' },
  diffuse: { flow: 250, range: 6, label: 'Diffusé 250 L/min' },
};

export class WaterSupply {
  constructor(cap = FPT_TANK) { this.cap = cap; this.level = cap; this.hydrant = false; this.used = 0; }
  // Débite `lpm` pendant dt secondes ; renvoie les litres réellement sortis (citerne vide = rien).
  draw(lpm, dt) {
    const want = (lpm / 60) * dt, got = Math.min(want, this.level);
    this.level -= got; this.used += got;
    return got;
  }
  // Poteau branché ou caserne : la citerne se remplit.
  refill(lpm, dt) { this.level = Math.min(this.cap, this.level + (lpm / 60) * dt); }
  get ratio() { return this.level / this.cap; }
}

export function pathLength(pts) {
  let L = 0;
  for (let i = 1; i < pts.length; i++) L += Math.hypot(pts[i].x - pts[i - 1].x, pts[i].z - pts[i - 1].z, (pts[i].y ?? 0) - (pts[i - 1].y ?? 0));
  return L;
}
