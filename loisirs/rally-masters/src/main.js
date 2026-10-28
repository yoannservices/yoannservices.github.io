/* Rally Masters : boucle principale, états (menu / spéciale), construction du monde, effets, HUD, enchaînement
   championnat → spéciale → résultats → assistance → spéciale suivante. Un fichier par système dans les sous-dossiers. */
import * as THREE from 'three';
import { Input } from './core/input.js';
import { save, persist } from './core/save.js';
import { CARS, DIFFS, AI_NAMES } from './core/data.js';
import { seedFrom, mulberry32, clamp } from './core/util.js';
import { SURFACES, NEIGE, GLACE, BOUE, ASPHALTE, GRAVIER, TERRE, WEATHERS } from './surfaces/surfaces.js';
import { generateStage, DS } from './stage/spline.js';
import { Track } from './stage/track.js';
import { Atmosphere } from './stage/weather.js';
import { CarModel } from './car/model.js';
import { CarPhysics } from './car/physics.js';
import { CameraRig, VIEWS } from './camera/views.js';
import { Particles } from './fx/particles.js';
import { GameAudio } from './audio/audio.js';
import { CoDriver } from './rally/codriver.js';
import { StageRun, RESCUE_PENALTY, RESTART_PENALTY } from './rally/timing.js';
import { getRally, newChampionship, stageDef, aiStageTimes, aiTimesAt, recordStage, finishRally, getSetup, upgradesOf, stageRanking, freshDamage, DNF_FACTOR } from './rally/championship.js';
import { Hud } from './ui/hud.js';
import { Menus } from './ui/menus.js';

const canvas = document.getElementById('gl');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.shadowMap.type = THREE.PCFShadowMap; renderer.shadowMap.enabled = true;
const QUALITY = [0.3, 0.8, 1];
const car = (id) => CARS.find((c) => c.id === id);
const _v = new THREE.Vector3();

/* ---------- vitrine de menu : la voiture sur plateau tournant ---------- */
class Showcase {
  constructor() {
    this.scene = new THREE.Scene(); this.cam = new THREE.PerspectiveCamera(42, 1, 0.1, 4000); this.t = 0; this.model = null; this.carId = null;
    this.atmo = new Atmosphere(this.scene, renderer, { weather: 'soleil', tod: 'jour', env: 'asphalte', quality: 0.6 });
    const g = new THREE.Mesh(new THREE.CircleGeometry(60, 48).rotateX(-Math.PI / 2), new THREE.MeshStandardMaterial({ color: 0x57524a, roughness: 0.95 })); g.receiveShadow = true; this.scene.add(g);
    this.scene.fog = new THREE.FogExp2(this.scene.background, 0.004);
  }
  setCar(id) {
    if (this.carId === id) return; this.carId = id; if (this.model) { this.scene.remove(this.model.root); this.model.dispose(); }
    this.model = new CarModel(car(id)); this.model.root.position.y = 0; this.scene.add(this.model.root);
    this.ph = { x: 0, y: 0, z: 0, yaw: 0, pitchG: 0, rollG: 0, heave: 0, pitch: 0, roll: 0, dmg: freshDamage(), air: false, steer: 0, u: 0, spinF: 0, spinR: 0, lockF: 0, lockR: 0, gear: 1, brake: 0, hand: false, rpm: 900, kmh: 0, boost: 0 };
  }
  update(dt, aspect) {
    this.t += dt; this.cam.aspect = aspect;
    const side = document.getElementById('screen').classList.contains('side') && aspect > 1.2, W = innerWidth, H = innerHeight;
    if (side) this.cam.setViewOffset(W, H, -W * 0.24, 0, W, H); else this.cam.clearViewOffset();
    this.cam.updateProjectionMatrix();
    const a = this.t * 0.25 + 0.6, r = 7.2;
    this.cam.position.set(Math.sin(a) * r, 1.8, Math.cos(a) * r); this.cam.lookAt(0, 0.7, 0);
    if (this.model) { this.ph.yaw = 0; this.model.update(this.ph, dt); }
    this.atmo.update(dt, this.cam, { x: 0, y: 0, z: 0 }, this.t);
  }
}

