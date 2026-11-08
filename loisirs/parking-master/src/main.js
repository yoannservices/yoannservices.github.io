/* Parking Master : boucle principale et enchaînement menu → niveau → résultats. Un fichier par système dans les sous-dossiers. */
import * as THREE from 'three';
import { poll, pressed, endFrame, inp } from './core/input.js';
import { save, record } from './core/save.js';
import { LEVELS, levelById, startOf } from './levels/levels.js';
import { CarPhysics } from './car/physics.js';
import { loadCar } from './car/model.js';
import { CameraRig } from './camera/rig.js';
import { Guide, SpotMarks } from './gameplay/guide.js';
import { Run, CRASH_KMH } from './gameplay/run.js';
import { Hud } from './ui/hud.js';
import { Menus } from './ui/menus.js';
import { GameAudio } from './audio/audio.js';

const BASE = { 'ville-1': './world/ville.js', 'campagne-1': './world/campagne.js', 'foret-1': './world/foret.js', 'montagne-1': './world/montagne.js' };
const loadScene = (id) => import(BASE[id] || `./world/scenes/${id}.js`);

const canvas = document.getElementById('gl');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFShadowMap;

function disposeScene(scene) {
  scene.traverse((o) => {
    if (o.geometry) o.geometry.dispose();
    if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => m.dispose());
  });
}

class Game {
  constructor() {
    this.audio = new GameAudio(); this.audio.vol = save.volume;
    this.hud = new Hud(); this.menus = new Menus(this);
    this.camera = new THREE.PerspectiveCamera(62, 1, 0.1, 3000);
    this.rig = new CameraRig(this.camera, canvas);
    this.mode = 'loading'; this.placeId = null; this.place = null; this.carId = null; this.car = null; this.run = null; this.level = null;
    this.t = 0; this.last = performance.now(); this.timers = {};
    this.resize(); addEventListener('resize', () => this.resize());
    const unlock = () => this.audio.init(); addEventListener('pointerdown', unlock); addEventListener('keydown', unlock);
    document.addEventListener('visibilitychange', () => { if (document.hidden && this.mode === 'play' && this.run.state === 'driving') this.pause(); });
    this.boot();
    requestAnimationFrame((n) => this.loop(n));
  }

  resize() {
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
    renderer.setSize(innerWidth, innerHeight, false);
    this.camera.aspect = innerWidth / innerHeight; this.camera.updateProjectionMatrix();
  }

  async boot() {
    await this.load(LEVELS[0]);
    this.mode = 'menu'; this.menus.title();
    window.GameLoader?.ready();
  }

  /* Charge (ou garde) le lieu et la voiture du niveau, puis place la voiture au départ. */
  async load(level) {
    const st = startOf(level);
    const sceneId = level.scene || level.id;
    if (this.placeId !== sceneId) {
      if (this.place) { disposeScene(this.place.scene); this.guide?.dispose(); this.marks?.dispose(); }
      const mod = await loadScene(sceneId);
      this.place = await mod.build({ renderer, level });
      this.placeId = sceneId; this.guide = this.marks = null;
    }
    if (this.carId !== st.car) {
      if (this.car) { this.place.scene.remove(this.car.root); this.car.dispose(); }
      this.car = await loadCar(st.car); this.carId = st.car; this.place.scene.add(this.car.root);
    } else if (!this.car.root.parent) this.place.scene.add(this.car.root);
    this.guide?.dispose(); this.marks?.dispose();
    this.guide = new Guide(this.place.scene, level.route); this.marks = new SpotMarks(this.place.scene, level.spot);
    this.phys = new CarPhysics(this.car.dim); this.phys.place(st.x, st.z, st.yaw);
    this.level = level;
    this.run = new Run(level, this.phys, this.place.colliders, {
      warn: (kmh) => { this.hud.toast(`Attention : choc à ${Math.round(kmh)} km/h`, 'warn'); this.audio.warn(); },
      crash: (kmh, obj) => this.onCrash(kmh, obj),
      park: (r) => this.onPark(r),
    });
    this.car.update(this.phys, 0.016);
    this.rig.snap(); this.rig.f = 1; this.rig.update(1, this.phys, this.car.dim.length, this.place.colliders, this.place.maxY);
    this.place.sky.follow(this.phys.x, this.phys.z);
    clearTimeout(this.timers.fail); clearTimeout(this.timers.park);
  }

