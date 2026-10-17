'use strict';
/* Boucle principale : physique à 240 Hz, caméras, course, suivi de cible, signal vidéo, OSD. */

(() => {
  const V3 = THREE.Vector3;
  const S = Settings.get;
  const $ = s => document.querySelector(s);
  const st = Quad.st;
  const scene = World.scene;

  // ── Rendu ──
  const canvas = $('#view');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: 'high-performance' });
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.setClearColor(World.FOG);
  Post.init(renderer);
  const camera = new THREE.PerspectiveCamera(90, 1, 0.06, 3200);
  let W = 1, H = 1, dyn = 1;   // dyn : résolution dynamique si la machine peine
  function resize() {
    W = innerWidth; H = innerHeight;
    const dpr = Math.min(devicePixelRatio || 1, 1.25) * S().scale * dyn;
    renderer.setPixelRatio(dpr);
    renderer.setSize(W, H, false);
    Post.resize(Math.round(W * dpr), Math.round(H * dpr));
  }
  addEventListener('resize', resize);

  // ── Modèle du drone (visible en vue poursuite / LOS, et pour son ombre) ──
  let drone = null;
  function buildDrone() {
    if (drone) scene.remove(drone.g);
    const P = Quad.P, g = new THREE.Group(), inner = new THREE.Group();
    const carbon = new THREE.MeshLambertMaterial({ color: 0x1d1d1f });
    const add = (geo, mat, x, y, z, ry = 0) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.rotation.y = ry; m.castShadow = true; inner.add(m); return m; };
    add(new THREE.BoxGeometry(0.06, 0.03, 0.12), carbon, 0, 0, 0);
    for (const a of [Math.PI / 4, -Math.PI / 4]) add(new THREE.BoxGeometry(0.026, 0.008, 0.25), carbon, 0, -0.012, 0, a);
    add(new THREE.BoxGeometry(0.036, 0.032, 0.08), new THREE.MeshLambertMaterial({ color: 0xf2c21b }), 0, 0.033, 0.005);
    add(new THREE.BoxGeometry(0.022, 0.022, 0.02), new THREE.MeshLambertMaterial({ color: 0xff6a00 }), 0, 0.006, -0.062);
    add(new THREE.BoxGeometry(0.02, 0.004, 0.004), new THREE.MeshBasicMaterial({ color: 0xff2020 }), 0, 0.0, 0.062);
    const props = [];
    const propMat = new THREE.MeshBasicMaterial({ color: 0x222222, transparent: true, opacity: 0.35, side: THREE.DoubleSide, depthWrite: false });
    const motorMat = new THREE.MeshLambertMaterial({ color: 0x8a8f99 });
    for (const [x, z] of [[0.088, -0.088], [-0.088, -0.088], [0.088, 0.088], [-0.088, 0.088]]) {
      add(new THREE.CylinderGeometry(0.014, 0.014, 0.018, 10), motorMat, x, 0.0, z);
      const disc = new THREE.Mesh(new THREE.CircleGeometry(0.0635, 20), propMat);
      disc.rotation.x = -Math.PI / 2; disc.position.set(x, 0.014, z); inner.add(disc);
      const blade = new THREE.Mesh(new THREE.BoxGeometry(0.125, 0.002, 0.012), carbon);
      blade.position.set(x, 0.015, z); inner.add(blade); props.push(blade);
      if (P.ducts) { const d = new THREE.Mesh(new THREE.TorusGeometry(0.068, 0.006, 6, 24), carbon); d.rotation.x = Math.PI / 2; d.position.set(x, 0.01, z); inner.add(d); }
    }
    inner.scale.setScalar(P.size);
    g.add(inner);
    g.traverse(o => o.layers.set(1));
    scene.add(g);
    drone = { g, props };
  }

  // ── État de session ──
  let started = false, running = false, simT = 0, camMode = 0, lastArmLevel = null;
  let sessionKey = '';
  const wind = new V3();
  const prevPos = new V3();
  const race = { next: 0, started: false, lapStart: 0, lap: 0, last: null, best: null };
  const track = { sel: -1, good: 0, zone: 0, streak: 0, bestStreak: 0, score: 0, target: null, isGood: false };
  const sig = { q: 1, stat: 0, tear: 0, block: 0, acc: 0, lq: 100 };
  let flash = 0, shake = 0, statBurst = 0, msgT = 0, flightTime = 0;
  try { race.best = JSON.parse(localStorage.getItem('fpvsim:best') || 'null'); } catch (e) { /* ignore */ }

  function pilotPos() { return S().mode === 'track' ? World.pilots.track : World.pilots.free; }

  function showMsg(t, sub = '', dur = 2.2) {
    const el = $('#hudMsg');
    el.innerHTML = t + (sub ? `<small>${sub}</small>` : '');
    el.classList.add('on'); msgT = dur;
  }

  function applySettings() {
    const s = S();
    document.documentElement.classList.toggle('hd', s.video === 'hd');
    $('#osd').classList.toggle('off', !s.osd);
    const touchOn = s.touch === 'on' || (s.touch === 'auto' && matchMedia('(pointer: coarse)').matches);
    $('#touch').hidden = !touchOn;
    document.documentElement.classList.toggle('touch-on', touchOn);
    if (renderer.shadowMap.enabled !== !!s.shadows) {
      renderer.shadowMap.enabled = !!s.shadows;
      scene.traverse(o => { if (o.material) [].concat(o.material).forEach(m => { m.needsUpdate = true; }); });
    }
    resize();
  }

  function resetDrone(msg = true) {
    const sp = World.spawns[S().mode] || World.spawns.free;
    Quad.reset(sp.pos, sp.yaw);
    Input.zeroKb();
    prevPos.copy(st.pos);
    race.next = 0; race.started = false; race.lap = 0;
    track.streak = 0;
    flightTime = 0; lastArmLevel = null;
    World.setNextGate(S().mode === 'race' ? World.course[0] : null);
    if (msg) showMsg(S().mode === 'race' ? 'Course' : S().mode === 'track' ? 'Suivi de cible' : 'Vol libre',
      Input.out.src === 'pad' ? 'Gaz en bas puis bascule l\'armement' : document.documentElement.classList.contains('touch-on') ? 'Bouton ARM pour armer · stick gauche = gaz' : 'Espace pour armer · Z pour les gaz', 3);
  }

  function start() {
    const key = S().mode + '|' + S().quad;
    Quad.setQuad(S().quad);
    applySettings();
    if (!started || key !== sessionKey) {
      buildDrone();
      resetDrone();
      track.good = track.zone = track.score = track.bestStreak = 0;
    }
    sessionKey = key; started = true; running = true;
    $('#goBtn').textContent = 'Reprendre';
    UI.close();
    Sound.start();
  }
  function pause() { running = false; Sound.mute(); UI.open(); }

  UI.init({ onStart: start, onChange: () => { if (started) applySettings(); } });

  Quad.onCrash = (v) => { showMsg('CRASH', `${(v * 3.6).toFixed(0)} km/h à l'impact · R ou bouton reset`, 3); flash = 0.4; statBurst = 1; };
  Quad.onImpact = (v) => { shake = Math.min(1, shake + v * 0.08); statBurst = Math.min(1, statBurst + v * 0.06); Sound.impact(v); };

  function toggleArm(thr) {
    if (st.armed) { Quad.disarm(); return; }
    const err = Quad.tryArm(thr);
    if (err) showMsg('Armement refusé', err, 1.6);
  }

  // ── Touches & boutons tactiles ──
  Input.bindTouch($('#stickL'), $('#stickR'));
  $('#tArm').addEventListener('click', () => toggleArm(Input.out.thrCmd || 0));
  $('#tReset').addEventListener('click', () => resetDrone(false));
  $('#tCam').addEventListener('click', () => { camMode = (camMode + 1) % 3; });

  function handleKeys(inp) {
    for (const k of Input.takeKeys()) {
      if (k === 'Escape' || k === 'KeyP') { if (UI.isOpen) { if (started) start(); } else pause(); continue; }
      if (UI.isOpen) continue;
      if (k === 'Space') toggleArm(inp.thrCmd);
      else if (k === 'KeyR' || k === 'Backspace') resetDrone(false);
      else if (k === 'KeyC') { camMode = (camMode + 1) % 3; showMsg(['Caméra FPV', 'Vue poursuite', 'Vue pilote (LOS)'][camMode], '', 1); }
      else if (k === 'KeyH') { S().osd = S().osd ? 0 : 1; Settings.save(); applySettings(); }
      else if (k === 'KeyT') { track.sel = (track.sel + 2) % (Targets.cars.length + 1) - 1; showMsg(track.sel < 0 ? 'Cible : auto' : 'Cible : ' + Targets.cars[track.sel].name, '', 1); }
      else if (k === 'KeyM') { S().flightMode = S().flightMode === 'acro' ? 'angle' : 'acro'; Settings.save(); showMsg('Mode ' + S().flightMode.toUpperCase(), '', 1); }
    }
  }

  function handleArm(inp) {
    if (inp.armLevel !== null && inp.armLevel !== undefined) {
      if (lastArmLevel === null) lastArmLevel = inp.armLevel;
      if (inp.armLevel && !lastArmLevel) toggleArm(inp.thrCmd);
      else if (!inp.armLevel && lastArmLevel && st.armed) Quad.disarm();
      lastArmLevel = inp.armLevel;
    } else lastArmLevel = null;
    if (inp.armToggle) toggleArm(inp.thrCmd);
    if (inp.reset) resetDrone(false);
  }

  // ── Vent (rafales lentes + profil avec l'altitude) ──
  const n1 = x => Math.sin(x) * 0.5 + Math.sin(x * 2.31 + 1.3) * 0.3 + Math.sin(x * 5.13 + 0.4) * 0.2;
  function updateWind(t) {
    const ang = 0.7 + 0.5 * Math.sin(t * 0.011) + 0.15 * n1(t * 0.09);
    const gust = Math.max(0, 1 + 0.4 * n1(t * 0.31) + 0.18 * n1(t * 1.9 + 5));
    const h = Math.max(0, st.pos.y - World.heightAt(st.pos.x, st.pos.z));
    const prof = Math.min(1.25, 0.35 + Math.log(1 + h) / 3.2);
    const sp = S().wind * gust;
    wind.set(Math.cos(ang) * sp, 0.25 * sp * n1(t * 2.7 + 9) * 0.2, Math.sin(ang) * sp);
    Quad.setWind(wind.clone().multiplyScalar(prof));
  }

  // ── Portes ──
  const _a = new V3(), _b = new V3();
  function crossed(g, a, b) {
    const da = _a.copy(a).sub(g.c).dot(g.dir), db = _b.copy(b).sub(g.c).dot(g.dir);
    if (!(da < 0 && db >= 0)) return false;
    const t = da / (da - db);
    const p = _a.lerpVectors(a, b, t).sub(g.c);
    return Math.abs(p.dot(g.right)) <= g.w / 2 + 0.15 && Math.abs(p.y) <= g.h / 2 + 0.15;
  }
  const fmtT = s => { if (s == null) return '--:--.--'; const m = Math.floor(s / 60), r = s - m * 60; return String(m).padStart(2, '0') + ':' + r.toFixed(2).padStart(5, '0'); };
  function updateRace() {
    const g = World.course[race.next];
    if (!crossed(g, prevPos, st.pos)) return;
    if (race.next === 0) {
      if (race.started) {
        const lt = simT - race.lapStart;
        race.last = lt; race.lap++;
        const rec = race.best == null || lt < race.best;
        if (rec) { race.best = lt; try { localStorage.setItem('fpvsim:best', JSON.stringify(lt)); } catch (e) { /* ignore */ } }
        showMsg(`Tour ${race.lap} · ${fmtT(lt)}`, rec ? 'Nouveau record !' : 'Record ' + fmtT(race.best), 2.5);
      } else showMsg('Chrono lancé', 'Suis les portes en surbrillance', 1.5);
      race.started = true; race.lapStart = simT;
    }
    race.next = (race.next + 1) % World.course.length;
    World.setNextGate(World.course[race.next]);
  }

  // ── Suivi de cible ──
  const _v = new V3(), _f = new V3();
  function updateTrack(dt) {
    const cars = Targets.cars;
    let tgt;
    if (track.sel >= 0) tgt = cars[track.sel];
    else { let bd = 1e9; for (const c of cars) { const d = c.center.distanceTo(st.pos); if (d < bd) { bd = d; tgt = c; } } }
    track.target = tgt;
    const d = tgt.center.distanceTo(st.pos);
    _v.copy(tgt.center).project(fpvCam);
    _f.set(0, 0, -1).applyQuaternion(fpvCam.quaternion);
    const front = _f.dot(_b.copy(tgt.center).sub(fpvCam.position)) > 0;
    const inFrame = front && Math.abs(_v.x) < 0.6 && Math.abs(_v.y) < 0.6;
    track.isGood = st.armed && inFrame && d > 3 && d < 20;
    if (st.armed && d < 45) {
      track.zone += dt;
      if (track.isGood) {
        const center = 1 - Math.min(1, Math.hypot(_v.x, _v.y) / 0.85);
        const distF = 1 - Math.min(1, Math.abs(d - 8) / 14);
        track.good += dt; track.streak += dt;
        track.score += dt * (40 + 60 * center) * (0.6 + 0.4 * distF);
        track.bestStreak = Math.max(track.bestStreak, track.streak);
      } else track.streak = Math.max(0, track.streak - dt * 3);
    }
    if (!st.armed) track.streak = 0;
  }

  // ── Signal vidéo ──
  function updateSignal(dt) {
    sig.acc -= dt;
    if (sig.acc <= 0) {
      sig.acc = 0.1;
      let q = 1;
      if (S().signalLoss) {
        const pp = pilotPos();
        const d = pp.distanceTo(st.pos);
        const occ = World.occlusion(pp, st.pos);
        q = 1 - Math.max(0, (d - 140) / 520) - occ * 0.17;
      }
      sig.target = Math.max(0, Math.min(1, q));
    }
    sig.q += ((sig.target ?? 1) - sig.q) * Math.min(1, dt * 5);
    const q = sig.q;
    sig.lq = Math.round(Math.max(0, Math.min(1, q * 1.05)) * 100);
    const analog = S().video === 'analog';
    const loss = Math.max(0, (0.62 - q) / 0.62);
    if (analog) {
      sig.stat = Math.min(1, Math.pow(loss, 1.5) * (0.85 + Math.random() * 0.3));
      sig.tear = Math.min(1, loss * 1.3);
      sig.block = 0;
    } else {
      sig.stat = q < 0.06 ? 0.15 : 0;
      sig.tear = 0;
      sig.block = Math.min(1, Math.max(0, (0.45 - q) / 0.4));
    }
  }

  // ── Caméras ──
  const fpvCam = new THREE.PerspectiveCamera(90, 1, 0.06, 3200);
  const qTilt = new THREE.Quaternion(), qShake = new THREE.Quaternion(), eShake = new THREE.Euler();
  const chasePos = new V3(10, 5, 30);
  const _up = new V3(), _fw = new V3();
  function placeCameras(dt) {
    const P = Quad.P, aspect = W / H;
    const hf = S().fov * Math.PI / 180;
    let vf = 2 * Math.atan(Math.tan(hf / 2) / aspect) * 180 / Math.PI;
    vf = Math.min(122, vf);
    fpvCam.fov = vf; fpvCam.aspect = aspect;
    qTilt.setFromAxisAngle(new V3(1, 0, 0), S().uptilt * Math.PI / 180);
    // vibrations : hélices, propwash, impacts
    const vib = S().vib * (0.0006 + 0.0035 * st.motor * st.motor) + st.propwash * 0.012 * S().vib + shake * 0.05;
    eShake.set((Math.random() - 0.5) * vib, (Math.random() - 0.5) * vib * 0.6, (Math.random() - 0.5) * vib);
    qShake.setFromEuler(eShake);
    fpvCam.position.set(0, 0.03 * P.size, -0.05 * P.size).applyQuaternion(st.q).add(st.pos);
    fpvCam.quaternion.copy(st.q).multiply(qTilt).multiply(qShake);
    fpvCam.updateProjectionMatrix(); fpvCam.updateMatrixWorld();

    if (camMode === 0) {
      camera.copy(fpvCam); camera.layers.set(0);
    } else if (camMode === 1) {
      _fw.set(0, 0, -1).applyQuaternion(st.q); _fw.y = 0;
      const hv = Math.hypot(st.vel.x, st.vel.z);
      if (hv > 2) _fw.lerp(_up.set(st.vel.x, 0, st.vel.z).normalize(), Math.min(1, (hv - 2) / 6));
      if (_fw.lengthSq() < 1e-4) _fw.set(0, 0, -1);
      _fw.normalize();
      const dist = 1.6 + 1.4 * P.size;
      const want = _up.copy(st.pos).addScaledVector(_fw, -dist); want.y += 0.5 + 0.5 * P.size;
      chasePos.lerp(want, 1 - Math.exp(-dt * 7));
      chasePos.y = Math.max(chasePos.y, World.heightAt(chasePos.x, chasePos.z) + 0.25);
      camera.position.copy(chasePos); camera.up.set(0, 1, 0); camera.lookAt(st.pos);
      camera.fov = Math.min(80, vf * 0.75); camera.aspect = aspect;
      camera.layers.enableAll();
    } else {
      const pp = pilotPos();
      camera.position.copy(pp); camera.up.set(0, 1, 0); camera.lookAt(st.pos);
      const d = pp.distanceTo(st.pos);
      camera.fov = Math.max(5, Math.min(70, 2 * Math.atan(3 / Math.max(d, 0.1)) * 180 / Math.PI)); camera.aspect = aspect;
      camera.layers.enableAll();
    }
    camera.near = 0.06; camera.updateProjectionMatrix();
  }

  // ── HUD (marqueur de porte / cible) ──
  const mark = $('#mark'), markLbl = mark.querySelector('span'), arrow = $('#arrow');
  function placeMarker(p, label, cls, good) {
    _v.copy(p).project(camera);
    _f.set(0, 0, -1).applyQuaternion(camera.quaternion);
    const front = _f.dot(_b.copy(p).sub(camera.position)) > 0;
    let x = _v.x, y = _v.y;
    if (front && camMode === 0) [x, y] = Post.distortScreen(x, y, S().distort, W / H);
    if (front && Math.abs(x) < 0.95 && Math.abs(y) < 0.92) {
      mark.style.display = 'block'; arrow.style.display = 'none';
      mark.className = 'mark ' + cls + (good ? ' good' : '');
      mark.style.transform = `translate(${(x * 0.5 + 0.5) * W}px, ${(-y * 0.5 + 0.5) * H}px)`;
      markLbl.textContent = label;
    } else {
      mark.style.display = 'none'; arrow.style.display = 'block';
      arrow.className = 'arrow ' + cls;
      let ax = front ? x : -x, ay = front ? y : -y;
      if (!front && Math.hypot(ax, ay) < 0.2) ay = -1;
      const a = Math.atan2(-ay, ax);
      const r = Math.min(W, H) * 0.38;
      arrow.style.transform = `translate(${W / 2 + Math.cos(a) * r}px, ${H / 2 + Math.sin(a) * r}px) rotate(${a}rad)`;
    }
  }
  function hideMarker() { mark.style.display = 'none'; arrow.style.display = 'none'; }

  // ── OSD ──
  const O = { bat: $('#oBat'), mah: $('#oMah'), lq: $('#oLq'), rssi: $('#oRssi'), warn: $('#oWarn'), spd: $('#oSpd'), alt: $('#oAlt'), mode: $('#oMode'), thr: $('#oThr'), time: $('#oTime') };
  const setT = (el, t) => { if (el.textContent !== t) el.textContent = t; };
  let osdAcc = 0;
  function updateOsd(dt, inp) {
    osdAcc -= dt; if (osdAcc > 0) return; osdAcc = 0.05;
    const P = Quad.P, cellV = st.volt / P.cells;
    setT(O.bat, (P.cells > 1 ? 'BAT ' : '') + st.volt.toFixed(1) + 'V');
    O.bat.classList.toggle('warn', cellV < 3.5);
    setT(O.mah, Math.round(st.mah) + ' MAH');
    setT(O.lq, 'LQ ' + String(sig.lq).padStart(3, ' '));
    O.lq.classList.toggle('warn', sig.lq < 40);
    const bars = Math.round(sig.q * 5);
    setT(O.rssi, '▮'.repeat(bars) + '▯'.repeat(5 - bars));
    let w = '', cls = '';
    if (st.crashed) { w = 'CRASH'; cls = 'bad blink'; }
    else if (!st.armed) { w = 'DISARMED'; cls = 'blink'; }
    else if (cellV < 3.3 || st.soc < 0.12) { w = 'LOW BATTERY'; cls = 'bad blink'; }
    else if (sig.lq < 25) { w = 'LOW LQ'; cls = 'blink'; }
    setT(O.warn, w); O.warn.className = 'osd tc ' + cls;
    const sp = st.vel.length() * 3.6;
    setT(O.spd, Math.round(sp) + ' KM/H');
    setT(O.alt, 'ALT ' + (st.pos.y - World.heightAt(st.pos.x, st.pos.z) - Quad.P.radius).toFixed(1) + 'M');
    setT(O.mode, (S().flightMode === 'acro' ? 'ACRO' : 'ANGLE') + (camMode ? [' ', ' · CHASE', ' · LOS'][camMode] : '') + (inp.src === 'kb' ? ' · KB' : inp.src === 'touch' ? ' · TOUCH' : ''));
    setT(O.thr, 'THR ' + String(Math.round(inp.thrCmd * 100)).padStart(3, ' ') + '%');
    const tt = Math.floor(flightTime);
    setT(O.time, String(Math.floor(tt / 60)).padStart(2, '0') + ':' + String(tt % 60).padStart(2, '0'));
  }
  let hudAcc = 0;
  function updateHud(dt) {
    hudAcc -= dt;
    if (msgT > 0) { msgT -= dt; if (msgT <= 0) $('#hudMsg').classList.remove('on'); }
    const mode = S().mode;
    if (mode === 'race') {
      const g = World.course[race.next];
      placeMarker(g.c, `${race.next + 1}/${World.course.length} · ${g.name} · ${Math.round(g.c.distanceTo(st.pos))} m`, 'gate', false);
    } else if (mode === 'track' && track.target) {
      const c = track.target;
      placeMarker(c.center, `${c.name} · ${c.center.distanceTo(st.pos).toFixed(1)} m`, 'track', track.isGood);
    } else hideMarker();
    if (hudAcc > 0) return; hudAcc = 0.1;
    let h = '';
    if (mode === 'race') {
      h = `<span>TOUR <b>${race.lap + (race.started ? 1 : 0)}</b></span><span>${race.started ? fmtT(simT - race.lapStart) : 'Passe la porte 1'}</span>` +
        `<span>DERNIER ${fmtT(race.last)}</span><span class="best">RECORD ${fmtT(race.best)}</span>`;
    } else if (mode === 'track') {
      const pct = track.zone > 0 ? Math.round(track.good / track.zone * 100) : 0;
      h = `<span>CIBLE <b>${track.target ? track.target.name : '—'}</b>${track.sel < 0 ? ' (auto)' : ''}</span><span>CADRAGE <b>${pct}%</b></span>` +
        `<span>SÉRIE ${track.streak.toFixed(1)} s</span><span class="best">MEILLEURE ${track.bestStreak.toFixed(1)} s</span><span>SCORE <b>${Math.round(track.score)}</b></span>`;
    }
    const top = $('#hudTop');
    if (top.innerHTML !== h) top.innerHTML = h;
  }

  // ── Poussière soulevée au ras du sol ──
  const _dp = new V3();
  let dustAcc = 0;
  function dust(dt) {
    if (!st.armed || st.motor < 0.2) return;
    const g = World.heightAt(st.pos.x, st.pos.z), h = st.pos.y - g;
    const range = 1.6 * Quad.P.size + 0.3;
    if (h > range) return;
    dustAcc += dt * st.motor * 40 * (1 - h / range);
    while (dustAcc > 1) {
      dustAcc -= 1;
      const a = Math.random() * Math.PI * 2, r = Math.random() * 0.3;
      _dp.set(st.pos.x + Math.cos(a) * r, g + 0.05, st.pos.z + Math.sin(a) * r);
      const v = 2 + Math.random() * 3 * st.motor;
      Particles.emit(_dp, Math.cos(a) * v, 0.3 + Math.random() * 0.5, Math.sin(a) * v, 0.15 * Quad.P.size + 0.1, 1.3 * Quad.P.size + 0.4, 1 + Math.random(), 0.62, 0.57, 0.46, 0.22 * (1 - h / range));
    }
  }

  // ── Résolution dynamique : baisse si < 45 i/s, remonte si fluide ──
  const perfS = { acc: 0, n: 0, sum: 0 };
  function perf(rawDt) {
    if (!running || document.hidden || rawDt > 0.25) return;
    perfS.sum += rawDt; perfS.n++;
    if (perfS.n < 90) return;
    const avg = perfS.sum / perfS.n; perfS.sum = 0; perfS.n = 0;
    const old = dyn;
    if (avg > 1 / 45) dyn = Math.max(0.5, dyn * 0.85);
    else if (avg < 1 / 57 && dyn < 1) dyn = Math.min(1, dyn * 1.1);
    if (dyn !== old) resize();
  }

  // ── Boucle ──
  let last = performance.now(), t = 0;
  const HZ = 240;
  function frame(now) {
    requestAnimationFrame(frame);
    const rawDt = (now - last) / 1000;
    const dt = Math.min(0.05, rawDt); last = now;
    t += dt;
    perf(rawDt);
    const inp = Input.poll(dt);
    handleKeys(inp);

    if (running && !UI.isOpen) {
      handleArm(inp);
      simT += dt;
      updateWind(simT);
      prevPos.copy(st.pos);
      const n = Math.max(1, Math.ceil(dt * HZ)), h = dt / n;
      for (let i = 0; i < n; i++) Quad.step(h, inp, S());
      if (st.armed) flightTime += dt;
      Targets.update(dt, simT);
      if (S().mode === 'race') updateRace();
      dust(dt);
      Particles.update(dt, wind);
      Sound.update(st, Quad.P, S().volume, st.vel.length(), sig.stat, camMode === 0);
    }
    World.update(running ? dt : 0, simT, st.pos, wind);
    placeCameras(dt);
    if (running && S().mode === 'track') updateTrack(dt);
    updateSignal(dt);

    flash *= Math.exp(-dt * 6); shake *= Math.exp(-dt * 5); statBurst *= Math.exp(-dt * 4);
    if (statBurst < 0.003) statBurst = 0; if (flash < 0.003) flash = 0;
    if (drone) {
      drone.g.position.copy(st.pos); drone.g.quaternion.copy(st.q);
      const spin = st.motor * 120 * dt;
      drone.props.forEach((p, i) => { p.rotation.y += (i % 2 ? spin : -spin); });
    }
    const fpv = camMode === 0, analog = S().video === 'analog';
    Particles.setScale(H * renderer.getPixelRatio(), camera.fov);
    Post.render(renderer, scene, camera, {
      t: t, k: fpv ? S().distort : 0, analog: fpv && analog ? 1 : 0, ca: fpv ? (analog ? 0.012 : 0.004) : 0, vig: fpv ? (analog ? 0.55 : 0.3) : 0.15,
      stat: fpv ? Math.min(1, sig.stat + (analog ? statBurst * 0.6 : 0)) : 0, tear: fpv ? Math.min(1, sig.tear + (analog ? statBurst * 0.5 : 0)) : 0,
      block: fpv && !analog ? Math.min(1, sig.block + statBurst * 0.4) : 0, mono: fpv && analog ? Math.max(0, (0.25 - sig.q) * 2) : 0, flash,
    });
    updateOsd(dt, inp);
    updateHud(dt);
  }

  // Écran d'accueil : drone posé sur le pad, caméra FPV
  Quad.setQuad(S().quad);
  buildDrone();
  resetDrone(false);
  applySettings();
  UI.open();
  requestAnimationFrame(frame);
  window.FPV = { renderer, camera, scene, Post, sig, get statBurst() { return statBurst; } }; // accès console (debug)
})();
