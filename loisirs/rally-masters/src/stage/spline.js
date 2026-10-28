/* Génération d'une spéciale par graine : la courbure est composée d'épingles, de virages et d'enchaînements,
   intégrée en un tracé (échantillons tous les DS mètres), puis relief, surfaces, sauts / ponts / gués et notes de pace.
   Convention : cap H, avant = (sin H, cos H) dans le plan XZ ; courbure positive = virage à gauche ; gauche = (cos H, −sin H). */
import { mulberry32, clamp, lerp, smooth, fbm1, pickW } from '../core/util.js';
import { ENVS } from '../core/data.js';
import { TERRE, GRAVIER, NEIGE, GLACE, ASPHALTE, BOUE, SURFACES, gripOf } from '../surfaces/surfaces.js';

export const DS = 4;
const RADIUS = [12, 22, 38, 62, 105, 175];                 // rayon type par gravité (1 = épingle … 6 = quasi plein gaz)
const ANGLE = [[140, 180], [85, 135], [55, 100], [38, 75], [22, 50], [10, 32]];
const SEV_W = { foret: [0.09, 0.15, 0.22, 0.22, 0.19, 0.13], neige: [0.07, 0.14, 0.2, 0.22, 0.2, 0.17], asphalte: [0.1, 0.16, 0.2, 0.2, 0.2, 0.14], gravier: [0.06, 0.12, 0.18, 0.24, 0.22, 0.18] };
const ZONES = {
  foret: [[TERRE, 0.55], [BOUE, 0.18], [GRAVIER, 0.27]],
  neige: [[NEIGE, 0.6], [GLACE, 0.2], [GRAVIER, 0.08], [TERRE, 0.12]],
  asphalte: [[ASPHALTE, 0.86], [GRAVIER, 0.09], [TERRE, 0.05]],
  gravier: [[GRAVIER, 0.62], [TERRE, 0.2], [ASPHALTE, 0.18]],
};
const FEATURE_W = { foret: [['jump', 0.45], ['ford', 0.4], ['bridge', 0.15]], neige: [['jump', 0.5], ['bridge', 0.5]], asphalte: [['bridge', 0.6], ['jump', 0.4]], gravier: [['jump', 0.45], ['ford', 0.35], ['bridge', 0.2]] };
const NAMES = {
  foret: ['Bois', 'Clairière', 'Sapinière', 'Ravin', 'Vallon', 'Tourbière', 'Chênaie'],
  neige: ['Fjord', 'Glacier', 'Toundra', 'Combe', 'Lac gelé', 'Passe', 'Cirque'],
  asphalte: ['Col', 'Corniche', 'Lacets', 'Gorges', 'Belvédère', 'Pic', 'Barrage'],
  gravier: ['Garrigue', 'Calanque', 'Oliveraie', 'Restanque', 'Cap', 'Mas', 'Colline'],
};
const OWNERS = ['du Corbeau', 'de la Pierre', 'du Loup', 'des Trois Sœurs', 'de Sainte-Anne', 'du Faucon', 'des Brumes', 'du Renard', 'de la Croix', 'des Mines'];

export function severityOf(rmin) { return rmin < 16 ? 1 : rmin < 28 ? 2 : rmin < 48 ? 3 : rmin < 78 ? 4 : rmin < 125 ? 5 : 6; }

export function generateStage(opt) {
  for (let attempt = 0; attempt < 40; attempt++) {
    const st = build(opt, (opt.seed + attempt * 7919) >>> 0, true);
    if (st) return st;
  }
  return build(opt, opt.seed >>> 0, false);
}

