// Pompiers 18 : boucle de jeu. Ville et circulation reprises de bus-city-simulator ; FPT, VSAV, maison en feu, lance, ARI,
// victimes, équipiers IA, carrière et réglages graphiques propres au jeu.
import * as THREE from 'three';
import { patch } from '../../../assets/perf.js';
patch(THREE);
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { City } from './city/City.js';
import { TrafficLights } from './city/TrafficLights.js';
import { nodes, TRUCK_START, VSAV_START, EPA_START, PLAYER_START, HYDRANTS, MISSION_LOTS, IMMEUBLE_LOTS, CASERNE } from './city/grid.js';
import { Traffic } from './traffic/Traffic.js';
import { Pedestrians } from './traffic/Pedestrians.js';
import { Truck, FPT, VSAV, EPA } from './truck/Truck.js';
import { W as BW, D as BD, H as BH } from './fire/Building.js';
import { Building } from './fire/Building.js';
import { Effects } from './fire/Effects.js';
import { AMBIENT } from './fire/FireSim.js';
import { Player, ARI_AIR } from './firefighter/Player.js';
import { Crew } from './firefighter/Crew.js';
import { LANCE, HYDRANT_LPM } from './firefighter/water.js';
import { Mission } from './mission/Mission.js';
import { Economy } from './economy/Economy.js';
import { Rules } from './economy/Rules.js';
import { Environment } from './world/Environment.js';
import { GameAudio } from './audio/audio.js';
import { CameraRig } from './camera.js';
import { readInput, bindMouse } from './input.js';
import { Hud } from './ui/Hud.js';
import { Menu } from './ui/Menu.js';
import { get } from './settings.js';
import { Route } from './nav/Route.js';
import { Picker } from './ui/Picker.js';

const STEP = 1 / 120;
const dist = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);

// ciel en dégradé (zénith plus foncé que l'horizon), suit la caméra
function skyDome() {
  const m = new THREE.Mesh(new THREE.SphereGeometry(900, 32, 16), new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false, fog: false,
    uniforms: { top: { value: new THREE.Color('#3d78c9') }, bottom: { value: new THREE.Color('#9cc7ea') } },
    vertexShader: 'varying vec3 v; void main(){ v = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
    fragmentShader: 'uniform vec3 top; uniform vec3 bottom; varying vec3 v; void main(){ float h = clamp(v.y * 1.6, 0.0, 1.0); gl_FragColor = vec4(mix(bottom, top, pow(h, 0.7)), 1.0); }',
  }));
  m.renderOrder = -10; m.frustumCulled = false; m.userData.noLod = true;
  return m;
}

