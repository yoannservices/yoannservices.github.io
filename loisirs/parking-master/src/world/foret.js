/* Lieu 3 : la clairière. Chemin de terre sinueux entre des sapins et des chênes serrés, sous-bois (fougères, souches, troncs, rochers moussus),
   brume légère ; la place est une alvéole entre deux troncs couchés, adossée à un tas de bois. */
import * as THREE from 'three';
import { rng, fbm, smooth } from '../core/util.js';
import { box, circle } from '../gameplay/collision.js';
import { makeScene, pave, pad, boundary, distToPath } from './common.js';
import { mat, flat, scatter, terrain, oakGeos, oakMats, pineGeos, pineMats, tuftGeo, tuftMat, rockGeos, rockMat, bushGeos, bushMat, scaleUV, parkedCars } from './kit.js';
import { T } from './textures.js';

const CLEAR = { x0: -16, x1: 22, z0: -19, z1: 13 };

export async function build({ renderer, level }) {
  const colliders = [], rand = rng(41);
  const { scene, sky } = makeScene(renderer, { elevation: 33, azimuth: 148, turbidity: 6.5, rayleigh: 1.8, mie: 0.01, exposure: 0.5, fog: 0xa9bcb6, density: 0.0105, sun: 0xfff0cf, sunI: 2.7, hemi: [0xcfe6d6, 0x4a4a2c, 0.85] });

  const route = level.route, path = [[16, 100], ...route];
  const hills = (x, z) => { const k = smooth(70, 220, Math.hypot(x, z * 0.85)); return k * (34 * fbm(x * 0.007 + 2, z * 0.007, 4, 12) + 10 * fbm(x * 0.03, z * 0.03, 3, 13)) + (1 - k) * 0.3 * (fbm(x * 0.06, z * 0.06, 2, 14) - 0.5); };
  scene.add(terrain({
    size: 1300, seg: 200, map: T.grass(), tile: 6, height: hills,
    tint: (c, x, z, h, slope) => { const p = fbm(x * 0.03 + 1, z * 0.03, 3, 15), moss = fbm(x * 0.09, z * 0.09, 2, 16); c.setRGB(0.42 + 0.35 * p + 0.12 * moss, 0.5 + 0.25 * p + 0.1 * moss - 0.05 * slope, 0.3 + 0.12 * p).multiplyScalar(0.8 - Math.min(0.2, h * 0.003)); },
  }));

  // chemin de terre et clairière
  pave(scene, path, 4.8, T.dirtRoad(), { uvLen: 7, y: 0.035, order: 2, alpha: true });
  pad(scene, CLEAR.x0, CLEAR.x1, CLEAR.z0, CLEAR.z1, T.dirt(), { tile: 6, y: 0.04, order: 3, color: 0xb59e80 });
  pad(scene, CLEAR.x0 - 6, CLEAR.x1 + 6, CLEAR.z0 - 5, CLEAR.z1 + 5, T.grass(), { tile: 6, y: 0.02, order: 1, color: 0x6b8a4a });

  // la place : deux troncs couchés de part et d'autre, tas de bois au fond
  const sp = level.spot, bark = mat(T.bark(), { rough: 1, bump: 3, color: 0xb0a090 }), logLen = sp.len + 0.6;
  const logGeo = (r, l) => { const g = new THREE.CylinderGeometry(r, r * 1.06, l, 14, 1).rotateX(Math.PI / 2); scaleUV(g, 3, l / 3); return g; };
  const logs = [];
  for (const s of [-1, 1]) {
    const x = sp.x + s * (sp.wid / 2 + 0.45), r = 0.42;
    logs.push({ geo: logGeo(r, logLen), x, y: r, z: sp.z, rot: 0 });
    colliders.push(box(x, sp.z, r, logLen / 2, 0));
  }
  const pile = [], zBack = sp.z - sp.len / 2 - 1.5;
  for (let i = 0; i < 3; i++) for (let j = 0; j < 7 - i; j++) pile.push({ geo: logGeo(0.36, 2.4), x: sp.x - (6 - i) * 0.38 + j * 0.76, y: 0.36 + i * 0.64, z: zBack - 0.15 * (j % 2), rot: 0 });
  for (const l of logs.concat(pile)) { const m = new THREE.Mesh(l.geo, bark); m.position.set(l.x, l.y, l.z); m.rotation.y = l.rot; m.castShadow = m.receiveShadow = true; scene.add(m); }
  colliders.push(box(sp.x, zBack, 3.0, 1.3, 0));

  // véhicules, mobilier de la clairière
  colliders.push(...await parkedCars(scene, [{ type: 'wagon', x: -8, z: -3, yaw: 1.2, color: 0x7a6a4e }, { type: 'compact', x: 14, z: -12, yaw: -0.4, color: 0xb23c2a }]));
  const table = new THREE.Group();
  const wood = mat(T.wood(), { color: 0x9b7a55 });
  for (const m of [new THREE.Mesh(new THREE.BoxGeometry(2, 0.07, 0.8).translate(0, 0.78, 0), wood), new THREE.Mesh(new THREE.BoxGeometry(2, 0.06, 0.3).translate(0, 0.46, 0.65), wood), new THREE.Mesh(new THREE.BoxGeometry(2, 0.06, 0.3).translate(0, 0.46, -0.65), wood)]) { m.castShadow = true; table.add(m); }
  table.position.set(-12, 0, 6); table.rotation.y = 0.5; scene.add(table); colliders.push(box(-12, 6, 1.1, 1.0, -0.5));
  const board = new THREE.Group();
  const bpost = new THREE.Mesh(new THREE.BoxGeometry(0.12, 2.2, 0.12).translate(0, 1.1, 0), wood), bface = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.9, 0.06).translate(0, 1.9, 0), mat(T.planks(), { color: 0xcdbd9a }));
  board.add(bpost, bface); board.position.set(10, 0, 12.5); board.rotation.y = -0.4; scene.add(board); colliders.push(circle(10, 12.5, 0.4));

  // forêt : sapins et chênes serrés, évitant le chemin et la clairière
  const free = (x, z, m) => distToPath(x, z, path) > m && !(x > CLEAR.x0 - 2 && x < CLEAR.x1 + 2 && z > CLEAR.z0 - 2 && z < CLEAR.z1 + 2);
  const pines = [], oaks = [];
  for (let i = 0; i < 1500; i++) {
    const a = rand() * Math.PI * 2, d = 6 + Math.sqrt(rand()) * 210, x = Math.cos(a) * d, z = Math.sin(a) * d * 0.95 + 25;
    const near = rand() < 0.18, m = near ? 3.7 : 4.6;
    if (!free(x, z, d < 100 ? m : 3)) continue;
    const s = 0.8 + rand() * 0.8, t = { x, z, y: hills(x, z), s };
    (rand() < 0.62 ? pines : oaks).push(t);
    if (Math.abs(x) < 80 && z > -45 && z < 105) colliders.push(circle(x, z, 0.3 * s + 0.1));
  }
  scatter(scene, pineGeos(3), pineMats(), pines, { seed: 51 });
  scatter(scene, oakGeos(3), oakMats(), oaks, { seed: 52 });

  // sous-bois : fougères / herbes, buissons, rochers moussus, souches, troncs tombés
  const tufts = [], bushes = [], rocks = [], stumps = [], fallen = [];
  for (let i = 0; i < 3800; i++) { const x = (rand() - 0.5) * 230, z = (rand() - 0.5) * 230 + 25; if (free(x, z, 2.7)) tufts.push({ x, z, y: hills(x, z), s: 0.8 + rand() * 1.1, tint: rand() < 0.5 ? 0xc9e0a8 : 0xffffff }); }
  for (let i = 0; i < 180; i++) { const x = (rand() - 0.5) * 200, z = (rand() - 0.5) * 200 + 25; if (free(x, z, 4.2)) { const s = 0.7 + rand() * 0.9; bushes.push({ x, z, y: hills(x, z), s, tint: 0xa8c488 }); if (Math.abs(x) < 80 && z > -40 && z < 100) colliders.push(circle(x, z, 0.8 * s)); } }
  for (let i = 0; i < 40; i++) { const x = (rand() - 0.5) * 190, z = (rand() - 0.5) * 190 + 25; if (free(x, z, 4)) { const s = 0.5 + rand() * 1.1; rocks.push({ x, z, y: 0.05, s, sy: s * 0.75 }); if (Math.abs(x) < 80 && z > -40 && z < 100) colliders.push(circle(x, z, s * 0.9)); } }
  for (let i = 0; i < 26; i++) { const x = (rand() - 0.5) * 160, z = (rand() - 0.5) * 160 + 25; if (free(x, z, 3.5)) { stumps.push({ x, z, s: 0.7 + rand() * 0.5 }); colliders.push(circle(x, z, 0.5)); } }
  for (let i = 0; i < 18; i++) { const x = (rand() - 0.5) * 150, z = (rand() - 0.5) * 150 + 25; if (free(x, z, 4.5)) { fallen.push({ x, y: 0.3, z, rot: 0, s: 1 }); colliders.push(box(x, z, 0.35, 2.4, 0)); } }
  scatter(scene, [tuftGeo()], tuftMat(), tufts, { shadow: false, seed: 53 });
  scatter(scene, bushGeos(), bushMat(), bushes, { seed: 54, receive: true });
  scatter(scene, rockGeos(4), rockMat(0x9fae92), rocks, { seed: 55 });
  const stump = new THREE.CylinderGeometry(0.42, 0.55, 0.7, 12).translate(0, 0.35, 0); scaleUV(stump, 2, 1);
  scatter(scene, [stump], bark, stumps, { seed: 56 });
  const fl = logGeo(0.3, 4.8);
  scatter(scene, [fl], bark, fallen, { seed: 57 });

  boundary(colliders, -60, 60, -45, 104);
  return { scene, sky, colliders };
}
