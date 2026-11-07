// Physique de moto faite main : modèle à deux roues (avant/arrière), transfert de masse (wheelie, stoppie), adhérence par pneu (ellipse de friction).
// L'angle d'inclinaison découle de l'accélération latérale : lean = atan(ay / g). Chute si le pneu avant dépasse son pic d'adhérence trop longtemps.
// Repère corps : x avant, y gauche ; r > 0 = rotation vers la gauche ; h = cap (avant = (sin h, cos h)).
(function () {
  const A = (globalThis.MGP = globalThis.MGP || {});
  const PH = (A.PHYS = {
    a: 0.74, b: 0.71, L: 1.45, hcg: 0.66, Iz: 58, mass: 242,
    kdf: 0.012, kdrag: 0.205, pmax: 205e3, fmax: 4800, brake: 9000, brakeG: 4.2, ride: 0.012,
    VRED: [26, 39, 51, 63, 79, 98], NG: 6,
  });
  A.WHEEL_X = [PH.a, -PH.b]; A.WHEEL_Y = [0, 0];
  const CRR = [0.012, 0.03, 0.1, 0.28];
  const clamp = A.clamp, REAR_GRIP = 1.1;

  // Un seul mode de pilotage : aides forcées, la moto ne peut pas chuter.
  A.RIDING = { arcade: { name: 'Pilotage', grip: 1.12, crashAl: 0, crashT: 9, lockCrash: 9, hcg: 0.9, steerRate: 1.5, forceAids: true } };

  // braquage maximal : plein braquage ≈ limite d'adhérence à toute vitesse
  A.bikeDmax = sp => Math.min(0.55, 52 / (sp * sp + 40));

  // Freinage max : décélération limitée par le basculement avant (stoppie), avec l'appui aéro et le poids pilote ; brakeG règle la puissance
  const BRAKE_GRIP = 1.7;
  A.brakeAccel = () => (PH.brakeG * A.G * PH.a) / (PH.hcg * A.RIDING.arcade.hcg);
  // Part de l'adhérence réservée au freinage (0..1) : décélération demandée / décélération max
  // charge de freinage (réduit le braquage) : calée sur l'ancienne référence brakeG 1,4 pour que le braquage au freinage reste identique malgré les freins plus puissants
  A.brakeLoad = brk => Math.min(1, Math.max(0, brk) * PH.brake / (PH.mass + 12) / (A.brakeAccel() * 1.4 / PH.brakeG));
  // Part de braquage utilisable : cercle de friction (le freinage prend de l'adhérence latérale), qui revient quand la moto ralentit
  A.steerGrip = (sp, rb) => 1 - (1 - Math.sqrt(Math.max(0.02, 1 - 0.92 * rb * rb))) * Math.min(1, sp / 24);

  A.damageFx = d => ({ fwF: 0.35 + 0.65 * d.fw, rwF: 0.35 + 0.65 * d.rw, floorF: 0.55 + 0.45 * d.floor });

  A.crashBike = (car, why) => {
    return; // chute désactivée
    if (car.crash > 0 || car.isSC) return;
    car.crash = 1.9; car.crashWhy = why || 'slide'; car.crashDir = car.lean >= 0 ? 1 : -1; car.crashes = (car.crashes || 0) + 1;
    if (car.onCrash) car.onCrash(car, why);
  };

  A.stepCar = (car, dt, env) => {
    const wet = env.wet, m = PH.mass + car.fuel, G = A.G, rd = A.RIDING.arcade;
    let u = car.u, v = car.v, r = car.r;
    const sp = Math.abs(u), d = car.d, inp = car.in;

    // chute : glissade sur le bitume/gravier, plus de commande
    if (car.crash > 0) {
      car.crash -= dt;
      const gr = car.surf[0] >= 2 ? 11 : 7.5;
      u = Math.max(0, u - gr * dt); v *= 1 - Math.min(1, dt * 3); r *= 1 - Math.min(1, dt * 4);
      car.u = u; car.v = v; car.r = r; car.h += r * dt;
      const sh = Math.sin(car.h), ch = Math.cos(car.h);
      car.x += (u * sh + v * ch) * dt; car.z += (u * ch - v * sh) * dt;
      car.lean += (car.crashDir * 1.45 - car.lean) * Math.min(1, dt * 7); car.pitch *= 1 - Math.min(1, dt * 5);
      car.rpm = 5000; car.t += dt; car.ax = -gr; car.ay = 0; car.slip = 0; car.locked = 0; car.spun = 0;
      return;
    }

    let thr = clamp(inp.thr, 0, 1), brk = clamp(inp.brk, 0, 1), rbrk = clamp(inp.rbrk || 0, 0, 1);
    if (car.limiter) {
      const over = u - A.PIT_LIMIT;
      if (over > -2) thr *= clamp(1 - (over + 2) / 2, 0, 1);
      if (over > 0) brk = Math.max(brk, clamp(over * 0.25, 0, 0.6));
    }
    if (car.fuel <= 0) thr = 0;
    // pilote humain : penché, l'adhérence est déjà prise par le virage. Gaz plafonnés (sans relever la moto) et freins plus doux, jusqu'à ce qu'on se redresse.
    if (car.isPlayer) {
      const lf = clamp(1 - (car.lean / 1.05) ** 2, 0, 1);
      thr *= Math.sqrt(lf);
      brk *= 0.3 + 0.7 * Math.sqrt(lf);
    }

    // direction : angle limité en vitesse, avec vitesse de rotation bornée par le niveau de pilotage
    const dmax = A.bikeDmax(sp) * A.steerGrip(sp, A.brakeLoad(brk)), srate = 1.3 * rd.steerRate * dt * (0.2 + 4 / (1 + sp / 6));
    car.delta += clamp(inp.steer * dmax - car.delta, -srate, srate);

    // boîte de vitesses
    const V = PH.VRED, g = car.gear, NG = PH.NG;
    if (car.shiftT > 0) car.shiftT -= dt;
    if (car.auto) {
      if (car.shiftT <= 0) {
        if (g < NG && u > V[g - 1] * 0.94) { car.gear++; car.shiftT = 0.1; }
        else if (g > 1 && u < V[g - 2] * 0.8) { car.gear--; car.shiftT = 0.06; }
      }
    } else {
      if (inp.up && g < NG) { car.gear++; car.shiftT = 0.1; }
      if (inp.down && g > 1) { car.gear--; car.shiftT = 0.06; }
    }
    inp.up = inp.down = false;
    const rpm = (car.rpm = u < 3 ? 5000 + 7000 * thr : 5000 + 12500 * Math.min(1.03, u / V[car.gear - 1]));
    const hcg = PH.hcg * rd.hcg;

    // aérodynamique
    const fx = A.damageFx(d), wing = car.setup.wing, aeroK = (0.8 + 0.4 * wing) * car.perf.aero * fx.floorF;
    const q2 = sp * sp, DF = PH.kdf * q2 * aeroK;
    const Fdrag = PH.kdrag * q2 * (0.9 + 0.2 * wing) * (1 + 0.1 * (1 - d.fw));

    // moteur, avec anti-wheelie : la poussée est bornée pour garder du poids sur la roue avant
    let Fdrive = 0;
    if (car.shiftT <= 0 && rpm < 17500 && thr > 0) {
      const ts = clamp(0.78 + 0.22 * (rpm - 5000) / 8000, 0.6, 1);
      const pw = PH.pmax * car.perf.power * ts * thr * (car.fuelSave ? 0.93 : 1) * (0.5 + 0.5 * d.engine);
      Fdrive = Math.min(pw / Math.max(sp, 8), PH.fmax * thr);
      if (car.assists.wheelie || rd.forceAids) Fdrive = Math.min(Fdrive, (m * G * PH.b) / hcg * 0.86 + Fdrag + PH.ride * m * G);
    }

    // charges par axe (transfert longitudinal)
    const ax = car.axL;
    const Wf = (m * G * PH.b) / PH.L, Wr = (m * G * PH.a) / PH.L, tl = (m * ax * hcg) / PH.L;
    const axleF = Math.max(150, Wf + DF * 0.4 * fx.fwF - tl), axleR = Math.max(200, Wr + DF * 0.6 * fx.rwF + tl);

    // freinage borné : au-delà, la roue arrière décolle (stoppie) et la moto perd toute stabilité
    const aLim = A.brakeAccel(), bias = car.setup.bias, Fb = Math.min(brk * PH.brake, m * aLim), Fr = rbrk * PH.brake * 0.2;
    const pfF = (21 - car.setup.pF) / 10, pfR = (21 - car.setup.pR) / 10;
    const sgn = u >= 0 ? 1 : -1;
    let Sx = 0, Sy = 0, Mz = 0, locked = 0, spun = 0, aMax = 0;

    for (let w = 0; w < 2; w++) {
      const front = w === 0, xw = front ? PH.a : -PH.b, tire = car.tires[w];
      if (!d.wheel[w]) { // roue arrachée : la jante racle le sol
        Sx += -sgn * Math.min(900, 250 + sp * 20); continue;
      }
      const Fz = front ? axleF : axleR;
      const mu = tire.mu(Fz, wet, car.surf[w], front ? pfF : pfR, car.perf.grip * rd.grip * (car.isPlayer ? 1.8 : 1)) * (0.5 + 0.5 * d.susp[w]);
      const Fmax = mu * Fz * (front ? 1 : REAR_GRIP);
      const uy = v + r * xw;
      const dw = front ? car.delta : 0;
      const c = Math.cos(dw), s = Math.sin(dw);
      const vlong = u * c + uy * s, vlat = -u * s + uy * c;
      // raideur de dérive constante (indépendante du transfert de charge) : sinon le train le plus chargé domine et la moto diverge au freinage
      const al = Math.atan2(vlat, Math.max(Math.abs(vlong), 4)) * Math.min(4, ((front ? Wf : Wr) / Fz) ** 0.95);
      if (front) car.alF = al; else car.alR = al;

      // la force latérale passe en premier ; le longitudinal ne dispose que du reste de l'ellipse
      const Fy0 = -Fmax * (front ? Math.sin(1.3 * Math.atan(24 * al)) : Math.sin(1.2 * Math.atan(28 * al))), fr = Fy0 / Fmax;
      const cap = Fmax * Math.sqrt(Math.max(0.01, 1 - fr * fr));
      const gB = 1 + (BRAKE_GRIP - 1) * (1 - fr * fr), capB = cap * gB; // les freins disposent de plus d'adhérence longitudinale, mais plus on demande de latéral, moins il en reste
      let bw = front ? bias * Fb : (1 - bias) * Fb + Fr;
      let dw_ = front ? 0 : Fdrive;
      let lock = false, spin = false;
      if (bw > 0.97 * capB) { if (car.assists.abs || rd.forceAids) bw = 0.92 * capB; else lock = true; }
      if (dw_ > 0.95 * cap) { if (car.assists.tc || rd.forceAids) dw_ = 0.9 * cap; else spin = true; }
      const vs = vlong >= 0 ? 1 : -1;
      let Fx = dw_ - bw * vs - CRR[car.surf[w]] * Fz * vs;
      let Fy = Fy0;
      if (lock) { Fx = -0.85 * Fmax * vs; Fy *= 0.35; locked++; if (front) car.lockT += dt; tire.flat += dt * 0.15; }
      else if (front) car.lockT = Math.max(0, car.lockT - dt * 2);
      if (spin) { Fx = 0.9 * Fmax; Fy *= 0.8; spun++; }
      if (lock || spin) Fy *= Math.sqrt(Math.max(0.04, 1 - (Fx * Fx) / (Fmax * Fmax)));
      else { Fx = clamp(Fx, -capB, cap); if (front) Fy *= Math.sqrt(Math.max(0.12, 1 - 0.9 * (Fx * Fx) / (Fmax * Fmax))); } // freiner réduit l'adhérence latérale du pneu avant (cercle de friction)
      const Fxb = Fx * c - Fy * s, Fyb = Fx * s + Fy * c;
      Sx += Fxb; Sy += Fyb; Mz += xw * Fyb;

      // énergie dissipée -> échauffement et usure
      const ux_ = Math.abs(Fx) / Fmax, slipL = lock ? 0.6 * sp : spin ? 0.2 * sp + 3 : 0.015 * sp * ux_ * ux_ + 0.1;
      const P = Math.abs(Fy) * Math.abs(vlat) + Math.abs(Fx) * slipL;
      tire.P = P; tire.Fz = Fz;
      tire.thermal(dt, P, Fz, sp, env.air, wet, front ? pfF : pfR, car.perf.care);
      if (Math.abs(al) > aMax) aMax = Math.abs(al);
    }
    car.slip = aMax; car.locked = locked; car.spun = spun;

    // forces globales
    Sx += -sgn * (Fdrag + PH.ride * m * G);
    Sy += m * G * Math.sin(car.bank);
    car.ax += (Sx / m - car.ax) * 0.25; car.ay += (Sy / m - car.ay) * 0.25; car.axL += (Sx / m - car.axL) * Math.min(1, dt / 0.1);

    // amortissement de lacet : gyroscopique, chasse de la fourche et pilote stabilisent la moto (le modèle à 2 pneus seul diverge au freinage)
    Mz -= PH.Iz * (7 + 20 * A.brakeLoad(brk)) * r * Math.min(1, sp / 8); // plus de stabilité au freinage (rear délesté)
    u += (Sx / m + v * r) * dt; v += (Sy / m - u * r) * dt; r += (Mz / PH.Iz) * dt;
    if (u < -1) u = -1;
    if (sp < 3 && thr < 0.05) { const k = 1 - Math.min(1, dt * 4); u *= k; v *= k; r *= k; }
    if (car.isPlayer && sp > 10) v *= Math.exp(-Math.min(14, 2 + sp * 0.12) * dt); // joueur : le dérapage latéral est résorbé très vite (pas de dérapage)
    if (car.isPlayer && sp > 5) { const rM = 2.6 * G / sp; r = clamp(r, -rM, rM); } // joueur : lacet borné à ~2,6 G latéral, pas de tête-à-queue
    car.u = u; car.v = v; car.r = r;
    car.h += r * dt;
    const sh = Math.sin(car.h), ch = Math.cos(car.h);
    car.x += (u * sh + v * ch) * dt; car.z += (u * ch - v * sh) * dt;
    car.fuel = Math.max(0, car.fuel - (0.003 + 0.011 * thr) * (car.fuelSave ? 0.85 : 1) * dt);
    car.t += dt;
    car.odo += sp * dt;

    // inclinaison : lean = atan(a_lat / g), lissée ; gauche = positif. Tangage : wheelie / stoppie.
    const target = Math.atan2(u * r, G);
    car.lean += (target - car.lean) * Math.min(1, dt * 11);
    const axl = (PH.b * G) / hcg, wheelie = clamp((car.axL - 0.88 * axl) / (0.25 * axl), 0, 1), stoppie = clamp((-car.axL - 0.85 * axl) / (0.3 * axl), 0, 1);
    car.pitch += (wheelie * 0.62 - stoppie * 0.22 - car.pitch) * Math.min(1, dt * 9);
    car.wheelie = wheelie;

    // limites : chute si le pneu avant dépasse son pic trop longtemps (ou blocage prolongé, ou fort glissement arrière)
    if (rd.crashAl > 0 && sp > 12) {
      const cAl = rd.crashAl * (car.crashK || 1), bad = Math.abs(car.alF) > cAl || Math.abs(car.alR) > cAl * 2.4;
      car.slideT = bad ? car.slideT + dt : Math.max(0, car.slideT - dt * 1.5);
      if (car.slideT > rd.crashT || car.lockT > rd.lockCrash) { A.crashBike(car, 'slide'); car.slideT = car.lockT = 0; }
    }
    // maxima d'angle pour l'affichage
    const lean = Math.min(Math.abs(car.lean), 1.12) * 57.2958;
    if (car.lean >= 0) { if (lean > car.leanMaxL) car.leanMaxL = lean; if (lean > car.leanLapL) car.leanLapL = lean; }
    else { if (lean > car.leanMaxR) car.leanMaxR = lean; if (lean > car.leanLapR) car.leanLapR = lean; }
  };
})();
