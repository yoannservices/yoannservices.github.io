/* Campagne 2 : la place du village. Pavés, église, fontaine, étals de marché, terrasses, rangée de places, voiture qui tourne autour de la fontaine, piétons. */
import * as THREE from 'three';
import { begin, pad, pave } from '../common.js';
import { landscape } from '../landscape.js';
import { house, stall, cafeSet, lamps } from '../parts.js';
import { mat, scatter, oakGeos, oakMats } from '../kit.js';
import { T } from '../textures.js';

const W = ['#e0d2b4', '#d9c3a0', '#cdb99a', '#e6dcc4', '#d4bf9a'];
export async function build({ renderer, level }) {
  const ctx = begin(renderer, { seed: 62, bounds: [-37, 64, -34, 34], sky: { elevation: 34, azimuth: 130, turbidity: 4.8, rayleigh: 1.6, exposure: 0.5, fog: 0xd6d9cc, density: 0.0032, sun: 0xffe6bd, sunI: 3.3 } });
  const { scene, colliders } = ctx, sp = level.spot;
  landscape(ctx, { kind: 'farm', seed: 22, shapes: [{ rect: [-36, 36, -30, 30] }, { path: [[70, 0], [24, 0]], w: 5 }], collide: [-60, 66, -34, 36], cz: 0 });
  pad(scene, -28.5, 26, -22, 22, T.cobble(), { tile: 5, y: 0.04, order: 1, color: 0xcfc7b8 });
  pave(scene, [[70, 0], [26, 0]], 6.4, T.asphalt(), { uvLen: 10, y: 0.045, order: 2 });
  // maisons autour de la place
  const row = (zc, xs, yaw, d) => { for (let i = 0; i < xs.length - 1; i++) house(scene, colliders, { x: (xs[i] + xs[i + 1]) / 2, z: zc, w: xs[i + 1] - xs[i], d, h: 6.8 + ((i * 7) % 3) * 1.6, yaw, wall: W[i % 5], key: 'vl' + (i % 5), style: { shutters: ['#3d5a80', '#7a3b2e', '#4a6b4a', '#6b5a3a'][i % 4] }, roof: 'tile', door: 1.1 }); };
  row(-26, [-28, -15, -2, 10, 22], 0, 8); row(26, [-26, -12, 2, 14, 26], Math.PI, 8);
  for (const [z0, z1] of [[-26, -4.5], [4.5, 26]]) house(scene, colliders, { x: 30.1, z: (z0 + z1) / 2, w: z1 - z0, d: 8, h: 8.4, yaw: -Math.PI / 2, wall: '#d9c3a0', key: 'vl1', style: { shutters: '#7a3b2e' }, roof: 'tile', door: 1.1 });
  // église : nef et clocher
  house(scene, colliders, { x: -33, z: 4, w: 20, d: 9, h: 9.5, yaw: Math.PI / 2, wall: '#cfc6b4', key: 'eg', style: { stone: true }, roof: 'slate', door: 2 });
  house(scene, colliders, { x: -33, z: -9, w: 5.5, d: 5.5, h: 17, yaw: 0, wall: '#c4baa6', key: 'eg2', style: { stone: true }, roof: 'slate', rise: 6 });
  // fontaine
  const fx = -4, fz = 0, stone = mat(T.stone(), { bump: 2, color: 0xd8d2c4 });
  const basin = new THREE.Mesh(new THREE.CylinderGeometry(2.4, 2.5, 0.7, 28).translate(0, 0.35, 0), stone); basin.position.set(fx, 0, fz); basin.castShadow = basin.receiveShadow = true; scene.add(basin);
  const water = new THREE.Mesh(new THREE.CircleGeometry(2.2, 28).rotateX(-Math.PI / 2).translate(0, 0.62, 0), new THREE.MeshStandardMaterial({ map: T.water(), roughness: 0.1, metalness: 0.2, transparent: true, opacity: 0.85 })); water.position.set(fx, 0, fz); scene.add(water);
  const col = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.4, 2.4, 14).translate(0, 1.2, 0), stone); col.position.set(fx, 0.5, fz); col.castShadow = true; scene.add(col);
  colliders.push({ k: 'circle', x: fx, z: fz, r: 2.55 });
  // étals, terrasses, lampadaires, arbres
  for (const [x, z] of [[-20, -14], [-16.2, -14], [-12.4, -14], [-8.6, -14], [-17, -8.2], [-12, -8.2]]) stall(scene, colliders, { x, z, c1: ['#c4452f', '#2f6aa8', '#3f8a4f'][Math.abs(x | 0) % 3] });
  for (const [x, z] of [[17.5, 12.8], [20, 12.8], [22.5, 12.8], [25, 12.8]]) cafeSet(scene, colliders, { x, z, yaw: x * 0.7 });
  lamps(scene, colliders, [{ x: -12, z: -4, rot: 0 }, { x: 14, z: -10, rot: Math.PI }, { x: -12, z: 12, rot: 0 }, { x: 8, z: 8, rot: Math.PI }]);
  const trees = [[-22, 17], [-22, -19], [21, -17], [3, -19]].map(([x, z]) => ({ x, z, s: 0.8 }));
  scatter(scene, oakGeos(2), oakMats(), trees, { seed: 4 }); for (const t of trees) colliders.push({ k: 'circle', x: t.x, z: t.z, r: 0.4 });
  // rangée de places face aux maisons du sud
  ctx.bays({ x: 6, z: 19.5, yaw: 0, count: 9, pitch: 2.6, depth: 5, avoid: [[sp.x, sp.z]], fill: 0.9, types: ['hatchback', 'compact', 'sedan', 'wagon', 'sport'] });
  const ring = []; for (let i = 0; i < 10; i++) { const a = -i / 10 * Math.PI * 2; ring.push([fx + Math.cos(a) * 7.6, fz + Math.sin(a) * 7.6]); }
  return ctx.finish({
    cars: [{ type: 'sedan', closed: true, path: ring, speed: 2.8, start: 0.2, color: 0xb8352a }],
    peds: [{ path: [[-22, -10.8], [-6, -10.8]], speed: 1.0, start: 0.2 }, { path: [[-24, -4], [-12, -4]], speed: 1.1, start: 0.6 }, { path: [[8, 10.2], [24, 10.2]], speed: 1.2, start: 0.5 }, { path: [[2, 6], [2, -7]], speed: 1.0, start: 0.1 }, { path: [[14, -6], [24, -6]], speed: 1.1, start: 0.7 }],
  });
}