class Game {
  constructor() {
    const canvas = document.getElementById('scene');
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    this.renderer.shadowMap.enabled = true; this.renderer.shadowMap.type = THREE.PCFShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping; this.renderer.toneMappingExposure = 1.1;
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(65, 1, 0.1, 1500);   // near 0,1 : précision de profondeur (z-fighting au loin avec 0,05)
    this.scene.add(this.camera);
    const pm = new THREE.PMREMGenerator(this.renderer); this.envTex = pm.fromScene(new RoomEnvironment(), 0.04).texture; pm.dispose();
    this.sky = skyDome(); this.scene.add(this.sky);
    this.time = 0; this.acc = 0; this.saveT = 0; this.airBeep = 0; this.started = false;

    this.economy = new Economy();
    this.audio = new GameAudio();
    this.city = new City(this.scene, this.renderer);
    this.env = new Environment(this.scene, this.city, 9);
    this.lightsTL = new TrafficLights(this.scene);
    this.traffic = new Traffic(this.scene, 60);
    this.peds = new Pedestrians(this.scene);
    this.houses = MISSION_LOTS.map((l) => new Building(this.scene, l, this.city.col));
    this.immeubles = IMMEUBLE_LOTS.map((l) => new Building(this.scene, l, this.city.col, 3));
    this.buildings = [...this.houses, ...this.immeubles];
    this.truck = new Truck(this.scene, FPT); this.truck.place(TRUCK_START.x, TRUCK_START.z, TRUCK_START.heading);
    this.vsav = new Truck(this.scene, VSAV); this.vsav.place(VSAV_START.x, VSAV_START.z, VSAV_START.heading);
    this.epa = new Truck(this.scene, EPA); this.epa.place(EPA_START.x, EPA_START.z, EPA_START.heading);
    this.vehicles = [this.truck, this.vsav, this.epa]; this.driving = null; this.carried = null; this.ladderOp = null;
    this.player = new Player(this.scene); this.player.place(PLAYER_START.x, PLAYER_START.z, 0);
    this.camera.add(this.player.nozzle); this.player.nozzle.position.set(0.2, -0.24, -0.62); this.player.nozzle.scale.setScalar(0.55);
    this.fx = new Effects(this.scene);
    this.route = new Route(this.scene);
    this.picker = new Picker(this.scene);
    this.rig = new CameraRig(this.camera); this.rig.bind(canvas, () => !!this.driving || !!this.ladderOp);
    bindMouse(canvas);
    canvas.addEventListener('click', () => { if (!this.driving && !this.ladderOp && !this.menu.open) canvas.requestPointerLock?.()?.catch?.(() => {}); });
    this.crew = new Crew(this.scene, this);
    this.mission = new Mission(this);
    this.rules = new Rules(this);
    this.hud = new Hud(this);
    this.menu = new Menu(this);
    this.economy.onGrade = (g) => { this.toast(`Promotion : ${g} !`, 'ok'); this.audio.chime(); };
    this.applyUpgrades(); this.applyGfx();
    this.crew.dismount(this.truck);
    this.circles = []; this.drivingCircles = [];
    this.traffic.init(this.truck.phys);

    addEventListener('resize', () => this.resize());
    addEventListener('pointerdown', () => this.audio.unlock());
    addEventListener('keydown', () => this.audio.unlock());
    addEventListener('beforeunload', () => this.economy.save());
    this.resize();
    this.menu.toggle(true);
    this.last = performance.now();
    this.renderer.setAnimationLoop((now) => { const dt = Math.min((now - this.last) / 1000, 0.1); this.last = now; this.step(dt); });
  }

  resize() { this.renderer.setSize(innerWidth, innerHeight, false); this.camera.aspect = innerWidth / innerHeight; this.camera.updateProjectionMatrix(); }
  toast(msg, kind) { this.hud?.toast(msg, kind); }
  get inTruck() { return !!this.driving; }
  get focus() { return this.driving ? this.driving.phys : this.player; }
  infraction(amount, reason) { this.mission.fines += amount; this.economy.addMoney(-amount); this.toast(`−${amount} € : ${reason}`, 'bad'); }
  applyUpgrades() {
    const up = this.economy.d.up;
    this.player.airMax = ARI_AIR * (up.ari ? 1.5 : 1); this.player.air = Math.min(this.player.air, this.player.airMax);
    this.jetFlow = up.ldv ? 1000 : LANCE.jet.flow;
  }
  // réglages graphiques applicables sans recharger
  applyGfx() {
    this.renderer.setPixelRatio(Math.min(devicePixelRatio, get('pixel')));
    this.scene.environment = get('env') ? this.envTex : null; this.scene.environmentIntensity = 0.35;
    this.traffic.limit = get('traffic');
  }
  nearBuilding(p) { return this.buildings.find((b) => b.near(p.x, p.z, 8)) ?? null; }

