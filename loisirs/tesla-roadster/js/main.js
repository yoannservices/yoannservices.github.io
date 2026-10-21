'use strict';
/* ===== Tesla Roadster — simulateur : rendu, physique, trafic, jour/nuit, audio ===== */
(async function () {
  const $ = id => document.getElementById(id);
  const loadMsg = $('loadmsg');
  const THREE = await import('three');
  const { mergeGeometries } = await import('three/addons/utils/BufferGeometryUtils.js');
  const { Sky } = await import('three/addons/objects/Sky.js');
  const { RoomEnvironment } = await import('three/addons/environments/RoomEnvironment.js');
  const { RoundedBoxGeometry } = await import('three/addons/geometries/RoundedBoxGeometry.js');
  const { EffectComposer } = await import('three/addons/postprocessing/EffectComposer.js');
  const { RenderPass } = await import('three/addons/postprocessing/RenderPass.js');
  const { UnrealBloomPass } = await import('three/addons/postprocessing/UnrealBloomPass.js');
  const { OutputPass } = await import('three/addons/postprocessing/OutputPass.js');
  const { MeshBVH } = await import('three-mesh-bvh');
  const V3 = THREE.Vector3, Q = THREE.Quaternion;
  const clamp = (x, a, b) => x < a ? a : x > b ? b : x;
  const lerp = (a, b, t) => a + (b - a) * t;
  const sstep = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };

  // ---------- Rendu ----------
  const canvas = $('c');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
  // GPU intégré / logiciel : on démarre en mode performance
  const gpuName = (() => { try { const gl = renderer.getContext(), e = gl.getExtension('WEBGL_debug_renderer_info'); return e ? gl.getParameter(e.UNMASKED_RENDERER_WEBGL) : ''; } catch (e) { return ''; } })();
  let hiQ = !/intel|swiftshader|llvmpipe|mali|adreno|powervr|apple gpu/i.test(gpuName);
  const maxPR = () => hiQ ? Math.min(window.devicePixelRatio || 1, 1.5) : 1;
  let pixelRatio = maxPR();
  renderer.setPixelRatio(pixelRatio);
  renderer.setSize(innerWidth, innerHeight);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.8;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(64, innerWidth / innerHeight, 0.25, 9000);
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

  const sky = new Sky();
  sky.scale.setScalar(8000);
  sky.material.depthTest = false; sky.material.depthWrite = false; sky.renderOrder = -1000; sky.frustumCulled = false;
  scene.add(sky);
  const skyU = sky.material.uniforms;
  skyU.turbidity.value = 6; skyU.rayleigh.value = 1.6; skyU.mieCoefficient.value = 0.004; skyU.mieDirectionalG.value = 0.82;

  // étoiles
  const stars = (() => {
    const n = 2500, p = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      const u = Math.random(), v = Math.random() * 0.95 + 0.05, th = u * Math.PI * 2, ph = Math.acos(1 - v);
      p.set([Math.cos(th) * Math.sin(ph) * 6000, Math.cos(ph) * 6000, Math.sin(th) * Math.sin(ph) * 6000], i * 3);
    }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(p, 3));
    const m = new THREE.PointsMaterial({ color: 0xffffff, size: 1.6, sizeAttenuation: false, transparent: true, opacity: 0, fog: false, depthWrite: false });
    const s = new THREE.Points(g, m); s.frustumCulled = false; s.renderOrder = -999; scene.add(s); return s;
  })();

  const sun = new THREE.DirectionalLight(0xffffff, 3);
  sun.castShadow = true;
  sun.shadow.mapSize.set(hiQ ? 2048 : 1024, hiQ ? 2048 : 1024);
  Object.assign(sun.shadow.camera, { left: -110, right: 110, top: 110, bottom: -110, near: 1, far: 1400 });
  sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.06;
  scene.add(sun); scene.add(sun.target);
  const hemi = new THREE.HemisphereLight(0xbfd8ff, 0x3a3328, 0.8);
  scene.add(hemi);
  scene.fog = new THREE.Fog(0xbfd4e6, 400, 2600);

  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  const bloom = new UnrealBloomPass(new THREE.Vector2(innerWidth, innerHeight), 0.5, 0.5, 0.92);
  composer.addPass(bloom);
  composer.addPass(new OutputPass());

  // ---------- Monde ----------
  loadMsg.textContent = 'Construction de la ville…';
  await new Promise(r => setTimeout(r, 30));
  const city = window.buildCity(THREE, mergeGeometries, renderer, scene);
  const bvh = new MeshBVH(city.colGeom, { maxLeafTris: 8 });
  loadMsg.textContent = 'Préparation de la Roadster…';
  await new Promise(r => setTimeout(r, 10));
  const model = window.buildRoadster(THREE);
  scene.add(model.root);

  // ---------- Requêtes de collision ----------
  const _ray = new THREE.Ray();
  function raycast(origin, dir, far) {
    _ray.origin.copy(origin); _ray.direction.copy(dir);
    const h = bvh.raycastFirst(_ray, THREE.DoubleSide, 0, far);
    if (!h || h.distance > far) return null;
    const n = h.face.normal.clone();
    if (n.dot(dir) > 0) n.negate();
    return { point: h.point, distance: h.distance, normal: n };
  }
  const _cpt = { point: new V3(), distance: 0, faceIndex: 0 };
  function closest(p, maxD) {
    const r = bvh.closestPointToPoint(p, _cpt, 0, maxD);
    return r && r.distance < maxD ? r : null;
  }

  // ---------- Entrées clavier (touches physiques : ZQSD en AZERTY = WASD en QWERTY) ----------
  const keys = {};
  const GAME_CODES = new Set(['KeyW', 'KeyA', 'KeyS', 'KeyD', 'KeyQ', 'KeyE', 'Space', 'ShiftLeft', 'ShiftRight', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight']);
  addEventListener('keydown', e => {
    if (GAME_CODES.has(e.code)) e.preventDefault();
    if (menuOpen) { if (e.code === 'Enter') startGame(); return; }
    keys[e.code] = true;
    if (e.repeat) return;
    const k = e.key.toLowerCase();
    if (e.code === 'Escape' || k === 'p') openMenu(true);
    else if (k === 'r') respawn();
    else if (k === 'c') { camMode = (camMode + 1) % 3; toast(['Caméra poursuite', 'Caméra éloignée', 'Vue cockpit'][camMode]); }
    else if (k === 'l') { lightsForced = !lightsForced; toast(lightsForced ? 'Phares forcés' : 'Phares automatiques'); }
    else if (k === 'n') { timeOfDay = (timeOfDay + 6) % 24; toast('Heure : ' + fmtTime(timeOfDay)); }
    else if (k === 'h') $('help').classList.toggle('hide');
    else if (k === 'm') { muted = !muted; toast(muted ? 'Son coupé' : 'Son activé'); }
    else if (k === 'k') cyclePaint();
    else if (k === 'g') { hiQ = !hiQ; applyQuality(); toast(hiQ ? 'Qualité haute' : 'Qualité performance'); }
  });
  addEventListener('keyup', e => { keys[e.code] = false; });
  addEventListener('blur', () => { for (const k in keys) keys[k] = false; });
  const key = (...codes) => codes.some(c => keys[c]);

  // ---------- Peintures ----------
  const PAINTS = [
    ['Rouge multicouche', 0x9a0a10], ['Blanc nacré', 0xe8e8e6], ['Noir intense', 0x07080a], ['Argent vif', 0x8f949b],
    ['Bleu outremer', 0x0f2a6b], ['Vert néon', 0x1f8a3c],
  ];
  let paintIdx = 0;
  function cyclePaint(i) { paintIdx = i !== undefined ? i : (paintIdx + 1) % PAINTS.length; model.setPaint(PAINTS[paintIdx][1]); if (i === undefined) toast(PAINTS[paintIdx][0]); renderPaintChips(); }

  // ---------- État de la voiture ----------
  const P = {
    G: 14, RIDE: 1.0, ACC: 18, VMAX: 88, BOOST_ACC: 30, VMAX_BOOST: 128, BRAKE: 32, REV_ACC: 11, VMAX_REV: 22,
    CLIMB_SPEED: 1, THRUST: 26, AIR_BOOST: 26, JUMP: 5.5, WB: 2.62, VMAX_ABS: 165,
  };
  const WHEELS_LOCAL = [[0.86, -1.32], [-0.86, -1.32], [0.87, 1.3], [-0.87, 1.3]];
  const SPHERES = [[0, 0.82, 0, 0.72], [0.42, 0.75, -1.38, 0.6], [-0.42, 0.75, -1.38, 0.6], [0.42, 0.75, 1.38, 0.6], [-0.42, 0.75, 1.38, 0.6]];
  const car = {
    pos: new V3(), vel: new V3(), quat: new Q(), angVel: new V3(),
    grounded: false, normal: new V3(0, 1, 0), detach: 0, steer: 0, fuel: 100, idle: 0, using: false,
    wheelDist: [1, 1, 1, 1], spin: 0, vF: 0, surface: 'SOL', spaceWas: false, stuckT: 0, airT: 0,
    rollAcc: 0, pitchAcc: 0, thrusting: false, boosting: false, accelLong: 0, accelLat: 0, lastVF: 0,
  };
  const vis = { posOff: new V3(), quatOff: new Q() };
  function respawn() {
    car.pos.copy(city.spawn.pos); car.vel.set(0, 0, 0); car.angVel.set(0, 0, 0);
    car.quat.setFromAxisAngle(new V3(0, 1, 0), city.spawn.yaw);
    car.grounded = false; car.detach = 0; car.fuel = 100; car.stuckT = 0;
    vis.posOff.set(0, 0, 0); vis.quatOff.identity();
    camInit = true;
  }

  // vecteurs temporaires
  const up = new V3(), fwd = new V3(), right = new V3(), tmp = new V3(), tmp2 = new V3(), nSum = new V3(), o = new V3(), down = new V3();
  const qa = new Q(), qb = new Q(), qi = new Q();
  const fT = new V3(), rT = new V3(), gv = new V3();
  const WORLD_UP = new V3(0, 1, 0);
  let msgSurface = '';

  function axes() {
    up.set(0, 1, 0).applyQuaternion(car.quat);
    fwd.set(0, 0, -1).applyQuaternion(car.quat);
    right.set(1, 0, 0).applyQuaternion(car.quat);
  }

  // Passage d'une surface à une autre (sol -> mur, mur -> plafond...)
  function transition(nOld, nNew, point, ahead) {
    const prevPos = car.pos.clone(), prevQuat = car.quat.clone();
    qa.setFromUnitVectors(nOld, nNew);
    car.quat.premultiply(qa).normalize();
    car.vel.applyQuaternion(qa);
    axes();
    car.pos.copy(point).addScaledVector(nNew, 0.02).addScaledVector(fwd, ahead);
    // recaler sur la surface réelle (utile sur les surfaces courbes)
    o.copy(car.pos).addScaledVector(nNew, 1.2);
    const h = raycast(o, tmp.copy(nNew).negate(), 2.4);
    if (h) car.pos.copy(h.point);
    // lissage visuel
    vis.posOff.add(prevPos.sub(car.pos));
    vis.quatOff.multiply(prevQuat.multiply(car.quat.clone().invert()));
    vis.quatOff.normalize();
  }

  function step(dt) {
    axes();
    car.detach = Math.max(0, car.detach - dt);
    const inThr = key('KeyW', 'ArrowUp') ? 1 : 0, inBrk = key('KeyS', 'ArrowDown') ? 1 : 0;
    const inL = key('KeyA', 'ArrowLeft') ? 1 : 0, inR = key('KeyD', 'ArrowRight') ? 1 : 0;
    const inRollL = key('KeyQ') ? 1 : 0, inRollR = key('KeyE') ? 1 : 0;
    const wantBoost = key('ShiftLeft', 'ShiftRight'), wantThrust = key('Space');

    // --- jauge ---
    const boosting = wantBoost && car.fuel > 0.5, thrusting = wantThrust && car.fuel > 0.5;
    car.boosting = boosting; car.thrusting = thrusting;
    if (boosting) car.fuel -= 20 * dt;
    if (thrusting) car.fuel -= 26 * dt;
    car.using = boosting || thrusting;
    if (car.using) car.idle = 0; else car.idle += dt;
    if (car.idle > 0.7) car.fuel += 17 * dt;
    car.fuel = clamp(car.fuel, 0, 100);
    if ((wantBoost || wantThrust) && car.fuel <= 0.5 && !car.emptyWarned) { toast('Jauge vide — elle se recharge'); car.emptyWarned = true; }
    if (car.fuel > 20) car.emptyWarned = false;

    // --- sondes des roues ---
    let hits = 0, dSum = 0; nSum.set(0, 0, 0);
    down.copy(up).negate();
    for (let i = 0; i < 4; i++) {
      const [wx, wz] = WHEELS_LOCAL[i];
      o.copy(car.pos).addScaledVector(right, wx).addScaledVector(fwd, -wz).addScaledVector(up, P.RIDE);
      const h = raycast(o, down, P.RIDE + 0.9);
      car.wheelDist[i] = h ? h.distance : P.RIDE + 0.9;
      if (h && h.distance < P.RIDE + 0.4) { hits++; dSum += h.distance; nSum.add(h.normal); }
      else if (h) nSum.addScaledVector(h.normal, 0.001);
    }
    // sonde centrale : garde le contact dans les courbes serrées (tunnel, half-pipe, looping)
    if (hits < 2 && car.grounded && car.detach <= 0 && !thrusting) {
      o.copy(car.pos).addScaledVector(up, P.RIDE);
      const h = raycast(o, down, P.RIDE + 1.1);
      if (h && h.normal.dot(up) > 0.45) { hits = 1; dSum = h.distance; nSum.copy(h.normal); }
    }
    let grounded = hits >= 1 && car.detach <= 0;
    // adhérence totale : murs et plafonds tiennent à toute vitesse, même à l'arrêt
    let n = car.normal;
    if (grounded) n.copy(nSum).normalize();

    // décollage (appui sur Espace au sol)
    if (thrusting && !car.spaceWas && grounded) {
      car.vel.addScaledVector(n, P.JUMP);
      car.detach = 0.3; grounded = false;
    }
    car.spaceWas = wantThrust;

    if (grounded) {
      const avgD = dSum / hits;
      if (!car.grounded) onLand();
      car.grounded = true; car.airT = 0;
      // alignement sur la surface
      qa.setFromUnitVectors(up, n);
      qi.identity().slerp(qa, Math.min(1, dt * 24));
      car.quat.premultiply(qi).normalize();
      axes();
      // suspension
      car.pos.addScaledVector(n, (P.RIDE - avgD) * Math.min(1, dt * 30));
      // gravité : réelle au sol ; sur murs et plafonds, la voiture est plaquée contre la surface sans glisser
      const floor = n.y > 0.55;
      if (floor) car.vel.y -= P.G * dt;
      else car.vel.addScaledVector(n, -8 * dt);
      let vn = car.vel.dot(n);
      if (vn < 3) { car.vel.addScaledVector(n, -vn); vn = 0; }
      fT.copy(fwd).addScaledVector(n, -fwd.dot(n)).normalize();
      rT.crossVectors(fT, n);
      let vF = car.vel.dot(fT), vR = car.vel.dot(rT);
      // moteur / freins
      if (inThr && !inBrk) {
        if (vF < -1) vF += P.BRAKE * dt;
        else if (vF < P.VMAX) vF += P.ACC * (1 - Math.max(0, vF) / P.VMAX * 0.85) * dt;
      } else if (inBrk && !inThr) {
        if (vF > 1) vF -= P.BRAKE * dt;
        else if (vF > -P.VMAX_REV) vF -= P.REV_ACC * dt;
      } else {
        const dec = (1.4 + 0.0005 * vF * vF) * dt;
        vF = Math.abs(vF) < dec ? 0 : vF - Math.sign(vF) * dec;
      }
      if (boosting) vF = Math.min(Math.max(vF, 0) + P.BOOST_ACC * dt, Math.max(vF, P.VMAX_BOOST));
      if (vF > P.VMAX && !boosting) vF -= (vF - P.VMAX) * 0.6 * dt;
      // adhérence latérale
      const grip = lerp(9, 4.5, clamp(Math.abs(vF) / 110, 0, 1));
      vR *= Math.exp(-grip * dt);
      car.vel.copy(fT).multiplyScalar(vF).addScaledVector(rT, vR).addScaledVector(n, vn);
      // direction (modèle bicyclette)
      const steerIn = inL - inR;
      const maxSteer = 0.58 / (1 + Math.abs(vF) / 9);
      car.steer = lerp(car.steer, steerIn * maxSteer, 1 - Math.exp(-dt * 10));
      const yawRate = vF * Math.tan(car.steer) / P.WB;
      qb.setFromAxisAngle(n, yawRate * dt);
      car.quat.premultiply(qb).normalize();
      car.vel.applyAxisAngle(n, yawRate * dt * 0.9);
      car.accelLong = (vF - car.lastVF) / dt; car.lastVF = vF;
      car.accelLat = vF * yawRate;
      car.vF = vF;
      axes();
      // passage sol -> mur, mur -> plafond, mur -> sol
      if (Math.abs(vF) > 1) {
        const dir = vF > 0 ? fT : tmp2.copy(fT).negate();
        o.copy(car.pos).addScaledVector(n, 0.55);
        const h = raycast(o, dir, 2.45 + Math.abs(vF) * dt * 2);
        if (h && h.normal.dot(n) < 0.5 && h.normal.dot(dir) < -0.3) {
          const toFloor = h.normal.y > 0.55;
          if (Math.abs(vF) > P.CLIMB_SPEED || toFloor) {
            const nOld = n.clone();
            transition(nOld, h.normal, h.point, vF > 0 ? 1.75 : -1.75);
            car.normal.copy(h.normal);
            const s = surfName(h.normal);
            if (s !== 'SOL') toast(s === 'MUR' ? 'Sur le mur !' : 'Au plafond !');
          }
        }
      }
    } else {
      // ---------- en l'air ----------
      if (car.grounded) car.airT = 0;
      car.grounded = false;
      car.airT += dt;
      car.vel.y -= P.G * dt;
      // rotations : Z/S tangage, Q/D lacet, A/E tonneau
      const tx = (inBrk - inThr) * 3.2, ty = (inL - inR) * 2.6, tz = (inRollL - inRollR) * 4.6;
      const k = 1 - Math.exp(-dt * 7);
      car.angVel.x = lerp(car.angVel.x, tx, k); car.angVel.y = lerp(car.angVel.y, ty, k); car.angVel.z = lerp(car.angVel.z, tz, k);
      const w = car.angVel.length();
      if (w > 1e-4) { qb.setFromAxisAngle(tmp.copy(car.angVel).divideScalar(w), w * dt); car.quat.multiply(qb).normalize(); }
      car.rollAcc += car.angVel.z * dt; car.pitchAcc += car.angVel.x * dt;
      car.steer = lerp(car.steer, 0, 1 - Math.exp(-dt * 5));
      if (boosting) car.vel.addScaledVector(fwd, P.AIR_BOOST * dt);
      // aide à l'atterrissage : on oriente doucement les roues vers la surface proche
      if (hits === 0 && nSum.lengthSq() > 0 && car.detach <= 0) {
        tmp.copy(nSum).normalize();
        if (up.dot(tmp) > 0.4 && car.vel.dot(tmp) < 0) {
          qa.setFromUnitVectors(up, tmp); qi.identity().slerp(qa, Math.min(1, dt * 3)); car.quat.premultiply(qi).normalize();
        }
      }
      car.vF = car.vel.dot(fwd);
      axes();
    }
    // poussée des propulseurs (axe du toit)
    if (thrusting) car.vel.addScaledVector(up, P.THRUST * dt);
    // traînée et vitesse max
    const sp = car.vel.length();
    car.vel.multiplyScalar(1 - Math.min(0.5, 0.00025 * sp * dt));
    if (sp > P.VMAX_ABS) car.vel.multiplyScalar(P.VMAX_ABS / sp);

    car.pos.addScaledVector(car.vel, dt);

    // --- collisions de la carrosserie (sphères) ---
    let contactN = null, impact = 0;
    for (const [sx, sy, sz, r] of SPHERES) {
      const c = tmp.copy(car.pos).addScaledVector(right, sx).addScaledVector(up, sy).addScaledVector(fwd, -sz);
      for (let it = 0; it < 2; it++) {
        const res = closest(c, r);
        if (!res) break;
        const d = res.distance;
        const nrm = tmp2.copy(c).sub(res.point);
        if (d < 1e-5) break;
        nrm.divideScalar(d);
        const push = r - d;
        car.pos.addScaledVector(nrm, push); c.addScaledVector(nrm, push);
        const vn = car.vel.dot(nrm);
        if (vn < 0) {
          impact = Math.max(impact, -vn);
          const bounce = !car.grounded && -vn > 8 ? 0.25 : 0.02;
          car.vel.addScaledVector(nrm, -vn * (1 + bounce));
          car.vel.multiplyScalar(1 - Math.min(0.5, dt * (car.grounded ? 0.6 : 2)));
        }
        contactN = (contactN || new V3()).copy(nrm);
      }
    }
    if (impact > 14) { shake = Math.min(1.2, shake + impact / 40); sfxImpact(impact); }

    // auto-redressement si la voiture est coincée sur le flanc / le toit
    if (!car.grounded && contactN && car.vel.length() < 4) {
      car.stuckT += dt;
      if (car.stuckT > 1.1) {
        car.stuckT = 0;
        const prevQ = car.quat.clone(), prevP = car.pos.clone();
        tmp.copy(fwd); tmp.y = 0; if (tmp.lengthSq() < 1e-3) tmp.set(0, 0, -1); tmp.normalize();
        car.quat.setFromRotationMatrix(new THREE.Matrix4().lookAt(new V3(), tmp.clone(), WORLD_UP));
        car.pos.y += 1.2; car.vel.set(0, 0, 0); car.angVel.set(0, 0, 0);
        vis.posOff.add(prevP.sub(car.pos)); vis.quatOff.multiply(prevQ.multiply(car.quat.clone().invert()));
        toast('Redressement');
      }
    } else car.stuckT = 0;

    if (car.pos.y < -40 || Math.abs(car.pos.x) > 4000 || Math.abs(car.pos.z) > 4000) { respawn(); toast('Retour au départ'); }

    car.surface = car.grounded ? surfName(car.normal) : 'VOL';
  }
  function surfName(n) { return n.y > 0.55 ? 'SOL' : n.y < -0.55 ? 'PLAFOND' : 'MUR'; }

  function onLand() {
    const rolls = Math.floor(Math.abs(car.rollAcc) / (Math.PI * 2) + 0.15);
    const flips = Math.floor(Math.abs(car.pitchAcc) / (Math.PI * 2) + 0.15);
    const parts = [];
    if (rolls > 0) parts.push(rolls > 1 ? `Tonneau x${rolls}` : 'Tonneau');
    if (flips > 0) parts.push(flips > 1 ? `Salto x${flips}` : 'Salto');
    if (parts.length) trick(parts.join(' + '));
    else if (car.airT > 2.5) trick(`Vol de ${car.airT.toFixed(1)} s`);
    car.rollAcc = 0; car.pitchAcc = 0;
  }

  // ---------- Trafic ----------
  const TRAFFIC_N = 46;
  const tBodyGeo = new RoundedBoxGeometry(1.86, 0.62, 4.4, 3, 0.18); tBodyGeo.translate(0, 0.62, 0);
  const tCabGeo = new RoundedBoxGeometry(1.62, 0.56, 2.3, 3, 0.22); tCabGeo.translate(0, 1.18, 0.25);
  const tWheelGeo = new THREE.CylinderGeometry(0.34, 0.34, 0.26, 14); tWheelGeo.rotateZ(Math.PI / 2);
  const tLightGeo = new THREE.BoxGeometry(1.5, 0.1, 0.06);
  const tBody = new THREE.InstancedMesh(tBodyGeo, new THREE.MeshStandardMaterial({ roughness: 0.35, metalness: 0.5 }), TRAFFIC_N);
  const tCab = new THREE.InstancedMesh(tCabGeo, new THREE.MeshStandardMaterial({ color: 0x14181e, roughness: 0.1, metalness: 0.6 }), TRAFFIC_N);
  const tWheel = new THREE.InstancedMesh(tWheelGeo, new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.9 }), TRAFFIC_N * 4);
  const tHead = new THREE.InstancedMesh(tLightGeo, new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xfff2d6, emissiveIntensity: 1 }), TRAFFIC_N);
  const tTail = new THREE.InstancedMesh(tLightGeo, new THREE.MeshStandardMaterial({ color: 0x330000, emissive: 0xff2020, emissiveIntensity: 1 }), TRAFFIC_N);
  for (const m of [tBody, tCab, tWheel]) { m.castShadow = true; m.receiveShadow = true; }
  for (const m of [tBody, tCab, tWheel, tHead, tTail]) { m.frustumCulled = false; scene.add(m); }
  const TCOLS = [0xd9d9d9, 0x1b1b1d, 0x7d8085, 0x2a4f8a, 0x9b1d20, 0xc9b27c, 0x2f5d3a, 0xe2e2df, 0x4b4f55, 0x0d2440];
  const DIRS = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  const traffic = [];
  const NN = city.N;
  function nodeP(i, j, out) { return out.set(city.roadC(i), 0, city.roadC(j)); }
  function pickDir(i, j, d) {
    const opts = DIRS.filter(([dx, dz]) => !(dx === -d[0] && dz === -d[1]) && i + dx >= 0 && i + dx <= NN && j + dz >= 0 && j + dz <= NN);
    const straight = opts.find(([dx, dz]) => dx === d[0] && dz === d[1]);
    if (straight && Math.random() < 0.55) return straight;
    return opts[Math.random() * opts.length | 0] || [-d[0], -d[1]];
  }
  const rightOf = (d) => [-d[1], d[0]];
  function makePath(t) {
    // segment droit de l'intersection (i,j) vers (i+d)
    const A = nodeP(t.i, t.j, new V3()), B = nodeP(t.i + t.d[0], t.j + t.d[1], new V3());
    const r = rightOf(t.d);
    // droite : facing -Z => droite = +X ; rightOf([0,-1]) = [1,0]
    const off = new V3(r[0] * t.lane, 0, r[1] * t.lane), dv = new V3(t.d[0], 0, t.d[1]);
    t.p0 = A.clone().addScaledVector(dv, 12).add(off);
    t.p1 = B.clone().addScaledVector(dv, -12).add(off);
    t.type = 'line'; t.len = t.p0.distanceTo(t.p1); t.s = 0;
  }
  function makeTurn(t) {
    const B = nodeP(t.i + t.d[0], t.j + t.d[1], new V3());
    const d2 = pickDir(t.i + t.d[0], t.j + t.d[1], t.d);
    const r = rightOf(t.d), r2 = rightOf(d2);
    const P0 = B.clone().addScaledVector(new V3(t.d[0], 0, t.d[1]), -12).add(new V3(r[0] * t.lane, 0, r[1] * t.lane));
    const P2 = B.clone().addScaledVector(new V3(d2[0], 0, d2[1]), 12).add(new V3(r2[0] * t.lane, 0, r2[1] * t.lane));
    let P1;
    if (d2[0] === t.d[0] && d2[1] === t.d[1]) P1 = P0.clone().add(P2).multiplyScalar(0.5);
    else P1 = B.clone().add(new V3((r[0] + r2[0]) * t.lane, 0, (r[1] + r2[1]) * t.lane));
    t.p0 = P0; t.pc = P1; t.p1 = P2; t.type = 'turn'; t.s = 0;
    let L = 0, prev = P0.clone();
    for (let k = 1; k <= 10; k++) { const p = bez(P0, P1, P2, k / 10, new V3()); L += p.distanceTo(prev); prev = p; }
    t.len = L;
    t.i += t.d[0]; t.j += t.d[1]; t.d = d2;
  }
  function bez(a, b, c, u, out) { const v = 1 - u; return out.set(v * v * a.x + 2 * v * u * b.x + u * u * c.x, 0, v * v * a.z + 2 * v * u * b.z + u * u * c.z); }
  function spawnTraffic(t, far) {
    for (let tries = 0; tries < 30; tries++) {
      t.i = Math.random() * (NN + 1) | 0; t.j = Math.random() * (NN + 1) | 0;
      const opts = DIRS.filter(([dx, dz]) => t.i + dx >= 0 && t.i + dx <= NN && t.j + dz >= 0 && t.j + dz <= NN);
      t.d = opts[Math.random() * opts.length | 0];
      if (!far) break;
      const p = nodeP(t.i, t.j, new V3());
      if (p.distanceTo(car.pos) > 160) break;
    }
    t.lane = Math.random() < 0.5 ? 2.4 : 6.8;
    t.vmax = 11 + Math.random() * 7; t.speed = t.vmax;
    t.state = 'drive';
    makePath(t);
    t.s = Math.random() * t.len * (far ? 0.5 : 1);
  }
  for (let k = 0; k < TRAFFIC_N; k++) {
    const t = { pos: new V3(), quat: new Q(), vel: new V3(), ang: new V3(), timer: 0, col: TCOLS[k % TCOLS.length] };
    spawnTraffic(t, false);
    tBody.setColorAt(k, new THREE.Color(t.col));
    traffic.push(t);
  }
  tBody.instanceColor.needsUpdate = true;
  const _m = new THREE.Matrix4(), _mo = new THREE.Matrix4(), _tp = new V3(), _tq = new Q(), _one = new V3(1, 1, 1);
  const WHEEL_OFF = [[0.85, 0.34, -1.4], [-0.85, 0.34, -1.4], [0.85, 0.34, 1.4], [-0.85, 0.34, 1.4]];
  function updateTraffic(dt) {
    for (let k = 0; k < traffic.length; k++) {
      const t = traffic[k];
      if (t.state === 'drive') {
        // ralentir derrière un véhicule
        let target = t.vmax;
        for (const u of traffic) {
          if (u === t || u.state !== 'drive') continue;
          const dx = u.pos.x - t.pos.x, dz = u.pos.z - t.pos.z, dd = dx * dx + dz * dz;
          if (dd < 196) { const tx = -Math.sin(t.yaw), tz = -Math.cos(t.yaw); if (dx * tx + dz * tz > 2 && Math.abs(dx * tz - dz * tx) < 2) target = Math.min(target, u.speed * 0.8); }
        }
        const pd = car.pos.distanceTo(t.pos);
        if (pd < 14) { const tx = -Math.sin(t.yaw), tz = -Math.cos(t.yaw); if ((car.pos.x - t.pos.x) * tx + (car.pos.z - t.pos.z) * tz > 1) target = 0; }
        t.speed = lerp(t.speed, target, 1 - Math.exp(-dt * 2));
        t.s += t.speed * dt;
        while (t.s >= t.len) {
          const over = t.s - t.len;
          if (t.type === 'line') makeTurn(t); else makePath(t);
          t.s = over;
        }
        const u = t.s / t.len;
        let tx, tz;
        if (t.type === 'line') { t.pos.lerpVectors(t.p0, t.p1, u); tx = t.p1.x - t.p0.x; tz = t.p1.z - t.p0.z; }
        else {
          bez(t.p0, t.pc, t.p1, u, t.pos);
          tx = 2 * (1 - u) * (t.pc.x - t.p0.x) + 2 * u * (t.p1.x - t.pc.x); tz = 2 * (1 - u) * (t.pc.z - t.p0.z) + 2 * u * (t.p1.z - t.pc.z);
        }
        t.pos.y = 0;
        t.yaw = Math.atan2(-tx, -tz);
        t.quat.setFromAxisAngle(WORLD_UP, t.yaw);
        const l = Math.hypot(tx, tz) || 1;
        t.vel.set(tx / l * t.speed, 0, tz / l * t.speed);
      } else {
        // voiture percutée : chute libre
        t.timer -= dt;
        t.vel.y -= P.G * dt;
        t.pos.addScaledVector(t.vel, dt);
        const w = t.ang.length();
        if (w > 1e-4) { qb.setFromAxisAngle(tmp.copy(t.ang).divideScalar(w), w * dt); t.quat.premultiply(qb); }
        const c = tmp.copy(t.pos); c.y += 0.8;
        const res = closest(c, 1.3);
        if (res) {
          const nrm = tmp2.copy(c).sub(res.point); const d = nrm.length();
          if (d > 1e-4) {
            nrm.divideScalar(d); t.pos.addScaledVector(nrm, 1.3 - d);
            const vn = t.vel.dot(nrm);
            if (vn < 0) { t.vel.addScaledVector(nrm, -vn * 1.35); t.vel.multiplyScalar(0.8); t.ang.multiplyScalar(0.7); }
          }
        }
        if (t.timer <= 0) spawnTraffic(t, true);
      }
      // matrices d'instance
      _m.compose(t.pos, t.quat, _one);
      tBody.setMatrixAt(k, _m); tCab.setMatrixAt(k, _m);
      for (let w = 0; w < 4; w++) { _mo.makeTranslation(...WHEEL_OFF[w]); tWheel.setMatrixAt(k * 4 + w, _tmpMul(_m, _mo)); }
      _mo.makeTranslation(0, 0.66, -2.2); tHead.setMatrixAt(k, _tmpMul(_m, _mo));
      _mo.makeTranslation(0, 0.72, 2.2); tTail.setMatrixAt(k, _tmpMul(_m, _mo));
    }
    for (const m of [tBody, tCab, tWheel, tHead, tTail]) m.instanceMatrix.needsUpdate = true;
  }
  const _mm = new THREE.Matrix4();
  function _tmpMul(a, b) { return _mm.multiplyMatrices(a, b); }
  function collideTraffic() {
    const pc = tmp.copy(car.pos).addScaledVector(up, 0.7);
    for (const t of traffic) {
      const tc = tmp2.copy(t.pos); tc.y += 0.7;
      const d = pc.distanceTo(tc);
      if (d > 3.3 || d < 1e-3) continue;
      const nrm = new V3().subVectors(pc, tc).divideScalar(d);
      const rel = new V3().subVectors(car.vel, t.vel);
      const closing = -rel.dot(nrm);
      if (t.state === 'drive' && rel.length() > 9) {
        t.state = 'knocked'; t.timer = 7;
        t.vel.copy(car.vel).multiplyScalar(0.75).addScaledVector(nrm, -6); t.vel.y += 4 + rel.length() * 0.18;
        t.ang.set((Math.random() - 0.5) * 8, (Math.random() - 0.5) * 6, (Math.random() - 0.5) * 8);
        car.vel.multiplyScalar(0.86);
        shake = Math.min(1.2, shake + 0.5); sfxImpact(rel.length());
      } else if (closing > 0) {
        car.vel.addScaledVector(nrm, closing);
      }
      car.pos.addScaledVector(nrm, Math.max(0, 3.3 - d) * 0.5);
    }
  }

  // ---------- Particules des propulseurs ----------
  const PMAX = 900;
  const pGeo = new THREE.BufferGeometry();
  const pPos = new Float32Array(PMAX * 3), pCol = new Float32Array(PMAX * 3), pSize = new Float32Array(PMAX);
  pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
  pGeo.setAttribute('color', new THREE.BufferAttribute(pCol, 3));
  pGeo.setAttribute('size', new THREE.BufferAttribute(pSize, 1));
  const pMat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, vertexColors: true,
    vertexShader: `
      attribute float size; varying vec3 vC;
      void main(){ vC = color; vec4 mv = modelViewMatrix * vec4(position,1.0); gl_PointSize = size * 300.0 / -mv.z; gl_Position = projectionMatrix * mv; }`,
    fragmentShader: `
      varying vec3 vC;
      void main(){
      vec2 d = gl_PointCoord - 0.5; float a = smoothstep(0.5, 0.0, length(d)); gl_FragColor = vec4(vC * a, 1.0); }`,
  });
  const pts = new THREE.Points(pGeo, pMat); pts.frustumCulled = false; scene.add(pts);
  const parts = Array.from({ length: PMAX }, () => ({ p: new V3(), v: new V3(), life: 0, max: 1, c: new THREE.Color(), s: 1 }));
  let pHead = 0;
  function emit(pos, vel, life, col, size) {
    const q = parts[pHead]; pHead = (pHead + 1) % PMAX;
    q.p.copy(pos); q.v.copy(vel); q.life = q.max = life; q.c.copy(col); q.s = size;
  }
  const C_BOOST = new THREE.Color(0.55, 0.85, 1.6), C_THR = new THREE.Color(0.7, 0.9, 1.4), C_HOT = new THREE.Color(1.6, 0.9, 0.5);
  function updateParticles(dt) {
    for (let i = 0; i < PMAX; i++) {
      const q = parts[i];
      if (q.life > 0) {
        q.life -= dt; q.p.addScaledVector(q.v, dt); q.v.multiplyScalar(1 - dt * 2.5);
        const f = Math.max(0, q.life / q.max);
        pPos[i * 3] = q.p.x; pPos[i * 3 + 1] = q.p.y; pPos[i * 3 + 2] = q.p.z;
        pCol[i * 3] = q.c.r * f; pCol[i * 3 + 1] = q.c.g * f; pCol[i * 3 + 2] = q.c.b * f;
        pSize[i] = q.s * (1.4 - f * 0.6);
      } else { pSize[i] = 0; }
    }
    pGeo.attributes.position.needsUpdate = true; pGeo.attributes.color.needsUpdate = true; pGeo.attributes.size.needsUpdate = true;
  }

  // ---------- Audio (synthétisé) ----------
  let ac = null, au = null, muted = false;
  function initAudio() {
    if (ac) { ac.resume(); return; }
    try {
      ac = new (window.AudioContext || window.webkitAudioContext)();
      const master = ac.createGain(); master.gain.value = 0.55; master.connect(ac.destination);
      const noiseBuf = ac.createBuffer(1, ac.sampleRate * 2, ac.sampleRate);
      const nd = noiseBuf.getChannelData(0); for (let i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1;
      const mkNoise = () => { const s = ac.createBufferSource(); s.buffer = noiseBuf; s.loop = true; s.start(); return s; };
      // moteur électrique : sifflement + bourdonnement
      const o1 = ac.createOscillator(); o1.type = 'triangle';
      const o2 = ac.createOscillator(); o2.type = 'sine';
      const o3 = ac.createOscillator(); o3.type = 'sawtooth';
      const lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 1800; lp.Q.value = 3;
      const eg = ac.createGain(); eg.gain.value = 0;
      const hg = ac.createGain(); hg.gain.value = 0.25;
      o1.connect(lp); o2.connect(lp); o3.connect(hg); hg.connect(lp); lp.connect(eg); eg.connect(master);
      o1.start(); o2.start(); o3.start();
      // propulseurs
      const n1 = mkNoise(); const bp = ac.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 700; bp.Q.value = 0.7;
      const bg = ac.createGain(); bg.gain.value = 0; n1.connect(bp); bp.connect(bg); bg.connect(master);
      // vent
      const n2 = mkNoise(); const wl = ac.createBiquadFilter(); wl.type = 'lowpass'; wl.frequency.value = 500;
      const wg = ac.createGain(); wg.gain.value = 0; n2.connect(wl); wl.connect(wg); wg.connect(master);
      au = { master, o1, o2, o3, lp, eg, bp, bg, wl, wg };
    } catch (e) { ac = null; }
  }
  function updateAudio() {
    if (!au) return;
    const t = ac.currentTime, sp = car.vel.length();
    au.master.gain.setTargetAtTime(muted || menuOpen ? 0 : 0.55, t, 0.05);
    const thr = key('KeyW', 'ArrowUp') && car.grounded ? 1 : 0;
    au.o1.frequency.setTargetAtTime(140 + Math.abs(car.vF) * 16, t, 0.05);
    au.o2.frequency.setTargetAtTime(70 + Math.abs(car.vF) * 8, t, 0.05);
    au.o3.frequency.setTargetAtTime(40 + Math.abs(car.vF) * 3, t, 0.05);
    au.lp.frequency.setTargetAtTime(900 + Math.abs(car.vF) * 30 + thr * 800, t, 0.05);
    au.eg.gain.setTargetAtTime(0.025 + Math.min(0.09, Math.abs(car.vF) * 0.0012) + thr * 0.04, t, 0.08);
    const b = (car.boosting ? 0.32 : 0) + (car.thrusting ? 0.38 : 0);
    au.bg.gain.setTargetAtTime(b, t, 0.04);
    au.bp.frequency.setTargetAtTime(car.thrusting ? 420 : 900, t, 0.1);
    au.wg.gain.setTargetAtTime(Math.min(0.22, sp * sp * 0.000018), t, 0.2);
    au.wl.frequency.setTargetAtTime(300 + sp * 8, t, 0.2);
  }
  function sfxImpact(v) {
    if (!ac || muted) return;
    const t = ac.currentTime;
    const o = ac.createOscillator(); o.type = 'sine'; o.frequency.setValueAtTime(90, t); o.frequency.exponentialRampToValueAtTime(35, t + 0.3);
    const g = ac.createGain(); g.gain.setValueAtTime(Math.min(0.8, v / 50), t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
    o.connect(g); g.connect(au.master); o.start(t); o.stop(t + 0.4);
  }

  // ---------- Jour / nuit ----------
  let timeOfDay = 17.6, timeScale = 1 / 20; // 1 h de jeu = 20 s
  let lightsForced = false, nightF = 0;
  const sunDir = new V3();
  const C = (h) => new THREE.Color(h);
  const FOG_DAY = C(0xb9cde0), FOG_SET = C(0xd49a72), FOG_NIGHT = C(0x0b1222);
  const fmtTime = (h) => `${String(Math.floor(h)).padStart(2, '0')}:${String(Math.floor((h % 1) * 60)).padStart(2, '0')}`;
  function updateDayNight(dt) {
    timeOfDay = (timeOfDay + dt * timeScale * (key('KeyT') ? 40 : 1)) % 24;
    const ph = (timeOfDay / 24) * Math.PI * 2 - Math.PI / 2;
    sunDir.set(Math.cos(ph) * 0.8, Math.sin(ph), 0.45).normalize();
    const el = sunDir.y;
    const day = sstep(-0.06, 0.25, el);
    nightF = 1 - sstep(-0.12, 0.08, el);
    const golden = sstep(0.35, 0.02, el) * sstep(-0.1, 0.02, el);
    skyU.sunPosition.value.copy(sunDir);
    skyU.rayleigh.value = lerp(1.4, 3.2, golden);
    if (el > -0.04) {
      sun.color.setRGB(1, lerp(0.95, 0.62, golden), lerp(0.9, 0.42, golden));
      sun.intensity = 3.2 * day + 0.4 * golden;
      tmp.copy(sunDir);
    } else {
      sun.color.setRGB(0.55, 0.65, 1.0);
      sun.intensity = 0.35;
      tmp.set(-sunDir.x, -sunDir.y, sunDir.z).normalize();
    }
    sun.target.position.copy(car.pos);
    sun.position.copy(car.pos).addScaledVector(tmp, 600);
    hemi.intensity = 0.35 + 1.5 * day;
    hemi.color.setRGB(lerp(0.25, 0.75, day), lerp(0.32, 0.85, day), lerp(0.55, 1, day));
    scene.environmentIntensity = 0.12 + 0.7 * day;
    const fc = new THREE.Color().copy(FOG_NIGHT).lerp(FOG_DAY, day).lerp(FOG_SET, golden * 0.7);
    scene.fog.color.copy(fc);
    scene.fog.far = lerp(1600, 2800, day);
    renderer.toneMappingExposure = lerp(0.85, 0.74, day);
    stars.material.opacity = nightF;
    // éclairages urbains
    const N = city.night;
    for (const m of N.facadeMats) m.emissiveIntensity = nightF * 0.55 + 0.02;
    N.lampHeadMat.emissiveIntensity = nightF * 6;
    N.poolMat.opacity = nightF * 0.75;
    N.pools.visible = nightF > 0.02;
    stars.visible = nightF > 0.02;
    for (const m of N.neonMats) m.emissiveIntensity = 1.2 + nightF * 3;
    N.aviationMat.emissiveIntensity = (Math.sin(performance.now() / 300) > 0.2 ? 3 : 0.2) * (0.3 + nightF);
    const lightsOn = lightsForced || nightF > 0.25;
    for (const sl of model.headLights) sl.intensity = lightsOn ? 900 : 0;
    model.materials.head.emissiveIntensity = lightsOn ? 4 : 1.6;
    model.materials.tail.emissiveIntensity = (key('KeyS', 'ArrowDown') && car.vF > 1 ? 5 : lightsOn ? 2.2 : 1.2);
    tHead.material.emissiveIntensity = lightsOn ? 3 : 0.4;
    tTail.material.emissiveIntensity = lightsOn ? 2.4 : 0.6;
    bloom.strength = lerp(0.55, 0.3, day);
    $('clock').textContent = fmtTime(timeOfDay);
    $('clockicon').textContent = nightF > 0.5 ? '🌙' : golden > 0.4 ? '🌇' : '☀️';
  }

  // ---------- Caméra ----------
  let camMode = 0, camInit = true, shake = 0;
  const camPos = new V3(), camUp = new V3(0, 1, 0), camLook = new V3();
  const visPos = new V3(), visQuat = new Q(), visUp = new V3(), visFwd = new V3();
  function updateCamera(dt) {
    visUp.set(0, 1, 0).applyQuaternion(visQuat); visFwd.set(0, 0, -1).applyQuaternion(visQuat);
    const sp = car.vel.length();
    const near = camMode === 2 ? 0.08 : 0.25;
    if (camera.near !== near) { camera.near = near; camera.updateProjectionMatrix(); }
    if (camMode === 2) {
      camera.position.copy(model.cockpitCam).applyQuaternion(visQuat).add(visPos);
      camera.up.copy(visUp);
      camera.lookAt(tmp.copy(camera.position).addScaledVector(visFwd, 10).addScaledVector(visUp, -0.6));
      camUp.copy(visUp); camPos.copy(camera.position);
    } else {
      const dist = camMode === 0 ? 7.2 : 13, hgt = camMode === 0 ? 2.3 : 4.2;
      if (camInit) { camUp.copy(visUp); }
      camUp.lerp(visUp, 1 - Math.exp(-dt * (car.grounded ? 5 : 2.5))).normalize();
      const desired = tmp.copy(visPos).addScaledVector(visFwd, -dist - Math.min(3, sp * 0.02)).addScaledVector(camUp, hgt);
      if (camInit) { camPos.copy(desired); camInit = false; }
      camPos.lerp(desired, 1 - Math.exp(-dt * 9));
      // la caméra ne traverse pas les murs
      const tgt = tmp2.copy(visPos).addScaledVector(camUp, 1.3);
      const dir = new V3().subVectors(camPos, tgt); const len = dir.length();
      if (len > 0.01) {
        dir.divideScalar(len);
        const h = raycast(tgt, dir, len);
        camera.position.copy(h ? tgt.clone().addScaledVector(dir, Math.max(0.6, h.distance - 0.4)) : camPos);
      }
      camera.up.copy(camUp);
      camLook.copy(visPos).addScaledVector(camUp, 1.1).addScaledVector(visFwd, 3);
      camera.lookAt(camLook);
    }
    if (shake > 0) {
      camera.position.add(tmp.set((Math.random() - 0.5), (Math.random() - 0.5), (Math.random() - 0.5)).multiplyScalar(shake * 0.35));
      shake = Math.max(0, shake - dt * 2.2);
    }
    if (car.boosting || car.thrusting) camera.position.add(tmp.set(Math.random() - 0.5, Math.random() - 0.5, 0).multiplyScalar(0.04));
    const fovT = 62 + Math.min(26, sp * 0.16) + (car.boosting ? 7 : 0);
    camera.fov = lerp(camera.fov, camMode === 2 ? fovT + 6 : fovT, 1 - Math.exp(-dt * 4));
    camera.updateProjectionMatrix();
  }

  // ---------- Visuels de la voiture ----------
  const _wp = new V3();
  function updateVisuals(dt) {
    vis.posOff.multiplyScalar(Math.exp(-dt * 9));
    vis.quatOff.slerp(qi.identity(), 1 - Math.exp(-dt * 10));
    visPos.copy(car.pos).add(vis.posOff);
    visQuat.copy(vis.quatOff).multiply(car.quat);
    model.root.position.copy(visPos);
    model.root.quaternion.copy(visQuat);
    // roulis / tangage de caisse
    const lat = clamp(car.accelLat, -40, 40), lon = clamp(car.accelLong, -40, 40);
    model.body.rotation.z = lerp(model.body.rotation.z, car.grounded ? lat * 0.0022 : 0, 1 - Math.exp(-dt * 6));
    model.body.rotation.x = lerp(model.body.rotation.x, car.grounded ? lon * 0.0016 : 0, 1 - Math.exp(-dt * 6));
    // roues
    car.spin += car.vF * dt;
    model.wheels.forEach((w, i) => {
      const comp = car.grounded ? clamp(P.RIDE - car.wheelDist[i], -0.12, 0.14) : -0.08;
      w.mount.position.y = lerp(w.mount.position.y, w.baseY + comp, 1 - Math.exp(-dt * 25));
      w.spin.rotation.x = -car.spin / w.r;
      if (w.front) w.steer.rotation.y = car.steer * 1.2;
    });
    model.yoke.rotation.z = car.steer * 3;
    // panaches
    const bp = car.boosting ? 1 : 0, tp = car.thrusting ? 1 : 0;
    for (const pl of model.plumes.rear) { pl.material.opacity = lerp(pl.material.opacity, bp * 0.8, 1 - Math.exp(-dt * 20)); pl.scale.set(1, 0.6 + Math.random() * 0.5, 1); pl.visible = pl.material.opacity > 0.01; }
    for (const pl of model.plumes.bottom) { pl.material.opacity = lerp(pl.material.opacity, tp * 0.75, 1 - Math.exp(-dt * 20)); pl.scale.set(1, 0.6 + Math.random() * 0.5, 1); pl.visible = pl.material.opacity > 0.01; }
    model.materials.nozzleGlow.emissiveIntensity = 0.2 + (bp + tp) * 5;
    if (!paused) {
      if (bp) for (const nz of model.nozzles) for (let k = 0; k < 3; k++) {
        _wp.copy(nz).applyQuaternion(visQuat).add(visPos);
        const v = new V3(0, 0, 1).applyQuaternion(visQuat).multiplyScalar(14 + Math.random() * 8).add(car.vel).add(new V3((Math.random() - 0.5) * 2, (Math.random() - 0.5) * 2, (Math.random() - 0.5) * 2));
        emit(_wp, v, 0.25 + Math.random() * 0.2, Math.random() < 0.3 ? C_HOT : C_BOOST, 0.35);
      }
      if (tp) for (const nz of model.bottomNozzles) for (let k = 0; k < 2; k++) {
        _wp.copy(nz).applyQuaternion(visQuat).add(visPos);
        const v = new V3(0, -1, 0).applyQuaternion(visQuat).multiplyScalar(12 + Math.random() * 6).add(car.vel).add(new V3((Math.random() - 0.5) * 3, (Math.random() - 0.5) * 3, (Math.random() - 0.5) * 3));
        emit(_wp, v, 0.3 + Math.random() * 0.25, C_THR, 0.4);
      }
    }
  }

  // ---------- Interface ----------
  const hud = window.createHUD();
  let toastT = 0, trickT = 0;
  function toast(t) { const el = $('msg'); el.textContent = t; el.classList.add('on'); toastT = 2.2; }
  function trick(t) { const el = $('trick'); el.textContent = t; el.classList.remove('on'); void el.offsetWidth; el.classList.add('on'); trickT = 2.5; }
  let hudT = 0;
  function updateHUD(dt) {
    hudT += dt;
    const kmh = car.vel.length() * 3.6;
    hud.speedo(kmh, car.boosting, car.surface, car.pos.y, dt);
    hud.tank(car.fuel, car.using, !car.using && car.idle > 0.7 && car.fuel < 100, car.accelLong, hudT, dt);
    tmp.set(0, 0, -1).applyQuaternion(car.quat);
    const heading = Math.atan2(tmp.x, -tmp.z);
    hud.minimap(city.mapCanvas, city.MAP, car.pos.x, car.pos.z, heading, traffic.map(t => t.pos));
    if (toastT > 0) { toastT -= dt; if (toastT <= 0) $('msg').classList.remove('on'); }
    if (trickT > 0) { trickT -= dt; if (trickT <= 0) $('trick').classList.remove('on'); }
  }

  // ---------- Menu ----------
  let menuOpen = true, paused = true, started = false;
  function renderPaintChips() {
    const box = $('paints'); box.innerHTML = '';
    PAINTS.forEach(([name, hex], i) => {
      const b = document.createElement('button');
      b.className = 'chip' + (i === paintIdx ? ' on' : '');
      b.style.setProperty('--c', '#' + hex.toString(16).padStart(6, '0'));
      b.setAttribute('aria-label', name); b.title = name;
      b.onclick = () => cyclePaint(i);
      box.appendChild(b);
    });
    $('paintname').textContent = PAINTS[paintIdx][0];
  }
  function applyQuality() {
    const sz = hiQ ? 2048 : 1024;
    if (sun.shadow.mapSize.x !== sz) { sun.shadow.mapSize.set(sz, sz); if (sun.shadow.map) { sun.shadow.map.dispose(); sun.shadow.map = null; } }
    pixelRatio = maxPR(); resScale = 1;
    renderer.setPixelRatio(pixelRatio); composer.setPixelRatio(pixelRatio);
    onResize();
    $('qbtn').textContent = hiQ ? 'Qualité : haute' : 'Qualité : performance';
  }
  function openMenu(pause) {
    menuOpen = true; paused = true;
    $('menu').classList.remove('hide');
    $('go').textContent = started ? 'Reprendre' : 'Démarrer';
  }
  function startGame() {
    initAudio();
    menuOpen = false; paused = false;
    if (!started) { started = true; respawn(); }
    $('menu').classList.add('hide');
  }
  $('go').onclick = startGame;
  $('qbtn').onclick = () => { hiQ = !hiQ; applyQuality(); };
  renderPaintChips();
  $('qbtn').textContent = hiQ ? 'Qualité : haute' : 'Qualité : performance';

  function onResize() {
    const w = Math.max(1, innerWidth), h = Math.max(1, innerHeight);
    camera.aspect = w / h; camera.updateProjectionMatrix();
    renderer.setSize(w, h); composer.setSize(w, h);
  }
  addEventListener('resize', onResize);

  // ---------- Boucle ----------
  respawn();
  updateDayNight(0);
  updateVisuals(0);
  let last = performance.now(), acc = 0;
  const H = 1 / 120;
  function frame(now) {
    requestAnimationFrame(frame);
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    if (!paused) {
      acc += dt;
      let n = 0;
      while (acc >= H && n < 8) { step(H); acc -= H; n++; }
      if (n === 8) acc = 0;
      updateTraffic(dt);
      collideTraffic();
      updateDayNight(dt);
    } else if (!started) {
      // vue de présentation qui tourne autour de la voiture
      const a = now / 6000;
      updateTraffic(dt);
      updateDayNight(0);
    }
    updateVisuals(dt);
    updateParticles(paused ? 0 : dt);
    if (!started) {
      const a = now / 7000;
      camera.position.set(visPos.x + Math.sin(a) * 8, visPos.y + 2.2, visPos.z + Math.cos(a) * 8);
      camera.up.set(0, 1, 0); camera.lookAt(visPos.x, visPos.y + 0.6, visPos.z);
      camera.fov = 50; camera.updateProjectionMatrix();
    } else updateCamera(dt);
    updateHUD(dt);
    updateAudio();
    if (innerWidth < 2 || innerHeight < 2) return; // fenêtre réduite : rien à dessiner
    if (hiQ) composer.render(); else renderer.render(scene, camera);
    adaptResolution(dt);
  }
  // Résolution dynamique : vise ~50 images/s sur les petites cartes graphiques
  let resScale = 1, frameAvg = 16, resT = 0;
  function adaptResolution(dt) {
    if (paused || document.hidden) return;
    frameAvg = lerp(frameAvg, dt * 1000, 0.05);
    resT += dt;
    if (resT < 1.2) return;
    resT = 0;
    let ns = resScale;
    if (frameAvg > 22 && resScale > 0.55) ns = Math.max(0.55, resScale - 0.1);
    else if (frameAvg < 14 && resScale < 1) ns = Math.min(1, resScale + 0.05);
    if (ns !== resScale) { resScale = ns; const pr = maxPR() * resScale; renderer.setPixelRatio(pr); composer.setPixelRatio(pr); onResize(); }
  }
  $('loading').classList.add('hide');
  requestAnimationFrame(frame);
  window.__sim = { car, camera, scene, renderer, city, model, traffic, P, setTime: h => { timeOfDay = h; }, step, snapCam: () => { camInit = true; } };
})().catch(err => {
  console.error(err);
  const el = document.getElementById('loadmsg');
  if (el) el.textContent = 'Erreur : ' + (err && err.message ? err.message : err) + ' — vérifiez la connexion internet (Three.js est chargé depuis un CDN) et que WebGL est activé.';
});
