import * as THREE from 'three';
import { CABS, TRAILERS } from './truck/truckData.js';
import { TruckPhysics, consumption } from './truck/truckPhysics.js';
import { buildTruck } from './truck/truckModel.js';
import { Environment } from './world/environment.js';
import { buildRouteWorld, WORLD_SCALE, HALF } from './world/routeWorld.js';
import { Weather } from './weather/weather.js';
import { Traffic } from './traffic/traffic.js';
import { readInput, pressed } from './core/input.js';
import { updateHUD } from './ui/hud.js';
import { createGarage } from './ui/garage.js';
import { state, save, resetState } from './core/state.js';
import { createMenu, createContracts, createSummary } from './ui/screens.js';
import { generateContracts, settle } from './economy/contracts.js';
import { CITIES } from './map/cities.js';
import { createMapScreen } from './map/mapScreen.js';
import { FUEL_PRICE } from './map/routing.js';

const canvas = document.getElementById('game');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.25;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(60, 1, 0.3, 2500);
const env = new Environment(scene);
const weather = new Weather(scene);

const BREAK_HOURS = 4.5;
const TIME_SCALE = WORLD_SCALE; // 1 s réelle = 20 s simulées : 90 km/h réels à l'écran, trajet réel en temps simulé
const game = { startHours: 8, deadline: 0, settled: false, hours: 8, driveHours: 0, truckDmg: 0, cargoDmg: 0, flash: 0, arrived: false, remainingKm: 0, weather: '', message: '', messageLevel: '', camMode: 'chase', camH: 0 };
let loadFrac = 0.7;
let mode = 'menu', route = null, world = null, traffic = null, phys, model, cab, trailer;
const hudEl = document.getElementById('hud');
const cityName = (id) => CITIES.find((c) => c.id === id).name;

const truckInfo = () => ({ consumption: consumption(CABS[state.cab].mass + TRAILERS[state.trailer].empty + TRAILERS[state.trailer].maxLoad * loadFrac, 80) });
const applyOptions = () => {
  renderer.setPixelRatio(state.options.lowres ? 1 : Math.min(devicePixelRatio, 1.5));
  env.sun.castShadow = state.options.shadows;
  resize();
};
const goGarage = () => { mode = 'garage'; hudEl.hidden = true; garage.show(); };
const goContracts = () => {
  mode = 'contracts';
  state.contracts[state.trailer] ??= generateContracts(state.trailer);
  save();
  contracts.show(state.contracts[state.trailer]);
};
const menu = createMenu({
  onNew: () => { resetState(); menu.hide(); goGarage(); },
  onContinue: () => { menu.hide(); goGarage(); },
  onOptions: applyOptions,
});
const garage = createGarage(() => { garage.hide(); goContracts(); });
const contracts = createContracts({
  onAccept: (c) => { state.contract = c; loadFrac = c.loadFrac; contracts.hide(); mode = 'map'; mapScreen.show(truckInfo(), [c.from, c.to]); },
  onBack: () => { contracts.hide(); goGarage(); },
});
const summary = createSummary({
  onNext: () => { summary.hide(); goContracts(); },
  onMenu: () => { summary.hide(); mode = 'menu'; menu.show(); },
});
const mapScreen = createMapScreen(startDrive, () => { mapScreen.hide(); goContracts(); });

function startDrive(r) {
  route = r;
  if (world) scene.remove(world.group);
  traffic?.dispose(scene);
  world = buildRouteWorld(r);
  scene.add(world.group);
  traffic = new Traffic(scene, world);
  Object.assign(game, { driveHours: 0, truckDmg: 0, cargoDmg: 0, arrived: false, settled: false, startHours: game.hours, deadline: state.contract.deadline });
  document.getElementById('route').textContent = `${cityName(r.stops[0])} → ${cityName(r.stops.at(-1))} · ${Math.round(r.km)} km`;
  mode = 'drive';
  mapScreen.hide();
  hudEl.hidden = false;
  spawn();
}

