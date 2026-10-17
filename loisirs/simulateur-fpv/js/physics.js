'use strict';
/* Modèle de vol du quadricoptère.
   Repère corps (three.js) : avant = -Z, haut = +Y, droite = +X.
   Le contrôleur de vol (comme Betaflight) asservit des vitesses de rotation ; les moteurs ont
   un temps de réponse, la poussée dépend de la vitesse d'air traversant les hélices, la traînée
   est anisotrope, la batterie s'affaisse sous charge et le propwash secoue le drone en descente. */

const Quad = (() => {
  const V3 = THREE.Vector3, Q = THREE.Quaternion;
  const G = 9.81, RHO = 1.2;
  const st = {
    pos: new V3(), vel: new V3(), q: new Q(), w: new V3(), // w : vitesses angulaires corps (rad/s)
    motor: 0, motorRate: new V3(),   // motor : régime moyen 0..1
    armed: false, crashed: false, armTime: 0,
    soc: 1, mah: 0, volt: 25.2, amps: 0,
    thrust: 0, impact: 0, grounded: false, propwash: 0, vrs: 0,
    sp: new V3(), lastContact: 0,
  };
  let P = QUADS.five;
  const tmpV = new V3(), tmpV2 = new V3(), up = new V3(), airVel = new V3(), vb = new V3(), F = new V3();
  const qInv = new Q(), dq = new Q(), euler = new THREE.Euler(0, 0, 0, 'YXZ');
  const contacts = [];
  const pw = { x: 0, y: 0, z: 0, tx: 0, ty: 0, tz: 0, t: 0 }; // bruit filtré du propwash
  let wind = new V3(), onCrash = null, onImpact = null;

  function setQuad(key) { P = QUADS[key] || QUADS.five; }

  function reset(pos, yaw) {
    st.pos.copy(pos); st.pos.y += P.radius + 0.01;
    st.vel.set(0, 0, 0); st.w.set(0, 0, 0);
    st.q.setFromEuler(new THREE.Euler(0, yaw, 0, 'YXZ'));
    st.motor = 0; st.armed = false; st.crashed = false; st.armTime = 0;
    st.soc = 1; st.mah = 0; st.impact = 0; st.propwash = 0; st.vrs = 0;
  }

  function cellOcv(soc) {
    // Courbe LiPo approximative : 4.2 V plein, plateau ~3.8 V, chute sous 15 %
    return 3.3 + 0.62 * soc + 0.28 * Math.pow(soc, 4) - 0.35 * Math.pow(1 - soc, 10);
  }

  function rand() { return Math.random() * 2 - 1; }

  /* in : { thrCmd, yaw, pitch, roll }, S : réglages */
  function step(dt, inp, S) {
    const armed = st.armed && !st.crashed;
    const cells = P.cells;

    // ── Batterie ──
    const rest = cellOcv(st.soc) * cells;
    st.amps = armed ? 0.6 + P.imax * Math.pow(st.motor, 1.7) : 0.15;
    const rPack = cells * (P.cells === 1 ? 0.03 : 0.0045);
    st.volt = Math.max(cells * 2.8, rest - st.amps * rPack);
    if (S.battery === 'real') {
      st.mah += st.amps * dt / 3.6;
      st.soc = Math.max(0, 1 - st.mah / (P.mah * 0.95));
    }
    const vScale = Math.min(1.12, Math.max(0.3, st.volt / (cells * 3.7)));
    const tMax = P.mass * G * P.twr * Math.pow(vScale, 1.6);

    // ── Consignes du contrôleur de vol ──
    const sp = st.sp;
    const R = S.rates, D2R = Math.PI / 180;
    const yawRate = bfRate(inp.yaw, R.yaw) * D2R;
    if (S.flightMode === 'angle') {
      euler.setFromQuaternion(st.q);
      const maxA = S.angleMax * D2R;
      const tp = -inp.pitch * maxA, tr = -inp.roll * maxA;
      // tolère les grands angles en revenant doucement vers l'horizontale
      sp.x = Math.max(-8, Math.min(8, 7 * (tp - euler.x)));
      sp.z = Math.max(-8, Math.min(8, 7 * wrap(tr - euler.z)));
      sp.y = -yawRate;
      // compense le couplage roulis/lacet pour garder le cap
    } else {
      sp.x = -bfRate(inp.pitch, R.pitch) * D2R;
      sp.z = -bfRate(inp.roll, R.roll) * D2R;
      sp.y = -yawRate;
    }

    // ── Moteurs : régime moyen avec retard du premier ordre ──
    const thrIn = armed ? Math.max(0, Math.min(1, inp.thrCmd)) : 0;
    // ralenti moteur ~4 % quand armé (Betaflight dynamic idle)
    const thrTarget = armed ? 0.04 + thrIn * 0.96 : 0;
    const k = 1 - Math.exp(-dt / (armed ? P.motorTau : 0.25));
    st.motor += (thrTarget - st.motor) * k;

    // ── Rotation : autorité limitée par la marge moteur (mixer) ──
    let auth = 1;
    if (armed) {
      const head = Math.min(st.motor, 1 - st.motor) * 2; // marge pour différentiel
      auth = S.airmode ? 0.55 + 0.45 * Math.min(1, head * 3 + 0.3) : Math.min(1, st.motor * 4);
      auth *= vScale * vScale;
    } else auth = 0;

    const aMax = [P.angAcc * auth, P.yawAcc * auth, P.angAcc * auth];
    const tau = [P.rateTau, P.rateTau * 1.8, P.rateTau];
    const ax = ['x', 'y', 'z'];
    for (let i = 0; i < 3; i++) {
      const a = ax[i];
      if (armed) {
        let acc = (sp[a] - st.w[a]) / tau[i];
        acc = Math.max(-aMax[i], Math.min(aMax[i], acc));
        st.w[a] += acc * dt;
      } else {
        // désarmé : rotation amortie seulement par l'air
        st.w[a] *= Math.exp(-dt * (st.grounded ? 8 : 0.6));
      }
    }

    // ── Air relatif, vent ──
    airVel.copy(st.vel).sub(wind);
    up.set(0, 1, 0).applyQuaternion(st.q);
    const vAx = airVel.dot(up);                     // vitesse axiale (positive = monte dans l'axe)
    const vTot = airVel.length();
    const vPlane = Math.sqrt(Math.max(0, vTot * vTot - vAx * vAx));

    // ── Propwash & état de vortex (descente dans son propre flux) ──
    let wash = 0;
    if (armed && vAx < -1.2) {
      const desc = Math.min(1, (-vAx - 1.2) / 6);
      const lowH = Math.max(0, 1 - vPlane / 11);
      wash = desc * lowH * (0.35 + st.motor) * S.propwash;
    }
    st.propwash += (wash - st.propwash) * Math.min(1, dt * 12);
    st.vrs = armed ? Math.max(0, Math.min(1, (-vAx - 2.5) / 5)) * Math.max(0, 1 - vPlane / 7) : 0;

    pw.t -= dt;
    if (pw.t <= 0) { pw.t = 0.03 + Math.random() * 0.04; pw.tx = rand(); pw.ty = rand() * 0.4; pw.tz = rand(); }
    const pf = Math.min(1, dt * 40);
    pw.x += (pw.tx - pw.x) * pf; pw.y += (pw.ty - pw.y) * pf; pw.z += (pw.tz - pw.z) * pf;
    if (st.propwash > 0.01) {
      const amp = st.propwash * 55 * dt;
      st.w.x += pw.x * amp; st.w.y += pw.y * amp; st.w.z += pw.z * amp;
    }
    // turbulence légère liée au vent
    const turb = S.wind * 0.06 * dt * (armed ? 1 : 0.3);
    st.w.x += rand() * turb; st.w.z += rand() * turb;

    // ── Intégration de l'attitude (vitesse angulaire en repère corps) ──
    const wl = st.w.length();
    if (wl > 1e-6) {
      tmpV.copy(st.w).multiplyScalar(1 / wl);
      dq.setFromAxisAngle(tmpV, wl * dt);
      st.q.multiply(dq).normalize();
    }

    // ── Poussée ──
    // T = Tmax·m·(m − vAx/vPitch) : décroît avec la vitesse d'air entrant dans les hélices
    const m = st.motor;
    let eff = m - vAx / P.vPitch;
    eff = Math.max(0, Math.min(m + 0.3, eff));
    let T = tMax * m * eff;
    T *= 1 - 0.35 * st.vrs * (0.6 + 0.4 * Math.abs(pw.y));   // perte de portance en vortex
    T *= 1 - st.propwash * 0.12 * (0.5 + 0.5 * pw.x);
    // effet de sol
    const h = st.pos.y - World.heightAt(st.pos.x, st.pos.z);
    const pd = P.prop * 4;
    if (h < pd) T *= 1 + 0.12 * (1 - Math.max(0, h) / pd);
    st.thrust = T;

    F.copy(up).multiplyScalar(T);
    F.y -= P.mass * G;

    // ── Traînée anisotrope (repère corps) + traînée induite des hélices ──
    qInv.copy(st.q).invert();
    vb.copy(airVel).applyQuaternion(qInv);
    const sp2 = vb.length();
    tmpV.set(
      -0.5 * RHO * P.cd[0] * sp2 * vb.x - P.hLin * (0.3 + m) * vb.x,
      -0.5 * RHO * P.cd[1] * sp2 * vb.y,
      -0.5 * RHO * P.cd[2] * sp2 * vb.z - P.hLin * (0.3 + m) * vb.z
    ).applyQuaternion(st.q);
    F.add(tmpV);

    st.vel.addScaledVector(F, dt / P.mass);
    st.pos.addScaledVector(st.vel, dt);

    // ── Collisions ──
    collide(dt, S);
  }

  function wrap(a) { while (a > Math.PI) a -= 2 * Math.PI; while (a < -Math.PI) a += 2 * Math.PI; return a; }

  function collide(dt, S) {
    World.collide(st.pos, P.radius, contacts);
    st.grounded = false;
    let maxImpact = 0;
    for (const c of contacts) {
      st.pos.addScaledVector(c.n, c.d);
      // vitesse relative à l'obstacle (voitures, pales d'éolienne)
      tmpV2.copy(st.vel);
      if (c.v) tmpV2.sub(c.v);
      const vn = tmpV2.dot(c.n);
      if (vn < 0) {
        maxImpact = Math.max(maxImpact, -vn);
        const e = -vn > 2 ? 0.28 : 0.05;
        tmpV2.addScaledVector(c.n, -(1 + e) * vn);
        // frottement tangentiel
        const mu = c.n.y > 0.7 ? 0.65 : 0.35;
        const vnNew = tmpV2.dot(c.n);
        tmpV.copy(tmpV2).addScaledVector(c.n, -vnNew);
        const vt = tmpV.length();
        if (vt > 1e-4) tmpV2.addScaledVector(tmpV, -Math.min(1, mu * (-vn + 1.5) / vt));
        st.vel.copy(tmpV2);
        if (c.v) st.vel.add(c.v);
      }
      if (c.n.y > 0.6) st.grounded = true;
    }
    if (maxImpact > 0.5) {
      // les hélices qui tapent font partir le drone en vrille
      const spin = Math.min(25, maxImpact * 1.6);
      st.w.x += rand() * spin; st.w.y += rand() * spin * 0.5; st.w.z += rand() * spin;
      st.impact = Math.max(st.impact, maxImpact);
      if (onImpact) onImpact(maxImpact);
      if (S.crash === 'real' && st.armed && !st.crashed && maxImpact > P.crash) {
        st.crashed = true; st.armed = false;
        if (onCrash) onCrash(maxImpact);
      }
    }
    // Au sol, posé et sans gaz : se couche sur ses patins ou sur le dos
    if (st.grounded && st.motor < 0.2) {
      st.w.multiplyScalar(Math.exp(-dt * 10));
      up.set(0, 1, 0).applyQuaternion(st.q);
      const target = up.y > -0.2 ? 1 : -1;
      tmpV.set(0, target, 0);
      const ang = up.angleTo(tmpV);
      if (ang > 0.01) {
        tmpV2.crossVectors(up, tmpV).normalize();
        dq.setFromAxisAngle(tmpV2, Math.min(ang, dt * 4));
        st.q.premultiply(dq).normalize();
      }
      st.vel.x *= Math.exp(-dt * 4); st.vel.z *= Math.exp(-dt * 4);
    }
  }

  function setWind(v) { wind.copy(v); }

  return {
    st, step, reset, setQuad, setWind,
    get P() { return P; },
    set onCrash(f) { onCrash = f; },
    set onImpact(f) { onImpact = f; },
    tryArm(thrCmd) {
      if (st.crashed) return 'CRASH : RESET';
      if (thrCmd > 0.06) return 'GAZ NON NUL';
      st.armed = true; st.armTime = 0; return null;
    },
    disarm() { st.armed = false; },
  };
})();
