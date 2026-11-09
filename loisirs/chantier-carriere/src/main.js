// Chantier & Carrière : boucle de jeu. Terrain déformable, 5 engins (chargeuse, pelle, tombereau, bouteur, camion benne),
// concasseur, camions clients, commandes, carburant, usure, tirs de mine, météo et jour/nuit, boutique et carrière.
import * as THREE from 'three';
import { patch } from '../../../assets/perf.js';
patch(THREE);
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { Terrain, tonnes } from './core/terrain.js';
import { TerrainMesh } from './world/TerrainMesh.js';
import { Site, ZONES, BLAST_SITES } from './world/Site.js';
import { Plant, PLANT } from './world/Plant.js';
import { Environment } from './world/Environment.js';
import { Customers } from './world/Customers.js';
import { Machine, SPECS } from './machines/Machine.js';
import { buildMachine, poseMods } from './machines/models.js';
import { work } from './machines/ops.js';
import { Economy, PRICES } from './economy/Economy.js';
import { Orders } from './economy/Orders.js';
import { GameAudio } from './audio/audio.js';
import { CameraRig } from './camera.js';
import { readInput, press } from './input.js';
import { Hud } from './ui/Hud.js';
import { Menu } from './ui/Menu.js';
import { Tutorial } from './ui/Tutorial.js';
import { get } from './settings.js';

const STEP = 1 / 60;
const dist = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);
const SPAWN = { loader: [-48, -24, -Math.PI / 2], excavator: [8, -10, Math.PI / 2], dumper: [-6, -20, Math.PI / 2], dozer: [10, -28, Math.PI / 2], truck: [-52, 30, Math.PI] };
const IDLE = { drive: 0, steer: 0, brake: 1, hand: true, t1: 0, t2: 0, t3: 0, t4: 0 };

// poussière : particules réutilisées (creusage, chute de roche, tir de mine)
class Dust {
  constructor(scene) {
    const n = 260; this.n = n; this.p = new Float32Array(n * 3); this.v = new Float32Array(n * 3); this.life = new Float32Array(n); this.i = 0;
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(this.p, 3));
    this.pts = new THREE.Points(g, new THREE.PointsMaterial({ color: '#b9a888', size: 1.3, transparent: true, opacity: 0.45, depthWrite: false, sizeAttenuation: true }));
    this.pts.frustumCulled = false; this.pts.userData.noLod = true; scene.add(this.pts);
    for (let k = 0; k < n; k++) this.p[k * 3 + 1] = -999;
  }
  emit(x, y, z, count, spread = 1.5, up = 1.2) {
    for (let c = 0; c < count; c++) {
      const k = this.i++ % this.n; this.life[k] = 1 + Math.random();
      this.p.set([x + (Math.random() - 0.5) * spread, y, z + (Math.random() - 0.5) * spread], k * 3);
      this.v.set([(Math.random() - 0.5) * spread, up * (0.4 + Math.random()), (Math.random() - 0.5) * spread], k * 3);
    }
  }
  update(dt) {
    for (let k = 0; k < this.n; k++) {
      if (this.life[k] <= 0) continue;
      this.life[k] -= dt; if (this.life[k] <= 0) { this.p[k * 3 + 1] = -999; continue; }
      this.p[k * 3] += this.v[k * 3] * dt; this.p[k * 3 + 1] += this.v[k * 3 + 1] * dt; this.p[k * 3 + 2] += this.v[k * 3 + 2] * dt; this.v[k * 3 + 1] *= 0.97;
    }
    this.pts.geometry.attributes.position.needsUpdate = true;
  }
}

