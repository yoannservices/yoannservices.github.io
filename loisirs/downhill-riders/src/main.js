/* Downhill Riders : boucle principale, scène, états (menu / descente / pause / résultats). */
import * as THREE from 'three';
import { FIXED_DT, diffById } from './core/config.js';
import { clamp, lerp } from './core/rng.js';
import { Input } from './core/input.js';
import { save, persist } from './core/save.js';
import { Track } from './world/TrackGenerator.js';
import { BIOMES } from './world/Biomes.js';
import { Chunks } from './world/Chunks.js';
import { buildStructures } from './world/Terrain.js';
import { buildObstacleMeshes } from './world/Vegetation.js';
import { skyTex } from './world/textures.js';
import { BIKES, find } from './bike/parts.js';
import { Bike } from './bike/BikePhysics.js';
import { BikeModel } from './bike/BikeModel.js';
import { RiderModel } from './rider/RiderModel.js';
import { Ragdoll } from './rider/Ragdoll.js';
import { predictLanding } from './rider/Landing.js';
import { Tricks } from './gameplay/Tricks.js';
import { Score } from './gameplay/Score.js';
import { Run } from './gameplay/Run.js';
import { Checkpoints } from './gameplay/Checkpoints.js';
import { makeObjectives, checkObjectives } from './gameplay/Objectives.js';
import { runReward, applyReward } from './gameplay/Progression.js';
import { CameraRig, CAM_MODES } from './camera/CameraRig.js';
import { Fx } from './fx/RadialBlur.js';
import { Sfx } from './audio/Audio.js';
import { Hud } from './ui/Hud.js';
import { Menu } from './ui/Menu.js';

const canvas = document.getElementById('gl');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.5));
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1;
const scene = new THREE.Scene(), camera = new THREE.PerspectiveCamera(62, 1, 0.1, 700);
const rig = new CameraRig(camera, canvas), fx = new Fx(renderer, scene, camera), sfx = new Sfx(), hud = new Hud();
fx.enabled = save.settings.blur; sfx.vol = save.settings.volume;

const hemi = new THREE.HemisphereLight(0xffffff, 0x445533, 0.9), sun = new THREE.DirectionalLight(0xffffff, 1.7);
sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); const sc = sun.shadow.camera; sc.left = -28; sc.right = 28; sc.top = 28; sc.bottom = -28; sc.near = 1; sc.far = 120; sun.shadow.bias = -0.0004;
scene.add(hemi, sun, sun.target);

/* ───────── ambiance d'un biome ───────── */
function setBiome(id) {
  const b = BIOMES[id];
  scene.background = skyTex(b.sky[0], b.sky[1]); scene.fog = new THREE.FogExp2(b.fog[0], b.fog[1]);
  hemi.color.set(b.hemi[0]); hemi.groundColor.set(b.hemi[1]); hemi.intensity = b.hemi[2]; sun.color.set(b.sun[0]); sun.intensity = b.sun[1];
  setParticles(id);
}
let particles = null;
function setParticles(id) {
  if (particles) { scene.remove(particles); particles.geometry.dispose(); particles = null; }
  if (id !== 'snow' && id !== 'volcano') return;
  const n = 700, pos = new Float32Array(n * 3); for (let i = 0; i < n * 3; i += 3) { pos[i] = (Math.random() - 0.5) * 40; pos[i + 1] = Math.random() * 16; pos[i + 2] = (Math.random() - 0.5) * 40; }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const dot = document.createElement('canvas'); dot.width = dot.height = 32; const dg = dot.getContext('2d'), gr = dg.createRadialGradient(16, 16, 0, 16, 16, 16); gr.addColorStop(0, '#fff'); gr.addColorStop(1, 'rgba(255,255,255,0)'); dg.fillStyle = gr; dg.fillRect(0, 0, 32, 32);
  particles = new THREE.Points(g, new THREE.PointsMaterial({ color: id === 'snow' ? 0xffffff : 0xff8a3a, size: id === 'snow' ? 0.14 : 0.1, map: new THREE.CanvasTexture(dot), transparent: true, opacity: 0.9, depthWrite: false })); particles.userData.kind = id; particles.frustumCulled = false; scene.add(particles);
}
function updateParticles(dt) {
  if (!particles) return; const p = particles.geometry.attributes.position, c = camera.position, fall = particles.userData.kind === 'snow' ? -2.2 : 1.4;
  for (let i = 0; i < p.count; i++) {
    let y = p.getY(i) + fall * dt, x = p.getX(i) + Math.sin(i + performance.now() * 0.0005) * dt * 0.6;
    if (y < c.y - 6) y += 16; if (y > c.y + 10) y -= 16; if (x < c.x - 20) x += 40; if (x > c.x + 20) x -= 40; let z = p.getZ(i); if (z < c.z - 20) z += 40; if (z > c.z + 20) z -= 40;
    p.setXYZ(i, x, y, z);
  }
  p.needsUpdate = true;
}

