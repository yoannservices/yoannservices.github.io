
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

// Chaque test renvoie { nx, ny, depth, px, py } ou null. (nx,ny) : de l'obstacle vers la voiture.

// m : marge ajoutée à l'obstacle (détection des passages frôlés)
function carVsCircle(car, o, m = 0) {
  const hx = car.cfg.length / 2;
  const hy = car.cfg.width / 2;
  const ux = Math.cos(car.angle), uy = Math.sin(car.angle);
  const dx = o.x - car.x, dy = o.y - car.y;
  const lx = dx * ux + dy * uy;
  const ly = -dx * uy + dy * ux;
  const cx = clamp(lx, -hx, hx);
  const cy = clamp(ly, -hy, hy);
  const ex = lx - cx, ey = ly - cy;
  const d2 = ex * ex + ey * ey;
  const r = o.r + m;
  if (d2 > r * r) return null;

  let nlx, nly, depth;
  if (d2 > 1e-6) {
    const d = Math.sqrt(d2);
    nlx = ex / d; nly = ey / d; depth = r - d;
  } else { // centre du cercle dans la voiture : sortir par le plus proche bord
    if (hx - Math.abs(lx) < hy - Math.abs(ly)) { nlx = Math.sign(lx) || 1; nly = 0; depth = r + hx - Math.abs(lx); }
    else { nlx = 0; nly = Math.sign(ly) || 1; depth = r + hy - Math.abs(ly); }
  }
  // normale locale (voiture -> cercle) -> monde, puis inversée (cercle -> voiture)
  return {
    nx: -(nlx * ux - nly * uy), ny: -(nlx * uy + nly * ux), depth,
    px: car.x + cx * ux - cy * uy, py: car.y + cx * uy + cy * ux,
  };
}

function carVsBox(car, o, m = 0) {
  const hx = car.cfg.length / 2;
  const hy = car.cfg.width / 2;
  const axes = [
    [Math.cos(car.angle), Math.sin(car.angle)],
    [-Math.sin(car.angle), Math.cos(car.angle)],
    [Math.cos(o.angle), Math.sin(o.angle)],
    [-Math.sin(o.angle), Math.cos(o.angle)],
  ];
  const [u, v, a, b] = axes;
  const dx = o.x - car.x, dy = o.y - car.y;
  let best = Infinity, bnx = 0, bny = 0, bCarR = 0;
  for (const [ax, ay] of axes) {
    const carR = hx * Math.abs(u[0] * ax + u[1] * ay) + hy * Math.abs(v[0] * ax + v[1] * ay);
    const boxR = (o.w / 2 + m) * Math.abs(a[0] * ax + a[1] * ay) + (o.h / 2 + m) * Math.abs(b[0] * ax + b[1] * ay);
    const dist = dx * ax + dy * ay;
    const overlap = carR + boxR - Math.abs(dist);
    if (overlap <= 0) return null;
    if (overlap < best) {
      best = overlap; bCarR = carR;
      const s = dist > 0 ? -1 : 1; // pointe vers la voiture
      bnx = ax * s; bny = ay * s;
    }
  }
  return { nx: bnx, ny: bny, depth: best, px: car.x - bnx * bCarR, py: car.y - bny * bCarR };
}

/** Obstacles + résolution des collisions voiture/obstacles. Grille spatiale pour les fixes. */
class World {
  constructor(obstacles, bounds, cell = 256, nearMargin = SCORE.nearMargin) {
    this.bounds = bounds; // { x0, y0, x1, y1 }
    this.margin = nearMargin;
    this.cell = cell;
    this.grid = new Map();
    this.movables = [];
    this.stamp = 0;
    obstacles.forEach((o) => {
      if (o.movable) this.movables.push(o);
      else this.insert(o);
    });
  }

  /** Remet les objets mobiles à leur place (redémarrage). */
  reset() {
    this.movables.forEach((o) => Object.assign(o, o.home, { vx: 0, vy: 0, av: 0 }));
    this.grid.forEach((list) => list.forEach((o) => { o.nearState = 0; }));
    this.movables.forEach((o) => { o.nearState = 0; });
  }

  insert(o) {
    const c = this.cell;
    const ex = o.shape === 'circle' ? o.r : Math.abs(Math.cos(o.angle)) * o.w / 2 + Math.abs(Math.sin(o.angle)) * o.h / 2;
    const ey = o.shape === 'circle' ? o.r : Math.abs(Math.sin(o.angle)) * o.w / 2 + Math.abs(Math.cos(o.angle)) * o.h / 2;
    for (let cy = Math.floor((o.y - ey) / c); cy <= Math.floor((o.y + ey) / c); cy++) {
      for (let cx = Math.floor((o.x - ex) / c); cx <= Math.floor((o.x + ex) / c); cx++) {
        const key = cx + ',' + cy;
        if (!this.grid.has(key)) this.grid.set(key, []);
        this.grid.get(key).push(o);
      }
    }
  }