/* ---------- jeu ---------- */
class Game {
  constructor() {
    this.audio = new GameAudio(); this.audio.vol = save.settings.volume;
    this.hud = new Hud(); this.menus = new Menus(this);
    this.camera = new THREE.PerspectiveCamera(62, 1, 0.05, 4000);
    this.showcase = new Showcase(); this.mode = 'menu'; this.w = null; this.paused = false; this.pending = null; this.cur = null; this.conf = {}; this.t = 0; this.last = performance.now(); this.endT = 0;
    this.resize(); addEventListener('resize', () => this.resize());
    const unlock = () => { this.audio.init(); }; addEventListener('pointerdown', unlock); addEventListener('keydown', unlock);
    document.addEventListener('visibilitychange', () => { if (document.hidden && this.mode === 'stage' && !this.paused && this.w.run.state !== 'finished') this.pause(); });
    this.setCarPreview(save.owned[0]); this.menus.title();
    requestAnimationFrame((n) => this.loop(n));
  }
  resize() {
    const q = QUALITY[save.settings.quality ?? 1], dpr = Math.min(devicePixelRatio || 1, q > 0.9 ? 2 : q > 0.5 ? 1.5 : 1);
    renderer.setPixelRatio(dpr); renderer.setSize(innerWidth, innerHeight, false);
    this.camera.aspect = innerWidth / innerHeight; this.camera.updateProjectionMatrix(); this.w?.particles.setResolution(innerHeight * dpr, this.camera.fov);
  }
  setCarPreview(id) { this.showcase.setCar(id); }
  applySettings(k) {
    const s = save.settings;
    if (k === 'volume') this.audio.setVolume(s.volume);
    if (k === 'quality') this.resize();
    if (k === 'voice' && this.w && !s.voice) this.w.cod.stop();
  }

  /* ---------- menus → actions ---------- */
  menuStartChampionship(rallyId, carId, ai) {
    const champ = newChampionship(rallyId, carId, ai); champ.phase = 'brief'; persist();
    this.openBriefing(champ);
  }
  menuContinue() {
    const champ = save.championship; if (!champ) return this.menus.title();
    if (champ.phase === 'service' && champ.stage < getRally(champ.rallyId).stages.length) this.openService(champ); else this.openBriefing(champ);
  }
  menuStartFree(cfg) {
    const word = (cfg.seed || '').trim() || Math.random().toString(36).slice(2, 8).toUpperCase();
    const def = { seed: seedFrom(word.toUpperCase()), seedLabel: word.toUpperCase(), env: cfg.env, length: cfg.length, weather: cfg.weather, tod: cfg.tod, key: `free:${word.toUpperCase()}:${cfg.env}:${cfg.length}`, index: 0 };
    this.cur = { mode: 'free', carId: cfg.car, def, champ: null };
    this.pending = { stage: generateStage(def), ...this.cur };
    this.menus.briefing({ mode: 'free', stage: this.pending.stage, def, carId: cfg.car, champ: null });
  }
  openBriefing(champ) {
    const def = stageDef(champ, champ.stage);
    this.cur = { mode: 'champ', carId: champ.carId, def, champ };
    this.pending = { stage: generateStage(def), ...this.cur };
    this.setCarPreview(champ.carId);
    this.menus.briefing({ mode: 'champ', stage: this.pending.stage, def, carId: champ.carId, champ });
  }
  openService(champ) {
    const next = stageDef(champ, champ.stage); champ.phase = 'service'; persist(); this.setCarPreview(champ.carId);
    this.menus.service({ champ, next }, false);
  }
  menuServiceDone(plan, tire) {
    const champ = save.championship; const d = champ.dmg;
    for (const k of ['bumpF', 'bumpR', 'steer', 'engine', 'body']) d[k] = plan[k]; for (let i = 0; i < 4; i++) d.tires[i] = plan.tires[i];
    if (tire !== getSetup(champ.carId).pneus) { save.setups[champ.carId] = { ...(save.setups[champ.carId] || {}), pneus: tire }; }
    champ.phase = 'brief'; persist(); this.openBriefing(champ);
  }
  menuBegin() { this.audio.init(); this.startWorld(this.pending); }
  menuRetry() { this.cur.def && this.menuBegin(); }
  menuNext() {
    const c = this.cur;
    if (c.mode === 'champ') {
      const champ = save.championship, n = getRally(champ.rallyId).stages.length;
      if (champ.stage >= n) { const fin = finishRally(champ); fin.rallyId = champ.rallyId; this.menus.finalResult(fin); } else this.openService(champ);
    } else this.menuQuit();
  }
  menuQuit() { this.disposeWorld(); this.mode = 'menu'; this.menus.title(); }
  menuResume() { this.paused = false; this.menus.hide(); this.audio.resume(); }
  menuRestart() { this.restartStage(); }
  menuAbort() {
    // abandon : en championnat la spéciale est comptée avec un temps très pénalisant
    this.paused = false; this.w.run.abandon(); this.finishStage(true);
  }