class Game {
  constructor() {
    const canvas = document.getElementById('scene');
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    this.renderer.shadowMap.enabled = true; this.renderer.shadowMap.type = THREE.PCFShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping; this.renderer.toneMappingExposure = 1.05;
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(62, 1, 0.1, 1500); this.scene.add(this.camera);
    const pm = new THREE.PMREMGenerator(this.renderer); this.envTex = pm.fromScene(new RoomEnvironment(), 0.04).texture; pm.dispose();
    this.time = 0; this.acc = 0; this.saveT = 0; this.started = false; this.timeSpeed = 1; this.meshT = 0; this.sound = {};
    this.economy = new Economy(); this.audio = new GameAudio();
    this.env = new Environment(this.scene, this.economy.d.hours ?? 7);
    this.terrain = new Terrain(); this.plant = new Plant();
    this.loadTerrain();
    this.tmesh = new TerrainMesh(this.scene, this.terrain);
    this.site = new Site(this.scene, this.terrain);
    this.dust = new Dust(this.scene);
    this.world = { terrain: this.terrain, plant: this.plant, machines: [], obstacles: (self) => [...this.site.colliders, ...this.world.machines.filter((o) => o !== self).map((o) => o.collider())] };
    this.models = new Map(); this.group = new THREE.Group(); this.scene.add(this.group);
    for (const spec of Object.values(SPECS)) {
      const [x, z, h] = SPAWN[spec.id], m = new Machine(spec, x, z, h); m.y = this.terrain.height(x, z); m.fuel = spec.fuel; this.world.machines.push(m);
    }
    const saved = this.economy.d.machines; if (saved) for (const m of this.world.machines) m.restore(saved[m.id]);
    for (const m of this.world.machines) m.y = this.terrain.height(m.x, m.z);
    this.active = this.world.machines[0];
    this.orders = new Orders(this.economy.d.orderList);
    this.customers = new Customers(this.world, this.orders, (t, tn, r) => this.onSale(t, tn, r));
    this.rig = new CameraRig(this.camera); this.rig.bind(canvas);
    this.hud = new Hud(this); this.menu = new Menu(this); this.tuto = new Tutorial(this);
    this.economy.onGrade = (g) => { this.toast(`Promotion : ${g} !`, 'ok'); this.audio.chime(); };
    this.applyUpgrades(); this.applyGfx(); this.syncModels(0);
    addEventListener('resize', () => this.resize()); addEventListener('pointerdown', () => this.audio.unlock()); addEventListener('keydown', () => this.audio.unlock());
    addEventListener('beforeunload', () => this.save());
    window.__pauseGame = () => this.menu.toggle(true);
    for (const b of document.querySelectorAll('#touch button')) {
      const k = b.dataset.k; b.addEventListener('pointerdown', (e) => { e.preventDefault(); press(k, true); }); for (const ev of ['pointerup', 'pointercancel', 'pointerleave']) b.addEventListener(ev, () => press(k, false));
    }
    this.resize(); this.menu.toggle(true);
    this.last = performance.now();
    this.renderer.setAnimationLoop((now) => { const dt = Math.min((now - this.last) / 1000, 0.1); this.last = now; this.step(dt); });
  }
  resize() { this.renderer.setSize(innerWidth, innerHeight, false); this.camera.aspect = innerWidth / innerHeight; this.camera.updateProjectionMatrix(); }
  toast(msg, kind) { this.hud?.toast(msg, kind); }
  get mods() { const e = this.economy; return { speed: e.mult('engine', 0.1), bucket: e.mult('bucket', 0.2), tank: e.mult('tank', 0.25), tires: e.d.up.tires ? 0.7 : 1 }; }
  applyUpgrades() { const m = this.mods; poseMods.bucket = m.bucket; poseMods.tank = m.tank; this.plant.mul = this.economy.mult('crusher', 0.3); }
  applyGfx() {
    this.renderer.setPixelRatio(Math.min(devicePixelRatio, get('pixel')));
    this.scene.environment = get('env') ? this.envTex : null; this.scene.environmentIntensity = 0.4; this.audio.setVolume(get('volume'));
    for (const m of this.world.machines) m.lightsOk = get('lights');
  }
  // --- terrain initial / sauvegarde -----------------------------------------------------------------
  initPiles() {
    const t = this.terrain; t.add(17, -10, 7, 420, 0); t.add(PLANT.stock.x, PLANT.stock.z, 4, 70, 1);
    for (let i = 0; i < 400; i++) if (!t.relax(20000)) break;
  }
  loadTerrain() {
    let ok = false;
    try { const s = localStorage.getItem('chantier-carriere.save.v2.terrain'); if (s) ok = this.terrain.decode(s); } catch { /* ignore */ }
    if (!ok) this.initPiles();
  }
  save() {
    const e = this.economy; e.d.machines = Object.fromEntries(this.world.machines.filter((m) => !m.ai).map((m) => [m.id, m.snapshot()]));
    e.d.orderList = this.orders.list; e.d.hours = this.env.hours; e.save();
    try { localStorage.setItem('chantier-carriere.save.v2.terrain', this.terrain.encode()); } catch { /* quota */ }
  }
  newCareer() {
    this.economy.reset(); const t = this.terrain, f = new Terrain(); t.H.set(f.H); t.L.fill(0); t.G.fill(0); t.active.clear(); this.initPiles(); t.version++;
    for (const m of this.world.machines.filter((o) => !o.ai)) { const [x, z, h] = SPAWN[m.id]; Object.assign(m, { x, z, h, speed: 0, fuel: m.s.fuel, damage: 0, cargo: { vol: 0, g: 0 } }); m.y = t.height(x, z); }
    this.plant.hopper = 0; this.orders.list = []; this.orders.next = 5; this.applyUpgrades(); this.toast('Nouvelle carrière', 'ok'); this.switchTo('loader'); this.tuto.start();
  }
  // --- modèles ----------------------------------------------------------------------------------------
  syncModels() {
    const live = new Set(this.world.machines);
    for (const m of this.world.machines) if (!this.models.has(m)) { const mdl = buildMachine(m.id, this.group); this.models.set(m, mdl); }
    for (const [m, mdl] of this.models) if (!live.has(m)) { this.group.remove(mdl.root); this.models.delete(m); }
  }
  switchTo(id) {
    const m = this.world.machines.find((x) => x.id === id && !x.ai); if (!m || m === this.active) return;
    this.active = m; this.rig.orb.yaw = 0; this.rig.orb.pitch = 0; this.rig.follow = m.h; this.audio.click(); this.toast(`${m.s.name}`, '');
  }
  fleet() { return this.world.machines.filter((m) => !m.ai); }
  // --- économie ---------------------------------------------------------------------------------------
  onSale(t, tn, r) {
    const e = this.economy, total = r.pay + r.bonus;
    if (tn < 0.5) { this.toast('Camion parti à vide : trop long à charger', 'warn'); return; }
    e.addMoney(total); e.d.sold += tn; e.d.soldMoney += total; e.d.trucks++; e.addXp(Math.round(tn * 0.7 + (r.finished ? 40 : 0)));
    if (r.finished) { e.d.orders++; this.toast(`Commande terminée : prime ${r.bonus >= 0 ? '+' : ''}${r.bonus} €`, r.bonus >= 0 ? 'ok' : 'warn'); }
    this.toast(`Pesée : ${tn.toFixed(1)} t · +${r.pay} €${t.order ? ' · ' + t.order.client : ''}`, 'ok'); this.audio.cash();
  }
  // --- interactions (F) -------------------------------------------------------------------------------
  interactions(inp) {
    const a = this.active, e = this.economy, mods = this.mods, here = { x: a.x, z: a.z };
    let prompt = '', act = null;
    const z = ZONES, still = Math.abs(a.speed) < 1.2;
    const atFuel = dist(here, z.fuel) < z.fuel.r, atWork = dist(here, z.workshop) < z.workshop.r, w = z.weigh;
    const onScale = Math.abs(a.x - w.x) < w.hx && Math.abs(a.z - w.z) < w.hz;
    if (onScale && a.s.bed && a.cargo.vol > 0.2) {
      const tn = tonnes(a.cargo.vol, a.cargo.g), p = Math.round(tn * (a.cargo.g > 0.5 ? PRICES.gravel : PRICES.rock));
      prompt = `F : peser et vendre ${tn.toFixed(1)} t de ${a.cargo.g > 0.5 ? 'gravier' : 'tout-venant'} (+${p} €)`;
      act = () => { a.unload(99); a.tool.bed = 0; e.addMoney(p); e.d.sold += tn; e.d.soldMoney += p; e.addXp(Math.round(tn * 0.4)); this.toast(`Vente au pont-bascule : ${tn.toFixed(1)} t · +${p} €`, 'ok'); this.audio.cash(); };
    } else if (atFuel && a.fuel < a.fuelMax(mods) * 0.98) {
      const cost = Math.ceil((a.fuelMax(mods) - a.fuel) * PRICES.fuel);
      prompt = still ? `F : faire le plein (${cost} €)` : 'Arrête-toi pour faire le plein';
      if (still) act = () => { if (e.spend(cost)) { a.fuel = a.fuelMax(mods); this.toast(`Plein fait : −${cost} €`, 'ok'); this.audio.cash(); } else this.toast('Fonds insuffisants', 'warn'); };
    } else if (atWork && (a.damage > 0.01 || a.dead)) {
      const cost = Math.ceil(a.damage * PRICES.repairPerPoint);
      prompt = still ? `F : réparer l'engin (${cost} €)` : "Arrête-toi pour réparer";
      if (still) act = () => { if (e.spend(cost)) { a.damage = 0; a.dead = ''; this.toast(`Réparation faite : −${cost} €`, 'ok'); this.audio.chime(); } else this.toast('Fonds insuffisants', 'warn'); };
    } else if (dist(here, z.kiosk) < z.kiosk.r) {
      prompt = `F : tir de mine (${PRICES.blast} €) · engins à plus de 35 m du front`;
      act = () => this.blast();
    } else {
      const near = this.fleet().filter((m) => m !== a).sort((p, q) => dist(p, a) - dist(q, a))[0];
      if (near && dist(near, a) < 16) { prompt = `F : passer dans ${near.s.short}`; act = () => this.switchTo(near.id); }
    }
    if (inp.interact && act) act();
    return prompt;
  }
  blast() {
    const t = this.terrain, e = this.economy;
    let best = null, bv = 0;
    for (const s of BLAST_SITES) { const v = t.solidAbove(s.x0, s.x0 + s.depth, s.cz - s.halfW, s.cz + s.halfW, s.floor + 0.4); if (v > bv) { bv = v; best = s; } }
    if (!best || bv < 250) { this.toast('Plus de roche à abattre sur les fronts balisés', 'warn'); return; }
    for (const m of this.fleet()) {
      const dx = Math.max(best.x0 - 12 - m.x, 0, m.x - (best.x0 + best.depth)), dz = Math.max(Math.abs(m.z - best.cz) - best.halfW, 0);
      if (Math.hypot(dx, dz) < 35) { this.toast(`Zone non dégagée : ${m.s.short} à moins de 35 m du front`, 'bad'); this.audio.warn(); return; }
    }
    if (!e.spend(PRICES.blast)) { this.toast('Fonds insuffisants', 'warn'); return; }
    this.audio.siren(2); this.pendingBlast = { site: best, t: 2.6 }; this.toast('Tir dans 3 secondes… ', 'warn');
  }
  doBlast(site) {
    const vol = this.terrain.blast(site); this.economy.d.blasts++; this.economy.addXp(25);
    this.audio.blast(); this.rig.shake = 0.7; this.dust.emit(site.x0 - 2, this.terrain.height(site.x0 - 3, site.cz) + 2, site.cz, 80, site.halfW * 1.2, 5);
    this.toast(`Tir de mine : ${Math.round(vol * 1.25)} m³ de roche abattue au pied du front`, 'ok');
  }
  // --- boucle -----------------------------------------------------------------------------------------
  step(dt) {
    const inp = readInput(this.active.id);
    if (inp.menu) { this.menu.toggle(); if (!this.menu.open) this.started = true; }
    if (inp.map) this.hud.toggleMap(); if (inp.help) this.hud.toggleHelp();
    if (this.menu.open) { this.audio.update({ paused: true }); this.renderer.render(this.scene, this.camera); return; }
    this.started = true; this.time += dt;
    const a = this.active, mods = this.mods;
    if (inp.switch) { const f = this.fleet(); if (Math.abs(inp.switch) === 99) this.switchTo(f[(f.indexOf(a) + (inp.switch > 0 ? 1 : f.length - 1)) % f.length].id); else { const id = Object.values(SPECS).find((s) => s.key === inp.switch)?.id; if (id) this.switchTo(id); } }
    const A = this.active;
    if (inp.view) this.rig.toggle();
    if (inp.lights) A.lights = !A.lights; if (inp.beacon) A.beacon = !A.beacon;
    if (inp.reset) { const [x, z, h] = SPAWN[A.id]; Object.assign(A, { x, z, h, speed: 0 }); this.toast('Engin replacé à son poste', ''); }
    this.env.update(dt, A, this.camera.position, this.timeSpeed);
    const night = this.env.night; this.site.setNight(night);
    for (const m of this.world.machines) if (m.ai) m.lights = night > 0.3; else if (m !== A && night > 0.5 && m.lightsAuto === undefined) m.lightsAuto = true;
    // physique, outils
    const events = { dig: 0, pour: 0, push: 0 };
    for (this.acc += dt; this.acc >= STEP; this.acc -= STEP) {
      for (const m of this.world.machines) {
        if (m.ai) continue;
        m.fuelMaxCached = m.fuelMax(mods);
        const ctl = m === A ? { ...inp, drive: inp.drive, brake: inp.drive * m.speed < -0.05 ? 1 : 0 } : IDLE;
        m.update(STEP, ctl, this.world, mods);
        if (m === A && m.impact > 2.5) { this.audio.thud(m.impact * 0.4); this.rig.shake = Math.min(0.4, 0.05 * m.impact); if (m.damage >= 1 && !m.dead) { m.dead = 'Hors service : atelier'; this.toast(`${m.s.short} hors service : va à l'atelier`, 'bad'); } }
        const mdl = this.models.get(m); if (!mdl) continue;
        const tip = new THREE.Vector3(), pour = new THREE.Vector3(); mdl.tip.getWorldPosition(tip); mdl.pour.getWorldPosition(pour);   // ancres de l'image précédente
        const ev = work(this.world, m, tip, pour, STEP, mods);
        events.dig += ev.dig; events.pour += ev.pour; events.push += ev.push;
        if (m === A) { if (ev.dig > 0) this.dust.emit(tip.x, tip.y + 0.2, tip.z, 1, 1.2); if (ev.pour > 0) this.dust.emit(pour.x, pour.y - 0.5, pour.z, 2, 1.4, 0.6); if (ev.push > 0) this.dust.emit(tip.x, tip.y + 0.3, tip.z, 1, 2.4); }
        if (m.fuel <= 0 && !m.dead && m === A) { m.dead = ''; this.toast('Panne sèche ! Station-service : F', 'bad'); this.audio.warn(); }
      }
    }
    // concasseur, terrain, clients, commandes
    const q = this.plant.update(dt, this.terrain, this.plant.mul ?? 1); this.economy.d.crushed += q;
    this.terrain.relax(2500); this.meshT -= dt; if (this.meshT <= 0) { this.meshT = 0.12; this.tmesh.update(); }
    this.site.update(dt, this.plant.running);
    this.customers.update(dt, mods);
    for (const o of this.orders.update(dt, this.economy.gradeIndex)) { this.toast(`${o.client} : commande en retard, prime réduite`, 'warn'); this.audio.warn(); }
    this.syncModels();
    for (const m of this.world.machines) {   // modèles : une mise à jour par image
      const mdl = this.models.get(m); if (!mdl) continue;
      mdl.update(m, dt, this.time, night, m === A && this.rig.cabin); mdl.root.updateMatrixWorld(true);
    }
    if (this.pendingBlast) { this.pendingBlast.t -= dt; if (this.pendingBlast.t <= 0) { this.doBlast(this.pendingBlast.site); this.pendingBlast = null; } }
    this.dust.update(dt);
    // caméra, interface, son
    this.rig.follow3(dt, A, this.models.get(A), inp.camX);
    const prompt = this.interactions(inp);
    this.hud.update({ prompt, dt, hand: inp.hand }); this.tuto.update(inp);
    const hop = { x: (PLANT.hopper.x0 + PLANT.hopper.x1) / 2, z: 0 };
    this.audio.update({ speed: A.speed, thr: A.thr, horn: inp.horn, tool: Math.min(1, A.toolSpeed), dig: events.dig, pour: events.pour + events.push * 0.3, rain: this.env.rain, reversing: A.speed < -0.3, running: A.running, kind: A.s.type, crusher: this.plant.running ? Math.max(0, 1 - dist(A, hop) / 95) : 0 });
    this.saveT += dt; if (this.saveT > 25) { this.saveT = 0; this.save(); }
    this.renderer.render(this.scene, this.camera);
  }
}

window.game = new Game();
window.GameLoader?.ready();