function build(opt, seed, check) {
  const env = ENVS[opt.env], rnd = mulberry32(seed);
  const N = Math.ceil(opt.length / DS) + 1;
  const kap = [];
  const straight = (L) => { const n = Math.max(1, Math.round(L / DS)); for (let i = 0; i < n; i++) kap.push(0); };
  const corner = (dir, sev, angDeg, shape) => {
    const R = RADIUS[sev - 1] * (0.85 + rnd() * 0.35), ang = angDeg * Math.PI / 180;
    const n = Math.max(3, Math.round(ang * R / DS)), w = [];
    for (let j = 0; j < n; j++) { const u = j / (n - 1); w.push(shape === 'serre' ? 0.55 + 0.9 * u : shape === 'ouvre' ? 1.45 - 0.9 * u : 1); }
    const mean = w.reduce((a, b) => a + b, 0) / n;
    for (let j = 0; j < n; j++) kap.push(dir * ang / (n * DS) * w[j] / mean);
  };
  const rangeAng = (sev) => lerp(ANGLE[sev - 1][0], ANGLE[sev - 1][1], rnd());

  straight(110);
  let dir = rnd() < 0.5 ? 1 : -1;
  while (kap.length < N - 20) {
    const t = pickW(rnd, [['corner', 0.55], ['straight', 0.2], ['esses', 0.14], ['epingles', 0.06], ['double', 0.05]]);
    if (t === 'straight') straight((env.surf === 'asphalte' ? 50 : 30) + rnd() * 130);
    else if (t === 'corner') {
      const sev = pickW(rnd, SEV_W[opt.env].map((p, i) => [i + 1, p]));
      dir = rnd() < 0.62 ? -dir : dir;
      corner(dir, sev, rangeAng(sev), sev >= 2 && rnd() < 0.2 ? 'serre' : rnd() < 0.15 ? 'ouvre' : 'plat');
      if (rnd() < 0.5) straight(8 + rnd() * 50);
    } else if (t === 'esses') {
      const n = 3 + Math.floor(rnd() * 3), sev = 4 + Math.floor(rnd() * 3);
      dir = rnd() < 0.5 ? 1 : -1;
      for (let j = 0; j < n; j++) { corner(dir, sev, 24 + rnd() * 22, 'plat'); straight(6 + rnd() * 18); dir = -dir; }
    } else if (t === 'epingles') {
      dir = rnd() < 0.5 ? 1 : -1;
      corner(dir, 1, rangeAng(1), 'plat'); straight(22 + rnd() * 25); corner(-dir, 1, rangeAng(1), rnd() < 0.5 ? 'serre' : 'plat'); straight(30 + rnd() * 50);
    } else { // double gauche-droite rapide puis rythme
      const sev = 3 + Math.floor(rnd() * 2);
      dir = rnd() < 0.5 ? 1 : -1;
      corner(dir, sev, rangeAng(sev), 'plat'); straight(10 + rnd() * 20); corner(dir, sev + 1, rangeAng(Math.min(6, sev + 1)), 'ouvre'); straight(25 + rnd() * 40);
    }
  }
  straight(70);
  while (kap.length < N) kap.push(0);
  kap.length = N;

  // lissage : pas de saut de courbure (volant progressif)
  let k = Float32Array.from(kap);
  for (let pass = 0; pass < 3; pass++) {
    const o = new Float32Array(N);
    for (let i = 0; i < N; i++) o[i] = (k[Math.max(0, i - 1)] + k[i] + k[Math.min(N - 1, i + 1)]) / 3;
    k = o;
  }

  // intégration du tracé
  const x = new Float32Array(N), z = new Float32Array(N), h = new Float32Array(N);
  h[0] = rnd() * Math.PI * 2;
  for (let i = 0; i < N - 1; i++) {
    h[i + 1] = h[i] + k[i] * DS;
    const hm = (h[i] + h[i + 1]) / 2;
    x[i + 1] = x[i] + DS * Math.sin(hm); z[i + 1] = z[i] + DS * Math.cos(hm);
  }
  if (check && selfOverlap(x, z, N)) return null;

  // relief : bruit lent + collines, pente limitée
  const y = new Float32Array(N), ys = Math.floor(rnd() * 1000);
  for (let i = 0; i < N; i++) { const s = i * DS; y[i] = env.amp * (0.7 * fbm1(s / 380, 3, ys) + 0.3 * fbm1(s / 95, 2, ys + 5)); }
  const maxD = (env.surf === 'asphalte' ? 0.095 : 0.075) * DS;
  for (let pass = 0; pass < 4; pass++) for (let i = 1; i < N; i++) y[i] = clamp(y[i], y[i - 1] - maxD, y[i - 1] + maxD);
  for (let pass = 0; pass < 3; pass++) { const c = Float32Array.from(y); for (let i = 1; i < N - 1; i++) y[i] = (c[i - 1] + 2 * c[i] + c[i + 1]) / 4; }
  const y0 = y[0]; for (let i = 0; i < N; i++) y[i] -= y0;

  // zones libres (ligne droite) pour sauts, ponts et gués
  const run = new Int16Array(N + 1);
  for (let i = N - 1; i >= 0; i--) run[i] = Math.abs(k[i]) < 0.003 ? run[i + 1] + 1 : 0;
  const features = [], bridge = new Float32Array(N), ford = new Uint8Array(N);
  const maxF = Math.max(1, Math.floor(opt.length / 1150));
  let last = -999;
  for (let i = 55; i < N - 90 && features.length < maxF; i++) {
    if (i - last < 90 || rnd() > 0.05) continue;
    const t = pickW(rnd, FEATURE_W[opt.env]);
    if (t === 'jump' && run[i] >= 38) {
      const f = { type: 'jump', i0: i + 8, i1: i + 24, h: 1.4 + rnd() * 0.9 };
      features.push(f); last = f.i1; const s0 = f.i0 * DS;
      for (let j = f.i0; j < Math.min(N, f.i0 + 24); j++) {
        const s = j * DS - s0;
        y[j] += f.h * smooth(0, 14, s) - (f.h + 1.1) * smooth(14, 18, s) + 1.1 * smooth(18, 60, s);
      }
    } else if (t === 'bridge' && run[i] >= 30) {
      const f = { type: 'bridge', i0: i + 6, i1: i + 24 };
      features.push(f); last = f.i1;
      for (let j = f.i0 - 4; j <= f.i1 + 4; j++) bridge[j] = Math.min(smooth(f.i0 - 4, f.i0 + 1, j), 1 - smooth(f.i1 - 1, f.i1 + 4, j));
    } else if (t === 'ford' && run[i] >= 20) {
      const f = { type: 'ford', i0: i + 5, i1: i + 15 };
      features.push(f); last = f.i1;
      for (let j = f.i0 - 3; j <= f.i1 + 3; j++) { ford[j] = j >= f.i0 && j <= f.i1 ? 1 : 0; y[j] -= 0.4 * Math.min(smooth(f.i0 - 3, f.i0 + 1, j), 1 - smooth(f.i1 - 1, f.i1 + 3, j)); }
    }
  }
  // surfaces par zones
  const surf = new Uint8Array(N);
  const zones = ZONES[opt.env];
  for (let i = 0, cur = zones[0][0]; i < N;) {
    const len = 28 + Math.floor(rnd() * 90);
    for (let j = i; j < Math.min(N, i + len); j++) surf[j] = cur;
    i += len; const nx = pickW(rnd, zones); cur = nx === cur && rnd() < 0.6 ? pickW(rnd, zones) : nx;
  }
  for (let i = 0; i < 40; i++) surf[i] = zones[0][0];
  for (let i = 0; i < N; i++) if (ford[i]) surf[i] = opt.env === 'foret' ? BOUE : GRAVIER;
  for (const f of features) if (f.type === 'bridge') for (let j = f.i0; j <= f.i1; j++) surf[j] = ASPHALTE;

  const hw = new Float32Array(N);
  for (let i = 0; i < N; i++) hw[i] = clamp(env.hw * (1 + 0.1 * fbm1(i * DS / 70, 2, ys + 11)), env.hw * 0.86, env.hw * 1.14);

  // virages (notes) : segments de courbure continue de même signe
  const corners = detectCorners(k, N);
  const notes = [];
  for (const c of corners) {
    const mods = [];
    if (c.tight === 1) mods.push('serre'); else if (c.tight === -1) mods.push('ouvre');
    if (c.s1 - c.s0 > 75 && c.sev >= 3) mods.push('long');
    notes.push({ type: 'corner', s0: c.s0, s1: c.s1, i0: c.i0, i1: c.i1, dir: c.dir, sev: c.sev, mods, angle: c.angle });
  }
  for (const f of features) notes.push({ type: f.type, s0: f.i0 * DS, s1: f.i1 * DS, i0: f.i0, i1: f.i1 });
  notes.sort((a, b) => a.s0 - b.s0);
  for (let n = 0; n < notes.length; n++) {
    const nx = notes[n + 1], nt = notes[n];
    nt.gap = nx ? Math.max(0, nx.s0 - nt.s1) : Math.max(0, (N - 1) * DS - nt.s1);
    const prev = notes[n - 1];
    if (nt.type === 'corner' && nt.sev <= 2 && nt.s0 - (prev ? prev.s1 : 0) > 160) nt.mods.push('attention');
  }

  const ns = mulberry32(seed ^ 0x51ed);
  const name = `${NAMES[opt.env][Math.floor(ns() * NAMES[opt.env].length)]} ${OWNERS[Math.floor(ns() * OWNERS.length)]}`;
  const startI = 6, finishI = N - 8;
  const cps = [0.25, 0.5, 0.75].map((f) => Math.round(startI + (finishI - startI) * f));
  const stage = {
    seed, env: opt.env, N, DS, length: (N - 1) * DS, name, x, z, y, h, k, hw, surf, bridge, ford, features, notes, corners,
    startI, finishI, cps, weather: opt.weather || 'soleil', tod: opt.tod || 'jour', verge: env.verge,
  };
  Object.assign(stage, referenceSim(stage));
  return stage;
}

