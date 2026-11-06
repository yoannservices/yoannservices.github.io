/* Lieu 2 : la ferme. Piste de terre depuis la campagne vallonnée jusqu'à une cour de gravier avec grange, silo, clôtures en bois, balles de paille,
   champs cultivés, haies, chênes et touffes d'herbe. */
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { rng, fbm, smooth } from '../core/util.js';
import { box, circle } from '../gameplay/collision.js';
import { makeScene, pave, pad, boundary, distToPath } from './common.js';
import { mat, flat, scatter, terrain, oakGeos, oakMats, bushGeos, bushMat, tuftGeo, tuftMat, rockGeos, rockMat, scaleUV, parkedCars } from './kit.js';
import { T } from './textures.js';

const YARD = { x0: -20, x1: 30, z0: -16, z1: 16 };

/* Clôture en bois : poteaux et deux lisses entre (x0,z0) et (x1,z1) ; obstacle fin le long. */
function fence(scene, colliders, [x0, z0], [x1, z1], wood) {
  const len = Math.hypot(x1 - x0, z1 - z0), yaw = Math.atan2(x1 - x0, z1 - z0), n = Math.max(1, Math.round(len / 2.4));
  const posts = [], rails = [];
  for (let i = 0; i <= n; i++) posts.push({ x: x0 + (x1 - x0) * i / n, z: z0 + (z1 - z0) * i / n, rot: 0, s: 1 });
  scatter(scene, [new THREE.BoxGeometry(0.14, 1.3, 0.14).translate(0, 0.65, 0)], wood, posts, { seed: 7 });
  for (const y of [0.45, 0.95]) { const g = new THREE.BoxGeometry(0.07, 0.12, len).translate(0, y, 0).rotateY(yaw).translate((x0 + x1) / 2, 0, (z0 + z1) / 2); rails.push(g); }
  const m = new THREE.Mesh(mergeGeometries(rails), wood); m.castShadow = true; scene.add(m);
  colliders.push(box((x0 + x1) / 2, (z0 + z1) / 2, 0.12, len / 2, -yaw));
}

