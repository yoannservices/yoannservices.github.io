// Moto + pilote : modèle détaillé de moto-rider (buildBikeRaw) aux couleurs de l'écurie. Une maquette par écurie (clonée pour les IA, géométries partagées),
// un modèle complet pour le joueur (bras animés, compteur 3D). Repère local : +Z avant, +X gauche, +Y haut, sol à y = 0.
(function () {
  const A = (globalThis.MGP = globalThis.MGP || {});
  const T = THREE;
  const protos = {};
  const WR = [0.305, 0.316], WZ = [0.76, -0.72], WX = [0, 0];
  A.WHEEL_R = WR; A.WHEEL_MZ = WZ; A.WHEEL_MX = WX;
  const DROP = -0.14; // le modèle de moto-rider flotte de 0,14 m : on le repose sur le sol
  const SILVER = 0x8a8f96;
  let lowMat, plateMat = {}, debrisMat;

  const mats = () => {
    if (lowMat) return;
    lowMat = new T.MeshStandardMaterial({ vertexColors: true, roughness: 0.45, metalness: 0.2 });
    debrisMat = new T.MeshStandardMaterial({ vertexColors: true, roughness: 0.5, metalness: 0.1 });
  };
  const spec = team => ({ id: 'v4r', col: [team.color, team.color2, SILVER] });

  const plateTex = n => A.canvasTex(64, 64, (c, w, h) => {
    c.fillStyle = '#f4f4f4'; c.beginPath(); c.arc(32, 32, 30, 0, 6.3); c.fill();
    c.fillStyle = '#111'; c.font = 'bold 34px sans-serif'; c.textAlign = 'center'; c.fillText(n, 32, 44);
  });

  // LOD lointain : un seul maillage fusionné (corps + 2 roues)
  const buildLow = team => A.merge([
    A.box(0.2, 0.34, 1.0, team.color, 0, 0.68, 0.1), A.box(0.18, 0.18, 0.7, team.color2, 0, 0.58, -0.45), A.box(0.2, 0.3, 0.4, team.color, 0, 0.9, 0.7, 0.3, 0, 0),
    A.box(0.14, 0.42, 0.26, 0x14171b, 0, 1.0, -0.15), A.part(new T.SphereGeometry(0.13, 8, 6), team.color2, 0, 1.3, 0.1),
    A.box(0.12, 0.62, 0.62, 0x1b1b1d, 0, 0.31, 0.76), A.box(0.19, 0.63, 0.63, 0x1b1b1d, 0, 0.316, -0.72),
  ]);


  // ---- vraie moto (Ducati V4 R, .glb) : découpée en pièces qui s'arrachent vraiment (roues, carénage avant, queue, rétros) ----
  // Les motos proches de la caméra utilisent le .glb ; les autres gardent la moto procédurale (plus légère).
  let glbBike = null, glbBikeP = null;
  const waiting = new Set();
  const pick = (o, c) => { // c : centre du triangle, repère de la moto (+Z avant, +X gauche)
    if (Math.abs(c.x) < 0.14) {
      if (Math.hypot(c.z - 0.71, c.y - 0.32) < 0.34) return 'w0';
      if (Math.hypot(c.z + 0.75, c.y - 0.32) < 0.345) return 'w1';
    }
    if (Math.abs(c.x) > 0.24 && c.y > 0.8 && c.z > 0.25 && c.z < 0.7) return c.x > 0 ? 'mirL' : 'mirR';
    if (c.z > 0.3 && c.y > 0.7) return 'fw';
    if (c.z < -0.5 && c.y > 0.62) return 'rw';
  };
  const loadBikeGLB = () => glbBikeP || (glbBikeP = (async () => {
    const G = await import(new URL('../../assets/glb.js', document.baseURI).href);
    const out = G.fitGLB(await G.loadGLB(new URL('../../assets/models/ducati-v4r.glb', document.baseURI).href), 2.05, 0);
    out.updateMatrixWorld(true);
    const C = G.carve(out, pick), centers = {};
    for (const k in C) { C[k].forEach(o => (o.userData.part = k)); const b = new T.Box3(); C[k].forEach(o => b.expandByObject(o)); centers[k] = b.getCenter(new T.Vector3()); }
    if (C.w0) G.pivotAt(out, new T.Vector3(0, 0.32, 0.71), C.w0).name = 'wheelF';
    if (C.w1) G.pivotAt(out, new T.Vector3(0, 0.32, -0.75), C.w1).name = 'wheelR';
    out.updateMatrixWorld(true);
    glbBike = { out, C, centers };
    waiting.forEach(upgrade); waiting.clear();
  })().catch(e => console.warn('Moto .glb non chargée', e)));

  const upgrade = m => {
    if (m.glb || !glbBike) return;
    m.procBike = [];
    m.inner.traverse(o => { if (o.isMesh && !m.plates.includes(o) && o.parent !== m.blob && o !== m.blob && !isUnder(o, m.rider)) m.procBike.push(o); });
    const vis = (m.glb = glbBike.out.clone(true)); vis.visible = false; m.inner.add(vis);
    m.gParts = {}; vis.traverse(o => { if (o.userData.part) (m.gParts[o.userData.part] = m.gParts[o.userData.part] || []).push(o); if (o.isMesh) { o.castShadow = false; m.casters.push(o); } });
    m.gWF = vis.getObjectByName('wheelF'); m.gWR = vis.getObjectByName('wheelR');
    m.glbOn = false; m.mask = -1; m.shadowOn = null;
  };
  const isUnder = (o, root) => { for (let p = o; p; p = p.parent) if (p === root) return true; return false; };

  const proto = ti => {
    if (protos[ti]) return protos[ti];
    const team = A.TEAMS[ti];
    const raw = A.buildBikeRaw(spec(team));
    raw.root.traverse(o => { if (o.isMesh) o.castShadow = false; });
    return (protos[ti] = { raw, low: buildLow(team) });
  };

  A.buildCarModel = (teamIdx, number, isPlayer) => {
    mats();
    const team = A.TEAMS[teamIdx % A.TEAMS.length];
    const P = proto(teamIdx % A.TEAMS.length);
    const m = { team, spin: [0, 0], lodFar: false, glb: null, comp: null };
    const root = (m.root = new T.Group()); root.rotation.order = 'YXZ';
    let hi;
    if (isPlayer) { const raw = A.buildBikeRaw(spec(team)); hi = raw.root; m.armRig = raw.armRig; m.dash = raw.dash; m.arms = raw.arms; }
    else hi = P.raw.root.clone(true);
    m.hi = hi; hi.position.y = DROP; root.add(hi);
    const g = n => hi.getObjectByName(n);
    m.leanG = g('leanG'); m.pitchG = g('pitchG'); m.inner = g('inner'); m.rider = g('rider'); m.headG = g('head'); m.torso = g('torso');
    m.st = g('st'); m.fwG = g('fw'); m.rwG = g('rw'); m.hl = g('hl'); m.blob = g('shadow'); m.tail = g('tail');
    m.spinF = m.fwG.getObjectByName('spin'); m.spinR = m.rwG.getObjectByName('spin');
    m.torsoQ0 = m.torso.quaternion.clone(); m.headP0 = m.headG.position.clone();
    m.helmet = { get visible() { return m.headG.visible; }, set visible(v) { m.headG.visible = v; m.torso.visible = v; } };
    // œil du pilote (caméra cockpit), dans le repère de l'inner
    m.head = new T.Object3D(); m.head.position.set(0, 1.3, 0.2); m.inner.add(m.head);
    // plaques de numéro : face avant et flancs de la queue
    const key = number;
    const pm = plateMat[key] || (plateMat[key] = new T.MeshBasicMaterial({ map: plateTex(number), transparent: true, side: T.DoubleSide }));
    m.plates = [];
    const plate = (w, x, y, z, ry, rx = 0) => { const o = new T.Mesh(new T.PlaneGeometry(w, w), pm); o.position.set(x, y, z); o.rotation.set(rx, ry, 0); m.inner.add(o); m.plates.push(o); return o; };
    plate(0.15, 0, 0.9, 1.0, 0, -0.35);
    plate(0.14, 0.105, 0.93, -0.62, Math.PI / 2); plate(0.14, -0.105, 0.93, -0.62, -Math.PI / 2);
    m.casters = [];
    hi.traverse(o => { if (o.isMesh && !o.userData.noCast && o.material !== pm && o.parent !== m.blob) { o.castShadow = false; m.casters.push(o); } });
    m.low = new T.Mesh(P.low, lowMat); m.low.visible = false;
    m.lowG = new T.Group(); m.lowG.add(m.low); root.add(m.lowG);
    m.shadowOn = false;
    if (glbBike) upgrade(m); else { waiting.add(m); loadBikeGLB(); }
    return m;
  };

  // Pièces détachées pour les débris : formes simples aux couleurs de l'écurie
  A.clonePart = (m, name) => {
    const pk = name.startsWith('wheel') ? 'w' + name[5] : name, list = glbBike && glbBike.C[pk];
    if (list && m.glb) {
      const ctr = glbBike.centers[pk], g = new T.Group();
      for (const s of list) { const o = new T.Mesh(s.geometry, s.material); o.applyMatrix4(s.matrixWorld); o.position.sub(ctr); o.castShadow = true; g.add(o); }
      g.userData.center = ctr; return g;
    }
    const c = m.team.color, c2 = m.team.color2;
    if (name === 'fw' || name === 'rw') return new T.Mesh(A.merge([A.box(0.3, 0.05, 0.4, c, 0, 0, 0), A.box(0.28, 0.2, 0.04, c2, 0, 0.1, 0.18)]), debrisMat);
    if (name === 'mirL' || name === 'mirR') return new T.Mesh(A.merge([A.box(0.1, 0.05, 0.04, 0x14171b, 0, 0, 0)]), debrisMat);
    if (name.startsWith('wheel')) { const w = +name[5], r = WR[w], g = new T.Group(); g.add(new T.Mesh(A.merge([A.part(new T.CylinderGeometry(r, r, w ? 0.19 : 0.12, 14), 0x1b1b1d, 0, 0, 0, 0, 0, Math.PI / 2)]), debrisMat)); return g; }
    return null;
  };

  const _q = new T.Quaternion(), _q2 = new T.Quaternion(), _ax = new T.Vector3(1, 0, 0), _zf = new T.Vector3(0, 0, 1), _v = new T.Vector3(), _v2 = new T.Vector3(), _v3 = new T.Vector3(), _yUp = new T.Vector3(0, 1, 0);
  const IK = (sh, grip, pole) => A.RK.ik2(sh, grip, 0.3, 0.28, pole);

  // Synchronise le modèle avec l'état physique. far : LOD lointain, cast : projette une ombre.
  A.syncModel = (car, m, dt, far, cast, near) => {
    const d = car.d, root = m.root;
    const rough = car.surf[0] === 1 || car.surf[1] === 1 ? Math.sin(car.t * 90) * 0.006 : 0;
    root.position.set(car.x, car.height + rough + (car.lift || 0), car.z);
    root.rotation.set(0, car.h, -car.bank, 'YXZ');
    const lean = car.lean, wob = car.crash > 0 ? 0 : 0;
    if (far !== m.lodFar) { m.lodFar = far; m.hi.visible = !far; m.low.visible = far; }
    if (far) { m.lowG.rotation.z = -lean; m.lowG.rotation.x = 0; m.low.castShadow = cast; return; }
    if (m.shadowOn !== cast) { m.shadowOn = cast; m.casters.forEach(o => (o.castShadow = cast)); }
    // inclinaison et tangage ; le pilote se décale vers l'intérieur du virage
    m.leanG.rotation.z = -lean; m.pitchG.rotation.x = -car.pitch;
    m.rider.position.x = A.clamp(lean * 0.55, -0.38, 0.38); // bassin déporté vers l'intérieur
    m.st.rotation.y = A.clamp(car.delta * 2.4, -0.6, 0.6);
    m.blob.visible = true;
    m.fwG.visible = d.wheel[0]; m.rwG.visible = d.wheel[1]; m.hl.visible = !d.fwOff; m.tail.visible = !d.rwOff;
    if (m.glb) {
      const useG = !!(car.isPlayer || near);
      if (useG !== m.glbOn) { m.glbOn = useG; m.glb.visible = useG; m.procBike.forEach(o => (o.visible = !useG)); }
      const mask = (d.fwOff ? 1 : 0) | (d.rwOff ? 2 : 0) | (d.mirL ? 0 : 4) | (d.mirR ? 0 : 8) | (d.wheel[0] ? 0 : 16) | (d.wheel[1] ? 0 : 32);
      if (mask !== m.mask) {
        m.mask = mask; const P = m.gParts, vis = (k, v) => P[k] && P[k].forEach(o => (o.visible = v));
        vis('fw', !d.fwOff); vis('rw', !d.rwOff); vis('mirL', d.mirL); vis('mirR', d.mirR);
        if (m.gWF) m.gWF.visible = d.wheel[0]; if (m.gWR) m.gWR.visible = d.wheel[1];
      }
    }
    if (d.wheel[0] && !(car.locked > 0 && car.in.brk > 0.5)) m.spin[0] += (car.u * dt) / WR[0];
    if (d.wheel[1]) m.spin[1] += (car.u * dt) / WR[1];
    m.spinF.rotation.x = m.spin[0]; m.spinR.rotation.x = m.spin[1];
    if (m.gWF) m.gWF.rotation.x = m.spin[0]; if (m.gWR) m.gWR.rotation.x = m.spin[1];
    // buste : penché vers l'intérieur autour des hanches (hang-off), se redresse au freinage, se couche à l'accélération
    const up = A.clamp(-car.ax / 12, -0.4, 1), extra = A.clamp(lean * 0.4, -0.6, 0.6);
    _q.setFromAxisAngle(_zf, -extra).multiply(_q2.setFromAxisAngle(_ax, -0.42 * up));
    m.torso.quaternion.copy(_q).multiply(m.torsoQ0);
    m.headG.position.copy(m.headP0).sub(m.torso.position).applyQuaternion(_q).add(m.torso.position);
    m.headG.rotation.set(0.25 * up, 0, -extra * 0.6);
    if (car.isPlayer && m.armRig) {
      for (const r of m.armRig) {
        const sh = _v.copy(r.shd0).sub(m.torso.position).applyQuaternion(_q).add(m.torso.position), gp = _v3.copy(r.grip).sub(m.rider.position);
        const el = IK(sh, gp, r.pole);
        r.a1.position.copy(sh); r.a1.quaternion.setFromUnitVectors(_yUp, _v2.subVectors(el, sh).normalize()); r.a1.scale.y = el.distanceTo(sh) / r.L1;
        r.a2.position.copy(el); r.a2.quaternion.setFromUnitVectors(_yUp, _v2.subVectors(gp, el).normalize()); r.a2.scale.y = gp.distanceTo(el) / r.L2;
      }
      m.dashT = (m.dashT || 0) + dt;
      if (m.dash && m.dashT > 0.05) { m.dashT = 0; m.dash({ v: car.speed, rpm: car.rpm, gear: car.gear }, { red: 18000 }); }
    }
  };
})();
