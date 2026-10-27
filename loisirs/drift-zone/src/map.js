// La carte unique : une grande plateforme avec des zones d'obstacles variées. Générée avec une graine fixe.
const MAP_SIZE = 6000;
const START = { x: 3000, y: 4700, angle: -Math.PI / 2 };

const TAU = Math.PI * 2;

function rng(seed) { // mulberry32
  return () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Retourne { obstacles: [def], decals: [{ kind, x, y, r|size, angle?, color }] }. */
function buildMap() {
  const rand = rng(7);
  const o = [];
  const decals = [];
  const add = (type, x, y, extra = {}) => o.push({ type, x: Math.round(x), y: Math.round(y), ...extra });
  const grid = (type, x, y, cols, rows, dx, dy) => { for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) add(type, x + i * dx, y + j * dy); };
  const ring = (type, cx, cy, r, n) => { for (let i = 0; i < n; i++) add(type, cx + Math.cos((i / n) * TAU) * r, cy + Math.sin((i / n) * TAU) * r); };

  // Parking nord-ouest : grille de piliers
  grid('pillar', 700, 700, 5, 4, 360, 360);

  // Anneau de pneus central + disque peint
  decals.push({ kind: 'ring', x: 3000, y: 2800, r: 400, w: 40, color: 'red' });
  ring('tire', 3000, 2800, 330, 28);

  // Slalom de piliers
  for (let i = 0; i < 7; i++) add('pillar', 2400 + i * 230, 1500 + (i % 2) * 60);

  // Bâtiments (grands blocs blancs)
  add('block', 1300, 2700, { w: 640, h: 330 });
  add('block', 4700, 4600, { w: 700, h: 280 });
  add('block', 1000, 5200, { w: 420, h: 420 });
  add('block', 4400, 2400, { w: 300, h: 560, angle: 0.4 });

  // Caisses
  grid('crate', 5000, 3300, 4, 3, 40, 40);
  grid('crate', 4500, 3600, 3, 3, 40, 40);
  grid('crate', 1900, 4300, 5, 2, 40, 40);

  // Chicane de barrières sud-ouest
  for (let i = 0; i < 7; i++) add('barrier', 800 + i * 330, 4100 + (i % 2 ? 110 : -110), { w: 220, angle: i % 2 ? 0.25 : -0.25 });

  // Piles de pneus dans les coins
  grid('tire', 5300, 5300, 3, 3, 30, 30);
  grid('tire', 560, 5600, 3, 3, 30, 30);
  grid('tire', 5300, 560, 3, 3, 30, 30);

  // Champs de plots : nord-est dense, puis éparpillés partout
  const free = (x, y, gap) => !o.some((p) => Math.hypot(p.x - x, p.y - y) < (p.w ? Math.max(p.w, p.h) / 2 : 30) + gap)
    && Math.hypot(x - START.x, y - START.y) > 450;
  const scatter = (n, x0, y0, x1, y1, gap, tries = 4000) => {
    for (let k = 0; k < tries && n > 0; k++) {
      const x = x0 + rand() * (x1 - x0), y = y0 + rand() * (y1 - y0);
      if (free(x, y, gap)) { add('cone', x, y); n--; }
    }
  };
  scatter(150, 3700, 600, 5400, 2000, 70);
  scatter(80, 300, 300, 5700, 5700, 120);

  // Marquages au sol
  decals.push({ kind: 'square', x: 2400, y: 3900, size: 380, angle: 0.3, color: 'red' });
  decals.push({ kind: 'ring', x: 4700, y: 1000, r: 150, w: 30, color: 'red' });

  return { obstacles: o, decals };
}