  async start(id) {
    const level = levelById(id);
    this.mode = 'loading'; this.menus.hide(); this.hud.hide();
    await this.load(level);
    this.hud.show(level); this.mode = 'play';
  }
  restart() { return this.start(this.level.id); }
  toMenu() { this.mode = 'menu'; this.hud.hide(); this.menus.title(); }
  pause() { if (this.mode !== 'play') return; this.mode = 'pause'; this.menus.pause(); }
  resume() { this.mode = 'play'; this.menus.hide(); this.last = performance.now(); }

  onCrash(kmh, obj) {
    this.hud.toast(obj && obj.ped ? 'Piéton touché : niveau perdu' : `Choc à ${Math.round(kmh)} km/h (seuil ${CRASH_KMH}) : niveau perdu`, 'bad', 1.6);
    this.hud.flash(); this.audio.crash();
    this.timers.fail = setTimeout(() => { if (this.mode === 'play') this.restart(); }, 1700);
  }
  onPark(r) {
    const rec = record(this.level.id, r.time, r.stars);
    this.audio.success(r.stars);
    this.hud.toast('Parfait !', '', 1.2);
    this.timers.park = setTimeout(() => { if (this.mode !== 'play') return; this.mode = 'end'; this.hud.hide(); this.menus.result({ level: this.level, time: r.time, stars: r.stars, record: rec, warns: this.run.warns }); }, 1100);
  }

  loop(now) {
    requestAnimationFrame((n) => this.loop(n));
    const dt = Math.min(0.05, (now - this.last) / 1000); this.last = now; this.t += dt;
    poll();
    if (this.mode === 'play') this.updatePlay(dt);
    else if (this.mode === 'pause' && pressed('Escape')) this.resume();
    else if (this.mode === 'menu' && this.car) this.orbit(dt);
    endFrame();
    if (this.place) renderer.render(this.place.scene, this.camera);
  }

  updatePlay(dt) {
    if (pressed('Escape')) return this.pause();
    if (pressed('KeyR')) return void this.restart();
    if (pressed('KeyC')) this.hud.toast('Vue : ' + this.rig.next(), '', 1);
    const run = this.run, ph = this.phys;
    run.update(dt, inp);
    this.car.update(ph, dt);
    this.guide.update(ph.x, ph.z, this.t);
    const GS = window.GameSettings;
    if (GS) { // guidage : chevrons au sol et/ou flèche en haut
      this.guide.mesh.visible = GS.guide === 'sol' || GS.guide === 'both';
      const g = this.guide, p = g.pts[Math.min(g.n - 1, g.idx + 6)];
      GS.arrow(run.state === 'driving' || run.state === 'ready' ? Math.atan2(p.x - ph.x, p.z - ph.z) - ph.yaw : null);
    }
    this.marks.set(run.inside, run.progress);
    this.hud.update(dt, { time: run.time, kmh: Math.abs(ph.v) * 3.6, stars: run.stars, inside: run.inside, progress: run.progress, state: run.state });
    this.place.update?.(dt, { x: ph.x, z: ph.z, v: ph.v, yaw: ph.yaw });
    this.rig.update(dt, ph, this.car.dim.length, this.place.colliders, this.place.maxY);
    this.place.sky.follow(ph.x, ph.z);
    this.audio.engine(ph.v, run.state === 'driving' ? inp.throttle : 0, run.state === 'ready' || run.state === 'driving');
  }

  /* Plan tournant autour de la voiture de départ pendant le menu. */
  orbit(dt) {
    const ph = this.phys, a = this.t * 0.18 + 0.6, r = 9;
    this.camera.position.set(ph.x + Math.sin(a) * r, 3.2, ph.z + Math.cos(a) * r);
    this.camera.lookAt(ph.x, 1, ph.z);
    this.audio.engine(0, 0, false);
  }
}

window.__pm = new Game();
