/* Collisions 2D (plan x/z) : la voiture est un rectangle orienté ; les obstacles sont des rectangles orientés ou des cercles.
   Sans dépendance à Three.js (testable en Node). */

export const box = (x, z, hx, hz, yaw = 0) => ({ k: 'box', x, z, hx, hz, c: Math.cos(yaw), s: Math.sin(yaw), r: Math.hypot(hx, hz) });
export const circle = (x, z, r) => ({ k: 'circle', x, z, r });

/* Rectangle de la voiture : centre (x, z), cap yaw, demi-longueur hl, demi-largeur hw. */
export function carBox(x, z, yaw, hl, hw) {
  return { x, z, yaw, hl, hw, fx: Math.sin(yaw), fz: Math.cos(yaw) };
}

/* Plus petit déplacement qui sort la voiture de l'obstacle : { nx, nz, depth } avec n dirigé de l'obstacle vers la voiture, ou null. */
export function collide(c, o) {
  const dx = c.x - o.x, dz = c.z - o.z;
  const reach = Math.hypot(c.hl, c.hw) + (o.k === 'circle' ? o.r : o.r);
  if (dx * dx + dz * dz > reach * reach) return null;
  // axes de la voiture : avant (fx, fz) et côté (fz, -fx)
  const ax = [c.fx, c.fz], ay = [c.fz, -c.fx];
  if (o.k === 'circle') {
    const lx = dx * ay[0] + dz * ay[1], lf = dx * ax[0] + dz * ax[1];          // centre du cercle dans le repère de la voiture (côté, avant)
    const px = Math.max(-c.hw, Math.min(c.hw, -lx)), pf = Math.max(-c.hl, Math.min(c.hl, -lf)); // point de la caisse le plus proche (repère voiture)
    const ox = -lx - px, of = -lf - pf, dist = Math.hypot(ox, of);
    if (dist >= o.r) return null;
    if (dist > 1e-6) {
      // direction du point de caisse vers le cercle, ramenée en repère monde, puis inversée (normale vers la voiture)
      const wx = ay[0] * ox + ax[0] * of, wz = ay[1] * ox + ax[1] * of;
      return { nx: -wx / dist, nz: -wz / dist, depth: o.r - dist };
    }
    return { nx: dx / (Math.hypot(dx, dz) || 1), nz: dz / (Math.hypot(dx, dz) || 1), depth: o.r + 0.05 };
  }
  // rectangle contre rectangle : théorème de l'axe séparateur sur les 4 axes
  const bx = [o.c, o.s], by = [-o.s, o.c];
  let best = Infinity, bn = null;
  for (const a of [ax, ay, bx, by]) {
    const rc = c.hl * Math.abs(a[0] * ax[0] + a[1] * ax[1]) + c.hw * Math.abs(a[0] * ay[0] + a[1] * ay[1]);
    const ro = o.hx * Math.abs(a[0] * bx[0] + a[1] * bx[1]) + o.hz * Math.abs(a[0] * by[0] + a[1] * by[1]);
    const dist = dx * a[0] + dz * a[1], over = rc + ro - Math.abs(dist);
    if (over <= 0) return null;
    if (over < best) { best = over; bn = dist >= 0 ? a : [-a[0], -a[1]]; }
  }
  return { nx: bn[0], nz: bn[1], depth: best };
}

/* Teste tous les obstacles ; renvoie le contact le plus profond ou null. */
export function worstContact(c, obstacles) {
  let w = null;
  for (const o of obstacles) {
    const r = collide(c, o);
    if (r && (!w || r.depth > w.depth)) { w = r; w.obj = o; }
  }
  return w;
}

/* La voiture est-elle entièrement dans la place ? Place : { x, z, yaw, len, wid } (len le long du cap yaw). `tol` en mètres. */
export function insideSpot(c, spot, tol = 0.1) {
  const sf = [Math.sin(spot.yaw), Math.cos(spot.yaw)], ss = [sf[1], -sf[0]];
  for (const [a, b] of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) {
    const wx = c.x + a * c.hl * c.fx + b * c.hw * c.fz, wz = c.z + a * c.hl * c.fz - b * c.hw * c.fx;
    const lf = (wx - spot.x) * sf[0] + (wz - spot.z) * sf[1], ls = (wx - spot.x) * ss[0] + (wz - spot.z) * ss[1];
    if (Math.abs(lf) > spot.len / 2 + tol || Math.abs(ls) > spot.wid / 2 + tol) return false;
  }
  return true;
}

/* Le point (x, z) est-il dans l'obstacle (avec une marge) ? */
function inside(o, x, z, m) {
  const dx = x - o.x, dz = z - o.z;
  if (o.k === 'circle') return dx * dx + dz * dz < (o.r + m) * (o.r + m);
  if (dx * dx + dz * dz > (o.r + m) * (o.r + m)) return false;
  return Math.abs(dx * o.c + dz * o.s) < o.hx + m && Math.abs(-dx * o.s + dz * o.c) < o.hz + m;
}
/* Fraction (0..1) du segment (x0,z0) -> (x1,z1) libre avant le premier obstacle fixe : sert à rapprocher la caméra d'un mur ou d'un arbre. */
export function clearFraction(x0, z0, x1, z1, obstacles, margin = 0.45) {
  const N = 28;
  for (let i = 1; i <= N; i++) {
    const t = i / N, x = x0 + (x1 - x0) * t, z = z0 + (z1 - z0) * t;
    for (const o of obstacles) if (!o.dyn && inside(o, x, z, margin)) return (i - 1) / N;
  }
  return 1;
}