  // --- engins -------------------------------------------------------------------------------------
  collide(veh) {
    const p = veh.phys, col = this.city.col, pts = p.collisionPoints();
    let sx = 0, sz = 0, impact = 0;
    const push = (nx, nz, depth) => { sx += nx * depth; sz += nz * depth; const vn = p.vx * nx + p.vz * nz; if (vn < 0) { impact = Math.max(impact, -vn); p.vx -= vn * nx * 1.3; p.vz -= vn * nz * 1.3; } };
    for (const c of pts) { const r = col.resolve(c.x + sx, c.z + sz, c.r); if (r.hit) { const m = Math.hypot(r.px, r.pz) || 1; push(r.px / m, r.pz / m, m); } }
    // voitures (emprise réelle, décalage vers le trottoir compris) et autres engins contre la boîte calée sur le modèle de cet engin
    const others = [...this.traffic.cars.filter((c) => c.active && Math.abs(c.x - p.x) < 30 && Math.abs(c.z - p.z) < 30).flatMap((c) => this.traffic.footprint(c).map((q) => ({ ...q, car: c }))),
      ...this.vehicles.filter((v) => v !== veh).flatMap((v) => v.phys.collisionPoints())];
    const hitBox = (o) => {   // cercle o contre la boîte de veh (déjà déplacée de sx, sz) : pousse l'engin à l'opposé
      const ox = o.x - sx, oz = o.z - sz, r = veh.pushOut(ox, oz, o.r);
      if (!r.hit) return false;
      const dx = ox - r.x, dz = oz - r.z, d = Math.hypot(dx, dz);
      if (d > 1e-4) push(dx / d, dz / d, d);
      return true;
    };
    for (const o of others) if (hitBox(o) && o.car) o.car.v = 0;
    for (const v of this.vehicles) if (v !== veh) for (const c of pts) {   // coins de cet engin contre la boîte de l'autre
      const r = v.pushOut(c.x + sx, c.z + sz, c.r);
      if (r.hit) { const dx = r.x - c.x - sx, dz = r.z - c.z - sz, d = Math.hypot(dx, dz); if (d > 1e-4) push(dx / d, dz / d, d); }
    }
    if (sx || sz) { p.x += sx; p.z += sz; p.speed = p.vx * Math.sin(p.heading) + p.vz * Math.cos(p.heading); if (impact > 0) this.rules.collision(impact); }
  }
  vehNodes() {
    const out = [], seen = new Set();
    for (const v of this.vehicles) {
      const p = v.phys, fx = Math.sin(p.heading), fz = Math.cos(p.heading);
      for (const c of p.collisionPoints()) {
        const i = Math.round(c.x / 100 + 4.5), j = Math.round(c.z / 100 + 4.5);
        if (i < 0 || j < 0 || i > 9 || j > 9) continue;
        const idx = i * 10 + j, n = nodes[idx];
        if (seen.has(idx) || Math.abs(c.x - n.x) > 8 || Math.abs(c.z - n.z) > 8) continue;
        seen.add(idx); out.push({ idx, k: Math.abs(fx) > Math.abs(fz) ? (fx > 0 ? 0 : 2) : (fz > 0 ? 1 : 3) });
      }
    }
    return out;
  }

  driveStep(dt, inp) {
    const veh = this.driving, p = veh.phys;
    if (inp.siren) { veh.setSiren(!veh.siren); this.toast(veh.siren ? 'Sirène deux-tons et gyrophares' : 'Sirène coupée', ''); }
    if (inp.toggleView) this.rig.toggle();
    if (inp.reset) { const h = Math.round(p.heading / (Math.PI / 2)) * (Math.PI / 2); veh.place(p.x, p.z, h); }
    for (this.acc += dt; this.acc >= STEP; this.acc -= STEP) p.update(STEP, inp);
    this.collide(veh);
    this.rules.update(dt);
    this.rig.truck(dt, veh);
    if (inp.interact) {
      if (Math.abs(p.speed) > 1) this.toast('Arrête l\'engin pour descendre', 'warn');
      else { const d = veh.cabDoor(); this.player.place(d.x, d.z, p.heading); this.driving = null; this.crew.dismount(veh); this.renderer.domElement.requestPointerLock?.()?.catch?.(() => {}); }
    }
    return '';
  }

