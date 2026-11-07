// Boîtes (bâtiments) et cercles (arbres, lampadaires) dans un hachage spatial ; cercles dynamiques pour les barrières.
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

export class Collision {
  constructor(cell = 20) { this.cell = cell; this.map = new Map(); this.dynamic = []; this.stamp = 0; }
  _k(cx, cz) { return (cx + 1000) * 4096 + (cz + 1000); }
  _cells(minx, maxx, minz, maxz, fn) {
    const c = this.cell;
    for (let cx = Math.floor(minx / c); cx <= Math.floor(maxx / c); cx++)
      for (let cz = Math.floor(minz / c); cz <= Math.floor(maxz / c); cz++) fn(this._k(cx, cz));
  }
  _add(o, minx, maxx, minz, maxz) {
    this._cells(minx, maxx, minz, maxz, (k) => { let a = this.map.get(k); if (!a) this.map.set(k, a = []); a.push(o); });
  }
  addBox(minx, maxx, minz, maxz, tag) { this._add({ t: 0, minx, maxx, minz, maxz, tag, s: 0 }, minx, maxx, minz, maxz); }
  addCircle(x, z, r, tag) { this._add({ t: 1, x, z, r, tag, s: 0 }, x - r, x + r, z - r, z + r); }

  // renvoie le vecteur de poussée pour sortir le cercle (x,z,r) des obstacles
  resolve(x, z, r) {
    this.stamp++;
    let px = 0, pz = 0, hit = null;
    const test = (o) => {
      if (o.t === 1) {
        const dx = x - o.x, dz = z - o.z, rr = r + o.r, d2 = dx * dx + dz * dz;
        if (d2 < rr * rr) { const d = Math.sqrt(d2) || 1e-3; px += (dx / d) * (rr - d); pz += (dz / d) * (rr - d); hit = o; }
      } else {
        const cx = clamp(x, o.minx, o.maxx), cz = clamp(z, o.minz, o.maxz), dx = x - cx, dz = z - cz, d2 = dx * dx + dz * dz;
        if (d2 >= r * r) return;
        hit = o;
        if (d2 > 1e-6) { const d = Math.sqrt(d2); px += (dx / d) * (r - d); pz += (dz / d) * (r - d); return; }
        const l = x - o.minx, rt = o.maxx - x, tp = z - o.minz, bt = o.maxz - z, m = Math.min(l, rt, tp, bt);
        if (m === l) px -= l + r; else if (m === rt) px += rt + r; else if (m === tp) pz -= tp + r; else pz += bt + r;
      }
    };
    this._cells(x - r, x + r, z - r, z + r, (k) => {
      const a = this.map.get(k);
      if (!a) return;
      for (const o of a) { if (o.s === this.stamp) continue; o.s = this.stamp; test(o); }
    });
    for (const o of this.dynamic) test(o);
    return { px, pz, hit };
  }
}