function spawn() {
  cab = CABS[state.cab]; trailer = TRAILERS[state.trailer];
  if (model) scene.remove(model.root);
  const p = world.at(world.startS, -HALF / 2);
  phys = new TruckPhysics(cab, trailer, loadFrac, p, WORLD_SCALE);
  model = buildTruck(cab, trailer);
  scene.add(model.root);
  traffic.respawnAll(world.startS);
  game.camH = phys.h;
  camera.position.set(phys.x - Math.sin(phys.h) * 32, 9, phys.z - Math.cos(phys.h) * 32);
}
function resize() {
  renderer.setSize(innerWidth, innerHeight, false);
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
}
addEventListener('resize', resize);
resize();
applyOptions();
menu.show();

function handleKeys(station) {
  if (pressed('KeyM')) { mode = 'map'; hudEl.hidden = true; mapScreen.show(truckInfo()); return; }
  if (pressed('KeyG')) { goGarage(); return; }
  if (pressed('Escape')) { mode = 'menu'; hudEl.hidden = true; menu.show(); return; }
  if (pressed('KeyC')) game.camMode = game.camMode === 'chase' ? 'cabin' : 'chase';
  if (pressed('KeyR')) spawn();
  if (pressed('KeyH')) weather.cycle(); // météo manuelle (test)
  if (pressed('KeyP') && Math.abs(phys.v) < 0.5) { game.hours += 0.75; game.driveHours = 0; }
  if (pressed('KeyF') && station && Math.abs(phys.v) < 1) { // plein dans la limite de l'argent
    const liters = Math.min(cab.tank - phys.fuel, state.money / FUEL_PRICE);
    phys.fuel += liters;
    state.money -= liters * FUEL_PRICE;
    game.hours += 0.1;
    save();
  }
}

const tmp = new THREE.Vector3();
const wrap = (a) => Math.atan2(Math.sin(a), Math.cos(a));

function updateCamera(dt) {
  game.camH += wrap(phys.h - game.camH) * Math.min(1, 3 * dt);
  if (game.camMode === 'cabin') {
    const s = Math.sin(phys.h), c = Math.cos(phys.h);
    camera.position.set(phys.x + s * 3.95 + c * 0.55, 1.0 + cab.cabH * 0.7, phys.z + c * 3.95 - s * 0.55); // yeux du conducteur (cabine à gauche)
    camera.lookAt(camera.position.x + s * 30, camera.position.y - 0.4, camera.position.z + c * 30);
    camera.fov = 70;
  } else {
    const s = Math.sin(game.camH), c = Math.cos(game.camH);
    tmp.set(phys.x - s * 32, 9, phys.z - c * 32);
    camera.position.lerp(tmp, Math.min(1, 6 * dt));
    camera.lookAt(phys.x + s * 4, 2.2, phys.z + c * 4);
    camera.fov = 60;
  }
  camera.updateProjectionMatrix();
}

/** Points de contact du camion (cabine, tracteur, remorque) pour les collisions. */
/** Fin de contrat (arrivée ou camion détruit) : calcule les gains, sauvegarde, ouvre le résumé. */
function finishContract() {
  game.settled = true;
  const c = state.contract, failed = game.truckDmg >= 100 && !game.arrived;
  const hours = game.hours - game.startHours;
  const result = settle(c, { hours, cargoDmg: game.cargoDmg, truckDmg: game.truckDmg, failed });
  state.money = Math.max(0, state.money + result.net);
  if (!failed) { state.stats.delivered++; state.stats.earned += result.net; }
  state.contract = null;
  delete state.contracts[state.trailer]; // nouveaux contrats au prochain passage
  save();
  mode = 'summary';
  hudEl.hidden = true;
  summary.show({ contract: c, result, hours, km: phys.odo / 1000, failed });
}