  // --- grande échelle (EPA en station) ----------------------------------------------------------
  ladderStep(dt, inp) {
    const veh = this.ladderOp, lad = veh.ladder, m = this.mission;
    const collide = (p) => this.buildings.some((b) => { const lx = p.x - b.ox, lz = p.z - b.oz; return Math.abs(lx) < BW / 2 + 0.5 && Math.abs(lz) < BD / 2 + 0.5 && p.y < b.floors * BH + 1.2; });
    if (inp.reset) lad.stow();
    lad.control(dt, { yaw: -inp.strafe, pitch: inp.fwd, ext: inp.extend }, collide);
    if (inp.toggleView) this.basketView = !this.basketView;
    this.rig.ladder(dt, lad, this.basketView);
    const tip = lad.tipWorld(), dir = lad.dirWorld();
    // lance canon de la nacelle, alimentée par le FPT
    let water = 0;
    if (inp.spray && lad.deployed) {
      if (dist(this.truck.phys, veh.phys) > 60) { if (!this.feedWarn) { this.feedWarn = true; this.toast('Lance canon sans eau : le FPT doit être à moins de 60 m de l\'EPA', 'warn'); } }
      else {
        const litres = this.truck.water.draw(1000, dt);
        if (litres > 0) {
          water = 1;
          this.fx.emit({ x: tip.x + dir.x * 0.9, y: tip.y + 0.3, z: tip.z + dir.z * 0.9 }, { x: dir.x, y: -0.12, z: dir.z }, 14, false, dt);
          const b = m.building;
          if (b?.sim) {
            let best = null, bd = 9;
            for (const w of b.windows) { const p = w.mesh.getWorldPosition(new THREE.Vector3()), dx = p.x - tip.x, dz = p.z - tip.z, d = Math.hypot(dx, dz, p.y - tip.y); if (d < bd && dx * dir.x + dz * dir.z > 0) { bd = d; best = w; } }
            if (best) { if (!best.broken) b.openWindow(best); b.sim.applyWater(best.room, litres * 0.8, 'jet'); }
          }
        }
      }
    } else this.feedWarn = false;
    this.view = { smoke: 0, heat: 0, water };
    // victimes au balcon : montent dans la nacelle, descendent au sol
    const near = m.victims.find((v) => v.state === 'waiting' && v.standing && Math.hypot(v.x - tip.x, v.z - tip.z, v.y + 1 - tip.y) < 2.4);
    const low = lad.heightAboveGround() < 3;
    let prompt;
    if (near && lad.load.length < 2) prompt = 'F : faire monter la victime dans la nacelle';
    else if (lad.load.length && low) prompt = `F : faire descendre ${lad.load.length > 1 ? 'les victimes' : 'la victime'} (ambulance du SAMU)`;
    else if (!lad.deployed) prompt = lad.stowing ? 'Repli de l\'échelle…' : 'Mise en station : stabilisateurs en cours…';
    else if (lad.blocked && (inp.fwd || inp.strafe || inp.extend)) prompt = 'Nacelle contre le bâtiment ou le sol : tourne l’échelle (Q/D) ou rentre-la (A)';
    else prompt = `Nacelle ${Math.round(lad.heightAboveGround())} m · ${Math.round(lad.ext)} m déployés${lad.load.length ? ` · ${lad.load.length} victime(s) à bord` : ''} · F : quitter les commandes`;
    if (inp.interact) {
      if (near && lad.load.length < 2) { near.carry(); lad.load.push(near); this.toast('Victime dans la nacelle : redescends-la au sol', 'ok'); }
      else if (lad.load.length && low) {
        for (const [k, v] of lad.load.entries()) { v.drop(tip.x + dir.z * (k + 1), tip.z - dir.x * (k + 1), 0, 0); if (!m.trySave(v, 'Tu', 40)) this.toast('Victime posée au sol', ''); }   // le SAMU vient la chercher au pied de l'échelle
        lad.load = [];
      } else { this.ladderOp = null; const r = veh.rearPoint(); this.player.place(r.x, r.z, veh.phys.heading + Math.PI); }
    }
    return prompt;
  }