  /** Avance les objets mobiles et résout les contacts. Retourne les événements du pas. */
  step(car, dt) {
    const events = [];
    this.movables.forEach((o) => this.moveObject(o, dt));

    this.stamp++;
    const r = Math.hypot(car.cfg.length, car.cfg.width) / 2 + this.margin;
    const c = this.cell;
    for (let cy = Math.floor((car.y - r) / c); cy <= Math.floor((car.y + r) / c); cy++) {
      for (let cx = Math.floor((car.x - r) / c); cx <= Math.floor((car.x + r) / c); cx++) {
        const list = this.grid.get(cx + ',' + cy);
        if (!list) continue;
        for (const o of list) {
          if (o.stamp === this.stamp) continue;
          o.stamp = this.stamp;
          this.hit(car, o, events);
        }
      }
    }
    for (const o of this.movables) {
      if (Math.hypot(o.x - car.x, o.y - car.y) < o.br + r) this.hit(car, o, events);
    }
    return events;
  }

  moveObject(o, dt) {
    const b = this.bounds;
    o.x += o.vx * dt;
    o.y += o.vy * dt;
    o.angle += o.av * dt;
    const s = Math.hypot(o.vx, o.vy);
    if (s > 0) {
      const k = Math.max(0, s - CRASH.moveFriction * dt) / s;
      o.vx *= k; o.vy *= k;
    }
    o.av *= Math.exp(-CRASH.moveSpin * dt);
    if (o.x < b.x0 + o.br) { o.x = b.x0 + o.br; o.vx = Math.abs(o.vx) * 0.4; }
    if (o.x > b.x1 - o.br) { o.x = b.x1 - o.br; o.vx = -Math.abs(o.vx) * 0.4; }
    if (o.y < b.y0 + o.br) { o.y = b.y0 + o.br; o.vy = Math.abs(o.vy) * 0.4; }
    if (o.y > b.y1 - o.br) { o.y = b.y1 - o.br; o.vy = -Math.abs(o.vy) * 0.4; }
  }

  hit(car, o, events) {
    const test = o.shape === 'circle' ? carVsCircle : carVsBox;
    const c = test(car, o);
    if (!c) {
      // frôlement : zone élargie traversée sans contact ; l'événement part à la sortie de la zone
      // nearState : 0 hors zone, 1 dans la zone sans contact, 2 contact (pas de bonus)
      if (test(car, o, this.margin)) {
        if (!o.nearState) o.nearState = 1;
      } else {
        if (o.nearState === 1 && o.nearMiss !== false) events.push({ type: 'near', obstacle: o, speed: car.speed });
        o.nearState = 0;
      }
      return;
    }
    o.nearState = 2;
    const { nx, ny, depth } = c;
    let impact = 0;

    if (o.movable) {
      const mc = car.cfg.mass, mo = o.mass, tot = mc + mo;
      car.x += nx * depth * mo / tot; car.y += ny * depth * mo / tot;
      o.x -= nx * depth * mc / tot; o.y -= ny * depth * mc / tot;
      const vrel = (car.vx - o.vx) * nx + (car.vy - o.vy) * ny;
      if (vrel < 0) {
        const j = -(1 + o.restitution) * vrel / (1 / mc + 1 / mo);
        car.vx += j * nx / mc; car.vy += j * ny / mc;
        o.vx -= j * nx / mo; o.vy -= j * ny / mo;
        o.av += (Math.random() - 0.5) * -vrel * 0.02;
        impact = -vrel;
      }
    } else {
      car.x += nx * depth; car.y += ny * depth;
      const vn = car.vx * nx + car.vy * ny;
      if (vn < 0) {
        const k = (1 + o.restitution) * vn;
        car.vx -= k * nx; car.vy -= k * ny;
        const tx = -ny, ty = nx;
        const vt = car.vx * tx + car.vy * ty;
        car.vx -= vt * CRASH.tangentLoss * tx; car.vy -= vt * CRASH.tangentLoss * ty;
        const torque = (c.px - car.x) * ny - (c.py - car.y) * nx;
        car.angle += clamp(torque * -vn * CRASH.yawKick, -CRASH.maxYawKick, CRASH.maxYawKick);
        impact = -vn;
      }
    }
    if (impact > CRASH.minEvent) events.push({ type: 'impact', obstacle: o, speed: impact, x: c.px, y: c.py, nx, ny });
  }

}
