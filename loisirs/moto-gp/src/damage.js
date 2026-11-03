// Dégâts localisés : aileron AV/AR, plancher, moteur, suspensions, roues, rétroviseurs. Les pièces détachées sont signalées via car.onDetach.
(function () {
  const A = (globalThis.MGP = globalThis.MGP || {});

  A.newDamage = () => ({ fw: 1, rw: 1, floor: 1, engine: 1, susp: [1, 1], wheel: [true, true], mirL: true, mirR: true, fwOff: false, rwOff: false });

  // lx, ly : point d'impact en repère corps (x avant, y gauche) ; sev : vitesse normale relative (m/s)
  A.applyHit = (car, lx, ly, sev) => {
    if (sev < 2) return;
    const d = car.d, k = Math.min(2, (sev - 2) / 6), out = [];
    const off = (key, part, w) => { if (w == null) { if (d[key]) return; d[key] = true; } else { if (!d.wheel[w]) return; d.wheel[w] = false; } out.push(part); };
    const sideW = front => (front ? 0 : 1);
    if (lx > 0.45) { // avant
      d.fw = Math.max(0, d.fw - k * (1.1 - 0.4 * Math.min(1, Math.abs(ly))));
      if (d.fw <= 0.3) off('fwOff', 'fw');
      if (sev > 3 && Math.abs(ly) > 0.15) off(ly > 0 ? 'mirL' : 'mirR', ly > 0 ? 'mirL' : 'mirR');
      d.floor = Math.max(0, d.floor - k * 0.08);
      d.susp[0] = Math.max(0, d.susp[0] - k * 0.3);
    } else if (lx < -0.45) { // arrière
      d.rw = Math.max(0, d.rw - k * (1.1 - 0.4 * Math.min(1, Math.abs(ly))));
      if (d.rw <= 0.3) off('rwOff', 'rw');
      d.engine = Math.max(0.2, d.engine - k * 0.18);
      d.susp[1] = Math.max(0, d.susp[1] - k * 0.3);
    } else { // flanc
      d.floor = Math.max(0, d.floor - k * 0.35);
      const w = sideW(lx > -0.1);
      d.susp[w] = Math.max(0, d.susp[w] - k * 0.4);
      if (sev > 2.5) off(ly > 0 ? 'mirL' : 'mirR', ly > 0 ? 'mirL' : 'mirR');
    }
    for (let w = 0; w < 2; w++) if (d.susp[w] <= 0 && d.wheel[w]) off(null, 'wheel' + w, w);
    // gros choc : roue arrachée même si la suspension tient
    if (sev > 9) { const w = sideW(lx > 0); if (Math.random() < 0.6) off(null, 'wheel' + w, w); }
    if (out.length && car.onDetach) out.forEach(p => car.onDetach(car, p));
    if (car.onDamage) car.onDamage(car, sev);
    // chute : un choc violent ou un mur envoie le pilote au sol

  };

  // 0 = neuve, 1 = ruinée (pour HUD / radio / décision d'arrêt)
  A.damageScore = d => Math.min(1, (1 - d.fw) * 0.35 + (1 - d.rw) * 0.3 + (1 - d.floor) * 0.15 + (1 - d.engine) * 0.2 + d.wheel.filter(w => !w).length * 0.5 + d.susp.reduce((a, s) => a + (1 - s) * 0.12, 0));

  // arrêt au stand : changer les ailerons / la suspension remet à neuf (on ne remplace pas une roue arrachée en course : le pneu est changé au stand)
  A.repair = (car, what) => {
    const d = car.d;
    if (what.wing) { d.fw = 1; d.rw = 1; d.fwOff = d.rwOff = false; d.floor = Math.max(d.floor, 0.85); }
    if (what.all) { Object.assign(d, A.newDamage()); }
    else { for (let w = 0; w < 2; w++) { d.wheel[w] = true; d.susp[w] = Math.max(d.susp[w], 0.9); } d.mirL = d.mirR = true; }
    if (car.onRepair) car.onRepair(car);
  };
})();