function selfOverlap(x, z, N) {
  const cell = 24, grid = new Map(), minSep = 22, minSep2 = minSep * minSep, gap = Math.ceil(80 / DS);
  const key = (cx, cz) => cx * 73856093 ^ cz * 19349663;
  for (let i = 0; i < N; i++) {
    const cx = Math.floor(x[i] / cell), cz = Math.floor(z[i] / cell);
    for (let dx = -1; dx <= 1; dx++) for (let dz = -1; dz <= 1; dz++) {
      const arr = grid.get(key(cx + dx, cz + dz)); if (!arr) continue;
      for (const j of arr) { if (i - j > gap && (x[i] - x[j]) ** 2 + (z[i] - z[j]) ** 2 < minSep2) return true; }
    }
    const kk = key(cx, cz); if (!grid.has(kk)) grid.set(kk, []); grid.get(kk).push(i);
  }
  return false;
}

function detectCorners(k, N) {
  const T = 1 / 260, out = [];
  let i = 0;
  while (i < N) {
    if (Math.abs(k[i]) <= T) { i++; continue; }
    const sg = Math.sign(k[i]); let j = i, hole = 0, e = i;
    while (j < N) {
      if (Math.sign(k[j]) === sg && Math.abs(k[j]) > T) { e = j; hole = 0; } else if (++hole > 3) break;
      j++;
    }
    let ang = 0, pk = 0;
    for (let q = i; q <= e; q++) { ang += k[q] * DS; pk = Math.max(pk, Math.abs(k[q])); }
    const n = e - i + 1, a = Math.max(1, Math.floor(n / 3));
    let m1 = 0, m3 = 0;
    for (let q = 0; q < a; q++) { m1 += Math.abs(k[i + q]); m3 += Math.abs(k[e - q]); }
    const ratio = m3 / Math.max(1e-6, m1);
    if (Math.abs(ang) > 0.14) out.push({ i0: i, i1: e, s0: i * DS, s1: (e + 1) * DS, dir: sg > 0 ? 'L' : 'R', sev: severityOf(1 / pk), angle: Math.abs(ang), tight: n >= 4 ? (ratio > 1.35 ? 1 : ratio < 0.74 ? -1 : 0) : 0 });
    i = e + 1;
  }
  return out;
}