export async function build({ renderer, level }) {
  const colliders = [], rand = rng(21);
  const { scene, sky } = makeScene(renderer, { elevation: 26, azimuth: 118, turbidity: 5.5, rayleigh: 1.7, mie: 0.006, exposure: 0.5, fog: 0xdad4c2, density: 0.0036, sun: 0xffe2b4, sunI: 3.4, hemi: [0xcfe0f5, 0x6a6244, 0.8] });

  // relief : plat autour de la cour et de la piste, collines douces plus loin
  const hills = (x, z) => { const d = Math.hypot(x, z * 0.8), k = smooth(100, 300, d); return k * (28 * fbm(x * 0.0055 + 4, z * 0.0055, 4, 3) + 12 * fbm(x * 0.017, z * 0.017, 3, 4)) + (1 - k) * 0.25 * (fbm(x * 0.05, z * 0.05, 2, 8) - 0.5); };
  scene.add(terrain({
    size: 1500, seg: 210, map: T.grass(), tile: 7, height: hills,
    tint: (c, x, z, h, slope) => { const f = fbm(x * 0.012 + 9, z * 0.012, 3, 5), g = fbm(x * 0.05, z * 0.05, 2, 6); c.setRGB(0.78 + 0.5 * f - 0.15 * slope + 0.1 * g, 0.85 + 0.3 * f + 0.1 * g, 0.62 + 0.15 * f - 0.1 * slope).multiplyScalar(1.0 - Math.min(0.25, h * 0.004)); },
  }));

  // champs cultivés
  const crops = T.crops();
  pad(scene, -78, -34, -62, 22, crops, { tile: 7, y: 0.03, order: 1, color: 0xe7d9a0 });
  pad(scene, 38, 82, 24, 84, crops, { tile: 7, y: 0.03, order: 1, color: 0xcfe0a0 });

  // piste de terre jusqu'à la cour (prolongée au-delà du départ pour que le chemin ne s'arrête pas net)
  const route = level.route, road = [[-8, 98], ...route.slice(0, -1)];
  pave(scene, road, 5.2, T.dirtRoad(), { uvLen: 8, y: 0.035, order: 2, alpha: true });
  pad(scene, YARD.x0, YARD.x1, YARD.z0, YARD.z1, T.gravel(), { tile: 6, y: 0.04, order: 3, color: 0xd8cdb8 });

  // grange, silo
  const planks = mat(T.planks(), { rough: 0.9, bump: 2 }), tin = mat(T.roofTin(), { rough: 0.55, metal: 0.3 });
  const BW = 16, BD = 10, BH = 5.2, bx = -12, bz = -20;
  const barn = new THREE.Group(); barn.position.set(bx, 0, bz);
  const wall = new THREE.Mesh(scaleUV(new THREE.BoxGeometry(BW, BH, BD).translate(0, BH / 2, 0), 3, 1.3), planks); wall.castShadow = wall.receiveShadow = true; barn.add(wall);
  const rise = 3.6, slope = Math.hypot(BD / 2 + 0.6, rise), ang = Math.atan2(rise, BD / 2 + 0.6);
  for (const s of [-1, 1]) {
    const p = new THREE.Mesh(scaleUV(new THREE.BoxGeometry(BW + 1, 0.16, slope), 4, 2), tin);
    p.position.set(0, BH + rise / 2 + 0.05, s * (BD / 4 + 0.3)); p.rotation.x = s * ang; p.castShadow = true; barn.add(p);
  }
  const gable = new THREE.Shape(); gable.moveTo(-BD / 2, 0); gable.lineTo(BD / 2, 0); gable.lineTo(0, rise); gable.closePath();
  for (const s of [-1, 1]) { const g = new THREE.Mesh(new THREE.ShapeGeometry(gable), planks); g.rotation.y = s * Math.PI / 2; g.position.set(s * (BW / 2 + 0.01), BH, 0); barn.add(g); }
  const door = new THREE.Mesh(new THREE.PlaneGeometry(6, 4.2), mat(T.wood(), { color: 0x6b3a2a })); door.position.set(0, 2.1, BD / 2 + 0.03); barn.add(door);
  const beam = new THREE.Mesh(new THREE.BoxGeometry(6.4, 0.25, 0.2), flat(0xe8e0cf)); beam.position.set(0, 4.3, BD / 2 + 0.05); barn.add(beam);
  scene.add(barn); colliders.push(box(bx, bz, BW / 2, BD / 2, 0));
  const silo = new THREE.Mesh(new THREE.CylinderGeometry(2.4, 2.4, 11, 20, 1), mat(T.metal(), { rough: 0.4, metal: 0.6 })); silo.position.set(-27, 5.5, -18); silo.castShadow = true; scene.add(silo);
  const dome = new THREE.Mesh(new THREE.SphereGeometry(2.4, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2), flat(0xb9bec4, { metal: 0.6, rough: 0.4 })); dome.position.set(-27, 11, -18); scene.add(dome);
  colliders.push(circle(-27, -18, 2.45));

  // clôtures autour de la cour (ouverture côté piste)
  const wood = mat(T.wood(), { color: 0xb09a7c, rough: 0.95 });
  fence(scene, colliders, [-1, -14.4], [31, -14.4], wood);
  fence(scene, colliders, [31, -14.4], [31, 4], wood);
  fence(scene, colliders, [-20, 12], [-3, 12], wood);
  fence(scene, colliders, [24, 14], [31, 14], wood); fence(scene, colliders, [31, 14], [31, 4], wood);

  // balles de paille
  const bale = new THREE.CylinderGeometry(0.9, 0.9, 1.3, 18).rotateZ(Math.PI / 2);
  scaleUV(bale, 2, 1);
  const bales = [];
  for (let i = 0; i < 4; i++) for (let j = 0; j < 3 - (i > 1 ? 1 : 0); j++) bales.push({ x: 22 + i * 1.9, y: 0.9 + 0, z: -9.8 + j * 1.5, rot: (rand() - 0.5) * 0.3, s: 1 });
  bales.push({ x: 23, y: 2.25, z: -9, rot: 0.1, s: 1 }, { x: 25, y: 2.25, z: -8.4, rot: -0.1, s: 1 });
  scatter(scene, [bale], mat(T.straw(), { rough: 1 }), bales, { seed: 8, receive: true });
  colliders.push(box(24.9, -8.4, 3.4, 2.3, 0));
  const round = new THREE.CylinderGeometry(1.1, 1.1, 1.3, 18); scaleUV(round, 2, 1);
  scatter(scene, [round], mat(T.straw(), { rough: 1, color: 0xe4d08c }), [{ x: -34, z: -12, rot: 0 }, { x: -31, z: -8.5, rot: 0 }, { x: 4, z: -19, rot: 0 }].map((b) => ({ ...b, y: 0.65 })), { seed: 9 });
  colliders.push(circle(-34, -12, 1.2), circle(-31, -8.5, 1.2), circle(4, -19, 1.2));

  // véhicules garés dans la cour : de part et d'autre de la place
  const sp = level.spot;
  colliders.push(...await parkedCars(scene, [
    { type: 'offroad', x: sp.x + sp.wid / 2 + 0.6 + 1.1, z: sp.z, yaw: Math.PI, color: 0x6a8f4e },
    { type: 'wagon', x: sp.x - sp.wid / 2 - 0.6 - 1.1, z: sp.z, yaw: Math.PI, color: 0xc7c7c0 },
    { type: 'hatchback', x: -4, z: 6, yaw: 2.2, color: 0xa8332b },
  ]));

  // arbres, haies, rochers, herbe
  const route2 = route.map((p) => p.slice());
  const free = (x, z, m = 7) => distToPath(x, z, [[-8, 98], ...route2]) > m && !(x > YARD.x0 - 6 && x < YARD.x1 + 6 && z > YARD.z0 - 8 && z < YARD.z1 + 8);
  const trees = [];
  for (let i = 0; i < 420; i++) {
    const a = rand() * Math.PI * 2, d = 12 + Math.sqrt(rand()) * 240, x = Math.cos(a) * d, z = Math.sin(a) * d * 0.9 + 15;
    if (!free(x, z, 8)) continue;
    if (x > -80 && x < -30 && z > -64 && z < 24) continue;                     // dans le champ
    if (x > 34 && x < 84 && z > 20 && z < 86) continue;
    const y = hills(x, z), s = 0.9 + rand() * 0.8;
    trees.push({ x, z, y, s });
    if (Math.abs(x) < 95 && z > -60 && z < 100) colliders.push(circle(x, z, 0.5 * s));
  }
  scatter(scene, oakGeos(3), oakMats(), trees, { seed: 31 });
  const hedge = [];
  for (let z = -55; z < 92; z += 2.6) hedge.push({ x: -28.5 + (rand() - 0.5) * 0.6, z, s: 1.1 + rand() * 0.5, sy: 1.1 + rand() * 0.4, tint: 0xffffff });
  for (let x = 40; x < 84; x += 2.6) hedge.push({ x, z: 22 + (rand() - 0.5) * 0.6, s: 1.1 + rand() * 0.5 });
  scatter(scene, bushGeos(), bushMat(), hedge, { seed: 32, receive: true });
  for (const h of hedge) if (Math.abs(h.x) < 90) colliders.push(circle(h.x, h.z, 0.9 * h.s));
  const rocks = [];
  for (let i = 0; i < 26; i++) { const x = (rand() - 0.5) * 170, z = (rand() - 0.5) * 190 + 10; if (free(x, z, 6)) { const s = 0.4 + rand() * 0.9; rocks.push({ x, z, y: 0.05, s, sy: s * 0.7 }); colliders.push(circle(x, z, s * 0.9)); } }
  scatter(scene, rockGeos(3), rockMat(0xd2c8b4), rocks, { seed: 33 });
  const tufts = [];
  for (let i = 0; i < 2200; i++) { const x = (rand() - 0.5) * 220, z = (rand() - 0.5) * 220 + 10; if (free(x, z, 3.2)) tufts.push({ x, z, y: hills(x, z), s: 0.7 + rand() * 0.9, rot: rand() * 3 }); }
  scatter(scene, [tuftGeo()], tuftMat(), tufts, { shadow: false, seed: 34 });

  // poteaux électriques le long de la piste
  const polesG = mergeGeometries([new THREE.CylinderGeometry(0.13, 0.17, 9, 8).translate(0, 4.5, 0), new THREE.BoxGeometry(2.2, 0.14, 0.14).translate(0, 8.5, 0)].map((g) => g.toNonIndexed()));
  const poles = [];
  for (let z = 90; z > 10; z -= 26) { const x = -8 + (z - 90) * 0.05 + 6.2; poles.push({ x, z, rot: 0.4 }); colliders.push(circle(x, z, 0.2)); }
  scatter(scene, [polesG], mat(T.wood(), { color: 0x6b5a46 }), poles, { seed: 35 });

  boundary(colliders, -85, 85, -55, 99);
  return { scene, sky, colliders };
}
