import * as THREE from 'three';
import { clamp } from './core/config.js';
import { data, save } from './core/save.js';
import { inp, poll, pressed, endFrame } from './core/input.js';
import { heightAt, starts, downhillHeading, descend, pois } from './world/heightmap.js';
import { Terrain } from './world/terrain.js';
import { Sky } from './world/sky.js';
import { Weather } from './world/weather.js';
import { Avalanche } from './world/avalanche.js';
import { buildPark } from './world/park.js';
import { Character } from './player/character.js';
import { Player } from './player/player.js';
import { FollowCam } from './camera/followcam.js';
import { Tricks } from './gameplay/tricks.js';
import { Challenges } from './gameplay/challenges.js';
import { prog } from './gameplay/progression.js';
import { HUD } from './ui/hud.js';
import { MapView } from './ui/map.js';
import { Audio } from './audio/audio.js';

const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
renderer.setSize(innerWidth, innerHeight);
document.getElementById('app').append(renderer.domElement);
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(66, innerWidth / innerHeight, 0.3, 6000);

const sky = new Sky(scene), weather = new Weather(scene), terrain = new Terrain(scene), avalanche = new Avalanche(scene);
buildPark(scene);
const character = new Character(scene), tricks = new Tricks(), audio = new Audio(), hud = new HUD();
const player = new Player({ terrain, character, tricks, audio, hud, avalanche });
const challenges = new Challenges(scene, player, tricks, hud, audio);
player.ctx.challenges = challenges; tricks.hud = hud; tricks.audio = audio;
const cam = new FollowCam(camera, character);

const teleport = (t) => {
  challenges.cancel();
  const h = t.heading ?? downhillHeading(t.x, t.z);
  player.spawn(t.x, t.z, h, t.disc && t.disc !== 'wingsuit' ? t.disc : player.groundDisc);
  camera.position.set(t.x, heightAt(t.x, t.z) + 4, t.z);
  terrain.update(t.x, t.z, 0, true);
  audio.whoosh(0.4);
};
const map = new MapView(player, challenges, teleport);
hud.hooks = {
  defs: () => challenges.defs, poiCount: () => pois.length,
  equip: () => { player.refreshStats(); },
  goto: (id) => { const d = challenges.defs.find((x) => x.id === id); if (d) { hud.hide(); teleport({ x: d.start.x + 8, z: d.start.z + 8, disc: d.disc }); } },
};
prog.onLevel = (lvl, unlocked) => { hud.toast(`Niveau ${lvl} ! ${unlocked.length ? 'Débloqué : ' + unlocked.map((u) => u.name).join(', ') : ''}`); audio.ding(8); };

// point de départ : dernière position sauvegardée ou premier sommet
const s0 = data.pos || { x: starts[0].x, z: starts[0].z, disc: 'snowboard' };
player.spawn(s0.x, s0.z, downhillHeading(s0.x, s0.z), s0.disc);
camera.position.set(s0.x, heightAt(s0.x, s0.z) + 5, s0.z);
terrain.update(s0.x, s0.z, 0, true);

let risk = 0, startIdx = 0, saveT = 0;
const uphill = (x, z, d) => {
  for (let i = 0; i < d / 10; i++) {
    const gx = heightAt(x + 2, z) - heightAt(x - 2, z), gz = heightAt(x, z + 2) - heightAt(x, z - 2), m = Math.hypot(gx, gz) || 1;
    x += (gx / m) * 10; z += (gz / m) * 10;
  }
  return [x, z];
};
function triggerAvalanche(auto) {
  const [x, z] = uphill(player.pos.x, player.pos.z, auto ? 80 : 45);
  if (avalanche.trigger(x, z)) { hud.toast(auto ? '⚠ Plaque à vent ! Avalanche !' : 'Avalanche déclenchée'); audio.whoosh(1.4); return true; }
  return false;
}
const NEUTRAL = { x: 0, y: 0, jump: false, jumpUp: false, grab: 0, drift: false, brake: false, tuck: false };
const fwd = new THREE.Vector3();
const unlock = () => audio.init();
addEventListener('pointerdown', unlock); addEventListener('keydown', unlock);
addEventListener('resize', () => { renderer.setSize(innerWidth, innerHeight); camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); map.open && map.draw(); });
document.addEventListener('visibilitychange', () => document.hidden && save());