  // --- à pied -------------------------------------------------------------------------------------
  footStep(dt, inp) {
    const pl = this.player, tr = this.truck, m = this.mission, b = this.nearBuilding(pl);
    pl.slow = this.carried ? 0.6 : 1;
    pl.update(dt, inp, { col: this.city.col, building: b });
    for (const v of this.vehicles) { const o = v.pushOut(pl.x, pl.z, 0.3); pl.x = o.x; pl.z = o.z; }   // engins = boîtes calées sur le vrai modèle
    this.rig.foot(pl);
    if (this.carried) { const v = this.carried; v.x = pl.x; v.z = pl.z; v.y = pl.y; v.floor = pl.floor; }

    // engin visé (flèche) ; conseil de l'alerte : FPT (feu), VSAV (secours à personne), EPA (immeuble)
    const hint = m.state === 'alerte' ? { feu: tr, sap: this.vsav, immeuble: this.epa }[m.type] : null;
    this.pickTarget = this.picker.update(this.time, this.vehicles, pl, hint, !this.carried);
    // interactions (F)
    let prompt = '', act = null;
    const door = b ? b.nearestDoor(pl.x, pl.z, pl.floor) : null;
    const vic = this.carried ? null : m.victims.find((v) => v.state === 'waiting' && v.floor === pl.floor && Math.hypot(v.x - pl.x, v.z - pl.z) < 1.4);
    const hyd = HYDRANTS.find((h) => dist(h, pl) < 1.8);
    const vsavRear = this.vsav.rearPoint();
    if (this.carried) {
      if (m.type === 'sap' && dist(vsavRear, pl) < 3) { prompt = 'F : charger la victime dans le VSAV'; act = () => { m.loadVsav(); this.carried = null; }; }
      else { prompt = 'F : poser la victime' + (m.ambPos ? ' (près de l\'ambulance pour la confier au SAMU)' : ''); act = () => { const v = this.carried; this.carried = null; v.drop(pl.x + Math.sin(pl.yaw) * 0.8, pl.z + Math.cos(pl.yaw) * 0.8, pl.y, pl.floor); m.trySave(v); }; }
    } else if (vic && m.type === 'sap' && !vic.checked) {
      const k = m.bilan(dt, inp.interactHeld);
      prompt = k > 0 ? `Bilan en cours… ${Math.round(k * 100)} %` : 'Maintiens F : faire le bilan de la victime';
    } else if (vic) {
      if (pl.hose) prompt = 'Pose la lance (à l\'arrière du FPT) pour porter la victime';
      else if (m.type === 'sap' && dist(this.vsav.phys, vic) > 25) prompt = 'Approche le VSAV à moins de 25 m pour sortir le brancard';
      else { prompt = m.type === 'sap' ? 'F : installer sur le brancard' : 'F : porter la victime'; act = () => { vic.carry(); this.carried = vic; vic.found = true; }; }
    } else if (door) { prompt = `F : ${door.open ? 'fermer' : 'ouvrir'} la porte`; act = () => { b.setDoor(door, !door.open); this.audio.beep(door.open ? 240 : 160, 0.12, 'triangle', 0.08); }; }
    else if (dist(this.epa.rearPoint(), pl) < 2.8 && !pl.hose) {
      prompt = 'F : prendre les commandes de la grande échelle'; act = () => { this.ladderOp = this.epa; this.epa.ladder.wantDeploy = true; this.toast('Commandes de l\'échelle : Z/S lever · Q/D tourner · A/E rentrer/sortir · clic gauche lance canon · F victime · R replier', ''); document.exitPointerLock?.(); };
    } else if (dist(tr.rearPoint(), pl) < 2.8) {
      const rear = tr.rearPoint();
      if (!pl.hose) { prompt = `F : prendre la lance (tuyau de ${this.economy.hoseMax()} m)`; act = () => { pl.takeHose(rear, this.economy.hoseMax()); this.toast('Établissement : déroule le tuyau jusqu\'au feu. Clic gauche : arroser, clic droit : jet / diffusé.', ''); }; }
      else { prompt = 'F : ranger la lance'; act = () => pl.dropHose(); }
    } else {
      const cab = this.pickTarget;
      if (cab) {
        if (pl.hose) prompt = 'Range la lance à l\'arrière du FPT avant de partir';
        else if (cab.ladder && !cab.ladder.stowed) prompt = 'Replie la grande échelle avant de partir (commandes à l\'arrière, R)';
        else { prompt = `F : monter dans le ${cab.s.name}`; act = () => { this.driving = cab; this.crew.board(); document.exitPointerLock?.(); }; }
      } else if (hyd) {
        if (tr.water.hydrant && tr.water.hydrantAt === hyd) { prompt = 'F : débrancher le poteau'; act = () => { tr.water.hydrant = false; }; }
        else if (dist(hyd, tr.phys) < 25) { prompt = 'F : brancher le FPT sur le poteau incendie'; act = () => { tr.water.hydrant = true; tr.water.hydrantAt = hyd; this.toast('Poteau branché : la citerne se remplit à 1 000 L/min', 'ok'); }; }
        else prompt = 'Poteau incendie : approche le FPT à moins de 25 m pour le brancher';
      }
    }
    if (inp.interact && act) act();

    // lance
    let water = 0;
    const d = pl.dir;
    if (pl.hose && inp.spray && !this.carried) {
      const diffuse = pl.mode === 'diffuse', flow = diffuse ? LANCE.diffuse.flow : this.jetFlow, range = diffuse ? LANCE.diffuse.range : LANCE.jet.range * (flow > 500 ? 1.25 : 1);
      const litres = tr.water.draw(flow, dt);
      if (litres > 0) {
        water = 1;
        const hor = Math.hypot(d.x, d.z) || 1;
        if (b?.sim) {
          const r = b.spray(pl.x, pl.z, d.x / hor, d.z / hor, pl.floor, range * Math.max(0.3, Math.cos(d.y)));
          const own = b.roomAt(pl.x, pl.z, pl.floor);
          if (diffuse) { if (own >= 0) b.sim.applyWater(own, litres * 0.6, 'diffuse'); if (r.room >= 0) b.sim.applyWater(r.room, litres * (own >= 0 ? 0.4 : 1), 'diffuse'); }
          else if (r.room >= 0) b.sim.applyWater(r.room, litres, 'jet');
          if (r.wallRoom >= 0) b.sim.applyWater(r.wallRoom, litres * 0.5, 'jet');
        }
        const o = { x: pl.x + d.x * 0.6 - Math.cos(pl.yaw) * 0.22, y: pl.eyeY - 0.3 + d.y * 0.6, z: pl.z + d.z * 0.6 + Math.sin(pl.yaw) * 0.22 };
        this.fx.emit(o, d, diffuse ? LANCE.diffuse.range : LANCE.jet.range, diffuse, dt);
      } else if (!this.dryWarn) { this.dryWarn = true; this.toast('Citerne vide ! Branche le FPT sur un poteau incendie (rouge, à l\'angle des carrefours).', 'bad'); }
    }
    if (tr.water.level > 100) this.dryWarn = false;

    // ARI, fumée, chaleur
    let smoke = 0, heatT = AMBIENT;
    if (b?.sim && pl.inside) {
      const id = b.roomAt(pl.x, pl.z, pl.floor);
      smoke = b.smokeAt(pl.x, pl.z, pl.floor, pl.eyeY);
      if (id >= 0) heatT = b.sim.rooms[id].T * (pl.eyeY - pl.floor * 3 < 1.2 ? 0.7 : 1);
    }
    pl.breathe(dt, { masked: pl.inside, smoke, heatT, running: inp.run });
    if (pl.inside && pl.air / pl.airMax < 0.25) { this.airBeep -= dt; if (this.airBeep <= 0) { this.airBeep = 3; this.audio.lowAir(); } }
    if (pl.hp <= 0) {
      pl.dropHose(); if (this.carried) { this.carried.drop(pl.x, pl.z, pl.y, pl.floor); this.carried = null; }
      const c = tr.cabDoor(); pl.place(c.x, c.z, tr.phys.heading); pl.hp = 60; pl.air = pl.airMax;
      this.infraction(200, 'Chef d\'agrès évacué : chaleur ou fumée');
    }
    if (heatT > 160 && !this.heatHint) { this.heatHint = true; this.toast('Chaleur intense : accroupis-toi (X) et refroidis au diffusé (clic droit) avant d\'avancer', 'warn'); }
    this.view = { smoke, heat: Math.max(0, Math.min(0.6, (heatT - 90) / 300)), water };
    return prompt;
  }

