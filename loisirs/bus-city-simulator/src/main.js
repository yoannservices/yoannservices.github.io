import * as THREE from 'three';
import { patch } from "../../../assets/perf.js";
patch({ WebGLRenderer: THREE.WebGLRenderer });
import { Vehicle } from './bus/Vehicle.js';
import { City } from './city/City.js';
import { TrafficLights } from './city/TrafficLights.js';
import { BUS_START, CHARGERS, nodes } from './city/grid.js';
import { Traffic } from './traffic/Traffic.js';
import { Pedestrians } from './traffic/Pedestrians.js';
import { StopCrowd } from './passengers/StopCrowd.js';
import { Economy } from './economy/Economy.js';
import { Rules } from './economy/Rules.js';
import { Service } from './lines/Service.js';
import { Events } from './events/Events.js';
import { Environment } from './world/Environment.js';
import { GameAudio } from './audio/audio.js';
import { CameraRig } from './camera.js';
import { readInput } from './input.js';
import { Hud } from './ui/Hud.js';
import { Menu } from './ui/Menu.js';

const STEP = 1 / 120;

class Game {
  constructor() {
    const canvas = document.getElementById('scene');
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    this.renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(60, 1, 0.1, 1500);
    this.time = 0; this.acc = 0; this.paused = false; this.saveT = 0;
    this.ctl = { indicator: 0, braking: false, handbrake: false, time: 0, prompt: '' };

    this.economy = new Economy();
    this.audio = new GameAudio();
    this.city = new City(this.scene, this.renderer);
    this.env = new Environment(this.scene, this.city, this.economy.d.hours);
    this.lights = new TrafficLights(this.scene);
    this.traffic = new Traffic(this.scene);
    this.peds = new Pedestrians(this.scene);
    this.crowd = new StopCrowd(this.scene);
    this.rig = new CameraRig(this.camera);
    this.vehicle = null;
    this.busCircles = [];
    this.busInfo = { x: 0, z: 0, circles: [], nodes: [] };
    this.switchBus(this.economy.d.bus, false);
    this.service = new Service(this);
    this.rules = new Rules(this);
    this.events = new Events(this);
    this.hud = new Hud(this);
    this.menu = new Menu(this);
    this.economy.onLevel = (l) => { this.toast(`Niveau ${l} atteint ! Nouveaux quartiers et véhicules débloqués`, 'ok'); this.audio.chime(); this.economy.save(); };
    this.markers();
    this.traffic.init(this.vehicle.phys);

    addEventListener('resize', () => this.resize());
    addEventListener('pointerdown', () => this.audio.unlock());
    addEventListener('keydown', () => this.audio.unlock());
    addEventListener('beforeunload', () => this.save());
    this.resize();
    this.menu.toggle(true);
    this.last = performance.now();
    this.renderer.setAnimationLoop((now) => {
      const dt = Math.min((now - this.last) / 1000, 0.1);
      this.last = now;
      this.step(dt);
    });
  }

  resize() {
    this.renderer.setSize(innerWidth, innerHeight, false);
    this.camera.aspect = innerWidth / innerHeight;
    this.camera.updateProjectionMatrix();
  }
  toast(msg, kind) { this.hud?.toast(msg, kind); }

  fine(amount, reason, sat) {
    const e = this.economy;
    e.addMoney(-amount); e.d.fines++; e.d.finesTotal += amount;
    if (sat) this.service.sat(-sat);
    this.toast(`Amende ${amount} € : ${reason}`, 'bad');
  }

  switchBus(id, atDepot = true) {
    const e = this.economy;
    if (this.vehicle) { e.d.energy[this.vehicle.id] = this.vehicle.energy; this.vehicle.dispose(); this.service?.end(); }
    this.vehicle = new Vehicle(id, this.scene, e.d.energy[id] ?? 1);
    this.vehicle.place(BUS_START.x, BUS_START.z, BUS_START.heading);
    e.d.bus = id;
    if (this.service) { this.service.onboard = 0; this.service.doorsOpen = false; this.service.satisfaction = 100; }
    this.rig.update(1, this.vehicle);
    if (atDepot) { e.save(); this.toast(`${this.vehicle.stats.name} prêt au dépôt`, 'ok'); }
  }