/* ───────── modèles du joueur (vélo + pilote) ───────── */
const frame = new THREE.Group(); scene.add(frame);
let bikeModel = null, rider = null;
function buildPlayer() {
  if (bikeModel) { frame.remove(bikeModel.root); } if (rider) { rider.group.parent?.remove(rider.group); }
  const spec = BIKES[save.eq.bike] || BIKES.enduro;
  bikeModel = new BikeModel(spec, find('frame', save.eq.frame), find('wheel', save.eq.wheel));
  rider = new RiderModel(find('outfit', save.eq.outfit), find('helmet', save.eq.helmet));
  frame.add(bikeModel.root, rider.group); rig.init = false;
  // vrai VTT (Sketchfab « Enduro bicycle DH » par Res1n, CC-BY) à la place des pièces procédurales (supprimées) ; le pilote reste
  const bm = bikeModel;
  import('../../../assets/glb.js').then(async (m) => {
    const f = m.fitGLB(await m.loadGLB(new URL('../../../assets/models/enduro-dh.glb', import.meta.url).href), 1.75);
    if (bm !== bikeModel) return;
    m.purge(bm.root);
    f.position.y = -bm.R; bm.root.add(f);
  }).catch((e) => console.warn('VTT non chargé', e));
  return spec;
}
let player = { spec: buildPlayer() };

/* ───────── état de jeu ───────── */
const G = { state: 'menu', paused: false, track: null, chunks: null, structs: null, obstacles: null, bike: null, ragdoll: null, tricks: null, score: null, run: null, cps: null, objs: null,
  acc: 0, crashT: 0, finishT: 0, sel: null, ready: 0, camName: CAM_MODES[0], gameTime: 0, lastLine: 0, longestRun: 0, trickSet: new Set(), airStart: null, pendingResult: null };
const menu = new Menu(document.getElementById('screen'), {
  play: (sel) => startRun(sel), resume: () => setPause(false), restart: () => { setPause(false); startRun(G.sel); }, quit: () => { setPause(false); finishRun(false, true); },
  again: () => startRun(G.sel), newSeed: () => startRun({ ...G.sel, seed: Math.random().toString(36).slice(2, 8).toUpperCase() }), garage: () => toGarage(), toMenu: () => toMenu(),
  preview: () => { buildPlayer(); }, setBlur: (v) => { fx.enabled = v; }, setVolume: (v) => sfx.setVolume(v),
});

function clearWorld() {
  if (G.chunks) { G.chunks.dispose(); G.chunks = null; } if (G.structs) { scene.remove(G.structs); G.structs = null; } if (G.obstacles) { scene.remove(G.obstacles); G.obstacles = null; }
  G.track = null; G.bike = null; G.ragdoll = null; G.ragdollOn = false;
}
const garageGround = (() => { const m = new THREE.Mesh(new THREE.CylinderGeometry(2.2, 2.4, 0.2, 40), new THREE.MeshStandardMaterial({ color: 0x20252d, roughness: 0.8 })); m.position.y = -0.1; m.receiveShadow = true; scene.add(m); return m; })();