  /* ---------- construction du monde ---------- */
  disposeWorld() {
    const w = this.w; if (!w) return;
    w.cod.stop(); this.audio.silence(); w.track.dispose(); w.atmo.dispose(); w.model.dispose(); w.ghost?.dispose(); w.particles.dispose();
    w.scene.clear(); this.w = null; this.endT = 0;
  }
  startWorld(p) {
    this.disposeWorld(); this.menus.hide();
    const { stage, def, champ, carId } = p, cdef = car(carId), q = QUALITY[save.settings.quality ?? 1];
    const scene = new THREE.Scene();
    const atmo = new Atmosphere(scene, renderer, { weather: stage.weather, tod: stage.tod, env: stage.env, quality: q });
    const track = new Track(stage, scene, { quality: q });
    const model = new CarModel(cdef); scene.add(model.root);
    const phys = new CarPhysics(cdef, getSetup(carId), upgradesOf(carId), stage.env, stage.weather);
    if (champ) phys.dmg = JSON.parse(JSON.stringify(champ.dmg));
    const sp = track.pointAt(stage.startI); phys.reset(sp.x, sp.z, sp.h, sp.y); phys.hint.fill(stage.startI); phys.locked = true;
    track.update(stage.startI, true);
    const run = new StageRun(stage, def.key); run.startCountdown();
    const cod = new CoDriver(stage, save.settings, (t) => this.hud.say(t));
    const particles = new Particles(scene); particles.setFog(scene.fog.color, scene.fog.density);
    const rig = new CameraRig(this.camera); rig.set(save.settings.view ?? 0, model);
    let ghost = null; if (run.best?.rec?.length) { ghost = new CarModel(cdef, { ghost: true }); scene.add(ghost.root); }
    // dents des dégâts déjà subis (carrosserie persistante d'une spéciale à l'autre)
    if (champ) { const d = phys.dmg, rnd = mulberry32(champ.seed + champ.stage); for (let i = 0; i < Math.round(d.body / 9); i++) { const f = rnd() < 0.5; model.dent((rnd() - 0.5) * 1.4, f ? 1.8 : -1.8, 6 + rnd() * 4); } }
    // pilotes IA pour la position en course
    const pc = champ || { seed: def.seed, aiLevel: save.settings.ai, ai: AI_NAMES.slice(0, 11).map((n, i) => ({ name: n, skill: Math.sin(i * 2.3 + def.seed) })) };
    const aiNow = aiStageTimes(pc, stage, def.index);
    const w = this.w = { stage, def, champ, carId, cdef, scene, atmo, track, model, phys, run, cod, particles, rig, ghost, aiNow, lights: atmo.autoLights, view: rig.mode, stuck: 0, shown: 0, dmgSeen: 0, endT: 0, finished: false, camT: 0 };
    model.setLights(w.lights);
    this.mode = 'stage'; this.paused = false; this.t = 0;
    this.hud.show(true); this.hud.setMap(stage);
    const label = champ ? `Spéciale ${def.index + 1}/${getRally(champ.rallyId).stages.length} · ${stage.name}` : `Libre · ${stage.name}`;
    this.hud.setStage(label, stage.weather, save.settings.units);
    this.hud.hint('Z/S gaz-frein · Q/D direction · Espace frein à main · C vue · M carte · L phares · R relance · T remise en piste · Échap pause');
    setTimeout(() => this.hud.hint(''), 12000);
    this.audio.setCabin(rig.mode === 3); this.resize();
    cod.say_countdown();
  }
  restartStage() {
    if (!this.w) return; const w = this.w;
    if (w.champ) { w.champ.restarts++; persist(); }
    this.paused = false; this.menus.hide(); this.startWorld({ stage: w.stage, def: w.def, champ: w.champ, carId: w.carId });
    if (w.champ) this.hud.toast(`Redémarrage : +${RESTART_PENALTY} s au classement`, 'bad');
  }
  pause() {
    if (this.mode !== 'stage' || this.paused || !this.w || this.w.run.state === 'finished' || this.w.run.state === 'dnf') return;
    this.paused = true; this.audio.silence(); this.audio.suspend(); this.menus.pause(!this.w.champ);
  }
  confirmKey(key, text) {
    const now = performance.now();
    if (this.conf[key] && now - this.conf[key] < 1800) { this.conf[key] = 0; return true; }
    this.conf[key] = now; this.hud.msg(text, 1800); return false;
  }