  save() {
    const e = this.economy;
    e.d.hours = this.env.hours; e.d.energy[this.vehicle.id] = this.vehicle.energy;
    e.save();
  }

  // balise de l'arrêt courant : zone au sol + faisceau
  markers() {
    const beam = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.1, 14, 16, 1, true), new THREE.MeshBasicMaterial({ color: '#7fd1ff', transparent: true, opacity: 0.25, side: THREE.DoubleSide, depthWrite: false }));
    const zone = new THREE.Mesh(new THREE.PlaneGeometry(16, 3.4).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: '#3ddc84', transparent: true, opacity: 0.35, depthWrite: false }));
    beam.visible = zone.visible = false;
    this.scene.add(beam, zone);
    this.marker = { beam, zone };
  }
  updateMarkers() {
    const s = this.service, { beam, zone } = this.marker;
    beam.visible = zone.visible = s.active;
    if (!s.active) return;
    const st = s.stop;
    beam.position.set(st.shelter.x, 7, st.shelter.z);
    zone.position.set(st.x, 0.06, st.z); zone.rotation.y = st.axis === 'x' ? 0 : Math.PI / 2;
    zone.material.color.set(s.inZone().ok ? '#3ddc84' : '#ffb000');
    beam.material.opacity = 0.18 + 0.1 * Math.sin(this.time * 4);
  }

  collide() {
    const p = this.vehicle.phys, col = this.city.col;
    const pts = p.collisionPoints();
    let sx = 0, sz = 0, impact = 0;
    for (const c of pts) {
      const r = col.resolve(c.x + sx, c.z + sz, c.r);
      if (!r.hit) continue;
      sx += r.px; sz += r.pz;
      const m = Math.hypot(r.px, r.pz) || 1, nx = r.px / m, nz = r.pz / m, vn = p.vx * nx + p.vz * nz;
      if (vn < 0) { impact = Math.max(impact, -vn); p.vx -= vn * nx * 1.3; p.vz -= vn * nz * 1.3; }
    }
    // voitures : cercle unique par voiture
    for (const car of this.traffic.cars) {
      if (!car.active || Math.abs(car.x - p.x) > 30 || Math.abs(car.z - p.z) > 30) continue;
      for (const c of pts) {
        const dx = c.x + sx - car.x, dz = c.z + sz - car.z, d = Math.hypot(dx, dz), rr = c.r + 1.7;
        if (d >= rr) continue;
        const nx = dx / (d || 1), nz = dz / (d || 1), vn = p.vx * nx + p.vz * nz;
        sx += nx * (rr - d); sz += nz * (rr - d);
        if (vn < 0) { impact = Math.max(impact, -vn); p.vx -= vn * nx * 1.3; p.vz -= vn * nz * 1.3; }
        car.v = 0;
      }
    }
    if (sx || sz) {
      p.x += sx; p.z += sz;
      p.speed = p.vx * Math.sin(p.heading) + p.vz * Math.cos(p.heading);
      if (impact > 0) this.rules.collision(impact);
    }
    this.busCircles = pts.map((c) => ({ x: c.x + sx, z: c.z + sz, r: c.r }));
  }

  // carrefours occupés par le bus (pour que les voitures lui laissent la place)
  busNodes() {
    const out = [], seen = new Set();
    for (const c of this.busCircles) {
      const i = Math.round(c.x / 100 + 4.5), j = Math.round(c.z / 100 + 4.5);
      if (i < 0 || j < 0 || i > 9 || j > 9) continue;
      const idx = i * 10 + j, n = nodes[idx];
      if (seen.has(idx) || Math.abs(c.x - n.x) > 8 || Math.abs(c.z - n.z) > 8) continue;
      seen.add(idx);
      const p = this.vehicle.phys, fx = Math.sin(p.heading), fz = Math.cos(p.heading);
      out.push({ idx, k: Math.abs(fx) > Math.abs(fz) ? (fx > 0 ? 0 : 2) : (fz > 0 ? 1 : 3) });
    }
    return out;
  }

  step(dt) {
    const inp = readInput();
    if (inp.menu) this.menu.toggle();
    if (inp.map) this.hud.toggleMap();
    if (inp.toggleHelp) this.hud.toggleHelp();
    this.paused = this.menu.open;
    const v = this.vehicle, p = v.phys, c = this.ctl;
    if (this.paused) { this.audio.update({ speed: 0, throttle: 0, electric: false, rain: 0, horn: false, paused: true }); this.rig.update(dt, v); this.renderer.render(this.scene, this.camera); return; }

    this.time += dt; c.time += dt;
    if (inp.toggleView) this.rig.toggle();
    if (inp.toggleLights) { v.lights = !v.lights; v.model.setLights(v.lights); }
    if (inp.indicatorLeft) c.indicator = c.indicator > 0 ? 0 : 1;
    if (inp.indicatorRight) c.indicator = c.indicator < 0 ? 0 : -1;
    if (c.indicator && Math.abs(p.steer) > 0.12 && Math.sign(p.steer) === c.indicator) c.armed = true;
    if (c.armed && Math.abs(p.steer) < 0.03) { c.indicator = 0; c.armed = false; }
    if (inp.doors) this.service.toggleDoors();
    if (inp.ramp) this.service.toggleRamp();
    if (inp.skip) this.service.skipStop();
    if ((Math.floor(c.time * 3) % 2 === 0) !== c.blink) { c.blink = !c.blink; if (c.indicator && c.blink) this.audio.tick(); }

    p.grip = this.env.grip;
    p.canDrive = v.energy > 0 && !(this.events.current?.type === 'breakdown');
    for (this.acc += dt; this.acc >= STEP; this.acc -= STEP) p.update(STEP, inp);
    this.collide();
    v.burn(dt);
    this.energyLogic(dt);

    c.handbrake = inp.handbrake;
    c.braking = (inp.brake > 0 && p.speed > 0.5) || inp.handbrake;
    v.model.update(p, dt, c);
    this.rig.update(dt, v);

    this.env.update(dt, p, this.camera.position);
    this.lights.update(this.time);
    this.busInfo = { x: p.x, z: p.z, circles: this.busCircles, nodes: this.busNodes() };
    this.peds.update(dt, this.time, p);
    this.traffic.update(dt, { t: this.time, bus: this.busInfo, peds: this.peds.crossing });
    this.rules.update(dt);
    this.service.update(dt);
    this.events.update(dt);
    this.updateMarkers();

    c.prompt = this.chargePrompt ?? '';
    this.hud.update(c);
    this.audio.update({ speed: p.speed, throttle: p.thr, electric: !!v.stats.electric, rain: this.env.rain, horn: inp.horn });
    this.saveT += dt;
    if (this.saveT > 15) { this.saveT = 0; this.save(); }
    this.renderer.render(this.scene, this.camera);
  }

  // recharge / plein aux bornes, avertissements, remorquage si panne sèche
  energyLogic(dt) {
    const v = this.vehicle, p = v.phys, r = p.refPoint(), e = this.economy;
    this.chargePrompt = '';
    const at = CHARGERS.find((c) => Math.hypot(c.x - r.x, c.z - r.z) < 7);
    if (at && Math.abs(p.speed) < 0.6 && v.energy < 1) {
      const rate = 0.05 * dt;
      v.energy = Math.min(1, v.energy + rate);
      e.addMoney(-rate * (v.stats.electric ? 50 : 120));
      this.chargePrompt = v.stats.electric ? '⚡ Recharge en cours…' : '⛽ Plein en cours…';
    } else if (at && v.energy < 0.3) this.chargePrompt = 'Arrêtez-vous pour faire le plein';
    if (v.energy < 0.15 && !this.lowWarned) { this.lowWarned = true; this.toast(v.stats.electric ? 'Batterie faible : rejoignez une borne ⚡' : 'Réservoir presque vide : rejoignez une station ⛽', 'warn'); }
    if (v.energy > 0.3) this.lowWarned = false;
    if (v.energy <= 0) {
      this.dead = (this.dead ?? 0) + dt;
      if (this.dead > 25) {
        this.dead = 0; v.energy = 0.6; v.place(BUS_START.x, BUS_START.z, BUS_START.heading);
        this.fine(300, 'Remorquage : panne d\'énergie', 0); this.service.end();
      }
    } else this.dead = 0;
  }
}

window.game = new Game();