function toMenu() {
  G.state = 'menu'; clearWorld(); hud.show(false); setBiome(menu.sel.biome); garageGround.visible = true; buildPlayer(); menu.show('main');
}
function toGarage() { G.state = 'menu'; clearWorld(); hud.show(false); garageGround.visible = true; buildPlayer(); menu.show('shop'); }

function startRun(sel) {
  sfx.start(); G.sel = { ...sel };
  clearWorld(); garageGround.visible = false; menu.hide();
  const track = new Track(sel.seed, sel.diff, sel.biome); G.track = track; setBiome(sel.biome);
  G.chunks = new Chunks(scene, track); G.structs = buildStructures(track, track.biome); scene.add(G.structs);
  G.obstacles = buildObstacleMeshes(track, track.biome); if (G.obstacles) scene.add(G.obstacles);
  const spec = buildPlayer(); player.spec = spec;
  G.bike = new Bike(track, spec); G.ragdoll = new Ragdoll(track); G.tricks = new Tricks(); const diff = diffById(sel.diff);
  G.run = new Run(sel.mode, diff); G.score = new Score(diff.mult); G.cps = new Checkpoints(track); G.objs = makeObjectives(track);
  G.trickSet = new Set(); G.longestRun = 0; G.crashT = 0; G.finishT = 0; G.acc = 0; G.ready = 1.6; G.ragdollOn = false; G.state = 'play'; G.paused = false;
  G.chunks.update(G.bike.pos.x, G.bike.pos.z, Infinity); renderer.compile(scene, camera); rig.init = false; rig.mode = Math.min(rig.mode, 2);
  hud.show(true); hud.pop(track.biome.name + ' · ' + diff.name, 'Graine ' + sel.seed, diff.col); hud.el.map.hidden = !hud.mapOn;
}

function setPause(on) { if (G.state !== 'play' && !on) { return; } G.paused = on; if (on) menu.show('pause'); else menu.hide(); }

function finishRun(finished, quit = false) {
  if (G.state !== 'play') return;
  G.state = 'result'; if (finished) { G.run.finish(); sfx.finish(); }
  G.score.bank();
  checkObjectives(G.objs, { tricks: G.trickSet, longest: G.longestRun, finished, time: G.run.time });
  const diff = diffById(G.sel.diff), free = G.run.free;
  let reward = runReward({ score: free ? 0 : G.score.total, finished, diff, objectives: G.objs });
  if (free) reward = { ...reward, rep: Math.round(reward.rep * 0.4) };
  const unlocks = applyReward(reward, { crashes: G.run.crashes, bestCombo: G.score.bestCombo, longest: G.longestRun });
  const key = G.sel.biome + ':' + G.sel.diff; if (!free && G.score.total > (save.best[key] || 0)) { save.best[key] = G.score.total; persist(); }
  hud.show(false); G.paused = true; menu.show('results', { finished, free, score: G.score.total, time: G.run.time, crashes: G.run.crashes, bestCombo: G.score.bestCombo, longest: G.longestRun, objectives: G.objs, reward, unlocks });
}

/* ───────── entrées -> commandes du vélo ───────── */
const I = {};
function readInput() {
  const man = Input.down('manual');
  Object.assign(I, { steer: Input.steer(), pedal: Input.down('pedal'), brakeR: Input.down('brakeR'), brakeF: Input.down('brakeF'), manual: man, jump: Input.down('jump'), flip: Input.flip(), spin: Input.spin(),
    table: Input.down('grab') && !man, grab: Input.down('grab'), whipL: Input.down('whipL'), whipR: Input.down('whipR'), bar: Input.down('bar'), barB: Input.down('barB'), nohand: Input.down('nohand'), revert: Input.pressed('revert') });
}

