'use strict';
/* ═══════════════════════════════════════════════════════════
   TROTTINETTE FREESTYLE — boucle de jeu, physique, figures,
   caméra, sons et interface
   ═══════════════════════════════════════════════════════════ */
(() => {
  const V3 = THREE.Vector3;
  const G = 9.81, TAU = Math.PI * 2, DT = 1 / 120;
  const UP = new V3(0, 1, 0);
  const PUSH = 4.2, MAX_PUSH = 7.8, PUMP = 0.9, MAX_SPEED = 13;
  const SPIN_RATE = 9.5, FLIP_RATE = 7.6, WHIP_RATE = TAU / 0.3, BAR_RATE = TAU / 0.25;
  const $ = id => document.getElementById(id);
  const store = {
    get(k, d) { try { const v = localStorage.getItem('trottfs:' + k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem('trottfs:' + k, JSON.stringify(v)); } catch (e) { /* stockage indisponible */ } },
  };
  const wrapPi = a => { a = (a + Math.PI) % TAU; if (a < 0) a += TAU; return a - Math.PI; };
  const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
  const fmt = n => Math.round(n).toLocaleString('fr-FR');

  /* ═══ Rendu ═══ */
  const coarse = matchMedia('(pointer: coarse)').matches;
  const canvas = $('gl');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: !coarse, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, coarse ? 1.5 : 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0xd8d2c4, 110, 420);
  const camera = new THREE.PerspectiveCamera(62, 1, 0.05, 900);

  const sky = new THREE.Mesh(new THREE.SphereGeometry(600, 32, 16), new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false, fog: false,
    uniforms: { top: { value: new THREE.Color(0x3f78c0) }, mid: { value: new THREE.Color(0xa6c4e2) }, bottom: { value: new THREE.Color(0xf0cfa6) } },
    vertexShader: 'varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
    fragmentShader: 'uniform vec3 top; uniform vec3 mid; uniform vec3 bottom; varying vec3 vP; void main(){ float h = vP.y; vec3 c = mix(mid, top, pow(clamp(h, 0.0, 1.0), 0.55)); c = mix(bottom, c, smoothstep(-0.02, 0.16, h)); gl_FragColor = vec4(c, 1.0); }',
  }));
  scene.add(sky);

  scene.add(new THREE.HemisphereLight(0xd6e6ff, 0x6e6450, 0.62));
  const sun = new THREE.DirectionalLight(0xfff0d8, 0.92);
  sun.position.set(-38, 62, 30);
  sun.castShadow = true;
  sun.shadow.mapSize.set(coarse ? 1024 : 2048, coarse ? 1024 : 2048);
  Object.assign(sun.shadow.camera, { left: -56, right: 56, top: 56, bottom: -56, near: 1, far: 180 });
  sun.shadow.bias = -0.0005;
  sun.shadow.normalBias = 0.03;
  scene.add(sun, sun.target);
  scene.add(new THREE.AmbientLight(0xffffff, 0.08));

  Park.build(scene);
  const rider = Rider.create();
  scene.add(rider.root);

  /* ═══ Sons (Web Audio, synthétisés) ═══ */
  const Sfx = (() => {
    let ctx = null, roll, rollF, grind, grindF, master;
    function noiseBuf(sec) {
      const b = ctx.createBuffer(1, ctx.sampleRate * sec, ctx.sampleRate), d = b.getChannelData(0);
      let last = 0;
      for (let i = 0; i < d.length; i++) { last = last * 0.6 + (Math.random() * 2 - 1) * 0.4; d[i] = last; }
      return b;
    }
    function loop(freq, q) {
      const src = ctx.createBufferSource(); src.buffer = noiseBuf(2); src.loop = true;
      const f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = freq; f.Q.value = q;
      const g = ctx.createGain(); g.gain.value = 0;
      src.connect(f); f.connect(g); g.connect(master); src.start();
      return [g, f];
    }
    function burst(freq, dur, vol, type = 'lowpass') {
      if (!ctx) return;
      const src = ctx.createBufferSource(); src.buffer = noiseBuf(dur + 0.05);
      const f = ctx.createBiquadFilter(); f.type = type; f.frequency.value = freq;
      const g = ctx.createGain(); const t = ctx.currentTime;
      g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
      src.connect(f); f.connect(g); g.connect(master); src.start(); src.stop(t + dur + 0.05);
    }
    function thump(vol) {
      if (!ctx) return;
      const o = ctx.createOscillator(), g = ctx.createGain(), t = ctx.currentTime;
      o.frequency.setValueAtTime(110, t); o.frequency.exponentialRampToValueAtTime(45, t + 0.18);
      g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
      o.connect(g); g.connect(master); o.start(); o.stop(t + 0.25);
    }
    return {
      init() {
        if (ctx) { if (ctx.state === 'suspended') ctx.resume(); return; }
        try {
          ctx = new (window.AudioContext || window.webkitAudioContext)();
          master = ctx.createGain(); master.gain.value = 0.55; master.connect(ctx.destination);
          [roll, rollF] = loop(700, 0.7);
          [grind, grindF] = loop(2600, 4);
        } catch (e) { ctx = null; }
      },
      update(speed, grounded, grinding) {
        if (!ctx) return;
        const t = ctx.currentTime;
        roll.gain.setTargetAtTime(grounded ? Math.min(0.32, speed * 0.04) : 0, t, 0.06);
        rollF.frequency.setTargetAtTime(380 + speed * 85, t, 0.1);
        grind.gain.setTargetAtTime(grinding ? 0.12 + Math.min(0.12, speed * 0.02) : 0, t, 0.04);
        grindF.frequency.setTargetAtTime(2200 + speed * 120, t, 0.1);
      },
      mute(m) { if (master) master.gain.value = m ? 0 : 0.55; },
      land(impact) { burst(380, 0.14, Math.min(0.9, 0.2 + impact * 0.07)); thump(Math.min(0.8, 0.15 + impact * 0.06)); },
      pop() { burst(1800, 0.05, 0.35, 'highpass'); },
      metal() { burst(3200, 0.12, 0.4, 'bandpass'); },
      bail() { burst(260, 0.5, 0.9); thump(0.9); },
      whoosh() { burst(900, 0.18, 0.12, 'bandpass'); },
    };
  })();

  /* ═══ Entrées ═══ */
  const keys = new Set(), pressed = new Set();
  const KEYMAP = {
    KeyW: 'up', ArrowUp: 'up', KeyS: 'down', ArrowDown: 'down', KeyA: 'left', ArrowLeft: 'left', KeyD: 'right', ArrowRight: 'right',
    Space: 'jump', ShiftLeft: 'manual', ShiftRight: 'manual', KeyJ: 'whip', KeyU: 'heel', KeyK: 'bar', KeyI: 'barB',
    KeyL: 'grab', KeyE: 'revert', KeyC: 'camera', KeyR: 'reset', KeyT: 'tower', KeyH: 'help', KeyB: 'book',
  };
  const held = a => keys.has(a);
  const consume = a => { if (pressed.has(a)) { pressed.delete(a); return true; } return false; };
  function press(a) { if (!keys.has(a)) pressed.add(a); keys.add(a); }
  function release(a) { keys.delete(a); if (a === 'jump') pressed.add('jumpUp'); }
  addEventListener('keydown', e => {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (e.target && /INPUT|TEXTAREA|SELECT/.test(e.target.tagName)) return;
    if (e.code === 'Escape' || e.code === 'KeyP') { if (game.state === 'play') pause(true); else if (game.state === 'pause') pause(false); return; }
    const a = KEYMAP[e.code];
    if (!a) return;
    if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) e.preventDefault();
    if (e.repeat) return;
    press(a);
  });
  addEventListener('keyup', e => { const a = KEYMAP[e.code]; if (a) release(a); });
  addEventListener('blur', () => { keys.clear(); if (game.state === 'play') pause(true); });

  /* ═══ État du jeu ═══ */
  const game = {
    state: 'menu', mode: 'free', score: 0, time: 120, spawn: 0, camMode: 0,
    best: store.get('best', 0), bestCombo: store.get('bestCombo', 0),
    book: new Set(store.get('book', [])), challenges: new Set(store.get('challenges', [])),
    sessionBestCombo: 0, sessionBestTrick: null, helpOpen: !coarse,
  };

  const st = {
    pos: new V3(), vel: new V3(), heading: Math.PI, mode: 'ground', n: new V3(0, 1, 0), groundEl: null,
    dispN: new V3(0, 1, 0), charge: 0,
    spin: 0, spinVel: 0, flip: 0, flipVel: 0, autoTurn: 0, autoTurnTarget: 0, autoTurnRate: 0,
    whipA: 0, whipT: 0, barA: 0, barT: 0, grab: null, grabW: 0, xupA: 0,
    air: null, grind: null, manual: null, revert: null,
    flipBlock: { up: false, down: false }, bailT: 0, bailSpin: 0, lastRail: null, railCooldown: 0, landT: 0, pushT: 0, vertTilt: 0,
  };

  const combo = { list: [], base: 0, active: false, grace: 0 };

  /* ── Vecteurs temporaires ── */
  const _n = new V3(), _f = new V3(), _s = new V3(), _g = new V3(), _np = new V3(), _t = new V3(), _q = new THREE.Quaternion(), _q2 = new THREE.Quaternion();
  const vecN = (arr, out) => out.set(arr[0], arr[1], arr[2]);

  function forwardTangent(heading, n, out) {
    out.set(Math.sin(heading), 0, Math.cos(heading));
    out.addScaledVector(n, -out.dot(n));
    if (out.lengthSq() < 1e-6) out.set(0, 1, 0);
    return out.normalize();
  }

  /* ═══ Combo & score ═══ */
  function comboMult() { return Math.min(12, combo.list.length); }
  function comboAdd(t) {
    combo.list.push(t);
    combo.base += t.pts;
    combo.active = true;
    combo.grace = 0;
    checkBook(t.summary);
    if (!game.sessionBestTrick || t.pts > game.sessionBestTrick.pts) game.sessionBestTrick = t;
    flashTrick(t.name, t.pts);
    renderCombo();
  }
  function comboBank() {
    if (!combo.active) return;
    const total = combo.base * comboMult();
    game.score += total;
    if (total > game.bestCombo) { game.bestCombo = total; store.set('bestCombo', total); }
    if (total > game.sessionBestCombo) game.sessionBestCombo = total;
    checkChallenges(null, { count: combo.list.length, total, session: game.mode === 'session' ? game.score : 0 });
    toast(`Posé ! +${fmt(total)}`, 'ok');
    combo.list = []; combo.base = 0; combo.active = false; combo.grace = 0;
    renderCombo(); renderScore();
  }
  function comboLose(reason) {
    if (combo.active) toast(`${reason} — combo perdu`, 'bad'); else toast(reason, 'bad');
    combo.list = []; combo.base = 0; combo.active = false; combo.grace = 0;
    renderCombo();
  }

  /* ═══ Livre des figures & défis ═══ */
  function checkBook(summary) {
    if (!summary) return;
    for (const b of Tricks.BOOK) {
      if (!game.book.has(b.id) && b.test(summary)) {
        game.book.add(b.id);
        store.set('book', [...game.book]);
        toast(`Nouvelle figure : ${b.name} ${'★'.repeat(b.stars)}`, 'new');
      }
    }
    checkChallenges(summary, null);
  }
  function checkChallenges(summary, ctx) {
    for (const c of Tricks.CHALLENGES) {
      if (game.challenges.has(c.id)) continue;
      let ok = false;
      try { ok = c.test(summary || {}, ctx); } catch (e) { ok = false; }
      if (ok) {
        game.challenges.add(c.id);
        store.set('challenges', [...game.challenges]);
        toast(`Défi réussi : ${c.name}`, 'new');
      }
    }
  }

  /* ═══ Départ / respawn ═══ */
  function resetRider(spawnIdx = game.spawn) {
    const sp = Park.spawns[spawnIdx];
    game.spawn = spawnIdx;
    const gq = Park.ground(sp.x, sp.z);
    st.pos.set(sp.x, gq.y, sp.z);
    st.vel.set(0, 0, 0);
    st.heading = sp.heading;
    st.mode = 'ground';
    vecN(gq.n, st.n); st.dispN.copy(st.n);
    st.groundEl = gq.el;
    clearTricks();
    st.manual = null; st.grind = null; st.revert = null;
    st.bailT = 0; st.charge = 0;
    rider.com.rotation.set(0, 0, 0);
    rider.tilt.rotation.set(0, 0, 0);
    combo.list = []; combo.base = 0; combo.active = false; renderCombo();
    cam.yaw = st.heading;
    cam.snap = true;
  }

  function clearTricks() {
    st.spin = st.spinVel = st.flip = st.flipVel = 0;
    st.autoTurn = st.autoTurnTarget = st.autoTurnRate = 0;
    st.whipA = st.whipT = st.barA = st.barT = 0;
    st.grab = null; st.grabW = 0; st.air = null;
  }

  /* ═══ PHYSIQUE ═══ */
  function step(dt) {
    st.railCooldown = Math.max(0, st.railCooldown - dt);
    st.landT = Math.max(0, st.landT - dt);
    if (st.mode === 'ground') groundStep(dt);
    else if (st.mode === 'air') airStep(dt);
    else if (st.mode === 'grind') grindStep(dt);
    else if (st.mode === 'bail') bailStep(dt);
  }

  function inputSteer() { return (held('left') ? 1 : 0) - (held('right') ? 1 : 0) + touch.x * -1; }
  function inputPitch() { return (held('up') ? 1 : 0) - (held('down') ? 1 : 0) + touch.y; }

  /* ── Au sol ── */
  function groundStep(dt) {
    const gq0 = Park.ground(st.pos.x, st.pos.z);
    const n = vecN(gq0.n, _n);
    const el0 = gq0.el;
    st.n.copy(n); st.groundEl = el0;

    // Saut : on charge en maintenant Espace, on saute en relâchant
    if (held('jump')) st.charge = Math.min(0.45, st.charge + dt);
    if (consume('jumpUp')) {
      const k = 0.55 + 0.45 * (st.charge / 0.45);
      st.charge = 0;
      if (st.manual) endManual(true);
      st.vel.addScaledVector(n, 4.3 * k);
      Sfx.pop();
      goAir({ launchEl: gq0.el });
      return;
    }

    // Manual
    if (!st.manual && consume('manual') && st.vel.length() > 1.2 && n.y > 0.9) startManual();
    if (st.manual) { if (!manualStep(dt)) return; }
    pressed.delete('manual');

    // Revert (demi-tour sur place, relie les combos)
    if (consume('revert') && !st.revert && !st.manual) {
      st.revert = { t: 0, from: st.heading };
      if (combo.active && combo.grace > 0) { comboAdd({ name: 'Revert', pts: 100, summary: null }); combo.grace = 0.55; }
    }
    if (st.revert) {
      st.revert.t += dt / 0.28;
      if (st.revert.t >= 1) { st.heading = wrapPi(st.revert.from + Math.PI); st.revert = null; }
    }

    // Gravité dans le plan de la surface
    _g.set(0, -G, 0).addScaledVector(n, G * n.y);
    st.vel.addScaledVector(_g, dt);
    st.vel.addScaledVector(n, -st.vel.dot(n));

    const f = forwardTangent(st.heading, n, _f);
    let speed = st.vel.length();

    // Direction : on tourne le cap et la vitesse ensemble (carving)
    const steer = clamp(inputSteer(), -1, 1) * (st.manual ? 0.6 : 1);
    if (steer && !st.revert) {
      const dYaw = steer * (2.6 - Math.min(1.35, speed * 0.11)) * dt;
      st.heading += dYaw;
      _q.setFromAxisAngle(n, dYaw);
      st.vel.applyQuaternion(_q);
      forwardTangent(st.heading, n, f);
    }
    // Adhérence latérale
    _s.crossVectors(n, f).normalize();
    st.vel.addScaledVector(_s, -st.vel.dot(_s) * (1 - Math.exp(-9 * dt)));

    // Poussée sur le plat, pumping dans les courbes
    const vf = st.vel.dot(f);
    const pushing = (held('up') || touch.y > 0.5) && !st.manual;
    st.pushT = pushing && n.y > 0.94 && vf < MAX_PUSH ? st.pushT + dt : 0;
    if (pushing && !st.revert) {
      if (n.y > 0.94) { if (vf < MAX_PUSH) st.vel.addScaledVector(f, PUSH * dt); }
      else if (el0 && el0.kind === 'qp' && n.y > 0.15 && speed > 1) st.vel.addScaledVector(_t.copy(st.vel).normalize(), PUMP * dt);
    }
    if (held('down') || touch.y < -0.5) {
      speed = st.vel.length();
      if (speed > 0) st.vel.multiplyScalar(Math.max(0, speed - 6.5 * dt) / speed);
    }
    speed = st.vel.length();
    if (speed > 0) {
      const dec = (0.16 + 0.0026 * speed * speed) * dt;
      st.vel.multiplyScalar(Math.min(MAX_SPEED, Math.max(0, speed - dec)) / speed);
    }

    _np.copy(st.pos).addScaledVector(st.vel, dt);

    // Lèvre d'un quarter : décollage vertical (air)
    const el = gq0.el;
    if (el && el.vert && st.vel.y > 0.6 && n.y < 0.5) {
      const [u0] = el.toLocal(st.pos.x, st.pos.z), [u1] = el.toLocal(_np.x, _np.z);
      if (u1 >= el.lip - 0.03 && u0 <= el.lip) { vertLaunch(el); return; }
    }

    if (!Park.inBounds(_np.x, _np.z)) { wallHit(); return; }
    const gq = Park.ground(_np.x, _np.z);
    if (gq.y > _np.y + 0.22) { wallHit(); return; }
    if (gq.y < _np.y - 0.07) {                 // la surface se dérobe : envol (lèvre de kicker, bord de table…)
      st.pos.copy(_np);
      goAir({ launchEl: el });
      return;
    }
    st.pos.copy(_np); st.pos.y = gq.y;
    const n2 = vecN(gq.n, _n);
    const sp2 = st.vel.length();
    st.vel.addScaledVector(n2, -st.vel.dot(n2));
    if (st.vel.lengthSq() > 1e-8) st.vel.setLength(sp2);
    rider.spinWheels(sp2 * dt * Math.sign(st.vel.dot(_f) || 1));

    if (railBump()) return;

    // Fin de combo : délai de grâce après réception
    if (combo.active && !st.manual) {
      combo.grace -= dt;
      if (combo.grace <= 0) comboBank();
    }
  }

  function railBump() {
    for (const r of Park.rails) {
      if (r.type !== 'rail') continue;
      const ax = r.a.x, az = r.a.z, dx = r.b.x - ax, dz = r.b.z - az, L2 = dx * dx + dz * dz;
      const t = clamp(((st.pos.x - ax) * dx + (st.pos.z - az) * dz) / L2, 0, 1);
      const cx = ax + dx * t, cz = az + dz * t, cy = r.a.y + (r.b.y - r.a.y) * t;
      if (Math.hypot(st.pos.x - cx, st.pos.z - cz) > 0.17) continue;
      const above = cy - st.pos.y;
      if (above < 0.12 || above > 1.3) continue;
      wallHit();
      return true;
    }
    return false;
  }

  function wallHit() {
    const hs = Math.hypot(st.vel.x, st.vel.z);
    if (hs > 5.5 && st.mode === 'ground') { bail('Dans le mur !'); return; }
    st.vel.x *= -0.3; st.vel.z *= -0.3;
    if (hs > 2) Sfx.land(hs * 0.5);
  }

  function vertLaunch(el) {
    const U = new V3(el.c, 0, el.s), Vv = new V3(-el.s, 0, el.c);
    const vU = st.vel.dot(U), vV = st.vel.dot(Vv), vY = st.vel.y;
    const up = Math.hypot(vY, Math.max(0, vU)) * 0.97;
    st.vel.copy(U).multiplyScalar(-0.35).addScaledVector(Vv, vV);
    st.vel.y = up;
    const [u, v] = el.toLocal(st.pos.x, st.pos.z);
    const uu = Math.min(u, el.lip - 0.06);
    const [x, z] = el.toWorld(uu, v);
    st.pos.set(x, el.y(uu) + 0.01, z);
    const launchN = st.n.clone();
    goAir({ launchEl: el, vert: true });
    st.air.launchN = launchN;
    const T = 2 * up / G;
    st.autoTurnTarget = Math.PI * (vV < -0.2 ? -1 : 1);
    st.autoTurnRate = Math.PI / Math.max(0.25, 0.72 * T);
  }

  function goAir(o = {}) {
    if (combo.active && combo.grace > 0 && !o.keepCombo) comboBank();
    st.mode = 'air';
    st.manual = null;
    if (st.revert) { st.heading = wrapPi(st.revert.from + Math.PI * Math.min(1, st.revert.t)); st.revert = null; }
    // Z/S maintenus au décollage (poussée, pumping) ne déclenchent pas de flip : il faut un nouvel appui
    st.flipBlock = { up: held('up') || touch.y > 0.5, down: held('down') || touch.y < -0.5 };
    st.air = {
      spin: 0, flip: 0, whipsT: 0, whipsH: 0, barsF: 0, barsB: 0, grabs: {},
      airTime: 0, height: 0, startY: st.pos.y, vert: !!o.vert, fromRail: !!o.fromRail,
      launchName: o.launchName || (o.launchEl ? o.launchEl.name : null), landName: null, drop: 0,
      launchN: st.n.clone(),
    };
  }

  /* ── En l'air ── */
  function airStep(dt) {
    const a = st.air;
    a.airTime += dt;
    st.vel.y -= G * dt;
    st.vel.multiplyScalar(1 - 0.0022 * st.vel.length() * dt);

    // Figures
    const grabbing = held('grab') || touch.grab;
    const sx = clamp(inputSteer(), -1, 1);
    if (st.flipBlock.up && !held('up') && touch.y <= 0.5) st.flipBlock.up = false;
    if (st.flipBlock.down && !held('down') && touch.y >= -0.5) st.flipBlock.down = false;
    let py = clamp(inputPitch(), -1, 1);
    if ((py > 0 && st.flipBlock.up) || (py < 0 && st.flipBlock.down)) py = 0;
    if (grabbing && !st.grab) {
      st.grab = py > 0.5 ? 'xup' : py < -0.5 ? 'superman' : sx > 0.5 ? 'canCan' : sx < -0.5 ? 'tuckNoHander' : 'noHander';
      Sfx.whoosh();
    }
    if (!grabbing && st.grab && st.grabW < 0.05) st.grab = null;
    st.grabW += ((grabbing ? 1 : 0) - st.grabW) * (1 - Math.exp(-(grabbing ? 9 : 11) * dt));
    if (st.grab && st.grabW > 0.7) a.grabs[st.grab] = (a.grabs[st.grab] || 0) + dt;

    // Rotation (spin) : en relâchant, on termine jusqu'au demi-tour suivant
    const spinIn = grabbing ? 0 : sx;
    if (spinIn) {
      st.spinVel += (spinIn * SPIN_RATE - st.spinVel) * (1 - Math.exp(-14 * dt));
      st.spin += st.spinVel * dt;
    } else if (st.spinVel) {
      const dir = Math.sign(st.spinVel), v = Math.max(5, Math.abs(st.spinVel));
      const next = Math.ceil((st.spin * dir) / Math.PI - 0.08) * Math.PI * dir;
      const ns = st.spin + dir * v * dt;
      if ((next - ns) * dir <= 0) { st.spin = next; st.spinVel = 0; } else { st.spin = ns; st.spinVel = dir * v; }
    }
    a.spin = st.spin;

    // Flip : engagé, il continue jusqu'au tour complet suivant
    if (!grabbing && py) st.flipVel = py * FLIP_RATE;
    if (st.flipVel) {
      const dir = Math.sign(st.flipVel);
      st.flip += st.flipVel * dt;
      if (!py || grabbing) {
        const next = Math.ceil((st.flip * dir) / TAU - 0.03) * TAU * dir;
        if ((next - st.flip) * dir <= 0) { st.flip = next; st.flipVel = 0; }
      }
    }
    a.flip = st.flip;

    // Demi-tour automatique sur les airs de quarter
    if (st.autoTurnTarget) {
      const d = st.autoTurnTarget - st.autoTurn;
      st.autoTurn += Math.sign(d) * Math.min(Math.abs(d), st.autoTurnRate * dt);
    }

    // Tailwhip / heelwhip / barspin : on peut enchaîner (double, triple…)
    if (consume('whip') && Math.abs(st.whipT - st.whipA) < TAU * 1.05) { st.whipT += TAU; a.whipsT++; Sfx.whoosh(); }
    if (consume('heel') && Math.abs(st.whipT - st.whipA) < TAU * 1.05) { st.whipT -= TAU; a.whipsH++; Sfx.whoosh(); }
    if (consume('bar') && Math.abs(st.barT - st.barA) < TAU * 1.05) { st.barT += TAU; a.barsF++; Sfx.whoosh(); }
    if (consume('barB') && Math.abs(st.barT - st.barA) < TAU * 1.05) { st.barT -= TAU; a.barsB++; Sfx.whoosh(); }
    st.whipA += clamp(st.whipT - st.whipA, -WHIP_RATE * dt, WHIP_RATE * dt);
    st.barA += clamp(st.barT - st.barA, -BAR_RATE * dt, BAR_RATE * dt);
    pressed.delete('jumpUp'); pressed.delete('manual'); pressed.delete('revert');

    _np.copy(st.pos).addScaledVector(st.vel, dt);
    a.height = Math.max(a.height, _np.y - a.startY);

    if (st.vel.y < 2.5 && tryGrind(_np)) return;

    if (!Park.inBounds(_np.x, _np.z)) {
      st.vel.x *= -0.3; st.vel.z *= -0.3;
      _np.x = clamp(_np.x, Park.BOUNDS.minX + 0.05, Park.BOUNDS.maxX - 0.05);
      _np.z = clamp(_np.z, Park.BOUNDS.minZ + 0.05, Park.BOUNDS.maxZ - 0.05);
    }
    let gq = Park.ground(_np.x, _np.z);
    if (gq.y > st.pos.y + 0.3) {               // flanc d'un module : on rebondit
      st.vel.x *= -0.25; st.vel.z *= -0.25;
      _np.x = st.pos.x; _np.z = st.pos.z;
      gq = Park.ground(_np.x, _np.z);
    }
    if (_np.y <= gq.y) { st.pos.set(_np.x, gq.y, _np.z); land(gq); return; }
    st.pos.copy(_np);
  }

  /* Les rotations sont-elles terminées ? (réception ou arrivée sur un rail) */
  function trickFailure() {
    if (Math.abs(st.whipT - st.whipA) > 0.5) return 'Tailwhip pas fini';
    if (Math.abs(st.barT - st.barA) > 0.75) return 'Barspin pas rattrapé';
    if (st.grabW > 0.45) return 'Lâché trop tard';
    if (Math.abs(wrapPi(st.flip)) > 0.8) return st.flip < 0 ? 'Backflip pas fini' : 'Frontflip pas fini';
    return null;
  }

  function land(gq) {
    const n = vecN(gq.n, _n);
    const vn = st.vel.dot(n);
    const impact = -vn;
    st.vel.addScaledVector(n, -vn);
    const finalHeading = st.heading + st.spin + st.autoTurn;
    const f = forwardTangent(finalHeading, n, _f);
    const sp = st.vel.length();
    let reason = trickFailure();
    let dot = 1;
    if (!reason && sp > 1.2) {
      dot = _t.copy(st.vel).normalize().dot(f);
      if (Math.abs(dot) < 0.55) reason = 'Réception de travers';
    }
    if (!reason && impact > 12.5) reason = 'Réception trop dure';
    st.n.copy(n); st.groundEl = gq.el;
    if (reason) { bail(reason); return; }

    const a = st.air;
    a.landName = gq.el ? gq.el.name : null;
    a.drop = a.startY - gq.y;
    st.heading = wrapPi(finalHeading);
    const t = Tricks.scoreAir(a);
    clearTricks();
    st.mode = 'ground';
    st.landT = Math.min(0.35, 0.08 + impact * 0.03);
    Sfx.land(impact);
    if (t) {
      if (dot < 0) t.name += ' (fakie)';
      comboAdd(t);
    }
    if (combo.active) combo.grace = 0.55;
    if (held('manual') && sp > 1.2) startManual();
  }

  /* ── Grinds ── */
  function tryGrind(np) {
    if (st.air && st.air.vert) return false;
    for (const r of Park.rails) {
      if (r === st.lastRail && st.railCooldown > 0) continue;
      const ax = r.a.x, az = r.a.z, dx = r.b.x - ax, dz = r.b.z - az, L2 = dx * dx + dz * dz;
      const t = ((np.x - ax) * dx + (np.z - az) * dz) / L2;
      if (t < 0.02 || t > 0.98) continue;
      const cx = ax + dx * t, cz = az + dz * t, cy = r.a.y + (r.b.y - r.a.y) * t;
      const hd = Math.hypot(np.x - cx, np.z - cz);
      if (hd > (r.type === 'ledge' ? 0.3 : 0.4)) continue;
      const dy = np.y - cy;
      if (dy < -0.3 || dy > 0.35 || st.pos.y < cy - 0.15) continue;
      const vh = Math.hypot(st.vel.x, st.vel.z);
      if (vh < 1.2) continue;
      const dh = Math.hypot(r.dir.x, r.dir.z);
      const along = (st.vel.x * r.dir.x + st.vel.z * r.dir.z) / (vh * dh);
      if (Math.abs(along) < 0.72) continue;
      startGrind(r, t, Math.sign(along));
      return true;
    }
    return false;
  }

  function startGrind(r, t, sign) {
    const reason = trickFailure();
    if (reason) { bail(reason); return; }
    const a = st.air;
    a.landName = r.name; a.drop = 0;
    const finalHeading = st.heading + st.spin + st.autoTurn;
    const tr = Tricks.scoreAir(a);
    clearTricks();
    if (tr) comboAdd(tr);
    const py = clamp(inputPitch(), -1, 1), sx = clamp(inputSteer(), -1, 1);
    const type = py > 0.5 ? 'nose' : py < -0.5 ? 'feeble' : sx > 0.5 ? 'smith' : sx < -0.5 ? 'crooked' : 'fiftyFifty';
    const railHeading = Math.atan2(r.dir.x * sign, r.dir.z * sign);
    const fakie = Math.cos(wrapPi(finalHeading - railHeading)) < 0;
    st.heading = railHeading + (fakie ? Math.PI : 0);
    const s = (st.vel.x * r.dir.x + st.vel.z * r.dir.z + st.vel.y * r.dir.y);
    st.grind = { r, t, s: Math.abs(s) < 1.5 ? sign * 1.5 : s, type, time: 0, bal: (Math.random() - 0.5) * 0.3 };
    st.mode = 'grind';
    combo.grace = 0;
    Sfx.metal();
  }

  function grindStep(dt) {
    const g = st.grind, r = g.r;
    g.time += dt;
    g.s += -G * r.dir.y * dt;
    g.s -= Math.sign(g.s) * 0.75 * dt;
    g.t += g.s * dt / r.len;
    // Équilibre
    const steer = clamp(inputSteer(), -1, 1);
    g.bal += ((Math.random() - 0.5) * 2.0 + g.bal * 1.25) * dt - steer * 2.8 * dt;
    if (Math.abs(g.bal) > 1) { bail('Déséquilibre sur le rail'); return; }
    st.pos.copy(r.a).lerp(r.b, clamp(g.t, 0, 1));
    st.pos.y += r.type === 'ledge' ? 0 : r.radius;
    st.vel.copy(r.dir).multiplyScalar(g.s);
    rider.spinWheels(0);
    pressed.delete('manual'); pressed.delete('revert');
    if (consume('jumpUp')) { st.charge = 0; exitGrind(true); return; }
    if (held('jump')) st.charge = Math.min(0.45, st.charge + dt);
    if (g.t < 0 || g.t > 1) {
      // Rail coudé : on enchaîne sur le segment suivant sans couper le grind
      const end = g.t > 1 ? r.b : r.a;
      const next = Park.rails.find(o => o !== r && (o.a.distanceTo(end) < 0.05 || o.b.distanceTo(end) < 0.05));
      if (next) {
        const fromA = next.a.distanceTo(end) < 0.05;
        const speed = Math.abs(g.s);
        g.r = next; g.t = fromA ? 0 : 1; g.s = fromA ? speed : -speed;
        return;
      }
      exitGrind(false);
      return;
    }
    if (Math.abs(g.s) < 0.35) exitGrind(false);
  }

  function exitGrind(jump) {
    const g = st.grind;
    comboAdd(Tricks.scoreGrind(g.type, g.time, g.r.name));
    st.lastRail = g.r; st.railCooldown = 0.4;
    st.grind = null;
    if (jump) { st.vel.y += 3.4 + st.charge * 2; Sfx.pop(); }
    else st.vel.y += 0.5;
    st.charge = 0;
    st.n.set(0, 1, 0);
    goAir({ fromRail: true, keepCombo: true, launchName: g.r.name });
  }

  /* ── Manuals ── */
  function startManual() {
    st.manual = { nose: held('up') || touch.y > 0.5, bal: 0, t: 0 };
    combo.grace = 0;
  }
  function manualStep(dt) {
    const m = st.manual;
    m.t += dt;
    const py = clamp(inputPitch(), -1, 1);
    m.bal += ((Math.random() - 0.5) * 2 + m.bal * 1.5) * dt - py * 2.6 * dt;   // Z penche en avant, S en arrière
    const over = m.nose ? -m.bal : m.bal;
    if (over > 1) { st.manual = null; bail(m.nose ? 'Passé par-dessus le guidon' : 'Manual trop en arrière'); return false; }
    if (over < -1 || !(held('manual') || touch.manual) || st.n.y < 0.9) endManual(false);
    return true;
  }
  function endManual(toAir) {
    const m = st.manual;
    st.manual = null;
    if (m.t > 0.35) comboAdd(Tricks.scoreManual(m.nose, m.t));
    if (!toAir && combo.active) combo.grace = 0.55;
  }

  /* ── Chute ── */
  function bail(reason) {
    st.mode = 'bail';
    st.bailT = 0;
    st.bailSpin = (Math.random() < 0.5 ? -1 : 1) * (1.5 + Math.random() * 2);
    st.grind = null; st.manual = null; st.revert = null;
    clearTricks();
    st.vel.y = Math.min(st.vel.y, 0);
    Sfx.bail();
    comboLose(reason);
  }
  function bailStep(dt) {
    st.bailT += dt;
    const gq = Park.ground(st.pos.x, st.pos.z);
    st.vel.y -= G * dt;
    st.vel.x *= Math.exp(-2.2 * dt); st.vel.z *= Math.exp(-2.2 * dt);
    _np.copy(st.pos).addScaledVector(st.vel, dt);
    if (!Park.inBounds(_np.x, _np.z) || Park.ground(_np.x, _np.z).y > st.pos.y + 0.3) { _np.x = st.pos.x; _np.z = st.pos.z; st.vel.x = st.vel.z = 0; }
    const g2 = Park.ground(_np.x, _np.z);
    if (_np.y <= g2.y) { _np.y = g2.y; st.vel.y = 0; vecN(g2.n, st.n); }
    st.pos.copy(_np);
    pressed.clear();
    if (st.bailT > 1.7) {
      // On se relève là où on a glissé, dans le sens de la glissade
      const hs = Math.hypot(st.vel.x, st.vel.z);
      if (hs > 0.3) st.heading = Math.atan2(st.vel.x, st.vel.z);
      st.vel.set(0, 0, 0);
      st.mode = 'ground';
      st.pos.y = Park.ground(st.pos.x, st.pos.z).y;
      rider.com.rotation.set(0, 0, 0);
      cam.snap = true;
    }
  }

  /* ═══ VISUEL DU RIDER ═══ */
  const _qa = new THREE.Quaternion(), _qy = new THREE.Quaternion();
  function updateVisual(dt) {
    // Normale d'affichage : sol, ou ce qui est dessous quand on approche en l'air
    if (st.mode === 'air') {
      if (st.air.vert) _t.copy(st.air.launchN);
      else {
        const below = Park.ground(st.pos.x, st.pos.z);
        const h = st.pos.y - below.y;
        _t.set(0, 1, 0).lerp(vecN(below.n, _g), clamp(1 - h / 1.6, 0, 1)).normalize();
        if (st.air.airTime < 0.25) _t.lerp(st.air.launchN, 1 - st.air.airTime / 0.25).normalize();
      }
      st.dispN.lerp(_t, 1 - Math.exp(-5 * dt)).normalize();
    } else if (st.mode === 'grind') {
      st.dispN.lerp(UP, 1 - Math.exp(-12 * dt)).normalize();
    } else {
      st.dispN.lerp(st.n, 1 - Math.exp(-20 * dt)).normalize();
    }

    let yaw = st.heading + st.spin + st.autoTurn;
    if (st.revert) yaw = st.revert.from + Math.PI * easeInOut(Math.min(1, st.revert.t));
    _qa.setFromUnitVectors(UP, st.dispN);
    _qy.setFromAxisAngle(UP, yaw);
    rider.root.quaternion.copy(_qa).multiply(_qy);
    rider.root.position.copy(st.pos);

    // Rotations des figures
    rider.whip.rotation.y = st.whipA;
    st.xupA += ((st.grab === 'xup' ? Math.PI * 0.95 * st.grabW : 0) - st.xupA) * (1 - Math.exp(-14 * dt));
    rider.bar.rotation.y = st.barA + st.xupA;

    // Bascule (manual, grind, chute)
    let tiltX = 0, tiltY = 0, tiltZ = 0;
    rider.tilt.position.set(0, 0.055, -0.26); rider.rig.position.set(0, -0.055, 0.26);
    if (st.manual) {
      if (st.manual.nose) {
        rider.tilt.position.set(0, 0.055, 0.27); rider.rig.position.set(0, -0.055, -0.27);
        tiltX = 0.26 - st.manual.bal * 0.1;
      } else tiltX = -0.3 - st.manual.bal * 0.1;
    } else if (st.mode === 'grind') {
      const ty = st.grind.type;
      if (ty === 'feeble') { tiltX = -0.18; tiltY = 0.35; }
      else if (ty === 'smith') { tiltX = -0.15; tiltY = -0.35; }
      else if (ty === 'nose') { rider.tilt.position.set(0, 0.055, 0.27); rider.rig.position.set(0, -0.055, -0.27); tiltX = 0.22; }
      else if (ty === 'crooked') { tiltY = 0.45; tiltX = 0.1; }
      tiltZ = st.grind.bal * 0.35;
    }
    rider.tilt.rotation.set(tiltX, tiltY, tiltZ);

    if (st.mode === 'bail') {
      const k = Math.min(1, st.bailT / 0.45);
      rider.com.rotation.set(-1.35 * k, st.bailSpin * k * 0.5, st.bailSpin * 0.25 * k);
    } else {
      rider.com.rotation.set(st.flip, 0, 0);
    }

    // Pose
    const names = [];
    if (st.mode === 'bail') names.push(['bail', 1]);
    else if (st.mode === 'grind') names.push(['grind', 1]);
    else if (st.mode === 'air') {
      names.push(['air', 1]);
      const whipping = Math.abs(st.whipT - st.whipA) > 0.15, flipping = Math.abs(st.flipVel) > 0.1;
      if (whipping || flipping) names.push(['tuck', 1]);
      if (Math.abs(st.barT - st.barA) > 0.25) names.push(['release', 1]);
      if (st.grab) names.push([st.grab, st.grabW]);
      if (st.air.airTime < 0.12) names.push(['crouch', 1 - st.air.airTime / 0.12]);
    } else {
      if (st.manual) names.push([st.manual.nose ? 'noseManual' : 'manual', 1]);
      else if (st.pushT > 0) names.push(['push', 0.5 + 0.5 * Math.sin(st.pushT * 7)]);
      names.push(['crouch', Math.max(st.charge / 0.45, st.landT / 0.35, st.revert ? 0.5 : 0)]);
    }
    rider.setTarget(names);
    rider.update(dt, st.mode === 'air' ? 20 : 15);
  }
  const easeInOut = t => t * t * (3 - 2 * t);

  /* ═══ CAMÉRA ═══ */
  const CAMS = [
    { dist: 4.3, h: 1.6, look: 1.0, name: 'Poursuite' },
    { dist: 7.8, h: 2.8, look: 0.9, name: 'Large' },
    { dist: 2.9, h: 1.15, look: 1.1, name: 'Proche' },
  ];
  const cam = { yaw: Math.PI, snap: true, pos: new V3(), look: new V3(), vertW: 0 };
  function updateCamera(dt) {
    const c = CAMS[game.camMode];
    const hs = Math.hypot(st.vel.x, st.vel.z);
    const followVel = (st.mode === 'ground' || st.mode === 'grind') ? hs > 1.2 : (st.mode === 'air' && !st.air.vert && hs > 3);
    let target = cam.yaw;
    if (followVel) target = Math.atan2(st.vel.x, st.vel.z);
    else if (st.mode === 'ground' && hs < 0.5) target = st.heading;
    const k = 1 - Math.exp(-(st.mode === 'air' ? 1.5 : 3.2) * dt);
    cam.yaw += wrapPi(target - cam.yaw) * k;

    _t.set(Math.sin(cam.yaw), 0, Math.cos(cam.yaw));
    const look = _g.copy(st.pos).addScaledVector(UP, c.look);
    const want = new V3().copy(st.pos).addScaledVector(UP, c.h).addScaledVector(_t, -c.dist);
    // Air de quarter : on recule et on filme d'en bas, comme depuis le flat
    const vertCam = (st.mode === 'air' && st.air.vert) || (st.mode === 'ground' && st.n.y < 0.55);
    cam.vertW += ((vertCam ? 1 : 0) - cam.vertW) * (1 - Math.exp(-3 * dt));
    if (cam.vertW > 0.01) {
      const vw = new V3().copy(st.pos).addScaledVector(_t, -(c.dist + 3.2));
      vw.y = Math.max(Park.ground(vw.x, vw.z).y + 1.2, st.pos.y * 0.35 + 1.3);
      want.lerp(vw, cam.vertW);
    }
    // Éviter de passer dans les modules : on raccourcit si le sol coupe la ligne de vue
    for (let i = 1; i <= 6; i++) {
      const p = look.clone().lerp(want, i / 6);
      const gy = Park.ground(p.x, p.z).y;
      if (gy > p.y - 0.35) { want.lerp(look, 1 - (i - 1) / 6); want.y = Math.max(want.y, gy + 0.45); break; }
    }
    want.y = Math.max(want.y, Park.ground(want.x, want.z).y + 0.5);
    if (cam.snap) { cam.pos.copy(want); cam.look.copy(look); cam.snap = false; }
    cam.pos.lerp(want, 1 - Math.exp(-9 * dt));
    cam.look.lerp(look, 1 - Math.exp(-14 * dt));
    camera.position.copy(cam.pos);
    camera.lookAt(cam.look);
    sky.position.copy(camera.position);
  }

  /* ═══ INTERFACE ═══ */
  let trickTimer = 0, toastId = 0;
  function flashTrick(name, pts) {
    const el = $('hud-trick');
    el.innerHTML = `<span class="tn"></span><span class="tp"></span>`;
    el.querySelector('.tn').textContent = name;
    el.querySelector('.tp').textContent = `+${fmt(pts)}`;
    el.classList.remove('show'); void el.offsetWidth; el.classList.add('show');
    trickTimer = 1.6;
  }
  function toast(text, kind = '') {
    const wrap = $('toasts');
    const d = document.createElement('div');
    d.className = 'toast ' + kind;
    d.textContent = text;
    d.dataset.id = ++toastId;
    wrap.appendChild(d);
    while (wrap.children.length > 4) wrap.firstChild.remove();
    setTimeout(() => { d.classList.add('out'); setTimeout(() => d.remove(), 400); }, 2200);
  }
  function renderCombo() {
    const el = $('hud-combo');
    if (!combo.active) { el.classList.remove('on'); return; }
    el.classList.add('on');
    const names = combo.list.map(t => t.name);
    $('combo-list').textContent = (names.length > 4 ? '… + ' : '') + names.slice(-4).join(' + ');
    $('combo-total').textContent = `${fmt(combo.base)} × ${comboMult()}`;
  }
  function renderScore() {
    $('hud-score').textContent = fmt(game.score);
    $('hud-best').textContent = `Record session : ${fmt(game.best)} · meilleur combo : ${fmt(game.bestCombo)}`;
  }
  function liveAirName() {
    if (st.mode === 'grind') {
      const g = st.grind;
      return `${Tricks.GRINDS[g.type].name} · ${g.time.toFixed(1)} s`;
    }
    if (st.mode === 'ground' && st.manual) return `${st.manual.nose ? 'Nose manual' : 'Manual'} · ${st.manual.t.toFixed(1)} s`;
    if (st.mode !== 'air') return '';
    const t = Tricks.scoreAir(Object.assign({}, st.air, { landName: null }));
    return t && !['Bunny hop', 'Air', 'Saut'].includes(t.name) ? t.name : '';
  }
  let hudT = 0;
  function updateHud(dt) {
    hudT -= dt;
    trickTimer -= dt;
    if (trickTimer <= 0) $('hud-trick').classList.remove('show');
    const speed = st.vel.length() * 3.6;
    // Jauge d'équilibre
    const bal = st.mode === 'grind' ? st.grind.bal : (st.manual ? (st.manual.nose ? -st.manual.bal : st.manual.bal) : null);
    const bw = $('hud-balance');
    if (bal === null) bw.classList.remove('on');
    else {
      bw.classList.add('on');
      bw.querySelector('i').style.left = `${50 + clamp(bal, -1, 1) * 46}%`;
      bw.classList.toggle('danger', Math.abs(bal) > 0.7);
      bw.querySelector('span').textContent = st.mode === 'grind' ? 'Équilibre : Q / D' : 'Équilibre : Z / S';
    }
    if (hudT > 0) return;
    hudT = 0.08;
    $('hud-speed').textContent = Math.round(speed);
    $('hud-live').textContent = liveAirName();
    if (game.mode === 'session') {
      const s = Math.max(0, Math.ceil(game.time));
      $('hud-timer').textContent = `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
    }
    let hint = '';
    if (st.mode === 'air') hint = 'J tailwhip · U heelwhip · K barspin · L grab (+ dir.) · Q/D rotation · S backflip · Z frontflip';
    else if (st.mode === 'grind') hint = 'Q / D équilibre · Espace pour sauter du rail';
    else if (st.manual) hint = 'Z / S équilibre · Espace pour sauter';
    else if (st.mode === 'ground') hint = 'Z pousser / pumper · Q D tourner · Espace sauter (maintenir) · Maj. manual · E revert';
    $('hud-hint').textContent = hint;
  }

  /* ── Menus ── */
  function show(id, on) { $(id).hidden = !on; }
  function startGame(mode) {
    Sfx.init();
    game.mode = mode;
    game.score = 0; game.time = 120;
    game.sessionBestCombo = 0; game.sessionBestTrick = null;
    $('hud-timer').hidden = mode !== 'session';
    $('hud-mode').textContent = mode === 'session' ? 'Session' : 'Ride libre';
    resetRider(game.spawn);
    renderScore();
    game.state = 'play';
    show('menu-start', false); show('menu-pause', false); show('panel-results', false);
    show('hud', true);
    canvas.focus();
  }
  function pause(on) {
    if (on) {
      game.state = 'pause';
      keys.clear(); pressed.clear();
      show('menu-pause', true);
      Sfx.update(0, false, false);
    } else {
      game.state = 'play';
      show('menu-pause', false); closePanels();
    }
  }
  function endSession() {
    comboBank();
    game.state = 'results';
    const best = game.score > game.best;
    if (best) { game.best = game.score; store.set('best', game.best); }
    checkChallenges(null, { session: game.score });
    $('res-score').textContent = fmt(game.score);
    $('res-best').textContent = best ? 'Nouveau record !' : `Record : ${fmt(game.best)}`;
    $('res-combo').textContent = fmt(game.sessionBestCombo);
    $('res-trick').textContent = game.sessionBestTrick ? `${game.sessionBestTrick.name} (${fmt(game.sessionBestTrick.pts)})` : '—';
    show('panel-results', true);
    Sfx.update(0, false, false);
    renderScore();
  }
  function closePanels() { show('panel-book', false); show('panel-controls', false); }

  function renderBook(tab = 'tricks') {
    const list = $('book-list');
    list.innerHTML = '';
    document.querySelectorAll('.book-tabs button').forEach(b => b.classList.toggle('on', b.dataset.tab === tab));
    if (tab === 'tricks') {
      $('book-count').textContent = `${game.book.size} / ${Tricks.BOOK.length} figures réussies`;
      for (const b of Tricks.BOOK) {
        const li = document.createElement('li');
        li.className = game.book.has(b.id) ? 'done' : '';
        li.innerHTML = '<span class="ck"></span><div><strong></strong><span class="k"></span></div><span class="stars"></span>';
        li.querySelector('.ck').textContent = game.book.has(b.id) ? '✓' : '';
        li.querySelector('strong').textContent = b.name;
        li.querySelector('.k').textContent = b.keys;
        li.querySelector('.stars').textContent = '★'.repeat(b.stars) + '☆'.repeat(5 - b.stars);
        list.appendChild(li);
      }
    } else {
      $('book-count').textContent = `${game.challenges.size} / ${Tricks.CHALLENGES.length} défis réussis`;
      for (const c of Tricks.CHALLENGES) {
        const li = document.createElement('li');
        li.className = game.challenges.has(c.id) ? 'done' : '';
        li.innerHTML = '<span class="ck"></span><div><strong></strong></div><span class="stars"></span>';
        li.querySelector('.ck').textContent = game.challenges.has(c.id) ? '✓' : '';
        li.querySelector('strong').textContent = c.name;
        list.appendChild(li);
      }
    }
  }
  function openBook(tab) { renderBook(tab); show('panel-book', true); }

  // Sélecteurs de départ
  for (const sel of document.querySelectorAll('.spawn-select')) {
    Park.spawns.forEach((s, i) => sel.add(new Option(s.name, i)));
    sel.addEventListener('change', () => { game.spawn = +sel.value; document.querySelectorAll('.spawn-select').forEach(o => { o.value = sel.value; }); });
  }
  document.querySelectorAll('[data-act]').forEach(b => b.addEventListener('click', () => {
    const act = b.dataset.act;
    if (act === 'free' || act === 'session') startGame(act);
    else if (act === 'resume') pause(false);
    else if (act === 'respawn') { resetRider(game.spawn); pause(false); }
    else if (act === 'menu') { game.state = 'menu'; show('menu-pause', false); show('panel-results', false); show('hud', false); show('menu-start', true); closePanels(); Sfx.update(0, false, false); }
    else if (act === 'book') openBook('tricks');
    else if (act === 'controls') show('panel-controls', true);
    else if (act === 'close') closePanels();
    else if (act === 'again') startGame(game.mode);
    else if (act === 'camera') { game.camMode = (game.camMode + 1) % CAMS.length; b.textContent = `Caméra : ${CAMS[game.camMode].name}`; }
  }));
  document.querySelectorAll('.book-tabs button').forEach(b => b.addEventListener('click', () => renderBook(b.dataset.tab)));

  /* ── Commandes tactiles ── */
  const touch = { x: 0, y: 0, grab: false, manual: false };
  if (coarse) {
    document.body.classList.add('touch');
    const stick = $('stick'), knob = stick.querySelector('i');
    let sid = null, cx = 0, cy = 0;
    stick.addEventListener('pointerdown', e => { sid = e.pointerId; const r = stick.getBoundingClientRect(); cx = r.left + r.width / 2; cy = r.top + r.height / 2; stick.setPointerCapture(sid); move(e); });
    const move = e => {
      if (e.pointerId !== sid) return;
      const dx = e.clientX - cx, dy = e.clientY - cy, m = Math.min(1, Math.hypot(dx, dy) / 46), a = Math.atan2(dy, dx);
      touch.x = Math.cos(a) * m; touch.y = -Math.sin(a) * m;
      if (Math.abs(touch.x) < 0.2) touch.x = 0; if (Math.abs(touch.y) < 0.2) touch.y = 0;
      knob.style.transform = `translate(${Math.cos(a) * m * 46}px, ${Math.sin(a) * m * 46}px)`;
    };
    stick.addEventListener('pointermove', move);
    const end = e => { if (e.pointerId !== sid) return; sid = null; touch.x = touch.y = 0; knob.style.transform = ''; };
    stick.addEventListener('pointerup', end); stick.addEventListener('pointercancel', end);
    document.querySelectorAll('[data-touch]').forEach(btn => {
      const a = btn.dataset.touch;
      btn.addEventListener('pointerdown', e => { e.preventDefault(); Sfx.init(); if (a === 'grab') touch.grab = true; else if (a === 'manual') { touch.manual = true; press('manual'); } else press(a); });
      const up = e => { e.preventDefault(); if (a === 'grab') touch.grab = false; else if (a === 'manual') { touch.manual = false; release('manual'); } else release(a); };
      btn.addEventListener('pointerup', up); btn.addEventListener('pointercancel', up); btn.addEventListener('pointerleave', up);
    });
  }

  /* ═══ BOUCLE ═══ */
  function resize() {
    const w = innerWidth, h = innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.fov = w < h ? 75 : 62;
    camera.updateProjectionMatrix();
  }
  addEventListener('resize', resize);
  resize();

  let acc = 0, last = performance.now();
  function frame(now) {
    requestAnimationFrame(frame);
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    if (game.state === 'play') {
      if (consume('camera')) game.camMode = (game.camMode + 1) % CAMS.length;
      if (consume('reset')) resetRider(game.spawn);
      if (consume('tower')) resetRider(1);
      if (consume('book')) { pause(true); openBook('tricks'); }
      if (consume('help')) { game.helpOpen = !game.helpOpen; $('hud-hint').hidden = !game.helpOpen; }
      acc += dt;
      while (acc >= DT) { step(DT); acc -= DT; }
      if (game.mode === 'session') { game.time -= dt; if (game.time <= 0) endSession(); }
      updateVisual(dt);
      updateHud(dt);
      Sfx.update(st.vel.length(), st.mode === 'ground', st.mode === 'grind');
    } else if (game.state === 'menu') {
      // Caméra de présentation qui tourne autour du park
      const t = now / 1000 * 0.06;
      camera.position.set(Math.sin(t) * 46, 17, Math.cos(t) * 46);
      camera.lookAt(0, 0, 0);
      sky.position.copy(camera.position);
      acc = 0;
    } else acc = 0;
    if (game.state === 'play' || game.state === 'pause' || game.state === 'results') {
      if (game.state === 'play') updateCamera(dt);
    }
    renderer.render(scene, camera);
  }

  resetRider(0);
  rider.setTarget([]); rider.snap();
  updateVisual(0.016);
  renderScore();
  show('hud', false);
  $('hud-hint').hidden = !game.helpOpen;
  requestAnimationFrame(frame);

  // Accès console pour le débogage
  window.__trott = {
    st, game, combo, Park, press, release, resetRider, camera, rider,
    // Fait avancer la simulation de `sec` secondes sans attendre l'affichage
    sim(sec) { let k = 0; for (let t = 0; t < sec; t += DT) { step(DT); if (++k % 2 === 0) updateVisual(DT * 2); } updateCamera(1); },
  };
})();