  /* ---------- fin de spéciale ---------- */
  finishStage(abandon = false) {
    const w = this.w; if (!w || w.finished) return; w.finished = true;
    const { run, stage, champ, phys } = w, dnf = run.state === 'dnf', human = dnf ? stage.tref * DNF_FACTOR + 300 : run.finishTime;
    let rank = null, record = false, last = false;
    save.stats.km += stage.length / 1000; if (dnf) save.stats.crashes++;
    if (champ) {
      recordStage(champ, w.def.index, human, stage, phys.dmg); champ.phase = 'service';
      rank = stageRanking(champ, w.def.index); last = champ.stage >= getRally(champ.rallyId).stages.length;
    } else {
      const ai = w.aiNow.map((t, j) => ({ name: AI_NAMES[j], human: false, total: t })); ai.push({ name: 'Vous', human: true, total: human });
      ai.sort((a, b) => a.total - b.total); ai.forEach((r, i) => (r.rank = i + 1)); rank = ai;
    }
    if (!dnf) record = run.commit();
    persist(); this.hud.show(false); this.audio.silence(); w.cod.stop();
    this.paused = false;
    this.menus.stageResult({ run, rank, champ, k: w.def.index, last, record, dnf, why: run.events.find((e) => e.type === 'dnf')?.why || (abandon ? 'Abandon' : 'Spéciale non terminée') });
    this.hud.msg('');
  }

  /* ---------- boucle ---------- */
  loop(now) {
    const dt = Math.min(0.05, (now - this.last) / 1000); this.last = now; this.t += dt;
    Input.poll();
    try { this.frame(dt); } catch (e) { console.error(e.stack || e); }
    Input.endFrame();
    requestAnimationFrame((n) => this.loop(n));
  }
  frame(dt) {
    if (this.mode === 'menu') { this.showcase.update(dt, innerWidth / innerHeight); renderer.render(this.showcase.scene, this.showcase.cam); return; }
    const w = this.w; if (!w) return;
    if (this.paused && Input.pressed('pause')) this.menuResume();
    if (!this.paused && !w.finished) this.updateStage(dt, w);
    renderer.render(w.scene, this.camera);
  }