const REASONS = { lowside: 'Chute sur le côté', looped: 'Looping raté', endo: 'Par-dessus le guidon', landing: 'Réception ratée', rocher: 'Rocher !', chute: 'Chute de la passerelle', 'hors-piste': 'Hors piste' };
const QTEXT = { perfect: 'RÉCEPTION PARFAITE', clean: 'Réception propre', sketchy: 'Réception limite' };
const _v = new THREE.Vector3(), _w = new THREE.Vector3();

function handleEvents() {
  const b = G.bike, run = G.run;
  for (const e of b.events) {
    if (e.type === 'takeoff') { G.airStart = b.pos.clone(); G.tricks.reset(); if (e.speed > 6) sfx.takeoff(); }
    else if (e.type === 'land') {
      if (e.micro) continue;
      const dist = G.airStart ? Math.hypot(b.pos.x - G.airStart.x, b.pos.z - G.airStart.z) : 0, tr = G.tricks.total();
      sfx.land(e.quality, e.impact); rig.kick(clamp(e.impact / 40, 0.02, 0.2));
      if (e.quality === 'crash') continue;
      const r = G.score.landed(tr, { ...e, dist }, b.risky);
      if (dist > G.longestRun) G.longestRun = dist;
      if (!tr.names.length && dist < 6) continue;
      tr.names.forEach((n) => G.trickSet.add(n.replace(/x\d+$/, '').replace(/^(Double|Triple) /, '')));
      for (const k of G.trickSet) if (/^(Frontflip|Backflip)/.test(k)) { /* clé normalisée par Tricks */ }
      if (r) hud.pop(e.quality === 'sketchy' ? 'Limite…' : tr.names.length ? tr.names.map((n) => n.replace(/x\d+$/, '')).slice(-2).join(' + ') : dist > 6 ? `Saut de ${dist.toFixed(0)} m` : '', `+${r.pts}  ·  ${QTEXT[e.quality]}`, e.quality === 'perfect' ? '#35c759' : e.quality === 'sketchy' ? '#ffd23f' : '#fff');
      checkObjectives(G.objs, { tricks: G.trickSet, longest: G.longestRun, finished: false, time: 0 }).forEach((o) => hud.toast('Objectif : ' + o.label + ' ✔'));
    } else if (e.type === 'crash') {
      sfx.crash(); rig.kick(0.4); G.crashT = 0.001; G.score.crash(run.free);
      const over = run.crash(); G.overAfterCrash = over; G.crashReason = e.reason;
      hud.pop('CRASH', REASONS[e.reason] || '', '#ff5d5d');
      if (!G.ragdollOn) { startRagdoll(); }
    }
  }
  b.events.length = 0;
}

function startRagdoll() {
  const pts = {}; for (const k of Object.keys(rider.P)) pts[k] = frame.localToWorld(rider.P[k].clone());
  frame.updateMatrixWorld(true); G.ragdoll.start(pts, G.bike.vel); G.ragdollOn = true;
  scene.add(rider.group); rider.group.position.set(0, 0, 0); rider.group.quaternion.identity(); rider.setFirstPerson(false);
}
function stopRagdoll() { frame.add(rider.group); rider.group.position.set(0, 0, 0); rider.group.quaternion.identity(); G.ragdollOn = false; }

function respawn(manual) {
  const b = G.bike; stopRagdoll(); const cp = G.cps.point; b.respawn(cp); G.crashT = 0; G.tricks.reset();
  if (manual) { G.score.crash(false); hud.pop('Point de contrôle', '', '#35c759'); } rig.init = false;
}