function contactPoints() {
  const hp = phys.hitch, sh = Math.sin(phys.h), ch = Math.cos(phys.h), st = Math.sin(phys.th), ct = Math.cos(phys.th);
  const pts = [5.3, 2.5, 0].map((d) => [phys.x + sh * d, phys.z + ch * d]);
  for (const d of [4, 8, trailer.length - 0.5]) pts.push([hp.x - st * d, hp.z - ct * d]);
  return pts;
}

let last = performance.now();
function frame(now) {
  const dt = Math.min((now - last) / 1000, 1 / 30);
  last = now;
  requestAnimationFrame(frame);
  if (mode === 'garage') { garage.frame(renderer, dt, innerWidth / innerHeight); return; }
  if (mode !== 'drive') return;

  const q = world.query(phys.x, phys.z);
  const station = world.stations.find((s) => Math.hypot(s.x - phys.x, s.z - phys.z) < 14);
  handleKeys(station);
  if (mode !== 'drive') return;

  const w = weather.cur;
  const locked = game.driveHours >= BREAK_HOURS || game.truckDmg >= 100 || game.arrived;
  phys.update(dt, readInput(), { offroad: q.off, mu: w.mu, locked, power: 1 - 0.5 * (game.truckDmg / 100) });

  // dégâts : freinage brutal, forte accélération latérale, collisions
  if (phys.accel < -5) game.cargoDmg += (-phys.accel - 5) * 0.4 * dt;
  if (Math.abs(phys.lat) > 4) game.cargoDmg += (Math.abs(phys.lat) - 4) * 0.4 * dt;
  const hit = traffic.update(dt, { s: q.s, v: phys.v, h: phys.h, tail: q.s - trailer.length - 0.3, pts: contactPoints() });
  if (hit > 1) {
    game.truckDmg += hit * 1.5;
    game.cargoDmg += hit * 1.2;
    phys.v *= 0.6;
    game.flash = 1.5;
  }
  game.truckDmg = Math.min(100, game.truckDmg);
  game.cargoDmg = Math.min(100, game.cargoDmg);
  game.flash -= dt;

  game.hours += (dt * TIME_SCALE) / 3600;
  if (Math.abs(phys.v) > 0.5) game.driveHours += (dt * TIME_SCALE) / 3600;
  game.remainingKm = Math.max(0, ((world.endS - q.s) * WORLD_SCALE) / 1000);
  game.weather = weather.label;
  if (!game.arrived && q.s >= world.endS - 30 && Math.abs(phys.v) < 2) game.arrived = true;

  if ((game.arrived || game.truckDmg >= 100) && !game.settled) finishContract();

  const msg = (text, level = '') => { game.message = text; game.messageLevel = level; };
  if (game.arrived) msg(`Arrivée à ${cityName(route.stops.at(-1))} · M : carte`, 'warn');
  else if (game.truckDmg >= 100) msg('Camion hors service', 'danger');
  else if (game.flash > 0) msg('Collision !', 'danger');
  else if (game.driveHours >= BREAK_HOURS) msg('Pause obligatoire : arrêtez-vous et appuyez sur P', 'danger');
  else if (phys.fuel <= 0) msg('Panne sèche', 'danger');
  else if (station && Math.abs(phys.v) < 1) msg(`Station-service : F pour faire le plein (${Math.round(cab.tank - phys.fuel)} L)`);
  else if (phys.fuel / cab.tank < 0.15) msg('Réservoir bas : cherchez une station', 'warn');
  else if (game.driveHours > BREAK_HOURS - 0.25) msg('Pause bientôt nécessaire', 'warn');
  else msg('');

  model.update(phys);
  updateCamera(dt);
  weather.update(dt, game.hours, camera);
  world.update(phys);
  model.setLights(env.update(game.hours % 24, phys, weather.cur));
  updateHUD(dt, phys, game, state);
  renderer.render(scene, camera);
}
requestAnimationFrame(frame);
window.__game = { game, get phys() { return phys; }, get world() { return world; }, get traffic() { return traffic; }, weather }; // debug
