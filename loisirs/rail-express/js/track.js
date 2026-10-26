/* ═══════════════════════════════════════════════════════════
   SIMULATEUR TRAIN — GÉNÉRATION DE LA LIGNE
   Tracé (courbes, profil), gares et voies à quai, signalisation
   BAL / TVM, limitations de vitesse, sections de séparation.
   Abscisse s en mètres le long de la ligne.
   ═══════════════════════════════════════════════════════════ */
'use strict';

TS.MAIN = 2.25;           // demi-entraxe des voies principales
TS.PLAT_GAP = 11.3;       // entraxe de deux voies encadrant un quai central
TS.TRACK_GAP = 4.5;       // entraxe de deux voies sans quai

TS.turnoutLen = d => 70 + Math.abs(d) * 9;

TS.buildRoute = function (cfg) {
  const rnd = TS.rng(cfg.seed);
  const step = 10;
  const isTGV = cfg.loco.kind === 'tgv';
  const pax = cfg.loco.cat === 'pax';
  const trainLen = cfg.trainLen;
  const R = { step, stations: [], signals: [], zones: [], signs: [], volt: [], neutral: [], lgv: [], bridges: [], villages: [] };

  /* ── Gares ── */
  const legs = cfg.legs;
  let s = 0;
  legs.forEach((lg, i) => {
    const st = lg.st;
    const q = st.q;
    const platBase = q >= 10 ? 420 : q >= 6 ? 340 : 240;
    const zoneLen = Math.max(platBase, trainLen + (pax ? 60 : 90));
    const nl = Math.max(1, Math.ceil(q / 2)), nr = Math.max(1, Math.floor(q / 2));
    const mk = (n, sign) => {
      const o = [sign * TS.MAIN];
      for (let k = 1; k < n; k++) o.push(o[k - 1] + sign * (k % 2 ? TS.PLAT_GAP : TS.TRACK_GAP));
      const plats = [];
      for (let k = 0; k + 1 < n; k += 2) plats.push({ c: (o[k] + o[k + 1]) / 2, w: TS.PLAT_GAP - 3.3, tracks: [k, k + 1] });
      if (n % 2) plats.push({ c: o[n - 1] + sign * (1.65 + 3.5), w: 7, tracks: [n - 1] });
      return { o, plats };
    };
    const L = mk(nl, -1), Rr = mk(nr, 1);
    if (i > 0) s += lg.dist * 1000;
    else s = Math.max(900, zoneLen / 2 + 500);
    const first = i === 0, last = i === legs.length - 1;
    const stop = first || last || lg.stop;
    let our = 0;
    if (stop && nl > 1) our = rnd() < 0.75 ? 1 + Math.floor(rnd() * (nl - 1)) : 0;
    const plat = pax ? zoneLen : platBase;
    const S = {
      i, st, name: st.n, s, q, zoneLen, platLen: plat, first, last, stop, our,
      zoneStart: s - zoneLen / 2, zoneEnd: s + zoneLen / 2,
      headStop: s + zoneLen / 2 - 15,
      left: L.o, right: Rr.o, platsL: L.plats, platsR: Rr.plats,
      voie: n => n,
      big: q >= 8,
    };
    S.trackNo = (side, k) => side < 0 ? nl - k : nl + 1 + k;
    S.ourNo = S.trackNo(-1, our);
    S.ourPlatSide = (() => {   // côté du quai pour notre voie (-1 gauche, +1 droite)
      const off = L.o[our];
      const p = L.plats.find(p => p.tracks.includes(our));
      return p ? Math.sign(p.c - off) : -1;
    })();
    S.maxTurn = TS.turnoutLen(Math.abs(L.o[nl - 1]) - TS.MAIN);
    S.maxTurnR = TS.turnoutLen(Math.abs(Rr.o[nr - 1]) - TS.MAIN);
    R.stations.push(S);
  });
  const lastSt = R.stations[R.stations.length - 1];
  R.len = lastSt.zoneEnd + 30;
  R.end = lastSt.zoneEnd + 25;      // heurtoir

  /* ── Vitesses de ligne : LGV entre deux arrêts éloignés, ligne classique ailleurs ── */
  const stops = R.stations.filter(S => S.stop);
  for (let i = 0; i + 1 < stops.length; i++) {
    const a = stops[i], b = stops[i + 1];
    const d = b.s - a.s;
    if (isTGV && d > 60000) {
      const s0 = a.zoneEnd + 6000, s1 = b.zoneStart - 6500;
      if (s1 - s0 > 15000) R.lgv.push({ s0, s1, v: d > 250000 ? 320 : 300 });
    }
  }
  const inLGV = x => R.lgv.some(z => x > z.s0 && x < z.s1);
  for (let i = 0; i + 1 < R.stations.length; i++) {
    const a = R.stations[i], b = R.stations[i + 1];
    R.zones.push({ s0: a.s, s1: b.s, v: (b.s - a.s) > 120000 || isTGV ? 200 : 160, base: true });
  }
  R.lgv.forEach(z => R.zones.push({ s0: z.s0, s1: z.s1, v: z.v, base: true, lgv: true, over: true }));
  R.zones.push({ s0: -1e4, s1: R.stations[0].s, v: 60, base: true });
  R.zones.push({ s0: lastSt.s, s1: R.len + 1e4, v: 60, base: true });

  /* ── Tracé en plan : alignements, raccordements, courbes ── */
  const protect = R.stations.map(S => [S.zoneStart - S.maxTurn - 700, S.zoneEnd + S.maxTurn + 700]);
  const segs = [];   // {s0, s1, k0, k1}
  let cur = -2000, dir = rnd() < 0.5 ? -1 : 1;
  const baseV = x => { let v = 0, o = 0; for (const z of R.zones) if (z.base && x >= z.s0 && x < z.s1) { if (z.over) o = z.v; else v = z.v; } return o || v || 160; };
  while (cur < R.len + 2000) {
    const p = protect.find(p => cur >= p[0] && cur < p[1]);
    if (p) { segs.push({ s0: cur, s1: p[1], k0: 0, k1: 0 }); cur = p[1]; continue; }
    const next = protect.find(p => p[0] > cur);
    const room = (next ? next[0] : R.len + 4000) - cur;
    const lgv = inLGV(cur);
    let straight = (lgv ? 1500 + rnd() * 6000 : 400 + rnd() * 3500);
    if (straight > room) straight = room;
    segs.push({ s0: cur, s1: cur + straight, k0: 0, k1: 0 }); cur += straight;
    const rem = (next ? next[0] : R.len + 4000) - cur;
    if (rem < 200) continue;
    const v = Math.min(baseV(cur), cfg.vmax);
    const coef = lgv ? 4.9 : 4.6;
    const Rneed = (v / coef) ** 2;
    let Rc, tight = false;
    if (!lgv && rnd() < 0.16) { Rc = Rneed * (0.35 + rnd() * 0.4); tight = true; }
    else Rc = Rneed * (1.1 + rnd() * 2.2);
    Rc = Math.max(Rc, 300);
    const T = Math.min(80 + Rc * 0.06, 300);
    let ang = (4 + rnd() * (tight ? 50 : 30)) * Math.PI / 180;
    let arc = Rc * ang;
    if (2 * T + arc > rem) { arc = Math.max(0, rem - 2 * T - 10); if (arc < 30) continue; }
    const k = dir / Rc;
    segs.push({ s0: cur, s1: cur + T, k0: 0, k1: k });
    segs.push({ s0: cur + T, s1: cur + T + arc, k0: k, k1: k });
    segs.push({ s0: cur + T + arc, s1: cur + 2 * T + arc, k0: k, k1: 0 });
    if (tight) {
      const vc = Math.floor(coef * Math.sqrt(Rc) / 10) * 10;
      if (vc < v) R.zones.push({ s0: cur - 40, s1: cur + 2 * T + arc + 40, v: vc, curve: true });
    }
    cur += 2 * T + arc;
    if (rnd() < 0.7) dir = -dir;
  }

  /* intégration */
  const s0 = -2000, n = Math.ceil((R.len + 4000) / step) + 2;
  const X = new Float64Array(n), Z = new Float64Array(n), H = new Float64Array(n), Y = new Float64Array(n);
  let x = 0, z = 0, h = rnd() * Math.PI * 2, si = 0;
  const amp = isTGV ? 1.6 : 1;
  const ph = [rnd() * 6.28, rnd() * 6.28, rnd() * 6.28, rnd() * 6.28];
  const elev = q => amp * (0.004 * 13000 / 6.283 * Math.sin(q / 13000 * 6.283 + ph[0]) + 0.0035 * 5200 / 6.283 * Math.sin(q / 5200 * 6.283 + ph[1]) +
    0.0025 * 2300 / 6.283 * Math.sin(q / 2300 * 6.283 + ph[2]) + 0.0015 * 60000 / 6.283 * Math.sin(q / 60000 * 6.283 + ph[3]));
  for (let i = 0; i < n; i++) {
    const q = s0 + i * step;
    while (si < segs.length - 1 && segs[si].s1 <= q) si++;
    const sg = segs[si];
    let k = 0;
    if (sg && q >= sg.s0 && q < sg.s1) k = sg.k0 + (sg.k1 - sg.k0) * (q - sg.s0) / (sg.s1 - sg.s0);
    X[i] = x; Z[i] = z; H[i] = h; Y[i] = elev(q) + 40;
    h += k * step;
    x += Math.sin(h - k * step / 2) * step;
    z += Math.cos(h - k * step / 2) * step;
  }
  R.X = X; R.Z = Z; R.H = H; R.Y = Y; R.s0 = s0; R.n = n;

  /* ── Voies : abscisses latérales ── */
  // path = {side:-1|1, pick:[index de voie par gare]}
  R.stationAt = function (q) {
    for (const S of R.stations) {
      const m = Math.max(S.maxTurn, S.maxTurnR) + 140;
      if (q > S.zoneStart - m && q < S.zoneEnd + m) return S;
    }
    return null;
  };
  R.latTrack = function (S, side, k, q) {
    const base = side * TS.MAIN;
    const off = (side < 0 ? S.left : S.right)[k];
    if (k === 0 || off === undefined) return base;
    const L = TS.turnoutLen(off - base);
    const a = S.zoneStart - 40, b = S.zoneEnd + 40;
    if (q < a) { if (S.first) return off; return base + (off - base) * TS.smooth((q - (a - L)) / L); }
    if (q > b) { if (S.last) return off; return base + (off - base) * TS.smooth(1 - (q - b) / L); }
    return off;
  };
  R.lat = function (q, path) {
    const S = R.stationAt(q);
    if (!S) return path.side * TS.MAIN;
    const k = path.pick ? (path.pick[S.i] || 0) : 0;
    return R.latTrack(S, path.side, k, q);
  };

  /* ── Signalisation ── */
  const sig = (s, type, extra) => R.signals.push(Object.assign({ s, type }, extra));
  R.stations.forEach((S, i) => {
    if (i > 0) {
      const ce = S.zoneStart - 40 - S.maxTurn - 40;
      S.ceS = ce;
      const lvD = Math.min(baseV(ce - 3000), cfg.vmax) / 3.6;
      S.dS = ce - Math.max(1500, lvD * lvD / (2 * 0.7) + 300);
      sig(S.dS, 'D', { st: i });
      sig(ce, 'CE', { st: i });
    }
    if (!S.last) { S.csS = S.zoneEnd + 10; sig(S.csS, 'CS', { st: i }); }
  });
  for (let i = 0; i + 1 < R.stations.length; i++) {
    const a = R.stations[i], b = R.stations[i + 1];
    const from = a.csS + a.maxTurn + 1100, to = b.dS - 900;
    const span = to - from;
    if (span < 600) continue;
    const lv = Math.min(baseV((a.s + b.s) / 2), cfg.vmax) / 3.6;
    const spacing = inLGV((a.s + b.s) / 2) ? 1900 : Math.max(1600, lv * lv / (2 * 0.7) + 450);
    const nb = Math.max(1, Math.round(span / spacing));
    for (let k = 0; k <= nb; k++) {
      const q = from + span * k / nb + (k > 0 && k < nb ? (rnd() - 0.5) * 300 : 0);
      sig(q, 'B', { tvm: inLGV(q) });
    }
  }
  R.signals.sort((a, b) => a.s - b.s);
  R.signals.forEach((g, j) => { g.j = j; });

  /* ── Électrification et sections de séparation ── */
  // LGV toujours en 25 kV, sinon tension de la gare la plus proche
  const wantV = q => {
    if (inLGV(q)) return 25000;
    let best = R.stations[0], bd = Infinity;
    for (const S of R.stations) { const d = Math.abs(S.s - q); if (d < bd) { bd = d; best = S; } }
    return best.st.v;
  };
  let vs = wantV(0), vstart = -1e4;
  for (let q = 0; q < R.len; q += 250) {
    const w = wantV(q);
    if (w === vs) continue;
    let c = q;
    const z = R.lgv.find(z => Math.abs(z.s0 - q) < 300 || Math.abs(z.s1 - q) < 300);
    if (z) c = Math.abs(z.s0 - q) < 300 ? z.s0 - 1500 : z.s1 + 1500;
    for (const g of R.signals) if (Math.abs(g.s - c) < 260) c = g.s + 300;
    if (R.stationAt(c)) { const S = R.stationAt(c); c = c < S.s ? S.zoneStart - S.maxTurn - 2500 : S.zoneEnd + S.maxTurn + 1800; }
    R.volt.push({ s0: vstart, s1: c, v: vs });
    R.neutral.push({ s0: c - 90, s1: c + 90, from: vs, to: w });
    R.signs.push({ s: c - 1100, kind: 'cca', from: vs, to: w });
    R.signs.push({ s: c - 300, kind: 'ccdj' });
    R.signs.push({ s: c + 150, kind: 'ccfin' });
    vs = w; vstart = c;
    q = Math.max(q, c + 500);
  }
  R.volt.push({ s0: vstart, s1: R.len + 1e4, v: vs });
  R.voltAt = q => { for (const z of R.volt) if (q >= z.s0 && q < z.s1) return z.v; return vs; };
  R.inNeutral = q => R.neutral.some(z => q >= z.s0 && q <= z.s1);

  /* ── Zones de vitesse en gare ── */
  R.stations.forEach((S, i) => {
    const off = S.left[S.our];
    const L = S.our ? TS.turnoutLen(off + TS.MAIN) : 0;
    if (S.our) {
      if (!S.first) R.zones.push({ s0: S.zoneStart - 40 - L - 20, s1: S.zoneStart, v: 60, dev: true });
      if (!S.last) R.zones.push({ s0: S.zoneEnd, s1: S.zoneEnd + 40 + L + 20, v: 60, dev: true });
    } else if (!S.first && !S.last && !inLGV(S.s)) {
      R.zones.push({ s0: S.zoneStart - 300, s1: S.zoneEnd + 300, v: 160, gare: true });
    }
    if (S.last) R.zones.push({ s0: S.zoneStart - 150, s1: R.len + 100, v: 30, term: true });
  });

  /* index par kilomètre */
  R.zbuck = [];
  R.zones.forEach((zn, idx) => {
    const a = Math.max(0, Math.floor(zn.s0 / 1000)), b = Math.min(Math.floor(R.len / 1000) + 2, Math.floor(zn.s1 / 1000));
    for (let k = a; k <= b; k++) (R.zbuck[k] = R.zbuck[k] || []).push(idx);
  });
  const effBase = (q, list) => {
    let v = 0, o = 0;
    for (const zn of list) if (zn.base && q >= zn.s0 && q < zn.s1) { if (zn.over) o = zn.v; else if (!v || zn.v < v) v = zn.v; }
    return o || v || 160;
  };
  R.limitWin = function (a, b) {
    let v = 999;
    const ka = Math.max(0, Math.floor(a / 1000)), kb = Math.max(0, Math.floor(b / 1000));
    const list = [];
    for (let k = ka; k <= kb; k++) {
      const L = R.zbuck[k]; if (!L) continue;
      for (const idx of L) { const zn = R.zones[idx]; if (zn.s1 >= a && zn.s0 <= b) list.push(zn); }
    }
    const pts = [a, b];
    for (const zn of list) {
      if (!zn.base) { if (zn.v < v) v = zn.v; continue; }
      if (zn.s0 > a && zn.s0 < b) pts.push(zn.s0);
      if (zn.s1 > a && zn.s1 < b) pts.push(zn.s1 - 0.01);
    }
    for (const q of pts) { const e = effBase(q, list); if (e < v) v = e; }
    return v;
  };
  R.limitAt = q => R.limitWin(q, q);
  // prochaine baisse de vitesse en avant de q
  R.nextLimit = function (q, cur, range) {
    for (let d = 25; d <= range; d += 25) {
      const v = R.limitAt(q + d);
      if (v < cur) {
        let lo = q + d - 25, hi = q + d;
        for (let k = 0; k < 6; k++) { const m = (lo + hi) / 2; if (R.limitAt(m) < cur) hi = m; else lo = m; }
        return { s0: hi, v };
      }
    }
    return null;
  };
  R.isLGV = q => inLGV(q);

  /* ── Panneaux TIV (à distance, Z, R) ── */
  R.zones.filter(zn => zn.curve || zn.term).forEach(zn => {
    const before = R.limitAt(zn.s0 - 5);
    if (zn.v >= before) return;
    const vb = before / 3.6, va = zn.v / 3.6;
    const d = Math.max(800, (vb * vb - va * va) / (2 * 0.45) + 400);
    R.signs.push({ s: zn.s0 - d, kind: 'tivd', v: zn.v });
    R.signs.push({ s: zn.s0, kind: 'z' });
    if (!zn.term) R.signs.push({ s: zn.s1, kind: 'r' });
  });
  R.lgv.forEach(z => {
    R.signs.push({ s: z.s0, kind: 'tvmdeb' });
    R.signs.push({ s: z.s1, kind: 'tvmfin' });
    const vb = z.v / 3.6, va = 160 / 3.6;
    R.signs.push({ s: z.s1 - ((vb * vb - va * va) / (2 * 0.45) + 600), kind: 'tivd', v: 160 });
  });
  R.signs.sort((a, b) => a.s - b.s);

  /* ── Décor : ponts routiers, villages ── */
  for (let q = 3000; q < R.len - 2000; q += 3000 + rnd() * 9000) {
    if (protect.some(p => q > p[0] - 300 && q < p[1] + 300)) continue;
    if (R.signals.some(g => Math.abs(g.s - q) < 80)) continue;
    R.bridges.push({ s: q, ang: (rnd() - 0.5) * 0.6 });
  }
  for (let q = 4000; q < R.len - 2000; q += 5000 + rnd() * 14000) {
    if (protect.some(p => q > p[0] && q < p[1])) continue;
    R.villages.push({ s: q, side: rnd() < 0.5 ? -1 : 1, size: 6 + Math.floor(rnd() * 22), d: 40 + rnd() * 160 });
  }

  /* ── Échantillonnage ── */
  const out = { x: 0, y: 0, z: 0, h: 0 };
  R.sample = function (q, o) {
    o = o || out;
    let f = (q - s0) / step;
    if (f < 0) f = 0; if (f > n - 1.001) f = n - 1.001;
    const i = f | 0, t = f - i;
    o.x = X[i] + (X[i + 1] - X[i]) * t;
    o.z = Z[i] + (Z[i + 1] - Z[i]) * t;
    o.y = Y[i] + (Y[i + 1] - Y[i]) * t;
    o.h = H[i] + (H[i + 1] - H[i]) * t;
    return o;
  };
  // point monde (double précision) à l'abscisse q, décalage latéral lat (positif = droite) et hauteur dy
  R.point = function (q, lat, dy, o) {
    const p = R.sample(q, o);
    const c = Math.cos(p.h), sn = Math.sin(p.h);
    p.x += -c * lat; p.z += sn * lat; p.y += dy || 0;
    return p;
  };
  R.grade = q => (R.sample(q + 10, {}).y - R.sample(q - 10, {}).y) / 20;

  /* ── Horaire ── */
  let t = cfg.startTime + cfg.prepTime;
  R.stations.forEach((S, i) => {
    if (i === 0) { S.arr = null; S.dep = t; return; }
    const a = R.stations[i - 1];
    const d = S.s - a.s;
    // vitesse moyenne de marche
    let tt = 0;
    const N = 40;
    for (let k = 0; k < N; k++) {
      const q = a.s + d * (k + 0.5) / N;
      const v = Math.min(R.limitAt(q), cfg.vmax) / 3.6;
      tt += d / N / (v * 0.86);
    }
    tt += (a.stop ? 70 : 0) + (S.stop ? 70 : 0) + 60;
    t += tt;
    S.arr = Math.ceil(t / 60) * 60;
    t = S.arr;
    if (S.stop && !S.last) { t += S.big ? 180 : 60; S.dep = t; }
    else S.dep = S.stop ? null : S.arr;
  });

  return R;
};