/* Simulation de référence : vitesse maximale par courbure et adhérence, passes avant/arrière → temps idéal et profil de temps
   (sert aux pilotes IA et au classement provisoire). */
export function referenceSim(st) {
  const { N, k, surf } = st, g = 9.81, tire = ENVS[st.env].tire;
  const vTop = st.env === 'asphalte' ? 50 : 42;
  const v = new Float32Array(N), vmax = new Float32Array(N), mu = new Float32Array(N);
  for (let i = 0; i < N; i++) {
    mu[i] = gripOf(surf[i], tire, st.weather);
    const kk = Math.max(Math.abs(k[Math.max(0, i - 1)]), Math.abs(k[i]), Math.abs(k[Math.min(N - 1, i + 1)]), 1e-4);
    vmax[i] = Math.min(vTop, Math.sqrt(mu[i] * g * 0.92 / kk));
  }
  v[0] = 0;
  for (let i = 0; i < N - 1; i++) { const a = Math.min(6.5, 0.5 * g * mu[i]); v[i + 1] = Math.min(vmax[i + 1], Math.sqrt(v[i] * v[i] + 2 * a * DS)); if (i === 0) v[1] = Math.min(vmax[1], Math.sqrt(2 * a * DS)); }
  for (let i = N - 2; i >= 0; i--) { const d = Math.min(9, 0.85 * g * mu[i]); v[i] = Math.min(v[i], Math.sqrt(v[i + 1] * v[i + 1] + 2 * d * DS)); }
  const tcum = new Float32Array(N); let t = 0;
  for (let i = 1; i < N; i++) { t += DS / Math.max(2, (v[i] + v[i - 1]) / 2); tcum[i] = t; }
  return { tref: t, tcum };
}

export { SURFACES };