/* ───────── mise à jour d'une image de jeu ───────── */
function updatePlay(dt) {
  const b = G.bike, run = G.run, track = G.track;
  if (Input.pressed('pause')) { setPause(!G.paused); }
  if (Input.pressed('help') || Input.pressed('book')) { setPause(true); menu.back = 'pause'; menu.help(); }
  if (G.paused) return;
  if (Input.pressed('camera')) { G.camName = rig.cycle(); hud.toast(G.camName); }
  if (Input.pressed('map')) hud.toggleMap();
  if (Input.pressed('reset') && G.ready <= 0 && !b.crashed) respawn(true);
  readInput();
  if (G.ready > 0) { G.ready -= dt; I.pedal = false; if (G.ready <= 0) hud.pop('PARTEZ !', '', '#35c759'); }
  G.acc = Math.min(G.acc + dt, 0.08);
  while (G.acc >= FIXED_DT) { if (G.ready <= 0 || b.crashed) b.step(FIXED_DT, I); G.acc -= FIXED_DT; I.revert = false; }
  handleEvents();
  if (b.crashed) {
    G.ragdoll.step(dt); G.crashT += dt;
    if (G.crashT > 1.9) { if (G.overAfterCrash) { finishRun(false); return; } respawn(false); }
  } else {
    run.tick(dt, b.speed > 1);
    if (!b.grounded) { for (const t of G.tricks.update(b, dt)) { hud.pop(t.name, '+' + t.pts, '#ffd23f'); sfx.trick(); } }
    G.score.tick(dt, { speed: b.speed, manual: b.manual > 0.3 && b.grounded, rail: b.onRail, risky: b.risky, grounded: b.grounded });
    G.cps.update(b.s); if (G.cps.consumePassed()) { sfx.checkpoint(); hud.toast('Point de contrôle'); }
    if (b.s >= track.length - 26 && !G.finishT) { G.finishT = 0.001; run.finish(); sfx.finish(); hud.pop('ARRIVÉE', fmtTime(run.time), '#35c759'); }
    if (G.finishT) { G.finishT += dt; if (G.finishT > 2.2) { finishRun(true); return; } }
  }
  poseBike(dt);
  G.chunks.update(b.pos.x, b.pos.z, 3);
  focusCamera(dt);
  hudUpdate();
  updateParticles(dt);
  sfx.update(dt, { speed: b.speed, surf: b.surf, grounded: b.grounded && !b.crashed, braking: I.brakeR || I.brakeF, sliding: b.sliding, manual: b.manual > 0.3 });
  sun.position.set(b.pos.x + 22, b.pos.y + 38, b.pos.z + 14); sun.target.position.copy(b.pos); sun.target.updateMatrixWorld();
}
const fmtTime = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}.${String(Math.floor((s % 1) * 10))}`;

/* positionne le vélo et le pilote */
function poseBike(dt) {
  const b = G.bike, A = b.air, kmh = b.speed * 3.6;
  frame.position.copy(b.visPos); frame.quaternion.copy(b.quat);
  bikeModel.root.rotation.set(0, A.whipA || 0, A.tableA || 0);
  bikeModel.update({ steer: b.steerA, barA: A.barA || 0, susF: b.susF, susR: b.susR, spin: b.spinWheel, crank: b.crank, kmh });
  frame.updateMatrixWorld(true); bikeModel.prepare(frame);
  if (G.ragdollOn) { const P = rider.P; for (const k of Object.keys(P)) P[k].copy(G.ragdoll.pts[k]); rider.draw(_v.set(0, 0, -1)); return; }
  const air = !b.grounded, sp = b.speed;
  rider.pose(bikeModel, {
    stand: air ? 1 : clamp(sp / 3, 0.25, 1), crouch: b.charge * 0.9 + b.settle * 0.5 + (b.endo > 0.2 ? 0.2 : 0),
    lean: clamp(0.5 + sp * 0.012, 0.5, 0.78) - Math.max(0, b.manual) * 0.7 + Math.max(0, -b.manual) * 0.5, leanExtra: air ? A.legs * 0.55 : 0,
    hands: air ? A.hands : 0, legs: air ? A.legs : 0, back: Math.max(0, b.manual) * 0.12,
  });
}

function focusCamera(dt) {
  const b = G.bike, helmet = rig.mode === 1 && !G.ragdollOn;
  rider.setFirstPerson(helmet);
  // vue casque : au-dessus et derrière le guidon, les mains et le compteur restent dans le bas du champ
  const gl = bikeModel.anchor('gripL', _v.clone()), gr = bikeModel.anchor('gripR', _w.clone()), head = frame.localToWorld(gl.add(gr).multiplyScalar(0.5).add(_w.set(0, 0.4, 0.5)));
  rig.update(dt, { pos: b.visPos, vel: b.crashed ? _v.set(0, 0, 0) : b.vel, quat: b.quat, speed: b.crashed ? 0 : b.speed, yaw: b.yaw, head: G.ragdollOn ? G.ragdoll.pts.head : head }, G.track);
}

function hudUpdate() {
  const b = G.bike, run = G.run, sc = G.score;
  const gauge = !b.grounded && !b.crashed && b.airT > 0.3 ? predictLanding(b, G.track) : null;
  const hint = G.ready > 0 ? 'Prêt ? Pédale (Z) pour lancer la descente' : b.speed < 1.5 && run.time < 3 ? 'Z : pédaler · Espace : sauter · Maj : manual · C : vue · M : carte' : '';
  hud.update({ free: run.free, diffName: G.track.diff.name, score: sc.total, time: run.time, kmh: b.speed * 3.6, lives: run.lives, maxLives: run.maxLives, risky: b.risky, objectives: G.objs, combo: sc.combo, gauge, hint, track: G.track, bike: b });
}

/* ───────── menu : garage tournant ───────── */
function updateMenu(dt) {
  G.gameTime += dt; const a = G.gameTime * 0.35;
  bikeModel.root.rotation.set(0, 0, 0); frame.position.set(0, bikeModel.R + 0.0, 0); frame.quaternion.setFromAxisAngle(new THREE.Vector3(0, 1, 0), a);
  bikeModel.update({ steer: Math.sin(G.gameTime) * 0.15, barA: 0, susF: 0.25, susR: 0.25, spin: G.gameTime * 2, crank: G.gameTime, kmh: 0 });
  frame.updateMatrixWorld(true); bikeModel.prepare(frame); rider.setFirstPerson(false);
  rider.pose(bikeModel, { stand: 0.9, crouch: 0, lean: 0.55, leanExtra: 0, hands: 0, legs: 0 });
  camera.fov = 45; camera.updateProjectionMatrix(); camera.position.set(2.6, 1.4, 2.2); camera.lookAt(0, -0.25, 0);
  sun.position.set(4, 8, 5); sun.target.position.set(0, 0, 0); sun.target.updateMatrixWorld();
}

/* ───────── boucle ───────── */
function resize() { const w = innerWidth, h = innerHeight; if (!w || !h) return; renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); fx.resize(w, h); }
addEventListener('resize', resize); document.addEventListener('visibilitychange', resize); resize();
let last = performance.now();
function stepFrame(dt) {
  Input.update();
  if (G.state === 'play') updatePlay(dt); else if (G.state === 'menu') updateMenu(dt);
  if (G.state === 'result' && G.bike) { poseBike(dt); }
  Input.endFrame();
}
const drawFrame = () => fx.render(G.state === 'play' && G.bike ? clamp(G.bike.speed / 20, 0, 1) : 0);
function frameLoop(now) {
  requestAnimationFrame(frameLoop);
  const dt = Math.min(0.05, (now - last) / 1000); last = now;
  stepFrame(dt); drawFrame();
}
addEventListener('pointerdown', () => sfx.start(), { once: true });
setBiome('forest'); menu.show('main'); requestAnimationFrame(frameLoop);