  updateStage(dt, w) {
    const { phys: ph, run, track, model, rig, atmo, particles, stage, cod } = w, hud = this.hud;
    // touches ponctuelles
    if (Input.pressed('view')) { const n = rig.next(model); hud.toast('Vue : ' + n); this.audio.setCabin(rig.mode === 3); }
    if (Input.pressed('lights')) { w.lights = !w.lights; model.setLights(w.lights); }
    if (Input.pressed('map')) hud.toggleMap();
    if (Input.pressed('voice')) { save.settings.voice = !save.settings.voice; persist(); if (!save.settings.voice) cod.stop(); hud.toast('Copilote : voix ' + (save.settings.voice ? 'activée' : 'coupée')); }
    if (Input.pressed('restart') && (run.state === 'run' || run.state === 'countdown') && this.confirmKey('restart', w.champ ? `Appuie encore sur R : redémarrage (+${RESTART_PENALTY} s)` : 'Appuie encore sur R pour redémarrer')) { this.restartStage(); return; }
    if (Input.pressed('rescue') && run.state === 'run' && this.confirmKey('rescue', `Appuie encore sur T : remise sur la route (+${RESCUE_PENALTY} s)`)) {
      run.addPenalty(RESCUE_PENALTY, 'Remise sur la route'); ph.place(track, Math.max(stage.startI, ph.idx - 2)); this.audio.penalty();
    }
    if (Input.pressed('pause')) { this.pause(); return; }

    // commandes
    let ctl = Input.drive(dt);
    const over = run.state === 'finished' || run.state === 'dnf';
    if (over) ctl = { steer: 0, throttle: 0, brake: 1, hand: false };
    ph.locked = run.state === 'countdown';
    ph.update(dt, ctl, track);
    track.update(ph.idx); track.animate(dt);
    run.update(dt, ph, track);
    for (const e of run.events) this.runEvent(e, w);
    const dist = (ph.idx + (ph.g[4].t || 0)) * DS;
    if (run.state === 'run' || run.state === 'countdown') cod.update(dist, ph.speed);
    this.physEvents(w);

    // rendu des objets
    model.setLights(w.lights); model.update(ph, dt);
    if (w.ghost) { const g = run.state === 'run' ? run.ghostAt(run.t) : null; w.ghost.root.visible = !!g; if (g) { const gp = { x: g[0], y: g[1], z: g[2], yaw: g[3], pitchG: 0, rollG: 0, heave: 0, pitch: 0, roll: 0, dmg: { tires: [0, 0, 0, 0], steer: 0 }, air: false, steer: 0, u: 20 }; w.ghost.update(gp, dt); w.ghost.root.position.y = g[1]; } }
    w.camT += dt; rig.update(dt, ph, model, w.camT);
    const vx = ph.u * Math.sin(ph.yaw) + ph.v * Math.cos(ph.yaw), vz = ph.u * Math.cos(ph.yaw) - ph.v * Math.sin(ph.yaw);
    atmo.update(dt, this.camera, { x: ph.x, y: ph.y, z: ph.z, vx, vz }, w.camT);
    this.emitFx(dt, w, vx, vz); particles.update(dt);
    this.audio.update(ph, w.cdef, stage.weather, dt);

    // HUD
    const aiAt = aiTimesAt(w.aiNow, stage, ph.idx), tot = run.total, pos = run.state === 'countdown' ? 0 : 1 + aiAt.filter((t) => t < tot).length;
    hud.update({
      time: run.state === 'countdown' ? 0 : run.state === 'run' || over ? run.t : 0, delta: run.delta, pen: run.penTotal, pos, posTotal: aiAt.length + 1, view: VIEWS[rig.mode], unit: save.settings.units,
      kmh: ph.kmh, gear: ph.gear, rpm: ph.rpm / w.cdef.rpmMax, turbo: !!w.cdef.turbo, boost: ph.boost, lights: w.lights, hand: ph.hand, progress: ph.idx / stage.N,
      dmg: ph.dmg, health: ph.health(), notes: cod.ahead(dist, 4),
    }, dt);
    hud.drawMap(ph.idx, ph.x, ph.z, ph.yaw);
    // bloqué ?
    if (run.state === 'run' && ph.speed < 0.6) { w.stuck += dt; if (w.stuck > 6 && w.stuck < 6.1) hud.hint('Bloqué ? T = remise sur la route (+45 s)'); } else if (w.stuck) { if (w.stuck > 6) hud.hint(''); w.stuck = 0; }
    // fin
    if (over && !w.endT) w.endT = this.t + (run.state === 'finished' ? 2.8 : 1.6);
    if (over && this.t >= w.endT) this.finishStage();
  }

  runEvent(e, w) {
    const { hud } = this;
    const lamps = w.track.startGate.lights;
    if (e.type === 'count') { this.audio.beep(e.n); hud.count(e.n); lamps.forEach((m, i) => m.color.set(i < 4 - e.n ? 0xff2020 : 0x331111)); }
    else if (e.type === 'go') { this.audio.beep(0); hud.count(0); lamps.forEach((m) => m.color.set(0x22ff55)); }
    else if (e.type === 'cp') {
      this.audio.checkpoint();
      const d = e.diff == null ? '' : ` (${e.diff <= 0 ? '−' : '+'}${Math.abs(e.diff).toFixed(2)} s)`;
      hud.toast(`Chrono ${e.n} : ${fmt(e.time)}${d}`, 'cp');
    } else if (e.type === 'penalty') { this.audio.penalty(); hud.toast(`${e.why} : +${e.sec} s`, 'bad'); hud.msg(`+${e.sec} s`, 1400); }
    else if (e.type === 'finish') { this.audio.finish(); hud.msg('ARRIVÉE ! ' + fmt(e.time), 2600); }
    else if (e.type === 'dnf') { hud.msg(e.why, 2000); }
  }