function controls() {
  if (pressed('escape') || pressed('p')) { map.open ? map.hide() : hud.toggle(); }
  if (pressed('m')) { hud.open ? 0 : map.toggle(); }
  if (hud.open || map.open) return;
  if (pressed('1')) player.switchTo('snowboard');
  if (pressed('2')) player.switchTo('ski');
  if (pressed('3')) player.switchTo('wingsuit');
  if (pressed('tab') || pressed('nextdisc') || pressed('prevdisc')) {
    const order = ['snowboard', 'ski', 'wingsuit'], d = order[(order.indexOf(player.disc) + (pressed('prevdisc') ? 2 : 1)) % 3];
    player.switchTo(d);
  }
  if (pressed('v')) hud.toast(cam.cycle());
  if (pressed('r')) { if (player.mode === 'ragdoll') player.respawnReq = true; else { player.crash('relance'); player.respawnReq = true; player.ragT = 0.8; } }
  if (pressed('t')) { startIdx = (startIdx + 1) % starts.length; teleport(starts[startIdx]); hud.toast('Départ : ' + starts[startIdx].name); }
  if (pressed('b')) { weather.cycle(); }
  if (pressed('n')) { sky.hour = (sky.hour + 3) % 24; }
  if (pressed('x')) { if (player.slope > 0.3 && player.mode === 'ground') triggerAvalanche(false); else hud.toast('Il faut une pente pour déclencher une avalanche'); }
  if (pressed('c')) challenges.cancel('Défi abandonné');
}

const clock = new THREE.Clock();
function frame() {
  requestAnimationFrame(frame);
  const dt = Math.min(clock.getDelta(), 0.05);
  poll(); controls();
  const paused = hud.open || map.open;
  if (!paused) {
    const pin = cam.mode === 2 ? NEUTRAL : inp;
    const steps = Math.ceil(dt / (1 / 90));
    for (let i = 0; i < steps; i++) player.update(dt / steps, pin);
    tricks.tick(dt, player); challenges.update(dt);
    // risque d'avalanche : vitesse + pente + poudreuse + météo
    const p = player;
    if (p.mode === 'ground' && p.speed > 10 && p.slope > 0.45 && p.snow === 0) risk += dt * weather.cur.risk * (0.05 + p.speed * 0.0015);
    else risk = Math.max(0, risk - dt * 0.04);
    if (risk >= 1) { risk = 0; triggerAvalanche(true); }
    if (avalanche.update(dt, p.pos, p.agl) && p.mode !== 'ragdoll') p.crash('avalanche');
    sky.update(dt, camera, weather.cur); weather.update(dt, camera);
    saveT += dt;
    if (saveT > 6) { saveT = 0; if (p.mode === 'ground') data.pos = { x: p.pos.x, z: p.pos.z, disc: p.groundDisc }; save(); }
  }
  character.update(paused ? 0 : dt, player);
  cam.update(dt, player);
  terrain.update(camera.position.x, camera.position.z);
  audio.update(dt, player, weather.cur, avalanche);
  camera.getWorldDirection(fwd);
  hud.update({ p: player, tricks, sky, weather, chal: challenges, bearing: Math.atan2(fwd.x, -fwd.z), risk });
  renderer.render(scene, camera);
  endFrame();
}
hud.ready();
frame();
window.__sp = { player, terrain, camera, cam, sky, weather, avalanche, tricks, challenges, scene, renderer, teleport, hud, character, map };