  step(dt) {
    const inp = readInput();
    if (inp.menu) { this.menu.toggle(); if (!this.menu.open) this.started = true; }
    if (inp.map) this.hud.toggleMap();
    if (inp.help) this.hud.toggleHelp();
    if (this.menu.open) { this.audio.update({ speed: 0, throttle: 0, horn: false, paused: true }); this.renderer.render(this.scene, this.camera); return; }
    this.started = true;
    this.time += dt;
    const tr = this.truck;
    this.view = { smoke: 0, heat: 0, water: 0 };
    if (inp.order) this.crew.order(inp.order);
    for (const v of this.vehicles) if (v !== this.driving) { v.phys.vx = v.phys.vz = v.phys.speed = 0; }   // engins garés : immobiles
    if (this.driving || this.ladderOp) this.picker.root.visible = false;
    const prompt = this.ladderOp ? this.ladderStep(dt, inp) : this.driving ? this.driveStep(dt, inp) : this.footStep(dt, inp);
    this.circles = this.vehicles.flatMap((v) => v.phys.collisionPoints());
    for (const v of this.vehicles) v.update(dt, this.time, get('lights'), v === this.driving && this.rig.cabin);

    // eau : poteau branché, ou plein à la caserne
    const w = tr.water, p = tr.phys;
    if (w.hydrant) { if (dist(w.hydrantAt, p) > 28) { w.hydrant = false; this.toast('Tuyau d\'alimentation arraché : poteau débranché', 'warn'); } else w.refill(HYDRANT_LPM, dt); }
    if (dist(p, { x: CASERNE.x, z: CASERNE.z + 20 }) < 40) w.refill(2000, dt);

    this.env.update(dt, this.focus, this.camera.position);
    this.sky.position.copy(this.camera.position);
    this.sky.material.uniforms.bottom.value.copy(this.scene.background);
    this.sky.material.uniforms.top.value.copy(this.scene.background).multiplyScalar(0.55).lerp(new THREE.Color('#2f6cc0'), 0.35 * (1 - this.env.night) * (1 - this.env.rain));
    if (!this.driving && this.player.inside) {   // fumée intérieure : brouillard sombre, plus léger accroupi
      const s = this.view.smoke, f = this.scene.fog;
      f.color.setRGB(0.09, 0.085, 0.08); f.near = 0.1; f.far = 45 - 42 * Math.min(1, s * 1.15);
    }
    this.lightsTL.update(this.time);
    const dp = (this.driving ?? tr).phys, sirenOn = !!this.driving?.siren && Math.abs(dp.speed) > 0.5;   // engin arrêté : la circulation reprend
    this.peds.update(dt, this.time, this.focus, sirenOn ? { x: dp.x, z: dp.z, h: dp.heading } : null);
    this.traffic.update(dt, { t: this.time, bus: { x: this.focus.x, z: this.focus.z, h: dp.heading, circles: this.circles, nodes: this.vehNodes() }, peds: this.peds.crossing, siren: sirenOn });
    this.mission.update(dt);
    this.crew.update(dt, this.time);
    this.route.update(dt, this.focus, this.mission.target, this.mission.state === 'retour' || this.mission.state === 'transport' ? '#4fb3ff' : '#ff8a1a', !!this.driving?.siren);
    for (const b of this.buildings) if (b.sim) b.update(dt, this.time);
    this.fx.update(dt, this.mission.building, this.camera.position);

    this.hud.update({ prompt, yaw: this.rig.camYaw ?? 0, smoke: Math.min(0.65, this.view.smoke * 0.7), heat: this.view.heat });
    const b = this.mission.building, cam = this.camera.position;
    const fire = b?.sim ? Math.min(1, b.sim.rooms.reduce((a, r) => a + r.fire / Math.max(4, Math.hypot(b.ox + b.rooms[r.id].cx - cam.x, b.oz + b.rooms[r.id].cz - cam.z)), 0) * 3) : 0;
    const siren = Math.max(...this.vehicles.map((v) => (v.siren ? Math.max(0, 1 - dist(v.phys, this.focus) / 200) : 0)));
    this.audio.update({ speed: dp.speed, throttle: this.driving ? dp.thr : 0, horn: !!this.driving && inp.horn, siren, water: this.view.water || (this.crew.spraying ? 0.5 : 0), fire });
    this.saveT += dt;
    if (this.saveT > 20) { this.saveT = 0; this.economy.save(); }
    this.renderer.render(this.scene, this.camera);
  }
}

window.game = new Game();
window.GameLoader?.ready();