  physEvents(w) {
    const { phys: ph, model, rig, particles } = w, hud = this.hud, up = Math.sin(ph.yaw), co = Math.cos(ph.yaw);
    for (const e of ph.events) {
      if (e.type === 'impact') {
        this.audio.impact(e.sev); rig.kick(Math.min(1, e.sev / 12));
        if (!e.hard) model.dent(e.cx, e.cz, e.sev);
        const wx = ph.x + up * e.cz + co * e.cx, wz = ph.z + co * e.cz - up * e.cx;
        particles.emit('spark', Math.min(25, 4 + e.sev * 2), wx, ph.y + 0.5, wz, 0, 2, 0, [1, 0.8, 0.4], 4, 1);
        particles.emit('dust', Math.min(14, 3 + e.sev), wx, ph.y + 0.4, wz, 0, 1, 0, [0.6, 0.55, 0.5], 2.5, 1.3);
        if (e.sev > 5) hud.toast('Choc violent !', 'bad');
      } else if (e.type === 'land') { this.audio.land(e.v); rig.kick(Math.min(0.6, e.v / 18)); }
      else if (e.type === 'puncture') { this.audio.puncture(); hud.toast('Crevaison ! ' + ['avant gauche', 'avant droit', 'arrière gauche', 'arrière droit'][e.w], 'bad'); }
      else if (e.type === 'dead') hud.toast('Moteur détruit : la spéciale est terminée', 'bad');
      else if (e.type === 'splash') { this.audio.splash(); particles.emit('splash', 3, e.x, e.y + 0.1, e.z, 0, 3, 0, [0.8, 0.9, 1], 2.2, 1); }
      else if (e.type === 'shift') this.audio.shift();
    }
    const d = ph.dmg, tot = Math.round(d.engine + d.steer + d.body * 0.3 + d.bumpF * 0.3 + d.bumpR * 0.3);
    if (d.steer > 25 && w.dmgSeen < 25 && d.steer > w.dmgSeen) { hud.toast('Direction faussée', 'bad'); }
    w.dmgSeen = Math.max(w.dmgSeen, d.steer > 25 ? d.steer : 0);
  }

  /* poussière, boue, neige, éclaboussures, étincelles, fumée */
  emitFx(dt, w, vx, vz) {
    const { phys: ph, model, particles, stage } = w, R = w.cdef.wheelR; if (ph.air && ph.airT > 0.2) return;
    const q = QUALITY[save.settings.quality ?? 1], k = q > 0.5 ? 1 : 0.5, rain = stage.weather === 'pluie';
    for (let i = 0; i < 4; i++) {
      const surf = ph.g[i].surf, S = SURFACES[surf], slide = Math.min(1.4, ph.slide[i]); model.wheels[i].g.getWorldPosition(_v);
      const sp = ph.speed, gy = _v.y - R + 0.05;
      if (sp > 2 && S.dustAmt > 0) {
        const n = S.dustAmt * sp * (0.12 + slide * 0.9) * dt * k * (i >= 2 ? 1 : 0.6), c = Math.floor(n) + (Math.random() < n % 1 ? 1 : 0);
        if (c) {
          const kind = surf === NEIGE || surf === GLACE ? 'snow' : 'dust', col = S.dust;
          particles.emit(kind, c, _v.x, gy, _v.z, -vx * 0.25, 0.8 + slide, -vz * 0.25, col, 1 + slide * 2, 0.8 + slide);
          if (surf === BOUE || (rain && surf === TERRE)) if (Math.random() < 0.5 * (slide + 0.2)) particles.emit('mud', 1 + (slide > 0.5 ? 2 : 0), _v.x, gy + 0.1, _v.z, -vx * 0.3, 2.5 + slide * 3, -vz * 0.3, [0.2, 0.14, 0.09], 2, 1);
        }
      }
      if (rain && surf === ASPHALTE && sp > 12) { const n = sp * 0.1 * dt * k; if (Math.random() < n) particles.emit('splash', 1, _v.x, gy, _v.z, -vx * 0.15, 1.5, -vz * 0.15, [0.85, 0.9, 0.95], 1.2, 1.2); }
      if (ph.dmg.tires[i] > 0 && sp > 6 && Math.random() < dt * 40 * Math.min(1, sp / 25) && !ph.air) particles.emit('spark', 1, _v.x, gy, _v.z, -vx * 0.2, 1.2, -vz * 0.2, [1, 0.75, 0.35], 2.5, 1);
    }
    const e = ph.dmg.engine;
    if (e > 35) { const n = (e - 30) / 70 * dt * 28; if (Math.random() < n % 1 || n >= 1) { model.markers.smoke.getWorldPosition(_v); particles.emit('smoke', Math.max(1, Math.floor(n)), _v.x, _v.y, _v.z, vx * 0.3, 1.5, vz * 0.3, e > 80 ? [0.08, 0.08, 0.08] : [0.45, 0.45, 0.45], 0.6, 1.2); } }
  }
}
const fmt = (s) => { const m = Math.floor(s / 60), r = s - m * 60; return `${m}:${r < 10 ? '0' : ''}${r.toFixed(2)}`; };

window.game = new Game();
